"use client";

import { ListPage } from "@/components/list-page/ListPage";
import { StatusBadge } from "@/components/shared/status-badge";
import { useCurrency } from "@/hooks/use-currency";
import { formatShortDate } from "@/lib/date.utils";
import { useAdminEscrowStore } from "@/store/admin-escrow.store";
import type { Escrow } from "@/types/db/escrow.types";
import { IconEye } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function AdminEscrowListPage() {
  const router = useRouter();
  const { symbol } = useCurrency();
  const { escrows, isLoading, error, pagination, fetchEscrows } =
    useAdminEscrowStore();

  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchEscrows(1, 20, statusFilter ? { status: statusFilter } : undefined);
  }, [fetchEscrows, statusFilter]);

  const config = useMemo(
    () => ({
      title: "Escrow Management",
      description: "View and manage all escrow records across the platform.",
      onRefresh: async () => {
        await fetchEscrows(
          pagination.currentPage,
          pagination.pageSize,
          statusFilter ? { status: statusFilter } : undefined,
        );
      },
      actions: {
        default: [] as never[],
        pageActions: [
          {
            id: "filter-all",
            label: "All",
            variant: (!statusFilter ? "default" : "outline") as
              | "default"
              | "outline",
            onClick: () => setStatusFilter(""),
          },
          {
            id: "filter-review",
            label: "⚠ Disputes",
            variant: (statusFilter === "REVIEW" ? "default" : "outline") as
              | "default"
              | "outline",
            onClick: () => setStatusFilter("REVIEW"),
          },
          {
            id: "filter-active",
            label: "Active",
            variant: (statusFilter === "ACTIVE" ? "default" : "outline") as
              | "default"
              | "outline",
            onClick: () => setStatusFilter("ACTIVE"),
          },
          {
            id: "filter-completed",
            label: "Completed",
            variant: (statusFilter === "COMPLETED" ? "default" : "outline") as
              | "default"
              | "outline",
            onClick: () => setStatusFilter("COMPLETED"),
          },
        ],
        additional: [
          {
            id: "view-detail",
            label: "View Details",
            icon: IconEye,
            onClick: (item: Escrow) => {
              const order =
                typeof item.order === "object" ? item.order?.id : item.order;
              if (order) router.push(`/admin/escrow/${order}`);
            },
          },
        ],
      },
      columns: [
        {
          key: "order" as keyof Escrow,
          label: "Order",
          width: 22,
          render: (_: unknown, item: Escrow) => {
            const order = typeof item.order === "object" ? item.order : null;
            return (
              <div className="flex flex-col">
                <span className="font-bold text-xs text-primary uppercase">
                  {(order as { code?: string })?.code ?? "—"}
                </span>
                <span className="text-[11px] text-muted-foreground line-clamp-1">
                  {(order as { title?: string })?.title ?? "—"}
                </span>
              </div>
            );
          },
        },
        {
          key: "sender" as keyof Escrow,
          label: "Buyer",
          width: 18,
          render: (_: unknown, item: Escrow) => {
            const sender = typeof item.sender === "object" ? item.sender : null;
            return (
              <span className="text-sm">
                {(sender as { name?: string })?.name ?? "—"}
              </span>
            );
          },
        },
        {
          key: "receiver" as keyof Escrow,
          label: "Seller",
          width: 18,
          render: (_: unknown, item: Escrow) => {
            const receiver =
              typeof item.receiver === "object" ? item.receiver : null;
            return (
              <span className="text-sm">
                {(receiver as { name?: string })?.name ?? "—"}
              </span>
            );
          },
        },
        {
          key: "amount" as keyof Escrow,
          label: "Amount",
          width: 12,
          render: (val: unknown) => (
            <span className="font-semibold text-sm">
              {symbol} {(val as number).toLocaleString()}
            </span>
          ),
        },
        {
          key: "payment_status" as keyof Escrow,
          label: "Payment",
          width: 12,
          render: (val: unknown) => <StatusBadge status={val as string} />,
        },
        {
          key: "status" as keyof Escrow,
          label: "Status",
          width: 12,
          render: (val: unknown) => <StatusBadge status={val as string} />,
        },
        {
          key: "created_at" as keyof Escrow,
          label: "Created",
          width: 12,
          sortable: true,
          render: (val: unknown) => (
            <span className="text-xs text-muted-foreground">
              {formatShortDate(val as string)}
            </span>
          ),
        },
      ],
      search: {
        fields: [] as (keyof Escrow)[],
        placeholder: "Search by transaction ID…",
      },
    }),
    [router, symbol, fetchEscrows, pagination, statusFilter],
  );

  return (
    <ListPage
      data={escrows}
      loading={isLoading}
      error={error}
      config={config}
      totalItems={pagination.total}
      currentPage={pagination.currentPage}
      pageSize={pagination.pageSize}
      onPageChange={(page) =>
        fetchEscrows(
          page,
          pagination.pageSize,
          statusFilter ? { status: statusFilter } : undefined,
        )
      }
      onPageSizeChange={(size) =>
        fetchEscrows(
          1,
          size,
          statusFilter ? { status: statusFilter } : undefined,
        )
      }
    />
  );
}
