# Promotion Exam: Intern → Junior AI/ML Engineer 1

**Track:** AI/ML Engineer (Specialist — building, training, deploying, and operating ML systems)
**Format:** 100 multiple-choice questions
**Time:** 120 minutes
**Passing score:** 89 / 100

**Scope.** This exam evaluates whether an intern is ready to be hired as a Junior AI/ML Engineer 1. This role sits at the intersection of machine learning and software engineering: it is about turning models into working, reliable systems, not only about the math of the models. So this exam blends real software-engineering fundamentals (programming, data structures, Git, testing, APIs) with ML foundations (how learning works, training and evaluation, common pitfalls) and the engineering discipline the role demands. The bar is: "can be trusted to implement a scoped ML task under supervision — train and evaluate a model correctly, wrap it in working code — without introducing leakage, silent errors, or unsafe practices."

**A note on the discipline.** An ML engineer who cannot write solid software is not an ML engineer — they are stuck in a notebook. Equally, one who writes great code but does not understand overfitting, leakage, or evaluation will ship models that look good and fail in reality. This track requires both, and this exam weights both. Because this role increasingly includes working with large language models and other pretrained AI, foundational awareness of those is included too.

---

## Section A — What ML Engineering Is (Q1–Q12)

**1.** The core job of an ML engineer is:
A) To invent new algorithms
B) To build reliable systems that apply machine learning to solve real problems — turning models into working, maintainable software that delivers value
C) To train models in notebooks only
D) To achieve the highest accuracy regardless of anything else

**2.** The difference between a model that works in a notebook and a working ML system:
A) There is none
B) Is large — a system needs reliable data pipelines, serving, monitoring, testing, and maintenance around the model; the model is a small part of the whole
C) The notebook is the system
D) Only accuracy matters

**3.** ML engineering versus data science:
A) Are identical
B) Overlap but differ in emphasis — data science leans toward analysis and inference; ML engineering leans toward building and operating ML systems in production, closer to software engineering
C) ML engineering does no modeling
D) Data science does all the engineering

**4.** A highly accurate model that cannot be reliably deployed or maintained:
A) Is a success
B) Has limited value — accuracy that cannot be delivered reliably to users does not solve the problem; the system around the model matters as much as the model
C) Is the goal
D) Is the norm and fine

**5.** Software engineering skill for an ML engineer:
A) Is unnecessary — libraries do everything
B) Is essential — the role is building software, and weak engineering produces fragile, unmaintainable, buggy ML systems
C) Is the backend team's job
D) Is optional

**6.** The most dangerous ML failure mode is often:
A) Slow training
B) A model that looks good in evaluation but fails in reality — due to leakage, a mismatched test set, or drift — because it ships with false confidence
C) Using an old algorithm
D) A large model file

**7.** Reproducibility of a training run:
A) Is unnecessary
B) Is essential — being able to reproduce a model from data, code, and configuration is required for debugging, auditing, and trust
C) Slows the work
D) Is only for research

**8.** When you do not understand what a model or piece of code does:
A) Ship it if the metrics look good
B) Do not ship it until you understand it — you cannot debug, maintain, or vouch for what you do not understand
C) It is fine if a library produced it
D) It is the senior's problem

**9.** The relationship between ML engineers and data scientists:
A) Adversarial
B) Collaborative — often data scientists explore and prototype, ML engineers productionize and operate; the roles blend and overlap depending on the team
C) They never interact
D) One replaces the other

**10.** "Garbage in, garbage out" in ML:
A) Is outdated
B) Is fundamental — a model is only as good as its data; data quality and correctness often matter more than model choice
C) Only applies to databases
D) Is about code style

**11.** The biggest share of effort in real ML work is usually:
A) Choosing the algorithm
B) Data — acquiring, cleaning, understanding, and pipelining it — plus the engineering around the model; modeling itself is often a smaller part
C) Tuning hyperparameters
D) Writing the paper

