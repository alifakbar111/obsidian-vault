---
title: SkillPass — Project Knowledge Base
created: 2026-07-20
tags: [project/skillpass, type/index]
status: seedling
---

# SkillPass

> Talent marketplace where jobseekers build structured career profiles, get AI-powered skill evaluations, and share their "skill passport" publicly. Verified companies discover candidates and post jobs.

This note is the entry point to the SkillPass knowledge base — a complete mirror of the project documentation, plans, specs, reviews, and research.

**Visual:** [[SkillPass-Architecture.excalidraw|System architecture diagram (Excalidraw)]]

---

## Quick Reference

| | |
|---|---|
| **Status** | Active development (Phases 1-3 + HRIS module) |
| **Total features** | 67 (per [[docs/FEATURES]]) |
| **Repository** | `learning/skillpass` |
| **Stack** | Go 1.26 (Gin) · React 19 (Vite) · PostgreSQL (Bun ORM) · Tailwind v4 + DaisyUI 5 |
| **Lint/Format** | Biome (single binary) |
| **Git hooks** | Lefthook (pre-commit format, pre-push tests + api-drift check) |
| **Last sync to vault** | 2026-07-20 |

---

## Project Meta

- [[Project-README]] — project README (setup, prereqs, scripts)
- [[AGENTS]] — agent guide (stack, conventions, commands)
- [[CLAUDE]] — Claude-specific instructions
- [[DESIGN]] — design system (Tailwind v4 + DaisyUI tokens)
- `design-tokens.json` — design tokens JSON
- `package.json` — root package.json
- `docker-compose.yml` — Docker Compose for full stack
- `lefthook.yml` — git hooks config
- `opencode.json` — opencode config
- `biome.json` — Biome lint/format config

---

## Documentation (`docs/`)

Top-level reference docs:

- [[docs/FEATURES]] — complete feature inventory (67 features across all phases)
- [[docs/FINAL_IMPLEMENTATION_PLAN]] — final implementation plan
- [[docs/MIGRATION_PLAN]] — framework migration plan
- [[docs/ENV_VARIABLES]] — all env vars
- [[docs/Agent_Development_Kit_5_Layer]] — ADK 5-layer reference
- [[docs/comprehensive-audit-2026-06-30]] — full project audit (2026-06-30)
- [[docs/saas-tech-stack-reference]] — SaaS tech stack reference

### Plans (`docs/plans/`)

Implementation plans, organized by date:

- [[docs/plans/2026-05-22-skillpass-phase1-plan]] — Phase 1 implementation
- [[docs/plans/2026-05-22-phase3-implementation]] — Phase 3 implementation
- [[docs/plans/2026-05-23-design-system-audit]] — design system audit
- [[docs/plans/2026-06-04-go-jet-migration]] — Go-Jet migration plan
- [[docs/plans/2026-06-04-migrate-elysia-to-gin]] — Elysia→Gin migration
- [[docs/plans/2026-06-04-unit-testing-plan]] — unit testing strategy
- [[docs/plans/2026-06-06-adk-5-layer-opencode]] — ADK 5-layer for opencode
- [[docs/plans/2026-06-07-skillpass-phase2-evaluation-matching]] — Phase 2 (eval + matching)
- [[docs/plans/2026-06-08-agent-manager]] — agent manager
- [[docs/plans/2026-06-08-server-testing]] — server-side testing
- [[docs/plans/2026-06-11-shared-api-schema]] — shared API schema (Go↔TS)
- [[docs/plans/2026-06-12-dual-mode-static-serving]] — dual-mode static serving
- [[docs/plans/2026-06-15-mimo-orchestrator-config]] — MiMo orchestrator config
- [[docs/plans/2026-06-15-phase3-bugfixes]] — Phase 3 bugfixes
- [[docs/plans/2026-06-16-ofetch-zod-migration]] — ofetch→Zod migration
- [[docs/plans/2026-06-17-pr4-hris-fixes]] — PR4 HRIS fixes
- [[docs/plans/2026-06-20-omitempty-enforcement]] — omitempty enforcement
- [[docs/plans/2026-06-24-product-improvement-plan]] — product improvement
- [[docs/plans/2026-06-25-test-coverage-implementation]] — test coverage implementation
- [[docs/plans/2026-07-01-profile-feature-adjustments]] — profile feature adjustments
- [[docs/plans/2026-07-04-hris-phase2-trust-biometrics]] — HRIS Phase 2 (trust + biometrics)
- [[docs/plans/2026-07-08-ai-evaluation-scoring-implementation]] — AI eval scoring
- [[docs/plans/2026-07-09-sse-notifications]] — SSE notifications
- [[docs/plans/2026-07-13-go-jet-to-bun-migration]] — Go-Jet→Bun migration
- [[docs/plans/2026-07-13-rename-skillpass-to-jobwisee]] — rename to Jobwisee
- [[docs/plans/2026-07-14-dev-server-deployment]] — dev server deployment
- [[docs/plans/2026-07-20-security-hardening-roadmap]] — security hardening roadmap

