"use client";

import { AnnouncementForm } from "@/components/admin/announcements/AnnouncementForm";
import { FormSkeleton } from "@/components/shared/form-skeleton";
import { useAnnouncementsStore } from "@/store/announcements.store";
import { Announcement } from "@/types/db/announcement.types";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function UpdateAnnouncementContent() {
  const params = useParams();
  const id = params.id as string;
  const { getItem } = useAnnouncementsStore();
  const [initialData, setInitialData] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (id) {
        const item = await getItem(id);
        setInitialData(item);
        setLoading(false);
      }
    }
    load();
  }, [id, getItem]);

  return (
    <div className="flex-1 mx-auto">
      {loading ? (
        <FormSkeleton />
      ) : initialData ? (
        <AnnouncementForm initialData={initialData} isUpdate />
      ) : (
        <div className="p-6 text-center text-red-500 font-medium">
          Announcement not found
        </div>
      )}
    </div>
  );
}

export default function UpdateAnnouncementPage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <UpdateAnnouncementContent />
    </Suspense>
  );
}
