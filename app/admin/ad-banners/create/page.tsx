"use client";

import { AdBannerForm } from "@/components/admin/ad-banners/AdBannerForm";
import { FormSkeleton } from "@/components/shared/form-skeleton";
import { Suspense } from "react";

function CreateAdBannerContent() {
  return (
    <div className="flex-1 mx-auto">
      <AdBannerForm />
    </div>
  );
}

export default function CreateAdBannerPage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <CreateAdBannerContent />
    </Suspense>
  );
}
