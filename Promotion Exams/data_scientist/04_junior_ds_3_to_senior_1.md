# Promotion Exam: Junior Data Scientist 3 → Senior Engineer 1

**Track:** Convergence — Data Science Specialist → Generalist (Data-Focused) Engineer
**Format:** 100 multiple-choice questions
**Time:** 165 minutes
**Passing score:** 89 / 100

**Scope and purpose.** This is the convergence exam for the data-science track, parallel to the other tracks with the same honest adjustment used for QA, Security, Platform, and Data Engineering. A data scientist converging to Senior 1 becomes a **senior engineer who turns rigorous analysis into real, trusted impact across the whole system**: connecting analysis to business decisions and outcomes, collaborating with engineers to put models and analyses into production, reasoning about the systems that produce and consume the data, and driving decisions through influence. This exam confirms the candidate still owns deep statistical and modeling rigor, then tests the breadth — engineering and code literacy, the data platform and production ML, whole-system and business reasoning, and senior judgment and influence.

**A note to the candidate.** If you answer Section A comfortably but struggle with the code-literacy, production, or systems sections, that is information, not failure. A data scientist who can build a rigorous model in a notebook but cannot read the code around it, reason about how it runs in production, or connect it to a business decision is not yet ready for Senior 1. Deliberate broadening beats passing by luck and then struggling in the role.

---

## Section A — Data-Science Rigor a Senior Must Still Own (Q1–Q15)

**1.** A model that looks too good in testing:
A) Ship it — celebrate
B) Is a prompt to hunt for leakage, a bad split, or a mismatched test set — surprising-in-your-favor results get the most scrutiny
C) Proves the method
D) Is always correct

**2.** Correlation and causation:
A) Are interchangeable with enough data
B) Remain distinct — a senior never lets a correlation be presented as causal without a design that justifies it, and guards the team against the error
C) Are the same if significant
D) Do not matter at senior level

**3.** A statistically significant but tiny effect:
A) Is always worth acting on
B) May be practically irrelevant — a senior weighs effect size and real-world value, not significance alone, and communicates the distinction
C) Proves importance
D) Is always a false positive

**4.** p-hacking and HARKing:
A) Are efficient
B) Are forms of self-deception a senior actively prevents — through pre-specification, honest reporting of the analysis process, and a culture of rigor
C) Are required for results
D) Are harmless

**5.** Data leakage:
A) Is a minor concern
B) Is a top cause of models that fail in reality — a senior designs validation and features to prevent it and teaches the team to spot it
C) Improves models
D) Only affects deep learning

**6.** Evaluating a model honestly:
A) One aggregate metric
B) Requires the right metric, a fair held-out set, subgroup checks, calibration where relevant, and comparison to a baseline — a senior sets this standard
C) Is the engineer's job
D) Is training accuracy

**7.** A causal claim from observational data:
A) State definitively
B) Present with its assumptions and reduced certainty versus a randomized experiment — overstating causal certainty misleads decisions, and a senior refuses to
C) Is as strong as an experiment
D) Requires no assumptions

**8.** An experiment's design:
A) Decide the analysis after seeing data
B) Pre-specify hypothesis, metric, guardrails, sample size, and analysis — a senior enforces this and understands interference, peeking, and long-term effects
C) Needs no plan
D) Is the engineer's job

**9.** Uncertainty in results:
A) Hide it for confidence
B) Quantify and communicate it honestly — a senior's credibility rests on being honest about what the data does and does not support
C) Is always negligible
D) Is a weakness

**10.** Bias and fairness in a model affecting people:
A) Ignore if overall accuracy is high
B) Evaluate across groups and mitigate harm — a senior treats fairness and the impact on people as part of responsible modeling
C) Are only legal issues
D) Cannot be measured

**11.** A model degrading in production:
A) Is impossible
B) Is expected (drift) — a senior ensures monitoring and retraining, treating a model as a living system, not a finished artifact
C) Means the code broke
D) Never happens

**12.** Choosing model complexity:
A) Always the most complex
B) The simplest model meeting the need — better generalization, interpretability, and maintainability; a senior resists unnecessary complexity
C) Always deep learning
D) Is arbitrary

**13.** A senior reviewing analytical work looks first at:
A) How fancy the method is
B) Whether the conclusion is valid and honestly supported — no leakage, sound assumptions, right metric, appropriate uncertainty — then the sophistication
C) Lines of code
D) Chart aesthetics

