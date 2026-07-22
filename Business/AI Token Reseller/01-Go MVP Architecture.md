---
created: 2026-07-21
updated: 2026-07-21
tags: [business, ai, indonesia, golang, architecture, final]
---

# Go MVP Architecture — Token Reseller API

## Overview

Token reseller API for the Indonesian market. Users sign up, buy tokens via QRIS (IDR), get an OpenAI-compatible API key, and call AI models across multiple providers.

**Value proposition**: Access GPT-4, Gemini, Llama — pay with QRIS. No international card needed. No USD conversion.

**Business model**: Buy tokens at wholesale, sell at markup in IDR. Blended margin ~25-30%.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | **Go 1.22** (chi router, pgx, go-redis) |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Async Queue | In-memory buffered channel + background goroutine |
| Payment | Midtrans Snap API (QRIS) |
| Frontend | **React + Vite** (embedded in Go binary via embed.FS) |
| Deployment | Monorepo, single binary, Docker Compose |

---

## Architecture Decisions

| Decision | Choice | Rationale |
|---|---|---|
| User selects provider | `provider/model-name` format | Transparent pricing, user control |
| Token deduction | Async batch (buffered channel → flush every 5s or 100 records) | Fast requests, no DB wait |
| User registration | Email/password + Google OAuth | Flexibility for Indonesian users |
| Pricing model | **Per-model pricing** (not tiers) | Tiered pricing loses money on premium models |
| Minimum top-up | **Rp 10,000** | Payment fees make smaller top-ups uneconomical (43.6% at Rp 5,000) |
| Dashboard | React SPA served by Go backend | Single binary, no CORS, no nginx needed for MVP |
| Deployment | Multi-stage Dockerfile (build React → build Go) | Single ~20MB binary |

---

## MVP Model Catalog (Phase 1 — 6 Profitable Models)

Based on business model research, start with only these models. Add more after launch.

| Model ID | Display Name | Provider | Cost/1M IDR | Sell/1M IDR | Margin |
|---|---|---|---|---|---|
| `groq/llama-3-8b` | Llama 3 8B | Groq | Rp 1,000 | **Rp 3,000** | **67%** |
| `google/gemini-2-flash` | Gemini Flash | Google | Rp 3,400 | **Rp 5,000** | **32%** |
| `groq/mixtral-8x7b` | Mixtral 8x7B | Groq | Rp 4,800 | **Rp 6,000** | **20%** |
| `openai/gpt-4o-mini` | GPT-4o Mini | OpenAI | Rp 6,700 | **Rp 10,000** | **33%** |
| `google/gemini-2-pro` | Gemini Pro | Google | Rp 56,000 | **Rp 75,000** | **25%** |
| `openai/gpt-4o` | GPT-4o | OpenAI | Rp 112,000 | **Rp 150,000** | **25%** |

**Aliases** (shorthand → default provider):
- `gpt-4o-mini` → `openai/gpt-4o-mini`
- `gpt-4o` → `openai/gpt-4o`
- `llama` → `groq/llama-3-8b`
- `gemini-flash` → `google/gemini-2-flash`
- `gemini-pro` → `google/gemini-2-pro`

### Future Models (Phase 2+)

| Model ID | Display Name | Provider | Sell/1M IDR | Margin | Add When |
|---|---|---|---|---|---|
| `groq/llama-3-70b` | Llama 3 70B | Groq | Rp 15,000 | 20% | After launch |
| `deepseek/deepseek-v4-flash` | DeepSeek V4 Flash | DeepSeek | Rp 8,000 | 16% | After launch |
| `deepseek/deepseek-v4` | DeepSeek V4 | DeepSeek | Rp 25,000 | 10% | After launch |
| `anthropic/claude-haiku-3` | Claude Haiku | Anthropic | Rp 50,000 | 14% | After launch |
| `anthropic/claude-sonnet-4` | Claude Sonnet | Anthropic | Rp 200,000 | 20% | After launch |
| `openai/o1-mini` | O1 Mini | OpenAI | Rp 250,000 | 69% | After launch |

---

