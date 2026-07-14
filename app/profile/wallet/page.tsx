"use client";

import { ListPage } from "@/components/list-page";
import type { ColumnConfig } from "@/components/list-page/types";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/hooks/use-currency";
import { formatShortDate } from "@/lib/date.utils";
import { useWalletStore } from "@/store/wallet.store";
import type { WalletRecord } from "@/types/db/wallet-record.types";
import {
  IconArrowDownLeft,
  IconArrowUpRight,
  IconWallet,
} from "@tabler/icons-react";
import { Suspense, useEffect } from "react";

// ─── Wallet Balance Card ─────────────────────────────────────────────────────

function WalletCard() {
  const { wallet, isLoadingWallet, walletError } = useWalletStore();
  const { symbol } = useCurrency();

  if (isLoadingWallet) {
    return (
      <div className="rounded-2xl border bg-linear-to-br from-primary/10 to-primary/5 p-6 animate-pulse h-32" />
    );
  }

  if (walletError || !wallet) {
    return (
      <div className="rounded-2xl border bg-card p-6 text-center text-muted-foreground text-sm">
        Wallet not available
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-linear-to-br from-primary/10 via-background to-background p-6 flex items-center gap-6">
      <div className="size-14 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
        <IconWallet className="size-7 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
          {wallet.name ?? "My Wallet"}
        </p>
        <p className="text-3xl font-bold tracking-tight mt-0.5">
          {symbol}{" "}
          {wallet.balance.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {wallet.currency ?? "BDT"}
        </p>
      </div>
    </div>
  );
}

// ─── Transaction History ──────────────────────────────────────────────────────

function WalletContent() {
  const { symbol } = useCurrency();
  const {
    records,
    isLoadingRecords,
    recordsError,
    pagination,
    fetchWallet,
    fetchRecords,
  } = useWalletStore();

  useEffect(() => {
    fetchWallet();
    fetchRecords(1, 20);
  }, [fetchWallet, fetchRecords]);

  const columns: ColumnConfig<WalletRecord>[] = [
    {
      key: "type",
      label: "Type",
      width: 10,
      render: (val) => {
        const isCredit = val === "CREDIT";
        return (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
              isCredit
                ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
            }`}
          >
            {isCredit ? (
              <IconArrowDownLeft className="size-3" />
            ) : (
              <IconArrowUpRight className="size-3" />
            )}
            {val as string}
          </span>
        );
      },
    },
    {
      key: "amount",
      label: "Amount",
      width: 14,
      render: (val, row) => {
        const isCredit = row.type === "CREDIT";
        return (
          <span
            className={`font-bold text-sm ${isCredit ? "text-green-600" : "text-red-500"}`}
          >
            {isCredit ? "+" : "-"}
            {symbol} {(val as number).toLocaleString()}
          </span>
        );
      },
    },
    {
      key: "description",
      label: "Description",
      width: 28,
      render: (val) => (
        <span className="text-sm text-muted-foreground line-clamp-1">
          {(val as string) ?? "—"}
        </span>
      ),
    },
    {
      key: "order",
      label: "Order",
      width: 14,
      render: (val) => {
        const order = typeof val === "object" ? val : null;
        const code = (order as { code?: string })?.code;
        return code ? (
          <span className="font-mono text-xs font-bold text-primary uppercase">
            {code}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      key: "payment_gateway",
      label: "Gateway",
      width: 12,
      render: (val) => (
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
          {(val as string) ?? "—"}
        </Badge>
      ),
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
    title: "Transaction History",
    description: "All credits and debits on your wallet.",
    columns,
    onRefresh: () => {
      fetchWallet();
      fetchRecords(pagination.currentPage, pagination.pageSize);
    },
    actions: {
      default: [],
      additional: [],
    },
    search: {
      fields: ["description"] as (keyof WalletRecord)[],
      placeholder: "Search transactions…",
    },
  };

  return (
    <div className="space-y-5">
      <WalletCard />
      <ListPage
        data={records}
        loading={isLoadingRecords}
        error={recordsError}
        config={listConfig}
        totalItems={pagination.total}
        currentPage={pagination.currentPage}
        pageSize={pagination.pageSize}
        onPageChange={(page) => fetchRecords(page, pagination.pageSize)}
        onPageSizeChange={(size) => fetchRecords(1, size)}
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WalletPage() {
  return (
    <Suspense fallback={<PageSkeleton variant="list" rows={5} />}>
      <WalletContent />
    </Suspense>
  );
}
