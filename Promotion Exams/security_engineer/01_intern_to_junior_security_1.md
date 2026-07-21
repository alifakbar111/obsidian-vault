# Promotion Exam: Intern → Junior Security Engineer 1

**Track:** Security Engineer (Specialist — defensive-first)
**Format:** 100 multiple-choice questions
**Time:** 120 minutes
**Passing score:** 89 / 100

**Scope.** This exam evaluates whether an intern is ready to be hired as a Junior Security Engineer 1. Security is not a role you can do without engineering fundamentals — you cannot secure or assess what you do not understand — so this exam blends real technical foundation (programming, HTTP, networking, how systems work) with the security-specific bedrock: the security mindset, core concepts (CIA, least privilege, defense in depth), common vulnerability classes at an introductory level, authentication basics, cryptography basics, and secure handling of data and secrets. The bar is: "can be trusted to assist with security tasks under supervision, recognize common risks, and not make things worse."

**A note on ethics and orientation.** Security work carries responsibility. This track is defensive-first: the goal is protecting systems and users. Offensive understanding is included because you cannot defend against what you do not understand — but every technique is framed toward defense, authorized testing, and responsible disclosure. A security engineer who cannot be trusted to act ethically and within authorization is not employable regardless of skill; this exam treats that as foundational, not optional.

---

## Section A — The Security Mindset and Core Concepts (Q1–Q15)

**1.** The CIA triad stands for:
A) Central Intelligence Agency
B) Confidentiality, Integrity, and Availability — the three core properties security aims to protect
C) Control, Isolation, Access
D) Cipher, Identity, Authorization

**2.** Confidentiality means:
A) Data is always available
B) Information is accessible only to those authorized to see it
C) Data cannot be changed
D) Systems never go down

**3.** Integrity means:
A) Data is secret
B) Data is accurate and has not been tampered with — unauthorized changes are prevented or detected
C) Data is fast
D) Data is public

**4.** Availability means:
A) Data is encrypted
B) Systems and data are accessible to authorized users when needed
C) Data is hidden
D) Data is backed up only

**5.** "Defense in depth" means:
A) One very strong control
B) Multiple layers of controls, so that if one fails, others still protect the system
C) Defending only the perimeter
D) Encrypting everything

**6.** The principle of least privilege means:
A) Give everyone admin to avoid friction
B) Grant each user, process, and credential only the permissions it needs and no more — limiting the damage of any compromise
C) Remove all permissions
D) Only admins have access

**7.** The security mindset is fundamentally about:
A) Trusting the system works as intended
B) Asking "how could this be abused or fail?" — thinking like an attacker to defend, and assuming things will be attacked
C) Following the spec exactly
D) Adding more features

**8.** "Attack surface" refers to:
A) The physical server
B) The sum of all points where an attacker could try to enter or extract data — every input, endpoint, dependency, and interface
C) The firewall
D) The user interface only

**9.** Reducing attack surface:
A) Means adding features
B) Means removing unnecessary exposure — closing unused ports, removing unused code and dependencies, disabling unneeded features
C) Means more logging
D) Means encryption

**10.** "Zero trust" as a principle means:
A) Trust nothing and no one, ever
B) Do not automatically trust based on network location; verify every request's identity and authorization regardless of where it originates
C) Trust the internal network fully
D) Remove all authentication

**11.** A "threat" versus a "vulnerability" versus a "risk":
A) They are the same
B) A threat is a potential cause of harm; a vulnerability is a weakness that could be exploited; risk is the likelihood and impact of a threat exploiting a vulnerability
C) Risk is a type of threat
D) Vulnerability is a type of firewall

**12.** "Security through obscurity" (relying on secrecy of design):
A) Is a strong strategy
B) Is weak as a sole defense — security should not depend on attackers not knowing how the system works; it can be one minor layer but never the foundation
C) Is the best approach
D) Is the same as encryption

**13.** The weakest link principle:
A) Systems are as strong as their strongest control
B) A system's security is often only as strong as its weakest point — attackers target the easiest path, not the hardest
C) Every control is equal
D) Only the firewall matters

