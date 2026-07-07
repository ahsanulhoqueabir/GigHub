"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCategoriesStore } from "@/store/categories.store";
import { IconArrowLeft, IconTrash } from "@tabler/icons-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useDeleteConfirm } from "@/components/shared/delete-confirm-dialog";
import { useReturnTo } from "@/hooks/use-return-to";
import { DetailsSkeleton } from "@/components/shared/details-skeleton";
import type { Category } from "@/types/db/category.types";

function CategoryDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const { returnTo } = useReturnTo();
  const returnUrl = searchParams?.get("returnTo") || returnTo;
  const { getCategory, deleteCategory } = useCategoriesStore();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const { confirmDelete, deleteDialog } = useDeleteConfirm();

  useEffect(() => {
    async function loadCategory() {
      if (id) {
        const data = await getCategory(id);
        setCategory(data);
        setLoading(false);
      }
    }
    loadCategory();
  }, [id, getCategory]);

  const handleDelete = useCallback(async () => {
    const confirmed = await confirmDelete(category?.name || "this category");
    if (!confirmed) return;
    await deleteCategory(id);
    router.push(returnUrl);
  }, [category, confirmDelete, deleteCategory, id, router, returnUrl]);

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
              Category Details
            </h2>
            <p className="text-muted-foreground text-sm">
              View category information.
            </p>
          </div>
        </div>
        {category && (
          <div className="flex items-center gap-2">
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <IconTrash className="h-4 w-4 mr-1.5" />
              Delete
            </Button>
            <Button asChild>
              <Link
                href={`/admin/categories/${id}/update?returnTo=${encodeURIComponent(returnUrl)}`}
              >
                Edit Category
              </Link>
            </Button>
          </div>
        )}
      </div>

      <div className="max-w-3xl">
        {loading ? (
          <DetailsSkeleton rows={2} columns={1} showHeader={false} />
        ) : category ? (
          <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Category Information
              </h3>
            </div>
            <div className="px-6 py-5">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">
                    Category Name
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {category.name}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">
                    Description
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {category.description || "No description provided."}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-red-500 font-medium">
            Category not found
          </div>
        )}
      </div>

      {deleteDialog}
    </div>
  );
}

export default function CategoryDetailsPage() {
  return (
    <Suspense fallback={<DetailsSkeleton />}>
      <CategoryDetailsContent />
    </Suspense>
  );
}
