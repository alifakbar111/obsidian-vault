# SkillPass — Product Improvement Plan

**Created:** 2026-06-24
**Based on:** Product Researcher comprehensive analysis
**Status:** DRAFT — pending team review

---

## 1. Product Health Scorecard

| Dimension | Score (1-5) | Assessment |
|-----------|:-----------:|------------|
| **Feature Completeness** | **4** | 67 features across job platform + full HRIS with 9 modules. Covers auth, profiles, AI evaluation, matching, feedback, career paths, and enterprise-grade HRIS (attendance, payroll, leave, onboarding, org chart). Missing: social login, mobile, monetization. |
| **Technical Quality** | **2** | Go/Gin + React 19 stack is solid. UUID panic fix applied. But: N+1 queries documented but unfixed, zero automated test coverage on frontend (3 test files vs 67 features), and the `FINAL_IMPLEMENTATION_PLAN.md` lists performance work still pending. Security posture is reasonable (JWT, RBAC, rate limiting) but untested. |
| **User Experience** | **3** | Tailwind v4 + DaisyUI 5 design system is defined and consistent. Lazy-loaded routes, responsive layouts, and a component library (Storybook) exist. But: no mobile app for a platform where jobseekers need daily engagement and HRIS needs GPS clock-in. Auth is email-only — no social login. |
| **Market Readiness** | **3** | Strong Indonesian market positioning (NPWP, BPJS, KTP terminology). Verification + reputation model builds trust in emerging markets. But: no pricing, no onboarding funnel analytics, no A/B testing infrastructure, and the HRIS module is disconnected from the job platform side. |
| **Revenue Readiness** | **1** | Zero monetization infrastructure. No Stripe/payment integration, no pricing tiers, no usage metering, no plan limits. 67 features with no revenue model is the single biggest business risk. |

**Overall Health: 2.6 / 5** — Feature-rich but under-tested, un-monetized, and not yet mobile-ready.

---

## 2. Prioritized Improvement Backlog (MoSCoW)

### Must Have (Non-Negotiable for Launch)

| # | Item | Rationale | Effort |
|---|------|-----------|--------|
| M1 | **Comprehensive test coverage** — Go handler tests for all 25+ untested packages + web component tests | Zero tests across 67 features is a ticking time bomb. Auth, evaluation, and application flows are highest risk. Existing test infrastructure (26 Go test files, vitest) is in place but coverage is thin. | 2-3 weeks |
| M2 | **Fix N+1 query patterns** — Optimize `application/service.go` and other documented hot spots | `FINAL_IMPLEMENTATION_PLAN.md` identifies this as pending. Will degrade under load. PostgreSQL window function approach is already designed. | 1 week |
| M3 | **Social login** (Google, LinkedIn OAuth) | Table stakes for modern job platforms. 1-click registration dramatically reduces friction. Currently email-only with manual verification. | 1-2 weeks |
| M4 | **Design monetization system** — Pricing tiers, Stripe integration, plan limits | 67 features with no revenue model. Must define: freemium for jobseekers, paid for companies (postings, premium search, HRIS seat-based pricing). | 2-3 weeks (design + MVP) |
| M5 | **Performance monitoring** — Query logging, slow-query alerts, basic APM | No observability into production performance. Cannot diagnose issues without data. | 3-5 days |

### Should Have (Important, Defer if Needed)

| # | Item | Rationale | Effort |
|---|------|-----------|--------|
| S1 | **Mobile app** — React Native or PWA for jobseeker engagement + HRIS clock-in | Critical for daily active usage and GPS-based attendance. Can start as PWA. | 4-6 weeks |
| S2 | **HRIS ↔ Job Platform integration** — Connect the disconnected modules | HRIS has 30 features but minimal integration with the job side. Employees should auto-populate skill profiles, feedback should flow to career paths. | 2-3 weeks |
| S3 | **Onboarding analytics** — Track registration → first evaluation → first application funnel | Cannot optimize what you don't measure. No funnel data currently. | 1 week |
| S4 | **Email notification preferences** — User controls for email frequency/type | Notifications exist but no user preference controls. Risk of email fatigue. | 3-5 days |
| S5 | **Rate limiting audit** — Review and tune rate limits across all endpoints | Only auth endpoints have rate limiting (`NewRateLimiter(5, 10)`). Other endpoints are unprotected. | 2-3 days |

### Could Have (Nice to Have)

