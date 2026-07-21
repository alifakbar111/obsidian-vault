# Promotion Exam: Intern → Junior Frontend Engineer 1

**Track:** Frontend Engineer (Specialist)
**Format:** 100 multiple-choice questions
**Time:** 120 minutes
**Passing score:** 89 / 100

**Scope.** This exam evaluates whether an intern has the foundation to be hired as a Junior Frontend Engineer 1. Because the company's career ladder branches into specialist tracks at the early levels, this exam is focused on the frontend-specific skills a new junior must have on day one: HTML, CSS, JavaScript fundamentals, the DOM and browser model, basic Git, and the engineering habits that determine whether a junior will grow or stall. There is no SQL, no backend, and only awareness-level coverage of tooling — those broaden into the role as the engineer climbs the ladder.

**A note on the bar.** "Junior 1" does not mean "knows nothing." It means "can be trusted with a small, scoped frontend task, with supervision, and will not break things in ways the team cannot recover from." The 89/100 threshold reflects that. An engineer who fails the basics here will struggle in code review and slow the team down.

---

## Section A — HTML Fundamentals (Q1–Q15)

**1.** The purpose of semantic HTML is primarily:
A) To make pages render faster
B) To give meaning to content so that browsers, screen readers, and search engines can interpret it correctly
C) To reduce file size
D) To replace CSS

**2.** Which element best represents a self-contained piece of content like a blog post?
A) `<div>`
B) `<section>`
C) `<article>`
D) `<aside>`

**3.** A `<div>` should be used when:
A) Wrapping any content
B) No other more semantic element fits the meaning of the content
C) The content is not visible
D) The content is text-only

**4.** The `alt` attribute on an `<img>`:
A) Is optional and rarely useful
B) Describes the image for users who cannot see it, including screen-reader users and users with broken image loading
C) Is required by browsers to render the image
D) Only matters for SEO

**5.** A decorative image that adds no meaning should have:
A) A descriptive `alt` text
B) An empty `alt=""` so assistive technology can skip it
C) No `alt` attribute at all
D) `alt="decoration"`

**6.** Heading levels (`<h1>` through `<h6>`) should be used:
A) Based on visual size you want
B) To express document hierarchy in order, without skipping levels arbitrarily
C) Only `<h1>` matters; the rest are styling
D) From `<h6>` to `<h1>` for SEO

**7.** A `<label>` is associated with a form input by:
A) Placing them near each other
B) Using `for="inputId"` matching the input's `id`, or wrapping the input inside the label
C) The browser figures it out
D) Using a CSS class

**8.** A `<button>` should be used instead of a `<div>` with a click handler because:
A) Buttons look better
B) Buttons are keyboard-focusable, announce themselves as buttons to screen readers, and respond to Enter and Space by default
C) Buttons are faster
D) `<div>` cannot have click handlers

**9.** A `<button>` inside a `<form>` defaults to type:
A) `button`
B) `submit`
C) `reset`
D) There is no default

**10.** To prevent a form's default submission (page reload) in JavaScript, you call:
A) `event.stopPropagation()`
B) `event.preventDefault()`
C) `return false` in all cases
D) `event.cancel()`

**11.** `<ul>` versus `<ol>`:
A) `<ul>` is for unordered (bulleted) lists; `<ol>` is for ordered (numbered) lists
B) They are visually identical
C) `<ul>` is older
D) `<ol>` is for outlines only

**12.** The `<meta name="viewport" content="width=device-width, initial-scale=1">` tag is for:
A) SEO
B) Telling the browser how to scale the page on mobile devices
C) Setting the page title
D) Setting the character encoding

**13.** The `<!DOCTYPE html>` declaration tells the browser:
A) The page is HTML
B) To render in standards mode rather than quirks mode
C) The HTML version
D) The page is mobile-friendly

**14.** Inline elements versus block elements:
A) Inline elements flow within text; block elements take the full available width and start on a new line by default
B) They render the same
C) Inline is faster
D) Block elements cannot have margins

**15.** An accessible form requires, at minimum:
A) Pretty styling
B) Each input has an associated label, errors are programmatically connected to their inputs, and the form is keyboard navigable
C) JavaScript validation
D) Tab indices set on every field

---

## Section B — CSS Fundamentals (Q16–Q30)

