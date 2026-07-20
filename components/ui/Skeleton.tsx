import { useEffect, useRef } from "react";
import { Animated, View, type DimensionValue } from "react-native";

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  rounded?: "sm" | "md" | "lg" | "full";
  className?: string;
}

const roundedMap = {
  sm: "rounded-md",
  md: "rounded-xl",
  lg: "rounded-2xl",
  full: "rounded-full",
};

export function Skeleton({
  width = "100%",
  height = 16,
  rounded = "md",
  className,
}: SkeletonProps) {
  const opacityAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacityAnim]);

  return (
    <Animated.View
      style={[{ width, height, opacity: opacityAnim }]}
      className={`bg-gray-200 dark:bg-gray-800 ${roundedMap[rounded]} ${className ?? ""}`}
    />
  );
}

export function SkeletonCard() {
  return (
    <View className="gap-3 rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
      <Skeleton height={140} rounded="lg" />
      <Skeleton height={14} width="80%" />
      <Skeleton height={14} width="50%" />
    </View>
  );
}
