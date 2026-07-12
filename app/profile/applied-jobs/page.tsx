"use client";

import { ListPage } from "@/components/list-page";
import type { ColumnConfig } from "@/components/list-page/types";
import { AppliedJobCard } from "@/components/profile/jobs/ProposalManageCard";
import { useDeleteConfirm } from "@/components/shared/delete-confirm-dialog";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import type { AppliedJobItem } from "@/store/job-proposals.store";
import { useJobProposalsStore } from "@/store/job-proposals.store";
import { IconArrowRight } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect } from "react";

function AppliedJobsContent() {
  const router = useRouter();
  const { confirmDelete, deleteDialog } = useDeleteConfirm();
  const {
    appliedJobs,
    isLoadingApplied,
    appliedError,
    appliedPagination,
    fetchAppliedJobs,
    deleteProposal,
  } = useJobProposalsStore();

  // Load on mount
  useEffect(() => {
    fetchAppliedJobs();
  }, [fetchAppliedJobs]);

  const handleRefresh = useCallback(() => {
    fetchAppliedJobs();
  }, [fetchAppliedJobs]);

  const handleViewDetails = useCallback(
    (id: string) => {
      router.push(`/profile/applied-jobs/${id}`);
    },
    [router],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      const item = appliedJobs.find((p) => p.id === id);
      const confirmed = await confirmDelete(
        item?.job?.title || "this proposal",
      );
      if (!confirmed) return;
      try {
        await deleteProposal(id);
        fetchAppliedJobs();
      } catch (err) {
        console.error(err);
      }
    },
    [appliedJobs, confirmDelete, deleteProposal, fetchAppliedJobs],
  );

  // Table columns
  const columns: ColumnConfig<AppliedJobItem>[] = [
    {
      key: "job",
      label: "Job Title",
      width: 35,
      render: (_, item) => (
        <span className="font-semibold text-sm line-clamp-1">
          {item.job?.title || "N/A"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Proposal Status",
      width: 15,
      render: (val) => {
        return <StatusBadge status={val as string} />;
      },
    },
    {
      key: "description",
      label: "Proposal",
      width: 30,
      render: (val) => (
        <span className="text-xs text-muted-foreground line-clamp-2">
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
          {val ? new Date(String(val)).toLocaleDateString() : "N/A"}
        </span>
      ),
    },
    {
      key: "updated_at",
      label: "Updated",
      width: 8,
      render: (val) => (
        <span className="text-xs text-muted-foreground">
          {val ? new Date(String(val)).toLocaleDateString() : "N/A"}
        </span>
      ),
    },
  ];

  // Mobile card render
  const renderCard = (item: AppliedJobItem) => (
    <AppliedJobCard
      proposal={item}
      onDelete={(id) => handleDelete(id)}
      onViewDetails={(id) => handleViewDetails(id)}
    />
  );

  const listConfig = {
    title: "Applied Jobs",
    description: "Track and manage all the job proposals you have submitted.",
    columns,
    onRefresh: handleRefresh,
    onDelete: handleDelete,
    actions: {
      default: ["delete" as const],
      additional: [
        {
          label: "View Details",
          icon: IconArrowRight,
          onClick: (item: AppliedJobItem) => handleViewDetails(item.id),
        },
      ],
    },
    renderCard,
    search: {
      fields: ["description" as keyof AppliedJobItem],
      placeholder: "Search proposals…",
    },
  };

  return (
    <div className="h-full">
      <ListPage
        data={appliedJobs}
        loading={isLoadingApplied}
        error={appliedError}
        config={listConfig}
        totalItems={appliedPagination.total}
        currentPage={appliedPagination.currentPage}
        pageSize={appliedPagination.pageSize}
        onPageChange={(page) =>
          fetchAppliedJobs(page, appliedPagination.pageSize)
        }
        onPageSizeChange={(size) =>
          fetchAppliedJobs(appliedPagination.currentPage, size)
        }
      />
      {deleteDialog}
    </div>
  );
}

export default function AppliedJobsPage() {
  return (
    <Suspense fallback={<PageSkeleton variant="list" rows={5} asCards />}>
      <AppliedJobsContent />
    </Suspense>
  );
}
