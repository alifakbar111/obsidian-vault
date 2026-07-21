# Promotion Exam: Intern → Junior Mobile Developer 1

**Track:** Mobile Developer (Specialist)
**Format:** 100 multiple-choice questions
**Time:** 120 minutes
**Passing score:** 89 / 100

**Scope.** This exam evaluates whether an intern is ready to be hired as a Junior Mobile Developer 1. The bar is "can be trusted with a small, scoped mobile task, with supervision, and will not ship something that crashes on real devices or leaks user data." The focus is on the mobile-specific foundation: programming fundamentals, how a mobile app is structured and runs, the UI and layout model, the activity/view lifecycle, basic networking, local storage, Git and tooling, and the engineering habits that determine whether a junior grows or stalls.

**A note on platform.** This track is written to be **cross-platform aware**. Questions cover concepts common to iOS (Swift/SwiftUI), Android (Kotlin/Jetpack Compose), and cross-platform frameworks (React Native, Flutter). Where a question names a platform specific, the underlying concept usually has a direct equivalent on the others. If your team is strictly single-platform, substitute the platform-specific items with the equivalent in your stack — the fundamentals do not change.

---

## Section A — Programming Fundamentals (Q1–Q15)

**1.** A variable declared immutable (`let` in Swift, `val` in Kotlin, `const` in JS):
A) Can never hold an object
B) Cannot be reassigned after initialization, though a mutable object it references may still have its contents change
C) Is always global
D) Is slower

**2.** A function should ideally:
A) Do many things
B) Do one well-defined thing, be named for what it does, and return a useful result rather than relying on hidden side effects
C) Be over 100 lines
D) Avoid parameters

**3.** Passing an object (reference type) to a function and mutating it inside:
A) Has no effect outside
B) Mutates the caller's object too, since it is passed by reference — a common source of surprising bugs
C) Copies it first always
D) Throws an error

**4.** A value type (struct in Swift, data class copy semantics, primitives) versus a reference type (class/object):
A) Are the same
B) Value types are copied on assignment; reference types share the same underlying instance — this distinction drives many mobile state bugs
C) Value types are slower
D) Reference types cannot be mutated

**5.** Optionals / nullability (`String?`, nullable types):
A) Are decorative
B) Express that a value may be absent; forcing-unwrap a null (`!`, `!!`) without checking is a leading cause of mobile crashes
C) Are the same as empty strings
D) Are only for networking

**6.** A `for` loop versus a higher-order function like `map`:
A) `map` is always faster
B) `map` transforms a collection into a new collection declaratively; a `for` loop is more flexible but more error-prone for simple transforms — prefer the clearest option
C) They are identical
D) `map` mutates the original

**7.** An off-by-one error typically comes from:
A) Using functions
B) Boundary mistakes — `<` versus `<=`, starting index, or reading past the end of a collection
C) Using immutability
D) Using optionals

**8.** A hash map / dictionary versus scanning an array for lookup by key:
A) Arrays are faster
B) A dictionary gives roughly O(1) lookup by key; scanning an array is O(n) — meaningful for any non-trivial list
C) They are equivalent
D) Dictionaries cannot hold objects

**9.** Early return to reduce nesting:
A) Is bad style
B) Often produces flatter, more readable code — handle invalid cases up front, leaving the main path unindented
C) Is slower
D) Breaks the compiler

**10.** A pure function:
A) Has no parameters
B) Returns the same output for the same inputs with no side effects — easy to test and reason about
C) Is async
D) Returns void

**11.** Strong typing in Swift/Kotlin helps mainly by:
A) Making apps faster at runtime
B) Catching classes of bugs at compile time and powering editor tooling — especially valuable given how expensive mobile crash-fix cycles are
C) Replacing testing
D) Reducing app size

**12.** `try/catch` (or Swift's `do/try/catch`, Kotlin exceptions):
A) Slows all code inside
B) Handles errors thrown in the block so they can be recovered from instead of crashing the app
C) Catches every possible error type automatically
D) Cancels the function

