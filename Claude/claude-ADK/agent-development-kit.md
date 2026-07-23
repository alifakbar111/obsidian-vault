# The Agent Development Kit

**CLAUDE.md + Skills + Hooks + Subagents + Plugins — five layers, one stack.**

The Agent Development Kit (ADK) is a way to structure a serious Claude Code agent as a **layered system** instead of a pile of prompts. Each layer does one job, and the layers stack in a deliberate order: memory sets the rules, knowledge provides expertise, guardrails enforce quality, delegation splits up the work, and distribution ships it to the whole team. Two supporting systems sit alongside the stack — **MCP Servers** connect the agent to external tools, and **Agent Teams** let multiple agents run in parallel.

```
agent-dev-kit/
├── CLAUDE.md/    → L1 · Memory Layer      (sets the rules)
├── skills/       → L2 · Knowledge Layer   (provides expertise)
├── hooks/        → L3 · Guardrail Layer   (enforces quality)
├── subagents/    → L4 · Delegation Layer  (delegates work)
└── plugins/      → L5 · Distribution Layer (distributes to team)
```

> Source: "The Agent Development Kit" infographic set (6 images). One overview slide plus one deep-dive per layer.

---

## The stack at a glance

| Layer | Name | What it is | Where it lives | Core job |
|-------|------|-----------|----------------|----------|
| **L1** | CLAUDE.md | The Memory Layer | `~/.claude/` (global) + `.claude/` (project) | Always-loaded rules — the agent's constitution |
| **L2** | Skills | The Knowledge Layer | `~/.claude/skills/` + `.claude/skills/` | On-demand, description-matched expertise |
| **L3** | Hooks | The Guardrail Layer | `hooks/` | Deterministic shell scripts that fire on events |
| **L4** | Subagents | The Delegation Layer | `subagents/` | Isolated workers with their own context window |
| **L5** | Plugins | The Distribution Layer | `plugins/` | Bundle everything and ship it to the team |

**The flow:** `CLAUDE.md` sets rules → `Skills` provide expertise → `Hooks` enforce quality → `Subagents` delegate work → `Plugins` distribute to team.

**Flanking the stack:**
- **MCP Server** — connects the agent to external tools: GitHub, databases, APIs, and custom integrations. It's how the agent reaches systems outside its own files.
- **Agent Teams** — parallel execution, message passing, a lead agent, and shared permissions. It's how multiple agents coordinate on one goal.

---

## Layer 1 — CLAUDE.md · The Memory Layer

### What it is
**Always loaded. Always active. This is the agent's constitution.** Unlike everything else in the stack, CLAUDE.md is never conditional — it's injected into every session automatically. Whatever you write here is the baseline reality the agent operates under, so it's the highest-leverage place to encode the rules you never want it to forget.

### Where it lives
- **Global — `~/.claude/CLAUDE.md`** — loaded for *every* project. Put things that are true regardless of repo:
  - Your default voice + style
  - Tools you always have
  - Personal preferences
- **Project — `.claude/CLAUDE.md`** — loaded for *this repo only*. Put things specific to the codebase:
  - Architecture rules
  - Naming + repo conventions
  - Things future-you will forget

### What to put in it
- **`architecture.rules`** — *How the system fits together.* The big-picture structure so the agent doesn't fight your design. Keeps it from inventing patterns that clash with the existing ones.
- **`naming.conventions`** — *File names, function names, casing.* Removes a whole class of nitpicks by stating the rules up front. The agent writes code that reads like the rest of the repo.
- **`test.expectations`** — *When to write tests, what counts.* Tells the agent your testing bar so it doesn't under- or over-test. Encodes what "done" means.
- **`repo.map`** — *Where things live, why.* A guide to the layout so the agent finds the right file instead of guessing. Cuts down on misplaced code.

### The payoff
> **Write CLAUDE.md once. Save yourself 100 prompts later.**

Both the global and project files feed into Claude at the start of a session, so the agent begins every task already knowing your rules — no re-explaining.

---

## Layer 2 — Skills · The Knowledge Layer

### What it is
**On-demand. Modular. Description-matched, auto-invoked context.** A skill is a packaged capability that loads *only when it's relevant*. Claude matches your request against each skill's description and pulls in the right one automatically — so you get deep expertise without bloating every conversation with knowledge you don't currently need.

### Where it lives
- **Global — `~/.claude/skills/`** — reusable across every project:
  - Skills you reuse across projects
  - PDF, video, Excalidraw, etc.
  - Loaded only when needed
- **Project — `.claude/skills/`** — domain knowledge for this repo:
  - Domain knowledge for this repo
  - Internal API patterns
  - Project-specific workflows

### What to put in it
- **`SKILL.md`** — *Description Claude matches against.* The entry point; its description is what triggers the skill. Get this right and the skill fires at the correct moment.
- **`scripts/`** — *Reference scripts the skill calls.* Real, runnable code the skill can execute rather than re-derive. Keeps behavior consistent and deterministic.
- **`templates/`** — *Boilerplate the skill copies in.* Starting-point files so output follows a known shape. Saves the agent from reconstructing structure each time.
- **`assets/`** — *Images, fonts, configs the skill ships.* Supporting files bundled with the skill so it's self-contained. Everything it needs travels with it.

### The payoff
> **One skill. Wired forever. Future Claude knows.**

Worked example: you say *"convert this PDF."* Claude scans available skills — `video-skill` (trim, crop, encode video), `pdf-skill` (read and convert PDF files), `excalidraw-skill` (generate diagram JSON) — matches **pdf-skill**, and activates it. You never named the skill; the description match did the routing.

---

## Layer 3 — Hooks · The Guardrail Layer

