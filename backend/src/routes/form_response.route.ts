import { Router } from "express";
// 🔥 Sesuaikan semua path import di bawah ini dengan struktur folder project kamu
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRole.js";
import FormResponseController from "../controllers/form_response.controller.js";
import {
  listResponsesSchema,
  responseDetailSchema,
  responseSummarySchema,
  questionAnswersSchema,
  exportResponsesSchema,
  downloadResponseFileSchema,
} from "../validations/form_response.validation.js";

// Dipasang di app dengan: app.use("/api/formresponse", formResponseRoutes)
// Khusus admin / Class Manager (cm). Kepemilikan form dicek lagi di service.
const router = Router();
const managers = authorizeRoles("admin", "cm");

/**
 * @swagger
 * /api/formresponse/forms/{id}/responses:
 *   get:
 *     summary: Daftar response form (default view: List)
 *     description:
 *       - status default SUBMITTED. Draft autosave responder bukan submission final; pakai status=DRAFT atau ALL kalau mau melihatnya.
 *       - startDate / endDate (yyyy-mm-dd) dibaca sebagai hari WIB. Untuk status SUBMITTED/ALL memfilter tanggal submit, untuk DRAFT memfilter tanggal dibuat.
 *       - search mencari email responder dan nama/email akun.
 *     tags: [Form Responses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [SUBMITTED, DRAFT, ALL], default: SUBMITTED }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, example: "2026-10-01" }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, example: "2026-10-31" }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Daftar response + pagination
 *       403:
 *         description: Bukan pemilik form
 *       404:
 *         description: Form tidak ditemukan
 */
router.get(
  "/forms/:id/responses",
  authenticate,
  managers,
  validate(listResponsesSchema),
  FormResponseController.listResponses,
);

/**
 * @swagger
 * /api/formresponse/forms/{id}/responses/summary:
 *   get:
 *     summary: Summary view — ringkasan jawaban per pertanyaan
 *     description:
 *       - Pilihan (MC/Checkboxes/Dropdown): jumlah dan persen per pilihan. Grid: matriks baris x kolom.
 *       - Linear Scale/Rating: rata-rata dan distribusi nilai.
 *       - Teks/Date/Time: jumlah yang menjawab + 5 contoh terbaru (daftar lengkap lewat Question view).
 *       - Hanya menghitung response SUBMITTED.
 *     tags: [Form Responses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: "{ totalSubmitted, items: [...] }"
 */
router.get(
  "/forms/:id/responses/summary",
  authenticate,
  managers,
  validate(responseSummarySchema),
  FormResponseController.getResponseSummary,
);

/**
 * @swagger
 * /api/formresponse/forms/{id}/responses/export:
 *   get:
 *     summary: Export response ke CSV
 *     description:
 *       - Memakai filter yang sama dengan list (status, search, startDate, endDate, sortOrder).
 *       - Satu kolom per pertanyaan (grid: satu kolom per baris). Pertanyaan yang sudah dihapus tapi punya jawaban tetap ikut dengan label "(dihapus)".
 *       - Maksimal 20.000 baris per export; lebih dari itu 400 EXPORT_TOO_LARGE, persempit dengan filter tanggal.
 *       - Sel yang diawali = + - @ diberi tanda petik untuk mencegah CSV injection.
 *     tags: [Form Responses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: format
 *         schema: { type: string, enum: [csv], default: csv }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [SUBMITTED, DRAFT, ALL], default: SUBMITTED }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: startDate
 *         schema: { type: string }
 *       - in: query
 *         name: endDate
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: File CSV (UTF-8 dengan BOM)
 *         content:
 *           text/csv:
 *             schema: { type: string, format: binary }
 *       400:
 *         description: Data terlalu banyak untuk diekspor
 */
router.get(
  "/forms/:id/responses/export",
  authenticate,
  managers,
  validate(exportResponsesSchema),
  FormResponseController.exportResponses,
);

/**
 * @swagger
 * /api/formresponse/forms/{id}/responses/questions/{itemId}:
 *   get:
 *     summary: Question view — semua jawaban untuk satu pertanyaan
 *     tags: [Form Responses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Daftar jawaban untuk pertanyaan itu + pagination
 *       404:
 *         description: Pertanyaan tidak ditemukan di form ini
 */
router.get(
  "/forms/:id/responses/questions/:itemId",
  authenticate,
  managers,
  validate(questionAnswersSchema),
  FormResponseController.getQuestionAnswers,
);

/**
 * @swagger
 * /api/formresponse/forms/{id}/responses/{responseId}:
 *   get:
 *     summary: Detail response (juga dipakai Individual view lewat prev/next)
 *     description:
 *       - Judul pertanyaan dan label pilihan yang ditampilkan adalah snapshot SAAT response dikirim, jadi tetap terbaca benar walau form sudah diedit.
 *       - navigation.prevResponseId / nextResponseId buat berpindah antar response SUBMITTED.
 *       - Untuk Form Event, field event berisi informasi Event terkait.
 *     tags: [Form Responses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: responseId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Detail response lengkap (responder, metadata, event, jawaban, file)
 *       404:
 *         description: Response tidak ditemukan
 */
router.get(
  "/forms/:id/responses/:responseId",
  authenticate,
  managers,
  validate(responseDetailSchema),
  FormResponseController.getResponseDetail,
);

/**
 * @swagger
 * /api/formresponse/forms/{id}/responses/{responseId}/files/{fileId}:
 *   get:
 *     summary: Download file upload dari responder
 *     description: File disimpan di folder privat dan hanya bisa diunduh lewat endpoint ini (cek login dan kepemilikan form).
 *     tags: [Form Responses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: responseId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: File (attachment)
 *       404:
 *         description: File tidak ditemukan
 */
router.get(
  "/forms/:id/responses/:responseId/files/:fileId",
  authenticate,
  managers,
  validate(downloadResponseFileSchema),
  FormResponseController.downloadResponseFile,
);

export default router;
