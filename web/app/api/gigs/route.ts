import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { GigService } from "@/services/gig.service";
import type { JwtPayload } from "@/types/business/user.types";

/**
 * POST /api/gigs - Create a new gig
 */
export const POST = withAuth(
  async (req: NextRequest, jwtPayload: JwtPayload) => {
    try {
      const body = await req.json();
      const {
        title,
        description,
        category_id,
        tags,
        status,
        packages,
        images,
      } = body;

      // Validate required fields
      if (!title || !description || !category_id) {
        return fail({
          error: "Title, description, and category_id are required",
        });
      }

      if (!packages || !Array.isArray(packages) || packages.length === 0) {
        return fail({ error: "At least one package is required" });
      }

      // Validate packages
      const tiers = packages.map((p: { tier: string }) => p.tier);
      const hasBasic = tiers.includes("basic");
      if (!hasBasic) {
        return fail({ error: "At least one basic package is required" });
      }

      // Check for duplicate tiers
      const uniqueTiers = new Set(tiers);
      if (uniqueTiers.size !== tiers.length) {
        const duplicates = tiers.filter(
          (t: string, i: number) => tiers.indexOf(t) !== i,
        );
        return fail({
          error: `Duplicate tier: ${duplicates[0]}`,
        });
      }

      // Validate prices
      for (const pkg of packages) {
        if (!pkg.price || pkg.price < 1) {
          return fail({ error: "price must not be less than 1" });
        }
        if (!pkg.tier || !["basic", "standard", "premium"].includes(pkg.tier)) {
          return fail({
            error: "tier must be one of: basic, standard, premium",
          });
        }
      }

      const result = await GigService.create({
        seller: jwtPayload.profile,
        category_id,
        title,
        description,
        tags: tags ?? [],
        status: status ?? "active",
        packages,
        images: images ?? [],
      });

      if (!result.success) {
        return fail({ error: result.error, statusCode: 400 });
      }

      return ok({ data: result.data, statusCode: 201 });
    } catch (err) {
      return fail({
        error: (err as Error).message || "An unknown error occurred",
        statusCode: 500,
      });
    }
  },
);

/**
 * GET /api/gigs - List gigs with filtering and pagination
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const result = await GigService.list({
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "10"),
      sort: searchParams.get("sort") || undefined,
      search: searchParams.get("search") || undefined,
      category: searchParams.get("category") || undefined,
      min_rating: searchParams.get("min_rating")
        ? parseFloat(searchParams.get("min_rating")!)
        : undefined,
      tags: searchParams.get("tags") || undefined,
      min_price: searchParams.get("min_price")
        ? parseFloat(searchParams.get("min_price")!)
        : undefined,
      max_price: searchParams.get("max_price")
        ? parseFloat(searchParams.get("max_price")!)
        : undefined,
      max_delivery: searchParams.get("max_delivery")
        ? parseInt(searchParams.get("max_delivery")!)
        : undefined,
    });

    if (!result.success) {
      return fail({ error: result.error, statusCode: 500 });
    }

    const { gigs, total } = result.data;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const totalPages = Math.ceil(total / limit);

    return ok({
      data: gigs,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    return fail({
      error: (err as Error).message || "An unknown error occurred",
      statusCode: 500,
    });
  }
}
