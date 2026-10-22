import React from "react";
import { useAuth } from "../context/AuthContext";
import { LeaveBalance, LeaveRequest } from "../types";
import { StatCard } from "../components/StatCard";
import { StatusBadge } from "../components/StatusBadge";
import {
  Calendar,
  Activity,
  Clock,
  CheckCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";

interface EmployeeOverviewProps {
  balances: LeaveBalance[];
  requests: LeaveRequest[];
  onOpenApplyModal: () => void;
  onNavigate: (page: string) => void;
}

export const EmployeeOverview: React.FC<EmployeeOverviewProps> = ({
  balances,
  requests,
  onOpenApplyModal,
  onNavigate
}) => {
  const { user } = useAuth();

  const annualBal = balances.find(b => b.leaveType === "ANNUAL");
  const sickBal = balances.find(b => b.leaveType === "SICK");
  const personalBal = balances.find(b => b.leaveType === "PERSONAL");

  const pendingCount = requests.filter(r => r.status === "PENDING").length;
  const approvedRequests = requests.filter(r => r.status === "APPROVED");
  const totalDaysTaken = approvedRequests.reduce((acc, curr) => acc + curr.requestedDays, 0);

  const recentRequests = requests.slice(0, 5);

  return (
    <div>
      {/* Welcome & Action Banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "28px"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px", color: "var(--text-light)" }}>Welcome back,</span>
            <span style={{ fontSize: "12px", padding: "2px 8px", borderRadius: "999px", backgroundColor: "var(--primary-light)", color: "var(--primary)", fontWeight: "600" }}>
              {user?.department || "Product"}
            </span>
          </div>
          <h2 style={{ fontSize: "24px", fontWeight: "800", color: "var(--text-main)", letterSpacing: "-0.02em", marginTop: "2px" }}>
            Good day, {user?.name}
          </h2>
        </div>

        <button onClick={onOpenApplyModal} className="btn btn-primary" style={{ padding: "11px 20px" }}>
          <Plus size={18} strokeWidth={2.5} />
          <span>Apply for leave</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: "20px",
          marginBottom: "28px"
        }}
      >
        <StatCard
          title="Annual leave available"
          value={annualBal ? annualBal.available : 12}
          unit="days"
          hint="Carried forward +2 days"
          icon={Calendar}
          variant="annual"
        />
        <StatCard
          title="Sick leave available"
          value={sickBal ? sickBal.available : 8}
          unit="days"
          hint={`Of ${sickBal ? sickBal.entitlement : 10} annual entitlement`}
          icon={Activity}
          variant="sick"
        />
        <StatCard
          title="Pending requests"
          value={pendingCount}
          unit="in review"
          hint={pendingCount > 0 ? "Awaiting manager decision" : "All requests resolved"}
          icon={Clock}
          variant="personal"
        />
        <StatCard
          title="Days taken this year"
          value={totalDaysTaken}
          unit="days"
          hint={`Across ${approvedRequests.length} approved requests`}
          icon={CheckCircle}
          variant="taken"
        />
      </div>

      {/* Main Content 2-Column Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "24px",
          alignItems: "start"
        }}
      >
        {/* Left Column: Recent Leave Requests */}
        <div className="card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <div>
              <h3 style={{ fontSize: "17px", fontWeight: "700", color: "var(--text-main)" }}>
                Recent leave requests
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Track latest applications and statuses
              </p>
            </div>
            <button
              onClick={() => onNavigate("my-requests")}
              className="btn btn-outline-primary btn-sm"
              style={{ gap: "4px" }}
            >
              <span>View all</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {recentRequests.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
              No leave requests yet. Click "Apply for leave" to start!
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Leave Type</th>
                    <th>Dates</th>
                    <th>Duration</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRequests.map(r => (
                    <tr key={r.id}>
                      <td>
                        <strong style={{ color: "var(--text-main)" }}>{r.leaveType}</strong>
                      </td>
                      <td style={{ fontSize: "13px", whiteSpace: "nowrap" }}>
                        {r.startDate} to {r.endDate}
                      </td>
                      <td>
                        <span style={{ fontWeight: "600", color: "var(--primary)" }}>
                          {r.requestedDays} {r.requestedDays === 1 ? "day" : "days"}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Planning Ahead Tip */}
          <div
            style={{
              marginTop: "20px",
              padding: "12px 16px",
              backgroundColor: "var(--surface-subtle)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              fontSize: "13px",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <span>💡</span>
            <span>
              <strong>Planning ahead?</strong> Submit leave requests early so your manager has time to review and coordinate coverage.
            </span>
          </div>
        </div>

        {/* Right Column: Leave Balance Progress & Activity */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Balance Meters */}
          <div className="card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-main)" }}>
                Your leave balance
              </h3>
              <button
                onClick={() => onNavigate("balance")}
                className="btn btn-outline-primary btn-sm"
                style={{ padding: "4px 8px", fontSize: "12px" }}
              >
                Details ›
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {balances.filter(b => b.leaveType !== "UNPAID").map(b => {
                const pct = b.entitlement > 0 ? Math.round((b.available / b.entitlement) * 100) : 0;
                const getBarColor = () => {
                  if (b.leaveType === "ANNUAL") return "var(--primary)";
                  if (b.leaveType === "SICK") return "var(--badge-approved-color)";
                  return "var(--stat-personal-color)";
                };

                return (
                  <div key={b.leaveType}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                      <span style={{ fontWeight: "500", color: "var(--text-muted)" }}>{b.leaveType} leave</span>
                      <span style={{ fontWeight: "600", color: "var(--text-main)" }}>
                        {b.available} / {b.entitlement} days
                      </span>
                    </div>
                    <div style={{ height: "7px", width: "100%", backgroundColor: "var(--progress-track)", borderRadius: "999px", overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          backgroundColor: getBarColor(),
                          borderRadius: "999px",
                          transition: "width 0.4s ease"
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity mini feed */}
          <div className="card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-main)" }}>
                Recent activity
              </h3>
              <span style={{ fontSize: "11px", color: "var(--text-light)" }}>This week</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {approvedRequests.length > 0 && (
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      backgroundColor: "var(--badge-approved-bg)",
                      color: "var(--badge-approved-color)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}
                  >
                    ✓
                  </div>
                  <div>
                    <strong style={{ fontSize: "13px", color: "var(--text-main)" }}>Request approved</strong>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0" }}>
                      Your {approvedRequests[0].leaveType.toLowerCase()} leave request was approved.
                    </p>
                    <time style={{ fontSize: "11px", color: "var(--text-light)" }}>
                      {approvedRequests[0].reviewer?.name ? `By ${approvedRequests[0].reviewer.name}` : "Recently approved"}
                    </time>
                  </div>
                </div>
              )}

              {pendingCount > 0 && (
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      backgroundColor: "var(--badge-pending-bg)",
                      color: "var(--badge-pending-color)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}
                  >
                    ⏱
                  </div>
                  <div>
                    <strong style={{ fontSize: "13px", color: "var(--text-main)" }}>Request submitted</strong>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0" }}>
                      Your application is currently awaiting manager review.
                    </p>
                    <time style={{ fontSize: "11px", color: "var(--text-light)" }}>In review</time>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
