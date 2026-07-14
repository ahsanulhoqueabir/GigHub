import { fail, ok, parseBody } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { OrderService } from "@/services/order.service";
import { SSLCommerzService } from "@/services/sslcommerz.service";
import { initiatePaymentSchema } from "@/lib/validations/payment.schema";

/**
 * POST /api/payment/initiate
 *
 * Initiates an SSLCommerz payment session for a Gig order.
 *
 * Body: { order_id: string }
 *
 * Flow:
 * 1. Validate body & authenticate buyer
 * 2. Fetch order to get amount & customer info
 * 3. Generate unique transaction ID
 * 4. Call SSLCommerz initiation API
 * 5. Return the GatewayPageURL for client-side redirect
 */
export const POST = withAuth({
  handler: async ({ req, user }) => {
    try {
      const body = await parseBody(req, initiatePaymentSchema);
      if (body instanceof Response) return body as never;

      const { order_id } = body;

      // Fetch order to validate and get details
      const orderResult = await OrderService.getById(order_id);
      if (!orderResult.success) {
        return fail({ error: "Order not found", statusCode: 404 });
      }

      const order = orderResult.data;

      // Only the buyer can initiate payment
      const buyerId =
        typeof order.buyer === "object" ? order.buyer?.id : order.buyer;
      if (buyerId !== user.profile) {
        return fail({
          error: "Only the buyer can initiate payment",
          statusCode: 403,
        });
      }

      // Order must be PENDING
      if (order.status !== "PENDING") {
        return fail({
          error: `Payment can only be initiated for PENDING orders. Current status: ${order.status}`,
          statusCode: 400,
        });
      }

      // Generate unique transaction ID: SSL_{orderId_prefix}_{timestamp}
      const tranId = `SSL_${order_id.replace(/-/g, "").slice(0, 8).toUpperCase()}_${Date.now()}`;

      const urls = SSLCommerzService.buildCallbackUrls(order_id);

      // Initiate payment with SSLCommerz
      const sslResult = await SSLCommerzService.initiatePayment({
        total_amount: order.total_price,
        currency: "BDT",
        tran_id: tranId,
        ...urls,
        cus_name: user.email ?? "Customer",
        cus_email: user.email ?? "customer@example.com",
        cus_phone: "01700000000",
        product_name: order.title ?? "Gig Service",
        product_category: "Service",
        product_profile: "general",
        value_a: order_id, // embed order_id for IPN handler
      });

      if (sslResult.status !== "SUCCESS") {
        return fail({
          error: sslResult.failedreason ?? "Failed to initiate payment",
          statusCode: 502,
        });
      }

      return ok({
        data: {
          gateway_url: sslResult.GatewayPageURL,
          tran_id: tranId,
          order_id,
        },
        message: "Payment session created",
        statusCode: 200,
      });
    } catch (err) {
      return fail({
        error: (err as Error).message || "An unknown error occurred",
        statusCode: 500,
      });
    }
  },
});
