# Promotion Exam 04 — Junior Engineer 3 → Senior Engineer 1

**Format:** 100 multiple-choice questions, one correct answer each.
**Time limit (suggested):** 150 minutes.
**Passing score:** 89 / 100.
**Scope:** Design principles (SOLID, DRY, KISS, YAGNI), design patterns, API design, advanced React, caching strategies, observability, security (OWASP-aware), containers and CI/CD, deeper databases, and engineering judgment. The bar for Senior 1 is "owns a system component, makes sensible design decisions, and pulls others up with code review."

---

## Section A — Design Principles and Patterns (Q1–Q20)

**Q1.** What does the "S" in SOLID stand for?
A) Stateful Programming
B) Single Responsibility Principle — a module should have one reason to change
C) Simple Inheritance Design
D) Stateless Object Definition

**Q2.** Which of these *best* expresses the Open/Closed Principle?
A) Modules should be closed to all changes
B) Modules should be open to extension and closed to modification
C) Modules should be closed to extension and open to modification
D) Use `final` everywhere

**Q3.** Liskov Substitution Principle says:
A) Subtypes must be substitutable for their base types without breaking behavior
B) Subtypes should override every method
C) Subtypes can refuse base contracts
D) Subtypes should be smaller in memory

**Q4.** Interface Segregation Principle says:
A) Use as few interfaces as possible
B) Clients should not be forced to depend on interfaces they do not use; prefer many small interfaces over one fat one
C) All interfaces must extend a base interface
D) Interfaces are obsolete

**Q5.** Dependency Inversion Principle says:
A) High-level modules should depend on abstractions, not on low-level concrete details
B) Low-level modules should depend on high-level ones
C) Inversion of control is illegal in JavaScript
D) The DOM should depend on the network layer

**Q6.** YAGNI stands for:
A) You Are Going Native, Inevitably
B) You Aren't Gonna Need It — do not build for speculative future needs
C) Yet Another Generic Network Interface
D) Yield And Get New Input

**Q7.** Which of these is most consistent with KISS?
A) Add layers of abstraction now, "just in case"
B) Prefer the simplest design that meets the requirements
C) Use design patterns everywhere
D) Generic everything

**Q8.** Which scenario most justifies a *Strategy* pattern?
A) You need to swap an algorithm at runtime (e.g., different pricing strategies)
B) You need a singleton
C) You need to log
D) You need to throttle

**Q9.** Which pattern decouples senders from receivers via a queue or bus of messages?
A) Singleton
B) Observer / Publish-Subscribe
C) Adapter
D) Visitor

**Q10.** Which pattern is most appropriate when integrating an existing class with an incompatible interface?
A) Factory
B) Adapter
C) Decorator
D) Mediator

**Q11.** Which pattern is best for building objects with many optional fields step by step?
A) Builder
B) Singleton
C) Proxy
D) State

**Q12.** What is a common downside of the Singleton pattern?
A) It is too fast
B) It introduces hidden global state, complicates testing, and can create lifecycle issues
C) It cannot store data
D) It is not object-oriented

**Q13.** What is "composition over inheritance"?
A) Avoiding all inheritance and using composition where it fits, to reduce tight coupling
B) Composing songs about your code
C) Multiple inheritance
D) Using mixins for everything

**Q14.** Which is a healthy use of inheritance?
A) Sharing implementation arbitrarily
B) Modeling a clear, stable "is-a" relationship with a well-defined contract
C) Avoiding code duplication at all costs
D) Replacing interfaces

**Q15.** The *Law of Demeter* essentially says:
A) Talk only to your immediate friends; avoid chains like `a.b.c.d.e()`
B) Inherit from at most one class
C) Use exactly one design pattern per file
D) Always pass objects by value

**Q16.** What is "dependency injection"?
A) A vulnerability in npm
B) Providing a component's dependencies from the outside rather than constructing them internally, easing testing and decoupling
C) A type of polymorphism
D) A bundler feature

