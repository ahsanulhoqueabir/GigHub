"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

// ── Types ───────────────────────────────────────────────────────

export interface ContextMenuItem {
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  disabled?: boolean;
  onClick: () => void;
}

interface ContextMenuCustomProps {
  items: ContextMenuItem[];
  children: ReactNode;
}

// ── Component ───────────────────────────────────────────────────

export function ContextMenuCustom({ items, children }: ContextMenuCustomProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  // Open on right-click
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPos({ x: e.clientX, y: e.clientY });
    setOpen(true);
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    // Delay to avoid immediate close from the right-click itself
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClick);
      document.addEventListener("keydown", handleKey);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  // Adjust position to keep menu in viewport
  useEffect(() => {
    if (!open || !menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const { innerWidth, innerHeight } = window;
    let { x, y } = pos;

    if (x + rect.width > innerWidth) x = innerWidth - rect.width - 8;
    if (y + rect.height > innerHeight) y = innerHeight - rect.height - 8;
    if (x < 8) x = 8;
    if (y < 8) y = 8;

    if (x !== pos.x || y !== pos.y) {
      setPos({ x, y });
    }
  }, [open, pos]);

  return (
    <>
      <div onContextMenu={handleContextMenu}>{children}</div>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{ left: pos.x, top: pos.y }}
            className={cn(
              "fixed z-50 min-w-40 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg",
              "animate-in fade-in-0 zoom-in-95",
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
            )}
            role="menu"
          >
            {items.map((item, idx) => (
              <button
                key={idx}
                disabled={item.disabled}
                className={cn(
                  "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
                  "focus:bg-accent/40 focus:text-background",
                  "disabled:pointer-events-none disabled:opacity-50",
                  "hover:bg-accent/40",
                )}
                onClick={() => {
                  item.onClick();
                  setOpen(false);
                }}
                role="menuitem"
              >
                {item.icon && (
                  <span className="mr-2 flex h-4 w-4 items-center justify-center">
                    {item.icon}
                  </span>
                )}
                <span>{item.label}</span>
                {item.shortcut && (
                  <span className="ml-auto text-xs tracking-widest opacity-60">
                    {item.shortcut}
                  </span>
                )}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
