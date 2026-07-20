import { COLORS } from "@/constants/colors";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  type PressableProps,
} from "react-native";

export type ButtonVariant =
  "primary" | "secondary" | "outline" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<PressableProps, "children"> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

const containerVariants: Record<ButtonVariant, string> = {
  primary: "bg-primary active:bg-primary-dark",
  secondary:
    "bg-secondary/10 dark:bg-secondary/20 active:bg-secondary/20 dark:active:bg-secondary/30",
  outline:
    "border border-gray-300 dark:border-gray-600 active:bg-gray-50 dark:active:bg-gray-800",
  ghost: "active:bg-gray-100 dark:active:bg-gray-800",
  destructive: "bg-destructive active:bg-destructive-dark",
};

const labelVariants: Record<ButtonVariant, string> = {
  primary: "text-primary-foreground",
  secondary: "text-secondary dark:text-blue-400 font-semibold",
  outline: "text-gray-900 dark:text-gray-100",
  ghost: "text-gray-900 dark:text-gray-100",
  destructive: "text-destructive-foreground",
};

const sizeVariants: Record<ButtonSize, { container: string; label: string }> = {
  sm: { container: "px-3 py-2 rounded-lg", label: "text-sm font-medium" },
  md: { container: "px-4 py-3 rounded-xl", label: "text-base font-semibold" },
  lg: { container: "px-6 py-4 rounded-2xl", label: "text-lg font-semibold" },
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  fullWidth = false,
  className,
  ...rest
}: ButtonProps & { className?: string }) {
  const isDisabled = disabled || isLoading;
  const spinnerColor =
    variant === "primary"
      ? COLORS.primaryForeground
      : variant === "destructive"
        ? COLORS.destructiveForeground
        : COLORS.primary;

  return (
    <Pressable
      disabled={isDisabled}
      className={`flex-row items-center justify-center ${sizeVariants[size].container} ${containerVariants[variant]} ${isDisabled ? "opacity-50" : ""} ${fullWidth ? "w-full" : ""} ${className ?? ""}`}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator color={spinnerColor} />
      ) : typeof children === "string" ? (
        <Text
          className={`${sizeVariants[size].label} ${labelVariants[variant]}`}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
