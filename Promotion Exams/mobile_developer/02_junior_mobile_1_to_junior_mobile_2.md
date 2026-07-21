# Promotion Exam: Junior Mobile Developer 1 → Junior Mobile Developer 2

**Track:** Mobile Developer (Specialist)
**Format:** 100 multiple-choice questions
**Time:** 135 minutes
**Passing score:** 89 / 100

**Scope.** A Junior Mobile 1 ships small tasks under supervision. A Junior Mobile 2 should take a small-to-medium mobile feature from ticket to production with light review — building the screens, wiring the data, handling the lifecycle and error states correctly, and not introducing crashes, leaks, or jank. This exam tests that gap: intermediate language features and concurrency, declarative UI in depth, architecture patterns (MVVM and unidirectional data flow), networking and local persistence done properly, navigation, testing basics, performance and memory awareness, and the team practices a Junior 2 must demonstrate.

**Platform note.** Same as exam 1 — concepts are cross-platform; substitute your stack's specifics where needed.

---

## Section A — Intermediate Language and Concurrency (Q1–Q15)

**1.** A closure / lambda capturing `self` (or an outer object) strongly:
A) Is always fine
B) Can create a retain cycle / memory leak on mobile — capture weakly where the closure outlives or is owned by the captured object
C) Is impossible
D) Speeds the app

**2.** `async/await` (or coroutines) on mobile:
A) Blocks the main thread
B) Lets asynchronous work be written sequentially while keeping the UI responsive — results are marshalled back to the main thread for UI updates
C) Creates OS threads per call
D) Is web-only

**3.** Structured concurrency (coroutine scopes, task groups):
A) Is decorative
B) Ties background work to a lifecycle so it is automatically cancelled when the owning screen goes away — preventing leaks and wasted work
C) Slows the app
D) Is for servers

**4.** Cancelling in-flight async work when a screen is dismissed:
A) Is unnecessary
B) Prevents updates to a dead screen, saves battery and data, and avoids crashes — cancellation should be wired to the lifecycle
C) Is impossible
D) Is automatic always

**5.** A race condition on mobile:
A) Cannot happen with async/await
B) Can absolutely happen — overlapping async operations mutating shared state, or a slow response arriving after a newer one, produce inconsistent UI
C) Only happens with threads
D) Is the same as a deadlock

**6.** Two network requests where the slower, older one finishes last and overwrites newer data:
A) Is impossible
B) Is a classic stale-response race — track the latest request and ignore outdated responses, or cancel superseded ones
C) Is fine
D) Is the server's bug

**7.** Immutable data models for UI state:
A) Are slower and pointless
B) Make state transitions explicit and debuggable — a new state replaces the old, rather than fields mutating unpredictably
C) Cannot represent lists
D) Are backend-only

**8.** A sealed class / enum with associated values for UI state:
A) Is over-engineering
B) Cleanly models mutually exclusive states (Loading, Content(data), Error(message), Empty) so the UI handles each exhaustively
C) Cannot carry data
D) Is deprecated

**9.** Higher-order functions (`map`, `filter`, `reduce`, `flatMap`):
A) Mutate collections
B) Transform collections declaratively into new ones; chaining them expresses data pipelines clearly
C) Are slower always
D) Only work on numbers

**10.** Optional/null handling in a chain (`a?.b?.c`):
A) Crashes on null
B) Safely short-circuits to null if any link is null — far safer than force-unwrapping each step
C) Is the same as `a.b.c`
D) Throws

**11.** Force-unwrapping (`!`) or non-null assertion (`!!`):
A) Is the normal way
B) Should be rare and justified — it crashes if the value is null; prefer safe unwrapping, defaults, or early return
C) Is required
D) Cannot crash

**12.** Extension functions / extensions:
A) Modify the original class source
B) Add functionality to existing types without subclassing — useful for readability, but overuse can scatter logic
C) Are deprecated
D) Break encapsulation always

**13.** Dependency injection (constructor injection, DI frameworks):
A) Is over-engineering for mobile
B) Passes dependencies in rather than constructing them internally — making code testable and decoupled from concrete implementations
C) Slows startup unacceptably
D) Is for backend only

