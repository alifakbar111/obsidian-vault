# Promotion Exam: Junior Security Engineer 2 → Junior Security Engineer 3

**Track:** Security Engineer (Specialist — defensive-first)
**Format:** 100 multiple-choice questions
**Time:** 150 minutes
**Passing score:** 89 / 100

**Scope.** Junior Security 3 is the top of the specialist track before convergence into the generalist senior level. A Junior Security 3 owns security for a system or product area with minimal supervision, leads threat modeling, performs deep application and infrastructure security assessment, drives remediation with engineering teams, builds security tooling and automation, participates in incident response, and shows early security-engineering judgment. This exam tests that depth: advanced vulnerability analysis and exploitation understanding, cryptography applied correctly, cloud and container security, identity and access at depth, detection engineering, incident response, secure architecture, and the judgment to prioritize real risk.

**Reminder.** This is the last specialist-only security exam. The next exam (Junior 3 → Senior 1) is the convergence point and tests whether the candidate has broadened into a senior security engineer who operates across the whole stack — reading and reasoning about application, infrastructure, and cloud code, influencing engineering culture, and connecting security to the business. A candidate who aces this but cannot read the systems they assess or work effectively with engineers is not ready for the next gate.

---

## Section A — Advanced Vulnerability Analysis (Q1–Q14)

**1.** A vulnerability's real severity depends on:
A) Its CVSS base score alone
B) Context — exploitability in your environment, exposure, the value of what it protects, and existing mitigating controls — not the base score in isolation
C) How new it is
D) The tool that found it

**2.** Chaining vulnerabilities:
A) Is theoretical
B) Is how real attacks often work — combining several low/medium issues (e.g., an info leak + an IDOR + weak session) into a serious compromise; assess issues together, not only individually
C) Is impossible
D) Only matters for criticals

**3.** A "low severity" information disclosure:
A) Is always ignorable
B) Can be a stepping stone — leaked version numbers, internal paths, or user existence often enable a larger attack; weigh it in context
C) Is never worth reporting
D) Is a false positive

**4.** Business logic vulnerabilities:
A) Are caught by scanners
B) Are flaws in the application's rules (e.g., applying a discount infinitely, skipping a payment step) that tools cannot find — they require understanding the intended logic
C) Do not exist
D) Are the same as injection

**5.** A race condition (TOCTOU — time of check to time of use):
A) Cannot be a security issue
B) Can be exploited when a check and an action are not atomic (e.g., double-spending, redeeming a coupon twice) — a class scanners rarely catch
C) Is only a performance issue
D) Requires physical access

**6.** Understanding exploitation (as a defender):
A) Is unnecessary
B) Is essential — knowing how a class is actually exploited lets you assess real risk, prioritize, and design effective defenses; defense without offense understanding is guesswork
C) Means becoming a criminal
D) Is only for red teams

**7.** A buffer overflow (in memory-unsafe languages):
A) Is impossible today
B) Overwrites memory beyond a buffer's bounds, potentially hijacking control flow — mitigated by memory-safe languages, ASLR, DEP, and stack canaries, but still relevant
C) Only affects web apps
D) Is a network attack

**8.** Why memory-safe languages matter for security:
A) They are faster
B) They eliminate entire classes of vulnerabilities (buffer overflows, use-after-free) by design — a major reason security-sensitive new code favors them
C) They cannot have bugs
D) They are the same as unsafe languages

**9.** A "confused deputy" problem:
A) Is a UI bug
B) Is when a privileged component is tricked by a less-privileged caller into acting on its behalf — SSRF and some CSRF are instances; defended by carrying and checking the real requester's authority
C) Is a network attack
D) Is a password issue

**10.** Prototype pollution (in JavaScript ecosystems):
A) Does not exist
B) Is when attacker-controlled input modifies base object prototypes, affecting the whole application — a real class in JS/Node apps and dependencies
C) Is a CSS issue
D) Is the same as XSS

**11.** A timing attack:
A) Is about slow pages
B) Extracts secret information by measuring how long operations take (e.g., comparing secrets character by character) — defended by constant-time comparisons for sensitive checks
C) Is a denial of service
D) Is impossible over a network

**12.** Deserialization attacks in depth:
A) Are rare
B) Can lead to remote code execution when untrusted serialized data is turned into objects with side effects — avoid native deserialization of untrusted input entirely where possible
C) Only leak data
D) Are the same as SQL injection

