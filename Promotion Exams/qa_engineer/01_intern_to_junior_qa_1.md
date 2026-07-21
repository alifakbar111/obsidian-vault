# Promotion Exam: Intern → Junior QA Test Engineer 1

**Track:** QA Test Engineer (Specialist — blended manual + automation)
**Format:** 100 multiple-choice questions
**Time:** 120 minutes
**Passing score:** 89 / 100

**Scope.** This exam evaluates whether an intern is ready to be hired as a Junior QA Test Engineer 1. This company's QA engineers do both manual and automation work, so the track blends the two — but a new QA hire earns trust first by testing well, so this exam leans toward testing fundamentals, with light scripting and tooling awareness layered in. The bar is: "can be trusted to test a small, scoped feature thoroughly, write a clear reproducible bug report, and begin contributing to automated checks under supervision."

**A note on the blend.** Roughly two-thirds of this exam is testing craft — how to think about what could go wrong, design cases, explore, and report — and one-third is the technical foundation (basic programming, HTML/DOM/selectors, HTTP, SQL, Git) that automation is built on. As the ladder climbs, the automation share grows.

---

## Section A — What Testing Is For (Q1–Q12)

**1.** The primary purpose of testing is:
A) To prove the software is bug-free
B) To provide information about quality and risk so the team can make informed decisions — you cannot prove the absence of all bugs
C) To slow down releases
D) To blame developers

**2.** "Quality" in software is best understood as:
A) The absence of any defect
B) Value to the people who matter — does it do what users need, reliably, safely — which is broader than "no bugs"
C) Passing all tests
D) A pretty UI

**3.** A tester who finds many bugs is:
A) Being difficult
B) Doing their job — finding problems before users do is the value QA adds; the goal is served by surfacing risk, not by everything passing
C) Slowing the team
D) Replacing developers

**4.** QA's relationship with developers is healthiest as:
A) Adversarial — catch them out
B) Collaborative — a shared goal of shipping quality, with QA providing information and developers fixing issues, without blame
C) QA reports to no one
D) QA writes the code

**5.** "You cannot test everything" means:
A) Give up on coverage
B) The input space is effectively infinite, so testing is about prioritizing the highest-risk, highest-value areas intelligently — not exhaustively
C) Only test the happy path
D) Testing is pointless

**6.** Verification versus validation:
A) Are the same
B) Verification asks "did we build it right (to spec)?"; validation asks "did we build the right thing (for the user)?" — both matter
C) Verification is for developers
D) Validation is automated

**7.** The cost of a bug found in production versus in development:
A) Is the same
B) Is generally much higher in production — user impact, emergency fixes, reputation — which is why finding bugs early has leverage
C) Is lower in production
D) Does not matter

**8.** A tester's most valuable trait is:
A) Speed
B) Curiosity and a skeptical "what could go wrong here?" mindset — combined with empathy for the user
C) Knowing every tool
D) Never asking questions

**9.** "Happy path" testing alone:
A) Is sufficient
B) Misses where most bugs live — invalid input, edge cases, error conditions, and unexpected sequences deserve at least as much attention
C) Is the hardest testing
D) Is all users do

**10.** When a feature "works on my machine" but a tester finds it broken:
A) The tester is wrong
B) The difference is information — environment, data, sequence, or config differs; investigating the difference is the point
C) Ignore it
D) Close the bug

**11.** Testing early (as a feature is built, not just at the end):
A) Wastes time
B) Catches issues when they are cheapest to fix and shapes better requirements — "shift left" is the practice of testing earlier
C) Is impossible
D) Is the developer's job

**12.** A test that always passes and never could fail:
A) Is a great test
B) Provides false confidence — a test that cannot fail tests nothing; tests must be able to catch the thing they claim to check
C) Is efficient
D) Should be copied

---

## Section B — Test Design Techniques (Q13–Q28)

**13.** A test case should contain, at minimum:
A) A title
B) Preconditions, steps, test data, and a clear expected result — so anyone can run it and judge pass/fail unambiguously
C) A screenshot
D) The developer's name

