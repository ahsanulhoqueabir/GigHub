import { apiPublic } from "@/lib/api/api-public";
import { getErrorMessage } from "@/lib/api/api-response";
import { API_BASE_URL } from "@/lib/api/config";
import { defaultPagination } from "@/lib/pagination";
import type { Announcement } from "@/types/db/announcement.types";
import type { PaginationMeta } from "@/types/pagination.types";
import axios from "axios";
import { create } from "zustand";

export type AnnouncementListItem = Pick<
  Announcement,
  "id" | "title" | "type" | "created_at"
>;

export type AnnouncementDetail = Pick<
  Announcement,
  "title" | "content" | "type" | "created_at"
>;

interface AnnouncementsState {
  items: AnnouncementListItem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  pagination: PaginationMeta;

  detail: AnnouncementDetail | null;
  isLoadingDetail: boolean;
  /** true only for a confirmed 404 (not found/inactive/expired) — distinct from a network/server error, which is retryable. */
  detailUnavailable: boolean;
  detailError: string | null;
  /** id of the announcement detail screen currently mounted, if any — lets a notification-tap handler no-op instead of re-navigating when the user is already viewing that announcement. */
  activeDetailId: string | null;
}

interface AnnouncementsActions {
  fetchAnnouncements: (page?: number) => Promise<void>;
  fetchMore: () => Promise<void>;
  fetchAnnouncementDetail: (id: string) => Promise<void>;
  clearDetail: () => void;
  setActiveDetailId: (id: string | null) => void;
  reset: () => void;
}

type AnnouncementsStore = AnnouncementsState & AnnouncementsActions;

const initialState: AnnouncementsState = {
  items: [],
  isLoading: false,
  isLoadingMore: false,
  error: null,
  pagination: defaultPagination(),

  detail: null,
  isLoadingDetail: false,
  detailUnavailable: false,
  detailError: null,
  activeDetailId: null,
};

export const useAnnouncementsStore = create<AnnouncementsStore>()(
  (set, get) => ({
    ...initialState,

    fetchAnnouncements: async (page = 1) => {
      set({ isLoading: true, error: null });
      try {
        const { data } = await apiPublic.get("/announcements", {
          params: { page },
        });
        const newItems: AnnouncementListItem[] = data.data?.items ?? [];
        const pagination: PaginationMeta =
          data.data?.pagination ?? defaultPagination();

        set({
          items: page === 1 ? newItems : [...get().items, ...newItems],
          pagination,
          isLoading: false,
        });
      } catch (err: unknown) {
        set({ isLoading: false, error: getErrorMessage(err) });
      }
    },

    fetchMore: async () => {
      const { isLoading, isLoadingMore, pagination } = get();
      if (isLoading || isLoadingMore || !pagination.hasNext) return;

      set({ isLoadingMore: true });
      try {
        const nextPage = pagination.currentPage + 1;
        const { data } = await apiPublic.get("/announcements", {
          params: { page: nextPage },
        });
        const newItems: AnnouncementListItem[] = data.data?.items ?? [];
        const newPagination: PaginationMeta =
          data.data?.pagination ?? get().pagination;

        set({
          items: [...get().items, ...newItems],
          pagination: newPagination,
          isLoadingMore: false,
        });
      } catch {
        // Silent — pagination failure on "load more" shouldn't disrupt the
        // already-visible list; the user can simply scroll again to retry.
        set({ isLoadingMore: false });
      }
    },

    fetchAnnouncementDetail: async (id) => {
      set({
        isLoadingDetail: true,
        detailError: null,
        detailUnavailable: false,
        detail: null,
      });
      try {
        // Raw axios (not apiPublic) so the response status survives —
        // apiPublic's interceptor unwraps errors down to a plain Error(message),
        // and a 404 (deleted/expired/inactive) must be distinguishable here
        // from a network/server error, which is retryable and this isn't.
        const { data } = await axios.get(
          `${API_BASE_URL}/announcements/${id}`,
        );
        set({ detail: data.data ?? null, isLoadingDetail: false });
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          set({ isLoadingDetail: false, detailUnavailable: true });
        } else {
          set({ isLoadingDetail: false, detailError: getErrorMessage(err) });
        }
      }
    },

    clearDetail: () =>
      set({
        detail: null,
        isLoadingDetail: false,
        detailUnavailable: false,
        detailError: null,
      }),

    setActiveDetailId: (id) => set({ activeDetailId: id }),

    reset: () => set({ ...initialState }),
  }),
);
