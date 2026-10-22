# LeaveFlow — Modern Leave Management System

A production-ready, full-stack, role-based Leave Management System engineered strictly in accordance with the Business Requirements Document ([BRD](docs/BRD.md)), [Design Specifications](docs/DESIGN_SPEC.md), [REST API Contract](docs/API_SPEC.md), and [MongoDB Schema](docs/MONGODB_SCHEMA.md).

---

## 🌟 Key Features

### 👤 Employee Workspace
- **Modern Overview Dashboard**:
  - 4 KPI metric cards: Annual leave available, Sick leave available, Pending requests in review, Days taken this year.
  - Real-time leave balance progress meters (Annual, Sick, Personal, Unpaid).
  - Recent requests table with status badges and quick review.
  - Recent activity stream.
- **Apply for Leave**:
  - Interactive modal with Leave Type selector.
  - Start Date & End Date selection with live business-day duration calculation (automatically excludes weekends and declared company holidays).
  - Live available balance preview and remaining quota indicator.
  - Reason and optional handover/coverage notes.
  - Overlap prevention (rejects conflicting pending or approved requests).
- **My Leave Requests**:
  - Filter chips: All, Pending, Approved, Rejected, Cancelled.
  - Leave type filter (Annual, Sick, Personal, Unpaid).
  - Request details drawer with reason, handover notes, reviewer comments, and submission timestamps.
  - Ability to cancel pending requests (releases reserved days back to available balance immediately).
- **Leave Balances**:
  - Comprehensive entitlement breakdowns with used, reserved/pending, and available quotas.
  - Progress meters and policy guidance (carry-forward rules, sick leave medical proof, advance notice).
- **Company Holidays Calendar**:
  - Published public holidays, optional holidays, and company-granted days off.

---

### 🛡️ Administrator Portal
- **Executive Admin Dashboard**:
  - 4 KPI metrics: Pending approvals count, Approved this month, Rejected this month, Employees on leave today.
  - Pending Approvals Queue with 1-click **Review** action.
- **Leave Review & Decision Flow**:
  - Review drawer displaying employee details (name, email, department), requested dates, working days, reason, and handover notes.
  - Live balance impact preview.
  - Approve or Reject with mandatory/optional decision notes.
  - Atomic ledger balance updates and audit trail logging.
- **All Company Requests**:
  - Organization-wide request table with multi-filter by status, type, and search by employee name or reason.
- **Employees & Balances Directory**:
  - Workforce directory with department, contact, and balance summaries.
  - **Employee Leave History Modal** (`GET /api/v1/admin/employees/:id/leave-history`) showing a single employee's chronological leave record with reviewer notes.
- **Company Holidays Manager & JSON Import**:
  - JSON file uploader and sample data loader (`docs/company-holidays.example.json`).
  - Validation preview table, schema checking, and row-level status before persisting.
  - Saves and publishes directly to the database via `POST /api/v1/admin/company-holidays/import`.
- **Administrative Audit Trail**:
  - Real-time audit log of approvals, rejections, holiday imports, and submissions (`GET /api/v1/admin/audit-logs`).

---

### 🎨 Design & Accessibility
- **Modern Theme System**: Deep Indigo (`#4F46E5`) primary color, clean card radius (14–18px), soft shadows, and WCAG-compliant contrast.
- **Light & Dark Mode**: Seamless toggle in the top navigation bar with persistent local storage.
- **Responsive Layout**: Desktop fixed sidebar, tablet navigation, mobile drawer support.
- **Zero Placeholders**: Fully functional with pre-seeded demo users, balances, requests, and holidays.

---

## ⚡ 1-Click Demo Credentials

| Role | Name | Email | Password |
|---|---|---|---|
| **Employee** | Asha Rao (Product) | `employee@example.com` | `employee123` |
| **Administrator** | Priya Menon (HR & Ops) | `admin@example.com` | `admin123` |
| **Employee** | Rahul Sharma (Engineering) | `rahul.sharma@example.com` | `password123` |
| **Employee** | Sneha Patel (Design) | `sneha.patel@example.com` | `password123` |

*(The login screen also provides 1-Click Fast Fill buttons for instant testing without typing.)*

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ or v20+
- npm v9+

### 1. Install Dependencies
```bash
# In the project root:
cd server && npm install
cd ../client && npm install
cd ..
```

