---
created: 2026-07-21
tags: [business, ai, indonesia, bmc, strategy]
---

# Business Model Canvas — AI Token Reseller Indonesia

## 1. Customer Segments

**Who are we creating value for?**

| Segment | Description | Size | Willingness to Pay |
|---|---|---|---|
| **Indonesian software developers** | Build AI-powered apps, need API access to GPT-4, Gemini, Llama | ~100K | Rp 50K-500K/mo |
| **CS/IT university students** | Need AI for projects, assignments, learning — no international card | ~500K | Rp 10K-50K/mo |
| **Tech freelancers** | Use AI tools for productivity (coding, content, design) | ~1M | Rp 50K-300K/mo |
| **Indie hackers / startup founders** | Building AI prototypes, need flexible pay-as-you-go API | ~50K | Rp 100K-2M/mo |
| **Small AI agencies** | Resell AI services to clients, need reliable API access | ~5K | Rp 500K-5M/mo |

**NOT targeting:** UMKM, general public, non-technical users (this is a developer infrastructure product)

---

## 2. Value Propositions

**What problems are we solving?**

| Problem | Our Solution |
|---|---|
| **No international credit card** | Pay with QRIS — 95%+ Indonesian penetration |
| **USD pricing is prohibitive** | Price in IDR — no conversion headache, no fluctuation risk |
| **No local reseller offers Western AI models** | First provider in Indonesia offering GPT-4o, Claude, Gemini with QRIS |
| **Minimum deposits too high** | Top-up from Rp 10,000 (~$0.56) |
| **Multiple provider accounts needed** | One API key for 6+ models across 3 providers |
| **Provider downtime** | Auto-failover between providers |

**Value promise:**
> *"Satu API key untuk GPT-4, Gemini, Llama. Bayar pake QRIS. Mulai Rp 10.000."*

---

## 3. Channels

**How do we reach customers?**

| Channel | Type | Cost | Reach |
|---|---|---|---|
| **Twitter/X** | Organic — dev community | Free (time) | High — Indonesian devs are active |
| **Telegram** | Community — join dev groups | Free (time) | High — 10+ major groups |
| **Discord** | Community — own server | Free | Medium |
| **Campus outreach** | Partnerships with himpunan mahasiswa TI | Free credits cost low | Medium — 500K+ students |
| **Medium / Dev.to** | Content marketing — tutorials | Free | Medium |
| **GitHub** | Open source projects mention | Free | Medium |
| **Word of mouth** | Referral program — "ajak teman, dapet bonus" | Rp 5K/user | High — trust-based |

**Not using:** TikTok, Instagram, Facebook, TV, radio (not relevant for developer tool)

---

## 4. Customer Relationships

**How do we interact with customers?**

| Stage | Approach | Automation |
|---|---|---|
| **Acquisition** | Twitter threads, Telegram discussions, campus talks | Manual (marketing) |
| **Onboarding** | Clean dashboard, OpenAI-compatible SDK — works immediately | Automated |
| **Support** | FAQ + AI chatbot trained on docs | Automated (triage) |
| **Retention** | Usage alerts, low balance notifications, monthly reports | Automated |
| **Community** | Discord/Telegram group for users | Semi-automated |
| **Feedback** | In-app feedback widget, usage analytics | Automated |

**Key policy:** No subscription lock-in. Pay-as-you-go builds trust.

---

## 5. Revenue Streams

**How do we make money?**

### Primary: Token Sales (Pay-as-you-go)

Users top up IDR → get tokens → spend tokens per API call.

| Top-Up Amount | Payment Fee | Our Net | Tokens Received |
|---|---|---|---|
| Rp 10,000 | Rp 2,360 (23.6%) | Rp 7,640 | 7,640 tokens |
| Rp 25,000 | Rp 2,900 (11.6%) | Rp 22,100 | 22,100 tokens |
| Rp 100,000 | Rp 5,600 (5.6%) | Rp 94,400 | 94,400 tokens |
| Rp 500,000 | Rp 18,000 (3.6%) | Rp 482,000 | 502,000 tokens (bonus) |
| Rp 1,500,000 | Rp 56,000 (3.7%) | Rp 1,444,000 | 1,544,000 tokens (bonus) |

