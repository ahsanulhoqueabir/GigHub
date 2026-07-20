import { telegram } from "@/config/env.config";
import { error, success } from "@/lib/api/api-response";
import { getSupabaseServerClient } from "@/lib/api/supabase";
import type { ServiceResult } from "@/types/generic.types";

// ── Types ───────────────────────────────────────────────────────────

interface TableSummary {
  table_name: string;
  column_count: number;
  row_count_estimate: number;
  table_size: string;
}

interface DbDailySummary {
  generated_at: string;
  database_size: string;
  total_tables: number;
  total_rows_estimate: number;
  tables: TableSummary[];
}

interface TelegramSendMessageResponse {
  ok: boolean;
  result?: { message_id: number };
  description?: string;
}

// ── Helpers ─────────────────────────────────────────────────────────

/**
 * Format the DB summary into a Telegram-friendly Markdown message.
 */
function formatSummaryMessage(summary: DbDailySummary): string {
  const date = new Date(summary.generated_at);
  const dateStr = date.toLocaleDateString("en-BD", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const lines: string[] = [
    `📊 *Gighub — Daily DB Summary*`,
    `📅 ${dateStr}`,
    ``,
    `━━━━━━━━━━━━━━━━━━`,
    `💾 *Database Size:* ${summary.database_size}`,
    `🗂️ *Total Tables:* ${summary.total_tables}`,
    `📝 *Total Rows (est):* ${summary.total_rows_estimate.toLocaleString("en-BD")}`,
    `━━━━━━━━━━━━━━━━━━`,
    ``,
    `*Table Breakdown:*`,
    ``,
  ];

  // Table header
  lines.push("```");
  lines.push(
    `${"TABLE NAME".padEnd(22)} ${"COLUMNS".padEnd(9)} ${"ROWS".padEnd(12)} SIZE`,
  );
  lines.push(
    `${"─".repeat(21)}  ${"─".repeat(8)}  ${"─".repeat(11)}  ${"─".repeat(8)}`,
  );

  for (const table of summary.tables) {
    const name = table.table_name.padEnd(22);
    const cols = String(table.column_count).padEnd(9);
    const rows = table.row_count_estimate.toLocaleString("en-BD").padEnd(12);
    const size = table.table_size.padEnd(8);
    lines.push(`${name} ${cols} ${rows} ${size}`);
  }

  lines.push("```");

  lines.push(``, `━━━━━━━━━━━━━━━━━━`);
  lines.push(
    `⏰ _Auto-generated at ${date.toLocaleTimeString("en-BD", { timeZone: "Asia/Dhaka" })}_`,
  );

  return lines.join("\n");
}

/**
 * Send a message to the configured Telegram chat/thread via the Bot API.
 */
async function sendTelegramMessage(
  text: string,
): Promise<ServiceResult<{ message_id: number }>> {
  const url = `https://api.telegram.org/bot${telegram.botToken}/sendMessage`;

  const body: Record<string, string | number> = {
    chat_id: telegram.chatId,
    text,
    parse_mode: "Markdown",
  };

  // Only include thread_id if it's provided and non-empty
  if (telegram.threadId) {
    body.message_thread_id = telegram.threadId;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json: TelegramSendMessageResponse = await res.json();

    if (!json.ok) {
      return error(json.description ?? "Telegram API returned an error");
    }

    return success({ message_id: json.result!.message_id });
  } catch (err) {
    return error((err as Error).message || "Failed to send Telegram message");
  }
}

// ── Main Service ────────────────────────────────────────────────────

/**
 * CronService — handles automated daily summary tasks.
 */
export class CronService {
  /**
   * Fetch the daily DB summary via RPC and send it to Telegram.
   *
   * Steps:
   * 1. Call `get_db_daily_summary()` RPC
   * 2. Format the result into a Markdown message
   * 3. Send it to the configured Telegram chat/thread
   */
  static async runDailySummary(): Promise<
    ServiceResult<{ message_id: number }>
  > {
    try {
      const supabase = getSupabaseServerClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase as any).rpc(
        "get_db_daily_summary",
      );

      if (rpcError) {
        return error(rpcError.message);
      }

      const summary = data as DbDailySummary;
      const message = formatSummaryMessage(summary);

      return await sendTelegramMessage(message);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }
}
