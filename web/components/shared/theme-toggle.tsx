"use client";

import { useTheme } from "next-themes";
import { IconSun, IconMoon } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="h-8 w-14 rounded-full border border-border bg-background" />
    );
  }

  const isDark = theme === "dark";
  const nextTheme = isDark ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      aria-label={isDark ? "Switch to light" : "Switch to dark"}
      className={cn(
        "relative inline-flex h-8 w-14 items-center rounded-full border border-border bg-muted/50 px-1 transition-colors",
        "hover:bg-muted",
      )}
    >
      <span
        className={cn(
          "absolute left-1 flex size-6 items-center justify-center rounded-full bg-background shadow-xs transition-transform",
          isDark && "translate-x-6",
        )}
      >
        {isDark ? <IconMoon size={14} /> : <IconSun size={14} />}
      </span>
      <span className="sr-only">Theme toggle</span>
    </button>
  );
}
