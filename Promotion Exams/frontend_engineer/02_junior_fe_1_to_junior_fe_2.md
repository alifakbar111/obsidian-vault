# Promotion Exam: Junior Frontend Engineer 1 → Junior Frontend Engineer 2

**Track:** Frontend Engineer (Specialist)
**Format:** 100 multiple-choice questions
**Time:** 135 minutes
**Passing score:** 89 / 100

**Scope.** A Junior FE 1 ships small frontend tasks under supervision. A Junior FE 2 should be trusted to take a small-to-medium frontend feature from ticket to production with light review — fetching data, handling loading and error states, writing accessible markup, and not introducing regressions. This exam tests the skills that gap requires: intermediate JavaScript and the async model, the chosen component framework (React in this exam), introductory TypeScript, accessibility beyond the basics, CSS layout in depth, browser DevTools fluency, and the team practices that separate a junior who pulls their weight from one who needs constant rescue.

**Note on framework.** This exam uses React as the framework because it remains the dominant choice in the industry and at this company. If your team standardizes on Vue, Svelte, Angular, or Solid, replace Section D's React-specific questions with the equivalent in your framework. The reasoning about component models, state, and re-rendering transfers; the syntax does not.

---

## Section A — Intermediate JavaScript (Q1–Q15)

**1.** A closure is:
A) A function that has been minified
B) A function together with the lexical scope in which it was defined, allowing it to access variables from that outer scope even after the outer function has returned
C) A way to close a connection
D) A type of class

**2.** `this` inside a regular (non-arrow) function depends on:
A) Where the function is defined
B) How the function is called — as a method, as a standalone function, with `new`, with `call`/`apply`/`bind`, etc.
C) The first argument
D) The return type

**3.** `this` inside an arrow function:
A) Refers to the global object
B) Is lexically inherited from the surrounding scope at the time the arrow was defined
C) Is `undefined`
D) Can be set with `bind`

**4.** A common bug pattern when passing a method as a callback (e.g., `setTimeout(obj.handler, 100)`) is:
A) The handler runs twice
B) `this` inside `handler` is no longer `obj`, because the function was detached from its receiver
C) The handler never runs
D) Memory leaks

**5.** `Array.prototype.reduce` accepts:
A) A predicate and returns an array
B) A reducer function `(accumulator, current) => next` and optionally an initial accumulator value, returning a single accumulated value
C) Two arrays
D) Only numbers

**6.** Optional chaining `user?.address?.city`:
A) Throws if `user` is `null`
B) Returns `undefined` if any part of the chain is `null` or `undefined`, otherwise the nested value
C) Returns an empty string
D) Is the same as `user.address.city`

**7.** Nullish coalescing `value ?? "default"`:
A) Returns `"default"` if `value` is falsy
B) Returns `"default"` only if `value` is `null` or `undefined`, but keeps `0` and `""` as-is
C) Is the same as `||`
D) Returns `null`

**8.** A `Map` differs from a plain object in that:
A) `Map` is slower
B) `Map` accepts any value as a key (including objects), preserves insertion order, and has a `.size` property — objects only support string and symbol keys reliably
C) They are identical
D) `Map` is read-only

**9.** A `Set` is useful for:
A) Storing ordered duplicates
B) Storing unique values with O(1) lookup, deduplicating an array, or testing membership
C) Replacing arrays
D) Sorting

**10.** ES modules (`import` / `export`):
A) Are evaluated multiple times per import
B) Are evaluated once and the resulting bindings are shared across all importers — they are singletons by default
C) Are equivalent to CommonJS
D) Cannot be tree-shaken

**11.** A "named export" versus a "default export":
A) They are the same
B) Named exports must be imported by their exact name (with optional renaming via `as`); default exports can be imported under any name
C) Default exports are faster
D) Named exports are deprecated

**12.** `Object.freeze(obj)`:
A) Makes the object deeply immutable
B) Makes the object's own top-level properties non-writable and non-configurable — but nested objects are not frozen
C) Deletes the object
D) Copies the object

**13.** Mutating an array passed as a prop or argument is risky because:
A) It is slower
B) The caller may not expect their data to change, leading to bugs that are hard to trace; prefer returning new arrays from operations like `map`, `filter`, and `concat`
C) Arrays cannot be mutated
D) It triggers garbage collection

