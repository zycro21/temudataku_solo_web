import express from "express";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRole.js";
import {
  getMyProgressController,
  getSubBabProgressController,
  completeSubBabController,
  updateSubBabProgressController,
  getCourseProgressController,
  getSubChapterProgressController,
  getCourseRoadmapController,
  resetSubBabProgressController,
  exportElearningProgressController
} from "../controllers/elearning_progress.controller.js";
import {
  getMyProgressSchema,
  subBabIdParamSchema,
  completeSubBabSchema,
  updateProgressSchema,
  getCourseProgressSchema,
  getSubChapterProgressSchema,
  getCourseRoadmapSchema,
  resetProgressSchema,
  exportProgressSchema,
} from "../validations/elearning_progress.validation.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: E-Learning Progress
 *   description: API untuk mengelola progress E-Learning Mentee
 */

/**
 * @swagger
 * /api/elearningProgress/progress/me:
 *   get:
 *     summary: Lihat semua progress e-learning saya
 *     description: |
 *       Endpoint ini digunakan oleh mentee untuk melihat seluruh progress belajar mereka sendiri.
 *       Mendukung filter course, status completion, sorting, dan pagination.
 *     tags: [E-Learning Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Nomor halaman
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: Jumlah data per halaman
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - name: courseId
 *         in: query
 *         description: Filter berdasarkan course tertentu
 *         schema:
 *           type: string
 *       - name: isCompleted
 *         in: query
 *         description: Filter progress selesai atau belum
 *         schema:
 *           type: boolean
 *       - name: sortBy
 *         in: query
 *         description: Field sorting
 *         schema:
 *           type: string
 *           enum: [lastAccessed, timeSpent, createdAt]
 *       - name: sortOrder
 *         in: query
 *         description: Urutan sorting
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Daftar progress e-learning user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     meta:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           timeSpent:
 *                             type: integer
 *                           isCompleted:
 *                             type: boolean
 *                           lastAccessed:
 *                             type: string
 *                             format: date-time
 *                           subBab:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               title:
 *                                 type: string
 *                               orderNumber:
 *                                 type: integer
 *                               subChapter:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: string
 *                                   title:
 *                                     type: string
 *                                   course:
 *                                     type: object
 *                                     properties:
 *                                       id:
 *                                         type: string
 *                                       title:
 *                                         type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/progress/me",
  authenticate,
  authorizeRoles("mentee"),
  validate(getMyProgressSchema),
  getMyProgressController
);

/**
 * @swagger
 * /api/elearningProgress/subbabs/{id}/progress:
 *   get:
 *     summary: Lihat progress sub-bab tertentu
 *     description: >
 *       Endpoint untuk mentee mengecek progress pada sub-bab tertentu,
 *       termasuk status penyelesaian dan detail materi (video, teks, quiz, assignment).
 *     tags: [E-Learning Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: cuid
 *         description: ID Sub-Bab
 *     responses:
 *       200:
 *         description: Progress sub-bab berhasil diambil
 *       403:
 *         description: User belum membeli course terkait
 *       404:
 *         description: Sub-bab tidak ditemukan
 */
router.get(
  "/subbabs/:id/progress",
  authenticate,
  authorizeRoles("mentee"),
  validate(subBabIdParamSchema),
  getSubBabProgressController
);

/**
 * @swagger
 * /api/elearningProgress/subbabs/{id}/progress:
 *   patch:
 *     summary: Tandai sub-bab sebagai selesai
 *     description: |
 *       Endpoint untuk mentee menandai sub-bab sebagai selesai.
 *       Hanya bisa dilakukan jika user telah membeli course terkait.
 *     tags: [E-Learning Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID Sub-Bab
 *         schema:
 *           type: string
 *           format: cuid
 *     responses:
 *       200:
 *         description: Sub-bab berhasil ditandai selesai
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     subBabId:
 *                       type: string
 *                     isCompleted:
 *                       type: boolean
 *                     lastAccessed:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Course belum dibeli
 *       404:
 *         description: Sub-bab tidak ditemukan
 */
router.patch(
  "/subbabs/:id/progress",
  authenticate,
  authorizeRoles("mentee"),
  validate(completeSubBabSchema),
  completeSubBabController
);

