# Agent Kit — Index

21 agents for day-to-day software engineering work. Naming follows the `-agent` suffix convention; scaffolding is split by stack (Go / React / Node / DB).

**Location:** `/home/al-ip/learning/.agents/agents/`
**Skills source:** `/home/al-ip/.agents/skills/` (referenced by name; install or symlink before use)

## Quick routing

| If you want to… | Use |
|---|---|
| Start a new Go service / CLI | `go-scaffolder-agent` |
| Start a new React / Next.js app | `react-scaffolder-agent` |
| Start a new Node / Bun API | `node-scaffolder-agent` |
| Design or migrate a schema | `db-migration-agent` |
| Add an endpoint / business logic | `backend-agent` |
| Add a page / component / hook | `frontend-agent` |
| Fix a bug | `bug-hunter-agent` |
| Refactor without changing behavior | `refactor-agent` |
| Review code quality | `code-reviewer-agent` |
| Audit security | `security-auditor-agent` |
| Write / run tests | `tester-agent` |
| Polish UI / a11y | `ui-ux-agent` |
| Document something | `technical-writer-agent` |
| Plan a non-trivial change | `planner-agent` |
| Design a system / service | `system-design-agent` |
| Decide what to build next | `product-owner-agent` |
| Synthesize user research | `product-researcher-agent` |
| Spike / prototype fast | `prototype-agent` |
| Set up repo-level agent guardrails | `harness-engineering-agent` |
| Package this kit for backup or sharing | `session-exporter-agent` |
| Default — routes to the right specialist | `orchestrator-agent` |

## Tiers

### Core specialist (7)
- `bug-hunter-agent` — root-cause and fix
- `code-reviewer-agent` — quality and pattern check
- `security-auditor-agent` — OWASP / auth / data exposure
- `tester-agent` — unit / integration / component / E2E
- `ui-ux-agent` — Tailwind polish, a11y, design tokens
- `technical-writer-agent` — README, AGENTS.md, ADRs, specs
- `planner-agent` — TDD-flavored implementation plans

### Scaffolding by stack (4)
- `go-scaffolder-agent` — Go service / CLI / library
- `react-scaffolder-agent` — React 19 SPA or Next.js
- `node-scaffolder-agent` — Hono / Express / Fastify / Nest on Bun or Node
- `db-migration-agent` — schema design, migrations, seeds

### Layer (2)
- `backend-agent` — feature work in an existing backend
- `frontend-agent` — feature work in an existing frontend

### Meta / design / product (8)
- `orchestrator-agent` — single entry point; routes to specialists
- `product-owner-agent` — user value, stories, prioritization
- `product-researcher-agent` — interview / survey / ticket synthesis
- `system-design-agent` — architecture, service boundaries, NFRs
- `refactor-agent` — structural improvement without behavior change
- `prototype-agent` — timeboxed throwaway spikes
- `harness-engineering-agent` — repo-level agent guardrails
- `session-exporter-agent` — package this kit for backup

## How to use

In a project, add this to the root `opencode.json`:

```json
{
  "instructions": ["AGENTS.md", ".opencode/rules/*.md"],
  "agent": {
    "orchestrator-agent": { "description": "...", "mode": "all" }
    // ... register the agents you want available
  }
}
```

See `README.md` for full install + per-project wiring.

## Conventions

- **Naming:** `-agent` suffix everywhere. Drop the suffix only if the project has a different convention.
- **Mode:** `all` so each agent can be called directly or as a subagent.
- **Skills:** referenced by name (e.g. `systematic-debugging`). Make sure they exist in `~/.agents/skills/` or the project's `.opencode/skills/`.

## Source

Synthesized from:
- `BMS-Dashboard/.opencode/agents/` — naming convention, role boundaries
- `skillpass/.opencode/agents/` — scaffolding split by stack, product roles
- `~/.agents/skills/` — all synthesized skills
