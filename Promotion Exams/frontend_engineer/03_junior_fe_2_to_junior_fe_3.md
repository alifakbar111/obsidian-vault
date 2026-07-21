# Promotion Exam: Junior Frontend Engineer 2 → Junior Frontend Engineer 3

**Track:** Frontend Engineer (Specialist)
**Format:** 100 multiple-choice questions
**Time:** 150 minutes
**Passing score:** 89 / 100

**Scope.** Junior Frontend Engineer 3 is the top of the specialist track before the ladder converges into the generalist senior level. A Junior 3 should be able to take a medium-sized frontend feature from spec to production with minimal supervision, contribute meaningfully to design discussions, mentor interns and Junior 1s, and write code that other juniors can read and learn from. This exam tests the depth that gap requires: advanced React patterns, state management judgment, intermediate TypeScript, forms and validation done correctly, API consumption with realistic error and caching concerns, CSS architecture at scale, accessibility beyond the basics, performance under measurement, testing strategy beyond unit tests, and the early signs of architectural thinking.

**Reminder.** This is the last specialist-only exam in the ladder. After this, the Junior 3 → Senior 1 exam tests whether the candidate has broadened beyond frontend into the full generalist senior expectation. A candidate passing this exam at 90+ but with no curiosity about backend, infrastructure, or systems will struggle at the next gate. That is by design.

---

## Section A — Advanced React Patterns (Q1–Q15)

**1.** A custom hook is:
A) A regular function starting with `use` that can call other hooks and encapsulate reusable stateful logic, returning whatever the consumer needs
B) A React class
C) A higher-order component
D) A library

**2.** The rule "hooks must be called in the same order on every render" exists because:
A) It is a style guide
B) React tracks hooks by their call order; conditional or looped calls would associate the wrong state with the wrong hook on subsequent renders
C) Performance
D) Linter convenience

**3.** A render-prop pattern compared to a custom hook in modern React:
A) Is preferred for new code
B) Has been largely superseded by hooks for sharing stateful logic; render props remain useful for component-level composition of UI rather than logic
C) Is the same
D) Is faster

**4.** A controlled component takes ownership of its value via state and `onChange`. The trade-off is:
A) None
B) Every keystroke causes a re-render of the owner of that state; for very large or sensitive forms this can matter and uncontrolled or local state may be appropriate
C) Performance is always better
D) Accessibility breaks

**5.** `useReducer` is preferred over `useState` when:
A) Always
B) The next state depends on the previous state in non-trivial ways, several related state transitions are needed, or the logic benefits from being expressed as named actions
C) The state is a number
D) There is no parent

**6.** `useContext` causes a re-render in a consumer when:
A) The component re-renders for any reason
B) The context value reference changes — which is why frequently changing values stored in context can cause widespread re-renders unless split or memoized
C) Only on mount
D) Never

**7.** Splitting one large context into several smaller ones is a common technique because:
A) It is cleaner code
B) Consumers re-render when their context's value changes; finer-grained contexts let unrelated consumers avoid each other's updates
C) It is required
D) It is faster to write

**8.** A component that renders a list of 10,000 rows is best handled by:
A) Rendering all rows and hoping the browser copes
B) Virtualization — rendering only the rows currently in (or near) the viewport via a library like react-virtual or react-window
C) Pagination only
D) Server-side rendering

**9.** `React.memo` wraps a component to:
A) Memoize its state
B) Skip re-rendering when its props are shallowly equal to the previous render — useful for expensive children whose parents re-render often
C) Cache the DOM
D) Replace `useMemo`

**10.** `React.memo` does not help when:
A) The component is cheap to render
B) New object or function props are created on every parent render (breaking referential equality) — typically requires `useMemo`/`useCallback` upstream to be effective
C) State changes
D) Props are primitives

**11.** A forwardRef is needed when:
A) Passing data to children
B) Exposing a DOM node (or imperative handle) from a component to a parent through the `ref` API
C) Re-rendering children
D) Memoizing

**12.** A common cause of "Cannot read properties of undefined" inside a render is:
A) TypeScript errors
B) Reading nested data before the data has loaded; render the loading state or guard the access
C) Hooks
D) JSX

**13.** Conditional rendering with `{value && <Component />}` has a subtle bug when:
A) `value` is `true`
B) `value` is `0`, because `0 && anything` evaluates to `0`, which React renders as text "0"; prefer `value ? <Component /> : null` or `Boolean(value) && ...`
C) `value` is a string
D) Never

