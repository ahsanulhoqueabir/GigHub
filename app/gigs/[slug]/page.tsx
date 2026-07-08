"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  IconEye,
  IconCalendar,
  IconCheck,
  IconArrowLeft,
  IconShoppingCart,
  IconMessageQuestion,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { DetailsSkeleton } from "@/components/shared/details-skeleton";
import { formatDateInTimezone } from "@/lib/date.utils";
import { useAuthStore, selectIsAuthenticated } from "@/store/auth.store";
import { useGigsStore } from "@/store/gigs.store";
import { useCurrency } from "@/hooks/use-currency";

export default function GigDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const gig = useGigsStore((s) => s.currentGig);
  const loading = useGigsStore((s) => s.isLoadingDetail);
  const fetchGigBySlug = useGigsStore((s) => s.fetchGigBySlug);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState<string>("BASIC");

  const user = useAuthStore((s) => s.user);
  const isAuthenticated = selectIsAuthenticated(useAuthStore.getState());
  const { format } = useCurrency();

  useEffect(() => {
    if (slug) fetchGigBySlug(slug);
  }, [slug, fetchGigBySlug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <DetailsSkeleton />
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <p className="text-muted-foreground">Gig not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/gigs">Back to Gigs</Link>
        </Button>
      </div>
    );
  }

  const currentPkg =
    gig.packages?.find((p) => p.tier === selectedPackage) ?? gig.packages?.[0];
  const isOwner = user?.id === gig.seller.id;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Back Button */}
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link href="/gigs">
          <IconArrowLeft className="mr-1 size-4" />
          Back to Gigs
        </Link>
      </Button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column — Images + Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Image Gallery */}
          {gig.images && gig.images.length > 0 && (
            <div className="space-y-3">
              <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
                <Image
                  src={gig.images[selectedImage]}
                  alt={gig.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                />
              </div>
              {gig.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {gig.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                        idx === selectedImage
                          ? "border-primary"
                          : "border-transparent hover:border-muted-foreground/30"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${gig.title} ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Title & Meta */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {gig.category && (
                <Badge variant="secondary">{gig.category.name}</Badge>
              )}
              <Badge
                variant="outline"
                className="text-green-600 dark:text-green-400"
              >
                {gig.status}
              </Badge>
            </div>
            <h1 className="mt-3 text-2xl font-semibold text-foreground sm:text-3xl">
              {gig.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar size="sm">
                  <AvatarImage
                    src={gig.seller.avatar ?? undefined}
                    alt={gig.seller.name}
                  />
                  <AvatarFallback>{gig.seller.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>
                  {gig.seller.name}
                  {gig.seller.verified && (
                    <span className="ml-1 text-primary">✓</span>
                  )}
                </span>
              </div>
              <span className="flex items-center gap-1">
                <IconCalendar className="size-3.5" />
                {formatDateInTimezone(gig.created_at)}
              </span>
              <span className="flex items-center gap-1">
                <IconEye className="size-3.5" />
                {gig.views} views
              </span>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Description
            </h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {gig.description}
            </p>
          </div>

          {/* Tags */}
          {gig.tags && gig.tags.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-semibold text-foreground">
                Tags
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {gig.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* FAQ */}
          {gig.faq && gig.faq.length > 0 && (
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
                <IconMessageQuestion className="size-5" />
                FAQ
              </h2>
              <div className="space-y-3">
                {gig.faq.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-border bg-muted/30 p-4"
                  >
                    <p className="text-sm font-medium text-foreground">
                      Q: {item.question}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      A: {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column — Packages + CTA */}
        <div className="space-y-6">
          {/* Package Selector */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 text-base font-semibold text-foreground">
              Select Package
            </h2>
            <div className="space-y-2">
              {gig.packages?.map((pkg) => (
                <button
                  key={pkg.tier}
                  onClick={() => setSelectedPackage(pkg.tier)}
                  className={`w-full rounded-lg border-2 p-3 text-left transition-colors ${
                    selectedPackage === pkg.tier
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {pkg.title}
                    </span>
                    {pkg.price != null && (
                      <span className="text-sm font-bold text-foreground">
                        {format(pkg.price)}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {pkg.description}
                  </p>
                  {pkg.delivery_days && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Delivery: {pkg.delivery_days} days
                    </p>
                  )}
                  {pkg.revisions && (
                    <p className="text-xs text-muted-foreground">
                      Revisions: {pkg.revisions}
                    </p>
                  )}
                </button>
              ))}
            </div>

            {/* Features */}
            {currentPkg?.features && currentPkg.features.length > 0 && (
              <div className="mt-4 space-y-1.5">
                <p className="text-xs font-medium text-foreground">
                  What&apos;s included:
                </p>
                {currentPkg.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-xs text-muted-foreground"
                  >
                    <IconCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CTA */}
          {!isOwner && (
            <Button
              asChild
              className="w-full"
              size="lg"
              disabled={!isAuthenticated}
            >
              <Link
                href={
                  isAuthenticated
                    ? `/gigs/${gig.slug}/order?package=${selectedPackage}`
                    : "/login"
                }
              >
                <IconShoppingCart className="mr-1.5 size-4" />
                {isAuthenticated ? "Continue to Order" : "Sign in to Order"}
              </Link>
            </Button>
          )}
          {!isAuthenticated && (
            <p className="text-center text-xs text-muted-foreground">
              You need to sign in to order this gig.
            </p>
          )}
          {isOwner && (
            <p className="text-center text-xs text-muted-foreground">
              You cannot order your own gig.
            </p>
          )}

          {/* Seller Info */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              About the Seller
            </h2>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage
                  src={gig.seller.avatar ?? undefined}
                  alt={gig.seller.name}
                />
                <AvatarFallback>{gig.seller.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {gig.seller.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  @{gig.seller.username}
                </p>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Member since {formatDateInTimezone(gig.seller.created_at)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