**14.** Reproducibility:
A) Optional
B) A baseline senior standard — analyses and models must be rerunnable and verifiable, or they are not trustworthy
C) The engineer's job
D) Only for research

**15.** A senior data scientist's deepest responsibility is:
A) The fanciest models
B) That the decisions and systems informed by data are actually better and honestly grounded — rigor, honesty, and impact across the work, not just their own analyses
C) The notebook
D) The metric dashboard

---

## Section B — Engineering and Code Literacy (Q16–Q30)

**16.** Reading and writing production-quality code:
A) Is out of scope for a data scientist
B) Is essential at senior level — models and analyses that create value usually run in code others depend on, and a senior engages with that code as a peer
C) Is the engineer's job only
D) Is impossible

**17.** A variable, function, conditional, and loop:
A) Are beneath a data scientist
B) Are constructs a senior reads and writes fluently — notebook-only skills do not survive the move to production and collaboration
C) Are automation-only
D) Do not matter

**18.** Notebook code versus production code:
A) Are the same
B) Differ — production code needs structure, tests, error handling, and reproducibility that exploratory notebooks lack; a senior helps bridge the two
C) Notebooks are always sufficient
D) Production is unnecessary

**19.** Version control fluency (branches, diffs, review):
A) Is the engineer's job
B) Is core — collaborating, reviewing, and reproducing work all depend on it; analysis and models are code under version control
C) Is unnecessary
D) Is impossible

**20.** Writing tests for analytical/model code:
A) Is unnecessary — it is just analysis
B) Catches errors that silently corrupt results — data validation, transformation logic, and pipeline steps benefit from tests, and a senior advocates for them
C) Is the QA team's job
D) Slows the work pointlessly

**21.** A function used across an analysis that has a subtle bug:
A) Only affects one place
B) Can corrupt every result that uses it — a senior reasons about the blast radius of shared code and reviews accordingly
C) Is harmless
D) Cannot happen

**22.** Reading a pull request that changes a data pipeline:
A) Is the engineer's job only
B) Lets a senior data scientist catch changes that affect data meaning, feature computation, or leakage before they reach models and conclusions
C) Is impossible
D) Wastes time

**23.** Code that is not reproducible (hidden state, no seeds, hardcoded paths):
A) Is fine for analysis
B) Undermines trust and collaboration — a senior structures work to be reproducible and parameterized, modeling the standard for the team
C) Is faster and better
D) Is required

**24.** Efficient code at scale:
A) Never matters
B) Matters — vectorization, appropriate data structures, and pushing computation to the database or a distributed engine keep work feasible on large data
C) Is the engineer's job
D) Is always fast enough

**25.** Understanding the software the model lives in:
A) Is irrelevant
B) Is necessary at senior level — how the model is called, what data it receives, and how its output is used all shape whether it works in reality
C) Is the engineer's job only
D) Is impossible

**26.** Debugging why a model behaves differently in production than in the notebook:
A) Is production's problem alone
B) Often requires the data scientist's knowledge of the model plus engineering literacy — leakage, environment or data differences, or serving-time feature gaps
C) Is impossible
D) Means the notebook was wrong only

**27.** Collaborating on code with engineers:
A) Throw the notebook over the wall
B) Work together on turning analysis into reliable, maintainable, tested production code — a senior partners rather than hands off
C) Is unnecessary
D) Undermines the scientist

**28.** APIs and how a model is served:
A) Are irrelevant to a data scientist
B) Are worth understanding — how a model is exposed and consumed (latency, input format, batching) affects design and whether it can be used
C) Are the engineer's concern only
D) Are impossible to grasp

**29.** Reading logs and errors from a running system:
A) Is the engineer's job
B) Is a senior skill — diagnosing why a model or pipeline failed in production depends on reading its logs and errors
C) Is impossible
D) Wastes time

**30.** A senior data scientist who cannot read or write real code:
A) Is fine — notebooks suffice
B) Is limited — code and engineering literacy is what lets analysis become reliable production impact and lets the scientist collaborate as a peer
C) Is the norm
D) Should stay in notebooks

---

## Section C — The Data Platform and Production ML (Q31–Q44)

