import { z } from "zod";

export const createPracticeSchema = z.object({
  body: z.object({
    mentorId: z.string().min(1, "Mentor ID wajib diisi"),
    title: z.string().min(1, "Judul wajib diisi"),
    description: z.string().optional(),
    thumbnailImages: z
      .array(z.string().url("URL thumbnail tidak valid"))
      .optional(),
    price: z.number().nonnegative("Harga tidak boleh negatif"),
    practiceType: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),

    // Kolom tambahan yang baru
    benefits: z.string().optional(),
    toolsUsed: z.string().optional(),
    challenges: z.string().optional(),
    expectedOutcomes: z.string().optional(),
    estimatedDuration: z.string().optional(),
    targetAudience: z.string().optional(),
  }),
});

export const updatePracticeSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Practice ID wajib diisi"),
  }),
  body: z.object({
    mentorId: z.string().min(1, "Mentor ID wajib diisi").optional(),
    description: z.string().optional(),
    thumbnailImages: z
      .array(z.string().url("URL thumbnail tidak valid"))
      .optional(),
    price: z.number().nonnegative("Harga tidak boleh negatif").optional(),
    practiceType: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),

    // Tambahan kolom baru
    benefits: z.string().optional(),
    toolsUsed: z.string().optional(),
    challenges: z.string().optional(),
    expectedOutcomes: z.string().optional(),
    estimatedDuration: z.string().optional(),
    targetAudience: z.string().optional(),
  }),
});

export const getAdminPracticeListSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(100).optional().default(10),
    search: z.string().optional(),
    status: z.enum(["active", "inactive"]).optional(),
    category: z.string().optional(),
    mentorId: z.string().optional(),
    sortBy: z
      .enum(["title", "createdAt", "price"])
      .optional()
      .default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});

export const getAdminPracticeDetailSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Practice ID is required").cuid(),
  }),
});

export const getMentorPracticesQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(100).optional().default(10),
    sortBy: z.string().optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
    search: z.string().optional().default(""),
  }),
});

export const getMentorPracticeDetailParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Practice ID is required"),
  }),
});

export const getPublicPracticesQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    tags: z.string().optional(), // comma separated
    priceMin: z.coerce.number().optional(),
    priceMax: z.coerce.number().optional(),
    sortBy: z.enum(["createdAt", "price"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
  }),
});

export const getPracticePreviewSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Practice ID is required"),
  }),
});

export const createPracticeMaterialValidator = z.object({
  body: z.object({
    title: z.string().min(1, { message: "Title is required" }),
    description: z.string().optional(),
    status: z.string().optional(), // draft | active | inactive
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: "Start Date must be in YYYY-MM-DD format",
      })
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: "End Date must be in YYYY-MM-DD format",
      })
      .optional(),
  }),
  params: z.object({
    id: z.string().min(1, { message: "Practice ID is required" }),
  }),
});

export const updatePracticeMaterialValidator = z.object({
  params: z.object({
    id: z.string().min(1, { message: "Practice ID is required" }),
    materialId: z.string().min(1, { message: "Material ID is required" }),
  }),
  body: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      status: z.string().optional(), // contoh: draft | active | inactive
      startDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, {
          message: "Start Date must be in YYYY-MM-DD format",
        })
        .optional(),
      endDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, {
          message: "End Date must be in YYYY-MM-DD format",
        })
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided to update",
    }),
});

export const deletePracticeMaterialValidator = z.object({
  params: z.object({
    id: z.string().min(1, { message: "Practice ID is required" }),
    materialId: z.string().min(1, { message: "Material ID is required" }),
  }),
});

export const uploadPracticeFileValidator = z.object({
  body: z.object({
    materialId: z.string().min(1, { message: "Material ID is required" }),
    fileName: z.string().min(1, { message: "File name is required" }),
  }),
});

export const updatePracticeFileValidator = z.object({
  params: z.object({
    fileId: z.string().min(1, "fileId is required"),
  }),
  body: z.object({
    fileName: z.string().min(1, "fileName is required"),
  }),
});

export const deletePracticeFileValidator = z.object({
  params: z.object({
    fileId: z.string().min(1, "fileId is required"),
  }),
});

