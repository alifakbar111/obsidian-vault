# Phase 3: Feedback & Career Growth — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement company-to-candidate feedback with AI learning suggestions, Skill Gap Radar, AI career path predictions, Company Rep Score, and profile view tracking.

**Architecture:** 4 new PostgreSQL tables, 4 Go handler packages (feedback, company-reviews, career, profile-views), 9 API routes, 5 React pages. Feedback uses background AI processing via existing LLMClient.

**Tech Stack:** Go 1.24 (Gin), React 19, Tailwind CSS v4 + DaisyUI 5, PostgreSQL 16, pgx + go-jet, React Query, Zod, Biome 2.x

---

## File Structure

### Database
- Create: `server-go/migrations/000014_phase3_feedback.sql` — feedback table
- Create: `server-go/migrations/000015_phase3_company_reviews.sql` — company_reviews table
- Create: `server-go/migrations/000016_phase3_career_paths.sql` — career_paths table
- Create: `server-go/migrations/000017_phase3_profile_views.sql` — profile_views table

### Server Handlers
- Create: `server-go/internal/feedback/handler.go` — feedback CRUD + AI suggestions
- Create: `server-go/internal/feedback/service.go` — business logic + LLM integration
- Create: `server-go/internal/companyreviews/handler.go` — company reviews + reputation
- Create: `server-go/internal/companyreviews/service.go` — scoring logic
- Create: `server-go/internal/career/handler.go` — career paths + skill gap + prediction
- Create: `server-go/internal/career/service.go` — aggregation + LLM prediction
- Create: `server-go/internal/profileviews/handler.go` — profile view tracking
- Create: `server-go/internal/profileviews/service.go` — view recording + retrieval

### Route Registration
- Modify: `server-go/cmd/server/main.go` — add Phase 3 routes

### Frontend API Layer
- Create: `web/src/lib/feedback.ts` — feedback API functions
- Create: `web/src/lib/company-reviews.ts` — company review API functions
- Create: `web/src/lib/career.ts` — career path API functions
- Create: `web/src/lib/profile-views.ts` — profile view API functions

### Frontend Pages
- Create: `web/src/pages/jobseeker/FeedbackPage/index.tsx` — feedback + AI suggestions
- Create: `web/src/pages/jobseeker/CareerPage/index.tsx` — skill gap radar + career path
- Create: `web/src/pages/jobseeker/AnalyticsPage/index.tsx` — profile views + stats
- Create: `web/src/pages/company/FeedbackHistoryPage/index.tsx` — feedback given
- Create: `web/src/pages/company/ReputationPage/index.tsx` — reviews + score

### Frontend Routes
- Modify: `web/src/App.tsx` — add 5 new routes

---

## Task 1: Create Database Migrations

### Step 1.1: Create feedback table migration

- [ ] Create `server-go/migrations/000014_phase3_feedback.sql`:

```sql
-- Phase 3: Company-to-candidate feedback

CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES jobseeker_profiles(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    content TEXT NOT NULL DEFAULT '',
    rating_areas JSONB NOT NULL DEFAULT '[]',
    ai_suggestions JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS feedback_profile_idx ON feedback(profile_id);
CREATE INDEX IF NOT EXISTS feedback_company_idx ON feedback(company_id);
```

### Step 1.2: Create company_reviews table migration

- [ ] Create `server-go/migrations/000015_phase3_company_reviews.sql`:

```sql
-- Phase 3: Candidate reviews of companies

CREATE TYPE interaction_type AS ENUM ('applied', 'interviewed');

CREATE TABLE IF NOT EXISTS company_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES jobseeker_profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    interaction_type interaction_type NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(company_id, candidate_id)
);

CREATE INDEX IF NOT EXISTS company_reviews_company_idx ON company_reviews(company_id);
CREATE INDEX IF NOT EXISTS company_reviews_candidate_idx ON company_reviews(candidate_id);
```

### Step 1.3: Create career_paths table migration

- [ ] Create `server-go/migrations/000016_phase3_career_paths.sql`:

```sql
-- Phase 3: Career path definitions

CREATE TABLE IF NOT EXISTS career_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    skill_requirements JSONB NOT NULL DEFAULT '[]',
    typical_progression JSONB NOT NULL DEFAULT '[]',
    industry TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS career_paths_industry_idx ON career_paths(industry);
```

### Step 1.4: Create profile_views table migration

- [ ] Create `server-go/migrations/000017_phase3_profile_views.sql`:

```sql
-- Phase 3: Profile view tracking

CREATE TABLE IF NOT EXISTS profile_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES jobseeker_profiles(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    viewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profile_views_profile_idx ON profile_views(profile_id);
CREATE INDEX IF NOT EXISTS profile_views_company_idx ON profile_views(company_id);
```

### Step 1.5: Run migrations and generate types

- [ ] Run migrations: `bun run db:migrate`
- [ ] Generate go-jet types: `bun run db:generate`

---

## Task 2: Create Feedback Handler

### Step 2.1: Create feedback service

- [ ] Create `server-go/internal/feedback/service.go`:

