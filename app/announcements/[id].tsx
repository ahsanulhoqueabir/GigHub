import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  announcementBadgeVariant,
  capitalizeType,
  formatAnnouncementDate,
} from "@/lib/announcements";
import { useAnnouncementsStore } from "@/store/announcements.store";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { ScrollView, Text, View } from "react-native";

export default function AnnouncementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const detail = useAnnouncementsStore((s) => s.detail);
  const isLoadingDetail = useAnnouncementsStore((s) => s.isLoadingDetail);
  const detailUnavailable = useAnnouncementsStore((s) => s.detailUnavailable);
  const detailError = useAnnouncementsStore((s) => s.detailError);
  const fetchAnnouncementDetail = useAnnouncementsStore(
    (s) => s.fetchAnnouncementDetail,
  );
  const clearDetail = useAnnouncementsStore((s) => s.clearDetail);
  const setActiveDetailId = useAnnouncementsStore((s) => s.setActiveDetailId);

  useEffect(() => {
    if (id) fetchAnnouncementDetail(id);
    return () => clearDetail();
  }, [id, fetchAnnouncementDetail, clearDetail]);

  useEffect(() => {
    setActiveDetailId(id ?? null);
    return () => setActiveDetailId(null);
  }, [id, setActiveDetailId]);

  if (isLoadingDetail) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-950">
        <Header title="Announcement" showBack />
        <View className="gap-4 p-6">
          <Skeleton height={16} width="40%" />
          <Skeleton height={24} width="80%" />
          <Skeleton height={14} />
          <Skeleton height={14} width="90%" />
          <Skeleton height={14} width="60%" />
        </View>
      </View>
    );
  }

  if (detailUnavailable) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-950">
        <Header title="Announcement" showBack />
        <View className="flex-1 items-center justify-center gap-3 px-10">
          <Ionicons name="megaphone-outline" size={40} color="#D1D5DB" />
          <Text className="text-center text-base font-semibold text-gray-700 dark:text-gray-300">
            Announcement unavailable
          </Text>
          <Text className="text-center text-sm text-gray-400 dark:text-gray-500">
            This announcement may have been removed, expired, or is no
            longer active.
          </Text>
          <Button
            variant="secondary"
            className="mt-2 px-8"
            onPress={() => router.replace("/announcements")}
          >
            Back to Announcements
          </Button>
        </View>
      </View>
    );
  }

  if (detailError || !detail) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-950">
        <Header title="Announcement" showBack />
        <View className="flex-1 items-center justify-center gap-3 px-10">
          <Ionicons name="alert-circle-outline" size={40} color="#D1D5DB" />
          <Text className="text-center text-gray-400 dark:text-gray-500">
            {detailError ?? "Something went wrong"}
          </Text>
          <Button
            variant="primary"
            className="mt-2 px-8"
            onPress={() => id && fetchAnnouncementDetail(id)}
          >
            Retry
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-gray-950">
      <Header title="Announcement" showBack />
      <ScrollView contentContainerClassName="gap-4 p-6">
        <Badge variant={announcementBadgeVariant(detail.type)}>
          {capitalizeType(detail.type)}
        </Badge>
        <Text className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {detail.title}
        </Text>
        <Text className="text-xs text-gray-400 dark:text-gray-500">
          {formatAnnouncementDate(detail.created_at)}
        </Text>
        <Text className="text-[15px] leading-6 text-gray-700 dark:text-gray-300">
          {detail.content}
        </Text>
      </ScrollView>
    </View>
  );
}
