import app, { initApp } from "./server.js";
import { applyCorsHeaders } from "./config/cors.js";

export default async function handler(req, res) {
  applyCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    await initApp();
    return app(req, res);
  } catch (err) {
    console.error("[Handler] Initialization error:", err.message);
    applyCorsHeaders(req, res);
    res.statusCode = 503;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(
      JSON.stringify({
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "The server could not connect to the database. Please try again shortly.",
          details: []
        }
      })
    );
  }
}