**12.** The most valuable trait for a junior ML engineer is:
A) Knowing the most models
B) Solid engineering discipline combined with genuine understanding of ML fundamentals and pitfalls — and the humility to verify rather than assume
C) Training the biggest models
D) Working the longest hours

---

## Section B — Programming and Software Foundations (Q13–Q28)

**13.** A variable, function, conditional, and loop:
A) Are beneath an ML engineer
B) Are the basic building blocks an ML engineer uses constantly — fluency with them is non-negotiable
C) Are only for backend engineers
D) Do not matter with ML libraries

**14.** A function:
A) Is a variable
B) Is a reusable, named block of code taking inputs and returning outputs — the basic unit of organizing and reusing logic
C) Is a loop
D) Is a comment

**15.** Time and space complexity (Big-O):
A) Are irrelevant to ML
B) Matter — ML deals with large data, and inefficient code (e.g., a needless O(n²) loop over data) can make training or serving infeasibly slow
C) Only matter in interviews
D) Are about model accuracy

**16.** A hash map / dictionary:
A) Is a list
B) Provides fast key-based lookup (average O(1)) — a core data structure for counting, grouping, and lookups in data work
C) Is always sorted
D) Is a database

**17.** Vectorized operations (NumPy/pandas) versus Python loops:
A) Loops are faster
B) Vectorized operations are typically far faster and cleaner for numerical data — writing slow explicit loops where vectorization exists is a common inefficiency
C) Are identical
D) Vectorization is deprecated

**18.** Version control (Git):
A) Is unnecessary for ML
B) Is essential — ML code, configs, and pipelines belong under version control with history and review, like any software
C) Is for backend engineers only
D) Slows the work

**19.** Committing large data files or model weights to a Git repository:
A) Is best practice
B) Is usually wrong — Git is for code; large artifacts belong in appropriate storage (artifact stores, data versioning tools), not bloating the repo
C) Is required
D) Has no downside

**20.** Writing tests for ML code:
A) Is impossible
B) Is valuable — data validation, transformation logic, and pipeline steps can and should be tested; untested ML code hides silent, result-corrupting bugs
C) Is the QA team's job
D) Slows the work pointlessly

**21.** A secret (API key, credential) in ML code:
A) Is fine in a private repo
B) Must never be committed — use environment variables or a secrets manager; leaked credentials are a serious security risk
C) Should be base64 encoded
D) Is safe if deleted later

**22.** Reading a stack trace / error:
A) Is a backend skill only
B) Is a core skill — errors usually point to what failed and where, and reading them is how you debug training and serving code
C) Is impossible
D) Wastes time

**23.** Dependency and environment management:
A) Does not matter
B) Matters greatly — ML code depends on specific library versions, and unmanaged environments cause "works on my machine" and irreproducible results
C) Is the ops team's job
D) Is automatic

**24.** A reproducible environment (pinned dependencies, container):
A) Is unnecessary
B) Ensures the code runs the same elsewhere — crucial for reproducibility and deployment, since ML libraries change behavior across versions
C) Slows the work
D) Is only for large teams

**25.** Code readability and structure in ML projects:
A) Do not matter — it is just experiments
B) Matter — unreadable, unstructured ML code becomes unmaintainable and untrustworthy; production ML is real software
C) Should be minimized
D) Are the reviewer's job

**26.** A notebook with hidden execution-order dependencies:
A) Is fine
B) Is a reproducibility trap — results that depend on running cells in a hidden order are unreliable; a clean top-to-bottom run should reproduce the work
C) Is best practice
D) Is more efficient

**27.** An API (Application Programming Interface):
A) Is a database
B) Is a defined interface for one piece of software to call another — how models are typically served and consumed in production
C) Is a model
D) Is a file format

**28.** JSON:
A) Is a programming language
B) Is a common data format for API requests and responses — ML engineers read and produce it constantly when serving models
C) Is a model type
D) Is a database

---

## Section C — Data for ML (Q29–Q40)

