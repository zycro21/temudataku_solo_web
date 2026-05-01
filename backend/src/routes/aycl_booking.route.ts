import express from "express";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRole.js";
import {
 createAyclBookingSchema,
 getAyclBookingByIdSchema,
 updateAyclBookingSchema,
 getAllAyclBookingsSchema,
 deleteAyclBookingSchema,
} from "../validations/aycl_booking.validation.js";
import { AyclBookingController } from "../controllers/aycl_booking.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: AYCL Booking
 *     description: Manajemen AYCL Booking
 */

/**
 * @swagger
 * /api/ayclbooking/create:
 *   post:
 *     summary: Buat booking AYCL
 *     tags: [AYCL Booking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - batchId
 *             properties:
 *               batchId:
 *                 type: string
 *               referralUsageId:
 *                 type: string
 *           example:
 *             batchId: "batch-001"
 *             referralUsageId: "ref-001"
 *     responses:
 *       201:
 *         description: Booking berhasil dibuat
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Booking AYCL berhasil dibuat
 *               data:
 *                 id: "AYCLBook-20260421-ABC123"
 *                 userId: "usr-001"
 *                 batchId: "batch-001"
 *                 status: "pending"
 *                 payment:
 *                   id: "PAY-AYCL-20260421-1234567890"
 *                   amount: 100000
 *                   status: "pending"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Batch tidak ditemukan
 *       400:
 *         description: Sudah pernah booking
 */
router.post(
  "/create",
  authenticate,
  validate(createAyclBookingSchema),
  AyclBookingController.createAyclBooking
);

/**
 * @swagger
 * /api/ayclbooking/{id}:
 *   get:
 *     summary: Ambil detail booking AYCL berdasarkan ID
 *     tags: [AYCL Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID AYCL Booking
 *     responses:
 *       200:
 *         description: Detail booking berhasil diambil
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: "AYCLBook-20260421-ABC123"
 *                 status: "pending"
 *                 batch:
 *                   title: "AYCL Data Analyst"
 *                   price: 100000
 *                 payment:
 *                   id: "PAY-AYCL-20260421-123456"
 *                   amount: 100000
 *                   status: "pending"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking tidak ditemukan
 */
router.get(
  "/:id",
  authenticate,
  validate(getAyclBookingByIdSchema),
  AyclBookingController.getAyclBookingById
);

/**
 * @swagger
 * /api/ayclbooking:
 *   get:
 *     summary: Ambil semua booking AYCL (admin, cm, curdev)
 *     tags: [AYCL Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Halaman
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Jumlah data per halaman
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Cari berdasarkan nama user, email, atau judul batch
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, completed, cancelled]
 *         description: Filter berdasarkan status booking
 *       - in: query
 *         name: batchId
 *         schema:
 *           type: string
 *         description: Filter berdasarkan batch ID
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, status]
 *           default: createdAt
 *         description: Field untuk sorting
 *       - in: query
 *         name: sortDir
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Arah sorting
 *     responses:
 *       200:
 *         description: Berhasil mengambil semua booking AYCL
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data: []
 *               meta:
 *                 total: 100
 *                 page: 1
 *                 limit: 20
 *                 totalPages: 5
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/",
  authenticate,
  authorizeRoles("admin", "cm", "curdev"),
  validate(getAllAyclBookingsSchema),
  AyclBookingController.getAllAyclBookings
);

/**
 * @swagger
 * /api/ayclbooking/{id}:
 *   patch:
 *     summary: Update booking AYCL (partial + pilih schedule)
 *     tags: [AYCL Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID booking AYCL
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentStatus:
 *                 type: string
 *               institution:
 *                 type: string
 *               studyProgram:
 *                 type: string
 *               semester:
 *                 type: string
 *               age:
 *                 type: number
 *               reason:
 *                 type: string
 *               familiarity:
 *                 type: string
 *               selectedSchedules:
 *                 type: array
 *                 items:
 *                   type: string
 *           example:
 *             currentStatus: "Mahasiswa"
 *             institution: "ITS"
 *             studyProgram: "Informatika"
 *             semester: "6"
 *             age: 21
 *             reason: "Ingin belajar data analyst"
 *             familiarity: "Pernah ikut pelatihan"
 *             selectedSchedules: ["schedule-1", "schedule-2"]
 *     responses:
 *       200:
 *         description: Booking berhasil diupdate
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking tidak ditemukan
 */
router.patch(
  "/:id",
  authenticate,
  validate(updateAyclBookingSchema),
  AyclBookingController.updateAyclBooking
);

/**
 * @swagger
 * /api/ayclbooking/{id}:
 *   delete:
 *     summary: Hapus booking AYCL beserta data turunannya (kecuali payment)
 *     tags: [AYCL Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID AYCL Booking
 *     responses:
 *       200:
 *         description: Booking berhasil dihapus
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Booking AYCL berhasil dihapus
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Booking tidak ditemukan
 */
router.delete(
  "/:id",
  authenticate,
  authorizeRoles("admin", "cm", "curdev"),
  validate(deleteAyclBookingSchema),
  AyclBookingController.deleteAyclBooking
);

/**
 * @swagger
 * /api/ayclbooking/stats/ayclbooking:
 *   get:
 *     summary: Ambil statistik booking AYCL (admin, cm, curdev)
 *     tags: [AYCL Booking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistik berhasil diambil
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 totalPendaftar: 120
 *                 totalKonfirmasi: 95
 *                 totalMingguIni: 14
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/stats/ayclbooking",
  authenticate,
  authorizeRoles("admin", "cm", "curdev"),
  AyclBookingController.getAyclBookingStats
);

router.get(
  "/mentee/incomplete",
  authenticate,
  AyclBookingController.getIncompleteAyclBookings
);

export default router;