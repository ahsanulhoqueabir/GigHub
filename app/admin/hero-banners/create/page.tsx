"use client";

import { HeroBannerForm } from "@/components/admin/hero-banners/HeroBannerForm";
import { FormSkeleton } from "@/components/shared/form-skeleton";
import { Suspense } from "react";

function CreateHeroBannerContent() {
  return (
    <div className="flex-1 mx-auto">
      <HeroBannerForm />
    </div>
  );
}

export default function CreateHeroBannerPage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <CreateHeroBannerContent />
    </Suspense>
  );
}
