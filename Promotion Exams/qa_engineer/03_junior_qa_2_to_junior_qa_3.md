# Promotion Exam: Junior QA Test Engineer 2 → Junior QA Test Engineer 3

**Track:** QA Test Engineer (Specialist — blended, automation-heavy at this level)
**Format:** 100 multiple-choice questions
**Time:** 150 minutes
**Passing score:** 89 / 100

**Scope.** Junior QA 3 is the top of the specialist track before convergence into the generalist senior level. A Junior QA 3 owns quality for a medium feature area with minimal supervision, designs and maintains a healthy automation suite, tests at the API and data layers, contributes to test strategy and tooling, mentors junior testers, and shows early quality-engineering judgment. This exam leans **automation-heavy** — framework architecture, flakiness, CI/CD integration, API and performance testing, test data management — while keeping the manual and exploratory judgment that automation cannot replace.

**Reminder.** This is the last specialist-only QA exam. The next exam (Junior 3 → Senior 1) is the convergence point and tests whether the candidate has broadened beyond QA into the quality-engineering-across-the-stack role a senior needs — influencing developer testing practices, thinking about system reliability, and understanding the code and architecture under test. A candidate who aces this but cannot read the application's code, reason about its architecture, or engage developers on their own testing is not ready for the next gate. That is by design.

---

## Section A — Automation Framework Architecture (Q1–Q14)

**1.** A test automation framework's job is:
A) To record clicks
B) To provide structure, reusability, and maintainability — so tests are readable, share setup, use stable abstractions, and do not rot as the app changes
C) To replace testers
D) To run manually

**2.** The Page Object Model at scale:
A) Is over-engineering
B) Encapsulates each page/component's locators and actions so UI changes are fixed in one place — the single most impactful maintainability pattern for UI automation
C) Slows tests
D) Is obsolete

**3.** A "screenplay" or action/task-based pattern (over raw page objects):
A) Is always better
B) Can improve readability and reuse for complex flows by modeling user tasks and abilities — a heavier abstraction worth it only when complexity justifies it
C) Is required
D) Is the same as page objects

**4.** Separating test logic from test data:
A) Is unnecessary
B) Lets the same logic run over many data sets (data-driven), and keeps tests readable — data belongs in fixtures/parameters, not hardcoded throughout
C) Slows tests
D) Is impossible

**5.** Shared setup and teardown (fixtures, hooks):
A) Create hidden dependencies
B) Centralize common preconditions (logged-in user, seeded data) and cleanup — reducing duplication while keeping tests independent
C) Are forbidden
D) Slow the suite pointlessly

**6.** A framework that mixes concerns (locators, waits, business logic, assertions all in test bodies):
A) Is clean
B) Is unmaintainable at scale — separate locators, actions, data, and assertions into layers
C) Is fastest
D) Is required

**7.** Configuration across environments (base URLs, credentials, feature flags):
A) Hardcode per test
B) Externalize into environment config so the same suite runs against dev/staging/CI without editing tests
C) Live in the UI
D) Do not vary

**8.** Test tagging/categorization (smoke, regression, slow, flaky-quarantine):
A) Is bureaucracy
B) Lets CI run the right subset at the right time — fast smoke on every PR, full regression nightly, quarantined tests separated
C) Is impossible
D) Slows tests

**9.** Reusable custom commands/helpers:
A) Should be avoided (repeat instead)
B) Encapsulate common multi-step actions (login, create order) so tests read clearly and changes happen in one place
C) Are the developer's job
D) Cause flakiness

**10.** A framework's reporting output:
A) Does not matter
B) Should make failures actionable — clear failure messages, screenshots/video on failure, and logs — so a red run can be diagnosed without re-running
C) Is just pass/fail
D) Is optional

**11.** Choosing a tool/framework:
A) Pick the newest
B) Match it to the app (web, mobile, API), the team's language skills, ecosystem maturity, and maintenance cost — not hype
C) Pick the most popular blog post
D) Build your own always

**12.** Building a custom framework from scratch:
A) Is always right
B) Is rarely worth it — mature tools handle the hard parts (waiting, retries, reporting); reserve custom building for genuinely unmet needs
C) Is required for seniority
D) Is faster

