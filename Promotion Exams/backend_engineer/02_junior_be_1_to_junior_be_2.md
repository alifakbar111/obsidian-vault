# Promotion Exam: Junior Backend Engineer 1 → Junior Backend Engineer 2

**Track:** Backend Engineer (Specialist)
**Format:** 100 multiple-choice questions
**Time:** 135 minutes
**Passing score:** 89 / 100

**Scope.** A Junior BE 1 ships small backend tasks under supervision. A Junior BE 2 should be trusted to take a small-to-medium backend feature from ticket to production with light review — modeling the data, writing the endpoint, validating input, handling errors, and not introducing regressions or security holes. This exam tests the gap: intermediate programming and the async model, REST API design done correctly, SQL beyond the basics, the runtime model of the server (Node.js used as a default reference, but the concepts apply broadly), introductory authentication, input validation, testing, working with databases through ORMs and migrations, and the team practices a Junior 2 needs to demonstrate.

---

## Section A — Intermediate Programming and Async (Q1–Q15)

**1.** A closure is:
A) A minified function
B) A function together with the variables from the scope in which it was defined, allowing it to access those variables even after the outer function has returned
C) A type of class
D) A network connection

**2.** Synchronous code versus asynchronous code:
A) Are the same
B) Synchronous code blocks the thread until it finishes; asynchronous code yields control while waiting (for I/O, timers, etc.) so other work can proceed
C) Async is always faster
D) Sync is deprecated

**3.** In Node.js, blocking the event loop with a long-running synchronous computation:
A) Has no effect
B) Stalls all other request handling because Node runs a single-threaded event loop — long CPU work belongs in a worker thread or another process
C) Triggers a thread switch
D) Is automatically parallelized

**4.** A Promise has three possible states:
A) Open, closed, error
B) Pending, fulfilled, rejected
C) Running, paused, done
D) Sync, async, hybrid

**5.** `await` inside an `async` function:
A) Has no effect
B) Pauses the function until the awaited promise settles, then resumes — other work in the process continues during the wait
C) Blocks the event loop
D) Creates a thread

**6.** Awaiting promises in a loop sequentially:
A) Is always correct
B) Runs them one at a time; when they could run independently, `Promise.all` (or a controlled-concurrency pool) is usually a large speed win
C) Is faster
D) Is impossible

**7.** `Promise.all([p1, p2, p3])`:
A) Always resolves
B) Resolves to an array of all values when every promise fulfills; if any one rejects, the whole thing rejects immediately
C) Returns the first value
D) Is deprecated

**8.** `Promise.allSettled` differs from `Promise.all` in that:
A) It is faster
B) It always resolves once every promise has settled, returning per-promise status, never short-circuiting on rejection
C) It rejects on any failure
D) It is the same

**9.** An unhandled promise rejection in a recent Node.js version:
A) Is silently ignored
B) Triggers a warning and, in strict configurations, terminates the process — handle rejections deliberately
C) Retries the promise
D) Is the same as a thrown error caught upstream

**10.** Destructuring `const { name, email } = user`:
A) Mutates `user`
B) Creates local variables `name` and `email` from the properties of `user`
C) Deep-clones the object
D) Throws if any property is missing

**11.** Spread syntax `{...defaults, ...overrides}`:
A) Merges arrays
B) Creates a new object with properties from `defaults` first, then `overrides`, where later keys override earlier ones — useful for config merging
C) Mutates the first object
D) Is for arrays only

**12.** `Array.prototype.map`, `filter`, `reduce`:
A) Mutate the array
B) Return new arrays (or a single value, for `reduce`); the original array is not changed
C) Are slower than for-loops always
D) Cannot be chained

**13.** A pure function:
A) Has no inputs
B) Returns the same output for the same inputs and produces no side effects — easier to test and reason about
C) Is async
D) Returns void

**14.** Module imports in Node.js (ES modules or CommonJS):
A) Re-execute on every import
B) Cache the module after first load; subsequent imports return the cached module — this is generally what you want, but it surprises people who expect fresh state per import
C) Are evaluated lazily by default
D) Cannot be cyclic

**15.** Top-level `await` (in ES modules):
A) Is invalid syntax
B) Is supported in modern Node ES modules and lets module initialization await async work — but used carelessly, it can stall the whole module graph
C) Replaces async functions
D) Is for tests only

