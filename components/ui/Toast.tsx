import {
  useToastStore,
  type ToastItem,
  type ToastVariant,
} from "@/store/toast.store";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ToastConfig {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  borderColor: string;
  title: string;
}

const variantConfigs: Record<ToastVariant, ToastConfig> = {
  success: {
    icon: "checkmark-circle",
    iconColor: "#10B981", // emerald-500
    iconBg: "bg-emerald-500/15",
    borderColor: "border-l-emerald-500",
    title: "Success",
  },
  error: {
    icon: "alert-circle",
    iconColor: "#F43F5E", // rose-500
    iconBg: "bg-rose-500/15",
    borderColor: "border-l-rose-500",
    title: "Error",
  },
  warning: {
    icon: "warning",
    iconColor: "#F59E0B", // amber-500
    iconBg: "bg-amber-500/15",
    borderColor: "border-l-amber-500",
    title: "Warning",
  },
  info: {
    icon: "information-circle",
    iconColor: "#3B82F6", // blue-500
    iconBg: "bg-blue-500/15",
    borderColor: "border-l-blue-500",
    title: "Info",
  },
  default: {
    icon: "notifications",
    iconColor: "#8B5CF6", // violet-500
    iconBg: "bg-violet-500/15",
    borderColor: "border-l-violet-500",
    title: "Notice",
  },
};

function ToastCard({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: () => void;
}) {
  const config = variantConfigs[item.variant] || variantConfigs.default;
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(-12)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY }],
      }}
      className={`w-full max-w-[340px] flex-row items-center gap-3 rounded-2xl border border-slate-700/80 bg-slate-900/95 p-3.5 shadow-2xl shadow-slate-950/40 border-l-[4px] ${config.borderColor}`}
    >
      <View
        className={`h-9 w-9 items-center justify-center rounded-full ${config.iconBg}`}
      >
        <Ionicons name={config.icon} size={20} color={config.iconColor} />
      </View>

      <View className="flex-1 justify-center">
        <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {config.title}
        </Text>
        <Text
          className="text-xs font-semibold text-slate-100 leading-snug mt-0.5"
          numberOfLines={3}
        >
          {item.message}
        </Text>
      </View>

      <TouchableOpacity
        onPress={onDismiss}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        className="h-7 w-7 items-center justify-center rounded-full bg-slate-800/80 active:bg-slate-700"
      >
        <Ionicons name="close" size={14} color="#94A3B8" />
      </TouchableOpacity>
    </Animated.View>
  );
}

/**
 * Mount once near the root layout. Renders active toasts at the top-right corner with icons.
 */
export function ToastHost() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        top: Math.max(insets.top, 12) + 8,
        left: 16,
        right: 16,
        zIndex: 999999,
        elevation: 999999,
      }}
      className="items-end gap-2.5"
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} item={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </View>
  );
}
