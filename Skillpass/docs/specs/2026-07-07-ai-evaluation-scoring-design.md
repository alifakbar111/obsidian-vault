# AI Evaluation Scoring — Design Spec

**Date:** 2026-07-07
**Status:** Draft — living document, will be updated as design progresses
**Author:** Agent Manager (orchestrated)

## Overview

The SkillPass AI Evaluation system assesses a jobseeker's skills using an LLM, producing per-skill scores, strengths/weaknesses, suggestions, and an overall score. The current implementation suffers from **high variance in overallScore** (200 → 50 → 1000 for the same profile across runs) because the LLM is asked to produce a holistic "overall score" with no anchor or formula.

This spec defines a **deterministic scoring framework** that makes evaluation results consistent, explainable, and comparable across profiles and industries.

---

## Problem Statement

1. **Non-deterministic overallScore** — The LLM currently produces `overallScore` with unbounded range and no formula. The same profile gets wildly different scores across runs. This breaks matching, ranking, and user trust.
2. **Missing scoring rubric** — The LLM prompt doesn't define what factors contribute to a skill score, leading to inconsistent per-skill assessments.
3. **Underused data** — The `job_experiences` table already stores education, certification, project, volunteering, and employment data with rich metadata (dates, descriptions, industries, URLs), but the evaluation only uses a subset.
4. **No industry-agnostic design** — The current prompt leans toward tech industry terminology.

---

## Scoring Philosophy: "The Count" (Inspired by Plunderer)

Inspired by the anime *Plunderer*, each skill has a **Count** — a cumulative point total that only ever increases. The Count represents everything a person has done with that skill:

- Every year of experience **adds** to the Count
- Every role, certification, and project **adds** to the Count
- **Nothing ever subtracts** — no recency decay, no penalties for gaps
- **No upper cap** — the Count keeps climbing with every new achievement
- Higher Count = earned recognition

This means a nurse who trained 20 years ago still has those points. A developer who switched careers and hasn't used Java in 5 years still gets credit for that Java experience. The Count is a **lifetime achievement record**, not a "how hot are you right now" meter.

---

## Scoring Architecture

### High-Level Approach

```
USER INPUTS PROFILE
  ├─ Work History (employment, gig)
  ├─ Education (degrees, diplomas)
  ├─ Certifications & Licenses
  ├─ Projects & Portfolio
  └─ Volunteering
       │
       ▼  User clicks "Evaluate" (or auto-triggered on job application if expired)
       │
ASSEMBLE FULL PROFILE DATA
  - All experience types with metadata
  - Skills extracted from each entry
       │
       ▼
LLM EXTRACTS STRUCTURED FACTS PER SKILL
  For each skill found in profile:
  - total_years (float)         ← calendar years, no concurrent double-count
  - num_roles (integer)         ← distinct roles mentioning the skill
  - role_weight (enum)          ← entry / skilled / senior / expert
  - education_level (enum)      ← none / hs / diploma / bachelor / master / phd
  - num_certifications (integer) ← count of standard certs for this skill
  - num_licenses (integer)       ← count of professional licenses for this skill
  - num_projects (integer)
  - num_organizations (integer)
  - has_url (boolean)
       │
       ▼
SERVER COMPUTES COUNT PER SKILL (deterministic formula)
  skillCount = (years × 10) + (roles × 15) + role_weight
             + education_bonus + certification_bonus
             + project_portfolio_bonus
             + (orgs - 1) × 5 + (has_url ? 10 : 0)
       │
       ▼
totalCount = Σ(all skillCounts) + (numSkills - 1) × 10
       │
       ▼
STORE EVALUATION
  - Set current evaluation: is_current = true
  - Flag previous evaluation: is_current = false
  - Keep all history (never delete)
       │
       ▼
EVALUATION LIFECYCLE
  - Valid for 3 months
  - Expired → banner reminder on evaluation page
  - Expired + user applies to job → auto-trigger fresh evaluation
  - Old evaluations still work for browsing/matching
```