```go
package feedback

import (
	"context"
	"database/sql"
	"encoding/json"
	"log/slog"

	"skillpass-server-go/internal/lib"
)

type Service struct {
	db  *sql.DB
	llm lib.LLMClient
}

func NewService(db *sql.DB, llm lib.LLMClient) *Service {
	return &Service{db: db, llm: llm}
}

type RatingArea struct {
	Skill string `json:"skill"`
	Rating int   `json:"rating"`
	Note  string `json:"note"`
}

type AISuggestion struct {
	Area     string `json:"area"`
	Tip      string `json:"tip"`
	Resource string `json:"resource,omitempty"`
}

type Feedback struct {
	ID            string           `json:"id"`
	ProfileID     string           `json:"profileId"`
	CompanyID     string           `json:"companyId"`
	Content       string           `json:"content"`
	RatingAreas   []RatingArea     `json:"ratingAreas"`
	AISuggestions []AISuggestion   `json:"aiSuggestions"`
	CreatedAt     string           `json:"createdAt"`
}

type CreateFeedbackRequest struct {
	Content     string       `json:"content"`
	RatingAreas []RatingArea `json:"ratingAreas"`
}

func (s *Service) Create(ctx context.Context, profileID, companyID string, req CreateFeedbackRequest) (*Feedback, error) {
	ratingAreasJSON, err := json.Marshal(req.RatingAreas)
	if err != nil {
		return nil, err
	}

	var id string
	err = s.db.QueryRowContext(ctx,
		`INSERT INTO feedback (profile_id, company_id, content, rating_areas)
		 VALUES ($1, $2, $3, $4)
		 RETURNING id`,
		profileID, companyID, req.Content, ratingAreasJSON,
	).Scan(&id)
	if err != nil {
		return nil, err
	}

	go s.generateAISuggestions(context.Background(), id, req)

	return s.GetByID(ctx, id)
}

func (s *Service) GetByID(ctx context.Context, id string) (*Feedback, error) {
	var f Feedback
	var ratingAreasJSON, aiSuggestionsJSON []byte

	err := s.db.QueryRowContext(ctx,
		`SELECT id, profile_id, company_id, content, rating_areas, ai_suggestions, created_at
		 FROM feedback WHERE id = $1`, id,
	).Scan(&f.ID, &f.ProfileID, &f.CompanyID, &f.Content, &ratingAreasJSON, &aiSuggestionsJSON, &f.CreatedAt)
	if err != nil {
		return nil, err
	}

	if err := json.Unmarshal(ratingAreasJSON, &f.RatingAreas); err != nil {
		return nil, err
	}
	if err := json.Unmarshal(aiSuggestionsJSON, &f.AISuggestions); err != nil {
		return nil, err
	}

	return &f, nil
}

func (s *Service) GetByProfileID(ctx context.Context, profileID string) ([]Feedback, error) {
	rows, err := s.db.QueryContext(ctx,
		`SELECT id, profile_id, company_id, content, rating_areas, ai_suggestions, created_at
		 FROM feedback WHERE profile_id = $1 ORDER BY created_at DESC`, profileID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []Feedback
	for rows.Next() {
		var f Feedback
		var ratingAreasJSON, aiSuggestionsJSON []byte
		if err := rows.Scan(&f.ID, &f.ProfileID, &f.CompanyID, &f.Content, &ratingAreasJSON, &aiSuggestionsJSON, &f.CreatedAt); err != nil {
			return nil, err
		}
		if err := json.Unmarshal(ratingAreasJSON, &f.RatingAreas); err != nil {
			return nil, err
		}
		if err := json.Unmarshal(aiSuggestionsJSON, &f.AISuggestions); err != nil {
			return nil, err
		}
		results = append(results, f)
	}
	return results, nil
}

func (s *Service) generateAISuggestions(ctx context.Context, feedbackID string, req CreateFeedbackRequest) {
	type aiResponse struct {
		Suggestions []AISuggestion `json:"suggestions"`
	}

	ratingAreasText := ""
	for _, r := range req.RatingAreas {
		ratingAreasText += "- " + r.Skill + " (Rating: " + string(rune('0'+r.Rating)) + "): " + r.Note + "\n"
	}

	systemPrompt := `You are a career coach. Analyze the feedback and generate specific, actionable learning suggestions for each weak area. Return JSON with a "suggestions" array containing objects with "area", "tip", and optional "resource" fields.`

	userPrompt := `Company feedback on candidate:\n\nFeedback: ${req.Content}\n\nSkill ratings:\n${ratingAreasText}\n\nGenerate learning suggestions for areas rated 3 or below.`

	var result aiResponse
	if err := s.llm.Chat(ctx, systemPrompt, userPrompt, &result); err != nil {
		slog.Error("failed to generate AI suggestions", "feedbackID", feedbackID, "error", err)
		return
	}

	suggestionsJSON, err := json.Marshal(result.Suggestions)
	if err != nil {
		slog.Error("failed to marshal suggestions", "feedbackID", feedbackID, "error", err)
		return
	}

	_, err = s.db.ExecContext(ctx,
		`UPDATE feedback SET ai_suggestions = $1 WHERE id = $2`,
		suggestionsJSON, feedbackID,
	)
	if err != nil {
		slog.Error("failed to save AI suggestions", "feedbackID", feedbackID, "error", err)
	}
}
```

### Step 2.2: Create feedback handler

- [ ] Create `server-go/internal/feedback/handler.go`:

```go
package feedback

import (
	"errors"
	"log/slog"
	"net/http"

	"database/sql"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Handler struct {
	db      *sql.DB
	service *Service
}

func NewHandler(db *sql.DB, service *Service) *Handler {
	return &Handler{db: db, service: service}
}

// PostFeedback	godoc
// @Summary		Give feedback to a candidate
// @Description	Company gives feedback to a jobseeker profile
// @Tags		feedback
// @Accept		json
// @Produce		json
// @Security	BearerAuth
// @Param		profile_id	path	string	true	"Jobseeker profile ID"
// @Param		request		body	CreateFeedbackRequest	true	"Feedback data"
// @Success		201 {object} Feedback
// @Failure		401 {object} map[string]string
// @Failure		403 {object} map[string]string
// @Router		/feedback/{profile_id} [post]
func (h *Handler) PostFeedback(c *gin.Context) {
	companyIDVal, ok := c.Get("companyId")
	if !ok {
		c.JSON(http.StatusForbidden, gin.H{"error": "Company access required"})
		return
	}
	companyID, ok := companyIDVal.(string)
	if !ok || companyID == "" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Company access required"})
		return
	}

	profileID := c.Param("profile_id")
	if _, err := uuid.Parse(profileID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid profile ID"})
		return
	}

	var req CreateFeedbackRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	feedback, err := h.service.Create(c.Request.Context(), profileID, companyID, req)
	if err != nil {
		slog.Error("failed to create feedback", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create feedback"})
		return
	}

	c.JSON(http.StatusCreated, feedback)
}

// GetMyFeedback	godoc
// @Summary		Get feedback for my profile
// @Description	Jobseeker sees all feedback received on their profile
// @Tags		feedback
// @Produce		json
// @Security	BearerAuth
// @Success		200 {array} Feedback
// @Failure		401 {object} map[string]string
// @Failure		404 {object} map[string]string
// @Router		/feedback/me [get]
func (h *Handler) GetMyFeedback(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	profileID, err := h.lookupProfileID(userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Jobseeker profile not found"})
			return
		}
		slog.Error("profile lookup failed", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to lookup profile"})
		return
	}

	feedback, err := h.service.GetByProfileID(c.Request.Context(), profileID)
	if err != nil {
		slog.Error("failed to get feedback", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get feedback"})
		return
	}

	c.JSON(http.StatusOK, feedback)
}

// GetMySuggestions	godoc
// @Summary		Get AI suggestions for my profile
// @Description	Jobseeker sees AI-generated learning suggestions from feedback
// @Tags		feedback
// @Produce		json
// @Security	BearerAuth
// @Success		200 {array} AISuggestion
// @Failure		401 {object} map[string]string
// @Failure		404 {object} map[string]string
// @Router		/feedback/suggestions/me [get]
func (h *Handler) GetMySuggestions(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	profileID, err := h.lookupProfileID(userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Jobseeker profile not found"})
			return
		}
		slog.Error("profile lookup failed", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to lookup profile"})
		return
	}

	feedbackList, err := h.service.GetByProfileID(c.Request.Context(), profileID)
	if err != nil {
		slog.Error("failed to get feedback", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get feedback"})
		return
	}

	var allSuggestions []AISuggestion
	for _, f := range feedbackList {
		allSuggestions = append(allSuggestions, f.AISuggestions...)
	}

	c.JSON(http.StatusOK, allSuggestions)
}

func (h *Handler) lookupProfileID(userID string) (string, error) {
	var profileID uuid.UUID
	err := h.db.QueryRow(
		`SELECT id FROM jobseeker_profiles WHERE user_id = $1`, userID,
	).Scan(&profileID)
	if err != nil {
		return "", err
	}
	return profileID.String(), nil
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
```

