"use client";

import { useEffect, useState } from "react";
import {
  IconAdjustmentsHorizontal,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { GigCard } from "@/components/home/gig-card";
import { useGigsStore } from "@/store/gigs.store";

export default function GigsPage() {
  const gigs = useGigsStore((s) => s.gigs);
  const loading = useGigsStore((s) => s.isLoadingList);
  const fetchGigs = useGigsStore((s) => s.fetchGigs);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchGigs(
      debouncedSearch
        ? { search: debouncedSearch }
        : { sortBy: "created_at", sortOrder: "desc" },
      1,
      20,
    );
  }, [debouncedSearch, fetchGigs]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
            {debouncedSearch
              ? `No gigs found matching "${debouncedSearch}"`
              : "No gigs available yet."}
          </p>
        </div>
      )}
    </div>
  );
}
