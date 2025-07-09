import { Router } from "express";
import * as ReferralController from "../controllers/referral.controller";
import {
  createReferralCodeSchema,
  getReferralCodesSchema,
  getReferralCodeByIdSchema,
  updateReferralCodeSchema,
  useReferralCodeSchema,
  getReferralCommissionsSchema,
  getAffiliatorReferralCodesSchema,
  getReferralUsagesSchema,
  getReferralCommissionsByCodeSchema,
  requestCommissionPaymentSchema,
  validateCommissionPaymentsSchema,
  AllCommissionPaymentsSchema,
  validateUpdateCommissionPaymentStatusSchema,
  exportCommissionPaymentsSchema,
} from "../validations/referral.validation";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorizeRole";

const router = Router();

/** 
 * @swagger
 * tags:
 *   - name: Referral
 *     description: Manajemen kode referral & komisi
 */
 
/**
 * @swagger
 * /api/referral/admin/referral-codes:
 *   post:
 *     summary: Buat kode referral (admin)
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ownerId
 *               - code
 *               - discountPercentage
 *               - commissionPercentage
 *             properties:
 *               ownerId:
 *                 type: string
 *                 description: ID pengguna pemilik kode referral (harus memiliki peran affiliator)
 *               code:
 *                 type: string
 *                 description: Kode referral unik
 *               discountPercentage:
 *                 type: number
 *                 description: Persentase diskon yang diberikan
 *               commissionPercentage:
 *                 type: number
 *                 description: Persentase komisi untuk pemilik referral
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Referral code berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     ownerId:
 *                       type: string
 *                     code:
 *                       type: string
 *                     discountPercentage:
 *                       type: number
 *                     commissionPercentage:
 *                       type: number
 *                     createdDate:
 *                       type: string
 *                       format: date-time
 *                     expiryDate:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     isActive:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     owner:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         fullName:
 *                           type: string
 *                         email:
 *                           type: string
 *       400:
 *         description: Validasi gagal atau kode referral sudah ada
 *       403:
 *         description: Forbidden - hanya admin yang boleh membuat referral code
 */
router.post(
  "/admin/referral-codes",
  authenticate,
  authorizeRoles("admin"),
  validate(createReferralCodeSchema),
  ReferralController.createReferralCodeController
);

/**
 * @swagger
 * /api/referral/admin/referral-codes:
 *   get:
 *     summary: Daftar kode referral (admin)
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: ownerId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Daftar referral code berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       ownerId:
 *                         type: string
 *                       code:
 *                         type: string
 *                       discountPercentage:
 *                         type: number
 *                       commissionPercentage:
 *                         type: number
 *                       createdDate:
 *                         type: string
 *                         format: date-time
 *                       expiryDate:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       isActive:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       owner:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           fullName:
 *                             type: string
 *                           email:
 *                             type: string
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       403:
 *         description: Forbidden - hanya admin yang boleh melihat daftar kode referral
 */
router.get(
  "/admin/referral-codes",
  authenticate,
  authorizeRoles("admin"),
  validate(getReferralCodesSchema),
  ReferralController.getReferralCodesController
);

/**
 * @swagger
 * /api/referral/admin/referral-codes/{id}:
 *   get:
 *     summary: Detail kode referral (admin)
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detail referral code berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     ownerId:
 *                       type: string
 *                     code:
 *                       type: string
 *                     discountPercentage:
 *                       type: number
 *                     commissionPercentage:
 *                       type: number
 *                     createdDate:
 *                       type: string
 *                       format: date-time
 *                     expiryDate:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     isActive:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     owner:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         fullName:
 *                           type: string
 *                         email:
 *                           type: string
 *       404:
 *         description: Referral code tidak ditemukan
 *       403:
 *         description: Forbidden - hanya admin yang bisa mengakses detail kode referral
 */
router.get(
  "/admin/referral-codes/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(getReferralCodeByIdSchema),
  ReferralController.getReferralCodeByIdController
);

