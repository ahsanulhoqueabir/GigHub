"use client";

import { AttachmentChip } from "@/components/shared/attachment-chip";
import { ErrorState } from "@/components/shared/error-state";
import { FileUploadDropzone } from "@/components/shared/FileUploadDropzone";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BackButton } from "@/components/ui/back-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { formatDateInTimezone, formatDateTime } from "@/lib/date.utils";
import { getJobTypeBadgeColors } from "@/lib/shared/badge.utils";
import { cn } from "@/lib/utils";
import { useFileUploadStore } from "@/store/file-upload.store";
import { useJobProposalsStore } from "@/store/job-proposals.store";
import {
  IconAlertTriangle,
  IconBriefcase,
  IconBuilding,
  IconCalendar,
  IconCheckbox,
  IconCircleCheck,
  IconClock,
  IconEdit,
  IconLink,
  IconLoader,
  IconLoader2,
  IconMapPin,
  IconPaperclip,
  IconShieldCheck,
  IconTag,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
      {children}
    </p>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 p-1.5 rounded-md bg-muted shrink-0">
        <Icon className="size-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium mt-0.5 wrap-break-word">
          {value || "N/A"}
        </p>
      </div>
    </div>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────

function AppliedJobDetailContent({ id }: { id: string }) {
  const router = useRouter();

  const {
    selectedAppliedJob: proposal,
    isLoadingDetail,
    detailError,
    isUpdatingApplied,
    updateAppliedError,
    fetchAppliedJobDetail,
    updateAppliedJob,
    clearUpdateAppliedError,
  } = useJobProposalsStore();

  // Edit state — initialized from proposal when entering edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editDescription, setEditDescription] = useState("");
  const [editAttachments, setEditAttachments] = useState<string[]>([]);
  const [pendingAttachments, setPendingAttachments] = useState<File[]>([]);
  const [isUploadingAttachments, setIsUploadingAttachments] = useState(false);
  const editInitializedRef = useRef(false);
  const { uploadFiles } = useFileUploadStore();

  useEffect(() => {
    fetchAppliedJobDetail(id);
  }, [id, fetchAppliedJobDetail]);

  // Initialize edit fields once when proposal first loads
  useEffect(() => {
    if (proposal && !editInitializedRef.current) {
      editInitializedRef.current = true;
      setEditDescription(proposal.description);
      setEditAttachments(proposal.attachments ?? []);
    }
  }, [proposal]);

  // Clear error on unmount
  useEffect(() => () => clearUpdateAppliedError(), [clearUpdateAppliedError]);

  const handleEdit = useCallback(() => {
    if (!proposal) return;
    // Re-initialize edit fields from latest proposal data
    setEditDescription(proposal.description);
    setEditAttachments(proposal.attachments ?? []);
    setIsEditing(true);
    clearUpdateAppliedError();
  }, [proposal, clearUpdateAppliedError]);

  const handleCancelEdit = useCallback(() => {
    if (!proposal) return;
    setIsEditing(false);
    setEditDescription(proposal.description);
    setEditAttachments(proposal.attachments ?? []);
    setPendingAttachments([]);
    clearUpdateAppliedError();
  }, [proposal, clearUpdateAppliedError]);

  const handleSave = useCallback(async () => {
    if (!proposal) return;
    try {
      let allAttachments = [...editAttachments];

      if (pendingAttachments.length > 0) {
        setIsUploadingAttachments(true);
        const uploadedUrls = await uploadFiles(
          pendingAttachments,
          "job-attachments",
        );
        allAttachments = [...allAttachments, ...uploadedUrls];
        setPendingAttachments([]);
        setIsUploadingAttachments(false);
      }

      await updateAppliedJob(id, {
        description: editDescription,
        attachments: allAttachments,
      });
      setIsEditing(false);
      toast.success("Proposal updated successfully");
    } catch {
      setIsUploadingAttachments(false);
      // error shown via updateAppliedError
    }
  }, [
    proposal,
    id,
    editDescription,
    editAttachments,
    pendingAttachments,
    updateAppliedJob,
    uploadFiles,
  ]);

  const handleStatusToggle = useCallback(async () => {
    if (!proposal) return;
    const newStatus = proposal.status === "DRAFT" ? "PENDING" : "DRAFT";
    try {
      await updateAppliedJob(id, { status: newStatus });
      toast.success(`Proposal status changed to ${newStatus}`);
    } catch {
      // error shown via updateAppliedError
    }
  }, [proposal, id, updateAppliedJob]);

  const handleRemoveAttachment = useCallback((index: number) => {
    setEditAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handlePendingFiles = useCallback((files: File[]) => {
    setPendingAttachments((prev) => [...prev, ...files]);
  }, []);

  // ── Loading state
  if (isLoadingDetail) {
    return <PageSkeleton variant="details" rows={6} columns={2} />;
  }

  // ── Error state
  if (detailError) {
    return (
      <ErrorState
        message={detailError}
        onRetry={() => fetchAppliedJobDetail(id)}
        onBack={() => router.back()}
      />
    );
  }

  // ── Not found
  if (!proposal) {
    return (
      <ErrorState
        type="not-found"
        heading="Proposal not found"
        message="This proposal may have been deleted or you don't have access to it."
        onBack={() => router.back()}
      />
    );
  }

  const job = proposal.job;
  const jobTypeColors = job?.type ? getJobTypeBadgeColors(job.type) : null;
  const isEditable = ["DRAFT", "PENDING"].includes(proposal.status);

  return (
    <div className="space-y-6 pb-10">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <BackButton onClick={() => router.back()} />
          <div>
            <h1 className="text-lg lg:text-xl font-bold ">
              {job?.title || "Applied Job Proposal"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Applied on {formatDateInTimezone(proposal.created_at)}
              {proposal.updated_at !== proposal.created_at && (
                <> · Updated {formatDateInTimezone(proposal.updated_at)}</>
              )}
            </p>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1">
            Proposal:
            <StatusBadge status={proposal.status} />
          </span>
          {job && (
            <span className="inline-flex items-center gap-1">
              Job:
              <StatusBadge status={job.status} />
            </span>
          )}
        </div>
      </div>

      {/* ── Main Grid ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Job details (2/3 width) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Job Details Card */}
          {job && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-primary/10">
                    <IconBriefcase className="size-4 text-primary" />
                  </div>
                  Job Details
                  {jobTypeColors && (
                    <Badge
                      className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${jobTypeColors.bg}`}
                    >
                      {jobTypeColors.label}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Description */}
                {job.description && (
                  <div>
                    <SectionLabel>Description</SectionLabel>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {job.description}
                    </p>
                  </div>
                )}

                {/* Key info grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InfoRow
                    icon={IconBuilding}
                    label="Budget"
                    value={job.budget}
                  />
                  <InfoRow
                    icon={IconCalendar}
                    label="Deadline"
                    value={formatDateInTimezone(job.deadline)}
                  />
                  {job.location && (
                    <InfoRow
                      icon={IconMapPin}
                      label="Location"
                      value={job.location}
                    />
                  )}
                  {job.category && (
                    <InfoRow
                      icon={IconTag}
                      label="Category"
                      value={job.category.name}
                    />
                  )}
                </div>

                {/* Required Skills */}
                {job.required_skills && job.required_skills.length > 0 && (
                  <div>
                    <SectionLabel>Required Skills</SectionLabel>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {job.required_skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {job.tags && job.tags.length > 0 && (
                  <div>
                    <SectionLabel>Tags</SectionLabel>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {job.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-muted text-muted-foreground"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Job Attachments */}
                {job.attachments && job.attachments.length > 0 && (
                  <div>
                    <SectionLabel>Job Attachments</SectionLabel>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {job.attachments.map((url, i) => (
                        <AttachmentChip
                          key={i}
                          url={url}
                          fallbackIndex={i + 1}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* View Job link */}
                {job.slug && (
                  <div className="pt-1">
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={() => router.push(`/jobs/${job.slug}`)}
                      className="gap-1.5"
                    >
                      <IconLink size={14} />
                      View Full Job Listing
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Proposal Section — View / Edit */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-muted">
                    <IconCheckbox className="size-4 text-muted-foreground" />
                  </div>
                  My Proposal
                </CardTitle>
                {isEditable && !isEditing && (
                  <Button
                    size="lg"
                    onClick={handleEdit}
                    className="gap-1.5 h-8"
                  >
                    <IconEdit size={14} />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Update error */}
              {updateAppliedError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <IconAlertTriangle className="size-4 mt-0.5 shrink-0" />
                  <p>{updateAppliedError}</p>
                </div>
              )}

              {isEditing ? (
                /* ── Edit Mode ── */
                <div className="space-y-4">
                  <div>
                    <SectionLabel>Description</SectionLabel>
                    <Textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={6}
                      placeholder="Describe why you're a great fit for this role…"
                      className="mt-1 resize-y text-sm"
                    />
                  </div>

                  <div>
                    <SectionLabel>Attachments</SectionLabel>
                    {/* Existing attachment chips in edit mode */}
                    <div className="flex flex-wrap gap-2 mt-1 mb-2">
                      {editAttachments.map((url, i) => (
                        <div
                          key={i}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-muted text-foreground border border-border group"
                        >
                          <IconPaperclip className="size-3 text-muted-foreground shrink-0" />
                          <span className="max-w-37.5 line-clamp-1">
                            {url.split("/").pop() || url}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(i)}
                            className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <IconX size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                    {/* File upload dropzone */}
                    {!isUploadingAttachments && (
                      <FileUploadDropzone
                        variant="dropzone"
                        buttonLabel="Select Files"
                        onFilesSelected={handlePendingFiles}
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                        maxFiles={10}
                        currentCount={
                          editAttachments.length + pendingAttachments.length
                        }
                        selectedFiles={pendingAttachments}
                      />
                    )}
                    {/* Pending files indicator */}
                    {pendingAttachments.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground">
                          {pendingAttachments.length} file
                          {pendingAttachments.length > 1 ? "s" : ""} pending
                          upload
                        </p>
                        {pendingAttachments.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-sm bg-muted/30 rounded px-3 py-2 border border-dashed border-primary/30"
                          >
                            <IconPaperclip className="size-3.5 text-primary shrink-0" />
                            <span className="flex-1 truncate">{file.name}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setPendingAttachments((prev) =>
                                  prev.filter((_, i) => i !== idx),
                                )
                              }
                              className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                            >
                              <IconX size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Uploading indicator */}
                  {isUploadingAttachments && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg px-4 py-3 border border-border">
                      <IconLoader className="size-4 animate-spin" />
                      Uploading attachments&hellip;
                    </div>
                  )}

                  {/* Save / Cancel buttons */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      variant="destructive"
                      onClick={handleCancelEdit}
                      disabled={isUpdatingApplied || isUploadingAttachments}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={
                        isUpdatingApplied ||
                        isUploadingAttachments ||
                        !editDescription.trim()
                      }
                      className="gap-1.5"
                    >
                      {isUpdatingApplied || isUploadingAttachments ? (
                        <>
                          <IconLoader2 size={14} className="animate-spin" />
                          {isUploadingAttachments
                            ? "Uploading&hellip;"
                            : "Saving&hellip;"}
                        </>
                      ) : (
                        <>
                          <IconCircleCheck size={14} />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                /* ── View Mode ── */
                <div className="space-y-4">
                  <div>
                    <SectionLabel>Description</SectionLabel>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap mt-1">
                      {proposal.description || (
                        <span className="italic">No description provided.</span>
                      )}
                    </p>
                  </div>

                  {proposal.attachments && proposal.attachments.length > 0 && (
                    <div>
                      <SectionLabel>Attachments</SectionLabel>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {proposal.attachments.map((url, i) => (
                          <AttachmentChip
                            key={i}
                            url={url}
                            fallbackIndex={i + 1}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Status Toggle (DRAFT ↔ PENDING) */}
              {isEditable && !isEditing && (
                <div
                  className={cn(
                    "flex items-center justify-between gap-3 p-3 rounded-lg border",
                    proposal.status === "DRAFT"
                      ? "border-amber-200 bg-amber-50/50"
                      : "border-emerald-200 bg-emerald-50/50",
                  )}
                >
                  <div>
                    <p className="text-sm font-medium">
                      {proposal.status === "DRAFT"
                        ? "Ready to submit?"
                        : "Need to revise?"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {proposal.status === "DRAFT"
                        ? "Change status to PENDING to make it visible to the job owner."
                        : "Revert to DRAFT to edit before re-submitting."}
                    </p>
                  </div>
                  <Button
                    variant="refresh"
                    size="sm"
                    onClick={handleStatusToggle}
                    disabled={isUpdatingApplied}
                    className="shrink-0 gap-1.5"
                  >
                    {isUpdatingApplied ? (
                      <IconLoader2 size={14} className="animate-spin" />
                    ) : null}
                    {proposal.status === "DRAFT" ? "Submit" : "Revert to Draft"}
                  </Button>
                </div>
              )}

              {/* Non-editable status notice */}
              {!isEditable && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/60 text-muted-foreground text-sm">
                  <IconShieldCheck className="size-4 shrink-0" />
                  <p>
                    Proposals with status{" "}
                    <strong className="text-foreground">
                      {proposal.status}
                    </strong>{" "}
                    cannot be edited.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: Owner + timestamps */}
        <div className="space-y-5">
          {/* Job Owner Card */}
          {job?.owner && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <IconUser className="size-4 text-muted-foreground" />
                  Job Posted By
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="size-10 shrink-0">
                    <AvatarImage
                      src={job.owner.avatar || undefined}
                      alt={job.owner.name}
                    />
                    <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
                      {job.owner.name?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-sm truncate">
                        {job.owner.name}
                      </p>
                      {job.owner.verified && (
                        <IconShieldCheck className="size-3.5 text-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      @{job.owner.username}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <IconClock className="size-4 text-muted-foreground" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Applied On</p>
                <p className="text-sm font-medium mt-0.5">
                  {formatDateTime(proposal.created_at)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last Updated</p>
                <p className="text-sm font-medium mt-0.5">
                  {formatDateTime(proposal.updated_at)}
                </p>
              </div>
              {job?.deadline && (
                <div>
                  <p className="text-xs text-muted-foreground">Job Deadline</p>
                  <p className="text-sm font-medium mt-0.5">
                    {formatDateInTimezone(job.deadline)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Proposal ID (utility) */}
          <Card className="bg-muted/30">
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground mb-1">Proposal ID</p>
              <p className="text-xs font-mono break-all text-foreground/70 select-all">
                {proposal.id}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton wrapper ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-80 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AppliedJobDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <AppliedJobDetailContent id={id} />
    </Suspense>
  );
}
