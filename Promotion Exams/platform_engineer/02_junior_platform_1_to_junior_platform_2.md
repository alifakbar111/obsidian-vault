# Promotion Exam: Junior Platform Engineer 1 → Junior Platform Engineer 2

**Track:** Platform Engineer (Specialist — Infrastructure / SRE / DevOps / Systems)
**Format:** 100 multiple-choice questions
**Time:** 135 minutes
**Passing score:** 89 / 100

**Scope.** A Junior Platform 1 handles scoped operational tasks under supervision. A Junior Platform 2 should own a piece of infrastructure or a pipeline end-to-end with light review — writing infrastructure as code, building and maintaining CI/CD pipelines, containerizing and deploying services, setting up monitoring and alerts, participating in on-call, and troubleshooting real incidents. This exam deepens Linux and systems, networking, IaC, containers and orchestration basics, CI/CD, observability, and the reliability and security practices a Junior 2 must demonstrate.

---

## Section A — Linux and Systems Deeper (Q1–Q12)

**1.** A service that fails to start after a config change:
A) Reboot and hope
B) Check the service status and logs (journal/service logs) for the specific error — the failure reason is almost always logged
C) Reinstall the OS
D) Ignore it

**2.** systemd (or the init system) manages:
A) Only networking
B) Services — starting, stopping, restarting, dependencies, and restart-on-failure policies — and is where you look to control and inspect daemons
C) Only users
D) Only files

**3.** A process leaking memory over time:
A) Is normal
B) Will eventually exhaust RAM and trigger swapping or the OOM killer — monitor memory and investigate steady growth
C) Speeds the system
D) Is a disk issue

**4.** The OOM (out-of-memory) killer:
A) Is a virus
B) Is the kernel killing processes when memory is exhausted to save the system — an OOM-killed service is a signal of a memory problem, not a random crash
C) Is a backup tool
D) Frees disk

**5.** File descriptor limits (`ulimit`):
A) Are unlimited
B) Cap open files/sockets per process; high-connection services can hit them, causing "too many open files" — tuned deliberately for such workloads
C) Do not exist
D) Are disk quotas

**6.** cron / scheduled jobs:
A) Run once
B) Run tasks on a schedule — useful for backups, cleanup, and periodic work; failures need monitoring since they run unattended
C) Are services
D) Are deprecated

**7.** A cron job that silently fails:
A) Is fine
B) Is a common hidden problem — schedule jobs with logging and alerting on failure, since no one is watching them run
C) Cannot fail
D) Reports itself

**8.** Log rotation:
A) Is unnecessary
B) Prevents logs from filling the disk by rotating, compressing, and deleting old logs — an unrotated log is a classic disk-full outage cause
C) Deletes all logs
D) Slows the system

**9.** A filesystem mounted read-only unexpectedly:
A) Is normal
B) Often indicates a disk error — the kernel remounts read-only to prevent corruption; investigate the underlying disk health
C) Is a feature to ignore
D) Is a network issue

**10.** Users, groups, and permissions for service accounts:
A) Run everything as root
B) Run services as dedicated, least-privileged accounts so a compromise is contained and access is auditable
C) Share one account
D) Do not matter

**11.** Package management (apt/yum/dnf) and pinning versions:
A) Always install latest automatically
B) Pin/control versions for reproducibility, and patch deliberately — uncontrolled updates can break production unexpectedly
C) Never update
D) Is manual only

**12.** A kernel or system update requiring reboot:
A) Do it anytime on production
B) Schedule it with awareness of impact — drain traffic, coordinate, and have a rollback/recovery plan; unplanned reboots drop service
C) Never reboot
D) Reboot immediately regardless

---

## Section B — Networking Deeper (Q13–Q24)

**13.** A security group / network ACL in the cloud:
A) Is a user permission
B) Is a virtual firewall controlling traffic to/from resources — misconfiguration (too open) is a top cloud exposure cause
C) Is a DNS record
D) Is a load balancer