**14.** Equivalence partitioning:
A) Tests every possible value
B) Groups inputs into classes expected to behave the same, then tests one representative per class — reducing cases without losing meaningful coverage
C) Is for performance
D) Is random testing

**15.** Boundary value analysis:
A) Tests the middle of ranges
B) Tests at and around boundaries (min, max, just inside, just outside) because bugs cluster at edges — for a 1–100 field, test 0, 1, 100, 101
C) Is the same as equivalence partitioning exactly
D) Is unnecessary

**16.** For an age field accepting 18–65, strong boundary cases include:
A) 40 only
B) 17, 18, 65, 66 (and often the empty and non-numeric cases)
C) 30 and 50
D) Only 18

**17.** A decision table is useful when:
A) There is one input
B) Behavior depends on combinations of conditions — it lays out each combination and its expected outcome so none are missed
C) Testing performance
D) There are no rules

**18.** State transition testing:
A) Tests one screen
B) Verifies a system that moves between states (e.g., order: created → paid → shipped) behaves correctly on valid transitions and rejects invalid ones
C) Is for databases
D) Is random

**19.** Negative testing:
A) Is pessimistic
B) Deliberately supplies invalid, unexpected, or malicious input to confirm the system handles it gracefully rather than crashing or misbehaving
C) Is testing you expect to fail
D) Is discouraged

**20.** Testing error handling:
A) Is unnecessary if the happy path works
B) Is essential — how the system behaves when things go wrong (bad input, network failure, timeout) is often where the worst user experiences hide
C) Is the developer's job
D) Cannot be tested

**21.** Combinatorial explosion (too many input combinations to test all):
A) Means test everything anyway
B) Is managed with techniques like pairwise testing, which covers all pairs of values with far fewer cases than all combinations
C) Means test nothing
D) Is impossible to manage

**22.** A good test case is:
A) Vague, to allow flexibility
B) Specific, repeatable, and independent — clear enough that different testers get the same result, and not dependent on another test running first
C) Long and complex
D) Undocumented

**23.** Testing a search feature, a strong set of cases includes:
A) One valid search
B) Valid terms, no results, special characters, very long input, empty input, leading/trailing spaces, case sensitivity, and injection-like input
C) Only the exact expected term
D) Random words only

**24.** Risk-based testing:
A) Tests everything equally
B) Prioritizes testing effort toward the areas of highest risk (likelihood × impact) — critical flows, complex code, recently changed areas
C) Is gambling
D) Skips important features

**25.** Testing a file upload feature, you should include:
A) One valid file
B) Valid files, oversized files, wrong file types, empty files, zero-byte files, corrupt files, and files with unusual names — plus what happens mid-upload on a network drop
C) Only images
D) Only the maximum size

**26.** "Test data" quality matters because:
A) It does not
B) Realistic, varied, and edge-case data catches bugs that trivial "test123" data hides — and sensitive real data should never be used casually
C) Any data works
D) Only production data works

**27.** Testing with different user roles/permissions:
A) Is unnecessary
B) Is important — features often behave differently by role, and authorization bugs (a user seeing what they should not) are serious
C) Is the developer's job
D) Only admins matter

**28.** A checklist versus a scripted test case:
A) Are the same
B) A checklist is lighter-weight (things to verify) and good for exploratory or repetitive checks; a scripted case is detailed and repeatable — each fits different needs
C) Checklists are always better
D) Scripts are obsolete

---

## Section C — Exploratory and Manual Testing (Q29–Q40)

**29.** Exploratory testing:
A) Is unstructured random clicking
B) Is simultaneous learning, test design, and execution — the tester explores with intent, using their judgment to follow risk, often within a time-boxed "session"
C) Is inferior to scripted testing always
D) Requires no thought

**30.** A session-based exploratory testing charter:
A) Is a full script
B) Is a brief mission for a time-boxed session ("explore checkout with invalid payment data to find failures") that focuses exploration while leaving room for discovery
C) Is a bug report
D) Is a test plan

