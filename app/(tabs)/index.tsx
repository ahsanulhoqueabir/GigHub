import { GigCard } from "@/components/gigs/GigCard";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { SectionHeader } from "@/components/home/SectionHeader";
import { JobCard } from "@/components/jobs/JobCard";
import { Header } from "@/components/ui/Header";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { COLORS } from "@/constants/colors";
import { useAnnouncementsStore } from "@/store/announcements.store";
import { useCategoriesStore } from "@/store/categories.store";
import { useHomeStore } from "@/store/home.store";
import type { CategoryMinimal } from "@/types/db/category.types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function HomeScreen() {
  const homepage = useHomeStore((s) => s.homepage);
  const isLoadingHomepage = useHomeStore((s) => s.isLoadingHomepage);
  const fetchHomepage = useHomeStore((s) => s.fetchHomepage);

  const siteData = useHomeStore((s) => s.siteData);
  const fetchSiteData = useHomeStore((s) => s.fetchSiteData);

  const categories = useCategoriesStore((s) => s.categories);
  const fetchCategories = useCategoriesStore((s) => s.fetchCategories);

  const lastUsedTimestamp = useAnnouncementsStore((s) => s.lastUsedTimestamp);

  const [refreshing, setRefreshing] = useState(false);

  const loadAll = useCallback(
    async (force = false) => {
      await Promise.all([
        fetchHomepage(),
        fetchSiteData(),
        fetchCategories(force),
      ]);
    },
    [fetchHomepage, fetchSiteData, fetchCategories],
  );

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAll(true);
    setRefreshing(false);
  }, [loadAll]);

  const goToExplore = (params?: Record<string, string>) => {
    router.push({ pathname: "/(tabs)/explore", params });
  };

  const handleSelectCategory = (category: CategoryMinimal) => {
    goToExplore({ category: category.id });
  };

  const adBanner = siteData?.ad_banners?.find((b) => b.is_active);

  const announcements = siteData?.announcements ?? [];
  const lastTime = lastUsedTimestamp ? new Date(lastUsedTimestamp).getTime() : 0;
  const newCount = announcements.filter(
    (item) => new Date(item.created_at).getTime() > lastTime,
  ).length;

  return (
    <View className="flex-1 bg-white dark:bg-gray-950">
      <Header
        title="GigHub"
        showLogo
        right={
          <Pressable
            hitSlop={8}
            onPress={() => router.push("/announcements")}
            className="relative h-9 w-9 items-center justify-center rounded-full active:bg-gray-100 dark:active:bg-gray-800"
          >
            <Ionicons
              name="notifications-outline"
              size={22}
              color={COLORS.gray500}
            />
            {newCount > 0 && (
              <View className="absolute -right-0.5 -top-0.5 h-4 min-w-[16px] items-center justify-center rounded-full border border-white bg-red-500 px-1 dark:border-gray-950">
                <Text className="text-center text-[9px] font-extrabold leading-3 text-white">
                  {newCount > 9 ? "9+" : newCount}
                </Text>
              </View>
            )}
          </Pressable>
        }
      />

      <ScrollView
        contentContainerClassName="gap-7 pb-12 pt-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        <Pressable onPress={() => goToExplore()} className="mx-6">
          <View className="flex-row items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
            <Ionicons name="search-outline" size={18} color={COLORS.gray400} />
            <Text className="text-sm text-gray-400">Search gigs & jobs…</Text>
          </View>
        </Pressable>

        {siteData?.hero_banners && siteData.hero_banners.length > 0 ? (
          <HeroCarousel
            banners={siteData.hero_banners.filter((b) => b.is_active)}
          />
        ) : null}

        {categories.length > 0 ? (
          <CategoryGrid
            categories={categories}
            onSelect={handleSelectCategory}
          />
        ) : null}

        {adBanner ? (
          <Pressable
            onPress={() =>
              adBanner.target_url && Linking.openURL(adBanner.target_url)
            }
            className="mx-6 overflow-hidden rounded-2xl"
          >
            <Image
              source={{ uri: adBanner.image_url }}
              className="h-24 w-full"
              contentFit="cover"
            />
          </Pressable>
        ) : null}

        {isLoadingHomepage && !homepage ? (
          <View className="gap-4 px-6">
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : (
          <>
            {homepage?.tuitions && homepage.tuitions.length > 0 ? (
              <View>
                <View className="px-6">
                  <SectionHeader
                    title="Latest Tuitions"
                    actionLabel="See all"
                    onActionPress={() =>
                      goToExplore({ tab: "jobs", type: "TUTION" })
                    }
                  />
                </View>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={homepage.tuitions}
                  keyExtractor={(item) => item.id}
                  contentContainerClassName="gap-3 px-6"
                  renderItem={({ item }) => <JobCard job={item} width={280} />}
                />
              </View>
            ) : null}

            {homepage?.gigs && homepage.gigs.length > 0 ? (
              <View>
                <View className="px-6">
                  <SectionHeader
                    title="Featured Gigs"
                    actionLabel="See all"
                    onActionPress={() => goToExplore({ tab: "gigs" })}
                  />
                </View>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={homepage.gigs}
                  keyExtractor={(item) => item.id}
                  contentContainerClassName="gap-3 px-6"
                  renderItem={({ item }) => <GigCard gig={item} width={200} />}
                />
              </View>
            ) : null}

            {homepage?.jobs && homepage.jobs.length > 0 ? (
              <View className="gap-3 px-6">
                <SectionHeader
                  title="Recent Jobs"
                  actionLabel="See all"
                  onActionPress={() => goToExplore({ tab: "jobs" })}
                />
                {homepage.jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}