**13.** Abstraction level in tests:
A) As low-level as possible
B) High enough that a test reads like the user scenario ("log in, add item, checkout"), with the mechanics hidden in reusable layers below
C) Raw selenium calls everywhere
D) Does not matter

**14.** When a framework decision affects the whole team:
A) Decide alone
B) Discuss and justify against alternatives, considering maintenance, onboarding, and migration cost — framework choices are long-lived commitments
C) Copy another team
D) Defer to the newest hire

---

## Section B — Flakiness and Reliability (Q15–Q26)

**15.** A flaky test:
A) Is acceptable if rare
B) Passes and fails without a code change; even a few erode trust until people ignore all failures — flakiness is a first-order problem, not a nuisance
C) Should be re-run until green
D) Means the app is unstable

**16.** The most common cause of UI flakiness is:
A) Slow computers
B) Timing/synchronization — acting before the app is ready; robust waits for conditions fix most of it
C) Too many assertions
D) The framework

**17.** Auto-retrying flaky tests to hide them:
A) Solves flakiness
B) Masks it — retries can be a pragmatic stopgap, but a test that only passes on retry is still broken and should be fixed
C) Is best practice
D) Is impossible

**18.** Test pollution / shared state:
A) Is harmless
B) When one test's data or side effects affect another, causing order-dependent failures — isolate state per test
C) Speeds tests
D) Is required

**19.** Animations and transitions causing flakiness:
A) Cannot be handled
B) Are a known cause — disable animations in the test environment or wait for the settled state, rather than sleeping
C) Mean the test is wrong
D) Are the designer's fault

**20.** Third-party dependencies (ads, analytics, external APIs) in E2E tests:
A) Are fine to hit live
B) Introduce flakiness and slowness — mock or stub them where they are not the thing under test
C) Must always be real
D) Cannot be controlled

**21.** A test that fails only in CI, never locally:
A) Is a CI bug to ignore
B) Often reflects real differences — parallelism, resources, timing, headless rendering, or data — that CI exposes; diagnose rather than dismiss
C) Should be deleted
D) Means CI is broken

**22.** Quarantining a flaky test:
A) Is giving up
B) Is a pragmatic step — move it out of the blocking suite so it stops eroding trust, with a ticket to fix it, rather than leaving it to poison every run
C) Should be permanent
D) Is forbidden

**23.** Parallel test execution:
A) Is always safe
B) Speeds the suite but exposes shared-state and data-collision bugs — tests must be independent and use isolated data to run in parallel safely
C) Is impossible
D) Causes no issues

**24.** Deterministic tests:
A) Are impossible with real systems
B) Are the goal — same inputs, same result every time; nondeterminism (random data uncontrolled, time-of-day, external state) is designed out
C) Are slower
D) Do not matter

**25.** Measuring suite health:
A) Only pass rate
B) Track flakiness rate, runtime, and failure diagnosability over time — a suite trending flakier or slower needs attention before it is abandoned
C) Is impossible
D) Is the developer's job

**26.** A green suite that misses real bugs:
A) Is fine — it is green
B) Is a coverage or assertion-quality problem — passing tests that do not actually verify the risky behavior give false confidence
C) Is impossible
D) Means the app is perfect

---

## Section C — CI/CD Integration (Q27–Q38)

**27.** Tests in the CI pipeline:
A) Are optional
B) Run automatically on changes, gating merges and deploys — the mechanism by which automation actually prevents regressions
C) Run only nightly
D) Run manually

**28.** A layered CI test strategy:
A) Run everything on every commit
B) Fast unit/smoke on every PR, broader regression on merge/nightly, full E2E on a schedule — balancing feedback speed against coverage
C) Only E2E, always
D) No tests in CI

**29.** A quality gate in the pipeline:
A) Slows delivery for no reason
B) Blocks a change from progressing if tests fail or coverage/quality thresholds are not met — enforcing standards automatically
C) Is manual sign-off only
D) Is optional

**30.** Test results feeding back to developers fast:
A) Is unimportant
B) Is the point of CI — the sooner a developer learns their change broke something, the cheaper the fix and the smaller the context switch
C) Slows them
D) Is impossible

