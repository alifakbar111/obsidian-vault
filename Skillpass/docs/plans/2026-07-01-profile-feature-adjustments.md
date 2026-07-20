# Profile & Feature Adjustments — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Implement 10 feature adjustments across the jobseeker profile, applications, and skill management flows.

**Architecture:** Backend changes (DB migrations, Go handlers, seed data) → Frontend components (React with DaisyUI/Tailwind, react-hook-form, TanStack Query). Backend-first for DnD sort order and skills table; frontend-only for date picker, dirty tracking, edit experience, expand details, AI evaluation section, job browsing, and auto-refresh.

**Tech Stack:** Go 1.26 (Gin + go-jet), React 19 (Vite 7, Tailwind v4, DaisyUI 5), PostgreSQL, `@dnd-kit/core`, `@dnd-kit/sortable`

---

### Task 1: DB Migration — Add sort_order to job_experiences

**Files:**
- Create: `server-go/migrations/000018_add_sort_order.sql`

- [ ] **Create migration file**

```sql
-- 000018_add_sort_order.sql
ALTER TABLE job_experiences ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_job_experiences_sort ON job_experiences(profile_id, sort_order);
```

- [ ] **Run migration**

Run: `bun run db:migrate`
Expected: `Applied 000018_add_sort_order.sql`

- [ ] **Regenerate go-jet types**

Run: `bun run db:generate`
Expected: No errors, `server-go/.gen/` updated with `SortOrder` field

- [ ] **Commit**

```bash
git add server-go/migrations/000018_add_sort_order.sql server-go/.gen/
git commit -m "feat(db): add sort_order column to job_experiences"
```

---

### Task 2: DB Migration — Create skills table

**Files:**
- Create: `server-go/migrations/000019_create_skills_table.sql`

- [ ] **Create migration file**

```sql
-- 000019_create_skills_table.sql
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_skills_name ON skills(name);
```

- [ ] **Run migration**

Run: `bun run db:migrate`
Expected: `Applied 000019_create_skills_table.sql`

- [ ] **Regenerate go-jet types**

Run: `bun run db:generate`
Expected: No errors, `server-go/.gen/` includes `Skills` table types

- [ ] **Commit**

```bash
git add server-go/migrations/000019_create_skills_table.sql server-go/.gen/
git commit -m "feat(db): create skills table for autocomplete and reuse"
```

---

### Task 3: Backend — Skills seeder

**Files:**
- Modify: `server-go/cmd/seed/main.go`

- [ ] **Add skills seed data to main.go**

After the industry seeding block and before the admin user seeding, add:

```go
// Seed skills across multiple industries
skillNames := []string{
    // Technology
    "Go", "TypeScript", "JavaScript", "Python", "Java", "Rust",
    "React", "Vue.js", "Angular", "Next.js", "Node.js", "Express",
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite",
    "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Terraform",
    "Git", "CI/CD", "GraphQL", "REST API", "gRPC",
    "Tailwind CSS", "DaisyUI", "SASS", "CSS", "HTML",
    "Gin", "Echo", "FastAPI", "Django", "Flask",
    "React Native", "Flutter", "Swift", "Kotlin",
    "Machine Learning", "Data Science", "SQL", "NoSQL",
    "Linux", "Bash", "Nginx", "Apache", "RabbitMQ", "Kafka",
    "OAuth", "JWT", "SAML", "OpenID Connect", "RBAC",
    "Microservices", "Event-Driven Architecture", "DDD", "CQRS",
    "Elasticsearch", "Prometheus", "Grafana", "Datadog",
    "WebSockets", "Server-Sent Events", "WebRTC",
    "Accessibility", "WCAG", "a11y", "Performance Optimization",
    "Figma", "Sketch", "Adobe XD", "UI Design", "UX Design",
    "Agile", "Scrum", "Project Management", "Leadership",
    "Testing", "TDD", "Cypress", "Vitest", "Jest", "Playwright",
    // Healthcare
    "Patient Care", "Medical Records", "HIPAA Compliance", "Clinical Research",
    "EHR Systems", "Medical Coding", "Phlebotomy", "Vital Signs Monitoring",
    "Infection Control", "Radiology", "Pharmacology", "Patient Assessment",
    "Care Coordination", "ICD-10", "Telemedicine", "EMR Systems",
    // Finance & Accounting
    "Financial Analysis", "Budgeting", "Forecasting", "QuickBooks",
    "Tax Preparation", "Auditing", "Risk Management", "GAAP",
    "Financial Reporting", "Payroll", "Internal Controls", "ERP Systems",
    "Accounts Payable", "Accounts Receivable", "Reconciliation", "SAP",
    // Marketing & Sales
    "SEO", "Content Marketing", "Social Media", "Google Analytics",
    "CRM", "Sales Strategy", "Lead Generation", "Email Marketing",
    "PPC Advertising", "Brand Management", "Market Research", "Copywriting",
    "HubSpot", "Salesforce", "Public Relations", "Digital Marketing",
    // Manufacturing & Engineering
    "Lean Manufacturing", "Six Sigma", "CAD", "SolidWorks",
    "Supply Chain Management", "PLC Programming", "Quality Assurance",
    "Process Improvement", "CNC Operation", "OSHA Compliance",
    "Inventory Management", "AutoCAD", "Root Cause Analysis", "Kaizen",
    // Education
    "Curriculum Development", "Classroom Management", "Lesson Planning",
    "Student Assessment", "Educational Technology", "Special Education",
    "ESL Instruction", "Online Teaching", "Learning Management Systems",
    "Academic Advising", "Early Childhood Education", "Grant Writing",
    // Legal
    "Legal Research", "Contract Review", "Case Management", "Litigation Support",
    "Legal Writing", "Discovery", "Compliance", "Intellectual Property",
    "Corporate Law", "Due Diligence", "Regulatory Affairs", "Mediation",
    // Hospitality
    "Customer Service", "Event Planning", "Food Safety", "Front Desk Operations",
    "Housekeeping Management", "Reservation Systems", "Banquet Management",
    "Menu Planning", "POS Systems", "Concierge Services", "Travel Coordination",
    // General Business
    "Strategic Planning", "Data Analysis", "Communication", "Negotiation",
    "Problem Solving", "Team Building", "Time Management",
    "Microsoft Excel", "Microsoft PowerPoint", "Microsoft Word", "Public Speaking",
    "Business Development", "Operations Management", "Vendor Management",
}

skillCount := 0
for _, name := range skillNames {
    stmt := gen.Skills.INSERT(gen.Skills.Name).VALUES(name).
        ON_CONFLICT(gen.Skills.Name).DO_NOTHING()
    _, err := stmt.ExecContext(ctx, db)
    if err != nil {
        log.Printf("  Warning: failed to insert skill %s: %v", name, err)
        continue
    }
    skillCount++
}
fmt.Printf("Seeded %d skills\n", skillCount)
```

