# Promotion Exam: Junior Backend Engineer 3 → Senior Engineer 1

**Track:** Convergence — Backend Specialist → Generalist Software Engineer
**Format:** 100 multiple-choice questions
**Time:** 165 minutes
**Passing score:** 89 / 100

**Scope and purpose.** This is the convergence exam for the backend track, parallel in structure to the frontend convergence exam. A Junior 3 backend engineer has spent two to four years deepening in their lane. From Senior 1 onward, the role explicitly broadens: a Senior at this company is expected to operate across the full stack, make architectural decisions that touch the frontend and the operational layer as well as the database, review code in areas adjacent to their primary expertise, mentor juniors across specialties, and understand end-to-end what happens when a user clicks something and a response comes back. This exam tests whether the candidate has done the broadening work required to step into that role.

The structure reflects this. The first section confirms the candidate still owns the backend depth they should — Senior 1 is not a place where a former backend specialist gets to forget how a database performs. The remaining sections test the breadth the senior role requires: frontend literacy at a level that lets the engineer participate in design and review, systems-level database thinking, architecture across services, security across the stack, deployment and operations, and the judgment that separates a senior generalist from a strong junior in one lane.

**A note to the candidate.** If you can comfortably answer Section A but struggle with Section B (frontend literacy) or beyond, that is not a failure — it is information about where to invest before re-sitting. A backend engineer who has never opened browser DevTools, never thought about layout, or never reasoned about a bundle is not yet ready for Senior 1. Coming back in six months after deliberate broadening is far better than passing this exam by luck and then struggling in the role.

---

## Section A — Backend Depth a Senior Must Still Own (Q1–Q15)

**1.** A slow endpoint in production. The senior backend engineer's first move is:
A) Add a cache
B) Reproduce or measure — find where the time is actually being spent (database, downstream call, CPU, network) before changing anything
C) Refactor it
D) Add an index

**2.** A query taking 2 seconds that worked fine yesterday:
A) Restart the database
B) Check whether the query plan changed, whether data grew, whether stats are stale, whether locks are involved — `EXPLAIN ANALYZE` and the slow-query log are the starting point
C) Drop the index
D) Add more memory

**3.** A senior reading a junior's API design should:
A) Approve to be kind
B) Look first at versioning, error shape, authorization, idempotency, and pagination — these are the things that calcify into the public contract and become expensive to change
C) Focus on naming
D) Defer to the junior

**4.** A "transaction held open across a network call":
A) Is fine
B) Is one of the most common scalability disasters — locks held while waiting on an external service ruin throughput and produce cascading failures; keep transactions short
C) Is required
D) Speeds things up

**5.** A new endpoint that calls four downstream services sequentially:
A) Is fine
B) Should usually parallelize independent calls, set timeouts on each, and handle partial failure deliberately — the request's latency is the slowest call, not the sum, when done well
C) Should always be sequential
D) Cannot be parallelized

**6.** A `Promise.all` over 1,000 downstream calls:
A) Is fine
B) Will fire 1,000 concurrent calls — easy to overwhelm the target, your sockets, or your memory; bound concurrency
C) Runs sequentially
D) Is automatic

**7.** Adding an index to fix a slow query without testing:
A) Is safe — indexes only help
B) Is risky on a large table — building the index can lock the table or take hours; use online-build options and verify on a staging dataset first
C) Cannot fail
D) Is the same as `EXPLAIN`

**8.** A migration that adds a NOT NULL column to a large table:
A) Is harmless
B) Is dangerous — it may rewrite the table or block writes for the duration; the safe pattern is to add nullable, backfill in batches, then enforce the constraint
C) Is automatic
D) Is for development only

**9.** A senior writing a "small fix" that adds a synchronous external API call inside a database transaction:
A) Has improved correctness
B) Has likely introduced a latency and reliability bug — external calls in transactions block locks and connections; move the call outside or use the outbox pattern
C) Has made it faster
D) Is correct

**10.** A queue consumer that crashes processing a "poison" message:
A) Should keep retrying
B) Should detect poison messages (max-attempts, dead-letter queue) so the queue does not stall on one bad item — and the team must know when DLQ entries accumulate
C) Should delete them silently
D) Is fine to ignore

