import { dataService } from "../services/dataService.js";
import { calculateBusinessDays } from "../utils/dateUtils.js";

const VALID_LEAVE_TYPES = ["ANNUAL", "SICK", "PERSONAL", "UNPAID"];

export async function getBalance(req, res, next) {
  try {
    let targetEmployeeId = req.user.id;
    if (req.user.role === "ADMIN" && req.query.employeeId) {
      targetEmployeeId = req.query.employeeId;
    }

    const balances = await dataService.getEmployeeBalances(targetEmployeeId);
    res.json({ balances });
  } catch (err) {
    next(err);
  }
}

export async function createLeaveRequest(req, res, next) {
  try {
    const { leaveType, startDate, endDate, reason, handoverNotes } = req.body;
    const employeeId = req.user.id;

    const details = [];
    if (!leaveType || !VALID_LEAVE_TYPES.includes(leaveType)) {
      details.push({ field: "leaveType", message: `Must be one of: ${VALID_LEAVE_TYPES.join(", ")}` });
    }
    if (!startDate || !/^\d{4}-\d{2}-\d{2}/.test(startDate)) {
      details.push({ field: "startDate", message: "A valid start date (YYYY-MM-DD) is required." });
    }
    if (!endDate || !/^\d{4}-\d{2}-\d{2}/.test(endDate)) {
      details.push({ field: "endDate", message: "A valid end date (YYYY-MM-DD) is required." });
    }
    if (!reason || !reason.trim()) {
      details.push({ field: "reason", message: "Reason for leave is required." });
    }

    if (details.length > 0) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Please correct the highlighted fields.",
          details
        }
      });
    }

    const sDate = new Date(startDate);
    const eDate = new Date(endDate);

    // Validate: Employees cannot apply for past dates (previous days)
    const now = new Date();
    const earliestAllowed = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - 14 * 60 * 60 * 1000);
    const sDateMidnight = new Date(startDate.slice(0, 10) + "T00:00:00.000Z");

    if (sDateMidnight < earliestAllowed) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Leave start date cannot be in the past. You can only apply for today or future dates.",
          details: [{ field: "startDate", message: "Start date cannot be before today." }]
        }
      });
    }

    // Validate: From and end dates should not be shuffled (start date must be <= end date)
    if (sDate > eDate || startDate.slice(0, 10) > endDate.slice(0, 10)) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "End date must be on or after start date (from and end dates cannot be shuffled).",
          details: [{ field: "endDate", message: "End date must be on or after start date." }]
        }
      });
    }

    // Check for overlapping requests for this employee
    const isOverlapping = await dataService.checkOverlap(employeeId, startDate, endDate);
    if (isOverlapping) {
      return res.status(409).json({
        error: {
          code: "CONFLICT",
          message: "You already have a pending or approved leave request during this date range.",
          details: []
        }
      });
    }

    // Fetch published company holidays to exclude from duration calculation
    const holidays = await dataService.listCompanyHolidays({ from: startDate, to: endDate });
    const holidayDates = holidays.map(h => h.date);
    const requestedDays = calculateBusinessDays(startDate, endDate, holidayDates);

    if (requestedDays <= 0) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "The selected date range contains no working days (all dates fall on weekends or holidays).",
          details: []
        }
      });
    }

    // Check employee balance for the requested leave type
    const balanceRecord = await dataService.getBalanceRecord(employeeId, leaveType);
    if (balanceRecord && leaveType !== "UNPAID") {
      const available = balanceRecord.entitlement - balanceRecord.usedDays - balanceRecord.reservedDays;
      if (requestedDays > available) {
        return res.status(409).json({
          error: {
            code: "INSUFFICIENT_BALANCE",
            message: `Insufficient ${leaveType.toLowerCase()} leave balance. Requested ${requestedDays} days, but only ${available} days available.`,
            details: [{ field: "requestedDays", message: `Available: ${available} days` }]
          }
        });
      }
    }

    // Create the leave request
    const newRequest = await dataService.createLeaveRequest({
      employeeId,
      leaveType,
      startDate: sDate,
      endDate: eDate,
      requestedDays,
      reason: reason.trim(),
      handoverNotes: handoverNotes ? handoverNotes.trim() : "",
      status: "PENDING"
    });

    // Reserve days in the balance ledger
    if (balanceRecord) {
      await dataService.updateBalanceRecord(employeeId, leaveType, {
        reservedDays: (balanceRecord.reservedDays || 0) + requestedDays
      });
    }

    // Audit log
    await dataService.createAuditLog({
      actorId: employeeId,
      action: "LEAVE_SUBMISSION",
      entityType: "LEAVE_REQUEST",
      entityId: newRequest._id,
      metadata: {
        leaveType,
        startDate,
        endDate,
        requestedDays
      }
    });

    // Notify Admins
    try {
      const applicant = await dataService.findUserById(employeeId);
      const applicantName = applicant ? applicant.fullName : "An employee";
      const department = applicant?.department ? ` (${applicant.department})` : "";
      await dataService.createNotification({
        recipientRole: "ADMIN",
        title: "New Leave Application",
        message: `${applicantName}${department} submitted a ${requestedDays}-day ${leaveType} leave request (${startDate.slice(0, 10)} to ${endDate.slice(0, 10)}) awaiting review.`,
        type: "REQUEST_SUBMITTED",
        relatedEntityId: newRequest._id
      });
    } catch (notifErr) {
      console.error("Failed to create admin notification:", notifErr);
    }

    res.status(201).json({
      id: newRequest._id.toString(),
      status: "PENDING",
      leaveType: newRequest.leaveType,
      startDate: startDate.slice(0, 10),
      endDate: endDate.slice(0, 10),
      requestedDays,
      createdAt: newRequest.createdAt
    });
  } catch (err) {
    next(err);
  }
}