- [ ] **Run the seeder to verify**

Run: `bun run db:seed`
Expected: Output includes "Seeded N skills" with N > 0

- [ ] **Commit**

```bash
git add server-go/cmd/seed/main.go
git commit -m "feat(db): seed skills across 10 industries"
```

---

### Task 4: Backend — Reorder experience endpoint

**Files:**
- Modify: `server-go/internal/handlers/profiles.go`
- Modify: `server-go/cmd/server/main.go`

- [ ] **Add ReorderExperience handler in profiles.go**

Add before the `CreateExperience` function:

```go
type ReorderExperienceRequest struct {
    Experiences []ReorderItem `json:"experiences" binding:"required,min=1,dive"`
} //@name ReorderExperienceRequest

type ReorderItem struct {
    ID        string `json:"id" binding:"required"`
    SortOrder int    `json:"sortOrder" binding:"required"`
} //@name ReorderItem

// ReorderExperience	godoc
// @Summary		Reorder experiences
// @Description	Update sort_order for multiple experiences at once
// @Tags		profiles
// @Accept		json
// @Produce		json
// @Security	BearerAuth
// @Param		body body ReorderExperienceRequest true "Experience IDs with new sort orders"
// @Success		200 {object} MessageResponse
// @Failure		400 {object} map[string]string
// @Failure		401 {object} map[string]string
// @Router		/profiles/me/experience/reorder [put]
func (h *ProfileHandler) ReorderExperience(c *gin.Context) {
    userIDVal, ok := c.Get("userId")
    if !ok {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }
    userIDStr, ok := userIDVal.(string)
    if !ok || userIDStr == "" {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }

    userUUID, err := lib.ParseUUID(userIDStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
        return
    }

    var req ReorderExperienceRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
        return
    }

    // Get the profile ID for the user
    profileStmt := SELECT(gen.JobseekerProfiles.ID).FROM(gen.JobseekerProfiles).
        WHERE(gen.JobseekerProfiles.UserID.EQ(UUID(userUUID)))
    var profiles []model.JobseekerProfiles
    err = profileStmt.QueryContext(c.Request.Context(), h.db, &profiles)
    if err != nil || len(profiles) == 0 {
        c.JSON(http.StatusNotFound, gin.H{"error": "Profile not found"})
        return
    }
    profileID := profiles[0].ID

    tx, err := h.db.BeginTx(c.Request.Context(), nil)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
        return
    }
    defer tx.Rollback()

    for _, item := range req.Experiences {
        expUUID, err := lib.ParseUUID(item.ID)
        if err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid experience ID: %s", item.ID)})
            return
        }
        updateStmt := gen.JobExperiences.UPDATE().
            SET(gen.JobExperiences.SortOrder.SET(Integer(int64(item.SortOrder)))).
            WHERE(
                gen.JobExperiences.ID.EQ(UUID(expUUID)).AND(
                    gen.JobExperiences.ProfileID.EQ(UUID(profileID)),
                ),
            )
        result, err := updateStmt.ExecContext(c.Request.Context(), tx)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update experience order"})
            return
        }
        ra, _ := result.RowsAffected()
        if ra == 0 {
            c.JSON(http.StatusNotFound, gin.H{"error": fmt.Sprintf("Experience %s not found", item.ID)})
            return
        }
    }

    if err := tx.Commit(); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit reorder"})
        return
    }

    c.JSON(http.StatusOK, MessageResponse{Message: "Reordered"})
}
```

- [ ] **Update GetMyProfile ORDER BY to use sort_order**

Replace the existing ORDER BY line in `getMyProfile`:
```go
// Old:
).ORDER_BY(
    gen.JobExperiences.StartDate.ASC(),

// New:
).ORDER_BY(
    gen.JobExperiences.SortOrder.ASC(),
    gen.JobExperiences.StartDate.DESC(),
)
```

- [ ] **Register the new route in main.go**

In `cmd/server/main.go`, add after the existing experience routes:
```go
profileGroup.PUT("/experience/reorder", profileHandler.ReorderExperience)
```
Place this line BEFORE the `PUT("/experience/:id"` route to avoid path collision.

- [ ] **Run `bun run api:generate`**

Expected: No errors, generated types updated

- [ ] **Commit**

```bash
git add server-go/internal/handlers/profiles.go server-go/cmd/server/main.go server-go/docs/ web/src/lib/generated/
git commit -m "feat(server): add reorder experience endpoint with sort_order"
```

---

### Task 5: Backend — Skills search endpoint

**Files:**
- Create: `server-go/internal/handlers/skills.go`
- Modify: `server-go/cmd/server/main.go`

- [ ] **Create skills handler file**