---

## Task 3: Create Company Reviews Handler

### Step 3.1: Create company reviews service

- [ ] Create `server-go/internal/companyreviews/service.go`:

```go
package companyreviews

import (
	"context"
	"database/sql"
)

type Service struct {
	db *sql.DB
}

func NewService(db *sql.DB) *Service {
	return &Service{db: db}
}

type CompanyReview struct {
	ID              string  `json:"id"`
	CompanyID       string  `json:"companyId"`
	CandidateID     string  `json:"candidateId"`
	Rating          int     `json:"rating"`
	Review          *string `json:"review"`
	InteractionType string  `json:"interactionType"`
	CreatedAt       string  `json:"createdAt"`
}

type Reputation struct {
	AverageRating float64 `json:"averageRating"`
	ReviewCount   int     `json:"reviewCount"`
}

type CreateReviewRequest struct {
	Rating          int     `json:"rating"`
	Review          *string `json:"review"`
	InteractionType string  `json:"interactionType"`
}

func (s *Service) Create(ctx context.Context, companyID, candidateID string, req CreateReviewRequest) (*CompanyReview, error) {
	var id string
	err := s.db.QueryRowContext(ctx,
		`INSERT INTO company_reviews (company_id, candidate_id, rating, review, interaction_type)
		 VALUES ($1, $2, $3, $4, $5)
		 ON CONFLICT (company_id, candidate_id) DO UPDATE SET
			rating = EXCLUDED.rating,
			review = EXCLUDED.review,
			interaction_type = EXCLUDED.interaction_type
		 RETURNING id`,
		companyID, candidateID, req.Rating, req.Review, req.InteractionType,
	).Scan(&id)
	if err != nil {
		return nil, err
	}

	return s.GetByID(ctx, id)
}

func (s *Service) GetByID(ctx context.Context, id string) (*CompanyReview, error) {
	var r CompanyReview
	err := s.db.QueryRowContext(ctx,
		`SELECT id, company_id, candidate_id, rating, review, interaction_type, created_at
		 FROM company_reviews WHERE id = $1`, id,
	).Scan(&r.ID, &r.CompanyID, &r.CandidateID, &r.Rating, &r.Review, &r.InteractionType, &r.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &r, nil
}

func (s *Service) GetReputation(ctx context.Context, companyID string) (*Reputation, error) {
	var rep Reputation
	err := s.db.QueryRowContext(ctx,
		`SELECT COALESCE(AVG(rating), 0), COUNT(*)
		 FROM company_reviews WHERE company_id = $1`, companyID,
	).Scan(&rep.AverageRating, &rep.ReviewCount)
	if err != nil {
		return nil, err
	}
	return &rep, nil
}
```

### Step 3.2: Create company reviews handler

- [ ] Create `server-go/internal/companyreviews/handler.go`:

```go
package companyreviews

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// PostReview	godoc
// @Summary		Rate a company
// @Description	Candidate rates a company after applying or interviewing
// @Tags		company-reviews
// @Accept		json
// @Produce		json
// @Security	BearerAuth
// @Param		id	path	string	true	"Company ID"
// @Param		request	body	CreateReviewRequest	true	"Review data"
// @Success		201 {object} CompanyReview
// @Failure		400 {object} map[string]string
// @Failure		401 {object} map[string]string
// @Router		/companies/{id}/reviews [post]
func (h *Handler) PostReview(c *gin.Context) {
	companyID := c.Param("id")
	if _, err := uuid.Parse(companyID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid company ID"})
		return
	}

	userIDVal, ok := c.Get("userId")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID, ok := userIDVal.(string)
	if !ok || userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var candidateID string
	err := c.db.QueryRowContext(c.Request.Context(),
		`SELECT id FROM jobseeker_profiles WHERE user_id = $1`, userID,
	).Scan(&candidateID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Jobseeker profile not found"})
		return
	}

	var req CreateReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	review, err := h.service.Create(c.Request.Context(), companyID, candidateID, req)
	if err != nil {
		slog.Error("failed to create review", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create review"})
		return
	}

	c.JSON(http.StatusCreated, review)
}

// GetReputation	godoc
// @Summary		Get company reputation
// @Description	Get aggregated rating and review count for a company
// @Tags		company-reviews
// @Produce		json
// @Param		id	path	string	true	"Company ID"
// @Success		200 {object} Reputation
// @Failure		400 {object} map[string]string
// @Router		/companies/{id}/reputation [get]
func (h *Handler) GetReputation(c *gin.Context) {
	companyID := c.Param("id")
	if _, err := uuid.Parse(companyID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid company ID"})
		return
	}

	rep, err := h.service.GetReputation(c.Request.Context(), companyID)
	if err != nil {
		slog.Error("failed to get reputation", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get reputation"})
		return
	}

	c.JSON(http.StatusOK, rep)
}
```

---

## Task 4: Create Career Handler

### Step 4.1: Create career service

- [ ] Create `server-go/internal/career/service.go`:

