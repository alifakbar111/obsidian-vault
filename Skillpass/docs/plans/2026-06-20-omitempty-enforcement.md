# Omitempty Enforcement Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all 42 Go response structs (117 nullable fields) that send `null` instead of omitting empty fields, and prevent this pattern from recurring.

**Architecture:** Build a custom `go vet` analyzer to detect nullable fields without `omitempty` on JSON-tagged response structs. Fix all existing violations. Wire the analyzer into CI and lefthook pre-push. Add a corresponding frontend check to ensure Zod schemas match the API spec.

**Tech Stack:** Go 1.26, `go/analysis` (static analysis), lefthook, grep, Zod

---

### Task 1: Build the `niljson` go vet analyzer

Create a custom static analysis tool that detects nullable fields on JSON-serialized structs missing `omitempty`.

The tool must:
1. Find all struct type declarations in the package
2. For each field with a `json:"name"` tag (no `,omitempty` suffix):
   - Check if the field type is nullable: `[]T` (slice), `*T` (pointer), `map[K]V` (map), `json.RawMessage` (interface-like), or `any`/`interface{}`
   - If yes, report a diagnostic at the field's position
3. Skip test files (`*_test.go`)
4. Report one line per violation: `file:line:col: field FieldName (type TypeName) missing omitempty in json tag`

**Files:**
- Create: `server-go/tools/cmd/niljson/main.go`
- Create: `server-go/tools/cmd/niljson/niljson.go` (the analyzer)
- Create: `server-go/tools/cmd/niljson/testdata/src/p/p.go` (test input)
- Create: `server-go/tools/cmd/niljson/niljson_test.go` (unit tests)

- [ ] **Step 1: Write the analyzer + main**

```go
// server-go/tools/cmd/niljson/niljson.go
package niljson

import (
	"go/ast"
	"go/types"
	"strings"

	"golang.org/x/tools/go/analysis"
	"golang.org/x/tools/go/analysis/passes/inspect"
	"golang.org/x/tools/go/ast/inspector"
)

var Analyzer = &analysis.Analyzer{
	Name:     "niljson",
	Doc:      "detects nullable struct fields without omitempty in json tags",
	Requires: []*analysis.Analyzer{inspect.Analyzer},
	Run:      run,
}

func isNullableType(t types.Type) bool {
	switch t := t.(type) {
	case *types.Slice:
		return true
	case *types.Pointer:
		return true
	case *types.Map:
		return true
	case *types.Named:
		// Check for json.RawMessage ([]byte named type, also nullable)
		if t.Obj().Name() == "RawMessage" && t.Obj().Pkg() != nil && strings.HasSuffix(t.Obj().Pkg().Path(), "encoding/json") {
			return true
		}
		// Check for any other named type whose underlying type is a pointer/slice/map
		// e.g. type MySlice []string
		return isNullableType(t.Underlying())
	case *types.Interface:
		return true
	}
	return false
}

func jsonTagHasOmitempty(tag string) bool {
	// tag is the raw tag value, e.g. `json:"name,omitempty"`
	// We need the "name,omitempty" part
	return strings.Contains(tag, ",omitempty")
}

func run(pass *analysis.Pass) (interface{}, error) {
	inspect := pass.ResultOf[inspect.Analyzer].(*inspector.Inspector)

	// Filter for struct type declarations only
	nodeFilter := []ast.Node{
		(*ast.TypeSpec)(nil),
	}

	inspect.Preorder(nodeFilter, func(n ast.Node) {
		ts := n.(*ast.TypeSpec)
		st, ok := ts.Type.(*ast.StructType)
		if !ok || st.Fields == nil {
			return
		}

		for _, field := range st.Fields.List {
			if field.Tag == nil {
				continue
			}
			tagValue := field.Tag.Value // raw string with backticks
			if !strings.Contains(tagValue, "json:") {
				continue
			}
			if strings.Contains(tagValue, ",omitempty") {
				continue
			}

			// Resolve the field's type
			obj := pass.TypesInfo.Defs[field.Names[0]]
			if obj == nil {
				// Embedded field or no name
				continue
			}
			if !isNullableType(obj.Type()) {
				continue
			}

			pass.Reportf(field.Pos(), "field %s (%s) missing omitempty in json tag",
				field.Names[0].Name, obj.Type().String())
		}
	})

	return nil, nil
}
```

```go
// server-go/tools/cmd/niljson/main.go
package main

import (
	"golang.org/x/tools/go/analysis/singlechecker"

	"skillpass-server-go/tools/cmd/niljson"
)

func main() {
	singlechecker.Main(niljson.Analyzer)
}
```

