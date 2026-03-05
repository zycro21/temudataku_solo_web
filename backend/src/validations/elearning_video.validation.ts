import { z } from "zod";

export const createVideoSchema = z.object({
  params: z.object({
    id: z.string().min(1, "SubBab ID wajib diisi"),
  }),
  body: z.object({
    title: z.string().min(1, "Judul video wajib diisi"),
    anchor: z.object({
      blockId: z.string().min(1, "Block ID wajib diisi"),
      position: z.enum(["BEFORE", "INLINE", "AFTER"]),
    }),
  }),
});

export const updateVideoSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Video ID wajib diisi"),
  }),
  body: z.object({
    title: z.string().min(1).optional(),
    isPreview: z.boolean().optional(),
    anchor: z
      .object({
        blockId: z.string().min(1),
        position: z.enum(["BEFORE", "INLINE", "AFTER"]),
        orderNumber: z.number().int().positive().optional(),
      })
      .optional(),
  }),
});

export const getVideoByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const getVideosBySubBabSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(10000).default(10000),
    sortBy: z
      .enum(["orderNumber", "createdAt", "title"])
      .default("orderNumber"),
    sortOrder: z.enum(["asc", "desc"]).default("asc"),
  }),
});

export const reorderVideosSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    blockId: z.string().min(1),
    orders: z
      .array(
        z.object({
          videoId: z.string().min(1),
          orderNumber: z.number().int().positive(),
        })
      )
      .min(1),
  }),
});

export const togglePreviewSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    isPreview: z.boolean(),
  }),
});

export const moveVideoSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Video ID wajib diisi"),
  }),
  body: z.object({
    targetBlockId: z.string().min(1, "Target block wajib diisi"),
    position: z.enum(["BEFORE", "INLINE", "AFTER"]),
    orderNumber: z.number().int().positive().optional(),
  }),
});

export const getVideosByBlockSchema = z.object({
  params: z.object({
    blockId: z.string().min(1, "Block ID wajib diisi"),
  }),
});
