"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { profileNavConfig } from "@/config/nav-config";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import {
  IconBriefcase,
  IconBuilding,
  IconChevronRight,
  IconLayoutGrid,
  IconSettings,
  IconUser,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { accessToken, hasHydrated, user } = useAuthStore();

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => ({
    gigs: pathname.startsWith("/profile/gigs"),
    jobs: pathname.startsWith("/profile/jobs"),
  }));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  useEffect(() => {
    if (!hasHydrated) return;
    if (!accessToken) {
      router.replace("/login");
    }
  }, [accessToken, hasHydrated, router]);

  if (!hasHydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!accessToken) {
    return null;
  }

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Navigation categories
  const mainItems = profileNavConfig.filter((item) =>
    [
      "profile",
      "chat",
      "applied-jobs",
      "incoming-proposals",
      "orders",
      "wallet",
      "escrow",
    ].includes(item.id),
  );

  const gigItems = profileNavConfig.filter((item) =>
    ["create-gig", "manage-gigs"].includes(item.id),
  );

  const jobItems = profileNavConfig.filter((item) =>
    ["create-job", "manage-jobs"].includes(item.id),
  );

  // Find current active item details for mobile view preview
  const currentItem = profileNavConfig.find((item) => item.href === pathname);
  const CurrentIcon = currentItem?.icon || IconUser;
  const currentLabel = currentItem?.label || "Overview";

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
      {/* ── Mobile Navigation (Grid with Mixup Menu) ── */}
      <div className="block lg:hidden w-full shrink-0">
        <AnimatePresence mode="wait">
          {!isMobileMenuOpen ? (
            <motion.div
              key="mobile-nav-collapsed"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full border border-border/40 bg-card/60 backdrop-blur-md shadow-xs rounded-2xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <CurrentIcon className="size-4.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/80">
                    Profile Settings
                  </span>
                  <span className="text-sm font-bold text-foreground mt-0.5">
                    {currentLabel}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMobileMenuOpen(true)}
                className="text-xs h-9 gap-1.5 cursor-pointer rounded-xl font-medium hover:bg-accent/40 border-border/60"
              >
                <IconLayoutGrid className="size-3.5 text-primary" />
                <span>Quick Menu</span>
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="mobile-nav-expanded"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full border border-border/40 bg-card/75 backdrop-blur-lg shadow-lg rounded-2xl p-4 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <IconLayoutGrid className="size-4.5 text-primary" />
                  <span className="text-sm font-bold text-foreground">
                    Settings & Tasks
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-xs h-8 cursor-pointer rounded-lg hover:bg-accent/40 hover:text-foreground text-muted-foreground font-semibold"
                >
                  Close
                </Button>
              </div>

              {/* Mixup Grid Categories */}
              <div className="flex flex-col gap-4">
                {/* 1. Main Navigation Grid */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase px-1">
                    General
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {mainItems.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            "flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-200 cursor-pointer gap-1.5 min-h-20",
                            isActive
                              ? "bg-primary/10 border-primary/40 text-primary shadow-xs"
                              : "bg-background/40 border-border/40 hover:border-border text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {Icon && (
                            <Icon
                              className={cn(
                                "size-4.5",
                                isActive
                                  ? "text-primary animate-pulse"
                                  : "text-muted-foreground",
                              )}
                            />
                          )}
                          <span className="text-[11px] font-semibold tracking-tight">
                            {item.label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Gigs Grid */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase px-1">
                    Gigs
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {gigItems.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            "flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-200 cursor-pointer gap-1.5 min-h-20",
                            isActive
                              ? "bg-primary/10 border-primary/40 text-primary shadow-xs"
                              : "bg-background/40 border-border/40 hover:border-border text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {Icon && (
                            <Icon
                              className={cn(
                                "size-4.5",
                                isActive
                                  ? "text-primary animate-pulse"
                                  : "text-muted-foreground",
                              )}
                            />
                          )}
                          <span className="text-[11px] font-semibold tracking-tight">
                            {item.label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Jobs Grid */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase px-1">
                    Jobs
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {jobItems.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            "flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-200 cursor-pointer gap-1.5 min-h-20",
                            isActive
                              ? "bg-primary/10 border-primary/40 text-primary shadow-xs"
                              : "bg-background/40 border-border/40 hover:border-border text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {Icon && (
                            <Icon
                              className={cn(
                                "size-4.5",
                                isActive
                                  ? "text-primary animate-pulse"
                                  : "text-muted-foreground",
                              )}
                            />
                          )}
                          <span className="text-[11px] font-semibold tracking-tight">
                            {item.label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Admin Link (If Admin User) */}
                {user?.role === "admin" && (
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold tracking-wider text-secondary-dark uppercase px-1">
                      Administration
                    </span>
                    <Link
                      href="/admin"
                      className="flex items-center justify-center p-3 rounded-xl border border-secondary/20 bg-secondary/5 text-secondary-dark text-center transition-all duration-200 cursor-pointer gap-2.5"
                    >
                      <IconSettings className="size-4 text-secondary-dark" />
                      <span className="text-xs font-bold text-secondary-dark">
                        Admin Dashboard
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-24 border border-border/40 bg-card/50 backdrop-blur-md shadow-xs rounded-2xl p-4 flex flex-col gap-5">
          {/* Profile Overview Header */}
          <div className="flex flex-col items-center text-center p-3 pb-5 border-b border-border/50">
            <Avatar className="h-16 w-16 ring-4 ring-primary/10 mb-3 shrink-0">
              <AvatarFallback className="text-base font-semibold bg-primary/10 text-primary">
                {initials || "U"}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-sm font-bold text-foreground leading-tight truncate max-w-full">
              {user?.name || "Student"}
            </h3>
            <p className="text-[10px] font-semibold text-muted-foreground mt-1.5 px-2.5 py-0.5 rounded-full bg-secondary/10 border border-secondary/20 whitespace-nowrap">
              Student Profile
            </p>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-3">
            {/* General Settings */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-bold text-muted-foreground/60 uppercase px-3 tracking-wider">
                General
              </span>
              {mainItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all relative group cursor-pointer",
                      isActive
                        ? "text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="profile-active-nav"
                        className="absolute inset-0 bg-primary/10 border-l-2 border-primary rounded-xl z-0"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                    {item.icon && (
                      <item.icon
                        className={cn(
                          "size-4 shrink-0 z-10 transition-transform duration-200 group-hover:scale-105",
                          isActive
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-foreground",
                        )}
                      />
                    )}
                    <span className="z-10 truncate group-hover:translate-x-0.5 transition-transform duration-200">
                      {item.label}
                    </span>
                    {isActive && (
                      <IconChevronRight className="size-4 ml-auto shrink-0 z-10 text-primary" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Management Section */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-border/50">
              <span className="text-[9px] font-bold text-muted-foreground/60 uppercase px-3 tracking-wider">
                Management
              </span>

              {/* Gig Management Group */}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => toggleGroup("gigs")}
                  className={cn(
                    "flex items-center justify-between w-full rounded-xl px-3.5 py-2 text-sm font-medium transition-all relative group cursor-pointer",
                    pathname.startsWith("/profile/gigs")
                      ? "text-primary font-semibold bg-primary/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/20",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <IconBriefcase
                      className={cn(
                        "size-4 shrink-0 transition-transform duration-200 group-hover:scale-105",
                        pathname.startsWith("/profile/gigs")
                          ? "text-primary"
                          : "text-muted-foreground group-hover:text-foreground",
                      )}
                    />
                    <span className="truncate whitespace-nowrap">Gigs</span>
                  </div>
                  <IconChevronRight
                    className={cn(
                      "size-4 shrink-0 transition-transform duration-250 text-muted-foreground/70 group-hover:text-foreground",
                      openGroups.gigs ? "rotate-90 text-primary" : "rotate-0",
                    )}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {openGroups.gigs && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="relative pl-6 py-1 ml-5.25 my-1 border-l border-border/80 flex flex-col gap-1">
                        {gigItems.map((child) => {
                          const isChildActive = pathname === child.href;
                          return (
                            <Link
                              key={child.id}
                              href={child.href}
                              className={cn(
                                "flex items-center rounded-lg px-3 py-2 text-xs font-medium transition-all relative group",
                                isChildActive
                                  ? "text-primary font-semibold bg-primary/5"
                                  : "text-muted-foreground hover:text-foreground hover:bg-accent/20",
                              )}
                            >
                              {isChildActive && (
                                <motion.span
                                  layoutId="active-profile-child-dot"
                                  className="absolute -left-3.75 w-1.5 h-1.5 rounded-full bg-primary"
                                  transition={{
                                    type: "spring",
                                    stiffness: 380,
                                    damping: 30,
                                  }}
                                />
                              )}
                              <span className="translate-x-0 group-hover:translate-x-0.5 transition-transform duration-200">
                                {child.label}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Job Management Group */}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => toggleGroup("jobs")}
                  className={cn(
                    "flex items-center justify-between w-full rounded-xl px-3.5 py-2 text-sm font-medium transition-all relative group cursor-pointer",
                    pathname.startsWith("/profile/jobs")
                      ? "text-primary font-semibold bg-primary/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/20",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <IconBuilding
                      className={cn(
                        "size-4 shrink-0 transition-transform duration-200 group-hover:scale-105",
                        pathname.startsWith("/profile/jobs")
                          ? "text-primary"
                          : "text-muted-foreground group-hover:text-foreground",
                      )}
                    />
                    <span className="truncate whitespace-nowrap">Jobs</span>
                  </div>
                  <IconChevronRight
                    className={cn(
                      "size-4 shrink-0 transition-transform duration-250 text-muted-foreground/70 group-hover:text-foreground",
                      openGroups.jobs ? "rotate-90 text-primary" : "rotate-0",
                    )}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {openGroups.jobs && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="relative pl-6 py-1 ml-5.25 my-1 border-l border-border/80 flex flex-col gap-1">
                        {jobItems.map((child) => {
                          const isChildActive = pathname === child.href;
                          return (
                            <Link
                              key={child.id}
                              href={child.href}
                              className={cn(
                                "flex items-center rounded-lg px-3 py-2 text-xs font-medium transition-all relative group",
                                isChildActive
                                  ? "text-primary font-semibold bg-primary/5"
                                  : "text-muted-foreground hover:text-foreground hover:bg-accent/20",
                              )}
                            >
                              {isChildActive && (
                                <motion.span
                                  layoutId="active-profile-child-dot"
                                  className="absolute -left-3.75 w-1.5 h-1.5 rounded-full bg-primary"
                                  transition={{
                                    type: "spring",
                                    stiffness: 380,
                                    damping: 30,
                                  }}
                                />
                              )}
                              <span className="translate-x-0 group-hover:translate-x-0.5 transition-transform duration-200">
                                {child.label}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Admin Switcher (If Admin User) */}
            {user?.role === "admin" && (
              <div className="mt-4 pt-4 border-t border-border/50 flex flex-col gap-1">
                <span className="text-[9px] font-bold text-secondary-dark uppercase px-3 tracking-wider">
                  Administration
                </span>
                <Link
                  href="/admin"
                  className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold transition-all relative group cursor-pointer text-secondary-dark bg-secondary/5 border border-secondary/20 hover:bg-secondary/10"
                >
                  <IconSettings className="size-4 shrink-0 text-secondary-dark" />
                  <span className="truncate">Admin Dashboard</span>
                  <IconChevronRight className="size-4 ml-auto shrink-0 text-secondary-dark transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            )}
          </nav>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
