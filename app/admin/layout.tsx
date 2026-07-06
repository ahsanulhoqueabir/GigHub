"use client";

import { Suspense, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useMounted } from "@/hooks/useMounted";
import { Sidebar } from "@/components/admin/sidebar/Sidebar";
import { MobileNav } from "@/components/admin/mobile-nav/MobileNav";
import { useReturnTo } from "@/hooks/use-return-to";

// Inner component that uses useSearchParams (via useReturnTo → Sidebar/MobileNav)
function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAdmin, user } = useAdminRole();
  const mounted = useMounted();
  const { withReturnTo } = useReturnTo();

  useEffect(() => {
    if (mounted) {
      if (!user) {
        // Not authenticated — redirect with returnTo
        router.push(withReturnTo("/login"));
      } else if (!isAdmin) {
        // Not an admin
        router.push("/");
      }
    }
  }, [mounted, user, isAdmin, router, pathname, withReturnTo]);

  if (!mounted || !user || !isAdmin) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-muted-foreground animate-pulse">
          Loading Admin Panel...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <Sidebar />
      <div className="flex flex-col w-full flex-1 min-w-0">
        {/* Mobile header with hamburger only */}
        <header className="sticky top-0 z-30 flex h-14 items-center border-b bg-background px-4 md:hidden">
          <MobileNav />
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center">
          <div className="text-muted-foreground animate-pulse">
            Loading Admin Panel...
          </div>
        </div>
      }
    >
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}
