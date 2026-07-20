# Phase 3 Bug Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all 22 bugs from the Phase 3 Bug Report (2026-05-22) covering Feedback, Company Reviews, Career Growth, and Profile Views.

**Architecture:** Backend Go fixes (handlers, services, routes) + Frontend React fixes (error handling, loading states, type imports). Each task is self-contained and committable.

**Tech Stack:** Go (Gin, pgx, go-jet), React 19, TanStack Query, TypeScript, Tailwind/DaisyUI

---

## File Structure

### Backend (Go)
- `server-go/cmd/server/main.go` — route registration (modify)
- `server-go/internal/feedback/handler.go` — add `GetCompanyFeedback` handler
- `server-go/internal/feedback/service.go` — add `GetByCompanyID` method
- `server-go/internal/companyreviews/handler.go` — add `ListReviews` handler, fix service layer bypass
- `server-go/internal/companyreviews/service.go` — add `ListByCompanyID`, company existence check, review text binding
- `server-go/internal/career/service.go` — sanitize LLM input, add `rows.Err()`, fix null scores, fix gap calc
- `server-go/internal/profileviews/handler.go` — fix unsafe type assertion, fix silent UUID parse failure
- `server-go/internal/profileviews/service.go` — initialize empty slices, add dedup logic

### Frontend (React/TypeScript)
- `web/src/pages/company/FeedbackHistoryPage/index.tsx` — add error handling
- `web/src/pages/company/ReputationPage/index.tsx` — add error handling, loading guard, remove duplicate interface
- `web/src/pages/jobseeker/FeedbackPage/index.tsx` — add error handling
- `web/src/pages/jobseeker/CareerPage/index.tsx` — add error handling
- `web/src/pages/jobseeker/AnalyticsPage/index.tsx` — add error handling

---

## Task 1: Add `GET /feedback/company` endpoint (Bug #1 — Critical)

**Files:**
- Modify: `server-go/internal/feedback/service.go`
- Modify: `server-go/internal/feedback/handler.go`
- Modify: `server-go/cmd/server/main.go`

- [ ] **Step 1: Add `GetByCompanyID` to feedback service**

In `server-go/internal/feedback/service.go`, add after `GetByProfileID`:

```go
func (s *Service) GetByCompanyID(ctx context.Context, companyID string) ([]Feedback, error) {
	rows, err := s.db.QueryContext(ctx,
		`SELECT id, profile_id, company_id, content, rating_areas, ai_suggestions, created_at
		 FROM feedback WHERE company_id = $1 ORDER BY created_at DESC`, companyID,
	)
	if err != nil {
		return nil, fmt.Errorf("query feedback by company: %w", err)
	}
	defer rows.Close()

	var feedbacks []Feedback
	for rows.Next() {
		var fb Feedback
		var ratingJSON, suggestionJSON string

		if err := rows.Scan(&fb.ID, &fb.ProfileID, &fb.CompanyID, &fb.Content, &ratingJSON, &suggestionJSON, &fb.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan feedback: %w", err)
		}
		if err := json.Unmarshal([]byte(ratingJSON), &fb.RatingAreas); err != nil {
			return nil, fmt.Errorf("unmarshal rating areas: %w", err)
		}
		if err := json.Unmarshal([]byte(suggestionJSON), &fb.AISuggestions); err != nil {
			return nil, fmt.Errorf("unmarshal ai suggestions: %w", err)
		}
		feedbacks = append(feedbacks, fb)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate feedback: %w", err)
	}
	return feedbacks, nil
}
```

- [ ] **Step 2: Add `GetCompanyFeedback` handler**

In `server-go/internal/feedback/handler.go`, add before `lookupProfileID`:

