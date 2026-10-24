import { z } from "zod";

const idString = z.string().trim().min(1).max(100);

// ─── Format jawaban ─────────────────────────────────────────────────────────
// Satu objek per pertanyaan. Field yang dipakai tergantung tipe pertanyaan:
//
//  SHORT_ANSWER / PARAGRAPH / TIME_DURATION -> text  ("HH:mm:ss" utk waktu/durasi)
//  LINEAR_SCALE / RATING                    -> number
//  DATE                                     -> date  ("yyyy-mm-dd")
//  MULTIPLE_CHOICE / DROPDOWN / CHECKBOXES  -> optionIds
//  MULTIPLE_CHOICE_GRID / CHECKBOX_GRID     -> grid: [{ rowId, optionIds: [columnId] }]
//  FILE_UPLOAD                              -> file baru lewat multipart field
//                                              "file:<itemId>"; keepFileIds =
//                                              file lama yang dipertahankan
//                                              (edit / lanjut draft)
//
// Aturan per tipe (required, validation, range, jumlah file, dst.) dicek di
// service karena butuh struktur form dari DB.

const answerSchema = z.object({
  itemId: idString,
  text: z.string().max(20000).optional(),
  number: z.number().int().optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  optionIds: z.array(idString).max(200).optional(),
  grid: z
    .array(
      z.object({
        rowId: idString,
        optionIds: z.array(idString).max(100),
      }),
    )
    .max(200)
    .optional(),
  keepFileIds: z.array(idString).max(20).optional(),
});

const responseBodyShape = {
  email: z.string().trim().toLowerCase().email().max(254).optional(),
  // UUID/random string per percobaan submit; retry pakai key yang sama
  // nggak bikin response dobel.
  idempotencyKey: z.string().trim().min(8).max(100).optional(),
  answers: z.array(answerSchema).max(500).default([]),
};

// ─── GET /forms/:slug ───────────────────────────────────────────────────────

export const slugParamSchema = z.object({
  params: z.object({ slug: idString }),
});

// ─── GET /events/:eventId/forms (daftar form di halaman Event) ─────────────

export const eventFormsParamSchema = z.object({
  params: z.object({ eventId: idString }),
});

// ─── POST /forms/:slug/responses ────────────────────────────────────────────

export const submitFormResponseSchema = z.object({
  params: z.object({ slug: idString }),
  body: z.object(responseBodyShape),
});

// ─── PUT /forms/:slug/responses/:responseId (edit setelah submit) ───────────

export const editFormResponseSchema = z.object({
  params: z.object({ slug: idString, responseId: idString }),
  query: z.object({ editToken: z.string().trim().max(200).optional() }),
  body: z.object(responseBodyShape),
});

// ─── GET /forms/:slug/responses/:responseId (ambil response sendiri) ────────

export const getOwnResponseSchema = z.object({
  params: z.object({ slug: idString, responseId: idString }),
  query: z.object({ editToken: z.string().trim().max(200).optional() }),
});

// ─── PUT /forms/:slug/draft  |  GET /forms/:slug/draft ──────────────────────

export const saveDraftSchema = z.object({
  params: z.object({ slug: idString }),
  body: z.object(responseBodyShape),
});

export const getDraftSchema = slugParamSchema;

export type SubmitResponseInput = z.infer<
  typeof submitFormResponseSchema
>["body"];
export type PublicAnswerInput = z.infer<typeof answerSchema>;
