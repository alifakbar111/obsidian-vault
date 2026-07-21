# Promotion Exam: Junior Frontend Engineer 3 → Senior Engineer 1

**Track:** Convergence — Frontend Specialist → Generalist Software Engineer
**Format:** 100 multiple-choice questions
**Time:** 165 minutes
**Passing score:** 89 / 100

**Scope and purpose.** This is the most important transition in the ladder. Up to Junior 3, an engineer has been a specialist — in this case, a frontend engineer growing deeper in their lane. From Senior 1 onward, the role explicitly broadens. A Senior engineer at this company is expected to operate across the full stack: to make architectural decisions that touch backend and infrastructure, to review code in areas adjacent to their primary expertise, to mentor juniors across specialties, and to understand the system end-to-end well enough to weigh real trade-offs. This exam tests whether a strong frontend Junior 3 has done the broadening work required to step into that role.

The structure of the exam reflects this. The first section confirms the candidate still owns the frontend depth they should — Senior 1 is not a place where a former frontend specialist gets to forget how the browser works. The remaining sections test the breadth that the senior role requires: HTTP and backend, databases and SQL, system architecture, security across the stack, deployment and operations, and the judgment that separates a senior generalist from a strong junior in one lane.

**A note to the candidate.** If you are sitting this exam and find that you can comfortably answer the first section but struggle with several of the others, that is not a failure — it is information. It tells you which areas to invest in before the next attempt. A frontend engineer who has never written a SQL query, never deployed a service, or never thought about CORS in depth is not yet ready for Senior 1. Coming back in six months after deliberate broadening is far better than passing this exam by luck and then struggling in the role.

---

## Section A — Frontend Depth a Senior Must Still Own (Q1–Q15)

**1.** A re-render in React is not the same as a DOM update because:
A) React batches them
B) React re-runs the component function to compute the new virtual tree, then diffs against the previous one and only applies the actual differences to the DOM — most re-renders touch the DOM little or not at all
C) Re-renders only happen on user action
D) DOM updates are synchronous

**2.** A senior frontend engineer reading a "slow component" bug report should first:
A) Wrap everything in `useMemo`
B) Measure with the Profiler to find what is actually slow — assumed bottlenecks are wrong more often than not
C) Rewrite the component
D) Add `React.memo`

**3.** A controlled input on a large form that re-renders the whole form on every keystroke is best addressed by:
A) Removing controlled inputs
B) Co-locating field state to each field (or using a form library that does this), so a keystroke only re-renders the one field
C) Throttling input
D) Using uncontrolled inputs only

**4.** When debugging a layout shift, the most useful first step is:
A) Refresh
B) Use DevTools' Performance panel with "Layout Shift Regions" enabled, or check the LCP/CLS overlay, to see which element is shifting and why
C) Disable CSS
D) Profile JavaScript

**5.** A bundle has grown unexpectedly large after a feature change. The first investigation is:
A) Rewrite the feature
B) Run a bundle analyzer to see what modules were added or grew, often revealing a heavy dependency pulled in transitively
C) Switch bundlers
D) Disable tree-shaking

**6.** A common cause of bloated client bundles is:
A) Tailwind
B) Importing the entire library when only a small part is needed (e.g., `import _ from "lodash"` instead of `import debounce from "lodash/debounce"` or using `lodash-es`)
C) Using ES modules
D) Using TypeScript

**7.** Server-side rendering (SSR) versus client-side rendering (CSR):
A) SSR is always faster
B) SSR ships HTML the user can see and read before JavaScript runs, helping perceived performance and SEO, at the cost of server load and complexity; CSR is simpler but slower to first content
C) They are identical
D) CSR is deprecated

**8.** Hydration is:
A) Initial load
B) The process where the client React tree attaches to server-rendered HTML, wiring up event handlers and reconciling state — mismatches cause warnings and bugs
C) A caching strategy
D) An animation

**9.** A "hydration mismatch" warning typically means:
A) A typo
B) The server rendered different markup than the client computed on first render — often caused by reading `window`, `Date.now()`, or random values during render
C) The bundle is corrupted
D) The CSS is wrong

