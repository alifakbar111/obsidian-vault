# Promotion Exam: Intern → Junior Platform Engineer 1

**Track:** Platform Engineer (Specialist — covers Infrastructure / SRE / DevOps / Systems)
**Format:** 100 multiple-choice questions
**Time:** 120 minutes
**Passing score:** 89 / 100

**Scope.** This exam evaluates whether an intern is ready to be hired as a Junior Platform Engineer 1 — the entry point for the family of roles that keep systems running and enable other engineers to ship: infrastructure, site reliability engineering (SRE), DevOps, and systems engineering. These roles share a common foundation, and this exam tests it: Linux and the command line, how computers and networks actually work, scripting, version control, basic cloud and containers, an introduction to CI/CD, monitoring basics, and the operational mindset. The bar is: "can be trusted with a small, scoped operational or infrastructure task, under supervision, and will not take down production or leave a security hole."

**A note on the operational mindset.** Platform work is different from product development in one crucial way: the blast radius of a mistake is often the entire system, and the work happens on systems real users depend on right now. Care, humility, reversibility, and "measure twice, cut once" are not optional traits here — they are the job. This exam weights that mindset heavily.

---

## Section A — The Operational Mindset (Q1–Q12)

**1.** The defining difference between platform/ops work and product development is:
A) Platform work is easier
B) The blast radius of a mistake is often the whole system, on production that users depend on right now — so caution, reversibility, and care are core to the job
C) Platform work has no deadlines
D) There is no difference

**2.** Before running a command on a production server, the right instinct is:
A) Run it quickly to save time
B) Understand exactly what it does, what it affects, whether it is reversible, and whether there is a safer way — "measure twice, cut once"
C) Run it and see
D) Copy it from the internet directly

**3.** A command you do not fully understand:
A) Should be run to learn
B) Should not be run on anything that matters until you understand it — especially anything destructive (`rm`, `dd`, `DROP`, force flags)
C) Is fine if it looks right
D) Is the senior's problem

**4.** "Reversibility" matters because:
A) It does not
B) An action you can undo is far safer than one you cannot — prefer reversible changes, and know how to roll back before you make a change
C) Rollback is impossible
D) Only forward progress matters

**5.** Making a change directly on a production server by hand:
A) Is the normal way to work
B) Is risky and hard to reproduce or audit — changes should be made through code/automation where possible, so they are repeatable and reviewable
C) Is faster and better
D) Is required

**6.** When you are unsure whether an action is safe:
A) Proceed confidently
B) Stop and ask — in operations, confident guessing on production is how outages happen; verifying first is the professional habit
C) Guess and apologize later
D) Do it in production to test

**7.** The principle of least privilege for operations:
A) Give everyone root to avoid friction
B) Use only the access you need for the task — routine work should not be done as root/admin, so mistakes and compromises are contained
C) Always work as root
D) Remove all access

**8.** Testing a change before production:
A) Is a waste of time
B) Is essential — validate in a non-production environment first, because production is not the place to discover a change is broken
C) Is impossible for infrastructure
D) Is the developer's job

**9.** A "runbook":
A) Is a novel
B) Is documented, step-by-step procedure for a task or incident, so it can be done consistently and correctly, especially under pressure
C) Is a code file
D) Is a firewall rule

**10.** Automating a manual task:
A) Is over-engineering
B) Reduces human error, makes work repeatable and auditable, and frees time — a core value of the DevOps/platform mindset, applied where the task recurs
C) Is always wrong
D) Is the developer's job

**11.** When something breaks in production, the first priority is:
A) Find who to blame
B) Restore service (mitigate impact), then diagnose the cause, then prevent recurrence — users first, blame never
C) Write a report
D) Wait for it to fix itself

**12.** Documenting what you did and why:
A) Is a waste
B) Is essential in operations — the next person (often you) needs to understand changes, and incident response depends on knowing what changed
C) Is the manager's job
D) Slows work

---

## Section B — Linux and the Command Line (Q13–Q30)

**13.** `ls`, `cd`, `pwd`:
A) Are Windows commands
B) List directory contents, change directory, and print the working directory — foundational navigation
C) Are the same command
D) Are deprecated

**14.** A file path starting with `/`:
A) Is relative to the current directory
B) Is an absolute path from the filesystem root
C) Is a hidden file
D) Is invalid

**15.** `chmod` and `chown`:
A) Copy and move files
B) Change file permissions and ownership respectively — central to Linux security and access control
C) Are the same
D) Delete files

**16.** Linux file permissions `rwx` for user/group/other:
A) Are decorative
B) Control who can read, write, and execute a file — misconfigured permissions are a common security and operational issue
C) Only matter for scripts
D) Are Windows-only