### Revenue Per Model (per 1M tokens)

| Model | Sell Price | Buy Cost | Gross Profit | Margin |
|---|---|---|---|---|
| Llama 3 8B | Rp 3,000 | Rp 1,000 | **Rp 2,000** | **67%** |
| Gemini Flash | Rp 5,000 | Rp 3,400 | **Rp 1,600** | **32%** |
| Mixtral 8x7B | Rp 6,000 | Rp 4,800 | **Rp 1,200** | **20%** |
| GPT-4o-mini | Rp 10,000 | Rp 6,700 | **Rp 3,300** | **33%** |
| Gemini Pro | Rp 75,000 | Rp 56,000 | **Rp 19,000** | **25%** |
| GPT-4o | Rp 150,000 | Rp 112,000 | **Rp 38,000** | **25%** |

**Blended margin:** ~28% across all models (weighted by expected usage)

### Secondary: Bonus Tokens (Volume Incentive)

Encourage larger top-ups by offering bonus tokens:
- Rp 100,000 → +10% bonus
- Rp 500,000 → +25% bonus
- Rp 1,500,000 → +40% bonus

### Future: Enterprise Plans

- Reserved rate limits
- Dedicated support
- Custom pricing for high volume

---

## 6. Key Resources

**What assets do we need?**

| Resource | Type | Cost | Notes |
|---|---|---|---|
| **Go backend code** | Intellectual | Free (self-built) | ~2,000 lines |
| **React frontend code** | Intellectual | Free (self-built) | ~1,500 lines |
| **PostgreSQL + Redis** | Infrastructure | Included in VPS | |
| **VPS (DigitalOcean SG)** | Infrastructure | Rp 200K/mo | 2GB RAM, 1 CPU |
| **Domain (.id)** | Infrastructure | Rp 200K/year | |
| **Provider API keys** | Access | $5-20 deposit each | OpenAI, Google, Groq |
| **Midtrans account** | Payment | Free | 3-4% per transaction |
| **Brand (name, logo)** | Intellectual | Free (DIY) | |
| **Documentation** | Intellectual | Free (self-built) | |
| **Community** | Social | Free (time) | Discord/Telegram |

**Total fixed monthly:** ~Rp 250K ($15)

**Total startup cost:** ~Rp 400K ($25) + Rp 50K for provider deposits

---

## 7. Key Activities

**What do we do daily?**

| Activity | Frequency | Who | Automation |
|---|---|---|---|
| **Monitor server health** | Daily | Auto | Uptime monitoring |
| **Check provider API status** | Daily | Auto | Health check |
| **Process refunds** | As needed (~1-2x/mo) | You | Manual |
| **Approve new models** | As needed (~1x/week) | You | Manual (admin panel) |
| **Community engagement** | Daily (~15 min) | You | Manual |
| **Content (Twitter, blog)** | Weekly (~2 hrs) | You | Manual |
| **Review revenue/usage** | Weekly (~10 min) | Auto | Dashboard |
| **Negotiate provider rates** | Quarterly | You | Manual |
| **Update pricing** | Quarterly | You | Manual (admin panel) |
| **Tax reporting** | Monthly | You | Manual |

**Autonomous percentage:** ~90% of operations run without intervention

---

## 8. Key Partnerships

**Who helps us?**

| Partner | Role | Why Them |
|---|---|---|
| **Groq** | Cheapest open models (Llama, Mixtral) | Free credits to start, 50-80% margin models |
| **OpenAI** | Premium models (GPT-4o, GPT-4o-mini) | Most demanded models by devs |
| **Google** | Mid-range models (Gemini Flash/Pro) | Very competitive pricing |
| **Midtrans** | Payment gateway (QRIS) | Best Indonesian payment gateway, Snap API |
| **Tripay** | Backup payment gateway | Lower fees, fallback if Midtrans down |
| **DigitalOcean** | VPS hosting | Singapore datacenter, low latency to Indonesia |
| **Universitas (campuses)** | Distribution channel | Access to 500K+ students |