**10.** Streaming SSR and React Server Components:
A) Are the same thing
B) Are related but different: streaming delivers HTML in chunks as it is produced; Server Components let parts of the tree render only on the server, never shipping their code to the client
C) Replace REST APIs
D) Are deprecated

**11.** A senior should reach for an existing component primitive (Radix, React Aria, Headless UI, or your design-system equivalent) over building from scratch when:
A) Always
B) The primitive needs (accessibility, keyboard handling, focus management) are non-trivial and a tested implementation exists — reinventing menus, dialogs, and comboboxes correctly is a months-long effort
C) Never
D) Only for icons

**12.** A senior frontend reviewing a junior's PR should:
A) Focus on style
B) Look first at correctness, accessibility, error handling, and edge cases; cosmetic issues are real but secondary
C) Approve quickly
D) Rewrite the change

**13.** Premature abstraction in components ("we might need to vary this someday"):
A) Is good engineering
B) Often costs more than the duplication it tries to prevent; let the second or third concrete use case reveal the right abstraction
C) Is required
D) Is what makes code reusable

**14.** A "leaky" component API that exposes implementation details (specific class names, internal refs, deep prop chains):
A) Is fine
B) Creates fragile coupling — callers depend on internals that should be free to change; design the API around what the component **does**, not how it is built
C) Is faster
D) Is required for testing

**15.** A senior frontend engineer's deepest responsibility on the frontend itself is:
A) Writing the most code
B) The quality of the user-facing experience — performance, accessibility, correctness — across all the work the team ships, not just their own
C) The build pipeline
D) The design system

---

## Section B — HTTP, REST, and the Server-Side Request (Q16–Q28)

**16.** When the browser hits an API endpoint, the high-level path before the response comes back is roughly:
A) The browser talks directly to the database
B) DNS resolution → TCP/TLS handshake → HTTP request to a server (possibly through a CDN/load balancer) → application processing (often touching a database or cache) → response back
C) The browser executes server code
D) The CDN runs the application

**17.** HTTP methods carry intent: GET, POST, PUT, PATCH, DELETE. A common misuse is:
A) Using DELETE
B) Using GET for an action with side effects — GETs should be safe and idempotent; mutating data on GET breaks caching, prefetching, and conventions
C) Using POST for creation
D) Using PUT for updates

**18.** Idempotency means:
A) Speed
B) The same operation repeated multiple times has the same effect as doing it once — GET, PUT, and DELETE are expected to be idempotent; POST generally is not
C) Atomicity
D) Concurrency safety

**19.** HTTP status code 200 versus 201 versus 204:
A) Are interchangeable
B) 200 (OK) means success with content; 201 (Created) signals a resource was created; 204 (No Content) signals success with no body — the right code helps clients reason correctly
C) Only 200 should be used
D) Only 201 means success

**20.** A 401 versus a 403:
A) Are the same
B) 401 (Unauthorized) means the request lacks valid authentication; 403 (Forbidden) means authenticated but not allowed to do this — confusing them is a security and UX problem
C) Are server errors
D) Both mean logged out

**21.** A 429:
A) Means broken
B) Means the client has been rate-limited; well-behaved clients respect `Retry-After`, back off exponentially, and surface the situation to the user rather than hammering
C) Means server error
D) Should be retried immediately

**22.** A 5xx response generally means:
A) Client error
B) Something failed on the server side; the client typically should not retry blindly except for transient cases, and should not assume the request did not happen (for non-idempotent calls)
C) The client must reload
D) The user should retry

**23.** REST principles, briefly:
A) JSON over HTTP
B) Resource orientation, uniform interface, statelessness, and standard HTTP semantics — not just "HTTP endpoints returning JSON," though that is what most "REST" APIs actually are in practice
C) Strict GraphQL
D) RPC over HTTP

