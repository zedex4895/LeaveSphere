import app, { initApp } from "../server/src/server.js";

export default async function handler(req, res) {
  try {
    await initApp();
    return app(req, res);
  } catch (err) {
    console.error("Vercel Serverless Function error:", err);
    return res.status(500).json({
      error: {
        code: "SERVER_ERROR",
        message: err.message || "Internal server error occurred",
        details: []
      }
    });
  }
}
