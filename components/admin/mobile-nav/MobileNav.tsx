"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { adminNavConfig } from "@/config/nav-config";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import {
  IconMenu2,
  IconChevronDown,
  IconChevronRight,
  IconLogout,
} from "@tabler/icons-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from "@/store/auth.store";
import { useReturnTo } from "@/hooks/use-return-to";

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { withReturnTo } = useReturnTo();
  const [open, setOpen] = useState(false);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleOpen = (id: string) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLogout = () => {
    logout();
    setOpen(false);
    router.push(withReturnTo("/login"));
  };

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0">
          <IconMenu2 className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-full sm:max-w-md p-0 flex flex-col"
      >
        {/* User Info */}
        <div className="flex items-start gap-3 px-6 py-8 border-b">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
              {initials || "A"}
            </AvatarFallback>
          </Avatar>
          <div className="text-center space-y-1">
            <p className="text-base font-semibold leading-none truncate max-w-[16rem]">
              {user?.name || "Admin"}
            </p>
            <p className="text-sm text-muted-foreground truncate max-w-[16rem]">
              {user?.email || ""}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="grid gap-2 px-4">
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
                        "flex items-center w-full justify-between rounded-md px-3 py-3 text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
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
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
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
                    <div className="grid gap-2 pl-9 pr-2 mt-1">
                      {item.children?.map((child) => {
                        const isChildActive = pathname === child.href;
                        return (
                          <Link
                            key={child.id}
                            href={child.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                              "flex items-center rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
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

        {/* Logout Button at Bottom */}
        <div className="border-t p-4">
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleLogout}
          >
            <IconLogout className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
