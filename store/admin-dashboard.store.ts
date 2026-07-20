import { api_client } from "@/lib/api/api-client";
import { getErrorMessage } from "@/lib/api/api-response";
import type { AdminDashboardData } from "@/types/admin-dashboard.types";
import { create } from "zustand";

interface AdminDashboardState {
  data: AdminDashboardData | null;
  isLoading: boolean;
  error: string | null;
}

interface AdminDashboardActions {
  fetchDashboard: () => Promise<void>;
  clearError: () => void;
}

type AdminDashboardStore = AdminDashboardState & AdminDashboardActions;

export const useAdminDashboardStore = create<AdminDashboardStore>((set) => ({
  data: null,
  isLoading: false,
  error: null,

  fetchDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api_client.get("/admin/dashboard");
      set({ data: data.data, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: getErrorMessage(err) });
    }
  },

  clearError: () => set({ error: null }),
}));
