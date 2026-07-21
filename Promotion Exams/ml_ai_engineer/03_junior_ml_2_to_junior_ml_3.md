# Promotion Exam: Junior AI/ML Engineer 2 → Junior AI/ML Engineer 3

**Track:** AI/ML Engineer (Specialist — building, training, deploying, and operating ML systems)
**Format:** 100 multiple-choice questions
**Time:** 150 minutes
**Passing score:** 89 / 100

**Scope.** Junior AI/ML Engineer 3 is the top of the specialist track before convergence into the generalist senior level. A Junior ML 3 owns significant ML systems with minimal supervision, handles production ML at scale, runs advanced MLOps (model registries, CI/CD for ML, drift monitoring, automated retraining with gates), optimizes and scales serving, builds advanced LLM/GenAI systems (RAG at depth, fine-tuning, evaluation, guardrails), and reasons about reliability and cost. This exam tests that depth and the early ML-engineering judgment a Junior 3 must show.

**Reminder.** This is the last specialist-only ML-engineering exam. The next exam (Junior 3 → Senior 1) is the convergence point and tests whether the candidate has broadened into a senior who reasons about the whole system an ML component lives in (backend, data platform, product), connects ML work to business outcomes, and drives decisions through influence — not only the model and its serving. A candidate who aces this but cannot reason beyond the ML box or connect it to real outcomes is not ready for the next gate.

---

## Section A — Advanced and Production ML Systems (Q1–Q14)

**1.** An ML system at scale:
A) Is just a bigger model
B) Is a system of pipelines, serving, storage, monitoring, and retraining — where reliability, cost, and data flow matter as much as the model
C) Is a notebook
D) Is a single API call

**2.** A model's lifecycle in production:
A) Ends at deployment
B) Is continuous — deploy, monitor, detect drift, retrain, validate, redeploy, roll back if needed — a loop, not a one-time event
C) Never changes
D) Is the ops team's concern only

**3.** Concept drift versus data drift:
A) Are the same
B) Data drift is input distribution changing; concept drift is the input-output relationship changing — both degrade models, and distinguishing them guides the fix
C) Neither affects models
D) Only data drift matters

**4.** A model silently degrading without errors:
A) Cannot happen
B) Is common and dangerous — nothing crashes, but predictions get worse as the world shifts; only monitoring of prediction quality catches it
C) Always throws an exception
D) Improves over time

**5.** Retraining strategy:
A) Retrain constantly with no checks
B) Retrain on a schedule or trigger, with validation gates comparing to the current model before promotion — automated but guarded
C) Never retrain
D) Auto-deploy every retrain

**6.** A model that performs well overall but poorly on a critical segment:
A) Is fine — overall is good
B) May be unacceptable — segment-level evaluation matters, especially where errors on a subgroup are costly or unfair; aggregate metrics hide it
C) Cannot happen
D) Is the data scientist's problem only

**7.** Ensemble and complex models in production:
A) Are always worth it
B) Trade accuracy for complexity, latency, and cost — a Junior 3 weighs whether the gain justifies the operational burden
C) Are always simpler to run
D) Never overfit

**8.** Model calibration in production:
A) Never matters
B) Matters when probabilities drive decisions (thresholds, expected-value logic) — a miscalibrated model can rank well but make poor decisions
C) Is the same as accuracy
D) Is always perfect

**9.** A/B testing models in production:
A) Is unnecessary if offline metrics are good
B) Is how real impact is measured — offline gains do not guarantee online improvement, so controlled online experiments validate a model
C) Replaces offline evaluation
D) Is the data scientist's job only

**10.** Offline metric improves but the online/business metric does not:
A) Is impossible
B) Is common — proxy mismatch, deployment issues, or drift; a Junior 3 investigates the gap rather than assuming the offline win transferred
C) Proves the model works
D) Means the online metric is broken

**11.** Feedback loops where a model's outputs influence its future training data:
A) Do not exist
B) Are a real, subtle risk — the model can reinforce its own biases or degrade; recognizing and designing against harmful loops is part of the craft
C) Always improve the model
D) Are a code bug

**12.** Out-of-distribution inputs at serving time:
A) Are handled perfectly
B) Produce unreliable predictions — a robust system detects or guards against inputs unlike training data, rather than trusting the output blindly
C) Improve the model
D) Cannot occur