**13.** Server-side template injection (SSTI):
A) Is client-side
B) Occurs when user input is embedded into a server-side template engine and evaluated, potentially leading to code execution — never render untrusted input as a template
C) Is the same as XSS
D) Does not exist

**14.** Prioritizing a backlog of findings:
A) By discovery date
B) By risk — exploitability, exposure, and impact — and by chaining potential, so effort goes where real-world harm is most likely and severe
C) By ease of fixing only
D) Alphabetically

---

## Section B — Applied Cryptography (Q15–Q26)

**15.** Choosing an encryption approach:
A) Invent one
B) Use vetted, current standards through reputable libraries, with correct algorithm, mode, key size, and parameters — the pitfalls are in the details, not the algorithm name
C) Use the oldest available
D) Any algorithm works

**16.** AES in ECB mode:
A) Is the most secure mode
B) Is insecure for most data — identical plaintext blocks produce identical ciphertext, leaking patterns; use an authenticated mode like GCM instead
C) Is required for AES
D) Is the same as GCM

**17.** Authenticated encryption (e.g., AES-GCM):
A) Only encrypts
B) Provides both confidentiality and integrity/authenticity — detecting tampering — which plain encryption modes do not; prefer it for most needs
C) Is slower and worse
D) Is deprecated

**18.** An initialization vector (IV) / nonce:
A) Can be reused freely
B) Must be used correctly (often unique per encryption) — reusing a nonce in some modes catastrophically breaks security
C) Is the key
D) Is optional always

**19.** Key management:
A) Is the easy part
B) Is the hard part of applied cryptography — generation, storage, rotation, and destruction of keys via a KMS/HSM matter more than the cipher choice
C) Is unnecessary
D) Means hardcoding keys

**20.** Password hashing at this level:
A) Any hash with a salt
B) A memory-hard, tunable algorithm (argon2id preferred, bcrypt/scrypt acceptable) with appropriate parameters, unique salts, and periodic parameter increases as hardware improves
C) SHA-256 with salt
D) Encryption

**21.** Hashing versus HMAC:
A) Are the same
B) A plain hash verifies integrity against accidental change; an HMAC uses a secret key to verify integrity and authenticity against tampering — use HMAC when authenticity matters
C) HMAC is weaker
D) Hashing is keyed

**22.** Perfect forward secrecy:
A) Means keys never change
B) Ensures that compromise of a long-term key does not expose past session traffic — modern TLS configurations provide it via ephemeral key exchange
C) Is a hashing property
D) Is unbreakable

**23.** Certificate and PKI trust:
A) All certificates are equal
B) Trust derives from a chain to a trusted certificate authority; validation of the chain, expiry, revocation, and hostname is what makes TLS meaningful
C) Is automatic and needs no validation
D) Is the same as encryption

**24.** Storing cryptographic keys in application code or config files:
A) Is acceptable if encrypted with another hardcoded key
B) Defeats the purpose — keys belong in a KMS/HSM or secrets manager with access control and auditing, not alongside the code
C) Is required
D) Is safe if the repo is private

**25.** A weak random source for tokens/keys:
A) Is fine
B) Is a serious vulnerability — cryptographic material must come from a CSPRNG; predictable randomness has broken many real systems
C) Is faster and adequate
D) Does not matter

**26.** When asked to "encrypt this so it cannot be decrypted":
A) Comply
B) Recognize the requirement is actually hashing (one-way) or that the goal needs clarification — the mismatch between encryption and hashing is a common, consequential confusion to catch
C) Use a stronger cipher
D) It is impossible to clarify

---

## Section C — Cloud and Container Security (Q27–Q40)

**27.** The cloud shared responsibility model:
A) The provider secures everything
B) The provider secures the infrastructure; the customer secures their configuration, data, identities, and workloads — most cloud breaches are customer-side misconfigurations
C) The customer secures nothing
D) Applies only to on-prem

**28.** Overly permissive IAM policies (e.g., wildcard permissions):
A) Are convenient and fine
B) Are a top cloud risk — least privilege applies strongly to cloud identities and roles; broad permissions turn any compromise into a full breach
C) Are required
D) Cannot be exploited

**29.** A publicly exposed storage bucket/blob:
A) Is a feature
B) Is a classic breach cause — default to private, enforce it with policy, and continuously audit for accidental exposure
C) Is safe if the URL is secret
D) Is the provider's fault

