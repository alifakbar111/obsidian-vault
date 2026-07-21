# Promotion Exam 05 — Senior Engineer 1 → Senior Engineer 2

**Format:** 100 multiple-choice questions, one correct answer each.
**Time limit (suggested):** 150 minutes.
**Passing score:** 89 / 100.
**Scope:** System design, distributed systems, message queues, advanced caching and DB scaling, reliability and resilience patterns, observability at scale, advanced security, performance engineering, architecture decisions, and senior judgment under ambiguity. The bar for Senior 2 is "owns a non-trivial system or vertical, designs it credibly, and is a force multiplier across the team."

---

## Section A — System Design Fundamentals (Q1–Q20)

**Q1.** Which of these is the *first* step in any non-trivial system design?
A) Pick the database
B) Clarify requirements, constraints, traffic, and what success looks like
C) Choose the cloud provider
D) Draw the diagram

**Q2.** Why are *non-functional* requirements (latency, throughput, durability, availability) so important to gather early?
A) They don't matter
B) They constrain almost every architectural choice; getting them wrong leads to costly rework
C) They are only for SRE
D) They block deployments

**Q3.** Which of these is the most useful estimate to do early?
A) Estimate revenue
B) Back-of-the-envelope: QPS, payload sizes, data growth, working-set size, and bandwidth
C) Number of microservices
D) Number of TypeScript types

**Q4.** Which is the best framing of *availability* vs *durability*?
A) Same thing
B) Availability is the system answering requests; durability is data surviving (not lost) once accepted
C) Durability is about uptime
D) Availability is about backups

**Q5.** Which of these is true about *p50* vs *p99* latency?
A) p50 is more important
B) Tail latency (p99/p99.9) often drives perceived user experience and SLOs, especially when requests fan out
C) p99 is irrelevant
D) Only p100 matters

**Q6.** What is the "fan-out problem" in distributed systems?
A) A type of HTTP error
B) When a single request triggers many downstream calls, and tail latency / partial failure compound badly
C) An algorithm
D) A CDN feature

**Q7.** Which is a typical mitigation for fan-out tail latency?
A) Hedged or backup requests after a deadline, with cancellation
B) More retries
C) Bigger queues
D) Larger packets

**Q8.** Which is most consistent with "design for failure"?
A) Assume nothing fails
B) Assume every dependency can fail; design timeouts, retries with backoff, fallbacks, and circuit breakers
C) Use only one cloud
D) Avoid distributed systems

**Q9.** What is a *circuit breaker*?
A) A physical device
B) A pattern that stops calling a failing dependency once a threshold of failures is reached, allowing it to recover
C) A type of cache
D) A retry policy

**Q10.** What is *bulkheading*?
A) Encryption
B) Isolating resources (e.g., thread pools, connection pools) per dependency so one failure cannot exhaust resources globally
C) A database term
D) A type of compression

**Q11.** What is the *idempotency* requirement for safe retries?
A) Retries must be exponential
B) The operation must produce the same effect whether invoked once or many times (often via idempotency keys)
C) Retries must be synchronous
D) Retries must be capped at three

**Q12.** Which is true about *timeouts*?
A) Default to "no timeout"
B) Every remote call should have an explicit, finite timeout aligned with an overall deadline; absence is a bug
C) Long timeouts are always better
D) Only HTTP needs timeouts

**Q13.** What is a "deadline" in distributed systems?
A) When a sprint ends
B) An absolute time budget propagated through calls so downstream services can short-circuit doomed work
C) A type of SLA
D) A retry mechanism

**Q14.** Which is the strongest reason to choose synchronous vs asynchronous communication?
A) Random preference
B) Whether the caller must have the result immediately to proceed, and what consistency and back-pressure semantics you need
C) Always pick async
D) Always pick sync

**Q15.** Which is a typical reason to introduce a message queue?
A) Decoupling producers/consumers, absorbing bursts, enabling async work, and increasing reliability via at-least-once delivery
B) To replace HTTP
C) To replace the database
D) For cosmetic reasons

**Q16.** Which is true about "at-least-once" delivery?
A) Messages may be delivered more than once; consumers must be idempotent
B) Same as exactly-once
C) Same as at-most-once
D) Messages are never duplicated

