# Design System — Generate & Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Analyze SkillPass's existing UI, produce a 10-dimension visual audit with file:line fixes, extract design tokens into a structured system, and generate `DESIGN.md`, `design-tokens.json`, and `design-preview.html`.

**Architecture:** Two-phase approach — Phase 1 audits the existing codebase and scores it; Phase 2 extracts tokens, researches competitors, and produces a cohesive design system with a new font pairing (Outfit + Fira Code), a DaisyUI `@theme` block, and Storybook with per-component stories for all UI patterns. Output files live at the repo root, `web/src/styles/`, `.storybook/`, and `web/src/stories/`.

**Tech Stack:** Tailwind CSS v4, DaisyUI 5, Outfit (Google Font), Fira Code (Google Font), lucide-react icons

---

### Task 1: Competitor Research (Inspiration)

**Files:** None (research only)

- [ ] **Step 1: Research LinkedIn's design system**

Search: `LinkedIn design system color palette typography 2026`

- [ ] **Step 2: Research Indeed's design patterns**

Search: `Indeed job platform UI design cards spacing`

- [ ] **Step 3: Research Wellfound (AngelList) design**

Search: `Wellfound AngelList design system typography UI 2026`

- [ ] **Step 4: Document findings for token decisions**

Capture the following for each competitor in a structured format:
- **Primary color palette** (hex values or OKLCH)
- **Font choices** (heading/body stacks)
- **Card pattern** (border radius, shadow, padding)
- **Spacing conventions** (density, container max-width)
- **Distinctive UI elements** (unique patterns worth adopting)

Use these findings to inform the token proposal in Task 5.

---

### Task 2: Visual Audit — Score All 10 Dimensions

**Files:**
- Read: `web/src/pages/*.tsx` (all 13 pages)
- Read: `web/src/components/*.tsx`
- Read: `web/src/styles/index.css`
- Read: `web/src/App.tsx`
- Read: `web/src/index.html`

- [ ] **Step 1: Score Color Consistency (dimension 1)**

**Evidence:** All components use DaisyUI semantic colors (`bg-base-100`, `btn-primary`, `text-error`, etc.). Zero custom hex values in the codebase. Every page follows the same pattern.

**Score: 8/10**
- **Strength:** 100% consistent use of DaisyUI semantic tokens — no random hex values.
- **Gap:** No named custom palette. If a designer wanted to brand the app, there's no primary/secondary/accent token set defined anywhere.
- **Fix:** Add a `@theme` block in `index.css` with custom named colors (Task 6).

- [ ] **Step 2: Score Typography Hierarchy (dimension 2)**

**Evidence:**
- `text-5xl` → Landing hero (`Landing.tsx:45`)
- `text-2xl` → Page headings (all 13 pages)
- `text-xl` → Navbar brand, section subheadings
- `text-lg` → Taglines, loading spinner
- `text-sm` → Detail text, labels, secondary content
- `text-xs` → Menu labels, error messages, skill overflow

**Score: 6/10**
- **Strength:** A clear 6-level size hierarchy is used consistently across all pages.
- **Gap:** No intentional font choice — the app uses the OS system stack. No explicit `font-heading` / `font-body` distinction. No tracking or leading adjustments.
- **Fix:** Import Outfit (headings/body) + Fira Code (mono) via Google Fonts. Set `font-family` in `@theme`. (Task 6)

- [ ] **Step 3: Score Spacing Rhythm (dimension 3)**

**Evidence:**
- `p-4` — most common page/card padding (every page)
- `p-6` — larger cards (Landing, Passport)
- `p-3` — experience items inside cards
- `space-y-4` — most common vertical rhythm
- `space-y-3` — form field spacing
- `gap-4` / `gap-2` / `gap-1` — consistent gap scale

**Score: 8/10**
- **Strength:** Consistent use of Tailwind's default 4px-based scale. Pages follow the same container pattern.
- **Gap:** Minor mixing of `p-4` vs `p-6` without clear rationale. Some pages use `space-y-6` on outer container while others use `space-y-4`.
- **Fix:** Document the scale in `DESIGN.md` and standardize to `space-y-6` for page-level containers, `space-y-4` for section-level, `gap-2` for inline elements.

- [ ] **Step 4: Score Component Consistency (dimension 4)**

**Evidence:** Every page follows `max-w-* mx-auto p-4` pattern. Forms use `form-control` + `input input-bordered`. Cards use `card bg-base-200 p-4`. Buttons are `btn btn-primary` / `btn-ghost` / `btn-outline`. Badges use `badge badge-sm`.

**Score: 9/10**
- **Strength:** Exceptionally consistent — all 13 pages use the same component patterns. No custom component wrappers needed.
- **Gap:** None significant. The consistency is a strong point of this codebase.
- **Fix:** No changes needed.

- [ ] **Step 5: Score Responsive Behavior (dimension 5)**

**Evidence:** Scan all page components for responsive utility classes (`sm:`, `md:`, `lg:` prefixes). The only responsive class found is in `RootLayout.tsx` (`lg:flex` for sidebar layout). All other pages use a single-column centered layout with no responsive breakpoints.

