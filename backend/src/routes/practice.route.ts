import { Router } from "express";
import * as PracticeController from "../controllers/practice.controller";
import {
  createPracticeSchema,
  updatePracticeSchema,
  getAdminPracticeListSchema,
  getAdminPracticeDetailSchema,
  getMentorPracticesQuerySchema,
  getMentorPracticeDetailParamsSchema,
  getPublicPracticesQuerySchema,
  getPracticePreviewSchema,
  createPracticeMaterialValidator,
  updatePracticeMaterialValidator,
  deletePracticeMaterialValidator,
  uploadPracticeFileValidator,
  updatePracticeFileValidator,
  deletePracticeFileValidator,
  getPracticeFilesByMaterialValidator,
  getPracticeMaterialsValidator,
  getPracticeMaterialDetailValidator,
  createPracticePurchaseSchema,
  cancelPracticePurchaseSchema,
  getPracticePurchasesSchema,
  getPracticePurchaseDetailSchema,
  getAdminPracticePurchasesSchema,
  getAdminPracticePurchaseDetailSchema,
  updatePracticePurchaseStatusSchema,
  exportPracticePurchaseSchema,
  createOrUpdatePracticeProgressSchema,
  updatePracticeProgressSchema,
  getAllPracticeProgressSchema,
  getPracticeProgressByIdSchema,
  deletePracticeProgressSchema,
  createPracticeReviewSchema,
  updatePracticeReviewSchema,
  getUserPracticeReviewsSchema,
  getPracticeReviewsSchema,
  updateAdminPracticeReviewSchema,
  deleteAdminPracticeReviewSchema,
  getAllAdminPracticeReviewsSchema,
  getAdminPracticeReviewByIdSchema,
  exportAdminPracticeReviewsSchema,
} from "../validations/practice.validation";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorizeRole";
import {
  handleThumbnailUpload,
  handlePracticeFileUpload,
} from "../middlewares/uploadImage";
import { preloadPracticeTitle } from "../middlewares/preloadTitlePractice";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Practices
 *   description: Manajemen course/practice untuk admin, mentor, dan publik
 */

/**
 * @swagger
 * /api/practice/createPractices:
 *   post:
 *     summary: Admin membuat practice baru
 *     tags: [Practices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - mentorId
 *               - title
 *               - price
 *             properties:
 *               mentorId:
 *                 type: string
 *                 example: "mentor-uuid-001"
 *               title:
 *                 type: string
 *                 example: "Build a Portfolio Website"
 *               price:
 *                 type: number
 *                 example: 100000
 *               description:
 *                 type: string
 *                 example: "Latihan untuk membangun portofolio developer"
 *               requirements:
 *                 type: string
 *                 example: "Punya pengalaman dasar HTML/CSS"
 *               goals:
 *                 type: string
 *                 example: "Menguasai dasar website dengan responsive layout"
 *               thumbnailImage:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               benefits:
 *                 type: string
 *               toolsUsed:
 *                 type: string
 *               challenges:
 *                 type: string
 *               expectedOutcomes:
 *                 type: string
 *               estimatedDuration:
 *                 type: string
 *               targetAudience:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               practiceType:
 *                 type: string
 *               category:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Practice berhasil dibuat
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
 *                   example: Practice berhasil dibuat
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "practice-uuid-001"
 *                     title:
 *                       type: string
 *                     price:
 *                       type: number
 *                     mentorId:
 *                       type: string
 *                     thumbnailImages:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Data request tidak valid atau field wajib kosong
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
 *                   example: Mentor ID, Title, dan Price wajib diisi
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
 *         description: Tidak memiliki izin (bukan admin)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Forbidden
 *       500:
 *         description: Terjadi kesalahan server saat membuat practice
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
  "/createPractices",
  authenticate,
  authorizeRoles("admin"),
  handleThumbnailUpload("thumbnailImage", true),
  validate(createPracticeSchema),
  PracticeController.createPractice
);

/**
 * @swagger
 * /api/practice/admin/practices/{id}:
 *   patch:
 *     summary: Admin mengupdate practice
 *     tags: [Practices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dari practice
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Update Judul Practice"
 *               price:
 *                 type: number
 *                 example: 200000
 *               description:
 *                 type: string
 *               mentorId:
 *                 type: string
 *                 example: "mentor-uuid-001"
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               thumbnailImage:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               benefits:
 *                 type: string
 *               toolsUsed:
 *                 type: string
 *               challenges:
 *                 type: string
 *               expectedOutcomes:
 *                 type: string
 *               estimatedDuration:
 *                 type: string
 *               targetAudience:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Practice berhasil diperbarui
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
 *                   example: Practice berhasil diperbarui
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "practice-uuid-001"
 *                     title:
 *                       type: string
 *                     price:
 *                       type: number
 *                     mentorId:
 *                       type: string
 *                     thumbnailImages:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: "Request tidak valid (misal: body kosong atau format tidak sesuai)"
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
 *                   example: Data tidak valid
 *       401:
 *         description: Tidak terautentikasi (token tidak ada atau invalid)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Tidak memiliki izin akses (bukan admin)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Forbidden
 *       404:
 *         description: Practice tidak ditemukan atau Mentor ID tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Practice tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan internal server
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
  "/admin/practices/:id",
  authenticate,
  authorizeRoles("admin"),
  preloadPracticeTitle,
  handleThumbnailUpload("thumbnailImage", true),
  validate(updatePracticeSchema),
  PracticeController.updatePractice
);

/**
 * @swagger
 * /api/practice/admin/practices:
 *   get:
 *     summary: Admin melihat daftar practice
 *     tags: [Practices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: "UI/UX"
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *       - in: query
 *         name: mentorId
 *         schema:
 *           type: string
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
 *     responses:
 *       200:
 *         description: Daftar practice berhasil diambil
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
 *                   example: Daftar practice berhasil diambil
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
 *                           title:
 *                             type: string
 *                           price:
 *                             type: number
 *                           isActive:
 *                             type: boolean
 *                           mentorProfile:
 *                             type: object
 *                             properties:
 *                               user:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: string
 *                                   fullName:
 *                                     type: string
 *                                   email:
 *                                     type: string
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       400:
 *         description: Query parameter tidak valid
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
 *                   example: Parameter query tidak valid
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
 *         description: Tidak memiliki izin akses (bukan admin)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Forbidden
 *       500:
 *         description: Terjadi kesalahan di server
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
  "/admin/practices",
  authenticate,
  authorizeRoles("admin"),
  validate(getAdminPracticeListSchema),
  PracticeController.getAdminPracticeList
);

/**
 * @swagger
 * /api/practice/admin/practices/{id}:
 *   get:
 *     summary: Admin melihat detail practice
 *     tags: [Practices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID practice
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detail practice berhasil diambil
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
 *                   example: Practice details fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     practice:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         title:
 *                           type: string
 *                         price:
 *                           type: number
 *                         isActive:
 *                           type: boolean
 *                         mentorProfile:
 *                           type: object
 *                           properties:
 *                             user:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                 fullName:
 *                                   type: string
 *                                 email:
 *                                   type: string
 *                         practiceMaterials:
 *                           type: array
 *                           items:
 *                             type: object
 *                         practiceReviews:
 *                           type: array
 *                           items:
 *                             type: object
 *                         practicePurchases:
 *                           type: array
 *                           items:
 *                             type: object
 *                     practiceMaterialsMessage:
 *                       type: string
 *                       example: Materials available.
 *                     practiceReviewsMessage:
 *                       type: string
 *                       example: Reviews available.
 *                     practicePurchasesMessage:
 *                       type: string
 *                       example: Purchases made.
 *       404:
 *         description: Practice tidak ditemukan
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
 *                   example: Practice not found
 *       401:
 *         description: Unauthorized (tidak login)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Forbidden (bukan admin)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Forbidden
 *       500:
 *         description: Terjadi kesalahan pada server saat mengambil detail practice
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to fetch practice details: [reason]"
 */
