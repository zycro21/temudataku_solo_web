import { Router } from "express";
import * as MentoringSessionController from "../controllers/mentoring_session.controller";
import {
  createMentoringSessionSchema,
  getMentoringSessionsSchema,
  getMentoringSessionByIdSchema,
  updateMentoringSessionSchema,
  updateMentoringSessionStatusSchema,
  updateSessionMentorsSchema,
  deleteMentoringSessionSchema,
  paramsIdSchema,
  updateMentorSessionBodySchema,
  publicGetSessionsSchema,
  publicGetSessionByIdSchema,
} from "../validations/mentoring_session.validation";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorizeRole";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: MentoringSession
 *   description: Manajemen sesi mentoring
 */

/**
 * @swagger
 * /api/mentoringSession/admin/mentoring-sessions:
 *   post:
 *     summary: Buat sesi mentoring baru (admin)
 *     tags: [MentoringSession]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceId
 *               - date
 *               - startTime
 *               - endTime
 *               - durationMinutes
 *               - meetingLink
 *               - mentorProfileIds
 *             properties:
 *               serviceId:
 *                 type: string
 *                 example: "svc-abc123"
 *               date:
 *                 type: string
 *                 description: Tanggal dalam format dd-mm-yyyy (WIB)
 *                 example: "01-07-2025"
 *               startTime:
 *                 type: object
 *                 properties:
 *                   hour:
 *                     type: integer
 *                     example: 9
 *                   minute:
 *                     type: integer
 *                     example: 0
 *               endTime:
 *                 type: object
 *                 properties:
 *                   hour:
 *                     type: integer
 *                     example: 10
 *                   minute:
 *                     type: integer
 *                     example: 0
 *               durationMinutes:
 *                 type: integer
 *                 example: 60
 *               meetingLink:
 *                 type: string
 *                 example: "https://zoom.us/abc123"
 *               status:
 *                 type: string
 *                 enum: [scheduled, ongoing, completed, cancelled]
 *                 example: scheduled
 *               notes:
 *                 type: string
 *                 example: "Sesi pengantar dasar JavaScript"
 *               mentorProfileIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["mentor-001", "mentor-002"]
 *     responses:
 *       201:
 *         description: Sesi mentoring berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Sesi mentoring berhasil dibuat
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "Session-A1B2C3XYZ-svc-abc123"
 *                     serviceId:
 *                       type: string
 *                       example: "svc-abc123"
 *                     date:
 *                       type: string
 *                       example: "01-07-2025"
 *                     startTime:
 *                       type: string
 *                       example: "2025-07-01T02:00:00.000Z"
 *                     endTime:
 *                       type: string
 *                       example: "2025-07-01T03:00:00.000Z"
 *                     durationMinutes:
 *                       type: integer
 *                       example: 60
 *                     meetingLink:
 *                       type: string
 *                       example: "https://zoom.us/abc123"
 *                     status:
 *                       type: string
 *                       example: scheduled
 *                     notes:
 *                       type: string
 *                       example: "Sesi pengantar dasar JavaScript"
 *                     mentors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           mentorProfile:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "mentor-001"
 *                               expertise:
 *                                 type: string
 *                                 example: "Frontend Development"
 *       400:
 *         description: Bad request (misal input tidak valid atau mentor bentrok)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Terdapat mentor yang sedang bertugas di sesi lain
 *       401:
 *         description: Unauthorized (tidak login)
 *       403:
 *         description: Forbidden (bukan admin)
 *       500:
 *         description: Internal server error
 */
router.post(
  "/admin/mentoring-sessions",
  authenticate,
  authorizeRoles("admin"),
  validate(createMentoringSessionSchema),
  MentoringSessionController.createMentoringSessionController
);