**11.** Idempotency in write endpoints:
A) Is a frontend concern
B) Is a senior-level discipline — clients retry on flaky networks; without idempotency, "the user clicked twice" becomes "we charged them twice"
C) Is automatic with HTTPS
D) Is for GET only

**12.** A senior code-reviewing a junior's PR that introduces a third-party SDK:
A) Approves quickly
B) Considers cost: bundle/install size, security surface, license, maintenance, lock-in — and asks whether the alternative (writing the small piece directly) was considered
C) Rejects on principle
D) Defers

**13.** Caching a response that varies per user:
A) Is the same as caching anything else
B) Requires that the cache key includes the user (or the cache is private), or else one user will see another's data — a classic cache-leak bug
C) Is impossible
D) Should be done on a CDN always

**14.** A long-tail latency problem (p99 is bad while p50 looks fine):
A) Is unimportant
B) Often points to something specific — GC pauses, lock contention, cold caches, a single slow downstream — that p50 hides; tail latency is what real users perceive
C) Is the same as p50
D) Is for storage only

**15.** A senior backend engineer's deepest responsibility on the backend itself is:
A) Writing the most code
B) The correctness, reliability, and security of the services they own — across all the work the team ships, not just their own
C) The CI pipeline
D) The database schema

---

## Section B — Frontend Literacy (Q16–Q30)

**16.** When the browser hits a URL, before any HTML renders:
A) The browser executes the server's code
B) DNS resolution → TCP/TLS handshake → HTTP request → HTML response, then the browser parses HTML and discovers further resources (CSS, JS, images, fonts) and fetches them
C) The browser asks the database
D) The CDN executes the application

**17.** The Critical Rendering Path is:
A) The fastest network route
B) The sequence the browser follows from receiving HTML to displaying pixels — parse, build DOM/CSSOM, layout, paint, composite; understanding it helps reason about user-perceived speed
C) For backend only
D) The same as the network

**18.** Largest Contentful Paint (LCP):
A) Is a backend metric
B) Is the time until the largest visible content element renders — a primary user-perceived speed metric; slow LCP correlates with worse engagement and conversion
C) Replaces server response time
D) Is for fonts

**19.** Cumulative Layout Shift (CLS):
A) Is unimportant
B) Measures how much visible content jumps around during load — caused by images without dimensions, late-loading fonts, or injected ads
C) Is automatic
D) Is desktop-only

**20.** A single-page application (SPA):
A) Has only one page on disk
B) Loads an HTML shell and JavaScript that takes over routing and rendering; navigations between routes happen without full reloads — trade-offs against multi-page apps include SEO, initial-load weight, and complexity
C) Is the same as a static site
D) Is deprecated

**21.** Server-side rendering (SSR):
A) Means serving HTML from the server (rather than letting JS build it client-side), so the user sees content before JS executes; benefits perceived performance and SEO, at the cost of server load and complexity
B) Is the same as a CDN
C) Is for backend only
D) Is the same as SPA

**22.** Hydration (in modern frontend frameworks):
A) Is initial load
B) Is the process where the client-side framework attaches to server-rendered HTML, wiring up event handlers and reconciling state — mismatches between server and client cause bugs
C) Is a caching strategy
D) Is for the database

**23.** A "render" in React (or comparable frameworks):
A) Always touches the DOM
B) Re-runs the component to compute a new virtual tree, then applies only the actual DOM differences — most re-renders do little or no DOM work
C) Is the same as a paint
D) Means a reload

**24.** A bundle is large because:
A) Bandwidth
B) The application's code and its dependencies are shipped to the browser; a senior should be able to read a bundle analyzer to see what is taking space and recognize that heavy dependencies and missing code splitting are typical culprits
C) Caching
D) HTML

**25.** Code splitting:
A) Is for source control
B) Breaks the bundle into smaller chunks loaded on demand (often per route), so users only download what they need for the current view
C) Is for backend
D) Is the same as minification

**26.** A frontend "controlled input":
A) Stores its value in the DOM
B) Stores its value in component state, so the framework drives every change — gives precise control at the cost of more re-renders, relevant to performance discussions
C) Is read-only
D) Is the same as a form

