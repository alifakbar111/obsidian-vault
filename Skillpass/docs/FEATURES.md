# SkillPass — Feature Inventory

**Last updated:** 2026-06-18  
**Applies to:** All implemented phases and the HRIS module  
**Total features:** 67

A comprehensive listing of every feature implemented across all phases, including the standalone HRIS module.

---

## Phase 1: Core Profiles & Job Postings

| # | Feature | Details | Server Package | Frontend Pages |
|---|---------|---------|---------------|----------------|
| 1 | **Authentication & Authorization** | Register, Login, JWT access + refresh tokens, Logout. `GET /auth/me` returns current user for any role. Rate limiting on auth endpoints. Password hashing (bcrypt + argon2id fallback). | `internal/handlers/auth.go`, `internal/middleware/auth.go` | `/auth/login`, `/auth/register` |
| 2 | **Role-Based Access Control** | 3 roles: `jobseeker`, `company`, `admin`. Middleware guards per endpoint group. | `internal/middleware/auth.go` (`RequireRole`, `RequireVerifiedCompany`) | `ProtectedRoute` wrapper |
| 3 | **Email Verification** | Send verification email on register, verify via token link, resend verification (`POST /auth/resend-verification`). | `internal/handlers/auth_recovery.go`, `internal/authtoken/`, `internal/email/` | `/auth/verify-email` |
| 4 | **Password Reset** | Forgot password (email link with token), Reset password with new password + session revocation. Rate-limited. | `internal/handlers/auth_recovery.go`, `internal/authtoken/`, `internal/email/` | `/auth/forgot-password`, `/auth/reset-password` |
| 5 | **Jobseeker Profile** | View/edit headline, about, years of experience, slug. CRUD job experiences (employment/gig/education/certification/project/volunteering). Avatar upload (png/jpeg/webp, 2MB limit). | `internal/handlers/profiles.go`, `internal/handlers/uploads.go`, `internal/storage/` | `/jobseeker/profile` |
| 6 | **Skill Passport (Public)** | Public URL `/profiles/:username` — name, photo, headline, experience timeline (grouped by type), skills list aggregated from experiences, industry tags, evaluation score badge. | `internal/handlers/passport.go` | `/profiles/:username` |
| 7 | **Open Graph Passport Page** | Server-rendered HTML at `/p/:username` with per-profile OG tags (title, description, image). Redirects humans to SPA. | `internal/handlers/passport_og.go` | — |
| 8 | **Resume Parsing & Upload** | AI-powered resume parse (extract structured data from PDF), resume file upload. | `internal/resume/` | — |
| 9 | **Company Profile** | View/edit company name, website, industry, description. | `internal/handlers/companies.go` | `/company/profile` |
| 10 | **Company Verification** | Submit verification docs (business registration, website, address, contact). Track status timeline (pending/verified/rejected). Admin approve/reject with audit log. | `internal/handlers/companies.go`, `internal/handlers/admin.go` | `/company/verification`, `/admin/verifications` |
| 11 | **Blind Screening Mode** | `blind_mode` column on companies table. When enabled, candidate names are masked as "Candidate {shortId}" in search results. | `internal/handlers/blind.go` | — |
| 12 | **Job Postings (Company)** | Full CRUD job postings (verified companies only). Fields: title, description, industry, tags, required skills, experience level, location, salary range, status (open/closed). | `internal/handlers/jobs.go` | `/company/jobs` |
| 13 | **Public Job Listings** | Browse/filter jobs by industry, tags, experience level, pagination (limit/offset). Public job detail view. | `internal/handlers/jobs.go` | `/jobs`, `/jobs/:id` |
| 14 | **Candidate Search** | Search candidates by keyword, industry, skills (verified companies only). | `internal/handlers/search.go` | `/company/search` |
| 15 | **Reference Data** | Industries list endpoint, Tags by industry endpoint. | `internal/handlers/reference.go` | — |
| 16 | **Admin Panel** | List pending company verifications, approve/reject with reason stored in audit log. | `internal/handlers/admin.go` | `/admin/verifications` |
| 17 | **Infrastructure & Tooling** | PostgreSQL + pgx pool + go-jet codegen + raw SQL migrations. Docker Compose (3 services: db, server, web + Nginx). Gin framework, Biome linting, Lefthook hooks, Storybook component library. | `internal/db/`, `internal/config/`, `internal/lib/` | Storybook stories in `src/stories/` |

