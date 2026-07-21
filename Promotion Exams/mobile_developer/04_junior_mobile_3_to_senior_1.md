# Promotion Exam: Junior Mobile Developer 3 → Senior Engineer 1

**Track:** Convergence — Mobile Specialist → Generalist Software Engineer
**Format:** 100 multiple-choice questions
**Time:** 165 minutes
**Passing score:** 89 / 100

**Scope and purpose.** This is the convergence exam for the mobile track, parallel in structure to the frontend and backend convergence exams. A Junior 3 mobile developer has spent two to four years deepening in their platform. From Senior 1 onward, the role broadens: a Senior at this company operates across the stack, makes decisions that touch the backend and web as well as the app, reviews code adjacent to their specialty, mentors juniors across disciplines, and understands end-to-end what happens between a user's tap and the response that returns. This exam tests whether the candidate has done the broadening work.

The structure reflects this. Section A confirms the candidate still owns the mobile depth they should — Senior 1 is not where a former mobile specialist forgets how process death or the frame budget works. The remaining sections test the breadth the senior role requires: backend and API literacy, database fundamentals, web/frontend literacy, systems and architecture, security across the stack, deployment and operations, and senior judgment.

**A note to the candidate.** If you answer Section A comfortably but struggle with the backend, database, or web sections, that is information, not failure. A mobile engineer who has never written a SQL query, never reasoned about an API's server-side cost, or never opened a web app's DevTools is not yet ready for Senior 1. Six months of deliberate broadening beats passing by luck and then struggling in the role.

---

## Section A — Mobile Depth a Senior Must Still Own (Q1–Q15)

**1.** A crash reported only on one OS version. The senior mobile engineer first:
A) Rewrites the screen
B) Reproduces with that OS/device config (real device or farm) and reads the stack trace before changing anything
C) Adds a try/catch around everything
D) Blames the OS

**2.** An app that janks while scrolling a feed:
A) Needs a faster phone
B) Gets profiled on the frame timeline — the cause is usually main-thread work, synchronous image loading, or un-recycled rows, not the device
C) Needs less content
D) Needs a rewrite

**3.** Steadily growing memory over a session:
A) Is normal
B) Signals a leak — retained dead screens, unbounded caches, or unremoved observers; profile and cut the retained references
C) Is a feature
D) Is a network issue

**4.** A senior reviewing a junior's mobile PR looks first at:
A) Naming
B) Crash safety, lifecycle correctness, threading, memory, and accessibility — the things that hurt real users on real devices
C) Formatting
D) Line count

**5.** A critical bug is live and store review will take two days. The senior's first lever is:
A) Wait for review
B) A remote feature flag or halted rollout to stop the bleeding immediately, then an expedited fix — because you cannot instantly un-ship a mobile build
C) Email users
D) Nothing

**6.** Force-unwrapping/non-null assertions scattered through a codebase:
A) Are fine
B) Are a crash surface a senior should push to reduce — safe unwrapping, defaults, and early returns prevent a whole class of production crashes
C) Are required
D) Speed the app

**7.** An old app version in the field hitting a changed API:
A) Is the backend's fault
B) Is a compatibility reality — defensive parsing, API versioning, and (for security) forced updates protect users who have not updated
C) Never happens
D) Is impossible to handle

**8.** A background sync users depend on runs unreliably:
A) The scheduler is broken
B) Is expected — OS battery optimization throttles background work; critical, time-sensitive actions should be foreground or server-driven
C) Should run every minute
D) Is a crash

**9.** Process-death restoration:
A) Is automatic
B) Must be designed and tested by forcing process death — a senior ensures the app returns the user to a sensible place, not the root screen with lost work
C) Never matters
D) Is a config change

**10.** A retain cycle from a closure capturing self:
A) Cannot happen
B) Is a classic leak — a senior recognizes it in review and applies weak capture where the closure outlives or is owned by the captured object
C) Speeds the app
D) Is a network bug

**11.** Crash-free rate drops after a release:
A) Wait and see
B) Is a release-health signal — halt rollout, flag off the suspect feature, diagnose from reports, ship an expedited fix
C) Ignore unless widespread
D) Blame devices

**12.** A senior deciding native versus cross-platform for a feature weighs:
A) Fashion
B) Performance needs, platform fidelity, team skills, maintenance cost, and time-to-market — a deliberate trade-off, not an ideology
C) What competitors use
D) Team excitement only

