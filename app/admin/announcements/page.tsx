"use client";

import { ListPage } from "@/components/list-page/ListPage";
import { StatusBadge } from "@/components/shared/status-badge";
import { useReturnTo } from "@/hooks/use-return-to";
import { formatShortDate } from "@/lib/date.utils";
import { useAnnouncementsStore } from "@/store/announcements.store";
import { Announcement } from "@/types/db/announcement.types";
import { IconPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

export default function AnnouncementsListPage() {
  const router = useRouter();
  const { withReturnTo } = useReturnTo();
  const {
    items,
    pagination,
    isLoading,
    error,
    fetchItems,
    deleteItem,
    currentPage,
    pageSize,
  } = useAnnouncementsStore();

  useEffect(() => {
    fetchItems(1, 20);
  }, [fetchItems]);

  const config = useMemo(() => {
    return {
      title: "Announcements",
      description: "Manage platform announcements and notifications.",
      onRefresh: async () => {
        await fetchItems(currentPage, pageSize);
      },
      onEdit: (announcement: Announcement) => {
        router.push(
          withReturnTo(`/admin/announcements/${announcement.id}/update`),
        );
      },
      onDelete: async (id: string) => {
        await deleteItem(id);
      },
      actions: {
        default: ["edit", "delete"] as ("edit" | "delete")[],
        additional: [
          {
            id: "announcement-details",
            label: "View Details",
            onClick: (announcement: Announcement) => {
              router.push(
                withReturnTo(`/admin/announcements/${announcement.id}/details`),
              );
            },
          },
        ],
        pageActions: [
          {
            id: "create-announcement",
            label: "Create Announcement",
            icon: IconPlus,
            variant: "default" as const,
            onClick: () =>
              router.push(withReturnTo("/admin/announcements/create")),
          },
        ],
      },
      columns: [
        {
          key: "title" as keyof Announcement,
          label: "Title",
          width: 35,
          sortable: true,
          render: (_: unknown, item: Announcement) => (
            <span className="font-medium">{item.title}</span>
          ),
        },
        {
          key: "type" as keyof Announcement,
          label: "Type",
          width: 15,
          sortable: true,
          render: (_: unknown, item: Announcement) => (
            <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset bg-blue-50 text-blue-700 ring-blue-600/20">
              {item.type}
            </span>
          ),
        },
        {
          key: "is_active" as keyof Announcement,
          label: "Active",
          width: 12,
          sortable: true,
          render: (_: unknown, item: Announcement) => (
            <StatusBadge status={item.is_active ? "ACTIVE" : "DRAFT"} />
          ),
        },
        {
          key: "created_at" as keyof Announcement,
          label: "Created",
          width: 18,
          sortable: true,
          render: (_: unknown, item: Announcement) => (
            <span className="text-sm text-muted-foreground">
              {formatShortDate(item.created_at)}
            </span>
          ),
        },
      ],
      search: {
        fields: [
          "title" as keyof Announcement,
          "content" as keyof Announcement,
        ],
        placeholder: "Search announcements...",
      },
    };
  }, [router, withReturnTo, fetchItems, deleteItem, currentPage, pageSize]);

  return (
    <ListPage
      data={items}
      loading={isLoading}
      error={error}
      config={config}
      totalItems={pagination.total}
      currentPage={currentPage}
      pageSize={pageSize}
      onPageChange={(page) => fetchItems(page, pageSize)}
      onPageSizeChange={(size) => fetchItems(1, size)}
    />
  );
}
