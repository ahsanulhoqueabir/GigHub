import { api_client } from "@/lib/api/api-client";
import { getErrorMessage } from "@/lib/api/api-response";
import { defaultPagination } from "@/lib/pagination";
import type { Wallet } from "@/types/db/wallet.types";
import type { WalletRecord } from "@/types/db/wallet-record.types";
import type { PaginationMeta } from "@/types/pagination.types";
import { create } from "zustand";

// ─── State ──────────────────────────────────────────────────────────────────

interface WalletState {
  wallet: Wallet | null;
  isLoadingWallet: boolean;
  walletError: string | null;

  records: WalletRecord[];
  isLoadingRecords: boolean;
  recordsError: string | null;
  pagination: PaginationMeta;
}

// ─── Actions ─────────────────────────────────────────────────────────────────

interface WalletActions {
  fetchWallet: () => Promise<void>;
  fetchRecords: (page?: number, limit?: number) => Promise<void>;
  clearErrors: () => void;
  reset: () => void;
}

type WalletStore = WalletState & WalletActions;

// ─── Initial State ───────────────────────────────────────────────────────────

const initialState: WalletState = {
  wallet: null,
  isLoadingWallet: false,
  walletError: null,

  records: [],
  isLoadingRecords: false,
  recordsError: null,
  pagination: defaultPagination(),
};

// ─── Store ───────────────────────────────────────────────────────────────────

/**
 * useWalletStore — manages the authenticated user's wallet balance and
 * transaction history (wallet_record list).
 *
 * ## Usage
 * ```tsx
 * const { wallet, records, fetchWallet, fetchRecords } = useWalletStore();
 * useEffect(() => { fetchWallet(); fetchRecords(); }, []);
 * ```
 */
export const useWalletStore = create<WalletStore>()((set) => ({
  ...initialState,

  /**
   * Fetch the current user's wallet (balance, currency, name).
   */
  fetchWallet: async () => {
    set({ isLoadingWallet: true, walletError: null });
    try {
      const { data } = await api_client.get("/wallet/my");
      set({
        wallet: data.data ?? null,
        isLoadingWallet: false,
      });
    } catch (err: unknown) {
      set({ isLoadingWallet: false, walletError: getErrorMessage(err) });
    }
  },

  /**
   * Fetch paginated wallet records (transaction history).
   */
  fetchRecords: async (page = 1, limit = 20) => {
    set({ isLoadingRecords: true, recordsError: null });
    try {
      const { data } = await api_client.get("/wallet/records", {
        params: { page, limit },
      });
      set({
        records: data.data?.items ?? [],
        pagination: data.data?.pagination ?? defaultPagination(),
        isLoadingRecords: false,
      });
    } catch (err: unknown) {
      set({ isLoadingRecords: false, recordsError: getErrorMessage(err) });
    }
  },

  clearErrors: () =>
    set({ walletError: null, recordsError: null }),

  reset: () => set({ ...initialState }),
}));
