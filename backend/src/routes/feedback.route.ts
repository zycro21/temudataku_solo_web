import { Router } from "express";
import * as FeedbackController from "../controllers/feedback.controller";
import {
  createFeedbackSchema,
  updateFeedbackSchema,
  deleteFeedbackSchema,
  getMyFeedbacksSchema,
  getPublicFeedbacksSchema,
  getMentorFeedbacksSchema,
  getAdminFeedbacksSchema,
  patchFeedbackVisibilitySchema,
  exportFeedbackQuerySchema,
  feedbackStatsQuerySchema,
} from "../validations/feedback.validation";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorizeRole";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Feedback
 *   description: Manajemen feedback sesi mentoring
 */

/**
 * @swagger
 * /api/feedback/createFeedbacks:
 *   post:
 *     summary: Kirim feedback sesi mentoring
 *     tags: [Feedback]
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
 *               - rating
 *             properties:
 *               sessionId:
 *                 type: string
 *                 example: "sess-123456789"
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               comment:
 *                 type: string
 *                 example: "Sesi mentoring sangat bermanfaat"
 *               isAnonymous:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: Feedback berhasil dikirim
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Feedback berhasil dikirim.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "fbk-abc123"
 *                     sessionId:
 *                       type: string
 *                       example: "sess-123456789"
 *                     userId:
 *                       type: string
 *                       example: "usr-789xyz"
 *                     rating:
 *                       type: integer
 *                       example: 4
 *                     comment:
 *                       type: string
 *                       example: "Sesi mentoring sangat bermanfaat"
 *                     isAnonymous:
 *                       type: boolean
 *                       example: false
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-07-01T12:00:00Z"
 *       400:
 *         description: Request tidak valid (rating salah, feedback duplikat, dll)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Rating harus berada di antara 1 sampai 5.
 *       401:
 *         description: Tidak terautentikasi (token tidak disediakan atau salah)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Akses ditolak (bukan mentee atau tidak memiliki booking)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Kamu belum pernah mengikuti sesi ini.
 *       404:
 *         description: Sesi mentoring tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Sesi mentoring tidak ditemukan.
 *       500:
 *         description: Terjadi kesalahan pada server saat mengirim feedback
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.post(
  "/createFeedbacks",
  authenticate,
  validate(createFeedbackSchema),
  FeedbackController.createFeedbackController
);

/**
 * @swagger
 * /api/feedback/feedbacks/{id}:
 *   patch:
 *     summary: Update komentar feedback
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID feedback yang ingin diperbarui
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comment
 *             properties:
 *               comment:
 *                 type: string
 *                 example: "Komentar baru setelah dipikirkan ulang."
 *     responses:
 *       200:
 *         description: Feedback berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Feedback berhasil diperbarui.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: fbk-abc123
 *                     sessionId:
 *                       type: string
 *                       example: sess-xyz789
 *                     userId:
 *                       type: string
 *                       example: usr-123abc
 *                     rating:
 *                       type: integer
 *                       example: 5
 *                     comment:
 *                       type: string
 *                       example: Komentar baru setelah dipikirkan ulang.
 *                     isAnonymous:
 *                       type: boolean
 *                       example: false
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-07-01T12:00:00Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-07-02T10:00:00Z
 *       400:
 *         description: Request tidak valid (komentar tidak berubah)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Komentar tidak berubah, tidak perlu diupdate.
 *       401:
 *         description: Tidak terautentikasi (token tidak valid)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Akses ditolak (bukan pemilik feedback)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Kamu tidak diizinkan mengedit feedback ini.
 *       404:
 *         description: Feedback tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Feedback tidak ditemukan.
 *       500:
 *         description: Terjadi kesalahan server saat update feedback
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.patch(
  "/feedbacks/:id",
  authenticate,
  validate(updateFeedbackSchema),
  FeedbackController.updateFeedbackController
);

/**
 * @swagger
 * /api/feedback/feedbacks/{id}:
 *   delete:
 *     summary: Hapus feedback (user atau admin)
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID feedback yang ingin dihapus
 *     responses:
 *       200:
 *         description: Feedback berhasil dihapus (soft delete untuk user, hard delete untuk admin)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Feedback berhasil dihapus (tidak terlihat di publik).
 *       400:
 *         description: Request tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: ID feedback tidak valid.
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
 *         description: Akses ditolak (bukan pemilik feedback)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Kamu tidak diizinkan menghapus feedback ini.
 *       404:
 *         description: Feedback tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Feedback tidak ditemukan.
 *       500:
 *         description: Terjadi kesalahan pada server saat menghapus feedback
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.delete(
  "/feedbacks/:id",
  authenticate,
  validate(deleteFeedbackSchema),
  FeedbackController.deleteFeedbackController
);

/**
 * @swagger
 * /api/feedback/my-feedbacks:
 *   get:
 *     summary: Ambil semua feedback yang dikirim oleh user yang sedang login
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *         required: false
 *         example: "1"
 *         description: Halaman yang ingin diambil
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *         required: false
 *         example: "10"
 *         description: Jumlah item per halaman
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         example: sesi bermanfaat
 *         description: Kata kunci pencarian pada komentar atau nama service
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, submittedDate]
 *         required: false
 *         example: createdAt
 *         description: Kolom untuk pengurutan
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         required: false
 *         example: desc
 *         description: Urutan pengurutan
 *     responses:
 *       200:
 *         description: Daftar feedback milik user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Berhasil mengambil feedback
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: 37eab9f4-9f3a-476a-b2c0-36aa1d19a987
 *                       rating:
 *                         type: integer
 *                         example: 5
 *                       comment:
 *                         type: string
 *                         example: Mentor sangat membantu dan ramah.
 *                       submittedDate:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-06-25T13:00:00.000Z
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-06-25T13:00:00.000Z
 *                       isAnonymous:
 *                         type: boolean
 *                         example: false
 *                       session:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: 12345678-abcd-efgh-ijkl-9876543210mn
 *                           date:
 *                             type: string
 *                             format: date
 *                             example: 2024-06-20
 *                           startTime:
 *                             type: string
 *                             example: "13:00"
 *                           endTime:
 *                             type: string
 *                             example: "14:00"
 *                           mentoringService:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: 99999999-aaaa-bbbb-cccc-888888888888
 *                               serviceName:
 *                                 type: string
 *                                 example: Data Science Bootcamp
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *       401:
 *         description: Tidak terautentikasi (token tidak diberikan atau invalid)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: User not authenticated"
 *       500:
 *         description: Terjadi kesalahan pada server saat mengambil data feedback
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.get(
  "/my-feedbacks",
  authenticate,
  validate(getMyFeedbacksSchema),
  FeedbackController.getMyFeedbacksController
);

/**
 * @swagger
 * /api/feedback/public/mentoring-sessions/{id}/feedbacks:
 *   get:
 *     summary: Ambil feedback publik untuk sesi mentoring berdasarkan serviceId
 *     tags: [Feedback]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID service dari sesi mentoring
 *         example: eabcaf65-0c11-41d2-8e6d-b93efc54b66c
 *       - in: query
 *         name: sortBy
 *         required: false
 *         schema:
 *           type: string
 *           enum: [submittedDate, createdAt]
 *           default: submittedDate
 *         description: Urutan berdasarkan kolom apa
 *       - in: query
 *         name: sortOrder
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Arah pengurutan
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: string
 *         description: Jumlah feedback yang ingin diambil (default 3)
 *         example: "5"
 *     responses:
 *       200:
 *         description: Daftar feedback publik dan rata-rata rating
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Berhasil mengambil feedback publik berdasarkan service
 *                 data:
 *                   type: object
 *                   properties:
 *                     averageRating:
 *                       type: number
 *                       format: float
 *                       example: 4.67
 *                     feedbacks:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: 9f0c7bc1-ef48-4cce-b7e2-9b50b3aef344
 *                           rating:
 *                             type: integer
 *                             example: 5
 *                           comment:
 *                             type: string
 *                             example: Mentor sangat membantu dan penjelasannya jelas
 *                           submittedDate:
 *                             type: string
 *                             format: date-time
 *                             example: 2024-06-20T13:00:00.000Z
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2024-06-18T13:00:00.000Z
 *                           session:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: 12345678-abcd-efgh-ijkl-9876543210mn
 *                               date:
 *                                 type: string
 *                                 format: date
 *                                 example: 2024-06-20
 *                               mentoringService:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: string
 *                                     example: 99999999-aaaa-bbbb-cccc-888888888888
 *                                   serviceName:
 *                                     type: string
 *                                     example: Data Science Bootcamp
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: a1b2c3d4-5678-90ef-abcd-1234567890ef
 *                               fullName:
 *                                 type: string
 *                                 example: Anisa Putri
 *                               profilePicture:
 *                                 type: string
 *                                 nullable: true
 *                                 example: https://example.com/profiles/anisa.jpg
 *       404:
 *         description: Service atau sesi tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Service tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan saat mengambil feedback publik
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.get(
  "/public/mentoring-sessions/:id/feedbacks",
  validate(getPublicFeedbacksSchema),
  FeedbackController.getPublicFeedbacksByServiceId
);

/**
 * @swagger
 * /api/feedback/mentor/feedbacks:
 *   get:
 *     summary: Ambil semua feedback dari sesi yang diampu oleh mentor
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: rating
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: Filter berdasarkan rating tertentu
 *         example: 5
 *       - in: query
 *         name: sessionId
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter berdasarkan sesi tertentu
 *         example: eabcaf65-0c11-41d2-8e6d-b93efc54b66c
 *       - in: query
 *         name: sortBy
 *         required: false
 *         schema:
 *           type: string
 *           enum: [submittedDate, rating]
 *           default: submittedDate
 *         description: Kolom yang digunakan untuk pengurutan
 *       - in: query
 *         name: sortOrder
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Arah pengurutan data
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah feedback yang ingin diambil
 *     responses:
 *       200:
 *         description: Feedback dari sesi yang diampu oleh mentor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Berhasil mengambil feedback untuk mentor
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: 9ff72f3e-aaaa-4d8e-bbbb-ccc999aaf8ed
 *                       rating:
 *                         type: integer
 *                         example: 4
 *                       comment:
 *                         type: string
 *                         example: Mentor menjelaskan dengan sangat jelas.
 *                       submittedDate:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-06-28T13:00:00.000Z
 *                       session:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: 123e4567-e89b-12d3-a456-426614174000
 *                           date:
 *                             type: string
 *                             format: date
 *                             example: 2025-06-25
 *                           mentoringService:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: abcdef12-3456-7890-abcd-ef1234567890
 *                               serviceName:
 *                                 type: string
 *                                 example: UI/UX Design Intensive
 *                       user:
 *                         type: object
 *                         properties:
 *                           fullName:
 *                             type: string
 *                             example: Anonymous
 *                           profilePicture:
 *                             type: string
 *                             nullable: true
 *                             example: null
 *       401:
 *         description: Tidak terautentikasi (token tidak disediakan atau salah)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Akses ditolak (bukan mentor atau tidak punya profil mentor)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Mentor profile tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan pada server saat mengambil feedback
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.get(
  "/mentor/feedbacks",
  authenticate,
  authorizeRoles("mentor"),
  validate(getMentorFeedbacksSchema),
  FeedbackController.getMentorFeedbacks
);

/**
 * @swagger
 * /api/feedback/admin/feedbacks:
 *   get:
 *     summary: Ambil semua feedback (hanya untuk admin)
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sessionId
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter berdasarkan ID sesi
 *         example: 1e9f30bc-d5e1-47bb-808b-505052a6e682
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter berdasarkan ID user
 *         example: 83a95b63-17c6-45b5-a1f3-9735b27e138e
 *       - in: query
 *         name: isVisible
 *         schema:
 *           type: boolean
 *         required: false
 *         description: Filter apakah feedback masih tampil publik atau sudah disembunyikan
 *         example: true
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         required: false
 *         description: Batas minimum rating
 *         example: 3
 *       - in: query
 *         name: maxRating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         required: false
 *         description: Batas maksimum rating
 *         example: 5
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Kata kunci pencarian pada komentar atau nama service
 *         example: desain
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, submittedDate, rating]
 *         required: false
 *         description: Kolom yang digunakan untuk mengurutkan data
 *         example: submittedDate
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         required: false
 *         description: Urutan pengurutan data (naik/turun)
 *         example: desc
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *         description: Nomor halaman
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         description: Jumlah item per halaman
 *         example: 10
 *     responses:
 *       200:
 *         description: Semua feedback berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Berhasil mengambil semua feedback
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: fdb12345-6789-4abc-def0-1234567890ab
 *                           rating:
 *                             type: integer
 *                             example: 4
 *                           comment:
 *                             type: string
 *                             example: Sesi sangat bagus dan mentor jelas.
 *                           isVisible:
 *                             type: boolean
 *                             example: true
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2025-06-28T13:00:00.000Z
 *                           submittedDate:
 *                             type: string
 *                             format: date-time
 *                             example: 2025-06-28T13:30:00.000Z
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: user-123
 *                               fullName:
 *                                 type: string
 *                                 example: Dimas Putra
 *                           session:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: sess-456
 *                               date:
 *                                 type: string
 *                                 format: date
 *                                 example: 2025-06-27
 *                               mentoringService:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: string
 *                                     example: service-789
 *                                   serviceName:
 *                                     type: string
 *                                     example: Backend Engineering Bootcamp
 *                     meta:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 43
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         totalPages:
 *                           type: integer
 *                           example: 5
 *       401:
 *         description: Tidak terautentikasi (token tidak disediakan atau salah)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Akses ditolak (bukan admin)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Akses ditolak. Role tidak sesuai.
 *       500:
 *         description: Terjadi kesalahan pada server saat mengambil semua feedback
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.get(
  "/admin/feedbacks",
  authenticate,
  authorizeRoles("admin"),
  validate(getAdminFeedbacksSchema),
  FeedbackController.getAllFeedbacksForAdmin
);

/**
 * @swagger
 * /api/feedback/admin/feedbacks/{id}/visibility:
 *   patch:
 *     summary: Toggle visibility feedback (admin)
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dari feedback yang akan diubah visibilitasnya
 *         example: fdb12345-6789-4abc-def0-1234567890ab
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isVisible
 *             properties:
 *               isVisible:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Visibility feedback diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Status visibilitas berhasil diubah menjadi false
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: fdb12345-6789-4abc-def0-1234567890ab
 *                     isVisible:
 *                       type: boolean
 *                       example: false
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-07-01T10:20:30.000Z
 *                     message:
 *                       type: string
 *                       example: Status visibilitas berhasil diubah menjadi false
 *       400:
 *         description: ID tidak valid atau nilai visibilitas sudah sama
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Status visibilitas sudah bernilai false
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
 *         description: Akses ditolak (bukan admin)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Akses ditolak. Role tidak sesuai.
 *       404:
 *         description: Feedback tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Feedback tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan pada server saat mengubah visibilitas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.patch(
  "/admin/feedbacks/:id/visibility",
  authenticate,
  authorizeRoles("admin"),
  validate(patchFeedbackVisibilitySchema),
  FeedbackController.updateFeedbackVisibility
);

/**
 * @swagger
 * /api/feedback/admin/feedbacks/export:
 *   get:
 *     summary: Export feedback (admin)
 *     tags: [Feedback]
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
 *         description: File ekspor feedback
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Akses ditolak (bukan admin)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Akses ditolak. Role tidak sesuai.
 *       500:
 *         description: Terjadi kesalahan pada server saat melakukan ekspor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.get(
  "/admin/feedbacks/export",
  authenticate,
  authorizeRoles("admin"),
  validate(exportFeedbackQuerySchema),
  FeedbackController.exportFeedbacks
);

/**
 * @swagger
 * /api/feedback/feedbacks/statistics:
 *   get:
 *     summary: Statistik feedback (admin)
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal awal rentang statistik (opsional)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal akhir rentang statistik (opsional)
 *     responses:
 *       200:
 *         description: Statistik feedback berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalFeedback:
 *                       type: integer
 *                       example: 123
 *                     averageRating:
 *                       type: string
 *                       example: "4.25"
 *                     ratingDistribution:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           rating:
 *                             type: integer
 *                             example: 4
 *                           count:
 *                             type: integer
 *                             example: 56
 *                     anonymousCount:
 *                       type: integer
 *                       example: 20
 *                     visibleCount:
 *                       type: integer
 *                       example: 90
 *                     hiddenCount:
 *                       type: integer
 *                       example: 10
 *                     latestFeedbacks:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           rating:
 *                             type: integer
 *                           comment:
 *                             type: string
 *                           submittedDate:
 *                             type: string
 *                             format: date-time
 *                           isAnonymous:
 *                             type: boolean
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               fullName:
 *                                 type: string
 *                           session:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               date:
 *                                 type: string
 *                                 format: date
 *                               mentoringService:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: string
 *                                   serviceName:
 *                                     type: string
 *                     averageRatingPerService:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           serviceId:
 *                             type: string
 *                             nullable: true
 *                           serviceName:
 *                             type: string
 *                           avgRating:
 *                             type: number
 *                             format: float
 *                             example: 4.2
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-01T00:00:00.000Z"
 *                     endDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-07-01T00:00:00.000Z"
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
 *         description: Akses ditolak (hanya admin)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Akses ditolak. Role tidak sesuai.
 *       500:
 *         description: Terjadi kesalahan pada server saat mengambil statistik
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.get(
  "/feedbacks/statistics",
  authenticate,
  authorizeRoles("admin"),
  validate(feedbackStatsQuerySchema),
  FeedbackController.getFeedbackStatistics
);

export default router;