```go
package career

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log/slog"

	"skillpass-server-go/internal/lib"
)

type Service struct {
	db  *sql.DB
	llm lib.LLMClient
}

func NewService(db *sql.DB, llm lib.LLMClient) *Service {
	return &Service{db: db, llm: llm}
}

type SkillRequirement struct {
	Skill  string `json:"skill"`
	Level  int    `json:"level"`
	Weight int    `json:"weight"`
}

type ProgressionStep struct {
	FromRole string `json:"fromRole"`
	ToRole   string `json:"toRole"`
}

type CareerPath struct {
	ID                  string               `json:"id"`
	Title               string               `json:"title"`
	Description         string               `json:"description"`
	SkillRequirements   []SkillRequirement   `json:"skillRequirements"`
	TypicalProgression  []ProgressionStep    `json:"typicalProgression"`
	Industry            string               `json:"industry"`
}

type SkillGapItem struct {
	Skill        string `json:"skill"`
	CurrentLevel int    `json:"currentLevel"`
	RequiredLevel int   `json:"requiredLevel"`
	Gap          int    `json:"gap"`
}

type SkillGapResult struct {
	Industry string         `json:"industry"`
	Skills   []SkillGapItem `json:"skills"`
}

type CareerPrediction struct {
	PredictedRole string `json:"predictedRole"`
	Timeline      string `json:"timeline"`
	SimilarProfiles int  `json:"similarProfiles"`
	Strengths     []string `json:"strengths"`
	Weaknesses    []string `json:"weaknesses"`
	Recommendations []string `json:"recommendations"`
}

func (s *Service) ListPaths(ctx context.Context, industry string) ([]CareerPath, error) {
	query := `SELECT id, title, description, skill_requirements, typical_progression, industry FROM career_paths`
	var args []interface{}
	if industry != "" {
		query += ` WHERE industry = $1`
		args = append(args, industry)
	}
	query += ` ORDER BY title`

	rows, err := s.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []CareerPath
	for rows.Next() {
		var cp CareerPath
		var skillReqsJSON, progressionJSON []byte
		if err := rows.Scan(&cp.ID, &cp.Title, &cp.Description, &skillReqsJSON, &progressionJSON, &cp.Industry); err != nil {
			return nil, err
		}
		if err := json.Unmarshal(skillReqsJSON, &cp.SkillRequirements); err != nil {
			return nil, err
		}
		if err := json.Unmarshal(progressionJSON, &cp.TypicalProgression); err != nil {
			return nil, err
		}
		results = append(results, cp)
	}
	return results, nil
}

func (s *Service) GetSkillGap(ctx context.Context, profileID string) (*SkillGapResult, error) {
	var industry string
	err := s.db.QueryRowContext(ctx,
		`SELECT COALESCE(industry, '') FROM jobseeker_profiles WHERE id = $1`, profileID,
	).Scan(&industry)
	if err != nil {
		return nil, err
	}

	var skillScoresJSON []byte
	err = s.db.QueryRowContext(ctx,
		`SELECT skill_scores FROM ai_evaluations
		 WHERE profile_id = $1 ORDER BY created_at DESC LIMIT 1`, profileID,
	).Scan(&skillScoresJSON)
	if err != nil {
		if err == sql.ErrNoRows {
			return &SkillGapResult{Industry: industry, Skills: []SkillGapItem{}}, nil
		}
		return nil, err
	}

	type evalSkillScore struct {
		Skill string `json:"skill"`
		Score int    `json:"score"`
	}
	var currentScores []evalSkillScore
	if err := json.Unmarshal(skillScoresJSON, &currentScores); err != nil {
		return nil, err
	}

	scoresMap := make(map[string]int)
	for _, s := range currentScores {
		scoresMap[s.Skill] = s.Score
	}

	rows, err := s.db.QueryContext(ctx,
		`SELECT skill_requirements FROM career_paths WHERE industry = $1`, industry,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	reqTotals := make(map[string]int)
	reqCounts := make(map[string]int)
	for rows.Next() {
		var reqsJSON []byte
		if err := rows.Scan(&reqsJSON); err != nil {
			return nil, err
		}
		var reqs []SkillRequirement
		if err := json.Unmarshal(reqsJSON, &reqs); err != nil {
			return nil, err
		}
		for _, r := range reqs {
			reqTotals[r.Skill] += r.Level
			reqCounts[r.Skill]++
		}
	}

	var skills []SkillGapItem
	for skill, total := range reqTotals {
		avgRequired := total / reqCounts[skill]
		current := scoresMap[skill]
		gap := avgRequired - current
		if gap < 0 {
			gap = 0
		}
		skills = append(skills, SkillGapItem{
			Skill:         skill,
			CurrentLevel:  current,
			RequiredLevel: avgRequired,
			Gap:           gap,
		})
	}

	return &SkillGapResult{Industry: industry, Skills: skills}, nil
}

func (s *Service) PredictPath(ctx context.Context, profileID string) (*CareerPrediction, error) {
	type aiResponse struct {
		PredictedRole   string   `json:"predictedRole"`
		Timeline        string   `json:"timeline"`
		SimilarProfiles int      `json:"similarProfiles"`
		Strengths       []string `json:"strengths"`
		Weaknesses      []string `json:"weaknesses"`
		Recommendations []string `json:"recommendations"`
	}

	var skillScoresJSON, strengthsJSON, weaknessesJSON []byte
	err := s.db.QueryRowContext(ctx,
		`SELECT skill_scores, strengths, weaknesses FROM ai_evaluations
		 WHERE profile_id = $1 ORDER BY created_at DESC LIMIT 1`, profileID,
	).Scan(&skillScoresJSON, &strengthsJSON, &weaknessesJSON)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("no evaluation found")
		}
		return nil, err
	}

	systemPrompt := `You are a career predictor. Analyze the candidate's skill profile and predict their likely career trajectory. Return JSON with "predictedRole", "timeline", "similarProfiles" (estimated count), "strengths", "weaknesses", and "recommendations".`

	userPrompt := fmt.Sprintf(`Candidate skills: %s\nStrengths: %s\nWeaknesses: %s\n\nPredict their career path.`, skillScoresJSON, strengthsJSON, weaknessesJSON)

	var result aiResponse
	if err := s.llm.Chat(ctx, systemPrompt, userPrompt, &result); err != nil {
		slog.Error("career prediction failed", "profileID", profileID, "error", err)
		return nil, err
	}

	return &CareerPrediction{
		PredictedRole:   result.PredictedRole,
		Timeline:        result.Timeline,
		SimilarProfiles: result.SimilarProfiles,
		Strengths:       result.Strengths,
		Weaknesses:      result.Weaknesses,
		Recommendations: result.Recommendations,
	}, nil
}
```

### Step 4.2: Create career handler

- [ ] Create `server-go/internal/career/handler.go`:

```go
package career

