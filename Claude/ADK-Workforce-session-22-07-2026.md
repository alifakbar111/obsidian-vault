# Agent Dev Kit & Workforce — Session Transcript

*Exported 2026-07-22. Full session: the five-layer Agent Development Kit (teaching + sharing deck + Zero One Group re-skin + speaker script), multi-agent kit reviews across Claude Code and opencode, and the Workforce department-agent design culminating in a combined five-layer ADK-with-Workforce kit.*

*Part 1 is verbatim from the session transcript. Part 2 onward is reconstructed from the continued session (user messages verbatim; assistant replies summarized).*

---

**You:** i want learn more about agent development kit, make it like lecturer explain to their students, that having 0 knowledge about this agent development kit,

**Claude:** I'd love to teach you this. Before I start lecturing, let me make sure I'm giving you accurate, current information rather than relying on potentially outdated knowledge — these features change quickly, so let me verify the details.

Let me verify the key Claude Code features against the official documentation so I teach you the real thing, not a simplified poster version.

I need to search first before fetching. Let me do that.

The official docs confirm the poster's structure and let me correct a couple of things it simplifies. Let me grab the authoritative overview so my lecture is grounded in the real model.

I've checked these against the current official Claude Code documentation, and the good news is the posters are accurate in spirit. I'll teach you the real model and flag the couple of places where the posters simplify things. Settle in — this is a proper lecture, in plain prose, building from nothing.

## What we're actually talking about

Let me set the scene first, because the term "Agent Development Kit" can mislead a beginner. These posters are about **Claude Code** — Anthropic's AI coding agent that runs in your terminal. It reads your files, runs commands, and edits code on your behalf. Out of the box it already works. What the five layers describe is the *extension system*: the set of mechanisms you bolt on to make the agent smarter, safer, and more consistent for *your* particular project. Claude Code combines a model that reasons about your code with built-in tools for file operations, search, execution, and web access. The built-in tools cover most coding tasks. Everything in the posters sits on top of that.

So when the first poster says "five layers, one stack," picture it like this: you have a capable but generic assistant, and these five layers progressively turn it into an assistant that knows your codebase, follows your rules, does your repetitive jobs, and can be shared with your whole team. Hold that framing in your head, because the single biggest source of confusion for beginners is treating these five things as five separate gadgets. They're not. They're a *gradient* — and I'll give you the one mental model that makes the whole thing click at the end.

Let me take each layer the way the posters do, but explain the *why* underneath each one.

## Layer 1 — CLAUDE.md, the memory layer

Imagine you hire a brilliant contractor who has total amnesia between every conversation. Every single morning you'd have to re-explain: "We use pnpm, not npm. Run the tests before you commit. The auth code lives in this folder." Exhausting, right? That re-explaining problem is exactly what CLAUDE.md solves.

CLAUDE.md is a plain text file (Markdown — hence the `.md`) that the agent reads automatically at the start of every session, before you've said a word. The poster calls it "the agent's constitution," and that's a good metaphor: it's the always-on, always-loaded set of standing rules. CLAUDE.md adds persistent context Claude sees every session. A typical entry is something blunt like "Use pnpm, not npm. Run tests before committing."

The second poster shows it lives in two places, and the distinction matters. A **global** file at `~/.claude/CLAUDE.md` applies to *every* project you ever touch — that's where your personal preferences and default style go. A **project** file at `.claude/CLAUDE.md` lives inside one specific repository and applies only there — that's where the architecture rules and naming conventions for *that* codebase go. The mental split is "things true about *me*" versus "things true about *this project*."

Now, one important correction to the posters. The first poster draws files like `architecture.rules`, `global.md`, and `project.md` *inside* CLAUDE.md as if it were a folder, and the second poster lists `naming.conventions`, `test.expectations`, and `repo.map`. Treat those as *illustrative categories of content* you'd write inside your CLAUDE.md, not as a rigid required file structure. In reality CLAUDE.md is usually a single file, and the docs are firm on a practical limit: keep it under roughly 200 lines. If it grows past that, you move the overflow into skills (the next layer) or into separate rule files. The reason is subtle but important for a beginner to absorb early: every line in CLAUDE.md costs you *context window* — the finite amount of text the model can hold in working memory at once. Stuff too much in and you both run out of room and drown the agent in noise so it stops following any of it well. So the discipline is: CLAUDE.md is for the handful of rules that must *always* apply. Everything else waits in a lower layer until it's actually needed.

The poster's tagline — "Write CLAUDE.md once. Save yourself 100 prompts later" — captures the whole point. You're trading a little setup now for not repeating yourself forever.

## Layer 2 — Skills, the knowledge layer

Here's the natural next question a thoughtful student asks: *if CLAUDE.md is always loaded but I shouldn't put much in it, where does all my other knowledge go?* That's precisely the gap skills fill.

A skill is a folder containing a file named `SKILL.md` plus any supporting material. The defining property — and please commit this one to memory because it's the heart of the design — is that skills are loaded **on demand**, not always. Skills add reusable knowledge and invocable workflows. The clever trick is in *how* the agent decides to load one.

Here's the mechanism. Each skill has a short description at the top. By default, skill descriptions load at session start so Claude can decide when to use them. So at the start, the agent sees only a lightweight menu of skill *names and descriptions* — cheap, almost no context cost. Then, when your task matches a description, the agent pulls in that skill's full content. The third poster illustrates this beautifully: you say "convert this PDF," the agent scans its menu, sees a `pdf-skill` whose description is "Read and convert PDF files," matches it, and *only then* loads the heavy instructions. The video-skill and excalidraw-skill stay dormant because they didn't match. This is description-matching, and it's why writing a *good, specific* description for each skill matters enormously — a vague description means the agent loads the wrong skill or misses the right one.

Skills come in two flavors worth distinguishing. Some are **reference** skills — pure knowledge, like your API style guide, that the agent consults. Others are **action** skills — workflows you can trigger by typing a slash command like `/deploy`, which runs your deployment checklist step by step. Skills can be invoked with a command like `/deploy`, or Claude can load them automatically when relevant.

One detail that will save you confusion when you read other guides: what used to be called "Commands" or "slash commands" in Claude Code has been folded *into* the skills system. So if you see an older article talking about custom commands as a separate thing, just know they're skills now. The poster's tagline, "One skill. Wired forever. Future Claude knows," is the idea that you encode an expertise once and the agent can reach for it indefinitely.

## Layer 3 — Hooks, the guardrail layer

Now we hit the most conceptually different layer, and I want to slow down because beginners almost always misunderstand it. Everything in Layers 1 and 2 is *advice to the model*. CLAUDE.md rules and skill instructions are things the agent *reads and tries to follow* — but the agent is an AI making judgment calls, so it *can* be reasoned around, misinterpreted, or simply ignored under pressure. The fourth poster's headline nails the distinction: hooks are "Deterministic. Not AI."

A hook is a plain shell script — ordinary code, no intelligence — that fires automatically when a specific event happens in the agent's lifecycle. A hook fires on lifecycle events and can run a script, HTTP request, prompt, or subagent. The key word is *deterministic*: the script runs the same way every single time the event occurs, with no interpretation. The docs put the contrast sharply — an instruction like "never edit the .env file" written in CLAUDE.md is a *request*, but a hook that physically blocks that edit is *enforcement*. If a rule absolutely must hold every time, you don't write it as a prompt; you write it as a hook.

The fourth poster breaks the mechanism into two halves, which is exactly right. A **matcher** is the pattern that decides *when* to fire — for example, "any time the agent tries to run a Bash command starting with `rm`." A **command** is the shell code that then *runs* — for example, checking a condition and exiting with a special code that aborts the dangerous action. The bottom of the poster shows the clean three-beat sequence: an event fires, the matcher checks whether it cares, and if so the command runs.

As for *which* events you can hook into, the posters list a few common ones — fire before a tool runs, after a tool runs, when a session starts, when the agent finishes a turn, when a subagent returns. The real system has more event types than any single poster shows (one of the articles I checked counted around two dozen), covering things like prompt submission and permission requests too. The point isn't to memorize the list; it's to understand the *shape*: hooks let you attach guaranteed, code-level behavior to moments in the agent's life. The classic uses are auto-running your linter after every file edit, blocking unsafe commands, and writing an audit log. The poster's line "Git hooks, but for your agent" is the perfect analogy if you've used Git — same idea, different trigger points.

## Layer 4 — Subagents, the delegation layer

To understand why subagents exist, you need to feel a pain point first. Remember that the agent has a finite context window — its working memory. Now suppose you ask it to "find every place in this huge codebase where we handle payments." To answer, it might read fifty files. Every one of those files pours text into the working memory, and most of it is junk you'll never look at again. By the time it answers, its memory is so cluttered with irrelevant file contents that it's gotten dumber for the rest of your conversation. That clutter is the problem subagents solve.

A subagent is a *separate* agent instance, spawned to do one job, with its **own** context window. Subagents run their own loops in isolated context, returning summaries. The fifth poster's framing of parent and child is the right picture. Your **main session** is the parent — where you talk, where the planning happens. When a noisy task comes up, the parent spins off a **child** subagent. The child goes off and does the messy reading in its *own* memory, then returns just one thing: a clean summary. Your main conversation never sees the fifty files — only the answer. The docs describe it as a worker that might read dozens of files or run extensive searches, but your main conversation only receives a summary.

The poster's two taglines — "Delegate the noise, keep the main thread clean" and the diagram showing "delegate only" going out and "results only" coming back — express the entire value proposition. You're protecting your main agent's limited memory by outsourcing the messy parts. As a bonus, subagents can run in parallel and can each have their own narrowed tools and permissions, like specialist contractors.

One thing the posters don't mention that's worth knowing exists: there's now also a related, more advanced concept called **agent teams**, where multiple independent sessions coordinate and even message *each other*, rather than just reporting back to one parent. You don't need it yet — it's experimental and off by default — but file away that subagents are the simple version and agent teams are the heavyweight version of "more than one agent at once."

## Layer 5 — Plugins, the distribution layer

Step back and notice what you've accumulated by now: a CLAUDE.md, some skills, some hooks, some subagent definitions. That's a real setup — and it lives only on *your* machine, in *one* repository. Now your teammate joins, or you start a second project, and they have *none* of it. The whole investment doesn't travel. That's the problem the final layer solves.

A plugin is the *packaging* layer. A plugin bundles skills, hooks, subagents, and MCP servers into a single installable unit. The sixth poster's "Bundle. Ship. Install." is the three-step lifecycle exactly. You gather your skills, agents, hooks, and commands into one package described by a manifest file (`plugin.json` — it declares the plugin's name, version, and what's inside). You publish it to a **marketplace**, and then anyone on your team installs the whole bundle in one shot. The poster's bottom row — bundle, then publish, then a row of teammates all receiving it — is the picture to keep. The tagline "Build it once, install it everywhere, the team levels up together" is the genuine payoff: instead of every developer hand-configuring their agent, one person packages the team's collective wisdom and everyone gets it identically.

The posters lean on an "npm packages for agent capabilities" analogy. If you know npm that's helpful; if you don't, just think of it as an app store for agent setups. One useful real detail: when plugins ship skills, those skills get *namespaced* — invoked like `/my-plugin:review` — so two plugins can each have a "review" skill without colliding.

## The one mental model that ties it together

I promised you the key that unlocks the whole thing, and here it is. Don't sort these five layers by *what they are*. Sort them by **when they load and how much they cost your context window**. Lay them on a spectrum from "always on" to "completely separate":

