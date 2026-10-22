import React, { useState } from "react";
import { LeaveRequest } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import { api } from "../services/api";
import { Calendar, Filter, Search, X, AlertTriangle, Eye, Plus } from "lucide-react";

interface EmployeeRequestsProps {
  requests: LeaveRequest[];
  onRefresh: () => void;
  onOpenApplyModal: () => void;
}

export const EmployeeRequests: React.FC<EmployeeRequestsProps> = ({
  requests,
  onRefresh,
  onOpenApplyModal
}) => {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState<boolean>(false);

  const filteredRequests = requests.filter(r => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (typeFilter !== "ALL" && r.leaveType !== typeFilter) return false;
    return true;
  });

  const handleCancel = async (id: string) => {
    try {
      setCancelLoading(true);
      await api.leave.cancelRequest(id);
      setCancellingId(null);
      if (selectedRequest && selectedRequest.id === id) {
        setSelectedRequest(null);
      }
      onRefresh();
    } catch (err: any) {
      alert(err.message || "Failed to cancel request.");
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div>
      {/* Header Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: "700", color: "var(--text-main)" }}>
            My Leave Requests
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            View history, monitor statuses, and manage your time-off applications
          </p>
        </div>
        <button onClick={onOpenApplyModal} className="btn btn-primary">
          <Plus size={16} />
          <span>Apply for leave</span>
        </button>
      </div>

      {/* Filter Chips Bar */}
      <div
        className="card"
        style={{
          padding: "16px 20px",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px"
        }}
      >
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`btn btn-sm ${statusFilter === status ? "btn-primary" : "btn-secondary"}`}
              style={{ borderRadius: "999px", textTransform: "capitalize", padding: "6px 14px" }}
            >
              {status.toLowerCase()}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Type:</span>
          <select
            className="select"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            style={{ width: "auto", padding: "6px 12px", fontSize: "13px" }}
          >
            <option value="ALL">All Types</option>
            <option value="ANNUAL">Annual</option>
            <option value="SICK">Sick</option>
            <option value="PERSONAL">Personal</option>
            <option value="UNPAID">Unpaid</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {filteredRequests.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--text-muted)" }}>
            <Calendar size={36} color="var(--text-light)" style={{ marginBottom: "12px" }} />
            <h4 style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-main)", marginBottom: "4px" }}>
              No requests found
            </h4>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              No leave requests match the selected filters.
            </p>
          </div>
        ) : (
          <div className="table-container" style={{ border: "none" }}>
            <table>
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Duration</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Decision / Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div>
                        <strong style={{ color: "var(--text-main)" }}>{r.leaveType}</strong>
                        <div style={{ fontSize: "11px", color: "var(--text-light)" }}>ID: {r.id.slice(-6)}</div>
                      </div>
                    </td>
                    <td style={{ fontSize: "13px", whiteSpace: "nowrap" }}>
                      {r.startDate} to {r.endDate}
                    </td>
                    <td>
                      <span style={{ fontWeight: "600", color: "var(--primary)" }}>
                        {r.requestedDays} {r.requestedDays === 1 ? "day" : "days"}
                      </span>
                    </td>
                    <td style={{ fontSize: "12px", color: "var(--text-light)" }}>
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "Recent"}
                    </td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                    <td>
                      {r.decisionNote ? (
                        <div style={{ fontSize: "12px", color: "var(--text-main)", maxWidth: "220px" }}>
                          "{r.decisionNote}"
                        </div>
                      ) : (
                        <span style={{ fontSize: "12px", color: "var(--text-light)" }}>
                          {r.status === "PENDING" ? "In review" : "—"}
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          onClick={() => setSelectedRequest(r)}
                          className="btn btn-secondary btn-sm"
                          title="View details"
                        >
                          <Eye size={14} />
                          <span>Details</span>
                        </button>
                        {r.status === "PENDING" && (
                          <button
                            onClick={() => setCancellingId(r.id)}
                            className="btn btn-secondary btn-sm"
                            style={{ color: "var(--badge-rejected-color)" }}
                            title="Cancel request"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Drawer / Modal */}
      {selectedRequest && (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-main)" }}>
                  Leave Request Details
                </h3>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Request ID: {selectedRequest.id}</span>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="btn btn-secondary"
                style={{ width: "32px", height: "32px", padding: 0, borderRadius: "50%" }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-muted)" }}>Status</span>
                <StatusBadge status={selectedRequest.status} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-muted)" }}>Leave Type</span>
                <strong>{selectedRequest.leaveType} Leave</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-muted)" }}>Date Range</span>
                <strong>{selectedRequest.startDate} to {selectedRequest.endDate}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-muted)" }}>Duration</span>
                <strong style={{ color: "var(--primary)" }}>{selectedRequest.requestedDays} working days</strong>
              </div>

              <div>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>Reason</span>
                <div style={{ padding: "10px 14px", backgroundColor: "var(--surface-subtle)", borderRadius: "8px", marginTop: "4px" }}>
                  {selectedRequest.reason}
                </div>
              </div>

              {selectedRequest.handoverNotes && (
                <div>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>Handover Notes</span>
                  <div style={{ padding: "10px 14px", backgroundColor: "var(--surface-subtle)", borderRadius: "8px", marginTop: "4px" }}>
                    {selectedRequest.handoverNotes}
                  </div>
                </div>
              )}

              {selectedRequest.decisionNote && (
                <div>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>Manager Decision Note</span>
                  <div style={{ padding: "10px 14px", backgroundColor: "var(--surface-subtle)", borderRadius: "8px", marginTop: "4px" }}>
                    "{selectedRequest.decisionNote}"
                    {selectedRequest.reviewer?.name && (
                      <div style={{ fontSize: "12px", color: "var(--text-light)", marginTop: "4px" }}>
                        Reviewed by {selectedRequest.reviewer.name}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
              {selectedRequest.status === "PENDING" && (
                <button
                  onClick={() => {
                    setCancellingId(selectedRequest.id);
                  }}
                  className="btn btn-danger"
                >
                  Cancel Request
                </button>
              )}
              <button onClick={() => setSelectedRequest(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      {cancellingId && (
        <div className="modal-overlay" onClick={() => setCancellingId(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: "26px", maxWidth: "420px" }}>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "var(--badge-rejected-bg)",
                  color: "var(--badge-rejected-color)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "12px"
                }}
              >
                <AlertTriangle size={24} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-main)" }}>
                Cancel Leave Request?
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "6px" }}>
                Are you sure you want to cancel this pending request? The reserved days will immediately be returned to your available balance.
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
              <button onClick={() => setCancellingId(null)} className="btn btn-secondary" disabled={cancelLoading}>
                Keep Request
              </button>
              <button onClick={() => handleCancel(cancellingId)} className="btn btn-danger" disabled={cancelLoading}>
                {cancelLoading ? "Cancelling..." : "Yes, Cancel Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
