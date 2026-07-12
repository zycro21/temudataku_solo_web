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
        "Referral code must contain only letters, numbers, hyphens, or underscores",
      ),
    expiryDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: "Expiry date must be in yyyy-mm-dd format",
      })
      .optional()
      .transform((val: string | undefined) =>
        val ? new Date(`${val}T23:59:59.999Z`) : undefined,
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
          val ? new Date(`${val}T23:59:59.999Z`) : undefined,
        )
        .refine((val: Date | undefined) => !val || !isNaN(val.getTime()), {
          message: "Invalid expiry date",
        }),
      isActive: z.boolean().optional(),
      // HAPUS: discountPercentage, commissionPercentage
    })
    .refine(
      (data) => Object.values(data).some((value) => value !== undefined),
      { message: "At least one field must be provided to update" },
    ),
});

export const useReferralCodeSchema = z.object({
  body: z.object({
    code: z
      .string()
      .nonempty("Referral code is required")
      .min(6)
      .max(10)
      .regex(/^[A-Za-z0-9-_]+$/),

    context: z.enum(
      [
        "booking",
        "practice_purchase",
        "elearning_subscription",
        "ayclpurchase",
      ],
      {
        errorMap: () => ({
          message:
            "Context must be 'booking', 'practice_purchase', 'elearning_subscription', or 'ayclpurchase'",
        }),
      },
    ),
  }),
});

export const applyReferralSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    code: z
      .string()
      .min(6)
      .max(20)
      .regex(/^[A-Za-z0-9-_]+$/),
  }),
});

export const applyReferralAyclSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    code: z
      .string()
      .min(6)
      .max(20)
      .regex(/^[A-Za-z0-9-_]+$/),
  }),
});

export const getReferralCommissionsSchema = z.object({
  query: z.object({
    referralCodeId: z.string().optional(),
    productType: z
      .enum([
        "ELEARNING_1M",
        "ELEARNING_3M",
        "ELEARNING_6M",
        "MENTORING_BOOTCAMP",
        "MENTORING_ONE_ON_ONE",
        "MENTORING_GROUP",
        "AYCL",
      ])
      .optional(),
    tier: z.enum(["BRONZE", "SILVER", "GOLD"]).optional(),
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
    context: z
      .enum([
        "booking",
        "practice_purchase",
        "elearning_subscription",
        "ayclpurchase", // tambah
      ])
      .optional(),
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
    withdrawalMethodId: z.string().min(1, "Withdrawal method ID is required"),
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

// ============================================================
// GET /affiliator/profile
// (tidak ada params/query/body, tapi tetap buat schema kosong
//  agar konsisten dengan pattern validate() middleware)
// ============================================================
export const getAffiliatorProfileSchema = z.object({});

// ============================================================
// Admin CRUD AffiliatorProductConfig
// ============================================================

export const getProductConfigsSchema = z.object({
  query: z
    .object({
      productType: z.string().optional(),
      tier: z.enum(["BRONZE", "SILVER", "GOLD"]).optional(),
      isActive: z
        .string()
        .optional()
        .transform((val) => {
          if (val === "true") return true;
          if (val === "false") return false;
          return undefined;
        }),
    })
    .optional(),
});

export const updateProductConfigSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Config ID is required"),
  }),
  body: z
    .object({
      commissionAmount: z.number().nonnegative().optional(),
      discountAmount: z.number().nonnegative().optional(),
      commissionPercent: z.number().min(0).max(100).optional(),
      discountPercent: z.number().min(0).max(100).optional(),
      pointsAwarded: z.number().int().nonnegative().optional(),
      isActive: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "Minimal satu field harus diisi untuk update",
    }),
});

// ============================================================
// GET /admin/affiliator-profiles
// ============================================================
export const getAdminAffiliatorProfilesSchema = z.object({
  query: z
    .object({
      page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 1))
        .refine((val) => val >= 1, { message: "Page minimal 1" }),
      limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 10))
        .refine((val) => val >= 1, { message: "Limit minimal 1" }),
      tier: z.enum(["BRONZE", "SILVER", "GOLD"]).optional(),
      isActive: z
        .string()
        .optional()
        .transform((val) => {
          if (val === "true") return true;
          if (val === "false") return false;
          return undefined;
        }),
      search: z.string().optional(), // filter by nama / email affiliator
    })
    .optional(),
});

// ============================================================
// GET /admin/seasons
// ============================================================
export const getAdminSeasonsSchema = z.object({
  query: z
    .object({
      isActive: z
        .string()
        .optional()
        .transform((val) => {
          if (val === "true") return true;
          if (val === "false") return false;
          return undefined;
        }),
    })
    .optional(),
});
