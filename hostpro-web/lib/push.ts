import webpush from "web-push";
import { db } from "@/lib/db";

let _initialized = false;

function initWebPush() {
  if (_initialized) return true;

  const email  = process.env.VAPID_EMAIL ?? "";
  const pubKey = process.env.VAPID_PUBLIC_KEY ?? "";
  const privKey = process.env.VAPID_PRIVATE_KEY ?? "";

  // Skip initialization if keys not configured (build time / dev without keys)
  if (!pubKey || !privKey) {
    console.warn("[push] VAPID keys not configured — push notifications disabled");
    return false;
  }

  webpush.setVapidDetails(
    email || "mailto:contact@hostpro.fr",
    pubKey,
    privKey
  );
  _initialized = true;
  return true;
}

export async function sendPushToUser(
  userId: string,
  title: string,
  body: string,
  url?: string
) {
  if (!initWebPush()) return; // silently skip if not configured

  const subscriptions = await (db.pushSubscription as any).findMany({
    where: { user_id: userId },
  });

  await Promise.allSettled(
    subscriptions.map((sub: any) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({
          title,
          body,
          url: url ?? "/messages",
          icon: "/hostpro-logo.svg",
        })
      )
    )
  );
}

export async function sendPushToTenant(
  tenantId: string,
  title: string,
  body: string,
  url?: string
) {
  if (!initWebPush()) return;

  const userTenants = await db.userTenant.findMany({
    where: { tenant_id: tenantId, is_active: true },
    select: { user_id: true },
  });

  await Promise.allSettled(
    userTenants.map(({ user_id }: { user_id: string }) =>
      sendPushToUser(user_id, title, body, url)
    )
  );
}