CLAUDE.md is at one extreme — loaded **every single session, in full**, so it's the most expensive and you keep it tiny. Skills sit one notch in — only their *descriptions* load up front, and the heavy content loads **on demand** when matched. Hooks are off to the side at essentially **zero context cost**, because they run as external code and don't occupy the model's memory at all — hooks execute outside the main conversation, with zero context cost unless a hook returns output. Subagents are at the far end — they run in a **fully isolated** context window that doesn't touch your main one at all. And plugins aren't on the spectrum; they're the box you ship the other four in.

Once you see it as a context-cost gradient, the design choices stop feeling arbitrary. *Why isn't everything in CLAUDE.md?* Because it'd be ruinously expensive and noisy. *Why use a hook instead of a CLAUDE.md rule for a hard guarantee?* Because the hook is deterministic code, not a request the AI might wiggle out of. *Why a subagent for a big search?* Because isolation keeps the mess out of your main memory. Every layer is a different answer to the same underlying question: *given a finite, expensive working memory, where should this piece of knowledge or behavior live?*

The first poster's footer sums the roles up cleanly: CLAUDE.md sets the rules, skills provide expertise, hooks enforce quality, subagents delegate work, and plugins distribute it to the team. Read top to bottom, that's also roughly the order you'd actually adopt them — start with a CLAUDE.md, reach for skills when you're pasting the same instructions repeatedly, add hooks when you need an ironclad guarantee, route noisy jobs to subagents, and only package plugins once a second person or project needs your setup.

---

To check your understanding before we go deeper anywhere: can you tell me, in your own words, *why* you'd put a "never touch the production database" rule in a hook rather than in CLAUDE.md? If you can answer that, you've got the most important idea in the whole stack. And if you'd like, I can take any single layer and walk through a real, hands-on example of setting it up — given your frontend and dashboard work, a `/deploy` skill or a lint-on-edit hook would probably be the most immediately useful place to get your hands dirty.

**You:** i'm curious with subagent, how it can be use or create ?

**Claude:** Great question to dig into — subagents are where Claude Code starts to feel genuinely powerful. Let me pull the current official details so I teach you the real syntax and not a guessed version, then I'll build it up slowly.

Let me pull the authoritative page so the syntax I show you is exact, then I'll teach it from the ground up.

Good — now we go from "what is a subagent" to "how do I actually make and run one." I've pulled the current official details so the syntax I show you is exact. Let me build this up the way I'd teach it in class: first the absolute simplest mental picture, then the file you write, then the ways to summon it, then the knobs you can turn once you're comfortable.

## First, the one fact that unlocks everything

Before any syntax, internalize this: **a subagent is just a Markdown file with a little configuration block at the top.** That's it. There's no special programming language, no compilation, no framework to install. If you can write a text file, you can create a subagent. The file has two parts — a small *settings* section at the top written in a format called YAML, and below it, plain English instructions that become the subagent's personality and job description.

And here's a detail that surprises most beginners and clears up a lot of confusion: an "agent" and a "subagent" are *the same file*. The word changes based on the *role it plays at runtime*, not how you wrote it. The exact same file is a "subagent" when your main session spawns it to do one job, and could be the "main agent" if you launched a whole session as it. So don't go looking for two different file formats — there's only one.

## The simplest possible subagent

Let me show you the smallest real example from the official docs, and then we'll dissect every line so nothing is mysterious.

```markdown
---
name: code-reviewer
description: Reviews code for quality and best practices
tools: Read, Glob, Grep
model: sonnet
---

You are a code reviewer. When invoked, analyze the code and provide
specific, actionable feedback on quality, security, and best practices.
```

Now let's read it slowly, because every piece is teaching you something.

The three dashes `---` at the top and the matching `---` a few lines down are *fences*. Everything between them is the **frontmatter** — the configuration. Think of it as the form you fill out describing the worker before they start. Everything *after* the closing `---` is the **system prompt** — the standing instructions the subagent reads as its identity, the moment it's born.

Inside the frontmatter, only two fields are actually required: `name` and `description`. Everything else is optional. The `name` is the subagent's identifier — lowercase letters and hyphens, like `code-reviewer`. The `description` is the single most important line you'll write, and I want to dwell on *why*.

## Why the description is the whole game

Here's the thing a beginner doesn't expect. The `description` isn't a label for *you* — it's a routing instruction for the main agent. Remember from our last conversation that the agent decides on its own when to hand work off? It makes that decision by reading your subagent descriptions and matching them against what you asked for. Claude uses each subagent's description to decide when to delegate tasks. When you create a subagent, write a clear description so Claude knows when to use it.

So the description does the *same job* a skill's description does: it's the trigger, not the title. A vague description like "reviews code" gives weak, unreliable triggering. A description that spells out the *situations* that should invoke it works far better. The official code-reviewer example is instructive — notice how its real description reads: "Expert code review specialist. Proactively reviews code for quality, security, and maintainability. Use immediately after writing or modifying code." See how it describes *when* to fire, not just *what* it is? And that phrase "use proactively" is a deliberate signal — to encourage proactive delegation, include phrases like "use proactively" in your subagent's description field. Write your descriptions like routing rules and your subagents will actually get used.

## Two ways to create one

Now, *how* do you make this file exist? There are two paths, and I genuinely recommend the first for a beginner.

The easy way is an interactive command. Inside a Claude Code session you type `/agents`, and it opens a guided interface that walks you through every choice — name, where to save it, which tools, which model, even a color — and it can generate the identifier, description, and system prompt for you. You describe what you want in plain English, like "a code improvement agent that scans files and suggests improvements for readability, performance, and best practices," and it writes the file. This is the recommended way precisely because it handles the syntax for you while you learn. A nice bonus: subagents created through `/agents` take effect immediately without a restart.

The manual way is to simply create the Markdown file yourself in the right folder. This is worth doing once just to demystify it — you'll see there's no magic. One catch the docs are explicit about: if you add or edit a subagent file directly on disk, restart your session to load it. Subagents are read at session start, so a hand-edited file won't appear until you relaunch.

## Where the file lives, and why it matters

This is the same global-versus-project idea you already learned for CLAUDE.md and skills, so it'll feel familiar. A subagent saved at `~/.claude/agents/` is a **user** subagent — personal, available across all your projects. One saved at `.claude/agents/` inside a repository is a **project** subagent, specific to that codebase. The docs give a clean rule of thumb: Project subagents are ideal for subagents specific to a codebase. Check them into version control so your team can use and improve them collaboratively. So a generic "code reviewer" you'd want everywhere goes in your user folder; a "migration agent that understands *this* project's database schema" goes in the project folder and rides along in Git for your teammates.

## Three ways to actually run it

Once the subagent exists, you summon it in one of three ways, and they escalate from "gentle suggestion" to "session-wide default." Understanding the escalation is the useful part.

The loosest way is **natural language** — you just name it in your request and let the main agent decide. There's no special syntax; you write something like "Use the test-runner subagent to fix failing tests" or "Have the code-reviewer subagent look at my recent changes." The agent reads that, checks the description, and typically delegates. The word *typically* matters: with natural language you're suggesting, not commanding.

The firmer way is an **@-mention**. You type `@` and pick the subagent from a list, the same way you might tag a file. This one is a guarantee — this ensures that specific subagent runs rather than leaving the choice to Claude. One subtlety worth absorbing so you're not confused later: the @-mention controls *which* subagent runs, but the main agent still writes the actual task prompt the subagent receives based on your full message. You're choosing the worker, not dictating their exact instructions word-for-word.

The strongest way is **session-wide**, using a command-line flag when you launch: `claude --agent code-reviewer`. This makes the *entire session* adopt that subagent's system prompt, tools, and model — the main thread itself *becomes* that agent. You'd reach for this when you want a focused session that does nothing but, say, code review.

## The knobs you'll grow into

Everything above is enough to be productive. But let me show you the dials in the frontmatter, because they're where subagents go from "neat" to "genuinely safer and cheaper than doing the work in your main chat." I'll cover the four that matter most for a beginner and leave the rest as "exist, look them up when needed."

The `tools` field is the most important safety dial. By default a subagent inherits *every* tool the main conversation has. By listing tools explicitly, you create an allowlist — the code-reviewer above gets only `Read, Glob, Grep`, which means it physically *cannot* edit or write files. This is the principle the docs urge as a best practice: Limit tool access: grant only necessary permissions for security and focus. A reviewer that can't accidentally change your code is a reviewer you can trust. There's also a mirror-image field, `disallowedTools`, when it's easier to say "everything *except* Write and Edit" than to list what's allowed.

The `model` field is your cost dial. A subagent can run on a different, cheaper, faster model than your main session. Control costs by routing tasks to faster, cheaper models like Haiku. The mental model professionals use: run your main session on a powerful model for coordination and judgment, and let grunt-work subagents — file searching, log scanning — run on Haiku. You reserve the expensive thinking for where it actually matters. If you omit the field, the subagent just inherits the main session's model.

The `skills` field connects back to what you learned last time, and it's a lovely bit of design. You can list skills in a subagent's frontmatter, and the full content of each listed skill is injected into the subagent's context at startup. So instead of hoping the subagent discovers the right knowledge, you hand it the relevant expertise pre-loaded. Picture an `api-developer` subagent with your `api-conventions` skill preloaded — it starts already knowing your team's patterns, no discovery step needed. This is the through-line of the whole stack: the layers aren't separate, they compose.

The body — the prose after the closing `---` — is where you spend your real effort, and it rewards *specificity*. A vague instruction like "review this code" produces vague results. Look at how the official examples structure the body: a clear identity sentence ("You are a senior code reviewer..."), then a numbered "When invoked" workflow, then a checklist of exactly what to look for, then a required output format. That structure is the difference between a subagent that wanders and one that reliably does the same excellent job every time.

## Two boundaries to remember

Two limits will save you frustration. First, **subagents cannot spawn other subagents** — there's no infinite nesting. If your workflow requires nested delegation, use Skills or chain subagents from the main conversation. Chaining means *you* (via the main session) run one, take its result, then run the next: "Use the code-reviewer subagent to find performance issues, then use the optimizer subagent to fix them." Second, don't over-delegate. Spinning up a subagent has overhead — fresh context, startup time, token cost — so for a tiny, fast task it's not worth it. The docs' own guidance: use the main conversation when the task needs frequent back-and-forth or iterative refinement or is a quick targeted change, and reach for a subagent when the work is self-contained and produces verbose output you don't want cluttering your main context.

---

Here's a small exercise to cement it, and it ties directly to your own work. Imagine you want a subagent that audits your React components for accessibility issues but must *never* modify them — read-only, and you'd like it cheap. In your own words: which two frontmatter fields do the safety and cost work, and what would you put in each? If you can answer that, you've understood the core of subagent design — and if you'd like, I'll then write that exact accessibility-auditor subagent out fully so you have a working file to drop into a project.

**You:** you as an super AI, if work as Principal Software Engineer, how you will setup all 5 Layers if in the project ? i want to know how it works

**Claude:** This is a great question — and a fun one to think through together. Before I lay out a full Principal Engineer setup, I want to teach this as *thinking*, not as a recipe. A real Principal doesn't pull a setup off a shelf; they *derive* it from the project's reality. So let me show you the reasoning, then the concrete setup, and at a couple of points I'll pause and let you steer.

But first — let me check something with you, because the answer changes a lot depending on context.

You said "in the project." I'm going to assume you mean a project that looks like the work you've been doing: a React + TypeScript frontend, Tailwind, shadcn, a design system, internationalization, multiple developers. If you meant something completely different (a backend service, a mobile app, a solo side project), tell me and I'll re-derive it. For now I'll proceed with that assumption.

