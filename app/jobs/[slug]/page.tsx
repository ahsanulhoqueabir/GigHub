"use client";

import { DetailsSkeleton } from "@/components/shared/details-skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BackButton } from "@/components/ui/back-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDateInTimezone } from "@/lib/date.utils";
import { getJobTypeBadgeColors } from "@/lib/shared/badge.utils";
import { selectIsAuthenticated, useAuthStore } from "@/store/auth.store";
import { useJobsStore } from "@/store/jobs.store";
import {
  IconBriefcase,
  IconCalendar,
  IconClock,
  IconEye,
  IconMapPin,
  IconPaperclip,
  IconSend,
} from "@tabler/icons-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";

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
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <DetailsSkeleton />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <p className="text-muted-foreground">Job not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/jobs">Back to Jobs</Link>
        </Button>
      </div>
    );
  }

  const typeColors = getJobTypeBadgeColors(job.type);
  const isOwner = user?.id === job.owner.id;

  return (
    <div className="">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* Left Column — Details */}
        <div className="space-y-6 lg:col-span-3">
          {/* Back Button + Title */}
          <div className="flex items-start gap-3">
            <BackButton href="/jobs" />
            <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
              {job.title}
            </h1>
          </div>

          {/* Badges Row */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={typeColors.bg}>{job.type}</Badge>
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

          <Separator />

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
            <div>
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
            <div>
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
                    <span className="truncate">
                      {url.split("/").pop() || url}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {job.tags && job.tags.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-semibold text-foreground">
                Tags
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {job.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column — Details Sidebar + CTA */}
        <div className="space-y-6 lg:col-span-2">
          {/* Job Details Card */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
              <IconBriefcase className="size-5" />
              Job Details
            </h2>

            <div className="space-y-4">
              {/* Type */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Type</span>
                <Badge className={typeColors.bg}>{job.type}</Badge>
              </div>

              {/* Budget */}
              {job.budget && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Budget</span>
                  <span className="text-sm font-semibold text-foreground">
                    {job.budget}
                  </span>
                </div>
              )}

              {/* Location */}
              {job.location && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Location
                  </span>
                  <span className="flex items-center gap-1 text-sm text-foreground">
                    <IconMapPin className="size-3.5" />
                    {job.location}
                  </span>
                </div>
              )}

              {/* Apply Deadline */}
              {job.deadline && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Apply by
                  </span>
                  <span className="flex items-center gap-1 text-sm text-foreground">
                    <IconClock className="size-3.5" />
                    {formatDateInTimezone(job.deadline)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* CTA */}
          {!isOwner && (
            <Button
              asChild
              className="w-full"
              size="lg"
              disabled={!isAuthenticated}
            >
              <Link
                href={isAuthenticated ? `/jobs/${job.slug}/apply` : "/login"}
              >
                <IconSend className="mr-1.5 size-4" />
                {isAuthenticated ? "Apply for this Job" : "Sign in to Apply"}
              </Link>
            </Button>
          )}
          {!isAuthenticated && (
            <p className="text-center text-xs text-muted-foreground">
              You need to sign in to apply for this job.
            </p>
          )}
          {isOwner && (
            <p className="text-center text-xs text-muted-foreground">
              You cannot apply to your own job.
            </p>
          )}

          {/* Owner Info */}
          <div className="rounded-xl border border-border bg-card p-4">
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
      </div>
    </div>
  );
}
