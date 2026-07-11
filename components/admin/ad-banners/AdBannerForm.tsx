"use client";

import { BooleanField } from "@/components/shared/BooleanField";
import { CreatePageHeader } from "@/components/shared/CreatePageHeader";
import { EditPageHeader } from "@/components/shared/EditPageHeader";
import { Button } from "@/components/ui/button";
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
import { NumberInput } from "@/components/ui/number-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useReturnTo } from "@/hooks/use-return-to";
import { extractNameFromFile } from "@/lib/utils";
import { useAdBannersStore } from "@/store/ad-banners.store";
import type { AdBanner } from "@/types/db/ad-banner.types";
import { IconPhoto, IconX } from "@tabler/icons-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface AdBannerFormProps {
  initialData?: Partial<AdBanner>;
  isUpdate?: boolean;
}

/** Compress a File on the client side and return a base64 data URI */
function compressImage(
  file: File,
  maxWidth = 1200,
  quality = 0.8,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

const PLACEMENT_OPTIONS = [
  { value: "homepage_top", label: "Homepage Top" },
  { value: "homepage_middle", label: "Homepage Middle" },
  { value: "homepage_bottom", label: "Homepage Bottom" },
  { value: "sidebar", label: "Sidebar" },
  { value: "gig_page", label: "Gig Page" },
  { value: "job_page", label: "Job Page" },
];

export function AdBannerForm({
  initialData,
  isUpdate = false,
}: AdBannerFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { returnTo } = useReturnTo();
  const returnUrl = searchParams?.get("returnTo") || returnTo;
  const { createItem, updateItem, isLoading, error, clearError } =
    useAdBannersStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    placement: initialData?.placement || "homepage_middle",
    image_url: initialData?.image_url || "",
    alt_text: initialData?.alt_text || "",
    target_url: initialData?.target_url || "",
    sort_order: initialData?.sort_order ?? 0,
    is_active: initialData?.is_active ?? true,
    starts_at: initialData?.starts_at || "",
    ends_at: initialData?.ends_at || "",
  });

  const [preview, setPreview] = useState<string>(initialData?.image_url || "");
  const [uploading, setUploading] = useState(false);

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

  const handlePlacementChange = (value: string) => {
    setFormData((prev) => ({ ...prev, placement: value }));
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const base64 = await compressImage(file);
      setPreview(base64);

      // Auto-fill name & alt_text from file name if they are empty
      const label = extractNameFromFile(file.name);
      setFormData((prev) => ({
        ...prev,
        image_url: base64,
        name: prev.name || label,
        alt_text: prev.alt_text || label,
      }));
    } catch (err) {
      console.error("Image compression failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setPreview("");
    setFormData((prev) => ({ ...prev, image_url: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async (shouldReturn: boolean) => {
    try {
      const payload = {
        ...formData,
        target_url: formData.target_url || null,
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
          title="Edit Ad Banner"
          description="Modify ad banner details."
          onDiscard={() => router.push(returnUrl)}
          onSave={(e) => {
            e.preventDefault();
            handleSave(true);
          }}
          isSubmitting={isLoading || uploading}
        />
      ) : (
        <CreatePageHeader
          title="Create Ad Banner"
          description="Add a new advertisement banner."
          onDiscard={() => router.push(returnUrl)}
          onSaveAndReturn={(e) => {
            e.preventDefault();
            handleSave(true);
          }}
          onSave={(e) => {
            e.preventDefault();
            handleSave(false);
          }}
          isSubmitting={isLoading || uploading}
        />
      )}

      {error && (
        <div className="p-3 bg-destructive/15 text-destructive text-sm rounded-md font-medium">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:gap-6">
        {/* Left Column — Banner Image + Status */}
        <div className="flex-6 min-w-0 space-y-6">
          {/* Banner Image */}
          <Card>
            <CardHeader>
              <CardTitle>Banner Image</CardTitle>
              <CardDescription>
                Upload an ad banner image. Images are compressed on the client
                and uploaded to Cloudinary.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {preview ? (
                  <div className="relative rounded-lg overflow-hidden border">
                    <Image
                      src={preview}
                      alt="Banner preview"
                      width={600}
                      height={200}
                      className="w-full h-40 object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      <IconX className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed rounded-lg p-10 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <IconPhoto className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload ad image
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
                {uploading && (
                  <p className="text-sm text-muted-foreground">
                    Compressing image...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
              <CardDescription>Banner visibility settings.</CardDescription>
            </CardHeader>
            <CardContent>
              <BooleanField
                label="Active"
                description="Show this ad banner on the site."
                value={formData.is_active}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, is_active: val }))
                }
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column — Details */}
        <div className="flex-4 min-w-0">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
              <CardDescription>
                Ad banner information and targeting.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Banner Name & Placement */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Banner Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Summer Sale Banner"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="placement">Placement</Label>
                  <Select
                    value={formData.placement}
                    onValueChange={handlePlacementChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select placement" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLACEMENT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Alt Text & Sort Order */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="alt_text">
                    Alt Text <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="alt_text"
                    name="alt_text"
                    value={formData.alt_text}
                    onChange={handleChange}
                    placeholder="Describe the ad image"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <NumberInput
                    id="sort_order"
                    value={formData.sort_order}
                    onChange={(val) =>
                      setFormData((prev) => ({ ...prev, sort_order: val }))
                    }
                    allowDecimal={false}
                  />
                </div>
              </div>

              {/* Target URL & (empty spacer) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="target_url">Target URL</Label>
                  <Input
                    id="target_url"
                    name="target_url"
                    value={formData.target_url}
                    onChange={handleChange}
                    placeholder="https://example.com/promo"
                  />
                </div>
                <div />
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
