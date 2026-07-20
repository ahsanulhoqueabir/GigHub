import { fail, ok, parseBody } from "@/lib/api/api-response";
import { subscribeTokenToAnnouncements } from "@/lib/firebase/subscribe-topic";
import { subscribePushSchema } from "@/lib/validations/push.schema";
import { NextRequest } from "next/server";

// ─── POST /api/push/subscribe (public) ────────────────────────────
// Subscribes a device's native FCM token to the "announcements" topic.
// No auth required — this is topic-only, not tied to a user account.
export async function POST(request: NextRequest) {
  try {
    const payload = await parseBody(request, subscribePushSchema);
    if (payload instanceof Response) return payload;

    const result = await subscribeTokenToAnnouncements(payload.token);

    if (!result.ok) {
      return fail({ error: result.error ?? "Subscription failed", statusCode: 502 });
    }

    return ok({ message: "Subscribed to announcements" });
  } catch (err) {
    return fail({
      error: (err as Error).message || "An unknown error occurred",
      statusCode: 500,
    });
  }
}
