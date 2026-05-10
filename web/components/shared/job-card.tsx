"use client";

import Link from "next/link";
import { Job } from "@/types/db/job.types";
import { selectJobBudgetDisplay, selectJobTypeLabel } from "@/store/job.store";
import {
  IconMapPin,
  IconBriefcase,
  IconUsers,
  IconClock,
} from "@tabler/icons-react";

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const budgetDisplay = selectJobBudgetDisplay(job);
  const jobTypeLabel = selectJobTypeLabel(job.job_type);

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

  const timeAgo = getTimeAgo(job.created_at);

  return (
    <Link
      href={`/jobs/${job.slug}`}
      className="group block rounded-xl border border-border bg-card p-4 sm:p-5 transition-all duration-200 hover:shadow-md hover:border-primary/20"
    >
      {/* Top row: poster + time */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {posterAvatar ? (
            <img
              src={posterAvatar}
              alt={posterName}
              className="size-6 rounded-full object-cover"
            />
          ) : (
            <div className="size-6 rounded-full bg-muted-foreground/20 flex items-center justify-center text-xs font-medium text-muted-foreground">
              {posterName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-sm text-muted-foreground">{posterName}</span>
        </div>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <IconClock size={12} />
          {timeAgo}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-foreground line-clamp-2 leading-snug mb-2 group-hover:text-primary transition-colors">
        {job.title}
      </h3>

      {/* Description snippet */}
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
        {job.description}
      </p>

      {/* Badges row */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {/* Job type badge */}
        <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">
          <IconBriefcase size={12} />
          {jobTypeLabel}
        </span>

        {/* Category badge */}
        {categoryName && (
          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {categoryName}
          </span>
        )}

        {/* Proposals count */}
        {job.total_proposals > 0 && (
          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            <IconUsers size={12} />
            {job.total_proposals} proposal{job.total_proposals > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Skills */}
      {job.required_skills && job.required_skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {job.required_skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="inline-block rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
            >
              {skill}
            </span>
          ))}
          {job.required_skills.length > 4 && (
            <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
              +{job.required_skills.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-border my-2" />

      {/* Footer: budget */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Budget</span>
        <span className="text-sm font-semibold text-foreground">
          {budgetDisplay}
        </span>
      </div>
    </Link>
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
