import axios, { AxiosInstance } from "axios";
import { getErrorMessage } from "./api-response";

/**
 * Create a public axios instance for endpoints that do NOT require
 * authentication (e.g. browsing gigs, jobs, categories, departments).
 *
 * This instance skips the auth interceptor entirely — no token is
 * attached and no authentication check is performed.
 */
const createPublicApi = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: "/api",
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Response interceptor for consistent error handling
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Convert axios errors to a consistent shape using getErrorMessage
      const message = getErrorMessage(error);
      return Promise.reject(new Error(message));
    },
  );

  return instance;
};

// Export a singleton instance
export const apiPublic = createPublicApi();
