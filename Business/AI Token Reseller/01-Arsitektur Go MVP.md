---
created: 2026-07-21
tags: [business, ai, indonesia, golang, architecture]
---

# Arsitektur Go MVP — Token Reseller API

## Ringkasan

Token reseller API untuk pasar Indonesia. Pengguna bayar pakai QRIS (IDR), mendapat API key, bisa pilih sendiri provider/model yang ingin dipakai.

**Tech stack**: Go + PostgreSQL + Redis + Midtrans

---

## Tiga Keputusan Arsitektur Utama

### 1. Pengguna Memilih Provider

Model name format: `provider/nama-model`

```
"openai/gpt-4o"           → GPT-4o via OpenAI
"anthropic/claude-sonnet" → Claude via Anthropic
"groq/llama-3-70b"        → Llama via Groq
"gpt-4o"                  → Shorthand, resolve ke default provider
"auto"                    → Smart routing (termurah yang capable)
```

Users dapat lihat semua model + harga via `GET /api/v1/models`.

### 2. Async Batch Token Deduction

```
Request masuk
  → Cek balance di Redis (fast path)
  → Jika cukup: izinkan request, stream response
  → Kirim usage record ke buffered channel
  ↓
[Background worker goroutine]
  ← Baca dari channel tiap 5 detik atau 100 record
  ← Batch INSERT ke PostgreSQL
  ← Batch UPDATE balance
```

**Kenapa async?** Request gak perlu nunggu DB write. Balance update delay max 5 detik.

**Anti-abuse**: Redis balance = 0 → langsung tolak. Worker cuma sinkronisasi ke PostgreSQL.

### 3. Dashboard Monitoring

**User Dashboard** (end user):
- Lihat API keys (buat/revoke)
- Cek balance
- Riwayat usage
- Katalog model + harga
- Top-up via QRIS

**Admin Dashboard** (you):
- Semua users
- Total revenue
- Usage per user
- Monthly trends
- Refund management

---

## System Architecture

```
┌────────────┐    ┌──────────────────────────────────┐    ┌─────────────┐
│  Client    │───▶│         Go API Server            │───▶│ AI Provider │
│  (curl/    │    │  chi router → middleware → handler │   │ (OpenAI,    │
│   SDK)     │    │                                  │   │ Anthropic,  │
└────────────┘    │  ┌─────────────┐ ┌─────────────┐ │   │ Groq, etc)  │
                  │  │  Provider   │ │  Billing    │ │   └─────────────┘
                  │  │  Layer      │ │  Layer      │ │
                  │  │  - openai   │ │  - async    │ │
                  │  │  - anthropic│ │    worker   │ │
                  │  │  - groq     │ │  - cost     │ │
                  │  │  - router   │ │    calc     │ │
                  │  └─────────────┘ └─────────────┘ │
                  └──────────────────────────────────┘
                            │              │
                            ▼              ▼
                     ┌──────────┐   ┌──────────┐
                     │PostgreSQL│   │  Redis   │
                     │ users    │   │ balance  │
                     │ balances │   │ cache    │
                     │ txns     │   │ rate     │
                     │ usage    │   │ limits   │
                     └──────────┘   └──────────┘
```

---

## Request Lifecycle

