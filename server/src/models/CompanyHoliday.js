import mongoose from "mongoose";

const companyHolidaySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    date: { type: Date, required: true },
    type: {
      type: String,
      enum: ["PUBLIC_HOLIDAY", "COMPANY_GRANTED_LEAVE", "OPTIONAL_HOLIDAY"],
      default: "PUBLIC_HOLIDAY",
      required: true
    },
    notes: { type: String, trim: true, maxlength: 1000 },
    isPublished: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true, collection: "companyholidays" }
);

companyHolidaySchema.index({ name: 1, date: 1 }, { unique: true });
companyHolidaySchema.index({ date: 1, isPublished: 1 });

export default mongoose.models.CompanyHoliday || mongoose.model("CompanyHoliday", companyHolidaySchema);
