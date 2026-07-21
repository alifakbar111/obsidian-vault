# Promotion Exam: Junior AI/ML Engineer 3 → Senior Engineer 1

**Track:** Convergence — ML/AI Engineering Specialist → Generalist Engineer
**Format:** 100 multiple-choice questions
**Time:** 165 minutes
**Passing score:** 89 / 100

**Scope and purpose.** This is the convergence exam for the AI/ML engineering track, parallel to the other tracks with the same honest adjustment used for QA, Security, Platform, Data Engineering, and Data Science. An ML/AI engineer already sits close to software engineering, so the convergence is not about learning to code — it is about breadth *beyond the ML box*. An ML engineer converging to Senior 1 becomes a **senior engineer who ships and operates ML systems that create real, trusted value inside a larger product and organization**: reasoning about the whole system the model lives in (services, backend, data platform), connecting ML work to business outcomes, making sound build-versus-buy and simple-versus-complex calls, and driving decisions through influence. This exam confirms the candidate still owns deep ML-engineering craft — training, evaluation, serving, MLOps, LLM/GenAI systems — then tests the breadth: general backend and systems reasoning, the data platform, whole-system and business judgment, and senior influence.

**A note to the candidate.** If you answer Section A comfortably but struggle with the backend, systems, or business sections, that is information, not failure. An ML engineer who can train and serve a strong model but cannot reason about the service around it, the data platform beneath it, or the business decision it serves is not yet ready for Senior 1. Deliberate broadening beats passing by luck and then struggling in the role.

**A note on the convergence.** As with the other specialist tracks, "converging to Senior 1" here means becoming a senior engineer whose center of gravity is ML systems but who reasons across the whole stack — not necessarily a general product-feature developer. Calibrate the Senior 1 role to what your organization actually needs from a senior ML engineer.

---

## Section A — ML-Engineering Craft a Senior Must Still Own (Q1–Q15)

**1.** A model that looks far better offline than it does in production:
A) Ship it — the offline numbers are what count
B) Is a prompt to hunt for training/serving skew, leakage, or a distribution mismatch — the gap itself is the signal to investigate
C) Proves the model is excellent
D) Means production is broken, not the model

**2.** Training/serving skew:
A) Is a myth
B) Is when features or preprocessing differ between training and serving, silently degrading production performance — a senior designs to prevent it (shared code, a feature store)
C) Only affects deep learning
D) Is the data team's problem

**3.** Choosing a model's complexity:
A) Always the largest, most complex model
B) The simplest approach that meets the need — a senior reaches for a heavier model only when the added value justifies the added cost, latency, and operational burden
C) Whatever is newest
D) Always deep learning

**4.** Evaluation that reflects reality:
A) A single accuracy number
B) Metrics tied to the actual objective, on data representative of production, with attention to slices and failure modes — a senior distrusts a lone aggregate number
C) Training-set performance
D) Whatever looks best

**5.** A model with strong aggregate metrics but poor performance on an important subgroup:
A) Ship it — the average is fine
B) Is a real problem — a senior evaluates slices, because a good average can hide harmful or costly failures on segments that matter
C) Is unavoidable
D) Is the data's fault, not the model's

**6.** Data quality's role in an ML system:
A) Secondary to model choice
B) Often the dominant factor — a senior invests in data quality, labels, and pipelines because better data usually beats a fancier model
C) Irrelevant once the model is trained
D) The data team's sole concern

**7.** Reproducibility of a training run:
A) Unnecessary
B) A baseline standard — versioned data, code, config, and environment so a result can be reproduced and debugged; a senior enforces it
C) Impossible
D) Only for research

**8.** Monitoring a deployed model:
A) Unnecessary once it passes tests
B) Essential — inputs drift, data pipelines break, and performance decays; a senior instruments monitoring for drift, quality, and system health from day one
C) The ops team's job only
D) Only for large models

**9.** Model drift in production:
A) Never happens
B) Is expected — the world changes and inputs shift, so a senior plans for detection and retraining rather than assuming a model stays good forever
C) Means the model was wrong
D) Is the data scientist's problem