**31.** Exploratory testing is especially valuable for:
A) Regression only
B) Finding the unexpected — usability issues, surprising interactions, and bugs no one wrote a case for — that scripted tests by definition do not look for
C) Replacing all scripted tests
D) Load testing

**32.** While exploring, a tester notices something odd but unrelated to their charter. They should:
A) Ignore it
B) Note it (and file it if it is a real issue) — valuable bugs are often found off to the side; then return to the charter
C) Abandon the charter
D) Delete it

**33.** "Following the smell" in exploratory testing means:
A) Guessing randomly
B) Noticing something that feels off — a slow response, an odd message, an inconsistency — and investigating it, because instincts often point to real problems
C) Testing hardware
D) Ignoring intuition

**34.** The oracle problem in testing is:
A) A database issue
B) The challenge of knowing what the *correct* result should be — testers use specs, comparable products, consistency, and user expectations as "oracles" to judge pass/fail
C) About Oracle Corporation
D) Solved by automation

**35.** Testing usability (not just correctness):
A) Is not QA's concern
B) Is part of quality — confusing flows, unclear errors, and poor feedback are real defects even when the code is "correct"
C) Is only the designer's job
D) Cannot be tested

**36.** Cross-browser / cross-device testing:
A) Is unnecessary — code is code
B) Matters because rendering, behavior, and capabilities differ across browsers, devices, OS versions, and screen sizes
C) Is only for mobile
D) Is automated away entirely

**37.** Testing accessibility (screen readers, keyboard navigation, contrast):
A) Is niche and optional
B) Is part of quality — many users depend on it, and it is increasingly a legal and store requirement; QA should include it
C) Is automatic
D) Is the developer's sole job

**38.** Ad hoc testing versus exploratory testing:
A) Are identical
B) Ad hoc is informal and undocumented; exploratory is intentional and often charter- and note-driven — exploratory is a discipline, not just "poking around"
C) Ad hoc is better
D) Exploratory is random

**39.** Note-taking during manual testing:
A) Is a waste of time
B) Records what was tested, what was found, and how to reproduce it — essential for reporting and for others to trust the coverage
C) Slows testing too much
D) Is only for automation

**40.** When a manual test passes but the tester feels unsure:
A) Mark it passed and move on
B) Investigate the unease — a passing result with a nagging doubt often precedes a real bug; dig before signing off
C) Ignore the feeling
D) Fail it without reason

---

## Section D — Bug Reporting (Q41–Q52)

**41.** A good bug report includes:
A) "It's broken"
B) A clear title, steps to reproduce, expected result, actual result, environment (browser/OS/version/build), and evidence (screenshot/video/logs)
C) Just a screenshot
D) The developer to blame

**42.** The single most important part of a bug report is:
A) The severity
B) Reliable steps to reproduce — a bug that cannot be reproduced is very hard to fix
C) The color of the button
D) The reporter's name

**43.** A bug title should be:
A) Vague
B) A concise, specific summary of the problem ("Checkout button disabled after applying valid coupon") — scannable in a list
C) The full description
D) A question

**44.** "Expected versus actual" in a report:
A) Is optional
B) Is essential — it states what should have happened and what did, making the defect unambiguous even to someone unfamiliar with the feature
C) Is the same thing
D) Is for the tester only

**45.** Severity versus priority:
A) Are the same
B) Severity is the technical impact of the bug; priority is how urgently it should be fixed — a low-severity bug on the homepage logo may be high priority; a high-severity crash in an unused feature may be low priority
C) Severity is set by developers only
D) Priority is irrelevant

**46.** A bug you cannot reproduce consistently:
A) Should not be reported
B) Should be reported with all available context (how often, under what conditions, any logs), flagged as intermittent — intermittent bugs are real and often serious
C) Is not a bug
D) Should be closed

