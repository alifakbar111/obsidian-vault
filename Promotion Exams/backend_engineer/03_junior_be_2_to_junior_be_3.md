# Promotion Exam: Junior Backend Engineer 2 → Junior Backend Engineer 3

**Track:** Backend Engineer (Specialist)
**Format:** 100 multiple-choice questions
**Time:** 150 minutes
**Passing score:** 89 / 100

**Scope.** Junior Backend Engineer 3 is the top of the specialist track before the ladder converges into the generalist senior level. A Junior 3 should take medium-sized backend features from spec to production with minimal supervision, contribute meaningfully to design discussions, mentor interns and Junior 1s, write code other juniors can learn from, and have early architectural instincts. This exam tests the depth that gap requires: concurrency and async patterns at scale, database design and query performance, API design that survives real clients, authentication and authorization done correctly, caching strategy, background jobs and queues, observability beyond `console.log`, testing strategy beyond unit tests, performance awareness under measurement, security across multiple OWASP categories, and the early signs of judgment.

**Reminder.** This is the last specialist-only backend exam. After this, the Junior 3 → Senior 1 convergence exam tests whether the candidate has broadened beyond backend into the full generalist senior expectation. A candidate who passes this exam at 90+ but cannot explain a re-render, browser caching, or a layout shift will struggle at the next gate. That is by design.

---

## Section A — Concurrency and Async at Scale (Q1–Q12)

**1.** Running a large batch of HTTP calls with `Promise.all`:
A) Is always optimal
B) Fires all calls concurrently with no upper bound — easy to overwhelm the target service, your sockets, or your memory; bound concurrency with a controlled pool
C) Runs them sequentially
D) Is the same as a loop with `await`

**2.** A controlled-concurrency pool (e.g., process at most 10 in flight):
A) Slows everything down
B) Smooths throughput, respects downstream limits, and keeps memory predictable — usually a better default for non-trivial batch work than unbounded `Promise.all`
C) Is unnecessary
D) Replaces queues

**3.** Exponential backoff for retries:
A) Retries at fixed intervals
B) Increases the delay between retries (often with jitter) to avoid thundering-herd retries that hammer a recovering service
C) Retries faster each time
D) Is the same as polling

**4.** Jitter in retry timing:
A) Is decorative
B) Randomizes delays so many clients do not retry at the same instant — without it, recovering services often get knocked back down
C) Reduces correctness
D) Is for tests only

**5.** Retrying a failed request automatically should:
A) Always happen
B) Be bounded (max attempts), use backoff with jitter, distinguish retryable from non-retryable errors (5xx and network yes, 4xx usually no), and respect idempotency
C) Be infinite
D) Apply to writes the same as reads

**6.** A timeout on an outbound call:
A) Should be omitted
B) Is essential — without one, a slow downstream service can hold your request handlers indefinitely, exhausting resources
C) Should be very long always
D) Is automatic

**7.** A circuit breaker:
A) Cuts the power
B) A pattern that stops calling a failing dependency after a threshold of failures, returning fast errors and giving the dependency time to recover, then probing to reclose
C) Is the same as a retry
D) Is unsafe

**8.** A race condition in async code:
A) Cannot happen in single-threaded JavaScript
B) Can absolutely happen — interleaved async operations can read stale state and write conflicting updates, especially around external resources like databases
C) Only happens with threads
D) Is the same as a deadlock

**9.** Pessimistic locking versus optimistic locking:
A) Are the same
B) Pessimistic locks acquire a database row lock during the read so others wait; optimistic locking reads a version, then updates only if the version is unchanged, retrying otherwise — choose by contention pattern
C) Optimistic is always faster
D) Pessimistic is deprecated

**10.** Memory leaks in long-running services often come from:
A) Garbage collection bugs
B) Unbounded growth — caches without eviction, timers never cleared, event listeners never removed, large objects retained by closures
C) Database queries
D) HTTPS

**11.** Backpressure:
A) Is a frontend concept
B) When a producer is faster than a consumer, the system should signal "slow down" rather than queue infinitely — streams, queues, and well-designed APIs all need a backpressure story
C) Replaces caching
D) Is automatic

