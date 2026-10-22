import React from "react";
import { LeaveBalance } from "../types";
import { PieChart, Info, ShieldCheck, CheckCircle2, Calendar } from "lucide-react";

interface EmployeeBalanceProps {
  balances: LeaveBalance[];
  onOpenApplyModal: () => void;
}

export const EmployeeBalance: React.FC<EmployeeBalanceProps> = ({
  balances,
  onOpenApplyModal
}) => {
  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: "700", color: "var(--text-main)" }}>
            Leave Balance & Entitlements
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Detailed breakdown of allocated days, utilized time-off, and pending reserves
          </p>
        </div>
        <button onClick={onOpenApplyModal} className="btn btn-primary">
          Apply for leave
        </button>
      </div>

      {/* Grid of Balance Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
          marginBottom: "32px"
        }}
      >
        {balances.map(b => {
          const pct = b.entitlement > 0 ? Math.round((b.available / b.entitlement) * 100) : 0;
          const getBarColor = () => {
            if (b.leaveType === "ANNUAL") return "var(--primary)";
            if (b.leaveType === "SICK") return "var(--badge-approved-color)";
            if (b.leaveType === "PERSONAL") return "var(--stat-personal-color)";
            return "var(--text-light)";
          };

          return (
            <div key={b.leaveType} className="card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <h3 style={{ fontSize: "17px", fontWeight: "700", color: "var(--text-main)" }}>
                    {b.leaveType} Leave
                  </h3>
                  <span style={{ fontSize: "12px", color: "var(--text-light)" }}>Annual cycle 2026</span>
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "700",
                    padding: "4px 10px",
                    borderRadius: "999px",
                    backgroundColor: "var(--surface-subtle)",
                    border: "1px solid var(--border)",
                    color: getBarColor()
                  }}
                >
                  {pct}% available
                </div>
              </div>

              {/* Big Available Number */}
              <div style={{ marginBottom: "16px" }}>
                <span style={{ fontSize: "32px", fontWeight: "800", color: "var(--text-main)", letterSpacing: "-0.02em" }}>
                  {b.available}
                </span>
                <span style={{ fontSize: "14px", color: "var(--text-muted)", marginLeft: "6px" }}>
                  days available
                </span>
              </div>

              {/* Progress Bar */}
              <div style={{ height: "8px", width: "100%", backgroundColor: "var(--progress-track)", borderRadius: "999px", overflow: "hidden", marginBottom: "20px" }}>
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

              {/* Breakdown metrics */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", borderTop: "1px solid var(--border)", paddingTop: "16px", textAlign: "center" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-light)", textTransform: "uppercase" }}>Entitlement</span>
                  <div style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-main)", marginTop: "2px" }}>
                    {b.entitlement}d
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-light)", textTransform: "uppercase" }}>Used</span>
                  <div style={{ fontSize: "15px", fontWeight: "600", color: "var(--badge-approved-color)", marginTop: "2px" }}>
                    {b.used}d
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-light)", textTransform: "uppercase" }}>Reserved</span>
                  <div style={{ fontSize: "15px", fontWeight: "600", color: "var(--badge-pending-color)", marginTop: "2px" }}>
                    {b.pending}d
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Company Leave Policies Section */}
      <div className="card" style={{ padding: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <ShieldCheck size={22} color="var(--primary)" />
          <h3 style={{ fontSize: "17px", fontWeight: "700", color: "var(--text-main)" }}>
            Company Leave Policies & Guidelines
          </h3>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          <div style={{ padding: "16px", backgroundColor: "var(--surface-subtle)", borderRadius: "10px", border: "1px solid var(--border)" }}>
            <h4 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-main)", marginBottom: "6px" }}>
              Annual Leave Carry-Forward
            </h4>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.5" }}>
              Up to 5 unused annual leave days can be rolled over into the subsequent calendar year. Unused days beyond 5 lapse on December 31st.
            </p>
          </div>

          <div style={{ padding: "16px", backgroundColor: "var(--surface-subtle)", borderRadius: "10px", border: "1px solid var(--border)" }}>
            <h4 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-main)", marginBottom: "6px" }}>
              Sick Leave Verification
            </h4>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.5" }}>
              A registered medical practitioner certificate is required for sick leave requests extending beyond 2 consecutive business days.
            </p>
          </div>

          <div style={{ padding: "16px", backgroundColor: "var(--surface-subtle)", borderRadius: "10px", border: "1px solid var(--border)" }}>
            <h4 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-main)", marginBottom: "6px" }}>
              Advance Notice Period
            </h4>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.5" }}>
              Please submit leave requests of 3 days or more at least 2 weeks in advance to enable effective sprint and project team coverage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
