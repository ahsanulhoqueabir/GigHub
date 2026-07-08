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
import { cn } from "@/lib/utils";
import { selectIsAuthenticated, useAuthStore } from "@/store/auth.store";
import {
  IconBriefcase,
  IconLogout,
  IconMenu2,
  IconShoppingCart,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Gigs", href: "/gigs" },
  { label: "Jobs", href: "/jobs" },
];

const profileMenuItems = [
  { label: "Profile", href: "/profile", icon: IconUser },
  { label: "Applied Jobs", href: "/profile/applied-jobs", icon: IconBriefcase },
  { label: "Orders", href: "/profile/orders", icon: IconShoppingCart },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const user = useAuthStore((s) => s.user);
  const isAuthenticated = selectIsAuthenticated(useAuthStore.getState());
  const logout = useAuthStore((s) => s.logout);

  const userInitial = user?.name?.charAt(0)?.toUpperCase() ?? "U";

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
                    {profileMenuItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-card-foreground transition-colors hover:bg-muted"
                      >
                        <item.icon className="size-4 text-muted-foreground" />
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
            <div className="flex flex-col h-full">
              {/* Mobile Header */}
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <span className="text-sm font-semibold text-foreground">
                  Menu
                </span>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" aria-label="Close menu">
                    <IconX className="size-5" />
                  </Button>
                </SheetClose>
              </div>

              {/* Mobile Auth Info */}
              {isAuthenticated && user ? (
                <div className="border-b border-border px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
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
                      <p className="truncate text-xs text-muted-foreground">
                        @{user.username}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Mobile Nav Items */}
              <div className="flex-1 overflow-y-auto px-2 py-3">
                <div className="space-y-1">
                  <p className="px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Navigation
                  </p>
                  {navItems.map((item) => (
                    <SheetClose key={item.href} asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          pathname === item.href
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        {item.label}
                      </Link>
                    </SheetClose>
                  ))}
                </div>

                {/* Mobile Profile Menu (when authenticated) */}
                {isAuthenticated && user ? (
                  <>
                    <Separator className="my-3" />
                    <div className="space-y-1">
                      <p className="px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Account
                      </p>
                      {profileMenuItems.map((item) => (
                        <SheetClose key={item.href} asChild>
                          <Link
                            href={item.href}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <item.icon className="size-4" />
                            {item.label}
                          </Link>
                        </SheetClose>
                      ))}
                      <Separator className="my-1" />
                      <button
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                      >
                        <IconLogout className="size-4" />
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Separator className="my-3" />
                    <div className="px-2">
                      <SheetClose asChild>
                        <Button asChild className="w-full" size="lg">
                          <Link href="/login">Sign In</Link>
                        </Button>
                      </SheetClose>
                    </div>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
