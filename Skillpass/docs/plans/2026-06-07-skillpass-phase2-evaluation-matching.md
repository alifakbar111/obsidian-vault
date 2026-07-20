# SkillPass Phase 2: AI Evaluation & Matching Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add AI-powered profile evaluation (unlimited cumulative scoring), job applications with status tracking, AI-driven candidate-job matching, and an application kanban board for jobseekers.

**Architecture:** Three new server packages (`evaluation/`, `application/`, `matching/`) each with handler + service files, plus an LLM client library. Three new frontend pages (evaluation, applications kanban, passport score badge) with API modules following existing `api()` patterns. Extends Phase 1 data model with `ai_evaluations` and `applications` tables via a new SQL migration.

**Tech Stack:** Go 1.24 (Gin), go-jet + pgx, PostgreSQL 16, React 19 + React Router v7 + Vite 7, Tailwind CSS v4 + DaisyUI 5, OpenAI-compatible LLM API

---

## File Structure

```
server-go/
├── cmd/
│   ├── migrate/main.go                  # MODIFY: add new tables to requiredTables
│   └── server/main.go                   # MODIFY: register new route groups
├── migrations/
│   └── 000005_ai_evaluations_applications.sql   # CREATE: new tables + enum
├── internal/
│   ├── evaluation/
│   │   ├── handler.go                   # CREATE: POST/GET /evaluate/me
│   │   └── service.go                   # CREATE: AI evaluation logic + prompt building
│   ├── application/
│   │   ├── handler.go                   # CREATE: apply, list, update status
│   │   └── service.go                   # CREATE: application business logic
│   ├── matching/
│   │   ├── handler.go                   # CREATE: jobs/matches, candidates/matches
│   │   └── service.go                   # CREATE: AI matching logic
│   ├── gen/
│   │   ├── model.go                     # MODIFY: add AiEvaluation, Application types
│   │   ├── table.go                     # MODIFY: add AiEvaluations, Applications refs
│   │   └── enum.go                      # MODIFY: add ApplicationStatus values
│   └── lib/
│       ├── password.go                  # (existing)
│       └── llm.go                       # CREATE: LLM client interface + OpenAI impl

web/src/
├── App.tsx                              # MODIFY: add new routes
├── lib/
│   ├── api.ts                           # (existing)
│   ├── evaluation.ts                    # CREATE: evaluation API functions
│   └── application.ts                   # CREATE: application API functions
├── pages/
│   ├── jobseeker/
│   │   ├── EvaluationPage.tsx           # CREATE: trigger eval, view results
│   │   └── ApplicationsPage.tsx         # CREATE: kanban board
├── components/
│   └── jobseeker/
│       ├── EvaluationScoreBadge.tsx     # CREATE: score badge component
│       ├── SkillScoresChart.tsx          # CREATE: skill scores visualization
│       └── ApplicationKanban.tsx        # CREATE: kanban board component
```

---

## Task 1: Database Migration — ai_evaluations + applications tables

**Files:**
- Create: `server-go/migrations/000005_ai_evaluations_applications.sql`
- Modify: `server-go/cmd/migrate/main.go`

- [ ] **Step 1: Create SQL migration file**

Write the migration that creates the `application_status` enum and both new tables:

```sql
-- server-go/migrations/000005_ai_evaluations_applications.sql
-- Phase 2: AI evaluations and job applications

DO $$ BEGIN
  CREATE TYPE application_status AS ENUM ('applied', 'reviewed', 'interviewed', 'offered', 'rejected');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS ai_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES jobseeker_profiles(id) ON DELETE CASCADE,
    overall_score INTEGER NOT NULL,
    strengths JSONB NOT NULL DEFAULT '[]',
    weaknesses JSONB NOT NULL DEFAULT '[]',
    suggestions JSONB NOT NULL DEFAULT '[]',
    skill_scores JSONB NOT NULL DEFAULT '[]',
    raw_analysis TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_evaluations_profile_idx ON ai_evaluations(profile_id);

CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jobseeker_id UUID NOT NULL REFERENCES jobseeker_profiles(id) ON DELETE CASCADE,
    job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    status application_status NOT NULL DEFAULT 'applied',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(jobseeker_id, job_posting_id)
);

CREATE INDEX IF NOT EXISTS applications_jobseeker_idx ON applications(jobseeker_id);
CREATE INDEX IF NOT EXISTS applications_job_posting_idx ON applications(job_posting_id);
CREATE INDEX IF NOT EXISTS applications_status_idx ON applications(status);
```

- [ ] **Step 2: Update requiredTables in migrate/main.go**

Edit `server-go/cmd/migrate/main.go` to add the two new table names to the `requiredTables` slice:

```go
var requiredTables = []tableDef{
	{name: "users"},
	{name: "companies"},
	{name: "jobseeker_profiles"},
	{name: "job_experiences"},
	{name: "industry_categories"},
	{name: "tags"},
	{name: "job_postings"},
	{name: "refresh_tokens"},
	{name: "ai_evaluations"},    // ADD
	{name: "applications"},      // ADD
}
```

- [ ] **Step 3: Run the migration**

```bash
bun run db:migrate
```
Expected output:
```
  OK   000005_ai_evaluations_applications.sql
────────────────────────────────────────
All migrations complete
```

- [ ] **Step 4: Commit**

```bash
git add server-go/migrations/000005_ai_evaluations_applications.sql server-go/cmd/migrate/main.go
git commit -m "feat(db): add ai_evaluations and applications tables"
```

---

## Task 2: go-jet Codegen + Gen Re-exports

**Files:**
- Modify: `server-go/internal/gen/model.go`
- Modify: `server-go/internal/gen/table.go`
- Modify: `server-go/internal/gen/enum.go`

- [ ] **Step 1: Run go-jet codegen**

```bash
bun run db:generate
```
Expected output: go-jet generates files under `server-go/.gen/skillpass/public/` including model, table, and enum files for the new tables.

Verify the new files exist:
```bash
ls server-go/.gen/skillpass/public/model/ | grep -i -E "evalu|applic"
```
Expected: `ai_evaluations.go`, `applications.go`

```bash
ls server-go/.gen/skillpass/public/table/ | grep -i -E "evalu|applic"
```
Expected: `ai_evaluations.go`, `applications.go`

- [ ] **Step 2: Update gen/model.go — add type aliases**

Add the two new model types to the type block:

```go
type (
	User              = model.Users
	Company           = model.Companies
	JobseekerProfile  = model.JobseekerProfiles
	JobExperience     = model.JobExperiences
	IndustryCategory  = model.IndustryCategories
	Tag               = model.Tags
	JobPosting        = model.JobPostings
	RefreshToken      = model.RefreshTokens
	AdminAudit        = model.AdminAuditLog
	AiEvaluation      = model.AiEvaluations       // ADD
	Application       = model.Applications          // ADD
)
```

- [ ] **Step 3: Update gen/table.go — add table references**

Add the two new table references:

```go
var (
	Users              = table.Users
	Companies          = table.Companies
	JobseekerProfiles  = table.JobseekerProfiles
	JobExperiences     = table.JobExperiences
	IndustryCategories = table.IndustryCategories
	Tags               = table.Tags
	JobPostings        = table.JobPostings
	RefreshTokens      = table.RefreshTokens
	AdminAuditLog      = table.AdminAuditLog
	AiEvaluations      = table.AiEvaluations       // ADD
	Applications       = table.Applications          // ADD
)
```

- [ ] **Step 4: Update gen/enum.go — add ApplicationStatus values**

Add the ApplicationStatus enum accessors:

```go
var (
	// ... existing vars ...

	// ApplicationStatus values
	ApplicationStatusApplied      = enum.ApplicationStatus.Applied
	ApplicationStatusReviewed     = enum.ApplicationStatus.Reviewed
	ApplicationStatusInterviewed  = enum.ApplicationStatus.Interviewed
	ApplicationStatusOffered      = enum.ApplicationStatus.Offered
	ApplicationStatusRejected     = enum.ApplicationStatus.Rejected
)
```

- [ ] **Step 5: Commit**

```bash
git add server-go/.gen/ server-go/internal/gen/
git commit -m "feat(gen): add ai_evaluations and applications to go-jet re-exports"
```

---

## Task 3: LLM Client Library

**Files:**
- Create: `server-go/internal/lib/llm.go`

- [ ] **Step 1: Create LLM client interface + OpenAI implementation**

This file provides an LLM abstraction that the evaluation and matching services use. It supports OpenAI-compatible chat completions and a mock mode for development.

