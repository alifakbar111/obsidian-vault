# Promotion Exam: Junior AI/ML Engineer 1 → Junior AI/ML Engineer 2

**Track:** AI/ML Engineer (Specialist — building, training, deploying, and operating ML systems)
**Format:** 100 multiple-choice questions
**Time:** 135 minutes
**Passing score:** 89 / 100

**Scope.** A Junior AI/ML Engineer 1 implements scoped ML tasks under supervision. A Junior AI/ML Engineer 2 should own an ML component end-to-end with light review — building the data and training pipeline, training and honestly evaluating a model, wrapping it in reliable code, deploying it behind an API or batch job, and adding basic monitoring. This exam deepens the software engineering, the ML training and evaluation craft, feature and data pipelines, model serving and the beginnings of MLOps, and the applied use of pretrained models and LLMs.

---

## Section A — Engineering an ML Component (Q1–Q12)

**1.** Given an ML problem to solve, the first step is:
A) Pick a model and start training
B) Understand the problem, the data available, how the model's output will be used, and what "good enough" means — before building
C) Collect the biggest dataset
D) Choose a framework

**2.** Framing an ML task:
A) Is unnecessary
B) Requires deciding what to predict, from what inputs, with what target, and how success is measured — a poorly framed task cannot be solved well
C) Is the data scientist's job only
D) Is choosing an algorithm

**3.** Is machine learning the right tool for a problem?
A) Always — ML solves everything
B) Not always — some problems are better solved with rules or simpler logic; ML adds complexity and maintenance cost that must be justified
C) Never
D) Only for large companies

**4.** A clear, deterministic rule that solves the problem:
A) Should be replaced with ML anyway
B) Is often preferable to ML when it works — simpler, more reliable, and easier to maintain; ML is for problems rules cannot handle well
C) Is always worse than ML
D) Cannot exist

**5.** Building an ML component to be maintainable:
A) Does not matter — retrain later
B) Matters — clear, tested, reproducible code and pipelines are what let the component be operated, debugged, and improved over time
C) Is the ops team's job
D) Slows delivery pointlessly

**6.** A reproducible training pipeline:
A) Runs differently each time
B) Produces the same model from the same data, code, and config — essential for debugging, auditing, and retraining reliably
C) Is unnecessary
D) Is only for research

**7.** When the model does not perform well enough:
A) Always use a bigger model
B) Diagnose why — data quality, features, leakage, the framing, or the metric — because more model is often not the answer, and the cause guides the fix
C) Give up
D) Lower the bar silently

**8.** A model that looks too good in evaluation:
A) Ship it
B) Investigate for leakage or a flawed split — surprising-in-your-favor results are the ones to scrutinize most
C) Is always correct
D) Should be hidden

**9.** Estimating effort for an ML component:
A) Promise the fastest
B) Account for data work (usually the largest part), experimentation, evaluation, engineering, deployment, and monitoring — with uncertainty stated
C) Match the backend estimate
D) Refuse

**10.** The deliverable of an ML component:
A) A model file
B) A working, tested, deployed, monitored component that reliably produces useful predictions in production — not just a trained model in a notebook
C) A notebook
D) A metric

**11.** Sanity-checking a model's predictions:
A) Trust the metrics
B) Look at actual predictions (including errors and edge cases) — metrics can hide obvious, embarrassing failures a human immediately spots
C) Is the QA team's job
D) Wastes time

**12.** Documenting an ML component:
A) Is unnecessary
B) Records data sources, assumptions, training procedure, metrics, limitations, and how to operate it — so others can maintain and trust it
C) Is the manager's job
D) Slows the work

---

## Section B — Software Engineering for ML (Q13–Q26)

**13.** Structuring ML code beyond a notebook:
A) Is unnecessary
B) Is required for production — modular, tested, reusable code (not one giant notebook) is what makes an ML system maintainable and deployable
C) Is over-engineering
D) Is the backend team's job