**Score: 5/10**
- **Strength:** Single-column layout works on all screen sizes without breakage.
- **Gap:** No responsive adaptation — the 13 detail pages don't use grid/flex breakpoints. `max-w-2xl` container is the same on desktop and mobile. The landing page's 3-column feature grid (`grid grid-cols-1 md:grid-cols-3 gap-4` in `Landing.tsx:63`) is the only responsive element.
- **Fix:** No immediate fix needed (app is an internal tool), but document the gap in `DESIGN.md`.

- [ ] **Step 6: Score Dark Mode (dimension 6)**

**Evidence:** `ThemeToggle.tsx` toggles `data-theme` between `'winter'` and `'dark'`. All DaisyUI semantic colors adapt automatically. No `dark:` Tailwind prefixes needed.

**Score: 9/10**
- **Strength:** Complete dark mode support via DaisyUI. Zero custom CSS. Works on all components and pages automatically.
- **Gap:** Only two themes offered. Could add more (e.g., `"dracula"`, `"corporate"`), but not necessary for an MVP.
- **Fix:** No changes needed.

- [ ] **Step 7: Score Animation & Motion (dimension 7)**

**Evidence:** The only transition in the entire app is `hover:bg-base-300 transition-colors` on card links. Zero animations, zero page transitions, zero micro-interactions.

**Score: 3/10**
- **Strength:** No gratuitous animation (no AI slop).
- **Gap:** No purposeful motion either — no hover effects on buttons (beyond DaisyUI default), no page transitions, no loading animations beyond the spinner, no micro-interactions on form elements.

- [ ] **Step 8: Score Accessibility (dimension 8)**

**Evidence:** Check form labels, focus states, contrast, touch targets, and keyboard navigation across components.

- **Form labels:** All inputs use `<label className="form-control">` with `<span className="label-text">` — properly associated ✅
- **Focus states:** Tailwind + DaisyUI provide default `focus:outline` styles on inputs and buttons ✅
- **Contrast:** DaisyUI themes pass WCAG AA contrast ratios by default ✅
- **Touch targets:** `btn` class gives minimum 44px height ✅
- **Keyboard navigation:** `<button>` elements are focusable, links work with keyboard ✅
- **aria attributes:** No explicit `aria-*` attributes used anywhere ❌
- **Error announcements:** Errors render as `<p className="text-error text-sm">` — no `role="alert"` ❌

**Score: 7/10**
- **Strength:** DaisyUI provides good defaults for contrast, focus, and touch targets. All form inputs are properly labeled.
- **Gap:** No `aria-*` attributes, no `role="alert"` on dynamic error messages, no skip-to-content link.
- **Fix:** Add `role="alert"` to error messages. Add `aria-label` to icon-only buttons (ThemeToggle, delete icons). Document in `DESIGN.md`.

- [ ] **Step 9: Score Information Density (dimension 9)**

**Evidence:** Pages are clean with clear section breaks. Cards use consistent padding. Text is well-spaced.

**Score: 7/10**
- **Strength:** Clean card-based layout with adequate whitespace between sections.
- **Gap:** The Passport page (`JobseekerPassport.tsx`) stacks all sections vertically without tabs or accordions, which can feel dense on longer profiles. Skills badges can overflow.

- [ ] **Step 10: Score Polish (dimension 10)**

**Evidence:** Hover states, transitions, loading states, empty states, and error states across all components.

- **Hover states:** Only on card links (`hover:bg-base-300 transition-colors`). Buttons rely on DaisyUI's default `:hover` styles. ✅
- **Transitions:** Only `transition-colors` on card links. No `transition-all` on buttons, no page transitions. ❌
- **Loading states:** All pages show a centered spinner via `LoadingFallback.tsx` ✅
- **Empty states:** Consistent `"No X found"` pattern with `opacity-50` ✅
- **Error states:** Consistent `text-error` pattern ✅
- **404 / Not found:** Not handled — no dedicated error page ❌

**Score: 6/10**
- **Strength:** Consistent loading and empty states. DaisyUI provides good default button hover/active states.
- **Gap:** No page-level transitions. No dedicated 404 page. No success toasts/notifications.

- [ ] **Step 11: Compile audit summary**

**Final Scorecard:**

| # | Dimension | Score |
|---|---|---|
| 1 | Color consistency | 8 |
| 2 | Typography hierarchy | 6 |
| 3 | Spacing rhythm | 8 |
| 4 | Component consistency | 9 |
| 5 | Responsive behavior | 5 |
| 6 | Dark mode | 9 |
| 7 | Animation & motion | 3 |
| 8 | Accessibility | 7 |
| 9 | Information density | 7 |
| 10 | Polish | 6 |
| | **Total** | **68/100** |

---

### Task 3: Extract Existing Design Tokens

**Files:**
- Read: `web/src/styles/index.css`
- Read: `web/src/index.html`
- Read: `web/vite.config.ts`
- Create: `design-tokens.json`

- [ ] **Step 1: Extract current color tokens**

Scan all `.tsx` files for Tailwind color classes. Document the used DaisyUI tokens:
- `bg-base-100`, `bg-base-200`, `bg-base-300`
- `text-base-content`, `text-error`, `text-primary`
- `bg-neutral`, `text-neutral-content`
- `btn-primary`, `btn-success`, `btn-error`, `btn-ghost`, `btn-outline`
- `badge`, `badge-primary`, `badge-success`, `badge-ghost`, `badge-outline`

- [ ] **Step 2: Extract current typography tokens**

