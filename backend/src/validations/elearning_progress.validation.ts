import { z } from "zod";

export const getMyProgressSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    courseId: z.string().optional(),
    isCompleted: z
      .enum(["true", "false"])
      .transform((v) => v === "true")
      .optional(),
    sortBy: z.enum(["lastAccessed", "timeSpent", "createdAt"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

export const subBabIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "SubBab ID wajib diisi"),
  }),
});

export const completeSubBabSchema = z.object({
  params: z.object({
    id: z.string().min(1, "SubBab ID wajib diisi"),
  }),
});

export const updateProgressSchema = z.object({
  params: z.object({
    id: z.string().min(1, "SubBab ID wajib diisi"),
  }),
  body: z.object({
    timeSpent: z.number().int().min(0).optional(),
    lastAccessed: z.coerce.date().optional(),
    isCompleted: z.boolean().optional(),
  }),
});

export const getCourseProgressSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID wajib diisi"),
  }),
});

export const getSubChapterProgressSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID wajib diisi"),
  }),
});

export const getCourseRoadmapSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID wajib diisi"),
  }),
});

export const resetProgressSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID wajib diisi"),
  }),
});

export const exportProgressSchema = z.object({
  query: z.object({
    format: z.enum(["csv", "excel"]).default("csv"),
    courseId: z.string().min(1).optional(),
  }),
});