**31.** A consistently red pipeline:
A) Is normal
B) Is a crisis for the suite's value — if red is the default, real failures hide; fix or quarantine until green is meaningful again
C) Should be ignored
D) Means more tests

**32.** Running tests against ephemeral/preview environments:
A) Is impossible
B) Lets each change be tested in isolation against a fresh environment, reducing "works in staging" surprises
C) Is wasteful always
D) Is production testing

**33.** Test execution time in CI:
A) Does not matter
B) Directly affects developer flow — slow pipelines get bypassed; parallelize, shard, and right-size the pyramid to keep it fast
C) Should be maximized
D) Is fixed

**34.** Storing artifacts (screenshots, videos, logs) from CI failures:
A) Wastes storage
B) Is essential for diagnosing failures that only happened in CI — without them, a red run is a mystery
C) Is impossible
D) Is the developer's job

**35.** Smoke tests post-deploy (in production or production-like):
A) Are pointless
B) Verify the deploy actually works (critical paths up, key integrations live) — catching deploy-specific failures unit tests cannot
C) Replace all testing
D) Are unsafe always

**36.** Gating a deploy on test results:
A) Is overcautious
B) Prevents shipping known-broken builds; combined with fast rollback, it is a core reliability practice
C) Slows delivery pointlessly
D) Is manual only

**37.** Flaky tests blocking the pipeline:
A) Should be tolerated
B) Are a top reason teams disable or ignore CI — fix or quarantine them so the pipeline's signal stays trustworthy
C) Are unavoidable
D) Mean disabling CI

**38.** Coverage reporting in CI:
A) Should enforce 100%
B) Is a useful trend and floor, not a target — meaningful assertions matter more than the number, and 100% with shallow tests is worse than less with strong tests
C) Is irrelevant
D) Replaces review

---

## Section D — API, Performance, and Specialized Testing (Q39–Q54)

**39.** API test automation as a share of the suite:
A) Should be minimal
B) Should be substantial — faster and more stable than UI tests, covering business logic and contracts efficiently; a healthy suite is not UI-heavy
C) Should be zero
D) Replaces UI tests entirely

**40.** Contract testing between services (consumer-driven contracts):
A) Is pointless
B) Verifies that a provider's API meets what consumers depend on, catching breaking changes before they reach production — valuable in multi-service systems
C) Is UI testing
D) Replaces integration tests

**41.** Testing an API's error contract:
A) Only test success
B) Verify the status codes, error shapes, and messages for invalid input, auth failures, and rate limits — clients depend on these being stable
C) Is the developer's job
D) Cannot be automated

**42.** Performance testing types (load, stress, soak, spike):
A) Are all the same
B) Differ — load tests expected traffic, stress finds the breaking point, soak runs long to find leaks, spike tests sudden surges; each answers a different question
C) Are only for infra
D) Are manual

**43.** A load test result showing p95 latency degrading under load:
A) Is irrelevant
B) Is a real finding — the system may meet latency at low load but fail users at peak; tail latency under load is what users feel
C) Means the test is wrong
D) Is a client issue

**44.** Realistic load test design:
A) One endpoint hammered
B) Models real user behavior and traffic mix, ramps gradually, uses production-like data and environment — an unrealistic test gives misleading results
C) Uses production always
D) Is impossible

**45.** A memory leak found by a soak test:
A) Is a false alarm
B) Is a serious finding — memory growing over sustained operation eventually crashes the service; soak tests exist precisely to catch this
C) Is normal
D) Is a test bug

**46.** Security testing basics QA should cover:
A) None — security is separate
B) At least the common issues — injection, broken authorization (IDOR), missing auth on endpoints, and exposure of sensitive data — even before specialists get involved
C) Only penetration testing
D) Only passwords

**47.** Testing authorization thoroughly:
A) Trust the UI
B) Directly exercise endpoints as each role and verify least privilege — that users cannot access or modify what they should not; authorization bugs are severe and UI-invisible
C) Test admins only
D) Is the developer's job

**48.** Accessibility testing at this level:
A) Run an automated scan and stop
B) Combine automated scans with manual screen-reader, keyboard, contrast, and zoom testing — automation catches only part, and accessibility is a real quality and compliance concern
C) Is out of scope
D) Is fully automatable