**29.** Training data quality:
A) Does not matter with a good model
B) Is often the biggest determinant of model quality — errors, bias, and noise in data propagate into the model; data work is central, not peripheral
C) Is the data team's problem only
D) Is automatic

**30.** A dataset split into train, validation, and test:
A) Is unnecessary
B) Separates data for training, for tuning/model selection, and for a final honest performance estimate — mixing them corrupts the evaluation
C) Should all be the same data
D) Is only for large datasets

**31.** Evaluating a model on data it was trained on:
A) Gives an honest estimate
B) Overstates performance — the model has seen it; only unseen data reflects generalization
C) Is best practice
D) Is required

**32.** Data leakage:
A) Improves models honestly
B) Is when information not available at prediction time (or the target itself) leaks into training — producing models that look great in testing and fail in reality; a top pitfall
C) Is harmless
D) Only affects deep learning

**33.** Fitting preprocessing (e.g., scaling) on the full dataset before splitting:
A) Is correct
B) Leaks test information into training — preprocessing must be fit on training data only, then applied to validation/test
C) Has no effect
D) Is best practice

**34.** A feature computed using future information:
A) Is the best feature
B) Is leakage — it will not be available at prediction time in production, so the model's evaluation is fake; features must respect the prediction-time reality
C) Improves generalization
D) Is fine

**35.** Missing values in data:
A) Can always be ignored
B) Require thought — why they are missing affects handling, and naive deletion or filling can bias the model
C) Should always be filled with zero
D) Never occur

**36.** Class imbalance (e.g., 99% negatives):
A) Never affects models
B) Can cause a model to ignore the rare class and still show high accuracy — requiring appropriate metrics and handling
C) Is fixed by accuracy
D) Requires deleting the majority

**37.** A data pipeline:
A) Is a single script run once
B) Is the (ideally automated, reproducible) flow that ingests, cleans, transforms, and delivers data for training or serving — a core ML-engineering artifact
C) Is the model
D) Is a database

**38.** Consistency between training and serving data processing:
A) Does not matter
B) Is critical — if features are computed differently at training and serving time (training-serving skew), the model misbehaves in production
C) Is automatic
D) Is the data scientist's concern only

**39.** Data versioning:
A) Is unnecessary
B) Lets you know exactly what data produced a model — essential for reproducibility, debugging, and auditing
C) Is the same as code versioning always
D) Slows the work

**40.** Labels for supervised learning:
A) Are always perfect
B) Can be noisy, biased, or wrong — label quality directly limits model quality, and understanding how labels were produced matters
C) Are the model's output
D) Are irrelevant

---

## Section D — Machine Learning Foundations (Q41–Q56)

**41.** Supervised learning:
A) Uses no labels
B) Learns to map inputs to a known target from labeled examples — for prediction on new data
C) Is the same as clustering
D) Requires no data

**42.** Unsupervised learning:
A) Predicts a labeled target
B) Finds structure in unlabeled data (e.g., clustering, dimensionality reduction) — no target labels
C) Is the same as supervised
D) Requires labels

**43.** Classification versus regression:
A) Are the same
B) Classification predicts a category; regression predicts a continuous value — determining the models and metrics used
C) Regression predicts categories
D) Classification predicts numbers

**44.** How a model "learns":
A) By memorizing a lookup table
B) By adjusting parameters to minimize a loss function that measures prediction error — iteratively improving fit to the training objective
C) Randomly
D) By copying the answer

**45.** A loss function:
A) Is the accuracy
B) Measures how wrong the model's predictions are; training minimizes it — choosing the right loss for the task matters
C) Is the model
D) Is irrelevant

**46.** Gradient descent:
A) Is a data structure
B) Is an optimization method that iteratively adjusts parameters in the direction that reduces the loss — the workhorse of training many models
C) Is a model type
D) Is a metric

**47.** Overfitting:
A) A model too simple
B) A model that learns noise/quirks of training data, performing well on training but poorly on unseen data
C) Always desirable
D) Undetectable