**14.** Debugging "service A cannot reach service B":
A) Assume it is the code
B) Check systematically — DNS resolution, the port listening, firewall/security-group rules, routing, and whether B is actually up
C) Restart everything
D) It is always DNS, so change DNS

**15.** A DNS record's TTL:
A) Is irrelevant
B) Controls how long resolvers cache the record — a high TTL means changes propagate slowly, which matters during migrations and failovers
C) Is the IP address
D) Is a port

**16.** DNS-based failover or load distribution:
A) Is instant
B) Is subject to caching/TTL, so it is not immediate — useful but not a fast failover mechanism on its own
C) Replaces load balancers
D) Is unreliable always

**17.** TLS certificate expiry:
A) Never happens
B) Is a common, avoidable outage — certificates expire; automate renewal and monitor expiry dates
C) Is the browser's problem
D) Does not affect services

**18.** A load balancer health check:
A) Is decorative
B) Determines which backends receive traffic — a misconfigured health check can route to dead instances or remove healthy ones
C) Is a firewall
D) Encrypts traffic

**19.** Layer 4 versus Layer 7 load balancing:
A) Are the same
B) L4 balances by IP/port (transport); L7 understands application protocol (HTTP) and can route by path/host, terminate TLS, etc. — chosen by need
C) L4 is application-aware
D) L7 is faster always

**20.** NAT (network address translation):
A) Encrypts traffic
B) Maps private addresses to public ones (and back), letting internal hosts reach the internet without public IPs — relevant to cloud egress design
C) Is a firewall
D) Is DNS

**21.** A VPN or private network peering:
A) Makes everything inside safe
B) Provides private connectivity between networks; still requires internal access controls — connectivity is not authorization
C) Replaces authentication
D) Is public

**22.** Egress (outbound) traffic control:
A) Does not matter
B) Matters for security — restricting where systems can connect out limits data exfiltration and malware callbacks
C) Is only about ingress
D) Is impossible

**23.** MTU / packet fragmentation issues:
A) Do not exist
B) Can cause subtle failures (large packets dropped, hung connections) especially across tunnels/VPNs — worth recognizing as a possible cause of weird network behavior
C) Are a DNS setting
D) Are a firewall rule

**24.** A network partition (part of the system cannot reach another part):
A) Never happens
B) Is a real failure mode distributed systems must tolerate — it forces trade-offs between consistency and availability
C) Is a code bug
D) Is impossible in the cloud

---

## Section C — Infrastructure as Code (Q25–Q38)

**25.** Infrastructure as Code (IaC):
A) Is documentation
B) Declares infrastructure in version-controlled code so it is repeatable, reviewable, and auditable — the foundation of modern platform work
C) Is a container
D) Is a CI tool

**26.** Declarative versus imperative IaC:
A) Are the same
B) Declarative describes the desired end state (the tool figures out how); imperative specifies the steps — declarative (e.g., Terraform) is generally preferred for infrastructure
C) Imperative is always better
D) Declarative is deprecated

**27.** Terraform state:
A) Is decorative
B) Tracks what Terraform manages and maps config to real resources — it is sensitive (can contain secrets), must be stored securely and shared safely (remote state with locking)
C) Is the code
D) Can be deleted freely

**28.** Two engineers running Terraform at once without state locking:
A) Is fine
B) Can corrupt state or cause conflicting changes — remote state with locking prevents concurrent modification
C) Is faster
D) Is impossible

**29.** `terraform plan` before `apply`:
A) Is skippable
B) Shows what will change before making changes — reviewing the plan is how you avoid unintended destruction
C) Applies the changes
D) Is decorative

**30.** A plan that shows a resource will be destroyed and recreated:
A) Is always fine
B) Is a warning to heed — recreation can mean downtime or data loss (e.g., a database); understand why before applying
C) Is impossible
D) Means the code is broken

**31.** Modules / reusable IaC components:
A) Are over-engineering
B) Encapsulate reusable infrastructure patterns so they are consistent and maintainable across environments — like functions for infrastructure
C) Are deprecated
D) Slow provisioning

