# Promotion Exam: Junior Data Scientist 2 → Junior Data Scientist 3

**Track:** Data Scientist (Specialist — statistics / experimentation / modeling / analysis)
**Format:** 100 multiple-choice questions
**Time:** 150 minutes
**Passing score:** 89 / 100

**Scope.** Junior Data Scientist 3 is the top of the specialist track before convergence into the generalist senior level. A Junior DS 3 owns significant analytical and modeling work with minimal supervision, leads experiment design and causal analysis, builds and validates models responsibly, translates ambiguous business problems into rigorous analyses, works fluently with data at scale, and shows early data-science judgment. This exam tests that depth: advanced modeling and validation, causal inference beyond A/B tests, experimentation at depth, time series and other data types, communicating to influence decisions, and the rigor and judgment a Junior 3 must demonstrate.

**Reminder.** This is the last specialist-only data-science exam. The next exam (Junior 3 → Senior 1) is the convergence point and tests whether the candidate has broadened into a senior who connects analysis to real business decisions and outcomes, works with engineers to put models and analyses into production, reasons about the whole system that produces and consumes the data, and drives decisions through influence. A candidate who aces this but cannot connect their work to decisions or collaborate on productionizing it is not ready for the next gate.

---

## Section A — Advanced Modeling (Q1–Q14)

**1.** Choosing a model for a problem:
A) Always pick the most complex/newest
B) Match the model to the problem, data, interpretability needs, and constraints — and prefer the simplest model that meets the need
C) Always pick deep learning
D) Is arbitrary

**2.** Regularization:
A) Makes models more complex
B) Penalizes complexity to reduce overfitting, trading a little training fit for better generalization — a core tool for controlling variance
C) Is the same as scaling
D) Always hurts performance

**3.** Ensemble methods (e.g., bagging, boosting):
A) Are always worse than a single model
B) Combine multiple models to improve performance and robustness — often strong on tabular data, at the cost of interpretability and complexity
C) Are the same as a single model
D) Cannot overfit

**4.** Hyperparameter tuning:
A) Should use the test set
B) Should use a validation set or cross-validation, never the test set — tuning on the test set leaks and inflates the final performance estimate
C) Is unnecessary
D) Is the same as training

**5.** A model that is highly accurate but completely uninterpretable:
A) Is always acceptable
B) Involves a tradeoff — in some settings the accuracy is worth it, in others (regulation, trust, debugging) interpretability is required; the choice is contextual
C) Is always unacceptable
D) Is the same as an interpretable model

**6.** Class imbalance in a dataset:
A) Never affects models
B) Can cause models to ignore the minority class — addressed by appropriate metrics, resampling, class weights, or threshold tuning, chosen carefully to avoid distortion
C) Is fixed by accuracy
D) Requires deleting the majority class

**7.** Calibration of predicted probabilities:
A) Does not matter
B) Matters when the probabilities are used as probabilities (e.g., for expected-value decisions) — a model can rank well but output miscalibrated probabilities
C) Is the same as accuracy
D) Is always perfect

**8.** A model's performance degrading over time in production:
A) Is impossible
B) Is common (data/concept drift) — the world changes, so models must be monitored and retrained; a model is not "done" at deployment
C) Means the code broke
D) Never happens with good models

**9.** Feature importance from a complex model:
A) Proves causation
B) Indicates association within the model, and can be unstable or misleading (correlated features, method artifacts) — useful but interpreted with care, not as causal truth
C) Is always reliable
D) Is meaningless

**10.** Interpretability techniques (e.g., partial dependence, SHAP-style attributions):
A) Reveal true causation
B) Help explain model behavior and build trust or debug, while remaining descriptions of the model, not proofs of real-world causation
C) Are always exact
D) Are useless

**11.** Choosing between a simpler interpretable model and a complex black box:
A) Always the black box
B) Depends on the accuracy gain, the stakes, the need for explanation, and the deployment context — sometimes a small accuracy loss is worth interpretability
C) Always the simple one
D) Is arbitrary

**12.** A model trained on data that no longer reflects reality:
A) Is still valid
B) Will make unreliable predictions — the training distribution must reasonably match the deployment distribution, and shift invalidates the model
C) Improves over time automatically
D) Cannot be detected

**13.** Validating a model beyond a single metric:
A) One number suffices
B) Requires checking error types, subgroup performance, calibration, robustness, and behavior on edge cases — honest validation is multi-faceted
C) Is the engineer's job
D) Is impossible

