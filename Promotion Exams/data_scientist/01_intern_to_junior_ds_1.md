# Promotion Exam: Intern → Junior Data Scientist 1

**Track:** Data Scientist (Specialist — statistics / experimentation / modeling / analysis)
**Format:** 100 multiple-choice questions
**Time:** 120 minutes
**Passing score:** 89 / 100

**Scope.** This exam evaluates whether an intern is ready to be hired as a Junior Data Scientist 1. Data science is the discipline of turning data into reliable understanding and better decisions — which means the foundation is statistical reasoning and scientific honesty, not just tools. This exam blends that foundation (probability, statistics, causal caution, experiment basics) with the practical craft (SQL, data wrangling, exploratory analysis, programming, visualization) and the analytical mindset. The bar is: "can be trusted with a scoped analysis under supervision, will not draw unsupported conclusions, and communicates findings honestly."

**A note on the discipline.** The most dangerous data scientist is one who is confidently wrong — who mistakes correlation for causation, p-hacks their way to a "significant" result, or presents a misleading chart. This track weights intellectual honesty and statistical rigor as heavily as technical skill, because a wrong analysis that drives a bad decision is worse than no analysis at all.

---

## Section A — The Analytical Mindset (Q1–Q12)

**1.** The purpose of data science is:
A) To produce impressive-looking models
B) To turn data into reliable understanding that improves decisions — the value is in better decisions, not in the sophistication of the method
C) To use the most advanced algorithm available
D) To confirm what stakeholders already believe

**2.** Before starting an analysis, the most important step is:
A) Choosing a model
B) Understanding the question being asked and the decision it will inform — an analysis answering the wrong question is wasted, however well-executed
C) Loading the data
D) Picking a visualization

**3.** Correlation and causation:
A) Are the same thing
B) Are different — two things moving together does not mean one causes the other; confusing them is among the most common and costly errors in data work
C) Correlation proves causation
D) Are unrelated concepts

**4.** A stakeholder asks you to "find data that supports this decision":
A) Comply — give them what they want
B) Push back gently — the honest job is to find what the data actually says, not to cherry-pick support for a predetermined conclusion
C) Fabricate if needed
D) Only show supporting data

**5.** An analysis that produces an inconvenient or surprising result:
A) Should be adjusted until it agrees with expectations
B) Should be checked for errors, and if it holds, reported honestly — the value of analysis is precisely in challenging assumptions
C) Should be hidden
D) Is always wrong

**6.** "The data says X" is a claim that:
A) Is automatically true
B) Requires scrutiny — data can be biased, mismeasured, or misinterpreted, and a good analyst is skeptical of their own conclusions
C) Cannot be questioned
D) Is the stakeholder's responsibility

**7.** A model or analysis you do not understand:
A) Should be used if the numbers look good
B) Should not be trusted or shipped until understood — you cannot vouch for or debug what you do not understand
C) Is fine if a library produced it
D) Is the senior's problem

**8.** The biggest risk in data science is usually:
A) Slow code
B) Being confidently wrong — a flawed analysis presented convincingly can drive a costly bad decision; rigor and honesty guard against this
C) Using an old algorithm
D) Small datasets

**9.** Reproducibility of an analysis:
A) Is unnecessary
B) Is essential — others (and future you) must be able to rerun and verify the work; a result no one can reproduce is not trustworthy
C) Slows the work pointlessly
D) Is only for published research

**10.** When you are uncertain about a result:
A) State it as certain anyway
B) Communicate the uncertainty honestly — quantifying and disclosing uncertainty is part of the job, not a weakness
C) Hide the uncertainty
D) Guess confidently

**11.** Domain knowledge (understanding the business/problem area):
A) Is irrelevant to data science
B) Is essential — without understanding what the data represents and how it is used, an analyst misinterprets it and answers questions naively
C) Is the stakeholder's job only
D) Slows analysis

**12.** The most valuable trait for a junior data scientist is:
A) Knowing the most algorithms
B) Rigorous, skeptical, honest thinking about data and its limits — combined with curiosity and the humility to check one's own work
C) Producing results fastest
D) Never being questioned