```go
// GetCompanyFeedback godoc
// @Summary      Get feedback given by current company
// @Description  Company retrieves all feedback they have submitted
// @Tags         feedback
// @Produce      json
// @Security     BearerAuth
// @Success      200 {array} Feedback
// @Failure      401 {object} map[string]string
// @Router       /feedback/company [get]
func (h *Handler) GetCompanyFeedback(c *gin.Context) {
	companyID, err := getCompanyID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	feedbacks, err := h.service.GetByCompanyID(c.Request.Context(), companyID)
	if err != nil {
		slog.Error("failed to get company feedback", "companyID", companyID, "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get feedback"})
		return
	}

	if feedbacks == nil {
		feedbacks = []Feedback{}
	}

	c.JSON(http.StatusOK, feedbacks)
}
```

- [ ] **Step 3: Register route in main.go**

In `server-go/cmd/server/main.go`, after line 269 (`feedbackCompanyGroup.POST("/:profile_id", ...)`), add:

```go
feedbackCompanyGroup.GET("", feedbackHandler.GetCompanyFeedback)
```

- [ ] **Step 4: Commit**

```bash
git add server-go/internal/feedback/service.go server-go/internal/feedback/handler.go server-go/cmd/server/main.go
git commit -m "feat(server): add GET /feedback/company endpoint"
```

---

## Task 2: Add `GET /companies/:id/reviews` endpoint (Bug #2 — Critical)

**Files:**
- Modify: `server-go/internal/companyreviews/service.go`
- Modify: `server-go/internal/companyreviews/handler.go`
- Modify: `server-go/cmd/server/main.go`

- [ ] **Step 1: Add `ListByCompanyID` to company reviews service**

In `server-go/internal/companyreviews/service.go`, add after `GetReputation`:

```go
func (s *Service) ListByCompanyID(ctx context.Context, companyID string) ([]CompanyReview, error) {
	rows, err := s.db.QueryContext(ctx,
		`SELECT id, company_id, candidate_id, rating, COALESCE(review, ''), interaction_type, created_at
		 FROM company_reviews
		 WHERE company_id = $1
		 ORDER BY created_at DESC`, companyID,
	)
	if err != nil {
		return nil, fmt.Errorf("list reviews: %w", err)
	}
	defer rows.Close()

	var reviews []CompanyReview
	for rows.Next() {
		var r CompanyReview
		var createdAt time.Time
		if err := rows.Scan(&r.ID, &r.CompanyID, &r.CandidateID, &r.Rating, &r.Review, &r.InteractionType, &createdAt); err != nil {
			return nil, fmt.Errorf("scan review: %w", err)
		}
		r.CreatedAt = createdAt.Format(time.RFC3339)
		reviews = append(reviews, r)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate reviews: %w", err)
	}
	return reviews, nil
}
```

- [ ] **Step 2: Add `ListReviews` handler**

In `server-go/internal/companyreviews/handler.go`, add after `GetReputation`:

```go
// ListReviews		godoc
// @Summary		List reviews for a company
// @Description	Get all reviews for a specific company
// @Tags		company-reviews
// @Produce		json
// @Param		id path string true "Company UUID"
// @Success		200 {array} companyreviews.CompanyReview
// @Failure		400 {object} map[string]string
// @Router		/companies/{id}/reviews [get]
func (h *Handler) ListReviews(c *gin.Context) {
	companyID := c.Param("id")
	if _, err := uuid.Parse(companyID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid company ID"})
		return
	}

	reviews, err := h.service.ListByCompanyID(c.Request.Context(), companyID)
	if err != nil {
		slog.Error("failed to list reviews", "companyID", companyID, "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list reviews"})
		return
	}

	if reviews == nil {
		reviews = []CompanyReview{}
	}

	c.JSON(http.StatusOK, reviews)
}
```

- [ ] **Step 3: Register route in main.go**

In `server-go/cmd/server/main.go`, after line 280 (`reviewsGroup.POST("/:id/reviews", ...)`), add:

```go
reviewsGroup.GET("/:id/reviews", companyReviewsHandler.ListReviews)
```

- [ ] **Step 4: Commit**

```bash
git add server-go/internal/companyreviews/service.go server-go/internal/companyreviews/handler.go server-go/cmd/server/main.go
git commit -m "feat(server): add GET /companies/:id/reviews endpoint"
```

---

