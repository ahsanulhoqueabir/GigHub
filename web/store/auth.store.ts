import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { api_client } from "@/lib/api/api-client";
import type {
  AuthUser,
  LoginParams,
  SignUpParams,
} from "@/types/business/user.types";

// ─── State Shape ───────────────────────────────────────────────────────────

export interface AuthState {
  /** Authenticated user profile */
  user: AuthUser | null;
  /** JWT access token */
  accessToken: string | null;
  /** JWT refresh token */
  refreshToken: string | null;
  /** Whether the store has rehydrated from storage */
  hasHydrated: boolean;
  /** Whether an auth operation is in flight */
  isProcessing: boolean;
  /** Last error message, if any */
  error: string | null;
}

interface AuthActions {
  /** Login with email & password */
  login: (params: LoginParams) => Promise<void>;
  /** Sign up a new account */
  signUp: (params: SignUpParams) => Promise<void>;
  /** Logout — clears persisted state */
  logout: () => void;
  /** Re-initialise auth from stored token (e.g. on page refresh) */
  initAuth: () => Promise<void>;
  /** Ensure we have a valid access token (refresh if needed) */
  getValidAccessToken: () => Promise<string | null>;
  /** Refresh access token using refresh token */
  refreshAccessToken: () => Promise<string | null>;
  /** Set hydration flag (called by persist onRehydrate) */
  setHasHydrated: (value: boolean) => void;
  /** Clear any error */
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

// ─── Defaults ──────────────────────────────────────────────────────────────

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  hasHydrated: false,
  isProcessing: false,
  error: null,
};

// ─── Token helpers ─────────────────────────────────────────────────────────

const decodeJwtExp = (token: string): number | null => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );

    const json = atob(padded);
    const parsed = JSON.parse(json) as { exp?: number };
    return typeof parsed.exp === "number" ? parsed.exp : null;
  } catch {
    return null;
  }
};

const isTokenExpired = (token: string, skewSeconds = 30): boolean => {
  const exp = decodeJwtExp(token);
  if (!exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return exp <= now + skewSeconds;
};

// ─── Store ─────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      /* ── State ──────────────────────────────────────────────────── */
      ...initialState,

      /* ── Hydration ──────────────────────────────────────────────── */
      setHasHydrated: (value) => set({ hasHydrated: value }),

      /* ── Login ──────────────────────────────────────────────────── */
      login: async (params) => {
        set({ isProcessing: true, error: null });

        try {
          const { data } = await api_client.post("/auth/login", params);
          const { user, access_token, refresh_token, token } = data.data;

          const accessToken = access_token ?? token;
          const refreshToken = refresh_token ?? null;

          set({
            user,
            accessToken,
            refreshToken,
            isProcessing: false,
            error: null,
          });
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { error?: string } } })?.response
              ?.data?.error ||
            (err as Error).message ||
            "Login failed";
          set({ isProcessing: false, error: message });
          throw new Error(message);
        }
      },

      /* ── Sign Up ────────────────────────────────────────────────── */
      signUp: async (params) => {
        set({ isProcessing: true, error: null });

        try {
          // Build FormData for multipart upload
          const formData = new FormData();
          formData.append("email", params.email);
          formData.append("password", params.password);
          formData.append("name", params.name);

          if (params.username) {
            formData.append("username", params.username);
          }

          if (params.bio) {
            formData.append("bio", params.bio);
          }

          if (params.skills && params.skills.length > 0) {
            formData.append("skills", JSON.stringify(params.skills));
          }

          if (params.avatar) {
            formData.append("avatar", params.avatar);
          }

          const { data } = await api_client.post("/auth/signup", formData);
          const { user, access_token, refresh_token, token } = data.data;

          const accessToken = access_token ?? token;
          const refreshToken = refresh_token ?? null;

          set({
            user,
            accessToken,
            refreshToken,
            isProcessing: false,
            error: null,
          });
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { error?: string } } })?.response
              ?.data?.error ||
            (err as Error).message ||
            "Sign up failed";
          set({ isProcessing: false, error: message });
          throw new Error(message);
        }
      },

      /* ── Logout ─────────────────────────────────────────────────── */
      logout: () => {
        set({ ...initialState, hasHydrated: get().hasHydrated });
      },

      /* ── Refresh Access Token ───────────────────────────────────── */
      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return null;

        if (isTokenExpired(refreshToken)) {
          set({ ...initialState, hasHydrated: get().hasHydrated });

          if (typeof window !== "undefined") {
            const shouldRedirect = window.confirm(
              "Your session has expired. Go to login page?",
            );

            if (shouldRedirect) {
              window.location.assign("/login");
            }
          }

          return null;
        }

        try {
          const { data } = await api_client.post("/auth/refresh", {
            refresh_token: refreshToken,
          });

          const {
            access_token: newAccessToken,
            refresh_token: newRefreshToken,
            token,
          } = data.data;

          const accessToken = newAccessToken ?? token ?? null;
          const updatedRefreshToken = newRefreshToken ?? refreshToken;

          if (!accessToken) {
            return null;
          }

          set({
            accessToken,
            refreshToken: updatedRefreshToken,
            error: null,
          });

          return accessToken;
        } catch {
          set({ ...initialState, hasHydrated: get().hasHydrated });

          if (typeof window !== "undefined") {
            const shouldRedirect = window.confirm(
              "Your session has expired. Go to login page?",
            );

            if (shouldRedirect) {
              window.location.assign("/login");
            }
          }

          return null;
        }
      },

      /* ── Ensure Valid Access Token ─────────────────────────────── */
      getValidAccessToken: async () => {
        const { accessToken, refreshToken } = get();

        if (accessToken && !isTokenExpired(accessToken)) {
          return accessToken;
        }

        if (!refreshToken) {
          return null;
        }

        return get().refreshAccessToken();
      },

      /* ── Init Auth (re-validate stored token) ───────────────────── */
      initAuth: async () => {
        set({ isProcessing: true, error: null });

        const accessToken = await get().getValidAccessToken();
        if (!accessToken) {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isProcessing: false,
          });
          return;
        }

        try {
          const { data } = await api_client.get("/profiles/me");
          set({ user: data.data, error: null, isProcessing: false });
        } catch {
          // Token invalid/expired — clear everything
          set({
            ...initialState,
            hasHydrated: get().hasHydrated,
            isProcessing: false,
          });
        }
      },

      /* ── Clear Error ────────────────────────────────────────────── */
      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    },
  ),
);

// ─── Derived helpers ───────────────────────────────────────────────────────

/** Convenience selector – true when a non-null user & token exist */
export const selectIsAuthenticated = (s: AuthStore) =>
  s.user !== null && s.accessToken !== null;
