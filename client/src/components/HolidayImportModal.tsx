import React, { useState } from "react";
import { api } from "../services/api";
import { X, Upload, CheckCircle2, AlertCircle, FileText, Sparkles } from "lucide-react";

interface HolidayImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const HolidayImportModal: React.FC<HolidayImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [holidaysToPreview, setHolidaysToPreview] = useState<Array<{ name: string; date: string; type: string; notes?: string }>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ imported: number; skipped: number } | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    setError(null);
    setSuccessInfo(null);
    try {
      const text = await file.text();
      parseAndSetHolidays(text);
    } catch (err: any) {
      setError("Failed to read JSON file. Please verify JSON format.");
    }
  };

  const loadExampleData = () => {
    setError(null);
    setSuccessInfo(null);
    const example = [
      {
        name: "Gandhi Jayanti",
        date: "2026-10-02",
        type: "PUBLIC_HOLIDAY",
        notes: "Company-wide national holiday"
      },
      {
        name: "Kannada Rajyotsava",
        date: "2026-11-01",
        type: "PUBLIC_HOLIDAY",
        notes: "State holiday; confirm office calendar"
      },
      {
        name: "Christmas Day",
        date: "2026-12-25",
        type: "COMPANY_GRANTED_LEAVE",
        notes: "Office closed for festive season"
      },
      {
        name: "Year-end Shutdown",
        date: "2026-12-31",
        type: "COMPANY_GRANTED_LEAVE",
        notes: "Company-wide annual recharge day"
      }
    ];
    setHolidaysToPreview(example);
  };

  const parseAndSetHolidays = (jsonText: string) => {
    try {
      const data = JSON.parse(jsonText);
      const items = Array.isArray(data) ? data : data.holidays;
      if (!Array.isArray(items)) {
        throw new Error("JSON must be an array of holiday objects or contain a 'holidays' array.");
      }

      const valid = items
        .filter(item => item && typeof item.name === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item.date))
        .map(item => ({
          name: item.name.trim(),
          date: item.date,
          type: item.type || "PUBLIC_HOLIDAY",
          notes: item.notes || ""
        }));

      if (valid.length === 0) {
        throw new Error("No valid holiday items found. Each item requires 'name' and 'date' in YYYY-MM-DD format.");
      }

      setHolidaysToPreview(valid);
    } catch (e: any) {
      setError(e.message || "Invalid JSON syntax.");
      setHolidaysToPreview([]);
    }
  };

  const handleImportToDatabase = async () => {
    if (holidaysToPreview.length === 0) return;

    try {
      setLoading(true);
      setError(null);
      const res = await api.admin.importCompanyHolidays(holidaysToPreview);
      setSuccessInfo({ imported: res.imported, skipped: res.skipped });
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Import failed on server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: "720px", padding: "30px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-main)" }}>
              Import Company Holidays
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
              Upload JSON holiday calendar and publish to database
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ width: "36px", height: "36px", padding: 0, borderRadius: "50%" }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "var(--badge-rejected-bg)",
              color: "var(--badge-rejected-color)",
              border: "1px solid var(--badge-rejected-border)",
              borderRadius: "10px",
              fontSize: "13px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successInfo && (
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "var(--badge-approved-bg)",
              color: "var(--badge-approved-color)",
              border: "1px solid var(--badge-approved-border)",
              borderRadius: "10px",
              fontSize: "13px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <CheckCircle2 size={16} />
            <span>
              Successfully saved to database! <strong>{successInfo.imported}</strong> new records imported,{" "}
              <strong>{successInfo.skipped}</strong> existing records updated.
            </span>
          </div>
        )}

        {/* Upload Zone */}
        <div
          style={{
            border: "2px dashed var(--border)",
            borderRadius: "12px",
            padding: "24px",
            textAlign: "center",
            backgroundColor: "var(--surface-subtle)",
            marginBottom: "20px"
          }}
        >
          <Upload size={32} color="var(--primary)" style={{ marginBottom: "8px" }} />
          <h4 style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-main)", marginBottom: "4px" }}>
            Choose a holiday JSON file
          </h4>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>
            Supports JSON files containing an array of holidays or a <code>holidays</code> property
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
            <label className="btn btn-primary btn-sm" style={{ cursor: "pointer" }}>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
              Select JSON File
            </label>
            <button
              type="button"
              onClick={loadExampleData}
              className="btn btn-secondary btn-sm"
              style={{ gap: "6px" }}
            >
              <Sparkles size={14} color="var(--primary)" />
              <span>Load docs/company-holidays.example.json</span>
            </button>
          </div>
        </div>

        {/* Preview Table */}
        {holidaysToPreview.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-main)" }}>
                Parsed Preview ({holidaysToPreview.length} holidays detected)
              </span>
              <span style={{ fontSize: "12px", color: "var(--badge-approved-color)", fontWeight: "600" }}>
                ✓ Valid schema
              </span>
            </div>

            <div className="table-container" style={{ maxHeight: "250px", overflowY: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>Holiday Name</th>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {holidaysToPreview.map((h, i) => (
                    <tr key={i}>
                      <td>
                        <strong>{h.name}</strong>
                      </td>
                      <td style={{ fontSize: "13px" }}>{h.date}</td>
                      <td>
                        <span style={{ fontSize: "11px", fontWeight: "600", padding: "3px 8px", borderRadius: "999px", backgroundColor: "var(--primary-light)", color: "var(--primary)" }}>
                          {h.type}
                        </span>
                      </td>
                      <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>{h.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
          <button onClick={onClose} className="btn btn-secondary">
            {successInfo ? "Done" : "Cancel"}
          </button>
          {holidaysToPreview.length > 0 && !successInfo && (
            <button
              onClick={handleImportToDatabase}
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Saving to Database..." : "Publish & Save to Database"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