**14.** "Fail securely" means:
A) Fail in a way that grants access
B) When something fails, it should default to denying access or the safe state, not opening up — e.g., an auth error should deny, not allow
C) Never fail
D) Fail loudly only

**15.** Security is best treated as:
A) A feature added at the end
B) A property built in from the start — designing for it early is far cheaper and more effective than bolting it on later
C) The security team's sole job
D) Optional for internal tools

---

## Section B — How Systems Work (Foundation) (Q16–Q30)

**16.** A security engineer who cannot read code:
A) Is fine — security is separate
B) Is severely limited — reviewing code for vulnerabilities, understanding exploits, and building tooling all require reading and writing code
C) Is the norm
D) Only needs networking

**17.** A variable, function, conditional, and loop:
A) Are irrelevant to security
B) Are basic constructs a security engineer must read fluently to spot flaws like missing validation or broken logic
C) Are automation-only
D) Do not matter

**18.** The client-server model:
A) The client is trusted
B) The client sends requests, the server responds — and the client is fundamentally untrusted because the user controls it
C) The server trusts the client
D) They are equal peers in trust

**19.** Why the client cannot be trusted:
A) It always can be
B) Anything running on the user's device (browser, app) can be inspected, modified, and replayed — security controls must be enforced server-side
C) Because it is slow
D) Because of encryption

**20.** An HTTP request contains:
A) Only a URL
B) A method, URL, headers, and often a body — each of which is attacker-controllable and must be treated as untrusted
C) Only the body
D) Only headers

**21.** HTTPS (TLS) provides:
A) Only speed
B) Encryption in transit, server authentication, and integrity — so traffic cannot be read or tampered with between client and server
C) Server-side security
D) Authorization

**22.** HTTPS does NOT protect against:
A) Eavesdropping in transit
B) Vulnerabilities in the application itself (injection, broken auth, etc.) — it secures the channel, not the code
C) Tampering in transit
D) Man-in-the-middle on the wire

**23.** A port:
A) Is a physical cable
B) Is a numbered endpoint on a host for a service (e.g., 443 for HTTPS); open unused ports expand attack surface
C) Is a firewall
D) Is a password

**24.** A firewall:
A) Encrypts data
B) Controls network traffic based on rules — allowing or blocking connections by port, address, or protocol
C) Is antivirus
D) Authenticates users

**25.** DNS:
A) Is a database of passwords
B) Resolves domain names to IP addresses; it is a common target (spoofing, poisoning) and a factor in several attacks
C) Encrypts traffic
D) Is a firewall

**26.** A process running as root/administrator:
A) Is best practice
B) Has full system privileges, so a compromise of it is catastrophic — run services with the least privilege they need instead
C) Is required
D) Is safer

**27.** Environment variables for configuration:
A) Should hold nothing sensitive
B) Are commonly used to inject config and secrets at runtime so they are not hardcoded in source — though a dedicated secrets manager is better for real secrets
C) Are stored in the code
D) Are always encrypted

**28.** A database stores application data and:
A) Is inherently secure
B) Is a high-value target — it often holds the most sensitive data, so access control, encryption, and query safety around it matter enormously
C) Cannot be attacked
D) Needs no protection

**29.** Logs:
A) Are always safe to store anything in
B) Are essential for detection and forensics, but must not contain secrets or sensitive data, and must themselves be protected
C) Are useless
D) Should contain passwords for debugging

**30.** A dependency (third-party library):
A) Is inert
B) Runs with your application's privileges — a vulnerable or malicious dependency is a vulnerability in your system (supply chain risk)
C) Is sandboxed
D) Is safe if popular

---

## Section C — Common Vulnerabilities: Introduction (Q31–Q48)

**31.** The OWASP Top 10 is:
A) A list of the ten best security tools
B) A widely-referenced list of the most critical web application security risks — a foundational awareness resource
C) A password standard
D) A firewall ruleset

**32.** Injection (e.g., SQL injection):
A) Is when the database is slow
B) Is when untrusted input is interpreted as code or commands — e.g., input that alters a SQL query's structure
C) Is a network attack
D) Requires physical access

