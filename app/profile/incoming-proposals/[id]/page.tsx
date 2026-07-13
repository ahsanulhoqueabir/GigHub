"use client";

import { AttachmentChip } from "@/components/shared/attachment-chip";
import { ErrorState } from "@/components/shared/error-state";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BackButton } from "@/components/ui/back-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateInTimezone, formatDateTime } from "@/lib/date.utils";
import { getJobTypeBadgeColors } from "@/lib/shared/badge.utils";
import { useJobProposalsStore } from "@/store/job-proposals.store";
import {
  IconAlertTriangle,
  IconBriefcase,
  IconBuilding,
  IconCalendar,
  IconCheck,
  IconCircleCheck,
  IconClock,
  IconLoader2,
  IconMapPin,
  IconShieldCheck,
  IconShoppingCart,
  IconTag,
  IconUser,
} from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect } from "react";
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

function IncomingProposalDetailContent({ id }: { id: string }) {
  const router = useRouter();

  const {
    selectedIncomingProposal: proposal,
    isLoadingIncomingDetail,
    incomingDetailError,
    isApproving,
    approveError,
    approveResult,
    fetchIncomingProposalDetail,
    approveProposal,
    clearApproveError,
  } = useJobProposalsStore();

  useEffect(() => {
    fetchIncomingProposalDetail(id);
  }, [id, fetchIncomingProposalDetail]);

  // Clear error on unmount
  useEffect(() => () => clearApproveError(), [clearApproveError]);

  const handleApprove = useCallback(async () => {
    if (!proposal) return;
    try {
      await approveProposal(id);
      toast.success("Proposal approved! Order has been created.", {
        action: {
          label: "View Order",
          onClick: () => router.push("/profile/orders"),
        },
      });
    } catch {
      // error shown via approveError
    }
  }, [proposal, id, approveProposal, router]);

  // ── Loading state
  if (isLoadingIncomingDetail) {
    return <PageSkeleton variant="details" rows={6} columns={2} />;
  }

  // ── Error state
  if (incomingDetailError) {
    return (
      <ErrorState
        message={incomingDetailError}
        onRetry={() => fetchIncomingProposalDetail(id)}
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
  const applicant = proposal.applicant;
  const jobTypeColors = job?.type ? getJobTypeBadgeColors(job.type) : null;
  const isPending = proposal.status === "PENDING";
  const isApproved = proposal.status === "APPROVED";

  return (
    <div className="space-y-6 pb-10">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <BackButton onClick={() => router.back()} />
          <div>
            <h1 className="text-lg lg:text-xl font-bold">
              {job?.title || "Proposal Details"}
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

      {/* ── Approve Banner ───────────────────────────────────────────────────── */}
      {isPending && (
        <Card className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-800">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                  <IconCheck className="size-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Ready to approve?</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Approving this proposal will change its status to APPROVED
                    and automatically create an order with a chat room.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleApprove}
                disabled={isApproving}
                className="shrink-0 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                size="lg"
              >
                {isApproving ? (
                  <>
                    <IconLoader2 size={16} className="animate-spin" />
                    Approving&hellip;
                  </>
                ) : (
                  <>
                    <IconCircleCheck size={16} />
                    Approve &amp; Create Order
                  </>
                )}
              </Button>
            </div>

            {/* Approve error */}
            {approveError && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm mt-3">
                <IconAlertTriangle className="size-4 mt-0.5 shrink-0" />
                <p>{approveError}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Approved Success Banner ──────────────────────────────────────────── */}
      {isApproved && approveResult && (
        <Card className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-800">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                  <IconShoppingCart className="size-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Order Created!</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Order code:{" "}
                    <span className="font-mono font-medium text-foreground">
                      {approveResult.order?.code || "N/A"}
                    </span>
                  </p>
                </div>
              </div>
              <Button
                onClick={() => router.push("/profile/orders")}
                variant="accent"
                size="lg"
                className="shrink-0 gap-1.5"
              >
                <IconShoppingCart size={16} />
                View Order
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Approved (from prior approval, no fresh result) ──────────────────── */}
      {isApproved && !approveResult && (
        <Card className="border-sky-200 bg-sky-50/50 dark:bg-sky-950/20 dark:border-sky-800">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-sky-100 dark:bg-sky-900/50">
                <IconShieldCheck className="size-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <p className="font-semibold text-sm">Approved</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  This proposal has been approved. An order was created when it
                  was approved.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                      <IconTag size={14} />
                      View Full Job Listing
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Proposal Section — Applicant's Proposal */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-muted">
                  <IconUser className="size-4 text-muted-foreground" />
                </div>
                Applicant&apos;s Proposal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                      <AttachmentChip key={i} url={url} fallbackIndex={i + 1} />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: Applicant info + timeline */}
        <div className="space-y-5">
          {/* Applicant Card */}
          {applicant && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <IconUser className="size-4 text-muted-foreground" />
                  Applicant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="size-10 shrink-0">
                    <AvatarImage
                      src={applicant.avatar || undefined}
                      alt={applicant.name}
                    />
                    <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
                      {applicant.name?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-sm truncate">
                        {applicant.name}
                      </p>
                      {applicant.verified && (
                        <IconShieldCheck className="size-3.5 text-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      @{applicant.username}
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

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

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

export default function IncomingProposalDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <IncomingProposalDetailContent id={id} />
    </Suspense>
  );
}
