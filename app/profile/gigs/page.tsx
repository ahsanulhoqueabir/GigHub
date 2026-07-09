"use client";

import { ListPage } from "@/components/list-page";
import type { ColumnConfig } from "@/components/list-page/types";
import { GigManageCard } from "@/components/profile/gigs/GigManageCard";
import { useDeleteConfirm } from "@/components/shared/delete-confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/hooks/use-currency";
import { useReturnTo } from "@/hooks/use-return-to";
import { getStatusBadgeColors } from "@/lib/shared/badge.utils";
import { useGigsStore } from "@/store/gigs.store";
import type { GigListItem } from "@/types/db/gig.types";
import { IconEye, IconPlus } from "@tabler/icons-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect } from "react";

function ManageGigsContent() {
  const router = useRouter();
  const { withReturnTo } = useReturnTo();
  const { confirmDelete, deleteDialog } = useDeleteConfirm();
  const { symbol } = useCurrency();
  const {
    gigs,
    isLoadingList,
    listError,
    listPagination,
    fetchManageGigs,
    deleteGig,
  } = useGigsStore();

  // Load the gigs on mount
  useEffect(() => {
    fetchManageGigs();
  }, [fetchManageGigs]);

  const handleRefresh = useCallback(() => {
    fetchManageGigs();
  }, [fetchManageGigs]);

  const handleDelete = useCallback(
    async (id: string) => {
      const gig = gigs.find((g) => g.id === id);
      const confirmed = await confirmDelete(gig?.title || "this gig");
      if (!confirmed) return;
      try {
        await deleteGig(id);
        fetchManageGigs();
      } catch (err) {
        console.error(err);
      }
    },
    [gigs, confirmDelete, deleteGig, fetchManageGigs],
  );

  // Listing Columns
  const columns: ColumnConfig<GigListItem>[] = [
    {
      key: "images" as keyof GigListItem,
      label: "Image",
      width: 10,
      render: (_, item) => {
        const primaryImage =
          item.images && item.images.length > 0 ? item.images[0] : null;
        return primaryImage ? (
          <Image
            src={primaryImage}
            alt={item.title}
            className="w-12 h-8 rounded object-cover border border-border"
            height={32}
            width={48}
          />
        ) : (
          <div className="w-12 h-8 rounded bg-muted border border-border flex items-center justify-center text-[10px] text-muted-foreground">
            No Image
          </div>
        );
      },
    },
    {
      key: "title",
      label: "Gig Title",
      width: 45,
      render: (val) => (
        <span className="font-medium text-sm line-clamp-2">{String(val)}</span>
      ),
    },
    {
      key: "category" as keyof GigListItem,
      label: "Category",
      width: 15,
      render: (_, item) => (
        <span className="text-xs text-muted-foreground">
          {item.category?.name || "N/A"}
        </span>
      ),
    },
    {
      key: "packages" as keyof GigListItem,
      label: "Price Range",
      width: 15,
      render: (_, item) => {
        const prices = item.packages
          .map((p) => p.price)
          .filter((p): p is number => typeof p === "number");
        if (prices.length === 0) return <span className="text-xs">N/A</span>;
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        return (
          <span className="text-xs font-semibold">
            {minPrice === maxPrice
              ? `${symbol} ${minPrice}`
              : `${symbol} ${minPrice} - ${symbol} ${maxPrice}`}
          </span>
        );
      },
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
      key: "status" as keyof GigListItem,
      label: "Status",
      width: 10,
      render: (_, item: GigListItem & { status?: string }) => {
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
    title: "Manage Gigs",
    description: "Create, view, edit, and delete your gig listings here.",
    columns,
    onRefresh: handleRefresh,
    onEdit: (item: GigListItem) =>
      router.push(withReturnTo(`/profile/gigs/${item.id}/edit`)),
    onDelete: handleDelete,
    actions: {
      default: ["edit" as const, "delete" as const],
      additional: [
        {
          label: "Details",
          icon: IconEye,
          onClick: (item: GigListItem) =>
            router.push(withReturnTo(`/profile/gigs/${item.id}/details`)),
        },
      ],
      pageActions: [
        {
          label: "Create Gig",
          icon: IconPlus,
          onClick: () => router.push(withReturnTo("/profile/gigs/create")),
        },
      ],
    },
    renderCard: (item: GigListItem) => (
      <GigManageCard
        gig={item}
        onEdit={(gig) =>
          router.push(withReturnTo(`/profile/gigs/${gig.id}/edit`))
        }
        onDelete={(id) => handleDelete(id)}
        onDetails={(gig) =>
          router.push(withReturnTo(`/profile/gigs/${gig.id}/details`))
        }
      />
    ),
  };

  return (
    <div className="h-full">
      <ListPage
        data={gigs}
        loading={isLoadingList}
        error={listError}
        config={listConfig}
        totalItems={listPagination.total}
        currentPage={listPagination.currentPage}
        pageSize={listPagination.pageSize}
        onPageChange={(page) =>
          fetchManageGigs(undefined, page, listPagination.pageSize)
        }
        onPageSizeChange={(size) =>
          fetchManageGigs(undefined, listPagination.currentPage, size)
        }
      />
      {deleteDialog}
    </div>
  );
}

export default function ManageGigsPage() {
  return (
    <Suspense fallback={<div>Loading Gigs...</div>}>
      <ManageGigsContent />
    </Suspense>
  );
}
