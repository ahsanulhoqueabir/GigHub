"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  IconStar,
  IconClock,
  IconShoppingCart,
  IconArrowLeft,
  IconEye,
  IconHeart,
  IconShare,
  IconCheck,
  IconLoader2,
  IconUser,
} from "@tabler/icons-react";
import { useGigsStore, selectGigStartingPrice } from "@/store/gig.store";
import { Button } from "@/components/ui/button";
import type { GigPackage } from "@/types/db/gig.types";

export default function GigDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const selectedGig = useGigsStore((s) => s.selectedGig);
  const isFetchingDetail = useGigsStore((s) => s.isFetchingDetail);
  const error = useGigsStore((s) => s.error);
  const fetchGigBySlug = useGigsStore((s) => s.fetchGigBySlug);
  const clearSelectedGig = useGigsStore((s) => s.clearSelectedGig);
  const clearError = useGigsStore((s) => s.clearError);

  useEffect(() => {
    if (slug) {
      fetchGigBySlug(slug);
    }
    return () => {
      clearSelectedGig();
      clearError();
    };
  }, [slug, fetchGigBySlug, clearSelectedGig, clearError]);

  // ── Loading state ──────────────────────────────────────────────
  if (isFetchingDetail) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <IconLoader2 size={36} className="animate-spin" />
          <p className="text-sm">Loading gig details...</p>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────
  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <IconShoppingCart
            size={48}
            className="text-muted-foreground/40 mb-4"
          />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Gig not found
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-md">{error}</p>
          <Button asChild>
            <Link href="/gigs">Browse Gigs</Link>
          </Button>
        </div>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────
  if (!selectedGig) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <IconLoader2 size={28} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ── Derived data ───────────────────────────────────────────────
  const gig = selectedGig;

  const sellerName =
    typeof gig.seller === "object" && gig.seller !== null
      ? (gig.seller as { name?: string; username?: string }).name ||
        (gig.seller as { name?: string; username?: string }).username ||
        "Unknown"
      : "Unknown";

  const sellerAvatar =
    typeof gig.seller === "object" && gig.seller !== null
      ? (gig.seller as { avatar?: string }).avatar
      : null;

  const categoryName =
    typeof gig.category === "object" && gig.category !== null
      ? (gig.category as { name?: string }).name
      : "";

  const startingPrice = selectGigStartingPrice(gig);
  const minDelivery = Math.min(...gig.packages.map((p) => p.delivery_days));

  const sortedPackages = [...gig.packages].sort((a, b) => {
    const order = { basic: 0, standard: 1, premium: 2 };
    return (order[a.tier] ?? 0) - (order[b.tier] ?? 0);
  });

  return (
    <div className="min-h-screen">
      {/* ── Back navigation ──────────────────────────────────── */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/gigs"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <IconArrowLeft size={16} />
            Back to Gigs
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* ═══ Left Column — Images + Info ═══════════════════ */}
          <div className="lg:col-span-3 space-y-6">
            {/* ── Image Gallery ─────────────────────────────── */}
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              {gig.images && gig.images.length > 0 ? (
                <div className="grid gap-1">
                  <div className="relative aspect-4/3 sm:aspect-16/10 bg-muted">
                    <Image
                      src={gig.images[0].url}
                      alt={gig.title}
                      className="size-full object-cover"
                      width={800}
                      height={500}
                      priority
                    />
                  </div>
                  {gig.images.length > 1 && (
                    <div className="flex gap-1 overflow-x-auto p-1">
                      {gig.images.slice(1, 5).map((img, i) => (
                        <div
                          key={i}
                          className="relative aspect-4/3 w-24 shrink-0 rounded-lg overflow-hidden bg-muted"
                        >
                          <Image
                            src={img.url}
                            alt={`${gig.title} ${i + 2}`}
                            className="size-full object-cover"
                            width={96}
                            height={72}
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex aspect-16/10 items-center justify-center text-muted-foreground bg-muted">
                  <IconShoppingCart size={56} stroke={1.5} />
                </div>
              )}
            </div>

            {/* ── Gig Info ──────────────────────────────────── */}
            <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
              {/* Category + Status */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {categoryName && (
                  <span className="rounded-md bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">
                    {categoryName}
                  </span>
                )}
                <span
                  className={`rounded-md px-2.5 py-0.5 text-xs font-medium capitalize ${
                    gig.status === "active"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {gig.status}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground leading-tight">
                {gig.title}
              </h1>

              {/* Seller row */}
              <div className="flex items-center gap-3 mt-4 pb-4 border-b border-border">
                {sellerAvatar ? (
                  <Image
                    src={sellerAvatar}
                    alt={sellerName}
                    className="size-10 rounded-full object-cover"
                    width={40}
                    height={40}
                  />
                ) : (
                  <div className="size-10 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                    <IconUser size={20} className="text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {sellerName}
                  </p>
                  <p className="text-xs text-muted-foreground">Seller</p>
                </div>

                {/* Rating */}
                {gig.avg_rating > 0 && (
                  <div className="ml-auto flex items-center gap-1.5">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <IconStar
                          key={i}
                          size={14}
                          className={
                            i < Math.round(gig.avg_rating)
                              ? "text-amber-500 fill-amber-500"
                              : "text-muted-foreground/30"
                          }
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {gig.avg_rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({gig.total_reviews})
                    </span>
                  </div>
                )}
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <IconEye size={16} />
                  {gig.view_count} views
                </span>
                <span className="flex items-center gap-1.5">
                  <IconShoppingCart size={16} />
                  {gig.total_orders} orders
                </span>
                <span className="flex items-center gap-1.5">
                  <IconClock size={16} />
                  Min. {minDelivery} day{minDelivery > 1 ? "s" : ""}
                </span>
              </div>

              {/* Description */}
              <div className="mt-5">
                <h2 className="text-base font-semibold text-foreground mb-2">
                  About This Gig
                </h2>
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {gig.description}
                </div>
              </div>

              {/* Tags */}
              {gig.tags && gig.tags.length > 0 && (
                <div className="mt-5">
                  <h2 className="text-sm font-semibold text-foreground mb-2">
                    Tags
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {gig.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ═══ Right Column — Packages + Actions ════════════ */}
          <div className="lg:col-span-2 space-y-6">
            {/* ── Action buttons ─────────────────────────────── */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5">
                <IconHeart size={16} />
                Save
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5">
                <IconShare size={16} />
                Share
              </Button>
            </div>

            {/* ── Packages ───────────────────────────────────── */}
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-foreground">
                Choose a Package
              </h2>

              {sortedPackages.map((pkg) => (
                <PackageCard key={pkg.tier} pkg={pkg} />
              ))}
            </div>

            {/* ── Summary ────────────────────────────────────── */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted-foreground">
                  Starting from
                </span>
                <span className="text-2xl font-bold text-foreground">
                  ${startingPrice.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Prices vary by package. Select a package above for details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Package Card Component ────────────────────────────────────────────────

function PackageCard({ pkg }: { pkg: GigPackage }) {
  const tierStyles: Record<
    string,
    { label: string; border: string; badge: string }
  > = {
    basic: {
      label: "Basic",
      border: "border-border",
      badge: "bg-muted text-muted-foreground",
    },
    standard: {
      label: "Standard",
      border: "border-primary/30",
      badge: "bg-primary/10 text-primary",
    },
    premium: {
      label: "Premium",
      border: "border-amber-500/30",
      badge:
        "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
    },
  };

  const style = tierStyles[pkg.tier] ?? tierStyles.basic;

  return (
    <div
      className={`rounded-xl border ${style.border} bg-card overflow-hidden transition-all hover:shadow-sm`}
    >
      {/* Header */}
      <div className="p-4 pb-3 border-b border-border">
        <div className="flex items-center justify-between mb-1">
          <span
            className={`rounded-md px-2 py-0.5 text-xs font-semibold ${style.badge}`}
          >
            {style.label}
          </span>
          <span className="text-lg font-bold text-foreground">
            ${pkg.price.toLocaleString()}
          </span>
        </div>
        <h3 className="text-sm font-semibold text-foreground">{pkg.title}</h3>
        {pkg.description && (
          <p className="text-xs text-muted-foreground mt-1">
            {pkg.description}
          </p>
        )}
      </div>

      {/* Features */}
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <IconClock size={14} />
          {pkg.delivery_days} day{pkg.delivery_days > 1 ? "s" : ""} delivery
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <IconCheck size={14} />
          {pkg.revision_count} revision{pkg.revision_count > 1 ? "s" : ""}
        </div>

        {pkg.features.length > 0 && (
          <ul className="space-y-1.5 pt-2">
            {pkg.features.map((feature, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs text-muted-foreground"
              >
                <IconCheck
                  size={14}
                  className="mt-0.5 shrink-0 text-green-500"
                />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* CTA */}
      <div className="px-4 pb-4">
        <Button className="w-full" size="sm">
          Continue (${pkg.price.toLocaleString()})
        </Button>
      </div>
    </div>
  );
}
