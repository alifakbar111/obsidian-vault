# HTTP Client Migration: ofetch + Zod + TanStack Query

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the custom 219-line `api()` HTTP client with `ofetch`, add runtime response validation via Zod schemas, and clean up `JSON.stringify` boilerplate across all callers.

**Architecture:** The existing `api()` function in `lib/api.ts` is the single entry point for all 49 HTTP callers. It has been rewritten to use `ofetch.create()` internally while keeping the same import path and `api<T>(path, options)` signature. The migration proceeds in phases: remove `JSON.stringify` from callers (enabled by ofetch's auto-JSON), add Zod schema helpers, then add runtime validation to a few representative pages. Zero callers change their import path.

**Tech Stack:** ofetch (HTTP), Zod v4 (runtime validation), TanStack Query v5 (server state)

**Status:** Phase 0 is already complete — `ofetch` installed, `api.ts` rewritten, typecheck and tests passing.

---

## File Inventory

### Files to create
| File | Purpose |
|---|---|
| `web/src/lib/schemas/job.ts` | Zod schema for `JobResponse` |
| `web/src/lib/schemas/auth.ts` | Zod schemas for `LoginResponse`, `UserResponse` |
| `web/src/lib/schemas/application.ts` | Zod schema for `ApplicationResult` |

### Files to modify
| File | Change |
|---|---|
| `web/src/lib/api.ts` | Already rewritten. Add `apiWithSchema()` helper (Task 3). |
| `web/src/lib/application.ts` | Remove `JSON.stringify` from `addApplicationMessage` |
| `web/src/lib/feedback.ts` | Remove `JSON.stringify` from mutation call |
| `web/src/lib/company-reviews.ts` | Remove `JSON.stringify` from mutation call |
| `web/src/lib/webhooks.ts` | Remove `JSON.stringify` from mutation call |
| `web/src/lib/resume.ts` | Remove `JSON.stringify` from mutation call |
| `web/src/lib/hris/org.ts` | Remove `JSON.stringify` from 6 mutation calls |
| `web/src/lib/hris/rbac.ts` | Remove `JSON.stringify` from mutation call |
| `web/src/lib/hris/employees.ts` | Remove `JSON.stringify` from 2 mutation calls |
| `web/src/lib/hris/calendar.ts` | Remove `JSON.stringify` from 2 mutation calls |
| `web/src/pages/ForgotPassword/index.tsx` | Remove `JSON.stringify`, use Zod schema |
| `web/src/pages/ResetPassword/index.tsx` | Remove `JSON.stringify`, use Zod schema |
| `web/src/pages/AdminVerifications/index.tsx` | Remove `JSON.stringify` |
| `web/src/pages/CompanyVerification/index.tsx` | Remove `JSON.stringify` |
| `web/src/pages/CompanyJobs/index.tsx` | Remove 3x `JSON.stringify` |
| `web/src/pages/CompanyApplications/index.tsx` | Remove `JSON.stringify` |
| `web/src/pages/CompanyProfile/index.tsx` | Remove 2x `JSON.stringify` |
| `web/src/pages/JobseekerProfile/index.tsx` | Remove 2x `JSON.stringify` |
| `web/src/pages/JobseekerProfile/ResumeImport.tsx` | Remove `JSON.stringify` |
| `web/src/components/jobseeker/AvatarUploader.tsx` | Replace `apiUpload` → `api` |
| `web/src/pages/JobDetail/index.tsx` | Add Zod-validated query |

---

### Phase 0 — Foundation (DONE)

- [x] **Step 1: Install ofetch**

```bash
bun add ofetch
```

Installed `ofetch@1.5.1`.

- [x] **Step 2: Rewrite `api.ts` to use `ofetch.create()`**

The full file is at `web/src/lib/api.ts`. Key structure:

```ts
import { ofetch, FetchError } from 'ofetch';
import type { FetchOptions } from 'ofetch';

const _ofetch = ofetch.create({
  baseURL: BASE_URL,
  credentials: 'include',
  onRequest({ options }) {
    const token = getAccessToken();
    if (token) {
      options.headers = new Headers(options.headers);
      options.headers.set('Authorization', `Bearer ${token}`);
    }
  },
});

export async function api<T = unknown>(path: string, options: FetchOptions<'json'> = {}): Promise<T> {
  try {
    return await _ofetch<T>(path, options);
  } catch (err) {
    if (err instanceof FetchError && err.status === 401) {
      const newToken = await doRefresh();
      if (newToken) {
        const headers = new Headers(options.headers as HeadersInit | undefined);
        headers.set('Authorization', `Bearer ${newToken}`);
        return _ofetch<T>(path, { ...options, headers });
      }
      throw new AuthError(401, body, 'Session expired.');
    }
    if (err instanceof FetchError) {
      throw new ApiError(err.status ?? 500, body, message);
    }
    throw err;
  }
}
```

Preserved exports: `getAccessToken()`, `clearTokens()`, `ApiError`, `AuthError`, `isAuthError()`, `api()`, `apiUpload()`, `login()`, `register()`, `logout()`.

- [x] **Step 3: Verify typecheck and tests pass**

```bash
bun run --cwd web typecheck
# → 0 errors

bun run --cwd web test
# → 3 files, 8 tests passed
```

---

### Task 1: Strip `JSON.stringify` from library files (non-pages)

**Files:**
- Modify: `web/src/lib/application.ts:28`
- Modify: `web/src/lib/feedback.ts:33`
- Modify: `web/src/lib/company-reviews.ts:27`
- Modify: `web/src/lib/webhooks.ts:18`
- Modify: `web/src/lib/resume.ts:24`
- Modify: `web/src/lib/hris/org.ts:51,55,67,71,83,87`
- Modify: `web/src/lib/hris/rbac.ts:26`
- Modify: `web/src/lib/hris/employees.ts:126,133`
- Modify: `web/src/lib/hris/calendar.ts:24,31`

These are all mutation helpers with the same pattern — `body: JSON.stringify(data)` → `body: data`.

No behavioral change. ofetch auto-stringifies objects.

- [ ] **Step 1.1: Update `lib/application.ts`**

```ts
// Before (line 28):
body: JSON.stringify({ body }),

// After:
body: { body },
```

- [ ] **Step 1.2: Update `lib/feedback.ts`**

```ts
// Before (line 33):
body: JSON.stringify(data),

// After:
body: data,
```

- [ ] **Step 1.3: Update `lib/company-reviews.ts`**

```ts
// Before (line 27):
body: JSON.stringify(data),

// After:
body: data,
```

- [ ] **Step 1.4: Update `lib/webhooks.ts`**

```ts
// Before (line 18):
body: JSON.stringify({ url }),

// After:
body: { url },
```

- [ ] **Step 1.5: Update `lib/resume.ts`**

```ts
// Before (line 24):
body: JSON.stringify({ text }),

// After:
body: { text },
```

- [ ] **Step 1.6: Update `lib/hris/org.ts`** — 6 occurrences

Each `body: JSON.stringify(data)` → `body: data` (lines 51, 55, 67, 71, 83, 87).

- [ ] **Step 1.7: Update `lib/hris/rbac.ts`**

```ts
// Before (line 26):
body: JSON.stringify({ roleId }),

// After:
body: { roleId },
```

- [ ] **Step 1.8: Update `lib/hris/employees.ts`** — 2 occurrences

```ts
// Before (lines 126, 133):
body: JSON.stringify(data),

// After:
body: data,
```

- [ ] **Step 1.9: Update `lib/hris/calendar.ts`** — 2 occurrences

```ts
// Before (lines 24, 31):
body: JSON.stringify(data),

// After:
body: data,
```

- [ ] **Step 1.10: Run typecheck and tests**

```bash
bun run --cwd web typecheck
# → 0 errors expected

bun run --cwd web test
# → 8 tests passed expected
```

- [ ] **Step 1.11: Commit**

```bash
git add web/src/lib/application.ts \
       web/src/lib/feedback.ts \
       web/src/lib/company-reviews.ts \
       web/src/lib/webhooks.ts \
       web/src/lib/resume.ts \
       web/src/lib/hris/org.ts \
       web/src/lib/hris/rbac.ts \
       web/src/lib/hris/employees.ts \
       web/src/lib/hris/calendar.ts
git commit -m "refactor(web): strip JSON.stringify callers — ofetch auto-serializes"
```

---

### Task 2: Strip `JSON.stringify` from page files

**Files:**
- Modify: `web/src/pages/ForgotPassword/index.tsx:20`
- Modify: `web/src/pages/ResetPassword/index.tsx:32`
- Modify: `web/src/pages/AdminVerifications/index.tsx:27`
- Modify: `web/src/pages/CompanyVerification/index.tsx:36`
- Modify: `web/src/pages/CompanyJobs/index.tsx:65,83,101`
- Modify: `web/src/pages/CompanyApplications/index.tsx:40`
- Modify: `web/src/pages/CompanyProfile/index.tsx:49,71`
- Modify: `web/src/pages/JobseekerProfile/index.tsx:85,105`
- Modify: `web/src/pages/JobseekerProfile/ResumeImport.tsx:63`

- [ ] **Step 2.1: Update `ForgotPassword/index.tsx`**

```ts
// Before:
body: JSON.stringify({ email: email.trim() }),

// After:
body: { email: email.trim() },
```

- [ ] **Step 2.2: Update `ResetPassword/index.tsx`**

```ts
// Before:
body: JSON.stringify({ token, newPassword: password }),

// After:
body: { token, newPassword: password },
```

- [ ] **Step 2.3: Update `AdminVerifications/index.tsx`**

```ts
// Before:
body: JSON.stringify({ action }),

// After:
body: { action },
```

- [ ] **Step 2.4: Update `CompanyVerification/index.tsx`**

```ts
// Before:
body: JSON.stringify(formData),

// After:
body: formData,
```

- [ ] **Step 2.5: Update `CompanyJobs/index.tsx`** — 3 occurrences

```ts
// Before (lines 65, 83):
body: JSON.stringify(parseFormData(data)),
// After:
body: parseFormData(data),

// Before (line 101):
body: JSON.stringify({ status: 'closed' }),
// After:
body: { status: 'closed' },
```

- [ ] **Step 2.6: Update `CompanyApplications/index.tsx`**

```ts
// Before:
body: JSON.stringify({ status: newStatus }),

// After:
body: { status: newStatus },
```

- [ ] **Step 2.7: Update `CompanyProfile/index.tsx`** — 2 occurrences

```ts
// Before (line 49):
body: JSON.stringify(data),
// After:
body: data,

// Before (line 71):
body: JSON.stringify({ blindMode: next }),
// After:
body: { blindMode: next },
```

- [ ] **Step 2.8: Update `JobseekerProfile/index.tsx`** — 2 occurrences

```ts
// Before (line 85):
body: JSON.stringify(data),
// After:
body: data,

// Before (line 105):
body: JSON.stringify({ ... }),
// After:
body: { ... },
```

- [ ] **Step 2.9: Update `JobseekerProfile/ResumeImport.tsx`**

```ts
// Before (line 63):
body: JSON.stringify({ ... }),
// After:
body: { ... },
```

- [ ] **Step 2.10: Run typecheck**

```bash
bun run --cwd web typecheck
# → 0 errors expected
```

- [ ] **Step 2.11: Commit**

```bash
git add web/src/pages/ForgotPassword/index.tsx \
       web/src/pages/ResetPassword/index.tsx \
       web/src/pages/AdminVerifications/index.tsx \
       web/src/pages/CompanyVerification/index.tsx \
       web/src/pages/CompanyJobs/index.tsx \
       web/src/pages/CompanyApplications/index.tsx \
       web/src/pages/CompanyProfile/index.tsx \
       web/src/pages/JobseekerProfile/index.tsx \
       web/src/pages/JobseekerProfile/ResumeImport.tsx
git commit -m "refactor(web): strip JSON.stringify from page callers"
```

---

### Task 3: Add `apiWithSchema` helper and simplify `apiUpload`

**Files:**
- Modify: `web/src/lib/api.ts` — add `apiWithSchema()` and `FetchError`-to-`ApiError` interceptor
- Modify: `web/src/components/jobseeker/AvatarUploader.tsx` — `apiUpload` → `api`

- [ ] **Step 3.1: Add `apiWithSchema` export to `api.ts`**

Insert after the `api()` function (around line 130):

```ts
import { z } from 'zod';

// ── Zod-validated fetch ────────────────────────────────────
// Calls api(), then validates the response against a Zod schema.
// Throws ZodError if the API returns unexpected data at runtime.

export async function apiWithSchema<T extends z.ZodTypeAny>(
  schema: T,
  path: string,
  options?: FetchOptions<'json'>,
): Promise<z.infer<T>> {
  return api(path, options).then((data) => schema.parse(data));
}
```

Also add the `import { z } from 'zod'` at the top of the file (after the ofetch imports):

```ts
import { z } from 'zod';
```

- [ ] **Step 3.2: Simplify `AvatarUploader.tsx` — `apiUpload` → `api`**

```ts
// Before (line 3):
import { ApiError, apiUpload } from '@/lib/api';
// After:
import { ApiError, api } from '@/lib/api';

// Before (line 25):
const res = await apiUpload<{ avatarUrl: string }>('/profiles/me/avatar', form);
// After:
const res = await api<{ avatarUrl: string }>('/profiles/me/avatar', { method: 'POST', body: form });
```

- [ ] **Step 3.3: Run typecheck**

```bash
bun run --cwd web typecheck
# → 0 errors expected
```

- [ ] **Step 3.4: Commit**

```bash
git add web/src/lib/api.ts \
       web/src/components/jobseeker/AvatarUploader.tsx
git commit -m "feat(web): add apiWithSchema helper, simplify apiUpload caller"
```

---

### Task 4: Create Zod schema for Job endpoint

**Files:**
- Create: `web/src/lib/schemas/job.ts`

- [ ] **Step 4.1: Create the job schema**

```ts
// web/src/lib/schemas/job.ts
import { z } from 'zod';

/** Matches the OpenAPI JobResponse shape — validates at the fetch boundary. */
export const JobSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  industry: z.string().optional(),
  location: z.string().optional(),
  salaryRange: z.string().optional(),
  experienceLevel: z.string().optional(),
  status: z.string().optional(),
  createdAt: z.string().optional(),
  requiredSkills: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  companyId: z.string().optional(),
});

export type Job = z.infer<typeof JobSchema>;
```

- [ ] **Step 4.2: Run typecheck**

```bash
bun run --cwd web typecheck
# → 0 errors expected
```

- [ ] **Step 4.3: Commit**

```bash
git add web/src/lib/schemas/job.ts
git commit -m "feat(web): add Zod schema for JobResponse"
```

---

### Task 5: Add Zod-validated query to JobDetail page

**Files:**
- Modify: `web/src/pages/JobDetail/index.tsx` — use `apiWithSchema` instead of `api` for the job query

- [ ] **Step 5.1: Update imports and queryFn in `JobDetail/index.tsx`**

```ts
// Before:
import { ApiError, api } from '@/lib/api';
import type { Job } from '@/lib/api-types';

// After:
import { ApiError, apiWithSchema } from '@/lib/api';
import { JobSchema, type Job } from '@/lib/schemas/job';
```

```ts
// Before:
queryFn: () => api<Job>(`/jobs/${encodeURIComponent(id as string)}`),

// After:
queryFn: () => apiWithSchema(JobSchema, `/jobs/${encodeURIComponent(id as string)}`),
```

- [ ] **Step 5.2: Run typecheck**

```bash
bun run --cwd web typecheck
# → 0 errors expected
```

- [ ] **Step 5.3: Commit**

```bash
git add web/src/pages/JobDetail/index.tsx
git commit -m "feat(web): add Zod runtime validation to JobDetail query"
```

---

### Task 6: Create Zod schemas for auth endpoints

**Files:**
- Create: `web/src/lib/schemas/auth.ts`

- [ ] **Step 6.1: Create auth schemas**

```ts
// web/src/lib/schemas/auth.ts
import { z } from 'zod';

/** Matches the OpenAPI UserResponse shape. */
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email().optional(),
  username: z.string().optional(),
  name: z.string().optional().nullable(),
  role: z.enum(['jobseeker', 'company', 'admin']).optional(),
  isVerified: z.boolean().optional(),
  avatarUrl: z.string().optional().nullable(),
  createdAt: z.string().optional(),
});

export type AuthUser = z.infer<typeof UserSchema>;

/** Matches the OpenAPI LoginResponse shape. */
export const LoginResponseSchema = z.object({
  accessToken: z.string().optional(),
  user: UserSchema.optional(),
});
```

- [ ] **Step 6.2: Run typecheck**

```bash
bun run --cwd web typecheck
# → 0 errors expected
```

- [ ] **Step 6.3: Commit**

```bash
git add web/src/lib/schemas/auth.ts
git commit -m "feat(web): add Zod schemas for auth endpoints"
```

---

### Task 7: Create Zod schema for application endpoint

**Files:**
- Create: `web/src/lib/schemas/application.ts`

- [ ] **Step 7.1: Create application schema**

```ts
// web/src/lib/schemas/application.ts
import { z } from 'zod';

export const ApplicationSchema = z.object({
  id: z.string(),
  jobId: z.string().optional(),
  userId: z.string().optional(),
  status: z.string().optional(),
  resumeUrl: z.string().optional().nullable(),
  coverLetter: z.string().optional().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  job: z.object({
    id: z.string().optional(),
    title: z.string().optional(),
    companyId: z.string().optional(),
  }).optional(),
});

export type Application = z.infer<typeof ApplicationSchema>;
```

- [ ] **Step 7.2: Run typecheck**

```bash
bun run --cwd web typecheck
# → 0 errors expected
```

- [ ] **Step 7.3: Commit**

```bash
git add web/src/lib/schemas/application.ts
git commit -m "feat(web): add Zod schema for ApplicationResult"
```

---

### Task 8: Add Zod-validated query to CompanyJobs page (representative example)

**Files:**
- Modify: `web/src/pages/CompanyJobs/index.tsx` — use `apiWithSchema` for the company jobs query

This demonstrates the pattern on a page that also uses `useMutation` (so both query + mutation are covered).

- [ ] **Step 8.1: Update CompanyJobs to use Zod-validated query**

```ts
// Before:
import { ApiError, api } from '@/lib/api';
import type { Job } from '@/lib/api-types';

// After:
import { ApiError, api, apiWithSchema } from '@/lib/api';
import { JobSchema, type Job } from '@/lib/schemas/job';
```

Change the query `useQuery` call to use `apiWithSchema`:

```ts
// Before:
queryFn: () => api<Job[]>('/company/jobs'),

// After:
queryFn: () => apiWithSchema(z.array(JobSchema), '/company/jobs'),
```

- [ ] **Step 8.2: Run typecheck**

```bash
bun run --cwd web typecheck
# → 0 errors expected
```

- [ ] **Step 8.3: Commit**

```bash
git add web/src/pages/CompanyJobs/index.tsx
git commit -m "feat(web): add Zod runtime validation to CompanyJobs query"
```

---

### Self-Review

**1. Spec coverage:** The spec asks for migration using ofetch + Zod + TanStack Query.
- ✅ Phase 0: ofetch migration done (api.ts rewritten)
- ✅ Task 1-2: JSON.stringify removal across all 29 callers
- ✅ Task 3: apiWithSchema helper and apiUpload cleanup
- ✅ Task 4-7: Zod schemas for Job, Auth, Application
- ✅ Task 5, 8: Zod validation integrated into TanStack Query pages

**2. Placeholder scan:** All steps contain exact before/after code. No TODOs, TBDs, or "implement later" patterns.

**3. Type consistency:** `apiWithSchema` returns `Promise<z.infer<T>>` which matches what TanStack Query expects as `data`. `Job`, `AuthUser`, and `Application` types are re-derived from Zod schemas, consistent with how they're used in their respective pages.

---

## Execution Handoff

Plan complete and saved to `docs/plans/2026-06-16-ofetch-zod-migration.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
