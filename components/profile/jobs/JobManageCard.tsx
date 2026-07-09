"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getJobTypeBadgeColors,
  getStatusBadgeColors,
} from "@/lib/shared/badge.utils";
import type { JobListItem } from "@/types/db/job.types";
import {
  IconBriefcase,
  IconEdit,
  IconEye,
  IconTrash,
} from "@tabler/icons-react";

interface JobManageCardProps {
  job: JobListItem;
  onEdit?: (job: JobListItem) => void;
  onDelete?: (id: string) => void;
  onDetails?: (job: JobListItem) => void;
}

export function JobManageCard({
  job,
  onEdit,
  onDelete,
  onDetails,
}: JobManageCardProps) {
  const status = (job as JobListItem & { status?: string }).status || "ACTIVE";
  const statusColors = getStatusBadgeColors(status);
  const jobType = getJobTypeBadgeColors(job.type);

  return (
    <Card className="p-4">
      {/* Top row: icon + title + status */}
      <div className="flex items-start gap-3">
        {/* Icon placeholder */}
        <div className="shrink-0 w-10 h-10 rounded bg-muted/60 border border-border flex items-center justify-center text-muted-foreground">
          <IconBriefcase size={18} />
        </div>

        {/* Title + Category */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm line-clamp-2">{job.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {job.category?.name || "N/A"}
          </p>
        </div>

        {/* Status badge */}
        <Badge
          className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors.bg} ${statusColors.text} ${statusColors.ring}`}
        >
          {status}
        </Badge>
      </div>

      {/* Type + Budget + Views */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Badge
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${jobType.bg} ${jobType.text} ${jobType.ring}`}
          >
            {jobType.label}
          </Badge>
          {job.budget && (
            <span className="font-semibold text-foreground">{job.budget}</span>
          )}
        </div>
        <div className="text-muted-foreground">{job.views} views</div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-1">
        {onDetails && (
          <Button
            className="flex-1"
            variant="accent"
            size="sm"
            onClick={() => onDetails(job)}
          >
            <IconEye size={14} />
            Details
          </Button>
        )}
        {onEdit && (
          <Button
            className="flex-1"
            variant="refresh"
            size="sm"
            onClick={() => onEdit(job)}
          >
            <IconEdit size={14} />
            Edit
          </Button>
        )}
        {onDelete && (
          <Button
            className="flex-1"
            variant="destructive"
            size="sm"
            onClick={() => onDelete(job.id)}
          >
            <IconTrash size={14} />
            Delete
          </Button>
        )}
      </div>
    </Card>
  );
}
