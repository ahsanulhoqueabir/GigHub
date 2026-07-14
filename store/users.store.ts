import { api_client } from "@/lib/api/api-client";
import { getErrorMessage } from "@/lib/api/api-response";
import { defaultPagination } from "@/lib/pagination";
import type { Profile } from "@/types/db/profile.types";
import { PaginationMeta } from "@/types/pagination.types";
import { create } from "zustand";

export type { Profile as User };

export interface UsersState {
  users: Profile[];
  isLoading: boolean;
  error: string | null;
  pagination: PaginationMeta;
  currentPage: number;
  pageSize: number;
}

interface UsersActions {
  fetchUsers: (page?: number, limit?: number) => Promise<void>;
  getUser: (id: string) => Promise<Profile | null>;
  createUser: (data: Partial<Profile>) => Promise<void>;
  updateUser: (id: string, data: Partial<Profile>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  approveUser: (id: string) => Promise<void>;
  suspendUser: (id: string) => Promise<void>;
  setPage: (page: number) => void;
  clearError: () => void;
}

type UsersStore = UsersState & UsersActions;

const initialState: UsersState = {
  users: [],
  isLoading: false,
  error: null,
  pagination: defaultPagination(),
  currentPage: 1,
  pageSize: 20,
};

export const useUsersStore = create<UsersStore>()((set, get) => ({
  ...initialState,

  fetchUsers: async (page = 1, limit = 20) => {
    set({ isLoading: true, error: null, currentPage: page, pageSize: limit });
    try {
      // API: GET /api/admin/users?page=1&limit=20
      const { data } = await api_client.get(`/admin/users`, {
        params: { page, limit },
      });
      set({
        users: data.data?.items ?? [],
        pagination: data.data?.pagination ?? defaultPagination(),
        isLoading: false,
      });
    } catch (err: unknown) {
      set({
        isLoading: false,
        error: getErrorMessage(err),
      });
    }
  },

  getUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api_client.get(`/admin/users/${id}`);
      set({ isLoading: false });
      return data.data?.user ?? data.data ?? null;
    } catch (err: unknown) {
      set({
        isLoading: false,
        error: getErrorMessage(err),
      });
      return null;
    }
  },

  createUser: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      await api_client.post("/admin/users", userData);
      set({ isLoading: false });
    } catch (err: unknown) {
      set({
        isLoading: false,
        error: getErrorMessage(err),
      });
      throw err;
    }
  },

  updateUser: async (id, userData) => {
    set({ isLoading: true, error: null });
    try {
      await api_client.put(`/admin/users/${id}`, userData);
      set({ isLoading: false });
    } catch (err: unknown) {
      set({
        isLoading: false,
        error: getErrorMessage(err),
      });
      throw err;
    }
  },

  deleteUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api_client.delete(`/admin/users/${id}`);
      const { currentPage, pageSize } = get();
      await get().fetchUsers(currentPage, pageSize);
    } catch (err: unknown) {
      set({
        isLoading: false,
        error: getErrorMessage(err),
      });
      throw err;
    }
  },

  approveUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api_client.patch(`/admin/users/${id}`, {
        status: "ACTIVE",
        verified: true,
      });
      const { currentPage, pageSize } = get();
      await get().fetchUsers(currentPage, pageSize);
    } catch (err: unknown) {
      set({
        isLoading: false,
        error: getErrorMessage(err),
      });
      throw err;
    }
  },

  suspendUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api_client.patch(`/admin/users/${id}`, {
        status: "SUSPENDED",
      });
      const { currentPage, pageSize } = get();
      await get().fetchUsers(currentPage, pageSize);
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
    get().fetchUsers(page, pageSize);
  },

  clearError: () => set({ error: null }),
}));
