# Promotion Exam: Junior Data Engineer 1 → Junior Data Engineer 2

**Track:** Data Engineer (Specialist)
**Format:** 100 multiple-choice questions
**Time:** 135 minutes
**Passing score:** 89 / 100

**Scope.** A Junior DE 1 handles scoped data tasks under supervision. A Junior DE 2 should own a pipeline or dataset end-to-end with light review — writing robust SQL and transformations, building batch pipelines with an orchestrator, modeling data for analytics, implementing data-quality checks, and troubleshooting pipeline failures without corrupting data. This exam deepens SQL, dimensional modeling, ETL/ELT pipeline construction, orchestration, warehouse fundamentals, an introduction to distributed processing and streaming, and the data-quality and collaboration practices a Junior 2 must demonstrate.

---

## Section A — Advanced SQL (Q1–Q14)

**1.** A window function's `PARTITION BY`:
A) Filters rows
B) Divides rows into groups within which the window function is computed independently — without collapsing them like GROUP BY
C) Sorts the whole table
D) Joins tables

**2.** `ROW_NUMBER()` vs `RANK()` vs `DENSE_RANK()`:
A) Are identical
B) Differ in how they handle ties — ROW_NUMBER is always unique, RANK leaves gaps after ties, DENSE_RANK does not
C) All ignore ties
D) Only ROW_NUMBER exists

**3.** A running total is computed with:
A) GROUP BY
B) A window function with an ordered frame (e.g., SUM(...) OVER (ORDER BY ...))
C) A subquery only
D) DISTINCT

**4.** `LAG()` / `LEAD()`:
A) Aggregate all rows
B) Access a value from a previous/next row within the window — useful for comparing consecutive events (e.g., time between events)
C) Filter rows
D) Join tables

**5.** A self-join:
A) Is invalid
B) Joins a table to itself — useful for comparing rows within the same table (e.g., hierarchy, pairs)
C) Doubles the database
D) Is the same as a cross join

**6.** A correlated subquery:
A) Runs once
B) References the outer query and runs per outer row — powerful but potentially slow; often rewritable as a join or window function
C) Is a CTE
D) Cannot reference the outer query

**7.** `UNION` versus `UNION ALL`:
A) Are identical
B) `UNION` removes duplicates (costly); `UNION ALL` keeps all rows (faster) — use ALL when you know there are no duplicates or want them
C) UNION ALL removes duplicates
D) UNION keeps duplicates

**8.** A query that is slow on a large table:
A) Add more memory
B) Examine the query plan (EXPLAIN) — check for full scans, missing indexes/partitions, or fan-out joins, then address the actual cause
C) Rewrite randomly
D) Restart the database

**9.** `EXPLAIN` / query plan:
A) Runs the query twice
B) Shows how the engine will execute a query — which scans, joins, and indexes — the primary tool for diagnosing slow queries
C) Is a comment
D) Adds an index

**10.** A `GROUP BY` with a fan-out join upstream:
A) Is always correct
B) Can double-count — if a join multiplied rows before aggregation, sums and counts are inflated; aggregate at the right grain or dedupe first
C) Cannot happen
D) Is a syntax error

**11.** Filtering on a `LEFT JOIN`'s right-side column in `WHERE`:
A) Is fine
B) Can silently convert it to an inner join (NULLs fail the condition) — put such conditions in the ON clause if you mean to preserve unmatched rows
C) Errors
D) Is required

**12.** A pivot (rows to columns):
A) Is impossible in SQL
B) Reshapes data (often via conditional aggregation or a PIVOT clause) — useful for reporting layouts
C) Is a join
D) Deletes data

**13.** Handling NULLs deliberately (COALESCE, NULLIF):
A) Is unnecessary
B) Controls how missing values behave in calculations — e.g., COALESCE provides a default, preventing NULLs from silently propagating
C) Slows queries
D) Is decorative

**14.** Casting and type mismatches:
A) Never cause bugs
B) Are a common source of subtle errors (string vs number comparisons, integer division, date parsing) — be explicit about types
C) Are automatic and safe
D) Are a security feature

---

