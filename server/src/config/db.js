import mongoose from "mongoose";

let isConnected = false;

export function sanitizeMongoUri(rawUri) {
  if (!rawUri) return rawUri;
  try {
    const atParts = rawUri.split("@");
    if (atParts.length > 2) {
      const prefix = atParts[0];
      const hostPart = atParts[atParts.length - 1];
      const middleParts = atParts.slice(1, atParts.length - 1);

      const protocolAndUserPass = prefix.split("://");
      const protocol = protocolAndUserPass[0];
      const userAndFirstPass = protocolAndUserPass[1];
      const colonIdx = userAndFirstPass.indexOf(":");
      const user = userAndFirstPass.slice(0, colonIdx);
      const firstPass = userAndFirstPass.slice(colonIdx + 1);

      const fullPass = [firstPass, ...middleParts].join("@");
      const encodedPass = encodeURIComponent(fullPass);

      let hostWithDb = hostPart;
      if (!hostWithDb.includes("/")) {
        hostWithDb = `${hostWithDb}/leave_management?retryWrites=true&w=majority`;
      } else if (hostWithDb.endsWith("/")) {
        hostWithDb = `${hostWithDb}leave_management?retryWrites=true&w=majority`;
      }
      return `${protocol}://${encodeURIComponent(user)}:${encodedPass}@${hostWithDb}`;
    }

    if (rawUri.endsWith("/")) {
      return `${rawUri}leave_management?retryWrites=true&w=majority`;
    }
  } catch (e) {
    // Fall back to original URI if parsing fails
  }
  return rawUri;
}

export async function connectDB() {
  const rawUri = process.env.MONGODB_URI || "mongodb://localhost:27017/leave_management";
  const uri = sanitizeMongoUri(rawUri);

  // Mask password for console log
  const maskedUri = uri.replace(/\/\/(.*?):(.*?)@/, "//$1:****@");

  try {
    console.log(`[DB] Connecting to MongoDB Atlas: ${maskedUri}`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log("[DB] MongoDB Atlas connected successfully via Mongoose.");
  } catch (error) {
    isConnected = false;
    console.warn(`[DB] Notice: Could not connect to MongoDB Atlas (${error.message}).`);
    console.log("[DB] Activating built-in resilient database engine so LeaveFlow functions completely out-of-the-box.");
  }
}

export function isMongoConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}
