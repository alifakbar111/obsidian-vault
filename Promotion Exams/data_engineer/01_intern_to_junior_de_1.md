# Promotion Exam: Intern → Junior Data Engineer 1

**Track:** Data Engineer (Specialist)
**Format:** 100 multiple-choice questions
**Time:** 120 minutes
**Passing score:** 89 / 100

**Scope.** This exam evaluates whether an intern is ready to be hired as a Junior Data Engineer 1. Data engineering builds the pipelines and systems that move, store, and shape data so others can use it reliably. The bar is: "can be trusted with a small, scoped data task under supervision, will not silently corrupt data, and understands why correctness and reproducibility matter." The exam blends the engineering foundation (programming, Git, the command line) with the data-specific bedrock: SQL, data modeling basics, file formats, an introduction to pipelines and batch processing, data quality thinking, and the mindset that data errors are often silent and expensive.

**A note on the data mindset.** Data engineering has a distinctive danger: a bug in application code often crashes loudly, but a bug in a data pipeline frequently produces *wrong numbers that look right*. A miscounted metric, a silently dropped row, a timezone error — these can mislead decisions for months before anyone notices. Correctness, validation, reproducibility, and healthy paranoia about "does this number actually mean what I think?" are core to the job, and this exam weights them heavily.

---

## Section A — The Data Engineering Mindset (Q1–Q12)

**1.** The distinctive danger of data engineering is:
A) Pipelines crash loudly
B) Bugs often produce wrong data that looks correct — silently misleading decisions for a long time before anyone notices
C) Data is always right
D) There are no bugs in data

**2.** A data engineer's core responsibility is:
A) Making dashboards pretty
B) Delivering data that is correct, timely, and trustworthy so downstream users can rely on it
C) Writing application features
D) Managing servers only

**3.** "Garbage in, garbage out" means:
A) Delete all data
B) Downstream analysis is only as good as the input data — quality problems propagate and amplify, so they must be caught early
C) Data is disposable
D) Output does not matter

**4.** Reproducibility in a pipeline means:
A) Running it once
B) Running it again on the same input produces the same output — essential for trust, debugging, and correctness
C) It runs fast
D) It uses random values

**5.** Idempotency in data pipelines:
A) Is irrelevant
B) Means re-running a job produces the same result rather than duplicating or corrupting data — critical because jobs fail and get retried
C) Means running once only
D) Is a security term

**6.** A pipeline that silently drops rows on error:
A) Is robust
B) Is dangerous — data loss that no one notices is worse than a loud failure; pipelines should fail visibly or quarantine bad data, not vanish it
C) Is best practice
D) Is required

**7.** When a metric looks surprising:
A) Trust it and report it
B) Investigate before trusting — surprising numbers are often bugs (double counting, joins fanning out, timezone issues) rather than real findings
C) Ignore it
D) Delete the data

**8.** Data lineage means:
A) A family tree
B) Knowing where data came from and how it was transformed to reach its current form — essential for debugging and trust
C) The data's age
D) A backup

**9.** Validating data as it flows through a pipeline:
A) Is over-cautious
B) Is essential — checking row counts, ranges, nulls, and expected shapes catches corruption before it reaches users
C) Slows the pipeline pointlessly
D) Is the analyst's job

**10.** A schema:
A) Is decorative
B) Defines the structure and types of data — enforcing it prevents malformed data from silently entering the system
C) Is a backup
D) Is optional metadata

**11.** Modifying production data with a hand-written query:
A) Is routine
B) Is high-risk — a mistake can corrupt or destroy data irreversibly; test on a copy, use transactions, and double-check the WHERE clause
C) Is faster and fine
D) Cannot cause harm

**12.** The most valuable habit for a junior data engineer:
A) Speed
B) Healthy skepticism about whether numbers are correct, paired with careful validation and reproducibility
C) Never asking questions
D) Avoiding SQL

---

## Section B — SQL Foundations (Q13–Q30)