**32.** Managing multiple environments (dev/staging/prod) in IaC:
A) Copy-paste the whole config per environment
B) Parameterize a shared definition (variables/workspaces) so environments stay consistent and differences are explicit
C) Only define production
D) Use different tools per environment

**33.** Hardcoding secrets in IaC files:
A) Is fine
B) Is a leak risk — IaC is in version control; reference secrets from a secrets manager, never commit them
C) Is required
D) Is encrypted automatically

**34.** Drift (real infrastructure diverging from code):
A) Does not happen
B) Occurs when someone changes resources outside IaC — detect and reconcile it, because drift undermines the reliability IaC provides
C) Is a feature
D) Is impossible

**35.** Making a manual change in the console to "quickly fix" IaC-managed infrastructure:
A) Is best practice
B) Creates drift and will be overwritten or cause conflicts on the next apply — change it in code instead
C) Is faster and safe
D) Is required in emergencies always

**36.** Configuration management (Ansible, etc.) versus provisioning (Terraform):
A) Are identical
B) Provisioning creates infrastructure; configuration management configures what runs on it — often used together, with distinct roles
C) One replaces the other always
D) Are both deprecated

**37.** Immutable infrastructure:
A) Means never changing anything
B) Means replacing servers/images rather than mutating them in place — new version = new image deployed, old one destroyed; reduces drift and "snowflake" servers
C) Is impossible
D) Means read-only disks

**38.** A "snowflake" server (uniquely hand-configured, unreproducible):
A) Is ideal
B) Is a liability — no one knows exactly how to rebuild it, so its failure is a crisis; IaC and immutability prevent snowflakes
C) Is required
D) Is the same as immutable

---

## Section D — Containers and Orchestration (Q39–Q52)

**39.** A Dockerfile:
A) Is a running container
B) Is the recipe for building a container image — each instruction adds a layer; order and content affect size, caching, and security
C) Is the state file
D) Is a network config

**40.** A minimal base image:
A) Is worse
B) Reduces image size and attack surface (fewer packages = fewer vulnerabilities) — prefer slim/distroless bases where practical
C) Breaks the app
D) Is slower

**41.** A container image with secrets baked in:
A) Is convenient and fine
B) Is a leak — anyone with the image can extract them; inject secrets at runtime instead
C) Is encrypted
D) Is required

**42.** Container image tags (`latest` vs pinned versions):
A) Always use `latest`
B) Pin specific versions for reproducible, predictable deploys — `latest` changes underneath you and breaks reproducibility and rollbacks
C) Tags do not matter
D) Never tag

**43.** A stateless versus stateful container:
A) Are the same
B) Stateless containers can be freely created/destroyed/scaled; stateful ones (databases) need persistent storage and careful handling — a key design distinction
C) All containers are stateful
D) State does not matter

**44.** Container storage (ephemeral by default):
A) Persists forever
B) Is lost when the container is removed unless mounted to persistent volumes — data that must survive needs a volume or external store
C) Is on the network
D) Is the image

**45.** An orchestrator (Kubernetes, etc.):
A) Builds images
B) Schedules, scales, heals, and networks containers across a cluster — automating what would otherwise be manual container operations at scale
C) Is a CI tool
D) Is a database

**46.** A Kubernetes pod:
A) Is a physical machine
B) Is the smallest deployable unit — one or more containers sharing network/storage, scheduled together
C) Is a cluster
D) Is an image

**47.** A readiness probe versus a liveness probe:
A) Are the same
B) Readiness controls whether a pod receives traffic; liveness controls whether it is restarted — misconfiguring them causes traffic to dead pods or restart loops
C) Both restart pods
D) Neither matters

**48.** Resource requests and limits on containers:
A) Are optional and ignorable
B) Requests reserve resources for scheduling; limits cap usage — without them, one container can starve others or get killed unpredictably
C) Slow the container
D) Are the same thing

