# Promotion Exam: Junior Platform Engineer 2 → Junior Platform Engineer 3

**Track:** Platform Engineer (Specialist — Infrastructure / SRE / DevOps / Systems)
**Format:** 100 multiple-choice questions
**Time:** 150 minutes
**Passing score:** 89 / 100

**Scope.** Junior Platform 3 is the top of the specialist track before convergence into the generalist senior level. A Junior Platform 3 owns a significant piece of infrastructure or platform capability with minimal supervision, designs reliable and scalable systems, leads incident response, defines SLOs and observability, builds self-service tooling for other engineers, hardens security, and shows early platform-engineering judgment. This exam tests that depth: advanced Kubernetes and orchestration, reliability engineering (SLOs, error budgets, resilience patterns), scaling and performance, advanced observability, infrastructure security and secrets at scale, cost and capacity, and the platform-as-a-product mindset.

**Reminder.** This is the last specialist-only platform exam. The next exam (Junior 3 → Senior 1) is the convergence point and tests whether the candidate has broadened into a senior engineer who understands the applications running on the platform, engages product teams as a peer, and reasons about the whole system — not only the infrastructure beneath it. A candidate who aces this but cannot read application code or understand what the services they host actually do is not ready for the next gate.

---

## Section A — Orchestration at Depth (Q1–Q14)

**1.** A Kubernetes Deployment versus a StatefulSet:
A) Are the same
B) Deployments suit stateless, interchangeable pods; StatefulSets provide stable identity and storage for stateful workloads (databases, clustered systems)
C) StatefulSets are for stateless apps
D) Deployments cannot scale

**2.** A Service in Kubernetes:
A) Is a pod
B) Provides a stable network endpoint and load-balances across a changing set of pods — decoupling clients from individual pod lifecycles
C) Is a node
D) Is a container image

**3.** Requests versus limits, revisited at depth:
A) Are interchangeable
B) Requests drive scheduling and guarantees; limits cap usage (CPU throttling, memory OOM-kill) — setting them wrong causes either waste, noisy-neighbor issues, or unexpected kills
C) Only limits matter
D) Neither affects scheduling

**4.** A pod evicted under node memory pressure:
A) Is random
B) Reflects resource contention — nodes evict pods when resources run low, guided by requests/limits and priority; correct resource config reduces surprise evictions
C) Is a bug
D) Is a network issue

**5.** Horizontal Pod Autoscaling:
A) Adds bigger pods
B) Adds/removes pod replicas based on metrics (CPU, custom) — but is bounded by cluster capacity and downstream limits, so it is not infinite elasticity
C) Is instant and unlimited
D) Replaces capacity planning

**6.** Cluster autoscaling versus pod autoscaling:
A) Are the same
B) Pod autoscaling changes replica count; cluster autoscaling adds/removes nodes when pods cannot be scheduled — both needed, with lag and cost implications
C) One replaces the other
D) Neither exists

**7.** A rolling update gone wrong (new version unhealthy):
A) Cannot be stopped
B) Should be caught by readiness probes and halted/rolled back automatically — which is why correct probes and a rollback path matter
C) Requires deleting the cluster
D) Is unrecoverable

**8.** Network policies in a cluster:
A) Are unnecessary
B) Restrict which pods/namespaces can communicate — default-deny east-west traffic limits lateral movement after a compromise
C) Are the same as a firewall appliance
D) Slow the cluster pointlessly

**9.** RBAC in the orchestrator:
A) Is optional
B) Controls what users and service accounts can do in the cluster — over-permissive roles (especially for service accounts) are a common risk
C) Is the same as network policy
D) Only applies to humans

**10.** A service account token mounted into every pod by default:
A) Is harmless
B) Can be an over-privilege risk — a compromised pod may use it; scope service accounts tightly and disable automounting where unneeded
C) Is required
D) Is encrypted and safe

**11.** Persistent storage in Kubernetes (PV/PVC):
A) Is ephemeral
B) Provides durable storage decoupled from pod lifecycle for stateful workloads — with its own performance, backup, and failover considerations
C) Is the same as a container layer
D) Does not exist

**12.** Ingress:
A) Is internal-only routing
B) Manages external access to services (HTTP routing, TLS termination) via an ingress controller — the cluster's front door
C) Is a pod
D) Is storage