/**
 * @swagger
 * /api/mentoringSession/admin/mentoring-sessions:
 *   get:
 *     summary: Ambil daftar sesi mentoring (admin)
 *     tags: [MentoringSession]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, ongoing, completed, cancelled]
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           example: "01-06-2025"
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           example: "30-06-2025"
 *       - in: query
 *         name: serviceId
 *         schema:
 *           type: string
 *       - in: query
 *         name: mentorProfileId
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           description: Cari berdasarkan notes atau meeting link
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [date, startTime, endTime, durationMinutes, createdAt]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Daftar sesi mentoring berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Berhasil mengambil daftar sesi mentoring
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "Session-XYZ123"
 *                       serviceId:
 *                         type: string
 *                       date:
 *                         type: string
 *                         example: "01-07-2025"
 *                       startTime:
 *                         type: string
 *                         example: "2025-07-01T02:00:00.000Z"
 *                       endTime:
 *                         type: string
 *                         example: "2025-07-01T03:00:00.000Z"
 *                       durationMinutes:
 *                         type: integer
 *                       meetingLink:
 *                         type: string
 *                       status:
 *                         type: string
 *                       notes:
 *                         type: string
 *                       mentoringService:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           serviceName:
 *                             type: string
 *                           description:
 *                             type: string
 *                           price:
 *                             type: number
 *                           serviceType:
 *                             type: string
 *                           maxParticipants:
 *                             type: integer
 *                           durationDays:
 *                             type: integer
 *                           isActive:
 *                             type: boolean
 *                       mentors:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             mentorProfile:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                 userId:
 *                                   type: string
 *                                 expertise:
 *                                   type: string
 *                                 hourlyRate:
 *                                   type: number
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       401:
 *         description: Unauthorized - belum login
 *       403:
 *         description: Forbidden - bukan admin
 *       500:
 *         description: Server error
 */
router.get(
  "/admin/mentoring-sessions",
  authenticate,
  authorizeRoles("admin"),
  validate(getMentoringSessionsSchema),
  MentoringSessionController.getMentoringSessionsController
);

/**
 * @swagger
 * /api/mentoringSession/admin/mentoring-sessions/{id}:
 *   get:
 *     summary: Ambil detail sesi mentoring (admin)
 *     tags: [MentoringSession]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detail sesi mentoring berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Berhasil mengambil detail sesi mentoring
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     date:
 *                       type: string
 *                       example: "01-07-2025"
 *                     startTime:
 *                       type: string
 *                       example: "2025-07-01T02:00:00.000Z"
 *                     endTime:
 *                       type: string
 *                     durationMinutes:
 *                       type: integer
 *                     meetingLink:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [scheduled, ongoing, completed, cancelled]
 *                     notes:
 *                       type: string
 *                     mentoringService:
 *                       type: object
 *                       properties:
 *                         id: { type: string }
 *                         serviceName: { type: string }
 *                         description: { type: string }
 *                         price: { type: number }
 *                         serviceType: { type: string }
 *                         maxParticipants: { type: integer }
 *                         durationDays: { type: integer }
 *                         isActive: { type: boolean }
 *                     mentors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           mentorProfile:
 *                             type: object
 *                             properties:
 *                               id: { type: string }
 *                               userId: { type: string }
 *                               expertise: { type: string }
 *                               bio: { type: string, nullable: true }
 *                               experience: { type: string, nullable: true }
 *                               availabilitySchedule: { type: string, nullable: true }
 *                               hourlyRate: { type: number }
 *                               isVerified: { type: boolean }
 *                               user:
 *                                 type: object
 *                                 properties:
 *                                   id: { type: string }
 *                                   fullName: { type: string }
 *                                   email: { type: string }
 *                     feedbacks:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id: { type: string }
 *                           rating: { type: number }
 *                           comment: { type: string }
 *                           submittedDate: { type: string }
 *                           user:
 *                             type: object
 *                             properties:
 *                               id: { type: string }
 *                               fullName: { type: string }
 *                               email: { type: string }
 *                     projectSubmissions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id: { type: string }
 *                           filePaths:
 *                             type: array
 *                             items: { type: string }
 *                           submissionDate: { type: string }
 *                           plagiarismScore: { type: number, nullable: true }
 *                           Score: { type: number, nullable: true }
 *                           user:
 *                             type: object
 *                             properties:
 *                               id: { type: string }
 *                               fullName: { type: string }
 *                               email: { type: string }
 *                           project:
 *                             type: object
 *                             properties:
 *                               id: { type: string }
 *                               title: { type: string }
 *                               description: { type: string }
 *                     additionalInfo:
 *                       type: object
 *                       properties:
 *                         feedbacksInfo: { type: string, nullable: true }
 *                         projectsInfo: { type: string, nullable: true }
 *       404:
 *         description: Sesi mentoring tidak ditemukan
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get(
  "/admin/mentoring-sessions/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(getMentoringSessionByIdSchema),
  MentoringSessionController.getMentoringSessionByIdController
);

/**
 * @swagger
 * /api/mentoringSession/admin/mentoring-sessions/{id}:
 *   patch:
 *     summary: Update sesi mentoring (admin)
 *     tags: [MentoringSession]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 description: Tanggal baru dalam format dd-mm-yyyy
 *                 example: "10-07-2025"
 *               startTime:
 *                 type: object
 *                 description: Jam mulai (WIB)
 *                 properties:
 *                   hour:
 *                     type: integer
 *                     example: 13
 *                   minute:
 *                     type: integer
 *                     example: 30
 *               endTime:
 *                 type: object
 *                 description: Jam selesai (WIB)
 *                 properties:
 *                   hour:
 *                     type: integer
 *                     example: 15
 *                   minute:
 *                     type: integer
 *                     example: 0
 *               meetingLink:
 *                 type: string
 *                 example: "https://zoom.us/example-link"
 *               notes:
 *                 type: string
 *                 example: "Link baru dan catatan tambahan"
 *     responses:
 *       200:
 *         description: Sesi mentoring berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Berhasil mengupdate sesi mentoring
 *                 data:
 *                   type: object
 *                   properties:
 *                     updated:
 *                       type: object
 *                       description: Data terbaru sesi mentoring
 *                     changedFields:
 *                       type: array
 *                       description: Field yang berubah
 *                       items:
 *                         type: string
 *       400:
 *         description: "Request tidak valid (misal: startTime lebih besar dari endTime)"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Sesi mentoring tidak ditemukan
 *       500:
 *         description: Server error
 */
