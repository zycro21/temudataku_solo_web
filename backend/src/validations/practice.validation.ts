import { z } from "zod";

export const createPracticeSchema = z.object({
  body: z.object({
    mentorId: z.string().min(1, "Mentor ID wajib diisi"),
    title: z.string().min(1, "Judul wajib diisi"),
    description: z.string().optional(),
    thumbnailImage: z.string().url("URL thumbnail tidak valid").optional(),
    price: z.number().nonnegative("Harga tidak boleh negatif"),
    practiceType: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  }),
});
