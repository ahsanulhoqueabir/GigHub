"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { api_client } from "@/lib/api/api-client";
import { useJobProposalsStore } from "@/store/job-proposals.store";
import { useJobsStore } from "@/store/jobs.store";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconArrowLeft,
  IconFile,
  IconInfoCircle,
  IconLoader2,
  IconPaperclip,
  IconSend,
  IconX,
} from "@tabler/icons-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

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

  // ── File picker ────────────────────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = 10 - attachmentFiles.length;
    if (files.length > remaining) {
      toast.error(`Maximum 10 attachments allowed (${remaining} remaining)`);
      return;
    }
    setAttachmentFiles((prev) => [...prev, ...files]);
    // Reset input so re-selecting the same file triggers onChange
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (idx: number) => {
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Upload files → R2 → get public URLs ────────────────────────
  const uploadToR2 = async (): Promise<string[]> => {
    if (attachmentFiles.length === 0) return [];

    setUploadingFiles(true);
    try {
      // 1. Get signed URLs
      const filesPayload = attachmentFiles.map((f) => ({
        fileName: f.name,
        contentType: f.type || "application/octet-stream",
      }));

      const { data: signedData } = await api_client.post("/signed-upload-url", {
        files: filesPayload,
        folder: "job-proposals",
      });

      const signedResults: {
        signedUrl: string;
        publicUrl: string;
      }[] = signedData.data;

      // 2. Upload each file directly to R2 using the signed URL
      await Promise.all(
        signedResults.map((item, i) =>
          fetch(item.signedUrl, {
            method: "PUT",
            body: attachmentFiles[i],
            headers: { "Content-Type": attachmentFiles[i].type },
          }),
        ),
      );

      // 3. Return public URLs
      return signedResults.map((r) => r.publicUrl);
    } finally {
      setUploadingFiles(false);
    }
  };

  // ── Submit ─────────────────────────────────────────────────────
  const onSubmit = async (formData: ApplyForm) => {
    if (!job) return;

    let urls = uploadedUrls;

    // Only upload if there are new files not yet uploaded
    if (attachmentFiles.length > 0 && uploadedUrls.length === 0) {
      urls = await uploadToR2();
      if (urls.length === 0) {
        toast.error("File upload failed. Please try again.");
        return;
      }
      setUploadedUrls(urls);
    }

    try {
      await createProposal({
        job: job.id,
        description: formData.description,
        attachments: urls.length > 0 ? urls : undefined,
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
              (optional — portfolio, resume, images, etc.)
            </span>
          </label>

          {/* Selected files list */}
          {attachmentFiles.length > 0 && (
            <div className="mb-2 space-y-1.5">
              {attachmentFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm"
                >
                  <IconFile className="size-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate text-foreground">
                    {file.name}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(0)} KB
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    disabled={uploadingFiles}
                    className="text-muted-foreground hover:text-destructive disabled:opacity-40"
                  >
                    <IconX className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* File picker button */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={attachmentFiles.length >= 10 || uploadingFiles}
              className="w-full"
            >
              <IconPaperclip className="mr-1.5 size-4" />
              {attachmentFiles.length >= 10
                ? "Maximum 10 files"
                : "Choose Files"}
            </Button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Max 10 files. Supported: images, PDF, DOC, TXT.
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
          disabled={isCreating || uploadingFiles}
        >
          {uploadingFiles ? (
            <>
              <IconLoader2 className="mr-1.5 size-4 animate-spin" />
              Uploading Files...
            </>
          ) : isCreating ? (
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
