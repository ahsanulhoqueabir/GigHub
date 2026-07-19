import axios, { AxiosError, AxiosInstance } from "axios";
import { API_BASE_URL } from "./config";
import { AuthNavigationHelper } from "./auth-navigation-helper";
import { selectIsAuthenticated, useAuthStore } from "@/store/auth.store";

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

      if (!isPublic) {
        const isAuthenticated = selectIsAuthenticated(useAuthStore.getState());

        if (!isAuthenticated) {
          return Promise.reject(
            new Error("Authentication required. Please log in."),
          );
        }
      }

      const { accessToken } = useAuthStore.getState();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
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
            await useAuthStore.getState().initAuth();

            const { accessToken } = useAuthStore.getState();

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
