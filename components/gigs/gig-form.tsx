"use client";

import { BooleanField } from "@/components/shared/BooleanField";
import { SearchCombobox } from "@/components/shared/SearchCombobox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useCurrency } from "@/hooks/use-currency";
import { api_client } from "@/lib/api/api-client";
import type { CreateGigInput } from "@/lib/validations/gig.schema";
import { createGigSchema, updateGigSchema } from "@/lib/validations/gig.schema";
import { useCategoriesStore } from "@/store/categories.store";
import type { GigDetail } from "@/types/db/gig.types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconCheck,
  IconPlus,
  IconQuestionMark,
  IconTrash,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import type { Resolver } from "react-hook-form";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface GigFormProps {
  initialData?: GigDetail | null;
  onSubmit: (data: CreateGigInput) => Promise<void>;
  isEdit?: boolean;
  formId?: string;
}

const PACKAGE_TIERS = ["BASIC", "STANDARD", "PREMIUM"] as const;

export function GigForm({
  initialData,
  onSubmit,
  isEdit = false,
  formId,
}: GigFormProps) {
  const { categories, fetchCategories } = useCategoriesStore();
  const { symbol } = useCurrency();

  // Load categories if they haven't been fetched
  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [categories.length, fetchCategories]);

  // Form initialization
  const gigResolver = (isEdit ? updateGigSchema : createGigSchema) as
    | typeof createGigSchema
    | typeof updateGigSchema;

  const form = useForm<CreateGigInput>({
    resolver: zodResolver(gigResolver) as Resolver<CreateGigInput>,
    defaultValues: {
      title: initialData?.title ?? "",
      category: initialData?.category?.id ?? "",
      description: initialData?.description ?? "",
      images: initialData?.images ?? [],
      tags: initialData?.tags ?? [],
      packages: initialData?.packages
        ? [
            initialData.packages.find((p) => p.tier === "BASIC") || {
              tier: "BASIC",
              title: "",
              description: "",
              price: undefined,
              delivery_days: undefined,
              revisions: undefined,
              features: [],
            },
            initialData.packages.find((p) => p.tier === "STANDARD") || {
              tier: "STANDARD",
              title: "",
              description: "",
              price: undefined,
              delivery_days: undefined,
              revisions: undefined,
              features: [],
            },
            initialData.packages.find((p) => p.tier === "PREMIUM") || {
              tier: "PREMIUM",
              title: "",
              description: "",
              price: undefined,
              delivery_days: undefined,
              revisions: undefined,
              features: [],
            },
          ]
        : [
            {
              tier: "BASIC",
              title: "",
              description: "",
              price: undefined,
              delivery_days: undefined,
              revisions: undefined,
              features: [],
            },
            {
              tier: "STANDARD",
              title: "",
              description: "",
              price: undefined,
              delivery_days: undefined,
              revisions: undefined,
              features: [],
            },
            {
              tier: "PREMIUM",
              title: "",
              description: "",
              price: undefined,
              delivery_days: undefined,
              revisions: undefined,
              features: [],
            },
          ],
      status:
        (initialData?.status?.toLowerCase() as "active" | "draft") ?? "active",
      faq: initialData?.faq ?? [],
    },
  });

  const {
    fields: faqFields,
    append: appendFAQ,
    remove: removeFAQ,
  } = useFieldArray({
    control: form.control,
    name: "faq",
  });

  // Watchers
  const imagesValue = useWatch({ control: form.control, name: "images" }) || [];
  const tagsValue = useWatch({ control: form.control, name: "tags" }) || [];
  const packagesValue =
    useWatch({ control: form.control, name: "packages" }) || [];

  // Local state for uploading progress and lists
  const [tagInput, setTagInput] = useState("");
  const [featureInputs, setFeatureInputs] = useState<Record<number, string>>({
    0: "",
    1: "",
    2: "",
  });
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {},
  );

  // ── Image Upload logic ───────────────────────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    // Check limit
    if (imagesValue.length + files.length > 10) {
      toast.error("Maximum 10 images allowed");
      return;
    }

    setUploadingFiles(files);
    // Initialize progress for each file
    const progressMap: Record<string, number> = {};
    files.forEach((file) => {
      progressMap[file.name] = 0;
    });
    setUploadProgress(progressMap);

    try {
      // 1. Request presigned URLs from API
      const filesPayload = files.map((file) => ({
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
      }));

      const { data: response } = await api_client.post("/signed-upload-url", {
        files: filesPayload,
        folder: "gig-images",
      });

      const signedResults: {
        fileName: string;
        signedUrl: string;
        publicUrl: string;
      }[] = response.data;

      // 2. Upload each file directly to R2 using XMLHttpRequest to monitor progress
      const uploadPromises = files.map((file, index) => {
        const signedInfo = signedResults[index];
        if (!signedInfo) return Promise.reject(new Error("Upload mismatch"));

        return new Promise<string>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", signedInfo.signedUrl);
          xhr.setRequestHeader(
            "Content-Type",
            file.type || "application/octet-stream",
          );

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const pct = Math.round((event.loaded / event.total) * 100);
              setUploadProgress((prev) => ({
                ...prev,
                [file.name]: pct,
              }));
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(signedInfo.publicUrl);
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          };

          xhr.onerror = () => reject(new Error("Network error during upload"));
          xhr.send(file);
        });
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      // Append successfully uploaded images to form state
      form.setValue("images", [...imagesValue, ...uploadedUrls]);
      toast.success("Images uploaded successfully");
    } catch (err: unknown) {
      toast.error("Failed to upload images");
      console.error(err);
    } finally {
      setUploadingFiles([]);
      setUploadProgress({});
    }
  };

  const removeImage = (index: number) => {
    form.setValue(
      "images",
      imagesValue.filter((_, i) => i !== index),
    );
  };

  // ── Tag Handlers ──────────────────────────────────────────────────────────
  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (!trimmed) return;
    if (tagsValue.includes(trimmed)) {
      toast.info("Tag already added");
      return;
    }
    if (tagsValue.length >= 20) {
      toast.error("Maximum 20 tags allowed");
      return;
    }
    form.setValue("tags", [...tagsValue, trimmed]);
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    form.setValue(
      "tags",
      tagsValue.filter((t) => t !== tag),
    );
  };

  // ── Package Feature Handlers ──────────────────────────────────────────────
  const addFeature = (packageIndex: number) => {
    const rawInput = featureInputs[packageIndex] || "";
    const trimmed = rawInput.trim();
    if (!trimmed) return;

    const currentFeatures = packagesValue[packageIndex]?.features || [];
    if (currentFeatures.includes(trimmed)) {
      toast.info("Feature already exists");
      return;
    }
    if (currentFeatures.length >= 20) {
      toast.error("Maximum 20 features allowed per package");
      return;
    }

    form.setValue(`packages.${packageIndex}.features`, [
      ...currentFeatures,
      trimmed,
    ]);
    setFeatureInputs((prev) => ({ ...prev, [packageIndex]: "" }));
  };

  const removeFeature = (packageIndex: number, featureIndex: number) => {
    const currentFeatures = packagesValue[packageIndex]?.features || [];
    form.setValue(
      `packages.${packageIndex}.features`,
      currentFeatures.filter((_, idx) => idx !== featureIndex),
    );
  };

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit((data) => onSubmit(data as CreateGigInput))}
        className="space-y-8"
      >
        <Card className="shadow-sm border-border bg-card">
          <CardHeader>
            <CardTitle>
              {isEdit ? "Edit Gig Details" : "Create a New Gig"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title & Category — same row on large screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Gig Title <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. I will design a modern Next.js web application"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category selection */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-sm font-semibold">
                      Category <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <SearchCombobox
                        items={categories}
                        value={field.value ?? ""}
                        onChange={(val) => field.onChange(val || "")}
                        getItemValue={(cat) => cat.id}
                        getItemLabel={(cat) => cat.name}
                        placeholder="Select a Category"
                        searchPlaceholder="Search categories..."
                        clearable={false}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">
                    Description <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Write a detailed description explaining what services are offered in this gig..."
                      rows={6}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status & Tags — same row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status — BooleanField buttons variant */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <BooleanField
                        label="Status"
                        description="Set gig visibility — Active gigs are publicly visible"
                        value={field.value === "active"}
                        onChange={(val: boolean) =>
                          field.onChange(val ? "active" : "draft")
                        }
                        variant="checkbox"
                        trueLabel="Active"
                        falseLabel="Draft"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tags */}
              <FormField
                control={form.control}
                name="tags"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Tags
                    </FormLabel>
                    <div className="space-y-3">
                      {tagsValue.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {tagsValue.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="gap-1 pr-1 pl-2 h-7 text-xs"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="rounded-full p-0.5 hover:bg-muted transition-colors"
                              >
                                <IconX className="size-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2 max-w-md">
                        <Input
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addTag();
                            }
                          }}
                          placeholder="Add a search tag and press Enter"
                        />
                        <Button type="button" onClick={addTag}>
                          Add
                        </Button>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Package Forms inside Tab view */}
        <Card className="shadow-sm border-border bg-card">
          <CardHeader>
            <CardTitle>Pricing & Packages</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="BASIC" className="w-full">
              <TabsList className="grid grid-cols-3 w-full mb-6">
                {PACKAGE_TIERS.map((tier) => (
                  <TabsTrigger key={tier} value={tier}>
                    {tier}
                  </TabsTrigger>
                ))}
              </TabsList>

              {PACKAGE_TIERS.map((tier, packageIdx) => (
                <TabsContent key={tier} value={tier} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Package Title */}
                    <FormField
                      control={form.control}
                      name={`packages.${packageIdx}.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold">
                            Package Title{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g. Standard React Web Application"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Price */}
                    <FormField
                      control={form.control}
                      name={`packages.${packageIdx}.price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold">
                            Price ({symbol}){" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <NumberInput
                              value={field.value ?? ""}
                              onChange={(val) => field.onChange(val)}
                              allowDecimal={true}
                              placeholder="Price"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Delivery Days */}
                    <FormField
                      control={form.control}
                      name={`packages.${packageIdx}.delivery_days`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold">
                            Delivery Time (Days){" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <NumberInput
                              value={field.value ?? ""}
                              onChange={(val) => field.onChange(val)}
                              allowDecimal={false}
                              placeholder="e.g. 3"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Revisions */}
                    <FormField
                      control={form.control}
                      name={`packages.${packageIdx}.revisions`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold">
                            Revisions{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <NumberInput
                              value={field.value ?? ""}
                              onChange={(val) => field.onChange(val)}
                              allowDecimal={false}
                              placeholder="e.g. 3 (0 for unlimited)"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Package Description */}
                  <FormField
                    control={form.control}
                    name={`packages.${packageIdx}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold">
                          Package Description{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Detail what is included in this package..."
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Package Features List */}
                  <div className="space-y-3">
                    <FormLabel className="text-sm font-semibold">
                      Package Features
                    </FormLabel>
                    {(() => {
                      const pkgFeatures =
                        packagesValue[packageIdx]?.features || [];
                      return pkgFeatures.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                          {pkgFeatures.map((feature, featureIdx) => (
                            <div
                              key={featureIdx}
                              className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/20 text-sm hover:bg-muted/40 transition-all duration-200 group"
                            >
                              <span className="flex items-center gap-2 font-medium">
                                <IconCheck className="size-4 text-emerald-500 shrink-0" />
                                {feature}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  removeFeature(packageIdx, featureIdx)
                                }
                                className="text-muted-foreground hover:text-destructive p-1 rounded-md hover:bg-destructive/10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200"
                              >
                                <IconTrash className="size-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground bg-muted/10 border border-dashed rounded-lg p-3 text-center">
                          No package features added yet. Add features below.
                        </div>
                      );
                    })()}
                    <div className="flex gap-2 max-w-md">
                      <Input
                        value={featureInputs[packageIdx] || ""}
                        onChange={(e) =>
                          setFeatureInputs((prev) => ({
                            ...prev,
                            [packageIdx]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addFeature(packageIdx);
                          }
                        }}
                        placeholder="Add a feature (e.g. SEO, Source Code) and press Enter"
                      />
                      <Button
                        type="button"
                        onClick={() => addFeature(packageIdx)}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Gallery / Images Upload */}
        <Card className="shadow-sm border-border bg-card">
          <CardHeader>
            <CardTitle>Gig Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {imagesValue.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {imagesValue.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-video rounded-lg overflow-hidden border border-border group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Gig Upload ${idx + 1}`}
                      className="object-cover w-full h-full"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1.5 right-1.5 p-1 bg-destructive hover:bg-destructive/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <IconTrash className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* File drop area */}
            <div className="relative border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-xl p-8 text-center flex flex-col items-center justify-center cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingFiles.length > 0}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <IconUpload className="size-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium text-foreground">
                Click or drag images here to upload
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Upload up to 10 images (max size 5MB each)
              </p>
            </div>

            {/* Upload progress bars */}
            {uploadingFiles.length > 0 && (
              <div className="space-y-2 max-w-md">
                <p className="text-xs font-semibold text-muted-foreground">
                  Uploading files...
                </p>
                {uploadingFiles.map((file, idx) => {
                  const pct = uploadProgress[file.name] || 0;
                  return (
                    <div
                      key={idx}
                      className="flex flex-col space-y-1.5 bg-muted/40 p-2.5 rounded-lg border border-border text-xs"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium truncate max-w-50">
                          {file.name}
                        </span>
                        <span className="text-muted-foreground font-semibold">
                          {pct}%
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-primary h-1.5 transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* FAQs */}
        <Card className="shadow-sm border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>FAQ</CardTitle>
            <Button
              type="button"
              size="sm"
              onClick={() => appendFAQ({ question: "", answer: "" })}
              className="h-8"
            >
              <IconPlus className="size-4 mr-1" /> Add FAQ
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {faqFields.length === 0 && (
              <div className="flex flex-col items-center justify-center border border-dashed rounded-xl p-8 text-center bg-muted/5">
                <IconQuestionMark className="size-8 text-muted-foreground/60 mb-2" />
                <p className="text-sm font-medium text-muted-foreground">
                  No Frequently Asked Questions yet
                </p>
                <p className="text-xs text-muted-foreground/80 mt-1 max-w-sm">
                  Add custom Q&As to help buyers understand details of your
                  service.
                </p>
              </div>
            )}

            {faqFields.map((field, idx) => (
              <div
                key={field.id}
                className="relative bg-card border border-border shadow-sm rounded-xl p-5 space-y-4 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <span className="text-sm font-semibold text-primary flex items-center gap-2">
                    <IconQuestionMark className="size-4 text-primary shrink-0" />
                    FAQ #{idx + 1}
                  </span>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeFAQ(idx)}
                    className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10 px-2.5 gap-1.5"
                  >
                    <IconTrash className="size-4" />
                    Remove
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Question */}
                  <FormField
                    control={form.control}
                    name={`faq.${idx}.question`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold">
                          Question
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g. Do you provide the code at completion?"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Answer */}
                  <FormField
                    control={form.control}
                    name={`faq.${idx}.answer`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold">
                          Answer
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Provide your answer here..."
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
