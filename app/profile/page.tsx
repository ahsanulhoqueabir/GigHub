"use client";

import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import { ProfileInfoCard } from "@/components/profile/profile-info-card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/auth.store";
import { useProfileStore } from "@/store/profile.store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const { profile, isLoading, fetchProfile } = useProfileStore();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!accessToken) {
      router.replace("/login");
      return;
    }

    fetchProfile();
  }, [accessToken, fetchProfile, router]);

  // Show nothing while checking auth
  if (!accessToken) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and account settings
        </p>
      </div>

      <Separator />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="edit">Edit Profile</TabsTrigger>
          <TabsTrigger value="password">Change Password</TabsTrigger>
        </TabsList>

        {/* ── Overview Tab ─────────────────────────────────────────── */}
        <TabsContent value="overview">
          <ProfileInfoCard profile={profile} isLoading={isLoading} />
        </TabsContent>

        {/* ── Edit Profile Tab ─────────────────────────────────────── */}
        <TabsContent value="edit">
          {profile ? (
            <ProfileEditForm
              profile={profile}
              onSuccess={() => fetchProfile()}
            />
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Loading profile...
            </p>
          )}
        </TabsContent>

        {/* ── Change Password Tab ──────────────────────────────────── */}
        <TabsContent value="password">
          <ChangePasswordForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
