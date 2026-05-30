import { Router } from "express";
import * as MentoringSessionController from "../controllers/mentoring_session.controller.js";
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
  exportMentoringSessionsSchema,
  getMentoringAvailabilitySchema,
} from "../validations/mentoring_session.validation.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRole.js";

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
 *               meetingId:
 *                 type: string
 *                 description: ID meeting dari platform video conference
 *                 example: "123-456-789"
 *               passcode:
 *                 type: string
 *                 description: Passcode meeting jika ada
 *                 example: "abc123"
 *               pptLink:
 *                 type: string
 *                 description: Link ke file PPT materi sesi (opsional)
 *                 example: "https://drive.google.com/file/d/abc123/view"
 *               recordingLink:
 *                 type: string
 *                 description: Link ke rekaman video sesi (opsional)
 *                 example: "https://youtube.com/watch?v=xyz987"
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
 *                     meetingId:
 *                       type: string
 *                       example: "123-456-789"
 *                     passcode:
 *                       type: string
 *                       example: "abc123"
 *                     pptLink:
 *                       type: string
 *                       example: "https://drive.google.com/file/d/abc123/view"
 *                     recordingLink:
 *                       type: string
 *                       example: "https://youtube.com/watch?v=xyz987"
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
  authorizeRoles("admin", "cm", "curdev"),
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
 *                       meetingId:
 *                         type: string
 *                         example: "123-456-789"
 *                       passcode:
 *                         type: string
 *                         example: "abc123"
 *                       pptLink:
 *                         type: string
 *                         example: "https://drive.google.com/file/d/abc123/view"
 *                       recordingLink:
 *                         type: string
 *                         example: "https://youtube.com/watch?v=xyz987"
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
  authorizeRoles("admin", "cm", "curdev"),
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
 *                       example: "Session-XYZ123"
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
 *                       example: "https://us05web.zoom.us/j/123456789"
 *                     pptLink:
 *                       type: string
 *                       nullable: true
 *                       example: "https://drive.google.com/file/d/abcd1234"
 *                     recordingLink:
 *                       type: string
 *                       nullable: true
 *                       example: "https://youtu.be/exampleRecording"
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
 *                           score: { type: number, nullable: true }
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
  authorizeRoles("admin", "cm", "curdev"),
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
 *                 properties:
 *                   hour:
 *                     type: integer
 *                     example: 13
 *                   minute:
 *                     type: integer
 *                     example: 30
 *               endTime:
 *                 type: object
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
 *               meetingId:
 *                 type: string
 *                 example: "123-456-789"
 *               passcode:
 *                 type: string
 *                 example: "abc123"
 *               pptLink:
 *                 type: string
 *                 example: "https://drive.google.com/example-ppt"
 *               recordingLink:
 *                 type: string
 *                 example: "https://zoom.us/rec/share/xxxx"
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
 *                       items:
 *                         type: string
 *       400:
 *         description: Request tidak valid
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
  authorizeRoles("admin", "cm", "curdev"),
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
  authorizeRoles("admin", "cm", "curdev"),
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
  authorizeRoles("admin", "cm", "curdev"),
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
  authorizeRoles("admin", "cm", "curdev"),
  validate(deleteMentoringSessionSchema),
  MentoringSessionController.deleteSessionController
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
 *                     example: "sess-abc123"
 *                   serviceId:
 *                     type: string
 *                     example: "srv-xyz789"
 *                   serviceName:
 *                     type: string
 *                     example: "Short Class: Data Analysis"
 *                   serviceType:
 *                     type: string
 *                     example: "shortclass"
 *                   date:
 *                     type: string
 *                     format: date
 *                     example: "2025-10-20"
 *                   startTime:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-10-20T09:00:00Z"
 *                   endTime:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-10-20T10:00:00Z"
 *                   durationMinutes:
 *                     type: integer
 *                     example: 60
 *                   meetingLink:
 *                     type: string
 *                     nullable: true
 *                     example: "https://us05web.zoom.us/j/88462726078?pwd=e0hArbEvWQZXhUFaT7cvjnM8hYHZ4M"
 *                   meetingId:
 *                     type: string
 *                     nullable: true
 *                     example: "88462726078"
 *                   passcode:
 *                     type: string
 *                     nullable: true
 *                     example: "12345"
 *                   pptLink:
 *                     type: string
 *                     nullable: true
 *                     description: Link ke file presentasi (PPT) sesi mentoring
 *                     example: "https://drive.google.com/file/d/abcd1234/view"
 *                   recordingLink:
 *                     type: string
 *                     nullable: true
 *                     description: Link ke rekaman video sesi mentoring
 *                     example: "https://drive.google.com/file/d/xyz987/view"
 *                   status:
 *                     type: string
 *                     enum: [scheduled, ongoing, completed, cancelled]
 *                     example: "completed"
 *                   averageRating:
 *                     type: number
 *                     nullable: true
 *                     example: 4.5
 *                   averageProjectScore:
 *                     type: number
 *                     nullable: true
 *                     example: 87.5
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-10-10T15:00:00Z"
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-10-15T18:00:00Z"
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
 *         description: ID sesi mentoring
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
 *                   example: "Session-abc123"
 *                 service:
 *                   type: object
 *                   properties:
 *                     serviceName:
 *                       type: string
 *                       example: "Bootcamp Web Development"
 *                     description:
 *                       type: string
 *                       example: "Pelatihan intensif selama 7 hari"
 *                     serviceType:
 *                       type: string
 *                       example: "bootcamp"
 *                     durationDays:
 *                       type: integer
 *                       example: 7
 *                     bookings:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "Booking-xyz987"
 *                           menteeId:
 *                             type: string
 *                             example: "User-567"
 *                           menteeName:
 *                             type: string
 *                             example: "Budi Santoso"
 *                           menteeEmail:
 *                             type: string
 *                             example: "budi@example.com"
 *                           bookingDate:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-10-20T09:00:00Z"
 *                           status:
 *                             type: string
 *                             example: "confirmed"
 *                           specialRequests:
 *                             type: string
 *                             nullable: true
 *                             example: "Ingin fokus pembahasan Next.js"
 *                           material:
 *                             type: string
 *                             nullable: true
 *                             example: "Frontend Architecture"
 *                           expectedOutput:
 *                             type: string
 *                             nullable: true
 *                             example: "Mampu membuat SPA sederhana"
 *                 date:
 *                   type: string
 *                   format: date
 *                   example: "2025-10-22"
 *                 startTime:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-10-22T08:00:00Z"
 *                 endTime:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-10-22T09:30:00Z"
 *                 durationMinutes:
 *                   type: integer
 *                   example: 90
 *                 meetingLink:
 *                   type: string
 *                   nullable: true
 *                   example: "https://us05web.zoom.us/j/88462726078?pwd=e0hArbEvWQZXhUFaT7cvjnM8hYHZ4M"
 *                 meetingId:
 *                   type: string
 *                   nullable: true
 *                   description: ID meeting dari platform video conference
 *                   example: "88462726078"
 *                 passcode:
 *                   type: string
 *                   nullable: true
 *                   description: Passcode meeting jika ada
 *                   example: "123456"
 *                 pptLink:
 *                   type: string
 *                   nullable: true
 *                   description: Link file presentasi sesi (PPT)
 *                   example: "https://drive.google.com/file/d/abcd123/view"
 *                 recordingLink:
 *                   type: string
 *                   nullable: true
 *                   description: Link rekaman sesi mentoring
 *                   example: "https://drive.google.com/file/d/xyz987/view"
 *                 status:
 *                   type: string
 *                   enum: [scheduled, ongoing, completed, cancelled]
 *                   example: "completed"
 *                 notes:
 *                   type: string
 *                   nullable: true
 *                   example: "Sesi berjalan lancar, mentee sangat aktif"
 *                 mentorList:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       mentorProfileId:
 *                         type: string
 *                         example: "MentorProfile-001"
 *                       fullName:
 *                         type: string
 *                         example: "Dimas Putra"
 *                       profilePicture:
 *                         type: string
 *                         nullable: true
 *                         example: "https://res.cloudinary.com/demo/image/upload/v123/avatar.png"
 *                 averageRating:
 *                   type: number
 *                   nullable: true
 *                   example: 4.7
 *                 averageProjectScore:
 *                   type: number
 *                   nullable: true
 *                   example: 88.5
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-10-01T10:00:00Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-10-15T15:30:00Z"
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
 *               meetingId:
 *                 type: string
 *               passcode:
 *                 type: string
 *               pptLink:
 *                 type: string
 *                 description: Tautan file presentasi (PPT)
 *               recordingLink:
 *                 type: string
 *                 description: Tautan rekaman video mentoring
 *             example:
 *               status: "completed"
 *               meetingLink: "https://meet.example.com/session-xyz"
 *               meetingId: "123-456-789"
 *               passcode: "abc123"
 *               pptLink: "https://drive.google.com/ppt-example"
 *               recordingLink: "https://drive.google.com/recording-example"
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
 *                     meetingId:
 *                       type: string
 *                     passcode:
 *                       type: string
 *                     pptLink:
 *                       type: string
 *                     recordingLink:
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
 *                       pptLink:
 *                         type: string
 *                         nullable: true
 *                         description: Tautan file presentasi (PPT)
 *                       recordingLink:
 *                         type: string
 *                         nullable: true
 *                         description: Tautan rekaman video mentoring
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
 *                     pptLink:                # ✅ Tambahan baru
 *                       type: string
 *                       nullable: true
 *                       description: "Tautan file PPT sesi mentoring"
 *                     recordingLink:          # ✅ Tambahan baru
 *                       type: string
 *                       nullable: true
 *                       description: "Tautan rekaman video sesi mentoring"
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

