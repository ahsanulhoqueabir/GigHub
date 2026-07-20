import { COLORS } from "@/constants/colors";
import { useAuthStore } from "@/store/auth.store";
import { Stack, router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function AdminLayout() {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const user = useAuthStore((s) => s.user);
  const isAdmin =
    typeof user?.role === "string" && user.role.toUpperCase() === "ADMIN";

  useEffect(() => {
    if (!hasHydrated) return;
    if (!user) {
      router.replace("/(auth)/login");
    } else if (!isAdmin) {
      router.replace("/unauthorized");
    }
  }, [hasHydrated, user, isAdmin]);

  if (!hasHydrated || !user || !isAdmin) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-950">
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="users" />
    </Stack>
  );
}