**10.** Serving latency and cost:
A) Irrelevant if accuracy is high
B) Are first-class constraints — a senior designs serving (batching, caching, model size, hardware) to meet latency and cost budgets, not just accuracy
C) The infra team's sole concern
D) Never matter

**11.** A reproducible, tested training and serving pipeline versus a one-off notebook:
A) Are equivalent
B) The pipeline is what ships and survives — a senior turns experiments into reliable, testable, automatable systems, not artifacts trapped in a notebook
C) Notebooks are better for production
D) Structure does not matter

**12.** For an LLM/GenAI feature, evaluation:
A) Is impossible, so skip it
B) Requires deliberate methods — curated test sets, rubric or model-based grading, and guarding against regressions — because "looks good in a demo" is not evaluation
C) Is just eyeballing outputs
D) Is the same as classification accuracy

**13.** Retrieval-augmented generation (RAG) versus fine-tuning versus prompting:
A) One is always correct
B) Are different tools — a senior chooses based on the need (fresh/proprietary knowledge favors retrieval; behavior/format shaping may favor fine-tuning; prompting is often the cheapest first move)
C) Fine-tuning is always best
D) Are interchangeable

**14.** Guardrails and safety for an LLM feature:
A) Unnecessary
B) Part of the design — input/output validation, handling prompt injection, limiting harmful or off-task outputs, and failing safely; a senior treats these as requirements, not extras
C) The model provider's job only
D) Impossible

**15.** A senior ML engineer's deepest craft responsibility is:
A) Achieving the highest offline metric
B) That the ML system delivers reliable, evaluated, monitored value in production within real constraints — and that the team's ML engineering rigor rises with theirs
C) Using the newest model
D) The notebook

---

## Section B — Backend and Systems Breadth (Q16–Q30)

**16.** An ML model in production is:
A) A standalone artifact
B) One component of a larger system — services call it, data feeds it, and consumers depend on it; a senior reasons about that whole system, not just the model
C) The entire system
D) Independent of everything else

**17.** The service that wraps a model:
A) Is beneath an ML engineer's concern
B) Is part of what a senior owns — its API design, error handling, timeouts, retries, and resource limits determine whether the model is usable in practice
C) Is purely the backend team's job
D) Does not affect the model

**18.** An API contract for a model service:
A) Does not matter
B) Matters as much as any service's — clear inputs/outputs, versioning, and backward compatibility let consumers depend on it safely; a senior designs it deliberately
C) Is the consumer's problem
D) Should change freely

**19.** Handling a downstream dependency (a database, a feature service) that is slow or down:
A) Let the model service crash
B) Design for it — timeouts, fallbacks, and graceful degradation so a dependency failure does not cascade; a senior applies ordinary reliability engineering to ML services
C) Ignore it
D) Retry forever

**20.** Idempotency and retries in a model-serving path:
A) Irrelevant to ML
B) Matter as in any service — a senior ensures retries and duplicate requests do not cause incorrect or duplicated effects
C) Only matter for databases
D) Automatic

**21.** Caching model predictions:
A) Is never valid
B) Can cut cost and latency when inputs repeat and results are stable — a senior weighs staleness against savings, as with any caching decision
C) Is always safe
D) Is the infra team's job only

**22.** Statelessness and horizontal scaling of a model service:
A) Irrelevant to ML
B) Are standard tools — a senior designs serving to scale out under load like any well-built service, mindful of model memory and startup cost
C) Impossible for ML
D) The ops team's concern only

**23.** A model service that is a single point of failure:
A) Is fine
B) Is a reliability risk a senior addresses — redundancy, health checks, and graceful failure, treating the ML service with the same rigor as any critical service
C) Is unavoidable
D) Is acceptable for ML

**24.** Understanding the code and services around the model:
A) Out of scope for an ML engineer
B) Part of the breadth expected at senior — reading and reasoning about the surrounding system lets a senior debug end-to-end and design solutions that fit
C) The backend team's job only
D) Unnecessary

