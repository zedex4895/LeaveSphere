import {
  User,
  LeaveBalance,
  LeaveRequest,
  CompanyHoliday,
  DashboardMetrics,
  EmployeeWithBalances,
  AuditLogItem,
  NotificationItem
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://leave-sphere.vercel.app/api/v1";

class ApiError extends Error {
  code: string;
  details: Array<{ field?: string; message: string }>;
  status: number;

  constructor(status: number, message: string, code = "API_ERROR", details: Array<{ field?: string; message: string }> = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("leaveflow_token");
  const headers = new Headers(options.headers || {});

  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, { ...options, headers });

    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errInfo = data.error || {};
      throw new ApiError(
        response.status,
        errInfo.message || `Request failed with status ${response.status}`,
        errInfo.code || "REQUEST_FAILED",
        errInfo.details || []
      );
    }

    return data as T;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, err.message || "Network error. Please check your server connection.");
  }
}

export const api = {
  auth: {
    async login(email: string, password: string): Promise<{ user: User; accessToken: string }> {
      return request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
    },
    async logout(): Promise<void> {
      return request("/auth/logout", { method: "POST" });
    },
    async getMe(): Promise<{ user: User }> {
      return request("/auth/me");
    }
  },

  leave: {
    async getBalance(employeeId?: string): Promise<{ balances: LeaveBalance[] }> {
      const query = employeeId ? `?employeeId=${encodeURIComponent(employeeId)}` : "";
      return request(`/leave/balance${query}`);
    },
    async submitRequest(body: {
      leaveType: string;
      startDate: string;
      endDate: string;
      reason: string;
      handoverNotes?: string;
    }): Promise<any> {
      return request("/leave/requests", {
        method: "POST",
        body: JSON.stringify(body)
      });
    },
    async getRequests(params: {
      status?: string;
      leaveType?: string;
      from?: string;
      to?: string;
      employeeId?: string;
      page?: number;
      limit?: number;
    } = {}): Promise<{ items: LeaveRequest[]; page: number; limit: number; total: number }> {
      const search = new URLSearchParams();
      if (params.status && params.status !== "ALL") search.set("status", params.status);
      if (params.leaveType && params.leaveType !== "ALL") search.set("leaveType", params.leaveType);
      if (params.from) search.set("from", params.from);
      if (params.to) search.set("to", params.to);
      if (params.employeeId) search.set("employeeId", params.employeeId);
      if (params.page) search.set("page", params.page.toString());
      if (params.limit) search.set("limit", params.limit.toString());
      const query = search.toString() ? `?${search.toString()}` : "";
      return request(`/leave/requests${query}`);
    },
    async getRequestById(id: string): Promise<LeaveRequest> {
      return request(`/leave/requests/${id}`);
    },
    async cancelRequest(id: string): Promise<LeaveRequest> {
      return request(`/leave/requests/${id}/cancel`, {
        method: "PATCH"
      });
    }
  },

  admin: {
    async getDashboard(): Promise<DashboardMetrics> {
      return request("/admin/dashboard");
    },
    async decideRequest(id: string, decision: "APPROVED" | "REJECTED", decisionNote?: string): Promise<LeaveRequest> {
      return request(`/admin/leave/requests/${id}/decision`, {
        method: "PATCH",
        body: JSON.stringify({ decision, decisionNote })
      });
    },
    async getEmployees(): Promise<{ employees: EmployeeWithBalances[] }> {
      return request("/admin/employees");
    },
    async getEmployeeLeaveHistory(
      employeeId: string,
      params: { from?: string; to?: string; status?: string; leaveType?: string; page?: number; limit?: number } = {}
    ): Promise<{
      employee: { id: string; name: string; department?: string };
      items: LeaveRequest[];
      page: number;
      limit: number;
      total: number;
    }> {
      const search = new URLSearchParams();
      if (params.from) search.set("from", params.from);
      if (params.to) search.set("to", params.to);
      if (params.status && params.status !== "ALL") search.set("status", params.status);
      if (params.leaveType && params.leaveType !== "ALL") search.set("leaveType", params.leaveType);
      if (params.page) search.set("page", params.page.toString());
      if (params.limit) search.set("limit", params.limit.toString());
      const query = search.toString() ? `?${search.toString()}` : "";
      return request(`/admin/employees/${employeeId}/leave-history${query}`);
    },
    async importCompanyHolidays(holidays: Array<{ name: string; date: string; type?: string; notes?: string }>): Promise<{
      imported: number;
      skipped: number;
      errors: any[];
    }> {
      return request("/admin/company-holidays/import", {
        method: "POST",
        body: JSON.stringify({ holidays })
      });
    },
    async getAuditLogs(): Promise<{ logs: AuditLogItem[] }> {
      return request("/admin/audit-logs");
    }
  },

  holidays: {
    async getCompanyHolidays(params: { from?: string; to?: string } = {}): Promise<{ holidays: CompanyHoliday[] }> {
      const search = new URLSearchParams();
      if (params.from) search.set("from", params.from);
      if (params.to) search.set("to", params.to);
      const query = search.toString() ? `?${search.toString()}` : "";
      return request(`/company-holidays${query}`);
    }
  },

  notifications: {
    async get(limit = 50): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
      return request(`/notifications?limit=${limit}`);
    },
    async markAsRead(id: string): Promise<{ success: boolean; id: string }> {
      return request(`/notifications/${id}/read`, { method: "PATCH" });
    },
    async markAllAsRead(): Promise<{ success: boolean }> {
      return request("/notifications/read-all", { method: "PATCH" });
    }
  }
};

export { ApiError };