**Key principle:** The LLM is only asked to **extract facts** — things it does reliably. All arithmetic is deterministic server-side. Same profile → same extracted facts → same Count every time.

---

## Universal Point Table

Every skill's Count is computed from a fixed point table. The LLM extracts the facts; the server does the math.

| # | Factor | How to count | Points |
|---|---|---|---|
| 1 | **Experience duration** | Calendar years the skill was actively used (no double-counting for concurrent roles) | +10 per year |
| 2 | **Each distinct role** | Each employment/gig/etc. that mentions the skill | +15 per role |
| 3 | **Role weight** | Single merged factor: seniority + description quality + impact scope | Entry: +10, Skilled: +35, Senior: +65, Expert/Leader: +100 |
| 4 | **Education** | Per skill studied in formal education (highest level applies) | HS: +5, Diploma/Associate: +15, Bachelor's: +30, Master's: +45, PhD/Doctorate: +65 |
| 5 | **Certification** | Per certification/license entry matching the skill | +10 per standard cert, +20 per professional license |
| 6 | **Project, Portfolio & Research** | Each project, portfolio, or research entry that demonstrates the skill | +10 per entry |
| 7 | **Context diversity** | Number of distinct organizations where skill was used | +5 per org (after the first) |
| 8 | **Published/Public evidence** | Has a URL showing work with this skill | +10 |

### Role Weight Details

Replaces the old three-factor system (seniority + description quality + impact scope) with a single LLM-judged bucket.

| Bucket | Indicators | Points |
|---|---|---|
| **Entry / Routine** | Junior/Associate/Intern title, basic or routine tasks, individual contributor scope | +10 |
| **Skilled** | Mid-level title, independent work, moderate complexity, some ownership | +35 |
| **Senior / Lead** | Senior/Lead/Supervisor/Head title, complex non-routine work, leads others | +65 |
| **Expert / Leader** | Manager/Director/VP/C-level title, org-wide impact, strategic decisions, enterprise scope | +100 |

### Education Details

| Level | Points per skill | Notes |
|---|---|---|
| **High School** | +5 | High school diploma or equivalent |
| **Diploma / Associate** | +15 | D1-D3, vocational school, associate degree |
| **Bachelor's** | +30 | S1 / Bachelor's degree (any field) |
| **Master's** | +45 | S2 / Master's degree |
| **PhD / Doctorate** | +65 | S3 / Doctoral degree |

