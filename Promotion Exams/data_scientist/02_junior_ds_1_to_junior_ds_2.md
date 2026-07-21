# Promotion Exam: Junior Data Scientist 1 → Junior Data Scientist 2

**Track:** Data Scientist (Specialist — statistics / experimentation / modeling / analysis)
**Format:** 100 multiple-choice questions
**Time:** 135 minutes
**Passing score:** 89 / 100

**Scope.** A Junior Data Scientist 1 handles scoped analyses under supervision. A Junior Data Scientist 2 should own an analysis or a first predictive model end-to-end with light review — framing the question, preparing and validating data, applying appropriate statistical methods, building and honestly evaluating a model, designing a simple experiment, and communicating findings and their limits clearly. This exam deepens statistical inference and hypothesis testing, introduces supervised machine learning and honest model evaluation, covers experiment design and feature engineering, and tests the rigor and communication a Junior 2 must demonstrate.

---

## Section A — Framing and Owning an Analysis (Q1–Q12)

**1.** Given a business question, the first step is:
A) Pick a model
B) Translate it into a precise, answerable analytical question, and clarify the decision it will inform — vague questions produce useless analyses
C) Pull all the data
D) Choose a chart

**2.** A question like "does this feature help users?":
A) Is precise enough to analyze directly
B) Needs sharpening — help how, measured by what metric, for which users, over what period — before it can be answered rigorously
C) Cannot be analyzed
D) Is the PM's problem

**3.** Choosing a metric to measure an outcome:
A) Any available number works
B) Requires care — the metric must actually reflect the outcome you care about, or you will optimize the wrong thing (metric gaming, proxy failure)
C) Is the engineer's job
D) Does not matter

**4.** A proxy metric (a stand-in for what you really care about):
A) Is always equivalent to the true goal
B) Can diverge from the true goal — optimizing the proxy may not improve the real outcome, so proxies must be chosen and monitored carefully
C) Is never needed
D) Is always misleading

**5.** Scoping an analysis:
A) Analyze everything possible
B) Focus on what answers the question and informs the decision — unbounded analysis wastes time and buries the signal
C) Is the stakeholder's job
D) Is unnecessary

**6.** When the data cannot answer the question asked:
A) Force an answer anyway
B) Say so, explain why, and propose what data or method would be needed — an honest "we can't answer this yet" beats a fabricated conclusion
C) Pick the closest significant result
D) Blame the data team

**7.** Documenting assumptions in an analysis:
A) Is unnecessary
B) Is essential — every analysis rests on assumptions (about data, population, method), and making them explicit lets others judge validity
C) Is the manager's job
D) Weakens the result

**8.** A reproducible analysis pipeline:
A) Runs differently each time
B) Can be rerun from raw data to result deterministically — essential for trust, review, and updating the analysis later
C) Is unnecessary
D) Is only for production

**9.** Sanity-checking results:
A) Is distrust of your own work
B) Is professional rigor — cross-checking against known values, orders of magnitude, and independent methods catches errors before they mislead
C) Wastes time
D) Is the reviewer's job

**10.** A result that seems too good to be true:
A) Should be celebrated and shipped
B) Warrants extra scrutiny — it often signals a leak, an error, or a bias; surprising-in-your-favor results deserve the most checking
C) Is always correct
D) Should be hidden

**11.** Estimating effort for an analysis:
A) Promise the fastest
B) Account for data acquisition, cleaning, analysis, validation, and communication — cleaning alone is usually the largest part
C) Match the engineer's estimate
D) Refuse

**12.** The deliverable of an analysis:
A) A model file
B) A clear answer to the question with its evidence, uncertainty, and caveats, communicated so the decision-maker can act — not just numbers or code
C) A dashboard only
D) Raw output

---

## Section B — Statistical Inference and Hypothesis Testing (Q13–Q26)

**13.** A hypothesis test:
A) Proves a hypothesis true
B) Assesses whether observed data is consistent with a null hypothesis — it can provide evidence against the null, but it does not "prove" anything with certainty
C) Proves causation
D) Is guessing

