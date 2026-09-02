import { z } from "zod";

const nonNegativeIntString = (v: string | undefined) =>
  v === undefined ||
  v === "" ||
  (Number.isInteger(Number(v)) && Number(v) >= 0);

export const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(150),
  sku: z.string().trim().min(1, "SKU is required").max(100),
  price: z
    .string()
    .min(1, "Price is required")
    .refine(
      (v) => Number.isInteger(Number(v)) && Number(v) >= 0,
      "Enter a valid price (whole number ≥ 0)",
    ),
  stock: z
    .string()
    .optional()
    .refine(nonNegativeIntString, "Enter a valid stock quantity"),
  minStock: z
    .string()
    .optional()
    .refine(nonNegativeIntString, "Enter a valid minimum stock"),
  categoryId: z.string().min(1, "Please select a category"),
  supplierId: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
