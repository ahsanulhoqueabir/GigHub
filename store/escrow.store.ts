import { api_client } from "@/lib/api/api-client";
import { getErrorMessage } from "@/lib/api/api-response";
import { defaultPagination } from "@/lib/pagination";
import type { Escrow } from "@/types/db/escrow.types";
import type { PaginationMeta } from "@/types/pagination.types";
import { create } from "zustand";

// ─── State ──────────────────────────────────────────────────────────────────

interface EscrowState {
  escrows: Escrow[];
  isLoading: boolean;
  error: string | null;
  pagination: PaginationMeta;

  selectedEscrow: Escrow | null;
  isLoadingDetail: boolean;
  detailError: string | null;

  // Dispute request
  isDisputing: boolean;
  disputeError: string | null;
  disputeSuccess: boolean;
}

// ─── Actions ─────────────────────────────────────────────────────────────────

interface EscrowActions {
  fetchMyEscrows: (page?: number, limit?: number) => Promise<void>;
  fetchEscrowByOrder: (orderId: string) => Promise<void>;
  requestDispute: (orderId: string, reason: string) => Promise<boolean>;
  clearErrors: () => void;
  reset: () => void;
}

type EscrowStore = EscrowState & EscrowActions;

// ─── Initial State ───────────────────────────────────────────────────────────

const initialState: EscrowState = {
  escrows: [],
  isLoading: false,
  error: null,
  pagination: defaultPagination(),

  selectedEscrow: null,
  isLoadingDetail: false,
  detailError: null,

  isDisputing: false,
  disputeError: null,
  disputeSuccess: false,
};

// ─── Store ───────────────────────────────────────────────────────────────────

/**
 * useEscrowStore — manages the current user's escrow records and dispute workflow.
 *
 * ## Usage
 * ```tsx
 * const { escrows, fetchMyEscrows, requestDispute } = useEscrowStore();
 * ```
 */
export const useEscrowStore = create<EscrowStore>()((set) => ({
  ...initialState,

  /**
   * Fetch the current user's paginated escrow records (as sender or receiver).
   */
  fetchMyEscrows: async (page = 1, limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api_client.get("/escrow/my", {
        params: { page, limit },
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
   * Fetch the escrow record for a specific order (for display on order detail page).
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
   * Seller requests a dispute on a DELIVERED order.
   * Returns true on success, false on failure.
   */
  requestDispute: async (orderId, reason) => {
    set({ isDisputing: true, disputeError: null, disputeSuccess: false });
    try {
      await api_client.post("/escrow/dispute", { order_id: orderId, reason });
      set({ isDisputing: false, disputeSuccess: true });
      return true;
    } catch (err: unknown) {
      set({ isDisputing: false, disputeError: getErrorMessage(err) });
      return false;
    }
  },

  clearErrors: () =>
    set({
      error: null,
      detailError: null,
      disputeError: null,
      disputeSuccess: false,
    }),

  reset: () => set({ ...initialState }),
}));
