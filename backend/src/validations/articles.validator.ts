import { z } from "zod";

// slug cuma boleh huruf kecil, angka, dan strip — biar aman dipakai di URL
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createArticleSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Judul wajib diisi"),
    // opsional: kalau nggak dikirim, service yang generate dari title
    slug: z
      .string()
      .min(1)
      .regex(slugRegex, "Slug hanya boleh huruf kecil, angka, dan tanda strip")
      .optional(),
    excerpt: z.string().optional(),
    coverImage: z.string().optional(), // di-override controller kalau ada file upload
    category: z.string().optional(),
    tags: z.preprocess(
      (val) =>
        typeof val === "string" ? val.split(",").map((s) => s.trim()) : val,
      z.array(z.string()).optional(),
    ),
    status: z
      .enum(["DRAFT", "PUBLISHED", "ARCHIVED"])
      .optional()
      .default("DRAFT"),
  }),
});

export const updateArticleSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Judul wajib diisi").optional(),
    slug: z
      .string()
      .min(1)
      .regex(slugRegex, "Slug hanya boleh huruf kecil, angka, dan tanda strip")
      .optional(),
    excerpt: z.string().optional(),
    coverImage: z.string().optional(),
    category: z.string().optional(),
    tags: z.preprocess(
      (val) =>
        typeof val === "string" ? val.split(",").map((s) => s.trim()) : val,
      z.array(z.string()).optional(),
    ),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  }),
});

export const articleIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID artikel wajib diisi"),
  }),
});

export const articleSlugParamSchema = z.object({
  params: z.object({
    slug: z.string().min(1, "Slug artikel wajib diisi"),
  }),
});

export const articleListQuerySchema = z.object({
  query: z.object({
    page: z.preprocess(
      (val) => (typeof val === "string" ? Number(val) : val),
      z.number().int().positive().optional().default(1),
    ),
    limit: z.preprocess(
      (val) => (typeof val === "string" ? Number(val) : val),
      z.number().int().positive().max(100).optional().default(10),
    ),
    category: z.string().optional(),
    tag: z.string().optional(),
    search: z.string().optional(),
  }),
});

// 🔥 Khusus admin — beda dari articleListQuerySchema di atas (yang publik):
// ada filter status & sorting, karena tabel admin nampilin semua status
// sekaligus dan butuh sortable columns.
// 🔥 FIX: max di-naikin dari 200 ke 1000 — ArtikelTable.tsx fetch dengan
// limit: 1000 (fetch sekali, sort/filter/paginate di client, sama pola
// StreamsTable), jadi kalau max-nya masih 200, Zod nolak duluan dan bikin
// 400 di request paling awal (bug sama yang kejadian di redeemCode.validation.ts).
export const adminArticleListQuerySchema = z.object({
  query: z.object({
    page: z.preprocess(
      (val) => (typeof val === "string" ? Number(val) : val),
      z.number().int().positive().optional().default(1),
    ),
    limit: z.preprocess(
      (val) => (typeof val === "string" ? Number(val) : val),
      z.number().int().positive().max(1000).optional().default(10),
    ),
    search: z.string().optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
    sortBy: z
      .enum(["title", "createdAt", "updatedAt", "status"])
      .optional()
      .default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});
