# Promotion Exam: Junior Security Engineer 3 → Senior Engineer 1

**Track:** Convergence — Security Specialist → Generalist (Security-Focused) Software Engineer
**Format:** 100 multiple-choice questions
**Time:** 165 minutes
**Passing score:** 89 / 100

**Scope and purpose.** This is the convergence exam for the security track, parallel to the other tracks' convergence exams — with the same honest adjustment used for QA. A security engineer converging to Senior 1 becomes a **senior security engineer who operates across the whole stack**: reading and reasoning about application, infrastructure, and cloud code; influencing how the entire organization builds; understanding the systems they protect deeply enough to find risk anywhere; and connecting security decisions to the business. This exam confirms the candidate still owns deep security craft, then tests the breadth — engineering fundamentals across the stack, backend and data, systems and cloud architecture, and the senior judgment, influence, and business context the role demands.

**A note to the candidate.** If you answer Section A comfortably but struggle with the code-literacy, backend, or architecture sections, that is information, not failure. A security engineer who cannot read the application and infrastructure code they assess, or who operates only as a gatekeeper, is not yet ready for Senior 1. Deliberate broadening beats passing by luck and then being unable to engage engineering as a peer.

---

## Section A — Security Depth a Senior Must Still Own (Q1–Q15)

**1.** Prioritizing a large backlog of findings:
A) By CVSS base score
B) By real risk in context — exploitability, exposure, asset value, mitigations, and chaining potential — communicating the reasoning
C) By discovery date
D) By ease of fix

**2.** A "low" info-disclosure finding:
A) Is always ignorable
B) May be a stepping stone in a chain — assess it in the context of what it enables, not in isolation
C) Is a false positive
D) Is never worth reporting

**3.** A business logic flaw scanners cannot find:
A) Does not exist
B) Requires understanding the intended rules to spot (e.g., bypassing a step, abusing a discount) — a senior looks for these deliberately
C) Is caught by SAST
D) Is a network issue

**4.** A senior reviewing security work looks first at:
A) Tool output volume
B) Whether the real risks are identified and prioritized correctly, and whether remediation is actionable — not the raw finding count
C) Formatting
D) Number of alerts

**5.** Authorization bugs (IDOR, broken function-level auth):
A) Are rare
B) Are among the most common and severe — a senior ensures ownership and role checks are enforced server-side across every endpoint
C) Are caught by the UI
D) Are a network concern

**6.** Cryptography in practice:
A) Pick any strong algorithm
B) Get the details right — mode, key management, randomness, nonce handling — via vetted libraries; the failures are in the details, and a senior catches them
C) Roll your own for control
D) Encryption alone guarantees safety

**7.** A cloud misconfiguration (public bucket, wildcard IAM):
A) Is the provider's fault
B) Is a top real-world breach cause and squarely the customer's responsibility — a senior treats cloud posture as core scope
C) Cannot happen
D) Is out of scope

**8.** Detection versus prevention:
A) Prevention alone suffices
B) Both are needed — prevention fails eventually, and detection limits dwell time and damage; a senior invests in both
C) Detection alone suffices
D) Are the same

**9.** Responding to a credential compromise:
A) Change one password
B) Assume broad exposure — rotate affected credentials/keys, invalidate sessions, hunt for lateral movement, and scope what was accessible
C) Monitor and wait
D) Ignore if the user is fine

**10.** A senior's incident-response contribution:
A) Assign blame
B) Steady leadership — contain appropriately, preserve evidence, coordinate communication, and drive a blameless post-mortem into concrete improvements
C) Stay out of it
D) Announce publicly

**11.** Accepting a risk:
A) Is always a failure
B) Is sometimes correct — documented, owned by the right person, time-bound, and revisited; security informs, the business decides
C) Is the security engineer's unilateral call
D) Is never allowed

**12.** Secure defaults as leverage:
A) Leave security to each team
B) Making the paved road secure by default is the highest-leverage move — teams become secure without being experts
C) Are impossible
D) Slow teams down

**13.** Supply chain / dependency risk:
A) Is out of scope
B) Is a first-class concern — vet, pin, verify, and monitor dependencies, and plan for a compromised one; most code in an app is third-party
C) Is the vendor's problem
D) Is safe if popular

