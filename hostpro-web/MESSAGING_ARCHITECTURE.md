# HostPro Unified Messaging Architecture

## System Design

### High-Level Architecture

```
┌────────────────────────────────────────────────────────┐
│                    Frontend Layer                      │
│  React Components + Zustand State Management           │
│  - /messages page                                      │
│  - MessageSidebar, MessageForm, MessageBubble          │
│  - WebPush subscription management                     │
└──────────────────────┬─────────────────────────────────┘
                       │
┌──────────────────────┴─────────────────────────────────┐
│                   Next.js API Layer                    │
│  Route Handlers + Business Logic                       │
│  - GET /threads (list with filters)                    │
│  - GET /threads/[id] (get detail)                      │
│  - POST /threads/[id]/reply (send message)             │
│  - POST /sync (orchestrate sync)                       │
└──────────────────────┬─────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────▼────┐    ┌────▼────┐   ┌────▼────┐
   │Messaging │    │External │   │Database │
   │Orchestor │    │APIs     │   │Layer    │
   │Service   │    │         │   │(Prisma) │
   └──────────┘    └─────────┘   └─────────┘
        │              │              │
   ┌────┴────────┬─────┴─────┬───────┴────┐
   │             │           │            │
   │        ┌────▼─┐    ┌────▼─┐    ┌────▼──┐
   │        │      │    │      │    │       │
   │      Airbnb Booking Abritel PostgreSQL
   │        │      │    │      │    │
   │        └──────┴────┴──────┘    └───────┘
   │
   └─ MessagingOrchestrator
      ├─ AirbnbMessagingService
      ├─ BookingMessagingService
      └─ AbritelMessagingService
```

## Data Flow

### Message Synchronization Flow

```
┌─────────────────┐
│  Sync Trigger   │
│  (User clicks)  │
└────────┬────────┘
         │
         ▼
┌──────────────────────────┐
│ POST /messages/sync      │
│ orchestrator.syncAll()   │
└────────┬─────────────────┘
         │
         ├─ Sync Airbnb
         │  └─ fetchConversations(propertyId)
         │     ├─ fetch conversations
         │     ├─ create/update threads
         │     └─ fetch & store messages
         │
         ├─ Sync Booking  
         │  └─ fetchConversations(propertyId)
         │     ├─ fetch conversations
         │     ├─ create/update threads
         │     └─ fetch & store messages
         │
         └─ Sync Abritel
            └─ fetchConversations(propertyId)
               ├─ fetch conversations
               ├─ create/update threads
               └─ fetch & store messages
         │
         ▼
┌──────────────────────┐
│ Store in Database    │
│ ├─ MessageThread     │
│ ├─ Message           │
│ └─ Deduplication     │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Return to Frontend   │
│ Update UI            │
└──────────────────────┘
```

### Message Sending Flow

```
┌──────────────────┐
│  User Types      │
│  Reply Message   │
└────────┬─────────┘
         │
         ▼
┌──────────────────────┐
│ Auto-save Draft      │
│ localStorage         │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ User Clicks Send     │
│ (or Ctrl+Enter)      │
└────────┬─────────────┘
         │
         ▼
┌────────────────────────────────┐
│ POST /threads/{id}/reply       │
│ orchestrator.sendReply()       │
└────────┬───────────────────────┘
         │
         ├─ Send to Airbnb
         │  └─ airbnb.sendMessage()
         │     └─ POST to Airbnb API
         │
         ├─ Send to Booking
         │  └─ booking.sendMessage()
         │     └─ POST to Booking API
         │
         └─ Send to Abritel
            └─ abritel.sendMessage()
               └─ POST to Abritel API
         │
         ▼
┌──────────────────────────┐
│ Store Local Copy         │
│ Message + SyncStatus     │
└────────┬─────────────────┘
         │
         ▼
┌────────────────────────┐
│ Update Thread          │
│ ├─ last_message_at     │
│ └─ unread_count        │
└────────┬───────────────┘
         │
         ▼
┌──────────────────────┐
│ Return Success       │
│ Clear Draft          │
│ Update UI (optimistic)
└──────────────────────┘
         │
         ▼
┌──────────────────────┐
│ Trigger WebPush      │
│ Notify other devices │
└──────────────────────┘
```

### Notification Flow

