import { Router } from "express";
import * as PaymentController from "../controllers/payment.controller";
import {
  createPaymentSchema,
  getAdminPaymentsSchema,
  getAdminPaymentsDetailSchema,
  getExportPaymentsSchema,
  getMyPaymentsSchema,
  updatePaymentStatusSchema,
  getMyPaymentDetailSchema,
} from "../validations/payment.validation";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorizeRole";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Manajemen pembayaran pengguna
 */

/**
 * @swagger
 * /api/payment/payments/create:
 *   post:
 *     summary: Buat payment baru
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [referenceId, paymentMethod]
 *             properties:
 *               referenceId:
 *                 type: string
 *                 example: "b4e9b95e-2129-44e7-a84f-f0f33b4d23e1"
 *               paymentMethod:
 *                 type: string
 *                 example: "VC"
 *                 # Kode metode pembayaran Duitku
 *     responses:
 *       201:
 *         description: Payment berhasil dibuat
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
 *                   example: Payment created successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     reference:
 *                       type: string
 *                       example: "D1234567890"
 *                     paymentUrl:
 *                       type: string
 *                       example: "https://sandbox.duitku.com/redirect-url"
 *                     amount:
 *                       type: number
 *                       example: 100000
 *                     statusCode:
 *                       type: string
 *                       example: "00"
 *                     statusMessage:
 *                       type: string
 *                       example: "SUCCESS"
 *       400:
 *         description: Request tidak valid
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
 *                   example: "Validation failed: referenceId is required."
 *       404:
 *         description: Referensi pembayaran tidak ditemukan
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
 *                   example: Payment not found.
 *       500:
 *         description: Gagal membuat pembayaran
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
 *                   example: Failed to create payment.
 */
router.post(
  "/payments/create",
  authenticate,
  validate(createPaymentSchema),
  PaymentController.createPayment
);

/**
 * @swagger
 * /api/payment/duitku/callback:
 *   post:
 *     summary: Callback dari gateway pembayaran (Duitku)
 *     tags: [Payment]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - merchantCode
 *               - amount
 *               - merchantOrderId
 *               - resultCode
 *               - reference
 *               - signature
 *             properties:
 *               merchantCode:
 *                 type: string
 *                 example: "D1234"
 *               amount:
 *                 type: string
 *                 example: "100000"
 *               merchantOrderId:
 *                 type: string
 *                 example: "INV-1720001111"
 *               resultCode:
 *                 type: string
 *                 example: "00"
 *               reference:
 *                 type: string
 *                 example: "REF987654321"
 *               signature:
 *                 type: string
 *                 example: "a7c7e3b8a9b0d2f9f7b3f4d6c1..."
 *     responses:
 *       200:
 *         description: Callback diterima dan diproses
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: OK
 *       400:
 *         description: Signature tidak ditemukan
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Missing signature
 *       500:
 *         description: Terjadi kesalahan saat memproses callback
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Internal Server Error
 */
router.post("/duitku/callback", PaymentController.handleCallback);

/**
 * @swagger
 * /api/payment/payments:
 *   get:
 *     summary: Ambil semua payment (admin)
 *     tags: [Payment]
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
 *         name: status
 *         schema:
 *           type: string
 *           example: pending
 *     responses:
 *       200:
 *         description: Daftar pembayaran berhasil diambil
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
 *                   example: Payments fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "f1228f5c-dc29-4c57-932f-f62370c89b8f"
 *                       amount:
 *                         type: number
 *                         example: 150000
 *                       status:
 *                         type: string
 *                         example: "confirmed"
 *                       paymentMethod:
 *                         type: string
 *                         example: "VC"
 *                       paymentDate:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-07-01T10:00:00.000Z"
 *                       transactionId:
 *                         type: string
 *                         example: "TXN-123456"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-07-01T09:50:00.000Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-07-01T10:05:00.000Z"
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "u1"
 *                           fullName:
 *                             type: string
 *                             example: "Budi Santoso"
 *                           email:
 *                             type: string
 *                             example: "budi@gmail.com"
 *                       type:
 *                         type: string
 *                         example: "booking"
 *                 total:
 *                   type: integer
 *                   example: 50
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - hanya admin yang diizinkan
 */
router.get(
  "/payments",
  authenticate,
  authorizeRoles("admin"),
  validate(getAdminPaymentsSchema),
  PaymentController.getAllPayments
);

/**
 * @swagger
 * /api/payment/payments/{id}:
 *   get:
 *     summary: Ambil detail payment berdasarkan ID (admin)
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "f1228f5c-dc29-4c57-932f-f62370c89b8f"
 *     responses:
 *       200:
 *         description: Detail pembayaran berhasil diambil
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
 *                   example: Payment detail retrieved successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "f1228f5c-dc29-4c57-932f-f62370c89b8f"
 *                     amount:
 *                       type: number
 *                       example: 150000
 *                     status:
 *                       type: string
 *                       example: "confirmed"
 *                     paymentMethod:
 *                       type: string
 *                       example: "VC"
 *                     paymentDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-07-01T10:00:00.000Z"
 *                     transactionId:
 *                       type: string
 *                       example: "TXN-123456"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-07-01T09:50:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-07-01T10:05:00.000Z"
 *                     type:
 *                       type: string
 *                       example: "booking"
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "u1"
 *                         fullName:
 *                           type: string
 *                           example: "Budi Santoso"
 *                         email:
 *                           type: string
 *                           example: "budi@gmail.com"
 *                     detail:
 *                       type: object
 *                       description: Data booking atau practicePurchase tergantung jenis payment
 *       404:
 *         description: Payment tidak ditemukan
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
 *                   example: Payment not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - hanya admin yang diizinkan
 */