**24.** Compared to REST, GraphQL:
A) Replaces HTTP
B) Lets clients specify exactly what data they want in one request, at the cost of complexity in caching, monitoring, and server-side performance tuning
C) Is always faster
D) Is always worse

**25.** An endpoint that returns 50 fields when the client only needs 3:
A) Is fine
B) Wastes bandwidth and processing; over time, "fat" responses become a real frontend performance issue, and warrant a tighter endpoint or a field-selection mechanism
C) Is required
D) Is REST

**26.** Pagination on a large dataset should typically:
A) Return everything
B) Use offset or, better, cursor-based paging with sensible defaults, and the API contract should make the next-page mechanism clear
C) Be optional
D) Be done client-side

**27.** When a frontend engineer says "the backend should return the data in this shape," a senior:
A) Demands it
B) Frames the request as a collaboration — explain what the UI needs, listen to backend constraints (cost, performance, normalization), and arrive at a shape both sides can live with
C) Goes around the backend
D) Builds a workaround silently

**28.** A senior frontend engineer who cannot read or write basic backend code:
A) Is fine
B) Will be limited in their ability to design end-to-end features, debug across the stack, and influence architectural decisions — broadening here is essential
C) Is the norm
D) Should specialize harder

---

## Section C — Databases and SQL Literacy (Q29–Q40)

**29.** A relational database stores data in:
A) Files
B) Tables of rows and columns, with relationships expressed via keys; queries are written in SQL
C) JSON only
D) Key-value pairs

**30.** A primary key is:
A) A password
B) A column (or combination) that uniquely identifies each row in a table — non-null and unique
C) The first column
D) A search index

**31.** A foreign key:
A) Encrypts data
B) References the primary key of another table, expressing a relationship and (when enforced) preventing orphan rows
C) Is decorative
D) Is a synonym for primary key

**32.** An index:
A) Stores data
B) A data structure that lets the database find rows matching a query without scanning the whole table — speeds up reads at the cost of slower writes and disk space
C) Is the same as a primary key
D) Compresses tables

**33.** A query without an index on the column it filters by:
A) Always fails
B) May force a full table scan, which is acceptable for small tables but catastrophic for large ones — production slowness often traces to missing indexes
C) Is faster
D) Is the same speed

**34.** "N+1 query problem" means:
A) Off-by-one bug
B) An anti-pattern where loading N items triggers N additional queries (one per item) to fetch related data, instead of one batched query — a frequent cause of slow endpoints
C) Excessive normalization
D) A SQL syntax error

**35.** A JOIN:
A) Concatenates tables vertically
B) Combines rows from two tables based on a related column; inner joins return only matching rows, outer joins keep unmatched ones from one or both sides
C) Doubles the data
D) Replaces foreign keys

**36.** A transaction:
A) Is for money only
B) Groups multiple operations so they either all succeed or all fail together, preserving consistency — critical for any multi-step change to data
C) Speeds up queries
D) Replaces backups

**37.** ACID stands for:
A) An acid test
B) Atomicity, Consistency, Isolation, Durability — the guarantees a traditional relational database makes about transactions
C) Async, Cached, Indexed, Durable
D) Auto-Concurrent Index Database

**38.** NoSQL (document, key-value, wide-column) versus SQL:
A) NoSQL is always better
B) Different trade-offs: document stores are flexible and horizontally scalable but offer weaker joins and constraints; SQL gives strong consistency and powerful querying at the cost of stricter schemas — pick by problem shape, not fashion
C) NoSQL has no schema
D) SQL is dying

**39.** A senior frontend engineer who needs data shaped a certain way:
A) Adds it to localStorage
B) Should be able to read a schema, write a basic SELECT with a JOIN, and reason about why an index would or would not help — not become a DBA, but stop being illiterate
C) Asks for everything
D) Avoids data

**40.** Pagination at the database level:
A) Is the same as client pagination
B) Uses LIMIT/OFFSET (or seek/keyset pagination for large datasets) and the right indexes to keep page reads fast as the table grows
C) Is unnecessary
D) Is automatic

---

## Section D — Systems and Architecture Awareness (Q41–Q55)

