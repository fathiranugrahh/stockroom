import { z } from "zod";

export const userSchema = z
  .object({
    mode: z.enum(["create", "edit"]),
    name: z.string().trim().min(1, "Name is required").max(150),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Enter a valid email"),
    password: z.string().optional(),
    role: z.enum(["ADMIN", "STAFF"]),
    isActive: z.boolean(),
  })
  .superRefine((val, ctx) => {
    // Password is required (min 8) only when creating a user.
    if (val.mode === "create" && (!val.password || val.password.length < 8)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Password must be at least 8 characters",
      });
    }
  });

export type UserFormValues = z.infer<typeof userSchema>;
