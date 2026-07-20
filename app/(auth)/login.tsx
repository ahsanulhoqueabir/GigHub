import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "@/store/toast.store";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function LoginScreen() {
  const login = useAuthStore((s) => s.login);
  const isProcessing = useAuthStore((s) => s.isProcessing);

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    emailOrUsername?: string;
    password?: string;
  }>({});

  const validate = () => {
    const newErrors: { emailOrUsername?: string; password?: string } = {};
    if (!emailOrUsername.trim()) {
      newErrors.emailOrUsername = "Email or username is required";
    }
    if (!password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      await login({ emailOrUsername: emailOrUsername.trim(), password });
      router.replace("/(tabs)");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    }
  };

  const handleForgotPassword = () => {
    toast.show("Password reset support is coming soon!");
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-slate-50 dark:bg-gray-950"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-5 py-8"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Background Accent Gradients / Blobs */}
        <View className="absolute top-10 -left-16 w-56 h-56 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl" />
        <View className="absolute bottom-12 -right-16 w-56 h-56 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-3xl" />

        {/* Branding & Logo Header */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 items-center justify-center shadow-lg shadow-indigo-500/10 dark:shadow-none mb-4">
            <Image
              source={require("@/assets/logo.png")}
              style={{ width: 48, height: 48 }}
              contentFit="contain"
            />
          </View>

          <View className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 mb-2">
            <Text className="text-xs font-semibold text-primary dark:text-indigo-400">
              Campus Gig & Freelance Hub
            </Text>
          </View>

          <Text className="text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight text-center">
            Welcome Back
          </Text>
          <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400 text-center px-4">
            Sign in to access your gigs, projects, and messages
          </Text>
        </View>

        {/* Form Card Container */}
        <View className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-none mb-6">
          <View className="gap-5">
            <Input
              label="Email or Username"
              value={emailOrUsername}
              onChangeText={(text) => {
                setEmailOrUsername(text);
                if (errors.emailOrUsername)
                  setErrors((e) => ({ ...e, emailOrUsername: undefined }));
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="you@gighub.com"
              leftIcon={
                <Ionicons name="person-outline" size={20} color="#9CA3AF" />
              }
              error={errors.emailOrUsername}
            />

            <View>
              <Input
                label="Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password)
                    setErrors((e) => ({ ...e, password: undefined }));
                }}
                secureTextEntry
                placeholder="••••••••"
                leftIcon={
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#9CA3AF"
                  />
                }
                error={errors.password}
              />

              <View className="flex-row justify-end mt-2">
                <Pressable onPress={handleForgotPassword} hitSlop={8}>
                  <Text className="text-xs font-semibold text-primary dark:text-indigo-400">
                    Forgot Password?
                  </Text>
                </Pressable>
              </View>
            </View>

            <Button
              onPress={handleLogin}
              isLoading={isProcessing}
              fullWidth
              size="lg"
              className="mt-2 shadow-md shadow-indigo-500/20"
            >
              Log In
            </Button>
          </View>
        </View>

        {/* Footer Navigation Link */}
        <View className="flex-row justify-center items-center py-3 bg-white/60 dark:bg-gray-900/60 border border-gray-200/50 dark:border-gray-800/60 rounded-2xl">
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            Don&apos;t have an account?{" "}
          </Text>
          <Link href="/(auth)/signup" asChild>
            <Pressable hitSlop={8}>
              <Text className="text-sm font-bold text-primary dark:text-indigo-400">
                Sign up
              </Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
