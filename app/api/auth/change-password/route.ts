import { fail, ok, parseBody } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from "@/lib/validations/own-profile.schema";
import { ProfileService } from "@/services/profile.service";
import { NextRequest } from "next/server";

/**
 * PATCH /api/auth/change-password
 *
 * Protected route — changes the authenticated user's password.
 * Requires currentPassword + newPassword + confirmPassword in the body.
 */
export const PATCH = withAuth({
  handler: async ({ user, req }) => {
    const parsed = await parseBody(
      req as unknown as NextRequest,
      changePasswordSchema,
    );
    if (parsed instanceof Response) return parsed;

    const body = parsed as ChangePasswordInput;
    const result = await ProfileService.changePassword(user.profile, {
      currentPassword: body.currentPassword,
      newPassword: body.newPassword,
    });

    if (!result.success) {
      return fail({ error: result.error, statusCode: 400 });
    }

    return ok({ message: "Password changed successfully" });
  },
});
