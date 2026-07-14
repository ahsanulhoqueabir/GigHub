import { api_client } from "@/lib/api/api-client";
import { getErrorMessage } from "@/lib/api/api-response";
import { defaultPagination } from "@/lib/pagination";
import type { Gig, GigPackageOrderInfo } from "@/types/db/gig.types";
import type { JobProposal } from "@/types/db/job-proposal.types";
import type { Job } from "@/types/db/job.types";
import type { Order } from "@/types/db/order.types";
import { ProfileMinimal } from "@/types/db/profile.types";
import type { PaginationMeta } from "@/types/pagination.types";
import { create } from "zustand";

// ─── Order list item ───────────────────────────────────────────────────────

export type OrderListItem = Pick<
  Order,
  | "id"
  | "code"
  | "title"
  | "total_price"
  | "amount"
  | "source"
  | "status"
  | "description"
  | "note"
  | "created_at"
  | "updated_at"
  | "cancellation_reason"
  | "cancellation_request_at"
> & {
  buyer: ProfileMinimal | null;
  seller: ProfileMinimal | null;
};

/** Gig summary info shown on order detail */
export type OrderGigInfo = Pick<
  Gig,
  "id" | "title" | "slug" | "description" | "images" | "tags" | "views"
> & {
  packages?: GigPackageOrderInfo[];
};

/** Job summary info shown on order detail */
export type OrderJobInfo = Pick<
  Job,
  | "id"
  | "title"
  | "slug"
  | "description"
  | "type"
  | "budget"
  | "deadline"
  | "location"
  | "required_skills"
  | "tags"
  | "views"
>;

/** Proposal summary info shown on order detail (for JOB orders) */
export type OrderProposalInfo = Pick<
  JobProposal,
  "id" | "created_at" | "status" | "description" | "attachments"
> & {
  applicant?: ProfileMinimal | null;
};

/** Order detail — includes gig/job info for the detail page */
export type OrderEscrowSnapshot = {
  id: string;
  status: string;
  payment_status: string;
  amount: number;
  platform_fee: number;
  released_at?: string | null;
  disputed_at?: string | null;
  resolved_at?: string | null;
  dispute_reason?: string | null;
  admin_note?: string | null;
};

/** Order detail — includes gig/job/escrow info for the detail page */
export type OrderDetail = OrderListItem & {
  gig?: OrderGigInfo | null;
  job?: OrderJobInfo | null;
  proposal?: OrderProposalInfo | null;
  package?: string | null;
  escrow?: OrderEscrowSnapshot | null;
};

interface OrdersState {
  orders: OrderListItem[];
  isLoading: boolean;
  error: string | null;
  pagination: PaginationMeta;
  selectedOrder: OrderDetail | null;
  isLoadingDetail: boolean;
  detailError: string | null;
  isAccepting: boolean;
  acceptError: string | null;
  isCancelling: boolean;
  cancelError: string | null;
  isCompleting: boolean;
  completeError: string | null;
  isDisputing: boolean;
  disputeError: string | null;
  isInitiatingPayment: boolean;
  paymentInitiateError: string | null;
}

interface OrdersActions {
  fetchOrders: (
    page?: number,
    limit?: number,
    filters?: Record<string, unknown>,
  ) => Promise<void>;
  fetchOrderDetail: (id: string) => Promise<void>;
  acceptOrder: (id: string) => Promise<void>;
  cancelOrder: (id: string, reason: string) => Promise<void>;
  completeOrder: (id: string) => Promise<void>;
  requestDispute: (orderId: string, reason: string) => Promise<void>;
  initiatePayment: (orderId: string) => Promise<string | undefined>;
  clearErrors: () => void;
  reset: () => void;
}

type OrdersStore = OrdersState & OrdersActions;

const initialState: OrdersState = {
  orders: [],
  isLoading: false,
  error: null,
  pagination: defaultPagination(),
  selectedOrder: null,
  isLoadingDetail: false,
  detailError: null,
  isAccepting: false,
  acceptError: null,
  isCancelling: false,
  cancelError: null,
  isCompleting: false,
  completeError: null,
  isDisputing: false,
  disputeError: null,
  isInitiatingPayment: false,
  paymentInitiateError: null,
};

