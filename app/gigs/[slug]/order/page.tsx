"use client";

import { BackButton } from "@/components/ui/back-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useCurrency } from "@/hooks/use-currency";
import { cn } from "@/lib/utils";
import { useGigsStore } from "@/store/gigs.store";
import type { GIGPackageTier } from "@/types/db/gig.types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconClock,
  IconInfoCircle,
  IconRefresh,
  IconShoppingCart,
  IconStar,
} from "@tabler/icons-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const TIER_META: Record<
  GIGPackageTier,
  { label: string; color: string; icon: typeof IconStar }
> = {
  BASIC: {
    label: "Basic",
    color:
      "border-gray-200 data-[state=checked]:border-gray-400 data-[state=checked]:ring-2 data-[state=checked]:ring-gray-400/30",
    icon: IconStar,
  },
  STANDARD: {
    label: "Standard",
    color:
      "border-blue-200 data-[state=checked]:border-blue-500 data-[state=checked]:ring-2 data-[state=checked]:ring-blue-500/30",
    icon: IconStar,
  },
  PREMIUM: {
    label: "Premium",
    color:
      "border-amber-200 data-[state=checked]:border-amber-500 data-[state=checked]:ring-2 data-[state=checked]:ring-amber-500/30",
    icon: IconStar,
  },
};

const orderSchema = z.object({
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000),
  note: z.string().max(1000).optional(),
});

type OrderForm = z.infer<typeof orderSchema>;