/**
 * @swagger
 * /api/elearningProgress/timeSubbabs/{id}:
 *   patch:
 *     summary: Update waktu belajar SubBab (progress mentee)
 *     description: |
 *       Endpoint untuk mencatat progress belajar mentee pada SubBab tertentu.
 *
 *       - Progress akan **dibuat otomatis** jika belum ada (first access).
 *       - Waktu belajar (`timeSpent`) akan **diakumulasi**, bukan di-replace.
 *       - Hanya bisa diakses oleh mentee yang **sudah membeli course**.
 *       - `isCompleted` hanya bisa berubah dari `false` ke `true`.
 *
 *     tags: [E-Learning Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID SubBab
 *         schema:
 *           type: string
 *           format: cuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               timeSpent:
 *                 type: integer
 *                 minimum: 0
 *                 description: |
 *                   Waktu belajar dalam detik (akan ditambahkan ke total).
 *               isCompleted:
 *                 type: boolean
 *                 description: Tandai SubBab sebagai selesai (opsional).
 *     responses:
 *       200:
 *         description: Progress SubBab berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     subBabId:
 *                       type: string
 *                     timeSpent:
 *                       type: integer
 *                     isCompleted:
 *                       type: boolean
 *                     lastAccessed:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: User belum membeli course
 *       404:
 *         description: SubBab tidak ditemukan
 */
router.patch(
  "/timeSubbabs/:id",
  authenticate,
  authorizeRoles("mentee"),
  validate(updateProgressSchema),
  updateSubBabProgressController
);

/**
 * @swagger
 * /api/elearningProgress/courses/{id}/progress:
 *   get:
 *     summary: Get progress belajar user pada course
 *     description: |
 *       Endpoint ini digunakan untuk mengambil **ringkasan progress belajar user pada sebuah course**.
 *
 *       🎯 Digunakan oleh frontend untuk:
 *       - Menampilkan **progress bar course**
 *       - Menghitung **persentase completion**
 *       - Menentukan **eligibility sertifikat**
 *
 *       📐 Perhitungan progress:
 *       - Progress dihitung berdasarkan **jumlah SubBab yang selesai**
 *       - `isCompleted = true` pada SubBab → dianggap selesai
 *
 *       🔐 Akses:
 *       - Hanya untuk user dengan role **mentee**
 *       - User **harus sudah membeli course**
 *
 *     tags: [E-Learning Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID Course
 *         schema:
 *           type: string
 *           format: cuid
 *     responses:
 *       200:
 *         description: Progress course berhasil diambil
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
 *                     courseId:
 *                       type: string
 *                       example: "ckx123abc"
 *                     totalSubBab:
 *                       type: integer
 *                       example: 20
 *                     completedSubBab:
 *                       type: integer
 *                       example: 15
 *                     progressPercent:
 *                       type: integer
 *                       example: 75
 *                     isEligibleCertificate:
 *                       type: boolean
 *                       example: false
 *       401:
 *         description: Unauthorized (token tidak valid)
 *       403:
 *         description: User belum membeli course
 *       404:
 *         description: Course tidak ditemukan
 */
router.get(
  "/courses/:id/progress",
  authenticate,
  authorizeRoles("mentee"),
  validate(getCourseProgressSchema),
  getCourseProgressController
);

/**
 * @swagger
 * /api/elearningProgress/subchapters/{id}/progress:
 *   get:
 *     summary: Get progress belajar user per Sub-Chapter
 *     description: |
 *       Endpoint untuk mengambil **progress belajar user pada satu Sub-Chapter**.
 *
 *       🎯 Digunakan oleh frontend untuk:
 *       - Menampilkan **accordion / roadmap belajar**
 *       - Checklist SubBab (done / not done)
 *       - Menghitung progress per chapter
 *
 *       📐 Perhitungan:
 *       - Progress dihitung berdasarkan jumlah **SubBab yang selesai**
 *       - SubBab dianggap selesai jika `isCompleted = true`
 *
 *       🔐 Akses:
 *       - Hanya role **mentee**
 *       - User **harus sudah membeli course** dari Sub-Chapter ini
 *
 *     tags: [E-Learning Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID Sub-Chapter
 *         schema:
 *           type: string
 *           format: cuid
 *     responses:
 *       200:
 *         description: Progress Sub-Chapter berhasil diambil
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
 *                     subChapterId:
 *                       type: string
 *                     title:
 *                       type: string
 *                     totalSubBab:
 *                       type: integer
 *                       example: 5
 *                     completedSubBab:
 *                       type: integer
 *                       example: 3
 *                     progressPercent:
 *                       type: integer
 *                       example: 60
 *                     subBabs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           isCompleted:
 *                             type: boolean
 *                           timeSpent:
 *                             type: integer
 *                             description: Total waktu belajar (detik)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: User belum membeli course
 *       404:
 *         description: Sub-Chapter tidak ditemukan
 */
router.get(
  "/subchapters/:id/progress",
  authenticate,
  authorizeRoles("mentee"),
  validate(getSubChapterProgressSchema),
  getSubChapterProgressController
);

