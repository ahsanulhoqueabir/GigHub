"use client";

import { Suspense } from "react";
import { UserForm } from "@/components/admin/users/UserForm";
import { FormSkeleton } from "@/components/shared/form-skeleton";

function CreateUserContent() {
  return (
    <div className="flex-1 mx-auto">
      <UserForm />
    </div>
  );
}

export default function CreateUserPage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <CreateUserContent />
    </Suspense>
  );
}
