import { Router } from "express";
// 🔥 Sesuaikan semua path import di bawah ini dengan struktur folder project kamu
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { optionalAuthenticate } from "../middlewares/optionalAuthenticate.js";
import FormPublicController from "../controllers/form_public.controller.js";
import { handleFormAnswerFilesUpload } from "../middlewares/uploadImage.js";
import {
  parseFormResponsePayload,
  cleanupFormUploadsOnError,
} from "../middlewares/parseFormResponsePayload.js";
import {
  slugParamSchema,
  eventFormsParamSchema,
  submitFormResponseSchema,
  editFormResponseSchema,
  getOwnResponseSchema,
  saveDraftSchema,
  getDraftSchema,
} from "../validations/form_public.validation.js";

// Dipasang di app dengan: app.use("/api/formpublic", formPublicRoutes)
// Endpoint untuk RESPONDER (mentee / pemegang link), bukan Class Manager.
// optionalAuthenticate: token valid -> req.user terisi, kalau tidak ada tetap
// lanjut sebagai anonim. Keputusan login-wajib diambil di service sesuai
// setting form (responderAccess).
const router = Router();

// Urutan middleware buat endpoint yang menerima jawaban (multipart):
//   multer -> cleanup (hapus file kalau request gagal) -> parse payload -> validate
const answerUploadChain = [
  handleFormAnswerFilesUpload,
  cleanupFormUploadsOnError,
  parseFormResponsePayload,
];

/**
 * @swagger
 * /api/formpublic/events/{eventId}/forms:
 *   get:
 *     summary: Daftar form Published untuk ditampilkan di halaman Event
 *     description:
 *       - Hanya Form Event berstatus PUBLISHED dengan "Tampilkan di halaman Event" aktif.
 *       - Satu Event bisa punya beberapa form; semuanya dikembalikan (urut tanggal publish).
 *       - Tiap form membawa availability (isOpen, reason, message) supaya halaman Event bisa menampilkan status tutup.
 *     tags: [Form Public]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Daftar form
 */
router.get(
  "/events/:eventId/forms",
  validate(eventFormsParamSchema),
  FormPublicController.listEventForms,
);

/**
 * @swagger
 * /api/formpublic/forms/{slug}:
 *   get:
 *     summary: Ambil form untuk dirender responder
 *     description:
 *       - Hanya form PUBLISHED (selain itu 404 FORM_NOT_FOUND).
 *       - responderAccess = LOGIN_REQUIRED dan belum login -> 401 LOGIN_REQUIRED.
 *       - availability.isOpen = false berarti form Published tapi sedang tidak menerima response; reason: MANUALLY_CLOSED | NOT_YET_OPEN | PERIOD_ENDED | LIMIT_REACHED, message memakai closed message custom kalau ada.
 *       - userState (kalau login): hasSubmitted, submittedResponseId, canEditResponse, isBlocked, draftResponseId.
 *     tags: [Form Public]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: "{ form, availability, userState }"
 *       401:
 *         description: Form mewajibkan login
 *       404:
 *         description: Form tidak ditemukan / belum dipublikasikan
 */
router.get(
  "/forms/:slug",
  optionalAuthenticate,
  validate(slugParamSchema),
  FormPublicController.getForm,
);

/**
 * @swagger
 * /api/formpublic/forms/{slug}/responses:
 *   post:
 *     summary: Kirim jawaban (submit response final)
 *     description:
 *       - Boleh JSON biasa; pakai multipart/form-data kalau ada pertanyaan File Upload.
 *       - Multipart: seluruh jawaban dikirim sebagai JSON string di field "payload", file di field "file:<itemId>".
 *       - payload = { email?, idempotencyKey?, answers: [{ itemId, text? | number? | date? | optionIds? | grid? | keepFileIds? }] }.
 *       - Aturan dicek server: required, validation per pertanyaan, range, jumlah/tipe/ukuran file, dan alur section/branching (jawaban di section yang tidak dilewati dibuang).
 *       - Gagal validasi -> 400 VALIDATION_FAILED dengan details = [{ itemId | field, message }].
 *       - idempotencyKey (UUID per percobaan submit): retry dengan key sama tidak membuat response dobel (balasan 200 replay=true).
 *       - Form tutup -> 403 (code = alasan). Limit tercapai saat submit -> 409 LIMIT_REACHED. Sudah mengisi (limit satu response per akun) -> 409 ALREADY_SUBMITTED.
 *       - Responder anonim di form yang mengizinkan edit mendapat editToken di balasan (simpan, dipakai buat edit).
 *     tags: [Form Public]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               payload:
 *                 type: string
 *                 description: JSON.stringify({ email, idempotencyKey, answers })
 *                 example: '{"idempotencyKey":"7c9e6679-7425-40de-944b-e07fc1f90ae7","answers":[{"itemId":"ckabc","text":"Dimas"},{"itemId":"ckdef","optionIds":["ckopt1"]}]}'
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               idempotencyKey: { type: string }
 *               answers: { type: array, items: { type: object } }
 *     responses:
 *       201:
 *         description: "{ responseId, status, submittedAt, editToken, confirmationMessage, replay }"
 *       400:
 *         description: Jawaban belum valid
 *       401:
 *         description: Form mewajibkan login
 *       403:
 *         description: Form sedang tidak menerima response
 *       409:
 *         description: Limit tercapai / sudah pernah mengisi
 */
