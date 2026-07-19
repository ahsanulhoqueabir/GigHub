import { api_client } from "@/lib/api/api-client";
import { getErrorMessage } from "@/lib/api/api-response";
import { defaultPagination } from "@/lib/pagination";
import { CategoryMinimal } from "@/types/db/category.types";
import type { CreateJobProposalParams } from "@/types/db/job-proposal.types";
import type { Job, JobOwnerInfo } from "@/types/db/job.types";
import type { Status, SystemFields } from "@/types/generic.types";
import { PaginationMeta } from "@/types/pagination.types";
import { create } from "zustand";

// ─── Types ─────────────────────────────────────────────────────────────────

/** Shape returned by the /manage endpoint — includes nested job details. */
export interface ManageJobProposalItem {
  id: string;
  job:
    | (Pick<Job, "id" | "title" | "slug" | "status"> & {
        budget?: number;
        type?: string;
        deadline?: string;
      })
    | null;
  applicant: string;
  description: string;
  attachments: string[];
  created_at: string;
  updated_at: string;
}

/** Applied jobs list item — slim job info (id + title only). */
export type AppliedJobItem = {
  description: string;
  attachments: string[];
  job: Pick<Job, "id" | "title"> | null;
} & Pick<SystemFields, "id" | "created_at" | "updated_at" | "status">;

/** Applied job detail — full proposal with resolved job, owner, category & applicant. */
export type AppliedJobDetail = {
  description: string;
  attachments: string[];
  job:
    | (Pick<
        Job,
        | "id"
        | "title"
        | "slug"
        | "status"
        | "description"
        | "budget"
        | "type"
        | "deadline"
        | "location"
        | "required_skills"
        | "attachments"
        | "tags"
      > & {
        owner: JobOwnerInfo;
        category: CategoryMinimal;
      })
    | null;
  applicant: JobOwnerInfo | null;
} & Pick<SystemFields, "id" | "created_at" | "updated_at" | "status">;

/** Params for updating an applied job proposal. */
export interface UpdateAppliedJobParams {
  description?: string;
  attachments?: string[];
  status?: Extract<Status, "DRAFT" | "PENDING">;
}

// ─── Incoming Proposals Types ────────────────────────────────────────────────

/** Incoming proposal list item — includes nested job + applicant info. */
export type IncomingProposalItem = {
  id: string;
  job:
    | (Pick<Job, "id" | "title" | "slug" | "status"> & {
        budget?: number;
        type?: string;
        deadline?: string;
      })
    | null;
  applicant:
    | {
        id: string;
        name: string;
        username: string;
        avatar?: string;
        verified?: boolean;
        department?: string;
      }
    | string
    | null;
  description: string;
  attachments: string[];
  created_at: string;
  updated_at: string;
  status: string;
};

/** Result of approving a proposal — includes updated proposal + created order. */
export interface ApproveProposalResult {
  proposal: {
    id: string;
    status: string;
    updated_at: string;
  };
  order: {
    id: string;
    code: string;
    status: string;
  };
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

  // Manage (caller's own proposals — full job info view)
  manageProposals: ManageJobProposalItem[];
  isLoadingManage: boolean;
  manageError: string | null;
  managePagination: PaginationMeta;

  // Applied Jobs (caller's own proposals — slim list view)
  appliedJobs: AppliedJobItem[];
  isLoadingApplied: boolean;
  appliedError: string | null;
  appliedPagination: PaginationMeta;

  // Applied Job Detail
  selectedAppliedJob: AppliedJobDetail | null;
  isLoadingDetail: boolean;
  detailError: string | null;

  // Update Applied Job
  isUpdatingApplied: boolean;
  updateAppliedError: string | null;

  // Incoming Proposals (job owner's perspective)
  incomingProposals: IncomingProposalItem[];
  isLoadingIncoming: boolean;
  incomingError: string | null;
  incomingPagination: PaginationMeta;

  // Incoming Proposal Detail
  selectedIncomingProposal: AppliedJobDetail | null;
  isLoadingIncomingDetail: boolean;
  incomingDetailError: string | null;

  // Approve Proposal
  isApproving: boolean;
  approveError: string | null;
  approveResult: ApproveProposalResult | null;
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

  // Applied Jobs
  fetchAppliedJobs: (page?: number, limit?: number) => Promise<void>;
  fetchAppliedJobDetail: (id: string) => Promise<void>;
  updateAppliedJob: (
    id: string,
    params: UpdateAppliedJobParams,
  ) => Promise<void>;
  clearUpdateAppliedError: () => void;

  // Incoming Proposals (job owner's perspective)
  fetchIncomingProposals: (
    filters?: { job?: string },
    page?: number,
    limit?: number,
  ) => Promise<void>;
  fetchIncomingProposalDetail: (id: string) => Promise<void>;
  approveProposal: (id: string) => Promise<void>;
  clearApproveError: () => void;

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

  appliedJobs: [],
  isLoadingApplied: false,
  appliedError: null,
  appliedPagination: defaultPagination(),

  selectedAppliedJob: null,
  isLoadingDetail: false,
  detailError: null,

  isUpdatingApplied: false,
  updateAppliedError: null,

  incomingProposals: [],
  isLoadingIncoming: false,
  incomingError: null,
  incomingPagination: defaultPagination(),