**31.** Where the data comes from:
A) Is irrelevant to analysis
B) Is essential context — a senior understands the pipelines, sources, and transformations upstream, because they shape the data's meaning, biases, and reliability
C) Is the engineer's concern only
D) Never matters

**32.** A data pipeline feeding your features:
A) Can be trusted blindly
B) Is a dependency whose changes, delays, or errors affect your models and analyses — a senior monitors and reasons about it
C) Never fails
D) Is irrelevant

**33.** Training-serving skew:
A) Does not exist
B) Is when features computed at training time differ from those at serving time — a top cause of models that work offline but fail live; a senior guards against it
C) Improves models
D) Is a code style issue

**34.** Feature availability at prediction time:
A) Is always guaranteed
B) Must be verified — a feature available in historical training data may not exist (or may be stale) when the model runs live; designing for serving reality prevents failure and leakage
C) Is the engineer's job only
D) Never matters

**35.** A model in production:
A) Is done once deployed
B) Needs monitoring (performance, drift, data quality), retraining, and a rollback path — a senior treats deployment as the start of an operational lifecycle
C) Never changes
D) Is the engineer's sole concern

**36.** Model monitoring:
A) Is unnecessary
B) Watches for degraded performance, data drift, and anomalies — because the world changes and silent model decay causes real harm
C) Is the same as training
D) Is optional

**37.** A reproducible training pipeline:
A) Is unnecessary
B) Lets a model be retrained and audited reliably — capturing data version, code, and parameters so results can be reproduced and trusted
C) Is the engineer's job
D) Slows the work

**38.** Batch versus real-time prediction:
A) Are the same
B) Differ in constraints — real-time serving has latency and availability demands that shape model and feature choices; batch is more forgiving
C) Real-time is always better
D) Batch is obsolete

**39.** A/B testing a model in production:
A) Is unnecessary if offline metrics are good
B) Is how you learn the real-world impact — offline metrics do not guarantee live impact, so a senior validates models with controlled online experiments
C) Replaces offline evaluation
D) Is the engineer's job

**40.** Offline metrics improving but the business metric not moving:
A) Is impossible
B) Is common and important — a better offline model may not improve the outcome (proxy failure, deployment issues); a senior investigates the gap
C) Proves the model works
D) Means the business metric is wrong

**41.** A model's cost to run:
A) Is irrelevant to data science
B) Is a real consideration — compute, latency, and complexity have costs, and a senior weighs a marginal accuracy gain against its operational cost
C) Is the finance team's job
D) Never matters

**42.** Data versioning and lineage:
A) Are unnecessary
B) Let you know exactly what data produced a result or model — essential for reproducibility, debugging, and auditing at scale
C) Are the engineer's job only
D) Slow the work

**43.** A model retrained on new data behaving unexpectedly:
A) Is impossible
B) Can reflect data changes, pipeline changes, or drift — a senior investigates rather than blindly promoting the new model, and validates before shipping
C) Is always an improvement
D) Means the code broke

**44.** A senior data scientist's relationship to production:
A) Ends at the notebook
B) Extends into how models and analyses run, are monitored, and deliver value reliably — bridging data science and engineering, in partnership with ML/data engineers
C) Is irrelevant
D) Is to hand off and forget

---

## Section D — Whole-System and Business Reasoning (Q45–Q58)

**45.** Connecting analysis to a business decision:
A) Is the PM's job
B) Is the senior expectation — a senior frames work around the decision it informs and the outcome it should move, not just the technical result
C) Is impossible
D) Undermines rigor

**46.** Understanding the business model and goals:
A) Is irrelevant to data science
B) Sharpens the work — knowing how the business creates value lets a senior choose the right questions, metrics, and tradeoffs
C) Is the executive's job
D) Is a distraction

**47.** A metric chosen for a model or analysis:
A) Any available number
B) Must genuinely reflect the outcome that matters, or the work optimizes the wrong thing — a senior scrutinizes metric choice and guards against proxy failure and gaming
C) Is the engineer's choice
D) Does not matter

**48.** Goodhart's law ("when a measure becomes a target, it ceases to be a good measure"):
A) Is irrelevant to data science
B) Is a real risk a senior watches for — optimizing a metric can distort behavior and undermine the true goal; guardrails and judgment are needed
C) Is a modeling technique
D) Does not apply to models

**49.** The end-to-end system that produces and consumes the data:
A) Is out of scope
B) A senior reasons about it — how data is generated, transformed, modeled, and acted upon — because problems and opportunities live across the whole flow
C) Is the engineer's job
D) Is impossible to understand

