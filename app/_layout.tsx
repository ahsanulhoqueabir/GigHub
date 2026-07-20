import "react-native-url-polyfill/auto";
import "../global.css";

import { Image as ExpoImage } from "expo-image";
import { cssInterop } from "nativewind";

cssInterop(ExpoImage, { className: "style" });

import { ToastHost } from "@/components/ui/Toast";
import { COLORS } from "@/constants/colors";
import { useNotificationListeners } from "@/lib/notifications/listeners";
import { useAuthStore } from "@/store/auth.store";
import { useNotificationsStore } from "@/store/notifications.store";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Text,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Prevent auto hiding native splash screen until app is ready
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const initAuth = useAuthStore((s) => s.initAuth);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  useNotificationListeners();

  // Animated values for logo pulse & splash fade out
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const logoOpacityAnim = useRef(new Animated.Value(0.85)).current;
  const splashOpacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Breathing pulse for logo
    const pulse = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.08,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(logoOpacityAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(logoOpacityAnim, {
            toValue: 0.85,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [scaleAnim, logoOpacityAnim]);

  useEffect(() => {
    if (!hasHydrated) return;

    // Fire-and-forget: notification permission/topic setup must never
    // block splash/auth flow or app usage.
    useNotificationsStore.getState().initNotifications();

    const startTime = Date.now();

    initAuth().finally(async () => {
      setIsCheckingAuth(false);
      await SplashScreen.hideAsync().catch(() => {});

      // Enforce minimum splash display duration (1200ms) for smooth experience
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 1200 - elapsedTime);

      setTimeout(() => {
        // Smooth fade out transition
        Animated.timing(splashOpacityAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished) {
            setIsSplashVisible(false);
          }
        });
      }, remainingTime);
    });
  }, [hasHydrated, initAuth, splashOpacityAnim]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="gig/[slug]" />
          <Stack.Screen name="job/[slug]" />
          <Stack.Screen name="order/[id]" />
          <Stack.Screen name="chat/[conversationId]" />
          <Stack.Screen name="announcements/index" />
          <Stack.Screen name="announcements/[id]" />
          <Stack.Screen name="admin" />
          <Stack.Screen
            name="unauthorized"
            options={{ presentation: "modal" }}
          />
        </Stack>

        {/* Overlay custom branded splash screen while loading / initializing */}
        {isSplashVisible && (
          <Animated.View
            style={[
              {
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 99999,
                opacity: splashOpacityAnim,
              },
            ]}
            className="items-center justify-center bg-white px-6"
          >
            <StatusBar style="dark" />

            {/* Ambient Glow */}
            <View
              className="absolute w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl"
              style={{ top: "35%" }}
            />

            {/* Branded Logo Container */}
            <Animated.View
              style={{
                transform: [{ scale: scaleAnim }],
                opacity: logoOpacityAnim,
              }}
              className="items-center justify-center mb-8"
            >
              <View className="p-6 rounded-3xl bg-slate-50 border border-slate-100 shadow-xl items-center justify-center">
                <Image
                  source={require("../assets/logo.png")}
                  style={{ width: 110, height: 110 }}
                  resizeMode="contain"
                />
              </View>
            </Animated.View>

            {/* App Title & Subtitle */}
            <View className="items-center gap-2 mb-10">
              <Text className="text-3xl font-extrabold text-slate-900 tracking-tight">
                GigHub
              </Text>
              <Text className="text-xs font-semibold text-indigo-600 uppercase tracking-widest">
                Freelance & Talent Marketplace
              </Text>
            </View>

            {/* Loading Indicator */}
            <View className="items-center gap-3">
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text className="text-xs text-slate-500 font-medium tracking-wide">
                Initializing app...
              </Text>
            </View>
          </Animated.View>
        )}

        <ToastHost />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
