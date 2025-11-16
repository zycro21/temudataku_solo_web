import { z } from "zod";

export const createAssignmentSchema = z.object({
  params: z.object({
    id: z.string().min(1, "SubBab ID wajib diisi"),
  }),
  body: z.object({
    title: z.string().min(3, "Judul minimal 3 karakter"),
    description: z.string().optional(),
    dueDays: z
      .number({
        required_error: "Durasi (dueDays) wajib diisi",
        invalid_type_error: "Durasi (dueDays) harus berupa angka",
      })
      .int()
      .positive("Durasi harus lebih dari 0"),
  }),
});

export const getAssignmentSchema = z.object({
  params: z.object({
    id: z.string().min(1, "SubBab ID wajib diisi"),
  }),
  query: z
    .object({
      includeSubmissions: z
        .preprocess((v) => {
          if (v === "true" || v === true) return true;
          if (v === "false" || v === false) return false;
          return undefined;
        }, z.boolean().optional())
        .optional(),
      page: z.preprocess(
        (v) => (v ? Number(v) : undefined),
        z.number().int().positive().optional()
      ),
      limit: z.preprocess(
        (v) => (v ? Number(v) : undefined),
        z.number().int().positive().optional()
      ),
      sortBy: z
        .enum(["createdAt", "updatedAt", "score", "submittedAt"])
        .optional(),
      order: z.enum(["asc", "desc"]).optional(),
      search: z.string().optional(),
      minScore: z.preprocess(
        (v) => (v ? Number(v) : undefined),
        z.number().optional()
      ),
      maxScore: z.preprocess(
        (v) => (v ? Number(v) : undefined),
        z.number().optional()
      ),
    })
    .optional(),
});

export const updateAssignmentSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Assignment ID wajib diisi"),
  }),
  body: z.object({
    title: z.string().min(3, "Judul minimal 3 karakter").optional(),
    description: z.string().optional(),
    dueDays: z
      .number({
        invalid_type_error: "Durasi (dueDays) harus berupa angka",
      })
      .int()
      .positive("Durasi harus lebih dari 0")
      .optional(),
  }),
});

export const deleteAssignmentSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Assignment ID wajib diisi"),
  }),
});

export const getAllAssignmentsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    page: z
      .string()
      .transform((val) => parseInt(val))
      .optional()
      .default("1"),
    limit: z
      .string()
      .transform((val) => parseInt(val))
      .optional()
      .default("10"),
    sortBy: z
      .enum(["createdAt", "updatedAt", "score", "submittedAt"])
      .optional()
      .default("createdAt"),
    order: z.enum(["asc", "desc"]).optional().default("desc"),
    minScore: z
      .string()
      .transform((val) => (val ? parseInt(val) : undefined))
      .optional(),
    maxScore: z
      .string()
      .transform((val) => (val ? parseInt(val) : undefined))
      .optional(),
  }),
});

export const getAssignmentDetailSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Assignment ID wajib diisi"),
  }),
});

export const getAssignmentsByCourseSchema = z.object({
  params: z.object({
    courseId: z.string().min(1, "Course ID wajib diisi"),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    sortBy: z.enum(["createdAt", "updatedAt", "title"]).default("createdAt"),
    order: z.enum(["asc", "desc"]).default("desc"),
    search: z.string().optional(),
  }),
});

export const exportAssignmentsSchema = z.object({
  query: z.object({
    format: z.enum(["csv", "excel"]).default("csv"),
  }),
});
