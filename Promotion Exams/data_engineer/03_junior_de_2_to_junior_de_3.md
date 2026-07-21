# Promotion Exam: Junior Data Engineer 2 → Junior Data Engineer 3

**Track:** Data Engineer (Specialist)
**Format:** 100 multiple-choice questions
**Time:** 150 minutes
**Passing score:** 89 / 100

**Scope.** Junior DE 3 is the top of the specialist track before convergence into the generalist senior level. A Junior DE 3 owns a significant data domain or platform capability with minimal supervision, designs reliable and scalable pipelines and data models, leads on data quality and observability, tunes performance and cost, handles streaming where needed, and shows early data-engineering judgment. This exam tests that depth: distributed processing at depth, streaming and real-time, advanced modeling and warehouse optimization, data quality and observability engineering, pipeline reliability and orchestration at scale, data governance and security, and cost/performance judgment.

**Reminder.** This is the last specialist-only data-engineering exam. The next exam (Junior 3 → Senior 1) is the convergence point and tests whether the candidate has broadened into a senior engineer who understands the systems producing and consuming the data — applications, services, and the business — not only the pipelines in between. A candidate who aces this but cannot read application code or understand how the data is actually used is not ready for the next gate.

---

## Section A — Distributed Processing at Depth (Q1–Q14)

**1.** The fundamental cost in distributed processing is:
A) CPU only
B) Data movement across the network (shuffles) — minimizing and optimizing shuffles is central to performance
C) Storage only
D) There is no cost

**2.** A shuffle happens during:
A) A simple filter
B) Operations that redistribute data across workers — joins, group-by, repartition, and distinct — moving data over the network
C) Reading a file
D) A local map

**3.** Data skew's effect:
A) Speeds jobs
B) A few overloaded partitions become stragglers while others finish — the job is only as fast as its slowest partition; skew is a top performance killer
C) Is harmless
D) Only affects storage

**4.** Mitigating skew:
A) Add more workers
B) Techniques like salting hot keys, isolating skewed values, or broadcast joins for small tables — address the uneven distribution, not just add capacity
C) Ignore it
D) Reduce data

**5.** A broadcast join:
A) Shuffles both tables
B) Sends a small table to every worker so a large table can be joined locally without shuffling it — efficient when one side is small
C) Is always fastest
D) Requires both tables to be large

**6.** Partitioning strategy for a distributed dataset:
A) Does not matter
B) Determines parallelism and shuffle behavior — right-sized, well-keyed partitions enable parallel work; too few limits parallelism, too many adds overhead
C) Is automatic and optimal
D) Duplicates data

**7.** Lazy evaluation (in engines like Spark):
A) Runs each step immediately
B) Builds a plan and executes only when an action is triggered — enabling the engine to optimize the whole pipeline, but also making it important to understand when computation actually happens
C) Never executes
D) Is the same as eager

**8.** Caching/persisting an intermediate dataset:
A) Always helps
B) Helps when a dataset is reused multiple times (avoiding recomputation), but costs memory and can hurt if misused — apply deliberately
C) Is free
D) Is never useful

**9.** Small files problem:
A) Is imaginary
B) Many tiny files hurt distributed read performance and metadata overhead — compact into larger files for efficient processing
C) Speeds reads
D) Only affects storage cost

**10.** Choosing distributed processing versus the warehouse or a single machine:
A) Always distribute
B) Use the simplest tool that fits — the warehouse or a single machine for moderate data, distributed engines when data genuinely exceeds their capacity; distribution adds real complexity
C) Never distribute
D) They are interchangeable

**11.** A job that spills to disk:
A) Is optimal
B) Indicates memory pressure — the engine writes intermediate data to disk when it does not fit in memory, slowing the job; may need more memory or better partitioning
C) Is faster
D) Is impossible

**12.** Predicate and projection pushdown:
A) Are decorative
B) Push filters and column selection down to the storage/scan layer so less data is read — a major efficiency win with columnar formats
C) Slow queries
D) Are the same as shuffles

**13.** Out-of-memory failures in distributed jobs:
A) Are random
B) Often stem from skew, collecting too much to the driver, or oversized partitions — diagnose the cause rather than blindly increasing memory
C) Cannot be diagnosed
D) Mean the data is corrupt

