# MiMo Agent Configuration Plan

## Goal

Create a MiMo-specific configuration that allows MiMo Code to act as an orchestrator, dispatching to the 10 agents defined in `.agents/agents/` using the `actor` tool with subagent mapping.

## Architecture

```
User prompt → MiMo (orchestrator) → reads .agents/agents/*.md
                                      ↓
                                  classifies request
                                      ↓
                                  maps agent → subagent_type (explore/general)
                                      ↓
                                  injects agent instructions into prompt
                                      ↓
                                  dispatches via actor tool
                                      ↓
                                  aggregates results
```

## Subagent Type Mapping

| Agent | Subagent Type | Reason |
|-------|---------------|--------|
| agent-manager | N/A (skip) | Self-referential |
| bug-hunter | `explore` | Read-only investigation |
| code-reviewer | `explore` | Read-only review |
| db-migration | `general` | Writes migration files |
| go-scaffolder | `general` | Writes Go code |
| planner | `general` | Writes plan files |
| react-scaffolder | `general` | Writes React code |
| security-auditor | `explore` | Read-only audit |
| test-runner | `general` | Runs commands, writes reports |
| ui-ux-designer | `general` | Writes design files |

## Implementation

### Step 1: Create MiMo Orchestrator Skill

**File:** `.agents/skills/mimo-orchestrator/SKILL.md`

This skill defines how MiMo should orchestrate agents:

```yaml
---
name: mimo-orchestrator
description: "Use when orchestrating multiple agents, dispatching tasks to specialist agents, or when the user asks to 'run agent-manager', 'orchestrate', or 'delegate to agents'."
---
```

**Core logic:**
1. Glob `.agents/agents/*.md` to build agent registry
2. Classify user request (action, domain, scope, urgency)
3. Match against workflow blueprints (sequential/parallel)
4. Map matched agent to subagent_type (explore/general)
5. Read agent's SKILL.md or agent definition for instructions
6. Dispatch via `actor` tool with injected instructions
7. Aggregate results

### Step 2: Create Agent Dispatch Prompt Templates

**File:** `.agents/skills/mimo-orchestrator/dispatch-templates.md`

Templates for injecting agent instructions into subagent prompts:

```
## Agent: {agent_name}
## Role: {agent_description}

### Instructions
{agent_body_content}

### Project Context
{rules_and_conventions}

### Task
{user_request}
```

### Step 3: Update AGENTS.md

Add MiMo orchestrator reference to `AGENTS.md`:

```markdown
## MiMo Orchestrator

MiMo Code can orchestrate agents from `.agents/agents/` using the `mimo-orchestrator` skill.
Load the skill with: `skill(name="mimo-orchestrator")`
```

### Step 4: Create Configuration File (Optional)

**File:** `.mimocode/config.json`

```json
{
  "agents": {
    "directory": ".agents/agents",
    "exclude": ["agent-manager"],
    "mapping": {
      "bug-hunter": "explore",
      "code-reviewer": "explore",
      "security-auditor": "explore",
      "db-migration": "general",
      "go-scaffolder": "general",
      "planner": "general",
      "react-scaffolder": "general",
      "test-runner": "general",
      "ui-ux-designer": "general"
    }
  },
  "skills": {
    "directory": ".agents/skills"
  },
  "rules": {
    "directory": ".agents/rules"
  }
}
```

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `.agents/skills/mimo-orchestrator/SKILL.md` | Create | Orchestrator skill definition |
| `.agents/skills/mimo-orchestrator/dispatch-templates.md` | Create | Prompt injection templates |
| `.mimocode/config.json` | Create | MiMo-specific configuration |
| `AGENTS.md` | Modify | Add MiMo orchestrator reference |

## Verification

1. Load the skill: `skill(name="mimo-orchestrator")`
2. Test dispatch: "Run bug-hunter on the auth module"
3. Verify subagent receives correct instructions
4. Verify results are aggregated properly

## Next Steps

After implementation:
1. Test with simple single-agent dispatch
2. Test with sequential workflow (planner → go-scaffolder → test-runner)
3. Test with parallel workflow (bug-hunter + test-runner)
4. Refine prompt injection based on results
