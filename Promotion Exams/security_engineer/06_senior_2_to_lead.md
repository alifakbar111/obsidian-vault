# Promotion Exam 06 — Senior Engineer 2 → Lead Engineer

**Format:** 100 multiple-choice questions, one correct answer each.
**Time limit (suggested):** 150 minutes.
**Passing score:** 89 / 100.
**Scope:** Architecture leadership across multiple teams, technical strategy, advanced trade-off analysis, cross-team collaboration, mentoring at scale, raising team standards, navigating ambiguity, working with product and other leaders, and stewarding a domain over time. The Lead bar is "force-multiplier across multiple teams, owns the technical direction of a domain, and is trusted to make irreversible decisions."

The teaching note for whoever administers this exam: the questions still have a single best answer for grading purposes, but the *reasoning* behind each answer is the real signal. When you sit down with a candidate to debrief the exam, ask them to defend a few of their picks. A Lead Engineer should be able to articulate not just *which* answer is right but *why* the others are subtly wrong, and *when* the wrong answers might actually be the right answer in a different context.

---

## Section A — Architecture Leadership (Q1–Q20)

**Q1.** A small team is choosing between a modular monolith and microservices for a brand-new product. Which is the most senior framing?
A) Microservices because they scale better.
B) The decision depends on team size, deployment maturity, problem complexity, and how confident we are in the bounded contexts; for a small team early on, a well-modularized monolith usually wins and can be split later.
C) Monoliths are obsolete.
D) Whichever the framework du jour favors.

**Q2.** A team proposes adopting a new database for "future flexibility." Which is the most senior response?
A) Approve to keep them motivated.
B) Ask what concrete problem it solves, what the operational cost is, who will run it on-call, and how it interacts with existing data and recovery practices; reject speculative complexity.
C) Reject because of the cost.
D) Run a 3-month proof of concept regardless.

**Q3.** Which is the strongest signal an architecture is *over-engineered*?
A) It has tests.
B) Layers of abstraction without corresponding variability, premature platform work, and patterns that the team cannot maintain.
C) It uses TypeScript.
D) It has multiple modules.

**Q4.** Which is the strongest signal an architecture is *under-engineered*?
A) Files are short.
B) Repeated incidents from missing seams, hard-to-change core abstractions, no clear boundaries between domains, and recurring "we should have done X" in retros.
C) The repo is small.
D) Only one service exists.

**Q5.** When evaluating an architectural change, which time horizons should you weigh?
A) Only today.
B) Today's delivery, the next 6–18 months of likely change, and the cost of reversal if we are wrong.
C) Only the long term.
D) Only the next sprint.

**Q6.** Which is the best characterization of "reversible vs irreversible" decisions?
A) They are all the same.
B) Reversible (one-way doors are rare; many are two-way doors): move quickly. Irreversible: invest in rigor up front.
C) Make all decisions irreversible to commit the team.
D) Avoid irreversible decisions forever.

**Q7.** Which is the most useful design-doc section that *Leads* push their teams to write?
A) The font choice.
B) Explicitly: non-goals, constraints, alternatives considered, decision criteria, risks, rollout, rollback, and how we will measure success.
C) The committers list.
D) The Slack channel.

**Q8.** Which is the most senior way to handle a colleague's design with a different approach you mildly disagree with?
A) Block it.
B) Probe their reasoning, surface concerns once with evidence, and if their reasoning is sound, let them own the decision and the consequences.
C) Demand your version.
D) Escalate to the CTO.

**Q9.** Which of these is the strongest *guardrail* a Lead can install?
A) More meetings.
B) Clear, automated checks at the right layer (CI, lint rules, type rules, contract tests, schema-compatible migrations) so the team can move fast without breaking things.
C) Hand-review every commit.
D) Add many manual approvals.

**Q10.** Which is the best response to "we always have incidents in module X"?
A) Ignore until it stops.
B) Treat the pattern as a data point: invest in a root-cause review across incidents, identify the architectural debt, and fund a focused improvement with a measurable goal.
C) Rotate the on-call.
D) Rewrite the system.