**14.** `for...of` versus `for...in`:
A) They are interchangeable
B) `for...of` iterates the values of an iterable (arrays, strings, Maps, Sets); `for...in` iterates the enumerable string keys of an object
C) `for...in` is for arrays
D) `for...of` only works on numbers

**15.** A pure function:
A) Returns `void`
B) Returns the same output for the same inputs and produces no side effects
C) Has no parameters
D) Is async

---

## Section B — Asynchronous Programming (Q16–Q25)

**16.** A Promise can be in one of three states:
A) Open, closed, error
B) Pending, fulfilled, or rejected
C) Running, paused, done
D) Sync, async, hybrid

**17.** `fetch()` returns:
A) The response body directly
B) A Promise that resolves to a `Response` object, whose body must be read with `.json()`, `.text()`, etc.
C) A string
D) A blob

**18.** `fetch()` rejects only when:
A) The HTTP status is 4xx or 5xx
B) The network request itself failed (DNS, offline, CORS); a 404 or 500 is a successful fetch with a non-ok `response.ok` — you must check it yourself
C) The body is empty
D) The server is slow

**19.** `await` inside a function requires:
A) Nothing
B) The function be declared `async` (or be a top-level module in modern environments)
C) A try/catch wrapping it
D) A `then` chain

**20.** `try { await ... } catch (e) { ... }`:
A) Catches synchronous errors only
B) Catches both synchronous errors thrown in the `try` block and rejections from awaited promises
C) Cannot catch promise rejections
D) Is deprecated

**21.** `Promise.all([p1, p2, p3])` resolves to:
A) The first resolved value
B) An array of all resolved values, in the same order as the input, when all promises have fulfilled; if any reject, the whole thing rejects
C) The last value
D) `undefined`

**22.** `Promise.allSettled([p1, p2, p3])` differs from `Promise.all` in that it:
A) Is faster
B) Always resolves once every promise has settled, returning an array of `{status, value/reason}` objects — no short-circuit on rejection
C) Rejects on any failure
D) Is the same

**23.** A common async pitfall is:
A) Using too many awaits
B) Awaiting in a loop sequentially when the operations could run in parallel via `Promise.all`
C) Returning early
D) Using async at all

**24.** Unhandled promise rejections in modern browsers:
A) Are silent
B) Trigger a console warning (or error) and the `unhandledrejection` event; in Node, they can crash the process under strict settings
C) Cancel the script
D) Retry automatically

**25.** An AbortController is used to:
A) Stop the page
B) Cancel an in-flight `fetch` (or any abortable async operation) — for example, when a component unmounts before the response returns
C) Reload the browser
D) Throttle requests

---

## Section C — CSS Layout and Modern CSS (Q26–Q37)

**26.** Mobile-first responsive design means:
A) Designing only for mobile
B) Writing the base styles for small screens and using `min-width` media queries to add complexity for larger screens
C) Hiding desktop features
D) Using a mobile framework

**27.** `gap` in Flexbox and Grid is used for:
A) The space between an element and its parent
B) The space between flex or grid items, replacing margin hacks like `:not(:last-child) { margin-right: ... }`
C) Padding
D) Outline

**28.** A stacking context is created by, among other things:
A) Any element
B) An element with `position` set and a `z-index` value, or with `opacity < 1`, `transform`, `filter`, `isolation: isolate`, and several other properties
C) Only by `position: absolute`
D) Only the root element

**29.** A common `z-index` confusion is:
A) That higher numbers always win
B) That `z-index` only compares within the same stacking context — an element with `z-index: 1` in a higher stacking context can sit above an element with `z-index: 999` in a lower one
C) That negative values are invalid
D) That `z-index` works without `position`

**30.** CSS Grid `grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))` creates:
A) A fixed three-column grid
B) A responsive grid that fits as many 200px-or-wider columns as the container allows, each stretching to share the remaining space
C) An empty grid
D) A single column

**31.** `aspect-ratio: 16 / 9` on an element:
A) Crops the element
B) Sets a preferred aspect ratio so the box's height is derived from its width (or vice versa), useful for embeds and image placeholders
C) Is for video only
D) Forces overflow

