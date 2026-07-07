import * as React from "react";
import { useState, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function fuzzyMatch(text: string, query: string): boolean {
  if (!query) return true;
  const cleanText = text.toLowerCase();
  const cleanQuery = query.toLowerCase();

  if (cleanText.includes(cleanQuery)) return true;

  let textIdx = 0;
  let queryIdx = 0;
  while (textIdx < cleanText.length && queryIdx < cleanQuery.length) {
    if (cleanText[textIdx] === cleanQuery[queryIdx]) {
      queryIdx++;
    }
    textIdx++;
  }
  return queryIdx === cleanQuery.length;
}

export interface AutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  suggestions: string[];
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  loadingText?: string;
  customValueText?: string | ((value: string) => string);
}

export function Autocomplete({
  value,
  onChange,
  suggestions,
  placeholder,
  loading = false,
  disabled = false,
  className,
  loadingText = "Loading...",
  customValueText = 'Using custom: "{value}"',
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  // Use the value prop directly instead of duplicating into local state
  const inputValue = value;

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(e.target as Node)
    ) {
      setIsOpen(false);
    }
  }, []);

  React.useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  // Reposition dropdown on scroll/resize when open
  React.useEffect(() => {
    if (!isOpen) return;
    const reposition = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDropdownStyle({
          position: "fixed",
          top: `${rect.bottom + 4}px`,
          left: `${rect.left}px`,
          width: `${rect.width}px`,
          zIndex: 9999,
        });
      }
    };
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [isOpen]);

  // Recalculate dropdown position when opening
  const openDropdown = useCallback(() => {
    setIsOpen(true);
    // Use requestAnimationFrame to ensure DOM is painted before measuring
    requestAnimationFrame(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDropdownStyle({
          position: "fixed",
          top: `${rect.bottom + 4}px`,
          left: `${rect.left}px`,
          width: `${rect.width}px`,
          zIndex: 9999,
        });
      }
    });
  }, []);

  const filtered = useMemo(
    () => suggestions.filter((s) => fuzzyMatch(s, inputValue)).slice(0, 10),
    [suggestions, inputValue],
  );

  const getCustomLabel = () => {
    if (typeof customValueText === "function") {
      return customValueText(inputValue);
    }
    return customValueText.replace("{value}", inputValue);
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <Input
        value={inputValue}
        onChange={(e) => {
          onChange(e.target.value);
          openDropdown();
        }}
        onFocus={openDropdown}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full"
      />
      {isOpen &&
        !disabled &&
        (inputValue.trim() !== "" || suggestions.length > 0) &&
        createPortal(
          <div
            style={dropdownStyle}
            className="max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-lg outline-none"
          >
            <ul className="p-1">
              {loading ? (
                <li className="px-2 py-1.5 text-xs text-muted-foreground text-center animate-pulse">
                  {loadingText}
                </li>
              ) : filtered.length === 0 ? (
                inputValue.trim() !== "" && (
                  <li className="px-2 py-1.5 text-xs text-muted-foreground text-center">
                    {getCustomLabel()}
                  </li>
                )
              ) : (
                filtered.map((s, idx) => (
                  <li
                    key={`${s}-${idx}`}
                    onMouseDown={(e) => {
                      // Use onMouseDown instead of onClick to fire before blur
                      e.preventDefault();
                      onChange(s);
                      setIsOpen(false);
                    }}
                    className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                  >
                    {s}
                  </li>
                ))
              )}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  );
}
