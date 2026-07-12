"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCurrency } from "@/hooks/use-currency";
import { formatDateInTimezone } from "@/lib/date.utils";
import { getJobTypeBadgeColors } from "@/lib/shared/badge.utils";
import { cn } from "@/lib/utils";
import { JobListItem } from "@/types/db/job.types";
import {
  IconClock,
  IconEye,
  IconMapPin,
  IconSchool,
} from "@tabler/icons-react";
import Link from "next/link";

interface JobCardProps {
  job: JobListItem;
}

export function JobCard({ job }: JobCardProps) {
  if (job.type === "TUTION") {
    return <TuitionJobCard job={job} />;
  }
  return <StandardJobCard job={job} />;
}

export function TuitionJobCard({ job }: JobCardProps) {
  const typeColors = getJobTypeBadgeColors(job.type);
  const { symbol } = useCurrency();

  return (
    <Link href={`/jobs/${job.slug}`} className="block group h-full">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border border-border/80 hover:border-amber-500/50 bg-linear-to-br from-background to-accent/5 h-full flex flex-col">
        <div className="flex flex-col sm:flex-row min-h-42.5 flex-1">
          {/* Main Info Section (Left/Top) */}
          <div className="flex-1 p-5 flex flex-col justify-between space-y-3 min-w-0">
            <div className="space-y-2">
              {/* Category & Badge */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wide uppercase text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  <IconSchool className="size-3" />
                  {typeColors.label || "Tuition"}
                </span>
                {job.category && (
                  <span className="text-[10px] text-muted-foreground font-medium">
                    in {job.category.name}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                {job.title}
              </h3>

              {/* Description */}
              <p className="line-clamp-2 text-xs text-muted-foreground/90 leading-normal">
                {job.description}
              </p>
            </div>

            {/* Skills & Location */}
            <div className="space-y-2 pt-1">
              {/* Skills */}
              {job.required_skills && job.required_skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {job.required_skills.slice(0, 3).map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="text-[10px] bg-amber-500/5 text-amber-700 dark:text-amber-300 border-amber-500/10 hover:bg-amber-500/10 transition-colors"
                    >
                      {skill}
                    </Badge>
                  ))}
                  {job.required_skills.length > 3 && (
                    <span className="text-[10px] text-muted-foreground self-center px-1 font-medium">
                      +{job.required_skills.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* Owner and Location row */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
                <div className="flex items-center gap-1.5">
                  <Avatar size="sm" className="size-5">
                    <AvatarImage
                      src={job.owner.avatar ?? undefined}
                      alt={job.owner.name}
                    />
                    <AvatarFallback className="text-[9px]">
                      {job.owner.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-muted-foreground truncate max-w-25 font-medium">
                    {job.owner.name}
                  </span>
                </div>
                {job.location && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <IconMapPin className="size-3 text-amber-500 shrink-0" />
                    <span className="truncate max-w-30">{job.location}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Pricing & Time Sidebar (Right/Bottom) */}
          <div className="sm:w-36 w-full border-t sm:border-t-0 sm:border-l border-dashed border-border/60 bg-amber-500/2 dark:bg-amber-500/4 p-5 flex sm:flex-col items-start sm:justify-between justify-between gap-3 shrink-0">
            {/* Salary Container */}
            <div className="space-y-1 sm:w-full">
              <span className="text-[9px] font-bold tracking-wider text-muted-foreground block uppercase">
                Salary
              </span>
              {job.budget ? (
                <div className="flex items-baseline gap-0.5">
                  <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                    {symbol} {job.budget}
                  </span>
                </div>
              ) : (
                <span className="text-sm font-semibold text-muted-foreground">
                  Negotiable
                </span>
              )}
            </div>

            {/* Deadline & Views Container */}
            <div className="space-y-1.5 sm:w-full text-right sm:text-left flex flex-col sm:items-start items-end">
              {job.deadline && (
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                  <IconClock className="size-3 text-amber-500/80" />
                  <span>{formatDateInTimezone(job.deadline)}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground/80">
                <IconEye className="size-3" />
                <span>{job.views} views</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function StandardJobCard({ job }: JobCardProps) {
  const typeColors = getJobTypeBadgeColors(job.type);
  const { symbol } = useCurrency();

  return (
    <Link href={`/jobs/${job.slug}`} className="block group">
      <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 border border-border/80 hover:border-primary/45 flex flex-col bg-card">
        <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2.5">
            {/* Header: Badge & Budget */}
            <div className="flex items-start justify-between gap-2">
              <Badge
                className={cn(
                  "text-[10px] font-semibold tracking-wide px-2 py-0.5 border shadow-none",
                  typeColors.bg,
                  typeColors.text,
                  typeColors.ring,
                )}
              >
                {typeColors.label || job.type}
              </Badge>
              {job.budget && (
                <span className="shrink-0 text-sm font-semibold text-foreground bg-accent/20 px-2 py-0.5 rounded border border-border/30">
                  {symbol} {job.budget}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
              {job.title}
            </h3>

            {/* Description */}
            <p className="line-clamp-2 text-xs text-muted-foreground/90 leading-normal">
              {job.description}
            </p>

            {/* Skills */}
            {job.required_skills && job.required_skills.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {job.required_skills.slice(0, 3).map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="text-[10px] font-normal border-border/60"
                  >
                    {skill}
                  </Badge>
                ))}
                {job.required_skills.length > 3 && (
                  <span className="text-[10px] text-muted-foreground self-center px-1 font-medium">
                    +{job.required_skills.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Footer Metadata */}
          <div className="pt-3 border-t border-border/40 flex flex-col gap-2 text-xs text-muted-foreground">
            {/* Owner info */}
            <div className="flex items-center gap-1.5">
              <Avatar size="sm" className="size-5">
                <AvatarImage
                  src={job.owner.avatar ?? undefined}
                  alt={job.owner.name}
                />
                <AvatarFallback className="text-[9px]">
                  {job.owner.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-foreground truncate max-w-37.5">
                {job.owner.name}
              </span>
            </div>

            {/* Location & Deadline & Views */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-muted-foreground">
              {job.location && (
                <span className="flex items-center gap-1 shrink-0">
                  <IconMapPin className="size-3 text-muted-foreground/75" />
                  <span className="truncate max-w-30">{job.location}</span>
                </span>
              )}

              {job.deadline && (
                <span className="flex items-center gap-1 shrink-0">
                  <IconClock className="size-3 text-muted-foreground/75" />
                  <span>{formatDateInTimezone(job.deadline)}</span>
                </span>
              )}

              <span className="flex items-center gap-1 ml-auto shrink-0 text-muted-foreground/70">
                <IconEye className="size-3" />
                <span>{job.views}</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
