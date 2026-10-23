import app, { initApp } from "../server/src/server.js";

// Cache the initialization promise across warm invocations on the same
// Vercel serverless instance. This avoids opening a new MongoDB connection
// on every single HTTP request.
let initPromise = null;

export default async function handler(req, res) {
  try {
    if (!initPromise) {
      initPromise = initApp().catch((err) => {
        // Reset so the next cold-start retries initialization
        initPromise = null;
        throw err;
      });
    }
    await initPromise;
    return app(req, res);
  } catch (err) {
    console.error("[Handler] Initialization error:", err.message);
    // Return 503 — never pretend the server is healthy when DB is down
    return res.status(503).json({
      error: {
        code: "SERVICE_UNAVAILABLE",
        message: "The server could not connect to the database. Please try again shortly.",
        details: []
      }
    });
  }
}
