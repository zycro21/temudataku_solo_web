import { z } from "zod";

export const getSubBabsBySubChapterSchema = z.object({
  params: z.object({
    subChapterId: z.string().min(1, "SubChapter ID wajib diisi"),
  }),
  query: z.object({
    page: z
      .preprocess((val) => (val ? Number(val) : 1), z.number().int().min(1))
      .default(1),
    limit: z
      .preprocess((val) => (val ? Number(val) : 10), z.number().int().min(1))
      .default(10),
    search: z.string().optional(),
    sort: z.enum(["asc", "desc"]).default("asc"),
  }),
});

export const getSubBabByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "SubBab ID wajib diisi"),
  }),
});

export const createSubBabSchema = z.object({
  params: z.object({
    subChapterId: z.string().min(1, "SubChapter ID wajib diisi"),
  }),
  body: z.object({
    title: z.string().min(1, "Judul wajib diisi"),
    estimatedTime: z.string().optional(),
  }),
});

export const updateSubBabSchema = z.object({
  params: z.object({
    id: z.string().min(1, "SubBab ID wajib diisi"),
  }),
  body: z.object({
    title: z.string().optional(),
    estimatedTime: z.string().optional(),
    orderNumber: z.number().int().positive().optional(),
  }),
});

export const deleteSubBabSchema = z.object({
  params: z.object({
    id: z.string().min(1, "SubBab ID wajib diisi"),
  }),
});

export const duplicateSubBabSchema = z.object({
  params: z.object({
    id: z.string().min(1, "SubBab ID wajib diisi"),
  }),
  body: z.object({
    targetSubChapterId: z.string().min(1, "Target SubChapter ID wajib diisi"),
    newTitle: z.string().optional(),
  }),
});

export const reorderSubBabSchema = z.object({
  params: z.object({
    subChapterId: z.string().min(1, "SubChapter ID wajib diisi"),
  }),
  body: z.object({
    updates: z
      .array(
        z.object({
          subBabId: z.string().min(1, "SubBab ID wajib diisi"),
          newOrderNumber: z.number().min(1, "Order number minimal 1"),
        })
      )
      .min(1, "Minimal satu sub-bab untuk diubah urutannya"),
  }),
});

export const getAllSubBabsSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((v) => (v ? parseInt(v) : 1)),
    limit: z
      .string()
      .optional()
      .transform((v) => (v ? parseInt(v) : 10)),
    search: z.string().optional(),
    sortBy: z
      .enum(["title", "createdAt", "orderNumber"])
      .optional()
      .default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});

export const exportSubBabsSchema = z.object({
  query: z.object({
    format: z.enum(["csv", "excel"]).default("csv"),
  }),
});
