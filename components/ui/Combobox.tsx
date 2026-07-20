import { Modal } from "@/components/ui/Modal";
import type { SelectOption } from "@/components/ui/Select";
import { COLORS } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";

interface ComboboxProps {
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  value?: string | null;
  options: SelectOption[];
  onChange: (value: string) => void;
  error?: string | null;
  isLoading?: boolean;
}

export function Combobox({
  label,
  placeholder = "Search and select category...",
  searchPlaceholder = "Type to filter categories...",
  value,
  options,
  onChange,
  error,
  isLoading = false,
}: ComboboxProps) {
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState("");

  const selected = options.find((o) => o.value === value);

  const filtered = query.trim()
    ? options.filter((o) =>
        o.label.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : options;

  return (
    <View>
      {label ? (
        <Text className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </Text>
      ) : null}

      <Pressable
        onPress={() => setVisible(true)}
        className={`flex-row items-center justify-between rounded-xl border px-4 py-3 bg-white dark:bg-gray-900 ${
          error ? "border-red-500" : "border-gray-300 dark:border-gray-700"
        }`}
      >
        <View className="flex-1 flex-row items-center gap-2.5 pr-2">
          <Ionicons
            name="search"
            size={18}
            color={selected ? COLORS.primary : "#9CA3AF"}
          />
          <Text
            numberOfLines={1}
            className={`text-base ${
              selected
                ? "font-medium text-gray-900 dark:text-gray-100"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {isLoading
              ? "Loading categories..."
              : (selected?.label ?? placeholder)}
          </Text>
        </View>

        <View className="flex-row items-center gap-1.5">
          {selected ? (
            <View className="rounded-full bg-primary/10 px-2 py-0.5 dark:bg-primary/20">
              <Text className="text-xs font-semibold text-primary">
                Selected
              </Text>
            </View>
          ) : null}
          <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
        </View>
      </Pressable>

      {error ? (
        <Text className="mt-1 text-xs text-red-500">{error}</Text>
      ) : null}

      <Modal
        visible={visible}
        onClose={() => setVisible(false)}
        title={label ?? "Select Category"}
      >
        <View className="gap-3">
          {/* Search Box */}
          <View className="relative flex-row items-center rounded-xl border border-gray-300 bg-gray-50 px-3.5 dark:border-gray-700 dark:bg-gray-900">
            <Ionicons name="search-outline" size={18} color="#9CA3AF" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={searchPlaceholder}
              placeholderTextColor="#9CA3AF"
              className="flex-1 py-3 pl-2.5 text-base text-gray-900 dark:text-gray-100"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {query.length > 0 ? (
              <Pressable hitSlop={8} onPress={() => setQuery("")}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </Pressable>
            ) : null}
          </View>

          {/* Results Summary */}
          <View className="flex-row items-center justify-between px-1">
            <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {filtered.length}{" "}
              {filtered.length === 1 ? "category" : "categories"} found
            </Text>
            {query.length > 0 ? (
              <Text className="text-xs text-primary font-medium">
                Filtering by &quot;{query}&quot;
              </Text>
            ) : null}
          </View>

          {/* Category List */}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.value}
            style={{ maxHeight: 340 }}
            keyboardShouldPersistTaps="handled"
            ItemSeparatorComponent={() => (
              <View className="h-px bg-gray-100 dark:bg-gray-800" />
            )}
            ListEmptyComponent={
              <View className="items-center justify-center py-8">
                <Ionicons
                  name="alert-circle-outline"
                  size={32}
                  color="#9CA3AF"
                />
                <Text className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                  No categories matching &quot;{query}&quot;
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const isSelected = item.value === value;
              return (
                <Pressable
                  onPress={() => {
                    onChange(item.value);
                    setVisible(false);
                    setQuery("");
                  }}
                  className={`flex-row items-center justify-between rounded-xl px-3 py-3.5 active:bg-gray-100 dark:active:bg-gray-800 ${
                    isSelected ? "bg-primary/5 dark:bg-primary/10" : ""
                  }`}
                >
                  <View className="flex-1 pr-2">
                    <Text
                      className={`text-base ${
                        isSelected
                          ? "font-semibold text-primary"
                          : "text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {item.label}
                    </Text>
                    {item.helper ? (
                      <Text className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                        {item.helper}
                      </Text>
                    ) : null}
                  </View>

                  {isSelected ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={COLORS.primary}
                    />
                  ) : (
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#D1D5DB"
                    />
                  )}
                </Pressable>
              );
            }}
          />
        </View>
      </Modal>
    </View>
  );
}
