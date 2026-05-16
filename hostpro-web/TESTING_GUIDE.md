# Testing Guide - Unified Messaging System

**Phase 4 is complete and ready for testing!**

---

## 🚀 Quick Start

### 1. Start Development Server
```bash
cd "C:\Users\ahmed\OneDrive - Université Côte d'Azur\Bureau\HOST PRO\HOST PRO - SAS PMS PLATFORM\hostpro-web"
npm run dev
```

Server will start on `http://localhost:3000`

### 2. Login
Navigate to `/login` and use:
- **Email:** `demo@hostpro.fr`
- **Password:** `demo1234`

### 3. Access Messages
Click "Messages" in the sidebar navigation

---

## ✅ Testing Checklist

### UI Components
- [ ] MessageSidebar loads with thread list
- [ ] Search bar filters threads by guest name/email
- [ ] Platform filter dropdown works (Airbnb, Booking, Abritel)
- [ ] Pagination works (showing max 20 threads per page)
- [ ] Unread badge shows count
- [ ] Click thread to view detail
- [ ] MessageBubble timestamps display correctly (e.g., "2h ago")
- [ ] Host messages right-aligned (blue), guest messages left-aligned (gray)
- [ ] MessageForm appears for selected thread
- [ ] Draft auto-saves when typing (check localStorage)

### API Endpoints

#### GET /api/v1/messages/threads
```bash
curl -X GET "http://localhost:3000/api/v1/messages/threads?page=1&status=open" \
  -H "x-tenant-id: your-tenant-id"
```

Expected response:
```json
{
  "threads": [
    {
      "id": "...",
      "guestName": "Marie Dupont",
      "guestEmail": "marie@example.com",
      "platform": "airbnb",
      "unreadCount": 2,
      "lastMessageAt": "2026-05-15T...",
      "preview": "Bonjour, est-ce que...",
      "status": "open"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20,
  "pages": 1
}
```

#### GET /api/v1/messages/threads/[id]
```bash
curl -X GET "http://localhost:3000/api/v1/messages/threads/{thread-id}" \
  -H "x-tenant-id: your-tenant-id"
```

Expected response:
```json
{
  "id": "...",
  "guestName": "Marie Dupont",
  "guestEmail": "marie@example.com",
  "platform": "airbnb",
  "status": "open",
  "messages": [
    {
      "id": "...",
      "body": "Bonjour, est-ce que la piscine...",
      "sender": "guest",
      "senderName": "Marie Dupont",
      "platform": "airbnb",
      "sentAt": "2026-05-15T...",
      "isRead": false
    },
    {
      "id": "...",
      "body": "Bonjour Marie ! Oui, la piscine...",
      "sender": "host",
      "senderName": "Property Owner",
      "platform": "airbnb",
      "sentAt": "2026-05-15T...",
      "isRead": true
    }
  ]
}
```

#### POST /api/v1/messages/threads/[id]/reply
```bash
curl -X POST "http://localhost:3000/api/v1/messages/threads/{thread-id}/reply" \
  -H "x-tenant-id: your-tenant-id" \
  -H "x-user-id: your-user-id" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Thank you for your inquiry! I will get back to you shortly."
  }'
```

Expected response:
```json
{
  "success": true,
  "threadId": "...",
  "sentResults": {
    "airbnb": true,
    "booking": false,
    "abritel": false
  },
  "successCount": 1,
  "message": "Message sent successfully"
}
```

#### PUT /api/v1/messages/threads/[id]/reply
```bash
curl -X PUT "http://localhost:3000/api/v1/messages/threads/{thread-id}/reply" \
  -H "x-tenant-id: your-tenant-id"
```

Expected response:
```json
{
  "success": true,
  "message": "All messages marked as read"
}
```

#### POST /api/v1/messages/sync
```bash
curl -X POST "http://localhost:3000/api/v1/messages/sync" \
  -H "x-tenant-id: your-tenant-id" \
  -H "Content-Type: application/json" \
  -d '{"propertyId": "prop-villa-azur"}'
```

Expected response:
```json
{
  "success": true,
  "imported": 2,
  "errors": [],
  "timestamp": "2026-05-15T..."
}
```

### Database
```bash
# Open Prisma Studio to view database
npx prisma studio

# Check generated Prisma client
ls node_modules/@prisma/client
```

### Service Worker
1. Open DevTools (F12)
2. Go to Application tab
3. Check "Service Workers" section
4. Should show registered service worker
5. Check "Manifest" tab for VAPID keys

---

## 🧪 Manual Test Scenarios

### Scenario 1: View Thread List
1. Login with demo credentials
2. Click "Messages" in sidebar
3. **Expected:** See thread from "Marie Dupont"
4. **Check:**
   - Platform badge shows "Airbnb"
   - Unread count displays
   - Last message preview visible
   - Timestamp shows correctly

