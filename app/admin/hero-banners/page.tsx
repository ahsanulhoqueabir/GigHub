"use client";

import { ListPage } from "@/components/list-page/ListPage";
import { StatusBadge } from "@/components/shared/status-badge";
import { useReturnTo } from "@/hooks/use-return-to";
import { useHeroBannersStore } from "@/store/hero-banners.store";
import { HeroBanner } from "@/types/db/hero-banner.types";
import { IconPlus } from "@tabler/icons-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

export default function HeroBannersListPage() {
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
  } = useHeroBannersStore();

  useEffect(() => {
    fetchItems(1, 20);
  }, [fetchItems]);

  const config = useMemo(() => {
    return {
      title: "Hero Banners",
      description: "Manage homepage hero banner slides.",
      onRefresh: async () => {
        await fetchItems(currentPage, pageSize);
      },
      onEdit: (banner: HeroBanner) => {
        router.push(withReturnTo(`/admin/hero-banners/${banner.id}/update`));
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
            onClick: (banner: HeroBanner) => {
              router.push(
                withReturnTo(`/admin/hero-banners/${banner.id}/details`),
              );
            },
          },
        ],
        pageActions: [
          {
            id: "create-banner",
            label: "Create Banner",
            icon: IconPlus,
            variant: "default" as const,
            onClick: () =>
              router.push(withReturnTo("/admin/hero-banners/create")),
          },
        ],
      },
      columns: [
        {
          key: "image_url" as keyof HeroBanner,
          label: "Image",
          width: 20,
          render: (_: unknown, banner: HeroBanner) => (
            <div className="relative w-24 h-12 rounded overflow-hidden">
              <Image
                src={banner.image_url}
                alt={banner.alt_text}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
          ),
        },
        {
          key: "title" as keyof HeroBanner,
          label: "Title",
          width: 35,
          sortable: true,
          render: (_: unknown, banner: HeroBanner) => (
            <span className="font-medium">{banner.title}</span>
          ),
        },
        {
          key: "sort_order" as keyof HeroBanner,
          label: "Order",
          width: 10,
          sortable: true,
        },
        {
          key: "is_active" as keyof HeroBanner,
          label: "Status",
          width: 14,
          sortable: true,
          render: (_: unknown, banner: HeroBanner) => (
            <StatusBadge status={banner.is_active ? "ACTIVE" : "DRAFT"} />
          ),
        },
      ],
      search: {
        fields: ["title" as keyof HeroBanner, "alt_text" as keyof HeroBanner],
        placeholder: "Search banners...",
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
