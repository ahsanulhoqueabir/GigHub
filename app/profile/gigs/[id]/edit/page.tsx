"use client";

import { GigForm } from "@/components/gigs/gig-form";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { useReturnTo } from "@/hooks/use-return-to";
import type { UpdateGigInput } from "@/lib/validations/gig.schema";
import { useGigsStore } from "@/store/gigs.store";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect } from "react";
import { toast } from "sonner";

function EditGigContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { returnTo } = useReturnTo("/profile/gigs");

  const {
    currentGig,
    isLoadingDetail,
    detailError,
    fetchGigById,
    updateGig,
    isMutating,
  } = useGigsStore();

  useEffect(() => {
    if (id) {
      fetchGigById(id);
    }
  }, [id, fetchGigById]);

  const handleSubmit = useCallback(
    async (formData: UpdateGigInput) => {
      try {
        await updateGig(id, formData);
        toast.success("Gig updated successfully!");
        router.push(returnTo);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to update Gig";
        toast.error(msg);
      }
    },
    [id, updateGig, router, returnTo],
  );

  if (isLoadingDetail) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-muted-foreground">
        Loading Gig details...
      </div>
    );
  }

  if (detailError || !currentGig) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16 px-4">
        <h2 className="text-2xl font-bold text-destructive">Gig Not Found</h2>
        <p className="text-muted-foreground mt-2">
          {detailError ||
            "The gig you are trying to edit does not exist or has been deleted."}
        </p>
        <Button className="mt-6" asChild>
          <Link href={returnTo}>Back to Gigs</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={returnTo}
        title="Edit Gig"
        description="Modify details and package pricing for your service listing."
        actions={
          <Button type="submit" form="edit-gig-form" disabled={isMutating}>
            {isMutating ? "Saving..." : "Save Changes"}
          </Button>
        }
      />

      <div className="mt-6">
        <GigForm
          formId="edit-gig-form"
          initialData={currentGig}
          onSubmit={handleSubmit}
          isEdit={true}
        />
      </div>
    </div>
  );
}

export default function EditGigPage() {
  return (
    <Suspense
      fallback={
        <div className=" text-center text-muted-foreground">
          Loading details...
        </div>
      }
    >
      <EditGigContent />
    </Suspense>
  );
}
