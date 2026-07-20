# SaaS / HRIS — Full Tech Stack Reference

> **Status:** Reference architecture document. HRIS module has Sprint 1–2 features implemented (Employee CRUD, Branch/Department/Position management, Org Chart, RBAC, SP-DID). Sprints 3–7 (Attendance, Leave, Payroll, Turnover Analytics, Onboarding) are planned but not yet implemented.
>
> Aligned with the Phase 1 HRIS implementation plan (PRD v4.0). This is the exact tech stack, architecture, conventions, and dependencies used to build a multi-tenant HRIS SaaS (employee management, attendance, leave, payroll, org structure, RBAC, onboarding/offboarding).

---

## Layer 1 — Runtime & Package Managers

| Role | Choice | Version | Notes |
|---|---|---|---|
| Backend runtime | **Go** | 1.26+ | Single binary, fast compile, excellent concurrency for WebSocket attendance |
| JS runtime / tooling | **Bun** | ≥1.x | npm-compatible, 10x faster installs, runs concurrently for dev |
| Database | **PostgreSQL** | 16-alpine | JSONB for flexible fields, recursive CTEs for org trees, `gen_random_uuid()` PKs |

---

## Layer 2 — Backend (Go)

All imports are exactly what the plan specifies.

| Library | Purpose | Module |
|---|---|---|
| `gin-gonic/gin` | HTTP framework + middleware | All route handlers |
| `gin-contrib/cors` | CORS middleware | Server bootstrap |
| `jackc/pgx/v5` | PostgreSQL driver via `pgxpool.Pool` | `internal/db/` |
| `go-jet/jet/v2` | Type-safe SQL query builder (database-first codegen) | All `internal/*/` queries |
| `golang-jwt/jwt/v5` | JWT auth (HS256 Bearer tokens) | `internal/middleware/auth.go` |
| `joho/godotenv` | .env file loading | `cmd/server/main.go` |
| `google/uuid` | UUID generation & parsing | RBAC middleware, queries |
| `golang.org/x/crypto` | bcrypt + argon2id password hashing | `internal/lib/password.go` |
| `swaggo/swag` | Swagger/OpenAPI spec generation | CLI tool |
| `swaggo/gin-swagger` | Swagger UI serving | `cmd/server/main.go` |
| `go-playground/validator/v10` | Request body struct validation | Handler request types |
| `gorilla/websocket` | WebSocket for live attendance dashboard | `internal/hris/attendance/` (Sprint 3) |
| `xuri/excelize/v2` | XLSX export (attendance with formatting) | `internal/hris/attendance/export.go` (Sprint 6) |
| `signintech/gopdf` or `jung-kurt/gofpdf` | Payslip PDF generation | `internal/hris/payroll/` (Sprint 5) |

---

## Layer 3 — Frontend (React + Vite)

| Library | Purpose | Used In |
|---|---|---|
| **React 19** | UI framework | All pages |
| **react-router-dom v7** | Client-side routing (`/hris/*` route group) | `App.tsx` |
| **@tanstack/react-query v5** | Server state, caching, stale-while-revalidate | All HRIS list/detail pages |
| **react-hook-form v7** | Form state management | Employee create/edit, leave request, shift config |
| **zod v4** | Schema validation (forms + API response shapes) | Form schemas, API type guards |
| **@hookform/resolvers** | Bridge react-hook-form ↔ zod | All forms with validation |
| **lucide-react** | Icon library | Sidebar nav, action buttons, status indicators |
| **date-fns** | Date math (leave working-day calc, tenure, attendance calendar) | Leave, attendance, payroll periods |
| **recharts** / **@nivo** | Dashboard charts (headcount trend, dept distribution) | Turnover dashboard (Sprint 6) |
| **react-big-calendar** | Team leave calendar view | Leave Calendar (Sprint 4) |
| **react-d3-tree** (optional) | Interactive org chart with expandable nodes | Org Chart (Sprint 2) |

---

## Layer 4 — Build & Dev Tooling

| Tool | Purpose | Config File |
|---|---|---|
| **Vite 7** | Frontend bundler + dev server | `web/vite.config.ts` |
| **@vitejs/plugin-react** | React Fast Refresh | `web/vite.config.ts` |
| **@tailwindcss/vite v4** | Tailwind as Vite plugin (no PostCSS config) | `web/vite.config.ts` |
| **Tailwind CSS v4** | Utility-first CSS | `web/src/styles/index.css` (`@import "tailwindcss"`) |
| **DaisyUI 5** | Prebuilt component classes (tables, forms, modals, badges) | `web/src/styles/index.css` (`@plugin "daisyui"`) |
| **TypeScript** ~5.8+ | Type checking | `web/tsconfig.json` |
| **Biome 2.4** | Linter + formatter (single binary, replaces ESLint + Prettier) | `biome.json` |
| **concurrently** | Run `go run ./cmd/server/` + `bun --cwd web dev` in parallel | `package.json` scripts |

