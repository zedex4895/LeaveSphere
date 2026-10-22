import { Router } from "express";
import {
  getBalance,
  createLeaveRequest,
  getLeaveRequests,
  getLeaveRequestById,
  cancelLeaveRequest
} from "../controllers/leaveController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/balance", getBalance);
router.post("/requests", createLeaveRequest);
router.get("/requests", getLeaveRequests);
router.get("/requests/:id", getLeaveRequestById);
router.patch("/requests/:id/cancel", cancelLeaveRequest);

export default router;
