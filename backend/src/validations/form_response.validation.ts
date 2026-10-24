import { z } from "zod";

const idString = z.string().trim().min(1).max(100);

const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus yyyy-mm-dd")
  .refine((v) => !isNaN(Date.parse(v)), "Tanggal tidak valid");

// Filter yang dipakai bareng oleh List dan Export
const responseFilterShape = {
  search: z.string().trim().max(100).optional(), // email / nama responder
  // default SUBMITTED: draft autosave bukan submission final
  status: z.enum(["SUBMITTED", "DRAFT", "ALL"]).default("SUBMITTED"),
  startDate: dateOnly.optional(), // dihitung sebagai awal hari WIB
  endDate: dateOnly.optional(), // dihitung sebagai akhir hari WIB
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
};

const dateRangeRefine = (q: { startDate?: string; endDate?: string }) =>
  !q.startDate || !q.endDate || q.startDate <= q.endDate;

// ─── GET /forms/:id/responses ───────────────────────────────────────────────

export const listResponsesSchema = z.object({
  params: z.object({ id: idString }),
  query: z
    .object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(10),
      ...responseFilterShape,
    })
    .refine(dateRangeRefine, {
      message: "startDate tidak boleh lebih besar dari endDate",
    }),
});

// ─── GET /forms/:id/responses/:responseId ───────────────────────────────────

export const responseDetailSchema = z.object({
  params: z.object({ id: idString, responseId: idString }),
});

// ─── GET /forms/:id/responses/summary ───────────────────────────────────────

export const responseSummarySchema = z.object({
  params: z.object({ id: idString }),
});

// ─── GET /forms/:id/responses/questions/:itemId ─────────────────────────────

export const questionAnswersSchema = z.object({
  params: z.object({ id: idString, itemId: idString }),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

// ─── GET /forms/:id/responses/export ────────────────────────────────────────

export const exportResponsesSchema = z.object({
  params: z.object({ id: idString }),
  query: z
    .object({
      format: z.enum(["csv"]).default("csv"),
      ...responseFilterShape,
    })
    .refine(dateRangeRefine, {
      message: "startDate tidak boleh lebih besar dari endDate",
    }),
});

// ─── GET /forms/:id/responses/:responseId/files/:fileId ─────────────────────

export const downloadResponseFileSchema = z.object({
  params: z.object({
    id: idString,
    responseId: idString,
    fileId: idString,
  }),
});

export type ListResponsesQuery = z.infer<typeof listResponsesSchema>["query"];
export type QuestionAnswersQuery = z.infer<
  typeof questionAnswersSchema
>["query"];
export type ExportResponsesQuery = z.infer<
  typeof exportResponsesSchema
>["query"];