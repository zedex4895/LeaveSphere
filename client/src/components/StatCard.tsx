import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  hint?: string;
  icon: LucideIcon;
  variant?: "annual" | "sick" | "personal" | "taken" | "default";
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  hint,
  icon: Icon,
  variant = "default"
}) => {
  const getStyles = () => {
    switch (variant) {
      case "annual":
        return { bg: "var(--stat-annual-bg)", color: "var(--stat-annual-color)" };
      case "sick":
        return { bg: "var(--stat-sick-bg)", color: "var(--stat-sick-color)" };
      case "personal":
        return { bg: "var(--stat-personal-bg)", color: "var(--stat-personal-color)" };
      case "taken":
        return { bg: "var(--stat-taken-bg)", color: "var(--stat-taken-color)" };
      default:
        return { bg: "var(--primary-light)", color: "var(--primary)" };
    }
  };

  const iconStyle = getStyles();

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-muted)" }}>{title}</span>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: iconStyle.bg,
            color: iconStyle.color
          }}
        >
          <Icon size={18} strokeWidth={2.2} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "6px" }}>
        <span style={{ fontSize: "28px", fontWeight: "700", color: "var(--text-main)", letterSpacing: "-0.02em" }}>
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-light)" }}>
            {unit}
          </span>
        )}
      </div>

      {hint && (
        <div style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
          {hint}
        </div>
      )}
    </div>
  );
};