**14.** The null hypothesis:
A) Is what you hope to show
B) Is typically the "no effect / no difference" default that you test against — you gather evidence to reject it, not to confirm your preferred alternative directly
C) Is always false
D) Is the alternative

**15.** Failing to reject the null hypothesis:
A) Proves the null is true
B) Means the data did not provide enough evidence against it — absence of evidence is not evidence of absence
C) Proves there is no effect
D) Means the test failed

**16.** A Type I error:
A) Missing a real effect
B) A false positive — rejecting a true null (concluding an effect exists when it does not)
C) A data error
D) A coding bug

**17.** A Type II error:
A) A false positive
B) A false negative — failing to detect a real effect that exists
C) A syntax error
D) A sampling method

**18.** Statistical power:
A) Is computing speed
B) Is the probability of detecting a real effect if it exists — low power means real effects are often missed, and underpowered studies are unreliable
C) Is the p-value
D) Is sample size only

**19.** The significance level (alpha, e.g., 0.05):
A) Is a law of nature
B) Is a chosen threshold for the acceptable false-positive rate — it is a convention, not a magic line, and 0.049 vs 0.051 is not a meaningful qualitative difference
C) Guarantees truth below it
D) Is the effect size

**20.** Effect size:
A) Is the same as the p-value
B) Measures the magnitude of an effect — crucial because a tiny, unimportant effect can be statistically significant with a large enough sample
C) Is irrelevant
D) Is always large if significant

**21.** A statistically significant result from a huge sample:
A) Is always practically important
B) May be practically trivial — with enough data, even negligible effects become significant, so effect size and practical relevance must be judged
C) Proves causation
D) Is always wrong

**22.** The multiple comparisons problem:
A) Does not exist
B) Is that testing many hypotheses inflates the chance of false positives — correction (e.g., adjusting thresholds) is needed when running many tests
C) Only affects small samples
D) Is solved by more tests

**23.** Choosing the right statistical test:
A) Any test works for any data
B) Depends on the data type, distribution, and question (e.g., comparing means vs proportions, paired vs unpaired) — using the wrong test gives invalid results
C) Is arbitrary
D) Is always a t-test

**24.** Checking a test's assumptions (normality, independence, equal variance):
A) Is unnecessary
B) Is required — statistical tests assume conditions, and violating them silently invalidates the results
C) Is only for published research
D) Is automatic

**25.** A confidence interval that includes zero (for a difference):
A) Proves there is no effect
B) Means the data is consistent with no effect — the effect is not statistically distinguishable from zero at that confidence level, though it does not prove zero
C) Is a computation error
D) Proves a large effect

**26.** Bayesian versus frequentist thinking (at a basic level):
A) Are the same
B) Are two frameworks for reasoning about uncertainty — frequentist centers on long-run frequencies and p-values; Bayesian updates prior beliefs with data into posterior probabilities; both are legitimate and answer slightly different questions
C) Bayesian is always wrong
D) Frequentist is obsolete

---

## Section C — Supervised Machine Learning Foundations (Q27–Q42)

**27.** Supervised learning:
A) Requires no data
B) Learns a mapping from input features to a known target (label) using labeled examples — for prediction on new data
C) Has no target variable
D) Is the same as clustering

**28.** Classification versus regression:
A) Are the same
B) Classification predicts a category (spam/not-spam); regression predicts a continuous value (price) — the task determines the models and metrics
C) Regression predicts categories
D) Classification predicts numbers

**29.** Features and a target:
A) Are the same thing
B) Features are the inputs used to predict; the target is what you are predicting — clearly separating them (and preventing leakage between them) is fundamental
C) The target is an input
D) Features are the output

**30.** Training data versus test data:
A) Should be the same
B) Must be separate — you train on one portion and evaluate on unseen data, because performance on data the model already saw overstates real performance
C) Test data trains the model
D) Are interchangeable

**31.** Evaluating a model on its training data:
A) Gives an honest performance estimate
B) Overstates performance — the model has seen that data; only performance on unseen data reflects how it will generalize
C) Is best practice
D) Is required

