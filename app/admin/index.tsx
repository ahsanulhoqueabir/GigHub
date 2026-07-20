import { Header } from "@/components/ui/Header";
import { Skeleton } from "@/components/ui/Skeleton";
import { COLORS } from "@/constants/colors";
import { formatPrice } from "@/lib/currency";
import { useAdminDashboardStore } from "@/store/admin-dashboard.store";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

type StatCardConfig = {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  bgClass: string;
};

export default function AdminDashboardScreen() {
  const data = useAdminDashboardStore((s) => s.data);
  const isLoading = useAdminDashboardStore((s) => s.isLoading);
  const fetchDashboard = useAdminDashboardStore((s) => s.fetchDashboard);

  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [fetchDashboard]),
  );

  const stats = data?.stats;

  const cards: StatCardConfig[] = stats
    ? [
        {
          label: "Total Users",
          value: stats.total_users.toLocaleString(),
          icon: "people-outline",
          iconColor: "#4F46E5",
          bgClass: "bg-indigo-50 dark:bg-indigo-950/40",
        },
        {
          label: "Active Gigs",
          value: stats.active_gigs.toLocaleString(),
          icon: "cube-outline",
          iconColor: "#0284C7",
          bgClass: "bg-sky-50 dark:bg-sky-950/40",
        },
        {
          label: "Active Jobs",
          value: stats.active_jobs.toLocaleString(),
          icon: "briefcase-outline",
          iconColor: "#D97706",
          bgClass: "bg-amber-50 dark:bg-amber-950/40",
        },
        {
          label: "Total Orders",
          value: stats.total_orders.toLocaleString(),
          icon: "receipt-outline",
          iconColor: "#059669",
          bgClass: "bg-emerald-50 dark:bg-emerald-950/40",
        },
        {
          label: "Total Revenue",
          value: formatPrice(stats.total_revenue),
          icon: "cash-outline",
          iconColor: "#0D652D",
          bgClass: "bg-green-50 dark:bg-green-950/40",
        },
        {
          label: "Escrow Held",
          value: formatPrice(stats.total_escrow),
          icon: "lock-closed-outline",
          iconColor: "#A50E0E",
          bgClass: "bg-red-50 dark:bg-red-950/40",
        },
        {
          label: "Pending Orders",
          value: stats.pending_orders.toLocaleString(),
          icon: "time-outline",
          iconColor: "#D97706",
          bgClass: "bg-amber-50 dark:bg-amber-950/40",
        },
        {
          label: "Avg Rating",
          value: stats.avg_rating.toFixed(1),
          icon: "star-outline",
          iconColor: "#CA8A04",
          bgClass: "bg-yellow-50 dark:bg-yellow-950/40",
        },
      ]
    : [];

  return (
    <View className="flex-1 bg-white dark:bg-gray-950">
      <Header title="Admin Dashboard" showBack hideAuthControls />

      <ScrollView
        contentContainerClassName="gap-4 px-4 py-5 pb-10"
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchDashboard}
            tintColor={COLORS.primary}
          />
        }
      >
        <UsersLinkCard />

        {isLoading && !data ? (
          <View className="flex-row flex-wrap gap-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} width="47%" height={92} rounded="lg" />
            ))}
          </View>
        ) : (
          <View className="flex-row flex-wrap gap-3">
            {cards.map((card) => (
              <View
                key={card.label}
                className="min-w-[47%] flex-1 gap-2 rounded-2xl border border-gray-100 p-4 dark:border-gray-800"
              >
                <View
                  className={`h-9 w-9 items-center justify-center rounded-full ${card.bgClass}`}
                >
                  <Ionicons name={card.icon} size={18} color={card.iconColor} />
                </View>
                <Text className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {card.value}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {card.label}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function UsersLinkCard() {
  return (
    <Pressable
      onPress={() => router.push("/admin/users")}
      className="flex-row items-center justify-between rounded-2xl border border-gray-100 p-4 active:bg-gray-50 dark:border-gray-800 dark:active:bg-gray-900"
    >
      <View className="flex-1">
        <Text className="text-sm font-bold text-gray-900 dark:text-gray-100">
          User Management
        </Text>
        <Text className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          Search, ban, and manage platform users
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.gray400} />
    </Pressable>
  );
}