- [ ] **Step 2: Write test for the analyzer**

```go
// server-go/tools/cmd/niljson/niljson_test.go
package niljson_test

import (
	"testing"

	"golang.org/x/tools/go/analysis/analysistest"

	"skillpass-server-go/tools/cmd/niljson"
)

func TestNilJSON(t *testing.T) {
	testdata := analysistest.TestData()
	analysistest.Run(t, testdata, niljson.Analyzer, "p")
}
```

```go
// server-go/tools/cmd/niljson/testdata/src/p/p.go
package p

type GoodResponse struct {
	ID    string   `json:"id"`
	Name  string   `json:"name"`
	Tags  []string `json:"tags,omitempty"`
	Bio   *string  `json:"bio,omitempty"`
	Meta  map[string]int `json:"meta,omitempty"`
}

type BadResponse struct {
	ID     string   `json:"id"`
	Tags   []string `json:"tags"`
	Bio    *string  `json:"bio"`
}

type PartialResponse struct {
	ID     string   `json:"id"`
	Name   string   `json:"name,omitempty"`
	Tags   []string `json:"tags"`           // should report
	Extra  *string  `json:"extra,omitempty"`
	Meta   map[string]bool `json:"meta"`    // should report
}
```

- [ ] **Step 3: Run test to verify it passes**

Run: `go test ./tools/cmd/niljson/ -v`
Expected: PASS (2 diagnostics matched: `Tags` and `Bio` in `BadResponse`; `Tags` and `Meta` in `PartialResponse`)

- [ ] **Step 4: Add the dependency and wire up the build**

The analyzer depends on `golang.org/x/tools`. Add it to `server-go/go.mod`:

```bash
cd server-go && go get golang.org/x/tools@latest
```

Verify it builds:

```bash
go build ./tools/cmd/niljson/
```

Run it against the real codebase to confirm violations are detected:

```bash
go vet -vettool=$(go build -o /dev/null ./tools/cmd/niljson/ 2>&1; echo ./niljson) ./internal/... 2>&1 | head -20
```

Expected: Reports 117+ violations across all packages.

- [ ] **Step 5: Commit**

```bash
git add server-go/tools/cmd/niljson/ server-go/go.mod server-go/go.sum
git commit -m "feat: add niljson go vet analyzer for missing omitempty"
```

---

### Task 2: Fix all existing violations across server-go/internal/

This is the largest task. There are 117 violations across ~30 files. Each must be fixed carefully: adding `omitempty` to the JSON tag of nullable fields.

Strategy: Process by package. For each package, run `go vet -vettool=./niljson ./internal/{package}/...` before and after to confirm all violations in that package are resolved.

**Note on request structs:** Some nullable fields on request structs legitimately need `null` (e.g., to distinguish "not provided" from "set to empty"). Only fix response structs used in `@Success` annotations. Request structs should be evaluated case-by-case. The analyzer flags all structs — we'll fix response types and leave request types as TODO if they genuinely need `null`.

**Handling list:** The full list of structs to fix (see exploration output for file paths and fields):

