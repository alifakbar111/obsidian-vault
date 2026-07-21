# Promotion Exam: Junior Mobile Developer 2 → Junior Mobile Developer 3

**Track:** Mobile Developer (Specialist)
**Format:** 100 multiple-choice questions
**Time:** 150 minutes
**Passing score:** 89 / 100

**Scope.** Junior Mobile 3 is the top of the specialist track before the ladder converges into generalist Senior 1. A Junior 3 takes medium features from spec to production with minimal supervision, contributes to design discussions, mentors juniors and interns, writes code others learn from, and shows early architectural instinct. This exam tests that depth: advanced concurrency and reactive patterns, deep lifecycle and process-death handling, performance and memory under measurement, offline-first and sync, release engineering and the store pipeline, push notifications and background execution, security and privacy depth, testing strategy beyond unit tests, accessibility and internationalization, and early judgment.

**Reminder.** This is the last specialist-only mobile exam. The next exam (Junior 3 → Senior 1) is the convergence point and tests whether the candidate has broadened beyond mobile into backend, web, and systems thinking a generalist senior must own. A candidate who passes this decisively but has never reasoned about an API's design, a database index, or how the server behind their app scales is not ready for the next gate. That is by design.

---

## Section A — Advanced Concurrency and Reactive Patterns (Q1–Q12)

**1.** A reactive stream (Flow, Combine, RxJava, observables):
A) Is a network call
B) Models values over time that the UI or other consumers observe and react to — powerful for state, events, and data pipelines, but with real complexity in lifecycle and error handling
C) Is deprecated
D) Blocks the thread

**2.** A hot stream versus a cold stream:
A) Are the same
B) A cold stream starts producing per subscriber (e.g., a network call on collect); a hot stream emits regardless of subscribers (e.g., UI events) — confusing them causes duplicate work or missed events
C) Hot is faster
D) Cold cannot error

**3.** Collecting a stream tied to the screen lifecycle:
A) Is unnecessary
B) Prevents leaks and wasted work — collection should stop when the screen is not visible/active and resume appropriately
C) Is automatic always
D) Slows the app

**4.** Backpressure in a stream:
A) Cannot happen on mobile
B) Occurs when a producer outpaces a consumer; operators for buffering, conflating, or dropping decide behavior — the default may not be what you want for UI
C) Is a network setting
D) Is deprecated

**5.** Combining multiple async sources (two API calls, cache + network):
A) Await sequentially always
B) Use combine/zip/flatMap operators or structured concurrency to run independent work in parallel and merge results, handling partial failure explicitly
C) Is impossible
D) Requires threads

**6.** Debouncing user input (search-as-you-type):
A) Is unnecessary
B) Delays acting until input settles, avoiding a request per keystroke — combined with cancellation of superseded requests
C) Slows the UI
D) Is web-only

**7.** A shared mutable state accessed from multiple coroutines/threads:
A) Is always safe in a single-threaded UI model
B) Needs synchronization or confinement (actors, single-threaded dispatchers, immutable snapshots) to avoid data races
C) Cannot be shared
D) Is automatic

**8.** Cancelling a chain of dependent async operations:
A) Requires manual flags
B) Is handled cleanly by structured concurrency — cancelling the scope cancels the children, propagating correctly
C) Is impossible
D) Leaves children running

**9.** An error in one branch of a parallel fetch:
A) Should crash
B) Should be handled per the product need — fail the whole operation, or degrade gracefully showing partial data — decided deliberately, not by accident
C) Is impossible
D) Is the server's problem

**10.** Threading for heavy computation (image processing, parsing large data):
A) On the main thread
B) On a background dispatcher/thread, with progress and cancellation, delivering results to the main thread — never blocking the UI
C) Is not allowed
D) In the render loop

**11.** A `Dispatchers.Main`/main-actor hop for every tiny operation:
A) Is free
B) Has overhead; batch UI updates and minimize thread hops in hot paths
C) Is required per line
D) Is impossible

**12.** Testing reactive/async code:
A) Is impossible
B) Uses test schedulers/dispatchers and virtual time to make async deterministic — essential for reliable tests of streams and coroutines
C) Requires a device
D) Cannot be deterministic

