import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import express from "express";
import cors from "cors";
import morgan from "morgan";
import { ensureConnected, isMongoConnected } from "./config/db.js";
import { corsOptions } from "./config/cors.js";
import { seedInitialData } from "./services/dataService.js";
import apiRoutes from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 4000;

let isInitialized = false;
let initPromise = null;

export async function initApp() {
  if (isInitialized) return;
  if (!initPromise) {
    initPromise = (async () => {
      await ensureConnected();
      if (!isMongoConnected() && (process.env.VERCEL || process.env.NODE_ENV === "production")) {
        throw new Error("MongoDB is not connected in production.");
      }
      await seedInitialData();
      isInitialized = true;
      console.log("[App] Initialization complete.");
    })().catch((err) => {
      initPromise = null;
      console.error("[App] Initialization failed:", err.message);
      throw err;
    });
  }
  await initPromise;
}

app.use(cors(corsOptions));

app.use((req, res, next) => {
  if (req.headers["access-control-request-private-network"]) {
    res.setHeader("Access-Control-Allow-Private-Network", "true");
  }
  next();
});

app.use(express.json());
app.use(morgan("dev"));

app.use(async (req, res, next) => {
  if (req.method === "OPTIONS") {
    next();
    return;
  }
  try {
    await initApp();
    next();
  } catch (err) {
    err.status = err.status || 503;
    err.code = err.code || "SERVICE_UNAVAILABLE";
    next(err);
  }
});

app.get("/health", (req, res) => {
  const dbConnected = isMongoConnected();
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? "ok" : "degraded",
    service: "LeaveSphere REST API",
    database: dbConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/v1", apiRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: `Cannot ${req.method} ${req.originalUrl}`,
      details: []
    }
  });
});

app.use(errorHandler);

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
    console.error("Failed to start LeaveSphere API server:", error.message);
    process.exit(1);
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
