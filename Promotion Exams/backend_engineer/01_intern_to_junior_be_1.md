# Promotion Exam: Intern → Junior Backend Engineer 1

**Track:** Backend Engineer (Specialist)
**Format:** 100 multiple-choice questions
**Time:** 120 minutes
**Passing score:** 89 / 100

**Scope.** This exam evaluates whether an intern has the foundation to be hired as a Junior Backend Engineer 1. The bar is "can be trusted with a small, scoped backend task, with supervision, and will not break things in ways the team cannot recover from." The focus is on the backend-specific skills a new junior must have on day one: programming fundamentals, HTTP and the web, SQL basics, simple data structures, error handling, Git and the command line, and the engineering habits that determine whether a junior will grow or stall.

**A note on language.** Questions involving language-specific examples assume Node.js with TypeScript/JavaScript as a common default, because it pairs naturally with the frontend stack and is widely used. If your team standardizes on Python, Go, Java, or another language, the concepts transfer — replace the syntax-specific items with the equivalent in your language. The fundamentals do not change.

---

## Section A — Programming Fundamentals (Q1–Q15)

**1.** A variable declared with `const` in JavaScript means:
A) The value is deeply immutable
B) The binding cannot be reassigned, though if it holds an object the object's contents can still change
C) The variable is global
D) The variable is faster

**2.** An `if` statement is best used when:
A) The same code path always runs
B) Different code paths should run based on a condition
C) Looping is needed
D) Variables are declared

**3.** A `for` loop versus `while` loop:
A) `for` is faster
B) `for` is typically used when the number of iterations is known up front; `while` is used when the loop continues until a condition becomes false
C) They are interchangeable in every case
D) `while` is deprecated

**4.** A function should typically:
A) Do many things in one place
B) Do one well-defined thing, with a name that describes what it does, and return a useful result rather than relying on side effects
C) Be at least 100 lines
D) Avoid parameters

**5.** Passing an object to a function and mutating it inside:
A) Has no effect outside the function
B) Mutates the caller's object too, because objects are passed by reference — this is a common source of surprise bugs
C) Throws an error
D) Copies the object first

**6.** A hash map (object, dictionary, `Map`) versus an array for lookup by key:
A) Arrays are always faster
B) A hash map gives roughly O(1) lookup by key; scanning an array is O(n) — for any non-trivial data set this matters significantly
C) They are equivalent
D) Hash maps cannot store strings

**7.** A common bug pattern with loops is:
A) Using `for`
B) Off-by-one errors — using `<` versus `<=`, starting at 0 versus 1, or iterating past the array's bounds
C) Using arrays
D) Using break

**8.** Recursion:
A) Is always faster than iteration
B) Is a function calling itself; useful for problems with a self-similar structure, but bounded depth and a base case are essential to avoid stack overflow
C) Is deprecated
D) Is the same as a loop

**9.** Returning early from a function instead of nesting `if/else`:
A) Is bad style
B) Often produces flatter, more readable code — handle invalid cases up front and return, leaving the main path unindented
C) Is slower
D) Breaks linters

**10.** Falsy values in JavaScript include:
A) `[]` and `{}`
B) `0`, `""`, `null`, `undefined`, `NaN`, and `false`
C) Any object
D) Only `false`

**11.** A `try/catch` block:
A) Slows down all code inside it
B) Lets you handle errors thrown synchronously inside the `try` block, and rejections from awaited promises, rather than letting them crash the process
C) Catches every kind of error
D) Cancels the function

**12.** A module in modern JavaScript/TypeScript:
A) Is just a file
B) Is a unit of code with its own scope that exports values for other modules to import, encouraging organized, reusable code
C) Is a class
D) Is deprecated

**13.** `async`/`await`:
A) Makes code synchronous
B) Makes asynchronous code look sequential, but it is still asynchronous under the hood; `await` pauses the function until the awaited promise resolves
C) Replaces threads
D) Is for the database only