**Q17.** Which of these is a *good* signal that an abstraction is the wrong shape?
A) Two callers need wildly different behaviors and you keep adding flags or branches inside the abstraction
B) The abstraction has fewer than 3 lines
C) The abstraction is typed
D) The abstraction has tests

**Q18.** "Premature abstraction" usually leads to:
A) Cleaner code forever
B) Wrong abstractions that are harder to refactor than the duplication they were meant to remove
C) Better performance
D) Smaller bundles

**Q19.** "Rule of three" suggests:
A) Refactor a duplication into an abstraction only after it appears at least three times in slightly different forms
B) Every function should have at most three lines
C) Three is the maximum nesting level
D) Use three design patterns per file

**Q20.** Which of these is the *best* test of a design decision?
A) It impresses other engineers
B) It satisfies the requirements, is reasonably simple, supports likely change, and the team can maintain it
C) It uses the newest framework
D) It is identical to what a popular blog suggests

---

## Section B — API Design and Contracts (Q21–Q40)

**Q21.** Which is true about good REST URI design?
A) URIs should be verbs
B) URIs should identify resources (nouns), with actions expressed by HTTP methods
C) Always include the action in the path: `/getUsers`
D) Mix singular and plural at random

**Q22.** Which of these is the most idiomatic REST endpoint to list a user's orders?
A) `GET /getUserOrders?id=123`
B) `GET /users/123/orders`
C) `POST /orders/list`
D) `GET /orders?action=list&user=123`

**Q23.** Which is appropriate for "create an order for user 123"?
A) `POST /users/123/orders`
B) `PUT /orders/create/123`
C) `GET /createOrder?user=123`
D) `DELETE /orders/123`

**Q24.** Which status code should an idempotent `PUT` typically return on a successful create or full replace?
A) 200 (with body) or 201 if a new resource was created
B) 500 always
C) 400 always
D) 204 only

**Q25.** What is the *strongest* argument for paginating list endpoints?
A) It looks fancy
B) Bounded response size, predictable performance, and protection against scanning entire tables
C) It increases throughput
D) Smaller URLs

**Q26.** Which pagination strategy generally scales better for very large data sets?
A) Offset/limit
B) Cursor-based (keyset) pagination
C) Random offset
D) Returning all rows in one page

**Q27.** What is the value of API *versioning*?
A) Marketing
B) Allowing breaking changes without breaking existing clients
C) Required by HTTP
D) None; APIs never break

**Q28.** Which is *the* most common API versioning approach?
A) URL path versioning, e.g., `/v1/...`, `/v2/...`
B) Header-based versioning, e.g., `Accept: application/vnd.app.v2+json`
C) Query parameter, e.g., `?v=2`
D) All of the above are used in the wild, each with trade-offs

**Q29.** What is *consumer-driven contract testing*?
A) Marketing tests
B) Tests where the consumer expresses expectations against the API, and the provider verifies them
C) Load tests
D) Smoke tests

**Q30.** Which of these is a good reason to choose GraphQL over REST?
A) Clients need flexible field selection, the data graph has many relations, and you want to minimize over- and under-fetching
B) You want simpler caching out of the box
C) You don't like JSON
D) GraphQL is always faster

**Q31.** Which of these is a *trade-off* of GraphQL vs REST?
A) Caching is more nuanced (no free HTTP-level caching by URL), N+1 risk on resolvers, and authorization needs careful per-field design
B) GraphQL is impossible to use with TypeScript
C) GraphQL cannot be paginated
D) GraphQL requires Java

**Q32.** Which is the best way to evolve a REST API without breaking clients?
A) Rename fields silently
B) Add new fields/endpoints; deprecate old ones with clear timelines and communication
C) Change response shapes whenever convenient
D) Return different shapes per IP

**Q33.** Which header lets clients cache responses based on freshness rules set by the server?
A) `Cookie`
B) `Cache-Control`
C) `Authorization`
D) `Content-Type`

**Q34.** What does `ETag` enable?
A) Compression
B) Conditional requests with `If-None-Match`, returning `304 Not Modified` when content has not changed
C) Authorization
D) Pagination