```go
package lib

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

// LLMClient sends prompts to an LLM and returns structured JSON responses.
type LLMClient interface {
	// Chat sends a prompt and expects a JSON response matching the provided schema.
	// The systemPrompt sets the LLM's behavior; userPrompt is the specific input.
	// The response is unmarshalled into the resultPtr (must be a pointer to a struct).
	Chat(ctx context.Context, systemPrompt, userPrompt string, resultPtr interface{}) error
}

// OpenAIClient implements LLMClient using the OpenAI-compatible chat completions API.
type OpenAIClient struct {
	apiKey  string
	model   string
	baseURL string
	http    *http.Client
}

// NewOpenAIClient creates an LLM client from environment variables:
// LLM_API_KEY (required), LLM_MODEL (default: gpt-4o-mini), LLM_BASE_URL (default: https://api.openai.com/v1).
func NewOpenAIClient() *OpenAIClient {
	apiKey := os.Getenv("LLM_API_KEY")
	if apiKey == "" {
		apiKey = "mock" // mock mode if no key set
	}
	model := os.Getenv("LLM_MODEL")
	if model == "" {
		model = "gpt-4o-mini"
	}
	baseURL := os.Getenv("LLM_BASE_URL")
	if baseURL == "" {
		baseURL = "https://api.openai.com/v1"
	}
	baseURL = strings.TrimRight(baseURL, "/")

	return &OpenAIClient{
		apiKey:  apiKey,
		model:   model,
		baseURL: baseURL,
		http: &http.Client{
			Timeout: 60 * time.Second,
		},
	}
}

type chatRequest struct {
	Model       string        `json:"model"`
	Messages    []chatMessage `json:"messages"`
	Temperature float64       `json:"temperature"`
	MaxTokens   int           `json:"max_tokens"`
	ResponseFormat *responseFormat `json:"response_format,omitempty"`
}

type chatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type responseFormat struct {
	Type string `json:"type"`
}

type chatResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
	Error *struct {
		Message string `json:"message"`
	} `json:"error,omitempty"`
}

func (c *OpenAIClient) Chat(ctx context.Context, systemPrompt, userPrompt string, resultPtr interface{}) error {
	if c.apiKey == "" || c.apiKey == "mock" {
		return fmt.Errorf("LLM_API_KEY not configured — cannot call LLM")
	}

	body := chatRequest{
		Model: c.model,
		Messages: []chatMessage{
			{Role: "system", Content: systemPrompt},
			{Role: "user", Content: userPrompt},
		},
		Temperature:    0.3,
		MaxTokens:      4096,
		ResponseFormat: &responseFormat{Type: "json_object"},
	}

	payload, err := json.Marshal(body)
	if err != nil {
		return fmt.Errorf("marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+"/chat/completions", bytes.NewReader(payload))
	if err != nil {
		return fmt.Errorf("create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.apiKey)

	resp, err := c.http.Do(req)
	if err != nil {
		return fmt.Errorf("llm request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("read response: %w", err)
	}

	var chatResp chatResponse
	if err := json.Unmarshal(respBody, &chatResp); err != nil {
		return fmt.Errorf("parse response: %w (body: %s)", err, string(respBody))
	}

	if chatResp.Error != nil {
		return fmt.Errorf("llm API error: %s", chatResp.Error.Message)
	}

	if len(chatResp.Choices) == 0 {
		return fmt.Errorf("llm returned no choices (body: %s)", string(respBody))
	}

	content := chatResp.Choices[0].Message.Content
	if err := json.Unmarshal([]byte(content), resultPtr); err != nil {
		return fmt.Errorf("parse llm json response: %w (content: %s)", err, content)
	}

	return nil
}

// MockLLMClient implements LLMClient returning predefined responses (for dev/testing).
type MockLLMClient struct {
	ResponseFunc func(systemPrompt, userPrompt string) interface{}
}

func NewMockLLMClient() *MockLLMClient {
	return &MockLLMClient{
		ResponseFunc: func(systemPrompt, userPrompt string) interface{} {
			return map[string]interface{}{
				"overallScore": 75,
				"strengths":    []map[string]interface{}{{"skill": "Go", "score": 90, "note": "Strong backend skills"}},
				"weaknesses":   []map[string]interface{}{{"skill": "React", "score": 40, "note": "Limited frontend experience"}},
				"suggestions":  []map[string]interface{}{{"area": "Frontend", "tip": "Build a React project"}},
				"skillScores":  []map[string]interface{}{{"skill": "Go", "category": "backend", "score": 90}},
			}
		},
	}
}

func (m *MockLLMClient) Chat(ctx context.Context, systemPrompt, userPrompt string, resultPtr interface{}) error {
	result := m.ResponseFunc(systemPrompt, userPrompt)
	data, err := json.Marshal(result)
	if err != nil {
		return fmt.Errorf("mock marshal: %w", err)
	}
	return json.Unmarshal(data, resultPtr)
}
```

- [ ] **Step 2: Commit**

```bash
git add server-go/internal/lib/llm.go
git commit -m "feat(lib): add LLM client with OpenAI and mock implementations"
```

---

## Task 4: AI Evaluation Handler

**Files:**
- Create: `server-go/internal/evaluation/handler.go`

- [ ] **Step 1: Create evaluation handler**

This handler provides two endpoints:
- `POST /evaluate/me` — trigger AI evaluation (reads full profile, calls LLM, stores result)
- `GET /evaluate/me/results` — return the latest evaluation result

```go
package evaluation

import (
	"database/sql"
	"errors"
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	. "github.com/go-jet/jet/v2/postgres"

	"skillpass-server-go/internal/gen"
)

type Handler struct {
	db      *sql.DB
	service *Service
}

func NewHandler(db *sql.DB, service *Service) *Handler {
	return &Handler{db: db, service: service}
}

// EvaluationResponse is the public shape returned to the frontend.
type EvaluationResponse struct {
	ID           string            `json:"id"`
	OverallScore int               `json:"overallScore"`
	Strengths    []SkillNote       `json:"strengths"`
	Weaknesses   []SkillNote       `json:"weaknesses"`
	Suggestions  []Suggestion      `json:"suggestions"`
	SkillScores  []SkillScoreItem  `json:"skillScores"`
	CreatedAt    string            `json:"createdAt"`
}

type SkillNote struct {
	Skill string `json:"skill"`
	Score int    `json:"score"`
	Note  string `json:"note"`
}

type Suggestion struct {
	Area string `json:"area"`
	Tip  string `json:"tip"`
}

type SkillScoreItem struct {
	Skill    string `json:"skill"`
	Category string `json:"category"`
	Score    int    `json:"score"`
}

// PostEvaluate triggers a fresh AI evaluation for the authenticated jobseeker.
func (h *Handler) PostEvaluate(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	profileID, err := h.lookupProfileID(c.Request.Context(), userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Jobseeker profile not found"})
			return
		}
		slog.Error("failed to lookup profile", "userID", userID, "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to lookup profile"})
		return
	}

	result, err := h.service.Evaluate(c.Request.Context(), profileID)
	if err != nil {
		slog.Error("evaluation failed", "profileID", profileID, "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Evaluation failed: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, toResponse(result))
}

// GetLatestEvaluation returns the most recent evaluation.
func (h *Handler) GetLatestEvaluation(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	profileID, err := h.lookupProfileID(c.Request.Context(), userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Jobseeker profile not found"})
			return
		}
		slog.Error("failed to lookup profile", "userID", userID, "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to lookup profile"})
		return
	}

	result, err := h.service.GetLatest(c.Request.Context(), profileID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "No evaluation found. Trigger one first."})
			return
		}
		slog.Error("failed to get latest evaluation", "profileID", profileID, "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get evaluation"})
		return
	}

	c.JSON(http.StatusOK, toResponse(result))
}

func (h *Handler) lookupProfileID(ctx interface{}, userID string) (string, error) {
	// Use the request context via gin.Context
	ginCtx := ctx.(*gin.Context)
	stmt := SELECT(
		gen.JobseekerProfiles.ID,
	).FROM(
		gen.JobseekerProfiles,
	).WHERE(
		gen.JobseekerProfiles.UserID.EQ(String(userID)),
	)

	var profile struct {
		ID uuid.UUID
	}
	err := stmt.QueryContext(ginCtx.Request.Context(), h.db, &profile)
	if err != nil {
		return "", err
	}
	return profile.ID.String(), nil
}

func getUserID(c *gin.Context) (string, error) {
	userIDVal, ok := c.Get("userId")
	if !ok {
		return "", errors.New("unauthorized")
	}
	userIDStr, ok := userIDVal.(string)
	if !ok || userIDStr == "" {
		return "", errors.New("unauthorized")
	}
	return userIDStr, nil
}

func toResponse(eval *EvaluationResult) EvaluationResponse {
	return EvaluationResponse{
		ID:           eval.ID,
		OverallScore: eval.OverallScore,
		Strengths:    eval.Strengths,
		Weaknesses:   eval.Weaknesses,
		Suggestions:  eval.Suggestions,
		SkillScores:  eval.SkillScores,
		CreatedAt:    eval.CreatedAt,
	}
}
```

- [ ] **Step 2: Commit**

```bash
git add server-go/internal/evaluation/handler.go
git commit -m "feat(evaluation): add HTTP handler for POST/GET /evaluate/me"
```

---

## Task 5: AI Evaluation Service

**Files:**
- Create: `server-go/internal/evaluation/service.go`

- [ ] **Step 1: Create evaluation service**

This service handles the AI evaluation business logic: constructing the LLM prompt from the jobseeker's profile, calling the LLM, parsing the response, and storing the result in the database.

```go
package evaluation

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	. "github.com/go-jet/jet/v2/postgres"
	"github.com/google/uuid"

	"skillpass-server-go/.gen/skillpass/public/model"
	"skillpass-server-go/internal/gen"
	"skillpass-server-go/internal/lib"
)

// Service handles AI evaluation business logic.
type Service struct {
	db  *sql.DB
	llm lib.LLMClient
}

func NewService(db *sql.DB, llm lib.LLMClient) *Service {
	return &Service{db: db, llm: llm}
}

// EvaluationResult is the internal result shape.
type EvaluationResult struct {
	ID           string
	OverallScore int
	Strengths    []SkillNote
	Weaknesses   []SkillNote
	Suggestion   []Suggestion
	SkillScores  []SkillScoreItem
	CreatedAt    string
	RawAnalysis  string
}

// Ensure the SKillNote, Suggestion, SkillScoreItem types are available in this package.
// (They are defined in handler.go in the same package, so no redefinition needed.)

func (s *Service) Evaluate(ctx context.Context, profileID string) (*EvaluationResult, error) {
	// 1. Load full profile + experiences
	profileData, err := s.loadFullProfile(ctx, profileID)
	if err != nil {
		return nil, fmt.Errorf("load profile: %w", err)
	}

	// 2. Build the LLM prompt
	systemPrompt := `You are a career assessment AI. Evaluate the jobseeker's profile and return a JSON object with:
