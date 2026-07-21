# Promotion Exam 03 — Junior Engineer 2 → Junior Engineer 3

**Format:** 100 multiple-choice questions, one correct answer each.
**Time limit (suggested):** 120 minutes.
**Passing score:** 89 / 100.
**Scope:** Solid mid-level fundamentals — deeper React patterns, authentication and authorization, database design and indexes, error handling, accessibility, performance basics, deeper testing, basic CI/CD, code review judgment. The bar here is "owns a medium-sized feature end-to-end and rarely surprises reviewers."

---

## Section A — Deeper React and Frontend Patterns (Q1–Q20)

**Q1.** When does a React component re-render?
A) Only when props change
B) When state changes, props change, the parent re-renders, or context it consumes changes
C) Only on user interaction
D) Every 16 ms automatically

**Q2.** Which of these is the most common cause of unnecessary re-renders?
A) Using `useState`
B) Passing a new inline object or arrow function as a prop on every render to a memoized child
C) Using `useEffect`
D) Using TypeScript

**Q3.** What does `React.memo` do?
A) Memoizes a function value
B) Skips re-rendering a component if its props are shallowly equal to the previous render
C) Caches network requests
D) Replaces `useState`

**Q4.** Which of these is the correct mental model for `useEffect`?
A) Runs synchronously before render
B) Synchronizes a component with an external system; runs after commit
C) Runs only once per app lifetime
D) Always runs before `useState` updates

**Q5.** Which hook is most appropriate for reading values from a parent provider?
A) `useState`
B) `useReducer`
C) `useContext`
D) `useRef`

**Q6.** When should you reach for `useReducer` over `useState`?
A) Never; they are equivalent
B) When state transitions are complex or multiple sub-values change together based on actions
C) Only when state is a string
D) Only inside class components

**Q7.** What is "prop drilling"?
A) A performance optimization
B) Passing props through many intermediate components that do not use them, just to reach a deeply nested child
C) A TypeScript feature
D) A React Router pattern

**Q8.** Which of these is a *reasonable* fix for prop drilling?
A) Use `localStorage` everywhere
B) Lift state up and/or introduce a context or state library where appropriate
C) Use global `window` variables
D) Use deeper nesting

**Q9.** Which of the following is *true* about React keys in lists?
A) Index is always the best key
B) Keys should be stable, unique within siblings, and ideally tied to the item's identity (not its position)
C) Keys are optional and have no effect
D) Keys must be numeric

**Q10.** What is the *main* purpose of `useCallback`?
A) To cache the *result* of a function
B) To return a memoized callback reference that is stable between renders unless dependencies change
C) To run a callback on mount
D) To debounce a function

**Q11.** When is `useMemo` actually worth it?
A) Everywhere by default
B) When the computation is expensive *or* the referential identity of the result matters for downstream memoization
C) Only inside `useEffect`
D) Only when used with TypeScript

**Q12.** Which is a valid reason to use a ref instead of state?
A) You need to trigger re-renders on change
B) You need a mutable value that should *not* trigger re-renders, or a handle to a DOM node
C) You want to persist the value to disk
D) You want to share it across components

**Q13.** Which of these correctly types a React component's props in TypeScript?
A) `function Button(props: { label: string }) { ... }`
B) `function Button(props: any) { ... }`
C) `function Button(props): React.FC { ... }`
D) `function Button(label: string) { ... }`

**Q14.** What is the most accessible way to make a `<div>` behave like a button?
A) Add `onClick`
B) Use a real `<button>` element instead — semantics are part of accessibility
C) Add `role="div"`
D) Add `tabindex="-1"`

**Q15.** Which ARIA attribute indicates the *current* selected item in a tab list?
A) `aria-current`
B) `aria-selected`
C) `aria-checked`
D) `aria-active`

**Q16.** Which of these is the *best* practice for image accessibility?
A) Always set `alt=""` for everything
B) Provide meaningful `alt` text for content images, and `alt=""` (empty) for purely decorative ones
C) Skip `alt` to reduce DOM size
D) Use `title` instead of `alt`