**14.** Effects are an escape hatch, not the first tool. A common misuse is:
A) Using effects for subscriptions
B) Using an effect to derive state from props that could be computed during render — the derived value should just be a calculation, not state plus an effect that re-syncs it
C) Cleaning up
D) Using `useEffect` at all

**15.** Suspense at its core is a mechanism for:
A) Animations
B) Declaratively expressing "this UI cannot render yet because some data or code is not ready" so React can show a fallback
C) Error boundaries
D) Lazy loading only

---

## Section B — State Management (Q16–Q25)

**16.** The default place to put state is:
A) Global
B) As local as possible — co-located with the component that owns it, lifted only when other components need it
C) In context
D) On the server

**17.** State that should live globally typically includes:
A) Form values
B) Things like the current user, theme, locale, and other genuinely application-wide concerns — not every piece of data
C) Component-local values
D) Everything

**18.** Server state (data fetched from an API) versus client state:
A) Are the same
B) Have different lifecycles — server state has freshness, caching, retry, and revalidation concerns that libraries like TanStack Query or SWR handle far better than ad hoc `useEffect` calls
C) Server state should be in Redux
D) Client state should be on the server

**19.** Using `useEffect` to fetch data on mount:
A) Is the modern best practice
B) Works for simple cases but quickly grows brittle — missing caching, deduplication, refetch on focus, error retries, and race-condition handling; a data-fetching library is usually the right call past the simplest UIs
C) Is impossible
D) Replaces all state management

**20.** A race condition in data fetching commonly occurs when:
A) Two users hit the page
B) A component fires a request, dependencies change, fires a second request, and the first response arrives last and overwrites the newer data — solved by cancellation, ignoring stale responses, or a data library that handles it
C) The server is slow
D) The user navigates

**21.** Optimistic UI updates are appropriate when:
A) Never
B) The action is highly likely to succeed and user-perceived latency matters; the UI shows the success state immediately and rolls back on failure
C) For all updates
D) Only for reads

**22.** A "single source of truth" for a given piece of data means:
A) Only one component reads it
B) That piece of data lives in exactly one place; views derive from it and updates flow through it, preventing inconsistencies from divergent copies
C) Only one user writes it
D) It is global

**23.** Storing the same data in both component state and URL state:
A) Is a best practice
B) Is a common source of bugs when the two diverge; pick one as the source of truth and derive the other
C) Improves performance
D) Is harmless

**24.** Reaching for Redux (or Zustand, Jotai, etc.) for a small app:
A) Is always right
B) Is often premature; start with local state and Context, introduce a state library when patterns appear that genuinely warrant it
C) Is forbidden
D) Replaces React

**25.** URL state (query params, route params) is the right home for:
A) All state
B) State that should be shareable, bookmarkable, or survive a refresh — filters, search terms, current tab, current page
C) Component-local UI
D) Secrets

---

## Section C — TypeScript Intermediate (Q26–Q35)

**26.** A generic constraint `<T extends { id: string }>` means:
A) `T` must equal `{ id: string }`
B) `T` can be any type that has at least an `id` property of type `string`, allowing the function to access `.id` safely
C) `T` is a string
D) `T` is required

**27.** Discriminated unions like `{ status: "loading" } | { status: "success", data: T } | { status: "error", error: Error }`:
A) Are anti-patterns
B) Let you model exclusive states precisely; narrowing on the discriminant unlocks type-safe access to the variant's fields
C) Are deprecated
D) Are the same as enums

**28.** The `Pick<T, K>` utility type:
A) Picks one property
B) Constructs a type with only the keys `K` from `T` — useful for narrowing larger types
C) Removes keys
D) Renames keys

**29.** The `Omit<T, K>` utility type:
A) Removes all keys
B) Constructs a type from `T` with the keys in `K` excluded
C) Hides keys at runtime
D) Renames keys

**30.** `Partial<T>` makes every property of `T`:
A) Required
B) Optional, useful for update payloads and patches
C) Readonly
D) Nullable

**31.** `Record<K, V>`:
A) Creates an array
B) Constructs an object type with keys of type `K` and values of type `V` — useful for lookup maps
C) Is database-specific
D) Is for strings only

**32.** `unknown` differs from `any` in that:
A) They are identical
B) `unknown` forces you to narrow before using the value, preserving safety; `any` opts out of type checking entirely
C) `unknown` is faster
D) `unknown` is deprecated

**33.** A `never` type appears when:
A) A type cannot exist — for example, the type of a thrown function's return, or the result of intersecting incompatible types — and is useful for exhaustiveness checks in switch statements
B) A value is undefined
C) Types are unused
D) Compilation fails

