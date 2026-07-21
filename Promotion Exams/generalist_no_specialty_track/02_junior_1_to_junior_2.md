# Promotion Exam 02 — Junior Engineer 1 → Junior Engineer 2

**Format:** 100 multiple-choice questions, one correct answer each.
**Time limit (suggested):** 120 minutes.
**Passing score:** 89 / 100.
**Scope:** Intermediate JavaScript/TypeScript, asynchronous code, the DOM and events, intro to a UI framework (React) and a server framework (Express/Node), more SQL, HTTP and REST consumption, basic testing, basic security awareness, professional habits. The bar here is "can be trusted to build a small feature end-to-end with light review."

---

## Section A — Intermediate JavaScript / TypeScript (Q1–Q25)

**Q1.** What is the output of `[1, 2, 3].map(x => x * 2)`?
A) `[1, 2, 3]`
B) `[2, 4, 6]`
C) `6`
D) `undefined`

**Q2.** What does `Array.prototype.filter` return?
A) The first matching element
B) A boolean
C) A new array containing elements for which the callback returned truthy
D) The original array, mutated

**Q3.** What is the difference between `Array.prototype.forEach` and `Array.prototype.map`?
A) They are identical
B) `forEach` returns a new array; `map` does not
C) `map` returns a new array; `forEach` returns `undefined`
D) `forEach` is faster than `map`

**Q4.** Which of these correctly destructures `name` from an object `user`?
A) `const name = user[name]`
B) `const { name } = user`
C) `const [name] = user`
D) `const name => user.name`

**Q5.** What is a "closure"?
A) A function that returns nothing
B) A function that retains access to variables from the scope in which it was defined, even after that scope has finished executing
C) A function that runs only once
D) A function with no parameters

**Q6.** What is the value of `this` inside an arrow function?
A) The arrow function's own `this`
B) The `this` of the enclosing lexical scope
C) Always `undefined`
D) Always `window`

**Q7.** What is the difference between `let` and `var`?
A) None
B) `let` is block-scoped; `var` is function-scoped and hoisted as `undefined`
C) `var` is block-scoped; `let` is global
D) `let` cannot be reassigned

**Q8.** What is the output of:
```js
const obj = { a: 1 };
const copy = { ...obj, a: 2 };
console.log(obj.a, copy.a);
```
A) `1 1`
B) `2 2`
C) `1 2`
D) `2 1`

**Q9.** Which method converts a JSON string into a JavaScript object?
A) `JSON.stringify`
B) `JSON.parse`
C) `Object.fromJSON`
D) `JSON.toObject`

**Q10.** Which of the following best describes TypeScript?
A) A JavaScript runtime
B) A statically typed superset of JavaScript that compiles to JavaScript
C) A bundler
D) A linter

**Q11.** What does the TypeScript type `unknown` mean?
A) Same as `any`
B) A safer counterpart to `any` that requires type narrowing before use
C) A primitive type
D) Equivalent to `void`

**Q12.** What is the result of `Object.keys({ a: 1, b: 2 })`?
A) `[1, 2]`
B) `["a", "b"]`
C) `{a: 1, b: 2}`
D) `"a,b"`

**Q13.** Which method removes the last element of an array and returns it?
A) `shift`
B) `pop`
C) `slice`
D) `splice`

**Q14.** What is "hoisting"?
A) Lifting an element in the DOM
B) The JavaScript behavior of moving declarations to the top of their scope before execution
C) A performance optimization for loops
D) A type of memory leak

**Q15.** Which of these is a *pure function*?
A) A function that depends only on its inputs and produces no side effects
B) A function that uses `console.log`
C) A function with no parameters
D) A function that modifies a global variable

**Q16.** What does `Array.prototype.reduce` do?
A) Removes elements from an array
B) Reduces an array to a single value by applying a reducer function
C) Returns the smallest value
D) Sorts the array

**Q17.** In TypeScript, what is the difference between `interface` and `type`?
A) They are completely different and not interchangeable
B) Both describe shapes; `interface` is extendable via declaration merging, `type` supports unions and intersections more naturally
C) `type` is only for primitives
D) `interface` is only for classes

**Q18.** What is the output of `typeof NaN`?
A) `"NaN"`
B) `"undefined"`
C) `"number"`
D) `"null"`