**25.** Observability for an ML feature:
A) Model metrics only
B) Spans the system — request tracing, latency, errors, and resource use alongside model-quality metrics, so a senior can diagnose whether a problem is model, data, or plumbing
C) The ops team's job only
D) Unnecessary

**26.** A production incident in an ML feature:
A) Always the model's fault
B) Could be data, pipeline, serving infrastructure, an upstream service, or the model — a senior debugs the whole path methodically rather than assuming the model
C) Always the infra's fault
D) Unfixable

**27.** Security of an ML service:
A) Not an ML concern
B) Is a shared responsibility — authentication, input validation, protecting sensitive data and the model itself, and guarding against abuse; a senior does not treat ML as exempt
C) The security team's sole job
D) Automatic

**28.** Cost of an ML system in production:
A) Irrelevant if it works
B) A real engineering constraint — compute for training and serving, storage, and API costs; a senior designs for cost-efficiency and can reason about the trade-offs
C) The finance team's concern only
D) Always negligible

**29.** Deploying a model change safely:
A) Replace it everywhere at once
B) Use safe rollout — shadow, canary, or staged deployment with monitoring and rollback — because a model change is a production change like any other
C) No testing needed
D) Only offline evaluation is required

**30.** A senior ML engineer who cannot reason about the surrounding system:
A) Is fine — that is the backend team's job
B) Is limited — the senior role requires reasoning across the service, data, and infrastructure the model depends on, not just the model in isolation
C) Is the norm
D) Should stay in notebooks

---

## Section C — The Data Platform and Production ML (Q31–Q44)

**31.** The data an ML system depends on:
A) Appears by magic
B) Flows through pipelines and platforms a senior must understand — where it comes from, how fresh it is, and how it can break, because data problems are a leading cause of ML failure
C) Is the data team's concern only
D) Is always clean and available

**32.** A feature store:
A) Is a database of models
B) Serves consistent feature values for both training and serving, reducing skew and enabling reuse — a senior understands its role even where one is not yet in place
C) Is irrelevant to ML
D) Replaces the model

**33.** Batch versus online (real-time) features:
A) Are the same
B) Differ in freshness and cost — a senior chooses based on the need and understands the operational implications of computing features in real time versus in batch
C) Only batch is real
D) Only online is real

**34.** A broken or delayed upstream data pipeline:
A) Never affects the model
B) Can silently degrade or stall an ML system — a senior monitors data freshness and quality and designs the system to detect and handle upstream failures
C) Is the data team's problem only
D) Cannot be detected

**35.** Data versioning and lineage for ML:
A) Unnecessary
B) Essential for reproducibility and debugging — knowing exactly which data trained a model and where it came from lets a senior explain and fix behavior
C) Impossible
D) The data team's job only

**36.** Training on data that will not be available (or will differ) at serving time:
A) Is fine
B) Is a leakage/skew trap — a senior ensures training features are reproducible at serving time, or the offline results will not hold in production
C) Improves the model
D) Is standard

**37.** The scale of data in training:
A) Is always trivial
B) Can require distributed processing and thoughtful pipelines — a senior reasons about handling data that does not fit on one machine, and its cost
C) Is the infra team's sole concern
D) Never a factor

**38.** Labels and their quality:
A) Are always correct
B) Are a critical, often-noisy input — a senior scrutinizes label quality and the labeling process, because models learn the labels' flaws faithfully
C) Are the annotators' problem only
D) Do not affect the model

**39.** A retraining pipeline:
A) Is unnecessary — train once
B) Is core infrastructure for a living model — automated, monitored retraining on fresh data (with evaluation gates before promotion) keeps a model healthy as the world shifts
C) Is manual forever
D) Is the data scientist's job only

**40.** Promoting a newly trained model to production:
A) Automatically, no checks
B) Through evaluation gates — a candidate must clear quality, slice, and regression checks before it replaces the incumbent; a senior builds these gates in
C) Whenever it finishes training
D) Based on training loss alone

