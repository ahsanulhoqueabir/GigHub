import { apiPublic } from "@/lib/api/api-public";
import { getErrorMessage } from "@/lib/api/api-response";
import type { HomepageData } from "@/services/general.service";
import { create } from "zustand";

// ─── State ─────────────────────────────────────────────────────────────────

interface GeneralState {
  // Homepage
  homepageData: HomepageData | null;
  isLoadingHomepage: boolean;
  homepageError: string | null;
}

interface GeneralActions {
  /** Hydrate from server-fetched homepage data */
  hydrateHomepage: (data: HomepageData) => void;
  // Homepage
  fetchHomepageData: () => Promise<void>;
  clearHomepageError: () => void;

  // Reset
  reset: () => void;
}

type GeneralStore = GeneralState & GeneralActions;

// ─── Initial State ─────────────────────────────────────────────────────────

const initialState: GeneralState = {
  homepageData: null,
  isLoadingHomepage: false,
  homepageError: null,
};

// ─── Store ─────────────────────────────────────────────────────────────────

export const useGeneralStore = create<GeneralStore>()((set) => ({
  ...initialState,

  /* ── Hydrate (server-side) ─────────────────────────────────── */
  hydrateHomepage: (data: HomepageData) =>
    set({ homepageData: data, isLoadingHomepage: false, homepageError: null }),

  /* ── Homepage ──────────────────────────────────────────────── */
  fetchHomepageData: async () => {
    set({ isLoadingHomepage: true, homepageError: null });

    try {
      const { data } = await apiPublic.get("/homepage");
      set({
        homepageData: data.data ?? null,
        isLoadingHomepage: false,
      });
    } catch (err: unknown) {
      set({
        isLoadingHomepage: false,
        homepageError: getErrorMessage(err),
      });
    }
  },

  clearHomepageError: () => set({ homepageError: null }),

  /* ── Reset ─────────────────────────────────────────────────── */
  reset: () => set(initialState),
}));
