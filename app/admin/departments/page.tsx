"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ListPage } from "@/components/list-page/ListPage";
import { useDepartmentsStore } from "@/store/departments.store";
import { Department } from "@/types/db/department.types";
import { IconPlus } from "@tabler/icons-react";
import { useReturnTo } from "@/hooks/use-return-to";

export default function DepartmentsListPage() {
  const router = useRouter();
  const { withReturnTo } = useReturnTo();
  const {
    departments,
    pagination,
    isLoading,
    error,
    fetchDepartments,
    deleteDepartment,
    currentPage,
    pageSize,
  } = useDepartmentsStore();

  useEffect(() => {
    fetchDepartments(1, 20);
  }, [fetchDepartments]);

  const config = useMemo(() => {
    return {
      title: "Departments",
      description: "Manage system departments and settings.",
      onRefresh: async () => {
        await fetchDepartments(currentPage, pageSize);
      },
      onEdit: (dept: Department) => {
        router.push(withReturnTo(`/admin/departments/${dept.id}/update`));
      },
      onDelete: async (id: string) => {
        await deleteDepartment(id);
      },
      actions: {
        default: ["edit", "delete"] as ("edit" | "delete")[],
        additional: [
          {
            id: "department-details",
            label: "View Details",
            onClick: (dept: Department) => {
              router.push(
                withReturnTo(`/admin/departments/${dept.id}/details`),
              );
            },
          },
        ],
        pageActions: [
          {
            id: "create-department",
            label: "Create Department",
            icon: IconPlus,
            variant: "default" as const,
            onClick: () =>
              router.push(withReturnTo("/admin/departments/create")),
          },
        ],
      },
      columns: [
        {
          key: "name" as keyof Department,
          label: "Name",
          width: 40,
          sortable: true,
          render: (_: unknown, dept: Department) => (
            <p className="font-medium">{dept.name}</p>
          ),
        },
        {
          key: "acronym" as keyof Department,
          label: "Acronym",
          width: 20,
          sortable: true,
          render: (_: unknown, dept: Department) => (
            <span>{dept.acronym || dept.code}</span>
          ),
        },
        {
          key: "code" as keyof Department,
          label: "Code",
          width: 20,
          sortable: true,
          render: (_: unknown, dept: Department) => <span>{dept.code}</span>,
        },
      ],
      search: {
        fields: [
          "name" as keyof Department,
          "code" as keyof Department,
          "acronym" as keyof Department,
        ],
        placeholder: "Search departments...",
      },
    };
  }, [
    router,
    withReturnTo,
    fetchDepartments,
    deleteDepartment,
    currentPage,
    pageSize,
  ]);

  return (
    <ListPage
      data={departments}
      loading={isLoading}
      error={error}
      config={config}
      totalItems={pagination.total}
      currentPage={currentPage}
      pageSize={pageSize}
      onPageChange={(page) => fetchDepartments(page, pageSize)}
      onPageSizeChange={(size) => fetchDepartments(1, size)}
    />
  );
}