**27.** Accessibility on the frontend is:
A) The frontend engineer's problem alone
B) Cross-functional, but the backend's role includes returning errors in shapes that can be associated with fields (for screen-reader-accessible error announcement), correct status codes, and not leaking internal data in messages
C) Optional
D) Browser-only

**28.** CORS errors come from:
A) The frontend
B) The browser enforcing the server's declared origin policy on cross-origin requests; the fix is almost always on the server (`Access-Control-Allow-Origin` and friends), not the client
C) The CDN
D) HTTPS

**29.** A preflight `OPTIONS` request:
A) Is a bug
B) Is a CORS mechanism — the browser asks the server whether a non-simple cross-origin request (custom headers, non-standard method) is allowed before sending it
C) Is unrelated to CORS
D) Is for cache

**30.** A senior backend engineer who has never opened browser DevTools:
A) Is fine
B) Is missing context — even a basic familiarity with Network, Console, and Performance panels makes them dramatically more effective at debugging end-to-end issues
C) Is the norm
D) Should specialize harder

---

## Section C — Database Systems Deeper Thinking (Q31–Q40)

**31.** The database's job during a query is:
A) Run the SQL as written
B) Parse, plan (choose how to execute), and execute — the planner uses statistics about data distribution and indexes; the same SQL can perform very differently if stats are stale
C) Read every row always
D) Use only one index

**32.** Statistics (the planner's view of the data) becoming stale:
A) Cannot happen
B) Causes the planner to choose bad plans — `ANALYZE` (or its equivalent) refreshes statistics; many databases also do this automatically on a schedule
C) Speeds up queries
D) Is for backups

**33.** An index that exists but is not used by a query:
A) Means the index is broken
B) Often means the planner estimated a different plan to be cheaper, or the predicate is not in a form the index can serve — `EXPLAIN` reveals which
C) Means the database is wrong
D) Means the query is wrong

**34.** Replication lag:
A) Is a network problem
B) The delay between a write being committed on the primary and applied on a replica; reads served from replicas may see stale data — design the UX around this where it matters
C) Is the same as latency
D) Is always zero

**35.** A "split brain" in a replicated system:
A) Two primaries accept conflicting writes during a partition, producing divergent histories that must be reconciled — distributed databases trade off availability vs consistency precisely to handle this
B) Means a fast database
C) Is impossible
D) Is the same as eventual consistency

**36.** The CAP theorem at a high level:
A) Picks two of three
B) Under a network partition, a distributed system must choose between consistency and availability — there is no real "no partition" for production systems, so the choice surfaces under failure
C) Is academic
D) Means consistency always loses

**37.** A NoSQL document store can be the right call when:
A) You want to avoid SQL
B) The data is naturally document-shaped, joins are rare, and horizontal scale matters more than referential integrity; making this choice for the wrong reasons is one of the more painful refactors
C) Always
D) Never

**38.** A time-series database (InfluxDB, TimescaleDB, etc.):
A) Is a marketing term
B) Is optimized for high-volume, time-ordered writes and downsampling/retention policies typical of metrics and IoT — using a general OLTP database for high-cardinality time series often hits walls
C) Replaces relational databases
D) Is the same as Redis

**39.** A search engine (Elasticsearch, OpenSearch, Meilisearch):
A) Replaces the database
B) Is optimized for full-text search, faceting, and relevance — typically fed from the primary database and re-indexed; using `LIKE '%foo%'` on a large table is not a search engine
C) Is for logs only
D) Is deprecated

**40.** A backup that has never been restored:
A) Is fine
B) Is not yet a backup — restoration must be tested regularly; "the backup looked fine in the dashboard" is how organizations discover during an outage that they cannot recover
C) Is automatic
D) Is the DBA's job only

---

## Section D — Systems and Architecture (Q41–Q55)

**41.** A typical web system has caches at several layers:
A) Just one
B) Browser cache, CDN, reverse proxy, application cache (Redis), database cache — each with different invalidation needs and trade-offs
C) Only CDN
D) Only browser