---

## Phase 2: AI Evaluation & Matching

| # | Feature | Details | Server Package | Frontend Pages |
|---|---------|---------|---------------|----------------|
| 18 | **AI Evaluation Engine** | Trigger full profile evaluation (`POST /evaluate/me`). LLM scores all skills, experiences, and strengths cumulatively (no cap, no subtraction). Retrieve latest results (`GET /evaluate/me/results`). Returns: overall_score, strengths[], weaknesses[], suggestions[], skill_scores[]. Raw LLM response stored. | `internal/evaluation/` | `/jobseeker/evaluation` |
| 19 | **Score Badge on Passport** | Public passport page displays evaluation score badge from latest evaluation. | `internal/handlers/passport.go` | `/profiles/:username`, `/jobseeker/passport` |
| 20 | **Job Applications** | Apply to jobs (`POST /jobs/:id/apply`). Jobseeker kanban dashboard with columns: Applied / Reviewing / Interviewing / Offers. Company can list and update application status. | `internal/application/` | `/jobseeker/applications`, `/company/applications` |
| 21 | **Application Messaging** | Messages between company and candidate within an application thread (`GET/POST /applications/:id/messages`). | `internal/application/` | — |
| 22 | **Webhooks** | Create/list/delete webhooks for application event notifications (e.g., status changes). | `internal/webhook/` | — |
| 23 | **AI Job Matching** | Recommended jobs for jobseeker (`GET /jobs/matches`). Recommended candidates for a job (`GET /candidates/matches`). AI compares profile to open jobs. | `internal/matching/` | `/jobseeker/matches` |
| 24 | **Skills Gap Analysis** | Per-job comparison: which skills the jobseeker lacks vs. the job requirements (`GET /jobs/:id/skills-gap`). | `internal/matching/` | — |
| 25 | **AI Career Path Posting** | Jobseeker can optionally trigger a career path prediction from within the evaluation flow (`POST /evaluate/me/career-path`). | `internal/evaluation/` | `/jobseeker/evaluation` |

---

## Phase 3: Feedback & Career Growth

| # | Feature | Details | Server Package | Frontend Pages |
|---|---------|---------|---------------|----------------|
| 26 | **Company → Candidate Feedback** | Company rates specific skill areas (1-5 per skill) + free-text feedback (`POST /feedback/:profile_id`). Background AI call generates learning suggestions and resources. | `internal/feedback/` | — |
| 27 | **Feedback Dashboard (Jobseeker)** | View all received feedback from companies (`GET /feedback/me`), plus AI-generated learning suggestions with resources (`GET /feedback/suggestions/me`). | `internal/feedback/` | `/jobseeker/feedback` |
| 28 | **Feedback History (Company)** | View all feedback the company has given to candidates, with history (`GET /feedback`). | `internal/feedback/` | `/company/feedback` |
| 29 | **Company Reviews (Candidates → Company)** | Rate companies 1-5 stars + optional review after applying or interviewing (`POST /companies/:id/reviews`). List reviews (`GET /companies/:id/reviews`). | `internal/companyreviews/` | — |
| 30 | **Company Reputation Score** | Aggregated average rating + review count displayed on job postings and company profile (`GET /companies/:id/reputation`). Low-scoring companies get reduced visibility in search results. | `internal/companyreviews/` | `/company/reputation` |
| 31 | **Career Paths** | List predefined career paths with skill requirements and typical progression (`GET /career/paths`). | `internal/career/` | `/jobseeker/career` |
| 32 | **AI Career Path Prediction** | Personalized career trajectory prediction (`GET /career/path/me`): "Profiles like yours typically grow into Senior Backend Engineer within 2-3 years..." based on aggregated platform data. | `internal/career/` | `/jobseeker/career` |
| 33 | **Skill Gap Radar** | Radar/spider chart comparing jobseeker skill scores (from latest AI evaluation) against aggregated market demand from job postings on the platform (`GET /career/skill-gap/me`). | `internal/career/` | `/jobseeker/career` |
| 34 | **Profile Views Tracking** | Record when a verified company views a candidate profile (`POST /profiles/:profile_id/view`). Jobseeker can see who viewed their profile with company name and timestamp (`GET /profiles/me/views`). | `internal/profileviews/` | — |
| 35 | **Analytics (Jobseeker)** | Profile views, application stats dashboard (`GET /profiles/me/analytics`). | `internal/analytics/` | `/jobseeker/analytics` |
| 36 | **Analytics (Company)** | Application analytics dashboard — views, application rates, etc. (`GET /company/analytics`). | `internal/analytics/` | `/company/analytics` |
| 37 | **Notifications System** | User notifications: list recent (up to 50), mark single read, mark all read. | `internal/notification/` | — |