**47.** Reporting ten variations of the same underlying bug:
A) Is thorough
B) Is noise — identify the root pattern and report it once with examples, rather than flooding the tracker with duplicates
C) Is required
D) Helps developers

**48.** A duplicate bug:
A) Should be re-reported to be safe
B) Should be linked to the existing report rather than created anew — search before filing
C) Should be ignored
D) Means the first was wrong

**49.** Emotional or blaming language in a bug report ("this is obviously broken, who wrote this?"):
A) Motivates fixes
B) Damages collaboration and credibility — report facts neutrally; the bug, not the person, is the subject
C) Is professional
D) Is required for severity

**50.** Attaching logs, network traces, or console output to a bug:
A) Is overkill
B) Dramatically speeds diagnosis — the more relevant evidence, the faster the fix
C) Is the developer's job to gather
D) Is unnecessary

**51.** When a developer marks your bug "cannot reproduce":
A) Argue
B) Add more detail — exact steps, environment, data, video — and pair with them if needed; the gap is usually a missing condition, not a wrong report
C) Reopen repeatedly without changes
D) Give up

**52.** A bug report's audience is:
A) Only you
B) The developer who will fix it and anyone triaging — write so they can understand and act without having to ask you
C) Management only
D) The customer

---

## Section E — Programming and Automation Foundations (Q53–Q66)

**53.** A variable in a script:
A) Is a fixed value
B) Is a named container for a value that can be read and (unless constant) changed — the basic building block of any automated test
C) Is a function
D) Is a comment

**54.** A conditional (`if/else`):
A) Loops
B) Runs different code based on whether a condition is true — used in tests to assert and branch
C) Declares a variable
D) Is a comment

**55.** A loop (`for`/`while`):
A) Runs code once
B) Repeats code — useful for iterating over data sets or repeating checks in automation
C) Is a conditional
D) Is a function

**56.** A function:
A) Is a variable
B) Is a reusable, named block of code that can take inputs and return a result — automation uses functions to avoid repetition (e.g., a reusable "login" helper)
C) Is a loop
D) Is a comment

**57.** An assertion in a test:
A) Prints a value
B) Checks that a condition holds (expected equals actual); if it fails, the test fails — the core of an automated check
C) Is a comment
D) Loops

**58.** A test that has no assertions:
A) Is a strong test
B) Verifies nothing — it may run code but cannot fail meaningfully; every automated test needs at least one meaningful assertion
C) Is faster
D) Is preferred

**59.** Reading an error/stack trace:
A) Is for developers only
B) Is a core QA skill — it usually points to what failed and where, which sharpens both bug reports and automation debugging
C) Is impossible
D) Wastes time

**60.** Test automation is best applied to:
A) Everything, replacing manual testing
B) Repetitive, stable, high-value checks (regression, smoke tests, data-driven cases) — freeing humans for exploratory and judgment-heavy testing
C) One-off exploratory sessions
D) Nothing

**61.** Automation does NOT replace manual testing because:
A) It is too slow
B) Automation checks what you told it to; it cannot notice the unexpected, judge usability, or explore — humans and automation cover different things
C) It is too expensive
D) It always fails

**62.** A "flaky" automated test:
A) Is acceptable
B) Passes sometimes and fails sometimes without a code change — usually timing or environment issues; flakiness erodes trust in the whole suite and must be fixed, not ignored
C) Should be re-run until green
D) Is a good test

**63.** Hardcoding a wait ("sleep 5 seconds") in a UI test:
A) Is best practice
B) Is fragile and slow — it either wastes time or is still too short on a slow run; wait for a condition (element visible, request complete) instead
C) Is required
D) Prevents flakiness

**64.** A locator/selector in UI automation:
A) Is a password
B) Identifies an element on the page for the test to interact with; stable selectors (test IDs, roles) are far less brittle than ones tied to styling or position
C) Is a URL
D) Is a variable name

**65.** Selecting elements by fragile means (deep CSS paths, index positions, visible text that changes):
A) Is robust
B) Breaks easily when the UI changes; prefer stable hooks like dedicated test IDs or accessible roles
C) Is required
D) Is faster forever

