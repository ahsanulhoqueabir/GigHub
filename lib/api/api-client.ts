import axios, { AxiosError, AxiosInstance } from "axios";
import { AuthNavigationHelper } from "./auth-navigation-helper";
import { API_BASE_URL } from "./config";

/**
 * Helper accessor to retrieve useAuthStore lazily, avoiding require cycles between
 * store/auth.store.ts and lib/api/api-client.ts.
 */
const getAuthStore = () => {
  const { useAuthStore } = require("@/store/auth.store");
  return useAuthStore;
};

/**
 * Axios singleton for use in Zustand stores. Automatically attaches the
 * JWT access token from the auth store and waits for auth hydration
 * before sending any authenticated request.
 */
const createApiClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  instance.interceptors.request.use(
    async (config) => {
      const isPublic = config.url?.startsWith("/auth/") ?? false;
      const authState = getAuthStore().getState();

      if (!isPublic) {
        const isAuthenticated =
          authState.user !== null && authState.accessToken !== null;

        if (!isAuthenticated) {
          return Promise.reject(
            new Error("Authentication required. Please log in."),
          );
        }
      }

      if (authState.accessToken) {
        config.headers.Authorization = `Bearer ${authState.accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const original_request = error.config as typeof error.config & {
        _retry?: boolean;
      };

      const isAuthRoute = error.config?.url?.startsWith("/auth/") ?? false;

      if (
        !isAuthRoute &&
        (error.response?.status === 401 || error.response?.status === 403)
      ) {
        if (error.response?.status === 401 && !original_request?._retry) {
          if (original_request) {
            original_request._retry = true;
          }

          try {
            await getAuthStore().getState().initAuth();

            const { accessToken } = getAuthStore().getState();

            if (!accessToken) {
              AuthNavigationHelper.handleAuthError(error);
              return Promise.reject(new Error("Authentication failed"));
            }

            if (original_request?.headers) {
              original_request.headers.Authorization = `Bearer ${accessToken}`;
            }

            return original_request
              ? instance(original_request)
              : Promise.reject(error);
          } catch (refresh_error) {
            AuthNavigationHelper.handleAuthError(refresh_error);
            return Promise.reject(refresh_error);
          }
        } else {
          AuthNavigationHelper.handleAuthError(error);
          return Promise.reject(error);
        }
      }

      return Promise.reject(error);
    },
  );

  return instance;
};

export const api_client = createApiClient();