/**
 * @swagger
 * /api/mentoringSession/admin/export:
 *   get:
 *     summary: Export semua sesi mentoring (admin) ke CSV atau XLSX
 *     tags: [MentoringSession]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, xlsx]
 *           default: xlsx
 *         description: Format file export
 *     responses:
 *       200:
 *         description: File export berhasil diunduh
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Bad request - format tidak valid
 *       401:
 *         description: Unauthorized - belum login
 *       403:
 *         description: Forbidden - bukan admin
 *       500:
 *         description: Server error
 */
router.get(
  "/admin/export",
  authenticate,
  authorizeRoles("admin", "cm", "curdev"),
  validate(exportMentoringSessionsSchema),
  MentoringSessionController.exportSessionsController
);

/**
 * @swagger
 * /api/mentoringSession/public/availability:
 *   get:
 *     summary: Cek slot mentoring yang sudah dibooking
 *     tags: [MentoringSession]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: mentorId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID mentor profile
 *
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Format YYYY-MM-DD
 *
 *     responses:
 *       200:
 *         description: Berhasil mengambil slot yang sudah dibooking
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     bookedSlots:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           mentoringSessionId:
 *                             type: string
 *                           time:
 *                             type: string
 *                             example: "19.00 - 20.00"
 *                           startTime:
 *                             type: string
 *                           endTime:
 *                             type: string
 *                           status:
 *                             type: string
 *                           serviceType:
 *                             type: string
 *
 *       400:
 *         description: Validation error
 *
 *       404:
 *         description: Mentor tidak ditemukan
 *
 *       500:
 *         description: Internal server error
 */
router.get(
  "/public/availability",
  authenticate,
  validate(getMentoringAvailabilitySchema),
  MentoringSessionController.getMentoringAvailabilityController
);

export default router;
