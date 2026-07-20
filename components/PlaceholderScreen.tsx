import { Header } from "@/components/ui/Header";
import { Text, View } from "react-native";

interface PlaceholderScreenProps {
  title: string;
  description?: string;
}

/** Temporary screen body used until the real feature lands in a later phase. */
export function PlaceholderScreen({
  title,
  description,
}: PlaceholderScreenProps) {
  return (
    <View className="flex-1 bg-white dark:bg-gray-950">
      <Header title={title} />
      <View className="flex-1 items-center justify-center px-6">
        <Text className="mb-2 text-center text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </Text>
        <Text className="text-center text-gray-500 dark:text-gray-400">
          {description ?? "This screen is coming in a later phase."}
        </Text>
      </View>
    </View>
  );
}
