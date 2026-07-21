# Promotion Exam: Junior Data Engineer 3 → Senior Engineer 1

**Track:** Convergence — Data Engineering Specialist → Generalist Software Engineer
**Format:** 100 multiple-choice questions
**Time:** 165 minutes
**Passing score:** 89 / 100

**Scope and purpose.** This is the convergence exam for the data-engineering track, parallel to the other tracks. A data-engineering Junior 3 has spent two to four years deepening in pipelines, modeling, warehousing, and data quality. From Senior 1 onward the role broadens: a senior at this company understands the whole system the data lives in — the applications and services that *produce* the data, the analytics and products that *consume* it, and the business decisions the data drives — not just the pipelines in between. This exam confirms the candidate still owns deep data-engineering craft, then tests the breadth: application and code literacy, backend and services, systems and architecture, security across the stack, business context, and senior judgment.

**A note to the candidate.** If you answer Section A comfortably but struggle with the code-literacy, backend, or systems sections, that is information, not failure. A data engineer who has never read the application code that emits the events they process, never reasoned about the service producing a table, or never understood how a metric drives a decision is not yet ready for Senior 1. Deliberate broadening beats passing by luck and struggling in the role.

---

## Section A — Data Engineering Depth a Senior Must Still Own (Q1–Q15)

**1.** A metric is silently wrong across dashboards. The senior's first move is:
A) Rebuild the warehouse
B) Trace the lineage upstream, check each transformation's inputs/outputs, and localize where the data went wrong — systematic, like debugging code
C) Blame the source
D) Ignore it

**2.** A fan-out join inflating a sum:
A) Is always correct
B) Is a classic double-counting bug — joining on a non-unique key multiplies rows; aggregate at the right grain or dedupe first
C) Cannot happen
D) Means the data is bad

**3.** Grain discipline:
A) Mix grains freely
B) One clearly defined grain per fact table — the single most common cause of double-counting when violated
C) Is irrelevant
D) One grain per warehouse

**4.** Idempotency in loads:
A) Is optional
B) Is essential — retries and backfills must not duplicate or corrupt; overwrite partitions or upsert rather than blind append
C) Slows pipelines
D) Is for streaming only

**5.** A pipeline that "succeeded" with stale data:
A) Is fine — exit zero
B) Is a silent failure — monitor freshness, volume, and quality, not just success
C) Is impossible
D) Means delete the table

**6.** Point-in-time correctness:
A) Join to current dimension values
B) Join facts to dimension values as they were at event time — requires history (SCD Type 2); current-value joins misattribute historical data
C) Is automatic
D) Is impossible

**7.** A query scanning terabytes repeatedly:
A) Is fine
B) Is a cost and performance sink — partition pruning, column selection, and materialized aggregates cut the scan
C) Is required
D) Cannot be optimized

**8.** Data skew in a distributed job:
A) Speeds it
B) Creates stragglers that bottleneck the whole job — address with salting, isolation, or broadcast joins, not just more workers
C) Is harmless
D) Is a storage setting

**9.** At-least-once stream delivery:
A) Means exactly once
B) May duplicate — consumers must be idempotent or deduplicate to avoid double counting
C) Loses data
D) Guarantees no duplicates

**10.** A senior reviewing a pipeline PR looks first at:
A) Formatting
B) Correctness (grain, joins, dedup), idempotency, cost, and data-quality checks — the things that determine whether data will be right
C) Line count
D) Naming

**11.** Event time versus processing time:
A) Interchangeable
B) Time-based aggregation must use event time with a late-data strategy — processing time corrupts metrics when events are delayed
C) Processing time is always right
D) Irrelevant

**12.** A recurring data-quality problem:
A) Fix each instance
B) Fix the systemic cause — a validation, contract, or design change — so the class stops recurring
C) Is unavoidable
D) Is the source's problem

**13.** Preserving immutable raw data:
A) Is wasteful
B) Enables reprocessing, auditing, and recovery from transformation bugs — never destroy the raw layer
C) Is the same as the final table
D) Should be deleted

**14.** Data observability:
A) Is CPU monitoring
B) Is understanding data health — freshness, volume, schema, distribution, lineage — to detect problems before users do
C) Is unnecessary
D) Is just dashboards