### Config snippets

```ts
// web/vite.config.ts — proxy /api to Go server, embed vitest config
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 4200, proxy: { '/api': 'http://localhost:1234' } },
  test: { environment: 'happy-dom', pool: 'threads', include: ['src/**/*.{test,spec}.{ts,tsx}'] },
});
```

```css
/* web/src/styles/index.css — Tailwind v4 + DaisyUI, no config file needed */
@import "tailwindcss";
@plugin "daisyui";
@theme {
  --font-sans: "Outfit", sans-serif;
  --font-mono: "Fira Code", monospace;
}
```

```json
// biome.json — single config for lint + format
{
  "formatter": { "indentStyle": "space", "indentWidth": 2, "lineWidth": 120 },
  "linter": { "rules": { "recommended": true } },
  "javascript": { "formatter": { "quoteStyle": "single", "semicolons": "always" } },
  "css": { "parser": { "tailwindDirectives": true } },
  "vcs": { "enabled": true, "clientKind": "git", "useIgnoreFile": true }
}
```

---

## Layer 5 — Testing

| Tool | Target | Config / Location |
|---|---|---|
| **vitest v3** | Frontend tests | `web/vitest.config.ts` (actual: 3.2+) |
| **happy-dom** | DOM environment (faster than jsdom) | `web/vitest.config.ts` |
| **@testing-library/react** | Component tests | `web/src/test/setup.ts` |
| **@testing-library/jest-dom** | DOM matchers | `web/src/test/setup.ts` |
| Go `testing` + `httptest` | Server handler tests | `*_test.go` alongside handlers |
| Go `testing` (pure unit) | Domain logic (tax calc, leave balance, attendance rules) | `internal/hris/payroll/tax_test.go`, etc. |

### Verification checklist (after each sprint)

1. `bun run db:migrate && bun run db:generate` — migrations apply cleanly, go-jet types regenerate
2. `go -C server-go test -p 1 ./...` — all backend tests pass
3. `bun --cwd web test` — all frontend tests pass
4. `bun --cwd web typecheck` — zero TypeScript errors
5. Manual browser smoke test on `bun run dev`

### Key integration tests (from the plan)

- **RBAC**: Every forbidden action per role returns 403
- **Multi-tenancy**: Company A cannot read Company B's employees/attendance/payroll
- **Payroll**: Parallel run vs manual calculation for 5 test employees
- **Attendance export**: Output matches the PRD Section 17 format spec
- **Leave**: Multi-level approval chain completes correctly

---

## Layer 6 — API Architecture

### Route groups

```
/api/v1
├── /auth/*               — Public: login, register, refresh
├── /profiles/*           — Public + authenticated: profiles
├── /jobs/*               — Public + authenticated: job listings
├── /applications/*       — Authenticated + role-gated
├── /notifications/*      — Authenticated
├── /admin/*              — Admin-only
│
└── /hris/*               — AUTHENTICATED + COMPANY MEMBER ONLY (new)
    ├── /employees/*       — CRUD
    ├── /branches/*        — CRUD + tree
    ├── /departments/*     — CRUD + tree
    ├── /positions/*       — CRUD
    ├── /org/tree          — Full org chart (recursive CTE)
    ├── /org/chart         — Same, enhanced with positions
    ├── /roles             — Role listing
    ├── /employees/:id/roles  — Assign roles
    │
    ├── /shifts/*          — CRUD (Sprint 3)
    ├── /attendance/*      — Clock in/out, dashboard, export (Sprint 3)
    ├── /attendance/ws     — WebSocket live (Sprint 3)
    ├── /attendance/exceptions/*  — Exception requests (Sprint 3)
    │
    ├── /leave/*           — Request, approve, balance (Sprint 4)
    ├── /leave/types/*     — Leave type config (Sprint 4)
    ├── /holidays/*        — Public holidays CRUD (Sprint 4)
    │
    ├── /payroll/*         — Config, runs, calculate, approve (Sprint 5)
    ├── /payroll/components/*  — Earning/deduction types (Sprint 5)
    │
    ├── /analytics/*       — Turnover KPIs (Sprint 6)
    │
    └── /checklists/*      — Onboarding/offboarding templates (Sprint 7)
```

### Wire in `cmd/server/main.go`

```go
hris := api.Group("/hris")
hris.Use(
    middleware.AuthRequired(cfg.JWTSecret),
    rbac.RequireCompanyMember(database),  // resolves user → employee → companyId
)
```

