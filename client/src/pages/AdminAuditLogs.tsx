import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { AuditLogItem } from "../types";
import { ShieldCheck, Clock, User, CheckCircle2, XCircle, Upload, Calendar } from "lucide-react";

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await api.admin.getAuditLogs();
        setLogs(res.logs);
      } catch (err) {
        console.error("Failed to load audit logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const getActionBadge = (action: string) => {
    switch (action) {
      case "LEAVE_APPROVAL":
        return { label: "Approval", color: "var(--badge-approved-color)", bg: "var(--badge-approved-bg)" };
      case "LEAVE_REJECTION":
        return { label: "Rejection", color: "var(--badge-rejected-color)", bg: "var(--badge-rejected-bg)" };
      case "HOLIDAY_IMPORT":
        return { label: "Holiday Import", color: "var(--primary)", bg: "var(--primary-light)" };
      case "LEAVE_SUBMISSION":
        return { label: "Submission", color: "var(--stat-personal-color)", bg: "var(--stat-personal-bg)" };
      case "LEAVE_CANCEL":
        return { label: "Cancellation", color: "var(--badge-cancelled-color)", bg: "var(--badge-cancelled-bg)" };
      default:
        return { label: action, color: "var(--text-muted)", bg: "var(--surface-subtle)" };
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "700", color: "var(--text-main)" }}>
          Administrative Audit Trail
        </h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          Immutable record of leave decisions, balance adjustments, and holiday calendar updates
        </p>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "50px 0", textAlign: "center", color: "var(--text-muted)" }}>
            Loading audit records...
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: "50px 0", textAlign: "center", color: "var(--text-muted)" }}>
            No audit records logged yet.
          </div>
        ) : (
          <div className="table-container" style={{ border: "none" }}>
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Actor</th>
                  <th>Entity</th>
                  <th>Details & Metadata</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => {
                  const badge = getActionBadge(log.action);
                  const dateStr = log.createdAt ? new Date(log.createdAt).toLocaleString() : "Just now";

                  return (
                    <tr key={log.id}>
                      <td style={{ fontSize: "12px", color: "var(--text-light)", whiteSpace: "nowrap" }}>
                        {dateStr}
                      </td>
                      <td>
                        <span
                          style={{
                            padding: "3px 10px",
                            borderRadius: "999px",
                            fontSize: "11px",
                            fontWeight: "700",
                            backgroundColor: badge.bg,
                            color: badge.color
                          }}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td>
                        <div>
                          <strong style={{ color: "var(--text-main)", fontSize: "13px" }}>
                            {log.actorId?.fullName || "System Admin"}
                          </strong>
                          {log.actorId?.email && (
                            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                              {log.actorId.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        <code>{log.entityType}</code>
                      </td>
                      <td>
                        <div style={{ fontSize: "12px", color: "var(--text-main)", maxWidth: "340px" }}>
                          {log.metadata?.decisionNote && (
                            <div>Note: <em>"{log.metadata.decisionNote}"</em></div>
                          )}
                          {log.metadata?.leaveType && (
                            <div>Type: {log.metadata.leaveType} ({log.metadata.requestedDays || log.metadata.days}d)</div>
                          )}
                          {log.metadata?.importedCount !== undefined && (
                            <div>Imported: {log.metadata.importedCount} holidays</div>
                          )}
                          {log.metadata?.employeeName && (
                            <div>Employee: {log.metadata.employeeName}</div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
