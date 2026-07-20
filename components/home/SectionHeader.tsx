import { Pressable, Text, View } from "react-native";

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export function SectionHeader({
  title,
  actionLabel,
  onActionPress,
}: SectionHeaderProps) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <Text className="text-lg font-bold text-gray-900 dark:text-gray-100">
        {title}
      </Text>
      {actionLabel ? (
        <Pressable hitSlop={8} onPress={onActionPress}>
          <Text className="text-sm font-medium text-primary">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
