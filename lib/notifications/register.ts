import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export type NotificationPermissionStatus = "granted" | "denied";

/**
 * Android 13+ requires at least one notification channel to exist before
 * the system will show the permission prompt.
 */
async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync("default", {
    name: "default",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

/**
 * Requests notification permission if not already granted. Never throws —
 * on any failure (simulator, unsupported platform, OS error) the app must
 * keep working normally with notification features simply disabled.
 */
export async function requestNotificationPermission(): Promise<NotificationPermissionStatus> {
  try {
    if (!Device.isDevice) {
      return "denied";
    }

    await ensureAndroidChannel();

    const existing = await Notifications.getPermissionsAsync();
    if (existing.status === "granted") {
      return "granted";
    }

    const requested = await Notifications.requestPermissionsAsync();
    return requested.status === "granted" ? "granted" : "denied";
  } catch (err) {
    console.error("requestNotificationPermission error:", err);
    return "denied";
  }
}
