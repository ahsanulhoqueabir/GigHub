"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getJobTypeBadgeColors,
  getStatusBadgeColors,
} from "@/lib/shared/badge.utils";
import type { ManageJobProposalItem } from "@/store/job-proposals.store";
import {
  IconCalendar,
  IconCurrencyDollar,
  IconEye,
  IconTrash,
} from "@tabler/icons-react";

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