**14.** Collecting a large result to the driver/client:
A) Is fine
B) Can OOM the driver — pulling a huge distributed dataset to one machine defeats the purpose; write results out distributed instead
C) Is required
D) Is fastest

---

## Section B — Streaming and Real-Time (Q15–Q26)

**15.** Delivery semantics — at-most-once, at-least-once, exactly-once:
A) Are the same
B) Differ in duplication/loss trade-offs — at-least-once may duplicate (needs idempotent consumers), exactly-once is stronger but costlier and often really "effectively once" via idempotency/dedup
C) Exactly-once is trivial
D) At-most-once never loses data

**16.** Achieving effectively-once processing:
A) Is impossible
B) Typically combines at-least-once delivery with idempotent writes or deduplication on a key — so duplicates do not corrupt results
C) Requires no design
D) Is the default

**17.** Event time versus processing time, at depth:
A) Are interchangeable
B) Correct time-based aggregation uses event time with a strategy for late data — processing time is simpler but wrong when events are delayed or reordered
C) Processing time is always correct
D) Event time is irrelevant

**18.** Watermarks in stream processing:
A) Are logos
B) Track progress in event time, signaling when a window can be considered complete and how long to wait for late events — balancing latency against completeness
C) Are partitions
D) Are decorative

**19.** Windowing types (tumbling, sliding, session):
A) Are identical
B) Tumbling: fixed non-overlapping; sliding: overlapping; session: activity-gap-based — each suits different aggregation needs
C) Only tumbling exists
D) Are for batch only

**20.** A late event arriving after its window closed:
A) Is always dropped
B) Is handled by policy — allowed lateness, side outputs for late data, or downstream correction — depending on how much accuracy matters
C) Corrupts everything
D) Never happens

**21.** Backpressure in a streaming system:
A) Does not exist
B) Occurs when a consumer cannot keep up with the producer — the system must slow producers, buffer, or shed load rather than fail or lose data
C) Speeds processing
D) Is a security term

**22.** Consumer lag in a streaming platform:
A) Is irrelevant
B) Measures how far behind consumers are from the latest events — a key health metric; growing lag means the consumer cannot keep up
C) Is a storage metric
D) Cannot be measured

**23.** Ordering guarantees in streaming:
A) Are global and automatic
B) Usually per-partition, not global — designs that assume total ordering across partitions will be wrong; key data so related events land in the same partition when order matters
C) Do not exist
D) Are always global

**24.** Reprocessing a stream (replay):
A) Is impossible
B) Replaying events from a durable log lets you recompute after a bug fix or logic change — a reason to retain events and design idempotent consumers
C) Duplicates unavoidably
D) Corrupts the log

**25.** Lambda versus Kappa architecture:
A) Are the same
B) Lambda runs parallel batch and streaming paths (accurate + fast, but duplicated logic); Kappa uses a single streaming path with replay — a real architectural trade-off
C) Lambda is streaming-only
D) Kappa is batch-only

**26.** Choosing streaming for a use case:
A) Always, for modernity
B) Only when low latency genuinely delivers value — streaming adds significant complexity (state, ordering, late data, exactly-once); batch is simpler when latency permits
C) Never
D) They are identical in complexity

---

## Section C — Advanced Modeling and Warehouse Optimization (Q27–Q40)

**27.** Grain discipline at scale:
A) Mix grains freely
B) Every fact table has one clearly defined grain; violating this is the most common cause of double-counting in large models
C) Grain is irrelevant
D) One grain per warehouse

**28.** Incremental models in the warehouse:
A) Always full-refresh
B) Process only new/changed data into the model each run — efficient at scale, but require careful handling of updates, late data, and idempotency
C) Are impossible
D) Duplicate data always

**29.** A wide, denormalized analytics table:
A) Is always wrong
B) Trades storage and redundancy for query simplicity and speed in columnar warehouses — a legitimate modern pattern, balanced against update complexity
C) Cannot be queried
D) Is 3NF

**30.** Partitioning and clustering a large warehouse table:
A) Are decorative
B) Partition on common filter columns (often date) for pruning, and cluster/sort on frequent filter/join keys — together they cut scanned data and cost dramatically
C) Duplicate data
D) Slow queries

**31.** Choosing a partition column:
A) Any column
B) A column frequently used in query filters, with reasonable cardinality — over-partitioning (too many tiny partitions) is as harmful as none
C) The primary key always
D) A random column