**42.** A reverse proxy (nginx, Caddy, an ingress controller):
A) Is a database
B) Sits in front of application servers handling TLS termination, routing, load balancing, caching, and rate limiting — the application sees clean requests
C) Replaces the application
D) Is the same as a CDN

**43.** Horizontal scaling:
A) Means bigger machines
B) Means adding more instances of the application — requires the application to be stateless (or session-shared) so any instance can serve any request
C) Replaces vertical scaling always
D) Is for databases only

**44.** A stateful service is harder to scale because:
A) It is slower
B) Routing a request to the wrong instance loses access to in-memory state; either externalize state, route by session affinity, or accept the operational cost
C) It is impossible
D) Memory is expensive

**45.** A monolith versus microservices:
A) Microservices are always better
B) Different organizational and operational trade-offs; microservices let large teams deploy independently at the cost of significant operational complexity; monoliths are simpler and faster for small teams
C) Are interchangeable
D) Monoliths are deprecated

**46.** A "distributed monolith":
A) Is the best of both worlds
B) Is an anti-pattern — services that must deploy together, share a database, or fail together; you pay microservices complexity without the independence benefit
C) Is the same as a monolith
D) Is unavoidable

**47.** Synchronous service-to-service calls form a chain:
A) Are robust
B) Multiply failure probability — three 99.9% services in series give about 99.7%; consider whether the call can be async, batched, or fall back to a stale local copy
C) Are immune to failure
D) Are faster than async

**48.** A message queue between services:
A) Is overhead
B) Decouples producers and consumers, smooths spikes, enables retries and dead-lettering, and allows scaling each side independently — at the cost of an eventually consistent model
C) Replaces HTTP
D) Is for logs only

**49.** Event-driven architecture:
A) Replaces request-response
B) Producers emit events; consumers react to them; loose coupling and scalability are the benefits, but debugging and reasoning about ordering and at-least-once delivery become harder
C) Is the same as REST
D) Is deprecated

**50.** An outbox pattern:
A) Is for email
B) When a service must atomically write to its database **and** publish an event, write the event to an outbox table in the same transaction and a separate process publishes from it — solves the dual-write consistency problem
C) Replaces transactions
D) Is for ordering

**51.** Idempotency at the system level:
A) Is the same as request idempotency
B) Means designing operations so that repeated execution (intentional or accidental) does not corrupt state; essential when retries, queues, or distributed coordination are in play
C) Is the same as transactions
D) Is for reads only

**52.** A feature flag at the system level:
A) Is for A/B testing only
B) Lets a service change behavior at runtime — gradual rollouts, kill switches, per-customer overrides — without redeploys; valuable but adds branching that must be cleaned up
C) Replaces deploys
D) Is the same as configuration

**53.** A "blast radius":
A) The number of files changed
B) How much of the system, or how many users, are affected if a change goes wrong; a senior weighs blast radius when choosing what to ship, how, and when
C) Lines changed
D) Time

**54.** A canary deployment:
A) Means the deploy is unsafe
B) Sends a small slice of traffic to the new version while watching metrics, then increases if healthy — bounds blast radius of a bad release
C) Is the same as blue-green
D) Replaces tests

**55.** Reading an architecture diagram and asking the right questions about it (where state lives, where the bottlenecks are, what happens when a component fails) is:
A) For architects only
B) Part of being a senior generalist — you do not have to be the architect to think architecturally
C) For frontend
D) The manager's job

---

## Section E — Security Across the Stack (Q56–Q70)

**56.** Cross-Site Scripting (XSS) occurs when:
A) Cookies are stolen
B) Untrusted input is rendered into a page in a way that allows it to execute as code, giving the attacker the user's session in that page
C) HTTPS fails
D) Headers are missing

**57.** A backend's role in defending XSS includes:
A) None
B) Storing untrusted content faithfully (do not "sanitize" naively) and returning safe content-type headers; the rendering layer (the frontend or template) is responsible for escaping at output — a senior must understand both sides
C) Stripping all HTML
D) Encrypting responses

**58.** Cross-Site Request Forgery (CSRF):
A) A user steals data
B) A third-party site causes a victim's browser to make an authenticated request to your site without intent — defended by SameSite cookies, CSRF tokens, or requiring custom headers
C) A type of SQL injection
D) A network attack

