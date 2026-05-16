import webpush from "web-push";
import { db } from "@/lib/db";

webpush.setVapidDetails(
  process.env.VAPID_EMAIL ?? "mailto:contact@hostpro.fr",
  process.env.VAPID_PUBLIC_KEY ?? "",
  process.env.VAPID_PRIVATE_KEY ?? ""
);

export async function sendPushToUser(
  userId: string,
  title: string,
  body: string,
  url?: string
) {
  const subscriptions = await db.pushSubscription.findMany({
    where: { user_id: userId },
  });

  await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({ title, body, url: url ?? "/" })
      )
    )
  );
}