**14.** A `when`/`switch` over a sealed type without a catch-all:
A) Is dangerous
B) Enables exhaustiveness checking — add a new case and the compiler flags every place that must handle it
C) Is slower
D) Is discouraged

**15.** Equality: reference equality versus value equality:
A) Are the same
B) Reference equality checks if two variables point to the same instance; value equality checks if contents match — using the wrong one causes subtle UI-diffing and comparison bugs
C) Only reference equality exists
D) Value equality is deprecated

---

## Section B — Declarative UI in Depth (Q16–Q30)

**16.** In a declarative UI, "state drives the view" means:
A) The view mutates itself
B) You update state; the framework recomputes and applies the minimal UI changes — you rarely imperatively mutate views
C) The view updates the state
D) Nothing changes automatically

**17.** Local (view) state versus shared/hoisted state:
A) Are the same
B) Ephemeral UI-only state (a toggle, a text field) can live locally; state multiple components need should be hoisted to a common owner or a state holder
C) All state should be global
D) State cannot be local

**18.** A list that re-renders every row when one item changes:
A) Is expected
B) Is often a diffing/keying problem — stable identity per item lets the framework update only what changed, keeping scrolling smooth
C) Is unavoidable
D) Is a network issue

**19.** Stable keys / identity in a dynamic list:
A) Are decorative
B) Let the framework match items across updates so it can move, insert, and remove correctly rather than rebuilding — using array index as identity causes bugs when items reorder
C) Are for styling
D) Are optional always

**20.** Expensive work inside the UI build/render function:
A) Is fine
B) Runs on every recomposition/render and can cause jank — compute or cache it outside the hot path
C) Is faster there
D) Is required

**21.** A "recomposition" / re-render:
A) Always redraws every pixel
B) Recomputes the UI description; the framework applies only actual differences — but doing heavy work during it still costs
C) Is a network call
D) Means a crash

**22.** Side effects in declarative UI (starting a request, subscribing) belong:
A) Inline in the render body
B) In the framework's designated side-effect APIs tied to lifecycle (effects/launched effects/onAppear), so they run at the right time and are cleaned up
C) Anywhere
D) In the constructor only

**23.** Deriving UI values from state:
A) Should be stored as separate state and manually kept in sync
B) Should be computed from the source state where possible — duplicate state that must be manually synced is a bug source
C) Requires a database
D) Is impossible

**24.** A form with several fields:
A) Should store each keystroke in global state
B) Should manage field state at an appropriate scope, validate at sensible moments, and show errors clearly — over-broad state causes needless re-renders
C) Cannot be validated
D) Needs no state

**25.** Theming with semantic tokens (colors, spacing, typography):
A) Is unnecessary
B) Centralizes design values so dark mode, rebrands, and consistency are systematic rather than find-and-replace
C) Is web-only
D) Slows rendering

**26.** Handling different screen sizes in a declarative layout:
A) Hardcode positions
B) Use flexible containers, size classes / window size classes, and adaptive layouts so the UI works across phones, foldables, and tablets
C) Ship separate apps
D) Ignore tablets

**27.** Reusable UI components:
A) Should be copied per screen
B) Should be extracted with a small, clear API (inputs in, events out) so they are consistent and maintainable
C) Break the framework
D) Are for web only

**28.** Animations in declarative UI:
A) Are manual frame math
B) Are typically expressed as animated transitions between states, letting the framework interpolate — simpler and smoother than manual animation in most cases
C) Should be avoided
D) Block the thread

**29.** Accessibility in declarative UI:
A) Is automatic and complete
B) Requires semantic labels, roles, grouping, and testing with the screen reader — the framework helps but does not do it all for you
C) Is impossible
D) Is web-only

**30.** A screen that looks perfect on your simulator but breaks on a real device:
A) Means the device is faulty
B) Is a normal reason to test on real hardware — fonts, densities, safe areas, performance, and system behaviors differ from the simulator
C) Is impossible
D) Is a framework bug

---

## Section C — Architecture Patterns (Q31–Q42)