**14.** Separating training code from serving code (with shared logic):
A) Is pointless
B) Is good practice, but shared feature/preprocessing logic must be consistent across both to avoid training-serving skew
C) Means duplicating everything
D) Is impossible

**15.** Writing tests for a data pipeline:
A) Is impossible
B) Catches silent data corruption — tests for schema, ranges, nulls, and transformation correctness prevent bad data from quietly ruining models
C) Is the QA team's job
D) Slows the work pointlessly

**16.** Configuration versus hardcoded values:
A) Hardcode everything
B) Externalize configuration (paths, hyperparameters, thresholds) so runs are reproducible, comparable, and changeable without editing code
C) Is unnecessary
D) Is the ops team's job

**17.** Logging in ML code:
A) Is noise
B) Is valuable — logging key steps, metrics, and errors makes training and serving debuggable, without logging sensitive data
C) Slows training
D) Is the ops team's job

**18.** Handling errors in a pipeline:
A) Let it crash silently
B) Handle and surface errors clearly — a pipeline that fails silently or produces garbage on bad input causes hard-to-trace problems downstream
C) Is unnecessary
D) Is the ops team's job

**19.** Code review for ML code:
A) Is unnecessary
B) Catches bugs, leakage, and maintainability issues — ML code is real software and benefits from review like any code
C) Is only for backend code
D) Slows delivery

**20.** Dependency and environment reproducibility:
A) Does not matter
B) Is essential — pinned dependencies and containerization ensure the code and model behave the same across environments, since ML libraries shift behavior
C) Is the ops team's job
D) Is automatic

**21.** Performance of data-processing code:
A) Never matters
B) Matters at ML data scale — vectorization, efficient I/O, and appropriate data structures keep pipelines feasible; naive code can be impossibly slow
C) Is the ops team's job
D) Is always fast enough

**22.** A shared preprocessing function used in training and serving:
A) Can differ between the two
B) Must produce identical results in both, or the model sees different inputs than it trained on — a common, subtle production bug
C) Is unnecessary
D) Should be duplicated with changes

**23.** Version control for models, data, and code together:
A) Only code needs versioning
B) All three matter for reproducibility — knowing which code, data, and config produced a given model is essential to reproduce and debug it
C) Is impossible
D) Is the ops team's job

**24.** A magic number or threshold buried in code:
A) Is fine
B) Should be named, documented, and configurable — unexplained constants make systems fragile and hard to tune or understand
C) Is best practice
D) Improves performance

**25.** Handling large data that does not fit in memory:
A) Is impossible
B) Requires appropriate techniques (streaming, chunking, distributed processing, database-side computation) — part of engineering ML at scale
C) Means giving up
D) Is the data scientist's job

**26.** Idempotency in a pipeline step:
A) Is irrelevant
B) Means re-running it produces the same result — important so that retries and reruns after failures are safe and do not duplicate or corrupt data
C) Means it runs once
D) Is a security term

---

## Section C — Training and Evaluation Craft (Q27–Q40)

**27.** A train/validation/test split done correctly:
A) Is optional
B) Keeps the test set untouched for a final honest estimate, uses validation for tuning, and prevents any leakage between them — the foundation of trustworthy evaluation
C) Uses the same data for all three
D) Is only for large datasets

**28.** For time-ordered data, splitting randomly:
A) Is correct
B) Leaks future into the past — time series must be split by time (train on earlier, test on later), or performance is fake
C) Improves the model
D) Has no effect

**29.** Cross-validation:
A) Trains on all data at once
B) Estimates generalization more robustly by rotating through train/validation folds — with care to avoid leakage across folds
C) Tests on training data
D) Is unnecessary

**30.** Data leakage in feature engineering:
A) Improves models
B) Occurs when features encode the target or future information — the top cause of models that look great in testing and fail in production; guard every feature against it
C) Is harmless
D) Only affects deep learning

**31.** Fitting a scaler or encoder on all data before splitting:
A) Is correct
B) Leaks test information into training — fit preprocessing on training data only, then apply to validation/test
C) Has no effect
D) Is best practice

