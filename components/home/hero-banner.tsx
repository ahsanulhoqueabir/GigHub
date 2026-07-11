"use client";

import { useSiteDataStore } from "@/store/site-data.store";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

export function HeroBanner() {
  const heroBanners = useSiteDataStore((s) => s.data?.hero_banners);
  const isLoading = useSiteDataStore((s) => s.isLoading);

  const items = heroBanners ?? [];

  const [current, setCurrent] = useState(0);
  const [slideWidthPct, setSlideWidthPct] = useState(100);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = items.length;

  /* ── Track responsive slide width ──────────────────────────── */
  useEffect(() => {
    const update = () => setSlideWidthPct(window.innerWidth >= 640 ? 60 : 100);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const goTo = useCallback((index: number) => {
    setCurrent(index);
  }, []);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + total) % total);
  }, [total]);

  /* ── Auto-slide every 5 seconds ──────────────────────────── */
  useEffect(() => {
    if (total <= 1) return;
    intervalRef.current = setInterval(next, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [next, total]);

  /* ── Pause on hover ──────────────────────────────────────── */
  const pause = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);
  const resume = useCallback(() => {
    if (total <= 1) return;
    intervalRef.current = setInterval(next, 5000);
  }, [next, total]);

  /* ── Loading skeleton ────────────────────────────────────── */
  if (isLoading) {
    return (
      <section className="pb-5">
        <div className="relative aspect-21/9 w-full animate-pulse rounded-2xl bg-muted" />
      </section>
    );
  }

  if (total === 0) return null;

  return (
    <section className="pb-5 -mx-4">
      <div
        className="group relative overflow-hidden rounded"
        onMouseEnter={pause}
        onMouseLeave={resume}
      >
        {/* ── Slides ─────────────────────────────────────────── */}
        <div
          className="flex duration-700 transition-transform ease-in-out"
          style={{
            transform: `translateX(-${current * slideWidthPct}%)`,
          }}
        >
          {items.map((banner) => (
            <div
              key={banner.id}
              className="relative shrink-0 w-full sm:w-[60%] "
            >
              <div className="relative aspect-16/6">
                <Image
                  src={banner.image_url}
                  alt={banner.alt_text || banner.title}
                  className="object-cover "
                  priority
                  fill
                />
              </div>

              {/* ── Rope-style divider between slides ──────────── */}
              {banner.id !== items[items.length - 1].id && (
                <div className="pointer-events-none absolute inset-y-0 -right-6 z-10 hidden w-10 sm:block">
                  <svg
                    viewBox="0 0 24 100"
                    preserveAspectRatio="none"
                    className="h-full w-full"
                  >
                    <defs>
                      <linearGradient id="ropeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="25%" stopColor="#3b82f6" />
                        <stop offset="50%" stopColor="#a855f7" />
                        <stop offset="75%" stopColor="#22c55e" />
                        <stop offset="100%" stopColor="#ef4444" />
                      </linearGradient>
                    </defs>
                    {/* Zigzag rope pattern */}
                    <path
                      d="M12,0 L4,10 L12,20 L4,30 L12,40 L4,50 L12,60 L4,70 L12,80 L4,90 L12,100"
                      stroke="url(#ropeGrad)"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14,0 L6,10 L14,20 L6,30 L14,40 L6,50 L14,60 L6,70 L14,80 L6,90 L14,100"
                      stroke="url(#ropeGrad)"
                      strokeWidth="1.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.6"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Prev / Next buttons ────────────────────────────── */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous banner"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/70 p-1.5 text-foreground opacity-0 shadow transition hover:bg-background group-hover:opacity-100"
            >
              <IconChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next banner"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/70 p-1.5 text-foreground opacity-0 shadow transition hover:bg-background group-hover:opacity-100"
            >
              <IconChevronRight className="size-5" />
            </button>
          </>
        )}

        {/* ── Dot indicators ─────────────────────────────────── */}
        {total > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            {items.map((banner, i) => (
              <button
                key={banner.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to banner ${i + 1}`}
                className={`size-2 rounded-full transition-all ${
                  i === current
                    ? "w-5 bg-primary"
                    : "bg-background/60 hover:bg-background/80"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
