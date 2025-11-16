import express from "express";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRole.js";
import {
  createAssignmentSchema,
  getAssignmentSchema,
  updateAssignmentSchema,
  deleteAssignmentSchema,
  getAllAssignmentsSchema,
  getAssignmentDetailSchema,
  getAssignmentsByCourseSchema,
  exportAssignmentsSchema,
} from "../validations/elearning_assignment.validation.js";
import { ELearningAssignmentController } from "../controllers/elearning_assignment.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: E-Learning Assignments
 *   description: Manajemen tugas take-home untuk e-learning
 */

/**
 * @swagger
 * /api/elearningAssignment/subbabs/{id}/assignment:
 *   post:
 *     summary: Buat tugas baru untuk SubBab
 *     description: |
 *       Membuat tugas take-home baru untuk subBab tertentu.
 *       - Role: **Admin** dan **Mentor**
 *       - Mentor hanya bisa membuat assignment di course yang dia ampu.
 *       - Satu SubBab hanya boleh memiliki satu assignment.
 *     tags: [E-Learning Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID subBab tempat assignment dibuat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, dueDays]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Tugas 1: Analisis Video Pembelajaran"
 *               description:
 *                 type: string
 *                 example: "Tuliskan analisis singkat dari video yang ditonton."
 *               dueDays:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       201:
 *         description: Assignment berhasil dibuat
 *       400:
 *         description: SubBab sudah memiliki assignment atau data tidak valid
 *       403:
 *         description: Mentor tidak memiliki izin membuat assignment
 *       404:
 *         description: SubBab tidak ditemukan
 */
router.post(
  "/subbabs/:id/assignment",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(createAssignmentSchema),
  ELearningAssignmentController.createAssignment
);

/**
 * @swagger
 * /api/elearningAssignment/subbabs/{id}/assignment:
 *   get:
 *     summary: Lihat assignment pada SubBab (plus optional submissions)
 *     description: |
 *       Mendapatkan informasi assignment untuk SubBab tertentu.
 *       - Role: **Admin**, **Mentor**, **Mentee**
 *       - Admin: bisa mengakses semua SubBab
 *       - Mentor: hanya SubBab yang coursenya dia ampu
 *       - Mentee: hanya SubBab dari course yang sudah dibeli
 *       - Opsi `includeSubmissions=true` akan mengembalikan daftar submissions untuk assignment,
 *         dengan pagination, sorting, filter, dan search.
 *     tags: [E-Learning Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: "ID SubBab"
 *       - in: query
 *         name: includeSubmissions
 *         schema:
 *           type: boolean
 *           default: false
 *         description: "Sertakan daftar submissions (default: false)"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: "Halaman untuk submissions"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: "Limit per halaman untuk submissions"
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, score, submittedAt]
 *           default: submittedAt
 *         description: "Field sorting untuk submissions"
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: "Order sorting"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: "Cari di kolom submission (mis. student name atau file name) atau di title assignment"
 *       - in: query
 *         name: minScore
 *         schema:
 *           type: number
 *         description: "Filter submissions skor minimal"
 *       - in: query
 *         name: maxScore
 *         schema:
 *           type: number
 *         description: "Filter submissions skor maksimal"
 *     responses:
 *       200:
 *         description: "Assignment (dan optional submissions) berhasil diambil"
 *       400:
 *         description: "Request tidak valid"
 *       401:
 *         description: "Unauthorized"
 *       403:
 *         description: "Forbidden (tidak punya akses)"
 *       404:
 *         description: "Assignment atau SubBab tidak ditemukan"
 */
router.get(
  "/subbabs/:id/assignment",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(getAssignmentSchema),
  ELearningAssignmentController.getAssignment
);

/**
 * @swagger
 * /api/elearningAssignment/assignments/{id}:
 *   put:
 *     summary: Update assignment
 *     description: |
 *       Memperbarui assignment berdasarkan ID.
 *       - Role: **Admin**, **Mentor**
 *       - Admin dapat memperbarui assignment apa pun.
 *       - Mentor hanya dapat memperbarui assignment di course yang dia ampu.
 *       - Update bersifat parsial (tidak wajib semua field diisi).
 *     tags: [E-Learning Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID assignment yang akan diupdate
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Tugas 1: Analisis Konten Video"
 *               description:
 *                 type: string
 *                 example: "Tambahkan insight mendalam."
 *               dueDays:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       200:
 *         description: Assignment berhasil diperbarui
 *       400:
 *         description: Request tidak valid
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Tidak memiliki izin untuk memperbarui assignment ini
 *       404:
 *         description: Assignment tidak ditemukan
 */
