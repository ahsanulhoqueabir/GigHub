"use client";

import { useDeleteConfirm } from "@/components/shared/delete-confirm-dialog";
import { DetailsSkeleton } from "@/components/shared/details-skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { useReturnTo } from "@/hooks/use-return-to";
import { useAnnouncementsStore } from "@/store/announcements.store";
import type { Announcement } from "@/types/db/announcement.types";
import { IconArrowLeft, IconTrash } from "@tabler/icons-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

function AnnouncementDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const { returnTo } = useReturnTo();
  const returnUrl = searchParams?.get("returnTo") || returnTo;
  const { getItem, deleteItem } = useAnnouncementsStore();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const { confirmDelete, deleteDialog } = useDeleteConfirm();

  useEffect(() => {
    async function load() {
      if (id) {
        const data = await getItem(id);
        setAnnouncement(data);
        setLoading(false);
      }
    }
    load();
  }, [id, getItem]);

  const handleDelete = useCallback(async () => {
    const confirmed = await confirmDelete(
      announcement?.title || "this announcement",
    );
    if (!confirmed) return;
    await deleteItem(id);
    router.push(returnUrl);
  }, [announcement, confirmDelete, deleteItem, id, router, returnUrl]);

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between space-x-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={returnUrl}>
              <IconArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Announcement Details
            </h2>
            <p className="text-muted-foreground text-sm">
              View announcement information.
            </p>
          </div>
        </div>
        {announcement && (
          <div className="flex items-center gap-2">
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <IconTrash className="h-4 w-4 mr-1.5" />
              Delete
            </Button>
            <Button asChild>
              <Link
                href={`/admin/announcements/${id}/update?returnTo=${encodeURIComponent(returnUrl)}`}
              >
                Edit Announcement
              </Link>
            </Button>
          </div>
        )}
      </div>

      <div className="max-w-3xl">
        {loading ? (
          <DetailsSkeleton rows={3} columns={1} showHeader={false} />
        ) : announcement ? (
          <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Announcement Information
              </h3>
            </div>
            <div className="px-6 py-5">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Title</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {announcement.title}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Type</dt>
                  <dd className="mt-1">
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset bg-blue-50 text-blue-700 ring-blue-600/20">
                      {announcement.type}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Active</dt>
                  <dd className="mt-1">
                    <StatusBadge
                      status={announcement.is_active ? "ACTIVE" : "DRAFT"}
                    />
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Content</dt>
                  <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                    {announcement.content}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-red-500 font-medium">
            Announcement not found
          </div>
        )}
      </div>

      {deleteDialog}
    </div>
  );
}

export default function AnnouncementDetailsPage() {
  return (
    <Suspense fallback={<DetailsSkeleton />}>
      <AnnouncementDetailsContent />
    </Suspense>
  );
}
