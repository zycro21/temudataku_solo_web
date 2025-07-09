import { Router } from "express";
import * as BehaviorController from "../controllers/behavior.controller";
import {
  createUserBehaviorSchema,
  getAllAdminUserBehaviorsSchema,
  getUserBehaviorByIdSchema,
  deleteUserBehaviorByIdSchema,
  exportUserBehaviorsSchema,
} from "../validations/behavior.validation";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorizeRole";
import {
  handleThumbnailUpload,
  handlePracticeFileUpload,
} from "../middlewares/uploadImage";
import { preloadPracticeTitle } from "../middlewares/preloadTitlePractice";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Behavior
 *   description: Manajemen perilaku dan aktivitas pengguna
 */

/**
 * @swagger
 * /api/behavior/user-behaviors:
 *   post:
 *     summary: Tambahkan data perilaku pengguna
 *     tags: [Behavior]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pageVisited
 *               - action
 *             properties:
 *               pageVisited:
 *                 type: string
 *               action:
 *                 type: string
 *           example:
 *             pageVisited: "/dashboard"
 *             action: "click_button_view_project"
 *     responses:
 *       201:
 *         description: Data perilaku berhasil ditambahkan
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: User behavior recorded successfully.
 *               data:
 *                 id: "bhv-123"
 *                 userId: "000001"
 *                 pageVisited: "/dashboard"
 *                 action: "click_button_view_project"
 *                 timestamp: "2025-07-01T00:00:00.000Z"
 *                 ipAddress: "123.123.123.123"
 *                 userAgent: "Mozilla/5.0"
 *                 createdAt: "2025-07-01T00:00:00.000Z"
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Page visited and action are required
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Unauthorized access
 */
router.post(
  "/user-behaviors",
  authenticate,
  validate(createUserBehaviorSchema),
  BehaviorController.createUserBehaviorController
);

/**
 * @swagger
 * /api/behavior/admin/user-behaviors:
 *   get:
 *     summary: Ambil semua data perilaku pengguna (admin only)
 *     tags: [Behavior]
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
 *         name: userId
 *         schema:
 *           type: string
 *           example: "000001"
 *       - in: query
 *         name: pageVisited
 *         schema:
 *           type: string
 *           example: "/dashboard"
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           example: "click_view_detail"
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-06-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-06-30"
 *     responses:
 *       200:
 *         description: Berhasil mengambil semua data
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: User behaviors retrieved successfully.
 *               data:
 *                 total: 120
 *                 page: 1
 *                 limit: 10
 *                 totalPages: 12
 *                 data:
 *                   - id: "bhv-001"
 *                     userId: "000001"
 *                     user:
 *                       id: "000001"
 *                       fullName: "Budi"
 *                       email: "budi@mail.com"
 *                     pageVisited: "/dashboard"
 *                     action: "click_view_detail"
 *                     timestamp: "2025-07-01T00:00:00.000Z"
 *                     ipAddress: "123.123.123.123"
 *                     userAgent: "Mozilla/5.0"
 *                     createdAt: "2025-07-01T00:00:00.000Z"
 *       401:
 *         description: Unauthorized (tidak ada token)
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Unauthorized
 *       403:
 *         description: Forbidden (bukan admin)
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Unauthorized: Only admins can view user behaviors"
 */
router.get(
  "/admin/user-behaviors",
  authenticate,
  authorizeRoles("admin"),
  validate(getAllAdminUserBehaviorsSchema),
  BehaviorController.getAllAdminUserBehaviorsController
);

/**
 * @swagger
 * /api/behavior/admin/user-behaviors/{id}:
 *   get:
 *     summary: Ambil data perilaku pengguna berdasarkan ID (admin only)
 *     tags: [Behavior]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID dari data perilaku pengguna
 *         schema:
 *           type: string
 *           example: "bhv-001"
 *     responses:
 *       200:
 *         description: Berhasil mengambil data perilaku
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: User behavior retrieved successfully.
 *               data:
 *                 id: "bhv-001"
 *                 userId: "000001"
 *                 user:
 *                   id: "000001"
 *                   fullName: "Budi"
 *                   email: "budi@mail.com"
 *                 pageVisited: "/dashboard"
 *                 action: "click_view_detail"
 *                 timestamp: "2025-07-01T00:00:00.000Z"
 *                 ipAddress: "123.123.123.123"
 *                 userAgent: "Mozilla/5.0"
 *                 createdAt: "2025-07-01T00:00:00.000Z"
 *       401:
 *         description: Unauthorized (token tidak valid atau tidak ada)
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Unauthorized
 *       403:
 *         description: Forbidden (bukan admin)
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Unauthorized: Only admins can view user behavior details"
 *       404:
 *         description: Data tidak ditemukan
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: User behavior not found
 */
router.get(
  "/admin/user-behaviors/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(getUserBehaviorByIdSchema),
  BehaviorController.getUserBehaviorByIdController
);

/**
 * @swagger
 * /api/behavior/admin/user-behaviors/{id}:
 *   delete:
 *     summary: Hapus data behavior pengguna berdasarkan ID (admin only)
 *     tags: [Behavior]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dari data perilaku
 *     responses:
 *       200:
 *         description: Data berhasil dihapus
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: User behavior deleted successfully.
 *               data:
 *                 id: "bhv-001"
 *                 userId: "000001"
 *                 user:
 *                   id: "000001"
 *                   fullName: "Budi"
 *                   email: "budi@mail.com"
 *                 pageVisited: "/dashboard"
 *                 action: "click_view_detail"
 *                 timestamp: "2025-07-01T00:00:00.000Z"
 *                 ipAddress: "123.123.123.123"
 *                 userAgent: "Mozilla/5.0"
 *                 createdAt: "2025-07-01T00:00:00.000Z"
 *       401:
 *         description: Unauthorized (token tidak valid atau tidak ada)
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Unauthorized
 *       403:
 *         description: Forbidden (bukan admin)
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Unauthorized: Only admins can delete user behavior"
 *       404:
 *         description: Data tidak ditemukan
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: User behavior not found
 */
router.delete(
  "/admin/user-behaviors/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(deleteUserBehaviorByIdSchema),
  BehaviorController.deleteUserBehaviorByIdController
);

/**
 * @swagger
 * /api/behavior/admin/user-behaviors-export:
 *   get:
 *     summary: Export data perilaku pengguna dalam format file (admin only)
 *     tags: [Behavior]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         required: true
 *         schema:
 *           type: string
 *           enum: [csv, xlsx]
 *         description: Format file ekspor (csv atau xlsx)
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter berdasarkan ID pengguna
 *       - in: query
 *         name: pageVisited
 *         schema:
 *           type: string
 *         description: Filter berdasarkan halaman yang dikunjungi
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter berdasarkan aksi pengguna
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal mulai filter (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal akhir filter (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: File berhasil dihasilkan dan dikirim
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Bad Request (misalnya format tidak valid)
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Format harus csv atau xlsx
 *       401:
 *         description: Unauthorized (tidak ada token)
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Unauthorized
 *       403:
 *         description: Forbidden (bukan admin)
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Unauthorized: Only admins can export user behaviors"
 */
router.get(
  "/admin/user-behaviors-export",
  authenticate,
  authorizeRoles("admin"),
  validate(exportUserBehaviorsSchema),
  BehaviorController.exportUserBehaviorsController
);

export default router;
