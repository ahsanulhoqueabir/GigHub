"use client";

import { ListPage } from "@/components/list-page";
import type { ColumnConfig } from "@/components/list-page/types";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatShortDate } from "@/lib/date.utils";
import type { IncomingProposalItem } from "@/store/job-proposals.store";
import { useJobProposalsStore } from "@/store/job-proposals.store";
import { IconArrowRight, IconUser } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect } from "react";

function IncomingProposalsContent() {
  const router = useRouter();
  const {
    incomingProposals,
    isLoadingIncoming,
    incomingError,
    incomingPagination,
    fetchIncomingProposals,
  } = useJobProposalsStore();

  // Load on mount
  useEffect(() => {
    fetchIncomingProposals();
  }, [fetchIncomingProposals]);

  const handleRefresh = useCallback(() => {
    fetchIncomingProposals();
  }, [fetchIncomingProposals]);

  const handleViewDetails = useCallback(
    (id: string) => {
      router.push(`/profile/incoming-proposals/${id}`);
    },
    [router],
  );

  // Table columns
  const columns: ColumnConfig<IncomingProposalItem>[] = [
    {
      key: "job",
      label: "Job Title",
      width: 25,
      render: (_, item) => (
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-sm line-clamp-1">
            {(item.job as { title?: string })?.title || "N/A"}
          </span>
          {(item.job as { budget?: string })?.budget && (
            <span className="text-xs text-muted-foreground">
              Budget: {(item.job as { budget?: string })?.budget}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "applicant",
      label: "Applicant",
      width: 20,
      render: (_, item) => {
        const applicant = item.applicant as
          | { id?: string; name?: string; username?: string; avatar?: string }
          | undefined;
        return (
          <div className="flex items-center gap-2.5">
            <Avatar className="size-7 shrink-0">
              <AvatarImage
                src={applicant?.avatar || undefined}
                alt={applicant?.name}
              />
              <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
                {applicant?.name?.slice(0, 2).toUpperCase() || (
                  <IconUser size={12} />
                )}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">
                {applicant?.name || "N/A"}
              </p>
              {applicant?.username && (
                <p className="text-xs text-muted-foreground truncate">
                  @{applicant.username}
                </p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      width: 12,
      render: (val) => {
        return <StatusBadge status={val as string} />;
      },
    },
    {
      key: "description",
      label: "Proposal",
      width: 25,
      render: (val) => (
        <span className="text-xs text-muted-foreground line-clamp-2 max-w-xs">
          {String(val || "—")}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Applied On",
      width: 12,
      sortable: true,
      render: (val) => (
        <span className="text-xs text-muted-foreground">
          {formatShortDate(val as string)}
        </span>
      ),
    },
    {
      key: "updated_at",
      label: "Updated",
      width: 6,
      render: (val) => (
        <span className="text-xs text-muted-foreground">
          {formatShortDate(val as string)}
        </span>
      ),
    },
  ];

  // Mobile card render
  const renderCard = (item: IncomingProposalItem) => {
    const applicant = item.applicant as
      | { name?: string; username?: string; avatar?: string }
      | undefined;

    return (
      <div className="p-4 space-y-3 border rounded-xl bg-card">
        {/* Top row: job title + status */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm line-clamp-2 leading-snug">
              {(item.job as { title?: string })?.title || "N/A"}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              by {applicant?.name || "Unknown"}
            </p>
          </div>
          <StatusBadge status={item.status} />
        </div>

        {/* Description preview */}
        {item.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Applied date */}
        <p className="text-xs text-muted-foreground">
          Applied {formatShortDate(item.created_at)}
        </p>

        {/* Action button */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => handleViewDetails(item.id)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent text-accent-foreground h-8 text-xs font-medium hover:bg-accent/80 transition-colors"
          >
            <IconArrowRight size={14} />
            View Details
          </button>
        </div>
      </div>
    );
  };

  const listConfig = {
    title: "Incoming Proposals",
    description: "Review and manage proposals submitted for your job listings.",
    columns,
    onRefresh: handleRefresh,
    actions: {
      default: [] as ("edit" | "delete")[],
      additional: [
        {
          label: "View Details",
          icon: IconArrowRight,
          onClick: (item: IncomingProposalItem) => handleViewDetails(item.id),
        },
      ],
    },
    renderCard,
    search: {
      fields: ["description" as keyof IncomingProposalItem],
      placeholder: "Search proposals…",
    },
  };

  return (
    <div className="h-full">
      <ListPage
        data={incomingProposals}
        loading={isLoadingIncoming}
        error={incomingError}
        config={listConfig}
        totalItems={incomingPagination.total}
        currentPage={incomingPagination.currentPage}
        pageSize={incomingPagination.pageSize}
        onPageChange={(page) =>
          fetchIncomingProposals({}, page, incomingPagination.pageSize)
        }
        onPageSizeChange={(size) =>
          fetchIncomingProposals({}, incomingPagination.currentPage, size)
        }
      />
    </div>
  );
}

export default function IncomingProposalsPage() {
  return (
    <Suspense fallback={<PageSkeleton variant="list" rows={5} asCards />}>
      <IncomingProposalsContent />
    </Suspense>
  );
}
