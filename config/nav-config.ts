import {
  IconAd,
  IconBell,
  IconBriefcase,
  IconBuilding,
  IconCategory,
  IconHome,
  IconMail,
  IconPhoto,
  IconPlus,
  IconSettings,
  IconShoppingCart,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";

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
      {
        id: "categories-create",
        label: "Create",
        href: "/admin/categories/create",
      },
    ],
  },
  {
    id: "departments",
    label: "Departments",
    href: "/admin/departments",
    icon: IconBuilding,
    children: [
      { id: "departments-list", label: "List", href: "/admin/departments" },
      {
        id: "departments-create",
        label: "Create",
        href: "/admin/departments/create",
      },
    ],
  },
  {
    id: "system",
    label: "System",
    href: "/admin/system",
    icon: IconSettings,
  },
  {
    id: "hero-banners",
    label: "Hero Banners",
    href: "/admin/hero-banners",
    icon: IconPhoto,
    children: [
      {
        id: "hero-banners-list",
        label: "List",
        href: "/admin/hero-banners",
      },
      {
        id: "hero-banners-create",
        label: "Create",
        href: "/admin/hero-banners/create",
      },
    ],
  },
  {
    id: "ad-banners",
    label: "Ad Banners",
    href: "/admin/ad-banners",
    icon: IconAd,
    children: [
      {
        id: "ad-banners-list",
        label: "List",
        href: "/admin/ad-banners",
      },
      {
        id: "ad-banners-create",
        label: "Create",
        href: "/admin/ad-banners/create",
      },
    ],
  },
  {
    id: "announcements",
    label: "Announcements",
    href: "/admin/announcements",
    icon: IconBell,
    children: [
      {
        id: "announcements-list",
        label: "List",
        href: "/admin/announcements",
      },
      {
        id: "announcements-create",
        label: "Create",
        href: "/admin/announcements/create",
      },
    ],
  },
];

/**
 * Profile navigation items — shown in the header's profile dropdown / mobile menu.
 */
export const profileNavConfig: NavItem[] = [
  { id: "profile", label: "Profile", href: "/profile", icon: IconUser },
  {
    id: "applied-jobs",
    label: "Applied Jobs",
    href: "/profile/applied-jobs",
    icon: IconBriefcase,
  },
  {
    id: "incoming-proposals",
    label: "Incoming Proposals",
    href: "/profile/incoming-proposals",
    icon: IconMail,
  },
  {
    id: "orders",
    label: "Orders",
    href: "/profile/orders",
    icon: IconShoppingCart,
  },
  {
    id: "create-gig",
    label: "Create Gig",
    href: "/profile/gigs/create",
    icon: IconPlus,
  },
  {
    id: "manage-gigs",
    label: "Manage Gigs",
    href: "/profile/gigs",
    icon: IconBriefcase,
  },
  {
    id: "create-job",
    label: "Create Job",
    href: "/profile/jobs/create",
    icon: IconPlus,
  },
  {
    id: "manage-jobs",
    label: "Manage Jobs",
    href: "/profile/jobs",
    icon: IconBriefcase,
  },
];
