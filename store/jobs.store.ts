import { api_client } from "@/lib/api/api-client";
import { apiPublic } from "@/lib/api/api-public";
import { getErrorMessage } from "@/lib/api/api-response";
import { defaultPagination } from "@/lib/pagination";
import type {
  CreateJobInput,
  UpdateJobInput,
} from "@/lib/validations/job.schema";
import type {
  JobApplyDetail,
  JobDetail,
  JobListFilters,
  JobListItem,
} from "@/types/db/job.types";
import { PaginationMeta } from "@/types/pagination.types";
import { create } from "zustand";

// ─── State ─────────────────────────────────────────────────────────────────

interface JobsState {
  // List
  jobs: JobListItem[];
  isLoadingList: boolean;
  listError: string | null;
  listPagination: PaginationMeta;
  listFilters: JobListFilters;

  // Detail
  currentJob: JobDetail | null;
  isLoadingDetail: boolean;
  detailError: string | null;

  // Apply page detail
  applyJob: JobApplyDetail | null;
  isLoadingApplyJob: boolean;
  applyJobError: string | null;

  // Mutations
  isMutating: boolean;
  mutationError: string | null;
}

interface JobsActions {
  // List (public)
  fetchJobs: (
    filters?: JobListFilters,
    page?: number,
    limit?: number,
  ) => Promise<void>;
  // List (manage — authenticated)
  fetchManageJobs: (
    filters?: JobListFilters,
    page?: number,
    limit?: number,
  ) => Promise<void>;
  setListFilters: (filters: JobListFilters) => void;
  clearListError: () => void;

  // Detail
  fetchJobBySlug: (slug: string) => Promise<void>;
  fetchJobById: (id: string) => Promise<void>;
  clearDetail: () => void;

  // Apply page detail
  fetchApplyJob: (slug: string) => Promise<void>;
  clearApplyJob: () => void;

  // Mutations
  createJob: (payload: CreateJobInput) => Promise<JobDetail>;
  updateJob: (id: string, payload: UpdateJobInput) => Promise<JobDetail>;
  deleteJob: (id: string) => Promise<void>;

  // Reset
  reset: () => void;
}

type JobsStore = JobsState & JobsActions;

// ─── Initial State ─────────────────────────────────────────────────────────

const initialState: JobsState = {
  jobs: [],
  isLoadingList: false,
  listError: null,
  listPagination: defaultPagination(),
  listFilters: {},

  currentJob: null,
  isLoadingDetail: false,
  detailError: null,

  applyJob: null,
  isLoadingApplyJob: false,
  applyJobError: null,

  isMutating: false,
  mutationError: null,
};

// ─── Store ─────────────────────────────────────────────────────────────────

export const useJobsStore = create<JobsStore>()((set, get) => ({
  ...initialState,

  /* ── Public List ────────────────────────────────────────────── */
  fetchJobs: async (filters, page = 1, limit = 20) => {
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
      if (mergedFilters.owner) params.owner = mergedFilters.owner;
      if (mergedFilters.type) params.type = mergedFilters.type;
      if (mergedFilters.tags) params.tags = mergedFilters.tags;

      const { data } = await apiPublic.get("/job", { params });
      const items = data.data?.items ?? [];
      set((state) => ({
        jobs: page === 1 ? items : [...state.jobs, ...items],
        listPagination: data.data?.pagination ?? defaultPagination(),
        isLoadingList: false,
      }));
    } catch (err: unknown) {
      set({ isLoadingList: false, listError: getErrorMessage(err) });
    }
  },

  /* ── Manage List (authenticated) ────────────────────────────── */
  fetchManageJobs: async (filters, page = 1, limit = 20) => {
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
      if (mergedFilters.owner) params.owner = mergedFilters.owner;
      if (mergedFilters.type) params.type = mergedFilters.type;
      if (mergedFilters.tags) params.tags = mergedFilters.tags;

      const { data } = await api_client.get("/job/manage", { params });
      set({
        jobs: data.data?.items ?? [],
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
  fetchJobBySlug: async (slug) => {
    set({ isLoadingDetail: true, detailError: null, currentJob: null });
    try {
      const { data } = await apiPublic.get(`/job?slug=${slug}`);
      set({ currentJob: data.data ?? null, isLoadingDetail: false });
    } catch (err: unknown) {
      set({ isLoadingDetail: false, detailError: getErrorMessage(err) });
    }
  },

  fetchJobById: async (id) => {
    set({ isLoadingDetail: true, detailError: null, currentJob: null });
    try {
      const { data } = await api_client.get(`/job/${id}/details`);
      set({ currentJob: data.data ?? null, isLoadingDetail: false });
    } catch (err: unknown) {
      set({ isLoadingDetail: false, detailError: getErrorMessage(err) });
    }
  },

  clearDetail: () => set({ currentJob: null, detailError: null }),

  /* ── Apply page detail ─────────────────────────────────────── */
  fetchApplyJob: async (slug) => {
    set({ isLoadingApplyJob: true, applyJobError: null, applyJob: null });
    try {
      const { data } = await apiPublic.get(`/job?slug=${slug}`);
      const job = data.data as JobDetail | null;
      if (job) {
        set({
          applyJob: {
            id: job.id,
            title: job.title,
            slug: job.slug,
            budget: job.budget,
            type: job.type,
            location: job.location,
            required_skills: job.required_skills,
            owner: job.owner,
          },
          isLoadingApplyJob: false,
        });
      } else {
        set({ isLoadingApplyJob: false });
      }
    } catch (err: unknown) {
      set({ isLoadingApplyJob: false, applyJobError: getErrorMessage(err) });
    }
  },

  clearApplyJob: () => set({ applyJob: null, applyJobError: null }),

  /* ── Mutations ─────────────────────────────────────────────── */
  createJob: async (payload) => {
    set({ isMutating: true, mutationError: null });
    try {
      const { data } = await api_client.post("/job", payload);
      set({ isMutating: false });
      return data.data;
    } catch (err: unknown) {
      const errMsg = getErrorMessage(err);
      set({ isMutating: false, mutationError: errMsg });
      throw err;
    }
  },

  updateJob: async (id, payload) => {
    set({ isMutating: true, mutationError: null });
    try {
      const { data } = await api_client.patch(`/job/${id}`, payload);
      set({ isMutating: false });
      return data.data;
    } catch (err: unknown) {
      const errMsg = getErrorMessage(err);
      set({ isMutating: false, mutationError: errMsg });
      throw err;
    }
  },

  deleteJob: async (id) => {
    set({ isMutating: true, mutationError: null });
    try {
      await api_client.delete(`/job/${id}`);
      set({ isMutating: false });
    } catch (err: unknown) {
      const errMsg = getErrorMessage(err);
      set({ isMutating: false, mutationError: errMsg });
      throw err;
    }
  },

  /* ── Reset ─────────────────────────────────────────────────── */
  reset: () => set({ ...initialState }),
}));