**49.** A pod stuck in CrashLoopBackOff:
A) Is fine
B) Means the container keeps starting and failing — check its logs and events for the real error rather than just restarting it
C) Is a network setting
D) Is normal

**50.** Rolling updates in an orchestrator:
A) Replace all instances at once
B) Replace instances gradually so the service stays available during a deploy, with the ability to pause/rollback if the new version is unhealthy
C) Require downtime
D) Are the same as recreate

**51.** A container running as privileged / as root:
A) Is required
B) Is a serious risk — it weakens isolation; drop privileges, run as non-root, and grant only needed capabilities
C) Is safer
D) Is the default best practice

**52.** Secrets in an orchestrator:
A) Put them in the image
B) Use the platform's secret mechanism (or an external secrets manager), mounted at runtime with least-privilege access — not baked into images or committed to code
C) Hardcode in manifests
D) Use environment variables in Git

---

## Section E — CI/CD Pipelines (Q53–Q66)

**53.** A CI pipeline should, at minimum:
A) Just build
B) Build, run tests and checks, and produce an artifact on every change — giving fast feedback and preventing broken code from progressing
C) Deploy directly to production
D) Run manually

**54.** A failing pipeline:
A) Should be bypassed to keep shipping
B) Blocks progress until understood and fixed — a pipeline that is routinely ignored provides no protection
C) Should be deleted
D) Is normal

**55.** Build once, deploy many:
A) Rebuild per environment
B) Build a single artifact and promote it unchanged through environments — eliminating "it worked in staging" drift from rebuilds
C) Never reuse artifacts
D) Build in production

**56.** Pipeline secrets (deploy keys, cloud credentials):
A) Hardcode in the pipeline config
B) Store in the CI system's secret store or a secrets manager, scoped and rotated — pipelines are a high-value target and their credentials are powerful
C) Print them in logs
D) Commit them

**57.** A pipeline that can deploy to production:
A) Should be wide open
B) Is powerful and must be secured — control who can trigger it, protect its credentials, and require the right approvals/checks
C) Needs no protection
D) Is the developer's toy

**58.** Automated tests as a deploy gate:
A) Slow delivery pointlessly
B) Prevent shipping known-broken builds — combined with fast rollback, a core reliability practice
C) Are optional
D) Replace monitoring

**59.** A deployment strategy — rolling, blue-green, canary:
A) Are all the same
B) Differ in how new versions replace old — rolling gradually, blue-green switching between two environments, canary sending a slice of traffic first; each trades off speed, cost, and safety
C) Require downtime
D) Are deprecated

**60.** A canary deployment:
A) Is unsafe
B) Routes a small percentage of traffic to the new version while watching metrics, expanding if healthy — bounding the blast radius of a bad release
C) Is the same as blue-green
D) Replaces testing

**61.** Rollback capability:
A) Is a sign of failure
B) Is essential — being able to quickly and safely revert a bad deploy limits damage; design deploys (and database changes) so rollback is possible
C) Is impossible
D) Is only for emergencies

**62.** A database migration in a deploy:
A) Is always safe to run automatically
B) Needs care — some migrations lock tables or are hard to reverse; use expand/contract patterns so old and new code both work during the transition
C) Should be manual only
D) Never matters

**63.** A deploy that requires downtime:
A) Is unavoidable always
B) Can often be avoided with the right strategy (rolling, blue-green, backward-compatible changes) — zero-downtime deploys are a normal goal
C) Is best practice
D) Is impossible to avoid

**64.** Pipeline speed:
A) Does not matter
B) Affects how often and confidently people ship — a slow pipeline gets bypassed; keep feedback fast
C) Should be maximized
D) Is fixed

**65.** Artifacts and a registry:
A) Are the same as source code
B) Built images/packages are stored in a registry (secured, versioned) from which deploys pull — the registry is part of the supply chain and must be protected
C) Are logs
D) Are unnecessary