**50.** A model's predictions driving an automated action:
A) Has no special implications
B) Raises the stakes — errors act automatically at scale, so a senior considers failure modes, safeguards, monitoring, and the cost of wrong predictions
C) Is always safe
D) Is the engineer's concern only

**51.** A feedback loop where a model's actions change the data it later trains on:
A) Does not exist
B) Is a real, subtle risk — the model can reinforce its own biases or drift; a senior recognizes and designs against harmful feedback loops
C) Always improves the model
D) Is a coding bug

**52.** Short-term metric gains versus long-term outcomes:
A) Always optimize short-term
B) A senior weighs both — a change that lifts a metric now but harms trust or long-term value is often a poor trade
C) Long-term never matters
D) They never conflict

**53.** The cost of a wrong decision informed by analysis:
A) Is the same for all analyses
B) Scales with the decision — a senior scales rigor, review, and caveats to the stakes, investing most where being wrong is most costly
C) Is always low
D) Is the decision-maker's problem only

**54.** Prioritizing analytical work:
A) Do whatever is requested, in order
B) Focus on the highest-impact questions and decisions — a senior helps decide what is worth analyzing, not just how
C) Is the PM's job alone
D) Analyze everything equally

**55.** Translating a technical result into business impact:
A) Is not the analyst's job
B) Is core senior skill — connecting "the model improves X" to "this means Y in outcomes, worth Z" makes the work actionable and earns influence
C) Is impossible
D) Is the PM's job only

**56.** A result that is rigorous but answers a question no one needed:
A) Is still valuable
B) Has little impact — a senior ensures effort goes to questions that matter to real decisions, not just interesting-but-irrelevant analysis
C) Is the goal
D) Is the PM's fault

**57.** Understanding the downstream use of a model or analysis:
A) Is irrelevant
B) Shapes how it must be built and communicated — who uses it, how, and with what consequences determines the required rigor, format, and safeguards
C) Is the user's problem
D) Never matters

**58.** A senior who thinks only about methods, not decisions and systems:
A) Is correctly focused
B) Is missing the role — the senior connects rigorous method to real decisions, production systems, and business outcomes, reasoning across the whole picture
C) Is efficient
D) Is the norm

---

## Section E — Senior Judgment and Influence (Q59–Q74)

**59.** Influence at senior level:
A) Requires a management title
B) Comes from credibility — rigorous, honest work, clear communication, and being reliably right earn influence over decisions
C) Means being loudest
D) Is impossible for an IC

**60.** Presenting to leadership:
A) Show all the methods
B) Lead with the answer, recommendation, and confidence, connect it to outcomes leadership cares about, and be honest about uncertainty and caveats
C) Show only code
D) Confirm their beliefs

**61.** Findings that contradict leadership's belief:
A) Change them
B) Present honestly and diplomatically with the evidence — a senior's value depends on being trusted to tell the truth, especially when unwelcome
C) Bury them
D) Share only vaguely

**62.** A stakeholder wants analysis to justify a decision already made:
A) Provide the justification
B) Clarify that analysis informs rather than rubber-stamps, and present what the data honestly shows — while being politically astute about how
C) Fabricate support
D) Refuse rudely

**63.** Mentoring data scientists:
A) The manager's job only
B) Is core to being senior — growing others in rigor, honest evaluation, and communication multiplies the team and deepens the senior's mastery
C) Wastes time
D) Premature

**64.** A junior's analysis with a subtle leakage error:
A) Ignore it
B) Coach — show the error, explain why it inflates results, and teach how to prevent it; growing the team's rigor is high-leverage
C) Redo it silently
D) Reject harshly

**65.** Reviewing analytical work as a senior:
A) Rubber-stamp
B) Check validity, leakage, assumptions, metric choice, honest evaluation, and conclusions — and raise the team's standard through the review
C) Skip it
D) Only check formatting

**66.** A contested interpretation of data:
A) The most senior person wins
B) Resolve on evidence and sound reasoning — the best-supported interpretation should win, and a senior fosters that culture over hierarchy
C) The scientist always wins
D) Drop it

**67.** Collaborating with engineers, PMs, and domain experts:
A) Is a distraction
B) Is core to impact — a senior works across functions to frame questions, access data, productionize models, and drive decisions
C) Is the manager's job
D) Undermines the scientist

