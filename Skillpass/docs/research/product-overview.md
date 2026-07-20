# SkillPass — Product Research Overview

**Research Date:** 2026-06-24
**Researcher:** Product Research Analyst
**Scope:** Full product codebase, specs, plans, and architecture

---

## Executive Summary

SkillPass is a **job platform and HRIS system** that combines structured career profiles ("Skill Passports") with AI-powered evaluation, candidate-job matching, and a full feedback loop between companies and jobseekers. It targets three user segments — **jobseekers**, **companies**, and **HR teams** — and differentiates through its AI-driven scoring system, skill gap analysis, and built-in HRIS module for workforce management. The platform is built on a modern Go/React stack with 67 implemented features across 3 product phases plus a standalone HRIS module.

---

## Target Users & Personas

### Persona 1: Jobseeker
- **Who:** Professionals across all industries (tech, non-tech, gig, students, creative)
- **Goal:** Build a structured career profile, get AI-evaluated, find matching jobs, receive feedback, and grow their career
- **Key Pages:** `/jobseeker/profile`, `/jobseeker/passport`, `/jobseeker/evaluation`, `/jobseeker/applications`, `/jobseeker/matches`, `/jobseeker/feedback`, `/jobseeker/career`, `/jobseeker/analytics`
- **Core Need:** A portable, verifiable professional identity with actionable growth insights

### Persona 2: Company (Employer)
- **Who:** Verified businesses seeking to hire
- **Goal:** Search candidates, post jobs, review applications, give feedback, manage reputation
- **Key Pages:** `/company/profile`, `/company/verification`, `/company/search`, `/company/jobs`, `/company/applications`, `/company/analytics`, `/company/feedback`, `/company/reputation`
- **Core Need:** A trustworthy talent pipeline with fraud prevention (verification + reputation scoring)

### Persona 3: HR Team (HRIS)
- **Who:** HR managers and administrators at companies
- **Goal:** Manage organizational structure, attendance, leave, payroll, onboarding
- **Key Pages:** 28 HRIS pages under `/hris/*` (employees, branches, departments, attendance, leave, payroll, onboarding)
- **Core Need:** An integrated HR management system within the same platform

### Persona 4: Admin
- **Who:** Platform administrators
- **Goal:** Oversee company verification, manage platform integrity
- **Key Pages:** `/admin/verifications`
- **Core Need:** Audit tools and verification workflow

---

## Feature Inventory

### Phase 1: Core Profiles & Job Postings (17 features)

| # | Feature | Status | Server Package | Frontend |
|---|---------|--------|---------------|----------|
| 1 | Authentication & Authorization | ✅ Done | `handlers/auth.go`, `middleware/auth.go` | `/auth/login`, `/auth/register` |
| 2 | Role-Based Access Control (3 roles) | ✅ Done | `middleware/auth.go` | `ProtectedRoute` |
| 3 | Email Verification | ✅ Done | `handlers/auth_recovery.go`, `authtoken/`, `email/` | `/auth/verify-email` |
| 4 | Password Reset | ✅ Done | `handlers/auth_recovery.go`, `authtoken/`, `email/` | `/auth/forgot-password`, `/auth/reset-password` |
| 5 | Jobseeker Profile (CRUD experiences) | ✅ Done | `handlers/profiles.go`, `handlers/uploads.go`, `storage/` | `/jobseeker/profile` |
| 6 | Skill Passport (Public URL) | ✅ Done | `handlers/passport.go` | `/profiles/:username` |
| 7 | Open Graph Passport Page | ✅ Done | `handlers/passport_og.go` | Server-rendered `/p/:username` |
| 8 | Resume Parsing & Upload | ✅ Done | `resume/` | — |
| 9 | Company Profile | ✅ Done | `handlers/companies.go` | `/company/profile` |
| 10 | Company Verification | ✅ Done | `handlers/companies.go`, `handlers/admin.go` | `/company/verification`, `/admin/verifications` |
| 11 | Blind Screening Mode | ✅ Done | `handlers/blind.go` | — |
| 12 | Job Postings (Company CRUD) | ✅ Done | `handlers/jobs.go` | `/company/jobs` |
| 13 | Public Job Listings | ✅ Done | `handlers/jobs.go` | `/jobs`, `/jobs/:id` |
| 14 | Candidate Search | ✅ Done | `handlers/search.go` | `/company/search` |
| 15 | Reference Data (Industries, Tags) | ✅ Done | `handlers/reference.go` | — |
| 16 | Admin Panel (Verification Review) | ✅ Done | `handlers/admin.go` | `/admin/verifications` |
| 17 | Infrastructure & Tooling | ✅ Done | Docker, CI, Storybook | — |

