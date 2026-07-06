"use client";

import * as React from "react";
import { IconSelector, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface SearchComboboxProps<T> {
  /** The list of items to display */
  items: readonly T[];
  /** Currently selected item's id/value */
  value?: number | string;
  /** Called when an item is selected or cleared */
  onChange: (value: number | string | undefined, item?: T) => void;
  /** Extract the unique value (id) from an item */
  getItemValue: (item: T) => number | string;
  /** Extract the display label from an item */
  getItemLabel: (item: T) => string;
  /**
   * Extract the search string for an item (defaults to getItemLabel).
   * Useful when you want to search by multiple fields (e.g. name + code).
   */
  getSearchValue?: (item: T) => string;
  /** Custom render for each item row inside the dropdown list */
  renderItem?: (item: T, isSelected: boolean) => React.ReactNode;
  /** Custom render for the trigger button when an item is selected */
  renderSelected?: (item: T) => React.ReactNode;
  /** Trigger placeholder text */
  placeholder?: string;
  /** Search input placeholder text */
  searchPlaceholder?: string;
  /** Text shown when no items match the search */
  emptyMessage?: string;
  /** Show loading state */
  loading?: boolean;
  /** Text shown while loading */
  loadingText?: string;
  /** Disable the combobox */
  disabled?: boolean;
  /** Highlight trigger with destructive border (e.g. validation error) */
  hasError?: boolean;
  /** Show a clear (×) button when an item is selected */
  clearable?: boolean;
  /** Extra class names for the trigger button */
  className?: string;
}

export function SearchCombobox<T>({
  items,
  value,
  onChange,
  getItemValue,
  getItemLabel,
  getSearchValue,
  renderItem,
  renderSelected,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  loading = false,
  loadingText = "Loading...",
  disabled = false,
  hasError = false,
  clearable = false,
  className,
}: SearchComboboxProps<T>) {
  const [open, setOpen] = React.useState(false);

  const safeItems = React.useMemo(
    () => (Array.isArray(items) ? items : []),
    [items],
  );

  const selected =
    value !== undefined
      ? safeItems.find((i) => getItemValue(i) === value)
      : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || loading}
          className={cn(
            "w-full justify-between font-normal",
            !selected && "text-muted-foreground",
            hasError && "border-destructive ring-1 ring-destructive",
            className,
          )}
        >
          <span className="truncate">
            {loading
              ? loadingText
              : selected
                ? renderSelected
                  ? renderSelected(selected)
                  : getItemLabel(selected)
                : placeholder}
          </span>

          <span className="ml-2 flex shrink-0 items-center gap-1">
            {clearable && selected && (
              <IconX
                className="h-3.5 w-3.5 opacity-50 hover:opacity-100"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onChange(undefined, undefined);
                }}
              />
            )}
            <IconSelector className="h-4 w-4 opacity-50" />
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="p-0"
        align="start"
        style={{ width: "var(--radix-popover-trigger-width)" }}
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {safeItems.map((item) => {
                const itemValue = getItemValue(item);
                const isSelected = value === itemValue;
                const searchValue = getSearchValue
                  ? getSearchValue(item)
                  : getItemLabel(item);

                return (
                  <CommandItem
                    key={itemValue}
                    value={searchValue}
                    data-checked={isSelected || undefined}
                    onSelect={() => {
                      onChange(
                        clearable && isSelected ? undefined : itemValue,
                        clearable && isSelected ? undefined : item,
                      );
                      setOpen(false);
                    }}
                  >
                    {renderItem
                      ? renderItem(item, isSelected)
                      : getItemLabel(item)}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
