import mongoose from "mongoose";

const leaveRequestSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    leaveType: { type: String, enum: ["ANNUAL", "SICK", "PERSONAL", "UNPAID"], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    requestedDays: { type: Number, required: true, min: 0.5 },
    reason: { type: String, required: true, trim: true, maxlength: 2000 },
    handoverNotes: { type: String, trim: true, maxlength: 2000 },
    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"], default: "PENDING", index: true },
    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    decisionNote: { type: String, trim: true, maxlength: 2000 },
    decidedAt: { type: Date }
  },
  { timestamps: true, collection: "leaverequests" }
);

leaveRequestSchema.index({ employeeId: 1, createdAt: -1 });
leaveRequestSchema.index({ status: 1, createdAt: -1 });
leaveRequestSchema.index({ startDate: 1, endDate: 1 });

leaveRequestSchema.pre("validate", function validateDateRange(next) {
  if (this.startDate && this.endDate && this.startDate > this.endDate) {
    this.invalidate("endDate", "endDate must be on or after startDate");
  }
  if (typeof next === "function") {
    next();
  }
});

export default mongoose.models.LeaveRequest || mongoose.model("LeaveRequest", leaveRequestSchema);
