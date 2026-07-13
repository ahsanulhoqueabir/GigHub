"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DistributionItem } from "@/types/admin-dashboard.types";
import { motion } from "motion/react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

// Curated theme-aware colors from globals.css
const COLORS = [
  "var(--color-primary)",
  "var(--color-teal)",
  "var(--color-violet)",
  "var(--color-secondary)",
  "var(--color-cooking)",
  "var(--color-takeaway)",
  "var(--color-info)",
  "var(--color-success)",
  "var(--color-warning)",
  "var(--color-destructive)",
];

interface PieChartCardProps {
  title: string;
  subtitle?: string;
  data: DistributionItem[];
  dataKey: string;
  nameKey: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const name = payload[0].name;
    const value = payload[0].value;
    const color = payload[0].payload.fill || payload[0].color;
    return (
      <div className="rounded-xl border border-border/60 bg-card/95 backdrop-blur-md px-3 py-2 shadow-lg text-xs space-y-1">
        <div className="flex items-center gap-2 font-medium">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-foreground">{name}</span>
        </div>
        <div className="text-muted-foreground font-mono text-[11px] pl-4">
          Count: <span className="font-bold text-foreground">{value}</span>
        </div>
      </div>
    );
  }
  return null;
};

export function PieChartCard({
  title,
  subtitle,
  data,
  dataKey,
  nameKey,
}: PieChartCardProps) {
  const total = data.reduce(
    (acc, curr) => acc + (Number(curr[dataKey]) || 0),
    0,
  );

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {subtitle && <CardDescription>{subtitle}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-70 text-muted-foreground text-sm">
            No data available.
          </div>
        </CardContent>
      </Card>
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
      {/* Decorative background glow */}
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-5 dark:opacity-10 bg-primary transition-opacity duration-300 group-hover:opacity-15 pointer-events-none" />

      <CardHeader className="pb-3">
        <CardTitle>{title}</CardTitle>
        {subtitle && <CardDescription>{subtitle}</CardDescription>}
      </CardHeader>

      <div className="relative flex items-center justify-center p-2 pt-0">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={75}
              paddingAngle={3}
              cornerRadius={4}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="var(--color-card)"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label with total count */}
        <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-57%] text-center pointer-events-none">
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground/80 font-bold">
            Total
          </span>
          <div className="text-xl font-extrabold text-foreground leading-none mt-0.5">
            {total.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Custom Grid HTML Legend */}
      <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-xs pt-3 border-t border-border/10">
        {data.map((item, index) => {
          const value = Number(item[dataKey]);
          const percent = total > 0 ? ((value / total) * 100).toFixed(0) : "0";
          const name = String(item[nameKey]);
          const color = COLORS[index % COLORS.length];
          return (
            <div
              key={name}
              className="flex items-center gap-2 px-1.5 py-1 rounded-lg hover:bg-muted/40 transition-colors duration-150 min-w-0"
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/5 dark:border-white/5"
                style={{ backgroundColor: color }}
              />
              <span
                className="text-muted-foreground/90 font-medium truncate flex-1 capitalize"
                title={name}
              >
                {name}
              </span>
              <span className="font-semibold text-foreground">{value}</span>
              <span className="text-[10px] text-muted-foreground/50 font-mono">
                ({percent}%)
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

interface DonutGridProps {
  ordersByStatus: DistributionItem[];
  ordersBySource: DistributionItem[];
  usersByRole: DistributionItem[];
  gigsByStatus: DistributionItem[];
  jobsByStatus: DistributionItem[];
  jobsByType: DistributionItem[];
  proposalsByStatus: DistributionItem[];
}

export function DonutGrid({
  ordersByStatus,
  ordersBySource,
  usersByRole,
  gigsByStatus,
  jobsByStatus,
  jobsByType,
  proposalsByStatus,
}: DonutGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <PieChartCard
        title="Orders by Status"
        data={ordersByStatus}
        dataKey="count"
        nameKey="status"
      />
      <PieChartCard
        title="Orders by Source"
        data={ordersBySource}
        dataKey="count"
        nameKey="source"
      />
      <PieChartCard
        title="Users by Role"
        data={usersByRole}
        dataKey="count"
        nameKey="role"
      />
      <PieChartCard
        title="Gigs by Status"
        data={gigsByStatus}
        dataKey="count"
        nameKey="status"
      />
      <PieChartCard
        title="Jobs by Status"
        data={jobsByStatus}
        dataKey="count"
        nameKey="status"
      />
      <PieChartCard
        title="Jobs by Type"
        data={jobsByType}
        dataKey="count"
        nameKey="type"
      />
      <PieChartCard
        title="Proposals by Status"
        data={proposalsByStatus}
        dataKey="count"
        nameKey="status"
      />
    </div>
  );
}
