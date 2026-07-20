import { Image } from "expo-image";
import { Text, View } from "react-native";

export type AvatarSize = "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  uri?: string | null;
  name?: string | null;
  size?: AvatarSize;
  className?: string;
}

const sizeMap: Record<AvatarSize, { box: string; text: string; px: number }> = {
  sm: { box: "h-9 w-9", text: "text-sm", px: 36 },
  md: { box: "h-12 w-12", text: "text-base", px: 48 },
  lg: { box: "h-20 w-20", text: "text-2xl", px: 80 },
  xl: { box: "h-28 w-28", text: "text-4xl", px: 112 },
};

function initialsFrom(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase() || "?";
}

export function Avatar({ uri, name, size = "md", className }: AvatarProps) {
  const { box, text } = sizeMap[size];

  if (uri) {
    return (
      <Image
        source={{ uri }}
        className={`${box} rounded-full bg-gray-200 dark:bg-gray-800 ${className ?? ""}`}
        contentFit="cover"
        transition={150}
      />
    );
  }

  return (
    <View
      className={`${box} items-center justify-center rounded-full bg-primary/15 dark:bg-primary/25 ${className ?? ""}`}
    >
      <Text className={`${text} font-semibold text-primary`}>
        {initialsFrom(name)}
      </Text>
    </View>
  );
}
