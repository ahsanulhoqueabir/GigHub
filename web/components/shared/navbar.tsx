"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { menu, userMenu, siteConfig } from "@/config/site.config";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { useAuthStore, selectIsAuthenticated } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { IconLogout, IconChevronDown } from "@tabler/icons-react";
import { useState, useRef, useEffect } from "react";

export function Navbar() {
  const pathname = usePathname();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const isProcessing = useAuthStore((s) => s.isProcessing);
  const logout = useAuthStore((s) => s.logout);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const showAuthUi = hasHydrated && !isProcessing;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-lg tracking-tight"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
            G
          </span>
          <span className="hidden sm:inline">{siteConfig.name}</span>
        </Link>

        {/* Desktop Nav (public items only) */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {menu.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                )}
              >
                <Icon size={16} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3 ml-auto">
          {showAuthUi && isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              {/* Profile trigger */}
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  profileOpen
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                )}
              >
                <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <span className="hidden lg:inline truncate max-w-25">
                  {user.name}
                </span>
                <IconChevronDown
                  size={14}
                  className={cn(
                    "hidden lg:block transition-transform",
                    profileOpen && "rotate-180",
                  )}
                />
              </button>

              {/* Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 rounded-xl border border-border bg-background p-2 shadow-lg">
                  <div className="border-b border-border px-3 pb-2 mb-2">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email || ""}
                    </p>
                  </div>
                  <nav className="flex flex-col gap-0.5">
                    {userMenu.map((item) => {
                      const isActive =
                        item.href === "/"
                          ? pathname === "/"
                          : pathname.startsWith(item.href);
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setProfileOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-muted text-foreground"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                          )}
                        >
                          <Icon size={16} />
                          {item.name}
                        </Link>
                      );
                    })}
                  </nav>
                  {/* Settings sub-section: theme toggle */}
                  <div className="border-t border-border mt-2 pt-2 px-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Theme
                      </span>
                      <ThemeToggle />
                    </div>
                  </div>
                  <div className="border-t border-border mt-2 pt-2">
                    <button
                      onClick={() => {
                        logout();
                        setProfileOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <IconLogout size={16} />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : showAuthUi ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Get started</Link>
              </Button>
            </div>
          ) : null}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Toggle menu"
          >
            <div className="flex flex-col gap-1">
              <span
                className={cn(
                  "block h-0.5 w-5 rounded-full bg-current transition-transform",
                  mobileMenuOpen && "translate-y-1.5 rotate-45",
                )}
              />
              <span
                className={cn(
                  "block h-0.5 w-5 rounded-full bg-current transition-opacity",
                  mobileMenuOpen && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "block h-0.5 w-5 rounded-full bg-current transition-transform",
                  mobileMenuOpen && "-translate-y-1.5 -rotate-45",
                )}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="flex flex-col gap-1 px-4 py-3">
            {menu.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}
            {/* User menu items in mobile when authenticated */}
            {isAuthenticated && (
              <>
                <div className="border-t border-border my-2" />
                {userMenu.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                      )}
                    >
                      <Icon size={18} />
                      {item.name}
                    </Link>
                  );
                })}
                <div className="border-t border-border mt-2 pt-2 px-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Theme</span>
                    <ThemeToggle />
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors mt-1"
                >
                  <IconLogout size={18} />
                  Sign out
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
