"use client";

import { formatDateInTimezone } from "@/lib/date.utils";
import { cn } from "@/lib/utils";
import { IconCalendar } from "@tabler/icons-react";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface DatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function DatePicker({
  value,
  onChange,
  disabled,
  placeholder = "Pick a date",
}: DatePickerProps) {
  const date = value ? new Date(value + "T00:00:00") : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
        >
          <IconCalendar className="mr-2 size-4" />
          {date ? formatDateInTimezone(value!) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            if (selectedDate) {
              const y = selectedDate.getFullYear();
              const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
              const d = String(selectedDate.getDate()).padStart(2, "0");
              onChange?.(`${y}-${m}-${d}`);
            }
          }}
          disabled={(d) => d < new Date(new Date().toDateString())}
        />
      </PopoverContent>
    </Popover>
  );
}
