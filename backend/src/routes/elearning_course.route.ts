import express from "express";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRole.js";
import { ELearningCourseController } from "../controllers/elearning_course.controller.js";
import {
  createCourseSchema,
  updateCourseSchema,
  toggleStatusSchema,
  getAllCoursesSchema,
  getCourseByIdSchema,
  deleteCourseSchema,
  getCoursesSchema,
  getCourseDetailSchema,
  getCourseStatisticsSchema,
  exportCoursesSchema,
  exportProductEventSchema,
  duplicateCourseSchema,
} from "../validations/elearning_course.validation.js";
import { handleElearningThumbnailUpload } from "../middlewares/uploadImage.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: E-Learning Courses
 *   description: Manajemen E-Learning Courses
 */

/**
 * @swagger
 * /api/elearningCourse/courses:
 *   get:
 *     summary: Mendapatkan daftar semua kursus e-learning (dengan filter & role-based access)
 *     tags: [E-Learning Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: category
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter berdasarkan kategori kursus
 *       - name: level
 *         in: query
 *         schema:
 *           type: string
 *           enum: [Beginner, Intermediate, Advanced]
 *         description: Filter berdasarkan level kursus
 *       - name: mentorId
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter berdasarkan mentor ID
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *         description: Pencarian berdasarkan judul atau deskripsi
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Nomor halaman untuk pagination
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah data per halaman
 *       - name: sortBy
 *         in: query
 *         schema:
 *           type: string
 *           enum: [createdAt, title, price]
 *           default: createdAt
 *         description: Kolom untuk sorting
 *       - name: order
 *         in: query
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Urutan sorting
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan daftar kursus
 *       403:
 *         description: Akses ditolak
 *       500:
 *         description: Kesalahan server
 */
router.get(
  "/courses",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee", "cm", "curdev"),
  validate(getAllCoursesSchema),
  ELearningCourseController.getAllCourses
);

/**
 * @swagger
 * /api/elearningCourse/courses/{id}:
 *   get:
 *     summary: Mendapatkan detail kursus (beserta sub-chapter dan info mentor)
 *     tags: [E-Learning Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID kursus yang ingin diambil
 *     responses:
 *       200:
 *         description: Detail kursus berhasil diambil
 *       403:
 *         description: Akses ditolak (tidak memiliki izin melihat kursus ini)
 *       404:
 *         description: Kursus tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.get(
  "/courses/:id",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee", "cm", "curdev"),
  validate(getCourseByIdSchema),
  ELearningCourseController.getCourseById
);

/**
 * @swagger
 * /api/elearningCourse/courses:
 *   post:
 *     summary: Admin membuat kursus e-learning baru
 *     tags: [E-Learning Courses]
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
 *                 example: "Dasar Pemrograman JavaScript"
 *               description:
 *                 type: string
 *                 example: "Pelajari dasar-dasar JavaScript dari nol"
 *               thumbnailImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               price:
 *                 type: number
 *                 example: 150000
 *               category:
 *                 type: string
 *                 example: "Programming"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               targetAudience:
 *                 type: string
 *                 example: "Pemula di bidang pemrograman"
 *               level:
 *                 type: string
 *                 example: "Beginner"
 *               estimatedDuration:
 *                 type: string
 *                 example: "6 jam"
 *               benefits:
 *                 type: string
 *                 example: "Mendapatkan sertifikat dan akses materi seumur hidup"
 *               toolsUsed:
 *                 type: string
 *                 example: "VSCode, Node.js"
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Kursus berhasil dibuat
 *       400:
 *         description: Request tidak valid
 *       403:
 *         description: Hanya admin yang dapat membuat kursus
 *       500:
 *         description: Kesalahan server
 */
router.post(
  "/courses",
  authenticate,
  authorizeRoles("admin", "cm", "curdev"),
  handleElearningThumbnailUpload("thumbnailImages", true),
  validate(createCourseSchema),
  ELearningCourseController.createCourse
);

