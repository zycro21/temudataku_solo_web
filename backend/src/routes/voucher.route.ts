import express from "express";
import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import { authorizeRoles } from "../middlewares/authorizeRole.js";
import { VoucherController } from "../controllers/voucher.controller.js";
import {
  getAllVouchersSchema,
  getVoucherByIdSchema,
  createVoucherSchema,
  updateVoucherSchema,
  toggleVoucherActiveSchema,
  deleteVoucherSchema,
  validateVoucherSchema,
  applyCodeAyclSchema,
  applyCodeBookingSchema,
  applyCodeELearningSchema,
} from "../validations/voucher.validation.js";

const router = Router();

/**
 * @swagger
 * /api/voucher/vouchers:
 *   get:
 *     summary: Mendapatkan daftar semua voucher (admin only)
 *     description: >
 *       Hanya admin yang dapat mengakses daftar voucher.
 *     tags: [Vouchers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *         description: Pencarian berdasarkan kode atau nama voucher
 *       - name: productScope
 *         in: query
 *         schema:
 *           type: string
 *           enum: [GLOBAL, ELEARNING, PRACTICE, MENTORING, AYCL]
 *       - name: isActive
 *         in: query
 *         schema:
 *           type: boolean
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: sortBy
 *         in: query
 *         schema:
 *           type: string
 *           enum: [createdAt, code, name, expiryDate]
 *       - name: order
 *         in: query
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan daftar voucher
 *       403:
 *         description: Akses ditolak
 */
router.get(
  "/vouchers",
  authenticate,
  authorizeRoles("admin"),
  validate(getAllVouchersSchema),
  VoucherController.getAllVouchers,
);

/**
 * @swagger
 * /api/voucher/vouchers/{id}:
 *   get:
 *     summary: Mendapatkan detail satu voucher (admin only)
 *     tags: [Vouchers]
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
 *         description: Detail voucher berhasil diambil
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Voucher tidak ditemukan
 */
router.get(
  "/vouchers/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(getVoucherByIdSchema),
  VoucherController.getVoucherById,
);

/**
 * @swagger
 * /api/voucher/vouchers:
 *   post:
 *     summary: Membuat voucher baru (admin only)
 *     tags: [Vouchers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, name, discountType, discountValue]
 *             properties:
 *               code:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               discountType:
 *                 type: string
 *                 enum: [PERCENTAGE, FLAT]
 *               discountValue:
 *                 type: number
 *               maxDiscountAmount:
 *                 type: number
 *               minimumPurchase:
 *                 type: number
 *               productScope:
 *                 type: string
 *                 enum: [GLOBAL, ELEARNING, PRACTICE, MENTORING, AYCL]
 *               usageLimit:
 *                 type: integer
 *               usageLimitPerUser:
 *                 type: integer
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Voucher berhasil dibuat
 *       400:
 *         description: Data tidak valid / kode sudah dipakai
 *       403:
 *         description: Akses ditolak
 */
router.post(
  "/vouchers",
  authenticate,
  authorizeRoles("admin"),
  validate(createVoucherSchema),
  VoucherController.createVoucher,
);

/**
 * @swagger
 * /api/voucher/vouchers/{id}:
 *   patch:
 *     summary: Mengubah voucher (admin only)
 *     tags: [Vouchers]
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
 *         description: Voucher berhasil diperbarui
 *       400:
 *         description: Data tidak valid / kode sudah dipakai
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Voucher tidak ditemukan
 */
router.patch(
  "/vouchers/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(updateVoucherSchema),
  VoucherController.updateVoucher,
);

/**
 * @swagger
 * /api/voucher/vouchers/{id}/toggle-active:
 *   patch:
 *     summary: Mengaktifkan/menonaktifkan voucher (admin only)
 *     tags: [Vouchers]
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
 *         description: Status voucher berhasil diubah
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Voucher tidak ditemukan
 */
router.patch(
  "/vouchers/:id/toggle-active",
  authenticate,
  authorizeRoles("admin"),
  validate(toggleVoucherActiveSchema),
  VoucherController.toggleVoucherActive,
);