**17.** `grep`:
A) Deletes lines
B) Searches text for patterns — indispensable for finding things in logs and files
C) Edits files
D) Is a network tool

**18.** A pipe `|`:
A) Redirects to a file
B) Sends the output of one command as input to the next, composing simple tools into powerful pipelines (e.g., `grep error app.log | wc -l`)
C) Comments a line
D) Is the same as `>`

**19.** `>` versus `>>`:
A) Are identical
B) `>` overwrites the target file; `>>` appends — confusing them can destroy data
C) `>>` is faster
D) `>` appends

**20.** `ps` and `top`/`htop`:
A) Manage files
B) Show running processes and system resource usage — basic tools for seeing what a machine is doing
C) Are network tools
D) Are editors

**21.** A process using 100% CPU:
A) Is always broken
B) May be legitimate or runaway — investigate which process and why before acting; killing the wrong thing causes an outage
C) Should be killed immediately
D) Is a memory issue

**22.** `df` and `du`:
A) Manage users
B) Show disk space free (`df`) and disk usage by files/directories (`du`) — a full disk is a classic cause of outages
C) Are the same
D) Delete files

**23.** A disk filling to 100%:
A) Is harmless
B) Commonly causes services to fail (cannot write logs, temp files, databases) — monitoring and cleanup matter
C) Speeds the system
D) Only affects storage

**24.** Reading logs in `/var/log` (or via the system journal):
A) Is a developer-only task
B) Is a core operational skill — logs are usually where the evidence of a problem lives
C) Is impossible
D) Requires root always

**25.** `kill` and signals (e.g., SIGTERM vs SIGKILL):
A) Are the same
B) SIGTERM asks a process to shut down gracefully; SIGKILL forces it immediately (no cleanup) — prefer graceful termination so the process can clean up
C) SIGKILL is gentler
D) Signals do nothing

**26.** Environment variables:
A) Are files
B) Are values available to processes (e.g., `PATH`, config, secrets injected at runtime) — used heavily to configure software without changing code
C) Are hardcoded in binaries
D) Are Windows-only

**27.** A shell script:
A) Is compiled
B) Is a text file of shell commands run in sequence — the everyday glue of operational automation
C) Is a binary
D) Is a config file

**28.** `sudo`:
A) Should be prefixed to every command
B) Runs a command with elevated privileges — powerful and dangerous; use it deliberately, not habitually, and never blindly on commands you do not understand
C) Is the same as `su`
D) Is decorative

**29.** SSH:
A) Is a file transfer protocol only
B) Provides secure, encrypted remote access to a machine's shell — the primary way engineers reach servers, secured with keys rather than passwords
C) Is unencrypted
D) Is a web protocol

**30.** SSH keys versus passwords:
A) Passwords are more secure
B) Key-based authentication is stronger and standard for servers — private keys stay secret, public keys go on servers; protect private keys carefully
C) Are the same
D) Keys are deprecated

---

## Section C — How Computers and Systems Work (Q31–Q42)

**31.** CPU, memory (RAM), and disk:
A) Are the same
B) Are distinct resources — CPU does computation, RAM holds active data (fast, volatile), disk stores data persistently (slower) — and each can be a bottleneck
C) Are all storage
D) Do not affect performance

**32.** Data in RAM versus on disk:
A) Both persist through a reboot
B) RAM is volatile (lost on power off/restart); disk persists — which is why unsaved in-memory state is lost when a process or machine restarts
C) RAM persists
D) Disk is volatile

**33.** A process versus a thread:
A) Are the same
B) A process is an isolated running program with its own memory; a thread is a unit of execution within a process sharing its memory
C) A thread is bigger
D) A process is faster

**34.** Swap / paging:
A) Speeds everything up
B) Uses disk as overflow when RAM is full — it prevents crashes but is much slower; heavy swapping ("thrashing") indicates a memory problem
C) Is the same as RAM
D) Is decorative

**35.** A "load average":
A) Is CPU temperature
B) Roughly indicates how many processes are competing to run — sustained load above the core count suggests the machine is overloaded
C) Is memory usage
D) Is network speed

**36.** A file descriptor / handle limit:
A) Is unlimited
B) Is a per-process cap on open files/sockets; hitting it causes "too many open files" errors — a real operational failure mode
C) Does not exist
D) Is a disk size

**37.** A "zombie" or runaway process:
A) Is a virus
B) Is a process in a bad state (defunct, or consuming resources uncontrollably) — worth recognizing and investigating rather than ignoring
C) Is normal and ignorable
D) Is a network issue

