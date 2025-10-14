import express from "express";
import {
  createUserActivity,
  getUserActivities,
  getUserActivityById,
  updateUserActivity,
  deleteUserActivity,
  getAllUserActivities,
  getRecentUserActivities,
} from "../controllers/userActivityLog.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import { authorizeRoles } from "../middlewares/authorizeRole.js";
import {
  createUserActivitySchema,
  getUserActivityListSchema,
  getUserActivityByIdSchema,
  updateUserActivitySchema,
  deleteUserActivitySchema,
  getAllUserActivitiesSchema,
  getRecentUserActivitiesSchema,
} from "../validations/userActivityLog.validation.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: UserActivity
 *   description: API untuk mencatat dan mengelola aktivitas pengguna
 */

/**
 * @swagger
 * /api/logActivity/activity:
 *   get:
 *     summary: Ambil daftar log aktivitas user (login user)
 *     tags: [UserActivity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *           example: "/dashboard"
 *         description: Cari berdasarkan path halaman
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [accessedAt, durationSec, page]
 *           example: "accessedAt"
 *         description: Urutkan berdasarkan kolom
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           example: "desc"
 *         description: Urutan hasil (naik/turun)
 *     responses:
 *       200:
 *         description: Daftar aktivitas user berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 total:
 *                   type: integer
 *                   example: 25
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPage:
 *                   type: integer
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "log_1738552312231_NF8GzQ"
 *                       page:
 *                         type: string
 *                         example: "/dashboard/user"
 *                       durationSec:
 *                         type: integer
 *                         example: 120
 *                       accessedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-10T08:00:00.000Z"
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "user_abc123"
 *                           fullName:
 *                             type: string
 *                             example: "John Doe"
 *                           email:
 *                             type: string
 *                             example: "john@example.com"
 *       401:
 *         description: Tidak terautentikasi
 */
router.get(
  "/activity",
  authenticate,
  validate(getUserActivityListSchema),
  getUserActivities
);

/**
 * @swagger
 * /api/logActivity/activity:
 *   post:
 *     summary: Tambah log aktivitas baru
 *     tags: [UserActivity]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               page:
 *                 type: string
 *                 example: "/dashboard/user"
 *               durationSec:
 *                 type: number
 *                 example: 120
 *     responses:
 *       201:
 *         description: Log aktivitas berhasil ditambahkan
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
 *                   example: "User activity log created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "log_1738552312231_NF8GzQ"
 *                     userId:
 *                       type: string
 *                       example: "user_abc123"
 *                     page:
 *                       type: string
 *                       example: "/dashboard/user"
 *                     durationSec:
 *                       type: number
 *                       example: 120
 *                     accessedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-10-10T08:00:00.000Z"
 *       401:
 *         description: Tidak terautentikasi
 */
router.post(
  "/activity",
  authenticate,
  validate(createUserActivitySchema),
  createUserActivity
);

/**
 * @swagger
 * /api/logActivity/activity/{id}:
 *   get:
 *     summary: Ambil detail log aktivitas berdasarkan ID
 *     tags: [UserActivity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: clzwf24m0000dqx2k7i09qozc
 *     responses:
 *       200:
 *         description: Detail aktivitas ditemukan
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
 *                   example: User activity log retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     page:
 *                       type: string
 *                     durationSec:
 *                       type: integer
 *                     accessedAt:
 *                       type: string
 *                       format: date-time
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         fullName:
 *                           type: string
 *                         email:
 *                           type: string
 *       404:
 *         description: Log aktivitas tidak ditemukan
 *       401:
 *         description: Tidak terautentikasi
 */
router.get(
  "/activity/:id",
  authenticate,
  validate(getUserActivityByIdSchema),
  getUserActivityById
);

/**
 * @swagger
 * /api/logActivity/activity/{id}:
 *   put:
 *     summary: Update log aktivitas
 *     tags: [UserActivity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: log_1738552312231_NF8GzQ
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               page:
 *                 type: string
 *               durationSec:
 *                 type: number
 *                 example: 120
 *     responses:
 *       200:
 *         description: Log aktivitas berhasil diupdate
 *       400:
 *         description: Bad request (validation error)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not owner nor admin
 *       404:
 *         description: Log tidak ditemukan
 */
router.put(
  "/activity/:id",
  authenticate,
  validate(updateUserActivitySchema),
  updateUserActivity
);

/**
 * @swagger
 * /api/logActivity/activity/{id}:
 *   delete:
 *     summary: Hapus log aktivitas (Admin only)
 *     tags: [UserActivity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: log_1738552312231_NF8GzQ
 *     responses:
 *       200:
 *         description: Log aktivitas berhasil dihapus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Activity log deleted successfully
 *                 deletedLog:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     page:
 *                       type: string
 *                     durationSec:
 *                       type: integer
 *                     accessedAt:
 *                       type: string
 *                       format: date-time
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         fullName:
 *                           type: string
 *                         email:
 *                           type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - hanya admin yang dapat menghapus
 *       404:
 *         description: Log tidak ditemukan
 */
router.delete(
  "/activity/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(deleteUserActivitySchema),
  deleteUserActivity
);

/**
 * @swagger
 * /api/logActivity/admin:
 *   get:
 *     summary: Ambil seluruh log aktivitas semua user (Admin only)
 *     tags: [UserActivity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *           example: "dashboard"
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [accessedAt, durationSec, page]
 *           example: "accessedAt"
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           example: "desc"
 *     responses:
 *       200:
 *         description: Berhasil mengambil seluruh log aktivitas user
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
 *                   example: All user activity logs retrieved successfully
 *                 total:
 *                   type: integer
 *                   example: 100
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 10
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "log_1738552312231_NF8GzQ"
 *                       page:
 *                         type: string
 *                         example: "/dashboard"
 *                       durationSec:
 *                         type: integer
 *                         example: 200
 *                       accessedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-12T08:00:00.000Z"
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           fullName:
 *                             type: string
 *                           email:
 *                             type: string
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Hanya admin yang dapat mengakses
 */
router.get(
  "/admin",
  authenticate,
  authorizeRoles("admin"),
  validate(getAllUserActivitiesSchema),
  getAllUserActivities
);

/**
 * @swagger
 * /api/logActivity/recent:
 *   get:
 *     summary: Ambil 5–10 aktivitas terakhir user (user login)
 *     tags: [UserActivity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 5
 *         description: Jumlah aktivitas terbaru yang ingin diambil (maks 10)
 *     responses:
 *       200:
 *         description: Aktivitas terakhir user berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 total:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "log_1738552312231_NF8GzQ"
 *                       page:
 *                         type: string
 *                         example: "/dashboard/user"
 *                       durationSec:
 *                         type: integer
 *                         example: 90
 *                       accessedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-10T08:00:00.000Z"
 *       401:
 *         description: Tidak terautentikasi
 */
router.get(
  "/recent",
  authenticate,
  validate(getRecentUserActivitiesSchema),
  getRecentUserActivities
);

export default router;
