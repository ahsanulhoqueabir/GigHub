"use client";

import { JobForm } from "@/components/jobs/job-form";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { Button } from "@/components/ui/button";
import { useReturnTo } from "@/hooks/use-return-to";
import type { CreateJobInput } from "@/lib/validations/job.schema";
import { useJobsStore } from "@/store/jobs.store";
import { useRouter } from "next/navigation";
import { Suspense, useCallback } from "react";
import { toast } from "sonner";

function CreateJobContent() {
  const router = useRouter();
  const { returnTo } = useReturnTo("/profile/jobs");
  const { createJob, isMutating } = useJobsStore();

  const handleSubmit = useCallback(
    async (formData: CreateJobInput) => {
      try {
        await createJob(formData);
        toast.success("Job created successfully!");
        router.push(returnTo);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to create Job";
        toast.error(msg);
      }
    },
    [createJob, router, returnTo],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={returnTo}
        title="Create a New Job"
        description="Fill in the details to publish a new job listing for applicants."
        actions={
          <Button type="submit" form="job-form" disabled={isMutating}>
            {isMutating ? "Creating..." : "Create Job"}
          </Button>
        }
      />

      <div className="mt-6">
        <JobForm
          formId="job-form"
          onSubmit={handleSubmit}
          isEdit={false}
          isSubmitting={isMutating}
        />
      </div>
    </div>
  );
}

export default function CreateJobPage() {
  return (
    <Suspense fallback={<PageSkeleton variant="form" fields={6} columns={1} />}>
      <CreateJobContent />
    </Suspense>
  );
}
