"use client";

import { JobCard } from "@/components/home/job-card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useJobsStore } from "@/store/jobs.store";
import { IconBriefcase, IconSearch, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export default function JobsPage() {
  const jobs = useJobsStore((s) => s.jobs);
  const loading = useJobsStore((s) => s.isLoadingList);
  const fetchJobs = useJobsStore((s) => s.fetchJobs);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchJobs(
      debouncedSearch
        ? { search: debouncedSearch }
        : { sortBy: "created_at", sortOrder: "desc" },
      1,
      20,
    );
  }, [debouncedSearch, fetchJobs]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <IconBriefcase className="size-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">
            {debouncedSearch
              ? `No jobs found matching "${debouncedSearch}"`
              : "No jobs available yet."}
          </p>
        </div>
      )}
    </div>
  );
}
