# Promotion Exam: Junior Platform Engineer 3 → Senior Engineer 1

**Track:** Convergence — Platform Specialist → Generalist Software Engineer
**Format:** 100 multiple-choice questions
**Time:** 165 minutes
**Passing score:** 89 / 100

**Scope and purpose.** This is the convergence exam for the platform track (Infrastructure / SRE / DevOps / Systems), parallel to the other tracks. A platform Junior 3 has spent two to four years deepening in infrastructure, reliability, and operations. From Senior 1 onward, the role broadens: a senior at this company reasons about the whole system — not only the infrastructure beneath applications, but the applications themselves — engages product engineers as a peer, makes architectural decisions that span the stack, and connects reliability and platform work to the business. This exam confirms the candidate still owns deep platform and reliability craft, then tests the breadth: application and code literacy, backend and data, web/frontend awareness, systems architecture end-to-end, security across the stack, and senior judgment.

**A note to the candidate.** If you answer Section A comfortably but struggle with the application-literacy, backend, or code sections, that is information, not failure. A platform engineer who has never read the application code they host, never reasoned about how a query performs, or never understood what the services on their cluster actually do is not yet ready for Senior 1. Deliberate broadening beats passing by luck and struggling in the role.

---

## Section A — Platform Depth a Senior Must Still Own (Q1–Q15)

**1.** A production incident with rising latency across services. The senior's first move is:
A) Restart everything
B) Mitigate impact while localizing the cause using metrics/traces/logs — determine whether it is infrastructure, a dependency, a recent change, or the application
C) Blame the last deploy without checking
D) Open a ticket

**2.** An error budget nearly exhausted:
A) Keep shipping features
B) Is a data-driven signal to shift toward reliability work until the service is back within objective — a senior uses it to arbitrate velocity vs. reliability
C) Should be ignored
D) Means delete the SLO

**3.** A recent deploy correlates with a new incident:
A) Coincidence
B) Is a prime suspect — rolling back is often the fastest mitigation while investigating
C) Cannot be the cause
D) Means blame the developer

**4.** A wide-blast-radius infrastructure change:
A) Ship it fast
B) Roll it out staged, reversible, communicated, and monitored — because it can affect many teams at once
C) Do it Friday evening
D) Skip testing

**5.** A recurring class of incident:
A) Firefight each one
B) Fix the systemic cause — automation, guardrail, or design change — so the class stops recurring
C) Is unavoidable
D) Is the app team's problem

**6.** An over-privileged workload identity:
A) Is convenient
B) Is a risk multiplier a senior reduces — least privilege on service accounts and cloud roles contains compromise
C) Is required
D) Is safe internally

**7.** Autoscaling that is not helping under load:
A) Add more of it
B) Check whether you are scaling on the real bottleneck — scaling app pods will not help if the database or a downstream dependency is the constraint
C) Is impossible
D) Means the cluster is broken

**8.** A backup strategy:
A) Existing backups suffice
B) Is only real if restores are tested and backups are protected from tampering/deletion — a senior verifies recoverability, not just that backups exist
C) Is automatic and safe
D) Is the provider's job

**9.** A cascading failure in progress:
A) Wait it out
B) Is contained with timeouts, circuit breakers, load shedding, and isolation — a senior recognizes the pattern and stops the propagation
C) Cannot be stopped
D) Is a single service failing

**10.** A senior reviewing an IaC change looks first at:
A) Formatting
B) Blast radius, reversibility, security, and drift risk — infrastructure changes have wide impact and deserve careful review
C) Line count
D) Naming

**11.** Cost anomaly overnight:
A) Ignore
B) Investigate — runaway scaling, misconfiguration, a leak, or a compromise (e.g., crypto-mining) — cost spikes are also a security signal
C) Is normal
D) Is the provider's fault

**12.** Toil piling up on the team:
A) Work harder
B) Automate it — unbounded manual operational work buries a team as the system grows; reducing toil is core senior work
C) Ignore it
D) Hire more juniors to do it

**13.** On-call sustainability:
A) Does not matter
B) Is a senior concern — humane rotation, good alerting, runbooks, and noise reduction keep response effective and prevent burnout
C) Means more alerts
D) Is the manager's sole job

