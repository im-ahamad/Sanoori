import { z } from "zod";

export const orderDeleteSchema = z.object({
  orderId: z.string().trim().min(1).max(100),
});