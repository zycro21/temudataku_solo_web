import { z } from "zod";

// ─── Content block sub-schemas ─────────────────────────────────────────────

export const headingContentSchema = z.object({
  type: z.literal("heading"),
  level: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
    z.literal(6),
  ]),
  text: z.string().min(1),
  orderNumber: z.number().int().min(1).optional(),
});

export const paragraphContentSchema = z.object({
  type: z.literal("paragraph"),
  text: z.string().min(1),
  orderNumber: z.number().int().min(1).optional(),
});

export const highlightContentSchema = z.object({
  type: z.literal("highlight"),
  text: z.string().max(1250),
  orderNumber: z.number().int().min(1).optional(),
});

export const accordionContentSchema = z.object({
  type: z.literal("accordion"),
  title: z.string().min(1),
  description: z.string().optional(),
  orderNumber: z.number().int().min(1).optional(),
  items: z
    .array(
      z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        orderNumber: z.number().int().min(1),
      }),
    )
    .min(1),
});

export const carouselContentSchema = z.object({
  type: z.literal("carousel"),
  title: z.string().min(1),
  description: z.string().optional(),
  cardsPerSlide: z.number().int().min(1).optional(),
  orderNumber: z.number().int().min(1).optional(),
  items: z
    .array(
      z.object({
        title: z.string().min(1),
        image: z.string().url().optional(),
        content: z.string().optional(),
        orderNumber: z.number().int().min(1),
      }),
    )
    .min(1),
});

export const contentCardSchema = z.object({
  type: z.literal("content_card"),
  title: z.string().min(1),
  description: z.string().optional(),
  disableExpandableContent: z.boolean(),
  orderNumber: z.number().int().min(1).optional(),
  items: z
    .array(
      z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        expandableContent: z.string().optional(),
        orderNumber: z.number().int().min(1),
      }),
    )
    .min(1),
});

export const tabNavigationSchema = z.object({
  type: z.literal("tab_navigation"),
  title: z.string().min(1),
  description: z.string().optional(),
  orderNumber: z.number().int().min(1).optional(),
  tabs: z
    .array(
      z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        orderNumber: z.number().int().min(1),
      }),
    )
    .min(1),
});

export const summaryContentSchema = z.object({
  type: z.literal("summary"),
  orderNumber: z.number().int().min(1).optional(),
  comments: z.array(z.string().min(1)).min(1),
});

export const articleBlockContentSchema = z.discriminatedUnion("type", [
  headingContentSchema,
  paragraphContentSchema,
  highlightContentSchema,
  accordionContentSchema,
  carouselContentSchema,
  contentCardSchema,
  tabNavigationSchema,
  summaryContentSchema,
]);

// ─── Additional content — cuma image_video yang relevan buat artikel ──────
// (multiple_choice/matching/interactive_code sengaja nggak di-mirror,
// itu fitur assessment elearning, bukan konten artikel)

export const imageVideoSchema = z.object({
  type: z.literal("image_video"),
  position: z.enum(["BEFORE", "AFTER", "INLINE"]),
  orderNumber: z.number().int().min(1).optional(),
  isNewUpload: z.boolean(),
  content: z.object({
    url: z.string().url().optional(), // wajib diisi kalau isNewUpload = false
    title: z.string().optional(),
    caption: z.string().optional(),
    description: z.string().optional(),
    mediaType: z.enum(["IMAGE", "VIDEO"]),
    thumbnailUrl: z.string().url().optional(),
    durationSeconds: z.number().int().min(0).optional(),
    widthPercent: z.number().int().min(10).max(100).optional(),
  }),
});

export const articleAdditionalContentSchema = z.discriminatedUnion("type", [
  imageVideoSchema,
]);

// ─── Block schema (dipakai endpoint bulk-replace) ──────────────────────────

export const articleBlockSchema = z.object({
  orderNumber: z.number().int().min(1),
  contents: z.array(articleBlockContentSchema).optional().default([]),
  additionalContents: z
    .array(articleAdditionalContentSchema)
    .optional()
    .default([]),
});

// ─── Endpoint: PUT /articles/:id/content (bulk-replace semua block) ───────
// Sengaja full-replace (bukan patch parsial) — kirim blocks: [] buat
// mengosongkan semua konten artikel.

export const updateArticleContentSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID artikel wajib diisi"),
  }),
  body: z.object({
    blocks: z.array(articleBlockSchema).default([]),
  }),
});

// ─── Endpoint: param-only, buat GET list & GET by id di level artikel ─────

export const articleIdOnlyParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID artikel wajib diisi"),
  }),
});

// ─── Endpoint: POST /articles/:id/content/blocks (create 1 block baru) ────

export const createArticleBlockSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID artikel wajib diisi"),
  }),
  body: z.object({
    // opsional — kalau nggak dikirim, block baru ditaruh di posisi paling akhir
    orderNumber: z.number().int().min(1).optional(),
    contents: z.array(articleBlockContentSchema).optional().default([]),
    additionalContents: z
      .array(articleAdditionalContentSchema)
      .optional()
      .default([]),
  }),
});

// ─── Endpoint: param-only buat GET by id / DELETE 1 block ─────────────────

export const articleBlockParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID artikel wajib diisi"),
    blockId: z.string().min(1, "ID block wajib diisi"),
  }),
});

// ─── Endpoint: PATCH /articles/:id/content/blocks/:blockId (update 1 block) ─

export const updateArticleBlockSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID artikel wajib diisi"),
    blockId: z.string().min(1, "ID block wajib diisi"),
  }),
  body: z
    .object({
      orderNumber: z.number().int().min(1).optional(),
      contents: z.array(articleBlockContentSchema).optional(),
      additionalContents: z.array(articleAdditionalContentSchema).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "Minimal satu field harus diupdate",
    }),
});