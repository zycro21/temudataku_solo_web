import { z } from "zod";

export const createFeedbackSchema = z.object({
  body: z.object({
    sessionId: z.string().min(1, "Session ID wajib diisi"), // Pastikan sessionId ada dan valid
    rating: z
      .number()
      .int("Rating harus berupa angka bulat") // Pastikan rating berupa integer
      .min(1, "Rating harus lebih besar atau sama dengan 1")
      .max(5, "Rating harus lebih kecil atau sama dengan 5"), // Validasi range rating 1-5
    comment: z.string().optional(), // Comment optional
    isAnonymous: z.boolean().optional(), // isAnonymous optional
  }),
});

export const updateFeedbackSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID feedback wajib diisi"),
  }),
  body: z.object({
    comment: z.string().min(1, "Comment tidak boleh kosong"),
  }),
});

export const deleteFeedbackSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID feedback wajib diisi"),
  }),
});

export const getMyFeedbacksSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    sortBy: z.enum(["createdAt", "rating"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

export const getPublicFeedbacksSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Service ID is required"),
  }),
  query: z.object({
    sortBy: z.enum(["rating", "submittedDate"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    limit: z.string().optional(),
  }),
});

export const getMentorFeedbacksSchema = z.object({
  query: z.object({
    rating: z.string().transform(Number).optional(),
    sessionId: z.string().optional(),
    sortBy: z.enum(["rating", "submittedDate"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    limit: z.string().transform(Number).optional(),
  }),
});

export const getAdminFeedbacksSchema = z.object({
  query: z.object({
    sessionId: z.string().optional(),
    userId: z.string().optional(),
    isVisible: z
      .enum(["true", "false"])
      .transform((val) => val === "true")
      .optional(),
    minRating: z.string().transform(Number).optional(),
    maxRating: z.string().transform(Number).optional(),
    search: z.string().optional(),
    sortBy: z.enum(["submittedDate", "rating"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    limit: z.string().transform(Number).optional(),
    page: z.string().transform(Number).optional(),
  }),
});

export const patchFeedbackVisibilitySchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID tidak boleh kosong"),
  }),
  body: z.object({
    isVisible: z.boolean({
      required_error: "isVisible wajib diisi",
      invalid_type_error: "isVisible harus berupa boolean",
    }),
  }),
});

export const exportFeedbackQuerySchema = z.object({
  query: z.object({
    format: z.enum(["csv", "excel"]).optional().default("csv"),
  }),
});

// Helper
const isValidDate = (str: string): boolean => {
  const parsed = parseCustomDate(str);
  return parsed instanceof Date && !isNaN(parsed.getTime());
};

const parseCustomDate = (str: string): Date => {
  // Try dd-mm-yyyy
  const [dd, mm, yyyy] = str.split("-");
  if (!dd || !mm || !yyyy) return new Date(str);
  return new Date(`${yyyy}-${mm}-${dd}T00:00:00.000Z`);
};

export const feedbackStatsQuerySchema = z.object({
  query: z.object({
    startDate: z
      .string()
      .optional()
      .refine((val) => !val || isValidDate(val), {
        message: "Invalid startDate format",
      }),
    endDate: z
      .string()
      .optional()
      .refine((val) => !val || isValidDate(val), {
        message: "Invalid endDate format",
      }),
  }),
});