| # | Item | Rationale | Effort |
|---|------|-----------|--------|
| C1 | **A/B testing infrastructure** — Feature flags + experiment tracking | Cannot optimize conversion without experimentation. Low priority until core metrics are baseline. | 1-2 weeks |
| C2 | **Resume builder** — AI-assisted resume generation from Skill Passport data | Unique differentiator — turn the passport into a downloadable resume. | 1-2 weeks |
| C3 | **Company dashboard** — Aggregate hiring metrics, time-to-fill, source tracking | Companies need ROI visibility to justify paid plans. | 1-2 weeks |
| C4 | **Dark mode** — Full dark mode support via DaisyUI theme | Design system already uses semantic tokens (`bg-base-200`). Low effort. | 3-5 days |
| C5 | **Accessibility audit** — WCAG 2.1 AA compliance review | DESIGN.md mentions accessibility principles but no formal audit. | 3-5 days |

### Won't Have (Explicitly Deferred)

| # | Item | Rationale |
|---|------|-----------|
| W1 | **Native iOS/Android apps** | PWA covers 80% of use cases. Native apps are a separate product decision requiring dedicated team. |
| W2 | **Video interviewing** | Complex feature with low ROI for current stage. outsource to integrated tools (Zoom, Google Meet). |
| W3 | **AI-generated job descriptions** | Low priority. Companies already write their own. Could add later as a premium feature. |
| W4 | **Multi-language support (i18n)** | Indonesian market only for now. Premature to internationalize. |

---

## 3. Now / Next / Later Roadmap

### Now (Next 2 Weeks)

| What | Why | Owner |
|------|-----|-------|
| **Fix N+1 queries** in `application/service.go` | Documented in FINAL_IMPLEMENTATION_PLAN.md, already designed with window functions. Quick win with measurable impact. | Backend |
| **Add test coverage for auth + evaluation + application handlers** | These are the highest-risk untested paths. Auth has 26 test files but evaluation handler_test.go and application handler_test.go need expansion. | Backend |
| **Performance monitoring baseline** — Add query logging, response time metrics | Cannot improve what we can't measure. Add structured logging for slow queries. | Backend |
| **Social login design spec** — Google + LinkedIn OAuth flow | Must-have for launch. Needs UX spec before implementation. | Product + Design |

### Next (1-3 Months)

| What | Why | Confidence |
|------|-----|:----------:|
| **Social login implementation** (Google + LinkedIn) | Reduce registration friction by 60%+. Table stakes for job platforms. | High |
| **Monetization MVP** — Pricing page, Stripe checkout, plan limits for companies | The single biggest business risk is zero revenue. Start with: Free (1 job posting/mo), Pro ($99/mo, unlimited + premium search), Enterprise (HRIS + custom). | Medium |
| **Web test coverage to 40%+** — Target evaluation page, application kanban, HRIS core flows | Currently 3 test files. Need at least 15-20 critical path tests. | Medium |
| **HRIS ↔ Job Platform bridge** — Auto-populate skill profile from HRIS employee data, sync feedback to career paths | Unlock the value of having both modules in one platform. | Medium |
| **PWA for mobile** — Service worker, offline support, install prompt | Mobile-first experience without native app investment. Critical for HRIS attendance. | High |

### Later (3-6 Months)

| What | Why | Confidence |
|------|-----|:----------:|
| **Native mobile app** (React Native) — If PWA metrics justify it | Only if PWA proves demand. Don't build native before validating mobile usage patterns. | Low |
| **Company analytics dashboard** — Hiring funnel, time-to-fill, source ROI | Required for enterprise sales. Depends on having paying customers to validate what metrics matter. | Low |
| **A/B testing infrastructure** — Feature flags + experiment tracking | Only valuable once we have traffic and a conversion baseline to optimize against. | Low |
| **Resume builder** — AI-assisted resume generation from passport data | Nice differentiator but not core. Low priority until core platform is monetized. | Low |

---

## 4. Key Decisions Needed

### Decision 1: Monetization Model
**Question:** What is the pricing structure?
- **Option A:** Freemium for jobseekers, per-job-posting for companies ($49/posting, $199/mo unlimited)
- **Option B:** Freemium for jobseekers, seat-based for companies ($29/user/mo for HRIS, $99/mo for ATS)
- **Option C:** Usage-based (pay per application, per evaluation, per HRIS action)
- **Recommendation:** Option B — seat-based is most predictable for companies and aligns with HRIS value prop.

### Decision 2: Mobile Strategy
**Question:** PWA first, or go straight to native?
- **Option A:** PWA (service worker, offline support, installable) — covers 80% of use cases
- **Option B:** React Native app — better UX but 4-6 weeks additional effort
- **Option C:** Both — PWA now, native later if metrics justify
- **Recommendation:** Option C — PWA now, native gated on PWA adoption metrics.

