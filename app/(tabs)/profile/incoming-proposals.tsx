import { Avatar } from "@/components/ui/Avatar";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Header } from "@/components/ui/Header";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { COLORS } from "@/constants/colors";
import { getErrorMessage } from "@/lib/api/api-response";
import { CURRENCY_SYMBOL } from "@/lib/currency";
import {
  useJobProposalsStore,
  type IncomingProposalItem,
} from "@/store/job-proposals.store";
import { toast } from "@/store/toast.store";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";


const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  PENDING: "warning",
  ACCEPTED: "success",
  APPROVED: "success",
  DECLINED: "danger",
  DRAFT: "default",
};

export default function IncomingProposalsScreen() {
  const insets = useSafeAreaInsets();
  const { jobId } = useLocalSearchParams<{ jobId?: string }>();


  const proposals = useJobProposalsStore((s) => s.incomingProposals);
  const isLoading = useJobProposalsStore((s) => s.isLoadingIncoming);
  const pagination = useJobProposalsStore((s) => s.incomingPagination);
  const fetchIncomingProposals = useJobProposalsStore(
    (s) => s.fetchIncomingProposals,
  );
  const approveProposal = useJobProposalsStore((s) => s.approveProposal);
  const isApproving = useJobProposalsStore((s) => s.isApproving);

  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [approveTarget, setApproveTarget] =
    useState<IncomingProposalItem | null>(null);

  const load = useCallback(
    (page = 1) => {
      fetchIncomingProposals(jobId ? { job: jobId } : undefined, page);
    },
    [jobId, fetchIncomingProposals],
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

  const handleApprove = async () => {
    if (!approveTarget) return;
    try {
      await approveProposal(approveTarget.id);
      toast.success("Proposal approved — order created");
      setApproveTarget(null);
      load(1);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-950">
      <Header title="Incoming Proposals" showBack />

      {isLoading && !isLoadingMore && proposals.length === 0 ? (
        <View className="gap-4 px-6 pt-4">
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : (
        <FlatList
          data={proposals}
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
              <Ionicons name="people-outline" size={36} color="#D1D5DB" />
              <Text className="mt-3 text-gray-400 dark:text-gray-500">
                No proposals received yet
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
            const applicant =
              typeof item.applicant === "object" ? item.applicant : null;
            return (
              <View className="gap-3 rounded-2xl border border-gray-100 p-4 dark:border-gray-800">
                <View className="flex-row items-start justify-between gap-2">
                  <View className="flex-1">
                    <Text className="text-xs text-gray-400 dark:text-gray-500">
                      Applied for
                    </Text>
                    <Text
                      numberOfLines={1}
                      className="text-[15px] font-semibold text-gray-900 dark:text-gray-100"
                    >
                      {item.job?.title ?? "—"}
                    </Text>
                    {item.job?.budget ? (
                      <Text className="text-xs font-medium text-primary">
                        {CURRENCY_SYMBOL} {item.job.budget}
                      </Text>
                    ) : null}
                  </View>
                  <Badge variant={STATUS_VARIANTS[item.status] ?? "default"}>
                    {item.status}
                  </Badge>
                </View>

                {applicant ? (
                  <View className="flex-row items-center gap-2.5">
                    <Avatar
                      uri={applicant.avatar}
                      name={applicant.name}
                      size="sm"
                    />
                    <View className="flex-1">
                      <View className="flex-row items-center gap-1">
                        <Text className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {applicant.name}
                        </Text>
                        {applicant.verified ? (
                          <Ionicons
                            name="checkmark-circle"
                            size={13}
                            color={COLORS.primary}
                          />
                        ) : null}
                      </View>
                      <Text className="text-xs text-gray-500 dark:text-gray-400">
                        @{applicant.username}
                      </Text>
                    </View>
                  </View>
                ) : null}

                <Text
                  numberOfLines={4}
                  className="text-sm leading-5 text-gray-600 dark:text-gray-300"
                >
                  {item.description}
                </Text>

                {item.attachments && item.attachments.length > 0 ? (
                  <View className="flex-row items-center gap-1.5">
                    <Ionicons
                      name="attach-outline"
                      size={14}
                      color={COLORS.gray400}
                    />
                    <Text className="text-xs text-gray-400 dark:text-gray-500">
                      {item.attachments.length} attachment
                      {item.attachments.length > 1 ? "s" : ""}
                    </Text>
                  </View>
                ) : null}

                {item.status === "PENDING" ? (
                  <Button size="sm" onPress={() => setApproveTarget(item)}>
                    Approve &amp; Hire
                  </Button>
                ) : item.status === "ACCEPTED" || item.status === "APPROVED" ? (
                  <View className="flex-row items-center gap-1.5 rounded-xl bg-green-50 px-3 py-2 dark:bg-green-950/30">
                    <Ionicons
                      name="checkmark-circle"
                      size={15}
                      color={COLORS.primary}
                    />
                    <Text className="text-xs font-medium text-primary">
                      Order created for this proposal
                    </Text>
                  </View>
                ) : null}
              </View>
            );
          }}
        />
      )}

      <ConfirmModal
        visible={!!approveTarget}
        onClose={() => setApproveTarget(null)}
        onConfirm={handleApprove}
        title="Approve Proposal"
        description="This will hire the applicant and automatically create an order for this job."
        confirmText="Approve & Hire"
        variant="primary"
        icon="checkmark-circle-outline"
        isLoading={isApproving}
      />
    </View>
  );
}
