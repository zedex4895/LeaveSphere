import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    recipientRole: { type: String, enum: ["EMPLOYEE", "ADMIN", "ALL", null], default: null },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    type: {
      type: String,
      enum: [
        "REQUEST_SUBMITTED",
        "REQUEST_APPROVED",
        "REQUEST_REJECTED",
        "REQUEST_CANCELLED",
        "HOLIDAY_PUBLISHED",
        "SYSTEM"
      ],
      default: "SYSTEM"
    },
    relatedEntityId: { type: mongoose.Schema.Types.ObjectId },
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true, collection: "notifications" }
);

notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipientRole: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
