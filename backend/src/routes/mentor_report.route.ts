import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRole.js";
import { validate } from "../middlewares/validate.js";
import * as MentorReportController from "../controllers/mentor_report.controller.js";
import {
  createMentorReportSchema,
  updateMentorReportSchema,
  getMentorReportListSchema,
  mentorReportIdSchema,
  exportMentorReportQuerySchema,
  mentorReportSessionIdSchema,
  mentorReportMentorProfileIdSchema,
} from "../validations/mentor_report.validation.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Mentor Report
 *   description: Manajemen Report Mentor pada Session
 */

/**
 * @swagger
 * /api/mentorReports/mentor/reports:
 *   get:
 *     summary: Ambil daftar laporan mentor
 *     description: Endpoint untuk mengambil daftar laporan mentor terkait sesi mentoring yang sudah dijalankan.
 *     tags: [MentorReport]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *           default: "1"
 *         description: Halaman pagination (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *           default: "10"
 *         description: Jumlah item per halaman (default 10)
 *       - in: query
 *         name: sessionId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter berdasarkan session mentoring
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Kata kunci pencarian (berlaku untuk semua kolom laporan)
 *       - in: query
 *         name: sortField
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt]
 *         description: Kolom untuk sorting
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Urutan sorting (asc/desc)
 *     responses:
 *       200:
 *         description: Daftar laporan mentor berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Daftar laporan mentor berhasil diambil
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       sessionId:
 *                         type: string
 *                         format: uuid
 *                       mentorProfileId:
 *                         type: string
 *                         format: uuid
 *                       understanding:
 *                         type: string
 *                       participation:
 *                         type: string
 *                       challenges:
 *                         type: string
 *                       commonQuestions:
 *                         type: string
 *                       nextFocus:
 *                         type: string
 *                       additionalNotes:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       session:
 *                         type: object
 *                         description: Informasi session terkait
 *                       mentorProfile:
 *                         type: object
 *                         description: Informasi profil mentor terkait
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  "/mentor/reports",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(getMentorReportListSchema),
  MentorReportController.getMentorReports
);

/**
 * @swagger
 * /api/mentorReports/mentor/reports:
 *   post:
 *     summary: Buat laporan mentor baru untuk sesi mentoring
 *     description: Endpoint ini digunakan oleh mentor untuk membuat laporan terkait sesi mentoring yang telah dijalankan. Setiap mentor hanya boleh membuat satu laporan per sesi.
 *     tags: [MentorReport]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - understanding
 *               - participation
 *             properties:
 *               sessionId:
 *                 type: string
 *                 example: "sess_12345"
 *               understanding:
 *                 type: string
 *                 example: "Mentee memahami 70% materi dengan baik"
 *               participation:
 *                 type: string
 *                 example: "Mentee aktif bertanya dan berdiskusi"
 *               challenges:
 *                 type: string
 *                 example: "Kesulitan memahami konsep dasar"
 *               commonQuestions:
 *                 type: string
 *                 example: "Apa perbedaan A dan B?"
 *               nextFocus:
 *                 type: string
 *                 example: "Latihan soal tambahan pada topik X"
 *               additionalNotes:
 *                 type: string
 *                 example: "Perlu follow up dari tim terkait progress"
 *     responses:
 *       201:
 *         description: Laporan mentor berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Laporan mentor berhasil dibuat"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "MR-20250930-ABC123"
 *                     sessionId:
 *                       type: string
 *                       example: "sess_12345"
 *                     mentorProfileId:
 *                       type: string
 *                       example: "mentor_67890"
 *                     understanding:
 *                       type: string
 *                       example: "Mentee memahami 70% materi dengan baik"
 *                     participation:
 *                       type: string
 *                       example: "Mentee aktif bertanya dan berdiskusi"
 *                     challenges:
 *                       type: string
 *                       example: "Kesulitan memahami konsep dasar"
 *                     commonQuestions:
 *                       type: string
 *                       example: "Apa perbedaan A dan B?"
 *                     nextFocus:
 *                       type: string
 *                       example: "Latihan soal tambahan pada topik X"
 *                     additionalNotes:
 *                       type: string
 *                       example: "Perlu follow up dari tim terkait progress"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-09-30T08:00:00.000Z"
 *       400:
 *         description: Request body tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "sessionId, understanding, dan participation wajib diisi"
 *       403:
 *         description: Role tidak diizinkan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hanya mentor yang dapat membuat laporan"
 *       500:
 *         description: Terjadi kesalahan server
 */