**14.** A model that memorizes rather than generalizes:
A) Is ideal
B) Is overfitting — strong training performance with weak generalization; detected by held-out evaluation and addressed with regularization, more data, or simpler models
C) Is the goal
D) Cannot be detected

---

## Section B — Causal Inference (Q15–Q28)

**15.** The fundamental problem of causal inference:
A) There is none
B) You cannot observe the same unit both treated and untreated at the same time — so causal effects require comparing to a constructed counterfactual
C) Is solved by more data
D) Is that data is dirty

**16.** Why observational data makes causal claims hard:
A) It does not
B) Confounders that affect both treatment and outcome can create non-causal associations — without randomization or clever design, causal claims are fragile
C) Because samples are small
D) Because of missing values only

**17.** A confounder:
A) Is the outcome
B) Affects both the treatment and the outcome, biasing naive comparisons — the central obstacle in observational causal inference
C) Is the treatment
D) Is random noise

**18.** Controlling for a confounder:
A) Is unnecessary
B) Attempts to remove its biasing effect (via stratification, regression, matching) — but you can only control for confounders you know and measure, which is the limitation
C) Introduces bias always
D) Is the same as randomization

**19.** Controlling for a variable on the causal path (a mediator):
A) Is always correct
B) Can be a mistake — "adjusting for" a mediator can block the very effect you want to measure; what to control for depends on the causal structure
C) Is the same as a confounder
D) Never matters

**20.** A collider:
A) Should always be controlled for
B) Is a variable influenced by two others; controlling for it can induce a spurious association (collider bias) — an example of how naive "controlling for everything" backfires
C) Is a confounder
D) Is irrelevant

**21.** A natural experiment:
A) Is a controlled lab study
B) Exploits a real-world source of as-if-random variation to estimate causal effects when a true experiment is not possible
C) Is observational with no rigor
D) Proves nothing

**22.** Difference-in-differences:
A) Is a t-test
B) Estimates a causal effect by comparing the change over time in a treated group to the change in a comparable untreated group — under assumptions like parallel trends
C) Requires randomization
D) Is a chart type

**23.** Instrumental variables:
A) Are irrelevant
B) Use a variable that affects the treatment but the outcome only through the treatment, to estimate causal effects amid confounding — powerful but assumption-heavy
C) Are the same as confounders
D) Prove causation with no assumptions

**24.** Regression discontinuity:
A) Is a modeling bug
B) Estimates causal effects near a threshold where treatment assignment changes sharply, treating units just above and below as comparable
C) Requires randomization
D) Is observational with no validity

**25.** Every causal method's validity:
A) Is guaranteed
B) Rests on assumptions that must be stated and, where possible, checked — a causal estimate is only as credible as its assumptions, and hiding them is dishonest
C) Requires no assumptions
D) Is the same across methods

**26.** Concluding "X causes Y" from a strong correlation:
A) Is valid if the correlation is strong
B) Is not justified by correlation alone, however strong — a hallmark error; causal claims need a design or argument that rules out confounding and reverse causation
C) Is always true
D) Depends on the sample size only

**27.** Reverse causation:
A) Cannot happen
B) Is when the presumed effect actually causes the presumed cause (or the direction is ambiguous) — another reason correlation does not establish causal direction
C) Is the same as confounding
D) Is irrelevant

**28.** Communicating a causal estimate from observational data:
A) State it as definitive
B) Present it with its assumptions and caveats, and be clear it is weaker evidence than a randomized experiment — overstating causal certainty misleads decisions
C) Hide the assumptions
D) Claim experimental-strength certainty

---

## Section C — Experimentation at Depth (Q29–Q40)

**29.** A well-designed experiment specifies in advance:
A) Nothing — decide after seeing data
B) The hypothesis, primary metric, guardrail metrics, randomization scheme, sample size, duration, and analysis plan — pre-specification prevents p-hacking and HARKing
C) Only the metric
D) Only the sample size

**30.** A guardrail metric:
A) Is the primary metric
B) Is a metric you watch to ensure a "win" on the primary metric does not cause harm elsewhere (e.g., revenue up but retention down)
C) Is irrelevant
D) Is the same as the primary metric

**31.** Sequential testing / always-valid inference:
A) Is the same as fixed-horizon testing
B) Uses methods designed for continuous monitoring so you can peek without inflating false positives — needed when you want to stop early legitimately
C) Allows naive peeking safely
D) Does not exist

