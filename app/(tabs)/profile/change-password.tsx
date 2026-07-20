import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";
import { Input } from "@/components/ui/Input";
import { COLORS } from "@/constants/colors";
import { getErrorMessage } from "@/lib/api/api-response";
import { useProfileStore } from "@/store/profile.store";
import { toast } from "@/store/toast.store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ChangePasswordScreen() {
  const insets = useSafeAreaInsets();
  const changePassword = useProfileStore((s) => s.changePassword);

  const isChangingPassword = useProfileStore((s) => s.isChangingPassword);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const hasMinLength = newPassword.length >= 6;
  const passwordsMatch =
    newPassword.length > 0 && confirmPassword === newPassword;

  const validate = () => {
    const next: Record<string, string> = {};
    if (!currentPassword) next.currentPassword = "Current password is required";
    if (!newPassword) {
      next.newPassword = "New password is required";
    } else if (!hasMinLength) {
      next.newPassword = "Password must be at least 6 characters";
    }
    if (!confirmPassword) {
      next.confirmPassword = "Please confirm your new password";
    } else if (!passwordsMatch) {
      next.confirmPassword = "Passwords do not match";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await changePassword({ currentPassword, newPassword, confirmPassword });
      toast.success("Password updated successfully");
      router.back();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white dark:bg-gray-950"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Header title="Change Password" showBack />

      <ScrollView
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom + 24, 32),
        }}
        contentContainerClassName="px-6 pt-6"
        keyboardShouldPersistTaps="handled"
      >

        {/* Banner Card */}
        <View className="mb-6 items-center rounded-2xl bg-green-50/60 p-5 dark:bg-green-950/30 border border-green-100 dark:border-green-900/40">
          <View className="mb-3 h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/60">
            <Ionicons name="key-outline" size={28} color={COLORS.primary} />
          </View>
          <Text className="text-center text-lg font-bold text-gray-900 dark:text-gray-100">
            Security & Password
          </Text>
          <Text className="mt-1 text-center text-xs leading-5 text-gray-500 dark:text-gray-400">
            Update your account password to maintain maximum account security.
          </Text>
        </View>

        {/* Inputs */}
        <View className="gap-4">
          <Input
            label="Current Password"
            value={currentPassword}
            onChangeText={(v) => {
              setCurrentPassword(v);
              if (errors.currentPassword)
                setErrors((prev) => ({ ...prev, currentPassword: "" }));
            }}
            secureTextEntry
            placeholder="••••••••"
            leftIcon={
              <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
            }
            error={errors.currentPassword}
          />

          <Input
            label="New Password"
            value={newPassword}
            onChangeText={(v) => {
              setNewPassword(v);
              if (errors.newPassword)
                setErrors((prev) => ({ ...prev, newPassword: "" }));
            }}
            secureTextEntry
            placeholder="Min. 6 characters"
            leftIcon={
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color="#9CA3AF"
              />
            }
            error={errors.newPassword}
          />

          <Input
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={(v) => {
              setConfirmPassword(v);
              if (errors.confirmPassword)
                setErrors((prev) => ({ ...prev, confirmPassword: "" }));
            }}
            secureTextEntry
            placeholder="Re-enter new password"
            leftIcon={
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#9CA3AF"
              />
            }
            error={errors.confirmPassword}
          />

          {/* Requirements Checklist */}
          {newPassword.length > 0 ? (
            <View className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 gap-2">
              <Text className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Password Requirements:
              </Text>

              <View className="flex-row items-center gap-2">
                <Ionicons
                  name={hasMinLength ? "checkmark-circle" : "ellipse-outline"}
                  size={16}
                  color={hasMinLength ? "#16A34A" : "#9CA3AF"}
                />
                <Text
                  className={`text-xs ${
                    hasMinLength
                      ? "text-green-600 dark:text-green-400 font-medium"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  At least 6 characters long
                </Text>
              </View>

              <View className="flex-row items-center gap-2">
                <Ionicons
                  name={passwordsMatch ? "checkmark-circle" : "ellipse-outline"}
                  size={16}
                  color={passwordsMatch ? "#16A34A" : "#9CA3AF"}
                />
                <Text
                  className={`text-xs ${
                    passwordsMatch
                      ? "text-green-600 dark:text-green-400 font-medium"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  Passwords match
                </Text>
              </View>
            </View>
          ) : null}

          <Button
            onPress={handleSubmit}
            isLoading={isChangingPassword}
            disabled={!currentPassword || !newPassword || !confirmPassword}
            className="mt-2"
          >
            Update Password
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
