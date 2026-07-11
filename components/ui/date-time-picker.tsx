"use client";

import { formatDateInTimezone } from "@/lib/date.utils";
import { cn } from "@/lib/utils";
import { IconCalendar } from "@tabler/icons-react";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface DateTimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Combines a date picker (Calendar) with a time input.
 * The value is stored as "YYYY-MM-DDTHH:mm" (compatible with `<input type="datetime-local">`).
 */
export function DateTimePicker({
  value,
  onChange,
  disabled,
  placeholder = "Pick a date & time",
}: DateTimePickerProps) {
  const datePart = value ? value.slice(0, 10) : "";
  const timePart = value ? value.slice(11, 16) : "";

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDate.getDate()).padStart(2, "0");
    const newDate = `${y}-${m}-${d}`;
    onChange?.(`${newDate}T${timePart || "00:00"}`);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    onChange?.(`${datePart || "0000-00-00"}T${newTime}`);
  };

  const displayDate = value ? formatDateInTimezone(value) : "";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
          )}
        >
          <IconCalendar className="mr-2 size-4 shrink-0" />
          {value ? (
            <span>
              {displayDate}
              {timePart ? (
                <span className="ml-1.5 text-muted-foreground">{timePart}</span>
              ) : null}
            </span>
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 space-y-3">
          <Calendar
            mode="single"
            selected={datePart ? new Date(datePart + "T00:00:00") : undefined}
            onSelect={handleDateSelect}
          />
          <div className="flex items-center gap-2 border-t pt-3">
            <IconCalendar className="size-4 shrink-0 text-muted-foreground" />
            <input
              type="time"
              value={timePart}
              onChange={handleTimeChange}
              className={cn(
                "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs",
                "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
