import { Text, View } from "react-native";

export type BadgeVariant =
  "default" | "success" | "warning" | "danger" | "info";

interface BadgeProps {
  children: string;
  variant?: BadgeVariant;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default:
    "bg-gray-100 dark:bg-gray-800 border border-gray-200/70 dark:border-gray-700/70",
  success:
    "bg-emerald-100/90 dark:bg-emerald-950/80 border border-emerald-300/70 dark:border-emerald-800/70",
  warning:
    "bg-amber-100/90 dark:bg-amber-950/80 border border-amber-300/70 dark:border-amber-800/70",
  danger:
    "bg-red-100/90 dark:bg-red-950/80 border border-red-300/70 dark:border-red-800/70",
  info: "bg-sky-100/90 dark:bg-sky-950/80 border border-sky-300/70 dark:border-sky-800/70",
};

const textVariants: Record<BadgeVariant, string> = {
  default: "text-gray-800 dark:text-gray-200 font-semibold",
  success: "text-emerald-800 dark:text-emerald-300 font-semibold",
  warning: "text-amber-800 dark:text-amber-300 font-semibold",
  danger: "text-red-800 dark:text-red-300 font-semibold",
  info: "text-sky-800 dark:text-sky-300 font-semibold",
};

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <View
      className={`self-start rounded-full px-2.5 py-0.5 ${variants[variant]} ${className ?? ""}`}
    >
      <Text className={`text-[11px] ${textVariants[variant]}`}>{children}</Text>
    </View>
  );
}
