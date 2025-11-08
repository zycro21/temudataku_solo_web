import express from "express";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRole.js";
import { ELearningSubBabController } from "../controllers/elearning_subbab.controller.js";
import {
  getSubBabsBySubChapterSchema,
  getSubBabByIdSchema,
  createSubBabSchema,
  updateSubBabSchema,
  deleteSubBabSchema,
  duplicateSubBabSchema,
  reorderSubBabSchema,
  getAllSubBabsSchema,
  exportSubBabsSchema,
} from "../validations/elearning_subbab.validation.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: E-Learning SubBabs
 *     description: Endpoint untuk mengelola sub-bab (materi detail dari sub-chapter)
 */

/**
 * @swagger
 * /api/elearningSubBab/subchapters/{subChapterId}/subbabs:
 *   get:
 *     summary: List semua sub-bab dari satu sub-chapter
 *     description: >
 *       Admin dapat melihat semua sub-bab dari sub-chapter manapun.
 *       Mentor hanya bisa melihat sub-bab dari course yang dia ampu.
 *       Mentee hanya bisa melihat sub-bab dari course yang sudah dibeli.
 *       Mendukung pagination, search, dan sorting berdasarkan orderNumber.
 *     tags: [E-Learning SubBabs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: subChapterId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID sub-chapter
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
 *         description: Keyword pencarian sub-bab berdasarkan title
 *       - name: sort
 *         in: query
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Urutan berdasarkan orderNumber
 *     responses:
 *       200:
 *         description: List sub-bab berhasil diambil
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Sub-chapter tidak ditemukan
 */
router.get(
  "/subchapters/:subChapterId/subbabs",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(getSubBabsBySubChapterSchema),
  ELearningSubBabController.getSubBabsBySubChapter
);

/**
 * @swagger
 * /api/elearningSubBab/subbabs/{id}:
 *   get:
 *     summary: Detail satu sub-bab (beserta videos, texts, quiz, dan assignment)
 *     description: >
 *       Admin dapat melihat sub-bab dari course manapun.
 *       Mentor hanya bisa melihat sub-bab dari course yang dia ampu.
 *       Mentee hanya bisa melihat sub-bab dari course yang sudah dibeli.
 *     tags: [E-Learning SubBabs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID Sub-Bab
 *     responses:
 *       200:
 *         description: Detail sub-bab berhasil diambil
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Sub-bab tidak ditemukan
 */
router.get(
  "/subbabs/:id",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(getSubBabByIdSchema),
  ELearningSubBabController.getSubBabById
);

/**
 * @swagger
 * /api/elearningSubBab/subchapters/{subChapterId}/subbabs:
 *   post:
 *     summary: Tambah sub-bab baru dalam sub-chapter
 *     description: Admin dapat menambahkan sub-bab ke sub-chapter mana pun. Mentor hanya bisa menambahkan ke course yang dia ampu.
 *     tags: [E-Learning SubBabs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: subChapterId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID sub-chapter
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
 *                 example: "Pengenalan Dasar AI"
 *               estimatedTime:
 *                 type: string
 *                 example: "45 menit"
 *     responses:
 *       201:
 *         description: Sub-bab berhasil dibuat
 *       400:
 *         description: Data tidak valid
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Sub-chapter tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.post(
  "/subchapters/:subChapterId/subbabs",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(createSubBabSchema),
  ELearningSubBabController.createSubBab
);

/**
 * @swagger
 * /api/elearningSubBab/subbabs/{id}:
 *   put:
 *     summary: Update data sub-bab
 *     description: >
 *       Admin dapat mengubah semua sub-bab dari course manapun.
 *       Mentor hanya dapat mengedit sub-bab yang berasal dari course yang dia ampu.
 *       Jika orderNumber diubah, sistem akan memastikan tidak terjadi duplikasi dalam satu sub-chapter.
 *     tags: [E-Learning SubBabs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID Sub-Bab
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Pengenalan Golang"
 *               estimatedTime:
 *                 type: string
 *                 example: "30 menit"
 *               orderNumber:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Sub-bab berhasil diperbarui
 *       400:
 *         description: Request tidak valid
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Sub-bab tidak ditemukan
 */
router.put(
  "/subbabs/:id",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(updateSubBabSchema),
  ELearningSubBabController.updateSubBab
);