**33.** SQL injection is primarily defended by:
A) Hiding the database
B) Parameterized queries / prepared statements, which separate code from data so input cannot change the query structure
C) A firewall
D) Encrypting the database

**34.** Cross-Site Scripting (XSS):
A) Steals cookies from the server
B) Is when untrusted input is rendered into a page such that it executes as script in a victim's browser — enabling session theft and more
C) Is a database attack
D) Is a network attack

**35.** XSS is primarily defended by:
A) HTTPS
B) Properly encoding/escaping output for its context, plus modern frameworks that escape by default and defenses like Content Security Policy
C) A firewall
D) Strong passwords

**36.** Cross-Site Request Forgery (CSRF):
A) Steals passwords directly
B) Tricks a victim's browser into making an authenticated request the victim did not intend — defended by anti-CSRF tokens, SameSite cookies, or requiring custom headers
C) Is the same as XSS
D) Is a network attack

**37.** Broken authentication includes:
A) Only weak passwords
B) Flaws like weak password policies, missing rate limiting on login, predictable session tokens, and improper session handling
C) Only expired sessions
D) Only missing HTTPS

**38.** Broken access control (authorization) is:
A) Rare
B) Among the most common and serious classes — users accessing data or actions they should not, often because the server does not properly check permissions
C) A network issue
D) The same as authentication

**39.** Insecure Direct Object Reference (IDOR):
A) Is a naming convention
B) Is accessing another user's resource by changing an identifier (e.g., `/invoice/123` → `/invoice/124`) when the server fails to verify ownership
C) Is an encryption method
D) Is a firewall rule

**40.** Sensitive data exposure:
A) Only means hacking
B) Includes transmitting or storing sensitive data without encryption, leaking it in logs or errors, or exposing it through an API that returns too much
C) Is always intentional
D) Is a network attack only

**41.** Security misconfiguration:
A) Is rare
B) Is common — default credentials, unnecessary features enabled, verbose error messages, open cloud storage buckets, and missing hardening
C) Is only about firewalls
D) Cannot be exploited

**42.** A verbose error message revealing a stack trace or internal details:
A) Is helpful to users
B) Can leak information useful to an attacker (framework, versions, file paths) — return generic errors to clients and log details internally
C) Is required
D) Is encrypted

**43.** Server-Side Request Forgery (SSRF):
A) Is when the client attacks itself
B) Is when a server is tricked into making requests to unintended destinations (internal services, cloud metadata endpoints) using attacker-controlled input
C) Is the same as CSRF
D) Is a browser attack

**44.** Command injection:
A) Is a database attack
B) Is when untrusted input is passed into a system/shell command, letting an attacker execute arbitrary commands — avoid shelling out with user input; use safe APIs
C) Requires root
D) Is XSS

**45.** Insecure deserialization:
A) Is harmless
B) Is when untrusted serialized data is deserialized into objects, potentially executing attacker-controlled behavior — avoid deserializing untrusted data, use safe formats
C) Is a network attack
D) Only affects databases

**46.** Using components with known vulnerabilities:
A) Is fine if the app works
B) Is a top risk — outdated dependencies with published CVEs are actively exploited; keep dependencies patched and monitored
C) Is unavoidable
D) Is the vendor's problem

**47.** Insufficient logging and monitoring:
A) Is a performance optimization
B) Is a security weakness — without detection, breaches go unnoticed for long periods; security-relevant events must be logged and watched
C) Is good for privacy
D) Is unrelated to security

**48.** A vulnerability class you do not recognize in a code review:
A) Should be ignored
B) Is a prompt to learn — the field is broad, and "I do not know this yet, let me research it" is the right response, not guessing
C) Is not real
D) Is the developer's problem

---

## Section D — Authentication and Authorization (Q49–Q62)

**49.** Authentication versus authorization:
A) Are the same
B) Authentication verifies who you are; authorization determines what you are allowed to do — both required, and confusing them causes real holes
C) Authentication is harder
D) Authorization is for admins only

