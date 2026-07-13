"use client";

import { CategoryForm } from "@/components/admin/categories/CategoryForm";
import { ErrorState } from "@/components/shared/error-state";
import { FormSkeleton } from "@/components/shared/form-skeleton";
import { useCategoriesStore } from "@/store/categories.store";
import { Category } from "@/types/db/category.types";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function UpdateCategoryContent() {
  const params = useParams();
  const id = params.id as string;
  const { getCategory } = useCategoriesStore();
  const [initialData, setInitialData] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategory() {
      if (id) {
        const category = await getCategory(id);
        setInitialData(category);
        setLoading(false);
      }
    }
    loadCategory();
  }, [id, getCategory]);

  return (
    <div className="flex-1  mx-auto">
      {loading ? (
        <FormSkeleton />
      ) : initialData ? (
        <CategoryForm initialData={initialData} isUpdate />
      ) : (
        <ErrorState type="not-found" heading="Category not found" compact />
      )}
    </div>
  );
}

export default function UpdateCategoryPage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <UpdateCategoryContent />
    </Suspense>
  );
}
