import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { ProposalService } from "@/services/proposal.service";
import type { JwtPayload } from "@/types/business/user.types";

/**
 * GET /api/proposals/me - Get authenticated user's proposals
 */
export const GET = withAuth(
  async (_req: NextRequest, jwtPayload: JwtPayload) => {
    try {
      const result = await ProposalService.listByApplicant(jwtPayload.profile);

      if (!result.success) {
        return fail({ error: result.error, statusCode: 500 });
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
