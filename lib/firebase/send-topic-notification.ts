import { getFirebaseMessaging } from "@/lib/firebase/admin";

const ANNOUNCEMENTS_TOPIC = "announcements";
const BODY_MAX_LENGTH = 120;

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
 * Never throws — Firebase delivery failures must never block the API
 * response or the announcement record, which is the source of truth.
 */
export async function sendAnnouncementPush(
  params: SendAnnouncementPushParams,
): Promise<{ ok: boolean; error?: string }> {
  const { id, title, content } = params;

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
    console.error("sendAnnouncementPush error:", err);
    return { ok: false, error: (err as Error).message || "Unknown error" };
  }
}
