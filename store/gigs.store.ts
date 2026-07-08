import { api_client } from "@/lib/api/api-client";
import { apiPublic } from "@/lib/api/api-public";
import { getErrorMessage } from "@/lib/api/api-response";
import { defaultPagination } from "@/lib/pagination";
import type {
  CreateGigOrderParams,
  GigDetail,
  GigListFilters,
  GigListItem,
  GigOrderDetail,
} from "@/types/db/gig.types";
import { PaginationMeta } from "@/types/pagination.types";
import { create } from "zustand";

// ─── State ─────────────────────────────────────────────────────────────────

interface GigsState {
  // List
  gigs: GigListItem[];
  isLoadingList: boolean;
  listError: string | null;
  listPagination: PaginationMeta;
  listFilters: GigListFilters;

  // Detail
  currentGig: GigDetail | null;
  isLoadingDetail: boolean;
  detailError: string | null;

  // Order page detail
  orderGig: GigOrderDetail | null;
  isLoadingOrderGig: boolean;
  orderGigError: string | null;

  // Create / Update / Delete
  isMutating: boolean;
  mutationError: string | null;
}

interface GigsActions {
  // List
  fetchGigs: (
    filters?: GigListFilters,
    page?: number,
    limit?: number,
  ) => Promise<void>;
  setListFilters: (filters: GigListFilters) => void;
  clearListError: () => void;

  // Detail
  fetchGigBySlug: (slug: string) => Promise<void>;
  clearDetail: () => void;

  // Order page detail
  fetchOrderGig: (slug: string) => Promise<void>;
  clearOrderGig: () => void;

  // Orders
  createGigOrder: (params: CreateGigOrderParams) => Promise<void>;

  // Reset
  reset: () => void;
}

type GigsStore = GigsState & GigsActions;

// ─── Initial State ─────────────────────────────────────────────────────────

const initialState: GigsState = {
  gigs: [],
  isLoadingList: false,
  listError: null,
  listPagination: defaultPagination(),
  listFilters: {},

  currentGig: null,
  isLoadingDetail: false,
  detailError: null,

  orderGig: null,
  isLoadingOrderGig: false,
  orderGigError: null,

  isMutating: false,
  mutationError: null,
};

// ─── Store ─────────────────────────────────────────────────────────────────

export const useGigsStore = create<GigsStore>()((set, get) => ({
  ...initialState,

  /* ── List ──────────────────────────────────────────────────── */
  fetchGigs: async (filters, page = 1, limit = 20) => {
    set({ isLoadingList: true, listError: null });

    try {
      const mergedFilters = { ...get().listFilters, ...filters };
      if (filters) set({ listFilters: mergedFilters });

      const params: Record<string, unknown> = {
        page,
        limit,
        sortBy: mergedFilters.sortBy ?? "created_at",
        sortOrder: mergedFilters.sortOrder ?? "desc",
      };
      if (mergedFilters.search) params.search = mergedFilters.search;
      if (mergedFilters.category) params.category = mergedFilters.category;
      if (mergedFilters.seller) params.seller = mergedFilters.seller;

      const { data } = await apiPublic.get("/gig", { params });
      set({
        gigs: data.data?.items ?? [],
        listPagination: data.data?.pagination ?? defaultPagination(),
        isLoadingList: false,
      });
    } catch (err: unknown) {
      set({ isLoadingList: false, listError: getErrorMessage(err) });
    }
  },

  setListFilters: (filters) => {
    set({ listFilters: { ...get().listFilters, ...filters } });
  },

  clearListError: () => set({ listError: null }),

  /* ── Detail ────────────────────────────────────────────────── */
  fetchGigBySlug: async (slug) => {
    set({ isLoadingDetail: true, detailError: null, currentGig: null });
    try {
      const { data } = await apiPublic.get(`/gig?slug=${slug}`);
      set({ currentGig: data.data ?? null, isLoadingDetail: false });
    } catch (err: unknown) {
      set({ isLoadingDetail: false, detailError: getErrorMessage(err) });
    }
  },

  clearDetail: () => set({ currentGig: null, detailError: null }),

  /* ── Order page detail ─────────────────────────────────────── */
  fetchOrderGig: async (slug) => {
    set({ isLoadingOrderGig: true, orderGigError: null, orderGig: null });
    try {
      const { data } = await apiPublic.get(`/gig?slug=${slug}`);
      const gig = data.data as GigDetail | null;
      if (gig) {
        set({
          orderGig: {
            id: gig.id,
            title: gig.title,
            slug: gig.slug,
            packages: gig.packages.map((p) => ({
              tier: p.tier,
              title: p.title,
              price: p.price,
              delivery_days: p.delivery_days,
              description: p.description,
              revisions: p.revisions,
              features: p.features,
            })),
            seller: gig.seller,
          },
          isLoadingOrderGig: false,
        });
      } else {
        set({ isLoadingOrderGig: false });
      }
    } catch (err: unknown) {
      set({ isLoadingOrderGig: false, orderGigError: getErrorMessage(err) });
    }
  },

  clearOrderGig: () => set({ orderGig: null, orderGigError: null }),

  /* ── Create Order ──────────────────────────────────────────── */
  createGigOrder: async (params) => {
    set({ isMutating: true, mutationError: null });
    try {
      await api_client.post("/order", params);
      set({ isMutating: false });
    } catch (err: unknown) {
      set({ isMutating: false, mutationError: getErrorMessage(err) });
      throw err;
    }
  },

  /* ── Reset ─────────────────────────────────────────────────── */
  reset: () => set({ ...initialState }),
}));
