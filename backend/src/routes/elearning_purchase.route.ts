import express from "express";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRole.js";
import {
  createPurchaseController,
  getMyPurchasesController,
  getPurchaseDetailController,
  cancelPurchaseController,
  getAllPurchasesController,
} from "../controllers/elearning_purchase.controller.js";
import {
  createELearningPurchaseSchema,
  getMyPurchasesSchema,
  getPurchaseDetailSchema,
  cancelPurchaseSchema,
  getAllPurchasesSchema,
} from "../validations/elearning_purchase.validation.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: E-Learning Purchase
 *   description: API untuk mengelola pembelian E-Learning
 */

/**
 * @swagger
 * /api/elearningPurchase/courses/{id}/purchase:
 *   post:
 *     summary: Membeli course oleh mentee
 *     description: Mentee melakukan pembelian course. Sistem membuat ELearningPurchase + Payment, termasuk perhitungan referral jika ada.
 *     tags: [E-Learning Purchases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID course yang akan dibeli
 *         schema:
 *           type: string
 *           example: "course-abc123"
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               referralUsageId:
 *                 type: string
 *                 example: "referral-xyz789"
 *     responses:
 *       201:
 *         description: Purchase berhasil dibuat
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
 *                   example: Purchase berhasil dibuat
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "ELP-1234567890"
 *                     userId:
 *                       type: string
 *                       example: "user-abc"
 *                     courseId:
 *                       type: string
 *                       example: "course-abc123"
 *                     referralUsageId:
 *                       type: string
 *                       example: "referral-xyz789"
 *                     status:
 *                       type: string
 *                       example: "pending"
 *                     purchaseDate:
 *                       type: string
 *                       format: date-time
 *                     payment:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "PAY-EL-20250701-1234567890"
 *                         eLearningPurchaseId:
 *                           type: string
 *                           example: "ELP-1234567890"
 *                         amount:
 *                           type: number
 *                           example: 100000
 *                         status:
 *                           type: string
 *                           example: "pending"
 *                     originalPrice:
 *                       type: number
 *                       example: 100000
 *                     finalPrice:
 *                       type: number
 *                       example: 90000
 *       400:
 *         description: Bad request (duplicate purchase, referral invalid)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Anda sudah membeli course ini
 *       404:
 *         description: Course, referral usage, atau user tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: Course tidak ditemukan atau tidak aktif
 *       500:
 *         description: Error server (misal gagal generate ID unik)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Gagal generate payment id
 */
router.post(
  "/courses/:id/purchase",
  authenticate,
  authorizeRoles("mentee"),
  validate(createELearningPurchaseSchema),
  createPurchaseController
);

/**
 * @swagger
 * /api/elearning/purchases/me:
 *   get:
 *     summary: Lihat daftar pembelian (mentee)
 *     description: Mentee melihat daftar kursus yang sudah dibeli. Mendukung paging, search dan filter status.
 *     tags: [E-Learning Purchases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Daftar pembelian
 */
router.get(
  "/me",
  authenticate,
  authorizeRoles("mentee"),
  validate(getMyPurchasesSchema),
  getMyPurchasesController
);

/**
 * @swagger
 * /api/elearning/purchases/{id}:
 *   get:
 *     summary: Detail pembelian (mentee, mentor, admin)
 *     description: Melihat detail satu pembelian. Mentor hanya bisa mengakses jika course yang bersangkutan miliknya.
 *     tags: [E-Learning Purchases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detail purchase
 */
router.get(
  "/:id",
  authenticate,
  authorizeRoles("mentee", "mentor", "admin"),
  validate(getPurchaseDetailSchema),
  getPurchaseDetailController
);

/**
 * @swagger
 * /api/elearning/purchases/{id}/cancel:
 *   delete:
 *     summary: Batalkan pembelian (mentee)
 *     description: Mentee dapat membatalkan pembelian (misal sebelum bayar). Hanya owner dan status tertentu (pending) dapat dibatalkan.
 *     tags: [E-Learning Purchases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pembelian dibatalkan
 */
router.delete(
  "/:id/cancel",
  authenticate,
  authorizeRoles("mentee"),
  validate(cancelPurchaseSchema),
  cancelPurchaseController
);

/**
 * @swagger
 * /api/elearning/purchases:
 *   get:
 *     summary: Semua pembelian (admin, mentor)
 *     description: Admin melihat semua pembelian. Mentor hanya melihat pembelian untuk course yang dia ampu.
 *     tags: [E-Learning Purchases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *       - name: sortBy
 *         in: query
 *         schema:
 *           type: string
 *       - name: sortOrder
 *         in: query
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Daftar pembelian
 */
router.get(
  "/",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(getAllPurchasesSchema),
  getAllPurchasesController
);

export default router;
