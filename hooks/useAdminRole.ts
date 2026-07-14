import { useAuthStore } from "@/store/auth.store";

export function useAdminRole() {
  const { user } = useAuthStore();

  const role = typeof user?.role === "string" ? user.role.toUpperCase() : undefined;

  return {
    isAdmin: role === "ADMIN",
    isUser: role === "USER",
    isStudent: role === "STUDENT",
    isTeacher: role === "TEACHER",
    user,
  };
}
