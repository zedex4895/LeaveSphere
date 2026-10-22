import { Router } from "express";
import {
  getDashboard,
  decideLeaveRequest,
  getEmployees,
  getEmployeeLeaveHistory,
  getAuditLogs
} from "../controllers/adminController.js";
import { importCompanyHolidays } from "../controllers/holidayController.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = Router();

// All admin routes require authentication and ADMIN role
router.use(authenticate, requireAdmin);

router.get("/dashboard", getDashboard);
router.patch("/leave/requests/:id/decision", decideLeaveRequest);
router.get("/employees", getEmployees);
router.get("/employees/:employeeId/leave-history", getEmployeeLeaveHistory);
router.post("/company-holidays/import", importCompanyHolidays);
router.get("/audit-logs", getAuditLogs);

export default router;
