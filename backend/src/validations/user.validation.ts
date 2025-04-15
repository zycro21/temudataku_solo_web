import { z } from "zod";

export const updateUserSchema = z.object({
  email: z.string().email("Invalid email").optional(),
  fullName: z.string().min(1, "Full name is required").optional(),
  phoneNumber: z.string().min(8).optional(),
  city: z.string().optional(),
  province: z.string().optional(),
});

export const updateUserRolesSchema = z
  .object({
    userId: z.string().min(1, "User ID is required"),
    roles_to_add: z.array(z.string()).optional(),
    roles_to_remove: z.array(z.string()).optional(),
  })
  .refine(
    (data) =>
      (data.roles_to_add && data.roles_to_add.length > 0) ||
      (data.roles_to_remove && data.roles_to_remove.length > 0),
    {
      message:
        "At least one of roles_to_add or roles_to_remove must be provided",
      path: ["roles_to_add"],
    }
  )
  .refine(
    (data) => {
      const addSet = new Set(data.roles_to_add || []);
      const removeSet = new Set(data.roles_to_remove || []);
      for (const role of addSet) {
        if (removeSet.has(role)) return false;
      }
      return true;
    },
    {
      message: "You cannot add and remove the same role",
      path: ["roles_to_add"],
    }
  );

export const deleteUserSchema = z.object({
  params: z.object({
    userId: z.string().min(1, "User ID is required"),
  }),
});

export const getAllUsersSchema = z.object({
  query: z.object({
    page: z.string().optional().default("1"),
    limit: z.string().optional().default("10"),
    email: z.string().optional(),
    fullName: z.string().optional(),
    city: z.string().optional(),
    province: z.string().optional(),
    isActive: z
      .string()
      .refine((val) => ["true", "false"].includes(val), {
        message: "is_active must be 'true' or 'false'",
      })
      .optional(),
    sort_by: z
      .string()
      .refine((val) => ["createdAt", "fullName", "email"].includes(val), {
        message: "Invalid sort_by field",
      })
      .optional(),
    order: z
      .string()
      .refine((val) => ["asc", "desc"].includes(val), {
        message: "order must be 'asc' or 'desc'",
      })
      .optional(),
  }),
});

export const exportUsersSchema = z.object({
  query: z.object({
    email: z.string().optional(),
    fullName: z.string().optional(),
    city: z.string().optional(),
    province: z.string().optional(),
    isActive: z
      .string()
      .refine((val) => ["true", "false"].includes(val), {
        message: "isActive must be 'true' or 'false'",
      })
      .optional(),
    format: z.string().refine((val) => ["csv", "excel"].includes(val), {
      message: "Format must be 'csv' or 'excel'",
    }),
  }),
});

export const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d{6}$/, { message: "Invalid user ID format" }), // harus 6 digit angka
  }),
});
