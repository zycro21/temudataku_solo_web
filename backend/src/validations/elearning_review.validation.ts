import { z } from "zod";

export const createReviewSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    rating: z
      .number()
      .min(1)
      .max(5)
      .refine((v) => /^\d(\.\d)?$/.test(v.toString()), {
        message: "Rating harus memiliki 1 angka di belakang koma",
      }),
    comment: z.string().trim().min(1).max(1000).optional(),
  }),
});

export const getCourseReviewsSchema = z.object({
  params: z.object({
    id: z.string().min(1), // courseId
  }),
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});

export const getMyReviewsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    sort: z.enum(["asc", "desc"]).optional(),
  }),
});

export const deleteReviewSchema = z.object({
  params: z.object({
    id: z.string().min(1), // reviewId
  }),
  query: z.object({
    force: z
      .enum(["true", "false"])
      .transform((v) => v === "true")
      .optional(),
  }),
});

export const updateReviewSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    rating: z
      .number()
      .min(1)
      .max(5)
      .refine((v) => /^\d(\.\d)?$/.test(v.toString()), {
        message: "Rating harus memiliki 1 angka di belakang koma",
      })
      .optional(),
    comment: z.string().trim().min(1).max(1000).optional(),
    isAnonymous: z.boolean().optional(),
  }),
});

export const getReviewSummarySchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});
