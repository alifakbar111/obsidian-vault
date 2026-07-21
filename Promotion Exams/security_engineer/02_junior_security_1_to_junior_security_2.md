# Promotion Exam: Junior Security Engineer 1 → Junior Security Engineer 2

**Track:** Security Engineer (Specialist — defensive-first)
**Format:** 100 multiple-choice questions
**Time:** 135 minutes
**Passing score:** 89 / 100

**Scope.** A Junior Security 1 assists with security tasks under supervision. A Junior Security 2 should own security work for a scoped area — reviewing code and designs for common vulnerabilities, performing basic threat modeling, running and triaging scanning tools, testing web and API security hands-on, and giving developers actionable guidance — with light review. This exam deepens the vulnerability classes, introduces threat modeling and secure SDLC, covers web/API/network security hands-on, application security tooling (SAST/DAST/SCA), and the collaboration and ethics a Junior 2 must demonstrate.

---

## Section A — Threat Modeling (Q1–Q12)

**1.** Threat modeling is:
A) Running a scanner
B) A structured way to identify what you are protecting, what could go wrong, and what to do about it — done early in design, not after
C) Penetration testing
D) A compliance checkbox

**2.** The four core threat-modeling questions (Shostack) are roughly:
A) Who, what, when, where
B) What are we building? What can go wrong? What are we going to do about it? Did we do a good job?
C) Cost, time, scope, quality
D) Confidentiality, integrity, availability, authenticity

**3.** STRIDE is:
A) A password policy
B) A threat taxonomy: Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege
C) An encryption standard
D) A firewall model

**4.** A data flow diagram in threat modeling:
A) Is decorative
B) Maps how data moves through the system and where trust boundaries are crossed — the crossings are where threats concentrate
C) Is the network diagram only
D) Replaces code review

**5.** A trust boundary:
A) Does not exist in modern systems
B) Is where data or control passes between components of different trust levels (user→server, service→service, app→third party) — the key place to scrutinize
C) Is the firewall only
D) Is the login page

**6.** Threat modeling should happen:
A) After launch
B) During design, and be revisited as the system changes — catching design flaws before they are built is far cheaper than fixing them later
C) Only after a breach
D) Never for internal tools

**7.** "Elevation of privilege" (the E in STRIDE):
A) A promotion
B) An attacker gaining higher permissions than they should have — e.g., a normal user performing admin actions
C) A network attack
D) A password reset

**8.** "Repudiation" (the R in STRIDE):
A) Rejecting a login
B) A user being able to deny having performed an action because there is no reliable record — countered by logging and audit trails
C) A denial of service
D) An encryption failure

**9.** Attack trees:
A) Are org charts
B) Break down an attacker's goal into the steps and alternatives to achieve it — helping identify and prioritize defenses
C) Are network diagrams
D) Are dependency graphs

**10.** Prioritizing identified threats:
A) Fix them alphabetically
B) By risk — likelihood combined with impact — so effort goes to the threats that matter most, not every theoretical one
C) Fix all equally
D) Ignore low-likelihood ones entirely

**11.** Threat modeling a feature that handles payments:
A) Is the same as any feature
B) Warrants extra scrutiny — the assets (money, card data) and the regulatory context (PCI DSS) raise the stakes and the required controls
C) Needs no special attention
D) Is the developer's job

**12.** The output of threat modeling should be:
A) A document nobody reads
B) Actionable mitigations tied to identified threats, fed into design and the backlog — it is a means to better security, not paperwork
C) A pass/fail grade
D) A scanner report

---

## Section B — Web Application Security Hands-On (Q13–Q28)

**13.** Reflected versus stored XSS:
A) Are the same
B) Reflected XSS bounces malicious input back in the immediate response; stored XSS persists the payload (e.g., in a database) to affect other users later — stored is often more severe
C) Reflected is worse always
D) Stored is a network attack

**14.** DOM-based XSS:
A) Involves the server
B) Occurs entirely in client-side JavaScript manipulating the DOM with untrusted input — the payload may never reach the server, so server-side defenses miss it
C) Is impossible
D) Is the same as reflected