**41.** A model registry:
A) Is a code repository
B) Tracks model versions, their metadata, and lineage so deployments are traceable and reversible — a senior uses it to manage what is actually running
C) Is irrelevant
D) Stores training data

**42.** Reproducing a production model's exact behavior for debugging:
A) Is impossible
B) Requires versioned data, code, config, and environment — a senior invests in this so production issues can be diagnosed rather than guessed at
C) Is unnecessary
D) Is the ops team's job

**43.** The boundary between data engineering and ML engineering:
A) Is a hard wall
B) Is a collaboration a senior works across — understanding enough of the data platform to depend on it well, debug across it, and partner with data engineers
C) Does not exist
D) Means ML engineers ignore data

**44.** Data privacy and governance in an ML system:
A) Not an ML concern
B) A shared responsibility — a senior respects data-use restrictions, PII handling, retention, and consent, because ML systems consume sensitive data at scale
C) The legal team's sole job
D) Irrelevant to models

---

## Section D — Whole-System and Business Reasoning (Q45–Q58)

**45.** The purpose of an ML feature:
A) To use ML
B) To create user or business value — a senior starts from the outcome and asks whether ML is even the right tool, not from a desire to apply a model
C) To be technically impressive
D) To use the newest model

**46.** A problem solvable with simple rules or heuristics:
A) Always use ML instead
B) May not need ML at all — a senior chooses the simplest solution that works, since ML adds data dependencies, cost, and operational burden that rules avoid
C) Always needs deep learning
D) Is beneath consideration

**47.** Build versus buy (e.g., a hosted model API versus training your own):
A) Always build
B) A deliberate trade-off — a senior weighs cost, control, latency, data sensitivity, and time-to-value rather than defaulting to either
C) Always buy
D) Never consider cost

**48.** Connecting an ML metric to a business metric:
A) Unnecessary
B) Essential — a lift in model accuracy that does not move a user or business outcome may not be worth the cost; a senior ties model work to outcomes that matter
C) Impossible
D) The PM's job only

**49.** A model that improves an offline metric but hurts the user experience or a business metric in an A/B test:
A) Ship it — offline metric improved
B) Is a warning — the online outcome is what counts, and a senior trusts a well-run experiment over an offline number
C) Means the experiment is wrong
D) Means metrics are useless

**50.** The total cost of an ML feature:
A) Just the training compute
B) Includes data, training, serving, monitoring, maintenance, and the engineering to keep it healthy — a senior reasons about the whole lifecycle cost, not just the model
C) Is always negligible
D) Is the finance team's concern only

**51.** Estimating the value and risk of an ML project:
A) Assume it will work perfectly
B) Reason about expected value, uncertainty, and failure modes — a senior helps decide whether a project is worth doing before pouring effort into it
C) Is the PM's job alone
D) Is impossible

**52.** A stakeholder wants an ML solution for prestige, but a simpler solution fits better:
A) Build the ML solution to please them
B) Make the case for the solution that best serves the outcome — a senior advocates for the right tool with reasoning, not the most impressive one
C) Comply silently
D) Refuse and dismiss

**53.** When an ML approach is genuinely uncertain to work:
A) Promise it will work
B) Frame it honestly — de-risk with a spike or prototype, communicate the uncertainty, and set expectations; ML has irreducible uncertainty a senior manages transparently
C) Hide the risk
D) Refuse to attempt it

**54.** The end-to-end journey of an ML feature:
A) Ends at a trained model
B) Runs from problem framing through data, training, evaluation, serving, monitoring, and iteration — a senior owns and reasons about the whole arc, not one slice
C) Is only the model
D) Is only deployment

**55.** How an ML feature fits the broader product:
A) Irrelevant to the ML engineer
B) A senior consideration — how it interacts with other features, its failure impact on the product, and the user experience when the model is wrong or unsure
C) The PM's job only
D) Does not matter

**56.** Designing for graceful failure of an ML feature:
A) Assume the model is always right
B) Plan for wrong or low-confidence outputs — fallbacks, human review, or safe defaults — because a senior knows models are probabilistic and will err
C) Ignore failure
D) The user's problem

