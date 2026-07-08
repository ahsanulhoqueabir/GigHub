"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  IconEye,
  IconCalendar,
  IconMapPin,
  IconClock,
  IconArrowLeft,
  IconSend,
  IconPaperclip,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { DetailsSkeleton } from "@/components/shared/details-skeleton";
import { formatDateInTimezone } from "@/lib/date.utils";
import { useAuthStore, selectIsAuthenticated } from "@/store/auth.store";
import { useJobsStore } from "@/store/jobs.store";

const jobTypeColors: Record<string, string> = {
  FULLTIME: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  PARTTIME:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  CONTRACT:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  TUTION:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  VOLUNTEER: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  OTHER: "bg-zinc-100 text-zinc-700 dark:bg-zinc-900/30 dark:text-zinc-400",
};

export default function JobDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const job = useJobsStore((s) => s.currentJob);
  const loading = useJobsStore((s) => s.isLoadingDetail);
  const fetchJobBySlug = useJobsStore((s) => s.fetchJobBySlug);

  const user = useAuthStore((s) => s.user);
  const isAuthenticated = selectIsAuthenticated(useAuthStore.getState());

  useEffect(() => {
    if (slug) fetchJobBySlug(slug);
  }, [slug, fetchJobBySlug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <DetailsSkeleton />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <p className="text-muted-foreground">Job not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/jobs">Back to Jobs</Link>
        </Button>
      </div>
    );
  }

  const typeColor = jobTypeColors[job.type] ?? jobTypeColors.OTHER;
  const isOwner = user?.id === job.owner.id;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Back Button */}
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link href="/jobs">
          <IconArrowLeft className="mr-1 size-4" />
          Back to Jobs
        </Link>
      </Button>

      {/* Header */}
      <div className="space-y-4">
        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={typeColor}>{job.type}</Badge>
          {job.category && (
            <Badge variant="secondary">{job.category.name}</Badge>
          )}
          <Badge
            variant="outline"
            className="text-green-600 dark:text-green-400"
          >
            {job.status}
          </Badge>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
          {job.title}
        </h1>

        {/* Meta Row */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Avatar size="sm">
              <AvatarImage
                src={job.owner.avatar ?? undefined}
                alt={job.owner.name}
              />
              <AvatarFallback>{job.owner.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>
              {job.owner.name}
              {job.owner.verified && (
                <span className="ml-1 text-primary">✓</span>
              )}
            </span>
          </div>
          <span className="flex items-center gap-1">
            <IconCalendar className="size-3.5" />
            {formatDateInTimezone(job.created_at)}
          </span>
          <span className="flex items-center gap-1">
            <IconEye className="size-3.5" />
            {job.views} views
          </span>
        </div>

        {/* Budget & Details Row */}
        <div className="flex flex-wrap gap-4">
          {job.budget && (
            <div className="rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
              {job.budget}
            </div>
          )}
          {job.location && (
            <div className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-sm text-muted-foreground">
              <IconMapPin className="size-4" />
              {job.location}
            </div>
          )}
          {job.deadline && (
            <div className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-sm text-muted-foreground">
              <IconClock className="size-4" />
              Apply by: {formatDateInTimezone(job.deadline)}
            </div>
          )}
        </div>
      </div>

      <Separator className="my-6" />

      {/* Description */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-foreground">
          Description
        </h2>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {job.description}
        </p>
      </div>

      {/* Required Skills */}
      {job.required_skills && job.required_skills.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Required Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {job.required_skills.map((skill) => (
              <Badge key={skill} variant="outline" className="text-sm py-1">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Attachments */}
      {job.attachments && job.attachments.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Attachments
          </h2>
          <div className="space-y-2">
            {job.attachments.map((url, idx) => (
              <a
                key={idx}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground transition-colors hover:bg-muted"
              >
                <IconPaperclip className="size-4 shrink-0" />
                <span className="truncate">{url.split("/").pop() || url}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {job.tags && job.tags.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2 text-sm font-semibold text-foreground">Tags</h2>
          <div className="flex flex-wrap gap-1.5">
            {job.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Separator className="my-6" />

      {/* CTA */}
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">
            Interested in this job?
          </p>
          <p className="text-sm text-muted-foreground">
            Submit your proposal to get started.
          </p>
        </div>
        {!isOwner ? (
          <Button asChild size="lg" disabled={!isAuthenticated}>
            <Link href={isAuthenticated ? `/jobs/${job.slug}/apply` : "/login"}>
              <IconSend className="mr-1.5 size-4" />
              {isAuthenticated ? "Apply for this Job" : "Sign in to Apply"}
            </Link>
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">
            You cannot apply to your own job.
          </p>
        )}
      </div>

      {/* Owner Info */}
      <div className="mt-8 rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          About the Job Poster
        </h2>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage
              src={job.owner.avatar ?? undefined}
              alt={job.owner.name}
            />
            <AvatarFallback>{job.owner.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-foreground">
              {job.owner.name}
            </p>
            <p className="text-xs text-muted-foreground">
              @{job.owner.username}
            </p>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Member since {formatDateInTimezone(job.owner.created_at)}
        </p>
      </div>
    </div>
  );
}
