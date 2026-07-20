import { Avatar } from "@/components/ui/Avatar";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Header } from "@/components/ui/Header";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { COLORS } from "@/constants/colors";
import { getErrorMessage } from "@/lib/api/api-response";
import { formatPrice } from "@/lib/currency";
import { useAuthStore } from "@/store/auth.store";
import { useEscrowStore } from "@/store/escrow.store";
import { useOrdersStore } from "@/store/orders.store";
import { toast } from "@/store/toast.store";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  PENDING: "warning",
  ACTIVE: "info",
  DELIVERED: "success",
  COMPLETED: "success",
  CANCELLED: "danger",
  REVIEW: "warning",
  REVISION: "warning",
};

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

type SourceConfig = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  badgeBgClass: string;
  badgeTextClass: string;
};

const SOURCE_CONFIGS: Record<string, SourceConfig> = {
  JOB: {
    label: "JOB",
    icon: "briefcase-outline",
    iconColor: "#D97706",
    badgeBgClass:
      "bg-amber-100/90 dark:bg-amber-950/80 border border-amber-300/80 dark:border-amber-800/80",
    badgeTextClass: "text-amber-800 dark:text-amber-300",
  },
  GIG: {
    label: "GIG",
    icon: "cube-outline",
    iconColor: "#4F46E5",
    badgeBgClass:
      "bg-indigo-100/90 dark:bg-indigo-950/80 border border-indigo-300/80 dark:border-indigo-800/80",
    badgeTextClass: "text-indigo-800 dark:text-indigo-300",
  },
  TUITION: {
    label: "TUITION",
    icon: "school-outline",
    iconColor: "#0284C7",
    badgeBgClass:
      "bg-sky-100/90 dark:bg-sky-950/80 border border-sky-300/80 dark:border-sky-800/80",
    badgeTextClass: "text-sky-800 dark:text-sky-300",
  },
  CUSTOM: {
    label: "CUSTOM",
    icon: "sparkles-outline",
    iconColor: "#059669",
    badgeBgClass:
      "bg-emerald-100/90 dark:bg-emerald-950/80 border border-emerald-300/80 dark:border-emerald-800/80",
    badgeTextClass: "text-emerald-800 dark:text-emerald-300",
  },
};