**13.** Enums (sealed classes / Swift enums with associated values):
A) Are just named integers
B) Model a fixed set of cases precisely, and (with associated values) carry data per case — excellent for representing UI state
C) Are deprecated
D) Cannot hold data

**14.** A function that fetches data, updates the UI, and writes to disk:
A) Is well-factored
B) Is doing too much; separating concerns makes each part testable and reusable
C) Is efficient
D) Is required on mobile

**15.** Immutability for UI state:
A) Is impossible on mobile
B) Tends to make state changes predictable and easier to debug — many modern mobile UI frameworks are built around it
C) Is slower always
D) Is for backend only

---

## Section B — Mobile App Structure and Runtime (Q16–Q30)

**16.** A mobile app runs:
A) On a server
B) On the user's device, with constrained CPU, memory, battery, storage, and an intermittent network — constraints that shape almost every mobile decision
C) In a browser only
D) With unlimited resources

**17.** The operating system can terminate a backgrounded app:
A) Never
B) At any time to reclaim resources — so apps must save important state before going to the background, not assume they will keep running
C) Only on crash
D) Only when the user asks

**18.** The main thread (UI thread):
A) Should do everything
B) Must stay responsive; blocking it with network calls, disk I/O, or heavy computation freezes the UI and can trigger an "app not responding" kill
C) Is for networking
D) Does not exist on mobile

**19.** Long-running or blocking work belongs:
A) On the main thread
B) On a background thread / coroutine / async task, with results delivered back to the main thread for UI updates
C) In the UI layer
D) Nowhere

**20.** Updating UI from a background thread:
A) Is fine
B) Is a common crash or undefined-behavior bug — UI updates must happen on the main thread
C) Is faster
D) Is required

**21.** App permissions (camera, location, contacts, notifications):
A) Are granted automatically
B) Must be requested at the appropriate time, with the app degrading gracefully if denied — and only requested when genuinely needed
C) Are all granted at install
D) Never expire

**22.** Requesting a sensitive permission on first launch before context:
A) Is best practice
B) Tends to get denied; asking in context (when the user taps the feature that needs it) with a rationale converts far better
C) Is required
D) Is unavoidable

**23.** App state restoration after the OS kills a backgrounded app:
A) Is automatic and complete
B) Must be designed — persist enough state that the user returns to a sensible place, not a blank screen or lost work
C) Is impossible
D) Is the OS's job entirely

**24.** Deep links / universal links:
A) Are ads
B) Let a URL open a specific screen inside the app — requiring routing that can reconstruct the target screen and its back stack
C) Are for web only
D) Are deprecated

**25.** A "cold start" versus "warm start":
A) Are the same
B) Cold start launches the app process from scratch (slowest); warm start resumes an existing process — cold-start time is a key user-perceived performance metric
C) Cold start is faster
D) Only matters on iOS

**26.** Battery and network are related because:
A) They are not
B) Radios (cellular, GPS, Wi-Fi) are among the biggest battery consumers — batching network requests and minimizing wake-ups meaningfully extends battery life
C) Battery is unlimited
D) Network is free

**27.** App size (download and install footprint):
A) Does not matter
B) Affects install conversion and update adoption, especially on cheaper devices and slower networks common in many markets — worth managing deliberately
C) Is fixed
D) Only matters on Android

**28.** Device fragmentation (many screen sizes, OS versions, hardware capabilities):
A) Is negligible
B) Is a core mobile reality — apps must adapt layouts, handle a range of OS versions, and degrade gracefully on weaker hardware
C) Only affects Android
D) Is the OS's problem

**29.** A memory warning / low-memory condition:
A) Can be ignored
B) Signals the app to release non-essential memory (caches, offscreen resources) or risk being terminated
C) Never happens
D) Is a crash

**30.** The app lifecycle (foreground, background, suspended, terminated):
A) Is irrelevant to developers
B) Drives when to save state, pause work, release resources, and refresh data — mishandling it produces many of the most common mobile bugs
C) Is only about animations
D) Is identical across all apps

---

## Section C — UI and Layout (Q31–Q45)