**50.** Passwords should be stored:
A) In plaintext
B) Hashed with a slow, salted, purpose-built algorithm (bcrypt, scrypt, argon2) — never plaintext, never reversibly encrypted, never with fast general-purpose hashes
C) Encrypted reversibly
D) Base64 encoded

**51.** A salt:
A) Speeds hashing
B) Is a unique random value per password added before hashing, so identical passwords produce different hashes and precomputed (rainbow table) attacks fail
C) Is a shared secret
D) Replaces the password

**52.** Why fast hashes (MD5, SHA-1, SHA-256) are wrong for passwords:
A) They are too slow
B) They are too fast — attackers can compute billions of guesses per second; password hashing must be deliberately slow (work factor)
C) They are encrypted
D) They are deprecated for all uses

**53.** Multi-factor authentication (MFA):
A) Is redundant with passwords
B) Requires an additional factor (something you have/are) beyond the password, drastically reducing account-takeover risk from stolen passwords
C) Replaces passwords entirely
D) Is only for admins

**54.** SMS as a second factor:
A) Is the strongest MFA
B) Is better than nothing but the weakest common option (SIM-swapping, interception); app-based TOTP or hardware keys are stronger
C) Is unbreakable
D) Is the same as a hardware key

**55.** A session token:
A) Should be predictable
B) Must be long, random, and unpredictable, transmitted securely, and invalidated on logout/expiry — predictable tokens can be guessed or forged
C) Can be the user's ID
D) Never expires

**56.** Rate limiting on login:
A) Hurts users
B) Slows brute-force and credential-stuffing attacks — combined with lockout/backoff and monitoring for suspicious patterns
C) Is unnecessary
D) Replaces passwords

**57.** Storing a session/JWT in the browser:
A) Has no security implications
B) Involves trade-offs — `localStorage` is readable by any script (XSS risk); `httpOnly` cookies are not JS-readable but need CSRF protection; the choice depends on threat model
C) Is always safe in localStorage
D) Is always safe in cookies

**58.** Authorization enforced only in the UI (hiding buttons):
A) Is sufficient
B) Is not security — the server must enforce every authorization check, because the client can call endpoints directly
C) Is best practice
D) Replaces server checks

**59.** Role-based access control (RBAC):
A) Gives everyone the same access
B) Grants permissions based on roles assigned to users — a common, scalable authorization model
C) Is the same as authentication
D) Removes access control

**60.** OAuth 2.0 is:
A) A password storage method
B) A delegated authorization framework letting a user grant an application limited access on their behalf, without sharing their password
C) An encryption algorithm
D) A firewall

**61.** A password reset flow is:
A) Low risk
B) A high-value target — insecure reset tokens, account enumeration, or missing rate limits make it a common account-takeover vector; design it carefully
C) Not a security concern
D) Always safe with email

**62.** Account enumeration (revealing whether an email is registered):
A) Is helpful UX and harmless
B) Can leak which accounts exist (via different login/reset messages or timing), aiding targeted attacks — responses should not distinguish valid from invalid accounts unnecessarily
C) Is impossible
D) Is required

---

## Section E — Cryptography Basics (Q63–Q75)

**63.** Encryption versus hashing:
A) Are the same
B) Encryption is reversible with a key (for confidentiality); hashing is one-way (for integrity and password storage) — using the wrong one is a common mistake
C) Hashing is reversible
D) Encryption is one-way

**64.** Symmetric versus asymmetric encryption:
A) Are the same
B) Symmetric uses one shared key (fast, for bulk data); asymmetric uses a public/private key pair (for key exchange and signatures) — often combined
C) Asymmetric is always better
D) Symmetric is deprecated

**65.** A public/private key pair:
A) Shares both keys
B) The public key can be shared freely (used to encrypt to you or verify your signatures); the private key is kept secret (to decrypt or sign)
C) Both must be secret
D) Both are public

**66.** A digital signature provides:
A) Confidentiality
B) Authenticity and integrity — proof that a message came from the holder of the private key and was not altered
C) Availability
D) Speed

