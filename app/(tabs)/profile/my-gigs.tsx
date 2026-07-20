import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Header } from "@/components/ui/Header";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { COLORS } from "@/constants/colors";
import { getErrorMessage } from "@/lib/api/api-response";
import { formatPrice } from "@/lib/currency";
import { useAuthStore } from "@/store/auth.store";
import { useGigsStore } from "@/store/gigs.store";
import { toast } from "@/store/toast.store";
import type { GigListItem } from "@/types/db/gig.types";
import type { Status } from "@/types/generic.types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";


type ManageGigItem = GigListItem & { status: Status };

const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  ACTIVE: "success",
  DRAFT: "default",
  PENDING: "warning",
  ON_HOLD: "warning",
  DELETED: "danger",
};

export default function MyGigsScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);

  const gigs = useGigsStore((s) => s.gigs) as ManageGigItem[];
  const isLoading = useGigsStore((s) => s.isLoadingList);
  const pagination = useGigsStore((s) => s.listPagination);
  const fetchManageGigs = useGigsStore((s) => s.fetchManageGigs);
  const deleteGig = useGigsStore((s) => s.deleteGig);

  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ManageGigItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(
    (page = 1) => {
      fetchManageGigs({ seller: user?.id }, page);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [user?.id],
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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteGig(deleteTarget.id);
      toast.success("Gig deleted");
      setDeleteTarget(null);
      load(1);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-950">
      <Header
        title="My Gigs"
        showBack
        right={
          <Pressable
            hitSlop={8}
            onPress={() => router.push("/(tabs)/profile/create-gig")}
            className="h-9 w-9 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20"
          >
            <Ionicons name="add" size={20} color={COLORS.primary} />
          </Pressable>
        }
      />

      {isLoading && !isLoadingMore && gigs.length === 0 ? (
        <View className="gap-4 px-6 pt-4">
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : (
        <FlatList
          data={gigs}
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
              <Ionicons name="briefcase-outline" size={36} color="#D1D5DB" />
              <Text className="mt-3 text-gray-400 dark:text-gray-500">
                You haven't created any gigs yet
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
            const lowestPrice = item.packages
              ?.map((p) => p.price)
              .filter((p): p is number => p != null)
              .sort((a, b) => a - b)[0];
            return (
              <View className="flex-row gap-3 rounded-2xl border border-gray-100 p-3 dark:border-gray-800">
                <Pressable
                  onPress={() => router.push(`/gig/${item.slug}`)}
                  className="h-20 w-20 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800"
                >
                  {item.images?.[0] ? (
                    <Image
                      source={{ uri: item.images[0] }}
                      className="h-full w-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="h-full w-full items-center justify-center">
                      <Ionicons
                        name="image-outline"
                        size={22}
                        color="#D1D5DB"
                      />
                    </View>
                  )}
                </Pressable>

                <View className="flex-1 gap-1.5">
                  <View className="flex-row items-start justify-between gap-2">
                    <Pressable
                      className="flex-1"
                      onPress={() => router.push(`/gig/${item.slug}`)}
                    >
                      <Text
                        numberOfLines={2}
                        className="text-sm font-semibold text-gray-900 dark:text-gray-100"
                      >
                        {item.title}
                      </Text>
                    </Pressable>
                    <Badge variant={STATUS_VARIANTS[item.status] ?? "default"}>
                      {item.status}
                    </Badge>
                  </View>
                  <Text className="text-xs font-bold text-primary">
                    From {formatPrice(lowestPrice)}
                  </Text>

                  <View className="flex-row gap-2">
                    <ActionButton
                      icon="create-outline"
                      label="Edit"
                      onPress={() =>
                        router.push({
                          pathname: "/(tabs)/profile/create-gig",
                          params: { id: item.id },
                        })
                      }
                    />
                    <ActionButton
                      icon="trash-outline"
                      label="Delete"
                      danger
                      onPress={() => setDeleteTarget(item)}
                    />
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}

      <ConfirmModal
        visible={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Gig"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        icon="trash-outline"
        isLoading={isDeleting}
      />
    </View>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
  danger = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-lg py-2 active:opacity-70 ${
        danger ? "bg-red-50 dark:bg-red-950/30" : "bg-gray-50 dark:bg-gray-900"
      }`}
    >
      <Ionicons
        name={icon}
        size={13}
        color={danger ? "#EF4444" : COLORS.primary}
      />
      <Text
        className={`text-[11px] font-semibold ${danger ? "text-red-500" : "text-primary"}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
