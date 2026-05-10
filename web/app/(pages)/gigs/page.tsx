"use client";

import { useEffect, useState } from "react";
import {
  IconSearch,
  IconLoader2,
  IconShoppingCart,
  IconFilter,
  IconX,
  IconChevronDown,
} from "@tabler/icons-react";
import { useGigsStore } from "@/store/gig.store";
import { GigCard } from "@/components/shared/gig-card";
import { Button } from "@/components/ui/button";

const SORT_OPTIONS = [
  { value: "", label: "Best Match" },
  { value: "newest", label: "Newest" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "orders", label: "Most Ordered" },
];

export default function GigsPage() {
  const gigs = useGigsStore((s) => s.gigs);
  const pagination = useGigsStore((s) => s.pagination);
  const filters = useGigsStore((s) => s.filters);
  const isLoading = useGigsStore((s) => s.isLoading);
  const isLoadingMore = useGigsStore((s) => s.isLoadingMore);
  const error = useGigsStore((s) => s.error);

  const fetchGigs = useGigsStore((s) => s.fetchGigs);
  const fetchNextPage = useGigsStore((s) => s.fetchNextPage);
  const setFilters = useGigsStore((s) => s.setFilters);
  const resetFilters = useGigsStore((s) => s.resetFilters);

  const [searchInput, setSearchInput] = useState(filters.search ?? "");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchGigs(1);
  }, [fetchGigs]);

  // ── Search submit ──────────────────────────────────────────────
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search: searchInput || undefined });
  };

  // ── Sort change ────────────────────────────────────────────────
  const handleSortChange = (value: string) => {
    setFilters({ sort: value || undefined });
  };

  // ── Has active filters ─────────────────────────────────────────
  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== undefined && v !== "",
  );

  return (
    <div className="min-h-screen">
      {/* ── Header ──────────────────────────────────────────── */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Explore Gigs
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Find the perfect freelance service for your project
              </p>
            </div>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <IconSearch
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search gigs..."
                  className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <Button type="submit">Search</Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? "border-primary" : ""}
              >
                <IconFilter size={18} />
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* ── Filter Bar ───────────────────────────────────────── */}
      {showFilters && (
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-3">
              {/* Sort */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground whitespace-nowrap">
                  Sort by:
                </label>
                <select
                  value={filters.sort ?? ""}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Min Price */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground whitespace-nowrap">
                  Min $:
                </label>
                <input
                  type="number"
                  min={0}
                  value={filters.min_price ?? ""}
                  onChange={(e) =>
                    setFilters({
                      min_price: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="0"
                  className="w-20 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Max Price */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground whitespace-nowrap">
                  Max $:
                </label>
                <input
                  type="number"
                  min={0}
                  value={filters.max_price ?? ""}
                  onChange={(e) =>
                    setFilters({
                      max_price: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="Any"
                  className="w-20 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Max Delivery */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground whitespace-nowrap">
                  Max days:
                </label>
                <input
                  type="number"
                  min={1}
                  value={filters.max_delivery ?? ""}
                  onChange={(e) =>
                    setFilters({
                      max_delivery: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="Any"
                  className="w-20 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Reset */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="gap-1 text-muted-foreground"
                >
                  <IconX size={14} />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Results ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Active filter indicators */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs text-muted-foreground">
              Active filters:
            </span>
            {filters.search && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">
                Search: &quot;{filters.search}&quot;
              </span>
            )}
            {filters.sort && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                Sort:{" "}
                {SORT_OPTIONS.find((o) => o.value === filters.sort)?.label}
              </span>
            )}
            {filters.min_price !== undefined && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                Min: ${filters.min_price}
              </span>
            )}
            {filters.max_price !== undefined && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                Max: ${filters.max_price}
              </span>
            )}
            {filters.max_delivery !== undefined && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                Max {filters.max_delivery} day delivery
              </span>
            )}
          </div>
        )}

        {/* Result count */}
        {pagination && !isLoading && (
          <p className="text-sm text-muted-foreground mb-4">
            {pagination.totalCount} gig{pagination.totalCount !== 1 ? "s" : ""}{" "}
            found
          </p>
        )}

        {/* Loading state */}
        {isLoading && gigs.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <IconLoader2 size={36} className="animate-spin" />
              <p className="text-sm">Loading gigs...</p>
            </div>
          </div>
        ) : error && gigs.length === 0 ? (
          /* Error state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <IconShoppingCart
              size={48}
              className="text-muted-foreground/40 mb-4"
            />
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              {error}
            </p>
            <Button onClick={() => fetchGigs(1)}>Try Again</Button>
          </div>
        ) : gigs.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <IconShoppingCart
              size={48}
              className="text-muted-foreground/40 mb-4"
            />
            <h2 className="text-lg font-semibold text-foreground mb-2">
              No gigs found
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              {hasActiveFilters
                ? "Try adjusting your filters or search terms."
                : "No gigs are available right now. Check back later."}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={resetFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Gig grid */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {gigs.map((gig) => (
                <GigCard key={gig.id} gig={gig} />
              ))}
            </div>

            {/* Load more */}
            {pagination?.hasNextPage && (
              <div className="flex justify-center mt-8">
                <Button
                  variant="outline"
                  onClick={fetchNextPage}
                  disabled={isLoadingMore}
                  className="gap-2 min-w-40"
                >
                  {isLoadingMore ? (
                    <>
                      <IconLoader2 size={16} className="animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <IconChevronDown size={16} />
                      Load More
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