**15.** A senior data engineer's deepest responsibility is:
A) The most pipelines
B) The correctness, reliability, and trustworthiness of the organization's data — and enabling others to use it well — across all the team's work
C) The tooling budget
D) The row count

---

## Section B — Application and Code Literacy (Q16–Q30)

**16.** Reading application code as a senior data engineer:
A) Is out of scope
B) Is essential — the data you process is produced by application code, and data bugs often originate there; you cannot diagnose or advise on what you cannot read
C) Is the app team's job only
D) Is impossible

**17.** A variable, function, conditional, and loop:
A) Are beyond data work
B) Are constructs a senior reads fluently to follow producing-application logic and debug data issues at the source
C) Are pipeline-only
D) Do not matter

**18.** An application emitting events to a stream:
A) Is a black box to data engineering
B) Is worth understanding — how and when the app emits events (ordering, duplicates, schema) explains much of the data's behavior downstream
C) Is the app team's concern only
D) Cannot be understood

**19.** A bug where an app double-fires an event:
A) Is only a data problem
B) Originates in the application — a senior can read the app code enough to identify it and work with the app team on a fix, rather than only deduping downstream forever
C) Cannot be found
D) Is unfixable

**20.** Reading a diff/PR in the producing application:
A) Is developer-only
B) Lets a senior data engineer anticipate schema and semantic changes before they break pipelines — prevention over cleanup
C) Is impossible
D) Wastes time

**21.** A conditional missing a case in application logic:
A) Is invisible without running it
B) Is spottable by reading code — and can explain why certain records have unexpected or missing values
C) Is not a data concern
D) Cannot exist

**22.** An ORM in the producing application:
A) Is irrelevant to data
B) Shapes how data is written and can explain anomalies (e.g., soft deletes, default values, cascade behavior) a data engineer sees downstream
C) Is a data engineering tool
D) Cannot affect data

**23.** Understanding the source database schema:
A) Is out of scope
B) Is core — knowing the transactional schema, its keys, and how the app mutates it explains extraction, CDC, and data-quality behavior
C) Is the DBA's job only
D) Is impossible

**24.** Version control fluency (branches, diffs, history, bisect):
A) Is developer-only
B) Lets a senior trace when a data-affecting change was introduced and review data code as first-class software
C) Is unnecessary
D) Is impossible

**25.** Writing maintainable transformation code:
A) Does not matter — it is just SQL
B) Matters like any code — readable, tested, modular transformations are maintainable; sprawling copy-pasted SQL rots and hides bugs
C) Should be minimal
D) Is the analyst's job

**26.** Testing data code:
A) Is impossible
B) Combines unit-testing transformation logic and data-quality testing outputs — both catch the silent errors that make wrong data look right
C) Is the analyst's job
D) Is unnecessary

**27.** Reading logs and stack traces:
A) Is developer-only
B) Is core senior skill — the producing app's and the pipeline's logs usually reveal why data is wrong or a job failed
C) Is impossible
D) Wastes time

**28.** A senior engaging the app team about their data:
A) Requires only data knowledge
B) Requires enough application literacy to understand their code and constraints and propose realistic fixes (data contracts, event changes) — credibility comes from competence
C) Is impossible
D) Is the manager's job

**29.** Understanding APIs the data comes from or feeds:
A) Is out of scope
B) Matters — much data arrives via and is served through APIs; understanding them is part of reasoning about the whole data flow
C) Is the backend team's job only
D) Is impossible

**30.** A senior data engineer who cannot read the systems producing the data:
A) Is fine — pipelines only
B) Is limited — code literacy multiplies their effectiveness at root-causing, prevention, and collaboration, and is required for the broadening this level demands
C) Is the norm
D) Should stay pipelines-only

---

## Section C — Backend and Services (Q31–Q42)

**31.** The request path producing data:
A) Client to warehouse directly
B) Client → application → transactional store / event stream → (pipelines) → warehouse — a senior reasons about where data originates and how it flows
C) The client writes the warehouse
D) The warehouse runs the app

**32.** A transactional (OLTP) database versus the warehouse:
A) Are the same
B) OLTP optimizes many small reads/writes with strong consistency; the warehouse optimizes large analytical scans — a senior understands both and why extracting from OLTP needs care
C) OLTP is for analytics
D) The warehouse is transactional