### Response convention (unchanged from existing project)

```go
gin.H{"error": "Invalid credentials"}               // errors
gin.H{"data": employee}                              // single resource
gin.H{"data": items, "total": count}                 // paginated list
gin.H{"message": "Leave request submitted"}          // action confirmation
```

---

## Layer 7 — Frontend Architecture

### App structure

```tsx
// App.tsx — providers + router (existing marketplace routes + new /hris/*)
export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            <RouterProvider router={router} />
          </Suspense>
        </ErrorBoundary>
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

### HRIS route group

```tsx
// Routes in App.tsx — all /hris/* pages wrapped in HRISLayout (sidebar nav)
{
  path: '/hris',
  element: <ProtectedRoute><HRISLayout /></ProtectedRoute>,
  children: [
    { path: 'employees', element: <EmployeeList /> },
    { path: 'employees/new', element: <EmployeeCreate /> },
    { path: 'employees/:id', element: <EmployeeDetail /> },
    { path: 'org/chart', element: <OrgChart /> },
    { path: 'branches', element: <BranchManagement /> },
    { path: 'departments', element: <DepartmentManagement /> },
    { path: 'shifts', element: <ShiftConfig /> },
    { path: 'attendance', element: <AttendanceDashboard /> },
    { path: 'attendance/me', element: <MyAttendance /> },
    { path: 'attendance/exceptions', element: <AttendanceExceptions /> },
    { path: 'leave/request', element: <LeaveRequest /> },
    { path: 'leave/balance', element: <LeaveBalance /> },
    { path: 'leave/approvals', element: <LeaveApprovals /> },
    { path: 'leave/calendar', element: <LeaveCalendar /> },
    { path: 'leave/types', element: <LeaveTypeConfig /> },
    { path: 'holidays', element: <HolidayManagement /> },
    { path: 'payroll/config', element: <PayrollConfig /> },
    { path: 'payroll/runs', element: <PayrollRun /> },
    { path: 'payroll/runs/:id', element: <PayrollRunDetail /> },
    { path: 'payroll/components', element: <PayrollComponents /> },
    { path: 'payroll/payslip', element: <PayslipView /> },
    { path: 'analytics/turnover', element: <TurnoverDashboard /> },
    { path: 'checklists/templates', element: <ChecklistTemplates /> },
    { path: 'employees/:id/onboarding', element: <EmployeeOnboarding /> },
  ],
}
```

### Navbar integration

The existing top navbar shows an "HRIS" link conditionally for users who have an employee record (detected via `usePermission()` hook → `RequireCompanyMember` check).

### HRIS UI component files

```
src/components/hris/
├── HRISLayout.tsx        — Sidebar + topbar wrapper
├── HRISSidebar.tsx       — Navigation links (added to per sprint)
└── HRISBreadcrumbs.tsx   — Optional breadcrumb trail
```

### API client modules

```
src/lib/hris/
├── employees.ts    — Employee CRUD API calls
├── org.ts          — Branch, department, position API calls
├── rbac.ts         — Role/permission API calls
├── shifts.ts       — Shift config API calls
├── attendance.ts   — Clock in/out, dashboard, export
├── leave.ts        — Leave request, balance, approval
├── holidays.ts     — Public holiday API calls
├── payroll.ts      — Payroll run, config, component API calls
├── analytics.ts    — Turnover KPI API calls
└── checklists.ts   — Onboarding/offboarding checklist API calls
```

### Hooks

```typescript
// hooks/useAuth.tsx — existing, unchanged
const { user, login, logout, loading } = useAuth();

// hooks/usePermission.ts — NEW: HRIS permission checks
const { can, employee, roles } = usePermission();
// can('employee.create') → true/false
```

---

## Layer 8 — Database

### Connection pool

The plan specifies `pgxpool.Pool`, NOT `database/sql`:

```go
// internal/db/db.go
import "github.com/jackc/pgx/v5/pgxpool"

