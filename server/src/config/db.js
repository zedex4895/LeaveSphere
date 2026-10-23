import mongoose from "mongoose";

let isConnected = false;
let connectionPromise = null;

/**
 * Ensure the URI has a database name and query options appended.
 * We do NOT re-encode the password here — the URI in the environment variable
 * must already have any special characters percent-encoded (e.g. "@" → "%40").
 * This avoids double-encoding or mis-parsing passwords that contain "@".
 */
export function sanitizeMongoUri(rawUri) {
  if (!rawUri) return rawUri;
  try {
    // If the URI ends with just "/" or has no database name, append defaults
    const url = new URL(rawUri);
    if (!url.pathname || url.pathname === "/") {
      url.pathname = "/leave_management";
      if (!url.searchParams.has("retryWrites")) url.searchParams.set("retryWrites", "true");
      if (!url.searchParams.has("w")) url.searchParams.set("w", "majority");
    }
    return url.toString();
  } catch (e) {
    // URL constructor cannot parse mongodb+srv in all Node versions — fall back
    // to a simple string-based approach
    if (rawUri.endsWith("/")) {
      return `${rawUri}leave_management?retryWrites=true&w=majority`;
    }
    // No trailing slash but also no path — append
    const hasPath = rawUri.split("://")[1]?.includes("/");
    if (!hasPath) {
      return `${rawUri}/leave_management?retryWrites=true&w=majority`;
    }
    return rawUri;
  }
}

export async function connectDB() {
  const isProduction = !!(process.env.VERCEL || process.env.NODE_ENV === "production");
  const rawUri = process.env.MONGODB_URI;

  if (!rawUri) {
    if (isProduction) {
      throw new Error(
        "[DB] MONGODB_URI environment variable is required in production. " +
        "Set it in your Vercel project environment variables."
      );
    }
    console.warn("[DB] MONGODB_URI not set — using localhost fallback for local development only.");
  }

  const uri = sanitizeMongoUri(rawUri || "mongodb://localhost:27017/leave_management");

  // Mask credentials in all log output — never print the real password
  const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@");
  console.log(`[DB] Connecting to MongoDB: ${maskedUri}`);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    });
    isConnected = true;
    console.log("[DB] MongoDB connected successfully.");
  } catch (error) {
    isConnected = false;
    // Scrub the real URI from the error message before logging
    const safeMsg = error.message.replace(uri, maskedUri);
    if (isProduction) {
      throw new Error(`[DB] MongoDB connection failed: ${safeMsg}`);
    }
    console.warn(`[DB] Could not connect to MongoDB (${safeMsg}).`);
    console.log("[DB] Running with in-memory store for local development.");
  }
}

/**
 * Reuse existing connections across Vercel serverless warm invocations.
 * Safe to call multiple times — resolves immediately when already connected.
 */
export async function ensureConnected() {
  if (isConnected && mongoose.connection.readyState === 1) return;
  if (!connectionPromise) {
    connectionPromise = connectDB().finally(() => {
      connectionPromise = null;
    });
  }
  await connectionPromise;
}

export function isMongoConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}
