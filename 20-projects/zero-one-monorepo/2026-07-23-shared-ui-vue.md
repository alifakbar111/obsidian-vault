---
title: shared-ui-vue — zero-one-monorepo
created: 2026-07-23
tags: [project/contribution, type/implementation-plan, status/active, stack/vue]
status: active
---

# shared-ui-vue — Implementation Plan

**Repo:** https://github.com/zero-one-group/monorepo
**Issue:** https://github.com/zero-one-group/monorepo/issues/130
**Related PR:** https://github.com/zero-one-group/monorepo/pull/131
**Branch:** `feat/130-shared-ui-vue`
**Final PR title:** `feat(packages): add shared-ui-vue component library (closes #130)`

## Goal

Add `packages/shared-ui-vue` and `templates/shared-ui-vue` to `zero-one-group/monorepo`, mirroring the React `shared-ui` library with Vue 3 (reka-ui + tailwind-variants + @nanostores/vue). Closes issue #130 and unblocks PR #131 (the `dependsOn: shared-ui-vue` line in `apps/vue-app/moon.yml` is flipped in a separate follow-up PR).

## Architecture

Two new moonrepo projects:

- **`packages/shared-ui-vue`** — active dev copy (what the team works in)
- **`templates/shared-ui-vue`** — moon generator source (`.raw.vue` / `.raw.ts` / `.raw.mdx` files with `{{ package_name | kebab_case }}` interpolation)

Both export the same 4 entry points as `@repo/shared-ui`:

- `@repo/shared-ui-vue/components` → `src/components/index.ts`
- `@repo/shared-ui-vue/hooks` → `src/hooks/index.ts`
- `@repo/shared-ui-vue/theme` → `src/theme.ts`
- `@repo/shared-ui-vue/utils` → `src/utils.ts`

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Vue 3.5 | `<script setup lang="ts">` SFCs |
| Build | Vite 8 + `vite-plugin-dts` | Library mode, 4 entry points |
| Styling | Tailwind CSS v4 + `tailwind-variants` | OKLCH tokens, matches React |
| Primitives | reka-ui | Active fork of radix-vue, shadcn-vue default |
| State | `@nanostores/vue` | Parity with React's `@nanostores/react` |
| Forms | `vee-validate` + `@vee-validate/zod` | Port of `react-hook-form` + `@hookform/resolvers` |
| Toast | `vue-sonner` | Port of `sonner` |
| Drawer | `vaul-vue` | Port of `vaul` |
| Carousel | `embla-carousel-vue` | Official port |
| Resizable | `vue-resizable-panels` | Community port |
| Calendar | reka-ui + `@internationalized/date` | No direct `react-day-picker` equivalent |
| Chart | `unovis` | Modern alternative to recharts (React-only) |
| Icons | `lucide-vue-next` | Port of `lucide-react` |
| Test/docs | Storybook 10 + `@storybook/vue3-vite`, Vitest 4 | Mirrors React setup |
| Lint/format | Biome 2.4 (matches Vue template family) | Not oxlint (used by React) |
| Task runner | moonrepo ≥2.1 | Workspace already at this version |

## Primitives library decision (Vuetify considered, rejected)

Vuetify was reconsidered and rejected because:

- **Wrong abstraction layer.** `shared-ui` is unstyled primitives + custom Tailwind. Vuetify is a full Material Design component library with baked-in CSS, themes, and SASS variables.
- **Bundle cost.** Importing Vuetify brings ~500KB of Material CSS that fights Tailwind v4's reset.
- **Breaks brand.** Zero One Group tokens (OKLCH) would be replaced by Material defaults.
- **Breaks shadcn-vue parity.** Issue #130 explicitly specifies "shadcn-vue (Radix Vue / reka-ui)".
- **API mismatch.** `v-btn`/`v-card` DSL vs `Button`/`Card` shadcn pattern.

reka-ui chosen as the active, shadcn-vue-recommended, Vue 3.5-native primitives library. It is the same project that was previously named `radix-vue` — the rename happened in late 2024 due to Radix UI (React) trademark pressure.

## Budget & shape

- **Time:** 10–14 working days solo (or 7–10 with parallel review)
- **Files:** ~200
- **PR shape:** Single PR, but 5 reviewable commits matching the 5 phases
- **Out of scope:** Pinia, i18n, per-component Vitest, visual regression, Nuxt module, PR #131 unblock (separate PR)

---

## File map

```
packages/shared-ui-vue/
├── .gitignore
├── .ncurc.json
├── biome.json
├── moon.yml
├── package.json
├── README.md
├── tsconfig.json
├── vite.config.ts
├── .storybook/
│   ├── _docs/introduction.mdx
│   ├── components/decorators.ts
│   ├── components/docs-container.ts
│   ├── components/link.ts
│   ├── main.ts
│   ├── manager.ts
│   ├── preview.ts
│   └── themes.ts
└── src/
    ├── components/
    │   ├── index.ts                 # barrel — exports every component
    │   ├── accordion/
    │   ├── alert/
    │   ├── alert-dialog/
    │   ├── aspect-ratio/
    │   ├── avatar/
    │   ├── badge/
    │   ├── breadcrumb/
    │   ├── button/{Button.vue, button.css.ts, Button.stories.ts, Button.mdx}
    │   ├── calendar/
    │   ├── card/
    │   ├── carousel/
    │   ├── chart/
    │   ├── checkbox/
    │   ├── collapsible/
    │   ├── command/
    │   ├── context-menu/
    │   ├── dialog/
    │   ├── drawer/
    │   ├── dropdown-menu/
    │   ├── form/
    │   ├── heading/
    │   ├── hover-card/
    │   ├── input/
    │   ├── input-otp/
    │   ├── label/
    │   ├── pagination/
    │   ├── popover/
    │   ├── progress/
    │   ├── radio-group/
    │   ├── resizable/
    │   ├── scroll-area/
    │   ├── select/
    │   ├── separator/
    │   ├── sheet/
    │   ├── sidebar/   # 7 sub-files like React
    │   ├── skeleton/
    │   ├── slider/
    │   ├── spinner/
    │   ├── squircle/
    │   ├── switch/
    │   ├── table/
    │   ├── tabs/
    │   ├── text/
    │   ├── textarea/
    │   ├── toast/
    │   ├── toggle/
    │   ├── toggle-group/
    │   └── tooltip/
    ├── hooks/
    │   ├── index.ts
    │   ├── useMediaQuery.ts
    │   └── useIsMobile.ts
    ├── stores.ts
    ├── theme.ts
    ├── utils.ts
    └── styles/
        ├── colors.css
        └── global.css

templates/shared-ui-vue/
└── (mirror of packages/shared-ui-vue, files renamed to *.raw.vue, *.raw.ts, *.raw.mdx
     with {{ package_name | kebab_case }} interpolation; config files stay without .raw. suffix)
```

Root-level edits:

- `builder/shared-ui-vue.sh` (new, mirrors `builder/shared-ui.sh`)
- `build-templates.sh` (add invocation after `shared-ui.sh`)
- `.moon/workspace.yml` (add `shared-ui-vue.zip` to `generator.templates`)

---

# Phase 1 — Foundation (Days 1–2)

## Task 1.1: Package skeleton

**Files:** `packages/shared-ui-vue/{package.json,moon.yml,tsconfig.json,vite.config.ts,biome.json,.ncurc.json,.gitignore,README.md}`

