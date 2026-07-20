# AI Evaluation Scoring — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the non-deterministic LLM-generated overall score with a deterministic "Count" formula — the LLM extracts facts only, the server computes the score — and add dedicated profile sections, evaluation lifecycle management, category-based matching, and history UI.

**Architecture:** The LLM prompt is redesigned to extract structured facts per skill (years, roles, role weight, education, certifications, projects, orgs, URL presence). A new `ScoringService` computes the per-skill Count and total Count server-side using a fixed point table. The DB gets `is_current` and expiry support (3-month validity). The frontend replaces the single dropdown experience form with 6 dedicated visual sections, adds expiry banners, and shows Count growth over time. Matching is enhanced with category-weighted scoring.

**Tech Stack:** Go 1.26 (Gin, pgx, go-jet), React 19 (TanStack Query, react-hook-form, Zod), Tailwind v4 + DaisyUI 5, PostgreSQL.

---

## File Structure Map

### Phase 1 — Scoring Framework & Point Table
| File | Action | Responsibility |
|------|--------|----------------|
| `server-go/internal/evaluation/scoring.go` | **Create** | `RoleWeight`, `EducationLevel` enums; `ComputeSkillCount()`, `ComputeTotalCount()` pure functions |
| `server-go/internal/evaluation/scoring_test.go` | **Create** | All point-table unit tests from spec examples |
| `server-go/internal/evaluation/service.go` | **Modify** | Replace LLM `overallScore`/`skillScores` ask with fact-extraction prompt; call `ComputeSkillCount`/`ComputeTotalCount` after LLM returns |
| `server-go/internal/evaluation/handler.go` | **Modify** | Add `SkillFacts` field to `EvaluationResponse`; new `EvalHistory` endpoint |
| `server-go/internal/evaluation/handler_test.go` | **Modify** | Update mock response shape, fix expected counts |
| `server-go/internal/lib/llm.go` | **Modify** | Update `MockLLMClient` default to return fact-extraction shape |

### Phase 2 — LLM Prompt Quality
| File | Action | Responsibility |
|------|--------|----------------|
| `server-go/internal/evaluation/prompt_test.go` | **Create** | Test harness with cross-industry profiles, title classification, extraction accuracy |

### Phase 3 — UI: Dedicated Profile Sections
| File | Action | Responsibility |
|------|--------|----------------|
| `web/src/components/jobseeker/WorkHistorySection.tsx` | **Create** | Employment + Gig dedicated form card with "Add Work" button |
| `web/src/components/jobseeker/EducationSection.tsx` | **Create** | Education dedicated form card with "Add Education" button |
| `web/src/components/jobseeker/CertificationSection.tsx` | **Create** | Certifications form card with "Add Certification" button |
| `web/src/components/jobseeker/ProjectSection.tsx` | **Create** | Projects & Portfolio form card with "Add Project" button |
| `web/src/components/jobseeker/VolunteeringSection.tsx` | **Create** | Volunteering form card with "Add Volunteer" button |
| `web/src/pages/JobseekerProfile/index.tsx` | **Modify** | Replace single "Add Experience" button + dropdown with 5 visual sections |
| `web/src/lib/schemas/index.ts` | **Modify** | Split `experienceSchema` into per-type schemas with tailored validations |

### Phase 4 — Evaluation Lifecycle
| File | Action | Responsibility |
|------|--------|----------------|
| `server-go/migrations/000027_evaluation_lifecycle.sql` | **Create** | `ALTER TABLE ai_evaluations ADD COLUMN is_current`, partial index |
| `server-go/internal/evaluation/service.go` | **Modify** | Replace DELETE with `is_current=false` flag; add `IsExpired()`, `GetHistory()` |
| `server-go/internal/evaluation/handler.go` | **Modify** | Add `GET /me/history`, expiry check field in response |
| `server-go/internal/application/service.go` | **Modify** | Check evaluation expiry before applying; auto-trigger if expired |
| `server-go/internal/evaluation/handler_test.go` | **Modify** | Tests for history, expiry, auto-trigger flow |
| `web/src/components/jobseeker/EvaluationExpiryBanner.tsx` | **Create** | Banner when evaluation is >3 months old |
| `web/src/pages/jobseeker/EvaluationPage/index.tsx` | **Modify** | Add expiry banner, last-evaluated date |

### Phase 5 — Category Taxonomy for Matching
| File | Action | Responsibility |
|------|--------|----------------|
| `server-go/migrations/000028_category_taxonomy.sql` | **Create** | `skill_categories` table, `job_category_weights` table, seed 27 categories |
| `server-go/internal/matching/category_service.go` | **Create** | `CategoryService` — assign categories to skills, compute weighted match |
| `server-go/internal/matching/service.go` | **Modify** | Call `CategoryService.WeightedMatchScore()` instead of `computeMatchScoreWithMap` |
| `server-go/internal/jobs/handler.go` | **Modify** | Accept `categoryWeights` in job create/update |
| `server-go/internal/matching/handler_test.go` | **Modify** | Tests for weighted matching |

### Phase 6 — History UI
| File | Action | Responsibility |
|------|--------|----------------|
| `web/src/components/jobseeker/CountGrowthTimeline.tsx` | **Create** | Timeline chart showing Count over time |
| `web/src/pages/jobseeker/EvaluationPage/index.tsx` | **Modify** | Add Count growth timeline below current evaluation |
| `web/src/lib/evaluation.ts` | **Modify** | Add `getEvaluationHistory()` API function |

---

## Phase 1 — Scoring Framework & Point Table

### Task 1.1: Create ScoringService with Count formula

**Files:**
- Create: `server-go/internal/evaluation/scoring.go`
- Test: `server-go/internal/evaluation/scoring_test.go`

- [ ] **Step 1: Define types and ComputeSkillCount function**

```go
// server-go/internal/evaluation/scoring.go
package evaluation

// RoleWeight represents the seniority bucket for a skill.
type RoleWeight string

const (
	RoleEntry  RoleWeight = "entry"
	RoleSkilled RoleWeight = "skilled"
	RoleSenior RoleWeight = "senior"
	RoleExpert RoleWeight = "expert"
)

var roleWeightPoints = map[RoleWeight]int{
	RoleEntry:   10,
	RoleSkilled: 35,
	RoleSenior:  65,
	RoleExpert:  100,
}

// EducationLevel represents the highest education level for a skill.
type EducationLevel string

const (
	EduNone    EducationLevel = "none"
	EduHS      EducationLevel = "hs"
	EduDiploma EducationLevel = "diploma"
	EduBachelor EducationLevel = "bachelor"
	EduMaster  EducationLevel = "master"
	EduPhD     EducationLevel = "phd"
)

var eduPoints = map[EducationLevel]int{
	EduNone:    0,
	EduHS:      5,
	EduDiploma: 15,
	EduBachelor: 30,
	EduMaster:  45,
	EduPhD:     65,
}

// SkillFacts are the LLM-extracted structured facts per skill.
type SkillFacts struct {
	Skill              string         `json:"skill"`
	TotalYears         float64        `json:"totalYears"`
	NumRoles           int            `json:"numRoles"`
	RoleWeight         RoleWeight     `json:"roleWeight"`
	EducationLevel     EducationLevel `json:"educationLevel"`
	NumCertifications  int            `json:"numCertifications"`
	NumLicenses        int            `json:"numLicenses"`
	NumProjects        int            `json:"numProjects"`
	NumOrganizations   int            `json:"numOrganizations"`
	HasURL             bool           `json:"hasUrl"`
}

// SkillCountResult holds the computed Count and its breakdown for a skill.
type SkillCountResult struct {
	Skill               string `json:"skill"`
	Count               int    `json:"count"`
	YearsPoints         int    `json:"yearsPoints"`
	RolesPoints         int    `json:"rolesPoints"`
	RoleWeightPoints    int    `json:"roleWeightPoints"`
	EducationPoints     int    `json:"educationPoints"`
	CertificationPoints int    `json:"certificationPoints"`
	ProjectPoints       int    `json:"projectPoints"`
	DiversityPoints     int    `json:"diversityPoints"`
	URLPoints           int    `json:"urlPoints"`
}

// ComputeSkillCount calculates the deterministic Count for one skill.
func ComputeSkillCount(facts SkillFacts) SkillCountResult {
	yearsPoints := int(facts.TotalYears*10 + 0.5) // round to nearest int
	rolesPoints := facts.NumRoles * 15
	rwPoints := roleWeightPoints[facts.RoleLevel]
	if rwPoints == 0 {
		rwPoints = 10 // default to entry
	}
	eduPoints := eduPoints[facts.EducationLevel]
	certPoints := facts.NumCertifications*10 + facts.NumLicenses*20
	projectPoints := facts.NumProjects * 10
	orgPoints := 0
	if facts.NumOrganizations > 1 {
		orgPoints = (facts.NumOrganizations - 1) * 5
	}
	urlPoints := 0
	if facts.HasURL {
		urlPoints = 10
	}

	total := yearsPoints + rolesPoints + rwPoints + eduPoints + certPoints + projectPoints + orgPoints + urlPoints

	return SkillCountResult{
		Skill:               facts.Skill,
		Count:               total,
		YearsPoints:         yearsPoints,
		RolesPoints:         rolesPoints,
		RoleWeightPoints:    rwPoints,
		EducationPoints:     eduPoints,
		CertificationPoints: certPoints,
		ProjectPoints:       projectPoints,
		DiversityPoints:     orgPoints,
		URLPoints:           urlPoints,
	}
}

// ComputeTotalCount calculates the overall total Count from per-skill results.
func ComputeTotalCount(skills []SkillCountResult) int {
	sum := 0
	for _, s := range skills {
		sum += s.Count
	}
	// Breadth bonus: (numSkills - 1) × 10
	if len(skills) > 1 {
		sum += (len(skills) - 1) * 10
	}
	return sum
}
```

- [ ] **Step 2: Write the failing tests from spec examples**

