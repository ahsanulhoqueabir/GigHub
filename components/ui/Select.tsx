import { Modal } from "@/components/ui/Modal";
import { COLORS } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";

export interface SelectOption {
  label: string;
  value: string;
  helper?: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  value?: string | null;
  options: SelectOption[];
  onChange: (value: string) => void;
  error?: string | null;
  searchable?: boolean;
  isLoading?: boolean;
}

/**
 * Tap-to-open bottom-sheet picker built on the shared Modal component.
 * Used for single-select fields like Department.
 */
export function Select({
  label,
  placeholder = "Select an option",
  value,
  options,
  onChange,
  error,
  searchable = false,
  isLoading = false,
}: SelectProps) {
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState("");

  const selected = options.find((o) => o.value === value);
  const filtered = searchable
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
        <Text
          className={`text-base ${selected ? "text-gray-900 dark:text-gray-100" : "text-gray-400 dark:text-gray-500"}`}
        >
          {isLoading ? "Loading…" : (selected?.label ?? placeholder)}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
      </Pressable>

      {error ? (
        <Text className="mt-1 text-xs text-red-500">{error}</Text>
      ) : null}

      <Modal
        visible={visible}
        onClose={() => setVisible(false)}
        title={label ?? "Select"}
      >
        {searchable ? (
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search…"
            placeholderTextColor="#9CA3AF"
            className="mb-3 rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />
        ) : null}

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.value}
          style={{ maxHeight: 360 }}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => (
            <View className="h-px bg-gray-100 dark:bg-gray-800" />
          )}
          ListEmptyComponent={
            <Text className="py-6 text-center text-gray-400 dark:text-gray-500">
              No options found
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                onChange(item.value);
                setVisible(false);
                setQuery("");
              }}
              className="flex-row items-center justify-between py-3.5 active:opacity-60"
            >
              <View>
                <Text className="text-base text-gray-900 dark:text-gray-100">
                  {item.label}
                </Text>
                {item.helper ? (
                  <Text className="text-xs text-gray-400 dark:text-gray-500">
                    {item.helper}
                  </Text>
                ) : null}
              </View>
              {item.value === value ? (
                <Ionicons name="checkmark" size={20} color={COLORS.primary} />
              ) : null}
            </Pressable>
          )}
        />
      </Modal>
    </View>
  );
}
