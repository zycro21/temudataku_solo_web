import { Router } from "express";
import * as WithdrawalController from "../controllers/withdrawal.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorizeRole";
import {
  createWithdrawalSchema,
  deleteWithdrawalSchema,
  exportWithdrawalSchema,
  getAllWithdrawalSchema,
  getWithdrawalByIdSchema,
  updateWithdrawalSchema,
  toggleWithdrawalStatusSchema,
  getAdminWithdrawalsSchema,
} from "../validations/withdrawal.validation";
import { validate } from "../middlewares/validate";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Withdrawal
 *   description: API untuk mengelola metode penarikan (withdrawal methods)
 */

/**
 * @swagger
 * /api/withdrawals:
 *   get:
 *     summary: Ambil semua withdrawal methods milik user yang login
 *     tags: [Withdrawal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         required: false
 *         description: Halaman yang ingin diambil (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         required: false
 *         description: Jumlah item per halaman (default 10)
 *     responses:
 *       200:
 *         description: Daftar withdrawal methods
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum: [bank, eWallet]
 *                       providerName:
 *                         type: string
 *                       accountNumber:
 *                         type: string
 *                       accountName:
 *                         type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     limit:
 *                       type: integer
 */
router.get(
  "/",
  authenticate,
  authorizeRoles("admin", "affiliator"),
  validate(getAllWithdrawalSchema),
  WithdrawalController.getAllWithdrawal
);

/**
 * @swagger
 * /api/withdrawals/{id}:
 *   get:
 *     summary: Ambil detail withdrawal method berdasarkan ID
 *     tags: [Withdrawal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID withdrawal method
 *     responses:
 *       200:
 *         description: Detail withdrawal method
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     type:
 *                       type: string
 *                       enum: [bank, eWallet]
 *                     providerName:
 *                       type: string
 *                     accountNumber:
 *                       type: string
 *                     accountName:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     user:
 *                       type: object
 *                       nullable: true
 *                       description: Hanya muncul jika role = admin
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         fullName:
 *                           type: string
 */
router.get(
  "/:id",
  authenticate,
  authorizeRoles("admin", "affiliator"),
  validate(getWithdrawalByIdSchema),
  WithdrawalController.getWithdrawalById
);

/**
 * @swagger
 * /api/withdrawals:
 *   post:
 *     summary: Tambah withdrawal method baru
 *     tags: [Withdrawal]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: Hanya bisa diisi admin (affiliator tidak boleh mengisi)
 *               type:
 *                 type: string
 *                 enum: [bank, eWallet]
 *               providerName:
 *                 type: string
 *               accountNumber:
 *                 type: string
 *               accountName:
 *                 type: string
 *             required:
 *               - type
 *               - providerName
 *               - accountNumber
 *     responses:
 *       201:
 *         description: Withdrawal method berhasil dibuat
 */
router.post(
  "/",
  authenticate,
  authorizeRoles("admin", "affiliator"),
  validate(createWithdrawalSchema),
  WithdrawalController.createWithdrawal
);

/**
 * @swagger
 * /api/withdrawals/{id}:
 *   put:
 *     summary: Update withdrawal method
 *     description: >
 *       Admin dapat mengupdate withdrawal method siapa pun.
 *       Affiliator hanya bisa mengupdate withdrawal method yang dimilikinya.
 *     tags: [Withdrawal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID withdrawal method
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Field yang ingin diupdate (boleh sebagian saja, minimal 1 field)
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [bank, eWallet]
 *               providerName:
 *                 type: string
 *                 example: BCA
 *               accountNumber:
 *                 type: string
 *                 example: "1234567890"
 *               accountName:
 *                 type: string
 *                 example: John Doe
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Withdrawal method berhasil diupdate
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
 *                     userId:
 *                       type: string
 *                     type:
 *                       type: string
 *                       enum: [bank, eWallet]
 *                     providerName:
 *                       type: string
 *                     accountNumber:
 *                       type: string
 *                     accountName:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error (misalnya tidak ada field yang dikirim)
 *       403:
 *         description: Affiliator mencoba mengupdate withdrawal method milik orang lain
 *       404:
 *         description: Withdrawal method tidak ditemukan
 */
