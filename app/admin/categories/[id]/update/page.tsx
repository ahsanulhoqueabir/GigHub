"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CategoryForm } from "@/components/admin/categories/CategoryForm";
import { useCategoriesStore } from "@/store/categories.store";
import { FormSkeleton } from "@/components/shared/form-skeleton";
import { Category } from "@/types/db/category.types";

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
        <div className="p-6 text-center text-red-500 font-medium">
          Category not found
        </div>
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
