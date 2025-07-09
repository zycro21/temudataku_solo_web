import { Router } from "express";
import * as MentorController from "../controllers/mentor.controller";
import {
  createMentorProfileSchema,
  updateMentorProfileSchema,
  getMentorProfilesSchema,
  verifyMentorProfileSchema,
  getPublicMentorsSchema,
  getMentorProfileByIdSchema,
  getPublicMentorProfileByIdSchema,
  deleteMentorProfileSchema,
} from "../validations/mentor.validation";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorizeRole";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Mentor
 *   description: Manajemen profil mentor
 */

/**
 * @swagger
 * /api/mentor/mentor/profile:
 *   post:
 *     summary: Create profil mentor (admin/mentor)
 *     tags: [Mentor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID user (hanya wajib diisi oleh admin)
 *               expertise:
 *                 type: string
 *               bio:
 *                 type: string
 *               experience:
 *                 type: string
 *               availabilitySchedule:
 *                 type: object
 *                 additionalProperties: true
 *               hourlyRate:
 *                 type: number
 *             example:
 *               userId: "user-123"  # Hanya untuk admin
 *               expertise: "Software Engineering"
 *               bio: "Experienced backend developer"
 *               experience: "5 years working at tech companies"
 *               availabilitySchedule: { monday: ["10:00-12:00"], tuesday: [] }
 *               hourlyRate: 150000
 *     responses:
 *       201:
 *         description: Profil mentor berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     userId: { type: string }
 *                     expertise: { type: string }
 *                     bio: { type: string }
 *                     experience: { type: string }
 *                     availabilitySchedule:
 *                       type: object
 *                       additionalProperties: true
 *                     hourlyRate: { type: number }
 *       400:
 *         description: Permintaan tidak valid (validasi gagal / user tidak ditemukan / profile sudah ada)
 *       403:
 *         description: Role tidak berhak atau mencoba membuat profil untuk user lain
 *       500:
 *         description: Terjadi kesalahan di server
 */
router.post(
  "/mentor/profile",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(createMentorProfileSchema),
  MentorController.createMentorProfile
);

/**
 * @swagger
 * /api/mentor/ownProfile:
 *   get:
 *     summary: Ambil profil mentor sendiri
 *     tags: [Mentor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil mentor berhasil diambil
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
 *                     userId:
 *                       type: string
 *                     expertise:
 *                       type: string
 *                     bio:
 *                       type: string
 *                     experience:
 *                       type: string
 *                     availabilitySchedule:
 *                       type: object
 *                       additionalProperties: true
 *                     hourlyRate:
 *                       type: number
 *                     user:
 *                       type: object
 *                       properties:
 *                         id: { type: string }
 *                         fullName: { type: string }
 *                         email: { type: string }
 *                         phoneNumber: { type: string }
 *                         profilePicture: { type: string }
 *                         city: { type: string }
 *                         province: { type: string }
 *       403:
 *         description: Role bukan mentor
 *       404:
 *         description: Profil tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan server
 */
router.get(
  "/ownProfile",
  authenticate,
  authorizeRoles("mentor"),
  MentorController.getOwnMentorProfile
);

/**
 * @swagger
 * /api/mentor/profile:
 *   patch:
 *     summary: Update profil mentor
 *     tags: [Mentor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: false
 *         schema:
 *           type: string
 *         description: ID user yang ingin diperbarui (hanya untuk admin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expertise:
 *                 type: string
 *               bio:
 *                 type: string
 *               experience:
 *                 type: string
 *               availabilitySchedule:
 *                 type: object
 *                 additionalProperties: true
 *               hourlyRate:
 *                 type: number
 *     responses:
 *       200:
 *         description: Profil mentor berhasil diperbarui
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
 *                     id: { type: string }
 *                     userId: { type: string }
 *                     expertise: { type: string }
 *                     bio: { type: string }
 *                     experience: { type: string }
 *                     availabilitySchedule: { type: object }
 *                     hourlyRate: { type: number }
 *                     createdAt: { type: string, format: date-time }
 *                     updatedAt: { type: string, format: date-time }
 *       400:
 *         description: Permintaan tidak valid (user tidak ditemukan, bukan mentor, dsb.)
 *       403:
 *         description: Tidak boleh mengubah profil mentor lain
 */
router.patch(
  "/profile",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(updateMentorProfileSchema),
  MentorController.updateMentorProfile
);

