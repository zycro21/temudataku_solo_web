import { z } from "zod";

export const getJobsSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).optional(),

    limit: z.coerce
      .number()
      .min(1)
      .max(100)
      .default(30),

    jobTitle: z.string().optional(),

    country: z.string().optional(),

    level: z.string().optional(),

    workType: z.enum([
      "Onsite",
      "Hybrid",
      "Remote",
    ]).optional(),

    sortBy: z.enum([
      "createdAt",
      "salaryMin",
      "salaryMax",
      "jobTitle",
    ]).optional(),

    sortOrder: z.enum([
      "asc",
      "desc",
    ]).optional(),
  }),
});