**13.** A DaemonSet:
A) Runs one pod total
B) Runs a pod on every (or selected) node — used for node-level agents like logging, monitoring, and networking
C) Is a Deployment
D) Is a Service

**14.** Debugging a pod that will not schedule:
A) Delete the cluster
B) Check events and conditions — insufficient resources, node selectors/taints, unbound volumes, or quotas are common causes revealed by describing the pod
C) Reboot nodes
D) Ignore it

---

## Section B — Reliability Engineering (Q15–Q28)

**15.** An SLI (Service Level Indicator):
A) Is a target
B) Is a measured indicator of service behavior (e.g., request success rate, latency) — the raw signal reliability is judged on
C) Is a marketing metric
D) Is uptime only

**16.** An SLO (Service Level Objective):
A) Is a legal contract
B) Is the target for an SLI (e.g., 99.9% of requests succeed) — the internal reliability goal that guides engineering decisions
C) Is the same as an SLA
D) Is a dashboard

**17.** An SLA (Service Level Agreement):
A) Is the same as an SLO
B) Is an external commitment (often with penalties) — usually set more loosely than the internal SLO, which acts as an early-warning buffer
C) Is an internal target
D) Is a metric

**18.** An error budget:
A) Is a bug count
B) Is the allowed unreliability under the SLO (e.g., 0.1% failures) — spending it deliberately balances feature velocity against reliability
C) Is unlimited
D) Is a financial budget

**19.** When the error budget is exhausted:
A) Keep shipping features
B) Is a signal to prioritize reliability work over new features until the service is back within objective — the budget turns reliability into a shared, data-driven decision
C) Ignore it
D) Delete the SLO

**20.** Setting an SLO at 100%:
A) Is the right goal
B) Is usually wrong — 100% is prohibitively expensive and leaves no error budget for change; reliability targets are chosen deliberately below 100%
C) Is easy
D) Is required

**21.** MTTR (mean time to recovery):
A) Is uptime
B) Measures how fast you recover from incidents — often more improvable and impactful than trying to prevent every failure; fast recovery limits damage
C) Is patch cadence
D) Is release frequency

**22.** Graceful degradation:
A) Means failing completely
B) Means shedding non-essential functionality to preserve core service under stress — better than total failure when overloaded or a dependency is down
C) Is a security term
D) Is impossible

**23.** A circuit breaker:
A) Cuts power
B) Stops calling a failing dependency after a threshold, returning fast failures and letting it recover — preventing cascading failure
C) Is a load balancer
D) Is a retry

**24.** Retries without backoff and jitter:
A) Are best practice
B) Can cause a retry storm that overwhelms a recovering service — bound retries and use exponential backoff with jitter
C) Are harmless
D) Speed recovery

**25.** A cascading failure:
A) Is one service failing alone
B) Is failure propagating across dependent services (overload, retry storms, resource exhaustion) — defended by timeouts, circuit breakers, load shedding, and bulkheads
C) Is impossible
D) Is a network partition only

**26.** Load shedding:
A) Accepts all traffic always
B) Deliberately rejects some requests when overloaded to protect the system and serve the rest — better than collapsing under full load
C) Is a security control
D) Is a bug

**27.** A bulkhead pattern:
A) Is a database
B) Isolates resources (pools, quotas) so one failing component cannot consume everything and sink the whole system
C) Is a load balancer
D) Is a retry policy

**28.** Chaos engineering:
A) Is reckless breakage
B) Is deliberately injecting controlled failures to verify the system degrades gracefully and to find weaknesses before real incidents do
C) Is load testing
D) Is forbidden

---

## Section C — Scaling and Performance (Q29–Q40)

**29.** Horizontal versus vertical scaling:
A) Are the same
B) Horizontal adds instances (needs statelessness or shared state); vertical adds bigger machines — horizontal is generally more resilient and elastic
C) Vertical always scales further
D) Horizontal is for databases

**30.** A stateless service scales more easily because:
A) It stores nothing useful
B) Any instance can serve any request, so instances can be added/removed freely — state lives in shared stores, not instance memory
C) It is faster
D) It needs no network