**14.** A blameless post-mortem's value:
A) Assigning fault
B) Systemic learning and concrete, owned action items that prevent recurrence — a senior drives these to completion
C) Skipped if service recovered
D) A formality

**15.** A senior platform engineer's deepest responsibility is:
A) The most uptime personally
B) The reliability, security, and efficiency of the platform and the systems on it — and enabling other engineers to build and ship safely — across all the team's work
C) The tooling budget
D) Alert volume

---

## Section B — Application and Code Literacy (Q16–Q30)

**16.** Reading application code as a senior platform engineer:
A) Is out of scope
B) Is essential at this level — incidents live at the app/infra boundary, and you cannot diagnose or advise on what you cannot read
C) Is the developer's job only
D) Is impossible

**17.** A variable, function, conditional, and loop:
A) Are beyond platform work
B) Are constructs a senior reads fluently to follow application logic during incidents and reviews
C) Are automation-only
D) Do not matter

**18.** An application's startup sequence and dependencies:
A) Are irrelevant to the platform
B) Matter — knowing what a service needs to start (config, database, downstream services) explains many deploy and boot failures
C) Are the developer's concern only
D) Cannot be understood

**19.** A memory leak in an application (not the infrastructure):
A) Is always an infra problem
B) Is an application defect the platform surfaces (rising memory, OOM kills) — a senior can localize whether the cause is the app or the environment
C) Cannot be distinguished
D) Is the OOM killer's fault

**20.** A service that fails its readiness probe:
A) Is a probe bug always
B) May be failing to connect to a dependency, still warming up, or genuinely broken — a senior reads the app's logs to tell which
C) Should be force-started
D) Is a network issue only

**21.** A "slow endpoint" reported by users:
A) Is always the infrastructure
B) Could be app code, a slow query, a downstream call, or resource limits — a senior localizes across the stack rather than assuming the layer
C) Is always the database
D) Is always the network

**22.** Reading a diff/PR that changes a service's resource needs or dependencies:
A) Is developer-only
B) Lets a senior anticipate capacity, config, and reliability impact before it hits production
C) Is impossible
D) Wastes time

**23.** An application's configuration and how it is injected:
A) Does not concern the platform
B) Is central — how config and secrets reach the app (env, mounted files, config service) is a platform responsibility and a common failure point
C) Is hardcoded always
D) Is the developer's job only

**24.** A twelve-factor-style application:
A) Is a marketing term
B) Follows patterns (config in environment, stateless processes, logs to stdout, disposability) that make apps easy to run and scale on a platform — a senior recognizes and encourages them
C) Is a container
D) Is deprecated

**25.** A stateful application on the platform:
A) Is the same as stateless
B) Needs special handling — persistent storage, careful scaling, backup, and failover; a senior knows why stateful workloads are harder to operate
C) Cannot run in containers
D) Needs nothing special

**26.** Understanding the language/runtime an app uses (GC, threading model, resource behavior):
A) Is irrelevant
B) Helps a senior tune resources and diagnose behavior — a garbage-collected runtime, for example, has memory and pause characteristics that affect operations
C) Is the developer's job only
D) Cannot be learned

**27.** Reading application logs and stack traces:
A) Is developer-only
B) Is core senior skill — the app's own logs usually reveal why it is failing, complementing infrastructure metrics
C) Is impossible
D) Wastes time

**28.** A build artifact and how the app is packaged:
A) Is irrelevant to the platform
B) Is directly relevant — the platform builds, stores, and deploys artifacts, so understanding packaging (images, dependencies) is part of the job
C) Is the developer's job only
D) Does not exist

**29.** Engaging a product engineer about their service's behavior:
A) Requires only infra knowledge
B) Requires enough application literacy to understand their code and constraints and propose realistic solutions — credibility is earned through competence
C) Is impossible
D) Is the manager's job

**30.** A senior platform engineer who cannot read the apps they run:
A) Is fine — infra only
B) Is limited — application literacy multiplies their effectiveness in incidents, capacity work, and collaboration, and is required for the broadening this level demands
C) Is the norm
D) Should stay infra-only

---

## Section C — Backend, API, and Data (Q31–Q42)

**31.** The request path end-to-end:
A) Client to database directly
B) Client → CDN/load balancer → application → data stores/services → response — a senior reasons about where latency and failure occur along the whole path
C) The client runs the server
D) The CDN runs the app