```
1. Client → POST /v1/chat/completions
2. middleware/auth.go
   - Extract "Bearer <key>" from header
   - Hash key → lookup Redis cache (fast)
   - If miss → lookup PostgreSQL
   - Attach User + APIKey ke context
3. handler/chat.go
   - Parse JSON body
   - Validate model, messages, stream
4. provider/router.go
   - "openai/gpt-4o" → Provider=openai, Model=gpt-4o, Cost=Rp 100.000/1M
   - "auto" → smart route ke termurah
5. provider/openai.go
   - Convert ke format OpenAI API
   - HTTP call dengan timeout
   - Handle streaming (SSE) atau non-streaming
6. Redis check balance
   - Balance cukup? → proceed
   - Balance habis? → 402 Payment Required
7. Streaming response ke client
8. Enqueue usage ke channel
9. Background worker batch write ke PostgreSQL
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
│   ├── redis.go              # Redis connection + cache
│   └── models.go             # DB structs
├── middleware/
│   └── auth.go               # API key validation
├── provider/
│   ├── provider.go           # Interface + shared types
│   ├── openai.go             # OpenAI adapter
│   ├── anthropic.go          # Anthropic adapter
│   └── router.go             # Model catalog + resolution
├── handler/
│   ├── chat.go               # POST /v1/chat/completions
│   ├── webhook.go            # POST /api/webhook/midtrans
│   ├── topup.go              # POST /api/v1/topup
│   ├── dashboard.go          # User + Admin endpoints
│   └── models_handler.go     # GET /api/v1/models
├── billing/
│   └── deduct.go             # Async batch deduction worker
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

---

## Model Catalog

| Format | Display Name | Provider | Biaya/1M IDR | Biaya/1M USD |
|---|---|---|---|---|
| `openai/gpt-4o` | GPT-4o | OpenAI | Rp 100.000 | ~$6.25 |
| `openai/gpt-4o-mini` | GPT-4o Mini | OpenAI | Rp 10.000 | ~$0.63 |
| `openai/o1-mini` | O1 Mini | OpenAI | Rp 200.000 | ~$12.50 |
| `anthropic/claude-sonnet-4` | Claude Sonnet | Anthropic | Rp 100.000 | ~$6.25 |
| `anthropic/claude-haiku-3` | Claude Haiku | Anthropic | Rp 10.000 | ~$0.63 |
| `groq/llama-3-70b` | Llama 3 70B | Groq | Rp 5.000 | ~$0.31 |
| `groq/llama-3-8b` | Llama 3 8B | Groq | Rp 1.000 | ~$0.06 |
| `groq/mixtral-8x7b` | Mixtral 8x7B | Groq | Rp 5.000 | ~$0.31 |
| `deepseek/deepseek-v4` | DeepSeek V4 | DeepSeek | Rp 10.000 | ~$0.63 |
| `deepseek/deepseek-v4-flash` | DeepSeek V4 Flash | DeepSeek | Rp 5.000 | ~$0.31 |
| `google/gemini-2-flash` | Gemini 2 Flash | Google | Rp 3.000 | ~$0.19 |
| `google/gemini-2-pro` | Gemini 2 Pro | Google | Rp 75.000 | ~$4.69 |

**Aliases** (shorthand → resolve ke default provider):
- `gpt-4o` → `openai/gpt-4o`
- `claude-sonnet` → `anthropic/claude-sonnet-4`
- `llama` → `groq/llama-3-70b`
- `deepseek` → `deepseek/deepseek-v4`
- `gemini-pro` → `google/gemini-2-pro`

---

## API Routes

```
PUBLIC (no auth required):
  GET  /health                Health check

USER API (API key required):
  POST /v1/chat/completions   Proxy ke AI provider
  GET  /api/v1/models         Daftar model + harga
  GET  /api/v1/me             Info user
  GET  /api/v1/balance        Cek saldo
  POST /api/v1/topup          Buat QRIS top-up
  GET  /api/v1/keys           Daftar API keys
  POST /api/v1/keys           Buat API key baru
  DELETE /api/v1/keys/:id     Revoke API key
  GET  /api/v1/usage          Riwayat pemakaian

ADMIN API (Admin-Key required):
  GET  /api/admin/users       Semua users
  GET  /api/admin/revenue     Total revenue
  GET  /api/admin/usage       Tren pemakaian
  POST /api/admin/refund      Refund manual

WEBHOOK (Midtrans):
  POST /api/webhook/midtrans  Notifikasi pembayaran

DASHBOARD (HTML):
  GET  /admin                 Admin dashboard page
  GET  /dashboard             User dashboard page
```

---

## Async Batch Worker Detail

```go
// billing/deduct.go

type UsageRecord struct {
    UserID          int64
    APIKeyID        int64
    Model           string
    Provider        string
    PromptTokens    int
    CompletionTokens int
    CostTokens      int64
    CostIDR         int64
}

var usageCh = make(chan UsageRecord, 10000) // buffered channel

func EnqueueUsage(record UsageRecord) {
    select {
    case usageCh <- record:
    default:
        log.Println("[billing] channel full, dropping record")
        // fallback: write langsung ke DB
    }
}

func StartWorker(ctx context.Context, db *pgxpool.Pool, rdb *redis.Client) {
    ticker := time.NewTicker(5 * time.Second)
    var batch []UsageRecord

    for {
        select {
        case <-ctx.Done():
            flushBatch(db, rdb, batch)
            return
        case record := <-usageCh:
            batch = append(batch, record)
            if len(batch) >= 100 {
                flushBatch(db, rdb, batch)
                batch = batch[:0]
            }
        case <-ticker.C:
            if len(batch) > 0 {
                flushBatch(db, rdb, batch)
                batch = batch[:0]
            }
        }
    }
}

