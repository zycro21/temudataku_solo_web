import { z } from "zod";

export const getTextsBySubBabSchema = z.object({
  params: z.object({
    subBabId: z.string().min(1, "SubBab ID wajib diisi"),
  }),
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((v) => (v ? parseInt(v) : 1))
      .refine((v) => !isNaN(v) && v > 0, "Page harus berupa angka positif"),
    limit: z
      .string()
      .optional()
      .transform((v) => (v ? parseInt(v) : 10))
      .refine((v) => !isNaN(v) && v > 0, "Limit harus berupa angka positif"),
    search: z.string().optional(),
    sortBy: z.enum(["title", "createdAt", "orderNumber"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

export const getTextByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID teks wajib diisi"),
  }),
});

export const createTextSchema = z.object({
  params: z.object({
    subBabId: z.string().min(1, "SubBab ID wajib diisi"),
  }),
  body: z.object({
    title: z.string().optional(),
    textContent: z
      .string()
      .min(1, "Konten teks wajib diisi")
      .max(10000000, "Konten terlalu panjang"),
  }),
});

export const updateTextSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID teks wajib diisi"),
  }),
  body: z
    .object({
      title: z.string().optional(),
      textContent: z.string().optional(),
      orderNumber: z.number().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "Minimal satu field harus diupdate",
    }),
});

export const deleteTextSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID teks wajib diisi"),
  }),
});

export const reorderTextSchema = z.object({
  params: z.object({
    subBabId: z.string().min(1, "subBabId wajib diisi"),
  }),
  body: z.object({
    orders: z
      .array(
        z.object({
          id: z.string().min(1, "ID teks wajib diisi"),
          orderNumber: z
            .number()
            .int("orderNumber harus berupa integer")
            .min(1, "orderNumber minimal 1"),
        })
      )
      .nonempty("Daftar urutan teks tidak boleh kosong"),
  }),
});

export const searchTextSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    subBabId: z.string().optional(),
    page: z
      .string()
      .transform((v) => parseInt(v))
      .refine((v) => v > 0, "Page harus lebih besar dari 0")
      .optional()
      .default("1"),
    limit: z
      .string()
      .transform((v) => parseInt(v))
      .refine((v) => v > 0, "Limit harus lebih besar dari 0")
      .optional()
      .default("10"),
    sortBy: z
      .enum(["createdAt", "updatedAt", "title", "orderNumber"])
      .optional()
      .default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});

export const exportTextSchema = z.object({
  query: z.object({
    format: z.enum(["csv", "excel"]).default("csv"),
  }),
});

