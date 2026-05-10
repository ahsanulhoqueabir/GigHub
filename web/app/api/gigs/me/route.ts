import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { GigService } from "@/services/gig.service";
import type { JwtPayload } from "@/types/business/user.types";

/**
 * GET /api/gigs/me - Get authenticated user's gigs
 */
export const GET = withAuth(
  async (req: NextRequest, jwtPayload: JwtPayload) => {
    try {
      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "10");

      const result = await GigService.listBySeller(
        jwtPayload.profile,
        page,
        limit,
      );

      if (!result.success) {
        return fail({ error: result.error, statusCode: 500 });
      }

      const { gigs, total } = result.data;
      const totalPages = Math.ceil(total / limit);

      return ok({
        data: gigs,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
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
