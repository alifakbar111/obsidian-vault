# SkillPass — Phase 1: Core Profiles & Job Postings

## Overview

SkillPass is a web platform where jobseekers build structured career profiles and verified companies discover candidates and post jobs. Phase 1 ships the foundational layers: auth, profile management, company verification, basic candidate search, job postings, and the public Skill Passport page.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Server Runtime | Go 1.24 (Gin framework) |
| Frontend | React 19 + React Router v7 + Vite 7 |
| Styling | Tailwind CSS v4 + DaisyUI 5 |
| Database | PostgreSQL 16 |
| Database Layer | pgx pool + go-jet (database-first codegen) + raw SQL migrations |
| Auth | JWT (custom middleware, Bearer token) + refresh tokens |
| Form Validation | React Hook Form + Zod |
| Component Docs | Storybook 10 |
| Lint / Format | Biome 2.x (single binary, replaces ESLint + Prettier) |
| Git Hooks | Lefthook |
| Infrastructure | Docker Compose (3 services: db, server, web) + Nginx (SPA serving + `/api/` proxy) |

## Dark/Light Mode

Built-in DaisyUI theme toggling via `data-theme` on `<html>`. Two themes (e.g. `"winter"` for light, `"dark"` for dark). Toggle persisted in `localStorage`. No custom CSS needed.

---

## Data Model

### Enums

- `role`: `'jobseeker' | 'company' | 'admin'`
- `experience_type`: `'employment' | 'gig' | 'education' | 'certification' | 'project' | 'volunteering'`
- `verification_status`: `'pending' | 'verified' | 'rejected'`
- `experience_level`: `'entry' | 'mid' | 'senior' | 'lead' `
- `job_status`: `'open' | 'closed'`

### Tables

```
users
  id                    uuid PK
  email                 text unique
  username              text unique
  password_hash         text
  role                  role
  name                  text
  avatar_url            text?
  is_verified           boolean default false
  created_at            timestamptz

companies
  id                    uuid PK
  user_id               uuid FK -> users.id (unique)
  company_name          text
  website               text?
  industry              text
  description           text?
  verification_status   verification_status default 'pending'
  verification_docs     jsonb?
  verified_at           timestamptz?
  created_at            timestamptz

jobseeker_profiles
  id                    uuid PK
  user_id               uuid FK -> users.id (unique)
  headline              text?
  about                 text?
  years_of_experience   int?
  slug                  text unique    — derived from username for public URL

job_experiences
  id                    uuid PK
  profile_id            uuid FK -> jobseeker_profiles.id
  type                  experience_type
  title                 text
  organization          text        (company name / platform / institution)
  start_date            text
  end_date              text?
  is_current            boolean default false
  description           text?
  industry              text?
  skills_used           text[]?
  url                   text?

industry_categories
  id                    uuid PK
  name                  text unique
  description           text?

tags
  id                    uuid PK
  name                  text
  industry_category_id  uuid FK -> industry_categories.id

job_postings
  id                    uuid PK
  company_id            uuid FK -> companies.id
  title                 text
  description           text
  industry              text
  tags                  text[]?
  required_skills       text[]?
  experience_level      experience_level?
  location              text?
  salary_range          text?
  status                job_status default 'open'
  created_at            timestamptz

refresh_tokens
  id                    uuid PK
  user_id               uuid FK -> users.id
  token_hash            text
  expires_at            timestamptz
  created_at            timestamptz

admin_audit_log
  id                    uuid PK
  admin_id              uuid FK -> users.id
  action                text
  target_type           text
  target_id             uuid
  metadata              jsonb?
  created_at            timestamptz
```

### Indexes

- `job_experiences(profile_id)`
- `tags(industry_category_id)`
- `job_postings(status, created_at)`
- `job_postings(company_id)`
- Additional indexes from migration `000004` for query performance

---

## API Endpoints

```
Health:
  GET    /api/v1/health

Auth:
  POST   /api/v1/auth/register             { email, username, password, name, role }
  POST   /api/v1/auth/login                { email, password }
  POST   /api/v1/auth/refresh              { refresh_token }
  POST   /api/v1/auth/logout               — requires auth
  (Auth endpoints are rate-limited: 5 req for register/login, 10 for refresh)

Jobseeker Profile:
  GET    /api/v1/profiles/me
  PUT    /api/v1/profiles/me               { headline, about, years_of_experience, slug? }
  POST   /api/v1/profiles/me/experience    { type, title, organization, start_date, ... }
  PUT    /api/v1/profiles/me/experience/:id
  DELETE /api/v1/profiles/me/experience/:id
  GET    /api/v1/profiles/:username         — public passport page

Company:
  GET    /api/v1/company/profile
  PUT    /api/v1/company/profile           { company_name, website, industry, description }
  POST   /api/v1/company/verification      { business_registration, website, address, contact }
  GET    /api/v1/company/verification-status

Job Postings (company — verified only):
  GET    /api/v1/jobs/me                   — my company's listings
  POST   /api/v1/jobs                      { title, description, industry, ... }
  PUT    /api/v1/jobs/:id
  DELETE /api/v1/jobs/:id

Job Postings (public):
  GET    /api/v1/jobs                      — filters: industry, tags, experience_level, limit, offset
  GET    /api/v1/jobs/:id

Search (verified companies only):
  GET    /api/v1/search/candidates         — ?q=keyword&industry=Tech&skills=React,TypeScript

Reference:
  GET    /api/v1/industries
  GET    /api/v1/tags?industry=:id

Admin:
  GET    /api/v1/admin/verifications/pending
  POST   /api/v1/admin/verifications/:id   { action: 'approve' | 'reject', reason? }
```