/**
 * @swagger
 * /api/elearningSubBab/subbabs/{id}:
 *   delete:
 *     summary: Hapus sub-bab
 *     description: >
 *       Hanya admin yang dapat menghapus sub-bab.
 *       Jika sub-bab yang dihapus berada di tengah urutan, orderNumber sub-bab lainnya akan disesuaikan agar tetap berurutan.
 *     tags: [E-Learning SubBabs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID Sub-Bab yang ingin dihapus
 *     responses:
 *       200:
 *         description: Sub-bab berhasil dihapus
 *       400:
 *         description: Request tidak valid
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Sub-bab tidak ditemukan
 */
router.delete(
  "/subbabs/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(deleteSubBabSchema),
  ELearningSubBabController.deleteSubBab
);

/**
 * @swagger
 * /api/elearningSubBab/subbabs/{id}/duplicate:
 *   post:
 *     summary: Duplikasi sub-bab ke sub-chapter lain
 *     description: >
 *       Admin dapat menyalin sub-bab ke sub-chapter manapun.
 *       Mentor hanya dapat menyalin ke sub-chapter dari course yang dia ampu.
 *       Konten (video, text, quiz, assignment) juga akan ikut disalin.
 *       Sistem akan otomatis menyesuaikan orderNumber agar tidak terjadi duplikasi di sub-chapter tujuan.
 *     tags: [E-Learning SubBabs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID Sub-Bab yang akan diduplikasi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [targetSubChapterId]
 *             properties:
 *               targetSubChapterId:
 *                 type: string
 *                 example: "SubChap_abc123"
 *               newTitle:
 *                 type: string
 *                 example: "Pengenalan Golang (Copy)"
 *     responses:
 *       201:
 *         description: Sub-bab berhasil diduplikasi
 *       400:
 *         description: Data tidak valid atau duplikat orderNumber
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Sub-bab atau sub-chapter tidak ditemukan
 */
router.post(
  "/subbabs/:id/duplicate",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(duplicateSubBabSchema),
  ELearningSubBabController.duplicateSubBab
);

/**
 * @swagger
 * /api/elearningSubBab/subchapters/{subChapterId}/reorder:
 *   patch:
 *     summary: Reorder Sub-Bab di dalam satu Sub-Chapter
 *     description: >
 *       Admin dapat mengubah sebagian urutan Sub-Bab di dalam satu Sub-Chapter.
 *       Sistem akan otomatis menyesuaikan agar tidak ada duplikasi orderNumber.
 *     tags: [E-Learning SubBabs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: subChapterId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID Sub-Chapter tempat sub-bab akan diurutkan ulang
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [updates]
 *             properties:
 *               updates:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [subBabId, newOrderNumber]
 *                   properties:
 *                     subBabId:
 *                       type: string
 *                       example: "subbab-20251108-abcdef"
 *                     newOrderNumber:
 *                       type: integer
 *                       example: 2
 *     responses:
 *       200:
 *         description: Urutan sub-bab berhasil diperbarui
 *       400:
 *         description: Data tidak valid
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Sub-chapter atau sub-bab tidak ditemukan
 */
router.patch(
  "/subchapters/:subChapterId/reorder",
  authenticate,
  authorizeRoles("admin"), // hanya admin
  validate(reorderSubBabSchema),
  ELearningSubBabController.reorderSubBabs
);

/**
 * @swagger
 * /api/elearningSubBab/all:
 *   get:
 *     summary: Mendapatkan semua Sub-Bab (Global Admin View)
 *     description: >
 *       Hanya admin yang dapat melihat semua sub-bab di seluruh kursus dan sub-chapter.
 *       Mendukung fitur pencarian (search), pagination, filter, dan sorting.
 *     tags: [E-Learning SubBabs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Kata kunci pencarian berdasarkan judul Sub-Bab
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, createdAt, orderNumber]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Daftar semua Sub-Bab berhasil diambil
 *       403:
 *         description: Akses ditolak (bukan admin)
 */
router.get(
  "/all",
  authenticate,
  authorizeRoles("admin"),
  validate(getAllSubBabsSchema),
  ELearningSubBabController.getAllSubBabs
);

/**
 * @swagger
 * /api/elearningSubBab/subbabsExport:
 *   get:
 *     summary: Export data sub-bab ke Excel/CSV (Admin)
 *     description: >
 *       - Hanya **admin** yang dapat mengekspor data sub-bab.
 *       - Mendukung format **CSV** atau **Excel (.xlsx)**.
 *       - File hasil export otomatis diberi nama unik.
 *     tags: [E-Learning SubBabs]
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
  "/subbabsExport",
  authenticate,
  authorizeRoles("admin"),
  validate(exportSubBabsSchema),
  ELearningSubBabController.exportSubBabs
);

export default router;
