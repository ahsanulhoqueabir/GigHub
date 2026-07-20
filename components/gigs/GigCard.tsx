import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { COLORS } from "@/constants/colors";
import { formatPrice } from "@/lib/currency";
import type { GigListItem } from "@/types/db/gig.types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

interface GigCardProps {
  gig: GigListItem;
  width?: number;
}

export function GigCard({ gig, width }: GigCardProps) {
  const lowestPrice = gig.packages
    ?.map((p) => p.price)
    .filter((p): p is number => p != null)
    .sort((a, b) => a - b)[0];

  return (
    <Pressable
      onPress={() => router.push(`/gig/${gig.slug}`)}
      style={width ? { width } : undefined}
      className="overflow-hidden rounded-2xl border border-gray-100 bg-white active:opacity-90 dark:border-gray-800 dark:bg-gray-900"
    >
      <View className="aspect-[16/10] bg-gray-100 dark:bg-gray-800">
        {gig.images?.[0] ? (
          <Image
            source={{ uri: gig.images[0] }}
            className="h-full w-full"
            contentFit="cover"
            transition={150}
          />
        ) : (
          <View className="h-full w-full items-center justify-center">
            <Ionicons name="image-outline" size={28} color="#D1D5DB" />
          </View>
        )}
        {gig.category ? (
          <Badge
            variant="info"
            className={`absolute left-2 top-2 bg-${COLORS.primary}/90 text-${COLORS.primaryForeground}`}
          >
            {gig.category.name}
          </Badge>
        ) : null}
      </View>

      <View className="gap-2 p-3">
        <View className="flex-row items-center gap-1.5">
          <Avatar uri={gig.seller.avatar} name={gig.seller.name} size="sm" />
          <Text
            numberOfLines={1}
            className="flex-1 text-xs text-gray-500 dark:text-gray-400"
          >
            {gig.seller.name}
          </Text>
          {gig.seller.verified ? (
            <Ionicons
              name="checkmark-circle"
              size={13}
              color={COLORS.primary}
            />
          ) : null}
        </View>

        <Text
          numberOfLines={2}
          className="text-sm font-medium leading-5 text-gray-900 dark:text-gray-100"
        >
          {gig.title}
        </Text>

        <View className="mt-1 flex-row items-center justify-between">
          <View className="flex-row items-center gap-1">
            <Ionicons name="eye-outline" size={13} color="#9CA3AF" />
            <Text className="text-xs text-gray-400 dark:text-gray-500">
              {gig.views}
            </Text>
          </View>
          {lowestPrice != null ? (
            <Text className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              From {formatPrice(lowestPrice)}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
