import { create } from "zustand";
import { api_client } from "@/lib/api/api-client";
import type { Profile } from "@/types/db/profile.types";

type UpdateProfileInput = {
  name: string;
  bio?: string;
  skills?: string[];
};

type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export interface ProfileState {
  profile: Profile | null;
  isLoading: boolean;
  isSaving: boolean;
  isUploadingAvatar: boolean;
  isChangingPassword: boolean;
  error: string | null;
  passwordError: string | null;
  saveSuccess: boolean;
  passwordSuccess: boolean;
}

interface ProfileActions {
  fetchProfile: () => Promise<void>;
  updateProfile: (values: UpdateProfileInput) => Promise<void>;
  changePassword: (values: ChangePasswordInput) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  clearError: () => void;
  clearPasswordError: () => void;
  clearSaveSuccess: () => void;
  clearPasswordSuccess: () => void;
}

type ProfileStore = ProfileState & ProfileActions;

const initialState: ProfileState = {
  profile: null,
  isLoading: false,
  isSaving: false,
  isUploadingAvatar: false,
  isChangingPassword: false,
  error: null,
  passwordError: null,
  saveSuccess: false,
  passwordSuccess: false,
};

const getErrorMessage = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { error?: string } } })?.response?.data
    ?.error ||
  (err as Error).message ||
  fallback;

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

export const useProfileStore = create<ProfileStore>()((set) => ({
  ...initialState,

  clearError: () => set({ error: null }),
  clearPasswordError: () => set({ passwordError: null }),
  clearSaveSuccess: () => set({ saveSuccess: false }),
  clearPasswordSuccess: () => set({ passwordSuccess: false }),

  fetchProfile: async () => {
    set({ isLoading: true, error: null });

    try {
      const { data } = await api_client.get("/profiles/me");
      set({ profile: data.data, error: null });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, "Failed to load profile") });
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (values) => {
    set({ isSaving: true, error: null, saveSuccess: false });

    try {
      await api_client.patch("/profiles/me", {
        type: "basic_info",
        display_name: values.name,
        bio: values.bio?.trim() || "",
        skills: values.skills || [],
      });

      const { data } = await api_client.get("/profiles/me");
      set({ profile: data.data, saveSuccess: true });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, "Failed to update profile") });
    } finally {
      set({ isSaving: false });
    }
  },

  changePassword: async (values) => {
    set({
      isChangingPassword: true,
      passwordError: null,
      passwordSuccess: false,
    });

    try {
      await api_client.post("/auth/change-password", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      set({ passwordSuccess: true });
    } catch (err: unknown) {
      set({
        passwordError: getErrorMessage(err, "Failed to change password"),
      });
    } finally {
      set({ isChangingPassword: false });
    }
  },

  uploadAvatar: async (file) => {
    set({ isUploadingAvatar: true, error: null });

    try {
      const base64 = await readAsDataUrl(file);
      await api_client.patch("/profiles/me", {
        type: "avatar",
        avatar_base64: base64,
      });

      const { data } = await api_client.get("/profiles/me");
      set({ profile: data.data });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, "Failed to upload avatar") });
    } finally {
      set({ isUploadingAvatar: false });
    }
  },
}));

// ─── Derived helpers ───────────────────────────────────────────────────────

export const selectProfile = (s: ProfileStore) => s.profile;
export const selectProfileLoading = (s: ProfileStore) => s.isLoading;
export const selectProfileSaving = (s: ProfileStore) => s.isSaving;
export const selectProfileAvatarUploading = (s: ProfileStore) =>
  s.isUploadingAvatar;
export const selectProfileChangingPassword = (s: ProfileStore) =>
  s.isChangingPassword;
export const selectProfileError = (s: ProfileStore) => s.error;
export const selectProfilePasswordError = (s: ProfileStore) => s.passwordError;
export const selectProfileSaveSuccess = (s: ProfileStore) => s.saveSuccess;
export const selectProfilePasswordSuccess = (s: ProfileStore) =>
  s.passwordSuccess;