The bonus applies to each skill that was studied as part of the degree (listed in the education entry's `skills_used`). Only the highest education level applies per skill.

### Certification Details

| Type | Points each | Examples |
|---|---|---|
| **Standard certification** | +10 each | AWS Certified, Google cert, Coursera, company-specific training, organization-issued |
| **Professional license** | +20 each | RN (nurse), CPA (accountant), PE (engineer), regulated professions |

### Per-skill Count Formula

```
skillCount =
    (years × 10)              ← calendar years, no concurrent double-count
  + (roles × 15)              ← distinct roles
  + role_weight               ← 10 / 35 / 65 / 100
  + education_bonus           ← 5 / 15 / 30 / 45 / 65
  + certification_bonus       ← (num_certs × 10) + (num_licenses × 20)
  + project_portfolio_bonus   ← +10 per project/portfolio/research entry
  + (orgs - 1) × 5            ← context diversity
  + (has_url ? 10 : 0)        ← public evidence
```

**Examples:**

> **React developer, 3 years, 2 roles, Senior role weight, 1 cert, 1 side project**
> = (3×10) + (2×15) + 65 + 0 + (1×10) + (1×10) + (2-1)×5 + 0
> = 30 + 30 + 65 + 0 + 10 + 10 + 5 + 0
> = **150 Count** for React

> **React developer, 3 years, 2 roles, Senior role weight, Bachelor's in CS, 1 cert, 1 side project**
> = (3×10) + (2×15) + 65 + 30 + (1×10) + (1×10) + (2-1)×5 + 0
> = 30 + 30 + 65 + 30 + 10 + 10 + 5 + 0
> = **180 Count** for React

> **Nurse with diploma, 8 years, 3 roles, Senior role weight (Head Nurse), 2 licenses (RN + BLS)**
> = (8×10) + (3×15) + 65 + 15 + (2×20) + 0 + (3-1)×5 + 0
> = 80 + 45 + 65 + 15 + 40 + 0 + 10 + 0
> = **255 Count** for Patient Care

### Overall Total Count

```
totalCount = Σ(all skillCounts) + breadthBonus
breadthBonus = (numSkills - 1) × 10   ← rewards multi-skilled profiles moderately
```

The totalCount is stored in the `ai_evaluations.overall_score` column and is always a positive integer with no upper bound.

---

## Universal Scoring Factors (Industry-Agnostic)

Every factor below applies equally to **any industry** — healthcare, finance, education, logistics, creative, tech, etc. These are the dimensions the LLM is instructed to extract/judge when evaluating each skill.

### 1. Experience Duration (years)

How long has the person actively used this skill?

| Data Source | Extraction |
|---|---|
| `start_date` → `end_date` across all experiences mentioning the skill | LLM counts total years of hands-on use |

**Examples:**
- "Patient care: 8 years across 3 roles" → 8 years
- "Go: 2 years in one role" → 2 years
- "Financial modeling: 6 months internship" → 0.5 years

### 2. Role Weight

The LLM assigns a single **role weight bucket** per skill based on the highest-level role where the skill was used. This replaces the old three-factor system (seniority + description quality + impact scope).

| Bucket | Indicators | Points |
|---|---|---|
| **Entry / Routine** | Junior/Associate/Intern/Trainee title, support or routine tasks, individual contributor, supervised work | +10 |
| **Skilled** | Regular professional title, independent work, moderate complexity, some ownership | +35 |
| **Senior / Lead** | Senior/Lead/Supervisor/Head title, complex work, leads others, experienced professional | +65 |
| **Expert / Leader** | Manager/Director/VP/C-level title, org-wide impact, strategic decisions, enterprise scope | +100 |

The LLM evaluates these signals holistically:
- **Title keywords** — Junior, Senior, Lead, Manager, Director, VP, Head, etc.
- **Description depth** — Is the work described as routine or complex? Are there metrics?
- **Scope indicators** — "Led team of X", "Managed budget", "Individual contributor"
- **Industry context** — Same title may differ across industries (e.g., "Staff Nurse" vs "Staff Engineer")

#### Ambiguous Title Classification Reference

When the title alone is ambiguous, use these industry-aware rules. The LLM should combine title keywords with description scope and industry to determine the bucket.

**Entry / Routine (+10)**

| Title | Industry | Why |
|---|---|---|
| Assistant / Admin Assistant | Any | Support role, supervised work |
| Aide / Teacher's Aide | Education / Healthcare | Supports primary professional |
| Intern / Trainee / Apprentice | Any | Learning role, supervised |
| Cadet | Military / Police / Aviation | Entry-level trainee |
| Clerk | Office / Retail | Routine administrative tasks |
| Receptionist | Any | Front-desk, support |
| Helper | Any | Support role |
| Volunteer | Non-profit / Any | Unpaid, usually support |
| Associate | Retail / Professional services | Junior-level, e.g. "Sales Associate" |
| Fresh Graduate | Any | First role after graduation |
| Crew | Food / Retail / Hospitality | Entry-level operational |
| Agent | Call center / Customer service | Usually entry-level support |
| Fellow (academic) | Education / Research | Early-career researcher (post-grad) |
| Junior [anything] | Any | Explicit junior indicator |

**Skilled (+35)**

| Title | Industry | Why |
|---|---|---|
| **Staff** | Any (default) | Regular full-time professional — "Staff Nurse", "Staff Accountant", "Staff Writer" |
| **Teacher** | Education | Independent professional work, classroom ownership |
| **Member** | Any (default) | Regular team member, full contributor — "Team Member", "Faculty Member" |
| **Mentor** | Any | Requires experience to guide others |
| **Freelancer** | Any | Independent professional, self-directed |
| Specialist | Any | Focused expertise in a domain |
| Coordinator | Any | Manages logistics/coordination, independent work |
| Data Team Lead | Tech | Manages data team, Senior (+65) — not Expert unless titled "Director" |
| IT Manager (short-term/freelance) | Any | Ambiguous — recommend Senior (+65) for <1yr freelance; Expert (+100) for long-term permanent |
| Analyst | Finance / Tech / any | Independent analysis work |
| Technician | Healthcare / Tech / Industrial | Hands-on technical work, skilled |
| Consultant | Professional services | Independent client work |
| Instructor | Education / Fitness / Any | Teaches independently |
| Teaching Assistant | Education | Skilled (+35) IF long-term (≥1yr) with direct teaching/assessment responsibilities. Entry (+10) IF short-term (<6mo) or limited to grading only. |
| Officer | Banking / Military / Police | Professional role with responsibility |
| Representative | Sales / Customer service | Client-facing professional |
| Associate (professional) | Law / Consulting / Banking | Mid-level, e.g. "Associate Attorney" |
| Accountant | Finance | Professional role, qualified |
| Nurse (general) | Healthcare | Professional, independent patient care |
| Therapist | Healthcare | Licensed professional, independent |
| Librarian | Education | Professional, independent |
| Recruiter | HR / Any | Professional, independent |
| Copywriter | Creative / Marketing | Professional, independent |
| Editor | Media / Publishing | Professional, independent |
| Designer | Creative / Tech | Professional, independent |
| Developer | Tech | Professional, hands-on |
| Engineer (general) | Tech / Industrial | Professional, hands-on |
| Underwriter | Insurance / Finance | Professional, independent analysis |

**Senior / Lead (+65)**

| Title | Industry | Why |
|---|---|---|
| Senior [anything] | Any | Explicit senior indicator |
| Lead [anything] | Any | Leads work, guides others |
| Head [anything] | Any | Head of a function/area |
| Supervisor | Any | Directly supervises others |
| Team Lead | Any | Leads a team |
| Principal [anything] | Any | Senior individual contributor |
| Senior Staff | Any | Senior-level professional |
| Staff Engineer | Tech | Senior IC role (note: different from "Staff Nurse" which is Skilled) |
| Head Nurse | Healthcare | Senior nursing role |
| Senior Teacher / Head Teacher | Education | Experienced teacher, may lead department |
| Senior Analyst | Any | Experienced analyst |
| Senior Consultant | Professional services | Experienced consultant |
| Project Manager | Any | Leads projects, coordinates teams |
| Product Manager | Tech / Any | Owns product decisions |
| Foreman | Construction / Industrial | Supervises workers on site |
| Captain | Hospitality / Aviation | Leads a team/crew |
| Dean | Education | Leads a faculty/department |
| Senior Designer / Lead Designer | Creative | Senior creative role |
| Architect (title) | Tech / Construction | Senior design role |

**Expert / Leader (+100)**

| Title | Industry | Why |
|---|---|---|
| Manager | Any (with scope) | Manages people, budgets — e.g. "Department Manager", "Store Manager" |
| Senior Manager | Any | Senior management role |
| Director | Any | Leads a department/division |
| VP / Vice President | Any | Executive leadership |
| C-level (CEO, CTO, CFO, COO, etc.) | Any | Top executive |
| Managing Director | Professional services / Finance | Senior leadership |
| Partner | Law / Consulting / Finance | Firm ownership/leadership |
| President | Any | Organization leader |
| Owner / Founder | Any | Business ownership |
| Board Member | Any | Governance role |
| Superintendent | Education / Construction | Oversees entire operation |
| Principal (school) | Education | School leader |
| Chief [Officer] | Any | Executive-level role |
| Head of [Department] | Any | Department-wide responsibility |
| Controller | Finance | Senior financial leadership |
| Executive Director | Non-profit / Any | Leadership role |

### 3. Education

The LLM identifies the highest education level where each skill was studied.

| Level | Points per skill | Examples |
|---|---|---|
| **High School** | +5 | High school diploma or equivalent |
| **Diploma / Associate** | +15 | Vocational school, D1-D3, associate degree |
| **Bachelor's** | +30 | S1 / Bachelor's degree |
| **Master's** | +45 | S2 / Master's degree |
| **PhD / Doctorate** | +65 | S3 / Doctoral degree |

### 4. Certification & License

These are **count-based** — each individual certification/license entry adds its points.

| Type | Points each | Examples |
|---|---|---|
| **Standard certification** | +10 each | AWS Certified, Google cert, Coursera, company training, organizations |
| **Professional license** | +20 each | RN (nurse), CPA (accountant), PE (engineer), regulated professions |

### 5. Projects, Portfolio & Research

Each dedicated entry added in the Projects & Portfolio section. This covers:
- Side projects, personal builds, hackathon projects
- Portfolio work (design portfolios, code samples)
- Research publications, papers, thesis work
- Open source contributions

| Type | Points |
|---|---|
| Each project/portfolio/research entry using the skill | +10 per entry |
| Public URL included (GitHub, portfolio site, paper link) | Already covered by `has_url` factor (+10) |

### 6. Context Diversity

| Measure | Bonus |
|---|---|
| Each additional organization beyond the first | +5 per org |
| Cross-industry use (same skill in different industries) | Implicitly captured via org count |

### 7. Peer Recognition (future — Group B)

Verification and endorsement from other users.

- Direct endorsements from colleagues/managers: +10 per endorsement
- 360-review feedback

*Requires new infrastructure — proposed for future phase.*

---

## Evaluation Lifecycle

### Triggers

| Trigger | Behavior |
|---|---|
| **User clicks "Evaluate"** | Full fresh evaluation (deletes old, inserts new) |
| **Profile updated** | No auto-trigger — user decides when to re-evaluate |
| **Evaluation expired (3 months)** | Banner reminder on AI Evaluation page |
| **User applies to a job** | If evaluation >3 months old → auto-trigger re-evaluation before application submits |

### Expiry Rules

- Evaluation is valid for **3 months** from `created_at`
- Expired evaluations are flagged in the database but **not deleted**
- Expired evaluations still count for match/ranking calculations (browsing)
- Only blocked at the application submission point

### History & Growth

- All evaluations are stored permanently (the `DELETE` before insert is removed — instead, insert new with a "current" flag)
- The `ai_evaluations` table keeps a `is_current BOOLEAN` column
- Users can view their Count over time: "3 months ago: 1,450 → today: 2,022"
- Historical evaluations serve as reference for the LLM — the prompt can include "Your previous evaluation showed X. Here's what changed since then."

### Database Change

```sql
ALTER TABLE ai_evaluations ADD COLUMN is_current BOOLEAN NOT NULL DEFAULT true;
CREATE INDEX IF NOT EXISTS ai_evaluations_current_profile ON ai_evaluations(profile_id, is_current)
  WHERE is_current = true;
```

Instead of deleting old evaluations, new evaluations set `is_current = false` on old rows and `is_current = true` on the new row in a transaction.

---

## Category Taxonomy

Skill categories serve two purposes:
1. **Matching signal** — Jobs weight categories differently. A "Backend Engineer" role weighs "Software Engineering" high and "Sales & Marketing" low.
2. **Industry-agnostic organization** — Categories are universal across all professions.

### The 27 Categories

| # | Category | What it covers | Example skills |
|---|---|---|---|
| 1 | **Software Engineering** | Coding, web/mobile dev, architecture, testing | React, Go, Python, REST APIs, Git |
| 2 | **Data & Analytics** | Data science, ML, BI, statistics, data engineering | SQL, Python, Machine Learning, Tableau |
| 3 | **Infrastructure & IT** | Cloud, DevOps, networking, sysadmin, IT support | AWS, Docker, Linux, Network Security |
| 4 | **Cybersecurity** | Security testing, compliance, incident response | Penetration Testing, SOC, Risk Assessment |
| 5 | **Engineering (Hardware)** | Mechanical, electrical, civil, industrial | CAD, PLC, Structural Analysis |
| 6 | **Clinical & Medical** | Healthcare, nursing, diagnosis, patient care | Wound Care, Triage, Phlebotomy |
| 7 | **Research & Science** | Lab work, methodology, experiments, clinical trials | Lab Techniques, PCR, Data Collection |
| 8 | **Finance & Accounting** | Accounting, audit, tax, financial analysis | Financial Modeling, GAAP, Bookkeeping |
| 9 | **Sales & Marketing** | Revenue, growth, digital marketing, branding | SEO, Cold Outreach, Salesforce, CRM |
| 10 | **Education & Training** | Teaching, curriculum, mentoring, instructional design | Lesson Planning, Assessment Design |
| 11 | **Management & Leadership** | Team leadership, project management, strategy | Agile, Stakeholder Management, OKRs |
| 12 | **HR & People** | Recruiting, payroll, employee relations | Interviewing, Compensation, Onboarding |
| 13 | **Legal & Compliance** | Law, regulation, contracts, governance | Contract Drafting, GDPR, IP Law |
| 14 | **Design & Creative** | UI/UX, visual design, video, animation, motion | Figma, Photoshop, Illustration |
| 15 | **Media & Content** | Writing, journalism, content strategy, PR | Copywriting, SEO Content, Public Speaking |
| 16 | **Customer Service & Support** | Client support, help desk, account management | Ticketing, SLA Management |
| 17 | **Operations & Logistics** | Supply chain, procurement, scheduling, inventory | SAP, Lean, Six Sigma |
| 18 | **Construction & Trades** | Building, electrical, plumbing, carpentry | Blueprint Reading, Welding, OSHA |
| 19 | **Manufacturing & Production** | Assembly, quality control, machining, factory ops | CNC, Quality Assurance, Lean |
| 20 | **Hospitality & Tourism** | Food service, hotel, travel, events, culinary | Event Planning, Hotel Management |
| 21 | **Social Services & Nonprofit** | Counseling, community outreach, fundraising | Case Management, Grant Writing |
| 22 | **Sports & Fitness** | Training, coaching, physical therapy, athletics | Personal Training, Nutrition, CPR |
| 23 | **Agriculture & Environment** | Farming, forestry, fishing, environmental science | Crop Management, Conservation, Irrigation |
| 24 | **Real Estate & Property** | Sales, appraisal, property management, leasing | Market Analysis, Title Search, Leasing |
| 25 | **Government & Public Policy** | Public admin, policy, urban planning, diplomacy | Policy Analysis, Grant Admin, Legislation |
| 26 | **Beauty & Wellness** | Hair, skincare, spa, massage, aesthetics | Hair Styling, Esthetics, Massage Therapy |
| 27 | **Religious & Spiritual** | Clergy, chaplaincy, pastoral care, theology | Pastoral Counseling, Liturgy, Chaplaincy |

### How Categories Feed Into Matching

Each job posting stores a **category weight profile** alongside `required_skills`:

```json
{
  "required_skills": ["Go", "PostgreSQL", "Docker"],
  "category_weights": {
    "Software Engineering": 10,
    "Data & Analytics": 5,
    "Infrastructure & IT": 7,
    "Management & Leadership": 2,
    "Communication": 1
  }
}
```

The match score for a candidate against a job:

```
matchScore = Σ(skillCount × categoryWeight)
             for each skill where category matches
```

Category weights are 0–10 per job posting:
- **10** = Core requirement
- **5–7** = Highly relevant
- **2–4** = Nice to have
- **1** = Background signal
- **0** = Irrelevant

This ensures a Nurse with 5,000 total Count won't match a Software Engineering job unless they have skills in relevant categories.

---

## Data Flow

```
Frontend                        Backend
─────────                       ──────
1. User clicks "Evaluate"
       │
       ▼
2. POST /evaluate/me ─────────► Handler receives request
                                  │
                                  ▼
                               Service.Evaluate()
                                  │
                                  ├─ loadFullProfile(profileID)
                                  │     ├─ User name, headline, about
                                  │     ├─ Jobseeker profile data
                                  │     ├─ ALL experiences (employment, gig,
                                  │     │  education, certification, project,
                                  │     │  volunteering)
                                  │     └─ All unique skills extracted
                                  │
                                  ▼
                               Build LLM prompt with explicit scoring
                               instructions (12 factors above)
                                  │
                                  ▼
3. ───────────────────────────► LLM returns structured facts per skill
                                   │
                                   ▼
                                Compute per-skill Count = point table formula
                                Compute totalCount = Σ(skillCounts) + breadthBonus
                                   │
                                   ▼
                                Store in ai_evaluations table:
                                - overall_score (computed totalCount)
                                - strengths, weaknesses, suggestions (LLM)
                                - rawAnalysis (prompt + response)
                                  │
                                  ▼
4. ◄─────────────────────────── Return EvaluationResponse to frontend
```

---

## LLM Prompt Design (to be refined during brainstorm #2)

The system prompt will tell the LLM:

```
You are a career assessment data extractor. For each skill found in the profile, 
extract the following structured facts. Do NOT calculate scores — just extract facts.

For EACH skill, extract:
1. totalYears — Total calendar years the skill was actively used. If multiple roles 
   overlapped in time, do NOT double-count — use the actual calendar duration.
2. numRoles — Number of distinct roles/experiences that mention this skill
3. roleWeight — Highest role weight bucket across all roles:
   - "entry": Junior/Intern/Associate titles, basic or routine tasks, IC scope
   - "skilled": Mid-level, independent work, moderate complexity
   - "senior": Senior/Lead/Supervisor/Head, complex non-routine work, leads others
   - "expert": Manager/Director/VP/C-level, org-wide/strategic impact
4. educationLevel — Highest education level studied for this skill:
   - "none", "hs" (high school), "diploma", "bachelor", "master", "phd"
 5. numCertifications — Count of standard certification entries matching this skill (third-party, company, org)
 6. numLicenses — Count of professional license entries matching this skill (RN, CPA, PE, etc.)
7. numProjects — Number of project/portfolio entries using this skill
8. numOrganizations — Number of distinct organizations where this skill was used
9. hasUrl — Does any experience entry have a URL showing work with this skill?

Also generate:
- strengths (array of {skill: string, score: int, note: string})
- weaknesses (array of {skill: string, score: int, note: string})  
- suggestions (array of {area: string, tip: string})

Do NOT return an overallScore or skillScores array. This is fact extraction only.
Return ONLY valid JSON.
```

The user prompt will include ALL experience data:
- Headline, about, years of experience
- Employment entries (title, org, dates, description, industry, skills used, url)
- Education entries
- Certification entries
- Project entries
- Volunteering entries
- Gig entries

---

## Implementation Plan (Outline)

### Phase 1 — Scoring Framework & Point Table ✅
- Universal Count/scoring factors, point table, Role Weight, Education split, formula
- Redesign LLM prompt to extract structured facts instead of guessing scores
- Compute Count server-side

### Phase 2 — LLM Prompt Quality
- Build test harness with profiles across industries
- Test extraction accuracy and cross-run stability
- Refine classification rules for ambiguous titles
- Automated tests with MockLLMClient

### Phase 3 — UI: Dedicated Profile Sections
The current single "Add Experience" form hides all 6 types in a dropdown. Replace with **dedicated visual sections** so users can easily input every type of achievement:

| Section | Type | Fields |
|---|---|---|
| **Work History** | employment, gig | Title, Organization, Dates, Description, Industry, Skills, URL |
| **Education** | education | Degree, Institution, Field, Dates, Skills studied, GPA (optional) |
| **Certifications & Licenses** | certification | Name, Issuer, Credential ID, Issue/Expiry Date, URL to verify |
| **Projects & Portfolio** | project | Title, Description, URL (GitHub/portfolio link), Skills used, Dates |
| **Volunteering** | volunteering | Role, Organization, Description, Dates, Skills used, URL |
| **Research & Publications** | (could be education or project type) | Title, Publisher/Venue, URL, Description |

Each section has its own "Add" button, its own card design, and is pre-configured for that type. The backend already stores all these as `job_experiences` with the `type` discriminator — this is purely a frontend change.

### Phase 4 — Evaluation Lifecycle
- 3-month expiry
- Banner reminders on AI Evaluation page
- Auto-trigger re-evaluation on job application
- Database change: `is_current` flag instead of DELETE
- Keep all evaluation history

### Phase 5 — Category Taxonomy for Matching
- Store category weights per job posting
- Implement category-weighted match scoring
- Backfill categories for existing skills

### Phase 6 — History UI
- Show Count growth timeline on profile/evaluation page
- Show previous evaluations as reference

### Phase 7 — Social Features (future)
- Skill endorsements table + feature
- GitHub integration for project verification
- Peer verification workflow
- Skill endorsements table + feature
- GitHub integration for project verification
- Peer verification workflow

---

## Open Questions (To Be Resolved)

1. **Point table balance** — Values like +10/year, +15/role, +30/edu seem reasonable but should be tuned against real profile data once implemented.
2. **Education per-skill granularity** — Does the LLM correctly identify which skills were studied in a degree vs learned on the job? Needs testing.
3. **Role weight classification consistency** — The ambiguous title reference table covers many cases but should be validated with real profiles across industries.
4. **Prompt stability testing** — Same profile evaluated 3× should produce near-identical extracted facts. Need to build a test harness for this.
5. **Weakness handling** — Under Plunderer philosophy, nothing subtracts. Weaknesses should be presented as growth opportunities, not score deductions.
6. **Skill normalization** — "React" vs "React.js" vs "React Native" — should these be treated as the same skill or different skills? Needs a skill normalization strategy.
7. **Display** — Raw Count displayed in UI (e.g., "1,450 Count"). No scaling or percentage conversion.

---

## Appendix: Existing Data Schema

```sql
job_experiences {
    id            UUID PRIMARY KEY
    profile_id    UUID → jobseeker_profiles
    type          experience_type  -- 'employment'|'gig'|'education'|'certification'|'project'|'volunteering'
    title         TEXT
    organization  TEXT
    start_date    TEXT
    end_date      TEXT
    is_current    BOOLEAN
    description   TEXT
    industry      TEXT
    skills_used   TEXT[]
    url           TEXT
}

ai_evaluations {
    id            UUID PRIMARY KEY
    profile_id    UUID → jobseeker_profiles
    overall_score INTEGER
    strengths     JSONB
    weaknesses    JSONB
    suggestions   JSONB
    skill_scores  JSONB
    raw_analysis  TEXT
    created_at    TIMESTAMPTZ
}

experience_type = ENUM('employment', 'gig', 'education', 'certification', 'project', 'volunteering')
```