---

## Section B — Probability Fundamentals (Q13–Q26)

**13.** A probability:
A) Can exceed 1
B) Is a number between 0 and 1 expressing how likely an event is — 0 impossible, 1 certain
C) Is always a percentage over 100
D) Is the same as a count

**14.** Independent events:
A) Always affect each other
B) Are events where one occurring does not change the probability of the other — and assuming independence when it does not hold is a common error
C) Are the same event
D) Cannot both occur

**15.** The probability of two independent events both occurring:
A) Is their sum
B) Is the product of their individual probabilities
C) Is always 0.5
D) Cannot be computed

**16.** Conditional probability P(A|B):
A) Is the same as P(A)
B) Is the probability of A given that B has occurred — often very different from P(A), and confusing the two causes serious mistakes
C) Is always larger than P(A)
D) Is meaningless

**17.** Confusing P(A|B) with P(B|A):
A) Is harmless
B) Is a classic, consequential error — e.g., P(positive test | disease) is not P(disease | positive test); they differ, sometimes dramatically
C) They are always equal
D) Only matters in medicine

**18.** A base rate:
A) Is irrelevant to probability
B) Is the underlying prevalence of something in a population — ignoring it (base rate neglect) leads to badly wrong conclusions, especially with rare events
C) Is the highest probability
D) Is always 0.5

**19.** Expected value:
A) Is the most likely single outcome
B) Is the probability-weighted average of outcomes — what you would expect on average over many repetitions
C) Is the maximum outcome
D) Is the minimum outcome

**20.** A random variable:
A) Is a fixed constant
B) Is a variable whose value is a numerical outcome of a random process — the basic object of probabilistic reasoning
C) Is always an integer
D) Is a bug

**21.** A probability distribution:
A) Is a single number
B) Describes how probability is spread across the possible values of a random variable
C) Is always uniform
D) Is a database table

**22.** The normal (Gaussian) distribution:
A) Describes all data
B) Is a common bell-shaped distribution that many natural phenomena approximate — but assuming normality when data is not normal is a frequent mistake
C) Has no mean
D) Is always correct to assume

**23.** The law of large numbers:
A) Says small samples are reliable
B) Says that as sample size grows, the sample average tends toward the true average — which is why larger samples give more reliable estimates
C) Says data is always normal
D) Is about big data tools

**24.** A rare event with a very low probability:
A) Will never happen
B) Can and does happen, especially across many trials — "unlikely" is not "impossible," and low-probability events at scale are common
C) Is impossible
D) Has probability 0

**25.** The gambler's fallacy:
A) Is a valid strategy
B) Is the mistaken belief that past independent outcomes change future ones (e.g., "red is due" after many blacks) — independent events have no memory
C) Is a real statistical law
D) Applies to dependent events only

**26.** Simpson's paradox:
A) Does not exist
B) Is when a trend in aggregated data reverses when the data is split into groups — a warning that aggregation can mislead, and that confounders matter
C) Is a sampling method
D) Is a type of chart

---

## Section C — Statistics Fundamentals (Q27–Q42)

**27.** The mean, median, and mode:
A) Are always equal
B) Are different measures of center — the mean is sensitive to outliers, the median is robust to them, and which to use depends on the data
C) Are the same for all data
D) Are all outliers

**28.** For skewed data with outliers, the better measure of "typical" is often:
A) The mean, always
B) The median, because it is not distorted by extreme values the way the mean is
C) The maximum
D) The mode always

**29.** Standard deviation:
A) Is the average value
B) Measures how spread out the data is around the mean — a small SD means values cluster near the mean, a large one means they are dispersed
C) Is the count of values
D) Is always zero

**30.** A sample versus a population:
A) Are the same
B) A population is the whole group of interest; a sample is a subset you actually measure and use to infer about the population
C) A sample is larger
D) Populations are always small

**31.** Sampling bias:
A) Does not affect results
B) Occurs when the sample is not representative of the population, systematically skewing conclusions — a critical threat to any analysis
C) Is fixed by a larger biased sample
D) Only affects surveys