router.put(
  "/:id",
  authenticate,
  authorizeRoles("admin", "affiliator"),
  validate(updateWithdrawalSchema),
  WithdrawalController.updateWithdrawal
);

/**
 * @swagger
 * /api/withdrawals/{id}:
 *   delete:
 *     summary: Hapus withdrawal method
 *     description: >
 *       Admin dapat menghapus withdrawal method siapa pun.
 *       Affiliator hanya bisa menghapus withdrawal method miliknya sendiri.
 *     tags: [Withdrawal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID withdrawal method
 *     responses:
 *       200:
 *         description: Withdrawal method berhasil dihapus
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
 *                   example: Withdrawal method deleted
 *       403:
 *         description: Affiliator mencoba menghapus withdrawal method milik orang lain
 *       404:
 *         description: Withdrawal method tidak ditemukan
 */
router.delete(
  "/:id",
  authenticate,
  authorizeRoles("admin", "affiliator"),
  validate(deleteWithdrawalSchema),
  WithdrawalController.removeWithdrawal
);

/**
 * @swagger
 * /api/withdrawals/admin/export:
 *   get:
 *     summary: Ekspor data withdrawal methods (admin)
 *     tags: [Withdrawal]
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
 *         description: Format tidak valid
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (akses hanya untuk admin)
 *       500:
 *         description: Server error
 */
router.get(
  "/admin/export",
  authenticate,
  authorizeRoles("admin"),
  validate(exportWithdrawalSchema),
  WithdrawalController.exportWithdrawalData
);

/**
 * @swagger
 * /api/withdrawals/{id}/activate:
 *   patch:
 *     summary: Aktifkan/nonaktifkan withdrawal method
 *     description: >
 *       Admin dapat mengubah status withdrawal method siapa pun.
 *       Affiliator hanya bisa mengubah status withdrawal method miliknya sendiri.
 *     tags: [Withdrawal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID withdrawal method
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Status withdrawal method berhasil diubah
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
 *                     userId:
 *                       type: string
 *                     type:
 *                       type: string
 *                     providerName:
 *                       type: string
 *                     accountNumber:
 *                       type: string
 *                     accountName:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       403:
 *         description: Affiliator mencoba mengubah withdrawal method milik orang lain
 *       404:
 *         description: Withdrawal method tidak ditemukan
 */
router.patch(
  "/:id/activate",
  authenticate,
  authorizeRoles("admin", "affiliator"),
  validate(toggleWithdrawalStatusSchema),
  WithdrawalController.toggleWithdrawalStatusController
);

/**
 * @swagger
 * /api/withdrawals/admin:
 *   get:
 *     summary: Ambil semua withdrawal methods (khusus admin)
 *     tags: [Withdrawal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         required: false
 *         description: Halaman (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         required: false
 *         description: Jumlah item per halaman (default 10)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, providerName]
 *         description: Kolom untuk sorting
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Urutan sorting (asc/desc)
 *       - in: query
 *         name: providerName
 *         schema:
 *           type: string
 *         description: Filter berdasarkan provider (misalnya BCA, Dana, OVO)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [bank, eWallet]
 *         description: Filter berdasarkan tipe withdrawal
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter berdasarkan status aktif
 *     responses:
 *       200:
 *         description: Daftar withdrawal methods (admin)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       type:
 *                         type: string
 *                       providerName:
 *                         type: string
 *                       accountNumber:
 *                         type: string
 *                       accountName:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       user:
 *                         type: object
 *                         properties:
 *                           id: { type: string }
 *                           email: { type: string }
 *                           fullName: { type: string }
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total: { type: integer }
 *                     page: { type: integer }
 *                     totalPages: { type: integer }
 *                     limit: { type: integer }
 */
router.get(
  "/admin",
  authenticate,
  authorizeRoles("admin"),
  validate(getAdminWithdrawalsSchema),
  WithdrawalController.getAdminWithdrawalsController
);

export default router;
