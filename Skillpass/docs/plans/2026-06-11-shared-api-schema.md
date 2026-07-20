# Shared API Schema (server-go ↔ web) Implementation Plan

> **For agentic workers:** REQUIRED to delegate into related agents to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Go server's swag-annotated structs the single source of truth for API types, generating TypeScript types for the web app so server/web schema drift becomes a compile error instead of a runtime bug.

**Architecture:** swag (already wired into server-go) generates `server-go/docs/swagger.json` (Swagger 2.0) from handler annotations → `swagger2openapi` converts it to OpenAPI 3.x → `openapi-typescript` emits a types-only `api.d.ts` into `web/src/lib/generated/`. A small hand-written barrel (`web/src/lib/api-types.ts`) re-exports clean names. Generated files are committed; a `bun run api:check` drift guard runs on pre-push.

**Tech Stack:** swaggo/swag v1.16.6 (pinned as a Go tool), swagger2openapi, openapi-typescript v7, Bun scripts at repo root, lefthook.

**Why this approach (decided 2026-06-11, see agent-manager investigation):**
- swag annotations already exist on all ~30 routes; spec is served at `/docs/index.html`.
- The committed spec is already stale: `/industries` still points at the go-jet type `skillpass-server-go_internal_gen.IndustryCategory` even though commit `e30d617` fixed the handler to return `handlers.IndustryResponse`. Regeneration discipline is the real problem — hence the drift guard.
- Rejected: tygo/struct-to-TS (no per-endpoint contract), spec-first oapi-codegen (requires rewriting every handler — natural "v2" later), JSON Schema/protobuf (third artifact, extra toolchains).
- Zero runtime cost: `openapi-typescript` emits pure ambient types that plug into the existing `api<T>()` wrapper unchanged. Zod stays for form validation only.

**Repo conventions that apply to every commit in this plan:** single-line conventional commit messages, no body, no trailers.

---

## File Structure

```
server-go/internal/handlers/responses.go        (new)  shared named response structs
server-go/internal/handlers/responses_test.go   (new)  wire-shape regression tests
server-go/internal/handlers/{auth,companies,jobs,profiles}.go  (modify) replace gin.H success returns
server-go/docs/{docs.go,swagger.json,swagger.yaml}             (regenerate) corrected spec
server-go/go.mod                                (modify) swag pinned via tool directive
package.json                                    (modify) api:spec / api:types / api:generate / api:check scripts + devDeps
biome.json                                      (modify) exclude generated dir
web/src/lib/generated/openapi.json              (new, generated, committed)
web/src/lib/generated/api.d.ts                  (new, generated, committed)
web/src/lib/api-types.ts                        (new)  hand-written barrel of clean type names
web/src/pages/{PublicJobs,JobDetail,CompanyJobs}/type.tsx      (delete) duplicate Job interfaces
web/src/pages/{JobseekerPassport,PublicPassport}/type.tsx      (modify/delete) duplicate PassportData
web/src/hooks/useIndustries.ts                  (modify) use generated Industry type
web/src/lib/api.ts                              (modify) LoginResponse from generated types
lefthook.yml                                    (modify) pre-push drift guards
CLAUDE.md                                       (modify) regeneration workflow note
```

**Prerequisites for execution:** PostgreSQL running (`docker compose up db -d`) is NOT required — swag parses source code, not the DB. Go 1.24+ and Bun are required.

---

### Task 1: Named response structs replacing `gin.H` success returns

The spec currently contains 63 `additionalProperties` blobs because success responses use `gin.H` maps. Error-path `gin.H{"error": ...}` returns stay as-is (out of scope, uniform shape). `health.go` is also out of scope (not consumed by web).

**Files:**
- Create: `server-go/internal/handlers/responses.go`
- Create: `server-go/internal/handlers/responses_test.go`
- Modify: `server-go/internal/handlers/auth.go:389,406,412,421` and annotations at `auth.go:321,400`
- Modify: `server-go/internal/handlers/companies.go:240,276,284`
- Modify: `server-go/internal/handlers/jobs.go:468`
- Modify: `server-go/internal/handlers/profiles.go:350,648`