**14.** A type system (TypeScript, Java's static types, etc.) helps mainly by:
A) Making code faster at runtime
B) Catching certain classes of bugs at compile time and providing editor tooling and documentation that scales with the codebase
C) Replacing testing
D) Reducing file size

**15.** A function that reads from a database, mutates a global variable, and sends an email:
A) Is well-factored
B) Is doing too much; small, single-purpose functions are easier to test, reuse, and reason about
C) Is efficient
D) Is required for performance

---

## Section B — HTTP and the Web (Q16–Q30)

**16.** The HTTP request/response model is:
A) Bidirectional and persistent by default
B) A client sends a request, the server returns a response, and (by default) each request is independent of any other
C) Synchronous on the wire
D) Stateful by default

**17.** A URL like `https://api.example.com/v1/users?limit=10` consists of:
A) Just a path
B) A scheme (`https`), host (`api.example.com`), path (`/v1/users`), and query string (`?limit=10`)
C) Only domain and path
D) The same as an IP

**18.** GET is intended for:
A) Creating resources
B) Retrieving data without side effects — safe and idempotent
C) Deleting data
D) Updating data

**19.** POST is intended for:
A) Reading
B) Submitting data to be processed, often creating a new resource — generally not idempotent
C) Deleting
D) Caching

**20.** PUT versus PATCH:
A) They are identical
B) PUT typically replaces a resource entirely; PATCH applies a partial update
C) PUT is for creating only
D) PATCH is deprecated

**21.** A 200 status code means:
A) The request failed
B) Success with a response body
C) Redirect
D) Authentication required

**22.** A 201 status code means:
A) Server error
B) A resource was created as a result of the request
C) Method not allowed
D) The same as 200

**23.** A 204 status code means:
A) Bad request
B) Success with no content in the response body
C) Permanent redirect
D) Not found

**24.** A 400 status code means:
A) Server error
B) The request was malformed or invalid — the client should not retry without fixing it
C) Authentication failed
D) The resource is gone

**25.** A 401 versus 403:
A) They are identical
B) 401 means the request lacks valid authentication; 403 means authenticated but not allowed to perform this action
C) 401 means forbidden, 403 means unauthorized
D) Both mean "logged out"

**26.** A 404 status code means:
A) The server failed
B) The requested resource was not found
C) The request was malformed
D) The user is unauthorized

**27.** A 500 status code means:
A) The client did something wrong
B) An unexpected error occurred on the server
C) The resource was created
D) The request is being processed

**28.** HTTP headers carry:
A) Only the body
B) Metadata about the request or response — content type, length, authentication, caching directives, custom application info
C) Only cookies
D) Only the URL

**29.** Query parameters versus the request body:
A) They are the same
B) Query parameters live in the URL and suit small, non-sensitive data (often for GET); the body carries larger or more sensitive payloads (POST/PUT/PATCH)
C) Query parameters are encrypted
D) The body is for GET only

**30.** HTTPS adds, over HTTP:
A) Speed
B) Encryption in transit, authentication of the server, and integrity of the data — essential for any production traffic
C) Caching
D) Compression

---

## Section C — SQL Fundamentals (Q31–Q45)

**31.** `SELECT * FROM users` returns:
A) One row
B) All columns of all rows from the `users` table
C) Just the primary key
D) An error

**32.** `SELECT name FROM users WHERE id = 5`:
A) Returns all users
B) Returns the `name` column for rows where `id` equals 5
C) Updates id 5
D) Deletes id 5

**33.** Inserting a new row uses:
A) `ADD ROW`
B) `INSERT INTO users (name, email) VALUES ('Alip', 'alip@example.com')`
C) `CREATE`
D) `PUT`

**34.** Updating existing rows uses:
A) `MODIFY`
B) `UPDATE users SET name = 'New' WHERE id = 5`
C) `PATCH`
D) `INSERT`

**35.** Deleting rows uses:
A) `REMOVE`
B) `DELETE FROM users WHERE id = 5`
C) `DROP`
D) `CLEAR`