**Q35.** Which is true about idempotency keys for `POST` requests?
A) They are not needed
B) Sending an idempotency key lets the server safely deduplicate retries that would otherwise create duplicate side effects
C) They are only used for GET
D) They are part of HTTP/3 only

**Q36.** When designing an API that will be consumed by many clients, which of these is the strongest principle?
A) Convenience for the server team
B) Be conservative in what you send, be liberal in what you accept (Postel's principle — but apply with care, especially for security)
C) Trust all input
D) Always return 200

**Q37.** Which of these is a *minimum* viable error response from a well-designed API?
A) `{ "error": "something went wrong" }`
B) A stable error code, human-readable message, and (when safe) a correlation/request ID
C) A stack trace in production
D) HTML

**Q38.** Which is the best behavior when an endpoint may take a long time to complete?
A) Block the client for minutes
B) Either stream responses, or return a job/operation ID with a status endpoint (async pattern)
C) Time out without notice
D) Loop indefinitely

**Q39.** Which of these is the best definition of an "anti-corruption layer"?
A) A bug
B) A layer that translates between your domain model and an external system so external concepts do not leak into your core
C) Antivirus middleware
D) A CDN feature

**Q40.** Which of these is most consistent with good API security?
A) Trust the client
B) Always authenticate, authorize per request, validate input on the server, rate-limit, and never rely solely on the frontend for checks
C) Validate only on the frontend
D) Use HTTP

---

## Section C — Caching, Performance, and Observability (Q41–Q60)

**Q41.** What does *caching* trade?
A) Memory and freshness for speed
B) Speed for correctness only
C) Network for CPU only
D) Nothing — it is free

**Q42.** Which of these is the *hardest* part of caching?
A) Choosing memory size
B) Invalidation — knowing when cached data is stale
C) Picking a key prefix
D) Pretty printing JSON

**Q43.** Which caching strategy is "fetch from cache; on miss, load from source and populate the cache"?
A) Write-through
B) Write-behind
C) Cache-aside (lazy)
D) Read-through proxy

**Q44.** Which strategy writes to cache and source simultaneously?
A) Write-around
B) Write-through
C) Write-behind
D) Cache-aside

**Q45.** Which strategy buffers writes in cache and flushes to source asynchronously?
A) Write-behind (write-back)
B) Write-through
C) Cache-aside
D) Read-through

**Q46.** Which of these is the most reasonable cache key for a per-user profile API?
A) `profile`
B) `user:{userId}:profile:v1`
C) `data`
D) Random UUID

**Q47.** Why might a TTL on a cache entry be a good idea?
A) Prevents the universe from collapsing
B) Bounds staleness even if invalidation is missed
C) Saves bandwidth in CSS
D) Increases hit rate

**Q48.** Which is the typical effect of *cache stampede*?
A) Many concurrent misses hit the source simultaneously, overloading it
B) A cache is too cold
C) The CDN warms up
D) Memory fragmentation

**Q49.** Which is a common mitigation for cache stampede?
A) Request coalescing / single-flight, jittered TTLs, or pre-warming
B) Disabling caching
C) Increasing the cache TTL to infinity
D) Removing rate limits

**Q50.** Which is the *first* thing to do when "the app is slow"?
A) Rewrite everything in Rust
B) Measure — profile to find where time is actually spent
C) Add caching everywhere
D) Add more servers

**Q51.** Which is true about premature optimization?
A) It is the root of all evil only sometimes; it should be guided by measurement
B) Always optimize before correctness
C) Optimize randomly
D) Optimization is unnecessary

**Q52.** Which is the *best* indicator of frontend performance for a user?
A) Bundle size in MB
B) Real user metrics like Largest Contentful Paint, Interaction to Next Paint, and CLS
C) GitHub stars
D) Number of components

**Q53.** Which is most likely to *worsen* Time to Interactive?
A) Code splitting
B) Loading too much JavaScript on the initial route
C) Tree shaking
D) Image lazy loading

**Q54.** What is the difference between *latency* and *throughput*?
A) Same thing
B) Latency is time-per-request; throughput is requests-per-second
C) Latency is bytes; throughput is seconds
D) Latency is only network