**32.** Overfitting:
A) Is when a model is too simple
B) Is when a model learns noise and quirks of the training data rather than the true pattern, performing well on training but poorly on new data
C) Is always good
D) Cannot be detected

**33.** Underfitting:
A) Is memorizing the data
B) Is when a model is too simple to capture the real pattern, performing poorly on both training and test data
C) Is always good
D) Is the same as overfitting

**34.** The bias-variance tradeoff:
A) Does not exist
B) Is the balance between a model too simple (high bias, underfits) and too complex (high variance, overfits) — the goal is a model that generalizes, not one extreme
C) Means maximize complexity
D) Means minimize data

**35.** Cross-validation:
A) Trains on all data at once
B) Repeatedly splits data into train/validation folds to estimate generalization performance more reliably than a single split
C) Is the same as testing on training data
D) Proves causation

**36.** Data leakage:
A) Improves a model honestly
B) Is when information unavailable at prediction time (or the target itself) leaks into the features/training — producing unrealistically good results that collapse in reality; a top cause of "too good" models
C) Is harmless
D) Only affects deep learning

**37.** A feature that is a proxy for the target (or derived from it):
A) Is the best feature
B) Is likely leakage — if a feature encodes the answer or future information, the model looks great in testing but fails in production; guard against it
C) Should always be used
D) Is impossible

**38.** Choosing a model's complexity:
A) Always the most complex
B) The simplest model that performs adequately is usually preferable — it generalizes better, is easier to understand, and is less prone to overfitting
C) Always the newest
D) Does not matter

**39.** A baseline model (e.g., predicting the majority class or the mean):
A) Is pointless
B) Is essential context — a fancy model that barely beats a trivial baseline may not be worth its complexity; always compare against a baseline
C) Is the final model
D) Is always best

**40.** Feature scaling/normalization:
A) Is never needed
B) Matters for some algorithms (those sensitive to feature magnitude) and not others — knowing when it is required is part of applying models correctly
C) Always improves every model
D) Is the same as cleaning

**41.** Categorical variables in a model:
A) Can always be fed as raw text
B) Usually need encoding (e.g., one-hot) into a numeric form the model can use, done carefully to avoid leakage and dimensionality problems
C) Should be deleted
D) Are the same as numbers

**42.** Interpreting model coefficients or feature importances:
A) Prove causation
B) Describe association within the model, not causation — a feature being predictive does not mean it causes the outcome; interpret with care
C) Are meaningless
D) Are the same as p-values

---

## Section D — Honest Model Evaluation (Q43–Q56)

**43.** Accuracy as a metric:
A) Is always the right metric
B) Can be misleading, especially with imbalanced classes — 99% accuracy is trivial if 99% of cases are one class; the metric must fit the problem
C) Is the only metric
D) Is never useful

**44.** Precision and recall:
A) Are the same
B) Precision is how many predicted positives are correct; recall is how many actual positives were caught — they trade off, and which matters depends on the cost of each error type
C) Are always equal
D) Are irrelevant

**45.** A model that predicts "no disease" for everyone in a rare-disease dataset:
A) Is excellent because accuracy is high
B) Is useless despite high accuracy — it catches zero real cases; this is why accuracy alone misleads on imbalanced data, and recall/precision matter
C) Is the goal
D) Cannot happen

**46.** The confusion matrix:
A) Is a modeling error
B) Breaks predictions into true/false positives and negatives — the foundation for computing precision, recall, and understanding what kinds of errors a model makes
C) Is a chart of features
D) Is irrelevant

**47.** Choosing an evaluation metric:
A) Always use accuracy
B) Should reflect the real costs of different errors in the specific problem — a fraud model and a movie recommender care about different things
C) Is arbitrary
D) Is the engineer's job

**48.** Evaluating a regression model:
A) Use accuracy
B) Use appropriate metrics (e.g., error magnitude like RMSE or MAE, and R²), understanding what each captures and hides
C) Use precision and recall
D) Is impossible

**49.** A single evaluation number without context:
A) Tells the whole story
B) Is insufficient — compare to a baseline, understand the error types, check across subgroups, and consider the real-world cost; one number hides much
C) Is the best practice
D) Proves the model works

