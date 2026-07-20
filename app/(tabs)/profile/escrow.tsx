import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Header } from "@/components/ui/Header";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { COLORS } from "@/constants/colors";
import { formatPrice } from "@/lib/currency";
import { useAuthStore } from "@/store/auth.store";
import { useEscrowStore } from "@/store/escrow.store";
import type { Escrow } from "@/types/db/escrow.types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";


const PAYMENT_STATUS_VARIANTS: Record<string, BadgeVariant> = {
  UNPAID: "default",
  HOLDING: "info",
  RELEASED: "success",
  REFUNDED: "warning",
};

function formatDate(value?: string) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function orderId(order: Escrow["order"]): string | null {
  if (!order) return null;
  return typeof order === "string" ? order : (order.id ?? null);
}

export default function EscrowScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);

  const escrows = useEscrowStore((s) => s.escrows);
  const isLoading = useEscrowStore((s) => s.isLoading);
  const pagination = useEscrowStore((s) => s.pagination);
  const fetchMyEscrows = useEscrowStore((s) => s.fetchMyEscrows);

  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const load = useCallback(
    (page = 1) => {
      fetchMyEscrows(page);
    },
    [fetchMyEscrows],
  );

  useEffect(() => {
    load(1);
  }, [load]);

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

  return (
    <View className="flex-1 bg-white dark:bg-gray-950">
      <Header title="Escrow Protection" showBack />

      {isLoading && !isLoadingMore && escrows.length === 0 ? (
        <View className="gap-4 px-6 pt-4">
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : (
        <FlatList
          data={escrows}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingBottom: Math.max(insets.bottom + 24, 32),
          }}
          contentContainerClassName="gap-3 px-6 pt-4"

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
              <Ionicons
                name="shield-checkmark-outline"
                size={36}
                color="#D1D5DB"
              />
              <Text className="mt-3 text-gray-400 dark:text-gray-500">
                No escrow transactions yet
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
          renderItem={({ item }) => {
            const senderId =
              typeof item.sender === "string" ? item.sender : item.sender?.id;
            const isSender = senderId === user?.id;
            const id = orderId(item.order);
            return (
              <Pressable
                onPress={() =>
                  id && router.push({ pathname: "/order/[id]", params: { id } })
                }
                className="gap-2.5 rounded-2xl border border-gray-100 p-4 active:opacity-80 dark:border-gray-800"
              >
                <View className="flex-row items-start justify-between gap-2">
                  <View className="flex-row items-center gap-1.5">
                    <Ionicons
                      name={isSender ? "arrow-up-circle" : "arrow-down-circle"}
                      size={16}
                      color={isSender ? "#EF4444" : COLORS.primary}
                    />
                    <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {isSender ? "Payment Sent" : "Payment Received"}
                    </Text>
                  </View>
                  <Badge
                    variant={
                      PAYMENT_STATUS_VARIANTS[item.payment_status] ?? "default"
                    }
                  >
                    {item.payment_status}
                  </Badge>
                </View>

                <View className="flex-row items-center justify-between">
                  <Text className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {formatPrice(item.amount)}
                  </Text>
                  <Text className="text-xs text-gray-400 dark:text-gray-500">
                    {formatDate(item.created_at)}
                  </Text>
                </View>

                {item.platform_fee ? (
                  <Text className="text-xs text-gray-400 dark:text-gray-500">
                    Platform fee: {formatPrice(item.platform_fee)}
                  </Text>
                ) : null}

                {item.disputed_at ? (
                  <View className="flex-row items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 dark:bg-amber-950/30">
                    <Ionicons
                      name="alert-circle-outline"
                      size={13}
                      color={COLORS.warning}
                    />
                    <Text className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
                      Under dispute review
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}