**13.** `SELECT ... FROM ... WHERE`:
A) Deletes rows
B) Retrieves rows matching a condition — the fundamental read operation
C) Creates a table
D) Updates data

**14.** A `JOIN`:
A) Concatenates tables vertically
B) Combines rows from two tables based on a related column
C) Deletes rows
D) Doubles the data always

**15.** Inner join versus left join:
A) Are the same
B) Inner returns only matching rows; left returns all rows from the left table with matches where they exist, NULLs where they do not
C) Left excludes the left table
D) Inner keeps unmatched rows

**16.** A join that unexpectedly multiplies row counts:
A) Is impossible
B) Is a "fan-out" — joining on a non-unique key produces a row per match, inflating counts and sums; a classic source of wrong metrics
C) Is always correct
D) Means the data is bad

**17.** `GROUP BY`:
A) Sorts rows
B) Groups rows sharing a value so aggregates (COUNT, SUM, AVG) are computed per group
C) Filters rows
D) Joins tables

**18.** `COUNT(*)` versus `COUNT(column)`:
A) Are identical
B) `COUNT(*)` counts all rows; `COUNT(column)` counts non-NULL values in that column — a difference that causes subtle metric bugs
C) Both ignore NULLs
D) Both count NULLs

**19.** `WHERE` versus `HAVING`:
A) Are the same
B) `WHERE` filters rows before grouping; `HAVING` filters groups after aggregation
C) `HAVING` filters rows
D) `WHERE` is for aggregates

**20.** NULL in SQL:
A) Equals zero
B) Represents absence of a value; comparisons with `=` against NULL yield unknown — use `IS NULL` / `IS NOT NULL`
C) Equals empty string
D) Equals false

**21.** `NULL` in a SUM or AVG:
A) Counts as zero in AVG
B) Is ignored by aggregates (not treated as zero) — which can surprise you; AVG divides by non-NULL count
C) Causes an error
D) Counts as the max

**22.** A `LEFT JOIN` where the right side is missing:
A) Excludes the row
B) Keeps the left row with NULLs for the right side's columns — filtering on those columns afterward can accidentally turn it into an inner join
C) Errors
D) Duplicates the row

**23.** `DISTINCT`:
A) Sorts rows
B) Removes duplicate rows from the result
C) Counts rows
D) Joins tables

**24.** A subquery:
A) Is invalid
B) Is a query nested inside another — used to filter, compute, or provide a set for the outer query
C) Is a table
D) Is a join

**25.** A CTE (common table expression, `WITH`):
A) Is a table type
B) Names a query block for readability and reuse within a statement — making complex queries far more maintainable than deeply nested subqueries
C) Is an index
D) Deletes data

**26.** A window function (e.g., `ROW_NUMBER() OVER (...)`):
A) Aggregates all rows into one
B) Computes a value across a set of rows related to the current row without collapsing them — powerful for rankings, running totals, and deduplication
C) Is the same as GROUP BY
D) Filters rows

**27.** Deduplicating rows, keeping the latest per key:
A) Use DISTINCT
B) A common pattern is a window function (ROW_NUMBER partitioned by key, ordered by timestamp) then filtering to row 1
C) Is impossible in SQL
D) Delete randomly

**28.** An index on a column:
A) Stores the data twice for no reason
B) Speeds lookups/filters on that column at the cost of slower writes — important for query performance on large tables
C) Encrypts the column
D) Is the same as a primary key

**29.** A query filtering a huge table on an unindexed column:
A) Is always fast
B) May scan the whole table — fine for small data, slow and costly at scale
C) Fails
D) Is the same as an indexed query

**30.** Running `UPDATE`/`DELETE` without a `WHERE`:
A) Affects one row
B) Affects every row in the table — a classic, catastrophic mistake; always check the WHERE clause and prefer a transaction
C) Errors safely
D) Is harmless

---

## Section C — Data Modeling Basics (Q31–Q42)