**59.** CORS as a security feature:
A) Protects the server
B) Is browser-enforced — protects users from cross-origin scripts reading the server's responses; misconfigured (`*` with credentials, or reflecting any origin) it becomes the vulnerability
C) Protects the database
D) Replaces HTTPS

**60.** Server-Side Request Forgery (SSRF):
A) Is unrelated to backends
B) When a backend fetches a URL supplied by the user and the user points it at internal services or cloud metadata endpoints — defended by allowlists, blocking internal IP ranges, and disabling redirects
C) Is the same as CSRF
D) Is browser-only

**61.** Insecure deserialization:
A) Is a frontend issue
B) When user-supplied data is deserialized into language-native objects with side effects — attackers can construct payloads that execute code; use safe formats (JSON parsed strictly) and never deserialize untrusted binary blobs
C) Is harmless
D) Is the same as SQL injection

**62.** A dependency vulnerability in your application:
A) Is the vendor's problem
B) Is your application's vulnerability — you ship the dependency's code with the same privileges as your own; audit, lock, monitor, and update deliberately
C) Is sandboxed
D) Is automatic

**63.** Storing secrets in environment variables:
A) Is the final solution
B) Is better than the repo, but at scale you want a real secrets manager with audit, rotation, access control, and short-lived credentials
C) Encrypts them
D) Replaces HTTPS

**64.** A secret that has been leaked:
A) Can be removed by deleting the commit
B) Must be rotated immediately — even brief exposure means the secret is compromised; history scrubbing helps tidiness, not safety
C) Is fine if private
D) Cannot happen with .env files

**65.** Authentication versus authorization at a senior level:
A) Are the same
B) Authentication is a one-time question per session ("who are you?"); authorization happens on every protected operation ("are you allowed?") — failing to enforce the second is the source of much harder bugs than the first
C) Are deprecated
D) Authentication is harder

**66.** Multi-factor authentication (MFA):
A) Is decorative
B) Drastically reduces account takeover risk by requiring a second factor (TOTP, push, hardware key, SMS as a weak last resort) — your service should support it and admins should require it
C) Slows users
D) Is for admins only

**67.** Audit logging:
A) Is the same as application logging
B) Records security-relevant events (logins, permission changes, data exports, deletions) in a tamper-evident store — distinct from operational logging and necessary for compliance and forensics
C) Is for the OS
D) Is decorative

**68.** PII (personally identifiable information):
A) Means everything
B) Is regulated under various laws (GDPR, CCPA, others) — minimize collection, encrypt at rest and in transit, document where it lives, and have a deletion path
C) Is for the legal team
D) Is the same as logs

**69.** Encryption at rest:
A) Replaces authorization
B) Protects data on disk against certain physical-access attacks but does nothing against an application that legitimately reads it — defense in depth, not a single answer
C) Is a CDN feature
D) Is the same as TLS

**70.** A senior backend engineer's responsibility for security:
A) Ends at parameterized queries
B) Extends to understanding the threat model of every feature, escalating concerns about flows they cannot verify, and writing code that does not casually undermine the protections the rest of the stack provides
C) Is the security team's alone
D) Is to install scanners

---

## Section F — Deployment, Operations, and Observability (Q71–Q83)

**71.** Continuous Integration (CI):
A) Means continuous deployment
B) Builds and tests every change automatically when pushed, so problems are caught early — the foundation everything else builds on
C) Means continuous coding
D) Is for backend only

**72.** A build artifact (Docker image, jar, bundle):
A) Should be rebuilt per environment
B) Should be built once and promoted unchanged through environments — rebuilding per environment introduces drift and "works in staging" surprises
C) Should differ per environment
D) Is automatic

**73.** A Dockerfile that runs as root in production:
A) Is best practice
B) Is unnecessary and dangerous — drop privileges to a non-root user; defense in depth against container escapes and accidental damage
C) Is required
D) Is faster

**74.** Container image size:
A) Does not matter
B) Affects deploy time, registry costs, and the attack surface of installed packages — base on a small, audited image and avoid bundling tools that production does not need
C) Is irrelevant after the first deploy
D) Is fixed

