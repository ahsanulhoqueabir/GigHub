"use client";

import { useEffect } from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import {
  IconSearch,
  IconBriefcase,
  IconUsers,
  IconShieldCheck,
  IconArrowRight,
  IconLoader2,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { GigCard } from "@/components/shared/gig-card";
import { JobCard } from "@/components/shared/job-card";
import { useGigsStore, selectGigsLoading } from "@/store/gig.store";
import { useJobsStore, selectJobsLoading } from "@/store/job.store";

const features = [
  {
    icon: IconSearch,
    title: "Find Gigs",
    desc: "Browse thousands of freelance opportunities from top clients worldwide.",
  },
  {
    icon: IconBriefcase,
    title: "Post Projects",
    desc: "Hire skilled professionals to bring your ideas to life.",
  },
  {
    icon: IconUsers,
    title: "Top Talent",
    desc: "Connect with verified freelancers across every category.",
  },
  {
    icon: IconShieldCheck,
    title: "Secure Payments",
    desc: "Escrow-backed payments ensure peace of mind for both parties.",
  },
];

export default function Home() {
  const gigs = useGigsStore((s) => s.gigs);
  const gigsLoading = useGigsStore(selectGigsLoading);
  const fetchGigs = useGigsStore((s) => s.fetchGigs);

  const jobs = useJobsStore((s) => s.jobs);
  const jobsLoading = useJobsStore(selectJobsLoading);
  const fetchJobs = useJobsStore((s) => s.fetchJobs);

  useEffect(() => {
    fetchGigs(1);
    fetchJobs(1);
  }, [fetchGigs, fetchJobs]);

  return (
    <div className="flex flex-col">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {siteConfig.tagline}
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-lg mx-auto">
              The modern freelancing marketplace where talented professionals
              and ambitious projects come together.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/gigs">Browse Gigs</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-xl border border-border bg-card p-4 sm:p-6 hover:shadow-sm transition-shadow"
                >
                  <div className="flex size-9 sm:size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon size={18} className="sm:size-5" />
                  </div>
                  <h3 className="mt-3 font-semibold text-sm sm:text-base text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Gigs Section ─────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Popular Gigs
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Discover top-rated freelance services
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hidden sm:inline-flex"
            >
              <Link href="/gigs">
                View All
                <IconArrowRight size={14} className="ml-1" />
              </Link>
            </Button>
          </div>

          {gigsLoading && gigs.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <IconLoader2
                size={28}
                className="animate-spin text-muted-foreground"
              />
            </div>
          ) : gigs.length > 0 ? (
            <>
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {gigs.slice(0, 8).map((gig) => (
                  <GigCard key={gig.id} gig={gig} />
                ))}
              </div>
              <div className="mt-6 text-center sm:hidden">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/gigs">
                    View All Gigs
                    <IconArrowRight size={14} className="ml-1" />
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No gigs available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Jobs Section ─────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Latest Jobs
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Find your next project or opportunity
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hidden sm:inline-flex"
            >
              <Link href="/jobs">
                View All
                <IconArrowRight size={14} className="ml-1" />
              </Link>
            </Button>
          </div>

          {jobsLoading && jobs.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <IconLoader2
                size={28}
                className="animate-spin text-muted-foreground"
              />
            </div>
          ) : jobs.length > 0 ? (
            <>
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {jobs.slice(0, 6).map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
              <div className="mt-6 text-center sm:hidden">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/jobs">
                    View All Jobs
                    <IconArrowRight size={14} className="ml-1" />
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No jobs available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16 sm:px-6 lg:px-8 text-center">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
          Ready to start your journey?
        </h2>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground">
          Join thousands of freelancers and clients on {siteConfig.name}.
        </p>
        <Button size="lg" className="mt-6" asChild>
          <Link href="/signup">Create your account</Link>
        </Button>
      </section>
    </div>
  );
}
