"use client";

import { useDeleteConfirm } from "@/components/shared/delete-confirm-dialog";
import { DetailsSkeleton } from "@/components/shared/details-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReturnTo } from "@/hooks/use-return-to";
import { STATUS_BADGE_COLORS } from "@/lib/shared/badge.utils";
import { getDisplayFilename } from "@/lib/shared/regex.utils";
import { useJobsStore } from "@/store/jobs.store";
import {
  IconBriefcase,
  IconCalendar,
  IconEdit,
  IconMapPin,
  IconTrash,
  IconWallet,
} from "@tabler/icons-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect } from "react";

const JOB_TYPE_LABELS: Record<string, string> = {
  PARTTIME: "Part Time",
  FULLTIME: "Full Time",
  CONTRACT: "Contract",
  TUTION: "Tuition",
  VOLUNTEER: "Volunteer",
  OTHER: "Other",
};

function JobDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { returnTo, withReturnTo } = useReturnTo("/profile/jobs");

  const { currentJob, isLoadingDetail, detailError, fetchJobById, deleteJob } =
    useJobsStore();

  const { confirmDelete, deleteDialog } = useDeleteConfirm();

  useEffect(() => {
    if (id) {
      fetchJobById(id);
    }
  }, [id, fetchJobById]);

  const handleDelete = useCallback(async () => {
    if (!currentJob) return;
    const confirmed = await confirmDelete(currentJob.title);
    if (!confirmed) return;
    try {
      await deleteJob(id);
      router.push(returnTo);
    } catch (err) {
      console.error(err);
    }
  }, [currentJob, confirmDelete, deleteJob, id, router, returnTo]);

  if (isLoadingDetail) {
    return (
      <div>
        <DetailsSkeleton rows={3} columns={2} />
      </div>
    );
  }

  if (detailError || !currentJob) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16 px-4">
        <h2 className="text-2xl font-bold text-destructive">Job Not Found</h2>
        <p className="text-muted-foreground mt-2">
          {detailError ||
            "The job you are trying to view does not exist or has been deleted."}
        </p>
        <Button className="mt-6" asChild>
          <Link href={returnTo}>Back to Jobs</Link>
        </Button>
      </div>
    );
  }

  const status =
    (currentJob as typeof currentJob & { status?: string }).status || "ACTIVE";
  const typeLabel = JOB_TYPE_LABELS[currentJob.type] ?? currentJob.type;
  const statusColor =
    STATUS_BADGE_COLORS[status] ?? STATUS_BADGE_COLORS["ACTIVE"];

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={returnTo}
        title={
          <div className="flex items-center gap-2 flex-wrap">
            <span>Job Overview</span>
            <Badge
              className={`bg-${statusColor.bg} text-${statusColor.text} border-none px-2.5 py-0.5 rounded-full text-[10px] font-bold`}
            >
              {status}
            </Badge>
          </div>
        }
        description="View and manage this job listing."
        actions={
          <div className="flex items-center gap-3 *:flex-1 sm:*:flex-none">
            <Button variant="destructive" onClick={handleDelete}>
              <IconTrash className="h-4 w-4 mr-1.5" />
              Delete
            </Button>
            <Button asChild>
              <Link href={withReturnTo(`/profile/jobs/${id}/edit`)}>
                <IconEdit className="h-4 w-4 mr-1.5" />
                Edit Job
              </Link>
            </Button>
          </div>
        }
      />

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left — main content */}
        <div className="lg:col-span-2 space-y-6">
          <h1 className="text-xl md:text-2xl font-bold text-foreground">
            {currentJob.title}
          </h1>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Job Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">
                {currentJob.description}
              </p>
            </CardContent>
          </Card>

          {/* Required Skills */}
          {currentJob.required_skills &&
            currentJob.required_skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    Required Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {currentJob.required_skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="px-2.5 py-0.5 rounded text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Tags */}
          {currentJob.tags && currentJob.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Search Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {currentJob.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="px-2.5 py-0.5 rounded text-xs uppercase tracking-wide"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Attachments */}
          {currentJob.attachments && currentJob.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Attachments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {currentJob.attachments.map((url, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="whitespace-normal h-auto min-h-9 py-1.5 text-left text-wrap"
                      asChild
                    >
                      <a
                        className="truncate max-w-62.5 md:max-w-75 text-xs"
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {getDisplayFilename(url, idx + 1)}
                      </a>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right — meta sidebar */}
        <div className="space-y-6">
          <Card className="shadow-sm border-border bg-card sticky top-20">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-semibold">
                Job Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              {/* Type */}
              <div className="flex items-center gap-3 text-sm">
                <IconBriefcase className="size-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="font-semibold">{typeLabel}</p>
                </div>
              </div>

              {/* Category */}
              {currentJob.category && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="size-4 text-muted-foreground shrink-0 text-base leading-none">
                    #
                  </span>
                  <div>
                    <p className="text-xs text-muted-foreground">Category</p>
                    <p className="font-semibold">
                      {(currentJob.category as { name?: string }).name ||
                        String(currentJob.category)}
                    </p>
                  </div>
                </div>
              )}

              {/* Budget */}
              {currentJob.budget && (
                <div className="flex items-center gap-3 text-sm">
                  <IconWallet className="size-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Budget</p>
                    <p className="font-semibold">{currentJob.budget}</p>
                  </div>
                </div>
              )}

              {/* Deadline */}
              {currentJob.deadline && (
                <div className="flex items-center gap-3 text-sm">
                  <IconCalendar className="size-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Deadline</p>
                    <p className="font-semibold">
                      {new Date(currentJob.deadline).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "short", day: "numeric" },
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Location */}
              {currentJob.location && (
                <div className="flex items-center gap-3 text-sm">
                  <IconMapPin className="size-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-semibold">{currentJob.location}</p>
                  </div>
                </div>
              )}

              {/* Views */}
              <div className="pt-3 border-t text-xs text-muted-foreground text-right">
                {currentJob.views} views
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {deleteDialog}
    </div>
  );
}

export default function JobDetailsPage() {
  return (
    <Suspense
      fallback={
        <div>
          <DetailsSkeleton />
        </div>
      }
    >
      <JobDetailsContent />
    </Suspense>
  );
}
