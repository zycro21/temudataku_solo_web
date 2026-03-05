import { z } from "zod";

export const createMatchingQuestionSchema = z.object({
  params: z.object({
    interactiveId: z.string().min(1, "Interactive ID wajib diisi"),
  }),
  body: z.object({
    title: z.string().min(1).optional(),
    instruction: z.string().min(1).optional(),
    maxScore: z
      .number()
      .positive("Max score harus lebih besar dari 0")
      .max(1000, "Max score terlalu besar")
      .optional(),
  }),
});

export const getMatchingQuestionSchema = z.object({
  params: z.object({
    interactiveId: z.string().min(1),
  }),
  query: z.object({
    itemOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

export const updateMatchingQuestionSchema = z.object({
  params: z.object({
    interactiveId: z.string().min(1, "Interactive ID wajib diisi"),
  }),
  body: z
    .object({
      title: z.string().min(1).optional(),
      instruction: z.string().min(1).optional(),
      maxScore: z
        .number()
        .positive("Max score harus lebih besar dari 0")
        .max(1000, "Max score terlalu besar")
        .optional(),
    })
    .refine(
      (data) => Object.keys(data).length > 0,
      "Minimal satu field harus diupdate"
    ),
});

export const deleteMatchingQuestionSchema = z.object({
  params: z.object({
    interactiveId: z.string().min(1, "Interactive ID wajib diisi"),
  }),
});

export const checkMatchingExistenceSchema = z.object({
  params: z.object({
    interactiveId: z.string().min(1, "Interactive ID wajib diisi"),
  }),
});

export const getMatchingMetaSchema = z.object({
  params: z.object({
    interactiveId: z.string().min(1, "Interactive ID wajib diisi"),
  }),
});

export const createMatchingItemSchema = z.object({
  params: z.object({
    questionId: z.string().min(1),
  }),
  body: z.object({
    content: z.string().min(1, "Konten wajib diisi"),
    side: z.enum(["LEFT", "RIGHT"]),
    orderNumber: z.number().int().min(1).optional(), // ⬅️ optional
    matchWithId: z.string().optional(), // wajib jika LEFT
  }),
});

export const updateMatchingItemSchema = z.object({
  params: z.object({
    itemId: z.string().min(1, "Item ID wajib diisi"),
  }),
  body: z.object({
    content: z.string().min(1).optional(),
    orderNumber: z.number().int().positive().optional(),
    matchWithId: z.string().nullable().optional(),
  }),
});

export const deleteMatchingItemSchema = z.object({
  params: z.object({
    itemId: z.string().min(1, "Item ID wajib diisi"),
  }),
});

export const reorderMatchingItemsSchema = z.object({
  params: z.object({
    questionId: z.string().min(1, "Question ID wajib diisi"),
  }),
  body: z.object({
    side: z.enum(["LEFT", "RIGHT"]),
    orders: z
      .array(
        z.object({
          itemId: z.string().min(1),
          orderNumber: z.number().int().positive(),
        })
      )
      .min(1, "Minimal satu item harus dikirim"),
  }),
});

export const setMatchingPairsSchema = z.object({
  params: z.object({
    questionId: z.string().min(1, "Question ID wajib diisi"),
  }),
  body: z.object({
    pairs: z
      .array(
        z.object({
          leftId: z.string().min(1),
          rightId: z.string().min(1),
        })
      )
      .min(1, "Minimal satu pair harus dikirim"),
  }),
});

export const getMatchingPlaySchema = z.object({
  params: z.object({
    interactiveId: z.string().min(1, "Interactive ID wajib diisi"),
  }),
  query: z.object({
    sort: z.enum(["orderNumber", "createdAt"]).optional(),
    order: z.enum(["asc", "desc"]).optional(),
    limit: z.coerce.number().min(1).max(10000).optional(),
    offset: z.coerce.number().min(0).optional(),
  }),
});

export const getMatchingItemsEditorSchema = z.object({
  params: z.object({
    questionId: z.string().min(1, "Question ID wajib diisi"),
  }),
});
