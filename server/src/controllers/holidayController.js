import { dataService } from "../services/dataService.js";

function normalizeHolidayType(typeStr) {
  if (!typeStr) return "PUBLIC_HOLIDAY";
  const upper = typeStr.trim().toUpperCase().replace(/\s+/g, "_");
  if (upper === "PUBLIC_HOLIDAY" || upper.includes("PUBLIC")) return "PUBLIC_HOLIDAY";
  if (upper === "COMPANY_GRANTED_LEAVE" || upper.includes("GRANTED") || upper.includes("COMPANY")) return "COMPANY_GRANTED_LEAVE";
  if (upper === "OPTIONAL_HOLIDAY" || upper.includes("OPTIONAL")) return "OPTIONAL_HOLIDAY";
  return "PUBLIC_HOLIDAY";
}

export async function getCompanyHolidays(req, res, next) {
  try {
    const { from, to } = req.query;
    const holidays = await dataService.listCompanyHolidays({ from, to });
    const formatted = holidays.map(h => ({
      id: h._id ? h._id.toString() : h.id,
      name: h.name,
      date: h.date instanceof Date ? h.date.toISOString().slice(0, 10) : String(h.date).slice(0, 10),
      type: h.type,
      notes: h.notes,
      isPublished: h.isPublished
    }));
    res.json({ holidays: formatted });
  } catch (err) {
    next(err);
  }
}

export async function importCompanyHolidays(req, res, next) {
  try {
    let holidays = req.body;
    if (holidays && holidays.holidays && Array.isArray(holidays.holidays)) {
      holidays = holidays.holidays;
    }

    if (!Array.isArray(holidays) || holidays.length === 0) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Request body must contain a non-empty 'holidays' array.",
          details: [{ field: "holidays", message: "Array expected." }]
        }
      });
    }

    const errors = [];
    const validHolidays = [];

    holidays.forEach((item, index) => {
      if (!item || typeof item !== "object") {
        errors.push({ row: index, error: "Invalid item object" });
        return;
      }
      if (!item.name || typeof item.name !== "string" || !item.name.trim()) {
        errors.push({ row: index, error: "Holiday 'name' is required." });
        return;
      }
      if (!item.date || !/^\d{4}-\d{2}-\d{2}$/.test(item.date)) {
        errors.push({ row: index, error: "Holiday 'date' must be in YYYY-MM-DD format." });
        return;
      }

      validHolidays.push({
        name: item.name.trim(),
        date: item.date,
        type: normalizeHolidayType(item.type),
        notes: item.notes ? item.notes.trim() : ""
      });
    });

    if (validHolidays.length === 0) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "No valid holiday records found in the payload.",
          details: errors
        }
      });
    }

    const result = await dataService.importCompanyHolidays(validHolidays, req.user.id);

    // Audit log
    await dataService.createAuditLog({
      actorId: req.user.id,
      action: "HOLIDAY_IMPORT",
      entityType: "COMPANY_HOLIDAY",
      entityId: req.user.id,
      metadata: {
        importedCount: result.imported,
        skippedCount: result.skipped,
        totalSubmitted: holidays.length
      }
    });

    if (result.imported > 0) {
      try {
        await dataService.createNotification({
          recipientRole: "ALL",
          title: "Company Holiday Calendar Updated",
          message: `${result.imported} new company holiday(s) published. Review Company Holidays to plan your time off.`,
          type: "HOLIDAY_PUBLISHED"
        });
      } catch (notifErr) {
        console.error("Failed to create holiday notification:", notifErr);
      }
    }

    res.json({
      imported: result.imported,
      skipped: result.skipped,
      errors: [...errors, ...result.errors]
    });
  } catch (err) {
    next(err);
  }
}