func Connect(ctx context.Context, databaseURL string) (*pgxpool.Pool, error) {
    pool, err := pgxpool.New(ctx, databaseURL)
    // Pool config: max 25 conns, 5 min idle
    return pool, nil
}
```

Handler structs receive `pool *pgxpool.Pool`:

```go
type EmployeeHandler struct {
    pool *pgxpool.Pool
}
```

### Migration conventions

Raw SQL files in `server-go/migrations/`. Timestamp-prefixed sequence:

```sql
-- 000012_hris_foundation.sql — Sprint 1 ✅ Implemented
-- 000013_spdid_records.sql  — Sprint 2 ✅ Implemented
-- 000014_hris_attendance.sql — Sprint 3 ⬜ Planned
-- 000015_hris_leave.sql      — Sprint 4 ⬜ Planned
-- 000016_hris_payroll.sql    — Sprint 5 ⬜ Planned
-- 000017_hris_turnover.sql   — Sprint 6 ⬜ Planned
-- 000018_hris_onboarding.sql — Sprint 7 ⬜ Planned
```

> **Note:** Actual migrations in the repo run from `000001_init.sql` through `000017_phase3_profile_views.sql`. The HRIS sprint migrations (`000012` and `000013`) are merged. See `server-go/migrations/` for the current migration state. Sprint 3–7 migrations have not been created yet.

SQL conventions (exact from the plan):

```sql
-- Enums use safe CREATE TYPE with exception guard
DO $$ BEGIN
    CREATE TYPE employment_type AS ENUM ('permanent', 'contract', 'probation', 'intern');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- PKs use gen_random_uuid()
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    name TEXT NOT NULL,
    parent_department_id UUID REFERENCES departments(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(company_id, name)
);

-- Foreign keys use ON DELETE CASCADE
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    user_id UUID REFERENCES users(id),  -- nullable: employees exist independently of marketplace accounts
    department_id UUID REFERENCES departments(id),
    position_id UUID REFERENCES positions(id),
    manager_id UUID REFERENCES employees(id),
    ...
);

-- Unique constraints for business rules
UNIQUE(employee_id, leave_type_id, year)  -- leave_balances
UNIQUE(employee_id, date)                 -- attendance_records
UNIQUE(company_id, name)                  -- departments per company
```

### Multi-tenancy: `company_id` column

Every HRIS table has `company_id UUID NOT NULL REFERENCES companies(id)`. All queries scope by this value. This is the application-level tenant boundary. PostgreSQL RLS can be added later as defense-in-depth.

### go-jet codegen

```bash
# After every migration:
bun run db:generate
# Runs: cd server-go && jet -dsn=... -schema=public -path=./.gen
```

Generated types in `server-go/.gen/`, re-exported via `server-go/internal/gen/`.

### Query pattern

```go
// Every HRIS query scoped by company_id
stmt := SELECT(
    gen.Employees.ID, gen.Employees.FirstName, gen.Employees.LastName,
    gen.Employees.PositionID,
).FROM(
    gen.Employees,
).WHERE(
    gen.Employees.CompanyID.EQ(UUID(companyID)).
    AND(gen.Employees.EmploymentStatus.EQ(String("active"))),
).ORDER_BY(gen.Employees.FirstName.ASC())

var employees []model.Employees
err := stmt.QueryContext(ctx, pool, &employees)
```

---

## Layer 9 — Middleware & Auth

The plan keeps the existing dual system:

1. **Marketplace auth** — `users.role` enum (`jobseeker` / `company` / `admin`), existing `RequireRole()` middleware
2. **HRIS auth** — Separate RBAC system with granular permissions

### JWT Claims (unchanged)

```go
type Claims struct {
    UserID string `json:"userId"`
    Role   string `json:"role"`      // marketplace role (jobseeker/company/admin)
    jwt.RegisteredClaims
}
```

### `RequireCompanyMember` — Resolves user → employee → company

```go
// internal/rbac/middleware.go
func RequireCompanyMember(pool *pgxpool.Pool) gin.HandlerFunc {
    return func(c *gin.Context) {
        userID, _ := c.Get("userId")
        // Query: find employee record by user_id
        // If not found, abort 403: "User is not a company member"
        // Set "employeeId", "companyId", "employeeRoleIds" in context
        c.Next()
    }
}
```

### `RequirePermission` — Granular RBAC check

```go
// internal/rbac/middleware.go
func RequirePermission(codes ...string) gin.HandlerFunc {
    return func(c *gin.Context) {
        // Read employee's roles from context
        // Query role_permissions for intersection
        // If none match, abort 403
        c.Next()
    }
}
```

Usage in route wiring:

```go
hris := api.Group("/hris")
hris.Use(AuthRequired(cfg.JWTSecret), rbac.RequireCompanyMember(pool))