**30.** Cloud instance metadata service (IMDS):
A) Is harmless
B) Can expose credentials via SSRF if unprotected — use hardened versions (e.g., IMDSv2) and network controls to prevent credential theft
C) Is public by design
D) Is a firewall

**31.** Secrets in cloud environments:
A) Environment variables in the console
B) A managed secrets service with access control, rotation, and audit — not plaintext in configs, images, or code
C) Baked into machine images
D) In the instance metadata

**32.** Container image security:
A) Images are inherently safe
B) Images can carry vulnerable packages and embedded secrets — scan them, use minimal base images, pin versions, and rebuild to pick up patches
C) Only the app matters
D) Is the registry's job

**33.** Running a container as root:
A) Is required
B) Is unnecessary and risky — a container escape or app compromise then has root; run as a non-root user with a minimal, read-only filesystem where possible
C) Is safer
D) Is the default best practice

**34.** Container escape:
A) Is impossible
B) Is when a process breaks out of container isolation to the host — mitigated by not running privileged containers, dropping capabilities, and keeping the runtime patched
C) Is a network attack
D) Is a feature

**35.** Kubernetes security concerns include:
A) None — it is secure by default
B) RBAC misconfiguration, over-permissive service accounts, exposed dashboards/APIs, missing network policies, and secrets stored insecurely — it needs deliberate hardening
C) Only the nodes
D) Only the network

**36.** Infrastructure as Code (Terraform, etc.) and security:
A) Is unrelated to security
B) Is a major opportunity and risk — misconfigurations become repeatable, but so do secure baselines; scan IaC for misconfigurations before apply
C) Removes the need for security
D) Is only about speed

**37.** A hardcoded credential in a container image or IaC file:
A) Is safe inside the image
B) Is extractable and a common leak vector — images and IaC are widely accessible; keep secrets out and inject at runtime
C) Is encrypted
D) Is required

**38.** Network policies in a cluster/cloud:
A) Are unnecessary
B) Enforce which workloads can talk to which — default-deny east-west traffic limits lateral movement after a compromise
C) Slow the network pointlessly
D) Are the same as a firewall appliance

**39.** Cloud logging and audit trails (e.g., CloudTrail-style):
A) Are optional
B) Are essential for detection and forensics — capturing who did what in the cloud control plane; ensure they are enabled, protected, and monitored
C) Are the provider's concern
D) Slow the cloud

**40.** Cloud Security Posture Management (CSPM):
A) Is a firewall
B) Continuously assesses cloud configuration against best practices to catch misconfigurations (public buckets, open ports, weak IAM) at scale
C) Is antivirus
D) Encrypts data

---

## Section D — Identity and Access at Depth (Q41–Q52)

**41.** Authentication factors:
A) Are all equal
B) Fall into something you know/have/are; combining independent factors (MFA) is far stronger than any single one, and factor strength varies (hardware key > TOTP > SMS)
C) Passwords are strongest
D) SMS is strongest

**42.** Single Sign-On (SSO):
A) Weakens security
B) Centralizes authentication (via SAML/OIDC), improving control and user experience — but makes the identity provider a high-value single point that must be hardened
C) Removes the need for MFA
D) Is the same as a password manager

**43.** OIDC versus OAuth 2.0:
A) Are the same
B) OAuth 2.0 is for authorization (delegated access); OIDC is an identity layer on top of it for authentication — using OAuth alone for "login" is a common mistake
C) OIDC is for authorization
D) OAuth handles identity

**44.** Privileged access management (PAM):
A) Is unnecessary
B) Controls, monitors, and time-limits high-privilege access (admin, root) — just-in-time elevation and session recording reduce the risk of standing privilege
C) Is the same as SSO
D) Removes authentication

**45.** Service accounts and machine identities:
A) Need no management
B) Often outnumber humans and are frequently over-privileged and long-lived — scope, rotate, and monitor them like (or more than) human accounts
C) Are inherently safe
D) Should share credentials

**46.** Standing privilege versus just-in-time access:
A) Standing is safer
B) Just-in-time (granting elevated access only when needed, for a limited time) reduces the window an attacker can abuse compromised privilege
C) Are identical
D) Just-in-time is insecure

**47.** Session management weaknesses:
A) Do not exist with tokens
B) Include session fixation, missing invalidation on logout/password change, overly long lifetimes, and insecure storage — all exploitable
C) Are only about passwords
D) Are the browser's problem

