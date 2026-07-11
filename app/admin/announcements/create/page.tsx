"use client";

import { AnnouncementForm } from "@/components/admin/announcements/AnnouncementForm";
import { FormSkeleton } from "@/components/shared/form-skeleton";
import { Suspense } from "react";

function CreateAnnouncementContent() {
  return (
    <div className="flex-1 mx-auto">
      <AnnouncementForm />
    </div>
  );
}

export default function CreateAnnouncementPage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <CreateAnnouncementContent />
    </Suspense>
  );
}
