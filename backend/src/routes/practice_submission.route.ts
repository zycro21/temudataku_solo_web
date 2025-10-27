import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRole.js";
import { validate } from "../middlewares/validate.js";
import {
  createPracticeSubmissionController,
  getAllPracticeSubmissionsController,
  getPracticeSubmissionByIdController,
  deletePracticeSubmissionController,
  reviewPracticeSubmissionController,
  getOwnPracticeSubmissionsController,
} from "../controllers/practice_submission.controller.js";
import {
  createPracticeSubmissionSchema,
  reviewPracticeSubmissionSchema,
  getAllPracticeSubmissionsSchema,
  getPracticeSubmissionByIdSchema,
  deletePracticeSubmissionSchema,
  getOwnPracticeSubmissionsSchema,
} from "../validations/practice_submission.validation.js";
import { handlePracticeSubmissionUpload } from "../middlewares/uploadImage.js";

const router = express.Router();

/**
 * @swagger
 * /api/practiceSubmissions/practice/submissions:
 *   post:
 *     summary: Mentee mengirimkan submission untuk suatu practice
 *     description: Endpoint untuk mentee mengunggah file submission beserta catatan opsional.
 *     tags: [Practice Submissions]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [practiceId, files]
 *             properties:
 *               practiceId:
 *                 type: string
 *                 example: "prac-001"
 *               notes:
 *                 type: string
 *                 example: "Ini catatan tambahan untuk submission saya"
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Practice submission created successfully.
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
 *                   example: "Practice submission created successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "SubPrac-20251016-AB12CD34"
 *                     files:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "uploads/practice/submissions/PracticeSubmission-File-20251016-120000.pdf"
 */
router.post(
  "/practice/submissions",
  authenticate,
  authorizeRoles("mentee"),
  handlePracticeSubmissionUpload("files", true),
  validate(createPracticeSubmissionSchema),
  createPracticeSubmissionController
);

/**
 * @swagger
 * /api/practiceSubmissions/practice/submissions:
 *   get:
 *     summary: Ambil semua practice submissions (hanya untuk admin atau mentor reviewer)
 *     description: |
 *       Endpoint ini digunakan untuk mengambil daftar semua *practice submissions* dengan dukungan pagination, pencarian, penyortiran, dan filter status.
 *       - Admin dapat melihat semua submission.
 *       - Mentor hanya dapat melihat submission untuk practice yang mereka pegang.
 *     tags: [Practice Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: string
 *           example: "1"
 *         description: Halaman data yang ingin diambil (default `1`)
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: string
 *           example: "10"
 *         description: Jumlah data per halaman (default `10`)
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *           example: "Design"
 *         description: Kata kunci untuk mencari berdasarkan nama user atau judul practice
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [pending, reviewed, approved]
 *           example: "pending"
 *         description: Filter berdasarkan status submission
 *       - in: query
 *         name: sort_by
 *         required: false
 *         schema:
 *           type: string
 *           enum: [submittedAt, status, reviewedAt]
 *           example: "submittedAt"
 *         description: Kolom untuk sorting data
 *       - in: query
 *         name: order
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           example: "desc"
 *         description: Urutan sorting (`asc` atau `desc`)
 *     responses:
 *       200:
 *         description: Daftar practice submissions berhasil diambil
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
 *                   example: Practice submissions retrieved successfully.
 *                 total:
 *                   type: integer
 *                   example: 45
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "subm_12345"
 *                       notes:
 *                         type: string
 *                         example: "This is my final version of the design"
 *                       files:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["https://cdn.temudata.com/uploads/file1.png"]
 *                       submittedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-10T10:15:30.000Z"
 *                       status:
 *                         type: string
 *                         example: "pending"
 *                       reviewedAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: null
 *                       reviewer:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "usr_mentor123"
 *                           fullName:
 *                             type: string
 *                             example: "John Doe"
 *                           email:
 *                             type: string
 *                             example: "john@example.com"
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "usr_mentee456"
 *                           fullName:
 *                             type: string
 *                             example: "Jane Smith"
 *                           email:
 *                             type: string
 *                             example: "jane@example.com"
 *                       practice:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "prc_78910"
 *                           title:
 *                             type: string
 *                             example: "UI Design Fundamentals"
 *       400:
 *         description: Permintaan tidak valid (invalid query parameters)
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
 *                   example: Invalid query parameters
 *       401:
 *         description: Token tidak valid atau belum login
 *       403:
 *         description: Hanya admin atau mentor reviewer yang dapat mengakses
 *       500:
 *         description: Terjadi kesalahan pada server
 */
router.get(
  "/practice/submissions",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(getAllPracticeSubmissionsSchema),
  getAllPracticeSubmissionsController
);