**32.** A larger sample size:
A) Fixes bias
B) Reduces random sampling error (narrower estimates) but does not fix systematic bias — a big biased sample is still biased
C) Is always worse
D) Guarantees correctness

**33.** A confidence interval:
A) Is the single true value
B) Is a range that, under repeated sampling, would contain the true parameter a stated proportion of the time — expressing the uncertainty of an estimate
C) Is always 95% wide
D) Means the result is certain

**34.** A point estimate reported without any uncertainty:
A) Is complete and honest
B) Is incomplete — an estimate without a confidence interval or margin of error hides how uncertain it is, which can mislead decisions
C) Is best practice
D) Is more precise

**35.** A p-value:
A) Is the probability the hypothesis is true
B) Is the probability of observing data at least as extreme as yours if the null hypothesis were true — commonly misinterpreted, so understanding it precisely matters
C) Is the effect size
D) Proves causation

**36.** A common misinterpretation of a p-value is:
A) That it is a probability
B) Treating it as the probability that the null hypothesis is true, or as a measure of effect size — it is neither
C) That smaller is smaller
D) That it relates to the null hypothesis

**37.** Statistical significance versus practical significance:
A) Are the same
B) A result can be statistically significant but too small to matter in practice (especially with huge samples) — both must be considered
C) Practical significance is meaningless
D) Statistical significance guarantees importance

**38.** Outliers:
A) Should always be deleted
B) Should be investigated, not automatically removed — they may be errors, or they may be the most important signal in the data
C) Should always be kept as-is
D) Never occur

**39.** Missing data:
A) Can always be ignored
B) Requires thought — why it is missing affects how to handle it, and naive deletion or filling can bias results
C) Is always random
D) Should be filled with zero always

**40.** Correlation coefficient (e.g., Pearson's r):
A) Measures causation
B) Measures the strength and direction of a linear relationship between two variables — but a low value can still hide a strong non-linear relationship
C) Is always between 0 and 100
D) Proves one variable causes the other

**41.** A relationship that is strong but non-linear:
A) Will always show a high linear correlation
B) May show a low linear correlation despite a strong relationship — which is why plotting the data matters, not just computing a correlation number
C) Cannot exist
D) Is a measurement error

**42.** Reporting a statistic to many decimal places from a small, noisy sample:
A) Signals precision and rigor
B) Is false precision — the underlying uncertainty does not justify the decimals, and it misleads readers about how exact the estimate is
C) Is required
D) Improves accuracy

---

## Section D — Experiments and Causal Caution (Q43–Q54)

**43.** A randomized controlled experiment (A/B test):
A) Cannot establish causation
B) Is the gold standard for establishing causation, because randomization balances confounders between groups on average
C) Is the same as observational analysis
D) Is always unethical

**44.** Randomization in an experiment:
A) Is optional decoration
B) Is what makes causal inference valid — randomly assigning subjects balances known and unknown confounders across groups
C) Means picking convenient subjects
D) Biases the result

**45.** A confounder (confounding variable):
A) Is irrelevant
B) Is a variable that influences both the supposed cause and the effect, creating a misleading association — the central threat to observational causal claims
C) Is the outcome
D) Is the treatment

**46.** Concluding causation from observational (non-experimental) data:
A) Is always valid
B) Requires great caution — without randomization, confounders can produce associations that are not causal; strong causal claims need strong justification
C) Is the same as an experiment
D) Is never a problem

**47.** A control group:
A) Is unnecessary
B) Provides the counterfactual — what would have happened without the treatment — so the treatment's effect can be isolated
C) Receives the treatment
D) Biases the experiment

**48.** p-hacking:
A) Is a valid technique
B) Is manipulating analysis (trying many tests, selectively reporting) until something appears significant — a form of self-deception that produces false findings
C) Improves rigor
D) Is required for significance

**49.** Testing many hypotheses and reporting only the significant ones:
A) Is honest
B) Is the multiple-comparisons problem — with enough tests, some will appear significant by chance; this must be accounted for, not exploited
C) Has no effect on validity
D) Is best practice

