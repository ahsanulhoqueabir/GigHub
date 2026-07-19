import axios, { AxiosInstance } from "axios";
import { API_BASE_URL } from "./config";
import { getErrorMessage } from "./api-response";

/**
 * Public axios instance for endpoints that do NOT require authentication
 * (e.g. browsing gigs, jobs, categories, departments).
 *
 * Skips the auth interceptor entirely — no token is attached and no
 * authentication check is performed.
 */
const createPublicApi = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const message = getErrorMessage(error);
      return Promise.reject(new Error(message));
    },
  );

  return instance;
};

export const apiPublic = createPublicApi();