router.patch(
  "/admin/mentoring-sessions/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(updateMentoringSessionSchema),
  MentoringSessionController.updateMentoringSessionController
);

/**
 * @swagger
 * /api/mentoringSession/admin/mentoring-sessions/{id}/status:
 *   patch:
 *     summary: Update status sesi mentoring (admin)
 *     tags: [MentoringSession]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [scheduled, ongoing, completed, cancelled]
 *                 example: completed
 *     responses:
 *       200:
 *         description: Status sesi berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Status sesi berhasil diperbarui
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: Session-XYZ123
 *                     status:
 *                       type: string
 *                       example: completed
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Status tidak valid
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Sesi mentoring tidak ditemukan
 *       500:
 *         description: Server error
 */
router.patch(
  "/admin/mentoring-sessions/:id/status",
  authenticate,
  authorizeRoles("admin"),
  validate(updateMentoringSessionStatusSchema),
  MentoringSessionController.updateStatusController
);

/**
 * @swagger
 * /api/mentoringSession/admin/mentoring-sessions/{id}/mentors:
 *   patch:
 *     summary: Update mentor dalam sesi mentoring (admin)
 *     tags: [MentoringSession]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mentorProfileIds
 *             properties:
 *               mentorProfileIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - 123e4567-e89b-12d3-a456-426614174000
 *                   - 123e4567-e89b-12d3-a456-426614174001
 *     responses:
 *       200:
 *         description: Mentor sesi mentoring berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Daftar mentor dalam sesi berhasil diperbarui
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessionId:
 *                       type: string
 *                       example: Session-ABC123
 *                     addedMentorIds:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example:
 *                         - 123e4567-e89b-12d3-a456-426614174000
 *                     removedMentorIds:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example:
 *                         - 123e4567-e89b-12d3-a456-426614174005
 *                     message:
 *                       type: object
 *                       properties:
 *                         added:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example:
 *                             - Mentor dengan ID 123e4567-e89b-12d3-a456-426614174000 telah ditambahkan ke sesi.
 *                         removed:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example:
 *                             - Mentor dengan ID 123e4567-e89b-12d3-a456-426614174005 telah dikeluarkan dari sesi.
 *       400:
 *         description: Beberapa mentor tidak valid atau belum diverifikasi
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Sesi mentoring tidak ditemukan
 *       500:
 *         description: Server error
 */
router.patch(
  "/admin/mentoring-sessions/:id/mentors",
  authenticate,
  authorizeRoles("admin"),
  validate(updateSessionMentorsSchema),
  MentoringSessionController.updateSessionMentorsController
);

