import { COLORS } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string | null;
  helperText?: string;
  containerClassName?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      helperText,
      containerClassName,
      className,
      leftIcon,
      rightIcon,
      showPasswordToggle,
      secureTextEntry,
      onFocus,
      onBlur,
      ...rest
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordHidden, setIsPasswordHidden] = useState(true);

    const isSecure = secureTextEntry && isPasswordHidden;

    return (
      <View className={containerClassName}>
        {label ? (
          <Text className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </Text>
        ) : null}

        <View
          className={`flex-row items-center rounded-xl border px-3.5 py-3 ${
            error
              ? "border-red-500 bg-red-50/10 dark:border-red-500/80"
              : isFocused
                ? "border-primary bg-primary/5 dark:bg-primary/10"
                : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
          }`}
        >
          {leftIcon ? (
            <View className="mr-2.5 items-center justify-center">
              {leftIcon}
            </View>
          ) : null}

          <TextInput
            ref={ref}
            placeholderTextColor="#9CA3AF"
            secureTextEntry={secureTextEntry ? isSecure : false}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            className={`flex-1 text-base text-gray-900 dark:text-gray-100 p-0 ${className ?? ""}`}
            {...rest}
          />

          {rightIcon ? (
            <View className="ml-2.5 items-center justify-center">
              {rightIcon}
            </View>
          ) : secureTextEntry || showPasswordToggle ? (
            <Pressable
              onPress={() => setIsPasswordHidden((prev) => !prev)}
              hitSlop={8}
              className="ml-2.5 items-center justify-center"
            >
              <Ionicons
                name={isPasswordHidden ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={isFocused ? COLORS.primary : COLORS.gray400}
              />
            </Pressable>
          ) : null}
        </View>

        {error ? (
          <Text className="mt-1 text-xs text-red-500">{error}</Text>
        ) : helperText ? (
          <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {helperText}
          </Text>
        ) : null}
      </View>
    );
  },
);

Input.displayName = "Input";