**Q17.** Which is true about "exactly-once" semantics?
A) Trivial to achieve
B) Generally requires careful end-to-end design (idempotent operations, dedup, transactional outbox, etc.); naive "exactly once" claims should be scrutinized
C) Provided by all queues by default
D) Impossible

**Q18.** Which of these is a *dead-letter queue* used for?
A) Old messages that no one wants
B) Holding messages that repeatedly fail processing, so they can be inspected and re-driven later without blocking the main flow
C) Encryption
D) Logging

**Q19.** Which of these patterns helps keep DB writes and outbound messages consistent?
A) Two-phase commit with the queue
B) Transactional outbox: write the event to a table in the same DB transaction; a relay publishes it
C) Best effort
D) Side-channel writes

**Q20.** Which of these is most consistent with *event-driven* architecture?
A) RPC everywhere
B) Producers emit events without knowing consumers; consumers react and may produce further events
C) Synchronous fan-out
D) Polling only

---

## Section B — Data, Scaling, and Storage (Q21–Q40)

**Q21.** Which is the most important factor when picking a *shard key*?
A) Length of the string
B) Even distribution of load and the access patterns you need to support without cross-shard queries
C) Alphabetical order
D) Random UUID always

**Q22.** Which is a typical *hotspot* problem?
A) Caching working perfectly
B) A small subset of keys/users receives disproportionate traffic, overloading one shard
C) Even load
D) Idle shards

**Q23.** Which is a common mitigation for hotspots?
A) Key salting/splitting, request coalescing, read replicas for that range, or rate limiting offending callers
B) Removing the cache
C) Bigger primary keys
D) Increasing TTL to infinity

**Q24.** Which is a sensible default for *primary key* shape on a high-write table?
A) Monotonically increasing keys, which can cause write hotspots on some engines
B) UUIDs or time-prefixed IDs with random suffixes, balancing locality and distribution per the engine's storage model
C) Random strings only
D) Email address as primary key

**Q25.** Which is true about *read replicas*?
A) They provide strict synchronous consistency
B) They provide scalable reads with eventual (lagging) consistency unless synchronous replication is configured (and then with trade-offs)
C) They replace backups
D) They write faster

**Q26.** Which is true about *backups*?
A) Tests of backups are optional
B) A backup that has never been restored is not really a backup; periodic restore drills are essential
C) Daily snapshots are sufficient
D) Replicas count as backups

**Q27.** Which of these is the *best* description of a *time-series database*?
A) Optimized for high-volume append-only timestamped data with retention and downsampling
B) A relational DB with a special schema
C) A key-value store
D) A document store

**Q28.** Which workload is best suited to a *search index* (e.g., Elasticsearch/OpenSearch)?
A) Strictly transactional money movement
B) Full-text search, faceted filtering, ranking, and analytics on semi-structured data
C) Low-volume key-value lookups
D) Bulk transfers

**Q29.** Which of these is a *common* anti-pattern with Elasticsearch?
A) Treating it as the system of record for transactional data
B) Indexing only what is searched
C) Using bulk APIs
D) Tuning analyzers

**Q30.** Which of these is true about *OLTP* vs *OLAP*?
A) OLTP is optimized for many small transactions; OLAP for analytical queries over large datasets, often columnar
B) OLAP is for transactions
C) They are the same
D) OLAP is faster for OLTP

**Q31.** Which is the most reasonable approach to "we need analytics on production data"?
A) Run analytics queries on the OLTP primary
B) Replicate to a separate analytics store (warehouse/lakehouse) optimized for those workloads
C) Block all analytics
D) Cache the entire DB

**Q32.** Which is a key advantage of *change data capture* (CDC)?
A) Decouples downstream consumers from the operational DB, propagating row-level changes as an event stream
B) Replaces backups
C) Removes the need for indexes
D) Provides exactly-once HTTP

**Q33.** Which of these is the *strongest* argument *against* premature microservices?
A) Microservices are illegal
B) Distributed systems pay tax in latency, observability, deployment, and data consistency; the cost is often higher than the modular monolith you actually need
C) Microservices cannot use HTTP
D) Microservices break TypeScript

**Q34.** Which of these is the *strongest* argument *for* breaking a monolith into services?
A) Fashion
B) Independent scaling, isolation of failure, autonomy of teams, and clear bounded contexts when the org is large enough to justify the cost
C) To impress executives
D) Because monoliths are obsolete

