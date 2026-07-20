import { COLORS } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

interface ChipProps {
  label: string;
  onRemove?: () => void;
  className?: string;
}

export function Chip({ label, onRemove, className }: ChipProps) {
  return (
    <View
      className={`flex-row items-center gap-1 self-start rounded-full bg-primary/10 px-3 py-1.5 dark:bg-primary/20 ${className ?? ""}`}
    >
      <Text className="text-sm font-medium text-primary">{label}</Text>
      {onRemove ? (
        <Pressable hitSlop={6} onPress={onRemove}>
          <Ionicons name="close" size={14} color={COLORS.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}
