import React, { useState } from "react";
import { EmployeeWithBalances } from "../types";
import { EmployeeHistoryModal } from "../components/EmployeeHistoryModal";
import { Users, History, Mail, Building, Search } from "lucide-react";

interface AdminEmployeesProps {
  employees: EmployeeWithBalances[];
  onRefresh: () => void;
}

export const AdminEmployees: React.FC<AdminEmployeesProps> = ({ employees }) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const filtered = employees.filter(e => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || (e.department || "").toLowerCase().includes(q);
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: "700", color: "var(--text-main)" }}>
            Employees & Leave Balances
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Inspect organizational workforce, remaining leave quotas, and individual leave histories
          </p>
        </div>

        {/* Search */}
        <div style={{ position: "relative", minWidth: "260px" }}>
          <input
            type="text"
            className="input"
            style={{ paddingLeft: "36px", height: "38px" }}
            placeholder="Search employees..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <Search
            size={16}
            color="var(--text-light)"
            style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
          />
        </div>
      </div>

      {/* Employees Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "20px"
        }}
      >
        {filtered.map(emp => {
          const annual = emp.balances.find(b => b.leaveType === "ANNUAL");
          const sick = emp.balances.find(b => b.leaveType === "SICK");
          const personal = emp.balances.find(b => b.leaveType === "PERSONAL");

          return (
            <div key={emp.id} className="card" style={{ padding: "22px" }}>
              {/* Employee Header */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    backgroundColor: "var(--primary-light)",
                    color: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700",
                    fontSize: "17px"
                  }}
                >
                  {emp.name.charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-main)" }}>
                    {emp.name}
                  </h3>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                    <Building size={13} />
                    <span>{emp.department || "General Team"}</span>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div style={{ fontSize: "12px", color: "var(--text-light)", display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px" }}>
                <Mail size={13} />
                <span>{emp.email}</span>
              </div>

              {/* Balances Snippet */}
              <div
                style={{
                  backgroundColor: "var(--surface-subtle)",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  marginBottom: "16px",
                  border: "1px solid var(--border)"
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-light)", textTransform: "uppercase", marginBottom: "8px" }}>
                  Available Balances
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", textAlign: "center" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Annual</span>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--primary)", marginTop: "2px" }}>
                      {annual ? annual.available : 0}d
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Sick</span>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--badge-approved-color)", marginTop: "2px" }}>
                      {sick ? sick.available : 0}d
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Personal</span>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--stat-personal-color)", marginTop: "2px" }}>
                      {personal ? personal.available : 0}d
                    </div>
                  </div>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => setSelectedEmployeeId(emp.id)}
                className="btn btn-outline-primary"
                style={{ width: "100%", padding: "8px", fontSize: "13px", gap: "6px" }}
              >
                <History size={15} />
                <span>View Full Leave History</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* History Modal */}
      <EmployeeHistoryModal
        employeeId={selectedEmployeeId}
        isOpen={Boolean(selectedEmployeeId)}
        onClose={() => setSelectedEmployeeId(null)}
      />
    </div>
  );
};