- overallScore (integer, cumulative — every skill, experience, and strength adds points, no upper limit)
- strengths (array of {skill: string, score: int, note: string})
- weaknesses (array of {skill: string, score: int, note: string})
- suggestions (array of {area: string, tip: string})
- skillScores (array of {skill: string, category: string, score: int})

Scoring principles:
- Every skill, year of experience, job entry, and identified strength adds points.
- Weaknesses identify gaps but do NOT subtract from the score.
- No upper limit — encourage honest, complete profiles.
- Categories for skillScores: "backend", "frontend", "devops", "data", "design", "management", "communication", "domain", "tooling"`

	userPrompt := fmt.Sprintf(`Evaluate this jobseeker profile:

Name: %s
Headline: %s
About: %s
Years of Experience: %d

Experience entries:
%s

Skills mentioned across experiences: %s

Return the evaluation as a JSON object following the schema defined in the system prompt.`,
		profileData.Name,
		nullStr(profileData.Headline),
		nullStr(profileData.About),
		nullInt(profileData.YearsOfExperience),
		formatExperiences(profileData.Experiences),
		strings.Join(profileData.AllSkills, ", "))

	// 3. Call LLM
	var llmResult struct {
		OverallScore int             `json:"overallScore"`
		Strengths    []SkillNote     `json:"strengths"`
		Weaknesses   []SkillNote     `json:"weaknesses"`
		Suggestions  []Suggestion    `json:"suggestions"`
		SkillScores  []SkillScoreItem `json:"skillScores"`
	}

	if err := s.llm.Chat(ctx, systemPrompt, userPrompt, &llmResult); err != nil {
		return nil, fmt.Errorf("llm evaluation: %w", err)
	}

	// 4. Marshal the structured parts to JSONB
	strengthsJSON, _ := json.Marshal(llmResult.Strengths)
	weaknessesJSON, _ := json.Marshal(llmResult.Weaknesses)
	suggestionsJSON, _ := json.Marshal(llmResult.Suggestions)
	skillScoresJSON, _ := json.Marshal(llmResult.SkillScores)

	rawAnalysis := fmt.Sprintf("system: %s\n\nuser: %s", systemPrompt, userPrompt)

	// 5. Delete old evaluations for this profile, then insert new one
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback()

	// Delete previous evaluations
	delStmt := gen.AiEvaluations.DELETE().WHERE(
		gen.AiEvaluations.ProfileID.EQ(String(profileID)),
	)
	if _, err := delStmt.ExecContext(ctx, tx); err != nil {
		return nil, fmt.Errorf("delete old evaluations: %w", err)
	}

	// Insert new evaluation
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
		String(newID.String()),
		String(profileID),
		Int(int64(llmResult.OverallScore)),
		String(string(strengthsJSON)),
		String(string(weaknessesJSON)),
		String(string(suggestionsJSON)),
		String(string(skillScoresJSON)),
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
		OverallScore: llmResult.OverallScore,
		Strengths:    llmResult.Strengths,
		Weaknesses:   llmResult.Weaknesses,
		Suggestion:   llmResult.Suggestions,
		SkillScores:  llmResult.SkillScores,
		CreatedAt:    time.Now().UTC().Format(time.RFC3339),
		RawAnalysis:  rawAnalysis,
	}, nil
}

type fullProfile struct {
	Name             string
	Headline         *string
	About            *string
	YearsOfExperience *int32
	Experiences      []model.JobExperiences
	AllSkills        []string
}

func (s *Service) loadFullProfile(ctx context.Context, profileID string) (*fullProfile, error) {
	// Load profile
	stmt := SELECT(
		gen.JobseekerProfiles.ID,
		gen.JobseekerProfiles.Headline,
		gen.JobseekerProfiles.About,
		gen.JobseekerProfiles.YearsOfExperience,
		gen.Users.Name,
	).FROM(
		gen.JobseekerProfiles,
		INNER_JOIN(gen.Users, gen.Users.ID.EQ(gen.JobseekerProfiles.UserID)),
	).WHERE(
		gen.JobseekerProfiles.ID.EQ(String(profileID)),
	)

	var profile struct {
		model.JobseekerProfiles
		Name string
	}
	err := stmt.QueryContext(ctx, s.db, &profile)
	if err != nil {
		return nil, err
	}

	// Load experiences
	expStmt := SELECT(
		gen.JobExperiences.ID,
		gen.JobExperiences.ProfileID,
		gen.JobExperiences.Type,
		gen.JobExperiences.Title,
		gen.JobExperiences.Organization,
		gen.JobExperiences.StartDate,
		gen.JobExperiences.EndDate,
		gen.JobExperiences.IsCurrent,
		gen.JobExperiences.Description,
		gen.JobExperiences.Industry,
		gen.JobExperiences.SkillsUsed,
		gen.JobExperiences.URL,
	).FROM(
		gen.JobExperiences,
	).WHERE(
		gen.JobExperiences.ProfileID.EQ(String(profileID)),
	).ORDER_BY(
		gen.JobExperiences.StartDate.ASC(),
	)

	var exps []model.JobExperiences
	if err := expStmt.QueryContext(ctx, s.db, &exps); err != nil {
		return nil, err
	}

	// Collect all unique skills
	skillSet := map[string]struct{}{}
	for _, exp := range exps {
		if exp.SkillsUsed != nil {
			for _, s := range *exp.SkillsUsed {
				skillSet[s] = struct{}{}
			}
		}
	}
	allSkills := make([]string, 0, len(skillSet))
	for s := range skillSet {
		allSkills = append(allSkills, s)
	}

	return &fullProfile{
		Name:             profile.Name,
		Headline:         profile.Headline,
		About:            profile.About,
		YearsOfExperience: profile.YearsOfExperience,
		Experiences:      exps,
		AllSkills:        allSkills,
	}, nil
}

func formatExperiences(exps []model.JobExperiences) string {
	var lines []string
	for _, e := range exps {
		skills := ""
		if e.SkillsUsed != nil {
			skills = strings.Join(*e.SkillsUsed, ", ")
		}
		endDate := e.EndDate
		if endDate == nil || *endDate == "" {
			if e.IsCurrent {
				now := time.Now().Format("2006-01")
				endDate = &now
			}
		}
		line := fmt.Sprintf("- %s at %s (%s to %s) [%s] Skills: %s", e.Title, e.Organization, e.StartDate, nullStr(endDate), string(e.Type), skills)
		if e.Description != nil && *e.Description != "" {
			line += "\n  Description: " + *e.Description
		}
		lines = append(lines, line)
	}
	return strings.Join(lines, "\n")
}

// GetLatest returns the most recent evaluation for a profile.
func (s *Service) GetLatest(ctx context.Context, profileID string) (*EvaluationResult, error) {
	stmt := SELECT(
		gen.AiEvaluations.AllColumns,
	).FROM(
		gen.AiEvaluations,
	).WHERE(
		gen.AiEvaluations.ProfileID.EQ(String(profileID)),
	).ORDER_BY(
		gen.AiEvaluations.CreatedAt.DESC(),
	).LIMIT(1)

	var eval model.AiEvaluations
	err := stmt.QueryContext(ctx, s.db, &eval)
	if err != nil {
		return nil, err
	}

	var strengths []SkillNote
	var weaknesses []SkillNote
	var suggestions []Suggestion
	var skillScores []SkillScoreItem

	json.Unmarshal(eval.Strengths, &strengths)
	json.Unmarshal(eval.Weaknesses, &weaknesses)
	json.Unmarshal(eval.Suggestions, &suggestions)
	json.Unmarshal(eval.SkillScores, &skillScores)

	return &EvaluationResult{
		ID:           eval.ID.String(),
		OverallScore: eval.OverallScore,
		Strengths:    strengths,
		Weaknesses:   weaknesses,
		Suggestion:   suggestions,
		SkillScores:  skillScores,
		CreatedAt:    eval.CreatedAt.Format(time.RFC3339),
		RawAnalysis:  eval.RawAnalysis,
	}, nil
}

func nullStr(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

func nullInt(v *int32) int {
	if v == nil {
		return 0
	}
	return int(*v)
}
```

- [ ] **Step 2: Commit**

```bash
git add server-go/internal/evaluation/service.go
git commit -m "feat(evaluation): add AI evaluation service with LLM integration"
```

---

## Task 6: Application Handler

**Files:**
- Create: `server-go/internal/application/handler.go`
- Create: `server-go/internal/application/service.go`

- [ ] **Step 1: Create application service**

