"use client";

import { DepartmentForm } from "@/components/admin/departments/DepartmentForm";
import { FormSkeleton } from "@/components/shared/form-skeleton";
import { useDepartmentsStore } from "@/store/departments.store";
import { Department } from "@/types/db/department.types";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function UpdateDepartmentContent() {
  const params = useParams();
  const id = params.id as string;
  const { getDepartment } = useDepartmentsStore();
  const [initialData, setInitialData] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDepartment() {
      if (id) {
        const department = await getDepartment(id);
        setInitialData(department);
        setLoading(false);
      }
    }
    loadDepartment();
  }, [id, getDepartment]);

  return (
    <div className="flex-1  mx-auto">
      {loading ? (
        <FormSkeleton />
      ) : initialData ? (
        <DepartmentForm initialData={initialData} isUpdate />
      ) : (
        <div className="p-6 text-center text-red-500 font-medium">
          Department not found
        </div>
      )}
    </div>
  );
}

export default function UpdateDepartmentPage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <UpdateDepartmentContent />
    </Suspense>
  );
}
