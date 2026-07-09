"use client";

import { FileUploadDropzone } from "@/components/shared/FileUploadDropzone";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { CreateJobInput } from "@/lib/validations/job.schema";
import { createJobSchema, updateJobSchema } from "@/lib/validations/job.schema";
import { useCategoriesStore } from "@/store/categories.store";
import { useFileUploadStore } from "@/store/file-upload.store";
import type { Category } from "@/types/db/category.types";
import type { JobDetail } from "@/types/db/job.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconLoader, IconPlus, IconX } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

// ─── Constants ──────────────────────────────────────────────────────────────

import { DatePicker } from "@/components/ui/date-picker";
import { JOB_TYPE_BADGE_COLORS } from "@/lib/shared/badge.utils";
import {
  isValidBudgetInput,
  sanitizeBudgetInput,
} from "@/lib/shared/regex.utils";

const JOB_TYPES = Object.entries(JOB_TYPE_BADGE_COLORS).map(
  ([value, { label }]) => ({ value, label }),
);

// ─── Props ──────────────────────────────────────────────────────────────────

interface JobFormProps {
  initialData?: JobDetail | null;
  onSubmit: (data: CreateJobInput) => Promise<void>;
  isEdit?: boolean;
  formId?: string;
  /** External loading state (e.g. from parent's isMutating) */
  isSubmitting?: boolean;
}

// ─── Tag Input ──────────────────────────────────────────────────────────────

function TagInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
  };

  const remove = (tag: string) => onChange(value.filter((t) => t !== tag));

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder ?? "Type and press Enter"}
          className="flex-1"
        />
        <Button type="button" size="sm" onClick={add}>
          <IconPlus size={14} />
        </Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs gap-1 pl-2 pr-1 py-0.5"
            >
              {tag}
              <button
                type="button"
                onClick={() => remove(tag)}
                className="hover:text-destructive transition-colors"
              >
                <IconX size={11} />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export function JobForm({
  initialData,
  onSubmit,
  isEdit = false,
  formId,
  isSubmitting = false,
}: JobFormProps) {
  const { categories, fetchCategories } = useCategoriesStore();

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [categories.length, fetchCategories]);

  const schema = isEdit ? updateJobSchema : createJobSchema;

  const form = useForm<CreateJobInput>({
    resolver: zodResolver(schema) as Resolver<CreateJobInput>,
    defaultValues: {
      title: initialData?.title ?? "",
      category:
        (initialData?.category as { id?: string } | undefined)?.id ?? "",
      description: initialData?.description ?? "",
      type: initialData?.type ?? undefined,
      budget: initialData?.budget ?? "",
      deadline: initialData?.deadline ? initialData.deadline.slice(0, 10) : "",
      location: initialData?.location ?? "",
      required_skills: initialData?.required_skills ?? [],
      tags: initialData?.tags ?? [],
      attachments: initialData?.attachments ?? [],
    },
  });

  // No extra mapping needed — categories are passed directly to SearchCombobox

  const watchedAttachments = useWatch({
    control: form.control,
    name: "attachments",
  });

  // Files selected via FileUploadDropzone but not yet uploaded
  const [pendingAttachments, setPendingAttachments] = useState<File[]>([]);
  const [isUploadingAttachments, setIsUploadingAttachments] = useState(false);
  const { uploadFiles } = useFileUploadStore();

  const handleFormSubmit = form.handleSubmit(async (data) => {
    try {
      // Upload any pending files first
      let allAttachments = [...(data.attachments ?? [])];

      if (pendingAttachments.length > 0) {
        setIsUploadingAttachments(true);
        const uploadedUrls = await uploadFiles(
          pendingAttachments,
          "job-attachments",
        );
        allAttachments = [...allAttachments, ...uploadedUrls];
        setPendingAttachments([]);
        setIsUploadingAttachments(false);
      }

      // Clean optional empty strings
      const cleaned = {
        ...data,
        attachments: allAttachments,
        location: data.location || undefined,
        deadline: data.deadline || undefined,
        budget: data.budget || undefined,
      } as CreateJobInput;

      await onSubmit(cleaned);
    } catch (err) {
      setIsUploadingAttachments(false);
      const msg =
        err instanceof Error ? err.message : "Failed to upload attachments";
      toast.error(msg);
      throw err;
    }
  });

  // ── Left Column ─────────────────────────────────────────────────────────

  const leftColumn = (
    <div className="space-y-6">
      {/* ── Basic Info ──────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Looking for a React Developer"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <SearchCombobox<Category>
                    items={categories}
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    getItemValue={(c) => c.id}
                    getItemLabel={(c) => c.name}
                    placeholder="Select a category"
                    searchPlaceholder="Search categories..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Type */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {JOB_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    rows={6}
                    placeholder="Describe the job requirements, responsibilities, and expectations..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* ── Skills & Tags ───────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Skills & Tags
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Required Skills */}
          <FormField
            control={form.control}
            name="required_skills"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Required Skills</FormLabel>
                <FormControl>
                  <TagInput
                    value={field.value ?? []}
                    onChange={field.onChange}
                    placeholder="e.g. React, Node.js — press Enter to add"
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
            render={({ field }) => (
              <FormItem>
                <FormLabel>Search Tags</FormLabel>
                <FormControl>
                  <TagInput
                    value={field.value ?? []}
                    onChange={field.onChange}
                    placeholder="e.g. remote, senior, startup — press Enter to add"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );

  // ── Right Column ────────────────────────────────────────────────────────

  const rightColumn = (
    <div className="space-y-6">
      {/* ── Compensation & Timeline ─────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Compensation & Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Budget */}
          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. 10000 - 20000"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (isValidBudgetInput(raw)) {
                        field.onChange(sanitizeBudgetInput(raw));
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Deadline */}
          <FormField
            control={form.control}
            name="deadline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Application Deadline</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select a deadline"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Location */}
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Dhaka, Bangladesh (or Remote)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* ── Attachments ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Attachments{" "}
            <span className="text-muted-foreground font-normal text-xs">
              (optional)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(isUploadingAttachments || isSubmitting) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg px-4 py-3 border border-border">
                <IconLoader className="size-4 animate-spin" />
                {isUploadingAttachments
                  ? "Uploading attachments&hellip;"
                  : "Saving&hellip;"}
              </div>
            )}

            {!isUploadingAttachments && !isSubmitting && (
              <>
                <FileUploadDropzone
                  variant="dropzone"
                  buttonLabel="Select Attachments"
                  onFilesSelected={(files) =>
                    setPendingAttachments((prev) => [...prev, ...files])
                  }
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  maxFiles={10}
                  currentCount={
                    (watchedAttachments?.length ?? 0) +
                    pendingAttachments.length
                  }
                  selectedFiles={pendingAttachments}
                />

                {/* Pending files indicator */}
                {pendingAttachments.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">
                      {pendingAttachments.length} file
                      {pendingAttachments.length > 1 ? "s" : ""} pending upload
                    </p>
                    {pendingAttachments.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm bg-muted/30 rounded px-3 py-2 border border-dashed border-primary/30"
                      >
                        <span className="flex-1 truncate text-muted-foreground text-xs">
                          {file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setPendingAttachments((prev) =>
                              prev.filter((_, i) => i !== idx),
                            )
                          }
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <IconX size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Uploaded attachments list (existing URLs) */}
            {(watchedAttachments ?? []).length > 0 && (
              <ul className="space-y-2">
                {(watchedAttachments ?? []).map((url, idx) => {
                  const fileName = url.split("/").pop() || url;
                  return (
                    <li
                      key={idx}
                      className="flex items-center gap-2 text-sm bg-muted/30 rounded px-3 py-2 border border-border"
                    >
                      <span className="flex-1 truncate text-muted-foreground text-xs">
                        {fileName}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          form.setValue(
                            "attachments",
                            (watchedAttachments ?? []).filter(
                              (_, i) => i !== idx,
                            ),
                          )
                        }
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <IconX size={14} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <Form {...form}>
      <form id={formId} onSubmit={handleFormSubmit} className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:gap-6">
          <div className="flex-6 min-w-0">{leftColumn}</div>
          <div className="flex-4 min-w-0">{rightColumn}</div>
        </div>
      </form>
    </Form>
  );
}
