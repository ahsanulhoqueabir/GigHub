"use client";

import { AdBannerForm } from "@/components/admin/ad-banners/AdBannerForm";
import { FormSkeleton } from "@/components/shared/form-skeleton";
import { useAdBannersStore } from "@/store/ad-banners.store";
import { AdBanner } from "@/types/db/ad-banner.types";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function UpdateAdBannerContent() {
  const params = useParams();
  const id = params.id as string;
  const { getItem } = useAdBannersStore();
  const [initialData, setInitialData] = useState<AdBanner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (id) {
        const banner = await getItem(id);
        setInitialData(banner);
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
        <AdBannerForm initialData={initialData} isUpdate />
      ) : (
        <div className="p-6 text-center text-red-500 font-medium">
          Ad banner not found
        </div>
      )}
    </div>
  );
}

export default function UpdateAdBannerPage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <UpdateAdBannerContent />
    </Suspense>
  );
}
