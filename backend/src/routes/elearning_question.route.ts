import express from "express";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRole.js";
import {
  createQuestionSchema,
  getQuestionsByQuizSchema,
  getQuestionByIdSchema,
  updateQuestionSchema,
  deleteQuestionSchema,
  duplicateQuestionSchema,
  globalViewQuestionSchema,
  exportQuestionSchema,
} from "../validations/elearning_question.validation.js";
import { ELearningQuestionController } from "../controllers/elearning_question.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: E-Learning Questions
 *   description: API untuk mengelola pertanyaan quiz
 */

/**
 * @swagger
 * /api/elearningQuestion/quizzes/{id}/questions:
 *   post:
 *     summary: Tambah pertanyaan ke quiz
 *     description: |
 *       Admin dan mentor dapat menambahkan pertanyaan ke quiz tertentu.
 *       
 *       - **Admin**: dapat menambah pertanyaan ke quiz mana pun.
 *       - **Mentor**: hanya dapat menambah pertanyaan ke quiz dari course yang dia ampu.
 *     tags: [E-Learning Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID quiz
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questionText
 *               - options
 *               - correctAnswer
 *             properties:
 *               questionText:
 *                 type: string
 *                 example: "Apa kepanjangan dari AI?"
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Artificial Intelligence", "Automated Input", "Auto Increment"]
 *               correctAnswer:
 *                 type: string
 *                 example: "Artificial Intelligence"
 *               explanation:
 *                 type: string
 *                 example: "AI adalah singkatan dari Artificial Intelligence."
 *     responses:
 *       201:
 *         description: Pertanyaan berhasil dibuat
 *       400:
 *         description: Data tidak valid atau correctAnswer tidak termasuk dalam opsi
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Quiz tidak ditemukan
 */
router.post(
  "/quizzes/:id/questions",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(createQuestionSchema),
  ELearningQuestionController.createQuestion
);

/**
 * @swagger
 * /api/elearningQuestion/quizzes/{id}/questions:
 *   get:
 *     summary: Ambil semua pertanyaan dari quiz
 *     description: |
 *       Endpoint untuk mengambil daftar pertanyaan berdasarkan quiz tertentu.
 *       
 *       - **Admin**: dapat melihat semua pertanyaan dari quiz mana pun.
 *       - **Mentor**: hanya dapat melihat pertanyaan dari quiz di course yang dia ampu.
 *       - **Mentee**: hanya dapat melihat pertanyaan dari quiz dari course yang dia beli.
 *     tags: [E-Learning Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID quiz
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
 *         description: Cari berdasarkan teks pertanyaan
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, orderNumber]
 *           default: orderNumber
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *     responses:
 *       200:
 *         description: Daftar pertanyaan berhasil diambil
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Quiz tidak ditemukan
 */
router.get(
  "/quizzes/:id/questions",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(getQuestionsByQuizSchema),
  ELearningQuestionController.getQuestionsByQuiz
);

/**
 * @swagger
 * /api/elearningQuestion/questions/{id}:
 *   get:
 *     summary: Ambil pertanyaan berdasarkan ID
 *     description: |
 *       Endpoint untuk mengambil detail satu pertanyaan dari quiz.
 *       - **Admin**: dapat mengakses semua pertanyaan.
 *       - **Mentor**: hanya dapat mengakses pertanyaan dari quiz di course yang dia ampu.
 *       - **Mentee**: hanya dapat mengakses pertanyaan dari quiz dari course yang dia beli.
 *     tags: [E-Learning Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID pertanyaan
 *     responses:
 *       200:
 *         description: Detail pertanyaan berhasil diambil
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Pertanyaan tidak ditemukan
 */
router.get(
  "/questions/:id",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(getQuestionByIdSchema),
  ELearningQuestionController.getQuestionById
);

/**
 * @swagger
 * /api/elearningQuestion/questions/{id}:
 *   put:
 *     summary: Edit pertanyaan quiz
 *     description: |
 *       Update data pertanyaan. Partial update diizinkan.
 *       - **Admin**: dapat mengedit pertanyaan mana pun.
 *       - **Mentor**: hanya dapat mengedit pertanyaan dari quiz pada course yang dia ampu.
 *       Logika orderNumber merapikan otomatis agar tidak ada duplikat.
 *     tags: [E-Learning Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID pertanyaan
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               questionText:
 *                 type: string
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *               correctAnswer:
 *                 type: string
 *               explanation:
 *                 type: string
 *               orderNumber:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Pertanyaan berhasil diperbarui
 *       400:
 *         description: Data tidak valid
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Pertanyaan tidak ditemukan
 */