- [ ] **Step 1: Write the failing wire-shape test**

Create `server-go/internal/handlers/responses_test.go`:

```go
package handlers

import (
	"encoding/json"
	"testing"
)

// These tests lock the JSON wire shapes so replacing gin.H with named
// structs cannot change what clients receive.
func TestResponseWireShapes(t *testing.T) {
	cases := []struct {
		name string
		in   any
		want string
	}{
		{"message", MessageResponse{Message: "Logged out"}, `{"message":"Logged out"}`},
		{"refresh", RefreshResponse{AccessToken: "tok"}, `{"accessToken":"tok"}`},
		{"verificationSubmitted", VerificationSubmittedResponse{Message: "Verification submitted", Status: "pending"}, `{"message":"Verification submitted","status":"pending"}`},
		{"verificationStatus", VerificationStatusResponse{VerificationStatus: "none"}, `{"verificationStatus":"none"}`},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got, err := json.Marshal(tc.in)
			if err != nil {
				t.Fatal(err)
			}
			if string(got) != tc.want {
				t.Errorf("got %s, want %s", got, tc.want)
			}
		})
	}
}

func TestUpdateProfileResponseWireShape(t *testing.T) {
	headline := "Engineer"
	years := 3
	got, err := json.Marshal(UpdateProfileResponse{
		ID:                "id1",
		UserID:            "u1",
		Headline:          &headline,
		About:             nil,
		YearsOfExperience: &years,
		Slug:              "slug1",
	})
	if err != nil {
		t.Fatal(err)
	}
	want := `{"id":"id1","userId":"u1","headline":"Engineer","about":null,"yearsOfExperience":3,"slug":"slug1"}`
	if string(got) != want {
		t.Errorf("got %s, want %s", got, want)
	}
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `go -C server-go test ./internal/handlers/ -run TestResponseWireShapes -v`
Expected: FAIL to compile with `undefined: MessageResponse` (and the other struct names).

- [ ] **Step 3: Create the response structs**

Create `server-go/internal/handlers/responses.go`:

```go
package handlers

// Shared named response structs. Wire shapes must stay identical to the
// gin.H maps they replace — see responses_test.go.

// MessageResponse is a generic confirmation payload.
type MessageResponse struct {
	Message string `json:"message"`
} //@name MessageResponse

// RefreshResponse is returned by POST /auth/refresh.
type RefreshResponse struct {
	AccessToken string `json:"accessToken"`
} //@name RefreshResponse

// VerificationSubmittedResponse is returned by POST /companies/verification.
type VerificationSubmittedResponse struct {
	Message string `json:"message"`
	Status  string `json:"status"`
} //@name VerificationSubmittedResponse

// VerificationStatusResponse is returned by GET /companies/verification.
type VerificationStatusResponse struct {
	VerificationStatus string `json:"verificationStatus"`
} //@name VerificationStatusResponse

// UpdateProfileResponse is returned by PUT /profiles/me.
type UpdateProfileResponse struct {
	ID                string  `json:"id"`
	UserID            string  `json:"userId"`
	Headline          *string `json:"headline"`
	About             *string `json:"about"`
	YearsOfExperience *int    `json:"yearsOfExperience"`
	Slug              string  `json:"slug"`
} //@name UpdateProfileResponse
```

(The `//@name X` trailing comments give swag clean schema names instead of module-path-qualified ones like `server-go_internal_handlers.X` — Task 2 does the same for existing structs.)

- [ ] **Step 4: Run test to verify it passes**

Run: `go -C server-go test ./internal/handlers/ -run "TestResponseWireShapes|TestUpdateProfileResponseWireShape" -v`
Expected: PASS (5 subtests).

- [ ] **Step 5: Replace the `gin.H` success returns**

In `server-go/internal/handlers/auth.go:389`:

```go
// before
	c.JSON(http.StatusOK, gin.H{
		"accessToken": accessToken,
	})
// after
	c.JSON(http.StatusOK, RefreshResponse{AccessToken: accessToken})
```