router.post(
  "/forms/:slug/responses",
  optionalAuthenticate,
  ...answerUploadChain,
  validate(submitFormResponseSchema),
  FormPublicController.submitResponse,
);

/**
 * @swagger
 * /api/formpublic/forms/{slug}/responses/{responseId}:
 *   get:
 *     summary: Ambil response sendiri (buat mengisi form edit)
 *     description: Akses lewat akun pemilik response, atau responder anonim dengan editToken (header x-form-edit-token atau query editToken).
 *     tags: [Form Public]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: responseId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: editToken
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Jawaban dalam format yang sama dengan payload submit
 *       403:
 *         description: Bukan pemilik response
 */
router.get(
  "/forms/:slug/responses/:responseId",
  optionalAuthenticate,
  validate(getOwnResponseSchema),
  FormPublicController.getOwnResponse,
);

/**
 * @swagger
 * /api/formpublic/forms/{slug}/responses/{responseId}:
 *   put:
 *     summary: Edit response setelah submit
 *     description:
 *       - Hanya kalau form mengaktifkan "izinkan edit response" (403 EDIT_DISABLED) dan form masih menerima response (limit responden tidak dihitung untuk edit).
 *       - Format body sama dengan submit; jawaban lama diganti seluruhnya. File lama yang mau dipertahankan dikirim lewat keepFileIds.
 *       - Akses: akun pemilik response, atau editToken (header x-form-edit-token / query editToken).
 *     tags: [Form Public]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: responseId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: editToken
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               payload: { type: string, description: "JSON.stringify({ email, answers })" }
 *     responses:
 *       200:
 *         description: Response diperbarui
 *       403:
 *         description: Edit tidak diizinkan / bukan pemilik / form tutup
 */
router.put(
  "/forms/:slug/responses/:responseId",
  optionalAuthenticate,
  ...answerUploadChain,
  validate(editFormResponseSchema),
  FormPublicController.editResponse,
);

/**
 * @swagger
 * /api/formpublic/forms/{slug}/draft:
 *   get:
 *     summary: Ambil draft autosave milik responder (null kalau belum ada)
 *     description: Wajib login dan form mengaktifkan draft autosave (403 DRAFT_DISABLED).
 *     tags: [Form Public]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Draft atau null
 */
router.get(
  "/forms/:slug/draft",
  authenticate,
  validate(getDraftSchema),
  FormPublicController.getDraft,
);

/**
 * @swagger
 * /api/formpublic/forms/{slug}/draft:
 *   put:
 *     summary: Simpan draft autosave
 *     description:
 *       - Wajib login (butuh identitas responder) dan form mengaktifkan draft autosave.
 *       - Satu draft per akun per form. Draft BUKAN submission final: nggak dihitung ke limit responden dan nggak muncul di daftar response default.
 *       - Hanya bentuk jawaban yang dicek (ID valid, tipe cocok); required/validation baru dicek saat submit.
 *       - Format body sama dengan submit.
 *     tags: [Form Public]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               payload: { type: string, description: "JSON.stringify({ email, answers })" }
 *     responses:
 *       200:
 *         description: "{ responseId, updatedAt }"
 *       403:
 *         description: Draft tidak diaktifkan / form tutup
 */
router.put(
  "/forms/:slug/draft",
  authenticate,
  ...answerUploadChain,
  validate(saveDraftSchema),
  FormPublicController.saveDraft,
);

export default router;
