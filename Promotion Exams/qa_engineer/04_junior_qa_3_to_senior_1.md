# Promotion Exam: Junior QA Test Engineer 3 → Senior Engineer 1

**Track:** Convergence — QA Specialist → Generalist (Quality-Focused) Software Engineer
**Format:** 100 multiple-choice questions
**Time:** 165 minutes
**Passing score:** 89 / 100

**Scope and purpose.** This is the convergence exam for the QA track, parallel in structure to the frontend, backend, and mobile convergence exams — with one honest adjustment. A QA engineer converging to Senior 1 does not become a generalist product developer overnight; rather, they become a **senior quality engineer** who operates across the stack: reading and reasoning about application code, influencing how the whole team tests, thinking about reliability in production, and understanding the architecture, data, and security of the system well enough to find risk anywhere in it. This exam confirms the candidate still owns deep QA and automation craft, then tests the breadth — code literacy, backend and API depth, databases, systems and reliability, security, and the senior judgment and influence the role demands.

**A note to the candidate.** If you answer Section A comfortably but struggle with the code-literacy, backend, or systems sections, that is information, not failure. A QA engineer who has never read the application's source, never reasoned about a database index, or never thought about how the system fails in production is not yet ready for Senior 1. Deliberate broadening over six months beats passing by luck and struggling in the role.

---

## Section A — QA and Automation Depth a Senior Must Still Own (Q1–Q15)

**1.** A flaky suite eroding team trust. The senior quality engineer's first move is:
A) Add retries everywhere
B) Diagnose the root causes (timing, shared state, dependencies), fix or quarantine systematically, and restore the suite's signal — trust in the suite is the asset
C) Delete failing tests
D) Ignore it

**2.** A green pipeline that still lets bugs escape:
A) Is fine — it is green
B) Signals coverage or assertion-quality gaps — the senior examines what the suite fails to verify, not just its pass rate
C) Means the app is perfect
D) Means more UI tests

**3.** Deciding test coverage across layers:
A) Automate everything at the UI
B) Push coverage to the fastest reliable layer (unit/API) and reserve E2E for critical journeys — a senior shapes the whole team's test distribution
C) Manual everything
D) E2E only

**4.** A senior reviewing a junior's automation looks first at:
A) Formatting
B) Stable selectors, meaningful assertions, test independence, and maintainability — the things that determine whether the suite survives
C) Line count
D) Naming only

**5.** Exploratory testing at senior level:
A) Is beneath the role
B) Remains high-value — and the senior also teaches it, designs charters for the riskiest areas, and converts findings into automated regressions
C) Is fully replaced by automation
D) Is random

**6.** When the same class of bug keeps escaping:
A) Test harder each time
B) Treat it as a systemic signal — add a check at the right layer, improve dev practices, or change the process, so the class stops recurring
C) Accept it
D) Blame developers

**7.** Test data collisions causing intermittent failures:
A) Are unavoidable
B) Are a design problem — isolated data per test, factories, and cleanup remove them; a senior fixes the data strategy, not individual symptoms
C) Mean using production data
D) Are a framework bug

**8.** A senior's view of automation ROI:
A) Automate everything
B) Weigh build and maintenance cost against value (run frequency, risk, stability) — and be willing to not automate what is not worth it
C) Automate nothing
D) UI only

**9.** Performance testing findings (tail latency degrading under load):
A) Are infra's problem
B) Are quality findings a senior surfaces with data and drives toward a fix — users feel tail latency at peak even if the happy path is fast
C) Mean the test is wrong
D) Are ignorable

**10.** Authorization testing:
A) Trust the UI
B) A senior ensures endpoints are exercised per role for least privilege — IDOR and missing-auth bugs are severe and invisible from the UI
C) Test admins only
D) Is the developer's job

**11.** Accessibility as quality:
A) Optional
B) A senior holds the bar — automated scans plus manual screen-reader, keyboard, contrast, and zoom testing — as a real quality and compliance concern
C) Fully automatable
D) Out of scope

**12.** Owning quality for an area versus a feature:
A) Are the same
B) A senior owns quality across an area or system — its automation health, risk picture, and the team's practices in it — not just one feature's cases
C) Means more manual testing
D) Means less automation