**48.** Federated identity trust:
A) Is risk-free
B) Extends trust to an external identity provider — powerful but requires validating assertions correctly (signatures, audiences, expiry) or it becomes a bypass
C) Removes authentication
D) Is the same as a VPN

**49.** Authorization at scale:
A) Scatter checks through code
B) Benefits from centralized, auditable policy (a policy engine, well-defined RBAC/ABAC) so authorization is consistent, reviewable, and evolvable
C) Should be per-developer
D) Is the UI's job

**50.** Multi-tenancy isolation:
A) Is automatic
B) Must be enforced so one tenant cannot access another's data — a top SaaS risk; every data path must be tenant-scoped and tested
C) Is the database's job alone
D) Is unnecessary

**51.** Credential stuffing:
A) Is a phishing type
B) Is attackers reusing credentials leaked from other breaches against your login — defended by MFA, breached-password detection, rate limiting, and anomaly detection
C) Requires insider access
D) Is the same as brute force exactly

**52.** Break-glass access:
A) Is a normal daily login
B) Is emergency high-privilege access, tightly controlled, heavily logged, and alerted on — for when normal paths fail, not routine use
C) Is unmonitored by design
D) Should be shared

---

## Section E — Detection Engineering and Incident Response (Q53–Q66)

**53.** Detection engineering:
A) Is buying a SIEM
B) Is deliberately building detections for the behaviors and techniques that matter to your environment — and tuning them to be high-signal and actionable
C) Is antivirus
D) Is optional

**54.** Detecting versus preventing:
A) Prevention makes detection unnecessary
B) Both are needed — prevention will fail eventually, and detection limits dwell time and damage when it does; defense in depth spans both
C) Detection makes prevention unnecessary
D) Are the same

**55.** The MITRE ATT&CK framework:
A) Is an encryption standard
B) Is a knowledge base of real-world adversary tactics and techniques — used to map coverage, design detections, and communicate about threats
C) Is a firewall ruleset
D) Is a compliance checklist

**56.** A high-fidelity alert:
A) Fires often on benign activity
B) Reliably indicates something worth investigating — tuning for fidelity is what prevents alert fatigue and missed incidents
C) Is the same as a log
D) Requires no tuning

**57.** Dwell time:
A) Is server uptime
B) Is how long an attacker is present before detection — reducing it is a core goal, because impact grows with time undetected
C) Is patch cadence
D) Is session length

**58.** Log integrity for security:
A) Does not matter
B) Matters greatly — attackers delete or alter logs to hide; forward logs off-host to tamper-resistant storage so evidence survives compromise
C) Is the app's job
D) Is automatic

**59.** Threat hunting:
A) Waits for alerts
B) Proactively searches for signs of compromise that automated detections missed, using hypotheses about attacker behavior
C) Is the same as scanning
D) Is penetration testing

**60.** The incident response lifecycle:
A) Detect and patch
B) Preparation, identification, containment, eradication, recovery, and lessons learned — a repeatable process, not improvisation
C) Blame and fix
D) Announce and apologize

**61.** Containment during an incident:
A) Means shutting everything down always
B) Means limiting spread and damage appropriately — which may be isolating hosts, revoking credentials, or blocking traffic — balanced against preserving evidence and business needs
C) Is the last step
D) Is skipped if data was not lost

**62.** Preserving forensic evidence:
A) Is unnecessary
B) Requires care not to destroy logs, memory, and artifacts while responding — they are needed to understand scope, root cause, and legal exposure
C) Slows response pointlessly
D) Is law enforcement's job only

**63.** Credential compromise response:
A) Change one password
B) Assume broad exposure — rotate affected credentials and keys, invalidate sessions, review for lateral movement, and check what the credential could access
C) Ignore if the user seems fine
D) Wait and monitor

**64.** A post-incident review:
A) Assigns blame
B) Is blameless and focuses on systemic causes and concrete improvements — the goal is preventing recurrence, and blame destroys the candor needed for that
C) Is skipped for small incidents
D) Is a punishment

**65.** Communicating during an incident:
A) Tell everyone everything immediately
B) Follow the plan — inform the right stakeholders with accurate, scoped information; premature or wrong external communication can cause harm
C) Say nothing ever
D) Only tell engineering

**66.** Tabletop and red-team exercises:
A) Are theater
B) Test defenses and response realistically before a real incident — red teams simulate attackers; tabletops rehearse decisions — surfacing gaps at low stakes
C) Replace monitoring
D) Are compliance-only