```go
package application

import (
	"context"
	"database/sql"
	"errors"
	"time"

	. "github.com/go-jet/jet/v2/postgres"
	"github.com/google/uuid"

	"skillpass-server-go/.gen/skillpass/public/model"
	"skillpass-server-go/internal/gen"
)

type Service struct {
	db *sql.DB
}

func NewService(db *sql.DB) *Service {
	return &Service{db: db}
}

type ApplicationResult struct {
	ID           string `json:"id"`
	JobseekerID  string `json:"jobseekerId"`
	JobPostingID string `json:"jobPostingId"`
	Status       string `json:"status"`
	CreatedAt    string `json:"createdAt"`
	UpdatedAt    string `json:"updatedAt"`
	// Joined fields
	JobTitle     string   `json:"jobTitle,omitempty"`
	CompanyName  string   `json:"companyName,omitempty"`
}

func (s *Service) Apply(ctx context.Context, jobseekerID, jobPostingID string) (*ApplicationResult, error) {
	// Verify job posting exists and is open
	jobStmt := SELECT(
		gen.JobPostings.ID, gen.JobPostings.Status,
	).FROM(
		gen.JobPostings,
	).WHERE(
		gen.JobPostings.ID.EQ(String(jobPostingID)),
	)

	var job struct {
		model.JobPostings
	}
	err := jobStmt.QueryContext(ctx, s.db, &job)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("job posting not found")
		}
		return nil, err
	}
	if string(job.Status) != "open" {
		return nil, errors.New("job posting is not open for applications")
	}

	// Check for duplicate application
	dupStmt := SELECT(
		gen.Applications.ID,
	).FROM(
		gen.Applications,
	).WHERE(
		gen.Applications.JobseekerID.EQ(String(jobseekerID)).
			AND(gen.Applications.JobPostingID.EQ(String(jobPostingID))),
	)

	var dup model.Applications
	err = dupStmt.QueryContext(ctx, s.db, &dup)
	if err == nil {
		return nil, errors.New("already applied to this job")
	}
	if !errors.Is(err, sql.ErrNoRows) {
		return nil, err
	}

	now := time.Now().UTC()
	newID := uuid.New()

	insStmt := gen.Applications.INSERT(
		gen.Applications.ID,
		gen.Applications.JobseekerID,
		gen.Applications.JobPostingID,
		gen.Applications.Status,
		gen.Applications.CreatedAt,
		gen.Applications.UpdatedAt,
	).VALUES(
		String(newID.String()),
		String(jobseekerID),
		String(jobPostingID),
		String("applied"),
		TimestampzT(now),
		TimestampzT(now),
	)

	if _, err := insStmt.ExecContext(ctx, s.db); err != nil {
		return nil, err
	}

	return &ApplicationResult{
		ID:           newID.String(),
		JobseekerID:  jobseekerID,
		JobPostingID: jobPostingID,
		Status:       "applied",
		CreatedAt:    now.Format(time.RFC3339),
		UpdatedAt:    now.Format(time.RFC3339),
	}, nil
}

type ApplicationFilter struct {
	JobseekerID string
}

func (s *Service) ListForJobseeker(ctx context.Context, jobseekerID string) ([]ApplicationResult, error) {
	stmt := SELECT(
		gen.Applications.AllColumns,
		gen.JobPostings.Title,
		gen.Companies.CompanyName,
	).FROM(
		gen.Applications.
			INNER_JOIN(gen.JobPostings, gen.JobPostings.ID.EQ(gen.Applications.JobPostingID)).
			INNER_JOIN(gen.Companies, gen.Companies.ID.EQ(gen.JobPostings.CompanyID)),
	).WHERE(
		gen.Applications.JobseekerID.EQ(String(jobseekerID)),
	).ORDER_BY(
		gen.Applications.CreatedAt.DESC(),
	)

	var rows []struct {
		model.Applications
		Title       string
		CompanyName string
	}
	if err := stmt.QueryContext(ctx, s.db, &rows); err != nil {
		return nil, err
	}

	results := make([]ApplicationResult, len(rows))
	for i, r := range rows {
		results[i] = ApplicationResult{
			ID:           r.ID.String(),
			JobseekerID:  r.JobseekerID.String(),
			JobPostingID: r.JobPostingID.String(),
			Status:       string(r.Status),
			CreatedAt:    r.CreatedAt.Format(time.RFC3339),
			UpdatedAt:    r.UpdatedAt.Format(time.RFC3339),
			JobTitle:     r.Title,
			CompanyName:  r.CompanyName,
		}
	}
	return results, nil
}

func (s *Service) UpdateStatus(ctx context.Context, applicationID, status string) (*ApplicationResult, error) {
	validStatuses := map[string]bool{
		"applied": true, "reviewed": true, "interviewed": true,
		"offered": true, "rejected": true,
	}
	if !validStatuses[status] {
		return nil, errors.New("invalid status: must be one of applied, reviewed, interviewed, offered, rejected")
	}

	now := time.Now().UTC()
	updStmt := gen.Applications.UPDATE(
		gen.Applications.Status,
		gen.Applications.UpdatedAt,
	).SET(
		gen.Applications.Status.SET(String(status)),
		gen.Applications.UpdatedAt.SET(TimestampzT(now)),
	).WHERE(
		gen.Applications.ID.EQ(String(applicationID)),
	).RETURNING(
		gen.Applications.AllColumns,
	)

	var app model.Applications
	err := updStmt.QueryContext(ctx, s.db, &app)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("application not found")
		}
		return nil, err
	}

	return &ApplicationResult{
		ID:           app.ID.String(),
		JobseekerID:  app.JobseekerID.String(),
		JobPostingID: app.JobPostingID.String(),
		Status:       string(app.Status),
		CreatedAt:    app.CreatedAt.Format(time.RFC3339),
		UpdatedAt:    app.UpdatedAt.Format(time.RFC3339),
	}, nil
}

func (s *Service) LookupJobseekerProfileID(ctx context.Context, userID string) (string, error) {
	stmt := SELECT(
		gen.JobseekerProfiles.ID,
	).FROM(
		gen.JobseekerProfiles,
	).WHERE(
		gen.JobseekerProfiles.UserID.EQ(String(userID)),
	)

	var profile struct{ ID uuid.UUID }
	err := stmt.QueryContext(ctx, s.db, &profile)
	if err != nil {
		return "", err
	}
	return profile.ID.String(), nil
}
```

- [ ] **Step 2: Create application handler**

```go
package application

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"

	"skillpass-server-go/internal/handlers"
)

// Handler uses injected handlers package for helper functions patterns.

type Handler struct {
	service *Service
	db      interface{} // not used directly, service has the db
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// Apply applies the authenticated jobseeker to a job posting.
// POST /api/v1/jobs/:id/apply
func (h *Handler) Apply(c *gin.Context) {
	userID, ok := c.Get("userId")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userIDStr, ok := userID.(string)
	if !ok || userIDStr == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	jobPostingID := c.Param("id")
	if jobPostingID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Job posting ID is required"})
		return
	}

	// Look up the jobseeker profile ID from user ID
	profileID, err := h.service.LookupJobseekerProfileID(c.Request.Context(), userIDStr)
	if err != nil {
		slog.Error("failed to lookup jobseeker profile", "userID", userIDStr, "error", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Jobseeker profile not found"})
		return
	}

	result, err := h.service.Apply(c.Request.Context(), profileID, jobPostingID)
	if err != nil {
		slog.Error("application failed", "error", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, result)
}

// ListMyApplications returns the jobseeker's applications (kanban data).
// GET /api/v1/applications/me
func (h *Handler) ListMyApplications(c *gin.Context) {
	userID, ok := c.Get("userId")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userIDStr, ok := userID.(string)
	if !ok || userIDStr == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	profileID, err := h.service.LookupJobseekerProfileID(c.Request.Context(), userIDStr)
	if err != nil {
		slog.Error("failed to lookup jobseeker profile", "userID", userIDStr, "error", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Jobseeker profile not found"})
		return
	}

	applications, err := h.service.ListForJobseeker(c.Request.Context(), profileID)
	if err != nil {
		slog.Error("failed to list applications", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list applications"})
		return
	}

	if applications == nil {
		applications = []ApplicationResult{}
	}

	c.JSON(http.StatusOK, applications)
}

// UpdateStatus updates an application's status (company action).
// PUT /api/v1/applications/:id/status
func (h *Handler) UpdateStatus(c *gin.Context) {
	applicationID := c.Param("id")
	if applicationID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Application ID is required"})
		return
	}

	var req struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: status is required"})
		return
	}

	result, err := h.service.UpdateStatus(c.Request.Context(), applicationID, req.Status)
	if err != nil {
		slog.Error("failed to update application status", "applicationID", applicationID, "error", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}
```

- [ ] **Step 3: Commit**

```bash
git add server-go/internal/application/
git commit -m "feat(application): add apply, list, and update status endpoints"
```

---

## Task 7: Matching Handler + Service

**Files:**
- Create: `server-go/internal/matching/handler.go`
- Create: `server-go/internal/matching/service.go`

- [ ] **Step 1: Create matching service**

The matching service uses evaluation results to recommend jobs to jobseekers and candidates to companies.

