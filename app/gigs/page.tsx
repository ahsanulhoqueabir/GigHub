"use client";

import { GigCard } from "@/components/home/gig-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useGigsStore } from "@/store/gigs.store";
import {
  IconAdjustmentsHorizontal,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

function GigsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const gigs = useGigsStore((s) => s.gigs);
  const loading = useGigsStore((s) => s.isLoadingList);
  const fetchGigs = useGigsStore((s) => s.fetchGigs);

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
    const category = searchParams.get("category");
    const seller = searchParams.get("seller");
    const tags = searchParams.get("tags");
    const searchVal = searchParams.get("search");
    if (category) filters.category = category;
    if (seller) filters.seller = seller;
    if (tags) filters.tags = tags;
    if (searchVal) filters.search = searchVal;
    return filters;
  }, [searchParams]);

  // Fetch gigs when URL filters or debounced search change
  useEffect(() => {
    const filters = { ...urlFilters };
    if (debouncedSearch) {
      filters.search = debouncedSearch;
    } else if (!urlFilters.search) {
      delete filters.search;
    }
    fetchGigs(
      Object.keys(filters).length > 0
        ? filters
        : { sortBy: "created_at", sortOrder: "desc" },
      1,
      20,
    );
  }, [debouncedSearch, urlFilters, fetchGigs]);

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
    window.location.href = "/gigs";
  }, []);

  const hasActiveFilters = Object.keys(urlFilters).length > 0;

  return (
    <div className="">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
          Gigs
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse services offered by campus freelancers
        </p>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search gigs..."
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
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-16/10 rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : gigs.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {gigs.map((gig) => (
            <GigCard key={gig.id} gig={gig} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={
            <div className="p-4 rounded-full bg-muted">
              <IconAdjustmentsHorizontal className="size-8 text-muted-foreground" />
            </div>
          }
          heading={
            hasActiveFilters || debouncedSearch
              ? "No gigs found"
              : "No gigs available yet"
          }
          description={
            hasActiveFilters || debouncedSearch
              ? "No gigs found matching your filters."
              : undefined
          }
          actions={
            hasActiveFilters ? (
              <button
                onClick={clearAllFilters}
                className="text-sm text-primary hover:underline"
              >
                Clear all filters
              </button>
            ) : undefined
          }
        />
      )}
    </div>
  );
}

export default function GigsPage() {
  return (
    <Suspense fallback={<GigsPageSkeleton />}>
      <GigsPageContent />
    </Suspense>
  );
}

function GigsPageSkeleton() {
  return (
    <div className="">
      <div className="mb-6">
        <div className="h-9 w-24 bg-muted rounded animate-pulse" />
        <div className="mt-1 h-5 w-64 bg-muted rounded animate-pulse" />
      </div>
      <div className="mb-6 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="h-10 w-full bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-16/10 rounded-xl bg-muted animate-pulse" />
            <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
