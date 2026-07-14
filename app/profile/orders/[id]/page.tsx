"use client";

import {
  AcceptOrderDialog,
  CancelOrderDialog,
  DeliverOrderDialog,
  DisputeOrderDialog,
  OrderActionError,
  OrderAssociatedGigCard,
  OrderAssociatedJobCard,
  OrderCancellationCard,
  OrderDetailHeader,
  OrderDetailsCard,
  OrderIdCard,
  OrderProfileCard,
  OrderProposalCard,
  OrderTimelineCard,
} from "@/components/profile/orders/detail";
import { ErrorState } from "@/components/shared/error-state";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/hooks/use-currency";
import { useAuthStore } from "@/store/auth.store";
import { useOrdersStore } from "@/store/orders.store";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

// ─── Main Content ─────────────────────────────────────────────────────────────

function OrderDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { symbol } = useCurrency();
  const { user } = useAuthStore();

  const {
    selectedOrder: order,
    isLoadingDetail,
    detailError,
    isAccepting,
    acceptError,
    isCancelling,
    cancelError,
    isDelivering,
    deliverError,
    isDisputing,
    disputeError,
    fetchOrderDetail,
    acceptOrder,
    cancelOrder,
    deliverOrder,
    requestDispute,
    clearErrors,
  } = useOrdersStore();

  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isDeliverDialogOpen, setIsDeliverDialogOpen] = useState(false);
  const [isDisputeDialogOpen, setIsDisputeDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [disputeReason, setDisputeReason] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchOrderDetail(id);
    return () => clearErrors();
  }, [id, fetchOrderDetail, clearErrors]);

  useEffect(() => {
    const paymentStatus = searchParams?.get("payment");
    const reason = searchParams?.get("reason");

    if (paymentStatus) {
      if (paymentStatus === "success") {
        toast.success("Payment successful! Your order is now active.");
      } else if (paymentStatus === "failed") {
        toast.error(`Payment failed: ${reason || "Unknown error"}`);
      } else if (paymentStatus === "cancelled") {
        toast.error("Payment was cancelled.");
      } else if (paymentStatus === "error") {
        toast.error("An error occurred during payment processing.");
      }

      // Clean up the URL
      const url = new URL(window.location.href);
      url.searchParams.delete("payment");
      url.searchParams.delete("reason");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchOrderDetail(id);
    } finally {
      setIsRefreshing(false);
    }
  }, [id, fetchOrderDetail]);

  const handleAcceptConfirm = useCallback(async () => {
    try {
      await acceptOrder(id);
      toast.success("Order accepted successfully");
      setIsAcceptDialogOpen(false);
    } catch {
      // Error handled by store
    }
  }, [id, acceptOrder]);

  const handleDeliverConfirm = useCallback(async () => {
    try {
      await deliverOrder(id);
      toast.success("Order marked as delivered");
      setIsDeliverDialogOpen(false);
    } catch {
      // Error handled by store
    }
  }, [id, deliverOrder]);

  const handleCancelConfirm = useCallback(async () => {
    if (!cancelReason.trim()) return;
    try {
      await cancelOrder(id, cancelReason);
      toast.success("Order cancelled successfully");
      setIsCancelDialogOpen(false);
      setCancelReason("");
    } catch {
      // Error handled by store
    }
  }, [id, cancelReason, cancelOrder]);

  const handleDisputeConfirm = useCallback(async () => {
    if (!disputeReason.trim()) return;
    try {
      await requestDispute(id, disputeReason);
      toast.success(
        "Dispute raised successfully. An admin will review your case.",
      );
      setIsDisputeDialogOpen(false);
      setDisputeReason("");
    } catch {
      // Error handled by store
    }
  }, [id, disputeReason, requestDispute]);

  if (isLoadingDetail) {
    return <PageSkeleton variant="details" rows={6} columns={2} />;
  }

  if (detailError) {
    return (
      <ErrorState
        message={detailError}
        onRetry={() => fetchOrderDetail(id)}
        onBack={() => router.back()}
      />
    );
  }

  if (!order) {
    return (
      <ErrorState
        type="not-found"
        heading="Order not found"
        message="This order may have been deleted or you don't have access to it."
        onBack={() => router.back()}
      />
    );
  }

  const isBuyer = user?.id === order.buyer?.id;
  const isSeller = user?.id === order.seller?.id;
  const canAccept = order.status === "PENDING" && isBuyer;
  const canCancel =
    ["PENDING", "ACTIVE"].includes(order.status) && (isBuyer || isSeller);
  const canDeliver = order.status === "ACTIVE" && isSeller;
  const canDispute =
    order.status === "DELIVERED" && isSeller && order.source === "GIG";

  return (
    <div className="space-y-6 pb-10">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <OrderDetailHeader
        code={order.code}
        source={order.source}
        status={order.status}
        created_at={order.created_at}
        updated_at={order.updated_at}
        onBack={() => router.back()}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        canAccept={canAccept}
        canCancel={canCancel}
        canDeliver={canDeliver}
        canDispute={canDispute}
        isAccepting={isAccepting}
        isCancelling={isCancelling}
        isDelivering={isDelivering}
        isDisputing={isDisputing}
        onAcceptClick={() => setIsAcceptDialogOpen(true)}
        onCancelClick={() => setIsCancelDialogOpen(true)}
        onDeliverClick={() => setIsDeliverDialogOpen(true)}
        onDisputeClick={() => setIsDisputeDialogOpen(true)}
      />

      {/* ── Action Errors ─────────────────────────────────────────────────── */}
      <OrderActionError
        message={acceptError || cancelError || deliverError || disputeError}
      />

      {/* ── Main Grid ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Order details (2/3 width) */}
        <div className="lg:col-span-2 space-y-5">
          <OrderDetailsCard
            totalPrice={order.total_price}
            amount={order.amount}
            symbol={symbol}
            description={order.description}
            note={order.note}
            title={order.title}
          />

          {order.source === "GIG" && order.gig && (
            <OrderAssociatedGigCard
              gig={order.gig}
              packageTier={order.package}
              symbol={symbol}
            />
          )}

          {order.source === "JOB" && order.job && (
            <OrderAssociatedJobCard job={order.job} />
          )}

          {order.source === "JOB" && order.proposal && (
            <OrderProposalCard proposal={order.proposal} />
          )}

          {order.status === "CANCELLED" && (
            <OrderCancellationCard
              reason={order.cancellation_reason}
              cancelledAt={order.cancellation_request_at}
            />
          )}
        </div>

        {/* Right column: Profiles + timestamps */}
        <div className="space-y-5">
          {order.buyer && (
            <OrderProfileCard
              label="Buyer"
              profile={order.buyer}
              orderId={order.id}
            />
          )}
          {order.seller && (
            <OrderProfileCard
              label="Seller"
              profile={order.seller}
              orderId={order.id}
            />
          )}
          <OrderTimelineCard
            created_at={order.created_at}
            updated_at={order.updated_at}
          />
          <OrderIdCard id={order.id} />
        </div>
      </div>

      <AcceptOrderDialog
        open={isAcceptDialogOpen}
        onOpenChange={setIsAcceptDialogOpen}
        isAccepting={isAccepting}
        onConfirm={handleAcceptConfirm}
      />

      <CancelOrderDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        reason={cancelReason}
        onReasonChange={setCancelReason}
        isCancelling={isCancelling}
        onConfirm={handleCancelConfirm}
      />

      <DeliverOrderDialog
        open={isDeliverDialogOpen}
        onOpenChange={setIsDeliverDialogOpen}
        isDelivering={isDelivering}
        onConfirm={handleDeliverConfirm}
      />

      <DisputeOrderDialog
        open={isDisputeDialogOpen}
        onOpenChange={setIsDisputeDialogOpen}
        reason={disputeReason}
        onReasonChange={setDisputeReason}
        isDisputing={isDisputing}
        onConfirm={handleDisputeConfirm}
      />
    </div>
  );
}

// ─── Skeleton wrapper ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-60 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <OrderDetailContent id={id} />
    </Suspense>
  );
}
