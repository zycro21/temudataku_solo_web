import express from "express";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRole.js";
import {
  createTextSchema,
  updateTextSchema,
  getTextsBySubBabSchema,
  getTextByIdSchema,
  deleteTextSchema,
  reorderTextSchema,
  searchTextSchema,
  exportTextSchema,
} from "../validations/elearning_text.validation.js";
import { ELearningTextController } from "../controllers/elearning_text.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: E-Learning Texts & Blocks
 *     description: Manajemen materi teks dan bagian2 teks (blocks) pada sub-bab
 */

/**
 * @swagger
 * /api/elearningText/subbabs/{subBabId}/texts:
 *   get:
 *     summary: Mendapatkan daftar teks/materi dalam sub-bab
 *     description:
 *       - Admin: dapat melihat semua teks dari sub-bab mana pun.
 *       - Mentor: hanya dapat melihat teks dari course yang dia ampu.
 *       - Mentee: hanya dapat melihat teks jika memiliki subscription aktif.
 *     tags: [E-Learning Texts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subBabId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID sub-bab yang ingin diambil teksnya.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Halaman untuk pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Jumlah item per halaman
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: "AI"
 *         description: Pencarian berdasarkan judul atau isi teks
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, createdAt, orderNumber]
 *           example: "orderNumber"
 *         description: Kolom untuk pengurutan
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           example: "asc"
 *         description: Urutan hasil (asc / desc)
 *     responses:
 *       200:
 *         description: Daftar teks berhasil diambil
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Sub-bab tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.get(
  "/subbabs/:subBabId/texts",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee", "cm", "curdev"),
  validate(getTextsBySubBabSchema),
  ELearningTextController.getTextsBySubBab
);

/**
 * @swagger
 * /api/elearningText/texts/{id}:
 *   get:
 *     summary: Mendapatkan detail teks/materi
 *     description:
 *       - Admin: dapat melihat teks dari sub-bab mana pun.
 *       - Mentor: hanya dapat melihat teks dari course yang dia ampu.
 *       - Mentee: hanya dapat melihat teks dari course yang sudah dibeli.
 *     tags: [E-Learning Texts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID teks yang ingin diambil
 *     responses:
 *       200:
 *         description: Detail teks berhasil diambil
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Teks tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.get(
  "/texts/:id",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee", "cm", "curdev"),
  validate(getTextByIdSchema),
  ELearningTextController.getTextById
);

/**
 * @swagger
 * /api/elearningText/subbabs/{subBabId}/texts:
 *   post:
 *     summary: Tambah teks baru ke sub-bab
 *     description: >
 *       Admin dapat menambahkan teks ke sub-bab mana pun.
 *       Mentor hanya bisa menambahkan teks ke course yang dia ampu.
 *       Setiap teks wajib memiliki minimal 1 block konten.
 *     tags: [E-Learning Texts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subBabId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID sub-bab tempat teks ditambahkan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [blocks]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Apa itu Artificial Intelligence?"
 *               blocks:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required: [content, order]
 *                   properties:
 *                     content:
 *                       type: string
 *                       example: "Artificial Intelligence adalah cabang ilmu komputer..."
 *                     order:
 *                       type: integer
 *                       example: 1
 *     responses:
 *       201:
 *         description: Teks berhasil ditambahkan
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
  "/subbabs/:subBabId/texts",
  authenticate,
  authorizeRoles("admin", "mentor", "cm", "curdev"),
  validate(createTextSchema),
  ELearningTextController.createText
);

/**
 * @swagger
 * /api/elearningText/texts/{id}:
 *   put:
 *     summary: Mengedit teks pada sub-bab
 *     description:
 *       - Admin dapat mengedit teks dari sub-bab mana pun.
 *       - Mentor hanya dapat mengedit teks dari course yang dia ampu.
 *     tags: [E-Learning Texts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID teks yang ingin diupdate
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Pengantar Machine Learning"
 *               orderNumber:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Teks berhasil diupdate
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Teks tidak ditemukan
 *       409:
 *         description: orderNumber duplikat
 */