// Then per-route:
hris.GET("/employees", rbac.RequirePermission("employee.read"), employee.List)
hris.POST("/employees", rbac.RequirePermission("employee.create"), employee.Create)
hris.PUT("/employees/:id", rbac.RequirePermission("employee.update"), employee.Update)
```

### RBAC schema (separate from marketplace)

| Table | Purpose |
|---|---|
| `hris_roles` | Per-company: Super Admin, Company Admin, HR Admin, Payroll Admin, Manager, Employee, Recruiter, Director, Auditor |
| `permissions` | ~40 codes across 8 modules (employee, org, attendance, leave, payroll, analytics, onboarding, settings) |
| `role_permissions` | Join: which permissions each role has |
| `employee_roles` | Join: which roles each employee holds |

Seeded ~40 permission codes covering all HRIS modules.

### Rate limiting (unchanged)

```go
rl := middleware.NewRateLimiter(5, 10)  // burst 5, rate 10/sec
api.POST("/auth/login", rl.Middleware(), auth.Login)
```

---

## Layer 10 — Styling

Same Tailwind v4 + DaisyUI 5 approach as the existing project.

### DaisyUI components used in HRIS pages

| Element | DaisyUI Class | HRIS Usage |
|---|---|---|
| Primary action | `btn btn-primary` | Save employee, approve leave, clock in |
| Danger action | `btn btn-error` | Terminate employee, reject leave |
| Data table | `table table-zebra` | Employee list, attendance log, payroll items |
| Card container | `card bg-base-100 shadow-xl` | Dashboard KPI cards, employee detail |
| Modal/Dialog | `modal modal-box` | Transfer employee, assign role |
| Badge status | `badge badge-success/warning/error/info` | Employment status, leave status, attendance status |
| Form input | `input input-bordered` | All HRIS forms |
| Select | `select select-bordered` | Department/position/role pickers |
| Loading | `loading loading-spinner` | Async data loading |
| Tab | `tabs tabs-box` | Employee detail sections, payroll run steps |
| Step | `steps` | Onboarding/offboarding checklist progress |
| Progress | `progress` | Leave balance usage bars |
| Calendar | Custom (DaisyUI has no calendar component) | Leave calendar, attendance calendar |

---

## Layer 11 — Commands & Scripts

```jsonc
// Root package.json — exact scripts used
{
  "scripts": {
    "dev": "concurrently -n server,web -c cyan,green \"go -C server-go run ./cmd/server/\" \"bun --cwd web dev\"",
    "dev:server": "go -C server-go run ./cmd/server/",
    "dev:web": "bun --cwd web dev",
    "build": "bun --cwd web build",
    "db:migrate": "go -C server-go run ./cmd/migrate/",
    "db:seed": "go -C server-go run ./cmd/seed/",
    "db:generate": "cd server-go && jet -dsn=$DATABASE_URL -schema=public -path=./.gen",
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "format": "biome format --write .",
    "format:check": "biome format .",
    "test:server": "go -C server-go test ./... -count=1 -p=1",
    "test:web": "bun --cwd web test",
    "typecheck": "bun --cwd web typecheck",
    "docker:up": "docker compose up --build",
    "docker:down": "docker compose down",
    "api:spec": "go -C server-go tool swag init -g cmd/server/main.go -o docs",
    "api:generate": "bun run api:spec && bun run api:types",
    "api:check": "bun run api:generate && git diff --exit-code -- server-go/docs web/src/lib/generated"
  }
}
```

### Git hooks (`lefthook.yml`)

```yaml
pre-commit:
  commands:
    format:
      run: bun run format
      stage_fixed: true

pre-push:
  commands:
    test-server:
      run: go -C server-go test -p 1 ./...
    test-web:
      run: bun --cwd web test
    lint:
      run: bun run lint
```

---

## Layer 12 — Local Dev Startup

```bash
# 1. Start PostgreSQL
docker compose up db -d

# 2. Run migrations (in order: existing marketplace + HRIS migrations)
bun run db:migrate

# 3. Seed data (demo company, admin user, default leave types, departments)
bun run db:seed

# 4. Regenerate go-jet types
bun run db:generate

# 5. Start dev (server :1234 + web :4200)
bun run dev
```

### Dev URLs

| Service | URL |
|---|---|
| Web (Vite) | `http://localhost:4200` |
| API (Gin) | `http://localhost:1234` |
| Swagger UI | `http://localhost:1234/docs/index.html` |
| PostgreSQL | `localhost:5432` |

---

## Layer 13 — Environment Variables

### Server (`server-go/.env`)

```env
PORT=1234
DATABASE_URL=postgres://postgres:postgres@localhost:5432/skillpass
JWT_SECRET=skillpass-dev-secret-change-in-prod
CORS_ORIGIN=http://localhost:4200
GIN_MODE=debug

# Email (leave empty in dev — prints to console)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@skillpass.local

# File uploads (employee documents, avatars)
UPLOAD_DIR=./uploads

# LLM (AI evaluation — not HRIS-specific but exists in the project)
LLM_PROVIDER=openai
LLM_API_KEY=
LLM_MODEL=gpt-4o-mini
```

### Web (`web/.env`)

```env
VITE_API_BASE_PATH=/api/v1
API_PROXY_TARGET=http://localhost:1234
DEV_PORT=4200
```

---

## Layer 14 — Deployment (Docker)

### Docker Compose