export const useOrdersStore = create<OrdersStore>()((set, get) => ({
  ...initialState,

  fetchOrders: async (page = 1, limit = 20, filters) => {
    set({ isLoading: true, error: null });
    try {
      const params = { page, limit, ...filters };
      const { data } = await api_client.get("/order", { params });
      set({
        orders: data.data?.items ?? [],
        pagination: data.data?.pagination ?? defaultPagination(),
        isLoading: false,
      });
    } catch (err: unknown) {
      set({ isLoading: false, error: getErrorMessage(err) });
    }
  },

  fetchOrderDetail: async (id) => {
    set({ isLoadingDetail: true, detailError: null, selectedOrder: null });
    try {
      const { data } = await api_client.get(`/order/${id}`);
      set({
        selectedOrder: data.data ?? null,
        isLoadingDetail: false,
      });
    } catch (err: unknown) {
      set({ isLoadingDetail: false, detailError: getErrorMessage(err) });
    }
  },

  acceptOrder: async (id) => {
    set({ isAccepting: true, acceptError: null });
    try {
      const { data } = await api_client.patch(`/order/${id}/accept`);
      set({ isAccepting: false });

      const selectedOrder = get().selectedOrder;
      if (selectedOrder && selectedOrder.id === id) {
        set({
          selectedOrder: {
            ...selectedOrder,
            status: data.data?.status ?? "ACTIVE",
            updated_at: data.data?.updated_at ?? new Date().toISOString(),
          },
        });
      }

      set((state) => ({
        orders: state.orders.map((o) =>
          o.id === id
            ? {
                ...o,
                status: data.data?.status ?? "ACTIVE",
                updated_at: data.data?.updated_at ?? new Date().toISOString(),
              }
            : o,
        ),
      }));
    } catch (err: unknown) {
      set({ isAccepting: false, acceptError: getErrorMessage(err) });
      throw err;
    }
  },

  cancelOrder: async (id, reason) => {
    set({ isCancelling: true, cancelError: null });
    try {
      const { data } = await api_client.patch(`/order/${id}/cancel`, {
        reason,
      });
      set({ isCancelling: false });

      const selectedOrder = get().selectedOrder;
      if (selectedOrder && selectedOrder.id === id) {
        set({
          selectedOrder: {
            ...selectedOrder,
            status: data.data?.status ?? "CANCELLED",
            cancellation_reason: reason,
            cancellation_request_at:
              data.data?.cancellation_request_at ?? new Date().toISOString(),
            updated_at: data.data?.updated_at ?? new Date().toISOString(),
          },
        });
      }

      set((state) => ({
        orders: state.orders.map((o) =>
          o.id === id
            ? {
                ...o,
                status: data.data?.status ?? "CANCELLED",
                cancellation_reason: reason,
                cancellation_request_at:
                  data.data?.cancellation_request_at ??
                  new Date().toISOString(),
                updated_at: data.data?.updated_at ?? new Date().toISOString(),
              }
            : o,
        ),
      }));
    } catch (err: unknown) {
      set({ isCancelling: false, cancelError: getErrorMessage(err) });
      throw err;
    }
  },

  completeOrder: async (id) => {
    set({ isCompleting: true, completeError: null });
    try {
      await api_client.patch(`/order/${id}/complete`);
      set({ isCompleting: false });

      const selectedOrder = get().selectedOrder;
      if (selectedOrder && selectedOrder.id === id) {
        set({
          selectedOrder: {
            ...selectedOrder,
            status: "COMPLETED",
            updated_at: new Date().toISOString(),
          },
        });
      }

      set((state) => ({
        orders: state.orders.map((o) =>
          o.id === id
            ? { ...o, status: "COMPLETED", updated_at: new Date().toISOString() }
            : o,
        ),
      }));
    } catch (err: unknown) {
      set({ isCompleting: false, completeError: getErrorMessage(err) });
      throw err;
    }
  },

  requestDispute: async (orderId, reason) => {
    set({ isDisputing: true, disputeError: null });
    try {
      await api_client.post("/escrow/dispute", { order_id: orderId, reason });
      set({ isDisputing: false });

      const selectedOrder = get().selectedOrder;
      if (selectedOrder && selectedOrder.id === orderId) {
        set({
          selectedOrder: {
            ...selectedOrder,
            status: "REVIEW",
            updated_at: new Date().toISOString(),
          },
        });
      }

      set((state) => ({
        orders: state.orders.map((o) =>
          o.id === orderId
            ? { ...o, status: "REVIEW", updated_at: new Date().toISOString() }
            : o,
        ),
      }));
    } catch (err: unknown) {
      set({ isDisputing: false, disputeError: getErrorMessage(err) });
      throw err;
    }
  },

  initiatePayment: async (orderId) => {
    set({ isInitiatingPayment: true, paymentInitiateError: null });
    try {
      const { data } = await api_client.post("/payment/initiate", { order_id: orderId });
      set({ isInitiatingPayment: false });
      return data.data?.gateway_url;
    } catch (err: unknown) {
      set({ isInitiatingPayment: false, paymentInitiateError: getErrorMessage(err) });
      throw err;
    }
  },

  clearErrors: () =>
    set({
      error: null,
      detailError: null,
      acceptError: null,
      cancelError: null,
      completeError: null,
      disputeError: null,
      paymentInitiateError: null,
    }),

  reset: () => set({ ...initialState }),
}));