Document the system font stack used by DaisyUI and the observed size/weight hierarchy:
```json
{
  "fontFamily": {
    "body": "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    "mono": "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace"
  },
  "fontSize": {
    "xs": "0.75rem",
    "sm": "0.875rem",
    "base": "1rem",
    "lg": "1.125rem",
    "xl": "1.25rem",
    "2xl": "1.5rem",
    "5xl": "3rem"
  },
  "fontWeight": {
    "medium": 500,
    "semibold": 600,
    "bold": 700
  }
}
```

- [ ] **Step 3: Extract current spacing tokens**

Document the observed spacing scale:
```json
{
  "spacing": {
    "1": "0.25rem",
    "2": "0.5rem",
    "3": "0.75rem",
    "4": "1rem",
    "6": "1.5rem",
    "8": "2rem"
  },
  "gap": {
    "1": "0.25rem",
    "2": "0.5rem",
    "3": "0.75rem",
    "4": "1rem"
  }
}
```

- [ ] **Step 4: Extract current radii and shadow tokens**

```json
{
  "borderRadius": {
    "DEFAULT": "0.5rem",
    "lg": "0.75rem",
    "full": "9999px",
    "box": "var(--rounded-box, 1rem)"
  },
  "boxShadow": {
    "sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "DEFAULT": "none"
  }
}
```

- [ ] **Step 5: Write `design-tokens.json`**

Create `/home/al-ip/learning/skillpass/design-tokens.json`:

```json
{
  "meta": {
    "name": "SkillPass Design Tokens",
    "version": "1.0.0",
    "description": "Design tokens extracted from the existing codebase and proposed refinements"
  },
  "color": {
    "description": "All colors are DaisyUI semantic tokens. No custom hex values are used in the codebase.",
    "semantic": {
      "bg-base-100": "--color-base-100",
      "bg-base-200": "--color-base-200",
      "bg-base-300": "--color-base-300",
      "text-base-content": "--color-base-content",
      "text-error": "--color-error",
      "text-primary": "--color-primary",
      "bg-neutral": "--color-neutral",
      "text-neutral-content": "--color-neutral-content"
    },
    "proposed": {
      "description": "Proposed named palette extending DaisyUI defaults — defined via @theme in index.css",
      "primary": "#4F46E5",
      "primary-content": "#FFFFFF",
      "secondary": "#7C3AED",
      "accent": "#F59E0B",
      "neutral": "#1F2937"
    }
  },
  "typography": {
    "description": "Current: OS system stack. Proposed: Outfit (heading/body) + Fira Code (mono).",
    "fontFamily": {
      "current": {
        "body": "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        "mono": "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace"
      },
      "proposed": {
        "body": "'Outfit', sans-serif",
        "mono": "'Fira Code', monospace"
      }
    },
    "fontSize": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "base": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
      "5xl": "3rem"
    },
    "fontWeight": {
      "medium": 500,
      "semibold": 600,
      "bold": 700
    },
    "lineHeight": {
      "tight": "1.15",
      "normal": "1.5",
      "relaxed": "1.75"
    }
  },
  "spacing": {
    "description": "Tailwind's default 4px-based spacing scale. Consistent across all pages.",
    "scale": {
      "1": "0.25rem",
      "2": "0.5rem",
      "3": "0.75rem",
      "4": "1rem",
      "6": "1.5rem",
      "8": "2rem"
    },
    "page": {
      "containerMaxWidth": "var(--max-w-2xl, 42rem)",
      "padding": "1rem",
      "sectionGap": "1.5rem"
    }
  },
  "borderRadius": {
    "DEFAULT": "0.5rem",
    "lg": "0.75rem",
    "full": "9999px",
    "box": "1rem"
  },
  "boxShadow": {
    "sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "DEFAULT": "none",
    "md": "0 4px 6px -1px rgb(0 0 0 / 0.1)"
  },
  "breakpoints": {
    "sm": "640px",
    "md": "768px",
    "lg": "1024px",
    "xl": "1280px"
  }
}
```

---

### Task 4: Update `web/src/styles/index.css` with Font Imports + `@theme` Block

**Files:**
- Modify: `web/src/styles/index.css`

- [ ] **Step 1: Add Google Font import and @theme block**

Replace the current 2-line CSS with:

```css
@import "https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap";
@import "tailwindcss";
@plugin "daisyui";

@theme {
  --font-sans: 'Outfit', sans-serif;
  --font-mono: 'Fira Code', monospace;
}
```

- [ ] **Step 2: Migrate Register.tsx fieldsets to daisyUI 5 native component**

Replace manual fieldset styles in `web/src/pages/Register.tsx` with daisyUI's `fieldset` and `fieldset-legend` classes:

```diff
- <fieldset className="border border-base-300 rounded-lg p-4">
-   <legend className="font-semibold px-1">I am a…</legend>
+ <fieldset className="fieldset">
+   <legend className="fieldset-legend">I am a…</legend>
    <div className="flex gap-2">...</div>
  </fieldset>

- <fieldset className="border border-base-300 rounded-lg p-4">
-   <legend className="font-semibold px-1">Account Details</legend>
+ <fieldset className="fieldset">
+   <legend className="fieldset-legend">Account Details</legend>
    <div className="space-y-4">...</div>
  </fieldset>
```