**15.** Content Security Policy (CSP):
A) Is a firewall
B) A browser-enforced allowlist of sources for scripts, styles, etc. — a strong defense-in-depth layer against XSS when configured tightly
C) Replaces output encoding
D) Is server-side only

**16.** Output encoding must be:
A) The same everywhere
B) Context-appropriate — HTML body, HTML attribute, JavaScript, URL, and CSS contexts each require different encoding to prevent XSS
C) Done once globally
D) Unnecessary with HTTPS

**17.** SQL injection via an ORM:
A) Is impossible
B) Can still occur through raw queries, string-built fragments (like dynamic ORDER BY), or misused APIs — ORMs help but do not eliminate the risk
C) Only affects raw SQL
D) Is a network issue

**18.** Second-order (stored) SQL injection:
A) Does not exist
B) Occurs when malicious input is stored safely but later used unsafely in a query — validation at input alone is insufficient; parameterize at every query
C) Is the same as reflected XSS
D) Requires physical access

**19.** CSRF protection with SameSite cookies:
A) Fully solves CSRF alone in all cases
B) Significantly mitigates CSRF by restricting when cookies are sent cross-site, but should be combined with anti-CSRF tokens for defense in depth
C) Is unrelated to CSRF
D) Causes XSS

**20.** Testing for IDOR:
A) Trust the UI
B) Change identifiers in requests (IDs, filenames) as one user and verify you cannot access another user's resources — the server must enforce ownership
C) Is impossible
D) Only affects admins

**21.** Mass assignment / over-posting:
A) Is a UI bug
B) Occurs when a request can set fields it should not (e.g., `role=admin`) because the server binds input to a model without an allowlist — defended by explicit field allowlists
C) Is a network attack
D) Is the same as XSS

**22.** Open redirect:
A) Is harmless
B) Occurs when a URL parameter controls where the app redirects, letting attackers craft trusted-looking links to malicious sites — validate/allowlist redirect targets
C) Is a database attack
D) Requires root

**23.** Clickjacking:
A) Is a mouse hardware issue
B) Tricks a user into clicking something different from what they perceive, often via a hidden iframe — defended by frame-ancestors CSP / X-Frame-Options
C) Is the same as CSRF
D) Is a phishing email

**24.** File upload vulnerabilities:
A) Do not exist
B) Include uploading executable content, path traversal in filenames, oversized files, and content that is not what it claims — validate type, size, storage location, and never execute uploads
C) Are only about size
D) Are a network issue

**25.** Path traversal (directory traversal):
A) Is a routing feature
B) Uses input like `../../etc/passwd` to access files outside the intended directory — defended by validating and canonicalizing paths and avoiding user input in file paths
C) Is a database attack
D) Requires physical access

**26.** Security headers (HSTS, X-Content-Type-Options, frame-ancestors, etc.):
A) Are decorative
B) Instruct browsers to enforce protections (force HTTPS, prevent MIME sniffing, block framing) — cheap, high-value defense-in-depth
C) Slow the site
D) Replace application security

**27.** Testing authentication for weaknesses:
A) Try one valid login
B) Test rate limiting, lockout, session fixation, token randomness, password reset security, and account enumeration — auth is a rich attack surface
C) Is the developer's job
D) Cannot be tested

**28.** A proxy tool (Burp Suite, OWASP ZAP):
A) Is a firewall
B) Lets a security engineer intercept, inspect, and modify HTTP traffic between client and server — the core hands-on web testing tool
C) Encrypts traffic
D) Is antivirus

---

## Section C — API and Authentication Security (Q29–Q42)

**29.** API security differs from web page security in that:
A) It does not
B) APIs expose structured endpoints often consumed by many clients, making authorization, rate limiting, and input validation on every endpoint critical — and the "hidden by the UI" assumption is invalid
C) APIs are inherently secure
D) APIs need no auth

**30.** Broken object-level authorization (the API IDOR):
A) Is rare
B) Is the top API risk — an endpoint returning or modifying an object by ID without verifying the caller owns it
C) Is a network attack
D) Is the same as rate limiting