### Potential Future Partnerships

| Partner | Why |
|---|---|
| **Niagahoster / Domainesia** | Domain + hosting bundle for devs |
| **Hacktiv8 / Binar Academy** | Coding bootcamp partnerships |
| **Dicoding** | Indonesian dev learning platform |
| **AWS Activate** | Cloud credits for startups |

---

## 9. Cost Structure

**What are our costs?**

### Fixed Costs (Monthly)

| Item | IDR | USD |
|---|---|---|
| VPS (DigitalOcean $12/mo) | Rp 200,000 | ~$12 |
| Domain (Rp 200K/year ÷ 12) | Rp 17,000 | ~$1 |
| **Total fixed** | **Rp 217,000** | **~$13** |

### Variable Costs

| Item | Rate | Notes |
|---|---|---|
| Provider API costs | ~72% of revenue | Buy price of tokens |
| Midtrans payment fee | 3.6% + Rp 2,000 | Per transaction |
| Free credits (acquisition) | ~Rp 5K/user | Rp 500K max for launch |

### Cost Breakdown Per Rp 100,000 Top-Up

| Item | Amount | % |
|---|---|---|
| Revenue | Rp 100,000 | 100% |
| Midtrans fee | -Rp 5,600 | -5.6% |
| Provider cost (~70% blended) | -Rp 70,000 | -70% |
| **Gross profit** | **Rp 24,400** | **24.4%** |
| Fixed costs (Rp 217K ÷ transactions) | -Rp ~1,000 | -1% |
| **Net profit** | **~Rp 23,400** | **~23.4%** |

### Profit & Loss Projection

| Month | Users | Revenue | Provider Cost | Payment Fees | Fixed Cost | Profit |
|---|---|---|---|---|---|---|
| 1 | 20 | Rp 300K | Rp 216K | Rp 17K | Rp 217K | **-Rp 150K** |
| 2 | 50 | Rp 1.25M | Rp 900K | Rp 52K | Rp 217K | **+Rp 81K** |
| 3 | 100 | Rp 3.5M | Rp 2.52M | Rp 130K | Rp 217K | **+Rp 633K** |
| 6 | 300 | Rp 15M | Rp 10.8M | Rp 500K | Rp 217K | **+Rp 3.48M** |
| 12 | 700 | Rp 52.5M | Rp 37.8M | Rp 1.7M | Rp 217K | **+Rp 12.78M** |

**Break-even:** Month 2

---

## Margin of Safety Analysis

### Sensitivity: What if costs change?

| Scenario | Provider Cost Change | New Blended Margin | Impact |
|---|---|---|---|
| Base case | — | ~28% | — |
| Provider raises prices 20% | Up 20% | ~14% | Margin squeezed but still profitable |
| Provider cuts prices 20% | Down 20% | ~42% | Higher profit, or can lower prices |
| USD-IDR weakens 10% | Up 10% | ~21% | Need to adjust IDR prices |
| Midtrans raises fees | Up to 5% | ~26% | Minor impact |
| Add premium models (Claude) | Higher buy cost | ~20% | Lower blended but attracts more users |

### Buffer Strategy

- Prices set in IDR with **15% buffer** above break-even
- Re-evaluate quarterly
- If USD-IDR moves >5%, adjust prices

---

## Validation Checklist

| Question | Answer | Status |
|---|---|---|
| Do Indonesian devs actually want GPT-4o via QRIS? | Assumed yes — need to survey 20 devs | ❌ Not validated |
| Will Midtrans approve our account? | Should — individual NPWP + NIB sufficient | ❌ Need to apply |
| Can Groq handle Indonesian traffic? | Yes — they have global API | ✅ |
| Is Rp 10,000 low enough barrier? | Comparable to 9inference's minimum | ⚠️ Need to test |
| Will users tolerate 5s balance update delay? | Should be fine — async deduction | ⚠️ Need to test |
| Can we compete with 9inference on price? | Yes — we offer Western models they don't have | ✅ |
