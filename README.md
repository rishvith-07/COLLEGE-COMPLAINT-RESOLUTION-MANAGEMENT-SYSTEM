# 🎓 CampusResolve — College Complaint Resolution & Management System

> A modern, responsive, full-stack college complaint and grievance redressal system built with **React, TypeScript, Vite, Tailwind CSS, Express, and Supabase PostgreSQL**, designed for direct deployment as a **single integrated project on Vercel**.

---

## 🌟 Key Features

### 1. 🧑‍🎓 Student Portal
- **Lodge Grievances**: Submit complaints across multiple campus cells (Wi-Fi, Hostel, Dining/Canteen, Academics, Examination, Transportation, Sanitation, Anti-Ragging).
- **Unique Reference Number**: Auto-generates unique tracking codes (`CMP-YYYY-XXXXX`).
- **Real-Time Lifecycle Tracking**: Visual chronological audit timeline showing status transitions, dates, notes, and staff actions.
- **Discussion Thread**: Communicate directly with assigned department staff officers on the grievance page.
- **Resolution Feedback & Rating**: Submit 1–5 star reviews and closure confirmation.
- **Complaint Reopening**: Reopen eligible resolved complaints with detailed justification if issues persist.
- **Personal Dashboard**: Status donut chart, category breakdown bar chart, monthly trend area chart, and urgent action alerts.

### 2. 👨‍🏫 Faculty & Staff Workstation
- **Role-Based Isolation**: Staff only view and resolve complaints in their assigned department or explicitly dispatched to them.
- **Complaint Status Workflow**: Transition complaints between `Submitted` ➔ `Under Review` ➔ `Assigned` ➔ `In Progress` ➔ `Waiting for Student` ➔ `Escalated` ➔ `Resolved` ➔ `Closed`.
- **Investigation Notes**: Internal staff-only notes alongside public student messages.
- **Information Requests**: Flag complaints to `Waiting for Student` to prompt for student clarification.
- **Formal Resolutions**: Record root cause investigations, corrective action summaries, and resolution verification.

### 3. 🏛️ Department Head (HOD) Portal
- **Department Oversight**: Monitor all department grievances and backlog metrics.
- **Staff Assignment**: Dispatch complaints to specific investigation officers with expected SLA resolution targets.
- **Escalation**: Escalate high-severity grievances to the Dean / Administrator.

### 4. 🛡️ Administrator Control Center
- **System-Wide Master Registry**: Search, filter, inspect, and assign any complaint across the institution.
- **User Management**: Provision and manage accounts (Student, Staff, Faculty, Department Head, Admin), assign departments, and toggle active/suspended statuses.
- **Department Management**: Create, edit, and configure department units, office locations, and HODs.
- **Category Management**: Configure grievance categories, default routing departments, and default severity levels.
- **Analytics & SLA Reports**: Visual institutional metrics with Recharts and one-click **CSV Report Export**.
- **System Audit Logs**: Trace security and administrative actions.

---

## 🔑 Demo Login Credentials

The application includes a **1-click Quick-Fill panel** on the login page for rapid role testing:

| Role | Email | Password |
|---|---|---|
| **Student (Priya Sharma)** | `student@college.edu` | `password123` |
| **Faculty/Staff (Dr. Vikram Patel)** | `staff.cs@college.edu` | `password123` |
| **Department Head (Prof. Ramesh Gupta)** | `hod.cs@college.edu` | `password123` |
| **Administrator (Dr. Arthur Vance)** | `admin@college.edu` | `password123` |

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router v7, Recharts, Axios, Lucide React.
- **Backend**: Node.js, Express.js, TypeScript, JWT Authentication, bcryptjs, REST API architecture.
- **Database**: PostgreSQL hosted on **Supabase** (with built-in zero-config relational storage engine fallback for immediate local testing).
- **Deployment**: **Single Integrated Vercel Project** via serverless API routing (`/api` routes mapped to Express app).