**16.** The CSS box model consists of:
A) Width and height only
B) Content, padding, border, and margin
C) Display and position
D) Box and shadow

**17.** `box-sizing: border-box` changes the box model so that:
A) Padding and border are included in the declared width and height, rather than added to them
B) Margin is included in the width
C) Width becomes a max-width
D) Box becomes flexible

**18.** Specificity from lowest to highest is roughly:
A) Element < class < ID < inline style
B) Inline < ID < class < element
C) They are all equal
D) Class < ID < element < inline

**19.** `!important` should be:
A) Used freely to win specificity battles
B) Avoided except as a last resort, because it makes the cascade hard to reason about
C) Used on all rules to be safe
D) Required by linters

**20.** Flexbox is designed primarily for:
A) Two-dimensional layout
B) One-dimensional layout (a row or a column) where items align and distribute along a single axis
C) Animations
D) Replacing tables

**21.** In Flexbox, `justify-content` controls alignment along:
A) The cross axis
B) The main axis
C) Both axes
D) Neither

**22.** CSS Grid is designed primarily for:
A) One-dimensional layout
B) Two-dimensional layout where rows and columns matter together
C) Replacing Flexbox
D) Animation

**23.** `position: absolute` positions an element relative to:
A) The viewport
B) Its nearest positioned ancestor (an ancestor with `position` other than `static`), or the initial containing block if none exists
C) Its parent always
D) The document body

**24.** `position: fixed` positions an element relative to:
A) Its parent
B) The viewport, so it stays in place when the page scrolls
C) The body
D) The document

**25.** `:hover` is a:
A) Pseudo-element
B) Pseudo-class
C) Combinator
D) Property

**26.** `::before` is a:
A) Pseudo-class
B) Pseudo-element
C) Selector
D) Function

**27.** `rem` units are sized relative to:
A) The parent element's font size
B) The root element's font size
C) The viewport width
D) The pixel grid

**28.** `em` units are sized relative to:
A) The parent element's font size
B) The root element's font size
C) The viewport
D) The screen

**29.** CSS custom properties (variables) are declared like:
A) `var --primary: blue;`
B) `--primary: blue;` and used as `var(--primary)`
C) `$primary: blue;`
D) `@primary blue;`

**30.** A media query for screens narrower than 768px is:
A) `@media (max-width: 768px) { ... }`
B) `@media screen < 768 { ... }`
C) `@screen 768 { ... }`
D) `@width: 768px;`

---

## Section C — JavaScript Fundamentals (Q31–Q50)

**31.** `let` and `const` differ from `var` primarily in:
A) Performance
B) Scope — they are block-scoped, while `var` is function-scoped — and they are not hoisted in the same way
C) Syntax only
D) `var` is newer

**32.** `const` means:
A) The variable cannot be reassigned, though if it holds an object the object's contents can still change
B) The value is frozen completely
C) The value is immutable
D) Same as `let` with extra typing

**33.** `==` versus `===`:
A) `==` checks value, `===` checks reference
B) `==` performs type coercion, `===` checks both value and type with no coercion
C) They are identical
D) `===` is faster

**34.** Which value is falsy in JavaScript?
A) `"0"`
B) `[]`
C) `0`
D) `{}`

**35.** The result of `typeof null` is:
A) `"null"`
B) `"object"`
C) `"undefined"`
D) `"boolean"`

**36.** Arrow functions differ from regular functions primarily in:
A) Syntax only
B) `this` binding — arrows do not have their own `this`; they inherit it from the surrounding scope
C) Performance
D) They cannot return values

**37.** `Array.prototype.map` returns:
A) The same array, mutated
B) A new array with the same length, where each element is the result of the callback
C) A single value
D) Undefined

**38.** `Array.prototype.filter` returns:
A) A boolean
B) A new array containing only the elements for which the callback returned truthy
C) The first matching element
D) The mutated original

**39.** `Array.prototype.forEach` returns:
A) A new array
B) `undefined` — it is used for side effects, not transformation
C) The original array
D) A promise

**40.** Spread syntax `...arr` in a function call:
A) Passes the array as a single argument
B) Spreads the array's elements as individual arguments
C) Mutates the array
D) Is invalid

