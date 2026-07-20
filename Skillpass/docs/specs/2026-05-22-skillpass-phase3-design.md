# SkillPass — Phase 3: Feedback & Career Growth

## Overview

Phase 3 adds company-to-candidate feedback with AI-generated learning suggestions, a Skill Gap Radar visualization, AI career path predictions, and a Company Rep Score. Builds on Phase 1 (profiles, companies, job postings) and Phase 2 (AI evaluation, applications, matching).

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
feedback
  id                    uuid PK
  profile_id            uuid FK -> jobseeker_profiles.id
  company_id            uuid FK -> companies.id
  content               text
  rating_areas          jsonb    [{ skill, rating, note }]
  ai_suggestions        jsonb    [{ area, tip, resource? }]
  created_at            timestamp

company_reviews
  id                    uuid PK
  company_id            uuid FK -> companies.id
  candidate_id          uuid FK -> jobseeker_profiles.id
  rating                int        (1-5)
  review                text?
  interaction_type      'applied' | 'interviewed'
  created_at            timestamp

career_paths
  id                    uuid PK
  title                 text
  description           text
  skill_requirements    jsonb
  typical_progression   jsonb    [{ from_role, to_role }]
  industry              text

profile_views
  id                    uuid PK
  profile_id            uuid FK -> jobseeker_profiles.id
  company_id            uuid FK -> companies.id
  viewed_at             timestamp
```

---

## Feedback Flow

1. Company views candidate profile → clicks "Give Feedback"
2. Form: rate specific skill areas (1-5 per skill), write free-text feedback
3. On submit: feedback saved → background AI call analyzes the feedback and appends learning suggestions (`ai_suggestions`)
4. Jobseeker sees both the company's original feedback and the AI-generated suggestions on their dashboard

---

## Skill Gap Radar

Radar/spider chart comparing jobseeker's current skill levels against aggregated market demand for their target industry.

**Data source:**
- Jobseeker skill scores from latest AI evaluation
- Aggregated demand data from job postings on the platform (most-requested skills per industry)

**Output:** A multi-axis chart showing which skills are strong, which need development, and the gap to market expectations.

---

## Career Path Prediction

AI analyzes platform data to predict career trajectory:

> "Profiles like yours typically grow into Senior Backend Engineer within 2-3 years based on 240 similar profiles. You're strong in React and TypeScript but need Node.js and system design to bridge the gap."

**Data source:** Aggregated, anonymized profile data. Compares the jobseeker's skill profile against profiles that have progressed to more senior roles.

---

## Company Rep Score

Candidates rate companies after applying or interviewing (1-5 stars + optional review).

**Scoring:**
- Average rating displayed on job postings and company profile
- Review count displayed alongside the score
- Low-scoring companies get reduced visibility in search results — natural fraud deterrent

**Prevents:**
- Fake job postings (candidates can report poor experiences)
- Fraudulent companies (verified status + community rating creates double protection)

---

## New API

```
Feedback:
  POST   /api/v1/feedback/:profile_id      — company gives feedback
  GET    /api/v1/feedback/me               — jobseeker sees their feedback
  GET    /api/v1/feedback/suggestions/me   — AI suggestions for jobseeker

Company Reviews:
  POST   /api/v1/companies/:id/reviews     — candidate rates company
  GET    /api/v1/companies/:id/reputation  — aggregated score + count

Career:
  GET    /api/v1/career/paths              — list career paths
  GET    /api/v1/career/skill-gap/me       — radar chart data
  GET    /api/v1/career/path/me            — predicted career path

Profile Views:
  GET    /api/v1/profiles/me/views         — who viewed my profile
```

---

## New Pages

```
/jobseeker/feedback        — feedback received + AI learning suggestions
/jobseeker/career          — skill gap radar + career path prediction
/jobseeker/analytics       — profile views, application stats

/company/feedback          — feedback I've given, history
/company/reputation        — my company's reputation score + reviews
```

---

## Design Principles

- **Double-layer fraud prevention:** Verification (Phase 1) + Community reputation (Phase 3).
- **Actionable feedback:** Every weakness identified by a company gets an AI-suggested next step.
- **Market-driven growth:** Skill Gap Radar uses real platform data, not generic advice.

## Future Considerations (Beyond Phase 3)

- Anonymous profiles (toggle personal info hidden from search)
- Peer endorsements for specific skills
- Skill assessments / quizzes (verified skill badges)
- Integration with learning platforms (Coursera, Udemy, YouTube)
- Mobile application
- Onboarding AI chat for profile building