**Q11.** Which is the best practice for choosing what to *standardize* across teams?
A) Standardize everything.
B) Standardize the boring, expensive-to-vary things (auth, observability, deployment, logging, secrets), and let teams choose where it matters less.
C) Let every team choose everything.
D) Standardize based on the loudest voice.

**Q12.** Which is the strongest case for a *paved road* (golden path)?
A) It enforces conformity.
B) Reduces cognitive load, makes the safe path the easy path, frees teams to focus on their problem, and concentrates platform investment.
C) Eliminates choice.
D) Required by SOC 2.

**Q13.** Which is the most senior view of "platform vs product teams"?
A) Platforms are second-class.
B) Platform exists to serve product outcomes; treat product teams as customers, measure adoption, and continuously prove the platform's value.
C) Platforms decide everything.
D) Products decide everything.

**Q14.** Which is the best way to manage a long-running architectural migration?
A) Do everything at once.
B) Define the target, set a clear "no new code in the old path" line, migrate incrementally with metrics, communicate progress, and protect time across many sprints.
C) Pause feature work entirely.
D) Force-migrate over a weekend.

**Q15.** Which is the strongest argument for *contract-first* API design between teams?
A) Stops bikeshedding.
B) Forces explicit, reviewable agreements; enables parallel work and easier breakage detection; reduces accidental coupling.
C) Replaces tests.
D) Required by HTTP.

**Q16.** When a service has an unhealthy *blast radius*, which is the best response?
A) Add monitoring only.
B) Reduce the surface (smaller deployable units, isolation by tenant or feature, rate limits, bulkheads), and improve recovery time, not just detection.
C) Add retries.
D) Add more servers.

**Q17.** Which is the most senior reaction to a tooling preference debate (e.g., REST vs gRPC, monorepo vs polyrepo)?
A) Decree.
B) Anchor in the team's constraints, write the decision criteria, run a tightly-scoped spike if uncertainty is high, decide explicitly, document, and move on.
C) Survey the internet.
D) Endless meetings.

**Q18.** Which is the most useful test of a proposed architecture?
A) "Is it elegant?"
B) "Walk me through what happens on a 99th-percentile-bad day: failures, retries, partial outages, security incidents, late-night on-call."
C) "Is it new?"
D) "Does it use the latest framework?"

**Q19.** Which is the strongest reason to *delay* a big architectural change?
A) The team is tired.
B) Unclear problem, unclear measures of success, low confidence in the target shape, or competing higher-leverage work.
C) Holidays.
D) The CTO is on vacation.

**Q20.** Which is the strongest reason to *accelerate* a big architectural change?
A) Quarterly OKRs say so.
B) The current shape is causing recurring user impact, blocking the next 1–2 quarters of work, and the change has a high-confidence path with manageable risk.
C) The team wants to learn.
D) A blog said so.

---

## Section B — Cross-Team Collaboration and Influence (Q21–Q40)

**Q21.** Which is the most senior behavior when another team's choices affect yours?
A) Complain in private.
B) Engage directly, early, with specific concerns and proposals; assume positive intent; document agreements; raise to leaders only if blocked.
C) Build a workaround silently.
D) Block their PRs.

**Q22.** Which is the best way to influence a peer team without authority?
A) Pull rank with their manager.
B) Bring evidence, share context, frame in their priorities, propose concrete options, and leave them ownership of the call.
C) Threaten.
D) Cc executives.

**Q23.** Which is the strongest cross-team signal of misalignment?
A) Two teams use different languages.
B) Repeated late-stage rework due to clashing assumptions, surprise dependencies, or unclear ownership boundaries.
C) Different naming conventions.
D) Different code editors.

**Q24.** Which is the most useful tool for clarifying cross-team ownership?
A) An org chart.
B) A simple, written ownership map: for each system/component, who owns code, who owns on-call, who decides changes, and who reviews exceptions.
C) An RFC document only.
D) A meeting series.

**Q25.** Which is the best behavior when a dependency team will not commit to your timeline?
A) Escalate immediately.
B) Understand their constraints first, look for smaller paths, propose trades, then escalate with options if you are still blocked.
C) Build it yourself in their code.
D) Threaten to leave.