**14.** Security as enabler vs. gatekeeper:
A) Gatekeeping is the role
B) Enabling — secure building blocks, clear guidance, and trust — prevents far more than gatekeeping catches, and keeps security from being routed around
C) Are the same
D) Enabling lowers standards

**15.** A senior security engineer's deepest responsibility is:
A) Finding the most bugs
B) The actual risk posture of what the organization builds and runs — and raising the whole org's ability to build securely — not just their own findings
C) The tooling budget
D) Alert volume

---

## Section B — Engineering Fundamentals Across the Stack (Q16–Q30)

**16.** Reading application code fluently:
A) Is out of scope for security
B) Is essential at senior level — reviewing for vulnerabilities, understanding exploits, and engaging developers as a peer all require it
C) Is the developer's job only
D) Is impossible

**17.** The client-server trust model:
A) The client can be trusted with validation
B) The client is fully controllable by the user; all security-relevant validation and authorization must be enforced server-side
C) The server trusts the client
D) They are equal in trust

**18.** How a web request flows end-to-end:
A) Client to database directly
B) Client → CDN/load balancer → application → data stores/services → response — a senior reasons about where controls and risks sit along the whole path
C) The CDN runs the app
D) The client runs the server

**19.** A re-render / how a frontend framework updates the DOM:
A) Is irrelevant to security
B) Is worth understanding — DOM-based XSS and client-side trust issues live here, and a senior engaging frontend teams needs the mental model
C) Is backend-only
D) Cannot be understood

**20.** Reading a diff / pull request:
A) Is developer-only
B) Lets a senior security engineer spot risk in changes and participate in review as prevention — the cheapest place to catch security flaws
C) Is impossible
D) Wastes time

**21.** A conditional missing a default case, or an off-by-one:
A) Is invisible without running code
B) Is spottable by reading code — logic flaws and missing cases are security-relevant, and code literacy catches them in review
C) Is not a security concern
D) Cannot exist

**22.** Concurrency and race conditions:
A) Are only performance issues
B) Can be security issues (TOCTOU, double-spend) — a senior understands enough concurrency to spot and reason about them
C) Cannot be exploited
D) Are frontend-only

**23.** Memory safety:
A) Is irrelevant now
B) Explains a whole class of vulnerabilities in unsafe languages and why memory-safe languages are favored for security-sensitive code — a senior understands the trade-off
C) Means no bugs
D) Is the same in all languages

**24.** Version control fluency (branches, history, bisect):
A) Is developer-only
B) Lets a senior trace when a vulnerability was introduced, review history of sensitive code, and integrate security into the development workflow
C) Is unnecessary
D) Is impossible

**25.** Understanding CI/CD pipelines:
A) Is out of scope
B) Is essential — pipelines are both a security control point (scanning, gates) and an attack surface (a compromised pipeline can inject into everything it builds)
C) Is the ops team's job only
D) Is irrelevant

**26.** A build pipeline as an attack target:
A) Is not a real concern
B) Is a high-value target — compromising the pipeline or its dependencies can inject malicious code into every artifact; secure the pipeline itself
C) Cannot be attacked
D) Is the developer's problem

**27.** Reading logs and traces to investigate:
A) Is developer-only
B) Is core senior skill — correlating application, infrastructure, and cloud logs to understand what happened during an incident or assessment
C) Is impossible
D) Wastes time

**28.** Writing tooling and automation:
A) Is not security work
B) Is how a small security team scales across a large org — automating scanning, guardrails, detection, and secret detection
C) Is the developer's job
D) Is unnecessary

**29.** Understanding the frameworks the org uses:
A) Is out of scope
B) Is necessary — knowing a framework's defaults, escape hatches, and common misuse patterns is where a senior finds real, framework-specific risk
C) Is the developer's job only
D) Is impossible

**30.** A senior security engineer who cannot read the stack they assess:
A) Is fine — black-box only
B) Is severely limited — code and system literacy multiplies where and how effectively they find risk, and is required to engage engineering as a peer
C) Is the norm
D) Should stay black-box

---

