"use client";

import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      <Card>
        <CardHeader>
          <CardTitle>Recent Gigs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No gigs yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Gigs</CardTitle>
        <CardDescription>Latest 10 gigs</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {gigs.map((gig) => (
            <div
              key={gig.id}
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/20"
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
      </CardContent>
    </Card>
  );
}

// ─── Recent Jobs ────────────────────────────────────────────────────────────

interface RecentJobsProps {
  jobs: RecentJob[];
}

export function RecentJobs({ jobs }: RecentJobsProps) {
  if (jobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No jobs yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Jobs</CardTitle>
        <CardDescription>Latest 10 jobs</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/20"
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
      </CardContent>
    </Card>
  );
}

// ─── Recent Signups ─────────────────────────────────────────────────────────

interface RecentSignupsProps {
  signups: RecentSignup[];
}

export function RecentSignups({ signups }: RecentSignupsProps) {
  if (signups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>New Signups</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No signups yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Signups</CardTitle>
        <CardDescription>Latest 10 registered users</CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
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
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No orders yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>Latest 10 orders</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/20"
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
      </CardContent>
    </Card>
  );
}
