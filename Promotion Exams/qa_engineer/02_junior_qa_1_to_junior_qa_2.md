# Promotion Exam: Junior QA Test Engineer 1 → Junior QA Test Engineer 2

**Track:** QA Test Engineer (Specialist — blended manual + automation)
**Format:** 100 multiple-choice questions
**Time:** 135 minutes
**Passing score:** 89 / 100

**Scope.** A Junior QA 1 tests scoped features and begins contributing to automation under supervision. A Junior QA 2 should own testing for a small-to-medium feature end-to-end — designing the test approach, executing manual and exploratory testing, writing and maintaining automated checks, verifying via API and database, and reporting clearly — with light review. This exam is deliberately **balanced** between manual craft and automation, reflecting a team that does both. It adds real automation skill (UI and API test writing, stable selectors, test data, assertions), deeper test design, and the collaboration a Junior 2 must demonstrate.

---

## Section A — Test Strategy for a Feature (Q1–Q12)

**1.** Given a new feature to test, the first step is:
A) Start clicking
B) Understand the feature, its requirements, its users, and its risks — then decide what to test and how, before executing
C) Write automation immediately
D) File bugs

**2.** A test plan for a feature should identify:
A) Only the happy path
B) Scope, the risks, what will be tested manually vs. automated, the environments and data needed, and what is explicitly out of scope
C) The developer to blame
D) The release date only

**3.** Deciding what to automate versus test manually:
A) Automate everything
B) Automate stable, repetitive, high-value checks (regression, critical paths); keep exploratory, usability, and one-off verification manual — match the tool to the job
C) Manual everything
D) Random split

**4.** The test pyramid (many unit, fewer integration, few E2E):
A) Is a developer-only concept
B) Guides QA too — favor fast, stable checks low in the stack; reserve slow, brittle end-to-end tests for critical journeys
C) Should be inverted (mostly E2E)
D) Is obsolete

**5.** An "ice cream cone" anti-pattern (mostly manual/E2E, few unit tests):
A) Is ideal
B) Is slow, brittle, and expensive to maintain — a sign testing is bunched at the wrong level
C) Is the pyramid
D) Is unavoidable

**6.** Testing a feature that depends on another team's service:
A) Assume it works
B) Test the integration deliberately, and use mocks/stubs where the dependency is unavailable or unstable — while ensuring at least some real integration coverage
C) Skip it
D) Only test in production

**7.** Prioritizing test cases under time pressure:
A) Run them in order written
B) Run the highest-risk, highest-value cases first (critical flows, likely-broken areas, recent changes), so the most important information comes early
C) Run the easiest first
D) Run automation only

**8.** Traceability between requirements and tests:
A) Is bureaucracy
B) Ensures each requirement has coverage and helps spot gaps — a lightweight mapping is enough for most teams
C) Is impossible
D) Is the PM's job

**9.** Testing non-functional aspects (performance, security, accessibility):
A) Is out of scope for feature QA
B) Should be considered per feature — even a quick check for slow responses, obvious security gaps, or accessibility issues adds real value
C) Is only for specialists
D) Is automatic

**10.** When acceptance criteria are ambiguous:
A) Guess and test
B) Clarify with the PM/developer before testing — testing against a guessed interpretation wastes effort and creates disputes
C) Skip the feature
D) Fail everything

**11.** A feature "works" but is confusing to use:
A) Pass it — it works
B) Raise the usability concern; poor UX is a real defect even when functionally correct, though its priority is a team decision
C) Ignore it
D) Fail it silently

**12.** Estimating testing effort:
A) A single number
B) A range that accounts for design, execution, automation, environments, data setup, and re-testing after fixes — with assumptions stated
C) The developer's estimate
D) Zero

---

## Section B — Deeper Test Design (Q13–Q24)

**13.** Pairwise (all-pairs) testing:
A) Tests every combination
B) Covers all pairs of parameter values with far fewer cases than exhaustive combinations — effective because many bugs involve interactions of just two factors
C) Tests pairs of testers
D) Is random

