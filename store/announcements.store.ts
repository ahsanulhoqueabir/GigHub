import { api_client } from "@/lib/api/api-client";
import { getErrorMessage } from "@/lib/api/api-response";
import { defaultPagination } from "@/lib/pagination";
import type { Announcement } from "@/types/db/announcement.types";
import type { PaginationMeta } from "@/types/pagination.types";
import { create } from "zustand";

export interface AnnouncementsState {
  items: Announcement[];
  isLoading: boolean;
  error: string | null;
  pagination: PaginationMeta;
  currentPage: number;
  pageSize: number;
}

interface AnnouncementsActions {
  fetchItems: (page?: number, limit?: number) => Promise<void>;
  getItem: (id: string) => Promise<Announcement | null>;
  createItem: (data: Partial<Announcement>) => Promise<void>;
  updateItem: (id: string, data: Partial<Announcement>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  setPage: (page: number) => void;
  clearError: () => void;
}

type AnnouncementsStore = AnnouncementsState & AnnouncementsActions;

const initialState: AnnouncementsState = {
  items: [],
  isLoading: false,
  error: null,
  pagination: defaultPagination(),
  currentPage: 1,
  pageSize: 20,
};

export const useAnnouncementsStore = create<AnnouncementsStore>()(
  (set, get) => ({
    ...initialState,

    fetchItems: async (page = 1, limit = 20) => {
      set({
        isLoading: true,
        error: null,
        currentPage: page,
        pageSize: limit,
      });
      try {
        const { data } = await api_client.get("/admin/announcements", {
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
        const { data } = await api_client.get(`/admin/announcements/${id}`);
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
        await api_client.post("/admin/announcements", itemData);
        set({ isLoading: false });
      } catch (err: unknown) {
        set({ isLoading: false, error: getErrorMessage(err) });
        throw err;
      }
    },

    updateItem: async (id, itemData) => {
      set({ isLoading: true, error: null });
      try {
        await api_client.patch(`/admin/announcements/${id}`, itemData);
        set({ isLoading: false });
      } catch (err: unknown) {
        set({ isLoading: false, error: getErrorMessage(err) });
        throw err;
      }
    },

    deleteItem: async (id) => {
      set({ isLoading: true, error: null });
      try {
        await api_client.delete(`/admin/announcements/${id}`);
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
  }),
);