**75.** A 12-factor or similar discipline (config in environment, stateless processes, logs to stdout, disposable instances):
A) Is dogma
B) Encodes patterns that make services portable and operable at scale; not every rule applies to every service, but the principles repay study
C) Is for cloud only
D) Is deprecated

**76.** Database migrations during a deploy:
A) Should be run as part of the application startup
B) Should typically be applied as a deliberate, reviewable step — and the application should be designed to tolerate both the old and new schema during the transition (expand/contract)
C) Should be optional
D) Should always block deploys

**77.** Zero-downtime deploys:
A) Are impossible
B) Require the application to handle both old and new versions running simultaneously, gracefully drain old instances, and use migrations and feature flags carefully — they are normal at scale and worth investing in
C) Are automatic
D) Are for frontend only

**78.** A canary release:
A) Is the same as a blue-green
B) Sends a small percentage of traffic to the new version while monitoring; if healthy, percentage increases — bounds blast radius
C) Is a feature flag
D) Replaces tests

**79.** Rolling back a deploy:
A) Is a sign of failure
B) Is a feature, not a failure — fast, safe rollback is one of the most valuable operational capabilities; design migrations and features so rollback is always possible
C) Is impossible after migration
D) Is for emergencies only

**80.** A "log everything" strategy:
A) Is best practice
B) Produces noise that hides signal, costs money, and slows search; log what is operationally useful at the right level, with structured fields
C) Is required
D) Replaces metrics

**81.** Tracing across services:
A) Is the same as logging
B) Records spans for a single request across services, showing where time was spent and where failures occurred — propagate a trace context at every call to make it work
C) Is for frontend only
D) Replaces metrics

**82.** Alerting on causes versus alerting on symptoms:
A) Cause-based is always better
B) Symptom-based alerts (user-visible errors, SLO burn rate) tell you when users are hurt; cause-based alerts can be noisy and miss new failure modes — most teams need primarily symptom-based with cause-based as secondary signals
C) Symptom-based is decorative
D) Are the same

**83.** A senior backend engineer who has never been on-call:
A) Is enviable
B) Is missing crucial context — there is no substitute for being the one woken up at 3 a.m. by code you wrote when learning how to build operable systems
C) Is the norm
D) Should specialize harder

---

## Section G — Senior Judgment and Collaboration (Q84–Q100)

**84.** A junior on your team asks for a code review on a confused PR. The senior response is:
A) Reject and tell them to start over
B) Engage charitably — diagnose what they were trying to do, point to the right path, leave them with a clearer next step rather than just "this is wrong"
C) Approve to be kind
D) Ignore until standup

**85.** A peer disagrees with your design. The healthy response is:
A) Defend at all costs
B) Listen for what they see that you do not; if they convince you, update the design; if they do not, explain your reasoning and accept that they may still think you are wrong
C) Escalate immediately
D) Implement both

**86.** A frontend engineer asks for a backend change that would simplify the UI. The senior backend's response is:
A) Refuse on principle
B) Listen, understand the UI need, weigh it against backend cost (performance, security, complexity, contract impact) — and propose the option that is best end-to-end, not best for one side
C) Always do it
D) Send them away

**87.** Choosing between two technical approaches with similar trade-offs:
A) Pick the newer one
B) Default to the one the team will best be able to maintain — familiarity, ecosystem maturity, and operational experience often beat marginal technical superiority
C) Pick the harder one
D) Pick what is popular

**88.** Introducing a new database, queue, or framework to the codebase:
A) Should be unilateral
B) Should be discussed with the team and justified against alternatives — total cost (operations, hiring, learning curve, lock-in) outweighs the local convenience of any one library
C) Should be the senior's choice alone
D) Is automatic

**89.** A working relationship with a product manager is healthiest when:
A) You implement whatever they prioritize
B) You understand the business goal behind the request, push for clarity on the "why," surface technical implications and alternatives, and own the "how" together — not as a vendor, not as a blocker
C) You take direction silently
D) You decide the roadmap

