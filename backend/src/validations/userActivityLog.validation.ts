import { z } from "zod";

export const createUserActivitySchema = z.object({
  body: z.object({
    page: z.string().min(1, "Page is required"),
    durationSec: z
      .union([z.string(), z.number()])
      .transform((val) => Number(val))
      .optional()
      .default(0),
  }),
});

export const getUserActivityListSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1))
      .refine((val) => !isNaN(val) && val > 0, {
        message: "Page must be a positive integer",
      }),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10))
      .refine((val) => !isNaN(val) && val > 0 && val <= 1000, {
        message: "Limit must be between 1 and 100",
      }),
    search: z.string().optional(),
    sortBy: z.enum(["accessedAt", "durationSec", "page"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

export const updateUserActivitySchema = z.object({
  params: z.object({
    id: z.string().min(1, "Invalid activity log ID format"),
  }),
  body: z
    .object({
      page: z.string().min(1, "Page cannot be empty").optional(),
      durationSec: z
        .number()
        .int()
        .nonnegative("durationSec must be >= 0")
        .optional(),
    })
    .refine((val) => val.page !== undefined || val.durationSec !== undefined, {
      message: "At least one of page or durationSec must be provided",
    }),
});

export const getUserActivityByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Invalid activity log ID format"),
  }),
});

export const deleteUserActivitySchema = z.object({
  params: z.object({
    id: z.string().min(1, "Invalid activity log ID format"),
  }),
});

export const getAllUserActivitiesSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10)),
    search: z.string().optional(),
    sortBy: z
      .enum(["accessedAt", "durationSec", "page"])
      .optional()
      .default("accessedAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});

export const getRecentUserActivitiesSchema = z.object({
  query: z.object({
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 5))
      .refine((val) => !isNaN(val) && val > 0 && val <= 10, {
        message: "Limit must be between 1 and 10",
      }),
  }),
});