**49.** Visual regression testing:
A) Replaces functional tests
B) Detects unintended visual changes by comparing snapshots across states/viewports; valuable but needs disciplined baselines or it becomes flaky noise
C) Is impossible
D) Is manual

**50.** Testing across a device/browser matrix:
A) One config suffices
B) Critical flows should run across the browsers, OS versions, and devices users actually use — cloud device farms make this feasible at scale
C) Is automatic
D) Is manual only

**51.** Chaos/failure-injection testing:
A) Is reckless
B) Deliberately injects failures (latency, dropped dependencies) to verify the system degrades gracefully — advanced, but QA should understand resilience testing exists
C) Is the same as load testing
D) Is forbidden

**52.** Test data management at scale:
A) Reuse one shared dataset
B) Requires strategy — isolated data per test, factories/builders, seeding and cleanup, and anonymized production-like data — because data collisions and staleness are major flakiness sources
C) Use production data
D) Does not matter

**53.** Synthetic monitoring (automated checks running against production continuously):
A) Is the same as CI tests
B) Runs key journeys against production on a schedule to catch outages and regressions users would otherwise hit first — an operational use of automation
C) Is unsafe
D) Replaces all testing

**54.** Testing feature flags:
A) Ignore them
B) Verify behavior in both flag states, and that flipping a flag does not break the app — flags multiply the states that must be tested
C) Only test the on state
D) Is the developer's job

---

## Section E — Test Strategy and Quality Metrics (Q55–Q66)

**55.** A test strategy for a feature area:
A) Is a list of test cases
B) Decides what to test at which layer, what to automate vs. explore, what data and environments are needed, and where the risks are — a plan, not just cases
C) Is the PM's job
D) Is unnecessary

**56.** Coverage as a concept:
A) Only code coverage matters
B) Includes requirement coverage, risk coverage, and code coverage — code coverage alone can be high while important scenarios go untested
C) Should always be 100%
D) Is meaningless

**57.** "Escaped defects" (bugs found in production):
A) Are unavoidable and unmeasured
B) Are a meaningful quality signal — tracking them and doing blameless analysis of how each escaped drives real improvement
C) Mean QA failed personally
D) Should be hidden

**58.** Optimizing for a bug-count metric:
A) Improves quality
B) Can be gamed and distort behavior (padding counts, avoiding risky areas) — outcome metrics like escaped defects and user impact are healthier
C) Is required
D) Is the only metric

**59.** A risk-based approach at this level:
A) Test everything equally
B) Concentrate the strongest testing on the highest-risk areas (critical flows, complex/changed code, high user impact) and be deliberate about lighter coverage elsewhere
C) Skip risky areas
D) Is gambling

**60.** When to stop testing:
A) When all cases pass
B) When the remaining risk is acceptable to the team given the information gathered — testing is risk reduction, not a search for certainty
C) Never
D) At the deadline regardless

**61.** Regression suite growth over time:
A) Add every case forever
B) Curate it — remove redundant/obsolete tests, keep the high-value ones, and balance coverage against runtime, or it becomes unmaintainable
C) Never remove tests
D) Automate everything once

**62.** Balancing automation investment:
A) Automate everything possible
B) Weigh the cost to build and maintain a test against its value (frequency of run, risk covered, stability) — some things are not worth automating
C) Automate nothing
D) Only automate UI

**63.** Test maintenance cost:
A) Is zero after writing
B) Is ongoing and real — every test is a liability as well as an asset; unmaintained suites decay into ignored noise
C) Is the developer's job
D) Does not exist

**64.** A test that has never failed in a year:
A) Is a perfect test
B) Is worth examining — it may be genuinely guarding something stable, or it may not actually be able to fail (verifying nothing)
C) Should be deleted
D) Should be copied

**65.** Communicating quality to non-technical stakeholders:
A) Show them the test suite
B) Translate into risk and user impact they can act on — "checkout is solid; the new promo has an untested edge case that could over-discount" beats a coverage percentage
C) Only report bug counts
D) Is not QA's job

**66.** Test documentation:
A) Is wasted effort
B) Makes coverage visible, onboards new testers, and records the testing approach and known gaps — lightweight but valuable
C) Is the PM's job
D) Is automatic

---

## Section F — Manual and Exploratory at Senior-Junior Level (Q67–Q76)