---

## Section B — Lifecycle, Process Death, and State (Q13–Q22)

**13.** Process death (OS kills the backgrounded app process):
A) Never happens on modern phones
B) Is normal — the app must restore critical UI and navigation state so the user returns seamlessly, distinct from in-memory state that survives configuration changes
C) Is a crash
D) Is preventable

**14.** Saved instance state / state restoration:
A) Restores everything automatically
B) Persists a small amount of essential state (scroll position, input, selected item) to survive process death — large or sensitive data belongs elsewhere
C) Is for animations
D) Is deprecated

**15.** A ViewModel/state holder surviving configuration changes:
A) Survives process death too
B) Survives rotation/config changes but not process death — for process death you also need persisted saved state
C) Is the same as the database
D) Never survives anything

**16.** Distinguishing transient UI state, retained state, and persisted state:
A) Is pedantic
B) Is central to getting mobile state right — each survives different events (recomposition, config change, process death, restart), and mixing them up produces lost-work bugs
C) Is the same thing
D) Is backend-only

**17.** A long operation in progress when the app is backgrounded:
A) Always completes
B) May be suspended; use background-execution APIs for work that must finish, and design for resumption or safe restart
C) Is cancelled cleanly always
D) Cannot happen

**18.** Deep link into a detail screen after process death:
A) Just shows the screen
B) Must reconstruct both the target and a sensible back stack from persisted/derivable state, not assume the app was already running
C) Is impossible
D) Crashes

**19.** Lifecycle-aware components (observers scoped to lifecycle):
A) Are over-engineering
B) Start and stop work automatically with the lifecycle, eliminating a whole class of leak and crash bugs from manual management
C) Slow the app
D) Are web-only

**20.** A callback firing after its screen is gone:
A) Is fine
B) Is a bug/crash risk — cancel or unregister on teardown, and guard against updating dead UI
C) Is impossible
D) Speeds the app

**21.** Multi-window / split-screen / foldable states:
A) Never occur
B) Are real lifecycle and layout scenarios on modern devices — the app should adapt and not assume it owns the full screen or is always foreground
C) Are iOS-only
D) Are crashes

**22.** State restoration testing:
A) Is impossible
B) Should be done deliberately — force process death (developer settings/tools) and verify the app restores correctly, because it rarely happens in casual testing
C) Is automatic
D) Is unnecessary

---

## Section C — Performance and Memory Under Measurement (Q23–Q34)

**23.** Diagnosing jank:
A) Guess and add caching
B) Profile the frame timeline to find what exceeds the frame budget — main-thread work, layout, overdraw, or synchronous I/O — then fix the actual cause
C) Buy faster phones
D) Reduce features

**24.** Startup time optimization:
A) Do everything eagerly at launch
B) Defer non-critical initialization, lazy-load, and measure cold/warm start — startup is a first-impression metric and store-surfaced on some platforms
C) Is impossible
D) Does not matter

**25.** Memory profiling reveals steadily growing memory:
A) Normal
B) Likely a leak — retained screens, unbounded caches, or unremoved observers; find the retained references and cut them
C) A feature
D) A network issue

**26.** An unbounded in-memory cache:
A) Is fast and fine
B) Grows until it triggers memory pressure or crashes — bound it with size/LRU eviction
C) Is required
D) Is automatic

**27.** Large images in memory:
A) Are cheap
B) Are among the top OOM causes — downsample to display size, use appropriate formats, and rely on a caching loader with memory limits
C) Should be full resolution
D) Are the OS's problem

**28.** Overdraw:
A) Is free
B) Wastes GPU/CPU redrawing pixels multiple times — flatten hierarchies and remove hidden backgrounds
C) Improves quality
D) Is unavoidable

**29.** Battery profiling:
A) Is impossible
B) Identifies wake-locks, excessive location/network use, and background drains — respect background execution limits and batch work
C) Is the OS's job
D) Does not matter

**30.** Network efficiency:
A) Irrelevant on Wi-Fi
B) Affects speed, data cost, and battery on cellular — minimize payloads, compress, cache, coalesce, and avoid chatty polling
C) Is the backend's concern only
D) Is free

