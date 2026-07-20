import { Badge } from "@/components/ui/Badge";
import { Header } from "@/components/ui/Header";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { COLORS } from "@/constants/colors";
import { useWalletStore } from "@/store/wallet.store";
import type { WalletRecord } from "@/types/db/wallet-record.types";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function RecordRow({ item }: { item: WalletRecord }) {
  const isCredit = item.type === "CREDIT";

  return (
    <View className="flex-row items-center gap-3 border-b border-gray-100 px-6 py-4 dark:border-gray-800">
      <View
        className={`h-11 w-11 items-center justify-center rounded-full ${
          isCredit
            ? "bg-green-100 dark:bg-green-900/40"
            : "bg-red-100 dark:bg-red-900/40"
        }`}
      >
        <Ionicons
          name={isCredit ? "arrow-down" : "arrow-up"}
          size={18}
          color={isCredit ? "#16A34A" : "#DC2626"}
        />
      </View>

      <View className="flex-1">
        <Text
          numberOfLines={1}
          className="text-[15px] font-medium text-gray-900 dark:text-gray-100"
        >
          {item.description || item.payment_method}
        </Text>
        <View className="mt-1 flex-row items-center gap-2">
          <Text className="text-xs text-gray-400 dark:text-gray-500">
            {formatDate(item.created_at)}
          </Text>
          <Badge variant="default">{item.payment_gateway}</Badge>
        </View>
      </View>

      <Text
        className={`text-[15px] font-semibold ${isCredit ? "text-green-600" : "text-red-600"}`}
      >
        {isCredit ? "+" : "-"}
        {item.amount.toFixed(2)}
      </Text>
    </View>
  );
}

export default function WalletScreen() {
  const wallet = useWalletStore((s) => s.wallet);
  const isLoadingWallet = useWalletStore((s) => s.isLoadingWallet);
  const fetchWallet = useWalletStore((s) => s.fetchWallet);

  const records = useWalletStore((s) => s.records);
  const isLoadingRecords = useWalletStore((s) => s.isLoadingRecords);
  const pagination = useWalletStore((s) => s.pagination);
  const fetchRecords = useWalletStore((s) => s.fetchRecords);

  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    fetchWallet();
    fetchRecords(1);
  }, [fetchWallet, fetchRecords]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchWallet(), fetchRecords(1)]);
    setRefreshing(false);
  }, [fetchWallet, fetchRecords]);

  const onEndReached = useCallback(async () => {
    if (isLoadingMore || isLoadingRecords || !pagination.hasNext) return;
    setIsLoadingMore(true);
    await fetchRecords(pagination.currentPage + 1);
    setIsLoadingMore(false);
  }, [fetchRecords, isLoadingMore, isLoadingRecords, pagination]);

  return (
    <View className="flex-1 bg-white dark:bg-gray-950">
      <Header title="Wallet" showBack />

      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RecordRow item={item} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        onEndReachedThreshold={0.4}
        onEndReached={onEndReached}
        ListHeaderComponent={
          <View className="px-6 pb-2 pt-6">
            {isLoadingWallet && !wallet ? (
              <SkeletonCard />
            ) : (
              <View className="rounded-2xl bg-primary p-5">
                <Text className="text-sm text-primary-foreground/80">
                  Available Balance
                </Text>
                <Text className="mt-1 text-3xl font-bold text-primary-foreground">
                  {wallet
                    ? `${wallet.currency} ${wallet.balance.toFixed(2)}`
                    : "—"}
                </Text>
              </View>
            )}
            <Text className="mb-1 mt-6 text-sm font-semibold text-gray-900 dark:text-gray-100">
              Transaction History
            </Text>
          </View>
        }
        ListEmptyComponent={
          !isLoadingRecords ? (
            <View className="items-center px-6 py-16">
              <Ionicons name="receipt-outline" size={36} color="#D1D5DB" />
              <Text className="mt-3 text-gray-400 dark:text-gray-500">
                No transactions yet
              </Text>
            </View>
          ) : (
            <View className="px-6">
              <SkeletonCard />
            </View>
          )
        }
        ListFooterComponent={
          isLoadingMore ? (
            <View className="py-4">
              <ActivityIndicator color={COLORS.primary} />
            </View>
          ) : null
        }
      />
    </View>
  );
}
