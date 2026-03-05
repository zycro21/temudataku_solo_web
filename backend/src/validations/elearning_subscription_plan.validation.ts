import { z } from "zod";

export const createSubscriptionPlanSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50),
    durationDay: z.number().int().positive(),
    price: z.number().positive(),
    description: z.string().optional(),
  }),
});

export const getSubscriptionPlansSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    sortBy: z.enum(["createdAt", "price", "durationDay"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    isActive: z
      .enum(["true", "false"])
      .transform((v) => v === "true")
      .optional(),
  }),
});

export const updateSubscriptionPlanSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z
    .object({
      name: z.string().min(2).max(50).optional(),
      durationDay: z.number().int().positive().optional(),
      price: z.number().positive().optional(),
      description: z.string().optional(),
      isActive: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),
});

export const updateSubscriptionPlanStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    isActive: z.boolean(),
  }),
});

export const getAllSubscriptionPlanSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
    sortBy: z
      .enum(["name", "price", "durationDay", "createdAt"])
      .optional()
      .default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
    isActive: z
      .enum(["true", "false"])
      .optional()
      .transform((val) => (val === undefined ? undefined : val === "true")),
    search: z.string().min(1).optional(),
  }),
});

export const getSubscriptionPlanDetailSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const getAdminSubscriptionPlanDetailSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const deleteSubscriptionPlanSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const exportSubscriptionPlanQuerySchema = z.object({
  query: z.object({
    format: z.enum(["csv", "excel"]).optional().default("csv"),
  }),
});
