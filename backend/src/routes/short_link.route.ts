import express from "express";
import {
  createShortLinkController,
  getAllShortLinksController,
  getMyShortLinksController,
  getShortLinkByIdController,
  updateShortLinkController,
  deleteShortLinkController,
  redirectShortCodeController,
} from "../controllers/short_link.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRole.js";
import { validate } from "../middlewares/validate.js";
import {
  createShortLinkSchema,
  getAllShortLinksSchema,
  getMyShortLinksSchema,
  getShortLinkByIdSchema,
  updateShortLinkSchema,
  deleteShortLinkSchema,
} from "../validations/short_link.validation.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Short Link
 *   description: Manajemen short link
 */

/**
 * @swagger
 * /api/shortlink/shortlinks:
 *   post:
 *     summary: Membuat short link baru (otomatis atau manual, login required)
 *     description:
 *       Endpoint ini membuat short link baru. Jika `shortCode` tidak diisi, sistem akan membuat secara otomatis (6 karakter acak).
 *       Jika diisi, maka harus berupa 6–40 karakter alfanumerik dengan simbol `_` atau `-`.
 *       Default masa berlaku (expiresAt) adalah 15 hari sejak pembuatan.
 *     tags: [ShortLinks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               originalUrl:
 *                 type: string
 *                 example: "https://temudataku.com/course/ml101"
 *               shortCode:
 *                 type: string
 *                 description: Custom short code (optional, 6–40 chars, alphanumeric, `_` atau `-`).
 *                 example: "ml_course_2025"
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 description: Waktu kedaluwarsa (opsional, default 15 hari dari sekarang)
 *                 example: "2025-12-31T23:59:59.000Z"
 *               isActive:
 *                 type: boolean
 *                 description: Status aktif short link (default true)
 *                 example: true
 *     responses:
 *       201:
 *         description: Short link berhasil dibuat
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
 *                   example: "Short link created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "clz8m4r9d0000xv6r1gj2q3tk"
 *                     shortCode:
 *                       type: string
 *                       example: "ml_course_2025"
 *                     originalUrl:
 *                       type: string
 *                       example: "https://temudataku.com/course/ml101"
 *                     createdById:
 *                       type: string
 *                       example: "usr_abc123"
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                     clickCount:
 *                       type: integer
 *                       example: 0
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 */
router.post(
  "/shortlinks",
  authenticate,
  validate(createShortLinkSchema),
  createShortLinkController
);

/**
 * @swagger
 * /api/shortlink/shortlinks:
 *   get:
 *     summary: Ambil semua short links (admin only)
 *     description:
 *       Endpoint ini digunakan oleh admin untuk melihat semua short link yang pernah dibuat oleh semua user.
 *       Dapat difilter dengan `search` dan diurutkan berdasarkan `createdAt` atau `clickCount`.
 *     tags: [ShortLinks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Cari berdasarkan `shortCode` atau `originalUrl`
 *         example: "ml_course"
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [createdAt, clickCount]
 *           default: createdAt
 *         description: Urutkan berdasarkan field tertentu
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Arah pengurutan hasil (ascending atau descending)
 *     responses:
 *       200:
 *         description: Daftar semua short link berhasil diambil
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
 *                   example: "Short links retrieved successfully"
 *                 total:
 *                   type: integer
 *                   example: 12
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "clz8m4r9d0000xv6r1gj2q3tk"
 *                       shortCode:
 *                         type: string
 *                         example: "ml_course_2025"
 *                       originalUrl:
 *                         type: string
 *                         example: "https://temudataku.com/course/ml101"
 *                       clickCount:
 *                         type: integer
 *                         example: 4
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *                       expiresAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-12-31T23:59:59.000Z"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-27T08:00:00.000Z"
 *                       createdBy:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "usr_abc123"
 *                           fullName:
 *                             type: string
 *                             example: "Dimas Putra"
 *                           email:
 *                             type: string
 *                             example: "dimas@temudataku.com"
 */
router.get(
  "/shortlinks",
  authenticate,
  authorizeRoles("admin"),
  validate(getAllShortLinksSchema),
  getAllShortLinksController
);

