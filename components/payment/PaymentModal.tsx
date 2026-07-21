import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal as RNModal,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView, WebViewNavigation } from "react-native-webview";

interface PaymentModalProps {
  visible: boolean;
  url: string | null;
  onClose: () => void;
  onPaymentComplete?: () => void;
}

export function PaymentModal({
  visible,
  url,
  onClose,
  onPaymentComplete,
}: PaymentModalProps) {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);

  if (!url) return null;

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    const { url: currentUrl } = navState;

    // Detect redirect or completion URLs from SSLCommerz or payment API
    if (
      currentUrl.includes("/payment/success") ||
      currentUrl.includes("/payment/fail") ||
      currentUrl.includes("/payment/cancel") ||
      currentUrl.includes("status=VALID") ||
      currentUrl.includes("status=FAILED") ||
      currentUrl.includes("status=CANCELLED")
    ) {
      if (onPaymentComplete) {
        onPaymentComplete();
      } else {
        onClose();
      }
    }
  };

  const handleReload = () => {
    webViewRef.current?.reload();
  };

  return (
    <RNModal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View
        style={{ paddingTop: Math.max(insets.top, 12) }}
        className="flex-1 bg-white dark:bg-gray-950"
      >
        {/* Header Bar */}
        <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
          <Pressable
            onPress={onClose}
            hitSlop={10}
            className="flex-row items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 dark:bg-gray-800"
          >
            <Ionicons name="close" size={18} color="#4B5563" />
            <Text className="text-xs font-semibold text-gray-700 dark:text-gray-300">Close</Text>
          </Pressable>

          <View className="flex-row items-center gap-1.5">
            <Ionicons name="shield-checkmark" size={18} color="#10B981" />
            <Text className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              SSLCommerz Payment
            </Text>
          </View>

          <Pressable
            onPress={handleReload}
            hitSlop={10}
            className="h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
          >
            <Ionicons name="refresh" size={18} color="#6B7280" />
          </Pressable>
        </View>

        {/* Top Progress / Loading Line */}
        {loading && (
          <View className="h-1 w-full overflow-hidden bg-emerald-100 dark:bg-emerald-950">
            <View className="h-full w-2/3 bg-emerald-500" />
          </View>
        )}

        {/* Embedded In-App WebView */}
        <View className="flex-1">
          <WebView
            ref={webViewRef}
            source={{ uri: url }}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onNavigationStateChange={handleNavigationStateChange}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View className="absolute inset-0 items-center justify-center bg-white dark:bg-gray-950">
                <ActivityIndicator size="large" color="#10b981" />
                <Text className="mt-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Opening secure payment portal...
                </Text>
              </View>
            )}
          />
        </View>
      </View>
    </RNModal>
  );
}