**Q17.** What is the "FLIP" technique used for?
A) Animating layout changes smoothly by measuring First and Last positions, then Inverting and Playing the transition
B) Flipping arrays
C) A type of CSS grid layout
D) A network protocol

**Q18.** Which CSS approach gives you a responsive layout that adapts to the container's size (not the viewport)?
A) Media queries
B) Container queries
C) `vh`/`vw` units
D) Flexbox alone

**Q19.** Which is the most reliable way to detect when a UI element should be rendered (e.g., for infinite scroll)?
A) `scroll` event with manual math
B) `IntersectionObserver`
C) `setTimeout`
D) `requestAnimationFrame`

**Q20.** Which of these is true about CSS specificity?
A) Inline styles always lose to classes
B) ID selectors are more specific than class selectors, which are more specific than tag selectors
C) `!important` is never needed and never recommended in any circumstance
D) Specificity does not exist in modern CSS

---

## Section B — Backend, APIs, Auth, and Errors (Q21–Q40)

**Q21.** What is the difference between *authentication* and *authorization*?
A) They are the same
B) Authentication is "who are you?"; authorization is "what are you allowed to do?"
C) Authorization happens before authentication
D) Authentication is only for admins

**Q22.** Which of these is *not* a common authentication scheme?
A) Session cookies
B) JWT (JSON Web Tokens)
C) OAuth 2.0
D) `localStorage` of plaintext password

**Q23.** Where is the *safest* place to store a session token in a browser app?
A) `localStorage`
B) `sessionStorage`
C) An `HttpOnly`, `Secure`, `SameSite` cookie set by the server
D) A global JavaScript variable

**Q24.** Why is storing a JWT in `localStorage` considered risky?
A) `localStorage` is slow
B) It is accessible to any JavaScript on the page, making it exfiltrable via XSS
C) `localStorage` is not supported by browsers
D) It is too small

**Q25.** What does the `exp` claim mean in a JWT?
A) Experience points
B) Expiration time after which the token is no longer valid
C) Encryption parameter
D) Extra payload

**Q26.** What is OAuth 2.0 *primarily* designed for?
A) Encrypting passwords
B) Delegated authorization — letting users grant third parties limited access to their resources
C) Authenticating end users by itself
D) Storing tokens

**Q27.** What is OpenID Connect?
A) A database
B) An authentication layer built on top of OAuth 2.0
C) A replacement for HTTPS
D) A type of cookie

**Q28.** Which of these is the *best* way to hash passwords on a server?
A) MD5
B) SHA-1
C) A purpose-built password hash like bcrypt, scrypt, or Argon2 with a salt and a sensible work factor
D) Plain SHA-256 with no salt

**Q29.** What does a "salt" prevent in password hashing?
A) Memory leaks
B) Precomputed rainbow-table attacks and identical hashes for users who chose the same password
C) Timing attacks
D) SQL injection

**Q30.** Which of these is the strongest sign that an API endpoint is *not* idempotent?
A) It uses `GET`
B) Repeating the same call creates a new resource each time (e.g., creating an order)
C) It returns 200
D) It uses JSON

**Q31.** Which HTTP status code is most appropriate for "this user is logged in but not allowed to do this"?
A) 401
B) 403
C) 404
D) 422

**Q32.** Which is appropriate for "the request is well-formed but the data fails business validation"?
A) 400
B) 401
C) 403
D) 422

**Q33.** Which is appropriate for "we hit our rate limit"?
A) 408
B) 429
C) 503
D) 504

**Q34.** Which is appropriate for "an internal server error that the client cannot fix"?
A) 400
B) 404
C) 500
D) 503

**Q35.** What is the *best* practice for error responses in an API?
A) Return 200 with `{ "error": "..." }`
B) Return an appropriate status code and a consistent, machine-readable error body
C) Always return 500 on errors
D) Return raw stack traces