/**
 * @swagger
 * /api/mentoringSession/admin/mentoring-sessions/{id}:
 *   delete:
 *     summary: Hapus sesi mentoring (admin)
 *     tags: [MentoringSession]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sesi mentoring berhasil dihapus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Sesi mentoring berhasil dihapus
 *       400:
 *         description: Validasi gagal (misalnya sesi sudah selesai, ada feedback, atau ada project submission)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Tidak bisa menghapus sesi yang memiliki feedback
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Sesi mentoring tidak ditemukan
 */
router.delete(
  "/admin/mentoring-sessions/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(deleteMentoringSessionSchema),
  MentoringSessionController.deleteSessionController
);

/**
 * @swagger
 * /api/mentoringSession/export/admin/mentoring-sessions:
 *   get:
 *     summary: Export sesi mentoring (admin)
 *     tags: [MentoringSession]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         required: false
 *         schema:
 *           type: string
 *           enum: [csv, xlsx]
 *         description: "Format file yang diekspor (default: xlsx)"
 *     responses:
 *       200:
 *         description: File export sesi mentoring tersedia
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Terjadi kesalahan saat proses ekspor data
 */
router.get(
  "/export/admin/mentoring-sessions",
  authenticate,
  authorizeRoles("admin"),
  MentoringSessionController.exportSessionsController
);

/**
 * @swagger
 * /api/mentoringSession/mentor/own-mentoring-sessions:
 *   get:
 *     summary: Ambil semua sesi mentoring milik mentor sendiri
 *     tags: [MentoringSession]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar sesi mentoring mentor berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   serviceName:
 *                     type: string
 *                   serviceType:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date
 *                   startTime:
 *                     type: string
 *                     format: date-time
 *                   endTime:
 *                     type: string
 *                     format: date-time
 *                   durationMinutes:
 *                     type: integer
 *                   meetingLink:
 *                     type: string
 *                   status:
 *                     type: string
 *                     enum: [scheduled, ongoing, completed, cancelled]
 *                   averageRating:
 *                     type: number
 *                     nullable: true
 *                   averageProjectScore:
 *                     type: number
 *                     nullable: true
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Akses ditolak (bukan mentor)
 *       500:
 *         description: Terjadi kesalahan saat mengambil sesi
 */
router.get(
  "/mentor/own-mentoring-sessions",
  authenticate,
  authorizeRoles("mentor"),
  MentoringSessionController.getMentorSessionsController
);

/**
 * @swagger
 * /api/mentoringSession/mentor/mentoring-sessions/{id}:
 *   get:
 *     summary: Detail sesi mentoring milik mentor (hanya bisa akses sesi miliknya)
 *     tags: [MentoringSession]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detail sesi mentoring berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 service:
 *                   type: object
 *                   properties:
 *                     serviceName:
 *                       type: string
 *                     description:
 *                       type: string
 *                     serviceType:
 *                       type: string
 *                     durationDays:
 *                       type: integer
 *                 date:
 *                   type: string
 *                   format: date
 *                 startTime:
 *                   type: string
 *                   format: date-time
 *                 endTime:
 *                   type: string
 *                   format: date-time
 *                 durationMinutes:
 *                   type: integer
 *                 meetingLink:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [scheduled, ongoing, completed, cancelled]
 *                 notes:
 *                   type: string
 *                   nullable: true
 *                 mentorList:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       mentorProfileId:
 *                         type: string
 *                       fullName:
 *                         type: string
 *                       profilePicture:
 *                         type: string
 *                         nullable: true
 *                 averageRating:
 *                   type: number
 *                   nullable: true
 *                 averageProjectScore:
 *                   type: number
 *                   nullable: true
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: ID sesi tidak valid
 *       403:
 *         description: Mentor tidak diizinkan atau tidak ditemukan
 *       404:
 *         description: Sesi tidak ditemukan atau bukan milik mentor
 *       500:
 *         description: Terjadi kesalahan pada server
 */
router.get(
  "/mentor/mentoring-sessions/:id",
  authenticate,
  authorizeRoles("mentor"),
  validate(paramsIdSchema),
  MentoringSessionController.getMentorSessionDetailController
);

