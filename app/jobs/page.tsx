"use client";

import { JobCard } from "@/components/home/job-card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useJobsStore } from "@/store/jobs.store";
import { IconBriefcase, IconSearch, IconX } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function JobsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const jobs = useJobsStore((s) => s.jobs);
  const loading = useJobsStore((s) => s.isLoadingList);
  const fetchJobs = useJobsStore((s) => s.fetchJobs);

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Read filters from URL query params
  const urlFilters = useMemo(() => {
    const filters: Record<string, string> = {};
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const owner = searchParams.get("owner");
    const tags = searchParams.get("tags");
    const searchVal = searchParams.get("search");
    if (type) filters.type = type;
    if (category) filters.category = category;
    if (owner) filters.owner = owner;
    if (tags) filters.tags = tags;
    if (searchVal) filters.search = searchVal;
    return filters;
  }, [searchParams]);

  // Fetch jobs when URL filters or debounced search change
  useEffect(() => {
    const filters = { ...urlFilters };
    if (debouncedSearch) {
      filters.search = debouncedSearch;
    } else if (!urlFilters.search) {
      delete filters.search;
    }
    fetchJobs(
      Object.keys(filters).length > 0
        ? filters
        : { sortBy: "created_at", sortOrder: "desc" },
      1,
      20,
    );
  }, [debouncedSearch, urlFilters, fetchJobs]);

  // Sync search input with URL ?search= param
  useEffect(() => {
    const current = new URL(window.location.href);
    if (debouncedSearch) {
      current.searchParams.set("search", debouncedSearch);
    } else {
      current.searchParams.delete("search");
    }
    router.replace(current.pathname + current.search, { scroll: false });
  }, [debouncedSearch, router]);

  const clearAllFilters = useCallback(() => {
    router.push("/jobs");
    setSearch("");
  }, [router]);

  const hasActiveFilters = Object.keys(urlFilters).length > 0;

  return (
    <div className="">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
          Jobs
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Find work opportunities posted by campus peers
        </p>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-8"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <IconX className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            onClick={clearAllFilters}
            className="text-xs text-primary hover:underline"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="space-y-3 rounded-xl border border-border p-4"
            >
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      ) : jobs.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <IconBriefcase className="size-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">
            {hasActiveFilters || debouncedSearch
              ? `No jobs found matching your filters.`
              : "No jobs available yet."}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="mt-2 text-sm text-primary hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
