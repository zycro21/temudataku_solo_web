import { z } from "zod";

const discountTypeEnum = z.enum(["PERCENTAGE", "FLAT"]);
const productScopeEnum = z.enum([
  "GLOBAL",
  "ELEARNING",
  "PRACTICE",
  "MENTORING",
  "AYCL",
]);

export const getAllVouchersSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    productScope: productScopeEnum.optional(),
    discountType: discountTypeEnum.optional(),
    isActive: z
      .enum(["true", "false"])
      .optional()
      .transform((val) => (val === undefined ? undefined : val === "true")),
    page: z.preprocess(
      (val) => (val ? Number(val) : 1),
      z.number().int().min(1).default(1),
    ),
    limit: z.preprocess(
      (val) => (val ? Number(val) : 10),
      z.number().int().min(1).max(100).default(10),
    ),
    sortBy: z
      .enum(["createdAt", "code", "name", "expiryDate"])
      .default("createdAt")
      .optional(),
    order: z.enum(["asc", "desc"]).default("desc").optional(),
  }),
});

export const getVoucherByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID voucher wajib diisi"),
  }),
});

export const createVoucherSchema = z.object({
  body: z
    .object({
      code: z
        .string()
        .min(3, "Kode voucher minimal 3 karakter")
        .max(50, "Kode voucher maksimal 50 karakter")
        .regex(
          /^[A-Za-z0-9_-]+$/,
          "Kode voucher hanya boleh huruf, angka, underscore, dan dash",
        ),
      name: z.string().min(1, "Nama voucher wajib diisi"),
      description: z.string().optional(),
      discountType: discountTypeEnum,
      discountValue: z.number().positive("Nilai diskon harus lebih dari 0"),
      maxDiscountAmount: z.number().positive().optional(),
      minimumPurchase: z.number().min(0).optional(),
      productScope: productScopeEnum.default("GLOBAL"),
      usageLimit: z.number().int().positive().optional(),
      usageLimitPerUser: z.number().int().positive().default(1),
      startDate: z.coerce.date().optional(),
      expiryDate: z.coerce.date().optional(),
      isActive: z.boolean().default(true),
    })
    // Validasi 1: diskon persentase tidak boleh > 100
    .refine(
      (data) => data.discountType !== "PERCENTAGE" || data.discountValue <= 100,
      {
        message: "Nilai diskon persentase tidak boleh lebih dari 100",
        path: ["discountValue"],
      },
    )
    // Validasi 2: maxDiscountAmount hanya boleh dikirim kalau discountType PERCENTAGE
    .refine(
      (data) => !data.maxDiscountAmount || data.discountType === "PERCENTAGE",
      {
        message:
          "maxDiscountAmount hanya relevan untuk discountType PERCENTAGE",
        path: ["maxDiscountAmount"],
      },
    )
    // Validasi 3 dihapus — maxDiscountAmount (Rp) tidak bisa dibandingkan dengan discountValue (%)
    // Validasi 4: expiryDate harus setelah startDate
    .refine(
      (data) =>
        !data.startDate || !data.expiryDate || data.expiryDate > data.startDate,
      {
        message: "Tanggal kedaluwarsa harus setelah tanggal mulai",
        path: ["expiryDate"],
      },
    )
    // Validasi 5: expiryDate tidak boleh di masa lalu
    .refine((data) => !data.expiryDate || data.expiryDate > new Date(), {
      message: "Tanggal kedaluwarsa tidak boleh di masa lalu",
      path: ["expiryDate"],
    }),
});