**Q19.** Which of these correctly checks if `value` is `NaN`?
A) `value == NaN`
B) `value === NaN`
C) `Number.isNaN(value)`
D) `value.isNaN()`

**Q20.** What is the result of `[...new Set([1, 2, 2, 3])]`?
A) `[1, 2, 2, 3]`
B) `[1, 2, 3]`
C) `Set(3)`
D) `[2]`

**Q21.** What does `Object.freeze(obj)` do?
A) Pauses the JavaScript runtime
B) Makes the object's properties immutable (shallow)
C) Deep-clones the object
D) Removes the object's prototype

**Q22.** In TypeScript, which type allows a variable to be a string *or* a number?
A) `string & number`
B) `string | number`
C) `any`
D) `union`

**Q23.** What is the result of `"abc".length`?
A) `2`
B) `3`
C) `4`
D) `undefined`

**Q24.** Which TypeScript utility type makes all properties of `T` optional?
A) `Required<T>`
B) `Partial<T>`
C) `Readonly<T>`
D) `Pick<T>`

**Q25.** What does the spread operator `...` do in `function fn(...args)`?
A) Calls the function recursively
B) Collects all remaining arguments into an array called `args`
C) Stops the function
D) Returns the first argument

---

## Section B — Asynchronous Programming (Q26–Q40)

**Q26.** What is a `Promise` in JavaScript?
A) A guaranteed value
B) An object representing the eventual completion or failure of an asynchronous operation
C) A synchronous callback
D) A type of class

**Q27.** What are the three states of a Promise?
A) `started`, `running`, `finished`
B) `pending`, `fulfilled`, `rejected`
C) `open`, `closed`, `errored`
D) `init`, `ok`, `fail`

**Q28.** What does `async` in front of a function declaration do?
A) Runs the function in a separate thread
B) Makes the function automatically return a Promise
C) Makes the function synchronous
D) Schedules the function for later

**Q29.** What does the `await` keyword do?
A) Blocks the entire program
B) Pauses execution inside an `async` function until the awaited Promise settles
C) Cancels a Promise
D) Converts a Promise into a callback

**Q30.** Which is the correct way to handle errors in an `async` function?
A) `try { await something() } catch (err) { ... }`
B) `await something().error(err => ...)`
C) `async { ... } catch { ... }`
D) Errors cannot be caught in async functions

**Q31.** What does `Promise.all([p1, p2])` resolve to?
A) The first resolved Promise
B) An array of resolved values, or rejects with the first rejection
C) The last resolved Promise
D) Always `undefined`

**Q32.** When should you prefer `Promise.allSettled` over `Promise.all`?
A) Never; they are identical
B) When you want results from *all* Promises regardless of individual failures
C) When you want only the first to resolve
D) When you have exactly two Promises

**Q33.** What is a "callback hell"?
A) A bug in Node.js
B) Deeply nested callbacks that make code hard to read and maintain
C) A debugger feature
D) A type of error

**Q34.** Which of these is *not* a Promise method?
A) `.then`
B) `.catch`
C) `.finally`
D) `.await`

**Q35.** Is JavaScript single-threaded or multi-threaded by default in the browser?
A) Multi-threaded
B) Single-threaded with an event loop
C) Process-based
D) Depends on the OS

**Q36.** What is the "event loop"?
A) A `for` loop that listens to events
B) The runtime mechanism that schedules tasks, microtasks, and callbacks
C) A DOM API
D) An npm package

**Q37.** Which of these runs *first* if scheduled at the same tick?
A) `setTimeout(..., 0)`
B) A resolved Promise's `.then`
C) A `for` loop iteration
D) `setInterval`

**Q38.** What is the output of:
```js
console.log(1);
setTimeout(() => console.log(2), 0);
Promise.resolve().then(() => console.log(3));
console.log(4);
```
A) `1 2 3 4`
B) `1 4 3 2`
C) `1 3 4 2`
D) `4 3 2 1`

**Q39.** What does `fetch` return?
A) A string
B) A Promise that resolves to a `Response` object
C) The response body directly
D) A callback

**Q40.** How do you get JSON data from a `fetch` response?
A) `response.body`
B) `await response.json()`
C) `JSON.parse(response)`
D) `response.toJSON()`

