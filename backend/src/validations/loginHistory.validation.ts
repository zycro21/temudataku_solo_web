import { z } from "zod";
import {
  isValidDateInput,
  parseRangeStart,
  parseRangeEnd,
} from "../utils/dateRange.js";

const ROLES = [
  "mentee",
  "mentor",
  "affiliator",
  "admin",
  "cm",
  "curdev",
  "cw",
  "guest",
] as const;

const dateString = (label: string) =>
  z.string().refine(isValidDateInput, {
    message: `${label} must be a valid date (e.g. 2026-11-09 or ISO datetime)`,
  });

const intParam = (def: number, max: number, label: string) =>
  z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : def))
    .refine((v) => !Number.isNaN(v) && v > 0 && v <= max, {
      message: `${label} must be between 1 and ${max}`,
    });

const fromBeforeTo = (q: { from?: string; to?: string }) =>
  !q.from || !q.to || parseRangeStart(q.from) <= parseRangeEnd(q.to);

// GET /api/login-history   (admin)
export const getLoginHistorySchema = z.object({
  query: z
    .object({
      page: intParam(1, 1_000_000, "page"),
      limit: intParam(20, 100, "limit"),
      userId: z.string().min(1).optional(),
      search: z.string().trim().optional(), // nama / email
      role: z.enum(ROLES).optional(),
      method: z.enum(["PASSWORD", "GOOGLE"]).optional(),
      portal: z.enum(["WEB", "AFFILIATOR"]).optional(),
      from: dateString("from").optional(),
      to: dateString("to").optional(),
      order: z.enum(["asc", "desc"]).optional().default("desc"),
    })
    .refine(fromBeforeTo, {
      message: "from must be earlier than or equal to to",
      path: ["from"],
    }),
});

// GET /api/login-history/summary   (admin)
export const getLoginHistorySummarySchema = z.object({
  query: z
    .object({
      from: dateString("from").optional(), // default: 30 hari terakhir
      to: dateString("to").optional(),
    })
    .refine(fromBeforeTo, {
      message: "from must be earlier than or equal to to",
      path: ["from"],
    }),
});

// GET /api/login-history/me   (user yang sedang login)
export const getMyLoginHistorySchema = z.object({
  query: z.object({
    page: intParam(1, 1_000_000, "page"),
    limit: intParam(10, 50, "limit"),
  }),
});

// GET /api/login-history/purchases   (admin)
// Daftar pembelian produk (mentoring, e-learning, AYCL) berdasarkan payment.
export const getPurchasesSchema = z.object({
  query: z
    .object({
      page: intParam(1, 1_000_000, "page"),
      limit: intParam(50, 500, "limit"),
      userId: z.string().min(1).optional(), // pembeli
      search: z.string().trim().optional(), // nama/email/telepon pembeli atau nama produk
      productType: z
        .enum(["MENTORING", "BOOTCAMP", "ELEARNING", "AYCL"])
        .optional(),
      // khusus mentoring: one-on-one / group (sesuai data service_type)
      serviceType: z.string().trim().min(1).optional(),
      // status payment; default "confirmed". "all" = semua status.
      status: z.string().trim().min(1).optional().default("confirmed"),
      from: dateString("from").optional(), // tanggal pembayaran
      to: dateString("to").optional(),
      order: z.enum(["asc", "desc"]).optional().default("desc"),
    })
    .refine(fromBeforeTo, {
      message: "from must be earlier than or equal to to",
      path: ["from"],
    })
    .refine(
      (q) => !q.serviceType || !q.productType || q.productType === "MENTORING",
      {
        message: "serviceType hanya berlaku untuk productType=MENTORING",
        path: ["serviceType"],
      },
    ),
});

// GET /api/login-history/form-responses
// Daftar pengisian form (event maupun non-event) beserta jawabannya.
export const getFormResponsesSchema = z.object({
  query: z
    .object({
      page: intParam(1, 1_000_000, "page"),
      limit: intParam(20, 100, "limit"),
      type: z.enum(["EVENT", "NON_EVENT"]).optional(), // jenis form
      formId: z.string().min(1).optional(),
      userId: z.string().min(1).optional(), // akun responder
      email: z.string().trim().min(1).optional(), // email responder (mengandung)
      search: z.string().trim().optional(), // email/nama/telepon responder atau judul form
      // default hanya yang sudah dikirim; DRAFT = autosave belum final
      status: z
        .enum(["SUBMITTED", "DRAFT", "ALL"])
        .optional()
        .default("SUBMITTED"),
      from: dateString("from").optional(), // tanggal submit
      to: dateString("to").optional(),
      order: z.enum(["asc", "desc"]).optional().default("desc"),
    })
    .refine(fromBeforeTo, {
      message: "from must be earlier than or equal to to",
      path: ["from"],
    }),
});