**34.** Exhaustiveness checking on a discriminated union via `const _exhaustive: never = value;` in a default branch:
A) Is overkill
B) Catches at compile time when a new variant is added to the union but a switch was not updated, preventing silent gaps
C) Is runtime only
D) Slows compilation

**35.** A common TypeScript anti-pattern is:
A) Using `as const`
B) Casting to satisfy the compiler instead of fixing the underlying type — `as` should be a last resort, not a regular tool
C) Using interfaces
D) Defining types

---

## Section D — Forms and Validation (Q36–Q45)

**36.** A form library (React Hook Form, Formik, TanStack Form):
A) Is unnecessary overhead
B) Is worth reaching for when forms become non-trivial — many fields, validation, async submission, error display — because rolling these correctly by hand is a lot of work
C) Replaces React
D) Is for backend forms

**37.** Validation on the client:
A) Is sufficient
B) Is for user experience only; the server must always validate independently because client validation can be bypassed
C) Replaces server validation
D) Is optional

**38.** Validating on every keystroke versus on blur or submit:
A) Keystroke is always best
B) On-keystroke validation can punish users mid-typing; common practice is to validate on submit (or blur) for new fields and switch to on-change once a field has been touched once
C) Submit only is always best
D) They are equivalent

**39.** Async validation (e.g., "username available?"):
A) Should run on every keystroke
B) Should be debounced and cancellable, and the UI should show a pending state — racing responses can otherwise display wrong results
C) Is impossible
D) Should be blocking

**40.** Error messages should be:
A) Generic
B) Specific, actionable, in plain language, and associated programmatically with the field so screen-reader users hear them
C) Hidden until support is contacted
D) In red only

**41.** A submitting state should:
A) Be implicit
B) Disable the submit button (or prevent double submission), show a visible pending indicator, and tolerate slow responses gracefully
C) Be skipped
D) Be modal

**42.** Server validation errors returned after submit should:
A) Be alerted in a popup
B) Be displayed inline next to the field they refer to, mirroring how client validation works, with a focus management plan for the first error
C) Be ignored
D) Be silently dropped

**43.** Schemas like Zod, Yup, or Valibot:
A) Are server-only
B) Define a validation schema once that can produce both runtime validation and a TypeScript type, keeping the two in sync
C) Replace HTML validation
D) Are slow

**44.** Storing every keystroke in URL query params:
A) Is best practice
B) Is usually overkill and causes performance problems; persist only what is genuinely worth being shareable or bookmarkable
C) Is required
D) Is faster

**45.** A common form accessibility miss is:
A) Using labels
B) Failing to associate the error message with the input via `aria-describedby` and `aria-invalid`, so screen readers do not announce it
C) Using HTML5 validation
D) Using `<form>`

---

## Section E — API Consumption (Q46–Q55)

**46.** A robust fetcher distinguishes:
A) Nothing
B) Network errors, HTTP error responses (4xx/5xx), and parsing errors — and surfaces them differently in the UI
C) Only success
D) Only network errors

**47.** The four canonical UI states for data are:
A) Open and closed
B) Idle/loading/success/error — and a good UI handles all four, including the often-forgotten "no data" empty state inside success
C) Loading and done
D) Only success

**48.** Retrying a failed request:
A) Should be infinite
B) Should be bounded, with exponential backoff, and only for retryable errors (typically 5xx and network) — never blindly for 4xx, which usually means the request itself is wrong
C) Should not happen
D) Should be synchronous

**49.** Caching server responses on the client:
A) Always causes bugs
B) Is necessary at any non-trivial scale and benefits enormously from a library that handles invalidation, refetch on focus, stale-while-revalidate, and deduplication
C) Is the server's job only
D) Is unsafe

**50.** Stale-while-revalidate means:
A) Always show old data
B) Show the cached value immediately while quietly refetching in the background, then update the UI when the fresh value arrives
C) Show only fresh data
D) Skip the cache

**51.** Mutating data (POST/PUT/DELETE) and then refreshing the cache:
A) Should be a manual reload
B) Should invalidate or update the affected cached queries so the UI reflects the change immediately
C) Should clear all cache
D) Is unsupported

**52.** Pagination versus infinite scroll versus cursor-based loading:
A) Are interchangeable
B) Are different patterns with different trade-offs (bookmarkability, position memory, accessibility, performance); choose deliberately, not by reflex
C) Are the same UX
D) Are decided by the backend

