# The Workforce — Department Agents

A two-tier agent architecture: one top router (`workforce-manager`) over seven
**department agents**. Each department agent is a self-contained worker that owns a
domain's skills, picks the right one per request, and **reads that skill at runtime and
follows it** (thin — the skills stay the single source of truth; agents don't restate them).

```
workforce-manager            ← start here; routes to a department
├── dev-lead                 superpowers · webapp-testing · claude-mem
├── design-lead              frontend-design · ui-ux-pro-max · web-artifacts · canvas-design · algorithmic-art · slack-gif
├── marketing-lead           seo-audit · programmatic-seo · ai-seo · cro · ad-creative · mktg-psychology
├── content-lead             content-strategy · social · copywriting · video · pillar-content · email-sequences
├── finance-lead             3-statements · dcf-model · lbo-model · comps-analysis · pricing · pitch-deck
├── ops-lead                 launch-runbook · incident-postmortem · sop-builder · business-case · internal-comms
└── legal-lead               contract-review · nda-triage · legal-risk · compliance
```

## Shared skills pool

These are cross-cutting — any department may use them; none owns them:
`context7`, `xlsx`, `docx`, `sql-queries`, `skill-creator`, `mcp-builder`.
(The original catalog filed these under single departments — e.g. `sql-queries`
under Legal — which is a categorization artifact, not a real boundary.)

## Design notes

- **Two tiers, not three.** Department agents are *doers/selectors*, not dispatchers —
  they do not spawn other agents (agents can't nest). The only router is `workforce-manager`.
- **Thin, point-at-skill.** Each agent lists the skills it owns and follows the chosen
  skill's own steps at runtime, so a skill has exactly one definition.
- **Generic.** No harness-specific frontmatter (no Task/actor tool, no `.claude`/`.agents`
  paths). Add your harness's fields (tools, model, mode) when you install.

## Install

Drop the eight `.md` files into your agents directory. Wire the seven departments into
`workforce-manager`'s routing table (already listed). Requires the named skills to exist in
your skills directory — the agents assume the skills are installed; they reference, not contain, them.

## A caution worth keeping

You asked for all seven. Build/keep the departments you'll actually use — an agent you
never invoke is pure overhead. The skills each agent references must also be real and
installed; verify each skill before relying on it (especially Finance/Legal, where a wrong
output has real consequences). These department agents are first-pass workers, not experts —
Legal in particular is not a substitute for counsel.