### 2. Run the Full-Stack Application
Start both the Express API server and the Vite React frontend with a single command:
```bash
npm run dev
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend REST API**: [http://localhost:4000/api/v1](http://localhost:4000/api/v1)

### 3. Run Automated API Integration Tests
Verify all API endpoints, authentication, role authorization, leave balance operations, and history retrieval:
```bash
npm run test:api
```

---

## 🗄️ Database Configuration (MongoDB & Resilient Engine)

The system uses **MongoDB Atlas / Mongoose** as defined in [`docs/MONGODB_SCHEMA.md`](docs/MONGODB_SCHEMA.md).

### Using MongoDB Atlas:
1. Create a cluster on MongoDB Atlas.
2. In `server/.env`, set your connection string:
   ```dotenv
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/leave_management?retryWrites=true&w=majority
   ```
3. Restart the server. Mongoose connects and automatically provisions the collections.

### Zero-Config Built-In Engine:
If `MONGODB_URI` is not reachable or you are running offline without a local MongoDB service, LeaveFlow activates its **resilient built-in database engine**. It auto-seeds initial data, executes transactional balance logic, and serves all API endpoints out-of-the-box.

---

## 📡 REST API Overview

Base URL: `/api/v1`

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/auth/login` | Public | Sign in & receive JWT access token |
| `POST` | `/auth/logout` | Authenticated | Sign out & invalidate session |
| `GET` | `/auth/me` | Authenticated | Get current authenticated profile |
| `GET` | `/leave/balance` | Employee / Admin | Get leave balance quotas |
| `POST` | `/leave/requests` | Employee | Apply for leave with validation |
| `GET` | `/leave/requests` | Authenticated | List leave requests (filtered by status/type) |
| `GET` | `/leave/requests/:id` | Owner / Admin | Get request details |
| `PATCH` | `/leave/requests/:id/cancel` | Employee | Cancel own pending request |
| `GET` | `/admin/dashboard` | Admin | Dashboard metrics (pending, approved, on leave) |
| `PATCH` | `/admin/leave/requests/:id/decision` | Admin | Approve or reject request with decision note |
| `GET` | `/admin/employees` | Admin | List workforce directory & balance totals |
| `GET` | `/admin/employees/:id/leave-history` | Admin | Individual employee leave history |
| `GET` | `/company-holidays` | Authenticated | List published non-working company holidays |
| `POST` | `/admin/company-holidays/import` | Admin | Import, validate, and persist holiday JSON |
| `GET` | `/admin/audit-logs` | Admin | View immutable system audit trail |

---

## 📁 Project Structure

```text
LeaveManagementSystem/
├── package.json              # Monorepo scripts (dev, start, seed, test:api, build)
├── dev.js                    # Concurrent process runner for server & client
├── index.html                # Static prototype entry point (Vercel / GitHub Pages)
├── vercel.json               # Vercel deployment configuration
├── docs/                     # Specifications & Design Artifacts
│   ├── BRD.md                # Business requirements & deployment checklist
│   ├── DESIGN_SPEC.md        # UI/UX design tokens and screen requirements
│   ├── API_SPEC.md           # REST API endpoint specifications
│   ├── MONGODB_SCHEMA.md     # MongoDB schema and Mongoose model guidance
│   ├── DATABASE_SCHEMA.sql   # SQL reference schema
│   ├── company-holidays.example.json # Sample company holiday JSON
│   └── models/               # Reference Mongoose model schemas
├── server/                   # Node.js + Express REST API
│   ├── .env                  # Server environment configuration
│   └── src/
│       ├── config/           # Database connection & resilient fallback
│       ├── controllers/      # Auth, Leave, Admin, Holiday controllers
│       ├── middleware/       # JWT authentication & RBAC middleware
│       ├── models/           # Mongoose models (User, LeaveBalance, LeaveRequest, etc.)
│       ├── routes/           # API v1 routes
│       ├── scripts/          # Database seed & test-api scripts
│       ├── services/         # Unified data service layer
│       ├── utils/            # Business-day calculation utilities
│       └── server.js         # Main Express entry point
└── client/                   # React + Vite + TypeScript Frontend
    ├── index.html            # Client HTML template with Google Fonts (Inter)
    ├── vite.config.ts        # Vite configuration
    ├── tsconfig.json         # TypeScript configuration
    └── src/
        ├── components/       # Navbar, Sidebar, StatCard, StatusBadge, Modals
        ├── context/          # AuthContext with theme management
        ├── pages/            # Login, Overview, Requests, Balance, Admin pages
        ├── services/         # Typed API client service
        ├── types/            # TypeScript domain interfaces
        ├── App.tsx           # Master layout & routing
        ├── index.css         # Modern design system & theme tokens
        └── main.tsx          # Application mount point
```