**32.** Overfitting during training:
A) Is desirable
B) Is detected by a growing gap between training and validation performance — addressed with regularization, more/better data, or a simpler model
C) Cannot be detected
D) Is the same as underfitting

**33.** Hyperparameter tuning:
A) On the test set
B) On validation data or via cross-validation — the test set stays untouched until the final evaluation, or the estimate is inflated
C) Is unnecessary
D) Is random

**34.** A baseline to compare against:
A) Is pointless
B) Is essential — comparing to a simple baseline shows whether a complex model actually earns its complexity
C) Is the final model
D) Is always best

**35.** Choosing the evaluation metric before modeling:
A) Decide after seeing results
B) Choose the metric that reflects the real goal and error costs up front, so you optimize and judge against the right thing rather than the most flattering number
C) Always accuracy
D) Does not matter

**36.** Class imbalance handling:
A) Ignore it
B) Use appropriate metrics and techniques (resampling, class weights, threshold tuning) chosen carefully — and validate honestly, since some techniques can distort
C) Delete the majority class
D) Is fixed by accuracy

**37.** Reproducibility of a training run (seeds, versions):
A) Is unnecessary
B) Requires controlling randomness and recording data/code/config — so a model can be reproduced and its results trusted
C) Biases the model
D) Slows training

**38.** Evaluating a model's errors qualitatively:
A) Is unnecessary
B) Is valuable — examining what kinds of examples the model gets wrong reveals patterns, data issues, and failure modes metrics alone hide
C) Is the QA team's job
D) Proves nothing

**39.** Reporting model performance:
A) The single best number from many runs
B) The honest expected performance on unseen, representative data, with the metric that matters, comparison to baseline, and awareness of uncertainty
C) Training accuracy
D) The most flattering slice

**40.** Deciding a model is "good enough":
A) When accuracy is 100%
B) When it meets the real requirement for the problem and reliably beats the alternative — perfection is not the bar; fitness for purpose is
C) When it is the biggest
D) Never

---

## Section D — Data and Feature Pipelines (Q41–Q52)

**41.** A feature pipeline:
A) Is a one-off script
B) Is the reproducible process that transforms raw data into model features — ideally consistent between training and serving to prevent skew
C) Is the model
D) Is a database

**42.** Training-serving skew from separate feature code:
A) Is unavoidable
B) Is a top production failure — features computed one way in training and another in serving make the live model see different inputs; share the logic or a feature store
C) Improves the model
D) Is a style issue

**43.** A feature store (at a basic level):
A) Is a model registry
B) Is a system for defining, computing, and serving features consistently for training and serving — reducing skew and enabling reuse
C) Is a database backup
D) Is irrelevant

**44.** Feature availability at serving time:
A) Is always guaranteed
B) Must be verified — a feature present in historical data may be missing, delayed, or stale at prediction time; designing for serving reality prevents failure and leakage
C) Is the data scientist's job
D) Never matters

**45.** Handling missing or malformed data in a serving pipeline:
A) Let it crash or pass garbage
B) Handle it deliberately — validation, sensible defaults or rejection, and clear errors — because real serving data is messier than training data
C) Is unnecessary
D) Never happens

**46.** Data validation in a pipeline:
A) Is optional
B) Catches bad data before it corrupts training or serving — schema checks, ranges, and distribution checks detect problems early
C) Is the QA team's job
D) Slows the pipeline

**47.** A silent change in an upstream data source:
A) Never affects the model
B) Can silently degrade or break a model (a renamed field, changed units, new nulls) — monitoring and validation catch it before it causes harm
C) Improves the model
D) Is impossible

**48.** Reprocessing historical data with new feature logic:
A) Is always safe
B) Must be done carefully to avoid leakage and to keep training data consistent with what serving will produce — versioning features helps
C) Is unnecessary
D) Is impossible

**49.** Data versioning for reproducibility:
A) Is unnecessary
B) Lets you tie a model to the exact data that produced it — essential for reproducing, debugging, and auditing
C) Is the same as code versioning
D) Slows the work

