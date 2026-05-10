import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import {
  ProfileService,
  type UpdateProfileParams,
} from "@/services/profile.service";
import { R2Service } from "@/services/r2.service";
import type { JwtPayload } from "@/types/business/user.types";

/**
 * GET /api/profiles/me - Get authenticated user's profile
 */
export const GET = withAuth(
  async (_req: NextRequest, jwtPayload: JwtPayload) => {
    try {
      const result = await ProfileService.getById(jwtPayload.profile);

      if (!result.success) {
        return fail({ error: result.error, statusCode: 404 });
      }

      return ok({ data: result.data });
    } catch (err) {
      return fail({
        error: (err as Error).message || "An unknown error occurred",
        statusCode: 500,
      });
    }
  },
);

/**
 * PATCH /api/profiles/me - Update authenticated user's profile
 * Supports types: basic_info, avatar, and general update (no type)
 */
export const PATCH = withAuth(
  async (req: NextRequest, jwtPayload: JwtPayload) => {
    try {
      const body = await req.json();
      const { type } = body;

      if (type === "basic_info") {
        const { display_name, bio, skills } = body;

        if (skills !== undefined && !Array.isArray(skills)) {
          return fail({ error: "skills must be an array" });
        }

        const updateParams: UpdateProfileParams = {};
        if (display_name !== undefined) updateParams.name = display_name;
        if (bio !== undefined) updateParams.bio = bio;
        if (skills !== undefined) updateParams.skills = skills;

        const result = await ProfileService.update(
          jwtPayload.profile,
          updateParams,
        );

        if (!result.success) {
          return fail({ error: result.error, statusCode: 400 });
        }

        return ok({ data: result.data });
      }

      if (type === "avatar") {
        const { avatar_base64 } = body;

        if (!avatar_base64) {
          return fail({ error: "avatar_base64 is required" });
        }

        // Decode base64 and upload to R2
        const matches = avatar_base64.match(/^data:image\/(\w+);base64,(.+)$/);
        if (!matches) {
          return fail({ error: "Invalid base64 image format" });
        }

        const ext = matches[1] === "png" ? "png" : "jpg";
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, "base64");

        const uploadResult = await R2Service.uploadObject({
          body: buffer,
          fileName: `avatar.${ext}`,
          folder: `profile/${jwtPayload.profile}`,
          contentType: `image/${ext}`,
        });

        if (!uploadResult.success) {
          return fail({
            error: uploadResult.error || "Failed to upload avatar",
            statusCode: 500,
          });
        }

        const avatarUrl = uploadResult.publicUrl;

        const result = await ProfileService.update(jwtPayload.profile, {
          avatar: avatarUrl,
        });

        if (!result.success) {
          return fail({ error: result.error, statusCode: 400 });
        }

        return ok({ data: result.data });
      }

      // General update (no type specified)
      const { bio, skills, country } = body;

      if (skills !== undefined && !Array.isArray(skills)) {
        return fail({ error: "skills must be an array" });
      }

      const updateParams: UpdateProfileParams = {};
      if (bio !== undefined) updateParams.bio = bio;
      if (skills !== undefined) updateParams.skills = skills;
      // country is not a direct field on profiles, skip if needed

      const result = await ProfileService.update(
        jwtPayload.profile,
        updateParams,
      );

      if (!result.success) {
        return fail({ error: result.error, statusCode: 400 });
      }

      return ok({ data: result.data });
    } catch (err) {
      return fail({
        error: (err as Error).message || "An unknown error occurred",
        statusCode: 500,
      });
    }
  },
);
