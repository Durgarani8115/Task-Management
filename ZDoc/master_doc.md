# Task Management SaaS — Master Documentation

> **Purpose:** Single source of truth for new joiners & AI IDE context.
> **Last updated:** 2026-06-17

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Repository Structure (File Map)](#3-repository-structure-file-map)
4. [Architecture Overview](#4-architecture-overview)
5. [Database Schema (Prisma)](#5-database-schema-prisma)
6. [API Routes](#6-api-routes)
7. [Frontend Pages & Routing](#7-frontend-pages--routing)
8. [Component Tree](#8-component-tree)
9. [Authentication Flow](#9-authentication-flow)
10. [Utility Libraries](#10-utility-libraries)
11. [Styling & Design System](#11-styling--design-system)
12. [Environment Variables](#12-environment-variables)
13. [Development Setup](#13-development-setup)
14. [Current Implementation Status](#14-current-implementation-status)
15. [Phased Roadmap](#15-phased-roadmap)
16. [Coding Conventions & Guidelines](#16-coding-conventions--guidelines)
17. [Known Issues & Tech Debt](#17-known-issues--tech-debt)

---

## 1. Project Overview

**Product:** A multi-workspace, multi-project **Project Management SaaS** (like Linear / Jira / Asana).

**Core Concepts:**
- **Users** sign up/in and belong to one or more **Workspaces** (teams/orgs)
- Each Workspace contains **Projects**
- Each Project has **TaskColumns** (Kanban columns like "To Do", "In Progress", "Done")
- Each column has **Tasks** with priority, due dates, assignees, comments, checklists, attachments, tags, and activity logs
- Role-based access: OWNER → ADMIN → MEMBER → VIEWER

**Current State:** Early-stage — authentication, workspace CRUD, database schema, sidebar layout, and a prototype Kanban board (in a `notes` file) are built. Many pages and features are scaffolded but empty.

---

## 2. Tech Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| **Framework** | Next.js (App Router) | 16.2.6 | React Server Components enabled |
| **Language** | TypeScript | ^5 | Strict mode enabled |
| **React** | React | 19.2.4 | Latest with RSC support |
| **Database** | PostgreSQL (Neon serverless) | — | Cloud-hosted, connection pooling |
| **ORM** | Prisma | ^7.8.0 | With `@prisma/adapter-pg` driver adapter |
| **Styling** | Tailwind CSS v4 | ^4 | Via `@tailwindcss/postcss` |
| **UI Components** | shadcn/ui | ^4.8.3 | Radix-nova style, lucide icons |
| **Form Handling** | react-hook-form | ^7.77.0 | (installed, not yet used in pages) |
| **Validation** | Zod | ^4.4.3 | (installed, not yet used in API validation) |
| **Fonts** | Geist Sans + Geist Mono | — | Via `next/font/google` |
| **Icons** | Lucide React | ^1.17.0 | — |

---

## 3. Repository Structure (File Map)

```
task-management/
├── .env                        # Environment variables (gitignored)
├── .env.example                # Template: DATABASE_URL, JWT_SECRET
├── .gitignore
├── package.json                # Scripts: dev, build, start, lint, postinstall
├── tsconfig.json               # Strict TS, path alias @/* → ./*
├── next.config.ts              # Next.js config (empty, defaults)
├── prisma.config.ts            # Prisma config — schema path, migration dir
├── postcss.config.mjs          # PostCSS → @tailwindcss/postcss
├── eslint.config.mjs           # ESLint with next core-web-vitals + TS
├── components.json             # shadcn/ui config (radix-nova, lucide)
│
├── prisma/
│   ├── schema.prisma           # ★ DATABASE SCHEMA — all models defined here
│   └── migrations/
│       ├── migration_lock.toml
│       └── 20260617063312_init/  # Initial migration
│
├── generated/
│   └── prisma/                 # Auto-generated Prisma Client (gitignored)
│
├── lib/
│   ├── auth.ts                 # ★ Auth utilities: hash, verify, JWT, cookie
│   ├── db.ts                   # ★ Prisma Client singleton
│   └── utils.ts                # cn() for classnames, slugify()
│
├── hooks/
│   └── use-mobile.ts           # useIsMobile() — breakpoint 768px
│
├── components/
│   ├── app-sidebar.tsx          # ★ Main navigation sidebar
│   ├── page-title.tsx           # Static "Tasks" page title
│   │
│   ├── ui/                      # shadcn/ui primitives (DO NOT EDIT DIRECTLY)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── sidebar.tsx          # Full sidebar system component
│   │   ├── skeleton.tsx
│   │   └── tooltip.tsx
│   │
│   ├── header/
│   │   ├── top-header.tsx       # Sticky top bar — search, help, notifications
│   │   ├── action-bars.tsx      # Member avatars + Invite/Share buttons
│   │   └── breadcrumb.tsx       # Generic breadcrumb component
│   │
│   ├── board/                   # ★ EMPTY — Kanban board components (to build)
│   │   ├── kanban-board.tsx     # (empty file)
│   │   ├── board-column.tsx     # (empty file)
│   │   ├── task-card.tsx        # (empty file)
│   │   └── task-tabs.tsx        # (empty file)
│   │
│   ├── task/
│   │   └── taskPopup.tsx        # Broken prototype — references undefined <Form>
│   │
│   └── data/
│       └── members.ts           # Mock member data (5 members)
│
├── app/
│   ├── layout.tsx               # ROOT LAYOUT — Geist fonts, html/body
│   ├── page.tsx                 # LANDING PAGE — hero + "Login" CTA
│   ├── globals.css              # Tailwind + shadcn theme tokens (light/dark)
│   ├── favicon.ico
│   ├── notes                    # ★ PROTOTYPE: Full Kanban board with drag-drop
│   │
│   ├── (auth)/                  # AUTH ROUTE GROUP (no sidebar)
│   │   ├── layout.tsx           # Minimal layout: bg-slate-50
│   │   ├── sign-in/
│   │   │   └── page.tsx         # Sign-in form → POST /api/auth/signin
│   │   └── sign-up/
│   │       └── page.tsx         # Sign-up form → POST /api/auth/signup
│   │
│   ├── (dashboard)/             # DASHBOARD ROUTE GROUP (sidebar + header)
│   │   ├── layout.tsx           # SidebarProvider + AppSidebar + TopHeader
│   │   ├── dashboard/
│   │   │   └── page.tsx         # Dashboard home — PageTitle + MemberGroup
│   │   └── workspaces/
│   │       ├── [workspacesId]/   # (empty — workspace detail page)
│   │       ├── projects/
│   │       │   └── [projectId]/
│   │       │       └── page.tsx  # (empty — project detail page)
│   │       └── tasks/
│   │           └── [taskId]/
│   │               └── page.tsx  # (empty — task detail page)
│   │
│   └── api/
│       ├── auth/
│       │   ├── signin/
│       │   │   ├── route.ts     # POST — email/password login → set cookie
│       │   │   └── route.js     # (duplicate .js, should be cleaned up)
│       │   ├── signup/
│       │   │   ├── route.ts     # POST — create user → set cookie
│       │   │   └── route.js     # (duplicate .js)
│       │   ├── me/
│       │   │   ├── route.ts     # GET — return current user from cookie
│       │   │   └── route.js     # (duplicate .js)
│       │   └── logout/
│       │       ├── route.ts     # POST — clear cookie → redirect /sign-in
│       │       └── route.js     # (duplicate .js)
│       ├── workspaces/
│       │   ├── route.ts         # POST (formData) — create/rename/delete workspace
│       │   └── [id]/
│       │       └── route.ts     # GET / PATCH / DELETE — workspace CRUD
│       ├── projects/            # (empty directory — not implemented)
│       ├── task/
│       │   └── route.ts         # POST — stub "Hello from Task API"
│       └── test/
│           └── route.ts         # GET — list all users (dev/debug only)
│
├── public/
│   ├── girl3.jpg                # User avatar placeholder
│   ├── task-management.webp     # App logo/image
│   ├── file.svg, globe.svg      # Default Next.js icons
│   ├── next.svg, vercel.svg     # Branding SVGs
│   └── window.svg
│
├── Features/                    # (empty — placeholder for feature modules)
│
└── ZDoc/
    └── master_doc.md            # ★ THIS FILE — project documentation
```

---

## 4. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     BROWSER (Client)                     │
│                                                          │
│  Landing Page ─→ Auth Forms ─→ Dashboard (Sidebar+Header)│
│                                    │                     │
│                        Kanban Board / Task Views          │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP / Form Submissions
                         ▼
┌─────────────────────────────────────────────────────────┐
│               NEXT.JS APP ROUTER (Server)                │
│                                                          │
│  ┌──────────┐  ┌────────────┐  ┌───────────────────┐    │
│  │  Pages   │  │ API Routes │  │ Server Components │    │
│  │ (RSC)    │  │ /api/*     │  │ (layouts, pages)  │    │
│  └──────────┘  └─────┬──────┘  └───────────────────┘    │
│                      │                                   │
│              ┌───────┴────────┐                          │
│              │   lib/auth.ts  │  JWT token creation,     │
│              │   lib/db.ts    │  password hashing,       │
│              │   lib/utils.ts │  Prisma client           │
│              └───────┬────────┘                          │
│                      │                                   │
│              ┌───────┴────────┐                          │
│              │ Prisma Client  │                          │
│              │ (generated)    │                          │
│              └───────┬────────┘                          │
└──────────────────────┼──────────────────────────────────┘
                       │ SQL over TLS
                       ▼
              ┌─────────────────┐
              │  Neon PostgreSQL │
              │  (Serverless)   │
              └─────────────────┘
```

**Key Architecture Decisions:**
- **Server-first rendering** — All pages are React Server Components by default. Client components use `"use client"` directive.
- **Cookie-based auth** — Custom JWT implementation (no NextAuth/Clerk). Token stored in `httpOnly` cookie.
- **Form actions via native HTML** — Auth forms use `action="/api/auth/..."` with `method="post"` (no client-side fetch).
- **Prisma with pg adapter** — Uses `@prisma/adapter-pg` for Neon PostgreSQL compatibility.
- **ShadCN/UI** — Pre-built Radix-based components in `components/ui/`. NOT to be edited directly (managed by shadcn CLI).

---

## 5. Database Schema (Prisma)

### Entity Relationship Diagram

```
User ──────┬──── WorkspaceMember ──── Workspace
           │                              │
           │                          Project
           │                          │      │
           │                    TaskColumn  Tag
           │                         │       │
           ├── TaskAssignee ──── Task ── TaskTag
           │                    │  │  │
           ├── Comment ─────────┘  │  │
           │                       │  │
           └── ActivityLog ────────┘  │
                                      │
                              ChecklistItem
                              Attachment
```

### Models Reference

| Model | Purpose | Key Fields |
|-------|---------|------------|
| **User** | Application user | `id` (cuid), `name`, `email` (unique), `image?`, `passwordHash?` |
| **Workspace** | Team/org container | `id`, `name`, `slug` (unique), `description?` |
| **WorkspaceMember** | User ↔ Workspace join table | `workspaceId`, `userId`, `role` (OWNER/ADMIN/MEMBER/VIEWER) |
| **Project** | Project within workspace | `id`, `name`, `description?`, `color?`, `icon?`, `workspaceId` |
| **TaskColumn** | Kanban column | `id`, `title`, `position` (int), `projectId` |
| **Task** | Primary work item | `id`, `title`, `description?`, `priority` (LOW/MEDIUM/HIGH/URGENT), `dueDate?`, `position`, `projectId`, `columnId`, `createdById?` |
| **TaskAssignee** | Task ↔ User join (many-to-many) | `taskId`, `userId` (unique pair) |
| **Tag** | Label for categorization | `id`, `name`, `color?`, `projectId` (unique per project) |
| **TaskTag** | Task ↔ Tag join (many-to-many) | `taskId`, `tagId` (unique pair) |
| **Comment** | Discussion on task | `id`, `body`, `taskId`, `authorId` |
| **ChecklistItem** | Subtask within task | `id`, `title`, `done` (bool), `position`, `taskId` |
| **Attachment** | File attached to task | `id`, `filename`, `url`, `size?`, `mimetype?`, `taskId` |
| **ActivityLog** | Audit trail | `id`, `taskId`, `actorId`, `action` (string), `meta` (JSON) |

### Enums

```prisma
enum WorkspaceRole { OWNER, ADMIN, MEMBER, VIEWER }
enum Priority       { LOW, MEDIUM, HIGH, URGENT }
```

### Important Schema Notes
- All IDs use `cuid()` (Collision-resistant Unique Identifiers)
- `User.passwordHash` is nullable (future OAuth support)
- `Task.createdBy` is optional — not all creation paths set it yet
- Cascade deletes are NOT configured — workspace deletion manually deletes projects first
- No `onDelete: Cascade` on any relation — **this needs to be added**

---

## 6. API Routes

### Authentication

| Method | Endpoint | Input | Behavior |
|--------|----------|-------|----------|
| `POST` | `/api/auth/signup` | FormData: `name`, `email`, `password` | Creates user, sets `auth_token` cookie, redirects to `/dashboard` |
| `POST` | `/api/auth/signin` | FormData: `email`, `password` | Validates credentials, sets cookie, redirects to `/dashboard` |
| `GET` | `/api/auth/me` | Cookie: `auth_token` | Returns `{ user: { id, name, email, image } }` or `401` |
| `POST` | `/api/auth/logout` | — | Clears cookie, redirects to `/sign-in` |

### Workspaces

| Method | Endpoint | Input | Behavior |
|--------|----------|-------|----------|
| `POST` | `/api/workspaces` | FormData: `_action` + fields | Multi-action: `create` (name), `rename` (workspaceId, name), `delete` (workspaceId). Redirects to referer. |
| `GET` | `/api/workspaces/[id]` | URL param: `id` | Returns workspace with `projects` and `members` included |
| `PATCH` | `/api/workspaces/[id]` | JSON body: `{ name }` | Updates workspace name + slug |
| `DELETE` | `/api/workspaces/[id]` | URL param: `id` | Deletes all projects then workspace |

### Tasks

| Method | Endpoint | Input | Behavior |
|--------|----------|-------|----------|
| `POST` | `/api/task` | — | **Stub only** — returns `{ message: "Hello from Task API" }` |

### Debug / Development

| Method | Endpoint | Behavior |
|--------|----------|----------|
| `GET` | `/api/test` | Returns all users (dev only — ⚠️ remove before production) |

### Unimplemented API Routes (Needed)
- `POST/GET /api/projects` — Create and list projects
- `GET/PATCH/DELETE /api/projects/[id]` — Project CRUD
- `POST/GET /api/tasks` — Create and list tasks within a project
- `GET/PATCH/DELETE /api/tasks/[id]` — Task CRUD
- `POST/DELETE /api/tasks/[id]/assignees` — Manage assignees
- `POST/GET/DELETE /api/tasks/[id]/comments` — Comments
- `POST/PATCH/DELETE /api/tasks/[id]/checklist` — Checklist items
- `POST/DELETE /api/tasks/[id]/attachments` — File attachments
- `POST/GET /api/workspaces/[id]/members` — Invite/manage members

---

## 7. Frontend Pages & Routing

### Route Groups

Next.js **route groups** (parentheses in folder names) are used to apply different layouts without affecting the URL:

| Route Group | Layout | Provides |
|-------------|--------|----------|
| `(auth)` | Minimal `bg-slate-50` wrapper | Auth pages without sidebar |
| `(dashboard)` | `SidebarProvider` + `AppSidebar` + `TopHeader` | All logged-in pages |

### All Pages

| URL Path | File | Status | Description |
|----------|------|--------|-------------|
| `/` | `app/page.tsx` | ✅ Done | Landing page with hero + "Login" CTA |
| `/sign-in` | `app/(auth)/sign-in/page.tsx` | ✅ Done | Email/password sign-in form |
| `/sign-up` | `app/(auth)/sign-up/page.tsx` | ✅ Done | Name/email/password sign-up form |
| `/dashboard` | `app/(dashboard)/dashboard/page.tsx` | ⚠️ Partial | Shows page title + member avatars only |
| `/workspaces/[workspacesId]` | `app/(dashboard)/workspaces/[workspacesId]/` | ❌ Empty | Workspace detail (not implemented) |
| `/workspaces/projects/[projectId]` | `app/(dashboard)/workspaces/projects/[projectId]/page.tsx` | ❌ Empty | Project board view (not implemented) |
| `/workspaces/tasks/[taskId]` | `app/(dashboard)/workspaces/tasks/[taskId]/page.tsx` | ❌ Empty | Task detail page (not implemented) |

---

## 8. Component Tree

```
RootLayout (app/layout.tsx)
├── [Landing] page.tsx
│
├── (auth) AuthLayout
│   ├── SignInPage
│   └── SignUpPage
│
└── (dashboard) DashboardLayout
    ├── SidebarProvider
    │   └── AppSidebar
    │       ├── SidebarHeader (user info — currently hardcoded)
    │       ├── SidebarContent
    │       │   ├── Menu: Dashboard, Inbox
    │       │   ├── Team Spaces: Tasks, Docs, Meetings
    │       │   └── Settings: Settings, Support
    │       └── SidebarFooter (empty)
    ├── SidebarTrigger
    ├── TopHeader
    │   ├── Search input
    │   ├── Help button
    │   └── Notifications button
    └── {children}
        └── DashboardPage
            ├── PageTitle ("Tasks")
            └── MemberGroup
                ├── Avatar circles (from mock data)
                ├── Invite button
                └── Share button
```

### Component Details

| Component | File | Type | Description |
|-----------|------|------|-------------|
| `AppSidebar` | `components/app-sidebar.tsx` | Server | Main navigation sidebar with 3 sections (Menu, Team Spaces, Settings). **User info is hardcoded** ("Lisa modi"). Sidebar URLs all point to `/` (placeholder). |
| `TopHeader` | `components/header/top-header.tsx` | Server | Sticky top bar with search, help icon, bell icon. Search is non-functional (no handler). |
| `MemberGroup` | `components/header/action-bars.tsx` | Server | Shows first 4 member avatars with overflow count + Invite/Share buttons. Uses mock data from `data/members.ts`. |
| `Breadcrumb` | `components/header/breadcrumb.tsx` | Server | Reusable breadcrumb nav. Takes `items: { label, href? }[]`. Used in the prototype `notes` file. |
| `PageTitle` | `components/page-title.tsx` | Server | Static heading: "Tasks" + subtitle. |
| `taskPopup` | `components/task/taskPopup.tsx` | Client | **Broken** — references `<Form>` which is not imported. Needs rewrite. |

### Prototype Reference (`app/notes`)

The `app/notes` file contains a **complete working Kanban board prototype** with:
- Column rendering (To Do, In Progress, Done)
- Drag-and-drop between columns (native HTML5 API)
- Tab switching (Overview, Board, List, Table, Timeline)
- Task cards with priority badges, assignee avatars, due dates
- Breadcrumb navigation
- Filter/Sort/Group By toolbar

This prototype uses **hardcoded data** and is a `"use client"` component. It serves as the **design reference** for building the actual board components.

---

## 9. Authentication Flow

### How It Works

```
                    SIGN UP / SIGN IN
                          │
    ┌─────────────────────┴─────────────────────┐
    │                                           │
    ▼                                           ▼
 HTML <form>                              HTML <form>
 action="/api/auth/signup"               action="/api/auth/signin"
 method="post"                            method="post"
    │                                           │
    ▼                                           ▼
 API Route: POST                          API Route: POST
 ├── Parse formData                       ├── Parse formData
 ├── Validate fields                      ├── Find user by email
 ├── Check email uniqueness               ├── verifyPassword()
 ├── hashPassword()                       ├── createToken({ userId })
 ├── prisma.user.create()                 ├── Set httpOnly cookie
 ├── createToken({ userId })              └── Redirect → /dashboard
 ├── Set httpOnly cookie
 └── Redirect → /dashboard

                    AUTHENTICATED REQUEST
                          │
                          ▼
                  getUserFromRequest()
                  ├── Parse cookie header
                  ├── Extract auth_token
                  ├── verifyToken() — HMAC-SHA256
                  │   ├── Validate signature
                  │   └── Check expiry
                  └── prisma.user.findUnique()
                      └── Return user or null
```

### Token Details
- **Format:** `base64url(payload).base64url(HMAC-SHA256 signature)`
- **Payload:** `{ userId: string, exp: number }`
- **TTL:** 7 days (`1000 * 60 * 60 * 24 * 7` ms)
- **Cookie name:** `auth_token`
- **Cookie flags:** `httpOnly`, `secure` (prod only), `sameSite: lax`, `path: /`
- **Password hashing:** `scrypt` with random 16-byte salt, 64-byte key length
- **Signature validation:** `timingSafeEqual` (timing-attack resistant)

### ⚠️ Missing Auth Features
- No middleware to protect routes (any page is accessible without login)
- No CSRF protection
- No rate limiting
- No password reset flow
- No OAuth/social login
- Sidebar user info is hardcoded (not from session)

---

## 10. Utility Libraries

### `lib/auth.ts` — Authentication

| Export | Type | Description |
|--------|------|-------------|
| `hashPassword(password)` | Function | Returns `salt:hash` string using scrypt |
| `verifyPassword(password, hash)` | Function | Constant-time comparison of password against stored hash |
| `createToken({ userId })` | Function | Creates HMAC-signed base64url token with 7-day expiry |
| `verifyToken(token)` | Function | Validates signature + expiry, returns `{ userId }` |
| `getUserFromRequest(request)` | Async Function | Extracts user from cookie, returns Prisma `User` or `null` |
| `AUTH_COOKIE_NAME` | Constant | `"auth_token"` |
| `AUTH_COOKIE_MAX_AGE` | Constant | `604800` (7 days in seconds) |

### `lib/db.ts` — Database Client

- Creates a **singleton** `PrismaClient` with the `@prisma/adapter-pg` driver
- In dev mode, stores client on `globalThis` to survive HMR
- Reads `DATABASE_URL` from environment
- Generated client outputs to `generated/prisma/`

### `lib/utils.ts` — General Utilities

| Export | Description |
|--------|-------------|
| `cn(...inputs)` | Merges Tailwind classes using `clsx` + `tailwind-merge` |
| `slugify(value)` | Converts string to URL-safe slug (`"My Workspace"` → `"my-workspace"`) |

### `hooks/use-mobile.ts` — Mobile Detection

| Export | Description |
|--------|-------------|
| `useIsMobile()` | Returns `boolean` — `true` if viewport < 768px |

---

## 11. Styling & Design System

### CSS Architecture
- **Tailwind CSS v4** — via `@tailwindcss/postcss` plugin
- **tw-animate-css** — CSS animation utilities for Tailwind
- **shadcn/ui theme** — CSS custom properties in `globals.css`
- **Light + Dark mode** tokens defined (dark mode via `.dark` class)

### Color System (Light Mode Defaults)
| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `oklch(0.205 0 0)` | Near-black — primary buttons/text |
| `--accent` | `oklch(0.97 0 0)` | Very light gray — accent areas |
| `--destructive` | `oklch(0.577 0.245 27.325)` | Red — delete/error |
| `--border` | `oklch(0.922 0 0)` | Light gray borders |

### Design Conventions
- **Border radius:** Base `0.625rem`, scales from `sm` (0.6x) to `4xl` (2.6x)
- **Fonts:** Geist Sans (body), Geist Mono (code)
- **Primary accent in UI:** `violet-500`/`violet-600` (used in forms, buttons, avatars)
- **Card style:** `rounded-3xl border border-slate-200 bg-white shadow-sm`
- **shadcn style:** `radix-nova` base style with `neutral` base color

---

## 12. Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ Yes | Neon PostgreSQL connection string (pooled URL with `?sslmode=require`) |
| `JWT_SECRET` | ✅ Yes | Long random string for HMAC-SHA256 token signing |

**Setup:** Copy `.env.example` → `.env` and fill in values.

---

## 13. Development Setup

```bash
# 1. Clone the repo
git clone <repo-url>
cd task-management

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Fill in DATABASE_URL (Neon) and JWT_SECRET

# 4. Generate Prisma Client
npx prisma generate

# 5. Run migrations (first time)
npx prisma migrate dev

# 6. Start dev server
npm run dev
# → http://localhost:3000
```

### Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `next dev` | Start development server with HMR |
| `build` | `prisma generate && next build` | Generate Prisma client + production build |
| `start` | `next start` | Start production server |
| `lint` | `eslint` | Run ESLint |
| `postinstall` | `prisma generate` | Auto-generate Prisma client after `npm install` |

---

## 14. Current Implementation Status

### ✅ Completed
- [x] Next.js App Router project setup with TypeScript
- [x] PostgreSQL database connection (Neon + Prisma)
- [x] Complete database schema (12 models, 2 enums)
- [x] Initial migration applied
- [x] User registration (sign-up API + page)
- [x] User login (sign-in API + page)
- [x] User logout (API route)
- [x] Session retrieval (`/api/auth/me`)
- [x] Custom JWT authentication (no 3rd-party dependency)
- [x] Password hashing with scrypt
- [x] Workspace CRUD API (create, rename, delete)
- [x] Workspace detail API (GET by ID with projects + members)
- [x] Dashboard layout with collapsible sidebar
- [x] Top header with search bar, help, and notification buttons
- [x] Landing page
- [x] ShadCN/UI component library installed (7 components)
- [x] Mobile detection hook
- [x] Breadcrumb component
- [x] Member avatar group component
- [x] Kanban board prototype (in `notes` file — reference implementation)

### ⚠️ Partially Done
- [ ] Dashboard page (has layout but no real content/data)
- [ ] Sidebar navigation (links all go to `/`, user info hardcoded)
- [ ] Task popup form (broken — references undefined `<Form>`)

### ❌ Not Started
- [ ] Route protection middleware
- [ ] Project CRUD (API + UI)
- [ ] Task CRUD (API + UI)
- [ ] Kanban board (actual components in `components/board/` are empty)
- [ ] Task detail page
- [ ] Drag-and-drop (actual — prototype exists in `notes`)
- [ ] Comments system
- [ ] Checklist items
- [ ] File attachments
- [ ] Tags/labels
- [ ] Activity log / audit trail
- [ ] Member invitation system
- [ ] Role-based access control (RBAC enforcement)
- [ ] Search functionality
- [ ] Filter/sort tasks
- [ ] Notifications
- [ ] User profile/settings
- [ ] Workspace settings

---

## 15. Phased Roadmap

### Phase 1 — Core Foundation *(Current)*
> Get the basic loop working: sign up → create workspace → create project → add tasks on a Kanban board.

| # | Task | Priority |
|---|------|----------|
| 1.1 | **Auth middleware** — protect `/dashboard` and all `(dashboard)` routes; redirect unauthenticated users to `/sign-in` | 🔴 High |
| 1.2 | **Dynamic sidebar** — fetch current user from cookie, display real name/email; fetch user's workspaces and render in sidebar | 🔴 High |
| 1.3 | **Workspace creation UI** — modal/dialog on dashboard to create a workspace; redirect to workspace page after creation | 🔴 High |
| 1.4 | **Workspace page** — `/workspaces/[workspacesId]` — show workspace details, list of projects, members | 🔴 High |
| 1.5 | **Project CRUD API** — `POST/GET/PATCH/DELETE /api/projects` | 🔴 High |
| 1.6 | **Project creation UI** — within workspace page, create a new project with default columns (To Do, In Progress, Done) | 🔴 High |
| 1.7 | **Task CRUD API** — `POST/GET/PATCH/DELETE /api/tasks` with column assignment | 🔴 High |
| 1.8 | **Kanban board** — build `kanban-board.tsx`, `board-column.tsx`, `task-card.tsx` from the `notes` prototype; connect to real API | 🔴 High |
| 1.9 | **Task creation** — modal/sheet to create a task with title, description, priority, column selection | 🔴 High |
| 1.10 | **Drag-and-drop** — reorder tasks within and between columns (update `position` and `columnId` via API) | 🟡 Medium |

### Phase 2 — Task Detail & Collaboration
> Rich task management and team features.

| # | Task | Priority |
|---|------|----------|
| 2.1 | **Task detail page** — `/workspaces/tasks/[taskId]` — full task view with all fields | 🔴 High |
| 2.2 | **Task editing** — inline editing of title, description, priority, due date | 🔴 High |
| 2.3 | **Assignee management** — add/remove assignees on a task | 🔴 High |
| 2.4 | **Comments API + UI** — threaded comments on tasks | 🟡 Medium |
| 2.5 | **Checklist items** — add subtasks to a task, toggle done state | 🟡 Medium |
| 2.6 | **Tags/labels** — create project-level tags, assign to tasks, filter by tags | 🟡 Medium |
| 2.7 | **Activity log** — auto-record actions (task created, moved, edited, commented) | 🟡 Medium |
| 2.8 | **Member invitation** — invite users to workspace by email, assign role | 🟡 Medium |

### Phase 3 — Views & Navigation
> Multiple ways to view and find tasks.

| # | Task | Priority |
|---|------|----------|
| 3.1 | **List view** — table-style flat list of all tasks with sorting | 🟡 Medium |
| 3.2 | **Search** — full-text search across tasks, comments, projects | 🟡 Medium |
| 3.3 | **Filters** — filter by priority, assignee, tag, due date, status | 🟡 Medium |
| 3.4 | **Table view** — spreadsheet-like view with inline editing | 🟢 Low |
| 3.5 | **Timeline view** — Gantt-style timeline | 🟢 Low |
| 3.6 | **Dashboard overview** — charts, stats, recent activity | 🟡 Medium |

### Phase 4 — Polish & Security
> Production hardening.

| # | Task | Priority |
|---|------|----------|
| 4.1 | **RBAC enforcement** — check workspace role on every API call | 🔴 High |
| 4.2 | **Cascade deletes** — add `onDelete: Cascade` where needed in schema | 🔴 High |
| 4.3 | **API validation** — use Zod schemas for all API request bodies | 🔴 High |
| 4.4 | **Error handling** — consistent error responses, toast notifications | 🟡 Medium |
| 4.5 | **Loading states** — skeleton loaders for all data-fetching pages | 🟡 Medium |
| 4.6 | **Responsive design** — full mobile support | 🟡 Medium |
| 4.7 | **Dark mode toggle** — (tokens already defined, needs toggle UI) | 🟢 Low |
| 4.8 | **CSRF protection** — for form-based mutations | 🟡 Medium |
| 4.9 | **Rate limiting** — on auth endpoints | 🟡 Medium |
| 4.10 | **Clean up** — remove `route.js` duplicates, `app/notes` file, test endpoint, unused imports | 🟡 Medium |

### Phase 5 — Advanced Features
> SaaS-grade features for growth.

| # | Task | Priority |
|---|------|----------|
| 5.1 | **File attachments** — upload to S3/R2, link to tasks | 🟡 Medium |
| 5.2 | **Real-time updates** — WebSocket or SSE for live board sync | 🟢 Low |
| 5.3 | **Notifications** — in-app notification system | 🟡 Medium |
| 5.4 | **OAuth** — Google/GitHub sign-in (schema supports nullable passwordHash) | 🟡 Medium |
| 5.5 | **User settings** — profile picture, name change, password change | 🟡 Medium |
| 5.6 | **Workspace settings** — workspace name edit, member role management, danger zone | 🟡 Medium |
| 5.7 | **Email notifications** — task assignment, due date reminders | 🟢 Low |
| 5.8 | **Billing/subscription** — Stripe integration for paid tiers | 🟢 Low |

---

## 16. Coding Conventions & Guidelines

### File & Folder Naming
- **Pages/routes:** `kebab-case` folders, `page.tsx` files
- **Components:** `kebab-case.tsx` for files (e.g., `task-card.tsx`), `PascalCase` for exports
- **Utilities:** `camelCase.ts`
- **Route groups:** Parenthesized folders `(auth)`, `(dashboard)`

### Component Patterns
- **Server Components by default** — only add `"use client"` when you need hooks, event handlers, or browser APIs
- **shadcn/ui components** live in `components/ui/` — do NOT edit these files directly. Use the shadcn CLI to add/update.
- **Custom components** go in `components/` root or feature folders (`board/`, `header/`, `task/`)
- **Data fetching** happens in Server Components or API routes — no `useEffect` fetching

### API Route Patterns
- Use `NextResponse.json()` for JSON responses
- Use `NextResponse.redirect()` for form submissions
- Always validate input before database operations
- Use `getUserFromRequest(request)` to get the authenticated user
- Return proper HTTP status codes (400, 401, 404, 409, etc.)

### Database Patterns
- Always use `prisma` singleton from `@/lib/db`
- Use `include` for eager relations, not separate queries
- Use `slugify()` from `@/lib/utils` when creating slugs
- Use `cuid()` for all IDs (Prisma default)

### Import Aliases
- `@/*` maps to the project root (`./`)
- Use `@/components/...`, `@/lib/...`, `@/hooks/...`

---

## 17. Known Issues & Tech Debt

| Issue | Severity | Location | Description |
|-------|----------|----------|-------------|
| Duplicate route files | 🟡 Medium | `app/api/auth/*/route.js` | Each auth endpoint has both `.ts` and `.js` files. Remove the `.js` files. |
| Hardcoded sidebar user | 🔴 High | `components/app-sidebar.tsx` | User displays "Lisa modi / lisa111@gmail.com" — needs to fetch from session |
| All sidebar links go to `/` | 🟡 Medium | `components/app-sidebar.tsx` | Navigation items are placeholder — need real routes |
| Broken taskPopup | 🟡 Medium | `components/task/taskPopup.tsx` | References undefined `<Form>` component |
| Unused import | 🟢 Low | `components/app-sidebar.tsx` | `import { check } from "zod"` — not used |
| No route protection | 🔴 High | All `(dashboard)` routes | Anyone can access dashboard pages without signing in |
| No cascade deletes | 🔴 High | `prisma/schema.prisma` | Deleting a workspace with tasks will fail due to FK constraints |
| `app/notes` file | 🟢 Low | `app/notes` | Prototype file in app dir — not a real page, should be moved to `ZDoc/` or deleted after extracting components |
| Test endpoint exposed | 🟡 Medium | `app/api/test/route.ts` | Returns all users — must be removed or protected before production |
| No API validation | 🟡 Medium | All API routes | No Zod validation — relying on manual checks |
| `app/api/projects/` empty | 🟢 Low | `app/api/projects/` | Empty directory — either implement or remove |
| Mixed line endings | 🟢 Low | Multiple files | Mix of CRLF and LF — add `.editorconfig` or configure Git `autocrlf` |

---

> **For AI IDEs:** When implementing new features, always check the [Phased Roadmap](#15-phased-roadmap) for the next priority items and follow the [Coding Conventions](#16-coding-conventions--guidelines). Reference the [Database Schema](#5-database-schema-prisma) for available models and the [API Routes](#6-api-routes) section for the current API surface.
