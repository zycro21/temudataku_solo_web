import express from "express";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRole.js";
import {
  startQuizAttemptSchema,
  getMyQuizAttemptSchema,
  gradeQuizAttemptSchema,
  getAllQuizAttemptsSchema,
  getQuizAttemptByIdSchema,
  deleteQuizAttemptSchema,
  quizAttemptSummarySchema,
  quizAttemptHistorySchema,
  exportQuizAttemptSchema,
} from "../validations/elearning_quiz_attempt.validation.js";
import { ELearningQuizAttemptController } from "../controllers/elearning_quiz_attempt.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: E-Learning Quiz Attempts
 *   description: Manajemen pengerjaan dan penilaian quiz
 */

/**
 * @swagger
 * /api/elearningQuizAttempt/quizzes/{id}/attempts:
 *   post:
 *     summary: Mulai atau kirim attempt quiz
 *     description: |
 *       Endpoint untuk memulai atau mengirim jawaban quiz.
 *       - Dapat diakses oleh **Admin**, **Mentor**, dan **Mentee**.
 *       - Jika role Mentee, sistem akan memastikan bahwa user telah **membeli course** yang terkait dengan quiz tersebut.
 *       - Jawaban akan langsung dinilai otomatis berdasarkan kunci jawaban (`correctAnswer`).
 *       - Nilai maksimum 100. Contoh: jika ada 5 soal dan 3 benar, skor = 60.
 *     tags: [E-Learning Quiz Attempts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID quiz yang ingin dikerjakan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - answers
 *             properties:
 *               answers:
 *                 type: object
 *                 description: "Object berisi jawaban mentee dengan format seperti: { questionId: 'jawaban' }"
 *                 additionalProperties:
 *                   type: string
 *                 example:
 *                   "question-20250101-abc123": "A"
 *                   "question-20250101-def456": "B"
 *     responses:
 *       201:
 *         description: Attempt berhasil dikirim dan dinilai otomatis
 *       400:
 *         description: Data tidak valid atau mentee belum membeli course
 *       404:
 *         description: Quiz tidak ditemukan
 */
router.post(
  "/quizzes/:id/attempts",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(startQuizAttemptSchema),
  ELearningQuizAttemptController.startQuizAttempt
);

/**
 * @swagger
 * /api/elearninQuizAttempt/quizzes/{id}/attempts/me:
 *   get:
 *     summary: Lihat hasil quiz (role-based)
 *     description: |
 *       Endpoint untuk melihat hasil attempt quiz berdasarkan role pengguna.
 *       - **Admin:** dapat melihat semua hasil attempt untuk quiz tertentu, lengkap dengan pertanyaan, jawaban, dan skor.
 *       - **Mentor:** hanya dapat melihat hasil quiz dari course yang diampunya.
 *       - **Mentee:** hanya dapat melihat hasil quiz yang berasal dari course yang sudah dibelinya.
 *     tags: [E-Learning Quiz Attempts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID Quiz
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Halaman yang ingin diambil
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah data per halaman
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Cari berdasarkan nama user (khusus admin/mentor)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [score, createdAt]
 *           default: createdAt
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Data hasil quiz berhasil diambil
 *       400:
 *         description: Data request tidak valid
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Data tidak ditemukan
 */
router.get(
  "/quizzes/:id/attempts/me",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(getMyQuizAttemptSchema),
  ELearningQuizAttemptController.getMyAttempt
);

/**
 * @swagger
 * /api/elearninQuizAttempt/quiz-attempts/{id}/grade:
 *   put:
 *     summary: Menilai attempt quiz secara manual (oleh mentor/admin)
 *     description: |
 *       Endpoint ini digunakan oleh **Mentor** atau **Admin** untuk melakukan penilaian manual terhadap quiz attempt.
 *       - Mengubah skor dan catatan penilaian (`remarks`) secara manual.
 *       - Saat endpoint ini dipanggil:
 *         - `isAutoGraded` otomatis menjadi `false`
 *         - `gradedBy` diisi dengan ID user yang menilai
 *         - `gradedAt` diisi waktu saat penilaian dilakukan
 *       - `remarks` bersifat **optional**
 *     tags: [E-Learning Quiz Attempts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID attempt quiz yang ingin dinilai
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - score
 *             properties:
 *               score:
 *                 type: number
 *                 description: Skor hasil penilaian manual (0–100)
 *                 example: 85
 *               remarks:
 *                 type: string
 *                 description: Catatan atau feedback dari mentor
 *                 example: "Jawaban sudah cukup baik, namun perlu penjelasan lebih detail."
 *               isAutoGraded:
 *                 type: boolean
 *                 description: |
 *                   Menandakan apakah attempt ini dinilai otomatis.
 *                   - Default: false (jika dinilai manual oleh mentor)
 *                 example: false
 *     responses:
 *       200:
 *         description: Attempt berhasil dinilai secara manual
 *       400:
 *         description: Data tidak valid
 *       403:
 *         description: Tidak memiliki izin untuk menilai attempt ini
 *       404:
 *         description: Attempt tidak ditemukan
 */