**32.** A CSS transition runs:
A) Continuously
B) Once, from a starting value to an ending value over a duration, when the value changes
C) On click only
D) On reload

**33.** A CSS animation differs from a transition in that:
A) It is the same
B) An animation uses `@keyframes` and can play, loop, reverse, and pause without an external state change
C) Animations are slower
D) Transitions cannot loop

**34.** `prefers-reduced-motion: reduce` is:
A) An old browser quirk
B) A user preference query you should respect by reducing or removing non-essential motion in your CSS
C) Optional
D) For print

**35.** A modern reset like `box-sizing: border-box` set on `*, *::before, *::after` is:
A) Bad practice
B) A widely adopted baseline that makes layout math predictable across the document
C) Slow
D) Browser-specific

**36.** Logical properties like `margin-inline-start` instead of `margin-left`:
A) Are slower
B) Adapt automatically to the document's writing direction (LTR vs RTL), making internationalized layouts simpler
C) Are deprecated
D) Only work in Firefox

**37.** The healthiest approach to CSS specificity in a growing codebase is:
A) Use IDs everywhere
B) Keep selectors as flat as practical, lean on class-based naming, and reserve high-specificity overrides for genuinely exceptional cases
C) Use `!important` consistently
D) Inline styles for everything

---

## Section D — React Fundamentals (Q38–Q52)

**38.** A React component is conceptually:
A) A class only
B) A function (or class) that takes props and returns a description of UI (React elements) — React then handles applying that description to the DOM
C) A template
D) A controller

**39.** Props in React are:
A) Mutable inputs
B) Read-only inputs from a parent; a component must never mutate its own props
C) The same as state
D) Global

**40.** State in React is:
A) Shared across components automatically
B) Local data owned by a component that, when changed via the setter from `useState`, causes the component to re-render
C) Mutable directly
D) Server-only

**41.** Calling `setCount(count + 1)` twice in a row in the same event handler:
A) Always increments by 2
B) Depending on closure-captured values, may increment by only 1; using the functional form `setCount(c => c + 1)` makes this correct
C) Throws an error
D) Is forbidden

**42.** The `key` prop on list items is for:
A) Styling
B) Helping React identify which items changed, were added, or removed across renders — should be a stable, unique ID, not the array index when items can reorder
C) Indexing
D) Sorting

**43.** Using array index as `key`:
A) Is always fine
B) Is risky when the list can reorder, filter, or insert in the middle — it can cause UI bugs where state and DOM nodes get associated with the wrong item
C) Is required
D) Is faster

**44.** `useEffect` runs:
A) Before render
B) After render is committed to the DOM, asynchronously; with no dependency array it runs every render, with `[]` it runs only on mount, with `[a, b]` it runs when `a` or `b` changes
C) Synchronously during render
D) Only on unmount

**45.** A common `useEffect` bug is:
A) Using it
B) Omitting a dependency that the effect reads, causing it to use stale values and produce inconsistent behavior
C) Returning a value
D) Naming the function

**46.** Returning a function from `useEffect`:
A) Is invalid
B) Registers cleanup that runs before the next effect or when the component unmounts — used for subscriptions, timers, abort controllers, etc.
C) Re-renders the component
D) Stops the effect

**47.** Lifting state up means:
A) Moving state to global scope
B) Moving state to the nearest common ancestor of components that need to read or write it, so they stay in sync
C) Using context
D) Persisting to localStorage

**48.** A controlled input in React:
A) Has its value managed by React state, with `value={...}` and `onChange={...}` driving every change through the component
B) Reads the DOM directly
C) Cannot be tested
D) Is deprecated

**49.** An uncontrolled input:
A) Stores its value in component state
B) Stores its value in the DOM itself, read via a ref when needed — sometimes appropriate for file inputs or large forms
C) Is invalid
D) Is read-only

**50.** `useMemo` is appropriate when:
A) Wrapping every value
B) Memoizing the result of a measurably expensive computation, or stabilizing a reference passed as a dependency or prop where reference equality matters
C) Replacing state
D) Caching API calls

**51.** Premature use of `useMemo` and `useCallback` everywhere:
A) Always helps
B) Adds complexity and its own overhead, often without measurable benefit; profile first, optimize where it matters
C) Is required
D) Replaces React.memo

