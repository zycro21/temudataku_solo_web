import { Router } from "express";
import * as MentorServiceController from "../controllers/mentor_service.controller";
import {
  createMentoringServiceSchema,
  getAllMentoringServicesSchema,
  getMentoringServiceDetailSchema,
  updateMentoringServiceSchema,
  deleteMentoringServiceSchema,
  exportMentoringServicesSchema,
  getMentoringServiceDetailValidatorSchema,
  PublicMentoringServiceQuery,
  PublicMentoringServiceIdParamSchema,
} from "../validations/mentor_service.validation";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorizeRole";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: MentorService
 *   description: Manajemen layanan mentoring
 */

/**
 * @swagger
 * /api/mentorService/mentoring-services:
 *   post:
 *     summary: Buat layanan mentoring (admin)
 *     tags: [MentorService]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceName
 *               - price
 *               - serviceType
 *               - durationDays
 *               - mentorProfileIds
 *             properties:
 *               serviceName:
 *                 type: string
 *                 example: Dasar UI/UX Design
 *               description:
 *                 type: string
 *                 nullable: true
 *                 example: Belajar dasar-dasar UI/UX selama 2 minggu
 *               price:
 *                 type: number
 *                 example: 150000
 *               serviceType:
 *                 type: string
 *                 enum: [one-on-one, group, bootcamp, shortclass, live class]
 *                 example: bootcamp
 *               maxParticipants:
 *                 type: integer
 *                 nullable: true
 *                 example: 30
 *               durationDays:
 *                 type: integer
 *                 example: 14
 *               mentorProfileIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["mentor-123", "mentor-456"]
 *               benefits:
 *                 type: string
 *                 nullable: true
 *                 example: Sertifikat, portofolio, bimbingan langsung
 *               mechanism:
 *                 type: string
 *                 nullable: true
 *                 example: Zoom meeting setiap hari pukul 19.00
 *               syllabusPath:
 *                 type: string
 *                 nullable: true
 *                 example: uploads/syllabus/design_basic.pdf
 *               toolsUsed:
 *                 type: string
 *                 nullable: true
 *                 example: Figma, Miro, Notion
 *               targetAudience:
 *                 type: string
 *                 nullable: true
 *                 example: Mahasiswa, fresh graduate
 *               schedule:
 *                 type: string
 *                 nullable: true
 *                 example: Senin - Jumat, pukul 19.00 - 21.00
 *               alumniPortfolio:
 *                 type: string
 *                 nullable: true
 *                 example: www.behance.net/portofolio-alumni
 *     responses:
 *       201:
 *         description: Layanan mentoring berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Mentoring service created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: bootcamp-000012
 *                     serviceName:
 *                       type: string
 *                     description:
 *                       type: string
 *                       nullable: true
 *                     price:
 *                       type: number
 *                     serviceType:
 *                       type: string
 *                     durationDays:
 *                       type: integer
 *                     maxParticipants:
 *                       type: integer
 *                       nullable: true
 *                     mentors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           mentorProfileId:
 *                             type: string
 *       400:
 *         description: Data tidak valid atau duplikat service
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Mentoring service with this name and type already exists.
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Hanya admin yang dapat membuat layanan mentoring
 *       500:
 *         description: Server error
 */
router.post(
  "/mentoring-services",
  authenticate,
  authorizeRoles("admin"),
  validate(createMentoringServiceSchema),
  MentorServiceController.createMentoringServiceController
);

