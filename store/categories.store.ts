import { create } from "zustand";
import { api_client } from "@/lib/api/api-client";
import { Category } from "@/types/db/category.types";
import { PaginationMeta } from "@/types/pagination.types";
import { defaultPagination } from "@/lib/pagination";
import { getErrorMessage } from "@/lib/api/api-response";

export interface CategoriesState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  pagination: PaginationMeta;
  currentPage: number;
  pageSize: number;
  /** Tracks if initial site-wide fetch (limit=40) has been done */
  hasFetched: boolean;
}

interface CategoriesActions {
  fetchCategories: (page?: number, limit?: number) => Promise<void>;
  getCategory: (id: string) => Promise<Category | null>;
  createCategory: (data: Partial<Category>) => Promise<void>;
  updateCategory: (id: string, data: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  setPage: (page: number) => void;
  clearError: () => void;
}

type CategoriesStore = CategoriesState & CategoriesActions;

const initialState: CategoriesState = {
  categories: [],
  isLoading: false,
  error: null,
  pagination: defaultPagination(),
  currentPage: 1,
  pageSize: 20,
  hasFetched: false,
};

export const useCategoriesStore = create<CategoriesStore>()((set, get) => ({
  ...initialState,

  fetchCategories: async (page = 1, limit = 20) => {
    set({ isLoading: true, error: null, currentPage: page, pageSize: limit });
    try {
      // API: GET /api/category?page=2&limit=5
      // Response: { success, data: { items: [...], total, page, limit } }
      const { data } = await api_client.get(`/category`, {
        params: { page, limit },
      });
      set({
        categories: data.data?.items ?? [],
        pagination: {
          ...(data.data?.pagination ?? defaultPagination()),
        },
        isLoading: false,
        hasFetched: true,
      });
    } catch (err: unknown) {
      set({
        isLoading: false,
        error: getErrorMessage(err),
      });
    }
  },

  getCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // API: GET /api/category/:id
      // Response: { success, data: { ... } }
      const { data } = await api_client.get(`/category/${id}`);
      set({ isLoading: false });
      return data.data ?? null;
    } catch (err: unknown) {
      set({
        isLoading: false,
        error: getErrorMessage(err),
      });
      return null;
    }
  },

  createCategory: async (categoryData) => {
    set({ isLoading: true, error: null });
    try {
      // API: POST /api/category
      await api_client.post("/category", categoryData);
      set({ isLoading: false });
    } catch (err: unknown) {
      set({
        isLoading: false,
        error: getErrorMessage(err),
      });
      throw err;
    }
  },

  updateCategory: async (id, categoryData) => {
    set({ isLoading: true, error: null });
    try {
      // API: PATCH /api/category/:id
      await api_client.patch(`/category/${id}`, categoryData);
      set({ isLoading: false });
    } catch (err: unknown) {
      set({
        isLoading: false,
        error: getErrorMessage(err),
      });
      throw err;
    }
  },

  deleteCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // API: DELETE /api/category/:id
      await api_client.delete(`/category/${id}`);
      const { currentPage, pageSize } = get();
      await get().fetchCategories(currentPage, pageSize);
    } catch (err: unknown) {
      set({
        isLoading: false,
        error: getErrorMessage(err),
      });
      throw err;
    }
  },

  setPage: (page) => {
    const { pageSize } = get();
    get().fetchCategories(page, pageSize);
  },

  clearError: () => set({ error: null }),
}));