**31.** MVVM (Model-View-ViewModel) on mobile:
A) Puts all logic in the view
B) Separates UI (View) from presentation logic and state (ViewModel) from data (Model) — improving testability and surviving lifecycle events
C) Is deprecated
D) Is backend architecture

**32.** Putting network calls and business logic directly in the View/Activity/ViewController:
A) Is clean
B) Is a common anti-pattern — it becomes untestable, leaks with the lifecycle, and mixes concerns; move logic to a ViewModel/state holder and a data layer
C) Is faster
D) Is required

**33.** Unidirectional data flow (state down, events up):
A) Is confusing
B) Makes apps predictable — state flows down to the UI, user events flow up to be handled, producing a new state; easier to reason about and debug than two-way tangles
C) Is slower
D) Is web-only

**34.** A repository layer:
A) Is a Git repo
B) Abstracts data sources (network, cache, database) behind a clean interface, so the rest of the app does not care where data comes from — and it can be swapped or mocked in tests
C) Is the UI
D) Is deprecated

**35.** A "single source of truth" for a piece of data:
A) Means one screen reads it
B) Means the data lives in one authoritative place and views derive from it — preventing the inconsistencies of divergent copies
C) Means one user
D) Is global state

**36.** Business logic in the ViewModel versus the View:
A) Belongs in the View
B) Belongs out of the View — the View should be thin, rendering state and forwarding events, so logic is testable without the UI
C) Belongs in the model only
D) Does not exist on mobile

**37.** Testability as an architecture goal:
A) Is a nice-to-have
B) Drives good structure — code designed so logic can be tested without a device or UI is almost always better-decoupled code
C) Slows delivery
D) Is for backend

**38.** A god-object screen controller holding everything:
A) Is efficient
B) Is a maintainability and testability problem — split responsibilities across state holders, data layers, and small components
C) Is required
D) Is fast

**39.** Navigation logic:
A) Should be scattered across screens
B) Benefits from a clear approach (a coordinator/router, a nav graph, typed routes) so flows are testable and back-stack behavior is predictable
C) Is automatic
D) Does not matter

**40.** Mapping API/data models to UI models:
A) Is wasteful — use API models directly in the UI
B) Is often worth it — a UI model shaped for the screen decouples the UI from backend changes and keeps view code clean
C) Is impossible
D) Is the backend's job

**41.** Feature flags in a mobile app:
A) Are pointless — you redeploy anyway
B) Are especially valuable because store review delays hotfixes — flags let you disable a broken feature remotely without shipping a new build
C) Are the same as A/B tests only
D) Do not work on mobile

**42.** Choosing an architecture pattern for a small app:
A) Always use the most elaborate one
B) Match the pattern to the app's complexity — over-architecting a simple app wastes effort; under-architecting a growing one causes pain later
C) Never use patterns
D) Copy the biggest app you know

---

## Section D — Networking and Persistence (Q43–Q56)

**43.** A typed network layer:
A) Is over-engineering
B) Wraps HTTP calls with typed requests/responses, centralized error handling, auth injection, and retries — better than scattering raw calls across screens
C) Is web-only
D) Is deprecated

**44.** Handling HTTP error status codes:
A) Treat all responses as success
B) Distinguish success, client errors (4xx), and server errors (5xx), and map them to appropriate UI and retry behavior
C) Only handle 200
D) Retry everything forever

**45.** A 401 from the API mid-session:
A) Crash
B) Typically means the token expired/was revoked — trigger a refresh flow or route to login, handled centrally rather than per screen
C) Ignore it
D) Retry with the same token forever

**46.** Retry policy for a failed request:
A) Retry immediately, forever
B) Bounded retries with backoff for transient/5xx/network errors; do not blindly retry 4xx, and be careful retrying non-idempotent writes
C) Never retry
D) Retry only on Wi-Fi

**47.** Decoding JSON defensively:
A) Assume every field is present and correctly typed
B) Handle optional/missing fields and unexpected values so a backend change or bad record does not crash the app
C) Use regex
D) Is unnecessary

**48.** A local database (Room, Core Data, SQLite, Realm):
A) Replaces the backend
B) Provides structured, queryable on-device storage for caching and offline — with migrations needed when the schema changes
C) Is for secrets
D) Is deprecated