/**
 * @swagger
 * /api/practiceSubmissions/practice/submissions/me:
 *   get:
 *     summary: Ambil daftar submission milik mentee sendiri
 *     description: Endpoint ini digunakan oleh **mentee** untuk melihat semua submission mereka, termasuk status, feedback, dan penilaian mentor.
 *     tags: [Practice Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: string
 *           example: "1"
 *         description: Halaman data yang ingin diambil (default `1`)
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: string
 *           example: "10"
 *         description: Jumlah data per halaman (default `10`)
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [pending, reviewed, approved, rejected]
 *           example: "pending"
 *         description: Filter berdasarkan status submission
 *       - in: query
 *         name: sort_by
 *         required: false
 *         schema:
 *           type: string
 *           enum: [submittedAt, status, reviewedAt]
 *           example: "submittedAt"
 *         description: Kolom untuk sorting data
 *       - in: query
 *         name: order
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           example: "desc"
 *         description: Urutan sorting (`asc` atau `desc`)
 *     responses:
 *       200:
 *         description: Daftar submission milik mentee berhasil diambil
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
 *                   example: "Practice submissions retrieved successfully."
 *                 total:
 *                   type: integer
 *                   example: 12
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "subm_12345"
 *                       notes:
 *                         type: string
 *                         example: "Ini catatan tambahan saya"
 *                       files:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["https://cdn.temudata.com/uploads/file1.pdf"]
 *                       submittedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-27T08:30:00.000Z"
 *                       status:
 *                         type: string
 *                         example: "pending"
 *                       reviewedAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: null
 *                       kesesuaian:
 *                         type: string
 *                         example: "Baik"
 *                       kualitas:
 *                         type: string
 *                         example: "Sangat baik"
 *                       kreativitas:
 *                         type: string
 *                         example: "Kreatif"
 *                       kelengkapan:
 *                         type: string
 *                         example: "Lengkap"
 *                       komentar:
 *                         type: string
 *                         example: "Perlu perbaikan minor"
 *                       saran:
 *                         type: string
 *                         example: "Tambahkan referensi visual"
 *                       perluRevisi:
 *                         type: boolean
 *                         example: true
 *                       practice:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "prac_001"
 *                           title:
 *                             type: string
 *                             example: "UI Design Fundamentals"
 */
router.get(
  "/practice/submissions/me",
  authenticate,
  authorizeRoles("mentee"),
  validate(getOwnPracticeSubmissionsSchema),
  getOwnPracticeSubmissionsController
);

/**
 * @swagger
 * /api/practiceSubmissions/practice/submissions/{id}:
 *   get:
 *     summary: Ambil detail submission berdasarkan ID
 *     description: >
 *       Endpoint ini digunakan untuk mengambil detail submission dari sebuah *practice*.
 *       - Admin dapat mengakses semua submission.
 *       - Mentor hanya dapat mengakses submission dari *practice* yang dimilikinya.
 *       - Mentee hanya dapat mengakses submission miliknya sendiri *jika sudah membeli practice tersebut*.
 *     tags: [Practice Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID dari submission yang ingin diambil.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detail submission berhasil diambil.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "subm_123"
 *                     status:
 *                       type: string
 *                       example: "pending"
 *                     submittedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-10-16T09:15:32.000Z"
 *                     notes:
 *                       type: string
 *                       example: "Ini hasil latihan saya."
 *                     files:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["https://cdn.temudataku.com/submissions/file1.pdf"]
 *                     kesesuaian:
 *                       type: string
 *                       example: "Baik"
 *                     kualitas:
 *                       type: string
 *                       example: "Sangat baik"
 *                     kreativitas:
 *                       type: string
 *                       example: "Menarik"
 *                     kelengkapan:
 *                       type: string
 *                       example: "Lengkap"
 *                     komentar:
 *                       type: string
 *                       example: "Sudah cukup bagus, tingkatkan lagi presentasinya."
 *                     perluRevisi:
 *                       type: boolean
 *                       example: false
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "usr_001"
 *                         fullName:
 *                           type: string
 *                           example: "Budi Setiawan"
 *                         email:
 *                           type: string
 *                           example: "budi@example.com"
 *                     reviewer:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "usr_mentor_001"
 *                         fullName:
 *                           type: string
 *                           example: "Mentor Andi"
 *                         email:
 *                           type: string
 *                           example: "mentor.andi@example.com"
 *                     practice:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "prac_123"
 *                         title:
 *                           type: string
 *                           example: "Latihan UI Design"
 *                         mentorId:
 *                           type: string
 *                           example: "mentor_001"
 *       403:
 *         description: Akses ditolak (tidak memiliki izin untuk melihat submission ini)
 *       404:
 *         description: Submission tidak ditemukan
 */
