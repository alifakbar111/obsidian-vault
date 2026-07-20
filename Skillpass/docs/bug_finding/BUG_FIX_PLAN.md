# Bug Fix Plan

**Date**: 2026-06-03
**Based on**: `docs/BUG_REVIEW_2026-06-02.md` + deep-dive exploration
**Scope**: Server (`server/src/`) and Web (`web/src/`) — auth, error handling, route guards

---

## Overview

Three bugs were identified in the job-posting auth flow. The deep-dive revealed these are symptoms of broader systemic issues:

| Area | Issues Found | Severity |
|------|-------------|----------|
| **Server auth pattern** | 1 bug (critical) + 1 architectural smell | Critical |
| **Client error handling** | 12+ unhandled rejection sites across 7 pages, 3 critical gaps in `api.ts` | High |
| **Client route guards** | 4 inconsistent patterns, 2 missing guards, 1 dead component | Medium |

### Strategy

Fix in dependency order — server auth first (everything depends on it), then `api.ts` hardening (core infra), then per-page error handling, then route guards.

---

## Phase 1: Server Auth Consolidation

### 1.1 🔴 BUG-001 — Refactor `jobs.ts` to Use `.guard()`

**Files**: `server/src/routes/jobs.ts`

**Current state**:
- `POST /`, `PUT /:id`, `DELETE /:id` each have 15 lines of copy-pasted JWT verify + company role check + verification check
- `GET /me` group uses a scoped `.derive()` (works, but only covers that group)
- Total: ~45 lines of duplicate auth logic

**Fix**: Use Elysia's `.guard({ as: "scoped", derive: fn }, callback)` to define auth once and scope it to only the protected routes.

```ts
// After public GET / and GET /:id routes...

jobRoutes.guard(
  {
    as: "scoped",
    derive: async ({ headers, jwt: j }) => {
      const auth = headers.authorization;
      if (!auth?.startsWith('Bearer ')) return status(401, 'Unauthorized');
      const payload = await j.verify(auth.slice(7));
      if (!payload) return status(401, 'Unauthorized');
      if (payload.role !== 'company') return status(401, 'Unauthorized');

      const [company] = await db
        .select()
        .from(schema.companies)
        .where(eq(schema.companies.userId, payload.userId as string))
        .limit(1);
      if (!company) return status(404, 'Company not found');
      if (company.verificationStatus !== 'verified') return status(403, 'Company not verified');

      return { userId: payload.userId as string, companyId: company.id };
    },
  },
  (app) =>
    app
      .get('/me', listMyJobsHandler)
      .post('/', createJobHandler, { body: ... })
      .put('/:id', updateJobHandler, { body: ... })
      .delete('/:id', deleteJobHandler),
);
```

**Why `.guard()` works**: Registers derive with `scope: "scoped"` on the parent instance, which survives the lifecycle merge. Public routes defined before `.guard()` are unaffected.

**Net change**: ~45 lines of duplicate auth → ~15 lines once. No `.derive()` unused return values.

---

### 1.2 🟡 Centralize `JWT_SECRET` (from SECURITY_REVIEW VULN-003)

**Files**: 
- `server/src/config.ts` (new)
- `server/src/routes/auth.ts`, `profiles.ts`, `jobs.ts`, `companies.ts`, `search.ts`, `admin.ts`

**Current state**: 6 files each define `const JWT_SECRET = process.env.JWT_SECRET || 'skillpass-dev-secret-change-in-prod'`.

**Fix**: Create a single config module that throws on missing env var:

```ts
// server/src/config.ts
export const config = {
  jwtSecret: process.env.JWT_SECRET,
} as const;

if (!config.jwtSecret) {
  throw new Error('JWT_SECRET environment variable is required');
}
```

Then import from one place:
```ts
import { config } from '../config';
// .use(jwt({ secret: config.jwtSecret, name: 'jwt' }))
```

**Why**: Eliminates 6 copies of the same fallback default. Prevents silent production failure if one file's env var is unset. This also aligns with the docker-compose fix in VULN-002.

---

### 1.3 🟡 Remove Dead `middleware/auth.ts`

**File**: `server/src/middleware/auth.ts`