## Task 3: Sanitize LLM prompt injection (Bug #3 — High)

**Files:**
- Modify: `server-go/internal/career/service.go`

- [ ] **Step 1: Add input sanitization helper and apply to PredictPath**

In `server-go/internal/career/service.go`, add at the top of the file (after imports):

```go
// sanitizeLLMInput strips newlines and limits length to prevent prompt injection.
func sanitizeLLMInput(input string, maxLen int) string {
	input = strings.ReplaceAll(input, "\n", " ")
	input = strings.ReplaceAll(input, "\r", " ")
	input = strings.TrimSpace(input)
	if len(input) > maxLen {
		input = input[:maxLen]
	}
	return input
}
```

- [ ] **Step 2: Apply sanitization in PredictPath**

In `server-go/internal/career/service.go`, in the `PredictPath` method, change the `userPrompt` line (around line 325) from:

```go
userPrompt := fmt.Sprintf(`Candidate: %s
Headline: %s
Years of experience: %d
Industry: %s
Skill scores: %s

Predict career paths as JSON per the system prompt schema.`, name, headlineStr, yearsExpInt, industry, strings.Join(skillSummary, ", "))
```

to:

```go
userPrompt := fmt.Sprintf(`Candidate: %s
Headline: %s
Years of experience: %d
Industry: %s
Skill scores: %s

Predict career paths as JSON per the system prompt schema.`, sanitizeLLMInput(name, 200), sanitizeLLMInput(headlineStr, 200), yearsExpInt, sanitizeLLMInput(industry, 100), strings.Join(skillSummary, ", "))
```

- [ ] **Step 3: Commit**

```bash
git add server-go/internal/career/service.go
git commit -m "fix(server): sanitize LLM prompt inputs to prevent injection"
```

---

## Task 4: Add `RequireVerifiedCompany` to RecordView route (Bug #4 — High)

**Files:**
- Modify: `server-go/cmd/server/main.go`

- [ ] **Step 1: Change route registration**

In `server-go/cmd/server/main.go`, change line 298 from:

```go
api.POST("/profiles/:profile_id/view", middleware.AuthRequired(cfg.JWTSecret), middleware.RequireRole("company"), profileViewsHandler.RecordView)
```

to:

```go
recordViewGroup := api.Group("/profiles")
for _, m := range verifiedCompany {
	recordViewGroup.Use(m)
}
recordViewGroup.POST("/:profile_id/view", profileViewsHandler.RecordView)
```

- [ ] **Step 2: Commit**

```bash
git add server-go/cmd/server/main.go
git commit -m "fix(server): add RequireVerifiedCompany middleware to RecordView route"
```

---

## Task 5: Add error handling to all Phase 3 frontend pages (Bug #5 — High)

**Files:**
- Modify: `web/src/pages/company/FeedbackHistoryPage/index.tsx`
- Modify: `web/src/pages/company/ReputationPage/index.tsx`
- Modify: `web/src/pages/jobseeker/FeedbackPage/index.tsx`
- Modify: `web/src/pages/jobseeker/CareerPage/index.tsx`
- Modify: `web/src/pages/jobseeker/AnalyticsPage/index.tsx`

- [ ] **Step 1: Fix FeedbackHistoryPage**

In `web/src/pages/company/FeedbackHistoryPage/index.tsx`, change the useQuery and add error handling. Replace the destructuring on line 13:

```tsx
const { data: feedback = [], isLoading } = useQuery({
```

with:

```tsx
const { data: feedback = [], isLoading, isError, error } = useQuery({
```

Then after the `isLoading` check (line 24), add:

```tsx
if (isError) return <div className="max-w-4xl mx-auto p-4"><div className="alert alert-error"><span>{error.message}</span></div></div>;
```

- [ ] **Step 2: Fix ReputationPage**

In `web/src/pages/company/ReputationPage/index.tsx`:

1. Remove the duplicate `CompanyReview` interface (lines 7-13) and import from lib:

```tsx
import type { CompanyReview } from '../../../lib/company-reviews';
```