## Section C — Backend, API, and Data (Q31–Q42)

**31.** HTTP semantics and idempotency:
A) Are decorative
B) Underpin how a senior reasons about retries, replay, and safe versus unsafe operations when assessing an API
C) Only POST matters
D) Are the same for all methods

**32.** Status codes and information leakage:
A) Are irrelevant to security
B) Can leak information (different responses revealing account existence, internal errors exposing stack traces) — a senior tests for this
C) Only 200 matters
D) Are always safe

**33.** SQL injection defense in depth:
A) Parameterize and stop thinking
B) Parameterize queries, apply least-privilege database accounts, validate input, and monitor — layered defense, since a single control can be bypassed
C) Hide the database
D) Encrypt the database only

**34.** The N+1 query pattern:
A) Is only a performance concern
B) Is worth a senior recognizing — inefficiency can be a denial-of-service lever and signals code a senior should understand while reviewing
C) Is a security control
D) Cannot be observed

**35.** Database least privilege:
A) One superuser account for the app
B) Scoped accounts with only needed permissions, so a compromised app credential cannot read or destroy everything — a key containment control
C) Is unnecessary
D) Is the DBA's concern only

**36.** Verifying a security-relevant data effect:
A) Trust the response
B) Confirm the actual stored state (e.g., that a permission change or deletion truly took effect) — a senior can query and verify, not just assume
C) Is impossible
D) Is the DBA's job

**37.** Encryption at rest and its limits:
A) Makes the app fully secure
B) Protects against storage-level access but not an app or credential that legitimately reads the data — one layer among several
C) Replaces access control
D) Is unnecessary

**38.** PII and data classification:
A) All data is equal
B) Classifying data by sensitivity drives controls (encryption, access, logging, retention) proportional to risk and law — a senior designs around this
C) Is legal-only
D) Is unnecessary

**39.** An API returning more data than the client displays:
A) Is fine
B) Is excessive data exposure — attackers read the raw response; the server must return only what the caller is authorized to see
C) Is a performance issue only
D) Is unavoidable

**40.** Multi-tenancy data isolation:
A) Is automatic
B) Must be enforced and tested so no tenant can reach another's data — a top SaaS risk a senior treats as critical
C) Is the database's job alone
D) Is unnecessary

**41.** Eventual consistency and security:
A) Is irrelevant
B) Can matter — e.g., a revoked permission or session that has not yet propagated may briefly still work; a senior reasons about these windows
C) Means bugs
D) Is a transaction

**42.** A senior who cannot test at the API/data layer:
A) Is fine — UI only
B) Is limited — the most serious authorization and data-exposure bugs live at these layers, invisible from the UI
C) Is the norm
D) Should stay UI-only

---

## Section D — Systems, Cloud, and Architecture (Q43–Q56)

**43.** Caches across layers as a security consideration:
A) Are irrelevant
B) Can leak data (caching authenticated responses on shared caches) or serve stale authorization — a senior reasons about cache keys and privacy directives
C) Only the CDN caches
D) Are always safe

**44.** Horizontal scaling and statelessness:
A) Are irrelevant to security
B) Shape where session state and secrets live and how they are shared — a senior understands the security implications of stateless, horizontally-scaled services
C) Speed the database
D) Are DBA-only

**45.** Network segmentation and lateral movement:
A) Are obsolete
B) Are core containment design — segmentation and default-deny internal traffic limit how far a single compromise spreads
C) Are the same as a firewall rule
D) Slow the network pointlessly

**46.** The cloud shared responsibility model:
A) The provider secures everything
B) Customer secures configuration, identities, data, and workloads — where most cloud breaches originate; a senior owns this scope
C) The customer secures nothing
D) Applies only on-prem

**47.** Cloud IAM at senior level:
A) Broad permissions for flexibility
B) Least privilege, scoped roles, avoidance of wildcards and standing admin, and just-in-time elevation — because over-privileged identities turn any compromise into a breach
C) Is the provider's job
D) Does not matter

**48.** Container and orchestration security:
A) Containers are inherently isolated and safe
B) Require deliberate hardening — non-root, minimal images, scanned dependencies, dropped capabilities, RBAC, network policies, and secure secrets
C) Only the app matters
D) Is the registry's job

