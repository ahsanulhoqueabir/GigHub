import { AxiosError } from "axios";
import { router } from "expo-router";

const getAuthStore = () => {
  const { useAuthStore } = require("@/store/auth.store");
  return useAuthStore;
};

/**
 * Handles auth errors surfaced by the API client outside of React context.
 */
export class AuthNavigationHelper {
  static handleAuthError(error: unknown): void {
    const isAxiosError = (err: unknown): err is AxiosError => {
      return (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        "config" in err
      );
    };

    const status = isAxiosError(error) ? error.response?.status : undefined;

    getAuthStore().getState().logout();

    // Defer navigation so Expo Router navigation context is ready and available
    setTimeout(() => {
      try {
        if (status === 403) {
          router.replace("/unauthorized");
        } else {
          router.replace("/(auth)/login");
        }
      } catch (navError) {
        console.warn("Navigation on auth error failed:", navError);
      }
    }, 0);
  }
}
