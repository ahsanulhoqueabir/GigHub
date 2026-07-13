import { api_client } from "@/lib/api/api-client";
import { getErrorMessage } from "@/lib/api/api-response";
import type { AdminDashboardData } from "@/types/admin-dashboard.types";
import { create } from "zustand";

// ─── State ──────────────────────────────────────────────────────────────────

export interface AdminDashboardState {
  data: AdminDashboardData | null;
  isLoading: boolean;
  error: string | null;
}

// ─── Actions ────────────────────────────────────────────────────────────────

interface AdminDashboardActions {
  fetchDashboard: () => Promise<void>;
  clearError: () => void;
}

// ─── Store ──────────────────────────────────────────────────────────────────

type AdminDashboardStore = AdminDashboardState & AdminDashboardActions;

const initialState: AdminDashboardState = {
  data: null,
  isLoading: false,
  error: null,
};

export const useAdminDashboardStore = create<AdminDashboardStore>()((set) => ({
  ...initialState,

  fetchDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api_client.get("/admin/dashboard");
      set({
        data: data.data ?? null,
        isLoading: false,
      });
    } catch (err: unknown) {
      set({
        isLoading: false,
        error: getErrorMessage(err),
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

// ─── Selectors ──────────────────────────────────────────────────────────────

export const selectDashboardData = (state: AdminDashboardStore) => state.data;
export const selectDashboardLoading = (state: AdminDashboardStore) =>
  state.isLoading;
export const selectDashboardError = (state: AdminDashboardStore) => state.error;