**57.** A senior ML engineer's view of "done":
A) The model hits its offline metric
B) The feature reliably delivers value in production, is monitored and maintainable, and its behavior and limits are understood — a whole-system definition of done
C) The training run finishes
D) The demo works

**58.** An ML engineer who thinks only about models, not the system or the business:
A) Is correctly focused
B) Is missing much of the senior role — which is delivering trusted value inside a real system and organization, connecting ML to outcomes
C) Is efficient
D) Is the norm

---

## Section E — Senior Judgment and Influence (Q59–Q74)

**59.** Influence at senior level:
A) Requires a management title
B) Comes from credibility — sound reasoning, evidence, working systems, and clear communication earn it; a senior leads through influence, not authority
C) Means being loudest
D) Is impossible for an IC

**60.** Explaining an ML system to non-experts (PMs, leadership):
A) Bury them in jargon
B) Translate — conveying what the system does, its limits, and its risks in terms they can act on is a core senior skill, especially given ML's uncertainty
C) Refuse to simplify
D) Is beneath an engineer

**61.** Setting expectations about ML's uncertainty:
A) Promise deterministic results
B) Be honest that ML is probabilistic and results are uncertain until validated — a senior manages expectations rather than overpromising
C) Hide the uncertainty
D) Refuse to commit to anything

**62.** Disagreeing with a proposed approach:
A) Defer silently
B) Make the evidence-and-reasoning case, propose an alternative, and once decided, commit — a senior disagrees well and then executes
C) Override unilaterally
D) Refuse to engage

**63.** Mentoring junior ML engineers:
A) The manager's job only
B) Core to being senior — growing others in ML-engineering rigor, systems thinking, and honest evaluation multiplies the team and deepens the senior's own mastery
C) Wastes time
D) Premature

**64.** Code and design review of ML work:
A) Rubber-stamp it
B) Review for correctness, leakage, reproducibility, evaluation soundness, and production-readiness — a senior raises the bar through thoughtful review
C) Skip it for ML
D) Only check style

**65.** A junior's model with subtle data leakage:
A) Approve it — the metrics look great
B) Catch and coach — explain why the great metrics are an artifact and how to fix the split; a senior protects the team from the traps ML makes easy
C) Ignore it
D) Rewrite it silently

**66.** Estimating ML work:
A) Promise the fastest timeline
B) Account for the inherent uncertainty — data issues, experimentation, and the chance an approach does not pan out — and communicate ranges and assumptions honestly
C) Match the PM's wish
D) Refuse to estimate

**67.** A model in production starts degrading:
A) Panic or ignore it
B) Diagnose methodically — drift, data pipeline, upstream change, or infrastructure — using monitoring, and act (retrain, roll back, fix the pipeline); a senior owns the response
C) Always retrain blindly
D) Blame the data team

**68.** Documentation of an ML system:
A) Unnecessary
B) Valuable — model cards, data assumptions, limitations, and operational runbooks let others use, trust, and maintain the system; a senior invests in it
C) Writes itself
D) The manager's job

**69.** Balancing research exploration with shipping:
A) Explore forever
B) Time-box exploration against the goal — a senior knows when to stop tuning and ship something valuable, and when more experimentation is warranted
C) Never explore
D) Ship the first model always

**70.** A cross-team dependency for an ML feature (data, infra, product):
A) Ignore it
B) Manage it — a senior identifies dependencies early, coordinates, and de-risks, because ML features rarely succeed in isolation
C) The manager's job
D) Assume it resolves itself

**71.** Committing to a decision you argued against:
A) Undermine it quietly
B) Execute it well once made — disagreeing openly then committing is maturity; sabotage is not
C) Refuse
D) Never disagree

**72.** A senior's demeanor when a model fails publicly or a launch misses:
A) Defensive or blaming
B) Steady and curious — own the outcome, diagnose honestly, and drive the fix; the team takes its cue from the senior, and ML failures are routine
C) Withdraw
D) Blame the data or the model

