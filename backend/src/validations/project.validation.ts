import { z } from "zod";

export const createProjectSchema = z.object({
  body: z.object({
    serviceId: z.string().min(1),
    title: z.string().min(3).max(100),
    description: z.string().max(1000).optional(),
  }),
});

export const updateProjectSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Project ID wajib diisi"),
  }),
  body: z.object({
    title: z
      .string()
      .min(3, "Judul minimal 3 karakter")
      .max(100, "Judul Maksimal 100 karakter")
      .optional(),
    description: z.string().max(1000).optional(),
  }),
});

export const deleteProjectSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Project ID wajib diisi"),
  }),
});

export const getAllProjectsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    serviceId: z.string().optional(),
    sortBy: z.enum(["createdAt", "updatedAt", "title"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

export const getProjectDetailSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Project ID wajib diisi"),
  }),
});

export const getMentorProjectListSchema = z.object({
  query: z.object({
    page: z.string().optional().default("1"),
    limit: z.string().optional().default("10"),
  }),
});

export const getMentorProjectDetailSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Project ID wajib diisi"),
  }),
});

export const getMenteeProjectListSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    sortBy: z.enum(["title", "createdAt"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const getMenteeProjectDetailSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(
        /^Project-[a-zA-Z0-9-_]+-\d{8}-\d+$/,
        "Format ID proyek tidak valid"
      ),
  }),
});

export const exportProjectSchema = z.object({
  query: z.object({
    format: z.enum(["csv", "excel"], {
      required_error: "Format harus diisi (csv/excel)",
    }),
  }),
});

export const submitProjectSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    filePath: z
      .string()
      .url("File path harus berupa URL yang valid.")
      .optional(),
    sessionId: z.string().optional(),
  }),
});

export const reviewSubmissionSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    mentorFeedback: z.string().min(1, "Komentar Mentor wajib diisi"),
    Score: z.number().min(0).max(100),
    sessionId: z.string().optional(),
  }),
});

export const getAdminSubmissionListSchema = z.object({
  query: z.object({
    search: z.string().optional(), // cari berdasarkan nama mentee
    projectId: z.string().optional(),
    serviceId: z.string().optional(),
    isReviewed: z.enum(["true", "false"]).optional(),
    sortBy: z.enum(["submissionDate", "createdAt", "Score"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const getAdminSubmissionDetailSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Submission ID wajib diisi"),
  }),
});

export const exportSubmissionSchema = z.object({
  query: z.object({
    format: z.enum(["csv", "excel"]),
  }),
});

export const getMentorProjectSubmissionListSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Project ID is required"),
  }),
});

export const getMentorSubmissionDetailSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Submission ID is required"),
  }),
});

export const getMenteeSubmissionsSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1))
      .refine((val) => !isNaN(val) && val > 0, {
        message: "Page must be a positive integer",
      }),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10))
      .refine((val) => !isNaN(val) && val > 0 && val <= 100, {
        message: "Limit must be between 1 and 100",
      }),
  }),
});

export const getMenteeSubmissionDetailSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Submission ID is required"),
  }),
});
