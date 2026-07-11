import { api_client } from "@/lib/api/api-client";
import { getErrorMessage } from "@/lib/api/api-response";
import { defaultPagination } from "@/lib/pagination";
import type { HeroBanner } from "@/types/db/hero-banner.types";
import type { PaginationMeta } from "@/types/pagination.types";
import { create } from "zustand";

export interface HeroBannersState {
  items: HeroBanner[];
  isLoading: boolean;
  error: string | null;
  pagination: PaginationMeta;
  currentPage: number;
  pageSize: number;
}

interface HeroBannersActions {
  fetchItems: (page?: number, limit?: number) => Promise<void>;
  getItem: (id: string) => Promise<HeroBanner | null>;
  createItem: (data: Partial<HeroBanner>) => Promise<void>;
  updateItem: (id: string, data: Partial<HeroBanner>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  setPage: (page: number) => void;
  clearError: () => void;
}

type HeroBannersStore = HeroBannersState & HeroBannersActions;

const initialState: HeroBannersState = {
  items: [],
  isLoading: false,
  error: null,
  pagination: defaultPagination(),
  currentPage: 1,
  pageSize: 20,
};

export const useHeroBannersStore = create<HeroBannersStore>()((set, get) => ({
  ...initialState,

  fetchItems: async (page = 1, limit = 20) => {
    set({ isLoading: true, error: null, currentPage: page, pageSize: limit });
    try {
      const { data } = await api_client.get("/admin/hero-banners", {
        params: { page, limit },
      });
      set({
        items: data.data?.items ?? [],
        pagination: {
          ...(data.data?.pagination ?? defaultPagination()),
        },
        isLoading: false,
      });
    } catch (err: unknown) {
      set({ isLoading: false, error: getErrorMessage(err) });
    }
  },

  getItem: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api_client.get(`/admin/hero-banners/${id}`);
      set({ isLoading: false });
      return data.data ?? null;
    } catch (err: unknown) {
      set({ isLoading: false, error: getErrorMessage(err) });
      return null;
    }
  },

  createItem: async (itemData) => {
    set({ isLoading: true, error: null });
    try {
      await api_client.post("/admin/hero-banners", itemData);
      set({ isLoading: false });
    } catch (err: unknown) {
      set({ isLoading: false, error: getErrorMessage(err) });
      throw err;
    }
  },

  updateItem: async (id, itemData) => {
    set({ isLoading: true, error: null });
    try {
      await api_client.patch(`/admin/hero-banners/${id}`, itemData);
      set({ isLoading: false });
    } catch (err: unknown) {
      set({ isLoading: false, error: getErrorMessage(err) });
      throw err;
    }
  },

  deleteItem: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api_client.delete(`/admin/hero-banners/${id}`);
      const { currentPage, pageSize } = get();
      await get().fetchItems(currentPage, pageSize);
    } catch (err: unknown) {
      set({ isLoading: false, error: getErrorMessage(err) });
      throw err;
    }
  },

  setPage: (page) => {
    const { pageSize } = get();
    get().fetchItems(page, pageSize);
  },

  clearError: () => set({ error: null }),
}));