### What it is
**Deterministic. Not AI. Shell scripts that fire on agent events.** Hooks are the layer you can *trust absolutely*, because they don't reason — they just run. When a defined event happens, a shell script executes exactly as written. This is where you enforce hard rules that must never be subject to a model's judgment.

### How it triggers
- **Matcher** — e.g. `Bash(rm *)`. Pattern matchers decide which tool calls a hook applies to:
  - Wildcard matchers on tool name
  - Regex matchers on command
  - Exact-string matchers
- **Command** — e.g. `if [ ... ]; then exit 2; fi`. Plain shell where you write the rule:
  - Block dangerous tools (`exit 2`)
  - Inject context (echo to stdout)
  - Audit log (append to file)

### What hooks exist
- **`PreToolUse.sh`** — *Inspect or block before any tool runs.* Your veto point — validate arguments and refuse dangerous calls (like `rm -rf`) before they execute. Nothing runs until this passes.
- **`PostToolUse.sh`** — *Lint, log, or notify after tool runs.* Fires after a tool finishes — auto-lint on write, append to an audit log, or ping Slack. Turns actions into follow-through.
- **`SessionStart.sh`** — *Load context when a session begins.* Runs at startup to inject fresh state — current branch, open tickets, environment. The agent starts oriented.
- **`Stop.sh`** — *Run when Claude finishes a turn.* Fires at the end of a turn for cleanup, summaries, or notifications. Good for "turn complete" signals.
- **`SubagentStop.sh`** — *Run when a subagent returns.* Fires when a delegated subagent finishes, so the parent can react to the result deterministically.

### The payoff
> **Hooks turn vibes into rules. Git hooks, but for your agent.**

The lifecycle is simple and predictable: **1. Event fires → 2. Matcher checks → 3. Command runs.**

---

## Layer 4 — Subagents · The Delegation Layer

### What it is
**Own context window. Delegate work without polluting your main session.** A subagent is a fresh Claude instance spawned to do one job, with its own context and tools. It does the messy, token-heavy work — reading files, running suites, exploring — and hands back only the result, so your main conversation stays focused and clean.

### How it works
- **Parent — `main session`** — where you talk to Claude:
  - Plans the work
  - Calls subagents like tools
  - Stays clean, only sees results
- **Child — `subagent run`** — spawned to do one job:
  - Own system prompt + tools
  - Own context window
  - Returns ONE message back

### What subagents exist
- **`code-reviewer.md`** — *Reviews diffs against repo conventions.* A dedicated reviewer that checks changes for style and correctness. Returns findings, not the whole diff.
- **`test-runner.md`** — *Runs the suite and reports failures.* Executes tests in isolation and reports back only what broke. Keeps verbose test output out of the main thread.
- **`explorer.md`** — *Maps the codebase, returns findings.* Reads widely to answer "where does X live?" and returns a summary. Absorbs the exploration cost so the parent doesn't.
- **`feature-dev.md`** — *Designs and implements end-to-end.* A heavier subagent that takes a feature from design through implementation. Delegates a whole slice of work.

### The payoff
> **Delegate the noise. Keep the main thread clean.**

The pattern is one-directional: the main session sends **delegate only** to `code-reviewer`, `test-runner`, `explorer`; they send **results only** back. The parent never inherits the child's context — just its conclusion.

---

## Layer 5 — Plugins · The Distribution Layer

### What it is
**Bundle. Ship. Install. npm packages for agent capabilities.** A plugin packages everything from the layers below — skills, subagents, hooks, commands — into one versioned, installable unit. It's how a setup that works for you becomes a setup the whole team runs, with one install instead of manual copying.

### What's in a plugin
- **Manifest — `plugin.json`**:
  ```json
  {
    "name": "my-plugin",
    "version": "1.0.0",
    "skills": ["build", "ship"]
  }
  ```
  - Declares what's inside
  - Lists skills, agents, hooks, commands
  - Versioned and signed
- **Store — `marketplace.url`** — e.g. `my-plugin  v1.0.0 · team-ready  [Install]`:
  - Discoverable by the team
  - One-click install per repo
  - Updates push to everyone

### What you can ship
- **`skills/`** — *Knowledge bundles ride along.* The skills from Layer 2 travel inside the plugin so teammates get the same expertise.
- **`agents/`** — *Subagents ship inside the plugin.* The Layer 4 subagents come bundled, so everyone has the same delegation workers.
- **`hooks/`** — *Guardrails travel with the bundle.* The Layer 3 hooks ship too, so quality rules are enforced identically across the team.
- **`commands/`** — *Slash-commands the team gets.* Custom slash-commands are distributed so everyone shares the same shortcuts.

### The payoff
> **Build it once. Install it everywhere. The team levels up together.**

The lifecycle: **bundle** (gather `skills/`, `agent.md`, `hook.sh`, `cmd.md`) → **publish** (as a `.plugin`) → **team install** (every teammate gets it). One install, every teammate aligned.

---

## How the layers reinforce each other

Read bottom to top, the stack tells a story: you set the rules once (**CLAUDE.md**), give the agent reusable expertise (**Skills**), lock in the things that must never go wrong (**Hooks**), offload heavy or noisy work to isolated workers (**Subagents**), and then wrap the whole configuration into a shippable package (**Plugins**) so your team runs the exact same agent you do. MCP Servers extend the agent outward to external tools, and Agent Teams let several of these agents work in parallel.

---

*Note: layer names, file names, and the short captions in italics/quotes are transcribed from the source infographics. The longer explanations under each are practical elaborations of how these Claude Code mechanisms work — helpful context, not official documentation. Check the current Claude Code docs for exact hook event names, skill/plugin formats, and behavior before relying on specifics.*
