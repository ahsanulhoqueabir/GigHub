"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useCurrency } from "@/hooks/use-currency";
import { useGigsStore } from "@/store/gigs.store";
import { GIGPackageTier } from "@/types/db/gig.types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconArrowLeft,
  IconInfoCircle,
  IconShoppingCart,
} from "@tabler/icons-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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

  const selectedTier = searchParams.get("package") ?? "BASIC";

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
        package: selectedTier as GIGPackageTier,
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
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-4 h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
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
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link href={`/gigs/${slug}`}>
          <IconArrowLeft className="mr-1 size-4" />
          Back to Gig
        </Link>
      </Button>

      <h1 className="text-2xl font-semibold text-foreground">Order Gig</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Review your order details and submit
      </p>

      {/* Order Summary */}
      <div className="mt-6 rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground">Order Summary</h2>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Gig</span>
            <span className="font-medium text-foreground">{gig.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Seller</span>
            <span className="font-medium text-foreground">
              {gig.seller.name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Package</span>
            <span className="font-medium text-foreground">
              {selectedPkg?.title ?? selectedTier}
            </span>
          </div>
          {selectedPkg?.price != null && (
            <div className="flex justify-between border-t border-border pt-2">
              <span className="text-muted-foreground">Total</span>
              <span className="text-lg font-bold text-foreground">
                {format(selectedPkg.price)}
              </span>
            </div>
          )}
          {selectedPkg?.delivery_days && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated Delivery</span>
              <span className="font-medium text-foreground">
                {selectedPkg.delivery_days} days
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Order Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Description <span className="text-destructive">*</span>
          </label>
          <Textarea
            id="description"
            placeholder="Describe what you need in detail..."
            rows={4}
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
          <label
            htmlFor="note"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Note to Seller{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </label>
          <Textarea
            id="note"
            placeholder="Any special instructions..."
            rows={3}
            {...register("note")}
          />
          {errors.note && (
            <p className="mt-1 text-sm text-destructive">
              {errors.note.message}
            </p>
          )}
        </div>

        {/* Info */}
        <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          <IconInfoCircle className="mt-0.5 size-4 shrink-0" />
          <span>
            By placing this order, you agree to the GigHub terms of service. An
            escrow will be created to secure your payment.
          </span>
        </div>

        {/* Submit */}
        <Button
          type="submit"
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
                <span className="ml-1.5">— {format(selectedPkg.price)}</span>
              )}
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