**53.** Polling for fresh data:
A) Is always wrong
B) Is acceptable for low-frequency updates when no push mechanism exists, but consider WebSockets, Server-Sent Events, or focus-based revalidation for better UX and efficiency
C) Is required
D) Is faster than push

**54.** Handling a 401 (unauthorized) globally:
A) Should be done in every component
B) Should be intercepted in a central place (the fetch wrapper or query client), triggering a session refresh or redirect to login, so individual components do not each handle it
C) Should crash the app
D) Should be ignored

**55.** Showing toast errors for every failed request:
A) Is the right default
B) Quickly becomes noise; choose based on whether the error affects the current view or whether the user can act on it, and use inline error states where they fit better
C) Is accessible
D) Is required

---

## Section F — CSS Architecture (Q56–Q65)

**56.** The point of a design-token system (color, spacing, typography variables) is:
A) Branding
B) A single source of truth so the same value is reused everywhere, themes can be swapped, and updates are systematic rather than search-and-replace
C) Performance
D) Linting

**57.** Tailwind CSS (utility-first) trade-offs include:
A) None — it is strictly better
B) Tight design-system enforcement and small generated CSS, at the cost of longer class strings in markup; works well with discipline around extraction and conventions
C) Slow runtime
D) Mandatory JavaScript

**58.** CSS Modules:
A) Are deprecated
B) Scope class names per file by hashing, eliminating cross-file collisions while keeping CSS as CSS
C) Inline all styles
D) Require runtime

**59.** CSS-in-JS at runtime:
A) Has no cost
B) Has a real runtime cost (parsing, serializing, injecting styles); some libraries solve this with zero-runtime modes that extract at build time
C) Is always fastest
D) Is the same as CSS Modules

**60.** Cascade Layers (`@layer`) help by:
A) Replacing media queries
B) Letting you explicitly order specificity groups (e.g., reset, base, components, utilities), reducing surprise from selector specificity battles
C) Animating elements
D) Encrypting CSS

**61.** A component's styles should generally:
A) Reach into descendants freely
B) Stay scoped to the component and its declared parts; deep cross-component selectors create fragile coupling
C) Use `!important`
D) Be inline

**62.** Reusing the same component with different visual variants is best done by:
A) Forking the component
B) Variant props (e.g., `size`, `tone`) mapping to styles or design tokens — keeps the API small and the implementation centralized
C) CSS overrides from the parent
D) Wrappers per variant

**63.** Container queries (`@container`):
A) Are an old feature
B) Let a component's styles respond to its **container's** size rather than the viewport, which fits component-based design far better than viewport-based media queries
C) Replace flexbox
D) Are only in Safari

**64.** Dark mode is most maintainably implemented with:
A) Two complete copies of every stylesheet
B) Theme tokens (CSS variables) whose values switch based on a `[data-theme]` attribute or `prefers-color-scheme`, with components reading the tokens
C) JavaScript-only
D) Inline overrides

**65.** RTL (right-to-left) language support is best handled by:
A) Manual `.rtl` overrides everywhere
B) Logical CSS properties (`margin-inline-start`, `padding-block`, etc.) and a `dir="rtl"` attribute, so layout flips correctly with minimal special-casing
C) Mirroring in JavaScript
D) Avoiding RTL

---

## Section G — Performance and Web Vitals (Q66–Q75)

**66.** Largest Contentful Paint (LCP):
A) Measures total page weight
B) Measures the time until the largest visible content element renders; usually a hero image, banner, or large text block — slow LCP correlates with poor perceived speed
C) Is for fonts only
D) Is server-only

**67.** Cumulative Layout Shift (CLS):
A) Is unimportant
B) Measures how much visible content shifts unexpectedly during page load — caused by images without dimensions, late-loading fonts, or injected content
C) Is fixed automatically
D) Is desktop-only

**68.** Interaction to Next Paint (INP):
A) Measures load time
B) Measures responsiveness — how long the page takes to respond visually to user input — replacing FID as the responsiveness Core Web Vital
C) Is for animations
D) Is deprecated

**69.** A long task on the main thread:
A) Is harmless
B) Blocks user input and rendering; breaking work into smaller tasks (`scheduler.yield`, `requestIdleCallback`, or web workers for heavy compute) keeps the UI responsive
C) Speeds up rendering
D) Should be unrolled into a tight loop

**70.** Reducing JavaScript bundle size most often comes from:
A) Minification only
B) Code splitting per route, tree-shaking, removing or replacing heavy dependencies, and lazy-loading non-critical features — usually a basket of moves, not one
C) Compressing images
D) Changing CDNs

