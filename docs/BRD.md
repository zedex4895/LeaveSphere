# Business Requirements & Deployment Document (BRD)

## 1. Project Overview
**Project Name:** LeaveSphere (Leave Management System)  
**Corpus / Repository:** [zedex4895/LeaveSphere](https://github.com/zedex4895/LeaveSphere.git)  
**Purpose:** Provide employees with a streamlined, intuitive interface to apply for leave, monitor real-time leave balances, and track review status; provide administrators with an executive dashboard to review and approve/reject leave requests, inspect employee leave history, and import published company holidays.

---

## 2. Business Objectives
- **Eliminate Manual Friction:** Replace error-prone email and spreadsheet workflows with a centralized digital ledger.
- **Role-Based Transparency:** Ensure employees have continuous visibility into available quotas (Annual, Sick, Personal, Unpaid) while isolating private decisions.
- **Auditable Decisions:** Ensure every administrative decision (Approval, Rejection, Cancellation) includes a timestamped audit log and optional decision notes.
- **Conflict Prevention:** Automatically calculate business-day duration, exclude company holidays and weekends, and reject overlapping leave requests.
- **Strict Notification Privacy:** Guarantee that approval and rejection alerts are targeted exclusively to the applying employee without data leaks to other staff.
- **Modern User Experience:** Provide an accessible, responsive interface featuring light and dark modes, high-contrast typography, and intuitive workflow navigation.

---

## 3. User Roles & Permission Matrix

| Function / Capability | Employee | Administrator | HR / Operations |
| :--- | :---: | :---: | :---: |
| Authenticate via Email & Password | ✅ | ✅ | ✅ |
| View Personal Overview & Balance Quotas | ✅ | ✅ | ✅ |
| Submit Leave Request (Future Dates Only) | ✅ | ✅ | ✅ |
| View Own Leave Request History | ✅ | ✅ | ✅ |
| Cancel Own Pending Leave Request | ✅ | ❌ | ❌ |
| Receive Targeted Decision Notifications | ✅ | ❌ | ❌ |
| Access Admin Executive Dashboard | ❌ | ✅ | ✅ |
| Review, Approve, or Reject Leave Requests | ❌ | ✅ | ✅ |
| View Organization-Wide Requests Directory | ❌ | ✅ | ✅ |
| View Employee Directory & Leave History | ❌ | ✅ | ✅ |
| Import & Publish Company Holiday JSON | ❌ | ✅ | ✅ |
| Inspect Immutable Administrative Audit Logs | ❌ | ✅ | ✅ |

---

## 4. Functional Requirements

### 4.1 Authentication & Security
- **FR-AUTH-1:** JWT-based stateless authentication with token expiration (`7d`).
- **FR-AUTH-2:** Passwords hashed with `bcryptjs` (salt factor 10).
- **FR-AUTH-3:** Role-based route middleware enforcing `EMPLOYEE` vs `ADMIN` permissions on API endpoints.
- **FR-AUTH-4:** Dynamic CORS handling allowing verified origin requests with credentials.

### 4.2 Leave Application & Policy Validations
- **FR-LEAVE-1:** Employees can select from `ANNUAL`, `SICK`, `PERSONAL`, or `UNPAID` leave types.
- **FR-LEAVE-2 (Past Date Prevention):** Start dates cannot precede today's date (`sDate >= today`).
- **FR-LEAVE-3 (Date Shuffling Prevention):** End date must be on or after start date (`endDate >= startDate`).
- **FR-LEAVE-4 (Working Day Calculation):** Working days calculated dynamically excluding Saturdays, Sundays, and active company holidays. Applications with 0 working days are rejected.
- **FR-LEAVE-5 (Balance Reservation):** Submitting a request reserves the days immediately, preventing balance overdrafts.
- **FR-LEAVE-6 (Overlap Prevention):** System rejects submissions that overlap with existing pending or approved requests (`409 Conflict`).

### 4.3 Review & Decision Workflow
- **FR-REV-1:** Admins review pending requests with employee profile, department, requested dates, and live balance impact.
- **FR-REV-2 (Approval):** Approving deducts reserved days into used days, updates request status to `APPROVED`, records an audit log, and notifies the applicant.
- **FR-REV-3 (Rejection):** Rejecting releases reserved days back to available balance, updates request status to `REJECTED`, records an audit log with rejection note, and notifies the applicant.
- **FR-REV-4 (Targeted Notifications):** Decision notifications are delivered strictly to the specific applicant (`recipientId: employeeId`). Other employees do not see these alerts.

### 4.4 Company Holidays & Audit Trails
- **FR-HOL-1:** Admins can import company holidays via JSON payload (`POST /api/v1/admin/company-holidays/import`).
- **FR-HOL-2:** Public holidays automatically deduct from requested duration during leave applications.
- **FR-AUDIT-1:** All administrative approvals, rejections, submissions, and holiday imports generate an immutable audit log entry.

---

## 5. Non-Functional Requirements
- **NFR-PERF-1:** API response times under 200ms under standard loads.
- **NFR-SEC-1:** No secrets or credentials committed in source control; strictly configured via environment variables.
- **NFR-RESP-1:** Fluid responsive UI adapting across desktop (1440px+), tablet (768px - 1024px), and mobile viewports (375px+).
- **NFR-A11Y-1:** Contrast compliance adhering to WCAG 2.1 AA standards.

---

## 6. Deployment

### 6.1 Hosting Platforms & Responsibilities
The LeaveSphere system utilizes a decoupled, modern cloud deployment architecture:

| Component | Target Platform | Primary Responsibility |
| :--- | :--- | :--- |
| **Frontend Client** | **Vercel** / **Static CDN** | Hosts compiled React 18 + Vite SPA, provides global edge distribution, asset caching, and URL rewrites. |
| **Backend REST API** | **Vercel Serverless Functions** / **Render / Railway** | Executes Express.js API handlers, performs JWT verification, date calculation, transaction handling, and audit logging. |
| **Database** | **MongoDB Atlas** | Managed cloud database cluster providing multi-collection persistence, index optimization, and transaction support. |

### 6.2 Frontend, Backend, and Database Deployment Architecture

```mermaid
graph TD
    User([End User Browser])
    VercelEdge["Vercel Global Edge Network<br/>(https://leavesphere-five.vercel.app)"]
    ViteSPA["Static Frontend Assets<br/>(/dist: HTML, JS, CSS)"]
    ServerlessAPI["Vercel Serverless Function<br/>(/api/index.js -> Express App)"]
    MongoAtlas[("MongoDB Atlas Cloud Database<br/>(Replica Set Cluster0)")]

    User -->|HTTPS GET /*| VercelEdge
    VercelEdge -->|Static Routing| ViteSPA
    User -->|HTTPS /api/v1/*| VercelEdge
    VercelEdge -->|Rewrite /api/(.*)| ServerlessAPI
    ServerlessAPI -->|Mongoose TLS/SSL Connection| MongoAtlas
```

### 6.3 Required Services & External Dependencies
1. **GitHub Repository:** `https://github.com/zedex4895/LeaveSphere.git` (Source of Truth).
2. **Vercel Project:** Linked to `main` branch with automatic deployment pipelines.
3. **MongoDB Atlas Cluster:** Provisioned M0 Sandbox or dedicated cluster with IP Access List configured to allow cloud connections (`0.0.0.0/0` with secure SCRAM authentication).

### 6.4 Environment Variable Configuration

| Environment Variable | Service | Purpose | Example / Placeholder |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Backend | Environment flag | `production` |
| `PORT` | Backend (Local) | Server listening port | `4000` |
| `MONGODB_URI` | Backend | Atlas connection string | `mongodb+srv://<db_user>:<db_pass>@cluster0.mongodb.net/leavesphere?retryWrites=true&w=majority` |
| `JWT_ACCESS_SECRET` | Backend | Cryptographic signing secret | `your_64char_random_jwt_secret_key_here` |
| `JWT_ACCESS_TTL` | Backend | Token validity duration | `7d` |
| `VITE_API_BASE_URL` | Frontend | API endpoint prefix | `/api/v1` (relative path for zero-CORS rewrites) |

> [!CAUTION]
> Never commit actual passwords or database tokens to GitHub. Configure these values directly within the Vercel Project Settings under **Settings → Environment Variables**.

### 6.5 Build & Deployment Approach
- **Frontend Build:** Triggered via `npm run build` inside `client/`, which runs `tsc -b && vite build`. Vite outputs production assets directly to `../dist`.
- **Backend Build:** Node.js 18+ runtime bundled via Vercel Serverless Functions (`@vercel/node`) targeting `api/index.js`.
- **Routing Rules (`vercel.json`):**
  - `/api/(.*)` rewrites to `/api/index.js`
  - `/(.*)` rewrites to `/index.html` (Single Page Application fallback).

### 6.6 Step-by-Step Initial Deployment Instructions
1. **Prepare MongoDB Atlas:**
   - Log in to MongoDB Atlas and create a database named `leave_management`.
   - Create a database user with read/write access.
   - Whitelist cloud IP addresses (`0.0.0.0/0`) in **Network Access**.
   - Copy the connection URI.
2. **Deploy via Vercel:**
   - Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
   - Import `zedex4895/LeaveSphere`.
   - Set **Framework Preset** to `Vite`.
   - In **Environment Variables**, add:
     - `MONGODB_URI`
     - `JWT_ACCESS_SECRET`
     - `JWT_ACCESS_TTL`
   - Click **Deploy**.

### 6.7 Deploying Updates
Every push to the `main` branch on GitHub automatically triggers a new immutable Vercel deployment:
```powershell
git add .
git commit -m "Description of changes"
git push origin main
```
Vercel automatically detects the commit, compiles the client bundle, re-provisions serverless functions, and promotes the deployment.

### 6.8 Database Configuration & Secure Connectivity
- Mongoose establishes an encrypted TLS/SSL connection with auto-reconnection and exponential backoff.
- The backend features a resilient built-in in-memory fallback engine that automatically engages if the remote database is temporarily unreachable, ensuring continuous uptime.

### 6.9 CORS & API URL Configuration
- Frontend API calls use the relative path `/api/v1`.
- When hosted on Vercel, requests originate from `https://leavesphere-five.vercel.app/api/v1/...` and match Vercel's rewrite rules, completely avoiding cross-origin preflight overhead.
- In local development, `vite.config.ts` transparently proxies `/api` to `http://localhost:4000`.

### 6.10 Production Verification & Troubleshooting
1. **Verification Steps:**
   - Open the live deployment URL over HTTPS.
   - Verify that the login view renders without console errors.
   - Sign in using administrator and employee credentials.
   - Verify that balances, notifications, and leave application modals function correctly.
2. **Common Issues & Resolutions:**
   - **`ERR_CONNECTION_REFUSED` / `localhost:4000`:** Indicates the client is using a cached or stale build. Clear browser cache (`Ctrl + Shift + R`) or verify that the latest commit has completed building on Vercel.
   - **500 Internal Server Error on Login:** Verify that `MONGODB_URI` and `JWT_ACCESS_SECRET` are correctly configured in Vercel Environment Variables.
   - **404 Not Found on `/api/v1/*`:** Ensure `vercel.json` and `api/index.js` are present at the repository root.

### 6.11 Live Deployment Status & URL
- **Live Frontend URL:** [https://leavesphere-five.vercel.app/](https://leavesphere-five.vercel.app/)
- **Deployment Status:** **Deployed (Vercel)**
- **Verification Note:** Live frontend assets are actively deployed. Full-stack API operations require environment variables (`MONGODB_URI`, `JWT_ACCESS_SECRET`) configured within Vercel Project Settings.

### 6.12 Rollback & Recovery Considerations
- Vercel retains every previous deployment. If an update introduces errors, navigate to **Deployments**, locate the last known good deployment, click the three dots `...`, and select **"Promote to Production"** for instant zero-downtime rollback.

---

## 7. Submission Details
- **Project Title:** LeaveSphere — Modern Leave Management System
- **GitHub Repository:** [https://github.com/zedex4895/LeaveSphere.git](https://github.com/zedex4895/LeaveSphere.git)
- **Hosted Application URL:** [https://leavesphere-five.vercel.app/](https://leavesphere-five.vercel.app/)
- **Submission Recipient:** `careers@exeloncircuits.com`
