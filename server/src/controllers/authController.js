import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { dataService } from "../services/dataService.js";

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || "leaveflow_jwt_secret_secure_key_2026_9876543210";
const JWT_EXPIRES_IN = process.env.JWT_ACCESS_TTL || "7d";

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Email and password are required.",
          details: [
            ...(!email ? [{ field: "email", message: "Email is required." }] : []),
            ...(!password ? [{ field: "password", message: "Password is required." }] : [])
          ]
        }
      });
    }

    const user = await dataService.findUserByEmail(email, true);
    if (!user) {
      return res.status(401).json({
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password.",
          details: []
        }
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password.",
          details: []
        }
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        error: {
          code: "ACCOUNT_DEACTIVATED",
          message: "This account has been deactivated. Please contact your administrator.",
          details: []
        }
      });
    }

    const userId = user._id ? user._id.toString() : user.id;
    const token = jwt.sign(
      { id: userId, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      user: {
        id: userId,
        name: user.fullName,
        email: user.email,
        role: user.role,
        department: user.department
      },
      accessToken: token
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  // Stateless JWT or session invalidation confirmation
  res.status(204).send();
}

export async function getMe(req, res) {
  res.json({
    user: req.user
  });
}