router.get(
  "/admin/practices/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(getAdminPracticeDetailSchema),
  PracticeController.getAdminPracticeDetail
);

/**
 * @swagger
 * /api/practice/admin/practices/{id}:
 *   delete:
 *     summary: Admin menghapus practice
 *     tags: [Practices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID dari practice
 *         schema:
 *           type: string
 *       - in: query
 *         name: hardDelete
 *         required: false
 *         description: Gunakan "true" untuk hard delete
 *         schema:
 *           type: string
 *           enum: [true, false]
 *     responses:
 *       200:
 *         description: Practice berhasil dihapus atau dinonaktifkan
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
 *                   example: Practice deleted successfully
 *       400:
 *         description: Query tidak valid atau request tidak sesuai
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
 *                   example: Invalid request
 *       404:
 *         description: Practice tidak ditemukan
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
 *                   example: Practice not found
 *       401:
 *         description: Unauthorized (tidak login)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Forbidden (bukan admin)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Forbidden
 *       500:
 *         description: Terjadi kesalahan pada server saat menghapus practice
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to delete practice: [reason]"
 */
router.delete(
  "/admin/practices/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(getAdminPracticeDetailSchema),
  PracticeController.deleteAdminPractice
);

/**
 * @swagger
 * /api/practice/mentor/practices:
 *   get:
 *     summary: Mentor melihat daftar practice mereka
 *     tags: [Practices]
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
 *         name: sortBy
 *         schema:
 *           type: string
 *           example: title
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           example: asc
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: ui/ux
 *     responses:
 *       200:
 *         description: Daftar practice mentor berhasil diambil
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
 *                   example: Practices fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       price:
 *                         type: number
 *                       isActive:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
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
 *         description: Unauthorized (belum login)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Forbidden - bukan mentor atau tidak memiliki profil mentor
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
 *                   example: "Unauthorized: Mentor profile not found"
 *       500:
 *         description: Terjadi kesalahan pada server saat mengambil practice
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to fetch practices: [error message]"
 */
router.get(
  "/mentor/practices",
  authenticate,
  authorizeRoles("mentor"),
  validate(getMentorPracticesQuerySchema),
  PracticeController.getMentorPractices
);

/**
 * @swagger
 * /api/practice/mentor/practices/{id}:
 *   get:
 *     summary: Mentor melihat detail practice miliknya
 *     tags: [Practices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dari practice
 *     responses:
 *       200:
 *         description: Detail practice berhasil diambil
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
 *                   example: Detail practice berhasil diambil
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     price:
 *                       type: number
 *                     isActive:
 *                       type: boolean
 *                     mentorProfile:
 *                       type: object
 *                       properties:
 *                         user:
 *                           type: object
 *                           properties:
 *                             fullName:
 *                               type: string
 *                             email:
 *                               type: string
 *                             profilePicture:
 *                               type: string
 *                     practiceMaterials:
 *                       oneOf:
 *                         - type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               title:
 *                                 type: string
 *                         - type: string
 *                           example: Belum ada materi pada course ini
 *                     practiceReviews:
 *                       oneOf:
 *                         - type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               rating:
 *                                 type: number
 *                         - type: string
 *                           example: Belum ada review dari mentee
 *                     practicePurchases:
 *                       oneOf:
 *                         - type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *                         - type: string
 *                           example: Belum ada pembelian untuk course ini
 *       404:
 *         description: Practice tidak ditemukan atau bukan milik mentor
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
 *                   example: Practice tidak ditemukan atau bukan milikmu
 *       401:
 *         description: Unauthorized - Token tidak valid atau belum login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Forbidden - User bukan mentor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Forbidden - Access denied
 *       500:
 *         description: Terjadi kesalahan server saat mengambil detail practice
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to fetch practice detail
 */
router.get(
  "/mentor/practices/:id",
  authenticate,
  authorizeRoles("mentor"),
  validate(getMentorPracticeDetailParamsSchema),
  PracticeController.getPracticeDetail
);

/**
 * @swagger
 * /api/practice/practices:
 *   get:
 *     summary: Publik melihat daftar practice
 *     tags: [Practices]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Cari berdasarkan judul atau kategori
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter berdasarkan kategori
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Filter berdasarkan tags (dipisah koma)
 *       - in: query
 *         name: priceMin
 *         schema:
 *           type: number
 *         description: Filter harga minimum
 *       - in: query
 *         name: priceMax
 *         schema:
 *           type: number
 *         description: Filter harga maksimum
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, price]
 *         description: Urutkan berdasarkan kolom tertentu
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Urutan naik atau turun
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
 *     responses:
 *       200:
 *         description: Daftar course berhasil diambil
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
 *                   example: Daftar course berhasil diambil
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 100
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 10
 *                     practices:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                           price:
 *                             type: number
 *                           category:
 *                             type: string
 *                           tags:
 *                             type: array
 *                             items:
 *                               type: string
 *                           practiceType:
 *                             type: string
 *                           thumbnailImages:
 *                             type: array
 *                             items:
 *                               type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           benefits:
 *                             type: string
 *                           toolsUsed:
 *                             type: string
 *                           challenges:
 *                             type: string
 *                           expectedOutcomes:
 *                             type: string
 *                           estimatedDuration:
 *                             type: string
 *                           targetAudience:
 *                             type: string
 *                           mentor:
 *                             type: object
 *                             properties:
 *                               fullName:
 *                                 type: string
 *                               profilePicture:
 *                                 type: string
 *       500:
 *         description: Terjadi kesalahan saat mengambil daftar practice
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
 *                   example: Gagal mengambil daftar course
 */
router.get(
  "/practices",
  validate(getPublicPracticesQuerySchema),
  PracticeController.getPublicPractices
);