**13.** Accessibility and internationalization as a senior responsibility:
A) Belong to specialists
B) Belong to the whole team, and the senior sets the bar — labeled controls, dynamic type, contrast, externalized strings, RTL, and locale formatting are quality, not extras
C) Are optional
D) Are the backend's job

**14.** A third-party SDK request in a PR:
A) Approve — it saves time
B) Weigh app-size, security/privacy surface, data collection, maintenance, and compatibility cost against writing the piece directly
C) Reject on principle
D) Defer

**15.** A senior mobile engineer's deepest responsibility on mobile is:
A) Writing the most code
B) The quality of the on-device experience — crash-free rate, performance, accessibility, and correctness across the real range of user devices — across all the team's work
C) The CI pipeline
D) The design system

---

## Section B — Backend and API Literacy (Q16–Q30)

**16.** When the app calls an API, before the response returns:
A) The app runs the backend
B) The request travels over the network to a server (often via CDN/load balancer), which processes it (often touching a database or cache) and returns a response — many things between tap and result can be slow or fail
C) The app queries the database directly
D) The CDN executes business logic

**17.** HTTP methods carry intent:
A) Any method does anything
B) GET reads (safe, idempotent); POST creates; PUT/PATCH update; DELETE removes — using GET for a mutating action breaks caching and conventions
C) Only POST is needed
D) Methods are decorative

**18.** Idempotency (GET/PUT/DELETE):
A) Is a mobile-only concern
B) Means repeating a request has the same effect as doing it once — important precisely because mobile networks are flaky and clients retry
C) Is impossible
D) Applies only to GET

**19.** A 401 versus 403:
A) Are the same
B) 401 means not authenticated; 403 means authenticated but not permitted — the app should respond differently (refresh/login vs. show forbidden)
C) Both mean logged out
D) Are server errors

**20.** A 429 response:
A) Means server crash
B) Means rate-limited — the client should back off (honoring Retry-After), not hammer the endpoint
C) Should be retried immediately
D) Is a client bug

**21.** A 5xx response:
A) Is the client's fault
B) Is a server-side failure; safe to retry transient cases with backoff, but be careful with non-idempotent writes
C) Means reload
D) Means the app is broken

**22.** REST resource orientation:
A) Is just JSON over HTTP
B) Organizes endpoints around resources with standard method semantics — most "REST" APIs approximate this; understanding it helps a senior collaborate on API design
C) Is RPC
D) Is deprecated

**23.** GraphQL versus REST from the client's view:
A) GraphQL is always better
B) GraphQL lets the client request exactly the fields it needs (reducing over-fetching, valuable on mobile bandwidth) at the cost of caching and server-tuning complexity
C) REST is dying
D) They are identical

**24.** An endpoint returning 50 fields when the app needs 5:
A) Is fine
B) Wastes mobile bandwidth and battery — a senior raises it and collaborates on a tighter endpoint or field selection
C) Is required by REST
D) Helps caching

**25.** Pagination from the client side:
A) Fetch everything
B) Fetch pages on demand; the API contract (cursor or offset) should make the next-page mechanism explicit, and the client caches pages
C) Is impossible
D) Is the backend's decision alone

**26.** When the app asks the backend to change a response shape:
A) Demand it
B) Frame it as collaboration — explain the mobile need (payload, round-trips, old-version support), understand backend constraints, and agree a shape that serves the whole feature
C) Go around the backend
D) Work around it silently forever

**27.** A webhook or server push the backend uses:
A) Is irrelevant to mobile
B) Is worth a senior understanding — how server events reach the app (push, poll, socket) shapes real-time features and their reliability
C) Is the same as a REST call
D) Is web-only

**28.** Why a "small" API change can break the app in the field:
A) It cannot
B) Because users run old app versions for a long time — a breaking change without versioning crashes clients you cannot force to update
C) Because of caching only
D) Because of the CDN

**29.** A senior mobile engineer who cannot read basic backend code:
A) Is fine — separate lane
B) Is limited in debugging end-to-end issues, designing features, and influencing API decisions — broadening here is essential at Senior 1
C) Is the norm
D) Should specialize harder