**49.** Schema migrations for a local database:
A) Are unnecessary
B) Are required when the stored schema changes between app versions — an unhandled migration can crash on launch or lose user data
C) Are automatic always
D) Are the backend's job

**50.** Offline-first design:
A) Means no network
B) Means the app works from local data and syncs with the network in the background — reads hit the local store, writes queue and reconcile, improving resilience and speed
C) Is impossible
D) Means caching everything forever

**51.** Syncing local changes made offline:
A) Is trivial
B) Requires a conflict strategy (last-write-wins, merge, or server authority) and idempotent operations — sync is one of the harder mobile problems
C) Never conflicts
D) Is automatic

**52.** Caching images:
A) Re-download every time
B) Use a caching image loader with memory and disk tiers and correct sizing — reloading images on every scroll wastes data and janks
C) Load full-size always
D) Is impossible

**53.** Secure storage for tokens:
A) Shared preferences / UserDefaults in plaintext
B) Keychain / Keystore-backed secure storage — plaintext preference stores are readable on compromised devices
C) A local file
D) Hardcoded

**54.** Storing large blobs (videos, downloads):
A) In the database as columns
B) On the filesystem with references in the database — databases are poor stores for large binary blobs
C) In preferences
D) In memory

**55.** A key-value store (preferences/UserDefaults):
A) For everything
B) For small, simple settings and flags — not for large data, relational data, or secrets
C) For secrets
D) Is deprecated

**56.** Pagination + local caching together:
A) Conflict
B) Combine well — cache fetched pages locally so revisits are instant and offline-tolerant, while fetching new pages on scroll
C) Are impossible
D) Are backend-only

---

## Section E — Navigation and App Flow (Q57–Q65)

**57.** The back stack:
A) Is decorative
B) Is the history of screens the user can navigate back through — managing it correctly (especially with deep links and tabs) is a common source of subtle bugs
C) Only exists on Android
D) Is automatic and never wrong

**58.** A deep link that opens a detail screen:
A) Just shows the screen
B) Should reconstruct a sensible back stack so pressing back behaves correctly, not dumping the user out of the app
C) Is impossible
D) Is web-only

**59.** Passing data between screens:
A) Via global mutable variables
B) Via typed arguments/routes or a shared state holder — global mutable passing is fragile and hard to trace
C) Is impossible
D) Via the database only

**60.** Tab navigation with independent back stacks:
A) Shares one stack
B) Typically each tab maintains its own navigation state so switching tabs preserves each tab's position — a common expectation to get right
C) Is automatic everywhere
D) Is deprecated

**61.** Handling the hardware/system back gesture:
A) Ignore it
B) Handle it consistently with in-app navigation, including unsaved-changes prompts where appropriate
C) Is iOS-only
D) Cannot be intercepted

**62.** A modal flow (e.g., multi-step form) interrupted by a phone call or backgrounding:
A) Loses all progress acceptably
B) Should preserve state so the user can resume — mobile interruptions are constant
C) Cannot be preserved
D) Is rare

**63.** Navigation logic living in the View:
A) Is clean
B) Is harder to test and reuse — centralizing routing (coordinator/router/nav graph) improves both
C) Is required
D) Is the only way

**64.** Conditional navigation (auth-gated screens):
A) Check auth in each screen
B) Enforce it in a routing/guard layer so protected destinations consistently require auth, rather than duplicating checks
C) Trust the UI to hide it
D) Is impossible

**65.** Restoring navigation state after process death:
A) Is automatic and perfect
B) Requires saving and restoring the nav state so a user killed in the background returns to where they were, not the root
C) Is impossible
D) Is unnecessary

---

## Section F — Testing Basics (Q66–Q75)

**66.** A unit test on mobile:
A) Requires a device
B) Tests a piece of logic (often in a ViewModel or data layer) in isolation, fast and deterministic, without the UI or a real device
C) Is the same as a UI test
D) Runs in production

**67.** Testable architecture:
A) Is unrelated to testing
B) Is what makes unit tests possible — logic separated from the framework and device can be tested cheaply; UI-coupled logic cannot
C) Slows delivery
D) Is backend-only