router.put(
  "/questions/:id",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(updateQuestionSchema),
  ELearningQuestionController.updateQuestion
);

/**
 * @swagger
 * /api/elearningQuestion/questions/{id}:
 *   delete:
 *     summary: Hapus pertanyaan quiz
 *     description: |
 *       Menghapus pertanyaan tertentu berdasarkan ID.
 *       - **Hanya Admin** yang dapat menghapus pertanyaan.
 *       Setelah penghapusan, sistem akan:
 *       1. Mengurangi total pertanyaan di quiz terkait (`totalQuestions - 1`).
 *       2. Menormalkan ulang `orderNumber` semua pertanyaan dalam quiz agar tetap berurutan.
 *     tags: [E-Learning Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID pertanyaan yang ingin dihapus
 *     responses:
 *       200:
 *         description: Pertanyaan berhasil dihapus
 *       403:
 *         description: Akses ditolak — hanya admin
 *       404:
 *         description: Pertanyaan tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan pada server
 */
router.delete(
  "/questions/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(deleteQuestionSchema),
  ELearningQuestionController.deleteQuestion
);

/**
 * @swagger
 * /api/elearningQuestion/questions/{id}/duplicate:
 *   post:
 *     summary: Duplikasi pertanyaan ke quiz lain
 *     description: |
 *       Menyalin pertanyaan dari satu quiz ke quiz lain.
 *       - Hanya **Admin** yang dapat melakukan duplikasi.
 *       - Order number di quiz tujuan otomatis disusun berurutan.
 *     tags: [E-Learning Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID pertanyaan yang akan diduplikasi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [targetQuizId]
 *             properties:
 *               targetQuizId:
 *                 type: string
 *                 description: ID quiz tujuan duplikasi
 *     responses:
 *       201:
 *         description: Pertanyaan berhasil diduplikasi
 *       400:
 *         description: Data tidak valid
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Pertanyaan atau quiz tidak ditemukan
 */
router.post(
  "/questions/:id/duplicate",
  authenticate,
  authorizeRoles("admin"),
  validate(duplicateQuestionSchema),
  ELearningQuestionController.duplicateQuestion
);

/**
 * @swagger
 * /api/elearningQuestion/search:
 *   get:
 *     summary: Lihat semua pertanyaan (global) untuk Admin
 *     description: |
 *       Menampilkan daftar semua pertanyaan dari seluruh quiz.
 *       - Hanya **Admin** yang dapat mengakses.
 *       - Mendukung pagination, sorting, filter, dan search.
 *     tags: [E-Learning Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Nomor halaman
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah data per halaman
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, questionText, orderNumber]
 *           default: createdAt
 *         description: Kolom untuk sorting
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Urutan sorting
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Kata kunci pencarian (berdasarkan teks pertanyaan)
 *       - in: query
 *         name: quizId
 *         schema:
 *           type: string
 *         description: Filter berdasarkan quizId tertentu
 *     responses:
 *       200:
 *         description: Daftar pertanyaan berhasil diambil
 *       403:
 *         description: Akses ditolak
 */
router.get(
  "/search",
  authenticate,
  authorizeRoles("admin"),
  validate(globalViewQuestionSchema),
  ELearningQuestionController.globalViewQuestions
);

/**
 * @swagger
 * /api/elearningQuestion/exportQuestions:
 *   get:
 *     summary: Export data pertanyaan ke Excel/CSV (Admin)
 *     description: >
 *       - Hanya **admin** yang dapat mengekspor data pertanyaan.
 *       - Mendukung format **CSV** atau **Excel (.xlsx)**.
 *       - File hasil export otomatis diberi nama unik.
 *     tags: [E-Learning Questions]
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
  "/exportQuestions",
  authenticate,
  authorizeRoles("admin"),
  validate(exportQuestionSchema),
  ELearningQuestionController.exportQuestions
);

export default router;
