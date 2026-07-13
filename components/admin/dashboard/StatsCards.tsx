"use client";

import type { DashboardStats } from "@/types/admin-dashboard.types";
import {
  IconBriefcase,
  IconBuilding,
  IconCategory,
  IconCurrencyDollar,
  IconFileDescription,
  IconShoppingCart,
  IconStar,
  IconUsers,
} from "@tabler/icons-react";
import { motion } from "motion/react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: string;
  trendUp?: boolean;
}

const colorThemes: Record<
  string,
  {
    accent: string;
    glow: string;
    iconBg: string;
    borderHover: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  "Total Revenue": {
    accent: "emerald",
    glow: "bg-emerald-500",
    iconBg:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20",
    borderHover: "hover:border-emerald-500/30 dark:hover:border-emerald-500/20",
    badgeBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    badgeText: "text-emerald-700 dark:text-emerald-300",
  },
  "Total Users": {
    accent: "blue",
    glow: "bg-blue-500",
    iconBg:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 dark:bg-blue-500/20",
    borderHover: "hover:border-blue-500/30 dark:hover:border-blue-500/20",
    badgeBg: "bg-blue-500/10 dark:bg-blue-500/20",
    badgeText: "text-blue-700 dark:text-blue-300",
  },
  Orders: {
    accent: "amber",
    glow: "bg-amber-500",
    iconBg:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 dark:bg-amber-500/20",
    borderHover: "hover:border-amber-500/30 dark:hover:border-amber-500/20",
    badgeBg: "bg-amber-500/10 dark:bg-amber-500/20",
    badgeText: "text-amber-700 dark:text-amber-300",
  },
  Gigs: {
    accent: "violet",
    glow: "bg-violet-500",
    iconBg:
      "bg-violet-500/10 text-violet-600 dark:text-violet-400 dark:bg-violet-500/20",
    borderHover: "hover:border-violet-500/30 dark:hover:border-violet-500/20",
    badgeBg: "bg-violet-500/10 dark:bg-violet-500/20",
    badgeText: "text-violet-700 dark:text-violet-300",
  },
  Jobs: {
    accent: "sky",
    glow: "bg-sky-500",
    iconBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 dark:bg-sky-500/20",
    borderHover: "hover:border-sky-500/30 dark:hover:border-sky-500/20",
    badgeBg: "bg-sky-500/10 dark:bg-sky-500/20",
    badgeText: "text-sky-700 dark:text-sky-300",
  },
  Reviews: {
    accent: "rose",
    glow: "bg-rose-500",
    iconBg:
      "bg-rose-500/10 text-rose-600 dark:text-rose-400 dark:bg-rose-500/20",
    borderHover: "hover:border-rose-500/30 dark:hover:border-rose-500/20",
    badgeBg: "bg-rose-500/10 dark:bg-rose-500/20",
    badgeText: "text-rose-700 dark:text-rose-300",
  },
  Categories: {
    accent: "teal",
    glow: "bg-teal-500",
    iconBg:
      "bg-teal-500/10 text-teal-600 dark:text-teal-400 dark:bg-teal-500/20",
    borderHover: "hover:border-teal-500/30 dark:hover:border-teal-500/20",
    badgeBg: "bg-teal-500/10 dark:bg-teal-500/20",
    badgeText: "text-teal-700 dark:text-teal-300",
  },
  Departments: {
    accent: "fuchsia",
    glow: "bg-fuchsia-500",
    iconBg:
      "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 dark:bg-fuchsia-500/20",
    borderHover: "hover:border-fuchsia-500/30 dark:hover:border-fuchsia-500/20",
    badgeBg: "bg-fuchsia-500/10 dark:bg-fuchsia-500/20",
    badgeText: "text-fuchsia-700 dark:text-fuchsia-300",
  },
};

const defaultTheme = {
  accent: "primary",
  glow: "bg-primary",
  iconBg: "bg-primary/10 text-primary",
  borderHover: "hover:border-primary/30",
  badgeBg: "bg-primary/10",
  badgeText: "text-primary",
};