**Q55.** Which is a valid reason to use a CDN?
A) Bring static assets closer to users, offload bandwidth, and cache at the edge
B) Hide bugs
C) Replace a database
D) Make code TypeScript

**Q56.** What are the three classic "pillars" of observability?
A) Logs, metrics, and traces
B) Dashboards, alerts, and pages
C) CPU, memory, and disk
D) HTTP, gRPC, and WebSocket

**Q57.** Which of these is the most useful kind of log for incident debugging?
A) Free-form prose
B) Structured logs with consistent fields like timestamp, level, request ID, user ID, and error
C) `console.log("hi")`
D) Logs without timestamps

**Q58.** What is a "trace" in distributed tracing?
A) A stack trace from one process
B) The end-to-end record of a request across services, composed of spans, useful for finding latency hot spots
C) A type of memory dump
D) A CI artifact

**Q59.** What is an SLI, SLO, and SLA respectively?
A) Service Level Indicator (measurement), Objective (internal target), Agreement (external promise)
B) Same Level of Importance, Order, Application
C) Service Latency Index, Output, Allotment
D) Standards Library Imports

**Q60.** Which is the best alerting practice?
A) Alert on every log
B) Alert on user-visible symptoms and burn rates against SLOs, not on raw metric thresholds with no context
C) Alert only the on-call's manager
D) No alerts; check dashboards manually

---

## Section D — Security at the Senior 1 Level (Q61–Q75)

**Q61.** OWASP Top 10 most commonly highlights which class as top-tier risk?
A) Broken Access Control
B) Outdated CSS
C) Slow JavaScript
D) Missing favicons

**Q62.** Which of these is the *best* defense against XSS in a modern frontend?
A) Sanitize all input on the client only
B) Render through frameworks that escape by default, avoid `dangerouslySetInnerHTML` / `v-html` with untrusted input, and apply CSP
C) Disable JavaScript
D) Run XSS payloads in dev only

**Q63.** Which is true about Content Security Policy?
A) It is a magic switch
B) A CSP, when well-configured, restricts which sources of script, style, and other resources can run, reducing XSS impact
C) CSP replaces authentication
D) CSP is only for cookies

**Q64.** Which of these is the best defense against CSRF for cookie-based sessions?
A) `SameSite=Lax/Strict` cookies, anti-CSRF tokens for sensitive state-changing endpoints, and verifying `Origin`/`Referer`
B) Just HTTPS
C) Storing tokens in `localStorage`
D) Disabling cookies

**Q65.** Why must you *never* trust the frontend for authorization?
A) The frontend is slow
B) Any check that runs only in the browser can be tampered with; authorization must be enforced server-side
C) The frontend cannot store data
D) The frontend cannot read cookies

**Q66.** Which is true about handling secrets?
A) Commit them; just use a private repo
B) Keep them out of source, rotate regularly, use a secrets manager, scope them tightly
C) Hash them and commit
D) Store them in `localStorage` for convenience

**Q67.** Which of these is a classic IDOR (Insecure Direct Object Reference)?
A) `GET /api/orders/123` returns user A's order to user B because the server only checks "logged in", not "owns this order"
B) A 404 page
C) A slow query
D) A missing index

**Q68.** Which is the best defense against IDOR?
A) Obscure URLs
B) Enforce per-resource authorization on the server, scoping queries by the authenticated subject
C) Use UUIDs
D) Hide the URL with JavaScript

**Q69.** Which is the best practice for storing passwords?
A) Plain text for support
B) bcrypt/scrypt/Argon2 with sensible work factors and unique salts; never your own crypto
C) AES encryption
D) SHA-256 without salt

**Q70.** Which is the typical defense against brute-force login?
A) Strong password requirements alone
B) Rate limiting, account lockouts / exponential backoff, CAPTCHAs, and 2FA
C) Hiding the login form
D) Lowercasing usernames

**Q71.** Why is "security through obscurity" insufficient?
A) It is sufficient
B) Once the obscure detail is known, security collapses; security must be designed assuming attackers know your design
C) Because of TypeScript
D) Because of HTTPS