**33.** Extracting from a production database:
A) Full-scan the primary at peak
B) Consider source load — use replicas, CDC, or off-peak windows so analytics extraction does not degrade the production application
C) Always hammer the primary
D) Is impossible

**34.** Change Data Capture from the transaction log:
A) Is a full reload
B) Streams inserts/updates/deletes efficiently without polling the source hard — but requires handling ordering, deletes, and schema changes correctly
C) Is a file format
D) Copies the whole table

**35.** An API rate limit when pulling data:
A) Ignore it
B) Respect it — back off and page politely; hammering a source API gets you throttled or blocked and can harm the source system
C) Is the source's problem
D) Cannot happen

**36.** Eventual consistency in source systems:
A) Is irrelevant to data
B) Means extracted data (especially from replicas) may be briefly stale or inconsistent — a senior accounts for this in extraction and reconciliation
C) Means bugs
D) Is a transaction

**37.** A microservices architecture producing data:
A) Is one database
B) Scatters data across many services and stores — a senior reasons about how to integrate it coherently and the challenges of cross-service consistency
C) Is irrelevant
D) Is the same as a monolith

**38.** An event-driven source:
A) Is the same as a database extract
B) Delivers data as a stream of events with ordering, duplication, and schema-evolution concerns a senior must handle — distinct from batch extraction
C) Cannot be consumed
D) Is always ordered globally

**39.** Idempotency across the whole data flow:
A) Is pipeline-only
B) Matters wherever retries and at-least-once delivery exist — from the producing service through the pipeline — since duplicates corrupt metrics
C) Is for reads only
D) Is a transaction

**40.** A soft delete in the source application:
A) Removes the row
B) Marks a row deleted without physically removing it — a senior must know this, or "deleted" records wrongly persist in analytics (or vice versa)
C) Is irrelevant to data
D) Is a hard delete

**41.** Reconciling data between source and warehouse:
A) Is unnecessary
B) Periodically verifying counts/values match the source catches silent extraction gaps and corruption — a key reliability practice
C) Is impossible
D) Is the source team's job

**42.** A senior who cannot reason about the producing services:
A) Is fine — pipelines only
B) Is limited — so many data problems originate in the source systems that understanding them is essential at senior level
C) Is the norm
D) Should stay pipelines-only

---

## Section D — Consumers: Analytics, Products, and the Frontend (Q43–Q52)

**43.** How data is consumed:
A) Is not the engineer's concern
B) Shapes everything a senior builds — dashboards, ML features, product features, and reports each need different grain, freshness, and reliability
C) Is the analyst's job only
D) Is a distraction

**44.** A BI dashboard on top of your data:
A) Is irrelevant to you
B) Depends on your model, grain, and freshness — a senior designs data so dashboards are correct, fast, and affordable to query
C) Is the analyst's problem only
D) Cannot be influenced

**45.** A dashboard rescanning raw data on every load:
A) Is fine
B) Is a cost and performance problem — materialize or aggregate upstream so consumption is cheap and fast
C) Is required
D) Cannot be optimized

**46.** Serving data to a product feature (not just analytics):
A) Is the same as a dashboard
B) Often needs low latency and high reliability like a production service — a senior recognizes when data moves from analytics to a user-facing dependency
C) Is impossible
D) Is the app team's job only

**47.** A machine-learning team consuming your data:
A) Needs the same as a dashboard
B) Needs reliable, well-defined features with known freshness and point-in-time correctness — training on leaked or inconsistent data silently ruins models
C) Is irrelevant to data engineering
D) Should build their own pipelines

**48.** Data leakage in features (a senior's awareness):
A) Is not a data engineering concern
B) Is partly a data engineering concern — serving future information into a training feature (wrong point-in-time joins) corrupts models; correct temporal handling matters
C) Is only the ML team's problem
D) Cannot happen in pipelines

**49.** A metric definition disputed by two teams:
A) Pick one silently
B) Drive a single, documented definition (grain, filters, time basis) — inconsistent definitions produce numbers people argue about and distrust
C) Build both forever
D) Ignore it

