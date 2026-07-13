import { fail, ok, parseBody } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { parsePagination, parseSorting } from "@/lib/api/request-payload";
import { paginationMeta } from "@/lib/pagination";
import { createGigOrderSchema } from "@/lib/validations/order.schema";
import { OrderService } from "@/services/order.service";

// ─── GET /api/order (participant or admin) ────────────────────────
// Returns paginated list of orders for the authenticated user.
//
// - **Non-admin users**: automatically filtered to orders where the user
//   is the buyer OR seller. Explicit `buyer`/`seller` query params are
//   ignored for security — users can only see their own orders.
// - **Admin users**: can optionally specify `buyer`/`seller` to view any
//   participant's orders, or omit them to see all orders.
//
// Query parameters:
//   page, limit          — pagination
//   sortBy, sortOrder    — sorting (created_at, updated_at, total_price, status)
//   status               — filter by status (PENDING, ACTIVE, CANCELLED)
//   source               — filter by source (GIG, JOB)
//   buyer                — (admin only) filter by buyer UUID
//   seller               — (admin only) filter by seller UUID
//   search               — search in order code or title
export const GET = withAuth({
  handler: async ({ req, user }) => {
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
      const search = searchParams.get("search") || undefined;

      // ── Non-admin: only see your own orders ──────────────────────
      // Automatically filter by the user's profile UUID as buyer OR seller.
      // Explicit buyer/seller params from non-admin users are ignored.
      const isAdmin = user.role === "ADMIN";
      const buyer = isAdmin
        ? searchParams.get("buyer") || undefined
        : user.profile;
      const seller = isAdmin
        ? searchParams.get("seller") || undefined
        : user.profile;

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
