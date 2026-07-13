"use client";

import type { RatingDistribution } from "@/types/admin-dashboard.types";
import { IconStarFilled } from "@tabler/icons-react";

interface RatingDistributionProps {
  ratings: RatingDistribution[];
  averageRating: number;
  totalReviews: number;
}

export function RatingDistributionCard({
  ratings,
  averageRating,
  totalReviews,
}: RatingDistributionProps) {
  // Build a map of rating -> count (fill missing ratings with 0)
  const ratingMap = new Map<number, number>();
  for (let i = 1; i <= 5; i++) ratingMap.set(i, 0);
  ratings.forEach((r) => ratingMap.set(r.rating, r.count));

  const maxCount = Math.max(...Array.from(ratingMap.values()), 1);

  if (totalReviews === 0) {
    return (
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="font-semibold leading-none tracking-tight">
            Rating Distribution
          </h3>
        </div>
        <div className="p-6 pt-0 flex items-center justify-center h-50 text-sm text-muted-foreground">
          No reviews yet.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6 pb-3">
        <h3 className="font-semibold leading-none tracking-tight">
          Rating Distribution
        </h3>
        <p className="text-sm text-muted-foreground">
          Based on {totalReviews} review{totalReviews !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="px-6 pb-6">
        {/* Average rating display */}
        <div className="flex items-center gap-3 mb-5">
          <div className="text-4xl font-bold">{averageRating}</div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={
                    star <= Math.round(averageRating)
                      ? "text-amber-400"
                      : "text-muted-foreground/30"
                  }
                >
                  <IconStarFilled className="h-4 w-4" />
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">out of 5 stars</p>
          </div>
        </div>

        {/* Rating bars */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingMap.get(star) || 0;
            const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-sm font-medium w-8 text-right">
                  {star}
                </span>
                <IconStarFilled className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
