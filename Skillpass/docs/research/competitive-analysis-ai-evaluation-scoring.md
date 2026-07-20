# Competitive Analysis: AI Evaluation Scoring System

**Date:** 2026-07-08
**Author:** Product Research Analyst
**Source:** `docs/specs/2026-07-07-ai-evaluation-scoring-design.md`

---

## Competitors & Alternatives

| Name | Approach | Key Differentiator | Pricing | Strengths | Weaknesses |
|------|----------|-------------------|---------|-----------|------------|
| **LinkedIn Skill Assessments** | Timed 15-question adaptive quiz per skill, scored on 70th-percentile pass threshold | Massive user base (1B+), integrated into recruiter search, "verified skill" badge | Free to users; bundled in Talent Solutions for employers | Brand trust, scale, anti-cheating via adaptive testing, ~30% higher recruiter callback rate | Only ~80 skills covered, tech-heavy catalog, binary pass/fail, quiz anxiety, EEOC not validated for sole-criterion use |
| **LinkedIn Endorsements** | Peer-to-peer skill validation with 1-click | Social proof signal, boosts recruiter search ranking ~5-10% | Free | Easy, wide adoption, improves search visibility | Severely eroded trust — "participation trophy" system, often meaningless/reciprocal, no verification layer |
| **Indeed Assessments** | **Discontinued Oct 2024** | — | — | — | Removed due to "confusion and extra steps" for both employers and candidates. Now uses Smart Screening (resume-based fit scoring) |
| **HackerRank / Codility** | Timed coding challenges with automated test-case scoring | Deep technical assessment for engineering hiring | $100-$300/seat/yr enterprise | Strong anti-cheating, large question banks, ATS integrations | Only coding roles, algorithm-heavy vs. real-world, candidate anxiety, 45-90 min assessments |
| **TestGorilla** | Multi-measure test library (400+ tests): technical, cognitive, personality | Breadth across role types | Free tier + $75-200/mo | Broad coverage, easy for non-technical hiring managers | Shallow technical depth, limited coding environment, 0.38-0.42 predictive validity |
| **Vervoe / Pymetrics** | AI-scored work simulations / gamified neuroscience assessments | Behavioral + cognitive measurement over resume parsing | $228/mo - Enterprise | Novel signal types, job-relevant simulations | Smaller validation datasets, opaque AI scoring (0.39 predictive validity) |
| **Criteria Corp** | Rubric-driven competency testing with structured scorecards | Strong predictive validity (0.52), bias audit published | ~$20/assessment | Scientifically validated tests, decision-ready outputs | Limited to predefined formats, expensive at volume |

### Market Context: How the "Count" Fits In

The "Count" philosophy has **no direct competitor analog**. Every major platform is either:

- **Test-based** (LinkedIn Skills Assessments, HackerRank, Codility, TestGorilla) — timed exams that measure point-in-time ability
- **Social-validation-based** (LinkedIn endorsements) — peer signals that are easy to game
- **Credential-based** (vendor certs, Coursera, digital badges) — proof of completing a specific program

The **Count** is fundamentally different: it's a **lifetime accumulation model derived from profile data**, not a test score or social signal. This is both its greatest differentiation and its biggest adoption risk.

---

## Market Positioning Map

```
                    HIGH EFFORT (test-taking anxiety)
                         |
                         |
    LinkedIn Assessments  ●      HackerRank / Codility ●
                         |
    TestGorilla ●        |
                         |
    SkillPass "Count" ●  |
                         |
    LinkedIn Endorsements ●
                         |
                    LOW EFFORT (passive/profile-based)
                         |
    ←—— SELF-REPORTED —————————————— VERIFIED ——→
```

**SkillPass sits in an uncrowded quadrant:** low-effort (no test-taking, works from existing profile data) but positioned as more rigorous than endorsements because it uses deterministic extraction + formula rather than pure self-report. The open question is whether employers trust it as equivalent to test-based verification.

---

## Key Insights

### 1. The "Count" Is Genuinely Differentiated — But Differentiation ≠ Adoption

The lifetime-accumulation, no-decay model is unique. No competitor does this. The closest analog is the "total XP" concept from gaming/gamification platforms (Stack Overflow reputation, GitHub contributions), not from hiring.

