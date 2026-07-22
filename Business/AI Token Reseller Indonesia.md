---
created: 2026-07-21
updated: 2026-07-21
tags: [business, ai, indonesia, qris, tokens, api]
status: draft
---

# AI Token Reseller — 🇮🇩 Indonesia Market

## Core Concept

Middle-layer AI API provider for the Indonesian market. Buy tokens from upstream providers (OpenAI, Anthropic, Google, Groq, Together AI, DeepSeek, etc.), resell to Indonesian users via QRIS payments in IDR.

**Value proposition**: Access GPT-4, Claude, Gemini, DeepSeek, and open models — pay with QRIS. No international card needed. No USD conversion headache.

---

## Problems Solved

| Problem | Solution |
|---|---|
| Most Indonesians don't have international credit cards | QRIS — 95%+ penetration |
| USD pricing is prohibitive (1 USD ≈ 16,000+ IDR) | Price in IDR, absorb fluctuation |
| AI adoption low due to price + payment barriers | Rp 5,000 entry point |
| No local reseller offers Western models (GPT-4, Claude, Gemini) with QRIS | First-mover in this niche |

---

## Payment Strategy

### Recommended Gateway: Midtrans or Tripay

| Gateway | QRIS | VA | E-Wallet | Retail | Fee | Notes |
|---|---|---|---|---|---|---|
| **Midtrans** | ✅ | ✅ | ✅ | ✅ | ~3-4% | Best docs, Snap UI |
| **Tripay** | ✅ | ✅ | ✅ | ✅ | ~2-4% | Lower fees, small amounts |
| **Xendit** | ✅ | ✅ | ✅ | ✅ | ~3-5% | Good for scale |

### Payment Methods (Priority)

1. **QRIS** — universal (GoPay, OVO, DANA, ShopeePay, LinkAja, mobile banking)
2. **Virtual Account** — BCA, Mandiri, BRI, BNI
3. **GoPay / OVO / DANA / ShopeePay** — direct e-wallet
4. **Convenience store** — Alfamart, Indomaret (for unbanked users)

### Flow

```
User clicks "Top Up" → Select amount → QRIS generated via Midtrans API
→ User scans with any e-wallet → Midtrans webhook → Balance credited
→ User gets WhatsApp/email confirmation
```

---

## Pricing Strategy

### Direct Rp Pricing (No TOKS, no conversion)

Your goal: **Be the cheapest way for Indonesians to access Western AI models.**

9inference focuses on Chinese models. You focus on Western models + also offer Chinese models.

### Tiered Pricing by Model Class

| Class | Models | Your Buy Price/1M | Your Sell Price/1M | Margin |
|---|---|---|---|---|
| **Ekonomi** | Llama 3 8B, Mixtral 8x7B, Gemini Flash | ~Rp 1.000-2.500 | Rp 5.000 | 50-80% |
| **Standar** | GPT-4o mini, Claude Haiku, DeepSeek V4 | ~Rp 2.500-5.000 | Rp 10.000 | 50-67% |
| **Premium** | GPT-4o, Claude Sonnet, Gemini Pro | ~Rp 40.000-80.000 | Rp 100.000 | 20-60% |
| **Ultra** | Claude Opus, GPT-o1, o3 | ~Rp 150.000+ | Rp 250.000 | 40% |

### Top-Up Packages

| Package | Credit (IDR) | Bonus | Effective Value |
|---|---|---|---|
| Coba | Rp 5.000 | — | Try any model |
| Pelajar | Rp 25.000 | +10% | Rp 27.500 value |
| Freelancer | Rp 100.000 | +15% | Rp 115.000 value |
| Startup | Rp 350.000 | +25% | Rp 437.500 value |
| Bisnis | Rp 1.500.000 | +40% | Rp 2.100.000 value |

Or simpler: **pure PAYG** — users top up any amount (min Rp 5.000), tokens deducted per request at published rates. No packages, no expiry.

---

## Product — The API Only (No WhatsApp, No Chat UI)

