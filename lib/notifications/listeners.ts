import { navigateFromNotificationResponse } from "@/lib/notifications/handle-response";
import { toast } from "@/store/toast.store";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";

// Show the OS notification banner even while the app is foregrounded —
// otherwise foreground notifications are received silently with no UI.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/**
 * Registers the notification listeners needed to cover all three app
 * states from a single mount point (the root layout):
 *  - Foreground: shows an in-app toast in addition to the OS banner.
 *  - Background: OS shows the system notification; tapping it fires the
 *    response listener below.
 *  - Terminated: `getLastNotificationResponseAsync()` recovers the tap
 *    that launched the app, since the listener wasn't registered yet
 *    when it happened.
 */
export function useNotificationListeners(): void {
  useEffect(() => {
    const receivedSub = Notifications.addNotificationReceivedListener(
      (notification) => {
        const { title, body } = notification.request.content;
        if (title || body) {
          toast.info([title, body].filter(Boolean).join(": "));
        }
      },
    );

    const responseSub = Notifications.addNotificationResponseReceivedListener(
      (response) => navigateFromNotificationResponse(response),
    );

    Notifications.getLastNotificationResponseAsync()
      .then(navigateFromNotificationResponse)
      .catch((err) =>
        console.error("getLastNotificationResponseAsync error:", err),
      );

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, []);
}