**31.** Broken function-level authorization:
A) Is not real
B) Is when a lower-privileged user can call higher-privileged endpoints (e.g., admin APIs) because the server does not check the caller's role per function
C) Is a UI issue
D) Is encryption

**32.** Excessive data exposure in an API:
A) Is fine
B) Occurs when an endpoint returns more data than the client needs, relying on the client to filter — attackers read the raw response; the server must return only what is authorized
C) Is a performance issue only
D) Is unavoidable

**33.** Rate limiting and resource controls on APIs:
A) Hurt users
B) Prevent abuse, brute force, and denial of service — and should be enforced per identity/endpoint with proper 429 responses
C) Are unnecessary
D) Replace authentication

**34.** A JWT with `alg: none`:
A) Is secure
B) Is a classic vulnerability — if the server accepts it, tokens can be forged with no signature; the verifier must enforce the expected algorithm
C) Is required
D) Is encrypted

**35.** JWT payload contents:
A) Are encrypted
B) Are only base64-encoded and readable by anyone holding the token — never put secrets in the payload; only non-sensitive claims the verifier needs
C) Are private
D) Are signed and thus hidden

**36.** JWT revocation:
A) Is automatic
B) Is a real challenge for stateless tokens — logout/ban requires short lifetimes plus refresh-token revocation, a blocklist, or a session reference; "just delete it client-side" is insufficient
C) Is impossible
D) Is not needed

**37.** OAuth 2.0 authorization code flow with PKCE:
A) Is for servers only
B) Is the recommended flow for public clients (mobile/SPA), protecting the code exchange so an intercepted authorization code cannot be redeemed by an attacker
C) Is deprecated
D) Is the implicit flow

**38.** The OAuth implicit flow:
A) Is recommended
B) Is largely deprecated because it exposed tokens in URLs; authorization code with PKCE is preferred
C) Is the most secure
D) Is for backends

**39.** Service-to-service authentication:
A) Should reuse user credentials
B) Uses dedicated credentials (client credentials, mTLS, workload identity), least-privileged and rotated, with explicit allowlists of who may call whom
C) Is unnecessary inside the network
D) Is IP-based only

**40.** API keys:
A) Are as secure as OAuth tokens
B) Are long-lived shared secrets that are easy to leak; scope them tightly, rotate them, monitor use, and prefer stronger mechanisms for sensitive operations
C) Should be in client code
D) Never leak

**41.** Testing authorization on an API thoroughly:
A) Test as an admin only
B) Exercise every endpoint as each role and as an unauthenticated caller, verifying least privilege and that object ownership is enforced
C) Trust the frontend
D) Is impossible

**42.** GraphQL-specific security concerns:
A) None — it is just HTTP
B) Include query depth/complexity abuse (denial of service), overly permissive introspection in production, and authorization that must be enforced at the resolver/field level
C) Are the same as REST exactly
D) Do not exist

---

## Section D — Network and Infrastructure Security (Q43–Q54)

**43.** Network segmentation:
A) Is obsolete
B) Divides a network into zones so a compromise in one does not grant access to all — limiting lateral movement
C) Is the same as a firewall rule
D) Slows the network pointlessly

**44.** A DMZ (demilitarized zone):
A) Is a military term only
B) Is a network segment exposing public-facing services while isolating internal systems behind additional controls
C) Is a firewall brand
D) Is unencrypted by design

**45.** TLS configuration weaknesses:
A) Do not exist if TLS is on
B) Include outdated protocol versions, weak cipher suites, expired/misissued certificates, and missing HSTS — TLS must be configured, not just enabled
C) Are the browser's problem
D) Are impossible

**46.** A man-in-the-middle (MITM) attack:
A) Is impossible with any HTTPS
B) Intercepts communication between two parties; TLS defends against it only if certificate validation is enforced — disabling validation reopens the door
C) Is a database attack
D) Requires physical access always

**47.** Lateral movement:
A) Is a network feature
B) Is how an attacker who compromises one host pivots to others — countered by segmentation, least privilege, and monitoring internal traffic
C) Is the same as privilege escalation
D) Cannot be prevented

**48.** A bastion host / jump box:
A) Is a web server
B) Is a hardened, monitored entry point through which administrative access to internal systems is funneled, reducing exposed surface
C) Is a firewall
D) Is a load balancer