**38.** Time synchronization (NTP) across servers:
A) Does not matter
B) Matters a lot — clock drift between machines breaks logs correlation, certificates, distributed systems, and authentication
C) Is automatic and never wrong
D) Is a security tool only

**39.** A graceful restart of a service:
A) Kills it instantly
B) Lets it finish in-flight work and clean up before stopping — important for avoiding dropped requests and corrupted state
C) Is impossible
D) Is the same as SIGKILL

**40.** Idempotency in operations scripts:
A) Is irrelevant
B) Means running the script multiple times produces the same result as once — critical so re-running after a failure is safe
C) Means it runs once only
D) Is a security term

**41.** A system's "state":
A) Does not matter
B) Is the configuration and data that make it what it is — capturing and reproducing state reliably (via automation) is central to platform work
C) Is only the code
D) Is the uptime

**42.** Backups that have never been restored:
A) Are reliable backups
B) Are unverified — a backup is only real once you have tested restoring it; many organizations discover during an outage that their backups do not work
C) Are automatic
D) Are unnecessary

---

## Section D — Networking Basics (Q43–Q56)

**43.** An IP address:
A) Is a domain name
B) Identifies a host on a network; IPv4 looks like `192.168.1.10`, IPv6 is longer
C) Is a port
D) Is a password

**44.** A port:
A) Is a physical cable
B) Is a numbered endpoint for a service on a host (e.g., 443 for HTTPS, 22 for SSH, 5432 for PostgreSQL)
C) Is an IP address
D) Is a firewall

**45.** DNS:
A) Encrypts traffic
B) Translates domain names (example.com) into IP addresses — a frequent source of "it's always DNS" outages
C) Is a firewall
D) Stores passwords

**46.** TCP versus UDP:
A) Are the same
B) TCP is reliable and ordered (connections, retransmission); UDP is fast and connectionless (no delivery guarantee) — chosen by use case
C) UDP is more reliable
D) TCP is connectionless

**47.** A default gateway:
A) Is a firewall brand
B) Is the router a host sends traffic to when the destination is outside its local network
C) Is a DNS server
D) Is a port

**48.** A subnet / CIDR (e.g., `10.0.0.0/24`):
A) Is a port range
B) Defines a range of IP addresses on a network — used to segment and organize networks
C) Is a domain
D) Is a MAC address

**49.** A firewall:
A) Encrypts traffic
B) Allows or blocks network traffic by rules (port, address, protocol) — a primary control for limiting what can reach a system
C) Speeds the network
D) Is antivirus

**50.** `ping` and `traceroute`:
A) Transfer files
B) Test reachability and trace the network path to a host — basic connectivity troubleshooting tools
C) Are editors
D) Are firewalls

**51.** `curl`:
A) Is a text editor
B) Makes HTTP (and other) requests from the command line — invaluable for testing endpoints and APIs
C) Is a firewall
D) Deletes files

**52.** A load balancer:
A) Speeds the disk
B) Distributes incoming traffic across multiple servers and routes around failed ones — enabling scaling and availability
C) Is a database
D) Is a DNS server

**53.** Latency versus bandwidth:
A) Are the same
B) Latency is delay (time for a request to travel); bandwidth is capacity (how much data per second) — different problems with different fixes
C) Bandwidth is delay
D) Latency is capacity

**54.** HTTPS/TLS on the wire:
A) Slows things with no benefit
B) Encrypts traffic and authenticates the server — essential for any traffic crossing untrusted networks
C) Is optional in production
D) Is a firewall

**55.** A reverse proxy:
A) Is a client
B) Sits in front of servers, handling TLS termination, routing, and sometimes caching and rate limiting — presenting a single front to clients
C) Is a database
D) Is a load balancer only, never more

**56.** A connectivity problem between two services:
A) Is always the code
B) Could be DNS, firewall/security-group rules, routing, the service being down, or the port not listening — check systematically rather than assuming
C) Is always the network team's fault
D) Cannot be diagnosed

---

## Section E — Version Control and Scripting (Q57–Q66)

**57.** Git for infrastructure and scripts:
A) Is unnecessary — it is not app code
B) Is essential — infrastructure code, scripts, and configuration belong under version control with history and review, like any code
C) Is for developers only
D) Slows operations

**58.** `git status`, `add`, `commit`, `push`, `pull`:
A) Are app-only commands
B) Are the everyday workflow for tracking and sharing changes — including infrastructure and automation code
C) Are deprecated
D) Deploy servers

**59.** A `.gitignore`:
A) Hides files from the OS
B) Excludes files (build artifacts, local state, secrets) from version control — critically, secrets must never be committed
C) Encrypts files
D) Deletes files