router.get(
  "/practice/submissions/:id",
  authenticate,
  validate(getPracticeSubmissionByIdSchema),
  getPracticeSubmissionByIdController
);

/**
 * @swagger
 * /api/practiceSubmissions/practice/submissions/{id}/review:
 *   put:
 *     summary: Mentor atau admin mereview submission practice (mengubah status, menambahkan penilaian, dan komentar)
 *     description: Endpoint ini digunakan oleh **mentor** atau **admin** untuk meninjau submission yang diajukan mentee. Mentor hanya bisa meninjau submission dari practice yang dimilikinya.
 *     tags: [Practice Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID dari submission yang akan direview
 *         schema:
 *           type: string
 *           example: "subm_01J8KZ2X2Y8T9D2"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, reviewed, approved]
 *                 description: Status baru dari submission
 *                 example: "reviewed"
 *               kesesuaian:
 *                 type: string
 *                 description: Penilaian kesesuaian hasil submission
 *                 example: "Sesuai dengan instruksi tugas"
 *               kualitas:
 *                 type: string
 *                 description: Penilaian kualitas hasil kerja mentee
 *                 example: "Baik, desain bersih dan terstruktur"
 *               kreativitas:
 *                 type: string
 *                 description: Penilaian kreativitas
 *                 example: "Kreatif dan inovatif"
 *               kelengkapan:
 *                 type: string
 *                 description: Penilaian kelengkapan file dan catatan
 *                 example: "File lengkap dan sesuai format"
 *               komentar:
 *                 type: string
 *                 description: Komentar tambahan dari reviewer
 *                 example: "Sudah bagus, lanjutkan semangatnya!"
 *               saran:
 *                 type: string
 *                 description: Saran untuk perbaikan
 *                 example: "Coba eksplorasi warna yang lebih kontras"
 *               perluRevisi:
 *                 type: boolean
 *                 description: Apakah submission perlu revisi
 *                 example: false
 *     responses:
 *       200:
 *         description: Submission berhasil direview
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
 *                   example: "Submission reviewed successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "subm_01J8KZ2X2Y8T9D2"
 *                     status:
 *                       type: string
 *                       example: "reviewed"
 *                     kesesuaian:
 *                       type: string
 *                       example: "Sesuai dengan instruksi tugas"
 *                     kualitas:
 *                       type: string
 *                       example: "Baik, desain bersih dan terstruktur"
 *                     kreativitas:
 *                       type: string
 *                       example: "Kreatif dan inovatif"
 *                     kelengkapan:
 *                       type: string
 *                       example: "File lengkap dan sesuai format"
 *                     komentar:
 *                       type: string
 *                       example: "Sudah bagus, lanjutkan semangatnya!"
 *                     saran:
 *                       type: string
 *                       example: "Coba eksplorasi warna yang lebih kontras"
 *                     perluRevisi:
 *                       type: boolean
 *                       example: false
 *                     reviewedBy:
 *                       type: object
 *                       description: Data mentor atau admin yang mereview
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "usr_mentor_001"
 *                         fullName:
 *                           type: string
 *                           example: "Mentor Dimas Putra"
 *                         email:
 *                           type: string
 *                           example: "mentor@example.com"
 *                     practice:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "prac_00012"
 *                         title:
 *                           type: string
 *                           example: "UI/UX Design Challenge - Dashboard App"
 *       400:
 *         description: Gagal mereview submission (input tidak valid atau user tidak berhak)
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
 *                   example: "Unauthorized: Only mentor or admin can review submissions"
 *       401:
 *         description: User tidak terautentikasi
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
 *                   example: "Unauthorized: User not found"
 */
router.put(
  "/practice/submissions/:id/review",
  authenticate,
  authorizeRoles("mentor", "admin"),
  validate(reviewPracticeSubmissionSchema),
  reviewPracticeSubmissionController
);

/**
 * @swagger
 * /api/practiceSubmissions/practice/submissions/{id}:
 *   delete:
 *     summary: Hapus submission (hanya admin)
 *     description: Endpoint ini hanya bisa digunakan oleh **admin** untuk menghapus submission yang ada.
 *     tags: [Practice Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID dari submission yang akan dihapus
 *         schema:
 *           type: string
 *           example: "subm_01J8KZ2X2Y8T9D2"
 *     responses:
 *       200:
 *         description: Submission berhasil dihapus
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
 *                   example: "Submission deleted successfully."
 *       400:
 *         description: Gagal menghapus submission (submission tidak ada atau user bukan admin)
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
 *                   example: "Unauthorized: Only admin can delete submissions"
 *       401:
 *         description: User tidak terautentikasi
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
 *                   example: "Unauthorized: User not found"
 */
router.delete(
  "/practice/submissions/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(deletePracticeSubmissionSchema),
  deletePracticeSubmissionController
);

export default router;