**31.** A relational data model:
A) Stores everything in one table
B) Organizes data into related tables with keys, reducing redundancy and expressing relationships
C) Uses no structure
D) Is only for documents

**32.** A primary key:
A) Is the first column
B) Uniquely identifies each row — non-NULL and unique
C) Is decorative
D) Is a foreign key

**33.** A foreign key:
A) Encrypts a row
B) References another table's primary key, expressing a relationship between rows
C) Is the first column
D) Is a synonym for primary key

**34.** Normalization:
A) Duplicates data everywhere
B) Organizes data to reduce redundancy — each fact stored once — improving integrity for transactional systems
C) Means encryption
D) Slows all queries

**35.** Denormalization:
A) Is a bug
B) Deliberately duplicates data to speed reads — common in analytics/warehousing where read performance matters more than write integrity
C) Is always wrong
D) Is the same as normalization

**36.** Why analytics tables are often denormalized:
A) To confuse people
B) Because analytical queries scan and aggregate large volumes, and fewer joins on wide tables are often faster and simpler for that workload
C) They are never denormalized
D) To save space

**37.** A fact table (in dimensional modeling):
A) Holds descriptive attributes
B) Holds measurable events/metrics (sales, clicks) with foreign keys to dimensions — the center of a star schema
C) Is a backup
D) Holds no data

**38.** A dimension table:
A) Holds metrics
B) Holds descriptive context (customers, products, dates) that facts reference — the "who/what/when/where" of the facts
C) Is a fact table
D) Is an index

**39.** A star schema:
A) Is a network diagram
B) Is a central fact table surrounded by dimension tables — a common, query-friendly analytics model
C) Is normalized fully
D) Is a NoSQL concept

**40.** A surrogate key:
A) Is the natural business key
B) Is a system-generated identifier (e.g., an auto-increment or hash) used as a stable primary key independent of changing business values
C) Is a foreign key
D) Is a password

**41.** A slowly changing dimension (SCD):
A) Is a fast table
B) Handles how a dimension's attributes change over time (e.g., a customer's address) — Type 1 overwrites, Type 2 keeps history with versioned rows
C) Is a fact table
D) Is an index

**42.** Choosing a data model:
A) Always fully normalize
B) Match it to the workload — normalized for transactional integrity, dimensional/denormalized for analytics — there is no single right answer
C) Always denormalize
D) Model does not matter

---

## Section D — File Formats and Storage (Q43–Q54)

**43.** CSV:
A) Is a binary format
B) Is simple, human-readable, and widely supported, but has no types, no schema, and quoting/escaping pitfalls — fine for small/interchange data, weak for large analytics
C) Is the best format for everything
D) Is compressed by default

**44.** A common CSV pitfall:
A) It is too fast
B) Values containing commas, quotes, or newlines break naive parsing — proper quoting/escaping and a real parser are required
C) It cannot store text
D) It has strict types

**45.** JSON as a data format:
A) Is columnar
B) Is flexible and self-describing (nested structures) but verbose and row-oriented — good for interchange and semi-structured data, less efficient for large-scale analytics
C) Is binary
D) Has a fixed schema

**46.** Row-oriented versus columnar storage:
A) Are the same
B) Row-oriented is efficient for reading whole records (transactional); columnar is efficient for scanning a few columns over many rows (analytics) — the key storage choice for analytics
C) Columnar is always slower
D) Row-oriented is for analytics

**47.** Parquet (or ORC):
A) Is a text format
B) Is a columnar, compressed, typed format designed for analytics — reading only needed columns and skipping data, far more efficient than CSV at scale
C) Is the same as CSV
D) Is uncompressed

**48.** Why columnar formats are efficient for analytics:
A) They store rows together
B) Queries often touch few columns over many rows; columnar layout reads only those columns, compresses well (similar values together), and skips irrelevant data
C) They are smaller by luck
D) They are not efficient

**49.** Compression in data storage:
A) Always slows things down
B) Reduces storage and I/O (often the bottleneck), frequently speeding queries despite CPU cost — a common and usually worthwhile trade-off
C) Corrupts data
D) Is never used