**31.** A database as a scaling bottleneck:
A) Never happens
B) Is common — application tiers scale horizontally easily, but the database often does not, making it the constraint; read replicas, caching, and sharding address it
C) Is a network issue
D) Is solved by autoscaling pods

**32.** Read replicas:
A) Replace the primary
B) Serve read traffic to offload the primary, at the cost of replication lag (eventual consistency on reads) — a common scaling technique
C) Are always consistent
D) Are for backups only

**33.** Caching to reduce load:
A) Always causes bugs
B) Reduces load and latency but introduces invalidation complexity — correctness of cache invalidation is the hard part
C) Is free and simple
D) Is the database's job

**34.** A cache stampede:
A) Cannot happen
B) Occurs when a popular cached item expires and many requests hit the origin at once — mitigated by request coalescing, jittered TTLs, or pre-warming
C) Is a network attack
D) Is a deadlock

**35.** Connection pool exhaustion:
A) Is impossible
B) Occurs when a service opens more connections (e.g., to a database) than the pool or the database allows — a common cause of cascading slowdowns under load
C) Is a disk issue
D) Speeds the system

**36.** Autoscaling on the wrong metric:
A) Always works
B) Can misbehave — scaling on CPU when the bottleneck is memory or a downstream dependency will not help and may make things worse; scale on the actual constraint
C) Is impossible
D) Does not matter

**37.** A thundering herd on startup/failover:
A) Is normal
B) Occurs when many clients reconnect or retry simultaneously after an event, overwhelming the recovering system — mitigated by jitter and gradual ramp
C) Is a security attack
D) Cannot be prevented

**38.** Performance testing before scaling decisions:
A) Guess and provision
B) Load-test to find real bottlenecks and limits, because intuition about where a system breaks is frequently wrong
C) Is impossible
D) Is the developer's job

**39.** Tail latency (p99) under load:
A) Is irrelevant
B) Is what a meaningful share of users experience at peak — a system that meets latency at low load may fail users under load; the tail is the real target
C) Is the average
D) Is a storage metric

**40.** Premature scaling / over-provisioning:
A) Is always safe
B) Wastes cost and adds complexity — scale based on measured need and headroom, not fear; but do not wait until you are already failing
C) Is required
D) Is the same as autoscaling

---

## Section D — Advanced Observability (Q41–Q52)

**41.** Observability versus monitoring:
A) Are identical
B) Monitoring watches known signals; observability is the broader ability to ask new questions about a system's behavior from its outputs — you need both, and observability matters more as systems grow complex
C) Observability is just more dashboards
D) Monitoring is obsolete

**42.** RED metrics (Rate, Errors, Duration):
A) Are for storage
B) A standard minimum for request-driven services — traffic volume, error fraction, and latency, sliced by endpoint
C) Replace tracing
D) Are deprecated

**43.** USE metrics (Utilization, Saturation, Errors):
A) Are for tests
B) A resource-oriented frame — how busy, how queued, how many errors — useful for diagnosing where saturation is occurring
C) Replace RED
D) Are decorative

**44.** Distributed tracing at depth:
A) Is the same as logging
B) Follows a request across services as spans, exposing where latency accumulates and where failures originate in a multi-service call graph
C) Is a metric
D) Replaces logs

**45.** Cardinality in metrics:
A) Is free
B) High-cardinality labels (e.g., per-user, per-request IDs) can explode storage and cost in metrics systems — use them carefully; logs/traces are often the right place for high-cardinality data
C) Does not matter
D) Improves performance

**46.** Alerting on SLO burn rate:
A) Is over-complex
B) Alerts based on how fast the error budget is being consumed — catching both fast outages and slow degradations while reducing noise
C) Is the same as CPU alerting
D) Is impossible

**47.** A noisy alert that fires constantly:
A) Should be left on to be safe
B) Should be tuned or removed — constant noise causes fatigue and real alerts get missed; every alert should be actionable
C) Is a good alert
D) Cannot be changed

**48.** Log volume and cost at scale:
A) Log everything at full detail forever
B) Balance signal against cost — sample where appropriate, set retention by need, and structure logs so they are useful; unbounded logging is expensive and noisy
C) Never log
D) Is free