**68.** A UI/instrumentation test:
A) Replaces unit tests
B) Drives the app's UI (on a device/emulator) to verify user flows end-to-end — slower and more brittle, so used for critical journeys, not everything
C) Is faster than unit tests
D) Is unnecessary

**69.** Mocking the network in tests:
A) Defeats the purpose
B) Is standard — inject a fake data source so tests are fast and deterministic and do not depend on a live backend
C) Is impossible
D) Requires the real server

**70.** A flaky UI test:
A) Should be retried until green
B) Should be diagnosed — usually timing/async assumptions or shared state; ignoring flakiness erodes trust in the suite
C) Is acceptable
D) Cannot be fixed

**71.** Testing the ViewModel/state holder:
A) Is impossible
B) Is high-value — assert that given inputs and events, it produces the expected state sequence, without touching the UI
C) Requires a device
D) Is the same as UI testing

**72.** A regression test for a fixed crash:
A) Is paranoia
B) Locks in the fix so the crash cannot silently return — write it while the failure is reproducible
C) Slows the fix
D) Is QA's job only

**73.** Test coverage:
A) Must be 100%
B) Is a floor and a trend, not a target — meaningful tests on logic and critical flows matter more than a coverage number
C) Is irrelevant
D) Replaces review

**74.** Testing offline/error behavior:
A) Is unnecessary
B) Is exactly where bugs hide — simulate failures, timeouts, and empty responses, not just the happy path
C) Is impossible
D) Is automatic

**75.** Manual testing on real devices:
A) Is obsolete
B) Remains essential — automated tests cannot catch everything device fragmentation, real networks, and real gestures produce
C) Replaces all automation
D) Is for QA only

---

## Section G — Performance and Memory (Q76–Q88)

**76.** Jank (dropped frames):
A) Is a network problem only
B) Happens when the main thread misses the frame budget — caused by heavy work on the UI thread, large images, or expensive layout/render
C) Is unavoidable
D) Only affects old phones

**77.** The frame budget:
A) Is unlimited
B) Is roughly 16ms at 60fps (less at higher refresh rates) — work exceeding it on the main thread drops frames
C) Is the network timeout
D) Is per app, not per frame

**78.** Loading a large bitmap at full resolution into a small view:
A) Is fine
B) Wastes large amounts of memory and risks out-of-memory crashes — downsample to the display size
C) Is faster
D) Is required for quality

**79.** A memory leak on mobile commonly comes from:
A) Too many functions
B) Retained references to dead screens — closures/listeners/singletons holding contexts, controllers, or views that should have been released
C) The network
D) Small images

**80.** Detecting leaks:
A) Is impossible
B) Uses profiling tools (memory profiler, leak detectors, Instruments) to spot growth and retained objects that should be gone
C) Is automatic
D) Requires production only

**81.** Overdraw / deep view hierarchies:
A) Are free
B) Cost rendering time — flatten hierarchies and avoid drawing hidden layers to keep rendering fast
C) Improve performance
D) Only matter on iOS

**82.** Doing disk or database I/O on the main thread:
A) Is fine for small files
B) Can stall the UI — move I/O off the main thread and deliver results back for display
C) Is faster
D) Is required

**83.** App startup time:
A) Does not matter
B) Is a key metric — heavy work at launch delays first paint; defer non-critical initialization
C) Is fixed
D) Only matters once

**84.** Battery drain from background work:
A) Is negligible
B) Comes largely from wake-ups, radios, and location — batch work, respect background limits, and avoid unnecessary polling
C) Is the OS's fault
D) Is unavoidable

**85.** Network payload size on mobile:
A) Does not matter
B) Matters for speed, data cost, and battery — request only needed fields, compress, and paginate
C) Is free
D) Is the backend's concern only

**86.** Measuring performance:
A) Guess from your own device
B) Profile with real tools and, where possible, field data from real users on real devices — perceived performance varies enormously across hardware
C) Is impossible
D) Is unnecessary