**50.** HARKing (Hypothesizing After the Results are Known):
A) Is good science
B) Is presenting a hypothesis invented after seeing the data as if it were predicted in advance — it inflates false positives and is a form of dishonesty
C) Is required
D) Has no downside

**51.** Sample size for an experiment:
A) Does not matter
B) Should be determined in advance (power analysis) — too small and real effects are missed; peeking and stopping when significant inflates false positives
C) Should be as small as possible
D) Is chosen after seeing results

**52.** Stopping an experiment early because it just turned significant:
A) Is efficient and fine
B) Inflates false-positive rates if not properly accounted for — early peeking without correction is a known way to get spurious "significant" results
C) Has no statistical effect
D) Is required

**53.** A result that fails to replicate:
A) Was still definitely true
B) Casts doubt on the original finding — replication is how science separates real effects from flukes, and non-replication is important information
C) Is irrelevant
D) Proves the replication was wrong

**54.** The difference between exploratory and confirmatory analysis:
A) There is none
B) Exploratory analysis generates hypotheses (findings there must be confirmed later); confirmatory analysis tests a pre-specified hypothesis — treating exploratory findings as confirmed is a core error
C) Confirmatory comes first
D) Both prove causation equally

---

## Section E — SQL and Data Wrangling (Q55–Q68)

**55.** SQL for a data scientist:
A) Is unnecessary
B) Is a core everyday skill — most data lives in databases, and SQL is how you extract and shape it for analysis
C) Is only for engineers
D) Is obsolete

**56.** A SELECT with WHERE:
A) Deletes rows
B) Retrieves rows matching a condition — the basic tool for pulling the data you need
C) Modifies the schema
D) Is the same as GROUP BY

**57.** GROUP BY with an aggregate (COUNT, SUM, AVG):
A) Returns every row
B) Groups rows and computes an aggregate per group — essential for summarizing data
C) Deletes duplicates
D) Sorts the data

**58.** A JOIN:
A) Deletes a table
B) Combines rows from multiple tables based on a related key — fundamental to working with relational data
C) Is the same as UNION
D) Sorts rows

**59.** An INNER JOIN versus a LEFT JOIN:
A) Are identical
B) INNER returns only matching rows from both tables; LEFT returns all rows from the left table plus matches — choosing wrong silently drops or keeps data
C) LEFT drops all unmatched rows
D) INNER keeps all rows

**60.** A JOIN that unexpectedly multiplies rows:
A) Is impossible
B) Happens when the join key is not unique on one side (a fan-out) — a common cause of inflated counts and wrong aggregates; always sanity-check row counts
C) Is always correct
D) Only happens with LEFT JOIN

**61.** NULL in SQL:
A) Equals zero
B) Represents missing/unknown, and behaves specially (e.g., `NULL = NULL` is not true) — mishandling NULLs is a frequent source of silent errors
C) Equals an empty string
D) Is always ignored

**62.** COUNT(*) versus COUNT(column):
A) Are always equal
B) COUNT(*) counts all rows; COUNT(column) counts non-NULL values in that column — the difference matters when NULLs are present
C) COUNT(column) counts NULLs
D) Are unrelated

**63.** Data cleaning:
A) Is a minor step
B) Is typically the largest part of real analysis — handling missing values, duplicates, inconsistent formats, and errors before any modeling
C) Is unnecessary with good data
D) Is the engineer's job

**64.** Duplicate rows in a dataset:
A) Never affect results
B) Can inflate counts and bias statistics if not detected — checking for and understanding duplicates is part of data cleaning
C) Should always be kept
D) Are always intentional

**65.** Inconsistent categorical values (e.g., "NY", "New York", "new york"):
A) Are automatically merged
B) Must be reconciled during cleaning, or they fragment groups and distort analysis
C) Are the same to a computer
D) Never occur

**66.** Units and scale inconsistencies in data:
A) Never matter
B) Can silently corrupt analysis (mixing dollars and cents, or seconds and milliseconds) — verifying units is part of understanding the data
C) Are automatically handled
D) Are the engineer's problem

**67.** A dataset's provenance (where it came from, how it was collected):
A) Is irrelevant
B) Is essential context — how data was collected shapes its biases and what conclusions are valid; analyzing data blind to its origin is risky
C) Is only for auditors
D) Never affects analysis

