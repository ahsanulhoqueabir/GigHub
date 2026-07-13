"use client";

import { ListPage } from "@/components/list-page";
import type { ColumnConfig } from "@/components/list-page/types";
import { OrderManageCard } from "@/components/profile/orders/OrderManageCard";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/hooks/use-currency";
import { formatShortDate } from "@/lib/date.utils";
import type { OrderListItem } from "@/store/orders.store";
import { useOrdersStore } from "@/store/orders.store";
import { IconArrowRight } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect } from "react";

function OrdersContent() {
  const router = useRouter();
  const { symbol } = useCurrency();
  const { orders, isLoading, error, pagination, fetchOrders } =
    useOrdersStore();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleRefresh = useCallback(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleViewDetails = useCallback(
    (id: string) => {
      router.push(`/profile/orders/${id}`);
    },
    [router],
  );

  const columns: ColumnConfig<OrderListItem>[] = [
    {
      key: "code",
      label: "Code",
      width: 15,
      render: (val) => (
        <span className="font-bold text-sm text-primary uppercase">
          {val as string}
        </span>
      ),
    },
    {
      key: "title",
      label: "Title",
      width: 25,
      render: (val, row) => (
        <button
          onClick={() => handleViewDetails(row.id)}
          className="font-semibold text-sm line-clamp-1 text-left hover:underline hover:text-primary transition-colors cursor-pointer"
        >
          {val as string}
        </button>
      ),
    },
    {
      key: "source",
      label: "Source",
      width: 10,
      render: (val) => (
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
          {val as string}
        </Badge>
      ),
    },
    {
      key: "total_price",
      label: "Total",
      width: 10,
      render: (val) => (
        <span className="font-medium text-sm">
          {symbol} {val as number}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: 12,
      render: (val) => {
        return <StatusBadge status={val as string} />;
      },
    },
    {
      key: "created_at",
      label: "Created",
      width: 12,
      sortable: true,
      render: (val) => (
        <span className="text-xs text-muted-foreground">
          {formatShortDate(val as string)}
        </span>
      ),
    },
    {
      key: "updated_at",
      label: "Updated",
      width: 8,
      render: (val) => (
        <span className="text-xs text-muted-foreground">
          {formatShortDate(val as string)}
        </span>
      ),
    },
  ];

  const renderCard = (item: OrderListItem) => (
    <OrderManageCard
      order={item}
      onViewDetails={(id) => handleViewDetails(id)}
    />
  );

  const listConfig = {
    title: "My Orders",
    description: "Manage your purchases and sales in one place.",
    columns,
    onRefresh: handleRefresh,
    actions: {
      default: [],
      additional: [
        {
          label: "View Details",
          icon: IconArrowRight,
          onClick: (item: OrderListItem) => handleViewDetails(item.id),
        },
      ],
    },
    renderCard,
    search: {
      fields: ["code", "title"] as (keyof OrderListItem)[],
      placeholder: "Search by code or title…",
    },
  };

  return (
    <div className="h-full">
      <ListPage
        data={orders}
        loading={isLoading}
        error={error}
        config={listConfig}
        totalItems={pagination.total}
        currentPage={pagination.currentPage}
        pageSize={pagination.pageSize}
        onPageChange={(page) => fetchOrders(page, pagination.pageSize)}
        onPageSizeChange={(size) => fetchOrders(pagination.currentPage, size)}
      />
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<PageSkeleton variant="list" rows={5} asCards />}>
      <OrdersContent />
    </Suspense>
  );
}
