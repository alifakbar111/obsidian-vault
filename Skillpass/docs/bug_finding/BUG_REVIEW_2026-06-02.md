# Bug Review: Job Post Auth & Plugin Scoping

**Date**: 2026-06-02
**Scope**: `server/src/routes/jobs.ts`, `web/src/pages/CompanyJobs.tsx` — job creation flow + company route auth
**Trigger**: `POST /api/v1/jobs/` returning `error(403, "Company not verified")` and then `Unauthorized`

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 1 |
| High     | 1 |
| Medium   | 1 |
| **Total** | **3** |

---

## Findings

### [BUG-001] `new Elysia()` Plugin Auth Derive Never Fires (Critical)

- **File**: `server/src/routes/jobs.ts:32-150`
- **Confidence**: High
- **Problem**: Wrapping company routes in `jobRoutes.use(new Elysia().use(jwt(...)).derive(...).post('/')...)` does not scope the inner `derive` hook to the mounted routes. The derive never runs, so `userId` is never injected into the handler context. The JWT context property (`jwt`) is also unreachable from within the scoped instance, causing the auth check to fail with `401 Unauthorized` on every request.
- **Root cause**: Elysia v1's `.use()` with a bare `new Elysia()` instance creates a plugin whose hooks (`derive`, `onRequest`, etc.) are not applied to routes mounted on the parent instance. All other route files in the codebase (`profiles.ts`, `companies.ts`, `search.ts`) use the **chained** pattern (`.use(jwt()).derive().get()...` on the same chain), never `new Elysia().derive()` as a standalone plugin.
- **Evidence**:
  1. User confirmed `Uncaught (in promise) Error: Unauthorized` after applying the `new Elysia()` plugin pattern.
  2. Prior to the plugin pattern, the original code with inline auth (`jobRoutes.post('/', async ({ jwt: j }) => j.verify(...))`) worked — the user reached "Company not verified" error.
  3. The `refreshAccessToken()` flow in `api.ts` also fails because the auth/refresh endpoint returns 401, causing the entire retry to collapse.
- **Fix applied**: Restored the proven pattern — JWT plugin on `jobRoutes` directly, inline auth checks in each handler using `set.status`. The `GET /me` group with derive is kept as-is (it was never broken).
  ```ts
  jobRoutes.post('/', async ({ headers, body, jwt: j, set }) => {
    const auth = headers.authorization;
    if (!auth?.startsWith('Bearer ')) { set.status = 401; return 'Unauthorized'; }
    const payload = await j.verify(auth.slice(7));
    if (!payload || payload.role !== 'company') { set.status = 401; return 'Unauthorized'; }
    // ...
  });
  ```

---

### [BUG-002] Unhandled Promise Rejections in `createJob` / `closeJob` (High)

- **File**: `web/src/pages/CompanyJobs.tsx:58-86`
- **Confidence**: High
- **Problem**: `createJob` calls `await api(...)` without try/catch. Any API error (401, 403, network failure, server error) becomes an unhandled promise rejection that crashes the React render. Same for `closeJob()` and the initial `useEffect` data fetches.
- **Evidence**: User stack trace:
  ```
  Uncaught (in promise) Error: Unauthorized
      at api (api.ts:56:11)
      at async createJob (CompanyJobs.tsx:72:5)
  ```
- **Fix applied**: Wrapped `createJob` and `closeJob` in try/catch. On failure, displays an inline error banner (`alert alert-error`) with the server message and a dismiss button.

---

### [BUG-003] No Role-Based Route Guard on `/company/jobs` (Medium)

- **File**: `web/src/pages/CompanyJobs.tsx` (no guard), `web/src/App.tsx` (no route wrapper)
- **Confidence**: High
- **Problem**: The `/company/jobs` route is accessible to any user regardless of role or auth status. A jobseeker or unauthenticated user who navigates directly to the URL sees the page (it fetches data, fails silently, shows "No job postings yet"). There is no React Router guard, no redirect on unauthorized access, and no error feedback when the page can't load its data.
- **Evidence**: The `Navbar` already hides the "Jobs" link from non-company users (`Navbar.tsx:44-53`), but there is no server-side or client-side enforcement at the route level.
- **Fix applied**: Added auth guard in `CompanyJobs` component — redirects unauthenticated users to `/auth/login`, redirects non-company users to `/`. Shows `LoadingFallback` during auth initialization. Returns `null` during redirect to prevent flash of content.
  ```tsx
  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/auth/login', { replace: true }); return; }
    if (user.role !== 'company') { navigate('/', { replace: true }); return; }
    // ... fetch data
  }, [user, authLoading, navigate]);
  ```

---

## Areas Investigated (No Issues Found)

| Area | Result |
|------|--------|
| **Authorization/IDOR** | All company routes scope DB queries to the authenticated user's `companyId`. No IDOR between different company accounts. |
| **SQL Injection** | All queries use Drizzle ORM parameterized queries. |
| **CSRF** | Bearer token in `Authorization` header — browsers do not auto-attach this cross-origin. |
| **Business Logic** | Company verification check (`verificationStatus !== 'verified'`) is correctly enforced before job creation. |
