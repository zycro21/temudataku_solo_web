import { z } from "zod";

export const createQuestionSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Quiz ID wajib diisi"),
  }),
  body: z.object({
    questionText: z.string().min(1, "Teks pertanyaan wajib diisi"),
    options: z.array(z.string()).min(2, "Minimal 2 opsi jawaban"),
    correctAnswer: z.string().min(1, "Jawaban benar wajib diisi"),
    explanation: z.string().optional(),
  }),
});

export const updateQuestionSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Question ID wajib diisi"),
  }),
  body: z.object({
    questionText: z.string().optional(),
    options: z.array(z.string()).min(2, "Minimal 2 opsi jawaban").optional(),
    correctAnswer: z.string().optional(),
    explanation: z.string().optional(),
    orderNumber: z.number().int().positive().optional(),
  }),
});

export const getQuestionsByQuizSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Quiz ID wajib diisi"),
  }),
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    sortBy: z.enum(["createdAt", "orderNumber"]).optional(),
    order: z.enum(["asc", "desc"]).optional(),
  }),
});

export const getQuestionByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Question ID wajib diisi"),
  }),
});

export const deleteQuestionSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Question ID wajib diisi"),
  }),
});

export const duplicateQuestionSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Question ID wajib diisi"),
  }),
  body: z.object({
    targetQuizId: z.string().min(1, "Quiz tujuan wajib diisi"),
  }),
});

export const globalViewQuestionSchema = z.object({
  query: z.object({
    page: z
      .string()
      .transform((val) => parseInt(val))
      .default("1")
      .refine((v) => v > 0, "page harus lebih besar dari 0"),
    limit: z
      .string()
      .transform((val) => parseInt(val))
      .default("10")
      .refine((v) => v > 0 && v <= 100, "limit antara 1–100"),
    sortBy: z
      .enum(["createdAt", "questionText", "orderNumber"])
      .optional()
      .default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
    search: z.string().optional(),
    quizId: z.string().optional(),
  }),
});

export const exportQuestionSchema = z.object({
  query: z.object({
    format: z.enum(["csv", "excel"]).default("csv"),
  }),
});