**41.** A typical web system has caches at several layers:
A) Just one cache
B) Browser cache, CDN, reverse proxy, application cache, database cache — each with different invalidation needs and trade-offs
C) Only the CDN
D) Only the browser

**42.** A CDN (content delivery network):
A) Hosts your database
B) Caches static (and sometimes dynamic) responses at edge locations close to users, reducing latency and origin load
C) Is a load balancer
D) Replaces the application server

**43.** Cache invalidation is hard because:
A) Caches are slow
B) Knowing **when** a cached value is no longer correct is genuinely difficult, especially across layers — Phil Karlton's "two hard things" line is half-joking but accurate
C) Caches break randomly
D) Browsers ignore headers

**44.** A `Cache-Control` header on a static asset:
A) Has no effect
B) Tells caches (browser, CDN) how long they can hold the response, whether they must revalidate, and whether it can be shared — the foundation of HTTP caching
C) Is for cookies only
D) Disables caching

**45.** A long-lived cache for a JavaScript bundle is safe when:
A) Never
B) The filename includes a content hash (e.g., `app.abc123.js`), so any change produces a new filename and the old one stays cached without conflict
C) The bundle never changes
D) The browser is reloaded

**46.** A load balancer in front of multiple servers:
A) Is a security tool only
B) Distributes traffic across servers, enables horizontal scaling, and handles failure of individual instances by routing around them
C) Speeds up databases
D) Replaces a CDN

**47.** Horizontal scaling versus vertical scaling:
A) Are the same
B) Horizontal means more machines; vertical means bigger machines — horizontal is generally more resilient and cost-effective at scale but requires the application to be stateless or carefully session-managed
C) Vertical scales further
D) Horizontal is for databases only

**48.** Statelessness in the application layer means:
A) No data
B) No request depends on state held in a specific server's memory — state lives in a database, cache, or session store accessible to any instance, allowing instances to be added and removed freely
C) No sessions
D) No cookies

**49.** A message queue or event bus is useful when:
A) Always
B) Work can be done asynchronously, decoupled from the request — for example, sending email, generating reports, processing uploads — so the request returns fast and the work is retryable
C) Replacing HTTP
D) For login only

**50.** Eventual consistency:
A) Means errors
B) Means a system's replicas will converge to the same value after writes propagate, but reads in between may see stale data — a common trade-off in distributed systems
C) Is the same as ACID
D) Is forbidden

**51.** A senior frontend engineer encountering a slow page should be able to reason about:
A) Only the client
B) Whether the slowness is on the client (rendering, JS), the network (latency, payload size), or the server (DB query, downstream service) — and use the tools to localize it
C) Only the network
D) Only the server

**52.** Microservices versus monolith:
A) Microservices are always better
B) Different organizational and operational trade-offs; microservices help large teams move independently at the cost of significant operational complexity; monoliths are simpler and faster for small teams
C) The same
D) Monoliths are deprecated

**53.** The "blast radius" of a change is:
A) Its file size
B) How much of the system, or how many users, are affected if it goes wrong — a senior weighs blast radius when choosing what to ship, how, and when
C) Lines changed
D) Time to deploy

**54.** A feature flag:
A) Adds a feature permanently
B) A runtime switch that decouples deploy from release — code can be in production but inactive, then enabled for some users, a percentage, or everyone, and rolled back without a redeploy
C) Is a security tool
D) Replaces tests

**55.** Reading an architecture diagram and asking the right questions about it (where state lives, where bottlenecks are, what happens when a component fails):
A) Is for architects only
B) Is part of being a senior generalist — you do not have to be the architect to think architecturally
C) Wastes time
D) Is the manager's job

---

## Section E — Security Across the Stack (Q56–Q70)

**56.** Cross-Site Scripting (XSS) occurs when:
A) Cookies are stolen
B) Untrusted input is rendered into a page in a way that allows it to execute as code, giving the attacker the user's session in that page
C) HTTPS fails
D) A 404 happens