router.put(
  "/assignments/:id",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(updateAssignmentSchema),
  ELearningAssignmentController.updateAssignment
);

/**
 * @swagger
 * /api/elearningAssignment/assignments/{id}:
 *   delete:
 *     summary: Hapus assignment
 *     description: |
 *       Menghapus assignment berdasarkan ID.
 *       - Role: **Admin** saja
 *       - Mentor atau role lain tidak diizinkan untuk menghapus assignment
 *     tags: [E-Learning Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID assignment yang akan dihapus
 *     responses:
 *       200:
 *         description: Assignment berhasil dihapus
 *       400:
 *         description: Request tidak valid
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Tidak memiliki izin untuk menghapus assignment ini
 *       404:
 *         description: Assignment tidak ditemukan
 */
router.delete(
  "/assignments/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(deleteAssignmentSchema),
  ELearningAssignmentController.deleteAssignment
);

/**
 * @swagger
 * /api/elearningAssignment/assignments:
 *   get:
 *     summary: List semua assignment (filterable & pageable)
 *     description: |
 *       Menampilkan daftar assignment.
 *       - Role: **Admin**, **Mentor**
 *       - Admin dapat melihat semua assignment di seluruh course.
 *       - Mentor hanya melihat assignment miliknya.
 *       - Dapat difilter, dicari, diurutkan, dan dipaginasi.
 *     tags: [E-Learning Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Cari berdasarkan judul atau deskripsi assignment
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
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, score, submittedAt]
 *           default: createdAt
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: minScore
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxScore
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan daftar assignment
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Tidak memiliki izin
 */
router.get(
  "/assignments",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(getAllAssignmentsSchema),
  ELearningAssignmentController.getAllAssignments
);

/**
 * @swagger
 * /api/elearningAssignment/assignments/{id}/detail:
 *   get:
 *     summary: Dapatkan detail assignment berdasarkan ID
 *     description: |
 *       Mengambil detail assignment langsung berdasarkan ID-nya.
 *       - Role: **Admin**, **Mentor**, **Mentee**
 *       - Admin: bisa akses semua assignment.
 *       - Mentor: hanya bisa akses assignment di course yang dia ampu.
 *       - Mentee: hanya bisa akses assignment di course yang sudah dibeli.
 *     tags: [E-Learning Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID assignment yang ingin diambil.
 *     responses:
 *       200:
 *         description: Detail assignment berhasil diambil
 *       400:
 *         description: ID tidak valid
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Assignment tidak ditemukan
 */
router.get(
  "/assignments/:id/detail",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(getAssignmentDetailSchema),
  ELearningAssignmentController.getAssignmentDetail
);

/**
 * @swagger
 * /api/elearningAssignment/courses/{courseId}/assignments:
 *   get:
 *     summary: Ambil semua assignment dari satu course
 *     description: |
 *       Mengambil daftar assignment dari course tertentu.
 *       - Role: **Admin** dan **Mentor**
 *       - Admin dapat mengakses semua course.
 *       - Mentor hanya dapat mengakses assignment dari course yang dia ampu.
 *       - Mendukung pagination, search, sort, dan filter.
 *     tags: [E-Learning Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID course yang ingin diambil assignment-nya
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Halaman yang ingin diambil
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Jumlah data per halaman
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, title]
 *           example: createdAt
 *         description: Kolom untuk pengurutan
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           example: desc
 *         description: Urutan pengurutan (asc/desc)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: "Analisis"
 *         description: Kata kunci pencarian berdasarkan judul/deskripsi
 *     responses:
 *       200:
 *         description: Daftar assignment berhasil diambil
 *       400:
 *         description: Request tidak valid
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Course tidak ditemukan
 */
router.get(
  "/courses/:courseId/assignments",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(getAssignmentsByCourseSchema),
  ELearningAssignmentController.getAssignmentsByCourse
);

/**
 * @swagger
 * /api/elearningAssignment/exportAssignment:
 *   get:
 *     summary: Export data assignment e-learning ke Excel/CSV (Admin Only)
 *     tags: [ELearningAssignment]
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
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid format. Use 'csv' or 'excel'
 *       403:
 *         description: Hanya admin yang dapat mengakses endpoint ini
 *       500:
 *         description: Terjadi kesalahan pada server
 */
router.get(
  "/exportAssignment",
  authenticate,
  authorizeRoles("admin"),
  validate(exportAssignmentsSchema),
  ELearningAssignmentController.exportAssignments
);

export default router;
