"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { branding } from "@/config/brand.config";
import type { NavItem } from "@/config/nav-config";
import { profileNavConfig } from "@/config/nav-config";
import { useReturnTo } from "@/hooks/use-return-to";
import { useAdminRole } from "@/hooks/useAdminRole";
import { cn } from "@/lib/utils";
import { selectIsAuthenticated, useAuthStore } from "@/store/auth.store";
import {
  IconChevronDown,
  IconHome,
  IconLogout,
  IconMenu2,
  IconShield,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems: NavItem[] = [
  { id: "home", label: "Home", href: "/", icon: IconHome },
  { id: "gigs", label: "Gigs", href: "/gigs", icon: IconHome },
  { id: "jobs", label: "Jobs", href: "/jobs", icon: IconHome },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { withReturnTo } = useReturnTo();

  const user = useAuthStore((s) => s.user);
  const isAuthenticated = selectIsAuthenticated(useAuthStore.getState());
  const { isAdmin } = useAdminRole();
  const logout = useAuthStore((s) => s.logout);

  const userInitial = user?.name?.charAt(0)?.toUpperCase() ?? "U";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // ── Mobile animation variants ──────────────────────────────────────────────
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 12, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 260, damping: 24 },
    },
  } as const;

  const avatarVariants = {
    hidden: { opacity: 0, scale: 0.6 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 300, damping: 20 },
    },
  } as const;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md transition-all duration-300",
        scrolled ? "border-border shadow-sm" : "border-transparent",
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ── Logo ──────────────────────────────────────────────────────────── */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground"
        >
          {branding.logo ? (
            <Image
              src={branding.logo}
              alt={branding.title}
              className="h-7 w-auto"
              height={28}
              width={28}
            />
          ) : (
            branding.title
          )}
        </Link>

        {/* ── Desktop Navigation ─────────────────────────────────────────────
             Signature element: a spring-animated pill slides between active
             nav items, giving the nav a polished "selected track" feel.      */}
        <nav className="hidden md:flex">
          <div className="flex items-center gap-0.5 rounded-xl bg-muted/60 p-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-lg px-4 py-1.5 text-sm font-medium transition-colors duration-150",
                  pathname === item.href
                    ? "text-foreground "
                    : "text-muted-foreground hover:text-foreground",
                  "min-w-30 text-center",
                )}
              >
                {pathname === item.href && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-lg bg-accent/30 shadow-sm"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* ── Desktop Auth Section ───────────────────────────────────────────── */}
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated && user ? (
            <div className="relative">
              {/* Profile trigger button */}
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-2 py-1.5 text-sm font-medium transition-all duration-150",
                  profileDropdownOpen
                    ? "border-border bg-muted text-foreground"
                    : "border-transparent text-foreground hover:border-border hover:bg-muted",
                )}
              >
                <Avatar size="sm">
                  <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                  <AvatarFallback>{userInitial}</AvatarFallback>
                </Avatar>
                <span className="max-w-28 truncate">{user.name}</span>
                <motion.div
                  animate={{ rotate: profileDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <IconChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
                </motion.div>
              </button>

              {/* Dropdown */}
              <AnimatePresence>
                {profileDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileDropdownOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96, y: -6 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                      className="absolute right-0 top-full z-50 mt-2 w-60 origin-top-right rounded-xl border border-border bg-card p-1.5 shadow-lg"
                    >
                      {/* User info header inside dropdown */}
                      <div className="mb-1.5 flex items-center gap-3 rounded-lg bg-muted/60 px-3 py-2.5">
                        <Avatar size="sm">
                          <AvatarImage
                            src={user.avatar ?? undefined}
                            alt={user.name}
                          />
                          <AvatarFallback>{userInitial}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">
                            {user.name}
                          </p>
                          {user.username && (
                            <p className="truncate text-xs text-muted-foreground">
                              @{user.username}
                            </p>
                          )}
                        </div>
                      </div>

                      <Separator className="my-1" />

                      {/* Admin link */}
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-card-foreground transition-colors hover:bg-muted"
                        >
                          <IconShield className="size-4 text-muted-foreground" />
                          Admin Panel
                        </Link>
                      )}

                      {/* Profile nav items */}
                      {profileNavConfig.map((item) => (
                        <Link
                          key={item.href}
                          href={
                            item.href === "/profile/gigs/create"
                              ? withReturnTo(item.href)
                              : item.href
                          }
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-card-foreground transition-colors hover:bg-muted"
                        >
                          {item.icon && (
                            <item.icon className="size-4 text-muted-foreground" />
                          )}
                          {item.label}
                        </Link>
                      ))}

                      <Separator className="my-1" />

                      {/* Logout */}
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                      >
                        <IconLogout className="size-4" />
                        Sign out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Button asChild variant="default" size="sm">
              <Link href="/login">Sign In</Link>
            </Button>
          )}
        </div>

        {/* ── Mobile Menu Trigger ────────────────────────────────────────────── */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <IconMenu2 className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="flex h-full flex-col"
            >
              {/* Mobile user info */}
              {isAuthenticated && user ? (
                <motion.div
                  variants={avatarVariants}
                  initial="hidden"
                  animate="visible"
                  className="px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 18,
                      }}
                    >
                      <Avatar>
                        <AvatarImage
                          src={user.avatar ?? undefined}
                          alt={user.name}
                        />
                        <AvatarFallback>{userInitial}</AvatarFallback>
                      </Avatar>
                    </motion.div>
                    <div className="min-w-0 flex-1">
                      <motion.p
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15, duration: 0.3 }}
                        className="truncate text-sm font-medium text-foreground"
                      >
                        {user.name}
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                        className="truncate text-xs text-muted-foreground"
                      >
                        @{user.username}
                      </motion.p>
                    </div>
                  </div>
                </motion.div>
              ) : null}

              {/* Mobile nav items */}
              <div className="flex-1 overflow-y-auto px-2 py-3">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.p
                    variants={itemVariants}
                    className="px-1 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground"
                  >
                    Navigation
                  </motion.p>
                  <div className="grid grid-cols-2 gap-1">
                    {navItems.map((item) => (
                      <motion.div key={item.href} variants={itemVariants}>
                        <SheetClose asChild>
                          <Link
                            href={item.href}
                            className={cn(
                              "relative flex items-center gap-2 overflow-hidden rounded-lg border px-3 py-5 text-sm font-medium transition-colors",
                              pathname === item.href
                                ? "bg-primary/10 text-primary border-primary/20"
                                : "border-border/50 text-muted-foreground hover:bg-muted hover:text-foreground",
                            )}
                          >
                            {item.label}
                            {item.icon && (
                              <item.icon className="absolute bottom-0 right-0 size-12 opacity-10" />
                            )}
                          </Link>
                        </SheetClose>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Mobile profile nav */}
                {isAuthenticated && user ? (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.div variants={itemVariants}>
                      <Separator className="my-3" />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <p className="px-1 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Account
                      </p>
                    </motion.div>
                    <div className="grid grid-cols-2 gap-1">
                      {profileNavConfig.map((item) => (
                        <motion.div key={item.href} variants={itemVariants}>
                          <SheetClose asChild>
                            <Link
                              href={
                                item.href === "/profile/gigs/create"
                                  ? withReturnTo(item.href)
                                  : item.href
                              }
                              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                              {item.icon && (
                                <item.icon className="size-4 shrink-0" />
                              )}
                              <span className="truncate">{item.label}</span>
                            </Link>
                          </SheetClose>
                        </motion.div>
                      ))}
                      <motion.div
                        variants={itemVariants}
                        className="col-span-2"
                      >
                        <button
                          onClick={() => {
                            logout();
                            setMobileMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
                        >
                          <IconLogout className="size-4 shrink-0" />
                          Sign out
                        </button>
                      </motion.div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.div variants={itemVariants}>
                      <Separator className="my-3" />
                    </motion.div>
                    <motion.div variants={itemVariants} className="px-2">
                      <SheetClose asChild>
                        <Button asChild className="w-full" size="lg">
                          <Link href="/login">Sign In</Link>
                        </Button>
                      </SheetClose>
                    </motion.div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
