import React, { useState } from "react";
import { DashboardMetrics, LeaveRequest } from "../types";
import { StatCard } from "../components/StatCard";
import { StatusBadge } from "../components/StatusBadge";
import { ReviewLeaveModal } from "../components/ReviewLeaveModal";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  ArrowRight,
  ShieldCheck,
  Calendar,
  AlertCircle
} from "lucide-react";

interface AdminDashboardProps {
  metrics: DashboardMetrics;
  pendingRequests: LeaveRequest[];
  onRefresh: () => void;
  onNavigate: (page: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  metrics,
  pendingRequests,
  onRefresh,
  onNavigate
}) => {
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);

  return (
    <div>
      {/* Top Welcome */}
      <div style={{ marginBottom: "26px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "12px", padding: "2px 8px", borderRadius: "999px", backgroundColor: "var(--badge-pending-bg)", color: "var(--badge-pending-color)", fontWeight: "700" }}>
            ADMIN PORTAL
          </span>
          <span style={{ fontSize: "13px", color: "var(--text-light)" }}>Central HR & Leave Operations</span>
        </div>
        <h2 style={{ fontSize: "24px", fontWeight: "800", color: "var(--text-main)", letterSpacing: "-0.02em", marginTop: "4px" }}>
          Administrator Dashboard
        </h2>
      </div>

      {/* 4 KPI Metrics */}
      <div className="kpi-grid">
        <StatCard
          title="Pending approvals"
          value={metrics.pendingApprovals}
          unit="requests"
          hint="Require immediate action"
          icon={Clock}
          variant="personal"
        />
        <StatCard
          title="Approved this month"
          value={metrics.approvedThisMonth}
          unit="approved"
          hint="Confirmed time-off"
          icon={CheckCircle2}
          variant="sick"
        />
        <StatCard
          title="Rejected this month"
          value={metrics.rejectedThisMonth}
          unit="rejected"
          hint="With manager comments"
          icon={XCircle}
          variant="taken"
        />
        <StatCard
          title="Employees on leave today"
          value={metrics.employeesOnLeaveToday}
          unit="out of office"
          hint="Active away schedule"
          icon={Users}
          variant="annual"
        />
      </div>

      {/* Pending Approvals Queue Card */}
      <div className="card" style={{ padding: "26px", marginBottom: "28px" }}>
        <div className="page-header" style={{ marginBottom: "20px" }}>
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-main)" }}>
              Pending approvals queue
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Review applications, verify handover plans, and make timely approval decisions
            </p>
          </div>
          <button
            onClick={() => onNavigate("admin-requests")}
            className="btn btn-outline-primary btn-sm"
          >
            <span>All requests</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {pendingRequests.length === 0 ? (
          <div
            style={{
              padding: "48px 20px",
              textAlign: "center",
              backgroundColor: "var(--surface-subtle)",
              borderRadius: "12px",
              border: "1px dashed var(--border)"
            }}
          >
            <CheckCircle2 size={36} color="var(--badge-approved-color)" style={{ marginBottom: "10px" }} />
            <h4 style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-main)", marginBottom: "4px" }}>
              Queue is clear!
            </h4>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              All employee leave applications have been reviewed.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table-stack">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map(r => (
                  <tr key={r.id}>
                    <td data-label="Employee">
                      <div>
                        <strong style={{ color: "var(--text-main)" }}>{r.employee?.name || "Employee"}</strong>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          {r.employee?.department || "General"}
                        </div>
                      </div>
                    </td>
                    <td data-label="Leave Type">
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-main)" }}>
                        {r.leaveType}
                      </span>
                    </td>
                    <td data-label="Dates" style={{ fontSize: "13px" }}>
                      {r.startDate} to {r.endDate}
                    </td>
                    <td data-label="Duration">
                      <span style={{ fontWeight: "700", color: "var(--primary)" }}>
                        {r.requestedDays} {r.requestedDays === 1 ? "day" : "days"}
                      </span>
                    </td>
                    <td data-label="Reason">
                      <div className="overflow-wrap" style={{ fontSize: "12px", color: "var(--text-muted)", maxWidth: "240px" }}>
                        {r.reason}
                      </div>
                    </td>
                    <td data-label="Action">
                      <button
                        onClick={() => setSelectedRequest(r)}
                        className="btn btn-primary btn-sm"
                        style={{ gap: "6px" }}
                      >
                        <ShieldCheck size={14} />
                        <span>Review</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
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