**13.** A model that is expensive to run for a small accuracy gain:
A) Always deploy it
B) Requires a cost-benefit judgment — the operational cost (compute, latency) may not justify the marginal gain over a cheaper model
C) Is always worth it
D) Is the finance team's call

**14.** Debugging a production ML issue:
A) Retrain and hope
B) Systematically isolate the cause — data, features, skew, drift, code, or infrastructure — using logs, monitoring, and reproducible pipelines
C) Blame the model
D) Is impossible

---

## Section B — Distributed and Large-Scale Training (Q15–Q26)

**15.** Training on data too large for one machine:
A) Is impossible
B) Requires distributed or out-of-core techniques — a Junior 3 understands the basics of scaling training beyond a single machine's memory and compute
C) Means using less data always
D) Is the ops team's job

**16.** Data parallelism in training:
A) Is a serving technique
B) Splits data across workers that each compute on a shard and synchronize updates — a common way to scale training
C) Is the same as model parallelism
D) Does not exist

**17.** The bottleneck in large-scale training:
A) Is always compute
B) Can be data loading/IO, communication between workers, or memory — not just raw compute; identifying the real bottleneck guides optimization
C) Is never IO
D) Is always the model

**18.** GPU/accelerator memory limits:
A) Are irrelevant
B) Constrain model and batch size — techniques like gradient accumulation or mixed precision help fit training within memory
C) Are unlimited
D) Are the ops team's concern only

**19.** Mixed-precision training:
A) Reduces accuracy always
B) Uses lower-precision arithmetic to speed training and reduce memory, often with negligible accuracy impact — a common optimization
C) Is always harmful
D) Is a serving technique

**20.** Checkpointing during long training runs:
A) Is unnecessary
B) Saves intermediate state so a failed run can resume rather than restart — essential for long or expensive training
C) Slows training pointlessly
D) Is only for serving

**21.** Reproducibility in distributed training:
A) Is automatic
B) Is harder but still important — randomness, data ordering, and hardware differences complicate it, and it must be managed for trustworthy results
C) Is impossible, so ignore it
D) Does not matter

**22.** The cost of large training runs:
A) Is negligible
B) Is real and often significant — a Junior 3 considers whether the experiment or model justifies the compute cost, and avoids wasteful runs
C) Is the finance team's job
D) Never matters

**23.** Hyperparameter search at scale:
A) Try everything exhaustively always
B) Use efficient strategies (informed search, early stopping of bad runs) to manage the compute cost of tuning — brute force is often wasteful
C) Is unnecessary
D) Uses the test set

**24.** Efficient data loading for training:
A) Never matters
B) Matters — if data loading is slow, expensive accelerators sit idle; efficient pipelines keep them fed and training cost-effective
C) Is the ops team's job
D) Is always fast

**25.** A training run that diverges or fails to learn:
A) Means the data is unusable
B) Has diagnosable causes — learning rate, initialization, data issues, or bugs — that a Junior 3 investigates methodically
C) Is random
D) Means use a bigger model

**26.** Scaling up model size:
A) Always improves results proportionally
B) Has diminishing returns and rising costs — bigger is not always better, and the tradeoff against data, cost, and latency must be weighed
C) Is free
D) Never helps

---

## Section C — Advanced MLOps (Q27–Q40)

**27.** A mature model registry:
A) Is a dataset store
B) Versions models with metadata, stages (staging/production), and lineage — enabling controlled promotion, rollback, and auditing
C) Is a feature store
D) Is unnecessary

**28.** CI/CD for ML pipelines:
A) Does not apply
B) Automates testing (code, data, model validation), building, and deploying — extending software CI/CD with ML-specific checks and gates
C) Is the same as training
D) Is only for app code

**29.** A validation gate before promoting a model:
A) Is unnecessary
B) Automatically checks a new model against the current one and quality thresholds before deployment — preventing a bad model from auto-shipping
C) Slows the pipeline pointlessly
D) Is the same as training

**30.** Automated retraining without gates:
A) Is safe
B) Is dangerous — a bad retrain (from corrupted or drifted data) could auto-deploy and degrade production; gates and monitoring are required
C) Is best practice
D) Cannot fail

**31.** Monitoring in production ML — what to watch:
A) Only errors
B) Prediction quality, input drift, output distribution, latency, throughput, errors, and data quality — a comprehensive view of system health
C) Only latency
D) Only training accuracy

