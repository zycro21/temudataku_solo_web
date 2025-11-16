import { z } from "zod";

export const createSubmissionSchema = z.object({
  body: z.object({
    notes: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1, "Assignment ID wajib diisi"),
  }),
});

export const getMySubmissionSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Assignment ID wajib diisi"),
  }),
});

export const getAllSubmissionsSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Assignment ID wajib diisi"),
  }),
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    status: z
      .enum([
        "PENDING",
        "REVIEWED",
        "REVISION_REQUIRED",
        "APPROVED",
        "REJECTED",
      ])
      .optional(),
    sortBy: z.enum(["submittedAt", "score"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

export const reviewSubmissionSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Submission ID wajib diisi"),
  }),
  body: z.object({
    feedback: z.string().min(1, "Feedback wajib diisi"),
    score: z.number().min(0).max(100),
    gradeBreakdown: z.record(z.number()).optional(),
    isRevisionRequired: z.boolean().optional(),
    revisionDeadline: z.string().datetime().optional(),
  }),
});

export const reviseSubmissionSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Submission ID wajib diisi"),
  }),
  body: z.object({
    notes: z.string().optional(),
  }),
});

export const getSubmissionDetailSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Submission ID wajib diisi"),
  }),
});

export const getSubmissionHistorySchema = z.object({
  params: z.object({
    id: z.string().min(1, "Submission ID wajib diisi"),
  }),
});

export const exportSubmissionSchema = z.object({
  query: z.object({
    format: z.enum(["csv", "excel"]).default("csv"),
  }),
});

export const deleteSubmissionSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Submission ID wajib diisi"),
  }),
});