---

## Section B — REST API Design (Q16–Q30)

**16.** A RESTful endpoint should be:
A) Verb-based like `/getUsers`, `/createUser`
B) Resource-based like `/users` with HTTP methods conveying the action (`GET /users`, `POST /users`)
C) Random
D) RPC-style only

**17.** `GET /users/123`:
A) Should return user 123, or 404 if not found, with no side effects
B) Should create user 123
C) Should delete user 123
D) Returns the password

**18.** `POST /users` with a request body:
A) Reads users
B) Creates a new user, typically returning 201 with the created resource (and often a `Location` header)
C) Updates user IDs
D) Returns all users

**19.** A successful `PUT /users/123` replaces the resource. The expected status code is typically:
A) 201
B) 200 (or 204 if no content is returned)
C) 401
D) 500

**20.** A successful `DELETE /users/123`:
A) Returns the deleted user always
B) Returns 204 (no content) or 200 with a confirmation body — the choice is a contract, but should be consistent across the API
C) Returns 500
D) Returns 201

**21.** Sending `400 Bad Request` versus `422 Unprocessable Entity`:
A) Are the same
B) Both indicate client-side input problems; some teams reserve 422 specifically for semantically invalid (but syntactically OK) payloads, with 400 for malformed requests — pick a convention and apply it consistently
C) 400 is for server errors
D) 422 is deprecated

**22.** Returning `200 OK` with `{"error": "..."}` in the body:
A) Is best practice
B) Is a common anti-pattern — the HTTP layer says success while the body says failure; use proper status codes so clients, monitoring, and infrastructure can reason correctly
C) Is required by REST
D) Helps caching

**23.** Pagination on a list endpoint should:
A) Return everything by default
B) Use sensible defaults (e.g., 20 per page), expose page size and cursor or page number, and make the next-page mechanism explicit in the response
C) Be optional only
D) Use only query params with no documentation

**24.** Filtering and sorting on a list endpoint:
A) Should accept arbitrary SQL from the client
B) Should be expressed through controlled query parameters mapped to specific, indexed columns — never pass user input directly into a query
C) Should not exist
D) Should be in the body

**25.** A consistent error response format across endpoints:
A) Is unnecessary
B) Helps clients handle errors uniformly — fields like `code`, `message`, and optionally `details` and `traceId` are common; pick a shape and stick to it
C) Is for the frontend only
D) Should vary per endpoint

**26.** Returning stack traces or internal error messages to clients:
A) Helps debugging
B) Leaks information attackers can use; surface a generic safe message to clients, log the full detail server-side with a correlation ID
C) Is required
D) Is encrypted automatically

**27.** API versioning approaches include:
A) None
B) URL path (`/v1/`), header (`Accept: application/vnd.api.v1+json`), or query parameter; each has trade-offs in caching, simplicity, and explicitness
C) Only filename
D) Database table names

**28.** Idempotency in `PUT` and `DELETE`:
A) Is impossible
B) Means repeating the same request produces the same end state — important for client retries on flaky networks
C) Is only for GET
D) Is automatic

**29.** Idempotency keys on `POST`:
A) Are not needed
B) Are a server-supported pattern letting clients safely retry a creation by sending the same key — the server returns the same result rather than creating duplicates
C) Are an HTTP standard everywhere
D) Are for authentication

**30.** Documenting an API with OpenAPI/Swagger:
A) Is optional and rarely useful
B) Is high leverage — clients, tooling, mock servers, and tests can all be generated or validated against the contract
C) Replaces the code
D) Is for frontend only

---

## Section C — SQL Intermediate (Q31–Q45)

**31.** An inner join:
A) Returns all rows from both tables
B) Returns only rows where the join condition matches in both tables
C) Is the same as a cross join
D) Returns null for missing matches

**32.** A left outer join:
A) Returns rows from both sides only when they match
B) Returns all rows from the left table, with matching rows from the right where they exist, and NULLs where they do not
C) Excludes the left table
D) Is for sorting

**33.** A query with no join condition on two tables (or a `CROSS JOIN`):
A) Is empty
B) Returns the Cartesian product — every row from the first table paired with every row from the second; rarely what you actually want
C) Is the same as inner join
D) Is invalid

