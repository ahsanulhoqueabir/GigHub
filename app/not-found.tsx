import { IconHome, IconMoodSad, IconSearch } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404 - Page Not Found - GigHub",
  description: "The page you're looking for doesn't exist or has been moved.",
};

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-primary/10">
          <IconMoodSad className="size-10 text-primary" />
        </div>

        {/* Status */}
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
          404 Error
        </p>

        {/* Heading */}
        <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Page not found
        </h1>

        {/* Description */}
        <p className="mb-8 text-base leading-relaxed text-muted-foreground">
          Oops! The page you&apos;re looking for doesn&apos;t exist, has been
          moved, or is temporarily unavailable. Let&apos;s get you back on
          track.
        </p>

        {/* Actions */}
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            <IconHome className="size-4" />
            Go Home
          </Link>
          <Link
            href="/gigs"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <IconSearch className="size-4" />
            Browse Gigs
          </Link>
        </div>

        {/* Help link */}
        <p className="mt-8 text-sm text-muted-foreground">
          Need help? Visit our{" "}
          <Link
            href="/help"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Help Center
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
