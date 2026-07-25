import { GigCard } from "@/components/gigs/GigCard";
import { JobCard } from "@/components/jobs/JobCard";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select, type SelectOption } from "@/components/ui/Select";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { COLORS } from "@/constants/colors";
import { useCategoriesStore } from "@/store/categories.store";
import { useGigsStore } from "@/store/gigs.store";
import { useJobsStore } from "@/store/jobs.store";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";

type ExploreTab = "gigs" | "jobs";

const JOB_TYPE_OPTIONS: SelectOption[] = [
  { value: "PARTTIME", label: "Part-time" },
  { value: "FULLTIME", label: "Full-time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "TUTION", label: "Tuition" },
  { value: "VOLUNTEER", label: "Volunteer" },
  { value: "OTHER", label: "Other" },
];

const GIG_SORT_OPTIONS: SelectOption[] = [
  { value: "created_at:desc", label: "Newest" },
  { value: "views:desc", label: "Most Viewed" },
  { value: "price:asc", label: "Price: Low to High" },
  { value: "price:desc", label: "Price: High to Low" },
];

const JOB_SORT_OPTIONS: SelectOption[] = [
  { value: "created_at:desc", label: "Newest" },
  { value: "deadline:asc", label: "Deadline: Soonest" },
  { value: "views:desc", label: "Most Viewed" },
];

export default function ExploreScreen() {
  const params = useLocalSearchParams<{
    tab?: string;
    category?: string;
    type?: string;
  }>();
  const [activeTab, setActiveTab] = useState<ExploreTab>(
    params.tab === "jobs" ? "jobs" : "gigs",
  );

  const [search, setSearch] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [category, setCategory] = useState<string | undefined>(params.category);
  const [jobType, setJobType] = useState<string | undefined>(params.type);
  const [sort, setSort] = useState<string>("created_at:desc");

  const categories = useCategoriesStore((s) => s.categories);
  const fetchCategories = useCategoriesStore((s) => s.fetchCategories);

  const gigs = useGigsStore((s) => s.gigs);
  const gigsLoading = useGigsStore((s) => s.isLoadingList);
  const gigsPagination = useGigsStore((s) => s.listPagination);
  const fetchGigs = useGigsStore((s) => s.fetchGigs);

  const jobs = useJobsStore((s) => s.jobs);
  const jobsLoading = useJobsStore((s) => s.isLoadingList);
  const jobsPagination = useJobsStore((s) => s.listPagination);
  const fetchJobs = useJobsStore((s) => s.fetchJobs);

  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const categoryOptions: SelectOption[] = useMemo(
    () => categories.map((c) => ({ value: c.id, label: c.name })),
    [categories],
  );

  const runSearch = useCallback(
    (page = 1) => {
      const [sortBy, sortOrder] = sort.split(":") as [string, "asc" | "desc"];

      if (activeTab === "gigs") {
        return fetchGigs(
          { search: search || undefined, category, sortBy, sortOrder },
          page,
        );
      }
      return fetchJobs(
        {
          search: search || undefined,
          category,
          type: jobType,
          sortBy,
          sortOrder,
        },
        page,
      );
    },
    [activeTab, category, jobType, sort, search, fetchGigs, fetchJobs],
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (params.tab === "jobs") setActiveTab("jobs");
    else if (params.tab === "gigs") setActiveTab("gigs");
    setCategory(params.category);
    setJobType(params.type);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.tab, params.category, params.type]);

  useEffect(() => {
    runSearch(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, category, jobType, sort]);

  useEffect(() => {
    const timer = setTimeout(() => runSearch(1), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    runSearch(1);
    setRefreshing(false);
  }, [runSearch]);

  const pagination = activeTab === "gigs" ? gigsPagination : jobsPagination;
  const isLoading = activeTab === "gigs" ? gigsLoading : jobsLoading;

  const onEndReached = async () => {
    if (isLoadingMore || isLoading || !pagination.hasNext) return;
    setIsLoadingMore(true);
    await runSearch(pagination.currentPage + 1);
    setIsLoadingMore(false);
  };

  const activeFilterCount =
    (category ? 1 : 0) + (jobType && activeTab === "jobs" ? 1 : 0);

  return (
    <View className="flex-1 bg-white dark:bg-gray-950">
      <Header title="Explore" />

      <View className="gap-3 px-6 pt-3">
        <View className="flex-row rounded-xl bg-gray-100 p-1 dark:bg-gray-900">
          {(["gigs", "jobs"] as ExploreTab[]).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 items-center rounded-lg py-2 ${activeTab === tab ? "bg-white dark:bg-gray-800" : ""}`}
            >
              <Text
                className={`text-sm font-semibold capitalize ${
                  activeTab === tab
                    ? "text-primary"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>

        <View className="flex-row items-center gap-2">
          <Input
            value={search}
            onChangeText={setSearch}
            placeholder={`Search ${activeTab}…`}
            containerClassName="flex-1"
          />
          <Pressable
            onPress={() => setFiltersVisible(true)}
            className="h-[50px] w-[50px] items-center justify-center rounded-xl border border-gray-300 dark:border-gray-700"
          >
            <Ionicons name="options-outline" size={20} color={COLORS.primary} />
            {activeFilterCount > 0 ? (
              <View className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
            ) : null}
          </Pressable>
        </View>
      </View>

      {isLoading &&
      !isLoadingMore &&
      (activeTab === "gigs" ? gigs.length === 0 : jobs.length === 0) ? (
        <View className="gap-4 px-6 pt-4">
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : activeTab === "gigs" ? (
        <FlatList
          key="gigs"
          data={gigs}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperClassName="gap-3"
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
          renderItem={({ item }) => (
            <View className="flex-1">
              <GigCard gig={item} />
            </View>
          )}
          ListEmptyComponent={<EmptyState label="No gigs found" />}
          ListFooterComponent={isLoadingMore ? <Loader /> : null}
        />
      ) : (
        <FlatList
          key="jobs"
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
          renderItem={({ item }) => <JobCard job={item} />}
          ListEmptyComponent={<EmptyState label="No jobs found" />}
          ListFooterComponent={isLoadingMore ? <Loader /> : null}
        />
      )}

      <Modal
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
        title="Filters"
      >
        <View className="gap-4 pb-4">
          <Select
            label="Category"
            placeholder="All categories"
            value={category}
            onChange={setCategory}
            options={categoryOptions}
          />
          {activeTab === "jobs" ? (
            <Select
              label="Job Type"
              placeholder="All types"
              value={jobType}
              onChange={setJobType}
              options={JOB_TYPE_OPTIONS}
            />
          ) : null}
          <Select
            label="Sort By"
            value={sort}
            onChange={setSort}
            options={activeTab === "gigs" ? GIG_SORT_OPTIONS : JOB_SORT_OPTIONS}
          />

          <View className="mt-2 flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onPress={() => {
                setCategory(undefined);
                setJobType(undefined);
                setSort("created_at:desc");
              }}
            >
              Reset
            </Button>
            <Button className="flex-1" onPress={() => setFiltersVisible(false)}>
              Apply
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Loader() {
  return (
    <View className="py-4">
      <ActivityIndicator color={COLORS.primary} />
    </View>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <View className="items-center py-16">
      <Ionicons name="search-outline" size={36} color="#D1D5DB" />
      <Text className="mt-3 text-gray-400 dark:text-gray-500">{label}</Text>
    </View>
  );
}