**49.** Infrastructure as Code security:
A) Is unrelated to security
B) Is where secure (or insecure) configuration becomes repeatable — scan IaC and bake in hardened, secure-by-default modules
C) Removes the need for security
D) Is only about speed

**50.** A secure-by-default platform for engineering teams:
A) Leaves security to each team
B) Provides hardened templates, safe libraries, and automatic secrets handling so teams are secure without being experts — the highest-leverage architectural move
C) Is impossible
D) Slows teams

**51.** Zero trust applied internally:
A) The internal network is trusted
B) Every request is authenticated and authorized regardless of origin, because attackers get inside and flat internal trust enables lateral movement
C) Removes authentication
D) Is only for the perimeter

**52.** Blast radius as a design concern:
A) Is file size
B) Is how much a single compromise can reach — least privilege, segmentation, and scoped secrets shrink it, a core senior design goal
C) Is lines changed
D) Is deploy time

**53.** Fail-secure architecture:
A) On failure, open up to preserve availability
B) On failure, default to denying access or a safe state — a security service outage must not become an authorization bypass
C) Means never failing
D) Is a performance concern

**54.** Observability as security infrastructure:
A) Is backend-only
B) Is essential — logs, metrics, and traces (with integrity and retention) are what make detection, investigation, and forensics possible across the stack
C) Is console.log
D) Is unnecessary

**55.** Reading an architecture diagram for security:
A) Is architect-only
B) Is core senior work — identifying trust boundaries, data flows, secret paths, and failure modes to find design-level risk
C) Is pointless
D) Is the manager's job

**56.** A design that trusts the network perimeter alone:
A) Is sound
B) Is fragile — once breached, flat trust is catastrophic; layered, zero-trust-informed design is the senior standard
C) Is zero trust
D) Is required

---

## Section E — Detection, Response, and Reliability (Q57–Q68)

**57.** Detection engineering at senior level:
A) Buy a SIEM and stop
B) Deliberately build and tune high-fidelity detections mapped to relevant attacker techniques (e.g., MITRE ATT&CK), reducing dwell time and alert fatigue
C) Is antivirus
D) Is optional

**58.** Log integrity and off-host forwarding:
A) Do not matter
B) Matter greatly — attackers tamper with logs; forwarding to tamper-resistant storage preserves evidence through a compromise
C) Are the app's job
D) Are automatic

**59.** Incident response leadership:
A) Improvise
B) Follow the lifecycle — prepare, identify, contain, eradicate, recover, learn — deliberately, balancing containment against evidence preservation and business needs
C) Blame and patch
D) Announce first

**60.** Reliability and security overlap:
A) Are unrelated
B) Overlap substantially — availability is part of security (CIA), and denial of service, resilience, and graceful degradation concern both disciplines
C) Are adversarial
D) Are identical

**61.** A blameless post-mortem:
A) Assigns fault
B) Focuses on systemic causes and concrete prevention — blame suppresses the candor needed to actually improve
C) Is skipped for small incidents
D) Is punishment

**62.** Tail latency and denial of service:
A) Are unrelated to security
B) Connect — expensive operations and unbounded work are DoS levers; a senior reasons about resource limits and abuse controls
C) Are only performance
D) Are frontend-only

**63.** Chaos/resilience testing:
A) Is reckless
B) Validates graceful degradation under failure — relevant to the availability leg of security and to understanding real failure modes
C) Is load testing
D) Is forbidden

**64.** SLOs, error budgets, and security work:
A) Are unrelated
B) Can align — reliability targets and security risk both compete for engineering capacity, and a senior helps make those trade-offs explicit
C) Replace security
D) Are marketing

**65.** Synthetic monitoring and security:
A) Is unsafe
B) Can catch outages and some tampering by continuously exercising key paths in production — an operational signal a senior can leverage
C) Replaces testing
D) Is the same as CI

**66.** Dwell time reduction:
A) Is impossible
B) Is a core goal — the faster a compromise is detected and contained, the less damage; detection and response capability directly reduce it
C) Is uptime
D) Is patch cadence