**68.** Verifying data before trusting it:
A) Is unnecessary if it came from a database
B) Is essential — checking ranges, counts, distributions, and sanity of values catches errors that would otherwise corrupt the analysis
C) Slows the work pointlessly
D) Is the engineer's job

---

## Section F — Exploratory Analysis and Visualization (Q69–Q80)

**69.** Exploratory data analysis (EDA):
A) Is a waste of time
B) Is the essential first look — summarizing and visualizing data to understand its shape, spot errors, and form hypotheses before modeling
C) Replaces modeling
D) Proves causation

**70.** Plotting data before analyzing it numerically:
A) Is unnecessary
B) Reveals patterns, outliers, and relationships that summary statistics hide (as Anscombe's quartet famously shows) — always look at the data
C) Is only for presentations
D) Biases the analysis

**71.** A chart's primary purpose:
A) To look impressive
B) To communicate a finding clearly and honestly — the right chart makes the insight obvious; the wrong or misleading one distorts it
C) To include as much as possible
D) To use every color

**72.** A truncated y-axis (not starting at zero) on a bar chart:
A) Is always fine
B) Can exaggerate differences misleadingly — a common way charts deceive, deliberately or accidentally; axis choices carry honesty implications
C) Improves clarity always
D) Has no effect on perception

**73.** Choosing a chart type:
A) Any chart works for any data
B) Depends on what you are showing — trends over time, comparisons, distributions, and relationships each suit different chart types
C) Should always be a pie chart
D) Does not matter

**74.** A misleading visualization:
A) Is acceptable if it makes the point
B) Is a form of dishonesty — distorting scale, cherry-picking ranges, or choosing a chart that misrepresents the data violates the analyst's duty to truth
C) Is required for impact
D) Is impossible to make

**75.** Showing uncertainty in a visualization (error bars, intervals):
A) Clutters the chart pointlessly
B) Is often important — presenting estimates without any indication of uncertainty can imply false precision
C) Is never appropriate
D) Proves the result

**76.** A summary statistic without looking at the distribution:
A) Tells the whole story
B) Can hide critical structure — the same mean can arise from wildly different distributions; look at the shape, not just the number
C) Is always sufficient
D) Is more rigorous

**77.** Aggregating data can:
A) Only clarify
B) Both clarify and hide — aggregation reveals trends but can mask subgroup differences (recall Simpson's paradox); consider disaggregating
C) Never mislead
D) Always mislead

**78.** Presenting a finding to a non-technical audience:
A) Use maximum jargon and detail
B) Communicate the insight and its implication clearly, with honest caveats, in terms the audience can act on — clarity without oversimplifying to the point of being wrong
C) Show all the code
D) Hide the uncertainty

**79.** A correlation found during exploration:
A) Is a confirmed finding to report as causal
B) Is a hypothesis to investigate further, not a conclusion — exploratory correlations are starting points, and calling them causal is a core error
C) Proves causation
D) Should be ignored

**80.** The story a chart tells:
A) Does not matter as long as data is accurate
B) Should match what the data actually supports — framing and selection can mislead even with accurate numbers, so honest framing is part of the craft
C) Should always favor the stakeholder's hope
D) Is the designer's job

---

## Section G — Programming and Tools (Q81–Q90)

**81.** A programming language for data science (Python or R):
A) Is unnecessary — use spreadsheets only
B) Is a core skill — for data manipulation, analysis, visualization, and modeling; spreadsheets do not scale or reproduce reliably
C) Is only for engineers
D) Is obsolete

**82.** A dataframe (e.g., in pandas):
A) Is a database
B) Is a table-like structure for manipulating data in memory — the everyday workhorse of analysis in code
C) Is a chart
D) Is a model

**83.** Vectorized operations versus explicit loops (in libraries like pandas/NumPy):
A) Loops are always faster
B) Vectorized operations are usually far faster and cleaner for data work — using slow explicit loops where a vectorized operation exists is a common inefficiency
C) Are identical
D) Vectorization is deprecated

