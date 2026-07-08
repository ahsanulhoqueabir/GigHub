"use client";

import { GigForm } from "@/components/gigs/gig-form";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { useReturnTo } from "@/hooks/use-return-to";
import type { CreateGigInput } from "@/lib/validations/gig.schema";
import { useGigsStore } from "@/store/gigs.store";
import { useRouter } from "next/navigation";
import { Suspense, useCallback } from "react";
import { toast } from "sonner";

function CreateGigContent() {
  const router = useRouter();
  const { returnTo } = useReturnTo("/profile/gigs");
  const { createGig, isMutating } = useGigsStore();

  const handleSubmit = useCallback(
    async (formData: CreateGigInput) => {
      try {
        await createGig(formData);
        toast.success("Gig created successfully!");
        router.push(returnTo);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to create Gig";
        toast.error(msg);
      }
    },
    [createGig, router, returnTo],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={returnTo}
        title="Create a New Gig"
        description="Fill in the details to publish a new service listing for buyers."
        actions={
          <Button
            size={"lg"}
            type="submit"
            form="gig-form"
            disabled={isMutating}
          >
            {isMutating ? "Creating..." : "Create Gig"}
          </Button>
        }
      />

      <div className="mt-6">
        <GigForm formId="gig-form" onSubmit={handleSubmit} isEdit={false} />
      </div>
    </div>
  );
}

export default function CreateGigPage() {
  return (
    <Suspense
      fallback={
        <div className=" text-center text-muted-foreground">
          Loading form...
        </div>
      }
    >
      <CreateGigContent />
    </Suspense>
  );
}