/**
 * @swagger
 * /api/elearningCourse/courses/{id}:
 *   put:
 *     summary: Memperbarui data kursus e-learning
 *     description: Hanya admin atau mentor pemilik kursus yang dapat mengubah data kursus. Admin dapat mengubah semua kolom termasuk mentorId.
 *     tags: [E-Learning Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID kursus yang ingin diperbarui
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               mentorId:
 *                 type: string
 *                 example: "mentor-uuid-001"
 *               title:
 *                 type: string
 *                 example: "Pemrograman Python untuk Data Science"
 *               description:
 *                 type: string
 *                 example: "Kursus Python lanjutan dengan fokus pada analisis data."
 *               thumbnailImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               price:
 *                 type: number
 *                 example: 200000
 *               category:
 *                 type: string
 *                 example: "Data Science"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["python", "pandas", "data-analysis"]
 *               targetAudience:
 *                 type: string
 *                 example: "Pemula dan menengah di bidang analisis data"
 *               level:
 *                 type: string
 *                 example: "Intermediate"
 *               estimatedDuration:
 *                 type: string
 *                 example: "8 jam"
 *               benefits:
 *                 type: string
 *                 example: "Akses selamanya dan sertifikat kelulusan"
 *               toolsUsed:
 *                 type: string
 *                 example: "Python, Jupyter Notebook"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Kursus berhasil diperbarui
 *       400:
 *         description: Data tidak valid
 *       403:
 *         description: Akses ditolak (bukan pemilik kursus atau role tidak valid)
 *       404:
 *         description: Kursus tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.put(
  "/courses/:id",
  authenticate,
  authorizeRoles("admin", "mentor", "cm", "curdev"),
  handleElearningThumbnailUpload("thumbnailImages", true),
  validate(updateCourseSchema),
  ELearningCourseController.updateCourse
);

/**
 * @swagger
 * /api/elearningCourse/courses/{id}/status:
 *   patch:
 *     summary: Mengaktifkan atau menonaktifkan kursus
 *     tags: [E-Learning Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID kursus yang ingin diubah statusnya
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 description: Status kursus, true = aktif, false = nonaktif
 *             required:
 *               - isActive
 *     responses:
 *       200:
 *         description: Status kursus berhasil diperbarui
 *       403:
 *         description: Akses ditolak (hanya admin yang bisa toggle status)
 *       404:
 *         description: Kursus tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.patch(
  "/courses/:id/status",
  authenticate,
  authorizeRoles("admin", "cm", "curdev"),
  validate(toggleStatusSchema),
  ELearningCourseController.toggleStatus
);

/**
 * @swagger
 * /api/elearningCourse/courses/{id}:
 *   delete:
 *     summary: Menghapus kursus
 *     tags: [E-Learning Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID kursus yang ingin dihapus
 *     responses:
 *       200:
 *         description: Kursus berhasil dihapus
 *       403:
 *         description: Akses ditolak (hanya admin yang bisa menghapus)
 *       404:
 *         description: Kursus tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.delete(
  "/courses/:id",
  authenticate,
  authorizeRoles("admin", "cm", "curdev"),
  validate(deleteCourseSchema),
  ELearningCourseController.deleteCourse
);

/**
 * @swagger
 * /api/elearningCourse/publicCourses:
 *   get:
 *     summary: Mendapatkan daftar semua kursus (public)
 *     tags: [E-Learning Courses]
 *     parameters:
 *       - name: category
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter berdasarkan kategori
 *       - name: level
 *         in: query
 *         schema:
 *           type: string
 *           enum: [Beginner, Intermediate, Advanced]
 *         description: Filter berdasarkan level
 *       - name: mentorId
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter berdasarkan mentor
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *         description: Kata kunci untuk pencarian (title, description)
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Nomor halaman untuk pagination
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah item per halaman
 *     responses:
 *       200:
 *         description: Daftar kursus berhasil diambil
 *       500:
 *         description: Kesalahan server
 */
router.get(
  "/publicCourses",
  validate(getCoursesSchema),
  ELearningCourseController.listCourses
);

/**
 * @swagger
 * /api/elearningCourse/publicCourses/{id}:
 *   get:
 *     summary: Mendapatkan detail kursus (public)
 *     tags: [E-Learning Courses]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID kursus yang ingin diambil detailnya
 *     responses:
 *       200:
 *         description: Detail kursus berhasil diambil
 *       404:
 *         description: Kursus tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.get(
  "/publicCourses/:id",
  validate(getCourseDetailSchema),
  ELearningCourseController.getCourseDetail
);

/**
 * @swagger
 * /api/elearningCourse/courses/{id}/statistics:
 *   get:
 *     summary: Mendapatkan statistik kursus (jumlah pembeli, rating, progress rata-rata)
 *     tags: [E-Learning Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID kursus
 *     responses:
 *       200:
 *         description: Statistik kursus berhasil diambil
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Kursus tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.get(
  "/courses/:id/statistics",
  authenticate,
  authorizeRoles("mentor", "admin"),
  validate(getCourseStatisticsSchema),
  ELearningCourseController.getCourseStatistics
);

/**
 * @swagger
 * /api/elearningCourse/coursesExport:
 *   get:
 *     summary: Export data course ke Excel/CSV (Admin)
 *     tags: [ELearningCourse]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: format
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           enum: [csv, excel]
 *           default: csv
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
  "/coursesExport",
  authenticate,
  authorizeRoles("admin"),
  validate(exportCoursesSchema),
  ELearningCourseController.exportCourses
);

/**
 * @swagger
 * /api/elearningCourse/exportProductEvent:
 *   get:
 *     summary: Export data produk & event (Mentoring & E-Learning)
 *     tags: [ProductEvent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: format
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           enum: [csv, excel]
 *           default: csv
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
 *       500:
 *         description: Server error
 */
router.get(
  "/exportProductEvent",
  authenticate,
  authorizeRoles("admin", "cm", "curdev"),
  validate(exportProductEventSchema),
  ELearningCourseController.exportProductEvent
);

/**
 * @swagger
 * /api/elearningCourse/courses/{id}/duplicate:
 *   post:
 *     summary: Duplicate kursus e-learning beserta seluruh isinya
 *     tags: [E-Learning Courses]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/courses/:id/duplicate",
  authenticate,
  authorizeRoles("admin", "mentor", "cm", "curdev"),
  validate(duplicateCourseSchema),
  ELearningCourseController.duplicateCourse
);


export default router;
