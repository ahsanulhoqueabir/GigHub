import React, { type ReactElement, type ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControlProps,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";

export { SafeAreaView };


/**
 * Custom hook to obtain consistent safe area insets and dynamic bottom spacing across all devices.
 */
export function useScreenInsets() {
  const insets = useSafeAreaInsets();

  // Dynamic bottom padding that adjusts for Android 3-button nav, gesture nav, and iOS home indicator
  const bottomInset = insets.bottom;
  const bottomPadding = Math.max(bottomInset, Platform.OS === "ios" ? 16 : 8);

  // Dynamic tab bar height calculation
  const tabBarHeight = 54 + Math.max(bottomInset, 8);

  /**
   * Helper to calculate bottom scroll content padding dynamically
   * @param options.hasTabBar Whether the screen is inside the bottom tab navigator
   * @param options.hasStickyBottom Whether the screen has a sticky bottom action bar
   * @param options.stickyHeight Height of the sticky bottom bar (default 72)
   * @param options.extraPadding Additional bottom padding desired (default 24)
   */
  const getBottomSpace = (options?: {
    hasTabBar?: boolean;
    hasStickyBottom?: boolean;
    stickyHeight?: number;
    extraPadding?: number;
  }) => {
    const {
      hasTabBar = false,
      hasStickyBottom = false,
      stickyHeight = 72,
      extraPadding = 24,
    } = options ?? {};

    if (hasStickyBottom) {
      return stickyHeight + Math.max(bottomInset, 16) + extraPadding;
    }

    if (hasTabBar) {
      return extraPadding;
    }

    return Math.max(bottomInset, 16) + extraPadding;
  };

  return {
    top: insets.top,
    bottom: bottomInset,
    left: insets.left,
    right: insets.right,
    rawInsets: insets,
    bottomPadding,
    tabBarHeight,
    getBottomSpace,
  };
}

export interface ScreenProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
  preset?: "fixed" | "scroll";
  hasTabBar?: boolean;
  hasStickyBottom?: boolean;
  stickyBottomHeight?: number;
  extraBottomPadding?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
  contentContainerClassName?: string;
  refreshControl?: ReactElement<RefreshControlProps>;
  keyboardAvoiding?: boolean;

  keyboardOffset?: number;
}

/**
 * Centralized Screen container component.
 * Ensures consistent safe area inset handling, scrolling, and keyboard avoidance.
 */
export function Screen({
  children,
  style,
  className = "flex-1 bg-white dark:bg-gray-950",
  preset = "fixed",
  hasTabBar = false,
  hasStickyBottom = false,
  stickyBottomHeight = 72,
  extraBottomPadding = 24,
  contentContainerStyle,
  contentContainerClassName,
  refreshControl,
  keyboardAvoiding = false,
  keyboardOffset = 0,
}: ScreenProps) {
  const { top, bottom, getBottomSpace } = useScreenInsets();

  const computedBottomSpace = getBottomSpace({
    hasTabBar,
    hasStickyBottom,
    stickyHeight: stickyBottomHeight,
    extraPadding: extraBottomPadding,
  });

  const content =
    preset === "scroll" ? (
      <ScrollView
        contentContainerStyle={[
          { paddingBottom: computedBottomSpace },
          contentContainerStyle,
        ]}
        contentContainerClassName={contentContainerClassName}
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    ) : (
      <View
        style={[
          { paddingBottom: hasTabBar ? 0 : Math.max(bottom, 8) },
          style,
        ]}
        className={className}
      >
        {children}
      </View>
    );

  if (keyboardAvoiding) {
    return (
      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={top + keyboardOffset}
      >
        <View style={styles.flexOne} className={className}>
          {content}
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.flexOne} className={className}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
  },
});
