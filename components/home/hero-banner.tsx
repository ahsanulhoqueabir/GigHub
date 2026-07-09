"use client";

import { banners } from "@/config/site.config";
import Image from "next/image";

export function HeroBanner() {
  if (banners.length === 0) return null;

  return (
    <section className="pb-5">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[2fr_1fr] h-48">
        {/* First banner — full width area */}
        <div className="relative aspect-21/9 w-full overflow-hidden rounded-2xl bg-muted sm:aspect-21/9 lg:aspect-auto">
          <Image
            src={banners[0].path}
            alt={banners[0].title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Second banner — half width area (hidden on mobile) */}
        {banners.length > 1 && (
          <div className="relative aspect-21/9 w-full overflow-hidden rounded-2xl bg-muted sm:aspect-21/9 lg:aspect-auto max-lg:hidden">
            <Image
              src={banners[1].path}
              alt={banners[1].title}
              fill
              className="object-cover"
            />
          </div>
        )}
      </div>
    </section>
  );
}
