import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Pressable, Modal as RNModal, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

/**
 * Bottom-sheet style modal used for filters, proposal forms, and confirmations.
 */
export function Modal({ visible, onClose, title, children }: ModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <Pressable className="flex-1" onPress={onClose} />
        <View
          style={{ paddingBottom: insets.bottom + 16 }}
          className="max-h-[85%] rounded-t-3xl bg-white px-5 pt-4 dark:bg-gray-950"
        >
          <View className="mb-3 h-1 w-10 self-center rounded-full bg-gray-300 dark:bg-gray-700" />

          {title ? (
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </Text>
              <Pressable
                hitSlop={8}
                onPress={onClose}
                className="h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
              >
                <Ionicons name="close" size={18} color="#6B7280" />
              </Pressable>
            </View>
          ) : null}

          {children}
        </View>
      </View>
    </RNModal>
  );
}
