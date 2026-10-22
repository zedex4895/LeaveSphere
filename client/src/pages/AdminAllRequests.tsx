import React, { useState } from "react";
import { LeaveRequest } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import { ReviewLeaveModal } from "../components/ReviewLeaveModal";
import { Search, Filter, ShieldCheck, Eye, Calendar } from "lucide-react";

interface AdminAllRequestsProps {
  requests: LeaveRequest[];
  onRefresh: () => void;
}

export const AdminAllRequests: React.FC<AdminAllRequestsProps> = ({
  requests,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);

  const filtered = requests.filter(r => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (typeFilter !== "ALL" && r.leaveType !== typeFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const name = (r.employee?.name || "").toLowerCase();
      const email = (r.employee?.email || "").toLowerCase();
      const reason = (r.reason || "").toLowerCase();
      if (!name.includes(q) && !email.includes(q) && !reason.includes(q)) return false;
    }
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "700", color: "var(--text-main)" }}>
          All Company Leave Requests
        </h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          Search, filter, and inspect leave requests across all departments
        </p>
      </div>

      {/* Filter and Search Bar */}
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
        {/* Search Input */}
        <div style={{ position: "relative", minWidth: "260px" }}>
          <input
            type="text"
            className="input"
            style={{ paddingLeft: "36px", paddingRight: "14px", height: "38px" }}
            placeholder="Search employee, reason..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <Search
            size={16}
            color="var(--text-light)"
            style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
          />
        </div>

        {/* Status Chips */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`btn btn-sm ${statusFilter === s ? "btn-primary" : "btn-secondary"}`}
              style={{ borderRadius: "999px", textTransform: "capitalize", padding: "5px 12px", fontSize: "12px" }}
            >
              {s.toLowerCase()}
            </button>
          ))}
        </div>

        {/* Type Select */}
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
        {filtered.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--text-muted)" }}>
            <Calendar size={36} color="var(--text-light)" style={{ marginBottom: "12px" }} />
            <h4 style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-main)", marginBottom: "4px" }}>
              No requests found
            </h4>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Try adjusting your search query or filter settings.
            </p>
          </div>
        ) : (
          <div className="table-container" style={{ border: "none" }}>
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Reviewer / Note</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div>
                        <strong style={{ color: "var(--text-main)" }}>{r.employee?.name || "Employee"}</strong>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          {r.employee?.department || "Department"}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-main)" }}>
                        {r.leaveType}
                      </span>
                    </td>
                    <td style={{ fontSize: "13px", whiteSpace: "nowrap" }}>
                      {r.startDate} to {r.endDate}
                    </td>
                    <td>
                      <span style={{ fontWeight: "700", color: "var(--primary)" }}>
                        {r.requestedDays} {r.requestedDays === 1 ? "day" : "days"}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                    <td>
                      {r.decisionNote ? (
                        <div style={{ fontSize: "12px", color: "var(--text-main)", maxWidth: "220px" }}>
                          "{r.decisionNote}"
                          {r.reviewer?.name && (
                            <div style={{ fontSize: "11px", color: "var(--text-light)" }}>By {r.reviewer.name}</div>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: "12px", color: "var(--text-light)" }}>
                          {r.status === "PENDING" ? "Awaiting review" : "—"}
                        </span>
                      )}
                    </td>
                    <td>
                      {r.status === "PENDING" ? (
                        <button
                          onClick={() => setSelectedRequest(r)}
                          className="btn btn-primary btn-sm"
                          style={{ gap: "4px" }}
                        >
                          <ShieldCheck size={14} />
                          <span>Review</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedRequest(r)}
                          className="btn btn-secondary btn-sm"
                          style={{ gap: "4px" }}
                        >
                          <Eye size={14} />
                          <span>Details</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review / Details Modal */}
      <ReviewLeaveModal
        request={selectedRequest}
        isOpen={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
        onSuccess={() => {
          setSelectedRequest(null);
          onRefresh();
        }}
      />
    </div>
  );
};