**67.** Exploratory testing at this level:
A) Is beneath a Junior 3
B) Remains one of the highest-value activities — a skilled explorer finds critical issues no scripted or automated test targets; automation frees time for it
C) Is replaced by automation
D) Is random clicking

**68.** Designing an exploratory session for a complex feature:
A) Just poke around
B) Frame a charter, focus on the riskiest interactions and edge behaviors, take notes, and follow anomalies — disciplined exploration
C) Is a full script
D) Requires no plan

**69.** What automation fundamentally cannot do:
A) Everything can be automated
B) Notice the unexpected, judge whether something "feels wrong," assess usability, and explore creatively — human judgment covers what scripted checks cannot
C) Run fast
D) Check assertions

**70.** Usability and UX issues:
A) Are not defects
B) Are real quality problems QA should surface — confusing flows, poor feedback, and unclear errors hurt users even when functionally correct
C) Are the designer's sole concern
D) Cannot be found

**71.** Testing a feature's interaction with the rest of the product:
A) Test it in isolation only
B) Also test how it interacts with existing features — integration and regression at the feature boundary is where surprising bugs live
C) Is the developer's job
D) Is unnecessary

**72.** Testing the "unhappy" user (interruptions, mistakes, going back, slow network):
A) Is edge-casey and low value
B) Reflects real usage — users get interrupted, tap twice, go back mid-flow, and lose connectivity; robust features handle it
C) Is impossible
D) Is out of scope

**73.** A charter-driven exploratory finding that automation could guard:
A) Should stay manual forever
B) Is a candidate to convert into an automated regression test once understood — exploration finds it, automation locks it in
C) Cannot be automated
D) Is not a real bug

**74.** Bug advocacy (making the case for why a bug matters):
A) Is manipulation
B) Is part of the job — presenting a bug's real user impact clearly helps the team prioritize correctly, especially for issues easy to dismiss
C) Is the PM's job
D) Is unnecessary

**75.** Testing early prototypes or designs (before code):
A) Is impossible
B) Catches problems cheapest — reviewing a design or prototype for testability, edge cases, and usability prevents defects before they are built
C) Is out of scope
D) Wastes time

**76.** Balancing manual and automated effort as a Junior 3:
A) Automate everything and stop testing manually
B) Automate the repetitive and stable; invest human time where judgment, exploration, and usability matter — the blend is the skill
C) Manual only
D) Random

---

## Section G — Collaboration, Mentoring, and Judgment (Q77–Q90)

**77.** Improving the whole team's testing (not just your own):
A) Is the lead's job
B) Is a Junior 3 growth area — helping developers write better tests, improving shared fixtures, and raising the team's testing practices multiplies impact
C) Is overreach
D) Is impossible

**78.** A developer's unit tests are weak:
A) Rewrite them yourself silently
B) Engage constructively — pair, suggest cases, explain the risk; QA influencing developer testing is a force multiplier, done collaboratively
C) Report them
D) Ignore it

**79.** Mentoring junior testers:
A) Too early
B) Is part of the role — teaching test design, automation practices, and bug advocacy grows the team and deepens your own understanding
C) Is the lead's job only
D) Wastes time

**80.** Reviewing another tester's automation:
A) Rubber-stamp
B) Review for stable selectors, meaningful assertions, independence, and maintainability — test code review raises quality across the team
C) Skip it
D) Only formatting

**81.** When QA and a developer disagree on a bug's validity:
A) QA always wins
B) Resolve against requirements and user impact, escalating to the owner if genuinely unclear — evidence and the user decide, not seniority
C) Developer always wins
D) Drop it

**82.** Advocating for testability in design:
A) Is not QA's place
B) Is high-leverage — asking for test hooks, observable states, and clear acceptance criteria at design time makes everything downstream cheaper
C) Slows design
D) Is the developer's job

**83.** Estimating testing for a medium feature:
A) A single number
B) A reasoned range covering design, manual execution, automation build/maintenance, data, environments, and re-test — with stated assumptions and risks
C) The developer's estimate
D) Zero

**84.** When testing reveals the feature was built to the wrong requirement:
A) Test it as built
B) Surface the mismatch immediately — a correctly-built wrong thing is still a defect, and catching it early saves rework
C) Ignore it
D) Fail silently