export default function GigOrderPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug as string;

  const gig = useGigsStore((s) => s.orderGig);
  const loading = useGigsStore((s) => s.isLoadingOrderGig);
  const isMutating = useGigsStore((s) => s.isMutating);
  const fetchOrderGig = useGigsStore((s) => s.fetchOrderGig);
  const createGigOrder = useGigsStore((s) => s.createGigOrder);

  const [selectedTier, setSelectedTier] = useState<GIGPackageTier>(
    (searchParams.get("package") as GIGPackageTier) ?? "BASIC",
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderForm>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      description: "",
      note: "",
    },
  });

  useEffect(() => {
    if (slug) fetchOrderGig(slug);
  }, [slug, fetchOrderGig]);

  const { format } = useCurrency();
  const selectedPkg =
    gig?.packages?.find((p) => p.tier === selectedTier) ?? gig?.packages?.[0];

  const onSubmit = async (formData: OrderForm) => {
    if (!gig) return;

    try {
      await createGigOrder({
        gig: gig.id,
        package: selectedTier,
        description: formData.description,
        note: formData.note || undefined,
      });

      toast.success("Order placed successfully!");
      router.push("/profile/orders");
    } catch {
      toast.error("Failed to place order. Please try again.");
    }
  };

  if (loading) {
    return (
      <div>
        <Skeleton className="mb-6 h-6 w-32" />
        <Skeleton className="mb-4 h-8 w-72" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
        <Skeleton className="mt-6 h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <p className="text-muted-foreground">Gig not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/gigs">Back to Gigs</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="">
      {/* Gig header with inline back button */}
      <div className="mb-8 flex items-center gap-3">
        <BackButton href={`/gigs/${slug}`} />
        <div>
          <h1 className="text-2xl font-bold text-foreground">{gig.title}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            by{" "}
            <span className="font-medium text-foreground">
              {gig.seller.name}
            </span>
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* ─── Left column: Package selection + Form ──────────── */}
        <div className="space-y-8">
          {/* Package Selection */}
          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">
              Choose a Package
            </h2>
            <RadioGroup
              value={selectedTier}
              onValueChange={(v) => setSelectedTier(v as GIGPackageTier)}
              className="grid gap-3 sm:grid-cols-3"
            >
              {gig.packages.map((pkg) => {
                const meta = TIER_META[pkg.tier];
                const isSelected = selectedTier === pkg.tier;
                const pkgId = `pkg-${pkg.tier.toLowerCase()}`;
                return (
                  <div key={pkg.tier}>
                    <RadioGroupItem
                      value={pkg.tier}
                      id={pkgId}
                      className="peer sr-only"
                    />
                    <label
                      htmlFor={pkgId}
                      className={cn(
                        "block cursor-pointer rounded-xl border-2 bg-card p-4 transition-all hover:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
                        meta.color,
                        isSelected
                          ? "bg-primary/20 border-primary"
                          : "border-border",
                      )}
                    >
                      <div className="space-y-2">
                        <Badge
                          variant={
                            pkg.tier === "PREMIUM"
                              ? "default"
                              : pkg.tier === "STANDARD"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {meta.label}
                        </Badge>
                        <p className="text-lg font-bold text-foreground">
                          {pkg.price != null ? format(pkg.price) : "—"}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {pkg.description}
                        </p>
                        <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
                          {pkg.delivery_days != null && (
                            <span className="flex items-center gap-1">
                              <IconClock className="size-3" />
                              {pkg.delivery_days} days
                            </span>
                          )}
                          {pkg.revisions != null && (
                            <span className="flex items-center gap-1">
                              <IconRefresh className="size-3" />
                              {pkg.revisions} revisions
                            </span>
                          )}
                        </div>
                      </div>
                    </label>
                  </div>
                );
              })}
            </RadioGroup>
          </section>

          {/* Order Form */}
          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">
              Order Details
            </h2>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
              id="order-form"
            >
              {/* Description */}
              <div>
                <Label htmlFor="description">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe what you need in detail..."
                  rows={4}
                  className="mt-1.5"
                  {...register("description")}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Note */}
              <div>
                <Label htmlFor="note">
                  Note to Seller{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="note"
                  placeholder="Any special instructions..."
                  rows={3}
                  className="mt-1.5"
                  {...register("note")}
                />
                {errors.note && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.note.message}
                  </p>
                )}
              </div>
            </form>
          </section>
        </div>

        {/* ─── Right column: Order summary sidebar ────────────── */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selected package highlight */}
              {selectedPkg && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        selectedPkg.tier === "PREMIUM"
                          ? "default"
                          : selectedPkg.tier === "STANDARD"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {TIER_META[selectedPkg.tier].label}
                    </Badge>
                    {selectedPkg.price != null && (
                      <span className="text-lg font-bold text-foreground">
                        {format(selectedPkg.price)}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {selectedPkg.title}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    {selectedPkg.delivery_days != null && (
                      <span className="flex items-center gap-1">
                        <IconClock className="size-3.5" />
                        {selectedPkg.delivery_days} days delivery
                      </span>
                    )}
                    {selectedPkg.revisions != null && (
                      <span className="flex items-center gap-1">
                        <IconRefresh className="size-3.5" />
                        {selectedPkg.revisions} revisions
                      </span>
                    )}
                  </div>
                  {selectedPkg.features && selectedPkg.features.length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {selectedPkg.features.map((f, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground"
                        >
                          <IconStar className="size-3 shrink-0 text-primary" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Gig info */}
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gig</span>
                  <span className="font-medium text-foreground text-right max-w-50 truncate">
                    {gig.title}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seller</span>
                  <span className="font-medium text-foreground">
                    {gig.seller.name}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-border" />

              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">
                  Total
                </span>
                <span className="text-xl font-bold text-foreground">
                  {selectedPkg?.price != null ? format(selectedPkg.price) : "—"}
                </span>
              </div>

              {/* Info notice */}
              <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                <IconInfoCircle className="mt-0.5 size-4 shrink-0" />
                <span>
                  By placing this order, you agree to the GigHub terms of
                  service. An escrow will be created to secure your payment.
                </span>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                form="order-form"
                className="w-full"
                size="lg"
                disabled={isMutating}
              >
                {isMutating ? (
                  "Placing Order..."
                ) : (
                  <>
                    <IconShoppingCart className="mr-1.5 size-4" />
                    Place Order
                    {selectedPkg?.price != null && (
                      <span className="ml-1.5">
                        — {format(selectedPkg.price)}
                      </span>
                    )}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