### Specs (`docs/specs/`)

Design specs and feature designs:

- [[docs/specs/2026-05-22-skillpass-phase1-design]] — Phase 1 design
- [[docs/specs/2026-05-22-skillpass-phase2-design]] — Phase 2 design
- [[docs/specs/2026-05-22-skillpass-phase3-design]] — Phase 3 design
- [[docs/specs/2026-05-30-company-verification-on-register]] — company verification on register
- [[docs/specs/2026-06-08-agent-manager-design]] — agent manager design
- [[docs/specs/2026-07-01-profile-feature-adjustments-design]] — profile feature adjustments design
- [[docs/specs/2026-07-07-ai-evaluation-scoring-design]] — AI eval scoring design
- [[docs/specs/test-resume-senior-leader-results]] — resume parse test (senior leader)
- [[docs/specs/test-resume-indonesian-professional-results]] — resume parse test (Indonesian professional)

### Research (`docs/research/`)

- [[docs/research/product-overview]] — product overview
- [[docs/research/competitive-analysis-ai-evaluation-scoring]] — competitive analysis: AI eval scoring

### Security Reviews (`docs/security_issue/`)

- [[docs/security_issue/SECURITY_REVIEW]] — initial review
- [[docs/security_issue/SECURITY_REVIEW_2026-06-09]]
- [[docs/security_issue/SECURITY_REVIEW_2026-07-13]]
- [[docs/security_issue/SECURITY_REVIEW_2026-07-20]]

### Bug Findings (`docs/bug_finding/`)

- [[docs/bug_finding/BUG_FIX_PLAN]] — bug fix plan
- [[docs/bug_finding/2026-05-22-phase3-bugs]] — Phase 3 bugs
- [[docs/bug_finding/BUG_REVIEW_2026-06-02]]
- [[docs/bug_finding/BUG_REVIEW_2026-07-13]]
- [[docs/bug_finding/BUG_REVIEW_2026-07-20]]

### Code Reviews (`docs/code_review/`)

- [[docs/code_review/CODE_REVIEW_2026-06-04]]
- [[docs/code_review/CODE_REVIEW_2026-06-05]]
- [[docs/code_review/CODE_REVIEW_2026-06-09]]
- [[docs/code_review/CODE_REVIEW_2026-07-13]]
- [[docs/code_review/CODE_REVIEW_2026-07-20]]

---

## Project Layout (source mirror)

| Path | Purpose |
|---|---|
| `server-go/` | Go (Gin) API — entrypoint `cmd/server/main.go` |
| `web/` | React 19 SPA — entrypoint `src/main.tsx` |
| `.agents/` | Agent definitions, rules, skills |
| `docs/` | specs, plans, research, security, bug findings, code reviews |
| `deploy/` | deployment configs |
| `markitdown-service/` | PDF→Markdown service |

---

## Notes

- **Source of truth lives in the repo** — this vault is a read-only mirror. Edit files in the repo, then re-sync to the vault when you want to refresh.
- The root `README.md` was renamed to `Project-README.md` here to avoid clashing with the vault's index convention.
- `.md` files in `docs/` retain their original filenames; non-markdown config files (`.json`, `.yml`) are kept as data attachments.
