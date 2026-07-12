import { error, success } from "@/lib/api/api-response";
import { getSupabaseServerClient } from "@/lib/api/supabase";
import type { UpdateSystemConfigInput } from "@/lib/validations/system-config.schema";
import type { SystemConfig } from "@/types/db/system-config.types";
import type { ServiceResult } from "@/types/generic.types";

export class SystemConfigService {
  private static collection = "system_config";

  /**
   * Get the system configuration (singleton row).
   */
  static async get(): Promise<ServiceResult<SystemConfig>> {
    try {
      const supabase = getSupabaseServerClient();

      const { data, error: sbError } = await supabase
        .from(this.collection)
        .select("*")
        .eq("id", true)
        .single();

      if (sbError) {
        return error(sbError.message);
      }

      if (!data) {
        return error("System configuration not found");
      }

      return success(data as SystemConfig);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Update the system configuration (admin only).
   */
  static async update(
    params: UpdateSystemConfigInput,
  ): Promise<ServiceResult<SystemConfig>> {
    try {
      const supabase = getSupabaseServerClient();

      const { data, error: sbError } = await supabase
        .from(this.collection)
        .update({
          ...params,
          updated_at: new Date().toISOString(),
        })
        .eq("id", true)
        .select()
        .single();

      if (sbError) {
        return error(sbError.message);
      }

      return success(data as SystemConfig);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }
}