**36.** Omitting the `WHERE` clause in `UPDATE` or `DELETE`:
A) Has no effect
B) Applies the operation to **every** row in the table — a famous source of production disasters
C) Returns an error
D) Updates only one row

**37.** `ORDER BY created_at DESC`:
A) Filters rows
B) Sorts the result set by `created_at` in descending order (newest first)
C) Groups rows
D) Limits rows

**38.** `LIMIT 10`:
A) Removes 10 rows
B) Returns at most 10 rows from the result set
C) Skips 10 rows
D) Selects 10 columns

**39.** Aggregate functions like `COUNT`, `SUM`, `AVG`:
A) Operate on a single row
B) Operate on a set of rows and return a single value, often combined with `GROUP BY`
C) Are for joins only
D) Are deprecated

**40.** `GROUP BY country` in combination with `COUNT(*)`:
A) Returns one row per row in the table
B) Returns one row per distinct `country` value with the count of rows in each group
C) Filters by country
D) Sorts by country

**41.** A `JOIN` combines rows from multiple tables based on:
A) Random matching
B) A relationship — typically a foreign key matching a primary key in another table
C) Position
D) Insertion order

**42.** A primary key:
A) Is the first column
B) Uniquely identifies each row in a table; it is non-null and unique
C) Is decorative
D) Is the same as an index

**43.** A foreign key:
A) Is from another database
B) References the primary key of another table, expressing a relationship between rows
C) Encrypts the row
D) Is a synonym for primary key

**44.** `NULL` in SQL:
A) Equals the empty string
B) Represents the absence of a value; comparisons with `=` against `NULL` return unknown, not true — use `IS NULL` or `IS NOT NULL`
C) Equals zero
D) Equals `false`

**45.** A query that filters by a column with no index on it:
A) Always succeeds quickly
B) May require a full table scan, which is fine for small tables but very slow at scale
C) Will fail
D) Is the same speed as an indexed query

---

## Section D — Data Structures and Basic Algorithms (Q46–Q55)

**46.** An array (or list):
A) Has O(1) random access by index, but inserting or removing in the middle is O(n)
B) Has O(1) insert at any position
C) Has O(log n) access by index
D) Cannot store mixed types

**47.** A hash map / dictionary / object:
A) Maintains sorted order by key
B) Provides roughly O(1) average lookup, insert, and delete by key, at the cost of unordered iteration in older models
C) Is slower than an array for all operations
D) Allows duplicate keys

**48.** A set:
A) Is the same as an array
B) Stores unique values with fast membership testing — useful for deduplication and "is this value present" checks
C) Is sorted by default
D) Cannot grow

**49.** A stack follows:
A) FIFO (first in, first out)
B) LIFO (last in, first out) — like a stack of plates
C) Random order
D) Sorted order

**50.** A queue follows:
A) LIFO
B) FIFO (first in, first out) — like a line at a counter
C) Random
D) Reverse insertion order

**51.** A tree is:
A) An ordered list
B) A hierarchical structure with a root node and child nodes — useful for representing hierarchies, navigations, and certain kinds of searches
C) The same as a graph
D) Only used in databases

**52.** O(1), O(n), O(n²) in plain language:
A) Random labels
B) Constant time regardless of input size; linear time proportional to input size; quadratic time that grows as the square of input size — a quadratic algorithm with a large input is often unusable
C) Errors
D) Memory units

**53.** A nested loop iterating over the same array of size `n` is generally:
A) O(1)
B) O(n²) — twice as much input means four times as much work; this is fine for small `n` and disastrous for large `n`
C) O(n)
D) O(log n)

**54.** Choosing the right data structure first:
A) Is premature optimization
B) Is often the single largest performance and clarity win — wrong data structure dwarfs micro-optimizations
C) Is the database's job
D) Does not matter

