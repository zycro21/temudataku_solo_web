import { Router } from "express";
// 🔥 Sesuaikan semua path import di bawah ini dengan struktur folder project kamu
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRole.js";
import FormController from "../controllers/form.controller.js";
import {
  handleFormHeaderImageUpload,
  handleFormMediaUpload,
} from "../middlewares/uploadImage.js";
import {
  listFormsSchema,
  createFormSchema,
  formIdParamSchema,
  updateFormSchema,
  saveFormStructureSchema,
  duplicateFormSchema,
  prefillLinkSchema,
  listEligibleEventsSchema,
} from "../validations/form.validation.js";

// Dipasang di app dengan: app.use("/api/form", formRoutes)
// Semua endpoint di file ini khusus admin / Class Manager (cm).
const router = Router();
const managers = authorizeRoles("admin", "cm");

/**
 * @swagger
 * /api/form/forms:
 *   get:
 *     summary: Kelola Form — daftar form (tab Form Event / Form Non Event)
 *     description:
 *       - type = EVENT atau NON_EVENT dipakai sebagai tab aktif (filter utama).
 *       - search mencari judul form dan, untuk Form Event, nama Event terkait.
 *       - Form berstatus ARCHIVED disembunyikan kecuali status=ARCHIVED difilter eksplisit.
 *       - Admin melihat semua form; selain admin hanya form buatannya sendiri.
 *       - sortOrder desc = terbaru, asc = terlama.
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [EVENT, NON_EVENT] }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [DRAFT, PUBLISHED, ARCHIVED] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [createdAt, updatedAt], default: updatedAt }
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
 *         description: Daftar form (id, type, title, status, eventNameSnapshot, responseCount, updatedAt, ...)
 *       403:
 *         description: Hanya admin/cm
 */
router.get(
  "/forms",
  authenticate,
  managers,
  validate(listFormsSchema),
  FormController.listForms,
);

/**
 * @swagger
 * /api/form/events/eligible:
 *   get:
 *     summary: Pilih Event Non-Kelas — daftar Event yang eligible dan boleh dikelola
 *     description:
 *       - BELUM AKTIF sampai modul Event ada: sementara membalas 501 (EVENT_MODULE_NOT_READY).
 *       - Filtering Event eligible dilakukan di backend (bukan cuma disembunyikan di frontend).
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Daftar Event non-kelas
 *       501:
 *         description: Modul Event belum tersedia
 */
router.get(
  "/events/eligible",
  authenticate,
  managers,
  validate(listEligibleEventsSchema),
  FormController.listEligibleEvents,
);

/**
 * @swagger
 * /api/form/forms:
 *   post:
 *     summary: Buat form baru (setelah memilih tipe)
 *     description:
 *       - type = EVENT wajib mengirim eventId (divalidasi backend; sementara 501 sampai modul Event ada).
 *       - type = NON_EVENT tidak boleh mengirim eventId.
 *       - Form baru berstatus DRAFT dan otomatis punya 1 section kosong.
 *       - Tipe form TIDAK bisa diubah setelah dibuat — pakai endpoint duplicate buat ganti tipe.
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type]
 *             properties:
 *               type: { type: string, enum: [EVENT, NON_EVENT] }
 *               title: { type: string, example: "Form Pendaftaran Hackathon" }
 *               description: { type: string }
 *               eventId: { type: string }
 *     responses:
 *       201:
 *         description: Form berhasil dibuat
 *       400:
 *         description: Data tidak valid
 *       501:
 *         description: Modul Event belum tersedia (untuk Form Event)
 */
router.post(
  "/forms",
  authenticate,
  managers,
  validate(createFormSchema),
  FormController.createForm,
);

/**
 * @swagger
 * /api/form/forms/{id}:
 *   get:
 *     summary: Detail form + seluruh struktur (buat Form Builder)
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Detail form (sections > items > options, tanpa data yang sudah dihapus) + availability
 *       403:
 *         description: Bukan pemilik form
 *       404:
 *         description: Form tidak ditemukan
 */
router.get(
  "/forms/:id",
  authenticate,
  managers,
  validate(formIdParamSchema),
  FormController.getFormDetail,
);

