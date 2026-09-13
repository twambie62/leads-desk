# LeadsDesk — Lead Management System (LMS)

A lead management system for capturing, qualifying, and tracking leads from Facebook and WhatsApp channels, built as a technical assessment MVP. The system is fully implemented up to **Stage 4 (Lead Status)** per the assignment scope; features beyond Stage 4 (Follow-ups, Meetings, Sales, Training) render as "Coming Soon" placeholders in the UI, though the underlying database schema already models the full lead lifecycle for future development.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router) |
| UI Components | shadcn/ui, Animate UI |
| Charts | Recharts (via shadcn's chart wrapper) |
| Database | PostgreSQL |
| ORM | Prisma 7 (with driver adapters) |
| Auth | Custom cookie-based sessions, bcryptjs for hashing |
| Validation | Zod |
| Containerization | Docker |

---

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- npm

---

## Environment Variables

Create a `.env` file in the project root:

```
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/<db_name>?schema=public"
```

Adjust the host, port, username, password, and database name to match your Docker Postgres service configuration (see `docker-compose.yml`).

---

## Setup & Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Start the database

```bash
docker compose up -d
```

### 3. Generate the Prisma Client

Prisma 7 requires an explicit `output` path in the generator block (already configured in `schema.prisma`) and does **not** auto-generate the client during migrations — this step must be run explicitly.

```bash
npx prisma generate
```

### 4. Run database migrations

```bash
npx prisma migrate dev
```

### 5. Seed the database

Two seed scripts are provided:

**Minimal seed** — creates only the predefined Admin account:
```bash
npx prisma db seed
```

**Full dummy data seed** — creates the Admin account, 8 sales agents, a trainer, and ~180 realistic leads spread across the entire pipeline (including activities, follow-ups, sales, and training records), useful for visualizing and testing every feature of the system:
```bash
npm run db:seed:dummy
```

### 6. Run the development server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Login Credentials

There is a single login page for both roles; the system routes each user to the correct dashboard based on their role after authentication.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@leadsdesk.com` | `Admin@2026` |
| Sales Agent (if dummy seed was run) | `agent1@leadsdesk.com` through `agent8@leadsdesk.com` | `Agent@2026` |
| Trainer (if dummy seed was run, dormant role) | `trainer@leadsdesk.com` | `Trainer@2026` |

There is no account creation page — Admin is predefined via the seed script, and the Admin is responsible for creating all Sales Agent accounts through the dashboard.

---

## Roles & Access Control

- **Admin** — full system access: views all leads, creates and manages sales agent accounts (edit details, reset passwords, unlock locked accounts, deactivate/reactivate), assigns/reassigns leads to any agent, deletes leads, exports lead data, and views the system-wide activity log.
- **Sales Agent** — scoped access: can create new leads (auto-assigned to themselves), view and edit only their own assigned leads, update lead status through the pipeline, and log activities/follow-ups. Agents cannot delete leads, reassign leads to other agents, or manage other user accounts.
- **Trainer** — present in the schema and seed data for future use; no dedicated dashboard is implemented yet, as it falls outside the Stage 4 MVP scope.

Role scoping is enforced at the data-query layer (not just hidden in the UI) — every query and server action independently verifies the caller's role and, for agents, restricts results to leads they are actually assigned to.

---

## Features Implemented

### Authentication & Security
- Single login page for both Admin and Sales Agent roles, routing to the correct dashboard based on role
- Cookie-based sessions with a 30-minute sliding expiration (session automatically extends on activity, expires after 30 minutes of inactivity)
- Account lockout after 5 failed login attempts, with a 24-hour lockout period
- Passwords hashed with bcrypt; password hashes and internal tokens are never returned from any API response
- Change Password (self-service, from the sidebar) and Admin-initiated password reset for agent accounts
- Admin can manually unlock a locked-out agent account

### Lead Management
- Lead creation form covering all required fields (Lead Name, Business Name, Phone Number, WhatsApp Number, Email, Location, Business Type, Product Interested In, Lead Source, Assigned Sales Agent, Date Created)
- Strict enum validation for Lead Source (Facebook, WhatsApp, Referral, Website, Physical, Other)
- Lead Status pipeline: New Lead → Contacted → Qualified → Meeting Scheduled, advanced sequentially, with Disqualified / Lost / No Response selectable at any point as alternative outcomes
- A reason is required when marking a lead Disqualified or Lost
- Qualification notes, editable independently of the status transition
- Soft delete — deleted leads are hidden from all views but retained in the database along with their audit history; single and bulk (multi-select) delete supported, admin-only
- Full Leads List page with search (by name, business, or phone), filtering (status, source, and — admin only — assigned agent), date-range filtering, column sorting, and pagination
- Lead Details page with inline editing, the full status pipeline control, an activity/call-note timeline, and one-click WhatsApp and email actions

### Activity Tracking
- Activities can be logged against a lead (Phone Call, WhatsApp, Google Meet, Physical Meeting, Demo, Follow-up), each with notes and an optional next follow-up date
- "Today's Follow-ups" widget on the Sales Agent dashboard, showing due-today and overdue follow-ups with quick-action buttons to call, WhatsApp, or email the lead directly

### Dashboards
- **Admin Dashboard**: stats cards (New, Contacted, Qualified, Meeting Scheduled) with week-over-week and month-over-month comparisons; a stacked bar chart of lead status over time (daily/weekly/monthly toggle); a pie chart of leads by source with a visible legend; a paginated leads table; Add Lead, Add Sales Agent, and Export actions
- **Sales Agent Dashboard**: the same stats cards and status chart, scoped exclusively to the agent's own assigned leads; a Today's Follow-ups widget in place of the source chart; a leads table restricted to their own leads with no delete capability
- Both dashboards include a personalized greeting (Good morning / afternoon / evening) and user account details in the sidebar footer

### Reporting & Auditing
- A system-wide Activity Log (Reports page, admin-only) showing every create, update, status change, assignment, deletion, login, failed login, and lockout event, with filtering by action type, user, date range, and free-text search
- Every meaningful action in the system writes a human-readable entry to this log

### Data Export
- CSV export of all leads (admin-only)

### UI/UX
- Built with shadcn/ui components throughout, with Animate UI used for the sidebar
- Light theme only (dark mode intentionally disabled); primary color `#3986F9`
- Fully responsive layout — cards, charts, and tables collapse and scroll appropriately on narrower viewports
- Placeholder ("Coming Soon") screens for Follow-ups, Meetings, Sales, Training, and (partially) Reports, matching the required screen structure

---

## Database Schema

The full relational schema is defined in `prisma/schema.prisma`. Key design points:

- **Soft delete** on the `Lead` model via a nullable `deletedAt` timestamp, rather than hard deletion, to preserve audit history
- **Custom Prisma Client output path** (`src/generated/prisma`) — Prisma 7 no longer generates into `node_modules/@prisma/client` by default
- **Driver adapter** (`@prisma/adapter-pg`) required for all `PrismaClient` instantiation under Prisma 7
- Schema models the **entire** lead lifecycle described in the internal developer guide (Sales, Training, Notifications, full status pipeline including Proposal/Demo, Won, Customer) even though only Stage 4 is functionally implemented in the UI — this avoids painful schema migrations if/when those later stages are built out
- A dedicated `AuditLog` model captures a generic, human-readable history of system activity, separate from the lead-specific `LeadActivity` model (which records call/meeting/follow-up history)

---

## Architectural Decisions & Assumptions

- **Monolithic Next.js architecture**: API routes and Server Actions are used instead of a separate backend service, per the assignment's suggested Next.js API Routes option.
- **Server Actions vs. API Routes**: mutations triggered from within the React tree (creating/editing leads, changing status, managing agents) use Server Actions; data consumed by client-side interactive components (paginated/filtered tables, the activity log) go through dedicated API routes so they can be fetched on demand without a full page re-render.
- **Authorization is enforced server-side at every layer** — page-level layouts block navigation to unauthorized routes, but Server Actions, API routes, and the underlying query functions independently re-verify the caller's role and lead ownership. This was a deliberate design choice: hiding a button in the UI does not prevent a direct request to the underlying action or endpoint, so every layer re-checks authorization rather than relying on the UI alone.
- **Session storage**: sessions are stored server-side in a `Session` table (hashed token, not the raw token, stored in the database) rather than using a fully stateless JWT, so sessions can be forcibly invalidated (e.g. on password reset or account deactivation) — a JWT-only approach would not support this without a separate revocation mechanism.
- **Export scope**: the CSV export currently exports all leads rather than the currently-filtered view on the Leads page. This was a simplicity trade-off; filtered export would require threading the same query parameters into the export route.
- **Sensitive data**: phone numbers, WhatsApp numbers, emails, and location are currently stored as plaintext columns, protected by authentication, role-based access control, and by never being returned from any endpoint to an unauthorized caller. Field-level encryption at rest was considered but not implemented in this MVP; see "Known Limitations" below.
- **Chart data is scoped to the Stage 4 pipeline** (New Lead, Contacted, Qualified, Meeting Scheduled, plus the alternative outcomes) even though the schema and seed data model the full pipeline (Proposal/Demo, Won, Training, Customer) — this keeps the dashboard consistent with what the doc specifies is actually built, rather than surfacing data for stages marked "Coming Soon."

---

## Known Limitations / Not Yet Implemented

- Field-level encryption of sensitive lead data at rest
- Filtered/scoped CSV export (currently exports all leads regardless of active filters)
- A "restore" mechanism for soft-deleted leads (currently permanent from the UI's perspective, though data is retained in the database)
- Duplicate lead detection (e.g. by phone number)
- Forced password reset on first login for newly created agent accounts
- A dedicated Trainer dashboard (role and schema exist, but the doc scopes this outside the MVP requirement)
- Full Reports screen beyond the system Activity Log (conversion rate, sales-by-agent, and monthly breakdowns are calculable from existing data but not yet surfaced as dedicated report views)

---

## Project Structure (high level)

```
app/
  login/                  Login page and authentication server actions
  (protected)/
    admin/                Admin-only routes (dashboard, leads, agents, reports, placeholders)
    agent/                Sales Agent routes (dashboard, leads, placeholders)
  api/
    leads/                Filtered/paginated leads endpoint + CSV export
    audit-logs/           Activity log endpoint
    auth/logout/          Logout route
components/
  dashboard/              Shared dashboard UI (sidebar, tables, dialogs, charts)
  ui/                     shadcn/ui component library
lib/
  actions/                Server Actions (leads, agents, activities, account)
  queries/                Data-fetching functions (role/ownership-scoped)
  session.ts              Session creation, validation, sliding expiration
  auth.ts                 Credential verification, lockout logic
prisma/
  schema.prisma           Full relational schema
  seed.ts                 Minimal seed (Admin account only)
  seed-dummy.ts           Full dummy dataset for testing/demoing
```