# Agent Development Kit — Speaker Script

*A slide-by-slide talk track for the 22-slide deck. Written to be spoken, not read off the screen. Total runtime ≈ 28–32 minutes at a relaxed pace. Bracketed notes like [advance] or [pause] are delivery cues, not lines to read aloud.*

---

## Slide 1 — Title: The Agent Development Kit
*(≈45 sec)*

"Hi everyone, thanks for coming. Today I want to talk about something that's quietly changed how I work with AI on our codebase — what I'm calling the Agent Development Kit.

The one-line version is up here: it's about engineering AI agents that work across any tool and any project, instead of starting from scratch in every chat. By the end of this you'll know the five pieces it's built from, you'll have seen the actual setup we run, and you'll know how to drop the same idea into your own project. Let's get into it."

[advance]

---

## Slide 2 — Agenda: What we'll cover
*(≈30 sec)*

"Quick map of where we're going. First, the story — why ad-hoc prompting stops scaling. Then the five-layer model that's the backbone of the whole thing. Then I'll show you our real setup — the actual files. We'll look at how skills and subagents relate, walk through how a real task flows through the kit end to end, and finish with how you'd adopt it yourself.

So it goes from *why*, to the *concept*, to *our real implementation*, to *you doing it*. [advance]"

---

## Slide 3 — The story: Before, AI help was ad-hoc
*(≈1 min 15 sec)*

"Let's start with the pain, because that's where this came from.

When you use an AI assistant casually, four things keep biting you. [point] First, you re-explain context every single session — what stack we're on, our conventions, where things live. The assistant has no memory, so you type it again and again.

Second, the output is inconsistent. Ask for the same kind of component twice and you get two different shapes.

Third, there are no guardrails. It's easy to skip a check, miss a step, ship a mistake — nothing stops you.

And fourth — this is the sneaky one — the knowledge stays in one person's head. You figure out the perfect prompt, but nobody else on the team benefits from it.

None of these are about the AI being weak. They're about the *setup* around it being missing. [pause] That's the gap we're going to fill. [advance]"

---

## Slide 4 — The shift: Stop prompting, start engineering the agent
*(≈45 sec)*

"So here's the mindset shift the whole talk hangs on.

Stop *prompting*. Start *engineering the agent*.

The idea is to treat your AI configuration the same way you treat code — versioned, shared, reviewed, committed to the repo. Not a clever message you type once and lose, but a system that lives in the project. [pause] The Agent Development Kit is the name for that system. And it's made of five layers. [advance]"

---

## Slide 5 — The model: Five layers, one stack
*(≈1 min)*

"Here are the five. Read them left to right, because that's roughly the order of adoption too.

Memory sets the rules. Skills add expertise. Hooks enforce quality. Subagents delegate work. And Distribution shares the whole thing with your team.

The thing to hold onto: each layer is just a markdown file or a small script that the AI tool reads automatically — there's no magic, no framework to install. [point] And the payoff is at the bottom: you build it once, and then every session, and every teammate, starts smarter. [pause]

Let's take them one at a time. [advance]"

---

## Slide 6 — Layer 1, Memory: The constitution
*(≈1 min)*

"Layer one, Memory. Think of this as the agent's constitution — it's always loaded, every session, before you say a word.

In practice it's a `CLAUDE.md` file at the root of the repo, plus a `rules/` folder with focused docs — architecture, code style, testing, i18n, and so on. You write your conventions down once, here.

The takeaway is at the bottom: no more repeating 'here's how this repo works' every time you open a session. You said it once, in a file, and now it's just *known*. [advance]"

---

## Slide 7 — Layer 2, Skills: On-demand expertise
*(≈1 min)*

"Layer two, Skills. If Memory is what's *always* true, Skills are expertise that loads *on demand* — only when it's relevant.

Each skill is a `SKILL.md` file with a name and a description. The AI reads the description, and when your task matches, it pulls that skill in. A skill can carry templates and scripts too — so it's not just knowledge, it can scaffold and generate.

The reason it loads only when needed is to keep the agent's working memory lean. [point] Examples for us: add a translation, scaffold a route, wire up an API. We'll see our real ones shortly. [advance]"

---

## Slide 8 — Layer 3, Hooks: Deterministic guardrails
*(≈1 min 10 sec)*

"Layer three, Hooks — and this one's different, so stay with me.

Everything in the first two layers is *advice* to the AI. It reads it and tries to follow it — but it's a judgment call, so it can be missed. Hooks are not advice. Hooks are deterministic. They're plain scripts that fire automatically on events — when a file is edited, when a session starts — and they run the same way every time.

So they catch mistakes automatically: the step you'd forget can't be forgotten. They run no matter what — for us that's a `post-edit.mjs` hook, plus git hooks.

The mental model: it's like Git hooks, but for your agent. [pause] If a rule absolutely must hold, you don't write it as a prompt — you write it as a hook. [advance]"

---

## Slide 9 — Layer 4, Subagents: Delegate the noise
*(≈1 min)*