**31.** A declarative UI framework (SwiftUI, Jetpack Compose, React Native, Flutter):
A) Describes UI step by step imperatively
B) Describes what the UI should look like for a given state, and the framework updates the screen when state changes — reducing a whole class of manual-update bugs
C) Is slower always
D) Is for web only

**32.** In a declarative UI, the screen updates when:
A) You manually call redraw
B) The state it depends on changes — you change the state, the framework re-renders
C) The user scrolls
D) Never automatically

**33.** Responsive layout on mobile means:
A) Fast animations
B) Adapting to different screen sizes, orientations, and densities rather than hardcoding pixel positions for one device
C) Quick network
D) One fixed layout

**34.** Density-independent units (dp on Android, points on iOS):
A) Are raw pixels
B) Abstract away physical pixel density so a "44pt" tap target is a similar physical size across devices — hardcoding raw pixels breaks across screens
C) Are for text only
D) Are deprecated

**35.** A minimum tap target size (~44pt iOS / ~48dp Android):
A) Is arbitrary
B) Is a usability and accessibility guideline — targets smaller than this are hard to tap reliably, especially for users with motor difficulties
C) Is for tablets only
D) Does not matter

**36.** A list of thousands of items should:
A) Render all items at once
B) Use a recycling/virtualized list (RecyclerView, LazyColumn, List, FlatList) that only renders visible items — rendering everything exhausts memory and janks
C) Paginate to two pages
D) Load into a scroll view directly

**37.** Layout that overflows or clips on smaller screens:
A) Is acceptable
B) Is a fragmentation bug — test across screen sizes and use flexible layouts, scrolling, or truncation deliberately
C) Only affects tablets
D) Is the OS's fault

**38.** Handling the software keyboard appearing:
A) Ignore it
B) Adjust the layout so the focused input is not hidden behind the keyboard — a common polish gap that frustrates users
C) Disable the keyboard
D) Is automatic everywhere

**39.** Safe areas / notches / system bars:
A) Can be ignored
B) Must be respected so content is not hidden behind notches, status bars, or home indicators — layouts should inset from safe areas
C) Only exist on iOS
D) Are decorative

**40.** Dark mode support:
A) Is optional and rare
B) Is an expected feature; using semantic colors / theme tokens rather than hardcoded colors makes it maintainable
C) Requires a separate app
D) Is Android-only

**41.** Loading, empty, error, and content states for a screen:
A) Only content matters
B) All four should be designed — a screen that only handles the happy path looks broken during loading, on failure, or with no data
C) Are backend concerns
D) Are automatic

**42.** Animations on mobile:
A) Should be everywhere
B) Should be purposeful and smooth (targeting the device's refresh rate); janky or gratuitous animation hurts perceived quality more than no animation
C) Are free
D) Should never be used

**43.** Images displayed in a list:
A) Should be full resolution
B) Should be appropriately sized/downsampled and loaded asynchronously with caching — full-size images in a list are a top cause of memory spikes and jank
C) Should block scrolling
D) Should be uncached

**44.** Accessibility on mobile (screen readers: VoiceOver, TalkBack):
A) Is niche
B) Requires labeled controls, logical focus order, sufficient contrast, and respecting system font-size settings — many users depend on it, and stores increasingly surface it
C) Is automatic
D) Is web-only

**45.** Respecting the user's system font-size setting:
A) Is unnecessary
B) Matters for accessibility — hardcoded font sizes that ignore the user's preference exclude users who need larger text
C) Breaks layout always
D) Is iOS-only

---

## Section D — Lifecycle and State (Q46–Q55)

**46.** A screen (Activity/Fragment on Android, ViewController on iOS, screen component in RN/Flutter):
A) Lives forever
B) Has a lifecycle — created, appeared, disappeared, destroyed — and code must hook the right stage for setup and teardown
C) Only has one state
D) Is stateless

**47.** Starting a network request when a screen appears and not cancelling it when the screen disappears:
A) Is fine
B) Can update or retain a dead screen, wasting resources or crashing — cancel in-flight work on teardown
C) Is faster
D) Is required

