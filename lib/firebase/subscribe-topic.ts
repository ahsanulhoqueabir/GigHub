import { getFirebaseMessaging } from "@/lib/firebase/admin";

const ANNOUNCEMENTS_TOPIC = "announcements";

/**
 * Subscribes a device's native FCM registration token to the
 * announcements topic. Idempotent — safe to call repeatedly with the
 * same token. Never throws; failures are logged and reported back so
 * the caller can decide whether to retry.
 */
export async function subscribeTokenToAnnouncements(
  token: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const response = await getFirebaseMessaging().subscribeToTopic(
      [token],
      ANNOUNCEMENTS_TOPIC,
    );

    if (response.failureCount > 0) {
      const reason =
        response.errors[0]?.error?.message || "Subscription failed";
      console.error("subscribeTokenToAnnouncements failure:", reason);
      return { ok: false, error: reason };
    }

    return { ok: true };
  } catch (err) {
    console.error("subscribeTokenToAnnouncements error:", err);
    return { ok: false, error: (err as Error).message || "Unknown error" };
  }
}