**66.** A deploy that fails halfway:
A) Should be left as-is
B) Should leave the system in a known state (either fully rolled forward or back) — partial deploys are dangerous; design for atomic or recoverable deploys
C) Is fine
D) Cannot happen

---

## Section F — Observability (Q67–Q80)

**67.** The three pillars of observability:
A) CPU, memory, disk
B) Metrics, logs, and traces — each answering different questions about system behavior
C) Reads, writes, deletes
D) Build, test, deploy

**68.** A metric versus a log:
A) Are the same
B) A metric is an aggregated number over time (good for trends/alerts); a log is a discrete event record (good for detail/forensics)
C) Metrics replace logs
D) Logs replace metrics

**69.** A dashboard:
A) Is decorative
B) Visualizes key metrics so humans can see system health at a glance and during incidents — built around the signals that matter
C) Replaces alerting
D) Is a log viewer only

**70.** Alerting on symptoms versus causes:
A) Cause-based is always best
B) Symptom-based alerts (user-facing errors, latency, availability) reliably indicate real impact; cause-based alerts can be noisy and miss novel failures — most teams alert primarily on symptoms
C) Symptoms do not matter
D) Are the same

**71.** Alert fatigue:
A) Is a personal weakness
B) Is a real operational danger — too many noisy alerts train responders to ignore them, so the real one is missed; tune alerts to be actionable
C) Is unavoidable
D) Means add more alerts

**72.** Structured logging:
A) Is slower and worse
B) Emits logs as structured data (fields) so they are searchable and aggregatable — far more useful at scale than free-form text
C) Is the same as unstructured
D) Is deprecated

**73.** A correlation/request ID across services:
A) Is decorative
B) Lets you trace one request across many services and logs — essential for debugging distributed systems
C) Replaces logging
D) Is a metric

**74.** Distributed tracing:
A) Is the same as logging
B) Records the path and timing of a request across services (spans), revealing where latency and failures occur in a multi-service system
C) Is a metric
D) Replaces logs

**75.** p50, p95, p99 latency:
A) Are the average
B) Are percentiles — 99% of requests were faster than the p99 value; averages hide the tail that users actually feel as "slow"
C) Are error rates
D) Are for storage

**76.** Monitoring disk, memory, and certificate expiry:
A) Is paranoid
B) Prevents classic, avoidable outages — full disks, exhausted memory, and expired certificates are among the most common and preventable failures
C) Is unnecessary
D) Is automatic

**77.** A metric that only exists after an incident:
A) Is fine
B) Is a gap — the signals you need are best in place before the incident; incidents often reveal missing observability to add
C) Is impossible
D) Replaces the post-mortem

**78.** SLI, SLO, and error budget (introduction):
A) Are marketing terms
B) An SLI is a measured indicator (e.g., success rate); an SLO is the target for it; the error budget is the allowed shortfall — a framework connecting reliability to decisions
C) Are the same as uptime exactly
D) Are irrelevant to ops

**79.** Logging secrets or PII:
A) Is fine for debugging
B) Is a leak — scrub sensitive data before logging, since logs are widely accessible and long-lived
C) Is encrypted automatically
D) Is required

**80.** Retention and cost of logs/metrics:
A) Keep everything forever
B) Balance usefulness against cost — retain what is operationally and legally needed at appropriate resolution, rather than everything indefinitely
C) Delete everything daily
D) Is free

---

## Section G — Reliability and Incident Response (Q81–Q92)

**81.** On-call done well requires:
A) Just a phone
B) Good alerting, runbooks, escalation paths, access, and humane rotation with rest — being on-call without these tools is a recipe for burnout and slow response
C) No preparation
D) Working alone always

**82.** The first goal during an incident:
A) Root-cause fully before acting
B) Mitigate impact / restore service, then diagnose — users are affected now
C) Write the post-mortem
D) Blame the last deploy

**83.** A recent deploy correlates with a new incident:
A) Coincidence, ignore it
B) Is a prime suspect — rolling back the recent change is often the fastest mitigation while you investigate
C) Cannot be the cause
D) Means blame the developer