2. Remove the local `getCompanyReviews` function (lines 15-17) and import from lib. Add to the import from `'../../../lib/company-reviews'`:

```tsx
import { getCompanyReputation, getCompanyReviews } from '../../../lib/company-reviews';
```

Wait — `getCompanyReviews` doesn't exist in `company-reviews.ts`. We need to add it. Actually, the frontend already has `api()` so we can keep the local function but use the type from lib. Let's just fix the type import and add error handling.

Keep the local `getCompanyReviews` function. Change:

```tsx
interface CompanyReview {
  id: string;
  rating: number;
  review: string | null;
  interactionType: string;
  createdAt: string;
}
```

Remove it and add import:

```tsx
import type { CompanyReview } from '../../../lib/company-reviews';
```

3. Add error handling to all three queries:

```tsx
const { data: companyProfile, isLoading: loadingProfile } = useQuery({
  queryKey: ['company', 'profile'],
  enabled: !!user,
  queryFn: getCompanyProfile,
});
const companyId = companyProfile?.id ?? '';
const { data: reputation, isLoading: loadingReputation, isError: isErrorReputation, error: errorReputation } = useQuery({
  queryKey: ['company', 'reputation'],
  enabled: !!companyId,
  queryFn: () => getCompanyReputation(companyId),
});
const { data: reviews = [], isLoading: loadingReviews, isError: isErrorReviews, error: errorReviews } = useQuery({
  queryKey: ['company', 'reviews'],
  enabled: !!companyId,
  queryFn: () => getCompanyReviews(companyId),
});
```