---

## Section C — DOM, Events, and Browser APIs (Q41–Q55)

**Q41.** Which method adds a click handler to an element in vanilla JS?
A) `element.click(fn)`
B) `element.addEventListener("click", fn)`
C) `element.onclick = fn` (also valid, but limited to one handler)
D) Both B and C are valid

**Q42.** What is the difference between event "capturing" and "bubbling"?
A) Capturing happens after bubbling
B) Capturing flows from the root down to the target; bubbling flows from the target back up
C) They are the same
D) Only bubbling exists in modern browsers

**Q43.** What does `event.stopPropagation()` do?
A) Stops the default browser action
B) Prevents the event from continuing to bubble or capture further
C) Removes the listener
D) Reloads the page

**Q44.** Which API persists data on the user's browser across sessions until manually cleared?
A) `sessionStorage`
B) `localStorage`
C) `cookies` (with no expiry)
D) Both B and C

**Q45.** What is the storage limit of `localStorage` typically?
A) Around 5–10 MB per origin (browser-dependent)
B) 1 GB
C) Unlimited
D) 100 KB

**Q46.** Which API is appropriate for real-time bidirectional communication with a server?
A) `fetch`
B) `XMLHttpRequest`
C) WebSockets
D) `localStorage`

**Q47.** What is "CORS"?
A) Cross-Origin Resource Sharing — a mechanism that lets servers indicate which origins may access their resources
B) A CSS specification
C) A JavaScript engine
D) A type of cookie

**Q48.** Which header is used by the browser to indicate the origin of a cross-origin request?
A) `Referer`
B) `Origin`
C) `Host`
D) `From`

**Q49.** Which header from the server enables a cross-origin request to succeed?
A) `Access-Control-Allow-Origin`
B) `Allow-CORS`
C) `Cross-Origin-Header`
D) `Access-Origin`

**Q50.** What is the difference between `sessionStorage` and `localStorage`?
A) `sessionStorage` persists across tabs; `localStorage` does not
B) `sessionStorage` clears when the tab closes; `localStorage` persists until cleared
C) They are identical
D) Only `localStorage` can store strings

**Q51.** Which selector returns *all* matching elements as a NodeList?
A) `document.getElementById`
B) `document.querySelector`
C) `document.querySelectorAll`
D) `document.find`

**Q52.** What does the DOM represent?
A) A list of CSS classes
B) The structured, tree-based representation of the HTML document
C) The compiled JavaScript
D) The network response

**Q53.** Which method creates a new HTML element in JavaScript?
A) `document.create("div")`
B) `document.createElement("div")`
C) `new HTMLElement("div")`
D) `document.newElement("div")`

**Q54.** What is a "memory leak" in the context of the DOM?
A) Running out of disk space
B) Holding references to DOM nodes or event listeners that prevent garbage collection
C) A CSS issue
D) A network error

**Q55.** Which API is used to manipulate the browser history without a full page reload?
A) `window.location`
B) `history.pushState`
C) `document.write`
D) `navigator.go`

---

## Section D — Intro to React (Q56–Q70)

**Q56.** What is JSX?
A) A JavaScript engine
B) A syntax extension that lets you write HTML-like markup inside JavaScript
C) A CSS preprocessor
D) A bundler

**Q57.** What does this React component return when rendered with `name="Alip"`?
```jsx
function Hello({ name }) {
  return <h1>Hello, {name}!</h1>;
}
```
A) `Hello, name!`
B) `Hello, Alip!`
C) An error
D) `Hello, {name}!`

**Q58.** Which React hook manages local component state?
A) `useEffect`
B) `useState`
C) `useMemo`
D) `useRef`

**Q59.** Which React hook runs side effects after render?
A) `useState`
B) `useEffect`
C) `useReducer`
D) `useCallback`

**Q60.** What does the `key` prop do in a list of React elements?
A) Encrypts the element
B) Helps React identify which items changed, are added, or are removed
C) Sets the CSS class
D) Sets the HTML id

**Q61.** Which is the recommended way to update state based on the previous state?
A) `setCount(count + 1)`
B) `setCount(prev => prev + 1)`
C) `count = count + 1`
D) `useState.update(count + 1)`