---

## Section F — Secure Architecture (Q67–Q78)

**67.** Security architecture review:
A) Is a scan
B) Evaluates a system's design for trust boundaries, data flows, authentication/authorization, secrets, and failure modes — catching flaws that no amount of later testing fixes cheaply
C) Is the same as code review
D) Is optional

**68.** Designing for least privilege at the architecture level:
A) Give services broad access for flexibility
B) Scope each component's access to exactly what it needs, so a compromise of one is contained — a design property, not just a config setting
C) Is impossible
D) Is the network's job

**69.** Defense in depth in architecture:
A) One strong control suffices
B) Layered controls (network, identity, application, data) so no single failure is catastrophic — assume any one layer can be breached
C) Means encrypting everything
D) Is redundant

**70.** Secrets in a microservices architecture:
A) Share one secret across all services
B) Each service gets its own scoped, rotatable credentials via a secrets manager, so compromise of one does not compromise all
C) Hardcode per service
D) Use no secrets internally

**71.** A security design that depends on the internal network being trusted:
A) Is sound
B) Is fragile — once an attacker is inside (which happens), flat trust enables lateral movement; zero-trust principles apply internally too
C) Is zero trust
D) Is required

**72.** Input validation at trust boundaries:
A) Once at the edge is enough
B) Should occur at every trust boundary (edge, service-to-service, queue consumers), because internal callers can be compromised and data can be tainted downstream
C) Is the client's job
D) Is unnecessary internally

**73.** Fail-secure design:
A) On failure, grant access to avoid downtime
B) On failure, default to denying access or a safe state — an auth service outage should not become an authorization bypass
C) Means never failing
D) Is a performance concern

**74.** Rate limiting and abuse controls as architecture:
A) Are an afterthought
B) Should be designed in at the edge and for expensive operations — protecting against abuse, brute force, and denial of service by design
C) Are the same as authentication
D) Are unnecessary with a firewall

**75.** Data classification in architecture:
A) All data is equal
B) Classifying data by sensitivity drives where and how it is stored, encrypted, logged, and accessed — controls should match the data's value
C) Is a legal-only concern
D) Is unnecessary

**76.** Designing audit and logging into a system:
A) Add it after a breach
B) Build in security-relevant logging (auth events, privilege changes, sensitive access) from the start, with integrity and retention appropriate to the risk
C) Is the ops team's later job
D) Is unnecessary

**77.** Third-party and supply chain risk in architecture:
A) Is out of scope
B) Is part of the design — vetting dependencies, pinning and verifying artifacts, limiting what third-party code can access, and planning for a compromised dependency
C) Is the vendor's problem
D) Cannot be managed

**78.** Secure defaults in a platform you provide to other teams:
A) Leave security to each team
B) Make the paved road secure by default (hardened templates, safe libraries, automatic secrets handling) so teams are secure without being experts — the highest-leverage architectural security move
C) Are impossible
D) Slow teams down

---

## Section G — Risk, Prioritization, and Collaboration (Q79–Q90)

**79.** Risk-based prioritization at this level:
A) Fix every finding
B) Focus on the risks with real likelihood and impact in your environment, accept or defer low ones explicitly, and communicate the reasoning — you cannot fix everything at once
C) Fix by CVSS only
D) Fix the easy ones only

**80.** Accepting a risk:
A) Is a security failure
B) Is sometimes the right business decision — documented, owned by the appropriate person, time-bound, and revisited; security informs, the business decides
C) Is never allowed
D) Is the security engineer's unilateral call

**81.** A developer team resistant to security work:
A) Force compliance
B) Understand their constraints, make the secure path the easy path, prioritize the highest-risk items, and build the relationship — adversarial security gets bypassed
C) Report them
D) Give up

**82.** Presenting risk to non-security stakeholders:
A) Use CVE numbers and jargon
B) Translate into business impact and likelihood they can act on — "an attacker could access all customer records via this endpoint" beats a technical score
C) Only show scan output
D) Withhold details

**83.** Security as an enabler:
A) Is a contradiction
B) Is the mature framing — helping the business move fast safely, providing secure building blocks and clear guidance, rather than only blocking
C) Is impossible
D) Means lowering standards

**84.** A finding a developer disputes:
A) Insist by authority
B) Demonstrate the risk concretely (a safe proof of concept, the exploit path), and resolve on evidence — sometimes you are wrong, sometimes they are
C) Escalate immediately
D) Drop it