**68.** Setting the rigor standard for the team:
A) Only the manager does this
B) A senior models and upholds it — pre-specification, honest evaluation, reproducibility, and clear caveats — raising the whole team's trustworthiness
C) Is unnecessary
D) Stifles others

**69.** Balancing rigor with delivery:
A) Always maximize rigor regardless of time
B) Match rigor to the stakes and communicate the tradeoff — a quick directional read with caveats suits low stakes; high-stakes decisions need full rigor
C) Always maximize speed
D) They do not interact

**70.** Overclaiming under pressure to deliver a strong result:
A) Is acceptable to satisfy stakeholders
B) Is a failure of integrity that leads to bad decisions — a senior holds the honesty line even when a stronger claim would be welcome
C) Is required
D) Has no consequences

**71.** Committing to a decision made against your analysis:
A) Undermine it
B) Having voiced the evidence, support execution professionally while ensuring the flagged risks are documented
C) Refuse to help
D) Never voice disagreement

**72.** A senior's demeanor when an analysis or model fails:
A) Blame the data or others
B) Own it, investigate honestly, learn, and improve the process — the team takes its cue from the senior's response
C) Hide it
D) Withdraw

**73.** Communicating uncertainty to drive good decisions:
A) Omit it for confidence
B) Convey it in actionable terms so decisions are weighted correctly — a senior's honest uncertainty is more valuable than false certainty
C) Show only p-values
D) Is impossible

**74.** Advocating for what the data shows against business pressure:
A) Is naive
B) Is a core part of the role's value — a senior brings honest evidence into decisions, especially when pressure pushes against it, and finds workable paths
C) Is the manager's job
D) Is impossible

---

## Section F — Ethics and Responsibility (Q75–Q84)

**75.** As influence grows, the harm of dishonest analysis:
A) Shrinks
B) Grows — a senior's conclusions drive bigger decisions, so honesty about uncertainty, limits, and inconvenient findings matters more, not less
C) Is unchanged
D) Is irrelevant

**76.** Bias and fairness in models affecting people:
A) Not the scientist's concern
B) A responsibility — biased data yields biased, potentially harmful models; a senior evaluates for and mitigates this, and raises it when others overlook it
C) Only a legal issue
D) Cannot be measured

**77.** Data privacy and sensitive data:
A) The legal team's job only
B) A shared responsibility — protecting personal data, minimizing collection, and preventing re-identification are part of responsible senior practice
C) Irrelevant to analysis
D) Slows the work

**78.** A model or metric that could be gamed or cause harm if deployed:
A) Ship it — not your concern
B) Is worth raising — a senior considers second-order effects and misuse, and advocates for safeguards or against harmful deployment
C) Is always fine
D) Is the PM's sole call

**79.** Persuasive but misleading visualization:
A) Fine if the conclusion is right
B) A breach of the analyst's integrity — honest visualization is non-negotiable, and a senior models and enforces it
C) Required for impact
D) Harmless

**80.** Presenting exploratory findings as confirmed:
A) Is efficient
B) Overstates certainty and misleads — a senior keeps the distinction clear and teaches the team to as well
C) Is required
D) Has no downside

**81.** An automated decision system built on a model:
A) Needs no oversight
B) Warrants care about errors, fairness, transparency, and recourse — automated decisions at scale can cause systematic harm, and a senior designs responsibly
C) Is always safe
D) Is the engineer's concern only

**82.** When you discover an error in shipped analysis or a deployed model:
A) Hide it
B) Disclose and correct promptly — the compounding cost of a wrong decision or a bad model far exceeds the discomfort of admitting the error
C) Blame the data
D) Ignore it

**83.** Refusing to produce a knowingly misleading analysis:
A) Is insubordination
B) Is professional integrity — a senior's trustworthiness depends on not manufacturing conclusions to order, and on finding honest ways to help
C) Is never necessary
D) Is career suicide, so comply

**84.** Considering the impact of data work on people and society:
A) Is out of scope
B) Is part of responsible senior practice — models and analyses affect real people, and a senior weighs that impact, not just technical performance
C) Is the ethicist's job
D) Is a distraction

---

## Section G — The Convergence Itself (Q85–Q100)