| # | Struct | Package | File | Fields to fix |
|---|---|---|---|---|
| 1 | `ProfileResponse` | handlers | `profiles.go` | `Headline`, `About`, `YearsOfExp`, `AvatarURL`, `Experiences` |
| 2 | `Experience` | handlers | `profiles.go` | `EndDate`, `Description`, `Industry`, `SkillsUsed`, `URL` |
| 3 | `PublicProfileResponse` | handlers | `passport.go` | `AvatarURL`, `Headline`, `About`, `YearsOfExp`, `Experiences` |
| 4 | `IndustryResponse` | handlers | `reference.go` | `Description` |
| 5 | `TagResponse` | handlers | `reference.go` | `IndustryCategoryID` |
| 6 | `CompanyResponse` | handlers | `companies.go` | `Website`, `Description`, `VerificationDocs`, `VerifiedAt` |
| 7 | `PendingCompany` | handlers | `admin.go` | `Website`, `Description`, `VerificationDocs`, `VerifiedAt` |
| 8 | `CandidateResult` | handlers | `search.go` | `AvatarURL`, `Headline`, `About`, `YearsOfExp`, `Skills` |
| 9 | `UpdateProfileResponse` | handlers | `responses.go` | `Headline`, `About`, `YearsOfExperience` |
| 10 | `CareerPath` | career | `service.go` | `SkillRequirements`, `TypicalProgression` |
| 11 | `SkillGapResult` | career | `service.go` | `MatchingSkills`, `MissingSkills` |
| 12 | `CareerPrediction` | career | `service.go` | `PredictedPaths`, `SkillDevelopment` |
| 13 | `SkillDevelopment` | career | `service.go` | `Actions` |
| 14 | `JobMatch` | matching | `service.go` | `Location`, `SalaryRange`, `ExperienceLevel` |
| 15 | `CandidateMatch` | matching | `service.go` | `Headline`, `TopSkills` |
| 16 | `SkillsGap` | matching | `service.go` | `MatchedSkills`, `MissingSkills` |
| 17 | `EvaluationResponse` | evaluation | `handler.go` | `Strengths`, `Weaknesses`, `Suggestions`, `SkillScores` |
| 18 | `Feedback` | feedback | `service.go` | `RatingAreas`, `AISuggestions` |
| 19 | `Notification` | notification | `service.go` | `ReadAt` |
| 20 | `ListResult` | notification | `service.go` | `Notifications` |
| 21 | `CompanyAnalytics` | analytics | `service.go` | `AvgDaysToDecision`, `Jobs` |
| 22 | `JobseekerAnalytics` | analytics | `service.go` | `ResponseRate` |
| 23 | `Event` | webhook | `service.go` | `Data` |
| 24 | `ParsedExperience` | resume | `service.go` | `SkillsUsed` |
| 25 | `ParsedResume` | resume | `service.go` | `Experiences` |
| 26 | `Employee` | hris/employee | `service.go` | 28 fields (`UserID`, `Phone`, `DateOfBirth`, etc.) |
| 27 | `AttendanceLog` | hris/attendance | `service.go` | 8 fields |
| 28 | `AttendanceException` | hris/attendance | `service.go` | 4 fields |
| 29 | `PayrollRun` | hris/payroll | `service.go` | 4 fields |
| 30 | `Payslip` | hris/payroll | `service.go` | `Breakdown` |
| 31 | `Branch` | hris/org | `service.go` | 6 fields |
| 32 | `Department` | hris/org | `service.go` | `ParentDepartmentID` |
| 33 | `Position` | hris/org | `service.go` | `DepartmentID` |
| 34 | `OrgNode` | hris/org | `service.go` | `ParentID`, `Level` |
| 35 | `OrgChartNode` | hris/org | `service.go` | 5 fields |
| 36 | `LeaveRequest` | hris/leave | `service.go` | 4 fields |
| 37 | `ShiftTemplate` | hris/shift | `service.go` | `ApplicableDays` |
| 38 | `EmployeeShift` | hris/shift | `service.go` | `EndDate` |
| 39 | `Template` | hris/onboarding | `service.go` | `Tasks` |
| 40 | `Checklist` | hris/onboarding | `service.go` | `CompletedAt`, `Items` |
| 41 | `ChecklistItem` | hris/onboarding | `service.go` | `DueDate`, `CompletedAt`, `CompletedBy` |
| 42 | `AnalyticsSnapshot` | hris/report | `service.go` | `DepartmentBreakdown` |
| 43 | `HeadcountStats` | hris/report | `service.go` | `ByDepartment`, `ByBranch`, `ByStatus`, `GenderBreakdown` |

- [ ] **Step 6: Fix handlers package violations**

Run the analyzer first to get the baseline:
```bash
cd server-go && go vet -vettool=$(go build -o /dev/null ./tools/cmd/niljson/ && echo ./niljson) ./internal/handlers/
```

Expected output: violations in `ProfileResponse`, `Experience`, `PublicProfileResponse`, `IndustryResponse`, `TagResponse`, `CompanyResponse`, `PendingCompany`, `CandidateResult`, `UpdateProfileResponse`.

Fix each struct: add `,omitempty` to the json tag of each flagged field. For example:
```go
// Before
Headline *string `json:"headline"`
// After
Headline *string `json:"headline,omitempty"`
```

For slice fields:
```go
// Before
Experiences []Experience `json:"experiences"`
// After
Experiences []Experience `json:"experiences,omitempty"`
```

Re-run the analyzer to confirm zero violations in `internal/handlers/`.

- [ ] **Step 7: Fix career package violations**

Same pattern:
```bash
cd server-go && go vet -vettool=$(go build -o /dev/null ./tools/cmd/niljson/ && echo ./niljson) ./internal/career/
```

Fix `CareerPath`, `SkillGapResult`, `CareerPrediction`, `SkillDevelopment`. Re-run to confirm zero.

- [ ] **Step 8: Fix matching package violations**

