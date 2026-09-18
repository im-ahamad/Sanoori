import { z } from "zod";

export const loginCredentialsSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address")
    .max(200),
  password: z
    .string()
    .min(1, "Password is required")
    .max(200, "Password is too long"),
});

export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;