/**
 * @swagger
 * /api/practice/practices/{id}:
 *   get:
 *     summary: Publik melihat detail preview practice
 *     tags: [Practices]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dari practice/course
 *     responses:
 *       200:
 *         description: Detail course berhasil diambil
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
 *                   example: Course details fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     thumbnailImages:
 *                       type: array
 *                       items:
 *                         type: string
 *                     price:
 *                       type: number
 *                     practiceType:
 *                       type: string
 *                     category:
 *                       type: string
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: string
 *                     benefits:
 *                       type: string
 *                     toolsUsed:
 *                       type: string
 *                     challenges:
 *                       type: string
 *                     expectedOutcomes:
 *                       type: string
 *                     estimatedDuration:
 *                       type: string
 *                     targetAudience:
 *                       type: string
 *                     mentor:
 *                       type: string
 *                     practiceMaterials:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                           orderNumber:
 *                             type: integer
 *       404:
 *         description: Practice tidak ditemukan
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
 *                   example: Course not found
 *                 data:
 *                   type: string
 *                   nullable: true
 *                   example: null
 */
router.get(
  "/practices/:id",
  validate(getPracticePreviewSchema),
  PracticeController.getPracticePreview
);

/**
 * @swagger
 * /api/practice/admin/materialPractices/{id}:
 *   post:
 *     summary: Admin membuat materi practice
 *     tags: [Practices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID practice
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: Dasar HTML
 *               description:
 *                 type: string
 *                 example: Ini adalah materi pembuka untuk HTML
 *               status:
 *                 type: string
 *                 example: published
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: 2025-08-01
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: 2025-08-15
 *     responses:
 *       201:
 *         description: Practice material created successfully
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
 *                   example: Practice material created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: clxk9adpw0000utdovz8nyfki
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     orderNumber:
 *                       type: integer
 *                     status:
 *                       type: string
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                     endDate:
 *                       type: string
 *                       format: date-time
 *                     practiceId:
 *                       type: string
 *       400:
 *         description: Practice ID and Title are required
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
 *                   example: Practice ID and Title are required
 *       500:
 *         description: Internal server error
 */
router.post(
  "/admin/materialPractices/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(createPracticeMaterialValidator),
  PracticeController.createPracticeMaterialController
);

/**
 * @swagger
 * /api/practice/admin/materialPractices/{id}/{materialId}:
 *   patch:
 *     summary: Admin mengedit materi practice
 *     tags: [Practices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID practice
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: materialId
 *         description: ID materi
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
 *               title:
 *                 type: string
 *                 example: Materi JavaScript Lanjutan
 *               description:
 *                 type: string
 *                 example: Penjelasan tentang closure dan hoisting
 *               status:
 *                 type: string
 *                 example: published
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-08-01T00:00:00.000Z
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-08-15T00:00:00.000Z
 *     responses:
 *       200:
 *         description: Practice material updated successfully
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
 *                   example: Practice material updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     material:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         title:
 *                           type: string
 *                         description:
 *                           type: string
 *                         orderNumber:
 *                           type: integer
 *                         status:
 *                           type: string
 *                         startDate:
 *                           type: string
 *                           format: date-time
 *                         endDate:
 *                           type: string
 *                           format: date-time
 *                         practiceId:
 *                           type: string
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                     updatedFields:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["title", "description", "status"]
 *                     message:
 *                       type: string
 *                       example: Practice material updated successfully
 *       404:
 *         description: Practice material not found
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
 *                   example: Practice material not found
 *       500:
 *         description: Internal server error
 */
router.patch(
  "/admin/materialPractices/:id/:materialId",
  authenticate,
  authorizeRoles("admin"),
  validate(updatePracticeMaterialValidator),
  PracticeController.updatePracticeMaterialController
);

/**
 * @swagger
 * /api/practice/admin/materialPractices/{id}/{materialId}:
 *   delete:
 *     summary: Admin menghapus materi practice
 *     tags: [Practices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID practice
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: materialId
 *         description: ID materi
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Practice material deleted successfully
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
 *                   example: Practice material deleted successfully
 *                 data:
 *                   type: "null"
 *                   example: null
 *       404:
 *         description: Practice material not found
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
 *                   example: Practice material not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/admin/materialPractices/:id/:materialId",
  authenticate,
  authorizeRoles("admin"),
  validate(deletePracticeMaterialValidator),
  PracticeController.deletePracticeMaterialController
);

/**
 * @swagger
 * /api/practice/materialPractices/{id}:
 *   get:
 *     summary: Mendapatkan daftar materi untuk practice tertentu
 *     tags: [Practices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID practice
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Halaman saat ini
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah item per halaman
 *     responses:
 *       200:
 *         description: Materials fetched successfully
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
 *                   example: Materials fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       orderNumber:
 *                         type: integer
 *                       status:
 *                         type: string
 *                       startDate:
 *                         type: string
 *                         format: date-time
 *                       endDate:
 *                         type: string
 *                         format: date-time
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       practiceFiles:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             fileName:
 *                               type: string
 *                             filePath:
 *                               type: string
 *                             fileType:
 *                               type: string
 *                             fileSize:
 *                               type: integer
 *                             orderNumber:
 *                               type: integer
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *                     totalItems:
 *                       type: integer
 *                       example: 25
 *                     pageSize:
 *                       type: integer
 *                       example: 10
 *       403:
 *         description: Unauthorized access to practice materials
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
 *                   example: You do not have permission to access this practice materials
 *       404:
 *         description: Practice not found
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
 *                   example: Practice not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/materialPractices/:id",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(getPracticeMaterialsValidator),
  PracticeController.getPracticeMaterialsController
);

/**
 * @swagger
 * /api/practice/materialDetailPractices/{id}/{materialId}:
 *   get:
 *     summary: Mendapatkan detail satu materi practice
 *     tags: [Practices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID practice
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: materialId
 *         description: ID material
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Practice material detail fetched successfully
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
 *                   example: Practice material detail fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     orderNumber:
 *                       type: integer
 *                     status:
 *                       type: string
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                     endDate:
 *                       type: string
 *                       format: date-time
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     practiceFiles:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           fileName:
 *                             type: string
 *                           filePath:
 *                             type: string
 *                           fileType:
 *                             type: string
 *                           fileSize:
 *                             type: integer
 *                           orderNumber:
 *                             type: integer
 *       403:
 *         description: Unauthorized access to practice material
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
 *                   example: You do not have permission to access this practice material
 *       404:
 *         description: Practice atau material tidak ditemukan
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
 *                   example: Practice not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/materialDetailPractices/:id/:materialId",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(getPracticeMaterialDetailValidator),
  PracticeController.getPracticeMaterialDetailController
);

/**
 * @swagger
 * /api/practice/admin/practiceFiles/upload:
 *   post:
 *     summary: Admin mengunggah file untuk materi practice
 *     tags: [Practices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - fileName
 *               - materialId
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               fileName:
 *                 type: string
 *                 example: Materi Video 1
 *               materialId:
 *                 type: string
 *                 example: 12345678-aaaa-bbbb-cccc-123456789abc
 *     responses:
 *       201:
 *         description: Practice file uploaded successfully
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
 *                   example: Practice file uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     materialId:
 *                       type: string
 *                     fileName:
 *                       type: string
 *                     filePath:
 *                       type: string
 *                     fileType:
 *                       type: string
 *                     fileSize:
 *                       type: number
 *                       description: File size dalam MB (dibulatkan)
 *                     orderNumber:
 *                       type: number
 *       400:
 *         description: Request tidak valid
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
 *                   example: Material ID and File Name are required
 *       500:
 *         description: Internal server error
 */