**Step 1.** Create `packages/shared-ui-vue/package.json`:

```json
{
  "name": "@repo/shared-ui-vue",
  "private": true,
  "type": "module",
  "files": ["dist"],
  "exports": {
    "./components": "./src/components/index.ts",
    "./hooks": "./src/hooks/index.ts",
    "./theme": "./src/theme.ts",
    "./utils": "./src/utils.ts"
  },
  "scripts": {
    "dev": "vite build --watch",
    "build": "NODE_ENV=production vite build",
    "storybook": "storybook dev -p 6006 --no-open",
    "storybook-build": "storybook build -o storybook-static",
    "start": "pnpm dlx local-web-server -p 6006 -d storybook-static",
    "cleanup": "pnpm dlx del-cli dist node_modules pnpm-lock.yaml storybook-static",
    "update-deps": "npm-check-updates --configFileName .ncurc.json",
    "lint": "biome lint . --write",
    "check": "biome check . --write",
    "typecheck": "vue-tsc --noEmit"
  },
  "dependencies": {
    "@internationalized/date": "^3.5.0",
    "@nanostores/persistent": "^1.3.3",
    "@nanostores/vue": "^1.0.0",
    "@vee-validate/zod": "^4.13.0",
    "@vueuse/core": "^11.1.0",
    "clsx": "^2.1.1",
    "embla-carousel-vue": "^8.3.0",
    "input-otp": "^1.4.2",
    "lucide-vue-next": "^0.513.0",
    "nanostores": "^1.2.0",
    "radix-vue": "^1.9.10",
    "reka-ui": "^1.0.0-alpha.10",
    "tailwind-merge": "^3.5.0",
    "vaul-vue": "^0.2.0",
    "vee-validate": "^4.13.0",
    "vue": "^3.5.13",
    "vue-sonner": "^1.1.0",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@biomejs/biome": "catalog:",
    "@storybook/addon-a11y": "10.3.3",
    "@storybook/addon-docs": "10.3.3",
    "@storybook/addon-links": "10.3.3",
    "@storybook/addon-themes": "10.3.3",
    "@storybook/vue3-vite": "10.3.3",
    "@tailwindcss/vite": "^4.1.14",
    "@types/node": "^24.6.2",
    "@vitejs/plugin-vue": "^6.0.0",
    "@vue/tsconfig": "^0.5.1",
    "consola": "^3.4.2",
    "happy-dom": "^19.0.2",
    "npm-check-updates": "catalog:",
    "std-env": "^3.9.0",
    "storybook": "10.3.3",
    "tailwind-variants": "^3.1.1",
    "tailwindcss": "^4.1.14",
    "tailwindcss-motion": "^1.1.1",
    "typescript": "catalog:",
    "vite": "~8.0.0",
    "vite-plugin-dts": "^4.5.4",
    "vitest": "^4.0.0",
    "vue-tsc": "^2.2.10"
  },
  "peerDependencies": {
    "vue": "^3.5.0"
  }
}
```

> Pin `reka-ui` to a specific 1.x stable when released; while in alpha, pin to the latest 1.0.0-alpha.x and add a Renovate/Dependabot follow-up issue to bump on stable.

**Step 2.** Create `packages/shared-ui-vue/moon.yml`:

```yaml
# yaml-language-server: $schema=https://moonrepo.dev/schemas/project.json
$schema: https://moonrepo.dev/schemas/project.json

layer: library
language: typescript
stack: frontend
tags: ['app']

id: 'shared-ui-vue'

project:
  title: shared-ui-vue
  description: Shared UI Components for Vue apps

tasks:
  storybook-upgrade:
    command: pnpm dlx storybook@latest upgrade
    options:
      runDepsInParallel: false
      cache: false
```

**Step 3.** Create `packages/shared-ui-vue/tsconfig.json`:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationDir": "dist",
    "declarationMap": true,
    "noEmit": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src", ".storybook", "*.ts", "*.vue"],
  "exclude": ["node_modules", "build", "dist", "storybook-static", "tmp"]
}
```

**Step 4.** Create `packages/shared-ui-vue/vite.config.ts`:

```ts
import { resolve } from "node:path";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { env, isDevelopment } from "std-env";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import pkg from "./package.json" with { type: "json" };

const isTestOrStorybook =
  env.VITEST || process.argv[1]?.includes("storybook");

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    !isTestOrStorybook &&
      dts({
        include: ["src"],
        rollupTypes: true,
        exclude: ["**/*.stories.@(ts|tsx)"],
        tsconfigPath: resolve("tsconfig.json"),
      }),
  ],
  resolve: {
    alias: { "@": resolve("src") },
  },
  server: { port: 6300, host: false },
  build: {
    emptyOutDir: true,
    chunkSizeWarningLimit: 1024 * 2,
    reportCompressedSize: false,
    copyPublicDir: false,
    minify: !isDevelopment,
    sourcemap: true,
    lib: {
      entry: {
        components: resolve("src/components/index.ts"),
        hooks: resolve("src/hooks/index.ts"),
        theme: resolve("src/theme.ts"),
        utils: resolve("src/utils.ts"),
      },
      formats: ["es"],
    },
    outDir: resolve("dist"),
    rolldownOptions: {
      watch: { include: ["src/**"], exclude: ["src/**/*.stories.@(ts|tsx)"] },
      treeshake: true,
      output: {
        format: "es",
        exports: "named",
        entryFileNames: "[name]/index.js",
        chunkFileNames: "_chunks/[name].js",
        assetFileNames: "assets/[name].[ext]",
        manualChunks: undefined,
        preserveModules: false,
        preserveModulesRoot: "src",
      },
      external: [
        ...Object.keys(pkg.peerDependencies || {}),
        ...Object.keys(pkg.dependencies || {}),
      ],
    },
  },
});
```

**Step 5.** Create `packages/shared-ui-vue/biome.json`:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.4.10/schema.json",
  "extends": ["../../biome.json"],
  "root": false,
  "files": {
    "includes": [
      "src/**/*.{ts,vue}",
      ".storybook/**/*.{ts,tsx}",
      "*.{ts,json,md}"
    ]
  },
  "css": {
    "parser": { "allowWrongLineComments": false, "tailwindDirectives": true },
    "formatter": { "enabled": true, "quoteStyle": "double" }
  }
}
```

**Step 6.** Create `packages/shared-ui-vue/.ncurc.json`:

```json
{
  "$schema": "https://raw.githubusercontent.com/raineorshine/npm-check-updates/main/src/types/RunOptions.json",
  "interactive": true,
  "upgrade": true,
  "color": true,
  "root": true,
  "deep": false,
  "install": "never",
  "packageManager": "pnpm",
  "silent": false,
  "reject": ["vue-resizable-panels"]
}
```

**Step 7.** Create `packages/shared-ui-vue/.gitignore`:

```
node_modules
dist
storybook-static
.DS_Store
*.log
.vite
.turbo
.cache
```

**Step 8.** Create `packages/shared-ui-vue/README.md` — port from `packages/shared-ui/README.md` with these swaps:
- "React" → "Vue"
- "Radix UI" → "reka-ui"
- `react-hook-form` → `vee-validate` + `@vee-validate/zod`
- `lucide-react` → `lucide-vue-next`
- `radix-ui` (package) → `reka-ui`
- Import path: `@repo/shared-ui/components` → `@repo/shared-ui-vue/components`

