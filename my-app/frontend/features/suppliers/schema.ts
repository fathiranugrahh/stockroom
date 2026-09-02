import { z } from "zod";

export const supplierSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(150),
  email: z
    .union([z.literal(""), z.string().email("Enter a valid email")])
    .optional(),
  phone: z.string().max(30).optional(),
  address: z.string().max(255).optional(),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;
