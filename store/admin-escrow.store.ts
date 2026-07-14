import { api_client } from "@/lib/api/api-client";
import { getErrorMessage } from "@/lib/api/api-response";
import { defaultPagination } from "@/lib/pagination";
import type { Escrow } from "@/types/db/escrow.types";
import type { PaginationMeta } from "@/types/pagination.types";
import { create } from "zustand";

// ─── State ──────────────────────────────────────────────────────────────────

interface AdminEscrowState {
  // All escrows list
  escrows: Escrow[];
  isLoading: boolean;
  error: string | null;
  pagination: PaginationMeta;

  // Disputes list (status = REVIEW)
  disputes: Escrow[];
  isLoadingDisputes: boolean;
  disputesError: string | null;
  disputesPagination: PaginationMeta;

  // Selected escrow detail (for resolve page)
  selectedEscrow: Escrow | null;
  isLoadingDetail: boolean;
  detailError: string | null;

  // Resolve dispute
  isResolving: boolean;
  resolveError: string | null;
  resolveSuccess: boolean;
}

// ─── Actions ─────────────────────────────────────────────────────────────────

interface AdminEscrowActions {
  fetchEscrows: (
    page?: number,
    limit?: number,
    filters?: { status?: string; search?: string },
  ) => Promise<void>;
  fetchDisputes: (page?: number, limit?: number) => Promise<void>;
  fetchEscrowByOrder: (orderId: string) => Promise<void>;
  resolveDispute: (
    orderId: string,
    resolution: "RELEASE" | "REFUND",
    adminNote?: string,
  ) => Promise<boolean>;
  clearErrors: () => void;
  reset: () => void;
}

type AdminEscrowStore = AdminEscrowState & AdminEscrowActions;

// ─── Initial State ───────────────────────────────────────────────────────────

const initialState: AdminEscrowState = {
  escrows: [],
  isLoading: false,
  error: null,
  pagination: defaultPagination(),

  disputes: [],
  isLoadingDisputes: false,
  disputesError: null,
  disputesPagination: defaultPagination(),

  selectedEscrow: null,
  isLoadingDetail: false,
  detailError: null,

  isResolving: false,
  resolveError: null,
  resolveSuccess: false,
};

// ─── Store ───────────────────────────────────────────────────────────────────

/**
 * useAdminEscrowStore — admin-only store for escrow management.
 *
 * Kept separate from the user escrow store to avoid mixing admin
 * and user concerns (see index.md §Key Design Decisions §7).
 *
 * ## Usage
 * ```tsx
 * const { disputes, fetchDisputes, resolveDispute } = useAdminEscrowStore();
 * ```
 */
export const useAdminEscrowStore = create<AdminEscrowStore>()((set) => ({
  ...initialState,

  /**
   * Fetch all escrows with optional status/search filters.
   */
  fetchEscrows: async (page = 1, limit = 20, filters) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api_client.get("/admin/escrow", {
        params: { page, limit, ...filters },
      });
      set({
        escrows: data.data?.items ?? [],
        pagination: data.data?.pagination ?? defaultPagination(),
        isLoading: false,
      });
    } catch (err: unknown) {
      set({ isLoading: false, error: getErrorMessage(err) });
    }
  },

  /**
   * Fetch disputed escrows (status = REVIEW).
   */
  fetchDisputes: async (page = 1, limit = 20) => {
    set({ isLoadingDisputes: true, disputesError: null });
    try {
      const { data } = await api_client.get("/admin/escrow/disputes", {
        params: { page, limit },
      });
      set({
        disputes: data.data?.items ?? [],
        disputesPagination: data.data?.pagination ?? defaultPagination(),
        isLoadingDisputes: false,
      });
    } catch (err: unknown) {
      set({ isLoadingDisputes: false, disputesError: getErrorMessage(err) });
    }
  },

  /**
   * Fetch a single escrow by order ID for the detail / resolve page.
   */
  fetchEscrowByOrder: async (orderId) => {
    set({ isLoadingDetail: true, detailError: null, selectedEscrow: null });
    try {
      const { data } = await api_client.get(`/escrow/order/${orderId}`);
      set({
        selectedEscrow: data.data ?? null,
        isLoadingDetail: false,
      });
    } catch (err: unknown) {
      set({ isLoadingDetail: false, detailError: getErrorMessage(err) });
    }
  },

  /**
   * Admin resolves a dispute.
   * Returns true on success, false on failure.
   */
  resolveDispute: async (orderId, resolution, adminNote) => {
    set({ isResolving: true, resolveError: null, resolveSuccess: false });
    try {
      await api_client.post("/admin/escrow/resolve", {
        order_id: orderId,
        resolution,
        admin_note: adminNote,
      });
      set({ isResolving: false, resolveSuccess: true });
      return true;
    } catch (err: unknown) {
      set({ isResolving: false, resolveError: getErrorMessage(err) });
      return false;
    }
  },

  clearErrors: () =>
    set({
      error: null,
      disputesError: null,
      detailError: null,
      resolveError: null,
      resolveSuccess: false,
    }),

  reset: () => set({ ...initialState }),
}));