**52.** Prop drilling — passing the same prop through many intermediate components — is best addressed when it becomes painful by:
A) Putting everything in global state
B) Using Context for cross-cutting concerns, or restructuring the component tree, or co-locating state with where it is used
C) Storing in window
D) Using refs

---

## Section E — TypeScript Basics (Q53–Q62)

**53.** TypeScript's value at runtime is:
A) Substantial — it transforms code execution
B) None directly — types are erased; its value is at compile time, where it catches errors and improves editor tooling
C) Performance
D) Bundle size

**54.** `any` as a type:
A) Is the safest type
B) Disables type checking for that value and tends to spread; reach for `unknown` instead when a value's type is genuinely not known
C) Is required for objects
D) Is the same as `never`

**55.** The difference between `interface` and `type` (for object shapes):
A) `interface` is faster
B) Both can describe object shapes; `interface` can be reopened and extended naturally, `type` can express unions, intersections, and computed types beyond what interfaces can — choose by intent
C) They are identical
D) `type` is deprecated

**56.** Generics like `function first<T>(arr: T[]): T` are useful because:
A) They make code harder to read
B) They let a function or component work with multiple types while preserving the relationship between inputs and outputs at the type level
C) They are required
D) They are slower

**57.** A union type `string | number`:
A) Means both at once
B) Means a value that is either a `string` or a `number` — you must narrow before using type-specific operations
C) Is a syntax error
D) Defaults to `string`

**58.** Narrowing a union via `typeof`, `instanceof`, or an `in` check:
A) Is unnecessary
B) Tells the compiler which branch of the union is active in a given block, enabling type-specific operations safely
C) Is runtime-only
D) Loses type info

**59.** `readonly` on an interface property:
A) Has no effect
B) Prevents reassignment of that property through the type — useful for clarity about ownership
C) Is enforced at runtime
D) Deep-freezes the object

**60.** A common TypeScript footgun in React is:
A) Generics
B) Typing event handlers — using the wrong event type for the element causes confusing errors; use `React.ChangeEvent<HTMLInputElement>` etc.
C) Using JSX
D) Using props

**61.** `as` (type assertion) should be:
A) Used freely
B) A last resort when you know more than the compiler and cannot express it through narrowing — overuse silently hides real bugs
C) Banned entirely
D) Required for objects

**62.** Strict mode (`"strict": true` in `tsconfig`):
A) Is for legacy code
B) Enables a set of options that surface real bugs early — `strictNullChecks`, `noImplicitAny`, and others; almost always worth enabling
C) Slows compilation
D) Breaks existing code permanently

---

## Section F — Accessibility (Q63–Q70)

**63.** Keyboard navigation matters because:
A) It is for power users only
B) Many users — including screen-reader users, users with motor impairments, and users without a mouse — depend on the keyboard exclusively to operate a site
C) It is only for testing
D) It is for accessibility tools

**64.** An interactive control built from a `<div>` with a click handler:
A) Works fine
B) Excludes keyboard users unless it also has `role="button"`, `tabindex="0"`, and handlers for Enter and Space — which is why a real `<button>` is almost always the right choice
C) Is faster
D) Is recommended

**65.** Focus management when opening a modal should:
A) Be ignored
B) Move focus into the modal, trap focus within it while open, and return focus to the trigger element when closed
C) Use blur
D) Be done by the user

**66.** `aria-label` and `aria-labelledby`:
A) Are identical
B) Provide an accessible name for an element; use `aria-labelledby` to reference visible text, `aria-label` for short standalone strings when no visible label exists
C) Are deprecated
D) Apply only to images

**67.** Color alone should never be the only way to convey information because:
A) Color is slow
B) Users with color blindness, low vision, or in low-contrast environments may not perceive the distinction — pair color with text, icon, or pattern
C) Color is expensive
D) CSS does not support it

**68.** Contrast ratio for body text against its background should generally meet:
A) Whatever looks nice
B) WCAG AA at minimum (4.5:1 for normal text, 3:1 for large text), with AAA as a stretch goal
C) 2:1
D) 10:1

