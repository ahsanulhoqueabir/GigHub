import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/api-response";
import { AuthService } from "@/services/auth.service";
import { ProfileService } from "@/services/profile.service";
import { R2Service } from "@/services/r2.service";
import { signJwt, signRefreshJwt } from "@/lib/jwt.helper";
import type { JwtPayload } from "@/types/business/user.types";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const email = formData.get("email") as string | null;
    const password = formData.get("password") as string | null;
    const name = formData.get("name") as string | null;
    const username = formData.get("username") as string | null;
    const bio = formData.get("bio") as string | null;
    const skillsRaw = formData.get("skills") as string | null;
    const avatarFile = formData.get("avatar") as File | null;

    // Validate required fields
    if (!email || !password || !name) {
      return fail({ error: "Email, password, and name are required" });
    }

    // Parse skills from JSON string if provided
    let skills: string[] | undefined;
    if (skillsRaw) {
      try {
        skills = JSON.parse(skillsRaw);
      } catch {
        return fail({ error: "Invalid skills format. Expected a JSON array." });
      }
    }

    // Step 1: Create the user in Supabase Auth
    const authResult = await AuthService.signUp(email, password);

    if (!authResult.success) {
      return fail({ error: authResult.error });
    }

    const authUserId = authResult.data.user.id;

    // Step 2: Upload avatar to R2 if provided
    let avatarUrl: string | undefined;

    if (avatarFile && avatarFile.size > 0) {
      const buffer = Buffer.from(await avatarFile.arrayBuffer());

      const uploadResult = await R2Service.uploadObject({
        body: buffer,
        fileName: avatarFile.name,
        folder: `profile/${authUserId}`,
        contentType: avatarFile.type || "image/webp",
      });

      if (!uploadResult.success) {
        // Clean up auth user
        await AuthService.deleteUser(authUserId);
        return fail({ error: uploadResult.error || "Failed to upload avatar" });
      }

      avatarUrl = uploadResult.publicUrl;
    }

    // Step 3: Create the profile linked to the auth user
    const profileResult = await ProfileService.create({
      user: authUserId,
      email,
      name,
      username: username || undefined,
      bio: bio || undefined,
      skills,
      avatar: avatarUrl,
    });

    if (!profileResult.success) {
      // Profile creation failed — clean up the auth user
      await AuthService.deleteUser(authUserId);

      return fail({
        error: profileResult.error,
        statusCode: 500,
      });
    }

    const { data: profile } = profileResult;
    const jwtPayload: JwtPayload = {
      profile: profile.id,
      email: profile.email,
      role: profile.role,
    };

    const token = await signJwt(jwtPayload);
    const refreshToken = await signRefreshJwt(jwtPayload);

    return ok({
      data: {
        user: profile,
        access_token: token,
        refresh_token: refreshToken,
        expires_in: "15m",
      },
      message: "User created successfully",
      statusCode: 201,
    });
  } catch (err) {
    return fail({
      error: (err as Error).message || "An unknown error occurred",
      statusCode: 500,
    });
  }
}
