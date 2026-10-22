import React, { useState, useEffect } from "react";
import { api, ApiError } from "../services/api";
import { LeaveBalance, CompanyHoliday } from "../types";
import { X, Calendar, AlertCircle, CheckCircle, Info } from "lucide-react";

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  balances: LeaveBalance[];
  holidays: CompanyHoliday[];
}

function getLocalTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const ApplyLeaveModal: React.FC<ApplyLeaveModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  balances,
  holidays
}) => {
  const todayStr = getLocalTodayString();
  const [leaveType, setLeaveType] = useState<string>("ANNUAL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [handoverNotes, setHandoverNotes] = useState<string>("");
  const [calculatedDays, setCalculatedDays] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Selected balance helper
  const selectedBalance = balances.find(b => b.leaveType === leaveType);
  const availableDays = selectedBalance ? selectedBalance.available : 0;

  const handleStartDateChange = (newStart: string) => {
    setStartDate(newStart);
    setError(null);
    // Automatically keep end date synced if it is before the new start date (prevents shuffling)
    if (endDate && newStart && endDate < newStart) {
      setEndDate(newStart);
    }
  };

  const handleEndDateChange = (newEnd: string) => {
    setError(null);
    // If end date is before start date, prevent shuffling
    if (startDate && newEnd && newEnd < startDate) {
      setEndDate(startDate);
      setError("End date must be on or after start date (dates cannot be shuffled).");
      return;
    }
    setEndDate(newEnd);
  };

  // Calculate business days
  useEffect(() => {
    if (!startDate || !endDate) {
      setCalculatedDays(0);
      return;
    }
    if (startDate < todayStr || endDate < startDate) {
      setCalculatedDays(0);
      return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);

    const holidaySet = new Set(holidays.map(h => h.date));
    let count = 0;
    const cur = new Date(start);

    while (cur <= end) {
      const day = cur.getDay();
      const dateStr = cur.toISOString().slice(0, 10);
      const isWeekend = day === 0 || day === 6;
      const isHoliday = holidaySet.has(dateStr);

      if (!isWeekend && !isHoliday) {
        count++;
      }
      cur.setDate(cur.getDate() + 1);
    }

    setCalculatedDays(Math.max(count, count === 0 && start.getTime() === end.getTime() ? 1 : count));
  }, [startDate, endDate, holidays, todayStr]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return;
    }
    if (startDate < todayStr) {
      setError(`Leave start date cannot be in the past. You can only apply for today (${todayStr}) or future dates.`);
      return;
    }
    if (endDate < startDate) {
      setError("End date must be on or after start date (from and end dates cannot be shuffled).");
      return;
    }
    if (!reason.trim()) {
      setError("Please provide a reason for your leave request.");
      return;
    }
    if (leaveType !== "UNPAID" && calculatedDays > availableDays) {
      setError(`Insufficient leave balance. You requested ${calculatedDays} days, but have only ${availableDays} days available.`);
      return;
    }

    try {
      setLoading(true);
      await api.leave.submitRequest({
        leaveType,
        startDate,
        endDate,
        reason: reason.trim(),
        handoverNotes: handoverNotes.trim()
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to submit leave request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: "30px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-main)" }}>
              Apply for leave
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
              Submit your time-off request for review
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ width: "36px", height: "36px", padding: 0, borderRadius: "50%" }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "var(--badge-rejected-bg)",
              color: "var(--badge-rejected-color)",
              border: "1px solid var(--badge-rejected-border)",
              borderRadius: "10px",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "18px"
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Leave Type */}
          <div className="form-group">
            <label className="label">Leave Type</label>
            <select
              className="select"
              value={leaveType}
              onChange={e => setLeaveType(e.target.value)}
            >
              <option value="ANNUAL">Annual Leave</option>
              <option value="SICK">Sick Leave</option>
              <option value="PERSONAL">Personal Leave</option>
              <option value="UNPAID">Unpaid Leave</option>
            </select>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px", fontSize: "12px", color: "var(--text-muted)" }}>
              <Info size={14} color="var(--primary)" />
              <span>
                Available balance: <strong>{availableDays} days</strong>
                {calculatedDays > 0 && leaveType !== "UNPAID" && (
                  <> &nbsp;•&nbsp; Remaining after request: <strong>{Math.max(0, availableDays - calculatedDays)} days</strong></>
                )}
              </span>
            </div>
          </div>

          {/* Date range grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                <label className="label" style={{ margin: 0 }}>Start Date</label>
                <span style={{ fontSize: "11px", color: "var(--primary)", fontWeight: "500" }}>From today onward</span>
              </div>
              <input
                type="date"
                className="input"
                value={startDate}
                min={todayStr}
                onChange={e => handleStartDateChange(e.target.value)}
                required
              />
              <div style={{ fontSize: "11px", color: "var(--text-light)", marginTop: "4px" }}>
                Previous days blocked (min: {todayStr})
              </div>
            </div>
            <div className="form-group">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                <label className="label" style={{ margin: 0 }}>End Date</label>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "500" }}>≥ Start Date</span>
              </div>
              <input
                type="date"
                className="input"
                value={endDate}
                min={startDate || todayStr}
                onChange={e => handleEndDateChange(e.target.value)}
                required
              />
              <div style={{ fontSize: "11px", color: "var(--text-light)", marginTop: "4px" }}>
                Cannot be before Start Date
              </div>
            </div>
          </div>

          {/* Duration Banner */}
          {startDate && endDate && (
            <div
              style={{
                backgroundColor: "var(--surface-subtle)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "10px 14px",
                fontSize: "13px",
                color: "var(--text-main)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "18px"
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Calendar size={15} color="var(--primary)" />
                <span>Duration (excluding weekends & holidays):</span>
              </span>
              <strong style={{ color: calculatedDays > availableDays && leaveType !== "UNPAID" ? "var(--badge-rejected-color)" : "var(--primary)" }}>
                {calculatedDays} working {calculatedDays === 1 ? "day" : "days"}
              </strong>
            </div>
          )}

          {/* Reason */}
          <div className="form-group">
            <label className="label">Reason for Leave *</label>
            <textarea
              className="textarea"
              rows={3}
              placeholder="e.g. Attending family function, medical appointment, rest"
              value={reason}
              onChange={e => setReason(e.target.value)}
              required
            />
          </div>

          {/* Handover notes */}
          <div className="form-group">
            <label className="label">Handover & Coverage Notes (Optional)</label>
            <textarea
              className="textarea"
              rows={2}
              placeholder="e.g. Tasks delegated to teammate, critical files shared in drive"
              value={handoverNotes}
              onChange={e => setHandoverNotes(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Submitting..." : "Submit request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