## Section B — Dimensional Modeling Deeper (Q15–Q26)

**15.** Grain of a fact table:
A) Is decorative
B) Is the level of detail one row represents (e.g., one row per order line) — defining it clearly is the most important modeling decision; mixed grain causes double counting
C) Is the row count
D) Does not matter

**16.** Mixing grains in one fact table:
A) Is efficient
B) Causes incorrect aggregations — rows at different levels of detail sum inconsistently; keep one grain per fact table
C) Is required
D) Is impossible

**17.** Additive, semi-additive, and non-additive measures:
A) Are all summable
B) Differ in how they aggregate — additive (sum across all dimensions, e.g., revenue), semi-additive (sum across some, e.g., account balance not across time), non-additive (e.g., ratios); summing the wrong kind produces nonsense
C) Are the same
D) Cannot be aggregated

**18.** A conformed dimension:
A) Is a fact table
B) Is a dimension shared consistently across multiple fact tables/marts, so metrics can be compared and combined coherently
C) Is denormalized junk
D) Is an index

**19.** Slowly Changing Dimension Type 1:
A) Keeps full history
B) Overwrites the old value — simple, but loses history
C) Adds a new row
D) Deletes the dimension

**20.** Slowly Changing Dimension Type 2:
A) Overwrites values
B) Preserves history by adding a new versioned row (with effective dates / current flag) when an attribute changes
C) Deletes old rows
D) Is the same as Type 1

**21.** A late-arriving dimension:
A) Never happens
B) Occurs when a fact references a dimension record that has not arrived yet — handled with a placeholder/inferred member updated later
C) Corrupts the warehouse
D) Is a fact table

**22.** A degenerate dimension:
A) Is broken
B) Is a dimension value stored in the fact table itself (e.g., an order number) with no separate dimension table — legitimate for high-cardinality identifiers
C) Is a corrupt dimension
D) Must be removed

**23.** A junk dimension:
A) Is garbage data
B) Combines several low-cardinality flags/indicators into one small dimension to avoid cluttering the fact table — a real, useful pattern
C) Should be deleted
D) Is a fact table

**24.** Normalized (3NF) versus dimensional modeling for analytics:
A) 3NF is always best for analytics
B) 3NF suits transactional integrity; dimensional (star schema) is generally friendlier for analytical query performance and understandability
C) They are identical
D) Dimensional is for transactions

**25.** A "wide table" / one-big-table approach:
A) Is always wrong
B) Denormalizes everything into one wide table — simple and fast to query in columnar warehouses, at the cost of redundancy and update complexity; a legitimate modern pattern for analytics
C) Is the same as 3NF
D) Cannot be queried

**26.** Choosing the model:
A) Always star schema
B) Depends on the workload, the warehouse, and the team — dimensional, wide-table, and normalized approaches each fit different situations
C) Always one big table
D) The model is irrelevant

---

## Section C — ETL/ELT Pipeline Construction (Q27–Q40)

**27.** Extract from a source database:
A) Query the production database hard during peak
B) Consider load on the source — use read replicas, off-peak windows, or change-data-capture rather than hammering the primary
C) Always full-scan the primary
D) Is impossible

**28.** Change Data Capture (CDC):
A) Copies the whole table each run
B) Captures only inserts/updates/deletes from a source (often via the transaction log) — enabling efficient incremental sync without full reloads
C) Is a full reload
D) Is a file format

**29.** Full load versus incremental load:
A) Are the same
B) Full reloads everything (simple, expensive); incremental loads only new/changed data (efficient, but needs a reliable change marker) — chosen by data size and change rate
C) Incremental reloads everything
D) Full is always better

**30.** A watermark / high-water mark in incremental loads:
A) Is a logo
B) Tracks the last processed point (e.g., max updated_at) so the next run picks up from there — care needed with late/updated records and boundary conditions
C) Is a partition
D) Is decorative

**31.** Idempotent loading (safe re-runs):
A) Append blindly every run
B) Design loads so re-running does not duplicate — e.g., overwrite the target partition, or merge/upsert on a key, rather than blind append
C) Is impossible
D) Requires deleting the table

