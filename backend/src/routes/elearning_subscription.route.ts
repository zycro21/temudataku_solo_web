import { Router } from "express";
import * as ElearningSubscriptionController from "../controllers/elearning_subscription.controller.js";
import {
  createELearningSubscriptionSchema,
  getMySubscriptionHistorySchema,
  cancelELearningSubscriptionSchema,
  getAllELearningSubscriptionsSchema,
  getAdminSubscriptionDetailSchema,
  updateSubscriptionStatusSchema,
  exportElearningSubscriptionQuerySchema,
  deleteELearningSubscriptionSchema,
} from "../validations/elearning_subscription.validation.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRole.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: E-Learning Subscription
 *   description: API untuk mengelola Subscription E-Learning Mentee
 */

/**
 * @swagger
 * /api/elearningSubscription/elearning/subscriptions:
 *   post:
 *     summary: Buy E-Learning Subscription (Mentee)
 *     description: >
 *       Endpoint untuk membeli subscription e-learning.
 *       User akan mendapatkan akses ke seluruh course e-learning
 *       sesuai durasi subscription plan yang dibeli.
 *     tags:
 *       - E-Learning Subscriptions
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *             properties:
 *               planId:
 *                 type: string
 *                 example: "plan-monthly-001"
 *               referralUsageId:
 *                 type: string
 *                 example: "ref-usage-123"
 *     responses:
 *       201:
 *         description: Subscription created successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: User atau subscription plan tidak ditemukan
 *       500:
 *         description: Internal server error
 */
router.post(
  "/elearning/subscriptions",
  authenticate,
  authorizeRoles("mentee"),
  validate(createELearningSubscriptionSchema),
  ElearningSubscriptionController.createSubscription
);

/**
 * @swagger
 * /api/elearningSubscription/elearning/subscriptions/me/active:
 *   get:
 *     summary: Get My Active E-Learning Subscription
 *     description: >
 *       Mengecek apakah user memiliki subscription e-learning yang masih aktif.
 *       Digunakan untuk gating akses course dan validasi frontend.
 *     tags:
 *       - E-Learning Subscriptions
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Active subscription found
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
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                     subscriptionId:
 *                       type: string
 *                       example: "SUB-EL-1700000000000-1234567890"
 *                     plan:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                           example: "Monthly"
 *                         durationDay:
 *                           type: number
 *                           example: 30
 *                     startAt:
 *                       type: string
 *                       format: date-time
 *                     endAt:
 *                       type: string
 *                       format: date-time
 *                     remainingDays:
 *                       type: number
 *                       example: 12
 *       200:
 *         description: No active subscription
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
 *                     isActive:
 *                       type: boolean
 *                       example: false
 *                     message:
 *                       type: string
 *                       example: "Tidak ada subscription aktif."
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  "/elearning/subscriptions/me/active",
  authenticate,
  authorizeRoles("mentee"),
  ElearningSubscriptionController.getMyActiveSubscription
);

/**
 * @swagger
 * /api/elearningSubscription/elearning/subscriptions/me:
 *   get:
 *     summary: Get My E-Learning Subscription History
 *     description: >
 *       Endpoint untuk mengambil riwayat subscription e-learning
 *       yang pernah dibeli oleh mentee.
 *       Mendukung pagination dan filter status.
 *     tags:
 *       - E-Learning Subscriptions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Nomor halaman
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Jumlah data per halaman
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, expired, cancelled]
 *         description: Filter berdasarkan status subscription
 *     responses:
 *       200:
 *         description: Subscription history fetched successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  "/elearning/subscriptions/me",
  authenticate,
  authorizeRoles("mentee"),
  validate(getMySubscriptionHistorySchema),
  ElearningSubscriptionController.getMySubscriptionHistory
);

/**
 * @swagger
 * /api/elearningSubscription/subscriptions/{id}/cancel:
 *   patch:
 *     summary: Cancel E-Learning Subscription (Mentee)
 *     description: >
 *       Endpoint untuk membatalkan subscription e-learning.
 *       Hanya dapat dilakukan jika pembayaran belum confirmed
 *       dan subscription belum aktif.
 *     tags:
 *       - E-Learning Subscriptions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID subscription
 *     responses:
 *       200:
 *         description: Subscription cancelled successfully
 *       400:
 *         description: Subscription tidak bisa dibatalkan
 *       403:
 *         description: Tidak memiliki akses
 *       404:
 *         description: Subscription tidak ditemukan
 *       500:
 *         description: Internal server error
 */
