import { z } from "zod";

export const createPracticeSubmissionSchema = z.object({
  body: z.object({
    practiceId: z.string().nonempty("Practice ID is required"),
    notes: z.string().max(1000).optional(),
  }),
});

export const getAllPracticeSubmissionsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().default("1"),
    limit: z.string().regex(/^\d+$/).optional().default("10"),
    search: z.string().optional(),
    status: z.enum(["pending", "reviewed", "approved"]).optional(),
    sort_by: z
      .enum(["submittedAt", "status", "reviewedAt"])
      .optional()
      .default("submittedAt"),
    order: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});

export const getOwnPracticeSubmissionsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().default("1"),
    limit: z.string().regex(/^\d+$/).optional().default("10"),
    status: z.enum(["pending", "reviewed", "approved", "rejected"]).optional(),
    sort_by: z
      .enum(["submittedAt", "status", "reviewedAt"])
      .optional()
      .default("submittedAt"),
    order: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});

export const getPracticeSubmissionByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Submission ID is required"),
  }),
});

export const reviewPracticeSubmissionSchema = z.object({
  body: z.object({
    status: z.enum(["pending", "reviewed", "approved"]).optional(),
    kesesuaian: z.string().optional(),
    kualitas: z.string().optional(),
    kreativitas: z.string().optional(),
    kelengkapan: z.string().optional(),
    komentar: z.string().optional(),
    saran: z.string().optional(),
    perluRevisi: z.boolean().optional(),
  }),
});

export const deletePracticeSubmissionSchema = z.object({
  params: z.object({
    id: z.string().nonempty("Submission ID is required"),
  }),
});