**32.** A MERGE / upsert:
A) Only inserts
B) Inserts new rows and updates existing ones by key in one operation — a common idempotent load pattern
C) Only deletes
D) Duplicates rows

**33.** Staging data before final load:
A) Is wasteful
B) Loads raw data into a staging area first, then validates and transforms before promoting to production tables — isolating bad data and enabling checks
C) Is the same as final load
D) Corrupts data

**34.** Transformations in ELT:
A) Happen before loading
B) Happen inside the warehouse after loading raw data — leveraging the warehouse's compute; tools like dbt manage these SQL transformations as versioned, tested models
C) Do not happen
D) Are manual only

**35.** dbt (or similar transformation tooling):
A) Is an orchestrator
B) Manages SQL transformations as version-controlled, tested, documented models with dependency graphs — bringing software engineering practices to analytics transformations
C) Is a database
D) Is a BI tool

**36.** A transformation that overwrites the source of truth:
A) Is fine
B) Is risky — preserve raw/source data (immutable) and build transformations on top, so you can reprocess and audit; never destroy the raw layer
C) Saves space and is best
D) Is required

**37.** A layered architecture (raw → cleaned → marts / medallion):
A) Is over-engineering
B) Separates concerns — immutable raw ingestion, cleaned/conformed data, and business-ready marts — improving debuggability, reprocessing, and trust
C) Is one table
D) Is deprecated

**38.** Handling schema changes from a source:
A) Ignore them
B) Detect and handle them deliberately — a source adding/removing/renaming a column can silently break or corrupt a pipeline; validate schema and evolve intentionally
C) They never happen
D) Crash always

**39.** A pipeline that partially completes then fails:
A) Leave it half-done
B) Should leave the target in a consistent state — use transactions, staging-then-swap, or partition overwrites so partial runs do not leave corrupt/duplicated data
C) Is unrecoverable
D) Is fine

**40.** Reprocessing/backfilling historical data:
A) Is impossible once loaded
B) Requires the pipeline to be reproducible and idempotent so you can safely recompute past periods (after a bug fix or logic change) without duplication
C) Always duplicates data
D) Is the analyst's job

---

## Section D — Orchestration and Scheduling (Q41–Q50)

**41.** An orchestrator's role:
A) Stores data
B) Schedules and sequences tasks, manages dependencies, retries failures, and provides visibility into pipeline runs
C) Queries data
D) Is a warehouse

**42.** Task dependencies in a DAG:
A) Are decorative
B) Ensure a task runs only after its inputs are ready — running on incomplete upstream data produces wrong results
C) Slow the pipeline
D) Are optional

**43.** Retries with backoff on a failed task:
A) Retry instantly forever
B) Retry a bounded number of times with delay — handling transient failures (network blips) without hammering a struggling dependency; but not all failures should be retried blindly
C) Never retry
D) Retry only manually

**44.** A task that is not idempotent being retried:
A) Is safe
B) Can duplicate or corrupt data on retry — a key reason tasks should be idempotent, since orchestrators retry automatically
C) Cannot be retried
D) Is fine

**45.** Scheduling and data availability:
A) Schedule by clock only, ignore data
B) Consider whether the upstream data is actually ready at the scheduled time — a job scheduled before its source lands produces empty or partial results
C) Data readiness is irrelevant
D) Always run at midnight

**46.** A sensor / data-readiness check:
A) Is decorative
B) Waits for a condition (a file landed, a partition exists) before proceeding — so downstream tasks do not run on missing data
C) Slows things pointlessly
D) Is a warehouse feature

**47.** Alerting on pipeline failures:
A) Is unnecessary
B) Is essential — unattended pipelines fail, and without alerts, stale or missing data silently reaches users
C) Slows the pipeline
D) Is the analyst's job

**48.** A silent SLA miss (pipeline late but not failed):
A) Is fine
B) Is worth alerting on — data that is correct but late can still be wrong for decisions expecting fresh data; monitor timeliness, not just success
C) Cannot happen
D) Is the source's problem