**Current state**: Dead code — never imported. Uses `guard({ beforeHandle })` which would face the same lifecycle scoping issue and doesn't provide `userId` to handlers.

**Fix**: Delete the file.

**Why**: Dead code is confusing. The pattern it attempted (plugin with guard) is fundamentally incompatible with how Elysia scopes hooks.

---

## Phase 2: API Client Hardening (`api.ts`)

### 2.1 🔴 C-2 — Handle Non-JSON Responses

**File**: `web/src/lib/api.ts`

**Current state**: `res.json()` at line 59 throws `SyntaxError` if server returns non-JSON (e.g., nginx 502 HTML page). Same at line 33 for refresh token response.

**Fix**: Wrap `res.json()` in a try/catch, fall back to `res.text()` for error message:

```ts
// In api() function:
if (!res.ok) {
  const err = await res.text().catch(() => 'Unknown error');
  throw new Error(err || `HTTP ${res.status}`);
}

// At return:
try {
  const data = await res.clone().json();
  return data as T;
} catch {
  const text = await res.text();
  throw new Error(text || 'Invalid server response');
}
```

Alternatively, simplify: always call `res.text()`, then try `JSON.parse()`:

```ts
const body = await res.text();
if (!res.ok) throw new Error(body || `HTTP ${res.status}`);
return JSON.parse(body) as T;
```

**Also fix** `refreshAccessToken()` at line 33 with the same treatment.

---

### 2.2 🔴 C-3 — Handle Network Failures

**File**: `web/src/lib/api.ts`

**Current state**: `fetch()` at lines 44 and 50 can throw `TypeError` on network failure. Neither call is wrapped.

**Fix**: Wrap the entire `api()` function body in try/catch:

```ts
export async function api<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  try {
    // ... existing logic ...
    return res.json();
  } catch (err) {
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      throw new Error('Network error — please check your connection');
    }
    throw err;
  }
}
```

---

### 2.3 🟡 M-1 — Guard Against `setTokens(undefined)`

**File**: `web/src/lib/api.ts`, line 33-34

**Current state**: If refresh response body lacks `accessToken`, `data.accessToken` is `undefined`, stored as literal `"undefined"` in localStorage.

**Fix**: Validate before storing:

```ts
const data = await res.json();
if (!data.accessToken || typeof data.accessToken !== 'string') {
  clearTokens();
  return null;
}
setTokens(data.accessToken);
```

---

### 2.4 🟡 M-3 — Don't `clearTokens()` on Network Errors in `useAuth`

**File**: `web/src/hooks/useAuth.tsx`, line 42

**Current state**: `.catch(() => clearTokens())` — clears tokens on any error (500, network, etc.), not just 401.

**Fix**: Only clear tokens on auth-related errors:

```ts
api<User>('/profiles/me')
  .then((u) => setUser(u))
  .catch((err) => {
    if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
      clearTokens();
    }
  })
  .finally(() => setLoading(false));
```

Or better, have `api.ts` export a reusable error classification:

```ts
// api.ts
export function isAuthError(err: unknown): boolean {
  return err instanceof Error && (
    err.message.includes('401') ||
    err.message.includes('Unauthorized') ||
    err.message.includes('Session expired')
  );
}
```

---

## Phase 3: Per-Page Error Handling

### 3.1 🔴 H-1 through H-8 — Wrap All `api()` Calls in Try/Catch

This follows the exact same pattern as the BUG-002 fix in `CompanyJobs.tsx`. Each async function that calls `api()` must catch errors and surface them to the user.

**Affected files and changes**:

| File | Async calls | Fix pattern |
|------|-------------|-------------|
| `JobseekerProfile.tsx` | `saveProfile`, `addExperience`, `deleteExperience`, init load | try/catch on all; `.catch()` on init load |
| `JobDetail.tsx` | init load | `.catch()` sets error state |
| `JobseekerPassport.tsx` | init load | `.catch()` sets error state |
| `CompanyProfile.tsx` | `onSubmit`, init load | try/catch on submit; `.catch()` on init load |
| `CompanyVerification.tsx` | `onSubmit`, init load | try/catch on submit; `.catch()` on init load |
| `CompanySearch.tsx` | `search`, init load | try/catch on search; `.catch()` on init load |
| `AdminVerifications.tsx` | `handleAction`, init load | try/catch on action; `.catch()` on init load |
| `PublicJobs.tsx` | init load | `.catch()` sets error state |