**41.** Destructuring `const { name, age } = user;`:
A) Mutates `user`
B) Creates local variables `name` and `age` from the properties of `user`
C) Copies `user` deeply
D) Is the same as `const name = user;`

**42.** A template literal uses:
A) Single quotes
B) Backticks, and supports `${expression}` interpolation
C) Double quotes only
D) `<%= %>` syntax

**43.** `setTimeout(fn, 1000)` will:
A) Run `fn` exactly 1000ms later
B) Schedule `fn` to run after at least 1000ms, when the call stack is clear
C) Block for 1000ms
D) Run `fn` repeatedly

**44.** `JSON.parse` is for:
A) Converting an object to a JSON string
B) Converting a JSON string into a JavaScript value
C) Validating JSON
D) Pretty-printing

**45.** `JSON.stringify` will throw or silently skip:
A) Strings
B) Functions, `undefined` values, and circular references (functions and undefined are omitted in objects; circular references throw)
C) Numbers
D) Arrays

**46.** A Promise that has settled is:
A) Always fulfilled
B) Either fulfilled or rejected — it has reached a final state
C) Always rejected
D) Cancellable

**47.** `await` can only be used inside:
A) Any function
B) An `async` function (or at the top level of a module, in modern environments)
C) A class
D) A loop

**48.** `try/catch` will catch:
A) All errors anywhere
B) Synchronous errors thrown inside the `try` block, and errors from awaited promises inside it
C) Errors from `setTimeout` callbacks automatically
D) Only network errors

**49.** A common mistake with `forEach` is:
A) Using it on arrays
B) Expecting `await` inside the callback to pause the iteration — it will not, because `forEach` does not await its callbacks
C) Returning a value
D) Using arrow functions

**50.** `NaN === NaN` evaluates to:
A) `true`
B) `false` — `NaN` is not equal to anything, including itself; use `Number.isNaN()` to check
C) `NaN`
D) `undefined`

---

## Section D — DOM and Browser Basics (Q51–Q65)

**51.** `document.querySelector('.btn')` returns:
A) All elements with class `btn`
B) The first element matching the CSS selector, or `null` if none match
C) A live HTMLCollection
D) A jQuery object

**52.** `document.querySelectorAll('.btn')` returns:
A) An array
B) A static `NodeList` of matching elements
C) A live HTMLCollection
D) The first match

**53.** `element.addEventListener('click', handler)`:
A) Replaces any existing click handler
B) Adds a handler in addition to any others already registered for that event
C) Removes other handlers
D) Runs once and then unbinds

**54.** Event bubbling means:
A) Events fire on the deepest element first, then bubble up through ancestors
B) Events fire on the document first
C) Events do not propagate
D) Events fire only on the target

**55.** `event.stopPropagation()`:
A) Prevents the default browser action
B) Stops the event from continuing to bubble up to ancestor elements
C) Removes the listener
D) Cancels the event entirely

**56.** `element.classList.toggle('open')`:
A) Adds the class
B) Adds the class if absent, removes it if present
C) Removes the class
D) Replaces all classes

**57.** `innerHTML = userInput` is dangerous because:
A) It is slow
B) It will parse and execute the input as HTML, allowing cross-site scripting if the input is not trusted
C) It does not work
D) It triggers reflows

**58.** `textContent` versus `innerHTML`:
A) They are identical
B) `textContent` sets text safely without parsing HTML; `innerHTML` parses HTML and is unsafe with untrusted input
C) `innerHTML` is safer
D) `textContent` parses HTML

**59.** `document.createElement('div')` returns:
A) A string
B) A new, detached DOM element that you can configure and then insert
C) The first `div` in the document
D) An array of divs

**60.** To read a `data-user-id="42"` attribute from an element, you would use:
A) `element.userId`
B) `element.dataset.userId`
C) `element.attributes['user-id']` only
D) `element.getAttribute('userId')`

**61.** `window` and `document` differ in that:
A) They are the same object
B) `window` is the global browser object representing the tab; `document` is the DOM tree of the current page
C) `document` is the global
D) `window` is for IE only

**62.** The `DOMContentLoaded` event fires when:
A) All images and stylesheets have loaded
B) The HTML has been parsed and the DOM is ready, before stylesheets and images may have finished
C) The page is unloaded
D) The user scrolls

