import { Router } from "express";
import * as ElearningSubscriptionPlanController from "../controllers/elearning_subscription_plan.controller.js";
import {
  createSubscriptionPlanSchema,
  getSubscriptionPlansSchema,
  updateSubscriptionPlanSchema,
  updateSubscriptionPlanStatusSchema,
  getAllSubscriptionPlanSchema,
  getSubscriptionPlanDetailSchema,
  getAdminSubscriptionPlanDetailSchema,
  deleteSubscriptionPlanSchema,
  exportSubscriptionPlanQuerySchema,
} from "../validations/elearning_subscription_plan.validation.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRole.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: E-Learning Subscription Plan
 *   description: API untuk mengelola Subscription Plan E-Learning
 */

/**
 * @swagger
 * /api/elearningSubscriptionPlan/admin/elearning/subscription-plans:
 *   post:
 *     summary: Create E-Learning Subscription Plan (Admin)
 *     description: >
 *       Endpoint untuk membuat subscription plan e-learning
 *       (contoh: Monthly, Quarterly, Yearly).
 *     tags:
 *       - E-Learning Subscription Plans
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - durationDay
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 example: Monthly
 *               durationDay:
 *                 type: integer
 *                 example: 30
 *               price:
 *                 type: number
 *                 example: 99000
 *               description:
 *                 type: string
 *                 example: Akses semua course selama 1 bulan
 *     responses:
 *       201:
 *         description: Subscription plan created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Subscription plan already exists
 */
router.post(
  "/admin/elearning/subscription-plans",
  authenticate,
  authorizeRoles("admin"),
  validate(createSubscriptionPlanSchema),
  ElearningSubscriptionPlanController.createSubscriptionPlan
);

/**
 * @swagger
 * /api/elearningSubscriptionPlan/elearning/subscription-plans:
 *   get:
 *     summary: Get list of E-Learning Subscription Plans (Public)
 *     description: >
 *       Endpoint public untuk mengambil daftar subscription plan e-learning
 *       dengan pagination, sorting, dan filtering.
 *     tags:
 *       - E-Learning Subscription Plans
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
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, price, durationDay]
 *           example: price
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           example: asc
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *           example: true
 *     responses:
 *       200:
 *         description: List of subscription plans retrieved successfully
 */
router.get(
  "/elearning/subscription-plans",
  validate(getSubscriptionPlansSchema),
  ElearningSubscriptionPlanController.getSubscriptionPlans
);

/**
 * @swagger
 * /api/elearningSubscriptionPlan/admin/elearning/subscription-plans/{id}:
 *   put:
 *     summary: Update E-Learning Subscription Plan (Admin)
 *     description: >
 *       Endpoint untuk mengedit subscription plan e-learning.
 *       Mendukung partial update (tidak semua field wajib dikirim).
 *     tags:
 *       - E-Learning Subscription Plans
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subscription Plan ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Quarterly
 *               durationDay:
 *                 type: integer
 *                 example: 90
 *               price:
 *                 type: number
 *                 example: 249000
 *               description:
 *                 type: string
 *                 example: Akses semua course selama 3 bulan
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Subscription plan updated successfully
 *       404:
 *         description: Subscription plan not found
 *       409:
 *         description: Subscription plan with this name already exists
 */
router.put(
  "/admin/elearning/subscription-plans/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(updateSubscriptionPlanSchema),
  ElearningSubscriptionPlanController.updateSubscriptionPlan
);

/**
 * @swagger
 * /api/elearningSubscriptionPlan/admin/elearning/subscription-plans/{id}/status:
 *   patch:
 *     summary: Toggle E-Learning Subscription Plan Status (Admin)
 *     description: >
 *       Endpoint untuk mengaktifkan atau menonaktifkan subscription plan
 *       tanpa mengubah data lainnya.
 *     tags:
 *       - E-Learning Subscription Plans
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subscription Plan ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Subscription plan status updated successfully
 *       404:
 *         description: Subscription plan not found
 */
router.patch(
  "/admin/elearning/subscription-plans/:id/status",
  authenticate,
  authorizeRoles("admin"),
  validate(updateSubscriptionPlanStatusSchema),
  ElearningSubscriptionPlanController.updateSubscriptionPlanStatus
);

