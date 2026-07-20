import { apiPublic } from "@/lib/api/api-public";
import { getErrorMessage } from "@/lib/api/api-response";
import type { CategoryMinimal } from "@/types/db/category.types";
import { create } from "zustand";

interface CategoriesState {
  categories: CategoryMinimal[];
  isLoading: boolean;
  error: string | null;
  hasFetched: boolean;
}

interface CategoriesActions {
  fetchCategories: (force?: boolean) => Promise<void>;
  reset: () => void;
}

type CategoriesStore = CategoriesState & CategoriesActions;

const initialState: CategoriesState = {
  categories: [],
  isLoading: false,
  error: null,
  hasFetched: false,
};

export const useCategoriesStore = create<CategoriesStore>()((set, get) => ({
  ...initialState,

  fetchCategories: async (force = false) => {
    if ((get().hasFetched && !force) || get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      const { data } = await apiPublic.get("/category", {
        params: {
          limit: 50,
          sortBy: "ordering",
          sortOrder: "asc",
          parent: "null",
        },
      });
      set({
        categories: data.data?.items ?? [],
        isLoading: false,
        hasFetched: true,
      });
    } catch (err: unknown) {
      set({ isLoading: false, error: getErrorMessage(err), hasFetched: true });
    }
  },

  reset: () => set({ ...initialState }),
}));