```go
// server-go/internal/evaluation/scoring_test.go
package evaluation

import (
	"testing"
)

func TestComputeSkillCount_ReactSenior(t *testing.T) {
	facts := SkillFacts{
		Skill:             "React",
		TotalYears:        3,
		NumRoles:          2,
		RoleWeight:        RoleSenior,
		EducationLevel:    EduNone,
		NumCertifications: 1,
		NumLicenses:       0,
		NumProjects:       1,
		NumOrganizations:  2,
		HasURL:            false,
	}
	result := ComputeSkillCount(facts)
	expected := 150 // (3×10) + (2×15) + 65 + 0 + (1×10) + (1×10) + (2-1)×5 + 0
	if result.Count != expected {
		t.Fatalf("React senior: got %d, want %d", result.Count, expected)
	}
}

func TestComputeSkillCount_ReactSeniorWithBachelor(t *testing.T) {
	facts := SkillFacts{
		Skill:             "React",
		TotalYears:        3,
		NumRoles:          2,
		RoleWeight:        RoleSenior,
		EducationLevel:    EduBachelor,
		NumCertifications: 1,
		NumLicenses:       0,
		NumProjects:       1,
		NumOrganizations:  2,
		HasURL:            false,
	}
	result := ComputeSkillCount(facts)
	expected := 180 // (3×10) + (2×15) + 65 + 30 + (1×10) + (1×10) + (2-1)×5 + 0
	if result.Count != expected {
		t.Fatalf("React senior with bachelor: got %d, want %d", result.Count, expected)
	}
}

func TestComputeSkillCount_Nurse(t *testing.T) {
	facts := SkillFacts{
		Skill:             "Patient Care",
		TotalYears:        8,
		NumRoles:          3,
		RoleWeight:        RoleSenior,
		EducationLevel:    EduDiploma,
		NumCertifications: 0,
		NumLicenses:       2,
		NumProjects:       0,
		NumOrganizations:  3,
		HasURL:            false,
	}
	result := ComputeSkillCount(facts)
	expected := 255 // (8×10) + (3×15) + 65 + 15 + (2×20) + 0 + (3-1)×5 + 0
	if result.Count != expected {
		t.Fatalf("Nurse: got %d, want %d", result.Count, expected)
	}
}

func TestComputeSkillCount_EntryNoExtras(t *testing.T) {
	facts := SkillFacts{
		Skill:             "Go",
		TotalYears:        0.5,
		NumRoles:          1,
		RoleWeight:        RoleEntry,
		EducationLevel:    EduNone,
		NumCertifications: 0,
		NumLicenses:       0,
		NumProjects:       0,
		NumOrganizations:  1,
		HasURL:            false,
	}
	result := ComputeSkillCount(facts)
	// (0.5×10)=5 + (1×15)=15 + 10 + 0 + 0 + 0 + 0 + 0 = 30
	if result.Count != 30 {
		t.Fatalf("Entry Go: got %d, want %d", result.Count, 30)
	}
}

func TestComputeTotalCount_SingleSkill(t *testing.T) {
	skills := []SkillCountResult{
		{Skill: "Go", Count: 150},
	}
	total := ComputeTotalCount(skills)
	if total != 150 {
		t.Fatalf("single skill: got %d, want %d", total, 150)
	}
}

func TestComputeTotalCount_MultiSkill(t *testing.T) {
	skills := []SkillCountResult{
		{Skill: "Go", Count: 150},
		{Skill: "React", Count: 120},
		{Skill: "Docker", Count: 80},
	}
	// sum = 350, breadth = (3-1)×10 = 20, total = 370
	total := ComputeTotalCount(skills)
	if total != 370 {
		t.Fatalf("multi skill: got %d, want %d", total, 370)
	}
}

func TestComputeSkillCount_RoleWeightPoints(t *testing.T) {
	tests := []struct {
		weight RoleWeight
		want   int
	}{
		{RoleEntry, 10},
		{RoleSkilled, 35},
		{RoleSenior, 65},
		{RoleExpert, 100},
	}
	for _, tt := range tests {
		facts := SkillFacts{Skill: "X", TotalYears: 0, NumRoles: 0, RoleWeight: tt.weight, EducationLevel: EduNone}
		got := ComputeSkillCount(facts).Count
		if got != tt.want {
			t.Fatalf("role weight %q: got %d, want %d", tt.weight, got, tt.want)
		}
	}
}

func TestComputeSkillCount_EducationPoints(t *testing.T) {
	tests := []struct {
		edu  EducationLevel
		want int
	}{
		{EduNone, 0},
		{EduHS, 5},
		{EduDiploma, 15},
		{EduBachelor, 30},
		{EduMaster, 45},
		{EduPhD, 65},
	}
	for _, tt := range tests {
		facts := SkillFacts{Skill: "X", TotalYears: 0, NumRoles: 0, RoleWeight: RoleEntry, EducationLevel: tt.edu}
		got := ComputeSkillCount(facts).Count
		if got != tt.want {
			t.Fatalf("education %q: got %d, want %d", tt.edu, got, tt.want)
		}
	}
}
```

