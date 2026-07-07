"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BooleanFieldProps {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  variant?: "switch" | "checkbox" | "buttons";
  trueLabel?: string;
  falseLabel?: string;
  className?: string;
}

export function BooleanField({
  label,
  description,
  value,
  onChange,
  disabled = false,
  variant = "switch",
  trueLabel = "Yes",
  falseLabel = "No",
  className,
}: BooleanFieldProps) {
  if (variant === "checkbox") {
    return (
      <div
        className={cn(
          "flex items-start space-x-3 rounded-lg border p-4 shadow-sm bg-card/50",
          className,
          value ? "border-primary bg-primary/10" : "border-input",
        )}
      >
        <Checkbox
          id={label}
          checked={value}
          onCheckedChange={(checked) => onChange(!!checked)}
          disabled={disabled}
        />
        <div className="space-y-1 leading-none">
          <label
            htmlFor={label}
            className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
    );
  }

  if (variant === "buttons") {
    return (
      <div className={cn("space-y-2", className)}>
        <div>
          <label className="text-sm font-medium leading-none">{label}</label>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={value ? "default" : "outline"}
            onClick={() => onChange(true)}
            disabled={disabled}
            className="flex-1 max-w-30 h-9 text-xs"
          >
            {trueLabel}
          </Button>
          <Button
            type="button"
            variant={!value ? "destructive" : "outline"}
            onClick={() => onChange(false)}
            disabled={disabled}
            className="flex-1 max-w-30 h-9 text-xs"
          >
            {falseLabel}
          </Button>
        </div>
      </div>
    );
  }

  // Default is "switch"
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg border p-4 shadow-sm bg-card/50",
        className,
      )}
    >
      <div className="space-y-0.5 pr-4">
        <label className="text-sm font-medium leading-none">{label}</label>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <Switch checked={value} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
}