**73.** Advocating for foundational investment (data quality, evaluation, monitoring):
A) Skip it for features
B) A senior responsibility — making the case that unglamorous foundations are what make ML reliable, even when they are less visible than a new model
C) Never worth it
D) The manager's job only

**74.** Saying "I don't know, let me find out":
A) Damages credibility
B) Builds it — especially in ML, where certainty is rare, admitting gaps and investigating produces better outcomes and earns trust
C) For juniors only
D) Should be hidden

---

## Section F — Ethics and Responsibility (Q75–Q84)

**75.** Bias and fairness in ML:
A) Not the engineer's concern
B) A core responsibility — models learn and amplify biases in data, and a senior actively evaluates for disparate impact and works to mitigate it
C) The legal team's job only
D) Impossible to address

**76.** A model that performs worse for a protected or vulnerable group:
A) Is acceptable if the average is good
B) Is a serious problem — a senior treats disparate performance as a defect to investigate and address, not an acceptable cost
C) Is unavoidable
D) Is the data's fault, so nothing can be done

**77.** Using personal or sensitive data to train a model:
A) Anything available is fair game
B) Requires care — consent, privacy, data-use restrictions, and regulation constrain what is permissible; a senior respects these, not just what is technically possible
C) The legal team's sole concern
D) Irrelevant to engineers

**78.** Explainability and transparency:
A) Never needed
B) Matter where decisions affect people — a senior weighs the need to explain or justify a model's decisions, especially in high-stakes domains
C) Always impossible
D) The user's problem

**79.** An LLM feature that can produce harmful, false, or unsafe output:
A) Is the model provider's problem
B) Is a responsibility a senior designs around — guardrails, validation, human oversight where warranted, and honest communication of limits
C) Is unavoidable, so ignore it
D) Never happens

**80.** Automation that removes human judgment from a consequential decision:
A) Always preferable
B) Demands scrutiny — a senior considers where human review must stay in the loop for high-stakes or error-costly decisions, rather than automating blindly
C) Never acceptable
D) The PM's call only

**81.** Being asked to build something that misuses ML (e.g., deceptive or manipulative):
A) Comply — it is just a task
B) Raise the concern and refuse to build clearly unethical or harmful systems — a senior's responsibility includes declining misuse and escalating appropriately
C) Build it quietly
D) Ignore the ethics

**82.** Overstating a model's capabilities to stakeholders or users:
A) Good marketing
B) A breach of integrity — a senior communicates capabilities and limits honestly, because overclaiming erodes trust and causes real harm when the model fails
C) Expected
D) Harmless

**83.** Environmental and resource cost of large models:
A) Never a consideration
B) A legitimate factor — a senior weighs the compute cost and footprint of large models against the value, favoring efficiency where it does not sacrifice the goal
C) The infra team's concern only
D) Irrelevant

**84.** The foundation of ethical ML engineering:
A) Following orders
B) Responsibility for the system's real-world impact — fairness, privacy, honesty, safety, and human oversight — held as a professional obligation, not an afterthought
C) The law alone
D) Whatever ships fastest

---

## Section G — The Convergence Itself (Q85–Q100)

**85.** The convergence for an ML/AI engineer is:
A) Learning to code for the first time
B) Broadening from an ML specialist into a senior engineer who reasons across the whole system the model lives in — services, data platform, product, business — while still owning deep ML craft
C) Becoming a data scientist
D) Becoming a manager

**86.** An ML engineer excellent at modeling but unable to reason about the surrounding system:
A) Is ready for senior
B) Has a gap to close — the senior role requires reasoning across services, data, and infrastructure, and connecting ML to outcomes, not modeling alone
C) Should specialize harder in modeling
D) Is complete

**87.** The relationship between ML engineering and general software engineering at senior level:
A) They are unrelated
B) They merge — a senior ML engineer applies solid software and systems engineering to ML, and the ML-specific rigor sits atop a broad engineering foundation
C) ML replaces software engineering
D) Software engineering is irrelevant to ML