/**
 * @swagger
 * /api/mentor/admin/mentor-profiles:
 *   get:
 *     summary: List semua profil mentor (admin)
 *     tags: [Mentor]
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
 *         name: isVerified
 *         schema:
 *           type: boolean
 *           example: true
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *           example: "Budi"
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           example: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           example: desc
 *     responses:
 *       200:
 *         description: Daftar profil mentor diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 30
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "Mentor-123456"
 *                       userId:
 *                         type: string
 *                         example: "123456"
 *                       expertise:
 *                         type: string
 *                         example: "Web Development"
 *                       bio:
 *                         type: string
 *                         example: "Experienced mentor in frontend development"
 *                       experience:
 *                         type: string
 *                         example: "5 years at various startups"
 *                       availabilitySchedule:
 *                         type: object
 *                         example: { monday: "10:00-14:00", friday: "09:00-12:00" }
 *                       hourlyRate:
 *                         type: number
 *                         example: 150000
 *                       isVerified:
 *                         type: boolean
 *                         example: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-05-01T10:00:00.000Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-06-01T12:00:00.000Z"
 *                       user:
 *                         type: object
 *                         properties:
 *                           id: { type: string, example: "123456" }
 *                           fullName: { type: string, example: "Budi Santoso" }
 *                           email: { type: string, example: "budi@gmail.com" }
 *                           profilePicture: { type: string, example: "https://cdn.example.com/budi.jpg" }
 *                           city: { type: string, example: "Jakarta" }
 *                           province: { type: string, example: "DKI Jakarta" }
 *                           isEmailVerified: { type: boolean, example: true }
 *                           userRoles:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 role:
 *                                   type: object
 *                                   properties:
 *                                     roleName:
 *                                       type: string
 *                                       example: "mentor"
 *       403:
 *         description: Hanya admin yang dapat mengakses endpoint ini
 */
router.get(
  "/admin/mentor-profiles",
  authenticate,
  authorizeRoles("admin"),
  validate(getMentorProfilesSchema),
  MentorController.getAllMentorProfiles
);

/**
 * @swagger
 * /api/mentor/admin/mentor-profiles/{id}/verify:
 *   patch:
 *     summary: Verifikasi atau batalkan verifikasi profil mentor (admin only)
 *     tags: [Mentor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID dari user (bukan mentorProfileId)
 *         schema:
 *           type: string
 *           example: "123456"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isVerified
 *             properties:
 *               isVerified:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Profil mentor berhasil diverifikasi atau dibatalkan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Mentor profile verified successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "Mentor-123456"
 *                     userId:
 *                       type: string
 *                       example: "123456"
 *                     isVerified:
 *                       type: boolean
 *                       example: true
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-07-01T10:00:00.000Z"
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "123456"
 *                         fullName:
 *                           type: string
 *                           example: "Budi Santoso"
 *                         email:
 *                           type: string
 *                           example: "budi@example.com"
 *       400:
 *         description: Permintaan tidak valid atau status sudah sama
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Mentor profile is already verified
 *       404:
 *         description: Profil mentor tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Mentor profile not found
 */
router.patch(
  "/admin/mentor-profiles/:id/verify",
  authenticate,
  authorizeRoles("admin"),
  validate(verifyMentorProfileSchema),
  MentorController.verifyMentorProfile
);

/**
 * @swagger
 * /api/mentor/mentors:
 *   get:
 *     summary: List profil mentor publik (terverifikasi)
 *     tags: [Mentor]
 *     security: []
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
 *           example: "Fitrah"
 *       - in: query
 *         name: province
 *         schema:
 *           type: string
 *           example: "DKI Jakarta"
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *           example: "Jakarta Selatan"
 *       - in: query
 *         name: expertise
 *         schema:
 *           type: string
 *           example: "UI/UX Design"
 *       - in: query
 *         name: availabilityDay
 *         schema:
 *           type: string
 *           example: "saturday"
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [fullName, registrationDate, hourlyRate]
 *           example: "hourlyRate"
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           example: "desc"
 *     responses:
 *       200:
 *         description: Mentor publik berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Verified mentors retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 45
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                     mentors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "Mentor-123"
 *                           expertise:
 *                             type: string
 *                             example: "Back-End Developer"
 *                           bio:
 *                             type: string
 *                             example: "Experienced backend engineer with 5 years experience"
 *                           experience:
 *                             type: string
 *                             example: "5 years in Node.js & Golang"
 *                           hourlyRate:
 *                             type: number
 *                             example: 150000
 *                           availabilitySchedule:
 *                             type: object
 *                             example:
 *                               monday: "09:00-12:00"
 *                               saturday: "10:00-14:00"
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "user-abc123"
 *                               fullName:
 *                                 type: string
 *                                 example: "Fitrah Pradipta"
 *                               profilePicture:
 *                                 type: string
 *                                 example: "https://example.com/pic.jpg"
 *                               city:
 *                                 type: string
 *                                 example: "Bandung"
 *                               province:
 *                                 type: string
 *                                 example: "Jawa Barat"
 *                               registrationDate:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2024-12-31T08:00:00.000Z"
 */