**84.** Communicating during an incident:
A) Say nothing until resolved
B) Keep stakeholders informed with clear, accurate status — silence during an outage erodes trust and duplicates effort
C) Overshare technical detail to everyone
D) Only tell your manager

**85.** An incident commander role:
A) Does the fixing alone
B) Coordinates the response — delegating investigation, managing communication, and keeping the effort organized — so responders can focus
C) Assigns blame
D) Is unnecessary

**86.** A blameless post-mortem:
A) Identifies who to punish
B) Examines how the incident happened and what systemic changes prevent recurrence — blame suppresses the honesty needed to learn
C) Is skipped if service recovered
D) Is a formality

**87.** Action items from a post-mortem:
A) Are optional
B) Should be concrete, owned, and tracked to completion — a post-mortem with no follow-through does not prevent the next incident
C) Are punishments
D) Are the manager's job

**88.** Toil:
A) Is valuable work
B) Is manual, repetitive operational work that scales with the system and does not improve it — a target for automation, since unbounded toil buries a team
C) Should be maximized
D) Cannot be reduced

**89.** A single point of failure (SPOF):
A) Is fine if it is reliable
B) Is a component whose failure takes down the system — identify and eliminate SPOFs through redundancy where the risk justifies it
C) Does not exist in the cloud
D) Is a security term

**90.** Redundancy and failover:
A) Are wasteful
B) Provide backup capacity/paths so a single failure does not cause an outage — tested regularly, because untested failover often does not work when needed
C) Are automatic
D) Replace monitoring

**91.** Capacity planning:
A) Is unnecessary in the cloud
B) Anticipates resource needs so the system does not run out under growth or spikes — even with autoscaling, limits and costs must be planned
C) Is the finance team's job
D) Is one-time

**92.** Autoscaling:
A) Solves all capacity problems automatically
B) Helps but has limits — it takes time to react, can hit quotas/costs, and downstream dependencies (databases) may not scale with it; design for its constraints
C) Is instant and unlimited
D) Replaces capacity planning entirely

---

## Section H — Security and Habits (Q93–Q100)

**93.** Least privilege for infrastructure access:
A) Give broad access for convenience
B) Grant only needed permissions to people, services, and pipelines — so mistakes and compromises are contained
C) Everyone gets admin
D) Remove all access

**94.** A publicly exposed management port (SSH, database) to the internet:
A) Is convenient
B) Is a serious exposure — restrict access (bastion, VPN, IP allowlists) and never expose sensitive ports broadly
C) Is safe with a password
D) Is required

**95.** Patching and updates:
A) Are optional
B) Are essential — unpatched systems with known vulnerabilities are heavily exploited; patch deliberately and promptly for security-critical issues
C) Break things, so avoid them
D) Are the vendor's job

**96.** A leaked infrastructure credential (cloud key, deploy token):
A) Delete the commit and move on
B) Rotate it immediately and treat it as compromised — infrastructure credentials are extremely powerful, and exposure can mean full compromise
C) Is fine if the repo is private
D) Cannot be exploited fast

**97.** Making a risky production change:
A) Do it alone on Friday evening
B) Do it when support is available, with a rollback plan, ideally announced — so recovery is fast if it goes wrong
C) Anytime is fine
D) Never make changes

**98.** Copy-pasting a command with `sudo` or destructive flags from the internet:
A) Is fine if it looks right
B) Is dangerous — understand exactly what it does before running it with privileges on anything that matters
C) Is required for speed
D) Is always safe

**99.** Saying "I do not know, let me check":
A) Damages credibility
B) Is the professional habit in operations — guessing on production causes outages; verifying first is how good platform engineers work
C) Is for juniors
D) Should be hidden

**100.** The most reliable predictor of growth past Junior 2 is:
A) Speed
B) Automating toil, respecting blast radius, building observability and reliability in, staying calm and honest in incidents, and steadily deepening how systems really work
C) Never asking questions
D) Working the longest hours

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