**31.** App size optimization:
A) Never matters
B) Improves install and update rates, especially on low-end devices and constrained networks — use app-thinning/app-bundle splits, remove unused assets and dependencies
C) Is fixed
D) Is iOS-only

**32.** Perceived performance versus measured performance:
A) Are the same
B) Differ — skeleton screens, optimistic UI, and progressive loading make an app feel fast even when work is ongoing; both matter
C) Only measured matters
D) Only perceived matters

**33.** Profiling on a low-end device:
A) Is unnecessary if it runs on your flagship
B) Is essential — the experience on cheaper, older hardware (common in many markets) is where performance problems actually bite users
C) Is impossible
D) Is misleading

**34.** Fixing a performance problem without measuring first:
A) Is efficient
B) Often optimizes the wrong thing — measure, find the real bottleneck, fix, then measure again
C) Is required
D) Is the same as profiling

---

## Section D — Release Engineering and the Store Pipeline (Q35–Q48)

**35.** The app store review process:
A) Is instant
B) Introduces delay (hours to days) and rejection risk — plan releases around it, and never assume you can hotfix a live bug immediately
C) Is optional
D) Is the same as web deploy

**36.** A staged / phased rollout:
A) Is pointless
B) Releases to a growing percentage of users so regressions surface before hitting everyone — and can be halted mid-rollout
C) Is a beta channel
D) Is web-only

**37.** Remote feature flags / remote config:
A) Are redundant with releases
B) Are critical on mobile — they let you disable a broken feature or change behavior without shipping a new build through review
C) Do not work on mobile
D) Are only for A/B tests

**38.** A forced-update mechanism:
A) Is hostile
B) Is sometimes necessary — for security fixes or breaking API changes, the app should be able to require users to update, handled gracefully
C) Is impossible
D) Is automatic

**39.** Backward compatibility with older app versions:
A) Is unnecessary — everyone updates
B) Must be assumed — a meaningful fraction of users run old versions for a long time, so the backend and APIs must support them or force updates deliberately
C) Is the backend's sole concern
D) Never matters

**40.** Versioning (version name and build number):
A) Is decorative
B) Must increment correctly for store uploads and crash attribution — mismatches cause upload rejections and confused debugging
C) Is automatic
D) Does not matter

**41.** Code signing and keys:
A) Are irrelevant
B) Are security-critical infrastructure — losing or leaking a signing key can prevent updates or allow malicious impersonation; keys must be secured and backed up
C) Are per-developer
D) Are automatic

**42.** CI/CD for mobile:
A) Is impossible
B) Automates build, test, signing, and distribution to beta/store — reducing manual error in a release process that has many fiddly steps
C) Is the same as web CI exactly
D) Is unnecessary

**43.** Crash-free rate / crash-free users:
A) Is vanity
B) Is a core mobile health metric — track it per release, and treat a regression as a release-blocking or rollback-worthy signal
C) Is a backend metric
D) Does not matter

**44.** A release that spikes crashes for a subset of devices:
A) Wait and see
B) Halt the rollout, disable the feature via flag if possible, diagnose from crash reports, and ship a fix through the expedited path if available
C) Ignore unless widespread
D) Blame the devices

**45.** Beta/internal testing before public release:
A) Is unnecessary
B) Catches device- and real-world issues automation misses — internal, closed, and open testing tracks each serve a purpose
C) Replaces automated tests
D) Is iOS-only

**46.** App store metadata, privacy labels, and permissions declarations:
A) Are marketing only
B) Are compliance requirements — inaccurate privacy declarations or unjustified permissions can get an app rejected or removed
C) Are optional
D) Are automatic

**47.** Rollback on mobile:
A) Is as easy as the web
B) Is limited — you generally cannot un-ship a build users installed; the practical "rollback" is a feature flag off, a halted rollout, or an expedited fix, which is why prevention matters more
C) Is instant
D) Is automatic

**48.** Managing minimum-supported OS version:
A) Support everything forever
B) Is a deliberate trade-off — supporting older OSes reaches more users but costs engineering effort; decide with data on your user base
C) Is fixed by the store
D) Does not matter

