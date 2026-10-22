import React, { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { api } from "./services/api";
import {
  LeaveBalance,
  LeaveRequest,
  DashboardMetrics,
  EmployeeWithBalances,
  CompanyHoliday
} from "./types";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { ApplyLeaveModal } from "./components/ApplyLeaveModal";
import { Login } from "./pages/Login";
import { EmployeeOverview } from "./pages/EmployeeOverview";
import { EmployeeRequests } from "./pages/EmployeeRequests";
import { EmployeeBalance as EmployeeBalancePage } from "./pages/EmployeeBalance";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminAllRequests } from "./pages/AdminAllRequests";
import { AdminEmployees } from "./pages/AdminEmployees";
import { CompanyHolidays } from "./pages/CompanyHolidays";
import { AdminAuditLogs } from "./pages/AdminAuditLogs";

export const App: React.FC = () => {
  const { user, token, loading: authLoading } = useAuth();

  const [currentPage, setCurrentPage] = useState<string>("overview");
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);

  // Data states
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [adminRequests, setAdminRequests] = useState<LeaveRequest[]>([]);
  const [adminMetrics, setAdminMetrics] = useState<DashboardMetrics>({
    pendingApprovals: 0,
    approvedThisMonth: 0,
    rejectedThisMonth: 0,
    employeesOnLeaveToday: 0
  });
  const [employees, setEmployees] = useState<EmployeeWithBalances[]>([]);
  const [holidays, setHolidays] = useState<CompanyHoliday[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(false);

  // Set default page when user role changes
  useEffect(() => {
    if (user) {
      if (user.role === "ADMIN") {
        setCurrentPage("admin-overview");
      } else {
        setCurrentPage("overview");
      }
    }
  }, [user?.role]);

  // Data Fetching Function
  const loadData = async () => {
    if (!token || !user) return;

    try {
      setDataLoading(true);

      // Fetch company holidays (shared)
      const holRes = await api.holidays.getCompanyHolidays();
      setHolidays(holRes.holidays);

      if (user.role === "EMPLOYEE") {
        const [balRes, reqRes] = await Promise.all([
          api.leave.getBalance(),
          api.leave.getRequests()
        ]);
        setBalances(balRes.balances);
        setRequests(reqRes.items);
      } else if (user.role === "ADMIN") {
        const [metricsRes, allReqRes, empRes] = await Promise.all([
          api.admin.getDashboard(),
          api.leave.getRequests({ limit: 100 }),
          api.admin.getEmployees()
        ]);
        setAdminMetrics(metricsRes);
        setAdminRequests(allReqRes.items);
        setEmployees(empRes.employees);
      }
    } catch (err) {
      console.error("Failed to load application data:", err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      loadData();
    }
  }, [user?.id, token]);

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--bg)",
          color: "var(--text-muted)",
          fontSize: "15px",
          fontWeight: "500"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              padding: "4px",
              background: "conic-gradient(from 270deg, #FF4500, #FFB800, #7FC535, #00D26A, #00B4D8, #8B5CF6, #BC14A4, #FF4500)",
              animation: "spin 1s linear infinite",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                backgroundColor: "var(--bg)"
              }}
            />
          </div>
          <span style={{ fontWeight: "600", letterSpacing: "-0.01em", color: "var(--text-main)" }}>Loading LeaveSphere...</span>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const getPageTitle = () => {
    switch (currentPage) {
      case "overview":
        return "Employee Overview";
      case "apply":
        return "Apply for Leave";
      case "my-requests":
        return "My Leave Requests";
      case "balance":
        return "Leave Balances";
      case "holidays":
        return "Company Holidays";
      case "admin-overview":
        return "Admin Dashboard";
      case "admin-pending":
        return "Pending Approvals";
      case "admin-requests":
        return "All Leave Requests";
      case "admin-employees":
        return "Employees & Balances";
      case "admin-audit":
        return "Audit Logs";
      default:
        return "Dashboard";
    }
  };

  const pendingApprovalsCount = adminRequests.filter(r => r.status === "PENDING").length;

  const handleNavigate = (page: string) => {
    if (page === "apply") {
      setIsApplyModalOpen(true);
      return;
    }
    setCurrentPage(page);
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        pendingApprovalsCount={pendingApprovalsCount}
      />

      {/* Main Area */}
      <div className="main-content">
        <Navbar
          pageTitle={getPageTitle()}
        />

        <main className="page-wrapper">
          {/* Employee Views */}
          {user.role === "EMPLOYEE" && (
            <>
              {currentPage === "overview" && (
                <EmployeeOverview
                  balances={balances}
                  requests={requests}
                  onOpenApplyModal={() => setIsApplyModalOpen(true)}
                  onNavigate={handleNavigate}
                />
              )}
              {currentPage === "my-requests" && (
                <EmployeeRequests
                  requests={requests}
                  onRefresh={loadData}
                  onOpenApplyModal={() => setIsApplyModalOpen(true)}
                />
              )}
              {currentPage === "balance" && (
                <EmployeeBalancePage
                  balances={balances}
                  onOpenApplyModal={() => setIsApplyModalOpen(true)}
                />
              )}
              {currentPage === "holidays" && (
                <CompanyHolidays
                  holidays={holidays}
                  onRefresh={loadData}
                />
              )}
            </>
          )}

          {/* Admin Views */}
          {user.role === "ADMIN" && (
            <>
              {currentPage === "admin-overview" && (
                <AdminDashboard
                  metrics={adminMetrics}
                  pendingRequests={adminRequests.filter(r => r.status === "PENDING")}
                  onRefresh={loadData}
                  onNavigate={handleNavigate}
                />
              )}
              {currentPage === "admin-pending" && (
                <AdminDashboard
                  metrics={adminMetrics}
                  pendingRequests={adminRequests.filter(r => r.status === "PENDING")}
                  onRefresh={loadData}
                  onNavigate={handleNavigate}
                />
              )}
              {currentPage === "admin-requests" && (
                <AdminAllRequests
                  requests={adminRequests}
                  onRefresh={loadData}
                />
              )}
              {currentPage === "admin-employees" && (
                <AdminEmployees
                  employees={employees}
                  onRefresh={loadData}
                />
              )}
              {currentPage === "holidays" && (
                <CompanyHolidays
                  holidays={holidays}
                  onRefresh={loadData}
                />
              )}
              {currentPage === "admin-audit" && (
                <AdminAuditLogs />
              )}
            </>
          )}
        </main>
      </div>

      {/* Apply Leave Modal */}
      <ApplyLeaveModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={() => {
          loadData();
          setCurrentPage("my-requests");
        }}
        balances={balances}
        holidays={holidays}
      />
    </div>
  );
};