**48.** Underfitting:
A) Memorizing training data
B) A model too simple to capture the real pattern, performing poorly on both training and test data
C) Always desirable
D) The same as overfitting

**49.** The bias-variance tradeoff:
A) Does not exist
B) Balances a too-simple model (high bias) against a too-complex one (high variance) — the goal is generalization, not either extreme
C) Means maximize complexity
D) Means minimize data

**50.** Regularization:
A) Increases complexity
B) Penalizes complexity to reduce overfitting — trading a little training fit for better generalization
C) Is the same as scaling
D) Always hurts

**51.** Hyperparameters:
A) Are learned during training
B) Are configuration values set before/around training (learning rate, depth, regularization strength) — tuned using validation data, never the test set
C) Are the model's outputs
D) Are irrelevant

**52.** Tuning hyperparameters on the test set:
A) Is correct
B) Leaks and inflates the final performance estimate — tuning must use validation data or cross-validation, keeping the test set untouched until the end
C) Is best practice
D) Has no effect

**53.** Cross-validation:
A) Tests on training data
B) Repeatedly splits data into train/validation folds to estimate generalization more reliably than a single split
C) Proves causation
D) Is unnecessary

**54.** A baseline model:
A) Is pointless
B) Provides context — a simple model (majority class, mean, or a basic method) to compare against; a complex model barely beating the baseline may not be worth it
C) Is the final model
D) Is always best

**55.** Neural networks and deep learning:
A) Are always the right choice
B) Are powerful for certain problems (images, text, audio) but not always the best tool — for much tabular data, simpler models are competitive and easier to operate
C) Should be used for everything
D) Are obsolete

**56.** Choosing a model:
A) Always the newest/most complex
B) Match it to the problem, data, constraints, and interpretability needs — preferring the simplest model that meets the need
C) Always deep learning
D) Is arbitrary

---

## Section E — Evaluation (Q57–Q68)

**57.** Accuracy as a metric:
A) Is always right
B) Can mislead, especially with imbalanced classes — the metric must fit the problem and the costs of different errors
C) Is the only metric
D) Is never useful

**58.** Precision and recall:
A) Are the same
B) Precision: of predicted positives, how many are correct; recall: of actual positives, how many were caught — they trade off, and which matters depends on error costs
C) Are always equal
D) Are irrelevant

**59.** A confusion matrix:
A) Is a bug
B) Breaks predictions into true/false positives and negatives — the basis for precision, recall, and understanding error types
C) Is a feature chart
D) Is irrelevant

**60.** A model with 99% accuracy on a 99%-one-class dataset:
A) Is excellent
B) May be useless — it could be ignoring the rare class entirely; accuracy alone hides this, which is why other metrics matter
C) Is the goal
D) Cannot happen

**61.** Choosing an evaluation metric:
A) Always accuracy
B) Should reflect the real costs of errors in the specific application — a spam filter, a medical screen, and a recommender care about different things
C) Is arbitrary
D) Is the data team's job

**62.** Evaluating on a representative test set:
A) Any data works
B) The test set must reflect the real deployment distribution, or the estimate is misleading — a test set unlike production gives false confidence
C) Should be the training data
D) Does not matter

**63.** A model that evaluates well offline but fails in production:
A) Is impossible
B) Often reflects leakage, distribution shift, or an unrepresentative test set — a reason to evaluate honestly and monitor after deployment
C) Means the metric was wrong only
D) Is always the ops team's fault

**64.** Evaluating across subgroups:
A) Aggregate performance is enough
B) Reveals whether a model performs badly for some groups — important for reliability and fairness, which aggregate metrics hide
C) Is unnecessary
D) Is impossible

**65.** Reporting only the best of many runs:
A) Is honest
B) Is selective reporting that inflates apparent performance — the evaluation must be honest about the process, not just the best outcome
C) Is required
D) Has no downside

**66.** A performance estimate's uncertainty:
A) It is exact
B) It is an estimate with variance — over-interpreting tiny differences between models is false precision
C) Does not matter
D) Is always zero