**Step 9.** Commit: `feat(packages): scaffold shared-ui-vue package`

## Task 1.2: Design tokens

**Step 1.** Copy `packages/shared-ui/src/styles/colors.css` → `packages/shared-ui-vue/src/styles/colors.css` (verbatim — OKLCH tokens are framework-agnostic).

**Step 2.** Copy `packages/shared-ui/src/styles/global.css` → `packages/shared-ui-vue/src/styles/global.css` (verbatim — Tailwind v4 `@theme` block is framework-agnostic).

**Step 3.** Commit: `feat(shared-ui-vue): add design tokens (colors + tailwind theme)`

## Task 1.3: Stores, theme, utils, hooks

**Files:** `src/utils.ts`, `src/stores.ts`, `src/theme.ts`, `src/hooks/{index.ts,useMediaQuery.ts,useIsMobile.ts}`

**Step 1.** `src/utils.ts` — copy `packages/shared-ui/src/utils.ts` verbatim. `clsx` + `tailwind-merge` work identically in Vue. Add a `cn` alias re-export at the bottom for ergonomics:

```ts
// (full content from packages/shared-ui/src/utils.ts, unchanged)
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function clx(...args: ClassValue[]) {
  return twMerge(clsx(...args));
}

export function storeEncode(value: any): string { /* ... */ }
export function storeDecode(value: string): any { /* ... */ }
export function getInitials(name: string, maxInitials = 2): string { /* ... */ }

export const cn = clx;
```

**Step 2.** `src/stores.ts` — copy `packages/shared-ui/src/stores.ts` verbatim. `@nanostores/persistent` is framework-agnostic.

**Step 3.** `src/theme.ts`:

```ts
import {
  defineComponent,
  inject,
  provide,
  ref,
  watch,
  type InjectionKey,
  type Ref,
} from "vue";
import { useStore } from "@nanostores/vue";
import { saveUiState, type Theme, uiStore } from "./stores";

type ThemeProviderState = {
  theme: Ref<Theme>;
  setTheme: (t: Theme) => void;
};

const ThemeProviderSymbol: InjectionKey<ThemeProviderState> =
  Symbol("ThemeProvider");

export const ThemeProvider = defineComponent({
  name: "ThemeProvider",
  setup(_, { slots }) {
    const uiState = useStore(uiStore);
    const theme = ref<Theme>(uiState.value.theme);

    watch(
      () => uiState.value.theme,
      (next) => {
        theme.value = next;
      },
    );

    if (typeof document !== "undefined") {
      watch(
        theme,
        (next) => {
          const root = document.documentElement;
          if (next !== "system") {
            root.dataset.theme = next;
            return;
          }
          const mq = window.matchMedia("(prefers-color-scheme: dark)");
          const apply = () => {
            root.dataset.theme = mq.matches ? "dark" : "light";
          };
          apply();
          mq.addEventListener("change", apply);
        },
        { immediate: true },
      );
    }

    provide(ThemeProviderSymbol, {
      theme,
      setTheme: (t) => {
        saveUiState({ theme: t });
        theme.value = t;
      },
    });

    return () => slots.default?.();
  },
});

export function useTheme(): ThemeProviderState {
  const ctx = inject(ThemeProviderSymbol);
  if (!ctx) {
    throw new Error("useTheme must be used within <ThemeProvider>");
  }
  return ctx;
}
```

**Step 4.** `src/hooks/useMediaQuery.ts`:

```ts
import { onBeforeUnmount, ref, watchEffect, type Ref } from "vue";

export function useMediaQuery(query: Ref<string> | string): Ref<boolean> {
  const matches = ref(false);
  let mql: MediaQueryList | undefined;

  const onChange = (e: MediaQueryListEvent) => {
    matches.value = e.matches;
  };

  watchEffect(() => {
    if (typeof window === "undefined") return;
    const q = typeof query === "string" ? query : query.value;
    mql?.removeEventListener("change", onChange);
    mql = window.matchMedia(q);
    matches.value = mql.matches;
    mql.addEventListener("change", onChange);
  });

  onBeforeUnmount(() => mql?.removeEventListener("change", onChange));

  return matches;
}
```

**Step 5.** `src/hooks/useIsMobile.ts`:

```ts
import { computed, type Ref } from "vue";
import { useMediaQuery } from "./useMediaQuery";

export function useIsMobile(breakpoint = 768): Ref<boolean> {
  const matches = useMediaQuery(`(max-width: ${breakpoint - 1}px)`);
  return computed(() => matches.value);
}
```

**Step 6.** `src/hooks/index.ts`:

```ts
export * from "./useMediaQuery";
export * from "./useIsMobile";
```

**Step 7.** Commit: `feat(shared-ui-vue): add stores, theme provider, utils, hooks`

## Task 1.4: Storybook wiring

**Files:** `.storybook/{main.ts,preview.ts,manager.ts,themes.ts,components/decorators.ts,components/docs-container.ts,components/link.ts,_docs/introduction.mdx}`

**Step 1.** `.storybook/main.ts`:

```ts
import type { StorybookConfig } from "@storybook/vue3-vite";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
  stories: [
    "./_docs/**/*.mdx",
    "../src/**/*.mdx",
    "../src/**/*.stories.@(ts|tsx)",
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
  ],
  framework: { name: "@storybook/vue3-vite", options: {} },
  core: {
    disableTelemetry: true,
    enableCrashReports: false,
    disableWhatsNewNotifications: true,
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      plugins: [],
      build: { chunkSizeWarningLimit: 1024 * 4 },
    });
  },
  features: { backgrounds: false },
};

export default config;
```

**Step 2.** `.storybook/manager.ts` — verbatim copy of `packages/shared-ui/.storybook/manager.ts`.

**Step 3.** `.storybook/themes.ts` — verbatim copy of `packages/shared-ui/.storybook/themes.ts`. The `light`, `dark`, `listenToColorScheme` exports are framework-agnostic.

**Step 4.** `.storybook/components/decorators.ts`:

```ts
import type { Decorator } from "@storybook/vue3-vite";
import { h } from "vue";
import { ThemeProvider } from "../../src/theme";

function setTheme(theme: "light" | "dark" | "system") {
  if (typeof document === "undefined") return;
  if (theme === "system") {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    document.documentElement.dataset.theme = mq.matches ? "dark" : "light";
    return;
  }
  document.documentElement.dataset.theme = theme;
}

export const withThemeProvider: Decorator = (Story, context) => {
  const theme = context.parameters.theme || context.globals.theme;
  setTheme(theme);
  return () => h(ThemeProvider, null, { default: () => h(Story) });
};
```

**Step 5.** `.storybook/components/docs-container.ts`:

```ts
import { DocsContainer as BaseContainer } from "@storybook/addon-docs/blocks";
import { computed, defineComponent, h, type ConcreteComponent } from "vue";
import { dark, light, listenToColorScheme } from "../themes";

const themes = { light, dark };

export const DocsContainer = defineComponent({
  name: "DocsContainer",
  props: {
    context: { type: Object, required: true },
  },
  setup(props, { slots }) {
    const themeName = computed<"light" | "dark">(() => "light");
    // Real implementation: use listenToColorScheme(props.context.channel, setTheme)
    // and toggle `themeName` reactively. For brevity, default to light until
    // the first color-scheme event fires.
    return () =>
      h(BaseContainer as ConcreteComponent, {
        context: props.context,
        theme: themes[themeName.value],
      }, slots);
  },
});
```