**32.** Alerting design for ML systems:
A) Alert on everything
B) Alert on actionable, meaningful conditions (significant drift, degraded quality, serving failures) — too many alerts cause fatigue and missed real problems
C) Never alert
D) Is the ops team's job only

**33.** Experiment tracking at depth:
A) Is unnecessary
B) Records parameters, data versions, code, and metrics for every run — so results are comparable, reproducible, and the best model is traceable to how it was made
C) Is the same as logging
D) Slows the work

**34.** Reproducing a production model exactly:
A) Is impossible
B) Requires captured code, data version, config, environment, and seeds — reproducibility is engineered in, and a Junior 3 ensures it
C) Is automatic
D) Is unnecessary

**35.** Lineage across data, features, and models:
A) Is bureaucracy
B) Tracks what produced what, so the impact of a data or code change can be traced and a problem's source found — essential at scale
C) Is unnecessary
D) Is the ops team's job

**36.** Shadow and canary deployments:
A) Are the same as full deployment
B) Validate a new model on real traffic safely — shadow runs it without affecting users; canary exposes a small slice — before full rollout
C) Are unsafe
D) Are unnecessary

**37.** Rollback capability:
A) Is optional
B) Is essential — reverting quickly to a known-good model limits harm when a deployment goes wrong; automated pipelines must support it
C) Means the model failed
D) Is impossible

**38.** Infrastructure as code for ML systems:
A) Is unnecessary
B) Makes ML environments reproducible, reviewable, and reliable — the same discipline as application infrastructure, reducing drift and manual error
C) Is the ops team's job only
D) Slows the work

**39.** Managing multiple models in production:
A) Is the same as managing one
B) Adds complexity — versioning, monitoring, and coordinating many models (and their retraining) needs systematic MLOps, not ad hoc handling
C) Is impossible
D) Requires no special tooling

**40.** The purpose of investing in MLOps:
A) Process for its own sake
B) Reliable, reproducible, maintainable ML systems that keep delivering value safely as data and the world change — reducing risk and toil
C) To slow the team
D) To reduce headcount

---

## Section D — Scaling and Optimizing Serving (Q41–Q52)

**41.** Serving latency optimization:
A) Never needed
B) Uses techniques like batching, caching, model optimization, and hardware choices to meet latency targets — a real engineering concern at scale
C) Means a smaller model always
D) Is the ops team's job only

**42.** Model optimization for inference (quantization, distillation, pruning):
A) Always ruins the model
B) Reduces model size/latency/cost, often with acceptable accuracy tradeoffs — techniques a Junior 3 knows when serving is constrained
C) Is training only
D) Is unnecessary

**43.** Batching requests at serving time:
A) Always increases latency
B) Can improve throughput and efficiency by processing multiple requests together — trading a little latency for much better utilization
C) Is impossible
D) Reduces accuracy

**44.** Caching predictions:
A) Is never valid
B) Can reduce cost and latency for repeated identical inputs — valid when inputs recur and results are stable, with attention to staleness
C) Always returns wrong results
D) Is the same as batching

**45.** Autoscaling serving infrastructure:
A) Is unnecessary
B) Adjusts capacity to load so the system meets demand within cost limits — handling traffic spikes without over-provisioning
C) Is impossible for ML
D) Is the finance team's job

**46.** A serving system under a traffic spike:
A) Should simply fail
B) Should degrade gracefully — via autoscaling, queuing, load shedding, or fallbacks — rather than collapsing entirely
C) Cannot be planned for
D) Is the model's job to handle

**47.** GPU versus CPU serving:
A) Always use GPU
B) Depends on the model and latency/cost needs — GPUs suit some models, but many are served cost-effectively on CPU; match hardware to requirements
C) Always use CPU
D) Does not matter

**48.** Cost of serving at scale:
A) Is negligible
B) Is a major concern — inference cost can dominate, and optimizing model, hardware, batching, and caching keeps it sustainable
C) Is the finance team's job
D) Never matters

**49.** A model too large or slow for the latency budget:
A) Deploy it anyway
B) Requires optimization or a different model — a model that cannot meet the required latency is not usable regardless of accuracy
C) Is fine
D) Is the ops team's problem

