import { z } from "zod";

export const generateCertificateSchema = z.object({
  body: z.object({
    menteeId: z.string().min(1, "Mentee ID wajib diisi"),
    serviceId: z.string().min(1, "Service ID wajib diisi"),
  }),
});

export const getAllCertificatesSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    search: z.string().optional(),
    status: z.string().optional(), // "generated" | "sent" | "viewed"
    serviceId: z.string().optional(),
    startDate: z.string().optional(), // ISO format
    endDate: z.string().optional(),
  }),
});

export const updateCertificateSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID sertifikat wajib diisi"),
  }),
  body: z.object({
    status: z.enum(["generated", "sent", "viewed"]).optional(),
    verifiedBy: z.string().optional(),
    note: z.string().optional(),
  }),
});

export const getMenteeCertificatesSchema = z.object({
  query: z.object({
    page: z.string().optional().transform(Number).default("1"),
    limit: z.string().optional().transform(Number).default("10"),
    status: z.string().optional(),
    serviceId: z.string().optional(),
  }),
});

export const getCertificateDetailSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Certificate ID is required"),
  }),
});

export const downloadCertificateSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Certificate ID is required"),
  }),
});

export const exportCertificateSchema = z.object({
  query: z.object({
    format: z.enum(["csv", "excel"]),
  }),
});