**32.** Interference between experimental units:
A) Never occurs
B) Occurs when one unit's treatment affects another's outcome (social networks, marketplaces, shared resources) — violating independence and requiring special designs (e.g., cluster randomization)
C) Is always negligible
D) Is a coding bug

**33.** A marketplace experiment where treating buyers affects sellers:
A) Can use standard user-level A/B testing safely
B) Suffers from interference — treatment and control are not independent, so naive results mislead; cluster or market-level designs are needed
C) Is impossible to test
D) Has no special concerns

**34.** Heterogeneous treatment effects:
A) Do not exist
B) Are when an effect differs across subgroups — the average effect can hide that a change helps some users and hurts others; worth analyzing, carefully (pre-specified)
C) Are the same as the average effect
D) Prove causation

**35.** Simpson's paradox in experiment analysis:
A) Cannot occur in experiments
B) Can appear when aggregating or slicing improperly, especially with unbalanced groups — a reason to analyze experiments carefully and respect randomization
C) Is a chart type
D) Is irrelevant

**36.** A long-term effect that differs from the short-term result:
A) Never happens
B) Is common — novelty effects fade, and some changes help short-term but harm long-term (or vice versa); long-term holdouts and holdback groups help measure this
C) Proves the short-term result
D) Is a bug

**37.** Multiple experiments running simultaneously:
A) Never interfere
B) Can interact and confound each other — coordination and, where needed, orthogonal assignment or interaction analysis are required at scale
C) Are always independent
D) Are impossible

**38.** A metric that moves but is not the metric you pre-specified:
A) Should be reported as the main finding
B) Is a secondary/exploratory observation — reporting it as if it were the pre-specified result is a form of HARKing; flag it as a hypothesis to confirm
C) Proves the experiment worked
D) Should be ignored entirely

**39.** Statistical significance in an experiment:
A) Means the effect is large and important
B) Means the effect is distinguishable from chance at the chosen level — it must be paired with effect size and practical relevance to guide the decision
C) Proves the change is good
D) Is the only thing that matters

**40.** When an experiment is infeasible (cost, ethics, time):
A) Claim experimental certainty anyway
B) Use the strongest available causal design (natural experiment, quasi-experimental), be explicit about weaker assumptions, and communicate the reduced certainty
C) Give up
D) Guess

---

## Section D — Time Series and Varied Data (Q41–Q52)

**41.** Time series data:
A) Can be treated like independent rows
B) Has temporal structure (trend, seasonality, autocorrelation) that violates independence assumptions — requiring methods and validation that respect time order
C) Has no special properties
D) Is always stationary

**42.** Randomly shuffling time series into train/test splits:
A) Is correct
B) Leaks future information into training — time series must be split respecting time order (train on past, test on future), or performance is fake
C) Improves the model
D) Has no effect

**43.** Autocorrelation:
A) Does not exist
B) Is correlation of a series with its own past values — it violates the independence assumptions of many methods and must be accounted for
C) Is the same as seasonality
D) Is a coding bug

**44.** Seasonality:
A) Is random noise
B) Is a repeating periodic pattern (daily, weekly, yearly) — ignoring it leads to wrong conclusions and poor forecasts
C) Is a trend
D) Is irrelevant

**45.** A spurious trend from a non-stationary series:
A) Is a real finding
B) Can produce misleading correlations between unrelated trending series — a classic pitfall requiring detrending or appropriate methods
C) Proves a relationship
D) Cannot happen

**46.** Forecasting uncertainty:
A) Should be reported as a single number
B) Should include prediction intervals — forecasts are uncertain, and presenting a point forecast without a range implies false precision
C) Is always small
D) Is irrelevant

**47.** Backtesting a forecasting model:
A) Uses future data to predict the past
B) Evaluates the model on historical data as if forecasting forward through time — respecting temporal order, to estimate real forecasting performance
C) Is the same as random cross-validation
D) Is unnecessary

**48.** Text data for analysis:
A) Cannot be analyzed quantitatively
B) Requires processing (tokenization, representation) into a form models can use, with attention to noise, language, and context — a distinct skill from tabular work
C) Is the same as numeric data
D) Is always clean

**49.** Geospatial or hierarchical/grouped data:
A) Has no special structure
B) Has structure (spatial correlation, nested groups) that naive methods ignore, leading to wrong inference — appropriate methods respect the structure
C) Is the same as flat data
D) Cannot be modeled

