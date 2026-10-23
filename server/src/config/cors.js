const DEFAULT_ALLOWED_ORIGINS = [
  "https://leavesphere-five.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];

const ALLOWED_METHODS = "GET, POST, PUT, PATCH, DELETE, OPTIONS";
const ALLOWED_HEADERS = "Content-Type, Authorization";

export function getAllowedOrigins() {
  const extra = (process.env.CLIENT_ORIGIN || "")
    .split(",")
    .map((value) => value.trim().replace(/\/$/, ""))
    .filter(Boolean);

  return new Set([...DEFAULT_ALLOWED_ORIGINS, ...extra]);
}

export function applyCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (origin && getAllowedOrigins().has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", ALLOWED_METHODS);
    res.setHeader("Access-Control-Allow-Headers", ALLOWED_HEADERS);
    res.setHeader("Access-Control-Max-Age", "86400");
    res.setHeader("Vary", "Origin");
  }
}

export const corsOptions = {
  origin(origin, callback) {
    if (!origin || getAllowedOrigins().has(origin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400,
  optionsSuccessStatus: 204
};