**Q35.** What is a *bounded context* in Domain-Driven Design?
A) A boundary within which a particular model and language are consistent and unambiguous
B) A type of cache
C) A function namespace
D) A CSS scope

**Q36.** Which of these is the best signal that two modules should be one service?
A) They are written in the same language
B) They share data, deployment, or invariants tightly, and splitting them would create chatty cross-service calls or distributed transactions
C) They are in the same repo
D) They have similar logos

**Q37.** Which is a sensible heuristic for service boundaries?
A) Match boundaries to bounded contexts and team ownership; keep transactional invariants inside one service
B) One service per file
C) One service per developer
D) Random

**Q38.** Which is the best description of *eventual consistency* in user-facing systems?
A) Always confusing for users
B) Acceptable when properly designed (e.g., "follow your own writes", optimistic UIs, idempotent operations) and clearly communicated where it matters
C) Forbidden
D) The same as strong consistency

**Q39.** Which of these is the *strongest* argument for keeping a write path *synchronous* end-to-end?
A) The user must see the result of their own action immediately, and the operation is small enough to do reliably in the request lifetime
B) The team likes synchronous code
C) Async is hard to debug
D) HTTP is synchronous

**Q40.** Which is a healthy view of "build vs buy" for infrastructure?
A) Always build
B) Build only what is your differentiation; buy or use managed services for commodity capabilities unless the cost or constraints are unacceptable
C) Always buy
D) Build in the cheapest language

---

## Section C — Reliability, Observability, and On-Call (Q41–Q60)

**Q41.** Which is the best definition of an SLO?
A) An external promise to customers
B) An internal target for an SLI (e.g., "99.9% of requests succeed within 300ms over 30 days") that drives engineering trade-offs
C) The maximum CPU usage
D) An alert threshold

**Q42.** What does an *error budget* enable?
A) Encouraging more bugs
B) A shared, quantitative agreement on how much unreliability is acceptable; once exhausted, reliability work is prioritized over feature work
C) Free downtime
D) A budget for QA

**Q43.** Which is the best alerting principle?
A) Page on every anomaly
B) Page on user-impacting symptoms or error-budget burn, with clear, actionable runbooks
C) Page everyone always
D) No paging

**Q44.** Which is the *strongest* signal an alert is bad?
A) It pages frequently with no clear action and is routinely silenced
B) It uses uppercase
C) It runs in Slack
D) It has a graph

**Q45.** Which is the most useful single field to add to every log line?
A) A flag emoji
B) A correlation/request ID propagated across services
C) The full stack trace always
D) The user's password hash

**Q46.** Which is the strongest argument for *structured logging*?
A) Easier to grep
B) Queryable, indexable, and reliably parseable across logs, metrics, and traces; enables real observability
C) Looks nicer
D) Required by HTTP

**Q47.** What is *cardinality* in metrics, and why does it matter?
A) The number of fields; high cardinality on labels (e.g., user IDs) blows up storage and query cost in many TSDBs
B) The number of metrics
C) The frequency of metrics
D) Irrelevant

**Q48.** Which is the best practice for tracing in a service?
A) Hand-roll spans everywhere
B) Adopt an open standard (OpenTelemetry), instrument client/server boundaries, propagate context, and sample intelligently
C) Print to stdout
D) Disable tracing in prod

**Q49.** Which of these is true about *load shedding*?
A) Always a bug
B) Under overload, deliberately rejecting or degrading lower-priority traffic to protect overall service health is healthier than collapsing
C) Means losing data always
D) Same as autoscaling

**Q50.** Which is the best behavior during a Sev 1 incident?
A) Argue about root cause first
B) Establish an incident commander, mitigate first (revert/rollback/feature flag), communicate status, then investigate root cause after stabilization
C) Push fixes directly to prod with no review
D) Silence alerts

**Q51.** What is the purpose of a *blameless postmortem*?
A) Find someone to fire
B) Understand contributing factors honestly, capture lessons, and produce concrete actions to prevent recurrence
C) Document blame
D) Justify managers' decisions

**Q52.** Which of these is the strongest indicator of an unhealthy on-call rotation?
A) High alert noise, repeated low-value pages, and burnout
B) Documented runbooks
C) Quarterly review of pages
D) Pager handoffs