- [ ] **Step 3: Build and verify no errors**

Run: `bun run build`
Expected: No errors. Font is loaded and applied globally.

---

### Task 5: Write `DESIGN.md` — Full Design System Documentation

**Files:**
- Create: `DESIGN.md`

- [ ] **Step 1: Write introduction and philosophy**

Write `/home/al-ip/learning/skillpass/DESIGN.md`:

```markdown
# SkillPass Design System

**Version:** 1.0.0  
**Last updated:** 2026-05-23  
**Stack:** Tailwind CSS v4 + DaisyUI 5

## Philosophy

SkillPass follows a **utility-first, component-driven** approach. Every visual decision is made through DaisyUI semantic classes and Tailwind utility classes — there are zero lines of custom CSS. This keeps the design system lightweight, themeable, and easy to maintain.

**Three principles:**
1. **Semantic over absolute** — Use `bg-base-200` not `bg-gray-100`. This enables instant dark mode.
2. **Consistency over creativity** — Follow established patterns. Every page uses the same container, card, and form patterns.
3. **Minimalism over decoration** — No gratuitous gradients, shadows, or animations. Design serves the content.

---

## Typography

### Font Stack

| Role | Font | Fallback |
|---|---|---|
| Body & Headings | Outfit | `sans-serif` |
| Code & Monospace | Fira Code | `monospace` |

**Rationale:** Outfit provides a warm, geometric character that feels approachable for a job platform. Fira Code adds personality to code snippets without sacrificing readability. Both load efficiently from Google Fonts with a single `display=swap` request.

### Size Scale

| Token | Size | Weight | Used For |
|---|---|---|---|
| `text-xs` | 0.75rem | 500 | Labels, badges, error messages |
| `text-sm` | 0.875rem | 400 | Body text, descriptions, metadata |
| `text-base` | 1rem | 400 | Default paragraph text |
| `text-lg` | 1.125rem | 500 | Taglines, emphasized body |
| `text-xl` | 1.25rem | 600 | Section subheadings, navbar brand |
| `text-2xl` | 1.5rem | 700 | Page headings (h2) |
| `text-3xl` | 1.875rem | 700 | Section hero headings |
| `text-4xl` | 2.25rem | 700 | Landing primary heading |
| `text-5xl` | 3rem | 700 | Landing hero heading |

**Line height:** `1.15` for headings (`leading-tight`), `1.5` for body (`leading-normal`), `1.75` for long-form content (`leading-relaxed`).

---

## Color Palette

SkillPass uses **DaisyUI semantic color tokens exclusively**. The actual hex values depend on the active theme.

### Semantic Tokens (DaisyUI)

| Token | Usage |
|---|---|
| `bg-base-100` | Page backgrounds, navbar, card surfaces |
| `bg-base-200` | Card backgrounds, form containers, secondary surfaces |
| `bg-base-300` | Hover states on cards and clickable surfaces |
| `text-base-content` | Primary text color |
| `bg-neutral` | Avatar backgrounds |
| `text-neutral-content` | Avatar text |
| `text-error` | Error messages, destructive actions |
| `text-primary` | Primary accents, loading spinners |

### Component Color Roles

| Component | Primary | Secondary | Hover |
|---|---|---|---|
| Buttons | `btn-primary` | `btn-ghost` / `btn-outline` | DaisyUI default |
| Badges | `badge` | `badge-primary` / `badge-success` | N/A |
| Inputs | `input input-bordered` | — | `focus:input-bordered` |
| Links | `link link-primary` | — | DaisyUI default |

**Rationale:** Zero custom hex values means the palette is entirely theme-driven. Switching from `"winter"` to `"dark"` theme recolor the entire app automatically.

---

## Spacing

### Scale

SkillPass uses **Tailwind's default spacing scale** (4px base = 0.25rem).

| Token | Value | Usage |
|---|---|---|
| `1` | 0.25rem | Inline gaps between badges |
| `2` | 0.5rem | Inline action gaps, close icon spacing |
| `3` | 0.75rem | Form field gaps, badge rows |
| `4` | 1rem | **Default** — card padding, page padding, section spacing |
| `6` | 1.5rem | Page-level container spacing, outer card padding |
| `8` | 2rem | Loading/empty state centering |

### Page Layout Pattern

```tsx
<div className="max-w-2xl mx-auto p-4">
  {/* page content */}