**48.** Configuration changes (rotation, theme change, language change on Android):
A) Never affect the app
B) Can recreate the screen; state must be preserved (via state holders / ViewModels / saved-state) or the user loses their place
C) Are crashes
D) Only affect tablets

**49.** A ViewModel / state holder / store:
A) Is a UI widget
B) Holds screen state and logic separately from the view, surviving certain lifecycle events and making the UI testable
C) Is the database
D) Is deprecated

**50.** Retaining a reference to a destroyed screen (a leaked context/controller):
A) Is harmless
B) Is a memory leak — a common mobile bug where closures, listeners, or singletons keep dead screens alive, growing memory over time
C) Speeds the app
D) Is impossible

**51.** Unregistering listeners / observers / notification subscriptions:
A) Is optional
B) Is essential in teardown — forgotten subscriptions leak memory and can fire callbacks on dead objects
C) Is automatic always
D) Is for networking

**52.** Saving user input before the app goes to the background:
A) Is unnecessary
B) Protects against the OS terminating the app — unsaved work should be persisted so the user does not lose it
C) Is impossible
D) Is the OS's job

**53.** A background task that must finish (upload, save):
A) Will always complete
B) Needs the platform's background-execution mechanism; naive work started as the app backgrounds may be suspended mid-flight
C) Runs forever
D) Is not allowed

**54.** Observing data changes (reactive streams, Flow, Combine, observables):
A) Is overkill
B) Lets the UI automatically reflect data changes without manual refresh calls — a core pattern in modern mobile apps
C) Is web-only
D) Is deprecated

**55.** State that should survive app restart (auth token, user preferences):
A) Lives in memory
B) Must be persisted to disk (secure storage for secrets) — in-memory state is gone after termination
C) Lives on the server only
D) Cannot be persisted

---

## Section E — Networking and Data (Q56–Q68)

**56.** A mobile app calling a REST API:
A) Talks directly to the database
B) Sends HTTP requests to a backend and handles the response — over a network that may be slow, flaky, or absent
C) Runs the backend locally
D) Needs no error handling

**57.** Every network call on mobile should assume:
A) The network is reliable
B) It may fail, time out, or return an error — handle loading, success, and failure states, with timeouts and sensible retries
C) It always succeeds
D) The user is on Wi-Fi

**58.** Parsing a JSON response:
A) Should assume the shape is always correct
B) Should decode into typed models and handle missing/unexpected fields gracefully — a malformed response should not crash the app
C) Should use string manipulation
D) Is automatic

**59.** A request timeout:
A) Should be very long or absent
B) Should be set to a reasonable value so a stuck request does not hang the UI or a loading spinner forever
C) Is unnecessary
D) Is the server's job

**60.** Offline handling:
A) Show an error and give up
B) Depends on the app — at minimum detect connectivity and inform the user; better apps cache data and queue actions for when connectivity returns
C) Is impossible
D) Is automatic

**61.** Caching API responses locally:
A) Is always wrong
B) Improves speed and offline resilience, but needs an invalidation strategy so users are not stuck with stale data
C) Is the server's job
D) Is unsafe

**62.** Local persistence options (SQLite/Room/Core Data, key-value stores, files):
A) Are interchangeable
B) Have different fits — structured/relational data suits a database; small settings suit key-value; large blobs suit files; secrets need secure storage
C) All store secrets safely
D) Are deprecated

**63.** Storing an auth token in plain shared preferences / UserDefaults:
A) Is fine
B) Is insecure for secrets — tokens and credentials belong in the platform's secure storage (Keychain / Keystore-backed storage)
C) Is encrypted automatically
D) Is required

**64.** Pagination for a long list from an API:
A) Fetch everything at once
B) Fetch in pages as the user scrolls, so memory and network stay bounded and the first screen loads fast
C) Is impossible on mobile
D) Is the backend's decision only

**65.** Sending the same non-idempotent request twice due to a retry or double-tap:
A) Is harmless
B) Can duplicate actions (double orders, double messages) — guard with debouncing, disabling the control while in flight, or idempotency support
C) Is impossible
D) Is the server's problem only

