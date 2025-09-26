import { z } from "zod";

export const createWithdrawalSchema = z.object({
  userId: z.string().optional(), // hanya admin yang boleh isi
  type: z.enum(["bank", "eWallet"], {
    required_error: "Type is required",
    invalid_type_error: "Type must be either 'bank' or 'eWallet'",
  }),
  providerName: z
    .string()
    .min(2, "Provider name must be at least 2 characters"),
  accountNumber: z
    .string()
    .min(5, "Account number must be at least 5 characters"),
  accountName: z.string().optional(),
});

export const getAllWithdrawalSchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "Page must be a positive number",
    })
    .optional()
    .default("1"),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val <= 15, {
      message: "Limit must be between 1 and 15",
    })
    .optional()
    .default("15"),
});

export const getWithdrawalByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, { message: "Withdrawal method ID is required" }),
  }),
});

export const updateWithdrawalSchema = z.object({
  params: z.object({
    id: z.string().min(1, { message: "Withdrawal method ID is required" }),
  }),
  body: z
    .object({
      type: z.enum(["bank", "eWallet"]).optional(),
      providerName: z.string().optional(),
      accountNumber: z.string().optional(),
      accountName: z.string().optional(),
      isActive: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided to update",
    }),
});

export const deleteWithdrawalSchema = z.object({
  params: z.object({
    id: z.string().cuid({ message: "Invalid withdrawal method ID" }),
  }),
});

export const exportWithdrawalSchema = z.object({
  query: z.object({
    format: z.enum(["csv", "excel"], {
      errorMap: () => ({ message: "Format must be 'csv' or 'excel'" }),
    }),
  }),
});

export const toggleWithdrawalStatusSchema = z.object({
  id: z.string().cuid({ message: "Invalid withdrawal method ID" }),
  body: z.object({
    isActive: z.boolean({
      required_error: "isActive status is required",
      invalid_type_error: "isActive must be a boolean",
    }),
  }),
});

export const getAdminWithdrawalsSchema = z.object({
  query: z.object({
    page: z
      .string()
      .transform((val) => parseInt(val, 10))
      .refine((val) => !isNaN(val) && val > 0, "page harus integer positif")
      .optional()
      .default("1"),
    limit: z
      .string()
      .transform((val) => parseInt(val, 10))
      .refine(
        (val) => !isNaN(val) && val > 0 && val <= 100,
        "limit harus 1-100"
      )
      .optional()
      .default("10"),
    sortBy: z.enum(["createdAt", "updatedAt", "providerName"]).optional(),
    order: z.enum(["asc", "desc"]).optional(),
    providerName: z.string().optional(),
    type: z.enum(["bank", "eWallet"]).optional(),
    isActive: z
      .string()
      .transform((val) => val === "true")
      .optional(),
  }),
});