**Q36.** What is the principle of *least privilege* in security?
A) Give every user admin rights to reduce support load
B) Grant only the minimum permissions necessary to perform a task
C) Run all services as root
D) Avoid using credentials

**Q37.** What is a "race condition"?
A) A networking issue
B) A bug where the correctness depends on the timing or interleaving of concurrent operations
C) A race between threads to finish first
D) A type of memory leak

**Q38.** Which of these is a typical way to prevent a race condition on a counter in a database?
A) Read, increment in app, write back
B) Use an atomic update (e.g., `UPDATE ... SET count = count + 1 WHERE id = ?`) or a row-level lock / transaction
C) Use `localStorage`
D) Use a longer sleep

**Q39.** Why should errors *not* silently be swallowed in production code?
A) Because errors are always recoverable
B) Because silent failures hide problems, corrupt data, and make incidents harder to diagnose
C) Because of memory leaks
D) Because of TypeScript

**Q40.** What is "graceful degradation"?
A) Crashing fast
B) When a system continues to operate with reduced functionality in the presence of failures
C) Auto-scaling
D) A type of cache

---

## Section C — Databases, Indexes, and Modeling (Q41–Q60)

**Q41.** What does an index on a database column primarily do?
A) Increases write speed
B) Speeds up read queries that filter or sort by that column, at the cost of slower writes and extra storage
C) Reduces disk usage
D) Replaces the primary key

**Q42.** Which of these queries can benefit from an index on `email`?
A) `SELECT * FROM users WHERE LOWER(email) = ?`
B) `SELECT * FROM users WHERE email = ?`
C) `SELECT * FROM users WHERE email LIKE '%@gmail.com'`
D) None of the above

**Q43.** Why does `WHERE LOWER(email) = ?` often *not* use an index on `email`?
A) `LOWER` is unsupported
B) The function on the column generally makes the standard index unusable unless a *functional index* on `LOWER(email)` exists
C) Indexes don't work with strings
D) `WHERE` cannot use indexes

**Q44.** Which of these is the *first* normal form (1NF) requirement?
A) Atomic values; no repeating groups
B) No transitive dependencies
C) No partial dependencies
D) No foreign keys

**Q45.** In a one-to-many relationship between `users` and `orders`, the foreign key should live on:
A) The `users` table
B) The `orders` table (the "many" side)
C) Either side
D) A separate join table

**Q46.** What is a *composite index*?
A) An index on multiple columns
B) A backup index
C) A unique constraint
D) A partial index

**Q47.** For an index on `(country, city)`, which query can use it efficiently?
A) `WHERE city = 'Jakarta'`
B) `WHERE country = 'ID'`
C) `WHERE country = 'ID' AND city = 'Jakarta'`
D) Both B and C

**Q48.** What is the difference between `WHERE` and `HAVING`?
A) They are identical
B) `WHERE` filters rows before grouping; `HAVING` filters groups after `GROUP BY`
C) `HAVING` is faster
D) `WHERE` only works with strings

**Q49.** What is a *transaction* in a relational database?
A) A single SQL statement
B) A unit of work executed atomically — either all changes commit or none do
C) A type of index
D) A backup

**Q50.** What does "ACID" stand for?
A) Atomicity, Consistency, Isolation, Durability
B) Authorization, Consistency, Indexing, Durability
C) Atomic, Cached, Indexed, Distributed
D) Async, Concurrent, Idempotent, Durable

**Q51.** What is a "deadlock"?
A) A failed network call
B) Two or more transactions waiting for resources that the other holds, blocking each other indefinitely
C) A type of cache miss
D) A read replica being slow

**Q52.** Which is true about `NULL` in SQL?
A) `NULL = NULL` is `TRUE`
B) `NULL` represents an unknown value; comparisons with `=` are `UNKNOWN`, and `IS NULL` should be used
C) `NULL` equals `0`
D) `NULL` is the same as empty string