**60.** Secrets in a Git repository:
A) Are fine in private repos
B) Must never be committed — they leak through history and forks; use a secrets manager and environment injection
C) Should be base64 encoded
D) Are safe if deleted later

**61.** A good commit message for an infrastructure change:
A) "fix"
B) Explains what changed and why, so the change is understandable during a future incident or audit
C) The diff repeated
D) The server name

**62.** A shell script that stops on the first error (`set -e`) and treats unset variables as errors (`set -u`):
A) Is over-cautious
B) Is safer — silently continuing after an error in an ops script can cause damage; failing fast is usually correct
C) Slows the script
D) Is deprecated

**63.** Hardcoding a password or host in a script:
A) Is fine
B) Is fragile and insecure — use variables, config, or a secrets manager so scripts are reusable and secrets are not exposed
C) Is faster and better
D) Is required

**64.** Quoting variables in shell scripts (`"$var"`):
A) Is unnecessary
B) Prevents word-splitting and glob bugs — unquoted variables with spaces or special characters cause subtle, dangerous errors
C) Slows the script
D) Is decorative

**65.** A script that will run in production:
A) Should be run without testing to save time
B) Should be tested in a safe environment, be idempotent where possible, handle errors, and be reviewed — production scripts deserve the same care as production code
C) Is disposable
D) Needs no error handling

**66.** Choosing a scripting language (Bash vs Python, etc.):
A) Always Bash
B) Bash suits simple glue and system tasks; Python (or similar) suits anything with logic, data handling, or complexity — matching the tool to the task
C) Always Python
D) Does not matter

---

## Section F — Cloud, Containers, and CI/CD Introduction (Q67–Q82)

**67.** Cloud computing (AWS, GCP, Azure) provides:
A) Free unlimited resources
B) On-demand infrastructure (compute, storage, networking, managed services) you provision and pay for — replacing or augmenting physical servers
C) Only storage
D) A programming language

**68.** A virtual machine (VM):
A) Is a physical server
B) Is a software-emulated computer running on shared physical hardware — the classic unit of cloud compute
C) Is a container
D) Is a database

**69.** A container (e.g., Docker):
A) Is the same as a VM
B) Packages an application with its dependencies into a lightweight, portable, isolated unit that shares the host OS kernel — faster and smaller than a VM
C) Is a physical machine
D) Is a database

**70.** A container image:
A) Is a running container
B) Is the built, versioned template from which containers are run — analogous to a class (image) and instances (containers)
C) Is a VM
D) Is a config file

**71.** "Works on my machine" and containers:
A) Are unrelated
B) Containers largely solve this by packaging the environment with the app, so it runs the same across machines
C) Containers cause it
D) Only VMs solve it

**72.** A container running as root:
A) Is required
B) Is unnecessary and risky — run as a non-root user so a compromise or bug is more contained
C) Is safer
D) Is the default best practice

**73.** Infrastructure as Code (IaC), e.g., Terraform:
A) Is documentation
B) Defines infrastructure in version-controlled code so it is repeatable, reviewable, and auditable — instead of clicking in a console
C) Is a programming language for apps
D) Is a container

**74.** Clicking around a cloud console to make changes ("clickops"):
A) Is best practice
B) Is hard to reproduce, review, or audit — fine for exploration, but real infrastructure should be defined as code
C) Is the same as IaC
D) Is required

**75.** CI (Continuous Integration):
A) Means continuous deployment
B) Automatically builds and tests changes when pushed, catching problems early — the foundation of automated delivery
C) Is a container
D) Is manual testing

**76.** CD (Continuous Delivery/Deployment):
A) Is the same as CI
B) Extends CI toward automatically releasing changes — Delivery means every change is deployable, Deployment means it is actually deployed automatically
C) Is a firewall
D) Is version control

**77.** A CI/CD pipeline:
A) Is a physical pipe
B) Is an automated sequence (build → test → deploy) triggered by code changes — the mechanism that gets code to production reliably
C) Is a database
D) Is a network device

**78.** A build artifact:
A) Should be rebuilt per environment
B) Should be built once and promoted unchanged through environments — rebuilding per environment causes drift and surprises
C) Is a container only
D) Is a log

**79.** Environment configuration (dev/staging/prod):
A) Should be identical to production in secrets
B) Should let the same artifact target different environments via injected config, keeping secrets in a secrets manager, not in code
C) Should be hardcoded
D) Does not vary

**80.** A managed service (e.g., a cloud database):
A) Requires you to manage everything
B) Offloads operational burden (patching, backups, scaling) to the provider — trading some control for less operational toil
C) Is always cheaper
D) Is the same as a VM

