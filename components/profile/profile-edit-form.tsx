"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUsernameCheck } from "@/hooks/use-username-check";
import type { SafeProfile } from "@/lib/api/strip-password";
import {
  updateOwnProfileSchema,
  type UpdateOwnProfileInput,
} from "@/lib/validations/own-profile.schema";
import { useDepartmentsStore } from "@/store/departments.store";
import { useProfileStore } from "@/store/profile.store";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface ProfileEditFormProps {
  profile: SafeProfile;
  onSuccess?: () => void;
}

const SOCIAL_LABELS: Record<string, string> = {
  github: "GitHub",
  linkedin: "LinkedIn",
  twitter: "Twitter",
  facebook: "Facebook",
  instagram: "Instagram",
};

export function ProfileEditForm({ profile, onSuccess }: ProfileEditFormProps) {
  const { updateProfile, isUpdating } = useProfileStore();
  const { fetchDepartments } = useDepartmentsStore();
  const {
    status: usernameStatus,
    check: checkUsername,
    reset: resetUsernameCheck,
  } = useUsernameCheck({ currentUsername: profile.username ?? "" });

  const form = useForm<UpdateOwnProfileInput>({
    resolver: zodResolver(updateOwnProfileSchema),
    defaultValues: {
      name: profile.name ?? "",
      username: profile.username ?? "",
      phone: profile.phone ?? "",
      bio: profile.bio ?? "",
      website: profile.website ?? "",
      portfolio: profile.portfolio ?? "",
      skills: profile.skills ?? [],
      socials: profile.socials ?? {},
    },
  });

  // Watch username to reset check status when value matches current
  const watchedUsername = useWatch({ control: form.control, name: "username" });

  useEffect(() => {
    if (watchedUsername === profile.username) {
      resetUsernameCheck();
    }
  }, [watchedUsername, profile.username, resetUsernameCheck]);

  useEffect(() => {
    fetchDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Skills state ─────────────────────────────────────────────────────────
  const [skillInput, setSkillInput] = useState("");
  const skillsValue = useWatch({ control: form.control, name: "skills" }) ?? [];

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (skillsValue.includes(trimmed)) {
      toast.info("Skill already added");
      return;
    }
    form.setValue("skills", [...skillsValue, trimmed]);
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    form.setValue(
      "skills",
      skillsValue.filter((s: unknown) => s !== skill),
    );
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const onSubmit = async (values: UpdateOwnProfileInput) => {
    // Build payload — only send changed fields
    const payload: Record<string, unknown> = {};

    if (values.name !== profile.name) payload.name = values.name;
    if (values.username !== profile.username)
      payload.username = values.username;
    if (values.phone !== (profile.phone ?? ""))
      payload.phone = values.phone || null;
    if (values.bio !== (profile.bio ?? "")) payload.bio = values.bio || null;
    if (values.website !== (profile.website ?? ""))
      payload.website = values.website || null;
    if (values.portfolio !== (profile.portfolio ?? ""))
      payload.portfolio = values.portfolio || null;

    // Skills
    const currentSkills = profile.skills ?? [];
    if (JSON.stringify(values.skills) !== JSON.stringify(currentSkills)) {
      payload.skills = values.skills;
    }

    // Socials
    const currentSocials = profile.socials ?? {};
    if (JSON.stringify(values.socials) !== JSON.stringify(currentSocials)) {
      payload.socials = values.socials;
    }

    if (Object.keys(payload).length === 0) {
      toast.info("No changes to save");
      return;
    }

    try {
      await updateProfile(payload);
      toast.success("Profile updated successfully");
      onSuccess?.();
    } catch {
      toast.error("Failed to update profile");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Username */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            checkUsername(e.target.value);
                          }}
                        />
                        {/* Username availability indicator */}
                        {usernameStatus.type === "checking" && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            <span className="inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          </span>
                        )}
                        {usernameStatus.type === "available" && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-green-600">
                            ✓ Available
                          </span>
                        )}
                        {usernameStatus.type === "taken" && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-destructive">
                            ✕ {usernameStatus.message}
                          </span>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Website */}
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="https://"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Portfolio */}
            <FormField
              control={form.control}
              name="portfolio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Portfolio</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="https://"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bio */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      rows={4}
                      placeholder="Tell us about yourself..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── Skills ──────────────────────────────────────────── */}
            <FormField
              control={form.control}
              name="skills"
              render={() => (
                <FormItem>
                  <FormLabel>Skills</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {/* Existing skills as badges */}
                      {skillsValue.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {skillsValue.map((skill: string) => (
                            <Badge
                              key={skill}
                              variant="secondary"
                              className="gap-1 pr-1"
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => removeSkill(skill)}
                                className="ml-0.5 rounded-full p-0.5 hover:bg-muted transition-colors"
                                aria-label={`Remove ${skill}`}
                              >
                                <IconX className="size-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                      {/* Add skill input */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type a skill and press Enter..."
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={handleSkillKeyDown}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addSkill}
                          className="shrink-0"
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── Social Media Links ──────────────────────────────── */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Social Media Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(SOCIAL_LABELS).map(([key, label]) => (
                  <FormField
                    key={key}
                    control={form.control}
                    name={`socials.${String(key)}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            placeholder={`${label} URL`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
