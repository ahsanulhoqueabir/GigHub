"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { SafeProfile } from "@/lib/api/strip-password";
import {
  IconBrandFacebook,
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandTwitter,
  IconId,
  IconMail,
  IconPhone,
  IconSchool,
  IconUser,
  IconWorld,
} from "@tabler/icons-react";

interface ProfileInfoCardProps {
  profile: SafeProfile | null;
  isLoading: boolean;
}

export function ProfileInfoCard({ profile, isLoading }: ProfileInfoCardProps) {
  if (isLoading) {
    return <ProfileInfoCardSkeleton />;
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Profile not found.
        </CardContent>
      </Card>
    );
  }

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const departmentName =
    typeof profile.department === "object" && profile.department !== null
      ? ((profile.department as { name?: string }).name ?? "—")
      : (profile.department ?? "—");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={profile.avatar ?? undefined} alt={profile.name} />
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-xl">{profile.name}</CardTitle>
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
        </div>
        <Badge variant={profile.role === "ADMIN" ? "default" : "secondary"}>
          {profile.role}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <InfoRow
          icon={<IconMail className="h-4 w-4" />}
          label="Email"
          value={profile.email}
        />
        <InfoRow
          icon={<IconUser className="h-4 w-4" />}
          label="Username"
          value={profile.username}
        />
        <InfoRow
          icon={<IconId className="h-4 w-4" />}
          label="Student ID"
          value={profile.student_id ?? "—"}
        />
        <InfoRow
          icon={<IconSchool className="h-4 w-4" />}
          label="Department"
          value={departmentName}
        />
        <InfoRow
          icon={<IconPhone className="h-4 w-4" />}
          label="Phone"
          value={profile.phone ?? "—"}
        />
        <InfoRow
          icon={<IconWorld className="h-4 w-4" />}
          label="Website"
          value={profile.website ?? "—"}
        />
        {profile.bio && (
          <div className="pt-2">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Bio
            </p>
            <p className="text-sm">{profile.bio}</p>
          </div>
        )}

        {/* ── Skills ─────────────────────────────────────── */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="pt-2">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* ── Socials ────────────────────────────────────── */}
        {profile.socials && hasAnySocial(profile.socials) && (
          <div className="pt-2">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Social Links
            </p>
            <div className="space-y-1.5">
              {profile.socials.github && (
                <SocialRow
                  icon={<IconBrandGithub className="h-4 w-4" />}
                  label="GitHub"
                  value={profile.socials.github}
                />
              )}
              {profile.socials.linkedin && (
                <SocialRow
                  icon={<IconBrandLinkedin className="h-4 w-4" />}
                  label="LinkedIn"
                  value={profile.socials.linkedin}
                />
              )}
              {profile.socials.twitter && (
                <SocialRow
                  icon={<IconBrandTwitter className="h-4 w-4" />}
                  label="Twitter"
                  value={profile.socials.twitter}
                />
              )}
              {profile.socials.facebook && (
                <SocialRow
                  icon={<IconBrandFacebook className="h-4 w-4" />}
                  label="Facebook"
                  value={profile.socials.facebook}
                />
              )}
              {profile.socials.instagram && (
                <SocialRow
                  icon={<IconBrandInstagram className="h-4 w-4" />}
                  label="Instagram"
                  value={profile.socials.instagram}
                />
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <span className="text-muted-foreground min-w-24">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function SocialRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  const href = value.startsWith("http") ? value : `https://${value}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
    >
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <span className="text-muted-foreground min-w-24">{label}</span>
      <span className="font-medium truncate">{value}</span>
    </a>
  );
}

function hasAnySocial(socials: NonNullable<SafeProfile["socials"]>): boolean {
  return !!(
    socials.github ||
    socials.linkedin ||
    socials.twitter ||
    socials.facebook ||
    socials.instagram
  );
}

function ProfileInfoCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}