router.get(
  "/payments/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(getAdminPaymentsDetailSchema),
  PaymentController.getDetailIdPayments
);

/**
 * @swagger
 * /api/payment/payments-export:
 *   get:
 *     summary: Export data pembayaran (admin)
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         required: true
 *         schema:
 *           type: string
 *           enum: [csv, excel]
 *         description: Format file export (csv atau excel)
 *         example: excel
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter berdasarkan status pembayaran (opsional)
 *         example: confirmed
 *     responses:
 *       200:
 *         description: File eksport pembayaran tersedia
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Format tidak valid atau error validasi query
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
 *                   example: Format harus 'csv' atau 'excel'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - hanya admin yang diizinkan
 *       500:
 *         description: Gagal memproses ekspor file
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
 *                   example: Gagal memproses file export
 */
router.get(
  "/payments-export",
  authenticate,
  authorizeRoles("admin"),
  validate(getExportPaymentsSchema),
  PaymentController.exportPayments
);

/**
 * @swagger
 * /api/payment/my/payments:
 *   get:
 *     summary: Ambil semua payment milik user sendiri
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           example: "confirmed"
 *     responses:
 *       200:
 *         description: Daftar pembayaran user berhasil diambil
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
 *                   example: User payments fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "pmt-123"
 *                       type:
 *                         type: string
 *                         enum: [booking, practice]
 *                         example: "practice"
 *                       title:
 *                         type: string
 *                         example: "Basic Web Mentoring" 
 *                       amount:
 *                         type: number
 *                         example: 200000
 *                       status:
 *                         type: string
 *                         example: "pending"
 *                       paymentMethod:
 *                         type: string
 *                         example: "VC"
 *                       paymentDate:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-07-01T09:00:00.000Z"
 *                       transactionId:
 *                         type: string
 *                         example: "TX-abc-123"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-07-01T08:00:00.000Z"
 *                 total:
 *                   type: integer
 *                   example: 20
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 2
 *       401:
 *         description: Unauthorized - User belum login atau token tidak valid
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
 *                   example: "Unauthorized: User ID not found."
 *       500:
 *         description: Gagal mengambil data pembayaran
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
 *                   example: Failed to fetch payments
 */
router.get(
  "/my/payments",
  authenticate,
  validate(getMyPaymentsSchema),
  PaymentController.getMyPayments
);

/**
 * @swagger
 * /api/payment/my/payments/{id}:
 *   get:
 *     summary: Ambil detail payment user sendiri
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "pmt-123"
 *     responses:
 *       200:
 *         description: Detail pembayaran user berhasil diambil
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
 *                   example: Payment detail fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "pmt-123"
 *                     type:
 *                       type: string
 *                       enum: [booking, practice]
 *                       example: "practice"
 *                     title:
 *                       type: string
 *                       example: "Basic Public Speaking"
 *                     amount:
 *                       type: number
 *                       example: 150000
 *                     status:
 *                       type: string
 *                       example: "confirmed"
 *                     paymentMethod:
 *                       type: string
 *                       example: "VC"
 *                     paymentDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-07-01T09:00:00.000Z"
 *                     transactionId:
 *                       type: string
 *                       example: "TX-987654321"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-30T14:20:00.000Z"
 *       401:
 *         description: Unauthorized - User ID tidak ditemukan di token
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
 *                   example: "Unauthorized: User ID not found."
 *       404:
 *         description: Pembayaran tidak ditemukan atau akses tidak diizinkan
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
 *                   example: Payment not found or unauthorized access
 *       500:
 *         description: Gagal mengambil detail pembayaran
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
 *                   example: Failed to fetch payment detail
 */
router.get(
  "/my/payments/:id",
  authenticate,
  validate(getMyPaymentDetailSchema),
  PaymentController.getMyPaymentDetail
);

/**
 * @swagger
 * /api/payment/payments-status/{id}:
 *   patch:
 *     summary: Update status payment (admin)
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "pmt-123"
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
 *                 enum: [pending, confirmed, failed]
 *                 example: "confirmed"
 *     responses:
 *       200:
 *         description: Status pembayaran berhasil diperbarui
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
 *                   example: Payment status updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "pmt-123"
 *                     status:
 *                       type: string
 *                       example: "confirmed"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-07-01T10:15:00.000Z"
 *       400:
 *         description: Permintaan tidak valid
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
 *                   example: "Validation failed: status is required"
 *       404:
 *         description: Pembayaran tidak ditemukan
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
 *                   example: Payment not found
 *       500:
 *         description: Gagal memperbarui status pembayaran
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
 *                   example: Failed to update payment status
 */
router.patch(
  "/payments-status/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(updatePaymentStatusSchema),
  PaymentController.updatePaymentStatus
);

export default router;
