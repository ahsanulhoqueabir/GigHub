"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCurrency } from "@/hooks/use-currency";
import { GigListItem } from "@/types/db/gig.types";
import { IconEye } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

interface GigCardProps {
  gig: GigListItem;
}

export function GigCard({ gig }: GigCardProps) {
  const { format } = useCurrency();
  const lowestPrice = gig.packages
    ?.map((p) => p.price)
    .filter((p): p is number => p != null)
    .sort((a, b) => a - b)[0];

  const thumbnail = gig.images?.[0];

  return (
    <Link href={`/gigs/${gig.slug}`} className="block group h-full">
      <Card className="overflow-hidden transition-shadow hover:shadow-md h-full flex flex-col">
        {/* Thumbnail */}
        <div className="relative aspect-16/10 overflow-hidden bg-accent/10">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={gig.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground/40">
              <IconEye className="size-10" />
            </div>
          )}
          {gig.category && (
            <Badge
              variant="secondary"
              className="absolute left-2 top-2 bg-primary text-white backdrop-blur-sm"
            >
              {gig.category.name}
            </Badge>
          )}
        </div>

        <CardContent className="space-y-2.5 flex-1 flex flex-col">
          {/* Seller */}
          <div className="flex items-center gap-2">
            <Avatar size="sm">
              <AvatarImage
                src={gig.seller.avatar ?? undefined}
                alt={gig.seller.name}
              />
              <AvatarFallback>{gig.seller.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="truncate text-xs text-muted-foreground">
              {gig.seller.name}
              {gig.seller.verified && (
                <span className="ml-1 text-primary">✓</span>
              )}
            </span>
          </div>

          {/* Title */}
          <h3 className="line-clamp-2 text-sm font-medium text-foreground group-hover:text-primary transition-colors">
            {gig.title}
          </h3>

          {/* Tags */}
          {gig.tags && gig.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {gig.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Bottom Row: Views + Price */}
          <div className="flex items-center justify-between pt-1 mt-auto">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <IconEye className="size-3" />
              <span>{gig.views}</span>
            </div>
            {lowestPrice != null && (
              <span className="text-sm font-semibold text-foreground">
                From {format(lowestPrice, 0)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
