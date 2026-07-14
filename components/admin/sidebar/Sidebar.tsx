"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { branding } from "@/config/brand.config";
import { adminNavConfig } from "@/config/nav-config";
import { useReturnTo } from "@/hooks/use-return-to";
import { useMounted } from "@/hooks/useMounted";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import {
  IconChevronLeft,
  IconChevronRight,
  IconLogout,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { withReturnTo } = useReturnTo();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [isCollapsed, setIsCollapsed] = useState(false);

  const mounted = useMounted();

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("admin-sidebar-collapsed", String(next));
      return next;
    });
  };

  const toggleOpen = (id: string) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLogout = () => {
    logout();
    router.push(withReturnTo("/login"));
  };

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const renderNavItem = (item: (typeof adminNavConfig)[number]) => {
    const Icon = item.icon;
    const isActive =
      pathname === item.href ||
      (item.children && pathname.startsWith(item.href));
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openItems[item.id];

    if (isCollapsed) {
      if (hasChildren) {
        return (
          <DropdownMenu key={item.id}>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex items-center justify-center w-12 h-12 mx-auto rounded-xl transition-all relative group cursor-pointer",
                  isActive
                    ? "bg-primary/10 text-primary shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/40",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-indicator-collapsed"
                    className="absolute left-0 w-1 h-6 rounded-r-lg bg-primary"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                {Icon && (
                  <Icon className="h-5 w-5 shrink-0 transition-transform group-hover:scale-105" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="right"
              align="start"
              className="w-52 ml-3 p-1.5 shadow-xl border border-border/40"
            >
              <DropdownMenuLabel className="font-semibold text-xs text-muted-foreground px-2.5 py-1.5">
                {item.label}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {item.children?.map((child) => {
                const isChildActive = pathname === child.href;
                return (
                  <DropdownMenuItem key={child.id} asChild>
                    <Link
                      href={child.href}
                      className={cn(
                        "w-full cursor-pointer px-2.5 py-2 text-sm rounded-md transition-colors",
                        isChildActive
                          ? "text-primary font-medium bg-primary/5 focus:bg-primary/5 focus:text-primary"
                          : "text-muted-foreground focus:text-foreground",
                      )}
                    >
                      {child.label}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }

      return (
        <Tooltip key={item.id} delayDuration={0}>
          <TooltipTrigger asChild>
            <Link
              href={item.href}
              className={cn(
                "flex items-center justify-center w-12 h-12 mx-auto rounded-xl transition-all relative group",
                isActive
                  ? "bg-primary/10 text-primary shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/40",
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-indicator-collapsed"
                  className="absolute left-0 w-1 h-6 rounded-r-lg bg-primary"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
              {Icon && (
                <Icon className="h-5 w-5 shrink-0 transition-transform group-hover:scale-105" />
              )}
            </Link>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            className="ml-3 font-medium bg-foreground text-background shadow-md"
          >
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    // Expanded mode
    return (
      <div key={item.id} className="grid gap-1 px-3">
        {hasChildren ? (
          <>
            <button
              onClick={() => toggleOpen(item.id)}
              className={cn(
                "flex items-center justify-between w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-all relative group cursor-pointer",
                isActive
                  ? "bg-primary/10 text-primary shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/30",
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-indicator-expanded"
                  className="absolute left-0 w-1.5 h-6 rounded-r-lg bg-primary"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
              <div className="flex items-center gap-3">
                {Icon && (
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-transform duration-250 group-hover:scale-105",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground",
                    )}
                  />
                )}
                <span className="truncate whitespace-nowrap transition-colors duration-200">
                  {item.label}
                </span>
              </div>
              <IconChevronRight
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-250 text-muted-foreground/70 group-hover:text-foreground",
                  isOpen ? "rotate-90 text-primary" : "rotate-0",
                )}
              />
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="relative pl-6 py-1 ml-5.25 my-1 border-l border-border/80 flex flex-col gap-1">
                    {item.children?.map((child) => {
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
                              layoutId="active-child-dot"
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
          </>
        ) : (
          <Link
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all relative group",
              isActive
                ? "bg-primary/10 text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/30",
            )}
          >
            {isActive && (
              <motion.div
                layoutId="active-indicator-expanded"
                className="absolute left-0 w-1.5 h-6 rounded-r-lg bg-primary"
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            )}
            {Icon && (
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform duration-250 group-hover:scale-105",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              />
            )}
            <span className="truncate whitespace-nowrap transition-colors duration-200">
              {item.label}
            </span>
          </Link>
        )}
      </div>
    );
  };

  // Prevent flash or server-side hydration mismatch by rendering a skeleton or simplified version until mounted
  if (!mounted) {
    return (
      <aside className="hidden md:flex md:flex-col md:w-64 md:shrink-0 md:h-screen md:sticky md:top-0 border-r border-border/60 bg-background" />
    );
  }

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "hidden md:flex md:flex-col md:shrink-0 md:h-screen md:sticky md:top-0 border-r border-border/60 bg-background/95 backdrop-blur-md shadow-xs transition-all duration-300 ease-in-out relative z-40",
          isCollapsed ? "md:w-19.5" : "md:w-64",
        )}
      >
        {/* Toggle Button */}
        <button
          onClick={toggleCollapse}
          className="absolute -right-3.5 top-6 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background shadow-xs hover:bg-accent text-muted-foreground hover:text-foreground transition-all z-50 cursor-pointer hover:scale-105"
        >
          {isCollapsed ? (
            <IconChevronRight className="h-4 w-4" />
          ) : (
            <IconChevronLeft className="h-4 w-4" />
          )}
        </button>

        {/* Header / Logo */}
        <div
          className={cn(
            "flex items-center px-4 h-16 border-b border-border/50 shrink-0 overflow-hidden",
            isCollapsed ? "justify-center" : "gap-3",
          )}
        >
          <div className="relative size-9 flex items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs border border-primary/20 shrink-0">
            <Image
              src={branding.logo}
              alt="Logo"
              width={20}
              height={20}
              className="size-5 shrink-0"
            />
          </div>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                key="branding-text"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col overflow-hidden whitespace-nowrap"
              >
                <span className="text-sm font-bold tracking-tight text-foreground leading-none">
                  {branding.title}
                </span>
                <span className="text-[10px] text-muted-foreground mt-1 font-medium">
                  Admin Panel
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className={cn("grid gap-1.5", isCollapsed ? "px-2" : "px-0")}>
            {adminNavConfig.map(renderNavItem)}
          </nav>
        </ScrollArea>

        {/* User Card Footer */}
        {isCollapsed ? (
          <div className="p-3 mt-auto border-t border-border/50 flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-center p-1.5 rounded-xl hover:bg-accent/50 transition-all cursor-pointer">
                  <Avatar className="h-9 w-9 ring-2 ring-primary/10 hover:ring-primary/20 transition-all">
                    <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                      {initials || "A"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="right"
                align="end"
                className="w-56 ml-3 p-1.5 border border-border/40 shadow-xl"
              >
                <DropdownMenuLabel className="font-normal p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none truncate">
                      {user?.name || "Admin"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {user?.email || ""}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer px-2.5 py-2 text-sm rounded-md"
                >
                  <IconLogout className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="border-t border-border/50 p-4 mt-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-accent/40 text-left transition-all group cursor-pointer border border-transparent hover:border-border/30">
                  <Avatar className="h-9 w-9 shrink-0 ring-2 ring-primary/10 group-hover:ring-primary/20 transition-all">
                    <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                      {initials || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold leading-none truncate text-foreground group-hover:text-primary transition-colors">
                      {user?.name || "Admin"}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate mt-1">
                      {user?.email || ""}
                    </p>
                  </div>
                  <IconChevronRight className="h-4 w-4 text-muted-foreground/60 shrink-0 group-hover:text-foreground transition-transform group-hover:translate-x-0.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="right"
                align="end"
                className="w-56 ml-3 p-1.5 border border-border/40 shadow-xl"
              >
                <DropdownMenuLabel className="font-normal p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none truncate">
                      {user?.name || "Admin"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {user?.email || ""}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer px-2.5 py-2 text-sm rounded-md"
                >
                  <IconLogout className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}
