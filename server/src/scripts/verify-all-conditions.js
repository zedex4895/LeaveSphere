import dotenv from "dotenv";
dotenv.config();

const BASE_URL = (process.env.TEST_API_URL || "http://localhost:4000/api/v1").trim();

const results = [];

function recordTest(category, name, passed, detail) {
  results.push({ category, name, passed, detail });
  const icon = passed ? " PASS" : " FAIL";
  console.log(`[${icon}] ${category} -> ${name}`);
  if (detail) {
    console.log(`       Note: ${detail}`);
  }
}

async function api(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }
  return { status: res.status, ok: res.ok, data };
}

async function runAllTests() {
  console.log("============================================================");
  console.log("   COMPREHENSIVE TEST SUITE: CHECKING ALL CONDITIONS        ");
  console.log("============================================================\n");

  // --- CATEGORY 1: AUTHENTICATION & ACCESS CONTROL ---
  console.log(">>> Running Category 1: Authentication & RBAC Tests...");

  // 1.1 Employee 1 Login
  const emp1Res = await api("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "employee@example.com", password: "employee123" })
  });
  const emp1Token = emp1Res.data?.accessToken;
  const emp1Id = emp1Res.data?.user?.id;
  recordTest(
    "Authentication",
    "Employee 1 Login (employee@example.com)",
    emp1Res.status === 200 && Boolean(emp1Token) && emp1Res.data?.user?.role === "EMPLOYEE",
    `Status: ${emp1Res.status}, Role: ${emp1Res.data?.user?.role}`
  );

  // 1.2 Admin Login
  const adminRes = await api("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "admin@example.com", password: "admin123" })
  });
  const adminToken = adminRes.data?.accessToken;
  recordTest(
    "Authentication",
    "Admin Login (admin@example.com)",
    adminRes.status === 200 && Boolean(adminToken) && adminRes.data?.user?.role === "ADMIN",
    `Status: ${adminRes.status}, Role: ${adminRes.data?.user?.role}`
  );

  // 1.3 Employee 2 Login (Rahul Sharma)
  const emp2Res = await api("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "rahul.sharma@example.com", password: "password123" })
  });
  const emp2Token = emp2Res.data?.accessToken;
  const emp2Id = emp2Res.data?.user?.id;
  recordTest(
    "Authentication",
    "Employee 2 Login (rahul.sharma@example.com)",
    emp2Res.status === 200 && Boolean(emp2Token) && emp2Res.data?.user?.role === "EMPLOYEE",
    `Status: ${emp2Res.status}, User: ${emp2Res.data?.user?.name}`
  );

  // 1.4 Invalid Credentials
  const badLogin = await api("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "employee@example.com", password: "wrong_password_999" })
  });
  recordTest(
    "Authentication",
    "Reject Invalid Password",
    badLogin.status === 401,
    `Returned ${badLogin.status}: ${badLogin.data?.error?.message || "Unauthorized"}`
  );

  // 1.5 Missing Token on Protected Route
  const noTokenRes = await api("/leave/requests");
  recordTest(
    "Security",
    "Reject Request without Bearer Token",
    noTokenRes.status === 401,
    `Returned ${noTokenRes.status}`
  );

  // 1.6 RBAC: Employee Cannot Access Admin Dashboard
  const forbiddenRes = await api("/admin/dashboard", {
    headers: { Authorization: `Bearer ${emp1Token}` }
  });
  recordTest(
    "Security",
    "RBAC: Employee Blocked from Admin Dashboard",
    forbiddenRes.status === 403,
    `Returned ${forbiddenRes.status}: ${forbiddenRes.data?.error?.message || "Forbidden"}`
  );

  // --- CATEGORY 2: DATE VALIDATIONS & CONSTRAINTS ---
  console.log("\n>>> Running Category 2: Date Validations & Business Constraints...");

  // 2.1 Past Date Prevention
  const pastDateRes = await api("/leave/requests", {
    method: "POST",
    headers: { Authorization: `Bearer ${emp1Token}` },
    body: JSON.stringify({
      leaveType: "ANNUAL",
      startDate: "2025-05-10",
      endDate: "2025-05-12",
      reason: "Testing past date rejection"
    })
  });
  recordTest(
    "Date Validation",
    "Reject Past Date (Yesterday / Previous Days)",
    pastDateRes.status === 400 && pastDateRes.data?.error?.message?.includes("past"),
    `Returned ${pastDateRes.status}: "${pastDateRes.data?.error?.message}"`
  );

  // 2.2 Date Shuffling Prevention (End Date before Start Date)
  const shuffledRes = await api("/leave/requests", {
    method: "POST",
    headers: { Authorization: `Bearer ${emp1Token}` },
    body: JSON.stringify({
      leaveType: "ANNUAL",
      startDate: "2026-11-20",
      endDate: "2026-11-15",
      reason: "Testing shuffled date rejection"
    })
  });
  recordTest(
    "Date Validation",
    "Reject Shuffled Dates (End Date < Start Date)",
    shuffledRes.status === 400 && (shuffledRes.data?.error?.message?.includes("shuffled") || shuffledRes.data?.error?.message?.includes("End date")),
    `Returned ${shuffledRes.status}: "${shuffledRes.data?.error?.message}"`
  );

  // 2.3 Non-working days only (weekend only)
  const weekendRes = await api("/leave/requests", {
    method: "POST",
    headers: { Authorization: `Bearer ${emp1Token}` },
    body: JSON.stringify({
      leaveType: "ANNUAL",
      startDate: "2026-11-14",
      endDate: "2026-11-15",
      reason: "Testing weekend only leave"
    })
  });
  recordTest(
    "Date Validation",
    "Reject Zero Working Days (Weekend Only)",
    weekendRes.status === 400 && weekendRes.data?.error?.message?.includes("no working days"),
    `Returned ${weekendRes.status}: "${weekendRes.data?.error?.message}"`
  );

  // 2.4 Valid Future Leave Application (pick conflict-free future date range & available balance)
  const preBalRes = await api("/leave/balance", {
    headers: { Authorization: `Bearer ${emp1Token}` }
  });
  const availableBal = preBalRes.data?.balances?.find(b => b.available >= 2 && b.leaveType !== "UNPAID") || { leaveType: "UNPAID" };
  const testLeaveType = availableBal.leaveType;

  const existingReqsRes = await api("/leave/requests", {
    headers: { Authorization: `Bearer ${emp1Token}` }
  });
  let baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + 120);
  if (Array.isArray(existingReqsRes.data?.requests) && existingReqsRes.data.requests.length > 0) {
    const dates = existingReqsRes.data.requests.map(r => new Date(r.endDate)).filter(d => !isNaN(d));
    if (dates.length > 0) {
      const maxDate = new Date(Math.max(...dates));
      if (maxDate > baseDate) {
        baseDate = new Date(maxDate);
      }
    }
  }
  baseDate.setDate(baseDate.getDate() + 5);
  while (baseDate.getDay() === 0 || baseDate.getDay() === 5 || baseDate.getDay() === 6) {
    baseDate.setDate(baseDate.getDate() + 1);
  }
  const targetStart = new Date(baseDate);
  const targetEnd = new Date(baseDate);
  targetEnd.setDate(targetEnd.getDate() + 1);
  const startStr = targetStart.toISOString().slice(0, 10);
  const endStr = targetEnd.toISOString().slice(0, 10);

  const validLeaveRes = await api("/leave/requests", {
    method: "POST",
    headers: { Authorization: `Bearer ${emp1Token}` },
    body: JSON.stringify({
      leaveType: testLeaveType,
      startDate: startStr,
      endDate: endStr,
      reason: "Automated test application",
      handoverNotes: "Rahul Sharma covering key tasks."
    })
  });
  const createdRequestId = validLeaveRes.data?.id;
  recordTest(
    "Leave Application",
    `Accept Valid Future Date Range (${testLeaveType}: ${startStr} to ${endStr})`,
    validLeaveRes.status === 201 && Boolean(createdRequestId) && validLeaveRes.data?.requestedDays === 2,
    `Status: ${validLeaveRes.status}, Created ID: ${createdRequestId}, Days: ${validLeaveRes.data?.requestedDays}`
  );

  // 2.5 Overlap Prevention
  const overlapRes = await api("/leave/requests", {
    method: "POST",
    headers: { Authorization: `Bearer ${emp1Token}` },
    body: JSON.stringify({
      leaveType: "UNPAID",
      startDate: startStr,
      endDate: endStr,
      reason: "Overlapping request test"
    })
  });
  recordTest(
    "Business Rules",
    "Reject Overlapping Leave Request",
    overlapRes.status === 409,
    `Returned ${overlapRes.status}: "${overlapRes.data?.error?.message}"`
  );

  // --- CATEGORY 3: NOTIFICATION DELIVERY & ISOLATION ---
  console.log("\n>>> Running Category 3: Notification Delivery & Privacy Isolation...");

  // 3.1 Did Admin receive notification for Employee 1's application?
  const adminNotifsRes = await api("/notifications?limit=20", {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const adminNotifs = adminNotifsRes.data?.notifications || [];
  const foundAdminNotif = adminNotifs.find(n => n.relatedEntityId === createdRequestId || (n.title?.includes("New Leave Application") && n.message?.includes(startStr)));
  recordTest(
    "Notifications",
    "Admin Receives Notification on Leave Submission",
    Boolean(foundAdminNotif),
    foundAdminNotif ? `Received: "${foundAdminNotif.title}" - ${foundAdminNotif.message}` : "Not found"
  );

  // 3.2 Notification Isolation: Employee 2 MUST NOT see Employee 1's submission notification
  const emp2NotifsBefore = await api("/notifications?limit=20", {
    headers: { Authorization: `Bearer ${emp2Token}` }
  });
  const emp2NotifsList1 = emp2NotifsBefore.data?.notifications || [];
  const leakedToEmp2 = emp2NotifsList1.some(n => n.relatedEntityId === createdRequestId);
  recordTest(
    "Notification Isolation",
    "Other Employee (Rahul) Does NOT See Asha's Application",
    !leakedToEmp2,
    leakedToEmp2 ? "LEAK DETECTED!" : "Passed - Rahul's notifications contain zero details about Asha's application"
  );

  // 3.3 Admin Decision: Approve Employee 1's Request
  const approveRes = await api(`/admin/leave/requests/${createdRequestId}/decision`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      decision: "APPROVED",
      decisionNote: "Approved, have a good time off!"
    })
  });
  recordTest(
    "Admin Decision",
    "Admin Approves Leave Request",
    approveRes.status === 200 && approveRes.data?.status === "APPROVED",
    `Request status updated to ${approveRes.data?.status}`
  );

  // 3.4 Target Employee (Asha) Receives Decision Notification
  const emp1NotifsRes = await api("/notifications?limit=20", {
    headers: { Authorization: `Bearer ${emp1Token}` }
  });
  const emp1Notifs = emp1NotifsRes.data?.notifications || [];
  const foundApprovalNotif = emp1Notifs.find(n => n.relatedEntityId === createdRequestId && n.title?.includes("Approved"));
  recordTest(
    "Notifications",
    "Applicant (Asha) Receives Approval Notification",
    Boolean(foundApprovalNotif),
    foundApprovalNotif ? `Received: "${foundApprovalNotif.title}" - ${foundApprovalNotif.message}` : "Not found"
  );

  // 3.5 Target Isolation: Employee 2 (Rahul) MUST NOT see Asha's approval notification
  const emp2NotifsAfter = await api("/notifications?limit=20", {
    headers: { Authorization: `Bearer ${emp2Token}` }
  });
  const emp2NotifsList2 = emp2NotifsAfter.data?.notifications || [];
  const approvalLeaked = emp2NotifsList2.some(n => n.relatedEntityId === createdRequestId);
  recordTest(
    "Notification Isolation",
    "Other Employee (Rahul) Does NOT See Asha's Approval Notification",
    !approvalLeaked,
    approvalLeaked ? "LEAK DETECTED!" : "Passed - Strictly isolated to the specific applicant"
  );

  // 3.6 Mark Notification As Read
  if (foundApprovalNotif) {
    const markReadRes = await api(`/notifications/${foundApprovalNotif.id}/read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${emp1Token}` }
    });
    recordTest(
      "Notifications",
      "Mark Notification As Read",
      markReadRes.status === 200 && markReadRes.data?.success === true,
      `Marked notification ID ${foundApprovalNotif.id} as read`
    );
  }

  // 3.7 Rejection Workflow & Notification Targeting (Employee 2: Rahul Sharma)
  console.log("\n>>> Running Rejection Workflow & Targeted Rejection Notification Tests...");
  const rExistingRes = await api("/leave/requests", {
    headers: { Authorization: `Bearer ${emp2Token}` }
  });
  let rBaseDate = new Date();
  rBaseDate.setDate(rBaseDate.getDate() + 180);
  if (Array.isArray(rExistingRes.data?.requests) && rExistingRes.data.requests.length > 0) {
    const rDates = rExistingRes.data.requests.map(r => new Date(r.endDate)).filter(d => !isNaN(d));
    if (rDates.length > 0) {
      const maxDate = new Date(Math.max(...rDates));
      if (maxDate > rBaseDate) {
        rBaseDate = new Date(maxDate);
      }
    }
  }
  rBaseDate.setDate(rBaseDate.getDate() + 5);
  while (rBaseDate.getDay() === 0 || rBaseDate.getDay() === 5 || rBaseDate.getDay() === 6) {
    rBaseDate.setDate(rBaseDate.getDate() + 1);
  }
  const rahulStart = new Date(rBaseDate);
  const rahulEnd = new Date(rBaseDate);
  rahulEnd.setDate(rahulEnd.getDate() + 1);
  const rStartStr = rahulStart.toISOString().slice(0, 10);
  const rEndStr = rahulEnd.toISOString().slice(0, 10);

  // Rahul submits leave
  const rahulLeaveRes = await api("/leave/requests", {
    method: "POST",
    headers: { Authorization: `Bearer ${emp2Token}` },
    body: JSON.stringify({
      leaveType: "UNPAID",
      startDate: rStartStr,
      endDate: rEndStr,
      reason: "Attending workshop"
    })
  });
  const rahulReqId = rahulLeaveRes.data?.id;
  recordTest(
    "Rejection Workflow",
    "Employee 2 (Rahul) Submits Request for Rejection Test",
    rahulLeaveRes.status === 201 && Boolean(rahulReqId),
    `Status: ${rahulLeaveRes.status}, ID: ${rahulReqId}`
  );

  // Admin rejects Rahul's leave
  const rejectRes = await api(`/admin/leave/requests/${rahulReqId}/decision`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      decision: "REJECTED",
      decisionNote: "Critical sprint deadline, please reschedule."
    })
  });
  recordTest(
    "Admin Decision",
    "Admin Rejects Rahul's Leave Request",
    rejectRes.status === 200 && rejectRes.data?.status === "REJECTED",
    `Request status updated to ${rejectRes.data?.status}`
  );

  // Rahul receives rejection notification
  const rahulNotifsRes = await api("/notifications?limit=20", {
    headers: { Authorization: `Bearer ${emp2Token}` }
  });
  const rahulNotifs = rahulNotifsRes.data?.notifications || [];
  const foundRejectionNotif = rahulNotifs.find(n => n.relatedEntityId === rahulReqId && n.title?.includes("Rejected"));
  recordTest(
    "Notifications",
    "Target Employee (Rahul) Receives Rejection Notification",
    Boolean(foundRejectionNotif),
    foundRejectionNotif ? `Received: "${foundRejectionNotif.title}" - ${foundRejectionNotif.message}` : "Not found"
  );

  // Asha MUST NOT receive Rahul's rejection notification
  const ashaNotifsRes = await api("/notifications?limit=20", {
    headers: { Authorization: `Bearer ${emp1Token}` }
  });
  const ashaNotifsList = ashaNotifsRes.data?.notifications || [];
  const rahulRejectionLeakedToAsha = ashaNotifsList.some(n => n.relatedEntityId === rahulReqId);
  recordTest(
    "Notification Isolation",
    "Asha Does NOT See Rahul's Rejection Notification",
    !rahulRejectionLeakedToAsha,
    rahulRejectionLeakedToAsha ? "LEAK DETECTED!" : "Passed - Rejection notification sent exclusively to Rahul"
  );

  // --- CATEGORY 4: LEAVE BALANCES & AUDIT TRAIL ---
  console.log("\n>>> Running Category 4: Leave Balances & Audit Trail...");

  // 4.1 Balance query
  const balRes = await api("/leave/balance", {
    headers: { Authorization: `Bearer ${emp1Token}` }
  });
  recordTest(
    "Leave Balances",
    "Retrieve Employee Leave Balances",
    balRes.status === 200 && Array.isArray(balRes.data?.balances) && balRes.data.balances.length > 0,
    `Types: ${balRes.data?.balances?.map(b => `${b.leaveType}: ${b.available}/${b.entitlement}`).join(", ")}`
  );

  // 4.2 Company Holidays
  const holRes = await api("/company-holidays", {
    headers: { Authorization: `Bearer ${emp1Token}` }
  });
  recordTest(
    "Holidays",
    "Retrieve Company Holidays List",
    holRes.status === 200 && Array.isArray(holRes.data?.holidays),
    `Found ${holRes.data?.holidays?.length || 0} holidays`
  );

  // 4.3 Admin History & Metrics
  const dashRes = await api("/admin/dashboard", {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  recordTest(
    "Admin Dashboard",
    "Retrieve Admin Dashboard Metrics",
    dashRes.status === 200 && typeof dashRes.data?.pendingApprovals === "number",
    `Pending Approvals: ${dashRes.data?.pendingApprovals}, On Leave Today: ${dashRes.data?.employeesOnLeaveToday}`
  );

  // Summary
  console.log("\n============================================================");
  console.log("                   TEST SUITE SUMMARY                       ");
  console.log("============================================================");
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;
  console.log(`Total Conditions Tested : ${total}`);
  console.log(`Passed                 : ${passed}`);
  console.log(`Failed                 : ${failed}`);
  console.log("============================================================\n");

  if (failed > 0) {
    console.error("FAILURES FOUND in test suite.");
    process.exit(1);
  } else {
    console.log("ALL TEST CONDITIONS PASSED WITH 100% SUCCESS!");
    process.exit(0);
  }
}

runAllTests().catch(err => {
  console.error("Fatal Test Runner Error:", err);
  process.exit(1);
});