---

## Section E — Notifications and Background Work (Q49–Q57)

**49.** Push notifications:
A) Are guaranteed delivery
B) Are best-effort — do not rely on them for critical data sync; treat them as hints that may be delayed, coalesced, or dropped
C) Are instant always
D) Work offline

**50.** A push notification token:
A) Is permanent
B) Can change and must be refreshed and re-registered with the backend — stale tokens cause silent delivery failures
C) Is the auth token
D) Never changes

**51.** Silent/background push:
A) Runs unlimited work
B) Grants limited background time to fetch or update — respect the constraints and finish quickly, or the OS throttles future delivery
C) Is the same as a visible push
D) Does not exist

**52.** Notification permissions:
A) Are granted at install
B) Must be requested, are easily denied, and denial should not break the app — ask in context with a clear value proposition
C) Never expire
D) Are automatic

**53.** Background sync / periodic work:
A) Runs whenever you schedule it, exactly
B) Is subject to OS scheduling, batching, and battery optimizations — use the platform's work scheduler and design for inexact timing
C) Is guaranteed
D) Is unlimited

**54.** Deep-linking from a notification:
A) Just opens the app
B) Should route to the relevant screen with a sensible back stack, handling the case where the app was cold-started by the tap
C) Is impossible
D) Is web-only

**55.** Battery optimization / doze modes:
A) Do not affect apps
B) Restrict background work to save battery — apps must work within them rather than fighting them, and test under them
C) Are optional to handle
D) Are iOS-only

**56.** Notification channels/categories and user control:
A) Are unnecessary
B) Let users control notification types granularly; respecting this (and not over-notifying) reduces opt-outs and uninstalls
C) Are automatic
D) Are decorative

**57.** Relying on background work for a critical, time-sensitive action:
A) Is safe
B) Is risky — background execution is throttled and unreliable; critical actions should complete in the foreground or be server-driven
C) Is required
D) Always runs on time

---

## Section F — Security, Privacy, and Compliance Depth (Q58–Q68)

**58.** Secrets in the app:
A) Safe if obfuscated
B) Extractable via decompilation — obfuscation raises the bar slightly but is not security; keep real secrets server-side
C) Encrypted by the store
D) Invisible

**59.** Secure storage for tokens and credentials:
A) Preferences
B) Keychain/Keystore-backed storage; prefer short-lived tokens with refresh and support revocation
C) A file
D) Hardcoded

**60.** Certificate pinning:
A) Is a UI feature
B) Hardens against man-in-the-middle by restricting trusted certs — but must handle cert rotation to avoid locking users out; often paired with a backup pin
C) Speeds requests
D) Is deprecated

**61.** Client-side authorization checks:
A) Are sufficient
B) Are UX only — the server must enforce authorization, because the client is fully controllable by a determined user
C) Replace server checks
D) Are unbreakable

**62.** Sensitive data in logs or crash reports:
A) Is fine
B) Leaks — scrub PII, tokens, and location before logging, since logs and crash payloads leave the device
C) Is encrypted automatically
D) Is required

**63.** Data-at-rest protection:
A) Is unnecessary
B) Matters for sensitive on-device data — use encrypted storage and platform data-protection classes, especially for regulated data
C) Is the same as HTTPS
D) Is automatic for everything

**64.** Privacy regulations (GDPR, local data-protection laws, store privacy rules):
A) Do not apply to apps
B) Do apply — minimize collection, disclose accurately, honor deletion/consent, and declare data use in store privacy labels
C) Are the legal team's sole concern
D) Are optional

**65.** Third-party SDK data collection:
A) Is inert
B) Is your responsibility to understand and disclose — analytics/ads/social SDKs may collect and transmit user data with your app's identity
C) Is sandboxed fully
D) Is safe if popular

**66.** Biometric authentication (Face/Touch/fingerprint):
A) Sends biometrics to your server
B) Is handled by the OS; the app gets a success/fail signal and can gate access — never handle raw biometric data yourself
C) Is insecure
D) Replaces server auth

