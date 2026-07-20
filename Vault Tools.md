---
title: Vault Tools
created: 2026-07-21
tags: [area/work, type/reference, claude/vault]
status: evergreen
---

# Vault Tools

Quick reference for the 15 obsidian MCP tools + how to invoke them.

## Invocation paths

| Path | How |
|---|---|
| **Ask the AI** | Plain English → I pick the right tool. *Default path.* |
| **opencode TUI** | Type `/` to list tools; obsidian ones are prefixed `obsidian_`. |
| **Filesystem** | The vault is just a folder at `/home/al-ip/obsidian-vault/`. Use `Read` / `Write` / `Edit` / shell. *No wikilink rewrite, no frontmatter safety — use the obsidian tools when those matter.* |
| **Standalone CLI** | None. `obsidian-mcp-rs` is an MCP server, not a CLI. |

## Tool surface (15)

### Read (4)

| Tool | Use for |
|---|---|
| `list-available-vaults` | Which vaults are registered |
| `vault-info` | Vault stats / tags / recent (query: `tags` / `recent` / `stats`) |
| `search-vault` | BM25 content search; `tag:foo` for tag; `regex: true` for pattern; `frontmatter: {...}` for metadata filter |
| `read-note` | Get a note's text. `view: "outline"` for headings + block refs (cheaper than full text) |

### Write (4)

| Tool | Use for |
|---|---|
| `create-note` | New note with content + frontmatter; `folder` created automatically |
| `edit-note` | `append` / `prepend` / `replace` / `find_and_replace`; can target one heading or one `^block` |
| `create-directory` | Make a folder (used sparingly — see `Workflows.md`) |
| `delete-note` | Moves to `.trash/` (recoverable). `permanent: true` to erase |

### Meta (4)

| Tool | Use for |
|---|---|
| `frontmatter` | `get` / `set` / `remove` YAML keys. `set` does line surgery, preserves order |
| `add-tags` | Add tags to frontmatter and/or inline. `normalize: true` lowercases and hyphenates |
| `remove-tags` | Remove tags by name |
| `rename-tag` | Rename a tag vault-wide (atomic) |

### Links (1)

| Tool | Use for |
|---|---|
| `wikilinks` | Query: `backlinks` / `outgoing` / `broken` / `orphans`. Needs `filename` for per-note queries |

### Periodic (1)

| Tool | Use for |
|---|---|
| `periodic` | Today's daily / weekly / monthly / quarterly / yearly. `action: create` is idempotent — won't clobber |

### Move (1)

| Tool | Use for |
|---|---|
| `move-note` | Rename / move. **Rewrites inbound `[[wikilinks]]` automatically.** Never edit a title by hand |

## Common patterns

| Want | Call |
|---|---|
| Find anything about X | `search-vault` with `query: "X"` |
| Find notes tagged `area/work` | `search-vault` with `frontmatter: {"tags": "area/work"}` |
| Read just the structure of a long note | `read-note` with `view: "outline"` |
| Append to today's daily | `periodic` `create` → `edit-note` `append` |
| Save a one-line idea | `create-note` to `00-inbox/` (use Inbox Item template) |
| Rename a note safely | `move-note` (never edit the title by hand) |
| Find broken wikilinks | `wikilinks` with `query: "broken"` |
| Find orphan notes | `wikilinks` with `query: "orphans"` |
| Get a section of a note | `read-note` with `offset` / `limit` (line numbers from `outline`) |
| Edit one section | `edit-note` with `targetType: "heading"` + `target: "## Log"` |

## Cheat sheet — natural language

| Say | I'll do |
|---|---|
| "add a card to my inbox about X" | `create-note` → `00-inbox/<slug>.md` |
| "what's in my vault tagged work" | `search-vault` with frontmatter filter |
| "search for X" | `search-vault X` |
| "show me today's daily" | `periodic daily get` |
| "make today's daily" | `periodic daily create` |
| "append to <note>" | `edit-note append` |
| "rename X to Y" | `move-note` (auto-rewrites wikilinks) |
| "what links here" | `wikilinks backlinks` |
| "delete X" | `delete-note` → `.trash/` (recoverable) |
| "tag X with foo" | `add-tags` |

## Obsidian plugin config (one-time)

| Plugin | Set to |
|---|---|
| **Templates** | Folder: `90-templates/` |
| **Daily Notes** | Folder: `10-daily/`, format: `YYYY-MM-DD.md` |
| **Graph view** | Excludes: `90-templates/`, `50-archive/` (optional) |

## Related

- [[Workflows]] — capture / triage / review playbook
- [[Rules]] — how the AI behaves when working here