  selectedIncomingProposal: null,
  isLoadingIncomingDetail: false,
  incomingDetailError: null,

  isApproving: false,
  approveError: null,
  approveResult: null,
};

// ─── Store ─────────────────────────────────────────────────────────────────

export const useJobProposalsStore = create<JobProposalsStore>()((set) => ({
  ...initialState,

  /* ── Create ────────────────────────────────────────────── */
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

  /* ── List ──────────────────────────────────────────────── */
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

  /* ── Manage ────────────────────────────────────────────── */
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

  /* ── Applied Jobs ──────────────────────────────────────── */
  fetchAppliedJobs: async (page = 1, limit = 20) => {
    set({ isLoadingApplied: true, appliedError: null });
    try {
      const { data } = await api_client.get("/applied-jobs", {
        params: { page, limit },
      });
      set({
        appliedJobs: data.data?.items ?? [],
        appliedPagination: data.data?.pagination ?? defaultPagination(),
        isLoadingApplied: false,
      });
    } catch (err: unknown) {
      set({ isLoadingApplied: false, appliedError: getErrorMessage(err) });
    }
  },

  fetchAppliedJobDetail: async (id) => {
    set({ isLoadingDetail: true, detailError: null, selectedAppliedJob: null });
    try {
      const { data } = await api_client.get(`/applied-jobs/${id}`);
      set({
        selectedAppliedJob: data.data ?? null,
        isLoadingDetail: false,
      });
    } catch (err: unknown) {
      set({ isLoadingDetail: false, detailError: getErrorMessage(err) });
    }
  },

  updateAppliedJob: async (id, params) => {
    set({ isUpdatingApplied: true, updateAppliedError: null });
    try {
      const { data } = await api_client.patch(`/applied-jobs/${id}`, params);
      // Update in-place in the list too (if present)
      set((state) => ({
        isUpdatingApplied: false,
        selectedAppliedJob: data.data ?? state.selectedAppliedJob,
        appliedJobs: state.appliedJobs.map((j) =>
          j.id === id
            ? {
                ...j,
                status: data.data?.status ?? j.status,
                description: data.data?.description ?? j.description,
                attachments: data.data?.attachments ?? j.attachments,
                updated_at: data.data?.updated_at ?? j.updated_at,
              }
            : j,
        ),
      }));
    } catch (err: unknown) {
      set({
        isUpdatingApplied: false,
        updateAppliedError: getErrorMessage(err),
      });
      throw err;
    }
  },

  clearUpdateAppliedError: () => set({ updateAppliedError: null }),

  /* ── Incoming Proposals (job owner) ────────────────────── */
  fetchIncomingProposals: async (filters, page = 1, limit = 20) => {
    set({ isLoadingIncoming: true, incomingError: null });
    try {
      const params: Record<string, unknown> = { page, limit };
      if (filters?.job) params.job = filters.job;

      const { data } = await api_client.get("/job-proposal/incoming", {
        params,
      });
      set({
        incomingProposals: data.data?.items ?? [],
        incomingPagination: data.data?.pagination ?? defaultPagination(),
        isLoadingIncoming: false,
      });
    } catch (err: unknown) {
      set({
        isLoadingIncoming: false,
        incomingError: getErrorMessage(err),
      });
    }
  },

  fetchIncomingProposalDetail: async (id) => {
    set({
      isLoadingIncomingDetail: true,
      incomingDetailError: null,
      selectedIncomingProposal: null,
    });
    try {
      const { data } = await api_client.get(`/job-proposal/incoming/${id}`);
      set({
        selectedIncomingProposal: data.data ?? null,
        isLoadingIncomingDetail: false,
      });
    } catch (err: unknown) {
      set({
        isLoadingIncomingDetail: false,
        incomingDetailError: getErrorMessage(err),
      });
    }
  },

  approveProposal: async (id) => {
    set({ isApproving: true, approveError: null, approveResult: null });
    try {
      const { data } = await api_client.patch(`/job-proposal/incoming/${id}`, {
        action: "approve",
      });
      const result = data.data;
      set({
        isApproving: false,
        approveResult: result ?? null,
        // Update the detail view if open
        selectedIncomingProposal: result?.proposal
          ? {
              ...(useJobProposalsStore.getState()
                .selectedIncomingProposal as AppliedJobDetail),
              status: result.proposal.status,
            }
          : (useJobProposalsStore.getState()
              .selectedIncomingProposal as AppliedJobDetail),
        // Update the list item status
        incomingProposals: useJobProposalsStore
          .getState()
          .incomingProposals.map((p) =>
            p.id === id
              ? { ...p, status: result?.proposal?.status ?? p.status }
              : p,
          ),
      });
    } catch (err: unknown) {
      set({
        isApproving: false,
        approveError: getErrorMessage(err),
      });
      throw err;
    }
  },

  clearApproveError: () => set({ approveError: null, approveResult: null }),

  /* ── Delete ────────────────────────────────────────────── */
  deleteProposal: async (id) => {
    try {
      await api_client.delete(`/job-proposal/${id}`);
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err));
    }
  },

  /* ── Reset ─────────────────────────────────────────────── */
  reset: () => set({ ...initialState }),
}));