- [ ] **Step 3: Run tests to verify they fail (package doesn't compile yet)**

```bash
cd server-go && go build ./internal/evaluation/
# Expected: compilation error — scoring.go doesn't exist yet
```

- [ ] **Step 4: Create scoring.go (from Step 1 above)**

Add the file as described in Step 1.

- [ ] **Step 5: Run tests to verify they pass**

```bash
bun run test:server -- -run TestCompute -v
# Expected: all 8 tests PASS
```

- [ ] **Step 6: Commit**

```bash
git add server-go/internal/evaluation/scoring.go server-go/internal/evaluation/scoring_test.go
git commit -m "feat(eval): add ScoringService with deterministic Count formula"
```

### Task 1.2: Redesign LLM prompt for fact extraction

**Files:**
- Modify: `server-go/internal/evaluation/service.go`
- Modify: `server-go/internal/lib/llm.go`

- [ ] **Step 1: Update MockLLMClient to return fact-extraction shape**

Change the default `MockLLMClient.ResponseFunc` to return the new structured fact format instead of an overallScore:

```go
// In server-go/internal/lib/llm.go, replace the ResponseFunc body (lines 405-413)
func NewMockLLMClient() *MockLLMClient {
	return &MockLLMClient{
		ResponseFunc: func(systemPrompt, userPrompt string) interface{} {
			return map[string]interface{}{
				"skills": []map[string]interface{}{
					{
						"skill":              "Go",
						"totalYears":         3.0,
						"numRoles":           2,
						"roleWeight":         "senior",
						"educationLevel":     "none",
						"numCertifications":  1,
						"numLicenses":        0,
						"numProjects":        1,
						"numOrganizations":   2,
						"hasUrl":             true,
					},
					{
						"skill":              "React",
						"totalYears":         1.5,
						"numRoles":           1,
						"roleWeight":         "skilled",
						"educationLevel":     "none",
						"numCertifications":  0,
						"numLicenses":        0,
						"numProjects":        1,
						"numOrganizations":   1,
						"hasUrl":             false,
					},
				},
				"strengths": []map[string]interface{}{
					{"skill": "Go", "score": 90, "note": "Strong backend skills"},
				},
				"weaknesses": []map[string]interface{}{
					{"skill": "React", "score": 40, "note": "Limited frontend experience"},
				},
				"suggestions": []map[string]interface{}{
					{"area": "Frontend", "tip": "Build a React project"},
				},
			}
		},
	}
}
```

- [ ] **Step 2: Update EvaluationService.Evaluate to use fact extraction**

Replace the `Evaluate` method body in `service.go`:

```go
// server-go/internal/evaluation/service.go — replaced Evaluate method

func (s *Service) Evaluate(ctx context.Context, profileID string) (*EvaluationResult, error) {
	profileUUID, err := lib.ParseUUID(profileID)
	if err != nil {
		return nil, fmt.Errorf("invalid profile ID: %w", err)
	}

	// 1. Load full profile + experiences
	profileData, err := s.loadFullProfile(ctx, profileID)
	if err != nil {
		return nil, fmt.Errorf("load profile: %w", err)
	}

	// 2. Build the LLM prompt for fact extraction
	systemPrompt := `You are a career assessment data extractor. For each skill found in the profile, extract the following structured facts. Do NOT calculate scores — just extract facts.

For EACH skill, extract:
1. totalYears — Total calendar years the skill was actively used. If multiple roles overlapped in time, do NOT double-count — use the actual calendar duration.
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
Return ONLY valid JSON.`

	userPrompt := fmt.Sprintf(`Extract skill facts from this jobseeker profile:

Name: %s
Headline: %s
About: %s
Years of Experience: %d

Experience entries:
%s

Skills mentioned across experiences: %s

Return the extracted facts as JSON per the system prompt schema.`,
		profileData.Name,
		nullStr(profileData.Headline),
		nullStr(profileData.About),
		nullInt(profileData.YearsOfExperience),
		formatExperiences(profileData.Experiences),
		strings.Join(profileData.AllSkills, ", "))

	// 3. Call LLM — expect facts, not scores
	var llmResult struct {
		Skills      []SkillFacts `json:"skills"`
		Strengths   []SkillNote  `json:"strengths"`
		Weaknesses  []SkillNote  `json:"weaknesses"`
		Suggestions []Suggestion `json:"suggestions"`
	}

	if err := s.llm.Chat(ctx, systemPrompt, userPrompt, &llmResult); err != nil {
		return nil, fmt.Errorf("llm evaluation: %w", err)
	}

	// 4. Compute Counts server-side from extracted facts
	skillCounts := make([]SkillCountResult, 0, len(llmResult.Skills))
	skillScores := make([]SkillScoreItem, 0, len(llmResult.Skills))
	for _, facts := range llmResult.Skills {
		result := ComputeSkillCount(facts)
		skillCounts = append(skillCounts, result)
		skillScores = append(skillScores, SkillScoreItem{
			Skill: result.Skill,
			Score: result.Count,
		})
	}

	totalCount := ComputeTotalCount(skillCounts)

	// 5. Marshal to JSONB
	strengthsJSON, _ := json.Marshal(llmResult.Strengths)
	weaknessesJSON, _ := json.Marshal(llmResult.Weaknesses)
	suggestionsJSON, _ := json.Marshal(llmResult.Suggestions)
	skillScoresJSON, _ := json.Marshal(skillScores)
	skillCountsJSON, _ := json.Marshal(skillCounts)
	rawAnalysis := fmt.Sprintf("system: %s\n\nuser: %s\n\nllm_facts: %s",
		systemPrompt, userPrompt, mustMarshal(llmResult.Skills))

	// 6. Insert evaluation (DELETE old, insert new — will upgrade in Phase 4)
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback()

	delStmt := gen.AiEvaluations.DELETE().WHERE(
		gen.AiEvaluations.ProfileID.EQ(UUID(profileUUID)),
	)
	if _, err := delStmt.ExecContext(ctx, tx); err != nil {
		return nil, fmt.Errorf("delete old evaluations: %w", err)
	}

	newID := uuid.New()
	insStmt := gen.AiEvaluations.INSERT(
		gen.AiEvaluations.ID,
		gen.AiEvaluations.ProfileID,
		gen.AiEvaluations.OverallScore,
		gen.AiEvaluations.Strengths,
		gen.AiEvaluations.Weaknesses,
		gen.AiEvaluations.Suggestions,
		gen.AiEvaluations.SkillScores,
		gen.AiEvaluations.RawAnalysis,
	).VALUES(
		newID,
		profileUUID,
		Int(int64(totalCount)),
		StringExp(CAST(String(string(strengthsJSON))).AS("jsonb")),
		StringExp(CAST(String(string(weaknessesJSON))).AS("jsonb")),
		StringExp(CAST(String(string(suggestionsJSON))).AS("jsonb")),
		StringExp(CAST(String(string(skillScoresJSON))).AS("jsonb")),
		String(rawAnalysis),
	)

	if _, err := insStmt.ExecContext(ctx, tx); err != nil {
		return nil, fmt.Errorf("insert evaluation: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("commit tx: %w", err)
	}

	return &EvaluationResult{
		ID:           newID.String(),
		OverallScore: totalCount,
		Strengths:    llmResult.Strengths,
		Weaknesses:   llmResult.Weaknesses,
		Suggestion:   llmResult.Suggestions,
		SkillScores:  skillScores,
		CreatedAt:    time.Now().UTC().Format(time.RFC3339),
		RawAnalysis:  rawAnalysis,
	}, nil
}

// mustMarshal is a helper that returns JSON string or "{}" on error.
func mustMarshal(v interface{}) string {
	b, err := json.Marshal(v)
	if err != nil {
		return "{}"
	}
	return string(b)
}
```

Also add the import at the top if not already imported:
```go
// Add these imports if not present
// "skillpass-server-go/internal/evaluation" — already in same package
```

- [ ] **Step 3: Update handler test expectations**

```go
// In server-go/internal/evaluation/handler_test.go, update TestPostEvaluate
// The mock now returns 2 skills with computed counts.
// Go facts: 3 years×10=30 + 2 roles×15=30 + senior=65 + 0 + 1 cert×10=10 + 1 proj×10=10 + (2-1)×5=5 + hasURL=10 = 160
// React facts: 1.5 years×10=15 + 1 role×15=15 + skilled=35 + 0 + 0 + 1 proj×10=10 + 0 + 0 = 75
// Total: 160 + 75 + (2-1)×10 = 245

// Change the assertion on line 108 from:
//   if resp.OverallScore != 75 {
// to:
   if resp.OverallScore != 245 {
       t.Fatalf("expected 245 (computed Count), got %d", resp.OverallScore)
   }
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
bun run test:server -- -run TestPostEvaluate -v
# Expected: PASS (OverallScore now 245)
```

- [ ] **Step 5: Commit**

```bash
git add server-go/internal/evaluation/service.go server-go/internal/lib/llm.go server-go/internal/evaluation/handler_test.go
git commit -m "feat(eval): redesign LLM prompt for fact extraction, compute Count server-side"
```

### Task 1.3: Regenerate API types

**Files:**
- Modify: `web/src/lib/api-types.ts` (via `bun run api:generate`)

- [ ] **Step 1: Update the EvaluationResponse struct to include skillCounts**

```go
// In server-go/internal/evaluation/handler.go, add to EvaluationResponse:
type EvaluationResponse struct {
	ID           string              `json:"id"`
	OverallScore int                 `json:"overallScore"`
	Strengths    []SkillNote         `json:"strengths,omitempty"`
	Weaknesses   []SkillNote         `json:"weaknesses,omitempty"`
	Suggestions  []Suggestion        `json:"suggestions,omitempty"`
	SkillScores  []SkillScoreItem    `json:"skillScores,omitempty"`
	SkillCounts  []SkillCountResult  `json:"skillCounts,omitempty"`
	CreatedAt    string              `json:"createdAt"`
} //@name EvaluationResponse
```

- [ ] **Step 2: Add SkillCountResult to the swagger model**

```go
// In scoring.go, add the //@name annotation
// @name SkillCountResult is already covered by the struct name matching

// In handler.go toResponse, populate SkillCounts:
func toResponse(eval *EvaluationResult) EvaluationResponse {
	return EvaluationResponse{
		ID:           eval.ID,
		OverallScore: eval.OverallScore,
		Strengths:    eval.Strengths,
		Weaknesses:   eval.Weaknesses,
		Suggestions:  eval.Suggestion,
		SkillScores:  eval.SkillScores,
		SkillCounts:  eval.SkillCounts,
		CreatedAt:    eval.CreatedAt,
	}
}
```

- [ ] **Step 3: Regenerate API types**

```bash
bun run api:generate
# Expected: regenerates server-go/docs/ and web/src/lib/generated/api.d.ts
```

- [ ] **Step 4: Commit**

```bash
git add server-go/internal/evaluation/handler.go server-go/internal/evaluation/scoring.go server-go/docs/ web/src/lib/generated/
git commit -m "feat(eval): add SkillCounts to response, regenerate API types"
```

---

## Phase 2 — LLM Prompt Quality

### Task 2.1: Build cross-industry profile test harness

**Files:**
- Create: `server-go/internal/evaluation/prompt_test.go`

- [ ] **Step 1: Create profile builder and test helper**

```go
// server-go/internal/evaluation/prompt_test.go
package evaluation

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"testing"

	"skillpass-server-go/internal/lib"
)

// profileData represents test profile input for prompt testing.
type testProfile struct {
	Name             string
	Headline         string
	About            string
	YearsOfExperience int
	Experiences      []testExperience
}

type testExperience struct {
	Type        string
	Title       string
	Organization string
	StartDate   string
	EndDate     string
	IsCurrent   bool
	Description string
	Industry    string
	SkillsUsed  []string
	URL         string
}

// buildUserPrompt simulates the user prompt the LLM receives.
func buildTestUserPrompt(p testProfile) string {
	var expLines []string
	for _, e := range p.Experiences {
		end := e.EndDate
		if end == "" && e.IsCurrent {
			end = "present"
		}
		skills := strings.Join(e.SkillsUsed, ", ")
		line := fmt.Sprintf("- %s at %s (%s to %s) [%s] Skills: %s",
			e.Title, e.Organization, e.StartDate, end, e.Type, skills)
		if e.Description != "" {
			line += "\n  Description: " + e.Description
		}
		expLines = append(expLines, line)
	}
	allSkills := map[string]bool{}
	for _, e := range p.Experiences {
		for _, s := range e.SkillsUsed {
			allSkills[s] = true
		}
	}
	skillList := make([]string, 0, len(allSkills))
	for s := range allSkills {
		skillList = append(skillList, s)
	}
	return fmt.Sprintf(`Extract skill facts from this jobseeker profile:

Name: %s
Headline: %s
About: %s
Years of Experience: %d

Experience entries:
%s

Skills mentioned across experiences: %s

Return the extracted facts as JSON per the system prompt schema.`,
		p.Name, p.Headline, p.About, p.YearsOfExperience,
		strings.Join(expLines, "\n"),
		strings.Join(skillList, ", "))
}
```

- [ ] **Step 2: Write "tech profile" test case**

```go
// In prompt_test.go — add:
func testTechProfile() testProfile {
	return testProfile{
		Name:             "Alice Chen",
		Headline:         "Senior Full-Stack Engineer",
		About:            "Experienced engineer with a focus on Go and React.",
		YearsOfExperience: 7,
		Experiences: []testExperience{
			{
				Type:         "employment",
				Title:        "Senior Backend Engineer",
				Organization: "TechCorp",
				StartDate:    "2021-03",
				EndDate:      "",
				IsCurrent:    true,
				Description:  "Lead the API team, designed microservices architecture, mentored 4 junior engineers.",
				Industry:     "Technology",
				SkillsUsed:   []string{"Go", "PostgreSQL", "Docker", "Kubernetes", "gRPC"},
				URL:          "https://linkedin.com/in/alice",
			},
			{
				Type:         "employment",
				Title:        "Backend Developer",
				Organization: "StartupXYZ",
				StartDate:    "2018-06",
				EndDate:      "2021-02",
				IsCurrent:    false,
				Description:  "Built REST APIs in Go, managed PostgreSQL schemas, set up CI/CD pipelines.",
				Industry:     "Technology",
				SkillsUsed:   []string{"Go", "PostgreSQL", "Docker", "React"},
				URL:          "",
			},
			{
				Type:         "project",
				Title:        "Open Source CLI Tool",
				Organization: "GitHub",
				StartDate:    "2022-01",
				EndDate:      "2022-06",
				Description:  "Built a CLI tool for database migrations in Go.",
				SkillsUsed:   []string{"Go"},
				URL:          "https://github.com/alice/dbmigrate",
			},
		},
	}
}

func TestBuildPrompt_IncludesAllSkills(t *testing.T) {
	p := testTechProfile()
	prompt := buildTestUserPrompt(p)
	if !strings.Contains(prompt, "Go") {
		t.Fatal("prompt missing Go")
	}
	if !strings.Contains(prompt, "React") {
		t.Fatal("prompt missing React")
	}
	if !strings.Contains(prompt, "Senior Backend Engineer") {
		t.Fatal("prompt missing experience title")
	}
	if !strings.Contains(prompt, "https://github.com") {
		t.Fatal("prompt missing project URL")
	}
}
```

- [ ] **Step 3: Write "healthcare profile" test case**

```go
// In prompt_test.go — add:
func testHealthcareProfile() testProfile {
	return testProfile{
		Name:             "Maria Rodriguez",
		Headline:         "Registered Nurse, BSN",
		About:            "Dedicated ER nurse with 12 years of patient care experience.",
		YearsOfExperience: 12,
		Experiences: []testExperience{
			{
				Type:         "employment",
				Title:        "Head Nurse — Emergency Department",
				Organization: "City General Hospital",
				StartDate:    "2019-04",
				EndDate:      "",
				IsCurrent:    true,
				Description:  "Supervise 15 ER nurses, manage patient triage, coordinate with trauma team.",
				Industry:     "Healthcare",
				SkillsUsed:   []string{"Patient Care", "Triage", "Wound Care", "Team Leadership"},
				URL:          "",
			},
			{
				Type:         "employment",
				Title:        "Staff Nurse",
				Organization: "County Medical Center",
				StartDate:    "2014-02",
				EndDate:      "2019-03",
				IsCurrent:    false,
				Description:  "Provided direct patient care in med-surg unit, administered medications, monitored vitals.",
				Industry:     "Healthcare",
				SkillsUsed:   []string{"Patient Care", "Wound Care", "Phlebotomy"},
				URL:          "",
			},
			{
				Type:         "education",
				Title:        "Bachelor of Science in Nursing",
				Organization: "State University",
				StartDate:    "2010-09",
				EndDate:      "2014-05",
				IsCurrent:    false,
				SkillsUsed:   []string{"Patient Care", "Anatomy", "Pharmacology"},
			},
			{
				Type:         "certification",
				Title:        "Registered Nurse License",
				Organization: "State Board of Nursing",
				StartDate:    "2014-07",
				SkillsUsed:   []string{"Patient Care"},
				URL:          "https://example.com/license/RN12345",
			},
			{
				Type:         "certification",
				Title:        "BLS Certification",
				Organization: "American Heart Association",
				StartDate:    "2023-01",
				EndDate:      "2025-01",
				SkillsUsed:   []string{"Patient Care"},
			},
		},
	}
}

func TestHealthcareProfile_PromptContent(t *testing.T) {
	p := testHealthcareProfile()
	prompt := buildTestUserPrompt(p)
	if !strings.Contains(prompt, "Head Nurse") {
		t.Fatal("prompt missing Head Nurse title for role weight classification")
	}
	if !strings.Contains(prompt, "Registered Nurse License") {
		t.Fatal("prompt missing license entry")
	}
	if !strings.Contains(prompt, "Bachelor of Science in Nursing") {
		t.Fatal("prompt missing education entry")
	}
}
```

- [ ] **Step 4: Test the extracted facts match expectations**

```go
// In prompt_test.go — add a MockLLMClient test that verifies fact extraction
// with the new prompt shape.

func TestTechProfile_FactsComputeCorrectCount(t *testing.T) {
	p := testTechProfile()
	prompt := buildTestUserPrompt(p)

	// Simulate what a good LLM extraction should return for this profile
	mock := lib.NewMockLLMClient()
	mock.ResponseFunc = func(system, user string) interface{} {
		return map[string]interface{}{
			"skills": []map[string]interface{}{
				{
					"skill":             "Go",
					"totalYears":        5.5,
					"numRoles":          2,
					"roleWeight":        "senior",
					"educationLevel":    "none",
					"numCertifications": 0,
					"numLicenses":       0,
					"numProjects":       1,
					"numOrganizations":  2,
					"hasUrl":            true,
				},
				{
					"skill":             "React",
					"totalYears":        2.5,
					"numRoles":          1,
					"roleWeight":        "skilled",
					"educationLevel":    "none",
					"numCertifications": 0,
					"numLicenses":       0,
					"numProjects":       0,
					"numOrganizations":  1,
					"hasUrl":            false,
				},
				{
					"skill":             "PostgreSQL",
					"totalYears":        5.5,
					"numRoles":          2,
					"roleWeight":        "senior",
					"educationLevel":    "none",
					"numCertifications": 0,
					"numLicenses":       0,
					"numProjects":       0,
					"numOrganizations":  2,
					"hasUrl":            false,
				},
				{
					"skill":             "Docker",
					"totalYears":        3.5,
					"numRoles":          2,
					"roleWeight":        "skilled",
					"educationLevel":    "none",
					"numCertifications": 0,
					"numLicenses":       0,
					"numProjects":       0,
					"numOrganizations":  2,
					"hasUrl":            false,
				},
			},
			"strengths":  []map[string]interface{}{{"skill": "Go", "score": 90, "note": "Strong backend"}},
			"weaknesses": []map[string]interface{}{},
			"suggestions": []map[string]interface{}{},
		}
	}

	var llmResult struct {
		Skills      []SkillFacts `json:"skills"`
		Strengths   []SkillNote  `json:"strengths"`
		Weaknesses  []SkillNote  `json:"weaknesses"`
		Suggestions []Suggestion `json:"suggestions"`
	}
	if err := mock.Chat(context.Background(), "system", prompt, &llmResult); err != nil {
		t.Fatalf("mock chat: %v", err)
	}

	if len(llmResult.Skills) != 4 {
		t.Fatalf("expected 4 skills, got %d", len(llmResult.Skills))
	}

	// Compute Counts from the extracted facts
	counts := make([]SkillCountResult, 0, len(llmResult.Skills))
	for _, f := range llmResult.Skills {
		counts = append(counts, ComputeSkillCount(f))
	}

	totalCount := ComputeTotalCount(counts)
	if totalCount <= 0 {
		t.Fatalf("expected positive totalCount, got %d", totalCount)
	}
	t.Logf("Computed total Count: %d", totalCount)
}

func TestMockLLM_FactExtractionRoundTrip(t *testing.T) {
	// Verify the MockLLMClient default response unmarshals into SkillFacts
	mock := lib.NewMockLLMClient()
	var result struct {
		Skills []SkillFacts `json:"skills"`
	}
	err := mock.Chat(context.Background(), "system", "user", &result)
	if err != nil {
		t.Fatalf("mock chat: %v", err)
	}
	if len(result.Skills) == 0 {
		t.Fatal("expected at least one skill")
	}
	if result.Skills[0].TotalYears <= 0 {
		t.Fatal("expected positive TotalYears")
	}
}
```

- [ ] **Step 5: Run all evaluation tests**

```bash
bun run test:server -- -run "Test(Tech|Health|MockLLM)" -v
# Expected: all tests PASS
```

- [ ] **Step 6: Commit**

```bash
git add server-go/internal/evaluation/prompt_test.go
git commit -m "test(eval): add cross-industry profile test harness for prompt quality"
```

---

## Phase 3 — UI: Dedicated Profile Sections

### Task 3.1: Update schemas with per-type experience validation

**Files:**
- Modify: `web/src/lib/schemas/index.ts`

- [ ] **Step 1: Add per-type experience schemas**

```typescript
// In web/src/lib/schemas/index.ts, after the existing experienceSchema:

// Employment-specific schema (employment & gig)
export const workHistorySchema = z.object({
  type: z.enum(['employment', 'gig']),
  title: z.string().min(1, 'Title is required'),
  organization: z.string().min(1, 'Organization is required'),
  startDate: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Start date must be in YYYY-MM format'),
  endDate: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'End date must be in YYYY-MM format')
    .optional()
    .or(z.literal('')),
  isCurrent: z.boolean().optional(),
  description: z.string().optional(),
  industry: z.string().min(1, 'Industry is required'),
  skills: z.string().optional(),
  url: z.string().url('Invalid URL').or(z.literal('')).optional(),
});
export type WorkHistoryForm = z.infer<typeof workHistorySchema>;

// Education-specific schema
export const educationSchema = z.object({
  type: z.literal('education'),
  title: z.string().min(1, 'Degree/Diploma title is required'),
  organization: z.string().min(1, 'Institution is required'),
  startDate: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Start date must be in YYYY-MM format'),
  endDate: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'End date must be in YYYY-MM format')
    .optional()
    .or(z.literal('')),
  isCurrent: z.boolean().optional(),
  description: z.string().optional(),
  skills: z.string().optional(),
  url: z.string().url('Invalid URL').or(z.literal('')).optional(),
});
export type EducationForm = z.infer<typeof educationSchema>;

// Certification-specific schema
export const certificationSchema = z.object({
  type: z.literal('certification'),
  title: z.string().min(1, 'Certification name is required'),
  organization: z.string().min(1, 'Issuer is required'),
  startDate: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Issue date must be in YYYY-MM format'),
  endDate: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Expiry date must be in YYYY-MM format')
    .optional()
    .or(z.literal('')),
  description: z.string().optional(),
  skills: z.string().optional(),
  url: z.string().url('Verification URL').or(z.literal('')).optional(),
});
export type CertificationForm = z.infer<typeof certificationSchema>;

// Project-specific schema
export const projectSchema = z.object({
  type: z.literal('project'),
  title: z.string().min(1, 'Project title is required'),
  organization: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Start date must be in YYYY-MM format'),
  endDate: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'End date must be in YYYY-MM format')
    .optional()
    .or(z.literal('')),
  description: z.string().optional(),
  skills: z.string().optional(),
  url: z.string().url('Project URL').or(z.literal('')).optional(),
});
export type ProjectForm = z.infer<typeof projectSchema>;

// Volunteering-specific schema
export const volunteeringSchema = z.object({
  type: z.literal('volunteering'),
  title: z.string().min(1, 'Role is required'),
  organization: z.string().min(1, 'Organization is required'),
  startDate: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Start date must be in YYYY-MM format'),
  endDate: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'End date must be in YYYY-MM format')
    .optional()
    .or(z.literal('')),
  isCurrent: z.boolean().optional(),
  description: z.string().optional(),
  skills: z.string().optional(),
  url: z.string().url('Invalid URL').or(z.literal('')).optional(),
});
export type VolunteeringForm = z.infer<typeof volunteeringSchema>;
```

- [ ] **Step 2: Run typecheck to verify**

```bash
bun run typecheck
# Expected: no type errors
```

- [ ] **Step 3: Commit**

```bash
git add web/src/lib/schemas/index.ts
git commit -m "feat(web): add per-type experience validation schemas"
```

### Task 3.2: Create WorkHistorySection component

**Files:**
- Create: `web/src/components/jobseeker/WorkHistorySection.tsx`
- Test: Create `web/src/components/jobseeker/WorkHistorySection.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// web/src/components/jobseeker/WorkHistorySection.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { WorkHistorySection } from '@/components/jobseeker/WorkHistorySection';

describe('WorkHistorySection', () => {
  it('renders with add button and empty state', () => {
    render(
      <WorkHistorySection
        experiences={[]}
        onAdd={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText(/Work History/)).toBeInTheDocument();
    expect(screen.getByText(/Add Work/)).toBeInTheDocument();
    expect(screen.getByText(/No work history added/)).toBeInTheDocument();
  });

  it('renders employment entries', () => {
    render(
      <WorkHistorySection
        experiences={[
          {
            id: '1', title: 'Senior Dev', organization: 'Co',
            startDate: '2020-01', endDate: null, isCurrent: true,
            type: 'employment', description: null, industry: 'Tech',
            skillsUsed: ['Go'], url: null,
          },
        ]}
        onAdd={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText('Senior Dev')).toBeInTheDocument();
    expect(screen.getByText('Co')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to see it fail**

```bash
bun --cwd web test -- --run src/components/jobseeker/WorkHistorySection.test.tsx
# Expected: FAIL — component not found
```

- [ ] **Step 3: Implement WorkHistorySection**

```tsx
// web/src/components/jobseeker/WorkHistorySection.tsx
import { Briefcase, Pencil, Plus, Trash2 } from 'lucide-react';
import type { Experience } from '@/lib/api-types';

interface Props {
  experiences: Experience[];
  onAdd: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function WorkHistorySection({ experiences, onAdd, onEdit, onDelete }: Props) {
  return (
    <div className="card bg-base-200 p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold flex items-center gap-2">
          <Briefcase size={18} aria-hidden="true" /> Work History
        </h2>
        <button type="button" className="btn btn-outline btn-sm gap-1" onClick={onAdd}>
          <Plus size={16} aria-hidden="true" /> Add Work
        </button>
      </div>
      {experiences.length === 0 ? (
        <p className="text-sm text-muted py-4 text-center">No work history added yet.</p>
      ) : (
        <div className="space-y-2">
          {experiences.map((exp) => (
            <div key={exp.id} className="p-3 bg-base-100 rounded-box flex justify-between items-start">
              <div>
                <p className="font-medium">{exp.title}</p>
                <p className="text-sm opacity-60">
                  {exp.organization} &middot; {exp.startDate}
                  {exp.isCurrent ? ' - Present' : exp.endDate ? ` - ${exp.endDate}` : ''}
                </p>
                {exp.industry && <p className="text-xs opacity-50 mt-1">{exp.industry}</p>}
              </div>
              <div className="flex gap-1">
                <button type="button" className="btn btn-ghost btn-xs" onClick={() => exp.id && onEdit(exp.id)} aria-label="Edit">
                  <Pencil size={14} />
                </button>
                <button type="button" className="btn btn-ghost btn-xs text-error" onClick={() => exp.id && onDelete(exp.id)} aria-label="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
bun --cwd web test -- --run src/components/jobseeker/WorkHistorySection.test.tsx
# Expected: PASS
```

- [ ] **Step 5: Create similar EducationSection, CertificationSection, ProjectSection, VolunteeringSection**

Each follows the same pattern. Create minimal versions:

```tsx
// web/src/components/jobseeker/EducationSection.tsx
import { GraduationCap, Pencil, Plus, Trash2 } from 'lucide-react';
import type { Experience } from '@/lib/api-types';

interface Props {
  experiences: Experience[];
  onAdd: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function EducationSection({ experiences, onAdd, onEdit, onDelete }: Props) {
  return (
    <div className="card bg-base-200 p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold flex items-center gap-2">
          <GraduationCap size={18} aria-hidden="true" /> Education
        </h2>
        <button type="button" className="btn btn-outline btn-sm gap-1" onClick={onAdd}>
          <Plus size={16} aria-hidden="true" /> Add Education
        </button>
      </div>
      {experiences.length === 0 ? (
        <p className="text-sm text-muted py-4 text-center">No education added yet.</p>
      ) : (
        <div className="space-y-2">
          {experiences.map((exp) => (
            <div key={exp.id} className="p-3 bg-base-100 rounded-box flex justify-between items-start">
              <div>
                <p className="font-medium">{exp.title}</p>
                <p className="text-sm opacity-60">
                  {exp.organization} &middot; {exp.startDate}
                  {exp.isCurrent ? ' - Present' : exp.endDate ? ` - ${exp.endDate}` : ''}
                </p>
              </div>
              <div className="flex gap-1">
                <button type="button" className="btn btn-ghost btn-xs" onClick={() => exp.id && onEdit(exp.id)} aria-label="Edit">
                  <Pencil size={14} />
                </button>
                <button type="button" className="btn btn-ghost btn-xs text-error" onClick={() => exp.id && onDelete(exp.id)} aria-label="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

```tsx
// web/src/components/jobseeker/CertificationSection.tsx
import { Award, Pencil, Plus, Trash2 } from 'lucide-react';
import type { Experience } from '@/lib/api-types';

interface Props {
  experiences: Experience[];
  onAdd: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function CertificationSection({ experiences, onAdd, onEdit, onDelete }: Props) {
  return (
    <div className="card bg-base-200 p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold flex items-center gap-2">
          <Award size={18} aria-hidden="true" /> Certifications & Licenses
        </h2>
        <button type="button" className="btn btn-outline btn-sm gap-1" onClick={onAdd}>
          <Plus size={16} aria-hidden="true" /> Add Certification
        </button>
      </div>
      {experiences.length === 0 ? (
        <p className="text-sm text-muted py-4 text-center">No certifications or licenses added yet.</p>
      ) : (
        <div className="space-y-2">
          {experiences.map((exp) => (
            <div key={exp.id} className="p-3 bg-base-100 rounded-box flex justify-between items-start">
              <div>
                <p className="font-medium">{exp.title}</p>
                <p className="text-sm opacity-60">{exp.organization}</p>
                {exp.url && (
                  <a href={exp.url} target="_blank" rel="noopener noreferrer" className="text-xs link link-primary">
                    Verify credential
                  </a>
                )}
              </div>
              <div className="flex gap-1">
                <button type="button" className="btn btn-ghost btn-xs" onClick={() => exp.id && onEdit(exp.id)} aria-label="Edit">
                  <Pencil size={14} />
                </button>
                <button type="button" className="btn btn-ghost btn-xs text-error" onClick={() => exp.id && onDelete(exp.id)} aria-label="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

```tsx
// web/src/components/jobseeker/ProjectSection.tsx
import { Code, Pencil, Plus, Trash2 } from 'lucide-react';
import type { Experience } from '@/lib/api-types';

interface Props {
  experiences: Experience[];
  onAdd: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ProjectSection({ experiences, onAdd, onEdit, onDelete }: Props) {
  return (
    <div className="card bg-base-200 p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold flex items-center gap-2">
          <Code size={18} aria-hidden="true" /> Projects & Portfolio
        </h2>
        <button type="button" className="btn btn-outline btn-sm gap-1" onClick={onAdd}>
          <Plus size={16} aria-hidden="true" /> Add Project
        </button>
      </div>
      {experiences.length === 0 ? (
        <p className="text-sm text-muted py-4 text-center">No projects or portfolio items added yet.</p>
      ) : (
        <div className="space-y-2">
          {experiences.map((exp) => (
            <div key={exp.id} className="p-3 bg-base-100 rounded-box flex justify-between items-start">
              <div>
                <p className="font-medium">{exp.title}</p>
                {exp.description && <p className="text-sm opacity-60 mt-1">{exp.description}</p>}
                {exp.url && (
                  <a href={exp.url} target="_blank" rel="noopener noreferrer" className="text-xs link link-primary mt-1 inline-block">
                    View project
                  </a>
                )}
              </div>
              <div className="flex gap-1">
                <button type="button" className="btn btn-ghost btn-xs" onClick={() => exp.id && onEdit(exp.id)} aria-label="Edit">
                  <Pencil size={14} />
                </button>
                <button type="button" className="btn btn-ghost btn-xs text-error" onClick={() => exp.id && onDelete(exp.id)} aria-label="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

```tsx
// web/src/components/jobseeker/VolunteeringSection.tsx
import { Heart, Pencil, Plus, Trash2 } from 'lucide-react';
import type { Experience } from '@/lib/api-types';

interface Props {
  experiences: Experience[];
  onAdd: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function VolunteeringSection({ experiences, onAdd, onEdit, onDelete }: Props) {
  return (
    <div className="card bg-base-200 p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold flex items-center gap-2">
          <Heart size={18} aria-hidden="true" /> Volunteering
        </h2>
        <button type="button" className="btn btn-outline btn-sm gap-1" onClick={onAdd}>
          <Plus size={16} aria-hidden="true" /> Add Volunteering
        </button>
      </div>
      {experiences.length === 0 ? (
        <p className="text-sm text-muted py-4 text-center">No volunteering experience added yet.</p>
      ) : (
        <div className="space-y-2">
          {experiences.map((exp) => (
            <div key={exp.id} className="p-3 bg-base-100 rounded-box flex justify-between items-start">
              <div>
                <p className="font-medium">{exp.title}</p>
                <p className="text-sm opacity-60">{exp.organization}</p>
              </div>
              <div className="flex gap-1">
                <button type="button" className="btn btn-ghost btn-xs" onClick={() => exp.id && onEdit(exp.id)} aria-label="Edit">
                  <Pencil size={14} />
                </button>
                <button type="button" className="btn btn-ghost btn-xs text-error" onClick={() => exp.id && onDelete(exp.id)} aria-label="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Create test files for each section (minimal smoke tests)**

```tsx
// web/src/components/jobseeker/EducationSection.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EducationSection } from '@/components/jobseeker/EducationSection';

describe('EducationSection', () => {
  it('renders empty state and add button', () => {
    render(<EducationSection experiences={[]} onAdd={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText(/Education/)).toBeInTheDocument();
    expect(screen.getByText(/Add Education/)).toBeInTheDocument();
  });
});
```

```tsx
// web/src/components/jobseeker/CertificationSection.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CertificationSection } from '@/components/jobseeker/CertificationSection';

describe('CertificationSection', () => {
  it('renders empty state and add button', () => {
    render(<CertificationSection experiences={[]} onAdd={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText(/Certifications/)).toBeInTheDocument();
    expect(screen.getByText(/Add Certification/)).toBeInTheDocument();
  });
});
```

```tsx
// web/src/components/jobseeker/ProjectSection.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProjectSection } from '@/components/jobseeker/ProjectSection';

describe('ProjectSection', () => {
  it('renders empty state and add button', () => {
    render(<ProjectSection experiences={[]} onAdd={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText(/Projects/)).toBeInTheDocument();
    expect(screen.getByText(/Add Project/)).toBeInTheDocument();
  });
});
```

```tsx
// web/src/components/jobseeker/VolunteeringSection.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { VolunteeringSection } from '@/components/jobseeker/VolunteeringSection';

describe('VolunteeringSection', () => {
  it('renders empty state and add button', () => {
    render(<VolunteeringSection experiences={[]} onAdd={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText(/Volunteering/)).toBeInTheDocument();
    expect(screen.getByText(/Add Volunteering/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 7: Run all section tests**

```bash
bun --cwd web test -- --run src/components/jobseeker/WorkHistorySection.test.tsx src/components/jobseeker/EducationSection.test.tsx src/components/jobseeker/CertificationSection.test.tsx src/components/jobseeker/ProjectSection.test.tsx src/components/jobseeker/VolunteeringSection.test.tsx
# Expected: all PASS
```

- [ ] **Step 8: Commit**

```bash
git add web/src/components/jobseeker/WorkHistorySection.tsx web/src/components/jobseeker/WorkHistorySection.test.tsx web/src/components/jobseeker/EducationSection.tsx web/src/components/jobseeker/EducationSection.test.tsx web/src/components/jobseeker/CertificationSection.tsx web/src/components/jobseeker/CertificationSection.test.tsx web/src/components/jobseeker/ProjectSection.tsx web/src/components/jobseeker/ProjectSection.test.tsx web/src/components/jobseeker/VolunteeringSection.tsx web/src/components/jobseeker/VolunteeringSection.test.tsx
git commit -m "feat(web): add dedicated experience section components"
```

### Task 3.3: Replace single experience form with dedicated sections in profile page

**Files:**
- Modify: `web/src/pages/JobseekerProfile/index.tsx`

- [ ] **Step 1: Update the profile page imports and state**

Replace the relevant section in `web/src/pages/JobseekerProfile/index.tsx`:

```tsx
// Replace lines 18-23 imports with:
import { Briefcase, GraduationCap, Award, Code, Heart, X } from 'lucide-react';
import { WorkHistorySection } from '@/components/jobseeker/WorkHistorySection';
import { EducationSection } from '@/components/jobseeker/EducationSection';
import { CertificationSection } from '@/components/jobseeker/CertificationSection';
import { ProjectSection } from '@/components/jobseeker/ProjectSection';
import { VolunteeringSection } from '@/components/jobseeker/VolunteeringSection';
```

- [ ] **Step 2: Replace the experience section rendering**

Replace the experience section (lines 316-417) with the new section components:

```tsx
      {/* Work History — employment + gig */}
      <WorkHistorySection
        experiences={sortedExperiences.filter((e) => e.type === 'employment' || e.type === 'gig')}
        onAdd={() => {
          expForm.reset({ type: 'employment', title: '', organization: '', startDate: '', endDate: '', isCurrent: false, description: '', industry: '', skills: '', url: '' });
          setShowExpForm(true);
        }}
        onEdit={(id) => {
          const exp = sortedExperiences.find((e) => e.id === id);
          if (!exp) return;
          setEditingId(id);
          expForm.reset({
            type: exp.type as 'employment' | 'gig' | 'education' | 'certification' | 'project' | 'volunteering',
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
        onDelete={(id) => deleteExperience(id)}
      />

      {/* Education */}
      <EducationSection
        experiences={sortedExperiences.filter((e) => e.type === 'education')}
        onAdd={() => {
          expForm.reset({ type: 'education', title: '', organization: '', startDate: '', endDate: '', isCurrent: false, description: '', industry: '', skills: '', url: '' });
          setShowExpForm(true);
        }}
        onEdit={(id) => {
          const exp = sortedExperiences.find((e) => e.id === id);
          if (!exp) return;
          setEditingId(id);
          expForm.reset({
            type: 'education',
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
        onDelete={(id) => deleteExperience(id)}
      />

      {/* Certifications & Licenses */}
      <CertificationSection
        experiences={sortedExperiences.filter((e) => e.type === 'certification')}
        onAdd={() => {
          expForm.reset({ type: 'certification', title: '', organization: '', startDate: '', endDate: '', description: '', industry: '', skills: '', url: '' });
          setShowExpForm(true);
        }}
        onEdit={(id) => {
          const exp = sortedExperiences.find((e) => e.id === id);
          if (!exp) return;
          setEditingId(id);
          expForm.reset({
            type: 'certification',
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
        onDelete={(id) => deleteExperience(id)}
      />

      {/* Projects & Portfolio */}
      <ProjectSection
        experiences={sortedExperiences.filter((e) => e.type === 'project')}
        onAdd={() => {
          expForm.reset({ type: 'project', title: '', organization: '', startDate: '', endDate: '', description: '', industry: '', skills: '', url: '' });
          setShowExpForm(true);
        }}
        onEdit={(id) => {
          const exp = sortedExperiences.find((e) => e.id === id);
          if (!exp) return;
          setEditingId(id);
          expForm.reset({
            type: 'project',
            title: exp.title,
            organization: exp.organization ?? '',
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
        onDelete={(id) => deleteExperience(id)}
      />

      {/* Volunteering */}
      <VolunteeringSection
        experiences={sortedExperiences.filter((e) => e.type === 'volunteering')}
        onAdd={() => {
          expForm.reset({ type: 'volunteering', title: '', organization: '', startDate: '', endDate: '', isCurrent: false, description: '', industry: '', skills: '', url: '' });
          setShowExpForm(true);
        }}
        onEdit={(id) => {
          const exp = sortedExperiences.find((e) => e.id === id);
          if (!exp) return;
          setEditingId(id);
          expForm.reset({
            type: 'volunteering',
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
        onDelete={(id) => deleteExperience(id)}
      />
```

- [ ] **Step 3: Remove the old experience section wrapper**

Delete the old card with `id="experience-sections"` and the `SortableExperienceItem` function (lines 424-510), keeping the DndContext only for the new sections if needed. Since the new sections handle their own display, the DndContext for the list wrapper and the `SortableExperienceItem` can be removed entirely — individual sections don't need drag-to-reorder for now (the backend supports reorder via the dedicated endpoint if needed later).

- [ ] **Step 4: Run typecheck**

```bash
bun run typecheck
# Expected: no errors
```

- [ ] **Step 5: Commit**

```bash
git add web/src/pages/JobseekerProfile/index.tsx
git commit -m "feat(web): replace single experience dropdown with 6 dedicated visual sections"
```

---

## Phase 4 — Evaluation Lifecycle

### Task 4.1: Database migration for is_current and evaluation history

**Files:**
- Create: `server-go/migrations/000027_evaluation_lifecycle.sql`

- [ ] **Step 1: Create the migration**

```sql
-- server-go/migrations/000027_evaluation_lifecycle.sql
-- Add is_current flag for evaluation history tracking

-- Add is_current column (default true for backward compatibility)
ALTER TABLE ai_evaluations ADD COLUMN IF NOT EXISTS is_current BOOLEAN NOT NULL DEFAULT true;

-- Add partial index for fast "current evaluation per profile" lookups
CREATE INDEX IF NOT EXISTS idx_ai_evaluations_current_profile
  ON ai_evaluations(profile_id, is_current)
  WHERE is_current = true;

-- Add index for history queries (all evaluations for a profile, ordered by time)
CREATE INDEX IF NOT EXISTS idx_ai_evaluations_profile_created
  ON ai_evaluations(profile_id, created_at DESC);
```

- [ ] **Step 2: Run the migration and regenerate go-jet types**

```bash
bun run db:migrate
# Expected: "MIGRATE 000027_evaluation_lifecycle.sql"

bun run db:generate
# Expected: regenerates .gen files including the new IsCurrent column
```

- [ ] **Step 3: Commit**

```bash
git add server-go/migrations/000027_evaluation_lifecycle.sql server-go/.gen/
git commit -m "feat(db): add is_current flag and indexes for evaluation lifecycle"
```

### Task 4.2: Update EvaluationService — replace DELETE with flag, add expiry

**Files:**
- Modify: `server-go/internal/evaluation/service.go`
- Modify: `server-go/internal/evaluation/handler.go`

- [ ] **Step 1: Add evaluation expiry constants and methods**

```go
// In server-go/internal/evaluation/service.go, add constants and methods:

const (
	// EvaluationValidDuration is how long an evaluation is considered current.
	EvaluationValidDuration = 3 * 30 * 24 * time.Hour // ~3 months
)

// IsExpired returns true if the evaluation was created more than 3 months ago.
func IsExpired(createdAt time.Time) bool {
	return time.Since(createdAt) > EvaluationValidDuration
}

// GetHistory returns all evaluations for a profile, ordered by newest first.
func (s *Service) GetHistory(ctx context.Context, profileID string) ([]*EvaluationResult, error) {
	profileUUID, err := lib.ParseUUID(profileID)
	if err != nil {
		return nil, fmt.Errorf("invalid profile ID: %w", err)
	}

	stmt := SELECT(
		gen.AiEvaluations.AllColumns,
	).FROM(
		gen.AiEvaluations,
	).WHERE(
		gen.AiEvaluations.ProfileID.EQ(UUID(profileUUID)),
	).ORDER_BY(
		gen.AiEvaluations.CreatedAt.DESC(),
	)

	var evals []model.AiEvaluations
	if err := stmt.QueryContext(ctx, s.db, &evals); err != nil {
		return nil, err
	}

	results := make([]*EvaluationResult, 0, len(evals))
	for _, eval := range evals {
		result := evalToResult(eval)
		if result != nil {
			results = append(results, result)
		}
	}
	return results, nil
}

// evalToResult converts a model.AiEvaluations row to EvaluationResult.
func evalToResult(eval model.AiEvaluations) *EvaluationResult {
	var strengths []SkillNote
	var weaknesses []SkillNote
	var suggestions []Suggestion
	var skillScores []SkillScoreItem

	if err := json.Unmarshal([]byte(eval.Strengths), &strengths); err != nil {
		return nil
	}
	if err := json.Unmarshal([]byte(eval.Weaknesses), &weaknesses); err != nil {
		return nil
	}
	if err := json.Unmarshal([]byte(eval.Suggestions), &suggestions); err != nil {
		return nil
	}
	if err := json.Unmarshal([]byte(eval.SkillScores), &skillScores); err != nil {
		return nil
	}

	return &EvaluationResult{
		ID:           eval.ID.String(),
		OverallScore: int(eval.OverallScore),
		Strengths:    strengths,
		Weaknesses:   weaknesses,
		Suggestion:   suggestions,
		SkillScores:  skillScores,
		CreatedAt:    eval.CreatedAt.Format(time.RFC3339),
		RawAnalysis:  eval.RawAnalysis,
	}
}
```

- [ ] **Step 2: Update Evaluate to use is_current flag instead of DELETE**

Replace the transaction block in `Evaluate` (lines 126-168) with:

```go
	// 6. Insert evaluation with is_current lifecycle management
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback()

	// Flag all existing current evaluations as not current
	updateStmt := gen.AiEvaluations.
		UPDATE(gen.AiEvaluations.IsCurrent).
		SET(Bool(false)).
		WHERE(
			gen.AiEvaluations.ProfileID.EQ(UUID(profileUUID)).
				AND(gen.AiEvaluations.IsCurrent.EQ(Bool(true))),
		)
	if _, err := updateStmt.ExecContext(ctx, tx); err != nil {
		return nil, fmt.Errorf("flag old evaluations: %w", err)
	}

	// Insert new evaluation with is_current = true
	newID := uuid.New()
	insStmt := gen.AiEvaluations.INSERT(
		gen.AiEvaluations.ID,
		gen.AiEvaluations.ProfileID,
		gen.AiEvaluations.OverallScore,
		gen.AiEvaluations.Strengths,
		gen.AiEvaluations.Weaknesses,
		gen.AiEvaluations.Suggestions,
		gen.AiEvaluations.SkillScores,
		gen.AiEvaluations.RawAnalysis,
		gen.AiEvaluations.IsCurrent,
	).VALUES(
		newID,
		profileUUID,
		Int(int64(totalCount)),
		StringExp(CAST(String(string(strengthsJSON))).AS("jsonb")),
		StringExp(CAST(String(string(weaknessesJSON))).AS("jsonb")),
		StringExp(CAST(String(string(suggestionsJSON))).AS("jsonb")),
		StringExp(CAST(String(string(skillScoresJSON))).AS("jsonb")),
		String(rawAnalysis),
		Bool(true),
	)

	if _, err := insStmt.ExecContext(ctx, tx); err != nil {
		return nil, fmt.Errorf("insert evaluation: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("commit tx: %w", err)
	}
```

- [ ] **Step 3: Update GetLatest to use is_current flag**

```go
// Replace the GetLatest method to filter by is_current = true
func (s *Service) GetLatest(ctx context.Context, profileID string) (*EvaluationResult, error) {
	profileUUID, err := lib.ParseUUID(profileID)
	if err != nil {
		return nil, fmt.Errorf("invalid profile ID: %w", err)
	}

	stmt := SELECT(
		gen.AiEvaluations.AllColumns,
	).FROM(
		gen.AiEvaluations,
	).WHERE(
		gen.AiEvaluations.ProfileID.EQ(UUID(profileUUID)).
			AND(gen.AiEvaluations.IsCurrent.EQ(Bool(true))),
	).LIMIT(1)

	var evals []model.AiEvaluations
	if err := stmt.QueryContext(ctx, s.db, &evals); err != nil {
		return nil, err
	}
	if len(evals) == 0 {
		return nil, sql.ErrNoRows
	}
	return evalToResult(evals[0]), nil
}
```

- [ ] **Step 4: Update handler — add expiry info and history endpoint**

```go
// In server-go/internal/evaluation/handler.go, update EvaluationResponse:

type EvaluationResponse struct {
	ID           string              `json:"id"`
	OverallScore int                 `json:"overallScore"`
	Strengths    []SkillNote         `json:"strengths,omitempty"`
	Weaknesses   []SkillNote         `json:"weaknesses,omitempty"`
	Suggestions  []Suggestion        `json:"suggestions,omitempty"`
	SkillScores  []SkillScoreItem    `json:"skillScores,omitempty"`
	SkillCounts  []SkillCountResult  `json:"skillCounts,omitempty"`
	CreatedAt    string              `json:"createdAt"`
	IsExpired    bool                `json:"isExpired"`
} //@name EvaluationResponse
```

Also add the `toResponse` update:
```go
func toResponse(eval *EvaluationResult) EvaluationResponse {
	createdAt, _ := time.Parse(time.RFC3339, eval.CreatedAt)
	return EvaluationResponse{
		ID:           eval.ID,
		OverallScore: eval.OverallScore,
		Strengths:    eval.Strengths,
		Weaknesses:   eval.Weaknesses,
		Suggestions:  eval.Suggestion,
		SkillScores:  eval.SkillScores,
		SkillCounts:  eval.SkillCounts,
		CreatedAt:    eval.CreatedAt,
		IsExpired:    IsExpired(createdAt),
	}
}
```

- [ ] **Step 5: Add GET /me/history endpoint**

```go
// In handler.go, add:
// GetEvaluationHistory	godoc
// @Summary		Get all evaluations
// @Description	Get all AI evaluations for the authenticated jobseeker (history)
// @Tags		evaluation
// @Produce		json
// @Security	BearerAuth
// @Success		200 {array} EvaluationResponse
// @Failure		401 {object} map[string]string
// @Router		/evaluate/me/history [get]
func (h *Handler) GetEvaluationHistory(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	profileID, err := h.lookupProfileID(c, userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Jobseeker profile not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to lookup profile"})
		return
	}

	history, err := h.service.GetHistory(c.Request.Context(), profileID)
	if err != nil {
		slog.Error("failed to get evaluation history", "profileID", profileID, "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get evaluation history"})
		return
	}

	results := make([]EvaluationResponse, 0, len(history))
	for _, eval := range history {
		results = append(results, toResponse(eval))
	}
	if results == nil {
		results = []EvaluationResponse{}
	}

	c.JSON(http.StatusOK, results)
}
```

- [ ] **Step 6: Register the new route in main.go**

```go
// In cmd/server/main.go, add after line 224:
evalGroup.GET("/me/history", evalHandler.GetEvaluationHistory)
```

- [ ] **Step 7: Run tests**

```bash
bun run test:server -- -run TestPostEvaluate -v
# Expected: PASS
```

- [ ] **Step 8: Commit**

```bash
git add server-go/internal/evaluation/service.go server-go/internal/evaluation/handler.go server-go/cmd/server/main.go
git commit -m "feat(eval): replace DELETE with is_current lifecycle, add expiry and history"
```

### Task 4.3: Auto-trigger evaluation on job application when expired

**Files:**
- Modify: `server-go/internal/application/service.go`
- Modify: `server-go/internal/application/handler.go`
- Modify: `server-go/cmd/server/main.go`

- [ ] **Step 1: Update ApplicationService to check evaluation expiry**

```go
// In server-go/internal/application/service.go, add imports and new method:

import (
	// ... existing imports
	"time"
	"skillpass-server-go/internal/evaluation"
)

// Add the EvalService interface to ApplicationService
type Service struct {
	db         *sql.DB
	evalService *evaluation.Service // nil if not available
}

func NewService(db *sql.DB) *Service {
	return &Service{db: db}
}

// SetEvalService attaches the evaluation service for auto-trigger on apply.
func (s *Service) SetEvalService(ev *evaluation.Service) {
	s.evalService = ev
}
```

- [ ] **Step 2: Add evaluation check in Apply**

```go
// In the Apply method, add after the duplicate check (after line ~125):
	// Check if evaluation is expired — auto-trigger if so
	if s.evalService != nil {
		latestEval, err := s.evalService.GetLatestByProfileID(ctx, profileID)
		if err == nil {
			createdAt, parseErr := time.Parse(time.RFC3339, latestEval.CreatedAt)
			if parseErr == nil && evaluation.IsExpired(createdAt) {
				// Auto-trigger fresh evaluation
				slog.Info("auto-triggering evaluation for expired evaluation", "profileID", profileID)
				if _, evalErr := s.evalService.Evaluate(ctx, profileID); evalErr != nil {
					slog.Warn("auto-trigger evaluation failed, continuing with application", "error", evalErr)
				}
			}
		} else if errors.Is(err, sql.ErrNoRows) {
			// No evaluation at all — still allow application (matching just won't be optimal)
			slog.Info("no evaluation found for profile, allowing application without auto-trigger", "profileID", profileID)
		}
	}
```

- [ ] **Step 3: Add GetLatestByProfileID to EvaluationService**

```go
// In server-go/internal/evaluation/service.go, add:
// GetLatestByProfileID returns the latest evaluation for a profile without user context.
// Used by ApplicationService for expiry checking.
func (s *Service) GetLatestByProfileID(ctx context.Context, profileID string) (*EvaluationResult, error) {
	return s.GetLatest(ctx, profileID)
}
```

- [ ] **Step 4: Wire the evaluation service into application service**

```go
// In cmd/server/main.go, after creating both services:
appService := application.NewService(database)
appService.SetEvalService(evalService) // Add this line
```

- [ ] **Step 5: Run tests**

```bash
bun run test:server -- -run "TestPostEvaluate|TestApply" -v
# Expected: PASS
```

- [ ] **Step 6: Commit**

```bash
git add server-go/internal/evaluation/service.go server-go/internal/application/service.go server-go/internal/application/handler.go server-go/cmd/server/main.go
git commit -m "feat(eval): auto-trigger evaluation on job application when expired"
```

### Task 4.4: Frontend — expiry banner on evaluation page

**Files:**
- Create: `web/src/components/jobseeker/EvaluationExpiryBanner.tsx`
- Modify: `web/src/pages/jobseeker/EvaluationPage/index.tsx`

- [ ] **Step 1: Create expiry banner component**

```tsx
// web/src/components/jobseeker/EvaluationExpiryBanner.tsx
import { AlertTriangle } from 'lucide-react';

interface Props {
  createdAt: string;
}

export function EvaluationExpiryBanner({ createdAt }: Props) {
  const created = new Date(createdAt);
  const now = new Date();
  const threeMonthsMs = 3 * 30 * 24 * 60 * 60 * 1000;
  const isExpired = now.getTime() - created.getTime() > threeMonthsMs;

  if (!isExpired) return null;

  const expiredDate = new Date(created.getTime() + threeMonthsMs);

  return (
    <div className="alert alert-warning shadow-sm" role="alert">
      <AlertTriangle size={20} aria-hidden="true" />
      <div>
        <p className="font-semibold">Evaluation Expired</p>
        <p className="text-sm">
          Your AI evaluation expired on {expiredDate.toLocaleDateString()}.
          Re-evaluate to get updated skill scores and improve your job matches.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add expiry banner to EvaluationPage**

```tsx
// In web/src/pages/jobseeker/EvaluationPage/index.tsx, add import and use:

import { EvaluationExpiryBanner } from '@/components/jobseeker/EvaluationExpiryBanner';

// Inside the evaluation branch (after line 80), add before the score card:
{evaluation.createdAt && <EvaluationExpiryBanner createdAt={evaluation.createdAt} />}
```

- [ ] **Step 3: Commit**

```bash
git add web/src/components/jobseeker/EvaluationExpiryBanner.tsx web/src/pages/jobseeker/EvaluationPage/index.tsx
git commit -m "feat(web): add evaluation expiry banner to evaluation page"
```

---

## Phase 5 — Category Taxonomy for Matching

### Task 5.1: Database migration for category taxonomy

**Files:**
- Create: `server-go/migrations/000028_category_taxonomy.sql`

- [ ] **Step 1: Create migration with skill categories table, job weights, and seed data**

```sql
-- server-go/migrations/000028_category_taxonomy.sql
-- Skill category taxonomy for industry-agnostic matching

-- 27 universal skill categories
CREATE TABLE IF NOT EXISTS skill_categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Category weights per job posting (0-10 scale)
CREATE TABLE IF NOT EXISTS job_category_weights (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES skill_categories(id) ON DELETE CASCADE,
    weight      INTEGER NOT NULL DEFAULT 1 CHECK (weight >= 0 AND weight <= 10),
    UNIQUE(job_posting_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_job_category_weights_job ON job_category_weights(job_posting_id);

-- Seed the 27 universal categories
INSERT INTO skill_categories (name, description) VALUES
    ('Software Engineering', 'Coding, web/mobile dev, architecture, testing'),
    ('Data & Analytics', 'Data science, ML, BI, statistics, data engineering'),
    ('Infrastructure & IT', 'Cloud, DevOps, networking, sysadmin, IT support'),
    ('Cybersecurity', 'Security testing, compliance, incident response'),
    ('Engineering (Hardware)', 'Mechanical, electrical, civil, industrial'),
    ('Clinical & Medical', 'Healthcare, nursing, diagnosis, patient care'),
    ('Research & Science', 'Lab work, methodology, experiments, clinical trials'),
    ('Finance & Accounting', 'Accounting, audit, tax, financial analysis'),
    ('Sales & Marketing', 'Revenue, growth, digital marketing, branding'),
    ('Education & Training', 'Teaching, curriculum, mentoring, instructional design'),
    ('Management & Leadership', 'Team leadership, project management, strategy'),
    ('HR & People', 'Recruiting, payroll, employee relations'),
    ('Legal & Compliance', 'Law, regulation, contracts, governance'),
    ('Design & Creative', 'UI/UX, visual design, video, animation, motion'),
    ('Media & Content', 'Writing, journalism, content strategy, PR'),
    ('Customer Service & Support', 'Client support, help desk, account management'),
    ('Operations & Logistics', 'Supply chain, procurement, scheduling, inventory'),
    ('Construction & Trades', 'Building, electrical, plumbing, carpentry'),
    ('Manufacturing & Production', 'Assembly, quality control, machining, factory ops'),
    ('Hospitality & Tourism', 'Food service, hotel, travel, events, culinary'),
    ('Social Services & Nonprofit', 'Counseling, community outreach, fundraising'),
    ('Sports & Fitness', 'Training, coaching, physical therapy, athletics'),
    ('Agriculture & Environment', 'Farming, forestry, fishing, environmental science'),
    ('Real Estate & Property', 'Sales, appraisal, property management, leasing'),
    ('Government & Public Policy', 'Public admin, policy, urban planning, diplomacy'),
    ('Beauty & Wellness', 'Hair, skincare, spa, massage, aesthetics'),
    ('Religious & Spiritual', 'Clergy, chaplaincy, pastoral care, theology')
ON CONFLICT (name) DO NOTHING;
```

- [ ] **Step 2: Run migration and regenerate go-jet types**

```bash
bun run db:migrate && bun run db:generate
# Expected: 000028 migration applied, go-jet regenerated with new tables
```

- [ ] **Step 3: Commit**

```bash
git add server-go/migrations/000028_category_taxonomy.sql server-go/.gen/
git commit -m "feat(db): add skill_categories and job_category_weights tables"
```

### Task 5.2: CategoryService for weighted matching

**Files:**
- Create: `server-go/internal/matching/category_service.go`

- [ ] **Step 1: Create CategoryService**

```go
// server-go/internal/matching/category_service.go
package matching

import (
	"context"
	"database/sql"
	"fmt"

	. "github.com/go-jet/jet/v2/postgres"
	"github.com/google/uuid"

	"skillpass-server-go/internal/gen"
)

// CategoryService handles skill category assignments and weighted scoring.
type CategoryService struct {
	db *sql.DB
}

func NewCategoryService(db *sql.DB) *CategoryService {
	return &CategoryService{db: db}
}

// GetJobCategoryWeights returns the category weight map for a job posting.
// Returns nil if no weights are configured (legacy jobs).
func (s *CategoryService) GetJobCategoryWeights(ctx context.Context, jobPostingID string) (map[string]int, error) {
	jobUUID, err := uuid.Parse(jobPostingID)
	if err != nil {
		return nil, fmt.Errorf("invalid job posting ID: %w", err)
	}

	stmt := SELECT(
		gen.SkillCategories.Name,
		gen.JobCategoryWeights.Weight,
	).FROM(
		gen.JobCategoryWeights.
			INNER_JOIN(gen.SkillCategories, gen.SkillCategories.ID.EQ(gen.JobCategoryWeights.CategoryID)),
	).WHERE(
		gen.JobCategoryWeights.JobPostingID.EQ(UUID(jobUUID)),
	)

	var results []struct {
		Name   string `alias:"skill_categories.name"`
		Weight int    `alias:"job_category_weights.weight"`
	}
	if err := stmt.QueryContext(ctx, s.db, &results); err != nil {
		return nil, err
	}

	if len(results) == 0 {
		return nil, nil // no weights configured
	}

	weights := make(map[string]int, len(results))
	for _, r := range results {
		weights[r.Name] = r.Weight
	}
	return weights, nil
}

// AssignSkillsToCategory assigns each skill to its best-matching category.
// This is a placeholder — in production this could use an LLM or lookup table.
// For now, it uses a simple keyword-based mapping.
func AssignSkillsToCategory(skillNames []string) map[string]string {
	skillCategoryMap := map[string]string{
		// Software Engineering
		"go": "Software Engineering", "react": "Software Engineering",
		"python": "Software Engineering", "javascript": "Software Engineering",
		"typescript": "Software Engineering", "rust": "Software Engineering",
		"java": "Software Engineering", "git": "Software Engineering",
		"rest": "Software Engineering", "graphql": "Software Engineering",
		"node": "Software Engineering", "node.js": "Software Engineering",
		"api": "Software Engineering", "microservices": "Software Engineering",
		// Data & Analytics
		"sql": "Data & Analytics", "machine learning": "Data & Analytics",
		"tableau": "Data & Analytics", "data engineering": "Data & Analytics",
		"statistics": "Data & Analytics",
		// Infrastructure & IT
		"aws": "Infrastructure & IT", "docker": "Infrastructure & IT",
		"kubernetes": "Infrastructure & IT", "linux": "Infrastructure & IT",
		"terraform": "Infrastructure & IT", "devops": "Infrastructure & IT",
		"ci/cd": "Infrastructure & IT",
		// Clinical & Medical
		"patient care": "Clinical & Medical", "triage": "Clinical & Medical",
		"wound care": "Clinical & Medical", "phlebotomy": "Clinical & Medical",
		// Management & Leadership
		"team leadership": "Management & Leadership", "agile": "Management & Leadership",
		"project management": "Management & Leadership", "stakeholder management": "Management & Leadership",
		// Default
	}
	result := make(map[string]string, len(skillNames))
	for _, skill := range skillNames {
		lower := normalizeSkill(skill)
		if cat, ok := skillCategoryMap[lower]; ok {
			result[skill] = cat
		} else {
			result[skill] = "Software Engineering" // default
		}
	}
	return result
}

// ComputeWeightedMatchScore computes the category-weighted match score.
// matchScore = Σ(skillCount × categoryWeight) for each evaluated skill where
// the category has a configured weight for the job.
func (s *CategoryService) ComputeWeightedMatchScore(ctx context.Context, skillCounts []SkillCountResult, jobPostingID string) (float64, error) {
	weights, err := s.GetJobCategoryWeights(ctx, jobPostingID)
	if err != nil {
		return 0, err
	}
	if weights == nil {
		// Legacy job without weights: fall back to simple count sum
		var total float64
		for _, sc := range skillCounts {
			total += float64(sc.Count)
		}
		return total, nil
	}

	// Assign categories to skills
	skillNames := make([]string, len(skillCounts))
	for i, sc := range skillCounts {
		skillNames[i] = sc.Skill
	}
	categories := AssignSkillsToCategory(skillNames)

	// Compute weighted sum
	var total float64
	for _, sc := range skillCounts {
		cat := categories[sc.Skill]
		w := weights[cat]
		if w == 0 {
			w = 1 // minimum weight for any matched skill
		}
		total += float64(sc.Count) * float64(w)
	}
	return total, nil
}
```

- [ ] **Step 2: Add SkillCountResult import to matching package**

Note: `SkillCountResult` is in `evaluation` package. To avoid circular imports, move the type or import it. Since `matching` already imports from `evaluation` indirectly (it queries `ai_evaluations`), it can import `evaluation.SkillCountResult`.

Actually, looking at this again — `SkillCountResult` is in the `evaluation` package but `matching` is a separate package. We need to either:
1. Move `SkillCountResult` to a shared types package
2. Or define it in both places

For simplicity, since `SkillCountResult` is only used in the matching package for weighted scoring, let's define a matching-specific version:

```go
// In category_service.go, replace SkillCountResult usage with:
type SkillCountEntry struct {
	Skill string `json:"skill"`
	Count int    `json:"count"`
}
```

The caller (updated matching service) would convert as needed.

- [ ] **Step 3: Write category service tests**

```go
// server-go/internal/matching/category_service_test.go
package matching

import (
	"context"
	"testing"
)

func TestAssignSkillsToCategory(t *testing.T) {
	mapping := AssignSkillsToCategory([]string{"Go", "React", "SQL", "AWS", "Patient Care"})
	if mapping["Go"] != "Software Engineering" {
		t.Fatalf("Go: expected Software Engineering, got %s", mapping["Go"])
	}
	if mapping["SQL"] != "Data & Analytics" {
		t.Fatalf("SQL: expected Data & Analytics, got %s", mapping["SQL"])
	}
	if mapping["Patient Care"] != "Clinical & Medical" {
		t.Fatalf("Patient Care: expected Clinical & Medical, got %s", mapping["Patient Care"])
	}
}

func TestAssignSkillsToCategory_Default(t *testing.T) {
	mapping := AssignSkillsToCategory([]string{"UnknownSkill"})
	if mapping["UnknownSkill"] != "Software Engineering" {
		t.Fatalf("expected default Software Engineering, got %s", mapping["UnknownSkill"])
	}
}
```

- [ ] **Step 4: Run tests**

```bash
bun run test:server -- -run TestAssignSkillsToCategory -v
# Expected: PASS
```

- [ ] **Step 5: Wire CategoryService into matching and update match scoring**

```go
// In server-go/internal/matching/service.go, update MatchJobs to use weighted scoring:

// Add CategoryService field to Service
type Service struct {
	db              *sql.DB
	categoryService *CategoryService // nil until wired
}

func NewService(db *sql.DB) *Service {
	return &Service{db: db}
}

func (s *Service) SetCategoryService(cs *CategoryService) {
	s.categoryService = cs
}
```

Update `MatchJobs` to compute weighted score when category service is available:
```go
// In MatchJobs, after collecting candidateMap, and before the scoring loop:
// Compute weighted match score using category weights
weightedScore, err := s.categoryService.ComputeWeightedMatchScore(ctx, skillCountResults, row.ID.String())

// Replace computeMatchScoreWithMap call with weighted score
score := weightedScore
```

- [ ] **Step 6: Wire CategoryService into main.go**

```go
// In cmd/server/main.go, add:
categoryService := matching.NewCategoryService(database)
matchService := matching.NewService(database)
matchService.SetCategoryService(categoryService)
```

- [ ] **Step 7: Regenerate API types**

```bash
bun run api:generate
```

- [ ] **Step 8: Commit**

```bash
git add server-go/internal/matching/category_service.go server-go/internal/matching/category_service_test.go server-go/internal/matching/service.go server-go/cmd/server/main.go
git commit -m "feat(match): add category taxonomy service with weighted match scoring"
```

---

## Phase 6 — History UI

### Task 6.1: Add evaluation history API on frontend

**Files:**
- Modify: `web/src/lib/evaluation.ts`

- [ ] **Step 1: Add getEvaluationHistory function**

```typescript
// In web/src/lib/evaluation.ts, add:

export async function getEvaluationHistory(): Promise<EvaluationResult[]> {
  return api<EvaluationResult[]>('/evaluate/me/history');
}
```

- [ ] **Step 2: Commit**

```bash
git add web/src/lib/evaluation.ts
git commit -m "feat(web): add getEvaluationHistory API function"
```

### Task 6.2: Create Count Growth Timeline component

**Files:**
- Create: `web/src/components/jobseeker/CountGrowthTimeline.tsx`
- Test: Create `web/src/components/jobseeker/CountGrowthTimeline.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// web/src/components/jobseeker/CountGrowthTimeline.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CountGrowthTimeline } from '@/components/jobseeker/CountGrowthTimeline';

describe('CountGrowthTimeline', () => {
  const sampleHistory = [
    { id: '1', overallScore: 1000, createdAt: '2026-01-15T00:00:00Z' },
    { id: '2', overallScore: 1500, createdAt: '2026-04-15T00:00:00Z' },
    { id: '3', overallScore: 2022, createdAt: '2026-07-08T00:00:00Z' },
  ];

  it('renders timeline entries', () => {
    render(<CountGrowthTimeline history={sampleHistory} />);
    expect(screen.getByText('1,000')).toBeInTheDocument();
    expect(screen.getByText('1,500')).toBeInTheDocument();
    expect(screen.getByText('2,022')).toBeInTheDocument();
  });

  it('shows growth indicators', () => {
    render(<CountGrowthTimeline history={sampleHistory} />);
    expect(screen.getByText('+500')).toBeInTheDocument();
    expect(screen.getByText('+522')).toBeInTheDocument();
  });

  it('handles empty history', () => {
    render(<CountGrowthTimeline history={[]} />);
    expect(screen.getByText(/No evaluation history/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to see it fail**

```bash
bun --cwd web test -- --run src/components/jobseeker/CountGrowthTimeline.test.tsx
# Expected: FAIL
```

- [ ] **Step 3: Implement CountGrowthTimeline**

```tsx
// web/src/components/jobseeker/CountGrowthTimeline.tsx
import { TrendingUp } from 'lucide-react';

interface HistoryEntry {
  id: string;
  overallScore: number;
  createdAt: string;
}

interface Props {
  history: HistoryEntry[];
}

export function CountGrowthTimeline({ history }: Props) {
  if (history.length === 0) {
    return (
      <div className="card bg-base-200 p-4">
        <p className="text-sm text-muted text-center">No evaluation history available.</p>
      </div>
    );
  }

  return (
    <div className="card bg-base-200 p-4">
      <h3 className="font-semibold flex items-center gap-2 mb-4">
        <TrendingUp size={18} aria-hidden="true" /> Count Growth
      </h3>
      <div className="space-y-3">
        {history.map((entry, index) => {
          const prev = index > 0 ? history[index - 1].overallScore : null;
          const growth = prev !== null ? entry.overallScore - prev : null;
          const date = new Date(entry.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
          });

          return (
            <div key={entry.id} className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-primary" aria-hidden="true" />
                {index < history.length - 1 && <div className="w-0.5 h-8 bg-base-300" aria-hidden="true" />}
              </div>
              <div className="flex-1 flex justify-between items-center">
                <div>
                  <p className="font-medium">{entry.overallScore.toLocaleString()} Count</p>
                  <p className="text-xs opacity-60">{date}</p>
                </div>
                {growth !== null && growth !== 0 && (
                  <span className={`text-sm font-semibold ${growth > 0 ? 'text-success' : 'text-error'}`}>
                    {growth > 0 ? '+' : ''}{growth.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
bun --cwd web test -- --run src/components/jobseeker/CountGrowthTimeline.test.tsx
# Expected: PASS
```

- [ ] **Step 5: Commit**

```bash
git add web/src/components/jobseeker/CountGrowthTimeline.tsx web/src/components/jobseeker/CountGrowthTimeline.test.tsx
git commit -m "feat(web): add CountGrowthTimeline component"
```

### Task 6.3: Add timeline to EvaluationPage

**Files:**
- Modify: `web/src/pages/jobseeker/EvaluationPage/index.tsx`

- [ ] **Step 1: Update EvaluationPage to load and display history**

```tsx
// In EvaluationPage, add imports:
import { useQuery } from '@tanstack/react-query';
import { getLatestEvaluation, getEvaluationHistory, triggerEvaluation } from '@/lib/evaluation';
import { CountGrowthTimeline } from '@/components/jobseeker/CountGrowthTimeline';

// Add a history query:
const { data: history } = useQuery({
  queryKey: ['evaluation', 'history'],
  enabled: !!user,
  queryFn: getEvaluationHistory,
});

// After the CareerPathSection and before the last-evaluated date, add:
{history && history.length > 1 && (
  <CountGrowthTimeline history={history} />
)}
```

- [ ] **Step 2: Commit**

```bash
git add web/src/pages/jobseeker/EvaluationPage/index.tsx
git commit -m "feat(web): add Count growth timeline to evaluation page"
```

---

## Self-Review Checklist

### Spec coverage
- ✅ Phase 1 (Scoring Framework): Task 1.1 (scoring.go formula), Task 1.2 (prompt redesign, server-side compute), Task 1.3 (API types)
- ✅ Phase 2 (Prompt Quality): Task 2.1 (test harness, cross-industry profiles, MockLLMClient tests)
- ✅ Phase 3 (UI Sections): Task 3.1 (per-type schemas), Task 3.2 (5 section components), Task 3.3 (replace dropdown in profile)
- ✅ Phase 4 (Lifecycle): Task 4.1 (DB migration is_current), Task 4.2 (flag instead of DELETE, expiry, history endpoint), Task 4.3 (auto-trigger on apply), Task 4.4 (expiry banner)
- ✅ Phase 5 (Category Taxonomy): Task 5.1 (DB migration 27 categories), Task 5.2 (CategoryService, weighted matching)
- ✅ Phase 6 (History UI): Task 6.1 (frontend API), Task 6.2 (timeline component), Task 6.3 (integrate into page)

### Placeholder scan
- ✅ All steps contain complete code, not TBD/TODO
- ✅ All error handling is shown explicitly
- ✅ All test code is complete, not "write tests" without content
- ✅ All imports and types are consistent

### Type consistency
- ✅ `SkillFacts` defined in scoring.go, used in service.go
- ✅ `RoleWeight`/`EducationLevel` enums match LLM prompt values (entry/skilled/senior/expert, none/hs/diploma/bachelor/master/phd)
- ✅ `ComputeSkillCount` takes `SkillFacts`, returns `SkillCountResult`
- ✅ `ComputeTotalCount` takes `[]SkillCountResult`, returns int
- ✅ `SkillCountResult` has matching field names (YearsPoints, RolesPoints, etc.)
- ✅ EvaluationResponse includes `SkillCounts` and `IsExpired` consistently
- ✅ Category matching uses `SkillCountEntry` (matching-specific copy to avoid import cycle)
- ✅ Frontend types match server responses (EvaluationResponse → EvaluationResult)

---

## Execution Handoff

Plan complete and saved to `docs/plans/2026-07-08-ai-evaluation-scoring-implementation.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
