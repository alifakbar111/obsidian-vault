---
created: 2026-07-21
tags: [business, ai, indonesia, pricing, legal, research]
---

# Business Model Research — AI Token Reseller Indonesia

## 1. Problem Statement

Indonesian developers cannot easily access AI APIs (GPT-4, Claude, Gemini) because:
- **No international credit card** — 70%+ of Indonesian devs don't have one
- **USD pricing is prohibitive** — at Rp 17,905/USD, even $10/mo = Rp 179,000
- **No local reseller offers Western models with IDR pricing** — 9inference only offers Chinese models (DeepSeek, Qwen, GLM, etc.)
- **Direct provider minimums** — OpenAI requires $5 deposit via international card

---

## 2. Goals

| Goal | Metric | Target |
|---|---|---|
| Lowest barrier to entry | Minimum top-up amount | Rp 5.000 |
| Competitive pricing vs direct | Price/1M tokens vs direct USD price | ≤ direct price in IDR |
| Sustainable margins | Gross margin across all models | ≥ 30% blended |
| No card required | Payment methods | QRIS, VA, e-wallet |
| Fully autonomous operations | Manual intervention hours/week | ≤ 2 hours |

---

## 3. Provider Costs — Exact Pricing

### OpenAI (platform.openai.com)

| Model | Input Cost/1M (USD) | Output Cost/1M (USD) | Input Cost/1M (IDR) | Output Cost/1M (IDR) |
|---|---|---|---|---|
| GPT-4o | $2.50 | $10.00 | Rp 44,763 | Rp 179,050 |
| GPT-4o-mini | $0.15 | $0.60 | Rp 2,686 | Rp 10,743 |
| o1-mini | $1.10 | $4.40 | Rp 19,696 | Rp 78,782 |

### Anthropic (console.anthropic.com)

| Model | Input Cost/1M (USD) | Output Cost/1M (USD) | Input Cost/1M (IDR) | Output Cost/1M (IDR) |
|---|---|---|---|---|
| Claude 3.5 Haiku | $0.80 | $4.00 | Rp 14,324 | Rp 71,620 |
| Claude 3.5 Sonnet | $3.00 | $15.00 | Rp 53,715 | Rp 268,575 |
| Claude 3 Opus | $15.00 | $75.00 | Rp 268,575 | Rp 1,342,875 |

### Groq (console.groq.com)

| Model | Input Cost/1M (USD) | Output Cost/1M (USD) | Input Cost/1M (IDR) | Output Cost/1M (IDR) |
|---|---|---|---|---|
| Llama 3.3 70B | $0.59 | $0.79 | Rp 10,564 | Rp 14,145 |
| Mixtral 8x7B | $0.27 | $0.27 | Rp 4,834 | Rp 4,834 |
| Llama 3.1 8B | $0.05 | $0.08 | Rp 895 | Rp 1,432 |
| Gemma 2 9B | $0.08 | $0.08 | Rp 1,432 | Rp 1,432 |

### Google Gemini (ai.google.dev)

| Model | Input Cost/1M (USD) | Output Cost/1M (USD) | Input Cost/1M (IDR) | Output Cost/1M (IDR) |
|---|---|---|---|---|
| Gemini 2.0 Flash | $0.075 | $0.30 | Rp 1,343 | Rp 5,372 |
| Gemini 2.0 Pro | $1.25 | $5.00 | Rp 22,381 | Rp 89,525 |

### DeepSeek (platform.deepseek.com)

| Model | Input Cost/1M (USD) | Output Cost/1M (USD) | Input Cost/1M (IDR) | Output Cost/1M (IDR) |
|---|---|---|---|---|
| DeepSeek-V4 | $0.50 | $2.00 | Rp 8,953 | Rp 35,810 |
| DeepSeek-V4-Flash | $0.25 | $0.50 | Rp 4,476 | Rp 8,953 |

*Note: All IDR conversions at Rp 17,905/USD*

---

## 4. Sell Pricing & Margin Analysis

### Proposed Sell Prices