> **Note:** Updated from the reference below. See the actual [`docker-compose.yml`](/docker-compose.yml) at the repo root for the current configuration.

```yaml
services:
  db:
    image: postgres:16-alpine
    ports: ["5432:5432"]
    volumes: [pgdata:/var/lib/postgresql/data]
    environment:
      POSTGRES_DB: skillpass
      POSTGRES_PASSWORD: postgres
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  server:
    build:
      context: ./server-go
      dockerfile: Dockerfile
    ports: ["1234:1234"]
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: postgres://postgres:postgres@db:5432/skillpass
      JWT_SECRET: skillpass-dev-secret
      CORS_ORIGIN: http://localhost:4200
      PORT: 1234
      APP_URL: http://localhost:4200
      UPLOAD_DIR: /app/uploads
    volumes: [uploads:/app/uploads]

  web:
    build:
      context: ./web
    ports: ["4200:80"]
    depends_on: [server]

volumes:
  pgdata:
  uploads:
```

### Server Dockerfile

> **Note:** See the actual [`server-go/Dockerfile`](/server-go/Dockerfile) for the current version.

```dockerfile
FROM golang:1.26-alpine AS builder
WORKDIR /build
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /skillpass-server ./cmd/server/

FROM alpine:3.19
RUN apk --no-cache add ca-certificates
WORKDIR /app
COPY --from=builder /skillpass-server .
COPY migrations/ ./migrations/
EXPOSE 1234
CMD ["./skillpass-server"]
```

### Web Dockerfile

```dockerfile
FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Config

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;

    location /api/ {
        proxy_pass http://server:1234;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://server:1234;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## HRIS Backend Package Structure

Exactly matching the plan's internal organization:

```
server-go/internal/
├── config/                  # Env-based config loader
├── db/                      # pgxpool connection
├── middleware/               # AuthRequired, RequireRole, rate limiter
│
├── rbac/                    # NEW — HRIS access control
│   ├── middleware.go         # RequireCompanyMember, RequirePermission
│   ├── service.go            # Role/permission CRUD
│   └── seeds.go              # Default permissions (40 codes)
│
├── hris/
│   ├── employee/            # Sprint 1: Employee CRUD, ID number generation
│   │   ├── handler.go
│   │   ├── service.go
│   │   ├── repository.go
│   │   └── employee_test.go
│   │
│   ├── org/                 # Sprint 1-2: Branch, Department, Position, Org tree
│   │   ├── handler.go
│   │   ├── service.go       # Recursive CTE tree building, cycle detection
│   │   └── org_test.go
│   │
│   ├── shift/               # Sprint 3: Shift templates, assignment
│   │   ├── handler.go
│   │   └── service.go
│   │
│   ├── attendance/          # Sprint 3, 6: Clock in/out, geofence, export
│   │   ├── handler.go
│   │   ├── service.go       # Haversine distance, lateness/OT calc
│   │   ├── export.go        # XLSX export (excelize)
│   │   ├── websocket.go     # Live dashboard (gorilla/websocket)
│   │   └── attendance_test.go
│   │
│   ├── leave/               # Sprint 4: Leave request, balance, approval
│   │   ├── handler.go
│   │   ├── service.go       # Working-day calc, multi-level approval
│   │   ├── accrual.go       # Monthly batch accrual, year-end carry-over
│   │   └── leave_test.go
│   │
│   ├── holiday/             # Sprint 4: Public holidays
│   │   ├── handler.go
│   │   └── service.go       # IsHoliday check, Indonesian holidays seed
│   │
│   ├── payroll/             # Sprint 5: Payroll engine, tax, PDF
│   │   ├── handler.go
│   │   ├── service.go       # Create run, calculate, approve
│   │   ├── tax.go           # PPh21 TER method (pure functions)
│   │   ├── payslip.go       # PDF generation (gopdf)
│   │   ├── export.go        # Bank transfer CSV, SPT Masa
│   │   └── payroll_test.go
│   │
│   ├── analytics/           # Sprint 6: Turnover KPIs
│   │   └── turnover.go
│   │
│   └── onboarding/          # Sprint 7: Checklists
│       ├── handler.go
│       └── service.go
│
├── spdid/                   # Sprint 2: Stub DID service
│   ├── service.go           # Deterministic DID string generation
│   └── spdid_test.go
│
├── handlers/                # Existing marketplace handlers
├── lib/                     # password.go, llm.go, pagination.go
├── email/                   # SMTP sender
├── storage/                 # File uploads
├── notification/            # In-app + email notifications
└── webhook/                 # Webhook dispatcher
```

---

## Frontend Page Structure (HRIS)

```
web/src/pages/hris/
├── EmployeeList/
│   ├── index.tsx            # Table with filters (dept, branch, status, search)
│   └── components/
│       ├── EmployeeFilters.tsx
│       └── EmployeeTableRow.tsx
│
├── EmployeeCreate/
│   └── index.tsx            # Multi-step form (personal, employment, payroll, documents)
│
├── EmployeeDetail/
│   ├── index.tsx            # Tabs: Profile, Employment, Payroll, Documents, Leave
│   └── components/
│       ├── PersonalInfoTab.tsx
│       ├── EmploymentTab.tsx
│       ├── PayrollInfoTab.tsx
│       └── DocumentList.tsx
│
├── OrgChart/
│   └── index.tsx            # Expandable tree (d3-tree or recursive React)
│
├── BranchManagement/
│   ├── index.tsx            # Table + hierarchy tree
│   └── components/
│       └── BranchForm.tsx   # Coordinate picker
│
├── DepartmentManagement/
│   └── index.tsx            # Tree with inline edit
│
├── ShiftConfig/
│   ├── index.tsx            # Shift template table
│   └── components/
│       └── ShiftForm.tsx    # Time pickers, default toggle
│
├── ClockIn/
│   └── index.tsx            # Mobile-friendly geolocation page
│
├── AttendanceDashboard/
│   └── index.tsx            # Real-time KPI cards + employee list (WebSocket)
│
├── MyAttendance/
│   └── index.tsx            # Monthly calendar view
│
├── AttendanceExceptions/
│   └── index.tsx            # Submit/view exception requests
│
├── AttendanceExport/
│   └── index.tsx            # Month picker + download button
│
├── LeaveRequest/
│   ├── index.tsx            # Date range picker + balance display
│   └── components/
│       └── LeaveBalanceCard.tsx
│
├── LeaveBalance/
│   └── index.tsx            # All types with progress bars
│
├── LeaveApprovals/
│   └── index.tsx            # Manager: pending requests table
│
├── LeaveCalendar/
│   └── index.tsx            # Team month view (react-big-calendar)
│
├── LeaveTypeConfig/
│   └── index.tsx            # HR admin: leave type CRUD
│
├── HolidayManagement/
│   └── index.tsx            # Public holidays CRUD
│
├── PayrollConfig/
│   └── index.tsx            # BPJS rates, pay period, OT multiplier
│
├── PayrollRun/
│   └── index.tsx            # Step wizard: select → calculate → review → approve → pay
│
├── PayrollRunDetail/
│   └── index.tsx            # Employee breakdown table within a run
│
├── PayrollComponents/
│   └── index.tsx            # Earning/deduction type management
│
├── PayslipView/
│   └── index.tsx            # Employee's own payslip + PDF download
│
├── TurnoverDashboard/
│   └── index.tsx            # 5 KPI metric cards + filters
│
├── ChecklistTemplates/
│   └── index.tsx            # Drag-reorder items
│
├── EmployeeOnboarding/
│   └── index.tsx            # Checklist with progress, file uploads
│
└── EmployeeTermination/
    └── index.tsx            # Reason category form