**Q26.** Which is the most senior reaction to a dependency team shipping something that broke your contract?
A) Public callout.
B) Mitigate first, then a calm direct conversation with their lead, agree on the root cause and prevention (tests/contracts), and write it up.
C) Open a Sev 1 to embarrass them.
D) Suffer quietly.

**Q27.** Which is the strongest way to keep cross-team systems coherent?
A) Big meetings.
B) Shared interfaces and contracts, a small set of senior engineers who keep cross-context, and lightweight forums (architecture council, RFC reviews).
C) One person owns everything.
D) Forbid cross-team work.

**Q28.** Which is the best behavior when product and engineering disagree on scope?
A) Engineering wins.
B) Reframe in user/business outcomes, propose options with cost/value, name the trade-offs, and recommend a decision; align with the product lead.
C) Product wins always.
D) Stall until clarity.

**Q29.** Which is the strongest signal you are doing Lead work, not Senior work?
A) You write the most code.
B) Your week's biggest leverage comes from decisions, conversations, and unblocking others, not from your own commits.
C) You write the cleanest PRs.
D) You answer the most tickets.

**Q30.** Which is the best behavior when an engineer on a *different* team writes risky code touching your domain?
A) Block at PR time only.
B) Engage early on the design, offer alternatives, ensure tests/contracts catch regressions, and document the rules so the next person does not need to ask.
C) File a ticket against them.
D) Ignore.

**Q31.** Which is the most senior reaction to an executive request that is technically misguided?
A) Comply silently.
B) Translate it: what they want is probably an outcome; propose paths to that outcome with trade-offs, and be honest about cost and risk.
C) Refuse outright.
D) Pretend to do it.

**Q32.** Which is the best way to handle "we need a decision today" pressure on a non-urgent architectural choice?
A) Ship the fastest option.
B) Either justify a quick reversible decision openly, or push back on the artificial urgency with the cost of haste.
C) Let the loudest voice decide.
D) Decline to participate.

**Q33.** Which is the strongest argument for explicit *technical ownership* of a domain?
A) Bureaucracy.
B) Accountability and continuity: someone is paying attention, watching health, planning ahead, and onboarding the next owner.
C) Empire-building.
D) Required by HR.

**Q34.** Which of these is the most senior view of *bus factor*?
A) Hope no one quits.
B) Actively pair, rotate ownership, document, and structure the system so any single departure does not stall a critical area.
C) Assign one expert per area.
D) Hire two of everyone.

**Q35.** Which is the best way to deliver an unpopular technical message?
A) Bury it.
B) Privately first with key stakeholders, with options and reasoning; then broadly with empathy, clarity, and a clear path forward.
C) Send a mass email.
D) Avoid the conversation.

**Q36.** Which is the strongest leadership move when a project is in trouble?
A) Wait for a postmortem.
B) Surface it early to stakeholders with specifics, options (cut scope, push date, add capacity), and a recommendation; do not wait for blowup.
C) Reorganize the team.
D) Push harder silently.

**Q37.** Which is the strongest sign of *psychological safety* in a Lead's team?
A) No one disagrees in meetings.
B) Engineers raise concerns early, admit mistakes without fear, ask "naive" questions, and push back on the Lead's own ideas.
C) Everything is unanimous.
D) Nobody talks about incidents.

**Q38.** Which is the strongest move to build psychological safety as a Lead?
A) Announce that it exists.
B) Model it: admit your own mistakes publicly, thank dissent, run blameless postmortems, and never punish the messenger.
C) Mandate it.
D) Send a survey.

**Q39.** Which is the most senior way to deal with a high-performing but harmful engineer (brilliant jerk)?
A) Ignore the behavior because of output.
B) Address the behavior directly and clearly with their manager, document patterns, set expectations and consequences; performance does not exempt impact on the team.
C) Make peace by isolating them.
D) Tolerate forever.

**Q40.** Which is the strongest sign your influence is healthy?
A) You decide everything.
B) Teams make better decisions on their own using frames and standards you helped shape, and they no longer need you in every meeting.
C) Everyone defers to you.
D) Every doc has your name on it.

---