**69.** A skip-link ("Skip to main content"):
A) Is decorative
B) Lets keyboard and screen-reader users bypass repeated navigation to reach the main content quickly — should be visible on focus
C) Is only for mobile
D) Is automatic

**70.** Visually hidden but screen-reader-accessible content is achieved with:
A) `display: none`
B) A "visually hidden" utility class that positions the content off-screen or uses `clip-path` and a tiny size — `display: none` and `visibility: hidden` remove it from screen readers too
C) `opacity: 0`
D) `color: transparent`

---

## Section G — Browser DevTools and Performance Basics (Q71–Q78)

**71.** The Network panel is most useful for:
A) Editing CSS
B) Inspecting requests, response timings, payload sizes, status codes, and identifying slow or oversized resources
C) Running JS
D) Profiling memory

**72.** "Disable cache" in DevTools is useful when:
A) Always
B) Testing changes to assets you suspect are being served stale, while the panel is open
C) Building production
D) Saving bandwidth

**73.** The Performance panel records:
A) Network only
B) A timeline of main-thread activity including scripting, rendering, painting, and user interactions — useful for diagnosing jank and long tasks
C) The DOM
D) Memory

**74.** A "long task" on the main thread is:
A) A blocking task longer than 50ms, which delays user input responsiveness
B) Any async task
C) A failed task
D) A blocked request

**75.** A large bundle size hurts:
A) Nothing — bandwidth is cheap
B) Initial load time, time-to-interactive, and especially the experience of users on slow networks and weaker devices
C) Only desktop users
D) The build server

**76.** Code splitting refers to:
A) Minifying code
B) Breaking a bundle into smaller chunks loaded on demand, often per route, so users only download what they need for the current view
C) Splitting a repo
D) Linting

**77.** An image format choice that often improves load time without quality loss is:
A) BMP for everything
B) WebP or AVIF for photos, SVG for vector graphics, with appropriate `srcset` and `sizes` for responsive images
C) GIF
D) TIFF

**78.** Lazy-loading offscreen images via `loading="lazy"`:
A) Has no effect
B) Defers loading until the image is near the viewport, reducing initial network and rendering cost
C) Is for videos only
D) Breaks accessibility

---

## Section H — Testing Basics (Q79–Q85)

**79.** A unit test should:
A) Cover the whole app
B) Test a small piece of logic in isolation, with a clear arrangement, action, and assertion — fast and deterministic
C) Run in production
D) Use real APIs

**80.** Snapshot tests are most useful when:
A) Replacing all other tests
B) Catching unintended changes in serializable output, with a human reviewing the diff when it changes — they are easy to over-rely on
C) Testing logic
D) Testing networks

**81.** Testing a React component should generally:
A) Mount the entire app
B) Render the component, interact with it as a user would (via Testing Library queries by role, label, or text), and assert on visible behavior — not on internal state
C) Inspect React internals
D) Skip user events

**82.** Mocking the network in tests:
A) Defeats the purpose
B) Is standard practice for fast, deterministic tests; tools like MSW intercept at the network layer so component code is unchanged
C) Is impossible
D) Requires the real server

**83.** A flaky test (passes sometimes, fails sometimes) should be:
A) Re-run until green
B) Diagnosed and fixed — flakiness usually indicates race conditions, async issues, or environmental dependencies, and ignoring it erodes trust in the suite
C) Disabled silently
D) Ignored

**84.** The right time to write a test is:
A) After release
B) Alongside or before the code, especially for logic with branches, edge cases, or regression risk — and always when fixing a bug, to prevent recurrence
C) Never
D) Only for backend

**85.** Test coverage as a metric:
A) Higher is always better
B) Is useful as a floor and a trend, not a target — 100% coverage with shallow tests is worse than 70% with meaningful ones
C) Should always be 100%
D) Is irrelevant

---

## Section I — Team Practices (Q86–Q100)

**86.** A small, focused PR compared to a large one:
A) Is harder to review
B) Is easier to review, faster to merge, and safer to revert — break large changes into a series of small ones when you can
C) Is the same
D) Wastes time

**87.** A PR that touches a file you do not understand:
A) Should be merged quickly to avoid blocking
B) Is a chance to ask questions or read for context; if the change is risky and your understanding is shallow, say so in review rather than rubber-stamp it
C) Should be ignored
D) Should be reverted