| Tier | Models Included | Sell Price/1M (IDR) | Blended Buy Cost/1M (IDR) | Gross Margin |
|---|---|---|---|---|
| **Ekonomi** | Llama 3 8B, Gemma 2 | Rp 3,000 | Rp 1,000-1,400 | **53-67%** |
| **Standar** | GPT-4o-mini, Claude Haiku, Gemini Flash, Mixtral, DeepSeek Flash, Llama 70B | Rp 10,000 | Rp 2,700-14,300 | **Varies by model** |
| **Premium** | GPT-4o, Claude Sonnet, Gemini Pro | Rp 100,000 | Rp 44,800-53,700 | **46-55%** |
| **Ultra** | Claude Opus, o1-mini | Rp 250,000 | Rp 78,800-268,600 | **-7% to 69%** |

### Margin Breakdown Per Model

| Model | Your Buy/1M (IDR) | Sell/1M (IDR) | Margin | Notes |
|---|---|---|---|---|
| Llama 3 8B (Groq) | Rp 1,000 | Rp 3,000 | **67%** | Great margin, good for simple tasks |
| Gemma 2 (Groq) | Rp 1,400 | Rp 3,000 | **53%** | |
| Mixtral 8x7B (Groq) | Rp 4,800 | Rp 10,000 | **52%** | |
| Llama 3 70B (Groq) | Rp 12,000 | Rp 10,000 | **-20%** | ⚠️ **Loss leader** if priced at Standar |
| GPT-4o-mini (OpenAI) | Rp 6,700 | Rp 10,000 | **33%** | |
| Gemini Flash (Google) | Rp 3,400 | Rp 10,000 | **66%** | Excellent margin |
| Claude Haiku (Anthropic) | Rp 43,000 | Rp 10,000 | **-330%** | ⚠️ **Massive loss** at Standar pricing |
| DeepSeek V4 Flash | Rp 6,700 | Rp 10,000 | **33%** | |
| GPT-4o (OpenAI) | Rp 112,000 | Rp 100,000 | **-12%** | ⚠️ **Loss** — need to price higher |
| Claude Sonnet (Anthropic) | Rp 161,000 | Rp 100,000 | **-61%** | ⚠️ **Big loss** |
| Gemini Pro (Google) | Rp 56,000 | Rp 100,000 | **44%** | |

### ⚠️ Critical Finding

The current tiered pricing **loses money on premium models** (GPT-4o, Claude Sonnet, Claude Opus, Llama 70B). The blended "Standar" tier at Rp 10,000/1M is not sustainable if users route to expensive models.

### Recommended: Model-Specific Pricing (Not Tiers)

Instead of tiers, use **per-model pricing** (like 9inference):

| Model | Your Buy/1M (IDR) | Sell/1M (IDR) | Margin |
|---|---|---|---|
| Llama 3 8B | Rp 1,000 | Rp 3,000 | **67%** |
| Mixtral 8x7B | Rp 4,800 | Rp 6,000 | **20%** |
| Gemini Flash | Rp 3,400 | Rp 5,000 | **32%** |
| GPT-4o-mini | Rp 6,700 | Rp 10,000 | **33%** |
| DeepSeek V4 Flash | Rp 6,700 | Rp 8,000 | **16%** |
| Llama 3 70B | Rp 12,000 | Rp 15,000 | **20%** |
| DeepSeek V4 | Rp 22,400 | Rp 25,000 | **10%** |
| Gemini Pro | Rp 56,000 | Rp 75,000 | **25%** |
| GPT-4o | Rp 112,000 | Rp 150,000 | **25%** |
| Claude Sonnet | Rp 161,000 | Rp 200,000 | **20%** |
| Claude Opus | Rp 1,342,000 | Rp 1,500,000 | **11%** |

**Blended margin with per-model pricing**: ~25-30%

### Loss Leader Strategy

Consider **Llama 3 8B at Rp 1,000/1M** (below cost) as a loss leader — users try the service, then upgrade to paid models. But this risks abuse.

**Better**: Offer **free tier** — Rp 5.000 free credit on signup (costs you ~Rp 3.000). Users can try before buying.

---

## 5. Legal & ToS Analysis

### OpenAI ToS — Reselling

From platform.openai.com/terms (summarized key points):