**67.** Screenshot/screen-recording of sensitive screens:
A) Cannot be controlled
B) Can be flagged as secure on sensitive screens to block capture and mask the app-switcher preview
C) Is always safe
D) Is the OS's problem

**68.** Tracking transparency / consent prompts:
A) Are optional
B) Are platform requirements for certain tracking — respect the user's choice, and design so denial degrades gracefully rather than breaking the app
C) Are decorative
D) Apply to web only

---

## Section G — Testing Strategy, Accessibility, i18n (Q69–Q84)

**69.** The mobile testing pyramid:
A) All UI tests
B) Many fast unit tests (logic, ViewModels), fewer integration tests, a small set of UI/E2E tests for critical journeys — because UI tests are slow and brittle
C) Inverted
D) All manual

**70.** Screenshot / snapshot testing of UI:
A) Replaces functional tests
B) Catches unintended visual regressions across states and configs; valuable but needs disciplined baselines to avoid flakiness
C) Is impossible
D) Is deprecated

**71.** Testing across device configs:
A) One device suffices
B) Use device farms or matrices to cover OS versions, screen sizes, and densities for critical flows — fragmentation is where mobile bugs live
C) Is impossible
D) Is the store's job

**72.** Testing offline and flaky-network behavior:
A) Is unnecessary
B) Is essential — simulate no connectivity, slow connectivity, and mid-request drops, because real users hit all three
C) Is impossible
D) Is automatic

**73.** A flaky UI test:
A) Retry until green
B) Diagnose — usually async timing or shared state — because a flaky suite gets ignored and then hides real failures
C) Is acceptable
D) Cannot be fixed

**74.** Accessibility testing:
A) Automated tools catch everything
B) Requires manual testing with the screen reader, large font sizes, and high-contrast/reduced-motion settings — automation catches only part
C) Is web-only
D) Is unnecessary

**75.** Screen-reader support (VoiceOver/TalkBack):
A) Is automatic
B) Requires meaningful labels, logical focus/reading order, state announcements, and grouped elements — and testing by actually navigating with it
C) Is impossible
D) Is decorative

**76.** Respecting dynamic type / system font scaling:
A) Break layout to preserve design
B) Support it — layouts should adapt to larger text so users who need it are not excluded, and truncation/overflow handled gracefully
C) Is iOS-only
D) Is optional

**77.** Sufficient color contrast and not relying on color alone:
A) Are nice-to-haves
B) Are accessibility requirements — pair color with text/icon/shape so color-blind and low-vision users are not excluded
C) Are web-only
D) Are automatic

**78.** Internationalization (i18n):
A) Is just translating strings
B) Includes externalized strings, plurals, date/number/currency formatting, and layout that tolerates longer translations — retrofitting it later is expensive
C) Is unnecessary
D) Is the backend's job

**79.** Right-to-left (RTL) language support:
A) Just flip text
B) Requires mirrored layouts (leading/trailing rather than left/right), mirrored icons where appropriate, and testing in an RTL locale
C) Is impossible
D) Is web-only

**80.** Hardcoded strings in the UI:
A) Are fine
B) Block localization and are a maintainability problem — externalize user-facing text into resources
C) Are faster
D) Are required

**81.** Locale-specific formatting (dates, numbers, currency):
A) Format manually with string concatenation
B) Use locale-aware formatters — manual formatting breaks across regions and is a common bug for apps serving multiple markets
C) Is unnecessary
D) Is the backend's job

**82.** Testing a feature in a non-English, RTL, large-font configuration:
A) Is overkill
B) Surfaces real bugs — truncation, overflow, mirroring, and layout breaks that never appear in the default config
C) Is impossible
D) Is the QA team's only job

**83.** A regression test for a fixed device-specific crash:
A) Is paranoia
B) Locks in the fix where feasible, and at minimum documents the reproduction and config — device-specific crashes recur easily
C) Slows the fix
D) Is unnecessary

**84.** Contract expectations against the backend API:
A) Do not matter to mobile
B) Matter greatly — an unversioned breaking change can crash old app versions in the field; defensive parsing and API versioning protect users you cannot force to update
C) Are the backend's sole concern
D) Never change

---