**Q53.** Which is the right reaction to repeated noisy alerts?
A) Snooze permanently
B) Treat the noise as a bug: tune thresholds, fix root causes, deprecate alerts with no action
C) Page the manager
D) Increase severity

**Q54.** Which is the best practice for *graceful shutdown* of a service?
A) Kill -9 always
B) Stop accepting new traffic, drain in-flight requests within a timeout, flush buffers, close connections cleanly
C) Restart in a loop
D) Disable logging during shutdown

**Q55.** Which is most consistent with *defense in depth*?
A) One strong control is enough
B) Multiple overlapping controls so that a single failure does not lead to compromise
C) Trust the network
D) Trust the client

**Q56.** Which of these is the best way to test for resilience?
A) Hope for the best
B) Deliberate failure injection (chaos engineering) in safe environments, plus game days with the on-call team
C) Only happy-path tests
D) Manual prod testing

**Q57.** Which is the most reasonable rollout strategy for a risky migration?
A) Big bang on Friday at 6 PM
B) Dual-write or shadow-read first, gradual cutover by user/region, with monitoring and clear rollback criteria
C) Take downtime and switch
D) Migrate silently

**Q58.** What is *shadow traffic*?
A) Stealing traffic
B) Mirroring real traffic to a new version without affecting users, to validate behavior and performance
C) Encrypted traffic
D) Internal-only requests

**Q59.** Which is the best way to validate a backup?
A) Check the file exists
B) Periodic automated restore into an isolated environment, with consistency checks
C) Trust the vendor
D) Compare file sizes

**Q60.** Which is true about *RPO* and *RTO*?
A) Recovery Point Objective is the max acceptable data loss; Recovery Time Objective is the max acceptable downtime
B) They are the same
C) They are SLAs
D) They are only for backups

---

## Section D — Performance, Concurrency, and Architecture (Q61–Q80)

**Q61.** Which is the best mental model for performance work?
A) Optimize randomly
B) Measure, model, target the dominant cost, change one thing, re-measure
C) Add caches everywhere first
D) Rewrite in C++

**Q62.** Which of these is most likely to dominate latency for a typical web request?
A) JIT warm-up
B) Network round-trips, downstream calls, DB queries, and serialization — not raw CPU of business logic
C) CSS parsing
D) Garbage collection pauses always

**Q63.** Which is the best way to reduce DB load for read-heavy traffic?
A) Add a cache with a clear invalidation strategy and/or read replicas, after analyzing access patterns
B) More CPU on app servers
C) Bigger logs
D) Random retries

**Q64.** Which is the strongest reason to *batch* requests?
A) Looks neat
B) Amortize fixed per-request cost (network, syscalls, transactions), at the price of small added latency or memory
C) Avoids HTTP
D) Reduces logs

**Q65.** Which of these is a common cause of *memory leaks* in long-running services?
A) Using `let` only
B) Unbounded caches, dangling references in event listeners, accidental closures retaining objects, growing in-memory queues
C) TypeScript types
D) HTTPS

**Q66.** Which is true about *garbage-collected* runtimes?
A) GC pauses can affect tail latency; tuning, allocation discipline, and choice of collector matter at scale
B) GC is free
C) GC is the same in every language
D) GC pauses do not exist on modern CPUs

**Q67.** Which is the best way to handle *thundering herd* on cache miss?
A) Let it happen
B) Coalesce concurrent regen requests to a single fetch and broadcast the result; use stale-while-revalidate where allowed
C) Disable caching
D) Add more retries

**Q68.** Which is true about concurrency vs parallelism?
A) Same thing
B) Concurrency is about structuring work to make progress on many tasks; parallelism is doing things truly simultaneously on multiple cores
C) Parallelism is for I/O
D) Concurrency requires threads

**Q69.** Which of these is a typical cause of contention in concurrent code?
A) Pure functions
B) Shared mutable state guarded by coarse locks, hot atomics, or single queues
C) Immutable data
D) Lock-free design

**Q70.** Which is true about *backpressure* in streaming systems?
A) Push as fast as possible
B) Bounded buffers and explicit signals to slow producers maintain stability and avoid memory blow-up
C) Drop silently
D) Crash on overflow