**50.** Monitoring serving health:
A) Is unnecessary
B) Tracks latency, error rate, throughput, and resource use — so serving problems are detected and addressed before users are affected
C) Is the same as model accuracy
D) Is optional

**51.** Reliability of the serving path:
A) Does not matter if the model is good
B) Matters greatly — a great model behind an unreliable serving system delivers no value when it is down; reliability engineering applies to ML serving too
C) Is automatic
D) Is the model's responsibility

**52.** Graceful handling of model or dependency failure:
A) Crash the whole product
B) Fall back to a default, degraded mode, or cached result so the product survives when the model or a dependency fails
C) Is unnecessary
D) Means the model failed

---

## Section E — Advanced LLM and GenAI Systems (Q53–Q66)

**53.** Building a production LLM feature:
A) Just call the API and ship
B) Requires prompt design, grounding (often RAG), evaluation, guardrails, cost/latency management, and monitoring — a system, not a single call
C) Needs no evaluation
D) Is the same as training a model

**54.** RAG at depth:
A) Is just prompting
B) Involves retrieval quality (chunking, embeddings, search), relevance, context assembly, and handling when retrieval fails — retrieval quality often determines answer quality
C) Is fine-tuning
D) Is a database query only

**55.** Embeddings:
A) Are model weights
B) Are vector representations of text (or other data) enabling semantic search and retrieval — foundational to RAG and similarity systems
C) Are prompts
D) Are irrelevant

**56.** Poor retrieval in a RAG system:
A) Does not affect the answer
B) Leads to wrong or unsupported answers — the model can only ground in what it retrieves, so retrieval quality is often the limiting factor
C) Improves the answer
D) Is impossible

**57.** Fine-tuning an LLM:
A) Is always better than prompting/RAG
B) Is one option with real costs (data, compute, maintenance) — sometimes better for style/format or narrow tasks, but prompting or RAG is often sufficient and cheaper
C) Is never useful
D) Is the same as prompting

**58.** Evaluating an LLM system:
A) Eyeball a few outputs
B) Requires systematic evaluation — curated test cases, criteria, human review, or LLM-assisted scoring — since open-ended outputs resist simple metrics and "seems fine" is not evaluation
C) Uses accuracy only
D) Is impossible

**59.** Guardrails for LLM output:
A) Are unnecessary
B) Constrain and validate output — filtering harmful/off-topic content, enforcing format, checking for hallucination — to make the feature safe and reliable
C) Are the provider's job only
D) Slow the system pointlessly

**60.** Prompt injection:
A) Does not exist
B) Is when malicious input manipulates the model's behavior (e.g., overriding instructions) — a real security concern for LLM systems that must be defended against
C) Is a training technique
D) Is harmless

**61.** Hallucination mitigation:
A) Is impossible
B) Combines grounding (RAG), constraints, verification, and honest UX about uncertainty — reducing but not eliminating fluent-but-false output
C) Is solved by bigger models
D) Is unnecessary

**62.** Cost management for LLM features:
A) Is irrelevant
B) Is essential — token costs add up; caching, smaller/cheaper models for easy cases, prompt efficiency, and retrieval scoping control cost
C) Is the finance team's job
D) Never matters

**63.** Latency of multi-step LLM pipelines (e.g., RAG + generation):
A) Is negligible
B) Compounds across steps — retrieval, multiple model calls, and post-processing add up, and a Junior 3 designs for acceptable end-to-end latency
C) Is the model's problem
D) Never matters

**64.** Non-determinism and testing LLM features:
A) Test once and trust
B) Requires evaluation approaches robust to variability — since outputs vary, testing uses distributions of cases and criteria rather than exact-match on one run
C) Is impossible
D) Is unnecessary

**65.** Sensitive data in LLM prompts/RAG context:
A) Has no implications
B) Requires care — data sent to models (especially third-party) and retrieved into context raises privacy, security, and access-control concerns
C) Is always fine
D) Is always forbidden

**66.** Monitoring an LLM feature in production:
A) Is unnecessary
B) Tracks quality, cost, latency, failure/refusal rates, and harmful outputs — because behavior drifts with model updates, data, and usage
C) Is the same as training metrics
D) Is impossible

---

## Section F — Reliability, Cost, and Judgment (Q67–Q80)

