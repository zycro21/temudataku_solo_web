import express from "express";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRole.js";
import {
  createSubmissionSchema,
  getMySubmissionSchema,
  getAllSubmissionsSchema,
  reviewSubmissionSchema,
  reviseSubmissionSchema,
  getSubmissionDetailSchema,
  getSubmissionHistorySchema,
  exportSubmissionSchema,
  deleteSubmissionSchema,
} from "../validations/elearning_submission.validation.js";
import { ELearningSubmissionController } from "../controllers/elearning_submission.controller.js";
import { handleELearningSubmissionUpload } from "../middlewares/uploadImage.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: E-Learning Submissions
 *   description: Pengumpulan dan penilaian tugas e-learning
 */

/**
 * @swagger
 * /api/elearningSubmission/assignments/{id}/submissions:
 *   post:
 *     summary: Kirim tugas (submission) oleh mentee
 *     description: Endpoint bagi mentee untuk mengumpulkan tugas berdasarkan ID assignment. Hanya mentee yang sudah membeli course dapat mengirim submission.
 *     tags: [E-Learning Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID dari assignment yang ingin dikumpulkan
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 example: "Tugas sudah saya selesaikan dengan analisis tambahan"
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Submission berhasil dikirim
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
 *                   example: Submission berhasil dikirim
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "elearnsub-20251114-abc123def456"
 *                     notes:
 *                       type: string
 *                     files:
 *                       type: array
 *                       items:
 *                         type: string
 *                     status:
 *                       type: string
 *                       example: "PENDING"
 *                     submittedAt:
 *                       type: string
 *                       format: date-time
 */
router.post(
  "/assignments/:id/submissions",
  authenticate,
  authorizeRoles("mentee"),
  handleELearningSubmissionUpload("files", true),
  validate(createSubmissionSchema),
  ELearningSubmissionController.createSubmission
);

/**
 * @swagger
 * /api/elearningSubmission/me/assignments/{id}/submissions:
 *   get:
 *     summary: Lihat submission sendiri
 *     description: Endpoint bagi mentee untuk melihat submission yang pernah dikirim pada assignment tertentu.
 *     tags: [E-Learning Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID dari assignment
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Data submission ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       404:
 *         description: Submission tidak ditemukan
 *       400:
 *         description: Request tidak valid
 */
router.get(
  "/me/assignments/:id/submissions",
  authenticate,
  authorizeRoles("mentee"),
  validate(getMySubmissionSchema),
  ELearningSubmissionController.getMySubmission
);

/**
 * @swagger
 * /api/elearningSubmission/assignments/{id}/submissions:
 *   get:
 *     summary: Lihat semua submission pada assignment
 *     description: Mentor hanya bisa melihat submission untuk course yang dia ampu. Admin bebas melihat semuanya.
 *     tags: [E-Learning Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *           description: Cari berdasarkan nama user atau notes
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [PENDING, REVIEWED, REVISION_REQUIRED, APPROVED, REJECTED]
 *       - name: sortBy
 *         in: query
 *         schema:
 *           type: string
 *           enum: [submittedAt, score]
 *       - name: sortOrder
 *         in: query
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Daftar submission berhasil diambil
 */
router.get(
  "/assignments/:id/submissions",
  authenticate,
  authorizeRoles("mentor", "admin"),
  validate(getAllSubmissionsSchema),
  ELearningSubmissionController.getAllSubmissions
);

/**
 * @swagger
 * /api/elearningSubmission/submissions/{id}/review:
 *   put:
 *     summary: Review submission (mentor/admin)
 *     description: Mentor atau admin memberikan score, feedback, dan menentukan apakah revisi diperlukan.
 *     tags: [E-Learning Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID submission
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [feedback, score]
 *             properties:
 *               feedback:
 *                 type: string
 *               score:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               gradeBreakdown:
 *                 type: object
 *                 additionalProperties:
 *                   type: number
 *               isRevisionRequired:
 *                 type: boolean
 *               revisionDeadline:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Review berhasil disimpan
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
 */
router.put(
  "/submissions/:id/review",
  authenticate,
  authorizeRoles("mentor", "admin"),
  validate(reviewSubmissionSchema),
  ELearningSubmissionController.reviewSubmission
);

/**
 * @swagger
 * /api/elearningSubmission/submissions/{id}/revision:
 *   patch:
 *     summary: Kirim revisi submission
 *     description: Endpoint bagi mentee untuk mengirim revisi setelah mendapatkan feedback dari mentor. Hanya submission dengan status REVISION_REQUIRED yang dapat direvisi.
 *     tags: [E-Learning Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID submission yang akan direvisi
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 example: "Revisi sudah dilakukan sesuai saran"
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Revisi berhasil dikirim
 */
router.patch(
  "/submissions/:id/revision",
  authenticate,
  authorizeRoles("mentee"),
  handleELearningSubmissionUpload("files", true),
  validate(reviseSubmissionSchema),
  ELearningSubmissionController.reviseSubmission
);

/**
 * @swagger
 * /api/elearningSubmission/submissions/{id}:
 *   get:
 *     summary: Lihat detail submission
 *     description: Endpoint untuk mengambil detail lengkap satu submission. Admin dapat melihat semua submission, mentor hanya bisa melihat submission pada course yang dia ampu, dan mentee hanya dapat melihat submission miliknya sendiri.
 *     tags: [E-Learning Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID submission yang ingin dilihat
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detail submission berhasil diambil
 */
router.get(
  "/submissions/:id",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(getSubmissionDetailSchema),
  ELearningSubmissionController.getSubmissionDetail
);

/**
 * @swagger
 * /api/elearningSubmission/submissions/{id}/history:
 *   get:
 *     summary: Lihat riwayat perubahan submission
 *     description: Mendapatkan riwayat lengkap perubahan submission (submit awal, direview, revisi, disetujui). Bisa diakses oleh admin, mentor, dan mentee dengan batasan akses.
 *     tags: [E-Learning Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID submission
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Riwayat berhasil diambil
 */
router.get(
  "/submissions/:id/history",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(getSubmissionHistorySchema),
  ELearningSubmissionController.getSubmissionHistory
);

/**
 * @swagger
 * /api/elearningSubmission/submissionsExport:
 *   get:
 *     summary: Export data submission E-Learning ke CSV/Excel (Admin Only)
 *     description: >
 *       - Hanya **admin** yang dapat mengakses endpoint ini.
 *       - Mendukung export ke format **csv** atau **excel (.xlsx)**.
 *     tags: [E-Learning Submissions]
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
 *         description: File berhasil diexport
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       403:
 *         description: Akses ditolak (bukan admin)
 */
router.get(
  "/submissionsExport",
  authenticate,
  authorizeRoles("admin"),
  validate(exportSubmissionSchema),
  ELearningSubmissionController.exportSubmissions
);

/**
 * @swagger
 * /api/elearningSubmission/submissions/{id}:
 *   delete:
 *     summary: Hapus Submission E-Learning (Admin)
 *     description: >
 *       - Endpoint ini hanya dapat diakses oleh **admin**.
 *       - Menghapus submission beserta semua file yang ter-upload.
 *     tags: [E-Learning Submission]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID submission yang akan dihapus
 *         schema:
 *           type: string
 *           example: "sub_abc123"
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
 *                   example: Submission berhasil dihapus
 *       404:
 *         description: Submission tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Submission tidak ditemukan
 *       403:
 *         description: Akses ditolak (bukan admin)
 *       500:
 *         description: Terjadi kesalahan pada server
 */
router.delete(
  "/submissions/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(deleteSubmissionSchema),
  ELearningSubmissionController.deleteSubmission
);

export default router;