**13.** A release readiness call:
A) Requires zero bugs
B) Is an honest risk picture the senior provides so the team can decide — what is solid, what is risky, what is untested — not a guarantee of perfection
C) Is QA's veto
D) Is the PM's alone

**14.** Converting a hard exploratory find into lasting protection:
A) Leave it manual
B) Once understood, encode it as an automated regression at the appropriate layer, so it cannot silently return
C) Cannot be automated
D) Is not worth it

**15.** A senior quality engineer's deepest responsibility is:
A) Writing the most tests
B) The quality and reliability of what the team ships and how the team achieves it — coverage, risk, practices, and the health of the whole quality system — not just their own cases
C) The CI config
D) Bug count

---

## Section B — Reading and Reasoning About Code (Q16–Q30)

**16.** Reading the application's source as a senior QA:
A) Is out of scope
B) Is essential — knowing what the code does sharpens where to test, enables precise bug reports, and lets you review changes for risk
C) Is the developer's job only
D) Is impossible

**17.** A variable, function, conditional, and loop:
A) Are beyond QA
B) Are basic constructs a senior reads fluently — enough to follow logic, spot a missing branch, and reason about what a change affects
C) Are automation-only
D) Do not matter

**18.** A pull request changing a shared function:
A) Only affects that function
B) May affect every caller — a senior QA reasons about the blast radius and tests the callers, not just the changed lines
C) Is safe by default
D) Needs no testing

**19.** A conditional missing an `else`/default branch:
A) Is fine
B) Is a common defect source — the unhandled case; a senior who reads code spots these before they ship
C) Cannot cause bugs
D) Is a style issue only

**20.** An off-by-one or boundary bug in code:
A) Is invisible without running it
B) Is often spottable by reading loop bounds and comparisons — code literacy lets QA catch these in review
C) Is not QA's concern
D) Cannot exist

**21.** A function with side effects (mutating shared state, writing to a store):
A) Is irrelevant to testing
B) Is a testing signal — side effects widen what a change can break and what must be verified
C) Is always safe
D) Cannot be tested

**22.** Reading a diff in review:
A) Is developer-only
B) Lets a senior QA identify what behavior changed, what risk it carries, and what to test — participating in review is high-leverage prevention
C) Is impossible
D) Wastes time

**23.** A change with no accompanying tests:
A) Is fine if it works
B) Is worth flagging in review — a senior QA asks for tests on risky logic and helps identify the cases
C) Is the developer's choice alone
D) Cannot be reviewed

**24.** Understanding a unit test a developer wrote:
A) Is beyond QA
B) Lets a senior QA judge whether it actually verifies the risk, suggest missing cases, and raise the team's unit-testing quality
C) Is not useful
D) Is impossible

**25.** A "code smell" (duplicated logic, a huge function, deep nesting):
A) Is not QA's concern
B) Often correlates with bug risk — a senior QA can note it as a risk area worth extra testing, even without owning the refactor
C) Is a style preference
D) Cannot be seen by QA

**26.** Static analysis and linters:
A) Are developer-only tools
B) Catch classes of defects before tests run; a senior QA understands their role in the quality system and advocates for them
C) Replace testing
D) Are useless

**27.** Reading logs and stack traces:
A) Is developer-only
B) Is core senior QA skill — the trace localizes the failure, making bug reports precise and automation debugging fast
C) Is impossible
D) Wastes time

**28.** Tracing a bug from symptom toward likely cause in code:
A) Is overreach
B) Is valuable — a report that says "the null appears because this branch does not handle the empty case" is far more actionable, even if the developer owns the fix
C) Is always wrong
D) Is impossible for QA

**29.** Version control fluency (branches, diffs, history, bisect):
A) Is developer-only
B) Lets a senior QA find which change introduced a regression and understand the history of a risky area
C) Is unnecessary
D) Is impossible

**30.** A senior QA who cannot read the code under test:
A) Is fine — black-box only
B) Is limited — code literacy multiplies where and how effectively they can find risk, and is required for the broadening this level demands
C) Is the norm
D) Should stay black-box

---