### Scenario 2: Search Threads
1. In MessageSidebar, type "dupont" in search
2. **Expected:** List filters to show matching threads
3. Type "xyz" (non-matching)
4. **Expected:** "Aucun message" (No messages) shown

### Scenario 3: Filter by Platform
1. Open Platform dropdown
2. Select "Booking"
3. **Expected:** Thread list updates (shows only Booking threads)
4. Select "Toutes les plateformes" (All platforms)
5. **Expected:** All threads show again

### Scenario 4: Open Thread Detail
1. Click on the "Marie Dupont" thread
2. **Expected:**
   - Thread header shows guest name + email
   - Platform badge visible
   - Message list shows both messages
   - MessageForm appears at bottom

### Scenario 5: Send Reply
1. In MessageForm, type: "Thank you for your message!"
2. Click Send (or press Ctrl+Enter)
3. **Expected:**
   - Button shows loading state
   - New message appears in thread
   - marked with "host" sender
   - Timestamp shows "just now"

### Scenario 6: Draft Auto-Save
1. In MessageForm, type: "This is a draft"
2. Wait 1 second (debounce)
3. Open Browser DevTools → Application → Local Storage
4. **Expected:** Find key `draft-{threadId}` with your text
5. Refresh page
6. **Expected:** Draft text reappears in MessageForm

### Scenario 7: Mark as Read
1. Select thread with unread messages
2. Click thread (should auto-mark as read)
3. **Expected:** Unread count decreases
4. Check API response - unreadCount should be 0

### Scenario 8: WebPush Subscription
1. In browser console: `navigator.serviceWorker.getRegistrations()`
2. **Expected:** Service worker shows as registered
3. Check browser notification permission
4. If granted, subscription should work

---

## 🔍 Debugging Tips

### View API Requests
1. Open DevTools → Network tab
2. Perform action (search, load thread, send message)
3. Check requests to `/api/v1/messages/`
4. Inspect request/response in Network tab

### Check Database
```bash
npx prisma studio
# Browse tables:
# - message_threads
# - messages
# - push_subscriptions
```

### View Console Logs
```javascript
// In browser console, check for:
// - Service worker registration logs
// - Store state changes
// - API error messages
// - Component rendering logs
```

### Check LocalStorage (Drafts)
```javascript
// In browser console:
localStorage.getItem('messagesStore')  // Zustand store
// Check for draft keys:
Object.keys(localStorage).filter(k => k.startsWith('draft-'))
```

---

## ⚠️ Common Issues & Solutions

### "Messages" page not loading
**Check:**
1. Service Worker registered? (DevTools → Application)
2. tenant_id header sent? (Network tab)
3. Database seeded? (`npx prisma studio`)

**Fix:**
1. Hard refresh: Ctrl+Shift+R
2. Clear ServiceWorker: DevTools → Application → Clear
3. Reseed database: `npx prisma db push --force-reset && npx prisma db seed`

### Drafts not saving
**Check:**
1. localStorage enabled? (DevTools → Application → Storage)
2. Debounce working? (Wait 1+ second after typing)

**Fix:**
1. Check browser privacy settings
2. Clear localStorage: `localStorage.clear()` in console
3. Check console for errors (F12)

### API returning 400 "Missing x-tenant-id"
**Check:**
1. Header `x-tenant-id` included in request
2. Value is valid tenant ID (from database)

**Fix:**
1. Use Prisma Studio to get valid tenant ID
2. Verify tenant exists in database
3. Check API route implementation

### Service Worker not registering
**Check:**
1. HTTPS or localhost (required for SW)
2. Browser supports ServiceWorker
3. public/sw.js exists

**Fix:**
1. Use localhost (not 127.0.0.1)
2. Check browser compatibility (Chrome 40+)
3. Check console for errors

---

## 📊 Testing Data

### Demo Tenant
- Name: Demo Tenant
- ID: Generated (check via Prisma Studio)

### Demo User
- Email: demo@hostpro.fr
- Password: demo1234

### Demo Thread
- Guest: Marie Dupont (marie.dupont@email.fr)
- Platform: Airbnb
- Messages: 2 (guest + host)

### To view this data:
```bash
npx prisma studio
# Browse to message_threads and messages tables
```

---

## ✅ Quality Assurance

### Before Proceeding to Phase 5, verify:
- [ ] All UI components render correctly
- [ ] All API endpoints return correct response format
- [ ] Database contains seeded data
- [ ] No console errors
- [ ] Service Worker registers
- [ ] Draft auto-save works
- [ ] Thread filtering works
- [ ] Message sending works
- [ ] Build passes: `npm run build`

---

## 📞 Getting Help

### Build Issues
```bash
# Clean and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Database Issues
```bash
# Reset database and reseed
npx prisma db push --force-reset
npx prisma db seed
```

### TypeScript Issues
```bash
# Regenerate Prisma client
npx prisma generate
```

---

**Ready to test Phase 4!** 🚀

Start with "Quick Start" section above, then follow the test scenarios.
Report any issues in the development notes.
