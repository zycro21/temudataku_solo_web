import { z } from "zod";

export const createBookingSchema = z.object({
  body: z.object({
    mentoringServiceId: z.string().min(1, "ID layanan mentoring wajib diisi"),
    participantIds: z
      .array(z.string().min(1, "User ID tidak boleh kosong"))
      .optional()
      .refine(
        (arr) => {
          if (!arr) return true;
          const unique = new Set(arr);
          return unique.size === arr.length;
        },
        { message: "Terdapat duplikat user di participantIds" }
      ),

    referralUsageId: z.string().optional(),

    specialRequests: z
      .string()
      .min(5, "Permintaan khusus terlalu singkat")
      .max(500, "Permintaan khusus terlalu panjang")
      .optional(),

    bookingDate: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        "Format bookingDate tidak valid (yyyy-mm-dd)"
      )
      .optional(),
  }),
});

export const getMenteeBookingsSchema = z.object({
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
    status: z
      .enum(["pending", "confirmed", "completed", "cancelled"])
      .optional(),
    sortBy: z
      .enum(["createdAt", "bookingDate"])
      .optional()
      .default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});

export const getMenteeBookingDetailSchema = z.object({
  params: z.object({
    id: z.string().nonempty("Booking ID harus diisi"),
  }),
});

export const updateMenteeBookingSchema = z.object({
  params: z.object({
    id: z.string().nonempty("Booking ID harus diisi"),
  }),
  body: z.object({
    specialRequests: z.string().optional(),
    participantIds: z.array(z.string()).optional(),
  }),
});

export const getAdminBookingsValidator = z.object({
  query: z.object({
    status: z
      .enum(["pending", "confirmed", "completed", "cancelled"])
      .optional(),
    menteeName: z.string().optional(),
    serviceName: z.string().optional(),
    usedReferral: z
      .union([z.boolean(), z.literal("true"), z.literal("false")])
      .transform((val) => {
        if (typeof val === "boolean") return val;
        return val === "true";
      })
      .optional(),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format. Use yyyy-mm-dd.",
      })
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format. Use yyyy-mm-dd.",
      })
      .optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    sortBy: z.enum(["createdAt", "bookingDate"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const getAdminBookingDetailValidator = z.object({
  params: z.object({
    id: z.string().regex(/^Booking-[a-z-]+-\d{10}$/, {
      message: "Invalid booking ID format",
    }),
  }),
});

export const updateAdminBookingStatusValidator = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^Booking-(bootcamp|shortclass|liveclass|one-on-one|group)-\d+$/, {
        message: "Format ID booking tidak valid",
      }),
  }),
  body: z.object({
    status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
  }),
});

export const exportAdminBookingsValidator = z.object({
  query: z.object({
    format: z.enum(["csv", "excel"]).default("excel"),
  }),
});

export const getBookingParticipantsIdValidator = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^Booking-(bootcamp|shortclass|liveclass|one-on-one|group)-\d+$/, {
        message: "Format ID booking tidak valid",
      }),
  }),
});
