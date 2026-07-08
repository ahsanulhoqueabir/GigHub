"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  IconArrowLeft,
  IconSend,
  IconInfoCircle,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useJobsStore } from "@/store/jobs.store";
import { useJobProposalsStore } from "@/store/job-proposals.store";

const applySchema = z.object({
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(5000, "Description must not exceed 5000 characters"),
});

type ApplyForm = z.infer<typeof applySchema>;

export default function JobApplyPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const job = useJobsStore((s) => s.applyJob);
  const loading = useJobsStore((s) => s.isLoadingApplyJob);
  const fetchApplyJob = useJobsStore((s) => s.fetchApplyJob);

  const isCreating = useJobProposalsStore((s) => s.isCreating);
  const createProposal = useJobProposalsStore((s) => s.createProposal);

  const [attachmentUrls, setAttachmentUrls] = useState<string[]>([]);
  const [newAttachment, setNewAttachment] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplyForm>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      description: "",
    },
  });

  useEffect(() => {
    if (slug) fetchApplyJob(slug);
  }, [slug, fetchApplyJob]);

  const addAttachment = () => {
    const url = newAttachment.trim();
    if (!url) return;
    if (attachmentUrls.length >= 10) {
      toast.error("Maximum 10 attachments allowed");
      return;
    }
    setAttachmentUrls((prev) => [...prev, url]);
    setNewAttachment("");
  };

  const removeAttachment = (idx: number) => {
    setAttachmentUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const onSubmit = async (formData: ApplyForm) => {
    if (!job) return;

    try {
      await createProposal({
        job: job.id,
        description: formData.description,
        attachments: attachmentUrls.length > 0 ? attachmentUrls : undefined,
      });

      toast.success("Proposal submitted successfully!");
      router.push("/profile/applied-jobs");
    } catch {
      toast.error("Failed to submit proposal. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-4 h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <p className="text-muted-foreground">Job not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/jobs">Back to Jobs</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link href={`/jobs/${slug}`}>
          <IconArrowLeft className="mr-1 size-4" />
          Back to Job
        </Link>
      </Button>

      <h1 className="text-2xl font-semibold text-foreground">Apply for Job</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Submit your proposal for &quot;{job.title}&quot;
      </p>

      {/* Job Summary */}
      <div className="mt-6 rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground">Job Summary</h2>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Title</span>
            <span className="font-medium text-foreground">{job.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type</span>
            <span className="font-medium text-foreground">{job.type}</span>
          </div>
          {job.budget && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Budget</span>
              <span className="font-medium text-foreground">{job.budget}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Posted by</span>
            <span className="font-medium text-foreground">
              {job.owner.name}
            </span>
          </div>
        </div>
      </div>

      {/* Application Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Why are you a good fit? <span className="text-destructive">*</span>
          </label>
          <Textarea
            id="description"
            placeholder="Describe your experience, skills, and why you're the right candidate for this job..."
            rows={6}
            {...register("description")}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-destructive">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Attachments */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Attachments{" "}
            <span className="text-muted-foreground font-normal">
              (optional — URLs to portfolio, resume, etc.)
            </span>
          </label>

          {/* Attachment list */}
          {attachmentUrls.length > 0 && (
            <div className="mb-2 space-y-1.5">
              {attachmentUrls.map((url, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm"
                >
                  <span className="flex-1 truncate text-muted-foreground">
                    {url}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(idx)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <IconX className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add attachment input */}
          <div className="flex gap-2">
            <Input
              placeholder="Paste a URL (e.g. portfolio link)"
              value={newAttachment}
              onChange={(e) => setNewAttachment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addAttachment();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={addAttachment}
              disabled={!newAttachment.trim()}
            >
              <IconPlus className="size-4" />
            </Button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Max 10 attachments. Press Enter or click + to add.
          </p>
        </div>

        {/* Info */}
        <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          <IconInfoCircle className="mt-0.5 size-4 shrink-0" />
          <span>
            Your proposal will be sent to the job poster. You can track your
            application status from your profile.
          </span>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isCreating}
        >
          {isCreating ? (
            "Submitting Proposal..."
          ) : (
            <>
              <IconSend className="mr-1.5 size-4" />
              Submit Proposal
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