**66.** HTTPS for all network traffic:
A) Is optional for internal APIs
B) Is required — mobile networks are easily intercepted; plaintext traffic exposes user data and is blocked by default on modern platforms
C) Slows the app too much
D) Is for login only

**67.** Handling a large file upload/download:
A) Load it all into memory
B) Stream it and show progress, so memory stays bounded and the user gets feedback — and consider allowing it to continue in the background
C) Block the UI
D) Is not possible

**68.** A backend that changes its response shape without warning:
A) Should crash the app
B) Is a reason to decode defensively and version the API — a resilient client tolerates additive changes and fails gracefully on breaking ones
C) Is impossible
D) Is the mobile dev's fault

---

## Section F — Tooling, Git, and Build (Q69–Q80)

**69.** `git status`, `git add`, `git commit`:
A) Are for backend only
B) Show working state, stage changes, and record them — core version-control operations every developer uses daily
C) Deploy the app
D) Are deprecated

**70.** A `.gitignore` in a mobile project:
A) Is unnecessary
B) Excludes build outputs, local config, secrets, and large generated folders (build/, Pods/, .gradle/, DerivedData) from version control
C) Encrypts files
D) Deletes files

**71.** A good commit message:
A) Says "fix"
B) Summarizes the change clearly and, when useful, explains the why
C) Repeats the diff
D) Is the file name

**72.** A pull request:
A) Slows things down
B) Provides a place for code review, automated checks, and discussion before merging into a shared branch
C) Deploys to the store
D) Replaces testing

**73.** The IDE (Xcode, Android Studio) and its emulator/simulator:
A) Replace real-device testing
B) Are essential for development, but the simulator does not reproduce all real-device behavior — real-device testing is still necessary before shipping
C) Are optional
D) Run the backend

**74.** A debug build versus a release build:
A) Are identical
B) Differ in optimization, logging, signing, and configuration; some bugs (and performance characteristics) only appear in release builds — test them
C) Debug is for the store
D) Release is for development

**75.** Dependency management (SPM/CocoaPods, Gradle, npm/pub):
A) Is optional
B) Pulls in third-party libraries; each dependency adds app size, security surface, and maintenance cost, so add deliberately
C) Is for backend only
D) Never needs updating

**76.** A crash reporter (Crashlytics, Sentry, platform tools):
A) Is unnecessary
B) Captures crashes from real users with stack traces and device context — essential because you cannot reproduce every device and condition locally
C) Replaces testing
D) Is for backend

**77.** App signing / certificates / provisioning:
A) Are irrelevant to developers
B) Are required to build, distribute, and publish apps; mismanaging signing keys can lock a team out of updating their own app
C) Are automatic
D) Are for iOS only

**78.** `console.log` / `print` / `Log.d` debugging statements:
A) Should ship in release
B) Are useful in development but should be stripped or gated in release builds — verbose logging hurts performance and can leak sensitive data
C) Cannot be disabled
D) Are the only debugging tool

**79.** Reading a crash stack trace:
A) Is for seniors only
B) Is a core skill — the trace usually points to the line and condition; symbolication maps release crashes back to source
C) Is impossible
D) Wastes time

**80.** Environment/config differences (dev vs staging vs prod API URLs, keys):
A) Should be hardcoded
B) Should be managed through build configurations/schemes/flavors so the same code targets different environments without editing source each time
C) Live in the UI
D) Are the same everywhere

---

## Section G — Security and Privacy Basics (Q81–Q90)

**81.** Secrets embedded in the app binary:
A) Are safe if obfuscated
B) Can be extracted — attackers can decompile apps, so high-value secrets must live server-side, not in the client
C) Are encrypted by the store
D) Are invisible

**82.** Storing passwords or tokens:
A) Plain preferences
B) Platform secure storage (Keychain / Keystore) — never plaintext, and prefer short-lived tokens with refresh over long-lived credentials
C) In a file
D) In the code