**67.** "Rolling your own crypto" (writing your own encryption):
A) Is encouraged
B) Is almost always a serious mistake — even experts get it wrong; use well-vetted, standard libraries and algorithms
C) Is faster
D) Is required for real security

**68.** A one-time pad, AES, RSA — the practical rule for a junior is:
A) Invent a new one
B) Use established, current standards (e.g., AES for symmetric, well-configured RSA or elliptic-curve for asymmetric) via reputable libraries, with correct modes and parameters
C) Use the oldest available
D) Encryption does not matter

**69.** Encryption in transit versus at rest:
A) Are the same
B) In transit protects data moving over a network (TLS); at rest protects stored data (disk/database encryption) — both are needed for sensitive data
C) Only in transit matters
D) Only at rest matters

**70.** A hardcoded encryption key in source code:
A) Is fine if obfuscated
B) Defeats the encryption — anyone with the code (or the compiled binary) has the key; keys belong in a secrets manager / key management system
C) Is encrypted
D) Is required

**71.** Key rotation:
A) Is unnecessary
B) Periodically replacing keys limits the damage if a key is compromised and is required by many standards — systems should be designed to support it
C) Breaks encryption
D) Is automatic

**72.** A weak or default random number generator for security purposes:
A) Is fine
B) Is dangerous — security tokens, keys, and salts must use a cryptographically secure random source, not a predictable general-purpose one
C) Is faster and better
D) Does not matter

**73.** Hashing a password with a salt but no work factor (fast hash + salt):
A) Is fully secure
B) Is still too fast — salt defeats rainbow tables but not brute force; a slow, tunable algorithm (work factor) is also required
C) Is the best approach
D) Is the same as bcrypt

**74.** TLS certificate validation:
A) Can be disabled for convenience
B) Must not be disabled — disabling certificate verification (a common "fix" for errors) removes the protection against man-in-the-middle and is a serious vulnerability
C) Is optional
D) Is only for browsers

**75.** End-to-end encryption:
A) Means the server can read everything
B) Means only the communicating endpoints can read the content — not even the server in between — used where the provider should not have access to plaintext
C) Is the same as TLS
D) Is unbreakable magic

---

## Section F — Data Protection and Secrets (Q76–Q86)

**76.** Personally Identifiable Information (PII):
A) Is any data
B) Is data that identifies a person (name, email, ID numbers, location) — regulated and requiring minimization, protection, and careful handling
C) Is public by default
D) Is only names

**77.** Data minimization:
A) Collect everything possible
B) Collect and retain only the data you actually need — data you do not hold cannot be breached, and it reduces regulatory burden
C) Is illegal
D) Means deleting all data

**78.** Secrets (API keys, passwords, tokens, private keys) in a Git repository:
A) Are fine in private repos
B) Are never acceptable in source — they leak through history, forks, and mistakes; use a secrets manager and keep them out of the repo
C) Should be base64 encoded
D) Are safe if the repo is deleted later

**79.** A leaked secret:
A) Is fine if you delete the commit
B) Must be rotated immediately and treated as compromised — removing it from history is cleanup, not remediation
C) Is safe once the repo is private
D) Cannot be exploited quickly

**80.** A `.env` file with credentials:
A) Should be committed
B) Must be in `.gitignore` and never committed; secrets should be delivered through a secrets manager or controlled channel
C) Is automatically secret
D) Belongs in the codebase

**81.** A secrets manager (Vault, cloud secret managers):
A) Is overkill
B) Centralizes secret storage with access control, auditing, and rotation — far safer than files on disk or hardcoded values
C) Is the same as a database
D) Stores only passwords

**82.** Logging sensitive data:
A) Is fine internally
B) Is a recurring breach source — scrub or omit passwords, tokens, PII, and payment data before logging, since logs are widely accessible and long-lived
C) Is required for debugging
D) Is encrypted automatically

**83.** Data on a developer's laptop:
A) Is safe
B) Is a liability — real production/customer data should not be casually copied to endpoints; use anonymized or synthetic data
C) Is encrypted automatically
D) Is required for testing

