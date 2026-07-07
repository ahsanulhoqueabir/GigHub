"use client";

import { Suspense } from "react";
import { UserForm } from "@/components/admin/users/UserForm";

function CreateUserContent() {
  return (
    <div className="flex-1 mx-auto">
      <UserForm />
    </div>
  );
}

export default function CreateUserPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-center text-muted-foreground animate-pulse">
          Loading...
        </div>
      }
    >
      <CreateUserContent />
    </Suspense>
  );
}