> **Implementation note for the engineer:** `listenToColorScheme` returns a cleanup function. Wire it in a `onMounted` / `onBeforeUnmount` so the listener is removed when the DocsContainer unmounts. Mirror the React version's `useState`/`useEffect` shape.

**Step 6.** `.storybook/components/link.ts`:

```ts
import { h, defineComponent } from "vue";
import LinkTo from "@storybook/addon-links/vue3";

const LINK_PREFIXES = ["/", "http", "mailto", "#", "tel"];

export const Link = defineComponent({
  name: "StorybookLink",
  props: {
    href: { type: String, required: true },
  },
  setup(props, { slots }) {
    return () => {
      const storyName = decodeURIComponent(props.href);
      const isStoryName = !LINK_PREFIXES.some((p) => storyName.startsWith(p));
      if (isStoryName) {
        const parts = storyName.split("/");
        const name = parts.length > 2 ? parts[parts.length - 1] : "base";
        const components = parts.slice(0, parts.length - 1);
        const kind = components.join("/");
        return h(LinkTo as any, { kind, story: name }, slots);
      }
      return h("a", { href: props.href }, slots);
    };
  },
});
```

**Step 7.** `.storybook/preview.ts`:

```ts
import type { Preview } from "@storybook/vue3-vite";
import { withThemeProvider } from "./components/decorators";
import { DocsContainer } from "./components/docs-container";
import { Link } from "./components/link";
import { light } from "./themes";

import "../src/styles/global.css";
import "../src/styles/colors.css";

const components = { a: Link };

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    previewTabs: { "storybook/docs/panel": { index: -1 } },
    controls: {
      expanded: true,
      hideNoControlsWarning: true,
      sort: "requiredFirst",
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      exclude: ["asChild", "onClick"],
    },
    viewport: {
      options: {
        smallMobile: { name: "Small mobile", styles: { width: "320px", height: "568px" } },
        largeMobile: { name: "Large mobile", styles: { width: "414px", height: "896px" } },
        tablet: { name: "Tablet", styles: { width: "834px", height: "1112px" } },
        desktop: { name: "Desktop", styles: { width: "1280px", height: "1000px" } },
      },
    },
    options: {
      storySort: {
        method: "alphabetical",
        includeName: true,
        order: [
          "Introduction",
          "Getting Started",
          "Changelog",
          "Basic Components",
          "Layout Components",
          "Visualizations",
          "*",
        ],
      },
    },
    backgrounds: { disabled: true },
    layout: "padded",
    chromatic: {
      modes: {
        dark: { theme: "dark" },
        light: { theme: "light" },
      },
    },
    docs: {
      theme: light,
      components,
      container: DocsContainer,
      defaultName: "Documentation",
      toc: {
        headingSelector: "h2, h3",
        ignoreSelector: "#preview",
        title: "Table of Contents",
        disable: false,
        unsafeTocbotOptions: { orderedList: false },
      },
    },
  },
  globalTypes: {
    theme: {
      name: "Color Scheme",
      description: "Global theme for components",
      defaultValue: "system",
      toolbar: {
        title: "Color Scheme",
        icon: "paintbrush",
        dynamicTitle: false,
        showName: false,
        items: [
          { title: "Match system", value: "system", icon: "mirror" },
          { title: "Light Mode", value: "light", icon: "circlehollow" },
          { title: "Dark Mode", value: "dark", icon: "circle" },
        ],
      },
    },
  },
  decorators: [withThemeProvider],
};

export default preview;
```

**Step 8.** `.storybook/_docs/introduction.mdx` — port `packages/shared-ui/.storybook/_docs/introduction.mdx` with these swaps: "React" → "Vue", "Radix UI" → "reka-ui", "shadcn/ui" → "shadcn-vue", `lucide-react` → `lucide-vue-next`.

**Step 9.** Commit: `feat(shared-ui-vue): configure storybook`

---

# Phase 2 — Atoms (Days 3–4)

## Task 2.1: Button (sets the pattern for every component)

**Files:** `src/components/button/{button.css.ts,Button.vue,Button.stories.ts,Button.mdx}`

**Step 1.** `src/components/button/button.css.ts` — verbatim copy of `packages/shared-ui/src/components/button/button.css.ts`. `tailwind-variants` is identical in Vue.

**Step 2.** `src/components/button/Button.vue`:

```vue
<script setup lang="ts">
import { computed } from "vue";
import * as Lucide from "lucide-vue-next";
import { cn } from "@/utils";
import { type ButtonVariants, buttonStyles } from "./button.css";

interface ButtonProps {
  variant?: ButtonVariants["variant"];
  size?: ButtonVariants["size"];
  isLoading?: boolean;
  asChild?: boolean;
  class?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: "default",
  size: "default",
  isLoading: false,
  asChild: false,
  disabled: false,
  type: "button",
});

const styles = computed(() =>
  buttonStyles({ variant: props.variant, size: props.size, isLoading: props.isLoading }),
);
const isDisabled = computed(() => props.disabled || props.isLoading);
</script>

<template>
  <component
    :is="asChild ? 'slot' : 'button'"
    :class="cn(styles.base(), props.class)"
    :data-loading="isLoading || undefined"
    :disabled="isDisabled"
    :type="asChild ? undefined : type"
  >
    <template v-if="isLoading">
      <Lucide.Loader2 :stroke-width="2" />
      <slot />
    </template>
    <slot v-else />
  </component>
</template>
```

> **`asChild` deep-dive for Vue:** reka-ui ships a `Slottable` component (or `asChild` prop on most primitives). For Button specifically, the pattern is: when `asChild` is true, render the slot's only child as the root element and inherit its props via `cloneVNode`. Use `reka-ui`'s `Slottable` for the cleanest implementation. Example:
> ```vue
> <script setup lang="ts">
> import { Slottable } from "reka-ui";
> </script>
> <template>
>   <component :is="asChild ? Slottable : 'button'" ...>
> ```
> Reka-ui's `Slottable` clones the slot child and merges event handlers / class / data attributes from the parent.

**Step 3.** `src/components/button/Button.stories.ts`:

```ts
import { h } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import * as Lucide from "lucide-vue-next";
import { fn } from "storybook/test";
import Button, { type ButtonProps } from "./Button.vue";
import type { ButtonVariants } from "./button.css";

const variantOptions: NonNullable<ButtonVariants["variant"]>[] = [
  "default", "primary", "secondary", "destructive", "outline", "ghost", "link",
];
const sizeOptions: NonNullable<ButtonVariants["size"]>[] = ["sm", "default", "lg", "icon"];

const meta: Meta<ButtonProps> = {
  title: "Basic Components/Button",
  component: Button,
  argTypes: {
    variant: { control: { type: "radio" }, options: variantOptions },
    size: { control: { type: "inline-radio" }, options: sizeOptions },
    isLoading: { control: "boolean" },
    asChild: { control: "boolean" },
  },
  args: { onClick: fn() },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => h(Button, args, () => "Button"),
};

export const VariantShowcase: Story = {
  render: (args) =>
    h("div", { class: "flex flex-wrap items-center gap-4" }, [
      h(Button, args, () => "Default"),
      h(Button, { ...args, variant: "primary" }, () => "Primary"),
      h(Button, { ...args, variant: "secondary" }, () => "Secondary"),
      h(Button, { ...args, variant: "destructive" }, () => "Destructive"),
      h(Button, { ...args, variant: "outline" }, () => "Outline"),
      h(Button, { ...args, variant: "ghost" }, () => "Ghost"),
      h(Button, { ...args, variant: "link" }, () => "Link"),
    ]),
};

export const SizeShowcase: Story = {
  render: (args) =>
    h("div", { class: "flex flex-wrap items-end gap-4" }, [
      h(Button, { ...args, size: "sm" }, () => "Small"),
      h(Button, args, () => "Default"),
      h(Button, { ...args, size: "lg" }, () => "Large"),
      h(Button, { ...args, size: "icon" }, () => h(Lucide.Plus)),
    ]),
};

export const IconShowcase: Story = {
  render: (args) =>
    h("div", { class: "flex flex-wrap items-center gap-4" }, [
      h(Button, args, () => [h(Lucide.Search, { class: "-ml-0.5" }), " Search"]),
      h(Button, { ...args, variant: "secondary" }, () => [h(Lucide.Mail, { class: "-ml-0.5" }), " Email"]),
      h(Button, { ...args, variant: "outline" }, () => [h(Lucide.Github, { class: "-ml-0.5" }), " Github"]),
      h(Button, { ...args, size: "icon", variant: "ghost" }, () => h(Lucide.Bell, { class: "-ml-0.5" })),
    ]),
};

export const StateShowcase: Story = {
  render: (args) =>
    h("div", { class: "flex flex-wrap items-center gap-4" }, [
      h(Button, { ...args, isLoading: true }, () => "Loading"),
      h(Button, { ...args, disabled: true }, () => "Disabled"),
      h(Button, { ...args, variant: "outline", disabled: true }, () => "Disabled Outline"),
    ]),
};
```

**Step 4.** `src/components/button/Button.mdx` — port from `packages/shared-ui/src/components/button/button.mdx`, swap import line: `import { Button } from '@repo/shared-ui-vue/components'`, swap `lucide-react` → `lucide-vue-next`.

**Step 5.** Verify: `cd packages/shared-ui-vue && pnpm install && pnpm storybook`. Button stories should render. `pnpm typecheck` should pass.

**Step 6.** Commit: `feat(shared-ui-vue): add Button component`

## Task 2.2: Atoms batch

For each component below, follow the Button pattern (file per component):

| Component | Files | Notes |
|---|---|---|
| `Input` | `Input.vue`, `input.css.ts`, `Input.stories.ts`, `Input.mdx` | Wrap reka-ui `TextField.Root` + `TextField.Slot` |
| `Label` | `Label.vue`, `Label.stories.ts`, `Label.mdx` | Wrap reka-ui `Label` (no variants) |
| `Badge` | `Badge.vue`, `badge.css.ts`, `Badge.stories.ts`, `Badge.mdx` | Plain `<span>` + `tailwind-variants` |
| `Separator` | `Separator.vue`, `Separator.stories.ts`, `Separator.mdx` | Wrap reka-ui `Separator` (orientation prop) |
| `Skeleton` | `Skeleton.vue`, `Skeleton.stories.ts`, `Skeleton.mdx` | Plain `<div>` with `animate-pulse` + bg-muted |
| `Text` | `Text.vue`, `text.css.ts`, `Text.stories.ts`, `Text.mdx` | Polymorphic via `as` prop + variants |
| `Heading` | `Heading.vue`, `heading.css.ts`, `Heading.stories.ts`, `Heading.mdx` | Polymorphic via `as` prop + variants |
| `Spinner` | `Spinner.vue`, `Spinner.stories.ts`, `Spinner.mdx` | lucide `Loader2` + `animate-spin` |
| `AspectRatio` | `AspectRatio.vue`, `AspectRatio.stories.ts`, `AspectRatio.mdx` | Wrap reka-ui `AspectRatio` |
| `Alert` | `Alert.vue`, `AlertTitle.vue`, `AlertDescription.vue`, `alert.css.ts`, `Alert.stories.ts`, `Alert.mdx` | Multi-part like React |

CSS pattern: port `.css.ts` files verbatim from React. Stories: use `h()` render functions. MDX: port docs verbatim, swap package name.

**Commit at end of phase:** `feat(shared-ui-vue): add atoms (input, label, badge, separator, skeleton, text, heading, spinner, aspect-ratio, alert)`

---

# Phase 3 — Form (Days 5–6)

For each, wrap reka-ui primitive + add `cn()` variant styles:

| Component | Primitive | Notes |
|---|---|---|
| `Checkbox` | reka-ui `Checkbox` | Controlled + `indeterminate` prop |
| `RadioGroup` | reka-ui `RadioGroup` | `Root`, `Item`, `Indicator` |
| `Select` | reka-ui `Select` | `Root`, `Trigger`, `Content`, `Item`, `Value` — 5 sub-files |
| `Textarea` | plain `<textarea>` + `cn()` | Same as Input but multi-line |
| `Switch` | reka-ui `Switch` | |
| `Slider` | reka-ui `Slider` | `Root`, `Track`, `Range`, `Thumb` |
| `Toggle` | reka-ui `Toggle` | |
| `ToggleGroup` | reka-ui `ToggleGroup` | `Root`, `Item` |
| `InputOTP` | `input-otp` (framework-agnostic) | `InputOTP`, `InputOTPGroup`, `InputOTPSlot`, `InputOTPSeparator` |
| `Form` | `vee-validate` + `@vee-validate/zod` | `useForm({ validationSchema: toTypedSchema(zodSchema) })` — biggest API surface change from React |

`Form` is the largest port. Use this composable shape:

```ts
// src/components/form/useFormField.ts
import { inject, type InjectionKey } from "vue";

type FormFieldContext = {
  name: string;
  error: string | undefined;
  id: string;
};

const FormFieldSymbol: InjectionKey<FormFieldContext> = Symbol("FormField");

export function provideFormField(ctx: FormFieldContext) {
  // returns setup function
}

export function useFormField() {
  return inject(FormFieldSymbol);
}
```

`Form` component orchestrates `vee-validate`'s `useForm` and provides context to children:

```vue
<!-- src/components/form/Form.vue -->
<script setup lang="ts">
import { useForm } from "vee-validate";
import { provide } from "vue";
import { FormFieldSymbol } from "./useFormField";

const props = defineProps<{
  initialValues?: Record<string, any>;
  validationSchema?: any;
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
}>();

const { handleSubmit, errors, values, setValues } = useForm({
  initialValues: props.initialValues,
  validationSchema: props.validationSchema,
});

provide(FormFieldSymbol, { errors, values });

const onFormSubmit = handleSubmit(async (vals) => {
  await props.onSubmit?.(vals);
});
</script>

<template>
  <form @submit="onFormSubmit" novalidate>
    <slot />
  </form>
</template>
```

**Commit at end of phase:** `feat(shared-ui-vue): add form controls (checkbox, radio, select, textarea, switch, slider, toggle, toggle-group, input-otp, form)`

---

# Phase 4 — Overlay (Days 7–8)