**50.** Partitioning a dataset (e.g., by date):
A) Is decorative
B) Splits data into segments so queries can skip irrelevant partitions (partition pruning) — dramatically reducing scanned data for filtered queries
C) Duplicates data
D) Slows queries

**51.** A data lake:
A) Is a relational database
B) Stores large volumes of raw/varied data (often in object storage) in open formats — flexible and cheap, but needs governance to avoid becoming a "data swamp"
C) Is a spreadsheet
D) Is a cache

**52.** A data warehouse:
A) Is raw file storage
B) Is a system optimized for analytical queries over structured, curated data — the query engine and model behind most reporting/analytics
C) Is a cache
D) Is a message queue

**53.** Object storage (S3, GCS, etc.):
A) Is a database
B) Is scalable, durable, cheap storage for files/objects — the common foundation of data lakes; accessed by key, not queried like a database
C) Is RAM
D) Is a spreadsheet

**54.** Schema-on-read versus schema-on-write:
A) Are the same
B) Schema-on-write enforces structure when data is stored (databases); schema-on-read applies structure when data is queried (data lakes) — a key flexibility/rigor trade-off
C) Only databases have schemas
D) Lakes have no data

---

## Section E — Pipelines and Batch Processing (Q55–Q66)

**55.** ETL:
A) Is a file format
B) Extract, Transform, Load — pull data from sources, transform it, and load it into a destination — the classic pipeline pattern
C) Is a database
D) Is a query language

**56.** ELT versus ETL:
A) Are identical
B) ELT loads raw data first, then transforms it inside the destination (leveraging the warehouse's power) — increasingly common with modern cloud warehouses
C) ELT does not transform
D) ETL loads first

**57.** A batch pipeline:
A) Processes each event instantly
B) Processes data in scheduled chunks (e.g., hourly/daily) — simpler and cheaper than streaming, suitable when some latency is acceptable
C) Is real-time
D) Never fails

**58.** A pipeline that must be re-run after a failure:
A) Should double the data
B) Should be idempotent — re-running produces the correct result without duplicating or corrupting data (e.g., overwrite a partition rather than append blindly)
C) Cannot be re-run
D) Should append always

**59.** Backfilling:
A) Is deleting data
B) Is running a pipeline over historical periods to populate or correct past data — needs the pipeline to be reproducible and idempotent
C) Is a live stream
D) Is impossible

**60.** A pipeline orchestrator (Airflow, Dagster, etc.):
A) Stores data
B) Schedules, sequences, and monitors pipeline tasks with dependencies and retries — managing when and in what order jobs run
C) Is a database
D) Is a file format

**61.** A DAG (directed acyclic graph) in orchestration:
A) Is a table
B) Represents tasks and their dependencies with no cycles — defining what must run before what
C) Is a query
D) Is a loop

**62.** A task that depends on upstream data not yet ready:
A) Should run anyway
B) Should wait for (or check) the upstream data's readiness — running on incomplete data produces wrong results; orchestrators express these dependencies
C) Should skip
D) Cannot be handled

**63.** Incremental processing:
A) Reprocesses everything each run
B) Processes only new/changed data since the last run — far more efficient than full reprocessing at scale, but requires tracking what has been processed
C) Is impossible
D) Is the same as full reprocessing

**64.** A late-arriving record (data that shows up after its time window was processed):
A) Never happens
B) Is a real problem — pipelines must decide how to handle data that arrives after its period was computed (reprocess, ignore, or a correction window)
C) Corrupts everything unavoidably
D) Is the source's problem only

**65.** Logging and monitoring a pipeline:
A) Are unnecessary
B) Are essential — pipelines run unattended, so failures, row-count anomalies, and delays must be logged and alerted, or bad data reaches users silently
C) Slow the pipeline
D) Are the analyst's job

