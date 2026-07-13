/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { MonthlyDataPoint } from "@/types/admin-dashboard.types";
import { motion } from "motion/react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

interface RevenueChartProps {
  monthlyOrders: MonthlyDataPoint[];
  currencySymbol?: string;
}

const CustomRevenueTooltip = ({
  active,
  payload,
  label,
  currencySymbol = "$",
}: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-border/60 bg-card/95 backdrop-blur-md px-3 py-2 shadow-lg text-xs space-y-1.5 min-w-35">
        <p className="font-semibold text-foreground/90 pb-1 border-b border-border/10">
          {label}
        </p>
        {payload.map((entry: any, index: number) => {
          const color = entry.color || entry.fill;
          const isRevenue = entry.dataKey === "revenue";
          // Check if color is var-like or hex and parse out url references if gradient
          const resolvedColor =
            typeof color === "string" && color.startsWith("url")
              ? "var(--color-primary)"
              : color;
          return (
            <div
              key={index}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: resolvedColor }}
                />
                <span className="text-muted-foreground capitalize">
                  {entry.name}
                </span>
              </div>
              <span className="font-bold text-foreground font-mono">
                {isRevenue
                  ? `${currencySymbol}${entry.value.toLocaleString()}`
                  : entry.value.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export function RevenueChart({
  monthlyOrders,
  currencySymbol = "$",
}: RevenueChartProps) {
  const chartData = monthlyOrders.map((m) => ({
    name: MONTH_NAMES[m.month - 1] || `${m.month}`,
    year: m.year,
    orders: m.count,
    revenue: m.revenue ?? 0,
  }));

  if (chartData.length === 0) {
    return (
      <div className="rounded-2xl border border-border/40 bg-linear-to-b from-card to-card/90 dark:from-card/50 dark:to-card/30 p-6 shadow-sm">
        <div className="flex flex-col space-y-1.5 pb-2">
          <h3 className="text-sm font-semibold tracking-wide text-foreground">
            Revenue Overview
          </h3>
        </div>
        <div className="flex items-center justify-center h-80 text-muted-foreground text-sm">
          No revenue data available yet.
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
      whileHover={{
        y: -4,
        transition: { duration: 0.2, ease: "easeOut" },
      }}
      className="relative overflow-hidden rounded-2xl border border-border/40 bg-linear-to-b from-card to-card/90 dark:from-card/50 dark:to-card/30 p-5 shadow-sm transition-all duration-300 group hover:border-primary/20"
    >
      {/* Decorative top-right glow */}
      <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-5 dark:opacity-10 bg-primary transition-opacity duration-300 group-hover:opacity-15 pointer-events-none" />

      <div className="flex flex-col space-y-1 pb-4">
        <h3 className="text-sm font-semibold tracking-wide text-foreground animate-pulse-slow">
          Revenue & Orders
        </h3>
        <p className="text-xs text-muted-foreground">
          Monthly revenue and order count for the last 12 months
        </p>
      </div>

      <div className="p-1 pt-0">
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: -5, left: -15, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-primary)"
                  stopOpacity={0.25}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-primary)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
              stroke="var(--color-border)"
              strokeOpacity={0.4}
            />
            <XAxis
              dataKey="name"
              stroke="var(--color-muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={8}
            />
            <YAxis
              yAxisId="left"
              stroke="var(--color-muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${currencySymbol}${value}`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="var(--color-muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dx={8}
            />
            <Tooltip
              content={<CustomRevenueTooltip currencySymbol={currencySymbol} />}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "11px", paddingBottom: "10px" }}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="var(--color-primary)"
              fill="url(#revenueGradient)"
              strokeWidth={2.5}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="orders"
              name="Orders"
              stroke="var(--color-secondary)"
              strokeWidth={2}
              dot={{
                stroke: "var(--color-secondary)",
                strokeWidth: 1,
                r: 2.5,
                fill: "var(--color-card)",
              }}
              activeDot={{
                r: 4.5,
                strokeWidth: 0,
                fill: "var(--color-secondary)",
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

interface SignupsChartProps {
  monthlySignups: MonthlyDataPoint[];
  monthlyGigs: MonthlyDataPoint[];
  monthlyJobs: MonthlyDataPoint[];
}

const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-border/60 bg-card/95 backdrop-blur-md px-3 py-2 shadow-lg text-xs space-y-1.5 min-w-30">
        <p className="font-semibold text-foreground/90 pb-1 border-b border-border/10">
          {label}
        </p>
        {payload.map((entry: any, index: number) => {
          const color = entry.color || entry.fill;
          const resolvedColor =
            typeof color === "string" && color.startsWith("url")
              ? entry.dataKey === "signups"
                ? "var(--color-primary)"
                : entry.dataKey === "gigs"
                  ? "var(--color-teal)"
                  : "var(--color-violet)"
              : color;
          return (
            <div
              key={index}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: resolvedColor }}
                />
                <span className="text-muted-foreground capitalize">
                  {entry.name}
                </span>
              </div>
              <span className="font-bold text-foreground font-mono">
                {entry.value.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export function SignupsChart({
  monthlySignups,
  monthlyGigs,
  monthlyJobs,
}: SignupsChartProps) {
  // Merge all monthly data into one dataset
  const allMonths = new Map<
    string,
    { name: string; signups: number; gigs: number; jobs: number }
  >();

  const add = (data: MonthlyDataPoint[], key: "signups" | "gigs" | "jobs") => {
    data.forEach((m) => {
      const label = `${MONTH_NAMES[m.month - 1]} ${m.year}`;
      const existing = allMonths.get(label) || {
        name: label,
        signups: 0,
        gigs: 0,
        jobs: 0,
      };
      existing[key] = m.count;
      allMonths.set(label, existing);
    });
  };

  add(monthlySignups, "signups");
  add(monthlyGigs, "gigs");
  add(monthlyJobs, "jobs");

  const chartData = Array.from(allMonths.values());

  if (chartData.length === 0) {
    return (
      <div className="rounded-2xl border border-border/40 bg-linear-to-b from-card to-card/90 dark:from-card/50 dark:to-card/30 p-6 shadow-sm">
        <div className="flex flex-col space-y-1.5 pb-2">
          <h3 className="text-sm font-semibold tracking-wide text-foreground animate-pulse-slow">
            Growth Trends
          </h3>
        </div>
        <div className="flex items-center justify-center h-80 text-muted-foreground text-sm">
          No growth data available yet.
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.1 }}
      whileHover={{
        y: -4,
        transition: { duration: 0.2, ease: "easeOut" },
      }}
      className="relative overflow-hidden rounded-2xl border border-border/40 bg-linear-to-b from-card to-card/90 dark:from-card/50 dark:to-card/30 p-5 shadow-sm transition-all duration-300 group hover:border-primary/20"
    >
      {/* Decorative bottom-left glow */}
      <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full blur-3xl opacity-5 dark:opacity-10 bg-teal-500 transition-opacity duration-300 group-hover:opacity-15 pointer-events-none" />

      <div className="flex flex-col space-y-1 pb-4">
        <h3 className="text-sm font-semibold tracking-wide text-foreground">
          Growth Trends
        </h3>
        <p className="text-xs text-muted-foreground">
          Monthly signups, gigs, and jobs
        </p>
      </div>

      <div className="p-1 pt-0">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={chartData}
            margin={{ top: 10, right: -5, left: -15, bottom: 0 }}
          >
            <defs>
              <linearGradient id="signupsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-primary)"
                  stopOpacity={0.9}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-primary)"
                  stopOpacity={0.4}
                />
              </linearGradient>
              <linearGradient id="gigsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-teal)"
                  stopOpacity={0.9}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-teal)"
                  stopOpacity={0.4}
                />
              </linearGradient>
              <linearGradient id="jobsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-violet)"
                  stopOpacity={0.9}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-violet)"
                  stopOpacity={0.4}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
              stroke="var(--color-border)"
              strokeOpacity={0.4}
            />
            <XAxis
              dataKey="name"
              stroke="var(--color-muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={8}
            />
            <YAxis
              stroke="var(--color-muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomBarTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "11px", paddingBottom: "10px" }}
            />
            <Bar
              dataKey="signups"
              name="Signups"
              fill="url(#signupsGradient)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="gigs"
              name="Gigs"
              fill="url(#gigsGradient)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="jobs"
              name="Jobs"
              fill="url(#jobsGradient)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
