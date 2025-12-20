import { z } from "zod";

export const getActivityLogsValidator = z.object({
  query: z.object({
    userId: z.string().optional(),
    action: z.string().optional(),
    type: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(200).default(20),
    sortBy: z.enum(["createdAt"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const getActivityLogByIdValidator = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const deleteActivityLogValidator = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});
