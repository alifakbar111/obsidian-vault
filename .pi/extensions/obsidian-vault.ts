import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { readdir, readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { join, relative, parse, extname } from "node:path";
import { existsSync } from "node:fs";

const VAULT_PATH = "/storage/emulated/0/Documents/obsidian-vault";

interface Frontmatter {
  title?: string;
  created?: string;
  tags?: string | string[];
  status?: string;
  [key: string]: unknown;
}

function parseFrontmatter(content: string): { frontmatter: Frontmatter; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };

  const frontmatter: Frontmatter = {};
  const fmLines = match[1].split("\n");
  for (const line of fmLines) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) {
      const val = kv[2].trim();
      if (val.startsWith("[")) {
        try { frontmatter[kv[1]] = JSON.parse(val.replace(/'/g, '"')); }
        catch { frontmatter[kv[1]] = val; }
      } else {
        frontmatter[kv[1]] = val;
      }
    }
  }
  return { frontmatter, body: match[2] };
}

function buildFrontmatter(fm: Frontmatter): string {
  const lines = ["---"];
  for (const [k, v] of Object.entries(fm)) {
    if (Array.isArray(v)) {
      lines.push(`${k}: [${v.map(s => `'${s}'`).join(", ")}]`);
    } else if (v !== undefined && v !== null) {
      lines.push(`${k}: ${v}`);
    }
  }
  lines.push("---");
  return lines.join("\n");
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function todayDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function (pi: ExtensionAPI) {
  // Tool: Read a note from the vault
  pi.registerTool({
    name: "obsidian_read",
    label: "Obsidian: Read Note",
    description: "Read a note from the Obsidian vault by path or wikilink title",
    promptSnippet: "Read notes from the Obsidian vault",
    promptGuidelines: [
      "Use obsidian_read to retrieve notes from the vault when context might already exist there",
      "Paths can be relative to vault root or absolute",
    ],
    parameters: Type.Object({
      path: Type.Optional(Type.String({ description: "Relative path to the note (e.g., 'Rules.md' or 'Agent Kit/Agent Kit.md')" })),
      title: Type.Optional(Type.String({ description: "Wikilink title (e.g., 'Rules' or 'Agent Kit'). Searches for a note by title." })),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, _ctx) {
      const { path, title } = params;
      let fullPath: string;

      if (path) {
        fullPath = path.startsWith("/") ? path : join(VAULT_PATH, path);
      } else if (title) {
        // Search for note by title across the vault
        const found = await findNoteByTitle(title);
        if (!found) {
          return {
            content: [{ type: "text", text: `Note with title "${title}" not found in vault` }],
            details: {},
            isError: true,
          };
        }
        fullPath = found;
      } else {
        return {
          content: [{ type: "text", text: "Provide either 'path' or 'title' parameter" }],
          details: {},
          isError: true,
        };
      }

      if (!existsSync(fullPath)) {
        return {
          content: [{ type: "text", text: `File not found: ${fullPath}` }],
          details: {},
          isError: true,
        };
      }

      const content = await readFile(fullPath, "utf-8");
      const { frontmatter, body } = parseFrontmatter(content);
      const relPath = relative(VAULT_PATH, fullPath);

      return {
        content: [
          {
            type: "text",
            text: `# ${relPath}\n\n---frontmatter---\n${JSON.stringify(frontmatter, null, 2)}\n---end---\n\n${body.trim()}`,
          },
        ],
        details: { frontmatter, path: relPath },
      };
    },
  });

  // Tool: Search notes in vault
  pi.registerTool({
    name: "obsidian_search",
    label: "Obsidian: Search Vault",
    description: "Search notes by content, tags, or status across the vault",
    promptSnippet: "Search notes in the Obsidian vault by content or metadata",
    parameters: Type.Object({
      query: Type.Optional(Type.String({ description: "Content search query (case-insensitive, matches body and frontmatter)" })),
      tag: Type.Optional(Type.String({ description: "Filter by tag (e.g., 'area/work' or 'type/reference')" })),
      status: Type.Optional(Type.String({ description: "Filter by status (seedling, evergreen, archived)" })),
      folder: Type.Optional(Type.String({ description: "Search within a specific folder (relative path)" })),
      limit: Type.Optional(Type.Number({ description: "Maximum results to return (default 20)", default: 20 })),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, _ctx) {
      const { query, tag, status, folder, limit = 20 } = params;
      const searchDir = folder ? join(VAULT_PATH, folder) : VAULT_PATH;
      const allNotes: Array<{ path: string; title: string; status?: string; tags: string[]; excerpt: string }> = [];

      async function walk(dir: string) {
        const entries = await readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = join(dir, entry.name);
          if (entry.isDirectory()) {
            if (!entry.name.startsWith(".") && entry.name !== ".trash" && entry.name !== "node_modules") {
              await walk(fullPath);
            }
          } else if (entry.name.endsWith(".md")) {
            const content = await readFile(fullPath, "utf-8");
            const { frontmatter, body } = parseFrontmatter(content);
            const relPath = relative(VAULT_PATH, fullPath);
            const tags = Array.isArray(frontmatter.tags)
              ? frontmatter.tags
              : typeof frontmatter.tags === "string"
                ? [frontmatter.tags]
                : [];

            // Apply filters
            if (status && frontmatter.status !== status) continue;
            if (tag && !tags.some(t => t === tag || t.startsWith(tag))) continue;
            if (query) {
              const lowerQuery = query.toLowerCase();
              const contentText = (body + JSON.stringify(frontmatter)).toLowerCase();
              if (!contentText.includes(lowerQuery)) continue;
            }

            // Get excerpt
            const lines = body.split("\n").filter(l => l.trim());
            const excerpt = lines.slice(0, 5).join("\n").slice(0, 300);

            allNotes.push({
              path: relPath,
              title: (frontmatter.title as string) || parse(entry.name).name,
              status: frontmatter.status as string,
              tags,
              excerpt,
            });
          }
        }
      }

      await walk(searchDir);
      const results = allNotes.slice(0, limit);

      if (results.length === 0) {
        return {
          content: [{ type: "text", text: "No matching notes found." }],
          details: { count: 0 },
        };
      }

      const output = results
        .map(
          (n, i) =>
            `${i + 1}. **${n.title}** (${n.path})${n.status ? ` [${n.status}]` : ""}${n.tags.length ? ` tags: ${n.tags.join(", ")}` : ""}\n   ${n.excerpt.slice(0, 200)}...`
        )
        .join("\n\n");

      return {
        content: [{ type: "text", text: `Found ${results.length} note(s):\n\n${output}` }],
        details: { count: results.length, results },
      };
    },
  });

  // Tool: Create a new note
  pi.registerTool({
    name: "obsidian_create",
    label: "Obsidian: Create Note",
    description: "Create a new note in the Obsidian vault with frontmatter",
    promptSnippet: "Create new notes in the Obsidian vault",
    promptGuidelines: [
      "Use obsidian_create to save durable decisions, ideas, and reference material to the vault",
      "One topic per note — split when a note crosses ~200 lines",
      "Use wikilinks [[Note Title]] for internal references",
    ],
    parameters: Type.Object({
      title: Type.String({ description: "Note title (also used as filename)" }),
      content: Type.String({ description: "Note body content (Markdown). Use [[Title]] for wikilinks." }),
      folder: Type.Optional(Type.String({ description: "Target folder (e.g., '00-inbox', '20-projects/my-project'). Default: '00-inbox'" })),
      tags: Type.Optional(Type.Array(Type.String(), { description: "Tags for the note" })),
      status: Type.Optional(Type.String({ description: "Status: seedling (default), evergreen, archived" })),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, _ctx) {
      const { title, content, folder = "00-inbox", tags = [], status = "seedling" } = params;

      // Build filename from title
      const filename = slugify(title) + ".md";
      const targetDir = join(VAULT_PATH, folder);
      const fullPath = join(targetDir, filename);

      // Ensure directory exists
      await mkdir(targetDir, { recursive: true });

      if (existsSync(fullPath)) {
        return {
          content: [{ type: "text", text: `Note already exists at ${folder}/${filename}. Use a different title or edit the existing note.` }],
          details: {},
          isError: true,
        };
      }

      const frontmatter = buildFrontmatter({
        title,
        created: todayDate(),
        tags,
        status,
      });

      const noteContent = `${frontmatter}\n\n${content}\n`;
      await writeFile(fullPath, noteContent, "utf-8");

      return {
        content: [
          {
            type: "text",
            text: `Created note: **${title}** → \`${folder}/${filename}\`\n\n${noteContent}`,
          },
        ],
        details: { path: `${folder}/${filename}`, title },
      };
    },
  });

  // Tool: Edit a note (append, prepend, or replace)
  pi.registerTool({
    name: "obsidian_edit",
    label: "Obsidian: Edit Note",
    description: "Edit an existing note: append, prepend, or replace content (after frontmatter)",
    promptSnippet: "Edit existing notes in the Obsidian vault",
    parameters: Type.Object({
      path: Type.String({ description: "Relative path to the note (e.g., '00-inbox/my-note.md')" }),
      mode: Type.Enum({ append: "append", prepend: "prepend", replace: "replace" }, { description: "Edit mode" }),
      content: Type.String({ description: "Content to append, prepend, or replace with" }),
      section: Type.Optional(Type.String({ description: "Optional: heading or section to edit (only for 'replace' mode)" })),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, _ctx) {
      const { path, mode, content, section } = params;
      const fullPath = join(VAULT_PATH, path);

      if (!existsSync(fullPath)) {
        return {
          content: [{ type: "text", text: `Note not found: ${path}` }],
          details: {},
          isError: true,
        };
      }

      const existing = await readFile(fullPath, "utf-8");
      const { frontmatter, body } = parseFrontmatter(existing);
      let newBody: string;

      if (mode === "append") {
        newBody = body.trimEnd() + "\n\n" + content.trimStart();
      } else if (mode === "prepend") {
        newBody = content.trimEnd() + "\n\n" + body.trimStart();
      } else if (mode === "replace") {
        if (section) {
          // Replace content under a specific heading
          const headingRegex = new RegExp(`(##+\\s*${escapeRegex(section)}\\s*\\n[\\s\\S]*?)(?=\\n##|$)`, "m");
          if (headingRegex.test(body)) {
            newBody = body.replace(headingRegex, `## ${section}\n\n${content.trim()}`);
          } else {
            newBody = body.trimEnd() + `\n\n## ${section}\n\n${content.trim()}`;
          }
        } else {
          newBody = content;
        }
      } else {
        newBody = body;
      }

      const fmStr = buildFrontmatter(frontmatter);
      const result = `${fmStr}\n\n${newBody.trim()}\n`;
      await writeFile(fullPath, result, "utf-8");

      return {
        content: [{ type: "text", text: `Edited ${path} (mode: ${mode})` }],
        details: { path, mode },
      };
    },
  });

  // Tool: Get today's daily note (create if not exists)
  pi.registerTool({
    name: "obsidian_daily",
    label: "Obsidian: Today's Daily Note",
    description: "Get or create today's daily note in 10-daily/",
    promptSnippet: "Access today's daily note",
    parameters: Type.Object({
      create: Type.Optional(Type.Boolean({ description: "Create if not exists (default: true)", default: true })),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, _ctx) {
      const { create = true } = params;
      const date = todayDate();
      const dailyDir = join(VAULT_PATH, "10-daily");
      const dailyPath = join(dailyDir, `${date}.md`);

      if (!existsSync(dailyPath)) {
        if (!create) {
          return {
            content: [{ type: "text", text: `Daily note for ${date} does not exist yet.` }],
            details: { exists: false, date },
          };
        }

        // Create from Daily template if it exists
        const templatePath = join(VAULT_PATH, "90-templates", "Daily.md");
        let body = "";
        if (existsSync(templatePath)) {
          const templateContent = await readFile(templatePath, "utf-8");
          const parsed = parseFrontmatter(templateContent);
          body = parsed.body;
        } else {
          body = "## Top 3 Priorities\n\n1. \n2. \n3. \n\n## Inbox\n\n\n## Notes\n\n\n## Created Today\n\n";
        }

        const frontmatter = buildFrontmatter({
          title: date,
          created: date,
          tags: ["type/daily"],
          status: "seedling",
        });

        await mkdir(dailyDir, { recursive: true });
        await writeFile(dailyPath, `${frontmatter}\n\n${body.trim()}\n`, "utf-8");
      }

      const content = await readFile(dailyPath, "utf-8");
      return {
        content: [{ type: "text", text: `# Daily Note: ${date}\n\n${content}` }],
        details: { path: `10-daily/${date}.md`, date },
      };
    },
  });

  // Tool: List vault contents
  pi.registerTool({
    name: "obsidian_list",
    label: "Obsidian: List Notes",
    description: "List notes and folders in the vault (optionally within a folder)",
    promptSnippet: "List notes and folders in the Obsidian vault",
    parameters: Type.Object({
      folder: Type.Optional(Type.String({ description: "Folder to list (relative to vault root). Root if omitted." })),
      depth: Type.Optional(Type.Number({ description: "Max directory depth (default: 1)", default: 1 })),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, _ctx) {
      const { folder = "", depth = 1 } = params;
      const targetDir = folder ? join(VAULT_PATH, folder) : VAULT_PATH;

      if (!existsSync(targetDir)) {
        return {
          content: [{ type: "text", text: `Folder not found: ${folder || "(root)"}` }],
          details: {},
          isError: true,
        };
      }

      const items: string[] = [];

      async function walk(dir: string, currentDepth: number) {
        if (currentDepth > depth) return;
        const entries = await readdir(dir, { withFileTypes: true });
        const sorted = entries.sort((a, b) => {
          if (a.isDirectory() && !b.isDirectory()) return -1;
          if (!a.isDirectory() && b.isDirectory()) return 1;
          return a.name.localeCompare(b.name);
        });

        for (const entry of sorted) {
          if (entry.name.startsWith(".")) continue;
          const fullPath = join(dir, entry.name);
          const relPath = relative(VAULT_PATH, fullPath);
          if (entry.isDirectory()) {
            items.push(`📁 ${relPath}/`);
            await walk(fullPath, currentDepth + 1);
          } else if (entry.name.endsWith(".md")) {
            items.push(`📄 ${relPath}`);
          }
        }
      }

      await walk(targetDir, 1);
      return {
        content: [{ type: "text", text: items.length > 0 ? items.join("\n") : "(empty folder)" }],
        details: { count: items.length, items },
      };
    },
  });
}

// Helper: search for a note by title (first match)
async function findNoteByTitle(title: string): Promise<string | null> {
  const searchTarget = title.toLowerCase().replace(/[^a-z0-9]/g, "-");

  async function walk(dir: string): Promise<string | null> {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!entry.name.startsWith(".") && entry.name !== ".trash" && entry.name !== "node_modules") {
          const found = await walk(fullPath);
          if (found) return found;
        }
      } else if (entry.name.endsWith(".md")) {
        const content = await readFile(fullPath, "utf-8");
        const { frontmatter } = parseFrontmatter(content);
        const noteTitle = (frontmatter.title as string) || parse(entry.name).name;
        const normalizedTitle = noteTitle.toLowerCase().replace(/[^a-z0-9]/g, "-");
        if (normalizedTitle === searchTarget || normalizedTitle.includes(searchTarget) || searchTarget.includes(normalizedTitle)) {
          return fullPath;
        }
      }
    }
    return null;
  }

  return walk(VAULT_PATH);
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