**30.** Server-side authorization versus the app hiding a button:
A) Are equivalent
B) The app hiding UI is UX only; the server must enforce authorization, because the app is fully controllable by a determined user
C) The app check is enough
D) Is the backend's problem alone

---

## Section C — Databases and Data (Q31–Q40)

**31.** A relational database stores data as:
A) Files
B) Tables of rows and columns with relationships via keys, queried in SQL — the app's data usually lives here on the server, distinct from the on-device store
C) JSON only
D) Key-value only

**32.** A primary key and a foreign key:
A) Are the same
B) A primary key uniquely identifies a row; a foreign key references another table's primary key to express a relationship
C) Are decorative
D) Are indexes

**33.** An index:
A) Stores data twice for no reason
B) Speeds lookups by a column without scanning the whole table, at the cost of slower writes and disk — missing indexes are a common cause of slow endpoints the app then experiences as latency
C) Encrypts a column
D) Is the same as a primary key

**34.** The N+1 query problem:
A) Is an app bug
B) Is a backend performance anti-pattern — loading N items then one query each for related data; the app feels it as a slow list endpoint
C) Is a SQL syntax error
D) Is unrelated to mobile

**35.** A basic SELECT with a WHERE and a JOIN:
A) Is beyond a mobile engineer's need
B) Is reasonable literacy for a Senior 1 — enough to read a schema, reason about why an endpoint is slow, and discuss data shape with backend engineers
C) Is impossible without a DBA
D) Is the same as NoSQL

**36.** A transaction:
A) Is for money only
B) Groups operations so they all succeed or all fail — relevant when the app triggers multi-step server changes that must stay consistent
C) Speeds reads
D) Replaces backups

**37.** The on-device database versus the server database:
A) Are the same
B) Serve different roles — the device store is a local cache/offline copy that syncs; the server is the system of record; conflating them causes sync and consistency bugs
C) The device is authoritative
D) The server is optional

**38.** Eventual consistency (e.g., reading a replica or syncing offline changes):
A) Means errors
B) Means data converges after propagation, so a read may briefly be stale — the app's UX should tolerate this where it occurs
C) Is forbidden
D) Is the same as a transaction

**39.** A NoSQL/document store versus relational:
A) One is strictly better
B) Different trade-offs — flexible schema and scale versus joins and strong constraints; a senior should know the difference exists and roughly when each fits
C) NoSQL has no schema
D) Relational is dying

**40.** Sync conflict resolution (offline edits vs. server state):
A) Never happens
B) Requires a deliberate strategy (last-write-wins, merge, server authority) and idempotent operations — one of the harder problems the app and backend must solve together
C) Is automatic
D) Is the backend's sole concern

---

## Section D — Web and Frontend Literacy (Q41–Q52)

**41.** A web frontend and a mobile app solving the same product:
A) Share nothing
B) Share the same backend and often the same problems (state, caching, auth, offline) solved with different tools — a senior can reason across both
C) Are unrelated
D) Cannot share a backend

**42.** When a browser loads a web app, before it renders:
A) It runs server code
B) DNS → TCP/TLS → HTTP request → HTML response, then it parses HTML and fetches CSS/JS/images — a pipeline analogous to app cold-start, worth a senior understanding
C) It queries the database
D) The CDN renders it

**43.** A single-page application (SPA):
A) Has one screen
B) Loads a shell plus JavaScript that handles routing and rendering client-side — conceptually similar to an app's in-process navigation, with its own trade-offs (SEO, initial load)
C) Is a static site
D) Is deprecated

**44.** Server-side rendering (SSR):
A) Is irrelevant to mobile devs
B) Serves HTML from the server so content appears before JS runs — improving perceived speed and SEO; a useful concept when the same product has a web surface
C) Is the same as an API
D) Is a CDN

**45.** A "re-render" in a declarative web framework:
A) Always redraws everything
B) Recomputes the UI and applies minimal DOM changes — the same state-drives-UI model mobile declarative frameworks use, so the mental model transfers
C) Means a reload
D) Is a network call

**46.** Cumulative Layout Shift on the web:
A) Is meaningless
B) Measures unexpected content jumps during load — the web analogue of a janky, shifting mobile layout; both are quality signals
C) Is desktop-only
D) Is automatic