**Q72.** Which is the best practice for handling file uploads?
A) Trust the file extension
B) Validate type and size server-side, scan if needed, store outside the web root, serve with safe content-type, and avoid executing user-uploaded content
C) Trust the MIME type sent by the client
D) Store everything in the database as base64

**Q73.** Which of these is true about HTTPS?
A) It encrypts data in transit and authenticates the server; it does *not* protect against application-level bugs
B) It makes the application immune to XSS
C) It is optional in production
D) It replaces authentication

**Q74.** Which is the best response to a security report from a researcher?
A) Threaten legal action
B) Acknowledge quickly, investigate, fix, communicate timelines, and coordinate disclosure
C) Ignore it
D) Mark the email as spam

**Q75.** Which is the best stance on dependency security?
A) Update everything blindly
B) Monitor advisories, track direct and transitive deps, update with discipline, and minimize attack surface
C) Never update
D) Pin everything to old versions forever

---

## Section E — Containers, Build, Deploy, and Databases at Scale (Q76–Q100)

**Q76.** What is a Docker *image*?
A) A running process
B) An immutable filesystem snapshot plus metadata used to launch containers
C) A VM
D) A registry

**Q77.** What is a *container*?
A) A VM
B) An isolated process based on an image, sharing the host kernel
C) A function
D) A network interface

**Q78.** Which of these is a sensible Dockerfile practice?
A) Run as root for simplicity
B) Use small base images, run as non-root, leverage multi-stage builds, and order instructions for cache efficiency
C) Copy the entire repo unconditionally first
D) Avoid `.dockerignore`

**Q79.** Which of these is the *primary* benefit of multi-stage Docker builds?
A) Faster networks
B) Build artifacts can be produced in a heavy "builder" stage and copied into a small runtime image, reducing size and attack surface
C) Required for Kubernetes
D) Multi-arch only

**Q80.** What is Kubernetes, at a high level?
A) A programming language
B) An orchestrator for containerized workloads, providing scheduling, scaling, networking, and self-healing
C) A database
D) A CI server

**Q81.** Which of these is the *first* concern when adopting Kubernetes for a small team?
A) Operational overhead vs. team capacity; do not adopt unless the complexity is justified
B) Picking the prettiest dashboard
C) Avoiding Docker
D) Using only one node

**Q82.** What does "blue/green deployment" mean?
A) Picking a color palette
B) Running two parallel environments (one live, one staging); switching traffic atomically when the new version is ready
C) Two-tone hardware
D) A type of code review

**Q83.** What does "canary deployment" mean?
A) Releasing only on Fridays
B) Rolling out a new version to a small fraction of users/servers first, monitoring, and progressing if healthy
C) Releasing only to staging
D) A type of test

**Q84.** Which of these is a sensible CI pipeline for a typical web service?
A) Run lints, type checks, unit tests, build, run integration tests, build container, security scan, publish artifact
B) Skip tests to be faster
C) Only run E2E
D) Run all tests in production

**Q85.** Which is true about database connection pools?
A) Bigger is always better
B) Pool size should match your concurrency model and the DB's capacity; oversized pools cause contention and DB overload
C) Pools are not needed
D) Pools replace transactions

**Q86.** Why is "long-running transaction" usually an anti-pattern?
A) It is fine
B) It holds locks and resources, increases deadlocks, blocks vacuum/replication, and worsens contention
C) It is required by ACID
D) It improves consistency

**Q87.** Which is the best practice for handling a slow query?
A) Add more servers
B) Profile with `EXPLAIN`/query plan; consider indexes, query rewrites, denormalization, or caching, based on actual cost
C) Wrap it in a transaction
D) Run it in a loop

**Q88.** Which of these statements is true about database normalization?
A) Always normalize to 5NF
B) Normalize to reduce duplication and update anomalies; denormalize *deliberately* for read performance when justified
C) Avoid normalization always
D) Normalization is only for NoSQL

