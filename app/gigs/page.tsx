"use client";

import { GigCard } from "@/components/home/gig-card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useGigsStore } from "@/store/gigs.store";
import {
  IconAdjustmentsHorizontal,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function GigsPage() {
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
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <IconAdjustmentsHorizontal className="size-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">
            {hasActiveFilters || debouncedSearch
              ? `No gigs found matching your filters.`
              : "No gigs available yet."}
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
