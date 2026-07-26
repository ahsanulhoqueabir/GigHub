import { getFirebaseMessaging } from "@/lib/firebase/admin";

const ANNOUNCEMENTS_TOPIC = "announcements";
const BODY_MAX_LENGTH = 120;
const MAX_RETRIES = 2;

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}

interface SendAnnouncementPushParams {
  id: string;
  title: string;
  content: string;
}

/**
 * Sends a Firebase Cloud Messaging topic notification for an announcement.
 * Retries once on failure to handle transient FCM / cold-start issues.
 * Never throws — Firebase delivery failures must never block the API
 * response or the announcement record, which is the source of truth.
 */
export async function sendAnnouncementPush(
  params: SendAnnouncementPushParams,
): Promise<{ ok: boolean; error?: string }> {
  const { id, title, content } = params;
  let lastError: string | undefined;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await getFirebaseMessaging().send({
        topic: ANNOUNCEMENTS_TOPIC,
        notification: {
          title,
          body: truncate(content, BODY_MAX_LENGTH),
        },
        data: {
          announcementId: id,
          screen: "announcement-details",
        },
      });

      return { ok: true };
    } catch (err) {
      lastError = (err as Error).message || "Unknown error";
      console.error(
        `sendAnnouncementPush attempt ${attempt}/${MAX_RETRIES} error:`,
        lastError,
      );

      if (attempt < MAX_RETRIES) {
        // Brief back-off before retry (100ms) to let Firebase Admin SDK
        // finish any pending initialization.
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  }

  return { ok: false, error: lastError };
}
