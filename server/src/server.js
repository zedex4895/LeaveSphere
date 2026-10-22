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

// Middleware - support Chrome Private Network Access (PNA) for public-to-localhost requests
app.use((req, res, next) => {
  if (req.headers["access-control-request-private-network"]) {
    res.setHeader("Access-Control-Allow-Private-Network", "true");
  }
  next();
});

// Middleware - allow requesting origins (Vercel deployments, custom domains, local development)
app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Access-Control-Request-Private-Network"]
}));

app.options("*", (req, res) => {
  if (req.headers["access-control-request-private-network"]) {
    res.setHeader("Access-Control-Allow-Private-Network", "true");
  }
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Access-Control-Request-Private-Network");
  res.sendStatus(204);
});

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

let isInitialized = false;

export async function initApp() {
  if (!isInitialized) {
    await connectDB();
    await seedInitialData();
    isInitialized = true;
  }
}

// Bootstrap server (only when running as standalone process, not in Vercel serverless)
async function startServer() {
  try {
    await initApp();

    app.listen(PORT, () => {
      console.log(`\n=================================================`);
      console.log(`  LeaveSphere API server running on port ${PORT}`);
      console.log(`  Base URL: http://localhost:${PORT}/api/v1`);
      console.log(`=================================================\n`);
    });
  } catch (error) {
    console.error("Failed to start LeaveSphere API server:", error);
    process.exit(1);
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
