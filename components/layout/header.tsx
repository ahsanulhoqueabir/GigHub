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
  IconHome,
  IconLogout,
  IconMenu2,
  IconShield,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems: NavItem[] = [
  { id: "home", label: "Home", href: "/", icon: IconHome },
  { id: "gigs", label: "Gigs", href: "/gigs", icon: IconHome },
  { id: "jobs", label: "Jobs", href: "/jobs", icon: IconHome },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { withReturnTo } = useReturnTo();

  const user = useAuthStore((s) => s.user);
  const isAuthenticated = selectIsAuthenticated(useAuthStore.getState());
  const { isAdmin } = useAdminRole();
  const logout = useAuthStore((s) => s.logout);

  const userInitial = user?.name?.charAt(0)?.toUpperCase() ?? "U";

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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
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

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth Section */}
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-muted"
              >
                <Avatar size="sm">
                  <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                  <AvatarFallback>{userInitial}</AvatarFallback>
                </Avatar>
                <span className="max-w-30 truncate text-sm font-medium text-foreground">
                  {user.name}
                </span>
              </button>

              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-1.5 w-56 rounded-xl border border-border bg-card p-1.5 shadow-lg">
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
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <IconLogout className="size-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Button asChild variant="default" size="sm">
              <Link href="/login">Sign In</Link>
            </Button>
          )}
        </div>

        {/* Mobile Menu Trigger */}
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
              className="flex flex-col h-full"
            >
              {/* Mobile Auth Info */}
              {isAuthenticated && user ? (
                <motion.div
                  variants={avatarVariants}
                  initial="hidden"
                  animate="visible"
                  className="py-3 px-4"
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

              {/* Mobile Nav Items */}
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
                              "flex items-center gap-2 border relative rounded-lg px-3 py-5 text-sm font-medium transition-colors",
                              pathname === item.href
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                            )}
                          >
                            {item.label}
                            {item.icon && (
                              <item.icon className="size-12 opacity-10 absolute bottom-0 right-0" />
                            )}
                          </Link>
                        </SheetClose>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Mobile Profile Menu (when authenticated) */}
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
                          Logout
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
