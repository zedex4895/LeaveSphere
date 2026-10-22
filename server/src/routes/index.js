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
apiRouter.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "LeaveSphere REST API",
    timestamp: new Date().toISOString()
  });
});

export default apiRouter;