**Q53.** When is a `LEFT JOIN` followed by `WHERE right_table.col IS NULL` useful?
A) For pure inner joins
B) To find rows on the left that have *no match* on the right (anti-join)
C) To duplicate rows
D) To sort results

**Q54.** Which of these is *not* a typical NoSQL category?
A) Document store
B) Key–value store
C) Wide-column store
D) Relational store

**Q55.** Which of these workloads is *worst* suited to a typical document database?
A) Storing nested, varying JSON-like documents
B) Heavy multi-table joins with strong relational integrity
C) Per-user data blobs
D) Logs

**Q56.** Why are `SELECT *` queries often discouraged in production code?
A) They always return wrong data
B) They fetch more columns than needed, make code fragile to schema changes, and can prevent index-only scans
C) They are not valid SQL
D) They only work in MySQL

**Q57.** What does "N+1 query problem" mean?
A) Running one extra query for monitoring
B) Issuing one query to fetch a list and then N additional queries to fetch related data for each item, instead of a single joined or batched query
C) A query that times out
D) A query that returns NULL

**Q58.** Which of these is a common fix for the N+1 problem?
A) Eager loading via a JOIN or batched `IN (...)` query, or a dataloader pattern
B) Adding more indexes
C) Caching results in `localStorage`
D) Increasing the database connection pool size

**Q59.** What is a *migration* in the database sense?
A) Moving the database server
B) A versioned, repeatable script that evolves the database schema (and sometimes data)
C) A backup
D) A type of join

**Q60.** Why are migrations preferable to ad-hoc schema changes?
A) They are slower
B) They make schema evolution reproducible across environments, code-reviewable, and reversible
C) They are required by SQL
D) They eliminate downtime automatically

---

## Section D — Testing, Tooling, and CI/CD (Q61–Q80)

**Q61.** Which of these is *most* characteristic of a good unit test?
A) It hits the real database, network, and clock
B) It is fast, deterministic, isolated, and clearly named
C) It tests many behaviors at once
D) It depends on test execution order

**Q62.** What is the difference between a *unit* test and an *integration* test?
A) None
B) A unit test exercises a small piece in isolation; an integration test exercises multiple components working together (e.g., HTTP + DB)
C) Integration tests are always slower than UI tests
D) Unit tests must use mocks; integration tests cannot

**Q63.** What is an *end-to-end* (E2E) test?
A) A test that runs at the end of CI
B) A test that exercises the system through its real interfaces (e.g., browser + server) as a user would
C) A test of the last function called
D) A load test

**Q64.** Which of these is a reasonable "test pyramid" intuition?
A) Many slow E2E tests, few fast unit tests
B) Many fast unit tests, a moderate number of integration tests, and a small number of E2E tests
C) Only E2E tests are needed
D) Only unit tests are needed

**Q65.** What is a "flaky test"?
A) A failing test
B) A test that sometimes passes and sometimes fails without code changes — usually due to timing, ordering, or external state
C) A new test
D) A skipped test

**Q66.** Which is the best response to a flaky test?
A) Retry it 10 times until it passes
B) Treat flakiness as a bug: identify the root cause (timing, shared state, randomness) and fix it
C) Delete the test
D) Mark it skipped permanently

**Q67.** What is "mocking" in testing?
A) Replacing a real dependency with a controlled stand-in to isolate the unit under test
B) Making fun of legacy code
C) A type of fuzzing
D) A test that runs without assertions

**Q68.** When is mocking *overused*?
A) When you mock so much that the test verifies the mock itself rather than real behavior
B) Never; more mocks are always better
C) Only in integration tests
D) Only with TypeScript

**Q69.** Which of these is the most appropriate assertion style for a single test?
A) Many unrelated assertions
B) Arrange–Act–Assert, focused on a single behavior
C) Random
D) No assertions; just run the code

**Q70.** What is CI (Continuous Integration)?
A) Continuously deploying to production
B) Frequently integrating code changes into a shared branch, validated by automated build and tests
C) A type of code review
D) A monitoring tool

