import { z } from "zod";

// slug cuma boleh huruf kecil, angka, dan strip — biar aman dipakai di URL
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// 🔥 Dipakai buat field boolean yang dikirim lewat multipart/form-data
// (createArticle/updateArticle pakai handleArticleCoverUpload -> multer),
// di mana boolean selalu nyampe sebagai string "true"/"false", bukan
// boolean asli — sama kayak pola preprocess yang dipakai buat `tags`.
const booleanFromForm = z.preprocess((val) => {
  if (typeof val === "string") return val === "true";
  return val;
}, z.boolean());

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
    // 🔥 DIUBAH: category (string bebas) -> categoryId (relasi ke
    // ArticleCategory yang di-manage user lewat CRUD, bukan list fix lagi).
    categoryId: z.string().min(1, "Kategori wajib dipilih").optional(),
    tags: z.preprocess(
      (val) =>
        typeof val === "string" ? val.split(",").map((s) => s.trim()) : val,
      z.array(z.string()).optional(),
    ),
    status: z
      .enum(["DRAFT", "PUBLISHED", "ARCHIVED"])
      .optional()
      .default("DRAFT"),
    isRecommended: booleanFromForm.optional().default(false),
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
    categoryId: z.string().min(1, "Kategori wajib dipilih").optional(),
    tags: z.preprocess(
      (val) =>
        typeof val === "string" ? val.split(",").map((s) => s.trim()) : val,
      z.array(z.string()).optional(),
    ),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
    // sengaja nggak ada .default() — kalau nggak dikirim, service
    // mempertahankan nilai isRecommended yang lama (lihat updateArticle).
    isRecommended: booleanFromForm.optional(),
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

// 🔥 Query string (bukan form-data) — booleannya "true"/"false" juga
// datang sebagai string, makanya tetap butuh preprocess yang sama.
const booleanFromQuery = z.preprocess((val) => {
  if (typeof val === "string") return val === "true";
  return val;
}, z.boolean());

export const articleListQuerySchema = z.object({
  query: z.object({
    page: z.preprocess(
      (val) => (typeof val === "string" ? Number(val) : val),
      z.number().int().positive().optional().default(1),
    ),
    limit: z.preprocess(
      (val) => (typeof val === "string" ? Number(val) : val),
      z.number().int().positive().max(10000).optional().default(10),
    ),
    categoryId: z.string().optional(),
    tag: z.string().optional(),
    search: z.string().optional(),
    isRecommended: booleanFromQuery.optional(),
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
      z.number().int().positive().max(10000).optional().default(10),
    ),
    search: z.string().optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
    categoryId: z.string().optional(),
    isRecommended: booleanFromQuery.optional(),
    sortBy: z
      .enum(["title", "createdAt", "updatedAt", "status"])
      .optional()
      .default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});

// 🔥 BARU — favorite elemen konten artikel per-user (sidebar "Content
// Elements"). Daftar 9 elemen ini SENGAJA di-hardcode di sini (bukan
// nge-reuse enum ArticleContentBlockType), karena IMAGE & VIDEO itu
// konsepnya ArticleAdditionalContentType di backend, sementara di
// sidebar dia tampil sejajar sebagai "elemen" biasa. Kalau nanti nambah
// elemen baru di sidebar, tambahkan juga di sini SEKALIGUS di enum
// ArticleElementType (schema.prisma).
export const articleElementTypeEnum = z.enum([
  "HEADING",
  "PARAGRAPH",
  "IMAGE",
  "VIDEO",
  "TABLE",
  "HIGHLIGHT",
  "DIVIDER",
  "LINK",
  "TABLE_OF_CONTENT",
]);

export const toggleElementFavoriteSchema = z.object({
  body: z.object({
    elementType: articleElementTypeEnum,
  }),
});