"Layer four, Subagents. The problem this solves: some tasks are noisy. 'Go read forty files and find every place we handle payments.' If the main agent does that, its working memory fills up with junk and it gets worse at everything else.

A subagent fixes that. It has its own context window, does one job off to the side, and returns just the result. Your main thread stays clean. And you can run each one on the right model — a strong model for hard reasoning, a cheaper one for grunt work.

For us these are roles like planner, code-reviewer, bug-hunter, test-runner. [pause] Keep that word *roles* in mind — it matters in a few slides. [advance]"

---

## Slide 10 — Layer 5, Distribution: Build once, the team installs
*(≈55 sec)*

"Layer five, Distribution. By now you've built up a real setup — rules, skills, hooks, agents. But it only lives on *your* machine, in *one* repo. Your teammate has none of it.

So you commit it to the repo — clone it and the rules and hooks are already active — and you can bundle it as a plugin, with a `plugin.json`, so skills, agents, hooks and commands all travel together. Updates reach everyone when they pull.

The point: the whole team levels up together, instead of one good prompt at a time. [advance]"

---

## Slide 11 — Tool-agnostic: One idea, many tools
*(≈1 min)*

"Before we look at our setup, one important point: this isn't locked to one tool.

This table maps the same five layers across Claude Code, opencode, and Cline. The exact filenames differ — but the *idea* is identical. And the rightmost column is the portable version: an `AGENTS.md` file plus an `.agents/` folder that all three tools read unchanged.

[point at bottom line] And because it's just markdown and scripts, the same setup runs on other model providers too — Qwen, DeepSeek, Kimi — through opencode or Cline. So what you learn here transfers. You're not learning one product; you're learning a pattern. [advance]"

---

## Slide 12 — Our kit: What we actually built
*(≈1 min 15 sec)*

"Okay — enough concept. This is our actual `.claude/` folder.

[walk the tree] At the top, `.claude-plugin/` with a `plugin.json` — that's distribution. Then `rules/`, six docs — that's Memory. `skills/`, eight of them. `agents/`, ten subagents. `commands/`, four slash-commands. A `hooks/` folder with `post-edit.mjs`, and a `settings.json`.

[gesture to legend] And the legend on the right is the whole point of the talk in one picture: every folder maps to one of the five layers. Rules is Memory, skills is Skills, hooks and settings are Hooks, agents is Subagents, the plugin folder is Distribution. The five layers aren't theory — they're literally the folders in our repo. [advance]"

---

## Slide 13 — Our 8 skills
*(≈1 min)*

"Here are our eight skills — our on-demand expertise.

