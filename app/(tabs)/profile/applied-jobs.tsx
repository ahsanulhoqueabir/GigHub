import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Header } from "@/components/ui/Header";
import { Modal } from "@/components/ui/Modal";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { COLORS } from "@/constants/colors";
import { getErrorMessage } from "@/lib/api/api-response";
import { CURRENCY_SYMBOL } from "@/lib/currency";
import {
  useJobProposalsStore,
  type AppliedJobItem,
} from "@/store/job-proposals.store";
import { toast } from "@/store/toast.store";
import { Ionicons } from "@expo/vector-icons";
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


const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  DRAFT: "default",
  PENDING: "warning",
  ACCEPTED: "success",
  APPROVED: "success",
  DECLINED: "danger",
};

export default function AppliedJobsScreen() {
  const insets = useSafeAreaInsets();
  const appliedJobs = useJobProposalsStore((s) => s.appliedJobs);

  const isLoading = useJobProposalsStore((s) => s.isLoadingApplied);
  const pagination = useJobProposalsStore((s) => s.appliedPagination);
  const fetchAppliedJobs = useJobProposalsStore((s) => s.fetchAppliedJobs);

  const selectedAppliedJob = useJobProposalsStore((s) => s.selectedAppliedJob);
  const isLoadingDetail = useJobProposalsStore((s) => s.isLoadingDetail);
  const fetchAppliedJobDetail = useJobProposalsStore(
    (s) => s.fetchAppliedJobDetail,
  );
  const updateAppliedJob = useJobProposalsStore((s) => s.updateAppliedJob);
  const isUpdatingApplied = useJobProposalsStore((s) => s.isUpdatingApplied);
  const deleteProposal = useJobProposalsStore((s) => s.deleteProposal);

  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [withdrawTarget, setWithdrawTarget] = useState<AppliedJobItem | null>(
    null,
  );
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const load = useCallback(
    (page = 1) => {
      fetchAppliedJobs(page);
    },
    [fetchAppliedJobs],
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

  const openDetail = (id: string) => {
    setActiveId(id);
    fetchAppliedJobDetail(id);
  };

  const handleToggleStatus = async () => {
    if (!selectedAppliedJob) return;
    const newStatus =
      selectedAppliedJob.status === "DRAFT" ? "PENDING" : "DRAFT";
    try {
      await updateAppliedJob(selectedAppliedJob.id, { status: newStatus });
      toast.success(
        `Proposal ${newStatus === "PENDING" ? "submitted" : "reverted to draft"}`,
      );
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawTarget) return;
    setIsWithdrawing(true);
    try {
      await deleteProposal(withdrawTarget.id);
      toast.success("Application withdrawn");
      setWithdrawTarget(null);
      setActiveId(null);
      load(1);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsWithdrawing(false);
    }
  };

  const isEditable = selectedAppliedJob
    ? ["DRAFT", "PENDING"].includes(selectedAppliedJob.status)
    : false;

  return (
    <View className="flex-1 bg-white dark:bg-gray-950">
      <Header title="Applied Jobs" showBack />

      {isLoading && !isLoadingMore && appliedJobs.length === 0 ? (
        <View className="gap-4 px-6 pt-4">
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : (
        <FlatList
          data={appliedJobs}
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
              <Ionicons name="paper-plane-outline" size={36} color="#D1D5DB" />
              <Text className="mt-3 text-gray-400 dark:text-gray-500">
                You haven't applied to any jobs yet
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
            <Pressable
              onPress={() => openDetail(item.id)}
              className="gap-2 rounded-2xl border border-gray-100 p-4 active:opacity-80 dark:border-gray-800"
            >
              <View className="flex-row items-start justify-between gap-2">
                <Text
                  numberOfLines={2}
                  className="flex-1 text-[15px] font-semibold text-gray-900 dark:text-gray-100"
                >
                  {item.job?.title ?? "—"}
                </Text>
                <Badge variant={STATUS_VARIANTS[item.status] ?? "default"}>
                  {item.status}
                </Badge>
              </View>
              <Text
                numberOfLines={2}
                className="text-xs leading-4 text-gray-500 dark:text-gray-400"
              >
                {item.description}
              </Text>
            </Pressable>
          )}
        />
      )}

      <Modal
        visible={!!activeId}
        onClose={() => setActiveId(null)}
        title="My Proposal"
      >
        {isLoadingDetail || !selectedAppliedJob ? (
          <View className="items-center py-10">
            <ActivityIndicator color={COLORS.primary} />
          </View>
        ) : (
          <View className="gap-4 pb-4">
            <View className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900">
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                {selectedAppliedJob.job?.title}
              </Text>
              {selectedAppliedJob.job?.budget ? (
                <Text className="mt-1 font-semibold text-primary">
                  {CURRENCY_SYMBOL} {selectedAppliedJob.job.budget}
                </Text>
              ) : null}
            </View>

            <View>
              <Text className="mb-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                Cover Letter
              </Text>
              <Text className="text-sm leading-5 text-gray-600 dark:text-gray-300">
                {selectedAppliedJob.description}
              </Text>
            </View>

            {selectedAppliedJob.attachments &&
            selectedAppliedJob.attachments.length > 0 ? (
              <View className="flex-row items-center gap-1.5">
                <Ionicons
                  name="attach-outline"
                  size={14}
                  color={COLORS.gray400}
                />
                <Text className="text-xs text-gray-400 dark:text-gray-500">
                  {selectedAppliedJob.attachments.length} attachment
                  {selectedAppliedJob.attachments.length > 1 ? "s" : ""}
                </Text>
              </View>
            ) : null}

            {isEditable ? (
              <View className="gap-2">
                <Button
                  variant="outline"
                  onPress={handleToggleStatus}
                  isLoading={isUpdatingApplied}
                >
                  {selectedAppliedJob.status === "DRAFT"
                    ? "Submit Proposal"
                    : "Revert to Draft"}
                </Button>
                <Button
                  variant="destructive"
                  onPress={() =>
                    setWithdrawTarget(
                      appliedJobs.find((j) => j.id === selectedAppliedJob.id) ??
                        null,
                    )
                  }
                >
                  Withdraw Application
                </Button>
              </View>
            ) : (
              <View className="flex-row items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5 dark:bg-gray-900">
                <Ionicons
                  name="shield-checkmark-outline"
                  size={16}
                  color={COLORS.gray400}
                />
                <Text className="flex-1 text-xs text-gray-500 dark:text-gray-400">
                  Proposals with status {selectedAppliedJob.status} can no
                  longer be edited or withdrawn.
                </Text>
              </View>
            )}
          </View>
        )}
      </Modal>

      <ConfirmModal
        visible={!!withdrawTarget}
        onClose={() => setWithdrawTarget(null)}
        onConfirm={handleWithdraw}
        title="Withdraw Application"
        description="Are you sure you want to withdraw this application? This cannot be undone."
        confirmText="Withdraw"
        variant="danger"
        icon="close-circle-outline"
        isLoading={isWithdrawing}
      />
    </View>
  );
}