**88.** Reviewing a senior's PR:
A) Should be limited to typos
B) Is a normal part of your job; ask clarifying questions, point out things that genuinely seem wrong, and treat it as a learning opportunity rather than a power move
C) Is a waste of time
D) Should be skipped

**89.** Receiving harsh feedback on a PR:
A) Means you should quit
B) Hurts but is usually about the code, not you; respond with curiosity, fix what is fair, and if the tone was off, address that separately and calmly
C) Should be escalated immediately
D) Means the reviewer is wrong

**90.** A bug ticket without reproduction steps:
A) Should be closed
B) Is worth a comment asking for the missing detail; do not guess at the cause — the wrong fix is often worse than no fix
C) Should be fixed by guessing
D) Should be assigned back

**91.** When estimating a task as a junior, the healthiest approach is:
A) Promise the smallest number to look fast
B) Think through what is actually involved, give a range, flag uncertainty, and update the estimate as you learn more
C) Refuse to estimate
D) Match what others say

**92.** Standup is most useful as:
A) A status report to the manager
B) A short sync where the team coordinates the day, surfaces blockers, and asks for help — not a performance review
C) A meeting to skip
D) A debugging session

**93.** Asking a question publicly in a channel versus DMing one person:
A) DM is always politer
B) Public is usually better — others may know, others learn from the answer, and the senior is not the only point of failure for your unblocking
C) Public is rude
D) They are identical

**94.** A teammate is on vacation and their code is blocking you. The right move is:
A) Wait until they return
B) Read the code yourself first, check the docs and history, ask the team for context, and only escalate if you genuinely cannot proceed — and never disturb their vacation for a non-emergency
C) Disturb their vacation
D) Rewrite their code

**95.** Pair programming is most useful when:
A) Always
B) Tackling something hard or new, transferring knowledge, debugging something opaque, or shipping something high-stakes — not as a constant default
C) Replacing solo work
D) Code review

**96.** A task you finish early gives you time to:
A) Slack off until the deadline
B) Pick up another ticket, help a teammate, improve docs or tests, or do prep work for the next feature
C) Polish the same task indefinitely
D) Wait

**97.** A code smell you notice in unrelated code while working on a ticket:
A) Should be fixed in the same PR
B) Should usually be filed as a separate ticket and addressed in a separate PR, unless trivial — keep PRs focused
C) Should be ignored forever
D) Should be brought up in standup

**98.** Documentation you wished existed for a problem you just solved:
A) Is someone else's job
B) Is your opportunity to write it now, while the context is fresh — future-you and the next teammate will thank you
C) Will write itself
D) Is the senior's responsibility

**99.** Saying "no" or "not now" to a request you cannot reasonably take on:
A) Is insubordination
B) Is part of professional communication; explain capacity, ask what should be deprioritized, and propose alternatives — silent overcommitment is worse
C) Is rude
D) Is impossible

**100.** The behavior most strongly correlated with growing past Junior 2 is:
A) Speed
B) Consistent, visible follow-through — finishing what you start, communicating proactively about progress and problems, and being someone the team can count on
C) Brilliance
D) Working late

---

## Answer Key

1.B  2.B  3.B  4.B  5.B  6.B  7.B  8.B  9.B  10.B
11.B  12.B  13.B  14.B  15.B  16.B  17.B  18.B  19.B  20.B
21.B  22.B  23.B  24.B  25.B  26.B  27.B  28.B  29.B  30.B
31.B  32.B  33.B  34.B  35.B  36.B  37.B  38.B  39.B  40.B
41.B  42.B  43.B  44.B  45.B  46.B  47.B  48.A  49.B  50.B
51.B  52.B  53.B  54.B  55.B  56.B  57.B  58.B  59.B  60.B
61.B  62.B  63.B  64.B  65.B  66.B  67.B  68.B  69.B  70.B
71.B  72.B  73.B  74.A  75.B  76.B  77.B  78.B  79.B  80.B
81.B  82.B  83.B  84.B  85.B  86.B  87.B  88.B  89.B  90.B
91.B  92.B  93.B  94.B  95.B  96.B  97.B  98.B  99.B  100.B

**Passing threshold: 89 / 100**