**32.** Slowly changing dimensions at scale:
A) Always Type 1
B) Choose per attribute and use case — Type 2 preserves history (needed for point-in-time correctness) at storage/complexity cost; Type 1 is simpler but loses history
C) SCDs are obsolete
D) Always Type 2

**33.** Point-in-time correctness:
A) Is impossible
B) Means joining facts to the dimension values as they were at the event time (not current) — requires history (Type 2) and careful joins; getting it wrong misattributes data
C) Is automatic
D) Is the same as current-value joins

**34.** Materialized views / aggregate tables:
A) Are always wasteful
B) Precompute expensive aggregates to make common queries fast and cheap — with refresh and staleness trade-offs to manage
C) Are the same as views
D) Cannot be refreshed incrementally

**35.** Data modeling for both flexibility and performance:
A) Is impossible
B) Is a deliberate balance — layered architectures (raw → conformed → marts) let you preserve flexibility in lower layers and optimize consumption layers
C) Requires one big table only
D) Requires full normalization

**36.** Handling deletes/updates in an append-oriented analytics store:
A) Is trivial
B) Requires patterns — soft deletes, merge/upsert, or table formats supporting updates — since many analytics stores are append-optimized and updates are expensive
C) Is impossible
D) Corrupts data always

**37.** Open table formats (Iceberg, Delta, Hudi):
A) Are file formats like Parquet
B) Add transactional guarantees, schema evolution, time travel, and efficient updates/deletes on top of columnar files in a lake — bringing warehouse-like reliability to lake storage
C) Are databases
D) Are streaming platforms

**38.** Schema evolution:
A) Never happens
B) Data schemas change over time (new columns, type changes) — handle it deliberately (additive changes, versioning, table formats that support evolution) or pipelines silently break
C) Always breaks everything
D) Is the source's problem only

**39.** Query cost optimization in a pay-per-scan warehouse:
A) Ignore cost
B) Prune partitions, select only needed columns, materialize hot aggregates, and avoid repeated full scans — cost tracks data scanned, and a single bad query can be very expensive
C) Add more compute always
D) Cost is unlimited

**40.** A dashboard running an expensive query every page load:
A) Is fine
B) Is a common cost and performance problem — materialize or cache the result, or aggregate upstream, rather than rescanning raw data per view
C) Is required
D) Cannot be optimized

---

## Section D — Data Quality and Observability Engineering (Q41–Q54)

**41.** Data observability:
A) Is just dashboards
B) Is the ability to understand the health of data systems — freshness, volume, schema, distribution, and lineage — and detect problems, analogous to observability for services
C) Is the same as monitoring CPU
D) Is unnecessary

**42.** The pillars of data observability commonly include:
A) CPU, memory, disk
B) Freshness, volume, schema, distribution/quality, and lineage — each catching a different class of data failure
C) Speed only
D) Row count only

**43.** Freshness monitoring:
A) Is optional
B) Alerts when data has not updated as expected — stale data quietly serving old numbers is a top silent failure; success-without-freshness is a real trap
C) Is the same as success monitoring
D) Slows pipelines

**44.** Volume/row-count anomaly detection:
A) Is paranoid
B) Flags unexpected drops or spikes versus history — catching silent upstream breaks and fan-outs before users see wrong dashboards
C) Is unnecessary
D) Is the analyst's job

**45.** Distribution monitoring:
A) Is over-engineering
B) Watches for shifts in a column's statistics (nulls, ranges, category mix) — catching subtle corruption or upstream changes that row counts miss
C) Is impossible
D) Is decorative

**46.** Schema-change detection:
A) Is unnecessary
B) Alerts when a source's schema changes (added/removed/retyped columns) — preventing silent breakage or corruption downstream
C) Slows pipelines
D) Never needed

**47.** Data lineage tooling:
A) Is decorative
B) Tracks how datasets derive from sources through transformations — essential for impact analysis ("what breaks if this changes?") and root-causing bad data
C) Is a backup
D) Is the analyst's job

**48.** Data quality tests as code (dbt tests, Great Expectations):
A) Are manual only
B) Codify expectations that run automatically in the pipeline — catching regressions like software tests, and documenting the data's contract
C) Replace the pipeline
D) Are unnecessary

