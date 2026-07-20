# AI Evaluation Simulation — Senior Technical Leader Profile

**Date:** 2026-07-07
**Source profile:** `test-resume-senior-leader.json`
**Scoring framework:** AI Evaluation Scoring Design Spec (2026-07-07)

---

## Profile Summary

- **Role:** Technical Director & Principal Engineer
- **Industry:** Technology
- **Total experience:** ~16 years (2008–present)
- **Education:** Bachelor of Engineering, Communications Engineering (UESTC, 2006–2010)
- **Organizations:** 7 (including internship)

---

## LLM-Extracted Facts (Per Skill)

| # | Skill | totalYears | numRoles | roleWeight | eduLevel | numCertifications | numLicenses | numProjects | numOrgs | hasUrl |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | System Architecture | 9.3 | 4 | expert | none | 0 | 0 | 0 | 4 | true |
| 2 | Database | 8.7 | 3 | expert | none | 0 | 0 | 0 | 3 | true |
| 3 | Network | 4.3 | 2 | senior | bachelor | 0 | 0 | 0 | 2 | false |
| 4 | Machine Learning | 4.3 | 2 | expert | none | 0 | 0 | 0 | 2 | false |
| 5 | C++ | 3.1 | 2 | skilled | bachelor | 0 | 0 | 0 | 2 | false |
| 6 | Blockchain | 3.6 | 1 | expert | none | 0 | 0 | 0 | 1 | true |
| 7 | Security | 2.9 | 1 | senior | none | 0 | 0 | 0 | 1 | false |
| 8 | Distributed Systems | 2.4 | 1 | expert | none | 0 | 0 | 0 | 1 | false |
| 9 | System Reliability | 1.6 | 1 | expert | none | 0 | 0 | 0 | 1 | false |
| 10 | Python | 1.3 | 2 | skilled | none | 0 | 0 | 0 | 2 | false |
| 11 | C | 1.3 | 1 | skilled | bachelor | 0 | 0 | 0 | 1 | false |
| 12 | P2P | 1.8 | 1 | skilled | none | 0 | 0 | 0 | 1 | false |
| 13 | Data Engineering | 1.8 | 1 | skilled | none | 0 | 0 | 0 | 1 | false |
| 14 | Bash | 0.3 | 1 | entry | none | 0 | 0 | 0 | 1 | false |

---

## Count Calculation

### Point Table Applied

| Factor | Points |
|---|---|
| Experience duration | +10 per calendar year (no double-count concurrent roles) |
| Each distinct role | +15 per role |
| Role weight | Entry: +10, Skilled: +35, Senior: +65, Expert: +100 |
| Education | Bachelor's: +30 per skill (Network, C++, C) |
| Certification | None applicable |
| Project evidence | None extracted as separate entries |
| Context diversity | +5 per org (after the first) |
| Published evidence | +10 if URL present |

### Per-Skill Counts

| Skill | Years×10 | Roles×15 | RoleWt | Edu | Org×5 | URL | **Count** |
|---|---|---|---|---|---|---|---|
| System Architecture | 93 | 60 | 100 | — | 15 | 10 | **278** |
| Database | 87 | 45 | 100 | — | 10 | 10 | **252** |
| Network | 43 | 30 | 65 | 30 | 5 | — | **173** |
| Machine Learning | 43 | 30 | 100 | — | 5 | — | **178** |
| C++ | 31 | 30 | 35 | 30 | 5 | — | **131** |
| Blockchain | 36 | 15 | 100 | — | 0 | 10 | **161** |
| Security | 29 | 15 | 65 | — | 0 | — | **109** |
| Distributed Systems | 24 | 15 | 100 | — | 0 | — | **139** |
| System Reliability | 16 | 15 | 100 | — | 0 | — | **131** |
| Python | 13 | 30 | 35 | — | 5 | — | **83** |
| C | 13 | 15 | 35 | 30 | 0 | — | **93** |
| P2P | 18 | 15 | 35 | — | 0 | — | **68** |
| Data Engineering | 18 | 15 | 35 | — | 0 | — | **68** |
| Bash | 3 | 15 | 10 | — | 0 | — | **28** |

---

### Breakdown: System Architecture (highest Count)

```
System Architecture Count =
  (9.3 × 10)    → 93    (duration: ClickHouse + CovenantSQL + 4Paradigm + eLong)
+ (4 × 15)      → 60    (4 distinct roles)
+ 100           → 100   (Expert — highest role: Technical Director)
+ 0             → 0     (no education for this skill)
+ 0             → 0     (no certification)
+ 0             → 0     (no project entries)
+ (4-1) × 5     → 15    (4 organizations)
+ 10            → 10    (URL on CovenantSQL)
                  ─────
                  = 278
```

### Breakdown: C++ (skill with education bonus)

```
C++ Count =
  (3.1 × 10)    → 31    (Baidu + Stuhome, ~3.1 calendar years, no overlap)
+ (2 × 15)      → 30    (2 roles: Baidu + Stuhome)
+ 35            → 35    (Skilled — OP Engineering Developer + Software Engineer)
+ 30            → 30    (Bachelor's in Communications Engineering)
+ 0             → 0     (no certification)
+ 0             → 0     (no project entries)
+ (2-1) × 5     → 5     (2 organizations)
+ 0             → 0     (no URL)
                  ─────
                  = 131
```

### Breakdown: Bash (lowest Count)

```
Bash Count =
  (0.3 × 10)    → 3     (3-month internship at Douban)
+ (1 × 15)      → 15    (1 role)
+ 10            → 10    (Entry — intern role)
+ 0             → 0     (no education)
+ 0             → 0     (no certification)
+ 0             → 0     (no projects)
+ 0             → 0     (only 1 org)
+ 0             → 0     (no URL)
                  ─────
                  = 28
```

---

## Overall Total Count

```
totalCount = Σ(all skillCounts) + breadthBonus

Σ(skillCounts) = 278 + 252 + 173 + 178 + 131 + 161 + 109
               + 139 + 131 + 83 + 93 + 68 + 68 + 28
               = 1,892

breadthBonus  = (14 - 1) × 10 = 130

totalCount    = 1,892 + 130 = 2,022
```

### Key Insights

| Metric | Value |
|---|---|
| **Total Count** | 2,022 |
| **Number of skills** | 14 |
| **Highest skill** | System Architecture (278) |
| **Lowest skill** | Bash (28) |
| **Education boost** | +90 (Network +30, C++ +30, C +30) |
| **Breadth bonus** | +130 (13 extra skills × 10) |

### Role Weight Distribution

| Bucket | Skills | Count |
|---|---|---|
| Entry (+10) | Bash | 1 |
| Skilled (+35) | C++, Python, P2P, Data Engineering, C | 5 |
| Senior (+65) | Network, Security | 2 |
| Expert (+100) | System Architecture, Database, ML, Blockchain, Distributed Systems, System Reliability | 6 |

---

## Notes

- Calendar years used throughout — no double-counting for concurrent roles
- Education bonus only applied to skills actually studied in the degree (Network, C/C++)
- No certifications were found in this profile
- Project entries were internal to employment descriptions — not counted as separate project entries
- The URL on CovenantSQL contributed +10 to skills listed there
- Role weight assigned per skill based on the highest-level role where that skill was used
