"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { adminNavConfig } from "@/config/nav-config";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import {
  IconChevronDown,
  IconChevronRight,
  IconLogout,
} from "@tabler/icons-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from "@/store/auth.store";
import { useReturnTo } from "@/hooks/use-return-to";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { withReturnTo } = useReturnTo();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

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

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:shrink-0 md:h-screen md:sticky md:top-0 border-r bg-background">
      {/* User Info Section */}
      <div className="flex items-center gap-3 px-2 py-2 border-b">
        <Avatar className="h-14 w-14">
          <AvatarFallback className="text-base font-semibold bg-primary/10 text-primary">
            {initials || "A"}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-0.5">
          <p className="text-sm font-semibold leading-none truncate max-w-48">
            {user?.name || "Admin"}
          </p>
          <p className="text-xs text-muted-foreground truncate max-w-48">
            {user?.email || ""}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="grid gap-1 px-3">
          {adminNavConfig.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.children && pathname.startsWith(item.href));
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = openItems[item.id];

            return (
              <div key={item.id} className="grid gap-1">
                {hasChildren ? (
                  <button
                    onClick={() => toggleOpen(item.id)}
                    className={cn(
                      "flex items-center w-full justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "transparent text-muted-foreground",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {Icon && <Icon className="h-5 w-5 shrink-0" />}
                      <span>{item.label}</span>
                    </div>
                    {isOpen ? (
                      <IconChevronDown className="h-4 w-4" />
                    ) : (
                      <IconChevronRight className="h-4 w-4" />
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "transparent text-muted-foreground",
                    )}
                  >
                    {Icon && <Icon className="h-5 w-5 shrink-0" />}
                    <span>{item.label}</span>
                  </Link>
                )}

                {hasChildren && isOpen && (
                  <div className="grid gap-1 pl-8 pr-2">
                    {item.children?.map((child) => {
                      const isChildActive = pathname === child.href;
                      return (
                        <Link
                          key={child.id}
                          href={child.href}
                          className={cn(
                            "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                            isChildActive
                              ? "bg-accent text-accent-foreground"
                              : "transparent text-muted-foreground",
                          )}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </ScrollArea>
      <Button
        variant="destructive"
        size="lg"
        onClick={handleLogout}
        className="w-full gap-2 mt-1"
      >
        <IconLogout className="h-4 w-4" />
        Logout
      </Button>
    </aside>
  );
}
