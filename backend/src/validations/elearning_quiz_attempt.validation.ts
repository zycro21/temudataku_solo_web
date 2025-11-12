import { z } from "zod";

export const startQuizAttemptSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Quiz ID wajib diisi"),
  }),
  body: z.object({
    answers: z.record(z.string(), z.string()).superRefine((answers, ctx) => {
      if (Object.keys(answers).length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Minimal harus menjawab 1 pertanyaan",
        });
      }
    }),
  }),
});

export const getMyQuizAttemptSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Quiz ID wajib diisi"),
  }),
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    sortBy: z.enum(["score", "startedAt"]).optional(),
    order: z.enum(["asc", "desc"]).optional(),
  }),
});

export const gradeQuizAttemptSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Attempt ID wajib diisi"),
  }),
  body: z.object({
    score: z
      .number({
        required_error: "Skor wajib diisi",
        invalid_type_error: "Skor harus berupa angka",
      })
      .min(0, "Skor minimal 0")
      .max(100, "Skor maksimal 100"),
    remarks: z.string().optional(),
    isAutoGraded: z.boolean().optional(),
  }),
});

export const getAllQuizAttemptsSchema = z.object({
  query: z.object({
    quizId: z.string().optional(),
    userId: z.string().optional(),
    isAutoGraded: z
      .string()
      .transform((v) => v === "true")
      .optional(),
    minScore: z.coerce.number().min(0).max(100).optional(),
    maxScore: z.coerce.number().min(0).max(100).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
  }),
});

export const getQuizAttemptByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Attempt ID wajib diisi"),
  }),
});

export const deleteQuizAttemptSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Attempt ID wajib diisi"),
  }),
});

export const quizAttemptSummarySchema = z.object({
  params: z.object({
    id: z.string().min(1, "Quiz ID wajib diisi"),
  }),
});

export const quizAttemptHistorySchema = z.object({
  query: z.object({
    courseId: z.string().optional(),
    minScore: z.preprocess(
      (val) => (val ? Number(val) : undefined),
      z.number().min(0).max(100).optional()
    ),
    maxScore: z.preprocess(
      (val) => (val ? Number(val) : undefined),
      z.number().min(0).max(100).optional()
    ),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

export const exportQuizAttemptSchema = z.object({
  query: z.object({
    format: z.enum(["csv", "excel"]).default("csv"),
  }),
});