/**
 * @swagger
 * /api/referral/admin/referral-codes/{id}:
 *   patch:
 *     summary: Update kode referral (admin)
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               isActive:
 *                 type: boolean
 *               discountPercentage:
 *                 type: number
 *               commissionPercentage:
 *                 type: number
 *     responses:
 *       200:
 *         description: Referral code berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     ownerId:
 *                       type: string
 *                     code:
 *                       type: string
 *                     discountPercentage:
 *                       type: number
 *                     commissionPercentage:
 *                       type: number
 *                     createdDate:
 *                       type: string
 *                       format: date-time
 *                     expiryDate:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     isActive:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     owner:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         fullName:
 *                           type: string
 *                         email:
 *                           type: string
 *       404:
 *         description: Referral code tidak ditemukan
 *       403:
 *         description: Unauthorized - hanya admin yang dapat mengubah referral code
 */
router.patch(
  "/admin/referral-codes/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(updateReferralCodeSchema),
  ReferralController.updateReferralCodeController
);

/**
 * @swagger
 * /api/referral/admin/referral-codes/{id}:
 *   delete:
 *     summary: Hapus kode referral (admin)
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Referral code berhasil dihapus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Referral code tidak ditemukan
 *       403:
 *         description: Unauthorized - hanya admin yang dapat menghapus referral code
 */
router.delete(
  "/admin/referral-codes/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(getReferralCodeByIdSchema),
  ReferralController.deleteReferralCodeController
);

/**
 * @swagger
 * /api/referral/referral/use:
 *   post:
 *     summary: Gunakan kode referral
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 example: "REF12345"
 *               context:
 *                 type: string
 *                 enum: [booking, practice_purchase]
 *                 example: "booking"
 *     responses:
 *       201:
 *         description: Referral code berhasil digunakan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     referralUsageId:
 *                       type: string
 *                     discountPercentage:
 *                       type: number
 *       400:
 *         description: Referral code tidak valid, sudah dipakai, atau kadaluarsa
 *       401:
 *         description: Unauthorized - token tidak valid atau tidak ditemukan
 */
router.post(
  "/referral/use",
  authenticate,
  validate(useReferralCodeSchema),
  ReferralController.useReferralCodeController
);

/**
 * @swagger
 * /api/referral/referral-commissions:
 *   get:
 *     summary: Daftar semua komisi referral (admin)
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: referralCodeId
 *         schema:
 *           type: string
 *           example: "REF-20250701-0001"
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
 *     responses:
 *       200:
 *         description: Komisi referral berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     commissions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           referralCodeId:
 *                             type: string
 *                           amount:
 *                             type: number
 *                           transactionId:
 *                             type: string
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                           referral_code:
 *                             type: object
 *                             properties:
 *                               code:
 *                                 type: string
 *                               owner:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: string
 *                                   fullName:
 *                                     type: string
 *                                   email:
 *                                     type: string
 *                           payment:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               bookingId:
 *                                 type: string
 *                                 nullable: true
 *                               practicePurchaseId:
 *                                 type: string
 *                                 nullable: true
 *                               status:
 *                                 type: string
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       400:
 *         description: Parameter tidak valid
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/referral-commissions",
  authenticate,
  authorizeRoles("admin"),
  validate(getReferralCommissionsSchema),
  ReferralController.getReferralCommissionsController
);

/**
 * @swagger
 * /api/referral/affiliator/referral-codes:
 *   get:
 *     summary: List kode referral milik affiliator
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *           example: true
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
 *     responses:
 *       200:
 *         description: Kode referral affiliator berhasil diambil
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
 *                   example: Referral codes retrieved successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     referralCodes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           code:
 *                             type: string
 *                           discountPercentage:
 *                             type: number
 *                           commissionPercentage:
 *                             type: number
 *                           createdDate:
 *                             type: string
 *                             format: date
 *                           expiryDate:
 *                             type: string
 *                             format: date
 *                             nullable: true
 *                           isActive:
 *                             type: boolean
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                           owner:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               fullName:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       400:
 *         description: Parameter tidak valid
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/affiliator/referral-codes",
  authenticate,
  authorizeRoles("affiliator"),
  validate(getAffiliatorReferralCodesSchema),
  ReferralController.getAffiliatorReferralCodesController
);

/**
 * @swagger
 * /api/referral/affiliator/referral-codes-usages/{id}:
 *   get:
 *     summary: Daftar penggunaan referral untuk satu kode
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID referral code
 *       - in: query
 *         name: context
 *         schema:
 *           type: string
 *           enum: [booking, practice_purchase]
 *           example: booking
 *         description: Filter berdasarkan konteks penggunaan
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
 *     responses:
 *       200:
 *         description: Penggunaan referral berhasil diambil
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
 *                   example: Referral usages retrieved successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     usages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           userId:
 *                             type: string
 *                           referralCodeId:
 *                             type: string
 *                           usedAt:
 *                             type: string
 *                             format: date-time
 *                           context:
 *                             type: string
 *                             enum: [booking, practice_purchase]
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               fullName:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                           booking:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               id:
 *                                 type: string
 *                               bookingDate:
 *                                 type: string
 *                                 format: date
 *                               status:
 *                                 type: string
 *                           practicePurchase:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               id:
 *                                 type: string
 *                               purchaseDate:
 *                                 type: string
 *                                 format: date
 *                               status:
 *                                 type: string
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       400:
 *         description: Parameter tidak valid
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Referral code not found or forbidden
 */