**90.** A working relationship with a designer is healthiest when:
A) You implement whatever they hand over
B) You engage early on feasibility, ask about edge cases (loading, empty, error states; offline; permissions), and treat the design as a starting point for collaboration — not as a spec to follow blindly or override unilaterally
C) You redesign as you build
D) You wait for sign-off

**91.** A working relationship with a frontend engineer is healthiest when:
A) You stay out of each other's lanes
B) You collaborate early on the data contract, push back on each other's ideas substantively, and share ownership of the end-to-end feature
C) You communicate only through tickets
D) They lead

**92.** Estimating, at the senior level:
A) Quote a single date
B) Quote ranges, name the assumptions and risks, and update the estimate as those become clearer — and be willing to say "I do not know yet, give me a day to investigate"
C) Promise optimistically
D) Refuse

**93.** A senior's first reaction to a chaotic incident is:
A) Panic
B) Steady — gather facts, stabilize, communicate clearly, prioritize ruthlessly; the team takes its cue from how the senior behaves under pressure
C) Blame
D) Wait it out

**94.** Saying "I do not know, let me find out" as a senior:
A) Is unprofessional
B) Is a strength — pretending to know is the more dangerous habit, and juniors model what they see
C) Is rare
D) Should be hidden

**95.** A senior who only thinks about their own tickets:
A) Is focused
B) Is missing half the job — at this level, your work includes raising the team's level, reviewing thoughtfully, mentoring, and contributing to shared infrastructure
C) Is efficient
D) Is correct

**96.** A senior who micromanages junior code line by line:
A) Is doing their job
B) Is failing to develop the team — review for correctness and growth, not for stylistic uniformity, and let juniors make recoverable mistakes
C) Saves time
D) Reduces bugs

**97.** A senior who refuses to ship anything below a perfect bar:
A) Has high standards
B) Is often the bottleneck of their team — done and out is usually better than perfect and pending, and "perfect" rarely survives contact with real users
C) Is the gold standard
D) Should be promoted

**98.** A senior who never breaks production:
A) Is the safest engineer
B) Either ships nothing meaningful, or is hiding what happens; everyone breaks something eventually — what matters is how they prevent, detect, and respond
C) Should be modeled
D) Has the best record

**99.** The single trait that most distinguishes a Senior 1 from a strong Junior 3 is:
A) Years of experience
B) Judgment — knowing not just **how** to do things, but **whether** they should be done, **when**, and at **what cost** — applied across a broader surface area than their original specialty
C) Speed
D) Specialization depth

**100.** A backend Junior 3 who passes this exam is signaling:
A) That they know everything
B) That they have done the broadening work to operate as a generalist senior — and that their backend depth is now a strength they bring to a broader role, not the only thing they have to offer
C) That they should specialize harder
D) That they are ready to be a manager

---

## Answer Key

1.B  2.B  3.B  4.B  5.B  6.B  7.B  8.B  9.B  10.B
11.B  12.B  13.B  14.B  15.B  16.B  17.B  18.B  19.B  20.B
21.A  22.B  23.B  24.B  25.B  26.B  27.B  28.B  29.B  30.B
31.B  32.B  33.B  34.B  35.A  36.B  37.B  38.B  39.B  40.B
41.B  42.B  43.B  44.B  45.B  46.B  47.B  48.B  49.B  50.B
51.B  52.B  53.B  54.B  55.B  56.B  57.B  58.B  59.B  60.B
61.B  62.B  63.B  64.B  65.B  66.B  67.B  68.B  69.B  70.B
71.B  72.B  73.B  74.B  75.B  76.B  77.B  78.B  79.B  80.B
81.B  82.B  83.B  84.B  85.B  86.B  87.B  88.B  89.B  90.B
91.B  92.B  93.B  94.B  95.B  96.B  97.B  98.B  99.B  100.B

**Passing threshold: 89 / 100**

*Administrator's note: This is the convergence exam, and it is intentionally hard for a candidate who has lived only inside backend. A backend Junior 3 who scores 70–80 on this exam is not a failure — they are someone who has done the depth work and now needs to do the breadth work. Coach them, give them assignments that stretch into frontend and operations adjacency, and re-sit them in six months. A candidate who barely scrapes 89 will struggle as a Senior 1, because the role demands the breadth the exam tests for, every day.*
