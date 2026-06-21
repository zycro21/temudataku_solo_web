import { z } from "zod";

export const getSubChaptersByCourseSchema = z.object({
  params: z.object({
    courseId: z.string().min(1, "Course ID wajib diisi"),
  }),
  query: z.object({
    page: z
      .preprocess((val) => (val ? Number(val) : 1), z.number().int().min(1))
      .default(1),
    limit: z
      .preprocess((val) => (val ? Number(val) : 10), z.number().int().min(1))
      .default(10),
    search: z.string().optional(),
    orderNumber: z.preprocess(
      (val) => (val ? Number(val) : undefined),
      z.number().int().optional(),
    ),
  }),
});

export const getSubChapterByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Sub-chapter ID wajib diisi"),
  }),
});

export const createSubChapterSchema = z.object({
  params: z.object({
    courseId: z.string().min(1),
  }),
  body: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    orderNumber: z.preprocess(
      (val) => (typeof val === "string" ? Number(val) : val),
      z.number().int().min(1),
    ),
    estimatedTime: z.preprocess(
      (val) => (val !== undefined && val !== null ? String(val) : val),
      z.string().optional(),
    ),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  }),
});

export const updateSubChapterSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Sub-chapter ID wajib diisi"),
  }),
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    orderNumber: z.preprocess(
      (val) => (typeof val === "string" ? Number(val) : val),
      z.number().int().min(1).optional(),
    ),
    estimatedTime: z.preprocess(
      (val) => (val !== undefined && val !== null ? String(val) : val),
      z.string().optional(),
    ),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  }),
});

export const deleteSubChapterSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Sub-chapter ID wajib diisi"),
  }),
});

export const reorderSubChapterSchema = z.object({
  params: z.object({
    courseId: z.string().min(1, "Course ID wajib diisi"),
  }),
  body: z.object({
    newOrder: z
      .array(z.string().min(1, "ID sub-chapter tidak boleh kosong"))
      .nonempty("Array newOrder tidak boleh kosong"),
  }),
});

export const duplicateSubChapterSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Sub-chapter ID wajib diisi"),
  }),
});

export const listSubChaptersSchema = z.object({
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
    courseId: z.string().optional(),
    sortBy: z
      .string()
      .optional()
      .refine(
        (val) => !val || ["title", "orderNumber", "createdAt"].includes(val),
        "sortBy tidak valid",
      ),
    sortOrder: z
      .string()
      .optional()
      .refine(
        (val) => !val || ["asc", "desc"].includes(val.toLowerCase()),
        "sortOrder tidak valid",
      ),
  }),
});

export const exportSubChaptersSchema = z.object({
  query: z.object({
    format: z.enum(["csv", "excel"]).default("csv"),
  }),
});

export const getSubChapterHistorySchema = z.object({
  params: z.object({
    id: z.string().min(1, "Sub-chapter ID wajib diisi"),
  }),
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1))
      .refine((val) => !isNaN(val) && val > 0, {
        message: "page harus berupa angka positif",
      }),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10))
      .refine((val) => !isNaN(val) && val > 0 && val <= 100, {
        message: "limit harus berupa angka positif (maks. 100)",
      }),
  }),
});