**12.** A long-running operation triggered by an HTTP request:
A) Should block the response
B) Should typically be enqueued for background processing, with the response returning an acceptance (202) and a way to poll or be notified of completion
C) Should hold the connection for hours
D) Is impossible

---

## Section B — Database Design and Performance (Q13–Q27)

**13.** Normalization:
A) Is always best
B) Reduces redundancy by splitting data into related tables; useful for write integrity but sometimes traded against for read performance
C) Slows reads
D) Means encryption

**14.** Denormalization:
A) Is a mistake
B) Deliberately duplicates data to speed up reads, at the cost of write complexity and consistency risk; appropriate in specific high-read scenarios
C) Is always faster
D) Is decorative

**15.** Choosing between `INT`, `BIGINT`, and `UUID` for primary keys:
A) Is a style preference
B) Has real trade-offs: ints are compact and naturally ordered (great for indexes), UUIDs avoid coordination across services but hurt index locality unless using time-ordered variants (UUIDv7, ULID)
C) UUIDs are always best
D) Ints are deprecated

**16.** A clustered index:
A) Has nothing to do with order
B) Orders the table's rows physically by the index key (in databases that support this concept) — usually the primary key; affects insert and range-scan performance
C) Is the same as a secondary index
D) Is always desirable to have on every column

**17.** Indexes on every column:
A) Are best practice
B) Slow down writes substantially (every write maintains every index) and consume disk; add indexes deliberately, based on actual query patterns
C) Are free
D) Replace query planning

**18.** Covering an index:
A) Indexes a single column
B) Includes all columns needed by a query (key + included columns), letting the database satisfy the query from the index alone without visiting the table
C) Is deprecated
D) Replaces transactions

**19.** A query that uses `LIKE '%foo%'`:
A) Uses the index efficiently
B) Cannot generally use a standard B-tree index because of the leading wildcard; consider full-text search, trigram indexes, or a dedicated search engine
C) Is the same as exact match
D) Forbids matches

**20.** Pagination via `OFFSET N LIMIT M` on a large table:
A) Is fast regardless of N
B) Gets slower as N grows because the database must scan and skip N rows; for very large N or deep pagination, keyset (cursor) pagination is much faster
C) Replaces indexes
D) Is impossible

**21.** Keyset pagination ("WHERE id > :last_id ORDER BY id LIMIT :n"):
A) Is the same as offset
B) Skips work by using an indexed comparison; stable, fast, and well-suited to feeds and infinite scroll — at the cost of not allowing jumping to arbitrary pages
C) Cannot order
D) Is slower

**22.** A read replica:
A) Replaces the primary
B) A copy of the primary database accepting read queries; reduces load on the primary at the cost of replication lag — reads may see slightly stale data
C) Is for backups only
D) Is always strongly consistent

**23.** Eventual consistency on a read replica means:
A) Errors are eventual
B) After a write to the primary, replicas converge over (typically) milliseconds to seconds; reads in that window may see the old value — design the UX around this
C) Reads are wrong forever
D) Replicas are always stale

**24.** Sharding (horizontal partitioning):
A) Is always premature
B) Splits a large dataset across multiple databases by a key, scaling write throughput and dataset size; introduces real complexity in queries, transactions, and operations
C) Replaces indexes
D) Is the same as normalization

**25.** A relational database versus a document store (MongoDB, etc.):
A) One is strictly better
B) Different trade-offs: relational gives strong consistency, joins, and constraints; document stores give flexible schemas and horizontal scale; pick by the problem
C) Document stores have no schema
D) Relational databases are dying

**26.** A key-value store (Redis, etc.):
A) Replaces databases
B) Is excellent for caching, session storage, rate limiting, queues, and other low-latency lookups — but is not your durable system of record by default
C) Is for logs
D) Is always slow

**27.** A "slow query" report flagged in production:
A) Ignore unless customers complain
B) Investigate with `EXPLAIN` (or equivalent), check whether an index is missing, whether the query plan changed, whether the data shape changed, and whether the query itself can be restructured
C) Add an index immediately
D) Restart the database

