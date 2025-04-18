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
    mentorProfileIds: z
      .array(
        z.string().regex(/^mentor-\d{6}$/i, "Invalid mentorProfileId format")
      )
      .min(1),
  }),
});

export const getAllMentoringServicesSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().default("1"),
    limit: z.string().regex(/^\d+$/).optional().default("10"),
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
    id: z.string().regex(/^[a-z_-]+-\d+$/, {
      message: "Invalid mentoring service ID format",
    }),
  }),
  body: z
    .object({
      serviceName: z.string().min(1, "Service name cannot be empty").optional(),
      description: z.string().nullable().optional(),
      price: z
        .number()
        .nonnegative("Price must be a positive number")
        .optional(),
      maxParticipants: z
        .number()
        .int()
        .nonnegative("Max participants must be positive")
        .optional(),
      durationDays: z
        .number()
        .int()
        .positive("Duration days must be a positive integer")
        .optional(),
      isActive: z.boolean().optional(),
      mentorProfileIds: z
        .array(z.string().min(1))
        .min(1, "At least one mentor must be specified")
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
        "Invalid service ID format. Expected format: prefix-000001"
      ),
  }),
});

export const PublicMentoringServiceQuery = z.object({
  query: z.object({
    page: z.string().optional().default("1"),
    limit: z.string().optional().default("10"),
    search: z.string().optional(),
    expertise: z.string().optional(),
  }),
});

export const PublicMentoringServiceIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Service ID is required"),
  }),
});
