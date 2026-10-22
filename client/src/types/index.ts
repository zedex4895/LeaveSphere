export type Role = "EMPLOYEE" | "ADMIN";

export type LeaveType = "ANNUAL" | "SICK" | "PERSONAL" | "UNPAID";

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export type HolidayType = "PUBLIC_HOLIDAY" | "COMPANY_GRANTED_LEAVE" | "OPTIONAL_HOLIDAY";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
}

export interface LeaveBalance {
  leaveType: LeaveType;
  entitlement: number;
  used: number;
  pending: number;
  available: number;
}

export interface LeaveRequest {
  id: string;
  employee?: {
    id: string;
    name: string;
    email: string;
    department?: string;
  };
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  requestedDays: number;
  reason: string;
  handoverNotes?: string;
  status: LeaveStatus;
  reviewer?: {
    id: string;
    name: string;
    email: string;
  };
  decisionNote?: string;
  decidedAt?: string;
  submittedAt?: string;
  createdAt?: string;
}

export interface CompanyHoliday {
  id: string;
  name: string;
  date: string;
  type: HolidayType;
  notes?: string;
  isPublished?: boolean;
}

export interface DashboardMetrics {
  pendingApprovals: number;
  approvedThisMonth: number;
  rejectedThisMonth: number;
  employeesOnLeaveToday: number;
}

export interface EmployeeWithBalances {
  id: string;
  name: string;
  email: string;
  department?: string;
  balances: LeaveBalance[];
}

export interface AuditLogItem {
  id: string;
  actorId?: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  recipientId?: string;
  recipientRole?: "EMPLOYEE" | "ADMIN" | "ALL";
  title: string;
  message: string;
  type: "REQUEST_SUBMITTED" | "REQUEST_APPROVED" | "REQUEST_REJECTED" | "REQUEST_CANCELLED" | "HOLIDAY_PUBLISHED" | "SYSTEM";
  relatedEntityId?: string;
  isRead: boolean;
  createdAt: string;
}

