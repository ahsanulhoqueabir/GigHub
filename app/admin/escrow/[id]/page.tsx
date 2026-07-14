"use client";

import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/hooks/use-currency";
import { formatShortDate } from "@/lib/date.utils";
import { useAdminEscrowStore } from "@/store/admin-escrow.store";
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconCheck,
  IconClock,
  IconShield,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

interface ResolveDisputePageProps {
  params: Promise<{ id: string }>;
}

export default function ResolveDisputePage({
  params,
}: ResolveDisputePageProps) {
  const router = useRouter();
  const { symbol } = useCurrency();
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const {
    selectedEscrow,
    isLoadingDetail,
    detailError,
    isResolving,
    resolveError,
    resolveSuccess,
    fetchEscrowByOrder,
    resolveDispute,
    clearErrors,
  } = useAdminEscrowStore();

  const [adminNote, setAdminNote] = useState("");
  const [showConfirm, setShowConfirm] = useState<"RELEASE" | "REFUND" | null>(
    null,
  );

  useEffect(() => {
    if (orderId) {
      fetchEscrowByOrder(orderId);
    }
    return () => clearErrors();
  }, [orderId, fetchEscrowByOrder, clearErrors]);

  useEffect(() => {
    if (resolveSuccess) {
      setTimeout(() => router.push("/admin/escrow/disputes"), 1500);
    }
  }, [resolveSuccess, router]);

  const handleResolve = async (resolution: "RELEASE" | "REFUND") => {
    const success = await resolveDispute(orderId, resolution, adminNote);
    if (success) setShowConfirm(null);
  };

  if (isLoadingDetail) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (detailError || !selectedEscrow) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <IconAlertTriangle className="size-12 text-destructive" />
        <p className="text-muted-foreground">
          {detailError ?? "Escrow record not found"}
        </p>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const escrow = selectedEscrow;
  const order = typeof escrow.order === "object" ? escrow.order : null;
  const sender = typeof escrow.sender === "object" ? escrow.sender : null;
  const receiver = typeof escrow.receiver === "object" ? escrow.receiver : null;

  const netAmount = escrow.amount - escrow.platform_fee;
  const isResolvable = escrow.status === "REVIEW";

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="cursor-pointer"
        >
          <IconArrowLeft className="size-4 mr-1" />
          Back
        </Button>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <IconShield className="size-5 text-amber-500" />
            Resolve Dispute
          </h1>
          <p className="text-sm text-muted-foreground">
            Order:{" "}
            <span className="font-mono font-semibold text-primary uppercase">
              {(order as { code?: string })?.code ?? orderId}
            </span>
          </p>
        </div>
      </div>

      {/* Escrow Summary Card */}
      <div className="rounded-2xl border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold">Escrow Details</h2>
          <StatusBadge status={escrow.status} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Total Amount</p>
            <p className="font-bold text-lg">
              {symbol} {escrow.amount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Platform Fee</p>
            <p className="font-semibold text-destructive">
              {symbol} {escrow.platform_fee.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Net to Seller</p>
            <p className="font-bold text-green-600">
              {symbol} {netAmount.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="flex items-center gap-2">
            <IconUser className="size-4 text-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground">Buyer</p>
              <p className="text-sm font-medium">
                {(sender as { name?: string })?.name ?? "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <IconUser className="size-4 text-emerald-500" />
            <div>
              <p className="text-xs text-muted-foreground">Seller</p>
              <p className="text-sm font-medium">
                {(receiver as { name?: string })?.name ?? "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dispute Details */}
      {escrow.dispute_reason && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-5 space-y-2">
          <div className="flex items-center gap-2">
            <IconAlertTriangle className="size-4 text-amber-600" />
            <h3 className="text-sm font-bold text-amber-800 dark:text-amber-400">
              Seller&apos;s Dispute Reason
            </h3>
            {escrow.disputed_at && (
              <div className="ml-auto flex items-center gap-1 text-xs text-amber-600">
                <IconClock className="size-3" />
                {formatShortDate(escrow.disputed_at)}
              </div>
            )}
          </div>
          <p className="text-sm text-amber-900 dark:text-amber-300 leading-relaxed">
            {escrow.dispute_reason}
          </p>
        </div>
      )}

      {/* Resolution Panel */}
      {isResolvable && (
        <div className="rounded-2xl border bg-card p-6 space-y-5">
          <h2 className="text-base font-bold">Resolution</h2>

          {/* Admin Note */}
          <div className="space-y-2">
            <label
              htmlFor="admin-note"
              className="text-sm font-medium text-muted-foreground"
            >
              Admin Note <span className="text-xs font-normal">(optional)</span>
            </label>
            <textarea
              id="admin-note"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Provide a note explaining your decision…"
              rows={3}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Resolve Error */}
          {resolveError && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-xl px-4 py-2.5">
              <IconAlertTriangle className="size-4 shrink-0" />
              {resolveError}
            </div>
          )}

          {/* Success */}
          {resolveSuccess && (
            <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 dark:bg-green-950/20 rounded-xl px-4 py-2.5">
              <IconCheck className="size-4 shrink-0" />
              Dispute resolved! Redirecting…
            </div>
          )}

          {/* Action Buttons */}
          {!resolveSuccess && (
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              {/* Release to Seller */}
              {showConfirm === "RELEASE" ? (
                <div className="flex items-center gap-2 flex-1">
                  <p className="text-xs text-muted-foreground flex-1">
                    Release{" "}
                    <strong>
                      {symbol} {netAmount.toLocaleString()}
                    </strong>{" "}
                    to seller?
                  </p>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleResolve("RELEASE")}
                    disabled={isResolving}
                    className="bg-green-600 hover:bg-green-700 cursor-pointer"
                  >
                    <IconCheck className="size-3.5 mr-1" />
                    {isResolving ? "Processing…" : "Confirm Release"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowConfirm(null)}
                    disabled={isResolving}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white cursor-pointer rounded-xl"
                  onClick={() => setShowConfirm("RELEASE")}
                  disabled={isResolving}
                >
                  <IconCheck className="size-4 mr-2" />
                  Release to Seller ({symbol} {netAmount.toLocaleString()})
                </Button>
              )}

              {/* Refund to Buyer */}
              {showConfirm === "REFUND" ? (
                <div className="flex items-center gap-2 flex-1">
                  <p className="text-xs text-muted-foreground flex-1">
                    Refund{" "}
                    <strong>
                      {symbol} {escrow.amount.toLocaleString()}
                    </strong>{" "}
                    to buyer?
                  </p>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleResolve("REFUND")}
                    disabled={isResolving}
                    className="cursor-pointer"
                  >
                    <IconX className="size-3.5 mr-1" />
                    {isResolving ? "Processing…" : "Confirm Refund"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowConfirm(null)}
                    disabled={isResolving}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="destructive"
                  className="flex-1 cursor-pointer rounded-xl"
                  onClick={() => setShowConfirm("REFUND")}
                  disabled={isResolving}
                >
                  <IconX className="size-4 mr-2" />
                  Refund to Buyer ({symbol} {escrow.amount.toLocaleString()})
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Already Resolved */}
      {!isResolvable && (
        <div className="rounded-2xl border bg-muted/40 p-6 text-center space-y-2">
          <StatusBadge status={escrow.status} />
          <p className="text-sm text-muted-foreground mt-2">
            This escrow has already been resolved.
          </p>
          {escrow.admin_note && (
            <div className="mt-3 text-left">
              <p className="text-xs text-muted-foreground font-medium">
                Admin Note:
              </p>
              <p className="text-sm mt-1">{escrow.admin_note}</p>
            </div>
          )}
          {escrow.resolved_at && (
            <p className="text-xs text-muted-foreground">
              Resolved: {formatShortDate(escrow.resolved_at)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
