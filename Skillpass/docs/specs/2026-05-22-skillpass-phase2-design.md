# SkillPass — Phase 2: AI Evaluation & Matching

## Overview

Phase 2 adds AI-powered profile evaluation (unlimited cumulative scoring), job applications, AI-driven candidate-job matching, and an Application Kanban for jobseekers. Builds on Phase 1 (profiles, companies, job postings, company verification, candidate search).

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

---

## New Data

```
ai_evaluations
  id                    uuid PK
  profile_id            uuid FK -> jobseeker_profiles.id
  overall_score         int
  strengths             jsonb    [{ skill, score, note }]
  weaknesses            jsonb    [{ skill, score, note }]
  suggestions           jsonb    [{ area, tip }]
  skill_scores          jsonb    [{ skill, category, score }]
  raw_analysis          text
  created_at            timestamp

applications
  id                    uuid PK
  jobseeker_id          uuid FK -> jobseeker_profiles.id
  job_posting_id        uuid FK -> job_postings.id
  status                'applied' | 'reviewed' | 'interviewed' | 'offered' | 'rejected'
  created_at            timestamp
  updated_at            timestamp
```

---

## AI Evaluation Engine

Triggered by jobseeker (`POST /evaluate/me`). Always recalculates from full profile — no incremental updates.

**Input:** Full profile (experiences, skills, about).
**LLM Prompt:** System prompt defines scoring criteria applicable across all industries (tech, manufacturing, gig economy, fresh graduates, creative professionals, etc.).
**Output:** Structured JSON:
- `overall_score` (int, cumulative, unlimited cap)
- `strengths[]` — `{ skill, score, note }`
- `weaknesses[]` — `{ skill, score, note }`
- `suggestions[]` — `{ area, tip }`
- `skill_scores[]` — `{ skill, category, score }`

**Storage:** Raw LLM response in `raw_analysis`, parsed breakdown in structured JSONB columns.

**Scoring principle:** Every skill, year of experience, job entry, and identified strength adds points. Weaknesses identify gaps but don't subtract. No upper limit — encourages honest, complete profiles.

---

## New API

```
Evaluation:
  POST   /api/v1/evaluate/me               — trigger AI evaluation
  GET    /api/v1/evaluate/me/results       — latest evaluation

Applications:
  POST   /api/v1/jobs/:id/apply
  GET    /api/v1/applications/me           — kanban data grouped by status
  PUT    /api/v1/applications/:id/status   — company updates status

Matching:
  GET    /api/v1/jobs/matches              — recommended jobs for jobseeker (AI)
  GET    /api/v1/candidates/matches        — recommended candidates for job (AI)
```

---

## New Pages

```
/jobseeker/evaluation      — trigger AI eval, view detailed results + score
/jobseeker/applications    — Kanban: Applied | Interviewing | Offers
/jobseeker/passport        — now shows score badge
```

---

## Application Kanban

Jobseeker dashboard organized as a kanban board with columns:
- **Applied** — jobs they've applied to
- **Reviewing** — companies marked as reviewing
- **Interviewing** — companies marked as interviewing
- **Offers** — offers received

Company can update application status from their end. Status changes are reflected in real time.

---

## Skill Passport Update

The Phase 1 public passport page now includes:
- Score badge (overall_score from latest AI evaluation)
- Strengths list
- Skill scores visualization
- Link to trigger re-evaluation

---

## Design Principles

- **Stateless evaluation:** AI always sees the full profile. No incremental updates.
- **Industry-agnostic:** LLM prompt handles all jobseeker types (tech, non-tech, gig, students).
- **Cumulative scoring:** No cap encourages completeness.

## Future Considerations (Not in Phase 2)

- Company feedback system (Phase 3)
- Skill gap radar and career path (Phase 3)
- Company reputation score (Phase 3)
- Profile view tracking (Phase 3)