### The Core Product

A single, OpenAI-compatible endpoint:

```
POST /v1/chat/completions
Authorization: Bearer <api_key>
{
  "model": "gpt-4o",
  "messages": [...],
  "stream": true
}
```

### What Users Get

1. **API Key** — generated instantly after registration
2. **Dashboard** — top up, view usage, manage keys
3. **Access to 20+ models** — GPT-4o, GPT-4o mini, Claude Sonnet/Haiku, Gemini Pro/Flash, DeepSeek V4, Llama 3, Mixtral, Qwen, GLM
4. **Smart Routing** — optional "auto" mode routes to cheapest capable model

### What Users DON'T Get (Intentionally)

- ❌ No WhatsApp bot
- ❌ No web chat UI
- ❌ No image generation
- ❌ No consumer features

**This is a developer infrastructure product.** Clean, simple, API-only.

---

## Target Market (Refined)

| Segment | Size | Why They Need You |
|---|---|---|
| **Indonesian devs** building AI apps | ~100K | Need API access, can't pay USD |
| **Mahasiswa IT** (CS students) | ~500K+ | Need AI for projects, no card |
| **Freelancer tech** (Upwork, Sribu) | ~1M+ | Use AI to boost productivity |
| **Startups (early stage)** | ~2,500 | Need AI infra without complexity |
| **Indie hackers / makers** | ~50K | Building AI side projects |

**NOT targeting**: UMKM, general public, non-technical users. This is a developer tool.

---

## Competitive Positioning

### vs 9inference (Chinese models + QRIS)

| Dimension | 9inference | You |
|---|---|---|
| GPT-4o / Claude / Gemini | ❌ | ✅ |
| Chinese models (DeepSeek, Qwen, GLM) | ✅ (core) | ✅ (also available) |
| OpenAI-compatible API | ✅ | ✅ |
| QRIS + IDR | ✅ | ✅ |
| Min top-up | ~Rp 50K? | **Rp 5.000** |
| Smart model routing | ❌ | ✅ |
| Developer-focused | ✅ | ✅ |

**Your unique advantage**: Only place in Indonesia to access GPT-4o, Claude, and Gemini with QRIS/IDR.

### vs OpenRouter (global, USD)

| Dimension | OpenRouter | You |
|---|---|---|
| Models | 200+ | 20+ (curated) |
| Payment | Card/crypto | **QRIS + IDR** |
| Pricing | USD | **IDR, no conversion** |
| Indonesia focus | ❌ | ✅ |
| Indonesian support | ❌ | ✅ (WA/email in Bahasa) |

### vs Going Direct to OpenAI

| Dimension | Direct OpenAI | You |
|---|---|---|
| Payment | International card required | **QRIS (anyone)** |
| Pricing | USD (fluctuates) | **IDR (fixed)** |
| Min spend | $5 | **Rp 5.000** |
| Models | OpenAI only | **OpenAI + Anthropic + Google + open** |

---

## Tech Stack

```
Backend:     Go 1.22+ (chi router, pgx, go-redis)
Database:    PostgreSQL 16 (users, balances, usage)
Cache:       Redis 7 (balance cache, rate limiting, API key cache)
Async Queue: In-memory buffered channel + background worker
Payment:     Midtrans Snap API (QRIS)
Deployment:  Docker multi-stage → single ~15MB binary
Infra:       VPS $10-20/mo (DigitalOcean Singapore)
Domain:      .id (Niagahoster/Domainesia)
```

### MVP File Structure

