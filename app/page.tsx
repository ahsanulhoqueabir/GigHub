"use client";

import { GigCard } from "@/components/home/gig-card";
import { HeroBanner } from "@/components/home/hero-banner";
import { JobCard } from "@/components/home/job-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGeneralStore } from "@/store/general.store";
import { IconArrowRight, IconSchool } from "@tabler/icons-react";
import Link from "next/link";

export default function HomePage() {
  const homepageData = useGeneralStore((s) => s.homepageData);
  const isLoading = useGeneralStore((s) => s.isLoadingHomepage);

  const gigs = homepageData?.gigs ?? [];
  const jobs = homepageData?.jobs ?? [];
  const tuitions = homepageData?.tuitions ?? [];
  const gigsLoading = isLoading;
  const jobsLoading = isLoading;
  const tuitionsLoading = isLoading;

  return (
    <div className="min-h-full">
      {/* Hero Banner */}
      <HeroBanner />

      {/* Latest Tuitions — highlighted section */}
      <section className="">
        <div className="">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                  <IconSchool className="size-3.5" />
                  HIGHLIGHTED
                </span>
              </div>
              <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
                Tuition & Tutoring
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Find tuition jobs and tutoring opportunities near you
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/jobs?type=TUTION">
                View All
                <IconArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>

          {tuitionsLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="space-y-3 rounded-xl border border-border bg-background p-4"
                >
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          ) : tuitions.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tuitions.map((tuition) => (
                <JobCard key={tuition.id} job={tuition} />
              ))}
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No tuition opportunities available yet.
            </p>
          )}
        </div>
      </section>

      {/* Latest Gigs */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
              Latest Gigs
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Discover services offered by talented students
            </p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/gigs">
              View All
              <IconArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>

        {gigsLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
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
          <p className="py-12 text-center text-sm text-muted-foreground">
            No gigs available yet.
          </p>
        )}
      </section>

      {/* Latest Jobs */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
              Latest Jobs
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Find work opportunities posted by peers
            </p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/jobs">
              View All
              <IconArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>

        {jobsLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
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
          <p className="py-12 text-center text-sm text-muted-foreground">
            No jobs available yet.
          </p>
        )}
      </section>
    </div>
  );
}