### Phase 2: AI Evaluation & Matching (8 features)

| # | Feature | Status | Server Package | Frontend |
|---|---------|--------|---------------|----------|
| 18 | AI Evaluation Engine | ✅ Done | `evaluation/` | `/jobseeker/evaluation` |
| 19 | Score Badge on Passport | ✅ Done | `handlers/passport.go` | `/profiles/:username` |
| 20 | Job Applications (Kanban) | ✅ Done | `application/` | `/jobseeker/applications`, `/company/applications` |
| 21 | Application Messaging | ✅ Done | `application/` | — |
| 22 | Webhooks | ✅ Done | `webhook/` | — |
| 23 | AI Job Matching | ✅ Done | `matching/` | `/jobseeker/matches` |
| 24 | Skills Gap Analysis | ✅ Done | `matching/` | — |
| 25 | AI Career Path Posting | ✅ Done | `evaluation/` | `/jobseeker/evaluation` |

### Phase 3: Feedback & Career Growth (12 features)

| # | Feature | Status | Server Package | Frontend |
|---|---------|--------|---------------|----------|
| 26 | Company → Candidate Feedback | ✅ Done | `feedback/` | — |
| 27 | Feedback Dashboard (Jobseeker) | ✅ Done | `feedback/` | `/jobseeker/feedback` |
| 28 | Feedback History (Company) | ✅ Done | `feedback/` | `/company/feedback` |
| 29 | Company Reviews (Candidates → Company) | ✅ Done | `companyreviews/` | — |
| 30 | Company Reputation Score | ✅ Done | `companyreviews/` | `/company/reputation` |
| 31 | Career Paths | ✅ Done | `career/` | `/jobseeker/career` |
| 32 | AI Career Path Prediction | ✅ Done | `career/` | `/jobseeker/career` |
| 33 | Skill Gap Radar | ✅ Done | `career/` | `/jobseeker/career` |
| 34 | Profile Views Tracking | ✅ Done | `profileviews/` | — |
| 35 | Analytics (Jobseeker) | ✅ Done | `analytics/` | `/jobseeker/analytics` |
| 36 | Analytics (Company) | ✅ Done | `analytics/` | `/company/analytics` |
| 37 | Notifications System | ✅ Done | `notification/` | — |

### HRIS Module (30 features)