In `server-go/internal/handlers/auth.go` lines 406, 412, 421 (three occurrences):

```go
// before
	c.JSON(http.StatusOK, gin.H{"message": "Logged out"})
// after
	c.JSON(http.StatusOK, MessageResponse{Message: "Logged out"})
```

In `server-go/internal/handlers/companies.go:240`:

```go
// before
	c.JSON(http.StatusOK, gin.H{"message": "Verification submitted", "status": "pending"})
// after
	c.JSON(http.StatusOK, VerificationSubmittedResponse{Message: "Verification submitted", Status: "pending"})
```

In `server-go/internal/handlers/companies.go:276` and `:284`:

```go
// before (276)
	c.JSON(http.StatusOK, gin.H{"verificationStatus": "none"})
// after
	c.JSON(http.StatusOK, VerificationStatusResponse{VerificationStatus: "none"})

// before (284)
	c.JSON(http.StatusOK, gin.H{"verificationStatus": string(company.VerificationStatus)})
// after
	c.JSON(http.StatusOK, VerificationStatusResponse{VerificationStatus: string(company.VerificationStatus)})
```

In `server-go/internal/handlers/jobs.go:468` and `server-go/internal/handlers/profiles.go:648`:

```go
// before
	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
// after
	c.JSON(http.StatusOK, MessageResponse{Message: "Deleted"})
```

In `server-go/internal/handlers/profiles.go:350`:

```go
// before
	c.JSON(http.StatusOK, gin.H{
		"id":                profile.ID.String(),
		"userId":            profile.UserID.String(),
		"headline":          profile.Headline,
		"about":             profile.About,
		"yearsOfExperience": int32ToIntPtr(profile.YearsOfExperience),
		"slug":              profile.Slug,
	})
// after
	c.JSON(http.StatusOK, UpdateProfileResponse{
		ID:                profile.ID.String(),
		UserID:            profile.UserID.String(),
		Headline:          profile.Headline,
		About:             profile.About,
		YearsOfExperience: int32ToIntPtr(profile.YearsOfExperience),
		Slug:              profile.Slug,
	})
```

(Model field types verified against `server-go/.gen/skillpass/public/model/jobseeker_profiles.go`: `Headline *string`, `About *string`, `YearsOfExperience *int32`, `Slug string`. If the compiler still reports a mismatch, adjust the struct field type to match the model — the JSON wire shape is unaffected.)

- [ ] **Step 6: Update the swag annotations that referenced maps**

Find every map-typed success annotation:

Run: `grep -n "@Success.*map\[string\]string" server-go/internal/handlers/*.go`

Replace each with the matching named struct. Known sites:
- `auth.go:321` (refresh): `// @Success		200 {object} map[string]string` → `// @Success		200 {object} RefreshResponse`
- `auth.go:400` (logout): `// @Success		200 {object} map[string]string` → `// @Success		200 {object} MessageResponse`

For any other hits (companies verification, job delete, profile update/delete), apply the struct chosen in Step 5 for that handler. If a handler from Step 5 has no `@Success` annotation at all, add one in the same style as its neighbors.

- [ ] **Step 7: Build and run full server test suite**

Run: `go -C server-go build ./... && go -C server-go test ./... -count=1 -p=1`
Expected: build OK, all tests PASS.

- [ ] **Step 8: Commit**

```bash
git add server-go/internal/handlers/
git commit -m "refactor(server): replace gin.H success responses with named structs"
```

---

### Task 2: Clean schema names via `//@name` on existing API structs

The committed spec has module-path-qualified definition names (`server-go_internal_handlers.JobResponse`, `server-go_internal_evaluation.EvaluationResponse`, …) and they are unstable — the prefix changed when the Go module was renamed. `//@name` pins clean, stable names that the web barrel (Task 5) imports.

**Files:**
- Modify: struct definitions in `server-go/internal/handlers/*.go`, `server-go/internal/evaluation/`, `server-go/internal/application/`, `server-go/internal/matching/`