**49.** A circuit breaker on data quality:
A) Is a network device
B) Stops a pipeline from promoting data that fails critical checks — preventing bad data from reaching trusted tables, at the cost of a delay
C) Is a streaming term
D) Corrupts data

**50.** When a metric silently drifts wrong over weeks:
A) Is unavoidable
B) Is exactly what distribution and anomaly monitoring exist to catch — gradual corruption is harder to notice than a crash, so automated statistical checks matter
C) Cannot happen
D) Is the analyst's fault

**51.** Root-causing bad data:
A) Guess
B) Use lineage to trace upstream, check each transformation's inputs/outputs, and localize where the data went wrong — systematic, like debugging code
C) Rebuild everything
D) Blame the source

**52.** SLAs/SLOs for data:
A) Are marketing
B) Define freshness, completeness, and quality targets for datasets so consumers know what to expect and breaches are visible — reliability engineering applied to data
C) Are irrelevant
D) Are the same as query speed

**53.** A data incident (bad data reached users):
A) Fix silently
B) Treat like a service incident — mitigate (correct/quarantine), communicate to affected users, root-cause, and add a check to prevent recurrence, blamelessly
C) Ignore if small
D) Blame someone

**54.** Documenting datasets and a data catalog:
A) Are a waste
B) Make data discoverable and correctly understood (definitions, grain, owners, freshness) — preventing the misuse that produces confident wrong conclusions at scale
C) Write themselves
D) Are the analyst's job only

---

## Section E — Pipeline Reliability at Scale (Q55–Q66)

**55.** Idempotency at scale:
A) Is optional
B) Is essential — with many jobs, retries, and backfills, non-idempotent pipelines accumulate duplicates and corruption; design every load to be safely re-runnable
C) Slows pipelines
D) Is for streaming only

**56.** Atomic writes / staging-then-swap:
A) Are unnecessary
B) Ensure consumers never see a half-written table — write to a staging location and atomically swap, or use transactional table formats, so partial runs are invisible
C) Corrupt data
D) Slow writes pointlessly

**57.** Partition overwrite as an idempotent pattern:
A) Duplicates data
B) Recomputing and overwriting a whole partition (e.g., a day) makes re-runs safe and clean — a common idempotent load strategy
C) Is impossible
D) Appends blindly

**58.** Dependency management across many pipelines:
A) Run everything on a fixed clock
B) Model dependencies explicitly (data-aware scheduling) so downstream jobs run when their inputs are actually ready, not just when the clock says
C) Ignore dependencies
D) Run randomly

**59.** A cascading pipeline failure:
A) Cannot happen
B) One upstream break propagates wrong or missing data to everything downstream — dependency awareness, validation, and circuit breakers limit the spread
C) Is a network issue
D) Is fine

**60.** Retrying a failed pipeline task:
A) Retry forever instantly
B) Bounded retries with backoff for transient failures, but idempotency is what makes retries safe — and some failures (bad data) should not be blindly retried
C) Never retry
D) Retry only manually

**61.** Backfilling large historical ranges:
A) Run one giant job
B) Chunk by partition, run reproducibly and idempotently, monitor progress and cost, and validate results — large backfills are error-prone and expensive if naive
C) Is impossible
D) Always duplicates

**62.** A pipeline's blast radius:
A) Is file size
B) Is how many downstream datasets, dashboards, and decisions depend on it — high-blast-radius pipelines warrant more testing, validation, and careful change management
C) Is row count
D) Is runtime

**63.** Deploying a pipeline logic change:
A) Just deploy to production
B) Test on sample/dev data, understand the impact on historical and future data, plan any needed backfill, and communicate changes to metric definitions
C) Change silently
D) Skip testing

**64.** Orchestration at scale (many DAGs, teams):
A) One giant DAG
B) Modular, owned pipelines with clear dependencies and data contracts between them — so teams can evolve independently without silently breaking each other
C) No orchestration
D) Manual scheduling

**65.** Monitoring pipeline cost and runtime trends:
A) Only success matters
B) Rising cost or runtime signals inefficiency, data growth, or a regression — trend monitoring catches these before they become budget or SLA problems
C) Is unnecessary
D) Is the finance team's job

**66.** A "success" that produced stale or empty data:
A) Is fine
B) Is a silent failure — exit-zero is not correctness; monitor freshness, volume, and quality alongside success
C) Is impossible
D) Means delete the table