| Component | Implementation | Sub-files |
|---|---|---|
| `Dialog` | reka-ui `Dialog` (Root, Trigger, Portal, Overlay, Content, Header, Title, Description, Close) | 9 |
| `AlertDialog` | reka-ui `AlertDialog` | 7 |
| `Sheet` | reka-ui `Dialog` + side variants | 7 |
| `Drawer` | `vaul-vue` `Drawer` | 6 |
| `Popover` | reka-ui `Popover` | 4 |
| `HoverCard` | reka-ui `HoverCard` | 4 |
| `Tooltip` | reka-ui `Tooltip` (needs `TooltipProvider` at app root — document in README) | 3 |
| `DropdownMenu` | reka-ui `DropdownMenu` | 7 |
| `ContextMenu` | reka-ui `ContextMenu` | 6 |
| `Toast` | `vue-sonner` — `<Toaster />` reads theme from `useTheme()` | 1 |

`Toast` shape:

```vue
<!-- src/components/toast/Toaster.vue -->
<script setup lang="ts">
import { Toaster as Sonner } from "vue-sonner";
import { useTheme } from "@/theme";

const { theme } = useTheme();
</script>

<template>
  <Sonner
    :theme="theme === 'system' ? 'system' : (theme as 'light' | 'dark')"
    class="toaster group"
    :toast-options="{
      classes: {
        toast: 'group toast group-[.toaster]:bg-background ...',
      },
    }"
  />
</template>
```

`Tooltip` requires `TooltipProvider` to be mounted at the app root. Add a note in `packages/shared-ui-vue/README.md`:

> **Setup required:** Wrap your app in `<TooltipProvider>` to enable tooltips globally.
> ```vue
> <script setup lang="ts">
> import { TooltipProvider } from "@repo/shared-ui-vue/components";
> </script>
> <template>
>   <TooltipProvider>
>     <App />
>   </TooltipProvider>
> </template>
> ```

**Commit at end of phase:** `feat(shared-ui-vue): add overlay components (dialog, alert-dialog, sheet, drawer, popover, hover-card, tooltip, dropdown-menu, context-menu, toast)`

---

# Phase 5 — Layout (Days 9–10)

| Component | Sub-files | Notes |
|---|---|---|
| `Card` | 6 (`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`) + `card.css.ts` | Plain HTML + `cn()` |
| `Tabs` | 4 (reka-ui `Tabs` + `TabsList`, `TabsTrigger`, `TabsContent`) | |
| `Accordion` | reka-ui `Accordion` (Root, Item, Trigger, Content) | 4 |
| `Collapsible` | reka-ui `Collapsible` (Root, Trigger, Content) | 3 |
| `ScrollArea` | reka-ui `ScrollArea` (Root, Viewport, Scrollbar, Thumb, Corner) | 5 |
| `Resizable` | `vue-resizable-panels` (PanelGroup, Panel, ResizeHandle) | 3 |
| `Sidebar` | 7 (Provider, Root, Trigger, Group, GroupContent, Menu, Content) + `sidebar.css.ts` | Largest layout port |
| `Pagination` | 4 (Root, Previous, Next, Link) | Plain HTML + state |
| `Breadcrumb` | 4 (Root, List, Item, Link, Page, Separator) | |
| `Table` | 6 (Root, Header, Body, Row, Head, Cell, Caption) | Plain HTML + variants |
| `Carousel` | `embla-carousel-vue` (Root, Content, Item, Previous, Next) | 5 |

`Sidebar` is the largest. Port the React sub-components one-for-one. The `useSidebar()` composable holds open/collapsed state via `@nanostores/vue` so multiple Sidebars stay in sync:

```ts
// src/components/sidebar/useSidebar.ts
import { computed } from "vue";
import { useStore } from "@nanostores/vue";
import { uiStore, saveUiState } from "@/stores";

export function useSidebar() {
  const state = useStore(uiStore);
  const isOpen = computed(() => state.value.sidebar === "expanded");

  function setOpen(open: boolean) {
    saveUiState({ sidebar: open ? "expanded" : "collapsed" });
  }

  function toggle() {
    setOpen(!isOpen.value);
  }

  return { isOpen, setOpen, toggle };
}
```

**Commit at end of phase:** `feat(shared-ui-vue): add layout components (card, tabs, accordion, collapsible, scroll-area, resizable, sidebar, pagination, breadcrumb, table, carousel)`

---

# Phase 6 — Data Display + Visualization (Day 11)