export const updateVoucherSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID voucher wajib diisi"),
  }),
  body: z
    .object({
      code: z
        .string()
        .min(3, "Kode voucher minimal 3 karakter")
        .max(50, "Kode voucher maksimal 50 karakter")
        .regex(
          /^[A-Za-z0-9_-]+$/,
          "Kode voucher hanya boleh huruf, angka, underscore, dan dash",
        )
        .optional(),
      name: z.string().min(1, "Nama voucher tidak boleh kosong").optional(),
      description: z.string().optional(),
      discountType: discountTypeEnum.optional(),
      discountValue: z
        .number()
        .positive("Nilai diskon harus lebih dari 0")
        .optional(),
      maxDiscountAmount: z.number().positive().optional(),
      minimumPurchase: z.number().min(0).optional(),
      productScope: productScopeEnum.optional(),
      usageLimit: z.number().int().positive().optional(),
      usageLimitPerUser: z.number().int().positive().optional(),
      startDate: z.coerce.date().optional(),
      expiryDate: z.coerce.date().optional(),
      isActive: z.boolean().optional(),
    })
    // Validasi 1: kalau kedua discountType & discountValue dikirim sekaligus,
    // cek persentase tidak boleh > 100 (kalau salah satunya tidak dikirim,
    // validasi cross-field diselesaikan di service dengan data existing)
    .refine(
      (data) =>
        !(
          data.discountType === "PERCENTAGE" && data.discountValue !== undefined
        ) || data.discountValue! <= 100,
      {
        message: "Nilai diskon persentase tidak boleh lebih dari 100",
        path: ["discountValue"],
      },
    )
    // Validasi 2: maxDiscountAmount hanya boleh dikirim kalau discountType PERCENTAGE
    // (kalau discountType tidak dikirim, validasi cross-field diselesaikan di service)
    .refine(
      (data) =>
        !data.maxDiscountAmount ||
        !data.discountType ||
        data.discountType === "PERCENTAGE",
      {
        message:
          "maxDiscountAmount hanya relevan untuk discountType PERCENTAGE",
        path: ["maxDiscountAmount"],
      },
    )
    // Validasi 3: expiryDate harus setelah startDate (kalau keduanya dikirim)
    .refine(
      (data) =>
        !data.startDate || !data.expiryDate || data.expiryDate > data.startDate,
      {
        message: "Tanggal kedaluwarsa harus setelah tanggal mulai",
        path: ["expiryDate"],
      },
    )
    // Validasi 4: expiryDate tidak boleh di masa lalu
    .refine((data) => !data.expiryDate || data.expiryDate > new Date(), {
      message: "Tanggal kedaluwarsa tidak boleh di masa lalu",
      path: ["expiryDate"],
    }),
});

export const toggleVoucherActiveSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID voucher wajib diisi"),
  }),
});

export const deleteVoucherSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID voucher wajib diisi"),
  }),
});

export const validateVoucherSchema = z.object({
  body: z.object({
    code: z.string().min(1, "Kode voucher wajib diisi"),
    productScope: productScopeEnum,
    amount: z.number().positive("Amount harus lebih dari 0"),
  }),
});

export const applyCodeAyclSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Booking ID wajib diisi"),
  }),
  body: z.object({
    code: z
      .string()
      .min(3, "Kode minimal 3 karakter")
      .max(50, "Kode maksimal 50 karakter")
      .regex(/^[A-Za-z0-9_-]+$/, "Kode hanya boleh huruf, angka, - dan _"),
  }),
});

export const applyCodeBookingSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Booking ID wajib diisi"),
  }),
  body: z.object({
    code: z
      .string()
      .min(3, "Kode minimal 3 karakter")
      .max(50, "Kode maksimal 50 karakter")
      .regex(/^[A-Za-z0-9_-]+$/, "Kode hanya boleh huruf, angka, - dan _"),
  }),
});

export const applyCodeELearningSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Subscription ID wajib diisi"),
  }),
  body: z.object({
    code: z
      .string()
      .min(3, "Kode minimal 3 karakter")
      .max(50, "Kode maksimal 50 karakter")
      .regex(/^[A-Za-z0-9_-]+$/, "Kode hanya boleh huruf, angka, - dan _"),
  }),
});