**14.** A truth/decision table with 4 boolean conditions:
A) Needs 4 cases
B) Has up to 16 combinations; a decision table lays them out so none is missed, and collapsing impossible/equivalent rows keeps it manageable
C) Needs 1 case
D) Cannot be built

**15.** Testing a discount rule ("10% off orders over Rp 500k, except sale items"):
A) One valid order
B) Orders just below/at/above the threshold, sale vs. non-sale items, mixed carts, and the interaction of both conditions — a decision-table candidate
C) Only Rp 500k
D) Only sale items

**16.** Boundary testing a date range:
A) Test today only
B) Test the first valid date, the last valid date, one before, one after, plus invalid formats, leap years, and timezone edges
C) Test a random date
D) Dates need no boundary testing

**17.** State transition testing an order lifecycle:
A) Test each state alone
B) Test valid transitions (created→paid→shipped), invalid transitions (shipped→paid), and behavior on repeated or out-of-order events
C) Test only the final state
D) Is unnecessary

**18.** Testing idempotency from the QA side (double-submit, retry):
A) Is a developer concern only
B) Is testable — submit the same action twice (double-click, retry) and verify it does not duplicate the effect (double order, double charge)
C) Is impossible
D) Never matters

**19.** Testing concurrency (two users acting on the same resource):
A) Is out of scope
B) Can reveal serious bugs — two users editing or buying the same item simultaneously; worth testing for shared-resource features
C) Cannot be tested
D) Is automatic

**20.** Testing with realistic data volume:
A) Ten rows is enough always
B) Some bugs only appear at scale (slow lists, pagination errors, timeouts) — test with representative volume for data-heavy features
C) Is the developer's job
D) Never matters

**21.** Localization/internationalization testing:
A) Just check the translation
B) Also test date/number/currency formats, text expansion breaking layout, right-to-left languages, and untranslated strings
C) Is unnecessary
D) Is automatic

**22.** Testing error and empty states:
A) Only the content state matters
B) Loading, empty, error, and no-permission states are all part of the feature and commonly broken — test each
C) Are the developer's job
D) Cannot be tested

**23.** Testing a form's validation:
A) Submit valid data once
B) Test each field's rules, cross-field rules, client vs. server validation, error message clarity, and what happens on submit with errors present
C) Only required fields
D) Only the happy path

**24.** Reusing test cases across features:
A) Is copy-paste sprawl
B) Is good when patterns repeat (login, permissions, pagination) — shared, parameterized cases reduce duplication and maintenance
C) Is forbidden
D) Is impossible

---

## Section C — UI Automation (Q25–Q40)

**25.** A UI automation test at its core:
A) Records mouse movements
B) Programmatically drives the application as a user would (navigate, input, click) and asserts on the resulting state
C) Reads the database
D) Is a manual script

**26.** Stable selectors for automation:
A) Deep CSS paths
B) Dedicated test IDs (`data-testid`) or accessible roles/labels — resilient to styling and structure changes, unlike position- or class-based selectors
C) XPath by index
D) Visible text that changes often

**27.** Selecting by user-visible role and accessible name (e.g., "button named Submit"):
A) Is fragile
B) Is often robust and doubles as an accessibility check — if the test can find it by role/name, so can a screen reader
C) Is impossible
D) Is slower and worse

**28.** The Page Object Model (or similar abstraction):
A) Is over-engineering
B) Encapsulates a page's elements and actions behind a reusable interface, so UI changes are fixed in one place instead of across every test
C) Slows tests
D) Is deprecated

**29.** Hardcoded sleeps (`wait 5s`) in UI tests:
A) Prevent flakiness
B) Are fragile — too short fails on slow runs, too long wastes time; wait for a condition (element visible, network idle) instead
C) Are required
D) Are best practice

**30.** Explicit waits (wait until a condition is true):
A) Are slower than sleeps
B) Are the robust approach — the test proceeds as soon as the condition is met and fails after a sensible timeout if it never is
C) Are the same as sleeps
D) Cause flakiness

