"use client";

import { ListPage } from "@/components/list-page/ListPage";
import { BooleanBadge } from "@/components/shared/boolean-badge";
import { RoleBadge } from "@/components/shared/role-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { useReturnTo } from "@/hooks/use-return-to";
import { formatDateInTimezone } from "@/lib/date.utils";
import { useUsersStore } from "@/store/users.store";
import type { Profile } from "@/types/db/profile.types";
import {
  IconCircleCheck,
  IconPlayerPause,
  IconPlus,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

export default function UsersListPage() {
  const router = useRouter();
  const { withReturnTo } = useReturnTo();
  const {
    users,
    pagination,
    isLoading,
    error,
    fetchUsers,
    deleteUser,
    approveUser,
    suspendUser,
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
        router.push(withReturnTo(`/admin/users/${user.id}/update`));
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
            onClick: () => router.push(withReturnTo("/admin/users/create")),
          },
        ],
        additional: [
          {
            id: "user-details",
            label: "View Details",
            onClick: (user: Profile) => {
              router.push(withReturnTo(`/admin/users/${user.id}/details`));
            },
          },
          {
            id: "approve-user",
            label: "Approve",
            icon: IconCircleCheck,
            onClick: (user: Profile) => {
              approveUser(user.id);
            },
            hidden: (user: Profile) =>
              user.status === "ACTIVE" && user.verified,
          },
          {
            id: "suspend-user",
            label: "Suspend",
            icon: IconPlayerPause,
            onClick: (user: Profile) => {
              suspendUser(user.id);
            },
            hidden: (user: Profile) => user.status === "SUSPENDED",
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
  }, [
    fetchUsers,
    currentPage,
    pageSize,
    router,
    withReturnTo,
    deleteUser,
    approveUser,
    suspendUser,
  ]);

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
