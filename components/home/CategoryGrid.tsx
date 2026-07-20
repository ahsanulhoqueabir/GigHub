import { COLORS } from "@/constants/colors";
import type { CategoryMinimal } from "@/types/db/category.types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { cssInterop } from "nativewind";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

cssInterop(Image, { className: "style" });

interface CategoryGridProps {
  categories: CategoryMinimal[];
  onSelect: (category: CategoryMinimal) => void;
}

function CategoryItem({
  category,
  onSelect,
}: {
  category: CategoryMinimal;
  onSelect: (category: CategoryMinimal) => void;
}) {
  const [hasError, setHasError] = useState(false);

  const imageUrl =
    category.image &&
    typeof category.image === "string" &&
    category.image.trim() !== ""
      ? category.image.trim()
      : null;

  const showImage = !!imageUrl && !hasError;

  return (
    <Pressable
      onPress={() => onSelect(category)}
      className="w-20 items-center gap-2 active:opacity-70"
    >
      {showImage ? (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: 56, height: 56 }}
          className="h-14 w-14 rounded-2xl"
          contentFit="cover"
          transition={150}
          onError={() => setHasError(true)}
        />
      ) : (
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 dark:bg-primary/20">
          <Ionicons name="pricetag-outline" size={22} color={COLORS.primary} />
        </View>
      )}
      <Text
        numberOfLines={2}
        className="text-center text-xs font-medium text-gray-700 dark:text-gray-300"
      >
        {category.name}
      </Text>
    </Pressable>
  );
}

export function CategoryGrid({ categories, onSelect }: CategoryGridProps) {
  if (categories.length === 0) return null;

  const rows: CategoryMinimal[][] = [[], []];
  categories.forEach((category, index) => {
    rows[index % 2].push(category);
  });

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="px-6"
    >
      <View className="gap-3">
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} className="flex-row gap-3">
            {row.map((category) => (
              <CategoryItem
                key={category.id}
                category={category}
                onSelect={onSelect}
              />
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
