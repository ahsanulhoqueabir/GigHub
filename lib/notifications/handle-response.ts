import { useAnnouncementsStore } from "@/store/announcements.store";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";

/**
 * Dedupe guard — `getLastNotificationResponseAsync()` (cold start) and
 * `addNotificationResponseReceivedListener` (warm tap) can both fire for
 * the very same tap, and a user can also tap the system notification more
 * than once before the app finishes navigating. Tracking the last-handled
 * notification request id collapses all of these into a single navigation.
 */
let lastHandledRequestId: string | null = null;

interface AnnouncementNotificationData {
  announcementId?: string;
  screen?: string;
}

/**
 * Resolves a tapped notification to the Announcement Details screen.
 * Never trusts the notification payload as content — it only carries an
 * id; the details screen always re-fetches from the API.
 */
export function navigateFromNotificationResponse(
  response: Notifications.NotificationResponse | null | undefined,
): void {
  if (!response) return;

  const requestId = response.notification.request.identifier;
  if (requestId && requestId === lastHandledRequestId) {
    return;
  }

  const data = response.notification.request.content
    .data as AnnouncementNotificationData;

  if (!data?.announcementId || data.screen !== "announcement-details") {
    return;
  }

  lastHandledRequestId = requestId ?? lastHandledRequestId;

  if (useAnnouncementsStore.getState().activeDetailId === data.announcementId) {
    return; // already viewing this exact announcement
  }

  const announcementId = data.announcementId;

  // Deferred so this is safe to call before the router is mounted — e.g.
  // a cold start resolved via getLastNotificationResponseAsync() can fire
  // before the navigation tree is ready.
  setTimeout(() => {
    try {
      router.push(`/announcements/${announcementId}`);
    } catch (err) {
      console.error("navigateFromNotificationResponse error:", err);
    }
  }, 0);
}
