"use client";

import { Suspense } from "react";
import { DepartmentForm } from "@/components/admin/departments/DepartmentForm";
import { FormSkeleton } from "@/components/shared/form-skeleton";

function CreateDepartmentContent() {
  return (
    <div className="flex-1 mx-auto">
      <DepartmentForm />
    </div>
  );
}

export default function CreateDepartmentPage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <CreateDepartmentContent />
    </Suspense>
  );
}