router.post(
  "/admin/practiceFiles/upload",
  authenticate,
  authorizeRoles("admin"),
  handlePracticeFileUpload("file"),
  validate(uploadPracticeFileValidator),
  PracticeController.uploadPracticeFileController
);

/**
 * @swagger
 * /api/practice/admin/practiceFiles/{fileId}:
 *   patch:
 *     summary: Admin mengubah nama file practice
 *     tags: [Practices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         description: ID file practice
 *         required: true
 *         schema:
 *           type: string
 *           example: "abc123-def456-ghi789"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fileName
 *             properties:
 *               fileName:
 *                 type: string
 *                 example: "Updated Nama File.pdf"
 *     responses:
 *       200:
 *         description: Practice file name updated successfully
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
 *                   example: Practice file name updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "abc123-def456-ghi789"
 *                     fileName:
 *                       type: string
 *                       example: "Updated Nama File.pdf"
 *                     filePath:
 *                       type: string
 *                       example: "practiceFile/original-name.pdf"
 *                     fileType:
 *                       type: string
 *                       example: "pdf"
 *                     fileSize:
 *                       type: number
 *                       example: 3
 *                     materialId:
 *                       type: string
 *                       example: "mat-xyz-123"
 *                     orderNumber:
 *                       type: number
 *                       example: 2
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: File tidak ditemukan
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
 *                   example: Practice file not found
 *       400:
 *         description: Request body tidak valid
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
 *                   example: File name is required
 *       500:
 *         description: Server error
 */
router.patch(
  "/admin/practiceFiles/:fileId",
  authenticate,
  authorizeRoles("admin"),
  validate(updatePracticeFileValidator),
  PracticeController.updatePracticeFileController
);

/**
 * @swagger
 * /api/practice/admin/practiceFiles/{fileId}:
 *   delete:
 *     summary: Admin menghapus file practice
 *     tags: [Practices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         description: ID file practice
 *         required: true
 *         schema:
 *           type: string
 *           example: "file-abc-123"
 *     responses:
 *       200:
 *         description: Practice file deleted successfully
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
 *                   example: Practice file deleted successfully
 *       404:
 *         description: Practice file tidak ditemukan
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
 *                   example: Practice file not found
 *       500:
 *         description: Server error (gagal menghapus file di disk, dll)
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
 *                   example: Internal server error
 */
router.delete(
  "/admin/practiceFiles/:fileId",
  authenticate,
  authorizeRoles("admin"),
  validate(deletePracticeFileValidator),
  PracticeController.deletePracticeFileController
);

/**
 * @swagger
 * /api/practice/practiceFiles/{materialId}:
 *   get:
 *     summary: Mendapatkan daftar file berdasarkan materi
 *     tags: [Practices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: materialId
 *         description: ID materi practice
 *         required: true
 *         schema:
 *           type: string
 *           example: "material-12345"
 *       - in: query
 *         name: page
 *         description: Halaman data (pagination)
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         description: Jumlah data per halaman
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: Practice files fetched successfully
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
 *                   example: Practice files fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "file-abc-123"
 *                       fileName:
 *                         type: string
 *                         example: "Materi 1 - Pengantar.pdf"
 *                       filePath:
 *                         type: string
 *                         example: "practiceFile/abc123.pdf"
 *                       fileType:
 *                         type: string
 *                         example: "pdf"
 *                       fileSize:
 *                         type: number
 *                         example: 2
 *                       orderNumber:
 *                         type: integer
 *                         example: 1
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *                     totalFiles:
 *                       type: integer
 *                       example: 25
 *                     pageSize:
 *                       type: integer
 *                       example: 10
 *       400:
 *         description: Material ID is required
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
 *                   example: Material ID is required
 *       403:
 *         description: Akses ditolak (bukan admin, mentor, atau mentee yang membeli practice)
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
 *                   example: You do not have permission to access these practice files
 *       404:
 *         description: Practice file atau material tidak ditemukan
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
 *                   example: No practice files found for this material
 *       500:
 *         description: Internal server error
 */
router.get(
  "/practiceFiles/:materialId",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(getPracticeFilesByMaterialValidator),
  PracticeController.getPracticeFilesByMaterialController
);

// Practice Purchases
/**
 * @swagger
 * /api/practice/mentees/practice-purchases:
 *   post:
 *     summary: Membeli practice oleh mentee
 *     tags: [Practices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - practiceId
 *             properties:
 *               practiceId:
 *                 type: string
 *                 example: "practice-abc123"
 *               referralUsageId:
 *                 type: string
 *                 example: "referral-xyz789"
 *     responses:
 *       201:
 *         description: Practice purchase created successfully
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
 *                   example: Practice purchase berhasil dibuat.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "Purchase-1234567890"
 *                     userId:
 *                       type: string
 *                       example: "user-abc"
 *                     practiceId:
 *                       type: string
 *                       example: "practice-abc123"
 *                     referralUsageId:
 *                       type: string
 *                       example: "referral-xyz789"
 *                     status:
 *                       type: string
 *                       example: "pending"
 *                     payment:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "PAY-PRC-20250701-1234567890"
 *                         practicePurchaseId:
 *                           type: string
 *                           example: "Purchase-1234567890"
 *                         amount:
 *                           type: number
 *                           example: 50000
 *                         status:
 *                           type: string
 *                           example: "pending"
 *                     originalPrice:
 *                       type: number
 *                       example: 50000
 *                     finalPrice:
 *                       type: number
 *                       example: 40000
 *       400:
 *         description: Bad request - referral usage invalid atau payment invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Referral usage sudah digunakan.
 *       404:
 *         description: Practice, referral usage, atau user tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: Practice tidak ditemukan atau tidak aktif.
 *       500:
 *         description: Internal Server Error (misalnya gagal generate ID)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Gagal menghasilkan ID Payment unik setelah beberapa percobaan
 */
router.post(
  "/mentees/practice-purchases",
  authenticate,
  validate(createPracticePurchaseSchema),
  PracticeController.createPracticePurchaseController
);