/**
 * @swagger
 * /api/voucher/vouchers/{id}:
 *   delete:
 *     summary: Menghapus voucher (admin only)
 *     description: >
 *       Voucher yang sudah pernah dipakai (memiliki VoucherUsage) tidak bisa dihapus
 *       untuk menjaga integritas data transaksi. Gunakan toggle-active untuk menonaktifkannya.
 *     tags: [Vouchers]
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
 *         description: Voucher berhasil dihapus
 *       400:
 *         description: Voucher tidak bisa dihapus karena sudah pernah dipakai
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Voucher tidak ditemukan
 */
router.delete(
  "/vouchers/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(deleteVoucherSchema),
  VoucherController.deleteVoucher,
);

/**
 * @swagger
 * /api/voucher/vouchers/validate:
 *   post:
 *     summary: Validasi kode voucher untuk checkout
 *     description: >
 *       Dapat diakses oleh semua role yang sudah login (admin, mentor, mentee, cm, curdev).
 *       Mengembalikan estimasi discountAmount dan finalAmount berdasarkan amount yang dikirim.
 *     tags: [Vouchers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, productScope, amount]
 *             properties:
 *               code:
 *                 type: string
 *               productScope:
 *                 type: string
 *                 enum: [GLOBAL, ELEARNING, PRACTICE, MENTORING, AYCL]
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Voucher valid, estimasi diskon dikembalikan
 *       400:
 *         description: Voucher tidak valid (kedaluwarsa, kuota habis, dsb.)
 *       404:
 *         description: Kode voucher tidak ditemukan
 */
router.post(
  "/vouchers/validate",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee", "cm", "curdev"),
  validate(validateVoucherSchema),
  VoucherController.validateVoucher,
);

/**
 * @swagger
 * /api/voucher/aycl/{id}/apply-code:
 *   post:
 *     summary: Apply voucher atau referral ke AYCL booking
 *     description: >
 *       Otomatis mendeteksi apakah kode adalah voucher atau referral affiliator.
 *       Jika kode ditemukan di tabel voucher, logika voucher yang dijalankan.
 *       Jika ditemukan di tabel referral, logika referral yang dijalankan.
 *     tags: [Vouchers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID AYCL Booking
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Kode berhasil diterapkan
 *       400:
 *         description: Kode tidak valid atau tidak bisa diterapkan
 *       404:
 *         description: Kode tidak ditemukan
 */
router.post(
  "/aycl/:id/apply-code",
  authenticate,
  validate(applyCodeAyclSchema),
  VoucherController.applyCodeToAycl,
);

/**
 * @swagger
 * /api/voucher/booking/{id}/apply-code:
 *   post:
 *     summary: Apply voucher atau referral ke booking mentoring
 *     description: >
 *       Otomatis mendeteksi apakah kode adalah voucher atau referral affiliator.
 *       Jika kode ditemukan di tabel voucher, logika voucher yang dijalankan.
 *       Jika ditemukan di tabel referral, logika referral yang dijalankan.
 *     tags: [Vouchers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID Booking
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Kode berhasil diterapkan
 *       400:
 *         description: Kode tidak valid atau tidak bisa diterapkan
 *       404:
 *         description: Kode tidak ditemukan
 */
router.post(
  "/booking/:id/apply-code",
  authenticate,
  validate(applyCodeBookingSchema),
  VoucherController.applyCodeToBooking,
);

/**
 * @swagger
 * /api/voucher/elearning-subscriptions/{id}/apply-code:
 *   post:
 *     summary: Apply voucher atau referral ke e-learning subscription
 *     description: >
 *       Otomatis mendeteksi apakah kode adalah voucher atau referral affiliator.
 *       Jika kode ditemukan di tabel voucher, logika voucher yang dijalankan.
 *       Jika ditemukan di tabel referral, logika referral yang dijalankan.
 *     tags: [Vouchers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID ELearning Subscription
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Kode berhasil diterapkan
 *       400:
 *         description: Kode tidak valid atau tidak bisa diterapkan
 *       404:
 *         description: Kode tidak ditemukan
 */
router.post(
  "/elearning-subscriptions/:id/apply-code",
  authenticate,
  validate(applyCodeELearningSchema),
  VoucherController.applyCodeToELearning,
);

export default router;