**57.** The most common XSS defense in modern frameworks is:
A) Server-side input sanitization only
B) Frameworks escape output by default; XSS now usually enters through escape hatches like `dangerouslySetInnerHTML`, `innerHTML`, or unsafe URL schemes in href/src
C) Antivirus
D) Strong passwords

**58.** Cross-Site Request Forgery (CSRF) occurs when:
A) Inputs are tampered with
B) A third-party site causes a victim's browser to make an authenticated request to your site without the victim's intent — typically defeated by SameSite cookies, CSRF tokens, or requiring custom headers
C) The CDN is hacked
D) JavaScript is disabled

**59.** CORS (Cross-Origin Resource Sharing):
A) Is a security feature of the browser, not the server
B) Is a browser-enforced policy where the server declares which origins are allowed to read its responses; misconfiguring it as `*` with credentials is a common security mistake
C) Encrypts requests
D) Replaces HTTPS

**60.** Storing a JWT in `localStorage` versus an `httpOnly` cookie:
A) Is the same
B) Has different security trade-offs: `localStorage` is readable by any script (vulnerable to XSS); `httpOnly` cookies are not accessible to JS but require CSRF protection — the right choice depends on threat model and architecture
C) Cookies are always wrong
D) `localStorage` is always wrong

**61.** Content Security Policy (CSP):
A) Is a paid product
B) A browser-enforced policy declaring which sources of scripts, styles, images, etc. are allowed — a powerful defense in depth against XSS when configured carefully
C) Replaces HTTPS
D) Is server-only

**62.** HTTPS is necessary because:
A) Branding
B) Without it, traffic can be read and tampered with in transit, and many browser features (service workers, geolocation, HTTP/2) require it
C) Search ranking only
D) HTTP is fine for production

**63.** Authentication versus authorization:
A) Are the same
B) Authentication is verifying who you are; authorization is what you are allowed to do — confusing them produces real security holes
C) Authentication is harder
D) Authorization is for admins only

**64.** A common authorization bug pattern is:
A) Slow checks
B) Checking authorization only on the UI (hiding buttons) without enforcing it on the server — anyone who hits the endpoint directly bypasses the "check"
C) Using JWTs
D) Using cookies

**65.** An OAuth 2.0 flow at a high level is roughly:
A) The client receives the password
B) The client redirects the user to the authorization server; user authorizes; client receives a short-lived authorization code; client exchanges code for tokens at the token endpoint
C) The server stores passwords
D) The user enters their token

**66.** Secrets in frontend code:
A) Are fine if the code is minified
B) Are public — any string in a JavaScript bundle can be read; secrets that grant access (private API keys, database creds) must never be in client code
C) Are encrypted by the bundler
D) Are protected by HTTPS

**67.** A public API key (e.g., a publishable Stripe key, a Google Maps key with referrer restrictions):
A) Is the same as a secret key
B) Is intentionally exposed; safety relies on server-side controls and key restrictions (allowed referrers, scopes), not secrecy
C) Should never be used
D) Encrypts requests

**68.** Logging sensitive data (passwords, tokens, PII):
A) Is fine in dev
B) Is a recurring source of breaches; scrub or redact before logging, and audit log destinations and retention
C) Is required for debugging
D) Cannot be helped

**69.** A dependency in your `package.json` is, from a security standpoint:
A) Inert
B) Code you are choosing to run with the same privileges as your own code; a compromised dependency is a compromise of your application — audit, lock, and update deliberately
C) Sandboxed
D) Scanned by npm

**70.** A senior frontend engineer's responsibility for security:
A) Is limited to escaping output
B) Extends to understanding the threat model of the features they build, escalating concerns about flows they cannot verify, and writing code that does not casually undermine the protections the rest of the stack provides
C) Is the security team's job only
D) Is to install scanners

---

## Section F — Deployment, Operations, and Observability (Q71–Q83)

**71.** Continuous Integration (CI) means:
A) Constant deploys
B) Every change is built and tested automatically when pushed, so problems are caught early — the foundation everything else builds on
C) Automatic merging
D) A faster IDE