/**
 * @swagger
 * /api/practice/mentees/practice-purchases-cancel/{id}:
 *   patch:
 *     summary: Membatalkan pembelian practice oleh mentee
 *     tags: [Practices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID pembelian practice
 *     responses:
 *       200:
 *         description: Practice purchase cancelled successfully
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
 *                   example: Practice purchase cancelled successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "Purchase-1234567890"
 *                     userId:
 *                       type: string
 *                       example: "user-abc"
 *                     practiceId:
 *                       type: string
 *                       example: "practice-xyz"
 *                     status:
 *                       type: string
 *                       example: "cancelled"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-07-01T12:00:00.000Z"
 *       400:
 *         description: Gagal membatalkan - status bukan pending
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Only pending purchases can be cancelled
 *       403:
 *         description: Tidak memiliki izin untuk membatalkan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 403
 *                 message:
 *                   type: string
 *                   example: Unauthorized to cancel this purchase
 *       404:
 *         description: Practice purchase tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: Practice Purchase not found
 */
router.patch(
  "/mentees/practice-purchases-cancel/:id",
  authenticate,
  validate(cancelPracticePurchaseSchema),
  PracticeController.cancelPracticePurchaseController
);

/**
 * @swagger
 * /api/practice/mentees/practice-purchases:
 *   get:
 *     summary: Mendapatkan semua pembelian practice oleh mentee
 *     tags: [Practices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Halaman saat ini
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Jumlah item per halaman
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, cancelled]
 *         description: Filter berdasarkan status pembelian
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Pencarian berdasarkan judul practice
 *     responses:
 *       200:
 *         description: Practice purchases fetched successfully
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
 *                   example: Practice purchases fetched successfully
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
 *                             example: "Purchase-1234567890"
 *                           status:
 *                             type: string
 *                             example: "pending"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-07-01T12:00:00.000Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-07-01T13:00:00.000Z"
 *                           practice:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "practice-xyz"
 *                               title:
 *                                 type: string
 *                                 example: "UI/UX Design Fundamental"
 *                               thumbnailImages:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                                 example: ["https://example.com/img1.png"]
 *                               price:
 *                                 type: number
 *                                 example: 150000
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 20
 *                     totalPages:
 *                       type: integer
 *                       example: 2
 *       400:
 *         description: Invalid query parameters
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
 *                   example: Invalid page or limit parameter
 *       401:
 *         description: Unauthorized, token tidak valid atau tidak dikirim
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 */
router.get(
  "/mentees/practice-purchases",
  authenticate,
  validate(getPracticePurchasesSchema),
  PracticeController.getPracticePurchasesController
);

/**
 * @swagger
 * /api/practice/mentees/practice-purchases/{id}:
 *   get:
 *     summary: Mendapatkan detail pembelian practice oleh mentee
 *     tags: [Practices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID pembelian practice
 *     responses:
 *       200:
 *         description: Practice purchase detail fetched successfully
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
 *                   example: Practice purchase detail fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: Purchase-1234567890
 *                     status:
 *                       type: string
 *                       example: pending
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-07-01T10:00:00.000Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-07-01T10:05:00.000Z
 *                     practice:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: practice-abc123
 *                         title:
 *                           type: string
 *                           example: UI/UX Masterclass
 *                         thumbnailImages:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["https://example.com/image.jpg"]
 *                         price:
 *                           type: number
 *                           example: 200000
 *                         description:
 *                           type: string
 *                           example: Pelajari dasar hingga lanjutan UI/UX.
 *                         practiceType:
 *                           type: string
 *                           example: video
 *                         category:
 *                           type: string
 *                           example: Design
 *                         tags:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["ui", "ux", "figma"]
 *                     payment:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: PAY-PRC-20250701-1234567890
 *                         paymentMethod:
 *                           type: string
 *                           nullable: true
 *                           example: null
 *                         status:
 *                           type: string
 *                           example: pending
 *                         amount:
 *                           type: number
 *                           example: 180000
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2025-07-01T10:00:00.000Z
 *                     referralUsage:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: RU-987654321
 *                         referralCode:
 *                           type: object
 *                           nullable: true
 *                           properties:
 *                             id:
 *                               type: string
 *                               example: RC-abc123
 *       401:
 *         description: Unauthorized, token tidak valid atau tidak diberikan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       404:
 *         description: Practice purchase not found or access denied
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Practice purchase not found or access denied
 */
router.get(
  "/mentees/practice-purchases/:id",
  authenticate,
  validate(getPracticePurchaseDetailSchema),
  PracticeController.getPracticePurchaseDetailController
);

/**
 * @swagger
 * /api/practice/admin/practice-purchases:
 *   get:
 *     summary: Mendapatkan semua pembelian practice (admin)
 *     tags: [Practices]
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
 *         name: status
 *         schema:
 *           type: string
 *           example: pending
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *           example: Dimas
 *       - in: query
 *         name: practice
 *         schema:
 *           type: string
 *           example: UI/UX Masterclass
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-07-01
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-07-31
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           example: purchaseDate
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           example: desc
 *     responses:
 *       200:
 *         description: Successfully fetched practice purchases
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
 *                   example: Successfully fetched practice purchases
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     totalPage:
 *                       type: integer
 *                       example: 3
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     pageSize:
 *                       type: integer
 *                       example: 10
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: Purchase-1234567890
 *                           status:
 *                             type: string
 *                             example: pending
 *                           purchaseDate:
 *                             type: string
 *                             format: date-time
 *                             example: 2025-07-01T10:00:00.000Z
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: user-abc123
 *                               fullName:
 *                                 type: string
 *                                 example: Dimas Putra
 *                               email:
 *                                 type: string
 *                                 example: dimas@example.com
 *                           practice:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: practice-xyz789
 *                               title:
 *                                 type: string
 *                                 example: UI/UX Masterclass
 *                               price:
 *                                 type: number
 *                                 example: 200000
 *                           payment:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: PAY-PRC-20250701-1234567890
 *                               amount:
 *                                 type: number
 *                                 example: 180000
 *                               status:
 *                                 type: string
 *                                 example: pending
 *                               paymentMethod:
 *                                 type: string
 *                                 nullable: true
 *                                 example: null
 *                           referralUsage:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: RU-987654321
 *       401:
 *         description: Unauthorized, token tidak valid atau tidak diberikan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Forbidden, hanya admin yang boleh mengakses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Forbidden: Access is denied"
 *       400:
 *         description: Bad Request, query params tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Validation failed
 */
router.get(
  "/admin/practice-purchases",
  authenticate,
  authorizeRoles("admin"),
  validate(getAdminPracticePurchasesSchema),
  PracticeController.getAllPracticePurchasesController
);

