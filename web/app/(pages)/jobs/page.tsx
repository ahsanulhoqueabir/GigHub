"use client";

import { useEffect, useState } from "react";
import {
  IconSearch,
  IconLoader2,
  IconBriefcase,
  IconFilter,
  IconX,
  IconChevronDown,
} from "@tabler/icons-react";
import { useJobsStore } from "@/store/job.store";
import { JobCard } from "@/components/shared/job-card";
import { Button } from "@/components/ui/button";

const JOB_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "paid", label: "Paid" },
  { value: "free", label: "Free" },
  { value: "internship", label: "Internship" },
  { value: "volunteer", label: "Volunteer" },
  { value: "tuition", label: "Tuition" },
];

export default function JobsPage() {
  const jobs = useJobsStore((s) => s.jobs);
  const pagination = useJobsStore((s) => s.pagination);
  const filters = useJobsStore((s) => s.filters);
  const isLoading = useJobsStore((s) => s.isLoading);
  const isLoadingMore = useJobsStore((s) => s.isLoadingMore);
  const error = useJobsStore((s) => s.error);

  const fetchJobs = useJobsStore((s) => s.fetchJobs);
  const fetchNextPage = useJobsStore((s) => s.fetchNextPage);
  const setFilters = useJobsStore((s) => s.setFilters);
  const resetFilters = useJobsStore((s) => s.resetFilters);

  const [searchInput, setSearchInput] = useState(filters.search ?? "");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchJobs(1);
  }, [fetchJobs]);

  // ── Search submit ──────────────────────────────────────────────
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search: searchInput || undefined });
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
                Find Jobs
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Browse freelance opportunities and projects
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
                  placeholder="Search jobs..."
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
              {/* Job Type */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground whitespace-nowrap">
                  Job Type:
                </label>
                <select
                  value={filters.job_type ?? ""}
                  onChange={(e) =>
                    setFilters({ job_type: e.target.value || undefined })
                  }
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {JOB_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground whitespace-nowrap">
                  Category:
                </label>
                <input
                  type="text"
                  value={filters.category ?? ""}
                  onChange={(e) =>
                    setFilters({ category: e.target.value || undefined })
                  }
                  placeholder="Any"
                  className="w-28 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
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
            {filters.job_type && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                {JOB_TYPE_OPTIONS.find((o) => o.value === filters.job_type)
                  ?.label ?? filters.job_type}
              </span>
            )}
            {filters.category && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                Category: {filters.category}
              </span>
            )}
          </div>
        )}

        {/* Result count */}
        {pagination && !isLoading && (
          <p className="text-sm text-muted-foreground mb-4">
            {pagination.totalCount} job{pagination.totalCount !== 1 ? "s" : ""}{" "}
            found
          </p>
        )}

        {/* Loading state */}
        {isLoading && jobs.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <IconLoader2 size={36} className="animate-spin" />
              <p className="text-sm">Loading jobs...</p>
            </div>
          </div>
        ) : error && jobs.length === 0 ? (
          /* Error state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <IconBriefcase
              size={48}
              className="text-muted-foreground/40 mb-4"
            />
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              {error}
            </p>
            <Button onClick={() => fetchJobs(1)}>Try Again</Button>
          </div>
        ) : jobs.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <IconBriefcase
              size={48}
              className="text-muted-foreground/40 mb-4"
            />
            <h2 className="text-lg font-semibold text-foreground mb-2">
              No jobs found
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              {hasActiveFilters
                ? "Try adjusting your filters or search terms."
                : "No jobs are available right now. Check back later."}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={resetFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Job grid */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
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
