import { api_client } from "@/lib/api/api-client";
import { getErrorMessage } from "@/lib/api/api-response";
import type { SafeProfile } from "@/lib/api/strip-password";
import { useAuthStore } from "@/store/auth.store";
import { create } from "zustand";

// ─── State ─────────────────────────────────────────────────────────────────

interface ProfileState {
  /** The authenticated user's full profile (password excluded) */
  profile: SafeProfile | null;
  /** Whether the profile is being fetched */
  isLoading: boolean;
  /** Whether an update operation is in flight */
  isUpdating: boolean;
  /** Whether a password change is in flight */
  isChangingPassword: boolean;
  /** Last error message, if any */
  error: string | null;
}

interface ProfileActions {
  /** Fetch the authenticated user's own profile */
  fetchProfile: () => Promise<void>;
  /** Update own profile fields */
  updateProfile: (params: Record<string, unknown>) => Promise<void>;
  /** Change own password */
  changePassword: (params: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<void>;
  /** Clear error */
  clearError: () => void;
  /** Reset store to initial state */
  reset: () => void;
}

type ProfileStore = ProfileState & ProfileActions;

// ─── Initial State ─────────────────────────────────────────────────────────

const initialState: ProfileState = {
  profile: null,
  isLoading: false,
  isUpdating: false,
  isChangingPassword: false,
  error: null,
};

// ─── Store ─────────────────────────────────────────────────────────────────

export const useProfileStore = create<ProfileStore>()((set) => ({
  ...initialState,

  /* ── Fetch Profile ──────────────────────────────────────────── */
  fetchProfile: async () => {
    set({ isLoading: true, error: null });

    try {
      const { data } = await api_client.get("/auth/profile");
      set({
        profile: data.data ?? null,
        isLoading: false,
      });
    } catch (err: unknown) {
      set({
        isLoading: false,
        error: getErrorMessage(err),
      });
    }
  },

  /* ── Update Profile ─────────────────────────────────────────── */
  updateProfile: async (params) => {
    set({ isUpdating: true, error: null });

    try {
      const { data } = await api_client.patch("/auth/profile", params);
      const updatedProfile = data.data ?? null;
      set({
        profile: updatedProfile,
        isUpdating: false,
      });

      if (updatedProfile) {
        useAuthStore.getState().updateUser({
          name: updatedProfile.name,
          username: updatedProfile.username,
          avatar: updatedProfile.avatar ?? null,
        });
      }
    } catch (err: unknown) {
      set({
        isUpdating: false,
        error: getErrorMessage(err),
      });
      throw new Error(getErrorMessage(err));
    }
  },

  /* ── Change Password ────────────────────────────────────────── */
  changePassword: async (params) => {
    set({ isChangingPassword: true, error: null });

    try {
      await api_client.patch("/auth/change-password", params);
      set({ isChangingPassword: false });
    } catch (err: unknown) {
      set({
        isChangingPassword: false,
        error: getErrorMessage(err),
      });
      throw new Error(getErrorMessage(err));
    }
  },

  /* ── Clear Error ────────────────────────────────────────────── */
  clearError: () => set({ error: null }),

  /* ── Reset ──────────────────────────────────────────────────── */
  reset: () => set(initialState),
}));
