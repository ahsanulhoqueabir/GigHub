import { AxiosError } from "axios";
import { router } from "expo-router";
import { useAuthStore } from "@/store/auth.store";

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

    if (status === 403) {
      router.replace("/unauthorized");
      return;
    }

    useAuthStore.getState().logout();
    router.replace("/(auth)/login");
  }
}
