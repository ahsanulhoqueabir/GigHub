import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { apiPublic } from "@/lib/api/api-public";

const SUBSCRIBED_TOKEN_KEY = "announcements_subscribed_fcm_token";

async function getFcmToken(): Promise<string | null> {
  try {
    const tokenResponse = await Notifications.getDevicePushTokenAsync();
    return tokenResponse.data ?? null;
  } catch (err) {
    console.error("getFcmToken error:", err);
    return null;
  }
}

async function subscribeOnce(token: string): Promise<boolean> {
  try {
    await apiPublic.post("/push/subscribe", { token });
    return true;
  } catch (err) {
    console.error("subscribeOnce error:", err);
    return false;
  }
}

/**
 * Subscribes this device to the "announcements" FCM topic via the backend
 * (topic subscription happens server-side via Admin SDK, so no native
 * Firebase SDK is needed on-device — expo-notifications' device token is
 * enough). Skips the network call if the same token already subscribed
 * successfully on a previous launch, and retries once on failure.
 */
export async function subscribeToAnnouncementsTopic(): Promise<boolean> {
  const token = await getFcmToken();
  if (!token) return false;

  try {
    const lastSubscribedToken = await AsyncStorage.getItem(
      SUBSCRIBED_TOKEN_KEY,
    );
    if (lastSubscribedToken === token) {
      return true;
    }
  } catch (err) {
    console.error("subscribeToAnnouncementsTopic storage read error:", err);
  }

  let success = await subscribeOnce(token);
  if (!success) {
    success = await subscribeOnce(token);
  }

  if (success) {
    try {
      await AsyncStorage.setItem(SUBSCRIBED_TOKEN_KEY, token);
    } catch (err) {
      console.error("subscribeToAnnouncementsTopic storage write error:", err);
    }
  }

  return success;
}