**85.** Under deadline pressure to skip testing:
A) Skip and stay quiet
B) Be transparent about what will and will not be tested and the resulting risk, and let the team decide with real information — never fake coverage
C) Work all night
D) Refuse to ship

**86.** Owning quality for a feature area:
A) Means running the given cases
B) Means understanding the area deeply, maintaining its automation, exploring its risks, tracking its quality, and being the person the team trusts on its health
C) Means automation only
D) Means the happy path

**87.** Saying "I do not know, let me verify":
A) Damages credibility
B) Builds it — QA exists to verify; confident guessing defeats the purpose
C) Is for seniors
D) Should be hidden

**88.** When you miss a serious escaped defect:
A) Blame the developer
B) Lead a blameless analysis — what allowed it through, what check or automation closes the gap — and improve the process
C) Hide it
D) Quit

**89.** Contributing to release decisions:
A) Is not QA's place
B) Is central — QA provides the honest quality-and-risk picture that informs the go/no-go, even though the decision is the team's
C) Requires zero bugs
D) Is the PM's alone

**90.** Balancing thoroughness against shipping:
A) Test until certain
B) Reduce risk to an acceptable level efficiently, communicate remaining risk clearly, and support timely shipping — perfectionism that blocks delivery is its own failure
C) Ship untested
D) Never ship

---

## Section H — Growth Toward Convergence (Q91–Q100)

**91.** Reading the application's code:
A) Is beyond QA
B) Is increasingly valuable — understanding the code under test sharpens where to look, enables better bug reports, and is essential for the broadening the next level requires
C) Is the developer's job only
D) Is impossible

**92.** Understanding the system architecture (services, database, caching):
A) Is out of scope
B) Helps QA reason about where bugs and risks live and how the system behaves end-to-end — a step toward the generalist quality thinking Senior requires
C) Is the architect's job
D) Is unnecessary

**93.** The relationship between QA and reliability/operations:
A) Are unrelated
B) Overlap — testing, monitoring, and resilience all serve quality in production; a growing QA engineer thinks beyond pre-release into how the system behaves live
C) Is adversarial
D) Is the same job

**94.** Quality as a whole-team property (not just QA's output):
A) Means QA is unnecessary
B) Is the mature view — QA amplifies and specializes, but shifting the team toward owning quality (better dev tests, testable design, shared standards) is the higher-leverage goal
C) Means QA does everything
D) Means developers stop testing

**95.** Copy-pasting an automation solution you do not understand:
A) Is fine if green
B) Is risky — unmaintainable and possibly verifying nothing; understanding is required to own quality
C) Is required
D) Is encouraged

**96.** Keeping both manual and automation skills sharp:
A) Pick one and drop the other
B) Is the blended-QA path — automation scales the repetitive, manual/exploratory covers judgment and the unexpected; strong QA engineers keep both
C) Automation only
D) Manual only

**97.** Learning to influence rather than just report:
A) Is overreach
B) Is a Junior 3 growth edge — shaping testable requirements, improving team practices, and advocating for quality upstream prevents defects rather than just catching them
C) Is the lead's job
D) Is unnecessary

**98.** A curiosity that broadens beyond QA:
A) Is a distraction
B) Is what unlocks the next level — wanting to understand the code, the architecture, how developers test, and how the system runs in production
C) Is disloyal to QA
D) Is premature

**99.** The mindset shift from Junior 2 to Junior 3 is:
A) Faster clicking
B) From executing testing to owning quality for an area — strategy, automation health, risk, mentoring, and influence, not just running cases
C) More automation only
D) More manual only

**100.** The trait that most reliably unlocks the move to Senior 1 is:
A) Speed
B) Curiosity that has broadened beyond QA into the code, the architecture, and the whole team's quality practices — quality engineering, not just testing
C) Test count
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

*Administrator's note: This is the last specialist-only QA exam. The next exam (Junior 3 → Senior 1) is the convergence point and tests broadening beyond QA into quality engineering across the stack — reading code, reasoning about architecture, influencing developer testing, and thinking about reliability in production. A candidate who aces this but cannot engage with the code and system under test should be coached toward that breadth before sitting the convergence exam.*
