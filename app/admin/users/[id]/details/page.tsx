"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useUsersStore } from "@/store/users.store";
import { IconArrowLeft, IconTrash } from "@tabler/icons-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useDeleteConfirm } from "@/components/shared/delete-confirm-dialog";
import { useReturnTo } from "@/hooks/use-return-to";
import { DetailsSkeleton } from "@/components/shared/details-skeleton";
import { Profile } from "@/types/db/profile.types";

function UserDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const { returnTo } = useReturnTo();
  const returnUrl = searchParams?.get("returnTo") || returnTo;
  const { getUser, deleteUser } = useUsersStore();
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { confirmDelete, deleteDialog } = useDeleteConfirm();

  useEffect(() => {
    async function loadUser() {
      if (id) {
        const data = await getUser(id);
        setUser(data);
        setLoading(false);
      }
    }
    loadUser();
  }, [id, getUser]);

  const handleDelete = useCallback(async () => {
    const confirmed = await confirmDelete(user?.name || "this user");
    if (!confirmed) return;
    await deleteUser(id);
    router.push(returnUrl);
  }, [user, confirmDelete, deleteUser, id, router, returnUrl]);

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between space-x-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={returnUrl}>
              <IconArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">User Details</h2>
            <p className="text-muted-foreground text-sm">
              View comprehensive information about this user.
            </p>
          </div>
        </div>
        {user && (
          <div className="flex items-center gap-2">
            <Button variant="destructive" size="lg" onClick={handleDelete}>
              <IconTrash className="h-4 w-4 mr-1.5" />
              Delete
            </Button>
            <Button asChild size="lg" variant="accent">
              <Link
                href={`/admin/users/${id}/update?returnTo=${encodeURIComponent(returnUrl)}`}
              >
                Edit User
              </Link>
            </Button>
          </div>
        )}
      </div>

      <div className="max-w-3xl">
        {loading ? (
          <DetailsSkeleton rows={3} columns={2} showHeader={false} />
        ) : user ? (
          <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                User Information
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Personal details and system access level.
              </p>
            </div>
            <div className="px-6 py-5">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">
                    Full name
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.name}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">
                    Email address
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">
                    Username
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user.username || "N/A"}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Role</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-primary/10 text-primary">
                      {user.role}
                    </span>
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">
                    Department
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {typeof user.department === "string"
                      ? user.department
                      : user.department?.name || "N/A"}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">
                    Student ID
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user.student_id || "N/A"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-red-500 font-medium">
            User not found
          </div>
        )}
      </div>

      {deleteDialog}
    </div>
  );
}

export default function UserDetailsPage() {
  return (
    <Suspense fallback={<DetailsSkeleton />}>
      <UserDetailsContent />
    </Suspense>
  );
}