## Section C — Backend, API, and HTTP Depth (Q31–Q42)

**31.** The request path from client to response:
A) Client to database directly
B) Client → (CDN/load balancer) → application → often a database or cache → response — a senior QA reasons about where along this path a failure occurs
C) The client runs the server
D) The CDN runs logic

**32.** HTTP method semantics and idempotency:
A) Any method does anything
B) GET is safe/idempotent, PUT/DELETE idempotent, POST generally not — a senior QA tests retries and double-submits against these expectations
C) Are decorative
D) Only POST matters

**33.** Status codes in depth (401 vs 403, 400 vs 422, 429, 5xx):
A) All mean failure
B) Carry distinct meaning a senior QA tests for and verifies the client handles correctly — auth vs. permission, bad request vs. unprocessable, rate limit, server error
C) Are interchangeable
D) Only 200 matters

**34.** Testing an API contract:
A) Only the happy response
B) Verify status, body shape and values, error contracts, auth behavior, and edge cases — and guard the contract against breaking changes
C) Only the status
D) The UI only

**35.** The N+1 query problem observed as a slow endpoint:
A) Is a client bug
B) Is a backend performance anti-pattern a senior QA can recognize and flag — many small queries where one batched query belongs
C) Is a network issue
D) Cannot be observed

**36.** Testing eventual consistency:
A) Expect immediate consistency always
B) Account for propagation delay — after a write, a read (especially from a replica or cache) may briefly be stale; test the window and the UX around it
C) Is impossible
D) Means bugs

**37.** Verifying a backend effect:
A) Trust the API response
B) For critical actions, confirm the data actually changed correctly in the database — a success response can accompany wrong stored data
C) Is the DBA's job
D) Is impossible

**38.** Testing authentication flows (tokens, expiry, refresh, revocation):
A) One valid login
B) Valid, missing, expired, invalid, and revoked credentials, and that protected endpoints reject unauthenticated access — auth is a rich test surface
C) Is developer-only
D) Cannot be automated

**39.** Rate limiting and its correct behavior:
A) Is out of scope
B) Is testable — exceeding limits returns 429 with Retry-After, legitimate use is unaffected, and the client backs off rather than hammering
C) Cannot be tested
D) Is the developer's job

**40.** A webhook or async callback the system relies on:
A) Is irrelevant to QA
B) Is testable and risk-prone — verify signature validation, idempotency (retries), and out-of-order/duplicate handling
C) Is the same as a REST call
D) Cannot be tested

**41.** Old clients hitting a changed API:
A) Are irrelevant
B) Are a real risk a senior QA considers — breaking changes without versioning break clients in the field; test backward compatibility
C) Never happen
D) Are the backend's sole concern

**42.** A senior QA who cannot test at the API layer:
A) Is fine — UI only
B) Is limited — API testing is faster, more stable, and reaches cases the UI cannot; it is core senior quality-engineering skill
C) Is the norm
D) Should stay UI-only

---

## Section D — Databases and Data (Q43–Q52)

**43.** A relational schema (tables, primary/foreign keys):
A) Is beyond QA
B) Is readable by a senior QA — enough to know what data a feature touches, verify effects, and reason about integrity
C) Is DBA-only
D) Does not matter

**44.** An index and its effect:
A) Is irrelevant to QA
B) Speeds lookups at the cost of slower writes — a missing index is a common cause of the slow endpoints QA experiences as latency, worth recognizing
C) Encrypts data
D) Is a primary key

**45.** Writing a SELECT with a WHERE and JOIN:
A) Is beyond QA
B) Is reasonable senior QA literacy — verifying data state, checking effects, and reasoning about relationships
C) Is DBA-only
D) Deletes data

**46.** Running UPDATE/DELETE on a shared test database:
A) Is fine
B) Can corrupt data others depend on — a senior understands read vs. write risk and treats shared environments carefully
C) Has no consequences
D) Is required

**47.** A transaction (all-or-nothing):
A) Is money-only
B) Groups operations so they all commit or all roll back — a senior QA tests that multi-step changes are atomic and consistent
C) Speeds reads
D) Replaces backups

