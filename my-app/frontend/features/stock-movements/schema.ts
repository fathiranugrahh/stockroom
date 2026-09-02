import { z } from "zod";

export const stockMovementSchema = z.object({
  productId: z.string().min(1, "Please select a product"),
  quantity: z
    .string()
    .min(1, "Quantity is required")
    .refine(
      (v) => Number.isInteger(Number(v)) && Number(v) >= 1,
      "Quantity must be a whole number of at least 1",
    ),
  note: z.string().optional(),
});

export type StockMovementFormValues = z.infer<typeof stockMovementSchema>;
