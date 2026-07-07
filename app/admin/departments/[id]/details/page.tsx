"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useDepartmentsStore } from "@/store/departments.store";
import { IconArrowLeft, IconTrash } from "@tabler/icons-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useDeleteConfirm } from "@/components/shared/delete-confirm-dialog";
import { useReturnTo } from "@/hooks/use-return-to";
import { DetailsSkeleton } from "@/components/shared/details-skeleton";
import { Department } from "@/types/db/department.types";

function DepartmentDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const { returnTo } = useReturnTo();
  const returnUrl = searchParams?.get("returnTo") || returnTo;
  const { getDepartment, deleteDepartment } = useDepartmentsStore();
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const { confirmDelete, deleteDialog } = useDeleteConfirm();

  useEffect(() => {
    async function loadDepartment() {
      if (id) {
        const data = await getDepartment(id);
        setDepartment(data);
        setLoading(false);
      }
    }
    loadDepartment();
  }, [id, getDepartment]);

  const handleDelete = useCallback(async () => {
    const confirmed = await confirmDelete(
      department?.name || "this department",
    );
    if (!confirmed) return;
    await deleteDepartment(id);
    router.push(returnUrl);
  }, [department, confirmDelete, deleteDepartment, id, router, returnUrl]);

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
            <h2 className="text-2xl font-bold tracking-tight">
              Department Details
            </h2>
            <p className="text-muted-foreground text-sm">
              View department information.
            </p>
          </div>
        </div>
        {department && (
          <div className="flex items-center gap-2">
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <IconTrash className="h-4 w-4 mr-1.5" />
              Delete
            </Button>
            <Button asChild>
              <Link
                href={`/admin/departments/${id}/update?returnTo=${encodeURIComponent(returnUrl)}`}
              >
                Edit Department
              </Link>
            </Button>
          </div>
        )}
      </div>

      <div className="max-w-3xl">
        {loading ? (
          <DetailsSkeleton rows={2} columns={1} showHeader={false} />
        ) : department ? (
          <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Department Information
              </h3>
            </div>
            <div className="px-6 py-5">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">
                    Department Name
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {department.name}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">
                    Description
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {department.description || "No description provided."}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-red-500 font-medium">
            Department not found
          </div>
        )}
      </div>

      {deleteDialog}
    </div>
  );
}

export default function DepartmentDetailsPage() {
  return (
    <Suspense fallback={<DetailsSkeleton />}>
      <DepartmentDetailsContent />
    </Suspense>
  );
}
