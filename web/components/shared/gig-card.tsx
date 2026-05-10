"use client";

import { useState } from "react";
import Link from "next/link";
import { Gig } from "@/types/db/gig.types";
import {
  selectGigStartingPrice,
  selectGigMinDelivery,
} from "@/store/gig.store";
import { useAuthStore, selectIsAuthenticated } from "@/store/auth.store";
import { IconStar, IconClock, IconShoppingCart } from "@tabler/icons-react";
import Image from "next/image";
import { AuthModal } from "@/components/shared/auth-modal";

interface GigCardProps {
  gig: Gig;
}

export function GigCard({ gig }: GigCardProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const isAuthenticated = useAuthStore((s) => selectIsAuthenticated(s));

  const startingPrice = selectGigStartingPrice(gig);
  const minDelivery = selectGigMinDelivery(gig);

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

  const thumbnail =
    gig.images && gig.images.length > 0
      ? gig.images.find((img) => img.sort_order === 0)?.url ||
        gig.images[0]?.url
      : null;

  const handleClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      setShowAuthModal(true);
    }
  };

  return (
    <>
      <Link
        href={`/gigs/${gig.slug}`}
        onClick={handleClick}
        className="group block rounded-xl border border-border bg-card overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/20"
      >
        {/* Thumbnail */}
        <div className="relative aspect-16/10 bg-muted overflow-hidden">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={gig.title}
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              width={400}
              height={250}
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <IconShoppingCart size={40} stroke={1.5} />
            </div>
          )}

          {/* Category badge */}
          {categoryName && (
            <span className="absolute top-2 left-2 rounded-md bg-background/80 backdrop-blur-sm px-2 py-0.5 text-xs font-medium text-foreground">
              {categoryName}
            </span>
          )}

          {/* Rating badge */}
          {gig.avg_rating > 0 && (
            <span className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-background/80 backdrop-blur-sm px-2 py-0.5 text-xs font-medium text-foreground">
              <IconStar size={12} className="text-amber-500 fill-amber-500" />
              {gig.avg_rating.toFixed(1)}
              {gig.total_reviews > 0 && (
                <span className="text-muted-foreground">
                  ({gig.total_reviews})
                </span>
              )}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4">
          {/* Seller info */}
          <div className="flex items-center gap-2 mb-2">
            {sellerAvatar ? (
              <Image
                src={sellerAvatar}
                alt={sellerName}
                className="size-5 rounded-full object-cover"
                width={20}
                height={20}
              />
            ) : (
              <div className="size-5 rounded-full bg-muted-foreground/20 flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                {sellerName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-xs text-muted-foreground truncate">
              {sellerName}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-snug">
            {gig.title}
          </h3>

          {/* Tags */}
          {gig.tags && gig.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {gig.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-block rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="my-2 sm:my-3 border-t border-border" />

          {/* Footer: delivery & price */}
          <div className="flex items-center justify-between">
            {minDelivery > 0 && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <IconClock size={12} />
                {minDelivery} day{minDelivery > 1 ? "s" : ""}
              </span>
            )}
            <span className="text-sm font-semibold text-foreground ml-auto">
              From ${startingPrice.toLocaleString()}
            </span>
          </div>
        </div>
      </Link>

      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message="Please log in to view gig details."
      />
    </>
  );
}