**32.** HTTP status codes and what they tell operations:
A) Only 200 matters
B) Error-rate breakdowns by status (4xx vs 5xx) localize problems — a spike in 5xx points at the server/app, a spike in 4xx at clients or a bad deploy changing contracts
C) Are decorative
D) Are the same

**33.** A database as the reliability bottleneck:
A) Never happens
B) Is common — the app tier scales but the database often does not; a senior understands read replicas, caching, connection limits, and why the DB constrains scaling
C) Is a network issue
D) Is solved by more pods

**34.** An index and query performance:
A) Are irrelevant to platform work
B) Matter — a missing index causing slow queries can look like an infrastructure problem; a senior can recognize the difference and read a query plan enough to advise
C) Are DBA-only
D) Encrypt data

**35.** The N+1 query problem:
A) Is only a code concern
B) Is worth a senior recognizing — it manifests as database load and slow endpoints the platform observes; identifying it speeds diagnosis
C) Is a network issue
D) Cannot be observed

**36.** Connection pool exhaustion against a database:
A) Is impossible
B) Is a classic cause of cascading slowdowns under load — too many connections for the pool or the database's limit; a senior recognizes and addresses it
C) Is a disk issue
D) Speeds the system

**37.** Read replicas and replication lag:
A) Are always consistent
B) Offload reads but introduce lag — reads may be briefly stale; a senior understands the consistency trade-off when advising on scaling
C) Replace the primary
D) Are for backups only

**38.** A database migration during deploy:
A) Is always safe automatically
B) Can lock tables or be irreversible — a senior ensures the expand/contract pattern and backward compatibility so deploys stay safe and reversible
C) Is manual only
D) Never matters

**39.** Verifying a data-affecting change:
A) Trust the app
B) A senior can query to confirm the actual data state, rather than assuming a success response means correct data
C) Is impossible
D) Is the DBA's job

**40.** A message queue behind a service:
A) Is irrelevant to the platform
B) Introduces async behavior, retries, at-least-once delivery, and backlog — a senior monitors queue depth and understands these as reliability signals
C) Is the same as HTTP
D) Cannot be operated

**41.** Eventual consistency in the systems the platform runs:
A) Means bugs
B) Is a common trade-off a senior reasons about — replication, caching, and async processing all introduce windows of staleness
C) Is forbidden
D) Is a transaction

**42.** A senior who cannot reason about the data layer:
A) Is fine — infra only
B) Is limited — so many reliability and performance problems trace to the database that data-layer literacy is essential at senior level
C) Is the norm
D) Should stay infra-only

---

## Section D — Web/Frontend and Client Awareness (Q43–Q52)

**43.** The frontend/client the platform serves:
A) Is irrelevant to platform work
B) Is worth a senior understanding at a basic level — how clients consume services, cache, and fail shapes traffic patterns, caching strategy, and incident impact
C) Is the developer's job only
D) Cannot be understood

**44.** A CDN in front of the application:
A) Runs the app
B) Caches content at the edge, reducing latency and origin load — a senior understands cache behavior, invalidation, and how a CDN misconfiguration affects users
C) Is a database
D) Is a load balancer only

**45.** Cache-Control and content caching:
A) Are frontend-only concerns
B) Span the stack — a senior understands how cache headers drive browser and CDN behavior, and how stale or private data can leak through misconfigured caching
C) Are irrelevant to ops
D) Are decorative

**46.** A traffic spike from the client (retstorm, viral event, bad client retry):
A) Is always an attack
B) Can be legitimate or a client-side retry storm — a senior distinguishes them and applies rate limiting, capacity, or client fixes accordingly
C) Cannot be handled
D) Is the frontend team's problem only

**47.** Client-side retries hammering the backend:
A) Are harmless
B) Can amplify an outage — clients retrying aggressively during a blip can overwhelm recovery; backoff/jitter on the client and load shedding on the server both matter
C) Are the client's problem only
D) Speed recovery

**48.** A static asset build and how it is served:
A) Is irrelevant to the platform
B) Is often a platform concern — versioned, content-hashed assets served from a CDN, with correct cache lifetimes; a senior understands the deploy/caching interplay
C) Is the developer's job only
D) Cannot be operated

**49.** Understanding what "the app is slow" means to a user:
A) Only server metrics matter
B) User-perceived performance includes client rendering and network, not just server latency — a senior reasons about the whole experience, not only their layer
C) Is the frontend team's job only
D) Is unmeasurable

