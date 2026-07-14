"use client";

import { ListPage } from "@/components/list-page/ListPage";
import { StatusBadge } from "@/components/shared/status-badge";
import { useCurrency } from "@/hooks/use-currency";
import { formatShortDate } from "@/lib/date.utils";
import { useAdminEscrowStore } from "@/store/admin-escrow.store";
import type { Escrow } from "@/types/db/escrow.types";
import { IconGavel } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

export default function AdminDisputesPage() {
  const router = useRouter();
  const { symbol } = useCurrency();
  const {
    disputes,
    isLoadingDisputes,
    disputesError,
    disputesPagination,
    fetchDisputes,
  } = useAdminEscrowStore();

  useEffect(() => {
    fetchDisputes(1, 20);
  }, [fetchDisputes]);

  const config = useMemo(
    () => ({
      title: "Dispute Queue",
      description:
        "Orders in REVIEW status awaiting admin resolution. Each dispute must be resolved by releasing funds to the seller or refunding to the buyer.",
      onRefresh: async () => {
        await fetchDisputes(
          disputesPagination.currentPage,
          disputesPagination.pageSize,
        );
      },
      actions: {
        default: [] as never[],
        additional: [
          {
            id: "resolve",
            label: "Resolve Dispute",
            icon: IconGavel,
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
          width: 16,
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
          width: 16,
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
          width: 10,
          render: (val: unknown) => (
            <span className="font-semibold text-sm">
              {symbol} {(val as number).toLocaleString()}
            </span>
          ),
        },
        {
          key: "dispute_reason" as keyof Escrow,
          label: "Reason",
          width: 22,
          render: (val: unknown) => (
            <span className="text-xs text-muted-foreground line-clamp-2">
              {(val as string) ?? "No reason provided"}
            </span>
          ),
        },
        {
          key: "disputed_at" as keyof Escrow,
          label: "Disputed",
          width: 14,
          sortable: true,
          render: (val: unknown) => (
            <span className="text-xs text-amber-600 font-medium">
              {val ? formatShortDate(val as string) : "—"}
            </span>
          ),
        },
        {
          key: "status" as keyof Escrow,
          label: "Status",
          width: 10,
          render: (val: unknown) => <StatusBadge status={val as string} />,
        },
      ],
      search: {
        fields: [] as (keyof Escrow)[],
        placeholder: "Search disputes…",
      },
    }),
    [router, symbol, fetchDisputes, disputesPagination],
  );

  return (
    <ListPage
      data={disputes}
      loading={isLoadingDisputes}
      error={disputesError}
      config={config}
      totalItems={disputesPagination.total}
      currentPage={disputesPagination.currentPage}
      pageSize={disputesPagination.pageSize}
      onPageChange={(page) => fetchDisputes(page, disputesPagination.pageSize)}
      onPageSizeChange={(size) => fetchDisputes(1, size)}
    />
  );
}
