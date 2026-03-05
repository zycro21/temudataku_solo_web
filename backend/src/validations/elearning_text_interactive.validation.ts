import { z } from "zod";

export const createInteractiveSchema = z.object({
  params: z.object({
    textId: z.string().min(1, "Text ID wajib diisi"),
  }),
  body: z.object({
    type: z.enum(
      ["MATCHING", "DRAG_DROP", "TRUE_FALSE", "FILL_BLANK", "MULTIPLE_CHOICE"],
      { errorMap: () => ({ message: "Tipe interactive tidak valid" }) }
    ),
    anchor: z.object({
      blockId: z.string().min(1, "Block ID wajib diisi"),
      position: z.enum(["BEFORE", "INLINE", "AFTER"]),
      orderNumber: z.number().int().optional(),
    }),
  }),
});

export const getInteractivesByTextSchema = z.object({
  params: z.object({
    textId: z.string().min(1, "Text ID wajib diisi"),
  }),
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(10),
    sortOrder: z.enum(["asc", "desc"]).default("asc"),
    type: z
      .enum([
        "MATCHING",
        "DRAG_DROP",
        "TRUE_FALSE",
        "FILL_BLANK",
        "MULTIPLE_CHOICE",
      ])
      .optional(),
  }),
});

export const updateInteractiveSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    type: z
      .enum([
        "MATCHING",
        "DRAG_DROP",
        "TRUE_FALSE",
        "FILL_BLANK",
        "MULTIPLE_CHOICE",
      ])
      .optional(),

    anchor: z
      .object({
        blockId: z.string().min(1),
        position: z.enum(["BEFORE", "AFTER", "INLINE"]),
        orderNumber: z.number().int().min(1).optional(),
      })
      .optional(),
  }),
});

export const deleteInteractiveSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Interactive ID wajib diisi"),
  }),
});

export const reorderInteractiveSchema = z.object({
  params: z.object({
    textId: z.string().min(1),
  }),
  body: z.object({
    blockId: z.string().min(1),
    orders: z
      .array(
        z.object({
          anchorId: z.string().min(1),
          orderNumber: z.number().int().min(1),
        })
      )
      .min(1),
  }),
});

export const getInteractiveDetailSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Interactive ID wajib diisi"),
  }),
});

export const moveInteractiveSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Interactive ID wajib diisi"),
  }),
  body: z.object({
    targetBlockId: z.string().min(1, "Target block wajib diisi"),
    position: z.enum(["BEFORE", "INLINE", "AFTER"]).default("AFTER"),
  }),
});

export const getInteractivesByBlockSchema = z.object({
  params: z.object({
    blockId: z.string().min(1, "Block ID wajib diisi"),
  }),
});

export const exportInteractiveSchema = z.object({
  query: z.object({
    format: z.enum(["csv", "excel"]).default("csv"),
  }),
});
