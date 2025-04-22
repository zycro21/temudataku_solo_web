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
