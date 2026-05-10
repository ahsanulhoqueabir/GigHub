"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { bottomNav } from "@/config/site.config";
import { cn } from "@/lib/utils";
import { useAuthStore, selectIsAuthenticated } from "@/store/auth.store";

export function BottomNav() {
  const pathname = usePathname();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const isProcessing = useAuthStore((s) => s.isProcessing);
  const showAuthUi = hasHydrated && !isProcessing;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/80 backdrop-blur-lg md:hidden">
      <div className="flex items-center justify-around px-2 py-1">
        {bottomNav.map((item) => {
          // Profile tab only shown when authenticated
          if (item.href === "/profile" && (!showAuthUi || !isAuthenticated))
            return null;

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
                "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