---

## Section C — API Design Patterns (Q28–Q40)

**28.** Designing an API for clients you do not control:
A) Means you can change anything
B) Means changes are expensive — backward compatibility, versioning, and deprecation strategy matter from day one
C) Is the same as internal APIs
D) Should be undocumented

**29.** A breaking change versus an additive change:
A) Are the same
B) Adding a new optional field, endpoint, or query parameter is usually safe; removing or renaming fields, changing types, or changing semantics is breaking and needs deliberate handling
C) Breaking changes are always avoidable
D) Additive changes always break

**30.** Versioning an API:
A) Is unnecessary
B) Communicates contract changes to clients — common approaches include URL versioning (`/v1`, `/v2`), media-type versioning (`Accept: application/vnd.api.v2+json`), or query parameters
C) Is a build concept
D) Replaces docs

**31.** Filter parameters on a list endpoint:
A) Should accept any column
B) Should accept a controlled, documented set mapped to indexed columns — arbitrary filtering against unindexed columns is a slow-query risk
C) Should not exist
D) Should be in the body

**32.** A consistent error format across endpoints:
A) Is overkill
B) Lets clients write one error handler — common fields are `code`, `message`, optionally `field`, `details`, and a `traceId`
C) Is for the frontend
D) Should vary per endpoint

**33.** Returning collections versus envelopes:
A) Are interchangeable
B) Bare arrays (`[…]`) work but make it impossible to add pagination metadata or status info later; envelopes (`{ data: [...], meta: { ... } }`) are more extensible
C) Bare arrays are always best
D) Envelopes are deprecated

**34.** Idempotency keys for `POST`:
A) Are HTTP standard
B) Are a server-supported pattern — the client sends a key, the server records it after the first success, and a retry returns the same response without creating a duplicate
C) Are for GET only
D) Are encrypted

**35.** Long-running requests:
A) Should hold the connection until done
B) Should return quickly (often 202 Accepted) with a resource the client can poll or subscribe to for completion — long-lived HTTP connections fail in ways async patterns do not
C) Should always be synchronous
D) Should use WebSockets always

**36.** A webhook endpoint receiving events from a third party:
A) Should trust the source
B) Should verify signatures (HMAC), be idempotent (the third party will retry), return quickly (often acknowledging receipt and processing async), and tolerate out-of-order delivery
C) Should reject duplicates strictly
D) Cannot be authenticated

**37.** Rate limiting policies on an API:
A) Should be uniform
B) Should be tiered by identity, scoped per endpoint where relevant, and surface useful response headers (`X-RateLimit-Remaining`, `Retry-After`) so clients can self-regulate
C) Should be unannounced
D) Replace authentication

**38.** GraphQL versus REST trade-offs:
A) GraphQL is strictly better
B) GraphQL gives clients flexibility and eliminates some over-fetching, at the cost of caching complexity, performance tuning (resolvers can hide N+1s), and tooling investment
C) REST is dying
D) Are interchangeable

**39.** gRPC versus REST:
A) Are the same
B) gRPC uses HTTP/2 with binary protobuf, great for internal service-to-service communication with strong typing and streaming; REST is more universal across heterogeneous clients
C) gRPC replaces REST publicly
D) REST is faster always

**40.** Designing an API to be deprecation-friendly:
A) Is impossible
B) Means publishing clear timelines, surfacing usage of deprecated endpoints (via headers or logs), supporting both versions during a transition, and treating deprecation as a feature, not a single PR
C) Means breaking it
D) Means never changing it

---

## Section D — Authentication and Authorization Deeper (Q41–Q52)

**41.** Authorization models:
A) All work the same
B) Role-based (RBAC), attribute-based (ABAC), and relationship-based (ReBAC) suit different problems — RBAC scales to coarse policies, ReBAC to social graphs, ABAC to context-rich rules
C) RBAC is always best
D) ABAC is deprecated