router.put(
  "/quiz-attempts/:id/grade",
  authenticate,
  authorizeRoles("mentor", "admin"),
  validate(gradeQuizAttemptSchema),
  ELearningQuizAttemptController.gradeAttempt
);

/**
 * @swagger
 * /api/elearningQuizAttempt/quiz-attempts:
 *   get:
 *     summary: Ambil semua attempt quiz (Admin & Mentor)
 *     description: |
 *       - **Admin**: dapat melihat seluruh attempt dari semua quiz.
 *       - **Mentor**: hanya dapat melihat attempt quiz yang berasal dari course yang dia ampu.
 *       - Mendukung filter seperti `quizId`, `userId`, `dateRange`, `isAutoGraded`, `scoreRange`, serta pagination.
 *     tags: [E-Learning Quiz Attempts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: quizId
 *         schema:
 *           type: string
 *         description: Filter berdasarkan ID quiz
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter berdasarkan ID user
 *       - in: query
 *         name: isAutoGraded
 *         schema:
 *           type: boolean
 *         description: Filter berdasarkan status penilaian otomatis
 *       - in: query
 *         name: minScore
 *         schema:
 *           type: integer
 *         description: Skor minimum
 *       - in: query
 *         name: maxScore
 *         schema:
 *           type: integer
 *         description: Skor maksimum
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Tanggal mulai rentang waktu
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Tanggal akhir rentang waktu
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Halaman yang ingin diambil
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah data per halaman
 *     responses:
 *       200:
 *         description: Daftar attempt berhasil diambil
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Tidak ada data ditemukan
 */
router.get(
  "/quiz-attempts",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(getAllQuizAttemptsSchema),
  ELearningQuizAttemptController.getAllAttempts
);

/**
 * @swagger
 * /api/elearningQuizAttempt/quiz-attempts/{id}:
 *   get:
 *     summary: Lihat detail satu attempt quiz
 *     description: |
 *       Menampilkan detail attempt quiz termasuk jawaban (`answers`), skor, waktu mulai & selesai, serta status penilaian.
 *       - **Admin** dapat melihat semua attempt.
 *       - **Mentor** hanya dapat melihat attempt quiz dari course yang dia ampu.
 *       - **Mentee** hanya dapat melihat attempt dari course yang sudah dia beli.
 *     tags: [E-Learning Quiz Attempts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID attempt quiz yang ingin dilihat
 *     responses:
 *       200:
 *         description: Detail attempt berhasil diambil
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
 *                   example: "Detail attempt berhasil diambil"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "attempt-20251111-abc123"
 *                     quizId:
 *                       type: string
 *                       example: "quiz-20251111-xyz456"
 *                     userId:
 *                       type: string
 *                       example: "user-20251010-uuu222"
 *                     score:
 *                       type: integer
 *                       example: 85
 *                     isAutoGraded:
 *                       type: boolean
 *                       example: true
 *                     answers:
 *                       type: object
 *                       additionalProperties:
 *                         type: string
 *                       example:
 *                         "question-1": "A"
 *                         "question-2": "C"
 *                     remarks:
 *                       type: string
 *                       example: "Bagus, tapi perlu perbaikan di soal nomor 2."
 *                     startedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-11-11T08:00:00Z"
 *                     completedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-11-11T08:15:00Z"
 *                     quiz:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "quiz-xyz"
 *                         title:
 *                           type: string
 *                           example: "Quiz Mental Health Awareness"
 *                         subBab:
 *                           type: object
 *                           properties:
 *                             subChapter:
 *                               type: object
 *                               properties:
 *                                 course:
 *                                   type: object
 *                                   properties:
 *                                     id:
 *                                       type: string
 *                                       example: "course-001"
 *                                     title:
 *                                       type: string
 *                                       example: "Mental Health Basics"
 *                                     mentorId:
 *                                       type: string
 *                                       example: "mentor-123"
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "user-001"
 *                         fullName:
 *                           type: string
 *                           example: "Dimas Putra"
 *                         email:
 *                           type: string
 *                           example: "dimas@example.com"
 *       403:
 *         description: Tidak memiliki izin melihat attempt ini
 *       404:
 *         description: Attempt tidak ditemukan
 */
router.get(
  "/quiz-attempts/:id",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(getQuizAttemptByIdSchema),
  ELearningQuizAttemptController.getAttemptById
);

/**
 * @swagger
 * /api/elearningQuizAttempt/quiz-attempts/{id}:
 *   delete:
 *     summary: Hapus attempt quiz tertentu
 *     description: |
 *       Endpoint ini digunakan **khusus oleh Admin** untuk menghapus attempt quiz tertentu.
 *       Biasanya digunakan untuk kebutuhan debugging, reset quiz, atau memperbaiki data test/duplikat.
 *     tags: [E-Learning Quiz Attempts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID attempt quiz yang akan dihapus
 *     responses:
 *       200:
 *         description: Attempt quiz berhasil dihapus
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
 *                   example: "Attempt quiz berhasil dihapus"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "attempt-abc123"
 *                     quizId:
 *                       type: string
 *                       example: "quiz-xyz456"
 *                     userId:
 *                       type: string
 *                       example: "user-001"
 *                     score:
 *                       type: integer
 *                       example: 80
 *       400:
 *         description: Data request tidak valid
 *       403:
 *         description: Tidak memiliki izin untuk menghapus attempt ini
 *       404:
 *         description: Attempt tidak ditemukan
 */
