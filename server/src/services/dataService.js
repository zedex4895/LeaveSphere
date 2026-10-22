import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { isMongoConnected } from "../config/db.js";
import User from "../models/User.js";
import LeaveBalance from "../models/LeaveBalance.js";
import LeaveRequest from "../models/LeaveRequest.js";
import CompanyHoliday from "../models/CompanyHoliday.js";
import AuditLog from "../models/AuditLog.js";
import Notification from "../models/Notification.js";

// In-memory data store for fallback when MongoDB Atlas / local mongod is not running
const memoryStore = {
  users: [],
  leaveBalances: [],
  leaveRequests: [],
  companyHolidays: [],
  auditLogs: [],
  notifications: []
};

// Seed initial dataset
export async function seedInitialData() {
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const employeePasswordHash = await bcrypt.hash("employee123", 10);
  const generalPasswordHash = await bcrypt.hash("password123", 10);

  const initialUsers = [
    {
      _id: new mongoose.Types.ObjectId("6717a0000000000000000001"),
      fullName: "Priya Menon",
      email: "admin@example.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      department: "People & Operations",
      isActive: true,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z")
    },
    {
      _id: new mongoose.Types.ObjectId("6717a0000000000000000002"),
      fullName: "Asha Rao",
      email: "employee@example.com",
      passwordHash: employeePasswordHash,
      role: "EMPLOYEE",
      department: "Product Management",
      isActive: true,
      createdAt: new Date("2026-01-15T00:00:00.000Z"),
      updatedAt: new Date("2026-01-15T00:00:00.000Z")
    },
    {
      _id: new mongoose.Types.ObjectId("6717a0000000000000000003"),
      fullName: "Rahul Sharma",
      email: "rahul.sharma@example.com",
      passwordHash: generalPasswordHash,
      role: "EMPLOYEE",
      department: "Engineering",
      isActive: true,
      createdAt: new Date("2026-02-01T00:00:00.000Z"),
      updatedAt: new Date("2026-02-01T00:00:00.000Z")
    },
    {
      _id: new mongoose.Types.ObjectId("6717a0000000000000000004"),
      fullName: "Sneha Patel",
      email: "sneha.patel@example.com",
      passwordHash: generalPasswordHash,
      role: "EMPLOYEE",
      department: "Product Design",
      isActive: true,
      createdAt: new Date("2026-03-01T00:00:00.000Z"),
      updatedAt: new Date("2026-03-01T00:00:00.000Z")
    }
  ];

  const initialBalances = [
    // Asha Rao
    {
      _id: new mongoose.Types.ObjectId(),
      employeeId: initialUsers[1]._id,
      leaveType: "ANNUAL",
      entitlement: 18,
      usedDays: 4,
      reservedDays: 3, // 3 days pending for Nov 02 - Nov 04
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      employeeId: initialUsers[1]._id,
      leaveType: "SICK",
      entitlement: 10,
      usedDays: 2,
      reservedDays: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      employeeId: initialUsers[1]._id,
      leaveType: "PERSONAL",
      entitlement: 5,
      usedDays: 1,
      reservedDays: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      employeeId: initialUsers[1]._id,
      leaveType: "UNPAID",
      entitlement: 10,
      usedDays: 0,
      reservedDays: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    // Rahul Sharma
    {
      _id: new mongoose.Types.ObjectId(),
      employeeId: initialUsers[2]._id,
      leaveType: "ANNUAL",
      entitlement: 18,
      usedDays: 5,
      reservedDays: 3,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      employeeId: initialUsers[2]._id,
      leaveType: "SICK",
      entitlement: 10,
      usedDays: 1,
      reservedDays: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      employeeId: initialUsers[2]._id,
      leaveType: "PERSONAL",
      entitlement: 5,
      usedDays: 0,
      reservedDays: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      employeeId: initialUsers[2]._id,
      leaveType: "UNPAID",
      entitlement: 10,
      usedDays: 0,
      reservedDays: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    // Sneha Patel
    {
      _id: new mongoose.Types.ObjectId(),
      employeeId: initialUsers[3]._id,
      leaveType: "ANNUAL",
      entitlement: 18,
      usedDays: 2,
      reservedDays: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      employeeId: initialUsers[3]._id,
      leaveType: "SICK",
      entitlement: 10,
      usedDays: 0,
      reservedDays: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      employeeId: initialUsers[3]._id,
      leaveType: "PERSONAL",
      entitlement: 5,
      usedDays: 1,
      reservedDays: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      employeeId: initialUsers[3]._id,
      leaveType: "UNPAID",
      entitlement: 10,
      usedDays: 0,
      reservedDays: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const initialRequests = [
    {
      _id: new mongoose.Types.ObjectId("6717b0000000000000000001"),
      employeeId: initialUsers[1]._id,
      leaveType: "ANNUAL",
      startDate: new Date("2026-11-02T00:00:00.000Z"),
      endDate: new Date("2026-11-04T00:00:00.000Z"),
      requestedDays: 3,
      reason: "Family commitment & festive celebrations with relatives",
      handoverNotes: "Sprint tasks handed over to Rahul Sharma. Documentation updated in team wiki.",
      status: "PENDING",
      createdAt: new Date("2026-10-22T06:00:00.000Z"),
      updatedAt: new Date("2026-10-22T06:00:00.000Z")
    },
    {
      _id: new mongoose.Types.ObjectId("6717b0000000000000000002"),
      employeeId: initialUsers[1]._id,
      leaveType: "SICK",
      startDate: new Date("2026-10-10T00:00:00.000Z"),
      endDate: new Date("2026-10-11T00:00:00.000Z"),
      requestedDays: 2,
      reason: "Viral flu and doctor recommended rest",
      handoverNotes: "Urgent client emails redirected to Priya.",
      status: "APPROVED",
      reviewerId: initialUsers[0]._id,
      decisionNote: "Approved. Take care and get well soon.",
      decidedAt: new Date("2026-10-09T14:30:00.000Z"),
      createdAt: new Date("2026-10-09T08:00:00.000Z"),
      updatedAt: new Date("2026-10-09T14:30:00.000Z")
    },
    {
      _id: new mongoose.Types.ObjectId("6717b0000000000000000003"),
      employeeId: initialUsers[1]._id,
      leaveType: "PERSONAL",
      startDate: new Date("2026-09-18T00:00:00.000Z"),
      endDate: new Date("2026-09-18T00:00:00.000Z"),
      requestedDays: 1,
      reason: "Personal banking and document renewal appointments",
      handoverNotes: "Available on Slack for emergency escalations.",
      status: "APPROVED",
      reviewerId: initialUsers[0]._id,
      decisionNote: "Approved.",
      decidedAt: new Date("2026-09-15T11:00:00.000Z"),
      createdAt: new Date("2026-09-14T09:00:00.000Z"),
      updatedAt: new Date("2026-09-15T11:00:00.000Z")
    },
    {
      _id: new mongoose.Types.ObjectId("6717b0000000000000000004"),
      employeeId: initialUsers[1]._id,
      leaveType: "ANNUAL",
      startDate: new Date("2026-08-04T00:00:00.000Z"),
      endDate: new Date("2026-08-05T00:00:00.000Z"),
      requestedDays: 2,
      reason: "Weekend trip extension",
      handoverNotes: "None",
      status: "REJECTED",
      reviewerId: initialUsers[0]._id,
      decisionNote: "Please coordinate coverage during product launch week before reapplying.",
      decidedAt: new Date("2026-08-01T16:00:00.000Z"),
      createdAt: new Date("2026-07-31T10:00:00.000Z"),
      updatedAt: new Date("2026-08-01T16:00:00.000Z")
    },
    {
      _id: new mongoose.Types.ObjectId("6717b0000000000000000005"),
      employeeId: initialUsers[2]._id,
      leaveType: "ANNUAL",
      startDate: new Date("2026-11-10T00:00:00.000Z"),
      endDate: new Date("2026-11-12T00:00:00.000Z"),
      requestedDays: 3,
      reason: "Attending annual engineering architecture summit",
      handoverNotes: "PR reviews assigned to backup engineer.",
      status: "PENDING",
      createdAt: new Date("2026-10-21T11:00:00.000Z"),
      updatedAt: new Date("2026-10-21T11:00:00.000Z")
    },
    {
      _id: new mongoose.Types.ObjectId("6717b0000000000000000006"),
      employeeId: initialUsers[3]._id,
      leaveType: "PERSONAL",
      startDate: new Date("2026-11-05T00:00:00.000Z"),
      endDate: new Date("2026-11-05T00:00:00.000Z"),
      requestedDays: 1,
      reason: "Medical checkup appointment",
      handoverNotes: "Design Figma links shared in the design channel.",
      status: "PENDING",
      createdAt: new Date("2026-10-22T08:30:00.000Z"),
      updatedAt: new Date("2026-10-22T08:30:00.000Z")
    }
  ];

  const initialHolidays = [
    {
      _id: new mongoose.Types.ObjectId(),
      name: "Gandhi Jayanti",
      date: new Date("2026-10-02T00:00:00.000Z"),
      type: "PUBLIC_HOLIDAY",
      notes: "Company-wide national holiday",
      isPublished: true,
      createdBy: initialUsers[0]._id,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      name: "Kannada Rajyotsava",
      date: new Date("2026-11-01T00:00:00.000Z"),
      type: "PUBLIC_HOLIDAY",
      notes: "State holiday; confirm office calendar",
      isPublished: true,
      createdBy: initialUsers[0]._id,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      name: "Christmas Day",
      date: new Date("2026-12-25T00:00:00.000Z"),
      type: "COMPANY_GRANTED_LEAVE",
      notes: "Office closed for festive season",
      isPublished: true,
      createdBy: initialUsers[0]._id,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      name: "Year-end Shutdown",
      date: new Date("2026-12-31T00:00:00.000Z"),
      type: "COMPANY_GRANTED_LEAVE",
      notes: "Company-wide annual recharge day",
      isPublished: true,
      createdBy: initialUsers[0]._id,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const initialAuditLogs = [
    {
      _id: new mongoose.Types.ObjectId(),
      actorId: initialUsers[0]._id,
      action: "LEAVE_APPROVAL",
      entityType: "LEAVE_REQUEST",
      entityId: initialRequests[1]._id,
      metadata: {
        employeeName: "Asha Rao",
        leaveType: "SICK",
        days: 2,
        decisionNote: "Approved. Take care and get well soon."
      },
      createdAt: new Date("2026-10-09T14:30:00.000Z")
    },
    {
      _id: new mongoose.Types.ObjectId(),
      actorId: initialUsers[0]._id,
      action: "LEAVE_REJECTION",
      entityType: "LEAVE_REQUEST",
      entityId: initialRequests[3]._id,
      metadata: {
        employeeName: "Asha Rao",
        leaveType: "ANNUAL",
        days: 2,
        decisionNote: "Please coordinate coverage during product launch week before reapplying."
      },
      createdAt: new Date("2026-08-01T16:00:00.000Z")
    },
    {
      _id: new mongoose.Types.ObjectId(),
      actorId: initialUsers[0]._id,
      action: "HOLIDAY_IMPORT",
      entityType: "COMPANY_HOLIDAY",
      entityId: initialHolidays[0]._id,
      metadata: { count: 4, source: "company-holidays.example.json" },
      createdAt: new Date("2026-10-01T09:00:00.000Z")
    }
  ];

  const initialNotifications = [
    {
      _id: new mongoose.Types.ObjectId(),
      recipientId: initialUsers[0]._id,
      recipientRole: "ADMIN",
      title: "New Leave Application",
      message: "Asha Rao (Product) submitted a 3-day Annual leave request (Nov 02 to Nov 04) awaiting review.",
      type: "REQUEST_SUBMITTED",
      relatedEntityId: initialRequests[0]._id,
      isRead: false,
      createdAt: new Date("2026-10-22T06:00:00.000Z")
    },
    {
      _id: new mongoose.Types.ObjectId(),
      recipientId: initialUsers[0]._id,
      recipientRole: "ADMIN",
      title: "New Leave Application",
      message: "Rahul Sharma (Engineering) submitted a 3-day Annual leave request (Nov 10 to Nov 12) awaiting review.",
      type: "REQUEST_SUBMITTED",
      relatedEntityId: initialRequests[4]._id,
      isRead: false,
      createdAt: new Date("2026-10-21T11:00:00.000Z")
    },
    {
      _id: new mongoose.Types.ObjectId(),
      recipientId: initialUsers[1]._id,
      recipientRole: "EMPLOYEE",
      title: "Leave Request Approved",
      message: "Your 2-day Sick leave (Oct 10 to Oct 11) was approved by Priya Menon: 'Approved. Take care and get well soon.'",
      type: "REQUEST_APPROVED",
      relatedEntityId: initialRequests[1]._id,
      isRead: false,
      createdAt: new Date("2026-10-09T14:30:00.000Z")
    },
    {
      _id: new mongoose.Types.ObjectId(),
      recipientId: initialUsers[1]._id,
      recipientRole: "EMPLOYEE",
      title: "Leave Request Decision",
      message: "Your 2-day Annual leave request (Aug 04 to Aug 05) was reviewed by Priya Menon: 'Please coordinate coverage during product launch week before reapplying.'",
      type: "REQUEST_REJECTED",
      relatedEntityId: initialRequests[3]._id,
      isRead: true,
      createdAt: new Date("2026-08-01T16:00:00.000Z")
    },
    {
      _id: new mongoose.Types.ObjectId(),
      recipientRole: "ALL",
      title: "2026 Company Holiday Calendar Published",
      message: "The official list of declared non-working holidays has been published. Check Company Holidays to plan your time off.",
      type: "HOLIDAY_PUBLISHED",
      isRead: false,
      createdAt: new Date("2026-10-01T09:00:00.000Z")
    }
  ];

  // Populate memory store
  memoryStore.users = initialUsers;
  memoryStore.leaveBalances = initialBalances;
  memoryStore.leaveRequests = initialRequests;
  memoryStore.companyHolidays = initialHolidays;
  memoryStore.auditLogs = initialAuditLogs;
  memoryStore.notifications = initialNotifications;

  // If MongoDB is actively connected, ensure documents exist in the collections
  if (isMongoConnected()) {
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log("[Seed] Seeding users into MongoDB Atlas...");
        await User.insertMany(initialUsers);
      }

      const balCount = await LeaveBalance.countDocuments();
      if (balCount === 0) {
        console.log("[Seed] Seeding leave balances into MongoDB Atlas...");
        await LeaveBalance.insertMany(initialBalances);
      }

      const reqCount = await LeaveRequest.countDocuments();
      if (reqCount === 0) {
        console.log("[Seed] Seeding leave requests into MongoDB Atlas...");
        await LeaveRequest.insertMany(initialRequests);
      }

      const holCount = await CompanyHoliday.countDocuments();
      if (holCount === 0) {
        console.log("[Seed] Seeding company holidays into MongoDB Atlas...");
        await CompanyHoliday.insertMany(initialHolidays);
      }

      const logCount = await AuditLog.countDocuments();
      if (logCount === 0) {
        console.log("[Seed] Seeding audit logs into MongoDB Atlas...");
        await AuditLog.insertMany(initialAuditLogs);
      }

      const notifCount = await Notification.countDocuments();
      if (notifCount === 0) {
        console.log("[Seed] Seeding notifications into MongoDB Atlas...");
        await Notification.insertMany(initialNotifications);
      }

      console.log("[Seed] MongoDB Atlas database successfully initialized with demo records.");
    } catch (err) {
      console.error("[Seed] Error synchronizing seed to MongoDB:", err.message);
    }
  }
}

// Data Access Methods
export const dataService = {
  // Users
  async findUserByEmail(email, includePassword = false) {
    const normalized = email.trim().toLowerCase();
    if (isMongoConnected()) {
      const query = User.findOne({ email: normalized });
      if (includePassword) query.select("+passwordHash");
      return await query.exec();
    }
    const user = memoryStore.users.find(u => u.email.toLowerCase() === normalized);
    if (!user) return null;
    const copy = { ...user, id: user._id.toString() };
    if (!includePassword) delete copy.passwordHash;
    return copy;
  },

  async findUserById(id, includePassword = false) {
    const idStr = id.toString();
    if (isMongoConnected()) {
      const query = User.findById(id);
      if (includePassword) query.select("+passwordHash");
      return await query.exec();
    }
    const user = memoryStore.users.find(u => u._id.toString() === idStr);
    if (!user) return null;
    const copy = { ...user, id: user._id.toString() };
    if (!includePassword) delete copy.passwordHash;
    return copy;
  },

  async listEmployees() {
    if (isMongoConnected()) {
      return await User.find({ role: "EMPLOYEE", isActive: true }).select("-passwordHash").lean();
    }
    return memoryStore.users
      .filter(u => u.role === "EMPLOYEE" && u.isActive)
      .map(u => {
        const copy = { ...u, id: u._id.toString() };
        delete copy.passwordHash;
        return copy;
      });
  },

  // Leave Balances
  async getEmployeeBalances(employeeId) {
    const empIdStr = employeeId.toString();
    if (isMongoConnected()) {
      const balances = await LeaveBalance.find({ employeeId }).lean();
      return balances.map(b => ({
        leaveType: b.leaveType,
        entitlement: b.entitlement,
        used: b.usedDays,
        pending: b.reservedDays,
        available: Math.max(0, b.entitlement - b.usedDays - b.reservedDays)
      }));
    }
    const balances = memoryStore.leaveBalances.filter(b => b.employeeId.toString() === empIdStr);
    return balances.map(b => ({
      leaveType: b.leaveType,
      entitlement: b.entitlement,
      used: b.usedDays,
      pending: b.reservedDays,
      available: Math.max(0, b.entitlement - b.usedDays - b.reservedDays)
    }));
  },

  async getBalanceRecord(employeeId, leaveType) {
    const empIdStr = employeeId.toString();
    if (isMongoConnected()) {
      return await LeaveBalance.findOne({ employeeId, leaveType });
    }
    return memoryStore.leaveBalances.find(
      b => b.employeeId.toString() === empIdStr && b.leaveType === leaveType
    );
  },

  async updateBalanceRecord(employeeId, leaveType, updateFields) {
    const empIdStr = employeeId.toString();
    if (isMongoConnected()) {
      return await LeaveBalance.findOneAndUpdate(
        { employeeId, leaveType },
        { $set: updateFields },
        { new: true }
      );
    }
    const rec = memoryStore.leaveBalances.find(
      b => b.employeeId.toString() === empIdStr && b.leaveType === leaveType
    );
    if (rec) {
      Object.assign(rec, updateFields, { updatedAt: new Date() });
    }
    return rec;
  },

  // Leave Requests
  async createLeaveRequest(requestData) {
    if (isMongoConnected()) {
      const doc = new LeaveRequest(requestData);
      return await doc.save();
    }
    const newDoc = {
      _id: new mongoose.Types.ObjectId(),
      status: "PENDING",
      createdAt: new Date(),
      updatedAt: new Date(),
      ...requestData,
      employeeId: new mongoose.Types.ObjectId(requestData.employeeId)
    };
    memoryStore.leaveRequests.unshift(newDoc);
    return newDoc;
  },

  async getLeaveRequestById(id) {
    const idStr = id.toString();
    if (isMongoConnected()) {
      return await LeaveRequest.findById(id).populate("employeeId", "fullName email department").populate("reviewerId", "fullName email").lean();
    }
    const req = memoryStore.leaveRequests.find(r => r._id.toString() === idStr);
    if (!req) return null;
    const emp = memoryStore.users.find(u => u._id.toString() === req.employeeId.toString());
    const rev = req.reviewerId ? memoryStore.users.find(u => u._id.toString() === req.reviewerId.toString()) : null;
    return {
      ...req,
      id: req._id.toString(),
      employeeId: emp ? { id: emp._id.toString(), fullName: emp.fullName, email: emp.email, department: emp.department } : req.employeeId,
      reviewerId: rev ? { id: rev._id.toString(), fullName: rev.fullName, email: rev.email } : null
    };
  },

  async listLeaveRequests({ employeeId, status, leaveType, from, to, page = 1, limit = 20 }) {
    const filter = {};
    if (employeeId) filter.employeeId = employeeId;
    if (status) filter.status = status;
    if (leaveType) filter.leaveType = leaveType;
    if (from || to) {
      filter.startDate = {};
      if (from) filter.startDate.$gte = new Date(from);
      if (to) filter.startDate.$lte = new Date(to);
    }

    if (isMongoConnected()) {
      const skip = (page - 1) * limit;
      const [items, total] = await Promise.all([
        LeaveRequest.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate("employeeId", "fullName email department")
          .populate("reviewerId", "fullName email")
          .lean(),
        LeaveRequest.countDocuments(filter)
      ]);
      return {
        items: items.map(formatRequestResponse),
        page: Number(page),
        limit: Number(limit),
        total
      };
    }

    // In-memory filter
    let results = [...memoryStore.leaveRequests];
    if (employeeId) {
      const empStr = employeeId.toString();
      results = results.filter(r => r.employeeId.toString() === empStr);
    }
    if (status) {
      results = results.filter(r => r.status === status);
    }
    if (leaveType) {
      results = results.filter(r => r.leaveType === leaveType);
    }
    if (from) {
      const fromDate = new Date(from);
      results = results.filter(r => new Date(r.startDate) >= fromDate);
    }
    if (to) {
      const toDate = new Date(to);
      results = results.filter(r => new Date(r.startDate) <= toDate);
    }

    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const total = results.length;
    const skip = (page - 1) * limit;
    const paginated = results.slice(skip, skip + limit);

    const formatted = paginated.map(r => {
      const emp = memoryStore.users.find(u => u._id.toString() === r.employeeId.toString());
      const rev = r.reviewerId ? memoryStore.users.find(u => u._id.toString() === r.reviewerId.toString()) : null;
      return formatRequestResponse({
        ...r,
        employeeId: emp ? { _id: emp._id, fullName: emp.fullName, email: emp.email, department: emp.department } : r.employeeId,
        reviewerId: rev ? { _id: rev._id, fullName: rev.fullName, email: rev.email } : null
      });
    });

    return {
      items: formatted,
      page: Number(page),
      limit: Number(limit),
      total
    };
  },

  async checkOverlap(employeeId, startDate, endDate, excludeId = null) {
    const s = new Date(startDate);
    const e = new Date(endDate);
    const empIdStr = employeeId.toString();
    const excludeStr = excludeId ? excludeId.toString() : null;

    if (isMongoConnected()) {
      const query = {
        employeeId,
        status: { $in: ["PENDING", "APPROVED"] },
        $or: [
          { startDate: { $lte: e }, endDate: { $gte: s } }
        ]
      };
      if (excludeId) query._id = { $ne: excludeId };
      const count = await LeaveRequest.countDocuments(query);
      return count > 0;
    }

    return memoryStore.leaveRequests.some(r => {
      if (r.employeeId.toString() !== empIdStr) return false;
      if (excludeStr && r._id.toString() === excludeStr) return false;
      if (r.status !== "PENDING" && r.status !== "APPROVED") return false;
      const rStart = new Date(r.startDate);
      const rEnd = new Date(r.endDate);
      return rStart <= e && rEnd >= s;
    });
  },

  async updateLeaveRequest(id, updateFields) {
    const idStr = id.toString();
    if (isMongoConnected()) {
      return await LeaveRequest.findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true }
      ).populate("employeeId", "fullName email department").populate("reviewerId", "fullName email").lean();
    }
    const idx = memoryStore.leaveRequests.findIndex(r => r._id.toString() === idStr);
    if (idx === -1) return null;
    const updated = {
      ...memoryStore.leaveRequests[idx],
      ...updateFields,
      updatedAt: new Date()
    };
    memoryStore.leaveRequests[idx] = updated;
    const emp = memoryStore.users.find(u => u._id.toString() === updated.employeeId.toString());
    const rev = updated.reviewerId ? memoryStore.users.find(u => u._id.toString() === updated.reviewerId.toString()) : null;
    return {
      ...updated,
      employeeId: emp ? { _id: emp._id, fullName: emp.fullName, email: emp.email, department: emp.department } : updated.employeeId,
      reviewerId: rev ? { _id: rev._id, fullName: rev.fullName, email: rev.email } : null
    };
  },

  // Admin Dashboard Metrics
  async getDashboardMetrics() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (isMongoConnected()) {
      const [pendingApprovals, approvedThisMonth, rejectedThisMonth, employeesOnLeaveToday] = await Promise.all([
        LeaveRequest.countDocuments({ status: "PENDING" }),
        LeaveRequest.countDocuments({
          status: "APPROVED",
          decidedAt: { $gte: firstDayOfMonth }
        }),
        LeaveRequest.countDocuments({
          status: "REJECTED",
          decidedAt: { $gte: firstDayOfMonth }
        }),
        LeaveRequest.countDocuments({
          status: "APPROVED",
          startDate: { $lte: endOfToday },
          endDate: { $gte: startOfToday }
        })
      ]);

      return {
        pendingApprovals,
        approvedThisMonth,
        rejectedThisMonth,
        employeesOnLeaveToday
      };
    }

    const pendingApprovals = memoryStore.leaveRequests.filter(r => r.status === "PENDING").length;
    const approvedThisMonth = memoryStore.leaveRequests.filter(
      r => r.status === "APPROVED" && r.decidedAt && new Date(r.decidedAt) >= firstDayOfMonth
    ).length;
    const rejectedThisMonth = memoryStore.leaveRequests.filter(
      r => r.status === "REJECTED" && r.decidedAt && new Date(r.decidedAt) >= firstDayOfMonth
    ).length;
    const employeesOnLeaveToday = memoryStore.leaveRequests.filter(
      r => r.status === "APPROVED" && new Date(r.startDate) <= endOfToday && new Date(r.endDate) >= startOfToday
    ).length;

    return {
      pendingApprovals,
      approvedThisMonth,
      rejectedThisMonth,
      employeesOnLeaveToday
    };
  },

  // Company Holidays
  async listCompanyHolidays({ from, to }) {
    if (isMongoConnected()) {
      const filter = { isPublished: true };
      if (from || to) {
        filter.date = {};
        if (from) filter.date.$gte = new Date(from);
        if (to) filter.date.$lte = new Date(to);
      }
      return await CompanyHoliday.find(filter).sort({ date: 1 }).lean();
    }
    let list = memoryStore.companyHolidays.filter(h => h.isPublished);
    if (from) {
      const f = new Date(from);
      list = list.filter(h => new Date(h.date) >= f);
    }
    if (to) {
      const t = new Date(to);
      list = list.filter(h => new Date(h.date) <= t);
    }
    list.sort((a, b) => new Date(a.date) - new Date(b.date));
    return list;
  },

  async importCompanyHolidays(holidays, adminId) {
    let imported = 0;
    let skipped = 0;
    const errors = [];

    for (const h of holidays) {
      const formattedDate = new Date(h.date);
      if (isNaN(formattedDate.getTime())) {
        errors.push({ name: h.name, error: "Invalid date format" });
        continue;
      }

      if (isMongoConnected()) {
        try {
          const res = await CompanyHoliday.findOneAndUpdate(
            { name: h.name, date: formattedDate },
            {
              $set: {
                type: h.type || "PUBLIC_HOLIDAY",
                notes: h.notes || "",
                isPublished: true,
                createdBy: adminId
              }
            },
            { upsert: true, new: true }
          );
          if (res) imported++;
        } catch (e) {
          skipped++;
          errors.push({ name: h.name, error: e.message });
        }
      } else {
        const existingIdx = memoryStore.companyHolidays.findIndex(
          item => item.name === h.name && new Date(item.date).toISOString().slice(0, 10) === h.date
        );
        if (existingIdx !== -1) {
          memoryStore.companyHolidays[existingIdx] = {
            ...memoryStore.companyHolidays[existingIdx],
            type: h.type || "PUBLIC_HOLIDAY",
            notes: h.notes || "",
            isPublished: true,
            updatedAt: new Date()
          };
          skipped++;
        } else {
          memoryStore.companyHolidays.push({
            _id: new mongoose.Types.ObjectId(),
            name: h.name,
            date: formattedDate,
            type: h.type || "PUBLIC_HOLIDAY",
            notes: h.notes || "",
            isPublished: true,
            createdBy: adminId,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          imported++;
        }
      }
    }

    return { imported, skipped, errors };
  },

  // Audit Logs
  async createAuditLog({ actorId, action, entityType, entityId, metadata = {} }) {
    const entry = {
      _id: new mongoose.Types.ObjectId(),
      actorId,
      action,
      entityType,
      entityId,
      metadata,
      createdAt: new Date()
    };
    if (isMongoConnected()) {
      try {
        await AuditLog.create(entry);
      } catch (err) {
        console.error("Audit log error:", err.message);
      }
    } else {
      memoryStore.auditLogs.unshift(entry);
    }
  },

  async listAuditLogs(limit = 50) {
    if (isMongoConnected()) {
      return await AuditLog.find().sort({ createdAt: -1 }).limit(limit).populate("actorId", "fullName email role").lean();
    }
    return memoryStore.auditLogs.slice(0, limit).map(log => {
      const actor = memoryStore.users.find(u => u._id.toString() === log.actorId?.toString());
      return {
        ...log,
        id: log._id.toString(),
        actorId: actor ? { id: actor._id.toString(), fullName: actor.fullName, email: actor.email, role: actor.role } : null
      };
    });
  },

  // Notifications
  async createNotification({ recipientId, recipientRole = null, title, message, type = "SYSTEM", relatedEntityId }) {
    const entry = {
      _id: new mongoose.Types.ObjectId(),
      recipientId: recipientId ? new mongoose.Types.ObjectId(recipientId) : null,
      recipientRole: recipientRole || (recipientId ? null : "ALL"),
      title,
      message,
      type,
      relatedEntityId: relatedEntityId ? new mongoose.Types.ObjectId(relatedEntityId) : null,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (isMongoConnected()) {
      try {
        const created = await Notification.create(entry);
        return created;
      } catch (err) {
        console.error("Create notification MongoDB error:", err.message);
      }
    }
    memoryStore.notifications.unshift(entry);
    return entry;
  },

  async listNotifications({ userId, role, limit = 50 }) {
    if (isMongoConnected()) {
      const uId = userId ? new mongoose.Types.ObjectId(userId) : null;
      let query;
      if (role === "ADMIN") {
        query = {
          $or: [
            ...(uId ? [{ recipientId: uId }] : []),
            { recipientRole: { $in: ["ADMIN", "ALL"] } }
          ]
        };
      } else {
        // For EMPLOYEE: strictly only personal notifications targeted to this specific user,
        // OR general announcements that have NO specific recipientId
        query = {
          $or: [
            ...(uId ? [{ recipientId: uId }] : []),
            {
              $and: [
                { $or: [{ recipientId: null }, { recipientId: { $exists: false } }] },
                { recipientRole: { $in: ["EMPLOYEE", "ALL"] } }
              ]
            }
          ]
        };
      }
      const items = await Notification.find(query).sort({ createdAt: -1 }).limit(limit).lean();
      return items.map(n => ({
        id: n._id.toString(),
        recipientId: n.recipientId ? n.recipientId.toString() : null,
        recipientRole: n.recipientRole,
        title: n.title,
        message: n.message,
        type: n.type,
        relatedEntityId: n.relatedEntityId ? n.relatedEntityId.toString() : null,
        isRead: Boolean(n.isRead),
        createdAt: n.createdAt
      }));
    }

    const uStr = userId ? userId.toString() : "";
    const filtered = memoryStore.notifications.filter(n => {
      const nRecId = n.recipientId ? n.recipientId.toString() : "";
      if (role === "ADMIN") {
        return n.recipientRole === "ADMIN" || n.recipientRole === "ALL" || (uStr && nRecId === uStr);
      }
      // For EMPLOYEE:
      // If notification has a specific recipientId, ONLY that recipient can see it!
      if (nRecId) {
        return Boolean(uStr && nRecId === uStr);
      }
      // Only notifications with no recipientId and role EMPLOYEE/ALL are broadcast
      return n.recipientRole === "EMPLOYEE" || n.recipientRole === "ALL";
    });

    return filtered.slice(0, limit).map(n => ({
      id: n._id.toString(),
      recipientId: n.recipientId ? n.recipientId.toString() : null,
      recipientRole: n.recipientRole,
      title: n.title,
      message: n.message,
      type: n.type,
      relatedEntityId: n.relatedEntityId ? n.relatedEntityId.toString() : null,
      isRead: Boolean(n.isRead),
      createdAt: n.createdAt
    }));
  },

  async markNotificationAsRead(id, userId) {
    if (isMongoConnected()) {
      await Notification.updateOne({ _id: new mongoose.Types.ObjectId(id) }, { $set: { isRead: true } });
      return true;
    }
    const notif = memoryStore.notifications.find(n => n._id.toString() === id.toString());
    if (notif) notif.isRead = true;
    return true;
  },

  async markAllNotificationsAsRead(userId, role) {
    if (isMongoConnected()) {
      const uId = userId ? new mongoose.Types.ObjectId(userId) : null;
      let query;
      if (role === "ADMIN") {
        query = {
          $or: [
            ...(uId ? [{ recipientId: uId }] : []),
            { recipientRole: { $in: ["ADMIN", "ALL"] } }
          ]
        };
      } else {
        query = {
          $or: [
            ...(uId ? [{ recipientId: uId }] : []),
            {
              $and: [
                { $or: [{ recipientId: null }, { recipientId: { $exists: false } }] },
                { recipientRole: { $in: ["EMPLOYEE", "ALL"] } }
              ]
            }
          ]
        };
      }
      await Notification.updateMany(query, { $set: { isRead: true } });
      return true;
    }

    const uStr = userId ? userId.toString() : "";
    memoryStore.notifications.forEach(n => {
      const nRecId = n.recipientId ? n.recipientId.toString() : "";
      if (role === "ADMIN") {
        if (n.recipientRole === "ADMIN" || n.recipientRole === "ALL" || (uStr && nRecId === uStr)) {
          n.isRead = true;
        }
      } else {
        if (nRecId) {
          if (uStr && nRecId === uStr) n.isRead = true;
        } else if (n.recipientRole === "EMPLOYEE" || n.recipientRole === "ALL") {
          n.isRead = true;
        }
      }
    });
    return true;
  }
};

function formatRequestResponse(r) {
  const emp = r.employeeId;
  const rev = r.reviewerId;
  return {
    id: r._id ? r._id.toString() : r.id,
    employee: emp ? {
      id: emp._id ? emp._id.toString() : emp.id,
      name: emp.fullName || emp.name,
      email: emp.email,
      department: emp.department
    } : null,
    leaveType: r.leaveType,
    startDate: r.startDate instanceof Date ? r.startDate.toISOString().slice(0, 10) : String(r.startDate).slice(0, 10),
    endDate: r.endDate instanceof Date ? r.endDate.toISOString().slice(0, 10) : String(r.endDate).slice(0, 10),
    requestedDays: r.requestedDays,
    reason: r.reason,
    handoverNotes: r.handoverNotes,
    status: r.status,
    reviewer: rev ? {
      id: rev._id ? rev._id.toString() : rev.id,
      name: rev.fullName || rev.name,
      email: rev.email
    } : null,
    decisionNote: r.decisionNote,
    decidedAt: r.decidedAt,
    submittedAt: r.createdAt,
    createdAt: r.createdAt
  };
}
