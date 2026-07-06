"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useUsersStore } from "@/store/users.store";
import { useDepartmentsStore } from "@/store/departments.store";
import { CreatePageHeader } from "@/components/shared/CreatePageHeader";
import { EditPageHeader } from "@/components/shared/EditPageHeader";
import { SearchCombobox } from "@/components/shared/SearchCombobox";
import { BooleanField } from "@/components/shared/BooleanField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Profile, UserRole } from "@/types/db/profile.types";

interface UserFormProps {
  initialData?: Partial<Profile>;
  isUpdate?: boolean;
}

export function UserForm({ initialData, isUpdate = false }: UserFormProps) {
  const router = useRouter();
  const { createUser, updateUser, isLoading, error, clearError } =
    useUsersStore();
  const { departments } = useDepartmentsStore();

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    username: initialData?.username || "",
    password: "",
    role: initialData?.role || "USER",
    student_id: initialData?.student_id || "",
    department:
      typeof initialData?.department === "string"
        ? initialData.department
        : initialData?.department?.id || "",
    verified: initialData?.verified ?? false,
  });

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      // Prepare payload: filter out empty optional fields or password if not modifying
      const payload: Partial<Profile> = {
        name: formData.name,
        email: formData.email,
        username: formData.username,
        role: formData.role,
        student_id: formData.student_id,
        department: formData.department || null,
        verified: formData.verified,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (isUpdate && initialData?.id) {
        await updateUser(initialData.id, payload);
      } else {
        if (!formData.password) {
          throw new Error("Password is required for new users");
        }
        await createUser(payload);
      }

      router.push("/admin/users");
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isUpdate ? (
        <EditPageHeader
          title="Edit User"
          description="Modify existing user details."
          onDiscard={() => router.push("/admin/users")}
          onSave={(e) => {
            e.preventDefault();
            handleSave();
          }}
          isSubmitting={isLoading}
        />
      ) : (
        <CreatePageHeader
          title="Create User"
          description="Add a new user to the system."
          onDiscard={() => router.push("/admin/users")}
          onSaveAndReturn={(e) => {
            e.preventDefault();
            handleSave();
          }}
          onSave={(e) => {
            e.preventDefault();
            handleSave();
          }}
          isSubmitting={isLoading}
        />
      )}

      <div className="p-6 space-y-6">
        {error && (
          <div className="p-3 bg-destructive/15 text-destructive text-sm rounded-md font-medium">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ahsanul Hoque"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ahsanul@gighub.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Username</label>
            <Input
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="ahsanul"
              required={!isUpdate}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {isUpdate ? "Password (leave blank to keep current)" : "Password"}
            </label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••"
              required={!isUpdate}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <Select
              value={formData.role}
              onValueChange={(val: UserRole) =>
                setFormData((prev) => ({ ...prev, role: val }))
              }
            >
              <SelectTrigger className="w-full h-10 bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-none">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Department</label>
            <SearchCombobox
              items={departments}
              value={formData.department}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  department: (val as string) || "",
                }))
              }
              getItemValue={(dept) => dept.id}
              getItemLabel={(dept) =>
                `${dept.name} (${dept.acronym || dept.code})`
              }
              placeholder="Select department (Optional)"
              searchPlaceholder="Search departments..."
              clearable
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Student ID</label>
            <Input
              name="student_id"
              value={formData.student_id}
              onChange={handleChange}
              placeholder="e.g. B210305040"
            />
          </div>

          <div className="flex items-end">
            <BooleanField
              label="Verified Status"
              description="Toggle to mark the user profile as verified."
              value={formData.verified}
              onChange={(checked) =>
                setFormData((prev) => ({ ...prev, verified: checked }))
              }
              variant="switch"
              className="w-full"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
