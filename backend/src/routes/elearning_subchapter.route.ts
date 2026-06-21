import express from "express";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRole.js";
import { ELearningSubChapterController } from "../controllers/elearning_subchapter.controller.js";
import {
  createSubChapterSchema,
  getSubChaptersByCourseSchema,
  getSubChapterByIdSchema,
  updateSubChapterSchema,
  deleteSubChapterSchema,
  reorderSubChapterSchema,
  duplicateSubChapterSchema,
  listSubChaptersSchema,
  exportSubChaptersSchema,
  getSubChapterHistorySchema,
} from "../validations/elearning_subchapter.validation.js";
import { handleElearningThumbnailUpload } from "../middlewares/uploadImage.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: E-Learning SubChapters
 *   description: Manajemen E-Learning SubChapters (Bab)
 */

/**
 * @swagger
 * /api/elearningSubChapter/courses/{courseId}/subchapters:
 *   get:
 *     summary: List sub-chapter dari satu course
 *     description: >
 *       Admin dapat melihat semua course.
 *       Mentor hanya bisa melihat course yang dia ampu.
 *       Mentee hanya bisa melihat course yang sudah dibeli.
 *       Mendukung pagination, search, dan filter orderNumber.
 *     tags: [E-Learning SubChapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: courseId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID course
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Halaman pagination
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah item per halaman
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *         description: Keyword pencarian sub-chapter berdasarkan title
 *       - name: orderNumber
 *         in: query
 *         schema:
 *           type: integer
 *         description: Filter berdasarkan orderNumber tertentu
 *     responses:
 *       200:
 *         description: List subchapter berhasil diambil
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Course tidak ditemukan
 */
router.get(
  "/courses/:courseId/subchapters",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee", "cm", "curdev"),
  validate(getSubChaptersByCourseSchema),
  ELearningSubChapterController.getSubChaptersByCourse
);

/**
 * @swagger
 * /api/elearningSubChapter/subchapters/{id}:
 *   get:
 *     summary: Detail satu sub-chapter (beserta sub-bab)
 *     description: >
 *       - Admin dapat melihat semua sub-chapter dari course manapun.
 *       - Mentor hanya bisa melihat sub-chapter dari course yang dia ampu.
 *       - Mentee hanya bisa melihat jika sudah berlangganan/subscription.
 *     tags: [E-Learning SubChapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID sub-chapter
 *     responses:
 *       200:
 *         description: Detail sub-chapter berhasil diambil
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Sub-chapter tidak ditemukan
 */
router.get(
  "/subchapters/:id",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee", "cm", "curdev"),
  validate(getSubChapterByIdSchema),
  ELearningSubChapterController.getSubChapterById
);

/**
 * @swagger
 * /api/elearningSubChapter/courses/{courseId}/subchapters:
 *   post:
 *     summary: Tambah sub-chapter ke course
 *     tags: [E-Learning SubChapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: courseId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - orderNumber
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               orderNumber:
 *                 type: integer
 *               estimatedTime:
 *                 type: string
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Sub-chapter berhasil dibuat
 *       400:
 *         description: Request tidak valid
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Course tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.post(
  "/courses/:courseId/subchapters",
  authenticate,
  authorizeRoles("admin", "mentor", "cm", "curdev"),
  handleElearningThumbnailUpload("thumbnail", false), // ⬅️ SINGLE FILE
  validate(createSubChapterSchema),
  ELearningSubChapterController.createSubChapter
);

/**
 * @swagger
 * /api/elearningSubChapter/subchapters/{id}:
 *   put:
 *     summary: Edit sub-chapter
 *     tags: [E-Learning SubChapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               orderNumber:
 *                 type: integer
 *               estimatedTime:
 *                 type: string
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Sub-chapter berhasil diperbarui
 *       400:
 *         description: Request tidak valid
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Sub-chapter tidak ditemukan
 */
router.put(
  "/subchapters/:id",
  authenticate,
  authorizeRoles("admin", "mentor", "cm", "curdev"),
  handleElearningThumbnailUpload("thumbnail", false),
  validate(updateSubChapterSchema),
  ELearningSubChapterController.updateSubChapter
);

/**
 * @swagger
 * /api/elearningSubChapter/subchapters/{id}/duplicate:
 *   post:
 *     summary: Duplicate sub-chapter beserta sub-bab dan text
 *     tags: [E-Learning SubChapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Sub-chapter berhasil diduplikasi
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Sub-chapter tidak ditemukan
 */
router.post(
  "/subchapters/:id/duplicate",
  authenticate,
  authorizeRoles("admin", "mentor", "cm", "curdev"),
  validate(duplicateSubChapterSchema),
  ELearningSubChapterController.duplicateSubChapter
);

