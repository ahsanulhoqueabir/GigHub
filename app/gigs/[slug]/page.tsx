"use client";

import { DetailsSkeleton } from "@/components/shared/details-skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BackButton } from "@/components/ui/back-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrency } from "@/hooks/use-currency";
import { useReturnTo } from "@/hooks/use-return-to";
import { formatDateInTimezone } from "@/lib/date.utils";
import { selectIsAuthenticated, useAuthStore } from "@/store/auth.store";
import { useGigsStore } from "@/store/gigs.store";
import {
  IconCalendar,
  IconCheck,
  IconClock,
  IconEye,
  IconMessageQuestion,
  IconRefresh,
  IconShoppingCart,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function GigDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { withReturnTo } = useReturnTo();

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
      <div>
        <DetailsSkeleton />
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="">
        <p className="text-muted-foreground">Gig not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/gigs">Back to Gigs</Link>
        </Button>
      </div>
    );
  }

  const isOwner = user?.id === gig.seller.id;

  return (
    <div className="">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* Left Column — Images + Details */}
        <div className="space-y-6 lg:col-span-3">
          {/* Back Button (Left) + Title */}
          <div className="flex items-start gap-3">
            <BackButton href="/gigs" />
            <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
              {gig.title}
            </h1>
          </div>

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

          {/* Meta */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {gig.category && (
                <Link href={`/gigs?category=${gig.category.id}`} scroll={false}>
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:opacity-80"
                  >
                    {gig.category.name}
                  </Badge>
                </Link>
              )}
              <Badge
                variant="outline"
                className="text-green-600 dark:text-green-400"
              >
                {gig.status}
              </Badge>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar size="sm">
                  <AvatarImage
                    src={gig.seller.avatar ?? undefined}
                    alt={gig.seller.name}
                  />
                  <AvatarFallback>{gig.seller.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <Link
                  href={`/gigs?seller=${gig.seller.username}`}
                  scroll={false}
                  className="hover:text-foreground transition-colors"
                >
                  {gig.seller.name}
                  {gig.seller.verified && (
                    <span className="ml-1 text-primary">✓</span>
                  )}
                </Link>
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
                  <Link key={tag} href={`/gigs?tags=${tag}`} scroll={false}>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-muted transition-colors"
                    >
                      {tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* FAQ — Accordion */}
          {gig.faq && gig.faq.length > 0 && (
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
                <IconMessageQuestion className="size-5" />
                FAQ
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {gig.faq.map((item, idx) => (
                  <AccordionItem key={idx} value={`faq-${idx}`}>
                    <AccordionTrigger className="text-sm font-medium text-foreground">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </div>

        {/* Right Column — Packages + CTA */}
        <div className="space-y-6 lg:col-span-2">
          {/* Package Selector — Tab based */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-4 text-base font-semibold text-foreground">
              Select Package
            </h2>

            <Tabs
              value={selectedPackage}
              onValueChange={(v) => setSelectedPackage(v)}
            >
              <TabsList className="grid w-full grid-cols-3">
                {gig.packages?.map((pkg) => (
                  <TabsTrigger key={pkg.tier} value={pkg.tier}>
                    {pkg.tier}
                  </TabsTrigger>
                ))}
              </TabsList>

              {gig.packages?.map((pkg) => (
                <TabsContent key={pkg.tier} value={pkg.tier} className="mt-4">
                  <h3 className="mb-3 text-lg font-semibold text-foreground">
                    {pkg.title}
                  </h3>
                  {/* Price & Delivery Row */}
                  <div className="mb-4 ">
                    <div>
                      <span className="text-2xl font-bold text-foreground">
                        {pkg.price != null ? format(pkg.price) : "—"}
                      </span>
                      {pkg.delivery_days && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          one-time payment
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs ">
                      {pkg.delivery_days && (
                        <span className="flex items-center gap-1">
                          <IconClock className="size-3.5" />
                          {pkg.delivery_days} days
                        </span>
                      )}
                      {pkg.revisions && (
                        <span className="flex items-center gap-1">
                          <IconRefresh className="size-3.5" />
                          {pkg.revisions} revisions
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="mb-4 text-sm text-muted-foreground">
                    {pkg.description}
                  </p>

                  {/* Features */}
                  {pkg.features && pkg.features.length > 0 && (
                    <div className="space-y-2 rounded-lg bg-muted/30 p-3">
                      <p className="text-xs font-medium text-foreground">
                        What&apos;s included:
                      </p>
                      {pkg.features.map((feat, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <IconCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
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
                    : withReturnTo("/login")
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
                <Link
                  href={`/gigs?seller=${gig.seller.id}`}
                  scroll={false}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  @{gig.seller.username}
                </Link>
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