**49.** Correlating metrics, logs, and traces during an incident:
A) Is impossible
B) Is how you diagnose fast — a spike in a metric leads to traces showing where, which lead to logs showing why; shared IDs and time alignment make this work
C) Is unnecessary
D) Replaces the fix

**50.** Synthetic monitoring:
A) Is unsafe
B) Runs scripted checks of key journeys continuously (often against production) to detect outages and regressions before users report them
C) Replaces real user monitoring
D) Is the same as load testing

**51.** Real user monitoring (RUM) versus synthetic:
A) Are the same
B) RUM measures actual user experience in the field; synthetic uses controlled probes — together they cover both real variability and consistent baseline checks
C) One replaces the other
D) Neither is useful

**52.** An observability gap discovered during an incident:
A) Is acceptable
B) Is a common finding and a post-mortem action item — you often learn what you should have been measuring only when you needed it
C) Is impossible
D) Means delete the dashboards

---

## Section E — Infrastructure Security and Secrets (Q53–Q64)

**53.** Secrets management at scale:
A) Environment files on each host
B) A dedicated secrets manager with access control, auditing, rotation, and dynamic/short-lived credentials — far safer than static secrets on disk or in code
C) Hardcoded in images
D) Shared in chat

**54.** Dynamic (short-lived) credentials:
A) Are less secure
B) Reduce risk by expiring quickly, limiting the value of a leaked credential and the window for misuse
C) Are the same as static
D) Are impossible

**55.** Cloud IAM least privilege at depth:
A) Wildcard permissions for flexibility
B) Scoped roles, no standing admin, avoidance of wildcards, and just-in-time elevation — because an over-privileged identity turns any compromise into a full breach
C) Is the provider's job
D) Does not matter

**56.** An instance/pod with more cloud permissions than it needs:
A) Is convenient and fine
B) Is a risk multiplier — if compromised, the attacker inherits those permissions; scope workload identities tightly
C) Is required
D) Is safe if internal

**57.** The cloud metadata endpoint and SSRF:
A) Is unrelated to security
B) Can leak workload credentials if reachable via SSRF — protect it (e.g., IMDSv2, network controls), as it is a known credential-theft path
C) Is public by design
D) Is a firewall

**58.** Network segmentation and zero trust internally:
A) The internal network is trusted
B) Segment and authenticate internal traffic too — flat internal trust lets one compromise spread everywhere
C) Is only for the perimeter
D) Removes authentication

**59.** Patching infrastructure at scale:
A) Manually per host
B) Systematically and promptly for security-critical issues — automated, tracked patching, since unpatched known vulnerabilities are heavily exploited
C) Never, to avoid breakage
D) Is the vendor's job

**60.** A publicly exposed database or admin interface:
A) Is convenient
B) Is a serious exposure — restrict via private networking, bastions, or allowlists; never expose sensitive services broadly to the internet
C) Is safe with a password
D) Is required

**61.** Immutable, scanned container images in the supply chain:
A) Do not matter
B) Reduce risk — scan images for vulnerabilities, sign/verify them, and pull only from trusted registries, since the image is part of what runs in production
C) Are the developer's job only
D) Slow deploys pointlessly

**62.** Audit logging of infrastructure changes:
A) Is unnecessary
B) Records who changed what in the control plane — essential for security, forensics, and understanding incidents; ensure it is enabled and protected
C) Slows the cloud
D) Is the provider's concern

**63.** A leaked cloud credential:
A) Delete the commit
B) Rotate immediately, treat as compromised, and review what it could access and whether it was used — infrastructure credentials are extremely powerful
C) Is fine if private
D) Cannot be exploited quickly

**64.** Backups and their security/testing:
A) Existing backups are enough
B) Must be tested by restoring, protected from tampering/deletion (including by an attacker), and sometimes immutable — untested or deletable backups fail exactly when needed (e.g., ransomware)
C) Are automatic and safe
D) Never need testing

---

## Section F — Cost, Capacity, and Efficiency (Q65–Q74)

**65.** Cloud cost as an engineering concern:
A) Is finance's job only
B) Is part of platform engineering — idle resources, oversized instances, unattached storage, and inefficient architecture waste real money at scale
C) Is unlimited
D) Does not matter

**66.** Right-sizing resources:
A) Always over-provision
B) Match resource allocation to measured need plus headroom — over-provisioning wastes money, under-provisioning risks reliability
C) Always under-provision
D) Is impossible