**Q71.** Which is the most important property of a good architecture diagram?
A) Pretty colors
B) Accurately conveys components, data flow, ownership, trust boundaries, and the question it is meant to answer
C) Uses the latest tool
D) Is large

**Q72.** Which is true about *event sourcing*?
A) Storing the full sequence of immutable events as the source of truth; current state is derived by replay/projections
B) Same as event-driven only
C) Replaces databases entirely
D) A logging strategy

**Q73.** Which is a *trade-off* of event sourcing?
A) Free wins everywhere
B) Schema evolution of events, replay/snapshot complexity, eventual consistency of projections, learning curve
C) No trade-offs
D) Requires NoSQL

**Q74.** Which is the strongest case *for* CQRS (Command Query Responsibility Segregation)?
A) Write and read models differ significantly in shape and scale, justifying separation despite added complexity
B) The team has too few engineers
C) Cosmetic
D) Required by HTTP

**Q75.** Which is the best behavior when a colleague proposes a new framework "because it is trendy"?
A) Block it
B) Ask what problem it solves, what alternatives were considered, what the migration cost is, and how it aligns with team capability and constraints
C) Approve it
D) Ignore the discussion

**Q76.** Which is the strongest sign you should *not* rewrite a system?
A) The team is bored
B) The existing system works, embodies hard-won knowledge of edge cases, and the rewrite has unclear ROI and timeline
C) The system is in TypeScript
D) The system is in a monolith

**Q77.** Which of these is the strongest sign of *good* incremental modernization?
A) Big-bang rewrite
B) Strangler-fig pattern: route new functionality to the new system; carve off pieces from the old over time, with safety nets
C) Freeze the old system entirely
D) Two parallel teams with no plan

**Q78.** Which is the best behavior when an engineer pushes a tactical fix that adds tech debt?
A) Forbid it
B) Accept if justified (e.g., incident mitigation), require a follow-up ticket, owner, and time box; track and pay it down
C) Demand a perfect fix immediately
D) Silently approve

**Q79.** Which is the most reasonable view of *architectural decision records* (ADRs)?
A) Bureaucracy
B) Lightweight, dated, immutable records of significant decisions with context and consequences; cheap insurance against organizational amnesia
C) Replaces design docs
D) Only for managers

**Q80.** Which is the *most useful* output of a design review?
A) Approval signature
B) Crisper requirements, identified risks, alternatives considered, and explicit decisions with owners
C) A pretty diagram
D) A long meeting

---

## Section E — Senior Judgment and Cross-Cutting Practice (Q81–Q100)

**Q81.** Which is the *first* question a senior engineer should ask about any new feature?
A) "What language?"
B) "What problem are we solving, for whom, and how will we know we solved it?"
C) "What framework?"
D) "Where is the figma?"

**Q82.** Which is true about saying "no" as a senior engineer?
A) It is rude
B) Saying "not yet / not like this / here's the cost" with reasoning is part of the job; it protects users, the team, and the business
C) Senior engineers cannot say no
D) Always defer to PM

**Q83.** Which is the best behavior when two engineers strongly disagree on a design?
A) Pull rank
B) Force-articulate each position's assumptions, write down the decision criteria, do a small spike if possible, and "disagree and commit" if needed
C) Vote in Slack
D) Avoid the topic

**Q84.** Which is the best way to influence others' technical decisions at this level?
A) Lecture them
B) Listen first, propose with evidence and trade-offs, write things down, and let the better argument win — including theirs
C) Block PRs
D) Escalate to manager immediately

**Q85.** Which is the best stance on *mentoring*?
A) Mentor only your favorites
B) Invest deliberately in juniors and peers: pair, code-review with care, write internal docs, and create space for them to lead
C) Mentoring is HR's job
D) Mentoring slows you down

**Q86.** Which is the strongest sign of a healthy code review culture?
A) Long, heated threads
B) Quick, focused reviews; teaching moments are kind; reviewers and authors both learn; nits are clearly labeled
C) Approval without comments
D) Block on style only

**Q87.** Which is the best practice for *risk communication* upward?
A) Vague optimism
B) Specific, dated, with what is at risk, what would mitigate, and what decision you need from leadership
C) Hiding bad news
D) Sandbagging estimates