**49.** Parameterizing a pipeline (e.g., by date):
A) Hardcode the date
B) Pass the run date/parameters in, so the same code can run for any period — enabling backfills and reproducible reruns
C) Is impossible
D) Is unnecessary

**50.** Idempotent, parameterized, dependency-aware tasks:
A) Are over-engineering
B) Are the foundation of reliable pipelines — safe reruns, correct ordering, and reproducible backfills all depend on them
C) Slow development
D) Are unnecessary

---

## Section E — Data Warehouses and Query Engines (Q51–Q62)

**51.** A columnar cloud warehouse (BigQuery, Snowflake, Redshift, etc.):
A) Is row-oriented
B) Stores data columnar and scales compute for analytical queries — optimized for scanning and aggregating large volumes, unlike transactional databases
C) Is for transactions
D) Is a file format

**52.** Why analytical and transactional databases differ:
A) They do not
B) OLTP (transactional) optimizes many small reads/writes with row storage and strong consistency; OLAP (analytical) optimizes large scans/aggregations with columnar storage — different workloads, different designs
C) OLAP is for transactions
D) OLTP is for analytics

**53.** Partitioning in a warehouse:
A) Is decorative
B) Splits a table (e.g., by date) so queries prune irrelevant partitions — dramatically reducing scanned data and cost
C) Duplicates data
D) Slows queries

**54.** Clustering / sort keys:
A) Are irrelevant
B) Organize data within storage so queries filtering on those keys read less — improving performance on common filter patterns
C) Encrypt data
D) Are the same as partitions exactly

**55.** A query scanning a full multi-terabyte table because it lacks partition filtering:
A) Is fine
B) Is slow and (in pay-per-scan warehouses) expensive — filtering on the partition column prunes data; unpruned scans are a common cost and performance problem
C) Is required
D) Cannot be avoided

**56.** Cost in a pay-per-query warehouse:
A) Is irrelevant to engineers
B) Is directly tied to data scanned — partitioning, selecting only needed columns, and avoiding SELECT * on huge tables control cost
C) Is unlimited
D) Is the finance team's job only

**57.** `SELECT *` on a wide columnar table:
A) Is efficient
B) Reads every column, defeating columnar efficiency and increasing cost — select only the columns you need
C) Is required
D) Is the same as selecting one column

**58.** Materialized views / precomputed aggregates:
A) Are always wasteful
B) Precompute expensive results so common queries are fast and cheap — at the cost of refresh logic and storage; a common optimization
C) Are the same as views
D) Cannot be refreshed

**59.** A view versus a table:
A) Are identical
B) A view is a saved query (computed on read, always current, no storage); a table stores data (fast to read, must be refreshed) — different trade-offs
C) A view stores data
D) A table is a query

**60.** Separation of storage and compute (modern warehouses):
A) Is a limitation
B) Lets storage and query compute scale independently — enabling elastic, on-demand compute over shared data
C) Means data is lost
D) Is the same as old warehouses

**61.** Concurrency and warehouse scaling:
A) Is unlimited and free
B) Has limits and costs — many concurrent heavy queries contend for compute; workload management and right-sizing matter
C) Is irrelevant
D) Is automatic and free

**62.** A slow analytical query:
A) Add memory
B) Investigate with the query plan and warehouse metrics — check partition pruning, column selection, join strategy, and data skew, then address the real cause
C) Rewrite randomly
D) Restart the warehouse

---

## Section F — Introduction to Distributed and Streaming (Q63–Q74)

**63.** Distributed processing (Spark, etc.):
A) Runs on one machine
B) Splits work across many machines to process data too large for one — enabling analytics at scale, with its own complexity (shuffles, skew, partitioning)
C) Is the same as pandas
D) Is a database

**64.** A "shuffle" in distributed processing:
A) Is free
B) Is moving data across the network between machines (e.g., for a join or group-by) — often the most expensive operation; minimizing shuffles is key to performance
C) Is a local operation
D) Is decorative

**65.** Data skew in distributed jobs:
A) Never happens
B) Occurs when data is unevenly distributed (one key has far more rows), overloading one worker while others idle — a common cause of slow distributed jobs
C) Speeds jobs
D) Is a network setting