router.post(
  "/mentor/reports",
  authenticate,
  authorizeRoles("mentor"),
  validate(createMentorReportSchema),
  MentorReportController.createMentorReport
);

/**
 * @swagger
 * /api/mentorReports/mentor/reports/{id}:
 *   get:
 *     summary: Ambil detail laporan mentor berdasarkan ID
 *     description: Endpoint ini digunakan untuk mengambil detail laporan mentor tertentu. Akses dapat dilakukan oleh mentor (hanya laporan miliknya) atau admin (semua laporan).
 *     tags: [MentorReport]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: string
 *         description: ID laporan mentor
 *     responses:
 *       200:
 *         description: Detail laporan mentor berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Detail laporan mentor berhasil diambil
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "e4b5a1d4-8b5d-4e3f-9b4f-12f9d34d5678"
 *                     content:
 *                       type: string
 *                       example: "Hari ini sesi mentoring berjalan lancar"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-09-30T10:15:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-09-30T10:20:00.000Z"
 *                     session:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                           example: "9d3a27c2-b2de-4b2f-97ff-7a8f89c13a45"
 *                         title:
 *                           type: string
 *                           example: "Sesi Mentoring 1"
 *                         date:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-09-29T09:00:00.000Z"
 *                     mentorProfile:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                           example: "7f7b37e4-8c44-4f26-9c2d-0bbf9d874c91"
 *                         fullName:
 *                           type: string
 *                           example: "Budi Santoso"
 *                         expertise:
 *                           type: string
 *                           example: "Software Engineering"
 *       400:
 *         description: Parameter tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Parameter id wajib diisi
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Forbidden (tidak punya akses)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Anda tidak memiliki izin untuk melihat laporan ini
 *       404:
 *         description: Laporan mentor tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Laporan mentor tidak ditemukan
 */
router.get(
  "/mentor/reports/:id",
  authenticate,
  authorizeRoles("mentor", "admin"),
  validate(mentorReportIdSchema),
  MentorReportController.getMentorReportById
);

/**
 * @swagger
 * /api/mentorReports/mentor/reports/{id}:
 *   put:
 *     summary: Perbarui laporan mentor
 *     description: Hanya mentor yang bertanggung jawab atas sesi terkait yang dapat memperbarui laporan ini. Update dapat dilakukan secara partial (tidak semua kolom wajib diisi).
 *     tags: [MentorReport]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID laporan mentor
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               understanding:
 *                 type: string
 *                 description: Pemahaman mentee terhadap materi
 *               participation:
 *                 type: string
 *                 description: Respon dan partisipasi mentee
 *               challenges:
 *                 type: string
 *                 description: Tantangan atau kesulitan yang dihadapi mentee
 *               commonQuestions:
 *                 type: string
 *                 description: Pertanyaan umum yang sering diajukan
 *               nextFocus:
 *                 type: string
 *                 description: Rekomendasi atau fokus sesi berikutnya
 *               additionalNotes:
 *                 type: string
 *                 description: Catatan tambahan untuk tim
 *             example:
 *               understanding: "Mentee memahami 70% materi"
 *               participation: "Aktif bertanya tapi agak pasif diskusi"
 *               challenges: "Kesulitan memahami konsep advanced"
 *               commonQuestions: "Apa bedanya supervised dan unsupervised?"
 *               nextFocus: "Fokus pada praktik studi kasus"
 *               additionalNotes: "Perlu tambahan mentoring sebelum ujian"
 *     responses:
 *       200:
 *         description: Laporan mentor berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Laporan mentor berhasil diperbarui
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: MR-20250930-AB1234
 *                     sessionId:
 *                       type: string
 *                       example: session_123
 *                     mentorProfileId:
 *                       type: string
 *                       example: mentor_456
 *                     understanding:
 *                       type: string
 *                     participation:
 *                       type: string
 *                     challenges:
 *                       type: string
 *                     commonQuestions:
 *                       type: string
 *                     nextFocus:
 *                       type: string
 *                     additionalNotes:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Parameter id wajib atau body kosong
 *       403:
 *         description: Hanya mentor yang dapat memperbarui laporan
 *       404:
 *         description: Laporan mentor tidak ditemukan
 */
router.put(
  "/mentor/reports/:id",
  authenticate,
  authorizeRoles("mentor"),
  validate(updateMentorReportSchema),
  MentorReportController.updateMentorReport
);