**31.** A flaky UI test:
A) Retry until green
B) Must be diagnosed and fixed — common causes are timing, animations, test data leakage, and shared state; flakiness kills trust in the suite
C) Is acceptable
D) Should be deleted silently

**32.** Test independence:
A) Tests should run in a fixed order
B) Each test should set up and tear down its own state so it can run alone or in any order — order-dependent tests are brittle
C) Tests should share state
D) Is impossible

**33.** Test data for automation:
A) Reuse one shared account for everything
B) Create isolated, known data per test (or clean up after), so tests do not collide and results are deterministic
C) Use production data
D) Use random data uncontrolled

**34.** Assertions in a UI test:
A) Are optional
B) Must verify the meaningful outcome (the order appears, the message shows) — a test that navigates but asserts nothing verifies nothing
C) Should check every pixel
D) Slow the test

**35.** Over-asserting (checking dozens of unrelated things in one test):
A) Is thorough
B) Makes tests brittle and failures hard to diagnose — assert what the test is about; separate concerns into separate tests
C) Is required
D) Is faster

**36.** A test that fails:
A) Should be re-run until it passes
B) Should be investigated — is it a real bug, a test bug, or a flaky/environment issue? — because both false positives and false negatives are costly
C) Should be disabled
D) Means the app is broken

**37.** Running UI tests in CI:
A) Is unnecessary
B) Is where they earn value — running automatically on every change catches regressions before merge; local-only tests rot
C) Is impossible
D) Slows developers unacceptably

**38.** Cross-browser automation:
A) Is pointless
B) Extends coverage across the browsers users actually use, catching rendering and behavior differences — run at least critical flows across them
C) Is automatic
D) Is manual only

**39.** Recording-based ("record and playback") test creation:
A) Produces the best tests
B) Is a quick start but tends to produce brittle, hard-to-maintain tests tied to exact UI structure — code-based, abstracted tests are more maintainable
C) Is the only way
D) Is deprecated entirely

**40.** When the UI changes and many tests break:
A) Delete the tests
B) If the change was intentional, update the affected page objects/selectors (ideally in one place); if unintentional, you found a regression — either way, the breakage is information
C) Ignore them
D) Disable CI

---

## Section D — API and Integration Testing (Q41–Q54)

**41.** API testing versus UI testing:
A) API testing is inferior
B) API tests are faster, more stable, and can cover cases hard to reach via UI — a large share of automated coverage should live here rather than in slow UI tests
C) They are the same
D) API testing is developer-only

**42.** Testing an endpoint, you verify:
A) Only the happy path
B) Status code, response body shape and values, error responses for bad input, auth behavior, and edge cases — not just a single valid call
C) Only the status code
D) Only the UI

**43.** Verifying a POST that creates a resource:
A) Check the 200
B) Verify the correct status (e.g., 201), the response body, and that the resource actually exists afterward (via GET or the database)
C) Check nothing
D) Check the UI only

**44.** Testing authentication on an API:
A) Test one valid token
B) Test valid, missing, expired, and invalid tokens, and that protected endpoints reject unauthenticated requests
C) Is the developer's job
D) Is impossible

**45.** Testing authorization on an API:
A) Trust the UI hides things
B) Directly call endpoints as different roles and verify each can only access what it should — authorization bugs are serious and invisible from the UI
C) Only test admins
D) Is unnecessary

**46.** Validating a JSON response:
A) Eyeball it
B) Assert on the fields and values that matter (schema and content), so a backend change that breaks the contract is caught automatically
C) Ignore it
D) Only check it is not empty

**47.** Contract/schema testing:
A) Is pointless
B) Verifies the API's response conforms to an agreed schema, catching breaking changes before they reach clients
C) Is UI testing
D) Replaces all tests

**48.** Testing negative API cases (malformed body, wrong types, missing fields):
A) Is unnecessary
B) Confirms the API rejects bad input with the right status and message rather than crashing or silently accepting it
C) Is the developer's job
D) Cannot be automated