/**
 * @swagger
 * /api/elearningSubChapter/subchapters/{id}:
 *   delete:
 *     summary: Hapus sub-chapter
 *     description: >
 *       - Hanya **admin** yang dapat menghapus sub-chapter.
 *       - Jika sub-chapter yang dihapus berada di tengah, semua sub-chapter setelahnya akan bergeser ke depan agar urutan tetap berurutan.
 *     tags: [E-Learning SubChapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID sub-chapter yang akan dihapus
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sub-chapter berhasil dihapus
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Sub-chapter tidak ditemukan
 */
router.delete(
  "/subchapters/:id",
  authenticate,
  authorizeRoles("admin", "cm", "curdev"), // hanya admin yang boleh
  validate(deleteSubChapterSchema),
  ELearningSubChapterController.deleteSubChapter
);

/**
 * @swagger
 * /api/elearningSubChapter/courses/{courseId}/reorder:
 *   patch:
 *     summary: Reorder sub-chapters dalam satu course
 *     description: >
 *       - Hanya **admin** yang dapat mengubah urutan sub-chapter.
 *       - Mengatur ulang `orderNumber` semua sub-chapter berdasarkan urutan baru (drag & drop di UI).
 *     tags: [E-Learning SubChapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: courseId
 *         in: path
 *         required: true
 *         description: ID course tempat sub-chapter diubah urutannya
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newOrder:
 *                 type: array
 *                 description: Daftar ID sub-chapter dalam urutan baru
 *                 items:
 *                   type: string
 *             example:
 *               newOrder: ["SubCh1", "SubCh3", "SubCh2"]
 *     responses:
 *       200:
 *         description: Urutan sub-chapter berhasil diperbarui
 *       400:
 *         description: Data request tidak valid
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Course atau sub-chapter tidak ditemukan
 */
router.patch(
  "/courses/:courseId/reorder",
  authenticate,
  authorizeRoles("admin"),
  validate(reorderSubChapterSchema),
  ELearningSubChapterController.reorderSubChapters
);


/**
 * @swagger
 * /api/elearningSubChapter/subchaptersAdmin:
 *   get:
 *     summary: List semua sub-chapter (admin only)
 *     description: >
 *       - Endpoint ini hanya bisa diakses oleh **admin**.
 *       - Mendukung **pagination**, **search**, **filter berdasarkan courseId**, dan **sorting**.
 *     tags: [E-Learning SubChapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: search
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           example: "introduction"
 *       - name: courseId
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           example: "crs_abc123"
 *       - name: sortBy
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [title, orderNumber, createdAt]
 *           example: "createdAt"
 *       - name: sortOrder
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           example: "desc"
 *     responses:
 *       200:
 *         description: Daftar sub-chapter berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
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
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       courseId:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       orderNumber:
 *                         type: integer
 *                       estimatedTime:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       403:
 *         description: Akses ditolak
 */
router.get(
  "/subchaptersAdmin",
  authenticate,
  authorizeRoles("admin"),
  validate(listSubChaptersSchema),
  ELearningSubChapterController.listSubChapters
);

/**
 * @swagger
 * /api/elearningSubChapter/subchaptersExport:
 *   get:
 *     summary: Export data sub-chapter ke Excel/CSV (Admin)
 *     description: >
 *       - Endpoint ini hanya dapat diakses oleh **admin**.
 *       - Mendukung export data ke format **CSV** atau **Excel (.xlsx)**.
 *       - File hasil export akan otomatis diberi nama unik.
 *     tags: [E-Learning SubChapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: format
 *         in: query
 *         required: true
 *         description: Format file yang akan diexport
 *         schema:
 *           type: string
 *           enum: [csv, excel]
 *           default: csv
 *           example: excel
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
 *       403:
 *         description: Akses ditolak (bukan admin)
 */
router.get(
  "/subchaptersExport",
  authenticate,
  authorizeRoles("admin"),
  validate(exportSubChaptersSchema),
  ELearningSubChapterController.exportSubChapters
);

/**
 * @swagger
 * /api/elearningSubChapter/subchapters/{id}/history:
 *   get:
 *     summary: Riwayat perubahan (audit log) satu sub-chapter
 *     description: >
 *       - Admin/CM/Curdev dapat melihat riwayat sub-chapter dari course manapun.
 *       - Mentor hanya bisa melihat riwayat sub-chapter dari course yang dia ampu.
 *     tags: [E-Learning SubChapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID sub-chapter
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Riwayat perubahan berhasil diambil
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Sub-chapter tidak ditemukan
 */
router.get(
  "/subchapters/:id/history",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee", "cm", "curdev"),
  validate(getSubChapterHistorySchema),
  ELearningSubChapterController.getSubChapterHistory
);

export default router;