4. Fix loading guard (Bug #14):

```tsx
if (loadingProfile || loadingReputation || loadingReviews) return <LoadingFallback text="Loading reputation" />;
if (isErrorReputation || isErrorReviews) return <div className="max-w-4xl mx-auto p-4"><div className="alert alert-error"><span>{errorReputation?.message || errorReviews?.message}</span></div></div>;
```

- [ ] **Step 3: Fix FeedbackPage**

In `web/src/pages/jobseeker/FeedbackPage/index.tsx`, add `isError` and `error` to both queries:

```tsx
const { data: feedback = [], isLoading: loadingFeedback, isError: isErrorFeedback, error: errorFeedback } = useQuery({
```

```tsx
const { data: suggestions = [], isLoading: loadingSuggestions, isError: isErrorSuggestions, error: errorSuggestions } = useQuery({
```

After the loading check, add:

```tsx
if (isErrorFeedback || isErrorSuggestions) return <div className="max-w-4xl mx-auto p-4"><div className="alert alert-error"><span>{errorFeedback?.message || errorSuggestions?.message}</span></div></div>;
```

- [ ] **Step 4: Fix CareerPage**

In `web/src/pages/jobseeker/CareerPage/index.tsx`, add `isError` and `error` to both queries:

```tsx
const { data: skillGap, isLoading: loadingGap, isError: isErrorGap, error: errorGap } = useQuery({
```

```tsx
const { data: prediction, isLoading: loadingPrediction, isError: isErrorPrediction, error: errorPrediction } = useQuery({
```

After the loading check, add:

```tsx
if (isErrorGap || isErrorPrediction) return <div className="max-w-4xl mx-auto p-4"><div className="alert alert-error"><span>{errorGap?.message || errorPrediction?.message}</span></div></div>;
```

- [ ] **Step 5: Fix AnalyticsPage**

In `web/src/pages/jobseeker/AnalyticsPage/index.tsx`, add `isError` and `error` to both queries:

```tsx
const { data: views = [], isLoading: loadingViews, isError: isErrorViews, error: errorViews } = useQuery({
```

```tsx
const { data: stats, isLoading: loadingStats, isError: isErrorStats, error: errorStats } = useQuery({
```

After the loading check, add:

```tsx
if (isErrorViews || isErrorStats) return <div className="max-w-4xl mx-auto p-4"><div className="alert alert-error"><span>{errorViews?.message || errorStats?.message}</span></div></div>;
```

- [ ] **Step 6: Commit**

```bash
git add web/src/pages/company/FeedbackHistoryPage/index.tsx web/src/pages/company/ReputationPage/index.tsx web/src/pages/jobseeker/FeedbackPage/index.tsx web/src/pages/jobseeker/CareerPage/index.tsx web/src/pages/jobseeker/AnalyticsPage/index.tsx
git commit -m "fix(web): add error handling to all Phase 3 useQuery calls"
```

---

## Task 6: Add `rows.Err()` checks in career service (Bug #6 — Medium)

**Files:**
- Modify: `server-go/internal/career/service.go`

- [ ] **Step 1: Add rows.Err() after ListPaths iteration**

In `server-go/internal/career/service.go`, after the `for rows.Next()` loop in `ListPaths` (after line 120, before `if paths == nil`), add:

```go
if err := rows.Err(); err != nil {
    return nil, fmt.Errorf("iterate career paths: %w", err)
}
```

- [ ] **Step 2: Add rows.Err() after GetSkillGap iteration**

In `server-go/internal/career/service.go`, after the first `for rows.Next()` loop in `GetSkillGap` (after line 160, before the eval query), add:

```go
if err := rows.Err(); err != nil {
    return nil, fmt.Errorf("iterate career paths: %w", err)
}
```

- [ ] **Step 3: Commit**

```bash
git add server-go/internal/career/service.go
git commit -m "fix(server): add rows.Err() checks in career service iteration loops"
```

---

## Task 7: Handle null skill_scores in career service (Bug #7 — Medium)

**Files:**
- Modify: `server-go/internal/career/service.go`

- [ ] **Step 1: Add null/empty check after unmarshal in GetSkillGap**

In `server-go/internal/career/service.go`, in `GetSkillGap`, after line 193 (`return nil, fmt.Errorf("unmarshal skill scores: %w", err)`), add before `userSkillMap`:

```go
if len(userScores) == 0 {
    return &SkillGapResult{
        ProfileID:      profileID,
        MatchingSkills: []SkillGapItem{},
        MissingSkills:  []SkillGapItem{},
        OverallMatch:   0,
    }, nil
}
```

- [ ] **Step 2: Add null/empty check after unmarshal in PredictPath**

In `server-go/internal/career/service.go`, in `PredictPath`, after line 279 (`return nil, fmt.Errorf("unmarshal skill scores: %w", err)`), add before the profile query:

```go
if len(userScores) == 0 {
    return &CareerPrediction{
        CurrentPosition:   "Unknown",
        PredictedPaths:    []PredictedPath{},
        SkillDevelopment:  []SkillDevelopment{},
        EstimatedTimeline: "Unable to determine — no skill scores found",
    }, nil
}
```

- [ ] **Step 3: Commit**

```bash
git add server-go/internal/career/service.go
git commit -m "fix(server): handle null/empty skill_scores in career service"
```

---

## Task 8: Fix gap calculation to consider skill levels (Bug #8 — Medium)

**Files:**
- Modify: `server-go/internal/career/service.go`

- [ ] **Step 1: Fix the gap calculation in GetSkillGap**

In `server-go/internal/career/service.go`, in `GetSkillGap`, replace the matching block (lines 206-213):

```go
if hasSkill {
    matching = append(matching, SkillGapItem{
        Skill:         skillName,
        Required:      req.Required,
        RequiredLevel: req.Level,
        UserLevel:     userScore,
        Gap:           0,
    })
}
```

with:

```go
if hasSkill {
    // Parse required level to compute actual gap
    requiredLevel := 0
    if req.Level != "" {
        fmt.Sscanf(req.Level, "%d", &requiredLevel)
    }
    gap := requiredLevel - userScore
    if gap < 0 {
        gap = 0
    }
    if gap == 0 {
        matching = append(matching, SkillGapItem{
            Skill:         skillName,
            Required:      req.Required,
            RequiredLevel: req.Level,
            UserLevel:     userScore,
            Gap:           0,
        })
    } else {
        missing = append(missing, SkillGapItem{
            Skill:         skillName,
            Required:      req.Required,
            RequiredLevel: req.Level,
            UserLevel:     userScore,
            Gap:           gap,
        })
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add server-go/internal/career/service.go
git commit -m "fix(server): gap calculation now considers skill levels"
```

---

## Task 9: Add company existence check in company reviews (Bug #9 — Medium)

**Files:**
- Modify: `server-go/internal/companyreviews/service.go`

- [ ] **Step 1: Add company existence check in Create method**

In `server-go/internal/companyreviews/service.go`, in `Create`, after the interaction type validation (line 53), add:

```go
// Check company exists
var companyExists bool
err := s.db.QueryRowContext(ctx, `SELECT EXISTS(SELECT 1 FROM companies WHERE id = $1)`, companyID).Scan(&companyExists)
if err != nil {
    return nil, fmt.Errorf("check company existence: %w", err)
}
if !companyExists {
    return nil, ErrCompanyNotFound
}
```

- [ ] **Step 2: Handle ErrCompanyNotFound in handler**

In `server-go/internal/companyreviews/handler.go`, in `PostReview`, add to the error switch (after line 70):

```go
case errors.Is(err, ErrCompanyNotFound):
    c.JSON(http.StatusNotFound, gin.H{"error": "Company not found"})
```

- [ ] **Step 3: Commit**

```bash
git add server-go/internal/companyreviews/service.go server-go/internal/companyreviews/handler.go
git commit -m "fix(server): add company existence check before review creation"
```

---

## Task 10: Move lookupCandidateProfile to service layer (Bug #10 — Medium)

**Files:**
- Modify: `server-go/internal/companyreviews/service.go`
- Modify: `server-go/internal/companyreviews/handler.go`

- [ ] **Step 1: Add LookupCandidateProfile to service**

In `server-go/internal/companyreviews/service.go`, add:

```go
func (s *Service) LookupCandidateProfile(ctx context.Context, userID string) (string, error) {
	var profileID uuid.UUID
	err := s.db.QueryRowContext(ctx,
		`SELECT id FROM jobseeker_profiles WHERE user_id = $1`, userID,
	).Scan(&profileID)
	if err != nil {
		return "", err
	}
	return profileID.String(), nil
}
```

Note: add `"github.com/google/uuid"` to the imports.

- [ ] **Step 2: Update handler to use service method**

In `server-go/internal/companyreviews/handler.go`, replace `lookupCandidateProfile` method (lines 108-117) to delegate to service:

```go
func (h *Handler) lookupCandidateProfile(c *gin.Context, userID string) (string, error) {
	return h.service.LookupCandidateProfile(c.Request.Context(), userID)
}
```

- [ ] **Step 3: Commit**

```bash
git add server-go/internal/companyreviews/service.go server-go/internal/companyreviews/handler.go
git commit -m "refactor(server): move lookupCandidateProfile to service layer"
```

---

## Task 11: Add binding max to review text (Bug #11 — Medium)

**Files:**
- Modify: `server-go/internal/companyreviews/service.go`

- [ ] **Step 1: Add max binding to Review field**

In `server-go/internal/companyreviews/service.go`, change line 44:

```go
Review          string `json:"review"`
```

to:

```go
Review          string `json:"review" binding:"max=5000"`
```

- [ ] **Step 2: Commit**

```bash
git add server-go/internal/companyreviews/service.go
git commit -m "fix(server): add max length binding to review text"
```

---

## Task 12: Add duplicate view prevention (Bug #12 — Medium)

**Files:**
- Modify: `server-go/internal/profileviews/service.go`

- [ ] **Step 1: Change INSERT to upsert with dedup**

In `server-go/internal/profileviews/service.go`, in `RecordView`, replace the INSERT (lines 30-34):

```go
_, err := s.db.ExecContext(ctx,
    `INSERT INTO profile_views (id, profile_id, viewer_id, company_id, viewed_at)
     VALUES ($1, $2, $3, $4, NOW())`,
    uuid.New(), profileID, viewerID, companyID,
)
return err
```

with:

```go
_, err := s.db.ExecContext(ctx,
    `INSERT INTO profile_views (id, profile_id, viewer_id, company_id, viewed_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (profile_id, company_id, viewed_at::date)
     DO UPDATE SET viewed_at = NOW()`,
    uuid.New(), profileID, viewerID, companyID,
)
return err
```

Note: This assumes a unique index exists or will be created. If the index doesn't exist, we need to create a migration. For now, use the soft dedup approach — check if a view exists today first:

```go
if companyID != nil {
    var todayExists bool
    _ = s.db.QueryRowContext(ctx,
        `SELECT EXISTS(SELECT 1 FROM profile_views WHERE profile_id = $1 AND company_id = $2 AND viewed_at::date = CURRENT_DATE)`,
        profileID, *companyID,
    ).Scan(&todayExists)
    if todayExists {
        return nil // already recorded today
    }
}

_, err := s.db.ExecContext(ctx,
    `INSERT INTO profile_views (id, profile_id, viewer_id, company_id, viewed_at)
     VALUES ($1, $2, $3, $4, NOW())`,
    uuid.New(), profileID, viewerID, companyID,
)
return err
```

- [ ] **Step 2: Commit**

```bash
git add server-go/internal/profileviews/service.go
git commit -m "fix(server): prevent duplicate profile views per day"
```

---

## Task 13: Fix silent company ID parse failure (Bug #13 — Medium)

**Files:**
- Modify: `server-go/internal/profileviews/handler.go`

- [ ] **Step 1: Return error on invalid company UUID**

In `server-go/internal/profileviews/handler.go`, in `RecordView`, replace lines 56-63:

```go
companyIDStr := c.GetString("companyId")
var companyID *uuid.UUID
if companyIDStr != "" {
    cid, err := uuid.Parse(companyIDStr)
    if err == nil {
        companyID = &cid
    }
}
```

with:

```go
companyIDStr := c.GetString("companyId")
var companyID *uuid.UUID
if companyIDStr != "" {
    cid, err := uuid.Parse(companyIDStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid company ID"})
        return
    }
    companyID = &cid
}
```

- [ ] **Step 2: Commit**

```bash
git add server-go/internal/profileviews/handler.go
git commit -m "fix(server): return error on invalid company ID in RecordView"
```

---

## Task 14: Initialize empty slices in profile views (Bug #18 — Low)

**Files:**
- Modify: `server-go/internal/profileviews/service.go`

- [ ] **Step 1: Initialize views slice**

In `server-go/internal/profileviews/service.go`, in `GetViewsByProfile`, change line 53:

```go
var views []ProfileView
```

to:

```go
views := make([]ProfileView, 0)
```

- [ ] **Step 2: Commit**

```bash
git add server-go/internal/profileviews/service.go
git commit -m "fix(server): initialize empty slices to avoid null JSON responses"
```

---

## Task 15: Fix unsafe type assertion (Bug #17 — Low)

**Files:**
- Modify: `server-go/internal/profileviews/handler.go`

- [ ] **Step 1: Use comma-ok pattern**

In `server-go/internal/profileviews/handler.go`, in `getUserID`, replace line 84:

```go
return uuid.Parse(val.(string))
```

with:

```go
s, ok := val.(string)
if !ok {
    return uuid.Nil, errors.New("invalid userId type")
}
return uuid.Parse(s)
```

Also add `"errors"` to the imports.

- [ ] **Step 2: Commit**

```bash
git add server-go/internal/profileviews/handler.go
git commit -m "fix(server): use comma-ok pattern for type assertion in getUserID"
```

---

## Task 16: Fix route registration order (Bug #16 — Low)

**Files:**
- Modify: `server-go/cmd/server/main.go`

- [ ] **Step 1: Reorder feedback routes**

In `server-go/cmd/server/main.go`, the jobseeker feedback routes (lines 272-275) are registered AFTER the company feedback routes (lines 265-269). In Gin, `POST /feedback/me` would match `/:profile_id` with value `"me"`.

Move the jobseeker group BEFORE the company group. Replace lines 264-275:

```go
// Feedback routes (jobseeker views feedback)
feedbackJobseekerGroup := api.Group("/feedback")
feedbackJobseekerGroup.Use(middleware.AuthRequired(cfg.JWTSecret), middleware.RequireRole("jobseeker"))
feedbackJobseekerGroup.GET("/me", feedbackHandler.GetMyFeedback)
feedbackJobseekerGroup.GET("/suggestions/me", feedbackHandler.GetMySuggestions)

// Feedback routes (company gives feedback)
feedbackCompanyGroup := api.Group("/feedback")
for _, m := range verifiedCompany {
    feedbackCompanyGroup.Use(m)
}
feedbackCompanyGroup.POST("/:profile_id", feedbackHandler.PostFeedback)
feedbackCompanyGroup.GET("", feedbackHandler.GetCompanyFeedback)
```

- [ ] **Step 2: Commit**

```bash
git add server-go/cmd/server/main.go
git commit -m "fix(server): reorder feedback routes to prevent parameter shadowing"
```

---

## Task 17: Fix null JSON response for company reviews (Bug #22 — Low)

**Files:**
- Modify: `server-go/internal/companyreviews/service.go`

- [ ] **Step 1: Initialize empty slices in ListByCompanyID**

The `ListByCompanyID` method (added in Task 2) already handles this. Verify the `reviews` slice is initialized. If using `var reviews []CompanyReview`, change to:

```go
reviews := make([]CompanyReview, 0)
```

- [ ] **Step 2: Commit**

```bash
git add server-go/internal/companyreviews/service.go
git commit -m "fix(server): initialize empty slices in company reviews service"
```

---

## Task 18: Fix AnalyticsPage raw UUID display (Bug #20 — Low)

**Files:**
- Modify: `web/src/pages/jobseeker/AnalyticsPage/index.tsx`

- [ ] **Step 1: Show placeholder instead of raw UUID**

In `web/src/pages/jobseeker/AnalyticsPage/index.tsx`, change line 65:

```tsx
<td>{view.companyId}</td>
```

to:

```tsx
<td>{view.companyId ? 'Company' : 'Anonymous'}</td>
```

Note: A proper fix would require the API to return company names. For now, show a label instead of raw UUID.

- [ ] **Step 2: Commit**

```bash
git add web/src/pages/jobseeker/AnalyticsPage/index.tsx
git commit -m "fix(web): show label instead of raw UUID in analytics table"
```

---

## Verification

After all tasks are complete, run:

```bash
# Typecheck frontend
bun --cwd web typecheck

# Build frontend
bun run build

# Lint
bun run lint

# Format
bun run format

# Server tests (if DB available)
go test ./server-go/...
```

---

## Summary

| Task | Bug # | Severity | Description |
|------|-------|----------|-------------|
| 1 | #1 | Critical | Add GET /feedback/company |
| 2 | #2 | Critical | Add GET /companies/:id/reviews |
| 3 | #3 | High | Sanitize LLM prompt injection |
| 4 | #4 | High | Add RequireVerifiedCompany to RecordView |
| 5 | #5 | High | Add error handling to all frontend pages |
| 6 | #6 | Medium | Add rows.Err() checks |
| 7 | #7 | Medium | Handle null skill_scores |
| 8 | #8 | Medium | Fix gap calculation |
| 9 | #9 | Medium | Add company existence check |
| 10 | #10 | Medium | Move lookupCandidateProfile to service |
| 11 | #11 | Medium | Add max binding to review text |
| 12 | #12 | Medium | Prevent duplicate views |
| 13 | #13 | Medium | Fix silent UUID parse failure |
| 14 | #18 | Low | Initialize empty slices |
| 15 | #17 | Low | Fix unsafe type assertion |
| 16 | #16 | Low | Fix route registration order |
| 17 | #22 | Low | Initialize reviews slice |
| 18 | #20 | Low | Fix raw UUID display |