**50.** An API serving data to a frontend:
A) Is irrelevant to data engineering
B) May be part of the data platform (a serving layer) — a senior understands latency, caching, and reliability needs when data is served to clients
C) Is the frontend team's job only
D) Cannot be built by data engineers

**51.** Understanding user-facing impact of stale data:
A) Only freshness metrics matter
B) A senior reasons about what stale or wrong data does to the user or decision — which determines how much to invest in freshness and correctness
C) Is the analyst's job
D) Is unmeasurable

**52.** A senior data engineer with zero awareness of consumers:
A) Is correctly scoped
B) Is missing context — understanding who uses the data and how is what lets them build the right thing and prioritize correctly
C) Is the norm
D) Should stay pipelines-only

---

## Section E — Systems and Architecture (Q53–Q66)

**53.** Reading a full system architecture diagram:
A) Is architect-only
B) Is core senior work — seeing how sources, pipelines, stores, and consumers connect, where state lives, and where failures propagate
C) Is pointless
D) Is the manager's job

**54.** A single point of failure in the data platform:
A) Is fine if reliable
B) Is a component whose failure breaks the data flow — a senior identifies and mitigates critical ones with redundancy or graceful handling
C) Does not exist in the cloud
D) Is a security term

**55.** Batch versus streaming as an architectural choice:
A) Always stream
B) A deliberate trade-off — streaming for genuine low-latency needs, batch for simplicity and cost; a senior chooses based on value, not fashion
C) Always batch
D) They are identical

**56.** Coupling between data systems:
A) Is irrelevant
B) Tight coupling (shared schemas, direct dependencies) makes changes break many things — data contracts and clear interfaces reduce it, letting teams evolve independently
C) Is always good
D) Cannot be reduced

**57.** Blast radius of a data change:
A) Is file size
B) Is how many downstream datasets, dashboards, models, and decisions depend on it — a senior weighs it when making and reviewing changes
C) Is row count
D) Is runtime

**58.** Designing for reprocessing:
A) Assume you never reprocess
B) Assume you will — bugs and logic changes require recomputing history, so immutable raw data, idempotency, and reproducibility must be designed in
C) Is impossible
D) Is wasteful

**59.** A distributed system under partition/failure:
A) Behaves normally
B) Forces trade-offs (consistency vs availability) a senior understands — and data pipelines spanning systems must tolerate partial failures
C) Cannot be partitioned in the cloud
D) Is a code bug

**60.** Idempotency and exactly-once as system properties:
A) Are trivial
B) Are hard-won across a distributed data flow — usually achieved via idempotent writes and dedup rather than true exactly-once; a senior designs for it end-to-end
C) Are automatic
D) Do not matter

**61.** A "distributed monolith" of data pipelines:
A) Is ideal
B) Is an anti-pattern — pipelines that must all change together and share hidden state pay complexity without independence; a senior recognizes and flags it
C) Is unavoidable
D) Is a single pipeline

**62.** Schema evolution across the system:
A) Never happens
B) Is constant — sources add/change fields; a senior designs for evolution (additive changes, versioning, table formats) so pipelines and consumers do not silently break
C) Always breaks everything
D) Is the source's problem only

**63.** Choosing where computation happens (source, pipeline, warehouse, serving):
A) Always in the pipeline
B) Deliberately — pushing work to the right layer (e.g., ELT in the warehouse, pre-aggregation for serving) balances cost, performance, and maintainability
C) Always at the source
D) Does not matter

**64.** Designing for failure in the data flow:
A) Assume no failures
B) Assume failures — retries, idempotency, validation gates, dead-letter handling, and alerting are how a data platform stays trustworthy through inevitable failures
C) Is pessimistic
D) Is impossible

**65.** A serving layer versus the analytical warehouse:
A) Are the same
B) Serving user-facing data often needs low-latency stores and reliability distinct from the batch warehouse — a senior knows when to add a serving layer
C) The warehouse always serves users
D) Serving is impossible

**66.** Reasoning across the whole system in a data incident:
A) Is out of scope for data engineering
B) Is exactly the senior generalist capability — localizing whether bad data came from the source app, the pipeline, the model, or the query, and coordinating the fix
C) Is the app team's job
D) Is impossible

---