**67.** Reliability of an ML system:
A) Is only about model accuracy
B) Spans the whole system — data pipelines, serving, dependencies, and monitoring — and a reliable ML system stays useful even when parts fail
C) Is automatic
D) Is the ops team's job only

**68.** Designing for failure in ML systems:
A) Assume nothing fails
B) Assume components will fail (data late, model down, dependency slow) and design fallbacks, retries, and degraded modes so the system survives
C) Is over-engineering
D) Is the ops team's job

**69.** The blast radius of an ML component:
A) Is always contained
B) Is worth reasoning about — how far a bad model or pipeline failure propagates (bad predictions driving bad actions) informs safeguards
C) Is irrelevant
D) Is the ops team's concern

**70.** Cost awareness in ML systems:
A) Is not the engineer's concern
B) Is part of the craft — training and serving costs are real, and a Junior 3 weighs accuracy gains against compute, latency, and operational cost
C) Is the finance team's job
D) Never matters

**71.** A simple model that meets the requirement:
A) Should be replaced with a complex one
B) Is often the better engineering choice — simpler to serve, monitor, debug, and maintain; complexity must earn its keep
C) Is always inferior
D) Cannot be production-grade

**72.** When ML is not the right solution:
A) Never — ML is always best
B) Sometimes a rule, heuristic, or simpler system is more reliable and maintainable; a Junior 3 recognizes when ML's complexity is not justified
C) Only for tiny problems
D) Is not the engineer's call

**73.** Technical debt in ML systems:
A) Does not exist
B) Is real and often worse than in regular software — entangled data dependencies, undocumented pipelines, and unreproducible models accumulate risk
C) Is only about code
D) Is harmless

**74.** A quick prototype versus a production system:
A) Are the same
B) Differ greatly — prototypes prove feasibility; production needs reliability, monitoring, tests, and maintainability, and a Junior 3 knows not to ship a prototype as production
C) Prototypes are production-ready
D) Production is unnecessary

**75.** Prioritizing what to improve in an ML system:
A) Always improve the model
B) Focus where it matters most — often data quality, reliability, or a bottleneck, not model accuracy; a Junior 3 diagnoses the real limiting factor
C) Always add features
D) Randomly

**76.** Making a change to a production ML system:
A) Deploy directly
B) Test, validate against the current behavior, roll out safely with monitoring, and keep rollback ready — production ML changes carry risk
C) Requires no caution
D) Is irreversible

**77.** A model's real value is realized:
A) When it is trained
B) When it reliably delivers useful predictions in production to a good end — the engineering around the model is what turns it into value
C) When it is accurate offline
D) When it is complex

**78.** Documenting an ML system for operability:
A) Is a waste
B) Is essential — how to run, monitor, retrain, and troubleshoot it, plus its assumptions and limits, so others can operate it reliably
C) Is the manager's job
D) Slows the work

**79.** Balancing speed of delivery with system quality:
A) Always ship fastest
B) Match rigor to the stakes and communicate tradeoffs — a throwaway experiment differs from a system driving real decisions, and a Junior 3 judges accordingly
C) Always maximize rigor
D) They do not interact

**80.** Early ML-engineering judgment means:
A) Knowing the most techniques
B) Choosing the right (often simplest) solution, foreseeing failure modes and costs, and building systems that stay reliable and maintainable in production
C) Using the biggest models
D) Writing the most code

---

## Section G — Collaboration and Communication (Q81–Q90)

**81.** Collaborating with data scientists at this level:
A) Is unnecessary
B) Is a strong partnership — productionizing their models, closing gaps (leakage, skew, serving reality), and feeding production learnings back
C) Is adversarial
D) Is the manager's job

**82.** Collaborating with data engineers:
A) Is unnecessary
B) Is essential — the data pipelines feeding models are shared ground, and reliable features depend on this partnership
C) Is adversarial
D) Undermines the ML engineer

**83.** Collaborating with backend/platform engineers:
A) Is unnecessary
B) Is essential — serving, scaling, and reliability run on shared infrastructure, and building robust ML systems requires working with them
C) Is adversarial
D) Is the manager's job

**84.** Explaining an ML system's behavior and limits to others:
A) Is unnecessary
B) Is a responsibility — those relying on the model must understand its confidence, failure modes, and limits, or they will misuse it
C) Undermines trust
D) Is the data scientist's job

