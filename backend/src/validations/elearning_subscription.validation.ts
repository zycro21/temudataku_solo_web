import { z } from "zod";

export const createELearningSubscriptionSchema = z.object({
  body: z.object({
    planId: z.string().min(1, "Plan ID is required"),
    referralUsageId: z.string().optional(),
  }),
});

export const getMySubscriptionHistorySchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? Number(val) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? Number(val) : 10)),
    status: z.enum(["pending", "confirmed", "expired", "cancelled"]).optional(),
  }),
});

export const cancelELearningSubscriptionSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Subscription ID is required"),
  }),
});

export const getAllELearningSubscriptionsSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(10000).optional().default(10000),

    status: z.enum(["pending", "confirmed", "expired", "cancelled"]).optional(),

    planId: z.string().optional(),
    userId: z.string().optional(),

    startDate: z.string().optional(), // ISO date
    endDate: z.string().optional(),
  }),
});

export const getAdminSubscriptionDetailSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Subscription ID is required"),
  }),
});

export const updateSubscriptionStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Subscription ID is required"),
  }),
  body: z.object({
    status: z.enum(["pending", "confirmed", "cancelled", "expired"]),
    reason: z.string().optional(),
  }),
});

export const exportElearningSubscriptionQuerySchema = z.object({
  query: z.object({
    format: z.enum(["csv", "excel"]).optional().default("csv"),
  }),
});

export const deleteELearningSubscriptionSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Subscription ID is required"),
  }),
});