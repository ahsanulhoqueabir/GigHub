import { IconHome, IconUsers, IconCategory, IconBuilding } from "@tabler/icons-react";

export type NavItem = {
  id: string;
  label: string;
  href: string;
  icon?: React.ElementType;
  children?: NavItem[];
  permission?: string;
  hidden?: boolean;
};

export const adminNavConfig: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/admin",
    icon: IconHome,
  },
  {
    id: "users",
    label: "Users",
    href: "/admin/users",
    icon: IconUsers,
    children: [
      { id: "users-list", label: "List", href: "/admin/users" },
      { id: "users-create", label: "Create", href: "/admin/users/create" },
    ],
  },
  {
    id: "categories",
    label: "Categories",
    href: "/admin/categories",
    icon: IconCategory,
    children: [
      { id: "categories-list", label: "List", href: "/admin/categories" },
      { id: "categories-create", label: "Create", href: "/admin/categories/create" },
    ],
  },
  {
    id: "departments",
    label: "Departments",
    href: "/admin/departments",
    icon: IconBuilding,
    children: [
      { id: "departments-list", label: "List", href: "/admin/departments" },
      { id: "departments-create", label: "Create", href: "/admin/departments/create" },
    ],
  },
];