```bash
cd server-go && go vet -vettool=$(go build -o /dev/null ./tools/cmd/niljson/ && echo ./niljson) ./internal/matching/
```

Fix `JobMatch`, `CandidateMatch`, `SkillsGap`. Re-run to confirm zero.

- [ ] **Step 9: Fix evaluation package violations**

Fix `EvaluationResponse` in `internal/evaluation/handler.go`.

- [ ] **Step 10: Fix feedback package violations**

Fix `Feedback` in `internal/feedback/service.go`.

- [ ] **Step 11: Fix remaining non-HRIS packages**

Fix `notification`, `analytics`, `webhook`, `resume` packages.

- [ ] **Step 12: Fix HRIS packages (employee, attendance, payroll, org, leave, shift, onboarding, report)**

Fix all HRIS structs. These have the most fields (Employee alone has 28). Run the analyzer after each sub-package:
```bash
cd server-go && go vet -vettool=... ./internal/hris/employee/
cd server-go && go vet -vettool=... ./internal/hris/attendance/
# ... etc for each HRIS package
```

- [ ] **Step 13: Final sweep — confirm zero violations across entire internal/**

```bash
cd server-go && go vet -vettool=$(go build -o ./niljson ./tools/cmd/niljson/ && echo ./niljson) ./internal/...
```

Expected: No output (zero violations). If violations remain, fix them.

- [ ] **Step 14: Run all Go tests to confirm nothing broke**

```bash
cd server-go && go test -p 1 ./...
```

All tests must pass. If a test expected `null` in JSON, that test would now fail because the field is omitted. Fix any such tests to not assert on `null` for now-omitted fields.

---

### Task 3: Wire niljson into CI / pre-push hook

- [ ] **Step 15: Build niljson as part of project setup**

Build the analyzer binary and store it, or run it via `go vet` on demand.

Add to `server-go/Makefile` or use the existing `bun run` pattern. Since the project uses `lefthook`, add the check there.

- [ ] **Step 16: Add niljson check to lefthook pre-push**

```yaml
# in lefthook.yml, add after the existing no-gen-types-in-annotations check
omitempty-check:
  run: >
    cd server-go &&
    go build -o /dev/null ./tools/cmd/niljson/ &&
    go vet -vettool=$(go build -o ./niljson ./tools/cmd/niljson/ && echo ./niljson) ./internal/... 2>&1 |
    awk '{print; if (NR > 0) e=1} END {if (e) {print "FAIL: nullable fields without omitempty found — add omitempty to json tags"; exit 1}}'
```

Test the hook:
```bash
cd server-go && go build -o niljson ./tools/cmd/niljson/ && go vet -vettool=./niljson ./internal/... 2>&1 | head -5
```

Expected: No output (zero violations).

- [ ] **Step 17: Commit**

```bash
git add lefthook.yml
git commit -m "ci: add niljson omitempty check to pre-push hook"
```

---

### Task 4: Add frontend Zod schema consistency safeguard

The goal: prevent the exact bug pattern where a Zod `.optional()` field receives `null` from the API. This is a belt-and-suspenders measure.

- [ ] **Step 18: Add a grep check for .optional() that doesn't also allow null**

```yaml
# in lefthook.yml, add a new check
zod-null-safety:
  # Find .optional() usage in Zod schemas where the field isn't also .nullable()
  # This flags schemas that would reject null from the API
  run: >
    ! grep -rn '\.optional()' web/src/lib/schemas/*.ts |
    grep -v '\.nullable()' |
    grep -v '\.nullish()' ||
    echo "WARNING: Found Zod .optional() without .nullable() — if this field can receive null from Go API, add .nullable() or ensure Go uses omitempty"
```

This is a warning-only check (doesn't exit non-zero) to avoid blocking pushes while making developers aware.

- [ ] **Step 19: Commit**

```bash
git add lefthook.yml
git commit -m "ci: add Zod null-safety warning to pre-push hook"
```

---

### Task 5: Run full verification

- [ ] **Step 20: Run full test suite**

```bash
cd server-go && go test -p 1 ./...
cd web && npx tsc --noEmit
cd web && npx vite build
bun run api:generate
```

All must pass cleanly.

- [ ] **Step 21: Run final omitempty sweep one more time**

```bash
cd server-go && go vet -vettool=$(go build -o ./niljson ./tools/cmd/niljson/ && echo ./niljson) ./internal/...
```

Expected: Zero output (no violations).

```bash
git add -A && git commit -m "fix: add omitempty to all nullable response struct fields"
```

---