**66.** A pipeline that succeeded but produced zero rows:
A) Is fine — it succeeded
B) Is suspicious — "success with no data" often indicates an upstream break or a bad filter; validation should flag it
C) Is impossible
D) Means delete the table

---

## Section F — Data Quality and Validation (Q67–Q78)

**67.** Data quality dimensions include:
A) Only accuracy
B) Accuracy, completeness, consistency, timeliness, uniqueness, and validity — different failure modes to check for
C) Only speed
D) Only size

**68.** A null-check validation:
A) Is over-cautious
B) Confirms required fields are populated — unexpected nulls signal upstream problems or bad joins
C) Slows the pipeline
D) Is unnecessary

**69.** A row-count check between stages:
A) Is pointless
B) Catches silent data loss or unexpected fan-out — a large drop or spike in row count is a red flag worth investigating
C) Slows things
D) Is the analyst's job

**70.** A referential integrity check:
A) Is decorative
B) Confirms that foreign keys actually reference existing records — orphaned references indicate corruption or ordering problems
C) Is a performance tool
D) Is unnecessary

**71.** A uniqueness check on a key:
A) Is redundant
B) Catches duplicates that would fan out joins and inflate metrics — a common, costly data-quality bug
C) Slows queries
D) Is the source's job

**72.** A range/domain check (e.g., age between 0 and 120):
A) Is over-engineering
B) Catches impossible or corrupt values before they propagate into metrics
C) Is unnecessary
D) Is the analyst's job

**73.** A freshness check:
A) Is about food
B) Verifies data is up to date (e.g., yesterday's data arrived) — stale data quietly serving old numbers is a common, damaging failure
C) Is a performance metric
D) Is unnecessary

**74.** When a validation check fails:
A) Ignore it and proceed
B) The pipeline should stop or quarantine the bad data and alert, rather than load suspect data into the tables users trust
C) Delete the source
D) Log it and continue silently

**75.** Data quality "tests as code" (e.g., dbt tests, Great Expectations):
A) Are pointless
B) Codify expectations (uniqueness, not-null, ranges, relationships) that run automatically, catching regressions like software tests do
C) Replace the pipeline
D) Are manual only

**76.** A timezone bug in a pipeline:
A) Is trivial
B) Is a classic silent error — mixing UTC and local time, or naive timestamps, shifts events across day boundaries and corrupts daily metrics; standardize on UTC and be explicit
C) Cannot happen
D) Only affects display

**77.** Deduplication in a pipeline:
A) Is unnecessary
B) Is often required — sources deliver duplicates (retries, at-least-once delivery), and undeduplicated data inflates counts; dedupe on a well-chosen key
C) Corrupts data
D) Is the analyst's job

**78.** Documenting what a dataset means (definitions, units, caveats):
A) Is a waste
B) Is essential — undocumented data gets misused (wrong units, misunderstood columns), producing confident wrong conclusions
C) Is the analyst's job only
D) Writes itself

---

## Section G — Programming, Git, and Tools (Q79–Q90)

**79.** Python for data engineering:
A) Is irrelevant
B) Is a dominant language for pipelines and data work (with libraries like pandas, plus SQL) — strong Python and SQL are core skills
C) Is only for web
D) Cannot process data

**80.** A variable, function, conditional, and loop:
A) Are irrelevant to data work
B) Are basic constructs used constantly to write and debug transformations and pipeline logic
C) Are automation-only
D) Do not matter

**81.** pandas (or a dataframe library):
A) Is a database
B) Provides in-memory tabular data manipulation — powerful for smaller data, but does not scale to data larger than memory without care
C) Replaces SQL entirely
D) Is a file format

**82.** Processing a file larger than memory with a naive "load it all" approach:
A) Always works
B) Will exhaust memory and crash — large data needs chunking, streaming, or a distributed/columnar engine
C) Is fastest
D) Is required

**83.** Git for pipeline and SQL code:
A) Is unnecessary
B) Is essential — pipeline code, SQL transformations, and configs belong under version control with review and history, like any code
C) Is for app developers only
D) Slows work