## Top-Up Amounts

| Amount | Payment Fee | Effective Rate | Notes |
|---|---|---|---|
| Rp 10,000 | ~Rp 2,360 (23.6%) | High but acceptable for trial | Good entry point |
| Rp 25,000 | ~Rp 2,900 (11.6%) | Reasonable | Recommended minimum for marketing |
| Rp 100,000 | ~Rp 5,600 (5.6%) | Good | Offer bonus +10% tokens |
| Rp 500,000 | ~Rp 20,000 (4.0%) | Excellent | Offer bonus +25% tokens |

**Backend stores balance in tokens** (1 token = 1 IDR equivalent). When user spends, convert model cost from IDR to tokens.

---

## Request Lifecycle

```
Client → POST /v1/chat/completions
  │
  ├─ 1. middleware/auth.go
  │     Extract "Bearer <key>" from header
  │     Hash key → lookup Redis cache
  │     If miss → lookup PostgreSQL
  │     Attach User + APIKey to context
  │
  ├─ 2. handler/chat.go
  │     Parse OpenAI-compatible JSON body
  │     Validate: model, messages, stream flag
  │
  ├─ 3. provider/router.go
  │     Look up model in catalog → get provider + sell price
  │     "openai/gpt-4o" → Provider=openai, Model=gpt-4o, Cost=Rp 150.000/1M
  │
  ├─ 4. provider/openai.go
  │     Convert request to OpenAI format
  │     HTTP call with timeout
  │     Stream SSE or return JSON
  │
  ├─ 5. Redis balance check
  │     Balance sufficient for estimated tokens? → proceed
  │     Balance empty? → 402 Payment Required
  │
  ├─ 6. Stream response to client
  │
  └─ 7. billing/deduct.go
        Enqueue usage record to buffered channel
        Background worker flushes batch every 5s or 100 records
```

---

## File Structure

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
│   └── auth.go               # API key + session auth
├── provider/
│   ├── provider.go           # Interface + shared types
│   ├── openai.go             # OpenAI adapter (also used by Groq)
│   └── router.go             # Model catalog + resolution (hardcoded MVP)
├── handler/
│   ├── chat.go               # POST /v1/chat/completions
│   ├── webhook.go            # POST /api/webhook/midtrans
│   ├── topup.go              # POST /api/v1/topup
│   ├── auth_handler.go       # Register, login, Google OAuth
│   ├── dashboard_handler.go  # User + Admin JSON APIs
│   └── models_handler.go     # GET /api/v1/models
├── billing/
│   └── deduct.go             # Async batch worker + cost calculation
├── web/                       # React SPA (Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AdminPanel.jsx
│   │   ├── components/
│   │   │   ├── ApiKeysList.jsx
│   │   │   ├── UsageChart.jsx
│   │   │   ├── BalanceWidget.jsx
│   │   │   ├── ModelCatalog.jsx  ← Shows per-model prices
│   │   │   └── TopUpButton.jsx   ← Min Rp 10,000
│   │   ├── hooks/
│   │   │   └── useApi.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── Dockerfile                 # Multi-stage: build React → build Go → scratch
├── docker-compose.yml
└── .env.example
```

---

## API Routes

### Authentication (Public)

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Register with email + password |
| POST | `/api/auth/login` | Login, returns session token |
| GET | `/api/auth/google` | Redirect to Google OAuth |
| GET | `/api/auth/google/callback` | OAuth callback, returns session token |
| POST | `/api/auth/logout` | Invalidate session |

### User API (requires API key or session cookie)

| Method | Path | Description |
|---|---|---|
| POST | `/v1/chat/completions` | Proxy to AI provider |
| GET | `/api/v1/models` | List models + prices in IDR |
| GET | `/api/v1/me` | Current user info |
| GET | `/api/v1/balance` | Check token balance |
| POST | `/api/v1/topup` | Create QRIS top-up (min Rp 10,000) |
| GET | `/api/v1/keys` | List user's API keys |
| POST | `/api/v1/keys` | Create new API key |
| DELETE | `/api/v1/keys/{id}` | Revoke API key |
| GET | `/api/v1/usage` | Paginated usage history |

### Admin API (requires Admin-Key header)

| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/revenue` | Revenue summary |
| GET | `/api/admin/usage` | Usage trends by model |
| POST | `/api/admin/refund` | Manually credit a user |

