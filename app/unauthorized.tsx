import { Button } from "@/components/ui/Button";
import { router } from "expo-router";
import { Text, View } from "react-native";

export default function UnauthorizedScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6 dark:bg-gray-950">
      <Text className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">
        Access denied
      </Text>
      <Text className="mb-6 text-center text-gray-500 dark:text-gray-400">
        You don&apos;t have permission to view this page.
      </Text>
      <Button variant="outline" onPress={() => router.replace("/(tabs)")}>
        Go Home
      </Button>
    </View>
  );
}
