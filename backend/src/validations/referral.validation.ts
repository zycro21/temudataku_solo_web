import { z } from "zod";

export const createReferralCodeSchema = z.object({
  body: z.object({
    ownerId: z.string().nonempty("Owner ID is required"),
    code: z
      .string()
      .nonempty("Referral code is required")
      .min(6, "Referral code must be at least 6 characters")
      .max(10, "Referral code cannot exceed 10 characters")
      .regex(
        /^[A-Za-z0-9-_]+$/,
        "Referral code must contain only letters, numbers, hyphens, or underscores"
      ),
    discountPercentage: z
      .number()
      .min(0, "Discount percentage must be at least 0")
      .max(100, "Discount percentage cannot exceed 100"),
    commissionPercentage: z
      .number()
      .min(0, "Commission percentage must be at least 0")
      .max(100, "Commission percentage cannot exceed 100"),
    expiryDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: "Expiry date must be in yyyy-mm-dd format",
      })
      .optional()
      .transform((val: string | undefined) =>
        val ? new Date(`${val}T23:59:59.999Z`) : undefined
      )
      .refine((val: Date | undefined) => !val || !isNaN(val.getTime()), {
        message: "Invalid expiry date",
      }),
    isActive: z.boolean().optional().default(true),
  }),
});

export const getReferralCodesSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1))
      .refine((val) => val > 0, { message: "Page must be a positive number" }),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10))
      .refine((val) => val > 0, { message: "Limit must be a positive number" }),
    isActive: z
      .string()
      .optional()
      .transform((val) => (val ? val === "true" : undefined))
      .refine((val) => val === undefined || typeof val === "boolean", {
        message: "isActive must be a boolean",
      }),
    ownerId: z.string().optional(),
  }),
});

export const getReferralCodeByIdSchema = z.object({
  params: z.object({
    id: z.string().nonempty("Referral code ID is required"),
  }),
});

export const updateReferralCodeSchema = z.object({
  params: z.object({
    id: z.string().nonempty("Referral code ID is required"),
  }),
  body: z
    .object({
      expiryDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, {
          message: "Expiry date must be in yyyy-mm-dd format",
        })
        .optional()
        .transform((val: string | undefined) =>
          val ? new Date(`${val}T23:59:59.999Z`) : undefined
        )
        .refine((val: Date | undefined) => !val || !isNaN(val.getTime()), {
          message: "Invalid expiry date",
        }),
      isActive: z.boolean().optional(),
      discountPercentage: z
        .number()
        .min(0, "Discount percentage must be at least 0")
        .max(100, "Discount percentage cannot exceed 100")
        .optional(),
      commissionPercentage: z
        .number()
        .min(0, "Commission percentage must be at least 0")
        .max(100, "Commission percentage cannot exceed 100")
        .optional(),
    })
    .refine(
      (data) => Object.values(data).some((value) => value !== undefined),
      { message: "At least one field must be provided to update" }
    ),
});

export const useReferralCodeSchema = z.object({
  body: z.object({
    code: z
      .string()
      .nonempty("Referral code is required")
      .min(6, "Referral code must be at least 6 characters")
      .max(10, "Referral code cannot exceed 10 characters")
      .regex(
        /^[A-Za-z0-9-_]+$/,
        "Referral code must contain only letters, numbers, hyphens, or underscores"
      ),
    context: z.enum(["booking", "practice_purchase"], {
      errorMap: () => ({
        message: "Context must be 'booking' or 'practice_purchase'",
      }),
    }),
  }),
});

export const getReferralCommissionsSchema = z.object({
  query: z.object({
    referralCodeId: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    page: z.string().transform(Number).default("1"),
    limit: z.string().transform(Number).default("10"),
  }),
});

export const getAffiliatorReferralCodesSchema = z.object({
  query: z.object({
    isActive: z
      .enum(["true", "false"])
      .optional()
      .transform((val) => (val === undefined ? undefined : val === "true")),
    page: z.string().transform(Number).default("1"),
    limit: z.string().transform(Number).default("10"),
  }),
});

export const getReferralUsagesSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Referral code ID is required"),
  }),
  query: z.object({
    context: z.enum(["booking", "practice_purchase"]).optional(),
    page: z.string().transform(Number).default("1"),
    limit: z.string().transform(Number).default("10"),
  }),
});

export const getReferralCommissionsByCodeSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Referral code ID is required"),
  }),
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    page: z.string().transform(Number).default("1"),
    limit: z.string().transform(Number).default("10"),
  }),
});

export const requestCommissionPaymentSchema = z.object({
  body: z.object({
    referralCodeId: z.string().min(1, "Referral code ID is required"),
    amount: z.number().positive("Amount must be a positive number"),
  }),
});

export const validateCommissionPaymentsSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : 1))
      .refine((val) => val >= 1, { message: "Page must be at least 1" }),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : 10))
      .refine((val) => val >= 1 && val <= 100, {
        message: "Limit must be between 1 and 100",
      }),
    status: z.enum(["pending", "paid", "failed"]).optional(),
    startDate: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "Invalid startDate format",
      }),
    endDate: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "Invalid endDate format",
      }),
  }),
});

export const AllCommissionPaymentsSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : 1))
      .refine((val) => val >= 1, { message: "Page must be at least 1" }),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : 10))
      .refine((val) => val >= 1 && val <= 100, {
        message: "Limit must be between 1 and 100",
      }),
    status: z.enum(["pending", "paid", "failed"]).optional(),
    startDate: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "Invalid startDate format",
      }),
    endDate: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "Invalid endDate format",
      }),
    referralCodeId: z.string().optional(),
    ownerId: z.string().optional(),
  }),
});

export const validateUpdateCommissionPaymentStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Commission payment ID is required"),
  }),
  body: z.object({
    status: z.enum(["pending", "paid", "failed"], {
      errorMap: () => ({ message: "Status must be pending, paid, or failed" }),
    }),
    notes: z.string().optional(),
    transactionId: z.string().optional(),
  }),
});

export const exportCommissionPaymentsSchema = z.object({
  query: z.object({
    format: z.enum(["csv", "excel"], {
      errorMap: () => ({ message: "Format must be 'csv' or 'excel'" }),
    }),
  }),
});