router.get(
  "/affiliator/referral-codes-usages/:id",
  authenticate,
  authorizeRoles("affiliator"),
  validate(getReferralUsagesSchema),
  ReferralController.getReferralUsagesController
);

/**
 * @swagger
 * /api/referral/affiliator/referral-codes-commissions/{id}:
 *   get:
 *     summary: Komisi referral berdasarkan kode (affiliator)
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dari referral code
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *           example: 2024-01-01
 *         description: Filter tanggal mulai (opsional)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *           example: 2024-12-31
 *         description: Filter tanggal akhir (opsional)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Nomor halaman (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Jumlah data per halaman (default 10)
 *     responses:
 *       200:
 *         description: Komisi referral berhasil diambil
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
 *                   example: Referral commissions retrieved successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     commissions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           referralCodeId:
 *                             type: string
 *                           transactionId:
 *                             type: string
 *                           amount:
 *                             type: number
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                           referral_code:
 *                             type: object
 *                             properties:
 *                               code:
 *                                 type: string
 *                               owner:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: string
 *                                   fullName:
 *                                     type: string
 *                                   email:
 *                                     type: string
 *                           payment:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               id:
 *                                 type: string
 *                               bookingId:
 *                                 type: string
 *                               practicePurchaseId:
 *                                 type: string
 *                               status:
 *                                 type: string
 *                               amount:
 *                                 type: number
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       400:
 *         description: Request tidak valid
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Referral code tidak ditemukan atau bukan milik user
 */
router.get(
  "/affiliator/referral-codes-commissions/:id",
  authenticate,
  authorizeRoles("affiliator"),
  validate(getReferralCommissionsByCodeSchema),
  ReferralController.getReferralCommissionsByCodeController
);

/**
 * @swagger
 * /api/referral/affiliator/commission-payments/request:
 *   post:
 *     summary: Request pembayaran komisi (affiliator)
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - referralCodeId
 *               - amount
 *             properties:
 *               referralCodeId:
 *                 type: string
 *                 example: "ref123456"
 *               amount:
 *                 type: number
 *                 example: 150000
 *     responses:
 *       201:
 *         description: Permintaan pembayaran komisi berhasil
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
 *                   example: Commission payment request submitted successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     referralCodeId:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     status:
 *                       type: string
 *                       example: pending
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     referralCode:
 *                       type: object
 *                       properties:
 *                         code:
 *                           type: string
 *                         owner:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             fullName:
 *                               type: string
 *                             email:
 *                               type: string
 *       400:
 *         description: Saldo komisi tidak mencukupi atau body tidak valid
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Referral code tidak ditemukan atau bukan milik user
 */
router.post(
  "/affiliator/commission-payments/request",
  authenticate,
  authorizeRoles("affiliator"),
  validate(requestCommissionPaymentSchema),
  ReferralController.requestCommissionPaymentController
);