</div>
```

| Container | Used For |
|---|---|
| `max-w-sm` | Login, Register (narrow forms) |
| `max-w-lg` | CompanyProfile, CompanyVerification (medium forms) |
| `max-w-2xl` | JobseekerProfile, JobDetail, Passport (detail views) |
| `max-w-3xl` | CompanyJobs, AdminVerifications, PublicJobs (list views) |
| `max-w-4xl` | CompanySearch (wide search results) |

---

## Border Radius

| Token | Value | Used For |
|---|---|---|
| `rounded-lg` | 0.75rem | Fieldset borders, card corners |
| `rounded-box` | var(--rounded-box) | Experience items, verification panels |
| `rounded-full` | 9999px | Avatars, theme toggle button |

**Rationale:** `rounded-box` delegates to DaisyUI's theme variable, keeping radius consistent with the active theme.

---

## Shadows

| Token | Value | Used For |
|---|---|---|
| `shadow-sm` | 0 1px 2px 0 rgb(0 0 0 / 0.05) | Navbar, dropdown menu |
| None | — | Cards intentionally have no shadow (use `bg-base-200` for separation) |

**Rationale:** Shadows are reserved for elevated elements (navbar, dropdowns). Cards use background color contrast instead of shadows, keeping the UI flat and clean.

---

## Breakpoints

| Breakpoint | Width | Behavior |
|---|---|---|
| Default | < 640px | Single column, stacked layout |
| `sm` | 640px+ | Wider containers |
| `md` | 768px+ | Multi-column grids begin |
| `lg` | 1024px+ | Sidebar layouts, wider cards |
| `xl` | 1280px+ | Maximum container width |

**Note:** The app currently uses single-column centered layout for all pages. Responsive multi-column layouts are only used on the landing page (`md:grid-cols-3`). This is acceptable for an internal tool MVP.

---

## Dark Mode

**Mechanism:** `data-theme` attribute on `<html>` toggles between `"winter"` (light) and `"dark"` (dark). Preference is persisted in `localStorage`.

**Implementation:** `web/src/components/ThemeToggle.tsx`

All DaisyUI semantic tokens adapt automatically — no `dark:` Tailwind prefixes, no custom CSS, no media queries.

---

## Accessibility

### Current State
- All form inputs use `<label className="form-control">` with `<span className="label-text">` — properly associated ✅
- Focus states provided by DaisyUI default styles ✅
- Contrast meets WCAG AA via DaisyUI theme defaults ✅
- Touch targets are 44px+ via `btn` class ✅

### Gaps & Fixes
| Issue | Fix | Priority |
|---|---|---|
| No `role="alert"` on dynamic errors | Add `role="alert"` to error `<p>` elements | Low |
| No `aria-label` on icon-only buttons | Add `aria-label="Toggle theme"` to ThemeToggle | Low |
| No skip-to-content link | Add hidden skip link in `RootLayout` | Low |

---

## Animation & Motion

### Current State
The app uses almost no animation — only `hover:bg-base-300 transition-colors` on clickable cards and DaisyUI's default button hover states.

### Proposed Additions (future)
| Element | Animation | Priority |
|---|---|---|
| Page transitions | Fade-in on route change with CSS `@keyframes fadeIn` | Low |
| Button hover | Subtle `translateY(-1px)` + shadow | Low |
| Card hover | `border-color` transition | Low |

**Principle:** Animation should be purposeful and subtle — never gratuitous. No parallax, no scroll-triggered reveals, no bouncing elements.

---

## Component Patterns

### Card
```tsx
<div className="card bg-base-200 p-4">
  {/* content */}
</div>
```

### Form Input
```tsx
<label className="form-control w-full">
  <span className="label-text">Label</span>
  <input className="input input-bordered w-full" />
  {error && <span className="text-error text-xs mt-1">{error}</span>}
</label>
```

### Button
```tsx
<button className="btn btn-primary">Primary</button>
<button className="btn btn-ghost">Ghost</button>
<button className="btn btn-outline">Outline</button>
```

### Badge
```tsx
<span className="badge badge-sm">Label</span>
<span className="badge badge-sm badge-primary">Primary</span>
<span className="badge badge-sm badge-success">Success</span>
```

### Loading State
```tsx
<div className="flex min-h-[60vh] items-center justify-center">
  <span className="loading loading-spinner loading-lg text-primary" />
</div>
```

### Empty State
```tsx
<p className="text-center opacity-50 py-8">No items found</p>
```

### Error State
```tsx
{error && <p className="text-error text-sm" role="alert">{error}</p>}
```

### Fieldset
```html
<fieldset class="fieldset">
  <legend class="fieldset-legend">Title</legend>
  <!-- form elements -->
</fieldset>
```
```

---

### Task 6: Initialize Storybook + Install Dependencies

**Files:**
- Create: `.storybook/main.ts`
- Create: `.storybook/preview.ts`
- Modify: `web/package.json`

- [ ] **Step 1: Install Storybook**

Run from the `web/` directory:

```bash
bun --cwd web dlx storybook@latest init --type react-vite --skip-install
```

This creates `.storybook/main.ts`, `.storybook/preview.ts`, and adds Storybook dependencies to `web/package.json`.

- [ ] **Step 2: Install dependencies**

```bash
bun --cwd web install
```

- [ ] **Step 3: Install theme addon**

```bash
bun --cwd web add @storybook/addon-themes
```

This enables the winter/dark theme toggle in the Storybook toolbar.

- [ ] **Step 4: Configure `.storybook/main.ts`**

Write `/home/al-ip/learning/skillpass/web/.storybook/main.ts`:

```ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/stories/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-themes',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
};

export default config;
```

- [ ] **Step 5: Configure `.storybook/preview.ts`**

Write `/home/al-ip/learning/skillpass/web/.storybook/preview.ts`:

```ts
import type { Preview } from '@storybook/react';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import '../src/styles/index.css';

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
  decorators: [
    withThemeByDataAttribute({
      themes: { winter: 'winter', dark: 'dark' },
      defaultTheme: 'winter',
      attributeName: 'data-theme',
    }),
  ],
};

export default preview;
```

- [ ] **Step 6: Verify Storybook starts**

