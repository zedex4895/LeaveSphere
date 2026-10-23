const DEVELOPMENT_SECRET = "leaveflow_jwt_secret_secure_key_2026_9876543210";

function isProductionRuntime() {
  return !!(process.env.VERCEL || process.env.NODE_ENV === "production");
}

export function getJwtSecret() {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (secret) return secret;

  if (isProductionRuntime()) {
    throw new Error("JWT_ACCESS_SECRET environment variable is required in production.");
  }

  return DEVELOPMENT_SECRET;
}

export function assertJwtSecretConfigured() {
  if (isProductionRuntime() && !process.env.JWT_ACCESS_SECRET) {
    throw new Error("JWT_ACCESS_SECRET environment variable is required in production.");
  }
}
