import {
  IconHome,
  IconBriefcase,
  IconSearch,
  IconCategory,
  IconMessage,
  IconUser,
  IconSettings,
  IconFileDescription,
  IconBrandGithub,
  IconBrandX,
  IconMail,
} from "@tabler/icons-react";
import type { ComponentType } from "react";

export interface MenuItem {
  name: string;
  icon: ComponentType<{ className?: string; size?: number }>;
  href: string;
}

export interface FooterLinkGroup {
  title: string;
  links: { label: string; href: string }[];
}

export interface SocialLink {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string; size?: number }>;
}

/** Top navigation & desktop sidebar menu (public items only) */
export const menu: MenuItem[] = [
  { name: "Home", icon: IconHome, href: "/" },
  { name: "Browse Gigs", icon: IconSearch, href: "/gigs" },
  { name: "Categories", icon: IconCategory, href: "/categories" },
];

/** User menu items — shown inside the profile dropdown when logged in */
export const userMenu: MenuItem[] = [
  { name: "Profile", icon: IconUser, href: "/profile" },
  { name: "Messages", icon: IconMessage, href: "/messages" },
  { name: "Orders", icon: IconBriefcase, href: "/orders" },
  { name: "My Gigs", icon: IconFileDescription, href: "/my-gigs" },
  { name: "My Jobs", icon: IconBriefcase, href: "/my-jobs" },
  { name: "Settings", icon: IconSettings, href: "/settings" },
];

/** Bottom navigation items for mobile */
export const bottomNav: MenuItem[] = [
  { name: "Home", icon: IconHome, href: "/" },
  { name: "Explore", icon: IconSearch, href: "/gigs" },
  { name: "Orders", icon: IconBriefcase, href: "/orders" },
  { name: "Messages", icon: IconMessage, href: "/messages" },
  { name: "Profile", icon: IconUser, href: "/profile" },
];

/** Footer link groups */
export const footerLinks: FooterLinkGroup[] = [
  {
    title: "Platform",
    links: [
      { label: "Browse Gigs", href: "/gigs" },
      { label: "Categories", href: "/categories" },
      { label: "How it works", href: "/how-it-works" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

/** Social media links shown in footer */
export const socialLinks: SocialLink[] = [
  { label: "GitHub", href: "https://github.com/gighub", icon: IconBrandGithub },
  { label: "X (Twitter)", href: "https://x.com/gighub", icon: IconBrandX },
  { label: "Email", href: "mailto:hello@gighub.com", icon: IconMail },
];

/** Site-wide settings */
export const siteConfig = {
  name: "GigHub",
  description: "A modern freelancing marketplace",
  tagline: "Connect. Collaborate. Create.",
};