```
┌──────────────────────┐
│  New Message         │
│  Arrives on Platform │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Sync detects it      │
│ stores locally       │
└────────┬─────────────┘
         │
         ▼
┌───────────────────────────────┐
│ Check if user online          │
│ ├─ If online: Push to WebPush │
│ └─ If offline: Poll at next   │
│    sync or app launch         │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────┐
│ Service Worker receives    │
│ push event from browser    │
└────────┬─────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Display Notification        │
│ ├─ Title: Guest name        │
│ ├─ Body: Message preview    │
│ └─ Icon: Platform badge     │
└────────┬────────────────────┘
         │
         ▼
┌───────────────────────────┐
│ User clicks notification  │
│ Browser opens app         │
└────────┬──────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Navigate to /messages    │
│ Select relevant thread   │
│ Mark as read             │
└──────────────────────────┘
```

## Database Schema

### MessageThread Table

```
┌─────────────────────────────────────────┐
│          MessageThread                  │
├─────────────────────────────────────────┤
│ id (PK)                                 │
│ tenant_id (FK)                          │
│ property_id                             │
│ guest_name                              │
│ guest_email                             │
│ platform_thread_ids (JSON)              │
│   {                                     │
│     "airbnb": "conv_123",              │
│     "booking": "conv_456",             │
│     "abritel": "conv_789"              │
│   }                                     │
│ platform_integration_id (FK)            │
│ status (open|closed|archived)           │
│ unread_count                            │
│ last_message_at                         │
│ created_at, updated_at                  │
└─────────────────────────────────────────┘
```

### Message Table

```
┌────────────────────────────────────────┐
│           Message                      │
├────────────────────────────────────────┤
│ id (PK)                                │
│ thread_id (FK)                         │
│ platform_message_id (UNIQUE per thread)│
│ platform (airbnb|booking|abritel|direct
│ sender (host|guest|support)            │
│ sender_name                            │
│ body (TEXT)                            │
│ is_read, read_at                       │
│ sent_at                                │
│ synced_to (JSON)                       │
│   {                                    │
│     "airbnb": true,                   │
│     "booking": true,                  │
│     "abritel": false                  │
│   }                                    │
│ sync_error (if sync failed)            │
│ created_at, updated_at                 │
└────────────────────────────────────────┘
```

### PushSubscription Table

```
┌──────────────────────────────────┐
│      PushSubscription            │
├──────────────────────────────────┤
│ id (PK)                          │
│ tenant_id (multi-tenant)         │
│ user_id (FK)                     │
│ endpoint (UNIQUE)                │
│   https://fcm.googleapis.com/... │
│ p256dh (encrypted key)           │
│ auth (auth key)                  │
│ created_at                       │
└──────────────────────────────────┘
```

## Deduplication Strategy

### Problem
Messages arrive from multiple sources:
- Platform APIs (scheduled sync)
- Platform webhooks (real-time)
- User manual sync

Without deduplication, same message imported multiple times.

### Solution: platform_message_id + thread_id

```sql
UNIQUE INDEX (thread_id, platform_message_id)
```

**How it works:**

1. Before storing message, check if exists:
```typescript
const existing = await db.message.findFirst({
  where: {
    thread_id: "thread_123",
    platform_message_id: "msg_789"
  }
});

if (!existing) {
  // Store message
  await db.message.create({ ... });
}
```

2. Each message has unique ID per platform:
```
Airbnb message: { thread_id: "t1", platform_message_id: "airbnb_msg_123" }
Booking message: { thread_id: "t1", platform_message_id: "booking_msg_456" }
```

3. Even if synced 10 times, only one record per message per platform

### synced_to Field

Tracks which platforms have this message:
```json
{
  "airbnb": true,
  "booking": true,
  "abritel": false
}
```

Used for:
- Knowing where to update if message edited
- Debugging sync issues
- Eventual webhook integration

## Error Handling

### Sync Errors

```typescript
// If platform sync fails:
1. Catch error in orchestrator
2. Update platform_integration status = 'error'
3. Store error message in sync_error field
4. Return partial results to user
5. Log to audit_logs for support

Result: {
  imported: 2,          // Successfully synced 2 platforms
  errors: [
    "abritel: API key invalid",  // Failed on 1 platform
    "booking: Rate limit exceeded"
  ],
  timestamp: "2024-05-15T10:30:00Z"
}
```