**67.** Threat hunting:
A) Waits for alerts
B) Proactively searches for compromise that automation missed, using hypotheses about attacker behavior — a senior capability
C) Is scanning
D) Is penetration testing

**68.** A senior who thinks only about prevention:
A) Is correctly scoped
B) Is missing half of modern security — detection, response, resilience, and reducing dwell time matter as much as prevention
C) Is efficient
D) Is the norm

---

## Section F — Business Context and Influence (Q69–Q82)

**69.** Connecting security to the business:
A) Is not security's concern
B) Is essential at senior level — framing risk in terms of business impact and the organization's risk appetite is how security decisions get made well
C) Is the CEO's job
D) Is a distraction

**70.** Presenting risk to leadership:
A) CVE numbers and jargon
B) Business impact and likelihood they can act on, with clear options and a recommendation — technical detail supports, not replaces, the story
C) Raw scan output
D) Withheld details

**71.** Compliance versus security:
A) Are identical
B) Overlap but differ — compliance is a floor and framework; a compliant system can be insecure, and good security aims beyond the checklist while satisfying it efficiently
C) Compliance is irrelevant
D) Compliance replaces security

**72.** A reflexive "no" from security:
A) Is the safe default
B) Erodes trust and gets security bypassed — help teams achieve their goal securely instead of only blocking
C) Is required
D) Builds credibility

**73.** Security champions across engineering:
A) Are unnecessary
B) Scale security by embedding awareness in each team — a senior cultivates them rather than being the sole gatekeeper
C) Replace the security team
D) Are a fad

**74.** Influencing engineering culture:
A) Is out of scope
B) Is the highest-leverage senior activity — shifting how the whole org builds (secure defaults, threat modeling, testing) prevents far more than any single review
C) Is the manager's job
D) Is impossible

**75.** A developer disputes a finding:
A) Insist by authority
B) Demonstrate the risk concretely and resolve on evidence — sometimes you are wrong, sometimes they are; credibility comes from being right for the right reasons
C) Escalate immediately
D) Drop it

**76.** Risk acceptance decisions:
A) Are security's unilateral call
B) Belong to the accountable business owner, informed by security's clear risk picture — documented, time-bound, and revisited
C) Are never allowed
D) Are the developer's call

**77.** Security metrics that matter:
A) Finding counts and tools bought
B) Mean time to remediate, coverage of critical assets, escaped incidents, and demonstrable risk reduction — outcomes, not activity
C) Alerts generated
D) Scans run

**78.** Estimating and planning security work:
A) A single number
B) A reasoned range covering assessment, coordination, remediation support, retest, and unknowns — with risk clearly communicated so it can be prioritized against other work
C) The developer's estimate
D) Zero

**79.** Working with product and engineering leadership:
A) Pure enforcement
B) A partnership — clear risk information enabling informed trade-offs, and secure building blocks that let teams move fast safely
C) Adversarial
D) Silent

**80.** Mentoring and growing security capability:
A) Too early or not the role
B) Is central — growing junior security staff and engineering security champions multiplies a small team's impact across a large org
C) The manager's job only
D) Wastes time

**81.** When security and delivery pressure conflict:
A) Security always wins
B) Surface real risk and options, find the most practical mitigation, hold firm on the highest risks, and let the accountable owner decide with full information
C) Delivery always wins
D) Stay silent

**82.** Building trust with engineering:
A) Is unnecessary
B) Is the foundation of effective security — teams that trust security bring problems early; teams that fear it hide them
C) Is a nice-to-have
D) Comes from authority

---

## Section G — Ethics and Judgment (Q83–Q92)

**83.** Authorization and scope at senior level:
A) Seniors can test anything
B) Remain mandatory — greater capability increases, not removes, the obligation to act within scope and authorization and to minimize data access
C) Apply only externally
D) Are a formality

**84.** Access to powerful tools and sensitive data:
A) Means using them freely
B) Is a serious, accountable trust — having access is not permission to browse, and misuse harms people and ends careers
C) Is unlimited
D) Is for seniors only

**85.** Responsible and coordinated disclosure:
A) Publish immediately for credit
B) Report privately, allow reasonable remediation time, coordinate, and avoid harm — even under pressure or with a tempting finding
C) Sell it
D) Exploit to prove impact

