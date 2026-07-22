---
created: 2026-07-21
tags: [business, ai, indonesia, golang, implementation]
---

# Go Implementation Guide — Token Reseller API

## Setup Development Environment

### Prerequisites

```bash
# Install Go (Termux)
pkg install golang

# Verify
go version
# go version go1.22.x linux/arm64

# Install Docker (optional, for PostgreSQL + Redis)
pkg install docker
```

### Project Initialization

```bash
mkdir tokenapi && cd tokenapi
go mod init tokenapi
```

---

## Package Dependencies

```go
// go.mod
module tokenapi

go 1.22

require (
    github.com/go-chi/chi/v5          // HTTP router
    github.com/go-chi/cors             // CORS middleware
    github.com/google/uuid             // UUID generation
    github.com/jackc/pgx/v5            // PostgreSQL driver
    github.com/redis/go-redis/v9       // Redis client
    github.com/joho/godotenv           // .env loader
)
```

---

## Key Implementation Patterns

### 1. Middleware Pattern (chi)

```go
func AuthMiddleware(db *pgxpool.Pool, rdb *redis.Client) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            // Extract Bearer token
            // Validate + attach user to context
            ctx := context.WithValue(r.Context(), "user", user)
            next.ServeHTTP(w, r.WithContext(ctx))
        })
    }
}
```

### 2. Streaming SSE Pattern

```go
func handleStream(w http.ResponseWriter, chunkChan <-chan provider.StreamChunk) {
    flusher, ok := w.(http.Flusher)
    if !ok {
        http.Error(w, "streaming unsupported", 500)
        return
    }

    w.Header().Set("Content-Type", "text/event-stream")
    w.Header().Set("Cache-Control", "no-cache")
    w.Header().Set("Connection", "keep-alive")

    for chunk := range chunkChan {
        if chunk.Error != nil {
            break
        }
        fmt.Fprintf(w, "data: %s\n\n", chunk.Data)
        flusher.Flush()
    }
    fmt.Fprintf(w, "data: [DONE]\n\n")
    flusher.Flush()
}
```

### 3. OpenAI-Compatible Error Format

```go
type APIError struct {
    Error struct {
        Message string `json:"message"`
        Type    string `json:"type"`
        Code    string `json:"code,omitempty"`
    } `json:"error"`
}

func writeError(w http.ResponseWriter, status int, msg, errType string) {
    err := APIError{}
    err.Error.Message = msg
    err.Error.Type = errType
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    json.NewEncoder(w).Encode(err)
}

// Insufficient balance → 402 Payment Required
writeError(w, 402, "Insufficient balance. Please top up.", "insufficient_balance")

// Model not found → 404
writeError(w, 404, "Model not found. See /api/v1/models for available models.", "model_not_found")

// API key invalid → 401
writeError(w, 401, "Invalid API key.", "invalid_api_key")
```

### 4. OpenAI-Compatible Request/Response

```go
// Request — same format as OpenAI
type ChatCompletionRequest struct {
    Model       string    `json:"model"`
    Messages    []Message `json:"messages"`
    Stream      bool      `json:"stream"`
    Temperature *float64  `json:"temperature,omitempty"`
    MaxTokens   *int      `json:"max_tokens,omitempty"`
}

// Response (non-streaming) — same format as OpenAI
type ChatCompletionResponse struct {
    ID      string   `json:"id"`
    Object  string   `json:"object"`
    Created int64    `json:"created"`
    Model   string   `json:"model"`
    Choices []Choice `json:"choices"`
    Usage   Usage    `json:"usage"`
}

// Stream chunk — same format as OpenAI
type StreamChoice struct {
    Index        int     `json:"index"`
    Delta        Message `json:"delta"`
    FinishReason *string `json:"finish_reason"`
}
```

### 5. Async Worker Pattern

```go
func StartUsageWorker(ctx context.Context, db *pgxpool.Pool, rdb *redis.Client) {
    ticker := time.NewTicker(5 * time.Second)
    defer ticker.Stop()

    batch := make([]UsageRecord, 0, 100)

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
```

---

## Cost Calculation

```go
const TOKEN_PER_IDR int64 = 1 // 1 token = 1 IDR (simplified)
// Alternatively: 1 IDR = 10 tokens, etc.

func CalculateCost(modelCostPer1M int64, promptTokens, completionTokens int) int64 {
    totalTokens := int64(promptTokens + completionTokens)
    return (modelCostPer1M * totalTokens) / 1_000_000
}

// Example:
// Model: gpt-4o → Rp 100,000/1M tokens
// Usage: 500 prompt + 300 completion = 800 tokens
// Cost: (100000 * 800) / 1000000 = 80 IDR
```

---

## Redis Key Schema

```go
// Balance cache
func balanceKey(userID int64) string {
    return fmt.Sprintf("balance:%d", userID)
}

// API key → user mapping cache
func apiKeyHash(hash string) string {
    return fmt.Sprintf("apikey:%s", hash)
}

// Rate limiter
func rateLimitKey(userID int64) string {
    return fmt.Sprintf("ratelimit:%d", userID)
}

// TTL: 1 hour for API key cache, 5 minutes for rate limit
```

---

## Midtrans Signature Verification

```go
func verifyMidtransSignature(body []byte, signature, orderID, statusCode, grossAmount, serverKey string) bool {
    stringToSign := orderID + statusCode + grossAmount + serverKey
    hash := hmacSHA512([]byte(serverKey), []byte(stringToSign))
    computed := hex.EncodeToString(hash)
    return hmac.Equal([]byte(computed), []byte(signature))
}
```

---

## Docker Deployment

```dockerfile
# Dockerfile — multi-stage build
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o server .

FROM alpine:3.19
RUN apk add --no-cache ca-certificates
COPY --from=builder /app/server /server
EXPOSE 8080
CMD ["/server"]
```

```yaml
# docker-compose.yml
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

## Deployment Steps

```bash
# 1. Clone/copy project to VPS
# 2. Create .env file with real keys
# 3. Deploy
docker-compose up -d

# 4. Check logs
docker-compose logs -f app

# 5. Test health
curl http://localhost:8080/health

# 6. Test API
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer <api_key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"groq/llama-3-70b","messages":[{"role":"user","content":"Hello"}],"stream":false}'
```

---

## Admin Actions

```bash
# Check system revenue
curl -H "Authorization: Bearer <admin_key>" http://localhost:8080/api/admin/revenue

# List all users
curl -H "Authorization: Bearer <admin_key>" http://localhost:8080/api/admin/users

# Manually top-up user (for testing)
curl -X POST -H "Authorization: Bearer <admin_key>" \
  -H "Content-Type: application/json" \
  -d '{"user_id":1,"tokens":100000}' \
  http://localhost:8080/api/admin/topup
```

---

## File Generation Order

Generate files in this order (dependencies first):

1. `config/config.go`
2. `database/models.go`
3. `database/postgres.go`
4. `database/redis.go`
5. `provider/provider.go` (interface)
6. `provider/openai.go`
7. `provider/anthropic.go`
8. `provider/router.go`
9. `middleware/auth.go`
10. `billing/deduct.go`
11. `handler/models_handler.go`
12. `handler/chat.go`
13. `handler/webhook.go`
14. `handler/topup.go`
15. `handler/dashboard.go`
16. `main.go`
17. `Dockerfile`
18. `docker-compose.yml`
19. `.env.example`
