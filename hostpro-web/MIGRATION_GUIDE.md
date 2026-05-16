# Database Migration Guide - Unified Messaging System

**Status:** ✅ Ready for Deployment  
**Version:** 1.0  
**Created:** May 16, 2026

---

## Overview

This guide covers the database migration for the unified messaging system (Phase 7). The migration adds four new tables to support multi-platform message consolidation and push notifications.

---

## Migration Details

### New Tables

#### 1. **PlatformIntegration**
Stores API credentials for each platform integration.

```sql
CREATE TABLE "PlatformIntegration" (
  id TEXT PRIMARY KEY,
  tenant_id TEXT (FK to Tenant),
  platform TEXT,
  api_key TEXT,
  oauth_token TEXT,
  oauth_refresh TEXT,
  status TEXT DEFAULT 'active',
  sync_error TEXT,
  last_synced_at TIMESTAMP
)
```

**Purpose:** Securely store and manage platform credentials  
**Indexes:** tenant_id, platform (unique compound)

#### 2. **MessageThread**
Unified conversation container across all platforms.

```sql
CREATE TABLE "MessageThread" (
  id TEXT PRIMARY KEY,
  tenant_id TEXT (FK to Tenant),
  platform_integration_id TEXT (FK to PlatformIntegration),
  guest_name TEXT,
  guest_email TEXT,
  property_id TEXT (FK to Property),
  platform_thread_ids JSONB,
  status TEXT DEFAULT 'open',
  unread_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMP
)
```

**Purpose:** Container for grouped messages across platforms  
**Indexes:** tenant_id, platform_integration_id, status, last_message_at

#### 3. **Message**
Individual messages from guests or hosts.

```sql
CREATE TABLE "Message" (
  id TEXT PRIMARY KEY,
  thread_id TEXT (FK to MessageThread),
  platform_message_id TEXT,
  platform TEXT,
  sender TEXT,
  sender_name TEXT,
  sender_email TEXT,
  body TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  sent_at TIMESTAMP,
  synced_to JSONB,
  sync_error TEXT
)
```

**Purpose:** Store individual messages with platform tracking  
**Indexes:** thread_id, platform, sender, sent_at

#### 4. **PushSubscription**
Device endpoints for WebPush notifications.

```sql
CREATE TABLE "PushSubscription" (
  id TEXT PRIMARY KEY,
  tenant_id TEXT (FK to Tenant),
  user_id TEXT (FK to User),
  endpoint TEXT UNIQUE,
  p256dh TEXT,
  auth TEXT
)
```

**Purpose:** Register devices for real-time notifications  
**Indexes:** tenant_id, user_id, endpoint (unique)

---

## Pre-Migration Checklist

- [ ] Backup production database
- [ ] Test migration on staging environment
- [ ] Document current data
- [ ] Prepare rollback plan
- [ ] Schedule maintenance window
- [ ] Notify users of downtime

---

## Running the Migration

### Development Environment

```bash
# Create and run migration
npm run db:migrate -- --name add_unified_messaging

# Verify tables created
npm run db:studio
```

### Staging Environment

```bash
# Connect to staging database
export DATABASE_URL="postgresql://user:pass@staging-db:5432/hostpro"

# Run migration
npx prisma migrate deploy

# Verify
npx prisma db execute --stdin < verify_migration.sql
```

### Production Environment

```bash
# Create backup first
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Run migration with dry-run first
npx prisma migrate deploy --skip-generate

# Verify migration success
psql $DATABASE_URL -c "\dt"
psql $DATABASE_URL -c "\di"
```

---

## Verification Steps

### 1. Table Creation
```sql
-- Verify all tables exist
\dt "*.MessageThread" "*.Message" "*.PlatformIntegration" "*.PushSubscription"

-- Expected output: 4 tables
```

### 2. Column Verification
```sql
-- Check Message table columns
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'Message' ORDER BY ordinal_position;

-- Expected columns: 14
```

### 3. Index Verification
```sql
-- List all indexes
\di *MessageThread* *Message* *PushSubscription*

-- Expected: Multiple performance indexes
```

### 4. Constraint Verification
```sql
-- Check foreign keys
SELECT constraint_name, table_name FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY' AND table_name IN (
  'MessageThread', 'Message', 'PlatformIntegration', 'PushSubscription'
);
```

---

## Data Migration

### Handling Existing Reservations

If migrating from previous system with existing messages:

```sql
-- Step 1: Import existing messages
INSERT INTO "MessageThread" (id, tenant_id, platform_integration_id, guest_name, status)
SELECT uuid_generate_v4(), tenant_id, integration_id, 'Imported Guest', 'archived'
FROM legacy_messages GROUP BY tenant_id, integration_id;

-- Step 2: Link messages
INSERT INTO "Message" (thread_id, platform, sender, body, sent_at)
SELECT t.id, 'imported', 'guest', message_content, created_at
FROM legacy_messages m
JOIN "MessageThread" t ON m.tenant_id = t.tenant_id
WHERE m.integration_id = t.platform_integration_id;
```

---

## Rollback Procedure

If migration fails or needs to be reverted:

```bash
# Method 1: Prisma rollback
npx prisma migrate resolve --rolled-back 01_add_unified_messaging

# Method 2: Manual rollback
psql $DATABASE_URL < rollback.sql

# Method 3: Restore from backup
pg_restore --dbname=hostpro backup_20260516_120000.sql
```