**47.** CORS errors:
A) Come from the app
B) Come from the browser enforcing the server's cross-origin policy; the fix is on the server — a senior fielding a web teammate's question should recognize this
C) Are a CDN bug
D) Are HTTPS failures

**48.** A web bundle being large:
A) Is a mobile concept
B) Is the web analogue of app size — too much JavaScript slows load, especially on weak devices and networks; the same "ship less, split, lazy-load" principles apply
C) Is irrelevant
D) Is fixed

**49.** Browser DevTools (Network, Console, Performance):
A) Are useless to a mobile dev
B) Are worth basic familiarity — they debug the web surface of the same product and reinforce cross-cutting performance and networking intuition
C) Run server code
D) Are the same as Xcode

**50.** Shared concerns between web and mobile clients include:
A) None
B) Auth token handling, caching and invalidation, offline/error states, API versioning, and accessibility — a senior sees the common patterns
C) Only styling
D) Only the backend

**51.** A design system used across web and mobile:
A) Cannot exist
B) Can share tokens and component semantics so the product feels consistent — a senior contributes to and consumes it thoughtfully
C) Is web-only
D) Is decorative

**52.** A senior mobile engineer who has never seen the product's web app:
A) Is fine
B) Is missing context that would sharpen their end-to-end judgment — even light familiarity helps them collaborate and reason about the whole system
C) Is the norm
D) Should specialize harder

---

## Section E — Systems and Architecture (Q53–Q65)

**53.** A typical system has caches at several layers:
A) One
B) Browser/app cache, CDN, reverse proxy, application cache, database cache — each with different invalidation trade-offs; the app's own cache is one link in this chain
C) Only the CDN
D) Only on-device

**54.** A CDN:
A) Hosts the database
B) Caches content at edge locations near users, reducing latency and origin load — relevant to how fast the app's assets and responses arrive, especially across regions
C) Runs the app
D) Is a load balancer only

**55.** A load balancer:
A) Speeds the database
B) Distributes traffic across servers and routes around failed instances, enabling horizontal scaling behind the API the app calls
C) Is a CDN
D) Is on-device

**56.** Horizontal versus vertical scaling:
A) Are the same
B) Horizontal adds instances (needs stateless servers); vertical adds bigger machines — horizontal is generally more resilient at scale
C) Vertical scales further
D) Is a client concept

**57.** Statelessness in the server:
A) Means no data
B) Means no request depends on one server's memory, so any instance can serve any request — the backend analogue of designing the app not to depend on volatile assumptions
C) Means no sessions
D) Means no auth

**58.** A message queue between services:
A) Replaces HTTP
B) Decouples producers and consumers, absorbs spikes, and enables retries — often what powers asynchronous, eventually-consistent features the app observes
C) Is for logs
D) Is on-device

**59.** Eventual consistency at the system level:
A) Means bugs
B) Is a common trade-off — the app may briefly see stale data after a write propagates; design the UX to tolerate it where it occurs
C) Is forbidden
D) Is a transaction

**60.** Blast radius of a change:
A) Its file size
B) How much of the system or how many users are affected if it goes wrong — a senior weighs it when deciding what to ship and how, on both app and server
C) Lines changed
D) Time to build

**61.** A feature flag at the system level:
A) Is mobile-only
B) Decouples deploy from release across the stack — the same principle that lets a mobile team kill a broken feature also lets backend teams roll out gradually
C) Replaces deploys
D) Is configuration only

**62.** Microservices versus monolith:
A) Microservices always win
B) A trade-off — independent deployability for large teams versus operational complexity; a senior should understand the shape of the backend their app depends on
C) Are the same
D) Monoliths are dead

**63.** A synchronous chain of service calls behind one API request:
A) Is robust
B) Multiplies failure probability and latency — a senior recognizes that a slow app request may be a deep server-side chain, not a client bug
C) Cannot fail
D) Is faster than async

**64.** Reading an architecture diagram of the backend the app depends on:
A) Is architect-only
B) Is part of senior generalist thinking — knowing where state lives, where bottlenecks are, and what fails helps diagnose the app's real-world behavior
C) Is pointless
D) Is the manager's job

**65.** A "thin client, smart server" versus "smart client" split:
A) Is fixed
B) Is a real architecture decision — how much logic lives in the app versus the server affects offline behavior, old-version compatibility, and update agility; a senior reasons about it
C) Is always smart-client
D) Is always thin-client