**34.** Aggregating with `GROUP BY` and filtering groups:
A) Uses `WHERE`
B) Uses `HAVING` to filter on aggregate results (e.g., `HAVING COUNT(*) > 10`); `WHERE` filters rows before grouping
C) Is impossible
D) Uses `ORDER BY`

**35.** An index on a column:
A) Stores the column twice
B) Maintains a fast lookup structure (often a B-tree) so the database can find rows by that column without scanning the whole table; reads get faster, writes slightly slower, plus disk space cost
C) Is the same as a primary key
D) Encrypts the column

**36.** A composite index on `(country, created_at)`:
A) Helps queries on `created_at` alone equally well
B) Helps queries that filter by `country`, or by `country` and `created_at` together, in that column order; queries filtering only by `created_at` typically cannot use this index efficiently
C) Is the same as two single-column indexes
D) Replaces the primary key

**37.** A transaction (BEGIN ... COMMIT):
A) Speeds up reads
B) Groups a set of statements so they either all succeed or all fail together — preserving consistency for multi-step changes
C) Is for backups only
D) Replaces indexes

**38.** Rolling back a transaction:
A) Permanently deletes data
B) Undoes the statements in the transaction as if they never happened — used when an error occurs partway through
C) Is irreversible
D) Drops the table

**39.** A `UNIQUE` constraint:
A) Speeds up writes
B) Enforces that no two rows have the same value (or combination of values) in the constrained column(s) — prevents duplicates at the database level
C) Is the same as `NOT NULL`
D) Is for primary keys only

**40.** A `NOT NULL` constraint:
A) Allows nulls in some rows
B) Forbids the column from being null, ensuring the column always has a value
C) Is decorative
D) Is for primary keys only

**41.** Cascading deletes (`ON DELETE CASCADE`):
A) Are always safe
B) Automatically delete child rows when their parent is deleted — powerful, but easy to misuse; sometimes a soft-delete or explicit handling is safer
C) Are decorative
D) Are deprecated

**42.** N+1 query problem:
A) An off-by-one bug
B) Loading N records and then issuing N additional queries (one per record) to fetch related data, instead of one batched join or `IN` query — a major cause of slow endpoints
C) A SQL syntax error
D) A type error

**43.** `EXPLAIN` (or `EXPLAIN ANALYZE`):
A) Adds comments
B) Shows the database's query plan — which indexes are used, what kind of scan, estimated rows — essential for diagnosing slow queries
C) Runs the query twice
D) Is for write queries

**44.** A migration:
A) Moves the database to a new server
B) A versioned, scripted change to the schema (or data) that can be applied in order across environments, kept under version control alongside code
C) Is for backups
D) Is for production only

**45.** Editing a database schema directly in production without a migration:
A) Is acceptable for small changes
B) Is one of the most dangerous habits in backend engineering — environments drift, rollbacks become impossible, and the next deploy may surprise you
C) Is the norm
D) Is encouraged for speed

---

## Section D — Runtime and Node.js Specifics (Q46–Q55)

**46.** Node.js's event loop:
A) Spawns a thread per request
B) Is single-threaded for JavaScript execution, multiplexing I/O via non-blocking operations; CPU-bound work blocks all requests on the same process
C) Is multithreaded by default
D) Is deprecated

**47.** A CPU-bound task in Node.js belongs in:
A) The main thread
B) A worker thread, child process, or external service — keeping the event loop responsive
C) A Promise
D) `setTimeout`

**48.** `process.nextTick` versus `setImmediate` versus `setTimeout(0)`:
A) Are interchangeable
B) Have different priorities in the event loop; understanding the order can matter for subtle bugs, but for everyday code, prefer Promises and `await`
C) Are deprecated
D) Run in different threads

**49.** Streams in Node.js are useful for:
A) Storing data
B) Processing data piece by piece without loading the whole payload into memory — essential for large file uploads, downloads, and pipelines
C) Synchronous reading
D) Network only

**50.** Reading a large file with `fs.readFileSync` in a request handler:
A) Is fine
B) Blocks the event loop for the entire read, stalling every other request — use the async API and consider streams for large files
C) Is faster
D) Is required for correctness

**51.** Express, Fastify, or your framework's middleware:
A) Run only on errors
B) Run in sequence for each request, each given the request, response, and `next` — allowing logging, authentication, validation, rate limiting, etc. to be composed
C) Are deprecated
D) Run per file