**50.** A frontend that depends on a backend the platform runs:
A) Is unrelated
B) Means backend availability directly shapes user experience — a senior understands this coupling when prioritizing reliability
C) Is the developer's concern only
D) Cannot be reasoned about

**51.** CORS and API access from browsers:
A) Is a platform bug
B) Is a browser-enforced policy configured on the server/gateway — a senior recognizes CORS issues as configuration, not random failures
C) Is a firewall
D) Is unrelated to platform

**52.** A senior platform engineer with zero client/frontend awareness:
A) Is correctly scoped
B) Is missing context — understanding how clients consume and stress the platform makes them more effective at capacity, caching, and incident reasoning
C) Is the norm
D) Should stay infra-only

---

## Section E — Systems Architecture End-to-End (Q53–Q66)

**53.** Reading a full system architecture diagram:
A) Is architect-only
B) Is core senior work — identifying where state lives, where the bottlenecks and SPOFs are, and what happens when each component fails
C) Is pointless
D) Is the manager's job

**54.** A single point of failure (SPOF):
A) Is fine if reliable
B) Is a component whose failure takes down the system — a senior identifies and eliminates critical SPOFs with redundancy where justified
C) Does not exist in the cloud
D) Is a security term

**55.** Statelessness as an architectural enabler:
A) Means no data
B) Lets the app tier scale and heal freely because any instance serves any request — state lives in shared stores; a senior designs toward this
C) Means no sessions
D) Is impossible

**56.** Monolith versus microservices from a platform view:
A) Microservices always win
B) Microservices multiply operational surface (deploys, networking, observability, failure modes) — a senior weighs the operational cost, not just the org benefit
C) Are the same to operate
D) Monoliths are dead

**57.** A synchronous chain of service calls:
A) Is robust
B) Multiplies failure probability and latency — a senior recognizes that a slow request may be a deep call chain and advises on async, caching, or timeouts
C) Cannot fail
D) Is faster than async

**58.** Async/event-driven architecture operationally:
A) Removes all problems
B) Trades synchronous coupling for eventual consistency, queue backlogs, and at-least-once delivery — a senior operates and monitors these deliberately
C) Is the same as REST
D) Cannot be monitored

**59.** Blast radius as an architectural property:
A) Is file size
B) Is how far a failure or a change reaches — segmentation, isolation, and scoped access shrink it; a senior designs and reviews with it in mind
C) Is lines changed
D) Is deploy time

**60.** Feature flags and deploy/release decoupling:
A) Are app-only
B) Are a shared reliability tool — deploying code dark and releasing via flags lets the platform and app teams reduce risk and roll back without redeploys
C) Replace deploys
D) Are configuration only

**61.** A distributed system under network partition:
A) Behaves normally
B) Must trade consistency against availability (CAP) — a senior understands that partitions happen and that the system's behavior under them is a design choice
C) Cannot be partitioned in the cloud
D) Is a code bug

**62.** Idempotency across the system:
A) Is app-only
B) Matters wherever retries, queues, and distributed coordination exist — a senior ensures operations are safe to repeat, since the platform's retries and failovers will repeat them
C) Is for reads only
D) Is a transaction

**63.** Where to put a cache in the architecture:
A) Everywhere always
B) Deliberately — at the layer where it most reduces load and latency for the cost and invalidation complexity it adds; a senior reasons about placement and correctness
C) Never
D) Only at the CDN

**64.** A "distributed monolith":
A) Is ideal
B) Is an anti-pattern — services that must deploy together and share a database pay microservice operational cost without the independence benefit; a senior recognizes and flags it
C) Is a monolith
D) Is unavoidable

**65.** Designing for failure:
A) Assume components do not fail
B) Assume they will — timeouts, retries with backoff, circuit breakers, redundancy, and graceful degradation are how systems survive inevitable failures
C) Is pessimistic and wasteful
D) Is impossible

**66.** Reasoning across the whole stack in an incident:
A) Is out of scope for platform
B) Is exactly the senior generalist capability — localizing a problem to client, network, app, data, or infrastructure and coordinating the right fix
C) Is the app team's job
D) Is impossible

---

## Section F — Security Across the Stack (Q67–Q78)