**50.** Evaluating a model only on aggregate performance:
A) Is sufficient
B) Can hide that it performs badly for important subgroups — checking performance across segments reveals fairness and reliability issues aggregate metrics mask
C) Is always fair
D) Is impossible

**51.** A model that performs well in testing but poorly in production:
A) Is impossible
B) Often signals leakage, distribution shift, or a test set that did not reflect reality — a reason to evaluate honestly and monitor after deployment
C) Means the metric was wrong only
D) Is always the engineer's fault

**52.** Comparing two models:
A) Whichever has the higher single metric always wins
B) Requires fair comparison on the same held-out data, considering the metric that matters, the uncertainty in the estimates, and complexity/cost tradeoffs
C) Is impossible
D) Always favors the complex one

**53.** Reporting only the best result from many model runs:
A) Is honest
B) Is a form of selective reporting — trying many configurations and reporting only the best inflates apparent performance; the evaluation must be honest about the process
C) Is required
D) Has no downside

**54.** A model's performance estimate has uncertainty:
A) It is a single exact number
B) It is an estimate with variance — reporting it as if it were exact, or over-interpreting small differences between models, is false precision
C) Is always exact
D) Does not matter

**55.** Threshold selection for a classifier:
A) Is always 0.5
B) Should be chosen based on the costs of false positives vs false negatives in the actual application — the default is rarely optimal for the real problem
C) Does not affect results
D) Is the engineer's job

**56.** Interpretability of a model:
A) Never matters
B) Often matters — in many settings, understanding why a model predicts something is required (trust, debugging, fairness, regulation), sometimes over marginal accuracy
C) Is the same as accuracy
D) Only matters for simple models

---

## Section E — Experiment Design (Q57–Q68)

**57.** Designing an A/B test:
A) Just split traffic and look at the result
B) Requires defining the hypothesis and metric in advance, determining sample size (power), randomizing properly, and deciding the duration before peeking
C) Needs no planning
D) Is the engineer's job

**58.** Randomization unit:
A) Does not matter
B) Matters — randomizing by user vs session vs request affects validity and interference; the wrong unit can invalidate the experiment
C) Is always the request
D) Is the same in all tests

**59.** Determining sample size before an experiment:
A) Is unnecessary
B) Is a power analysis — ensuring the test can detect an effect of the size that matters; running underpowered tests wastes effort and misses real effects
C) Is done after seeing results
D) Should be as small as possible

**60.** Peeking at results and stopping when significant:
A) Is efficient
B) Inflates false positives unless using methods designed for sequential testing — fixed-horizon tests should run to their planned sample size
C) Has no effect
D) Is required

**61.** A metric that improves while the overall goal worsens:
A) Is a success
B) Signals a poorly chosen metric or a real tradeoff — guardrail metrics catch when a "win" on one metric harms the broader outcome
C) Is impossible
D) Should be ignored

**62.** Novelty and primacy effects in experiments:
A) Do not exist
B) Are real — users may react to a change simply because it is new (or resist because it is unfamiliar), which can distort short-term results; run long enough to see steady-state
C) Prove the change works
D) Only affect surveys

**63.** Network effects / interference between test groups:
A) Never happen
B) Can violate the assumption that groups are independent (e.g., social features, marketplaces) — requiring special designs, or standard A/B results mislead
C) Are always negligible
D) Are a coding bug

**64.** A test that shows no significant effect:
A) Was a waste
B) Is a real, useful result — learning that a change does not help (or does not hurt) prevents shipping something ineffective and is valuable information
C) Means run it again until significant
D) Should be hidden

**65.** Segmenting experiment results by many subgroups after the fact:
A) Is rigorous
B) Risks false positives (multiple comparisons) — post-hoc subgroup findings are hypotheses to confirm, not conclusions, unless pre-specified
C) Proves the effect
D) Has no statistical cost

**66.** When a true experiment is not possible:
A) Claim causation anyway
B) Use quasi-experimental or observational methods with appropriate caution, being explicit about the weaker causal claims they support
C) Give up entirely
D) Pretend you ran an experiment

