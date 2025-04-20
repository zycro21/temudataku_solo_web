import { z } from "zod";

export const createNotificationSchema = z.object({
  body: z.object({
    type: z.string().min(1),
    title: z.string().min(1),
    message: z.string().optional(),
    deliveryMethod: z.enum(["push", "email", "both"]),
    actionUrl: z.string().url().optional(),
    targetRole: z.string().min(1), // contoh: 'mentee', 'mentor'
    meta: z.record(z.any()).optional(), // bisa dikirim kalau perlu
  }),
});