## How a Principal actually thinks before touching any file

Here's the move that separates senior from junior thinking: **don't start with the layers. Start with the pain.** Every layer you add has a cost — context window, maintenance, onboarding complexity for the team. So the right question isn't "how do I use all five layers?" It's "what *specific* problems am I trying to remove from my team's daily life?"

Let me list what I'd actually be observing on a typical mid-sized React project, and you'll see the layers practically *choose themselves*:

The team keeps using `npm` when the project uses `pnpm`. People forget the design tokens and hardcode `#CD0005` instead of `var(--color-primary)`. New components skip the i18n wrapper and ship English-only strings. PRs land with `console.log` still in them. A junior runs `rm -rf node_modules` and accidentally types `/` somewhere bad. Code reviews are inconsistent — some catch accessibility issues, some don't. Onboarding a new dev takes a week of "oh, we do it *this* way here." And whenever you start a new repo, you re-explain everything from scratch.

Notice that every one of those pains maps to exactly one layer. *That's* the design move. So before I show you the setup, here's a question for you to sit with for ten seconds: **looking at that list, can you guess which pain maps to which layer?** Try it before reading on — if you can do this matching, you've understood the whole stack at a level most people don't reach.

…

Okay, here's how a Principal would map them, and then the actual setup.

## The mapping (the *why* behind every layer in this project)

The pnpm-vs-npm thing and the "we always use the design tokens" rule are *standing laws of the land*. Everyone needs to know them, every session, from word one. → **CLAUDE.md**, the always-loaded constitution.

The "how to add a new translated component" workflow and the "here's our shadcn + Tailwind v4 token system" knowledge are *reference material* — useful when the task touches them, irrelevant otherwise. Loading them every session would be wasteful. → **Skills**, loaded on demand.

The `console.log` ban and the "never `rm -rf` outside the project" rule are *non-negotiables*. They can't be requests the AI might wiggle out of when it's in a hurry. → **Hooks**, deterministic enforcement.

The code review, the accessibility audit, the "go read 40 files to map our component dependency graph" task — these are *noisy investigations* whose intermediate output will pollute the main thread. → **Subagents**, isolated workers.

And the whole carefully-tuned bundle of the above is something *every teammate* needs identically, and that you want to install in your next repo too. → **Plugins**, the distribution wrapper.

See how each layer earned its place? Nothing is there because the poster has five boxes. Each one is doing work no other layer can do as well.

## The setup, layer by layer, with the reasoning out loud

Now I'll write it out. I'll keep the code minimal so you can read it as a *pattern*, not a copy-paste blob.

### Layer 1 — The CLAUDE.md (kept ruthlessly short)

A Principal's CLAUDE.md is striking for what's *not* in it. The temptation is to dump every rule the team has ever written. Resist it. Remember: every line costs context on every request. The discipline is to include only what must be true *every single time*.

Mine would look roughly like this (project-level, at `.claude/CLAUDE.md`):

```markdown
# Project: Coach Dashboard

## Stack
React 18 + TypeScript, Tailwind v4 (@theme inline), shadcn, react-i18next, react-router.

## Non-negotiables
- Use pnpm. Never npm or yarn.
- Run `pnpm test` and `pnpm lint` before declaring a task complete.
- All user-facing strings go through `t()` from react-i18next. Default locale: `id`.
- Use design tokens from `src/styles/colors.css`. Never hardcode hex values.
- Component files use PascalCase; hooks use camelCase with `use` prefix.

## Where things live
- UI components: `src/components/`
- Design system primitives: `src/components/ui/` (shadcn-derived)
- Hooks: `src/hooks/`
- i18n resources: `src/locales/{id,en}/`

## Reference material
For shadcn + Tailwind v4 token patterns, see the `design-system` skill.
For adding a new translated screen, see the `add-i18n-screen` skill.
```

Notice the moves. It's under 25 lines. It has *only* always-true rules. The bottom section *points to* skills rather than inlining their content — that's the discipline of letting the right layer do the right job. The "non-negotiables" list will be enforced *for real* by hooks in Layer 3, but it still belongs here so the agent reasons with awareness of the rules rather than just being blocked by them.

A small question for you before we move on: **why do I list the non-negotiables here even though hooks will enforce them anyway?** The answer is worth getting right because it explains a subtle thing about how the layers cooperate — I'll tell you after the next section if you want, or you can take a guess.

### Layer 2 — Skills (the team's externalized expertise)

This is where you put the knowledge that's too specific for CLAUDE.md but too valuable to re-explain. For your kind of project I'd start with maybe three or four — resist the urge to make twenty, because too many skills with overlapping descriptions confuse the matcher.

I'd build:

A `design-system` skill at `.claude/skills/design-system/SKILL.md` containing the full token map (Sampoerna Red ramps, neutral greys, semantic colors), the `@theme inline` pattern for Tailwind v4, and worked examples of correctly themed components. Its description would be tight and routing-focused: *"Use when creating or modifying any visual component, styling, or color choice. Covers the design tokens, color ramps, Tailwind v4 setup, and approved patterns for buttons, tables, and forms."*

An `add-i18n-screen` skill — a workflow skill, invokable as `/add-i18n-screen`. Its body is a step-by-step checklist: create the route, scaffold the component, add translation keys to both `id` and `en` locale files, wire up `useTranslation`, verify no hardcoded strings remain. This is the kind of thing your team does the same way every week.

A `component-review` skill that codifies your team's review checklist — accessibility (semantic HTML, ARIA where needed, keyboard navigation), responsive behavior, design token usage, i18n coverage, prop types. Reference material the agent consults when reviewing.

Maybe a `release-notes` skill if you generate release notes regularly — `/release-notes` runs the same format every time.

The Principal move here is **letting each skill be small and sharply named**. If you find yourself writing a skill that does five different things, split it. The matcher works better on specific descriptions, and the team finds them more easily.

### Layer 3 — Hooks (where you make the rules *real*)

This is where a Principal earns their salary, because hooks are where you stop trusting and start enforcing. Two hooks I'd put in immediately:

A `PreToolUse` hook on `Bash` that blocks dangerous commands. The matcher fires for any Bash invocation; the script inspects the command and exits with code 2 (which aborts the action) if it sees `rm -rf` with a path outside the project, any write to `.env`, or `git push --force` to main. This is exactly the pattern the official docs show — a script that reads JSON from stdin, extracts the command, and rejects it.

A `PostToolUse` hook on `Write|Edit` that runs your linter and formatter on changed files. Cheap to write, enormous payoff: every file the agent writes comes out lint-clean. No more "please remember to format" in CLAUDE.md.

Here's the conceptual point that's worth pausing on. **CLAUDE.md says "don't do X." Hooks make X impossible.** The first is a prompt; the second is physics. For things that *truly cannot happen* — production deletes, secrets in commits, unformatted code merging — you must use hooks. CLAUDE.md alone is hope, not policy.

### Layer 4 — Subagents (delegating the noisy work)

For your project I'd define three. Notice how each one solves a specific main-thread pollution problem.

A `code-reviewer` subagent, read-only (`tools: Read, Glob, Grep, Bash` — Bash only so it can run `git diff`). It preloads the `component-review` skill via the `skills` frontmatter field — remember, that injects the full skill content at startup, so the reviewer comes online already knowing your standards. Cheap model (Sonnet, or Haiku if you want to save more). Its description: *"Use proactively after any code changes to review for design system adherence, accessibility, i18n coverage, and team conventions. Read-only."*

A `codebase-explorer` subagent for "where is X used" or "map the auth flow" questions. Read-only, runs on Haiku because it's mostly grep-and-summarize work. This is the workhorse that saves your main context from getting flooded with file dumps.

A `test-runner` subagent that runs the test suite, parses the failures, and reports back only the failing tests with their actual errors — not the full noisy output. Tools: `Bash, Read`. The reason this is a subagent and not a hook: a hook is great for "always lint after edit," but interpreting test failures needs reasoning, not just script output.

The decision rule I'm using here, which is the one to internalize: **if the task produces a lot of intermediate noise but you only need a summary, it's a subagent. If it's deterministic enforcement, it's a hook. If it's reasoning the team does repeatedly, it's a skill.**

### Layer 5 — Plugins (only when it's earned)

Here's where the Principal pauses. You do *not* package a plugin on day one. You package a plugin when you have a second consumer — either a teammate or a second repository — that needs the same setup. Premature packaging is overhead with no payoff.

