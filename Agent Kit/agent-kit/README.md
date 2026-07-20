# Agent Kit

A personal agent kit for day-to-day software engineering work. 21 agents, BMS-style naming (`-agent` suffix), scaffolding split by stack.

## What's in here

```
.agents/
├── AGENTS.md         # index + routing table
├── README.md         # this file
└── agents/           # 21 agent definitions (Markdown + frontmatter)
```

## Install in a project

To make these agents available in a specific project, add a `mode: all` entry for each agent (or just the ones you want) in the project's `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "instructions": ["AGENTS.md", ".opencode/rules/*.md"],
  "agent": {
    "orchestrator-agent": {
      "description": "Routes work to the right specialist agent.",
      "mode": "all"
    },
    "bug-hunter-agent": {
      "description": "Root-cause and fix bugs systematically.",
      "mode": "all"
    }
    // ... add the rest as needed
  }
}
```

You don't have to register all 21 — pick what your project needs.

## Make the kit available everywhere

To use these agents across every project without registering per-project, copy or symlink the kit into `~/.opencode/agents/`:

```bash
# Symlink (recommended — edits here propagate)
mkdir -p ~/.opencode
ln -s /home/al-ip/learning/.agents/agents ~/.opencode/agents

# Or copy
cp -r /home/al-ip/learning/.agents/agents ~/.opencode/agents
```

Then any project's `opencode.json` that lists the agent names (or uses default discovery) can dispatch them.

## Skills dependency

Every agent references skills by name (e.g. `systematic-debugging`, `frontend-design`). These live in `/home/al-ip/.agents/skills/`.

If you move this kit to a different machine, either:
- copy `/home/al-ip/.agents/skills/` to the same path on the new machine, or
- symlink the new machine's skills folder to this one, or
- update the skill references in each agent to point to wherever the skills live

## Naming convention

All agents use the `-agent` suffix:
- ✅ `bug-hunter-agent`
- ❌ `bug-hunter`

This keeps the role visible in autocomplete, file listings, and Task-tool dispatch prompts.

## Scaffolding split

Scaffolding is intentionally split by stack so each agent owns one ecosystem:
- `go-scaffolder-agent` — Go (Gin, Echo, Chi, Fiber, Cobra)
- `react-scaffolder-agent` — React 19 (Vite SPA, Next.js App Router)
- `node-scaffolder-agent` — TypeScript on Bun or Node (Hono, Express, Fastify, Nest)
- `db-migration-agent` — schema design, migrations, seeds (any stack)

## Adapting an agent

Each agent file is plain Markdown + frontmatter. To tune one for a specific project:
1. Read the agent file
2. Adjust the synthesized skills, responsibilities, or rules
3. Save — no rebuild, no registration ceremony

Keep the agent files under 200 lines; link to project docs for project-specific rules.