**55.** Sorting a list of 10 items vs 10 million items:
A) Takes the same time
B) Differs enormously; algorithmic complexity matters, and at scale you also care about whether the data fits in memory
C) Is O(1) in both cases
D) Is the same as searching

---

## Section E — Error Handling and Logging (Q56–Q65)

**56.** Throwing a generic error like `throw new Error('failed')`:
A) Is best practice
B) Wastes a chance to convey useful information; meaningful messages and (where useful) error types help the caller and the on-call engineer
C) Is required
D) Is faster

**57.** Catching an error and silently ignoring it (`catch (e) {}`):
A) Is robust
B) Is one of the most dangerous habits in backend code — failures vanish, the system limps along in a broken state, and the root cause becomes invisible
C) Is required
D) Is sometimes correct in all cases

**58.** Returning errors as values (`Result`-style) versus throwing:
A) Are the same
B) Are different styles with different trade-offs; throwing is concise but can be invisible to callers, returning values forces handling but is verbose — teams should pick a consistent approach
C) Throwing is deprecated
D) Returning is for frontend only

**59.** An unhandled rejection in a Node.js promise:
A) Is silent
B) Triggers a runtime warning and, in modern Node with strict settings, can crash the process — every promise that can reject should be handled
C) Is normal
D) Is the same as a thrown error caught by try

**60.** Logging at "info" level should be:
A) Used for every variable
B) Used for events that matter operationally — startup, shutdown, significant state changes, request summaries — not for every line of code
C) Replaced with debug
D) Always disabled in production

**61.** Logging at "error" level should be:
A) Used for everything
B) Reserved for actual errors that need attention; making "everything is an error" desensitizes responders to real problems
C) Disabled
D) Used for warnings

**62.** Logging passwords, tokens, or full credit card numbers:
A) Is acceptable internally
B) Is a recurring source of breaches — scrub, redact, or omit sensitive data before logging, regardless of where the logs go
C) Is required for debugging
D) Is encrypted automatically

**63.** Structured logging (JSON with fields) versus free-form strings:
A) They are equivalent
B) Structured logs are vastly easier to search, filter, and aggregate in any modern log system — small upfront cost, huge operational payoff
C) Structured logs are slower
D) Free-form is more searchable

**64.** Including a request ID or correlation ID in every log line:
A) Is overkill
B) Lets you trace a single request across services and logs — almost universally worth doing in any non-trivial system
C) Is automatic
D) Replaces tracing

**65.** When an error occurs in an async handler, the response to the client should generally:
A) Crash silently
B) Return an appropriate HTTP status code (typically 4xx for client errors, 5xx for server errors) with a message safe to expose, while logging the full detail server-side
C) Echo the stack trace
D) Always return 200 to be safe

---

## Section F — Git and the Command Line (Q66–Q75)

**66.** `git status` shows:
A) Commit history
B) The state of the working directory and staging area relative to the last commit
C) Remote branches only
D) Conflicts only

**67.** `git add` does:
A) Commits a file
B) Stages the current version of a file to be included in the next commit
C) Pushes the file
D) Removes the file

**68.** A merge conflict happens when:
A) Two branches change unrelated files
B) Two branches change the same lines of the same file in incompatible ways, and Git cannot decide which version to keep
C) The remote rejects a push
D) The branch is behind

**69.** A `.gitignore` file:
A) Hides files from the OS
B) Tells Git which files and patterns to exclude from version control — essential for build artifacts, `node_modules`, and secrets
C) Encrypts files
D) Deletes files

**70.** A good commit message:
A) Just says "fix"
B) Summarizes the change clearly in a short subject line and, when needed, explains the why in the body
C) Includes the full diff
D) Is the file name

**71.** Pushing directly to `main` in a shared repo:
A) Is standard
B) Is generally discouraged — work should go through branches and pull requests for review and CI
C) Is required
D) Is the same as merging

**72.** `ls` and `cd` in the shell:
A) Are Windows-only
B) List the contents of a directory and change the current working directory, respectively
C) Are the same command
D) Are deprecated

