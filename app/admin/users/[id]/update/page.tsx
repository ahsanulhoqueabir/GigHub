"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { UserForm } from "@/components/admin/users/UserForm";
import { useUsersStore } from "@/store/users.store";
import { Profile } from "@/types/db/profile.types";

export default function UpdateUserPage() {
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
        <div className="p-6 text-center text-muted-foreground animate-pulse">
          Loading user data...
        </div>
      ) : initialData ? (
        <UserForm initialData={initialData} isUpdate />
      ) : (
        <div className="p-6 text-center text-red-500 font-medium">
          User not found
        </div>
      )}
    </div>
  );
}
