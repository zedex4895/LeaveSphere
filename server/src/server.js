import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import { seedInitialData } from "./services/dataService.js";
import apiRoutes from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

// Middleware
app.use(cors({
  origin: [CLIENT_ORIGIN, "http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(morgan("dev"));

// Health endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "LeaveFlow REST API",
    timestamp: new Date().toISOString()
  });
});

// Mount V1 API
app.use("/api/v1", apiRoutes);

// 404 for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: `Cannot ${req.method} ${req.originalUrl}`,
      details: []
    }
  });
});

// Global error handler
app.use(errorHandler);

// Bootstrap server
async function startServer() {
  try {
    await connectDB();
    await seedInitialData();

    app.listen(PORT, () => {
      console.log(`\n=================================================`);
      console.log(`  LeaveFlow API server running on port ${PORT}`);
      console.log(`  Base URL: http://localhost:${PORT}/api/v1`);
      console.log(`  Ready for client connections from ${CLIENT_ORIGIN}`);
      console.log(`=================================================\n`);
    });
  } catch (error) {
    console.error("Failed to start LeaveFlow API server:", error);
    process.exit(1);
  }
}

startServer();

export default app;