## Section F — Security and Privacy Across the Stack (Q67–Q76)

**67.** PII across the data lifecycle:
A) Is handled once
B) Must be protected at every stage — collection, transport, storage, processing, serving, and deletion — a senior designs privacy in, not on
C) Is the legal team's job only
D) Is unregulated

**68.** Least privilege for data access:
A) Everyone sees everything
B) Scope access by role/need, including row- and column-level controls — a senior enforces this across the platform, not just at the perimeter
C) Is the analyst's job
D) Is unnecessary

**69.** Secrets for sources, warehouses, and pipelines:
A) Hardcode them
B) A secrets manager with least privilege and rotation — pipelines hold credentials to the most valuable data and are a high-value target
C) Share in chat
D) Commit to the repo

**70.** The client is untrusted:
A) The app can trust its client
B) Data arriving from clients (events, uploads) is attacker-influenced and must be validated — a senior applies this when ingesting client-sourced data
C) The server trusts the client
D) Is not a data concern

**71.** A leaked warehouse/cloud credential:
A) Delete the commit
B) Rotate immediately and treat as compromised, reviewing access — data credentials can expose the organization's most sensitive information
C) Is fine if private
D) Cannot be exploited fast

**72.** Regulatory requirements (deletion, residency, retention):
A) Do not affect data engineering
B) Directly shape the platform — right-to-deletion, data residency, and retention limits must be engineered into storage and pipelines
C) Are legal's sole concern
D) Are optional

**73.** Right-to-be-forgotten in an immutable data lake:
A) Is trivial
B) Is genuinely hard — deleting a person's data across files, backups, and derived datasets requires deliberate design; a senior plans for it
C) Is impossible, so ignore it
D) Is automatic

**74.** Audit logging of sensitive data access:
A) Is unnecessary
B) Records who accessed what — required for compliance and investigating misuse; a senior ensures it exists and is protected
C) Slows queries
D) Is the provider's job

**75.** Data masking and minimization:
A) Are optional
B) Reduce exposure — collect and retain only what is needed, and mask/anonymize sensitive fields for broader access and lower environments
C) Corrupt data
D) Are impossible

**76.** A senior data engineer's security responsibility:
A) Ends at moving data
B) Spans the whole data lifecycle and platform — access, secrets, privacy, retention, and not becoming the weak link that exposes the organization's data
C) Is the security team's alone
D) Is to install scanners

---

## Section G — Business Context and Senior Judgment (Q77–Q92)

**77.** Connecting data work to the business:
A) Is not the engineer's concern
B) Is senior-level thinking — data exists to inform decisions and power products, and framing work by business impact is how it gets prioritized well
C) Is the CEO's job
D) Is a distraction

**78.** A stakeholder requests a metric urgently:
A) Build it fast and loosely
B) Clarify the exact definition and intended use first — a fast wrong number does more harm than a slightly slower correct one, because decisions ride on it
C) Refuse
D) Build several versions

**79.** Presenting a data problem to leadership:
A) Raw technical detail
B) Business impact and options they can act on — what decisions are affected, the risk, and the trade-offs of fixing it — with a recommendation
C) Only dashboards
D) Withhold detail

**80.** Prioritizing data work:
A) Everything equally
B) By impact — the datasets and metrics that drive the most important decisions and products get the most reliability and correctness investment
C) By ease
D) Randomly

**81.** A trade-off between freshness, cost, and correctness:
A) Maximize all
B) A deliberate decision based on how the data is used — real-time fraud detection and a monthly report have very different needs
C) They do not interact
D) Only cost matters

**82.** Choosing a technology for the data platform:
A) The trendiest
B) The one fitting the workload, team, existing stack, and total cost of ownership — data infrastructure is long-lived and expensive to change
C) The most complex
D) Build your own

**83.** A junior submits a confused pipeline PR:
A) Reject, say start over
B) Engage charitably — diagnose intent, point to correct patterns (grain, idempotency, tests), leave a clearer next step
C) Approve to be kind
D) Ignore

**84.** A disagreement with an analyst over a number:
A) Assert authority
B) Trace both computations to the data and definitions — usually a grain, filter, or timezone difference; resolve on evidence
C) Escalate immediately
D) Drop it

