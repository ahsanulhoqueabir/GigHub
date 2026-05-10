import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { R2Service } from "@/services/r2.service";
import type { JwtPayload } from "@/types/business/user.types";

/**
 * POST /api/upload/image?folder=:folder - Upload an image to R2
 */
export const POST = withAuth(
  async (req: NextRequest, _jwtPayload: JwtPayload) => {
    try {
      const { searchParams } = new URL(req.url);
      const folder = searchParams.get("folder") || "uploads";

      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return fail({ error: "No file provided" });
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      const result = await R2Service.uploadObject({
        body: buffer,
        fileName: file.name,
        folder,
        contentType: file.type || "image/webp",
      });

      if (!result.success) {
        return fail({
          error: result.error || "Failed to upload image",
          statusCode: 500,
        });
      }

      return ok({
        data: {
          url: result.publicUrl,
          key: result.key,
        },
      });
    } catch (err) {
      return fail({
        error: (err as Error).message || "An unknown error occurred",
        statusCode: 500,
      });
    }
  },
);
