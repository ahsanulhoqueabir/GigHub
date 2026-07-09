"use client";

import { profileNavConfig } from "@/config/nav-config";
import { useAuthStore } from "@/store/auth.store";
import { IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { accessToken, hasHydrated } = useAuthStore();

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

  return (
    <div className="flex gap-8">
      {/* ── Sidebar ── */}
      <aside className="hidden lg:block w-52 shrink-0">
        <nav className="sticky top-20 space-y-1">
          {profileNavConfig.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.id}
                href={item.href}
                data-active={isActive || undefined}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                  text-muted-foreground hover:text-foreground hover:bg-accent/40
                  data-active:text-foreground data-active:bg-accent/20"
              >
                {item.icon && <item.icon className="size-4 shrink-0" />}
                <span>{item.label}</span>
                {isActive && (
                  <IconChevronRight className="size-4 ml-auto shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