```go
package handlers

import (
    "database/sql"
    "net/http"

    "github.com/gin-gonic/gin"
    . "github.com/go-jet/jet/v2/postgres"

    "skillpass-server-go/.gen/skillpass/public/model"
    "skillpass-server-go/internal/gen"
)

type SkillResponse struct {
    ID   string `json:"id"`
    Name string `json:"name"`
} //@name SkillResponse

type SkillsHandler struct {
    db *sql.DB
}

func NewSkillsHandler(db *sql.DB) *SkillsHandler {
    return &SkillsHandler{db: db}
}

// SearchSkills	godoc
// @Summary		Search skills
// @Description	Autocomplete search for skills by name prefix
// @Tags		skills
// @Produce		json
// @Param		q query string false "Search query (prefix match)"
// @Success		200 {array} SkillResponse
// @Router		/skills [get]
func (h *SkillsHandler) SearchSkills(c *gin.Context) {
    query := c.Query("q")
    if query == "" {
        // Return most popular skills
        stmt := SELECT(
            gen.Skills.ID, gen.Skills.Name,
        ).FROM(
            gen.Skills,
        ).ORDER_BY(
            gen.Skills.Name,
        ).LIMIT(20)

        var skills []model.Skills
        err := stmt.QueryContext(c.Request.Context(), h.db, &skills)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query skills"})
            return
        }

        resp := make([]SkillResponse, len(skills))
        for i, s := range skills {
            resp[i] = SkillResponse{ID: s.ID.String(), Name: s.Name}
        }
        c.JSON(http.StatusOK, resp)
        return
    }

    stmt := SELECT(
        gen.Skills.ID, gen.Skills.Name,
    ).FROM(
        gen.Skills,
    ).WHERE(
        gen.Skills.Name.ILIKE(String("%" + query + "%")),
    ).ORDER_BY(
        gen.Skills.Name,
    ).LIMIT(20)

    var skills []model.Skills
    err := stmt.QueryContext(c.Request.Context(), h.db, &skills)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query skills"})
        return
    }

    resp := make([]SkillResponse, len(skills))
    for i, s := range skills {
        resp[i] = SkillResponse{ID: s.ID.String(), Name: s.Name}
    }
    c.JSON(http.StatusOK, resp)
}
```

- [ ] **Register skills route in main.go**

Add alongside other route registrations:
```go
skillsHandler := handlers.NewSkillsHandler(db)
apiGroup.GET("/skills", skillsHandler.SearchSkills)
```

- [ ] **Run `bun run api:generate`**

Expected: No errors

- [ ] **Commit**

```bash
git add server-go/internal/handlers/skills.go server-go/cmd/server/main.go server-go/docs/ web/src/lib/generated/
git commit -m "feat(server): add skills search endpoint for autocomplete"
```

---

### Task 6: Backend — Upsert skills on experience save

**Files:**
- Modify: `server-go/internal/handlers/profiles.go`

- [ ] **Add skill upsert helper after experience save in CreateExperience**

After the insert and before `c.JSON(201, ...)`:
```go
// Upsert skills into the skills table (best-effort, non-blocking)
if len(req.SkillsUsed) > 0 {
    for _, skill := range req.SkillsUsed {
        if skill == "" {
            continue
        }
        upsertStmt := gen.Skills.INSERT(gen.Skills.Name).VALUES(skill).
            ON_CONFLICT(gen.Skills.Name).DO_NOTHING()
        _, _ = upsertStmt.ExecContext(c.Request.Context(), h.db)
    }
}
```

- [ ] **Add same upsert in UpdateExperience**

After the update and before `c.JSON(200, ...)`:
```go
// Upsert skills for autocomplete
if req.SkillsUsed != nil {
    for _, skill := range req.SkillsUsed {
        if skill == "" {
            continue
        }
        upsertStmt := gen.Skills.INSERT(gen.Skills.Name).VALUES(skill).
            ON_CONFLICT(gen.Skills.Name).DO_NOTHING()
        _, _ = upsertStmt.ExecContext(c.Request.Context(), h.db)
    }
}
```

- [ ] **Commit**

```bash
git add server-go/internal/handlers/profiles.go
git commit -m "feat(server): upsert skills into skills table on experience save"
```

---

### Task 7: Frontend — Date picker format change

**Files:**
- Modify: `web/src/pages/JobseekerProfile/index.tsx`
- Modify: `web/src/lib/schemas/index.ts`

- [ ] **Change Start Date / End Date inputs to type="month"**

In `JobseekerProfile/index.tsx`, replace:
```tsx
<FormInput label="Start Date" name="startDate" placeholder="2020-01" />
<FormInput label="End Date" name="endDate" placeholder="2023-12" disabled={expForm.watch('isCurrent')} />
```
With:
```tsx
<FormInput label="Start Date" name="startDate" type="month" />
<FormInput label="End Date" name="endDate" type="month" disabled={expForm.watch('isCurrent')} />
```

- [ ] **Update Zod schema to validate YYYY-MM format**

In `schemas/index.ts`, update the experience schema:
```ts
export const experienceSchema = z.object({
  type: z.enum(['employment', 'gig', 'education', 'certification', 'project', 'volunteering']),
  title: z.string().min(1, 'Title is required'),
  organization: z.string().min(1, 'Organization is required'),
  startDate: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Start date must be YYYY-MM format'),
  endDate: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'End date must be YYYY-MM format').optional().or(z.literal('')),
  isCurrent: z.boolean().optional(),
  description: z.string().optional(),
  industry: z.string().optional(),
  skills: z.string().optional(),
  url: z.string().url('Invalid URL').or(z.literal('')).optional(),
});
```

- [ ] **Commit**

```bash
git add web/src/pages/JobseekerProfile/index.tsx web/src/lib/schemas/index.ts
git commit -m "feat(web): change experience date inputs to month picker with validation"
```

---

### Task 8: Frontend — Save Profile dirty tracking

**Files:**
- Modify: `web/src/pages/JobseekerProfile/index.tsx`

- [ ] **Add dirty tracking to profile form**

Replace the current save button:
```tsx
<button type="submit" className="btn btn-primary" disabled={saveProfileMutation.isPending}>
  {saveProfileMutation.isPending ? <LoadingSpinner size="sm" /> : 'Save Profile'}
</button>
```
With:
```tsx
<div className="flex items-center gap-3">
  {profileForm.formState.isDirty ? (
    <button type="submit" className="btn btn-primary" disabled={saveProfileMutation.isPending}>
      {saveProfileMutation.isPending ? <LoadingSpinner size="sm" /> : 'Save Profile'}
    </button>
  ) : (
    <span className="text-sm text-muted flex items-center gap-1">
      <CheckCircle size={14} className="text-success" /> Profile saved
    </span>
  )}
</div>
```

Also reset dirty state after save:
```go
// In saveProfileMutation.onSuccess, add:
profileForm.reset(profileForm.getValues());
```

- [ ] **Import CheckCircle icon**

Add `CheckCircle` to the lucide-react import:
```tsx
import { CheckCircle, Plus, Trash2, X, Pencil, GripVertical } from 'lucide-react';
```

- [ ] **Commit**