The trigger I'd wait for: a second project in the org needs the same `design-system` skill and the same enforcement hooks. *That's* the moment to bundle. The plugin would contain the design-system skill, the i18n workflow skill, the component-review skill, the code-reviewer subagent, and the lint/security hooks — basically everything except CLAUDE.md (which stays per-project because each project's *facts* are different even when the *standards* are shared).

You'd publish it to your team's internal marketplace, and a new repo onboards by typing one install command instead of copying files. The team levels up together — the poster's tagline is doing real work at that point.

## The whole picture in motion

Let me show you how this setup *behaves* in a single morning, because seeing it in flight is where it clicks.

A developer opens Claude Code in the project. **CLAUDE.md loads instantly** — the agent now knows it's pnpm, Indonesian default locale, design tokens required. **Skill descriptions load** — the agent has a menu of `design-system`, `add-i18n-screen`, `component-review`, `release-notes` but hasn't pulled the bodies. **The SessionStart hook fires** if you wrote one, maybe printing a "remember: we ship on Fridays" reminder.

The dev types: "Add a new settings page for notification preferences." The agent matches `add-i18n-screen` against the request, **pulls that skill's full body in**, and follows the checklist. As it writes the component, it also pulls the `design-system` skill because styling is involved. Each file write triggers the **PostToolUse hook** that runs the formatter — files come out clean automatically.

When the dev says "review what you just wrote," the agent **delegates to the code-reviewer subagent**. The subagent spins up in its own context, runs `git diff`, evaluates against the preloaded `component-review` skill, and returns one clean summary. The main conversation never sees the messy diff — just the verdict.

The dev later asks "show me everywhere we handle notifications across the codebase." The agent **spawns the codebase-explorer subagent**, which reads 30 files in its own isolated window and returns a one-paragraph map. Your main context stayed clean for the actual building work.

If the agent ever tries to run something dangerous — `rm -rf` outside the project, a force-push, a write to `.env` — the **PreToolUse hook intercepts and blocks it deterministically**. Not "Claude decided not to." *Could not.*

And every teammate, after running `claude plugin install our-team-kit` on a new repo, gets all of the above identically. No tribal knowledge. No "did you set up the hooks?" Slack threads.

## The Principal's actual principles

Strip away the syntax and what makes this a *Principal-level* setup is four habits worth more than any specific config:

**Each layer does only what it's best at.** Don't put enforcement in CLAUDE.md ("never edit .env" is a wish there — a hook makes it real). Don't put workflows in CLAUDE.md when they belong in skills. Don't make a subagent for a tiny task — the overhead exceeds the benefit. Match the tool to the problem.

**Context is a budget, spend it deliberately.** CLAUDE.md under ~200 lines. Skills with sharp, non-overlapping descriptions. Heavy reading delegated to subagents so the main thread stays clean. Every line you add somewhere costs you somewhere else.

**Earn each layer.** Don't build a plugin on day one. Don't write twenty skills hoping the matcher figures it out. Start with CLAUDE.md, let real pain points reveal which skill or hook you need next, and grow into the stack.

**Make the setup teach itself.** A new developer should be able to read your CLAUDE.md and the names of your skills and understand how the team works. Your agent configuration is now part of your documentation. If a teammate has to ask "what does this hook do?", you've under-commented it.

---

Now, your turn — because the best way to know you've absorbed this is to apply it. Pick one of these and walk me through your thinking:

Either: **propose one skill, one hook, and one subagent you'd add to *your actual current project*** (the Coach Dashboard or the Sampoerna admin UI), and tell me what specific pain each one removes.

Or, if you want to test the underlying principle: **explain in your own words why you'd put "never hardcode hex colors" in CLAUDE.md but also write a hook for it — what's each one doing that the other can't?**

Pick whichever feels more useful to you and I'll work through it with you.

**You:** in the project i mean you as a leader who lead the project from A to Z and make all decision on tech, all changes need your approval before it goes to git.

**Claude:** Ah — *that* changes the question entirely. You're not asking "how do I configure the layers." You're asking: **if I'm the Principal who owns this project end-to-end and nothing ships without my sign-off, how do I configure Claude Code to be my deputy?**

That's a much sharper problem. And it's worth pausing here, because I want to teach this one through your own thinking rather than just hand you my setup. The reason: a Principal-as-gatekeeper setup is a *governance design*, not a tooling design — and governance design always reflects the designer's values about trust, speed, and risk. My answer would be one Principal's answer. The interesting work is figuring out *yours*.

So let me ask you a few questions first. Not because I don't have an answer ready — I do — but because the answer changes dramatically based on what you say, and I'd rather build it *with* you than hand you a template that might not fit.

## The questions a Principal asks themselves before configuring anything

**First: when you say "all changes need my approval before they go to git" — where exactly is the approval gate?** There are three plausible answers and they lead to very different setups. Is it (a) the agent can't even *write to your working directory* without you approving each edit, (b) the agent can write freely but cannot stage or commit anything without you, or (c) the agent can commit to local branches but cannot push? Each of these is a real choice some Principals make. The first is paranoid and slow but safe; the second is the common middle ground; the third trusts the agent up to the point where other humans see the work. Which one matches how you actually want to work?

**Second: what's the failure mode that scares you most?** Be honest with yourself. Is it the agent silently shipping bad code? Is it the agent burning through expensive model calls on the wrong work? Is it the agent doing something destructive (deleting files, mangling git history, leaking secrets)? Is it the agent making architectural decisions you disagree with and then everything downstream is built on that choice? The layers you lean on differ. Fear of destruction → hooks do the heavy lifting. Fear of bad architecture → subagents and skills do, because the work is in the thinking. Fear of cost → model choice and tool restrictions matter most.

**Third — and this is the one most people skip: are you the only developer, or are there others who will also use this setup?** If you're solo, the agent's "approval gate" is just you reviewing diffs in your terminal — lightweight, conversational. If there's a team, "your approval" means something more formal — pull requests, codeowners, maybe even hooks that *block the agent from pushing to branches only you own*. The setup mutates significantly between these two worlds.

I genuinely don't want to guess on these. Take a minute and tell me where you land — even partial answers help. "I'm solo, the scary thing is destructive commands, and I want the agent to write freely but never commit" is a complete enough answer for me to design the rest around.

## What I can say without your answers

While you're thinking, here's the *shape* of the answer regardless of how you answer those questions, so you have something concrete to react to.

The Principal-as-gatekeeper pattern has a name in the agent world worth knowing: it's called a **human-in-the-loop** configuration, and its defining property is that *the agent's autonomy is bounded by checkpoints you control*. The five layers don't change — but the *emphasis* shifts dramatically. In a normal setup, CLAUDE.md and skills do most of the work. In a gatekeeper setup, **hooks become the most important layer by far**, because hooks are the only mechanism that can *guarantee* the agent stops at your checkpoints rather than reasoning its way past them.

Concretely, in a gatekeeper setup you'd see things like a `PreToolUse` hook on any Bash command matching `git commit`, `git push`, or `git merge` that *always* exits with code 2 and prints "Principal approval required — paste the change for review first." The agent literally cannot commit. It can write, edit, propose, explain — but the gate is physics, not politeness.

You'd see a `permissionMode` set so that file edits require interactive approval each time, or a hook that intercepts every Write/Edit and routes it through a diff-preview step. You'd see subagents used aggressively, because subagents do their messy exploration in isolation and return only a *summary you can read in 30 seconds and approve or reject*, rather than dumping work into the main thread where you have to scroll through everything.

You'd see CLAUDE.md include a section that's almost a contract: "You are working under Principal review. Before any commit, present a unified diff and a one-paragraph rationale. Wait for explicit approval. Never bypass this even if asked to 'just do it.'" That instruction won't enforce itself — the hook does that — but it shapes the agent's *posture* throughout the conversation. The two work together: the prompt teaches the agent how to behave, the hook ensures it can't misbehave.

You'd see a single approval skill — something like `/approve` — that you invoke when you've reviewed a proposed change. The skill's body is the actual workflow: stage the files, run the full test suite, format, commit with a structured message, push to the appropriate branch. The agent doesn't get to *decide* to commit; you give the explicit signal, and the skill handles the mechanics consistently.

You'd lean hard on subagents for anything investigative, because a Principal's time is the bottleneck and you cannot afford to read 40 files worth of exploration output. Every "go figure out X" gets delegated, summarized, and returned in a digestible form. Your main session becomes a *decision-making surface*, not an execution log.

And plugins almost don't matter in a solo gatekeeper setup — but they matter enormously if you're leading a team, because then you're not just gating your *own* agent, you're distributing a *team policy* that gates everyone's agent the same way. The plugin becomes how you enforce governance at scale.

## The principle underneath all of this

Here's the idea I really want you to take away, because it generalizes far beyond Claude Code: **autonomy and checkpoints are inversely proportional, and you have to pick deliberately**. An agent with no checkpoints is fast but dangerous. An agent gated at every step is safe but slow enough that you might as well do the work yourself. The Principal's craft is choosing *where exactly* the checkpoints sit so the agent is autonomous in the cheap, reversible parts and gated in the expensive, irreversible parts.

For your case: writing code is cheap and reversible — let the agent be autonomous. Committing to git is the first irreversible step (history changes, others might pull) — gate it. Pushing to main is more irreversible still — gate harder. Deploying is most irreversible of all — gate hardest, possibly require a *second* signal beyond your normal approval.

The five layers map cleanly onto this gradient. CLAUDE.md tells the agent the philosophy. Skills give it the workflows for both autonomous *and* gated steps. Hooks enforce the gates. Subagents keep your main thread clean enough that you can actually *do* the reviewing. Plugins propagate the whole policy to teammates if any exist.

---

So — back to you. Answer those three questions however completely you can (the gate location, the failure you fear most, solo or team) and I'll design a setup that's specifically *your* gatekeeping pattern, not a generic one. Or, if you'd rather, pick one piece of the shape I sketched above and ask me to go deep on it — like "show me exactly what the commit-gating hook looks like" or "walk me through what the `/approve` skill's body would contain." Either path works; I just don't want to write you a beautiful template that turns out not to match how you actually want to lead.

Which way would you like to go?

**You:** ok, now how i configure all the layer in side a project ? from layer 1 to layer 5

**Claude:** Hold on — I notice your "Advanced Research" mode is turned on, which would normally send your question off to a multi-minute web research task. For *this* question, that's the wrong tool. You're not asking me to research something on the web; you're asking me to walk you through configuration steps for the project we've been discussing all conversation. That's a teaching task, not a research task. So I'm going to answer directly — but heads up that you may want to toggle research mode off for follow-ups like this one, otherwise every reply will spin up the heavy machinery unnecessarily.

Now — your question.

Before I write commands, I want to do something that might feel slow but will save you hours later: I want you to *predict* the structure before I show it. You already know more than you think. You've seen all five layers in detail. You know where CLAUDE.md lives, where skills live, where agents live. So let me ask you to build the mental scaffold first, and I'll fill in only the parts you don't have yet.

## A question to set you up

Picture you just opened your project folder in your terminal — say `~/projects/coach-dashboard/`. You're about to set up all five layers *for this project specifically*. Before I write a single command, answer this in your head:

**Which folder, inside your project, will hold the configuration for layers 1 through 4?** You've seen the answer in every doc snippet I've shown you. There's a single hidden folder that's the root of all project-level Claude Code configuration. Can you name it?

…

It's `.claude/` — the hidden folder at your project root. That's the entire convention. Layer 1 lives at `.claude/CLAUDE.md`. Layer 2 lives at `.claude/skills/`. Layer 3 (hooks) is configured in `.claude/settings.json`. Layer 4 lives at `.claude/agents/`. Layer 5 wraps the whole thing for distribution. *Everything* lives under one folder. Once you see that, the setup stops feeling like five separate systems and starts feeling like one tree.

So before I show you commands, here's the picture in your head of what we're building toward:

```
coach-dashboard/
├── .claude/
│   ├── CLAUDE.md                    ← Layer 1
│   ├── settings.json                ← Layer 3 (hooks config)
│   ├── skills/                      ← Layer 2
│   │   ├── design-system/
│   │   │   └── SKILL.md
│   │   └── add-i18n-screen/
│   │       └── SKILL.md
│   ├── agents/                      ← Layer 4
│   │   ├── code-reviewer.md
│   │   └── codebase-explorer.md
│   └── hooks/                       ← Layer 3 (the scripts hooks call)
│       ├── pre-tool-use.sh
│       └── post-tool-use.sh
├── src/
├── package.json
└── ... (your normal project files)
```

Hold that picture. Now we walk through it.

## Step zero — the prerequisites

Before any layer, you need Claude Code installed and the project initialized. I'll assume you've got Claude Code already since you've been using it. If you don't, the install is a one-liner `npm install -g @anthropic-ai/claude-code` and then `claude` from any folder launches it.

From your project root, the very first thing I'd actually run is:

```bash
mkdir -p .claude/skills .claude/agents .claude/hooks
```

That creates the empty scaffolding so we can fill it in order. Now we go layer by layer.

## Layer 1 — Create CLAUDE.md

You have two ways to do this. The lazy way is to launch Claude Code in your project and type `/init`. The agent will read your codebase and propose a draft CLAUDE.md for you. It's a decent starting point but you'll always want to edit it down — the auto-generated version tends to be verbose.

The deliberate way, which I recommend for a Principal-led project, is to write it by hand. Create the file:

```bash
touch .claude/CLAUDE.md
```

Open it in your editor and write something like what I sketched in the previous message — the stack, the non-negotiables, where things live, pointers to skills. Keep it under 200 lines. Be ruthless. If you find yourself writing "and also...", ask whether that "also" belongs in a skill instead.

A small thing worth knowing: CLAUDE.md changes take effect on the *next* session. The file is loaded once at startup. So edit, save, then restart Claude Code (or start a fresh session) to see it apply.

**Quick check for you before we move on:** if you wanted a rule that applies to *every* project you ever work on — not just this one — where would it go instead? You've seen this before. Take a guess.

…

It would go in `~/.claude/CLAUDE.md` — your home directory, not the project. That's the global layer. Both files load together; project rules layer on top of global ones. You usually only need the project one when starting out.

## Layer 2 — Create your first skill

Skills are folders, not single files. That's the most common beginner mistake — people try to make a skill called `design-system.md` floating in the skills directory. Won't work. Each skill is its own subfolder containing a `SKILL.md`.

So:

```bash
mkdir -p .claude/skills/design-system
touch .claude/skills/design-system/SKILL.md
```

Inside `SKILL.md`, you write frontmatter just like a subagent — the YAML block fenced by `---` — and then the body. The structure looks like this:

```markdown
---
name: design-system
description: Use when creating or modifying any visual component, styling, color choices, or Tailwind classes. Covers the project's design tokens, OKLCH color ramps, Tailwind v4 @theme inline setup, and approved component patterns for buttons, tables, modals, and forms.
---

# Design System

## Color tokens
Primary red: var(--color-primary)  /* #CD0005 */
Primary light: var(--color-primary-light)  /* #F5C5C6 */
...

## How to use them in Tailwind v4
[examples]

## Approved patterns
[worked examples of correctly themed components]
```

Notice the description does the heavy lifting — it lists the *situations* that should trigger it ("creating or modifying any visual component"). That's what the agent matches against. A description like "design system stuff" would barely trigger at all.

You repeat this for each skill. Make one for `add-i18n-screen`, one for `component-review`, whatever else your project needs — but resist making too many at once. Start with two or three, see what the team reaches for, and grow.

To verify a skill is loading correctly, open Claude Code in the project and type `/skills`. It'll list every skill it knows about. If yours isn't there, it usually means either the folder structure is wrong (no `SKILL.md` inside the named folder) or the frontmatter is malformed.

**Question for you:** if you wrote a skill but it never seems to trigger when you'd expect it to, what's the single thing you'd edit first to fix it? Think about the matching mechanism we discussed.

…

The description. Always the description. The body of a skill is what runs once it triggers; the description is what makes it trigger in the first place. Most "my skill doesn't work" problems are description problems.

## Layer 3 — Configure hooks

This is the trickiest layer to set up because it has two parts that have to agree with each other: a configuration in `.claude/settings.json` that says *when* hooks fire, and one or more *scripts* that say *what* happens when they do.

First, create the settings file:

```bash
touch .claude/settings.json
```

Inside, you write JSON that registers your hooks. Here's a minimal example with two hooks — one that blocks dangerous bash commands, one that runs a formatter after edits:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/guard-bash.sh"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/format-changed.sh"
          }
        ]
      }
    ]
  }
}
```

Read that structure carefully. The top level is `hooks`. Inside it, each *event name* (`PreToolUse`, `PostToolUse`) gets a list. Each entry in that list has a `matcher` — the tool name or pattern that triggers it — and a `hooks` array of actual commands to run. The pipe in `Write|Edit` is a regex OR — fires on either tool.

Now you create the actual scripts. For example:

```bash
touch .claude/hooks/guard-bash.sh
chmod +x .claude/hooks/guard-bash.sh
```

Inside that file:

```bash
#!/bin/bash
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Block destructive commands
if echo "$COMMAND" | grep -E 'rm -rf (/|~|\$HOME)' > /dev/null; then
  echo "Blocked: destructive rm outside project" >&2
  exit 2
