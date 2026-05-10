"use client";

import { useTheme } from "next-themes";
import { IconSun, IconMoon, IconDeviceLaptop } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="h-8 w-20 rounded-lg border border-border bg-background" />
    );
  }

  const options = [
    { value: "light", icon: IconSun, label: "Light" },
    { value: "dark", icon: IconMoon, label: "Dark" },
    { value: "system", icon: IconDeviceLaptop, label: "System" },
  ] as const;

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/50 p-0.5">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          aria-label={label}
          className={cn(
            "flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
            theme === value
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon size={14} />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
