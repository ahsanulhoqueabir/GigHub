import { branding } from "@/config/brand.config";
import {
  IconBrandFacebook,
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandTwitter,
  IconMail,
  IconMapPin,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

const socialIcons: Record<string, React.ElementType> = {
  github: IconBrandGithub,
  facebook: IconBrandFacebook,
  twitter: IconBrandTwitter,
  instagram: IconBrandInstagram,
  linkedin: IconBrandLinkedin,
};

const quickLinks = [
  { label: "Gigs", href: "/gigs" },
  { label: "Jobs", href: "/jobs" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const supportLinks = [
  { label: "Help Center", href: "/help" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Safety Guidelines", href: "/safety" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <Link
              href="/"
              className="text-lg font-semibold tracking-tight text-foreground"
            >
              {branding.logo ? (
                <Image
                  src={branding.logo}
                  alt={branding.title}
                  className="h-7 w-auto"
                  height={16}
                  width={16}
                />
              ) : (
                branding.title
              )}
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {branding.name}
            </p>
            {/* Social Media */}
            <div className="flex items-center gap-2 pt-1">
              {Object.entries(branding.socialMedia).map(([key, url]) => {
                if (!url) return null;
                const Icon = socialIcons[key];
                if (!Icon) return null;
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label={key}
                  >
                    <Icon className="size-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Support</h3>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Contact</h3>
            <ul className="space-y-2">
              {branding.contacts.email && (
                <li>
                  <a
                    href={`mailto:${branding.contacts.email}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <IconMail className="size-4 shrink-0" />
                    {branding.contacts.email}
                  </a>
                </li>
              )}
              {branding.contacts.address && (
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <IconMapPin className="mt-0.5 size-4 shrink-0" />
                  <span>{branding.contacts.address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          <p>
            &copy; {currentYear} {branding.title}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