```
tokenapi/
├── main.go                    # Entry point, wire everything, start worker
├── config/
│   └── config.go             # Load env → struct
├── database/
│   ├── postgres.go           # Connection pool + migrations
│   ├── redis.go              # Redis connection + cache helpers
│   └── models.go             # Go structs for DB tables
├── middleware/
│   └── auth.go               # API key validation (Redis cache + PG fallback)
├── provider/
│   ├── provider.go           # Interface + shared types
│   ├── openai.go             # OpenAI adapter (also used by Groq, Together)
│   ├── anthropic.go          # Anthropic adapter
│   └── router.go             # Model catalog + resolution
├── handler/
│   ├── chat.go               # POST /v1/chat/completions (stream + non-stream)
│   ├── webhook.go            # POST /api/webhook/midtrans
│   ├── topup.go              # POST /api/v1/topup → create QRIS
│   ├── dashboard.go          # User + Admin JSON endpoints
│   └── models_handler.go     # GET /api/v1/models
├── billing/
│   └── deduct.go             # Async batch deduction + background worker
├── Dockerfile                # Multi-stage → scratch (5MB binary)
├── docker-compose.yml        # app + postgres + redis
└── .env.example
```

### Core API Logic (Go)

```go
// handler/chat.go
func (h *ChatHandler) Handle(w http.ResponseWriter, r *http.Request) {
    // 1. Extract user from context (set by auth middleware)
    user := r.Context().Value("user").(*database.User)
    apiKey := r.Context().Value("api_key").(*database.APIKey)

    // 2. Parse OpenAI-compatible request body
    var req ChatCompletionRequest
    json.NewDecoder(r.Body).Decode(&req)

    // 3. Check Redis balance cache
    balance, _ := h.rdb.Get(r.Context(), balanceKey(user.ID)).Int64()
    if balance <= 0 {
        writeError(w, 402, "Insufficient balance. Please top up.", "insufficient_balance")
        return
    }

    // 4. Resolve model → provider
    entry, err := h.router.Resolve(req.Model)
    if err != nil {
        writeError(w, 404, err.Error(), "model_not_found")
        return
    }

    // 5. Stream response from provider back to client
    chunkChan := h.providers[entry.Provider].ChatCompletionStream(r.Context(), entry.ActualModel, req.Messages)

    // 6. Enqueue usage record for async batch deduction
    go func() {
        usage := collectUsage(chunkChan, entry)
        billing.EnqueueUsage(usage)
    }()

    // 7. Stream SSE to client
    streamResponse(w, chunkChan, entry)
}
```

---

## Provider Strategy

### Tier 1 — High Margin (50-80%)

| Provider | Models | Cost/1M | Your Price/1M |
|---|---|---|---|
| **Groq** | Llama 3 70B, Mixtral 8x7B, Gemma | $0.10-0.59 | Rp 5.000 (~$0.31) |
| **Together AI** | Llama 3, DeepSeek, Qwen | $0.10-0.50 | Rp 5.000 |
| **DeepSeek** | DeepSeek V4, V4 Flash | $0.14-0.50 | Rp 5.000-10.000 |

### Tier 2 — Mid Margin (30-50%)

| Provider | Models | Cost/1M | Your Price/1M |
|---|---|---|---|
| **OpenAI** | GPT-4o mini | $0.15 | Rp 5.000 (~$0.31) |
| **Anthropic** | Claude Haiku | $0.25 | Rp 5.000 |
| **Google** | Gemini Flash | $0.075 | Rp 3.000 |

### Tier 3 — Premium (Low Margin, High Demand)

| Provider | Models | Cost/1M | Your Price/1M |
|---|---|---|---|
| **OpenAI** | GPT-4o | $2.50-10.00 | Rp 100.000 |
| **Anthropic** | Claude Sonnet | $3.00-15.00 | Rp 100.000 |
| **Google** | Gemini Pro | $1.25-5.00 | Rp 75.000 |

### Smart Routing

```
User requests: "gpt-4o"
Your router:  Checks if user is on "auto" mode
              → If yes: routes to cheapest model that can handle the task
                (e.g., GPT-4o mini or Llama 3 70B for most tasks)
              → If user explicitly wants GPT-4o: routes to actual GPT-4o
              → User gets charged accordingly
```

---

## Competitor Analysis

### Direct Competitors