---

## HRIS (Standalone — Outside Phase 1-3)

**HRIS (Human Resource Information System)** is a standalone module for verified companies to manage their internal workforce — separate from the talent-marketplace flow of Phases 1–3. It covers the full employee lifecycle: organizational structure (branches, departments, positions), employee records with Indonesian compliance fields (KTP, NPWP, BPJS), GPS-geofenced shift attendance, leave and holiday management, payroll runs with payslips, HR reporting, and onboarding/offboarding checklists. Access is governed by its own granular RBAC layer (9 permission modules, 40+ permissions), and employees get self-service views (my attendance, my payslips, my onboarding). Server code lives in `server-go/internal/hris/` (plus `internal/rbac/` and `internal/spdid/`), frontend pages in `web/src/pages/hris/` under the `HRISLayout` shell.

### Organizational Structure & Employees

| # | Feature | Details | Server Package | Frontend Pages |
|---|---------|---------|---------------|----------------|
| 38 | **Branch Management** | CRUD branches with parent hierarchy, branch type, address, city, province, geofencing coordinates (lat/lng + radius in meters), active/deactivate. | `internal/hris/org/` | `/hris/branches` |
| 39 | **Department Management** | CRUD departments with parent hierarchy. | `internal/hris/org/` | `/hris/departments` |
| 40 | **Position Management** | CRUD positions per department with job levels: `staff`, `supervisor`, `manager`, `director`. | `internal/hris/org/` | `/hris/positions` |
| 41 | **Employee Management** | Full CRUD with 30+ fields: personal info (name, DOB, gender, marital status), contact, address, national ID (KTP), tax ID (NPWP), BPJS Kesehatan/Ketenagakerjaan, bank details, emergency contacts, employment type (`permanent`/`contract`/`probation`/`intern`), employment status (`active`/`resigned`/`terminated`/`on_leave`), join date, end date, manager assignment, department, position, branch, base salary. | `internal/hris/employee/` | `/hris/employees` (list, detail, create) |
| 42 | **Employee ID Config** | Configurable prefix, auto-increment sequence, and zero-padding per company for auto-generated employee ID numbers. | `internal/hris/employee/` | — |
| 43 | **Employee Filtering** | Filter employees by status, department, branch, full-text search, pagination (page/pageSize). | `internal/hris/employee/` | `/hris/employees` |
| 44 | **Organization Tree** | Branch → Department → Position hierarchy tree view for a company (`GET /hris/org/tree`). | `internal/hris/org/` | `/hris/org-chart` |
| 45 | **Organization Chart** | Employee-level org chart showing reporting structure (manager → subordinates, `GET /hris/org/chart`). | `internal/hris/org/` | `/hris/org-chart` |
| 46 | **HRIS RBAC** | 9 permission modules with 40+ granular permissions: Employee (view/create/update/delete), Attendance (view/manage/clock/approve/export), Leave (view/request/approve/manage), Payroll (view/run/approve/manage), Performance/KPI (view/manage/review), ATS (view/manage/scorecard), Analytics (view/export), Documents (view/manage), Org/Settings (org view/manage, roles manage, settings manage). Role creation, employee-role assignment, permission middleware. | `internal/rbac/` | `/hris/roles` |
| 47 | **Working Calendar** | Per-company, per-year working calendar CRUD (define working days, holidays). | `internal/hris/org/` | — |
| 48 | **SP-DID (Decentralized ID)** | Create and retrieve Self-Sovereign Decentralized Identity for employees within a company. Enables verifiable credentials. | `internal/spdid/` | — |
| 49 | **Employee Roles** | Assign and remove roles for employees (`POST/DELETE /hris/employees/:id/roles`). View own permissions (`GET /hris/me/permissions`). | `internal/rbac/` | `/hris/roles` |

### Shifts & Attendance