/**
 * @swagger
 * /api/form/forms/{id}:
 *   patch:
 *     summary: Ubah judul, deskripsi, pengaturan, dan tema form
 *     description:
 *       - Kirim hanya field yang mau diubah.
 *       - Pengaturan penerimaan response (batas responden, periode, manual accepting) TERPISAH dari status Publish.
 *       - showOnEventPage hanya boleh true untuk Form Event.
 *       - Header image diubah lewat PUT /forms/{id}/header-image.
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string, nullable: true }
 *               showOnEventPage: { type: boolean }
 *               acceptingResponses: { type: boolean }
 *               responseLimitEnabled: { type: boolean }
 *               responseLimit: { type: integer, nullable: true }
 *               periodEnabled: { type: boolean }
 *               openAt: { type: string, format: date-time, nullable: true }
 *               closeAt: { type: string, format: date-time, nullable: true }
 *               responderAccess: { type: string, enum: [ANYONE_WITH_LINK, LOGIN_REQUIRED] }
 *               collectEmail: { type: boolean }
 *               limitOneResponsePerAccount: { type: boolean }
 *               allowEditResponse: { type: boolean }
 *               sendResponseReceipt: { type: boolean }
 *               allowResponderDraft: { type: boolean }
 *               shuffleQuestionOrder: { type: boolean }
 *               notifyOnNewResponse: { type: boolean }
 *               confirmationMessage: { type: string, nullable: true }
 *               closedMessage: { type: string, nullable: true }
 *               themeColor: { type: string, example: "#10B981", nullable: true }
 *               backgroundColor: { type: string, example: "#F9FAFB", nullable: true }
 *               fontPreset: { type: string, nullable: true }
 *     responses:
 *       200:
 *         description: Form berhasil diperbarui
 *       400:
 *         description: Data tidak valid (mis. limit aktif tapi jumlah kosong, periode tidak lengkap)
 *       409:
 *         description: Form sudah diarsipkan
 */
router.patch(
  "/forms/:id",
  authenticate,
  managers,
  validate(updateFormSchema),
  FormController.updateForm,
);

/**
 * @swagger
 * /api/form/forms/{id}/structure:
 *   put:
 *     summary: Simpan Draft — simpan seluruh struktur form (section, pertanyaan, pilihan)
 *     description:
 *       - FULL SYNC: yang tidak ada di payload di-SOFT delete (bukan hard delete) supaya response lama tetap terbaca.
 *       - Urutan array = urutan tampil; orderNumber dihitung server.
 *       - "id" = item yang sudah ada (ID stabil, jangan dibuat ulang). Tanpa id = item baru.
 *       - "key" (opsional) = penanda sementara item BARU supaya bisa dirujuk di payload yang sama (nextSectionKey / branchSectionKey). Respons berisi keyMap (key -> id asli).
 *       - Tipe pertanyaan yang sudah punya jawaban tidak bisa diubah (409 ITEM_TYPE_LOCKED).
 *       - Simpan draft longgar soal kelengkapan; kelengkapan penuh dicek saat Publish. Kalau form sudah PUBLISHED, hasil simpan harus tetap valid (kalau tidak, 400 INVALID_PUBLISHED_STRUCTURE).
 *       - Upload gambar/video untuk elemen Image/Video lewat POST /forms/{id}/media dulu, lalu isi url-nya di config.
 *       - Branching hanya untuk Multiple Choice dan Dropdown.
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sections]
 *             properties:
 *               sections:
 *                 type: array
 *                 items: { type: object }
 *           example:
 *             sections:
 *               - key: s1
 *                 title: "Data Diri"
 *                 nextAction: NEXT
 *                 items:
 *                   - key: q1
 *                     type: MULTIPLE_CHOICE
 *                     title: "Kamu mahasiswa?"
 *                     isRequired: true
 *                     options:
 *                       - { key: o1, label: "Ya", branchAction: NEXT }
 *                       - { key: o2, label: "Tidak", branchAction: GO_TO_SECTION, branchSectionKey: s2 }
 *               - key: s2
 *                 title: "Pekerjaan"
 *                 nextAction: SUBMIT
 *                 items:
 *                   - { key: q2, type: SHORT_ANSWER, title: "Bekerja di mana?", validation: { kind: length, op: max, value: 100 } }
 *     responses:
 *       200:
 *         description: Draft tersimpan (detail form terbaru + keyMap)
 *       400:
 *         description: Struktur tidak valid
 *       409:
 *         description: Tipe pertanyaan terkunci / form diarsipkan
 */
router.put(
  "/forms/:id/structure",
  authenticate,
  managers,
  validate(saveFormStructureSchema),
  FormController.saveFormStructure,
);

/**
 * @swagger
 * /api/form/forms/{id}/publish:
 *   post:
 *     summary: Publish form
 *     description:
 *       - Form dicek kelengkapannya dulu: judul, minimal 1 pertanyaan, pilihan/baris/kolom terisi, media terunggah, tujuan branching valid, tidak ada loop antar section, pengaturan limit/periode lengkap.
 *       - Kalau gagal, 400 PUBLISH_VALIDATION_FAILED dengan details = daftar masalah.
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Form dipublikasikan
 *       400:
 *         description: Form belum memenuhi syarat publish
 *       409:
 *         description: Form sudah diarsipkan
 */
router.post(
  "/forms/:id/publish",
  authenticate,
  managers,
  validate(formIdParamSchema),
  FormController.publishForm,
);

/**
 * @swagger
 * /api/form/forms/{id}/unpublish:
 *   post:
 *     summary: Unpublish form (akses responder dihentikan; konfigurasi dan response tetap aman)
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Publikasi dihentikan (status kembali DRAFT)
 *       409:
 *         description: Form tidak sedang dipublikasikan
 */
router.post(
  "/forms/:id/unpublish",
  authenticate,
  managers,
  validate(formIdParamSchema),
  FormController.unpublishForm,
);