**66.** Partitioning in distributed processing:
A) Is irrelevant
B) Determines how data is split across workers — good partitioning enables parallelism; poor partitioning causes skew and excessive shuffles
C) Duplicates data
D) Is the same as a warehouse partition exactly

**67.** When to use distributed processing versus a single machine:
A) Always distribute
B) Distribute when data genuinely exceeds a single machine's capacity — for smaller data, a single machine (or the warehouse) is simpler and often faster
C) Never distribute
D) Only for streaming

**68.** Batch versus streaming processing:
A) Are the same
B) Batch processes data in scheduled chunks (higher latency, simpler); streaming processes events continuously as they arrive (low latency, more complex) — chosen by latency needs
C) Streaming is always better
D) Batch is obsolete

**69.** A streaming platform (Kafka, etc.):
A) Is a warehouse
B) Is a durable, ordered log of events that producers write and consumers read — the backbone of many streaming and event-driven data systems
C) Is a database
D) Is a file format

**70.** At-least-once delivery in streaming:
A) Means exactly once
B) Means events may be delivered more than once — consumers must be idempotent or deduplicate to avoid double counting
C) Means at most once
D) Guarantees no duplicates

**71.** Event time versus processing time:
A) Are the same
B) Event time is when something happened; processing time is when the pipeline handled it — using the wrong one (especially with late data) corrupts time-based aggregations
C) Only processing time matters
D) Are irrelevant

**72.** Windowing in stream processing:
A) Is a UI concept
B) Groups events into time windows (tumbling, sliding) for aggregation — with policies for late-arriving events
C) Is a database index
D) Is decorative

**73.** A late event in a streaming aggregation:
A) Never happens
B) Is a real challenge — events arriving after their window closed require a policy (allowed lateness, reprocessing, or accepting some inaccuracy)
C) Corrupts everything unavoidably
D) Is the producer's problem only

**74.** Choosing streaming over batch:
A) Always stream for modernity
B) Stream when low latency genuinely matters; otherwise batch is simpler, cheaper, and easier to reason about — do not add streaming complexity without a real need
C) Never stream
D) They are identical

---

## Section G — Data Quality and Reliability (Q75–Q88)

**75.** Automated data quality tests in the pipeline:
A) Are optional
B) Should run as part of the pipeline — uniqueness, not-null, referential integrity, ranges, and freshness — failing loudly or quarantining bad data before it reaches users
C) Slow the pipeline pointlessly
D) Are the analyst's job

**76.** A test that a primary key is unique:
A) Is redundant
B) Catches duplicates that fan out joins and inflate metrics — one of the highest-value data tests
C) Slows queries
D) Is unnecessary

**77.** Anomaly detection on metrics (row counts, sums vs history):
A) Is over-engineering
B) Catches silent breaks — a sudden drop or spike versus historical norms flags problems automated schema checks miss
C) Is unnecessary
D) Is the analyst's job

**78.** When a data quality check fails in production:
A) Load the data anyway
B) Halt or quarantine, alert, and investigate — loading suspect data into trusted tables is worse than a delayed pipeline
C) Delete the source
D) Ignore and continue

**79.** Data contracts (agreements on schema/semantics between producers and consumers):
A) Are bureaucracy
B) Define what a source will provide (schema, meaning, guarantees) so consumers are not silently broken by upstream changes — increasingly important
C) Are the same as a schema file only
D) Are unnecessary

**80.** A source team changes a column's meaning without notice:
A) Is fine
B) Silently corrupts every downstream metric using it — data contracts, validation, and communication guard against this class of failure
C) Never happens
D) Is the consumer's fault

**81.** Reproducibility of a reported number:
A) Does not matter
B) Is essential for trust — being able to trace and recompute a number from raw data is what lets you defend and debug it
C) Slows reporting
D) Is the analyst's job

**82.** A pipeline that quietly produces slightly wrong numbers:
A) Is acceptable if close
B) Is dangerous — "close but wrong" numbers erode trust and mislead decisions, and are harder to catch than obvious failures
C) Is fine
D) Is impossible

