---
title: Agent Kit
created: 2026-07-21
tags: [area/work, type/reference, claude/agent-kit]
status: evergreen
---

# Agent Kit

Personal agent kit for day-to-day software engineering work. **21 agents** + an index of all global skills.

## Contents

- **Index:** [[Agent Kit/agent-kit/AGENTS|AGENTS.md]] — routing table + tier breakdown
- **Install:** [[Agent Kit/agent-kit/README|README.md]] — wiring into a project
- **Agent definitions:** [[Agent Kit/agent-kit/agents|agents/]] — 21 `.md` files

## Tiers

| Tier | Count | Folder |
|---|---|---|
| Core specialist | 7 | `bug-hunter-agent`, `code-reviewer-agent`, `security-auditor-agent`, `tester-agent`, `ui-ux-agent`, `technical-writer-agent`, `planner-agent` |
| Scaffolding (by stack) | 4 | `go-scaffolder-agent`, `react-scaffolder-agent`, `node-scaffolder-agent`, `db-migration-agent` |
| Layer | 2 | `backend-agent`, `frontend-agent` |
| Meta / design / product | 8 | `orchestrator-agent`, `product-owner-agent`, `product-researcher-agent`, `system-design-agent`, `refactor-agent`, `prototype-agent`, `harness-engineering-agent`, `session-exporter-agent` |

## Default entry point

Always start with [[Agent Kit/agent-kit/agents/orchestrator-agent|orchestrator-agent]] — it routes to the right specialist.

## Source

- Source of truth: `/home/al-ip/learning/.agents/`
- Skills: `/home/al-ip/.agents/skills/` → mirrored to [[Claude/skills|/Agent Kit/skills/]]

## Maintenance

When an agent or skill changes upstream, re-mirror with:

```bash
rsync -a --delete /home/al-ip/learning/.agents/ /home/al-ip/obsidian-vault/Agent Kit/agent-kit/
rsync -a --delete --exclude='recommend/docs/' /home/al-ip/.agents/skills/ /home/al-ip/obsidian-vault/Agent Kit/skills/
```

> `recommend/docs/` is excluded — it's a vendored VitePress site (12M, 2400+ files), not skill content.

## Related

- [[Rules]] — how the AI operates when working in this vault (thinking, communication, code style, commits, etc.)
