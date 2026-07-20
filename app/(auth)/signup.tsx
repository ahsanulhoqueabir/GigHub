import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";
import { Input } from "@/components/ui/Input";
import { Select, type SelectOption } from "@/components/ui/Select";
import { apiPublic } from "@/lib/api/api-public";
import { getErrorMessage } from "@/lib/api/api-response";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "@/store/toast.store";
import { Link, router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

interface DepartmentOption {
  id: string;
  name: string;
  acronym: string | null;
}

const STEPS = ["Account", "Campus Details"] as const;

export default function SignUpScreen() {
  const signUp = useAuthStore((s) => s.signUp);
  const isProcessing = useAuthStore((s) => s.isProcessing);

  const [step, setStep] = useState(0);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");

  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    setIsLoadingDepartments(true);
    apiPublic
      .get("/department", { params: { limit: 100 } })
      .then(({ data }) => {
        if (cancelled) return;
        setDepartments(data.data?.items ?? []);
      })
      .catch(() => {
        if (!cancelled) toast.error("Couldn't load departments");
      })
      .finally(() => !cancelled && setIsLoadingDepartments(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const departmentOptions: SelectOption[] = useMemo(
    () =>
      departments.map((d) => ({
        value: d.id,
        label: d.name,
        helper: d.acronym ?? undefined,
      })),
    [departments],
  );

  const validateStepOne = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Name is required";
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email";
    if (password.length < 6)
      next.password = "Password must be at least 6 characters";
    if (confirmPassword !== password)
      next.confirmPassword = "Passwords do not match";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStepTwo = () => {
    const next: Record<string, string> = {};
    if (!studentId.trim()) next.studentId = "Student ID is required";
    if (!department) next.department = "Select your department";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (!validateStepOne()) return;
    setErrors({});
    setStep(1);
  };

  const handleSubmit = async () => {
    if (!validateStepTwo()) return;

    try {
      await signUp({
        name,
        email,
        password,
        student_id: studentId,
        department,
      });
      router.replace("/(tabs)");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white dark:bg-gray-950"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Header
        title="Sign Up"
        showBack
        onBackPress={() => (step === 1 ? setStep(0) : router.back())}
        hideAuthControls
      />

      {/* Progress indicator */}
      <View className="flex-row gap-2 px-6 pt-4">
        {STEPS.map((label, i) => (
          <View key={label} className="flex-1">
            <View
              className={`h-1.5 rounded-full ${i <= step ? "bg-primary" : "bg-gray-200 dark:bg-gray-800"}`}
            />
            <Text
              className={`mt-1.5 text-xs font-medium ${i === step ? "text-primary" : "text-gray-400 dark:text-gray-500"}`}
            >
              {label}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView
        contentContainerClassName="px-6 pb-10 pt-6"
        keyboardShouldPersistTaps="handled"
      >
        {step === 0 ? (
          <>
            <Text className="mb-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
              Create your account
            </Text>
            <Text className="mb-6 text-base text-gray-500 dark:text-gray-400">
              Join GigHub to hire and get hired on campus.
            </Text>

            <View className="gap-4">
              <Input
                label="Full Name"
                value={name}
                onChangeText={setName}
                placeholder="Ahsanul Hoque"
                autoCapitalize="words"
                error={errors.name}
              />
              <Input
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                placeholder="you@gighub.com"
                autoCapitalize="none"
                keyboardType="email-address"
                error={errors.email}
              />
              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Min. 6 characters"
                secureTextEntry
                error={errors.password}
              />
              <Input
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter your password"
                secureTextEntry
                error={errors.confirmPassword}
              />

              <Button onPress={handleNext} className="mt-2">
                Continue
              </Button>
            </View>
          </>
        ) : (
          <>
            <Text className="mb-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
              Campus details
            </Text>
            <Text className="mb-6 text-base text-gray-500 dark:text-gray-400">
              Tell us which campus you belong to.
            </Text>

            <View className="gap-4">
              <Input
                label="Student ID"
                value={studentId}
                onChangeText={setStudentId}
                placeholder="B210305040"
                autoCapitalize="characters"
                error={errors.studentId}
              />
              <Select
                label="Department"
                placeholder="Search or select department"
                value={department}
                onChange={setDepartment}
                options={departmentOptions}
                isLoading={isLoadingDepartments}
                searchable
                error={errors.department}
              />

              <View className="mt-2 flex-row gap-3">
                <Button
                  variant="outline"
                  onPress={() => setStep(0)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onPress={handleSubmit}
                  isLoading={isProcessing}
                  className="flex-1"
                >
                  Create Account
                </Button>
              </View>
            </View>
          </>
        )}

        <View className="mt-6 flex-row justify-center">
          <Text className="text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
          </Text>
          <Link href="/(auth)/login" asChild>
            <Pressable>
              <Text className="font-semibold text-primary">Log in</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