**Q62.** What is a "controlled component" in React?
A) A component wrapped in a context
B) A form input whose value is controlled by React state
C) A component with no props
D) A component that uses class syntax

**Q63.** Which of these is *true* about React props?
A) Props are mutable inside the component
B) Props are read-only inside the component
C) Props only accept strings
D) Props are stored in `localStorage`

**Q64.** What is the role of the dependency array in `useEffect`?
A) It tells React which other effects depend on this one
B) It controls when the effect re-runs based on changes to listed values
C) It is required to be empty
D) It sets the initial state

**Q65.** Which of these will cause an infinite re-render?
A) `useEffect(() => { setCount(count + 1); }, [])`
B) `useEffect(() => { setCount(count + 1); }, [count])`
C) `useEffect(() => { console.log("hi"); }, [])`
D) `useState(0)`

**Q66.** What is the React virtual DOM?
A) A copy of the real DOM kept in memory used to compute minimal updates
B) The same as the DOM
C) A CSS abstraction
D) A type of state management

**Q67.** Which of these is the *correct* way to conditionally render in JSX?
A) `if (cond) <Component />`
B) `{cond && <Component />}`
C) `cond ? <Component /> else <Other />`
D) `<if cond><Component /></if>`

**Q68.** Which hook would you use to memoize an expensive computed value?
A) `useState`
B) `useEffect`
C) `useMemo`
D) `useRef`

**Q69.** What does `useRef` typically *not* do?
A) Hold a mutable value that does not trigger re-renders
B) Reference a DOM element
C) Trigger a re-render when its `.current` changes
D) Persist a value across renders

**Q70.** Which of these is the *correct* way to lift state up in React?
A) Move shared state to the closest common parent and pass it down via props
B) Use `window` to share state
C) Duplicate state in both siblings
D) Use a global variable

---

## Section E — Node, Express, HTTP, and REST (Q71–Q85)

**Q71.** What is Node.js?
A) A browser
B) A JavaScript runtime built on the V8 engine
C) A frontend framework
D) A database

**Q72.** Which file lists Node project dependencies and scripts?
A) `package.json`
B) `node.config.js`
C) `dependencies.txt`
D) `npm.lock`

**Q73.** Which command installs all dependencies listed in `package.json`?
A) `npm get`
B) `npm install`
C) `npm restore`
D) `npm fetch`

**Q74.** What is the difference between `dependencies` and `devDependencies`?
A) None
B) `dependencies` are needed in production; `devDependencies` are needed only during development
C) `devDependencies` are installed first
D) `devDependencies` are for global packages

**Q75.** In Express, which method registers a handler for `GET /users`?
A) `app.get("/users", handler)`
B) `app.route("get", "/users", handler)`
C) `app.handle("GET", "/users", handler)`
D) `app.use("GET /users", handler)`

**Q76.** What is "middleware" in Express?
A) A type of database
B) A function with access to the request, response, and `next`, which can modify them or end the cycle
C) A frontend component
D) A reverse proxy

**Q77.** Which HTTP status code is most appropriate when a client sends invalid input?
A) 200
B) 400
C) 404
D) 500

**Q78.** Which HTTP status code is most appropriate when the user is not authenticated?
A) 400
B) 401
C) 403
D) 500

**Q79.** What is the difference between `401 Unauthorized` and `403 Forbidden`?
A) They are the same
B) `401` means not authenticated; `403` means authenticated but not allowed
C) `403` means not authenticated
D) Only `401` is for APIs

**Q80.** Which HTTP method should be used to fully replace a resource?
A) PATCH
B) PUT
C) POST
D) GET

**Q81.** Which HTTP method should be used to partially update a resource?
A) PATCH
B) PUT
C) POST
D) GET

**Q82.** Which header carries the bearer token in most modern APIs?
A) `Auth`
B) `Authorization: Bearer <token>`
C) `Token`
D) `X-Auth`

**Q83.** What is the typical response body format used by modern REST APIs?
A) XML
B) JSON
C) HTML
D) CSV

**Q84.** What does it mean for an HTTP method to be "idempotent"?
A) It is always cached
B) Calling it multiple times has the same effect as calling it once
C) It always returns 200
D) It is only used for reading