**Standard pattern for init loads**:
```tsx
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  api<Data[]>('/some-endpoint')
    .then(setData)
    .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load data'));
}, []);
```

**Standard pattern for mutations**:
```tsx
const handleAction = async () => {
  setLoading(true);
  setError(null);
  try {
    await api('/some-endpoint', { method: 'POST' });
    // success: update state, close forms, etc.
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Action failed');
  } finally {
    setLoading(false);
  }
};
```

**Error display**: Reuse the `alert alert-error` pattern from CompanyJobs.tsx.

---

### 3.2 🔴 C-1 — Add React Error Boundary

**File**: `web/src/components/ui/ErrorBoundary.tsx` (new)

**Current state**: No Error Boundary anywhere. Any render crash = blank white page.

**Fix**: Create a reusable Error Boundary component:

```tsx
// web/src/components/ui/ErrorBoundary.tsx
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold">Something went wrong</h2>
            <p className="text-sm opacity-70">{this.state.error?.message}</p>
            <button className="btn btn-primary btn-sm" onClick={() => window.location.reload()}>
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
```

**Wire into** `App.tsx`:
```tsx
<AuthProvider>
  <ErrorBoundary>
    <RouterProvider router={router} />
  </ErrorBoundary>
</AuthProvider>
```

**Why class component**: React Error Boundaries require `getDerivedStateFromError` / `componentDidCatch`, which hooks cannot provide.

---

## Phase 4: Client Route Guard Consolidation

### 4.1 🟡 Enable `ProtectedRoute` with `admin` Role

**Files**:
- `web/src/components/ui/ProtectedRoute.tsx`
- `web/src/App.tsx`
- `web/src/pages/CompanyJobs.tsx` (remove self-guard)
- `web/src/pages/CompanyProfile.tsx`, `CompanyVerification.tsx`, `JobseekerProfile.tsx`, `JobseekerPassport.tsx`, `CompanySearch.tsx`, `AdminVerifications.tsx`

**Current state**: ProtectedRoute exists but is unused. Its `role` Prop only allows `'jobseeker' | 'company'`.

**Fix step 1 — Update ProtectedRoute**:
```tsx
interface Props {
  children: React.ReactNode;
  role?: 'jobseeker' | 'company' | 'admin';
}

export function ProtectedRoute({ children, role }: Props) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingFallback />;
  if (!user) return <Navigate to="/auth/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}
```

**Fix step 2 — Wire into App.tsx routes**:

```tsx
// Protected route helper:
function Protect({ role, children }: { role: 'jobseeker' | 'company' | 'admin'; children: ReactNode }) {
  return <ProtectedRoute role={role}>{children}</ProtectedRoute>;
}

// In router config:
{
  path: '/jobseeker/profile',
  element: <Protect role="jobseeker"><Suspense><JobseekerProfile /></Suspense></Protect>,
},
{
  path: '/company/jobs',
  element: <Protect role="company"><Suspense><CompanyJobs /></Suspense></Protect>,
},
// ... etc for all 7 protected routes
```

**Fix step 3 — Remove self-guards from page components**:

- `CompanyJobs.tsx`: Remove lines 58-74 (useEffect guard), lines 116-117 (render guard). The component no longer needs `useAuth()` at all unless it needs the user object for display.
- `JobseekerProfile.tsx`, `CompanyProfile.tsx`, `CompanyVerification.tsx`: Remove the "Access denied" early return blocks. Keep `useAuth()` only if `user` data is needed.
- `JobseekerPassport.tsx`: Remove the conditional fetch guard — ProtectedRoute ensures only jobseeker-role users reach it.
- `CompanySearch.tsx`, `AdminVerifications.tsx`: Add to route guard — these currently have no protection at all.

---

## Phase 5: Developer Experience Improvements

### 5.1 🟢 Add Global Unhandled Rejection Handler

**File**: `web/src/main.tsx`

**Fix**:
```tsx
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Optionally show a toast notification
});
```

This catches any remaining unhandled rejections that slip through and logs them clearly.