**67.** External validity of an experiment:
A) Is guaranteed
B) Is the question of whether results generalize beyond the tested context, time, and population — a result true in one setting may not hold in another
C) Is the same as significance
D) Never matters

**68.** Documenting an experiment:
A) Is unnecessary
B) Records the hypothesis, design, metric, analysis plan, and results — so it is trustworthy, reviewable, and not retrofitted after seeing the data
C) Is the manager's job
D) Weakens the result

---

## Section F — Feature Engineering and Data Preparation (Q69–Q78)

**69.** Feature engineering:
A) Is irrelevant with modern models
B) Is often the highest-leverage work — creating informative features from raw data frequently improves models more than swapping algorithms
C) Is the same as cleaning
D) Is the engineer's job

**70.** Domain knowledge in feature engineering:
A) Is unnecessary
B) Is crucial — understanding the problem area suggests which derived features carry signal, which no algorithm can invent on its own
C) Slows the work
D) Is the stakeholder's job

**71.** A feature computed using future information (relative to prediction time):
A) Is the best feature
B) Is leakage — it will not be available at prediction time in reality, so the model's test performance is fake; features must respect the time of prediction
C) Is fine
D) Improves generalization

**72.** Handling missing values in features:
A) Always delete rows with any missing value
B) Requires judgment — why the value is missing informs whether to impute, flag, or drop, and naive handling introduces bias
C) Always fill with zero
D) Is automatic

**73.** Encoding a high-cardinality categorical feature (e.g., thousands of categories):
A) One-hot encode all of them blindly
B) Requires care — naive one-hot creates huge sparse dimensionality; techniques exist, but must avoid leakage (e.g., target encoding done wrong leaks)
C) Delete the feature always
D) Is impossible

**74.** Outliers in features:
A) Always remove them
B) Investigate them — they may be errors to fix, or genuine extreme cases that matter; blind removal can discard important signal or hide data problems
C) Always keep as-is
D) Never occur

**75.** Scaling features for distance- or gradient-based models:
A) Is never needed
B) Is often required so that features on larger scales do not dominate — but the scaling must be fit on training data only, to avoid leakage
C) Should use test data statistics
D) Is the same as encoding

**76.** Fitting a preprocessing step (like scaling) on the full dataset before splitting:
A) Is correct
B) Leaks test information into training — preprocessing parameters must be learned from training data only, then applied to test data
C) Has no effect
D) Is best practice

**77.** Creating too many features relative to the data:
A) Always helps
B) Risks overfitting and the curse of dimensionality — more features are not always better, especially with limited data
C) Is required
D) Has no downside

**78.** Feature selection:
A) Always use every feature
B) Removing irrelevant or redundant features can improve generalization, interpretability, and efficiency — but selection done using the test set leaks information
C) Is arbitrary
D) Hurts every model

---

## Section G — Communication and Collaboration (Q79–Q90)

**79.** Communicating an analysis to decision-makers:
A) Show all the code and math
B) Lead with the answer and its implication, support it with evidence, and state the uncertainty and caveats clearly — tailored to what the audience needs to decide
C) Hide the uncertainty
D) Only show the model

**80.** A stakeholder wants a simple yes/no from an uncertain analysis:
A) Give a false certainty
B) Give the clearest actionable answer you honestly can, with the key uncertainty stated — oversimplifying to false certainty misleads the decision
C) Refuse to answer
D) Overwhelm them with caveats only

**81.** Presenting uncertainty to a non-technical audience:
A) Omit it — it confuses them
B) Translate it into terms they can act on ("we are fairly confident it helps, but the size is uncertain") — hiding uncertainty leads to overconfident decisions
C) Show only p-values
D) Is impossible

**82.** A visualization for a business audience:
A) Maximize sophistication
B) Communicate the key insight clearly and honestly, avoiding misleading scales or clutter — clarity and honesty over impressiveness
C) Include every data point
D) Use the fanciest chart

**83.** When results are inconvenient for a stakeholder:
A) Adjust them to please
B) Report them honestly and diplomatically — the analyst's value depends on being trusted to tell the truth, especially when it is unwelcome
C) Bury them
D) Refuse to share

