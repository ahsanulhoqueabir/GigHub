"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  IconUser,
  IconMail,
  IconStar,
  IconClock,
  IconShieldLock,
  IconCamera,
  IconCheck,
  IconX,
  IconEdit,
  IconLogout,
  IconLoader2,
} from "@tabler/icons-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useAuthStore, selectIsAuthenticated } from "@/store/auth.store";
import {
  selectProfile,
  selectProfileAvatarUploading,
  selectProfileChangingPassword,
  selectProfileError,
  selectProfileLoading,
  selectProfilePasswordError,
  selectProfilePasswordSuccess,
  selectProfileSaveSuccess,
  selectProfileSaving,
  useProfileStore,
} from "@/store/profile.store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  profileSchema,
  passwordSchema,
  type ProfileFormValues,
  type PasswordFormValues,
} from "@/schema/profile.zod";

// ─── Types ─────────────────────────────────────────────────────────────────

type ProfileTab = "overview" | "edit" | "password";

// ─── Page ──────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const isProcessing = useAuthStore((s) => s.isProcessing);
  const hasToken = useAuthStore(
    (s) => s.accessToken !== null || s.refreshToken !== null,
  );
  const logout = useAuthStore((s) => s.logout);

  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");

  // Edit form state
  const [skillInput, setSkillInput] = useState("");

  const profile = useProfileStore(selectProfile);
  const loading = useProfileStore(selectProfileLoading);
  const saving = useProfileStore(selectProfileSaving);
  const avatarUploading = useProfileStore(selectProfileAvatarUploading);
  const changingPassword = useProfileStore(selectProfileChangingPassword);
  const error = useProfileStore(selectProfileError);
  const passwordServerError = useProfileStore(selectProfilePasswordError);
  const saveSuccess = useProfileStore(selectProfileSaveSuccess);
  const passwordSuccess = useProfileStore(selectProfilePasswordSuccess);
  const fetchProfile = useProfileStore((s) => s.fetchProfile);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const changePassword = useProfileStore((s) => s.changePassword);
  const uploadAvatar = useProfileStore((s) => s.uploadAvatar);
  const clearSaveSuccess = useProfileStore((s) => s.clearSaveSuccess);
  const clearPasswordSuccess = useProfileStore((s) => s.clearPasswordSuccess);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      bio: "",
      skills: [],
    },
    mode: "onTouched",
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  const profileSkills =
    useWatch({ control: profileForm.control, name: "skills" }) || [];

  // ── Fetch profile ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!hasHydrated || isProcessing) {
      return;
    }

    if (!isAuthenticated && !hasToken) {
      router.push("/login");
      return;
    }

    fetchProfile();
  }, [
    hasHydrated,
    isProcessing,
    isAuthenticated,
    hasToken,
    router,
    fetchProfile,
  ]);

  useEffect(() => {
    if (!profile) return;

    profileForm.reset({
      name: profile.name || "",
      bio: profile.bio || "",
      skills: profile.skills || [],
    });
  }, [profile, profileForm]);

  useEffect(() => {
    if (!saveSuccess) return;
    const timer = setTimeout(() => clearSaveSuccess(), 3000);
    return () => clearTimeout(timer);
  }, [saveSuccess, clearSaveSuccess]);

  useEffect(() => {
    if (!passwordSuccess) return;
    const timer = setTimeout(() => clearPasswordSuccess(), 3000);
    return () => clearTimeout(timer);
  }, [passwordSuccess, clearPasswordSuccess]);

  useEffect(() => {
    if (passwordSuccess) {
      passwordForm.reset();
    }
  }, [passwordSuccess, passwordForm]);

  // ── Save profile info ────────────────────────────────────────────────────
  const handleSaveProfile = async (values: ProfileFormValues) => {
    await updateProfile(values);
  };

  // ── Change password ──────────────────────────────────────────────────────
  const handleChangePassword = async (values: PasswordFormValues) => {
    await changePassword(values);
  };

  // ── Avatar upload ────────────────────────────────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadAvatar(file);
  };

  // ── Add/remove skills ────────────────────────────────────────────────────
  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !profileSkills.includes(s)) {
      profileForm.setValue("skills", [...profileSkills, s], {
        shouldValidate: true,
      });
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    profileForm.setValue(
      "skills",
      profileSkills.filter((s) => s !== skill),
      { shouldValidate: true },
    );
  };

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <IconLoader2 size={32} className="animate-spin" />
          <p className="text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <div className="text-center">
          <p className="text-destructive font-medium">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.refresh()}
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="relative group">
            <div className="size-24 rounded-full bg-muted overflow-hidden ring-4 ring-border">
              {profile.avatar ? (
                <Image
                  src={profile.avatar}
                  alt={profile.name}
                  className="size-full object-cover"
                  width={96}
                  height={96}
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-primary/10 text-primary text-3xl font-semibold">
                  {profile.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
              aria-label="Change avatar"
            >
              {avatarUploading ? (
                <IconLoader2 size={14} className="animate-spin" />
              ) : (
                <IconCamera size={14} />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight truncate">
              {profile.name}
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              @{profile.username || "username"}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <IconMail size={14} />
                {profile.email}
              </span>
              {profile.avg_rating > 0 && (
                <span className="flex items-center gap-1">
                  <IconStar size={14} className="text-amber-500" />
                  {profile.avg_rating.toFixed(1)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <IconClock size={14} />
                Joined {new Date(profile.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Logout button */}
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="shrink-0"
          >
            <IconLogout size={14} />
            Sign out
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-6">
        {(
          [
            { key: "overview", label: "Overview", icon: IconUser },
            { key: "edit", label: "Edit Profile", icon: IconEdit },
            { key: "password", label: "Password", icon: IconShieldLock },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as ProfileTab)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors text-nowrap",
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Overview Tab ───────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Bio */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Bio
            </h2>
            {profile.bio ? (
              <p className="text-foreground">{profile.bio}</p>
            ) : (
              <p className="text-muted-foreground italic">No bio added yet.</p>
            )}
          </div>

          {/* Skills */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Skills
            </h2>
            {profile.skills && profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground italic">
                No skills added yet.
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: "Total Earnings",
                value: `$${profile.total_earnings || 0}`,
              },
              { label: "Rating", value: profile.avg_rating?.toFixed(1) || "—" },
              { label: "Reviews", value: profile.total_reviews || 0 },
              { label: "Verified", value: profile.is_verified ? "Yes" : "No" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border bg-card p-4 text-center"
              >
                <p className="text-lg font-semibold text-foreground">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Edit Profile Tab ───────────────────────────────────────────── */}
      {activeTab === "edit" && (
        <form
          onSubmit={profileForm.handleSubmit(handleSaveProfile)}
          className="space-y-6 max-w-2xl"
        >
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Display Name
            </label>
            <input
              type="text"
              {...profileForm.register("name")}
              className="block w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
            {profileForm.formState.errors.name && (
              <p className="mt-1 text-xs text-destructive">
                {profileForm.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Bio
            </label>
            <textarea
              {...profileForm.register("bio")}
              rows={4}
              className="block w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20 resize-y"
              placeholder="Tell others about yourself..."
            />
            {profileForm.formState.errors.bio && (
              <p className="mt-1 text-xs text-destructive">
                {profileForm.formState.errors.bio.message}
              </p>
            )}
          </div>

          {/* Skills */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Skills
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addSkill())
                }
                className="block flex-1 rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
                placeholder="Add a skill and press Enter"
              />
              <Button type="button" variant="outline" onClick={addSkill}>
                Add
              </Button>
            </div>
            {profileSkills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {profileSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <IconX size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {profileForm.formState.errors.skills && (
              <p className="mt-2 text-xs text-destructive">
                {profileForm.formState.errors.skills.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <IconLoader2 size={14} className="animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
            {saveSuccess && (
              <span className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400">
                <IconCheck size={14} />
                Profile updated!
              </span>
            )}
          </div>
        </form>
      )}

      {/* ── Password Tab ───────────────────────────────────────────────── */}
      {activeTab === "password" && (
        <form
          onSubmit={passwordForm.handleSubmit(handleChangePassword)}
          className="space-y-6 max-w-md"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Current Password
            </label>
            <input
              type="password"
              {...passwordForm.register("currentPassword")}
              className="block w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
            {passwordForm.formState.errors.currentPassword && (
              <p className="mt-1 text-xs text-destructive">
                {passwordForm.formState.errors.currentPassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              New Password
            </label>
            <input
              type="password"
              {...passwordForm.register("newPassword")}
              className="block w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
            {passwordForm.formState.errors.newPassword && (
              <p className="mt-1 text-xs text-destructive">
                {passwordForm.formState.errors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Confirm New Password
            </label>
            <input
              type="password"
              {...passwordForm.register("confirmPassword")}
              className="block w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
            {passwordForm.formState.errors.confirmPassword && (
              <p className="mt-1 text-xs text-destructive">
                {passwordForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          {passwordServerError && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <IconX size={14} />
              {passwordServerError}
            </p>
          )}

          {passwordSuccess && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <IconCheck size={14} />
              Password changed successfully!
            </p>
          )}

          <Button type="submit" disabled={changingPassword}>
            {changingPassword ? (
              <>
                <IconLoader2 size={14} className="animate-spin" />
                Changing...
              </>
            ) : (
              "Change Password"
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
