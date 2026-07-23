# Obsidian Vault Context

This is an Obsidian knowledge vault located at `/storage/emulated/0/Documents/obsidian-vault/` (symlinked at `~/obsidian-vault`).

## Structure

```
obsidian-vault/
├── 00-inbox/        # Quick capture, sort weekly
├── 10-daily/        # YYYY-MM-DD.md daily notes
├── 20-projects/     # Active projects with a finish line
├── 30-areas/        # Ongoing responsibilities (no end date)
├── 40-resources/    # Evergreen reference material
├── 50-archive/      # Inactive — don't delete, just stop surfacing
├── 90-templates/    # Note templates
├── Agent Kit/       # AI agent definitions (21 agents)
├── Claude/          # Claude AI conversations & outputs
├── Business/        # Business notes & research
├── Promotion Exams/ # Career progression study notes
├── Skillpass/       # Skillpass project files
├── tech-update/     # Technology update notes
├── .obsidian/       # Obsidian app config
├── .pi/             # pi coding agent config
├── AGENTS.md        # This file — pi vault context
├── Rules.md         # AI behavior rules
├── Vault Tools.md   # Obsidian MCP tool reference
└── Workflows.md     # Capture → triage → review workflow
```

## Frontmatter convention

Every note should have:
```yaml
---
title: Human Title
created: YYYY-MM-DD
tags: [category/subcategory, type/x, status/y]
status: seedling | evergreen | archived
---
```

## Wikilinks

Internal references use `[[Note Title]]`. Aliases: `[[Note Title|display text]]`.
File operations should NOT manually rename files with wikilinks inside — use the
Obsidian vault extension tools or edit carefully.

## Key rules (from Rules.md)

- Vault is the long-term memory. Check the vault first when context may already exist.
- Save durable decisions to the vault — not chat. The chat is ephemeral; the vault persists.
- One topic per note. Split when a note crosses ~200 lines.
- Wikilinks, not paths — `[[Note Title]]` survives renames.
- Use the capture workflow: inbox → triage → review. PARA structure.
- Templates in `90-templates/`. Daily notes in `10-daily/`.

## Writing notes

1. **Capture**: New ideas go to `00-inbox/<slug>.md` with Inbox Item template frontmatter
2. **Daily**: `10-daily/YYYY-MM-DD.md` — top 3 priorities, notes, links
3. **Projects**: `20-projects/<project-name>/` with a Project.md
4. **Areas**: `30-areas/<area-name>/Area.md` for ongoing responsibilities
5. **Resources**: `40-resources/<topic>.md` for evergreen reference

## Useful paths

- Vault: `~/obsidian-vault` or `/storage/emulated/0/Documents/obsidian-vault`
- Templates: `~/obsidian-vault/90-templates/`
- Daily notes: `~/obsidian-vault/10-daily/`
- Inbox: `~/obsidian-vault/00-inbox/`
- Rules: `~/obsidian-vault/Rules.md`
- Workflows: `~/obsidian-vault/Workflows.md`
- Vault Tools: `~/obsidian-vault/Vault Tools.md`