export const getPracticeFilesByMaterialValidator = z.object({
  params: z.object({
    materialId: z.string({
      required_error: "Material ID is required",
    }),
  }),
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/, "Page must be a number") // Pastikan page adalah angka
      .default("1"), // Default page 1 jika tidak ada
    limit: z
      .string()
      .regex(/^\d+$/, "Limit must be a number") // Pastikan limit adalah angka
      .default("10"), // Default limit 10 file per page
  }),
});

export const getPracticeMaterialsValidator = z.object({
  params: z.object({
    id: z.string({
      required_error: "Practice ID is required",
      invalid_type_error: "Practice ID must be a string",
    }),
  }),
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/, "Page must be a number") // Pastikan page adalah angka
      .default("1"), // Default page 1 jika tidak ada
    limit: z
      .string()
      .regex(/^\d+$/, "Limit must be a number") // Pastikan limit adalah angka
      .default("10"), // Default limit 10 file per page
  }),
});

export const getPracticeMaterialDetailValidator = z.object({
  params: z.object({
    id: z.string({
      required_error: "Practice ID is required",
      invalid_type_error: "Practice ID must be a string",
    }),
    materialId: z.string({
      required_error: "Material ID is required",
      invalid_type_error: "Material ID must be a string",
    }),
  }),
});

export const createPracticePurchaseSchema = z.object({
  body: z.object({
    practiceId: z.string().min(1, { message: "Practice ID is required" }),
    referralUsageId: z.string().optional(), // Tambahkan ini
  }),
  params: z.object({}),
});

export const cancelPracticePurchaseSchema = z.object({
  params: z.object({
    id: z.string().min(1, { message: "Practice Purchase ID is required" }),
  }),
});

export const getPracticePurchasesSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : 10)),
    status: z.string().optional(), // pending, confirmed, cancelled
    search: z.string().optional(), // cari berdasarkan title Practice
  }),
});

export const getPracticePurchaseDetailSchema = z.object({
  params: z.object({
    id: z.string(), // id PracticePurchase yang mau diambil detailnya
  }),
});

export const getAdminPracticePurchasesSchema = z.object({
  query: z.object({
    status: z.string().optional(), // pending, confirmed, cancelled
    user: z.string().optional(), // search by user name or email
    practice: z.string().optional(), // search by practice title
    startDate: z.string().optional(), // yyyy-mm-dd
    endDate: z.string().optional(), // yyyy-mm-dd
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    sortBy: z.string().optional(), // createdAt, purchaseDate, etc
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

export const getAdminPracticePurchaseDetailSchema = z.object({
  params: z.object({
    id: z.string().min(1, { message: "Practice Purchase ID is required" }),
  }),
});

export const updatePracticePurchaseStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, { message: "Practice Purchase ID is required" }),
  }),
  body: z.object({
    status: z.enum(["pending", "confirmed", "cancelled"]),
  }),
});

export const exportPracticePurchaseSchema = z.object({
  query: z.object({
    format: z.enum(["csv", "excel"]),
  }),
});

export const createOrUpdatePracticeProgressSchema = z.object({
  body: z.object({
    materialId: z.string().min(1, { message: "Material ID is required" }),
    userId: z.string().optional(), // Hanya mentor yang bisa kirim userId
    isCompleted: z.boolean().optional(),
    timeSpentSeconds: z.number().int().optional(),
  }),
});

export const updatePracticeProgressSchema = z.object({
  params: z.object({
    id: z.string().nonempty("ID is required"),
  }),
  body: z.object({
    isCompleted: z.boolean().optional(),
    timeSpentSeconds: z
      .number()
      .int()
      .min(0, "timeSpentSeconds must be a non-negative integer")
      .optional(),
    lastAccessed: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "lastAccessed must be in yyyy-mm-dd format")
      .optional()
      .transform((val) => (val ? new Date(val) : undefined))
      .refine((val) => !val || !isNaN(val.getTime()), {
        message: "lastAccessed must be a valid date",
      }),
  }),
});

export const getAllPracticeProgressSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : 1))
      .refine((val) => val >= 1, { message: "Page must be at least 1" }),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : 10))
      .refine((val) => val >= 1 && val <= 100, {
        message: "Limit must be between 1 and 100",
      }),
    search: z.string().max(100, "Search term too long").optional(),
  }),
});

export const getPracticeProgressByIdSchema = z.object({
  params: z.object({
    id: z.string().nonempty("ID is required"),
  }),
});

export const deletePracticeProgressSchema = z.object({
  params: z.object({
    id: z.string().nonempty("ID is required"),
  }),
});

