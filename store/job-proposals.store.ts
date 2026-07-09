import { api_client } from "@/lib/api/api-client";
import { getErrorMessage } from "@/lib/api/api-response";
import { defaultPagination } from "@/lib/pagination";
import type { CreateJobProposalParams } from "@/types/db/job-proposal.types";
import { PaginationMeta } from "@/types/pagination.types";
import { create } from "zustand";

// ─── Types ─────────────────────────────────────────────────────────────────

/** Shape returned by the /manage endpoint — includes nested job details. */
export interface ManageJobProposalItem {
  id: string;
  job: {
    id: string;
    title: string;
    slug: string;
    status: string;
    budget?: number;
    type?: string;
    deadline?: string;
  } | null;
  applicant: string;
  description: string;
  attachments: string[];
  created_at: string;
  updated_at: string;
}

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

  // Manage (caller's own proposals)
  manageProposals: ManageJobProposalItem[];
  isLoadingManage: boolean;
  manageError: string | null;
  managePagination: PaginationMeta;
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

  // Manage
  fetchManageProposals: (
    filters?: { job?: string },
    page?: number,
    limit?: number,
  ) => Promise<void>;

  // Delete
  deleteProposal: (id: string) => Promise<void>;

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

  manageProposals: [],
  isLoadingManage: false,
  manageError: null,
  managePagination: defaultPagination(),
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

  /* ── Manage ────────────────────────────────────────────────── */
  fetchManageProposals: async (filters, page = 1, limit = 20) => {
    set({ isLoadingManage: true, manageError: null });
    try {
      const params: Record<string, unknown> = { page, limit };
      if (filters?.job) params.job = filters.job;

      const { data } = await api_client.get("/job-proposal/manage", { params });
      set({
        manageProposals: data.data?.items ?? [],
        managePagination: data.data?.pagination ?? defaultPagination(),
        isLoadingManage: false,
      });
    } catch (err: unknown) {
      set({ isLoadingManage: false, manageError: getErrorMessage(err) });
    }
  },

  /* ── Delete ────────────────────────────────────────────────── */
  deleteProposal: async (id) => {
    try {
      await api_client.delete(`/job-proposal/${id}`);
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err));
    }
  },

  /* ── Reset ─────────────────────────────────────────────────── */
  reset: () => set({ ...initialState }),
}));
