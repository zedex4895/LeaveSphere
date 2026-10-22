import { dataService } from "../services/dataService.js";

export async function getDashboard(req, res, next) {
  try {
    const metrics = await dataService.getDashboardMetrics();
    res.json(metrics);
  } catch (err) {
    next(err);
  }
}

export async function decideLeaveRequest(req, res, next) {
  try {
    const { id } = req.params;
    const { decision, decisionNote } = req.body;

    if (!decision || !["APPROVED", "REJECTED"].includes(decision)) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "decision must be either APPROVED or REJECTED.",
          details: [{ field: "decision", message: "Allowed values: APPROVED, REJECTED." }]
        }
      });
    }

    const request = await dataService.getLeaveRequestById(id);
    if (!request) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Leave request not found.",
          details: []
        }
      });
    }

    if (request.status !== "PENDING") {
      return res.status(409).json({
        error: {
          code: "STATE_CONFLICT",
          message: `This request has already been ${request.status.toLowerCase()} and cannot be modified.`,
          details: []
        }
      });
    }

    const employeeId = request.employeeId?._id ? request.employeeId._id.toString() : (request.employeeId?.id || request.employeeId?.toString());
    const balanceRecord = await dataService.getBalanceRecord(employeeId, request.leaveType);

    if (decision === "APPROVED") {
      // Transition from reserved to used
      if (balanceRecord) {
        const newReserved = Math.max(0, (balanceRecord.reservedDays || 0) - request.requestedDays);
        const newUsed = (balanceRecord.usedDays || 0) + request.requestedDays;
        await dataService.updateBalanceRecord(employeeId, request.leaveType, {
          reservedDays: newReserved,
          usedDays: newUsed
        });
      }

      const updated = await dataService.updateLeaveRequest(id, {
        status: "APPROVED",
        reviewerId: req.user.id,
        decisionNote: decisionNote ? decisionNote.trim() : "Approved.",
        decidedAt: new Date()
      });

      await dataService.createAuditLog({
        actorId: req.user.id,
        action: "LEAVE_APPROVAL",
        entityType: "LEAVE_REQUEST",
        entityId: id,
        metadata: {
          employeeId,
          leaveType: request.leaveType,
          requestedDays: request.requestedDays,
          decisionNote
        }
      });

      // Notify the Employee
      try {
        const reviewer = await dataService.findUserById(req.user.id);
        const reviewerName = reviewer ? reviewer.fullName : "Admin";
        const startDateStr = request.startDate instanceof Date ? request.startDate.toISOString().slice(0, 10) : String(request.startDate).slice(0, 10);
        const endDateStr = request.endDate instanceof Date ? request.endDate.toISOString().slice(0, 10) : String(request.endDate).slice(0, 10);
        const noteText = decisionNote ? ` Note: "${decisionNote.trim()}"` : "";
        await dataService.createNotification({
          recipientId: employeeId,
          recipientRole: null,
          title: "Leave Request Approved",
          message: `Your ${request.requestedDays}-day ${request.leaveType} leave request (${startDateStr} to ${endDateStr}) was approved by ${reviewerName}.${noteText}`,
          type: "REQUEST_APPROVED",
          relatedEntityId: id
        });
      } catch (notifErr) {
        console.error("Failed to create employee approval notification:", notifErr);
      }

      return res.json(updated);
    } else {
      // REJECTED - release reserved days back to available
      if (balanceRecord) {
        const newReserved = Math.max(0, (balanceRecord.reservedDays || 0) - request.requestedDays);
        await dataService.updateBalanceRecord(employeeId, request.leaveType, {
          reservedDays: newReserved
        });
      }

      const updated = await dataService.updateLeaveRequest(id, {
        status: "REJECTED",
        reviewerId: req.user.id,
        decisionNote: decisionNote ? decisionNote.trim() : "Rejected.",
        decidedAt: new Date()
      });

      await dataService.createAuditLog({
        actorId: req.user.id,
        action: "LEAVE_REJECTION",
        entityType: "LEAVE_REQUEST",
        entityId: id,
        metadata: {
          employeeId,
          leaveType: request.leaveType,
          requestedDays: request.requestedDays,
          decisionNote
        }
      });

      // Notify only the Employee who applied
      try {
        const reviewer = await dataService.findUserById(req.user.id);
        const reviewerName = reviewer ? reviewer.fullName : "Admin";
        const startDateStr = request.startDate instanceof Date ? request.startDate.toISOString().slice(0, 10) : String(request.startDate).slice(0, 10);
        const endDateStr = request.endDate instanceof Date ? request.endDate.toISOString().slice(0, 10) : String(request.endDate).slice(0, 10);
        const noteText = decisionNote ? ` Reason: "${decisionNote.trim()}"` : "";
        await dataService.createNotification({
          recipientId: employeeId,
          recipientRole: null,
          title: "Leave Request Rejected",
          message: `Your ${request.requestedDays}-day ${request.leaveType} leave request (${startDateStr} to ${endDateStr}) was rejected by ${reviewerName}.${noteText}`,
          type: "REQUEST_REJECTED",
          relatedEntityId: id
        });
      } catch (notifErr) {
        console.error("Failed to create employee rejection notification:", notifErr);
      }

      return res.json(updated);
    }
  } catch (err) {
    next(err);
  }
}

export async function getEmployees(req, res, next) {
  try {
    const employees = await dataService.listEmployees();
    const enriched = await Promise.all(
      employees.map(async emp => {
        const empId = emp._id ? emp._id.toString() : emp.id;
        const balances = await dataService.getEmployeeBalances(empId);
        return {
          id: empId,
          name: emp.fullName,
          email: emp.email,
          department: emp.department,
          balances
        };
      })
    );
    res.json({ employees: enriched });
  } catch (err) {
    next(err);
  }
}

export async function getEmployeeLeaveHistory(req, res, next) {
  try {
    const { employeeId } = req.params;
    const { from, to, status, leaveType, page = 1, limit = 20 } = req.query;

    const employee = await dataService.findUserById(employeeId);
    if (!employee || employee.role !== "EMPLOYEE") {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Employee not found.",
          details: []
        }
      });
    }

    const result = await dataService.listLeaveRequests({
      employeeId,
      status,
      leaveType,
      from,
      to,
      page,
      limit
    });

    res.json({
      employee: {
        id: employee._id ? employee._id.toString() : employee.id,
        name: employee.fullName,
        department: employee.department
      },
      items: result.items,
      page: result.page,
      limit: result.limit,
      total: result.total
    });
  } catch (err) {
    next(err);
  }
}

export async function getAuditLogs(req, res, next) {
  try {
    const logs = await dataService.listAuditLogs(100);
    res.json({ logs });
  } catch (err) {
    next(err);
  }
}
