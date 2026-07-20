import { COLORS } from "@/constants/colors";
import { selectIsAuthenticated, useAuthStore } from "@/store/auth.store";
import { Stack, router, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function ProfileStackLayout() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const segments = useSegments();

  // Subpages under profile tab (e.g. /profile/edit, /profile/wallet, etc.) require auth
  const isSubPage = segments.length > 2 && segments[1] === "profile";

  useEffect(() => {
    if (!isAuthenticated && isSubPage) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, isSubPage]);

  if (!isAuthenticated && isSubPage) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-950">
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="edit" options={{ presentation: "card" }} />
      <Stack.Screen name="wallet" options={{ presentation: "card" }} />
      <Stack.Screen name="change-password" options={{ presentation: "card" }} />
      <Stack.Screen name="my-jobs" options={{ presentation: "card" }} />
      <Stack.Screen name="post-job" options={{ presentation: "card" }} />
      <Stack.Screen
        name="incoming-proposals"
        options={{ presentation: "card" }}
      />
      <Stack.Screen name="applied-jobs" options={{ presentation: "card" }} />
      <Stack.Screen name="my-gigs" options={{ presentation: "card" }} />
      <Stack.Screen name="create-gig" options={{ presentation: "card" }} />
      <Stack.Screen name="escrow" options={{ presentation: "card" }} />
    </Stack>
  );
}