**42.** Centralizing authorization logic:
A) Is overkill
B) Helps when checks are scattered through handlers — a policy layer (or library like Casbin, OPA, Cerbos) is far easier to audit and evolve than checks sprinkled across the code
C) Slows requests
D) Is the same as authentication

**43.** Multi-tenancy enforcement at the database level:
A) Is optional
B) Means every query for tenant data is automatically scoped by tenant ID (via the ORM, query layer, or row-level security); missing this check is one of the most common SaaS data-leak patterns
C) Slows the database
D) Is the frontend's job

**44.** A JWT's signing algorithm should be:
A) Set to `none`
B) A known-secure algorithm (HS256, RS256, EdDSA) — and the verifier must explicitly check it, never trust the token's own `alg` claim
C) Set by the client
D) Optional

**45.** JWT contents:
A) Are encrypted
B) Are base64-encoded and readable by anyone with the token — never put sensitive data in the payload, only what the verifier needs to identify and authorize the request
C) Are random
D) Are encrypted with the secret

**46.** Logging out a user with a stateless JWT:
A) Just deletes the token client-side
B) Requires more — a server-side blocklist of revoked tokens, short access-token lifetimes with refresh-token revocation, or a session reference inside the token — the "stateless" property is a real constraint
C) Is impossible
D) Is automatic

**47.** OAuth 2.0 authorization code flow with PKCE:
A) Is for server-to-server
B) Is the standard flow for public clients (mobile, single-page apps) — code exchange protected by a code verifier so an intercepted code cannot be redeemed by an attacker
C) Is deprecated
D) Is the same as client credentials

**48.** The implicit OAuth flow:
A) Is recommended
B) Is largely deprecated in favor of authorization code with PKCE, because tokens were exposed in URL fragments
C) Is for backends
D) Is the same as PKCE

**49.** Service-to-service authentication:
A) Should reuse user passwords
B) Uses dedicated credentials (client credentials flow, mTLS, service accounts), often short-lived and rotated, with explicit allowlists of which service can call which
C) Should be IP-based only
D) Is unnecessary inside the network

**50.** Storing user permissions in the token versus looking them up on each request:
A) Are equivalent
B) Tokens that embed permissions avoid lookups but go stale (a revoked permission still works until the token expires); lookups are fresh but cost a query — balance based on staleness tolerance
C) Are deprecated
D) Tokens are always fresh

**51.** A "confused deputy" vulnerability:
A) Is a UI bug
B) When a service with broad authority is tricked by a less-privileged caller into performing an action on the caller's behalf — defended by carrying the original requester's identity through the chain
C) Is about confused users
D) Is for OAuth only

**52.** Auditing security-sensitive operations:
A) Is for compliance only
B) Recording who did what, when, and from where (logins, permission changes, data exports) is essential — even if you never look at the logs in normal operation, you need them when something happens
C) Is the same as logging errors
D) Is the frontend's job

---

## Section E — Caching Strategies (Q53–Q62)

**53.** A cache hit ratio:
A) Should always be 100%
B) Is the fraction of requests served from cache; depending on the workload, an effective cache might be anywhere from 30% to 99% — measure, do not assume
C) Is decorative
D) Is the same as response time

**54.** Cache-aside (lazy population):
A) Reads from cache; on miss, fetches from the source and writes to the cache, then returns — the most common pattern in application caching
B) Replaces the database
C) Is synchronous only
D) Is automatic

**55.** Write-through versus write-back caching:
A) Are identical
B) Write-through writes to both cache and source synchronously (consistent, slower writes); write-back writes to cache first and flushes later (faster, more failure risk)
C) Write-back is always best
D) Write-through is deprecated

**56.** Cache invalidation strategies include:
A) Never invalidate
B) Time-based expiry (TTL), explicit invalidation on writes, versioned keys, and stale-while-revalidate — each has trade-offs in freshness, complexity, and load
C) Only TTL is valid
D) Only explicit invalidation works

**57.** Cache stampede (thundering herd):
A) Cannot happen
B) When a popular cache entry expires and many requests try to repopulate it simultaneously — defended by request coalescing, jittered TTLs, or pre-warming
C) Is for databases only
D) Is the same as a deadlock