**50.** Survivorship bias:
A) Does not exist
B) Is drawing conclusions only from cases that "survived" some selection, missing those that did not — a subtle, common source of wrong conclusions
C) Is a sampling method
D) Only affects finance

**51.** Selection bias in a dataset:
A) Is negligible
B) Occurs when the data was selected in a way related to the outcome, distorting analysis — recognizing how data was collected is essential to valid conclusions
C) Is fixed by more data
D) Never happens

**52.** Applying a method designed for one data type to another:
A) Always works
B) Can silently invalidate results — assuming independence for time series, or normality for skewed data, produces wrong conclusions; match the method to the data
C) Has no consequences
D) Is best practice

---

## Section E — Data at Scale and Engineering-Adjacent Skills (Q53–Q64)

**53.** SQL at depth for a Junior 3:
A) Basic SELECTs only
B) Fluent use — window functions, CTEs, complex joins, and efficient queries against large tables, because so much analysis begins with getting the right data correctly
C) Unnecessary
D) The engineer's job

**54.** A query that returns wrong results due to a join fan-out:
A) Is impossible
B) Is a common, silent error — a non-unique join key multiplies rows and corrupts aggregates; sanity-checking row counts and grain catches it
C) Is always obvious
D) Only happens with bad data

**55.** The "grain" of a dataset (what one row represents):
A) Is irrelevant
B) Is fundamental — misunderstanding whether a row is per-user, per-event, or per-day leads to double-counting and wrong aggregates
C) Is always one row per user
D) Never matters

**56.** Working with data too large to fit in memory:
A) Is impossible for a data scientist
B) Requires appropriate tools and techniques (sampling, chunking, distributed processing, pushing computation to the database) — part of scaling analysis
C) Means giving up
D) Is the engineer's job only

**57.** Sampling a large dataset for analysis:
A) Always biases results
B) Is a legitimate technique when done representatively — a well-drawn sample can support valid inference far more cheaply than the full data, if sampling bias is avoided
C) Is never valid
D) Requires the whole population

**58.** Reproducible pipelines from raw data to result:
A) Are unnecessary
B) Are essential at this level — a well-structured, version-controlled, parameterized pipeline makes analysis trustworthy, rerunnable, and maintainable
C) Are the engineer's job
D) Slow the work

**59.** A data quality issue discovered mid-analysis:
A) Ignore it and proceed
B) Investigate and address it — quality problems (nulls, duplicates, wrong units, stale data) silently corrupt conclusions, and finding them is part of the work
C) Is the engineer's problem only
D) Never affects results

**60.** Efficient code for data processing:
A) Does not matter
B) Matters at scale — vectorized operations, appropriate data structures, and pushing work to the database keep analysis feasible on large data
C) Is the engineer's job
D) Is always fast enough

**61.** Version control and code review for analysis:
A) Are unnecessary
B) Improve correctness and collaboration — analysis is code, and review catches errors that would otherwise reach conclusions
C) Are for engineers only
D) Slow the work

**62.** Moving an analysis or model toward production:
A) Is entirely someone else's job
B) Requires collaboration and understanding of what production demands (reliability, monitoring, reproducibility) — a Junior 3 begins engaging with this, bridging toward the senior role
C) Is impossible
D) Is irrelevant to data science

**63.** A model that works in a notebook but not in production:
A) Is production's problem alone
B) Often reflects gaps the data scientist should help close — leakage, environment differences, data availability at serving time — bridging analysis and engineering
C) Is impossible
D) Means the notebook was wrong only

**64.** Documenting data sources, transformations, and assumptions:
A) Is optional
B) Is essential for trust and reproducibility — undocumented pipelines become unmaintainable and their results unverifiable
C) Is the manager's job
D) Slows the work

---

## Section F — Communicating to Influence Decisions (Q65–Q76)

**65.** The purpose of communicating analysis:
A) To show how much work was done
B) To enable a better decision — the analysis has value only if it informs action, which requires clear, honest, actionable communication
C) To display technical skill
D) To confirm the stakeholder's belief

**66.** Structuring a findings presentation:
A) Chronological account of what you did
B) Lead with the answer and recommendation, then the supporting evidence and the caveats — decision-makers need the conclusion first, not a methods narrative
C) All the code first
D) Only the charts

**67.** Tailoring communication to the audience:
A) One format for everyone
B) Adjust depth and framing — executives need implications and confidence; technical peers need methods and validation; both need honesty
C) Always maximum technical detail
D) Always minimum detail

