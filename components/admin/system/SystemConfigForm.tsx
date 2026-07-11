"use client";

import { BooleanField } from "@/components/shared/BooleanField";
import { FormSkeleton } from "@/components/shared/form-skeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { useSystemConfigStore } from "@/store/system-config.store";
import type { SystemConfig } from "@/types/db/system-config.types";
import { useEffect, useState } from "react";

interface SystemConfigFormProps {
  initialData?: SystemConfig;
}

export function SystemConfigForm({ initialData }: SystemConfigFormProps) {
  const { updateConfig, isLoading, error, clearError } = useSystemConfigStore();

  const [formData, setFormData] = useState({
    maintenance_mode: initialData?.maintenance_mode ?? false,
    registration_enabled: initialData?.registration_enabled ?? true,
    platform_fee_percent: initialData?.platform_fee_percent ?? 5,
    max_gig_images: initialData?.max_gig_images ?? 6,
    max_portfolio_images: initialData?.max_portfolio_images ?? 10,
    max_upload_size_mb: initialData?.max_upload_size_mb ?? 25,
    support_email: initialData?.support_email ?? "",
    support_phone: initialData?.support_phone ?? "",
  });

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value ? Number(value) : 0) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateConfig({
      ...formData,
      support_email: formData.support_email || null,
      support_phone: formData.support_phone || null,
    });
  };

  if (!initialData) {
    return <FormSkeleton />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">System Configuration</h1>
          <p className="text-sm text-muted-foreground">
            Manage global platform settings and limits.
          </p>
        </div>
        <Button type="submit" disabled={isLoading} size="lg">
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-destructive/15 text-destructive text-sm rounded-md font-medium">
          {error}
        </div>
      )}

      {/* Platform Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Controls</CardTitle>
          <CardDescription>
            Enable or disable platform-wide features.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-0 md:flex gap-5 w-full">
          <BooleanField
            label="Maintenance Mode"
            variant="card"
            description="When enabled, only admins can access the site."
            value={formData.maintenance_mode}
            onChange={(val) =>
              setFormData((prev) => ({ ...prev, maintenance_mode: val }))
            }
          />

          <BooleanField
            label="Registration Enabled"
            variant="card"
            description="Allow new users to sign up."
            value={formData.registration_enabled}
            onChange={(val) =>
              setFormData((prev) => ({ ...prev, registration_enabled: val }))
            }
          />
        </CardContent>
      </Card>

      {/* Fee & Limits */}
      <Card>
        <CardHeader>
          <CardTitle>Fees & Limits</CardTitle>
          <CardDescription>
            Configure platform fees and upload limits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="platform_fee_percent">Platform Fee (%)</Label>
              <NumberInput
                id="platform_fee_percent"
                value={formData.platform_fee_percent}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    platform_fee_percent: val,
                  }))
                }
                allowDecimal={true}
                maxDecimals={1}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_upload_size_mb">Max Upload Size (MB)</Label>
              <NumberInput
                id="max_upload_size_mb"
                value={formData.max_upload_size_mb}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, max_upload_size_mb: val }))
                }
                allowDecimal={false}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_gig_images">Max Gig Images</Label>
              <NumberInput
                id="max_gig_images"
                value={formData.max_gig_images}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, max_gig_images: val }))
                }
                allowDecimal={false}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_portfolio_images">Max Portfolio Images</Label>
              <NumberInput
                id="max_portfolio_images"
                value={formData.max_portfolio_images}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    max_portfolio_images: val,
                  }))
                }
                allowDecimal={false}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support Information */}
      <Card>
        <CardHeader>
          <CardTitle>Support Information</CardTitle>
          <CardDescription>
            Contact details shown to users across the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="support_email">Support Email</Label>
              <Input
                id="support_email"
                name="support_email"
                type="email"
                value={formData.support_email}
                onChange={handleChange}
                placeholder="support@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="support_phone">Support Phone</Label>
              <Input
                id="support_phone"
                name="support_phone"
                value={formData.support_phone}
                onChange={handleChange}
                placeholder="+880XXXXXXXXX"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
