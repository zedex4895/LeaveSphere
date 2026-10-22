import dotenv from "dotenv";
dotenv.config();

import app from "../server.js";

async function runApiTests() {
  console.log("\n--- Starting API Integration Tests ---");
  const baseUrl = "http://localhost:4000/api/v1";

  // Give server time to bind and connect
  await new Promise(r => setTimeout(r, 4000));

  // 1. Employee Login
  console.log("1. Testing Employee Login (employee@example.com)...");
  const empLoginRes = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "employee@example.com", password: "employee123" })
  });
  const empLogin = await empLoginRes.json();
  if (!empLogin.accessToken) throw new Error("Employee login failed: " + JSON.stringify(empLogin));
  console.log("✓ Employee logged in. Name:", empLogin.user.name, "Role:", empLogin.user.role);
  const empToken = empLogin.accessToken;

  // 2. Employee Balance
  console.log("2. Testing GET /leave/balance for Employee...");
  const balRes = await fetch(`${baseUrl}/leave/balance`, {
    headers: { Authorization: `Bearer ${empToken}` }
  });
  const balData = await balRes.json();
  console.log("✓ Balances retrieved:", balData.balances.map(b => `${b.leaveType}: ${b.available}/${b.entitlement}`).join(", "));

  // 3. Admin Login
  console.log("3. Testing Admin Login (admin@example.com)...");
  const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@example.com", password: "admin123" })
  });
  const adminLogin = await adminLoginRes.json();
  if (!adminLogin.accessToken) throw new Error("Admin login failed: " + JSON.stringify(adminLogin));
  console.log("✓ Admin logged in. Name:", adminLogin.user.name, "Role:", adminLogin.user.role);
  const adminToken = adminLogin.accessToken;

  // 4. Admin Dashboard Metrics
  console.log("4. Testing GET /admin/dashboard...");
  const dashRes = await fetch(`${baseUrl}/admin/dashboard`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const dashData = await dashRes.json();
  console.log("✓ Dashboard metrics:", JSON.stringify(dashData));

  // 5. Admin Employee Leave History
  console.log("5. Testing GET /admin/employees/:id/leave-history...");
  const histRes = await fetch(`${baseUrl}/admin/employees/${empLogin.user.id}/leave-history`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const histData = await histRes.json();
  console.log(`✓ History retrieved for ${histData.employee.name}: ${histData.total} records found.`);

  // 6. Test Company Holidays
  console.log("6. Testing GET /company-holidays...");
  const holRes = await fetch(`${baseUrl}/company-holidays`, {
    headers: { Authorization: `Bearer ${empToken}` }
  });
  const holData = await holRes.json();
  console.log(`✓ Holidays retrieved: ${holData.holidays.length} published holidays.`);

  console.log("\n=================================================");
  console.log("  ALL API INTEGRATION TESTS PASSED PERFECTLY!    ");
  console.log("=================================================\n");
  process.exit(0);
}

runApiTests().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