| Clause | Restriction | Workaround |
|---|---|---|
| **No reverse engineering** | Not relevant | — |
| **No competitive use** | Can't use to build competing LLM | We're an API layer, not an LLM |
| **API use restrictions** | Must follow API policies | We are the end user's agent |
| **No resale** (Section 3.1) | "You may not..." — actually unclear | OpenAI's ToS says you may not *transfer* your rights. But using their API to offer a service is generally allowed. |

**Key clause from OpenAI ToS**: 
> *"You may not... sell, resell, rent, lease, or offer access to the Services to a third party"*

This is a **gray area**. Many companies (OpenRouter, Together AI) operate the same model. The argument is:
- You are not reselling OpenAI. You are offering a **unified API layer** that *uses* OpenAI as one of many backends.
- The end user's relationship is with you, not OpenAI.

**Risk**: Low for MVP stage. OpenAI has not enforced this against similar services (OpenRouter has operated for years).

### Anthropic ToS

Similar restrictions. Same defense applies.

### Legal Structure Recommendation

| Stage | Structure | Cost | When |
|---|---|---|---|
| **MVP / Testing** | Individual (NPWP pribadi) | Free | Now |
| **After 100 paying users** | PT Perorangan (UMKM) | ~Rp 1M | Month 2-3 |
| **After Rp 4.8B/year revenue** | PT + PKP (PPN 11%) | ~Rp 10M | Year 2-3 |

### Tax Implications

| Item | Rate | Notes |
|---|---|---|
| PPh Final (UMKM) | 0.5% of turnover | If PT Perorangan, turnover < Rp 4.8B/yr |
| PPN | 11% | Only if PKP (turnover > Rp 4.8B/yr) |
| PPh 23 | 2% | If using third-party services |
| Midtrans PPN | Already included in their fee | |

---

## 6. Market Size Analysis

### Indonesian Developer Market

| Source | Number | Year |
|---|---|---|
| Indonesian tech workers (total) | ~2.5M | 2024 |
| Software developers | ~500,000-700,000 | 2024 |
| CS/IT students | ~500,000+ | 2024 |
| Freelance developers | ~1M (platform estimates) | 2024 |

### AI API Users (Addressable Market)

| Segment | Estimated Size | % Who Would Pay for AI API | TAM |
|---|---|---|---|
| Active AI devs (currently use OpenAI/etc) | ~5,000-10,000 | 100% (already paying) | 5,000-10,000 |
| Devs who want AI but can't pay USD | ~50,000-100,000 | 30-50% | 15,000-50,000 |
| CS students needing AI for projects | ~200,000 | 10-20% | 20,000-40,000 |
| Freelancers using AI tools | ~300,000 | 5-10% | 15,000-30,000 |
| **Total addressable market** | | | **~55,000-130,000 users** |

### Realistic Adoption (Conservative)

| Month | Users | Penetration of TAM |
|---|---|---|
| 1 | 20 | 0.02% |
| 3 | 100 | 0.1% |
| 6 | 300 | 0.3% |
| 12 | 700 | 0.7% |
| 24 | 3,000 | 3% |

**Key insight**: The market is small but real. 700 users at Rp 50K avg = Rp 35M/mo revenue is achievable within a year.

---

## 7. Competitor Pricing Comparison

### 9inference Pricing (Chinese Models Only)

| Model | Input/1M IDR | Output/1M IDR |
|---|---|---|
| MiMo V2.5 Pro | Rp 1,000 | Rp 1,000 |
| MiniMax M3 | Rp 1,500 | Rp 2,000 |
| GLM-5.2 | Rp 1,900 | Rp 4,400 |
| Qwen 7 Plus | Rp 2,000 | Rp 6,000 |
| DeepSeek V4 Flash | Rp 2,300 | Rp 4,000 |
| DeepSeek V4 Pro | Rp 2,500 | Rp 4,000 |

**9inference** only offers Chinese models. Their cheapest model (MiMo) is Rp 1,000/1M — very hard to compete on price for Chinese models.

**Your advantage**: You offer **GPT-4o, Claude, Gemini** which they don't have at all.

### OpenRouter Pricing (USD, No QRIS)

