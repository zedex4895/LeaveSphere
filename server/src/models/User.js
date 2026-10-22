import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["EMPLOYEE", "ADMIN"], default: "EMPLOYEE", required: true },
    department: { type: String, trim: true, maxlength: 120 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true, collection: "users" }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
