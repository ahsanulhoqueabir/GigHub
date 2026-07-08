"use client";

import { BackButton } from "@/components/ui/back-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { api_client } from "@/lib/api/api-client";
import { useJobProposalsStore } from "@/store/job-proposals.store";
import { useJobsStore } from "@/store/jobs.store";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconFile,
  IconInfoCircle,
  IconLoader2,
  IconMapPin,
  IconPaperclip,
  IconSend,
  IconTools,
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
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-6 w-32" />
        <Skeleton className="mb-4 h-8 w-72" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
        <Skeleton className="mt-6 h-48 w-full rounded-xl" />
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
    <div className="">
      {/* Job header with inline back button */}
      <div className="mb-8 flex items-center gap-3">
        <BackButton href={`/jobs/${slug}`} />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Apply for Job</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Submit your proposal for{" "}
            <span className="font-medium text-foreground">{job.title}</span>
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* ─── Left column: Form ────────────────────────────────── */}
        <div className="space-y-8">
          {/* Proposal Form */}
          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">
              Your Proposal
            </h2>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
              id="apply-form"
            >
              {/* Description */}
              <div>
                <Label htmlFor="description">
                  Why are you a good fit?{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your experience, skills, and why you're the right candidate for this job..."
                  rows={6}
                  className="mt-1.5"
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
                <Label>
                  Attachments{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional — portfolio, resume, images, etc.)
                  </span>
                </Label>

                {/* Selected files list */}
                {attachmentFiles.length > 0 && (
                  <div className="mb-2 mt-1.5 space-y-1.5">
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
                <div className="mt-1.5">
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
            </form>
          </section>
        </div>

        {/* ─── Right column: Order summary sidebar ────────────── */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Job Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Job highlight */}
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-sm font-medium text-foreground">
                  {job.title}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="secondary">{job.type}</Badge>
                  {job.budget && <Badge variant="outline">{job.budget}</Badge>}
                </div>
              </div>

              {/* Job details */}
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Posted by</span>
                  <span className="font-medium text-foreground">
                    {job.owner.name}
                  </span>
                </div>
                {job.location && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span className="flex items-center gap-1 font-medium text-foreground">
                      <IconMapPin className="size-3.5" />
                      {job.location}
                    </span>
                  </div>
                )}
              </div>

              {job.required_skills && job.required_skills.length > 0 && (
                <div>
                  <span className="text-xs text-muted-foreground">
                    Required Skills
                  </span>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {job.required_skills.map((skill, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="gap-1 text-xs"
                      >
                        <IconTools className="size-3" />
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-border" />

              {/* Info notice */}
              <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                <IconInfoCircle className="mt-0.5 size-4 shrink-0" />
                <span>
                  Your proposal will be sent to the job poster. You can track
                  your application status from your profile.
                </span>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                form="apply-form"
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