| Name | Models | IDR? | QRIS? | Min Top-Up | Your Edge |
|---|---|---|---|---|---|
| **9inference** | Chinese only | ✅ (TOKS) | ✅ | ~Rp 50K? | Western models, simpler pricing |
| **OpenRouter** | 200+ models | ❌ (USD) | ❌ | $1 | QRIS, IDR, Bahasa support |
| **Together AI** | Open models | ❌ (USD) | ❌ | $1 | QRIS, IDR, Bahasa support |
| **DeepSeek** | DeepSeek only | ❌ (USD) | ❌ | ~$0.50 | Multiple providers, QRIS |

### Competitor Deep-Dive: 9inference.cloud

[9inference.cloud](https://9inference.cloud/id/pricing) is the most relevant competitor — an AI API reseller targeting Indonesia with IDR pricing.

**Key facts:**
- Fully Indonesian-language site
- Uses **TOKS** system (1 TOKS = Rp 1.000 = US$0.0553)
- No subscription, no card needed
- OpenAI-compatible API
- **Focuses exclusively on Chinese models** — no OpenAI, Anthropic, or Google

**Their model pricing (per 1M tokens):**

| Model | Input | Output | Context |
|---|---|---|---|
| MiMo V2.5 Pro (Xiaomi) | Rp 1.000 | Rp 1.000 | 256K |
| MiniMax M3 | Rp 1.500 | Rp 2.000 | 1M |
| GLM-5.2 | Rp 1.900 | Rp 4.400 | 1M |
| Qwen 7 Plus (Alibaba) | Rp 2.000 | Rp 6.000 | 200K |
| Qwen3 Coder Next | Rp 2.000 | Rp 4.000 | 200K |
| DeepSeek V4 Flash | Rp 2.300 | Rp 4.000 | 1M |
| GLM 5.1 | Rp 2.300 | Rp 3.500 | 200K |
| DeepSeek V4 Pro | Rp 2.500 | Rp 4.000 | 1M |
| Kimi K2.7 Code | Rp 3.500 | Rp 6.000 | 250K |
| GLM 5.2 Fast | Rp 3.500 | Rp 8.000 | 1M |

**Their packages:** Offer 20M, 40M, 50M token packages (likely time-limited)

**Your advantages over 9inference:**
1. ✅ Western models (GPT-4o, Claude, Gemini) — they don't offer these
2. ✅ Lower entry point (Rp 5.000 vs ~Rp 50K+)
3. ✅ Direct Rp pricing (no TOKS conversion)
4. ✅ Smart model routing (they require manual model selection)
5. ✅ Also offer Chinese models as secondary option

---

## Marketing (Developer-Only Channels)

### No TikTok, No UMKM, No General Public

Focus 100% on **developer communities**:

| Channel | Why | Content |
|---|---|---|
| **Twitter/X** | Indonesian devs are active here | "Bikin AI app tanpa ribet kartu kredit. GPT-4, Claude, Gemini — bayar pakai QRIS." |
| **Telegram** | 10+ major Indonesian dev groups | Join discussions, offer free trials |
| **Discord** | Dev communities | Server for users |
| **GitHub** | Open source projects mention you | "Powered by your API" badges |
| **Medium/Dev.to** | Indonesian dev blogs | Tutorial: "Integrasi AI pake QRIS dalam 5 menit" |
| **Kampus** | Informatics/CS student groups | Partner with himpunan, offer student discounts |

### Positioning Statement

> *"Satu API key untuk GPT-4o, Claude, Gemini, DeepSeek, dan Llama. Bayar pakai QRIS. Rp 5.000 cukup untuk mulai."*

---

## Operations & Automation (Fully Autonomous)

| Component | Automation |
|---|---|
| Registration | Google OAuth → auto-create account + API key |
| Top-up → credit | Midtrans webhook → auto-update balance |
| API routing | Smart router selects cheapest provider |
| Token deduction | Real-time per-request |
| Low balance alert | Auto email when balance < 20% |
| Provider failover | Down provider → route to another automatically |
| Daily P&L report | Auto-generated email |
| Support | FAQ + AI triage bot (trained on docs) |

### What YOU Do (Minimal)

| Task | Frequency | Time |
|---|---|---|
| Approve refunds | ~1x/month | 10 min |
| Negotiate provider rates | Quarterly | 1 hr |
| Fix bugs / add models | As needed | 2-5 hrs/mo |
| Content & community | Weekly | 2 hrs |

---

## Financial Projections

### Startup Costs

| Item | IDR |
|---|---|
| Domain (.id) | Rp 200K/year |
| VPS (DigitalOcean $12/mo) | Rp 200K/mo |
| Midtrans setup | Free |
| NIB registration | Free |
| **Total** | **~Rp 400K** |

### Monthly Burn

| Item | IDR |
|---|---|
| VPS | Rp 200K |
| Domain (pro-rated) | Rp 17K |
| Midtrans fees (~3% of revenue) | Variable |
| **Total fixed** | **~Rp 217K/mo** |

### Revenue Projection (Conservative)

| Month | Users | Avg spend/user | Revenue (IDR) | Profit (IDR) |
|---|---|---|---|---|
| 1 | 20 | Rp 15K | Rp 300K | ~Rp 80K |
| 2 | 50 | Rp 25K | Rp 1.25M | ~Rp 1M |
| 3 | 100 | Rp 35K | Rp 3.5M | ~Rp 3.2M |
| 6 | 300 | Rp 50K | Rp 15M | ~Rp 14M |
| 12 | 700 | Rp 75K | Rp 52.5M | ~Rp 50M |

### Break-even: Month 1-2

---

## Risk Matrix

| Risk | Prob | Impact | Mitigation |
|---|---|---|---|
| Provider ToS restricts reselling | Low | High | Call it "unified API layer" not "reseller". Route through your own backend. |
| USD-IDR fluctuation | Medium | Medium | Peg prices in IDR with 10% buffer. Adjust quarterly. |
| Fraud / stolen API keys | Medium | High | Per-key spending cap (default Rp 1M). Rate limiting. Anomaly detection. |
| Provider account suspended | Low | Critical | Diversify across 5+ providers from day one. Auto-failover. |
| 9inference adds Western models | Medium | Medium | Differentiate on: lower min top-up, smart routing, developer community |
| Price war | Low | Medium | Focus on quality + support, not race-to-bottom pricing |

---

## First 30 Days Action Plan

| Day | Task |
|---|---|
| 1 | Register NIB via OSS (free, 30 min) |
| 2 | Apply for NPWP (online) |
| 3 | Sign up Midtrans → get SERVER_KEY |
| 4 | Buy domain (.id) |
| 5-12 | Build MVP: Go server (chi) + Midtrans + PostgreSQL + Redis |
| 13 | Deploy to VPS (DigitalOcean Singapore) |
| 14-16 | Full test: QRIS → top up → API call → deduct → check balance |
| 17 | Create Twitter/X account for the product |
| 18-20 | Write docs + FAQ in Bahasa Indonesia |
| 21 | Soft launch on Twitter + Telegram dev groups |
| 22-28 | Engage with devs, fix issues, iterate |
| 29-30 | Review metrics, add 2 more models, plan next sprint |

---

## Appendix: Useful Resources

### Indonesian Payment Gateways
- [Midtrans](https://midtrans.com) — recommended
- [Tripay](https://tripay.co.id) — lower fees
- [Xendit](https://xendit.co) — good for scale
- [Duitku](https://duitku.com) — alternative

### Business Registration
- [OSS-RBA](https://oss.go.id) — NIB registration (free)
- [Kominfo PSE](https://pse.kominfo.go.id) — for >1,000 users

### Hosting
- [DigitalOcean Singapore](https://digitalocean.com) — $12/mo droplet
- [Vultr Singapore](https://vultr.com) — $10/mo
- [Railway](https://railway.app) — easier deployment

### Domain
- [Niagahoster](https://niagahoster.co.id) — .id domains
- [Domainesia](https://domainesia.com) — .id domains
