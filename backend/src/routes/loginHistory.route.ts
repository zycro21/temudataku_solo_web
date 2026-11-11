import { Router } from "express";
import * as LoginHistoryController from "../controllers/loginHistory.controller.js";
import {
  getLoginHistorySchema,
  getLoginHistorySummarySchema,
  getMyLoginHistorySchema,
  getPurchasesSchema,
  getFormResponsesSchema,
} from "../validations/loginHistory.validation.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: LoginHistory
 *     description: Riwayat login user (semua role, login biasa / Google / affiliator)
 */

/**
 * @swagger
 * /api/login-history:
 *   get:
 *     summary: Riwayat login semua user
 *     tags: [LoginHistory]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *       - in: query
 *         name: userId
 *         schema: { type: string }
 *         description: Riwayat satu user saja
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Cari nama atau email
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [mentee, mentor, affiliator, admin, cm, curdev, cw, guest]
 *         description: Role user saat login
 *       - in: query
 *         name: method
 *         schema: { type: string, enum: [PASSWORD, GOOGLE] }
 *       - in: query
 *         name: portal
 *         schema: { type: string, enum: [WEB, AFFILIATOR] }
 *       - in: query
 *         name: from
 *         schema: { type: string, example: "2026-11-01" }
 *         description: Tanggal saja = hari WIB; atau ISO datetime lengkap
 *       - in: query
 *         name: to
 *         schema: { type: string, example: "2026-11-09" }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *     responses:
 *       200:
 *         description: Riwayat login berhasil diambil
 */
router.get(
  "/",
  validate(getLoginHistorySchema),
  LoginHistoryController.getLoginHistory,
);

/**
 * @swagger
 * /api/login-history/summary:
 *   get:
 *     summary: Ringkasan login per metode, portal, role, dan per hari
 *     tags: [LoginHistory]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string, example: "2026-10-10" }
 *         description: Default 30 hari sebelum "to"
 *       - in: query
 *         name: to
 *         schema: { type: string, example: "2026-11-09" }
 *         description: Default sekarang
 *     responses:
 *       200:
 *         description: Ringkasan berhasil diambil
 */
router.get(
  "/summary",
  validate(getLoginHistorySummarySchema),
  LoginHistoryController.getLoginHistorySummary,
);

/**
 * @swagger
 * /api/login-history/purchases:
 *   get:
 *     summary: Daftar pembelian produk (mentoring, bootcamp, e-learning, AYCL) berdasarkan payment
 *     description: >
 *       Satu baris = satu payment. Pembelian berulang dan cicilan tampil
 *       sebagai baris terpisah. Default hanya payment berstatus "confirmed".
 *     tags: [LoginHistory]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50, maximum: 500 }
 *       - in: query
 *         name: userId
 *         schema: { type: string }
 *         description: Pembelian satu user saja
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Nama, email, atau telepon pembeli; atau nama produk
 *       - in: query
 *         name: productType
 *         schema: { type: string, enum: [MENTORING, BOOTCAMP, ELEARNING, AYCL] }
 *         description: MENTORING = one-on-one & group; BOOTCAMP = service bertipe bootcamp
 *       - in: query
 *         name: serviceType
 *         schema: { type: string, example: one-on-one }
 *         description: Khusus MENTORING (one-on-one, group)
 *       - in: query
 *         name: status
 *         schema: { type: string, default: confirmed }
 *         description: Status payment. Isi "all" untuk semua status.
 *       - in: query
 *         name: from
 *         schema: { type: string, example: "2026-11-01" }
 *         description: Tanggal pembayaran (tanggal saja = hari WIB)
 *       - in: query
 *         name: to
 *         schema: { type: string, example: "2026-11-09" }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *     responses:
 *       200:
 *         description: Daftar pembelian berhasil diambil
 */
router.get(
  "/purchases",
  validate(getPurchasesSchema),
  LoginHistoryController.getPurchases,
);

/**
 * @swagger
 * /api/login-history/form-responses:
 *   get:
 *     summary: Daftar pengisian form (event & non-event) beserta jawabannya
 *     description: >
 *       Satu baris = satu response. Field "type" = jenis form (EVENT /
 *       NON_EVENT). "email" diambil dari email yang diisi responder di form,
 *       atau email akunnya. Default hanya response berstatus SUBMITTED.
 *     tags: [LoginHistory]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [EVENT, NON_EVENT] }
 *       - in: query
 *         name: formId
 *         schema: { type: string }
 *       - in: query
 *         name: userId
 *         schema: { type: string }
 *         description: Akun responder
 *       - in: query
 *         name: email
 *         schema: { type: string }
 *         description: Email responder (mengandung teks ini)
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Email, nama, atau telepon responder; atau judul form
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [SUBMITTED, DRAFT, ALL], default: SUBMITTED }
 *       - in: query
 *         name: from
 *         schema: { type: string, example: "2026-11-01" }
 *         description: Tanggal submit (tanggal saja = hari WIB)
 *       - in: query
 *         name: to
 *         schema: { type: string, example: "2026-11-09" }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *     responses:
 *       200:
 *         description: Daftar pengisian form berhasil diambil
 */
router.get(
  "/form-responses",
  validate(getFormResponsesSchema),
  LoginHistoryController.getFormResponses,
);

/**
 * @swagger
 * /api/login-history/me:
 *   get:
 *     summary: Riwayat login milik sendiri
 *     tags: [LoginHistory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10, maximum: 50 }
 *     responses:
 *       200:
 *         description: Riwayat login berhasil diambil
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/me",
  authenticate,
  validate(getMyLoginHistorySchema),
  LoginHistoryController.getMyLoginHistory,
);

export default router;
