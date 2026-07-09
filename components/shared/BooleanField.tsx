"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import * as React from "react";

interface BooleanFieldProps {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  variant?:
    | "switch"
    | "checkbox"
    | "buttons"
    | "chip"
    | "segmented"
    | "radio"
    | "card";
  trueLabel?: string;
  falseLabel?: string;
  className?: string;
  /** Optional leading icon, used by the "card" variant */
  icon?: React.ReactNode;
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
  icon,
}: BooleanFieldProps) {
  const radioName = React.useId();

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

  // ── Chip variant: compact single-row toggle, no card chrome ─────────
  // Good for dense lists/tables, e.g. a permissions list with many rows.
  if (variant === "chip") {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-3 py-1.5",
          className,
        )}
      >
        <div className="min-w-0">
          <span className="text-sm font-medium leading-none">{label}</span>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {description}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onChange(!value)}
          disabled={disabled}
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
            value
              ? "bg-primary/15 text-primary hover:bg-primary/20"
              : "bg-muted text-muted-foreground hover:bg-muted/70",
          )}
        >
          {value ? trueLabel : falseLabel}
        </button>
      </div>
    );
  }

  // ── Segmented variant: single pill-shaped two-option control ────────
  // More compact than "buttons" — reads as one control, not two actions.
  if (variant === "segmented") {
    return (
      <div className={cn("space-y-2", className)}>
        <div>
          <label className="text-sm font-medium leading-none">{label}</label>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div
          role="radiogroup"
          aria-label={label}
          className="inline-flex rounded-full border border-input bg-muted/40 p-0.5"
        >
          <button
            type="button"
            role="radio"
            aria-checked={!value}
            onClick={() => onChange(false)}
            disabled={disabled}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              !value
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {falseLabel}
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={value}
            onClick={() => onChange(true)}
            disabled={disabled}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              value
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {trueLabel}
          </button>
        </div>
      </div>
    );
  }

  // ── Radio variant: native radio semantics, two labeled circles ──────
  // Useful when you need real radiogroup a11y (e.g. printable forms,
  // screen-reader-heavy flows) rather than a switch/button substitute.
  if (variant === "radio") {
    return (
      <div className={cn("space-y-2", className)}>
        <div>
          <span className="text-sm font-medium leading-none">{label}</span>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-5">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name={radioName}
              checked={value}
              onChange={() => onChange(true)}
              disabled={disabled}
              className="size-4 accent-primary disabled:cursor-not-allowed"
            />
            {trueLabel}
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name={radioName}
              checked={!value}
              onChange={() => onChange(false)}
              disabled={disabled}
              className="size-4 accent-primary disabled:cursor-not-allowed"
            />
            {falseLabel}
          </label>
        </div>
      </div>
    );
  }

  // ── Card variant: large clickable card, optional leading icon ───────
  // For prominent feature toggles where the whole card is the target,
  // not just a small switch in the corner.
  if (variant === "card") {
    return (
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && onChange(!value)}
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onChange(!value);
          }
        }}
        aria-disabled={disabled}
        className={cn(
          "w-full flex items-center gap-4 rounded-xl border p-4 text-left shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          value
            ? "border-primary bg-primary/10"
            : "border-input bg-card/50 hover:bg-muted/40",
          className,
        )}
      >
        {icon && (
          <div
            className={cn(
              "shrink-0 flex items-center justify-center size-10 rounded-lg",
              value
                ? "bg-primary/15 text-primary"
                : "bg-muted text-muted-foreground",
            )}
          >
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0 space-y-0.5">
          <p className="text-sm font-medium leading-none">{label}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {/* Visual indicator only — the whole card handles toggling */}
        <div
          aria-hidden="true"
          className={cn(
            "shrink-0 h-6 w-11 rounded-full border-2 border-transparent transition-colors",
            value ? "bg-primary" : "bg-input",
            disabled && "opacity-50",
          )}
        >
          <div
            className={cn(
              "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-sm ring-0 transition-transform",
              value ? "translate-x-5" : "translate-x-0",
            )}
          />
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
