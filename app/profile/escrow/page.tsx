"use client";

import { ListPage } from "@/components/list-page";
import type { ColumnConfig } from "@/components/list-page/types";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/hooks/use-currency";
import { formatShortDate } from "@/lib/date.utils";
import { useAuthStore } from "@/store/auth.store";
import { useEscrowStore } from "@/store/escrow.store";
import type { Escrow } from "@/types/db/escrow.types";
import { IconArrowRight, IconShield } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect } from "react";

function EscrowContent() {
  const router = useRouter();
  const { symbol } = useCurrency();
  const { user } = useAuthStore();
  const { escrows, isLoading, error, pagination, fetchMyEscrows } =
    useEscrowStore();

  useEffect(() => {
    fetchMyEscrows(1, 20);
  }, [fetchMyEscrows]);

  const handleRefresh = useCallback(() => {
    fetchMyEscrows(pagination.currentPage, pagination.pageSize);
  }, [fetchMyEscrows, pagination]);

  const handleViewOrder = useCallback(
    (orderId: string) => {
      router.push(`/profile/orders/${orderId}`);
    },
    [router],
  );

  const columns: ColumnConfig<Escrow>[] = [
    {
      key: "order",
      label: "Order Code",
      width: 16,
      render: (val) => {
        const order = typeof val === "object" ? val : null;
        return (
          <span className="font-bold text-sm text-primary uppercase">
            {(order as { code?: string })?.code ?? "—"}
          </span>
        );
      },
    },
    {
      key: "sender",
      label: "Type",
      width: 10,
      render: (val) => {
        const senderId =
          typeof val === "object" ? (val as { id?: string })?.id : val;
        const isSender = senderId === user?.id;
        return (
          <Badge
            variant="outline"
            className={`text-xs ${isSender ? "text-red-600 border-red-300" : "text-green-600 border-green-300"}`}
          >
            {isSender ? "Sent" : "Received"}
          </Badge>
        );
      },
    },
    {
      key: "amount",
      label: "Amount",
      width: 14,
      render: (val) => (
        <span className="font-semibold text-sm">
          {symbol} {(val as number).toLocaleString()}
        </span>
      ),
    },
    {
      key: "platform_fee",
      label: "Fee",
      width: 10,
      render: (val) => (
        <span className="text-sm text-muted-foreground">
          {symbol} {(val as number).toLocaleString()}
        </span>
      ),
    },
    {
      key: "payment_status",
      label: "Payment",
      width: 12,
      render: (val) => <StatusBadge status={val as string} />,
    },
    {
      key: "status",
      label: "Status",
      width: 12,
      render: (val) => <StatusBadge status={val as string} />,
    },
    {
      key: "created_at",
      label: "Date",
      width: 12,
      sortable: true,
      render: (val) => (
        <span className="text-xs text-muted-foreground">
          {formatShortDate(val as string)}
        </span>
      ),
    },
  ];

  const listConfig = {
    title: "My Escrow",
    description: "Your escrow records — payments held and received for orders.",
    columns,
    onRefresh: handleRefresh,
    actions: {
      default: [],
      additional: [
        {
          label: "View Order",
          icon: IconArrowRight,
          onClick: (item: Escrow) => {
            const orderId =
              typeof item.order === "object"
                ? (item.order as { id?: string })?.id
                : item.order;
            if (orderId) handleViewOrder(orderId);
          },
        },
      ],
    },
    search: {
      fields: [] as (keyof Escrow)[],
      placeholder: "Search escrow records…",
    },
  };

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (!isLoading && !error && escrows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
        <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <IconShield className="size-8 text-primary/60" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">No Escrow Records</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Once you place or complete orders, your escrow records will appear
            here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ListPage
      data={escrows}
      loading={isLoading}
      error={error}
      config={listConfig}
      totalItems={pagination.total}
      currentPage={pagination.currentPage}
      pageSize={pagination.pageSize}
      onPageChange={(page) => fetchMyEscrows(page, pagination.pageSize)}
      onPageSizeChange={(size) => fetchMyEscrows(1, size)}
    />
  );
}

export default function EscrowPage() {
  return (
    <Suspense fallback={<PageSkeleton variant="list" rows={5} />}>
      <EscrowContent />
    </Suspense>
  );
}
