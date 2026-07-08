import { create } from "zustand";
import { api_client } from "@/lib/api/api-client";
import { PaginationMeta } from "@/types/pagination.types";
import { defaultPagination } from "@/lib/pagination";
import { getErrorMessage } from "@/lib/api/api-response";
import type { CreateJobProposalParams } from "@/types/db/job-proposal.types";

// ─── State ─────────────────────────────────────────────────────────────────

interface JobProposalsState {
  // Create
  isCreating: boolean;
  createError: string | null;

  // List (for a specific job or applicant)
  proposals: unknown[];
  isLoadingList: boolean;
  listError: string | null;
  listPagination: PaginationMeta;
}

interface JobProposalsActions {
  // Create
  createProposal: (params: CreateJobProposalParams) => Promise<void>;
  clearCreateError: () => void;

  // List
  fetchProposals: (
    filters?: { job?: string; applicant?: string },
    page?: number,
    limit?: number,
  ) => Promise<void>;

  // Reset
  reset: () => void;
}

type JobProposalsStore = JobProposalsState & JobProposalsActions;

// ─── Initial State ─────────────────────────────────────────────────────────

const initialState: JobProposalsState = {
  isCreating: false,
  createError: null,

  proposals: [],
  isLoadingList: false,
  listError: null,
  listPagination: defaultPagination(),
};

// ─── Store ─────────────────────────────────────────────────────────────────

export const useJobProposalsStore = create<JobProposalsStore>()((set) => ({
  ...initialState,

  /* ── Create ────────────────────────────────────────────────── */
  createProposal: async (params) => {
    set({ isCreating: true, createError: null });
    try {
      await api_client.post("/job-proposal", params);
      set({ isCreating: false });
    } catch (err: unknown) {
      set({ isCreating: false, createError: getErrorMessage(err) });
      throw err;
    }
  },

  clearCreateError: () => set({ createError: null }),

  /* ── List ──────────────────────────────────────────────────── */
  fetchProposals: async (filters, page = 1, limit = 20) => {
    set({ isLoadingList: true, listError: null });
    try {
      const params: Record<string, unknown> = { page, limit };
      if (filters?.job) params.job = filters.job;
      if (filters?.applicant) params.applicant = filters.applicant;

      const { data } = await api_client.get("/job-proposal", { params });
      set({
        proposals: data.data?.items ?? [],
        listPagination: data.data?.pagination ?? defaultPagination(),
        isLoadingList: false,
      });
    } catch (err: unknown) {
      set({ isLoadingList: false, listError: getErrorMessage(err) });
    }
  },

  /* ── Reset ─────────────────────────────────────────────────── */
  reset: () => set({ ...initialState }),
}));