**66.** Version control (Git) for test code:
A) Is unnecessary — tests are not real code
B) Is essential — automated tests are code, and belong under version control with reviews, history, and branching like any code
C) Is for developers only
D) Slows testing

---

## Section F — Web, HTTP, and Data Basics for QA (Q67–Q82)

**67.** The DOM (Document Object Model):
A) Is a database
B) Is the browser's live, structured representation of the page — automation and inspection tools locate and interact with elements through it
C) Is a server
D) Is CSS

**68.** Browser DevTools are useful to QA for:
A) Nothing
B) Inspecting elements, watching network requests and responses, reading console errors, and diagnosing whether a bug is frontend, network, or backend
C) Writing code only
D) Running the server

**69.** An HTTP request has:
A) Only a URL
B) A method (GET/POST/etc.), a URL, headers, and often a body — QA inspecting requests can pinpoint where a failure occurs
C) Only a body
D) Only headers

**70.** A 200 versus 400 versus 500 status:
A) All mean success
B) 200 = success; 4xx = client-side problem (bad request, unauthorized, not found); 5xx = server-side error — knowing these localizes a bug fast
C) All mean failure
D) Are interchangeable

**71.** A bug where the UI shows an error but the network tab shows a 200:
A) Is impossible
B) Localizes the problem to the frontend handling a successful response incorrectly — powerful information for the bug report
C) Means the server failed
D) Means the test is wrong

**72.** API testing (testing endpoints directly, without the UI):
A) Is impossible for QA
B) Is faster, more stable, and can cover cases hard to reach through the UI — a core QA skill as automation grows
C) Replaces all UI testing
D) Is only for developers

**73.** Sending a request with a tool like Postman or curl:
A) Is a developer-only activity
B) Lets QA test API behavior directly — valid and invalid inputs, auth, status codes, and response shape — independent of the UI
C) Is unsafe
D) Requires production access

**74.** JSON:
A) Is a programming language
B) Is a common data format for API requests and responses; QA reads it to verify the response contains the right fields and values
C) Is a database
D) Is HTML

**75.** A basic SQL SELECT:
A) Is beyond QA
B) Lets QA verify that an action actually changed the data as expected — checking the database is often the only way to confirm a backend effect
C) Deletes data
D) Is only for DBAs

**76.** Running an UPDATE or DELETE against a shared test database carelessly:
A) Is fine
B) Can corrupt data other testers depend on — QA should understand read vs. write and be careful (or read-only) on shared environments
C) Is required
D) Has no consequences

**77.** Checking data in the database after a UI action:
A) Is redundant
B) Confirms the action had the correct backend effect — the UI can show success while the data is wrong, and vice versa
C) Is the developer's job
D) Is impossible

**78.** Test environments (dev, staging, production):
A) Are all the same
B) Serve different purposes — QA typically tests on staging (production-like), and testing on production is done carefully, if at all, to avoid affecting real users and data
C) QA tests only on production
D) Do not matter

**79.** Testing against production data:
A) Is ideal
B) Is risky and often prohibited — real user data is sensitive; use anonymized or synthetic data on test environments
C) Is required
D) Has no privacy implications

**80.** A "build" or "version" a bug was found on:
A) Is irrelevant to the report
B) Is essential context — a bug may be fixed in a newer build, or specific to one; always record which build was tested
C) Is the same everywhere
D) Is automatic

**81.** Caching causing a bug to appear or disappear:
A) Never happens
B) Is common — a hard refresh or cache clear can change behavior; QA should be aware and note it, as it affects reproduction
C) Means the test is wrong
D) Is a server bug always

**82.** Cookies, sessions, and login state affecting tests:
A) Do not matter
B) Are common sources of "works when logged in a certain way" behavior — QA should control and note the auth/session state of a test
C) Are automatic
D) Are developer-only

---