**67.** The client is untrusted:
A) The app can trust its client
B) Anything on the client is controllable by the user; authorization and validation must be enforced server-side — a principle a senior applies across the stack
C) The server trusts the client
D) Is not a platform concern

**68.** Least privilege across people, services, and pipelines:
A) Broad access for convenience
B) Scope every identity to what it needs — humans, workloads, and CI/CD credentials — so any single compromise is contained
C) Everyone gets admin
D) Is the security team's job only

**69.** Secrets management at scale:
A) Env files on hosts
B) A secrets manager with access control, rotation, auditing, and short-lived credentials — never hardcoded, committed, or shared insecurely
C) Baked into images
D) In the code

**70.** A leaked infrastructure/cloud credential:
A) Delete the commit
B) Rotate immediately and treat as compromised, reviewing what it could access and whether it was used — these credentials are extremely powerful
C) Is fine if private
D) Cannot be exploited fast

**71.** Network segmentation and zero trust internally:
A) Trust the internal network
B) Segment and authenticate internal traffic — flat internal trust lets one compromise move laterally everywhere
C) Is perimeter-only
D) Removes authentication

**72.** SSRF and the cloud metadata endpoint:
A) Are unrelated to platform
B) Are a real credential-theft path — a senior protects the metadata service and understands how an app-level SSRF can compromise infrastructure credentials
C) Are public by design
D) Are a firewall

**73.** The CI/CD pipeline as an attack surface:
A) Is not a concern
B) Is high-value — a compromised pipeline can inject into everything it builds; secure the pipeline, its credentials, and its dependencies
C) Cannot be attacked
D) Is the developer's problem

**74.** Supply chain risk (base images, dependencies, artifacts):
A) Is out of scope
B) Is a platform concern — scan and pin images, verify artifacts, and pull from trusted registries, since these run in production with real privileges
C) Is the vendor's problem
D) Is safe if popular

**75.** Patching known vulnerabilities:
A) Optional
B) Essential and prompt for security-critical issues — unpatched known vulnerabilities are heavily exploited; automate and track patching
C) Breaks things, avoid it
D) Is the vendor's job

**76.** Audit logging of who changed what:
A) Is unnecessary
B) Is essential for security and forensics — protected, retained control-plane and access logs are how you understand and investigate incidents
C) Slows the system
D) Is the provider's concern

**77.** Exposing a management interface or database to the internet:
A) Is convenient
B) Is a serious exposure — restrict via private networking, bastions, and allowlists; never expose sensitive services broadly
C) Is safe with a password
D) Is required

**78.** A senior platform engineer's security responsibility:
A) Ends at the firewall
B) Spans the platform and how apps run on it — least privilege, secrets, segmentation, supply chain, and not undermining the protections the rest of the stack provides
C) Is the security team's alone
D) Is to install scanners

---

## Section G — Senior Judgment, Influence, and Business Context (Q79–Q92)

**79.** Platform as a product:
A) Treats users as an afterthought
B) Treats product engineers as customers — self-service, docs, reliability, paved roads — so the platform enables shipping rather than bottlenecking it
C) Means charging money
D) Is the same as tickets

**80.** A reflexive "no" from the platform team:
A) Is the safe default
B) Pushes teams to build shadow infrastructure that is worse and unmanaged — help teams achieve their goal on a safe path instead
C) Is required
D) Builds trust

**81.** A junior submits a confused IaC PR:
A) Reject and say start over
B) Engage charitably — diagnose intent, point to safe patterns, and leave a clearer next step
C) Approve to be kind
D) Ignore

**82.** A product engineer disagrees with a platform decision:
A) Overrule by authority
B) Understand their need, weigh it against reliability/security/cost, and find the best end-to-end answer — sometimes you are wrong, sometimes they are
C) Escalate immediately
D) Route around them

**83.** Reliability versus velocity trade-off:
A) Always maximize reliability
B) A deliberate, data-informed trade-off (error budgets) — too much reliability investment starves features; too little burns users
C) Always maximize velocity
D) They do not interact

**84.** Presenting a reliability or cost problem to leadership:
A) Raw metrics and jargon
B) Business impact and options they can act on — downtime cost, risk, and the trade-offs of fixing it — with a recommendation
C) Only dashboards
D) Withhold detail