### Webhook

| Method | Path | Description |
|---|---|---|
| POST | `/api/webhook/midtrans` | Midtrans payment notification |

### Frontend (SPA)

| Method | Path | Description |
|---|---|---|
| GET | `/` | React SPA entry point |
| GET | `/dashboard` | User dashboard (requires auth) |
| GET | `/admin` | Admin panel (requires admin role) |
| GET | `/*` | All other paths → serve index.html |

---

## Database Schema

```sql
users (
  id            BIGSERIAL PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  name          TEXT NOT NULL DEFAULT '',
  google_id     TEXT UNIQUE,
  role          TEXT NOT NULL DEFAULT 'user',
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

sessions (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT REFERENCES users(id),
  token_hash    TEXT UNIQUE NOT NULL,
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

api_keys (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT REFERENCES users(id),
  key_hash      TEXT UNIQUE NOT NULL,
  key_prefix    TEXT NOT NULL,
  name          TEXT DEFAULT 'default',
  is_active     BOOLEAN DEFAULT true,
  monthly_cap   BIGINT DEFAULT 1000000,
  monthly_used  BIGINT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  expires_at    TIMESTAMPTZ
);

balances (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT UNIQUE REFERENCES users(id),
  balance_tokens BIGINT DEFAULT 0,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

transactions (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT REFERENCES users(id),
  amount_idr    BIGINT DEFAULT 0,
  tokens        BIGINT DEFAULT 0,
  type          TEXT DEFAULT 'topup',
  status        TEXT DEFAULT 'pending',
  reference     TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

usage_logs (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT REFERENCES users(id),
  api_key_id      BIGINT REFERENCES api_keys(id),
  model           TEXT NOT NULL,
  provider        TEXT NOT NULL,
  prompt_tokens   INT DEFAULT 0,
  completion_tokens INT DEFAULT 0,
  cost_tokens     BIGINT DEFAULT 0,
  cost_idr        BIGINT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Model Router (Simplified MVP)

```go
// provider/router.go

type ModelEntry struct {
    ID           string // e.g. "openai/gpt-4o"
    DisplayName  string
    Provider     string // e.g. "openai"
    ActualModel  string // e.g. "gpt-4o"
    SellPrice1M  int64  // in IDR — THIS is what user pays
    BuyPrice1M   int64  // in IDR — what it costs us
}

// Hardcoded catalog for MVP. In future, store in DB.
var catalog = []ModelEntry{
    {ID: "groq/llama-3-8b",        DisplayName: "Llama 3 8B",   Provider: "groq",   ActualModel: "llama3-8b-8192",     SellPrice1M: 3000,   BuyPrice1M: 1000},
    {ID: "google/gemini-2-flash",  DisplayName: "Gemini Flash",  Provider: "google", ActualModel: "gemini-2.0-flash",  SellPrice1M: 5000,   BuyPrice1M: 3400},
    {ID: "groq/mixtral-8x7b",     DisplayName: "Mixtral 8x7B",  Provider: "groq",   ActualModel: "mixtral-8x7b-32768", SellPrice1M: 6000,   BuyPrice1M: 4800},
    {ID: "openai/gpt-4o-mini",    DisplayName: "GPT-4o Mini",   Provider: "openai", ActualModel: "gpt-4o-mini",        SellPrice1M: 10000,  BuyPrice1M: 6700},
    {ID: "google/gemini-2-pro",   DisplayName: "Gemini Pro",    Provider: "google", ActualModel: "gemini-2.0-pro",     SellPrice1M: 75000,  BuyPrice1M: 56000},
    {ID: "openai/gpt-4o",         DisplayName: "GPT-4o",        Provider: "openai", ActualModel: "gpt-4o",             SellPrice1M: 150000, BuyPrice1M: 112000},
}