| # | Feature | Status | Server Package | Frontend |
|---|---------|--------|---------------|----------|
| 38 | Branch Management | ✅ Done | `hris/org/` | `/hris/branches` |
| 39 | Department Management | ✅ Done | `hris/org/` | `/hris/departments` |
| 40 | Position Management | ✅ Done | `hris/org/` | `/hris/positions` |
| 41 | Employee Management (30+ fields) | ✅ Done | `hris/employee/` | `/hris/employees` |
| 42 | Employee ID Config | ✅ Done | `hris/employee/` | — |
| 43 | Employee Filtering | ✅ Done | `hris/employee/` | `/hris/employees` |
| 44 | Organization Tree | ✅ Done | `hris/org/` | `/hris/org-chart` |
| 45 | Organization Chart | ✅ Done | `hris/org/` | `/hris/org-chart` |
| 46 | HRIS RBAC (9 modules, 40+ permissions) | ✅ Done | `rbac/` | `/hris/roles` |
| 47 | Working Calendar | ✅ Done | `hris/org/` | — |
| 48 | SP-DID (Decentralized ID) | ✅ Done | `spdid/` | — |
| 49 | Employee Roles | ✅ Done | `rbac/` | `/hris/roles` |
| 50 | Shift Templates | ✅ Done | `hris/shift/` | `/hris/shifts` |
| 51 | Employee Shift Assignment | ✅ Done | `hris/shift/` | — |
| 52 | Attendance Clock In/Out (GPS) | ✅ Done | `hris/attendance/` | `/hris/clock-in` |
| 53 | Attendance Dashboard | ✅ Done | `hris/attendance/` | `/hris/attendance` |
| 54 | My Attendance | ✅ Done | `hris/attendance/` | `/hris/my-attendance` |
| 55 | Attendance Exceptions | ✅ Done | `hris/attendance/` | `/hris/attendance-exceptions` |
| 56 | Attendance Export (XLSX) | ✅ Done | `hris/report/` | `/hris/attendance-export` |
| 57 | Leave Types | ✅ Done | `hris/leave/` | `/hris/leave-types` |
| 58 | Leave Requests | ✅ Done | `hris/leave/` | `/hris/leave-request`, `/hris/leave-approval` |
| 59 | Leave Balances | ✅ Done | `hris/leave/` | `/hris/leave-balance` |
| 60 | Holiday Management | ✅ Done | `hris/holiday/` | `/hris/holidays` |
| 61 | Salary Components | ✅ Done | `hris/payroll/` | `/hris/salary-components` |
| 62 | Employee Salary | ✅ Done | `hris/payroll/` | `/hris/employees/:id/salary` |
| 63 | Payroll Runs | ✅ Done | `hris/payroll/` | `/hris/payroll-runs` |
| 64 | Payslips | ✅ Done | `hris/payroll/` | `/hris/payroll-runs/:runId/payslips`, `/hris/my-payslips` |
| 65 | HR Reports | ✅ Done | `hris/report/` | `/hris/analytics` |
| 66 | Onboarding Templates | ✅ Done | `hris/onboarding/` | `/hris/onboarding-templates` |
| 67 | Onboarding Checklists | ✅ Done | `hris/onboarding/` | `/hris/onboarding-checklists`, `/hris/my-onboarding` |

**Total: 67 features — all marked as implemented.**

---

## User Journeys

### Journey 1: Jobseeker — From Registration to Job Match

```
Register (jobseeker) → Email Verification → Build Profile → Add Experiences
    → Trigger AI Evaluation → View Score & Suggestions → Browse Jobs
    → Apply to Job → Track Applications (Kanban) → Receive Feedback
    → View Career Path & Skill Gap → Improve Profile → Re-evaluate
```

**Key Touchpoints:**
- `/auth/register` → `/auth/verify-email` → `/jobseeker/profile` → `/jobseeker/evaluation` → `/jobseeker/matches` → `/jobseeker/applications` → `/jobseeker/feedback` → `/jobseeker/career`

### Journey 2: Company — From Verification to Hiring

```
Register (company) → Submit Verification Docs → Admin Approval
    → Post Jobs → Search Candidates → View Skill Passports
    → Receive Applications → Update Application Status
    → Give Feedback to Candidates → Monitor Reputation Score
```

**Key Touchpoints:**
- `/auth/register` → `/company/verification` → `/company/jobs` → `/company/search` → `/company/applications` → `/company/feedback` → `/company/reputation`

### Journey 3: HRIS — Employee Lifecycle Management

```
Onboard HRIS → Set Up Branches/Departments/Positions
    → Create Employee Records → Assign Roles & Permissions
    → Configure Shifts → Track Attendance (GPS Clock In/Out)
    → Manage Leave Requests → Run Payroll → Generate Reports
    → Offboard Employees
```

**Key Touchpoints:**
- `/hris/branches` → `/hris/departments` → `/hris/employees` → `/hris/roles` → `/hris/shifts` → `/hris/clock-in` → `/hris/leave-request` → `/hris/payroll-runs` → `/hris/analytics`

### Journey 4: Public Visitor — Discovering Talent

```
Visit Public Jobs → Browse Listings → View Job Detail
    → Click Candidate Passport Link → View Skill Passport
    → See Evaluation Score Badge → See Experience Timeline
```

**Key Touchpoints:**
- `/jobs` → `/jobs/:id` → `/profiles/:username` → `/p/:username` (OG tags for social sharing)

---

## Technical Architecture

