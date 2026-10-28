import { z } from "zod";

const idString = z.string().trim().min(1).max(100);
const formType = z.enum(["EVENT", "NON_EVENT"]);

const categoryName = z
  .string()
  .trim()
  .min(1, "Nama jenis wajib diisi")
  .max(80, "Nama jenis maksimal 80 karakter");
const categoryDescription = z
  .string()
  .trim()
  .max(500, "Deskripsi maksimal 500 karakter")
  .nullable()
  .optional();

// ─── Endpoint: GET /categories (halaman Jenis Form) ─────────────────────────
// Daftar jenis dipisah per tipe, jadi type wajib. Tanpa pagination: jumlah
// jenis kecil dan halaman menampilkannya sekaligus.

export const listCategoriesSchema = z.object({
  query: z.object({
    type: formType,
    search: z.string().trim().max(100).optional(),
  }),
});

// ─── Endpoint: POST /categories ─────────────────────────────────────────────

export const createCategorySchema = z.object({
  body: z.object({
    type: formType,
    name: categoryName,
    description: categoryDescription,
  }),
});

// ─── Endpoint: PATCH /categories/:id (nama / deskripsi) ─────────────────────
// Tipe jenis tidak bisa diubah: form yang sudah memakainya bisa jadi tidak cocok.

export const updateCategorySchema = z.object({
  params: z.object({ id: idString }),
  body: z
    .object({
      name: categoryName.optional(),
      description: categoryDescription,
    })
    .refine((d) => Object.keys(d).length > 0, {
      message: "Minimal satu field harus diupdate",
    }),
});

// ─── Endpoint param-only (DELETE /categories/:id) ───────────────────────────

export const categoryIdParamSchema = z.object({
  params: z.object({ id: idString }),
});

// ─── Tipe input (dipakai service) ───────────────────────────────────────────

export type ListCategoriesQuery = z.infer<typeof listCategoriesSchema>["query"];
export type CreateCategoryInput = z.infer<typeof createCategorySchema>["body"];
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>["body"];
