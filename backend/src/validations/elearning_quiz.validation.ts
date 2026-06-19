import { z } from "zod";

export const createQuizSchema = z.object({
  params: z.object({
    textId: z.string().min(1, "Text ID wajib diisi"),
  }),

  body: z.object({
    title: z.string().min(1, "Judul quiz wajib diisi"),
    description: z.string().optional(),
    timeLimitMinutes: z.number().int().positive().optional(),
  }),
});

export const getQuizBySubBabSchema = z.object({
  params: z.object({
    subBabId: z.string().min(1, "SubBab ID wajib diisi"),
  }),
  query: z.object({
    search: z.string().optional(),
    sortBy: z
      .enum(["title", "createdAt", "updatedAt"])
      .optional()
      .default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
    page: z
      .string()
      .optional()
      .transform((v) => Number(v) || 1),
    limit: z
      .string()
      .optional()
      .transform((v) => Number(v) || 10),
  }),
});

export const getQuizByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Quiz ID wajib diisi"),
  }),
});

export const updateQuizSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Quiz ID wajib diisi"),
  }),
  body: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      timeLimitMinutes: z.number().int().positive().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "Minimal satu field harus diisi untuk update",
    }),
});

export const quizParamSchema = z.object({
  params: z.object({
    subBabId: z.string().optional(),
    id: z.string().optional(),
  }),
});

export const deleteQuizSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Quiz ID wajib diisi"),
  }),
});

export const getAllQuizSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    sortBy: z
      .enum(["title", "createdAt", "updatedAt", "totalQuestions"])
      .optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    page: z.string().transform(Number).default("1"),
    limit: z.string().transform(Number).default("10"),
    courseId: z.string().optional(),
    mentorId: z.string().optional(),
  }),
});

export const getQuizzesByCourseSchema = z.object({
  params: z.object({
    courseId: z.string().min(1, "Course ID wajib diisi"),
  }),
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : 10)),
    search: z.string().optional(),
    sortBy: z.string().optional().default("createdAt"),
    order: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});

export const exportQuizSchema = z.object({
  query: z.object({
    format: z.enum(["csv", "excel"]).default("csv"),
  }),
});