/**
 * @swagger
 * /api/mentorService/admin/mentoring-services:
 *   get:
 *     summary: List semua layanan mentoring (admin)
 *     tags: [MentorService]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: UI/UX
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           example: serviceName
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           example: desc
 *     responses:
 *       200:
 *         description: Daftar layanan mentoring berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Mentoring services retrieved successfully
 *                 total:
 *                   type: integer
 *                   example: 42
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: bootcamp-000012
 *                       serviceName:
 *                         type: string
 *                         example: Dasar UI/UX
 *                       serviceType:
 *                         type: string
 *                         example: bootcamp
 *                       price:
 *                         type: number
 *                         example: 150000
 *                       maxParticipants:
 *                         type: integer
 *                         example: 30
 *                       durationDays:
 *                         type: integer
 *                         example: 14
 *                       mentors:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             mentorProfileId:
 *                               type: string
 *                               example: mnt-123
 *                             userId:
 *                               type: string
 *                               example: usr-789
 *                             fullName:
 *                               type: string
 *                               example: Budi Santoso
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Hanya admin yang boleh mengakses
 *       500:
 *         description: Internal server error
 */
router.get(
  "/admin/mentoring-services",
  authenticate,
  authorizeRoles("admin"),
  validate(getAllMentoringServicesSchema),
  MentorServiceController.getAllMentoringServicesController
);

/**
 * @swagger
 * /api/mentorService/admin/mentoring-services/{id}:
 *   get:
 *     summary: Detail layanan mentoring (admin)
 *     tags: [MentorService]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: bootcamp-000012
 *     responses:
 *       200:
 *         description: Detail layanan mentoring berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Mentoring service detail retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: bootcamp-000012
 *                     serviceName:
 *                       type: string
 *                       example: UI/UX Bootcamp
 *                     description:
 *                       type: string
 *                       example: Program intensif selama 2 minggu
 *                     price:
 *                       type: number
 *                       example: 250000
 *                     serviceType:
 *                       type: string
 *                       example: bootcamp
 *                     maxParticipants:
 *                       type: integer
 *                       example: 20
 *                     durationDays:
 *                       type: integer
 *                       example: 14
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     benefits:
 *                       type: string
 *                       example: Sertifikat, portfolio
 *                     mechanism:
 *                       type: string
 *                       example: Zoom meeting + platform LMS
 *                     syllabusPath:
 *                       type: string
 *                       example: /syllabus/uiux-bootcamp.pdf
 *                     toolsUsed:
 *                       type: string
 *                       example: Figma, Zoom, Miro
 *                     targetAudience:
 *                       type: string
 *                       example: Mahasiswa, entry-level designer
 *                     schedule:
 *                       type: string
 *                       example: Setiap Senin - Jumat, 19.00 - 21.00 WIB
 *                     alumniPortfolio:
 *                       type: string
 *                       example: https://contoh.com/portfolio-alumni
 *                     totalBookings:
 *                       type: integer
 *                       example: 12
 *                     remainingSlots:
 *                       type: integer
 *                       example: 8
 *                     mentors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           mentorProfileId:
 *                             type: string
 *                           expertise:
 *                             type: string
 *                           isVerified:
 *                             type: boolean
 *                           hourlyRate:
 *                             type: number
 *                           availabilitySchedule:
 *                             type: string
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               fullName:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                               profilePicture:
 *                                 type: string
 *                     sessions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           sessionDate:
 *                             type: string
 *                             format: date-time
 *                           endTime:
 *                             type: string
 *                             format: date-time
 *                           durationMinutes:
 *                             type: integer
 *                           status:
 *                             type: string
 *                           notes:
 *                             type: string
 *                     certificates:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           filePath:
 *                             type: string
 *                           issuedDate:
 *                             type: string
 *                             format: date
 *                     bookings:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           menteeId:
 *                             type: string
 *                           status:
 *                             type: string
 *                             example: confirmed
 *                           bookingDate:
 *                             type: string
 *                             format: date
 *                           specialRequests:
 *                             type: string
 *                           mentee:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               fullName:
 *                                 type: string
 *                               email:
 *                                 type: string
 *       400:
 *         description: Invalid service ID
 *       404:
 *         description: Mentoring service not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/admin/mentoring-services/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(getMentoringServiceDetailSchema),
  MentorServiceController.getMentoringServiceDetailController
);

/**
 * @swagger
 * /api/mentorService/admin/mentoring-services/{id}:
 *   patch:
 *     summary: Update layanan mentoring (admin)
 *     tags: [MentorService]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: bootcamp-000005
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               serviceName:
 *                 type: string
 *                 example: UI/UX Bootcamp
 *               description:
 *                 type: string
 *                 example: Program intensif untuk belajar UI/UX
 *               price:
 *                 type: number
 *                 example: 250000
 *               maxParticipants:
 *                 type: number
 *                 example: 25
 *               durationDays:
 *                 type: number
 *                 example: 14
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               mentorProfileIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["mentor-01", "mentor-02"]
 *               benefits:
 *                 type: string
 *                 example: Sertifikat, portfolio
 *               mechanism:
 *                 type: string
 *                 example: Zoom + LMS
 *               syllabusPath:
 *                 type: string
 *                 example: /path/to/syllabus.pdf
 *               toolsUsed:
 *                 type: string
 *                 example: Figma, Miro, Zoom
 *               targetAudience:
 *                 type: string
 *                 example: Mahasiswa, profesional muda
 *               schedule:
 *                 type: string
 *                 example: Senin - Jumat, 19.00 - 21.00 WIB
 *               alumniPortfolio:
 *                 type: string
 *                 example: https://contoh.com/portfolio-alumni
 *     responses:
 *       200:
 *         description: Layanan mentoring berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Mentoring service updated successfully
 *                 updatedFields:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["serviceName", "price", "mentorProfileIds"]
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     serviceName:
 *                       type: string
 *                     description:
 *                       type: string
 *                     price:
 *                       type: number
 *                     maxParticipants:
 *                       type: number
 *                     durationDays:
 *                       type: number
 *                     isActive:
 *                       type: boolean
 *                     benefits:
 *                       type: string
 *                     mechanism:
 *                       type: string
 *                     syllabusPath:
 *                       type: string
 *                     toolsUsed:
 *                       type: string
 *                     targetAudience:
 *                       type: string
 *                     schedule:
 *                       type: string
 *                     alumniPortfolio:
 *                       type: string
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
 *                               expertise:
 *                                 type: string
 *                               user:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: string
 *                                   fullName:
 *                                     type: string
 *                                   email:
 *                                     type: string
 *                                   profilePicture:
 *                                     type: string
 *                     certificates:
 *                       type: array
 *                       items:
 *                         type: object
 *                     mentoringSessions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           startTime:
 *                             type: string
 *                           endTime:
 *                             type: string
 *                           durationMinutes:
 *                             type: number
 *                           status:
 *                             type: string
 *                           notes:
 *                             type: string
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Mentoring service not found
 *       500:
 *         description: Internal server error
 */