**87.** Premature optimization on mobile:
A) Is always good
B) Wastes effort and adds complexity — measure to find the real bottleneck (often images, layout, or main-thread I/O) before optimizing
C) Is required
D) Is the same as caching

**88.** A list that stutters while scrolling:
A) Needs a faster phone
B) Usually needs profiling — common causes are un-recycled rows, synchronous image loading, or heavy work per row
C) Is unfixable
D) Is a network issue

---

## Section H — Team Practices (Q89–Q100)

**89.** A small, focused PR:
A) Is harder to review
B) Is easier to review, faster to merge, and safer to revert — break large mobile changes into smaller ones
C) Is the same as a large one
D) Wastes time

**90.** Reviewing a senior's code:
A) Is presumptuous
B) Is normal — ask questions, flag anything that looks off, and treat it as learning
C) Is forbidden
D) Should be typos only

**91.** A crash reported only on a specific device/OS you do not own:
A) Ignore it
B) Use crash-report context, device farms, or emulators matching that config to reproduce — device-specific bugs are a mobile reality
C) Close as unreproducible immediately
D) Blame the user

**92.** Store review delays mean:
A) You can hotfix instantly
B) A bad release may be live for days before a fix ships — so pre-release testing, staged rollouts, and remote feature flags matter more than on the web
C) Nothing changes
D) Releases are instant

**93.** A staged / phased rollout:
A) Is pointless
B) Releases to a small percentage of users first, so a regression is caught before it reaches everyone — and can be halted
C) Is the same as beta
D) Is web-only

**94.** Beta channels (TestFlight, Play internal/closed testing):
A) Are unnecessary
B) Let real users test pre-release builds on real devices before public launch — invaluable given fragmentation
C) Replace unit tests
D) Are for iOS only

**95.** Saying "I do not know, let me find out":
A) Damages credibility
B) Builds it — guessing produces buggy apps that are slow to fix; honesty is a strength
C) Is for seniors
D) Should be avoided

**96.** Estimating a mobile feature:
A) Quote the smallest number
B) Account for the hidden parts — states, device testing, store constraints, edge cases — and quote a range that reflects them
C) Refuse
D) Match the senior

**97.** Documentation for a tricky platform workaround you found:
A) Is a waste
B) Saves the next person (often you) hours — mobile is full of device- and version-specific gotchas worth writing down
C) Is the lead's job
D) Writes itself

**98.** A teammate is blocked on your code:
A) Wait until they ask twice
B) Unblock them promptly — your throughput is the team's; finish your part or hand it off, and communicate either way
C) Ignore it
D) Charge them

**99.** When your change causes a production crash:
A) Hide it
B) Report it fast, help contain (feature-flag off, staged-rollout halt, hotfix), and contribute to a blameless understanding — speed of honesty matters more on mobile because fixes are slow to ship
C) Wait for a review cycle
D) Blame the device

**100.** The most reliable predictor of growth past Junior 2 is:
A) Speed
B) Consistent follow-through and craft — finishing cleanly, communicating proactively, caring about crashes and performance on real user devices, and being someone the team can count on
C) Brilliance
D) Long hours

---

## Answer Key

1.B  2.B  3.B  4.B  5.B  6.B  7.B  8.B  9.B  10.B
11.B  12.B  13.B  14.B  15.B  16.B  17.B  18.B  19.B  20.B
21.B  22.B  23.B  24.B  25.B  26.B  27.B  28.B  29.B  30.B
31.B  32.B  33.B  34.B  35.B  36.B  37.B  38.B  39.B  40.B
41.B  42.B  43.B  44.B  45.B  46.B  47.B  48.B  49.B  50.B
51.B  52.B  53.B  54.B  55.B  56.B  57.B  58.B  59.B  60.B
61.B  62.B  63.B  64.B  65.B  66.B  67.B  68.B  69.B  70.B
71.B  72.B  73.B  74.B  75.B  76.B  77.B  78.B  79.B  80.B
81.B  82.B  83.B  84.B  85.B  86.B  87.B  88.B  89.B  90.B
91.B  92.B  93.B  94.B  95.B  96.B  97.B  98.B  99.B  100.B

**Passing threshold: 89 / 100**