**58.** Caching authenticated, per-user responses on a shared CDN:
A) Is fine
B) Is dangerous without correct cache keys and `Cache-Control: private` — risks serving one user's data to another
C) Is the only way
D) Replaces sessions

**59.** Using Redis (or equivalent) for sessions:
A) Is wasteful
B) Is a common pattern — fast lookups, atomic operations, TTLs match session lifetimes; pair with persistence configuration appropriate to your loss tolerance
C) Is unsafe
D) Replaces JWT

**60.** A distributed cache with no eviction policy:
A) Is unlimited
B) Fills up and starts failing writes or evicting unpredictably; configure an explicit eviction policy (LRU, LFU, etc.) sized for the workload
C) Is faster
D) Is the default

**61.** HTTP cache headers (`Cache-Control`, `ETag`, `Last-Modified`):
A) Are for browsers only
B) Drive caching across browsers, CDNs, and proxies — `Cache-Control` sets the policy; `ETag`/`Last-Modified` enable conditional requests (304 Not Modified) that save bandwidth
C) Are deprecated
D) Are for static files only

**62.** A cache that returns wrong data:
A) Is acceptable for speed
B) Is worse than no cache — correctness almost always trumps speed; design invalidation carefully, and prefer underutilized caches to incorrect ones
C) Is the same as a slow cache
D) Is fine for reads

---

## Section F — Background Jobs and Queues (Q63–Q72)

**63.** A message queue (RabbitMQ, SQS, Redis-based queues, Kafka):
A) Replaces databases
B) Decouples producers and consumers, lets work be processed asynchronously, enables retries, and absorbs traffic spikes — different queues have different ordering and delivery guarantees
C) Is for logs only
D) Is the same as a cache

**64.** "At least once" delivery:
A) Means exactly once
B) Means the message will be delivered one or more times; consumers must be idempotent to handle duplicates gracefully — the common default in most queues
C) Means at most once
D) Is the same as exactly once

**65.** Idempotent consumers:
A) Are unnecessary
B) Process the same message safely if it arrives twice — either by checking a processed-IDs store, using upserts, or designing the operation to be naturally idempotent
C) Are slower
D) Replace queues

**66.** A dead-letter queue (DLQ):
A) Is for messages that take too long
B) A holding place for messages that have failed processing repeatedly, so they do not block the queue and can be investigated separately
C) Is automatic
D) Deletes messages

**67.** Visibility timeout (or message lock):
A) Is decorative
B) Hides a message from other consumers while one consumer is processing it; if the consumer crashes without acknowledging, the message becomes visible again for retry
C) Is the same as TTL
D) Is for ordering

**68.** Ordering guarantees in queues:
A) Are universal
B) Vary by queue — some give per-partition ordering (Kafka), some give FIFO with cost (SQS FIFO), many give no ordering by default; design jobs not to depend on global order
C) Are always strict
D) Are unimportant

**69.** Scheduled jobs (cron-like) versus event-driven jobs:
A) Are interchangeable
B) Scheduled jobs run on a fixed schedule (good for periodic work); event-driven jobs react to events (good for reactive work); many systems need both
C) Scheduled is deprecated
D) Event-driven is the same

**70.** A long-running job that fails halfway through:
A) Must restart from the beginning
B) Should be designed to either resume from a checkpoint, or be safely re-runnable from scratch (idempotent) — choose by job characteristics
C) Should be ignored
D) Is impossible to handle

**71.** Backpressure between a fast producer and a slow consumer:
A) Is automatic
B) Should be designed for — bounded queues, rejecting or shedding load, or pausing producers — unbounded growth eventually crashes the system
C) Is a queue feature only
D) Is the same as retries

**72.** Observability for jobs:
A) Is not needed
B) Tracks job latency, success/failure rates, queue depth, and per-job-type metrics — without it, queues become silent failure points
C) Is the same as request logs
D) Is automatic

---

## Section G — Observability (Q73–Q82)

**73.** The three pillars of observability are commonly described as:
A) Code, tests, docs
B) Logs, metrics, and traces — each answers different questions about what the system is doing
C) Memory, CPU, network
D) Reads, writes, deletes

