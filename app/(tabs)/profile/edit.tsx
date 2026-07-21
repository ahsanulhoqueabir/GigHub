import { Avatar } from "@/components/ui/Avatar";
import { Chip } from "@/components/ui/Chip";
import { Header } from "@/components/ui/Header";
import { Input } from "@/components/ui/Input";
import { COLORS } from "@/constants/colors";
import { getErrorMessage } from "@/lib/api/api-response";
import { pickAndUploadImage } from "@/lib/upload";
import { useAuthStore } from "@/store/auth.store";
import { useProfileStore } from "@/store/profile.store";
import { toast } from "@/store/toast.store";
import type { Socials } from "@/types/db/profile.types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SOCIAL_FIELDS: {

  key: "github" | "linkedin" | "twitter" | "facebook" | "instagram";
  label: string;
}[] = [
  { key: "github", label: "GitHub" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "twitter", label: "Twitter / X" },
  { key: "facebook", label: "Facebook" },
  { key: "instagram", label: "Instagram" },
];

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);

  const profile = useProfileStore((s) => s.profile);
  const isLoading = useProfileStore((s) => s.isLoading);
  const isUpdating = useProfileStore((s) => s.isUpdating);
  const fetchProfile = useProfileStore((s) => s.fetchProfile);
  const updateProfile = useProfileStore((s) => s.updateProfile);

  const isInitialized = useRef(false);

  const [avatar, setAvatar] = useState<string | null | undefined>(
    profile?.avatar ?? user?.avatar,
  );
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [name, setName] = useState(profile?.name ?? user?.name ?? "");
  const [username, setUsername] = useState(profile?.username ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [website, setWebsite] = useState(profile?.website ?? "");
  const [portfolio, setPortfolio] = useState(profile?.portfolio ?? "");

  const [skills, setSkills] = useState<string[]>(profile?.skills ?? []);
  const [skillInput, setSkillInput] = useState("");

  const [socials, setSocials] = useState<Socials>(profile?.socials ?? {});

  // Fetch latest profile on screen mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Sync state ONLY ONCE when profile or user details become available
  useEffect(() => {
    if ((!profile && !user) || isInitialized.current) return;

    setAvatar(profile?.avatar ?? user?.avatar);
    setName(profile?.name ?? user?.name ?? "");
    setUsername(profile?.username ?? "");
    setPhone(profile?.phone ?? "");
    setBio(profile?.bio ?? "");
    setWebsite(profile?.website ?? "");
    setPortfolio(profile?.portfolio ?? "");
    setSkills(profile?.skills ?? []);
    setSocials(profile?.socials ?? {});
    isInitialized.current = true;
  }, [profile, user]);

  const handlePickAvatar = async () => {
    try {
      setIsUploadingAvatar(true);
      const url = await pickAndUploadImage("avatars");
      if (url) setAvatar(url);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value || skills.includes(value)) {
      setSkillInput("");
      return;
    }
    setSkills((prev) => [...prev, value]);
    setSkillInput("");
  };

  const removeSkill = (skill: string) =>
    setSkills((prev) => prev.filter((s) => s !== skill));

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }

    try {
      await updateProfile({
        name: name.trim(),
        username: username.trim(),
        phone: phone.trim() || null,
        bio: bio.trim() || null,
        avatar: avatar || null,
        website: website.trim() || null,
        portfolio: portfolio.trim() || null,
        skills,
        socials,
      });
      toast.success("Profile updated");
      router.back();
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
        title="Edit Profile"
        showBack
        right={
          <Pressable hitSlop={8} onPress={handleSave} disabled={isUpdating}>
            <Text
              className={`text-base font-semibold ${isUpdating ? "text-gray-400" : "text-primary"}`}
            >
              {isUpdating ? "Saving…" : "Save"}
            </Text>
          </Pressable>
        }
      />

      {isLoading && !profile ? (
        <View className="flex-1 items-center justify-center p-6">
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Loading profile details…
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingBottom: Math.max(insets.bottom + 24, 32),
          }}
          contentContainerClassName="px-6 pt-6"
          keyboardShouldPersistTaps="handled"
        >

          <View className="items-center">
            <Pressable
              onPress={handlePickAvatar}
              disabled={isUploadingAvatar}
              className="relative"
            >
              <Avatar uri={avatar} name={name} size="xl" />
              <View className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary dark:border-gray-950">
                <Ionicons
                  name={isUploadingAvatar ? "hourglass-outline" : "camera"}
                  size={16}
                  color="#fff"
                />
              </View>
            </Pressable>
            <Text className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Tap to change photo
            </Text>
          </View>

          <View className="mt-6 gap-4">
            <Input
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="Your name"
            />
            <Input
              label="Username"
              value={username}
              onChangeText={setUsername}
              placeholder="username"
              autoCapitalize="none"
            />
            <Input
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              placeholder="+880…"
              keyboardType="phone-pad"
            />
            <Input
              label="Bio"
              value={bio}
              onChangeText={setBio}
              placeholder="Tell people about yourself"
              multiline
              numberOfLines={4}
              className="min-h-24 py-3"
              textAlignVertical="top"
            />

            <View>
              <Text className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                Skills
              </Text>
              {skills.length > 0 ? (
                <View className="mb-2 flex-row flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Chip
                      key={skill}
                      label={skill}
                      onRemove={() => removeSkill(skill)}
                    />
                  ))}
                </View>
              ) : null}
              <Input
                value={skillInput}
                onChangeText={setSkillInput}
                placeholder="Type a skill and press enter"
                onSubmitEditing={addSkill}
                returnKeyType="done"
              />
            </View>

            <Input
              label="Website"
              value={website}
              onChangeText={setWebsite}
              placeholder="https://…"
              autoCapitalize="none"
              keyboardType="url"
            />
            <Input
              label="Portfolio"
              value={portfolio}
              onChangeText={setPortfolio}
              placeholder="https://…"
              autoCapitalize="none"
              keyboardType="url"
            />

            <Text className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
              Social Links
            </Text>
            {SOCIAL_FIELDS.map(({ key, label }) => (
              <Input
                key={key}
                label={label}
                value={socials[key] ?? ""}
                onChangeText={(text) =>
                  setSocials((prev) => ({ ...prev, [key]: text }))
                }
                placeholder={`https://${key}.com/username`}
                autoCapitalize="none"
              />
            ))}
          </View>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}