**49.** Data setup for API tests:
A) Depend on data already being there
B) Create needed data via API or fixtures at the start, and clean up after, so tests are isolated and repeatable
C) Use production data
D) Is impossible

**50.** Mocking a third-party dependency in tests:
A) Defeats the purpose
B) Lets you test your system's behavior deterministically when the dependency is external, unstable, or costly — while keeping some real integration coverage elsewhere
C) Is impossible
D) Is always wrong

**51.** Testing rate limiting:
A) Is out of scope
B) Is testable — exceed the limit and verify the correct 429 and Retry-After behavior, and that legitimate use is unaffected
C) Cannot be done
D) Is the developer's job

**52.** Testing pagination via API:
A) Fetch one page
B) Verify first/last/empty pages, page size limits, correct ordering, and that no items are duplicated or skipped across pages
C) Is unnecessary
D) Is UI-only

**53.** Verifying a backend effect via the database:
A) Trust the API response
B) For critical actions, confirm the data actually changed correctly in the database — the response can say success while the stored data is wrong
C) Is the DBA's job
D) Is impossible

**54.** Integration tests versus end-to-end tests:
A) Are the same
B) Integration tests verify a few components together (e.g., API + database); E2E tests verify a full user journey through the whole stack — E2E is more valuable but slower and more brittle
C) E2E is always better
D) Integration is obsolete

---

## Section E — Regression, CI, and Test Maintenance (Q55–Q66)

**55.** A regression suite:
A) Tests only new code
B) Re-verifies existing functionality so new changes do not break what worked — the prime candidate for automation because it runs repeatedly
C) Runs once
D) Is exploratory

**56.** A smoke test suite:
A) Is exhaustive
B) Is a fast check of the most critical paths, run on every build as an early gate before deeper testing
C) Tests security
D) Tests one field

**57.** Running automated tests in CI on every PR:
A) Slows developers pointlessly
B) Catches regressions before merge, keeps the main branch healthy, and gives fast feedback — the core value of automation
C) Is impossible
D) Replaces code review

**58.** A CI run that is red (failing):
A) Merge anyway
B) Blocks merge until understood and fixed — a consistently-ignored red build means the suite has lost its value
C) Should be re-run until green
D) Is normal

**59.** Test suite runtime growing too long:
A) Accept it
B) Is a real problem — parallelize, move coverage down the pyramid, and prune redundant slow tests, so feedback stays fast enough to be used
C) Means adding more machines only
D) Is unavoidable

**60.** Dead or obsolete tests:
A) Keep forever
B) Should be updated or removed — tests for deleted features, or that no longer verify anything, add maintenance cost and noise
C) Never happen
D) Are always valuable

**61.** A test that fails intermittently in CI but passes locally:
A) Is a local problem
B) Is classic flakiness — often timing, parallelism, or shared state; quarantine and fix it rather than ignore it, or trust in CI erodes
C) Should be deleted
D) Is fine

**62.** Test code quality:
A) Does not matter — it is just tests
B) Matters like production code — readable, DRY, well-named tests are maintainable; copy-pasted, cryptic tests rot and get abandoned
C) Should be minimal
D) Is the developer's job

**63.** Reviewing another QA's automation PR:
A) Rubber-stamp
B) Review for correctness, stable selectors, meaningful assertions, independence, and maintainability — test code deserves real review
C) Skip it
D) Only check formatting

**64.** A test that passes but does not actually exercise the feature (e.g., asserts on a hardcoded value):
A) Is fine — it is green
B) Is worse than no test — it provides false confidence; verify tests can actually fail when the behavior breaks
C) Is efficient
D) Should be copied

**65.** Data-driven testing:
A) Is one test with one input
B) Runs the same test logic over many input/expected pairs, giving broad coverage with little duplicated code
C) Is manual only
D) Is impossible