---

## 📁 Project Architecture

```
├── api/
│   ├── app.ts                  # Express application setup, CORS, route mounting
│   ├── server.ts               # Local development entry point
│   ├── index.ts                # Vercel serverless function entry point
│   ├── controllers/            # Auth, Complaint, Department, Category, User, Report, etc.
│   ├── middleware/             # JWT auth & Role-Based Access Control (RBAC)
│   ├── routes/                 # Express REST endpoints
│   ├── db/
│   │   ├── db.ts               # Dual-engine database service (Supabase PG + local engine)
│   │   ├── schema.sql          # Complete Supabase PostgreSQL schema
│   │   └── seed.sql            # Rich demo seed records
│   └── types/                  # Shared TypeScript interfaces
├── src/
│   ├── components/
│   │   ├── common/             # Navbar, Footer, StatusBadge, PriorityBadge, StatCard, Modal
│   │   └── complaints/         # ComplaintTimeline, CommentThread, AssignModal, ResolutionModal, etc.
│   ├── contexts/               # AuthContext, ThemeContext, NotificationContext
│   ├── pages/
│   │   ├── LandingPage.tsx     # Hero, Live statistics, feature cards, footer
│   │   ├── LoginPage.tsx       # Auth with 1-click role testing credentials
│   │   ├── RegisterPage.tsx    # Student account registration
│   │   ├── student/            # StudentDashboard, SubmitComplaint, MyComplaints, ComplaintDetails
│   │   ├── staff/              # StaffDashboard
│   │   ├── admin/              # AdminDashboard, AllComplaints, UserManagement, Departments, Categories
│   │   └── shared/             # ReportsPage, NotificationsPage, SettingsPage, NotFoundPage
│   ├── services/api.ts         # Axios client with automatic Bearer token injection
│   ├── App.tsx                 # Route configuration with ProtectedRoute guards
│   └── main.tsx
├── supabase_schema.sql         # Supabase PostgreSQL DDL migration script
├── supabase_seed.sql           # Supabase PostgreSQL seed script
├── vercel.json                 # Vercel serverless function and SPA rewrite routing
├── test_e2e.ts                 # 15 automated end-to-end integration tests
└── package.json
```

---

## 🚀 Getting Started Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

*Note: CampusResolve includes an integrated zero-config relational engine that works out-of-the-box immediately! If you wish to connect to an external Supabase database, simply set `DATABASE_URL` in `.env`.*

### 3. Run Development Server
```bash
npm run dev
```
- Client runs on `http://localhost:3000`
- API runs on `http://localhost:5000` (automatically proxied by Vite)

### 4. Run Automated E2E Tests
```bash
npm test
```

---

## ☁️ Deploying to Vercel as One Integrated Project

CampusResolve is architected to deploy directly to Vercel without needing separate backend services like Render or Railway.

### Step 1: Set Up Supabase Database
1. Go to [supabase.com](https://supabase.com) and create a free project.
2. In Supabase Dashboard, open **SQL Editor**.
3. Open `supabase_schema.sql` from this repository, copy its contents, paste into SQL Editor, and click **Run**.
4. Open `supabase_seed.sql`, paste into SQL Editor, and click **Run**.
5. In Supabase Project Settings -> **Database**, copy your **Connection String (URI)** (either Transaction Pooler on port 6543 or Direct connection on port 5432).

### Step 2: Deploy to Vercel
1. Push this repository to GitHub.
2. In [Vercel Dashboard](https://vercel.com), click **Add New** -> **Project** and import your repository.
3. In **Environment Variables**, add:
   - `DATABASE_URL`: `postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`
   - `JWT_SECRET`: Any random 32+ character secret string
   - `NODE_ENV`: `production`
4. Click **Deploy**.
5. Vercel automatically builds the frontend into static assets and packages `/api/index.ts` as serverless API routes under the same domain.
