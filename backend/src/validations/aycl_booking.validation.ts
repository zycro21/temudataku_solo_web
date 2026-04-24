import { z } from "zod";

export const createAyclBookingSchema = z.object({
  body: z.object({
    batchId: z.string().min(1),
    referralUsageId: z.string().optional(),

    // 🔥 NEW FIELDS
    currentStatus: z.string().optional(),
    institution: z.string().optional(),
    studyProgram: z.string().optional(),
    semester: z.string().optional(),
    age: z.number().int().positive().optional(),
    reason: z.string().optional(),
    familiarity: z.string().optional(),
  }),
});

export const getAyclBookingByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const getAllAyclBookingsSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((v) => (v ? parseInt(v, 10) : 1)),
    limit: z
      .string()
      .optional()
      .transform((v) => (v ? parseInt(v, 10) : 20)),
    search: z.string().optional(),
    status: z
      .enum(["pending", "confirmed", "completed", "cancelled"])
      .optional(),
    batchId: z.string().optional(),
    sortBy: z.enum(["createdAt", "status"]).optional().default("createdAt"),
    sortDir: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});

export const updateAyclBookingSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    currentStatus: z.string().optional(),
    institution: z.string().optional(),
    studyProgram: z.string().optional(),
    semester: z.string().optional(),
    age: z.number().int().positive().optional(),
    reason: z.string().optional(),
    familiarity: z.string().optional(),

    // 🔥 schedule selection
    selectedSchedules: z.array(z.string()).optional(),
  }),
});

export const deleteAyclBookingSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});