### 5.2 🟢 Logging in Empty `.catch()` Handlers

**Current state**: `CompanyJobs.tsx` lines 70, 73 use `.catch(() => {})` which swallows errors silently.

**Fix**: At minimum, log to console:
```tsx
.catch((err) => console.error('Failed to load jobs:', err));
```

---

## Dependencies Between Phases

```
Phase 1 (server auth)
  └── needed for: Phase 2 (api.ts) can be tested independently
                      ↓
Phase 2 (api.ts hardening)
  └── needed for: Phase 3 (per-page error handling) benefits from better api.ts errors
                      ↓
Phase 3 (per-page error handling)
  └── independent from: Phase 4 (route guards)
                      ↓
Phase 4 (route guards)
  └── independent from: Phase 3
                      ↓
Phase 5 (DX improvements) — can be done anytime
```

Phases 2 and 4 are independent and can be parallelized. Phase 3 depends on Phase 2 only if you want the improved error messages from Phase 2 fixes — the try/catch pattern itself works regardless.

---

## Testing Strategy

| Phase | What to Test | How |
|-------|-------------|-----|
| 1.1 | POST/PUT/DELETE `/api/v1/jobs/` with valid/invalid/missing token, wrong role, unverified company | `curl` or Bun test |
| 1.1 | GET `/api/v1/jobs/` and GET `/api/v1/jobs/:id` still public | `curl` without token |
| 1.2 | Server startup without `JWT_SECRET` env var | Ensure it throws |
| 2.1-2.2 | `api()` with network down, non-JSON response | Mock fetch in tests |
| 2.3 | Refresh endpoint returning missing `accessToken` | Mock response |
| 2.4 | `/profiles/me` returning non-401 error | Verify tokens preserved |
| 3.1 | Each page's API calls failing | Verify error shown, no spinner death |
| 3.2 | Throw in a component render | Verify ErrorBoundary catches |
| 4.1 | Navigate to each protected route while logged out, wrong role, correct role | E2E or manual |

---

## Summary of Changes by File

| File | Phase | Change Type |
|------|-------|-------------|
| `server/src/routes/jobs.ts` | 1.1 | Refactor — replace inline auth with `.guard()` |
| `server/src/config.ts` | 1.2 | New — centralized config |
| `server/src/routes/*.ts` (6 files) | 1.2 | Refactor — import config instead of inline JWT_SECRET |
| `server/src/middleware/auth.ts` | 1.3 | Delete — dead code |
| `web/src/lib/api.ts` | 2.1-2.3 | Refactor — error handling hardening |
| `web/src/hooks/useAuth.tsx` | 2.4 | Refactor — selective clearTokens |
| `web/src/components/ui/ErrorBoundary.tsx` | 3.2 | New — error boundary |
| `web/src/App.tsx` | 3.2, 4.1 | Refactor — add ErrorBoundary + ProtectedRoute wrappers |
| `web/src/components/ui/ProtectedRoute.tsx` | 4.1 | Refactor — add admin role |
| `web/src/pages/CompanyJobs.tsx` | 4.1 | Refactor — remove self-guard |
| `web/src/pages/JobseekerProfile.tsx` | 3.1, 4.1 | Refactor — add try/catch, remove self-guard |
| `web/src/pages/JobDetail.tsx` | 3.1 | Refactor — add .catch() |
| `web/src/pages/JobseekerPassport.tsx` | 3.1, 4.1 | Refactor — add .catch(), remove weak guard |
| `web/src/pages/CompanyProfile.tsx` | 3.1, 4.1 | Refactor — add try/catch, remove self-guard |
| `web/src/pages/CompanyVerification.tsx` | 3.1, 4.1 | Refactor — add try/catch, remove self-guard |
| `web/src/pages/CompanySearch.tsx` | 3.1, 4.1 | Refactor — add try/catch, add route guard |
| `web/src/pages/AdminVerifications.tsx` | 3.1, 4.1 | Refactor — add try/catch, add route guard |
| `web/src/pages/PublicJobs.tsx` | 3.1 | Refactor — add .catch() |
| `web/src/pages/Register.tsx` | 3.1 | Fix — correct console.error variable |
| `web/src/main.tsx` | 5.1 | Refactor — add unhandledrejection listener |
