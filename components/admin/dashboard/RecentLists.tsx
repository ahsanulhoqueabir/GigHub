"use client";

import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDateInTimezone } from "@/lib/date.utils";
import type {
  RecentGig,
  RecentJob,
  RecentOrder,
  RecentSignup,
} from "@/types/admin-dashboard.types";

// ─── Recent Gigs ────────────────────────────────────────────────────────────

interface RecentGigsProps {
  gigs: RecentGig[];
}

export function RecentGigs({ gigs }: RecentGigsProps) {
  if (gigs.length === 0) {
    return (
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="font-semibold leading-none tracking-tight">
            Recent Gigs
          </h3>
        </div>
        <div className="p-6 pt-0 text-sm text-muted-foreground">
          No gigs yet.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6 pb-3">
        <h3 className="font-semibold leading-none tracking-tight">
          Recent Gigs
        </h3>
        <p className="text-sm text-muted-foreground">Latest 10 gigs</p>
      </div>
      <div className="px-6 pb-6">
        <div className="space-y-2">
          {gigs.map((gig) => (
            <div
              key={gig.id}
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/50"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{gig.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDateInTimezone(gig.created_at)}
                </p>
              </div>
              <StatusBadge status={gig.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Recent Jobs ────────────────────────────────────────────────────────────

interface RecentJobsProps {
  jobs: RecentJob[];
}

export function RecentJobs({ jobs }: RecentJobsProps) {
  if (jobs.length === 0) {
    return (
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="font-semibold leading-none tracking-tight">
            Recent Jobs
          </h3>
        </div>
        <div className="p-6 pt-0 text-sm text-muted-foreground">
          No jobs yet.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6 pb-3">
        <h3 className="font-semibold leading-none tracking-tight">
          Recent Jobs
        </h3>
        <p className="text-sm text-muted-foreground">Latest 10 jobs</p>
      </div>
      <div className="px-6 pb-6">
        <div className="space-y-2">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/50"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{job.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDateInTimezone(job.created_at)}
                </p>
              </div>
              <StatusBadge status={job.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Recent Signups ─────────────────────────────────────────────────────────

interface RecentSignupsProps {
  signups: RecentSignup[];
}

export function RecentSignups({ signups }: RecentSignupsProps) {
  if (signups.length === 0) {
    return (
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="font-semibold leading-none tracking-tight">
            New Signups
          </h3>
        </div>
        <div className="p-6 pt-0 text-sm text-muted-foreground">
          No signups yet.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6 pb-3">
        <h3 className="font-semibold leading-none tracking-tight">
          New Signups
        </h3>
        <p className="text-sm text-muted-foreground">
          Latest 10 registered users
        </p>
      </div>
      <div className="px-6 pb-6">
        <div className="space-y-3">
          {signups.map((user) => {
            const initials =
              user.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) || "?";

            return (
              <div key={user.id} className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {user.role === "ADMIN" && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 h-5"
                    >
                      ADMIN
                    </Badge>
                  )}
                  {user.verified && (
                    <span className="text-emerald-500 text-xs" title="Verified">
                      ✓
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Recent Orders ──────────────────────────────────────────────────────────

interface RecentOrdersProps {
  orders: RecentOrder[];
  currencySymbol?: string;
}

export function RecentOrders({
  orders,
  currencySymbol = "$",
}: RecentOrdersProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="font-semibold leading-none tracking-tight">
            Recent Orders
          </h3>
        </div>
        <div className="p-6 pt-0 text-sm text-muted-foreground">
          No orders yet.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6 pb-3">
        <h3 className="font-semibold leading-none tracking-tight">
          Recent Orders
        </h3>
        <p className="text-sm text-muted-foreground">Latest 10 orders</p>
      </div>
      <div className="px-6 pb-6">
        <div className="space-y-2">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/50"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">
                    #{order.code}
                  </span>
                  <p className="text-sm font-medium truncate">{order.title}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {order.buyer?.name || "Unknown"} →{" "}
                  {order.seller?.name || "Unknown"}
                  {" · "}
                  {formatDateInTimezone(order.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-3">
                <span className="text-sm font-semibold">
                  {currencySymbol}
                  {Number(order.total_price).toLocaleString()}
                </span>
                <StatusBadge status={order.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
