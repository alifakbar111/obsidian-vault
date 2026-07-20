---
title: Workflows
created: 2026-07-21
tags: [area/work, type/reference, claude/workflows]
status: evergreen
---

# Workflows

How knowledge flows in and out of this vault. PARA structure, capture → triage → review loop.

## Folder map

```
00-inbox/        quick capture, sort weekly
10-daily/        YYYY-MM-DD.md daily notes
20-projects/     active projects with a finish line
30-areas/        ongoing responsibilities (no end date)
40-resources/    evergreen reference material
50-archive/      inactive — don't delete, just stop surfacing
90-templates/    note templates (Obsidian Templates plugin)
```

> Existing top-level folders (`Agent Kit/`, `Claude/`, `Skillpass/`) are preserved. Reorganize them into PARA only if you want — not required.

## Capture → triage → review

```
Idea hits  → 00-inbox/<one-idea>.md   (status: seedling)
              ↓
         Weekly review (~30 min, Friday)
              ↓
              ├─ active project?      → 20-projects/<project>/...
              ├─ ongoing area?        → 30-areas/<area>/...
              ├─ evergreen reference? → 40-resources/<topic>.md
              ├─ stale / no action?   → 50-archive/ or delete
              └─ still a vague seed?  → leave in 00-inbox, set reminder
```

**Rule:** one idea per inbox note. Atomic capture prevents the "one giant inbox file" anti-pattern.

## Templates

Located in `90-templates/`. Configure Obsidian's **Templates plugin** to use that folder.

| Template | Use for | Frontmatter |
|---|---|---|
| `Daily.md` | Daily note (top 3 priorities, inbox, notes, links) | `type/daily` |
| `Inbox Item.md` | One thought / link / idea — atomic capture | `type/inbox`, `status/seedling` |
| `ADR.md` | Architecture / product decision record | `type/adr`, `status/accepted` |
| `Research Note.md` | Synthesis of interviews, surveys, tickets | `type/research` |

**To create from a template:** in Obsidian, click the new-note icon → pick template (or use the `Insert template` command).

## Frontmatter contract

Every note gets at minimum:

```yaml
---
title: Human Title
created: YYYY-MM-DD
tags: [category/subcategory, type/x, status/y]
status: seedling | evergreen | archived
---
```

| Field | Convention |
|---|---|
| `title` | Human title, sentence case, no emoji |
| `created` | `YYYY-MM-DD` (set once, never change) |
| `tags` | Hierarchical: `area/<area>`, `type/<type>`, `status/<status>`, `project/<project>` |
| `status` | `seedling` (new) → `evergreen` (mature) → `archived` (in `50-archive/`) |

## Wikilinks

- Internal references: `[[Note Title]]` — survives renames (the MCP server rewrites them on `move-note`)
- Aliases: `[[Note Title|display text]]` for cleaner inline reads
- Block refs: `^block-id` for fine-grained linking in long notes

## Daily note workflow

1. **Open today's daily** (`periodic` tool, `action: create`) — idempotent, won't clobber existing
2. **Fill top 3 priorities** before starting work
3. **Dump into inbox section** during the day
4. **Capture created/updated notes** in the "Created today" section (helps daily review)
5. **End of day:** review inbox section, file atomic notes into `00-inbox/` or directly into a project folder if obvious
6. **Friday review:** triage `00-inbox/` → move to `20-projects/`, `30-areas/`, `40-resources/`, or `50-archive/`

## When to write what

| Trigger | Capture as |
|---|---|
| Made a non-obvious decision | `ADR.md` → `20-projects/<project>/decisions/ADR-NNNN-...md` |
| Interview / survey / ticket synthesis | `Research Note.md` → `40-research/YYYY-MM-DD-topic.md` |
| Vague idea, link, "hmm" | `Inbox Item.md` → `00-inbox/<slug>.md` |
| Starting a new project | `Project` note in `20-projects/<project>/Project.md` |
| Starting a new ongoing responsibility | `Area` note in `30-areas/<area>/Area.md` |
| Reference material that won't change | `Resource` note in `40-resources/<topic>.md` |

## Related

- [[Rules]] — how the AI behaves when working in this vault
- [[Agent Kit/Agent Kit|Agent Kit]] — the agent kit these workflows support