**81.** Cloud cost awareness:
A) Is not an engineer's concern
B) Matters — idle resources, oversized instances, and forgotten services waste money; platform engineers should be mindful of cost
C) Is unlimited
D) Is the finance team's job only

**82.** A publicly-exposed cloud storage bucket with private data:
A) Is convenient
B) Is a serious, common security mistake — default to private and verify access settings
C) Is safe if the URL is secret
D) Is the provider's fault

---

## Section G — Monitoring and Reliability Basics (Q83–Q92)

**83.** Monitoring:
A) Is optional
B) Is essential — you cannot operate what you cannot see; metrics, logs, and alerts tell you whether systems are healthy
C) Slows systems
D) Is the developer's job

**84.** A metric (e.g., CPU %, request rate, error rate):
A) Is a log
B) Is a numeric measurement over time, useful for dashboards, alerts, and spotting trends
C) Is an alert
D) Is a config

**85.** An alert:
A) Should fire on everything
B) Should notify humans of conditions that need attention — tuned to be meaningful, because too many alerts get ignored (alert fatigue)
C) Is the same as a log
D) Is decorative

**86.** A good alert:
A) Fires often on normal activity
B) Indicates a real, actionable problem — ideally tied to user impact, not a raw threshold that flaps
C) Requires no response
D) Is silent

**87.** Logs versus metrics:
A) Are the same
B) Logs are discrete event records (good for detail and forensics); metrics are aggregated numbers over time (good for trends and alerting) — both are needed
C) Logs replace metrics
D) Metrics replace logs

**88.** Uptime / availability:
A) Does not matter
B) Measures whether a service is reachable and working — a primary reliability goal, often expressed as a target (e.g., 99.9%)
C) Is the same as speed
D) Is the developer's metric

**89.** A health check:
A) Is a virus scan
B) Is an endpoint or probe that reports whether a service is functioning, used by load balancers and orchestrators to route around unhealthy instances
C) Is a firewall
D) Is a backup

**90.** On-call:
A) Is optional and rare
B) Is being responsible for responding to production issues during a period — a core part of many platform roles, requiring good alerting, runbooks, and rest
C) Is the developer's job only
D) Never happens with good systems

**91.** When paged for an incident at 3 a.m., the first goal is:
A) Root-cause it fully before acting
B) Restore service / mitigate impact first, then diagnose — users are affected now, and deep analysis can follow the fix
C) Wait until morning
D) Blame the last person who deployed

**92.** A post-incident review (post-mortem):
A) Finds someone to blame
B) Is blameless — it examines how the incident happened and what systemic changes prevent recurrence, so people share information honestly
C) Is skipped if service recovered
D) Is a punishment

---

## Section H — Ethics, Security, and Habits (Q93–Q100)

**93.** Access to production systems:
A) Means you can do anything
B) Is a responsibility — use least privilege, act within authorization, and never access data or systems beyond what the task needs
C) Is unlimited
D) Is for seniors only

**94.** A destructive command (`rm -rf`, `DROP`, force-delete) on production:
A) Is routine
B) Demands extreme care — double-check the target, prefer reversible approaches, and when unsure, stop and confirm with someone
C) Should be run quickly
D) Cannot cause harm

**95.** When you cause an outage:
A) Hide it
B) Speak up immediately, focus on restoring service, and contribute honestly to the blameless review — concealment makes everything worse and erodes trust
C) Blame someone else
D) Wait to be found out

**96.** Copy-pasting a command or config from the internet:
A) Is fine if it works
B) Is risky — understand what it does before running it, especially on production or with elevated privileges; a wrong command can cause real damage
C) Is required for speed
D) Is always safe

**97.** Saying "I do not know, let me check":
A) Damages credibility
B) Is essential in operations — confident guessing on production causes outages; verifying first is the professional habit
C) Is for juniors only
D) Should be hidden

**98.** Making a risky change late on a Friday:
A) Is bold
B) Is a common cause of weekend incidents — prefer to make risky changes when people are around to help and there is time to recover
C) Is required
D) Is always fine

**99.** Keeping secrets (keys, passwords, tokens) safe:
A) Store them in scripts and repos
B) Keep them out of code, use a secrets manager, rotate them, and never share them over insecure channels — a leaked infrastructure secret can compromise everything
C) Email them to teammates
D) Hardcode them

**100.** The most reliable predictor of growth for a junior platform engineer is:
A) Speed
B) Curiosity paired with operational care — wanting to understand how systems really work, respecting the blast radius of changes, automating toil, and staying calm and honest when things break
C) Never asking questions
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
