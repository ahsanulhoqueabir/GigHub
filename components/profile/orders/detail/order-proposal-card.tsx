import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateInTimezone } from "@/lib/date.utils";
import type { OrderProposalInfo } from "@/store/orders.store";
import {
  IconFileDescription,
  IconPaperclip,
  IconUser,
} from "@tabler/icons-react";
import Image from "next/image";
import { SectionLabel } from "./order-section-label";

interface OrderProposalCardProps {
  proposal: OrderProposalInfo;
}

export function OrderProposalCard({ proposal }: OrderProposalCardProps) {
  const statusColor: Record<string, string> = {
    PENDING:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    APPROVED:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    DRAFT: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    DECLINED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10">
              <IconFileDescription className="size-4 text-primary" />
            </div>
            Applicant Proposal
          </CardTitle>
          <Badge
            variant="outline"
            className={`text-xs font-medium ${
              statusColor[proposal.status] ?? ""
            }`}
          >
            {proposal.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Applicant info */}
        {proposal.applicant && (
          <div>
            <SectionLabel>Applicant</SectionLabel>
            <div className="flex items-center gap-2 mt-1">
              <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {proposal.applicant.avatar ? (
                  <Image
                    src={proposal.applicant.avatar}
                    alt={proposal.applicant.name}
                    className="size-full object-cover"
                    height={16}
                    width={16}
                  />
                ) : (
                  <IconUser className="size-3.5 text-primary" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">{proposal.applicant.name}</p>
                <p className="text-xs text-muted-foreground">
                  @{proposal.applicant.username}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submitted at */}
        <div>
          <SectionLabel>Submitted</SectionLabel>
          <p className="text-sm text-muted-foreground mt-1">
            {formatDateInTimezone(proposal.created_at)}
          </p>
        </div>

        {/* Description */}
        {proposal.description && (
          <div>
            <SectionLabel>Cover Letter / Description</SectionLabel>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap mt-1">
              {proposal.description}
            </p>
          </div>
        )}

        {/* Attachments */}
        {proposal.attachments && proposal.attachments.length > 0 && (
          <div>
            <SectionLabel>
              <span className="flex items-center gap-1">
                <IconPaperclip className="size-3" />
                Attachments ({proposal.attachments.length})
              </span>
            </SectionLabel>
            <div className="flex flex-wrap gap-2 mt-1">
              {proposal.attachments.map((url, idx) => {
                const fileName = url.split("/").pop() ?? `file-${idx + 1}`;
                return (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    asChild
                  >
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      <IconPaperclip className="size-3 mr-1" />
                      {fileName.length > 30
                        ? `${fileName.slice(0, 27)}...`
                        : fileName}
                    </a>
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
