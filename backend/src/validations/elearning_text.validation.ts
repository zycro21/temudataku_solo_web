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
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
    blocks: z
      .array(
        z.object({
          content: z.string().min(1, "Konten block wajib diisi"),
          order: z.number().int().min(1),
        }),
      )
      .optional() // 🔥 ini kunci
      .default([])
      .refine((blocks) => {
        if (!blocks || blocks.length === 0) return true; // 🔥 tambahin ini

        const orders = blocks.map((b) => b.order);
        const uniqueOrders = new Set(orders);
        if (uniqueOrders.size !== orders.length) return false;

        const sorted = [...orders].sort((a, b) => a - b);
        for (let i = 0; i < sorted.length; i++) {
          if (sorted[i] !== i + 1) return false;
        }
        return true;
      }, "Order block harus unik dan berurutan mulai dari 1"),
  }),
});

export const updateTextSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID teks wajib diisi"),
  }),
  body: z
    .object({
      title: z.string().optional(),
      status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
      orderNumber: z.number().int().min(1).optional(),
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
    subBabId: z.string().min(1),
  }),
  body: z.object({
    orders: z
      .array(
        z.object({
          id: z.string().min(1),
          orderNumber: z.number().int().min(1),
        }),
      )
      .min(1),
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

export const getBlocksByTextSchema = z.object({
  params: z.object({
    textId: z.string().min(1, "Text ID wajib diisi"),
  }),
});

export const createTextBlockSchema = z.object({
  params: z.object({
    textId: z.string().min(1, "Text ID wajib diisi"),
  }),
  body: z.object({
    content: z.string().min(1, "Content block tidak boleh kosong"),
  }),
});

export const updateTextBlockSchema = z.object({
  params: z.object({
    blockId: z.string().min(1, "Block ID wajib diisi"),
  }),
  body: z.object({
    content: z.string().min(1, "Content tidak boleh kosong"),
  }),
});

export const deleteBlockSchema = z.object({
  params: z.object({
    blockId: z.string().min(1, "Block ID wajib diisi"),
  }),
});

export const reorderTextBlocksSchema = z.object({
  params: z.object({
    textId: z.string().min(1, "Text ID wajib diisi"),
  }),
  body: z.object({
    orders: z
      .array(
        z.object({
          blockId: z.string().min(1, "Block ID wajib diisi"),
          order: z.number().int().min(1, "Order minimal bernilai 1"),
        }),
      )
      .min(1, "Minimal satu block harus diubah urutannya"),
  }),
});

export const getSingleBlockSchema = z.object({
  params: z.object({
    blockId: z.string().min(1, "Block ID wajib diisi"),
  }),
});

export const exportTextBlockSchema = z.object({
  query: z.object({
    format: z.enum(["csv", "excel"]).default("csv"),
  }),
});

export const getTextContentSchema = z.object({
  params: z.object({
    textId: z.string().min(1, "Text ID wajib diisi"),
  }),
});