export const createPracticeReviewSchema = z.object({
  body: z.object({
    practiceId: z.string().nonempty("Practice ID is required"),
    rating: z
      .number()
      .int()
      .min(1, "Rating must be at least 1")
      .max(5, "Rating cannot exceed 5"),
    comment: z
      .string()
      .max(1000, "Comment cannot exceed 1000 characters")
      .optional(),
  }),
});

export const updatePracticeReviewSchema = z.object({
  params: z.object({
    id: z.string().nonempty("ID is required"),
  }),
  body: z.object({
    comment: z
      .string()
      .max(1000, "Comment cannot exceed 1000 characters")
      .optional(),
  }),
});

export const getUserPracticeReviewsSchema = z.object({
  params: z.object({
    id: z.string().nonempty("User ID is required"),
  }),
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : 1))
      .refine((val) => val >= 1, { message: "Page must be at least 1" }),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : 10))
      .refine((val) => val >= 1 && val <= 100, {
        message: "Limit must be between 1 and 100",
      }),
  }),
});

export const getPracticeReviewsSchema = z.object({
  params: z.object({
    id: z.string().nonempty("Practice ID is required"),
  }),
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : 1))
      .refine((val) => val >= 1, { message: "Page must be at least 1" }),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : 10))
      .refine((val) => val >= 1 && val <= 100, {
        message: "Limit must be between 1 and 100",
      }),
  }),
});

export const updateAdminPracticeReviewSchema = z.object({
  params: z.object({
    id: z.string().nonempty("ID is required"),
  }),
  body: z.object({
    comment: z
      .string()
      .max(1000, "Comment cannot exceed 1000 characters")
      .optional(),
    rating: z
      .number()
      .int()
      .min(1, "Rating must be at least 1")
      .max(5, "Rating cannot exceed 5")
      .optional(),
  }),
});

export const deleteAdminPracticeReviewSchema = z.object({
  params: z.object({
    id: z.string().nonempty("ID is required"),
  }),
});

export const getAllAdminPracticeReviewsSchema = z.object({
  query: z
    .object({
      page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 1))
        .refine((val) => val >= 1, { message: "Page must be at least 1" }),
      limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 10))
        .refine((val) => val >= 1 && val <= 100, {
          message: "Limit must be between 1 and 100",
        }),
      search: z.string().max(100, "Search term too long").optional(),
      practiceId: z.string().optional(),
      userId: z.string().optional(),
      rating: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : undefined))
        .refine((val) => val === undefined || (val >= 1 && val <= 5), {
          message: "Rating must be between 1 and 5",
        }),
      startDate: z
        .string()
        .optional()
        .transform((val) => (val ? new Date(val) : undefined))
        .refine((val) => val === undefined || !isNaN(val.getTime()), {
          message: "Invalid start date format",
        }),
      endDate: z
        .string()
        .optional()
        .transform((val) => (val ? new Date(val) : undefined))
        .refine((val) => val === undefined || !isNaN(val.getTime()), {
          message: "Invalid end date format",
        }),
    })
    .refine(
      (data) =>
        !data.startDate || !data.endDate || data.startDate <= data.endDate,
      { message: "Start date must be before or equal to end date" }
    ),
});

export const getAdminPracticeReviewByIdSchema = z.object({
  params: z.object({
    id: z.string().nonempty("ID is required"),
  }),
});

export const exportAdminPracticeReviewsSchema = z.object({
  query: z
    .object({
      format: z.enum(["csv", "excel"], {
        message: "Format must be 'csv' or 'excel'",
      }),
      search: z.string().max(100, "Search term too long").optional(),
      practiceId: z.string().optional(),
      userId: z.string().optional(),
      rating: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : undefined))
        .refine((val) => val === undefined || (val >= 1 && val <= 5), {
          message: "Rating must be between 1 and 5",
        }),
      startDate: z
        .string()
        .optional()
        .transform((val) => (val ? new Date(val) : undefined))
        .refine((val) => val === undefined || !isNaN(val.getTime()), {
          message: "Invalid start date format",
        }),
      endDate: z
        .string()
        .optional()
        .transform((val) => (val ? new Date(val) : undefined))
        .refine((val) => val === undefined || !isNaN(val.getTime()), {
          message: "Invalid end date format",
        }),
    })
    .refine(
      (data) =>
        !data.startDate || !data.endDate || data.startDate <= data.endDate,
      { message: "Start date must be before or equal to end date" }
    ),
});
