"use client";

import { useDeleteConfirm } from "@/components/shared/delete-confirm-dialog";
import { DetailsSkeleton } from "@/components/shared/details-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrency } from "@/hooks/use-currency";
import { useReturnTo } from "@/hooks/use-return-to";
import { STATUS_BADGE_COLORS } from "@/lib/shared/badge.utils";
import { useGigsStore } from "@/store/gigs.store";
import {
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconClock,
  IconEdit,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

function GigDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { returnTo, withReturnTo } = useReturnTo("/profile/gigs");
  const { symbol } = useCurrency();

  const { currentGig, isLoadingDetail, detailError, fetchGigById, deleteGig } =
    useGigsStore();

  const { confirmDelete, deleteDialog } = useDeleteConfirm();
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      fetchGigById(id);
    }
  }, [id, fetchGigById]);

  const handleDelete = useCallback(async () => {
    if (!currentGig) return;
    const confirmed = await confirmDelete(currentGig.title);
    if (!confirmed) return;
    try {
      await deleteGig(id);
      router.push(returnTo);
    } catch (err) {
      console.error(err);
    }
  }, [currentGig, confirmDelete, deleteGig, id, router, returnTo]);

  if (isLoadingDetail) {
    return (
      <div>
        <DetailsSkeleton rows={3} columns={2} />
      </div>
    );
  }

  if (detailError || !currentGig) {
    return (
      <ErrorState
        type="not-found"
        heading="Gig not found"
        message={
          detailError ||
          "The gig you are trying to view does not exist or has been deleted."
        }
        onBack={() => router.push(returnTo)}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href={returnTo}>Back to Gigs</Link>
          </Button>
        }
      />
    );
  }

  // Get packages sorted or filtered
  const packages = currentGig.packages || [];
  const basicPkg = packages.find((p) => p.tier === "BASIC");
  const standardPkg = packages.find((p) => p.tier === "STANDARD");
  const premiumPkg = packages.find((p) => p.tier === "PREMIUM");
  const images = currentGig.images || [];
  const status =
    (currentGig as typeof currentGig & { status?: string }).status || "ACTIVE";
  const statusColor =
    STATUS_BADGE_COLORS[status] ?? STATUS_BADGE_COLORS["ACTIVE"];

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={returnTo}
        title={
          <div className="flex items-center gap-2 flex-wrap">
            <span>Gig Overview</span>
            <Badge
              className={`bg-${statusColor.bg} text-${statusColor.text} border-none px-2.5 py-0.5 rounded-full text-[10px] font-bold`}
            >
              {currentGig.status || "ACTIVE"}
            </Badge>
          </div>
        }
        description="Manage and view package definitions for this listing."
        actions={
          <div className="flex items-center gap-3 *:flex-1 sm:*:flex-none">
            <Button variant="destructive" onClick={handleDelete}>
              <IconTrash className="h-4 w-4 mr-1.5" />
              Delete
            </Button>
            <Button asChild>
              <Link href={withReturnTo(`/profile/gigs/${id}/edit`)}>
                <IconEdit className="h-4 w-4 mr-1.5" />
                Edit Gig
              </Link>
            </Button>
          </div>
        }
      />

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side Info - 2 Columns on desktop */}
        <div className="lg:col-span-2 space-y-6">
          <h1 className="text-xl md:text-2xl font-bold text-foreground">
            {currentGig.title}
          </h1>

          {/* Gallery View */}
          {images.length > 0 ? (
            <div className="space-y-3">
              <div className="aspect-video w-full rounded-xl overflow-hidden border border-border bg-muted/20 flex items-center justify-center relative">
                <Image
                  src={images[activeImageIdx]}
                  alt="Gig view primary"
                  className="object-contain w-full h-full max-h-105"
                  fill
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                  {images.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative size-16 rounded-lg overflow-hidden border-2 shrink-0 transition-colors ${
                        activeImageIdx === idx
                          ? "border-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Image
                        src={url}
                        alt={`Thumbnail ${idx + 1}`}
                        className="object-cover w-full h-full"
                        fill
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-video w-full rounded-xl bg-muted/30 border border-dashed border-border flex items-center justify-center text-muted-foreground text-sm">
              No Images Uploaded
            </div>
          )}

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                About This Gig
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">
                {currentGig.description}
              </p>
            </CardContent>
          </Card>

          {/* Category & Tags */}
          <Card>
            <CardContent className="py-5 space-y-4">
              {currentGig.category && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    Category:
                  </span>
                  <span>{currentGig.category.name}</span>
                </div>
              )}
              {currentGig.tags && currentGig.tags.length > 0 && (
                <div className="space-y-1.5">
                  <h3 className="text-sm font-semibold text-foreground">
                    Search Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {currentGig.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="px-2.5 py-0.5 rounded text-xs uppercase tracking-wide"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* FAQs */}
          {currentGig.faq && currentGig.faq.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentGig.faq.map((item, idx) => (
                  <div
                    key={idx}
                    className="border border-border rounded-xl overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() =>
                        setOpenFaqIdx(openFaqIdx === idx ? null : idx)
                      }
                      className="flex justify-between items-center w-full px-5 py-4 bg-muted/10 hover:bg-muted/20 text-left font-semibold text-sm transition-colors"
                    >
                      <span className="text-foreground">{item.question}</span>
                      {openFaqIdx === idx ? (
                        <IconChevronUp className="size-4 text-muted-foreground" />
                      ) : (
                        <IconChevronDown className="size-4 text-muted-foreground" />
                      )}
                    </button>
                    {openFaqIdx === idx && (
                      <div className="px-5 py-4 text-sm text-muted-foreground border-t border-border bg-card leading-relaxed">
                        {item.answer}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Side Package Tabs - 1 Column on desktop */}
        <div className="space-y-6">
          <Card className="shadow-sm border-border bg-card sticky top-20">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-semibold">
                Pricing Packages
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <Tabs defaultValue="BASIC" className="w-full">
                <TabsList className="grid grid-cols-3 w-full mb-5">
                  <TabsTrigger value="BASIC">Basic</TabsTrigger>
                  <TabsTrigger value="STANDARD">Standard</TabsTrigger>
                  <TabsTrigger value="PREMIUM">Premium</TabsTrigger>
                </TabsList>

                {[
                  { key: "BASIC", pkg: basicPkg },
                  { key: "STANDARD", pkg: standardPkg },
                  { key: "PREMIUM", pkg: premiumPkg },
                ].map(({ key, pkg }) => (
                  <TabsContent
                    key={key}
                    value={key}
                    className="space-y-5 outline-none"
                  >
                    {pkg ? (
                      <>
                        {/* Package Header */}
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h3 className="font-bold text-base text-foreground leading-tight">
                              {pkg.title}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1 capitalize">
                              {pkg.tier} PACKAGE
                            </p>
                          </div>
                          <span className="text-xl font-extrabold text-foreground shrink-0">
                            {symbol} {pkg.price ?? 0}
                          </span>
                        </div>

                        {/* Package Description */}
                        <p className="text-sm text-foreground/80 leading-relaxed bg-muted/10 p-3 rounded-lg border border-border/50">
                          {pkg.description}
                        </p>

                        {/* Service Metadata */}
                        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <IconClock className="size-4" />
                            <span>{pkg.delivery_days ?? 1} Days Delivery</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <IconRefresh className="size-4" />
                            <span>
                              {pkg.revisions === 0
                                ? "Unlimited"
                                : `${pkg.revisions ?? 0} Revisions`}
                            </span>
                          </div>
                        </div>

                        {/* Feature List */}
                        {pkg.features && pkg.features.length > 0 && (
                          <div className="space-y-2 border-t pt-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                              What&apos;s Included
                            </h4>
                            <ul className="space-y-2.5">
                              {pkg.features.map((feature, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2.5 text-sm text-foreground/90"
                                >
                                  <IconCheck className="size-4 text-emerald-500 mt-0.5 shrink-0" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center text-sm text-muted-foreground py-6">
                        Package tier definition is missing.
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      {deleteDialog}
    </div>
  );
}

export default function GigDetailsPage() {
  return (
    <Suspense
      fallback={
        <div>
          <DetailsSkeleton />
        </div>
      }
    >
      <GigDetailsContent />
    </Suspense>
  );
}
