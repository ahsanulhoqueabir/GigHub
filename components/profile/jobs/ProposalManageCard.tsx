"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getStatusBadgeColors } from "@/lib/shared/badge.utils";
import type { AppliedJobItem } from "@/store/job-proposals.store";
import {
  IconCalendar,
  IconEye,
  IconFileDescription,
  IconTrash,
} from "@tabler/icons-react";

interface AppliedJobCardProps {
  proposal: AppliedJobItem;
  onDelete?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

export function AppliedJobCard({
  proposal,
  onDelete,
  onViewDetails,
}: AppliedJobCardProps) {
  const statusColors = getStatusBadgeColors(proposal.status);

  return (
    <Card className="p-4 space-y-3">
      {/* Top row: title + proposal status */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm line-clamp-2 leading-snug">
            {proposal.job?.title || "N/A"}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            ID: {proposal.id.slice(0, 8)}…
          </p>
        </div>
        <Badge
          className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors.bg} ${statusColors.text} ${statusColors.ring}`}
        >
          {proposal.status}
        </Badge>
      </div>

      {/* Description preview */}
      {proposal.description && (
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <IconFileDescription className="size-3.5 mt-0.5 shrink-0" />
          <p className="line-clamp-2">{proposal.description}</p>
        </div>
      )}

      {/* Applied date */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <IconCalendar className="size-3.5 shrink-0" />
        <span>Applied {new Date(proposal.created_at).toLocaleDateString()}</span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-1">
        {onViewDetails && (
          <Button
            className="flex-1"
            variant="accent"
            size="sm"
            onClick={() => onViewDetails(proposal.id)}
          >
            <IconEye size={14} />
            View Details
          </Button>
        )}
        {onDelete && (
          <Button
            className="flex-1"
            variant="destructive"
            size="sm"
            onClick={() => onDelete(proposal.id)}
          >
            <IconTrash size={14} />
            Delete
          </Button>
        )}
      </div>
    </Card>
  );
}

// ─── Legacy card kept for backward compat ────────────────────────────────────

import type { ManageJobProposalItem } from "@/store/job-proposals.store";
import {
  getJobTypeBadgeColors,
} from "@/lib/shared/badge.utils";
import { IconCurrencyDollar } from "@tabler/icons-react";

interface ProposalManageCardProps {
  proposal: ManageJobProposalItem;
  onDelete?: (id: string) => void;
  onDetails?: (proposal: ManageJobProposalItem) => void;
}

export function ProposalManageCard({
  proposal,
  onDelete,
  onDetails,
}: ProposalManageCardProps) {
  const typeColors = proposal.job?.type
    ? getJobTypeBadgeColors(proposal.job.type)
    : null;
  const status = proposal.job?.status || "ACTIVE";
  const statusColors = getStatusBadgeColors(status);

  return (
    <Card className="p-4 space-y-3">
      {/* Top row: title + status */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm line-clamp-2">
            {proposal.job?.title || "N/A"}
          </h3>
          {typeColors && (
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 py-0 font-medium mt-1 ${typeColors.bg} ${typeColors.text} ${typeColors.ring}`}
            >
              {typeColors.label}
            </Badge>
          )}
        </div>
        <Badge
          className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors.bg} ${statusColors.text} ${statusColors.ring}`}
        >
          {status}
        </Badge>
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground line-clamp-2">
        {proposal.description}
      </p>

      {/* Budget + Date */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        {proposal.job?.budget && (
          <span className="flex items-center gap-1 font-semibold text-foreground">
            <IconCurrencyDollar className="size-3.5" />
            {proposal.job.budget}
          </span>
        )}
        <span className="flex items-center gap-1">
          <IconCalendar className="size-3.5" />
          {new Date(proposal.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-1">
        {onDetails && (
          <Button
            className="flex-1"
            variant="accent"
            size="sm"
            onClick={() => onDetails(proposal)}
          >
            <IconEye size={14} />
            View Job
          </Button>
        )}
        {onDelete && (
          <Button
            className="flex-1"
            variant="destructive"
            size="sm"
            onClick={() => onDelete(proposal.id)}
          >
            <IconTrash size={14} />
            Delete
          </Button>
        )}
      </div>
    </Card>
  );
}