**50.** Pipeline orchestration (scheduling and dependencies):
A) Is unnecessary
B) Manages multi-step pipelines reliably — running steps in order, handling failures and retries — so data and models are produced dependably
C) Is a model
D) Is the model's job

**51.** A pipeline that fails partway:
A) Should leave partial, inconsistent state
B) Should fail safely and be re-runnable to a consistent state — partial or corrupt outputs cause hard-to-trace downstream problems
C) Is fine
D) Cannot happen

**52.** Monitoring data quality in production:
A) Is unnecessary
B) Is essential — the data feeding a live model can drift or break, and monitoring its quality and distribution catches problems before predictions degrade
C) Is the same as model accuracy
D) Is the data scientist's job

---

## Section E — Serving and Deployment (Q53–Q66)

**53.** Serving a model behind an API:
A) Is the same as training it
B) Exposes it to receive inputs and return predictions in production — with concerns about latency, correctness, input validation, error handling, and reliability
C) Is a notebook cell
D) Is unnecessary

**54.** Validating inputs to a served model:
A) Is unnecessary — trust the caller
B) Is essential — malformed or out-of-range inputs must be handled, since real callers send unexpected data and the model may behave badly on it
C) Is the caller's job
D) Slows serving

**55.** Latency requirements for real-time serving:
A) Do not matter
B) Constrain the model and infrastructure — a model too slow for the required response time is unusable regardless of accuracy
C) Are the model's accuracy
D) Are irrelevant

**56.** Batch inference:
A) Is worse than real-time always
B) Suits cases where predictions can be precomputed on a schedule — simpler and cheaper than real-time when latency is not critical
C) Is obsolete
D) Is the same as real-time

**57.** A model artifact and its versioning:
A) Rebuild at serving time
B) Save, version, and store the trained model so the exact version can be deployed, reproduced, and rolled back
C) Is the training code
D) Is a dataset

**58.** Deploying a new model version safely:
A) Replace instantly everywhere
B) Validate, then roll out gradually (canary/shadow), monitor, and keep the ability to roll back — because a new model can be worse in ways offline metrics missed
C) Requires no testing
D) Is irreversible

**59.** Shadow deployment:
A) Serves the new model to all users
B) Runs the new model alongside the current one without affecting users, comparing its outputs — a safe way to validate before switching
C) Is the same as canary
D) Is unsafe

**60.** A rollback plan for a model deployment:
A) Is unnecessary
B) Is essential — being able to revert quickly to the previous model limits damage when a new one misbehaves
C) Means the model failed
D) Is impossible

**61.** Monitoring a deployed model:
A) Is optional
B) Tracks prediction quality, input drift, latency, and errors — because models decay silently and problems must be caught before users are harmed
C) Is the same as training metrics
D) Is the ops team's job only

**62.** Detecting data drift in production:
A) Is impossible
B) Compares live input distributions to training data to catch when the world has shifted enough to degrade the model — triggering investigation or retraining
C) Is unnecessary
D) Is a code bug

**63.** A model's confidence or uncertainty at serving time:
A) Is irrelevant
B) Can be used to handle low-confidence predictions differently (fallback, human review) — improving reliability where the model is unsure
C) Is always 100%
D) Is the same as accuracy

**64.** A fallback when the model fails or is unavailable:
A) Return an error to the user always
B) Have a sensible degraded behavior or default so the product does not break entirely when the model is down or uncertain
C) Is unnecessary
D) Means the model failed

**65.** Resource cost and scaling of serving:
A) Are irrelevant
B) Are real constraints — serving must scale with load within cost limits, and an expensive model may need optimization or a cheaper alternative
C) Are the finance team's job
D) Never matter

**66.** Logging predictions in production (carefully):
A) Is pointless
B) Enables monitoring, debugging, and future retraining — logging inputs and outputs (without leaking sensitive data) is valuable, with privacy in mind
C) Is the same as training logs
D) Is unnecessary

---

## Section F — MLOps Foundations (Q67–Q78)

