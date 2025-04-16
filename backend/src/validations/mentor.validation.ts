import { z } from "zod";

// Daftar hari yang valid
const dayKeys = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

// Regex untuk validasi format waktu, misalnya "08.00 - 10.00"
const timeRangeRegex =
  /^([01]?[0-9]|2[0-3])\.\d{2}\s*-\s*([01]?[0-9]|2[0-3])\.\d{2}$/;

// Validasi availabilitySchedule
const availabilityScheduleSchema = z.object(
  Object.fromEntries(
    dayKeys.map((day) => [
      day,
      z
        .array(
          z.string().regex(timeRangeRegex, {
            message: "Invalid time format (e.g. 08.00 - 10.00)",
          })
        )
        .optional(),
    ])
  )
);

const hourlyRateSchema = z
  .union([z.string(), z.number()])
  .transform((val) => parseFloat(val as string))
  .refine((val) => !isNaN(val), {
    message: "Hourly rate must be a valid number",
  });

export const createMentorProfileSchema = z.object({
  body: z.object({
    userId: z
      .string()
      .regex(/^\d{6}$/, "Invalid user ID format")
      .optional(), // hanya untuk admin

    expertise: z.string().optional(),
    bio: z.string().optional(),
    experience: z.string().optional(),

    availabilitySchedule: availabilityScheduleSchema.optional(), // Validasi availability schedule

    hourlyRate: z
      .union([z.string(), z.number()])
      .transform((val) => parseFloat(val as string))
      .refine((val) => !isNaN(val), {
        message: "Hourly rate must be a valid number",
      })
      .optional(),
  }),
});

export const updateMentorProfileSchema = z.object({
  body: z.object({
    expertise: z.string().optional(),
    bio: z.string().optional(),
    experience: z.string().optional(),
    availabilitySchedule: availabilityScheduleSchema.optional(),
    hourlyRate: hourlyRateSchema.optional(),
  }),
});

export const getMentorProfilesSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).optional(),
    isVerified: z.enum(["true", "false"]).optional(),
    name: z.string().optional(),
    sortBy: z
      .enum(["fullName", "hourlyRate", "createdAt", "updatedAt"])
      .optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

export const verifyMentorProfileSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "Invalid mentor profile ID"),
  }),
  body: z.object({
    isVerified: z.boolean(),
  }),
});

export const getPublicMentorsSchema = z.object({
  query: z.object({
    page: z.string().optional().default("1"),
    limit: z
      .string()
      .optional()
      .default("10")
      .refine(
        (val) => {
          const num = parseInt(val);
          return !isNaN(num) && num > 0 && num <= 100;
        },
        { message: "Limit must be a number between 1 and 100" }
      ),
    search: z.string().optional(),
    province: z.string().optional(),
    city: z.string().optional(),
    expertise: z.string().optional(),
    availabilityDay: z
      .enum([
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ])
      .optional(),
    sort_by: z
      .enum(["fullName", "registrationDate", "hourlyRate"])
      .optional()
      .default("registrationDate"),
    order: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});

export const getMentorProfileByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^Mentor-\d{6}$/, "Invalid mentor profile ID"),
  }),
});

export const getPublicMentorProfileByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^Mentor-\d{6}$/, "Invalid mentor profile ID"),
  }),
});

export const deleteMentorProfileSchema = z.object({
  params: z.object({
    id: z.string().regex(/^Mentor-\d{6}$/, "Invalid mentor profile ID"),
  }),
});