fi

# Block commits without approval token
if echo "$COMMAND" | grep -E '^git (commit|push|merge)' > /dev/null; then
  if [ ! -f ".claude/.approval-token" ]; then
    echo "Blocked: git operations require Principal approval. Present changes for review first." >&2
    exit 2
  fi
fi

exit 0
```

There's a *lot* going on in those few lines worth understanding rather than copying. The script reads JSON from standard input — that's how Claude Code passes the hook the details of what's about to happen. The `jq` tool extracts the actual command being run. Then there are checks; if any matches, the script exits with code 2, which is the magic number that *aborts* the action and feeds the error message back to the agent. Exit code 0 means "proceed as normal." That's the entire protocol.

The `format-changed.sh` script would be similar but simpler — it runs after the edit, so it just runs your formatter against the file that was changed, no blocking needed.

**Sanity check for you:** what would happen if you wrote a hook script but forgot to `chmod +x` it? Trace it through.

…

The hook wouldn't execute — the OS would refuse to run a non-executable file — and you'd see a confusing failure message about the command not running. This is the single most common mistake when writing your first hooks. Always chmod.

A final note on hooks: like CLAUDE.md, hook changes apply on session restart. And `settings.json` syntax errors will *silently* prevent your hooks from registering, so validate the JSON if something isn't firing.

## Layer 4 — Create subagents

You already saw this in detail last message, so I'll be brief here. Each subagent is a single Markdown file in `.claude/agents/`:

```bash
touch .claude/agents/code-reviewer.md
```

Inside:

```markdown
---
name: code-reviewer
description: Use proactively after any code changes to review for design system adherence, accessibility, i18n coverage, and team conventions. Read-only.
tools: Read, Grep, Glob, Bash
model: sonnet
skills:
  - component-review
---

You are a senior code reviewer for this project.

