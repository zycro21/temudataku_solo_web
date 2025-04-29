import { z } from "zod";

export const createUserBehaviorSchema = z.object({
  body: z.object({
    pageVisited: z
      .string()
      .nonempty("Page visited is required")
      .max(255, "Page visited cannot exceed 255 characters"),
    action: z
      .string()
      .max(255, "Action cannot exceed 255 characters")
      .optional(),
  }),
});

export const getAllAdminUserBehaviorsSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1))
      .refine((val) => val > 0, { message: "Page must be greater than 0" }),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10))
      .refine((val) => val > 0, { message: "Limit must be greater than 0" }),
    userId: z.string().optional(),
    pageVisited: z
      .string()
      .max(255, "Page visited cannot exceed 255 characters")
      .optional(),
    action: z
      .string()
      .max(255, "Action cannot exceed 255 characters")
      .optional(),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: "Start date must be in yyyy-mm-dd format",
      })
      .transform((val: string) => new Date(`${val}T00:00:00.000Z`))
      .refine((val: Date) => !isNaN(val.getTime()), {
        message: "Invalid start date",
      })
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: "End date must be in yyyy-mm-dd format",
      })
      .transform((val: string) => new Date(`${val}T23:59:59.999Z`))
      .refine((val: Date) => !isNaN(val.getTime()), {
        message: "Invalid end date",
      })
      .optional(),
  }),
});

export const getUserBehaviorByIdSchema = z.object({
  params: z.object({
    id: z.string().nonempty("Behavior ID is required"),
  }),
});

export const deleteUserBehaviorByIdSchema = z.object({
  params: z.object({
    id: z.string().nonempty("Behavior ID is required"),
  }),
});

export const exportUserBehaviorsSchema = z.object({
  query: z.object({
    format: z.enum(["csv", "excel"], {
      message: "Format must be 'csv' or 'excel'",
    }),
    userId: z.string().optional(),
    pageVisited: z
      .string()
      .max(255, "Page visited cannot exceed 255 characters")
      .optional(),
    action: z
      .string()
      .max(255, "Action cannot exceed 255 characters")
      .optional(),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: "Start date must be in yyyy-mm-dd format",
      })
      .transform((val: string | undefined) =>
        val ? new Date(`${val}T00:00:00.000Z`) : undefined
      )
      .refine((val: Date | undefined) => !val || !isNaN(val.getTime()), {
        message: "Invalid start date",
      })
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: "End date must be in yyyy-mm-dd format",
      })   
      .transform((val: string | undefined) =>
        val ? new Date(`${val}T23:59:59.999Z`) : undefined
      )
      .refine((val: Date | undefined) => !val || !isNaN(val.getTime()), {
        message: "Invalid end date",
      })
      .optional(),
  }),
});