router.patch(
  "/admin/mentoring-services/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(updateMentoringServiceSchema),
  MentorServiceController.updateMentoringServiceController
);

/**
 * @swagger
 * /api/mentorService/admin/mentoring-services/{id}:
 *   delete:
 *     summary: Hapus layanan mentoring (admin)
 *     tags: [MentorService]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: bootcamp-000005
 *     responses:
 *       200:
 *         description: Layanan mentoring berhasil dihapus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Mentoring service deleted successfully
 *       400:
 *         description: Gagal menghapus layanan karena masih memiliki sesi aktif
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cannot delete service with scheduled or ongoing sessions
 *       404:
 *         description: Mentoring service tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Mentoring service not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/admin/mentoring-services/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(deleteMentoringServiceSchema),
  MentorServiceController.deleteMentoringServiceController
);

/**
 * @swagger
 * /api/mentorService/mentoring-services/export:
 *   get:
 *     summary: Export layanan mentoring (admin)
 *     tags: [MentorService]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: format
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           enum: [csv, excel]
 *         example: csv
 *     responses:
 *       200:
 *         description: File export berhasil dikirim
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Format tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid format. Use 'csv' or 'excel'
 *       500:
 *         description: Server error
 */
router.get(
  "/mentoring-services/export",
  authenticate,
  authorizeRoles("admin"),
  validate(exportMentoringServicesSchema),
  MentorServiceController.exportMentoringServicesController
);