/**
 * @swagger
 * /api/form/forms/{id}/archive:
 *   post:
 *     summary: Arsipkan form (bukan hard delete; response tetap tersimpan)
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Form diarsipkan
 *       409:
 *         description: Form sudah diarsipkan
 */
router.post(
  "/forms/:id/archive",
  authenticate,
  managers,
  validate(formIdParamSchema),
  FormController.archiveForm,
);

/**
 * @swagger
 * /api/form/forms/{id}/duplicate:
 *   post:
 *     summary: Duplicate form (juga dipakai untuk "mengganti tipe" form)
 *     description:
 *       - Menyalin struktur dan pengaturan dengan ID baru; hasilnya DRAFT, tanpa response, dengan slug baru.
 *       - type opsional: kirim type berbeda untuk membuat form dengan tipe lain dari form ini (tipe form lama tidak berubah).
 *       - Duplicate ke tipe EVENT butuh eventId (atau memakai event form asal kalau form asal juga EVENT).
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               type: { type: string, enum: [EVENT, NON_EVENT] }
 *               eventId: { type: string }
 *     responses:
 *       201:
 *         description: Form hasil duplicate
 */
router.post(
  "/forms/:id/duplicate",
  authenticate,
  managers,
  validate(duplicateFormSchema),
  FormController.duplicateForm,
);

/**
 * @swagger
 * /api/form/forms/{id}/share:
 *   get:
 *     summary: Info panel Bagikan Link Form (URL; QR Code dibuat di frontend)
 *     description: Hanya tersedia setelah form Published (409 FORM_NOT_PUBLISHED untuk Draft).
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: "{ url, slug, isShownOnEventPage }"
 *       409:
 *         description: Form belum dipublikasikan
 */
router.get(
  "/forms/:id/share",
  authenticate,
  managers,
  validate(formIdParamSchema),
  FormController.getShareInfo,
);

/**
 * @swagger
 * /api/form/forms/{id}/prefill-link:
 *   post:
 *     summary: Buat Prefilled Link
 *     description:
 *       - answers = { [itemId]: nilai }. Nilai: teks (Short Answer/Paragraph/Time), angka (Linear Scale/Rating), "yyyy-mm-dd" (Date), atau array optionId (Multiple Choice/Dropdown/Checkboxes).
 *       - Hanya tipe yang mendukung prefill. File Upload dan Grid tidak didukung.
 *       - Hasil berupa URL form dengan query pf_<itemId>=<nilai>; frontend responder membaca parameter ini untuk mengisi jawaban awal.
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [answers]
 *             properties:
 *               answers: { type: object }
 *           example:
 *             answers:
 *               ckabc123: "Dimas"
 *               ckdef456: ["ckopt1"]
 *     responses:
 *       200:
 *         description: "{ url }"
 *       409:
 *         description: Form belum dipublikasikan
 */
router.post(
  "/forms/:id/prefill-link",
  authenticate,
  managers,
  validate(prefillLinkSchema),
  FormController.createPrefillLink,
);

/**
 * @swagger
 * /api/form/forms/{id}/preview:
 *   get:
 *     summary: Preview form (data renderer responden dari struktur terbaru, termasuk Draft)
 *     description: Hanya membaca. Mengisi preview TIDAK menyimpan response production (tidak ada endpoint submit di sini).
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Struktur form untuk renderer
 */
router.get(
  "/forms/:id/preview",
  authenticate,
  managers,
  validate(formIdParamSchema),
  FormController.getFormPreview,
);

/**
 * @swagger
 * /api/form/forms/{id}/header-image:
 *   put:
 *     summary: Upload / ganti header image form
 *     description: multipart/form-data, field headerImage (jpg/jpeg/png/webp, maks 5MB).
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [headerImage]
 *             properties:
 *               headerImage: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: "{ headerImage }  (path relatif di folder /images, contoh formHeaders/xxx.jpg)"
 */
router.put(
  "/forms/:id/header-image",
  authenticate,
  managers,
  handleFormHeaderImageUpload("headerImage"),
  validate(formIdParamSchema),
  FormController.setHeaderImage,
);

/**
 * @swagger
 * /api/form/forms/{id}/header-image:
 *   delete:
 *     summary: Hapus header image form
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Header image dihapus
 */
router.delete(
  "/forms/:id/header-image",
  authenticate,
  managers,
  validate(formIdParamSchema),
  FormController.removeHeaderImage,
);

/**
 * @swagger
 * /api/form/forms/{id}/media:
 *   post:
 *     summary: Upload gambar/video untuk elemen Image / Video di builder
 *     description:
 *       - multipart/form-data, field mediaFile (jpg/jpeg/png/gif/webp/mp4/mov/avi/mkv/webm, maks 100MB).
 *       - Tidak menulis ke database: url hasil upload dimasukkan frontend ke item.config.url lalu tersimpan lewat PUT /forms/{id}/structure.
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [mediaFile]
 *             properties:
 *               mediaFile: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: "{ url, mediaType, originalName, sizeBytes }"
 */
router.post(
  "/forms/:id/media",
  authenticate,
  managers,
  handleFormMediaUpload,
  validate(formIdParamSchema),
  FormController.uploadMedia,
);

export default router;