router.get(
  "/mentors",
  validate(getPublicMentorsSchema),
  MentorController.getPublicMentors
);

/**
 * @swagger
 * /api/mentor/admin/mentor-profiles/{id}:
 *   get:
 *     summary: Detail profil mentor (admin only)
 *     tags: [Mentor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "mentor-abc123"
 *     responses:
 *       200:
 *         description: Detail profil mentor berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Mentor profile retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "mentor-abc123"
 *                     expertise:
 *                       type: string
 *                       example: "Data Science"
 *                     bio:
 *                       type: string
 *                       example: "I have 7+ years of experience in AI/ML"
 *                     experience:
 *                       type: string
 *                       example: "Worked at Google and Meta as Senior ML Engineer"
 *                     hourlyRate:
 *                       type: number
 *                       example: 200000
 *                     availabilitySchedule:
 *                       type: object
 *                       example:
 *                         monday: "09:00-12:00"
 *                         friday: "14:00-17:00"
 *                     isVerified:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-05-15T10:00:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-06-01T12:00:00.000Z"
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "user-123"
 *                         email:
 *                           type: string
 *                           example: "mentor@gmail.com"
 *                         fullName:
 *                           type: string
 *                           example: "Siti Aisyah"
 *                         phoneNumber:
 *                           type: string
 *                           example: "08123456789"
 *                         profilePicture:
 *                           type: string
 *                           example: "https://example.com/images/profile.jpg"
 *                         city:
 *                           type: string
 *                           example: "Bandung"
 *                         province:
 *                           type: string
 *                           example: "Jawa Barat"
 *                         registrationDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-01-01T08:00:00.000Z"
 *                         lastLogin:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-06-28T15:30:00.000Z"
 *                         isEmailVerified:
 *                           type: boolean
 *                           example: true
 *                         isActive:
 *                           type: boolean
 *                           example: true
 *                         roles:
 *                           type: array
 *                           items:
 *                             type: string
 *                             example: "mentor"
 *       404:
 *         description: Mentor profile tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Mentor profile not found
 */
router.get(
  "/admin/mentor-profiles/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(getMentorProfileByIdSchema),
  MentorController.getMentorProfileById
);

/**
 * @swagger
 * /api/mentor/mentors/{id}:
 *   get:
 *     summary: Detail mentor publik by ID
 *     tags: [Mentor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "mentor-abc123"
 *     responses:
 *       200:
 *         description: Mentor publik ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Public mentor profile retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "mentor-abc123"
 *                     expertise:
 *                       type: string
 *                       example: "Web Development"
 *                     bio:
 *                       type: string
 *                       example: "Frontend engineer with 5+ years experience"
 *                     experience:
 *                       type: string
 *                       example: "Built apps at Tokopedia and Shopee"
 *                     hourlyRate:
 *                       type: number
 *                       example: 150000
 *                     availabilitySchedule:
 *                       type: object
 *                       example:
 *                         monday: "10:00-12:00"
 *                         thursday: "14:00-16:00"
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "user-xyz456"
 *                         fullName:
 *                           type: string
 *                           example: "Andi Saputra"
 *                         profilePicture:
 *                           type: string
 *                           example: "https://example.com/profile.jpg"
 *                         city:
 *                           type: string
 *                           example: "Jakarta"
 *                         province:
 *                           type: string
 *                           example: "DKI Jakarta"
 *       404:
 *         description: Mentor tidak ditemukan atau belum terverifikasi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Mentor not found or not verified
 */
router.get(
  "/mentors/:id",
  authenticate,
  validate(getPublicMentorProfileByIdSchema),
  MentorController.getById
);

/**
 * @swagger
 * /api/mentor/admin/mentor-profiles/{id}:
 *   delete:
 *     summary: Hapus profil mentor (admin)
 *     tags: [Mentor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "mentor-abc123"
 *     responses:
 *       200:
 *         description: Profil mentor berhasil dihapus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Mentor profile deleted successfully
 *       404:
 *         description: Mentor tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Mentor profile not found
 */
router.delete(
  "/admin/mentor-profiles/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(deleteMentorProfileSchema),
  MentorController.deleteMentorProfile
);

export default router;