**52.** Forgetting to `await` an async function inside a handler:
A) Has no effect
B) Returns a hanging promise; if you also forget to handle errors, rejections become invisible — a common source of silent bugs
C) Causes a syntax error
D) Speeds the response

**53.** Process environment variables (`process.env`) at startup versus during runtime:
A) Are the same
B) Are typically read once at startup and cached; changing the file later does not affect the running process without a restart
C) Update live
D) Are encrypted

**54.** Graceful shutdown:
A) Is the same as a hard kill
B) Catches termination signals, stops accepting new requests, finishes in-flight requests, closes database connections, then exits — important for zero-downtime deploys
C) Is automatic
D) Is for development only

**55.** A worker process versus a Node.js worker thread:
A) Are the same
B) A worker process is a separate OS process (more isolation, more memory); a worker thread shares memory with the main thread; both let you parallelize CPU work
C) Are interchangeable
D) Are deprecated

---

## Section E — Authentication Basics (Q56–Q65)

**56.** Authentication versus authorization:
A) Are the same
B) Authentication is verifying who the user is; authorization is checking what they are allowed to do — distinct, both required
C) Authorization is for admins
D) Authentication is harder

**57.** Storing passwords in the database:
A) Encrypt them
B) Hash them with a slow, salted, modern algorithm (bcrypt, argon2, scrypt) — never encrypt them in a reversible way, never use MD5/SHA-1
C) Plaintext is fine if the DB is private
D) Base64 encode them

**58.** A "salt" in password hashing:
A) Speeds up hashing
B) A per-password random value mixed into the hash so identical passwords produce different hashes — defeats precomputed rainbow tables
C) Replaces the password
D) Is shared across users

**59.** A session-based auth flow:
A) Sends the password on every request
B) Issues a session ID after login, stored on the server (in memory, cache, or DB), with the ID sent via a cookie; the server looks up the session each request
C) Is stateless
D) Is the same as JWT

**60.** A token-based auth flow (JWT, opaque tokens):
A) Stores state on the server
B) Issues a token after login that the client sends with each request; with JWTs, the server can verify the signature and read claims without a database lookup
C) Cannot be revoked
D) Is unencrypted

**61.** A JWT in `localStorage` versus an `httpOnly` cookie:
A) Are the same
B) `localStorage` is readable by any script in the page (vulnerable to XSS); `httpOnly` cookies are not readable by JS but require CSRF protection — choose based on threat model
C) Cookies are always wrong
D) `localStorage` is always wrong

**62.** A common JWT mistake is:
A) Using a long secret
B) Trusting `alg: none`, accepting weak algorithms, putting sensitive data in the (readable) payload, or building "logout" without a revocation strategy
C) Using HS256
D) Including an expiry

**63.** Short-lived access tokens with refresh tokens:
A) Are unnecessary
B) Are a common pattern — access tokens expire quickly to limit damage if leaked; refresh tokens are used to get new access tokens and can be revoked
C) Are the same as session IDs
D) Defeat the purpose of JWT

**64.** OAuth 2.0 at a high level:
A) Is a password protocol
B) A delegated authorization framework: the user authorizes a client to act on their behalf at a resource server, via an authorization server, using flows like authorization code (with PKCE for public clients)
C) Replaces HTTPS
D) Is for service-to-service only

**65.** Authorization checks should be enforced:
A) On the frontend only
B) On the server, on every protected operation — frontend checks are for UX, not security; assume requests can hit the endpoint directly
C) Only at login
D) Only on writes

---

## Section F — Input Validation and Errors (Q66–Q75)

**66.** Validating input means:
A) Checking it looks right
B) Confirming the request matches the expected schema (types, required fields, ranges, formats) and rejecting anything that does not — at the boundary, before business logic runs
C) Sanitizing for display
D) The same as authentication

**67.** Validation libraries (Zod, Joi, Ajv, class-validator):
A) Are overkill
B) Define a schema once, validate at the boundary, and (in TypeScript) produce types in lockstep with the runtime validation — keeping the two in sync
C) Replace tests
D) Are for frontend only

**68.** Trust boundaries:
A) Do not exist in modern systems
B) Are the points where untrusted data enters your system (HTTP, queue messages, third-party callbacks); validation and authorization must happen at every boundary, not only at one
C) Are only HTTP
D) Are decorative