**72.** Continuous Deployment versus Continuous Delivery:
A) Are the same
B) Continuous Delivery: every commit that passes CI is deployable; Continuous Deployment: every commit that passes CI is actually deployed automatically — the second requires very strong test and monitoring discipline
C) Delivery is older
D) Deployment is for backend only

**73.** A build artifact (a bundled JS file, a Docker image) should:
A) Be rebuilt at each environment
B) Be built once, then promoted unchanged through environments (dev → staging → production) — rebuilding per environment introduces drift and "works in staging" surprises
C) Always be different per environment
D) Be edited before deploy

**74.** Environment configuration (API URLs, feature flags, secrets) should be:
A) Hardcoded in the build
B) Injected at runtime (or at deploy time) so the same artifact can target multiple environments, with secrets stored in a secrets manager, not the repo
C) Stored in localStorage
D) Read from query params

**75.** A "blue-green" deployment:
A) Means colors of dashboards
B) Runs two identical environments; one serves traffic while the other is updated, then traffic is switched — rollback is instant
C) Is for databases only
D) Is a build tool

**76.** A "canary" release:
A) Is unsafe
B) Sends a small percentage of traffic to the new version while watching metrics; if healthy, the percentage increases — limits blast radius of a bad release
C) Is the same as blue-green
D) Replaces feature flags

**77.** A frontend feature behind a flag, dark-launched (deployed but inactive):
A) Is wasteful
B) Lets the team validate that the code does no harm in production before any user sees the feature, then turn it on with confidence
C) Breaks tests
D) Is for backend only

**78.** Logging from the frontend:
A) Is unnecessary
B) Is valuable when paired with a destination that can be searched and alerted on; structured logs (with consistent fields) are far more useful than free-form strings
C) Is the same as console.log
D) Slows the page

**79.** Error monitoring (Sentry, Rollbar, equivalent):
A) Replaces testing
B) Captures uncaught client-side errors with stack traces, browser/OS context, and user actions — essential for catching the bugs that only happen in production
C) Is for backend
D) Is optional even at scale

**80.** Source maps in production error monitoring:
A) Should never be uploaded
B) Should be uploaded privately to the monitor so production stack traces are debuggable, without exposing them to the public
C) Are the same as logs
D) Have no value

**81.** A "p95" or "p99" latency metric:
A) Means the average
B) Means 95% (or 99%) of requests were faster than this value — averages hide tail behavior, and tail latency is what most users perceive as "slow"
C) Is for storage
D) Is for tests

**82.** When an incident happens, the senior's first responsibility is:
A) Find blame
B) Stop the bleeding (mitigate impact, often by rolling back), then diagnose, then learn — blameless postmortems separate cause from blame
C) Write a postmortem
D) Notify customers immediately

**83.** A senior frontend engineer who has never seen a deploy log, a production error report, or a real on-call rotation:
A) Is fine — that is the backend's job
B) Is missing context they need; even if they do not own deploys, they should understand how their code reaches production and how it fails there
C) Is more productive
D) Is normal

---

## Section G — Senior Judgment, Collaboration, and Architecture (Q84–Q100)

**84.** A junior on your team asks for a code review on a confused PR. The senior response is:
A) Reject and tell them to start over
B) Engage charitably — diagnose what they were trying to do, point to the right path, leave them with a clearer next step rather than just "this is wrong"
C) Approve to be kind
D) Ignore until standup

**85.** A peer engineer disagrees with your design. The healthy response is:
A) Defend at all costs
B) Listen for what they see that you do not; if they convince you, update the design; if they do not, explain your reasoning and accept that they may still think you are wrong
C) Escalate immediately
D) Implement both

**86.** A "scope creep" risk on a feature is best handled by:
A) Saying no to everything
B) Being explicit about what is in and out of scope, surfacing creep as it happens, and renegotiating openly rather than silently extending the timeline
C) Working overtime
D) Cutting tests