**49.** VPN access to internal systems:
A) Makes everything inside safe
B) Provides an encrypted tunnel and access control, but is not a substitute for internal security — zero-trust principles still apply once inside
C) Is the same as zero trust
D) Removes the need for authentication

**50.** Denial of Service (DoS) / DDoS:
A) Steals data
B) Overwhelms a system to make it unavailable — defended by rate limiting, capacity, upstream scrubbing/CDN, and graceful degradation
C) Is a confidentiality attack
D) Requires insider access

**51.** Cloud storage bucket misconfiguration:
A) Is rare
B) Is a common breach cause — publicly-readable buckets holding private data; default to private, audit access, and monitor for exposure
C) Cannot happen
D) Is the cloud provider's fault

**52.** Cloud metadata endpoint (e.g., 169.254.169.254):
A) Is harmless
B) Can leak credentials if reachable via SSRF — a specific SSRF target worth understanding and protecting (e.g., IMDSv2, network policy)
C) Is a firewall
D) Is public by design

**53.** Ports exposed to the internet:
A) More is better
B) Should be minimized — only what is required, behind proper controls; every exposed service is attack surface
C) Do not matter behind a firewall
D) Are encrypted

**54.** Patching and update management:
A) Is optional
B) Is essential — unpatched systems with known vulnerabilities are among the most exploited; timely patching is a core defensive discipline
C) Breaks systems, so avoid it
D) Is the vendor's job

---

## Section E — Application Security Tooling (Q55–Q66)

**55.** SAST (Static Application Security Testing):
A) Tests the running app
B) Analyzes source code (without running it) for vulnerability patterns — good for early, broad coverage but produces false positives that need triage
C) Is a firewall
D) Is manual review

**56.** DAST (Dynamic Application Security Testing):
A) Reads source code
B) Tests the running application from the outside (like an attacker) — finds runtime issues SAST misses, but only what it can reach
C) Is the same as SAST
D) Is a code linter

**57.** SCA (Software Composition Analysis):
A) Tests your own code
B) Scans dependencies for known vulnerabilities (CVEs) and license issues — critical given how much of an app is third-party code
C) Is a network scanner
D) Is antivirus

**58.** A scanner reporting 500 findings:
A) Means 500 real bugs to fix now
B) Requires triage — separating true positives from false positives, deduplicating, and prioritizing by real risk; raw counts are not a work list
C) Should be ignored
D) Should all be fixed alphabetically

**59.** False positives from security tools:
A) Prove the tool is useless
B) Are expected — part of a security engineer's job is triaging them so developers are not buried in noise and real issues are not lost
C) Should be auto-fixed
D) Never happen

**60.** Integrating security scanning into CI/CD:
A) Slows developers pointlessly
B) Catches issues early and consistently — but must be tuned so it blocks on real, high-confidence issues and does not drown teams in low-value noise
C) Is impossible
D) Replaces manual review

**61.** Secret scanning:
A) Is unnecessary
B) Detects credentials committed to code repositories — a common leak source; run it in CI and on history, and rotate anything found
C) Finds only passwords
D) Is a firewall

**62.** A dependency with a published critical CVE:
A) Can wait indefinitely
B) Should be assessed for exploitability in your context and patched/mitigated promptly — known-exploited vulnerabilities are actively targeted
C) Is the vendor's problem
D) Is safe if popular

**63.** Fuzzing:
A) Is random guessing with no value
B) Feeds malformed/random input to find crashes and edge-case vulnerabilities — effective for parsers, protocols, and input-handling code
C) Is the same as DAST
D) Requires source code always

**64.** A Software Bill of Materials (SBOM):
A) Is a purchase order
B) Is an inventory of the components in your software — enabling fast response when a new vulnerability is disclosed in a dependency
C) Is a firewall config
D) Is a password list

**65.** Relying solely on automated tools for security:
A) Is sufficient
B) Misses logic flaws, authorization bugs, and design weaknesses that require human review and threat modeling — tools complement, not replace, expertise
C) Is best practice
D) Is impossible