---

## Section F — Governance, Security, and Privacy (Q67–Q78)

**67.** Data governance:
A) Is bureaucracy
B) Is the framework of ownership, definitions, access, quality, and compliance that keeps data trustworthy and usable at scale — increasingly a data engineer's concern
C) Is legal-only
D) Is unnecessary

**68.** PII and sensitive data handling:
A) Treat like any data
B) Requires minimization, access control, masking/anonymization, encryption, and compliance with regulations — data engineers sit at the center of sensitive data flows
C) Is unregulated
D) Is the legal team's job only

**69.** Data masking / anonymization:
A) Is optional
B) Protects sensitive data in lower environments and for broader access — techniques like masking, tokenization, and aggregation reduce exposure while keeping data useful
C) Corrupts data
D) Is impossible

**70.** Access control on data:
A) Everyone sees everything
B) Least privilege and role/attribute-based access — restricting who can query what, especially for sensitive columns and rows
C) Is unnecessary
D) Is the analyst's job

**71.** Row-level and column-level security:
A) Do not exist
B) Restrict access to specific rows (e.g., a region's data) or columns (e.g., masking PII) within a table — enforcing governance in the data layer
C) Are the same as encryption
D) Are decorative

**72.** Regulatory requirements (GDPR, data residency, right to deletion):
A) Do not affect data engineering
B) Directly shape pipelines and storage — deletion requests, data residency, retention limits, and consent must be engineered into the data platform
C) Are the legal team's sole concern
D) Are optional

**73.** The "right to be forgotten" in an append-oriented data lake:
A) Is trivial
B) Is genuinely hard — deleting a person's data across immutable files, backups, and derived datasets requires deliberate design (table formats, tokenization, or partitioning strategies)
C) Is impossible so ignore it
D) Is automatic

**74.** Audit logging of data access:
A) Is unnecessary
B) Records who accessed what sensitive data — required for compliance and security, and for investigating misuse
C) Slows queries
D) Is the provider's job

**75.** Encryption at rest and in transit for data:
A) Is optional
B) Protects data on disk and over the network — a baseline expectation for sensitive data, though not a substitute for access control
C) Replaces access control
D) Is unnecessary internally

**76.** Secrets for data sources and warehouses:
A) Hardcode in pipelines
B) Store in a secrets manager with rotation and least-privilege access — data pipelines hold credentials to the most valuable data, making them a high-value target
C) Share in chat
D) Commit to the repo

**77.** Data retention policies:
A) Keep everything forever
B) Retain data only as long as needed/permitted — reducing cost, risk, and compliance exposure; unbounded retention is a liability
C) Delete everything monthly
D) Are the finance team's job

**78.** A data engineer's responsibility for privacy:
A) Ends at moving data
B) Includes protecting sensitive data throughout its lifecycle — collection, storage, access, sharing, and deletion — since they build the systems that handle it
C) Is the legal team's alone
D) Is to install scanners

---

## Section G — Cost, Performance, and Platform Judgment (Q79–Q90)

**79.** Cost as a first-class concern:
A) Is finance's job only
B) Is core data-engineering judgment — storage, compute, and scan costs scale with data, and inefficient pipelines/queries waste significant money
C) Is unlimited
D) Does not matter

**80.** A single query scanning terabytes repeatedly:
A) Is fine
B) Is a common cost sink — partition pruning, column selection, and materialized aggregates cut the scan; monitor and optimize expensive queries
C) Is required
D) Cannot be optimized

**81.** Storage cost management:
A) Ignore it
B) Use compression, appropriate formats, partitioning, lifecycle policies (archiving/deleting old data), and avoid duplicate copies — storage accumulates silently
C) Is unlimited
D) Is the provider's job

**82.** Compute right-sizing:
A) Always max out
B) Match cluster/warehouse size to the workload — oversized wastes money, undersized fails SLAs; measure and tune
C) Always minimize
D) Is impossible

**83.** A pipeline whose cost grows faster than its data:
A) Is normal
B) Signals an efficiency problem (superlinear work, growing shuffles, reprocessing) — investigate, because cost that outpaces data growth becomes unsustainable
C) Is unavoidable
D) Is the finance team's problem

