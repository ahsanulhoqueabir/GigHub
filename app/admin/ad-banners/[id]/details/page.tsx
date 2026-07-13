"use client";

import { useDeleteConfirm } from "@/components/shared/delete-confirm-dialog";
import { DetailsSkeleton } from "@/components/shared/details-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { useReturnTo } from "@/hooks/use-return-to";
import { useAdBannersStore } from "@/store/ad-banners.store";
import type { AdBanner } from "@/types/db/ad-banner.types";
import { IconArrowLeft, IconTrash } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

function AdBannerDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const { returnTo } = useReturnTo();
  const returnUrl = searchParams?.get("returnTo") || returnTo;
  const { getItem, deleteItem } = useAdBannersStore();
  const [banner, setBanner] = useState<AdBanner | null>(null);
  const [loading, setLoading] = useState(true);
  const { confirmDelete, deleteDialog } = useDeleteConfirm();

  useEffect(() => {
    async function load() {
      if (id) {
        const data = await getItem(id);
        setBanner(data);
        setLoading(false);
      }
    }
    load();
  }, [id, getItem]);

  const handleDelete = useCallback(async () => {
    const confirmed = await confirmDelete(banner?.name || "this ad banner");
    if (!confirmed) return;
    await deleteItem(id);
    router.push(returnUrl);
  }, [banner, confirmDelete, deleteItem, id, router, returnUrl]);

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
              Ad Banner Details
            </h2>
            <p className="text-muted-foreground text-sm">
              View ad banner information.
            </p>
          </div>
        </div>
        {banner && (
          <div className="flex items-center gap-2">
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <IconTrash className="h-4 w-4 mr-1.5" />
              Delete
            </Button>
            <Button asChild>
              <Link
                href={`/admin/ad-banners/${id}/update?returnTo=${encodeURIComponent(returnUrl)}`}
              >
                Edit Banner
              </Link>
            </Button>
          </div>
        )}
      </div>

      <div className="max-w-3xl">
        {loading ? (
          <DetailsSkeleton rows={3} columns={2} showHeader={false} />
        ) : banner ? (
          <div className="space-y-6">
            {/* Banner Image */}
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
                <h3 className="text-lg font-medium">Banner Image</h3>
              </div>
              <div className="p-6">
                <div className="relative w-full h-40 rounded-lg overflow-hidden">
                  <Image
                    src={banner.image_url}
                    alt={banner.alt_text}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 600px"
                  />
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Banner Information
                </h3>
              </div>
              <div className="px-6 py-5">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {banner.name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Status
                    </dt>
                    <dd className="mt-1">
                      <StatusBadge
                        status={banner.is_active ? "ACTIVE" : "DRAFT"}
                      />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Placement
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {banner.placement}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Sort Order
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {banner.sort_order}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Alt Text
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {banner.alt_text}
                    </dd>
                  </div>
                  {banner.target_url && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Target URL
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {banner.target_url}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        ) : (
          <ErrorState type="not-found" heading="Ad banner not found" compact />
        )}
      </div>

      {deleteDialog}
    </div>
  );
}

export default function AdBannerDetailsPage() {
  return (
    <Suspense fallback={<DetailsSkeleton />}>
      <AdBannerDetailsContent />
    </Suspense>
  );
}