**88.** Reasoning about the data platform beneath a model:
A) Out of scope
B) Part of the senior breadth — understanding where data comes from, how it can break, and how to depend on and debug across it is essential to reliable ML
C) The data team's job only
D) Unnecessary

**89.** Connecting model work to business outcomes:
A) The PM's job
B) The senior expectation — ML work justified by user and business results, with the judgment to choose the right tool (including no ML) for the outcome
C) Impossible
D) Undermines rigor

**90.** Choosing the simplest solution that works:
A) A failure of ambition
B) A mark of senior judgment — a senior avoids unnecessary complexity, since every model added is data, cost, and operational burden that must be justified by value
C) Never correct
D) Only for juniors

**91.** Owning an ML feature end-to-end means:
A) Delivering a trained model
B) Framing the problem, handling the data, training and evaluating honestly, serving and monitoring reliably, connecting it to outcomes, and being the person the team trusts on the whole system
C) The model only
D) Deployment only

**92.** The mindset shift from Junior 3 to Senior 1:
A) Bigger models
B) From owning an ML component to owning ML systems that deliver trusted value inside a real product and organization — breadth, systems thinking, business connection, and influence
C) More experiments
D) Higher offline metrics

**93.** Trusting a well-run online experiment over an offline metric:
A) Never — offline is cleaner
B) Usually — the online outcome on real users is the truer measure, and a senior weights evidence accordingly while understanding both
C) Offline always wins
D) Neither matters

**94.** A senior ML engineer's relationship to production:
A) Hands off after training
B) Owns the system in production — its reliability, monitoring, cost, and behavior over time — because a model's value is realized only in production
C) Avoids production
D) Leaves it to ops entirely

**95.** Reasoning about failure across the whole path (data → pipeline → model → serving → consumer):
A) Assume the model is the cause
B) Diagnose the whole path methodically — a senior can localize a problem to data, pipeline, model, or infrastructure rather than guessing
C) Assume infrastructure is the cause
D) Is impossible

**96.** The role of honesty in senior ML engineering:
A) Optional
B) Central — about a model's real performance, its uncertainty, its limits, and its risks; the discipline is built on not fooling yourself or others, especially where results are surprising or convenient
C) A weakness
D) Only for research

**97.** Balancing rigor, speed, and impact:
A) Maximize rigor always
B) Apply rigor where it protects against costly error, ship on timelines that matter, and focus effort on the highest-impact problems — senior judgment, not perfectionism or carelessness
C) Ship anything fast
D) Never compromise

**98.** A senior ML engineer collaborating with data scientists, data engineers, and backend engineers:
A) Works in isolation
B) Works across all of them — ML systems span disciplines, and a senior's breadth lets them collaborate as a peer with each and integrate the whole
C) Ignores the others
D) Replaces the others

**99.** The single trait that most distinguishes Senior 1 from a strong Junior 3:
A) Modeling skill alone
B) Judgment — about tools, systems, trade-offs, and outcomes — paired with the breadth to reason across the whole system and the influence to drive good decisions
C) Knowledge of the newest models
D) Specialization depth

**100.** An ML/AI engineer Junior 3 who passes this exam is signaling:
A) That they know every model architecture
B) That they have broadened into a senior engineer who ships and operates ML systems that create trusted value inside a real product and organization — reasoning across the whole system and connecting ML to outcomes, with deep ML craft now one part of a broader senior capability
C) That they should specialize harder in modeling
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

*Administrator's note: This is the ML/AI engineering convergence exam. Above Senior 1, this track uses the shared engineering ladder (05–09): Senior 1 → Senior 2, Senior 2 → Lead, and then the management branch (Lead → Engineering Manager → VP) or the IC branch (Lead → Principal Engineer). A Junior 3 who scores 70–80 has strong ML-engineering craft and now needs breadth — the surrounding system, the data platform, and business connection. Coach them, give them ownership of a feature end-to-end in production, and re-sit in six months. Calibrate what "Senior 1" means to your organization's actual need from a senior ML engineer.*