## Section G — Process and Collaboration (Q83–Q92)

**83.** QA's involvement in the development process should start:
A) After the code is written
B) At requirements/design — asking "how will we test this?" and "what could go wrong?" early prevents defects and surfaces ambiguity
C) At release only
D) Never

**84.** Reviewing requirements or acceptance criteria as QA:
A) Is not QA's job
B) Is valuable — vague or contradictory requirements are defects in themselves, and QA is often first to notice them by asking testing questions
C) Slows the team
D) Is the PM's job only

**85.** "Acceptance criteria":
A) Are decorative
B) Define what "done" means for a feature — QA tests against them, and unclear criteria should be clarified before testing begins
C) Are the developer's private notes
D) Are irrelevant to QA

**86.** A definition of done that includes testing:
A) Slows delivery
B) Ensures work is not called "done" until it is verified — testing, not just coding, is part of completion
C) Is unnecessary
D) Is QA overreach

**87.** When QA and a developer disagree on whether something is a bug:
A) QA always wins
B) They resolve it against the requirements and user expectations, escalating to the PM/owner if genuinely unclear — the spec and the user, not ego, decide
C) The developer always wins
D) It is dropped

**88.** Regression testing:
A) Tests only new features
B) Re-tests existing functionality to confirm that new changes did not break what already worked — a core, repetitive activity well-suited to automation
C) Is done once
D) Is exploratory

**89.** Smoke testing:
A) Is exhaustive
B) Is a quick check that the most critical paths work at all after a build — a gate before deeper testing, often automated
C) Is a security test
D) Tests one field

**90.** Sign-off / release readiness from QA:
A) Means "zero bugs"
B) Means QA has provided a clear picture of quality and known risks so the team can decide to ship — it is information, not a guarantee of perfection
C) Is a legal document
D) Is the developer's call

**91.** Estimating testing effort as a junior:
A) Promise the smallest number
B) Think through what needs testing (cases, environments, data, exploration) and give a range, flagging uncertainty
C) Refuse
D) Match the developer's estimate

**92.** When you run out of your assigned testing early:
A) Wait
B) Explore adjacent areas, deepen edge-case coverage, improve test documentation, or help automate a repetitive check
C) Mark everything passed
D) Stop working

---

## Section H — Habits and Mindset (Q93–Q100)

**93.** Time-boxing when stuck (e.g., 30–60 minutes before asking):
A) Is weakness
B) Is a healthy default — try seriously, then ask with what you tried and observed
C) Must be four hours
D) Is for seniors

**94.** Assuming a feature works because it looks right:
A) Is efficient
B) Is a trap — QA verifies rather than assumes; "looks right" is not "is right"
C) Is best practice
D) Saves time correctly

**95.** Copy-pasting an automated test without understanding it:
A) Is fine if it passes
B) Is risky — you cannot maintain or trust what you do not understand, and it may not actually verify anything
C) Is required for speed
D) Is encouraged

**96.** Saying "I do not know, let me check":
A) Damages credibility
B) Builds it — guessing about whether something works defeats the purpose of QA; verifying is the job
C) Is for seniors
D) Should be avoided

**97.** A tester who signs off on untested areas to meet a deadline:
A) Is a team player
B) Is undermining the entire value of QA — be honest about what was and was not tested, and let the team decide with real information
C) Is efficient
D) Is expected

**98.** Learning the product deeply (how users actually use it):
A) Is the PM's job
B) Makes a tester far more effective — understanding real usage reveals the risks and edge cases that matter
C) Is unnecessary
D) Slows testing

**99.** When you miss a bug that reaches production:
A) Hide it
B) Treat it as a learning input — how did it slip through, what case or check would have caught it — without blame, and improve the process
C) Blame the developer
D) Quit

**100.** The most reliable predictor of growth for a junior QA engineer is:
A) Speed of clicking through cases
B) A curious, skeptical, user-focused mindset paired with growing technical skill — caring about what could go wrong and steadily learning to automate the repetitive parts
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