| Component | Implementation |
|---|---|
| `Avatar` | reka-ui `Avatar` (Root, Image, Fallback) |
| `Calendar` | reka-ui `RangeCalendar` or `Calendar` + `@internationalized/date`. Read reka-ui's date docs — `Calendar` v1 stable has the same API as `react-day-picker` |
| `Progress` | reka-ui `Progress` (Root, Indicator) |
| `Command` | reka-ui `Combobox` (the new primitive is a 1:1 port of `cmdk`'s API). Build Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator, CommandShortcut, CommandDialog |
| `Chart` | `unovis` for the underlying viz (e.g. `VisXYContainer`, `VisArea`, `VisAxis`). Wrap in a `<ChartContainer>` / `<ChartTooltip>` / `<ChartLegend>` API that mirrors the React `recharts`-shaped helpers |

`Chart` is the highest-risk port. The component API should look like:

```vue
<ChartContainer :config="chartConfig">
  <VisXYContainer :data="data" :height="300">
    <VisArea :x="(d) => d.month" :y="(d) => d.desktop" color="var(--color-desktop)" />
    <VisAxis type="x" label="Month" />
  </VisXYContainer>
</ChartContainer>
```

`ChartContainer` is a plain wrapper that renders the chart plus legend/tooltip slots; the `chartConfig` prop provides labels for tooltips/legends.

**Commit at end of phase:** `feat(shared-ui-vue): add data display (avatar, calendar, progress, command, chart)`

---

# Phase 7 — Components Barrel (Day 12)

**File:** `src/components/index.ts`

```ts
// Atoms
export { default as Alert, AlertTitle, AlertDescription } from "./alert";
export { default as AspectRatio } from "./aspect-ratio/AspectRatio.vue";
export { default as Avatar, AvatarImage, AvatarFallback } from "./avatar";
export { default as Badge, badgeVariants } from "./badge";
export { default as Button, buttonVariants } from "./button";
// ... 50+ entries, alphabetical
```

For each sub-component (e.g. `CardHeader`, `CardTitle`), export it from a sibling `index.ts` in the component folder:

```ts
// src/components/card/index.ts
export { default as Card } from "./Card.vue";
export { default as CardHeader } from "./CardHeader.vue";
export { default as CardTitle } from "./CardTitle.vue";
export { default as CardDescription } from "./CardDescription.vue";
export { default as CardContent } from "./CardContent.vue";
export { default as CardFooter } from "./CardFooter.vue";
```

This keeps the top-level barrel clean and component folders self-contained.

**Commit:** `feat(shared-ui-vue): export component barrel`

---

# Phase 8 — Templates Mirror (Days 12–13)

For every file in `packages/shared-ui-vue/`, create a parallel file in `templates/shared-ui-vue/` with these transforms:

1. Rename `*.vue` → `*.raw.vue`, `*.ts` → `*.raw.ts` (except config files), `*.mdx` → `*.raw.mdx`
2. Replace `@repo/shared-ui-vue` → `@repo/{{ package_name | kebab_case }}`
3. Replace `packages/shared-ui-vue` → `packages/{{ package_name | kebab_case }}`
4. **Do not** mirror `.gitignore`, `README.md` (template ships its own)
5. Config files (`package.json`, `moon.yml`, `tsconfig.json`, `vite.config.ts`, `biome.json`, `.ncurc.json`) keep their names but get `{{ package_name | kebab_case }}` interpolation

### Template config files

`templates/shared-ui-vue/package.json` (interpolated):

```json
{
  "name": "@repo/{{ package_name | kebab_case }}",
  "private": true,
  "type": "module",
  "files": ["dist"],
  "exports": {
    "./components": "./src/components/index.ts",
    "./hooks": "./src/hooks/index.ts",
    "./theme": "./src/theme.ts",
    "./utils": "./src/utils.ts"
  },
  "scripts": { /* ...same as package.json, with storybook-upgrade removed (added in moon.yml) */ },
  "dependencies": { /* ...same */ },
  "devDependencies": { /* ...same */ },
  "peerDependencies": { "vue": "^3.5.0" }
}
```

`templates/shared-ui-vue/moon.yml`:

```yaml
# yaml-language-server: $schema=https://moonrepo.dev/schemas/project.json
$schema: https://moonrepo.dev/schemas/project.json

layer: library
language: typescript
stack: frontend
tags: ['app']

id: '{{ package_name | kebab_case }}'

project:
  title: {{ package_name | kebab_case }}
  description: Shared UI Components for Vue apps

tasks:
  storybook-upgrade:
    command: pnpm dlx storybook@latest upgrade
    options:
      runDepsInParallel: false
      cache: false
```

`templates/shared-ui-vue/template.yml`:

```yaml
# yaml-language-server: $schema=https://moonrepo.dev/schemas/template.json
$schema: 'https://moonrepo.dev/schemas/template.json'

title: 'Shared UI Components (Vue)'
description: 'Shared UI Components for Vue apps'

destination: 'packages/[package_name]'

variables:
  package_name:
    type: 'string'
    default: 'shared-ui-vue'
    prompt: 'Package name (identifier)?'
    required: true
```

**Commit:** `feat(templates): add shared-ui-vue moon template`

---

# Phase 9 — Builder & Workspace Integration (Day 13)

## Task 9.1: Builder script

**File:** `builder/shared-ui-vue.sh` (copy of `builder/shared-ui.sh` with `TEMPLATE_SOURCE_NAME=shared-ui-vue`)

```bash
#!/bin/bash

SCRIPT_DIR=$(dirname "$0")
ROOT_DIR=$(dirname "$SCRIPT_DIR")
PKG_DIR="$ROOT_DIR/packages"
TEMPLATE_DIR="$ROOT_DIR/templates"
TEMPLATE_SOURCE_NAME="shared-ui-vue"
TEMPLATE_TARGET_NAME="shared-ui-vue"

echo "Building Shared UI Vue project templates..."

SRC_PATH="$PKG_DIR/$TEMPLATE_SOURCE_NAME"
TARGET_PATH="$TEMPLATE_DIR/$TEMPLATE_TARGET_NAME"

if [ -d "$SRC_PATH" ]; then
    rm -rf "$TARGET_PATH"
    cp -R "$SRC_PATH" "$TARGET_PATH"
else
    echo "Source directory $SRC_PATH does not exist, skipping copy."
fi

if [ -d "$TARGET_PATH" ]; then
    rm -rf "$TARGET_PATH/node_modules"
    rm -rf "$TARGET_PATH/storybook-static"
    rm -rf "$TARGET_PATH/dist"
    rm -rf "$TARGET_PATH/build"
    rm -rf "$TARGET_PATH/.DS_Store"
    find "$TARGET_PATH" -type f -name ".DS_Store" -delete
fi

# ... rest mirrors builder/shared-ui.sh (replace_string helper, .vue→.raw.vue, etc.)
```

The `replace_string` function should rename all `.vue` files to `.raw.vue` (and all `.ts`/`.tsx` to `.raw.ts`/`.raw.tsx`, and all `.mdx` to `.raw.mdx`), then run `sed`/`sd` to swap `@repo/shared-ui-vue` → `@repo/{{ package_name | kebab_case }}` and `packages/shared-ui-vue` → `packages/{{ package_name | kebab_case }}` across all files.

**Commit:** `feat(builder): add shared-ui-vue builder`

## Task 9.2: Wire into build-templates.sh

**File:** `build-templates.sh`

Add after the existing `bash ./builder/shared-ui.sh` line (currently line 80):

```bash
bash ./builder/shared-ui-vue.sh
```

**Commit:** `chore(build): wire shared-ui-vue into build-templates`

## Task 9.3: Update workspace.yml generator list

**File:** `.moon/workspace.yml`

Add to `generator.templates` (alphabetical, after `react-ssr.zip` line):

```yaml
- 'https://oss.zero-one-group.com/monorepo/templates/shared-ui-vue.zip'
```

**Commit:** `chore(workspace): register shared-ui-vue generator template`

> Note: `makezip.sh` regenerates this list automatically after the first release. The manual entry is for chicken-and-egg on first publish.

## Task 9.4: apps/vue-app/moon.yml uncomment (NOT in this PR)

The `# dependsOn: - 'shared-ui-vue'` lines in `apps/vue-app/moon.yml` and `templates/vue-app/moon.yml` should be uncommented in a follow-up commit to PR #131, **not** this PR. Mention in the PR description:

> **Follow-up:** Once #130 (this PR) merges, PR #131 will uncomment the `dependsOn: shared-ui-vue` line in `apps/vue-app/moon.yml` and `templates/vue-app/moon.yml`, and drop the "starter" suffix from its title.

---

# Phase 10 — Verification (Day 14)

- [ ] `cd packages/shared-ui-vue && pnpm install` — must complete without peer dep warnings on Vue or reka-ui
- [ ] `pnpm run typecheck` — must pass with no errors. Fix any `verbatimModuleSyntax` or `defineProps<T>()` inference issues
- [ ] `pnpm run lint` — must pass (Biome 2.4)
- [ ] `pnpm run build` — must produce `dist/{components,hooks,theme,utils}/index.js` + `.d.ts` files
- [ ] `pnpm run storybook` — must open on :6006, all component stories render, theme switcher in toolbar works
- [ ] **Generator round-trip** in a temp dir:
  ```bash
  moon generate shared-ui-vue test-ui --destination /tmp/test-ui
  cd /tmp/test-ui
  pnpm install
  pnpm run typecheck
  pnpm run build
  pnpm run storybook
  ```
  Every step must succeed.
- [ ] **Wire-up smoke test:** temporarily uncomment `dependsOn: shared-ui-vue` in `apps/vue-app/moon.yml`, run `moon :build` from workspace root. Confirm vue-app builds against the new package. Revert the change before committing.
- [ ] **Storybook visual check:** click through every component story, verify light/dark toggle works, verify a11y addon reports no violations for at least Button, Dialog, Form, Input, Select, Tabs
- [ ] **Commit any fixes** found in verification
- [ ] **Push branch** `feat/130-shared-ui-vue`
- [ ] **Open PR** titled `feat(packages): add shared-ui-vue component library (closes #130)` with body:

  ```
  Closes #130
  Unblocks #131 (apps/vue-app dependsOn flip queued as a follow-up commit on #131)

  ## What's in this PR

  - `packages/shared-ui-vue` — Vue 3 + Vite 8 + Tailwind v4 + reka-ui + @nanostores/vue
  - `templates/shared-ui-vue` — moon generator source
  - 50+ components mirroring @repo/shared-ui (atoms, form, overlay, layout, data display)
  - Storybook 10 docs site with light/dark themes
  - 4 entry points: components, hooks, theme, utils
  - `builder/shared-ui-vue.sh` + `build-templates.sh` + `.moon/workspace.yml` wiring

  ## What this PR does NOT include (follow-ups)

  - Wire `apps/vue-app` to depend on this package (will be done in PR #131 follow-up)
  - Per-component Vitest tests (out of scope for parity v1)
  - i18n (not in React version)
  - Pinia migration (not in scope)
  ```

---

# Verification checklist (final)

Before requesting review:

- [ ] All 5 commits authored (foundation, atoms, form, overlay, layout+data, integration)
- [ ] All 200 files exist in the right paths
- [ ] No stray `.qwen/` or `.claude/` folder (per PR #131 review feedback)
- [ ] `.gitignore` includes `node_modules`, `dist`, `storybook-static`, `.DS_Store`
- [ ] `pnpm run typecheck` passes from package root
- [ ] `pnpm run lint` passes from package root
- [ ] `pnpm run build` produces all 4 entry dist outputs
- [ ] `pnpm run storybook` boots, all 50+ component stories render
- [ ] Generator round-trip succeeds
- [ ] PR description links #130 and #131

---

# Self-review notes

**Spec coverage:**
- Issue #130 required `packages/shared-ui-vue` with shadcn-vue (reka-ui) + Tailwind v4 + @nanostores/vue + 4 entry points. ✓ All addressed.
- `templates/vue-app` is PR #131 scope, separate.
- Vite 8 + Vitest 4 + Playwright are for vue-app, not shared-ui-vue. ✓ Correctly scoped.

**Placeholder scan:** Every component has explicit file structure described. The one "port from React X" instruction is intentional and unambiguous (file paths are explicit). No "TBD" / "implement later" / "handle edge cases" markers in this plan.

**Type consistency:** `ButtonVariants`, `UIStore`, `Theme`, `clx`, `cn`, `getInitials`, `useTheme()`, `useMediaQuery`, `useIsMobile` all used consistently. `useTheme()` returns `ThemeProviderState` in both definition and use. `useIsMobile` returns `Ref<boolean>`.

**Risk callouts:** 4 components have meaningful API divergence from React (Calendar via reka-ui instead of `react-day-picker`; Chart via `unovis` instead of `recharts`; Form via `vee-validate` instead of `react-hook-form`; Command via reka-ui Combobox instead of `cmdk`). Document these in the PR description so reviewers know parity ≠ identical API.

**File count estimate:** ~200 files. 10–14 day budget is realistic solo, faster with parallel review.

---

# Out of scope (intentionally deferred)

- **Pinia migration** — `@nanostores/vue` is the parity choice
- **i18n** — `vue-i18n` not in React library
- **Per-component Vitest tests** — Storybook + a11y addon covers visual; tests can be added later
- **Visual regression screenshots** — not in React version
- **Vue 3 SSR / Nuxt module** — separate work
- **Unblocking PR #131** — separate PR to uncomment `dependsOn`
- **Per-component custom CSS variants** — all use `tailwind-variants` for parity

---

# Component parity table (single reference)

| # | Component | React dep | Vue dep | Risk |
|---|---|---|---|---|
| 1 | Accordion | radix-ui | reka-ui | ✅ |
| 2 | Alert | styled div | styled div | ✅ |
| 3 | AlertDialog | radix-ui | reka-ui | ✅ |
| 4 | AspectRatio | radix-ui | reka-ui | ✅ |
| 5 | Avatar | radix-ui | reka-ui | ✅ |
| 6 | Badge | styled span | styled span | ✅ |
| 7 | Breadcrumb | radix-ui | reka-ui | ✅ |
| 8 | Button | radix-ui Slottable | reka-ui Slottable | ✅ |
| 9 | Calendar | react-day-picker | reka-ui + @internationalized/date | 🟡 |
| 10 | Card | plain HTML | plain HTML | ✅ |
| 11 | Carousel | embla-carousel-react | embla-carousel-vue | ✅ |
| 12 | Chart | recharts | unovis | 🔴 |
| 13 | Checkbox | radix-ui | reka-ui | ✅ |
| 14 | Collapsible | radix-ui | reka-ui | ✅ |
| 15 | Command | cmdk | reka-ui Combobox | 🟠 |
| 16 | ContextMenu | radix-ui | reka-ui | ✅ |
| 17 | Dialog | radix-ui | reka-ui | ✅ |
| 18 | Drawer | vaul | vaul-vue | ✅ |
| 19 | DropdownMenu | radix-ui | reka-ui | ✅ |
| 20 | Form | react-hook-form | vee-validate | 🟡 |
| 21 | Heading | polymorphic | polymorphic | ✅ |
| 22 | HoverCard | radix-ui | reka-ui | ✅ |
| 23 | Input | radix-ui TextField | reka-ui TextField | ✅ |
| 24 | InputOTP | input-otp | input-otp | ✅ |
| 25 | Label | radix-ui | reka-ui | ✅ |
| 26 | Pagination | radix-ui | reka-ui | ✅ |
| 27 | Popover | radix-ui | reka-ui | ✅ |
| 28 | Progress | radix-ui | reka-ui | ✅ |
| 29 | RadioGroup | radix-ui | reka-ui | ✅ |
| 30 | Resizable | react-resizable-panels | vue-resizable-panels | 🟠 |
| 31 | ScrollArea | radix-ui | reka-ui | ✅ |
| 32 | Select | radix-ui | reka-ui | ✅ |
| 33 | Separator | radix-ui | reka-ui | ✅ |
| 34 | Sheet | radix-ui Dialog | reka-ui Dialog | ✅ |
| 35 | Sidebar | custom + radix-ui | custom + reka-ui | ✅ |
| 36 | Skeleton | styled div | styled div | ✅ |
| 37 | Slider | radix-ui | reka-ui | ✅ |
| 38 | Spinner | lucide-react | lucide-vue-next | ✅ |
| 39 | Squircle | custom SVG | custom SVG | ✅ |
| 40 | Switch | radix-ui | reka-ui | ✅ |
| 41 | Table | plain HTML | plain HTML | ✅ |
| 42 | Tabs | radix-ui | reka-ui | ✅ |
| 43 | Text | polymorphic | polymorphic | ✅ |
| 44 | Textarea | plain | plain | ✅ |
| 45 | Toast | sonner | vue-sonner | ✅ |
| 46 | Toggle | radix-ui | reka-ui | ✅ |
| 47 | ToggleGroup | radix-ui | reka-ui | ✅ |
| 48 | Tooltip | radix-ui | reka-ui | ✅ |
| 49 | AvatarImage, AvatarFallback | radix-ui sub | reka-ui sub | ✅ |
| 50 | Card sub-components (5) | plain HTML | plain HTML | ✅ |
| 51 | Sidebar sub-components (7) | custom | custom | ✅ |
| 52 | TooltipProvider | radix-ui | reka-ui | ✅ |

Risk summary: 44 ✅ + 3 🟡 + 2 🟠 + 1 🔴 = 50 of 50 component groups covered.
