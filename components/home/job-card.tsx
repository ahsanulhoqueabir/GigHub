"use client";

import Link from "next/link";
import { IconEye, IconMapPin, IconClock } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateInTimezone } from "@/lib/date.utils";
import { getJobTypeBadgeColors } from "@/lib/shared/badge.utils";
import { JobListItem } from "@/types/db/job.types";

interface JobCardProps {
  job: JobListItem;
}

export function JobCard({ job }: JobCardProps) {
  const typeColors = getJobTypeBadgeColors(job.type);

  return (
    <Link href={`/jobs/${job.slug}`} className="block group">
      <Card
        className={cn(
          "transition-shadow hover:shadow-md",
          job.type === "TUTION" ? "border border-primary" : "",
        )}
      >
        <CardContent className="space-y-3 ">
          {/* Top: Type Badge + Budget */}
          <div className="flex items-start justify-between gap-2">
            <Badge
              className={cn(
                "text-[10px] font-medium",
                typeColors.bg,
                typeColors.text,
                typeColors.ring,
              )}
            >
              {job.type}
            </Badge>
            {job.budget && (
              <span className="shrink-0 text-sm font-semibold text-foreground">
                {job.budget}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="line-clamp-2 text-sm font-medium text-foreground group-hover:text-primary transition-colors">
            {job.title}
          </h3>

          {/* Description */}
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {job.description}
          </p>

          {/* Skills */}
          {job.required_skills && job.required_skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {job.required_skills.slice(0, 4).map((skill) => (
                <Badge key={skill} variant="outline" className="text-[10px]">
                  {skill}
                </Badge>
              ))}
              {job.required_skills.length > 4 && (
                <span className="text-[10px] text-muted-foreground self-center">
                  +{job.required_skills.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Bottom Info */}
          <div className="grid grid-cols-2  gap-2">
            {/* Owner */}
            <div className="flex items-center gap-1.5">
              <Avatar size="sm">
                <AvatarImage
                  src={job.owner.avatar ?? undefined}
                  alt={job.owner.name}
                />
                <AvatarFallback>{job.owner.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="truncate max-w-25">{job.owner.name}</span>
            </div>

            {/* Location */}
            {job.location && (
              <span className="flex items-center gap-1">
                <IconMapPin className="size-3" />
                {job.location}
              </span>
            )}

            {/* Deadline */}
            {job.deadline && (
              <span className="flex items-center gap-1">
                <IconClock className="size-3" />
                {formatDateInTimezone(job.deadline)}
              </span>
            )}

            {/* Views */}
            <span className="flex items-center gap-1 ">
              <IconEye className="size-3" />
              {job.views}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