## Section C — Mentoring, Hiring, and Raising the Bar (Q41–Q60)

**Q41.** Which is the most senior view of mentoring?
A) Optional.
B) Core to the Lead role: invest deliberately in junior, mid, and senior engineers; tailor support per person; track their growth.
C) Only for juniors.
D) Reserved for managers.

**Q42.** Which is the best way to mentor a Junior 1?
A) Throw them in.
B) Small, scoped tasks with clear acceptance criteria; pair often; review with patience; explain "why" not just "what"; protect their focus.
C) Read-only access for a year.
D) Only documentation.

**Q43.** Which is the best way to mentor a Senior 1 who wants to grow?
A) Give them more tickets.
B) Stretch ownership: scope, design responsibility, on-call leadership, mentoring others; coach on judgment and influence, not just code.
C) Send them to conferences.
D) Compliment them more.

**Q44.** Which is the strongest signal a code review is mentoring well?
A) Many nits.
B) Specific, kind, prioritized comments; explains "why"; teaches a principle; leaves the author capable of doing it without you next time.
C) Approve quickly.
D) Block on style.

**Q45.** Which is the best response to a junior asking a question you have answered ten times?
A) Sigh.
B) Answer kindly, and notice the pattern: it is a documentation or onboarding gap; fix the system.
C) Refer them to the docs that do not exist.
D) Ignore.

**Q46.** Which is the strongest contribution to team health a Lead can make?
A) Write more code.
B) Raise the floor (standards, tooling, onboarding) and raise the ceiling (mentoring, opportunities, ambitious projects).
C) Be the smartest in the room.
D) Approve all PRs.

**Q47.** Which is the most senior approach to writing engineering docs?
A) Write everything yourself.
B) Make docs a first-class artifact owned by the team; review them; keep them current; remove outdated content.
C) Let the wiki rot.
D) Documentation is the writer's job.

**Q48.** Which is the best behavior in interviews as a Lead?
A) Show off.
B) Hire to raise the bar: assess judgment, fundamentals, collaboration, and growth potential; calibrate with peers; document signal honestly.
C) Hire fast at any cost.
D) Hire only people like you.

**Q49.** Which is the strongest hiring red flag at this level?
A) They use a different stack.
B) Lack of curiosity, defensive reaction to feedback, vague reasoning, or evidence of harmful behavior toward teammates.
C) They are quiet.
D) They prefer Python.

**Q50.** Which is the strongest hiring green flag at this level?
A) Memorized algorithms.
B) Clear thinking under ambiguity, asks sharp questions, owns mistakes, communicates trade-offs, and lifts others.
C) Knows your stack.
D) Speaks the loudest.

**Q51.** Which is the best behavior when a candidate fails one of your areas but is otherwise strong?
A) Reject reflexively.
B) Read the signal carefully — is it a learnable gap or a foundational one? Discuss with the panel; do not over-weight a single bad question.
C) Hire and worry later.
D) Add another interview.

**Q52.** Which is the strongest sign of a healthy promotion process?
A) Promotions are easy.
B) Clear, written criteria; calibrated across teams; based on sustained impact; managers and leads agree on signal; surprises are rare.
C) Promotions are quarterly.
D) Promotions track tenure.

**Q53.** Which is the most senior view of *performance feedback* between peers?
A) Avoid it.
B) Give it directly, kindly, specifically, and continuously; do not save it for review cycles; treat receiving it the same way.
C) Only managers give it.
D) Only annual.

**Q54.** Which is the strongest indicator a team's quality bar is sliding?
A) New hires.
B) Recurring incidents from the same root causes, declining review quality, "we'll fix it later" turning into never, and silent acceptance of shortcuts.
C) Many PRs.
D) New CI rules.

**Q55.** Which is the best way to raise the bar without demoralizing the team?
A) Public shaming.
B) Make the standard visible (examples, checklists, automation), invest in skill-building, recognize wins, and address regressions privately and concretely.
C) Demand perfection.
D) Hire more seniors.

**Q56.** Which is the most senior practice with regard to *PIPs* and underperformance?
A) Ignore.
B) The Lead supports the manager's process with honest data, mentoring effort, and emotional support for the team; the decision is the manager's; outcomes are humane.
C) Decide unilaterally.
D) Avoid involvement.

