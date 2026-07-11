"use client";

import { SystemConfigForm } from "@/components/admin/system/SystemConfigForm";
import { FormSkeleton } from "@/components/shared/form-skeleton";
import { useSystemConfigStore } from "@/store/system-config.store";
import { useEffect } from "react";

export default function SystemConfigPage() {
  const { config, isLoading, fetchAdminConfig } = useSystemConfigStore();

  useEffect(() => {
    fetchAdminConfig();
  }, [fetchAdminConfig]);

  if (isLoading) {
    return <FormSkeleton />;
  }

  if (!config) {
    return (
      <div className="p-6 text-center text-red-500 font-medium">
        System configuration not found
      </div>
    );
  }

  return (
    <div className="flex-1 mx-auto">
      <SystemConfigForm initialData={config} />
    </div>
  );
}