**83.** Monitoring freshness and completeness:
A) Success/failure is enough
B) A pipeline can "succeed" while producing stale or incomplete data — monitor that data is fresh and complete, not just that the job exited zero
C) Is unnecessary
D) Is the analyst's job

**84.** Documenting datasets (definitions, grain, units, owners):
A) Is a waste
B) Prevents misuse — undocumented data gets misinterpreted (wrong units, unclear grain), producing confident wrong conclusions; a data catalog helps at scale
C) Writes itself
D) Is the analyst's job only

**85.** A backfill after fixing a logic bug:
A) Just fix going forward
B) Often requires reprocessing affected historical data so past reports are also corrected — and communicating that historical numbers changed
C) Is impossible
D) Corrupts data

**86.** Preserving raw/immutable source data:
A) Is wasteful
B) Enables reprocessing, auditing, and recovery — if transformations have a bug, you can recompute from raw; destroying raw data removes that safety net
C) Is required to delete
D) Is the same as the final table

**87.** A validation that yesterday's partition has roughly expected volume:
A) Is paranoid
B) Catches silent upstream breaks — a partition with far too few (or too many) rows signals a problem before users see wrong dashboards
C) Slows the pipeline
D) Is unnecessary

**88.** When you discover historical data has been wrong:
A) Fix silently
B) Fix it, backfill the correction, and communicate to affected users that past numbers changed — silent corrections destroy trust
C) Hide it
D) Blame the source

---

## Section H — Collaboration, Security, and Habits (Q89–Q100)

**89.** Working with analysts and data scientists:
A) Hand over data and disengage
B) Understand how they use the data so you build the right models, grain, and freshness — you are enabling their work, and their needs shape your design
C) Adversarial
D) Ignore them

**90.** Working with source/application teams:
A) Assume their data will never change
B) Collaborate on data contracts and change communication — since their schema and semantics changes directly affect your pipelines
C) Only via tickets
D) Avoid them

**91.** A stakeholder asks for a metric defined ambiguously:
A) Guess and build it
B) Clarify the exact definition (grain, filters, time basis) first — ambiguous metric definitions produce numbers people argue about later
C) Refuse
D) Build several versions

**92.** Credentials and secrets in pipeline code:
A) Hardcode them
B) Keep out of code — use a secrets manager or environment injection; committed database and cloud credentials are a serious, common leak
C) Email them
D) Put in the repo

**93.** Access to sensitive/PII data:
A) Is unrestricted for engineers
B) Should follow least privilege and need-to-know, with masking/anonymization where possible — data engineers handle the most sensitive data and must protect it
C) Is unregulated
D) Is the analyst's concern

**94.** A destructive operation on a production dataset:
A) Is routine
B) Demands care — verify the target, prefer reversible/staged approaches, and confirm before running; data loss is often irreversible
C) Is harmless
D) Should be quick

**95.** Testing a transformation before production:
A) Is a waste
B) Is essential — validate on a sample or dev environment; production data is not where you discover a transformation is wrong
C) Is impossible
D) Slows delivery

**96.** Version-controlling and reviewing SQL/pipeline code:
A) Is unnecessary
B) Is essential — transformations and pipelines are code; review catches logic errors that would silently corrupt data
C) Is for app developers only
D) Slows work

**97.** Saying "I do not know, let me verify":
A) Damages credibility
B) Is essential in data work — confirming a number is correct beats confidently reporting a wrong one
C) Is for juniors
D) Should be hidden

**98.** A risky pipeline change on a Friday:
A) Is fine
B) Deserves caution — a broken pipeline can quietly produce bad data all weekend before anyone notices; prefer changing risky things when people are watching
C) Is required
D) Cannot cause harm

**99.** Understanding the business meaning of the data:
A) Is not the engineer's concern
B) Makes you far more effective — knowing what a metric means and how it is used reveals which correctness and freshness properties actually matter
C) Is the analyst's job only
D) Is a distraction

**100.** The most reliable predictor of growth past Junior 2 is:
A) Speed
B) Building pipelines that are reproducible, idempotent, tested, and trustworthy — plus strong SQL and modeling and healthy skepticism about correctness
C) Never asking questions
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