**74.** Structured logs (JSON with fields) versus unstructured strings:
A) Are equivalent
B) Structured logs are vastly easier to search, filter, and aggregate — modern log systems treat them as first-class data
C) Are slower
D) Are required

**75.** Correlation IDs across logs:
A) Are decorative
B) Let you trace a single request across services and logs — pass a `traceparent` or correlation header at the edge and propagate through every call
C) Replace tracing
D) Are for frontend only

**76.** A metric versus a log:
A) Are the same
B) A metric is a numeric measurement over time (counts, gauges, histograms) suitable for aggregation; a log is a discrete event — both have their place
C) Metrics replace logs
D) Logs are metrics

**77.** A p50, p95, p99 latency:
A) Mean the same as average
B) Mean 50%, 95%, 99% of requests were faster than this — averages hide the long tail that users actually perceive as "slow"
C) Are for storage
D) Are for errors

**78.** RED metrics (Rate, Errors, Duration):
A) Are for databases
B) A common minimum set for request-driven services — how many requests, what fraction error, how long they take, sliced by endpoint
C) Replace tracing
D) Are deprecated

**79.** USE metrics (Utilization, Saturation, Errors):
A) Are for tests
B) A complementary frame for resource-level monitoring — how busy the resource is, how queued, how many errors; helps diagnose where saturation is happening
C) Replace RED
D) Are decorative

**80.** Distributed tracing (OpenTelemetry, etc.):
A) Is the same as logs
B) Records spans across services for a single request, showing where time was spent and where failures occurred — essential for understanding multi-service latency
C) Is for frontend only
D) Replaces logs entirely

**81.** Alerting:
A) Should fire on every anomaly
B) Should be tied to user-visible problems and burn-rate against SLOs, not raw thresholds — overly noisy alerts get ignored, and then the real one is missed
C) Should be silent
D) Is the same as logging

**82.** Service Level Objectives (SLOs):
A) Are aspirational
B) Are measurable targets (e.g., "99.9% of requests succeed under 300ms") that anchor reliability work; the error budget left after the SLO is the team's allowance for risk
C) Are for marketing
D) Are deprecated

---

## Section H — Testing Strategy (Q83–Q90)

**83.** The testing pyramid:
A) All E2E
B) Many fast unit tests at the base, fewer integration tests in the middle, a small number of end-to-end tests at the top — favors fast feedback while still covering integration
C) Inverted pyramid
D) All manual

**84.** Integration tests should:
A) Mock everything
B) Exercise real wiring between components — the route plus the database, the consumer plus the queue — and verify that the contract works in reality, not just in isolation
C) Replace unit tests
D) Be skipped

**85.** Test fixtures versus factories:
A) Are the same
B) Fixtures are fixed data sets; factories generate data on demand with sensible defaults — factories scale better as the schema and test count grow
C) Fixtures are always better
D) Factories are deprecated

**86.** A test that depends on test ordering:
A) Is fine
B) Is brittle — each test should set up and tear down its own state, so the suite can run in any order without surprise
C) Is faster
D) Is required by some frameworks

**87.** Contract testing between services:
A) Replaces integration tests
B) Verifies that two services agree on the API shape — producer and consumer can evolve independently as long as the contract holds, catching breakages before deploy
C) Is the same as unit testing
D) Is for frontend only

**88.** Snapshot tests on API responses:
A) Are always best
B) Lock in the current response shape; useful for catching unintended changes, but easy to over-rely on — and the human reviewing the diff is what gives them value
C) Replace integration tests
D) Are deprecated

**89.** Performance and load tests:
A) Are unnecessary until production breaks
B) Catch issues before users do — at minimum, validate that critical endpoints meet their latency targets under expected load, and that the system degrades gracefully past it
C) Are for ops only
D) Replace unit tests

**90.** A "test environment" identical to production:
A) Is impossible
B) Is the ideal — same database engine and version, same major dependencies, similar shape of data; the further it drifts, the more tests pass while production breaks
C) Is wasteful
D) Is for backend only

