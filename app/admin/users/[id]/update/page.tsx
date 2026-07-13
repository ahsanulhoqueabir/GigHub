"use client";

import { UserForm } from "@/components/admin/users/UserForm";
import { ErrorState } from "@/components/shared/error-state";
import { FormSkeleton } from "@/components/shared/form-skeleton";
import { useUsersStore } from "@/store/users.store";
import { Profile } from "@/types/db/profile.types";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function UpdateUserContent() {
  const params = useParams();
  const id = params.id as string;
  const { getUser } = useUsersStore();
  const [initialData, setInitialData] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (id) {
        const user = await getUser(id);
        setInitialData(user);
        setLoading(false);
      }
    }
    loadUser();
  }, [id, getUser]);

  return (
    <div className="flex-1  mx-auto">
      {loading ? (
        <FormSkeleton />
      ) : initialData ? (
        <UserForm initialData={initialData} isUpdate />
      ) : (
        <ErrorState type="not-found" heading="User not found" compact />
      )}
    </div>
  );
}

export default function UpdateUserPage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <UpdateUserContent />
    </Suspense>
  );
}
