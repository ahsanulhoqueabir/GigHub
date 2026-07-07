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
import { useDepartmentsStore } from "@/store/departments.store";
import { CreatePageHeader } from "@/components/shared/CreatePageHeader";
import { EditPageHeader } from "@/components/shared/EditPageHeader";
import { useReturnTo } from "@/hooks/use-return-to";
import { Department } from "@/types/db/department.types";

interface DepartmentFormProps {
  initialData?: Partial<Department>;
  isUpdate?: boolean;
}

export function DepartmentForm({
  initialData,
  isUpdate = false,
}: DepartmentFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { returnTo } = useReturnTo();
  const returnUrl = searchParams?.get("returnTo") || returnTo;
  const { createDepartment, updateDepartment, isLoading, error, clearError } =
    useDepartmentsStore();

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    code: initialData?.code || "",
    acronym: initialData?.acronym || "",
    description: initialData?.description || "",
    id_pattern: initialData?.id_pattern || "",
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
      // Auto-generate code/acronym from name initials when name changes and they are empty
      if (name === "name" && !isUpdate) {
        const words = value.trim().split(/\s+/);
        if (words.length > 1 && !prev.code) {
          const initials = words
            .map((w) => w[0])
            .join("")
            .toUpperCase();
          next.code = initials;
          next.acronym = initials;
        }
      }
      return next;
    });
  };

  const handleSave = async (shouldReturn: boolean) => {
    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        acronym: formData.acronym || null,
        description: formData.description || null,
        id_pattern: formData.id_pattern || null,
        image: null,
      };

      if (isUpdate && initialData?.id) {
        await updateDepartment(initialData.id, payload);
      } else {
        await createDepartment(payload);
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
          title="Edit Department"
          description="Modify existing department details."
          onDiscard={() => router.push(returnUrl)}
          onSave={(e) => {
            e.preventDefault();
            handleSave(true);
          }}
          isSubmitting={isLoading}
        />
      ) : (
        <CreatePageHeader
          title="Create Department"
          description="Add a new department to the organization."
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
            Department name and identifying codes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Department Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Computer Science and Engineering"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Short Code</Label>
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="e.g. CSE"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="acronym">Acronym</Label>
              <Input
                id="acronym"
                name="acronym"
                value={formData.acronym}
                onChange={handleChange}
                placeholder="e.g. CSE (Optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="id_pattern">ID Pattern</Label>
              <Input
                id="id_pattern"
                name="id_pattern"
                value={formData.id_pattern}
                onChange={handleChange}
                placeholder="e.g. CSE-#### (Optional)"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
          <CardDescription>A brief overview of the department.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the department..."
              className="min-h-25"
            />
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
