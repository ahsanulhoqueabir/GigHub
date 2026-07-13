import { api_client } from "@/lib/api/api-client";
import { apiPublic } from "@/lib/api/api-public";
import { getErrorMessage } from "@/lib/api/api-response";
import { defaultPagination } from "@/lib/pagination";
import { Department } from "@/types/db/department.types";
import { PaginationMeta } from "@/types/pagination.types";
import { create } from "zustand";

export interface DepartmentsState {
  departments: Department[];
  isLoading: boolean;
  error: string | null;
  pagination: PaginationMeta;
  currentPage: number;
  pageSize: number;
  /** Tracks if initial site-wide fetch (limit=40) has been done */
  hasFetched: boolean;
}

interface DepartmentsActions {
  /** Hydrate from server-fetched data */
  hydrate: (departments: Department[]) => void;
  fetchDepartments: (page?: number, limit?: number) => Promise<void>;
  getDepartment: (id: string) => Promise<Department | null>;
  createDepartment: (data: Partial<Department>) => Promise<void>;
  updateDepartment: (id: string, data: Partial<Department>) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;
  setPage: (page: number) => void;
  clearError: () => void;
}

type DepartmentsStore = DepartmentsState & DepartmentsActions;

const initialState: DepartmentsState = {
  departments: [],
  isLoading: false,
  error: null,
  pagination: defaultPagination(),
  currentPage: 1,
  pageSize: 20,
  hasFetched: false,
};

export const useDepartmentsStore = create<DepartmentsStore>()((set, get) => ({
  ...initialState,

  /** Hydrate from server-fetched data */
  hydrate: (departments: Department[]) =>
    set({
      departments,
      isLoading: false,
      error: null,
      hasFetched: true,
    }),

  fetchDepartments: async (page = 1, limit = 20) => {
    set({ isLoading: true, error: null, currentPage: page, pageSize: limit });
    try {
      // Public API: GET /api/department?page=1&limit=40
      // Response: { success, data: { items: [...], pagination: { ... } } }
      const { data } = await apiPublic.get(`/department`, {
        params: { page, limit },
      });
      set({
        departments: data.data?.items ?? [],
        pagination: data.data?.pagination ?? defaultPagination(),
        isLoading: false,
        hasFetched: true,
      });
    } catch (err: unknown) {
      set({
        isLoading: false,
        error: getErrorMessage(err),
      });
    }
  },

  getDepartment: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // API: GET /api/admin/departments/:id
      const { data } = await api_client.get(`/admin/departments/${id}`);
      set({ isLoading: false });
      return data.data ?? null;
    } catch (err: unknown) {
      set({
        isLoading: false,
        error: getErrorMessage(err),
      });
      return null;
    }
  },

  createDepartment: async (departmentData) => {
    set({ isLoading: true, error: null });
    try {
      // API: POST /api/admin/departments
      await api_client.post("/admin/departments", departmentData);
      set({ isLoading: false });
    } catch (err: unknown) {
      set({
        isLoading: false,
        error: getErrorMessage(err),
      });
      throw err;
    }
  },

  updateDepartment: async (id, departmentData) => {
    set({ isLoading: true, error: null });
    try {
      // API: PATCH /api/admin/departments/:id
      await api_client.patch(`/admin/departments/${id}`, departmentData);
      set({ isLoading: false });
    } catch (err: unknown) {
      set({
        isLoading: false,
        error: getErrorMessage(err),
      });
      throw err;
    }
  },

  deleteDepartment: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // API: DELETE /api/admin/departments/:id
      await api_client.delete(`/admin/departments/${id}`);
      const { currentPage, pageSize } = get();
      await get().fetchDepartments(currentPage, pageSize);
    } catch (err: unknown) {
      set({
        isLoading: false,
        error: getErrorMessage(err),
      });
      throw err;
    }
  },

  setPage: (page) => {
    const { pageSize } = get();
    get().fetchDepartments(page, pageSize);
  },

  clearError: () => set({ error: null }),
}));