**73.** Piping output with `|`:
A) Redirects output to a file
B) Sends the output of one command as the input to the next, enabling composition (e.g., `grep error app.log | wc -l`)
C) Comments the line
D) Is the same as `>`

**74.** `>` versus `>>` for redirection:
A) Are identical
B) `>` overwrites the target file; `>>` appends to it
C) `>>` is faster
D) `>` is deprecated

**75.** Environment variables (e.g., `process.env.DATABASE_URL`):
A) Are stored in the codebase
B) Are runtime configuration values, often supplied by the host or a secrets manager, used to keep secrets and per-environment settings out of source code
C) Are constants in code
D) Are for testing only

---

## Section G — Engineering Habits (Q76–Q90)

**76.** Time-boxing when stuck on a problem (for example, 30–60 minutes before asking) is:
A) A sign of weakness
B) A healthy default — long enough to try seriously, short enough not to burn a day; juniors who never ask and juniors who ask immediately both fail differently
C) Required to be 4 hours
D) For seniors only

**77.** When asking for help, including what you tried and what you observed:
A) Wastes the helper's time
B) Respects the helper's time and produces better answers — "this fails with X when I do Y, and I have tried Z" is far more useful than "this doesn't work"
C) Is unnecessary detail
D) Should be private

**78.** A reproducible bug report contains:
A) "It is broken"
B) Steps to reproduce, expected behavior, actual behavior, environment details, and any error messages — without these, the receiver has to redo your investigation
C) A screenshot only
D) Your guess at the cause

**79.** Reading error messages before searching them:
A) Is for seniors
B) Is the first step — most errors tell you exactly what is wrong if you read carefully; searching without reading often leads to the wrong fix
C) Is unnecessary
D) Wastes time

**80.** Copy-pasting code from Stack Overflow or AI tools without understanding it:
A) Is fine if it works
B) Is risky — even when it works, you have not learned anything and may have introduced bugs or security holes you cannot debug later
C) Is required for speed
D) Is encouraged

**81.** Saying "I do not know" when you do not know:
A) Damages your credibility
B) Builds it — confident guessing produces wrong code that hurts the team; the respected move is "I do not know, let me find out"
C) Is for juniors only
D) Should be avoided

**82.** A PR description should include:
A) The diff repeated
B) What the change does, why, how to test it, and any risk — and if it is non-trivial, screenshots or curl examples help
C) Nothing
D) The ticket number alone

**83.** Pushing untested code to production on a Friday:
A) Is bold
B) Is a common cause of weekend incidents and a habit to avoid; if the change is risky, ship Monday
C) Is the norm
D) Is required by some teams

**84.** Reviewing other people's code as a junior:
A) Is presumptuous
B) Is a normal part of the work — ask clarifying questions, point to anything that looks off, and treat it as a learning opportunity
C) Is the senior's job alone
D) Should be limited to typos

**85.** A teammate writes code differently than you would:
A) Insist on your way
B) Ask why they chose that approach — there is often a reason, and even when there is not, the conversation is more useful than a fight
C) Rewrite it
D) Complain in chat

**86.** Reading the codebase before adding to it:
A) Is unnecessary
B) Is one of the highest-leverage habits a junior can build — patterns, conventions, and "the way we do things here" matter, and code that fits is far easier to land
C) Is for architects
D) Slows you down

**87.** Estimating a task as a junior:
A) Promise the smallest number to look fast
B) Think through what is actually involved, give a range, flag uncertainty, and update as you learn
C) Refuse to estimate
D) Match whatever the senior says

**88.** A failed CI build on your PR:
A) Re-run it and hope
B) Read the failure, understand what broke, fix it — re-running a failing test until it passes by chance is a habit that hides real problems
C) Ask a senior to fix
D) Merge anyway