- [ ] **Step 1: Locate every annotated API struct**

These are the definitions currently in `server-go/docs/swagger.json` (minus the two stale `gen.*` ones, which disappear on regeneration):

| Struct | Package | Locate with |
|---|---|---|
| CandidateResult, CreateExperienceRequest, CreateJobRequest, Experience, JobResponse, LoginRequest, LoginResponse, ProfileResponse, PublicProfileResponse, RegisterRequest, UpdateCompanyRequest, UpdateExperienceRequest, UpdateJobRequest, UpdateProfileRequest, UserResponse, VerificationActionRequest, VerificationRequest, IndustryResponse, TagResponse | `internal/handlers` | `grep -rn "type <Name> struct" server-go/internal/handlers/` |
| EvaluationResponse, SkillNote, SkillScoreItem, Suggestion | `internal/evaluation` | `grep -rn "type <Name> struct" server-go/internal/evaluation/` |
| ApplicationResult | `internal/application` | `grep -rn "type ApplicationResult struct" server-go/internal/application/` |
| CandidateMatch, JobMatch | `internal/matching` | `grep -rn "type <Name> struct" server-go/internal/matching/` |

- [ ] **Step 2: Append `//@name` to each struct's closing brace**

For each struct found in Step 1, append the trailing comment to the closing brace line, using the struct's own name. Example for `JobResponse`:

```go
type JobResponse struct {
	// ... existing fields unchanged ...
} //@name JobResponse
```

Repeat for all 26 structs in the table (same pattern: `} //@name <StructName>`).

- [ ] **Step 3: Build to confirm nothing broke**

Run: `go -C server-go build ./...`
Expected: success, no output.

- [ ] **Step 4: Commit**

```bash
git add server-go/internal/
git commit -m "docs(server): pin clean swagger schema names with @name annotations"
```

---

### Task 3: Pin swag as a Go tool and regenerate the (stale) spec

**Files:**
- Modify: `server-go/go.mod`, `server-go/go.sum` (tool directive)
- Modify: `package.json` (new `api:spec` script)
- Regenerate: `server-go/docs/docs.go`, `server-go/docs/swagger.json`, `server-go/docs/swagger.yaml`

- [ ] **Step 1: Pin swag via the Go 1.24 tool directive**

Run: `go -C server-go get -tool github.com/swaggo/swag/cmd/swag@v1.16.6`
Expected: `go.mod` gains a `tool github.com/swaggo/swag/cmd/swag` directive. Verify: `grep -A2 "^tool" server-go/go.mod`.

- [ ] **Step 2: Add the `api:spec` script**

In root `package.json`, add to `"scripts"` (after `"db:generate"`):

```json
"api:spec": "go -C server-go tool swag init -g cmd/server/main.go -o docs --parseDependency --parseInternal",
```

- [ ] **Step 3: Regenerate the spec**

Run: `bun run api:spec`
Expected: exits 0; `server-go/docs/swagger.json` is rewritten.

If swag errors on annotation parsing, fix the reported annotation (likely one edited in Task 1 Step 6) and re-run.

- [ ] **Step 4: Verify the stale go-jet types are gone and names are clean**

Run: `python3 -c "import json; print('\n'.join(sorted(json.load(open('server-go/docs/swagger.json'))['definitions'])))"`
Expected: names like `JobResponse`, `IndustryResponse`, `MessageResponse` — NO `_gen.` entries, NO `server-go_internal_` prefixes.

Run: `grep -c "additionalProperties" server-go/docs/swagger.json`
Expected: substantially below the previous 63 (remaining hits come from error responses and any genuinely map-shaped payloads).

- [ ] **Step 5: Sanity-check the server still serves docs**

