import { cron } from "@/config/env.config";
import { fail, ok } from "@/lib/api/api-response";
import { CronService } from "@/services/cron.service";
import { NextRequest } from "next/server";

/**
 * POST /api/cron/daily-summary
 *
 * Cron job endpoint — triggers a daily DB summary and sends it to Telegram.
 *
 * Security:
 * - Requires a valid `x-cron-api-key` header matching CRON_API_KEY in env.
 * - This is a simple pre-shared key check (not JWT-based) so that external
 *   cron services (e.g. cron-job.org, GitHub Actions, UptimeRobot) can call it.
 *
 * Expected headers:
 *   x-cron-api-key: <CRON_API_KEY>
 *
 * Response:
 *   200 — Summary sent successfully
 *   401 — Missing or invalid API key
 *   500 — Internal error
 */
export const POST = async (request: NextRequest) => {
  try {
    // ── Verify cron API key ──────────────────────────────────────
    const apiKey = request.headers.get("x-cron-api-key");

    if (!apiKey || apiKey !== cron.apiKey) {
      return fail({ error: "Invalid or missing API key", statusCode: 401 });
    }

    // ── Run the daily summary ────────────────────────────────────
    const result = await CronService.runDailySummary();

    if (!result.success) {
      return fail({ error: result.error, statusCode: 500 });
    }

    return ok({
      data: { message_id: result.data.message_id },
      message: "Daily summary sent to Telegram",
    });
  } catch (err) {
    return fail({
      error: (err as Error).message || "An unknown error occurred",
      statusCode: 500,
    });
  }
};