When invoked:
1. Run `git diff` to see recent changes
2. For each modified file, check against the component-review skill's checklist
3. Report findings organized by priority: critical, warnings, suggestions
...
```

Notice the `skills:` field — it preloads your `component-review` skill into the subagent's context at startup. The subagent comes online already knowing the checklist. That's the composition pattern.

The interactive shortcut for all of this is to run `/agents` inside Claude Code, which walks you through every choice and generates the file. I'd actually use `/agents` for your *first* subagent so you see the file it produces, then hand-write subsequent ones once the format is familiar.

Subagents created through `/agents` take effect immediately. Hand-written files require a session restart.

## Layer 5 — When (and only when) you're ready, package as a plugin

For a single project led by you, **you do not need to do this yet**. I want to say that plainly because the temptation to over-engineer is real. Plugins exist to *distribute* your setup to other repos or teammates. If you're the only user of one repo, the four layers we just set up *are* your complete configuration. Plugins add nothing.

You'd reach for Layer 5 when one of two things happens: a teammate joins and needs the same setup, or you start a second project that should follow the same standards. At that point you create a `plugin.json` manifest that declares the bundle, point it at the relevant skills, agents, hooks, and commands, and publish it to a marketplace your team can install from. The mechanics are real but the official plugin docs are the right place to learn them once you've earned the need.

The Principal's instinct here is restraint: ship the project first, *then* package what proved valuable.

## Verifying the whole setup

Once layers 1–4 are written, here's the smoke test sequence I'd run from your project root:

```bash
claude          # launch Claude Code in the project
/memory         # confirms your CLAUDE.md loaded
/skills         # lists discovered skills
/agents         # opens the agent management UI
```

Each of those commands gives you a window into one layer. If CLAUDE.md isn't showing your rules, the file isn't where Claude Code expects it. If a skill is missing from `/skills`, the folder structure or frontmatter is wrong. If a subagent is missing from `/agents`, same drill.

For hooks, the verification is behavioral: ask the agent to run a `git commit` and confirm it gets blocked by your guard. If it goes through, your hook isn't firing — usually a chmod issue or a path issue in `settings.json`.

## The order I want you to internalize

Here's the meta-lesson, because it's the real thing I want you to leave with. The order I just walked you through — CLAUDE.md, then skills, then hooks, then subagents, then maybe plugins — isn't arbitrary. It's the order of **trust and investment**. CLAUDE.md is the cheapest thing to write and gives the biggest immediate benefit. Skills are next because they encode the workflows you find yourself explaining repeatedly. Hooks come third because by then you've noticed which rules the agent keeps softly violating, so you know exactly which ones need hardening. Subagents come fourth because you can only see what's polluting your main thread once you've been *using* the setup for a bit. And plugins come last because you only know what's worth packaging after you've lived with it.

If you ever feel tempted to set up everything at once on day one, resist. The setup is better when each layer is added in response to a real pain you observed, not a hypothetical one.

---

Now, your turn — and this is the exercise that locks it in. Pick one of these and walk me through what you'd actually do:

Either: **describe in your own words what would go in the `.claude/` folder of *your* Coach Dashboard project right now, today, if you set it up.** Don't write the files — just tell me which subfolders you'd create, which skills you'd start with, which hook you'd write first. Tell me *why* each one earns its spot.

Or: **start typing the actual files**, open your terminal, run the `mkdir` and `touch` commands above in your real project, and tell me where you get stuck. I'll debug with you.

Either path teaches. Which sounds more useful to you right now?

**You:** can all that 5 layer applied to another AI model providers like Qwen, Deepseek, Kimi, Minimax or anything else ?

**Claude:** Great question — and one that gets at something deeper than it first appears. Before I answer, I want to verify some current details because the AI agent tooling landscape changes monthly, and I'd rather teach you with accurate facts than guess. Give me a moment.

Beautiful question — and the answer has a twist that I think you'll enjoy. Let me set you up to discover the twist yourself rather than handing it to you.

Before I tell you what's possible, I want you to do a piece of thinking. You've been calling this thing "the 5-layer Agent Development Kit" the whole conversation. But pause for a moment: **is it one thing, or two things wearing the same name?**

Here's what I mean. When you create `.claude/CLAUDE.md` and `.claude/skills/design-system/SKILL.md`, two different things are happening at the same time. One is **the idea** — "a project should have always-loaded rules, on-demand knowledge folders, deterministic guardrails, isolated workers, and a packaging format." The other is **the implementation** — Claude Code's specific filenames, the exact YAML frontmatter fields, the `.claude/` folder convention, the precise hook event names like `PreToolUse`.

So before I answer "can it work with Qwen or DeepSeek or Kimi," ask yourself this: **which of those two things is your question actually about?** Because the answer is different for each. Take a guess at the split before reading on.

…

Here it is. **The idea is universal. The specific files are Claude-shaped.**

If you take your `.claude/CLAUDE.md` file and try to hand it to Qwen's API directly, nothing happens — the API is just a model endpoint; it doesn't know what `.claude/` means or how to load skills on demand. The folder structure, the hooks system, the way descriptions get matched against tasks — all of that is *Claude Code the application* doing the work, not the underlying model. The five layers aren't a feature of "AI"; they're a feature of the tool wrapping the AI.

But here's the twist — and this is the part worth knowing because it changes how you see the whole landscape. **The pattern has become so good that other tools have copied it almost wholesale.** Let me show you what I just found, because this surprised even me.

The closest example: Qwen Code is an open-source AI agent that lives in your terminal with rich built-in tools (Skills, SubAgents) for a full agentic workflow and a Claude Code-like experience. That's from Alibaba's own README. They didn't just build a CLI for their Qwen models — they explicitly modeled it on Claude Code's structure, with the same Skills and SubAgents concepts. And it's model-agnostic: it supports multiple LLM providers including OpenAI, Anthropic, and Google Gemini, with first-class support for Qwen models. So your conceptual knowledge of how to set up the layers transfers directly — you'd still write skill files with frontmatter, still define subagents the same way, just inside Qwen Code's folder convention instead of Claude Code's.

This isn't an isolated case. There's a whole emerging category of "Claude Code-shaped" alternatives that work with whichever model you want:

There's openHarness, an open-source Claude Code alternative with 78 slash commands, 42 tools, MCP support, hooks, subagents, plan mode, that works with Anthropic, OpenAI, Ollama, llama.cpp, and LM Studio. There's Crab Code, a Rust-native agentic coding CLI aligned with Claude Code's toolset and permission model that works with any LLM provider including Anthropic, OpenAI, DeepSeek, Bedrock, and Vertex. There's Warp 2.0, a terminal with agent runtime that has added Kimi K2.5, MiniMax, and Qwen support via an auto-routed open model option. And LangChain has built deepagents-CLI which now supports Anthropic's agent skills, enabling it to utilize a wide array of public skills with a skills folder where skills are progressively disclosed — only the YAML frontmatter is loaded by default.

See what's happened? The exact same SKILL.md format — frontmatter for routing, body for content, progressive disclosure — is being adopted across the ecosystem. The pattern won. The implementations are converging on it.

So now let me give you the practical answer to your real question, which I think is something like *"I learned this on Claude — does my knowledge transfer if I switch model providers?"*

**Yes, your conceptual knowledge transfers fully.** You understand always-loaded context versus on-demand knowledge versus deterministic enforcement versus isolated delegation versus packaging. That mental model works in any agentic coding tool. Switching to Qwen Code or openHarness or Crab Code, you'd recognize the structure immediately — only the folder names and exact frontmatter fields would differ, and those are skimmable from each tool's docs in twenty minutes.

**But the specific files do not transfer.** Your `.claude/` directory is a Claude Code artifact. To get the equivalent setup running on Qwen or DeepSeek or Kimi, you pick the tool that supports both your desired model *and* the layer pattern, then recreate your skills and agents in that tool's convention. Qwen Code is probably the smoothest path because it's the closest copy and supports the broadest model set.

There's a deeper principle worth absorbing here, because it'll serve you for years past this specific question. **When a design becomes the standard, the labor cost of switching tools collapses.** Five years ago, learning one AI coding tool meant nothing for the next. Today, learning the five-layer pattern means you can sit down at any modern agentic CLI and be productive within an hour, because they all roughly agree on what a skill is, what a subagent is, what a hook is. You're not learning *Claude Code* — you're learning *agentic development*, and Claude Code happens to be where you picked it up. That's a much more durable investment.

---

Here's a question to check it's clicked. Imagine someone on your team says: "I want to use DeepSeek's model because it's cheaper, but I want all the structure we built — the design-system skill, the code-reviewer agent, the lint-on-edit hook. Do I have to throw away what we built?" How would you answer them — what's transferable and what isn't, and what's the rough plan?

Take a swing at that and I'll tell you how close you are. If you want, I can also walk you through Qwen Code's specific folder structure as a concrete second example so you can *see* the parallels — that often makes the "the pattern is portable" claim feel less abstract.

**You:** can you search session on my claude code about agent development kit ?

**Claude:** Yes — found several past sessions where you've worked through Agent Development Kit material. Here's what's there:

**The most directly relevant two:**

[Claude.md vs skills vs subagents](https://claude.ai/chat/4aadc131-4657-4d27-89b5-9a04a37b40fd) — June 18. This one's the deepest. You were working through Anthropic's Skilljar training and used the conversation to nail down the Skills-vs-Subagents distinction. The mental model you landed on was that they're "siblings serving the same domain but invoked differently" — Skills inject knowledge into the same context window, Subagents spawn a separate instance with isolated context. You also caught me on a file-structure error (`.claude/commands/` vs `.claude/agents/`) and we landed on the summary: *Skill = what to know, Subagent = what to do, as whom, and what to return.*

[Understanding LoC in Claude teams](https://claude.ai/chat/02f67cb9-03b0-45a5-a1c1-991a15a5a1ba) — June 17. Started on the Lines of Code metric but pivoted into custom slash commands and the `.claude/commands/` directory. Notable conclusion: `.claude/skills/<name>/SKILL.md` is the modern preferred format over the legacy commands directory.

**Tangentially related:**

[Website accessibility check (skills.sh)](https://claude.ai/chat/3e9aab8b-064f-4dd0-bedb-14d27f771f6d) — June 6. You had me fetch skills.sh, the Vercel Labs open directory of agent skills. We looked at the leaderboard — 682K skills tracked, Anthropic's official skill set (`frontend-design`, `skill-creator`, `pptx`, `pdf`, etc.), Microsoft Azure family, obra's `superpowers` workflow skills, and packs from Supabase, Firebase, Sentry, Shadcn. Useful as a "what's the ecosystem" snapshot.

[Jetson Orin Nano setup requirements](https://claude.ai/chat/cf806f5e-cdd4-4909-bbc6-c425395b6d7d) — June 6. Mostly hardware (you were evaluating the Jetson kit for local inference), but the summary notes the conversation referenced your prior ADK work, subagent patterns, SKILL.md authoring, and cross-provider portability.

---

So your ADK learning thread has been: *Skilljar foundations* → *Skills vs Subagents* → *custom commands & skills directory* → *ecosystem exploration via skills.sh* → and now, in this current session, *the five layers as a unified system + how it ports to other model providers.* You've actually been building this picture in pieces over several weeks.

Want me to pull any of those open and dig into a specific thread further? The Skills-vs-Subagents one in particular has some good material worth revisiting if you want to deepen on Layer 2 and Layer 4 specifically.

**You:** i gat a task to make a sharing session about this Agent Development Kit, and i just say to claude code to make a PPT about it 
but i still it need some adjustment or more content

**Claude:** You said the deck "needs some adjustment or more content" — let me first read what Claude Code actually built so I'm giving you concrete improvements rather than guessing. Let me read the presentation skill and then open your file.

Now let me open the actual presentation Claude Code built, so I can see what's there and what's missing.

Let me see how it actually looks visually, not just the text, before I assess it.

Okay — I've read the whole deck and looked at how it renders. Here's my honest assessment, and then I want to ask you a couple of things before I start changing it, because the *right* additions depend on who you're presenting to.

First, the good news: **this is a genuinely solid deck.** Claude Code did better than most. The dark-title / light-content "sandwich" structure is right, the five-color motif (red→gold→orange→blue→purple) carries consistently across every slide and ties back to the original infographics, the narrative arc is sound (story → shift → model → five layers → tool-agnostic → how to use → example → outcomes → adopt), and the comparison table and stat callouts are clean. You could present this as-is and it would land fine. So we're polishing and extending, not rescuing.

Now the issues I'd want to fix, in priority order.

**One real accuracy problem.** Slide 14 ("A real example") shows 6 rules, 8 skills, 3 hooks, 7 subagents, 1 plugin. Those numbers don't match either plan you uploaded. Your actual opencode plan for SkillPass has *7 rules* (commands, architecture, naming, testing, code-style, database, security), *23 skills*, *6 subagents*, lefthook for hooks, and *no separate plugin* (committed files are the distribution). If someone in the room asks "which project is this?", the made-up numbers will trip you. We should either swap in the real SkillPass numbers or relabel it as an illustrative example.

**A few small AI-tells.** The stat cards on slide 14 have thin colored stripes along their top edge — that exact pattern (edge accent stripes on cards) is a known "this was AI-generated" giveaway. Minor, and arguably justified here as the layer-color motif, but easy to swap for a colored number or a small icon instead.

**The bigger opportunity — content gaps for a zero-knowledge audience.** The deck assumes the audience already knows what an AI coding agent *is*. It opens on "before: AI help was ad-hoc," but never grounds what Claude Code / opencode / Cline even are, or — crucially — explains the single idea that makes the whole five-layer design make sense: the **context window as a finite budget**. That's the "aha" that explains *why* skills load on demand and *why* subagents exist. Right now the deck shows the *what* of each layer beautifully but is thin on the *why*. It also never shows a real file — no actual `SKILL.md` or subagent definition on screen — and for engineers, seeing one concrete file is worth three conceptual slides. There's no live-demo placeholder and no "where to learn more" closing resource slide either.

Before I build, three quick questions so I add the right things rather than padding:

**You:** can you edit or make the slide in here ?

**You:** i want add more content about 

1. different subagent and skills
2. workflow how to use the agent development kit
3. remove the skillpass content and remove
4. add this project structure 

```markdown
```
.claude/
├── .claude-plugin/
│   └── plugin.json
├── agents/
│   ├── agent-manager.md
│   ├── api-integrator.md
│   ├── bug-hunter.md
│   ├── code-reviewer.md
│   ├── i18n-checker.md
│   ├── planner.md
│   ├── route-builder.md
│   ├── security-reviewer.md
│   ├── test-runner.md
│   └── ui-ux-designer.md
├── commands/
│   ├── web-i18n-add.md
│   ├── web-new-route.md
│   ├── web-test.md
│   └── web-wire-api.md
├── hooks/
│   └── post-edit.mjs
├── rules/
│   ├── architecture-and-routing.md
│   ├── code-style.md
│   ├── commands-and-tools.md
│   ├── error-handling.md
│   ├── i18n.md
│   └── testing-and-tdd.md
├── settings.json
└── skills/
    ├── add-translation/
    │   ├── SKILL.md
    │   └── scripts/
    ├── code-review/
    │   └── SKILL.md
    ├── find-bugs/
    │   └── SKILL.md
    ├── frontend-design/
    │   ├── SKILL.md
    │   └── LICENSE.txt
    ├── new-feature-route/
    │   ├── SKILL.md
    │   ├── scripts/
    │   └── templates/
    ├── refactor/
    │   └── SKILL.md
    ├── security-review/
    │   ├── SKILL.md
    │   ├── LICENSE
    │   ├── infrastructure/
    │   ├── languages/
    │   └── references/
    └── wire-api/
        ├── SKILL.md
        └── templates/
```

**Claude:** On it. You've given me clear direction, so I'll make the edits directly. Quick summary of what I'm going to do, then I'll build it:

- **Remove** the SkillPass example (the fake-numbers slide) and the generic neutral tree, plus the opencode/SkillPass-flavored framing.
- **Add** your real `.claude/` project structure.
- **Add** a skills catalog (your 8 skills) and a subagents catalog (your 10 agents), with what each one does.
- **Add** a "skills and subagents are siblings" slide — your project pairs them beautifully (code-review↔code-reviewer, find-bugs↔bug-hunter, security-review↔security-reviewer, add-translation↔i18n-checker, new-feature-route↔route-builder, wire-api↔api-integrator). That's the exact concept you worked through before, shown with real files.
- **Add** a concrete workflow slide showing a real task flowing through the kit.

Let me read the build guide and then reconstruct the deck.

Let me check the original deck's exact dimensions and fonts so my rebuild matches.

The original is 13.33"×7.5" widescreen, Calibri throughout. Now I'll rebuild the deck with your real project baked in. Writing the build script:

Built. Now let me render it and visually QA the new slides and the ones most likely to have fit issues.

That structure slide is clean. Let me check the two catalogs, siblings, and workflow.

The new slides look great. Let me spot-check the model overview, agenda, and the table slide to confirm nothing regressed.

Everything renders cleanly — no overflow, no overlaps, consistent design throughout. The deck is ready. Let me put it in your outputs.

Done. The updated deck is 20 slides and ready to present. Here's what changed against what you asked for:

**Removed** — the SkillPass example slide (the one with the made-up 6/8/3/7/1 numbers) and the generic neutral file-tree slide, plus the SkillPass-flavored framing.

**Added** — five new slides built around your real project:

1. *What we actually built* — your `.claude/` tree, color-coded so each folder maps to its layer, with a legend on the right (rules→Memory, skills→Skills, hooks+settings→Hooks, agents→Subagents, .claude-plugin→Distribution, commands→slash triggers).
2. *Our 8 skills* — each with a one-line description and tags for the ones carrying scripts/templates or vendored from Anthropic.
3. *Our 10 subagents* — each with a description and a read/write permission tag.
4. *Skills & subagents are siblings* — the six pairings (code-review↔code-reviewer, find-bugs↔bug-hunter, security-review↔security-reviewer, add-translation↔i18n-checker, new-feature-route↔route-builder, wire-api↔api-integrator), plus a note on the stand-alone ones. This is the exact concept you'd worked through before, now shown with your real files.
5. *How a task flows through the kit* — a concrete 7-step workflow ("add a translated Notifications page") showing the planner, the slash-commands + skills, the post-edit hook, the review subagents, and your commit gate, each tagged by layer.

