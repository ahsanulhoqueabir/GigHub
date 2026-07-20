import { COLORS } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  Modal as RNModal,
  Text,
  View,
} from "react-native";

export type ConfirmModalVariant = "danger" | "warning" | "info" | "primary";

export interface ConfirmModalProps {
  /** Controls visibility of the confirmation modal */
  visible: boolean;
  /** Callback fired when modal backdrop or cancel button is pressed */
  onClose: () => void;
  /** Callback fired when action is confirmed */
  onConfirm: () => void | Promise<void>;
  /** Modal main title */
  title?: string;
  /** Modal message / body explanation */
  description?: string;
  /** Label for confirm button */
  confirmText?: string;
  /** Label for cancel button */
  cancelText?: string;
  /** Visual variant affecting badge icon colors and primary button tone */
  variant?: ConfirmModalVariant;
  /** Custom icon name from Ionicons */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Shows loading spinner on confirm button and disables actions */
  isLoading?: boolean;
}

const variantConfig: Record<
  ConfirmModalVariant,
  {
    badgeBg: string;
    iconColor: string;
    confirmBg: string;
    confirmFgColor: string;
    defaultIcon: keyof typeof Ionicons.glyphMap;
  }
> = {
  danger: {
    badgeBg:
      "bg-red-50 dark:bg-red-950/60 border border-red-100 dark:border-red-900/40",
    iconColor: COLORS.destructive,
    confirmBg: "bg-destructive active:bg-destructive-dark",
    confirmFgColor: COLORS.destructiveForeground,
    defaultIcon: "log-out-outline",
  },
  warning: {
    badgeBg:
      "bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-900/40",
    iconColor: COLORS.warning,
    confirmBg: "bg-amber-600 active:bg-amber-700",
    confirmFgColor: COLORS.warningForeground,
    defaultIcon: "alert-circle-outline",
  },
  info: {
    badgeBg:
      "bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40",
    iconColor: COLORS.secondary,
    confirmBg: "bg-secondary active:bg-secondary-dark",
    confirmFgColor: COLORS.secondaryForeground,
    defaultIcon: "information-circle-outline",
  },
  primary: {
    badgeBg:
      "bg-green-50 dark:bg-green-950/60 border border-green-100 dark:border-green-900/40",
    iconColor: COLORS.primary,
    confirmBg: "bg-primary active:bg-primary-dark",
    confirmFgColor: COLORS.primaryForeground,
    defaultIcon: "help-circle-outline",
  },
};

/**
 * Modern, flexible confirmation dialog modal.
 * Can be shared across the entire app for logout, delete, warnings, and custom action prompts.
 */
export function ConfirmModal({
  visible,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "Please confirm if you want to proceed with this action.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  icon,
  isLoading = false,
}: ConfirmModalProps) {
  const config = variantConfig[variant];
  const activeIcon = icon || config.defaultIcon;

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={isLoading ? undefined : onClose}
    >
      <View className="flex-1 items-center justify-center bg-black/60 px-5">
        {/* Backdrop Pressable */}
        <Pressable
          className="absolute inset-0"
          onPress={isLoading ? undefined : onClose}
        />

        {/* Modal Dialog Card */}
        <View className="w-full max-w-sm items-center rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
          {/* Top Icon Badge */}
          <View
            className={`mb-4 h-16 w-16 items-center justify-center rounded-full ${config.badgeBg}`}
          >
            <Ionicons name={activeIcon} size={30} color={config.iconColor} />
          </View>

          {/* Title & Description */}
          <Text className="mb-2 text-center text-xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </Text>
          {description ? (
            <Text className="mb-6 px-1 text-center text-sm leading-5 text-gray-500 dark:text-gray-400">
              {description}
            </Text>
          ) : null}

          {/* Action Buttons */}
          <View className="flex-row items-center gap-3 w-full">
            <Pressable
              disabled={isLoading}
              onPress={onClose}
              className="flex-1 items-center justify-center rounded-2xl bg-gray-100 py-3.5 active:bg-gray-200 dark:bg-gray-800 dark:active:bg-gray-700"
            >
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {cancelText}
              </Text>
            </Pressable>

            <Pressable
              disabled={isLoading}
              onPress={onConfirm}
              className={`flex-1 items-center justify-center rounded-2xl py-3.5 shadow-sm ${config.confirmBg} ${
                isLoading ? "opacity-75" : ""
              }`}
            >
              {isLoading ? (
                <ActivityIndicator color={config.confirmFgColor} size="small" />
              ) : (
                <Text
                  className="text-sm font-semibold"
                  style={{ color: config.confirmFgColor }}
                >
                  {confirmText}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </RNModal>
  );
}
