# SSE Notifications — Implementation Plan

**Date:** 2026-07-09
**Goal:** Replace polling `GET /api/v1/notifications/me` (every 60s) with a persistent SSE connection.

---

## 1. Architecture: In-Memory Pub/Sub Broker

Add a `broker.go` file to `server-go/internal/notification/`:

- `Broker` struct with a `map[string][]chan SSEEvent` (userID → list of subscriber channels)
- `Subscribe(userID string) <-chan SSEEvent` — creates a buffered channel (buffer=64), returns it
- `Unsubscribe(userID string, ch <-chan SSEEvent)` — removes the channel
- `Publish(userID string, event SSEEvent)` — sends to all channels for that user (non-blocking, drop if full)
- `SSEEvent` type with `Type string` (e.g. "notification_created", "read_status_changed") and `Data interface{}`

Thread-safety via `sync.RWMutex`.

## 2. Files to Create/Modify

| File | Action |
|------|--------|
| `server-go/internal/notification/broker.go` | **CREATE** — In-memory pub/sub broker |
| `server-go/internal/notification/handler.go` | **MODIFY** — Add `StreamSSE` handler |
| `server-go/internal/notification/service.go` | **MODIFY** — Add broker field, publish on Create/MarkRead/MarkAllRead/ClearAll |
| `server-go/cmd/server/main.go` | **MODIFY** — Register SSE route, pass Broker to Service + Handler |
| `web/src/components/layout/NotificationBell.tsx` | **MODIFY** — Replace `setInterval` with `EventSource` |
| `web/src/lib/notifications.ts` | **MODIFY** — Add `subscribeToNotifications(url, onEvent)` SSE helper |
| `server-go/internal/notification/handler_test.go` | **MODIFY** — Update tests for new handler wiring |

## 3. SSE Handler (`StreamSSE`)

```go
// StreamSSE godoc
// @Summary  Stream notifications via SSE
// @Tags     notifications
// @Produce  text/event-stream
// @Security BearerAuth
// @Router   /notifications/stream [get]
func (h *Handler) StreamSSE(c *gin.Context) {
    userID, ok := getUserID(c)
    if !ok { c.JSON(http.StatusUnauthorized, ...); return }

    c.Header("Content-Type", "text/event-stream")
    c.Header("Cache-Control", "no-cache")
    c.Header("Connection", "keep-alive")

    // Initial snapshot
    result, _ := h.service.ListForUser(c.Request.Context(), userID, 50)
    // send as SSE event "init"

    // Subscribe to incremental updates
    ch := h.service.Subscribe(userID)
    defer h.service.Unsubscribe(userID, ch)

    c.Stream(func(w io.Writer) bool {
        select {
        case evt := <-ch:
            // write "event: notification\ndata: ...\n\n"
        case <-c.Request.Context().Done():
            return false
        }
        return true
    })
}
```

## 4. Service Changes

- Add `broker *Broker` field
- In `Create()` → after DB insert, call `broker.Publish(userID, SSEEvent{Type: "new", Data: notif})`
- In `MarkRead()` → after DB update, publish `"read"` event with notification ID
- In `MarkAllRead()` → publish `"all_read"` event
- In `ClearAll()` → publish `"cleared"` event

## 5. Frontend Changes

### `notifications.ts` — Add SSE helper

```typescript
export function subscribeToNotifications(
  onEvent: (event: MessageEvent) => void,
  onError?: () => void
): EventSource {
  const es = new EventSource('/api/v1/notifications/stream');
  es.addEventListener('notification', onEvent);
  if (onError) es.onerror = onError;
  return es;
}
```

### `NotificationBell.tsx` — Replace polling

```typescript
useEffect(() => {
  const es = subscribeToNotifications((event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'init' || data.type === 'update') {
      setNotifications(data.notifications);
      setUnread(data.unreadCount);
    }
    // handle incremental "new", "read", "cleared" events
  });
  return () => es.close();
}, []);
```

Keep `getNotifications()` for the initial fetch. Use SSE for real-time updates.

## 6. Route Registration

In `main.go`:
```go
notifGroup.GET("/stream", notifHandler.StreamSSE)
```

## 7. Test Updates

- Add a test for the broker (subscribe/publish/unsubscribe)
- Update `TestNotificationHandler` to wire the broker
- Add a test that verifies SSE sends initial snapshot

## 8. Reconnection Strategy

- `EventSource` auto-reconnects on connection loss
- On reconnect, the stream handler sends a fresh "init" event, so the UI catches up
- No custom retry logic needed