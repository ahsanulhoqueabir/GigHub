import { apiPublic } from "@/lib/api/api-public";
import { getErrorMessage } from "@/lib/api/api-response";
import type { AdBanner } from "@/types/db/ad-banner.types";
import type { Announcement } from "@/types/db/announcement.types";
import type { HeroBanner } from "@/types/db/hero-banner.types";
import type { SystemConfig } from "@/types/db/system-config.types";
import { create } from "zustand";

export interface PublicSiteData {
  system_config: SystemConfig | null;
  hero_banners: HeroBanner[];
  ad_banners: AdBanner[];
  announcements: Announcement[];
}

interface SiteDataState {
  data: PublicSiteData | null;
  isLoading: boolean;
  error: string | null;
  /** Tracks if initial site-wide fetch has been done */
  hasFetched: boolean;
}

interface SiteDataActions {
  /** Hydrate store with server-fetched data (called from layout) */
  hydrate: (data: PublicSiteData) => void;
  fetchSiteData: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

type SiteDataStore = SiteDataState & SiteDataActions;

const initialState: SiteDataState = {
  data: null,
  isLoading: false,
  error: null,
  hasFetched: false,
};

export const useSiteDataStore = create<SiteDataStore>()((set) => ({
  ...initialState,

  /** Hydrate from server-fetched data — marks as fetched so no client fetch runs */
  hydrate: (data: PublicSiteData) =>
    set({ data, isLoading: false, error: null, hasFetched: true }),

  fetchSiteData: async () => {
    // Avoid duplicate fetches
    set((state) => {
      if (state.hasFetched) return state;
      return { isLoading: true, error: null };
    });

    try {
      const { data } = await apiPublic.get("/site-data");
      set({
        data: data.data ?? null,
        isLoading: false,
        hasFetched: true,
      });
    } catch (err: unknown) {
      set({
        isLoading: false,
        error: getErrorMessage(err),
        hasFetched: true,
      });
    }
  },

  clearError: () => set({ error: null }),

  reset: () => set(initialState),
}));