**66.** Tuning and maintaining security tooling:
A) Is a one-time setup
B) Is ongoing — rules, baselines, and suppressions need maintenance so signal stays high and the team keeps trusting the results
C) Is the developer's job
D) Is unnecessary

---

## Section F — Secure Development Collaboration (Q67–Q80)

**67.** A secure SDLC (software development lifecycle):
A) Is a separate security phase at the end
B) Integrates security throughout — requirements, design (threat modeling), development (secure coding, review), testing (SAST/DAST), and operations (monitoring, response)
C) Is only for regulated industries
D) Slows everything down

**68.** A security code review focuses on:
A) Style and formatting
B) Trust boundaries, input validation, authentication/authorization, secrets handling, and injection/output-encoding — the security-relevant properties, not cosmetics
C) Performance only
D) Test coverage only

**69.** Giving developers security feedback:
A) Just say "this is insecure"
B) Explain the specific risk, show how to exploit it (safely) if helpful, and provide the concrete fix — actionable, respectful guidance changes behavior; blame does not
C) Escalate to management first
D) Fix it silently

**70.** Security requirements in a feature:
A) Are implicit
B) Should be explicit — authentication, authorization, data protection, and logging expectations belong in the acceptance criteria, not assumed
C) Are the developer's guess
D) Are added after launch

**71.** A developer pushes back that a fix is too costly:
A) Insist regardless
B) Weigh the actual risk against the cost together, find the most practical mitigation, and escalate only genuine high-risk disagreements — security that ignores cost gets bypassed
C) Give up
D) Report them

**72.** "Shifting security left":
A) Means the security team does more
B) Means addressing security earlier in development — design and code time — where it is cheaper and more effective than at release
C) Is a political term
D) Is impossible

**73.** Security champions (developers with security focus embedded in teams):
A) Are unnecessary
B) Scale security by embedding awareness in each team — a security engineer cultivates them rather than being the sole gatekeeper
C) Replace the security team
D) Are a management fad

**74.** A reflexive "no" from security:
A) Is the safe default
B) Erodes trust and gets security routed around — help teams find a secure way to achieve their goal instead of only blocking
C) Is required
D) Builds credibility

**75.** Secure defaults:
A) Make things harder for users
B) Are the highest-leverage practice — making the safe way the easy/default way (secure templates, hardened baselines, safe libraries) prevents whole classes of mistakes
C) Are impossible
D) Are the developer's job alone

**76.** Documenting a vulnerability finding:
A) "It's broken"
B) Includes what it is, where, how to reproduce, the risk/impact, and a concrete remediation — clear enough for a developer to act without guessing
C) Just a severity score
D) The developer's name

**77.** Severity scoring (e.g., CVSS):
A) Is the final word
B) Is a useful common language for severity, but must be contextualized — a "medium" CVSS on an internet-facing auth endpoint may be a real emergency in your environment
C) Is meaningless
D) Replaces judgment

**78.** Verifying a security fix:
A) Trust the developer
B) Re-test to confirm the vulnerability is actually closed and the fix did not introduce a new issue — some fixes are incomplete or shift the problem
C) Close on their word
D) Is unnecessary

**79.** Estimating security work:
A) A single number
B) A reasoned range accounting for review, testing, triage, retest, and coordination — with the risk clearly communicated
C) The developer's estimate
D) Zero

**80.** Security's relationship with product/engineering leadership:
A) Purely enforcement
B) A partnership — providing clear risk information so leadership can make informed trade-offs, and enabling teams to ship securely
C) Adversarial
D) Silent

---

## Section G — Detection, Response, and Operations (Q81–Q90)

**81.** Logging security-relevant events:
A) Is optional
B) Is essential for detection and forensics — logins, permission changes, failures, and sensitive actions — while never logging secrets or excessive PII
C) Should include passwords
D) Slows the app too much

**82.** A SIEM:
A) Is a firewall
B) Aggregates and correlates logs/events across systems to detect and investigate security incidents
C) Is antivirus
D) Is a password manager

**83.** An Intrusion Detection/Prevention System (IDS/IPS):
A) Encrypts traffic
B) Monitors (and for IPS, blocks) traffic for known attack patterns or anomalies — one detective/preventive layer among several
C) Is a VPN
D) Is a code scanner

