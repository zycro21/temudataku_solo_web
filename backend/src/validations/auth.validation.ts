import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .refine(
      (val) =>
        /[A-Z]/i.test(val) &&
        /\d/.test(val) &&
        /[!@#$%^&*(),.?":{}|<>]/.test(val),
      {
        message: "Password must contain letters, numbers, and symbols",
      }
    ),
  fullName: z.string().min(3, "Full name is required"),
  phoneNumber: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  role: z
    .enum(["mentee", "mentor", "affiliator", "admin"], {
      invalid_type_error: "Invalid role selected",
    })
    .default("mentee"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password is required"),
});

export const refreshTokenSchema = z.object({
  refresh_token: z.string().nonempty("Refresh token is required"),
});

// Validator untuk forgot-password
export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .refine(
      (val) =>
        /[A-Z]/i.test(val) &&
        /\d/.test(val) &&
        /[!@#$%^&*(),.?":{}|<>]/.test(val),
      {
        message: "Password must contain letters, numbers, and symbols",
      }
    ),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(8, "Old password is required"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .refine(
      (val) =>
        /[A-Z]/i.test(val) &&
        /\d/.test(val) &&
        /[!@#$%^&*(),.?":{}|<>]/.test(val),
      {
        message: "New password must contain letters, numbers, and symbols",
      }
    ),
});
