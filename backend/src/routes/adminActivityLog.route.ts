import express from "express";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRole.js";
import {
  getActivityLogsValidator,
  getActivityLogByIdValidator,
  deleteActivityLogValidator,
} from "../validations/adminActivityLog.validation.js";
import * as ActivityLogController from "../controllers/adminActivityLog.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin Activity Logs
 *   description: API untuk manajemen Aktivitas Admin
 */

/**
 * @swagger
 * /api/admin_activity_logs/activity-logs:
 *   get:
 *     summary: Ambil daftar activity logs admin
 *     description: Endpoint ini hanya dapat diakses oleh admin dan digunakan untuk melihat aktivitas yang dilakukan oleh admin lain. Mendukung filter, sorting, dan pagination.
 *     tags: [Admin Activity Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter berdasarkan ID user admin
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter berdasarkan kata kunci action (contains, case-insensitive)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter berdasarkan tipe activity (misal: LOGIN, UPDATE, DELETE, CREATE)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Halaman pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 200
 *           default: 20
 *         description: Jumlah data per halaman
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt]
 *           default: createdAt
 *         description: Kolom untuk sorting
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Urutan sorting
 * 
 *     responses:
 *       200:
 *         description: Berhasil mengambil activity logs
 *         content:
 *           application/json:
 *             example:
 *               message: "Berhasil mengambil activity logs."
 *               data:
 *                 data:
 *                   - id: "log-001"
 *                     userId: "usr-admin-01"
 *                     action: "DELETE_USER"
 *                     type: "DELETE"
 *                     createdAt: "2025-12-10T10:20:00.000Z"
 *                     user:
 *                       id: "usr-admin-01"
 *                       fullName: "Admin Satu"
 *                       email: "admin@example.com"
 *                 meta:
 *                   page: 1
 *                   limit: 20
 *                   total: 120
 *                   totalPages: 6
 *
 *       400:
 *         description: Query tidak valid
 *         content:
 *           application/json:
 *             example:
 *               message: "Validation error"
 *
 *       401:
 *         description: Unauthorized — hanya admin yang boleh mengakses
 *         content:
 *           application/json:
 *             example:
 *               message: "Unauthorized. Admin only."
 *
 *       500:
 *         description: Kesalahan server
 *         content:
 *           application/json:
 *             example:
 *               message: "Terjadi kesalahan pada server."
 */
router.get(
  "/activity-logs",
  authenticate,
  authorizeRoles("admin"),
  validate(getActivityLogsValidator),
  ActivityLogController.getActivityLogs
);

/**
 * @swagger
 * /api/admin_activity_logs/activity-logs/{id}:
 *   get:
 *     summary: Ambil detail activity log berdasarkan ID (khusus admin)
 *     tags: [Admin Activity Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID activity log
 *     responses:
 *       200:
 *         description: Berhasil mengambil activity log
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Berhasil mengambil activity log.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "log-123"
 *                     userId:
 *                       type: string
 *                       example: "usr-001"
 *                     action:
 *                       type: string
 *                       example: "DELETE_SESSION"
 *                     type:
 *                       type: string
 *                       example: "mentoring"
 *                     description:
 *                       type: string
 *                       example: "Admin menghapus sesi mentoring"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-10T10:20:30.000Z"
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "usr-001"
 *                         fullName:
 *                           type: string
 *                           example: "John Doe"
 *                         email:
 *                           type: string
 *                           example: "admin@example.com"
 *       400:
 *         description: Request tidak valid
 *         content:
 *           application/json:
 *             example:
 *               message: "ID tidak valid."
 *       401:
 *         description: Unauthorized (tidak login)
 *         content:
 *           application/json:
 *             example:
 *               message: "Unauthorized. User ID not found."
 *       403:
 *         description: Forbidden (bukan admin)
 *         content:
 *           application/json:
 *             example:
 *               message: "Forbidden. Hanya admin yang dapat mengakses endpoint ini."
 *       404:
 *         description: Activity log tidak ditemukan
 *         content:
 *           application/json:
 *             example:
 *               message: "Activity log tidak ditemukan."
 *       500:
 *         description: Kesalahan internal server
 *         content:
 *           application/json:
 *             example:
 *               message: "Terjadi kesalahan pada server."
 */
router.get(
  "/activity-logs/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(getActivityLogByIdValidator),
  ActivityLogController.getActivityLogById
);

/**
 * @swagger
 * /api/admin_activity_logs/activity-logs/{id}:
 *   delete:
 *     summary: Hapus activity log berdasarkan ID
 *     description: Endpoint ini hanya dapat diakses oleh admin. Tidak boleh menghapus log tipe kritikal.
 *     tags: [Activity Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID activity log
 *     responses:
 *       200:
 *         description: Activity log berhasil dihapus
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Activity log berhasil dihapus."
 *       403:
 *         description: Log tipe kritikal tidak boleh dihapus
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Log tipe kritikal tidak boleh dihapus demi keamanan sistem."
 *       404:
 *         description: Activity log tidak ditemukan
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Activity log tidak ditemukan."
 *       401:
 *         description: Unauthorized atau bukan admin
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Unauthorized. Admin only."
 *       500:
 *         description: Kesalahan server
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Terjadi kesalahan pada server."
 */
router.delete(
  "/activity-logs/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(deleteActivityLogValidator),
  ActivityLogController.deleteActivityLog
);


/**
 * @swagger
 * /api/admin_activity_logs/activity-logs:
 *   delete:
 *     summary: Hapus semua activity logs (kecuali log kritikal)
 *     description:
 *       Endpoint khusus admin untuk menghapus seluruh activity logs.
 *       Log dengan tipe **CRITICAL**, **SECURITY**, atau **SYSTEM** tidak akan dihapus.
 *     tags: [ActivityLogs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil menghapus activity logs.
 *         content:
 *           application/json:
 *             example:
 *               message: "Activity logs berhasil dihapus."
 *               deleted: 25
 *       401:
 *         description: Unauthorized — user tidak login.
 *         content:
 *           application/json:
 *             example:
 *               message: "Unauthorized. User ID not found."
 *       403:
 *         description: Forbidden — role bukan admin.
 *         content:
 *           application/json:
 *             example:
 *               message: "Forbidden. Hanya admin yang diperbolehkan."
 *       500:
 *         description: Kesalahan server.
 *         content:
 *           application/json:
 *             example:
 *               message: "Terjadi kesalahan pada server."
 */
router.delete(
  "/activity-logs",
  authenticate,
  authorizeRoles("admin"),
  ActivityLogController.clearActivityLogs
);

export default router;