**84.** Encryption at rest for a database:
A) Makes the app fully secure
B) Protects against certain physical/storage-level access but does nothing against an application or credential that legitimately reads the data — one layer, not the whole answer
C) Replaces access control
D) Is unnecessary

**85.** Sharing a secret with a teammate:
A) Over email or chat is fine
B) Should go through a secure channel (secrets manager, password manager sharing) — plaintext in email/chat lingers and leaks
C) Over any channel
D) Is never necessary

**86.** Data retention and deletion:
A) Keep everything forever
B) Should follow a policy — data kept only as long as needed, with a real deletion path, to reduce risk and meet legal obligations
C) Is not a security concern
D) Is automatic

---

## Section G — Ethics, Process, and Responsible Practice (Q87–Q94)

**87.** Testing a system's security:
A) Can be done on anything you find
B) Requires authorization — testing systems you do not own or have explicit permission to test is illegal and unethical, regardless of intent
C) Is always allowed for security people
D) Needs no permission internally

**88.** Discovering a vulnerability in a third party's system:
A) Exploit it to prove it
B) Follow responsible disclosure — report it privately to the owner, give them time to fix it, and do not exploit or publicize it prematurely
C) Post it publicly immediately
D) Ignore it

**89.** Handling a real vulnerability found internally:
A) Exploit it fully to demonstrate impact on production
B) Document it, report it through the proper channel, and demonstrate risk safely and within scope — do not cause damage or access data beyond what is needed
C) Fix it silently without telling anyone
D) Ignore it

**90.** Access to sensitive data as a security engineer:
A) Means you can look at anything
B) Is a responsibility governed by need-to-know and authorization — having access is not permission to browse; misuse is a serious violation
C) Is unlimited
D) Is for admins only

**91.** A security engineer's relationship with developers:
A) Adversarial — catch them out
B) Collaborative — helping teams build securely, explaining risks constructively, and being an enabler rather than only a gatekeeper
C) Policing only
D) Distant

**92.** "Security says no" as a default:
A) Is the right posture
B) Is a failure mode — good security engineers help teams find secure ways to do what they need, not just block; reflexive no's get security bypassed
C) Is required
D) Builds trust

**93.** Confidentiality of security findings:
A) Should be shared widely
B) Must be handled carefully — unpatched vulnerability details are sensitive; share on a need-to-know basis until remediated
C) Are public information
D) Do not matter

**94.** When you are unsure whether something is a real vulnerability:
A) Assume it is not
B) Investigate, research, and escalate to a senior — false confidence in either direction is dangerous; verifying is the job
C) Assume it is and cause alarm
D) Ignore it

---

## Section H — Habits and Mindset (Q95–Q100)

**95.** Keeping up with security news, advisories, and CVEs:
A) Is optional
B) Is part of the job — the threat landscape changes constantly, and staying current is how you defend against what is actually being exploited
C) Is only for seniors
D) Wastes time

**96.** Copy-pasting an exploit or fix you do not understand:
A) Is fine if it works
B) Is dangerous — you cannot assess its effect or safety, and in security a misunderstanding can cause real harm or a false sense of safety
C) Is required for speed
D) Is encouraged

**97.** Saying "I do not know, let me research it":
A) Damages credibility
B) Is essential in security — the field is vast, and confident guessing about safety is worse than admitting a gap and investigating
C) Is for juniors only
D) Should be hidden

**98.** Assuming a system is secure because no one has attacked it yet:
A) Is reasonable
B) Is a trap — absence of known attacks is not evidence of security; assume it will be attacked and assess it properly
C) Is best practice
D) Is provable

**99.** Reading how real breaches happened:
A) Is morbid curiosity
B) Is valuable learning — post-incident reports reveal the actual, often mundane, ways systems fail and how to prevent them
C) Is a distraction
D) Is unethical

**100.** The most reliable predictor of growth for a junior security engineer is:
A) Knowing the most tools
B) A relentless "how could this be abused?" curiosity, strong engineering fundamentals, ethical judgment, and the humility to keep learning a field that never stops changing
C) Never being wrong
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