```bash
git add web/src/pages/JobseekerProfile/index.tsx
git commit -m "feat(web): show save button only when profile form has unsaved changes"
```

---

### Task 9: Frontend — Edit Experience

**Files:**
- Modify: `web/src/pages/JobseekerProfile/index.tsx`

- [ ] **Add editingId state and updateExperience mutation**

```tsx
const [editingId, setEditingId] = useState<string | null>(null);

const updateExperienceMutation = useMutation({
  mutationFn: ({ id, data }: { id: string; data: ExperienceForm }) => {
    const skills = data.skills
      ? data.skills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    return api<Experience>(`/profiles/me/experience/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: { ...data, skillsUsed: skills, endDate: data.isCurrent ? undefined : data.endDate || undefined, url: data.url || undefined },
    });
  },
  onMutate: () => setError(null),
  onSuccess: () => {
    invalidateProfileViews();
    setEditingId(null);
    setShowExpForm(false);
    expForm.reset({ type: 'employment', title: '', organization: '', startDate: '', endDate: '', isCurrent: false, description: '', industry: '', skills: '', url: '' });
  },
  onError: (err) => {
    setError(err instanceof ApiError ? (err.serverMessage ?? err.message) : 'Failed to update experience');
  },
});
```

- [ ] **Add Edit button to each experience card**

After the delete button in each experience card, add:
```tsx
<button
  type="button"
  className="btn btn-ghost btn-xs"
  onClick={() => {
    setEditingId(exp.id ?? null);
    expForm.reset({
      type: exp.type as ExperienceForm['type'],
      title: exp.title,
      organization: exp.organization,
      startDate: exp.startDate,
      endDate: exp.endDate ?? '',
      isCurrent: exp.isCurrent ?? false,
      description: exp.description ?? '',
      industry: exp.industry ?? '',
      skills: (exp.skillsUsed ?? []).join(', '),
      url: exp.url ?? '',
    });
    setShowExpForm(true);
  }}
  aria-label={`Edit ${exp.title}`}
>
  <Pencil size={16} aria-hidden="true" />
</button>
```

- [ ] **Update form submit handler to use PUT when editing**

Modify the `addExperience` handler (or create a combined submit):
```tsx
const submitExperience = (data: ExperienceForm) => {
  if (editingId) {
    updateExperienceMutation.mutate({ id: editingId, data });
  } else {
    addExperienceMutation.mutate(data);
  }
};
```
Then use `onSubmit={submitExperience}` and update the submit button text:
```tsx
<button type="submit" className="btn btn-primary btn-sm">
  {editingId ? 'Update Experience' : 'Add Experience'}
</button>
```
Update the cancel button to also clear editingId:
```tsx
<button type="button" className="btn btn-ghost btn-sm" onClick={() => {
  setShowExpForm(false);
  setEditingId(null);
  expForm.reset({ type: 'employment', title: '', organization: '', startDate: '', endDate: '', isCurrent: false, description: '', industry: '', skills: '', url: '' });
}}>
  Cancel
</button>
```

- [ ] **Commit**

```bash
git add web/src/pages/JobseekerProfile/index.tsx
git commit -m "feat(web): add edit experience with PUT endpoint"
```

---

### Task 10: Frontend — Expand Experience details with collapse

**Files:**
- Modify: `web/src/pages/JobseekerProfile/index.tsx`

- [ ] **Wrap experience cards in DaisyUI collapse**

Replace the current experience card structure:
```tsx
{(profile?.experiences ?? []).map((exp) => (
  <div key={exp.id} className="p-3 bg-base-100 rounded-box flex justify-between items-start">
    <div>
      <p className="font-medium">{exp.title}</p>
      <p className="text-sm text-muted">
        {exp.organization} &middot; {exp.startDate}
        {exp.isCurrent ? ' - Present' : exp.endDate ? ` - ${exp.endDate}` : ''}
      </p>
    </div>
    <button ...><Trash2 ... /></button>
  </div>
))}
```

With:
```tsx
{(profile?.experiences ?? []).map((exp) => (
  <details key={exp.id} className="collapse collapse-arrow bg-base-100 rounded-box">
    <summary className="collapse-title flex items-center justify-between">
      <div className="flex-1">
        <p className="font-medium">{exp.title}</p>
        <p className="text-sm text-muted">
          {exp.organization} &middot; {exp.startDate}
          {exp.isCurrent ? ' - Present' : exp.endDate ? ` - ${exp.endDate}` : ''}
        </p>
      </div>
      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="btn btn-ghost btn-xs"
          onClick={() => { setEditingId(exp.id ?? null); expForm.reset({ ... }); setShowExpForm(true); }}
          aria-label={`Edit ${exp.title}`}
        >
          <Pencil size={16} />
        </button>
        <button type="button" className="btn btn-ghost btn-xs text-error"
          onClick={() => exp.id && deleteExperience(exp.id)}
          aria-label={`Delete ${exp.title}`}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </summary>
    <div className="collapse-content space-y-2">
      {exp.description && <p className="text-sm">{exp.description}</p>}
      {exp.skillsUsed && exp.skillsUsed.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {exp.skillsUsed.map((s) => <span key={s} className="badge badge-primary badge-sm">{s}</span>)}
        </div>
      )}
      {exp.industry && <p className="text-xs text-muted">Industry: {exp.industry}</p>}
      {exp.url && (
        <a href={exp.url} target="_blank" rel="noopener noreferrer" className="text-xs link link-primary">
          Evidence URL
        </a>
      )}
    </div>
  </details>
))}
```

- [ ] **Commit**

```bash
git add web/src/pages/JobseekerProfile/index.tsx
git commit -m "feat(web): expandable experience cards with collapse-arrow and full details"
```

---

### Task 11: Frontend — AI Evaluation section on profile

**Files:**
- Modify: `web/src/pages/JobseekerProfile/index.tsx`
- Create: `web/src/components/jobseeker/AIEvaluationSection.tsx`

- [ ] **Create AIEvaluationSection component**

```tsx
// web/src/components/jobseeker/AIEvaluationSection.tsx
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Brain, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { EvaluationScoreBadge } from '@/components/jobseeker/EvaluationScoreBadge';
import { SkillScoresChart } from '@/components/jobseeker/SkillScoresChart';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getLatestEvaluation, triggerEvaluation } from '@/lib/evaluation';
import type { EvaluationResult } from '@/lib/evaluation';