| Model | Our Sell (IDR) | OpenRouter (USD) | OpenRouter (IDR) |
|---|---|---|---|
| GPT-4o-mini | Rp 10,000 | $0.15/1M | Rp 2,686 |
| GPT-4o | Rp 150,000 | $2.50/1M | Rp 44,763 |

**Note**: OpenRouter is cheaper in IDR because they price at USD cost. But users need an international card. You charge a premium for the convenience of QRIS + IDR.

---

## 8. Payment Costs Analysis

### Midtrans Fees

| Payment Method | Fee | For Rp 25,000 top-up |
|---|---|---|
| QRIS | 3.6% + Rp 2,000 | Rp 2,900 (11.6%) |
| Virtual Account | 3.6% + Rp 2,500 | Rp 3,400 (13.6%) |
| GoPay | 3.6% + Rp 2,000 | Rp 2,900 (11.6%) |
| Convenience Store | Rp 2,500 flat | Rp 2,500 (10%) |

**Problem**: For small top-ups (Rp 5,000), the fee percentage is very high (up to 40%).

| Top-Up Amount | QRIS Fee | Effective % |
|---|---|---|
| Rp 5,000 | Rp 2,180 | **43.6%** |
| Rp 25,000 | Rp 2,900 | **11.6%** |
| Rp 100,000 | Rp 5,600 | **5.6%** |
| Rp 350,000 | Rp 14,600 | **4.2%** |
| Rp 1,500,000 | Rp 56,000 | **3.7%** |

### Recommendation

- **Encourage larger top-ups** — offer bonus tokens for Rp 100K+ top-ups to offset fee %
- **Accept smaller top-ups as loss leader** — Rp 5,000 top-up costs you Rp 2,180 in fees, but acquires a user
- **Set minimum top-up at Rp 10,000** (not Rp 5,000) to keep fees under 22%

### Alternative: Tripay

Tripay offers lower fees for QRIS (~2-3% + Rp 1,500). Consider switching after MVP.

---

## 9. Unit Economics

### Customer Acquisition Cost (CAC)

| Channel | Cost | Expected Users | CAC |
|---|---|---|---|
| Twitter/X organic | 0 (time only) | 50-100 | Rp 0 |
| Telegram community | 0 (time only) | 50-150 | Rp 0 |
| Free credit giveaway (Rp 5,000 x 100) | Rp 500,000 | 100 | Rp 5,000 |
| Campus partnerships | Rp 0 (free credits cost) | 200 | Rp 5,000 |
| **Blended CAC** | | | **~Rp 3,000-5,000** |

### Lifetime Value (LTV)

| Month | Retained Users | Avg Spend/Month | Cumulative LTV |
|---|---|---|---|
| 1 | 100% | Rp 25,000 | Rp 25,000 |
| 3 | 60% | Rp 35,000 | Rp 80,000 |
| 6 | 40% | Rp 50,000 | Rp 180,000 |
| 12 | 25% | Rp 75,000 | Rp 375,000 |

**LTV:CAC Ratio**: ~75:1 (375,000 / 5,000) — excellent, because CAC is near zero with organic channels.

### Gross Margin After Payment Fees

| Top-Up Amount | Payment Fee | Provider Cost % | Gross Margin |
|---|---|---|---|
| Rp 25,000 | Rp 2,900 (11.6%) | ~70% of revenue (blended) | ~18.4% |
| Rp 100,000 | Rp 5,600 (5.6%) | ~70% of revenue | ~24.4% |
| Rp 1,500,000 | Rp 56,000 (3.7%) | ~70% of revenue | ~26.3% |

---

## 10. Risk Assessment

| Risk | Probability | Impact | Mitigation | Cost of Mitigation |
|---|---|---|---|---|
| Provider ToS enforcement | Low | High (shutdown) | Route through own backend, don't advertise as "reseller" | Free |
| USD-IDR fluctuates >10% | Medium | Medium (margin squeeze) | Peg prices in IDR with 15% buffer. Adjust prices quarterly. | Free |
| Fraud / stolen API keys | Medium | High (loss of tokens) | Per-key spending cap (default Rp 1M). Rate limiting. | Free (code) |
| Provider price cuts | Medium | Medium (margin decrease) | Diversify across 5+ providers. Update prices accordingly. | Low |
| 9inference adds Western models | Medium | High (lose differentiation) | Build moat: lower min top-up, better docs, community | Time |
| Payment gateway down | Low | Medium (no revenue) | Dual gateway (Midtrans + Tripay) | Low |
| Regulation change (Kominfo) | Low | Medium | Register PSE when >1,000 users | Rp 0 |
| Low adoption | Medium | High (business fails) | Start with campus outreach, free credits | Rp 500K max |

