"use client";

import { JobForm } from "@/components/jobs/job-form";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { Button } from "@/components/ui/button";
import { useReturnTo } from "@/hooks/use-return-to";
import type { UpdateJobInput } from "@/lib/validations/job.schema";
import { useJobsStore } from "@/store/jobs.store";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect } from "react";
import { toast } from "sonner";

function EditJobContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { returnTo } = useReturnTo("/profile/jobs");

  const {
    currentJob,
    isLoadingDetail,
    detailError,
    fetchJobById,
    updateJob,
    isMutating,
  } = useJobsStore();

  useEffect(() => {
    if (id) {
      fetchJobById(id);
    }
  }, [id, fetchJobById]);

  const handleSubmit = useCallback(
    async (formData: UpdateJobInput) => {
      try {
        await updateJob(id, formData);
        toast.success("Job updated successfully!");
        router.push(returnTo);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to update Job";
        toast.error(msg);
      }
    },
    [id, updateJob, router, returnTo],
  );

  if (isLoadingDetail) {
    return <PageSkeleton variant="form" fields={6} columns={1} />;
  }

  if (detailError || !currentJob) {
    return (
      <ErrorState
        type="not-found"
        heading="Job not found"
        message={
          detailError ||
          "The job you are trying to edit does not exist or has been deleted."
        }
        onBack={() => router.push(returnTo)}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href={returnTo}>Back to Jobs</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={returnTo}
        title="Edit Job"
        description="Modify the details of your job listing."
        actions={
          <Button type="submit" form="edit-job-form" disabled={isMutating}>
            {isMutating ? "Saving..." : "Save Changes"}
          </Button>
        }
      />

      <div className="mt-6">
        <JobForm
          formId="edit-job-form"
          initialData={currentJob}
          onSubmit={handleSubmit}
          isEdit={true}
          isSubmitting={isMutating}
        />
      </div>
    </div>
  );
}

export default function EditJobPage() {
  return (
    <Suspense fallback={<PageSkeleton variant="form" fields={6} columns={1} />}>
      <EditJobContent />
    </Suspense>
  );
}