**Q57.** Which is the strongest sign a Lead is *not* growing their successors?
A) The Lead writes the best code.
B) The team cannot make important decisions without the Lead in the room.
C) The team uses many languages.
D) PRs are quick.

**Q58.** Which is the best behavior with a junior who consistently delivers on time but at low quality?
A) Praise the speed.
B) Coach explicitly on quality (tests, code review prep, defensive thinking), set expectations, and verify; raise to manager if no progress.
C) Take their work.
D) Reassign permanently.

**Q59.** Which is the best behavior with a senior who is technically strong but disengaged from team rituals?
A) Force attendance.
B) Have a candid conversation about expectations of seniors (mentoring, reviews, cross-team work), understand the cause, and partner with their manager on path forward.
C) Ignore.
D) Demote.

**Q60.** Which is the strongest sign someone is *over*-leveled?
A) They take vacation.
B) Consistently struggles with the responsibilities of the level; impact is below peers at that level; gap is structural, not a bad month.
C) They are quiet.
D) They prefer one stack.

---

## Section D — Technical Strategy and Trade-Off Analysis (Q61–Q80)

**Q61.** Which is the best way to make a technical strategy?
A) Pick the trendiest stack.
B) Anchor on the company's strategy and users; identify the few capabilities that matter most over 1–3 years; choose investments that compound; sequence them; publish and revise.
C) Copy a big tech blog post.
D) Hire consultants.

**Q62.** Which is the most useful question to ask before any platform investment?
A) "Is it cool?"
B) "What problem do we have today that this solves? How will we measure adoption and value? What is the operational cost?"
C) "Who else uses it?"
D) "What does the CTO want?"

**Q63.** Which is the most senior view of "best practices from FAANG"?
A) Copy directly.
B) They are evidence, not blueprints; their context (scale, team, constraints) is usually very different; adopt the underlying principle, not the form.
C) Ignore entirely.
D) Reject without reading.

**Q64.** Which is the strongest reason to *not* adopt a microservice for a small new capability?
A) Microservices are bad.
B) The operational tax (deployment, observability, on-call, latency, cross-service consistency) outweighs the modularity benefit at this size; a module is enough.
C) The team likes monoliths.
D) HTTP is hard.

**Q65.** Which is the strongest argument for an internal *platform team*?
A) Centralization is virtuous.
B) Recurring needs across product teams that benefit from shared, reliable solutions (auth, payments, observability); only when product teams' demand is real and measurable.
C) Headcount.
D) Hierarchy.

**Q66.** Which is the strongest sign a platform team has lost its way?
A) They have an OKR.
B) They build what they want to build, not what product teams need; adoption is low; product teams build shadow solutions.
C) They have many tools.
D) They have a Slack channel.

**Q67.** Which is the most senior approach to *vendor evaluation*?
A) Cheapest wins.
B) Total cost of ownership, lock-in risk, security and compliance posture, fit with team capability, and an exit plan if it fails.
C) Brand only.
D) Whoever the team likes.

**Q68.** Which is the most senior approach to *lock-in*?
A) Avoid all lock-in.
B) Accept lock-in where the value is high and switching cost is low or the lock-in is in non-core areas; minimize it for core systems.
C) Embrace lock-in always.
D) Run everything self-hosted.

**Q69.** Which is the strongest behavior when an architectural choice has uncertain ROI?
A) Build the full version.
B) Smallest reversible bet that produces real signal; instrument the outcome; expand or roll back deliberately.
C) Wait forever.
D) Outsource it.

**Q70.** Which is the strongest sign of *technical debt being managed well*?
A) None exists.
B) Debt is named, tracked, prioritized against value, paid down deliberately as part of regular work, and revisited; not all debt is paid, but the right debt is.
C) Quarterly tech-debt sprints only.
D) Debt is never discussed.

**Q71.** Which is the most useful framing of "build vs buy" at this level?
A) Always build.
B) Build only the things that differentiate us; buy or use OSS for the rest, with care about cost, fit, and lock-in.
C) Always buy.
D) Whichever is faster to demo.

