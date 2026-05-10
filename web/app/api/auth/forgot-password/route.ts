import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/api-response";
import { getSupabaseServerClient } from "@/lib/api/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return fail({ error: "Email is required" });
    }

    const supabase = getSupabaseServerClient();

    // Trigger password reset email via Supabase
    const { error: sbError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
      },
    );

    // Always return the same response to prevent email enumeration
    if (sbError) {
      console.error("Forgot password error:", sbError.message);
    }

    return ok({
      message: "If that email exists, a reset link has been sent",
    });
  } catch (err) {
    return fail({
      error: (err as Error).message || "An unknown error occurred",
      statusCode: 500,
    });
  }
}