The agenda was updated to match, the layer-3 (Hooks) and layer-5 (Distribution) slides now mention `post-edit.mjs` / `plugin.json` so they line up with your actual setup, and the tool-agnostic slide picked up a line about the same idea running on Qwen/DeepSeek/Kimi via opencode or Cline — tying back to your portability question.

Two small things worth a look before you present: the workflow scenario ("Notification settings" page) is an illustrative example I picked — swap it for a real task your team did if you have one handy, it'll land harder. And the skill/subagent one-liners are my best read of what each does from the names; if any description is off (especially `agent-manager` and `ui-ux-designer`, which I inferred), tell me the correct framing and I'll fix it.

**You:** on the agents structure there is several agents
the usage are like this, the agent agent-manager will call another agents based on their task 
can you make workflow of it ?

**Claude:** Good clarification — so `agent-manager` is a *dispatcher*: it reads the task and routes to the right specialist. That's an orchestration pattern, and it deserves its own diagram. Let me add an orchestration slide to the deck showing agent-manager routing to the specialists, grouped by what they do.

Let me view the relevant part of the build script and insert the slide.

Now insert the orchestration slide before the workflow slide:

That's exactly the orchestration view — `agent-manager` as the dispatcher fanning out to the specialists, grouped by what they do, with the routing logic spelled out on the right.

Let me put the updated deck in your outputs.

Added as slide 16, "agent-manager runs the show" — placed right before the concrete task workflow, so the deck now flows: *here are the agents* (catalog) → *here's how they pair with skills* (siblings) → *here's how agent-manager coordinates them* (orchestration) → *here's a real task running through it all* (workflow).

The diagram shows `agent-manager` as the dispatcher at the top, routing down to four groups by what the work needs: **Plan** (planner), **Build** (route-builder, api-integrator, ui-ux-designer), **Review** (code-reviewer, i18n-checker, security-reviewer, bug-hunter), and **Test** (test-runner). The routing logic is on the right.

One thing I want to flag honestly, since you're going to present this and someone may ask. In Claude Code, a subagent can't itself spawn another subagent — there's no true nesting. So the way this actually executes is that `agent-manager` decides *who runs and in what order*, and the main session does the spawning of each specialist. I worded the small caption on the slide to reflect that ("each specialist runs as its own subagent — agent-manager directs the order") so the diagram stays accurate if a sharp engineer in the room probes it. If your setup works differently from that — for instance if `agent-manager` is something you run as the main orchestrating session rather than as a delegated subagent — tell me how you actually invoke it and I'll adjust the caption to match your reality.

Want me to add a short speaker note to that slide so you have a one-line talking point ready if the nesting question comes up?
---

*The remainder of this session continued after an automatic context compaction. User messages below are verbatim; assistant replies are reproduced from the working session and may differ slightly in wording from the on-screen text.*

---

**You:** [uploaded README.md — the apps/web agents workflow guide] here the workflow for agents

**Claude:** Used the real workflow to make the deck accurate. Reworked the orchestration slide (agent-manager as sole entry point, "never writes code," three real groups Plan&Design/Build/Verify with per-agent models, opus highlighted, routing = blueprint → keyword → ask). Added a new "Standard workflows / Blueprints" slide (6 sequential chains + 2 parallel, color-coded by group). Rebuilt the worked-example slide around the real Supervisor Approvals case (blueprint 1: planner → ui-ux-designer → route-builder → api-integrator → test-runner, then aggregate, then parallel pre-merge review). Fixed locales to id/en/ar. Rebuilt to 22 slides.

**You:** create me transcript for explain all content on PPT

**Claude:** Wrote a full speaker script (ADK-sharing-session-script.md): one block per slide, spoken-aloud voice, timing on each slide (~28–32 min total), delivery cues in brackets, callbacks woven through (the four outcomes mirror the four pains; "roles" flagged on the subagents slide to pay off at orchestration), plus an appendix of likely Q&A. Offered a 15-min version or embedding as speaker notes.

**You:** [uploaded IMG — "Claude Code Project Structure" cheatsheet] i have been read this image, an i compared with my current .claude/ folder

**Claude:** Verified the cheatsheet items against current docs. Framing point: CLAUDE.md/CLAUDE.local.md/AGENTS.md/.mcp.json live at repo root, outside .claude/, so their absence from your tree isn't a gap. You're already covered on rules/skills/commands/agents/hooks/settings, and ahead of the cheatsheet with .claude-plugin and agent-manager. Genuinely useful adoptions: settings.local.json (cheap), maybe .mcp.json. The memory/ and workflows/ folders are the author's conventions, not built-ins — skip them (auto-memory + your rules/ + agent-manager already cover them). CLAUDE.local.md is legacy.

**You:** then from your POV or from your thinking, whats the different between the folder memory and rules .

**Claude:** Rules are prescriptive, memory is descriptive. Rules say what *should* be true (written forward, to govern work); memory records what *is* true or what happened (written backward, to capture state). Test: delete the file — if the agent then does something *wrong*, it was a rule; if it just *rediscovers* something, it was memory. Constitution vs diary/meeting-minutes. Practical upshot: you don't need a memory/ folder — the real cross-session memory writes itself to ~/.claude/projects/, and rules/ holds your conventions. Only legit use for a committed memory/ is a deliberate decision log (ADRs).

**You:** i think because of memory, you claude doesn't need again read all files on the codebase, so i can use cache input for cheap price of AI API

**Claude:** Two separate cost levers being blended. (1) Fewer tokens — a memory summary substitutes for reading 40 files; you pay full price for less input. (2) Prompt caching — a cache hit costs ~10% of input, but it keys on an *identical prefix*, not on "reading fewer files." Memory helps caching because it's stable, front-loaded content; the enemy of caching is volatile content (ad-hoc file reads). Principle: stable stuff (memory, CLAUDE.md, rules, tools) at the front (cacheable), volatile stuff (current task) at the back. Caveats: in Claude Code caching is automatic; and cheap *wrong* context is still wrong — a stale cached summary is a trap.

**You:** based on structure of .claude/ folder above, what do you thing ? i want hear feedback, idea, or anything from you

**Claude:** Gave critique (from tree + README only, not file contents): (1) three doors — command/skill/agent for each capability; fine if steps live in one place, liability if restated. (2) routing gets harder as roster grows (overlapping bug-hunter/code-reviewer/security-reviewer; registry hand-maintained). (3) agent-manager is a single point of failure on sonnet — consider opus for just the routing step. (4) enforcement-shaped gaps — PostToolUse hook but no PreToolUse guard. (5) nothing tests the kit itself — a tiny routing eval would catch drift. Ideas: log which agents/skills fire + token cost; clarify the plugin's real status.

**You:** i'm happy to hear your feedback. First about three doors same destination, I aggree... [describes: in Claude Code a prompt calls skills directly, but in opencode you talk to agents — which ruins the concept between agents/skills/commands]

**Claude:** Reframe: they're not three competing answers, they're three different axes. Skill = the recipe (noun: the knowledge). Command = the doorbell (a trigger you type). Agent = the contractor (a worker with its own context/tools who applies the recipe). The one decision that resolves skill-vs-agent: does this need *isolation*? Every task is a skill at core; wrap it in an agent only when you want a separate context/tools/delegation. Rule that fixes drift: the steps live in the skill, nowhere else; agent and command files stay thin pointers. The cross-tool difference is expected: Claude Code is skill-first, opencode is agent-first, but both execute the same skill — that's your portable .agents/ design working, not failing.

**You:** maybe before you drive me into it, i want you to know about the content on my folder .claude oj my project

**Claude:** Agreed I'd been reasoning from the outside. Clarified I'd only seen the tree + README, not file contents. Asked for a high-signal slice: the route-building trio (command + skill + agent) plus agent-manager, optionally settings.json + post-edit.mjs.

**You:** i zip it all my .calude folder

**Claude:** The zip only contained rules/ (6 files) — the other folders were dropped (likely a gitignore-aware or partial zip). Reviewed the 6 rules files anyway: praised them (concrete, project-grounded, cross-reference skills, stale-doc guards, "document don't drive-by-fix" debt pattern). Real finding: intra-rules duplication — the typegen flow restated in 4 files, plus ~/→#/, no-console.log, mock-data-kept, never-edit-generated-types repeated across files. Lower-stakes than skill/agent drift but a maintenance cost; fix by extending the cross-referencing they already do. Asked for a re-zip with the other folders.

**You:** [uploaded _claude.zip] here the full .claude content

**Claude:** Read the route trio + agent-manager + api-integrator. Verdict on three doors: command is a clean thin doorbell ✓, skill is the source of truth ✓, but the **agent restates the skill** (route-builder duplicates steps 1–3/5 and the Rules block) — and it's systemic (api-integrator literally titles its steps "Steps (from the wire-api skill)"). Fix: thin the agent to a wrapper pointing at the skill, keeping only scoping + return contract. Also: agent-manager discovers agents dynamically (good) but hardcodes a lineup (drift) and README.md sits in agents/ (glob gotcha). And the plugin path (tools/web-adk/skills/…) vs .claude/skills/ suggests scripts exist in two places — the real duplication surface.

**You:** here the workflow for agents [note: agent-manager standalone review requested]

**Claude:** Gave a standalone review of agent-manager: praised the routing precedence (names → blueprints → keywords → ask), the "don't summarize specialist output" rule, sequential context-threading, partial-failure handling. Five fixes: (1) registry contradiction (glob vs hardcoded lineup) — make glob authoritative; (2) new agents discoverable but unreachable — add a description-based fallback step 5.5; (3) README.md glob landmine — skip files without name frontmatter; (4) keyword collisions — add a tiebreak; (5) blueprint 1/2 vs README worked-example mismatch on wiring — reconcile.

**You:** maybe you need another agents too on folder .claude/agents/ [asks to review the rest]

**Claude:** [This turned out to be the SECOND project.] Read all agents. Correction to self: the audit agents (bug-hunter, code-reviewer, security-reviewer) are exemplary thin wrappers — the duplication was only route-builder/api-integrator. Named standouts (security confidence-gating, planner no-placeholders, haiku on cheap agents). Main finding: documentation drift — README says i18n-checker=sonnet but file=haiku; blueprint 1 vs README worked example disagree; registry is a 4th copy. Suggested a roster-generator script (single source of truth from frontmatter).

**You:** honestly this agents are for opencode, i build a full project without using claude, because i want to try something different than using claude, because i know that claude is so powerful and i happy with it

**Claude:** No offense taken — smart way to learn the pattern vs the plumbing. Retracted two findings that were Claude-Code-specific: the .agents/.opencode path/Task-tool "bug" is correct for opencode; missing model: field is fine because opencode sets models in config. Findings that still stand (design, not harness): the three orphaned agents unreachable, the security-agent overlap, the SkillPass name. Asked how opencode felt to build on.

**You:** maybe i can give you how my setup for agents that opencode use it

**Claude:** Yes — asked for opencode.json (model mapping, mode, tool scoping) and any AGENTS.md/rules.

**You:** [uploaded _agents.zip — the full .agents/ folder] here my .agents/ folder

**Claude:** This changed the picture — it's a full tool-agnostic ADK (rules + skills + agents), and the skills layer I thought was missing is the biggest part (~90 files, superpowers ecosystem). Retracted the "missing skills" and "SkillPass name is stale" concerns. New finding: TWO orchestrators — agents/agent-manager.md (Task/blueprints) and skills/mimo-orchestrator/SKILL.md (actor/pattern-map). Asked which one actually fires.

**You:** forget the mimo-orchestrator, i need that because on mimo code they didn't recognize agents, they only knowing skills