**Risk:** Employers and jobseekers are trained to think in percentages, percentiles, and pass/fail. The Count introduces a new mental model that requires education. An employer seeing "React: 150 Count" has no intuitive frame of reference. The spec acknowledges this ("No scaling or percentage conversion") but doesn't address the employer-side education gap.

**What the research says:**
- LinkedIn's Skill Assessment badges produce a ~30% increase in recruiter callback rate. That's meaningful. Employers already understand and value the badge.
- Indeed discontinued its assessments entirely because they "added confusion and extra steps." This is a warning: if the scoring model is confusing to either party, adoption stalls.

### 2. The Trust Problem in Skill Signaling Is Real and Getting Worse

Multiple sources confirm that LinkedIn endorsements have suffered a **trust collapse**. Key data:

- Profiles with 0 endorsements on a listed skill look *worse* than not listing it (signals nobody would validate you)
- Recruiters spend 7.4 seconds on initial profile review — endorsement counts are invisible to them until they dig deeper
- The endorsement system is widely recognized as performative: "participation trophies" where people endorse skills they've never seen used

**Opportunity for SkillPass:** If the Count is perceived as more trustworthy than endorsements (because it's data-driven, not social), this positions it well. However, the bar is low — literally any system perceived as more rigorous than a 1-click endorsement has room.

**Threat:** If the Count is perceived as just another AI-generated number with no real verification, it inherits the same trust deficit. The deterministic formula helps (explainability), but users need to believe the extracted facts are accurate.

### 3. AI Bias in Hiring Is Under Regulatory Scrutiny — This Cuts Both Ways

The regulatory landscape is rapidly evolving:

- **NYC Local Law 144** (effective 2023) requires bias audits of automated employment decision tools
- **EU AI Act** classifies recruitment AI as "high risk"
- **Workday class action** (June 2026) — first federal class action challenging AI screening under anti-discrimination statutes
- Recent academic research (2026) shows LLM hiring bias is unstable across model generations — GPT-3.5 favored White names, GPT-4+ favors Black names, neither is desirable

**What this means for SkillPass:**
- The **deterministic formula** (server-side arithmetic on extracted facts) is a *strength* — it's auditable, explainable, and not a black box.
- The LLM extraction step *is* a black box. If the LLM mis-extracts facts systematically for certain demographics, the deterministic formula propagates that bias.
- SkillPass needs to be prepared for the question: "Does your LLM systematically underestimate years of experience for certain groups?" This is not currently addressed in the spec.
- The Count system likely qualifies as an "automated employment decision tool" under NYC Law 144 if employers use it for screening.

### 4. No Recency Decay Is a Strategic Bet — With Adoption Risk

The Plunderer-inspired "nothing ever subtracts" philosophy is philosophically clean but practically risky:

**Argument for:**
- A nurse who trained 20 years ago *did* earn those skills — this is a lifetime achievement record
- Eliminates the "gaps in resume" penalty, which can discriminate against caregivers, career-changers
- Makes the Count always go up → positive reinforcement for users

**Argument against:**
- Recruiters and employers care about *current* capability. A Java developer who hasn't used Java since 2015 will have a higher Count than one who started in 2020 — a misleading signal for a Java job.
- The matching system can partially address this (category-weighted matching), but the Count itself is invariant to recency.
- Users may feel the Count is "wrong" if it doesn't reflect their current skill level — eroding trust in the very metric meant to build it.

**Market precedent:**
- LinkedIn's Skill Assessments expire in the sense that the item bank refreshes, but the *badge* doesn't expire. They solved this by keeping questions current (~6 month refresh cycles).
- No major platform has a no-decay model. The market signals recency matters.

### 5. The Auto-Re-Evaluate Flow Needs Careful UX Research

The spec says: evaluation expires after 3 months, and applying to a job auto-triggers re-evaluation. This is sensible for data freshness but has user experience risks:

- **Surprise:** User applies to job, gets hit with a evaluation spinner before the application submits. If the LLM call takes 5-15 seconds, this is a friction point at a high-anxiety moment.
- **Count decrease concern:** Per the spec, Count only increases — so this should not be an issue. But what if the user's *profile didn't change* and the LLM extracts different facts? The spec claims deterministic results, but LLM extraction is non-deterministic by nature (same prompt, same input can produce different output). The spec addresses this with structured fact extraction, but the test harness for stability is Phase 2 — meaning it's not proven yet.
- **Perceived unfairness:** If two users with identical profiles get slightly different Counts due to LLM variance, and one applies to a job and the other doesn't, the auto-trigger could surface inconsistencies.

---

## User Research Implications — Assumptions to Validate

| Assumption in Spec | Risk Level | What We Don't Know |
|--------------------|-----------|-------------------|
| Users will understand "Count" as a concept | **High** | No consumer research on mental model. Is "Count" intuitive? Does it need explanation? Would percentages or levels (bronze/silver/gold) be clearer? |
| Users will manually trigger re-evaluation | **Medium** | The spec says profile updates have no auto-trigger — user must click "Evaluate." Will they remember? Will they bother? Adoption of manual evaluation features is historically poor. |
| Users will trust the LLM extraction | **High** | "The LLM extracted 8 years of React experience but I've only used it for 2" — how do users appeal or correct? No feedback loop documented. |
| Employers will trust the Count | **High** | This is the hardest assumption. Employers are trained on test-based validation (certifications, assessments). Will they trust an AI-derived number from profile data? |
| The Count history feature will drive engagement | **Medium** | "3 months ago: 1,450 → today: 2,022" is motivating for users who improve their profile. But what about users whose Count stays flat because they haven't added experiences? Could be demotivating. |
| No recency decay is acceptable to employers | **High** | The biggest strategic risk. If employers filter by "React Count > 100" and get stale profiles, they'll lose trust in the system. |
| Weaknesses as "growth opportunities" | **Medium** | The spec says weaknesses are presented as growth opportunities with no score deduction. Does this feel meaningful, or does it feel like the system is sugar-coating? |

---

## Competitive Briefs

### LinkedIn Skill Assessments
- **What they do:** Free 15-question adaptive quizzes for ~80 skills. 70th-percentile pass threshold. Badge displayed on profile.
- **Advantage:** Brand, scale (1B+ users), integrated with recruiter search, anti-cheating via adaptive testing, 30% higher recruiter callback rate for badge holders.
- **Weakness:** Tech-heavy skill coverage, binary pass/fail, 3-month lockout on failure, not EEOC-validated for sole-criterion use.
- **Watch for:** Expansion of skill coverage beyond tech, integration with Microsoft Copilot/LinkedIn Learning for continuous verification.

### Indeed Smart Screening (Post-Assessments)
- **What they do:** Discontinued test-based assessments in Oct 2024. Now screens candidates on objective criteria from their profile against job descriptions.
- **Advantage:** Simpler UX, less friction, no test anxiety.
- **Weakness:** Less differentiation signal — every profile-based system looks sameish.
- **Watch for:** Indeed's move validates that the market is moving *away* from test-based screening for non-technical roles. Smart Screening's "fit score" is actually closer to what SkillPass is doing than LinkedIn's approach.

### TestGorilla
- **What they do:** 400+ multi-measure tests (technical, cognitive, personality, language, situational judgment).
- **Advantage:** Breadth across professions, easy for non-technical hiring managers, affordable.
- **Weakness:** 0.38-0.42 predictive validity for technical roles, shallow depth.
- **Watch for:** Their conversational AI video interview (launched Oct 2025) — they're adding AI interview layers to their assessment library.

---

## Gaps in the Spec

### Critical Gaps

1. **No employer-side education or adoption strategy.** The spec is entirely jobseeker-facing. There is no discussion of how employers will discover, understand, or trust the Count. Without employer adoption, the Count has no value to jobseekers.

2. **No feedback or correction mechanism.** If the LLM extracts wrong facts, how does a user correct them? The spec has "strengths/weaknesses/suggestions" from the LLM but no appeal process. This is a trust risk.

3. **No bias audit strategy.** Given the regulatory environment (NYC Law 144, EU AI Act, Workday lawsuit), SkillPass needs a documented approach to measuring and mitigating demographic bias in the LLM extraction step.

4. **No skill normalization strategy.** "React" vs "React.js" vs "React Native" — the spec flags this as Open Question #6 but hasn't solved it. Without normalization, the same skill can appear multiple times under different names, inflating the Count.

5. **No validation against real profile data.** The point table values (+10/yr, +15/role, +30/edu) are plausible but untuned. The spec says this should be tuned "once implemented." This is a bootstrap problem — the system needs to exist to be tuned, but early users will see unbalanced scores.

### Moderate Gaps

6. **Mobile UX for the dedicated profile sections** (Phase 3) — entering 6 types of experiences with rich metadata is a mobile challenge. The spec doesn't address mobile.

7. **The LLM prompt says "Return ONLY valid JSON"** but does not specify what happens on parse failure. No fallback, retry, or error recovery documented.

8. **Privacy implications** — The evaluation stores all profile data including URL evidence. This creates a data-rich vector that could be sensitive if breached. Not addressed.

---

## Recommendations

### Before Implementation (Research Phase)

| # | Action | Priority | Rationale |
|---|--------|----------|-----------|
| 1 | **Conduct 8-10 employer interviews** on how they evaluate skill signals today, what they'd trust, and whether a "Count" would influence screening decisions | P0 | Employer adoption is the largest unknown. If employers don't trust it, the feature has no ROI. |
| 2 | **Run 5-8 jobseeker concept tests** showing mock Count screens — test comprehension of "Count vs percentage," willingness to self-evaluate, and reaction to LLM-derived facts | P0 | Validates the core UX assumption that users understand and trust the system. |
| 3 | **Build a bias audit framework** for the LLM extraction step before Phase 2 | P0 | Regulatory risk. Need to test whether extraction accuracy varies by demographic group. |
| 4 | **Validate point table values** by running 50+ real profiles through the formula with human expert judges to calibrate | P1 | Avoids launching with unbalanced scores that damage trust. |
| 5 | **Test LLM extraction stability** with 20 identical profiles, each submitted 5 times — measure variance in extracted facts | P1 | Core to the deterministic claim. If variance is >5%, the architecture promise is broken. |

### During Implementation

| # | Action | Priority | Rationale |
|---|--------|----------|-----------|
| 6 | **Design a feedback/correction flow** before Phase 1 ships — users must be able to flag incorrect extractions | P0 | Without this, trust erosion is inevitable on the first wrong extraction. |
| 7 | **Build an employer dashboard** showing what the Count means with percentile benchmarks (e.g., "React Count of 150 = top 20% of candidates") | P1 | Employers need reference frames to interpret Count values. |
| 8 | **Consider a "recency signal"** — not subtracting from Count, but adding a "last used" metadata field visible to employers | P1 | Addresses the stale-skill concern without violating the no-decay philosophy. |
| 9 | **Localize the ambiguous title classification table** — the current list is US/Western-centric. "Staff Nurse" vs "Staff Engineer" distinctions may not translate globally | P2 | International users will get misclassified. |
| 10 | **Add a skill normalization step** (synonym resolution, casing normalization) before LLM extraction | P1 | Prevents count inflation from duplicate skill entries. |

### Recommendations Summary

1. **The Count is a genuinely differentiated philosophy** — no competitor uses accumulation scoring. This is a market advantage if executed well.

2. **The biggest risk is not technical but behavioral** — employers and jobseekers need to understand and trust a new scoring paradigm. LinkedIn spent heavily on employer education for Skill Assessments. SkillPass needs a similar investment.

3. **The deterministic formula is a regulatory and trust advantage** — auditable, explainable, bias-mitigatable. This should be front-and-center in messaging.

4. **The no-decay model needs a compromise** — the philosophy is noble, but the market expects recency information. A "last used" badge or filter layer (not modifying the Count itself) would address this without violating principles.

5. **SkillPass's competitive window is real but narrow** — with Indeed exiting assessments, LinkedIn's system covering only ~80 skills, and regulatory pressure mounting on black-box AI screeners, there is a market gap for a transparent, data-driven, multi-industry scoring system. But the window closes as regulation clarifies and incumbents adapt.
