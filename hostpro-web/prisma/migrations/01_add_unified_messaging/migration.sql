-- CreateTable PlatformIntegration
CREATE TABLE "PlatformIntegration" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "api_key" TEXT,
    "oauth_token" TEXT,
    "oauth_refresh" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "sync_error" TEXT,
    "last_synced_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformIntegration_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PlatformIntegration_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable MessageThread
CREATE TABLE "MessageThread" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "platform_integration_id" TEXT NOT NULL,
    "guest_name" TEXT NOT NULL,
    "guest_email" TEXT,
    "property_id" TEXT,
    "platform_thread_ids" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'open',
    "unread_count" INTEGER NOT NULL DEFAULT 0,
    "last_message_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageThread_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "MessageThread_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MessageThread_platform_integration_id_fkey" FOREIGN KEY ("platform_integration_id") REFERENCES "PlatformIntegration" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MessageThread_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "Property" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable Message
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "thread_id" TEXT NOT NULL,
    "platform_message_id" TEXT,
    "platform" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "sender_name" TEXT,
    "sender_email" TEXT,
    "body" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "synced_to" JSONB NOT NULL DEFAULT '{}',
    "sync_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Message_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "MessageThread" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable PushSubscription
CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PushSubscription_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PushSubscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PlatformIntegration_tenant_id_platform_key" ON "PlatformIntegration"("tenant_id", "platform");

-- CreateIndex
CREATE INDEX "MessageThread_tenant_id_idx" ON "MessageThread"("tenant_id");
CREATE INDEX "MessageThread_platform_integration_id_idx" ON "MessageThread"("platform_integration_id");
CREATE INDEX "MessageThread_property_id_idx" ON "MessageThread"("property_id");
CREATE INDEX "MessageThread_status_idx" ON "MessageThread"("status");
CREATE INDEX "MessageThread_last_message_at_idx" ON "MessageThread"("last_message_at");

-- CreateIndex
CREATE INDEX "Message_thread_id_idx" ON "Message"("thread_id");
CREATE INDEX "Message_platform_idx" ON "Message"("platform");
CREATE INDEX "Message_sender_idx" ON "Message"("sender");
CREATE INDEX "Message_sent_at_idx" ON "Message"("sent_at");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");
CREATE INDEX "PushSubscription_tenant_id_idx" ON "PushSubscription"("tenant_id");
CREATE INDEX "PushSubscription_user_id_idx" ON "PushSubscription"("user_id");
