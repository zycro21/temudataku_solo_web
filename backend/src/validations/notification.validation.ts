import { z } from "zod";

const validRoles = ["admin", "mentor", "mentee", "affiliator"] as const;

export const createNotificationSchema = z.object({
  body: z.object({
    type: z.string().min(1),
    title: z.string().min(1),
    message: z.string().optional(),
    deliveryMethod: z.enum(["push", "email", "both"]),
    actionUrl: z.string().optional(),
    targetRole: z
      .array(z.string())
      .min(1)
      .refine(
        (roles) => roles.every((role) => validRoles.includes(role as any)),
        {
          message: `targetRole must be one or more of: ${validRoles.join(
            ", "
          )}`,
        }
      ),
    meta: z.record(z.any()).optional(), // bisa dikirim kalau perlu
  }),
});

export const getAdminNotificationsSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).default(10),
    search: z.string().optional(),
    deliveryMethod: z.enum(["email", "push", "both"]).optional(),
    targetRole: z.string().optional(), // satu role
    startDate: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "startDate harus format ISO valid",
      }),
    endDate: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "endDate harus format ISO valid",
      }),
  }),
});

export const getNotificationDetailSchema = z.object({
  params: z.object({
    id: z.string().cuid({ message: "ID notifikasi tidak valid" }),
  }),
});

export const getNotificationRecipientsSchema = z.object({
  params: z.object({
    id: z.string().cuid({ message: "ID notifikasi tidak valid" }),
  }),
});

export const resendNotificationSchema = z.object({
  params: z.object({
    id: z.string().cuid({ message: "ID notifikasi tidak valid" }),
  }),
  body: z.object({
    userIds: z.array(z.string().regex(/^\d{6}$/)).optional(),
  }),
});

export const exportNotificationSchema = z.object({
  query: z.object({
    format: z.enum(["excel", "csv"]).default("excel"),
  }),
});

export const readNotificationSchema = z.object({
  params: z.object({
    id: z.string().cuid(), // ID notifikasi
  }),
});

export const getAllNotificationsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    sortBy: z.enum(["createdAt", "sentAt"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    isRead: z.enum(["true", "false"]).optional(), // dikirim sebagai string dari query
    type: z.string().optional(),
    search: z.string().optional(),
  }),
});