```

---

## Sprint Delivery Structure (7 Sprints / 13 Weeks)

| Sprint | Weeks | Deliverables | Migrations |
|---|---|---|---|
| **1** | 1-2 | Employee DB, RBAC, Org Structure (branches, departments, positions, employees, roles, permissions) | `000012_hris_foundation.sql` | ✅ Done |
| **2** | 3-4 | Org chart enhancement, branch GPS fields, SP-DID stub service | `000013_spdid_records.sql` | ✅ Done |
| **3** | 5-6 | Shift config, GPS clock-in (Haversine geofence), live attendance WebSocket dashboard | `000014_hris_attendance.sql` | ⬜ Planned |
| **4** | 7-8 | Leave module (request, multi-level approval, balance, accrual), public holidays | `000015_hris_leave.sql` | ⬜ Planned |
| **5** | 9-10 | Payroll engine (calculation, PPh21 TER tax, BPJS), payslip PDF, bank transfer CSV | `000016_hris_payroll.sql` | ⬜ Planned |
| **6** | 11-12 | Attendance XLSX export (per manager, formatted), turnover analytics KPI strip | `000017_hris_turnover.sql` | ⬜ Planned |
| **7** | 13 | Onboarding/offboarding checklists, multi-tenancy hardening, CI/CD pipeline | `000018_hris_onboarding.sql` | ⬜ Planned |

---

## Go Dependencies (Full List)

```
# go.mod
require (
    github.com/gin-gonic/gin v1.10.0
    github.com/gin-contrib/cors v1.7.0
    github.com/jackc/pgx/v5 v5.10.0
    github.com/go-jet/jet/v2 v2.15.0
    github.com/golang-jwt/jwt/v5 v5.2.0
    github.com/joho/godotenv v1.5.0
    github.com/google/uuid v1.6.0
    github.com/go-playground/validator/v10 v10.23.0
    github.com/swaggo/swag v1.16.0
    github.com/swaggo/gin-swagger v1.6.0
    github.com/swaggo/files v1.0.0
    github.com/golang-jwt/jwt/v5 v5.2.0
    golang.org/x/crypto v0.53.0

    # HRIS-specific (added per sprint)
    github.com/gorilla/websocket v1.5.0           # Sprint 3
    github.com/xuri/excelize/v2 v2.9.0             # Sprint 6
    github.com/signintech/gopdf v0.28.0             # Sprint 5 (or jung-kurt/gofpdf)
)
```

---

## Web Dependencies (Full List)

```jsonc
// web/package.json
{
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.5.0",
    "@tanstack/react-query": "^5.101.0",
    "react-hook-form": "^7.76.0",
    "zod": "^4.4.3",
    "@hookform/resolvers": "^5.4.0",
    "lucide-react": "^0.544.0",
    "date-fns": "^4.0.0",
    "recharts": "^2.0.0",
    "react-big-calendar": "^1.0.0"
  },
  "devDependencies": {
    "vite": "^7.0.0",
    "@vitejs/plugin-react": "^4.4.0",
    "@tailwindcss/vite": "^4.1.0",
    "tailwindcss": "^4.1.0",
    "daisyui": "^5.5.20",
    "typescript": "^5.8.0",
    "vitest": "^3.2.6",
    "happy-dom": "^20.10.2",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "storybook": "^10.4.1",
    "@storybook/react-vite": "^10.4.1"
  }
}
```

---

## Naming Conventions

| Layer | Convention | Example |
|---|---|---|
| Go files | `snake_case.go` | `employee_handler.go` |
| Go packages | `internal/hris/<module>/` | `internal/hris/employee/` |
| Go structs | PascalCase, `json:"camelCase"` | `Employee struct { FirstName string \`json:"firstName"\` }` |
| Handler structs | Hold `pool *pgxpool.Pool` | `type EmployeeHandler struct { pool *pgxpool.Pool }` |
| React components | `PascalCase.tsx` | `EmployeeList.tsx` |
| React hooks | `camelCase.ts` | `usePermission.ts` |
| React lib/utils | `camelCase.ts` | `api.ts`, `formatDate.ts` |
| Page folders | `pages/hris/<PageName>/index.tsx` | `pages/hris/EmployeeList/index.tsx` |
| DB tables | `snake_case` | `leave_requests` |
| DB columns | `snake_case` | `employee_id_number` |
| DB enums | `snake_case` (via `DO $$ BEGIN CREATE TYPE`) | `employment_type`, `employment_status` |
| Migration files | `000012_<name>.sql` | `000012_hris_foundation.sql` |
| Environment vars | `UPPER_SNAKE_CASE` | `DATABASE_URL`, `JWT_SECRET` |
| API paths | `/kebab-case` under `/api/v1/hris/` | `/api/v1/hris/leave-requests` |
| Git commits | `conventional-commits` | `feat(hris): add employee CRUD` |
| CSS classes | DaisyUI utility classes | `btn btn-primary`, `table table-zebra` |

---

## Background Jobs

| Job | Cadence | Location |
|---|---|---|
| Leave accrual | Monthly batch | `internal/hris/leave/accrual.go` |
| Leave carry-over | Year-end batch | `internal/hris/leave/accrual.go` |
| Payroll calculation | On-demand (triggered by user) | `internal/hris/payroll/service.go` |

These run as synchronous operations triggered by API endpoints (on-demand) or as simple goroutines within the server process (no external job queue in Phase 1).

---

## Key Architectural Decisions (from the plan)

1. **Multi-tenancy:** `company_id` column + application-level scoping middleware (`RequireCompanyMember`). Not schema-per-tenant.
2. **RBAC:** Separate `hris_roles`/`permissions`/`role_permissions`/`employee_roles` tables alongside existing `users.role` enum. Marketplace and HRIS auth are independent.
3. **Employee vs User:** `employees` table links to `companies` (required) and `users` (optional). Employees can exist without marketplace accounts.
4. **DB driver:** `pgxpool.Pool` (not `database/sql`). Handler structs receive `pool *pgxpool.Pool`.
5. **SQL enums:** Use `DO $$ BEGIN CREATE TYPE ... EXCEPTION WHEN duplicate_object THEN null; END $$;` pattern for idempotent migrations.
6. **Frontend layout:** New `/hris/*` routes with `HRISLayout` sidebar. Existing marketplace pages untouched. Navbar shows HRIS link conditionally.