router.delete(
  "/quiz-attempts/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(deleteQuizAttemptSchema),
  ELearningQuizAttemptController.deleteAttempt
);

/**
 * @swagger
 * /api/elearningQuizAttempt/quiz-attempts/quizzes/{id}/attempts/summary:
 *   get:
 *     summary: Mendapatkan ringkasan statistik attempt quiz
 *     description: |
 *       Endpoint ini digunakan oleh **Mentor** atau **Admin** untuk melihat statistik hasil attempt pada suatu quiz.
 *       Menampilkan agregasi data seperti:
 *       - Total attempt yang sudah dilakukan
 *       - Skor rata-rata (averageScore)
 *       - Skor tertinggi (highestScore)
 *       - Skor terendah (lowestScore)
 *       - Jumlah attempt yang dinilai otomatis vs manual
 *     tags: [E-Learning Quiz Attempts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID quiz yang ingin dilihat statistiknya
 *     responses:
 *       200:
 *         description: Statistik quiz berhasil diambil
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
 *                   example: "Statistik attempt quiz berhasil diambil"
 *                 data:
 *                   type: object
 *                   properties:
 *                     quizId:
 *                       type: string
 *                       example: "quiz_abc123"
 *                     totalAttempt:
 *                       type: integer
 *                       example: 15
 *                     averageScore:
 *                       type: number
 *                       example: 78.6
 *                     highestScore:
 *                       type: integer
 *                       example: 95
 *                     lowestScore:
 *                       type: integer
 *                       example: 40
 *                     autoGradedCount:
 *                       type: integer
 *                       example: 10
 *                     manualGradedCount:
 *                       type: integer
 *                       example: 5
 *       400:
 *         description: Data request tidak valid
 *       403:
 *         description: Tidak memiliki izin untuk melihat statistik quiz ini
 *       404:
 *         description: Quiz tidak ditemukan
 */
router.get(
  "/quiz-attempts/quizzes/:id/attempts/summary",
  authenticate,
  authorizeRoles("mentor", "admin"),
  validate(quizAttemptSummarySchema),
  ELearningQuizAttemptController.getQuizAttemptSummary
);

/**
 * @swagger
 * /api/elearning/quiz-attempts/me/history:
 *   get:
 *     summary: Melihat seluruh riwayat quiz milik mentee
 *     description: |
 *       Endpoint ini digunakan oleh **Mentee** untuk melihat daftar seluruh quiz yang pernah dikerjakan dari semua course.
 *       Data bisa difilter berdasarkan:
 *       - courseId
 *       - rentang tanggal (startDate & endDate)
 *       - skor minimal/maksimal
 *     tags: [E-Learning Quiz Attempts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Filter berdasarkan ID course
 *       - in: query
 *         name: minScore
 *         schema:
 *           type: number
 *         description: Filter skor minimal
 *       - in: query
 *         name: maxScore
 *         schema:
 *           type: number
 *         description: Filter skor maksimal
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter tanggal mulai (dari completedAt)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter tanggal akhir (sampai completedAt)
 *     responses:
 *       200:
 *         description: Daftar riwayat quiz milik user berhasil diambil
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
 *                   example: "Riwayat quiz berhasil diambil"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       attemptId:
 *                         type: string
 *                         example: "att123"
 *                       quizTitle:
 *                         type: string
 *                         example: "Quiz Pengantar Psikologi"
 *                       courseTitle:
 *                         type: string
 *                         example: "Dasar Psikologi"
 *                       score:
 *                         type: integer
 *                         example: 90
 *                       completedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-11-10T14:30:00.000Z"
 *                       isAutoGraded:
 *                         type: boolean
 *                         example: true
 */
router.get(
  "/quiz-attempts/me/history",
  authenticate,
  authorizeRoles("mentee"),
  validate(quizAttemptHistorySchema),
  ELearningQuizAttemptController.getMyQuizHistory
);

/**
 * @swagger
 * /api/elearningQuizAttempt/exportAttempt:
 *   get:
 *     summary: Export data attempt quiz ke Excel/CSV (Admin)
 *     description: >
 *       - Hanya **admin** yang dapat mengekspor data attempt quiz.
 *       - Mendukung format **CSV** atau **Excel (.xlsx)**.
 *       - File hasil export otomatis diberi nama unik.
 *     tags: [E-Learning Quiz Attempts]
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
  "/exportAttempt",
  authenticate,
  authorizeRoles("admin"),
  validate(exportQuizAttemptSchema),
  ELearningQuizAttemptController.exportQuizAttempts
);

export default router;
