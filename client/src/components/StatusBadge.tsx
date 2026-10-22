import React from "react";
import { LeaveStatus } from "../types";
import { Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface StatusBadgeProps {
  status: LeaveStatus;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showIcon = true }) => {
  const normalized = status ? status.toUpperCase() : "PENDING";

  const config = {
    PENDING: {
      label: "Pending",
      className: "badge-pending",
      icon: Clock
    },
    APPROVED: {
      label: "Approved",
      className: "badge-approved",
      icon: CheckCircle2
    },
    REJECTED: {
      label: "Rejected",
      className: "badge-rejected",
      icon: XCircle
    },
    CANCELLED: {
      label: "Cancelled",
      className: "badge-cancelled",
      icon: AlertCircle
    }
  }[normalized as LeaveStatus] || {
    label: normalized,
    className: "badge-pending",
    icon: Clock
  };

  const IconComponent = config.icon;

  return (
    <span className={`badge ${config.className}`}>
      {showIcon && <IconComponent size={13} strokeWidth={2.5} />}
      <span>{config.label}</span>
    </span>
  );
};
