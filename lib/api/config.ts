/**
 * Base URL for the GigHub backend API.
 * Override for local development via EXPO_PUBLIC_API_URL in .env.
 */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "https://gighub.ahsanull.com/api";