## Section H — Judgment and Collaboration (Q85–Q100)

**85.** Reviewing a Junior 1's mobile PR:
A) Focus on style
B) Focus on crashes, lifecycle correctness, memory, threading, and accessibility — and explain the why; a review is also teaching
C) Rubber-stamp
D) Skip it

**86.** Mentoring an intern on device testing:
A) Too early for you
B) Is part of becoming a Junior 3 — teaching them to test across devices, read crash logs, and respect constraints multiplies the team
C) The lead's job only
D) A waste

**87.** A designer hands over a spec that ignores loading/error/offline states:
A) Build only the happy path
B) Raise the missing states early and collaborate — mobile lives in those states, and catching them at design time is far cheaper
C) Add them silently however you like
D) Refuse the work

**88.** A product manager wants a feature that would drain battery or bloat the app:
A) Just build it
B) Surface the cost with specifics, propose alternatives, and decide together — you own the "how" and the platform reality
C) Refuse
D) Build a worse version silently

**89.** A backend engineer proposes an API shape awkward for mobile:
A) Accept it and work around it
B) Explain the mobile need (payload size, round-trips, offline, old-version support) and collaborate on a shape that serves the end-to-end feature
C) Go around them
D) Demand your shape

**90.** Choosing native versus cross-platform for a new feature:
A) Always native
B) A trade-off of performance, platform-fidelity, team skills, and maintenance cost — decided deliberately for the context, not by ideology
C) Always cross-platform
D) By popularity

**91.** Adding a third-party SDK:
A) Is free
B) Adds app size, a security/privacy surface, and maintenance and compatibility risk — evaluate against writing the small piece yourself, and check what data it collects
C) Is always better than building
D) Is the lead's call only

**92.** Estimating a medium mobile feature:
A) Quote a single number
B) Break down the hidden parts — states, device testing, store constraints, accessibility, i18n, edge cases — and quote a range
C) Match the senior
D) Refuse

**93.** A senior pushes back on your architecture and you still disagree:
A) Cave immediately
B) Make your case with evidence; if still overruled, commit and move on — sometimes you are right and learn to argue better, sometimes wrong and learn to listen
C) Escalate
D) Refuse to merge

**94.** Saying "I do not know, let me find out":
A) Damages credibility
B) Builds it — confident guessing produces crashes; honesty is a strength juniors should adopt early
C) Is for seniors
D) Should be hidden

**95.** Shipping a risky change right before a release cutoff:
A) Is bold
B) Deserves extra caution on mobile because store review makes fixes slow — prefer to wait or gate behind a flag
C) Is normal
D) Is required

**96.** When your change crashes for real users:
A) Hide it
B) Report fast, contain (flag off / halt rollout / expedited fix), and contribute to a blameless understanding — mobile fixes are slow to reach users, so honesty and speed matter
C) Wait for review
D) Blame devices

**97.** Documentation of platform gotchas and workarounds:
A) Wastes time
B) Is high-value — mobile is full of version- and device-specific traps; writing them down saves the whole team repeat pain
C) Is the lead's job
D) Writes itself

**98.** Owning a feature end-to-end as a Junior 3:
A) Means writing all the code alone
B) Means seeing it through — design input, implementation, states, testing across devices, accessibility, release, and post-release monitoring
C) Means only the happy path
D) Means delegating

**99.** Caring about the crash-free rate and performance of the whole app:
A) Is the lead's job
B) Is a Junior 3 mindset shift — thinking beyond your own tickets to the health of the product users actually experience
C) Is premature
D) Is QA's job

**100.** The trait that most reliably unlocks the move to Senior 1 is:
A) Speed
B) Curiosity that has broadened beyond mobile — wanting to understand the API's design, the backend behind the app, how the web client solves the same problems, and why the whole system behaves as it does
C) Code volume
D) Specialization depth alone

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

*Administrator's note: This is the last specialist-only mobile exam. The next exam (Junior 3 → Senior 1) is the convergence point and tests broadening beyond mobile into backend, web, and systems thinking. A candidate who aces this but has never reasoned about API design, a database index, or how the server behind the app scales should be coached toward that breadth before sitting the convergence exam.*
