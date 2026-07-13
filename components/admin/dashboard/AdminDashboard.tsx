"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/hooks/use-currency";
import { useMounted } from "@/hooks/useMounted";
import {
  selectDashboardData,
  selectDashboardError,
  selectDashboardLoading,
  useAdminDashboardStore,
} from "@/store/admin-dashboard.store";
import { useEffect } from "react";
import { DonutGrid } from "./PieCharts";
import { RatingDistributionCard } from "./RatingDistribution";
import {
  RecentGigs,
  RecentJobs,
  RecentOrders,
  RecentSignups,
} from "./RecentLists";
import { RevenueChart, SignupsChart } from "./RevenueChart";
import { StatsCards } from "./StatsCards";
import {
  TopGigCategories,
  TopJobCategories,
  UsersByDepartment,
} from "./TopCategories";

function DashboardSkeleton() {
  return (
    <div className="flex-1 space-y-6">
      <Skeleton className="h-9 w-48" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const mounted = useMounted();
  const { symbol: currencySymbol } = useCurrency();

  const data = useAdminDashboardStore(selectDashboardData);
  const loading = useAdminDashboardStore(selectDashboardLoading);
  const error = useAdminDashboardStore(selectDashboardError);
  const fetchDashboard = useAdminDashboardStore((s) => s.fetchDashboard);

  useEffect(() => {
    if (mounted && !data && !loading) {
      fetchDashboard();
    }
  }, [mounted, data, loading, fetchDashboard]);

  if (!mounted) return null;
  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800 p-8 text-center">
          <p className="text-red-600 dark:text-red-400 font-medium">
            Failed to load dashboard data
          </p>
          <p className="text-sm text-red-500 dark:text-red-400 mt-1">{error}</p>
          <button
            onClick={fetchDashboard}
            className="mt-4 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex-1 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <Button variant="refresh" onClick={fetchDashboard}>
          Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <StatsCards stats={data.stats} currencySymbol={currencySymbol} />

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <RevenueChart
            monthlyOrders={data.monthly_orders}
            currencySymbol={currencySymbol}
          />
        </div>
        <div className="lg:col-span-3">
          <RatingDistributionCard
            ratings={data.rating_distribution}
            averageRating={data.stats.avg_rating}
            totalReviews={data.stats.total_reviews}
          />
        </div>
      </div>

      {/* Growth Trends */}
      <SignupsChart
        monthlySignups={data.monthly_signups}
        monthlyGigs={data.monthly_gigs}
        monthlyJobs={data.monthly_jobs}
      />

      {/* Recent Items Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <RecentGigs gigs={data.recent_gigs} />
        <RecentJobs jobs={data.recent_jobs} />
        <RecentSignups signups={data.recent_signups} />
        <RecentOrders
          orders={data.recent_orders}
          currencySymbol={currencySymbol}
        />
      </div>

      {/* Category & Department Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <TopGigCategories categories={data.top_gig_categories} />
        <TopJobCategories categories={data.top_job_categories} />
        <UsersByDepartment departments={data.users_by_department} />
      </div>

      {/* Donut Charts */}
      <DonutGrid
        ordersByStatus={data.orders_by_status}
        ordersBySource={data.orders_by_source}
        usersByRole={data.users_by_role}
        gigsByStatus={data.gigs_by_status}
        jobsByStatus={data.jobs_by_status}
        jobsByType={data.jobs_by_type}
        proposalsByStatus={data.proposals_by_status}
      />
    </div>
  );
}
