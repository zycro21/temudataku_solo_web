import { z } from "zod";

export const createELearningPurchaseSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Course ID wajib diisi"),
  }),
  body: z.object({
    courseId: z.string().optional(),
    referralUsageId: z.string().optional(),
  }),
});

export const getMyPurchasesSchema = z.object({
  query: z.object({
    page: z.string().optional(), // parseInt in controller/service
    limit: z.string().optional(),
    search: z.string().optional(),
    status: z.string().optional(),
  }),
});

export const getPurchaseDetailSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Purchase ID wajib diisi"),
  }),
});

export const cancelPurchaseSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Purchase ID wajib diisi"),
  }),
});

export const getAllPurchasesSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    status: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});
