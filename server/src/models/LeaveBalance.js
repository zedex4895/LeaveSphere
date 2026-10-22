import mongoose from "mongoose";

const leaveBalanceSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    leaveType: { type: String, enum: ["ANNUAL", "SICK", "PERSONAL", "UNPAID"], required: true },
    entitlement: { type: Number, required: true, min: 0, default: 0 },
    usedDays: { type: Number, min: 0, default: 0 },
    reservedDays: { type: Number, min: 0, default: 0 }
  },
  { timestamps: true, collection: "leavebalances" }
);

leaveBalanceSchema.index({ employeeId: 1, leaveType: 1 }, { unique: true });

export default mongoose.models.LeaveBalance || mongoose.model("LeaveBalance", leaveBalanceSchema);