**69.** Returning detailed validation errors versus a generic 400:
A) Generic is always safer
B) Detailed, structured errors (field, code, message) make clients much more useful — but never expose internal stack traces or sensitive internals
C) Always include the stack
D) Always be vague

**70.** A common error response shape includes:
A) Just a string
B) Fields like `code`, `message`, optionally `details` and a `traceId` for correlation with logs — applied consistently across endpoints
C) Only HTML
D) The full database row

**71.** Handling errors in middleware:
A) Should crash the process
B) A centralized error-handling middleware converts thrown errors into appropriate responses, logs them with context, and ensures unhandled cases do not leak stack traces
C) Should ignore them
D) Should return 200

**72.** Returning a `500` for a validation failure:
A) Is fine
B) Is wrong — the error is the client's, not the server's; use `400` (or `422`) and conserve `500` for genuine server failures
C) Is required
D) Is the same as 400

**73.** Logging the full error server-side while returning a generic message client-side:
A) Is hiding bugs
B) Is the right balance — debuggable internally, safe externally; include a correlation ID in the response so users can be helped by support
C) Is impossible
D) Is for frontend only

**74.** A 404 returned for an endpoint the user cannot see versus a 403:
A) Are interchangeable
B) Are an intentional design choice; returning 404 for unauthorized access can hide existence of resources, but conflates two cases and complicates debugging — pick a policy
C) 404 is always wrong
D) 403 is deprecated

**75.** Rate limiting:
A) Is hostile to users
B) Protects the system from runaway clients, brute-force attempts, and abuse; return `429 Too Many Requests` with a `Retry-After` header and apply limits per identity or IP as appropriate
C) Replaces authentication
D) Is the same as auth

---

## Section G — Testing Basics (Q76–Q85)

**76.** A unit test:
A) Tests the whole app
B) Tests a small piece of logic in isolation, fast and deterministic, with clear arrangement-action-assertion structure
C) Hits the real database
D) Runs in production

**77.** An integration test:
A) Tests one function
B) Tests several pieces wired together — for example, a route handler together with a real (or in-memory) database — verifying the contract between components
C) Is the same as E2E
D) Replaces unit tests

**78.** Tests should be:
A) Slow and thorough
B) Fast enough that engineers run them often, deterministic, and independent — a slow or flaky suite stops being used
C) Manual
D) Rare

**79.** A test that depends on time, network, or filesystem state:
A) Is normal
B) Is often flaky; isolate the dependency behind a seam, inject a controllable substitute (a fake clock, an in-memory store, mocked HTTP), and test the seam separately
C) Is faster
D) Is the same as a unit test

**80.** Mocking versus faking versus stubbing:
A) Are the same
B) Are related but different: a stub returns canned values, a mock verifies how the dependency was called, a fake is a working lightweight implementation — choose by what you actually need to assert
C) Are deprecated
D) Are only for frontend

**81.** Test coverage:
A) Should always be 100%
B) Is a floor, not a target; high coverage with shallow tests is worse than moderate coverage with meaningful ones
C) Is irrelevant
D) Replaces code review

**82.** Writing a regression test for a bug you just fixed:
A) Is paranoia
B) Locks in the fix so the bug cannot silently return — write it while the failure is still reproducible
C) Slows down the fix
D) Is the QA team's job

**83.** Testing an endpoint:
A) Should use the real production database
B) Should hit the route, exercise typical and edge inputs (auth required, validation failures, success cases), and verify both the response and the relevant side effects
C) Should always be manual
D) Is impossible in CI

**84.** A flaky test:
A) Should be retried
B) Should be diagnosed and fixed — flakiness usually indicates race conditions, async issues, or environmental dependencies, and ignoring it erodes trust in the suite
C) Should be deleted silently
D) Is fine

**85.** Testing the happy path only:
A) Is enough
B) Misses where most real bugs live — invalid inputs, partial failures, timeouts, race conditions, and authorization edge cases deserve at least as much attention
C) Is faster CI
D) Is required

---

## Section H — Working with Databases (Q86–Q92)

**86.** An ORM (Prisma, TypeORM, Sequelize, Drizzle, etc.):
A) Replaces SQL
B) Maps relational rows to objects and offers a higher-level query API; you still need to understand SQL to debug queries, indexes, and performance
C) Is faster than raw SQL
D) Is deprecated