---

## Section F — Security Across the Stack (Q66–Q78)

**66.** Secrets in a mobile binary:
A) Safe if obfuscated
B) Extractable — high-value secrets must live server-side; this is a specific case of the general rule that the client is untrusted
C) Encrypted by the store
D) Invisible

**67.** Client-side checks (jailbreak detection, hidden UI, validation):
A) Are sufficient security
B) Are defense in depth at best — real enforcement is server-side, on both web and mobile, because any client can be manipulated
C) Replace server checks
D) Are unbreakable

**68.** Authentication versus authorization:
A) Are the same
B) Authentication verifies identity (once per session); authorization checks permission (on every protected operation) — the second is where most serious bugs live, across all clients
C) Authentication is harder
D) Authorization is for admins

**69.** Insecure direct object reference (IDOR):
A) Is a mobile-only bug
B) Is a server bug where an endpoint returns an object by ID without checking the caller may access it — the app requesting `/orders/123` does not make it safe; the server must verify ownership
C) Is an OAuth concept
D) Is not real

**70.** OAuth 2.0 with PKCE:
A) Is for servers
B) Is the standard flow for public clients like mobile apps — protecting the auth code exchange so an intercepted code cannot be redeemed by an attacker
C) Is deprecated
D) Is the same as password login

**71.** Token storage and lifetime:
A) Long-lived tokens in plaintext
B) Short-lived access tokens with refresh, stored in secure storage, with server-side revocation — limiting damage if a token leaks
C) Hardcoded
D) In logs

**72.** HTTPS everywhere:
A) Optional internally
B) Required — mobile and web traffic are easily intercepted; plaintext exposes user data and is blocked by default on modern platforms
C) For login only
D) Slows too much

**73.** XSS (cross-site scripting):
A) Affects mobile the same as web
B) Is primarily a web vulnerability (untrusted input executing in a page); a senior working across surfaces should understand it, and that webviews inside apps inherit web risks
C) Does not exist
D) Is a network attack

**74.** A webview inside a mobile app:
A) Is fully sandboxed and safe
B) Inherits web security concerns (XSS, insecure content, JS bridges) and must be configured carefully — a bridge exposing native capability to web content is a serious attack surface
C) Cannot run JavaScript
D) Is deprecated

**75.** Logging sensitive data (tokens, PII, location) anywhere in the stack:
A) Is fine internally
B) Is a recurring breach source — scrub before logging on device, in transit, and on the server; logs and crash reports leave the device
C) Is encrypted automatically
D) Is required

**76.** A leaked secret (API key, signing key, token):
A) Fixed by deleting the commit
B) Must be rotated immediately and treated as compromised — history scrubbing is cleanup, not remediation
C) Fine if private
D) Impossible with .env

**77.** Third-party SDKs and dependencies:
A) Are inert
B) Run with your privileges and can collect data or add vulnerabilities on both app and server — audit, lock, monitor, disclose
C) Are sandboxed fully
D) Are safe if popular

**78.** A senior's security responsibility across the stack:
A) Ends at secure storage
B) Includes understanding the threat model of each feature end-to-end, escalating flows they cannot verify, and not undermining protections the rest of the stack provides
C) Is the security team's alone
D) Is to install scanners

---

## Section G — Deployment, Operations, and Judgment (Q79–Q100)

**79.** Continuous Integration:
A) Means continuous deployment
B) Builds and tests every change automatically so problems surface early — the foundation, on both app and server sides
C) Means continuous coding
D) Is mobile-only

**80.** A build artifact promoted through environments:
A) Rebuilt per environment
B) Built once and promoted unchanged (with config injected) so behavior is consistent — rebuilding per environment causes drift; the mobile analogue is the signed build you test being the one you ship
C) Different per environment
D) Automatic

**81.** Server-side canary and gradual rollout:
A) Are mobile-only ideas
B) Mirror the mobile staged rollout — send a slice of traffic to the new version, watch metrics, expand if healthy; a senior recognizes the shared principle
C) Replace tests
D) Are feature flags

**82.** Observability (logs, metrics, traces):
A) Is backend-only
B) Applies across the stack — the app needs crash reporting and analytics; the server needs logs, metrics, and traces; a senior reasons about end-to-end visibility to diagnose issues that cross the boundary
C) Is the same as console.log
D) Is unnecessary

