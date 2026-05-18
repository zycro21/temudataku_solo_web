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
    strikePrice: z.number().optional(),

    // durationDays: z.number().int().positive().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    maxParticipants: z.number().int().positive().optional(),

    // auto bootcamp (frontend ga perlu kirim)
    serviceType: z.enum(allowedServiceTypes).optional(),

    mentorProfileIds: z.array(z.string()).optional(),

    // NEW FIELDS
    programAbout: z.string().optional(),
    totalWeeks: z.number().optional(),
    totalProjects: z.number().optional(),

    whatsappGroup: z.string().url().optional(),

    slug: z.string().optional(),
    isFeatured: z.boolean().optional(),

    category: z.string().optional(),
    level: z.string().optional(),
    isActive: z.boolean().optional(),

    // 🔥 SECTION
    sections: z
      .array(
        z.object({
          type: z.enum(["BENEFIT", "MECHANISM", "SYLLABUS", "TARGET"]),
          title: z.string(),
          description: z.string(),
        }),
      )
      .optional(),

    // 🔥 TOOLS
    tools: z.array(z.string()).optional(),

    // 🔥 SCHEDULE
    schedules: z.array(z.string()).optional(), // ISO string date

    // 🔥 PORTFOLIO
    portfolios: z
      .array(
        z.object({
          title: z.string(),
          description: z.string().optional(),
          menteeName: z.string(),
          projectLink: z.string().url(),
          thumbnail: z.string().optional(),
        }),
      )
      .optional(),

    // 🔥 TESTIMONIAL
    testimonials: z
      .array(
        z.object({
          name: z.string(),
          role: z.string().optional(),
          comment: z.string(),
          rating: z.number().min(1).max(5),
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
      .enum([
        "createdAt",
        "price",
        "durationDays",
        "serviceName",
        "maxParticipants",
      ])
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
      serviceName: z.string().optional(),
      description: z.string().nullable().optional(),

      price: z.number().optional(),
      strikePrice: z.number().optional(),

      durationDays: z.number().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      maxParticipants: z.number().optional(),

      isActive: z.boolean().optional(),

      serviceType: z
        .enum(["one-on-one", "group", "bootcamp", "shortclass", "live class"])
        .optional(),

      mentorProfileIds: z.array(z.string()).optional(),

      // NEW
      programAbout: z.string().optional(),
      totalWeeks: z.number().optional(),
      totalProjects: z.number().optional(),

      whatsappGroup: z.string().url().optional(),

      slug: z.string().optional(),
      isFeatured: z.boolean().optional(),

      category: z.string().optional(),
      level: z.string().optional(),

      // SECTION
      sections: z
        .array(
          z.object({
            id: z.string().optional(),
            type: z.enum(["BENEFIT", "MECHANISM", "SYLLABUS", "TARGET"]),
            title: z.string(),
            description: z.string(),
          }),
        )
        .optional(),

      // TOOLS
      tools: z
        .array(
          z.object({
            id: z.string().optional(),
            name: z.string(),
          }),
        )
        .optional(),

      // SCHEDULE
      schedules: z
        .array(
          z.object({
            id: z.string().optional(),
            date: z.string(),
          }),
        )
        .optional(),

      // PORTFOLIO
      portfolios: z
        .array(
          z.object({
            id: z.string().optional(),
            title: z.string(),
            description: z.string().optional(),
            menteeName: z.string(),
            projectLink: z.string().url(),
            thumbnail: z.string().optional(),
          }),
        )
        .optional(),

      // TESTIMONIAL
      testimonials: z
        .array(
          z.object({
            id: z.string().optional(),
            name: z.string(),
            role: z.string().optional(),
            comment: z.string(),
            rating: z.number().min(1).max(5),
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

export const PublicMentoringServiceSlugParamSchema = z.object({
  params: z.object({
    slug: z.string().min(1, "Slug is required"),
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