**85.** Estimating data work:
A) A single number
B) A range covering modeling, transformation, testing, backfill, validation, and coordination — with correctness risk stated
C) The analyst's estimate
D) Zero

**86.** A high-blast-radius data change:
A) Ship it fast
B) Test on sample/dev data, plan backfills, communicate metric-definition changes, and roll out carefully — it affects many downstream consumers
C) Change silently
D) Skip testing

**87.** A senior's demeanor in a data incident:
A) Panic or blame
B) Steady — mitigate (correct/quarantine), communicate to affected users, root-cause via lineage, and add a check to prevent recurrence, blamelessly
C) Stay out of it
D) Wait

**88.** Saying "I do not know, let me verify":
A) Damages credibility
B) Is essential — data engineering rewards confirming correctness over confidently reporting a wrong number
C) Is for juniors
D) Should be hidden

**89.** A senior who only optimizes their own pipelines:
A) Is focused
B) Is missing the role — enabling other teams, defining shared standards and contracts, mentoring, and reasoning across the system are the job at this level
C) Is efficient
D) Is correct

**90.** Automating quality and governance versus manual policing:
A) Manual scales
B) Automated tests, contracts, and observability scale far beyond manual checks — prevention and detection built into the platform
C) Are the same
D) Automation is impossible

**91.** Trustworthiness as the core deliverable:
A) Is secondary to speed
B) Is the point — data that cannot be trusted is worse than no data, because it drives confident wrong decisions; a senior guards trust above all
C) Does not matter
D) Is the analyst's job

**92.** Connecting reliability and quality investment to outcomes:
A) Is not the engineer's concern
B) Is senior judgment — arguing for the right level of data reliability by tying it to the decisions and products it affects
C) Is the CEO's job
D) Is a distraction

---

## Section H — The Convergence Itself (Q93–Q100)

**93.** Broadening beyond pipelines into the whole system:
A) Distracts from data work
B) Is exactly what the senior role requires — data problems and decisions span producing apps, consuming analytics, and the business, so senior judgment must reach across all of it
C) Is disloyal to data engineering
D) Is premature

**94.** Engaging engineers and analysts as a peer:
A) Requires only data knowledge
B) Requires enough fluency in their world — code, services, and how data is used — to collaborate credibly and propose realistic solutions
C) Is impossible
D) Is the manager's job

**95.** Reasoning about the whole system in an incident:
A) Is out of scope for data
B) Is the senior generalist capability — localizing across source app, pipeline, model, and query, and coordinating the right fix
C) Is the app team's job
D) Is impossible

**96.** The specialist-to-generalist shift for data engineers:
A) Means abandoning data skills
B) Means bringing deep data craft into a broader role — understanding and improving the whole system the data lives in, not just the pipelines
C) Is a demotion
D) Is impossible

**97.** Prioritizing across the whole system:
A) Fix everything everywhere
B) Concentrate on the highest-impact data (the decisions and products that matter most), accept lower-priority items explicitly, and communicate the reasoning
C) Fix the easy ones
D) Randomly

**98.** The mindset shift from Junior 3 to Senior 1:
A) Faster pipelines
B) From owning a data domain to reasoning about and improving the whole system the data flows through — breadth, influence, business context, and judgment
C) More SQL only
D) More jobs

**99.** The single trait that most distinguishes Senior 1 from a strong Junior 3:
A) Years
B) Judgment about correctness, reliability, and impact, paired with the breadth to reason across the whole system — from producing applications to consuming decisions — not just the pipelines
C) Tool mastery
D) Pipeline count

**100.** A data-engineering Junior 3 who passes this exam is signaling:
A) That they know everything
B) That they have broadened into a generalist senior — reasoning across the whole system, engaging producers and consumers as peers, and connecting data to the business — with data-engineering depth now a strength they bring to a broader role
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

*Administrator's note: This is the data-engineering convergence exam, intentionally demanding for a candidate who has lived only inside pipelines and the warehouse. A Junior 3 who scores 70–80 has done the data-depth work and now needs breadth — application and code literacy, the producing services, the consuming analytics and products, and whole-system reasoning. Coach them, give them assignments that reach into the applications producing and consuming their data, and re-sit in six months.*