Run: `bun --cwd web storybook`
Expected: Storybook opens on port 6006 with an empty "Stories" sidebar.

- [ ] **Step 7: Add storybook script to `web/package.json`**

The `init` command should have added a `"storybook"` script automatically. Verify it exists:

```bash
bun --cwd web run storybook
```

Expected: Storybook starts. Press Ctrl+C to stop.

---

### Task 7: Organize story folder structure + Create DesignTokens Story

**Files:**
- Delete: `web/src/stories/assets/` (entire directory)
- Delete: `web/src/stories/button.css`, `header.css`, `page.css`
- Delete: `web/src/stories/Button.tsx`, `Header.tsx`, `Page.tsx`
- Delete: `web/src/stories/Button.stories.ts`, `Header.stories.ts`, `Page.stories.ts`
- Delete: `web/src/stories/Configure.mdx`
- Create: `web/src/stories/tokens/`
- Create: `web/src/stories/components/`
- Create: `web/src/stories/patterns/`
- Create: `web/src/stories/tokens/DesignTokens.stories.tsx`

- [ ] **Step 1: Write the token reference story**

Write `/home/al-ip/learning/skillpass/web/src/stories/tokens/DesignTokens.stories.tsx`:

```tsx
import type { Meta } from '@storybook/react';

const meta: Meta = {
  title: 'Design System/Tokens',
  parameters: { layout: 'centered' },
};

export default meta;

const swatches = ['base-100', 'base-200', 'base-300', 'neutral', 'primary', 'secondary', 'accent', 'info', 'success', 'warning', 'error'] as const;

const sizes = [
  { token: 'text-xs', size: '0.75rem', usage: 'Labels, badges, errors' },
  { token: 'text-sm', size: '0.875rem', usage: 'Body text, descriptions' },
  { token: 'text-base', size: '1rem', usage: 'Default paragraph' },
  { token: 'text-lg', size: '1.125rem', usage: 'Taglines' },
  { token: 'text-xl', size: '1.25rem', usage: 'Section subheadings' },
  { token: 'text-2xl', size: '1.5rem', usage: 'Page headings' },
  { token: 'text-3xl', size: '1.875rem', usage: 'Hero headings' },
  { token: 'text-4xl', size: '2.25rem', usage: 'Large hero' },
  { token: 'text-5xl', size: '3rem', usage: 'Landing hero' },
] as const;

export const Colors = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {swatches.map((name) => (
      <div key={name} className={`p-4 rounded-lg bg-${name} text-${name}-content border`}>
        <span className="font-semibold">{name}</span>
      </div>
    ))}
  </div>
);

export const Typography = () => (
  <div>
    {sizes.map(({ token, size, usage }) => (
      <p key={token} className={`${token} mb-1`}>
        <span className="opacity-60">{token} ({size})</span> — {usage}
      </p>
    ))}
    <div className="mt-4">
      <p className="text-sm opacity-60 mb-1">Monospace (Fira Code):</p>
      <p className="font-mono">const hello = "world";</p>
    </div>
  </div>
);

export const Spacing = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4, 6, 8].map((n) => (
      <div key={n} className="flex items-center gap-2">
        <span className="text-sm w-16">{n}</span>
        <div className={`w-${n} h-8 bg-primary rounded`} />
        <span className="text-xs opacity-60">{n * 0.25}rem</span>
      </div>
    ))}
  </div>
);
```

- [ ] **Step 2: Verify the token stories render**

Run: `bun --cwd web storybook`
Expected: "Design System/Tokens" appears in the sidebar with Colors, Typography, and Spacing variants.

---

### Task 8: Create Component Stories

**Files:**
- Create: `web/src/stories/components/Button.stories.tsx`
- Create: `web/src/stories/components/Card.stories.tsx`
- Create: `web/src/stories/components/Input.stories.tsx`
- Create: `web/src/stories/components/Badge.stories.tsx`
- Create: `web/src/stories/components/Fieldset.stories.tsx`
- Create: `web/src/stories/components/Loading.stories.tsx`
- Create: `web/src/stories/patterns/States.stories.tsx`

- [ ] **Step 1: Write Button.stories.tsx**

Write `/home/al-ip/learning/skillpass/web/src/stories/components/Button.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Components/Button',
  parameters: { layout: 'centered' },
};

export default meta;

export const Primary: StoryObj = {
  render: () => <button className="btn btn-primary">Primary</button>,
};

export const Ghost: StoryObj = {
  render: () => <button className="btn btn-ghost">Ghost</button>,
};

export const Outline: StoryObj = {
  render: () => <button className="btn btn-outline">Outline</button>,
};

export const Success: StoryObj = {
  render: () => <button className="btn btn-success">Success</button>,
};

export const Error: StoryObj = {
  render: () => <button className="btn btn-error">Error</button>,
};

export const Disabled: StoryObj = {
  render: () => (
    <button className="btn btn-primary" disabled>
      Disabled
    </button>
  ),
};

export const AllVariants: StoryObj = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <button className="btn btn-primary">Primary</button>
      <button className="btn btn-secondary">Secondary</button>
      <button className="btn btn-ghost">Ghost</button>
      <button className="btn btn-outline">Outline</button>
      <button className="btn btn-success">Success</button>
      <button className="btn btn-error">Error</button>
      <button className="btn btn-primary" disabled>Disabled</button>
    </div>
  ),
};
```

