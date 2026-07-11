import { api_client } from "@/lib/api/api-client";
import { apiPublic } from "@/lib/api/api-public";
import { getErrorMessage } from "@/lib/api/api-response";
import type { SystemConfig } from "@/types/db/system-config.types";
import { create } from "zustand";

export interface SystemConfigState {
  config: SystemConfig | null;
  isLoading: boolean;
  error: string | null;
}

interface SystemConfigActions {
  fetchConfig: () => Promise<void>;
  fetchAdminConfig: () => Promise<void>;
  updateConfig: (data: Partial<SystemConfig>) => Promise<void>;
  clearError: () => void;
}

type SystemConfigStore = SystemConfigState & SystemConfigActions;

const initialState: SystemConfigState = {
  config: null,
  isLoading: false,
  error: null,
};

export const useSystemConfigStore = create<SystemConfigStore>()((set) => ({
  ...initialState,

  fetchConfig: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await apiPublic.get("/site-data");
      set({
        config: data.data?.system_config ?? null,
        isLoading: false,
      });
    } catch (err: unknown) {
      set({ isLoading: false, error: getErrorMessage(err) });
    }
  },

  fetchAdminConfig: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api_client.get("/admin/system-config");
      set({
        config: data.data ?? null,
        isLoading: false,
      });
    } catch (err: unknown) {
      set({ isLoading: false, error: getErrorMessage(err) });
    }
  },

  updateConfig: async (configData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api_client.patch(
        "/admin/system-config",
        configData,
      );
      set({ config: data.data ?? null, isLoading: false });
    } catch (err: unknown) {
      set({ isLoading: false, error: getErrorMessage(err) });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
