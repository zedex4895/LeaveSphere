import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { CompanyHoliday } from "../types";
import { HolidayImportModal } from "../components/HolidayImportModal";
import { CalendarDays, Upload, Sparkles, Calendar, Tag } from "lucide-react";

interface CompanyHolidaysProps {
  holidays: CompanyHoliday[];
  onRefresh: () => void;
}

export const CompanyHolidays: React.FC<CompanyHolidaysProps> = ({
  holidays,
  onRefresh
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<string>("ALL");

  const filtered = holidays.filter(h => {
    if (filterType !== "ALL" && h.type !== filterType) return false;
    return true;
  });

  const getCategoryBadge = (type: string) => {
    switch (type) {
      case "PUBLIC_HOLIDAY":
        return {
          label: "Public Holiday",
          bg: "var(--primary-light)",
          color: "var(--primary)"
        };
      case "COMPANY_GRANTED_LEAVE":
        return {
          label: "Company Granted Leave",
          bg: "var(--stat-sick-bg)",
          color: "var(--stat-sick-color)"
        };
      case "OPTIONAL_HOLIDAY":
        return {
          label: "Optional Holiday",
          bg: "var(--stat-personal-bg)",
          color: "var(--stat-personal-color)"
        };
      default:
        return {
          label: type,
          bg: "var(--surface-subtle)",
          color: "var(--text-muted)"
        };
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: "700", color: "var(--text-main)" }}>
            Company Holidays & Granted Leave
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Official organization non-working days and declared holiday calendar for planning leave
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="btn btn-primary"
            style={{ gap: "6px" }}
          >
            <Upload size={16} />
            <span>Import Holidays (JSON)</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div
        className="card"
        style={{
          padding: "14px 20px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap"
        }}
      >
        <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "500" }}>Category:</span>
        <button
          onClick={() => setFilterType("ALL")}
          className={`btn btn-sm ${filterType === "ALL" ? "btn-primary" : "btn-secondary"}`}
          style={{ borderRadius: "999px" }}
        >
          All Holidays
        </button>
        <button
          onClick={() => setFilterType("PUBLIC_HOLIDAY")}
          className={`btn btn-sm ${filterType === "PUBLIC_HOLIDAY" ? "btn-primary" : "btn-secondary"}`}
          style={{ borderRadius: "999px" }}
        >
          Public Holidays
        </button>
        <button
          onClick={() => setFilterType("COMPANY_GRANTED_LEAVE")}
          className={`btn btn-sm ${filterType === "COMPANY_GRANTED_LEAVE" ? "btn-primary" : "btn-secondary"}`}
          style={{ borderRadius: "999px" }}
        >
          Company Granted
        </button>
      </div>

      {/* Holiday Table Card */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--text-muted)" }}>
            <CalendarDays size={36} color="var(--text-light)" style={{ marginBottom: "12px" }} />
            <h4 style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-main)", marginBottom: "4px" }}>
              No holidays published yet
            </h4>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              {isAdmin ? "Click 'Import Holidays (JSON)' above to publish holidays from JSON." : "Check back later when management publishes the calendar."}
            </p>
          </div>
        ) : (
          <div className="table-container" style={{ border: "none" }}>
            <table>
              <thead>
                <tr>
                  <th>Holiday Name</th>
                  <th>Date</th>
                  <th>Day of Week</th>
                  <th>Category</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(h => {
                  const badge = getCategoryBadge(h.type);
                  const dateObj = new Date(h.date);
                  const dayName = isNaN(dateObj.getTime())
                    ? ""
                    : dateObj.toLocaleDateString("en-US", { weekday: "long" });

                  return (
                    <tr key={h.id}>
                      <td>
                        <strong style={{ color: "var(--text-main)", fontSize: "14px" }}>
                          {h.name}
                        </strong>
                      </td>
                      <td style={{ fontSize: "13px", fontWeight: "500" }}>
                        {h.date}
                      </td>
                      <td style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                        {dayName}
                      </td>
                      <td>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 10px",
                            borderRadius: "999px",
                            fontSize: "11px",
                            fontWeight: "700",
                            letterSpacing: "0.02em",
                            backgroundColor: badge.bg,
                            color: badge.color
                          }}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                        {h.notes || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* JSON Import Modal */}
      <HolidayImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          setIsImportModalOpen(false);
          onRefresh();
        }}
      />
    </div>
  );
};
