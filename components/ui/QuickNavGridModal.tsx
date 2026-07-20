import { COLORS } from "@/constants/colors";
import { useAuthStore } from "@/store/auth.store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface QuickNavItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  route?: string;
  badge?: string;
  onPress?: () => void;
  color?: string;
  bgColor?: string;
}

export interface QuickNavCategory {
  category: string;
  items: QuickNavItem[];
}

export interface QuickNavGridModalProps {
  visible: boolean;
  onClose: () => void;
  onLogoutPress?: () => void;
}

export function QuickNavGridModal({
  visible,
  onClose,
  onLogoutPress,
}: QuickNavGridModalProps) {
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAuthStore((s) => s.accessToken !== null);
  const user = useAuthStore((s) => s.user);
  const isAdmin =
    typeof user?.role === "string" && user.role.toUpperCase() === "ADMIN";

  const handleNavigate = (route?: string, customPress?: () => void) => {
    onClose();
    if (!isAuthenticated) {
      router.push("/(auth)/login");
      return;
    }
    if (customPress) {
      customPress();
    } else if (route) {
      router.push(route as any);
    }
  };

  const navCategories: QuickNavCategory[] = [
    {
      category: "Account & Profile",
      items: [
        {
          id: "edit-profile",
          title: "Edit Profile",
          subtitle: "Name, bio, social links",
          icon: "create-outline",
          route: "/(tabs)/profile/edit",
          color: COLORS.primary,
          bgColor:
            "bg-green-50 dark:bg-green-950/40 border-green-100 dark:border-green-900/40",
        },
        {
          id: "change-password",
          title: "Change Password",
          subtitle: "Update security credentials",
          icon: "key-outline",
          route: "/(tabs)/profile/change-password",
          color: "#8B5CF6",
          bgColor:
            "bg-purple-50 dark:bg-purple-950/40 border-purple-100 dark:border-purple-900/40",
        },
      ],
    },
    {
      category: "Finance & Payments",
      items: [
        {
          id: "wallet",
          title: "My Wallet",
          subtitle: "Balance & transaction history",
          icon: "wallet-outline",
          route: "/(tabs)/profile/wallet",
          color: "#10B981",
          bgColor:
            "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/40",
        },
        {
          id: "escrow",
          title: "Escrow Protection",
          subtitle: "Secured job funds",
          icon: "shield-checkmark-outline",
          route: "/(tabs)/profile/escrow",
          color: "#F59E0B",
          bgColor:
            "bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/40",
        },
      ],
    },
    {
      category: "Work & Gigs Management",
      items: [
        {
          id: "orders",
          title: "My Orders",
          subtitle: "Track purchases & sales",
          icon: "receipt-outline",
          route: "/(tabs)/orders",
          color: "#6366F1",
          bgColor:
            "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/40",
        },
        {
          id: "post-job",
          title: "Post a Job",
          subtitle: "Hire for a new task",
          icon: "add-circle-outline",
          route: "/(tabs)/profile/post-job",
          color: "#F97316",
          bgColor:
            "bg-orange-50 dark:bg-orange-950/40 border-orange-100 dark:border-orange-900/40",
        },
        {
          id: "create-gig",
          title: "Create a Gig",
          subtitle: "Offer a new service",
          icon: "add-circle-outline",
          route: "/(tabs)/profile/create-gig",
          color: "#8B5CF6",
          bgColor:
            "bg-purple-50 dark:bg-purple-950/40 border-purple-100 dark:border-purple-900/40",
        },
        {
          id: "my-gigs",
          title: "My Gigs",
          subtitle: "Services you offer",
          icon: "briefcase-outline",
          route: "/(tabs)/profile/my-gigs",
          color: "#3B82F6",
          bgColor:
            "bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/40",
        },
        {
          id: "my-jobs",
          title: "My Jobs",
          subtitle: "Posted jobs & hirings",
          icon: "document-text-outline",
          route: "/(tabs)/profile/my-jobs",
          color: "#EC4899",
          bgColor:
            "bg-pink-50 dark:bg-pink-950/40 border-pink-100 dark:border-pink-900/40",
        },
        {
          id: "applied-jobs",
          title: "Applied Jobs",
          subtitle: "Submitted applications",
          icon: "paper-plane-outline",
          route: "/(tabs)/profile/applied-jobs",
          color: "#06B6D4",
          bgColor:
            "bg-cyan-50 dark:bg-cyan-950/40 border-cyan-100 dark:border-cyan-900/40",
        },
        {
          id: "proposals",
          title: "Proposals",
          subtitle: "Incoming offer requests",
          icon: "people-outline",
          route: "/(tabs)/profile/incoming-proposals",
          color: "#14B8A6",
          bgColor:
            "bg-teal-50 dark:bg-teal-950/40 border-teal-100 dark:border-teal-900/40",
        },
      ],
    },
  ];

  if (isAdmin) {
    navCategories.push({
      category: "Administration",
      items: [
        {
          id: "admin-dashboard",
          title: "Admin Dashboard",
          subtitle: "Platform stats & user management",
          icon: "speedometer-outline",
          route: "/admin",
          color: "#DC2626",
          bgColor:
            "bg-red-50 dark:bg-red-950/40 border-red-100 dark:border-red-900/40",
        },
      ],
    });
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View
        className="flex-1 bg-white dark:bg-gray-950"
        style={{ paddingTop: insets.top }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <View>
            <Text className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Navigation Hub
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              All features & quick settings
            </Text>
          </View>

          <Pressable
            onPress={onClose}
            hitSlop={8}
            className="h-10 w-10 items-center justify-center rounded-full bg-gray-100 active:bg-gray-200 dark:bg-gray-800 dark:active:bg-gray-700"
          >
            <Ionicons name="close" size={22} color="#6B7280" />
          </Pressable>
        </View>

        {/* Category Grid Items */}
        <ScrollView contentContainerClassName="px-6 pb-12 pt-4">
          {navCategories.map((group) => (
            <View key={group.category} className="mb-6">
              <Text className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {group.category}
              </Text>

              <View className="flex-row flex-wrap gap-3">
                {group.items.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => handleNavigate(item.route, item.onPress)}
                    className={`w-[48%] rounded-2xl border p-4 active:opacity-80 ${item.bgColor}`}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-gray-900 shadow-sm">
                        <Ionicons
                          name={item.icon}
                          size={22}
                          color={item.color}
                        />
                      </View>
                      {item.badge ? (
                        <View className="rounded-full bg-amber-500/10 px-2 py-0.5 border border-amber-500/20">
                          <Text className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                            {item.badge}
                          </Text>
                        </View>
                      ) : (
                        <Ionicons
                          name="arrow-forward-outline"
                          size={16}
                          color="#9CA3AF"
                        />
                      )}
                    </View>

                    <Text
                      className="mt-3 text-sm font-bold text-gray-900 dark:text-gray-100"
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    {item.subtitle ? (
                      <Text
                        className="mt-1 text-xs text-gray-500 dark:text-gray-400"
                        numberOfLines={1}
                      >
                        {item.subtitle}
                      </Text>
                    ) : null}
                  </Pressable>
                ))}
              </View>
            </View>
          ))}

          {/* Quick Logout Banner */}
          {onLogoutPress ? (
            <Pressable
              onPress={() => {
                onClose();
                onLogoutPress();
              }}
              className="mt-2 flex-row items-center justify-between rounded-2xl border border-red-200 bg-red-50/70 p-4 active:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30"
            >
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/50">
                  <Ionicons name="log-out-outline" size={22} color="#EF4444" />
                </View>
                <View>
                  <Text className="text-sm font-bold text-red-600 dark:text-red-400">
                    Sign Out
                  </Text>
                  <Text className="text-xs text-red-500/80 dark:text-red-400/80">
                    Log out of your account
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#EF4444" />
            </Pressable>
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  );
}
