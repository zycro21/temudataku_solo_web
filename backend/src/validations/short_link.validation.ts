import { z } from "zod";

const pageLimitQuery = z.object({
  page: z.string().regex(/^\d+$/).optional().default("1"),
  limit: z.string().regex(/^\d+$/).optional().default("10"),
  search: z.string().optional(),
  sort_by: z.enum(["createdAt", "clickCount"]).optional().default("createdAt"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const createShortLinkSchema = z.object({
  body: z.object({
    originalUrl: z
      .string()
      .url("originalUrl must be a valid URL")
      .nonempty("originalUrl is required"),
    shortCode: z
      .string()
      .regex(
        /^[A-Za-z0-9_-]{6,40}$/,
        "shortCode must be 6–40 chars (letters, numbers, _ or -)"
      )
      .optional(),
    expiresAt: z.string().datetime().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getAllShortLinksSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    sort_by: z.enum(["createdAt", "clickCount"]).optional().default("createdAt"),
    order: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});


export const getMyShortLinksSchema = z.object({
  query: pageLimitQuery,
});

export const getShortLinkByIdSchema = z.object({
  params: z.object({ id: z.string().nonempty() }),
});

export const updateShortLinkSchema = z.object({
  params: z.object({ id: z.string().nonempty() }),
  body: z.object({
    shortCode: z
      .string()
      .min(3)
      .max(20)
      .regex(/^[a-zA-Z0-9_-]+$/, "shortCode hanya boleh huruf, angka, dash, dan underscore")
      .optional(),
    expiresAt: z.string().datetime().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const deleteShortLinkSchema = z.object({
  params: z.object({ id: z.string().nonempty() }),
});
