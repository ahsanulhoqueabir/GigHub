import { Avatar } from "@/components/ui/Avatar";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/currency";
import { useAuthStore } from "@/store/auth.store";
import type { OrderListItem } from "@/store/orders.store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

type SourceConfig = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  badgeBgClass: string;
  badgeTextClass: string;
};

const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  PENDING: "warning",
  ACTIVE: "info",
  DELIVERED: "success",
  COMPLETED: "success",
  CANCELLED: "danger",
  REVIEW: "warning",
  REVISION: "warning",
};

const SOURCE_CONFIGS: Record<string, SourceConfig> = {
  JOB: {
    label: "JOB",
    icon: "briefcase-outline",
    iconColor: "#D97706",
    badgeBgClass:
      "bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/60",
    badgeTextClass: "text-amber-700 dark:text-amber-300",
  },
  GIG: {
    label: "GIG",
    icon: "cube-outline",
    iconColor: "#4F46E5",
    badgeBgClass:
      "bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60",
    badgeTextClass: "text-indigo-700 dark:text-indigo-300",
  },
  TUITION: {
    label: "TUITION",
    icon: "school-outline",
    iconColor: "#0284C7",
    badgeBgClass:
      "bg-sky-50 dark:bg-sky-950/60 border border-sky-200/80 dark:border-sky-800/60",
    badgeTextClass: "text-sky-700 dark:text-sky-300",
  },
  CUSTOM: {
    label: "CUSTOM",
    icon: "sparkles-outline",
    iconColor: "#059669",
    badgeBgClass:
      "bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60",
    badgeTextClass: "text-emerald-700 dark:text-emerald-300",
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

function formatDate(value?: string) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface SwipeableOrderCardProps {
  order: OrderListItem;
}

export function SwipeableOrderCard({ order }: SwipeableOrderCardProps) {
  const user = useAuthStore((s) => s.user);

  const currentUserId = user?.id || (user as any)?._id;
  const buyerId = order.buyer?.id || (order.buyer as any)?._id;
  const isBuyer = Boolean(
    currentUserId && buyerId && currentUserId === buyerId,
  );
  const counterparty = isBuyer ? order.seller : order.buyer;
  const sourceCfg = getSourceConfig(order.source);

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/order/[id]",
          params: { id: order.id },
        })
      }
      className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm shadow-gray-200/60 active:opacity-90 dark:border-gray-800/80 dark:bg-gray-900 dark:shadow-none"
    >
      {/* Header row: Source Tag + Order Code & Status Badge */}
      <View className="flex-row items-center justify-between gap-2">
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
          <View className="rounded-full bg-gray-100 px-2 py-0.5 dark:bg-gray-800/80">
            <Text className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
              #{order.code}
            </Text>
          </View>
        </View>

        <Badge variant={STATUS_VARIANTS[order.status] ?? "default"}>
          {order.status}
        </Badge>
      </View>

      {/* Title */}
      <Text
        numberOfLines={2}
        className="mt-3 text-base font-bold leading-snug text-gray-900 dark:text-gray-100"
      >
        {order.title}
      </Text>

      {/* Date preview row */}
      <View className="mt-1.5 flex-row items-center gap-1.5">
        <Ionicons name="calendar-outline" size={13} color="#9CA3AF" />
        <Text className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
          {formatDate(order.created_at)}
        </Text>
      </View>

      {/* Footer row: Counterparty & Price embedded panel */}
      <View className="mt-3.5 flex-row items-center justify-between rounded-xl border border-gray-100/90 bg-gray-50/80 px-3 py-2.5 dark:border-gray-800/60 dark:bg-gray-850/50">
        <View className="flex-row items-center gap-2.5">
          <Avatar
            uri={counterparty?.avatar}
            name={counterparty?.name}
            size="sm"
          />
          <View>
            <Text className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              {isBuyer ? "Seller" : "Buyer"}
            </Text>
            <Text
              numberOfLines={1}
              className="max-w-[125px] text-xs font-bold text-gray-800 dark:text-gray-200"
            >
              {counterparty?.name ?? "—"}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          <Text className="text-base font-black text-gray-900 dark:text-emerald-400">
            {formatPrice(order.total_price)}
          </Text>
          <View className="h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700/60">
            <Ionicons name="chevron-forward" size={12} color="#6B7280" />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

