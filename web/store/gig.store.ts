import { create } from "zustand";
import { api_client } from "@/lib/api/api-client";
import type { Gig } from "@/types/db/gig.types";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface GigsFilters {
  search?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  max_delivery?: number;
  min_rating?: number;
  tags?: string;
  sort?: string;
}

export interface GigsPagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ─── State Shape ───────────────────────────────────────────────────────────

export interface GigsState {
  /** List of gigs */
  gigs: Gig[];
  /** Single gig detail */
  selectedGig: Gig | null;
  /** Current filters */
  filters: GigsFilters;
  /** Pagination info */
  pagination: GigsPagination | null;
  /** Loading states */
  isLoading: boolean;
  isLoadingMore: boolean;
  isFetchingDetail: boolean;
  /** Error state */
  error: string | null;
}

interface GigsActions {
  /** Fetch gigs with current filters & pagination */
  fetchGigs: (page?: number) => Promise<void>;
  /** Fetch next page (append mode) */
  fetchNextPage: () => Promise<void>;
  /** Fetch a single gig by slug */
  fetchGigBySlug: (slug: string) => Promise<void>;
  /** Update filters and re-fetch */
  setFilters: (filters: Partial<GigsFilters>) => void;
  /** Reset filters */
  resetFilters: () => void;
  /** Clear selected gig */
  clearSelectedGig: () => void;
  /** Clear error */
  clearError: () => void;
}

type GigsStore = GigsState & GigsActions;

// ─── Defaults ──────────────────────────────────────────────────────────────

const defaultFilters: GigsFilters = {
  search: undefined,
  category: undefined,
  min_price: undefined,
  max_price: undefined,
  max_delivery: undefined,
  min_rating: undefined,
  tags: undefined,
  sort: undefined,
};

const initialState: GigsState = {
  gigs: [],
  selectedGig: null,
  filters: { ...defaultFilters },
  pagination: null,
  isLoading: false,
  isLoadingMore: false,
  isFetchingDetail: false,
  error: null,
};

// ─── Helpers ───────────────────────────────────────────────────────────────

function buildQueryString(
  filters: GigsFilters,
  page: number,
  limit = 10,
): string {
  const params = new URLSearchParams();

  params.set("page", String(page));
  params.set("limit", String(limit));

  if (filters.search) params.set("search", filters.search);
  if (filters.category) params.set("category", filters.category);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.min_price !== undefined)
    params.set("min_price", String(filters.min_price));
  if (filters.max_price !== undefined)
    params.set("max_price", String(filters.max_price));
  if (filters.max_delivery !== undefined)
    params.set("max_delivery", String(filters.max_delivery));
  if (filters.min_rating !== undefined)
    params.set("min_rating", String(filters.min_rating));
  if (filters.tags) params.set("tags", filters.tags);

  return params.toString();
}

// ─── Store ─────────────────────────────────────────────────────────────────

export const useGigsStore = create<GigsStore>()((set, get) => ({
  ...initialState,

  /* ── Fetch Gigs ───────────────────────────────────────────────── */
  fetchGigs: async (page = 1) => {
    const { filters } = get();
    set({ isLoading: true, error: null });

    try {
      const qs = buildQueryString(filters, page);
      const { data } = await api_client.get(`/gigs?${qs}`);

      set({
        gigs: data.data ?? [],
        pagination: data.pagination ?? null,
        isLoading: false,
      });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ||
        (err as Error).message ||
        "Failed to fetch gigs";
      set({ isLoading: false, error: message });
    }
  },

  /* ── Fetch Next Page ──────────────────────────────────────────── */
  fetchNextPage: async () => {
    const { pagination, gigs, filters } = get();
    if (!pagination || !pagination.hasNextPage) return;
    if (get().isLoadingMore) return;

    const nextPage = pagination.currentPage + 1;

    set({ isLoadingMore: true });

    try {
      const qs = buildQueryString(filters, nextPage);
      const { data } = await api_client.get(`/gigs?${qs}`);

      set({
        gigs: [...gigs, ...(data.data ?? [])],
        pagination: data.pagination ?? null,
        isLoadingMore: false,
      });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ||
        (err as Error).message ||
        "Failed to load more gigs";
      set({ isLoadingMore: false, error: message });
    }
  },

  /* ── Fetch Gig By Slug ────────────────────────────────────────── */
  fetchGigBySlug: async (slug: string) => {
    set({ isFetchingDetail: true, error: null, selectedGig: null });

    try {
      const { data } = await api_client.get(`/gigs/${slug}`);
      set({ selectedGig: data.data, isFetchingDetail: false });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ||
        (err as Error).message ||
        "Failed to fetch gig details";
      set({ isFetchingDetail: false, error: message });
    }
  },

  /* ── Set Filters ──────────────────────────────────────────────── */
  setFilters: (newFilters) => {
    const merged = { ...get().filters, ...newFilters };
    set({ filters: merged });
    // Auto-fetch with new filters
    get().fetchGigs(1);
  },

  /* ── Reset Filters ────────────────────────────────────────────── */
  resetFilters: () => {
    set({ filters: { ...defaultFilters } });
    get().fetchGigs(1);
  },

  /* ── Clear Selected Gig ───────────────────────────────────────── */
  clearSelectedGig: () => set({ selectedGig: null }),

  /* ── Clear Error ──────────────────────────────────────────────── */
  clearError: () => set({ error: null }),
}));

// ─── Selectors ─────────────────────────────────────────────────────────────

/** Get cheapest package price from a gig */
export const selectGigStartingPrice = (gig: Gig): number => {
  if (!gig.packages || gig.packages.length === 0) return 0;
  return Math.min(...gig.packages.map((p) => p.price));
};

/** Get shortest delivery time from a gig */
export const selectGigMinDelivery = (gig: Gig): number => {
  if (!gig.packages || gig.packages.length === 0) return 0;
  return Math.min(...gig.packages.map((p) => p.delivery_days));
};

/** Check if store is in any loading state */
export const selectGigsLoading = (state: GigsState) =>
  state.isLoading || state.isLoadingMore;
