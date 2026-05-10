import { create } from "zustand";
import { api_client } from "@/lib/api/api-client";
import type { Job } from "@/types/db/job.types";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface JobsFilters {
  search?: string;
  category?: string;
  job_type?: string;
  listing_scope?: string;
  status?: string;
}

export interface JobsPagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ─── State Shape ───────────────────────────────────────────────────────────

export interface JobsState {
  /** List of jobs */
  jobs: Job[];
  /** Single job detail */
  selectedJob: Job | null;
  /** Current filters */
  filters: JobsFilters;
  /** Pagination info */
  pagination: JobsPagination | null;
  /** Loading states */
  isLoading: boolean;
  isLoadingMore: boolean;
  isFetchingDetail: boolean;
  /** Error state */
  error: string | null;
}

interface JobsActions {
  /** Fetch jobs with current filters & pagination */
  fetchJobs: (page?: number) => Promise<void>;
  /** Fetch next page (append mode) */
  fetchNextPage: () => Promise<void>;
  /** Fetch a single job by slug */
  fetchJobBySlug: (slug: string) => Promise<void>;
  /** Update filters and re-fetch */
  setFilters: (filters: Partial<JobsFilters>) => void;
  /** Reset filters */
  resetFilters: () => void;
  /** Clear selected job */
  clearSelectedJob: () => void;
  /** Clear error */
  clearError: () => void;
}

type JobsStore = JobsState & JobsActions;

// ─── Defaults ──────────────────────────────────────────────────────────────

const defaultFilters: JobsFilters = {
  search: undefined,
  category: undefined,
  job_type: undefined,
  listing_scope: undefined,
  status: "open",
};

const initialState: JobsState = {
  jobs: [],
  selectedJob: null,
  filters: { ...defaultFilters },
  pagination: null,
  isLoading: false,
  isLoadingMore: false,
  isFetchingDetail: false,
  error: null,
};

// ─── Helpers ───────────────────────────────────────────────────────────────

function buildQueryString(
  filters: JobsFilters,
  page: number,
  limit = 10,
): string {
  const params = new URLSearchParams();

  params.set("page", String(page));
  params.set("limit", String(limit));
  params.set("status", filters.status ?? "open");

  if (filters.search) params.set("search", filters.search);
  if (filters.category) params.set("category", filters.category);
  if (filters.job_type) params.set("job_type", filters.job_type);
  if (filters.listing_scope) params.set("listing_scope", filters.listing_scope);

  return params.toString();
}

// ─── Store ─────────────────────────────────────────────────────────────────

export const useJobsStore = create<JobsStore>()((set, get) => ({
  ...initialState,

  /* ── Fetch Jobs ───────────────────────────────────────────────── */
  fetchJobs: async (page = 1) => {
    const { filters } = get();
    set({ isLoading: true, error: null });

    try {
      const qs = buildQueryString(filters, page);
      const { data } = await api_client.get(`/jobs?${qs}`);

      set({
        jobs: data.data ?? [],
        pagination: data.pagination ?? null,
        isLoading: false,
      });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ||
        (err as Error).message ||
        "Failed to fetch jobs";
      set({ isLoading: false, error: message });
    }
  },

  /* ── Fetch Next Page ──────────────────────────────────────────── */
  fetchNextPage: async () => {
    const { pagination, jobs, filters } = get();
    if (!pagination || !pagination.hasNextPage) return;
    if (get().isLoadingMore) return;

    const nextPage = pagination.currentPage + 1;

    set({ isLoadingMore: true });

    try {
      const qs = buildQueryString(filters, nextPage);
      const { data } = await api_client.get(`/jobs?${qs}`);

      set({
        jobs: [...jobs, ...(data.data ?? [])],
        pagination: data.pagination ?? null,
        isLoadingMore: false,
      });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ||
        (err as Error).message ||
        "Failed to load more jobs";
      set({ isLoadingMore: false, error: message });
    }
  },

  /* ── Fetch Job By Slug ────────────────────────────────────────── */
  fetchJobBySlug: async (slug: string) => {
    set({ isFetchingDetail: true, error: null, selectedJob: null });

    try {
      const { data } = await api_client.get(`/jobs/${slug}`);
      set({ selectedJob: data.data, isFetchingDetail: false });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ||
        (err as Error).message ||
        "Failed to fetch job details";
      set({ isFetchingDetail: false, error: message });
    }
  },

  /* ── Set Filters ──────────────────────────────────────────────── */
  setFilters: (newFilters) => {
    const merged = { ...get().filters, ...newFilters };
    set({ filters: merged });
    get().fetchJobs(1);
  },

  /* ── Reset Filters ────────────────────────────────────────────── */
  resetFilters: () => {
    set({ filters: { ...defaultFilters } });
    get().fetchJobs(1);
  },

  /* ── Clear Selected Job ───────────────────────────────────────── */
  clearSelectedJob: () => set({ selectedJob: null }),

  /* ── Clear Error ──────────────────────────────────────────────── */
  clearError: () => set({ error: null }),
}));

// ─── Selectors ─────────────────────────────────────────────────────────────

/** Format budget range as display string */
export const selectJobBudgetDisplay = (job: Job): string => {
  if (job.budget_min && job.budget_max) {
    return `$${job.budget_min} - $${job.budget_max}`;
  }
  if (job.budget_min) {
    return `From $${job.budget_min}`;
  }
  if (job.budget_max) {
    return `Up to $${job.budget_max}`;
  }
  return job.budget_type === "negotiable" ? "Negotiable" : "Not specified";
};

/** Get job type label */
export const selectJobTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    paid: "Paid",
    free: "Free",
    internship: "Internship",
    volunteer: "Volunteer",
    tuition: "Tuition",
  };
  return labels[type] ?? type;
};

/** Check if store is in any loading state */
export const selectJobsLoading = (state: JobsState) =>
  state.isLoading || state.isLoadingMore;
