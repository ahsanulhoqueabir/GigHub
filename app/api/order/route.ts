import { ok, fail, parseBody } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { OrderService } from "@/services/order.service";
import { createGigOrderSchema } from "@/lib/validations/order.schema";
import { parsePagination, parseSorting } from "@/lib/api/request-payload";
import { paginationMeta } from "@/lib/pagination";

// ─── GET /api/order (participant or admin) ────────────────────────
// Returns paginated list of orders visible to the caller (via RLS).
//
// Query parameters:
//   page, limit          — pagination
//   sortBy, sortOrder    — sorting (created_at, updated_at, total_price, status)
//   status               — filter by status (PENDING, ACTIVE, CANCELLED)
//   source               — filter by source (GIG, JOB)
//   buyer                — filter by buyer UUID
//   seller               — filter by seller UUID
//   search               — search in order code or title
export const GET = withAuth({
  handler: async ({ req }) => {
    try {
      const searchParams = req.nextUrl.searchParams;
      const { page, limit } = parsePagination(searchParams);
      const { sortBy, sortOrder } = parseSorting(searchParams, [
        "created_at",
        "updated_at",
        "total_price",
        "status",
      ]);

      const status = searchParams.get("status") || undefined;
      const source = searchParams.get("source") || undefined;
      const buyer = searchParams.get("buyer") || undefined;
      const seller = searchParams.get("seller") || undefined;
      const search = searchParams.get("search") || undefined;

      const result = await OrderService.list({
        page,
        limit,
        status,
        source: source as "GIG" | "JOB" | undefined,
        buyer,
        seller,
        search,
        sortBy,
        sortOrder,
      });

      if (!result.success) {
        return fail({ error: result.error, statusCode: 500 });
      }

      const pagination = paginationMeta({
        page,
        limit,
        totalItems: result.data.total,
      });

      return ok({
        data: {
          items: result.data.items,
          pagination,
        },
      });
    } catch (err) {
      return fail({
        error: (err as Error).message || "An unknown error occurred",
        statusCode: 500,
      });
    }
  },
});

// ─── POST /api/order (authenticated buyer) ────────────────────────
// Creates a new Gig order. Buyer is extracted from JWT.
// The order, chat room, and escrow are created atomically via RPC.
export const POST = withAuth({
  handler: async ({ req, user }) => {
    try {
      const payload = await parseBody(req, createGigOrderSchema);
      if (payload instanceof Response) return payload;

      const result = await OrderService.createGigOrder(user.profile, payload);

      if (!result.success) {
        return fail({ error: result.error, statusCode: 400 });
      }

      return ok({
        data: result.data,
        message: "Gig order created successfully",
        statusCode: 201,
      });
    } catch (err) {
      return fail({
        error: (err as Error).message || "An unknown error occurred",
        statusCode: 500,
      });
    }
  },
});