/**
 * @swagger
 * /api/practice/admin/practice-purchases/{id}:
 *   get:
 *     summary: Mendapatkan detail pembelian practice (admin)
 *     tags: [Practices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID pembelian practice
 *         schema:
 *           type: string
 *           example: Purchase-1234567890
 *     responses:
 *       200:
 *         description: Successfully fetched practice purchase detail
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
 *                   example: Successfully fetched practice purchase detail
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: Purchase-1234567890
 *                     status:
 *                       type: string
 *                       example: pending
 *                     purchaseDate:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-07-01T10:00:00.000Z
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: user-abc123
 *                         fullName:
 *                           type: string
 *                           example: Dimas Putra
 *                         email:
 *                           type: string
 *                           example: dimas@example.com
 *                     practice:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: practice-xyz789
 *                         title:
 *                           type: string
 *                           example: UI/UX Masterclass
 *                         price:
 *                           type: number
 *                           example: 200000
 *                     payment:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: PAY-PRC-20250701-1234567890
 *                         amount:
 *                           type: number
 *                           example: 180000
 *                         status:
 *                           type: string
 *                           example: pending
 *                         paymentMethod:
 *                           type: string
 *                           nullable: true
 *                           example: null
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2025-07-01T10:00:00.000Z
 *                     referralUsage:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: RU-987654321
 *                         referralCode:
 *                           type: object
 *                           nullable: true
 *                           properties:
 *                             id:
 *                               type: string
 *                               example: REF-CODE-ABC
 *                             discountPercentage:
 *                               type: number
 *                               example: 10
 *                             commissionPercentage:
 *                               type: number
 *                               example: 5
 *       404:
 *         description: Practice Purchase not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Practice Purchase not found
 *       401:
 *         description: Unauthorized, token tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Forbidden, hanya admin yang boleh mengakses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Forbidden: Access is denied"
 */
router.get(
  "/admin/practice-purchases/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(getAdminPracticePurchaseDetailSchema),
  PracticeController.getAdminPracticePurchaseDetailController
);

/**
 * @swagger
 * /api/practice/admin/practice-purchases-status/{id}:
 *   patch:
 *     summary: Mengubah status pembelian practice (admin)
 *     tags: [Practices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID pembelian practice
 *         schema:
 *           type: string
 *           example: Purchase-1234567890
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
 *                 example: completed
 *     responses:
 *       200:
 *         description: Successfully updated practice purchase status
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
 *                   example: Successfully updated practice purchase status
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: Purchase-1234567890
 *                     status:
 *                       type: string
 *                       example: completed
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-07-01T10:00:00.000Z
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: user-abc123
 *                         fullName:
 *                           type: string
 *                           example: Dimas Putra
 *                         email:
 *                           type: string
 *                           example: dimas@example.com
 *                     practice:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: practice-xyz789
 *                         title:
 *                           type: string
 *                           example: UI/UX Masterclass
 *       400:
 *         description: Bad Request - Status tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Status tidak valid
 *       404:
 *         description: Practice purchase not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Practice purchase not found
 *       401:
 *         description: Unauthorized - Token tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Forbidden - Hanya admin yang boleh mengakses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Forbidden: Access is denied"
 */
router.patch(
  "/admin/practice-purchases-status/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(updatePracticePurchaseStatusSchema),
  PracticeController.updatePracticePurchaseStatusController
);

/**
 * @swagger
 * /api/practice/admin/practice-purchases-export:
 *   get:
 *     summary: Mengekspor data pembelian practice (admin)
 *     tags: [Practices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         required: true
 *         description: Format file export
 *         schema:
 *           type: string
 *           enum: [csv, xlsx]
 *           example: csv
 *     responses:
 *       200:
 *         description: File export berhasil dihasilkan
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Format file tidak valid (harus csv atau xlsx)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Format file tidak valid
 *       401:
 *         description: Unauthorized - Token tidak valid atau tidak ada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Forbidden - Hanya admin yang diperbolehkan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Forbidden: Access is denied"
 *       500:
 *         description: Internal Server Error saat menghasilkan file
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Gagal menghasilkan file export
 */
router.get(
  "/admin/practice-purchases-export",
  authenticate,
  authorizeRoles("admin"),
  validate(exportPracticePurchaseSchema),
  PracticeController.exportPracticePurchasesController
);