/**
 * @swagger
 * /api/referral/affiliator/commission-payments:
 *   get:
 *     summary: Daftar pembayaran komisi affiliator
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, paid, rejected]
 *           example: pending
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-12-31"
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
 *     responses:
 *       200:
 *         description: Daftar pembayaran komisi berhasil diambil
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
 *                   example: Commission payments retrieved successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 15
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 2
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           amount:
 *                             type: number
 *                             example: 50000
 *                           status:
 *                             type: string
 *                             example: pending
 *                           transactionId:
 *                             type: string
 *                             nullable: true
 *                           paidAt:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                           notes:
 *                             type: string
 *                             nullable: true
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           referralCode:
 *                             type: string
 *                             example: AFFIL123
 *                           owner:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               fullName:
 *                                 type: string
 *                               email:
 *                                 type: string
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/affiliator/commission-payments",
  authenticate,
  authorizeRoles("affiliator"),
  validate(validateCommissionPaymentsSchema),
  ReferralController.getCommissionPaymentsController
);

/**
 * @swagger
 * /api/referral/admin/commission-payments:
 *   get:
 *     summary: Daftar semua pembayaran komisi (admin)
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: ownerId
 *         schema:
 *           type: string
 *           example: "user_abc123"
 *       - in: query
 *         name: referralCodeId
 *         schema:
 *           type: string
 *           example: "code_xyz123"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, paid, rejected]
 *           example: pending
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-12-31"
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
 *     responses:
 *       200:
 *         description: Semua pembayaran komisi berhasil diambil
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
 *                   example: All commission payments retrieved successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 30
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           amount:
 *                             type: number
 *                             example: 50000
 *                           status:
 *                             type: string
 *                             example: pending
 *                           transactionId:
 *                             type: string
 *                             nullable: true
 *                           paidAt:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                           notes:
 *                             type: string
 *                             nullable: true
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           referralCode:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               code:
 *                                 type: string
 *                           owner:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               fullName:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                               phoneNumber:
 *                                 type: string
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/admin/commission-payments",
  authenticate,
  authorizeRoles("admin"),
  validate(AllCommissionPaymentsSchema),
  ReferralController.getAllCommissionPaymentsController
);

/**
 * @swagger
 * /api/referral/admin/commission-payments-pay/{id}:
 *   patch:
 *     summary: Update status pembayaran komisi (admin)
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "comm_abc123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, paid, failed]
 *                 example: paid
 *               notes:
 *                 type: string
 *                 example: "Pembayaran berhasil via BCA"
 *               transactionId:
 *                 type: string
 *                 example: "trx_987xyz"
 *     responses:
 *       200:
 *         description: Status pembayaran komisi berhasil diperbarui
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
 *                   example: Commission payment status updated successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "comm_abc123"
 *                     amount:
 *                       type: number
 *                       example: 50000
 *                     status:
 *                       type: string
 *                       example: paid
 *                     transactionId:
 *                       type: string
 *                       nullable: true
 *                       example: "trx_987xyz"
 *                     paidAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     notes:
 *                       type: string
 *                       nullable: true
 *                       example: "Transfer via bank"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     referralCode:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "ref_123"
 *                         code:
 *                           type: string
 *                           example: "AFFILIATE50"
 *                     owner:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "user_456"
 *                         fullName:
 *                           type: string
 *                           example: "Budi Setiawan"
 *                         email:
 *                           type: string
 *                           example: "budi@gmail.com"
 *                         phoneNumber:
 *                           type: string
 *                           example: "+628123456789"
 *       400:
 *         description: Bad request (body tidak valid atau data tidak cocok)
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
 *                   example: Invalid request body.
 *       401:
 *         description: Unauthorized (tidak ada token atau token tidak valid)
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
 *                   example: Unauthorized.
 *       404:
 *         description: Komisi tidak ditemukan
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
 *                   example: Commission payment not found.
 *       500:
 *         description: Kesalahan server internal
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
 *                   example: Terjadi kesalahan pada server.
 */
router.patch(
  "/admin/commission-payments-pay/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(validateUpdateCommissionPaymentStatusSchema),
  ReferralController.updateCommissionPaymentStatusController
);

/**
 * @swagger
 * /api/referral/admin/commission-payments-export:
 *   get:
 *     summary: Ekspor data pembayaran komisi (admin)
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         required: true
 *         schema:
 *           type: string
 *           enum: [csv, excel]
 *           example: excel
 *     responses:
 *       200:
 *         description: File eksport tersedia dalam format CSV atau Excel
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Permintaan tidak valid (format tidak dikenali atau tidak diberikan)
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
 *                   example: Format tidak valid, harus csv atau excel.
 *       401:
 *         description: Unauthorized (token tidak disertakan atau tidak valid)
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
 *                   example: Unauthorized.
 *       403:
 *         description: Forbidden (akses hanya untuk admin)
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
 *                   example: Access denied.
 *       500:
 *         description: Kesalahan server internal saat memproses file eksport
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
 *                   example: Terjadi kesalahan pada server.
 */
router.get(
  "/admin/commission-payments-export",
  authenticate,
  authorizeRoles("admin"),
  validate(exportCommissionPaymentsSchema),
  ReferralController.exportCommissionPaymentsController
);

export default router;
