import { z } from "zod";

// 🔥 BARU — dipakai POST /api/article/articles/:id/comments. `parentId`
// opsional: kosong = komentar top-level, diisi = reply ke komentar lain
// (termasuk reply ke reply, karena ArticleComment self-relation ke
// dirinya sendiri lewat parentId — jadi bertingkatnya bisa sedalam apa
// pun/"infinite", nggak ada batasan level di sini).
export const createArticleCommentSchema = z.object({
  body: z.object({
    content: z
      .string()
      .min(1, "Komentar tidak boleh kosong")
      .max(2000, "Komentar maksimal 2000 karakter")
      .trim(),
    parentId: z.string().optional(),
  }),
});

// Dipakai buat route yang param id-nya adalah ID KOMENTAR (misal
// POST /api/article/comments/:id/like) — dipisah dari articleIdParamSchema
// di articles.validator.ts (yang param id-nya ID ARTIKEL) biar nggak
// ketuker, walau bentuk validasinya sama persis.
export const articleCommentIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID komentar wajib diisi"),
  }),
});