**85.** Choosing between two technical approaches:
A) The newest
B) The one the team can best operate and maintain — familiarity, operational experience, and total cost often beat marginal technical superiority
C) The most complex
D) The most popular

**86.** Introducing a new platform technology (a new orchestrator, database, tool):
A) Unilaterally
B) Justified against alternatives and total cost — operations, on-call, hiring, migration, lock-in — not local preference
C) The senior's call alone
D) Automatic

**87.** Estimating platform work:
A) A single number
B) A range accounting for testing, blast radius, migration, rollback, coordination, and unknowns — with risk clearly communicated
C) The developer's estimate
D) Zero

**88.** A senior's demeanor in an incident:
A) Panic or blame
B) Calm coordination — mitigate first, communicate clearly, organize the response, drive the blameless follow-up; the team takes its cue from the senior
C) Stay out of it
D) Wait

**89.** Saying "I do not know, let me verify":
A) Damages credibility
B) Is the operational professional habit — guessing on production causes outages; verifying first is how good engineers work
C) Is for juniors
D) Should be hidden

**90.** A senior who only optimizes their own systems:
A) Is focused
B) Is missing the role — enabling other teams, reducing org-wide toil, mentoring, and reasoning across the whole system are the job at this level
C) Is efficient
D) Is correct

**91.** Automating guardrails versus manually policing:
A) Manual scales better
B) Automated guardrails (policy as code, safe defaults, pipeline checks) scale far beyond manual inspection — prevention over policing
C) Are the same
D) Guardrails are impossible

**92.** Connecting platform work to the business:
A) Is not the platform's concern
B) Is senior-level thinking — reliability, velocity enablement, and cost all have business impact, and framing work that way is how it gets prioritized well
C) Is the CEO's job
D) Is a distraction

---

## Section H — The Convergence Itself (Q93–Q100)

**93.** Broadening beyond infrastructure into applications and the whole system:
A) Distracts from platform work
B) Is exactly what the senior role requires — problems and decisions span the stack, so senior judgment must reach the applications, data, and clients, not just the infrastructure
C) Is disloyal to platform
D) Is premature

**94.** Engaging product engineers as a peer:
A) Requires only infra knowledge
B) Requires enough application fluency to understand their code and constraints and propose realistic solutions — credibility is earned through competence, not title
C) Is impossible
D) Is the manager's job

**95.** Reasoning about the whole system in an incident:
A) Is out of scope for platform
B) Is the senior generalist capability — localizing across client, network, app, data, and infrastructure and coordinating the right fix
C) Is the app team's job
D) Is impossible

**96.** The gatekeeper-to-enabler shift:
A) Lowers standards
B) Raises real outcomes — self-service, paved roads, guardrails, and trust enable the whole org to ship safely, scaling far beyond ticket-based ops
C) Is a demotion
D) Is impossible

**97.** Prioritizing across the whole system:
A) Fix everything everywhere
B) Concentrate on the highest real impact — reliability, cost, security, and enablement — accepting lower-priority items explicitly and communicating the reasoning
C) Fix the easy ones
D) Randomly

**98.** The mindset shift from Junior 3 to Senior 1:
A) Faster ticket resolution
B) From owning a platform capability to reasoning about and improving the whole system and how the org builds on it — breadth, influence, business context, and judgment
C) More automation only
D) More uptime

**99.** The single trait that most distinguishes Senior 1 from a strong Junior 3:
A) Years
B) Judgment about reliability, cost, security, and blast radius, paired with the breadth to reason across the whole stack and the influence to enable other engineers — applied everywhere, not just in infrastructure
C) Tool mastery
D) Uptime

**100.** A platform Junior 3 who passes this exam is signaling:
A) That they know everything
B) That they have broadened into a generalist senior — reasoning across the whole system, engaging product teams as a peer, and connecting platform work to the business — with infrastructure and reliability depth now a strength they bring to a broader role
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

*Administrator's note: This is the platform convergence exam, intentionally hard for a candidate who has lived only in infrastructure. A platform Junior 3 who scores 70–80 has done the operational-depth work and now needs breadth — application and code literacy, backend and data, whole-system architecture, and security across the stack. Coach them, give them assignments that reach into the applications running on their platform, and re-sit in six months. A candidate who barely scrapes 89 will struggle as a Senior 1, because the role demands reasoning across the whole system every day.*
