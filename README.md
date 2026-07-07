# SASCHED — Admin Dashboard

> The operator-facing control panel for the **SASCHED** appointment scheduling system.  
> Built with React 19, TypeScript, Vite, and Supabase.

---

## Overview

**ADMIN_SPACE** is the real-time admin dashboard for SASCHED. It gives authorized personnel full visibility and control over the live appointment queue — calling the next client, managing service windows, logging walk-ins, and reviewing historical session data.

This repository is the **admin counterpart** to [`SAS_USER_SPACE`](https://github.com/IDnTKWWWW/SAS_USER_SPACE), the client-facing booking application.

---

## Features

- 🟢 **Live Queue Management** — Real-time ticket feed via Supabase Realtime; call next, recall, pause, and mark no-shows
- 🚶 **Walk-In Registration** — Add walk-in clients directly to the queue; persisted to the database with full audit trail
- 🪟 **Window Status Control** — Toggle Cashier / Registrar windows between Open, Cut-off, and Closed states
- 📋 **History & Logs** — Filterable session history with served, no-show, and removed ticket records
- ⚙️ **Settings** — Configurable grace timer, max queue size, auto-advance, and printer toggle
- 🔒 **Secure Auth Gate** — Role-based access: only users with `app_metadata.role = "admin"` may enter
- 🛡️ **Brute-Force Protection** — Login locked for 60 seconds after 5 failed attempts
- 🔑 **Password Reset** — Self-service forgot-password flow via Supabase email

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 6 |
| Backend / Auth / DB | Supabase (Auth, Postgres, Realtime) |
| Icons | Lucide React |
| Charts | Recharts |
| Styling | Vanilla CSS-in-JS (inline styles) |

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- A [Supabase](https://supabase.com) project with `queue_tickets` and `window_status` tables

### Installation

```bash
git clone https://github.com/IDnTKWWWW/ADMIN_SPACE.git
cd ADMIN_SPACE
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

> ⚠️ Never commit this file. It is already listed in `.gitignore`.

### Run Locally

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

---

## Security Architecture

Access to this dashboard is protected by **two independent layers**:

### 1. Frontend Role Gate
The app checks `session.user.app_metadata.role === "admin"` on every session. Any authenticated user who is not an admin is immediately signed out and shown an "Unauthorized" screen.

To grant admin access, run this in the Supabase SQL Editor:
```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'your-admin@example.com';
```

### 2. Database Row Level Security (RLS)
All Supabase tables enforce RLS policies:
- **`queue_tickets`**: Public can read the live queue; only admins can update ticket status; hard deletes are blocked
- **`window_status`**: Public read; admin-only writes; insert/delete blocked
- **One-active-ticket trigger**: Prevents users from holding more than one active ticket at a time

The `is_admin()` RLS helper reads directly from `app_metadata` — the same source of truth as the frontend, and writable only by the service role (not by users).

---

## Database Schema (Key Tables)

```
queue_tickets
├── id               uuid         (PK)
├── ticket_number    text         (e.g. C-20260707-3F7A for booked, W-001 for walk-in)
├── user_name        text
├── account_id       text         (session.user.id — Supabase UID)
├── service_type     text         (General | Premium Support | Consultation | Billing)
├── department       text         (Cashier | Registrar)
├── booking_type     text         (booked | walkin)
├── status           text         (waiting | serving | served | noshow | removed)
├── appointment_time text
└── created_at       timestamptz

window_status
├── id               int4         (always 1 — single-row config)
├── cashier_status   text         (open | cutoff | closed)
└── registrar_status text         (open | cutoff | closed)
```

---

## Related Repositories

| Repo | Description |
|---|---|
| [`SAS_USER_SPACE`](https://github.com/IDnTKWWWW/SAS_USER_SPACE) | Client-facing appointment booking app |
| [`ADMIN_SPACE`](https://github.com/IDnTKWWWW/ADMIN_SPACE) | This repository — admin control dashboard |

---

## License

This project is for educational and demonstration purposes.