### Send Errors

```typescript
// If sending message fails:
1. Try all platforms, track success/failure
2. Return detailed results:

Result: {
  success: true,  // At least 1 succeeded
  threadId: "t1",
  sentResults: {
    "airbnb": true,      // Sent OK
    "booking": true,     // Sent OK
    "abritel": false     // Failed
  },
  successCount: 2
}

// User can retry failed platforms
```

### Authentication Errors

```typescript
// 401 Unauthorized from platform:
1. Check if token expired
2. Attempt refresh (Booking specific)
3. If refresh fails, set integration status = 'needs_auth'
4. Notify user in UI: "Re-authenticate with Booking"
5. User clicks "Fix" → OAuth flow
```

## Performance Optimization

### Frontend

1. **Virtual Scrolling**
   - Only render visible messages in list
   - Scroll 1000 messages without lag

2. **Memoization**
   - MessageBubble wrapped in React.memo
   - Prevents re-renders when thread loads

3. **Code Splitting**
   - /messages lazy loaded with next/dynamic
   - Reduces main bundle size

4. **Draft Auto-Save**
   - Debounced (500ms) to reduce localStorage writes
   - Prevents "janky" save every keystroke

### Backend

1. **Query Optimization**
   - Select only needed fields
   - Use indexes on: tenant_id, property_id, sent_at
   - Pagination: 20 threads per page

2. **Connection Pooling**
   - Prisma manages PgBouncer pool
   - Max 10 connections per worker

3. **Batch Operations**
   - Sync fetches all platforms concurrently
   - updateMany instead of updateOne in loops

4. **Caching** (future)
   - Redis for frequently accessed threads
   - TTL: 5 minutes
   - Invalidate on new message

## Security

### Authentication
- All endpoints require x-tenant-id header
- All endpoints checked for user authorization
- Session tokens in HTTP-only cookies

### Authorization
- Users can only see their tenant's messages
- Property managers can only see their properties
- Multi-tenant isolation at database level

### Input Validation
- Message text: max 5000 characters
- Platform enum: whitelist (airbnb, booking, abritel)
- Status enum: whitelist (open, closed, archived)

### API Key Management
- API keys stored encrypted in database
- Never returned to frontend
- Rotated annually
- Audit logging on access

## Scalability

### Current Limits
- 10,000 messages/day
- 100 concurrent users
- 1000 active threads

### Scaling Strategy

1. **Read Replicas**
   - Separate read DB for thread listing
   - Write goes to primary
   - Sync reads from replica (slight delay OK)

2. **Message Archival**
   - Move old messages (>1 year) to archive table
   - Keep recent in hot table
   - Archival runs nightly

3. **Caching Layer**
   - Redis for thread metadata
   - Cache user's last 50 threads
   - Invalidate on new message

4. **Queue System**
   - Bull/BullMQ for async sync jobs
   - Prevents blocking API responses
   - Retry failed syncs automatically

## Testing Strategy

### Unit Tests
- MessagingOrchestratorService
- Platform services (Airbnb, Booking, Abritel)
- Message deduplication logic

### Integration Tests
- Full sync flow end-to-end
- Database interactions
- API endpoint responses

### E2E Tests
- User sends message
- Receives notification
- Message appears in other devices

### Performance Tests
- Load test: 100 concurrent users
- Stress test: Max message throughput
- Latency benchmarks

## Monitoring & Alerting

### Key Metrics
- Message sync latency (target: <5s)
- API response time (target: <200ms)
- WebPush delivery rate (target: 99%)
- Error rate (target: <0.1%)

### Alerts
- Sync failure rate > 5%
- API latency > 1s
- WebPush failures > 10%
- Database connection pool exhausted

### Logging
- Audit log for all message operations
- Structured JSON logging
- CloudFlare Logpush for log aggregation

## Future Enhancements

1. **Real-time Webhooks**
   - Replace polling with event-driven sync
   - Instant messages instead of 5-min delay

2. **Message Search**
   - Full-text search across all messages
   - Elasticsearch integration

3. **Message Templates**
   - Pre-written responses for common issues
   - Smart suggestions based on message content

4. **Auto-Reply**
   - Set auto-response when unavailable
   - Rules-based message routing

5. **Team Collaboration**
   - Assign conversations to team members
   - @mentions and notifications