**Q72.** Which is the most senior reaction to a "10x engineer" myth?
A) Hire them.
B) Treat individual heroics as a smell; design systems and teams where consistent excellence is normal, not exceptional.
C) Promote them.
D) Pay them more.

**Q73.** Which is the best practice for *capacity planning*?
A) Spreadsheet alone.
B) Use observed traffic, growth assumptions, seasonality, headroom for failures, and explicit safety margins; revisit on a cadence.
C) Hope for the best.
D) Always over-provision 10x.

**Q74.** Which is the strongest signal a team is *over-using* feature flags?
A) Many flags.
B) Old flags accumulate with no owner or removal date; code becomes a labyrinth of branches; production behavior is hard to reason about.
C) New flags exist.
D) Flags are typed.

**Q75.** Which is the best behavior when an engineer brings a *novel* design that scares you?
A) Reject.
B) Steel-man it, ask careful questions, look for first-principles evidence, run a contained spike if warranted, and decide on the merits.
C) Approve to be encouraging.
D) Defer indefinitely.

**Q76.** Which is the strongest stance on *AI tooling* and developer productivity?
A) Replace developers.
B) Use it where it amplifies engineers safely; invest in review, evaluation, and guardrails; do not let outputs bypass the team's quality bar.
C) Forbid it.
D) Mandate one tool.

**Q77.** Which is the strongest stance on *generated code* (from AI or otherwise) in the codebase?
A) Trust it.
B) Treat it like a junior's PR: review carefully, test thoroughly, ensure the author understands what they shipped and can defend it.
C) Reject all of it.
D) Skip review for speed.

**Q78.** Which is the best behavior when an engineer asks "should we use X?" where X is hyped?
A) Yes/no flat answer.
B) Ask what problem X would solve, what we already have, what the cost is, who would run it, and how we would know it was a good choice in 6 months.
C) Defer to the loudest engineer.
D) Wait for management.

**Q79.** Which is the strongest argument for a "tools and standards" guild across teams?
A) Conformity.
B) Reduces drift, shares lessons, makes mobility between teams easier, and concentrates investment on shared problems.
C) Required for SOC 2.
D) Limits autonomy.

**Q80.** Which is the strongest sign of a healthy long-term roadmap?
A) Detailed every quarter.
B) Clear themes and bets; near-term work specific, far-term work intentional but not over-specified; revisited regularly with reality.
C) Two-year Gantt charts.
D) Quarterly OKRs only.

---

## Section E — Lead Judgment and Stewardship (Q81–Q100)

**Q81.** Which is the strongest sign you are operating as a Lead, not as a senior IC?
A) You attend more meetings.
B) Your impact comes substantially through others — designs you shaped, engineers you grew, standards you set, problems you saw coming.
C) You write more docs.
D) You manage on-call schedules.

**Q82.** Which is the strongest sign of "lead by example"?
A) Working the most hours.
B) Living the standards you ask of others: writing the design docs, owning the postmortems, taking the unglamorous tasks, and admitting mistakes openly.
C) Owning the cleanest PRs.
D) Speaking first.

**Q83.** Which is the best behavior when your own past technical decision is being criticized fairly?
A) Defend at all costs.
B) Acknowledge the data, name what you would do differently with current context, and use it as a learning moment for the team.
C) Pretend you knew it would fail.
D) Blame the previous team.

**Q84.** Which is the best behavior under *severe time pressure*?
A) Push harder, skip checks.
B) Be more deliberate at the edges: protect rollback paths, double-check destructive operations, communicate status, and resist heroics.
C) Move all work to one person.
D) Skip on-call.

**Q85.** Which is the strongest practice for *managing your own attention*?
A) Be reactive in Slack.
B) Block deep-work time for the highest-leverage 1–2 problems; default to async; protect the team's focus too.
C) Read every channel.
D) Always be available.

**Q86.** Which is the most senior approach to "the team is burning out"?
A) Add a "wellness initiative."
B) Look at structural causes (toxic work, on-call load, scope creep, weak prioritization), fix them with leadership, and protect the team explicitly.
C) Tell them to take PTO.
D) Hire more.