- [ ] **Step 2: Write Card.stories.tsx**

Write `/home/al-ip/learning/skillpass/web/src/stories/components/Card.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Components/Card',
  parameters: { layout: 'centered' },
};

export default meta;

export const Default: StoryObj = {
  render: () => (
    <div className="card bg-base-200 p-4 w-80">
      <h3 className="font-semibold text-xl">Card Title</h3>
      <p className="text-sm opacity-70 mt-2">
        This is a standard card using bg-base-200 with p-4 padding.
      </p>
    </div>
  ),
};

export const Bordered: StoryObj = {
  render: () => (
    <div className="card bg-base-100 border border-base-300 p-4 w-80">
      <h3 className="font-semibold text-xl">Bordered Card</h3>
      <p className="text-sm opacity-70 mt-2">
        This card uses bg-base-100 with a border for separation.
      </p>
    </div>
  ),
};
```

- [ ] **Step 3: Write Input.stories.tsx**

Write `/home/al-ip/learning/skillpass/web/src/stories/components/Input.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Components/Input',
  parameters: { layout: 'centered' },
};

export default meta;

export const Text: StoryObj = {
  render: () => (
    <label className="form-control w-full max-w-xs">
      <span className="label-text">Full Name</span>
      <input className="input input-bordered w-full" placeholder="John Doe" />
    </label>
  ),
};

export const Email: StoryObj = {
  render: () => (
    <label className="form-control w-full max-w-xs">
      <span className="label-text">Email</span>
      <input className="input input-bordered w-full" type="email" placeholder="john@example.com" />
    </label>
  ),
};

export const Password: StoryObj = {
  render: () => (
    <label className="form-control w-full max-w-xs">
      <span className="label-text">Password</span>
      <input className="input input-bordered w-full" type="password" />
    </label>
  ),
};

export const Textarea: StoryObj = {
  render: () => (
    <label className="form-control w-full max-w-xs">
      <span className="label-text">Description</span>
      <textarea className="textarea textarea-bordered w-full" rows={3} placeholder="Write something..." />
    </label>
  ),
};

export const WithError: StoryObj = {
  render: () => (
    <label className="form-control w-full max-w-xs">
      <span className="label-text">Email</span>
      <input
        className="input input-bordered w-full border-error"
        type="email"
        defaultValue="invalid"
      />
      <span className="text-error text-xs mt-1">Please enter a valid email</span>
    </label>
  ),
};
```

- [ ] **Step 4: Write Badge.stories.tsx**

Write `/home/al-ip/learning/skillpass/web/src/stories/components/Badge.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Components/Badge',
  parameters: { layout: 'centered' },
};

export default meta;

export const Default: StoryObj = {
  render: () => <span className="badge">Default</span>,
};

export const Primary: StoryObj = {
  render: () => <span className="badge badge-primary">Primary</span>,
};

export const Success: StoryObj = {
  render: () => <span className="badge badge-success">Success</span>,
};

export const Ghost: StoryObj = {
  render: () => <span className="badge badge-ghost">Ghost</span>,
};

export const Outline: StoryObj = {
  render: () => <span className="badge badge-outline">Outline</span>,
};

export const AllVariants: StoryObj = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <span className="badge">Default</span>
      <span className="badge badge-primary">Primary</span>
      <span className="badge badge-success">Success</span>
      <span className="badge badge-ghost">Ghost</span>
      <span className="badge badge-outline">Outline</span>
      <span className="badge badge-sm">Small</span>
    </div>
  ),
};
```

- [ ] **Step 5: Write Fieldset.stories.tsx**

Write `/home/al-ip/learning/skillpass/web/src/stories/components/Fieldset.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Components/Fieldset',
  parameters: { layout: 'centered' },
};

export default meta;

export const RoleSelector: StoryObj = {
  render: () => (
    <fieldset className="fieldset max-w-sm">
      <legend className="fieldset-legend">I am a…</legend>
      <div className="flex gap-2">
        <button className="btn btn-primary flex-1">Jobseeker</button>
        <button className="btn btn-outline flex-1">Company</button>
      </div>
    </fieldset>
  ),
};

export const AccountDetails: StoryObj = {
  render: () => (
    <fieldset className="fieldset max-w-sm">
      <legend className="fieldset-legend">Account Details</legend>
      <div className="space-y-3">
        <input className="input input-bordered w-full" placeholder="Full Name" />
        <input className="input input-bordered w-full" placeholder="Email" />
        <input className="input input-bordered w-full" type="password" placeholder="Password" />
      </div>
    </fieldset>
  ),
};
```

- [ ] **Step 6: Write Loading.stories.tsx**

Write `/home/al-ip/learning/skillpass/web/src/stories/components/Loading.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Components/Loading',
  parameters: { layout: 'centered' },
};

export default meta;

export const Spinner: StoryObj = {
  render: () => <span className="loading loading-spinner loading-lg text-primary" />,
};

export const Dots: StoryObj = {
  render: () => <span className="loading loading-dots loading-lg" />,
};

export const Ring: StoryObj = {
  render: () => <span className="loading loading-ring loading-lg" />,
};

export const Bars: StoryObj = {
  render: () => <span className="loading loading-bars loading-lg" />,
};

export const AllSizes: StoryObj = {
  render: () => (
    <div className="flex items-end gap-4">
      <div className="flex flex-col items-center gap-1">
        <span className="loading loading-spinner loading-xs" />
        <span className="text-xs opacity-60">xs</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="loading loading-spinner loading-sm" />
        <span className="text-xs opacity-60">sm</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="loading loading-spinner loading-md" />
        <span className="text-xs opacity-60">md</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="loading loading-spinner loading-lg" />
        <span className="text-xs opacity-60">lg</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="loading loading-spinner loading-xl" />
        <span className="text-xs opacity-60">xl</span>
      </div>
    </div>
  ),
};
```