/**
 * @swagger
 * /api/mentorService/mentor/mentoring-services:
 *   get:
 *     summary: List layanan mentoring milik mentor
 *     tags: [MentorService]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar layanan mentoring mentor berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       serviceName:
 *                         type: string
 *                       description:
 *                         type: string
 *                         nullable: true
 *                       price:
 *                         type: number
 *                       serviceType:
 *                         type: string
 *                         nullable: true
 *                       maxParticipants:
 *                         type: integer
 *                         nullable: true
 *                       durationDays:
 *                         type: integer
 *                         nullable: true
 *                       benefits:
 *                         type: string
 *                         nullable: true
 *                       mechanism:
 *                         type: string
 *                         nullable: true
 *                       syllabusPath:
 *                         type: string
 *                         nullable: true
 *                       toolsUsed:
 *                         type: string
 *                         nullable: true
 *                       targetAudience:
 *                         type: string
 *                         nullable: true
 *                       schedule:
 *                         type: string
 *                         nullable: true
 *                       alumniPortfolio:
 *                         type: string
 *                         nullable: true
 *                       isActive:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       mentors:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             mentorProfileId:
 *                               type: string
 *                             expertise:
 *                               type: string
 *                               nullable: true
 *                             isVerified:
 *                               type: boolean
 *                             hourlyRate:
 *                               type: number
 *                               nullable: true
 *                             availabilitySchedule:
 *                               type: string
 *                               nullable: true
 *                             user:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                 fullName:
 *                                   type: string
 *                                 email:
 *                                   type: string
 *                                 profilePicture:
 *                                   type: string
 *                                   nullable: true
 *       400:
 *         description: Mentor ID tidak ditemukan di token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Mentor ID not found in the request
 *       500:
 *         description: Server error
 */
router.get(
  "/mentor/mentoring-services",
  authenticate,
  authorizeRoles("mentor"),
  MentorServiceController.getMentoringServicesByMentorController
);

/**
 * @swagger
 * /api/mentorService/mentor/mentoring-services/{id}:
 *   get:
 *     summary: Detail layanan mentoring milik mentor
 *     tags: [MentorService]
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
 *         description: Detail layanan mentoring berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     serviceName:
 *                       type: string
 *                     description:
 *                       type: string
 *                       nullable: true
 *                     price:
 *                       type: number
 *                     serviceType:
 *                       type: string
 *                     maxParticipants:
 *                       type: integer
 *                       nullable: true
 *                     durationDays:
 *                       type: integer
 *                       nullable: true
 *                     benefits:
 *                       type: string
 *                       nullable: true
 *                     mechanism:
 *                       type: string
 *                       nullable: true
 *                     syllabusPath:
 *                       type: string
 *                       nullable: true
 *                     toolsUsed:
 *                       type: string
 *                       nullable: true
 *                     targetAudience:
 *                       type: string
 *                       nullable: true
 *                     schedule:
 *                       type: string
 *                       nullable: true
 *                     alumniPortfolio:
 *                       type: string
 *                       nullable: true
 *                     isActive:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     mentors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           mentorProfileId:
 *                             type: string
 *                           expertise:
 *                             type: string
 *                             nullable: true
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               fullName:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                               profilePicture:
 *                                 type: string
 *                                 nullable: true
 *                     sessions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           sessionDate:
 *                             type: string
 *                             format: date-time
 *                           endTime:
 *                             type: string
 *                             format: date-time
 *                           durationMinutes:
 *                             type: number
 *                           status:
 *                             type: string
 *                           notes:
 *                             type: string
 *                             nullable: true
 *       404:
 *         description: Service tidak ditemukan atau bukan milik mentor yang login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Service not found or you are not authorized to view it.
 *       500:
 *         description: Server error
 */