export function AIEvaluationSection() {
  const queryClient = useQueryClient();
  const [isTriggering, setIsTriggering] = useState(false);

  const { data: evaluation, isLoading } = useQuery({
    queryKey: ['evaluation', 'latest'],
    queryFn: getLatestEvaluation,
  });

  const triggerMutation = useMutation({
    mutationFn: triggerEvaluation,
    onMutate: () => setIsTriggering(true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluation', 'latest'] });
    },
    onSettled: () => setIsTriggering(false),
  });

  if (isLoading) {
    return (
      <div className="card bg-base-200 p-6">
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  return (
    <div className="card bg-base-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Brain size={20} /> AI Evaluation
        </h2>
      </div>

      {!evaluation ? (
        <div className="text-center py-6 space-y-4">
          <p className="text-muted">Get your skills evaluated by AI to unlock personalized job matches.</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => triggerMutation.mutate()}
            disabled={isTriggering}
          >
            {isTriggering ? <LoadingSpinner size="sm" /> : 'Run AI Evaluation'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-center">
            <EvaluationScoreBadge score={evaluation.overallScore} />
          </div>

          {evaluation.strengths && evaluation.strengths.length > 0 && (
            <div>
              <h3 className="font-medium text-sm text-success mb-2">Strengths</h3>
              <ul className="space-y-1">
                {evaluation.strengths.map((s, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-success mt-0.5">✓</span>
                    <span><strong>{s.skill}</strong> — {s.note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {evaluation.weaknesses && evaluation.weaknesses.length > 0 && (
            <div>
              <h3 className="font-medium text-sm text-warning mb-2">Areas to Improve</h3>
              <ul className="space-y-1">
                {evaluation.weaknesses.map((w, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-warning mt-0.5">!</span>
                    <span><strong>{w.skill}</strong> — {w.note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {evaluation.suggestions && evaluation.suggestions.length > 0 && (
            <div>
              <h3 className="font-medium text-sm text-info mb-2">Suggestions</h3>
              <ul className="space-y-1">
                {evaluation.suggestions.map((s, i) => (
                  <li key={i} className="text-sm">{s.area}: {s.tip}</li>
                ))}
              </ul>
            </div>
          )}

          {evaluation.skillScores && evaluation.skillScores.length > 0 && (
            <SkillScoresChart scores={evaluation.skillScores} />
          )}

          <div className="text-center pt-2">
            <button
              type="button"
              className="btn btn-ghost btn-xs gap-1"
              onClick={() => triggerMutation.mutate()}
              disabled={isTriggering}
            >
              <RefreshCw size={14} /> Refresh Evaluation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Add AIEvaluationSection to the profile page**

In `JobseekerProfile/index.tsx`, after the Experience section closing `</div>` and before the main container closing `</div>`:
```tsx
<AIEvaluationSection />
```

- [ ] **Import the component**

```tsx
import { AIEvaluationSection } from '@/components/jobseeker/AIEvaluationSection';
```

- [ ] **Commit**

```bash
git add web/src/components/jobseeker/AIEvaluationSection.tsx web/src/pages/JobseekerProfile/index.tsx
git commit -m "feat(web): add AI evaluation section to profile page with dedicated button"
```

---

### Task 12: Frontend — Drag & Drop sort Experience

**Files:**
- Modify: `web/src/pages/JobseekerProfile/index.tsx`
- Modify: `web/package.json`

- [ ] **Install @dnd-kit dependencies**

Run: `bun --cwd web add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`

- [ ] **Add DnD wrapper around experience list**

Import at top:
```tsx
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
```

Add state for local ordering:
```tsx
const [sortedExperiences, setSortedExperiences] = useState<Experience[]>([]);

// Sync sortedExperiences when profile data changes
useEffect(() => {
  if (profile?.experiences) {
    setSortedExperiences(profile.experiences);
  }
}, [profile?.experiences]);
```

Add reorder mutation:
```tsx
const reorderMutation = useMutation({
  mutationFn: (experiences: { id: string; sortOrder: number }[]) =>
    api('/profiles/me/experience/reorder', {
      method: 'PUT',
      body: { experiences },
    }),
  onError: () => {
    // Rollback to original order
    if (profile?.experiences) {
      setSortedExperiences(profile.experiences);
    }
    setError('Failed to save new order. Please try again.');
  },
});
```

Add drag end handler:
```tsx
const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;
  if (!over || active.id === over.id) return;

  const oldIndex = sortedExperiences.findIndex((e) => e.id === active.id);
  const newIndex = sortedExperiences.findIndex((e) => e.id === over.id);
  if (oldIndex === -1 || newIndex === -1) return;

  const newOrder = [...sortedExperiences];
  const [moved] = newOrder.splice(oldIndex, 1);
  newOrder.splice(newIndex, 0, moved);
  setSortedExperiences(newOrder);

  const reorderPayload = newOrder.map((exp, i) => ({ id: exp.id!, sortOrder: i }));
  reorderMutation.mutate(reorderPayload);
};
```

Create SortableExperienceItem component:
```tsx
function SortableExperienceItem({ exp, onEdit, onDelete }: { exp: Experience; onEdit: () => void; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: exp.id! });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} className={`collapse collapse-arrow bg-base-100 rounded-box ${isDragging ? 'shadow-lg' : ''}`}>
      <summary className="collapse-title flex items-center gap-2">
        <button className="cursor-grab touch-none" {...attributes} {...listeners} aria-label="Drag to reorder">
          <GripVertical size={16} className="text-muted" />
        </button>
        <div className="flex-1">
          <p className="font-medium">{exp.title}</p>
          <p className="text-sm text-muted">{exp.organization} &middot; {exp.startDate}{exp.isCurrent ? ' - Present' : exp.endDate ? ` - ${exp.endDate}` : ''}</p>
        </div>
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="btn btn-ghost btn-xs" onClick={onEdit} aria-label={`Edit ${exp.title}`}>
            <Pencil size={16} />
          </button>
          <button type="button" className="btn btn-ghost btn-xs text-error" onClick={onDelete} aria-label={`Delete ${exp.title}`}>
            <Trash2 size={16} />
          </button>
        </div>
      </summary>
      <div className="collapse-content space-y-2">
        {exp.description && <p className="text-sm">{exp.description}</p>}
        {exp.skillsUsed && exp.skillsUsed.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {exp.skillsUsed.map((s) => <span key={s} className="badge badge-primary badge-sm">{s}</span>)}
          </div>
        )}
        {exp.industry && <p className="text-xs text-muted">Industry: {exp.industry}</p>}
        {exp.url && <a href={exp.url} target="_blank" rel="noopener noreferrer" className="text-xs link link-primary">Evidence URL</a>}
      </div>
    </div>
  );
}
```

Replace the experience list rendering:
```tsx
<DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
  <SortableContext items={sortedExperiences.map(e => e.id!)} strategy={verticalListSortingStrategy}>
    <div className="space-y-2">
      {sortedExperiences.map((exp) => (
        <SortableExperienceItem
          key={exp.id}
          exp={exp}
          onEdit={() => {
            setEditingId(exp.id ?? null);
            expForm.reset({ ... });
            setShowExpForm(true);
          }}
          onDelete={() => exp.id && deleteExperience(exp.id)}
        />
      ))}
    </div>
  </SortableContext>
</DndContext>
```

- [ ] **Commit**

```bash
git add web/src/pages/JobseekerProfile/index.tsx web/package.json
git commit -m "feat(web): add drag-and-drop sort for experiences"
```

---

### Task 13: Frontend — Skills autocomplete component

**Files:**
- Create: `web/src/components/ui/SkillsAutocomplete.tsx`
- Create: `web/src/lib/skills.ts`
- Modify: `web/src/pages/JobseekerProfile/index.tsx`

- [ ] **Create skills API lib**

```tsx
// web/src/lib/skills.ts
import { api } from '@/lib/api';

export interface Skill {
  id: string;
  name: string;
}

export async function searchSkills(query: string): Promise<Skill[]> {
  if (!query.trim()) return [];
  return api<Skill[]>(`/skills?q=${encodeURIComponent(query)}`);
}

export async function getPopularSkills(): Promise<Skill[]> {
  return api<Skill[]>('/skills');
}
```

- [ ] **Create SkillsAutocomplete component**

```tsx
// web/src/components/ui/SkillsAutocomplete.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { searchSkills, getPopularSkills } from '@/lib/skills';

interface Props {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export function SkillsAutocomplete({ value, onChange, label, placeholder }: Props) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<{ id: string; name: string }[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedSkills = value ? value.split(',').map((s) => s.trim()).filter(Boolean) : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim()) {
      const popular = await getPopularSkills();
      setSuggestions(popular);
      return;
    }
    setLoading(true);
    try {
      const results = await searchSkills(q);
      setSuggestions(results);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setIsOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed || selectedSkills.includes(trimmed)) return;
    const newVal = [...selectedSkills, trimmed].join(', ');
    onChange(newVal);
    setInputValue('');
    setIsOpen(false);
  };

  const removeSkill = (skill: string) => {
    const newVal = selectedSkills.filter((s) => s !== skill).join(', ');
    onChange(newVal);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addSkill(inputValue);
    }
    if (e.key === 'Backspace' && !inputValue && selectedSkills.length > 0) {
      removeSkill(selectedSkills[selectedSkills.length - 1]);
    }
  };

  return (
    <div className="form-control" ref={wrapperRef}>
      {label && <label className="label"><span className="label-text">{label}</span></label>}
      <div className="flex flex-wrap gap-1 mb-1">
        {selectedSkills.map((skill) => (
          <span key={skill} className="badge badge-primary gap-1">
            {skill}
            <button type="button" onClick={() => removeSkill(skill)} className="btn btn-xs btn-ghost btn-circle p-0">
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        className="input input-bordered w-full"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => { setIsOpen(true); fetchSuggestions(inputValue); }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? 'Type a skill and press Enter'}
      />
      {isOpen && suggestions.length > 0 && (
        <ul className="menu bg-base-100 rounded-box shadow-sm z-10 max-h-40 overflow-y-auto w-full">
          {suggestions.map((s) => (
            <li key={s.id}>
              <button type="button" className="text-sm" onClick={() => addSkill(s.name)}>
                {s.name}
              </button>
            </li>
          ))}
        </ul>
      )}
      {loading && <span className="loading loading-spinner loading-xs mt-1" />}
    </div>
  );
}
```

- [ ] **Replace FormInput for skills in profile page**

In `JobseekerProfile/index.tsx`, replace:
```tsx
<FormInput label="Skills (comma separated)" name="skills" placeholder="React, TypeScript, Node.js" />
```
With:
```tsx
<SkillsAutocomplete
  value={expForm.watch('skills') ?? ''}
  onChange={(val) => expForm.setValue('skills', val)}
  label="Skills"
  placeholder="Type a skill and press Enter"
/>
```

- [ ] **Commit**

```bash
git add web/src/lib/skills.ts web/src/components/ui/SkillsAutocomplete.tsx web/src/pages/JobseekerProfile/index.tsx
git commit -m "feat(web): add skills autocomplete component with search endpoint"
```

---

### Task 14: Frontend — Jobs browsing on Applications page

**Files:**
- Modify: `web/src/pages/jobseeker/ApplicationsPage/index.tsx`

- [ ] **Add job search section to ApplicationsPage**

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Search } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { api } from '@/lib/api';

interface JobResult {
  id: string;
  title: string;
  companyName: string;
  location: string | null;
  salaryRange: string | null;
  industry: string;
}
```

Add inside the component, before the stats grid:
```tsx
const [jobSearchOpen, setJobSearchOpen] = useState(false);
const [jobQuery, setJobQuery] = useState('');
const [jobResults, setJobResults] = useState<JobResult[]>([]);
const [searching, setSearching] = useState(false);
const navigate = useNavigate();

const searchJobs = async (q: string) => {
  if (!q.trim()) return;
  setSearching(true);
  try {
    const results = await api<JobResult[]>(`/jobs?q=${encodeURIComponent(q)}`);
    setJobResults(results.slice(0, 5));
  } catch {
    setJobResults([]);
  } finally {
    setSearching(false);
  }
};
```

Add the UI section before `{stats && ...}`:
```tsx
<details className="collapse collapse-arrow bg-base-200 rounded-box" open={jobSearchOpen} onToggle={(e) => setJobSearchOpen((e.target as HTMLDetailsElement).open)}>
  <summary className="collapse-title font-semibold flex items-center gap-2">
    <Briefcase size={18} /> Browse Open Jobs
  </summary>
  <div className="collapse-content space-y-3">
    <div className="flex gap-2">
      <input
        type="text"
        className="input input-bordered input-sm flex-1"
        placeholder="Search jobs by title, skill, or company..."
        value={jobQuery}
        onChange={(e) => setJobQuery(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') searchJobs(jobQuery); }}
      />
      <button type="button" className="btn btn-primary btn-sm" onClick={() => searchJobs(jobQuery)} disabled={searching}>
        {searching ? <LoadingSpinner size="sm" /> : <Search size={16} />}
      </button>
    </div>
    {jobResults.length > 0 && (
      <div className="space-y-2">
        {jobResults.map((job) => (
          <div key={job.id} className="p-3 bg-base-100 rounded-box flex justify-between items-center">
            <div>
              <p className="font-medium text-sm">{job.title}</p>
              <p className="text-xs text-muted">{job.companyName} &middot; {job.industry}{job.location ? ` &middot; ${job.location}` : ''}</p>
              {job.salaryRange && <p className="text-xs text-muted">{job.salaryRange}</p>}
            </div>
            <button type="button" className="btn btn-primary btn-xs" onClick={() => navigate(`/jobs/${job.id}`)}>
              Apply
            </button>
          </div>
        ))}
        <div className="text-center">
          <a href="/jobs" className="link link-primary text-sm">View all jobs →</a>
        </div>
      </div>
    )}
    {jobQuery && !searching && jobResults.length === 0 && (
      <p className="text-sm text-muted text-center py-2">No jobs found for "{jobQuery}"</p>
    )}
  </div>
</details>
```

- [ ] **Commit**

```bash
git add web/src/pages/jobseeker/ApplicationsPage/index.tsx
git commit -m "feat(web): add job search section to applications page"
```

---

### Task 15: Frontend — Auto-refresh applications after apply

**Files:**
- Modify: `web/src/pages/JobDetail/index.tsx`

- [ ] **Add query invalidation on successful application**

In `JobDetail/index.tsx`, import `useQueryClient`:
```tsx
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
```

Add:
```tsx
const queryClient = useQueryClient();
```

Modify `applyMutation`:
```tsx
const applyMutation = useMutation({
  mutationFn: () => applyToJob(id as string),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['jobseeker', 'analytics'] });
    queryClient.invalidateQueries({ queryKey: ['applications', 'me'] });
  },
  onError: (err) => {
    if (err instanceof ApiError && err.status === 409) {
      // Already applied - handled below
    }
  },
});
```

- [ ] **Commit**

```bash
git add web/src/pages/JobDetail/index.tsx
git commit -m "fix(web): auto-refresh applications count after applying"
```

---

### Task 16: DB Migration — Add job requirements column

**Files:**
- Create: `server-go/migrations/000020_add_job_requirements.sql`

- [ ] **Create migration file**

```sql
-- 000020_add_job_requirements.sql
ALTER TABLE job_postings ADD COLUMN requirements TEXT;
```

- [ ] **Run migration**

Run: `bun run db:migrate`
Expected: `Applied 000020_add_job_requirements.sql`

- [ ] **Commit**

```bash
git add server-go/migrations/000020_add_job_requirements.sql
git commit -m "feat(db): add requirements column to job_postings"
```

---

### Task 17: DB Migration — Add years_experience columns

**Files:**
- Create: `server-go/migrations/000021_add_years_experience.sql`

- [ ] **Create migration file**

```sql
-- 000021_add_years_experience.sql
ALTER TABLE job_postings ADD COLUMN years_experience_min INTEGER;
ALTER TABLE job_postings ADD COLUMN years_experience_max INTEGER;
```

- [ ] **Run migration**

Run: `bun run db:migrate`
Expected: `Applied 000021_add_years_experience.sql`

- [ ] **Commit**

```bash
git add server-go/migrations/000021_add_years_experience.sql
git commit -m "feat(db): add years_experience_min and years_experience_max to job_postings"
```

---

### Task 18: Backend — Update job handlers for requirements and years experience

**Files:**
- Modify: `server-go/internal/handlers/jobs.go`

- [ ] **Update JobResponse struct**

Add new fields:
```go
type JobResponse struct {
    // ... existing fields ...
    Requirements        *string  `json:"requirements,omitempty"`
    YearsExperienceMin  *int     `json:"yearsExperienceMin,omitempty"`
    YearsExperienceMax  *int     `json:"yearsExperienceMax,omitempty"`
}
```

- [ ] **Update CreateJobRequest struct**

```go
type CreateJobRequest struct {
    // ... existing fields ...
    Requirements        *string `json:"requirements,omitempty"`
    YearsExperienceMin  *int    `json:"yearsExperienceMin,omitempty"`
    YearsExperienceMax  *int    `json:"yearsExperienceMax,omitempty"`
}
```

- [ ] **Update UpdateJobRequest struct**

```go
type UpdateJobRequest struct {
    // ... existing fields ...
    Requirements        *string `json:"requirements"`
    YearsExperienceMin  *int    `json:"yearsExperienceMin"`
    YearsExperienceMax  *int    `json:"yearsExperienceMax"`
}
```

- [ ] **Update jobFromModel()**

Add to the mapping:
```go
return JobResponse{
    // ... existing fields ...
    Requirements:       j.Requirements,
    YearsExperienceMin: j.YearsExperienceMin,
    YearsExperienceMax: j.YearsExperienceMax,
}
```

- [ ] **Update CreateJob INSERT**

Add to the INSERT columns and VALUES:
```go
// In INSERT columns:
gen.JobPostings.Requirements,
gen.JobPostings.YearsExperienceMin,
gen.JobPostings.YearsExperienceMax,

// In VALUES:
req.Requirements,
req.YearsExperienceMin,
req.YearsExperienceMax,
```

- [ ] **Add UPDATE set clauses**

In the UpdateJob handler, add:
```go
if req.Requirements != nil {
    setVals = append(setVals, gen.JobPostings.Requirements.SET(String(*req.Requirements)))
}
if req.YearsExperienceMin != nil {
    setVals = append(setVals, gen.JobPostings.YearsExperienceMin.SET(Integer(int64(*req.YearsExperienceMin))))
}
if req.YearsExperienceMax != nil {
    setVals = append(setVals, gen.JobPostings.YearsExperienceMax.SET(Integer(int64(*req.YearsExperienceMax))))
}
```

- [ ] **Run `bun run db:generate`**

Expected: go-jet types regenerated with new columns

- [ ] **Commit**

```bash
git add server-go/internal/handlers/jobs.go server-go/.gen/
git commit -m "feat(server): add requirements and years_experience to job handlers"
```

---

### Task 19: Frontend — Update CompanyJobs form with requirements and years UX

**Files:**
- Modify: `web/src/pages/CompanyJobs/index.tsx`
- Modify: `web/src/lib/schemas/index.ts`
- Modify: `web/src/lib/schemas/job.ts`

- [ ] **Update job schema in schemas/index.ts**

Add to `jobSchema`:
```ts
requirements: z.string().optional(),
yearsExperienceMin: z.number().min(0).optional(),
yearsExperienceMax: z.number().min(0).optional(),
```
And to the `JobForm` type:
```ts
export type JobForm = z.infer<typeof jobSchema>;
// (auto-generated, no change needed)
```

- [ ] **Update JobSchema in schemas/job.ts**

```ts
export const JobSchema = z.object({
  // ... existing fields ...
  requirements: z.string().optional(),
  yearsExperienceMin: z.number().optional(),
  yearsExperienceMax: z.number().optional(),
});
```

- [ ] **Update CompanyJobs form defaults**

Add to `defaultValues`:
```ts
requirements: '',
yearsExperienceMin: undefined,
yearsExperienceMax: undefined,
```

- [ ] **Add Requirements textarea to form**

After the Description field:
```tsx
<FormTextarea label="Job Requirements" name="requirements" placeholder="e.g. 5+ years of React, Bachelor's degree in CS" rows={3} />
```

- [ ] **Replace Experience Level dropdown with years inputs**

Replace:
```tsx
<FormSelect label="Experience Level" name="experienceLevel" options={EXPERIENCE_LEVEL_OPTIONS} />
```
With:
```tsx
<div className="grid grid-cols-2 gap-2">
  <FormNumberInput label="Min Years Experience" name="yearsExperienceMin" min={0} max={50} placeholder="0" />
  <FormNumberInput label="Max Years Experience" name="yearsExperienceMax" min={0} max={50} placeholder="10" />
</div>
```

- [ ] **Update parseFormData() to pass new fields**

```ts
function parseFormData(data: JobForm) {
  const tags = data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
  const requiredSkills = data.requiredSkills ? data.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean) : [];
  return {
    ...data,
    tags,
    requiredSkills,
    yearsExperienceMin: data.yearsExperienceMin || undefined,
    yearsExperienceMax: data.yearsExperienceMax || undefined,
  };
}
```

- [ ] **Update openEditForm() to populate new fields**

```ts
function openEditForm(job: Job) {
  methods.reset({
    // ... existing ...
    requirements: job.requirements ?? '',
    yearsExperienceMin: job.yearsExperienceMin ?? undefined,
    yearsExperienceMax: job.yearsExperienceMax ?? undefined,
  });
}
```

- [ ] **Update job card display to show requirements and years**

After the industry/location line in the job card, add:
```tsx
{job.requirements && (
  <details className="collapse collapse-arrow mt-2">
    <summary className="collapse-title text-sm font-medium p-0 min-h-0">Requirements</summary>
    <div className="collapse-content p-0 pt-1"><p className="text-sm whitespace-pre-wrap">{job.requirements}</p></div>
  </details>
)}
```
And replace the experienceLevel badge:
```tsx
{job.yearsExperienceMin != null && (
  <span className="badge badge-sm badge-outline">
    {job.yearsExperienceMin}{job.yearsExperienceMax != null ? `-${job.yearsExperienceMax}` : '+'} yrs
  </span>
)}
{(job.experienceLevel && job.yearsExperienceMin == null) && (
  <span className="badge badge-sm">{job.experienceLevel}</span>
)}
```

- [ ] **Commit**

```bash
git add web/src/pages/CompanyJobs/index.tsx web/src/lib/schemas/index.ts web/src/lib/schemas/job.ts
git commit -m "feat(web): add job requirements field and years experience inputs"
```

---

### Task 20: Frontend — Update JobDetail to show requirements and years

**Files:**
- Modify: `web/src/pages/JobDetail/index.tsx`

- [ ] **Add requirements section to JobDetail**

After the description and before required skills:
```tsx
{job.requirements && (
  <div className="mb-4">
    <h3 className="font-semibold mb-2">Requirements</h3>
    <p className="whitespace-pre-wrap">{job.requirements}</p>
  </div>
)}
```

- [ ] **Show years experience in metadata**

Add after the experienceLevel badge:
```tsx
{job.yearsExperienceMin != null && (
  <span className="badge badge-outline mb-4">
    {job.yearsExperienceMin}{job.yearsExperienceMax != null ? ` - ${job.yearsExperienceMax}` : '+'} years experience
  </span>
)}
```

- [ ] **Regen api types**

Run: `bun run api:generate`
Expected: No errors

- [ ] **Commit**

```bash
git add web/src/pages/JobDetail/index.tsx web/src/lib/generated/ server-go/docs/
git commit -m "feat(web): show job requirements and years experience on job detail"
```

---

### Task 21: Run generated types and tests

- [ ] **Run api:generate for all changes**

Run: `bun run api:generate`
Expected: No errors

- [ ] **Run web typecheck**

Run: `bun --cwd web typecheck`
Expected: No TypeScript errors

- [ ] **Run web lint**

Run: `bun run lint`
Expected: No lint errors

- [ ] **Run web tests**

Run: `bun --cwd web test`
Expected: Tests pass

- [ ] **Run server tests**

Run: `go test ./server-go/...`
Expected: Tests pass (may need DB)

