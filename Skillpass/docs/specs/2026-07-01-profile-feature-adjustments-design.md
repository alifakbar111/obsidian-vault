# Profile & Feature Adjustments — Design Spec

**Date:** 2026-07-01
**Author:** Agent Manager (orchestrated)

## Overview

Eleven feature adjustments across the SkillPass jobseeker profile, applications, and related flows. Each is independently scoped; order reflects implementation sequence.

---

## 1. AI Profile Evaluation on Profile Page

**Problem:** AI Evaluation results are only available on the separate `/jobseeker/evaluation` page. Users who visit their profile see no evaluation data.

**Solution:** Add a dedicated "AI Evaluation" card to the JobseekerProfile page with a prominent button, positioned after the Experience section (bottom of the page). This is its own section, separate from the onboarding checklist.

**Implementation:**
- Add a `card bg-base-200 p-6` section titled "AI Evaluation"
- Import `getLatestEvaluation()` and `triggerEvaluation()` from `@/lib/evaluation`
- Fetch evaluation data via `useQuery(['evaluation', 'latest'], getLatestEvaluation)`
- **Default state (no evaluation exists):** Show a clear, centered prompt:
  - Text: "Get your skills evaluated by AI to unlock personalized job matches."
  - A prominent `btn btn-primary` button labeled "Run AI Evaluation"
  - On click: calls `triggerEvaluation()`, shows loading spinner during processing
- **Evaluation exists:** Show results inline:
  - `EvaluationScoreBadge` for overall score
  - Strengths list with check icons
  - Weaknesses list with improvement tips
  - Suggestions list
  - `SkillScoresChart` (grouped by category)
  - A subtle "Refresh Evaluation" link at the bottom
- Reuse components from `web/src/pages/jobseeker/EvaluationPage/` — extract shared components into `web/src/components/jobseeker/` if needed
- The standalone `/jobseeker/evaluation` page remains unchanged

**Files:**
- `web/src/pages/JobseekerProfile/index.tsx` — add evaluation section
- `web/src/lib/evaluation.ts` — already has needed functions
- `web/src/components/jobseeker/EvaluationScoreBadge.tsx` — reuse
- `web/src/components/jobseeker/SkillScoresChart.tsx` — reuse

---

## 2. Edit Experience

**Problem:** Users can create and delete experiences, but cannot edit them. Backend `PUT /profiles/me/experience/:id` already exists.

**Solution:** Add edit mode to the experience form. Each experience card gets an "Edit" button. Clicking it populates the form, switches submit to PUT.

**Implementation:**
- Add `editingId: string | null` state to track which experience is being edited
- Add Pencil icon button to each experience card
- On "Edit" click: set `editingId`, populate form via `expForm.reset(experienceData)`, scroll form into view
- The submit handler checks `editingId`: if set, call `PUT /profiles/me/experience/:editingId`; otherwise, `POST /profiles/me/experience`
- Add `updateExperienceMutation` using `useMutation`
- On success: reset form, clear `editingId`, invalidate profile
- Cancel button in edit mode resets form to defaults and clears `editingId`

**Files:**
- `web/src/pages/JobseekerProfile/index.tsx` — add editing state, mutation, edit button
- `web/src/lib/api-types.ts` — ensure `Experience` type exists (already does)

---

## 3. Expand Experience for Details

**Problem:** Experience cards show only title, organization, and dates. Full description, skills, URL, and industry are hidden.