router.get(
  "/mentor/mentoring-services/:id",
  authenticate,
  authorizeRoles("mentor"),
  validate(getMentoringServiceDetailValidatorSchema),
  MentorServiceController.getMentoringServiceDetailForMentorController
);

/**
 * @swagger
 * /api/mentorService/public-mentoring-services:
 *   get:
 *     summary: List layanan mentoring publik
 *     tags: [MentorService]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Halaman saat ini (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Jumlah item per halaman (default 10)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Cari berdasarkan nama layanan
 *       - in: query
 *         name: expertise
 *         schema:
 *           type: string
 *         description: Filter berdasarkan keahlian mentor
 *     responses:
 *       200:
 *         description: Daftar layanan mentoring publik berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: string }
 *                       serviceName: { type: string }
 *                       description: { type: string, nullable: true }
 *                       price: { type: number }
 *                       serviceType: { type: string }
 *                       maxParticipants: { type: integer, nullable: true }
 *                       durationDays: { type: integer, nullable: true }
 *                       benefits: { type: string, nullable: true }
 *                       mechanism: { type: string, nullable: true }
 *                       syllabusPath: { type: string, nullable: true }
 *                       toolsUsed: { type: string, nullable: true }
 *                       targetAudience: { type: string, nullable: true }
 *                       schedule: { type: string, nullable: true }
 *                       alumniPortfolio: { type: string, nullable: true }
 *                       mentors:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             mentorProfileId: { type: string }
 *                             expertise: { type: string, nullable: true }
 *                             user:
 *                               type: object
 *                               properties:
 *                                 id: { type: string }
 *                                 fullName: { type: string }
 *                                 profilePicture: { type: string, nullable: true }
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalData: { type: integer }
 *                     totalPage: { type: integer }
 *                     currentPage: { type: integer }
 *       500:
 *         description: Internal server error
 */
router.get(
  "/public-mentoring-services",
  validate(PublicMentoringServiceQuery),
  MentorServiceController.getPublicMentoringServicesController
);

/**
 * @swagger
 * /api/mentorService/public-mentoring-services/{id}:
 *   get:
 *     summary: Detail layanan mentoring publik
 *     tags: [MentorService]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID layanan mentoring
 *     responses:
 *       200:
 *         description: Detail layanan mentoring publik berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     serviceName: { type: string }
 *                     description: { type: string, nullable: true }
 *                     price: { type: number }
 *                     serviceType: { type: string }
 *                     maxParticipants: { type: integer, nullable: true }
 *                     durationDays: { type: integer, nullable: true }
 *                     benefits: { type: string, nullable: true }
 *                     mechanism: { type: string, nullable: true }
 *                     syllabusPath: { type: string, nullable: true }
 *                     toolsUsed: { type: string, nullable: true }
 *                     targetAudience: { type: string, nullable: true }
 *                     schedule: { type: string, nullable: true }
 *                     alumniPortfolio: { type: string, nullable: true }
 *                     mentors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           mentorProfileId: { type: string }
 *                           expertise: { type: string, nullable: true }
 *                           bio: { type: string, nullable: true }
 *                           experience: { type: string, nullable: true }
 *                           availabilitySchedule: { type: string, nullable: true }
 *                           hourlyRate: { type: number, nullable: true }
 *                           user:
 *                             type: object
 *                             properties:
 *                               id: { type: string }
 *                               fullName: { type: string }
 *                               profilePicture: { type: string, nullable: true }
 *                               city: { type: string, nullable: true }
 *                               province: { type: string, nullable: true }
 *       404:
 *         description: Layanan tidak ditemukan atau tidak tersedia
 *       500:
 *         description: Terjadi kesalahan di server
 */
router.get(
  "/public-mentoring-services/:id",
  validate(PublicMentoringServiceIdParamSchema),
  MentorServiceController.getPublicMentoringServiceDetailController
);

export default router;