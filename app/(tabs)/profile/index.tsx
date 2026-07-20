import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Header } from "@/components/ui/Header";
import { Skeleton } from "@/components/ui/Skeleton";
import { COLORS } from "@/constants/colors";
import { useAuthStore } from "@/store/auth.store";
import { useProfileStore } from "@/store/profile.store";
import { useWalletStore } from "@/store/wallet.store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

const SOCIAL_ICONS: {
  key: "github" | "linkedin" | "twitter" | "facebook" | "instagram";
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: "github", icon: "logo-github" },
  { key: "linkedin", icon: "logo-linkedin" },
  { key: "twitter", icon: "logo-twitter" },
  { key: "facebook", icon: "logo-facebook" },
  { key: "instagram", icon: "logo-instagram" },
];

export default function ProfileScreen() {
  const isAuthenticated = useAuthStore((s) => s.accessToken !== null);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const profile = useProfileStore((s) => s.profile);
  const isLoading = useProfileStore((s) => s.isLoading);
  const fetchProfile = useProfileStore((s) => s.fetchProfile);

  const wallet = useWalletStore((s) => s.wallet);
  const fetchWallet = useWalletStore((s) => s.fetchWallet);

  const [refreshing, setRefreshing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNavGridModal, setShowNavGridModal] = useState(false);

  const loadAll = useCallback(async () => {
    if (!isAuthenticated) return;
    await Promise.all([fetchProfile(), fetchWallet()]);
  }, [isAuthenticated, fetchProfile, fetchWallet]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const onRefresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  }, [isAuthenticated, loadAll]);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-950">
        <Header title="Profile" hideAuthControls />

        <ScrollView contentContainerClassName="px-6 py-8 items-center justify-center">
          {/* Guest Icon Badge */}
          <View className="mb-4 h-24 w-24 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
            <Ionicons
              name="person-circle-outline"
              size={64}
              color={COLORS.primary}
            />
          </View>

          {/* Heading */}
          <Text className="text-center text-2xl font-extrabold text-gray-900 dark:text-gray-100">
            Welcome to GigHub
          </Text>

          <Text className="mt-2 max-w-xs text-center text-sm leading-5 text-gray-500 dark:text-gray-400">
            Sign in or create an account to post jobs, offer gigs, manage
            orders, and access your wallet.
          </Text>

          {/* Action CTA Buttons */}
          <View className="mt-7 w-full gap-3">
            <Button onPress={() => router.push("/(auth)/login")}>
              Sign In
            </Button>
            <Button
              variant="outline"
              onPress={() => router.push("/(auth)/signup")}
            >
              Create Account
            </Button>
          </View>

          {/* Feature Highlights Grid */}
          <View className="mt-9 w-full gap-3.5 rounded-2xl border border-gray-100 bg-gray-50/70 p-5 dark:border-gray-800 dark:bg-gray-900/50">
            <View className="flex-row items-center gap-3">
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20">
                <Ionicons
                  name="briefcase-outline"
                  size={18}
                  color={COLORS.primary}
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-gray-900 dark:text-gray-100">
                  Find Freelance Jobs
                </Text>
                <Text className="text-[11px] text-gray-500 dark:text-gray-400">
                  Apply for tech, design, writing, and tuition jobs
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3">
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/40">
                <Ionicons name="sparkles-outline" size={18} color="#8B5CF6" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-gray-900 dark:text-gray-100">
                  Offer Your Services
                </Text>
                <Text className="text-[11px] text-gray-500 dark:text-gray-400">
                  Create custom packages &amp; gigs to earn money
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3">
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color="#10B981"
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-gray-900 dark:text-gray-100">
                  Protected Escrow
                </Text>
                <Text className="text-[11px] text-gray-500 dark:text-gray-400">
                  Secured payments released only upon satisfaction
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  const departmentLabel =
    typeof profile?.department === "string"
      ? profile.department
      : profile?.department?.name;

  const activeSocials = SOCIAL_ICONS.filter((s) => profile?.socials?.[s.key]);

  return (
    <View className="flex-1 bg-white dark:bg-gray-950">
      <Header title="Profile" />

      <ScrollView
        contentContainerClassName="px-6 pb-12 pt-6"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* ── Identity ─────────────────────────────────────────── */}
        <View className="items-center">
          <Avatar
            uri={profile?.avatar}
            name={profile?.name ?? user?.name}
            size="xl"
          />

          {isLoading && !profile ? (
            <View className="mt-4 items-center gap-2">
              <Skeleton width={160} height={20} />
              <Skeleton width={100} height={14} />
            </View>
          ) : (
            <>
              <View className="mt-4 flex-row items-center gap-1.5">
                <Text className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {profile?.name ?? user?.name ?? "—"}
                </Text>
                {profile?.verified ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={COLORS.primary}
                  />
                ) : null}
              </View>
              {profile?.username ? (
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  @{profile.username}
                </Text>
              ) : null}

              <View className="mt-2 flex-row flex-wrap justify-center gap-2">
                {profile?.role === "ADMIN" ? (
                  <Badge variant="info">Admin</Badge>
                ) : null}
                {departmentLabel ? (
                  <Badge variant="default">{departmentLabel}</Badge>
                ) : null}
                {profile?.student_id ? (
                  <Badge variant="default">{profile.student_id}</Badge>
                ) : null}
              </View>
            </>
          )}
        </View>

        {profile?.bio ? (
          <Text className="mt-4 text-center text-[14px] leading-5 text-gray-600 dark:text-gray-300">
            {profile.bio}
          </Text>
        ) : null}

        {profile?.skills && profile.skills.length > 0 ? (
          <View className="mt-4 flex-row flex-wrap justify-center gap-2">
            {profile.skills.map((skill) => (
              <Chip key={skill} label={skill} />
            ))}
          </View>
        ) : null}

        {activeSocials.length > 0 || profile?.website ? (
          <View className="mt-4 flex-row justify-center gap-4">
            {profile?.website ? (
              <Pressable
                hitSlop={6}
                onPress={() => Linking.openURL(profile.website!)}
              >
                <Ionicons name="globe-outline" size={22} color="#6B7280" />
              </Pressable>
            ) : null}
            {activeSocials.map(({ key, icon }) => (
              <Pressable
                key={key}
                hitSlop={6}
                onPress={() => Linking.openURL(profile!.socials![key]!)}
              >
                <Ionicons name={icon} size={22} color="#6B7280" />
              </Pressable>
            ))}
          </View>
        ) : null}

        {/* ── Quick Navigation Bar (Instant Shortcuts) ─────────── */}
        <View className="mt-6 flex-row gap-2.5">
          <QuickNavButton
            icon="create-outline"
            label="Edit Profile"
            onPress={() => router.push("/(tabs)/profile/edit")}
          />
          <QuickNavButton
            icon="wallet-outline"
            label="My Wallet"
            onPress={() => router.push("/(tabs)/profile/wallet")}
          />
          <QuickNavButton
            icon="key-outline"
            label="Password"
            onPress={() => router.push("/(tabs)/profile/change-password")}
          />
        </View>

        {/* ── Wallet Card ───────────────────────────────────────── */}
        <Pressable
          onPress={() => router.push("/(tabs)/profile/wallet")}
          className="mt-5 flex-row items-center justify-between rounded-2xl bg-green-50/80 p-4 border border-green-100/80 active:opacity-80 dark:bg-green-950/30 dark:border-green-900/40"
        >
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-xl bg-primary/15 dark:bg-primary/25">
              <Ionicons
                name="wallet-outline"
                size={22}
                color={COLORS.primary}
              />
            </View>
            <View>
              <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Wallet Balance
              </Text>
              <Text className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {wallet
                  ? `${wallet.currency} ${wallet.balance.toFixed(2)}`
                  : "—"}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-1">
            <Text className="text-xs font-semibold text-primary">
              View Wallet
            </Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
          </View>
        </Pressable>

        {/* ── Work & Activity Section ───────────────────────────── */}
        <Text className="mt-6 mb-2 px-1 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Work & Activity
        </Text>
        <View className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800">
          <MenuRow
            icon="receipt-outline"
            label="My Orders"
            subtitle="Manage & track purchases and sales"
            onPress={() => router.push("/(tabs)/orders")}
          />
          <MenuRow
            icon="briefcase-outline"
            label="My Gigs"
            onPress={() => router.push("/(tabs)/profile/my-gigs")}
          />
          <MenuRow
            icon="document-text-outline"
            label="My Jobs"
            onPress={() => router.push("/(tabs)/profile/my-jobs")}
          />
          <MenuRow
            icon="paper-plane-outline"
            label="Applied Jobs"
            onPress={() => router.push("/(tabs)/profile/applied-jobs")}
          />
          <MenuRow
            icon="people-outline"
            label="Incoming Proposals"
            onPress={() => router.push("/(tabs)/profile/incoming-proposals")}
            last
          />
        </View>

        {/* ── Account & Security Section ────────────────────────── */}
        <Text className="mt-6 mb-2 px-1 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Account & Security
        </Text>
        <View className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800">
          <MenuRow
            icon="create-outline"
            label="Edit Profile Information"
            subtitle="Name, Bio, Skills, Social Links"
            onPress={() => router.push("/(tabs)/profile/edit")}
          />
          <MenuRow
            icon="wallet-outline"
            label="Wallet & Transactions"
            subtitle="Check balance & payment history"
            onPress={() => router.push("/(tabs)/profile/wallet")}
          />
          <MenuRow
            icon="key-outline"
            label="Change Password"
            subtitle="Update security password"
            onPress={() => router.push("/(tabs)/profile/change-password")}
          />
          <MenuRow
            icon="shield-checkmark-outline"
            label="Escrow Protection"
            onPress={() => router.push("/(tabs)/profile/escrow")}
            last
          />
        </View>
      </ScrollView>
    </View>
  );
}

function QuickNavButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 flex-col items-center justify-center rounded-2xl border border-gray-200 bg-gray-50/80 py-3.5 px-2 active:bg-gray-100 dark:border-gray-800 dark:bg-gray-900/60 dark:active:bg-gray-800"
    >
      <View className="mb-1.5 h-10 w-10 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20">
        <Ionicons name={icon} size={20} color={COLORS.primary} />
      </View>
      <Text
        className="text-center text-xs font-semibold text-gray-800 dark:text-gray-200"
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function MenuRow({
  icon,
  label,
  subtitle,
  onPress,
  last = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-3.5 bg-white px-4 py-3.5 active:bg-gray-50 dark:bg-gray-950 dark:active:bg-gray-900 ${
        last ? "" : "border-b border-gray-100 dark:border-gray-800"
      }`}
    >
      <View className="h-9 w-9 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-900">
        <Ionicons name={icon} size={19} color={COLORS.primary} />
      </View>
      <View className="flex-1">
        <Text className="text-[15px] font-medium text-gray-900 dark:text-gray-100">
          {label}
        </Text>
        {subtitle ? (
          <Text className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
    </Pressable>
  );
}
