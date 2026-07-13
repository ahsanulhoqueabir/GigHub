"use client";

import type {
  CategoryDistribution,
  DepartmentDistribution,
} from "@/types/admin-dashboard.types";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ─── Top Gig Categories ─────────────────────────────────────────────────────

interface TopGigCategoriesProps {
  categories: CategoryDistribution[];
}

export function TopGigCategories({ categories }: TopGigCategoriesProps) {
  if (categories.length === 0) {
    return (
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="font-semibold leading-none tracking-tight">
            Top Gig Categories
          </h3>
        </div>
        <div className="p-6 pt-0 text-sm text-muted-foreground">
          No categories with gigs yet.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6 pb-2">
        <h3 className="font-semibold leading-none tracking-tight">
          Top Gig Categories
        </h3>
        <p className="text-sm text-muted-foreground">
          Categories with most gigs
        </p>
      </div>
      <div className="p-4 pt-0">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={categories} layout="vertical">
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="hsl(var(--border))"
            />
            <XAxis
              type="number"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={100}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "13px",
              }}
              formatter={(value) => [value ?? 0, "Gigs"]}
            />
            <Bar dataKey="count" fill="#8884d8" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Top Job Categories ─────────────────────────────────────────────────────

interface TopJobCategoriesProps {
  categories: CategoryDistribution[];
}

export function TopJobCategories({ categories }: TopJobCategoriesProps) {
  if (categories.length === 0) {
    return (
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="font-semibold leading-none tracking-tight">
            Top Job Categories
          </h3>
        </div>
        <div className="p-6 pt-0 text-sm text-muted-foreground">
          No categories with jobs yet.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6 pb-2">
        <h3 className="font-semibold leading-none tracking-tight">
          Top Job Categories
        </h3>
        <p className="text-sm text-muted-foreground">
          Categories with most jobs
        </p>
      </div>
      <div className="p-4 pt-0">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={categories} layout="vertical">
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="hsl(var(--border))"
            />
            <XAxis
              type="number"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={100}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "13px",
              }}
              formatter={(value) => [value ?? 0, "Jobs"]}
            />
            <Bar dataKey="count" fill="#82ca9d" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Users by Department ────────────────────────────────────────────────────

interface UsersByDepartmentProps {
  departments: DepartmentDistribution[];
}

export function UsersByDepartment({ departments }: UsersByDepartmentProps) {
  if (departments.length === 0) {
    return (
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="font-semibold leading-none tracking-tight">
            Users by Department
          </h3>
        </div>
        <div className="p-6 pt-0 text-sm text-muted-foreground">
          No department data yet.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6 pb-2">
        <h3 className="font-semibold leading-none tracking-tight">
          Users by Department
        </h3>
        <p className="text-sm text-muted-foreground">
          User distribution across departments
        </p>
      </div>
      <div className="p-4 pt-0">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={departments} layout="vertical">
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="hsl(var(--border))"
            />
            <XAxis
              type="number"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={120}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "13px",
              }}
              formatter={(value) => [value ?? 0, "Users"]}
            />
            <Bar dataKey="count" fill="#ffc658" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