**89.** Breaking down a large task into smaller chunks before starting:
A) Wastes time
B) Almost always reveals hidden work, missing decisions, and dependency surprises before you waste days on the wrong path
C) Is for managers
D) Is required by tooling

**90.** Curiosity — asking why something works, reading other people's code, treating bugs as chances to understand the system — is:
A) A junior phase
B) The single most reliable predictor of growth in this career; engineers who lose it stall, and engineers who keep it become great
C) Distracting
D) Replaceable with experience

---

## Section H — Basic Security Awareness (Q91–Q100)

**91.** Never trust user input means:
A) Refuse to accept input
B) Validate, sanitize, and authorize every input from outside your system — attackers will probe everywhere you forget to check
C) Use only HTTPS
D) Encrypt all input

**92.** SQL injection happens when:
A) The database is down
B) User input is concatenated into a SQL query, allowing the attacker to alter the query's structure — defended by parameterized queries (prepared statements)
C) Indexes are missing
D) The query is too long

**93.** A parameterized query (prepared statement):
A) Slows the database
B) Passes user values as separate parameters so they cannot change the query's structure — the primary defense against SQL injection
C) Is the same as concatenation
D) Is for read queries only

**94.** Passwords stored in a database should be:
A) Plaintext
B) Hashed with a slow, salted, modern algorithm (bcrypt, argon2, scrypt) — never plaintext, never with general-purpose hashes like MD5 or SHA-1, never encrypted-and-decryptable
C) Encrypted symmetrically
D) Reversibly encoded

**95.** Secrets (API keys, database passwords, signing keys) in source code:
A) Are fine in private repos
B) Are never acceptable in source — they leak through history, forks, mistakes, and ex-employees; use a secrets manager and environment-injected config
C) Should be base64 encoded
D) Should be encrypted then committed

**96.** A `.env` file with secrets:
A) Should be committed
B) Should be in `.gitignore` and never committed; share secrets through a secrets manager or a controlled channel, not the repo
C) Is automatically secret
D) Should be in `node_modules`

**97.** "Principle of least privilege" means:
A) Give everyone admin to be safe
B) Each component, user, and key gets only the permissions it needs and no more — limits the damage of any single compromise
C) Disable security
D) Only seniors have permissions

**98.** Authentication versus authorization:
A) Are the same
B) Authentication is "who are you" (verifying identity); authorization is "what can you do" (checking permissions); confusing them produces real security holes
C) Authentication is harder
D) Authorization is for admins only

**99.** Rolling your own cryptography (writing your own encryption, hashing, or signing scheme):
A) Is encouraged
B) Is almost always a mistake — even careful experts get it wrong; use battle-tested libraries and follow standards
C) Is required for security
D) Is faster

**100.** Production data on a developer's laptop:
A) Is convenient
B) Is a liability — real customer data should not be downloaded casually; use anonymized fixtures, scrubbed snapshots, or read-only access with auditing instead
C) Is the norm
D) Is automatically encrypted

---

## Answer Key

1.B  2.B  3.B  4.B  5.B  6.B  7.B  8.B  9.B  10.B
11.B  12.B  13.B  14.B  15.B  16.B  17.B  18.B  19.B  20.B
21.B  22.B  23.B  24.B  25.B  26.B  27.B  28.B  29.B  30.B
31.B  32.B  33.B  34.B  35.B  36.B  37.B  38.B  39.B  40.B
41.B  42.B  43.B  44.B  45.B  46.A  47.B  48.B  49.B  50.B
51.B  52.B  53.B  54.B  55.B  56.B  57.B  58.B  59.B  60.B
61.B  62.B  63.B  64.B  65.B  66.B  67.B  68.B  69.B  70.B
71.B  72.B  73.B  74.B  75.B  76.B  77.B  78.B  79.B  80.B
81.B  82.B  83.B  84.B  85.B  86.B  87.B  88.B  89.B  90.B
91.B  92.B  93.B  94.B  95.B  96.B  97.B  98.B  99.B  100.B

**Passing threshold: 89 / 100**