**67.** Threshold selection for a classifier:
A) Always 0.5
B) Should be set based on the costs of false positives vs negatives in the real application — the default is rarely optimal
C) Does not affect results
D) Is the ops team's job

**68.** Interpreting feature importances:
A) They prove causation
B) They describe association within the model, not causation, and can be unstable — useful but interpreted with care
C) Are meaningless
D) Are exact truth

---

## Section F — Serving, Deployment, and Systems (Q69–Q82)

**69.** Model serving:
A) Is the same as training
B) Is making a trained model available to produce predictions in production (via an API or batch job) — with its own reliability, latency, and correctness concerns
C) Is a notebook cell
D) Is unnecessary

**70.** Batch versus real-time (online) inference:
A) Are the same
B) Batch predicts on groups of data on a schedule; real-time serves predictions on demand with latency requirements — different constraints and designs
C) Real-time is always better
D) Batch is obsolete

**71.** Latency in real-time serving:
A) Does not matter
B) Is a real constraint — a model too slow to respond within the required time is unusable, regardless of accuracy; it shapes model and infrastructure choices
C) Is the model's accuracy
D) Is irrelevant

**72.** Training-serving skew:
A) Does not exist
B) Is when features or preprocessing differ between training and serving — a top cause of models that work offline but fail live; consistency must be ensured
C) Improves the model
D) Is a code style issue

**73.** A model artifact (the saved trained model):
A) Should be rebuilt at serving time
B) Should be versioned and stored so the exact model can be deployed, reproduced, and rolled back — treating models as versioned artifacts
C) Is the training code
D) Is a dataset

**74.** Deploying a new model version:
A) Replace the old one instantly everywhere
B) Should be done carefully — validating, and often rolling out gradually (or shadow/canary testing) with the ability to roll back if it misbehaves
C) Requires no testing
D) Is irreversible

**75.** Monitoring a deployed model:
A) Is unnecessary
B) Is essential — watching for performance degradation, data drift, errors, and latency, because models decay silently as the world changes
C) Is the same as training
D) Is optional

**76.** Data/concept drift:
A) Does not happen
B) Is the world changing so the data (or the relationship being modeled) shifts over time — degrading a static model; monitoring and retraining address it
C) Improves models automatically
D) Is a coding bug

**77.** A model in production is:
A) Finished once deployed
B) A living system needing monitoring, maintenance, and periodic retraining — deployment is the start of an operational lifecycle, not the end
C) Never changed
D) The data scientist's concern only

**78.** Reproducible training pipelines:
A) Are unnecessary
B) Let a model be retrained reliably and audited — capturing data version, code, and config so a result can be reproduced
C) Are the ops team's job
D) Slow the work

**79.** A model's resource cost (compute, memory, latency):
A) Is irrelevant
B) Is a real engineering constraint — a marginally more accurate model that is far more expensive or slower may not be worth deploying
C) Is the finance team's job
D) Never matters

**80.** Logging and observability for an ML system:
A) Are unnecessary
B) Are essential — logging inputs, outputs, and errors (without leaking sensitive data) enables debugging, monitoring, and understanding production behavior
C) Are the same as training metrics
D) Are optional

**81.** An input at serving time unlike anything in training:
A) The model handles it perfectly
B) May produce an unreliable prediction — models extrapolate poorly to out-of-distribution inputs, and a robust system detects or guards against this
C) Is impossible
D) Improves the model

**82.** A fallback when the model is unavailable or uncertain:
A) Is unnecessary
B) Is good system design — a sensible default or degraded behavior when the model fails or is low-confidence prevents a broken user experience
C) Means the model failed
D) Is the model's job

---

## Section G — Modern AI and LLMs (Q83–Q92)

**83.** A large language model (LLM):
A) Is a database of facts
B) Is a model trained on large amounts of text that predicts likely continuations — powerful for many language tasks, but with real limitations
C) Is always correct
D) Understands like a human