**84.** The first priority when a security incident is suspected:
A) Find who to blame
B) Follow the incident response process — contain, assess scope, preserve evidence, and communicate to the right people; act deliberately, not rashly
C) Delete the logs
D) Announce it publicly

**85.** Incident response phases (commonly):
A) Blame, fix, forget
B) Preparation, identification, containment, eradication, recovery, and lessons learned
C) Detect and ignore
D) Patch and hope

**86.** Preserving evidence during an incident:
A) Is unnecessary
B) Matters for understanding scope, root cause, and (potentially) legal/forensic needs — avoid destroying logs and artifacts while responding
C) Slows response pointlessly
D) Is law enforcement's job only

**87.** A blameless post-incident review:
A) Finds someone to punish
B) Focuses on how the incident happened and what systemic changes prevent recurrence — blame suppresses the honesty needed to actually improve
C) Is skipped if no data was lost
D) Assigns fault

**88.** Alert fatigue:
A) Is a personal failing
B) Is a real operational risk — too many low-value alerts cause responders to miss the real one; tune alerts to be meaningful and actionable
C) Is unavoidable
D) Means adding more alerts

**89.** Detecting a breach months after it happened:
A) Is normal and fine
B) Is a common and costly reality that underscores why logging, monitoring, and detection capability matter as much as prevention
C) Is impossible
D) Means prevention failed only

**90.** Tabletop exercises (simulated incident walkthroughs):
A) Are theater
B) Rehearse the response before a real incident, surfacing gaps in the plan, tools, and communication while the stakes are low
C) Replace real monitoring
D) Are a compliance-only ritual

---

## Section H — Ethics, Judgment, and Growth (Q91–Q100)

**91.** Testing within authorization and scope:
A) Is optional for security staff
B) Is mandatory — even internally, act within defined scope and authorization; exceeding it, or accessing data beyond need, is a serious violation
C) Applies only to external systems
D) Is a formality

**92.** Handling sensitive findings before they are fixed:
A) Share widely to raise awareness
B) Restrict to need-to-know until remediated — unpatched details are dangerous in the wrong hands
C) Post publicly
D) Ignore

**93.** Responsible disclosure of a vulnerability in someone else's system:
A) Publish immediately
B) Report privately to the owner, allow reasonable time to fix, and coordinate disclosure — do not exploit beyond proof or cause harm
C) Sell it
D) Exploit it

**94.** Access to powerful tools and data:
A) Means using them freely
B) Comes with responsibility and accountability — the trust placed in a security engineer is easily and seriously abused, and misuse ends careers and harms people
C) Is unlimited
D) Is for seniors only

**95.** When you find you have made a mistake that weakened security:
A) Hide it
B) Report it promptly and help remediate — covering up a security mistake compounds the risk and betrays the trust the role depends on
C) Blame a tool
D) Ignore it

**96.** Copy-pasting an exploit or a "fix" you do not understand:
A) Is fine if it runs
B) Is dangerous — in security, a misunderstood change can create a false sense of safety or cause real damage; understand before you apply
C) Is required for speed
D) Is encouraged

**97.** Saying "I do not know, let me research it":
A) Damages credibility
B) Is essential — security is vast and evolving; confident guessing about safety is worse than an honest gap you then close
C) Is for juniors only
D) Should be hidden

**98.** Keeping current with the threat landscape:
A) Is optional
B) Is part of the job — new vulnerability classes, exploited CVEs, and techniques emerge constantly; staying current is how you stay effective
C) Is only for seniors
D) Wastes time

**99.** Learning from real breach post-mortems:
A) Is morbid
B) Is high-value — they reveal the actual, often mundane, chains of failure and the practical defenses that would have helped
C) Is unethical
D) Is a distraction

**100.** The most reliable predictor of growth for a junior security engineer is:
A) Knowing the most tools
B) The security mindset, strong engineering fundamentals, ethical judgment, collaborative instincts with developers, and relentless curiosity in a field that never stops changing
C) Finding the most bugs
D) Working the longest hours

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
