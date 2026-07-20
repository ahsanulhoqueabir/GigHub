import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Header } from "@/components/ui/Header";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { COLORS } from "@/constants/colors";
import { getErrorMessage } from "@/lib/api/api-response";
import { CURRENCY_SYMBOL } from "@/lib/currency";
import { useAuthStore } from "@/store/auth.store";
import { useJobsStore } from "@/store/jobs.store";
import { toast } from "@/store/toast.store";
import type { JobListItem } from "@/types/db/job.types";
import type { Status } from "@/types/generic.types";
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

type ManageJobItem = JobListItem & { status: Status };

const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  ACTIVE: "success",
  DRAFT: "default",
  PENDING: "warning",
  ON_HOLD: "warning",
  EXPIRED: "default",
  DELETED: "danger",
};

export default function MyJobsScreen() {
  const user = useAuthStore((s) => s.user);
  const jobs = useJobsStore((s) => s.jobs) as ManageJobItem[];
  const isLoading = useJobsStore((s) => s.isLoadingList);
  const pagination = useJobsStore((s) => s.listPagination);
  const fetchManageJobs = useJobsStore((s) => s.fetchManageJobs);
  const deleteJob = useJobsStore((s) => s.deleteJob);

  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ManageJobItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(
    (page = 1) => {
      fetchManageJobs({ owner: user?.id }, page);
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
      await deleteJob(deleteTarget.id);
      toast.success("Job deleted");
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
        title="My Posted Jobs"
        showBack
        right={
          <Pressable
            hitSlop={8}
            onPress={() => router.push("/(tabs)/profile/post-job")}
            className="h-9 w-9 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20"
          >
            <Ionicons name="add" size={20} color={COLORS.primary} />
          </Pressable>
        }
      />

      {isLoading && !isLoadingMore && jobs.length === 0 ? (
        <View className="gap-4 px-6 pt-4">
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-3 px-6 py-4"
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
                name="document-text-outline"
                size={36}
                color="#D1D5DB"
              />
              <Text className="mt-3 text-gray-400 dark:text-gray-500">
                You haven't posted any jobs yet
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
          renderItem={({ item }) => (
            <View className="gap-3 rounded-2xl border border-gray-100 p-4 dark:border-gray-800">
              <Pressable onPress={() => router.push(`/job/${item.slug}`)}>
                <View className="flex-row items-start justify-between gap-2">
                  <View className="flex-1 gap-1">
                    <Text
                      numberOfLines={2}
                      className="text-[15px] font-semibold text-gray-900 dark:text-gray-100"
                    >
                      {item.title}
                    </Text>
                    {item.budget ? (
                      <Text className="text-sm font-bold text-primary">
                        {CURRENCY_SYMBOL} {item.budget}
                      </Text>
                    ) : null}
                  </View>
                  <Badge variant={STATUS_VARIANTS[item.status] ?? "default"}>
                    {item.status}
                  </Badge>
                </View>
              </Pressable>

              <View className="flex-row items-center gap-1.5">
                <Ionicons name="eye-outline" size={13} color={COLORS.gray400} />
                <Text className="text-xs text-gray-400 dark:text-gray-500">
                  {item.views} views
                </Text>
              </View>

              <View className="flex-row gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                <ActionButton
                  icon="people-outline"
                  label="Proposals"
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/profile/incoming-proposals",
                      params: { jobId: item.id },
                    })
                  }
                />
                <ActionButton
                  icon="create-outline"
                  label="Edit"
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/profile/post-job",
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
          )}
        />
      )}

      <ConfirmModal
        visible={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Job"
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
      className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-xl py-2.5 active:opacity-70 ${
        danger ? "bg-red-50 dark:bg-red-950/30" : "bg-gray-50 dark:bg-gray-900"
      }`}
    >
      <Ionicons
        name={icon}
        size={15}
        color={danger ? "#EF4444" : COLORS.primary}
      />
      <Text
        className={`text-xs font-semibold ${danger ? "text-red-500" : "text-primary"}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