**Q87.** Which is the strongest sign of a Lead taking *too much* on themselves?
A) Many open PRs.
B) Decisions stall when they are away; the team feels they cannot ship without them; growth of others has slowed.
C) Long days.
D) Many tabs open.

**Q88.** Which is the best behavior when an executive asks for an estimate on the spot?
A) Give a number and hope.
B) Give a range with assumptions and confidence; promise a sharper answer with specific work and a date.
C) Refuse.
D) Defer to the engineer.

**Q89.** Which is the strongest behavior when the team faces a genuine *ethical* concern about a feature?
A) Build it quietly.
B) Raise it explicitly with stakeholders, propose alternatives, listen to others, and document the discussion; escalate if the harm is significant.
C) Refuse without explanation.
D) Resign.

**Q90.** Which is the best behavior when a senior peer underperforms?
A) Talk behind their back.
B) Direct, kind, specific feedback to them; partner with their manager; do not let peer performance erode the bar silently.
C) Take their work.
D) Wait for the manager.

**Q91.** Which is the strongest indicator of *learned humility* at the Lead level?
A) Self-deprecation.
B) Comfortable saying "I don't know", asking junior engineers for help in their area, and changing your mind in public when shown evidence.
C) Quiet in meetings.
D) Rarely posts.

**Q92.** Which is the strongest sign of *executive trust* in a Lead?
A) They reply to all your messages.
B) They give you ambiguous, important problems and expect you to come back with a plan, not a list of questions; they trust your judgment under uncertainty.
C) They invite you to lunch.
D) They mention you on LinkedIn.

**Q93.** Which is the strongest sign you are *not yet* ready for Lead?
A) You have less than 5 years of experience.
B) You can ship complex code but struggle to make others faster, hesitate on design under ambiguity, or shy away from hard conversations.
C) You are quiet.
D) You like writing code.

**Q94.** Which is the most senior way to handle a *failed* project you led?
A) Spin it positively.
B) Honest postmortem of contributing factors (yours and structural), what you would change, and what you learned; share widely; act on it.
C) Quietly move on.
D) Blame circumstances.

**Q95.** Which is the strongest move when you sense the *strategy* is wrong?
A) Comply and hope.
B) Surface the concerns clearly with evidence and alternatives to your leadership; once a decision is made, support it fully or escalate further with care.
C) Sabotage.
D) Leak to the team.

**Q96.** Which is the strongest behavior when an *incident* reveals a structural problem you have been ignoring?
A) Cover up.
B) Use the incident to fund the right fix; be transparent about the prior trade-off; commit to a path forward with dates.
C) Reorganize the team.
D) Blame the engineer who pushed.

**Q97.** Which is the best behavior when an engineer brings you a *resignation*?
A) Counter-offer reflexively.
B) Listen first to understand; acknowledge; if retention is right, address root causes (growth, scope, manager fit, comp) not just pay; act with dignity either way.
C) Argue.
D) Ignore.

**Q98.** Which is the most useful question to ask yourself weekly as a Lead?
A) "Did I commit?"
B) "Where did I have the most leverage? Where could I have moved the team further? Who is growing because of me? What did I learn?"
C) "Did I attend every meeting?"
D) "Was I online enough?"

**Q99.** Which is the most senior framing of "your job"?
A) Hit deadlines.
B) Stewardship of a domain: its users, its system, its team, its standards, its future — and the people who will inherit it.
C) Manage tickets.
D) Be available.

**Q100.** Which is the strongest summary of the Lead bar?
A) Knows the most.
B) Owns a domain; sets a credible direction; raises the floor and ceiling of the team; navigates ambiguity with judgment; earns the trust of peers, leaders, and reports alike.
C) Writes the most code.
D) Speaks at conferences.

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

**Passing threshold: 89 / 100.**

*Administrator's note: this exam intentionally has a high concentration of "B" answers because the multiple-choice format is being used to stress test mature reasoning rather than recall. When debriefing, ask the candidate to explain when answer A (or C, or D) would actually be the right call in a different context. A Lead-ready engineer should be able to argue both sides comfortably.*
