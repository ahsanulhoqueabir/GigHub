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
  borderLeftClass: string;
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
    borderLeftClass: "border-l-4 border-l-amber-500",
    badgeBgClass:
      "bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/60",
    badgeTextClass: "text-amber-700 dark:text-amber-300",
  },
  GIG: {
    label: "GIG",
    icon: "cube-outline",
    iconColor: "#4F46E5",
    borderLeftClass: "border-l-4 border-l-indigo-500",
    badgeBgClass:
      "bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60",
    badgeTextClass: "text-indigo-700 dark:text-indigo-300",
  },
  TUITION: {
    label: "TUITION",
    icon: "school-outline",
    iconColor: "#0284C7",
    borderLeftClass: "border-l-4 border-l-sky-500",
    badgeBgClass:
      "bg-sky-50 dark:bg-sky-950/60 border border-sky-200/80 dark:border-sky-800/60",
    badgeTextClass: "text-sky-700 dark:text-sky-300",
  },
  CUSTOM: {
    label: "CUSTOM",
    icon: "sparkles-outline",
    iconColor: "#059669",
    borderLeftClass: "border-l-4 border-l-emerald-500",
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
      borderLeftClass: "border-l-4 border-l-gray-400",
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

  const isBuyer = user?.id === order.buyer?.id;
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
      className={`overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm shadow-gray-200/50 active:opacity-90 dark:border-gray-800/80 dark:bg-gray-900 dark:shadow-none ${sourceCfg.borderLeftClass}`}
    >
      {/* Header row: Source Badge + Code & Status Badge */}
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
          <Text className="text-[11px] font-semibold text-gray-400 dark:text-gray-500">
            #{order.code}
          </Text>
        </View>

        <Badge variant={STATUS_VARIANTS[order.status] ?? "default"}>
          {order.status}
        </Badge>
      </View>

      {/* Title */}
      <Text
        numberOfLines={2}
        className="mt-2.5 text-base font-bold leading-snug text-gray-900 dark:text-gray-100"
      >
        {order.title}
      </Text>

      {/* Date preview row */}
      <View className="mt-1.5 flex-row items-center gap-1">
        <Ionicons name="calendar-outline" size={12} color="#9CA3AF" />
        <Text className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
          {formatDate(order.created_at)}
        </Text>
      </View>

      {/* Footer row: Counterparty & Price */}
      <View className="mt-3.5 flex-row items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800/70">
        <View className="flex-row items-center gap-2.5">
          <Avatar
            uri={counterparty?.avatar}
            name={counterparty?.name}
            size="sm"
          />
          <View>
            <Text className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              {isBuyer ? "Seller" : "Buyer"}
            </Text>
            <Text
              numberOfLines={1}
              className="max-w-[130px] text-xs font-semibold text-gray-800 dark:text-gray-200"
            >
              {counterparty?.name ?? "—"}
            </Text>
          </View>
        </View>

        <View className="items-end">
          <Text className="text-base font-extrabold text-gray-900 dark:text-gray-100">
            {formatPrice(order.total_price)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