**67.** MLOps:
A) Is a single tool
B) Is the practices and infrastructure for building, deploying, monitoring, and maintaining ML systems reliably — bringing engineering discipline to the ML lifecycle
C) Is training models
D) Is irrelevant to ML engineers

**68.** A model registry:
A) Is a dataset
B) Is a versioned store of trained models with metadata (metrics, data version, stage) — enabling controlled deployment, rollback, and auditing
C) Is a feature store
D) Is a database backup

**69.** CI/CD for ML:
A) Does not apply to ML
B) Automates testing, building, and deploying ML code and models — extending software CI/CD with data and model validation
C) Is the same as training
D) Is only for app code

**70.** Automated retraining:
A) Is always unnecessary
B) Can be set up to retrain models on fresh data on a schedule or trigger — but requires validation gates so a bad retrain is not auto-deployed
C) Should auto-deploy without checks
D) Is impossible

**71.** A retrained model that is worse than the current one:
A) Should be deployed anyway
B) Should be caught by a validation gate and not deployed — automated pipelines must compare against the current model before promoting
C) Is impossible
D) Is always better

**72.** Experiment tracking:
A) Is unnecessary
B) Records runs, parameters, data versions, and metrics so experiments are comparable and reproducible — remembering "which run was best and why"
C) Is the same as logging
D) Slows the work

**73.** Reproducing a model from six months ago:
A) Is impossible
B) Requires the code, data version, config, and environment to have been captured — reproducibility is a design goal, not an afterthought
C) Is automatic
D) Is unnecessary

**74.** Monitoring model performance over time:
A) Is unnecessary once deployed
B) Is essential — tracking real-world performance detects decay from drift and triggers retraining or investigation
C) Is the same as training accuracy
D) Is the data scientist's job

**75.** Alerting on ML system problems:
A) Is unnecessary
B) Notifies the team of drift, degraded performance, data issues, or serving errors — so problems are addressed before they cause significant harm
C) Should fire on everything
D) Is the ops team's job only

**76.** Pipeline and model lineage:
A) Is bureaucracy
B) Tracks what data and code produced a model and what a model feeds — essential for debugging, auditing, and understanding impact of changes
C) Is unnecessary
D) Is the ops team's job

**77.** Treating ML infrastructure as code:
A) Is unnecessary
B) Makes ML environments reproducible, reviewable, and reliable — the same discipline applied to infrastructure as to application code
C) Is the ops team's job only
D) Slows the work

**78.** The goal of MLOps:
A) To add process for its own sake
B) To make ML systems reliable, reproducible, and maintainable in production — so models keep delivering value safely as data and the world change
C) To slow ML teams
D) To reduce headcount

---

## Section G — Applied Pretrained Models and LLMs (Q79–Q90)

**79.** Using a pretrained model:
A) Is cheating
B) Is often the practical, effective choice — leveraging existing models (via fine-tuning or as-is) usually beats training from scratch, which is expensive and data-hungry
C) Never works
D) Is always worse

**80.** Transfer learning / fine-tuning:
A) Is training from scratch
B) Adapts a pretrained model to a specific task with less data and compute than training from scratch — a core practical technique
C) Is the same as prompting
D) Is obsolete

**81.** Fine-tuning versus prompting an LLM:
A) Are the same
B) Prompting steers a model at inference with instructions/context; fine-tuning changes the model's weights on task data — different costs, tradeoffs, and use cases
C) Fine-tuning is always better
D) Prompting never works

**82.** Retrieval-augmented generation (RAG):
A) Is fine-tuning
B) Supplies relevant external/private information to a model at query time so answers are grounded in that data — reducing hallucination and using data the model was not trained on
C) Is a database
D) Is training from scratch

**83.** LLM hallucination:
A) Is solved
B) Is a fundamental limitation — models produce fluent but sometimes false output; systems must be designed to verify, ground, or constrain output, not assume correctness
C) Means the model is broken
D) Only affects small models

**84.** Evaluating an LLM-based feature:
A) Use accuracy only
B) Requires careful, often task-specific evaluation — test sets, human review, or automated checks — because open-ended outputs are hard to judge and "it seems to work" is not evaluation
C) Is unnecessary
D) Is impossible

