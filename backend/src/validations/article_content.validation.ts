import { z } from "zod";

// ─── Content block sub-schemas ─────────────────────────────────────────────
// `key` opsional di semua tipe — dipakai buat nge-referensiin content ini
// sebagai target Link/Table of Content DI REQUEST YANG SAMA (lihat
// linkContentSchema & tableOfContentSchema di bawah).
//
// PENTING: member dari z.discriminatedUnion() WAJIB berupa ZodObject murni
// (bukan ZodEffects hasil .refine()/.superRefine()) — makanya semua
// validasi tambahan (superRefine) ditaruh di ATAS hasil discriminatedUnion-
// nya (articleBlockContentSchema di bawah), bukan di masing-masing schema
// member ini.

export const headingContentSchema = z.object({
  type: z.literal("heading"),
  key: z.string().min(1).optional(),
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
  key: z.string().min(1).optional(),
  text: z.string().min(1),
  orderNumber: z.number().int().min(1).optional(),
});

export const highlightContentSchema = z.object({
  type: z.literal("highlight"),
  key: z.string().min(1).optional(),
  text: z.string().max(1250),
  orderNumber: z.number().int().min(1).optional(),
});

export const dividerContentSchema = z.object({
  type: z.literal("divider"),
  key: z.string().min(1).optional(),
  style: z.enum(["SOLID", "DASHED"]).optional().default("SOLID"),
  orderNumber: z.number().int().min(1).optional(),
});

// Table — columns = header teks per kolom (urutan array = urutan kolom).
// rows[].cells harus PERSIS sepanjang columns (posisi cell selaras sama
// posisi kolom) — divalidasi di articleBlockContentSchema.superRefine.
export const tableContentSchema = z.object({
  type: z.literal("table"),
  key: z.string().min(1).optional(),
  orderNumber: z.number().int().min(1).optional(),
  columns: z.array(z.object({ header: z.string().min(1) })).min(1),
  rows: z.array(
    z.object({
      cells: z.array(z.string().nullable().optional()),
    }),
  ),
});

// Link — linkText: max 150 char (sesuai counter "0/150" di builder UI).
// linkType external_url -> wajib externalUrl.
// linkType article_section -> target boleh nunjuk ke CONTENT BLOCK
// (targetKey/targetContentBlockId) ATAU ke MEDIA gambar/video
// (targetMediaKey/targetAdditionalContentId) — isi SALAH SATU pasangan,
// divalidasi di articleBlockContentSchema.superRefine.
export const linkContentSchema = z.object({
  type: z.literal("link"),
  key: z.string().min(1).optional(),
  orderNumber: z.number().int().min(1).optional(),
  linkText: z.string().min(1).max(150),
  linkType: z.enum(["external_url", "article_section"]),
  externalUrl: z.string().url().optional(),
  // target ke content block (heading/paragraph/table/divider/dll)
  targetKey: z.string().min(1).optional(),
  targetContentBlockId: z.string().min(1).optional(),
  // target ke additional content (gambar/video)
  targetMediaKey: z.string().min(1).optional(),
  targetAdditionalContentId: z.string().min(1).optional(),
});

// Table of Content item — sama polanya kayak Link article_section: tiap
// item wajib punya SALAH SATU pasangan target (content block ATAU media).
// label dibatasi 50 char (sesuai counter "23/50" di builder UI).
const tableOfContentItemSchema = z.object({
  label: z.string().min(1).max(50),
  orderNumber: z.number().int().min(1),
  targetKey: z.string().min(1).optional(),
  targetContentBlockId: z.string().min(1).optional(),
  targetMediaKey: z.string().min(1).optional(),
  targetAdditionalContentId: z.string().min(1).optional(),
});

export const tableOfContentSchema = z.object({
  type: z.literal("table_of_content"),
  key: z.string().min(1).optional(),
  orderNumber: z.number().int().min(1).optional(),
  items: z.array(tableOfContentItemSchema).min(1),
});

// Helper — "isi salah satu pasangan, jangan dua-duanya, jangan kosong"
function hasExactlyOneTargetPair(input: {
  targetKey?: string;
  targetContentBlockId?: string;
  targetMediaKey?: string;
  targetAdditionalContentId?: string;
}): boolean {
  const wantsContent = !!(input.targetKey || input.targetContentBlockId);
  const wantsMedia = !!(
    input.targetMediaKey || input.targetAdditionalContentId
  );
  return wantsContent !== wantsMedia; // XOR — persis salah satu, bukan dua-duanya/kosong
}

export const articleBlockContentSchema = z
  .discriminatedUnion("type", [
    headingContentSchema,
    paragraphContentSchema,
    highlightContentSchema,
    dividerContentSchema,
    tableContentSchema,
    linkContentSchema,
    tableOfContentSchema,
  ])
  .superRefine((data, ctx) => {
    if (data.type === "table") {
      data.rows.forEach((row, i) => {
        if (row.cells.length !== data.columns.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["rows", i, "cells"],
            message: `Jumlah cells (${row.cells.length}) harus sama dengan jumlah columns (${data.columns.length})`,
          });
        }
      });
    }

    if (data.type === "link") {
      if (data.linkType === "external_url" && !data.externalUrl) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["externalUrl"],
          message: "externalUrl wajib diisi untuk linkType external_url",
        });
      }
      if (
        data.linkType === "article_section" &&
        !hasExactlyOneTargetPair(data)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["targetKey"],
          message:
            "Isi salah satu: (targetKey atau targetContentBlockId) untuk target content, ATAU (targetMediaKey atau targetAdditionalContentId) untuk target gambar/video — tidak boleh dua-duanya atau kosong",
        });
      }
    }

    if (data.type === "table_of_content") {
      data.items.forEach((item, i) => {
        if (!hasExactlyOneTargetPair(item)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["items", i, "targetKey"],
            message:
              "Isi salah satu: (targetKey atau targetContentBlockId) untuk target content, ATAU (targetMediaKey atau targetAdditionalContentId) untuk target gambar/video — tidak boleh dua-duanya atau kosong",
          });
        }
      });
    }
  });

// ─── Additional content — cuma image_video yang relevan buat artikel ──────
// (multiple_choice/matching/interactive_code sengaja nggak di-mirror,
// itu fitur assessment elearning, bukan konten artikel)
// `key` opsional — dipakai kalau ada Link/TOC di request yang sama yang
// mau nunjuk ke gambar/video ini (lewat targetMediaKey).

export const imageVideoSchema = z.object({
  type: z.literal("image_video"),
  key: z.string().min(1).optional(),
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
