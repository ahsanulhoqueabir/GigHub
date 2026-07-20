"use client";

import { BooleanField } from "@/components/shared/BooleanField";
import { CreatePageHeader } from "@/components/shared/CreatePageHeader";
import { EditPageHeader } from "@/components/shared/EditPageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useReturnTo } from "@/hooks/use-return-to";
import { useAnnouncementsStore } from "@/store/announcements.store";
import type { Announcement } from "@/types/db/announcement.types";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface AnnouncementFormProps {
  initialData?: Partial<Announcement>;
  isUpdate?: boolean;
}

const ANNOUNCEMENT_TYPES = [
  { value: "announcement", label: "Announcement" },
  { value: "update", label: "Update" },
  { value: "info", label: "Info" },
  { value: "warning", label: "Warning" },
  { value: "success", label: "Success" },
  { value: "error", label: "Error" },
  { value: "maintenance", label: "Maintenance" },
];

export function AnnouncementForm({
  initialData,
  isUpdate = false,
}: AnnouncementFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { returnTo } = useReturnTo();
  const returnUrl = searchParams?.get("returnTo") || returnTo;
  const { createItem, updateItem, isLoading, error, clearError } =
    useAnnouncementsStore();

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    content: initialData?.content || "",
    type: initialData?.type || "update",
    is_active: initialData?.is_active ?? true,
    send_push: initialData?.send_push ?? true,
    starts_at: initialData?.starts_at || "",
    ends_at: initialData?.ends_at || "",
  });

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, type: value }));
  };

  const handleSave = async (shouldReturn: boolean) => {
    try {
      const payload = {
        ...formData,
        starts_at: formData.starts_at || null,
        ends_at: formData.ends_at || null,
      };

      if (isUpdate && initialData?.id) {
        await updateItem(initialData.id, payload);
      } else {
        await createItem(payload);
      }

      if (shouldReturn) {
        router.push(returnUrl);
      }
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSave(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isUpdate ? (
        <EditPageHeader
          title="Edit Announcement"
          description="Modify announcement details."
          onDiscard={() => router.push(returnUrl)}
          onSave={(e) => {
            e.preventDefault();
            handleSave(true);
          }}
          isSubmitting={isLoading}
        />
      ) : (
        <CreatePageHeader
          title="Create Announcement"
          description="Add a new platform announcement."
          onDiscard={() => router.push(returnUrl)}
          onSaveAndReturn={(e) => {
            e.preventDefault();
            handleSave(true);
          }}
          onSave={(e) => {
            e.preventDefault();
            handleSave(false);
          }}
          isSubmitting={isLoading}
        />
      )}

      {error && (
        <div className="p-3 bg-destructive/15 text-destructive text-sm rounded-md font-medium">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:gap-6">
        {/* Left Column — Status */}
        <div className="flex-6 min-w-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
              <CardDescription>
                Announcement visibility settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BooleanField
                label="Active"
                description="Show this announcement to users."
                value={formData.is_active}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, is_active: val }))
                }
              />
              {!isUpdate && (
                <div className="mt-4">
                  <BooleanField
                    label="Send Push Notification"
                    description="Notify all subscribed devices when this announcement is created. Only applies on creation — it cannot be resent later."
                    value={formData.send_push}
                    onChange={(val) =>
                      setFormData((prev) => ({ ...prev, send_push: val }))
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column — Announcement Details */}
        <div className="flex-4 min-w-0">
          <Card>
            <CardHeader>
              <CardTitle>Announcement Details</CardTitle>
              <CardDescription>
                Title, content, and type for the announcement.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title & Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Scheduled Maintenance"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={handleTypeChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      {ANNOUNCEMENT_TYPES.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Content — full width */}
              <div className="space-y-2">
                <Label htmlFor="content">
                  Content <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Detailed announcement message..."
                  className="min-h-32"
                  required
                />
              </div>

              {/* Start Date & End Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="starts_at">Start Date</Label>
                  <DateTimePicker
                    value={formData.starts_at}
                    onChange={(val) =>
                      setFormData((prev) => ({ ...prev, starts_at: val }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ends_at">End Date</Label>
                  <DateTimePicker
                    value={formData.ends_at}
                    onChange={(val) =>
                      setFormData((prev) => ({ ...prev, ends_at: val }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
