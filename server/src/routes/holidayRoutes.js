import { Router } from "express";
import { getCompanyHolidays } from "../controllers/holidayController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// Authenticated users can list company holidays
router.use(authenticate);

router.get("/", getCompanyHolidays);

export default router;
