import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { WithdrawalService } from "@/services/withdrawal.service";
import type { JwtPayload } from "@/types/business/user.types";

/**
 * POST /api/withdrawals - Request a withdrawal
 */
export const POST = withAuth(
  async (req: NextRequest, jwtPayload: JwtPayload) => {
    try {
      const body = await req.json();
      const { amount, method, account_info } = body;

      if (!amount || !method || !account_info) {
        return fail({
          error: "amount, method, and account_info are required",
        });
      }

      if (!["bkash", "nagad", "bank_transfer"].includes(method)) {
        return fail({
          error: "method must be one of: bkash, nagad, bank_transfer",
        });
      }

      if (amount <= 0) {
        return fail({ error: "amount must be greater than 0" });
      }

      const result = await WithdrawalService.create({
        profile: jwtPayload.profile,
        amount,
        method,
        account_info,
      });

      if (!result.success) {
        const statusCode = result.error.includes("Insufficient") ? 403 : 400;
        return fail({ error: result.error, statusCode });
      }

      return ok({ data: result.data, statusCode: 201 });
    } catch (err) {
      return fail({
        error: (err as Error).message || "An unknown error occurred",
        statusCode: 500,
      });
    }
  },
);

/**
 * GET /api/withdrawals - Not implemented
 */
export async function GET() {
  return fail({ error: "Not implemented", statusCode: 501 });
}
