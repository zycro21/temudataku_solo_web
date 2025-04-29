import { z } from "zod";

export const createReferralCodeSchema = z.object({
  body: z.object({
    ownerId: z.string().nonempty("Owner ID is required"),
    discountPercentage: z
      .number()
      .min(0, "Discount percentage must be at least 0")
      .max(100, "Discount percentage cannot exceed 100"),
    commissionPercentage: z
      .number()
      .min(0, "Commission percentage must be at least 0")
      .max(100, "Commission percentage cannot exceed 100"),
    expiryDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: "Expiry date must be in yyyy-mm-dd format",
      })
      .optional()
      .transform((val: string | undefined) =>
        val ? new Date(`${val}T23:59:59.999Z`) : undefined
      )
      .refine((val: Date | undefined) => !val || !isNaN(val.getTime()), {
        message: "Invalid expiry date",
      }),
    isActive: z.boolean().optional().default(true),
  }),
});