**48.** Data integrity constraints (unique, not-null, foreign keys):
A) Are decorative
B) Enforce rules at the database level — a senior QA tests that violations are rejected correctly and that the app handles the resulting errors
C) Are the developer's job
D) Do not matter

**49.** Test data lifecycle at scale:
A) One shared dataset
B) Isolated, seeded, and cleaned-up data per test, using factories/builders, and anonymized production-like data where realism matters — collisions and staleness are major flakiness sources
C) Production data
D) Random uncontrolled data

**50.** Migrations changing the schema between versions:
A) Are irrelevant to QA
B) Are a risk area — a senior QA verifies migrations apply correctly, do not lose data, and that the app tolerates the transition
C) Are automatic
D) Are DBA-only

**51.** Verifying data after a sync or batch job:
A) Trust it ran
B) Confirm the resulting data is correct and complete — batch and sync jobs are silent failure points without verification
C) Is impossible
D) Is the developer's job

**52.** A senior QA who cannot query the database:
A) Is fine
B) Is limited — verifying real data effects is often the only way to confirm backend correctness, and querying is core literacy at this level
C) Is the norm
D) Should stay UI-only

---

## Section E — Systems, Reliability, and Operations (Q53–Q66)

**53.** Caches across layers (browser/CDN/app/database):
A) Are one thing
B) Each can cause a bug to appear or vanish — a senior QA reasons about caching when a result is stale or inconsistent, and tests invalidation
C) Only the CDN caches
D) Are irrelevant

**54.** A load balancer and horizontal scaling:
A) Are irrelevant to QA
B) Shape behavior a senior QA should understand — statelessness assumptions, session handling, and why a bug might appear on one instance and not another
C) Speed the database
D) Are DBA-only

**55.** Eventual consistency at the system level:
A) Means errors
B) Is a common trade-off — a senior QA designs tests and UX expectations around brief staleness after writes propagate
C) Is forbidden
D) Is a transaction

**56.** A message queue / async processing behind a feature:
A) Is irrelevant
B) Introduces at-least-once delivery, retries, and ordering concerns a senior QA tests — duplicates, out-of-order events, and processing failures
C) Is the same as HTTP
D) Cannot be tested

**57.** Blast radius of a change:
A) Its file size
B) How much of the system or how many users a failure would affect — a senior QA weighs it when prioritizing testing and advising on release risk
C) Lines changed
D) Time to build

**58.** Feature flags multiplying test states:
A) Ignore them
B) Require testing both states and safe flipping — flags decouple deploy from release but expand the state space QA must cover
C) Only the on state
D) Are the developer's job

**59.** Canary and staged rollouts:
A) Are irrelevant to QA
B) Are reliability tools a senior QA works with — smaller blast radius, metric-watching, and the ability to halt; QA helps define the health signals
C) Replace testing
D) Are deploy-only

**60.** Observability (logs, metrics, traces):
A) Is backend-only
B) Is quality infrastructure a senior QA uses and advocates for — you cannot verify or diagnose what you cannot observe, in test or production
C) Is console.log
D) Is unnecessary

**61.** Synthetic monitoring in production:
A) Is unsafe
B) Runs key journeys against production continuously to catch outages and regressions before users report them — an operational extension of QA
C) Replaces pre-release testing
D) Is the same as CI

**62.** p95/p99 latency versus average:
A) Are the same
B) The tail is what users feel as "slow" — a senior QA looks past averages to the tail when assessing performance quality
C) Are storage metrics
D) Are irrelevant

**63.** An incident in production:
A) Is not QA's concern
B) Involves QA in diagnosis, in the blameless post-mortem, and in adding the checks or automation that would have caught it — QA's role extends past release
C) Is ops-only
D) Ends QA's job at release

**64.** Testing resilience (failure injection, dependency outages):
A) Is reckless
B) Verifies graceful degradation when dependencies fail — advanced, but a senior QA understands reliability testing and its value
C) Is load testing
D) Is forbidden

**65.** SLOs and error budgets:
A) Are marketing
B) Are measurable reliability targets a senior QA can help define and monitor — connecting testing and monitoring to explicit quality goals
C) Are irrelevant to QA
D) Replace testing