**84.** Balancing latency, cost, and reliability:
A) Maximize all three
B) Is a deliberate trade-off — faster/fresher data and higher reliability cost more; the right point depends on how the data is used
C) They do not interact
D) Only cost matters

**85.** Choosing a tool or engine:
A) The newest or trendiest
B) The one that fits the workload, the team's skills, the existing stack, and the total cost of ownership — not hype
C) The most complex
D) Build your own

**86.** Introducing a new technology to the data platform:
A) Unilaterally
B) Justified against alternatives and total cost (operations, learning, migration, lock-in) — data infrastructure choices are long-lived and expensive to reverse
C) The engineer's call alone
D) Automatic

**87.** Reviewing another engineer's pipeline/SQL PR:
A) Rubber-stamp
B) Review for correctness (grain, joins, dedup), idempotency, cost, and data-quality checks — data code review prevents silent corruption
C) Skip it
D) Only formatting

**88.** Mentoring a junior data engineer:
A) Too early
B) Is part of becoming a Junior 3 — teaching rigor, modeling, and the correctness mindset multiplies the team
C) The lead's job only
D) Wastes time

**89.** Estimating data work:
A) A single number
B) A range accounting for modeling, transformation, testing, backfills, validation, and coordination — with correctness risk clearly communicated
C) The analyst's estimate
D) Zero

**90.** A recurring data quality problem:
A) Fix each instance
B) Fix the systemic cause — a validation, a contract, a design change — so the class stops recurring, rather than repeatedly cleaning up bad data
C) Is unavoidable
D) Is the source's problem

---

## Section H — Judgment and Growth Toward Convergence (Q91–Q100)

**91.** Understanding the source systems producing the data:
A) Is out of scope
B) Increasingly matters — knowing how applications generate the data (events, updates, deletes) explains many data-quality issues and is part of the broadening the next level requires
C) Is the app team's job only
D) Is impossible

**92.** Understanding how the data is consumed:
A) Is not the engineer's concern
B) Is essential — knowing which metrics matter, how they are used, and what "correct" means shapes what to model, validate, and prioritize
C) Is the analyst's job only
D) Is a distraction

**93.** Reading application code that produces the data:
A) Is out of scope
B) Helps diagnose data issues at the source and is part of broadening toward a generalist senior — data problems often originate in the producing application
C) Is the app team's job only
D) Is impossible

**94.** Copy-pasting a transformation you do not understand:
A) Is fine if it runs
B) Is dangerous — wrong data looks right; understand transformations before trusting their output, especially at scale where errors are costly
C) Is required for speed
D) Is encouraged

**95.** Saying "I do not know, let me verify":
A) Damages credibility
B) Is essential — data engineering rewards confirming correctness over confidently reporting a wrong number
C) Is for juniors
D) Should be hidden

**96.** A data engineer who only thinks about pipelines:
A) Is correctly focused
B) Is missing the broadening the next level needs — understanding the producing applications, the consuming analytics, and the business is what distinguishes a senior
C) Is efficient
D) Is the norm

**97.** Automating data quality and governance versus manual checks:
A) Manual scales
B) Automated tests, contracts, and observability scale far beyond manual inspection — prevention and detection built into the platform
C) Are the same
D) Automation is impossible

**98.** Blameless data-incident culture:
A) Lets people off the hook
B) Produces the honesty needed to find and fix systemic causes of bad data — blame drives problems underground and repeats them
C) Is weak
D) Is for managers only

**99.** The mindset shift from Junior 2 to Junior 3:
A) Faster pipelines
B) From building pipelines to owning a data domain — designing for reliability, quality, cost, and scale, leading on correctness, and mentoring
C) More SQL only
D) More jobs

**100.** The trait that most reliably unlocks the move to Senior 1 is:
A) Tool mastery
B) Judgment about correctness, cost, and reliability, paired with broadening beyond pipelines into the producing systems, the consuming analytics, and the business — data engineering as part of the whole system
C) The most pipelines
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

*Administrator's note: This is the last specialist-only data-engineering exam. The next exam (Junior 3 → Senior 1) is the convergence point and tests broadening into a senior engineer who understands the systems producing and consuming the data — applications, services, analytics, and the business — not only the pipelines between them. A candidate who aces this but cannot read application code or explain how the data is actually used should be coached toward that breadth before sitting the convergence exam.*