**71.** Preloading critical fonts (`<link rel="preload">`):
A) Is harmful
B) Can reduce CLS and FOIT (flash of invisible text) by fetching the font before CSS discovers it, but only for genuinely critical fonts — overuse is counterproductive
C) Is required for all fonts
D) Replaces `font-display`

**72.** `font-display: swap`:
A) Hides text until the font loads
B) Shows a fallback font immediately and swaps in the web font once it loads, trading a brief visual shift for content being readable faster
C) Removes fallbacks
D) Is for icons

**73.** Images should typically have:
A) No dimensions
B) Explicit width and height (or aspect-ratio) so the browser can reserve space and avoid layout shift, plus `srcset` for responsive sizing and `loading="lazy"` when offscreen
C) JavaScript loading only
D) No alt text

**74.** Measuring real user performance:
A) Is the same as lab measurement
B) Requires field data (e.g., Real User Monitoring or Chrome's CrUX) because real devices, networks, and users vary far more than lab runs suggest
C) Is impossible
D) Only matters in tests

**75.** Premature performance optimization:
A) Is good practice
B) Often wastes time and adds complexity for no measurable benefit; measure, find the actual bottleneck, then optimize, then measure again
C) Is required
D) Is the same as caching

---

## Section H — Accessibility Beyond the Basics (Q76–Q82)

**76.** A dropdown menu built with `<div>` and click handlers:
A) Is usually accessible by accident
B) Is rarely accessible without deliberate ARIA (`role="menu"`, `aria-expanded`, `aria-haspopup`), keyboard support (arrows, Escape, Home/End), and focus management — and even then is harder to get right than reusing a tested primitive
C) Cannot be made accessible
D) Is accessible if it has `tabindex`

**77.** A modal dialog needs:
A) Just a close button
B) Focus moved into it on open, focus trapped within it while open, focus returned to the trigger on close, an accessible name, and Escape to close
C) Only an overlay
D) Only `role="dialog"`

**78.** `aria-live` regions:
A) Are decorative
B) Announce dynamic content updates to screen readers; `polite` waits for a pause, `assertive` interrupts — use sparingly
C) Are for animations
D) Replace alerts

**79.** Icon-only buttons need:
A) Nothing
B) An accessible name via `aria-label`, visible label, or visually hidden text, so screen-reader users know what the button does
C) A tooltip is enough
D) A larger size

**80.** Skipping accessibility because "we'll add it later":
A) Is realistic
B) Almost always leads to permanent debt; retrofitting accessibility is far more expensive than building it in
C) Is unavoidable
D) Is best practice

**81.** Automated accessibility tools (axe, Lighthouse) catch:
A) Everything
B) A meaningful portion of issues, but a large share — keyboard behavior, focus management, screen-reader UX, alt-text quality — requires human review and testing
C) Nothing useful
D) Only color contrast

**82.** Testing with actual screen readers (NVDA, JAWS, VoiceOver):
A) Is for specialists only
B) Is a healthy practice for any frontend engineer building interactive components; even basic familiarity catches real issues automated tools miss
C) Is impossible without training
D) Is replaced by audits

---

## Section I — Testing Strategy (Q83–Q90)

**83.** The testing pyramid suggests:
A) All unit tests
B) Many fast unit tests, fewer integration tests, and a small number of end-to-end tests at the top — though the exact ratios vary, the principle is to favor fast feedback for most coverage
C) All E2E tests
D) Inverted pyramid

**84.** Component tests with Testing Library should assert on:
A) Internal state and prop names
B) What the user sees and can do — text, roles, accessible names — so the test stays valid through refactors that do not change behavior
C) DOM IDs only
D) Implementation details

**85.** Visual regression testing:
A) Replaces functional tests
B) Catches unintended visual changes (layout, color, spacing) by comparing screenshots; valuable but flaky without disciplined setup
C) Is for designers only
D) Is unnecessary

**86.** End-to-end tests are most valuable when:
A) Covering every code path
B) Covering critical user journeys end-to-end (login, checkout, signup) where confidence in the full stack matters more than speed
C) Replacing unit tests
D) Used for performance

**87.** Flaky end-to-end tests:
A) Should be retried
B) Are usually a symptom of timing assumptions, hidden state, or test pollution — investigate and fix, or the suite becomes ignored
C) Are unfixable
D) Should be ignored