**83.** Requesting only the permissions you need:
A) Is cautious to a fault
B) Is the principle of least privilege — over-requesting erodes trust, gets denied, and increases risk and store scrutiny
C) Reduces functionality
D) Is optional

**84.** Collecting user data:
A) Collect everything possible
B) Collect only what the feature needs, disclose it, and comply with platform privacy rules and applicable law — over-collection is a liability
C) Is unregulated
D) Is the backend's concern only

**85.** Logging sensitive data (tokens, PII, location):
A) Is fine in release
B) Is a recurring source of leaks; scrub or omit it, especially since logs can be captured on-device or shipped to crash reporters
C) Is encrypted automatically
D) Is required for debugging

**86.** Certificate pinning:
A) Is a UI feature
B) Restricts which server certificates the app trusts, hardening against man-in-the-middle attacks — powerful but must be managed carefully to avoid locking out legitimate cert rotations
C) Speeds the network
D) Is deprecated

**87.** Clipboard, screenshots, and backgrounded-app previews:
A) Never leak data
B) Can expose sensitive content — sensitive screens may need to mask the app switcher preview and be careful with clipboard use
C) Are always safe
D) Are the OS's problem

**88.** Third-party SDKs (analytics, ads, social):
A) Are inert
B) Run with your app's privileges and can collect data or introduce vulnerabilities — vet them, understand what they collect, and disclose it
C) Are sandboxed fully
D) Are safe if popular

**89.** Trusting data from the device (jailbroken/rooted detection, client-side checks):
A) Is sufficient security
B) Is defense in depth at best — the client is fundamentally untrusted; real authorization must be enforced server-side
C) Replaces server checks
D) Is unbreakable

**90.** A user's location data:
A) Is ordinary data
B) Is especially sensitive — request the coarsest precision that works, only while needed, and be transparent about use
C) Can be collected freely
D) Is not regulated

---

## Section H — Engineering Habits (Q91–Q100)

**91.** Time-boxing when stuck (e.g., 30–60 minutes before asking):
A) Is weakness
B) Is a healthy default — try seriously, then ask with what you tried and observed
C) Must be four hours
D) Is for seniors

**92.** A good bug report for a mobile issue includes:
A) "It crashes"
B) Device model, OS version, app version, steps to reproduce, and the crash log or screenshot — mobile bugs are often device- or version-specific
C) A guess at the cause
D) Only a screenshot

**93.** Copy-pasting code from Stack Overflow or AI without understanding it:
A) Is fine if it works
B) Is risky — you cannot debug what you do not understand, and you may introduce crashes or security issues
C) Is required for speed
D) Is encouraged

**94.** Testing only on your own high-end device:
A) Is sufficient
B) Misses the majority of real-world conditions — test on lower-end devices, older OS versions, small screens, and poor networks
C) Is best practice
D) Covers everything

**95.** Reviewing a teammate's code as a junior:
A) Is presumptuous
B) Is normal — ask questions, flag anything that looks off, and learn from what others do
C) Is the lead's job only
D) Should be typos only

**96.** Saying "I do not know, let me find out":
A) Damages credibility
B) Builds it — confident guessing produces buggy apps; honesty about uncertainty is a strength
C) Is for seniors
D) Should be avoided

**97.** Estimating a task as a junior:
A) Promise the smallest number
B) Think through what is involved, give a range, flag uncertainty, and update as you learn
C) Refuse
D) Match the senior

**98.** Shipping untested code right before a release freeze:
A) Is bold
B) Is risky — mobile releases go through store review and cannot be hotfixed instantly like a website; last-minute changes deserve extra caution
C) Is normal
D) Is required

**99.** When you cause a bug that reached users:
A) Hide it
B) Report it quickly, help contain and fix it, and contribute to a blameless understanding of how it happened — mobile bugs can be slow to fix due to store review, so speed of honesty matters
C) Wait for a review
D) Blame the device

**100.** The most reliable predictor of growth for a junior mobile developer is:
A) Speed
B) Curiosity paired with respect for the platform's constraints — caring about crashes, performance, battery, and the real range of user devices, and treating each bug as a chance to understand the system
C) Confidence
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
