import { z } from "zod";

// CREATE
export const createMentorReportSchema = z.object({
  body: z.object({
    sessionId: z.string().min(1, "sessionId wajib diisi"),
    understanding: z.string().min(1, "Pemahaman mentee wajib diisi"),
    participation: z.string().min(1, "Respon dan partisipasi wajib diisi"),
    challenges: z.string().optional(),
    commonQuestions: z.string().optional(),
    nextFocus: z.string().optional(),
    additionalNotes: z.string().optional(),
  }),
});

// UPDATE
export const updateMentorReportSchema = z.object({
  body: z.object({
    understanding: z.string().min(1, "Pemahaman tidak boleh kosong").optional(),
    participation: z
      .string()
      .min(1, "Partisipasi tidak boleh kosong")
      .optional(),
    challenges: z.string().optional(),
    commonQuestions: z.string().optional(),
    nextFocus: z.string().optional(),
    additionalNotes: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1, "reportId wajib diisi"),
  }),
});

// GET LIST
export const getMentorReportListSchema = z.object({
  query: z.object({
    page: z.string().optional().default("1"),
    limit: z.string().optional().default("10"),
    sessionId: z.string().optional(), // filter berdasarkan session
    search: z.string().optional(), // search di kolom tertentu
    sortField: z.enum(["createdAt", "updatedAt"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

// GET DETAIL / DELETE
export const mentorReportIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "reportId wajib diisi"),
  }),
});

export const exportMentorReportQuerySchema = z.object({
  query: z.object({
    format: z.enum(["csv", "excel"]).optional().default("csv"),
  }),
});

export const mentorReportSessionIdSchema = z.object({
  params: z.object({
    sessionId: z.string().min(1, "sessionId wajib diisi"),
  }),
});

export const mentorReportMentorProfileIdSchema = z.object({
  params: z.object({
    mentorProfileId: z.string().min(1, "mentorProfileId wajib diisi"),
  }),
});