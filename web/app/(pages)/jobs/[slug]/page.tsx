"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  IconArrowLeft,
  IconBriefcase,
  IconClock,
  IconUsers,
  IconLoader2,
  IconUser,
  IconMapPin,
  IconCalendar,
  IconCurrencyDollar,
} from "@tabler/icons-react";
import {
  useJobsStore,
  selectJobBudgetDisplay,
  selectJobTypeLabel,
} from "@/store/job.store";
import { Button } from "@/components/ui/button";
import { LoginRequired } from "@/components/shared/login-required";

export default function JobDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const selectedJob = useJobsStore((s) => s.selectedJob);
  const isFetchingDetail = useJobsStore((s) => s.isFetchingDetail);
  const error = useJobsStore((s) => s.error);
  const fetchJobBySlug = useJobsStore((s) => s.fetchJobBySlug);
  const clearSelectedJob = useJobsStore((s) => s.clearSelectedJob);
  const clearError = useJobsStore((s) => s.clearError);

  useEffect(() => {
    if (slug) {
      fetchJobBySlug(slug);
    }
    return () => {
      clearSelectedJob();
      clearError();
    };
  }, [slug, fetchJobBySlug, clearSelectedJob, clearError]);

  // ── Loading state ──────────────────────────────────────────────
  if (isFetchingDetail) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <IconLoader2 size={36} className="animate-spin" />
          <p className="text-sm">Loading job details...</p>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────
  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <IconBriefcase size={48} className="text-muted-foreground/40 mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Job not found
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-md">{error}</p>
          <Button asChild>
            <Link href="/jobs">Browse Jobs</Link>
          </Button>
        </div>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────
  if (!selectedJob) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <IconLoader2 size={28} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ── Derived data ───────────────────────────────────────────────
  const job = selectedJob;

  const posterName =
    typeof job.poster === "object" && job.poster !== null
      ? (job.poster as { name?: string; username?: string }).name ||
        (job.poster as { name?: string; username?: string }).username ||
        "Unknown"
      : "Unknown";

  const posterAvatar =
    typeof job.poster === "object" && job.poster !== null
      ? (job.poster as { avatar?: string }).avatar
      : null;

  const categoryName =
    typeof job.category === "object" && job.category !== null
      ? (job.category as { name?: string }).name
      : "";

  const budgetDisplay = selectJobBudgetDisplay(job);
  const jobTypeLabel = selectJobTypeLabel(job.job_type);

  const timeAgo = getTimeAgo(job.created_at);
  const deadlineDate = job.deadline ? new Date(job.deadline) : null;
  const isDeadlineSoon =
    deadlineDate &&
    deadlineDate.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

  return (
    <div className="min-h-screen">
      {/* ── Back navigation ──────────────────────────────────── */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <IconArrowLeft size={16} />
            Back to Jobs
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* ═══ Left Column — Main Content ════════════════════ */}
          <div className="lg:col-span-3 space-y-6">
            {/* ── Job Header ─────────────────────────────────── */}
            <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">
                  <IconBriefcase size={12} />
                  {jobTypeLabel}
                </span>
                {categoryName && (
                  <span className="rounded-md bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                    {categoryName}
                  </span>
                )}
                <span
                  className={`rounded-md px-2.5 py-0.5 text-xs font-medium capitalize ${
                    job.status === "open"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : job.status === "in_progress"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {job.status.replace("_", " ")}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground leading-tight">
                {job.title}
              </h1>

              {/* Poster row */}
              <div className="flex items-center gap-3 mt-4 pb-4 border-b border-border">
                {posterAvatar ? (
                  <img
                    src={posterAvatar}
                    alt={posterName}
                    className="size-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="size-10 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                    <IconUser size={20} className="text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {posterName}
                  </p>
                  <p className="text-xs text-muted-foreground">Job Poster</p>
                </div>

                <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                  <IconClock size={14} />
                  {timeAgo}
                </span>
              </div>

              {/* Description */}
              <div className="mt-5">
                <h2 className="text-base font-semibold text-foreground mb-2">
                  Description
                </h2>
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {job.description}
                </div>
              </div>

              {/* Required Skills */}
              {job.required_skills && job.required_skills.length > 0 && (
                <div className="mt-5">
                  <h2 className="text-sm font-semibold text-foreground mb-2">
                    Required Skills
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {job.required_skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachments */}
              {job.attachments && job.attachments.length > 0 && (
                <div className="mt-5">
                  <h2 className="text-sm font-semibold text-foreground mb-2">
                    Attachments
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {job.attachments.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Attachment {i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ═══ Right Column — Sidebar ════════════════════════ */}
          <div className="lg:col-span-2 space-y-6">
            {/* ── Apply CTA ────────────────────────────────────── */}
            <div className="rounded-xl border border-border bg-card p-5">
              <LoginRequired message="Please log in to apply for this job.">
                <Button className="w-full" size="lg">
                  Apply Now
                </Button>
              </LoginRequired>
              <p className="text-xs text-muted-foreground text-center mt-2">
                {job.total_proposals > 0
                  ? `${job.total_proposals} proposal${job.total_proposals > 1 ? "s" : ""} already submitted`
                  : "Be the first to apply"}
              </p>
            </div>

            {/* ── Job Details ──────────────────────────────────── */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-sm font-semibold text-foreground mb-3">
                Job Details
              </h2>
              <div className="space-y-3">
                {/* Budget */}
                <div className="flex items-start gap-3">
                  <IconCurrencyDollar
                    size={18}
                    className="mt-0.5 shrink-0 text-muted-foreground"
                  />
                  <div>
                    <p className="text-xs text-muted-foreground">Budget</p>
                    <p className="text-sm font-semibold text-foreground">
                      {budgetDisplay}
                    </p>
                  </div>
                </div>

                {/* Job Type */}
                <div className="flex items-start gap-3">
                  <IconBriefcase
                    size={18}
                    className="mt-0.5 shrink-0 text-muted-foreground"
                  />
                  <div>
                    <p className="text-xs text-muted-foreground">Job Type</p>
                    <p className="text-sm text-foreground capitalize">
                      {jobTypeLabel}
                    </p>
                  </div>
                </div>

                {/* Proposals */}
                <div className="flex items-start gap-3">
                  <IconUsers
                    size={18}
                    className="mt-0.5 shrink-0 text-muted-foreground"
                  />
                  <div>
                    <p className="text-xs text-muted-foreground">Proposals</p>
                    <p className="text-sm text-foreground">
                      {job.total_proposals}
                    </p>
                  </div>
                </div>

                {/* Posted */}
                <div className="flex items-start gap-3">
                  <IconCalendar
                    size={18}
                    className="mt-0.5 shrink-0 text-muted-foreground"
                  />
                  <div>
                    <p className="text-xs text-muted-foreground">Posted</p>
                    <p className="text-sm text-foreground">
                      {formatDate(job.created_at)}
                    </p>
                  </div>
                </div>

                {/* Deadline */}
                {deadlineDate && (
                  <div className="flex items-start gap-3">
                    <IconClock
                      size={18}
                      className={`mt-0.5 shrink-0 ${
                        isDeadlineSoon
                          ? "text-red-500"
                          : "text-muted-foreground"
                      }`}
                    />
                    <div>
                      <p className="text-xs text-muted-foreground">Deadline</p>
                      <p
                        className={`text-sm font-medium ${
                          isDeadlineSoon ? "text-red-500" : "text-foreground"
                        }`}
                      >
                        {formatDate(deadlineDate.toISOString())}
                        {isDeadlineSoon && " (Soon)"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function getTimeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
