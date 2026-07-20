import { Avatar } from "@/components/ui/Avatar";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Header } from "@/components/ui/Header";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { COLORS } from "@/constants/colors";
import { getErrorMessage } from "@/lib/api/api-response";
import { toast } from "@/store/toast.store";
import { useUsersStore, type User } from "@/store/users.store";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";

const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  ACTIVE: "success",
  PENDING: "warning",
  SUSPENDED: "danger",
};

export default function AdminUsersScreen() {
  const users = useUsersStore((s) => s.users);
  const isLoading = useUsersStore((s) => s.isLoading);
  const pagination = useUsersStore((s) => s.pagination);
  const currentPage = useUsersStore((s) => s.currentPage);
  const fetchUsers = useUsersStore((s) => s.fetchUsers);
  const setPage = useUsersStore((s) => s.setPage);
  const approveUser = useUsersStore((s) => s.approveUser);
  const suspendUser = useUsersStore((s) => s.suspendUser);

  const [searchQuery, setSearchQuery] = useState("");
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [actionKind, setActionKind] = useState<"approve" | "suspend" | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchUsers(1, 20);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  const requestAction = (user: User, kind: "approve" | "suspend") => {
    setTargetUser(user);
    setActionKind(kind);
  };

  const handleConfirm = async () => {
    if (!targetUser || !actionKind) return;
    setIsProcessing(true);
    try {
      if (actionKind === "approve") {
        await approveUser(targetUser.id);
        toast.success(`${targetUser.name} is now active`);
      } else {
        await suspendUser(targetUser.id);
        toast.success(`${targetUser.name} has been suspended`);
      }
      setTargetUser(null);
      setActionKind(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-950">
      <Header title="User Management" showBack hideAuthControls />

      <View className="px-4 pb-3 pt-2">
        <Input
          placeholder="Search by name, username, or email..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={
            <Ionicons name="search-outline" size={18} color={COLORS.gray400} />
          }
        />
      </View>

      {isLoading && users.length === 0 ? (
        <View className="gap-4 px-4">
          {[...Array(6)].map((_, i) => (
            <View key={i} className="flex-row items-center gap-3">
              <Skeleton width={40} height={40} rounded="full" />
              <View className="flex-1 gap-2">
                <Skeleton height={13} width="50%" />
                <Skeleton height={11} width="70%" />
              </View>
            </View>
          ))}
        </View>
      ) : filteredUsers.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8 pb-20">
          <Ionicons name="people-outline" size={40} color={COLORS.gray400} />
          <Text className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            No users found
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => fetchUsers(1, 20)}
              tintColor={COLORS.primary}
            />
          }
          contentContainerClassName="pb-6"
          ItemSeparatorComponent={() => (
            <View className="h-px bg-gray-100 dark:bg-gray-900" />
          )}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (pagination.hasNext && !isLoading) setPage(currentPage + 1);
          }}
          renderItem={({ item: user }) => (
            <View className="flex-row items-center gap-3 px-4 py-3.5">
              <Avatar uri={user.avatar} name={user.name} size="sm" />

              <View className="min-w-0 flex-1">
                <View className="flex-row items-center gap-2">
                  <Text
                    numberOfLines={1}
                    className="flex-1 text-sm font-bold text-gray-900 dark:text-gray-100"
                  >
                    {user.name}
                  </Text>
                  <Badge variant={STATUS_VARIANTS[user.status] ?? "default"}>
                    {user.status}
                  </Badge>
                </View>
                <Text
                  numberOfLines={1}
                  className="text-xs text-gray-500 dark:text-gray-400"
                >
                  @{user.username} · {user.email}
                </Text>
                <View className="mt-1 flex-row items-center gap-1.5">
                  <Text className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    {user.role}
                  </Text>
                  {user.verified ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={13}
                      color={COLORS.primary}
                    />
                  ) : null}
                </View>
              </View>

              {user.status === "SUSPENDED" ? (
                <Pressable
                  onPress={() => requestAction(user, "approve")}
                  hitSlop={8}
                  className="h-9 w-9 items-center justify-center rounded-full bg-emerald-50 active:bg-emerald-100 dark:bg-emerald-950/40"
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={19}
                    color="#059669"
                  />
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => requestAction(user, "suspend")}
                  hitSlop={8}
                  className="h-9 w-9 items-center justify-center rounded-full bg-red-50 active:bg-red-100 dark:bg-red-950/40"
                >
                  <Ionicons
                    name="pause-circle-outline"
                    size={19}
                    color={COLORS.destructive}
                  />
                </Pressable>
              )}
            </View>
          )}
        />
      )}

      <ConfirmModal
        visible={!!targetUser}
        onClose={() => {
          setTargetUser(null);
          setActionKind(null);
        }}
        onConfirm={handleConfirm}
        title={actionKind === "approve" ? "Activate User" : "Suspend User"}
        description={
          actionKind === "approve"
            ? `${targetUser?.name ?? "This user"} will regain full access to the platform.`
            : `${targetUser?.name ?? "This user"} will be suspended and lose access to the platform.`
        }
        confirmText={actionKind === "approve" ? "Activate" : "Suspend"}
        variant={actionKind === "approve" ? "primary" : "danger"}
        icon={
          actionKind === "approve"
            ? "checkmark-circle-outline"
            : "pause-circle-outline"
        }
        isLoading={isProcessing}
      />
    </View>
  );
}