### Stack Overview

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Runtime** | Go 1.26 (Gin) | Server-side API |
| **Frontend** | React 19 SPA + React Router v7 + Vite 7 | Client-side rendering |
| **Styling** | Tailwind CSS v4 + DaisyUI 5 | No config file — `@import "tailwindcss"` |
| **Database** | PostgreSQL 16 | UUID primary keys throughout |
| **ORM/Query** | go-jet (database-first codegen) + raw SQL migrations | 22 migration files |
| **Auth** | JWT (HS256) + refresh tokens (cookie) | 15min access / 7-day refresh |
| **Forms** | React Hook Form + Zod | Schema validation |
| **State** | TanStack Query v5 | Server state management |
| **Build** | Biome (lint/format) + Lefthook (git hooks) | Single binary tooling |
| **Infra** | Docker Compose (3 services) + Nginx | SPA serving + API proxy |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Jobseeker│  │ Company  │  │     HRIS         │  │
│  │  Pages   │  │  Pages   │  │    (28 pages)    │  │
│  └────┬─────┘  └────┬─────┘  └────────┬─────────┘  │
│       │              │                 │             │
│       └──────────────┼─────────────────┘             │
│                      ▼                               │
│              lib/api.ts (ofetch + JWT)               │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP (Vite proxy or Nginx)
                       ▼
