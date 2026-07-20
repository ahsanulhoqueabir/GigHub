import { apiPublic } from "@/lib/api/api-public";
import { getErrorMessage } from "@/lib/api/api-response";
import type { AdBanner } from "@/types/db/ad-banner.types";
import type { GigListItem } from "@/types/db/gig.types";
import type { HeroBanner } from "@/types/db/hero-banner.types";
import type { JobListItem } from "@/types/db/job.types";
import { create } from "zustand";

interface HomepageData {
  gigs: GigListItem[];
  jobs: JobListItem[];
  tuitions: JobListItem[];
}

interface PublicSiteData {
  hero_banners: HeroBanner[];
  ad_banners: AdBanner[];
}

interface HomeState {
  homepage: HomepageData | null;
  isLoadingHomepage: boolean;
  homepageError: string | null;

  siteData: PublicSiteData | null;
  isLoadingSiteData: boolean;
  siteDataError: string | null;
}

interface HomeActions {
  fetchHomepage: () => Promise<void>;
  fetchSiteData: () => Promise<void>;
  reset: () => void;
}

type HomeStore = HomeState & HomeActions;

const initialState: HomeState = {
  homepage: null,
  isLoadingHomepage: false,
  homepageError: null,

  siteData: null,
  isLoadingSiteData: false,
  siteDataError: null,
};

/**
 * useHomeStore — drives the Home tab: latest gigs/jobs/tuitions plus
 * hero & ad banners for the public marketing surfaces.
 */
export const useHomeStore = create<HomeStore>()((set) => ({
  ...initialState,

  fetchHomepage: async () => {
    set({ isLoadingHomepage: true, homepageError: null });
    try {
      const { data } = await apiPublic.get("/homepage");
      set({ homepage: data.data ?? null, isLoadingHomepage: false });
    } catch (err: unknown) {
      set({ isLoadingHomepage: false, homepageError: getErrorMessage(err) });
    }
  },

  fetchSiteData: async () => {
    set({ isLoadingSiteData: true, siteDataError: null });
    try {
      const { data } = await apiPublic.get("/site-data");
      set({ siteData: data.data ?? null, isLoadingSiteData: false });
    } catch (err: unknown) {
      set({ isLoadingSiteData: false, siteDataError: getErrorMessage(err) });
    }
  },

  reset: () => set({ ...initialState }),
}));
