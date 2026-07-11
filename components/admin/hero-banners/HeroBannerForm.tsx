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
import { useReturnTo } from "@/hooks/use-return-to";
import { extractNameFromFile } from "@/lib/utils";
import { useHeroBannersStore } from "@/store/hero-banners.store";
import type { HeroBanner } from "@/types/db/hero-banner.types";
import { IconPhoto, IconX } from "@tabler/icons-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface HeroBannerFormProps {
  initialData?: Partial<HeroBanner>;
  isUpdate?: boolean;
}

/** Compress a File on the client side and return a base64 data URI */
function compressImage(
  file: File,
  maxWidth = 1920,
  quality = 0.8,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        // Scale down if wider than maxWidth
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);

        // Get compressed base64
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

export function HeroBannerForm({
  initialData,
  isUpdate = false,
}: HeroBannerFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { returnTo } = useReturnTo();
  const returnUrl = searchParams?.get("returnTo") || returnTo;
  const { createItem, updateItem, isLoading, error, clearError } =
    useHeroBannersStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    subtitle: initialData?.subtitle || "",
    image_url: initialData?.image_url || "",
    alt_text: initialData?.alt_text || "",
    button_text: initialData?.button_text || "",
    button_url: initialData?.button_url || "",
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

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      // Compress on client side → base64
      const base64 = await compressImage(file);
      setPreview(base64);

      // Auto-fill title & alt_text from file name if they are empty
      const label = extractNameFromFile(file.name);
      setFormData((prev) => ({
        ...prev,
        image_url: base64,
        title: prev.title || label,
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
        subtitle: formData.subtitle || null,
        button_text: formData.button_text || null,
        button_url: formData.button_url || null,
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
          title="Edit Hero Banner"
          description="Modify hero banner details."
          onDiscard={() => router.push(returnUrl)}
          onSave={(e) => {
            e.preventDefault();
            handleSave(true);
          }}
          isSubmitting={isLoading || uploading}
        />
      ) : (
        <CreatePageHeader
          title="Create Hero Banner"
          description="Add a new hero banner to the homepage."
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
                Upload a banner image. Images are compressed on the client and
                uploaded to Cloudinary.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {preview ? (
                  <div className="relative rounded-lg overflow-hidden border">
                    <Image
                      src={preview}
                      alt="Banner preview"
                      width={800}
                      height={300}
                      className="w-full h-48 object-cover"
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
                    className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <IconPhoto className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload banner image
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: 1920x600px
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
                description="Show this banner on the homepage."
                value={formData.is_active}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, is_active: val }))
                }
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column — Content */}
        <div className="flex-4 min-w-0">
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>Banner text and link details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title & Sort Order */}
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
                    placeholder="Welcome to GigHub"
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

              {/* Subtitle — full width */}
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleChange}
                  placeholder="A short description (optional)"
                />
              </div>

              {/* Alt Text & Button Text */}
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
                    placeholder="Describe the banner image"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="button_text">Button Text</Label>
                  <Input
                    id="button_text"
                    name="button_text"
                    value={formData.button_text}
                    onChange={handleChange}
                    placeholder="Get Started"
                  />
                </div>
              </div>

              {/* Button URL & (empty spacer) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="button_url">Button URL</Label>
                  <Input
                    id="button_url"
                    name="button_url"
                    value={formData.button_url}
                    onChange={handleChange}
                    placeholder="/gigs"
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