// Practice Progress
/**
 * @swagger
 * /api/practice/practice/progress:
 *   post:
 *     summary: Membuat atau memperbarui progress belajar pada practice material
 *     tags: [Practices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - materialId
 *               - isCompleted
 *             properties:
 *               materialId:
 *                 type: string
 *                 example: "abc123-material-id"
 *               userId:
 *                 type: string
 *                 description: Hanya admin/mentor boleh mengisi ini (mentee akan otomatis pakai usernya sendiri)
 *                 example: "user-789"
 *               isCompleted:
 *                 type: boolean
 *                 example: true
 *               timeSpentSeconds:
 *                 type: number
 *                 example: 600
 *     responses:
 *       200:
 *         description: Successfully created or updated practice progress
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
 *                   example: Successfully created or updated practice progress
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: "user-789"
 *                     materialId:
 *                       type: string
 *                       example: "abc123-material-id"
 *                     isCompleted:
 *                       type: boolean
 *                       example: true
 *                     timeSpentSeconds:
 *                       type: number
 *                       example: 600
 *                     lastAccessed:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-07-01T10:30:00.000Z"
 *       400:
 *         description: Validation Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid input data
 *       401:
 *         description: Unauthorized - Token tidak valid atau tidak ada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Forbidden - Tidak diizinkan mengakses practice ini
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized to create or update practice progress
 *       404:
 *         description: Practice material tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Practice material not found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
router.post(
  "/practice/progress",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(createOrUpdatePracticeProgressSchema),
  PracticeController.createOrUpdatePracticeProgressController
);

/**
 * @swagger
 * /api/practice/practice/progress/{id}:
 *   patch:
 *     summary: Memperbarui progress belajar berdasarkan ID
 *     tags: [Practices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID dari progress yang ingin diubah
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
 *               isCompleted:
 *                 type: boolean
 *                 example: true
 *               timeSpentSeconds:
 *                 type: number
 *                 example: 1200
 *               lastAccessed:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-07-01T10:00:00.000Z"
 *     responses:
 *       200:
 *         description: Practice progress updated successfully
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
 *                   example: Practice progress updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "progress-xyz"
 *                     userId:
 *                       type: string
 *                       example: "user-123"
 *                     materialId:
 *                       type: string
 *                       example: "material-456"
 *                     isCompleted:
 *                       type: boolean
 *                       example: true
 *                     timeSpentSeconds:
 *                       type: number
 *                       example: 1200
 *                     lastAccessed:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-07-01T10:00:00.000Z"
 *       400:
 *         description: Validation Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Request body is missing.
 *       401:
 *         description: Unauthorized - Token tidak valid atau tidak ada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Forbidden - Tidak memiliki izin mengubah progress ini
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: You are not authorized to update this progress.
 *       404:
 *         description: Progress tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Practice progress not found.
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
router.patch(
  "/practice/progress/:id",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(updatePracticeProgressSchema),
  PracticeController.updatePracticeProgressController
);

/**
 * @swagger
 * /api/practice/practice/progress:
 *   get:
 *     summary: Mengambil seluruh data progress practice
 *     tags: [Practices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           example: 10
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *           example: johndoe
 *     responses:
 *       200:
 *         description: Successfully retrieved practice progress list.
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
 *                   example: Successfully retrieved practice progress list.
 *                 data:
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
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "progress-abc123"
 *                           userId:
 *                             type: string
 *                             example: "user-xyz"
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "user-xyz"
 *                               fullName:
 *                                 type: string
 *                                 example: "John Doe"
 *                               email:
 *                                 type: string
 *                                 example: "john@example.com"
 *                           practiceMaterial:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "material-123"
 *                               title:
 *                                 type: string
 *                                 example: "Pengenalan React"
 *                               practice:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: string
 *                                     example: "practice-abc"
 *                                   title:
 *                                     type: string
 *                                     example: "Belajar Frontend"
 *                           isCompleted:
 *                             type: boolean
 *                             example: true
 *                           timeSpentSeconds:
 *                             type: number
 *                             example: 3600
 *                           lastAccessed:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-07-01T10:00:00.000Z"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-06-30T08:00:00.000Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-07-01T10:00:00.000Z"
 *       401:
 *         description: Unauthorized - Token tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Forbidden - Tidak memiliki akses sesuai role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: Invalid role"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
router.get(
  "/practice/progress",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(getAllPracticeProgressSchema),
  PracticeController.getAllPracticeProgressController
);

/**
 * @swagger
 * /api/practice/practice/progress/{id}:
 *   get:
 *     summary: Mengambil detail progress berdasarkan ID
 *     tags: [Practices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID progress practice
 *     responses:
 *       200:
 *         description: Successfully retrieved practice progress
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
 *                   example: Successfully retrieved practice progress.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "progress-abc123"
 *                     userId:
 *                       type: string
 *                       example: "user-xyz"
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "user-xyz"
 *                         fullName:
 *                           type: string
 *                           example: "John Doe"
 *                         email:
 *                           type: string
 *                           example: "john@example.com"
 *                     practiceMaterial:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "material-456"
 *                         title:
 *                           type: string
 *                           example: "Dasar Frontend"
 *                         practice:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               example: "practice-abc"
 *                             title:
 *                               type: string
 *                               example: "Belajar React"
 *                             mentorId:
 *                               type: string
 *                               example: "mentor-123"
 *                     isCompleted:
 *                       type: boolean
 *                       example: true
 *                     timeSpentSeconds:
 *                       type: number
 *                       example: 5400
 *                     lastAccessed:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-07-01T12:30:00.000Z"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-30T10:00:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-07-01T12:30:00.000Z"
 *       401:
 *         description: Unauthorized - Token tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Forbidden - Tidak punya akses ke data ini
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: You can only view your own progress"
 *       404:
 *         description: Practice progress not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Practice progress not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
router.get(
  "/practice/progress/:id",
  authenticate,
  authorizeRoles("admin", "mentee", "mentor"),
  validate(getPracticeProgressByIdSchema),
  PracticeController.getPracticeProgressByIdController
);

/**
 * @swagger
 * /api/practice/practice/progress/{id}:
 *   delete:
 *     summary: Menghapus progress practice berdasarkan ID (hanya admin)
 *     tags: [Practices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID progress practice
 *     responses:
 *       200:
 *         description: Practice progress deleted successfully
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
 *                   example: Practice progress deleted successfully.
 *       401:
 *         description: Unauthorized - Tidak ada token atau token tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Forbidden - Bukan admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: Only admins can delete practice progress"
 *       404:
 *         description: Practice progress tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Practice progress not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
router.delete(
  "/practice/progress/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(deletePracticeProgressSchema),
  PracticeController.deletePracticeProgressController
);

// Practice Review
/**
 * @swagger
 * /api/practice/practice/reviews:
 *   post:
 *     summary: Mentee membuat review untuk practice
 *     tags: [Practices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - practiceId
 *               - rating
 *             properties:
 *               practiceId:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Practice review created successfully.
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
 *                   example: Practice review created successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     practiceId:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     rating:
 *                       type: number
 *                       example: 5
 *                     comment:
 *                       type: string
 *                       nullable: true
 *                     submittedDate:
 *                       type: string
 *                       format: date-time
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         fullName:
 *                           type: string
 *                         email:
 *                           type: string
 *                     practice:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         title:
 *                           type: string
 *       400:
 *         description: "Bad Request (contoh: sudah pernah review, belum beli, atau practice tidak ditemukan)"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: You have already reviewed this practice
 *       401:
 *         description: Unauthorized - Token tidak valid atau tidak diberikan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Forbidden - Hanya mentee yang bisa membuat review
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: Only mentees can create reviews"
 *       500:
 *         description: Internal Server Error - Terjadi kesalahan pada server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
router.post(
  "/practice/reviews",
  authenticate,
  authorizeRoles("mentee"), // Hanya mentee yang diizinkan
  validate(createPracticeReviewSchema),
  PracticeController.createPracticeReviewController
);

/**
 * @swagger
 * /api/practice/practice/reviews/{id}:
 *   patch:
 *     summary: Mentee memperbarui komentar pada review mereka
 *     tags: [Practices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID review
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Practice review updated successfully.
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
 *                   example: Practice review updated successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     practiceId:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     rating:
 *                       type: number
 *                     comment:
 *                       type: string
 *                     submittedDate:
 *                       type: string
 *                       format: date-time
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         fullName:
 *                           type: string
 *                         email:
 *                           type: string
 *                     practice:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         title:
 *                           type: string
 *       400:
 *         description: "Bad Request (misal: request body tidak valid)"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Validation error
 *       401:
 *         description: Unauthorized - Token tidak valid atau tidak dikirim
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Forbidden - Hanya mentee yang bisa update review mereka sendiri
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: You can only update your own review"
 *       404:
 *         description: Review tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Review not found
 *       500:
 *         description: Internal Server Error - Terjadi kesalahan di sisi server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
router.patch(
  "/practice/reviews/:id",
  authenticate,
  authorizeRoles("mentee"),
  validate(updatePracticeReviewSchema),
  PracticeController.updatePracticeReviewController
);

/**
 * @swagger
 * /api/practice/users/practice-reviews/{id}:
 *   get:
 *     summary: Mentee melihat seluruh review yang mereka buat
 *     tags: [Practices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID user mentee (harus sama dengan ID dari token)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Halaman saat ini
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah data per halaman
 *     responses:
 *       200:
 *         description: Daftar review untuk user tertentu
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
 *                   example: Successfully retrieved user practice reviews.
 *                 data:
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
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           practiceId:
 *                             type: string
 *                           userId:
 *                             type: string
 *                           rating:
 *                             type: number
 *                           comment:
 *                             type: string
 *                           submittedDate:
 *                             type: string
 *                             format: date-time
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               fullName:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                           practice:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               title:
 *                                 type: string
 *       400:
 *         description: Request tidak valid (misal parameter tidak sesuai)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Validation error
 *       401:
 *         description: Token tidak valid atau tidak dikirim
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Tidak diizinkan mengakses review user lain
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: You can only view your own reviews"
 *       500:
 *         description: Terjadi kesalahan di server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
router.get(
  "/users/practice-reviews/:id",
  authenticate,
  authorizeRoles("mentee"),
  validate(getUserPracticeReviewsSchema),
  PracticeController.getUserPracticeReviewsController
);

/**
 * @swagger
 * /api/practice/practices-reviews/{id}:
 *   get:
 *     summary: Mentee melihat review untuk sebuah practice
 *     tags: [Practices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Practice ID yang ingin dilihat review-nya
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Halaman saat ini
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah item per halaman
 *     responses:
 *       200:
 *         description: Daftar review untuk practice
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
 *                   example: Successfully retrieved practice reviews.
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 14
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 2
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           practiceId:
 *                             type: string
 *                           userId:
 *                             type: string
 *                           rating:
 *                             type: number
 *                           comment:
 *                             type: string
 *                           submittedDate:
 *                             type: string
 *                             format: date-time
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               fullName:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                           practice:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               title:
 *                                 type: string
 *       400:
 *         description: Request tidak valid (parameter tidak sesuai atau praktik tidak ditemukan)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Practice not found
 *       401:
 *         description: Token tidak valid atau tidak disediakan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: User tidak punya akses melihat review practice
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: Only mentees can view practice reviews"
 *       500:
 *         description: Kesalahan internal server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
router.get(
  "/practices-reviews/:id",
  authenticate,
  authorizeRoles("mentee"),
  validate(getPracticeReviewsSchema),
  PracticeController.getPracticeReviewsController
);

/**
 * @swagger
 * /api/practice/admin/practice-reviews/{id}:
 *   patch:
 *     summary: Admin memperbarui komentar atau rating review
 *     tags: [Practices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dari review yang ingin diperbarui
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review diperbarui oleh admin
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
 *                   example: Practice review updated successfully by admin.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     practiceId:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     rating:
 *                       type: number
 *                     comment:
 *                       type: string
 *                     submittedDate:
 *                       type: string
 *                       format: date-time
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         fullName:
 *                           type: string
 *                         email:
 *                           type: string
 *                     practice:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         title:
 *                           type: string
 *       400:
 *         description: Request tidak valid atau review tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Review not found
 *       401:
 *         description: Token tidak valid atau belum login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Akses dilarang (bukan admin)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: Only admins can update reviews"
 *       500:
 *         description: Terjadi kesalahan server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
router.patch(
  "/admin/practice-reviews/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(updateAdminPracticeReviewSchema),
  PracticeController.updateAdminPracticeReviewController
);

/**
 * @swagger
 * /api/practice/admin/practice-reviews/{id}:
 *   delete:
 *     summary: Admin menghapus review practice
 *     tags: [Practices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dari review yang ingin dihapus
 *     responses:
 *       200:
 *         description: Review dihapus oleh admin
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
 *                   example: Practice review deleted successfully by admin.
 *       400:
 *         description: Request tidak valid atau review tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Review not found
 *       401:
 *         description: Token tidak valid atau belum login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Akses dilarang (bukan admin)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: Only admins can delete reviews"
 *       500:
 *         description: Terjadi kesalahan server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
router.delete(
  "/admin/practice-reviews/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(deleteAdminPracticeReviewSchema),
  PracticeController.deleteAdminPracticeReviewController
);

/**
 * @swagger
 * /api/practice/admin/practice-reviews:
 *   get:
 *     summary: Admin melihat semua review practice (dengan filter)
 *     tags: [Practices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Pencarian pada kolom komentar
 *       - in: query
 *         name: practiceId
 *         schema:
 *           type: string
 *         description: Filter berdasarkan practice ID
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter berdasarkan user ID
 *       - in: query
 *         name: rating
 *         schema:
 *           type: number
 *         description: Filter berdasarkan rating
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter tanggal mulai dari submittedDate
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter tanggal akhir dari submittedDate
 *     responses:
 *       200:
 *         description: Semua review practice berhasil diambil
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
 *                   example: Successfully retrieved all practice reviews.
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 100
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 10
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           rating:
 *                             type: number
 *                           comment:
 *                             type: string
 *                           submittedDate:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               fullName:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                           practice:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               title:
 *                                 type: string
 *       401:
 *         description: Unauthorized (token tidak valid)
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
 *                   example: "Unauthorized: Only admins can view all reviews"
 *       500:
 *         description: Terjadi kesalahan di server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
router.get(
  "/admin/practice-reviews",
  authenticate,
  authorizeRoles("admin"),
  validate(getAllAdminPracticeReviewsSchema),
  PracticeController.getAllAdminPracticeReviewsController
);

/**
 * @swagger
 * /api/practice/admin/practice-reviews/{id}:
 *   get:
 *     summary: Admin melihat detail review berdasarkan ID
 *     tags: [Practices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Detail review practice berhasil diambil
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
 *                   example: Successfully retrieved practice review.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     rating:
 *                       type: number
 *                     comment:
 *                       type: string
 *                     submittedDate:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         fullName:
 *                           type: string
 *                         email:
 *                           type: string
 *                     practice:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         title:
 *                           type: string
 *       401:
 *         description: Unauthorized (token tidak valid atau belum login)
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
 *                   example: "Unauthorized: Only admins can view review details"
 *       404:
 *         description: Review tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Review not found
 *       500:
 *         description: Terjadi kesalahan server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
router.get(
  "/admin/practice-reviews/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(getAdminPracticeReviewByIdSchema),
  PracticeController.getAdminPracticeReviewByIdController
);

/**
 * @swagger
 * /api/practice/admin/practice-reviews-export:
 *   get:
 *     summary: Admin mengekspor semua review practice (CSV/Excel)
 *     tags: [Practices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         required: true
 *         schema:
 *           type: string
 *           enum: [csv, excel]
 *         description: Format file yang diinginkan
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: practiceId
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: rating
 *         schema:
 *           type: number
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: File export berhasil dikirim
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Format file tidak valid atau query tidak sesuai
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Format harus csv atau excel
 *       401:
 *         description: Unauthorized (token tidak valid atau belum login)
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
 *                   example: "Unauthorized: Only admins can export reviews"
 *       500:
 *         description: Terjadi kesalahan server saat ekspor file
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
router.get(
  "/admin/practice-reviews-export",
  authenticate,
  authorizeRoles("admin"),
  validate(exportAdminPracticeReviewsSchema),
  PracticeController.exportAdminPracticeReviewsController
);

export default router;