Run: `go -C server-go build ./...`
Expected: success. (Full manual check: `bun run dev:server` and open http://localhost:1234/docs/index.html — optional.)

- [ ] **Step 6: Commit**

```bash
git add server-go/go.mod server-go/go.sum server-go/docs package.json
git commit -m "build(server): pin swag as go tool and regenerate stale openapi spec"
```

---

### Task 4: TypeScript generation pipeline (`api:types`, `api:generate`, `api:check`)

**Files:**
- Modify: `package.json` (devDeps + scripts)
- Modify: `biome.json` (exclude generated dir)
- Create (generated): `web/src/lib/generated/openapi.json`, `web/src/lib/generated/api.d.ts`

- [ ] **Step 1: Install codegen devDependencies at the root**

Run: `bun add -d swagger2openapi openapi-typescript typescript`
(`typescript` at root is a peer requirement of openapi-typescript v7's printer; the web workspace has its own copy.)
Expected: `package.json` devDependencies gain all three.

- [ ] **Step 2: Add the generation scripts**

In root `package.json` `"scripts"`, after `"api:spec"`:

```json
"api:types": "swagger2openapi --patch server-go/docs/swagger.json -o web/src/lib/generated/openapi.json && openapi-typescript web/src/lib/generated/openapi.json -o web/src/lib/generated/api.d.ts",
"api:generate": "bun run api:spec && bun run api:types",
"api:check": "bun run api:generate && git diff --exit-code -- server-go/docs web/src/lib/generated",
```

- [ ] **Step 3: Exclude the generated dir from Biome**

In `biome.json`, change the `"files"` block:

```json
"files": {
  "ignoreUnknown": false,
  "includes": ["**", "!web/src/lib/generated"]
},
```

(Biome 2.x uses negated `includes` patterns; this keeps the pre-commit format hook from fighting codegen output.)

- [ ] **Step 4: Generate**

Run: `mkdir -p web/src/lib/generated && bun run api:generate`
Expected: both `web/src/lib/generated/openapi.json` and `web/src/lib/generated/api.d.ts` exist. `api.d.ts` exports `paths`, `components`, `operations`.

Verify schema names: `grep -o "'[A-Za-z]*Response'" web/src/lib/generated/api.d.ts | sort -u | head`
Expected: clean names (`'JobResponse'`, `'IndustryResponse'`, …).

- [ ] **Step 5: Verify web still typechecks and the drift check passes when clean**

Run: `bun --cwd web typecheck`
Expected: PASS (generated file is additive).

Run: `git add -A && bun run api:check`
Expected: exits 0 (no diff — spec and types are in sync).

- [ ] **Step 6: Commit**

```bash
git add package.json bun.lock biome.json web/src/lib/generated
git commit -m "feat(web): generate typescript api types from server openapi spec"
```

---

### Task 5: Clean-name barrel `web/src/lib/api-types.ts`

**Files:**
- Create: `web/src/lib/api-types.ts`

- [ ] **Step 1: Write the barrel**

Create `web/src/lib/api-types.ts`. Adjust the bracket keys to match the exact names verified in Task 4 Step 4 — they should be the clean `@name` values:

```ts
import type { components } from './generated/api';

type Schemas = components['schemas'];

// Auth
export type LoginRequest = Schemas['LoginRequest'];
export type LoginResponse = Schemas['LoginResponse'];
export type RegisterRequest = Schemas['RegisterRequest'];
export type RefreshResponse = Schemas['RefreshResponse'];
export type User = Schemas['UserResponse'];

// Reference data
export type Industry = Schemas['IndustryResponse'];
export type Tag = Schemas['TagResponse'];

// Jobs
export type Job = Schemas['JobResponse'];
export type CreateJobRequest = Schemas['CreateJobRequest'];
export type UpdateJobRequest = Schemas['UpdateJobRequest'];

// Profiles & passport
export type Profile = Schemas['ProfileResponse'];
export type PublicProfile = Schemas['PublicProfileResponse'];
export type UpdateProfileResponse = Schemas['UpdateProfileResponse'];
export type Experience = Schemas['Experience'];

// Matching / search / evaluation / application
export type CandidateResult = Schemas['CandidateResult'];
export type CandidateMatch = Schemas['CandidateMatch'];
export type JobMatch = Schemas['JobMatch'];
export type EvaluationResponse = Schemas['EvaluationResponse'];
export type ApplicationResult = Schemas['ApplicationResult'];

// Generic
export type MessageResponse = Schemas['MessageResponse'];
export type VerificationStatusResponse = Schemas['VerificationStatusResponse'];
```

- [ ] **Step 2: Typecheck**

Run: `bun --cwd web typecheck`
Expected: PASS. A failure here means a bracket key doesn't match a generated schema name — fix the key, not the generated file.

- [ ] **Step 3: Commit**

```bash
git add web/src/lib/api-types.ts
git commit -m "feat(web): add api-types barrel over generated openapi types"
```

---

### Task 6: Migrate Industry (the endpoints that just drifted)

**Files:**
- Modify: `web/src/hooks/useIndustries.ts`

- [ ] **Step 1: Replace the hand-written interface**

Replace the contents of `web/src/hooks/useIndustries.ts` with:

```ts
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Industry } from '../lib/api-types';

export type { Industry };

export function useIndustries() {
  return useQuery({
    queryKey: ['industries'],
    queryFn: () => api<Industry[]>('/industries'),
    staleTime: 5 * 60_000, // reference data: rarely changes
  });
}
```

- [ ] **Step 2: Typecheck and fix surfaced mismatches**

Run: `bun --cwd web typecheck`
Expected: PASS. If a consumer breaks (e.g. it relied on a field the server never sends), trust the generated type: fix the consumer.

- [ ] **Step 3: Commit**

```bash
git add web/src/hooks/useIndustries.ts
git commit -m "refactor(web): use generated Industry type in useIndustries"
```

---

### Task 7: Migrate Job (delete the 3 duplicate interfaces)

`Job` is hand-defined three times with different shapes. `web/src/pages/PublicJobs/type.tsx` declares `companyName?: string`, which **no server struct emits** — the field can never arrive.

**Files:**
- Delete: `web/src/pages/PublicJobs/type.tsx`, `web/src/pages/JobDetail/type.tsx`, `web/src/pages/CompanyJobs/type.tsx` (each contains only the `Job` interface — verified 2026-06-11; re-verify with `cat` before deleting)
- Modify: `web/src/pages/PublicJobs/index.tsx:7`, `web/src/pages/JobDetail/index.tsx:6`, `web/src/pages/CompanyJobs/index.tsx:13`

- [ ] **Step 1: Swap imports in the three pages**

In each of the three `index.tsx` files, replace:

```ts
import type { Job } from './type';
```

with:

```ts
import type { Job } from '@/lib/api-types';
```

- [ ] **Step 2: Delete the duplicate type files**

Run: `rm web/src/pages/PublicJobs/type.tsx web/src/pages/JobDetail/type.tsx web/src/pages/CompanyJobs/type.tsx`

- [ ] **Step 3: Typecheck — expect the phantom field to surface**

Run: `bun --cwd web typecheck`
Expected: FAIL in `PublicJobs` wherever `job.companyName` is referenced (the generated `Job` has no such field). Other errors may appear where a page assumed a field `JobResponse` doesn't have — each one is real drift being caught.

- [ ] **Step 4: Resolve each error by trusting the generated type**

For `companyName`: it never arrives from the server, so the UI reference is dead code — remove the rendering of `companyName` in `PublicJobs/index.tsx`. (If the product actually wants company names on public jobs, that's a server change: add the field to `JobResponse`, populate it in the handler, run `bun run api:generate` — file it as follow-up rather than blocking this task.)

For any other mismatch: align the page with the generated field names/optionality.

- [ ] **Step 5: Typecheck passes**

Run: `bun --cwd web typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add web/src/pages
git commit -m "refactor(web): replace 3 duplicate Job interfaces with generated type"
```

---

### Task 8: Migrate Auth (`LoginResponse`)

**Files:**
- Modify: `web/src/lib/api.ts:142-146`
- Verify: `web/src/hooks/useAuth.tsx`

- [ ] **Step 1: Replace the inline `LoginResponse`**

In `web/src/lib/api.ts`, delete:

```ts
export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: { id: string; email: string; username: string; name: string; role: 'jobseeker' | 'company' };
}
```

and add at the top of the file (re-export keeps `useAuth.tsx` and other importers working unchanged):

```ts
import type { LoginResponse } from './api-types';

export type { LoginResponse };
```

- [ ] **Step 2: Typecheck and resolve**

Run: `bun --cwd web typecheck`
Expected: PASS, or errors where the generated shape differs from the hand-written one (e.g. `role` widened to `string`, or optionality differences on `user` fields). Resolve by trusting the generated type; if the server genuinely guarantees a field that swag marks optional, the fix is server-side (add the field to the response struct's example/required handling), not a web-side cast.

- [ ] **Step 3: Commit**

```bash
git add web/src/lib/api.ts web/src/hooks/useAuth.tsx
git commit -m "refactor(web): use generated LoginResponse type"
```

---

### Task 9: Migrate Passport (`PassportData` duplicated twice)

Both passport pages call `api<PassportData>('/profiles/{username}')` — the server type for that endpoint is `PublicProfileResponse`.

**Files:**
- Modify: `web/src/pages/JobseekerPassport/index.tsx:10,23`
- Modify: `web/src/pages/PublicPassport/index.tsx:5,13`
- Modify/Delete: `web/src/pages/JobseekerPassport/type.tsx`, `web/src/pages/PublicPassport/type.tsx`

- [ ] **Step 1: Check what else lives in the two type files**

Run: `cat web/src/pages/JobseekerPassport/type.tsx web/src/pages/PublicPassport/type.tsx`
If a file contains ONLY `PassportData`, delete it in Step 3; if it has other exports, remove only the `PassportData` interface.

- [ ] **Step 2: Swap the imports and usages in both pages**

In both `index.tsx` files, replace:

```ts
import type { PassportData } from './type';
```

with:

```ts
import type { PublicProfile } from '@/lib/api-types';
```

and change each usage `api<PassportData>(...)` → `api<PublicProfile>(...)`, plus any other `PassportData` references in the file.

- [ ] **Step 3: Delete (or trim) the type files per Step 1's finding**

Run (if delete applies): `rm web/src/pages/JobseekerPassport/type.tsx web/src/pages/PublicPassport/type.tsx`

- [ ] **Step 4: Typecheck and resolve drift errors by trusting the generated type**

Run: `bun --cwd web typecheck`
Expected: PASS after fixing any field-name/optionality drift the swap surfaces.

- [ ] **Step 5: Commit**

```bash
git add web/src/pages
git commit -m "refactor(web): replace duplicate PassportData with generated PublicProfile"
```

---

### Task 10: Migrate remaining hand-written API types

**Files:**
- Modify: `web/src/lib/evaluation.ts` → use `EvaluationResponse` (and nested `SkillNote`/`SkillScoreItem`/`Suggestion` come along inside it)
- Modify: `web/src/lib/application.ts` → use `ApplicationResult`
- Modify: `web/src/pages/CompanySearch/type.tsx` + `index.tsx:7` → `Candidate` → `CandidateResult` from `@/lib/api-types`
- Modify: `web/src/pages/AdminVerifications/type.tsx` + `index.tsx:5` → `Company` → matching generated admin/verification response type
- Modify: `web/src/pages/JobseekerProfile/type.tsx` + `index.tsx:11` → `Profile`, `Experience` → generated `Profile`, `Experience`

- [ ] **Step 1: Inventory each file's hand-written API types**

Run: `grep -n "^export interface\|^export type\|^interface\|^type " web/src/lib/evaluation.ts web/src/lib/application.ts web/src/pages/CompanySearch/type.tsx web/src/pages/AdminVerifications/type.tsx web/src/pages/JobseekerProfile/type.tsx`

For each: if it describes an API request/response shape, replace it with the generated equivalent from `@/lib/api-types` (extend the barrel in `web/src/lib/api-types.ts` if a needed schema isn't re-exported yet — same `Schemas['Name']` pattern as Task 5). If it's a purely client-side type (UI state, derived view models), leave it.

For `AdminVerifications`: if no generated schema exists because the admin pending-verifications handler still returns an untyped list, fix it server-side first (named struct + `@Success` annotation as in Task 1), run `bun run api:generate`, then migrate.

- [ ] **Step 2: Apply the same mechanical swap as Tasks 6–9**

Pattern for each file: `import type { X } from '@/lib/api-types';` (or `'../lib/api-types'` in `src/lib/`), delete the local interface, update `api<X>(...)` call sites, keep a local `export type { X }` re-export only if other files import from that location.

- [ ] **Step 3: Typecheck after EACH file, not at the end**

Run: `bun --cwd web typecheck`
Expected: PASS after each swap. Resolve drift errors by trusting the generated type (or fixing the server and regenerating, as in Step 1's admin case).

- [ ] **Step 4: Confirm no hand-written API response types remain**

Run: `grep -rn "interface.*Response\|interface Job \|interface PassportData\|interface Industry " web/src --include="*.ts" --include="*.tsx" | grep -v "lib/generated\|api-types"`
Expected: no API-shape hits (form/Zod/UI-state types are fine).

- [ ] **Step 5: Commit**

```bash
git add web/src
git commit -m "refactor(web): migrate remaining api types to generated types"
```

---

### Task 11: Drift guards and workflow docs

There is no CI in this repo (`.github/workflows` doesn't exist), so guards live in lefthook pre-push (which already requires the Go toolchain for tests, so `api:check` is safe there).

**Files:**
- Modify: `lefthook.yml`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Add pre-push guards**

In `lefthook.yml`, add under `pre-push.commands`:

```yaml
    api-drift:
      run: bun run api:check
    no-gen-types-in-annotations:
      run: '! grep -rn "@Success.*_gen\." server-go/internal || (echo "go-jet gen types must not appear in @Success annotations — wrap them in a handler response struct" && exit 1)'
```

- [ ] **Step 2: Verify the guards**

Run: `bun run api:check`
Expected: exits 0 on a clean tree.

Run: `grep -rn "@Success.*_gen\." server-go/internal; echo "exit=$?"`
Expected: no matches, `exit=1` (so the negated guard passes).

- [ ] **Step 3: Document the workflow in CLAUDE.md**

In `CLAUDE.md`, add a row to the Development Commands table:

```markdown
| Regenerate API types | `bun run api:generate` (after changing any response struct or swag annotation) |
```

and add this subsection under "Common Patterns":

```markdown
### Changing an API request/response shape

1. Edit the named struct in `server-go/internal/handlers/` (or evaluation/application/matching) — never return raw `gin.H` or go-jet `internal/gen` types from success paths
2. Run `bun run api:generate` — regenerates `server-go/docs/` and `web/src/lib/generated/`
3. Commit BOTH the Go change and the regenerated files together
4. Web types come from `@/lib/api-types` (a barrel over `web/src/lib/generated/api.d.ts`) — never hand-write API response interfaces
```

- [ ] **Step 4: Full verification sweep**

Run: `bun run lint && bun --cwd web typecheck && go -C server-go test ./... -count=1 -p=1 && bun run api:check`
Expected: all PASS / exit 0.

- [ ] **Step 5: Commit**

```bash
git add lefthook.yml CLAUDE.md
git commit -m "chore: add api drift guards to pre-push and document regen workflow"
```

---

## Future work (explicitly out of scope)

- **swag v2 / native OpenAPI 3.1:** when `swaggo/swag/v2` stabilizes, drop `swagger2openapi` — a 2-line change to `api:types`.
- **Spec-first oapi-codegen:** the natural "v2" if drift keeps biting despite the guards; requires rewriting handler signatures.
- **Runtime validation (generated Zod):** server is a trusted first-party boundary today; door stays open.
- **`companyName` on public jobs:** if product wants it, add to `JobResponse` server-side (see Task 7 Step 4).
- **Error-path `gin.H{"error": ...}` returns and `health.go`:** uniform/unconsumed shapes, left as-is.
