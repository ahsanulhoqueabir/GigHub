import {
  requestNotificationPermission,
  type NotificationPermissionStatus,
} from "@/lib/notifications/register";
import { subscribeToAnnouncementsTopic } from "@/lib/notifications/subscribe";
import { create } from "zustand";

interface NotificationsState {
  permissionStatus: NotificationPermissionStatus | "unknown";
  isSubscribed: boolean;
  isInitializing: boolean;
}

interface NotificationsActions {
  /**
   * Requests notification permission and, if granted, subscribes the
   * device to the announcements topic. Safe to call multiple times —
   * concurrent calls are collapsed, and repeat calls with an already
   * granted/subscribed state are cheap no-ops (see subscribeToAnnouncementsTopic).
   * Never throws — notification setup must never block app usage.
   */
  initNotifications: () => Promise<void>;
}

type NotificationsStore = NotificationsState & NotificationsActions;

export const useNotificationsStore = create<NotificationsStore>()(
  (set, get) => ({
    permissionStatus: "unknown",
    isSubscribed: false,
    isInitializing: false,

    initNotifications: async () => {
      if (get().isInitializing) return;
      set({ isInitializing: true });

      try {
        const status = await requestNotificationPermission();
        set({ permissionStatus: status });

        if (status === "granted") {
          const isSubscribed = await subscribeToAnnouncementsTopic();
          set({ isSubscribed });
        }
      } finally {
        set({ isInitializing: false });
      }
    },
  }),
);