/**
 * @swagger
 * /api/mentorReports/mentor/reports/{id}:
 *   delete:
 *     summary: Hapus laporan mentor
 *     description: >
 *       Endpoint ini digunakan untuk menghapus laporan mentor.
 *       - **Admin** dapat menghapus laporan siapa pun.
 *       - **Mentor** hanya dapat menghapus laporan yang dibuatnya sendiri.
 *     tags: [MentorReport]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID laporan mentor yang akan dihapus
 *     responses:
 *       200:
 *         description: Laporan berhasil dihapus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Laporan mentor berhasil dihapus (oleh admin)
 *       400:
 *         description: Parameter tidak valid atau ID kosong
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Parameter id wajib diisi
 *       401:
 *         description: Tidak terautentikasi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Tidak memiliki izin menghapus laporan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Anda tidak memiliki izin untuk menghapus laporan ini
 *       404:
 *         description: Laporan tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Laporan mentor tidak ditemukan
 *       500:
 *         description: Error server
 */
router.delete(
  "/mentor/reports/:id",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(mentorReportIdSchema),
  MentorReportController.deleteMentorReport
);

/**
 * @swagger
 * /api/mentorReports/mentor/reports/export:
 *   get:
 *     summary: Export laporan mentor (admin only)
 *     tags: [MentorReport]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         required: true
 *         schema:
 *           type: string
 *           enum: [csv, excel]
 *         description: Format file ekspor (csv atau excel)
 *     responses:
 *       200:
 *         description: File ekspor laporan mentor
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Format file tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Format file tidak valid. Hanya csv dan excel yang didukung.
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Akses ditolak (bukan admin)
 *       500:
 *         description: Terjadi kesalahan server
 */
router.get(
  "/mentor/reports/export",
  authenticate,
  authorizeRoles("admin"),
  validate(exportMentorReportQuerySchema),
  MentorReportController.exportMentorReports
);

/**
 * @swagger
 * /api/mentorReports/mentor/reports/session/{sessionId}:
 *   get:
 *     summary: Get laporan mentor berdasarkan sessionId
 *     description:
 *       - Admin bisa melihat semua laporan mentor untuk sesi tertentu.
 *       - Mentor hanya bisa melihat laporan yang dibuatnya sendiri pada sesi tersebut.
 *     tags: [MentorReport]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID sesi mentoring
 *     responses:
 *       200:
 *         description: Daftar laporan mentor untuk sessionId
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Laporan mentor berhasil diambil
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       sessionId:
 *                         type: string
 *                       mentorProfileId:
 *                         type: string
 *                       understanding:
 *                         type: string
 *                       participation:
 *                         type: string
 *                       challenges:
 *                         type: string
 *                       commonQuestions:
 *                         type: string
 *                       nextFocus:
 *                         type: string
 *                       additionalNotes:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Parameter sessionId wajib diisi
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Akses ditolak (bukan admin atau mentor)
 *       404:
 *         description: Laporan tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan pada server
 */
router.get(
  "/mentor/reports/session/:sessionId",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(mentorReportSessionIdSchema),
  MentorReportController.getMentorReportsBySessionId
);

/**
 * @swagger
 * /api/mentorReports/mentor/reports/mentor/{mentorProfileId}:
 *   get:
 *     summary: Get laporan mentor berdasarkan mentorProfileId
 *     description:
 *       - Hanya admin yang bisa melihat semua laporan mentor tertentu.
 *     tags: [MentorReport]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mentorProfileId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID profil mentor
 *     responses:
 *       200:
 *         description: Daftar laporan mentor untuk mentorProfileId
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Laporan mentor berhasil diambil
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       sessionId:
 *                         type: string
 *                       mentorProfileId:
 *                         type: string
 *                       understanding:
 *                         type: string
 *                       participation:
 *                         type: string
 *                       challenges:
 *                         type: string
 *                       commonQuestions:
 *                         type: string
 *                       nextFocus:
 *                         type: string
 *                       additionalNotes:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Parameter mentorProfileId wajib diisi
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Akses ditolak (bukan admin)
 *       404:
 *         description: Laporan tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan pada server
 */
router.get(
  "/mentor/reports/mentor/:mentorProfileId",
  authenticate,
  authorizeRoles("admin"),
  validate(mentorReportMentorProfileIdSchema),
  MentorReportController.getMentorReportsByMentorProfileId
);

export default router;