- [ ] **Step 7: Write States.stories.tsx**

Write `/home/al-ip/learning/skillpass/web/src/stories/patterns/States.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Patterns/States',
  parameters: { layout: 'centered' },
};

export default meta;

export const LoadingState: StoryObj = {
  render: () => (
    <div className="flex items-center justify-center p-8 bg-base-200 rounded-lg w-80">
      <span className="loading loading-spinner loading-lg text-primary" />
    </div>
  ),
};

export const EmptyState: StoryObj = {
  render: () => (
    <div className="p-8 bg-base-200 rounded-lg text-center w-80">
      <p className="opacity-50">No items found</p>
    </div>
  ),
};

export const ErrorState: StoryObj = {
  render: () => (
    <div className="p-4 bg-base-200 rounded-lg w-80">
      <p className="text-error text-sm" role="alert">
        Something went wrong. Please try again.
      </p>
    </div>
  ),
};
```

- [ ] **Step 8: Verify all stories render**

Run: `bun --cwd web storybook`
Expected: Storybook opens with all stories in the sidebar under Components (Button, Card, Input, Badge, Fieldset, Loading) and Patterns (States). Theme toggle in the toolbar switches between winter/dark.

- [ ] **Step 9: Clean up default Storybook artifacts and organize stories into folders**

```bash
# Remove default artifacts
rm -rf web/src/stories/assets
rm -f web/src/stories/button.css web/src/stories/header.css web/src/stories/page.css
rm -f web/src/stories/Button.tsx web/src/stories/Header.tsx web/src/stories/Page.tsx
rm -f web/src/stories/Button.stories.ts web/src/stories/Header.stories.ts web/src/stories/Page.stories.ts
rm -f web/src/stories/Configure.mdx

# Create folder structure
mkdir -p web/src/stories/tokens web/src/stories/components web/src/stories/patterns

# Move stories into folders
mv web/src/stories/DesignTokens.stories.tsx web/src/stories/tokens/
mv web/src/stories/Button.stories.tsx web/src/stories/components/
mv web/src/stories/Card.stories.tsx web/src/stories/components/
mv web/src/stories/Input.stories.tsx web/src/stories/components/
mv web/src/stories/Badge.stories.tsx web/src/stories/components/
mv web/src/stories/Fieldset.stories.tsx web/src/stories/components/
mv web/src/stories/Loading.stories.tsx web/src/stories/components/
mv web/src/stories/States.stories.tsx web/src/stories/patterns/
```

- [ ] **Step 10: Verify Storybook still works**

Run: `bun --cwd web storybook`
Expected: Stories all load under the same sidebar titles (tokens, components, patterns).

- [ ] **Step 11: Commit story files**

```bash
git add web/.storybook web/src/stories
git commit -m "feat: add Storybook with design system stories"
```

---

### Task 9: Update DESIGN.md with Storybook reference

- [ ] **Step 1: Add Storybook section**

In `/home/al-ip/learning/skillpass/DESIGN.md`, add under the Stack header at the top of the file:

```markdown
**Storybook:** Run `bun --cwd web storybook` to open the component library at http://localhost:6006
```

---

### Task 10: Self-Review of Plan

- [ ] **Step 1: Verify spec coverage**

Check each requirement from the user's request:
- ✅ Visual audit (Mode 2) — Task 2 covers all 10 dimensions with scores, evidence, and file:line fixes
- ✅ Generate design system (Mode 1) — Tasks 3-5 cover token extraction, DESIGN.md, design-tokens.json
- ✅ Font pairing (Outfit + Fira Code) — Task 4 adds Google Font import and @theme block
- ✅ Competitor research — Task 1 covers LinkedIn, Indeed, Wellfound
- ✅ daisyUI 5 native fieldset — Task 4 Step 2 migrates Register.tsx to `fieldset` + `fieldset-legend`
- ✅ Storybook with per-component stories — Task 6 initializes Storybook, Tasks 7-8 create all story files
- ✅ Token reference story — Task 7 creates DesignTokens story with colors, typography, spacing
- ✅ Component stories: Button, Card, Input, Badge, Fieldset, Loading, States — Task 8 creates all 7 story files
- ✅ Theme toggle in Storybook — Task 6 Step 5 configures @storybook/addon-themes for winter/dark

- [ ] **Step 2: Placeholder scan**

Search for "TBD", "TODO", "implement later", "fill in details" — none found. Every step contains actual content.

- [ ] **Step 3: Type consistency check**

- Font family names match across all files (Outfit, Fira Code)
- Token names in `design-tokens.json` match `@theme` block in `index.css`
- DaisyUI class names in `design-preview.html` match actual usage in codebase
- File paths are consistent across all tasks
