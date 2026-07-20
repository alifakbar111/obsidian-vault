# Session Bundle — Manifest

Exported 2026-07-13. Everything produced during the ADK / SkillPass session.

## chat transcript
- `ADK-SkillPass-session-13-07-2026.md` — full conversation. Part 1 verbatim from
  the session transcript; Part 2 reconstructed from the continued session.

## deck/  — the sharing-session presentation
- `ADK-sharing-session.pptx` — the 22-slide Agent Development Kit deck (accurate to the
  real apps/web workflow: orchestration, blueprints, Supervisor Approvals worked example).
- `ADK-sharing-session-ZOG.pptx` — the same deck re-skinned in the Zero One Group brand
  (black/white, Arial, real logo + halftone/geometric motifs, layer colours kept only as
  functional accents).
- `ADK-sharing-session-script.md` — per-slide speaker script (~28–32 min), delivery cues,
  timing, and a Q&A appendix. Written for a mixed internal audience.

## apps-web-kit-claude-code/  — patches for the apps/web Claude Code kit
- `route-builder.md` — thinned: points at the `new-feature-route` skill as the single
  source of truth instead of restating its steps.
- `api-integrator.md` — thinned: keeps its swagger-matching Input logic, points at the
  `wire-api` skill for steps.
- NOTE: the `agent-manager.md` patch for THIS kit (five structural fixes — authoritative
  glob, explicit README skip, description fallback, keyword tiebreak, blueprint
  reconciliation) was delivered in-chat but later overwritten in the outputs folder by the
  SkillPass version. Its five fixes are described in the transcript; ask and I can
  regenerate the file.

## skillpass-opencode/  — patches for the SkillPass .agents/ kit (opencode)
- `agent-manager.md` — duplicate intro-step fixed; the three previously-unreachable agents
  (product-owner, product-researcher, technical-writer) now routed via keywords + blueprints
  6/7/8. mimo-orchestrator left untouched (per request).
- `ui-ux-designer.md` — rewritten to COMPOSE the DaisyUI + Tailwind v4 design system
  (DESIGN.md as source of truth), reversing the earlier "invent bold aesthetics" direction.
- `react-scaffolder.md` — aligned to the real `pages/<page>/index.tsx` structure, `api()`
  wrapper, and design-system conventions.
- `technical-writer.md` — SkillPass-specific: Research Mode first, points at the
  auto-generated Swagger, follows the existing docs/ formats, phantom-skill clause removed.