**84.** LLM hallucination:
A) Does not happen
B) Is when a model produces fluent, confident output that is factually wrong — a fundamental limitation to design around, not assume away
C) Means the model is broken
D) Only happens with small models

**85.** Using a pretrained model / API versus training from scratch:
A) Always train from scratch
B) Using pretrained models or APIs is often far more practical and effective than training from scratch — much ML engineering is applying existing models well
C) Is always cheating
D) Never works

**86.** A prompt to an LLM:
A) Has no effect on output quality
B) Strongly shapes the output — clear instructions, context, and examples materially change results; prompt design is a real skill
C) Is the model's weights
D) Is irrelevant

**87.** Retrieval-augmented generation (RAG), at a basic level:
A) Is training a model
B) Supplies relevant external information to a model at query time so its answer is grounded in that data — a common pattern to reduce hallucination and use private data
C) Is the same as fine-tuning
D) Is a database

**88.** Sending sensitive data to an external AI API:
A) Has no implications
B) Requires care — data privacy, security, and contractual terms matter; sensitive data should not be sent to third parties without proper safeguards
C) Is always fine
D) Is always forbidden

**89.** Evaluating an LLM-based feature:
A) Is unnecessary — LLMs just work
B) Is essential and harder — outputs are open-ended, so evaluation needs careful design (test cases, human review, or automated checks); assuming it works is dangerous
C) Uses accuracy only
D) Is impossible

**90.** Non-determinism in some model outputs:
A) Never happens
B) Can occur (e.g., sampling in generative models) — meaning the same input may give different outputs, which affects testing and reliability design
C) Means the model is broken
D) Is irrelevant

**91.** The cost and latency of large models:
A) Are negligible
B) Are real constraints — large models can be slow and expensive per call, which shapes whether and how they can be used in a product
C) Are the finance team's job
D) Never matter

**92.** Blindly trusting AI-generated output (including for code):
A) Is fine — it is usually right
B) Is risky — AI output can be confidently wrong, and it must be verified before being relied upon, especially in production
C) Is required for speed
D) Is always safe

---

## Section H — Ethics, Collaboration, and Habits (Q93–Q100)

**93.** Bias in ML models:
A) Does not exist
B) Is real — models trained on biased data reproduce and can amplify bias, causing real harm; recognizing and addressing it is part of the job
C) Is only a legal issue
D) Cannot be measured

**94.** Data privacy in ML:
A) Is not the engineer's concern
B) Is a real responsibility — training data and model inputs/outputs can contain personal data that must be protected and handled per regulation
C) Is the legal team's job only
D) Is irrelevant

**95.** A model making automated decisions about people:
A) Needs no special care
B) Warrants extra care about fairness, errors, transparency, and recourse — automated decisions at scale can cause systematic harm
C) Is always safe
D) Is the PM's concern only

**96.** Copy-pasting model or pipeline code you do not understand:
A) Is fine if it runs
B) Is risky — you cannot verify correctness, and a subtle error (like leakage) can silently produce a broken model that looks fine
C) Is required for speed
D) Is encouraged

**97.** Saying "I don't know, let me verify":
A) Damages credibility
B) Is the professional habit — ML is full of subtle traps, and confident guessing produces models that fail silently; verifying is the job
C) Is for juniors only
D) Should be hidden

**98.** Collaborating with data scientists and backend/platform engineers:
A) Is unnecessary
B) Is core — ML systems span data, models, and production infrastructure, and building them well requires working across these roles
C) Is adversarial
D) Is the manager's job

**99.** Documenting a model and pipeline:
A) Is a waste
B) Is essential — recording data sources, assumptions, training procedure, metrics, and limitations lets others operate, debug, and trust the system
C) Is the manager's job
D) Slows the work

**100.** The most reliable predictor of growth for a junior ML engineer is:
A) Knowing the most models
B) Solid engineering discipline plus real understanding of ML fundamentals and pitfalls (especially leakage and honest evaluation), curiosity, and the humility to verify — building things that actually work and keep working
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
