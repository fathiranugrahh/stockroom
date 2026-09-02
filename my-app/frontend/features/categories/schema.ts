import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
