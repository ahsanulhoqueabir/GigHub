import axios, { AxiosInstance, AxiosError } from "axios";
import { useAuthStore } from "@/store/auth.store";
import { ServerNavigationHelper } from "./server-navigation-helper";

/**
 * Create axios instance for use in Zustand stores
 * This instance automatically includes the access token from auth store
 * and waits for auth hydration before sending any request.
 */
const createApiClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: "/api",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const waitForHydration = () =>
    new Promise<void>((resolve) => {
      const { hasHydrated } = useAuthStore.getState();
      if (hasHydrated) {
        resolve();
        return;
      }

      const unsubscribe = useAuthStore.subscribe((state) => {
        if (state.hasHydrated) {
          unsubscribe();
          resolve();
        }
      });
    });

  // Request interceptor to wait for auth and add token
  instance.interceptors.request.use(
    async (config) => {
      // Let axios/browser set Content-Type for FormData (multipart)
      if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
      }

      // Skip auth check for public endpoints
      const isPublic = config.url?.startsWith("/auth/") ?? false;

      if (!isPublic) {
        await waitForHydration();

        const accessToken = await useAuthStore.getState().getValidAccessToken();

        if (!accessToken) {
          return Promise.reject(
            new Error("Authentication required. Please log in."),
          );
        }

        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  // Response interceptor to handle token refresh and auth errors
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const original_request = error.config as typeof error.config & {
        _retry?: boolean;
      };

      // Handle authorization errors (401, 403)
      if (error.response?.status === 401 || error.response?.status === 403) {
        // If error is 401 and we haven't retried yet, try token refresh
        if (error.response?.status === 401 && !original_request?._retry) {
          if (original_request) {
            original_request._retry = true;
          }

          try {
            // Try to refresh the token
            const accessToken = await useAuthStore
              .getState()
              .refreshAccessToken();

            // If we still don't have a token after refresh attempt, handle auth error
            if (!accessToken) {
              ServerNavigationHelper.handleAuthError(error);
              return Promise.reject(new Error("Authentication failed"));
            }

            // Retry the original request with new token
            if (original_request?.headers) {
              original_request.headers.Authorization = `Bearer ${accessToken}`;
            }

            return original_request
              ? instance(original_request)
              : Promise.reject(error);
          } catch (refresh_error) {
            // If refresh fails, handle auth error
            ServerNavigationHelper.handleAuthError(refresh_error);
            return Promise.reject(refresh_error);
          }
        } else {
          // For 403 or already retried 401, handle auth error immediately
          ServerNavigationHelper.handleAuthError(error);
          return Promise.reject(error);
        }
      }

      return Promise.reject(error);
    },
  );

  return instance;
};

// Export a singleton instance
export const api_client = createApiClient();