**84.** Collaborating with data engineers:
A) Is unnecessary
B) Is valuable — they own the pipelines and data quality the analysis depends on; a good relationship improves data access and reliability
C) Is adversarial
D) Is the manager's job

**85.** Collaborating with domain experts:
A) Is a waste of time
B) Is essential — they provide the context that prevents naive misinterpretation of data and suggests what matters
C) Undermines the analyst
D) Is unnecessary

**86.** A PM asks for an analysis to justify a decision already made:
A) Provide the justification
B) Clarify the honest role of analysis — to inform, not to rubber-stamp — and present what the data actually shows, even if it complicates the decision
C) Fabricate support
D) Refuse all such requests rudely

**87.** Reproducible, well-documented analysis for handoff:
A) Is unnecessary
B) Lets others verify, reuse, and build on the work — a result no one else can reproduce or understand has limited value
C) Slows the work pointlessly
D) Is the engineer's job

**88.** Explaining a model's limitations to those using it:
A) Is unnecessary
B) Is a responsibility — users must know where a model is unreliable, what it assumes, and how it can fail, or they will misuse it
C) Undermines trust harmfully
D) Is the engineer's job

**89.** Receiving critique of your analysis:
A) Defend every choice
B) Engage openly — peer review catches errors and improves rigor, and separating ego from the work is a professional skill
C) Reject it
D) Accept blindly

**90.** When your analysis is wrong and a decision was based on it:
A) Hide it
B) Disclose and correct it promptly — the cost of a wrong decision compounds, and honesty about errors is fundamental to the role's trust
C) Blame the data
D) Ignore it

---

## Section H — Rigor, Ethics, and Growth (Q91–Q100)

**91.** Intellectual honesty in data science:
A) Is optional
B) Is the foundation — being honest about uncertainty, limitations, and inconvenient results is what makes an analyst trustworthy and valuable
C) Slows the work
D) Is the manager's concern

**92.** Bias in data and its consequences:
A) Is harmless
B) Can produce unfair or harmful conclusions and models — biased data yields biased results, and recognizing and addressing this is part of responsible practice
C) Cannot be detected
D) Is only a legal issue

**93.** A model that performs differently across demographic groups:
A) Is fine if overall accuracy is high
B) May be a fairness problem with real harm — evaluating across groups and considering fairness is part of responsible modeling, not an afterthought
C) Is always acceptable
D) Cannot happen

**94.** Data privacy:
A) Is not the analyst's concern
B) Is a real responsibility — protecting personal data, respecting regulations, and preventing re-identification are part of the job
C) Is only the legal team's job
D) Is irrelevant

**95.** Chasing significance (trying methods until something is significant):
A) Is thorough
B) Is p-hacking — a form of self-deception that produces false findings; pre-specifying analysis and being honest about exploration guards against it
C) Is required
D) Is rigorous

**96.** A finding based on a spurious correlation:
A) Is a real insight
B) Is a trap — correlations arise by chance and through confounders, and presenting them as meaningful (especially as causal) misleads
C) Proves causation
D) Should always be reported

**97.** Distinguishing exploratory findings from confirmed results:
A) Is unnecessary
B) Is essential honesty — exploratory findings are hypotheses needing confirmation, and presenting them as established results overstates certainty
C) Makes no difference
D) Is the reviewer's job

**98.** When you do not understand a method well enough to use it correctly:
A) Use it anyway
B) Learn it properly first — applying a method you do not understand risks invalid results you cannot detect or defend
C) Guess at the parameters
D) Hide the uncertainty

**99.** Keeping current with methods:
A) Is unnecessary once trained
B) Matters — the field evolves, but so does understanding of pitfalls; staying current includes learning both new techniques and their failure modes
C) Is for seniors only
D) Wastes time

**100.** The most reliable predictor of growth past Junior 2 is:
A) Knowing the most models
B) Deepening statistical rigor and honesty while broadening into modeling, experimentation, and clear communication — being reliably right and trustworthy, not just technically fancy
C) Producing the most analyses
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