**66.** Version-controlling and reviewing test code with the app:
A) Is unnecessary
B) Keeps tests in sync with the code they verify, enables history and review, and treats tests as the first-class assets they are
C) Is for developers only
D) Slows testing

---

## Section F — Debugging and Investigation (Q67–Q78)

**67.** When a test fails, the first question is:
A) Which test do I disable?
B) Is this a real product bug, a test bug, or an environment/flaky issue? — the answer determines the fix
C) Who do I blame?
D) Can I re-run it?

**68.** Reading logs to investigate a failure:
A) Is developer-only
B) Is a core QA skill — application, server, and console logs often show the actual error behind a symptom
C) Is impossible
D) Wastes time

**69.** Isolating an intermittent bug:
A) Give up if it does not reproduce first try
B) Vary conditions systematically (data, timing, sequence, environment) and gather evidence — intermittent bugs are real and often the most serious
C) Close it
D) Is impossible

**70.** A bug that only reproduces with specific data:
A) Is not a real bug
B) Points to a data-dependent defect — capture the exact data and conditions; these are valuable, hard-to-find bugs
C) Should be ignored
D) Is the tester's fault

**71.** Bisecting to find which change introduced a bug:
A) Is a developer-only technique
B) Is useful for QA too — narrowing down which build or change introduced a regression speeds diagnosis
C) Is impossible
D) Requires production

**72.** Using the network tab to localize a bug:
A) Is pointless
B) Shows whether the request was made, what was sent, the status, and the response — pinpointing frontend vs. backend vs. network
C) Is developer-only
D) Runs the server

**73.** A "cannot reproduce" from a developer:
A) Means the bug is invalid
B) Usually means a condition is missing from the report — add exact steps, data, environment, and video, or pair to reproduce together
C) Should be argued
D) Ends the investigation

**74.** Reproducing across environments:
A) Is unnecessary
B) A bug on staging but not dev (or vice versa) is information about config, data, or version differences — investigate the difference
C) Means the test is wrong
D) Is impossible

**75.** Capturing evidence during investigation:
A) Is optional
B) Screenshots, videos, logs, network traces, and exact timestamps make a bug reproducible and fixable — capture as you go
C) Slows testing
D) Is the developer's job

**76.** When your automation reports a failure that is not a real bug:
A) Ignore all failures thereafter
B) Fix the test — false alarms train people to ignore the suite, which then misses real failures
C) Delete the suite
D) Is acceptable

**77.** A performance issue noticed during functional testing:
A) Out of scope, ignore it
B) Worth flagging — a page that takes 10 seconds is a defect users feel, even if it eventually "works"
C) Only load-test teams care
D) Is not a bug

**78.** Root-causing versus symptom-reporting:
A) Always root-cause fully (that is dev's job)
B) Report the symptom clearly with evidence; investigating toward a likely cause helps, but QA need not (and often cannot) fully root-cause — the goal is an actionable, reproducible report
C) Never investigate
D) Guess the cause confidently

---

## Section G — Collaboration and Process (Q79–Q90)

**79.** QA in sprint/iteration planning:
A) Is unnecessary
B) Should be present — estimating test effort, raising testability concerns, and flagging risky items early prevents end-of-sprint crunches
C) Is the PM's job
D) Slows planning

**80.** "Testable" requirements:
A) Are the PM's concern only
B) Are ones with clear, verifiable acceptance criteria; QA improves quality by pushing vague requirements toward testability early
C) Do not matter
D) Are automatic

**81.** A developer asks QA to test something with no acceptance criteria:
A) Test whatever seems right
B) Clarify what "correct" means first — testing against assumptions produces disputes and missed cases
C) Refuse
D) Pass it

**82.** When QA becomes a bottleneck at the end of the sprint:
A) Work weekends
B) Address the root cause — test earlier (shift left), automate regression, and involve QA from the start rather than piling testing at the end
C) Lower the bar
D) Skip testing

