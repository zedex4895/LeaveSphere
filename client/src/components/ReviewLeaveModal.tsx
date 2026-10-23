import React, { useState } from "react";
import { api } from "../services/api";
import { LeaveRequest } from "../types";
import { X, CheckCircle, XCircle, AlertCircle, User, Calendar, FileText } from "lucide-react";
import { useEscape } from "../hooks/useEscape";

interface ReviewLeaveModalProps {
  request: LeaveRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReviewLeaveModal: React.FC<ReviewLeaveModalProps> = ({
  request,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [decisionNote, setDecisionNote] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  useEscape(isOpen, onClose);

  if (!isOpen || !request) return null;

  const handleDecision = async (decision: "APPROVED" | "REJECTED") => {
    setError(null);
    if (decision === "REJECTED" && !decisionNote.trim()) {
      setError("Please provide a decision note explaining the reason for rejection.");
      return;
    }

    try {
      setLoading(true);
      await api.admin.decideRequest(request.id, decision, decisionNote.trim());
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || `Failed to ${decision.toLowerCase()} request.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content admin-review-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="admin-review-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-main)" }}>
              Review leave request
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
              Approve or reject employee leave application
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            aria-label="Close leave request review"
            style={{ width: "40px", height: "40px", padding: 0, borderRadius: "50%", flexShrink: 0 }}
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
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "18px"
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Employee Summary Card */}
        <div
          style={{
            backgroundColor: "var(--surface-subtle)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            padding: "16px 20px",
            marginBottom: "20px"
          }}
        >
          <div className="admin-review-employee" style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "var(--primary-light)",
                color: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "700",
                fontSize: "16px"
              }}
            >
              {request.employee?.name ? request.employee.name.charAt(0) : "E"}
            </div>
            <div className="admin-review-employee-details">
              <div style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-main)" }}>
                {request.employee?.name || "Employee"}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                {request.employee?.department || "Department"} &nbsp;•&nbsp; {request.employee?.email}
              </div>
            </div>
          </div>

          <div className="admin-review-request-details">
            <div>
              <span style={{ color: "var(--text-light)" }}>Leave Category:</span>{" "}
              <strong style={{ color: "var(--text-main)" }}>{request.leaveType} Leave</strong>
            </div>
            <div>
              <span style={{ color: "var(--text-light)" }}>Duration:</span>{" "}
              <strong style={{ color: "var(--primary)" }}>{request.requestedDays} working days</strong>
            </div>
            <div className="admin-review-dates">
              <span style={{ color: "var(--text-light)" }}>Dates:</span>{" "}
              <strong style={{ color: "var(--text-main)" }}>
                {request.startDate} &nbsp;to&nbsp; {request.endDate}
              </strong>
            </div>
          </div>
        </div>

        {/* Request Reason & Handover */}
        <div style={{ marginBottom: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Reason for request
            </span>
            <div
              className="admin-review-note"
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "12px 14px",
                fontSize: "13px",
                color: "var(--text-main)",
                marginTop: "4px"
              }}
            >
              {request.reason}
            </div>
          </div>

          {request.handoverNotes && (
            <div>
              <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>
                Handover & Coverage Notes
              </span>
              <div
                className="admin-review-note"
                style={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  fontSize: "13px",
                  color: "var(--text-main)",
                  marginTop: "4px"
                }}
              >
                {request.handoverNotes}
              </div>
            </div>
          )}
        </div>

        {/* Decision Note Field */}
        <div className="form-group" style={{ marginBottom: "24px" }}>
          <label className="label">
            Decision Note & Comments {request.status === "PENDING" && <span style={{ color: "var(--text-light)" }}>(Required for rejection)</span>}
          </label>
          <textarea
            className="textarea"
            rows={2}
            placeholder="e.g. Approved. Handover confirmed with team lead."
            value={decisionNote}
            onChange={e => setDecisionNote(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="admin-review-actions">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleDecision("REJECTED")}
            className="btn btn-danger"
            disabled={loading}
          >
            <XCircle size={16} />
            <span>Reject Request</span>
          </button>
          <button
            type="button"
            onClick={() => handleDecision("APPROVED")}
            className="btn btn-primary"
            style={{ backgroundColor: "var(--badge-approved-color)" }}
            disabled={loading}
          >
            <CheckCircle size={16} />
            <span>Approve Request</span>
          </button>
        </div>
      </div>
    </div>
  );
};