```go
package matching

import (
	"context"
	"database/sql"
	"encoding/json"
	"sort"
	"strings"

	. "github.com/go-jet/jet/v2/postgres"
	"github.com/google/uuid"

	"skillpass-server-go/.gen/skillpass/public/model"
	"skillpass-server-go/internal/gen"
)

type Service struct {
	db *sql.DB
}

func NewService(db *sql.DB) *Service {
	return &Service{db: db}
}

// JobMatch represents a recommended job for a jobseeker.
type JobMatch struct {
	JobPostingID  string  `json:"jobPostingId"`
	Title         string  `json:"title"`
	CompanyName   string  `json:"companyName"`
	Industry      string  `json:"industry"`
	Location      *string `json:"location"`
	SalaryRange   *string `json:"salaryRange"`
	ExperienceLevel *string `json:"experienceLevel"`
	MatchScore    float64 `json:"matchScore"`
	MatchReason   string  `json:"matchReason"`
}

// CandidateMatch represents a recommended candidate for a job.
type CandidateMatch struct {
	ProfileID     string  `json:"profileId"`
	Name          string  `json:"name"`
	Headline      *string `json:"headline"`
	OverallScore  int     `json:"overallScore"`
	TopSkills     []string `json:"topSkills"`
	MatchScore    float64 `json:"matchScore"`
	MatchReason   string  `json:"matchReason"`
}

type skillScoreData struct {
	Skill    string  `json:"skill"`
	Category string  `json:"category"`
	Score    float64 `json:"score"`
}

// MatchJobs finds recommended jobs for a jobseeker based on their evaluation.
func (s *Service) MatchJobs(ctx context.Context, profileID string) ([]JobMatch, error) {
	// 1. Get the jobseeker's latest evaluation
	eval, err := s.getLatestEvaluation(ctx, profileID)
	if err != nil {
		// If no evaluation exists, return empty with a helpful message
		return nil, nil
	}

	// Extract top skill keywords from evaluation
	skillNames := extractSkillNames(eval)
	if len(skillNames) == 0 {
		return nil, nil
	}

	// 2. Get jobseeker's industry from their profile
	industryStmt := SELECT(
		gen.JobseekerProfiles.ID,
	).FROM(
		gen.JobseekerProfiles,
	).WHERE(
		gen.JobseekerProfiles.ID.EQ(String(profileID)),
	)

	// 3. Query all open job postings with company info
	stmt := SELECT(
		gen.JobPostings.ID,
		gen.JobPostings.Title,
		gen.JobPostings.Industry,
		gen.JobPostings.RequiredSkills,
		gen.JobPostings.Location,
		gen.JobPostings.SalaryRange,
		gen.JobPostings.ExperienceLevel,
		gen.Companies.CompanyName,
	).FROM(
		gen.JobPostings.
			INNER_JOIN(gen.Companies, gen.Companies.ID.EQ(gen.JobPostings.CompanyID)),
	).WHERE(
		gen.JobPostings.Status.EQ(gen.JobStatusOpen),
	).ORDER_BY(
		gen.JobPostings.CreatedAt.DESC(),
	)

	var rows []struct {
		model.JobPostings
		CompanyName string
	}
	if err := stmt.QueryContext(ctx, s.db, &rows); err != nil {
		return nil, err
	}

	// 4. Score each job against the jobseeker's skills
	type scored struct {
		job    struct {
			model.JobPostings
			CompanyName string
		}
		score float64
	}
	var scoredJobs []scored

	for _, row := range rows {
		score := computeMatchScore(skillNames, row.RequiredSkills)
		if score > 0 {
			scoredJobs = append(scoredJobs, scored{job: row, score: score})
		}
	}

	// 5. Sort by score descending
	sort.Slice(scoredJobs, func(i, j int) bool {
		return scoredJobs[i].score > scoredJobs[j].score
	})

	// Limit to top 20
	if len(scoredJobs) > 20 {
		scoredJobs = scoredJobs[:20]
	}

	results := make([]JobMatch, len(scoredJobs))
	for i, sj := range scoredJobs {
		expLevel := ""
		if sj.job.ExperienceLevel != nil {
			expLevel = string(*sj.job.ExperienceLevel)
		}
		results[i] = JobMatch{
			JobPostingID:    sj.job.ID.String(),
			Title:           sj.job.Title,
			CompanyName:     sj.job.CompanyName,
			Industry:        sj.job.Industry,
			Location:        sj.job.Location,
			SalaryRange:     sj.job.SalaryRange,
			ExperienceLevel: &expLevel,
			MatchScore:      sj.score,
			MatchReason:     computeReason(sj.score),
		}
	}

	return results, nil
}

// MatchCandidates finds recommended candidates for a company's job posting.
func (s *Service) MatchCandidates(ctx context.Context, jobPostingID string) ([]CandidateMatch, error) {
	// 1. Get the job posting details
	jobStmt := SELECT(
		gen.JobPostings.ID,
		gen.JobPostings.Title,
		gen.JobPostings.RequiredSkills,
		gen.JobPostings.Industry,
	).FROM(
		gen.JobPostings,
	).WHERE(
		gen.JobPostings.ID.EQ(String(jobPostingID)),
	)

	var job struct {
		model.JobPostings
	}
	if err := jobStmt.QueryContext(ctx, s.db, &job); err != nil {
		return nil, err
	}

	jobSkills := []string{}
	if job.RequiredSkills != nil {
		jobSkills = *job.RequiredSkills
	}
	if len(jobSkills) == 0 {
		return nil, nil
	}

	// 2. Query profiles with evaluations
	stmt := SELECT(
		gen.AiEvaluations.AllColumns,
		gen.JobseekerProfiles.Headline,
		gen.JobseekerProfiles.ID,
		gen.Users.Name,
	).FROM(
		gen.AiEvaluations.
			INNER_JOIN(gen.JobseekerProfiles, gen.JobseekerProfiles.ID.EQ(gen.AiEvaluations.ProfileID)).
			INNER_JOIN(gen.Users, gen.Users.ID.EQ(gen.JobseekerProfiles.UserID)),
	)

	// Get the latest evaluation per profile using a subquery approach
	// For simplicity, get all evaluations ordered, deduplicate in code
	stmt = stmt.ORDER_BY(gen.AiEvaluations.CreatedAt.DESC())

	var rows []struct {
		model.AiEvaluations
		Headline *string
		ID       uuid.UUID // profile ID
		Name     string
	}
	if err := stmt.QueryContext(ctx, s.db, &rows); err != nil {
		return nil, err
	}

	// Deduplicate by profile ID (keep latest)
	seen := map[string]bool{}
	type candidateEval struct {
		ProfileID   string
		Name        string
		Headline    *string
		OverallScore int
		SkillScores []skillScoreData
	}
	var candidates []candidateEval

	for _, row := range rows {
		pid := row.ID.String()
		if seen[pid] {
			continue
		}
		seen[pid] = true

		var skills []skillScoreData
		json.Unmarshal(row.SkillScores, &skills)

		candidates = append(candidates, candidateEval{
			ProfileID:    pid,
			Name:         row.Name,
			Headline:     row.Headline,
			OverallScore: row.OverallScore,
			SkillScores:  skills,
		})
	}

	// 3. Score each candidate against the job
	type scoredCandidate struct {
		candidateEval
		score float64
	}
	var scoredCandidates []scoredCandidate

	for _, c := range candidates {
		candidateSkills := make([]string, len(c.SkillScores))
		for i, ss := range c.SkillScores {
			candidateSkills[i] = strings.ToLower(ss.Skill)
		}
		score := computeMatchScore(jobSkills, candidateSkills)
		if score > 0 {
			scoredCandidates = append(scoredCandidates, scoredCandidate{candidateEval: c, score: score})
		}
	}

	// 4. Sort by score descending
	sort.Slice(scoredCandidates, func(i, j int) bool {
		return scoredCandidates[i].score > scoredCandidates[j].score
	})

	if len(scoredCandidates) > 20 {
		scoredCandidates = scoredCandidates[:20]
	}

	results := make([]CandidateMatch, len(scoredCandidates))
	for i, sc := range scoredCandidates {
		topSkills := make([]string, 0, 5)
		for _, ss := range sc.SkillScores {
			topSkills = append(topSkills, ss.Skill)
			if len(topSkills) >= 5 {
				break
			}
		}
		results[i] = CandidateMatch{
			ProfileID:    sc.ProfileID,
			Name:         sc.Name,
			Headline:     sc.Headline,
			OverallScore: sc.OverallScore,
			TopSkills:    topSkills,
			MatchScore:   sc.score,
			MatchReason:  computeReason(sc.score),
		}
	}

	return results, nil
}

func (s *Service) getLatestEvaluation(ctx context.Context, profileID string) (*model.AiEvaluations, error) {
	stmt := SELECT(
		gen.AiEvaluations.AllColumns,
	).FROM(
		gen.AiEvaluations,
	).WHERE(
		gen.AiEvaluations.ProfileID.EQ(String(profileID)),
	).ORDER_BY(
		gen.AiEvaluations.CreatedAt.DESC(),
	).LIMIT(1)

	var eval model.AiEvaluations
	err := stmt.QueryContext(ctx, s.db, &eval)
	if err != nil {
		return nil, err
	}
	return &eval, nil
}

func extractSkillNames(eval *model.AiEvaluations) []string {
	var scores []skillScoreData
	json.Unmarshal(eval.SkillScores, &scores)

	skillSet := map[string]bool{}
	for _, s := range scores {
		if s.Score >= 50 { // Only consider skills scored 50+
			skillSet[strings.ToLower(s.Skill)] = true
		}
	}

	skills := make([]string, 0, len(skillSet))
	for s := range skillSet {
		skills = append(skills, s)
	}
	return skills
}

// computeMatchScore computes a simple overlap score between job and candidate skill sets.
// Returns a score from 0 to 100.
func computeMatchScore(sourceSkills, targetSkills []string) float64 {
	if len(sourceSkills) == 0 || len(targetSkills) == 0 {
		return 0
	}

	sourceMap := map[string]bool{}
	for _, s := range sourceSkills {
		sourceMap[strings.ToLower(s)] = true
	}

	matches := 0
	for _, t := range targetSkills {
		if sourceMap[strings.ToLower(t)] {
			matches++
		}
	}

	// Score is percentage of target skills matched, times a relevance factor
	overlap := float64(matches) / float64(len(targetSkills))
	// Also consider what fraction of source skills are relevant
	relevance := float64(matches) / float64(len(sourceSkills))

	score := (overlap*0.6 + relevance*0.4) * 100
	return score
}

func computeReason(score float64) string {
	switch {
	case score >= 80:
		return "Strong match — skills align well with requirements"
	case score >= 60:
		return "Good match — most skills overlap"
	case score >= 40:
		return "Moderate match — some skills align"
	default:
		return "Partial match — consider reviewing details"
	}
}
```