**87.** A query builder versus an ORM:
A) Are the same
B) A query builder constructs SQL programmatically without mapping to entities; an ORM adds entity/relationship modeling on top — each has trade-offs in flexibility and abstraction
C) Builders cannot use joins
D) ORMs always win

**88.** A common ORM trap is:
A) Using migrations
B) The N+1 problem — loading a list of entities and then triggering one extra query per entity to load relations; use eager loading or explicit joins
C) Using indexes
D) Using transactions

**89.** Database connection pools:
A) Open a new connection per request
B) Maintain a pool of reusable connections, since establishing a database connection is expensive; tune the pool size to the workload and database limits
C) Are deprecated
D) Are for reads only

**90.** Long-running transactions in a request handler:
A) Are fine
B) Hold connections and locks, hurting concurrency and throughput; keep transactions short and avoid network calls inside them
C) Speed up queries
D) Are required

**91.** "Soft delete" (marking a row as deleted with a flag) versus hard delete:
A) Are the same
B) Soft delete preserves history and enables undo or audit, at the cost of having to filter `WHERE deleted_at IS NULL` everywhere; choose by need, and be consistent
C) Soft delete is always slower
D) Hard delete is forbidden

**92.** Database migrations should be:
A) Run by hand on each environment
B) Versioned, code-reviewed, applied automatically through CI/CD, and tested on staging before production — and reversible where reasonable
C) For development only
D) Optional

---

## Section I — Team Practices (Q93–Q100)

**93.** A small, focused PR versus a large one:
A) Large is faster
B) Small PRs are easier to review, faster to merge, and safer to revert — break big changes into a series of smaller ones when you can
C) The same
D) Large PRs are required

**94.** Reviewing a senior's code:
A) Is presumptuous
B) Is a normal part of the work; ask clarifying questions, point out anything that seems wrong, and treat it as learning — juniors who only nitpick miss the point of review
C) Is forbidden
D) Should be skipped

**95.** Standup as a forum:
A) Is a status report to the manager
B) Is a short sync where the team coordinates the day, surfaces blockers, and asks for help — not a performance review
C) Is for managers only
D) Should be replaced with email

**96.** Saying "I do not know, let me find out":
A) Damages credibility
B) Builds it — guessing confidently produces wrong code that hurts the team; honesty about uncertainty is a senior trait juniors should adopt early
C) Is for seniors only
D) Should be avoided

**97.** Writing documentation as you go:
A) Is the technical writer's job
B) Is a first-class engineering skill — runbooks, architecture decisions, README updates, and inline comments all save the next person (often you) significant time
C) Wastes time
D) Is for managers

**98.** A teammate is blocked because of work you own:
A) Wait until they ask twice
B) Unblock them quickly — your throughput is the team's throughput; finish your part or hand it off, and communicate either way
C) Ignore it
D) Charge them for the help

**99.** When you break something in production:
A) Hide the evidence
B) Tell someone immediately, contain the damage, fix the issue, and write or contribute to a blameless post-mortem afterward — the team learns more from honest debriefs than from blame
C) Wait for someone to notice
D) Quietly revert

**100.** The most reliable predictor of growing past Junior 2 is:
A) Speed
B) Consistent, visible follow-through — finishing what you start, communicating proactively, being someone the team can count on, and asking good questions
C) Brilliance
D) Working late

---

## Answer Key

1.B  2.B  3.B  4.B  5.B  6.B  7.B  8.B  9.B  10.B
11.B  12.B  13.B  14.B  15.B  16.B  17.A  18.B  19.B  20.B
21.B  22.B  23.B  24.B  25.B  26.B  27.B  28.B  29.B  30.B
31.B  32.B  33.B  34.B  35.B  36.B  37.B  38.B  39.B  40.B
41.B  42.B  43.B  44.B  45.B  46.B  47.B  48.B  49.B  50.B
51.B  52.B  53.B  54.B  55.B  56.B  57.B  58.B  59.B  60.B
61.B  62.B  63.B  64.B  65.B  66.B  67.B  68.B  69.B  70.B
71.B  72.B  73.B  74.B  75.B  76.B  77.B  78.B  79.B  80.B
81.B  82.B  83.B  84.B  85.B  86.B  87.B  88.B  89.B  90.B
91.B  92.B  93.B  94.B  95.B  96.B  97.B  98.B  99.B  100.B

**Passing threshold: 89 / 100**
