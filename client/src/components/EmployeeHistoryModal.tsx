import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { LeaveRequest } from "../types";
import { StatusBadge } from "./StatusBadge";
import { X, Calendar, User, Clock, AlertCircle } from "lucide-react";

interface EmployeeHistoryModalProps {
  employeeId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EmployeeHistoryModal: React.FC<EmployeeHistoryModalProps> = ({
  employeeId,
  isOpen,
  onClose
}) => {
  const [employee, setEmployee] = useState<{ id: string; name: string; department?: string } | null>(null);
  const [items, setItems] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !employeeId) return;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.admin.getEmployeeLeaveHistory(employeeId);
        setEmployee(res.employee);
        setItems(res.items);
      } catch (err: any) {
        setError(err.message || "Failed to load employee leave history.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [isOpen, employeeId]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: "800px", padding: "30px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-main)" }}>
              Employee Leave History
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
              {employee ? `${employee.name} (${employee.department || "General"})` : "Loading employee details..."}
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

        {loading ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
            Loading history records...
          </div>
        ) : items.length === 0 ? (
          <div
            style={{
              padding: "48px 20px",
              textAlign: "center",
              backgroundColor: "var(--surface-subtle)",
              borderRadius: "12px",
              border: "1px dashed var(--border)"
            }}
          >
            <Calendar size={32} color="var(--text-light)" style={{ marginBottom: "10px" }} />
            <h4 style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-main)", marginBottom: "4px" }}>
              No Leave Records Found
            </h4>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              This employee has not submitted any leave applications yet.
            </p>
          </div>
        ) : (
          <div className="table-container" style={{ maxHeight: "400px", overflowY: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Reviewer & Notes</th>
                </tr>
              </thead>
              <tbody>
                {items.map(req => (
                  <tr key={req.id}>
                    <td>
                      <strong style={{ color: "var(--text-main)" }}>{req.leaveType}</strong>
                    </td>
                    <td style={{ fontSize: "13px", whiteSpace: "nowrap" }}>
                      {req.startDate} to {req.endDate}
                    </td>
                    <td>
                      <span style={{ fontWeight: "600", color: "var(--primary)" }}>
                        {req.requestedDays} {req.requestedDays === 1 ? "day" : "days"}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={req.status} />
                    </td>
                    <td>
                      {req.decisionNote ? (
                        <div style={{ fontSize: "12px" }}>
                          <span style={{ color: "var(--text-main)", fontWeight: "500" }}>"{req.decisionNote}"</span>
                          {req.reviewer?.name && (
                            <div style={{ color: "var(--text-light)", marginTop: "2px" }}>
                              By {req.reviewer.name}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: "var(--text-light)", fontSize: "12px" }}>Awaiting review</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