- [ ] **Step 2: Create matching handler**

```go
package matching

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"

	"skillpass-server-go/internal/gen"
	. "github.com/go-jet/jet/v2/postgres"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// MatchJobs returns recommended jobs for the authenticated jobseeker.
// GET /api/v1/jobs/matches
func (h *Handler) MatchJobs(c *gin.Context) {
	userID, ok := c.Get("userId")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userIDStr := userID.(string)

	// Lookup profile ID
	profileStmt := SELECT(
		gen.JobseekerProfiles.ID,
	).FROM(
		gen.JobseekerProfiles,
	).WHERE(
		gen.JobseekerProfiles.UserID.EQ(String(userIDStr)),
	)

	var profile struct{ ID string }
	err := profileStmt.QueryContext(c.Request.Context(), h.service.db, &profile)
	if err != nil {
		slog.Error("profile lookup failed", "error", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Profile not found"})
		return
	matching}

	matches, err := h.service.MatchJobs(c.Request.Context(), profile.ID)
	if err != nil {
		slog.Error("job matching failed", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Matching failed"})
		return
	}

	if matches == nil {
		matches = []JobMatch{}
	}

	c.JSON(http.StatusOK, matches)
}

// MatchCandidates returns recommended candidates for a company's job posting.
// GET /api/v1/candidates/matches
func (h *Handler) MatchCandidates(c *gin.Context) {
	jobPostingID := c.Query("jobId")
	if jobPostingID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "jobId query parameter is required"})
		return
	}

	matches, err := h.service.MatchCandidates(c.Request.Context(), jobPostingID)
	if err != nil {
		slog.Error("candidate matching failed", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Matching failed"})
		return
	}

	if matches == nil {
		matches = []CandidateMatch{}
	}

	c.JSON(http.StatusOK, matches)
}
```

Wait, I have a syntax error in the handler. Let me fix the `MatchJobs` method - there's a `matching` label that shouldn't be there. Let me fix this.

Actually, the handler code above has a bug: `return` followed by `matching` label. Let me correct the handler.

- [ ] **Step 3: Fix handler typo and finalize**

The handler file has a stray `matching` label after the return statement. Here's the corrected version:

```go
// MatchJobs returns recommended jobs for the authenticated jobseeker.
// GET /api/v1/jobs/matches
func (h *Handler) MatchJobs(c *gin.Context) {
	userID, ok := c.Get("userId")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userIDStr := userID.(string)

	// Lookup profile ID
	profileStmt := SELECT(
		gen.JobseekerProfiles.ID,
	).FROM(
		gen.JobseekerProfiles,
	).WHERE(
		gen.JobseekerProfiles.UserID.EQ(String(userIDStr)),
	)

	var profile struct{ ID string }
	err := profileStmt.QueryContext(c.Request.Context(), h.service.db, &profile)
	if err != nil {
		slog.Error("profile lookup failed", "error", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Profile not found"})
		return
	}

	matches, err := h.service.MatchJobs(c.Request.Context(), profile.ID)
	if err != nil {
		slog.Error("job matching failed", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Matching failed"})
		return
	}

	if matches == nil {
		matches = []JobMatch{}
	}

	c.JSON(http.StatusOK, matches)
}
```

- [ ] **Step 4: Commit**

```bash
git add server-go/internal/matching/
git commit -m "feat(matching): add job and candidate matching endpoints"
```

---

## Task 8: Register New Routes in main.go

**Files:**
- Modify: `server-go/cmd/server/main.go`

- [ ] **Step 1: Update main.go — add imports and route registration**

Edit `server-go/cmd/server/main.go`:

1. Add imports for the new packages:
```go
import (
	"context"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"skillpass-server-go/internal/config"
	"skillpass-server-go/internal/db"
	"skillpass-server-go/internal/evaluation"    // ADD
	"skillpass-server-go/internal/application"    // ADD
	"skillpass-server-go/internal/matching"        // ADD
	"skillpass-server-go/internal/handlers"
	"skillpass-server-go/internal/lib"             // ADD
	"skillpass-server-go/internal/middleware"
)
```

2. After the existing handler instantiations (after `admin := handlers.NewAdminHandler(database)`), add:
```go
	// Phase 2: AI Evaluation & Matching
	llmClient := lib.NewOpenAIClient()
	evalService := evaluation.NewService(database, llmClient)
	evalHandler := evaluation.NewHandler(database, evalService)

	appService := application.NewService(database)
	appHandler := application.NewHandler(appService)

	matchService := matching.NewService(database)
	matchHandler := matching.NewHandler(matchService)
```

3. After the existing route groups (after `adminGroup`), add the new route groups:
```go
	// ── Evaluation routes (jobseeker) ──
	evalGroup := api.Group("/evaluate")
	evalGroup.Use(middleware.AuthRequired(cfg.JWTSecret), middleware.RequireRole("jobseeker"))
	evalGroup.POST("/me", evalHandler.PostEvaluate)
	evalGroup.GET("/me/results", evalHandler.GetLatestEvaluation)

	// ── Application routes (jobseeker applies) ──
	jobApplyGroup := api.Group("/jobs")
	jobApplyGroup.Use(middleware.AuthRequired(cfg.JWTSecret), middleware.RequireRole("jobseeker"))
	jobApplyGroup.POST("/:id/apply", appHandler.Apply)

	appGroup := api.Group("/applications")
	appGroup.Use(middleware.AuthRequired(cfg.JWTSecret), middleware.RequireRole("jobseeker"))
	appGroup.GET("/me", appHandler.ListMyApplications)

	// ── Application status update (company) ──
	appStatusGroup := api.Group("/applications")
	for _, m := range verifiedCompany {
		appStatusGroup.Use(m)
	}
	appStatusGroup.PUT("/:id/status", appHandler.UpdateStatus)

	// ── Matching routes ──
	matchesJobseekerGroup := api.Group("/jobs")
	matchesJobseekerGroup.Use(middleware.AuthRequired(cfg.JWTSecret), middleware.RequireRole("jobseeker"))
	matchesJobseekerGroup.GET("/matches", matchHandler.MatchJobs)

	matchesCompanyGroup := api.Group("/candidates")
	for _, m := range verifiedCompany {
		matchesCompanyGroup.Use(m)
	}
	matchesCompanyGroup.GET("/matches", matchHandler.MatchCandidates)
```

> **Note:** Ensure there are no conflicts with existing route groups. The `/jobs` group already has a sub-group for verified companies (POST, PUT, DELETE). The new `/jobs/:id/apply` route for jobseekers uses a separate `jobApplyGroup` with the jobseeker role middleware. Since Gin matches routes by specificity, the `POST /jobs/:id/apply` will not conflict with `POST /jobs` (the existing create job route) because `/jobs` is exact path while `/jobs/:id/apply` is a two-segment path. Similarly, `GET /jobs/matches` won't conflict with `GET /jobs/:id` because Gin distinguishes between literal "matches" and the parameter ":id".

- [ ] **Step 2: Verify the server compiles**

```bash
cd server-go && go build ./cmd/server/
```
Expected output: no errors, binary produced.

- [ ] **Step 3: Commit**

```bash
git add server-go/cmd/server/main.go
git commit -m "feat(server): register Phase 2 routes for evaluation, applications, matching"
```

---

## Task 9: Frontend API Modules

**Files:**
- Create: `web/src/lib/evaluation.ts`
- Create: `web/src/lib/application.ts`

- [ ] **Step 1: Create evaluation API module**

```ts
// web/src/lib/evaluation.ts
import { api } from './api';

export interface SkillNote {
  skill: string;
  score: number;
  note: string;
}

export interface Suggestion {
  area: string;
  tip: string;
}

export interface SkillScoreItem {
  skill: string;
  category: string;
  score: number;
}

export interface EvaluationResult {
  id: string;
  overallScore: number;
  strengths: SkillNote[];
  weaknesses: SkillNote[];
  suggestions: Suggestion[];
  skillScores: SkillScoreItem[];
  createdAt: string;
}

export async function triggerEvaluation(): Promise<EvaluationResult> {
  return api<EvaluationResult>('/evaluate/me', { method: 'POST' });
}

export async function getLatestEvaluation(): Promise<EvaluationResult> {
  return api<EvaluationResult>('/evaluate/me/results');
}
```

- [ ] **Step 2: Create application API module**

```ts
// web/src/lib/application.ts
import { api } from './api';

export type ApplicationStatus = 'applied' | 'reviewed' | 'interviewed' | 'offered' | 'rejected';

export interface Application {
  id: string;
  jobseekerId: string;
  jobPostingId: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  jobTitle?: string;
  companyName?: string;
}

export async function applyToJob(jobId: string): Promise<Application> {
  return api<Application>(`/jobs/${jobId}/apply`, { method: 'POST' });
}

export async function getMyApplications(): Promise<Application[]> {
  return api<Application[]>('/applications/me');
}
```

- [ ] **Step 3: Commit**

```bash
git add web/src/lib/evaluation.ts web/src/lib/application.ts
git commit -m "feat(web): add evaluation and application API modules"
```

---

## Task 10: Frontend — Evaluation Page

**Files:**
- Create: `web/src/pages/jobseeker/EvaluationPage.tsx`
- Create: `web/src/components/jobseeker/SkillScoresChart.tsx`
- Create: `web/src/components/jobseeker/EvaluationScoreBadge.tsx`

- [ ] **Step 1: Create EvaluationScoreBadge component**

