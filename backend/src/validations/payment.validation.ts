import { z } from "zod";

export const createPaymentSchema = z.object({
  body: z.object({
    referenceId: z.string().min(1, "Reference ID is required"),
    paymentMethod: z.string().optional(), // <-- ubah ini
  }),
});

export const getAdminPaymentsSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1))
      .refine((val) => val > 0, { message: "Page must be a positive number" }),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 20))
      .refine((val) => val > 0, { message: "Limit must be a positive number" }),
    status: z.string().optional(), // kamu bisa tambahkan refine jika ada enum status
  }),
});

export const getAdminPaymentsDetailSchema = z.object({
  params: z.object({
    id: z.string().min(1, { message: "Payment ID is required" }),
  }),
});

export const getExportPaymentsSchema = z.object({
  query: z.object({
    format: z.enum(["csv", "excel"]).default("csv"),
    status: z.string().optional(),
  }),
});

export const getMyPaymentsSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    status: z.string().optional(),
  }),
});

export const updatePaymentStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Payment ID is required"),
  }),
  body: z.object({
    status: z.enum(["pending", "confirmed", "failed"], {
      errorMap: () => ({
        message: "Status must be 'pending', 'confirmed', or 'failed'",
      }),
    }),
  }),
});

export const getMyPaymentDetailSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Payment ID is required"),
  }),
});
