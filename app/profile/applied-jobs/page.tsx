"use client";

import { ListPage } from "@/components/list-page";
import type { ColumnConfig } from "@/components/list-page/types";
import { ProposalManageCard } from "@/components/profile/jobs/ProposalManageCard";
import { useDeleteConfirm } from "@/components/shared/delete-confirm-dialog";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/hooks/use-currency";
import { useReturnTo } from "@/hooks/use-return-to";
import {
  getJobTypeBadgeColors,
  getStatusBadgeColors,
} from "@/lib/shared/badge.utils";
import type { ManageJobProposalItem } from "@/store/job-proposals.store";
import { useJobProposalsStore } from "@/store/job-proposals.store";
import { IconEye } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect } from "react";

function ManageAppliedJobsContent() {
  const router = useRouter();
  const { withReturnTo } = useReturnTo();
  const { confirmDelete, deleteDialog } = useDeleteConfirm();
  const { symbol } = useCurrency();
  const {
    manageProposals,
    isLoadingManage,
    manageError,
    managePagination,
    fetchManageProposals,
    deleteProposal,
  } = useJobProposalsStore();

  // Load proposals on mount
  useEffect(() => {
    fetchManageProposals();
  }, [fetchManageProposals]);

  const handleRefresh = useCallback(() => {
    fetchManageProposals();
  }, [fetchManageProposals]);

  const handleDelete = useCallback(
    async (id: string) => {
      const item = manageProposals.find((p) => p.id === id);
      const confirmed = await confirmDelete(
        item?.job?.title || "this proposal",
      );
      if (!confirmed) return;
      try {
        await deleteProposal(id);
        fetchManageProposals();
      } catch (err) {
        console.error(err);
      }
    },
    [manageProposals, confirmDelete, deleteProposal, fetchManageProposals],
  );

  // Listing Columns
  const columns: ColumnConfig<ManageJobProposalItem>[] = [
    {
      key: "job" as keyof ManageJobProposalItem,
      label: "Job Title",
      width: 30,
      render: (_, item) => {
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-sm line-clamp-1">
              {item.job?.title || "N/A"}
            </span>
          </div>
        );
      },
    },
    {
      key: "type" as keyof ManageJobProposalItem,
      label: "Type",
      width: 10,
      render: (_, item) => {
        const typeColors = item.job?.type
          ? getJobTypeBadgeColors(item.job.type)
          : null;
        const status = item.job?.type || "PENDING";
        return (
          <Badge
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColors?.bg || "bg-gray-100"} ${typeColors?.text || "text-gray-800"} ${typeColors?.ring || "ring-gray-300"}`}
          >
            {status}
          </Badge>
        );
      },
    },
    {
      key: "job" as keyof ManageJobProposalItem,
      label: "Budget",
      width: 12,
      render: (_, item) => (
        <span className="text-xs font-semibold">
          {item.job?.budget ? `${symbol} ${item.job.budget}` : "N/A"}
        </span>
      ),
    },
    {
      key: "job" as keyof ManageJobProposalItem,
      label: "Job Status",
      width: 10,
      render: (_, item) => {
        const status = item.job?.status || "ACTIVE";
        const colors = getStatusBadgeColors(status);
        return (
          <Badge
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} ${colors.ring}`}
          >
            {status}
          </Badge>
        );
      },
    },
    {
      key: "created_at",
      label: "Applied",
      width: 12,
      render: (val) => (
        <span className="text-xs text-muted-foreground">
          {val ? new Date(String(val)).toLocaleDateString() : "N/A"}
        </span>
      ),
    },
  ];

  // Card render for mobile
  const renderCard = (item: ManageJobProposalItem) => (
    <ProposalManageCard
      proposal={item}
      onDelete={(id) => handleDelete(id)}
      onDetails={(proposal) =>
        proposal.job?.slug &&
        router.push(withReturnTo(`/jobs/${proposal.job.slug}`))
      }
    />
  );

  // List Config
  const listConfig = {
    title: "Applied Jobs",
    description: "View all the jobs you have applied to.",
    columns,
    onRefresh: handleRefresh,
    onDelete: handleDelete,
    actions: {
      default: ["delete" as const],
      additional: [
        {
          label: "View Job",
          icon: IconEye,
          onClick: (item: ManageJobProposalItem) =>
            item.job?.slug &&
            router.push(withReturnTo(`/jobs/${item.job.slug}`)),
          hidden: (item: ManageJobProposalItem) => !item.job?.slug,
        },
      ],
    },
    renderCard,
    search: {
      fields: ["description" as keyof ManageJobProposalItem],
      placeholder: "Search proposals...",
    },
  };

  return (
    <div className="h-full">
      <ListPage
        data={manageProposals}
        loading={isLoadingManage}
        error={manageError}
        config={listConfig}
        totalItems={managePagination.total}
        currentPage={managePagination.currentPage}
        pageSize={managePagination.pageSize}
        onPageChange={(page) =>
          fetchManageProposals(undefined, page, managePagination.pageSize)
        }
        onPageSizeChange={(size) =>
          fetchManageProposals(undefined, managePagination.currentPage, size)
        }
      />
      {deleteDialog}
    </div>
  );
}

export default function ManageAppliedJobsPage() {
  return (
    <Suspense fallback={<PageSkeleton variant="list" rows={5} asCards />}>
      <ManageAppliedJobsContent />
    </Suspense>
  );
}