| # | Feature | Details | Server Package | Frontend Pages |
|---|---------|---------|---------------|----------------|
| 50 | **Shift Templates** | CRUD shift templates with name, start/end time, grace period, late threshold, default flag. | `internal/hris/shift/` | `/hris/shifts` |
| 51 | **Employee Shift Assignment** | Assign shift templates to employees, list employee shifts. | `internal/hris/shift/` | — |
| 52 | **Attendance Clock In/Out** | GPS-based clock in/out with Haversine geofence (validates employee's lat/lng against branch radius). | `internal/hris/attendance/` | `/hris/clock-in` |
| 53 | **Attendance Dashboard** | Real-time KPI cards (present, late, absent counts) + employee status list with WebSocket live updates. | `internal/hris/attendance/` | `/hris/attendance` |
| 54 | **My Attendance** | Personal monthly attendance calendar view. | `internal/hris/attendance/` | `/hris/my-attendance` |
| 55 | **Attendance Exceptions** | Submit and review exception requests for missed clock-ins/outs (create, list, review). | `internal/hris/attendance/` | `/hris/attendance-exceptions` |
| 56 | **Attendance Export** | XLSX attendance export per manager with formatting. | `internal/hris/report/` | `/hris/attendance-export` |

### Leave & Holidays

| # | Feature | Details | Server Package | Frontend Pages |
|---|---------|---------|---------------|----------------|
| 57 | **Leave Types** | CRUD leave types per company (name, days per year, carry-over limit, requires approval). | `internal/hris/leave/` | `/hris/leave-types` |
| 58 | **Leave Requests** | Create leave requests (date range + type). Multi-level approval chain: submit, approve, reject, cancel. List all requests or my requests. | `internal/hris/leave/` | `/hris/leave-request`, `/hris/leave-approval` |
| 59 | **Leave Balances** | Init and view leave balances per type per employee. Progress bars showing usage. | `internal/hris/leave/` | `/hris/leave-balance` |
| 60 | **Holiday Management** | CRUD public holidays per company. | `internal/hris/holiday/` | `/hris/holidays` |

### Payroll

| # | Feature | Details | Server Package | Frontend Pages |
|---|---------|---------|---------------|----------------|
| 61 | **Salary Components** | CRUD earning/deduction types (name, type, default amount, is-taxable, is-mandatory). | `internal/hris/payroll/` | `/hris/salary-components` |
| 62 | **Employee Salary** | View and update base salary per employee, with component breakdown. | `internal/hris/payroll/` | `/hris/employees/:id/salary` |
| 63 | **Payroll Runs** | Full payroll run lifecycle: create, calculate (applies earnings/deductions/tax), approve, mark as paid. | `internal/hris/payroll/` | `/hris/payroll-runs` |
| 64 | **Payslips** | View individual payslips per run, employee self-service view (`/hris/payslips/my`). | `internal/hris/payroll/` | `/hris/payroll-runs/:runId/payslips`, `/hris/my-payslips` |

### Reports & Onboarding

| # | Feature | Details | Server Package | Frontend Pages |
|---|---------|---------|---------------|----------------|
| 65 | **HR Reports** | Headcount statistics, point-in-time snapshots (generate, list). | `internal/hris/report/` | `/hris/analytics` |
| 66 | **Onboarding Templates** | CRUD onboarding/offboarding checklist templates with items. | `internal/hris/onboarding/` | `/hris/onboarding-templates` |
| 67 | **Onboarding Checklists** | Assign checklists to employees, track item completion (complete/uncomplete). Employee self-service view. | `internal/hris/onboarding/` | `/hris/onboarding-checklists`, `/hris/my-onboarding` |

---

## Summary

| Category | Feature Count |
|----------|:------------:|
| Phase 1 — Core Profiles & Job Postings (#1–#17) | 17 |
| Phase 2 — AI Evaluation & Matching (#18–#25) | 8 |
| Phase 3 — Feedback & Career Growth (#26–#37) | 12 |
| HRIS — Organizational Structure & Employees (#38–#49) | 12 |
| HRIS — Shifts & Attendance (#50–#56) | 7 |
| HRIS — Leave & Holidays (#57–#60) | 4 |
| HRIS — Payroll (#61–#64) | 4 |
| HRIS — Reports & Onboarding (#65–#67) | 3 |
| **Total** | **67** |