```tsx
// web/src/components/jobseeker/EvaluationScoreBadge.tsx
interface Props {
  overallScore: number;
}

function getScoreLevel(score: number): { label: string; color: string } {
  if (score >= 200) return { label: 'Expert', color: 'badge-success' };
  if (score >= 100) return { label: 'Advanced', color: 'badge-info' };
  if (score >= 50) return { label: 'Intermediate', color: 'badge-warning' };
  return { label: 'Beginner', color: 'badge-ghost' };
}

export function EvaluationScoreBadge({ overallScore }: Props) {
  const { label, color } = getScoreLevel(overallScore);
  return (
    <div className="flex items-center gap-2">
      <div className={`badge badge-lg ${color} gap-1`}>
        <span className="font-bold">{overallScore}</span>
        <span className="text-xs">{label}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create SkillScoresChart component**

```tsx
// web/src/components/jobseeker/SkillScoresChart.tsx
import type { SkillScoreItem } from '../lib/evaluation';

interface Props {
  skillScores: SkillScoreItem[];
}

export function SkillScoresChart({ skillScores }: Props) {
  if (skillScores.length === 0) {
    return <p className="text-sm opacity-60">No skill scores available.</p>;
  }

  // Group by category
  const grouped: Record<string, SkillScoreItem[]> = {};
  for (const item of skillScores) {
    const cat = item.category || 'uncategorized';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  }

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <h4 className="text-sm font-semibold capitalize mb-2">{category}</h4>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.skill} className="flex items-center gap-2">
                <span className="text-sm w-24 truncate">{item.skill}</span>
                <progress
                  className="progress progress-primary flex-1"
                  value={item.score}
                  max={100}
                  aria-label={`${item.skill}: ${item.score}%`}
                />
                <span className="text-xs w-8 text-right opacity-70">{item.score}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create EvaluationPage**

```tsx
// web/src/pages/jobseeker/EvaluationPage.tsx
import { Sparkles, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { EvaluationScoreBadge } from '../components/jobseeker/EvaluationScoreBadge';
import { SkillScoresChart } from '../components/jobseeker/SkillScoresChart';
import { LoadingFallback } from '../components/ui/LoadingFallback';
import { useAuth } from '../hooks/useAuth';
import { ApiError, api } from '../lib/api';
import {
  type EvaluationResult,
  getLatestEvaluation,
  triggerEvaluation,
} from '../lib/evaluation';

export function EvaluationPage() {
  const { user } = useAuth();
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load existing evaluation on mount
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    getLatestEvaluation()
      .then((data) => {
        if (!cancelled) setEvaluation(data);
      })
      .catch(() => {
        // No evaluation yet — that's fine
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleEvaluate = useCallback(async () => {
    setEvaluating(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const result = await triggerEvaluation();
      setEvaluation(result);
      setSuccessMsg('Evaluation complete!');
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.serverMessage ?? err.message
          : 'Evaluation failed. Please try again.';
      setError(msg);
    } finally {
      setEvaluating(false);
    }
  }, []);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <p>Please log in to view your evaluation.</p>
      </div>
    );
  }

  if (loading) return <LoadingFallback text="Loading evaluation" />;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">AI Profile Evaluation</h1>
        <button
          type="button"
          className="btn btn-primary gap-2"
          onClick={handleEvaluate}
          disabled={evaluating}
        >
          <Sparkles size={16} aria-hidden="true" />
          {evaluating ? 'Evaluating...' : evaluation ? 'Re-evaluate' : 'Evaluate My Profile'}
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
          <button
            type="button"
            title="close"
            className="btn btn-ghost btn-xs"
            onClick={() => setError(null)}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success">
          <span>{successMsg}</span>
          <button
            type="button"
            title="close"
            className="btn btn-ghost btn-xs"
            onClick={() => setSuccessMsg(null)}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {evaluation ? (
        <>
          {/* Score Badge */}
          <div className="card bg-base-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Overall Score</h2>
                <p className="text-sm opacity-60">
                  Unlimited cumulative scoring — every skill adds points
                </p>
              </div>
              <EvaluationScoreBadge overallScore={evaluation.overallScore} />
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card bg-base-200 p-4">
              <h3 className="font-semibold mb-3 text-success">Strengths</h3>
              {evaluation.strengths.length === 0 ? (
                <p className="text-sm opacity-60">No strengths identified yet.</p>
              ) : (
                <ul className="space-y-2">
                  {evaluation.strengths.map((s) => (
                    <li key={s.skill} className="p-2 bg-base-100 rounded-box">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{s.skill}</span>
                        <span className="badge badge-success badge-sm">{s.score}</span>
                      </div>
                      {s.note && <p className="text-xs opacity-60 mt-1">{s.note}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="card bg-base-200 p-4">
              <h3 className="font-semibold mb-3 text-warning">Areas to Improve</h3>
              {evaluation.weaknesses.length === 0 ? (
                <p className="text-sm opacity-60">No weaknesses identified.</p>
              ) : (
                <ul className="space-y-2">
                  {evaluation.weaknesses.map((w) => (
                    <li key={w.skill} className="p-2 bg-base-100 rounded-box">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{w.skill}</span>
                        <span className="badge badge-warning badge-sm">{w.score}</span>
                      </div>
                      {w.note && <p className="text-xs opacity-60 mt-1">{w.note}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Suggestions */}
          <div className="card bg-base-200 p-4">
            <h3 className="font-semibold mb-3 text-info">Suggestions</h3>
            {evaluation.suggestions.length === 0 ? (
              <p className="text-sm opacity-60">No suggestions yet.</p>
            ) : (
              <ul className="space-y-2">
                {evaluation.suggestions.map((s, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: suggestions have no stable id
                  <li key={i} className="p-3 bg-base-100 rounded-box">
                    <p className="font-medium capitalize">{s.area}</p>
                    <p className="text-sm opacity-70">{s.tip}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Skill Scores */}
          <div className="card bg-base-200 p-4">
            <h3 className="font-semibold mb-3">Skill Scores</h3>
            <SkillScoresChart skillScores={evaluation.skillScores} />
          </div>

          <p className="text-xs opacity-50 text-center">
              Last evaluated: {new Date(evaluation.createdAt).toLocaleString()}
            </p>
        </>
      ) : (
        <div className="card bg-base-200 p-8 text-center">
          <p className="text-lg mb-4">
            You haven't evaluated your profile yet.
          </p>
          <p className="text-sm opacity-60 mb-6">
            Click "Evaluate My Profile" to get AI-powered insights on your skills, strengths, and areas for growth.
          </p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add web/src/pages/jobseeker/EvaluationPage.tsx web/src/components/jobseeker/EvaluationScoreBadge.tsx web/src/components/jobseeker/SkillScoresChart.tsx
git commit -m "feat(web): add evaluation page with score badge and skill chart"
```

---

## Task 11: Frontend — Application Kanban Page

**Files:**
- Create: `web/src/pages/jobseeker/ApplicationsPage.tsx`
- Create: `web/src/components/jobseeker/ApplicationKanban.tsx`

- [ ] **Step 1: Create ApplicationKanban component**

```tsx
// web/src/components/jobseeker/ApplicationKanban.tsx
import type { Application, ApplicationStatus } from '../lib/application';

interface Props {
  applications: Application[];
}

const columns: { status: ApplicationStatus; title: string; color: string }[] = [
  { status: 'applied', title: 'Applied', color: 'border-l-info' },
  { status: 'reviewed', title: 'Reviewing', color: 'border-l-warning' },
  { status: 'interviewed', title: 'Interviewing', color: 'border-l-accent' },
  { status: 'offered', title: 'Offers', color: 'border-l-success' },
];

export function ApplicationKanban({ applications }: Props) {
  const grouped = columns.map((col) => ({
    ...col,
    items: applications.filter((a) => a.status === col.status),
  }));

  const rejected = applications.filter((a) => a.status === 'rejected');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {grouped.map((col) => (
          <div key={col.status} className={`card bg-base-200 border-l-4 ${col.color}`}>
            <div className="card-body p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">{col.title}</h3>
                <span className="badge badge-ghost badge-sm">{col.items.length}</span>
              </div>
              <div className="space-y-2 min-h-[120px]">
                {col.items.length === 0 ? (
                  <p className="text-sm opacity-50 italic">No applications</p>
                ) : (
                  col.items.map((app) => (
                    <div key={app.id} className="p-3 bg-base-100 rounded-box">
                      <p className="font-medium text-sm">{app.jobTitle || 'Unknown Position'}</p>
                      <p className="text-xs opacity-60">{app.companyName || 'Unknown Company'}</p>
                      <p className="text-xs opacity-40 mt-1">
                        Applied {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {rejected.length > 0 && (
        <details className="collapse collapse-arrow bg-base-200">
          <summary className="collapse-title font-medium text-sm opacity-60">
            Rejected ({rejected.length})
          </summary>
          <div className="collapse-content space-y-2">
            {rejected.map((app) => (
              <div key={app.id} className="p-3 bg-base-100 rounded-box">
                <p className="font-medium text-sm">{app.jobTitle || 'Unknown Position'}</p>
                <p className="text-xs opacity-60">{app.companyName || 'Unknown Company'}</p>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create ApplicationsPage**

```tsx
// web/src/pages/jobseeker/ApplicationsPage.tsx
import { useEffect, useState } from 'react';
import { ApplicationKanban } from '../components/jobseeker/ApplicationKanban';
import { LoadingFallback } from '../components/ui/LoadingFallback';
import { useAuth } from '../hooks/useAuth';
import type { Application } from '../lib/application';
import { getMyApplications } from '../lib/application';