**88.** Mock Service Worker (MSW):
A) Replaces tests
B) Intercepts network calls at the service-worker level, so component code under test runs unchanged and the same handlers can serve both tests and local development
C) Is server-only
D) Replaces React

**89.** Coverage tools report:
A) Bug count
B) Which lines/branches/functions were executed by tests — not whether the assertions were meaningful, which is what actually matters
C) Test quality
D) Performance

**90.** A regression test for a fixed bug:
A) Is paranoia
B) Locks in the fix so the same bug does not silently return — write it as part of fixing, while the failure is reproducible
C) Should come later
D) Is automated by CI

---

## Section J — Build Tools and Senior-Junior Judgment (Q91–Q100)

**91.** Tree shaking:
A) Removes the source tree
B) Eliminates unused exports from the final bundle at build time, which works best with ES modules and side-effect-free code
C) Compresses code
D) Is the same as minification

**92.** Source maps:
A) Slow the page
B) Map minified production code back to source for debugging in DevTools; serve them carefully in production (sometimes only to internal users) so source is not casually leaked
C) Are required
D) Are server-only

**93.** A monorepo with multiple frontend packages:
A) Is always over-engineered
B) Can be a real productivity win when packages share dependencies and code, but introduces tooling complexity that should be matched to actual scale
C) Is always best
D) Is for backend only

**94.** Adding a dependency for a small task you could write yourself:
A) Is always faster
B) Trades short-term convenience for long-term cost (bundle size, security surface, maintenance, lock-in); for tiny utilities, write it; for non-trivial features, take the library
C) Is forbidden
D) Has no downside

**95.** A "left-pad" style dependency surprise (a tiny package breaking the world) is a reminder to:
A) Avoid all dependencies
B) Audit critical dependencies, prefer well-maintained options, lock versions, and have a recovery plan
C) Switch package managers
D) Use only built-ins

**96.** A code review you do as a Junior 3 should:
A) Be limited to typos
B) Engage substantively — call out bugs, ask about decisions, suggest improvements, and learn from what others do; juniors who only nitpick miss the point of review
C) Be skipped
D) Defer always

**97.** When a senior pushes back on your design and you still believe you are right:
A) Cave immediately
B) Make your case clearly with examples or evidence; if still overruled, commit and move on; sometimes you will be right and learn how to argue better, sometimes you will be wrong and learn to listen better
C) Escalate
D) Refuse to merge

**98.** Mentoring a Junior 1:
A) Is too early for you
B) Is part of becoming a Junior 3 — explaining things you have learned, reviewing their code charitably, and shielding them from frustration is how the team grows
C) Is the lead's job only
D) Wastes your time

**99.** Estimating a medium feature accurately requires:
A) Optimism
B) Breaking the work down enough to see the hidden parts — design, testing, edge cases, code review cycles, deploy — and quoting a range, not a point
C) Speed
D) A senior's sign-off

**100.** The trait that most often unlocks the move from Junior 3 to Senior 1 is not pure technical depth, but:
A) Confidence
B) Curiosity that has broadened beyond frontend — wanting to understand how the API works, how the database is structured, how deploys happen, why the system behaves the way it does
C) Speed
D) Output volume

---

## Answer Key

1.A  2.B  3.B  4.B  5.B  6.B  7.B  8.B  9.B  10.B
11.B  12.B  13.B  14.B  15.B  16.B  17.B  18.B  19.B  20.B
21.B  22.B  23.B  24.B  25.B  26.B  27.B  28.B  29.B  30.B
31.B  32.B  33.A  34.B  35.B  36.B  37.B  38.B  39.B  40.B
41.B  42.B  43.B  44.B  45.B  46.B  47.B  48.B  49.B  50.B
51.B  52.B  53.B  54.B  55.B  56.B  57.B  58.B  59.B  60.B
61.B  62.B  63.B  64.B  65.B  66.B  67.B  68.B  69.B  70.B
71.B  72.B  73.B  74.B  75.B  76.B  77.B  78.B  79.B  80.B
81.B  82.B  83.B  84.B  85.B  86.B  87.B  88.B  89.B  90.B
91.B  92.B  93.B  94.B  95.B  96.B  97.B  98.B  99.B  100.B

**Passing threshold: 89 / 100**

*Administrator's note: This exam ends the specialist track. The next exam (Junior 3 → Senior 1) is the convergence point and tests whether the candidate has broadened beyond frontend into the topics a senior generalist must own. A candidate who passes this exam decisively but cannot name the basics of HTTP, SQL, or deployment is not ready to take the next one — they should be coached toward broadening before they sit it.*