router.patch(
  "/subscriptions/:id/cancel",
  authenticate,
  authorizeRoles("mentee"),
  validate(cancelELearningSubscriptionSchema),
  ElearningSubscriptionController.cancelSubscription
);

/**
 * @swagger
 * /api/elearningSubscription/admin/elearning/subscriptions:
 *   get:
 *     summary: Get All E-Learning Subscriptions (Admin)
 *     description: >
 *       Endpoint untuk admin melihat seluruh subscription e-learning.
 *       Mendukung pagination, filtering, dan include relasi lengkap.
 *     tags:
 *       - Admin - E-Learning Subscriptions
 *     security:
 *       - BearerAuth: []
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
 *         name: status
 *         schema:
 *           type: string
 *           example: active
 *       - in: query
 *         name: planId
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: List of subscriptions
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get(
  "/admin/elearning/subscriptions",
  authenticate,
  authorizeRoles("admin"),
  validate(getAllELearningSubscriptionsSchema),
  ElearningSubscriptionController.getAllSubscriptions
);

/**
 * @swagger
 * /api/elearningSubscription/admin/elearning/subscriptions/{id}:
 *   get:
 *     summary: Get E-Learning Subscription Detail (Admin)
 *     description: >
 *       Endpoint untuk admin melihat detail subscription e-learning berdasarkan ID.
 *       Digunakan untuk audit, troubleshooting payment, dan pengecekan referral.
 *     tags:
 *       - Admin - E-Learning Subscriptions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subscription ID
 *     responses:
 *       200:
 *         description: Subscription detail retrieved successfully
 *       400:
 *         description: Invalid subscription ID
 *       404:
 *         description: Subscription tidak ditemukan
 *       500:
 *         description: Internal server error
 */
router.get(
  "/admin/elearning/subscriptions/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(getAdminSubscriptionDetailSchema),
  ElearningSubscriptionController.getSubscriptionDetail
);

/**
 * @swagger
 * /api/elearningSubscription/admin/elearning/subscriptions/{id}/status:
 *   patch:
 *     summary: Update E-Learning Subscription Status (Admin / System)
 *     description: >
 *       Endpoint untuk mengubah status subscription e-learning.
 *       Biasanya dipanggil oleh admin, webhook payment, atau cron job.
 *     tags:
 *       - Admin - E-Learning Subscriptions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subscription ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, cancelled, expired]
 *                 example: confirmed
 *               reason:
 *                 type: string
 *                 example: "Payment webhook success"
 *     responses:
 *       200:
 *         description: Subscription status updated successfully
 *       400:
 *         description: Invalid status transition
 *       404:
 *         description: Subscription tidak ditemukan
 *       500:
 *         description: Internal server error
 */
router.patch(
  "/admin/elearning/subscriptions/:id/status",
  authenticate,
  authorizeRoles("admin"),
  validate(updateSubscriptionStatusSchema),
  ElearningSubscriptionController.updateStatus
);

/**
 * @swagger
 * /api/elearningSubscription/export/elearning/subscriptions:
 *   get:
 *     summary: Export E-Learning Subscriptions (Admin)
 *     description: >
 *       Endpoint untuk mengekspor data subscription e-learning
 *       ke dalam format CSV atau Excel. Hanya dapat diakses oleh admin.
 *     tags:
 *       - E-Learning Subscriptions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         required: true
 *         schema:
 *           type: string
 *           enum: [csv, excel]
 *         description: Format file ekspor (csv atau excel)
 *     responses:
 *       200:
 *         description: File export subscription
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Format file tidak valid
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (bukan admin)
 *       500:
 *         description: Internal server error
 */
router.get(
  "/export/elearning/subscriptions",
  authenticate,
  authorizeRoles("admin"),
  validate(exportElearningSubscriptionQuerySchema),
  ElearningSubscriptionController.exportSubscriptions
);

/**
 * @swagger
 * /api/elearningSubscription/admin/elearning/subscriptions/{id}:
 *   delete:
 *     summary: Delete E-Learning Subscription (Admin)
 *     description: >
 *       Endpoint untuk menghapus subscription e-learning secara permanen dari database.
 *       Hanya dapat diakses oleh admin.
 *       Tindakan ini akan menghapus subscription beserta relasi payment
 *       (cascade sesuai konfigurasi database).
 *     tags:
 *       - E-Learning Subscriptions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID subscription e-learning
 *     responses:
 *       200:
 *         description: Subscription berhasil dihapus
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (bukan admin)
 *       404:
 *         description: Subscription tidak ditemukan
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/admin/elearning/subscriptions/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(deleteELearningSubscriptionSchema),
  ElearningSubscriptionController.deleteSubscription
);

export default router;