**63.** The `load` event on `window` fires when:
A) The HTML is parsed
B) The page and all its dependent resources (images, stylesheets, scripts) have finished loading
C) JavaScript starts running
D) The user clicks

**64.** To listen for a value change in a text input as the user types, the most appropriate event is:
A) `change`
B) `input`
C) `keypress`
D) `blur`

**65.** A keyboard event with `event.key === 'Enter'`:
A) Only works in form fields
B) Indicates the user pressed the Enter key, regardless of the input element
C) Includes modifier state
D) Is deprecated

---

## Section E — Git and Source Control (Q66–Q75)

**66.** `git status` shows:
A) The commit log
B) The state of the working directory and staging area relative to the last commit
C) Remote branches only
D) Conflicts only

**67.** Staging a file with `git add` does what?
A) Commits it
B) Marks the current version of the file to be included in the next commit
C) Pushes it
D) Removes it

**68.** A merge conflict occurs when:
A) Two branches changed unrelated files
B) Two branches changed the same lines of the same file in incompatible ways
C) A branch is behind main
D) The remote rejects the push

**69.** A `.gitignore` file:
A) Hides files from your editor
B) Tells Git which files and patterns to exclude from version control
C) Encrypts files
D) Deletes files

**70.** A good commit message:
A) Summarizes the change in a short subject line and, when needed, explains the why in the body
B) Says "fix"
C) Includes the full diff
D) Is the file name

**71.** You accidentally committed a password to the repo. The right response is:
A) Force push and pretend it never happened
B) Treat the secret as compromised, rotate it immediately, then scrub the history and notify your team
C) Delete the file
D) Hope nobody notices

**72.** `git pull` is roughly equivalent to:
A) `git push`
B) `git fetch` followed by `git merge` (or `rebase`, depending on configuration)
C) `git clone`
D) `git commit`

**73.** Pushing directly to the `main` branch in a shared repo is generally:
A) Standard practice
B) Discouraged — work should go through branches and pull requests for review
C) Required
D) Faster

**74.** `git log` shows:
A) Pending changes
B) The history of commits reachable from the current branch
C) Remote branches
D) Stashed changes

**75.** A pull request (or merge request) exists to:
A) Slow things down
B) Provide a place for code review, automated checks, and discussion before changes merge into a shared branch
C) Track time
D) Replace email

---

## Section F — Frontend Tooling Awareness (Q76–Q85)

**76.** `npm install` does what?
A) Updates Node
B) Reads `package.json`, resolves dependencies, and installs them into `node_modules`
C) Publishes a package
D) Runs the dev server

**77.** `package.json` is:
A) A build output
B) The manifest that describes a project's metadata, dependencies, and scripts
C) Optional
D) Generated by the browser

**78.** `node_modules` should:
A) Be committed to the repo
B) Be excluded from version control via `.gitignore`; it is regenerated from `package.json` and the lockfile
C) Be edited directly
D) Be pushed to production manually

