import mongoose from "mongoose";

let isConnected = false;
let connectionPromise = null;

/**
 * Sanitize a MongoDB Atlas URI so that a password containing "@" is handled
 * correctly. We ONLY URL-encode the password component; the rest of the URI
 * is left untouched.
 *
 * Strategy: find the authority section (between "://" and the first "/" after
 * the host) and split on the LAST "@" to separate credentials from host.
 * This correctly handles passwords such as "gerukatte@123".
 */
export function sanitizeMongoUri(rawUri) {
  if (!rawUri) return rawUri;
  try {
    // Match:  scheme "://" userinfo "@" host+rest
    // We look for the LAST "@" before the first "/" that follows the host.
    const schemeEnd = rawUri.indexOf("://");
    if (schemeEnd === -1) return rawUri;

    const scheme = rawUri.slice(0, schemeEnd); // "mongodb+srv" or "mongodb"
    const afterScheme = rawUri.slice(schemeEnd + 3); // "user:pass@host/db?opts"

    // Find the last "@" that is part of the authority (before the path "/")
    const pathStart = afterScheme.indexOf("/");
    const authority = pathStart === -1 ? afterScheme : afterScheme.slice(0, pathStart);
    const path = pathStart === -1 ? "" : afterScheme.slice(pathStart);

    const lastAt = authority.lastIndexOf("@");
    if (lastAt === -1) {
      // No credentials in URI — return as-is
      return rawUri;
    }

    const credentials = authority.slice(0, lastAt);       // "user:pass@...pass"
    const hostPart = authority.slice(lastAt + 1);         // "cluster0.xxx.mongodb.net"

    // Split credentials on the FIRST ":" to separate username from password
    const colonIdx = credentials.indexOf(":");
    if (colonIdx === -1) return rawUri;

    const user = credentials.slice(0, colonIdx);
    const pass = credentials.slice(colonIdx + 1);

    // Only encode if the password is not already percent-encoded
    const encodedPass = encodeURIComponent(decodeURIComponent(pass));
    const encodedUser = encodeURIComponent(decodeURIComponent(user));

    // Reconstruct URI, appending default DB/options if path is bare "/"
    let resolvedPath = path;
    if (!resolvedPath || resolvedPath === "/") {
      resolvedPath = "/leave_management?retryWrites=true&w=majority";
    }

    return `${scheme}://${encodedUser}:${encodedPass}@${hostPart}${resolvedPath}`;
  } catch (e) {
    console.warn("[DB] sanitizeMongoUri error:", e.message);
    return rawUri;
  }
}

export async function connectDB() {
  const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL;
  const rawUri = process.env.MONGODB_URI;

  if (!rawUri) {
    if (isProduction) {
      throw new Error(
        "[DB] MONGODB_URI environment variable is required in production. " +
        "Set it in your Vercel project environment variables."
      );
    }
    // Local dev convenience: fall back to localhost
    console.warn("[DB] MONGODB_URI not set — using localhost fallback for local development.");
  }

  const uri = sanitizeMongoUri(rawUri || "mongodb://localhost:27017/leave_management");

  // Mask password in logs — never print the real credentials
  const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@");
  console.log(`[DB] Connecting to MongoDB: ${maskedUri}`);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      // Vercel serverless: do not buffer connections indefinitely
      bufferCommands: false,
    });
    isConnected = true;
    console.log("[DB] MongoDB connected successfully.");
  } catch (error) {
    isConnected = false;
    const safeMsg = error.message.replace(uri, maskedUri); // scrub URI from error
    if (isProduction) {
      // In production, do NOT silently fall back — let it crash so Vercel logs
      // show the real problem and callers return HTTP 503.
      throw new Error(`[DB] MongoDB connection failed: ${safeMsg}`);
    }
    console.warn(`[DB] Could not connect to MongoDB (${safeMsg}).`);
    console.log("[DB] Running with in-memory store for local development.");
  }
}

/**
 * Reuse existing connections across Vercel serverless invocations.
 * Calling this multiple times is safe — it resolves immediately if already
 * connected.
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
