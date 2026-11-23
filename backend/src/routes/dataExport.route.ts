import { Router } from "express";
import * as DataExportController from "../controllers/dataExport.controller.js";
import { dataExportLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: DataExport
 *     description: Ekspor seluruh data database (publik, dengan rate limit)
 */

/**
 * @swagger
 * /api/data-export:
 *   get:
 *     summary: Semua data database, dikelompokkan per tabel
 *     description: >
 *       Mengembalikan seluruh baris dari semua tabel, dengan nama kolom persis
 *       seperti di database. Tidak termasuk tabel dummy (companies, jobs) dan
 *       semua tabel practice (practices, practice_*). Kolom kredensial
 *       (password_hash, verification_token, fcmToken, googleId, edit_token,
 *       storage_path, accountNumber) tidak dikirim. Waktu dalam WIB (+07:00);
 *       kolom Decimal dikirim sebagai number. Rate limit 100 request / 15 menit
 *       per IP.
 *     tags: [DataExport]
 *     security: []
 *     responses:
 *       200:
 *         description: Data berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 generatedAt: { type: string, example: "2026-11-23T10:00:00+07:00" }
 *                 totalTables: { type: integer }
 *                 totalRows: { type: integer }
 *                 data:
 *                   type: object
 *                   description: Key = nama tabel
 *                   additionalProperties:
 *                     type: object
 *                     properties:
 *                       columns: { type: array, items: { type: string } }
 *                       total: { type: integer }
 *                       rows: { type: array, items: { type: object } }
 *       429:
 *         description: Terlalu banyak permintaan
 */
router.get("/", dataExportLimiter, DataExportController.getAllData);

export default router;