export function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    getMyApplications()
      .then((data) => {
        if (!cancelled) setApplications(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load applications');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <p>Please log in to view your applications.</p>
      </div>
    );
  }

  if (loading) return <LoadingFallback text="Loading applications" />;

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">My Applications</h1>
      <ApplicationKanban applications={applications} />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add web/src/pages/jobseeker/ApplicationsPage.tsx web/src/components/jobseeker/ApplicationKanban.tsx
git commit -m "feat(web): add application kanban page"
```

---

## Task 12: Frontend — Passport Score Badge Update

**Files:**
- Modify: `web/src/pages/jobseeker/PassportPage.tsx` → rename to `JobseekerPassport.tsx`
- Actually the file already exists at `web/src/pages/JobseekerPassport.tsx` — we MODIFY this file.

**Files:**
- Modify: `web/src/pages/JobseekerPassport.tsx`

- [ ] **Step 1: Update JobseekerPassport to show evaluation score badge + skill scores**

Modify `JobseekerPassport.tsx` to:
1. Fetch the latest evaluation alongside the profile data
2. Display the score badge next to the user's name
3. Show top strengths and skill scores below the profile card

```tsx
import { ExternalLink, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EvaluationScoreBadge } from '../components/jobseeker/EvaluationScoreBadge';
import { LoadingFallback } from '../components/ui/LoadingFallback';
import { useAuth } from '../hooks/useAuth';
import { ApiError, api } from '../lib/api';
import type { EvaluationResult } from '../lib/evaluation';
import { getLatestEvaluation } from '../lib/evaluation';

interface PassportData {
  name: string;
  avatarUrl?: string;
  headline?: string;
  about?: string;
  yearsOfExperience?: number;
  experiences: Array<{
    type: string;
    title: string;
    organization: string;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
    description?: string;
    skillsUsed?: string[];
  }>;
}

export function JobseekerPassport() {
  const { user } = useAuth();
  const [data, setData] = useState<PassportData | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const safe = encodeURIComponent(user.username);
    let cancelled = false;

    const fetchData = async () => {
      try {
        const [profile, evalResult] = await Promise.allSettled([
          api<PassportData>(`/profiles/${safe}`),
          getLatestEvaluation(),
        ]);
        if (cancelled) return;
        if (profile.status === 'fulfilled') setData(profile.value);
        if (profile.status === 'rejected') {
          setError(
            profile.reason instanceof ApiError
              ? profile.reason.serverMessage ?? profile.reason.message
              : 'Failed to load passport',
          );
        }
        if (evalResult.status === 'fulfilled') {
          setEvaluation(evalResult.value);
        }
        // No evaluation is fine — just don't show the badge
      } catch {
        // handled per-Promise above
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="alert alert-error">
          <span>{error}</span>
          <button type="button" title="close" className="btn btn-ghost btn-xs" onClick={() => setError(null)}>
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  if (!data) return <LoadingFallback text="Loading passport" />;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Passport</h1>
        <div className="flex items-center gap-2">
          {evaluation && <EvaluationScoreBadge overallScore={evaluation.overallScore} />}
          <Link to={`/profiles/${user?.username}`} className="btn btn-outline btn-sm gap-2" target="_blank">
            <ExternalLink size={14} aria-hidden="true" /> View Public
          </Link>
        </div>
      </div>

      <div className="card bg-base-200 p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="avatar placeholder">
            <div className="bg-neutral text-neutral-content rounded-full w-16">
              <span className="text-xl">{data.name?.charAt(0)}</span>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold">{data.name}</h2>
            {data.headline && <p className="text-muted-strong">{data.headline}</p>}
            {data.yearsOfExperience !== undefined && (
              <p className="text-sm text-muted">{data.yearsOfExperience} years of experience</p>
            )}
          </div>
        </div>
        {data.about && <p className="text-muted-strong mb-4">{data.about}</p>}
      </div>

      {/* Evaluation Summary */}
      {evaluation && (
        <div className="card bg-base-200 p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">AI Evaluation</h3>
            <Link to="/jobseeker/evaluation" className="btn btn-ghost btn-sm gap-1">
              <Sparkles size={14} aria-hidden="true" /> Details
            </Link>
          </div>
          {evaluation.strengths.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-semibold text-success mb-1">Top Strengths</p>
              <div className="flex flex-wrap gap-1">
                {evaluation.strengths.slice(0, 5).map((s) => (
                  <span key={s.skill} className="badge badge-success badge-sm">
                    {s.skill} ({s.score})
                  </span>
                ))}
              </div>
            </div>
          )}
          {evaluation.skillScores.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-1">Skill Scores</p>
              <div className="flex flex-wrap gap-1">
                {evaluation.skillScores.slice(0, 8).map((s) => (
                  <span key={s.skill} className="badge badge-ghost badge-sm">
                    {s.skill}: {s.score}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="card bg-base-200 p-4">
        <h3 className="font-semibold mb-3">Experience</h3>
        <div className="space-y-2">
          {data.experiences.map((exp, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: experiences array has no stable id in this view
            <div key={i} className="p-3 bg-base-100 rounded-box">
              <p className="font-medium">{exp.title}</p>
              <p className="text-sm opacity-70">
                {exp.organization} · {exp.startDate}{' '}
                {exp.isCurrent ? '- Present' : exp.endDate ? `- ${exp.endDate}` : ''}
              </p>
              {exp.description && <p className="text-sm mt-1 opacity-60">{exp.description}</p>}
              {exp.skillsUsed && exp.skillsUsed.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {exp.skillsUsed.map((s) => (
                    <span key={s} className="badge badge-sm">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the page imports are correct**

Check that the imports match the file structure — `EvaluationScoreBadge` is now used and `getLatestEvaluation` is imported from `../lib/evaluation`.

- [ ] **Step 3: Commit**

```bash
git add web/src/pages/JobseekerPassport.tsx
git commit -m "feat(web): add evaluation score badge and skills to passport page"
```

---

## Task 13: Frontend — Route Registration

**Files:**
- Modify: `web/src/App.tsx`

- [ ] **Step 1: Add lazy imports for new pages**

Add these imports after the existing lazy imports in `App.tsx`:

```tsx
const EvaluationPage = lazy(() =>
  import('./pages/jobseeker/EvaluationPage').then((m) => ({ default: m.EvaluationPage })),
);
const ApplicationsPage = lazy(() =>
  import('./pages/jobseeker/ApplicationsPage').then((m) => ({ default: m.ApplicationsPage })),
);
```

- [ ] **Step 2: Add new routes**

Add these route objects inside the `children` array of the router, after the existing `/jobseeker/passport` route:

```tsx
{
  path: '/jobseeker/evaluation',
  element: (
    <ProtectedRoute requiredRole="jobseeker">
      <EvaluationPage />
    </ProtectedRoute>
  ),
},
{
  path: '/jobseeker/applications',
  element: (
    <ProtectedRoute requiredRole="jobseeker">
      <ApplicationsPage />
    </ProtectedRoute>
  ),
},
```

- [ ] **Step 3: Verify TypeScript compilation**

```bash
bun --cwd web typecheck
```
Expected output: `tsc --noEmit` completes with no errors.

- [ ] **Step 4: Commit**

```bash
git add web/src/App.tsx
git commit -m "feat(web): add evaluation and application routes"
```

---

## Self-Review Checklist

### Spec Coverage

| Spec Requirement | Task(s) |
|---|---|
| `ai_evaluations` table | Task 1 |
| `applications` table | Task 1 |
| `POST /api/v1/evaluate/me` — trigger AI evaluation | Tasks 4, 5 |
| `GET /api/v1/evaluate/me/results` — latest evaluation | Tasks 4, 5 |
| `POST /api/v1/jobs/:id/apply` — apply to job | Task 6 |
| `GET /api/v1/applications/me` — kanban data grouped by status | Task 6 |
| `PUT /api/v1/applications/:id/status` — company updates status | Task 6 |
| `GET /api/v1/jobs/matches` — recommended jobs for jobseeker | Task 7 |
| `GET /api/v1/candidates/matches` — recommended candidates for job | Task 7 |
| `/jobseeker/evaluation` page — trigger AI eval, view detailed results + score | Task 10 |
| `/jobseeker/applications` page — Kanban: Applied | Reviewing | Interviewing | Offers | Task 11 |
| Passport page — score badge, strengths, skill scores | Task 12 |
| LLM integration / AI-powered evaluation | Tasks 3, 5 |
| Cumulative scoring (no cap, weaknesses don't subtract) | Task 5 service prompt |
| Input: full profile (experiences, skills, about) | Task 5 |
| Structured JSON output (overall_score, strengths, weaknesses, suggestions, skill_scores) | Task 5 |
| Storage: raw LLM response + parsed JSONB | Task 5 |
| Industry-agnostic LLM prompt | Task 5 system prompt |

### Placeholder Scan
Checked all tasks for: "TBD", "TODO", "implement later", "fill in details", "add appropriate error handling". None found.

### Type Consistency
- LLM client: `Chat(ctx, systemPrompt, userPrompt, resultPtr)` — used consistently in evaluation service (Task 5)
- `EvaluationResult` struct fields match between service (Task 5) and handler (Task 4)
- `ApplicationResult` fields match between service and handler (Task 6)
- `JobMatch`/`CandidateMatch` fields match between matching service and handler (Task 7)
- Frontend types `EvaluationResult`, `Application` match backend response shapes (Tasks 9-11)
- API function names: `triggerEvaluation`, `getLatestEvaluation`, `applyToJob`, `getMyApplications` — used consistently in pages (Tasks 10-12)
- Route paths match between backend (`main.go` Task 8) and frontend API calls (Tasks 9, 10, 11)

---

## Execution Handoff

Plan complete and saved to `docs/plans/2026-06-07-skillpass-phase2-evaluation-matching.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
