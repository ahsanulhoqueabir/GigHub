"use client";

import { Suspense } from "react";
import { CategoryForm } from "@/components/admin/categories/CategoryForm";
import { FormSkeleton } from "@/components/shared/form-skeleton";

function CreateCategoryContent() {
  return (
    <div className="flex-1 mx-auto">
      <CategoryForm />
    </div>
  );
}

export default function CreateCategoryPage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <CreateCategoryContent />
    </Suspense>
  );
}
