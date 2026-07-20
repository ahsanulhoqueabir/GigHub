import { z } from "zod";

export const subscribePushSchema = z.object({
  token: z.string().min(1, "token is required"),
});

export type SubscribePushInput = z.infer<typeof subscribePushSchema>;
