"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ListPage } from "@/components/list-page/ListPage";
import { StatusBadge } from "@/components/shared/status-badge";
import { RoleBadge } from "@/components/shared/role-badge";
import { BooleanBadge } from "@/components/shared/boolean-badge";
import { formatDateInTimezone } from "@/lib/date.utils";
import { useUsersStore } from "@/store/users.store";
import type { Profile } from "@/types/db/profile.types";
import { IconPlus } from "@tabler/icons-react";

export default function UsersListPage() {
  const router = useRouter();
  const {
    users,
    pagination,
    isLoading,
    error,
    fetchUsers,
    deleteUser,
    currentPage,
    pageSize,
  } = useUsersStore();

  useEffect(() => {
    fetchUsers(1, 20);
  }, [fetchUsers]);

  const config = useMemo(() => {
    return {
      title: "Users",
      description: "Manage system users and their roles.",
      onRefresh: async () => {
        await fetchUsers(currentPage, pageSize);
      },
      onEdit: (user: Profile) => {
        router.push(`/admin/users/${user.id}/update`);
      },
      onDelete: async (id: string) => {
        await deleteUser(id);
      },
      actions: {
        default: ["edit", "delete"] as ("edit" | "delete")[],
        pageActions: [
          {
            id: "create-user",
            label: "Create User",
            icon: IconPlus,
            variant: "success" as const,
            onClick: () => router.push("/admin/users/create"),
          },
        ],
        additional: [
          {
            id: "user-details",
            label: "View Details",
            onClick: (user: Profile) => {
              router.push(`/admin/users/${user.id}/details`);
            },
          },
        ],
      },
      columns: [
        {
          key: "name" as keyof Profile,
          label: "Name",
          width: 28,
          sortable: true,
          render: (_: unknown, user: Profile) => (
            <div className="flex flex-col">
              <span className="font-medium">{user.name}</span>
              <span className="text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
          ),
        },
        {
          key: "username" as keyof Profile,
          label: "Username",
          width: 18,
          sortable: true,
          render: (_: unknown, user: Profile) => (
            <span className="text-sm font-mono">{user.username || "-"}</span>
          ),
        },
        {
          key: "phone" as keyof Profile,
          label: "Phone",
          width: 18,
          sortable: false,
          render: (_: unknown, user: Profile) => (
            <span className="text-sm">{user.phone || "-"}</span>
          ),
        },
        {
          key: "role" as keyof Profile,
          label: "Role",
          width: 16,
          sortable: true,
          render: (_: unknown, user: Profile) => <RoleBadge role={user.role} />,
        },
        {
          key: "student_id" as keyof Profile,
          label: "Student ID",
          width: 18,
          sortable: true,
          render: (_: unknown, user: Profile) => (
            <span className="text-sm font-mono">{user.student_id || "-"}</span>
          ),
        },
        {
          key: "status" as keyof Profile,
          label: "Status",
          width: 14,
          sortable: true,
          render: (_: unknown, user: Profile) => (
            <StatusBadge status={user.status} />
          ),
        },
        {
          key: "verified" as keyof Profile,
          label: "Verified",
          width: 12,
          sortable: true,
          render: (_: unknown, user: Profile) => (
            <BooleanBadge value={user.verified} />
          ),
        },
        {
          key: "department" as keyof Profile,
          label: "Department",
          width: 22,
          sortable: true,
          render: (_: unknown, user: Profile) => {
            const dept = user.department;
            if (dept && typeof dept === "object" && "name" in dept) {
              return dept.name;
            }
            return String(dept ?? "-");
          },
        },
        {
          key: "created_at" as keyof Profile,
          label: "Joined",
          width: 16,
          sortable: true,
          render: (_: unknown, user: Profile) => (
            <span className="text-sm text-muted-foreground">
              {formatDateInTimezone(user.created_at)}
            </span>
          ),
        },
      ],
      search: {
        fields: [
          "name" as keyof Profile,
          "email" as keyof Profile,
          "username" as keyof Profile,
          "phone" as keyof Profile,
          "student_id" as keyof Profile,
        ],
        placeholder: "Search by name, email, username, phone or student ID...",
      },
    };
  }, [router, fetchUsers, deleteUser, currentPage, pageSize]);

  return (
    <ListPage
      data={users}
      loading={isLoading}
      error={error}
      config={config}
      totalItems={pagination.total}
      currentPage={currentPage}
      pageSize={pageSize}
      onPageChange={(page) => fetchUsers(page, pageSize)}
      onPageSizeChange={(size) => fetchUsers(1, size)}
    />
  );
}