**84.** A `.gitignore` for a data project:
A) Should include the code
B) Should exclude data files, credentials, and large outputs — data and secrets do not belong in the repo
C) Encrypts files
D) Is unnecessary

**85.** Credentials for databases and cloud storage:
A) Hardcode in the script
B) Keep out of code — use environment variables or a secrets manager; committed credentials are a common, serious leak
C) Email them
D) Put them in the repo

**86.** The command line for data work:
A) Is obsolete
B) Is a daily tool — inspecting files, checking sizes, running jobs, and moving data; comfort with the shell is expected
C) Is Windows-only
D) Is unnecessary

**87.** Testing a transformation before running it on production data:
A) Is a waste of time
B) Is essential — validate logic on a sample or in a dev environment; production data is not the place to discover a transformation is wrong
C) Is impossible
D) Slows delivery

**88.** A transformation that changes the meaning of a metric:
A) Is fine if it runs
B) Must be understood and communicated — silently changing how a number is computed breaks the trust of everyone using it
C) Is the analyst's problem
D) Never happens

**89.** Reproducible environments (pinned dependencies, containers):
A) Are over-engineering
B) Ensure a pipeline runs the same way across machines and over time — "it worked last month" failures often trace to unpinned changes
C) Slow development
D) Are unnecessary

**90.** Reading an error/stack trace from a failed job:
A) Is for seniors
B) Is a core skill — the trace usually points to the failing step and reason; reading it beats guessing
C) Is impossible
D) Wastes time

---

## Section H — Security, Ethics, and Habits (Q91–Q100)

**91.** Handling personal/sensitive data (PII):
A) Treat it like any data
B) Handle it carefully — minimize collection, restrict access, comply with regulations, and never expose it casually; data engineers sit close to the most sensitive data
C) Is unregulated
D) Is the legal team's job only

**92.** Copying production data to your laptop for convenience:
A) Is fine
B) Is a liability — real data (especially PII) should not be casually downloaded; use samples, anonymized data, or controlled access
C) Is required
D) Is encrypted automatically

**93.** A destructive operation on a data store (`DROP`, `TRUNCATE`, mass `DELETE`):
A) Is routine
B) Demands extreme care — verify the target, prefer reversible approaches, and confirm before acting; these can destroy data irreversibly
C) Is harmless
D) Should be run quickly

**94.** Logging sensitive data (PII, credentials):
A) Is fine for debugging
B) Is a leak risk — scrub sensitive values before logging, since logs are widely accessible and persistent
C) Is encrypted automatically
D) Is required

**95.** When you discover a data quality bug that has been feeding wrong numbers:
A) Hide it
B) Report it promptly — quantify the impact, notify affected users, and fix it; silent wrong data erodes trust badly, and honesty is essential
C) Fix it silently
D) Blame the source

**96.** Copy-pasting SQL or a transformation you do not understand:
A) Is fine if it runs
B) Is risky — you cannot verify correctness, and wrong data looks right; understand transformations before trusting their output
C) Is required for speed
D) Is encouraged

**97.** Saying "I do not know, let me verify":
A) Damages credibility
B) Is essential — data engineering rewards confirming over assuming; a confident wrong number is worse than an honest "let me check"
C) Is for juniors only
D) Should be hidden

**98.** A pipeline change deployed on a Friday afternoon:
A) Is bold
B) Deserves caution — a broken pipeline may quietly produce bad data all weekend before anyone notices; prefer to change risky things when people are watching
C) Is required
D) Is always fine

**99.** Understanding what downstream users do with the data:
A) Is not the engineer's concern
B) Makes you far more effective — knowing how a metric is used reveals which correctness and freshness properties actually matter
C) Is the analyst's job only
D) Is a distraction

**100.** The most reliable predictor of growth for a junior data engineer is:
A) Speed
B) Rigor and healthy skepticism about correctness, paired with strong SQL and programming and a drive to make pipelines reproducible and trustworthy
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