**Q88.** Which is the best practice when an estimate slips?
A) Quietly slip more
B) Surface early with the reason, options (cut scope, add help, slip date), and a recommendation
C) Blame upstream
D) Add more hours secretly

**Q89.** Which is the most senior reaction to "the spec is ambiguous"?
A) Wait for instructions
B) Propose the most reasonable interpretation with assumptions; ask sharp clarifying questions; document the decisions
C) Refuse to start
D) Implement randomly

**Q90.** Which is the best way to handle a *prod data fix* request?
A) Run it on the primary at peak hours
B) Treat it like a code change: write it, review it, test it on a copy, run in a transaction with a clear rollback, log it, and prefer code paths
C) Use a personal admin account silently
D) Ask the most junior to run it

**Q91.** Which is the most senior view of "process"?
A) Always more process
B) Right-sized process for the risk: cheap for cheap changes, rigorous for risky ones; remove process that does not pay for itself
C) No process ever
D) Whatever the loudest engineer prefers

**Q92.** Which is the best way to onboard a new engineer to your system?
A) Hand them the docs
B) Pair, give them a small but real change, run them through the runbooks, introduce stakeholders, and give them an owner
C) Have them read the whole repo for two weeks
D) Wait until sprint planning

**Q93.** Which is the best behavior in a high-pressure release?
A) Push harder, skip checks
B) Slow down at the edges, communicate status, follow the runbook, and have a clear rollback
C) Trust the heroes
D) Skip review

**Q94.** Which is the most reasonable thing to do with a flaky test you inherit?
A) Skip and forget
B) File a ticket, root-cause time-box, fix or rewrite; if truly cannot fix now, quarantine with an owner and date
C) Increase retries forever
D) Delete the suite

**Q95.** Which of these is most consistent with *long-term* thinking?
A) Optimizing every story for today
B) Balancing today's delivery with health of the system, the team's capability, and the cost of future change
C) Refusing to ship
D) Boiling-the-ocean refactors

**Q96.** Which is the strongest sign someone is operating at Senior 2?
A) Argues a lot
B) Sees second-order effects, raises invisible risks, builds platforms others succeed on, and consistently makes the team faster
C) Owns the most repos
D) Reviews the most PRs

**Q97.** Which is the best response to "we don't have time to write tests"?
A) Agree silently
B) "We don't have time *not* to" — for the parts that hurt later; make the case with evidence and propose the right level of testing for the risk
C) Refuse to write anything
D) Add tests after the deadline secretly

**Q98.** Which is the best behavior when a stakeholder asks for a feature that would create real harm or unmanaged risk?
A) Build it
B) Surface the harm/risk clearly with evidence; propose safer alternatives; escalate if necessary
C) Refuse without explanation
D) Build a worse version silently

**Q99.** Which is the best behavior when *you* introduced a regression in production?
A) Hide it
B) Own it openly, mitigate first, run a blameless postmortem, ship preventive actions
C) Blame CI
D) Quit

**Q100.** Which is the best summary of the Senior 2 bar?
A) Knows the most algorithms
B) Owns a non-trivial system, makes credible architecture decisions, raises others' performance, and earns trust from leaders and peers
C) Writes the most code
D) Attends the most meetings

---

## Answer Key

1.B  2.B  3.B  4.B  5.B  6.B  7.A  8.B  9.B  10.B
11.B  12.B  13.B  14.B  15.A  16.A  17.B  18.B  19.B  20.B
21.B  22.B  23.A  24.B  25.B  26.B  27.A  28.B  29.A  30.A
31.B  32.A  33.B  34.B  35.A  36.B  37.A  38.B  39.A  40.B
41.B  42.B  43.B  44.A  45.B  46.B  47.A  48.B  49.B  50.B
51.B  52.A  53.B  54.B  55.B  56.B  57.B  58.B  59.B  60.A
61.B  62.B  63.A  64.B  65.B  66.A  67.B  68.B  69.B  70.B
71.B  72.A  73.B  74.A  75.B  76.B  77.B  78.B  79.B  80.B
81.B  82.B  83.B  84.B  85.B  86.B  87.B  88.B  89.B  90.B
91.B  92.B  93.B  94.B  95.B  96.B  97.B  98.B  99.B  100.B

**Passing threshold: 89 / 100.**