/**
 * @swagger
 * /api/elearningSubscriptionPlan/admin/elearning/subscription-plans:
 *   get:
 *     summary: Get All E-Learning Subscription Plans (Admin)
 *     description: >
 *       Endpoint untuk menampilkan seluruh subscription plan e-learning
 *       untuk admin (global view), dengan pagination, sorting, dan filtering.
 *     tags:
 *       - E-Learning Subscription Plans
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
 *         name: sortBy
 *         schema:
 *           type: string
 *           example: createdAt
 *         description: Field untuk sorting (name | price | durationDay | createdAt)
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           example: desc
 *         description: Urutan sorting (asc | desc)
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *           example: true
 *         description: Filter status aktif / non-aktif
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: Monthly
 *         description: Pencarian berdasarkan nama plan
 *     responses:
 *       200:
 *         description: List subscription plan berhasil diambil
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
 *                   example: Subscription plans fetched successfully
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalData:
 *                       type: integer
 *                       example: 3
 *                     totalPage:
 *                       type: integer
 *                       example: 1
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: spn_abc123
 *                       name:
 *                         type: string
 *                         example: Monthly
 *                       durationDay:
 *                         type: integer
 *                         example: 30
 *                       price:
 *                         type: number
 *                         example: 99000
 *                       description:
 *                         type: string
 *                         example: Akses semua course selama 1 bulan
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 */
router.get(
  "/admin/elearning/subscription-plans",
  authenticate,
  authorizeRoles("admin"),
  validate(getAllSubscriptionPlanSchema),
  ElearningSubscriptionPlanController.getAllSubscriptionPlans
);

/**
 * @swagger
 * /api/elearningSubscriptionPlan/elearning/subscription-plans/{id}:
 *   get:
 *     summary: Get E-Learning Subscription Plan Detail (Public)
 *     description: >
 *       Endpoint public untuk melihat detail subscription plan e-learning
 *       berdasarkan ID. Hanya menampilkan plan yang aktif.
 *     tags:
 *       - E-Learning Subscription Plans
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: spn_abc123
 *         description: ID subscription plan
 *     responses:
 *       200:
 *         description: Subscription plan detail fetched successfully
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
 *                   example: Subscription plan detail fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: spn_abc123
 *                     name:
 *                       type: string
 *                       example: Monthly
 *                     durationDay:
 *                       type: integer
 *                       example: 30
 *                     price:
 *                       type: number
 *                       example: 99000
 *                     description:
 *                       type: string
 *                       example: Akses semua course selama 1 bulan
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Subscription plan not found
 */
router.get(
  "/elearning/subscription-plans/:id",
  validate(getSubscriptionPlanDetailSchema),
  ElearningSubscriptionPlanController.getSubscriptionPlanDetail
);

/**
 * @swagger
 * /api/elearningSubscriptionPlan/admin/elearning/subscription-plans/{id}:
 *   get:
 *     summary: Get E-Learning Subscription Plan Detail (Admin)
 *     description: >
 *       Endpoint untuk melihat detail subscription plan e-learning
 *       berdasarkan ID. Endpoint ini khusus admin dan dapat
 *       menampilkan plan aktif maupun non-aktif.
 *     tags:
 *       - E-Learning Subscription Plans
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: spn_abc123
 *         description: ID subscription plan
 *     responses:
 *       200:
 *         description: Subscription plan detail fetched successfully
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
 *                   example: Subscription plan detail fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: spn_abc123
 *                     name:
 *                       type: string
 *                       example: Monthly
 *                     durationDay:
 *                       type: integer
 *                       example: 30
 *                     price:
 *                       type: number
 *                       example: 99000
 *                     description:
 *                       type: string
 *                       example: Akses semua course selama 1 bulan
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                     totalSubscriptions:
 *                       type: integer
 *                       example: 120
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Subscription plan not found
 */
router.get(
  "/admin/elearning/subscription-plans/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(getAdminSubscriptionPlanDetailSchema),
  ElearningSubscriptionPlanController.getSubscriptionPlanDetailAdmin
);

/**
 * @swagger
 * /api/elearningSubscriptionPlan/admin/elearning/subscription-plans/{id}:
 *   delete:
 *     summary: Delete E-Learning Subscription Plan (Admin)
 *     description: >
 *       Endpoint untuk menghapus subscription plan e-learning.
 *       Jika plan belum pernah digunakan, maka akan dihapus permanen.
 *       Jika plan sudah memiliki subscription, maka akan dinonaktifkan (soft delete).
 *     tags:
 *       - E-Learning Subscription Plans
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: spn_abc123
 *         description: ID subscription plan
 *     responses:
 *       200:
 *         description: Subscription plan deleted or deactivated successfully
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
 *                   example: Subscription plan deactivated because it has active subscriptions
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: spn_abc123
 *                     action:
 *                       type: string
 *                       example: SOFT_DELETE
 *       404:
 *         description: Subscription plan not found
 */
router.delete(
  "/admin/elearning/subscription-plans/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(deleteSubscriptionPlanSchema),
  ElearningSubscriptionPlanController.deleteSubscriptionPlan
);

/**
 * @swagger
 * /api/elearningSubscriptionPlan/export/admin/elearning/subscription-plans:
 *   get:
 *     summary: Export E-Learning Subscription Plans (Admin)
 *     description: >
 *       Endpoint untuk mengekspor data subscription plan e-learning
 *       ke dalam format CSV atau Excel. Hanya dapat diakses oleh admin.
 *     tags:
 *       - E-Learning Subscription Plans
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
 *         description: File export subscription plan
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
  "/export/admin/elearning/subscription-plans",
  authenticate,
  authorizeRoles("admin"),
  validate(exportSubscriptionPlanQuerySchema),
  ElearningSubscriptionPlanController.exportSubscriptionPlans
);

export default router;
