import express from "express";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRole.js";
import RedeemCodeController from "../controllers/redeemCode.controller.js";
import {
  createRedeemCodeSchema,
  updateRedeemCodeSchema,
  redeemCodeIdParamSchema,
  listRedeemCodesQuerySchema,
  redeemCodeSchema,
  listRedeemUsagesQuerySchema,
} from "../validations/redeemCode.validation.js";

const router = express.Router();

// ═══════════════════════════ ADMIN ═══════════════════════════

/**
 * @swagger
 * /api/redeemCode/codes:
 *   post:
 *     summary: Admin generate kode redeem baru
 *     description:
 *       - code opsional — kalau tidak dikirim, sistem generate kode acak format XXXX-XXXX-XXXX.
 *       - planId & code TIDAK bisa diubah lagi setelah dibuat (lihat PATCH).
 *     tags: [Redeem Code]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [planId, expiresAt]
 *             properties:
 *               planId:
 *                 type: string
 *                 example: "plan-xxxx"
 *               code:
 *                 type: string
 *                 example: "PROMO-AGT26-001"
 *               maxUses:
 *                 type: integer
 *                 example: 100
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-12-31T23:59:59.000Z"
 *               note:
 *                 type: string
 *                 example: "Giveaway IG Agustus 2026"
 *     responses:
 *       201:
 *         description: Kode redeem berhasil dibuat
 *       400:
 *         description: Request tidak valid
 *       403:
 *         description: Hanya admin yang dapat membuat kode redeem
 *       404:
 *         description: Plan tidak ditemukan
 *       409:
 *         description: Kode sudah dipakai
 */
router.post(
  "/codes",
  authenticate,
  authorizeRoles("admin", "cm", "curdev"),
  validate(createRedeemCodeSchema),
  RedeemCodeController.createRedeemCode,
);

/**
 * @swagger
 * /api/redeemCode/codes:
 *   get:
 *     summary: Admin list semua kode redeem
 *     tags: [Redeem Code]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: planId
 *         schema: { type: string }
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Daftar kode redeem
 *       403:
 *         description: Hanya admin yang dapat mengakses endpoint ini
 */
router.get(
  "/codes",
  authenticate,
  authorizeRoles("admin", "cm", "curdev"),
  validate(listRedeemCodesQuerySchema),
  RedeemCodeController.getRedeemCodes,
);

/**
 * @swagger
 * /api/redeemCode/codes/{id}:
 *   get:
 *     summary: Admin ambil detail 1 kode redeem beserta riwayat pemakaiannya
 *     tags: [Redeem Code]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Detail kode redeem
 *       403:
 *         description: Hanya admin yang dapat mengakses endpoint ini
 *       404:
 *         description: Kode redeem tidak ditemukan
 */
router.get(
  "/codes/:id",
  authenticate,
  authorizeRoles("admin", "cm", "curdev"),
  validate(redeemCodeIdParamSchema),
  RedeemCodeController.getRedeemCodeById,
);

/**
 * @swagger
 * /api/redeemCode/codes/{id}:
 *   patch:
 *     summary: Admin update kode redeem (maxUses, expiresAt, isActive, note)
 *     description: planId dan code TIDAK bisa diubah — cuma field operasional yang bisa.
 *     tags: [Redeem Code]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               maxUses: { type: integer }
 *               expiresAt: { type: string, format: date-time }
 *               isActive: { type: boolean }
 *               note: { type: string }
 *     responses:
 *       200:
 *         description: Kode redeem berhasil diperbarui
 *       400:
 *         description: Request tidak valid / maxUses lebih kecil dari usedCount
 *       403:
 *         description: Hanya admin yang dapat mengubah kode redeem
 *       404:
 *         description: Kode redeem tidak ditemukan
 */
router.patch(
  "/codes/:id",
  authenticate,
  authorizeRoles("admin", "cm", "curdev"),
  validate(redeemCodeIdParamSchema),
  validate(updateRedeemCodeSchema),
  RedeemCodeController.updateRedeemCode,
);

/**
 * @swagger
 * /api/redeemCode/codes/{id}:
 *   delete:
 *     summary: Admin hapus kode redeem
 *     description: Ditolak kalau kode sudah pernah dipakai (usedCount > 0) — nonaktifkan (isActive false) saja lewat PATCH.
 *     tags: [Redeem Code]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Kode redeem berhasil dihapus
 *       400:
 *         description: Kode sudah pernah dipakai, tidak bisa dihapus
 *       403:
 *         description: Hanya admin yang dapat menghapus kode redeem
 *       404:
 *         description: Kode redeem tidak ditemukan
 */
router.delete(
  "/codes/:id",
  authenticate,
  authorizeRoles("admin", "cm", "curdev"),
  validate(redeemCodeIdParamSchema),
  RedeemCodeController.deleteRedeemCode,
);

// ═══════════════════════════ USER (siapa pun yang login) ═════════════════════

/**
 * @swagger
 * /api/redeemCode/redeem/status:
 *   get:
 *     summary: Cek sisa kuota percobaan redeem user saat ini (rate limit 6 gagal / 24 jam)
 *     description: Dipanggil sebelum user submit kode, buat nampilin sisa kuota / waktu boleh coba lagi di UI.
 *     tags: [Redeem Code]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status kuota percobaan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     attemptsRemaining: { type: integer, example: 4 }
 *                     maxAttempts: { type: integer, example: 6 }
 *                     retryAfter:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 */
router.get(
  "/redeem/status",
  authenticate,
  RedeemCodeController.getRedeemAttemptStatus,
);

/**
 * @swagger
 * /api/redeemCode/redeem:
 *   post:
 *     summary: User redeem kode untuk dapat akses ELearningSubscription tanpa payment
 *     description: Dibatasi maksimal 6 percobaan GAGAL dalam 24 jam per user (lihat GET /redeem/status).
 *     tags: [Redeem Code]
 *     security:
 *       - bearerAuth: []
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
 *                 example: "PROMO-AGT26-001"
 *     responses:
 *       200:
 *         description: Kode berhasil dipakai, subscription aktif
 *       400:
 *         description: Kode tidak aktif / kadaluarsa / kuota habis
 *       404:
 *         description: Kode redeem tidak ditemukan
 *       409:
 *         description: User sudah pernah redeem kode ini
 *       429:
 *         description: Terlalu banyak percobaan gagal, coba lagi dalam 24 jam
 */
router.post(
  "/redeem",
  authenticate,
  validate(redeemCodeSchema),
  RedeemCodeController.redeemCode,
);

// ═══════════════════ DUAL-ROLE (admin lihat semua, user lihat sendiri) ═══════

/**
 * @swagger
 * /api/redeemCode/usages:
 *   get:
 *     summary: Riwayat pemakaian kode redeem — admin lihat semua user, user biasa cuma lihat miliknya sendiri
 *     description:
 *       - Kalau requester admin/cm/curdev, filter userId di query berlaku bebas (atau kosongkan buat lihat semua).
 *       - Kalau requester bukan admin, query userId DIABAIKAN — selalu dipaksa filter ke dirinya sendiri.
 *     tags: [Redeem Code]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: userId
 *         schema: { type: string }
 *         description: Hanya berlaku untuk admin/cm/curdev
 *       - in: query
 *         name: redeemCodeId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Riwayat pemakaian kode redeem
 */
router.get(
  "/usages",
  authenticate,
  validate(listRedeemUsagesQuerySchema),
  RedeemCodeController.getRedeemUsages,
);

export default router;