**Q89.** Which of these is a typical sign you need *read replicas*?
A) Read-heavy workload near the primary's capacity, and the application can tolerate small replication lag
B) Read-heavy workload that must be strictly consistent at all times with zero lag
C) Write-heavy workload only
D) Empty database

**Q90.** Which of these is true about *sharding*?
A) It is automatic in every DB
B) It partitions data by a key across nodes to scale writes; choice of shard key has lasting consequences
C) It improves consistency
D) It removes the need for indexes

**Q91.** Which is true about eventual consistency?
A) Reads always see the latest write immediately
B) Updates propagate over time; reads may see stale data for a window — acceptable for many workloads, not all
C) It is a bug
D) Same as strong consistency

**Q92.** What is the CAP theorem at a Senior 1 level?
A) In a partition, a distributed system must choose between consistency and availability; it is not a "pick two" license
B) You can have consistency, availability, and partition tolerance simultaneously always
C) CAP only applies to caches
D) CAP is about CPU, Algorithm, Performance

**Q93.** Which of these is the *best* description of "back pressure"?
A) Pushing harder when systems slow down
B) Signaling upstream producers to slow down when downstream cannot keep up, to prevent collapse
C) A type of cache
D) HTTP/2 priority

**Q94.** Which is the best approach to *retries* for a transient remote failure?
A) Tight loop with no delay
B) Exponential backoff with jitter, capped attempts, and idempotency considerations
C) Retry forever
D) Always retry on 4xx errors

**Q95.** Which is true about 4xx vs 5xx for retries?
A) Retry 4xx blindly
B) Generally do not auto-retry 4xx (client errors); 5xx and certain timeouts may be retried with care
C) Retry both equally
D) Never retry anything

**Q96.** Which is a healthy view of *feature flags* at this level?
A) Use them ad-hoc; never clean up
B) Treat them as code: own them, default safely, monitor them, and remove flags after the rollout settles
C) Avoid them
D) Use them to bypass code review

**Q97.** Which is the most important behavior of a Senior 1 code reviewer?
A) Style-only nits
B) Focus on correctness, design, tests, security, and tradeoffs; teach with comments; approve with confidence or escalate clearly
C) Approve everything quickly to be liked
D) Block everything to seem strict

**Q98.** Which of these best describes "ownership" at Senior 1?
A) You only own your own diff
B) You feel responsible for the *system* you work on — its reliability, security, docs, runbooks, and on-call experience
C) You wait for instructions
D) You delegate everything

**Q99.** Which is the most useful thing to do *before* writing a non-trivial design?
A) Start coding immediately
B) Write a short design doc that states the problem, constraints, options, chosen approach, and trade-offs — and seek review
C) Schedule a meeting only
D) Open a PR with the entire feature

**Q100.** Which is the *best* sign that someone is ready for Senior 1?
A) Memorizing many design patterns
B) Independently delivering medium-to-large changes safely, mentoring juniors, raising the team's bar in reviews, and exercising sound judgment on trade-offs
C) Being the loudest in meetings
D) Knowing every keyboard shortcut

---

## Answer Key

1.B  2.B  3.A  4.B  5.A  6.B  7.B  8.A  9.B  10.B
11.A  12.B  13.A  14.B  15.A  16.B  17.A  18.B  19.A  20.B
21.B  22.B  23.A  24.A  25.B  26.B  27.B  28.D  29.B  30.A
31.A  32.B  33.B  34.B  35.B  36.B  37.B  38.B  39.B  40.B
41.A  42.B  43.C  44.B  45.A  46.B  47.B  48.A  49.A  50.B
51.A  52.B  53.B  54.B  55.A  56.A  57.B  58.B  59.A  60.B
61.A  62.B  63.B  64.A  65.B  66.B  67.A  68.B  69.B  70.B
71.B  72.B  73.A  74.B  75.B  76.B  77.B  78.B  79.B  80.B
81.A  82.B  83.B  84.A  85.B  86.B  87.B  88.B  89.A  90.B
91.B  92.A  93.B  94.B  95.B  96.B  97.B  98.B  99.B  100.B

**Passing threshold: 89 / 100.**