**66.** A senior QA who thinks only about pre-release testing:
A) Is correctly scoped
B) Is missing half of modern quality — reliability, monitoring, and how the system behaves and fails in production are part of quality engineering
C) Is efficient
D) Is the norm

---

## Section F — Security as Quality (Q67–Q76)

**67.** Common web vulnerabilities a senior QA should test for:
A) None — security is separate
B) At least injection, broken authorization (IDOR), missing auth, XSS-prone inputs, and sensitive-data exposure — before specialists get involved
C) Only passwords
D) Only penetration testing

**68.** SQL injection:
A) Is old and gone
B) Is testable — inputs that alter query structure; a senior QA probes for it and verifies parameterized queries defend against it
C) Is a client bug
D) Cannot be tested

**69.** Insecure direct object reference (IDOR):
A) Is not real
B) Is a top authorization bug — requesting another user's resource by ID; a senior QA tests that ownership is enforced server-side
C) Is an OAuth concept
D) Is a client issue

**70.** XSS-prone input:
A) Is not QA's concern
B) Is testable — inputs containing script/HTML rendered unsafely; a senior QA verifies output is escaped and dangerous inputs are handled
C) Is a network attack
D) Cannot be found

**71.** Authorization enforced only in the UI:
A) Is sufficient
B) Is a serious hole a senior QA exposes by calling endpoints directly — the server must enforce it, since the client is controllable
C) Is fine
D) Is the developer's job

**72.** Sensitive data in responses, logs, or errors:
A) Is fine internally
B) Is a leak a senior QA checks for — tokens, PII, and internal details should not appear where they can be captured
C) Is encrypted automatically
D) Is required

**73.** Secrets exposed in client code or config:
A) Are safe if obfuscated
B) Are extractable — a senior QA flags secrets that should live server-side, as part of quality
C) Are encrypted
D) Are invisible

**74.** Testing HTTPS/transport security:
A) Is out of scope
B) Includes verifying sensitive traffic is encrypted and that the app rejects insecure connections where required
C) Is the network team's job
D) Slows the app

**75.** Third-party dependencies and their risk:
A) Are inert
B) Run with the app's privileges and can carry vulnerabilities or collect data — a senior QA considers them part of the quality and security surface
C) Are sandboxed
D) Are safe if popular

**76.** Security as part of the definition of quality:
A) Is a separate discipline QA ignores
B) Is inseparable from quality — a functionally correct feature with an auth bypass is not quality; a senior QA treats security issues as first-class defects
C) Is the security team's alone
D) Is optional

---

## Section G — Senior Judgment, Influence, and Collaboration (Q77–Q100)

**77.** Influencing the whole team's testing:
A) Is overreach
B) Is the highest-leverage senior QA activity — better developer tests, testable design, and shared standards prevent far more defects than QA can catch alone
C) Is the lead's job
D) Is impossible

**78.** A developer's unit tests are weak:
A) Rewrite them silently
B) Engage constructively — pair, suggest cases, explain risk; QA raising developer testing quality multiplies impact
C) Report them
D) Ignore it

**79.** Shifting quality left:
A) Means QA tests earlier alone
B) Means the whole team prevents defects earlier — testable requirements, dev testing, design review — with QA driving the shift
C) Is impossible
D) Is a slogan

**80.** A junior QA submits a confused automation PR:
A) Reject and say start over
B) Engage charitably — diagnose intent, point to stable patterns, leave a clearer next step
C) Approve to be kind
D) Ignore

**81.** A developer disagrees that something is a bug:
A) QA always wins
B) Resolve against requirements and user impact, escalating to the owner if unclear — evidence and the user decide
C) Developer always wins
D) Drop it

**82.** Advocating a bug's importance:
A) Is manipulation
B) Is part of the role — clearly conveying real user impact helps the team prioritize correctly, especially for easily-dismissed issues
C) Is the PM's job
D) Is unnecessary

**83.** A working relationship with developers:
A) Adversarial
B) Collaborative toward shared quality — QA provides information and raises practices; developers own their code's quality; no blame
C) QA polices developers
D) Distant

