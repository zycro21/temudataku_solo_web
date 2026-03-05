import { z } from "zod";

export const generateCertificateSchema = z.object({
  params: z.object({
    id: z.string().min(1), // courseId
  }),
  body: z.object({
    userId: z.string().min(1), // menteeId (manual admin)
    note: z.string().optional(),
  }),
});

export const getMyCertificatesSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    sortBy: z.enum(["issuedAt", "createdAt"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    status: z.string().optional(),
    search: z.string().optional(),
  }),
});

export const certificateIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const getCertificatesSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    sortBy: z.enum(["issuedAt", "createdAt", "certificateNumber"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    status: z.enum(["generated", "sent", "viewed"]).optional(),
  }),
});

export const updateCertificateSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    status: z.enum(["generated", "sent", "viewed"]).optional(),
    note: z.string().min(1).optional(),
  }),
});

export const markCertificateViewedSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const regenerateCertificateSchema = z.object({
  params: z.object({
    id: z.string().min(1), // certificateId
  }),
});

export const exportELearningCertificateQuerySchema = z.object({
  query: z.object({
    format: z.enum(["csv", "excel"]).optional().default("csv"),
  }),
});
