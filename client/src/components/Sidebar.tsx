import React from "react";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  CalendarPlus,
  CalendarCheck,
  PieChart,
  CalendarDays,
  FileText,
  Users,
  ShieldCheck,
  Clock
} from "lucide-react";
import { Logo } from "./Logo";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  pendingApprovalsCount?: number;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number | string; strokeWidth?: number | string }>;
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  pendingApprovalsCount = 0
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const employeeNavItems: NavItem[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "apply", label: "Apply for leave", icon: CalendarPlus },
    { id: "my-requests", label: "My requests", icon: CalendarCheck },
    { id: "balance", label: "Leave balance", icon: PieChart },
    { id: "holidays", label: "Company holidays", icon: CalendarDays }
  ];

  const adminNavItems: NavItem[] = [
    { id: "admin-overview", label: "Overview", icon: LayoutDashboard },
    {
      id: "admin-pending",
      label: "Pending approvals",
      icon: Clock,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined
    },
    { id: "admin-requests", label: "All leave requests", icon: FileText },
    { id: "admin-employees", label: "Employees & balances", icon: Users },
    { id: "holidays", label: "Company holidays", icon: CalendarDays },
    { id: "admin-audit", label: "Audit logs", icon: ShieldCheck }
  ];

  const navItems = isAdmin ? adminNavItems : employeeNavItems;

  return (
    <aside
      style={{
        width: "260px",
        backgroundColor: "var(--sidebar-bg)",
        borderRight: "1px solid var(--sidebar-border)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        height: "100vh",
        position: "sticky",
        top: 0,
        zIndex: 60,
        transition: "background-color 0.25s ease, border-color 0.25s ease"
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: "22px 20px 18px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          borderBottom: "1px solid var(--border-light)"
        }}
      >
        <Logo size="md" />
        <div
          style={{
            fontSize: "10.5px",
            fontWeight: "700",
            color: isAdmin ? "var(--accent-orange, #FF4500)" : "var(--primary)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            paddingLeft: "48px"
          }}
        >
          {isAdmin ? "Admin Portal" : "Employee Workspace"}
        </div>
      </div>

      {/* Navigation List */}
      <div style={{ padding: "20px 12px", display: "flex", flexDirection: "column", gap: "6px", flex: 1, overflowY: "auto" }}>
        <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-light)", textTransform: "uppercase", padding: "0 12px 6px" }}>
          Menu
        </div>
        {navItems.map(item => {
          const isActive = currentPage === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: "10px",
                border: "none",
                background: isActive ? "var(--primary-light)" : "transparent",
                color: isActive ? "var(--primary)" : "var(--text-muted)",
                fontSize: "14px",
                fontWeight: isActive ? "600" : "500",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s ease",
                width: "100%"
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "var(--surface-hover)";
                  e.currentTarget.style.color = "var(--text-main)";
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--text-muted)";
                }
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  style={{
                    backgroundColor: "var(--primary)",
                    color: "#FFFFFF",
                    fontSize: "11px",
                    fontWeight: "700",
                    padding: "2px 7px",
                    borderRadius: "999px"
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div
        style={{
          padding: "16px 20px",
          borderTop: "1px solid var(--border-light)",
          fontSize: "12px",
          color: "var(--text-light)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <span>LeaveSphere v1.0</span>
        <span style={{ fontSize: "11px", color: "var(--badge-approved-color)", fontWeight: "600" }}>● Online</span>
      </div>
    </aside>
  );
};