**Q71.** What is CD?
A) Continuous Deployment — every passing change is automatically released to production
B) Continuous Delivery — every passing change is releasable, with a (potentially manual) deploy step
C) Both A and B are valid meanings depending on the team's setup
D) None of the above

**Q72.** Which is the *best* practice for branch protection on the main branch?
A) Allow direct pushes
B) Require PR review, passing CI, and up-to-date branch before merge
C) Lock the branch entirely
D) Allow force-pushes

**Q73.** What does "shift left" mean in software quality?
A) Move developers to the left side of the office
B) Catch defects earlier in the development cycle — closer to the code being written
C) Use left-aligned text in tests
D) Reduce test coverage

**Q74.** What does a *linter* do?
A) Formats your code
B) Statically analyzes code for likely errors, anti-patterns, and style violations
C) Compiles the code
D) Runs the tests

**Q75.** What is the role of a *formatter* (e.g., Prettier)?
A) Enforces a consistent code style automatically so the team avoids style debates
B) Replaces linters
C) Optimizes runtime performance
D) Bundles the code

**Q76.** Why is a `.env` file for secrets typically *not* committed to Git?
A) It is too large
B) Committing secrets exposes them and pollutes history; secrets should live outside the repo, e.g., in a secret manager
C) Git does not support hidden files
D) `.env` files cause merge conflicts

**Q77.** What is a *semantic version* of the form `MAJOR.MINOR.PATCH`?
A) Random numbers chosen by the maintainer
B) A versioning scheme where MAJOR is for breaking changes, MINOR for backwards-compatible features, PATCH for backwards-compatible fixes
C) Only the major matters
D) Only the patch matters

**Q78.** What is `npm audit` used for?
A) Auditing the build time
B) Reporting known vulnerabilities in installed dependencies
C) Auditing the test coverage
D) Logging into npm

**Q79.** Which of these is a *risk* when bumping a dependency's major version?
A) Performance gain
B) Breaking API changes that require code updates
C) Smaller bundle
D) Better TypeScript types

**Q80.** Which of these is a sensible policy when you find a vulnerable transitive dependency?
A) Ignore it forever
B) Upgrade the direct dependency, override the transitive version with a lockfile mechanism, or replace the package — and verify with tests
C) Delete the lockfile
D) Disable the audit tool

---

## Section E — Code Quality and Professional Judgment (Q81–Q100)

**Q81.** Which of these is the most useful PR description?
A) "fix"
B) A short summary of *why*, the *what*, screenshots/recordings for UI, test notes, and rollout considerations
C) A list of every file changed
D) A copy of the diff

**Q82.** Which of these is the best small commit?
A) "Updated everything"
B) A self-contained change with a clear subject line, ideally one logical change per commit
C) A 5000-line commit
D) A merge commit with no description

**Q83.** Which is the best reaction when your PR gets blunt feedback?
A) Argue back immediately
B) Read carefully, separate ego from code, ask clarifying questions, decide which feedback to apply, and respond respectfully
C) Close the PR
D) Ignore the reviewer

**Q84.** When is it appropriate to add a comment in code?
A) Restating what the code already says clearly
B) Explaining *why* (intent, trade-offs, caveats) when it is not obvious from the code itself
C) Every line
D) Never

**Q85.** Which is the strongest signal a function should be split?
A) It has more than 5 lines
B) It does several unrelated things, has many levels of nesting, or its name has to use "and"
C) It uses async/await
D) It returns an array

**Q86.** Which is the most useful name?
A) `data`
B) `pendingInvoicesForCurrentUser`
C) `x`
D) `temp`

**Q87.** Which of these is *not* an example of a code smell?
A) Long parameter list
B) Tight coupling between unrelated modules
C) Naming variables clearly
D) Duplicated logic across files

**Q88.** What does the term "defensive programming" mean — and when is it overused?
A) It is always good; you cannot have too much
B) Adding input validation and safe defaults is healthy; but excessive null checks for impossible states clutter code and hide intent
C) Defensive code only runs in production
D) It is the same as logging

