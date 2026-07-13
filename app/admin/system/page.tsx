"use client";

import { SystemConfigForm } from "@/components/admin/system/SystemConfigForm";
import { ErrorState } from "@/components/shared/error-state";
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
      <ErrorState
        type="not-found"
        heading="System configuration not found"
        compact
      />
    );
  }

  return (
    <div className="flex-1 mx-auto">
      <SystemConfigForm initialData={config} />
    </div>
  );
}