import (
	"errors"
	"log/slog"
	"net/http"

	"database/sql"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Handler struct {
	db      *sql.DB
	service *Service
}

func NewHandler(db *sql.DB, service *Service) *Handler {
	return &Handler{db: db, service: service}
}

// ListCareerPaths	godoc
// @Summary		List career paths
// @Description	Get available career paths, optionally filtered by industry
// @Tags		career
// @Produce		json
// @Security	BearerAuth
// @Param		industry	query	string	false	"Filter by industry"
// @Success		200 {array} CareerPath
// @Failure		401 {object} map[string]string
// @Router		/career/paths [get]
func (h *Handler) ListCareerPaths(c *gin.Context) {
	industry := c.Query("industry")

	paths, err := h.service.ListPaths(c.Request.Context(), industry)
	if err != nil {
		slog.Error("failed to list career paths", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list career paths"})
		return
	}

	c.JSON(http.StatusOK, paths)
}

// GetSkillGap	godoc
// @Summary		Get skill gap analysis
// @Description	Compare jobseeker skills against market demand for their industry
// @Tags		career
// @Produce		json
// @Security	BearerAuth
// @Success		200 {object} SkillGapResult
// @Failure		401 {object} map[string]string
// @Failure		404 {object} map[string]string
// @Router		/career/skill-gap/me [get]
func (h *Handler) GetSkillGap(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	profileID, err := h.lookupProfileID(userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Jobseeker profile not found"})
			return
		}
		slog.Error("profile lookup failed", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to lookup profile"})
		return
	}

	result, err := h.service.GetSkillGap(c.Request.Context(), profileID)
	if err != nil {
		slog.Error("skill gap failed", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to calculate skill gap"})
		return
	}

	c.JSON(http.StatusOK, result)
}

// GetCareerPath	godoc
// @Summary		Get predicted career path
// @Description	AI predicts career trajectory based on skill profile
// @Tags		career
// @Produce		json
// @Security	BearerAuth
// @Success		200 {object} CareerPrediction
// @Failure		401 {object} map[string]string
// @Failure		404 {object} map[string]string
// @Router		/career/path/me [get]
func (h *Handler) GetCareerPath(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	profileID, err := h.lookupProfileID(userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Jobseeker profile not found"})
			return
		}
		slog.Error("profile lookup failed", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to lookup profile"})
		return
	}

	result, err := h.service.PredictPath(c.Request.Context(), profileID)
	if err != nil {
		slog.Error("career prediction failed", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to predict career path"})
		return
	}

	c.JSON(http.StatusOK, result)
}

func (h *Handler) lookupProfileID(userID string) (string, error) {
	var profileID uuid.UUID
	err := h.db.QueryRow(
		`SELECT id FROM jobseeker_profiles WHERE user_id = $1`, userID,
	).Scan(&profileID)
	if err != nil {
		return "", err
	}
	return profileID.String(), nil
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
```

---

## Task 5: Create Profile Views Handler

### Step 5.1: Create profile views service

- [ ] Create `server-go/internal/profileviews/service.go`:

```go
package profileviews

import (
	"context"
	"database/sql"
)

type Service struct {
	db *sql.DB
}

func NewService(db *sql.DB) *Service {
	return &Service{db: db}
}

type ProfileView struct {
	ID        string `json:"id"`
	ProfileID string `json:"profileId"`
	CompanyID string `json:"companyId"`
	ViewedAt  string `json:"viewedAt"`
}

func (s *Service) RecordView(ctx context.Context, profileID, companyID string) error {
	_, err := s.db.ExecContext(ctx,
		`INSERT INTO profile_views (profile_id, company_id) VALUES ($1, $2)`,
		profileID, companyID,
	)
	return err
}

func (s *Service) GetViewsByProfile(ctx context.Context, profileID string) ([]ProfileView, error) {
	rows, err := s.db.QueryContext(ctx,
		`SELECT id, profile_id, company_id, viewed_at
		 FROM profile_views WHERE profile_id = $1 ORDER BY viewed_at DESC`, profileID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []ProfileView
	for rows.Next() {
		var v ProfileView
		if err := rows.Scan(&v.ID, &v.ProfileID, &v.CompanyID, &v.ViewedAt); err != nil {
			return nil, err
		}
		results = append(results, v)
	}
	return results, nil
}
```

### Step 5.2: Create profile views handler

- [ ] Create `server-go/internal/profileviews/handler.go`:

```go
package profileviews

import (
	"errors"
	"log/slog"
	"net/http"

	"database/sql"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Handler struct {
	db      *sql.DB
	service *Service
}

func NewHandler(db *sql.DB, service *Service) *Handler {
	return &Handler{db: db, service: service}
}

// GetMyProfileViews	godoc
// @Summary		Get profile views
// @Description	See who viewed the jobseeker's profile
// @Tags		profile-views
// @Produce		json
// @Security	BearerAuth
// @Success		200 {array} ProfileView
// @Failure		401 {object} map[string]string
// @Failure		404 {object} map[string]string
// @Router		/profiles/me/views [get]
func (h *Handler) GetMyProfileViews(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	profileID, err := h.lookupProfileID(userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Jobseeker profile not found"})
			return
		}
		slog.Error("profile lookup failed", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to lookup profile"})
		return
	}

	views, err := h.service.GetViewsByProfile(c.Request.Context(), profileID)
	if err != nil {
		slog.Error("failed to get profile views", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get profile views"})
		return
	}

	c.JSON(http.StatusOK, views)
}

// RecordView records a company viewing a profile (called internally)
func (h *Handler) RecordView(c *gin.Context) {
	companyIDVal, ok := c.Get("companyId")
	if !ok {
		return
	}
	companyID, ok := companyIDVal.(string)
	if !ok || companyID == "" {
		return
	}

	profileID := c.Param("profile_id")
	if _, err := uuid.Parse(profileID); err != nil {
		return
	}

	_ = h.service.RecordView(c.Request.Context(), profileID, companyID)
}

func (h *Handler) lookupProfileID(userID string) (string, error) {
	var profileID uuid.UUID
	err := h.db.QueryRow(
		`SELECT id FROM jobseeker_profiles WHERE user_id = $1`, userID,
	).Scan(&profileID)
	if err != nil {
		return "", err
	}
	return profileID.String(), nil
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
```

---

## Task 6: Register Routes in main.go

### Step 6.1: Add imports

- [ ] Modify `server-go/cmd/server/main.go` — add imports:

```go
import (
	// ... existing imports ...
	"skillpass-server-go/internal/career"
	"skillpass-server-go/internal/companyreviews"
	"skillpass-server-go/internal/feedback"
	"skillpass-server-go/internal/profileviews"
)
```

### Step 6.2: Add handler initialization

- [ ] Modify `server-go/cmd/server/main.go` — after line 120 (matchHandler):

```go
// Phase 3: Feedback & Career Growth
feedbackService := feedback.NewService(database, llmClient)
feedbackHandler := feedback.NewHandler(database, feedbackService)

companyReviewsService := companyreviews.NewService(database)
companyReviewsHandler := companyreviews.NewHandler(companyReviewsService)

careerService := career.NewService(database, llmClient)
careerHandler := career.NewHandler(database, careerService)

profileViewsService := profileviews.NewService(database)
profileViewsHandler := profileviews.NewHandler(database, profileViewsService)
```

### Step 6.3: Add route groups

- [ ] Modify `server-go/cmd/server/main.go` — after the matching routes (line 243):

```go
// ── Phase 3: Feedback & Career Growth ──

// Feedback routes (company gives feedback)
feedbackCompanyGroup := api.Group("/feedback")
for _, m := range verifiedCompany {
	feedbackCompanyGroup.Use(m)
}
feedbackCompanyGroup.POST("/:profile_id", feedbackHandler.PostFeedback)

// Feedback routes (jobseeker views feedback)
feedbackJobseekerGroup := api.Group("/feedback")
feedbackJobseekerGroup.Use(middleware.AuthRequired(cfg.JWTSecret), middleware.RequireRole("jobseeker"))
feedbackJobseekerGroup.GET("/me", feedbackHandler.GetMyFeedback)
feedbackJobseekerGroup.GET("/suggestions/me", feedbackHandler.GetMySuggestions)

// Company reviews (candidate rates company)
reviewsGroup := api.Group("/companies")
reviewsGroup.Use(middleware.AuthRequired(cfg.JWTSecret), middleware.RequireRole("jobseeker"))
reviewsGroup.POST("/:id/reviews", companyReviewsHandler.PostReview)

// Company reputation (public)
api.GET("/companies/:id/reputation", companyReviewsHandler.GetReputation)

// Career paths (authenticated)
careerGroup := api.Group("/career")
careerGroup.Use(middleware.AuthRequired(cfg.JWTSecret), middleware.RequireRole("jobseeker"))
careerGroup.GET("/paths", careerHandler.ListCareerPaths)
careerGroup.GET("/skill-gap/me", careerHandler.GetSkillGap)
careerGroup.GET("/path/me", careerHandler.GetCareerPath)

// Profile views (jobseeker)
profileViewsGroup := api.Group("/profiles")
profileViewsGroup.Use(middleware.AuthRequired(cfg.JWTSecret), middleware.RequireRole("jobseeker"))
profileViewsGroup.GET("/me/views", profileViewsHandler.GetMyProfileViews)

// Record profile views (company views profile)
api.POST("/profiles/:profile_id/view", middleware.AuthRequired(cfg.JWTSecret), middleware.RequireRole("company"), profileViewsHandler.RecordView)
```

---

## Task 7: Create Frontend API Layer

### Step 7.1: Create feedback API

- [ ] Create `web/src/lib/feedback.ts`:

```typescript
import { api } from './api';

export interface RatingArea {
  skill: string;
  rating: number;
  note: string;
}

export interface AISuggestion {
  area: string;
  tip: string;
  resource?: string;
}

export interface Feedback {
  id: string;
  profileId: string;
  companyId: string;
  content: string;
  ratingAreas: RatingArea[];
  aiSuggestions: AISuggestion[];
  createdAt: string;
}

export interface CreateFeedbackRequest {
  content: string;
  ratingAreas: RatingArea[];
}

export async function createFeedback(profileId: string, data: CreateFeedbackRequest): Promise<Feedback> {
  return api<Feedback>(`/feedback/${profileId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getMyFeedback(): Promise<Feedback[]> {
  return api<Feedback[]>('/feedback/me');
}

export async function getMySuggestions(): Promise<AISuggestion[]> {
  return api<AISuggestion[]>('/feedback/suggestions/me');
}
```

### Step 7.2: Create company reviews API

- [ ] Create `web/src/lib/company-reviews.ts`:

```typescript
import { api } from './api';

export interface CompanyReview {
  id: string;
  companyId: string;
  candidateId: string;
  rating: number;
  review: string | null;
  interactionType: 'applied' | 'interviewed';
  createdAt: string;
}

export interface Reputation {
  averageRating: number;
  reviewCount: number;
}

export interface CreateReviewRequest {
  rating: number;
  review?: string;
  interactionType: 'applied' | 'interviewed';
}

export async function createCompanyReview(companyId: string, data: CreateReviewRequest): Promise<CompanyReview> {
  return api<CompanyReview>(`/companies/${companyId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getCompanyReputation(companyId: string): Promise<Reputation> {
  return api<Reputation>(`/companies/${companyId}/reputation`);
}
```

### Step 7.3: Create career API

- [ ] Create `web/src/lib/career.ts`:

```typescript
import { api } from './api';

export interface SkillRequirement {
  skill: string;
  level: number;
  weight: number;
}

export interface ProgressionStep {
  fromRole: string;
  toRole: string;
}

export interface CareerPath {
  id: string;
  title: string;
  description: string;
  skillRequirements: SkillRequirement[];
  typicalProgression: ProgressionStep[];
  industry: string;
}

export interface SkillGapItem {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
}

export interface SkillGapResult {
  industry: string;
  skills: SkillGapItem[];
}

export interface CareerPrediction {
  predictedRole: string;
  timeline: string;
  similarProfiles: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export async function getCareerPaths(industry?: string): Promise<CareerPath[]> {
  const params = industry ? `?industry=${encodeURIComponent(industry)}` : '';
  return api<CareerPath[]>(`/career/paths${params}`);
}

export async function getSkillGap(): Promise<SkillGapResult> {
  return api<SkillGapResult>('/career/skill-gap/me');
}

export async function getCareerPrediction(): Promise<CareerPrediction> {
  return api<CareerPrediction>('/career/path/me');
}
```

### Step 7.4: Create profile views API

- [ ] Create `web/src/lib/profile-views.ts`:

```typescript
import { api } from './api';

export interface ProfileView {
  id: string;
  profileId: string;
  companyId: string;
  viewedAt: string;
}

export async function getMyProfileViews(): Promise<ProfileView[]> {
  return api<ProfileView[]>('/profiles/me/views');
}
```

---

## Task 8: Create Frontend Pages

### Step 8.1: Create FeedbackPage

- [ ] Create `web/src/pages/jobseeker/FeedbackPage/index.tsx`:

```tsx
import { useQuery } from '@tanstack/react-query';
import { LoadingFallback } from '../../../components/ui/LoadingFallback';
import { useAuth } from '../../../hooks/useAuth';
import { getMyFeedback, getMySuggestions } from '../../../lib/feedback';
import type { Feedback, AISuggestion } from '../../../lib/feedback';

export function FeedbackPage() {
  const { user } = useAuth();

  const { data: feedback = [], isLoading: loadingFeedback } = useQuery({
    queryKey: ['feedback', 'me'],
    enabled: !!user,
    queryFn: getMyFeedback,
  });

  const { data: suggestions = [], isLoading: loadingSuggestions } = useQuery({
    queryKey: ['feedback', 'suggestions'],
    enabled: !!user,
    queryFn: getMySuggestions,
  });

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <p>Please log in to view feedback.</p>
      </div>
    );
  }

  if (loadingFeedback || loadingSuggestions) {
    return <LoadingFallback text="Loading feedback" />;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Feedback Received</h1>

      {feedback.length === 0 ? (
        <div className="alert alert-info">
          <span>No feedback received yet. Companies will provide feedback after reviewing your profile.</span>
        </div>
      ) : (
        <div className="space-y-4">
          {feedback.map((item: Feedback) => (
            <div key={item.id} className="card bg-base-200 shadow-md">
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-base-content/60">From Company</p>
                    <p className="text-xs text-base-content/40">{new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="mt-2">{item.content}</p>
                {item.ratingAreas.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold text-sm mb-2">Skill Ratings</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {item.ratingAreas.map((area, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-sm">{area.skill}</span>
                          <div className="badge badge-primary badge-sm">{area.rating}/5</div>
                          {area.note && <span className="text-xs text-base-content/60">{area.note}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-xl font-bold mt-8">AI Learning Suggestions</h2>

      {suggestions.length === 0 ? (
        <div className="alert alert-info">
          <span>No suggestions yet. AI will generate suggestions based on feedback received.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestions.map((suggestion: AISuggestion, i: number) => (
            <div key={i} className="card bg-base-100 border border-base-300">
              <div className="card-body">
                <h3 className="card-title text-sm">{suggestion.area}</h3>
                <p className="text-sm">{suggestion.tip}</p>
                {suggestion.resource && (
                  <a href={suggestion.resource} target="_blank" rel="noopener noreferrer" className="link link-primary text-xs mt-2">
                    Learn more →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Step 8.2: Create CareerPage

- [ ] Create `web/src/pages/jobseeker/CareerPage/index.tsx`:

```tsx
import { useQuery } from '@tanstack/react-query';
import { LoadingFallback } from '../../../components/ui/LoadingFallback';
import { useAuth } from '../../../hooks/useAuth';
import { getSkillGap, getCareerPrediction } from '../../../lib/career';
import type { SkillGapItem, CareerPrediction } from '../../../lib/career';

export function CareerPage() {
  const { user } = useAuth();

  const { data: skillGap, isLoading: loadingGap } = useQuery({
    queryKey: ['career', 'skill-gap'],
    enabled: !!user,
    queryFn: getSkillGap,
  });

  const { data: prediction, isLoading: loadingPrediction } = useQuery({
    queryKey: ['career', 'prediction'],
    enabled: !!user,
    queryFn: getCareerPrediction,
  });

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <p>Please log in to view career insights.</p>
      </div>
    );
  }

  if (loadingGap || loadingPrediction) {
    return <LoadingFallback text="Loading career insights" />;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Career Growth</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Gap Radar */}
        <div className="card bg-base-200 shadow-md">
          <div className="card-body">
            <h2 className="card-title">Skill Gap Radar</h2>
            {skillGap && skillGap.skills.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-base-content/60">Industry: {skillGap.industry || 'Not specified'}</p>
                {skillGap.skills.map((skill: SkillGapItem, i: number) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="w-24 text-sm font-medium">{skill.skill}</span>
                    <div className="flex-1">
                      <div className="h-4 bg-base-300 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${Math.min(skill.currentLevel, 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-base-content/60 w-16 text-right">
                      {skill.currentLevel}/{skill.requiredLevel}
                    </span>
                    {skill.gap > 0 && (
                      <span className="badge badge-warning badge-sm">Gap: {skill.gap}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-base-content/60">Complete an evaluation to see your skill gap analysis.</p>
            )}
          </div>
        </div>

        {/* Career Prediction */}
        <div className="card bg-base-200 shadow-md">
          <div className="card-body">
            <h2 className="card-title">Career Path Prediction</h2>
            {prediction ? (
              <div className="space-y-4">
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <p className="text-lg font-bold text-primary">{prediction.predictedRole}</p>
                  <p className="text-sm text-base-content/60">Timeline: {prediction.timeline}</p>
                  <p className="text-xs text-base-content/40">Based on {prediction.similarProfiles} similar profiles</p>
                </div>

                <div>
                  <h3 className="font-semibold text-sm mb-2">Strengths</h3>
                  <div className="flex flex-wrap gap-2">
                    {prediction.strengths.map((s, i) => (
                      <span key={i} className="badge badge-success badge-outline">{s}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-sm mb-2">Areas to Develop</h3>
                  <div className="flex flex-wrap gap-2">
                    {prediction.weaknesses.map((w, i) => (
                      <span key={i} className="badge badge-warning badge-outline">{w}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-sm mb-2">Recommendations</h3>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {prediction.recommendations.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-sm text-base-content/60">Complete an evaluation to get your career path prediction.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Step 8.3: Create AnalyticsPage

- [ ] Create `web/src/pages/jobseeker/AnalyticsPage/index.tsx`:

```tsx
import { useQuery } from '@tanstack/react-query';
import { LoadingFallback } from '../../../components/ui/LoadingFallback';
import { useAuth } from '../../../hooks/useAuth';
import { getMyProfileViews } from '../../../lib/profile-views';
import { getJobseekerAnalytics } from '../../../lib/analytics';
import type { ProfileView } from '../../../lib/profile-views';

export function AnalyticsPage() {
  const { user } = useAuth();

  const { data: views = [], isLoading: loadingViews } = useQuery({
    queryKey: ['profile-views'],
    enabled: !!user,
    queryFn: getMyProfileViews,
  });

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['jobseeker', 'analytics'],
    enabled: !!user,
    queryFn: () => getJobseekerAnalytics(),
  });

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <p>Please log in to view analytics.</p>
      </div>
    );
  }

  if (loadingViews || loadingStats) {
    return <LoadingFallback text="Loading analytics" />;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="stat bg-base-200 rounded-box p-4">
            <div className="stat-title text-xs">Total Applications</div>
            <div className="stat-value text-xl">{stats.totalApplications}</div>
          </div>
          <div className="stat bg-base-200 rounded-box p-4">
            <div className="stat-title text-xs">Response Rate</div>
            <div className="stat-value text-xl">
              {stats.responseRate !== null ? `${Math.round(stats.responseRate)}%` : '—'}
            </div>
          </div>
          <div className="stat bg-base-200 rounded-box p-4">
            <div className="stat-title text-xs">Profile Views</div>
            <div className="stat-value text-xl">{views.length}</div>
          </div>
        </div>
      )}

      <div className="card bg-base-200 shadow-md">
        <div className="card-body">
          <h2 className="card-title">Profile Views</h2>
          {views.length === 0 ? (
            <p className="text-sm text-base-content/60">No profile views yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Viewed At</th>
                  </tr>
                </thead>
                <tbody>
                  {views.map((view: ProfileView) => (
                    <tr key={view.id}>
                      <td>{view.companyId}</td>
                      <td>{new Date(view.viewedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Step 8.4: Create Company Feedback History Page

- [ ] Create `web/src/pages/company/FeedbackHistoryPage/index.tsx`:

```tsx
import { useQuery } from '@tanstack/react-query';
import { LoadingFallback } from '../../../components/ui/LoadingFallback';
import { useAuth } from '../../../hooks/useAuth';
import { api } from '../../../lib/api';
import type { Feedback } from '../../../lib/feedback';

async function getCompanyFeedback(): Promise<Feedback[]> {
  return api<Feedback[]>('/feedback/company');
}

export function FeedbackHistoryPage() {
  const { user } = useAuth();

  const { data: feedback = [], isLoading } = useQuery({
    queryKey: ['feedback', 'company'],
    enabled: !!user,
    queryFn: getCompanyFeedback,
  });

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <p>Please log in to view feedback history.</p>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingFallback text="Loading feedback history" />;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Feedback History</h1>

      {feedback.length === 0 ? (
        <div className="alert alert-info">
          <span>You haven't given any feedback yet.</span>
        </div>
      ) : (
        <div className="space-y-4">
          {feedback.map((item: Feedback) => (
            <div key={item.id} className="card bg-base-200 shadow-md">
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-base-content/60">Candidate Profile</p>
                    <p className="text-xs text-base-content/40">{new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="mt-2">{item.content}</p>
                {item.ratingAreas.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold text-sm mb-2">Skill Ratings Given</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {item.ratingAreas.map((area, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-sm">{area.skill}</span>
                          <div className="badge badge-primary badge-sm">{area.rating}/5</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Step 8.5: Create Reputation Page

- [ ] Create `web/src/pages/company/ReputationPage/index.tsx`:

```tsx
import { useQuery } from '@tanstack/react-query';
import { LoadingFallback } from '../../../components/ui/LoadingFallback';
import { useAuth } from '../../../hooks/useAuth';
import { getCompanyReputation } from '../../../lib/company-reviews';
import { api } from '../../../lib/api';
import type { Reputation } from '../../../lib/company-reviews';

interface CompanyReview {
  id: string;
  rating: number;
  review: string | null;
  interactionType: string;
  createdAt: string;
}

async function getCompanyReviews(companyId: string): Promise<CompanyReview[]> {
  return api<CompanyReview[]>(`/companies/${companyId}/reviews`);
}

export function ReputationPage() {
  const { user } = useAuth();

  const companyId = user?.companyId;

  const { data: reputation, isLoading: loadingReputation } = useQuery({
    queryKey: ['company', 'reputation'],
    enabled: !!companyId,
    queryFn: () => getCompanyReputation(companyId!),
  });

  const { data: reviews = [], isLoading: loadingReviews } = useQuery({
    queryKey: ['company', 'reviews'],
    enabled: !!companyId,
    queryFn: () => getCompanyReviews(companyId!),
  });

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <p>Please log in to view reputation.</p>
      </div>
    );
  }

  if (loadingReputation || loadingReviews) {
    return <LoadingFallback text="Loading reputation" />;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Company Reputation</h1>

      {reputation && (
        <div className="grid grid-cols-2 gap-4">
          <div className="stat bg-base-200 rounded-box p-4">
            <div className="stat-title text-xs">Average Rating</div>
            <div className="stat-value text-xl text-primary">
              {reputation.averageRating > 0 ? reputation.averageRating.toFixed(1) : '—'}
            </div>
            <div className="stat-desc">out of 5 stars</div>
          </div>
          <div className="stat bg-base-200 rounded-box p-4">
            <div className="stat-title text-xs">Total Reviews</div>
            <div className="stat-value text-xl">{reputation.reviewCount}</div>
          </div>
        </div>
      )}

      <div className="card bg-base-200 shadow-md">
        <div className="card-body">
          <h2 className="card-title">Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-sm text-base-content/60">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review: CompanyReview) => (
                <div key={review.id} className="border-b border-base-300 pb-4 last:border-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="rating rating-sm">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <input
                          key={star}
                          type="radio"
                          name={`rating-${review.id}`}
                          className="mask mask-star-2 bg-warning"
                          checked={star === review.rating}
                          readOnly
                        />
                      ))}
                    </div>
                    <span className="badge badge-outline badge-sm">{review.interactionType}</span>
                    <span className="text-xs text-base-content/40">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  {review.review && <p className="text-sm">{review.review}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## Task 9: Add Frontend Routes

### Step 9.1: Add lazy imports

- [ ] Modify `web/src/App.tsx` — add imports after line 54:

```tsx
const FeedbackPage = lazy(() =>
  import('./pages/jobseeker/FeedbackPage').then((m) => ({ default: m.FeedbackPage })),
);
const CareerPage = lazy(() =>
  import('./pages/jobseeker/CareerPage').then((m) => ({ default: m.CareerPage })),
);
const AnalyticsPage = lazy(() =>
  import('./pages/jobseeker/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })),
);
const FeedbackHistoryPage = lazy(() =>
  import('./pages/company/FeedbackHistoryPage').then((m) => ({ default: m.FeedbackHistoryPage })),
);
const ReputationPage = lazy(() =>
  import('./pages/company/ReputationPage').then((m) => ({ default: m.ReputationPage })),
);
```

### Step 9.2: Add routes

- [ ] Modify `web/src/App.tsx` — add routes after line 105 (after `/jobseeker/matches`):

```tsx
{
  path: '/jobseeker/feedback',
  element: (
    <ProtectedRoute requiredRole="jobseeker">
      <FeedbackPage />
    </ProtectedRoute>
  ),
},
{
  path: '/jobseeker/career',
  element: (
    <ProtectedRoute requiredRole="jobseeker">
      <CareerPage />
    </ProtectedRoute>
  ),
},
{
  path: '/jobseeker/analytics',
  element: (
    <ProtectedRoute requiredRole="jobseeker">
      <AnalyticsPage />
    </ProtectedRoute>
  ),
},
```

- [ ] Modify `web/src/App.tsx` — add routes after line 153 (after `/company/analytics`):

```tsx
{
  path: '/company/feedback',
  element: (
    <ProtectedRoute requiredRole="company">
      <FeedbackHistoryPage />
    </ProtectedRoute>
  ),
},
{
  path: '/company/reputation',
  element: (
    <ProtectedRoute requiredRole="company">
      <ReputationPage />
    </ProtectedRoute>
  ),
},
```

---

## Task 10: Verify and Test

### Step 10.1: Run migrations

- [ ] Run: `bun run db:migrate`

### Step 10.2: Generate types

- [ ] Run: `bun run db:generate`

### Step 10.3: Generate API docs

- [ ] Run: `bun run api:generate`

### Step 10.4: Typecheck

- [ ] Run: `bun --cwd web typecheck`

### Step 10.5: Lint

- [ ] Run: `bun run lint`

### Step 10.6: Build

- [ ] Run: `bun run build`

---

## Summary

| Layer | Files Created | Files Modified |
|---|---|---|
| DB Migrations | 4 | 0 |
| Server Handlers | 8 | 0 |
| Route Registration | 0 | 1 (main.go) |
| Frontend API | 4 | 0 |
| Frontend Pages | 5 | 0 |
| Frontend Routes | 0 | 1 (App.tsx) |
| **Total** | **21** | **2** |