**85.** Security metrics that matter:
A) Number of findings
B) Meaningful signals — mean time to remediate, coverage of critical assets, escaped incidents, and risk reduction — not raw counts that can be gamed
C) Tools purchased
D) Alerts generated

**86.** Mentoring junior security staff:
A) Too early
B) Is part of the role — growing others in the mindset, techniques, and ethics multiplies impact and deepens your own understanding
C) The lead's job only
D) Wastes time

**87.** Building security tooling/automation:
A) Is not security work
B) Is high-leverage — automating detection, scanning, secret detection, and guardrails scales a small security team across a large engineering org
C) Is the developer's job
D) Is unnecessary

**88.** Compliance (SOC 2, ISO 27001, PCI DSS, GDPR):
A) Equals security
B) Overlaps with but is not the same as security — compliance is a floor and a framework; a compliant system can still be insecure, and security work should aim higher than the checklist
C) Is irrelevant
D) Replaces security

**89.** Estimating security work:
A) A single number
B) A reasoned range covering assessment, coordination, remediation support, retest, and the risk of the unknown — with the risk clearly communicated
C) The developer's estimate
D) Zero

**90.** When security and delivery pressure conflict:
A) Security always wins
B) Surface the real risk and options clearly, find the most practical mitigation, and let the accountable owner make an informed trade-off — with the highest risks held firm
C) Delivery always wins
D) Stay silent

---

## Section H — Ethics, Judgment, and Growth Toward Convergence (Q91–Q100)

**91.** Authorization and scope for testing:
A) Security staff can test anything
B) Remain mandatory at every level — act within explicit scope and authorization, and never access data beyond what the assessment requires; power increases the responsibility
C) Apply only externally
D) Are a formality

**92.** Handling access to sensitive systems and data:
A) Browse freely — you have access
B) Access is need-to-know and accountable; having the keys is not permission to use them, and misuse is a serious, career-ending, harmful violation
C) Is unlimited
D) Is for seniors only

**93.** Responsible disclosure and coordinated timelines:
A) Publish immediately for credit
B) Report privately, allow reasonable remediation time, coordinate disclosure, and avoid harm — even under pressure to go public
C) Sell the finding
D) Exploit to prove impact

**94.** When you cause or discover your own security mistake:
A) Hide it
B) Report and remediate promptly — concealment compounds risk and destroys the trust the role depends on
C) Blame a tool
D) Ignore it

**95.** Reading and reasoning about the code and systems you assess:
A) Is out of scope for security
B) Is exactly what deepens toward the senior role — you cannot effectively secure or assess what you cannot read and understand across the stack
C) Is the developer's job only
D) Is impossible

**96.** Understanding the business context of security:
A) Is not security's concern
B) Is essential at senior level — security serves the business's goals and risk appetite, and effective security engineers connect technical risk to business impact
C) Is the CEO's job
D) Is a distraction

**97.** Keeping current in a changing field:
A) Is optional
B) Is a professional obligation — new techniques, vulnerability classes, and exploited CVEs emerge constantly; staying current is non-negotiable in security
C) Is for juniors
D) Wastes time

**98.** Working with engineering rather than policing it:
A) Undermines security
B) Is the higher-leverage posture at senior level — embedding security into how teams build, through guidance, tooling, and trust, prevents far more than gatekeeping catches
C) Is impossible
D) Lowers standards

**99.** The mindset shift from Junior 2 to Junior 3 is:
A) Knowing more tools
B) From executing security tasks to owning security for an area — leading threat models, driving remediation, building tooling, and exercising risk judgment
C) More scanning
D) More reporting

**100.** The trait that most reliably unlocks the move to Senior 1 is:
A) Tool mastery
B) Judgment about real risk paired with breadth — reading and reasoning across application, infrastructure, and cloud, influencing engineering culture, and connecting security to the business — the security mindset applied across the whole stack
C) Finding the most bugs
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

*Administrator's note: This is the last specialist-only security exam. The next exam (Junior 3 → Senior 1) is the convergence point and tests broadening into a senior security engineer who operates across the whole stack — reading application, infrastructure, and cloud code, influencing engineering culture, and connecting security to the business. A candidate who aces this but cannot read the systems they assess, or who operates only as a gatekeeper rather than an enabler, should be coached toward that breadth before sitting the convergence exam.*