┌──────────────────────────────────────────────────────┐
│                  Backend (Go/Gin)                     │
│  ┌─────────────────────────────────────────────────┐ │
│  │              Handlers Layer                      │ │
│  │  auth | profiles | companies | jobs | search     │ │
│  │  admin | blind | passport | uploads | reference  │ │
│  └──────────────────────┬──────────────────────────┘ │
│                         │                             │
│  ┌──────────────────────┼──────────────────────────┐ │
│  │            Service Layer (internal/)             │ │
│  │  evaluation | matching | application | feedback  │ │
│  │  career | companyreviews | profileviews          │ │
│  │  analytics | notification | webhook | resume     │ │
│  │  hris/ | rbac | spdid | email | authtoken        │ │
│  └──────────────────────┬──────────────────────────┘ │
│                         │                             │
│  ┌──────────────────────┼──────────────────────────┐ │
│  │         Data Layer (pgx + go-jet)                │ │
│  │  db/ | config/ | gen/ | storage/ | lib/          │ │
│  └─────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│                   PostgreSQL 16                       │
│  22 migrations • UUID PKs • JSONB columns            │
│  Enums: role, experience_type, verification_status   │
└──────────────────────────────────────────────────────┘
```

### Key Integrations

| Integration | Package | Purpose |
|------------|---------|---------|
| **Email** | `internal/email/` | Verification, password reset, notifications |
| **AI/LLM** | `internal/evaluation/`, `internal/matching/`, `internal/feedback/`, `internal/career/` | Profile evaluation, job matching, feedback suggestions, career path prediction |
| **Webhooks** | `internal/webhook/` | Application event notifications to external systems |
| **Notifications** | `internal/notification/` | In-app user notifications |
| **File Upload** | `internal/storage/`, `internal/handlers/uploads.go` | Avatar uploads, resume files |
| **Resume Parsing** | `internal/resume/` | AI-powered resume data extraction |
| **SP-DID** | `internal/spdid/` | Decentralized identity for employees |
| **WebSocket** | `internal/hris/attendance/` | Real-time attendance dashboard updates |

### Authentication & Authorization Model

- **JWT Access Token**: 15-minute TTL, HS256, carries `userId` + `role`
- **Refresh Token**: 7-day TTL, stored as SHA-256 hash in DB, HttpOnly cookie, rotated on refresh
- **Roles**: `jobseeker`, `company`, `admin`
- **Middleware Chain**:
  - `AuthRequired(jwtSecret)` — parses Bearer token, sets context
  - `RequireRole("company")` — gates company endpoints
  - `RequireVerifiedCompany(pool)` — ensures company is verified
  - RBAC middleware for HRIS — 9 permission modules, 40+ granular permissions

### Data Model Complexity

- **22 SQL migration files** (000001 through 000018)
- **Core tables**: users, companies, jobseeker_profiles, job_experiences, job_postings, industry_categories, tags
- **AI/ML tables**: ai_evaluations (JSONB skill scores), applications, application_messages
- **Feedback tables**: feedback (JSONB rating_areas + ai_suggestions), company_reviews
- **Career tables**: career_paths, profile_views
- **HRIS tables**: branches, departments, positions, employees (30+ fields), shifts, attendance, leave_types, leave_requests, salary_components, payroll_runs, payslips, onboarding_templates, onboarding_checklists
- **Infrastructure tables**: refresh_tokens, admin_audit_log, webhooks, notifications, auth_tokens
- **Enums**: role, experience_type, verification_status, experience_level, job_status, application_status, and more

---

## Maturity Assessment

### What's Working Well ✅

1. **Feature completeness is remarkable** — 67 features across 3 product phases + a full HRIS module is a significant achievement
2. **Clean architecture** — Monorepo with clear separation (Go handlers → services → data layer), consistent patterns
3. **AI integration is thoughtful** — Cumulative scoring (no cap, no subtraction) encourages honest profiles; industry-agnostic LLM prompts
4. **Fraud prevention is multi-layered** — Company verification (Phase 1) + community reputation (Phase 3) + blind screening mode
5. **HRIS module is production-grade** — 30+ employee fields, RBAC with 40+ permissions, GPS geofenced attendance, full payroll lifecycle
6. **Developer experience** — go-jet codegen, Biome linting, Lefthook hooks, Storybook, Docker Compose setup
7. **Security posture** — JWT with refresh rotation, rate limiting on auth endpoints, bcrypt + argon2id password hashing, timing-safe comparison

### What's Incomplete or Partial ⚠️

1. **No tests** — The AGENTS.md explicitly states "No tests written yet — prefer TDD for new features." This is a significant gap for a platform with 67 features.
2. **N+1 query patterns** — The FINAL_IMPLEMENTATION_PLAN.md documents performance issues in `application/service.go` that haven't been optimized yet.
3. **No mobile app** — Listed as a future consideration in Phase 3 spec. Critical for jobseeker engagement.
4. **No real-time messaging** — Application messaging exists but appears to be basic (no WebSocket for live chat).
5. **No payment/billing** — No monetization layer (job posting fees, premium features, HRIS subscription tiers).
6. **No email templates** — Email sending exists but template system isn't visible in the codebase structure.

### Gaps Compared to Typical Job Platforms 🕳️

| Gap | Impact | Notes |
|-----|--------|-------|
| **No social login** (Google, LinkedIn, Apple) | High friction for registration | Competitors offer 1-click sign-up |
| **No resume upload/parse on company side** | Companies can't bulk-import candidates | Only jobseeker-initiated resume parsing |
| **No interview scheduling** | Manual coordination required | Competitors offer calendar integration |
| **No job alerts/notifications** | Passive jobseekers miss opportunities | Email/push notification for matching jobs |
| **No employer branding pages** | Companies can't showcase culture | Limited to profile + reputation score |
| **No salary benchmarking** | salary_range is a free-text field | No structured data for comparisons |
| **No applicant tracking beyond Kanban** | Limited hiring pipeline visibility | No stages, no pipeline analytics |
| **No multi-language support** | English only | Critical for global expansion |
| **No dark mode persistence verified** | Mentioned in specs but implementation unclear | DaisyUI theme toggling |
| **No SEO optimization** | Only OG tags on passport pages | Jobs pages not optimized for search engines |

---

## Competitive Positioning

### Market Landscape

| Competitor | Focus | Strength | Weakness vs SkillPass |
|-----------|-------|----------|----------------------|
| **LinkedIn** | Professional networking | Massive network effects, brand recognition | No AI evaluation, no skill scoring, noisy feed |
| **Indeed** | Job search aggregator | Largest job database, employer tools | No candidate profiling, no AI matching |
| **Glassdoor** | Company reviews + jobs | Strong employer brand data | No skill evaluation, limited candidate tools |
| **ZipRecruiter** | AI-powered matching | Smart matching algorithm | No public profiles, no career growth tools |
| **AngelList** | Startup jobs | Startup-focused community | Niche market, no HRIS |
| **Workable** | ATS for employers | Full applicant tracking | Employer-only, no jobseeker tools |
| **BambooHR** | HRIS | Comprehensive HR management | No job matching, no public profiles |

### SkillPass Differentiation

1. **Skill Passport** — Public, portable career profile with AI evaluation score badge (viral loop via `/profiles/:username`)
2. **Cumulative AI Scoring** — No upper limit encourages honest, complete profiles; every skill and experience adds value
3. **Bidirectional Feedback** — Companies give skill feedback to candidates; candidates rate companies (reputation score)
4. **Skill Gap Radar** — Market-driven skill comparison using real platform data (not generic advice)
5. **Integrated HRIS** — Same platform handles hiring AND workforce management (rare combination)
6. **Fraud Prevention** — Verification + community reputation + blind screening (triple protection)
7. **Decentralized Identity** — SP-DID for employee verifiable credentials (forward-looking)

### Market Positioning Opportunities

- **"The platform where your career grows, not just your job"** — SkillPass isn't just a job board; it's a career development platform
- **"AI-powered talent marketplace with built-in HR"** — Unique combination of job matching + HRIS
- **"Verified companies, verified skills"** — Trust-first approach differentiates from spam-heavy competitors
- **Indonesian market focus** — HRIS module uses Indonesian tax terms (NPWP, BPJS Kesehatan/Ketenagakerjaan, KTP) — strong local positioning

---

## Key Findings

1. **SkillPass is a feature-rich platform with 67 implemented features** spanning job matching, AI evaluation, feedback systems, career growth tools, and a full HRIS module — an unusually broad scope for a startup-stage product.

2. **The AI evaluation engine is the core differentiator** — cumulative scoring with no upper limit, industry-agnostic prompts, and skill gap analysis using real platform data create a unique value proposition that competitors lack.

3. **The HRIS module is production-grade but disconnected** — it's a standalone system with its own RBAC (40+ permissions), attendance tracking, payroll, and onboarding, but the connection to the job platform side is minimal (same user accounts).

4. **Testing is the biggest gap** — zero test coverage across 67 features and 22 migrations represents significant technical debt and risk.

5. **The product has strong Indonesian market signals** — HRIS uses Indonesian tax/social security terminology, suggesting early market focus in Southeast Asia.

---

## Recommendations for Future Improvement

### Priority 1: Foundation & Quality (Critical)
1. **Add comprehensive test coverage** — Start with Go handler tests and web component tests; target 80% coverage on critical paths (auth, applications, payments)
2. **Fix N+1 query patterns** — Optimize `application/service.go` as documented in FINAL_IMPLEMENTATION_PLAN.md
3. **Add integration tests** — End-to-end tests for key user journeys (registration → evaluation → application)

### Priority 2: User Experience (High)
4. **Add social login** (Google, LinkedIn) — Reduce registration friction dramatically
5. **Build a mobile app** — Critical for jobseeker engagement and attendance clock-in
6. **Add real-time messaging** — WebSocket-based chat between companies and candidates
7. **Implement job alerts** — Email/notifications for matching jobs based on profile

### Priority 3: Monetization (High)
8. **Design pricing tiers** — Freemium model: free for jobseekers, paid for companies (job posting fees, premium candidate search, HRIS subscription)
9. **Add payment processing** — Stripe integration for job posting fees and HRIS subscriptions
10. **Implement premium features** — Featured listings, advanced analytics, priority support

### Priority 4: Growth & Expansion (Medium)
11. **Add employer branding pages** — Company culture showcase, team photos, benefits
12. **Implement structured salary data** — Replace free-text salary_range with structured fields for benchmarking
13. **Add interview scheduling** — Calendar integration (Google Calendar, Outlook)
14. **SEO optimization** — Structured data for job listings, sitemap generation
15. **Multi-language support** — Critical for regional expansion beyond Indonesia

### Priority 5: Advanced Features (Lower)
16. **Skill assessments/quizzes** — Verified skill badges beyond AI evaluation
17. **Learning platform integration** — Coursera, Udemy, YouTube recommendations
18. **Peer endorsements** — Colleagues can validate specific skills
19. **Advanced analytics** — Hiring pipeline analytics, time-to-hire metrics
20. **API for third-party integrations** — Allow ATS/HRIS imports and exports

---

## Document Metadata

| Field | Value |
|-------|-------|
| **File** | `docs/research/product-overview.md` |
| **Created** | 2026-06-24 |
| **Version** | 1.0 |
| **Sources** | Codebase analysis, 3 phase specs, FEATURES.md, migration files, API types, handler code |
| **Scope** | Full product (67 features, 4 user roles, 22 migrations) |
