import express from "express";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRole.js";
import {
  createQuizSchema,
  updateQuizSchema,
  quizParamSchema,
  getQuizBySubBabSchema,
  getQuizByIdSchema,
  deleteQuizSchema,
  getAllQuizSchema,
  getQuizzesByCourseSchema,
  exportQuizSchema,
} from "../validations/elearning_quiz.validation.js";
import { ELearningQuizController } from "../controllers/elearning_quiz.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: E-Learning Quizzes
 *   description: Manajemen kuis untuk sub-bab e-learning
 */

/**
 * @swagger
 * /api/elearningQuiz/quiz/{subBabId}:
 *   post:
 *     summary: Buat quiz untuk sub-bab
 *     description: Admin dapat membuat quiz untuk sub-bab mana pun. Mentor hanya bisa membuat quiz untuk course yang dia ampu.
 *     tags: [E-Learning Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subBabId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID sub-bab tempat quiz akan dibuat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Kuis Bab 1 - Pengenalan AI"
 *               description:
 *                 type: string
 *                 example: "Kuis ini menguji pemahaman dasar tentang AI."
 *               timeLimitMinutes:
 *                 type: integer
 *                 example: 30
 *     responses:
 *       201:
 *         description: Quiz berhasil dibuat
 *       400:
 *         description: Data tidak valid
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Sub-bab tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.post(
  "/quiz/:subBabId",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(createQuizSchema),
  ELearningQuizController.createQuiz
);

/**
 * @swagger
 * /api/elearningQuiz/subbabs/{subBabId}/quiz:
 *   get:
 *     summary: Ambil quiz dari sub-bab
 *     description:
 *       Admin dapat mengambil quiz dari sub-bab mana pun.
 *       Mentor hanya bisa mengambil quiz dari course yang dia ampu.
 *       Mentee hanya bisa mengambil quiz dari course yang sudah dia beli.
 *     tags: [E-Learning Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subBabId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID sub-bab
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Cari berdasarkan judul quiz
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, createdAt, updatedAt]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
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
 *         description: Quiz ditemukan
 *       400:
 *         description: Parameter tidak valid
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Quiz tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.get(
  "/subbabs/:subBabId/quiz",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(getQuizBySubBabSchema),
  ELearningQuizController.getQuizBySubBab
);

/**
 * @swagger
 * /api/elearningQuiz/quiz/{id}:
 *   get:
 *     summary: Ambil quiz berdasarkan ID
 *     description: >
 *       Admin dapat mengambil quiz mana pun.
 *       Mentor hanya dapat mengambil quiz dari course yang dia ampu.
 *       Mentee hanya dapat mengambil quiz dari course yang sudah dia beli.
 *     tags: [E-Learning Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID quiz yang ingin diambil
 *     responses:
 *       200:
 *         description: Quiz ditemukan
 *       400:
 *         description: Data tidak valid
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Quiz tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.get(
  "/quiz/:id",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(getQuizByIdSchema),
  ELearningQuizController.getQuizById
);

/**
 * @swagger
 * /api/elearningQuiz/quizzes/{id}:
 *   put:
 *     summary: Update quiz
 *     description: >
 *       Admin dapat memperbarui quiz mana pun.
 *       Mentor hanya dapat memperbarui quiz yang berasal dari course yang dia ampu.
 *       Field `totalQuestions` tidak dapat diubah karena dihitung otomatis berdasarkan jumlah soal.
 *     tags: [E-Learning Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID quiz yang ingin diperbarui
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
 *                 example: "Kuis Bab 2 - Dasar Jaringan"
 *               description:
 *                 type: string
 *                 example: "Update deskripsi quiz"
 *               timeLimitMinutes:
 *                 type: integer
 *                 example: 45
 *     responses:
 *       200:
 *         description: Quiz berhasil diperbarui
 *       400:
 *         description: Data tidak valid
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Quiz tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.put(
  "/quizzes/:id",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(updateQuizSchema),
  ELearningQuizController.updateQuiz
);

/**
 * @swagger
 * /api/elearning/quizzes/{id}:
 *   delete:
 *     summary: Hapus quiz
 *     description: >
 *       Hanya **admin** yang dapat menghapus quiz.
 *       Saat quiz dihapus, seluruh pertanyaan (`ELearningQuestion`) dan attempt (`ELearningQuizAttempt`) terkait juga ikut terhapus (cascade).
 *     tags: [E-Learning Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID quiz yang akan dihapus
 *         schema:
 *           type: string
 *           example: "quiz-20251108-abc123"
 *     responses:
 *       200:
 *         description: Quiz berhasil dihapus
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
 *                   example: "Quiz berhasil dihapus"
 *       403:
 *         description: Akses ditolak (bukan admin)
 *       404:
 *         description: Quiz tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.delete(
  "/quizzes/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(deleteQuizSchema),
  ELearningQuizController.deleteQuiz
);

/**
 * @swagger
 * /api/elearningQuiz/all:
 *   get:
 *     summary: Ambil semua quiz (hanya admin)
 *     description: >
 *       Menampilkan daftar seluruh quiz dari semua sub-bab, termasuk relasi course dan mentor.
 *       Hanya admin yang dapat mengakses endpoint ini.
 *       Mendukung pagination, search, filter, dan sorting.
 *     tags: [E-Learning Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Cari berdasarkan judul quiz atau deskripsi
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, createdAt, updatedAt, totalQuestions]
 *           default: createdAt
 *         description: Urutkan berdasarkan kolom
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Urutan hasil (asc / desc)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Halaman ke-
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah item per halaman
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Filter berdasarkan ID course
 *       - in: query
 *         name: mentorId
 *         schema:
 *           type: string
 *         description: Filter berdasarkan mentor tertentu
 *     responses:
 *       200:
 *         description: Daftar quiz ditemukan
 *       400:
 *         description: Parameter tidak valid
 *       403:
 *         description: Akses ditolak (bukan admin)
 *       500:
 *         description: Kesalahan server
 */
router.get(
  "/all",
  authenticate,
  authorizeRoles("admin"),
  validate(getAllQuizSchema),
  ELearningQuizController.getAllQuizzes
);

/**
 * @swagger
 * /api/elearningQuiz/course/{courseId}:
 *   get:
 *     summary: Ambil semua quiz berdasarkan course (khusus admin & mentor)
 *     description:
 *       Admin dapat melihat semua quiz dari course mana pun.
 *       Mentor hanya dapat melihat quiz dari course yang dia ampu.
 *     tags: [E-Learning Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID course target
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
 *           example: "AI"
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           example: "createdAt"
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           example: "desc"
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan daftar quiz berdasarkan course
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
 *                   example: "Daftar quiz berhasil diambil"
 *                 pagination:
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
 *                       totalQuestions:
 *                         type: integer
 *                       timeLimitMinutes:
 *                         type: integer
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 */
router.get(
  "/course/:courseId",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(getQuizzesByCourseSchema),
  ELearningQuizController.getQuizzesByCourse
);

/**
 * @swagger
 * /api/elearningquiz/exportQuiz:
 *   get:
 *     summary: Export data quiz ke Excel/CSV (Admin)
 *     description: >
 *       - Hanya **admin** yang dapat mengekspor data quiz.
 *       - Mendukung format **CSV** atau **Excel (.xlsx)**.
 *       - File hasil export otomatis diberi nama unik.
 *     tags: [E-Learning Quizzes]
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
  "/exportQuiz",
  authenticate,
  authorizeRoles("admin"),
  validate(exportQuizSchema),
  ELearningQuizController.exportQuizzes
);

export default router;
