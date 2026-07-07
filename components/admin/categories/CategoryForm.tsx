"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useCategoriesStore } from "@/store/categories.store";
import { CreatePageHeader } from "@/components/shared/CreatePageHeader";
import { EditPageHeader } from "@/components/shared/EditPageHeader";
import { SearchCombobox } from "@/components/shared/SearchCombobox";
import { useReturnTo } from "@/hooks/use-return-to";
import { Category } from "@/types/db/category.types";

interface CategoryFormProps {
  initialData?: Partial<Category>;
  isUpdate?: boolean;
}

export function CategoryForm({
  initialData,
  isUpdate = false,
}: CategoryFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { returnTo } = useReturnTo();
  const returnUrl = searchParams?.get("returnTo") || returnTo;
  const {
    categories,
    createCategory,
    updateCategory,
    isLoading,
    error,
    clearError,
  } = useCategoriesStore();

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    ordering: initialData?.ordering ?? 0,
    parent:
      typeof initialData?.parent === "object"
        ? initialData.parent?.id
        : initialData?.parent || "",
  });

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      // Auto-generate slug from name if slug is not edited/is empty or when name changes (and we're creating)
      if (name === "name" && !isUpdate) {
        next.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");
      }
      return next;
    });
  };

  const handleSave = async (shouldReturn: boolean) => {
    try {
      const payload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        ordering: Number(formData.ordering),
        parent: formData.parent || null,
      };

      if (isUpdate && initialData?.id) {
        await updateCategory(initialData.id, payload);
      } else {
        await createCategory(payload);
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

  // Filter out the current category from the parent selection to avoid self-referencing loops
  const eligibleParents = categories.filter(
    (c) => !isUpdate || c.id !== initialData?.id,
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isUpdate ? (
        <EditPageHeader
          title="Edit Category"
          description="Modify existing category details."
          onDiscard={() => router.push(returnUrl)}
          onSave={(e) => {
            e.preventDefault();
            handleSave(true);
          }}
          isSubmitting={isLoading}
        />
      ) : (
        <CreatePageHeader
          title="Create Category"
          description="Add a new category to the system."
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

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Category name and URL-friendly slug.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Graphic Design"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="e.g. graphic-design"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organization */}
      <Card>
        <CardHeader>
          <CardTitle>Organization</CardTitle>
          <CardDescription>
            Set the parent category and display ordering.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="parent">Parent Category</Label>
              <SearchCombobox
                items={eligibleParents}
                value={formData.parent}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    parent: (val as string) || "",
                  }))
                }
                getItemValue={(cat) => cat.id}
                getItemLabel={(cat) => cat.name}
                placeholder="Select parent category (Optional)"
                searchPlaceholder="Search categories..."
                clearable
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ordering">Ordering</Label>
              <Input
                id="ordering"
                type="number"
                name="ordering"
                value={formData.ordering}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
          <CardDescription>A brief overview of the category.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the category..."
              className="min-h-25"
            />
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