/**
 * @swagger
 * /api/elearningProgress/courses/{id}/roadmap:
 *   get:
 *     summary: Get course roadmap + progress user
 *     description: |
 *       Endpoint untuk mengambil **roadmap belajar lengkap sebuah course**
 *       beserta **progress user (mentee)** dalam satu request.
 *
 *       🎯 Digunakan oleh halaman belajar untuk:
 *       - Accordion Sub-Chapter & SubBab
 *       - Checklist materi
 *       - Progress bar course
 *       - Validasi kelayakan sertifikat
 *
 *       📐 Perhitungan progress:
 *       - SubBab dianggap selesai jika `isCompleted = true`
 *       - Progress chapter & course dihitung dari total SubBab
 *
 *       🔐 Akses:
 *       - Hanya role **mentee**
 *       - User **harus sudah membeli course**
 *
 *     tags: [E-Learning Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID Course
 *         schema:
 *           type: string
 *           format: cuid
 *     responses:
 *       200:
 *         description: Course roadmap berhasil diambil
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
 *                     courseId:
 *                       type: string
 *                     title:
 *                       type: string
 *                     totalSubBab:
 *                       type: integer
 *                       example: 12
 *                     completedSubBab:
 *                       type: integer
 *                       example: 7
 *                     progressPercent:
 *                       type: integer
 *                       example: 58
 *                     isEligibleCertificate:
 *                       type: boolean
 *                     roadmap:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           subChapterId:
 *                             type: string
 *                           title:
 *                             type: string
 *                           progressPercent:
 *                             type: integer
 *                             example: 75
 *                           subBabs:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                 title:
 *                                   type: string
 *                                 isCompleted:
 *                                   type: boolean
 *                                 timeSpent:
 *                                   type: integer
 *                                   description: Total waktu belajar (detik)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: User belum membeli course
 *       404:
 *         description: Course tidak ditemukan
 */
router.get(
  "/courses/:id/roadmap",
  authenticate,
  authorizeRoles("mentee"),
  validate(getCourseRoadmapSchema),
  getCourseRoadmapController
);

/**
 * @swagger
 * /api/elearningProgress/subbabs/{id}/progress/reset:
 *   patch:
 *     summary: Reset / reopen progress SubBab
 *     description: |
 *       Endpoint untuk **mengulang (reset) progress belajar** pada SubBab tertentu.
 *
 *       🎯 Use case:
 *       - User ingin mengulang materi
 *       - Mentor meminta revisi
 *       - User salah menandai selesai
 *
 *       🔄 Perubahan yang dilakukan:
 *       - `isCompleted` → false
 *       - `timeSpent` → 0
 *       - `lastAccessed` → null
 *
 *       ⚠️ Catatan penting:
 *       - Progress **harus sudah ada**
 *       - User **harus membeli course terkait**
 *       - Reset akan mempengaruhi:
 *         - Progress course
 *         - Eligibility sertifikat
 *
 *     tags: [E-Learning Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID SubBab
 *         schema:
 *           type: string
 *           format: cuid
 *     responses:
 *       200:
 *         description: Progress SubBab berhasil di-reset
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
 *                     userId:
 *                       type: string
 *                     subBabId:
 *                       type: string
 *                     isCompleted:
 *                       type: boolean
 *                       example: false
 *                     timeSpent:
 *                       type: integer
 *                       example: 0
 *                     lastAccessed:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: User belum membeli course
 *       404:
 *         description: Progress atau SubBab tidak ditemukan
 */
router.patch(
  "/subbabs/:id/progress/reset",
  authenticate,
  authorizeRoles("mentee", "admin"),
  validate(resetProgressSchema),
  resetSubBabProgressController
);

/**
 * @swagger
 * /api/elearningProgress/export:
 *   get:
 *     summary: Export data progress E-Learning ke CSV / Excel
 *     description: >
 *       Endpoint untuk export seluruh data **progress belajar user**.
 *
 *       📌 Fitur:
 *       - Hanya **admin & mentor**
 *       - Export ke **csv** atau **excel (.xlsx)**
 *       - Bisa difilter berdasarkan **courseId** (opsional)
 *
 *       📊 Data yang diexport:
 *       - User (nama & email)
 *       - Course, SubChapter, SubBab
 *       - Status completion
 *       - Time spent
 *       - Last accessed
 *
 *     tags: [E-Learning Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: format
 *         in: query
 *         required: false
 *         description: Format file export
 *         schema:
 *           type: string
 *           enum: [csv, excel]
 *           default: csv
 *       - name: courseId
 *         in: query
 *         required: false
 *         description: Filter berdasarkan Course ID
 *         schema:
 *           type: string
 *           format: cuid
 *     responses:
 *       200:
 *         description: File progress berhasil diexport
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       403:
 *         description: Akses ditolak
 */
router.get(
  "/export",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(exportProgressSchema),
  exportElearningProgressController
);

export default router;
