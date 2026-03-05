import { z } from "zod";

export const allowedServiceTypes = [
  "one-on-one",
  "group",
  "bootcamp",
  "shortclass",
  "live class",
] as const;

export const createMentoringServiceSchema = z.object({
  body: z.object({
    serviceName: z.string().min(3).max(100),
    description: z.string().max(1000).optional(),
    price: z.number().positive(),
    serviceType: z.enum(allowedServiceTypes),
    maxParticipants: z.number().int().positive().optional(),
    durationDays: z.number().int().positive(),

    mentorProfileIds: z.array(z.string().regex(/^mentor-\d{6}$/i)).optional(),

    benefits: z.string().max(1000).optional(),
    mechanism: z.string().max(1000).optional(),
    syllabusPath: z.string().url().optional(),
    toolsUsed: z.string().max(500).optional(),
    targetAudience: z.string().max(500).optional(),
    schedule: z.string().max(1000).optional(),
    category: z.string().max(100).optional(),
    level: z.string().max(100).optional(),
    isActive: z.boolean().optional(),
    alumniPortfolio: z
      .array(
        z.object({
          thumbnail: z.string().nullable().optional(),
          title: z.string(),
          description: z.string(),
          menteeName: z.string(),
          projectLink: z.string().url(),
        }),
      )
      .optional(),
    testimonials: z
      .array(
        z.object({
          photo: z.string().nullable().optional(),
          name: z.string(),
          status: z.string(),
          comment: z.string(),
        }),
      )
      .optional(),
  }),
});

export const getAllMentoringServicesSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().default("1"),
    limit: z.string().regex(/^\d+$/).optional().default("10000"),
    search: z.string().optional(),
    sort_by: z
      .enum(["createdAt", "price", "durationDays"])
      .optional()
      .default("createdAt"),
    order: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});

export const getMentoringServiceDetailSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[a-z]+-\d+$/, {
      message: "Invalid mentoring service ID format",
    }),
  }),
});

export const updateMentoringServiceSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[a-z_]+-\d{6}$/i, {
      message: "Invalid mentoring service ID format",
    }),
  }),
  body: z
    .object({
      serviceName: z.string().min(1).optional(),
      description: z.string().nullable().optional(),
      price: z.number().nonnegative().optional(),
      maxParticipants: z.number().int().nonnegative().optional(),
      durationDays: z.number().int().positive().optional(),
      isActive: z.boolean().optional(),

      mentorProfileIds: z.array(z.string().regex(/^mentor-\d{6}$/i)).optional(),

      serviceType: z
        .enum(["one-on-one", "group", "bootcamp", "shortclass", "live class"])
        .optional(),

      benefits: z.string().nullable().optional(),
      mechanism: z.string().nullable().optional(),
      syllabusPath: z.string().nullable().optional(),
      toolsUsed: z.string().nullable().optional(),
      targetAudience: z.string().nullable().optional(),
      schedule: z.string().nullable().optional(),

      category: z.string().optional(),
      level: z.string().optional(),

      alumniPortfolio: z
        .array(
          z.object({
            thumbnail: z.string(),
            title: z.string(),
            description: z.string(),
            menteeName: z.string(),
            projectLink: z.string(),
          }),
        )
        .optional(),

      testimonials: z
        .array(
          z.object({
            photo: z.string(),
            name: z.string(),
            status: z.string(),
            comment: z.string(),
          }),
        )
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),
});

export const deleteMentoringServiceSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[a-zA-Z0-9_-]+$/, {
      message: "Invalid mentoring service ID format",
    }),
  }),
});

export const exportMentoringServicesSchema = z.object({
  query: z.object({
    format: z.enum(["csv", "excel"]).default("csv"),
  }),
});

export const getMentoringServiceDetailValidatorSchema = z.object({
  params: z.object({
    id: z
      .string()
      .trim()
      .min(1, "Service ID is required")
      .regex(
        /^[a-zA-Z_]+-\d{6}$/,
        "Invalid service ID format. Expected format: prefix-000001",
      ),
  }),
});

export const PublicMentoringServiceQuery = z.object({
  query: z.object({
    page: z.string().optional().default("1"),
    limit: z.string().optional().default("50"),
    search: z.string().optional(),
    expertise: z.string().optional(),

    serviceType: z.enum(["one-on-one", "group", "bootcamp"]).optional(),
  }),
});

export const PublicBootcampQuery = z.object({
  query: z.object({
    page: z.string().optional().default("1"),
    limit: z.string().optional().default("50"),
    search: z.string().optional(),
    category: z.string().optional(),
    level: z.string().optional(),
    expertise: z.string().optional(),
  }),
});

export const getRecommendedBootcampsSchema = z.object({
  params: z.object({
    currentServiceId: z.string().min(1, "Current service id is required"),
  }),
});

export const PublicMentoringServiceIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Service ID is required"),
  }),
});

export const getNewServicesSchema = z.object({
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/, "Page harus berupa angka")
      .transform(Number)
      .default("1"),
    limit: z
      .string()
      .regex(/^\d+$/, "Limit harus berupa angka")
      .transform(Number)
      .default("10"),
    search: z.string().optional(),
  }),
});