export async function getLeaveRequests(req, res, next) {
  try {
    const { status, leaveType, from, to, employeeId, page = 1, limit = 20 } = req.query;

    const query = {
      page: Number(page),
      limit: Number(limit)
    };

    if (req.user.role === "EMPLOYEE") {
      query.employeeId = req.user.id;
    } else if (req.user.role === "ADMIN" && employeeId) {
      query.employeeId = employeeId;
    }

    if (status) query.status = status;
    if (leaveType) query.leaveType = leaveType;
    if (from) query.from = from;
    if (to) query.to = to;

    const result = await dataService.listLeaveRequests(query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getLeaveRequestById(req, res, next) {
  try {
    const { id } = req.params;
    const request = await dataService.getLeaveRequestById(id);

    if (!request) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Leave request not found.",
          details: []
        }
      });
    }

    // Role security: only owner or admin can view
    const ownerId = request.employeeId?._id ? request.employeeId._id.toString() : (request.employeeId?.id || request.employeeId?.toString());
    if (req.user.role !== "ADMIN" && ownerId !== req.user.id) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Leave request not found.",
          details: []
        }
      });
    }

    res.json(request);
  } catch (err) {
    next(err);
  }
}

export async function cancelLeaveRequest(req, res, next) {
  try {
    const { id } = req.params;
    const request = await dataService.getLeaveRequestById(id);

    if (!request) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Leave request not found.",
          details: []
        }
      });
    }

    const ownerId = request.employeeId?._id ? request.employeeId._id.toString() : (request.employeeId?.id || request.employeeId?.toString());
    if (ownerId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "You can only cancel your own leave requests.",
          details: []
        }
      });
    }

    if (request.status !== "PENDING") {
      return res.status(409).json({
        error: {
          code: "CONFLICT",
          message: `Cannot cancel request with status ${request.status}. Only PENDING requests can be cancelled.`,
          details: []
        }
      });
    }

    // Update status to CANCELLED
    const updated = await dataService.updateLeaveRequest(id, {
      status: "CANCELLED"
    });

    // Release reserved days
    const balanceRecord = await dataService.getBalanceRecord(ownerId, request.leaveType);
    if (balanceRecord) {
      const newReserved = Math.max(0, (balanceRecord.reservedDays || 0) - request.requestedDays);
      await dataService.updateBalanceRecord(ownerId, request.leaveType, {
        reservedDays: newReserved
      });
    }

    await dataService.createAuditLog({
      actorId: req.user.id,
      action: "LEAVE_CANCEL",
      entityType: "LEAVE_REQUEST",
      entityId: id,
      metadata: { requestedDays: request.requestedDays, leaveType: request.leaveType }
    });

    // Notify Admins
    try {
      const applicant = await dataService.findUserById(ownerId);
      const applicantName = applicant ? applicant.fullName : "An employee";
      await dataService.createNotification({
        recipientRole: "ADMIN",
        title: "Leave Request Cancelled",
        message: `${applicantName} cancelled their ${request.requestedDays}-day ${request.leaveType} leave request.`,
        type: "REQUEST_CANCELLED",
        relatedEntityId: id
      });
    } catch (notifErr) {
      console.error("Failed to create cancel notification:", notifErr);
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
}
