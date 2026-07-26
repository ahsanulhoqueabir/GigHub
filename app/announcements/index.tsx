import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { COLORS } from "@/constants/colors";
import {
  announcementBadgeVariant,
  capitalizeType,
  formatAnnouncementDate,
} from "@/lib/announcements";
import {
  useAnnouncementsStore,
  type AnnouncementListItem,
} from "@/store/announcements.store";
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

function AnnouncementRow({ item }: { item: AnnouncementListItem }) {
  return (
    <Pressable
      onPress={() => router.push(`/announcements/${item.id}`)}
      className="flex-row items-center gap-3 rounded-2xl border border-gray-100 p-4 active:bg-gray-50 dark:border-gray-800 dark:active:bg-gray-900"
    >
      <View className="flex-1 gap-1.5">
        <Text
          numberOfLines={1}
          className="text-[15px] font-semibold text-gray-900 dark:text-gray-100"
        >
          {item.title}
        </Text>
        <View className="flex-row items-center gap-2">
          <Badge variant={announcementBadgeVariant(item.type)}>
            {capitalizeType(item.type)}
          </Badge>
          <Text className="text-xs text-gray-400 dark:text-gray-500">
            {formatAnnouncementDate(item.created_at)}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
    </Pressable>
  );
}

export default function AnnouncementsListScreen() {
  const items = useAnnouncementsStore((s) => s.items);
  const isLoading = useAnnouncementsStore((s) => s.isLoading);
  const isLoadingMore = useAnnouncementsStore((s) => s.isLoadingMore);
  const error = useAnnouncementsStore((s) => s.error);
  const fetchAnnouncements = useAnnouncementsStore(
    (s) => s.fetchAnnouncements,
  );
  const fetchMore = useAnnouncementsStore((s) => s.fetchMore);
  const setLastUsedTimestamp = useAnnouncementsStore(
    (s) => s.setLastUsedTimestamp,
  );

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnnouncements(1);
    setLastUsedTimestamp(new Date().toISOString());
  }, [fetchAnnouncements, setLastUsedTimestamp]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAnnouncements(1);
    setLastUsedTimestamp(new Date().toISOString());
    setRefreshing(false);
  }, [fetchAnnouncements, setLastUsedTimestamp]);

  return (
    <View className="flex-1 bg-white dark:bg-gray-950">
      <Header title="Announcements" showBack />

      {isLoading && items.length === 0 ? (
        <View className="gap-4 px-6 pt-4">
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : error && items.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-3 px-10">
          <Ionicons name="alert-circle-outline" size={40} color="#D1D5DB" />
          <Text className="text-center text-gray-400 dark:text-gray-500">
            {error}
          </Text>
          <Button
            variant="primary"
            className="mt-2 px-8"
            onPress={() => fetchAnnouncements(1)}
          >
            Retry
          </Button>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-3 px-6 py-4 pb-8"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
          onEndReachedThreshold={0.4}
          onEndReached={fetchMore}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Ionicons
                name="megaphone-outline"
                size={36}
                color="#D1D5DB"
              />
              <Text className="mt-3 text-gray-400 dark:text-gray-500">
                No announcements yet
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
          renderItem={({ item }) => <AnnouncementRow item={item} />}
        />
      )}
    </View>
  );
}