**Q89.** Which is the best way to handle a feature flag in code?
A) `if (true)`
B) A named, time-bounded flag with a clear default, an owner, and a plan to remove it after rollout
C) A magic number
D) A `localStorage` value the user can toggle in production

**Q90.** Which of these is a healthy attitude toward logs?
A) Log everything, including passwords
B) Log enough structured context to debug incidents without leaking PII or secrets
C) Never log
D) Only log errors

**Q91.** Which of these is *most* likely to violate user privacy?
A) Logging a sanitized user ID
B) Logging full request bodies that may include personal data, tokens, or PII
C) Logging response time in ms
D) Logging the HTTP method

**Q92.** Which of these reflects good incident behavior at this level?
A) Hide that you broke prod
B) Notify the team channel, focus on mitigation first (revert/rollback) before root-causing, then write a blameless postmortem
C) Blame QA
D) Push another fix without testing

**Q93.** What is "technical debt"?
A) A backlog ticket
B) The accumulated cost of choosing easier, suboptimal solutions over more correct ones, which slows future work
C) A type of CI failure
D) Money owed to vendors

**Q94.** Which is true about technical debt?
A) Always pay it all immediately
B) It is a normal trade-off; it should be tracked, prioritized, and paid down when it slows the team
C) Tech debt is always bad
D) Tech debt does not apply to frontend

**Q95.** Which of the following is the most useful *first* step when investigating a production bug?
A) Reproduce reliably (locally, in staging, or from logs) before changing code
B) Push a quick guess fix to production
C) Disable the failing feature
D) Restart the server

**Q96.** Which of these correctly describes "blast radius"?
A) The number of files in a repo
B) How widely a failure or change can affect users, services, or data
C) The size of a deployment artifact
D) The number of approvers needed

**Q97.** When designing a small feature, when should you start writing tests?
A) After it has been in production for a month
B) Early — at minimum, write tests as you build, especially for non-trivial business logic and edge cases
C) Only if you have time left
D) Tests are QA's job

**Q98.** Which is the most reasonable behavior with regard to a TODO you leave in code?
A) Leave it forever
B) Use TODOs sparingly, with a context note and ideally a ticket reference; revisit and clean them up
C) Replace TODO with FIXME so it sounds more urgent
D) Convert all TODOs into comments without context

**Q99.** Which of these reflects mature ownership?
A) "It works on my machine"
B) Caring whether your change actually works in production for users, including monitoring after deploy
C) Closing tickets the second code is merged
D) Refusing to look at other people's code

**Q100.** Which of these best describes the Junior 3 bar?
A) Knows everything about every system
B) Can independently own a medium feature, write tests, handle reviews well, follow conventions, and ask sharp questions when stuck
C) Designs the system architecture for the whole company
D) Manages a team

---

## Answer Key

1.B  2.B  3.B  4.B  5.C  6.B  7.B  8.B  9.B  10.B
11.B  12.B  13.A  14.B  15.B  16.B  17.A  18.B  19.B  20.B
21.B  22.D  23.C  24.B  25.B  26.B  27.B  28.C  29.B  30.B
31.B  32.D  33.B  34.C  35.B  36.B  37.B  38.B  39.B  40.B
41.B  42.B  43.B  44.A  45.B  46.A  47.D  48.B  49.B  50.A
51.B  52.B  53.B  54.D  55.B  56.B  57.B  58.A  59.B  60.B
61.B  62.B  63.B  64.B  65.B  66.B  67.A  68.A  69.B  70.B
71.C  72.B  73.B  74.B  75.A  76.B  77.B  78.B  79.B  80.B
81.B  82.B  83.B  84.B  85.B  86.B  87.C  88.B  89.B  90.B
91.B  92.B  93.B  94.B  95.A  96.B  97.B  98.B  99.B  100.B

**Passing threshold: 89 / 100.**