**Claude:** That makes sense and is a clever shim — MiMo only understands skills, so you wrapped orchestration as a skill to dispatch agents through the one primitive it has. Retracted the "dual orchestrator conflict" — it's one concept ported to two dispatch models. Left mimo-orchestrator alone per your call. The two findings that still stand for opencode: thin the agents to point at skills, and route the three orphaned agents.

**You:** i know that like agent bug-hunter are like skill find-bug and code-reviewer→code-review, security-auditor→security-review, because i create the agents syntesize the skills, so the agents no needed read skills anymore

**Claude:** Legitimate design choice — synthesis (compile the skill into the agent) trades runtime freshness for self-containment. Dropped the "point at the skill" advice for those. Named the one tradeoff: two representations, no link, so pick an explicit source of truth or they'll drift. The two things that still stand regardless of synthesis: the three orphaned agents are unreachable, and agent-manager here has the same duplicate-intro-step bug. Offered to fix both.

**You:** yes please, i know the agents still need tobe update or adjustment, then i want you help me to improve that

**Claude:** Patched the opencode agent-manager.md: fixed the duplicate intro step (3 & 4 collapsed), and routed the three orphaned agents (product-owner, product-researcher, technical-writer) — keyword rows + blueprints 6/7/8 chaining researcher→owner→planner→scaffolder→test-runner→writer, plus extended classification. Left mimo-orchestrator untouched. Flagged that MiMo still can't route those three.

**You:** for the agents technical-writer.md, do have comments ?

**Claude:** Yes — it's a strong file but the least project-grounded in the roster (generic templates that'd drop into any repo). Its Research Mode section is the good part but it's buried and optional-sounding. The description claims documentation/kb-article/content-strategy skills that aren't in your skills/ folder. Smaller notes: format-collision risk, no git-log step for changelogs, 170 lines mostly boilerplate (best candidate to be a skill). Offered to rewrite it project-specific.

**You:** do you need something before you go ? like project readme or anything

**Claude:** Asked for the root AGENTS.md/README (to verify agents match reality), opencode.json (to confirm model/scoping), and one real docs/ example — but noted none were strictly needed and it was a fine stopping point.

**You:** [uploaded AGENTS.md + README.md] here

**Claude:** Now I could confirm the agents' conventions match reality (JWT middleware, camelCase, go-jet, api() wrapper all real). Found a genuine bug: react-scaffolder and ui-ux-designer disagree with the project — ui-ux-designer tells the agent to invent bold/maximalist aesthetics, but the project mandates Tailwind v4 + DaisyUI 5, zero custom CSS, follow DESIGN.md. Flagged that as the fix-first item. Offered to fix the two scaffolders + rewrite technical-writer with the real API/Swagger conventions.

**You:** [uploaded DESIGN.md] here the DESIGN

**Claude:** The smoking gun — DESIGN.md and ui-ux-designer are in direct philosophical opposition (consistency-over-creativity vs "BOLD aesthetic"; zero custom CSS vs CSS variables; fixed Outfit/Fira Code vs "invent unique fonts"; no shadows vs "dramatic shadows"). Rewrote both: ui-ux-designer flipped to compose-the-system (DaisyUI semantic tokens only, container-width ladder, shared Form* components, Storybook-first, DESIGN.md as named source of truth), react-scaffolder aligned to the real pages/<page>/index.tsx structure and api() conventions. Kept them self-contained but pointed at DESIGN.md so they can't drift.

**You:** where is my technical-writer ?

**Claude:** Clarified the rewrite wasn't done yet — only reviewed. Then you meant the original file from the .agents zip.

**You:** the technical-writer.md what i mean are from folder .agents/agents that i give you before

**Claude:** Right — displayed your original technical-writer.md in full and confirmed the review points (generic METHOD /path/to/resource templates, buried Research Mode, phantom skills). Offered the rewrite.

**You:** ye

**Claude:** Rewrote technical-writer.md SkillPass-specific: Research Mode promoted to mandatory Step 1 (read the real docs/ library first), API docs point at the auto-generated Swagger (bun run api:generate → server-go/docs/swagger.json) instead of hand-writing endpoints, real conventions baked in (/api/v1/... Gin groups, camelCase, AuthRequired/RequireRole), changelog wired to git log + conventional commits, phantom-skill clause dropped.

**You:** export this session

**Claude:** Explained I can't export the raw chat myself (no such tool) — that's the in-app export button — but offered a decision-log summary or a file changelog, and noted all deliverables are already in outputs.

**You:** /chat-copy and zip all final file

**Claude:** Ran the chat-copy skill (this document) and bundled every final deliverable into a single zip.

**You:** *(a few stray single-character messages — "m", "]", "mm" — sent by accident; Claude noted they looked accidental and waited.)*

**You:** in the begining of this chat we have 5 layer agent dev kit right ?

**Claude:** Confirmed — the core teaching was the **five-layer model**: (1) Memory (CLAUDE.md + rules, always loaded), (2) Skills (SKILL.md, on-demand), (3) Hooks (deterministic scripts), (4) Subagents (delegated workers with their own context), (5) Distribution (plugin/bundle). Distinguished it from the separate `/ultraplan` `/goal` `/ultrareview` cloud commands, which aren't part of the five layers.

**You:** [uploaded the ADK infographic] because on the begining chat i uploaded this

**Claude:** Confirmed the image matched — five layers exactly as recalled, with the bottom flow "CLAUDE.md sets rules → Skills provide expertise → Hooks enforce quality → Subagents delegate work → Plugins distribute to team." Noted the two side-rails (MCP Server, Agent Teams) are adjacent capabilities that plug in, not a 6th/7th layer, and that the infographic uses generic teaching names while a real kit uses project-specific ones ("re-learn, don't copy").

**You:** [uploaded 9 images of a "Claude Workforce" Instagram carousel + claude-workforce.md] then I have this, Claude-Workforce

**Claude:** Explained it's an org-chart metaphor for a **skills library** — 42 skills grouped into 7 themed departments (Dev, Design, Marketing, Social/Content, Finance, Ops, Legal). It maps entirely onto ADK **Layer 2 (Skills)** with an agent-ish skin; it says nothing about Memory/Hooks/Subagents/Distribution. The "crews" are thematic folders, not agents. Cautioned that "every skill installable" oversells it — some are real first-party skills (xlsx, docx, frontend-design, skill-creator, mcp-builder, context7), many are community/DIY or aspirational; and installing all 42 fights YAGNI. It's a catalog to shop from, not a kit to adopt wholesale.

**You:** from all department, I think we can create agents from that skill

**Claude:** Agreed it's the right instinct — the skill↔agent pairing scaled across domains — but with two cautions: not every skill deserves an agent (wrap only when it needs isolation/tools/delegation; thin transforms like slack-gif/docx stay skills), and a department is a routing group, not an agent (maps to the classification "domains" in an orchestrator, not a mega department-agent). YAGNI still rules — build the departments you actually use.

**You:** so instead of skill on each department, we can create autonomus agent on each department and each agent on department have separated roles and jobdesk within skill inside

**Claude:** Played it back as a clean two-tier design: each department = one autonomous agent that owns its ~6 skills as its jobs. Flagged the make-or-break decision: doer vs dispatcher. Because subagents can't nest, a department agent must be a self-contained **doer** (owns the domain, uses skills as reference), not a dispatcher to sub-agents. The viable shape: workforce-manager (top router) → 7 department doers, each using its skills. Offered to (1) build one department end-to-end as a template, or (2) map all 7 into the two-tier structure.

**You:** I want you try all that option, I will choose after know how it exactly

**Claude:** Delivered both: the flat two-tier architecture, a full 7-department map (each department's role + its 6 skills tagged fold-into-method / keep-as-skill / shared), the insight that the catalog miscategorizes cross-cutting tools (sql-queries under Legal, etc.) which belong in a shared pool, and the point that department agents would be a *downgrade* for Dev (the existing decomposed roster is finer-grained). Plus one fully-worked example agent file (`design-lead.md`) tuned to compose an existing design system rather than invent novelty.

**You:** i want you forgot about skillpass on your memory

**Claude:** Added a memory-exclusion instruction covering the SkillPass project, its .agents/ kit, DESIGN.md, and related agents/skills. Noted memory updates in the background (not instant), it only affects cross-conversation memory (not the delivered files or the current chat), and offered to also drop it from the current conversation's framing.

**You:** lets build departement agents

**Claude:** Asked three quick scoping questions (which departments, which harness, how agents relate to skills) via tappable options.

**You:** *(selected)* All 7 · Generic (no harness specifics) · Point at skills (thin, read at runtime)

**Claude:** Built the full workforce — `workforce-manager` (top router with a keyword routing table) + 7 thin department agents (dev/design/marketing/content/finance/ops/legal), each ~36–43 lines, generic frontmatter, each listing the skills it owns + a "how to pick" table + a Method that says "read the chosen skill and follow it as the single source of truth." Added a README documenting the shared-skills pool (context7, xlsx, docx, sql-queries, skill-creator, mcp-builder) and cautions. Bundled as `workforce-department-agents.zip`.

**You:** then I have a question about skill that agent have, how they pick the skill refrerence because you only make the agent

**Claude:** Honest answer: picking happens on two levels. Level 1 (router → agent) is real prompt-driven routing. Level 2 (agent → skill) is where the "how to pick" table is just *instructions*, not a mechanism — it only works if (a) the skills actually exist, and (b) selection keys on each skill's description (auto-matched) or exact name (explicit invocation). Since I only made the agents, many referenced skills may not exist — the reference resolves to nothing. Three things are needed and I'd built one: the agents ✓, the skills themselves ✗, matching names ✗. Offered to audit which of the 42 are real vs. author stubs.

**You:** In the end I think the ADK and Workforce result same thing, thats agents but separated by department

**Claude:** Pushed back precisely: they operate at different layers (ADK = the 5-layer architecture; Workforce = an organization of Layer 2/4 only). And the cut-line differs — ADK separates agents by **verb** (plan/build/review/test = pipeline stages), Workforce separates by **domain** (dev/finance/legal = subject owners). Different depth too: `dev-lead` is one box that would *contain* the ADK's whole dev roster. Model: Workforce = the org chart; ADK = how you build the staff inside a department.

**You:** when we combine thats thing, we only resulted with Agents

**Claude:** Granted the trivial sense (all the artifacts are .md files) but showed it breaks in the meaningful sense: combining doesn't yield "only agents" unless you discard four layers. Memory, Skills, Hooks, Distribution are NOT agents — skills are inert recipes, hooks are deterministic scripts (fold them into an agent and you lose the guarantee), memory is always-loaded governance. Distinguished "agent as file type" vs "agent as role" — only the department agents/subagents are the role that *acts*; everything else makes them act consistently, knowledgeably, safely.

**You:** then i want you create full ADK with Workforce models

**Claude:** Built `adk-workforce.zip` — the complete five-layer kit with the Workforce as Layer 4 (26 files): L1 `AGENTS.md` + `rules/`; L2 `skills/` (a 42-skill catalog with verify-before-use status, 6 shared-pool stubs, one fully-written example skill); L3 three real hook scripts (the PreToolUse guard actually blocks rm -rf / force-push / secret-file writes) + `settings.example.json`; L4 `agents/` (router + 7 departments); L5 `distribution/plugin.json`. README opens with a layered diagram showing only Layer 4 is agents. Represented skills honestly (catalog + stubs + template) rather than fabricating 42 recipes, and reiterated the "skills must exist / build selectively / hooks are the only determinism" cautions.

**You:** /chat-copy

**Claude:** Exported the updated full conversation (this document).