[scan quickly, don't read every word] `add-translation` adds i18n keys and ships with scripts. `new-feature-route` scaffolds a whole page with templates and scripts. `wire-api` connects the UI to an endpoint. `frontend-design` holds our design tokens — that one's vendored from Anthropic. Then `code-review`, `find-bugs`, `security-review`, and `refactor`.

The little tags tell you which carry scripts, templates, or are vendored. Notice these are exactly the repetitive jobs we used to re-explain every time — now they're captured once. [advance]"

---

## Slide 14 — Our 10 subagents
*(≈1 min)*

"And our ten subagents — the delegated workers.

[scan] planner, agent-manager, route-builder, code-reviewer, api-integrator, bug-hunter, ui-ux-designer, security-reviewer, i18n-checker, test-runner.

The tag on each says read or write — whether that agent can change files or only inspect them. The reviewers and checkers are read-only on purpose; the builders can write. That read-only boundary is a safety feature — a reviewer literally can't accidentally edit your code. [advance]"

---

## Slide 15 — Skills & subagents are siblings
*(≈1 min 15 sec)*

"Now, a question I get a lot: what's the difference between a skill and a subagent? They feel similar.

Here's the clean answer: same domain, two modes. A skill *injects knowledge* into the current context. A subagent *spawns a separate worker* that returns only its result.

And in our setup they pair up beautifully. [point down the pairs] `code-review` the skill, `code-reviewer` the agent. `find-bugs` and `bug-hunter`. `security-review` and `security-reviewer`. `add-translation` and `i18n-checker`. `new-feature-route` and `route-builder`. `wire-api` and `api-integrator`.

[bottom] A few stand alone — `refactor` and `frontend-design` are skill-only; `planner`, `test-runner`, `ui-ux-designer` and `agent-manager` are agent-only. So: skill is *what to know*, subagent is *who does it and what comes back*. [advance]"

---

## Slide 16 — Orchestration: agent-manager runs the show
*(≈1 min 30 sec)*

"This is the slide that ties the agents together. We don't pick agents by hand — we have one dispatcher called `agent-manager`.

[point to hub] It's the only entry point. You describe what you want in plain language; it never writes code itself. It reads the task, routes to the right specialists, runs them in the right order, and hands you back one aggregated result.

[gesture to groups] The specialists sit in three groups. Plan and design — planner and ui-ux-designer. Build — route-builder and api-integrator. Verify — test-runner, code-reviewer, bug-hunter, security-reviewer, i18n-checker.

[point to model tags] Notice the model tags. The audit-heavy agents run on opus — the strong model, because subtle bugs and security issues need real reasoning. The mechanical work runs on sonnet — fast and cheap. That's deliberate cost control.

And the routing logic, top right: it matches a known blueprint first, falls back to keywords, and if it's still unclear, it asks you rather than guessing. [advance]"

---

## Slide 17 — Blueprints agent-manager matches
*(≈1 min 20 sec)*

"So what are those blueprints? These are the standard recipes `agent-manager` recognizes.

[top group] The sequential ones — where each agent feeds its output to the next. 'New page with UI' runs planner, then ui-ux-designer, then route-builder, then test-runner. 'Add a page or route' is the shorter version without design. 'Backend is ready' wires the API then tests. 'Bug not working' hunts the bug then reviews the fix. 'Security audit' and 'before merge' follow the same shape.

[bottom group] And some run in parallel — fired together, results merged. 'Why is X failing?' runs bug-hunter and test-runner at the same time. 'Full pre-merge review' runs all three reviewers concurrently.

The colors track the groups from the last slide — gold is plan-and-design, blue is build, orange is verify. So at a glance you can read the shape of any workflow. [advance]"

---

## Slide 18 — Worked example: A Supervisor Approvals screen
*(≈1 min 30 sec)*

"Let's make it concrete. Real request: 'agent-manager, build a Supervisor Approvals page with a table and approve/reject, wired to the approvals endpoint.'

[walk the steps] agent-manager matches blueprint one and runs the chain. One — planner writes a plan file under `docs/plans/`. Two — ui-ux-designer builds the page from our shared UI library, fully translated across id, en and ar, with tests. Three — route-builder registers it in `app/routes.ts` and runs typegen. Four — api-integrator swaps the mock data for the real service and a react-query hook. Five — test-runner runs the tests and typecheck and reports only the failures. Six — agent-manager hands back one summary: files created, route added, i18n keys, test results. And seven — before merge, the three reviewers run in parallel.

[point to footnote] And the whole time, hooks are firing underneath — editing routes triggers typegen, editing a locale runs the parity test, and every save gets formatted. That's all five layers working together in a single request. [pause] [advance]"

---

## Slide 19 — Outcomes: What changes when you adopt it
*(≈55 sec)*

"So what do you actually get out of all this? Four things.

Consistency — repeated work follows one shared pattern. Less context tax — you stop re-explaining the project every session. Quality gates — reviews and hooks catch issues before they land, automatically. And it's shared, not siloed — one person's workflow becomes the whole team's.

[pause] Notice those four are exactly the four pains from the start of the talk, flipped. That's the point of the kit. [advance]"

---

## Slide 20 — Lessons learned: If you're starting one
*(≈55 sec)*

"If you want to build your own, four lessons from doing it.

Start with Layer 1 — just the rules file removes most of the friction on day one. Re-learn, don't copy — derive the content from *your* project; don't paste someone else's setup. YAGNI — only add a skill, agent, or hook when there's a real, repeated need; don't build twenty on spec. And put your hard guarantees in hooks — that's the one layer that works no matter the tool. [advance]"

---

## Slide 21 — Adopt it: Drop it into any project
*(≈50 sec)*

"And the adoption path is short. Detect first — let the AI re-learn the repo's stack, commands, and conventions. Build the layers in order — Memory, Skills, Hooks, Subagents, Distribution. And wire only the tools you actually use — Claude Code, opencode, Cline, or another provider.

[bottom] Because it's a portable playbook, the AI can rebuild the kit for any stack — same method, new project. You don't start from zero again. [advance]"

---

## Slide 22 — Thanks / Q&A
*(≈30 sec + discussion)*

"That's the kit — five layers, one stack, and it works across any tool and any project.

I'd love to hear your questions — and especially, if there's a layer or an agent *you'd* add for your part of the codebase, let's talk about it.

Thank you."

[open for questions]

---

## Appendix — Likely questions & quick answers

**"Does agent-manager call the other agents itself?"**
It directs the flow — it decides who runs and in what order, and aggregates the results. It analyzes and routes; the specialists do the actual work. It never writes code itself.

**"Why opus for some agents and sonnet for others?"**
Cost and quality. Audits — code review, security, bug hunting — run on opus because subtle issues need stronger reasoning. Mechanical work — scaffolding, running tests — runs on sonnet because it's faster and cheaper. You pay for thinking only where it matters.

**"Does this only work with Claude Code?"**
No. The same pattern runs on opencode and Cline, and through them on other model providers like Qwen, DeepSeek, or Kimi. The filenames change; the idea doesn't.

**"How is a hook different from a rule in CLAUDE.md?"**
A rule is a request the AI tries to follow. A hook is a script that runs deterministically — it can't be reasoned around. Use hooks for things that must hold every time.

**"How long did this take to set up?"**
Start small — a rules file is an afternoon. The rest grew one piece at a time, each added when a real, repeated need showed up.