function StatCard({
  title,
  value,
  icon,
  subtitle,
  trend,
  trendUp,
}: StatCardProps) {
  const theme = colorThemes[title] || defaultTheme;

  const renderSubtitle = (sub: string) => {
    if (sub.includes(" · ")) {
      const parts = sub.split(" · ");
      return (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {parts.map((part, index) => (
            <span
              key={index}
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full tracking-wide transition-colors ${theme.badgeBg} ${theme.badgeText}`}
            >
              {part}
            </span>
          ))}
        </div>
      );
    }
    return (
      <p className="text-xs text-muted-foreground/80 mt-2 font-medium tracking-wide">
        {sub}
      </p>
    );
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 },
    },
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{
        y: -4,
        transition: { duration: 0.2, ease: "easeOut" },
      }}
      className={`relative overflow-hidden rounded-2xl border border-border/40 bg-linear-to-b from-card to-card/90 dark:from-card/50 dark:to-card/30 p-5 shadow-sm transition-all duration-300 group ${theme.borderHover}`}
    >
      {/* Decorative background glow top-right */}
      <div
        className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-10 dark:opacity-15 transition-opacity duration-300 group-hover:opacity-20 ${theme.glow}`}
      />

      {/* Decorative background glow bottom-left */}
      <div
        className={`absolute -left-10 -bottom-10 w-28 h-28 rounded-full blur-3xl opacity-5 dark:opacity-10 transition-opacity duration-300 group-hover:opacity-15 ${theme.glow}`}
      />

      {/* Icon - absolute positioned top-right, large & decorative */}
      <div
        className={`absolute -top-3 -right-3 text-6xl size-28 flex items-center justify-center transition-all duration-300 group-hover:scale-110 opacity-60 text-muted-foreground/20`}
      >
        {icon}
      </div>

      <div className="flex flex-row items-center justify-between space-y-0 pb-3">
        <h3 className="tracking-wider text-xs font-semibold uppercase text-muted-foreground/80">
          {title}
        </h3>
      </div>

      <div className="mt-1">
        <div className="text-2xl font-bold tracking-tight text-foreground bg-linear-to-br from-foreground via-foreground to-foreground/80 bg-clip-text">
          {value}
        </div>
        {subtitle && renderSubtitle(subtitle)}
        {trend && (
          <div
            className={`text-xs mt-2.5 flex items-center gap-1.5 font-medium ${trendUp ? "text-emerald-500" : "text-rose-500"}`}
          >
            <span
              className={`flex items-center justify-center w-4 h-4 rounded-full text-[10px] ${
                trendUp
                  ? "bg-emerald-500/10 dark:bg-emerald-500/20"
                  : "bg-rose-500/10 dark:bg-rose-500/20"
              }`}
            >
              {trendUp ? "↑" : "↓"}
            </span>
            <span>{trend}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface StatsCardsProps {
  stats: DashboardStats;
  currencySymbol?: string;
}

export function StatsCards({ stats, currencySymbol = "$" }: StatsCardsProps) {
  const cards: StatCardProps[] = [
    {
      title: "Total Revenue",
      value: `${currencySymbol}${Number(stats.total_revenue).toLocaleString()}`,
      icon: <IconCurrencyDollar className="h-9 w-9" />,
      subtitle: `${currencySymbol}${Number(stats.total_platform_fee).toLocaleString()} platform fees collected`,
    },
    {
      title: "Total Users",
      value: stats.total_users.toLocaleString(),
      icon: <IconUsers className="h-9 w-9" />,
      subtitle: `${stats.active_users} active · ${stats.verified_users} verified · ${stats.admin_users} admins`,
    },
    {
      title: "Orders",
      value: stats.total_orders.toLocaleString(),
      icon: <IconShoppingCart className="h-9 w-9" />,
      subtitle: `${stats.completed_orders} completed · ${stats.in_progress_orders} in progress · ${stats.pending_orders} pending`,
    },
    {
      title: "Gigs",
      value: stats.total_gigs.toLocaleString(),
      icon: <IconBriefcase className="h-9 w-9" />,
      subtitle: `${stats.active_gigs} active`,
    },
    {
      title: "Jobs",
      value: stats.total_jobs.toLocaleString(),
      icon: <IconFileDescription className="h-9 w-9" />,
      subtitle: `${stats.active_jobs} active`,
    },
    {
      title: "Reviews",
      value: stats.total_reviews.toLocaleString(),
      icon: <IconStar className="h-9 w-9" />,
      subtitle: `Avg rating: ${stats.avg_rating} / 5`,
    },
    {
      title: "Categories",
      value: stats.total_categories.toLocaleString(),
      icon: <IconCategory className="h-9 w-9" />,
    },
    {
      title: "Departments",
      value: stats.total_departments.toLocaleString(),
      icon: <IconBuilding className="h-9 w-9" />,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
    >
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </motion.div>
  );
}