**83.** Whole-team ownership of quality:
A) Means QA is not needed
B) Means quality is everyone's responsibility — developers test their own work, QA amplifies and specializes, and the team shares the goal
C) Means developers do not test
D) Means QA does everything

**84.** A found bug that the team decides not to fix now:
A) Means QA failed
B) Is a legitimate business decision — QA provides the information (severity, impact, risk); the team prioritizes; document it and move on
C) Should be fixed regardless
D) Should be hidden

**85.** Reporting quality status to the team:
A) "It's fine" or "it's broken"
B) A clear picture — what was tested, what passed, known issues and their risk, and what was not covered — so the team can decide with real information
C) Only bug counts
D) Is the PM's job

**86.** Bug counts as a quality metric:
A) Are the definitive measure
B) Are a weak proxy — they can be gamed and lack context; trends, escaped defects, and risk coverage are more meaningful
C) Should drive bonuses
D) Are irrelevant

**87.** Testing someone else's fix for your bug:
A) Trust it is fixed
B) Verify the fix actually resolves the reported issue, and check that it did not break anything nearby (targeted regression) before closing
C) Close on the developer's word
D) Reopen automatically

**88.** Pairing with a developer to reproduce or fix a bug:
A) Wastes both people's time
B) Is often the fastest path for tricky bugs — shared context resolves "cannot reproduce" and speeds the fix
C) Is QA overreach
D) Is forbidden

**89.** Advocating for the user:
A) Is the designer's job
B) Is central to QA — asking "how will a real user experience this?" surfaces issues specs and code miss
C) Is out of scope
D) Slows delivery

**90.** Saying "this is not ready to ship" when it is not:
A) Is not QA's place
B) Is exactly QA's role — provide the honest risk picture; the decision is the team's, but the information must be truthful
C) Is insubordination
D) Requires proof of zero bugs

---

## Section H — Habits and Growth (Q91–Q100)

**91.** Learning a scripting/programming language as a manual tester:
A) Is unnecessary
B) Is the path to growth on a blended team — automation skill multiplies your reach and is essential to advancing past Junior 2
C) Replaces testing skill
D) Is the developer's job

**92.** Keeping manual testing skill sharp while learning automation:
A) Is pointless once you automate
B) Remains essential — exploratory testing, usability judgment, and finding the unexpected are things automation cannot do
C) Is a waste
D) Is automatic

**93.** Copy-pasting automation code you do not understand:
A) Is fine if green
B) Is risky — you cannot maintain or trust it, and it may assert nothing meaningful
C) Is required
D) Is encouraged

**94.** Saying "I do not know, let me verify":
A) Damages credibility
B) Builds it — QA exists to verify, not to assume; checking is the job
C) Is for seniors
D) Should be hidden

**95.** A test you wrote that keeps flaking:
A) Retry it in CI
B) Owns your attention until fixed or quarantined — leaving it flaky degrades the whole team's trust in the suite
C) Is acceptable
D) Should be someone else's problem

**96.** Documenting the testing approach for a feature:
A) Is a waste
B) Helps the next tester (often you) and makes coverage visible — lightweight notes on what and how you tested pay off
C) Is the PM's job
D) Is automatic

**97.** When you miss a bug that escapes to production:
A) Blame the developer
B) Treat it as process input — what case, check, or automation would have caught it — and improve, without blame
C) Hide it
D) Quit

**98.** Mentoring a QA intern:
A) Too early for you
B) Is part of growing to Junior 2 — teaching test design, bug reporting, and basic automation multiplies the team
C) Is the lead's job only
D) Wastes time

**99.** Owning a feature's testing end-to-end:
A) Means running the given test cases
B) Means understanding it, designing the approach, executing manual and automated coverage, verifying across layers, reporting clearly, and confirming fixes
C) Means automation only
D) Means the happy path

**100.** The most reliable predictor of growth past Junior 2 is:
A) Speed
B) A blend of sharpening test thinking and steadily building automation skill — while keeping the curious, user-focused, skeptical mindset that makes a tester valuable
C) Never finding bugs
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
