import { z } from "zod";

export const createArticleCategorySchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, "Nama kategori wajib diisi")
      .max(100, "Nama kategori maksimal 100 karakter")
      .trim(),
  }),
});

export const updateArticleCategorySchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, "Nama kategori wajib diisi")
      .max(100, "Nama kategori maksimal 100 karakter")
      .trim(),
  }),
});

export const articleCategoryIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID kategori wajib diisi"),
  }),
});