**85.** Mentoring a junior ML engineer:
A) Too early
B) Is part of growing to Junior 3 — teaching engineering discipline, leakage avoidance, and honest evaluation multiplies the team
C) Is the lead's job only
D) Wastes time

**86.** Reviewing another engineer's ML code:
A) Rubber-stamp
B) Check for leakage, skew, correctness, reproducibility, reliability, and maintainability — ML review catches subtle, costly errors
C) Skip it
D) Only check style

**87.** Communicating a model's readiness (or not) for production:
A) Always say it is ready
B) Honestly convey what is validated, what is uncertain, and the risks — shipping a model you know is not ready causes real harm
C) Is the manager's job
D) Is unnecessary

**88.** When your ML system causes a production incident:
A) Hide it
B) Help mitigate (rollback), investigate honestly, and contribute to the blameless review — concealment compounds harm
C) Blame the data scientist
D) Wait to be found out

**89.** Disagreeing with a design decision on an ML system:
A) Stay silent
B) Raise the technical concern with reasoning, and once decided, commit to executing well — disagree and commit
C) Refuse to work
D) Override unilaterally

**90.** Translating ML concepts for non-ML stakeholders:
A) Is unnecessary
B) Is a valuable skill — explaining what a model can and cannot do, and its risks, in accessible terms helps others make good decisions
C) Is impossible
D) Is the manager's job

---

## Section H — Judgment and Growth Toward Convergence (Q91–Q100)

**91.** The breadth expected at senior:
A) Deeper ML specialization only
B) Reasoning about the whole system the ML component lives in — backend, data platform, product — and connecting ML work to business outcomes, which the next exam tests
C) Managing people
D) Only bigger models

**92.** An ML engineer strong in models but unable to reason about the surrounding system:
A) Is ready for senior
B) Has a gap to close — the senior role requires seeing the ML component as part of a larger system and product, not in isolation
C) Should specialize harder
D) Is complete

**93.** Connecting ML work to business outcomes:
A) Is the PM's job
B) Is the broadening the next level requires — a senior ensures the ML system actually improves the outcome that matters, not just an offline metric
C) Is impossible
D) Undermines rigor

**94.** A recurring class of failure across the team's ML systems:
A) Fix each instance
B) Address the systemic cause — a shared pipeline pattern, a validation gate, a monitoring standard — so the class stops recurring
C) Is unavoidable
D) Is someone else's problem

**95.** Honest evaluation and leakage-avoidance at this level:
A) Become less important
B) Remain foundational — as systems grow and influence more, the discipline that keeps models honestly evaluated and leakage-free matters more
C) Slow the work
D) Are the data scientist's job

**96.** Reliability and cost as first-class concerns:
A) Are optional
B) Are central to production ML — a Junior 3 treats reliability, cost, and maintainability as real requirements, not afterthoughts
C) Are the ops team's job
D) Never matter

**97.** When you do not fully understand a system's behavior:
A) Ship and hope
B) Investigate until you do — ML systems fail silently, and shipping what you do not understand risks undetected, compounding harm
C) Guess
D) Hide the uncertainty

**98.** Keeping current with ML/AI engineering:
A) Is unnecessary once skilled
B) Is essential — the field (especially LLM/GenAI tooling and practices) moves fast, and a senior-track engineer keeps learning both techniques and their failure modes
C) Is for seniors only
D) Wastes time

**99.** The mindset shift from Junior 2 to Junior 3:
A) Faster model training
B) From owning an ML component to owning production ML systems — scale, advanced MLOps, serving optimization, advanced LLM/GenAI, and reliability/cost judgment
C) Bigger models only
D) More code

**100.** The trait that most reliably unlocks the move to Senior 1 is:
A) Knowing the most techniques
B) Sound engineering judgment about building reliable, cost-effective, honestly-evaluated ML systems, broadened toward the whole system and the business outcomes it serves — turning models into trusted, valuable production systems
C) Training the biggest models
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

*Administrator's note: This is the last specialist-only ML-engineering exam. The next exam (Junior 3 → Senior 1) is the convergence point and tests broadening into a senior who reasons about the whole system the ML component lives in — backend, data platform, product — and connects ML work to business outcomes, driving decisions through influence. A candidate who aces this but cannot reason beyond the ML box or connect it to real outcomes should be coached toward that breadth before sitting the convergence exam.*