**79.** The lockfile (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`):
A) Is generated automatically and should not be touched
B) Pins exact dependency versions so installs are reproducible across machines and CI — and should be committed
C) Is for development only
D) Is unnecessary

**80.** A "dev server" like Vite or webpack-dev-server:
A) Serves the production build
B) Serves your source files with fast rebuilds, hot module replacement, and helpful error overlays during development
C) Is the same as production
D) Runs in the browser

**81.** A linter (ESLint, Biome) is primarily for:
A) Code formatting
B) Catching likely bugs and enforcing code-quality rules statically
C) Bundling code
D) Running tests

**82.** A formatter (Prettier) is primarily for:
A) Catching bugs
B) Enforcing consistent code formatting automatically, so the team stops arguing about whitespace
C) Compiling code
D) Linting types

**83.** Browser DevTools' "Elements" panel lets you:
A) See the live, current state of the DOM and CSS, including computed styles
B) Edit the source file on disk
C) Run server code
D) Modify the network response

**84.** `console.log` is useful but:
A) Should be left in production code
B) Should be removed from production code or replaced with a real logger; excessive logging can hurt performance and leak information
C) Cannot be disabled
D) Only works in Chrome

**85.** A CDN (content delivery network) is:
A) A backend database
B) A geographically distributed cache that serves static assets close to the user for speed and reliability
C) A package registry
D) A linter

---

## Section G — Engineering Habits and Mindset (Q86–Q100)

**86.** You are stuck on a problem. Healthy time-boxing is:
A) Struggle silently for a full day
B) Try yourself for a bounded window (typically 30–60 minutes for a junior), then ask for help with what you tried and what you observed
C) Ask immediately, every time
D) Wait until standup

**87.** In code review, a senior leaves a comment you disagree with. The right first move is:
A) Push back hard
B) Ask a clarifying question to make sure you understand the concern before deciding whether to disagree
C) Just change the code without responding
D) Escalate to your manager

**88.** Before asking for help, the most useful thing to prepare is:
A) An apology
B) A clear description of what you are trying to do, what you observed, and what you have already tried
C) The full code base
D) A meeting

**89.** Reading the error message:
A) Is for seniors
B) Is the first step — most error messages tell you exactly what is wrong if you read them carefully
C) Is unnecessary if you can search the error
D) Wastes time

**90.** Copy-pasting code from Stack Overflow or AI tools without understanding it is:
A) Fine if it works
B) Risky — even when it works, you have not learned anything and you may have introduced bugs or security issues you cannot debug later
C) Required for speed
D) Encouraged

**91.** A reproducible bug report needs:
A) "It is broken"
B) Steps to reproduce, expected behavior, actual behavior, environment details, and any error messages
C) A screenshot only
D) The developer's name

**92.** Your PR fails CI. The right first step is:
A) Re-run it and hope
B) Read the failure log, understand what failed, and fix it
C) Ask a senior to fix it
D) Merge anyway

**93.** Committing secrets (API keys, passwords) to a repo is:
A) Acceptable if the repo is private
B) Never acceptable — private repos get exposed, and secrets in history are very hard to remove cleanly
C) Fine for testing
D) Up to the developer

**94.** A good PR description includes:
A) Nothing — the code speaks for itself
B) What the change does, why it is needed, how to test it, and any risk
C) Just a ticket number
D) The diff repeated

**95.** When you do not know something, the most respected thing to say is:
A) Pretend you do
B) "I don't know — let me find out and get back to you"
C) Change the subject
D) Guess confidently

**96.** Documentation is best treated as:
A) Optional and for managers
B) A first-class skill — reading docs before asking, and updating docs when you learn something the next person will need
C) A waste of time
D) Marketing material

**97.** A teammate writes code differently than you would. The healthy response is usually:
A) Insist on your way
B) Ask why they chose that approach; there is often a reason, and even when there is not, the conversation is more useful than a fight
C) Rewrite it
D) Complain in the group chat

**98.** Pushing untested code on a Friday afternoon is:
A) Bold
B) A common cause of weekend incidents and a habit to avoid; if the change is risky, ship Monday
C) Required
D) Fine if it is a small change

**99.** When you break something in production, the priorities, in order, are:
A) Hide the evidence → fix → blame
B) Tell someone → contain the damage → fix → learn from it openly afterward
C) Fix silently → continue
D) Wait for someone to notice

**100.** The most important habit for a junior engineer is:
A) Speed
B) Curiosity — asking why things work, reading other people's code, learning from review, and treating every bug as a chance to understand the system better
C) Confidence
D) Working long hours

---

## Answer Key

1.B  2.C  3.B  4.B  5.B  6.B  7.B  8.B  9.B  10.B
11.A  12.B  13.B  14.A  15.B  16.B  17.A  18.A  19.B  20.B
21.B  22.B  23.B  24.B  25.B  26.B  27.B  28.A  29.B  30.A
31.B  32.A  33.B  34.C  35.B  36.B  37.B  38.B  39.B  40.B
41.B  42.B  43.B  44.B  45.B  46.B  47.B  48.B  49.B  50.B
51.B  52.B  53.B  54.A  55.B  56.B  57.B  58.B  59.B  60.B
61.B  62.B  63.B  64.B  65.B  66.B  67.B  68.B  69.B  70.A
71.B  72.B  73.B  74.B  75.B  76.B  77.B  78.B  79.B  80.B
81.B  82.B  83.A  84.B  85.B  86.B  87.B  88.B  89.B  90.B
91.B  92.B  93.B  94.B  95.B  96.B  97.B  98.B  99.B  100.B

**Passing threshold: 89 / 100**