/**
 * @swagger
 * /api/mentoringSession/mentor/mentoring-sessions/{id}:
 *   patch:
 *     summary: Update detail sesi mentoring (mentor)
 *     tags: [MentoringSession]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [scheduled, ongoing, completed, cancelled]
 *               meetingLink:
 *                 type: string
 *             example:
 *               status: "ongoing"
 *               meetingLink: "https://meet.example.com/sesi-abc123"
 *     responses:
 *       200:
 *         description: Sesi mentoring berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     status:
 *                       type: string
 *                     meetingLink:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Mentor atau sesi tidak valid
 *       403:
 *         description: Anda tidak tergabung dalam sesi ini
 *       429:
 *         description: Anda hanya bisa mengubah sesi ini maksimal 2 kali dalam 3 hari
 *       500:
 *         description: Terjadi kesalahan pada server
 */
router.patch(
  "/mentor/mentoring-sessions/:id",
  authenticate,
  authorizeRoles("mentor"),
  validate(paramsIdSchema),
  validate(updateMentorSessionBodySchema),
  MentoringSessionController.updateMentorSessionController
);

/**
 * @swagger
 * /api/mentoringSession/public/mentoring-services/{serviceId}/sessions:
 *   get:
 *     summary: Daftar sesi mentoring publik berdasarkan service
 *     tags: [MentoringSession]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [date, rating]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Daftar sesi mentoring publik berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date
 *                       startTime:
 *                         type: object
 *                         properties:
 *                           hour: { type: integer }
 *                           minute: { type: integer }
 *                       endTime:
 *                         type: object
 *                         properties:
 *                           hour: { type: integer }
 *                           minute: { type: integer }
 *                       durationMinutes:
 *                         type: integer
 *                       status:
 *                         type: string
 *                       mentors:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             mentorProfile:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                 user:
 *                                   type: object
 *                                   properties:
 *                                     fullName:
 *                                       type: string
 *                                     profilePicture:
 *                                       type: string
 *                       feedbacks:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             rating:
 *                               type: number
 *                             comment:
 *                               type: string
 *                             user:
 *                               type: object
 *                               properties:
 *                                 fullName:
 *                                   type: string
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
 *       400:
 *         description: Parameter tidak valid
 *       404:
 *         description: Mentoring service tidak ditemukan / tidak aktif
 *       500:
 *         description: Terjadi kesalahan di server
 */
router.get(
  "/public/mentoring-services/:serviceId/sessions",
  authenticate,
  validate(publicGetSessionsSchema),
  MentoringSessionController.publicMentoringSessionController
);

/**
 * @swagger
 * /api/mentoringSession/public/mentoring-sessions/{id}:
 *   get:
 *     summary: Detail sesi mentoring publik berdasarkan ID
 *     tags: [MentoringSession]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detail sesi mentoring publik berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     date:
 *                       type: string
 *                       format: date
 *                     startTime:
 *                       type: object
 *                       properties:
 *                         hour:
 *                           type: integer
 *                         minute:
 *                           type: integer
 *                     endTime:
 *                       type: object
 *                       properties:
 *                         hour:
 *                           type: integer
 *                         minute:
 *                           type: integer
 *                     durationMinutes:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [scheduled, ongoing]
 *                     notes:
 *                       type: string
 *                     mentoringService:
 *                       type: object
 *                       properties:
 *                         serviceName:
 *                           type: string
 *                         description:
 *                           type: string
 *                         serviceType:
 *                           type: string
 *                     mentors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           mentorProfile:
 *                             type: object
 *                             properties:
 *                               user:
 *                                 type: object
 *                                 properties:
 *                                   fullName:
 *                                     type: string
 *                               expertise:
 *                                 type: string
 *                     feedbacks:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           rating:
 *                             type: number
 *                           comment:
 *                             type: string
 *                           user:
 *                             type: object
 *                             properties:
 *                               fullName:
 *                                 type: string
 *       404:
 *         description: Sesi mentoring tidak ditemukan atau tidak tersedia untuk publik
 *       500:
 *         description: Terjadi kesalahan pada server
 */
router.get(
  "/public/mentoring-sessions/:id",
  authenticate,
  validate(publicGetSessionByIdSchema),
  MentoringSessionController.publicGetMentoringSessionByIdController
);

export default router;