---

## 11. Open Questions

| Question | Who Can Answer | Priority | Status |
|---|---|---|---|
| Does OpenAI's ToS explicitly prohibit our use case? | Legal counsel | High | Need to engage lawyer for definitive answer |
| Can we negotiate wholesale rates with providers? | Provider sales teams | Medium | Only after we have usage volume ($5K+/mo) |
| What is the exact PPN treatment for digital token sales in Indonesia? | Tax consultant | Medium | Need to confirm if PPN applies to tokens |
| Do Indonesian devs actually want GPT-4o or are Chinese models sufficient? | Market research (survey) | High | Need to survey target users |
| Will Midtrans approve our account for QRIS? | Midtrans | High | Apply and see — may need PT first |
| What is the cheapest VPS with low latency to Jakarta/Singapore? | DO / Vultr / AWS | Low | $10-20/mo should work |

---

## 12. Recommendations

### Pricing: Use Per-Model Pricing, Not Tiers

```
Instead of "Ekonomi/Standar/Premium/Ultra" tiers,
show each model with its exact price per 1M tokens in IDR.
Like 9inference does, but simpler: just Rp prices, no TOKS.
```

### Immediate Action Items (Before Building)

1. **Apply for Midtrans account** — confirm QRIS availability
2. **Sign up for Groq** — get free credits, test API (lowest cost provider)
3. **Create OpenAI + Anthropic accounts** — deposit $5 each, test API
4. **Survey 20 Indonesian devs** — ask: "What would you pay for GPT-4o via QRIS?"
5. **Consult a lawyer** — one-hour consultation on ToS risk (~Rp 500K-1M)

### MVP Pricing Table (Per Model)

```json
{
  "groq/llama-3-8b":        {"display": "Llama 3 8B",   "price_per_1m": 3000},
  "groq/mixtral-8x7b":       {"display": "Mixtral 8x7B",  "price_per_1m": 6000},
  "google/gemini-2-flash":   {"display": "Gemini Flash",  "price_per_1m": 5000},
  "openai/gpt-4o-mini":      {"display": "GPT-4o Mini",   "price_per_1m": 10000},
  "deepseek/deepseek-v4-flash": {"display": "DeepSeek V4 Flash", "price_per_1m": 8000},
  "groq/llama-3-70b":        {"display": "Llama 3 70B",   "price_per_1m": 15000},
  "deepseek/deepseek-v4":    {"display": "DeepSeek V4",   "price_per_1m": 25000},
  "google/gemini-2-pro":     {"display": "Gemini Pro",    "price_per_1m": 75000},
  "openai/gpt-4o":           {"display": "GPT-4o",        "price_per_1m": 150000},
  "anthropic/claude-sonnet-4": {"display": "Claude Sonnet", "price_per_1m": 200000},
  "anthropic/claude-haiku-3":  {"display": "Claude Haiku",  "price_per_1m": 10000},
  "openai/o1-mini":          {"display": "O1 Mini",       "price_per_1m": 250000}
}
```

### Minimum Viable Top-Up Amounts

```
Rp 10,000 → ~1M tokens of Llama 3 8B (economy)
Rp 25,000 → ~12.5M tokens of GPT-4o-mini
Rp 100,000 → ~50M tokens of mixed usage
Rp 500,000 → ~300M tokens (heavy user)
```

### Phased Launch

| Phase | What | Price Point | Risk |
|---|---|---|---|
| **Alpha** (weeks 1-3) | Free credits to 50 testers | Rp 0 | Low — test stability |
| **Beta** (weeks 4-6) | 50 users, real pricing | Per-model pricing | Medium — validate willingness to pay |
| **Launch** (week 7+) | Open to public | Per-model pricing | Medium — marketing push |
| **Optimize** (month 3) | Adjust prices based on usage data | Data-driven | Low |