**85.** Prompt engineering:
A) Has no effect
B) Materially changes output quality — clear instructions, context, examples, and structure are a real, learnable skill for getting reliable results
C) Is the model's weights
D) Is irrelevant

**86.** Sending user or sensitive data to a third-party AI API:
A) Has no implications
B) Requires attention to privacy, security, data-handling terms, and compliance — sensitive data should not leave your control without proper safeguards
C) Is always fine
D) Is always forbidden

**87.** Cost and latency of LLM calls:
A) Are negligible
B) Are real product constraints — large-model calls can be slow and costly per request, shaping how they can be used and requiring optimization (caching, smaller models, batching)
C) Are the finance team's job
D) Never matter

**88.** Guarding against harmful or unexpected LLM output:
A) Is unnecessary
B) Is part of responsible design — validating, filtering, and constraining output protects users from harmful, wrong, or off-purpose responses
C) Is impossible
D) Is the model provider's job only

**89.** Non-determinism in generative model outputs:
A) Never happens
B) Can occur with sampling — the same input may yield different outputs, which must be accounted for in testing, caching, and reliability
C) Means the model is broken
D) Is irrelevant

**90.** Blindly trusting AI-generated code or output in production:
A) Is fine — it is usually right
B) Is risky — AI output can be confidently wrong, and it must be verified and tested before being relied upon
C) Is required for speed
D) Is always safe

---

## Section H — Collaboration, Ethics, and Growth (Q91–Q100)

**91.** Collaborating with data scientists:
A) Is unnecessary
B) Is common and valuable — data scientists often prototype models, ML engineers productionize and operate them; close collaboration produces better systems
C) Is adversarial
D) Is the manager's job

**92.** Collaborating with backend and platform engineers:
A) Is unnecessary
B) Is essential — ML systems run on real infrastructure, and building reliable serving, pipelines, and monitoring requires working with these teams
C) Is adversarial
D) Undermines the ML engineer

**93.** Bias and fairness in an ML system:
A) Are not the engineer's concern
B) Are a responsibility — biased data and models can cause real harm, and evaluating for and mitigating bias is part of building responsibly
C) Are only legal issues
D) Cannot be measured

**94.** Data privacy in ML systems:
A) Is not the engineer's concern
B) Is a real responsibility — training data and model inputs/outputs can contain personal data requiring protection and compliance
C) Is the legal team's job only
D) Is irrelevant

**95.** A model making automated decisions about people:
A) Needs no special care
B) Warrants care about errors, fairness, transparency, and recourse — automated decisions at scale can cause systematic harm, and the engineer helps design safeguards
C) Is always safe
D) Is the PM's concern only

**96.** Copy-pasting model or pipeline code you do not understand:
A) Is fine if it runs
B) Is risky — you cannot verify correctness, and subtle errors (like leakage or skew) silently produce broken systems that look fine
C) Is required for speed
D) Is encouraged

**97.** Saying "I don't know, let me verify":
A) Damages credibility
B) Is the professional habit — ML systems have subtle, silent failure modes, and confident guessing ships broken models; verifying is the job
C) Is for juniors only
D) Should be hidden

**98.** When your model causes a production problem:
A) Hide it
B) Speak up, help mitigate (rollback), and contribute honestly to the blameless review — concealment compounds harm and erodes trust
C) Blame the data scientist
D) Wait to be found out

**99.** Owning an ML component end-to-end means:
A) Training a model
B) Framing the problem, building the data and training pipeline, evaluating honestly, deploying reliably, monitoring, and maintaining it — the whole lifecycle, not just the model
C) A notebook
D) The happy path only

**100.** The most reliable predictor of growth past Junior 2 is:
A) Knowing the most models
B) Combining solid engineering (reliable pipelines, serving, MLOps) with honest ML rigor (no leakage, real evaluation) and the judgment to build systems that keep working in production
C) Training the biggest models
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