**67.** Autoscaling for cost:
A) Only helps reliability
B) Also saves cost by scaling down in low-demand periods — but must be tuned to avoid flapping and to respect downstream limits
C) Increases cost always
D) Is unrelated to cost

**68.** Reserved/committed capacity versus on-demand:
A) Are the same price
B) Committed usage is cheaper for predictable baseline load; on-demand suits variable load — mixing them optimizes cost
C) On-demand is always cheaper
D) Are irrelevant

**69.** An unattached disk or idle load balancer:
A) Is free
B) Often still incurs cost — orphaned resources accumulate; regular cleanup and tagging control waste
C) Cannot exist
D) Is the provider's problem

**70.** Capacity planning with growth:
A) Is unnecessary in the cloud
B) Anticipates when current capacity, quotas, or architecture will be exceeded — so scaling happens before, not during, a crunch
C) Is one-time
D) Is finance's job

**71.** Cloud service quotas/limits:
A) Are unlimited
B) Are real caps (API rate, instance counts, IPs) that can block scaling at the worst time — know and raise them ahead of need
C) Do not exist
D) Never bind

**72.** A cost spike overnight:
A) Ignore it
B) Investigate — runaway autoscaling, a misconfiguration, a leak, or an attack (e.g., crypto-mining from a compromise) can all cause it; cost anomalies are also a security signal
C) Is normal
D) Is the provider's fault

**73.** Efficiency versus reliability trade-offs:
A) Always maximize efficiency
B) Balance them deliberately — cutting redundancy to save cost can hurt reliability; the right point depends on the service's importance
C) Always maximize redundancy
D) They do not interact

**74.** Tagging and cost allocation:
A) Are bureaucracy
B) Enable understanding of what costs what and who owns it — essential for managing and optimizing spend at scale
C) Slow provisioning
D) Are the finance team's job only

---

## Section G — Platform as a Product and Collaboration (Q75–Q88)

**75.** The "platform as a product" mindset:
A) Treats internal teams as an afterthought
B) Treats the developers who use the platform as customers — investing in self-service, good docs, and reliability so they can ship without filing tickets
C) Means charging teams money
D) Is the same as ops tickets

**76.** Self-service infrastructure:
A) Is dangerous and should be avoided
B) Lets product teams provision what they need through safe, paved-road tooling — scaling the platform team's impact beyond manual requests
C) Means no guardrails
D) Is the developer's job

**77.** A paved road / golden path:
A) Forces one rigid way with no exceptions
B) Makes the recommended, secure, reliable path the easiest to follow — so teams choose it because it works, with off-road use possible but unsupported
C) Blocks all alternatives
D) Is documentation only

**78.** Toil reduction as a goal:
A) Toil is the job, embrace it
B) Automating repetitive operational work frees the team for higher-value engineering and prevents the team from being buried as the system grows
C) Is impossible
D) Is the developer's job

**79.** A platform change that breaks many teams' deployments:
A) Is their problem
B) Is a platform failure — communicate changes, provide migration paths and deprecation windows, and avoid breaking your users; the platform's users depend on its stability
C) Is unavoidable
D) Should be silent

**80.** Documentation for a platform:
A) Is optional
B) Is a core deliverable — self-service depends on good docs; undocumented platforms generate endless support toil
C) Writes itself
D) Is the developer's job

**81.** Working with product engineers:
A) Gatekeeping their access
B) Enabling them — understanding their needs, providing safe tooling, and unblocking them — rather than being a bottleneck they route around
C) Adversarial
D) Distant

**82.** A developer wants something the platform does not support:
A) Just say no
B) Understand the underlying need and find a safe path — reflexive no's push teams to build shadow infrastructure that is worse and unmanaged
C) Build a one-off snowflake
D) Ignore them

**83.** Reviewing another platform engineer's IaC change:
A) Rubber-stamp
B) Review for blast radius, reversibility, security, and drift — infrastructure changes deserve careful review because their impact is wide
C) Skip it
D) Only check formatting

**84.** Mentoring a junior platform engineer:
A) Too early
B) Is part of becoming a Junior 3 — teaching operational care, incident response, and automation multiplies the team
C) The lead's job only
D) Wastes time

