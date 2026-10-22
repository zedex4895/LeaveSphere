import { Router } from "express";
import authRoutes from "./authRoutes.js";
import leaveRoutes from "./leaveRoutes.js";
import adminRoutes from "./adminRoutes.js";
import holidayRoutes from "./holidayRoutes.js";
import notificationRoutes from "./notificationRoutes.js";

const apiRouter = Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/leave", leaveRoutes);
apiRouter.use("/admin", adminRoutes);
apiRouter.use("/company-holidays", holidayRoutes);
apiRouter.use("/notifications", notificationRoutes);

export default apiRouter;