func ResolveModel(input string) (*ModelEntry, error) {
    // Check exact match first
    for _, m := range catalog {
        if m.ID == input {
            return &m, nil
        }
    }
    // Check alias
    switch input {
    case "gpt-4o-mini": return findByID("openai/gpt-4o-mini")
    case "gpt-4o":      return findByID("openai/gpt-4o")
    case "llama":       return findByID("groq/llama-3-8b")
    case "gemini-flash": return findByID("google/gemini-2-flash")
    case "gemini-pro":  return findByID("google/gemini-2-pro")
    }
    return nil, fmt.Errorf("model %s not found", input)
}
```

---

## Cost Calculation

```go
// billing/deduct.go
func CalculateCost(sellPricePer1M int64, promptTokens, completionTokens int) int64 {
    totalTokens := int64(promptTokens + completionTokens)
    return (sellPricePer1M * totalTokens) / 1_000_000
}

// Example:
// Model: GPT-4o Mini → Rp 10,000/1M tokens
// Usage: 500 prompt + 300 completion = 800 tokens
// Cost: (10000 * 800) / 1000000 = 8 IDR
```

---

## Midtrans Integration

### Top-Up Flow

```
User clicks "Top Up" in React dashboard → POST /api/v1/topup {amount: 25000}
  → Validate amount >= 10000
  → Create transaction (status: pending)
  → Call Midtrans Snap API:
      POST https://app.midtrans.com/snap/v1/transactions
      {
        transaction_details: {
          order_id: "TOPUP-{user_id}-{timestamp}",
          gross_amount: 25000
        },
        payment_type: "qris"
      }
  → Return {qr_url, transaction_id} to React
  → React displays QR code
  → User scans with GoPay/OVO/DANA/etc
```

### Webhook Flow

```
Midtrans → POST /api/webhook/midtrans
  Headers: X-Midtrans-Signature, X-Midtrans-Timestamp
  Body: {order_id, transaction_status, gross_amount, signature_key, ...}

  1. Verify HMAC-SHA512 signature
  2. If status == "settlement":
     - Extract user_id from order_id
     - tokens = gross_amount  (1:1 mapping, 1 IDR = 1 token)
     - INSERT transaction (completed)
     - UPDATE balance
     - SET Redis cache
  3. Return 200 OK
```

---

## Deployment

### Dockerfile

```dockerfile
FROM node:20-alpine AS react-builder
WORKDIR /web
COPY web/package.json web/package-lock.json ./
RUN npm ci
COPY web/ .
RUN npm run build

FROM golang:1.22-alpine AS go-builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
COPY --from=react-builder /web/dist ./web/dist
RUN CGO_ENABLED=0 go build -o server .

FROM alpine:3.19
RUN apk add --no-cache ca-certificates
COPY --from=go-builder /app/server /server
EXPOSE 8080
CMD ["/server"]
```

### docker-compose.yml

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8080:8080"
    env_file: .env
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: tokenapi
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

volumes:
  pgdata:
```

---

## Implementation Order

### Phase 1 — Go Backend (7-10 days)
1. Project scaffold: go.mod, config, database connection, migrations
2. Provider interface + OpenAI adapter (also covers Groq — same API format)
3. Google Gemini adapter
4. Router (hardcoded MVP catalog with per-model pricing)
5. Auth middleware + registration/login endpoints
6. Chat handler (core proxy endpoint)
7. Billing (async worker, cost calculation)
8. Midtrans webhook + top-up endpoint (min Rp 10,000 validation)
9. Dashboard JSON APIs (keys, balance, usage, admin)

### Phase 2 — React Frontend (3-5 days)
1. Vite scaffold, routing, API client hook
2. Login/register pages
3. Dashboard: balance, model catalog with prices, API keys, usage chart
4. Admin panel: users, revenue, trends
5. Top-up modal with QR code display

### Phase 3 — Polish & Deploy (2 days)
1. Error handling edge cases
2. Rate limiting
3. Dockerfile multi-stage
4. Deploy to VPS
5. Test full flow: register → top-up → call API → check usage
