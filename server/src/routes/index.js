import { Router } from "express";
import authRoutes from "./authRoutes.js";
import leaveRoutes from "./leaveRoutes.js";
import adminRoutes from "./adminRoutes.js";
import holidayRoutes from "./holidayRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import { isMongoConnected } from "../config/db.js";

const apiRouter = Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/leave", leaveRoutes);
apiRouter.use("/admin", adminRoutes);
apiRouter.use("/company-holidays", holidayRoutes);
apiRouter.use("/notifications", notificationRoutes);
apiRouter.get("/health", (req, res) => {
  const dbConnected = isMongoConnected();
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? "ok" : "degraded",
    service: "LeaveSphere REST API",
    database: dbConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString()
  });
});

export default apiRouter;