**Q85.** Which is true about REST?
A) REST is a protocol
B) REST is an architectural style centered on resources identified by URLs and standard HTTP verbs
C) REST requires GraphQL
D) REST is the same as SOAP

---

## Section F — SQL, Testing, Security Basics, and Habits (Q86–Q100)

**Q86.** Which SQL clause groups rows that have the same values?
A) `ORDER BY`
B) `GROUP BY`
C) `PARTITION BY`
D) `CLUSTER BY`

**Q87.** What does the SQL `JOIN` `INNER` return?
A) All rows from both tables
B) Only rows where the join condition matches in both tables
C) All rows from the left table
D) All rows from the right table

**Q88.** What does `LEFT JOIN` return?
A) Only matching rows
B) All rows from the left table plus matched rows from the right (NULL if no match)
C) Only rows from the right table
D) An error if no match exists

**Q89.** What is SQL injection?
A) A SQL performance technique
B) A security vulnerability where untrusted input is concatenated into a SQL query, allowing attackers to alter the query
C) A type of index
D) A backup strategy

**Q90.** Which is the best defense against SQL injection?
A) Validating only on the frontend
B) Using parameterized queries / prepared statements
C) Replacing single quotes manually
D) Using stored procedures only

**Q91.** What does a unit test verify?
A) The entire system end-to-end
B) The smallest testable piece of code (usually a function) in isolation
C) Network latency
D) Database performance

**Q92.** Which of these is a common JavaScript testing framework?
A) Jest
B) Vitest
C) Mocha
D) All of the above

**Q93.** What does "test coverage" measure?
A) The number of bugs
B) The percentage of code executed by the test suite
C) The runtime of the tests
D) The number of test files

**Q94.** Is 100% test coverage a guarantee of bug-free code?
A) Yes
B) No — coverage measures execution, not correctness or all input scenarios
C) Only with TypeScript
D) Only in Python

**Q95.** What is XSS (Cross-Site Scripting)?
A) A network protocol
B) A vulnerability where attackers inject scripts that run in users' browsers
C) A CSS feature
D) A way to share sessions

**Q96.** Which is a good defense against XSS?
A) Trusting all user input
B) Properly escaping/encoding output and avoiding `innerHTML` with untrusted data
C) Using `eval`
D) Disabling JavaScript

**Q97.** What is CSRF (Cross-Site Request Forgery)?
A) A spoofing attack where a malicious site tricks the user's browser into making requests to another site where they are authenticated
B) A way to steal cookies via script
C) The same as XSS
D) A type of SQL injection

**Q98.** Which of these is the most appropriate behavior when reviewing a teammate's PR?
A) Approve quickly without reading
B) Read the diff, understand intent, leave constructive and specific comments
C) Reject everything to be safe
D) Only check for typos

**Q99.** What is a commit message anti-pattern?
A) Imperative mood, concise, with a clear "why"
B) `fix`, `wip`, `final final v2`
C) Referencing a ticket number
D) Following the team's convention

**Q100.** Which behavior best demonstrates ownership at the Junior 2 level?
A) Only doing exactly what is in the ticket and nothing more
B) Driving a small task end-to-end, including writing tests, documenting it, and asking the right questions when blocked
C) Waiting for instructions on every step
D) Refusing to work outside one's specialty

---

## Answer Key

1.B  2.C  3.C  4.B  5.B  6.B  7.B  8.C  9.B  10.B
11.B  12.B  13.B  14.B  15.A  16.B  17.B  18.C  19.C  20.B
21.B  22.B  23.B  24.B  25.B  26.B  27.B  28.B  29.B  30.A
31.B  32.B  33.B  34.D  35.B  36.B  37.B  38.B  39.B  40.B
41.D  42.B  43.B  44.D  45.A  46.C  47.A  48.B  49.A  50.B
51.C  52.B  53.B  54.B  55.B  56.B  57.B  58.B  59.B  60.B
61.B  62.B  63.B  64.B  65.B  66.A  67.B  68.C  69.C  70.A
71.B  72.A  73.B  74.B  75.A  76.B  77.B  78.B  79.B  80.B
81.A  82.B  83.B  84.B  85.B  86.B  87.B  88.B  89.B  90.B
91.B  92.D  93.B  94.B  95.B  96.B  97.A  98.B  99.B  100.B

**Passing threshold: 89 / 100.**