**68.** Presenting uncertainty honestly:
A) Omit it to seem confident
B) Convey it in actionable terms — decision-makers need to know how sure you are to weigh the decision correctly; hidden uncertainty causes overconfident mistakes
C) Show only p-values
D) Is impossible

**69.** A recommendation the data does not fully support:
A) State it confidently anyway
B) Give the best-supported recommendation with its uncertainty, or state honestly that the data is insufficient — fabricated confidence misleads
C) Refuse to recommend anything
D) Only recommend what pleases the stakeholder

**70.** When findings contradict a senior stakeholder's belief:
A) Change the findings
B) Present them honestly and diplomatically, with the evidence — being trusted to tell the truth is the core of the analyst's value
C) Bury them
D) Only present them privately and vaguely

**71.** A misleading chart that supports your recommendation:
A) Use it — it helps the case
B) Do not use it — honest visualization is part of the analyst's integrity, and a persuasive but misleading chart is a breach of trust
C) Is fine if the conclusion is right
D) Is required for impact

**72.** Translating a technical finding into business impact:
A) Is not the analyst's job
B) Is a key senior-adjacent skill — connecting "the model improves recall by X" to "this means Y fewer missed cases, worth Z" makes the analysis actionable
C) Is impossible
D) Is the PM's job only

**73.** Overclaiming from an analysis:
A) Is persuasive and fine
B) Damages trust and leads to bad decisions — claiming more certainty or generality than the analysis supports is a common and serious failure
C) Is required to get buy-in
D) Has no consequences

**74.** A stakeholder misinterprets your result:
A) Let it stand if it helps
B) Correct the misinterpretation — allowing a convenient misreading to drive a decision is a failure of the analyst's duty to accuracy
C) Is not your concern
D) Confirms the result

**75.** Knowing your audience's decision and constraints:
A) Is irrelevant
B) Shapes a useful analysis — understanding what decision is being made, and its constraints, lets you answer the question that actually matters
C) Is the PM's job only
D) Wastes time

**76.** Documentation and reproducibility as communication:
A) Are separate from communication
B) Are part of it — a result others can reproduce, verify, and build on communicates trustworthiness that a slide alone cannot
C) Are unnecessary
D) Are the engineer's job

---

## Section G — Collaboration and Judgment (Q77–Q88)

**77.** Translating an ambiguous business problem into an analysis:
A) Wait for a precise spec
B) Is a Junior 3 skill — working with stakeholders to sharpen a vague ask into a rigorous, answerable question is much of the value
C) Is the PM's job entirely
D) Is impossible

**78.** Collaborating with data engineers:
A) Is unnecessary
B) Is valuable — they own the pipelines and data quality the work depends on, and a Junior 3 partners with them on data access, quality, and productionizing
C) Is adversarial
D) Is the manager's job

**79.** Collaborating with ML engineers to productionize a model:
A) Is entirely their job
B) Is a partnership — the data scientist understands the model and its assumptions, the engineer the production system; both are needed to deploy responsibly
C) Is unnecessary
D) Undermines the scientist

**80.** Mentoring a junior data scientist:
A) Too early
B) Is part of growing to Junior 3 — teaching rigor, honest evaluation, and communication multiplies the team and deepens your own understanding
C) Is the lead's job only
D) Wastes time

**81.** Reviewing another analyst's work:
A) Rubber-stamp
B) Check for leakage, valid methods, honest evaluation, sound assumptions, and correct conclusions — analytical review catches costly errors
C) Skip it
D) Only check formatting

**82.** A model or analysis with high stakes:
A) Treat it like any other
B) Warrants more rigor, review, and caveats — the cost of being wrong scales with the decision, and effort should scale with it
C) Should be rushed
D) Is the manager's responsibility

**83.** When your analysis is inconclusive:
A) Manufacture a conclusion
B) Report it honestly and propose next steps — an honest "inconclusive, here is what we would need" is more valuable than a fabricated answer
C) Hide it
D) Pick a random conclusion

**84.** Balancing rigor with delivery speed:
A) Always maximize rigor regardless of time
B) Match rigor to the stakes and communicate the tradeoff — a quick directional read with stated caveats can be right for a low-stakes decision, while high-stakes needs full rigor
C) Always maximize speed
D) They do not interact

**85.** A quick analysis for a low-stakes decision:
A) Requires the same rigor as a high-stakes one
B) Can be appropriately lighter, as long as the reduced confidence is communicated — matching effort to stakes is judgment, not corner-cutting, when done transparently
C) Should be refused
D) Is always wrong