**85.** The convergence for a data scientist is:
A) Becoming a pure software engineer
B) Broadening from a notebook specialist into a senior who turns rigorous analysis into trusted, production-grade, business-relevant impact across the whole system
C) Becoming a manager
D) Specializing harder in statistics

**86.** A data scientist strong in modeling but weak in code, production, and business context:
A) Is ready for senior
B) Has gaps to close — the senior role requires breadth across engineering, systems, and business, not depth in modeling alone
C) Should specialize further
D) Is complete

**87.** Engaging engineers as a peer:
A) Requires only data-science skill
B) Requires enough code and systems literacy to collaborate on production, understand constraints, and propose realistic solutions — credibility earned through competence
C) Is impossible
D) Is the manager's job

**88.** Connecting rigorous method to real decisions:
A) Is the PM's job
B) Is the senior expectation — analysis tied to the decisions and outcomes it serves, not just technical results in isolation
C) Is impossible
D) Undermines rigor

**89.** Reasoning about the whole data system:
A) Is out of scope
B) Is the senior capability — understanding how data is produced, flows, is modeled, served, and acted upon, so the whole pipeline delivers reliable value
C) Is the engineer's job
D) Is impossible

**90.** Production and monitoring:
A) Are beneath a data scientist
B) Are part of the broadened role — ensuring models and analyses run reliably, are monitored, and keep delivering value, in partnership with engineers
C) Are irrelevant
D) Are only the engineer's job

**91.** A recurring class of error across the team's analyses:
A) Fix each instance
B) Address the systemic cause — a shared method, review practice, or template — so the class stops recurring; a senior thinks in systems
C) Is unavoidable
D) Is someone else's problem

**92.** Judgment about what the data can support:
A) Push for the strongest claim
B) Is the senior's defining skill — knowing the limits of the data and method, and communicating honestly what can and cannot be concluded
C) Is the PM's job
D) Is unnecessary

**93.** Prioritizing across the whole picture:
A) Analyze everything equally
B) Concentrate rigor and effort where the decisions and stakes are highest, accept lighter treatment elsewhere transparently, and communicate the reasoning
C) The PM decides alone
D) Randomly

**94.** Influence through credibility:
A) Requires authority
B) Comes from a track record of rigorous, honest, impactful work and clear communication — a senior leads decisions through trust, not title
C) Means being loudest
D) Is impossible for an IC

**95.** Intellectual honesty at senior scale:
A) Becomes optional
B) Becomes more important — bigger decisions rest on the senior's word, so honesty about uncertainty and limits is the foundation of the role
C) Slows the work
D) Is the manager's concern

**96.** The mindset shift from Junior 3 to Senior 1:
A) Faster analyses
B) From owning an analytical area to turning rigorous analysis into trusted, production-grade, business-relevant impact across the whole system — breadth, influence, and judgment
C) More models
D) More dashboards

**97.** Working with ML/data engineers on production:
A) Is entirely their job
B) Is a partnership — the scientist brings model and data understanding, the engineer the production system; both are needed to deploy responsibly and reliably
C) Is unnecessary
D) Undermines the scientist

**98.** The single trait that most distinguishes Senior 1 from a strong Junior 3:
A) Years
B) Judgment about what the data can support paired with the breadth to reason across code, production, and business, and the influence to turn analysis into trusted impact
C) Method knowledge
D) Model count

**99.** A model or analysis's real value is realized:
A) When it is built
B) When it reliably informs a better decision or runs dependably in production to a good end — a senior owns the path to that realized value, not just the artifact
C) When it is accurate offline
D) When it is complex

**100.** A data-science Junior 3 who passes this exam is signaling:
A) That they know everything
B) That they have broadened into a generalist senior — connecting rigorous, honest analysis to production systems and business decisions across the whole picture — with statistical rigor now a strength they bring to a broader role
C) That they should specialize harder
D) That they are ready to manage

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

*Administrator's note: This is the data-science convergence exam, intentionally demanding for a candidate who has lived only in notebooks and analysis. A Junior 3 who scores 70–80 has done the rigor-and-modeling work and now needs breadth — code and engineering literacy, production ML, whole-system reasoning, and business connection. Coach them, give them assignments that reach into production and real decisions, and re-sit in six months. As with the other tracks, the "generalist" a data scientist converges into is a senior who turns rigorous analysis into trusted impact across the system — calibrate the debrief to your company's actual expectation for the role.*