**83.** A p95/p99 latency on the API:
A) Is the average
B) Is the tail the app's users actually feel as "slow" — a senior looks past averages to the tail when diagnosing perceived app slowness
C) Is storage
D) Is a client metric

**84.** An incident spanning app and backend:
A) Is the backend's problem
B) Often needs someone who can reason across both to localize whether it is client, network, or server — exactly the generalist judgment Senior 1 requires
C) Is the app's problem
D) Resolves itself

**85.** The first priority in an incident:
A) Find blame
B) Stop the bleeding (roll back, flag off, halt rollout), then diagnose, then learn via a blameless post-mortem
C) Write the post-mortem
D) Notify press

**86.** A junior on your team submits a confused PR:
A) Reject and say start over
B) Engage charitably — diagnose intent, point to the right path, leave a clearer next step
C) Approve to be kind
D) Ignore

**87.** A peer disagrees with your design:
A) Defend at all costs
B) Listen for what they see; update if convinced, otherwise explain your reasoning and accept they may still disagree
C) Escalate
D) Build both

**88.** Choosing between two similar technical approaches:
A) The newer one
B) The one the team can best maintain — familiarity, ecosystem maturity, and operational experience often beat marginal technical superiority
C) The harder one
D) The popular one

**89.** Introducing a new framework/dependency to the codebase:
A) Unilaterally
B) Discussed and justified against alternatives, weighing total cost — maintenance, learning curve, size, lock-in — not just local convenience
C) The senior's call alone
D) Automatic

**90.** A working relationship with a product manager:
A) Implement whatever is prioritized
B) Understand the business goal, push for clarity on the why, surface technical implications and platform realities, and own the how together
C) Take direction silently
D) Own the roadmap

**91.** A working relationship with a designer:
A) Implement the handoff literally
B) Engage early on feasibility and the states mobile lives in (loading, empty, error, offline, permissions, interruptions), treating the design as a collaboration
C) Redesign while building
D) Wait for sign-off

**92.** A working relationship with backend and web engineers:
A) Stay in your lane
B) Collaborate on the shared contract, push back substantively, and share ownership of the end-to-end feature across clients
C) Communicate only via tickets
D) Defer always

**93.** Estimating as a senior:
A) A single date
B) Ranges with named assumptions and risks, updated as they clarify — and willingness to say "I need a day to investigate"
C) Optimistic promises
D) Refusal

**94.** A senior's demeanor in a chaotic incident:
A) Panic
B) Steady — gather facts, stabilize, communicate, prioritize; the team takes its cue from the senior
C) Blame
D) Wait

**95.** Saying "I do not know, let me find out":
A) Unprofessional
B) A strength — pretending is the more dangerous habit, and juniors model what they see
C) Rare
D) To be hidden

**96.** A senior who only thinks about their own tickets:
A) Is focused
B) Is missing half the job — raising the team's level, reviewing, mentoring, and shared ownership are the role
C) Is efficient
D) Is correct

**97.** A senior who micromanages junior code line by line:
A) Is doing the job
B) Is failing to develop the team — review for correctness and growth, and let juniors make recoverable mistakes
C) Saves time
D) Reduces bugs

**98.** A senior who refuses to ship below a perfect bar:
A) Has high standards
B) Is often the bottleneck — done and out usually beats perfect and pending, especially given mobile release cadence
C) Is the gold standard
D) Should be promoted

**99.** The single trait that most distinguishes Senior 1 from a strong Junior 3:
A) Years
B) Judgment — knowing not just how, but whether, when, and at what cost — applied across a broader surface than the original specialty
C) Speed
D) Specialization depth

**100.** A mobile Junior 3 who passes this exam is signaling:
A) That they know everything
B) That they have broadened to operate as a generalist senior — with mobile depth now a strength they bring to a broader role, not the only thing they offer
C) That they should specialize harder
D) That they are ready to manage

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

*Administrator's note: This is the convergence exam, intentionally hard for a candidate who has lived only inside mobile. A mobile Junior 3 who scores 70–80 here is not a failure — they have done the depth work and now need the breadth work. Coach them, give them assignments that reach into backend and web adjacency, and re-sit them in six months. A candidate who barely scrapes 89 will struggle as a Senior 1, because the role demands this breadth every day.*
