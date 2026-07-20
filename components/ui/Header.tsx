import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { QuickNavGridModal } from "@/components/ui/QuickNavGridModal";
import { COLORS } from "@/constants/colors";
import { selectIsAuthenticated, useAuthStore } from "@/store/auth.store";
import { useProfileStore } from "@/store/profile.store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState, type ReactNode } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  right?: ReactNode;
  transparent?: boolean;
  hideAuthControls?: boolean;
  showLogo?: boolean;
}

export function Header({
  title,
  showBack = false,
  onBackPress,
  right,
  transparent = false,
  hideAuthControls = false,
  showLogo = false,
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const profile = useProfileStore((s) => s.profile);

  const [showNavGridModal, setShowNavGridModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  return (
    <View
      style={{ paddingTop: insets.top }}
      className={`${transparent ? "" : "border-b border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-950"}`}
    >
      <View className="h-14 flex-row items-center justify-between px-3">
        {/* Left Section: Back Button & Title */}
        <View className="flex-row items-center gap-2 flex-1">
          {showBack ? (
            <Pressable
              hitSlop={8}
              onPress={onBackPress ?? (() => router.back())}
              className="h-10 w-10 items-center justify-center rounded-full active:bg-gray-100 dark:active:bg-gray-800"
            >
              <Ionicons name="chevron-back" size={24} color="#111827" />
            </Pressable>
          ) : null}

          {showLogo ? (
            <Image
              source={require("@/assets/logo.png")}
              style={{ width: 28, height: 28, borderRadius: 8 }}
              resizeMode="contain"
            />
          ) : null}

          {title ? (
            <Text
              numberOfLines={1}
              className="text-base font-bold text-gray-900 dark:text-gray-100"
            >
              {title}
            </Text>
          ) : null}
        </View>

        {/* Right Section: Custom Right Controls & Auth (Avatar + 3-Dot Grid Icon) */}
        <View className="flex-row items-center gap-2.5">
          {right}

          {!hideAuthControls ? (
            isAuthenticated ? (
              <View className="flex-row items-center gap-2">
                <Pressable
                  onPress={() => router.push("/(tabs)/profile")}
                  hitSlop={6}
                  className="rounded-full border border-indigo-200 dark:border-indigo-900 p-0.5 active:opacity-80"
                >
                  <Avatar
                    uri={profile?.avatar}
                    name={profile?.name ?? user?.name ?? "User"}
                    size="sm"
                  />
                </Pressable>

                <Pressable
                  onPress={() => setShowNavGridModal(true)}
                  hitSlop={6}
                  className="h-8 w-8 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/60 active:bg-green-100 dark:active:bg-green-900 border border-green-100 dark:border-green-900/60"
                >
                  <Ionicons
                    name="ellipsis-vertical"
                    size={16}
                    color={COLORS.primary}
                  />
                </Pressable>
              </View>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onPress={() => router.push("/(auth)/login")}
              >
                Sign In
              </Button>
            )
          ) : null}
        </View>
      </View>

      {/* ── Navigation Hub & Logout Confirmation Modals ───────── */}
      <QuickNavGridModal
        visible={showNavGridModal}
        onClose={() => setShowNavGridModal(false)}
        onLogoutPress={handleLogout}
      />

      <ConfirmModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          setShowLogoutModal(false);
          logout();
          router.replace("/(auth)/login");
        }}
        title="Log Out"
        description="Are you sure you want to log out? You will need to sign in again to access your account."
        confirmText="Log Out"
        cancelText="Cancel"
        variant="danger"
        icon="log-out-outline"
      />
    </View>
  );
}