**86.** Disagreeing with a stakeholder on interpretation:
A) Defer silently
B) Make the evidence-based case, and if still overruled on a factual matter, ensure the honest interpretation is on record — analysts owe the truth to the decision
C) Refuse to engage
D) Override them unilaterally

**87.** Committing to a decision made against your analysis:
A) Undermine it
B) Having voiced the evidence, support the decision's execution professionally — while ensuring the risks you flagged are documented
C) Refuse to help
D) Never voice disagreement

**88.** Owning an analytical area:
A) Means running requested queries
B) Means understanding the domain and its data, framing the right questions, choosing rigorous methods, validating honestly, communicating to drive decisions, and being the person the team trusts on it
C) Means building models only
D) Means dashboards only

---

## Section H — Rigor, Ethics, and Growth Toward Convergence (Q89–Q100)

**89.** Connecting analysis to business decisions and outcomes:
A) Is out of scope for a data scientist
B) Is the broadening the next level requires — a senior connects rigorous analysis to the decisions and outcomes it serves, not just the technical result
C) Is the PM's job
D) Is impossible

**90.** Understanding how the data is produced and consumed:
A) Is irrelevant
B) Matters increasingly — knowing the systems and processes generating the data (and using the results) prevents misinterpretation and is part of whole-system reasoning
C) Is the engineer's job
D) Never matters

**91.** Working toward production:
A) Is beneath a data scientist
B) Is part of the broadening toward senior — collaborating to deploy, monitor, and maintain models and analyses so they deliver value reliably, not just in a notebook
C) Is impossible
D) Is irrelevant

**92.** A recurring class of analytical error on the team:
A) Fix each instance
B) Address the systemic cause — a shared method, a review practice, a template — so the class stops recurring; a Junior 3 thinks beyond individual analyses
C) Is unavoidable
D) Is someone else's problem

**93.** Intellectual honesty at this level:
A) Is optional
B) Is non-negotiable — as influence grows, so does the harm of overclaiming, hidden uncertainty, or p-hacking; honesty is the foundation of trust and value
C) Slows the work
D) Is the manager's concern

**94.** Fairness and bias in models that affect people:
A) Are not the analyst's concern
B) Are a responsibility — models trained on biased data can cause real harm, and evaluating for and mitigating bias is part of responsible senior-track work
C) Are only a legal issue
D) Cannot be measured

**95.** Data privacy and ethical use:
A) Are the legal team's job only
B) Are a shared responsibility — protecting personal data, avoiding harmful uses, and considering the impact of analyses and models on people are part of the role
C) Are irrelevant to analysis
D) Slow the work

**96.** Distinguishing exploratory from confirmatory findings:
A) Is unnecessary
B) Remains essential — as a Junior 3 does more exploration, the discipline of not presenting exploratory findings as confirmed results is what keeps the work trustworthy
C) Makes no difference
D) Is the reviewer's job

**97.** When you do not fully understand a method's assumptions:
A) Use it anyway
B) Learn them before relying on it — a method applied outside its valid assumptions gives confidently wrong results you cannot detect
C) Guess
D) Hide the uncertainty

**98.** Keeping current with methods and their pitfalls:
A) Is unnecessary
B) Is part of the craft — new techniques and better understanding of failure modes both matter, and a senior-track scientist keeps learning both
C) Is for seniors only
D) Wastes time

**99.** The mindset shift from Junior 2 to Junior 3:
A) Faster analyses
B) From executing analyses to owning an analytical area — framing ambiguous problems, leading experiments and causal work, validating rigorously, and driving decisions
C) More models only
D) More dashboards

**100.** The trait that most reliably unlocks the move to Senior 1 is:
A) Knowing the most methods
B) Rigorous, honest judgment about what the data can and cannot support, broadened toward business decisions, production, and whole-system reasoning — turning rigorous analysis into real, trusted impact
C) Producing the most models
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

*Administrator's note: This is the last specialist-only data-science exam. The next exam (Junior 3 → Senior 1) is the convergence point and tests broadening into a senior who connects rigorous analysis to real business decisions and outcomes, collaborates to put models and analyses into production, reasons about the whole system producing and consuming the data, and drives decisions through influence. A candidate who aces this but cannot connect their work to decisions or collaborate on productionizing it should be coached toward that breadth before sitting the convergence exam.*