### Rollback Script (rollback.sql)

```sql
-- Drop tables in reverse order
DROP TABLE IF EXISTS "PushSubscription" CASCADE;
DROP TABLE IF EXISTS "Message" CASCADE;
DROP TABLE IF EXISTS "MessageThread" CASCADE;
DROP TABLE IF EXISTS "PlatformIntegration" CASCADE;

-- Verify tables are gone
\dt
```

---

## Performance Considerations

### Index Strategy
- **MessageThread:** Indexed on tenant_id for multi-tenancy
- **Message:** Indexed on thread_id and sent_at for sorting
- **Compound Index:** Unique (tenant_id, platform) on PlatformIntegration

### Query Optimization
```sql
-- Good: Uses index on tenant_id
SELECT * FROM "MessageThread" 
WHERE tenant_id = $1 
ORDER BY last_message_at DESC;

-- Good: Uses compound index
SELECT * FROM "PlatformIntegration"
WHERE tenant_id = $1 AND platform = $2;

-- Good: Uses index on thread_id
SELECT * FROM "Message"
WHERE thread_id = $1
ORDER BY sent_at ASC;
```

### Estimated Storage
- **PlatformIntegration:** ~1KB per record
- **MessageThread:** ~500B per record
- **Message:** ~2KB per record
- **PushSubscription:** ~1KB per record

For 10,000 tenants with 100 messages each:
- Total: ~200MB (estimated)

---

## Monitoring Post-Migration

### Performance Metrics
```sql
-- Monitor query performance
EXPLAIN ANALYZE SELECT * FROM "MessageThread"
WHERE tenant_id = 'test-tenant' ORDER BY last_message_at DESC;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE tablename IN ('MessageThread', 'Message', 'PlatformIntegration', 'PushSubscription');
```

### Log Monitoring
```bash
# Watch for errors
tail -f /var/log/postgresql/postgresql.log | grep -i error

# Monitor query latency
SELECT query, mean_exec_time FROM pg_stat_statements
ORDER BY mean_exec_time DESC LIMIT 10;
```

---

## Maintenance Plan

### Weekly
- [ ] Monitor slow queries
- [ ] Check index fragmentation
- [ ] Verify backup completion

### Monthly
- [ ] Analyze table statistics
- [ ] Optimize indexes
- [ ] Clean old archived threads

### Quarterly
- [ ] Full database maintenance
- [ ] Capacity planning
- [ ] Performance tuning

---

## Troubleshooting

### Migration Hangs
```bash
# Check blocking queries
SELECT pid, usename, query FROM pg_stat_activity
WHERE state = 'active' AND query NOT LIKE '%pg_stat%';

# Kill blocking queries if necessary
SELECT pg_terminate_backend(pid) FROM pg_stat_activity
WHERE usename != current_user;
```

### Foreign Key Constraint Errors
```sql
-- Check orphaned records
SELECT * FROM "MessageThread" t
LEFT JOIN "PlatformIntegration" p ON t.platform_integration_id = p.id
WHERE p.id IS NULL;

-- Fix: Delete orphaned records or update foreign keys
DELETE FROM "MessageThread" WHERE platform_integration_id IS NULL;
```

### Disk Space Issues
```bash
# Check remaining disk space
df -h

# Archive old messages to separate storage
SELECT COUNT(*) FROM "Message"
WHERE sent_at < NOW() - INTERVAL '1 year';

# Move to archive table
INSERT INTO "Message_Archive" 
SELECT * FROM "Message" WHERE sent_at < NOW() - INTERVAL '1 year';
```

---

## Success Criteria

- ✅ All 4 tables created successfully
- ✅ All indexes created with correct names
- ✅ Foreign key constraints validated
- ✅ No data loss
- ✅ Query performance < 100ms
- ✅ Application starts without errors
- ✅ WebPush notifications working
- ✅ Message sync functional

---

## Post-Deployment Verification

Run these checks after deployment:

```bash
# 1. Check application health
curl -I https://hostpro-dev-app.azurewebsites.net

# 2. Test message API
curl -X GET https://hostpro-dev-app.azurewebsites.net/api/v1/messages/threads \
  -H "x-tenant-id: test-tenant"

# 3. Test notifications
curl -X POST https://hostpro-dev-app.azurewebsites.net/api/v1/notifications/subscribe \
  -H "x-tenant-id: test-tenant" \
  -H "Content-Type: application/json" \
  -d '{"endpoint":"test","keys":{"p256dh":"key","auth":"auth"}}'

# 4. Check logs
az webapp log tail --name hostpro-dev-app --resource-group hostpro
```

---

## Timeline

| Step | Duration | Window |
|------|----------|--------|
| Backup | 30 min | Before migration |
| Migration | 5-10 min | During maintenance |
| Verification | 15 min | After migration |
| Monitoring | 24h | Post-deployment |

**Total Downtime:** ~1 hour  
**Recommended Window:** 2:00-3:00 AM UTC

---

## Support & Documentation

- [Prisma Migration Docs](https://www.prisma.io/docs/orm/prisma-migrate)
- [PostgreSQL Backup Guide](https://www.postgresql.org/docs/current/backup.html)
- [HostPro API Docs](./API_REFERENCE.md)

---

**Migration Status:** ✅ Ready for Production  
**Last Updated:** May 16, 2026  
**Next Review:** May 23, 2026
