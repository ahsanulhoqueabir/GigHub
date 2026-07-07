"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ListPage } from "@/components/list-page/ListPage";
import { useCategoriesStore } from "@/store/categories.store";
import { Category } from "@/types/db/category.types";
import { IconPlus } from "@tabler/icons-react";
import { useReturnTo } from "@/hooks/use-return-to";
import { StatusBadge } from "@/components/shared/status-badge";

export default function CategoriesListPage() {
  const router = useRouter();
  const { withReturnTo } = useReturnTo();
  const {
    categories,
    pagination,
    isLoading,
    error,
    fetchCategories,
    deleteCategory,
    currentPage,
    pageSize,
  } = useCategoriesStore();

  useEffect(() => {
    fetchCategories(1, 20);
  }, [fetchCategories]);

  const config = useMemo(() => {
    return {
      title: "Categories",
      description: "Manage system categories and groups.",
      onRefresh: async () => {
        await fetchCategories(currentPage, pageSize);
      },
      onEdit: (category: Category) => {
        router.push(withReturnTo(`/admin/categories/${category.id}/update`));
      },
      onDelete: async (id: string) => {
        await deleteCategory(id);
      },
      actions: {
        default: ["edit", "delete"] as ("edit" | "delete")[],
        additional: [
          {
            id: "category-details",
            label: "View Details",
            onClick: (category: Category) => {
              router.push(
                withReturnTo(`/admin/categories/${category.id}/details`),
              );
            },
          },
        ],
        pageActions: [
          {
            id: "create-category",
            label: "Create Category",
            icon: IconPlus,
            variant: "default" as const,
            onClick: () =>
              router.push(withReturnTo("/admin/categories/create")),
          },
        ],
      },
      columns: [
        {
          key: "name" as keyof Category,
          label: "Name",
          width: 40,
          sortable: true,
          render: (_: unknown, category: Category) => (
            <span className="font-medium">{category.name}</span>
          ),
        },
        {
          key: "slug" as keyof Category,
          label: "Slug",
          width: 40,
          sortable: true,
          className: "text-left",
          render: (_: unknown, category: Category) => (
            <p className="text-left">{category.slug}</p>
          ),
        },
        {
          key: "status" as keyof Category,
          label: "Status",
          width: 14,
          sortable: true,
          render: (_: unknown, category: Category) => (
            <StatusBadge status={category.status} />
          ),
        },
      ],
      search: {
        fields: ["name" as keyof Category, "description" as keyof Category],
        placeholder: "Search categories...",
      },
    };
  }, [
    router,
    withReturnTo,
    fetchCategories,
    deleteCategory,
    currentPage,
    pageSize,
  ]);

  return (
    <ListPage
      data={categories}
      loading={isLoading}
      error={error}
      config={config}
      totalItems={pagination.total}
      currentPage={currentPage}
      pageSize={pageSize}
      onPageChange={(page) => fetchCategories(page, pageSize)}
      onPageSizeChange={(size) => fetchCategories(1, size)}
    />
  );
}
