import { COLORS } from "@/constants/colors";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface OfflineOverlayProps {
  isOffline: boolean;
  isChecking: boolean;
  onRetry: () => void;
}

export const OfflineOverlay: React.FC<OfflineOverlayProps> = ({
  isOffline,
  isChecking,
  onRetry,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isOffline) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();

      // Subtle pulse animation for icon container
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.06,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      );
      pulseLoop.start();
      return () => pulseLoop.stop();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [isOffline, fadeAnim, pulseAnim]);

  if (!isOffline) {
    return null;
  }

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        opacity: fadeAnim,
      }}
      className="items-center justify-center bg-slate-900/95 px-6"
    >
      {/* Background Subtle Gradient Glow */}
      <View
        className="absolute w-80 h-80 rounded-full bg-indigo-600/20 blur-3xl"
        style={{ top: "30%" }}
      />

      <View className="w-full max-w-sm rounded-3xl bg-slate-800 border border-slate-700/80 p-6 shadow-2xl items-center text-center">
        {/* Animated Icon Badge */}
        <Animated.View
          style={{ transform: [{ scale: pulseAnim }] }}
          className="mb-6 items-center justify-center rounded-full bg-rose-500/15 p-5 border border-rose-500/30"
        >
          <Feather name="wifi-off" size={44} color="#f43f5e" />
        </Animated.View>

        {/* Title */}
        <Text className="text-xl font-bold text-white text-center mb-2">
          ইন্টারনেট সংযোগ নেই
        </Text>
        <Text className="text-xs font-semibold text-rose-400 uppercase tracking-widest text-center mb-4">
          No Internet Connection
        </Text>

        {/* Message */}
        <Text className="text-sm text-slate-300 text-center leading-relaxed mb-6">
          GigHub অ্যাপটি সঠিকভাবে ডাটা ফেচ করতে এবং সক্রিয় সার্ভিস প্রদান করতে
          ইন্টারনেট সংযোগ প্রয়োজন। অনুগ্রহ করে আপনার ওয়াইফাই বা মোবাইল ডাটা
          অন করে আবার চেষ্টা করুন।
        </Text>

        {/* Retry Button */}
        <TouchableOpacity
          onPress={onRetry}
          disabled={isChecking}
          activeOpacity={0.8}
          className={`w-full py-3.5 px-6 rounded-2xl flex-row items-center justify-center gap-2 shadow-lg ${
            isChecking ? "bg-indigo-700" : "bg-indigo-600 active:bg-indigo-700"
          }`}
        >
          {isChecking ? (
            <>
              <ActivityIndicator size="small" color="#ffffff" />
              <Text className="text-white font-semibold text-base">
                যাচাই করা হচ্ছে...
              </Text>
            </>
          ) : (
            <>
              <Feather name="refresh-cw" size={18} color="#ffffff" />
              <Text className="text-white font-semibold text-base">
                পুনরায় চেষ্টা করুন
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};