**87.** Choosing between two technical approaches with similar trade-offs:
A) Pick the newer one
B) Default to the one your team will be best able to maintain — familiarity, ecosystem maturity, and operational experience often beat marginal technical superiority
C) Pick the harder one
D) Pick the more popular one

**88.** Introducing a new dependency or framework to the codebase:
A) Should be unilateral
B) Should be discussed with the team, justified against alternatives, and evaluated for maintenance and migration cost — not just shipped because you liked it
C) Should be the senior's choice alone
D) Is automatic

**89.** A junior implements a feature with a clever pattern you would not have used. The senior considers:
A) Whether it is "their way"
B) Whether it works, whether it is readable, whether it is maintainable — clever is not the bar; clear is
C) Whether it is shorter
D) Whether it is faster

**90.** A working relationship with a backend engineer is healthiest when:
A) You stay out of each other's lanes
B) You collaborate early on the data contract, push back on each other's ideas substantively, and share ownership of the end-to-end feature
C) You communicate only through tickets
D) You let them lead

**91.** A working relationship with a designer is healthiest when:
A) You implement whatever they hand over
B) You engage early on feasibility, raise accessibility and edge-case concerns constructively, and treat the design as a starting point for collaboration — not as a spec to follow blindly or override unilaterally
C) You redesign as you build
D) You wait for sign-off

**92.** A working relationship with a product manager is healthiest when:
A) You implement whatever they prioritize
B) You understand the business goal behind the request, push for clarity on the "why," surface technical implications and alternatives, and own the "how" together with them
C) You take direction silently
D) You decide the roadmap

**93.** When estimating, a senior:
A) Quotes a single date
B) Quotes ranges, names the assumptions and risks, and updates the estimate as those become clearer — and is willing to say "I do not know yet, give me a day to investigate"
C) Promises optimistically
D) Refuses to estimate

**94.** A senior's first reaction to a chaotic incident is:
A) Panic
B) Steady — gather facts, stabilize, communicate clearly, prioritize ruthlessly; the team takes its cue from how the senior behaves under pressure
C) Blame
D) Wait

**95.** Saying "I do not know, let me find out" as a senior:
A) Is unprofessional
B) Is a strength — pretending to know is the more dangerous habit, and juniors model what they see
C) Is rare
D) Should be hidden

**96.** A senior who micromanages junior code line by line:
A) Is doing their job
B) Is failing to develop the team — review for correctness and growth, not for stylistic uniformity, and let juniors make recoverable mistakes
C) Saves time
D) Reduces bugs

**97.** A senior who is afraid to ship anything below a perfect bar:
A) Has high standards
B) Is often the bottleneck of their team — done and out is usually better than perfect and pending, and "perfect" rarely survives contact with real users
C) Is the gold standard
D) Should be promoted

**98.** A senior who only thinks about their own tickets:
A) Is focused
B) Is missing half the job — at this level, your work includes raising the team's level, reviewing thoughtfully, mentoring, and contributing to shared infrastructure
C) Is efficient
D) Is correct

**99.** The single trait that most distinguishes a Senior 1 from a strong Junior 3 is:
A) Years of experience
B) Judgment — knowing not just **how** to do things, but **whether** they should be done, **when**, and at **what cost** — applied across a broader surface area than their original specialty
C) Speed
D) Specialization depth

**100.** A frontend Junior 3 who passes this exam is signaling:
A) That they know everything
B) That they have done the broadening work to operate as a generalist senior — and that their frontend depth is now a strength they bring to a broader role, not the only thing they have to offer
C) That they should specialize harder
D) That they are ready to be a manager

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

*Administrator's note: This is the convergence exam, and it is intentionally hard for a candidate who has lived only inside frontend. A frontend Junior 3 who scores 70-80 on this exam is not a failure — they are someone who has done the depth work and now needs to do the breadth work. Coach them, give them assignments that stretch into backend and infrastructure adjacency, and re-sit them in six months. A candidate who barely scrapes 89 on this exam will struggle as a Senior 1, because the role demands the breadth the exam tests for, every day.*