---

## Section I — Security Depth and Senior Judgment (Q91–Q100)

**91.** SQL injection beyond the basics:
A) Only happens to old code
B) Still surfaces through dynamic ORM uses, raw queries, string-built ORDER BY clauses, and stored procedures — parameterize everything, including identifiers via allowlists
C) Is impossible with ORMs
D) Is for databases only

**92.** Mass assignment vulnerabilities:
A) Are myths
B) When a framework binds request fields to model properties automatically and the client sets a field they should not (`is_admin`, `user_id`) — defended by explicit allowlists per endpoint
C) Apply only to GraphQL
D) Are for frontend

**93.** Insecure direct object references (IDOR):
A) Are uncommon
B) When an endpoint accepts an ID and returns the object without verifying the caller is allowed to see it — `GET /orders/123` must check ownership, not just that 123 exists
C) Are an OAuth concept
D) Are not a real concern

**94.** Secrets management at scale:
A) `.env` files
B) Dedicated services (Vault, AWS Secrets Manager, GCP Secret Manager, etc.) with audit, rotation, and access control — not file-based secrets sitting on disk
C) Encrypt in code
D) Email between engineers

**95.** Logging sensitive data:
A) Is fine internally
B) Is a recurring source of breaches — define what is sensitive (passwords, tokens, PII, payment data), scrub it before logging, and audit destinations and retention
C) Is required for debugging
D) Encrypted by default

**96.** Reviewing a Junior 1's code:
A) Should focus on style
B) Should focus on correctness, error handling, security, and clarity — explain the why, not just the what; a code review is also a teaching moment
C) Should be a rubber stamp
D) Should be skipped

**97.** Mentoring an intern:
A) Is the lead's job alone
B) Is part of becoming a Junior 3 — answering questions patiently, reviewing code charitably, and shielding the intern from frustration is how the team grows
C) Wastes your time
D) Is too early for you

**98.** Estimating a medium backend feature:
A) Quote a single number
B) Break it down enough to see the hidden parts — schema changes, migrations, validation, tests, observability, deploy, follow-up bugs — and quote a range
C) Match what the senior says
D) Refuse

**99.** Pushing back on a product request:
A) Insubordination
B) Often the right move — surface the cost, propose alternatives, and decide together; silent overcommitment is worse for everyone
C) The lead's job
D) Wastes time

**100.** The trait that most reliably unlocks the next promotion is:
A) Speed
B) Curiosity that has broadened beyond backend — wanting to understand how the frontend works, how data reaches the user, how deploys happen, why the system behaves the way it does
C) Code volume
D) Specialization depth

---

## Answer Key

1.B  2.B  3.B  4.B  5.B  6.B  7.B  8.B  9.B  10.B
11.B  12.B  13.B  14.B  15.B  16.B  17.B  18.B  19.B  20.B
21.B  22.B  23.B  24.B  25.B  26.B  27.B  28.B  29.B  30.B
31.B  32.B  33.B  34.B  35.B  36.B  37.B  38.B  39.B  40.B
41.B  42.B  43.B  44.B  45.B  46.B  47.B  48.B  49.B  50.B
51.B  52.B  53.B  54.A  55.B  56.B  57.B  58.B  59.B  60.B
61.B  62.B  63.B  64.B  65.B  66.B  67.B  68.B  69.B  70.B
71.B  72.B  73.B  74.B  75.B  76.B  77.B  78.B  79.B  80.B
81.B  82.B  83.B  84.B  85.B  86.B  87.B  88.B  89.B  90.B
91.B  92.B  93.B  94.B  95.B  96.B  97.B  98.B  99.B  100.B

**Passing threshold: 89 / 100**

*Administrator's note: This is the last specialist-only backend exam. The next exam (Junior 3 → Senior 1) is the convergence point and tests whether the candidate has broadened beyond backend into the topics a senior generalist must own. A candidate who decisively passes this exam but cannot explain how a browser renders a page, what causes layout shift, or how a frontend bundle is built is not ready for the next gate — coach them toward broadening before they sit it.*
