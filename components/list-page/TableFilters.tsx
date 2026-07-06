import { useState } from "react";
import { IconFilter, IconX, IconChevronDown } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { FilterConfig } from "./types";

interface TableFiltersProps<T> {
  filters?: FilterConfig<T>[];
  activeFilters: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  onClearFilters: () => void;
}

export function TableFilters<T>({
  filters = [],
  activeFilters,
  onFilterChange,
  onClearFilters,
}: TableFiltersProps<T>) {
  if (filters.length === 0) return null;

  const activeFilterCount = Object.values(activeFilters).filter(
    (value) =>
      value !== undefined &&
      value !== null &&
      value !== "" &&
      (Array.isArray(value) ? value.length > 0 : true),
  ).length;

  const renderFilter = (filter: FilterConfig<T>) => {
    const value = activeFilters[filter.key as string];

    switch (filter.type) {
      case "select":
        return (
          <Select
            value={value || ""}
            onValueChange={(newValue) =>
              onFilterChange(
                filter.key as string,
                newValue === "all" ? undefined : newValue,
              )
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {filter.label}</SelectItem>
              {filter.options?.map((option) => (
                <SelectItem
                  key={String(option.value)}
                  value={String(option.value)}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "multiselect":
        return (
          <MultiselectFilter
            filter={filter}
            value={value || []}
            onChange={(newValue) =>
              onFilterChange(filter.key as string, newValue)
            }
          />
        );

      case "text":
        return (
          <Input
            placeholder={filter.placeholder || filter.label}
            value={value || ""}
            onChange={(e) =>
              onFilterChange(filter.key as string, e.target.value)
            }
            className="w-40"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center text-sm text-muted-foreground">
        <IconFilter className="h-4 w-4 mr-2" />
        Filters:
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter, index) => (
          <div key={index}>{renderFilter(filter)}</div>
        ))}
      </div>

      {/* Active Filter Count & Clear */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {activeFilterCount} active
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-8 px-2 text-xs"
          >
            <IconX className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}

// Multiselect Filter Component
interface MultiselectFilterProps<T> {
  filter: FilterConfig<T>;
  value: string[];
  onChange: (value: string[]) => void;
}

function MultiselectFilter<T>({
  filter,
  value,
  onChange,
}: MultiselectFilterProps<T>) {
  const [open, setOpen] = useState(false);

  const toggleOption = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-40 justify-between">
          {value.length > 0
            ? `${filter.label} (${value.length})`
            : filter.label}
          <IconChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0" align="start">
        <div className="max-h-60 overflow-y-auto">
          {filter.options?.map((option) => (
            <div
              key={String(option.value)}
              className="flex items-center space-x-2 px-3 py-2 hover:bg-muted cursor-pointer"
              onClick={() => toggleOption(String(option.value))}
            >
              <Checkbox
                checked={value.includes(String(option.value))}
                onChange={() => toggleOption(String(option.value))}
              />
              <span className="text-sm">{option.label}</span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
