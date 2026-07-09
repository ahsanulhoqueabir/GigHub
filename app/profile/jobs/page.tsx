"use client";

import { ListPage } from "@/components/list-page";
import type { ColumnConfig } from "@/components/list-page/types";
import { JobManageCard } from "@/components/profile/jobs/JobManageCard";
import { useDeleteConfirm } from "@/components/shared/delete-confirm-dialog";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { Badge } from "@/components/ui/badge";
import { useReturnTo } from "@/hooks/use-return-to";
import { getStatusBadgeColors } from "@/lib/shared/badge.utils";
import { useJobsStore } from "@/store/jobs.store";
import type { JobListItem } from "@/types/db/job.types";
import { IconEye, IconPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect } from "react";

const JOB_TYPE_LABELS: Record<string, string> = {
  PARTTIME: "Part Time",
  FULLTIME: "Full Time",
  CONTRACT: "Contract",
  TUTION: "Tuition",
  VOLUNTEER: "Volunteer",
  OTHER: "Other",
};

function ManageJobsContent() {
  const router = useRouter();
  const { withReturnTo } = useReturnTo();
  const { confirmDelete, deleteDialog } = useDeleteConfirm();
  const {
    jobs,
    isLoadingList,
    listError,
    listPagination,
    fetchManageJobs,
    deleteJob,
  } = useJobsStore();

  // Load jobs on mount
  useEffect(() => {
    fetchManageJobs();
  }, [fetchManageJobs]);

  const handleRefresh = useCallback(() => {
    fetchManageJobs();
  }, [fetchManageJobs]);

  const handleDelete = useCallback(
    async (id: string) => {
      const job = jobs.find((j) => j.id === id);
      const confirmed = await confirmDelete(job?.title || "this job");
      if (!confirmed) return;
      try {
        await deleteJob(id);
        fetchManageJobs();
      } catch (err) {
        console.error(err);
      }
    },
    [jobs, confirmDelete, deleteJob, fetchManageJobs],
  );

  // Listing Columns
  const columns: ColumnConfig<JobListItem>[] = [
    {
      key: "title",
      label: "Job Title",
      width: 40,
      render: (val) => (
        <span className="font-medium text-sm line-clamp-2">{String(val)}</span>
      ),
    },
    {
      key: "type",
      label: "Type",
      width: 12,
      render: (val) => (
        <Badge
          variant="outline"
          className="text-[10px] px-1.5 py-0 font-medium"
        >
          {JOB_TYPE_LABELS[String(val)] ?? String(val)}
        </Badge>
      ),
    },
    {
      key: "category" as keyof JobListItem,
      label: "Category",
      width: 15,
      render: (_, item) => (
        <span className="text-xs text-muted-foreground">
          {item.category?.name || "N/A"}
        </span>
      ),
    },
    {
      key: "budget" as keyof JobListItem,
      label: "Budget",
      width: 15,
      render: (val) => (
        <span className="text-xs font-semibold">
          {val ? String(val) : "N/A"}
        </span>
      ),
    },
    {
      key: "views",
      label: "Views",
      width: 5,
      render: (val) => (
        <span className="text-xs text-muted-foreground">{String(val)}</span>
      ),
    },
    {
      key: "status" as keyof JobListItem,
      label: "Status",
      width: 10,
      render: (_, item: JobListItem & { status?: string }) => {
        const status = item.status || "ACTIVE";
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
  ];

  // List Config
  const listConfig = {
    title: "Manage Jobs",
    description: "Create, view, edit, and delete your job listings here.",
    columns,
    onRefresh: handleRefresh,
    onEdit: (item: JobListItem) =>
      router.push(withReturnTo(`/profile/jobs/${item.id}/edit`)),
    onDelete: handleDelete,
    actions: {
      default: ["edit" as const, "delete" as const],
      additional: [
        {
          label: "Details",
          icon: IconEye,
          onClick: (item: JobListItem) =>
            router.push(withReturnTo(`/profile/jobs/${item.id}/details`)),
        },
      ],
      pageActions: [
        {
          label: "Create Job",
          icon: IconPlus,
          onClick: () => router.push(withReturnTo("/profile/jobs/create")),
        },
      ],
    },
    renderCard: (item: JobListItem) => (
      <JobManageCard
        job={item}
        onEdit={(job) =>
          router.push(withReturnTo(`/profile/jobs/${job.id}/edit`))
        }
        onDelete={(id) => handleDelete(id)}
        onDetails={(job) =>
          router.push(withReturnTo(`/profile/jobs/${job.id}/details`))
        }
      />
    ),
  };

  return (
    <div className="h-full">
      <ListPage
        data={jobs}
        loading={isLoadingList}
        error={listError}
        config={listConfig}
        totalItems={listPagination.total}
        currentPage={listPagination.currentPage}
        pageSize={listPagination.pageSize}
        onPageChange={(page) =>
          fetchManageJobs(undefined, page, listPagination.pageSize)
        }
        onPageSizeChange={(size) =>
          fetchManageJobs(undefined, listPagination.currentPage, size)
        }
      />
      {deleteDialog}
    </div>
  );
}

export default function ManageJobsPage() {
  return (
    <Suspense fallback={<PageSkeleton variant="list" rows={5} asCards />}>
      <ManageJobsContent />
    </Suspense>
  );
}
