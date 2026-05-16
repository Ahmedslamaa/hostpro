# HostPro Unified Messaging Setup Guide

## Table of Contents

1. [Overview](#overview)
2. [API Configuration](#api-configuration)
3. [Platform Integration](#platform-integration)
4. [Database Setup](#database-setup)
5. [Frontend Configuration](#frontend-configuration)
6. [WebPush Notifications](#webpush-notifications)
7. [Environment Variables](#environment-variables)
8. [Testing](#testing)

## Overview

HostPro Unified Messaging consolidates messages from Airbnb, Booking.com, and Abritel into a single inbox, allowing property managers to respond to guests across all platforms from one interface.

### Architecture

```
┌─────────────────────────────────────────────────────┐
│           HostPro Frontend (Next.js)               │
│  /messages - Unified Inbox UI                      │
└──────────────────┬──────────────────────────────────┘
                   │
         ┌─────────┴──────────┐
         │                    │
    ┌────▼────┐         ┌─────▼─────┐
    │ WebPush │         │ REST API  │
    │  Notify │         │ (Next.js) │
    └────┬────┘         └─────┬─────┘
         │                    │
         │          ┌─────────┴─────────┐
         │          │                   │
    ┌────▼──────┐  ┌▼──────┐  ┌────────▼──┐
    │Service    │  │Airbnb │  │ Booking  │
    │Worker     │  │API    │  │ API      │
    │(sw.js)    │  └───────┘  └──────────┘
    └───────────┘         │
                    ┌─────┴──────┐
                    │            │
                ┌───▼──┐    ┌────▼────┐
                │Abritel    │PostgreSQL│
                │API        │Database  │
                └────────────└─────────┘
```

## API Configuration

### Endpoints

#### Message Thread Operations

```bash
# List conversations with filtering
GET /api/v1/messages/threads
Headers:
  x-tenant-id: {tenant_id}
Query:
  page=1
  status=open
  platform=airbnb
  search=Marie

# Get single thread with all messages
GET /api/v1/messages/threads/{id}
Headers:
  x-tenant-id: {tenant_id}

# Send reply across all platforms
POST /api/v1/messages/threads/{id}/reply
Headers:
  x-tenant-id: {tenant_id}
  x-user-id: {user_id}
Body:
  {
    "message": "Bonjour, merci de votre demande..."
  }

# Mark thread as read
PUT /api/v1/messages/threads/{id}/reply
Headers:
  x-tenant-id: {tenant_id}
```

#### Synchronization

```bash
# Trigger manual sync of all messages
POST /api/v1/messages/sync
Headers:
  x-tenant-id: {tenant_id}
Body:
  {
    "propertyId": "{property_id}"
  }
```

#### Notifications

```bash
# Get VAPID public key for WebPush
GET /api/v1/notifications/vapid-key

# Subscribe device to push notifications
POST /api/v1/notifications/subscribe
Headers:
  x-tenant-id: {tenant_id}
  x-user-id: {user_id}
Body:
  {
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  }
```

## Platform Integration

### Airbnb API Setup

1. **Create API Key**
   - Go to https://www.airbnb.com/developer/register
   - Create application
   - Generate API key

2. **Store Credentials**
   ```sql
   INSERT INTO platform_integrations (tenant_id, platform, api_key, status)
   VALUES ('{tenant_id}', 'airbnb', '{api_key}', 'active');
   ```

3. **Test Connection**
   ```bash
   curl -X GET https://api.airbnb.com/v2/conversations \
     -H "Authorization: Bearer {api_key}" \
     -H "X-Airbnb-API-Lib: hostpro-unified-messaging"
   ```

### Booking.com API Setup

1. **Enable Partner API**
   - Access https://partner.booking.com/
   - Request API access
   - Complete OAuth flow

2. **Store OAuth Token**
   ```sql
   INSERT INTO platform_integrations (tenant_id, platform, oauth_token, status)
   VALUES ('{tenant_id}', 'booking', '{oauth_token}', 'active');
   ```

3. **Refresh Token Handling**
   - Tokens expire after ~1 year
   - Refresh tokens when API returns 401
   - Store new tokens in database

### Abritel API Setup

1. **Generate API Key**
   - Log into https://www.abritel.fr/api
   - Create new API key
   - Set permissions: messages:read, messages:write

2. **Configure in HostPro**
   ```sql
   INSERT INTO platform_integrations (tenant_id, platform, api_key, status)
   VALUES ('{tenant_id}', 'abritel', '{api_key}', 'active');
   ```

## Database Setup

### Schema Overview

**MessageThread**
- Stores conversation metadata
- `platform_thread_ids`: JSON mapping platform-specific IDs
- `unread_count`: Number of unread messages
- `status`: open | closed | archived

**Message**
- Individual messages from each platform
- `platform_message_id`: Platform's unique ID (for deduplication)
- `synced_to`: JSON tracking which platforms have this message

**PushSubscription**
- WebPush device subscriptions
- Multi-tenant with user_id tracking

### Initial Seed Data

```sql
-- Create platform integrations
INSERT INTO platform_integrations (tenant_id, platform, api_key, status)
VALUES 
  ('{tenant_id}', 'airbnb', '{key}', 'active'),
  ('{tenant_id}', 'booking', '{token}', 'active'),
  ('{tenant_id}', 'abritel', '{key}', 'active');

-- Create message threads (example)
INSERT INTO message_threads (tenant_id, property_id, guest_name, guest_email, platform_thread_ids)
VALUES 
  ('{tenant_id}', '{property_id}', 'Marie Dupont', 'marie@example.com', 
   '{"airbnb":"conv_12345","booking":"conv_67890"}');
```

## Frontend Configuration

### Components

The messaging UI is built with React components:

```
messages/page.tsx (Main page)
├── MessageSidebar (Thread list)
│   ├── Search input
│   ├── Platform filter dropdown
│   └── Thread list with pagination
├── Message Detail
│   ├── Header (Guest info + Platform badge)
│   ├── Messages container (MessageBubble)
│   └── MessageForm (Reply input)
└── MessageEmpty (No threads state)
```

### State Management

Uses Zustand store (`useMessagesStore`):

```typescript
interface MessagesStoreState {
  threads: MessageThreadUI[]
  selectedThreadId: string | null
  currentThread: MessageThreadDetail | null
  
  fetchThreads: () => Promise<void>
  selectThread: (id: string) => Promise<void>
  sendMessage: (threadId: string, message: string) => Promise<void>
  markAsRead: (threadId: string) => Promise<void>
  sync: (propertyId?: string) => Promise<void>
}
```

### Draft Auto-Save

Messages are automatically saved to localStorage:

```typescript
// In MessageForm component
saveDraft(threadId, content) // Called on every keystroke
getDraft(threadId) // Retrieved when thread selected
clearDraft(threadId) // Cleared after successful send
```

## WebPush Notifications

### How It Works

1. **User approves notifications** → Browser requests permission
2. **Subscribe to push** → Get subscription object from browser
3. **Send to backend** → Store subscription in database
4. **New message arrives** → Trigger WebPush from server
5. **Service Worker receives push** → Display notification
6. **User clicks notification** → Open /messages page

### VAPID Keys

Generate VAPID keys (one-time setup):

```bash
npx web-push generate-vapid-keys
# Output:
# Public Key: ...
# Private Key: ...
```

Store in environment:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
```

### Service Worker Registration

Automatic in `ServiceWorkerRegister.tsx`:

```typescript
navigator.serviceWorker.register('/sw.js')
```

The service worker (`public/sw.js`):
- Listens to push events
- Displays notifications with proper formatting
- Handles notification clicks → Navigate to /messages

### Testing Notifications

```bash
# Send test push
curl -X POST https://hostpro-dev-app.azurewebsites.net/api/v1/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "title": "Nouveau message",
    "body": "Marie a répondu à votre message"
  }'
```

## Environment Variables

### Required

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/hostpro

# Authentication
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000

# WebPush Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key

# API Endpoints
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# Tenant ID (for API calls)
NEXT_PUBLIC_TENANT_ID=your_tenant_id
```

### Optional

```env
# Message sync interval (minutes)
MESSAGE_SYNC_INTERVAL=5

# WebPush timeout (seconds)
WEBPUSH_TIMEOUT=10

# Database pool size
DATABASE_POOL_SIZE=10
```

## Testing

### Unit Tests

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- messagesStore.test.ts

# With coverage
npm run test -- --coverage
```

### Manual Testing Checklist

- [ ] Load messages page (should see thread list)
- [ ] Click thread (should load messages)
- [ ] Type in reply form (should auto-save draft)
- [ ] Send message (should appear immediately)
- [ ] Sync messages (should fetch from all platforms)
- [ ] Enable notifications (should show permission prompt)
- [ ] Receive message (should trigger push notification)
- [ ] Click notification (should open /messages)
- [ ] Mark thread as read (should update unread count)
- [ ] Filter by platform (should show only Airbnb/Booking/etc)

### Performance Benchmarks

Target metrics:
- **First Contentful Paint**: < 1.5s
- **Interaction to Paint**: < 100ms
- **Cumulative Layout Shift**: < 0.1
- **Lighthouse Score**: 95+

## Troubleshooting

### Messages Not Syncing

1. Check API keys in database
2. Verify network connectivity
3. Check error logs: `SELECT * FROM audit_logs WHERE resource='message_sync'`
4. Try manual sync from UI

### WebPush Not Working

1. Verify service worker is registered: Open DevTools → Application → Service Workers
2. Check VAPID keys are correct
3. Verify subscription is stored: `SELECT * FROM push_subscriptions`
4. Check browser supports WebPush (not all browsers/OS combinations supported)

### Draft Not Saving

1. Check localStorage is enabled
2. Verify draft key: `localStorage.getItem('draft_{threadId}')`
3. Check for quota exceeded errors

## Support

For issues, contact: support@hostpro.fr