func flushBatch(db *pgxpool.Pool, rdb *redis.Client, records []UsageRecord) {
    // 1. Batch INSERT usage_logs
    copyFromUsageLogs(db, records)

    // 2. Batch UPDATE balances
    //    SUM cost per user → DECRBY di PostgreSQL
    for userID, totalCost := range aggregateCost(records) {
        updateBalance(db, userID, -totalCost)
        // sync Redis
        rdb.DecrBy(ctx, balanceKey(userID), int64(totalCost))
    }
}
```

---

## Midtrans Webhook Flow

```
Midtrans → POST /api/webhook/midtrans
  Headers: X-Midtrans-Signature, X-Midtrans-Timestamp
  Body: {order_id, transaction_status, gross_amount, ...}

1. Verify signature:
   - String to sign: order_id + status_code + gross_amount + server_key
   - HMAC SHA512 → cocokkan dengan signature header

2. If transaction_status == "settlement":
   - Cari user via order_id prefix (e.g., "TOPUP-{user_id}-{uuid}")
   - Convert IDR → tokens: amount_idr * TOKEN_PER_IDR
   - INSERT transaction (status: completed)
   - UPDATE balance (add tokens)
   - Sync Redis balance

3. Return 200 OK
```

---

## Provider Interface

```go
type Provider interface {
    Name() string
    ChatCompletion(ctx context.Context, req *ChatRequest) (*ChatResponse, error)
    ChatCompletionStream(ctx context.Context, req *ChatRequest) (<-chan StreamChunk, error)
}

type ChatRequest struct {
    Model       string
    Messages    []Message
    Stream      bool
    Temperature float64
    MaxTokens   int
}

type ChatResponse struct {
    ID      string
    Model   string
    Choices []Choice
    Usage   Usage
}

type StreamChunk struct {
    Data  []byte
    Error error
}

type Message struct {
    Role    string    `json:"role"`
    Content string    `json:"content"`
}

type Choice struct {
    Index        int     `json:"index"`
    Message      Message `json:"message"`
    FinishReason string  `json:"finish_reason"`
}

type Usage struct {
    PromptTokens     int `json:"prompt_tokens"`
    CompletionTokens int `json:"completion_tokens"`
    TotalTokens      int `json:"total_tokens"`
}
```

---

## Top-Up Flow

```
User → POST /api/v1/topup {amount: 25000}
  → Create transaction (status: pending)
  → Call Midtrans Snap API:
      {
        transaction_details: {
          order_id: "TOPUP-{user_id}-{timestamp}",
          gross_amount: 25000
        },
        payment_type: "qris"
      }
  → Midtrans returns QRIS URL + QR code image
  → Return to user: {qr_url, transaction_id}

User scans QRIS → pays via GoPay/OVO/etc
  → Midtrans sends webhook → balance updated
```

---

## Database Schema

```sql
users (
  id            BIGSERIAL PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

api_keys (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT REFERENCES users(id),
  key_hash      TEXT UNIQUE NOT NULL,
  key_prefix    TEXT NOT NULL,  -- first 8 chars for display
  name          TEXT DEFAULT 'default',
  is_active     BOOLEAN DEFAULT true,
  monthly_cap   BIGINT DEFAULT 1000000,  -- max tokens per month
  monthly_used  BIGINT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  expires_at    TIMESTAMPTZ
);

balances (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT UNIQUE REFERENCES users(id),
  balance_idr   BIGINT DEFAULT 0,    -- unused, use balance_tokens
  balance_tokens BIGINT DEFAULT 0,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

transactions (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT REFERENCES users(id),
  amount_idr    BIGINT DEFAULT 0,
  tokens        BIGINT DEFAULT 0,
  type          TEXT DEFAULT 'topup',   -- topup, usage, refund
  status        TEXT DEFAULT 'pending', -- pending, completed, failed
  reference     TEXT,                    -- order_id from Midtrans
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

usage_logs (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT REFERENCES users(id),
  api_key_id    BIGINT REFERENCES api_keys(id),
  model         TEXT NOT NULL,
  provider      TEXT NOT NULL,
  prompt_tokens  INT DEFAULT 0,
  completion_tokens INT DEFAULT 0,
  cost_tokens   BIGINT DEFAULT 0,
  cost_idr      BIGINT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```