function getSourceConfig(source?: string): SourceConfig {
  const key = (source ?? "").toUpperCase();
  return (
    SOURCE_CONFIGS[key] ?? {
      label: source || "ORDER",
      icon: "document-text-outline",
      iconColor: "#6B7280",
      badgeBgClass:
        "bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
      badgeTextClass: "text-gray-700 dark:text-gray-300",
    }
  );
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isAuthenticated = useAuthStore((s) => s.accessToken !== null);
  const user = useAuthStore((s) => s.user);

  const order = useOrdersStore((s) => s.selectedOrder);
  const isLoadingDetail = useOrdersStore((s) => s.isLoadingDetail);
  const fetchOrderDetail = useOrdersStore((s) => s.fetchOrderDetail);
  const acceptOrder = useOrdersStore((s) => s.acceptOrder);
  const isAccepting = useOrdersStore((s) => s.isAccepting);
  const cancelOrder = useOrdersStore((s) => s.cancelOrder);
  const isCancelling = useOrdersStore((s) => s.isCancelling);
  const deliverOrder = useOrdersStore((s) => s.deliverOrder);
  const isDelivering = useOrdersStore((s) => s.isDelivering);
  const completeOrder = useOrdersStore((s) => s.completeOrder);
  const isCompleting = useOrdersStore((s) => s.isCompleting);
  const clearErrors = useOrdersStore((s) => s.clearErrors);

  const requestDispute = useEscrowStore((s) => s.requestDispute);
  const isDisputing = useEscrowStore((s) => s.isDisputing);

  const [acceptVisible, setAcceptVisible] = useState(false);
  const [completeVisible, setCompleteVisible] = useState(false);
  const [deliverVisible, setDeliverVisible] = useState(false);
  const [cancelVisible, setCancelVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [disputeVisible, setDisputeVisible] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/(auth)/login");
      return;
    }
    if (id) fetchOrderDetail(id);
    return () => clearErrors();
  }, [id, isAuthenticated, fetchOrderDetail, clearErrors]);

  if (isLoadingDetail || !order) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-950">
        <Header title="Order" showBack />
        <View className="gap-4 p-6">
          <Skeleton height={22} width="70%" />
          <Skeleton height={14} width="40%" />
          <Skeleton height={140} rounded="lg" />
        </View>
      </View>
    );
  }

  const isBuyer = user?.id === order.buyer?.id;
  const isSeller = user?.id === order.seller?.id;
  const canAccept = order.status === "PENDING" && isBuyer;
  const canCancel =
    ["PENDING", "ACTIVE"].includes(order.status) && (isBuyer || isSeller);
  const canDeliver = order.status === "ACTIVE" && isSeller;
  const canComplete = order.status === "DELIVERED" && isBuyer;
  const canDispute =
    order.status === "DELIVERED" && isSeller && order.source === "GIG";

  const sourceCfg = getSourceConfig(order.source);

  const handleAccept = async () => {
    try {
      await acceptOrder(order.id);
      toast.success("Order accepted");
      setAcceptVisible(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDeliver = async () => {
    try {
      await deliverOrder(order.id);
      toast.success("Order marked as delivered");
      setDeliverVisible(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleComplete = async () => {
    try {
      await completeOrder(order.id);
      toast.success("Order marked as completed");
      setCompleteVisible(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }
    try {
      await cancelOrder(order.id, cancelReason.trim());
      toast.success("Order cancelled");
      setCancelVisible(false);
      setCancelReason("");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDispute = async () => {
    if (!disputeReason.trim()) {
      toast.error("Please describe the issue");
      return;
    }
    const success = await requestDispute(order.id, disputeReason.trim());
    if (success) {
      toast.success("Dispute raised — an admin will review shortly");
      setDisputeVisible(false);
      setDisputeReason("");
      fetchOrderDetail(order.id);
    } else {
      toast.error("Failed to raise dispute");
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-950">
      <Header title="Order Details" showBack />

      <ScrollView contentContainerClassName="gap-4 px-6 py-5 pb-10">
        <View className="flex-row items-start justify-between gap-2">
          <View className="flex-1 gap-1">
            <View className="flex-row items-center gap-2">
              <View
                className={`flex-row items-center gap-1.5 rounded-full px-2.5 py-0.5 ${sourceCfg.badgeBgClass}`}
              >
                <Ionicons
                  name={sourceCfg.icon}
                  size={11}
                  color={sourceCfg.iconColor}
                />
                <Text
                  className={`text-[10px] font-extrabold tracking-wide ${sourceCfg.badgeTextClass}`}
                >
                  {sourceCfg.label}
                </Text>
              </View>
              <Text className="text-xs font-semibold text-gray-400 dark:text-gray-500">
                {order.code}
              </Text>
            </View>
            <Text className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {order.title}
            </Text>
          </View>
          <Badge variant={STATUS_VARIANTS[order.status] ?? "default"}>
            {order.status}
          </Badge>
        </View>

        <View className="gap-2 rounded-2xl border border-gray-100 p-4 dark:border-gray-800">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              Total Price
            </Text>
            <Text className="text-lg font-bold text-primary">
              {formatPrice(order.total_price)}
            </Text>
          </View>
          {order.amount != null && order.amount !== order.total_price ? (
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                Amount
              </Text>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {formatPrice(order.amount)}
              </Text>
            </View>
          ) : null}
          {order.description ? (
            <Text className="mt-2 text-sm leading-5 text-gray-600 dark:text-gray-300">
              {order.description}
            </Text>
          ) : null}
          {order.note ? (
            <View className="mt-1 rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
              <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Note
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300">
                {order.note}
              </Text>
            </View>
          ) : null}
        </View>

        {order.source === "GIG" && order.gig ? (
          <View className="gap-1.5 rounded-2xl border border-gray-100 p-4 dark:border-gray-800">
            <Text className="text-xs font-medium text-gray-400 dark:text-gray-500">
              Gig
            </Text>
            <Text className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">
              {order.gig.title}
            </Text>
            {order.package ? (
              <Text className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {order.package.toLowerCase()} package
              </Text>
            ) : null}
          </View>
        ) : null}

        {order.source === "JOB" && order.job ? (
          <View className="gap-1.5 rounded-2xl border border-gray-100 p-4 dark:border-gray-800">
            <Text className="text-xs font-medium text-gray-400 dark:text-gray-500">
              Job
            </Text>
            <Text className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">
              {order.job.title}
            </Text>
          </View>
        ) : null}

        {order.status === "CANCELLED" && order.cancellation_reason ? (
          <View className="gap-1 rounded-2xl border border-red-100 bg-red-50/60 p-4 dark:border-red-900/40 dark:bg-red-950/20">
            <Text className="text-xs font-semibold text-red-600 dark:text-red-400">
              Cancellation Reason
            </Text>
            <Text className="text-sm text-red-700 dark:text-red-300">
              {order.cancellation_reason}
            </Text>
          </View>
        ) : null}

        {order.escrow ? (
          <View className="gap-2 rounded-2xl border border-gray-100 p-4 dark:border-gray-800">
            <Text className="text-xs font-medium text-gray-400 dark:text-gray-500">
              Escrow
            </Text>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-gray-600 dark:text-gray-300">
                Payment Status
              </Text>
              <Badge
                variant={
                  order.escrow.payment_status === "HOLDING"
                    ? "info"
                    : order.escrow.payment_status === "RELEASED"
                      ? "success"
                      : "default"
                }
              >
                {order.escrow.payment_status}
              </Badge>
            </View>
          </View>
        ) : null}

        <View className="flex-row gap-3">
          {order.buyer ? (
            <ProfileCard
              label="Buyer"
              name={order.buyer.name}
              avatar={order.buyer.avatar}
            />
          ) : null}
          {order.seller ? (
            <ProfileCard
              label="Seller"
              name={order.seller.name}
              avatar={order.seller.avatar}
            />
          ) : null}
        </View>

        <View className="flex-row items-center gap-1.5">
          <Ionicons name="time-outline" size={13} color={COLORS.gray400} />
          <Text className="text-xs text-gray-400 dark:text-gray-500">
            Created {formatDate(order.created_at)} · Updated{" "}
            {formatDate(order.updated_at)}
          </Text>
        </View>

        <View className="gap-2.5 pt-2">
          {canAccept ? (
            <Button onPress={() => setAcceptVisible(true)}>Accept Order</Button>
          ) : null}
          {canDeliver ? (
            <Button onPress={() => setDeliverVisible(true)}>
              Mark as Delivered
            </Button>
          ) : null}
          {canComplete ? (
            <Button onPress={() => setCompleteVisible(true)}>
              Confirm Completion
            </Button>
          ) : null}
          {canDispute ? (
            <Button variant="outline" onPress={() => setDisputeVisible(true)}>
              Report an Issue
            </Button>
          ) : null}
          {canCancel ? (
            <Button
              variant="destructive"
              onPress={() => setCancelVisible(true)}
            >
              Cancel Order
            </Button>
          ) : null}
        </View>
      </ScrollView>

      <ConfirmModal
        visible={acceptVisible}
        onClose={() => setAcceptVisible(false)}
        onConfirm={handleAccept}
        title="Accept Order"
        description="Accepting this order will move it to active status and work can begin."
        confirmText="Accept"
        variant="primary"
        icon="checkmark-circle-outline"
        isLoading={isAccepting}
      />

      <ConfirmModal
        visible={deliverVisible}
        onClose={() => setDeliverVisible(false)}
        onConfirm={handleDeliver}
        title="Mark as Delivered"
        description="Let the buyer know your work is ready for review."
        confirmText="Mark Delivered"
        variant="primary"
        icon="checkmark-done-outline"
        isLoading={isDelivering}
      />

      <ConfirmModal
        visible={completeVisible}
        onClose={() => setCompleteVisible(false)}
        onConfirm={handleComplete}
        title="Confirm Completion"
        description="This releases payment to the seller and closes the order. Only confirm once you're satisfied with the delivery."
        confirmText="Confirm & Release"
        variant="primary"
        icon="checkmark-circle-outline"
        isLoading={isCompleting}
      />

      <Modal
        visible={cancelVisible}
        onClose={() => setCancelVisible(false)}
        title="Cancel Order"
      >
        <View className="gap-4 pb-4">
          <Input
            label="Cancellation Reason"
            value={cancelReason}
            onChangeText={setCancelReason}
            placeholder="Explain why you're cancelling…"
            multiline
            numberOfLines={4}
            className="min-h-24 py-3"
            textAlignVertical="top"
          />
          <Button
            variant="destructive"
            onPress={handleCancel}
            isLoading={isCancelling}
          >
            Confirm Cancellation
          </Button>
        </View>
      </Modal>

      <Modal
        visible={disputeVisible}
        onClose={() => setDisputeVisible(false)}
        title="Report an Issue"
      >
        <View className="gap-4 pb-4">
          <Input
            label="Describe the issue"
            value={disputeReason}
            onChangeText={setDisputeReason}
            placeholder="What went wrong with this order?"
            multiline
            numberOfLines={4}
            className="min-h-24 py-3"
            textAlignVertical="top"
          />
          <Button onPress={handleDispute} isLoading={isDisputing}>
            Submit Dispute
          </Button>
          <Text className="text-center text-xs text-gray-400 dark:text-gray-500">
            An admin will review your case and resolve the dispute.
          </Text>
        </View>
      </Modal>
    </View>
  );
}

function ProfileCard({
  label,
  name,
  avatar,
}: {
  label: string;
  name?: string | null;
  avatar?: string | null;
}) {
  return (
    <View className="flex-1 flex-row items-center gap-2.5 rounded-2xl border border-gray-100 p-3 dark:border-gray-800">
      <Avatar uri={avatar} name={name} size="sm" />
      <View className="flex-1">
        <Text className="text-[10px] text-gray-400 dark:text-gray-500">
          {label}
        </Text>
        <Text
          numberOfLines={1}
          className="text-xs font-semibold text-gray-900 dark:text-gray-100"
        >
          {name ?? "—"}
        </Text>
      </View>
    </View>
  );
}