**84.** A reproducible analysis notebook:
A) Runs differently every time
B) Produces the same results when rerun from a clean state — reproducibility requires managing randomness (seeds), data versions, and dependencies
C) Cannot exist
D) Is unnecessary

**85.** A notebook that only runs if cells are executed in a specific hidden order:
A) Is fine
B) Is a reproducibility trap — hidden state makes results unreliable and unrepeatable; a clean top-to-bottom run should reproduce the work
C) Is best practice
D) Is more efficient

**86.** Setting a random seed:
A) Is pointless
B) Makes randomized operations (sampling, splitting, some models) reproducible — so others get the same result; omitting it undermines reproducibility
C) Biases the analysis
D) Slows the code

**87.** Version control (Git) for analysis code:
A) Is unnecessary
B) Is valuable — tracking changes, collaborating, and being able to reproduce a past analysis all depend on it; analysis is code
C) Is only for engineers
D) Slows analysis

**88.** Hardcoding a data snapshot's path or a magic number:
A) Is fine
B) Undermines reproducibility and clarity — parameterize inputs and document assumptions so the analysis can be rerun and understood
C) Is best practice
D) Is required

**89.** Copy-pasting analysis code you do not understand:
A) Is fine if the output looks right
B) Is risky — you cannot verify it does what you think, and a subtle error can silently corrupt conclusions
C) Is required for speed
D) Is encouraged

**90.** Documenting an analysis:
A) Is a waste
B) Is essential — recording the question, data sources, assumptions, methods, and caveats lets others (and future you) understand and trust the work
C) Is the manager's job
D) Slows the work

---

## Section H — Ethics, Communication, and Habits (Q91–Q100)

**91.** Data privacy and sensitive data:
A) Is not the analyst's concern
B) Is a real responsibility — handling personal data carefully, respecting privacy and regulations, and not exposing individuals is part of the job
C) Is only the legal team's job
D) Is irrelevant to analysis

**92.** Analyzing data that could identify individuals:
A) Is always fine
B) Requires care — anonymization, aggregation, and access controls protect people, and re-identification is a real risk to guard against
C) Has no ethical dimension
D) Is the engineer's job

**93.** A biased dataset (e.g., unrepresentative of the population):
A) Produces fair conclusions
B) Produces biased conclusions — models and analyses inherit the biases of their data, which can cause real harm, so recognizing and addressing bias matters
C) Is always fine
D) Cannot be detected

**94.** Presenting only the results that support a desired narrative:
A) Is persuasive and fine
B) Is a form of dishonesty — selective reporting misleads decisions; the honest job is to present what the data actually shows, including inconvenient findings
C) Is required
D) Has no consequences

**95.** When your analysis has an error you discover after presenting it:
A) Hide it
B) Correct it and communicate the correction promptly — an undisclosed error that drives decisions is far worse than the embarrassment of admitting it
C) Blame the data
D) Ignore it

**96.** Saying "the data does not clearly answer that":
A) Is a failure
B) Is often the honest and correct answer — forcing a confident conclusion the data cannot support is worse than acknowledging the limit
C) Should never be said
D) Means you failed

**97.** Overfitting a narrative to noise:
A) Is insightful
B) Is a trap — finding "patterns" in random noise and presenting them as real is a common error; distinguishing signal from noise is central to the craft
C) Is required
D) Is impossible

**98.** Understanding how a result will be used:
A) Is not the analyst's concern
B) Shapes how carefully it must be done and communicated — a result driving a major decision demands more rigor and clearer caveats than an exploratory glance
C) Is the stakeholder's job only
D) Never matters

**99.** When you do not know a method or concept:
A) Pretend you do
B) Say so and learn it — data science is vast, and confident bluffing about methods is dangerous; admitting and closing gaps is the professional habit
C) Guess and present confidently
D) Hide it

**100.** The most reliable predictor of growth for a junior data scientist is:
A) Knowing the most algorithms
B) Rigorous statistical reasoning, intellectual honesty about uncertainty and limits, curiosity, and clear communication — being reliably right and honest matters more than being fancy
C) Producing the most models
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