**84.** A working relationship with the PM:
A) Take direction silently
B) Provide the honest quality-and-risk picture, push for testable requirements, and inform prioritization — a partner in shipping quality
C) Own the roadmap
D) Just execute cases

**85.** Estimating quality work for a feature area:
A) A single number
B) A reasoned range covering strategy, manual and exploratory testing, automation build/maintenance, data, environments, and re-test — with stated risks
C) The developer's estimate
D) Zero

**86.** Under deadline pressure to skip testing:
A) Skip quietly
B) Be transparent about coverage and resulting risk, and let the team decide with real information — never fake coverage or sign off blindly
C) Work all night
D) Block the release unilaterally

**87.** A senior QA's demeanor in an incident:
A) Panic or blame
B) Steady — help diagnose, gather facts, and afterward lead the blameless learning and the checks that prevent recurrence
C) Stay out of it
D) Wait

**88.** Saying "I do not know, let me verify":
A) Damages credibility
B) Builds it — verifying is the essence of QA; confident guessing defeats the purpose
C) Is for seniors only
D) Should be hidden

**89.** A senior QA who only runs their own cases:
A) Is focused
B) Is missing the role — raising team practices, reviewing, mentoring, and owning an area's quality are the job at this level
C) Is efficient
D) Is correct

**90.** A senior QA who blocks every release seeking zero risk:
A) Has high standards
B) Is a bottleneck — the goal is acceptable risk with clear information, supporting timely shipping, not certainty
C) Is the gold standard
D) Should be promoted

**91.** When a serious defect escapes:
A) Blame someone
B) Lead a blameless analysis — how it escaped, what closes the gap — and improve the process and coverage
C) Hide it
D) Quit

**92.** Owning quality for a system, not a feature:
A) Means more cases
B) Means the area's automation health, risk picture, team practices, and production behavior — being the person the team trusts on its quality
C) Means automation only
D) Means the happy path

**93.** Quality as a whole-team property:
A) Means QA is unnecessary
B) Is the mature view — QA specializes and amplifies while shifting ownership of quality onto the whole team; this is higher-leverage than catching bugs alone
C) Means developers stop testing
D) Means QA does everything

**94.** Choosing where to invest quality effort:
A) Everywhere equally
B) By risk and value — critical flows, complex/changed code, high user impact — deliberately, with lighter coverage elsewhere by choice
C) Where it is easiest
D) Randomly

**95.** Mentoring across the QA team:
A) Is the lead's job
B) Is part of being senior — growing testers in design, automation, security awareness, and influence multiplies the team and deepens your own mastery
C) Wastes time
D) Is premature

**96.** Communicating quality to leadership:
A) Bug counts
B) Risk and user impact they can act on, tied to business outcomes — not raw metrics divorced from meaning
C) Coverage percentage only
D) Is not QA's job

**97.** A senior QA's view of automation and manual together:
A) Automate everything, stop manual
B) Automate the repetitive and stable; invest human judgment in exploration, usability, and the unexpected — and know which is which
C) Manual only
D) Random

**98.** The single trait that most distinguishes Senior 1 from a strong Junior 3:
A) Years
B) Judgment — about risk, coverage, and where quality effort matters — applied across the whole system and the whole team, not just their own testing
C) Speed
D) Test count

**99.** Broadening beyond QA into code, architecture, reliability, and security:
A) Is a distraction from testing
B) Is exactly what the senior quality-engineering role requires — quality lives everywhere in the system, so senior QA judgment must reach everywhere
C) Is disloyal to QA
D) Is premature

**100.** A QA Junior 3 who passes this exam is signaling:
A) That they know everything
B) That they have broadened into a senior quality engineer — reading code, testing across the stack, thinking about reliability and security, and raising the whole team's quality, with testing craft now a strength they bring to a broader role
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

*Administrator's note: This is the QA convergence exam, intentionally demanding for a candidate who has lived only inside black-box testing. A QA Junior 3 who scores 70–80 has done the testing-depth work and now needs the breadth — code literacy, backend and data depth, systems and reliability, security. Coach them and re-sit in six months. Note that the "generalist" a QA converges into is a senior quality engineer who operates across the stack, not necessarily a product feature developer — calibrate the debrief to your company's actual expectation for that role.*
