"use client";

import { ListPage } from "@/components/list-page/ListPage";
import { StatusBadge } from "@/components/shared/status-badge";
import { useReturnTo } from "@/hooks/use-return-to";
import { useAdBannersStore } from "@/store/ad-banners.store";
import { AdBanner } from "@/types/db/ad-banner.types";
import { IconPlus } from "@tabler/icons-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

export default function AdBannersListPage() {
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
  } = useAdBannersStore();

  useEffect(() => {
    fetchItems(1, 20);
  }, [fetchItems]);

  const config = useMemo(() => {
    return {
      title: "Ad Banners",
      description: "Manage advertisement banners across the platform.",
      onRefresh: async () => {
        await fetchItems(currentPage, pageSize);
      },
      onEdit: (banner: AdBanner) => {
        router.push(withReturnTo(`/admin/ad-banners/${banner.id}/update`));
      },
      onDelete: async (id: string) => {
        await deleteItem(id);
      },
      actions: {
        default: ["edit", "delete"] as ("edit" | "delete")[],
        additional: [
          {
            id: "banner-details",
            label: "View Details",
            onClick: (banner: AdBanner) => {
              router.push(
                withReturnTo(`/admin/ad-banners/${banner.id}/details`),
              );
            },
          },
        ],
        pageActions: [
          {
            id: "create-banner",
            label: "Create Ad Banner",
            icon: IconPlus,
            variant: "default" as const,
            onClick: () =>
              router.push(withReturnTo("/admin/ad-banners/create")),
          },
        ],
      },
      columns: [
        {
          key: "image_url" as keyof AdBanner,
          label: "Image",
          width: 18,
          render: (_: unknown, banner: AdBanner) => (
            <div className="relative w-20 h-10 rounded overflow-hidden">
              <Image
                src={banner.image_url}
                alt={banner.alt_text}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
          ),
        },
        {
          key: "name" as keyof AdBanner,
          label: "Name",
          width: 25,
          sortable: true,
          render: (_: unknown, banner: AdBanner) => (
            <span className="font-medium">{banner.name}</span>
          ),
        },
        {
          key: "placement" as keyof AdBanner,
          label: "Placement",
          width: 20,
          sortable: true,
        },
        {
          key: "sort_order" as keyof AdBanner,
          label: "Order",
          width: 10,
          sortable: true,
        },
        {
          key: "is_active" as keyof AdBanner,
          label: "Status",
          width: 12,
          sortable: true,
          render: (_: unknown, banner: AdBanner) => (
            <StatusBadge status={banner.is_active ? "ACTIVE" : "DRAFT"} />
          ),
        },
      ],
      search: {
        fields: ["name" as keyof AdBanner, "alt_text" as keyof AdBanner],
        placeholder: "Search ad banners...",
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