### Middleware Chain

| Endpoint Group | Middleware |
|---|---|
| Auth (register, login, refresh) | Rate limiter only |
| `/profiles/me/*` | `AuthRequired` (any role) |
| `/company/*` | `AuthRequired` + `RequireRole("company")` |
| `/jobs` (write, my listings), `/search/candidates` | `AuthRequired` + `RequireRole("company")` + `RequireVerifiedCompany` |
| `/admin/*` | `AuthRequired` + `RequireRole("admin")` |

---

## Frontend Pages

```
/                              — landing page with hero, features, CTAs
/auth/login                    — email/password login (redirects admin to /admin/verifications)
/auth/register                 — role-based registration with conditional fields

/jobseeker/profile             — edit headline, about, years of experience; CRUD experiences
/jobseeker/passport            — preview own public passport

/company/profile               — edit company details (name, website, industry, description)
/company/verification          — submit verification docs, check status with timeline
/company/search                — browse candidates with keyword/industry/skills filters (verified only)
/company/jobs                  — manage job postings (create inline, update, delete)

/jobs                          — public job listings with filters
/jobs/:id                      — job detail view

/profiles/:username            — public Skill Passport

/admin/verifications           — approve/reject company verification requests
```

### UI Component Library (Storybook)

Shared components with Storybook documentation:
- Badge, Button, Card, Fieldset, Input, Loading (atomic components)
- States patterns (loading, empty, error, success)
- Design tokens visualization

### Auth Guards

- `ProtectedRoute` wrapper enforces authentication and optional role requirement
- `AuthProvider` context manages tokens (access + refresh in localStorage)
- API wrapper (`lib/api.ts`) auto-attaches Bearer token and auto-refreshes on 401

### Form Validation

All forms use React Hook Form + Zod schemas with:
- Conditional validation for company registration fields
- Server error display
- Loading states during submission

---

## Skill Passport (Phase 1)

Public URL: `/profiles/:username`. Displays:
- Name, photo, headline
- Experience timeline (grouped by type: employment, gig, education, etc.)
- Skills list aggregated from experience entries
- Industry tags

No score badge yet (deferred to Phase 2).

---

## Verification Flow

1. Company registers with `role: 'company'` (includes business registration, website, address, contact)
2. `verification_status` defaults to `'pending'`
3. Admin reviews in `/admin/verifications` dashboard — sees submitted docs
4. Approved → `verification_status = 'verified'`, `verified_at` timestamp set. Company can now search candidates and post jobs.
5. Rejected → reason stored in audit log, company can resubmit

Unverified companies can create an account, view/edit their profile, and check verification status but **cannot** search candidates or post jobs.

### Verification Status Timeline

The frontend displays the current status with visual indicators (pending/verified/rejected) and relevant CTAs (resubmit if rejected).

---

## Infrastructure

### Docker Compose (3 services)

| Service | Base Image | Port | Notes |
|---|---|---|---|
| `db` | postgres:16-alpine | 5432 | Persistent volume |
| `server` | golang:1.24-alpine (build) → alpine:3.19 (run) | 1234 | Static binary, migrations copied in |
| `web` | oven/bun:1 (build) → nginx:alpine (serve) | 4200 | Nginx proxies `/api/` to server:8800, SPA fallback |

### Local Dev (non-Docker)

- Server runs via `go run ./cmd/server/` on port 1234
- Web runs via `vite dev` on port 4200
- Vite proxies `/api` → `:1234`
- PostgreSQL runs via `docker compose up db -d`

### Dev URLs

- Web: http://localhost:4200
- API: http://localhost:1234

---

## Design Principles

- **YAGNI:** Build only what's specified. No stubs for future phases.
- **Portable Skill Passport:** Public profile URL is the viral loop — every profile is free marketing.
- **Fraud Prevention:** Company verification gates candidate search and job posting.
- **Database-first:** Schema defined in SQL migrations; go-jet generates type-safe Go code from the live database.
- **Password hashing:** bcrypt with configurable cost; argon2id fallback for existing hashes.

## Future Considerations (Not in Phase 1)

- AI evaluation and scoring (Phase 2)
- Job applications and matching (Phase 2)
- Company feedback system (Phase 3)
- Skill gap radar (Phase 3)
- Career path prediction (Phase 3)
- Company reputation score (Phase 3)
- Anonymous profiles