**85.** Estimating platform work:
A) A single number
B) A range accounting for testing, blast radius, migration, rollback planning, and coordination with affected teams — with risk clearly stated
C) The developer's estimate
D) Zero

**86.** A change with wide blast radius:
A) Ship it fast
B) Roll it out carefully — staged, reversible, communicated, and monitored — because it can affect many teams or the whole system at once
C) Do it on Friday
D) Skip testing

**87.** On-call health for the team:
A) Does not matter
B) Matters — sustainable rotation, good alerting, runbooks, and reducing noise prevent burnout and keep response effective
C) Means more alerts
D) Is the manager's sole concern

**88.** Leading an incident as a Junior 3:
A) Fix silently alone
B) Coordinate calmly — mitigate first, communicate clearly, organize the response, and drive the blameless follow-up — the team takes its cue from your composure
C) Assign blame
D) Wait for a senior always

---

## Section H — Judgment and Growth Toward Convergence (Q89–Q100)

**89.** Reading the application code running on the platform:
A) Is out of scope
B) Increasingly matters — understanding what the services do sharpens capacity, reliability, and incident work, and is part of the broadening the next level requires
C) Is the developer's job only
D) Is impossible

**90.** Understanding the whole system, not just the infrastructure:
A) Is overreach
B) Is the growth edge — an incident is often at the boundary of app and infrastructure, and reasoning across both is what a senior does
C) Is the architect's job
D) Is unnecessary

**91.** Balancing reliability against feature velocity:
A) Always maximize reliability
B) Is a deliberate trade-off best made with data (error budgets) — too much reliability investment starves features; too little burns users
C) Always maximize velocity
D) They do not interact

**92.** A recurring class of incident:
A) Handle each one as it comes
B) Is a signal to fix the systemic cause — automation, a guardrail, or a design change — so the class stops recurring, rather than repeatedly firefighting
C) Is unavoidable
D) Is the developer's fault

**93.** When a "quick manual fix" in production is tempting:
A) Always take it
B) Weigh it against creating drift and unreproducible state — sometimes necessary in an emergency, but it must be captured back into code and reviewed afterward
C) Never touch production
D) Is always fine

**94.** Copy-pasting a fix from the internet onto production infrastructure:
A) Is fine if it works
B) Is dangerous — understand it fully first, because infrastructure mistakes have wide blast radius and can be hard to reverse
C) Is required for speed
D) Is always safe

**95.** Saying "I do not know, let me verify":
A) Damages credibility
B) Is the operational professional habit — guessing on infrastructure causes outages; verifying first is how good platform engineers work
C) Is for juniors
D) Should be hidden

**96.** A senior-track platform engineer who only thinks about infrastructure:
A) Is correctly focused
B) Is missing the broadening the next level needs — understanding the applications, the business impact, and the whole system is what distinguishes a senior
C) Is efficient
D) Is the norm

**97.** Automating a guardrail versus manually policing:
A) Manual policing scales
B) Automated guardrails (policy as code, safe defaults, checks in the pipeline) scale far better than manually catching mistakes — prevention over inspection
C) Are the same
D) Guardrails are impossible

**98.** Blameless culture as a platform engineer:
A) Lets people off the hook
B) Produces the honesty needed to actually find and fix systemic causes — blame drives information underground and repeats incidents
C) Is weak
D) Is only for managers

**99.** The mindset shift from Junior 2 to Junior 3:
A) Faster ticket resolution
B) From executing operational tasks to owning a platform capability — designing for reliability and scale, building self-service, leading incidents, and exercising blast-radius judgment
C) More manual work
D) More alerts

**100.** The trait that most reliably unlocks the move to Senior 1 is:
A) Tool mastery
B) Judgment about reliability, cost, and blast radius, paired with broadening beyond infrastructure into the applications and whole system — and the instinct to automate toil and enable other engineers
C) The most uptime
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

*Administrator's note: This is the last specialist-only platform exam. The next exam (Junior 3 → Senior 1) is the convergence point and tests broadening into a senior engineer who understands the applications running on the platform, engages product teams as a peer, and reasons about the whole system. A candidate who aces this but cannot read application code or understand what the services they host actually do should be coached toward that breadth before sitting the convergence exam.*