**Solution:** Each experience card becomes a DaisyUI `collapse` element. A downward arrow icon (DaisyUI's built-in `collapse-arrow` class) indicates the card can be expanded.

**Implementation:**
- Wrap each experience card in `<details className="collapse collapse-arrow bg-base-100 rounded-box">`
  - The `collapse-arrow` class adds a CSS arrow that rotates on open/close
- Summary (`<summary>`): title, organization, date range (same as current compact view), plus edit/delete buttons
- Expanded content: description, skills used (displayed as `badge` pills), evidence URL (as external link), industry badge
- Use `aria-expanded` for accessibility
- Animated open/close via DaisyUI collapse transition (no custom CSS)

**Files:**
- `web/src/pages/JobseekerProfile/index.tsx` — transform experience list items

---

## 4. Drag & Drop Sort Experience

**Problem:** Experiences are ordered by start_date ASC. Users cannot control the display order.

**Solution:** Add `sort_order` column and a reorder endpoint. Frontend uses drag-and-drop.

**Backend:**
- New migration `000018_add_sort_order.sql`:
  ```sql
  ALTER TABLE job_experiences ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;
  CREATE INDEX idx_job_experiences_sort ON job_experiences(profile_id, sort_order);
  ```
- New endpoint `PUT /profiles/me/experience/reorder`:
  - Accepts `{ experiences: [{ id: string, sortOrder: number }] }`
  - Updates each experience's `sort_order` under the user's profile in a transaction
- Modify `GetMyProfile` to `ORDER BY gen.JobExperiences.SortOrder.ASC(), gen.JobExperiences.StartDate.DESC()`
- Generate go-jet types via `bun run db:generate`

**Frontend:**
- Install `@dnd-kit/core` and `@dnd-kit/sortable`
- Wrap experience list in `<DndContext>` + `<SortableContext>`
- Each experience card becomes a `<SortableItem>` with a drag handle (≡ icon)
- **Reorder fires once on `onDragEnd` only** — the endpoint is NOT called during drag (no intermediate saves). After the user drops the item in its new position:
  1. Compute the new sort order from the reordered array
  2. Update local state optimistically (instant UI feedback)
  3. Fire `PUT /profiles/me/experience/reorder` with the final ordered list
  4. On error: roll back to the previous order and show an error toast

**Files:**
- `server-go/migrations/000018_add_sort_order.sql` — new migration
- `server-go/internal/handlers/profiles.go` — add `ReorderExperience` handler, register route
- `server-go/cmd/server/main.go` — register new route
- `web/src/pages/JobseekerProfile/index.tsx` — add DnD
- `package.json` — add `@dnd-kit/core`, `@dnd-kit/sortable`

---

## 5. Save Profile Button on Change

**Problem:** The "Save Profile" button is always visible, even when no changes have been made.

**Solution:** Show the button only when the profile form has been modified, using `react-hook-form`'s `formState.isDirty`.

**Implementation:**
- Track `profileForm.formState.isDirty`
- Conditionally render the save button wrapper:
  - When `isDirty` is false: show "Profile saved" static indicator (checkmark + "No unsaved changes")
  - When `isDirty` is true: show "Save Profile" button with a yellow "unsaved" indicator dot
- After save success, call `profileForm.reset(profileForm.getValues())` to reset dirty state

**Files:**
- `web/src/pages/JobseekerProfile/index.tsx` — conditional rendering

---

## 6. Skills Table + Autocomplete Reuse

**Problem:** Skills are stored as free-text arrays in `job_experiences.skills_used`. They can't be reused, autocompleted, or queried globally.

**Why not reuse the existing `tags` table?**
The database already has a `tags` table (`id`, `name`, `industry_category_id`), but it serves a different purpose:

| Dimension | `tags` (existing) | `skills` (proposed) |
|---|---|---|
| **Purpose** | Industry-specific job categorization | Individual proficiency names for candidates |
| **Linked to** | `industry_categories` (broad sector) | Standalone — cross-industry |
| **Used in** | `job_postings.tags` for filtering | `job_experiences.skills_used`, AI evaluation, matching |
| **Granularity** | Broad labels (e.g., "remote", "full-time", "healthcare") | Specific technologies (e.g., "React", "TypeScript", "Go") |
| **Source** | Pre-seeded per industry category | Crowdsourced from user experiences + seed |

A separate `skills` table avoids conflating job categorization tags with candidate skill proficiency tracking.

**Solution:** New `skills` table. When saving experiences, upsert skills into it. Frontend adds autocomplete.

**Backend — Migration `000019_create_skills_table.sql`:**
```sql
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_skills_name ON skills(name);
```

**Backend — New handler `server-go/internal/handlers/skills.go`:**
- `SearchSkills` — `GET /skills?q=<prefix>` — returns matching skills (ILIKE query, limit 20)
- Register route in `main.go`: `profileGroup.GET("/skills", handler.SearchSkills)`
- Modify `CreateExperience` and `UpdateExperience` to upsert `skillsUsed` into the `skills` table (best-effort, not blocking the experience save)

**Frontend:**
- Replace the plain `<FormInput>` for skills with a combobox:
  - On input change (debounced 300ms), fetch `GET /skills?q=<value>`
  - Show dropdown of matching existing skills
  - User can click a suggestion or type a new skill (free text)
  - Selected/added skills shown as badges below the input (removable)
- When submitting, convert badges → `skillsUsed` string array (same as before)
- New lib function: `searchSkills(q: string): Promise<{id: string, name: string}[]>`

**Files:**
- `server-go/migrations/000019_create_skills_table.sql`
- `server-go/internal/handlers/skills.go`
- `server-go/cmd/server/main.go` — register route
- `web/src/lib/skills.ts` — searchSkills function
- `web/src/pages/JobseekerProfile/index.tsx` — replace skills input with autocomplete
- `web/src/components/ui/SkillsAutocomplete.tsx` — new combobox component

---

## 7. Seeder for Skills

**Problem:** The skills table needs initial data for autocomplete to be useful.

**Solution:** Add skills seeder to the seed command.

**Implementation (in `server-go/cmd/seed/main.go` or a new seed file):**

Skills should cover multiple industries so autocomplete works for all jobseeker profiles, not just tech:

```
Technology:        Go, TypeScript, JavaScript, Python, Java, Rust, React, Vue.js, Angular,
                   Node.js, Express, PostgreSQL, MySQL, Docker, Kubernetes, AWS, Git, CI/CD,
                   GraphQL, REST API, Linux, OAuth, Microservices, WebSockets, Performance Optimization

Healthcare:        Patient Care, Medical Records, HIPAA Compliance, Clinical Research, EHR Systems,
                   Medical Coding, Phlebotomy, Vital Signs Monitoring, Infection Control, Radiology,
                   Pharmacology, Patient Assessment, Care Coordination, ICD-10, Telemedicine

Finance/Accounting: Financial Analysis, Budgeting, Forecasting, QuickBooks, Tax Preparation, Auditing,
                    Risk Management, GAAP, Financial Reporting, Payroll, Internal Controls, ERP Systems,
                    Accounts Payable, Accounts Receivable, Reconciliation

Marketing/Sales:   SEO, Content Marketing, Social Media, Google Analytics, CRM, Sales Strategy,
                  Lead Generation, Email Marketing, PPC Advertising, Brand Management, Market Research,
                  Copywriting, HubSpot, Salesforce, Public Relations

Manufacturing/Eng: Lean Manufacturing, Six Sigma, CAD, SolidWorks, Supply Chain, PLC Programming,
                   Quality Assurance, Process Improvement, CNC Operation, Project Engineering,
                   OSHA Compliance, Inventory Management, AutoCAD, Root Cause Analysis

Creative/Design:   Adobe Photoshop, Adobe Illustrator, Adobe InDesign, Figma, Sketch, Photography,
                   Videography, Motion Graphics, Typography, Brand Identity, Print Production, UX Research,
                   Wireframing, Prototyping, Storyboarding

Education:         Curriculum Development, Classroom Management, Lesson Planning, Student Assessment,
                   Educational Technology, Special Education, ESL Instruction, Online Teaching,
                   Learning Management Systems, Academic Advising, Early Childhood Education, Grant Writing

Legal:             Legal Research, Contract Review, Case Management, Litigation Support, Legal Writing,
                   Discovery, Compliance, Intellectual Property, Corporate Law, Due Diligence,
                   Regulatory Affairs, Mediation, Arbitration

Hospitality:       Customer Service, Event Planning, Food Safety, Front Desk Operations, Housekeeping,
                   Reservation Systems, Banquet Management, Menu Planning, POS Systems, Concierge,
                   Travel Coordination, Multilingual Support

General Business:  Project Management, Agile, Scrum, Leadership, Strategic Planning, Data Analysis,
                   Communication, Negotiation, Problem Solving, Team Building, Time Management,
                   Microsoft Excel, Microsoft PowerPoint, Microsoft Word, Public Speaking
```

Upsert each into the `skills` table during the seed run using `INSERT ... ON CONFLICT DO NOTHING`.

**Files:**
- `server-go/cmd/seed/main.go` — add skills seeder

---

## 8. No Jobs Menu on Navbar

**Status: ✅ Already satisfied.**

Jobseeker navbar (lines 53-64 of `Navbar.tsx`) already contains only My Profile, Matches, and Applications. The `/jobs` and `/jobs/:id` routes are public/unauthenticated. No change needed.

---

## 9. Jobs Menu on My Applications Page

**Problem:** From the Applications page, users cannot browse or search for new jobs to apply to — they must navigate to `/jobs` (public) or `/jobseeker/matches`.

**Solution:** Add a "Browse Jobs" section to the top of the Applications page.

**Implementation:**
- Add a collapsible "Browse Open Jobs" section above the stats grid
- Contains a search input and a limited results list (top 5 matching jobs)
- Each result shows: title, company, location, salary range, "Apply" button
- "Apply" button navigates to `/jobs/:id` (detailed apply page)
- A "View all jobs →" link at the bottom goes to `/jobs`
- Uses existing `GET /jobs?q=...` endpoint (or `GET /jobs/matches` for personalized)

**Files:**
- `web/src/pages/jobseeker/ApplicationsPage/index.tsx` — add job search section
- `web/src/lib/matching.ts` — already has `getJobMatches()` and `SkillsGap` types

---

## 10. Date Picker Format

**Problem:** Start/end date inputs are text fields with `placeholder="2020-01"`. Users can enter invalid formats.

**Solution:** Use native `<input type="month">` which renders a browser-native month/year picker. Produces `YYYY-MM` format natively.

**Implementation:**
- Replace `<FormInput label="Start Date" name="startDate" placeholder="2020-01">` with `<FormInput label="Start Date" name="startDate" type="month">`
- Same for End Date
- Update Zod schema in `schemas/index.ts` to validate `YYYY-MM` format via regex (optional: the browser enforces it)
- Server-side validation already checks `YYYY-MM` via regex in Go handler

**Note:** `<input type="month">` output format is `YYYY-MM` — exactly what the API expects. No transformation needed.

**Files:**
- `web/src/pages/JobseekerProfile/index.tsx` — change input types
- `web/src/lib/schemas/index.ts` — add regex validation for date format

---

## 11. Auto-Update Applications Count After Apply

**Problem:** After clicking "Apply Now" on a job, navigating to the Applications page shows stale data. The total application count and kanban don't refresh until manual page reload.

**Solution:** Invalidate related query caches on successful application.

**Implementation:**
- In `JobDetail/index.tsx`, add to `applyMutation.onSuccess`:
  ```typescript
  queryClient.invalidateQueries({ queryKey: ['jobseeker', 'analytics'] });
  queryClient.invalidateQueries({ queryKey: ['applications', 'me'] });
  ```
- This triggers background refetch of the stats and kanban data when the user navigates to the Applications page

**Files:**
- `web/src/pages/JobDetail/index.tsx` — add `queryClient.invalidateQueries` in mutation's `onSuccess`

---

## 12. Job Requirements Field (Company Jobs)

**Problem:** The job posting form has only a "Job Description" field. Companies cannot specify separate job requirements (e.g., "5+ years of React", "Bachelor's degree required"), making postings unclear for applicants.

**Solution:** Add a distinct "Job Requirements" field alongside "Job Description" on the job form and display it on job cards and detail pages.

**Database — Migration `000020_add_job_requirements.sql`:**
```sql
ALTER TABLE job_postings ADD COLUMN requirements TEXT;
```

**Backend:**
- Add `Requirements *string` field to `CreateJobRequest`, `UpdateJobRequest`, `JobResponse` structs in `server-go/internal/handlers/jobs.go`
- Pass `req.Requirements` in the INSERT and UPDATE statements
- Add to `jobFromModel()` mapping
- Regenerate OpenAPI spec

**Frontend — Company Jobs form (`web/src/pages/CompanyJobs/index.tsx`):**
- Add a `<FormTextarea label="Job Requirements" name="requirements" rows={3} />` after the Description field
- Include `requirements: ''` in form default values and `job.requirements ?? ''` in edit form reset

**Frontend — Job Schema (`web/src/lib/schemas/job.ts`):**
- Add `requirements: z.string().optional()` to `JobSchema`

**Frontend — Job Detail page (`web/src/pages/JobDetail/index.tsx`):**
- Display requirements in a distinct section below description with a "Requirements" heading

**Frontend — Job form schema (`web/src/lib/schemas/index.ts`):**
- Add `requirements: z.string().optional()` to `jobSchema`

**Files:**
- `server-go/migrations/000020_add_job_requirements.sql`
- `server-go/internal/handlers/jobs.go`
- `web/src/pages/CompanyJobs/index.tsx`
- `web/src/pages/JobDetail/index.tsx`
- `web/src/lib/schemas/index.ts`
- `web/src/lib/schemas/job.ts`

---

## 13. Years of Experience Instead of Experience Level

**Problem:** The job form has an abstract "Experience Level" dropdown (Entry/Mid/Senior/Lead) that doesn't convey concrete year requirements. Companies need to specify actual years of experience.

**Solution:** Replace the dropdown with Min/Max years of experience number inputs. Keep the existing `experience_level` column in the DB (for backward compatibility with existing postings and filtering).

**Database — Migration `000021_add_years_experience.sql`:**
```sql
ALTER TABLE job_postings ADD COLUMN years_experience_min INTEGER;
ALTER TABLE job_postings ADD COLUMN years_experience_max INTEGER;
```
The existing `experience_level` enum column stays — existing job postings retain their level. New postings will use years of experience fields instead.

**Backend — Request/Response structs:**
- Add `YearsExperienceMin *int` and `YearsExperienceMax *int` to `CreateJobRequest`, `UpdateJobRequest`, `JobResponse` in `server-go/internal/handlers/jobs.go`
- Add to `jobFromModel()` mapping
- Pass in INSERT and UPDATE
- Keep `ExperienceLevel` field on request/response for backward compatibility with existing postings

**Frontend — Company Jobs form (`web/src/pages/CompanyJobs/index.tsx`):**
- Replace `<FormSelect label="Experience Level" name="experienceLevel" options={EXPERIENCE_LEVEL_OPTIONS} />` with:
  ```tsx
  <div className="grid grid-cols-2 gap-2">
    <FormNumberInput label="Min Years Experience" name="yearsExperienceMin" min={0} max={50} />
    <FormNumberInput label="Max Years Experience" name="yearsExperienceMax" min={0} max={50} />
  </div>
  ```
- Update `parseFormData()` to pass the new fields
- Update form defaults and edit reset

**Frontend — Job form schema (`web/src/lib/schemas/index.ts`):**
- Add to `jobSchema`:
  ```ts
  yearsExperienceMin: z.number().min(0).optional(),
  yearsExperienceMax: z.number().min(0).optional(),
  ```

**Frontend — Display:**
- **CompanyJobs card:** Show "X-Y years" or "X+ years" badge instead of experienceLevel
- **JobDetail page:** Show years range in the metadata section

**Files:**
- `server-go/migrations/000021_add_years_experience.sql`
- `server-go/internal/handlers/jobs.go`
- `web/src/pages/CompanyJobs/index.tsx`
- `web/src/pages/JobDetail/index.tsx`
- `web/src/lib/schemas/index.ts`
- `web/src/lib/constants.ts` — optionally clean up EXPERIENCE_LEVEL_OPTIONS

---

## Implementation Order

| Step | Item | Dependency | Agent |
|------|------|-----------|-------|
| 0 | Quick check item 8 (already done) | None | — |
| 1 | DB migration: sort_order column (item 4) | None | db-migration |
| 2 | DB migration: skills table (item 6) | None | db-migration |
| 3 | Seeder for skills (item 7) | Step 2 | go-scaffolder |
| 4 | Backend: reorder endpoint (item 4) | Step 1 | go-scaffolder |
| 5 | Backend: skills search endpoint (item 6) | Step 2 | go-scaffolder |
| 6 | Backend: upsert skills on experience save (item 6) | Step 2 | go-scaffolder |
| 7 | Frontend: date picker + schema (item 10) | None | react-scaffolder |
| 8 | Frontend: Save Profile dirty tracking (item 5) | None | react-scaffolder |
| 9 | Frontend: Edit Experience (item 2) | None | react-scaffolder |
| 10 | Frontend: Expand Experience details (item 3) | None | react-scaffolder |
| 11 | Frontend: AI Evaluation on profile (item 1) | None | react-scaffolder |
| 12 | Frontend: DnD sort Experience (item 4) | Steps 1, 4 | react-scaffolder |
| 13 | Frontend: Skills autocomplete component (item 6) | Steps 2, 5 | react-scaffolder |
| 14 | Frontend: Jobs browsing on Applications (item 9) | None | react-scaffolder |
| 15 | Frontend: Auto-refresh after apply (item 11) | None | react-scaffolder |
| 16 | Run `bun run api:generate` | All backend | test-runner |
| 17 | Run tests & verify | All above | test-runner |

Items 7, 10, 5, 2, 3, 1, 9, 11 are independent frontend changes that can be parallelized.
Items 1, 4, 6 depend on their respective backend steps.
