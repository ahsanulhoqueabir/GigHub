"use client";

import { HeroBannerForm } from "@/components/admin/hero-banners/HeroBannerForm";
import { FormSkeleton } from "@/components/shared/form-skeleton";
import { useHeroBannersStore } from "@/store/hero-banners.store";
import { HeroBanner } from "@/types/db/hero-banner.types";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function UpdateHeroBannerContent() {
  const params = useParams();
  const id = params.id as string;
  const { getItem } = useHeroBannersStore();
  const [initialData, setInitialData] = useState<HeroBanner | null>(null);
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
        <HeroBannerForm initialData={initialData} isUpdate />
      ) : (
        <div className="p-6 text-center text-red-500 font-medium">
          Hero banner not found
        </div>
      )}
    </div>
  );
}

export default function UpdateHeroBannerPage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <UpdateHeroBannerContent />
    </Suspense>
  );
}