/**
 * @swagger
 * /api/shortlink/shortlinks/my:
 *   get:
 *     summary: Ambil daftar short links milik user yang sedang login
 *     description: |
 *       Endpoint ini digunakan untuk mendapatkan daftar short links yang dibuat oleh user yang sedang login.
 *       Mendukung fitur **pagination**, **pencarian**, dan **sorting** berdasarkan `createdAt` atau `clickCount`.
 *     tags: [ShortLinks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Nomor halaman (default 1)
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: limit
 *         in: query
 *         description: Jumlah data per halaman (default 10)
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *       - name: search
 *         in: query
 *         description: Kata kunci untuk mencari berdasarkan `shortCode` atau `originalUrl`
 *         required: false
 *         schema:
 *           type: string
 *           example: "promo"
 *       - name: sort_by
 *         in: query
 *         description: Kolom untuk pengurutan data
 *         required: false
 *         schema:
 *           type: string
 *           enum: [createdAt, clickCount]
 *           default: createdAt
 *       - name: order
 *         in: query
 *         description: Urutan data (asc atau desc)
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar short links milik user yang sedang login
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
 *                   example: "My short links retrieved"
 *                 total:
 *                   type: integer
 *                   example: 25
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "clz3a5v3l0000h7b6bts3nlkf"
 *                       shortCode:
 *                         type: string
 *                         example: "promo2025"
 *                       originalUrl:
 *                         type: string
 *                         example: "https://temudataku.com/promo/launch"
 *                       createdById:
 *                         type: string
 *                         example: "user12345"
 *                       expiresAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: "2025-12-31T23:59:59Z"
 *                       clickCount:
 *                         type: integer
 *                         example: 47
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-26T12:00:00Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: "2025-10-27T08:30:00Z"
 *       401:
 *         description: Token tidak valid atau belum login
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
 *                   example: "Unauthorized"
 *       500:
 *         description: Kesalahan server saat mengambil data short link
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
 *                   example: "Internal server error"
 */
router.get(
  "/shortlinks/my",
  authenticate,
  validate(getMyShortLinksSchema),
  getMyShortLinksController
);

/**
 * @swagger
 * /api/shortlink/shortlinks/{id}:
 *   get:
 *     summary: Ambil detail short link berdasarkan ID (hanya pembuat atau admin)
 *     description: 
 *       Endpoint ini digunakan untuk mengambil detail sebuah short link berdasarkan ID. 
 *       Hanya **admin** atau **pemilik link** yang dapat mengakses data ini.
 *     tags: [ShortLinks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID unik short link
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detail short link berhasil diambil
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
 *                       example: clz72g8mn0000t90j8y6v2s9r
 *                     shortCode:
 *                       type: string
 *                       example: ml001
 *                     originalUrl:
 *                       type: string
 *                       example: https://temudataku.com/presensi/kelas-ml
 *                     createdById:
 *                       type: string
 *                       nullable: true
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     clickCount:
 *                       type: integer
 *                       example: 5
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     createdBy:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: clz72g8mn0000t90j8y6v2s9r
 *                         fullName:
 *                           type: string
 *                           example: Dimas Putra
 *                         email:
 *                           type: string
 *                           example: dimas@example.com
 *       401:
 *         description: Tidak memiliki izin untuk melihat short link ini
 *       404:
 *         description: Short link tidak ditemukan
 */
router.get(
  "/shortlinks/:id",
  authenticate,
  validate(getShortLinkByIdSchema),
  getShortLinkByIdController
);

/**
 * @swagger
 * /api/shortlink/shortlinks/{id}:
 *   put:
 *     summary: Update short link (hanya admin atau pembuat)
 *     description: Dapat digunakan untuk memperbarui shortCode, tanggal kadaluarsa, atau status aktif. Tidak dapat mengubah original URL.
 *     tags: [ShortLinks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID short link yang ingin diperbarui
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shortCode:
 *                 type: string
 *                 example: "ml001"
 *                 description: Custom short code (unik, opsional)
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-12-31T23:59:59.000Z"
 *                 description: Tanggal kadaluarsa baru
 *               isActive:
 *                 type: boolean
 *                 example: true
 *                 description: Status aktif short link
 *     responses:
 *       200:
 *         description: Short link berhasil diperbarui
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
 *                   example: "Short link updated"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "clu9hd8yv0009xuzp7q8f6m2d"
 *                     shortCode:
 *                       type: string
 *                       example: "ml001"
 *                     originalUrl:
 *                       type: string
 *                       example: "https://temudataku.com/presensi/kelas-ml"
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                     expiresAt:
 *                       type: string
 *                       example: "2025-12-31T23:59:59.000Z"
 *       404:
 *         description: Short link tidak ditemukan
 *       403:
 *         description: Tidak memiliki izin untuk mengubah short link ini
 */
router.put(
  "/shortlinks/:id",
  authenticate,
  validate(updateShortLinkSchema),
  updateShortLinkController
);

/**
 * @swagger
 * /api/shortlink/shortlinks/{id}:
 *   delete:
 *     summary: Hapus short link (hanya admin)
 *     description: Endpoint ini hanya dapat diakses oleh admin untuk menghapus short link berdasarkan ID.
 *     tags: [ShortLinks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID short link yang ingin dihapus
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Short link berhasil dihapus
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
 *                   example: "Short link deleted"
 *       403:
 *         description: Tidak memiliki izin untuk menghapus short link
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
 *                   example: "Only admin can delete short links"
 *       404:
 *         description: Short link tidak ditemukan
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
 *                   example: "Short link not found"
 */
router.delete(
  "/shortlinks/:id",
  authenticate,
  validate(deleteShortLinkSchema),
  deleteShortLinkController
);

/**
 * @swagger
 * /s/{shortCode}:
 *   get:
 *     summary: Redirect short code ke originalUrl (public)
 *     tags: [ShortLinks]
 */
router.get("/s/:shortCode", redirectShortCodeController);

export default router;