### Decision 3: Social Login Providers
**Question:** Which OAuth providers to support at launch?
- **Option A:** Google only (largest reach, simplest integration)
- **Option B:** Google + LinkedIn (LinkedIn is critical for professional/job context)
- **Option C:** Google + LinkedIn + GitHub (for tech-focused candidates)
- **Recommendation:** Option B — Google + LinkedIn. LinkedIn is essential for a job platform; GitHub is niche.

### Decision 4: Test Coverage Target
**Question:** What is the minimum acceptable test coverage before shipping monetization?
- **Option A:** 30% (minimum viable)
- **Option B:** 50% (comfortable)
- **Option C:** 70% (thorough)
- **Recommendation:** Option B — 50% gives enough confidence for production without blocking shipping.

### Decision 5: HRIS Market Strategy
**Question:** Is HRIS a standalone product or a feature of the job platform?
- **Option A:** Standalone HRIS — sell separately, compete with BambooHR, Ginee
- **Option B:** Integrated feature — HRIS is a premium tier of the job platform
- **Option C:** Separate product with shared auth — two products, one account
- **Recommendation:** Option B — integrated feature. Keeps the platform unified and increases switching cost.

---

## 5. Risk Assessment

### Critical Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|:----------:|------------|
| **No test coverage → production bugs** | High — data loss, auth bypass, corrupted evaluations | High | Immediate: Add tests for auth, evaluation, application. Use TDD for all new features. Set CI gate: block merge if tests fail. |
| **Zero revenue → unsustainable** | Critical — cannot operate without revenue | High | Design monetization NOW. Start with Stripe checkout MVP. Target: first paying customer within 60 days of launch. |
| **N+1 queries → performance collapse** | High — slow response times, database overload under load | Medium | Fix documented N+1 patterns in FINAL_IMPLEMENTATION_PLAN.md. Add query monitoring. Load test before public launch. |

### High Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|:----------:|------------|
| **No mobile app → low jobseeker engagement** | High — jobseekers need daily access for applications, clock-in | Medium | PWA as immediate solution. Native app gated on PWA metrics. |
| **HRIS ↔ platform disconnection → poor value prop** | Medium — companies don't see the integrated value | Medium | Build bridge features: auto-populate skills from HRIS, sync feedback to career paths. |
| **Indonesian market concentration → geographic risk** | Medium — regulatory changes, currency fluctuation | Low | Monitor regulatory landscape. Keep architecture locale-agnostic for future expansion. |

### Medium Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|:----------:|------------|
| **LLM dependency → evaluation quality** | Medium — AI evaluation is the core differentiator | Medium | Add evaluation quality metrics. Consider fallback model. Cache successful evaluations. |
| **RBAC complexity → authorization bugs** | Medium — 40+ permissions across 9 modules | Low | Test all permission paths. Add RBAC integration tests. Document permission matrix. |
| **Swagger drift → API contract violations** | Low — pre-push hook exists but can be bypassed | Low | Enforce `bun run api:check` in CI. Never bypass pre-push hooks. |

---

## 6. Summary of 3 Most Critical Actions to Take NOW

### 1. Fix N+1 Queries (1 week)
The `application/service.go` N+1 pattern is documented, designed, and ready to implement. This is a known performance bottleneck that will degrade under load. The PostgreSQL window function approach from FINAL_IMPLEMENTATION_PLAN.md should be implemented immediately.

### 2. Add Test Coverage for Auth + Evaluation + Application (2 weeks)
These three handlers represent the highest-risk untested code paths:
- `auth.go` — authentication bypass = catastrophic
- `evaluation/handler.go` — core differentiator, must be reliable
- `application/handler.go` — job applications = core business flow

Target: 15+ new test files across these handlers, covering happy paths, edge cases, and error conditions.

### 3. Design Monetization System (1 week design, 2 weeks implement)
The single biggest business risk is zero revenue. Before writing any more features, the team must:
- Define pricing tiers (Free / Pro / Enterprise)
- Design Stripe integration architecture
- Identify plan limits (job postings, search, HRIS seats)
- Create a checkout flow spec

Without this, every other improvement is funded by nothing.

---

## Appendix: Codebase Inventory

| Category | Count | Notes |
|----------|:-----:|-------|
| Go handler packages | 25 | `internal/handlers/` + domain packages (`evaluation/`, `application/`, etc.) |
| Go test files | 26 | ~2,982 lines total |
| Web test files | 3 | ~114 lines total — critical gap |
| Frontend pages | 50+ | 21 page folders, 28 HRIS sub-pages |
| Database migrations | 22 | 000001 through 000018 (some with phase suffixes) |
| HRIS modules | 9 | org, employee, attendance, shift, leave, holiday, payroll, report, onboarding |
| API routes | 100+ | Registered in `cmd/server/main.go` (560 lines) |
| Design system docs | 304 lines | `DESIGN.md` — comprehensive typography, colors, spacing |
