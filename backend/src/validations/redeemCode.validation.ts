import { z } from "zod";

// Kode manual dari admin (kalau nggak diisi, service yang generate random)
// — huruf besar/angka/strip aja, biar konsisten sama yang di-generate otomatis.
const codeRegex = /^[A-Z0-9-]+$/;

// ─── POST /codes — admin generate kode baru ────────────────────────────────
export const createRedeemCodeSchema = z.object({
  body: z.object({
    planId: z.string().min(1, "Plan wajib diisi"),
    code: z
      .string()
      .min(4, "Kode minimal 4 karakter")
      .max(40)
      .regex(codeRegex, "Kode cuma boleh huruf besar, angka, dan strip")
      .optional(),
    maxUses: z.preprocess(
      (val) => (typeof val === "string" ? Number(val) : val),
      z.number().int().positive().optional().default(1),
    ),
    expiresAt: z.coerce.date({
      errorMap: () => ({ message: "Tanggal kadaluarsa tidak valid" }),
    }),
    note: z.string().max(500).optional(),
  }),
});

// ─── PATCH /codes/:id — admin update kode ──────────────────────────────────
// Sengaja TIDAK ada planId/code di sini — keduanya immutable setelah dibuat,
// biar integritas kode yang sudah dibagikan ke user nggak berubah tiba-tiba.
export const updateRedeemCodeSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID kode redeem wajib diisi"),
  }),
  body: z
    .object({
      maxUses: z.preprocess(
        (val) => (typeof val === "string" ? Number(val) : val),
        z.number().int().positive().optional(),
      ),
      expiresAt: z.coerce.date().optional(),
      isActive: z.preprocess(
        (val) => (val === "true" ? true : val === "false" ? false : val),
        z.boolean().optional(),
      ),
      note: z.string().max(500).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "Minimal satu field harus diupdate",
    }),
});

export const redeemCodeIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID kode redeem wajib diisi"),
  }),
});

// ─── GET /codes — admin list semua kode ────────────────────────────────────
export const listRedeemCodesQuerySchema = z.object({
  query: z.object({
    page: z.preprocess(
      (val) => (typeof val === "string" ? Number(val) : val),
      z.number().int().positive().optional().default(1),
    ),
    limit: z.preprocess(
      (val) => (typeof val === "string" ? Number(val) : val),
      z.number().int().positive().max(10000).optional().default(10),
    ),
    search: z.string().optional(), // cari di code / note
    planId: z.string().optional(),
    isActive: z.preprocess(
      (val) => (val === "true" ? true : val === "false" ? false : val),
      z.boolean().optional(),
    ),
  }),
});

// ─── POST /redeem — user redeem kode ───────────────────────────────────────
export const redeemCodeSchema = z.object({
  body: z.object({
    code: z.string().min(1, "Kode redeem wajib diisi"),
  }),
});

// ─── GET /usages — dual-role (admin lihat semua, user lihat punya sendiri) ─
export const listRedeemUsagesQuerySchema = z.object({
  query: z.object({
    page: z.preprocess(
      (val) => (typeof val === "string" ? Number(val) : val),
      z.number().int().positive().optional().default(1),
    ),
    limit: z.preprocess(
      (val) => (typeof val === "string" ? Number(val) : val),
      z.number().int().positive().max(100).optional().default(10),
    ),
    // userId cuma berlaku buat admin — di-service, non-admin selalu
    // dipaksa filter ke userId dirinya sendiri, query ini diabaikan.
    userId: z.string().optional(),
    redeemCodeId: z.string().optional(),
  }),
});