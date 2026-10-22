import jwt from "jsonwebtoken";
import { dataService } from "../services/dataService.js";

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || "leaveflow_jwt_secret_secure_key_2026_9876543210";

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication token missing or invalid format.",
          details: []
        }
      });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        error: {
          code: "TOKEN_EXPIRED",
          message: "Your session has expired. Please sign in again.",
          details: []
        }
      });
    }

    const user = await dataService.findUserById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: {
          code: "USER_INACTIVE",
          message: "User account is suspended or no longer exists.",
          details: []
        }
      });
    }

    req.user = {
      id: user._id ? user._id.toString() : user.id,
      name: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department
    };
    next();
  } catch (err) {
    next(err);
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: `Access denied. Requires one of: ${roles.join(", ")} role.`,
          details: []
        }
      });
    }
    next();
  };
}

export const requireAdmin = requireRole("ADMIN");
export const requireEmployee = requireRole("EMPLOYEE");
