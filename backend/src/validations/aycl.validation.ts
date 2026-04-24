import { z } from "zod";

export const createAyclSchema = z.object({
  body: z.object({
    // ======================
    // CORE
    // ======================
    title: z.string().min(1),
    slug: z.string().min(1),
    whatsappGroupLink: z.string().url().optional(),
    price: z.number().min(0),
    isActive: z.boolean(),

    // ======================
    // DETAIL (BATCH)
    // ======================
    headline: z.string().min(1),
    subHeadline: z.string().optional(),
    description: z.string().optional(),

    // ======================
    // SECTIONS
    // ======================
    sections: z.array(
      z.object({
        type: z.enum([
          "PROGRAM_INFO",
          "CHALLENGE",
          "TARGET",
          "DIFFERENTIATOR",
          "BENEFIT",
          "CLOSING",
        ]),
        title: z.string(),
        content: z.any(),
        order: z.number().int().min(1),
      })
    ),

    // ======================
    // MATERIALS
    // ======================
    materials: z.array(
      z.object({
        title: z.string(),
        description: z.string().optional(),
      })
    ),

    // ======================
    // SCHEDULES
    // ======================
    schedules: z.array(
      z.object({
        title: z.string().optional(),
        date: z.string(),
        startTime: z.string(),
        endTime: z.string(),
        googleMeetLink: z.string().optional(),
        quota: z.number().optional(),
      })
    ),
  }),
});

export const getAllAyclSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    status: z.enum(["active", "inactive", "expired"]).optional(),
    sortBy: z.enum(["title", "startDate", "endDate", "createdAt"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

export const deleteAyclSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const updateAyclSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    title: z.string().optional(),
    slug: z.string().optional(),
    whatsappGroupLink: z.string().url().optional(),
    price: z.number().optional(),
    isActive: z.boolean().optional(),

    headline: z.string().optional(),
    subHeadline: z.string().optional(),
    description: z.string().optional(),

    sections: z.array(
      z.object({
        id: z.string().optional(), // 🔥 penting untuk update
        type: z.enum([
          "PROGRAM_INFO",
          "CHALLENGE",
          "TARGET",
          "DIFFERENTIATOR",
          "BENEFIT",
          "CLOSING",
        ]),
        title: z.string(),
        content: z.any(),
        order: z.number(),
      })
    ).optional(),

    materials: z.array(
      z.object({
        id: z.string().optional(),
        title: z.string(),
        description: z.string().optional(),
      })
    ).optional(),

    schedules: z.array(
      z.object({
        id: z.string().optional(),
        title: z.string().optional(),
        date: z.string(),
        startTime: z.string(),
        endTime: z.string(),
        googleMeetLink: z.string().optional(),
        quota: z.number().optional(),
      })
    ).optional(),
  }),
});

export const getAyclDetailSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});