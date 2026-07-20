import { SwipeableOrderCard } from "@/components/orders/SwipeableOrderCard";
import { Button } from "@/components/ui";
import { Header } from "@/components/ui/Header";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { COLORS } from "@/constants/colors";
import { useAuthStore } from "@/store/auth.store";
import { useOrdersStore } from "@/store/orders.store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

type OrderFilter =
  | "ALL"
  | "PENDING"
  | "ACTIVE"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED"
  | "REVIEW";

const FILTERS: { value: OrderFilter; label: string; dotColor?: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending", dotColor: "#F59E0B" },
  { value: "ACTIVE", label: "Active", dotColor: "#0EA5E9" },
  { value: "DELIVERED", label: "Delivered", dotColor: "#10B981" },
  { value: "REVIEW", label: "In Review", dotColor: "#8B5CF6" },
  { value: "COMPLETED", label: "Completed", dotColor: "#059669" },
  { value: "CANCELLED", label: "Cancelled", dotColor: "#EF4444" },
];

export default function OrdersScreen() {
  const isAuthenticated = useAuthStore((s) => s.accessToken !== null);

  const orders = useOrdersStore((s) => s.orders);
  const isLoading = useOrdersStore((s) => s.isLoading);
  const pagination = useOrdersStore((s) => s.pagination);
  const fetchOrders = useOrdersStore((s) => s.fetchOrders);

  const [filter, setFilter] = useState<OrderFilter>("ALL");
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const load = useCallback(
    (page = 1) => {
      const filters = filter === "ALL" ? undefined : { status: filter };
      fetchOrders(page, 20, filters);
    },
    [filter, fetchOrders],
  );

  useEffect(() => {
    if (isAuthenticated) load(1);
  }, [isAuthenticated, load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    load(1);
    setRefreshing(false);
  }, [load]);

  const onEndReached = () => {
    if (isLoadingMore || isLoading || !pagination.hasNext) return;
    setIsLoadingMore(true);
    load(pagination.currentPage + 1);
    setIsLoadingMore(false);
  };

  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-950">
        <Header title="Orders" />
        <View className="flex-1 items-center justify-center gap-3 px-10">
          <Ionicons name="briefcase-outline" size={40} color="#D1D5DB" />
          <Text className="text-center text-gray-400 dark:text-gray-500">
            Log in to view your orders
          </Text>
          <Button
            variant="primary"
            className="mt-2 px-8"
            onPress={() => router.push("/(auth)/login")}
          >
            Sign In
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-gray-950">
      <Header title="Orders" />

      {/* Top Status Selection Pills */}
      <View className="border-b border-gray-100 dark:border-gray-900">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 px-6 py-3"
        >
          {FILTERS.map((f) => {
            const isActive = filter === f.value;
            return (
              <Pressable
                key={f.value}
                onPress={() => setFilter(f.value)}
                className={`flex-row items-center gap-1.5 rounded-full px-3.5 py-1.5 border ${
                  isActive
                    ? "bg-primary border-primary dark:bg-emerald-600 dark:border-emerald-500 shadow-sm"
                    : "bg-gray-100 dark:bg-gray-900 border-gray-200/80 dark:border-gray-800"
                }`}
              >
                {!isActive && f.dotColor ? (
                  <View
                    style={{ backgroundColor: f.dotColor }}
                    className="h-2 w-2 rounded-full"
                  />
                ) : null}
                <Text
                  className={`text-xs font-bold ${
                    isActive ? "text-white" : "text-gray-700 dark:text-gray-200"
                  }`}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {isLoading && !isLoadingMore && orders.length === 0 ? (
        <View className="gap-4 px-6 pt-4">
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-3.5 px-6 py-4 pb-8"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
          onEndReachedThreshold={0.4}
          onEndReached={onEndReached}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Ionicons name="receipt-outline" size={36} color="#D1D5DB" />
              <Text className="mt-3 text-gray-400 dark:text-gray-500">
                No orders found
              </Text>
            </View>
          }
          ListFooterComponent={
            isLoadingMore ? (
              <View className="py-4">
                <ActivityIndicator color={COLORS.primary} />
              </View>
            ) : null
          }
          renderItem={({ item }) => <SwipeableOrderCard order={item} />}
        />
      )}
    </View>
  );
}