**86.** Discovering your own security mistake:
A) Hide it
B) Report and remediate promptly — concealment compounds risk and betrays the trust the role depends on
C) Blame a tool
D) Ignore it

**87.** Handling unpatched vulnerability details:
A) Share widely
B) Restrict to need-to-know until remediated — details in the wrong hands are dangerous
C) Post publicly
D) Ignore

**88.** Dual-use knowledge (offensive skills):
A) Should be used freely
B) Carries ethical weight — offensive understanding serves defense and authorized testing, never unauthorized access or personal gain
C) Is only for red teams
D) Is unrelated to ethics

**89.** Saying "I do not know, let me research it":
A) Damages credibility
B) Is essential — security is vast and evolving; confident guessing about safety is worse than an honest gap you then close
C) Is for juniors
D) Should be hidden

**90.** Pressure to approve something you believe is unsafe:
A) Approve to be a team player
B) State the risk clearly and honestly, propose mitigations, and ensure the accountable owner decides with full information — do not silently rubber-stamp real risk
C) Refuse and escalate always
D) Approve and document privately

**91.** Fear-driven security theater (controls that look good but do not reduce risk):
A) Is fine if it reassures people
B) Wastes resources and can create false confidence — a senior focuses effort on controls that actually reduce risk
C) Is required for compliance
D) Is the goal

**92.** Learning from real breaches and near-misses:
A) Is morbid
B) Is high-value — post-incident analyses reveal the actual chains of failure and the practical defenses that matter
C) Is unethical
D) Is a distraction

---

## Section H — The Convergence Itself (Q93–Q100)

**93.** Broadening across the whole stack:
A) Distracts from security
B) Is exactly what the senior security-engineering role requires — risk lives everywhere (frontend, backend, data, infra, cloud, pipeline), so senior judgment must reach everywhere
C) Is disloyal to security
D) Is premature

**94.** Engaging engineering as a peer:
A) Requires only security knowledge
B) Requires enough engineering fluency to read their code, understand their constraints, and propose realistic fixes — credibility with engineers is earned through competence, not title
C) Is impossible
D) Is the manager's job

**95.** Security as a whole-org property:
A) Means the security team does everything
B) Is the mature view — security specializes and enables while shifting secure-building capability onto the whole org; this scales far beyond gatekeeping
C) Means engineers ignore security
D) Means no security team

**96.** The gatekeeper-to-enabler shift:
A) Lowers standards
B) Raises real security — secure defaults, guidance, tooling, and trust prevent more than reviews catch, and keep security in the loop instead of bypassed
C) Is impossible
D) Is a demotion

**97.** Prioritizing across the whole system:
A) Fix everything everywhere
B) Concentrate on the highest real risk across the stack, accept lower risk explicitly, and communicate the reasoning — judgment applied broadly
C) Fix by CVSS only
D) Fix the easy ones

**98.** The mindset shift from Junior 3 to Senior 1:
A) Knowing more tools
B) From owning security for an area to owning risk and secure-building capability across the org — breadth, influence, business context, and judgment
C) More scanning
D) More reporting

**99.** The single trait that most distinguishes Senior 1 from a strong Junior 3:
A) Years
B) Judgment about real risk paired with the breadth to reason across the whole stack and the influence to change how the org builds — the security mindset applied everywhere
C) Tool mastery
D) Bug count

**100.** A security Junior 3 who passes this exam is signaling:
A) That they know everything
B) That they have broadened into a senior security engineer — reading and reasoning across the full stack, influencing engineering culture, connecting risk to the business, and enabling secure building — with security craft now a strength they bring to a broader role
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

*Administrator's note: This is the security convergence exam. As with QA, the "generalist" a security engineer converges into is a senior security engineer who operates across the whole stack and influences how the org builds — not necessarily a product feature developer. Calibrate the debrief to your company's actual expectation for the role. A Junior 3 who scores 70–80 has done the security-depth work and now needs breadth — code and systems literacy across the stack, plus the influence and business context the senior role demands. Coach and re-sit in six months.*
