import { z } from "zod";

export const getAllCoursesSchema = z.object({
  query: z.object({
    category: z.string().optional(),
    level: z.string().optional(),
    mentorId: z.string().optional(),
    search: z.string().optional(),
    page: z.preprocess(
      (val) => (val ? Number(val) : 1),
      z.number().int().min(1).default(1)
    ),
    limit: z.preprocess(
      (val) => (val ? Number(val) : 10),
      z.number().int().min(1).max(10000).default(10000)
    ),
    sortBy: z
      .enum(["createdAt", "title", "price"])
      .default("createdAt")
      .optional(),
    order: z.enum(["asc", "desc"]).default("desc").optional(),
  }),
});

export const getCourseByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID kursus harus diisi"),
  }),
});

export const createCourseSchema = z.object({
  body: z.object({
    mentorId: z.string().min(1, "Mentor ID wajib diisi"),
    title: z.string().min(1, "Judul wajib diisi"),
    description: z.string().optional(),
    thumbnailImages: z.array(z.string()).optional(),
    price: z.preprocess(
      (val) => (typeof val === "string" ? Number(val) : val),
      z.number().nonnegative("Harga tidak boleh negatif")
    ),
    category: z.string().optional(),
    tags: z.preprocess(
      (val) =>
        typeof val === "string" ? val.split(",").map((s) => s.trim()) : val,
      z.array(z.string()).optional()
    ),
    targetAudience: z.string().optional(),
    level: z.string().optional(),
    estimatedDuration: z.preprocess(
      (val) => (typeof val === "number" ? val.toString() : val),
      z.string().optional()
    ),
    benefits: z.string().optional(),
    toolsUsed: z.string().optional(),
    isActive: z.preprocess(
      (val) => (val === "true" ? true : val === "false" ? false : val),
      z.boolean().optional()
    ),
  }),
});

export const updateCourseSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID kursus harus diisi"),
  }),
  body: z.object({
    mentorId: z.preprocess((val) => val?.toString(), z.string().optional()),
    title: z.string().optional(),
    description: z.string().optional(),
    thumbnailImages: z.array(z.string()).optional(),
    price: z.preprocess(
      (val) => (typeof val === "string" ? Number(val) : val),
      z.number().optional()
    ),
    category: z.string().optional(),
    tags: z.preprocess(
      (val) =>
        typeof val === "string" ? val.split(",").map((s) => s.trim()) : val,
      z.array(z.string()).optional()
    ),
    targetAudience: z.string().optional(),
    level: z.string().optional(),
    estimatedDuration: z.preprocess(
      (val) => val?.toString(),
      z.string().optional()
    ),
    benefits: z.string().optional(),
    toolsUsed: z.string().optional(),
    isActive: z.preprocess(
      (val) => (val === "true" ? true : val === "false" ? false : val),
      z.boolean().optional()
    ),
  }),
});

export const toggleStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID kursus harus diisi"),
  }),
  body: z.object({
    isActive: z.boolean(),
  }),
});

export const deleteCourseSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID kursus harus diisi"),
  }),
});

export const getCoursesSchema = z.object({
  query: z.object({
    category: z.string().optional(),
    level: z.string().optional(),
    mentorId: z.string().optional(),
    search: z.string().optional(),
    page: z.string().regex(/^\d+$/, "Page harus angka").optional(),
    limit: z.string().regex(/^\d+$/, "Limit harus angka").optional(),
  }),
});

export const getCourseDetailSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID kursus harus diisi"),
  }),
});

export const getCourseStatisticsSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const exportCoursesSchema = z.object({
  query: z.object({
    format: z.enum(["csv", "excel"]).default("csv"),
  }),
});

export const exportProductEventSchema = z.object({
  query: z.object({
    format: z.enum(["csv", "excel"]).default("csv"),
  }),
});