router.put(
  "/texts/:id",
  authenticate,
  authorizeRoles("admin", "mentor", "cm", "curdev"),
  validate(updateTextSchema),
  ELearningTextController.updateText
);

/**
 * @swagger
 * /api/elearningText/texts/{id}:
 *   delete:
 *     summary: Menghapus teks dari sub-bab
 *     description: |
 *       - Hanya **Admin** yang dapat menghapus teks.
 *       - Setelah penghapusan, urutan teks (orderNumber) akan diatur ulang agar berurutan kembali.
 *     tags: [E-Learning Texts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID teks yang ingin dihapus
 *     responses:
 *       200:
 *         description: Teks berhasil dihapus dan urutan diperbarui
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Teks tidak ditemukan
 */
router.delete(
  "/texts/:id",
  authenticate,
  authorizeRoles("admin", "cm", "curdev"),
  validate(deleteTextSchema),
  ELearningTextController.deleteText
);

/**
 * @swagger
 * /api/elearningText/subbabs/{subBabId}/texts/reorder:
 *   put:
 *     summary: Mengubah urutan (orderNumber) beberapa teks sekaligus
 *     description: Hanya admin yang dapat melakukan reorder teks di dalam sub-bab tertentu.
 *     tags: [E-Learning Texts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subBabId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID sub-bab tempat teks berada
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orders]
 *             properties:
 *               orders:
 *                 type: array
 *                 description: Daftar teks beserta urutan baru
 *                 items:
 *                   type: object
 *                   required: [id, orderNumber]
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "txt_abc123"
 *                     orderNumber:
 *                       type: integer
 *                       example: 2
 *     responses:
 *       200:
 *         description: Urutan teks berhasil diperbarui
 *       400:
 *         description: Data tidak valid
 *       403:
 *         description: Akses ditolak (hanya admin)
 *       404:
 *         description: Sub-bab tidak ditemukan
 *       409:
 *         description: orderNumber duplikat
 *       500:
 *         description: Kesalahan server
 */
router.put(
  "/subbabs/:subBabId/texts/reorder",
  authenticate,
  authorizeRoles("admin"),
  validate(reorderTextSchema),
  ELearningTextController.reorderTexts
);

/**
 * @swagger
 * /api/elearningText/search:
 *   get:
 *     summary: Mencari teks di seluruh sub-bab (khusus admin)
 *     description: Admin dapat mencari teks di semua sub-bab berdasarkan kata kunci, dengan pagination, sorting, dan filter.
 *     tags: [E-Learning Texts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Kata kunci pencarian berdasarkan judul atau isi teks
 *       - in: query
 *         name: subBabId
 *         schema:
 *           type: string
 *         description: Filter berdasarkan ID sub-bab tertentu
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
 *         description: Jumlah item per halaman
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, title, orderNumber]
 *           default: createdAt
 *         description: Field untuk sorting
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Urutan sorting
 *     responses:
 *       200:
 *         description: Daftar hasil pencarian teks
 *       403:
 *         description: Akses ditolak (bukan admin)
 */
router.get(
  "/search",
  authenticate,
  authorizeRoles("admin"),
  validate(searchTextSchema),
  ELearningTextController.searchTexts
);

/**
 * @swagger
 * /api/elearningtext/exportText:
 *   get:
 *     summary: Export data teks materi ke Excel/CSV (Admin)
 *     description: >
 *       - Hanya **admin** yang dapat mengekspor data teks materi.
 *       - Mendukung format **CSV** atau **Excel (.xlsx)**.
 *       - File hasil export otomatis diberi nama unik.
 *     tags: [E-Learning Texts]
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
  "/exportText",
  authenticate,
  authorizeRoles("admin"),
  validate(exportTextSchema),
  ELearningTextController.exportTexts
);


export default router;
