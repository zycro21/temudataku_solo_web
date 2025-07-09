import { Router } from "express";
import * as BookingController from "../controllers/booking.controller";
import {
  createBookingSchema,
  getMenteeBookingsSchema,
  getMenteeBookingDetailSchema,
  updateMenteeBookingSchema,
  getAdminBookingsValidator,
  getAdminBookingDetailValidator,
  updateAdminBookingStatusValidator,
  exportAdminBookingsValidator,
  getBookingParticipantsIdValidator,
} from "../validations/booking.validation";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorizeRole";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Booking
 *   description: API untuk manajemen booking
 */

/**
 * @swagger
 * /api/booking/createBooking:
 *   post:
 *     summary: Buat booking baru
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mentoringServiceId
 *             properties:
 *               mentoringServiceId:
 *                 type: string
 *                 description: ID layanan mentoring yang ingin dibooking
 *               participantIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: (Opsional) Daftar ID peserta tambahan untuk layanan group
 *               referralUsageId:
 *                 type: string
 *                 description: (Opsional) ID referral usage untuk mendapatkan diskon
 *               specialRequests:
 *                 type: string
 *                 description: (Opsional) Permintaan khusus dari pengguna
 *               bookingDate:
 *                 type: string
 *                 format: date
 *                 description: (Wajib untuk one-on-one dan group) Tanggal booking dalam format YYYY-MM-DD
 *           example:
 *             mentoringServiceId: "svc-001"
 *             participantIds: ["usr-002", "usr-003"]
 *             referralUsageId: "ref-001"
 *             specialRequests: "Mohon gunakan Zoom"
 *             bookingDate: "2025-07-15"
 *     responses:
 *       201:
 *         description: Booking berhasil dibuat
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Booking berhasil dibuat.
 *               data:
 *                 id: "Booking-group-8638552204"
 *                 menteeId: "000008"
 *                 mentoringServiceId: "group-000002"
 *                 referralUsageId: "cmaa2m8d10001csssui0zoi3h8hfdidinfd"
 *                 specialRequests: "Mohon gunakan Zoom"
 *                 bookingDate: "2025-07-15T00:00:00.000Z"
 *                 status: "confirmed"
 *                 participants:
 *                   - userId: "usr-001"
 *                     isLeader: true
 *                     paymentStatus: "confirmed"
 *                   - userId: "usr-002"
 *                     isLeader: false
 *                     paymentStatus: "confirmed"
 *                   - userId: "usr-003"
 *                     isLeader: false
 *                     paymentStatus: "confirmed"
 *                 payment:
 *                   id: "pay-001"
 *                   bookingId: "book-001"
 *                   amount: 50000
 *                   status: "confirmed"
 *                 originalPrice: 50000
 *                 finalPrice: 45000
 *       400:
 *         description: Permintaan tidak valid (body tidak lengkap, layanan tidak tersedia, dsb)
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: bookingDate wajib diisi untuk layanan one-on-one atau group.
 *       401:
 *         description: Unauthorized (pengguna tidak login)
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Unauthorized. User ID not found.
 *       500:
 *         description: Kesalahan internal server
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Terjadi kesalahan pada server.
 */
router.post(
  "/createBooking",
  authenticate,
  validate(createBookingSchema),
  BookingController.createBookingController
);

/**
 * @swagger
 * /api/booking/mentee/bookings:
 *   get:
 *     summary: Ambil semua booking milik mentee
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: limit
 *         required: true
 *         schema:
 *           type: integer
 *         example: 10
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, completed, cancelled]
 *         example: confirmed
 *       - in: query
 *         name: sortBy
 *         required: false
 *         schema:
 *           type: string
 *           enum: [createdAt, bookingDate]
 *         example: createdAt
 *       - in: query
 *         name: sortOrder
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         example: desc
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar booking
 *         content:
 *           application/json:
 *             example:
 *               message: Berhasil mengambil daftar booking.
 *               data:
 *                 data:
 *                   - id: "book-001"
 *                     menteeId: "usr-001"
 *                     mentoringService:
 *                       id: "svc-001"
 *                       title: "Mentoring Web Development"
 *                     participants:
 *                       - userId: "usr-001"
 *                         isLeader: true
 *                         paymentStatus: "confirmed"
 *                   - id: "book-002"
 *                     menteeId: "usr-001"
 *                     mentoringService:
 *                       id: "svc-002"
 *                       title: "UI/UX Design Basics"
 *                     participants:
 *                       - userId: "usr-001"
 *                         isLeader: true
 *                         paymentStatus: "confirmed"
 *                 pagination:
 *                   page: 1
 *                   limit: 10
 *                   total: 2
 *                   totalPages: 1
 *       401:
 *         description: Unauthorized (pengguna tidak login)
 *         content:
 *           application/json:
 *             example:
 *               message: Unauthorized. User ID not found.
 *       404:
 *         description: Tidak ada booking dengan status tertentu
 *         content:
 *           application/json:
 *             example:
 *               message: Tidak ditemukan booking dengan status "cancelled".
 */
router.get(
  "/mentee/bookings",
  authenticate,
  validate(getMenteeBookingsSchema),
  BookingController.getMenteeBookingsController
);

/**
 * @swagger
 * /api/booking/mentee/bookings/{id}:
 *   get:
 *     summary: Ambil detail booking mentee
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID dari booking
 *         schema:
 *           type: string
 *           example: "book-001"
 *     responses:
 *       200:
 *         description: Detail booking berhasil diambil
 *         content:
 *           application/json:
 *             example:
 *               message: Detail booking berhasil diambil.
 *               data:
 *                 id: "book-001"
 *                 menteeId: "usr-001"
 *                 mentoringService:
 *                   id: "svc-001"
 *                   title: "UI/UX Design Basics"
 *                   serviceType: "group"
 *                 participants:
 *                   - userId: "usr-001"
 *                     isLeader: true
 *                     paymentStatus: "confirmed"
 *                     user:
 *                       id: "usr-001"
 *                       fullName: "Ani Rahma"
 *                       email: "ani@mail.com"
 *                       city: "Bandung"
 *                       province: "Jawa Barat"
 *                       profilePicture: "https://cdn.domain.com/avatar.jpg"
 *                 payment:
 *                   id: "pay-001"
 *                   amount: 200000
 *                   status: "confirmed"
 *       400:
 *         description: Booking ID tidak ditemukan di parameter
 *         content:
 *           application/json:
 *             example:
 *               message: Booking ID tidak ditemukan.
 *       401:
 *         description: Tidak ada token atau user tidak valid
 *         content:
 *           application/json:
 *             example:
 *               message: Unauthorized. User ID not found.
 *       403:
 *         description: Booking bukan milik user tersebut
 *         content:
 *           application/json:
 *             example:
 *               message: Akses ditolak. Bukan booking milikmu.
 *       404:
 *         description: Booking tidak ditemukan
 *         content:
 *           application/json:
 *             example:
 *               message: Booking tidak ditemukan.
 */
router.get(
  "/mentee/bookings/:id",
  authenticate,
  validate(getMenteeBookingDetailSchema),
  BookingController.getMenteeBookingDetailController
);

/**
 * @swagger
 * /api/booking/mentee/bookings/{id}:
 *   patch:
 *     summary: Update booking mentee
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID dari booking yang ingin diperbarui
 *         schema:
 *           type: string
 *           example: "book-001"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               specialRequests:
 *                 type: string
 *                 example: "Tolong mulai tepat waktu"
 *               participantIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["usr-002", "usr-003"]
 *     responses:
 *       200:
 *         description: Booking berhasil diperbarui
 *         content:
 *           application/json:
 *             example:
 *               message: Booking berhasil diperbarui.
 *               data:
 *                 id: "book-001"
 *                 specialRequests: "Tolong mulai tepat waktu"
 *                 participants:
 *                   - userId: "usr-001"
 *                     isLeader: true
 *                   - userId: "usr-002"
 *                     isLeader: false
 *       400:
 *         description: Validasi gagal atau status booking tidak bisa diubah
 *         content:
 *           application/json:
 *             example:
 *               message: "Hanya booking group yang bisa mengubah daftar peserta."
 *       401:
 *         description: Tidak ada token atau user tidak ditemukan
 *         content:
 *           application/json:
 *             example:
 *               message: "Unauthorized. User ID not found."
 *       403:
 *         description: User mencoba mengubah booking milik orang lain
 *         content:
 *           application/json:
 *             example:
 *               message: "Akses ditolak. Ini bukan booking milikmu."
 *       404:
 *         description: Booking tidak ditemukan
 *         content:
 *           application/json:
 *             example:
 *               message: "Booking tidak ditemukan."
 */
router.patch(
  "/mentee/bookings/:id",
  authenticate,
  validate(updateMenteeBookingSchema),
  BookingController.updateMenteeBookingController
);

/**
 * @swagger
 * /api/booking/mentee/bookings/{id}:
 *   delete:
 *     summary: Batalkan booking
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID dari booking yang ingin dibatalkan
 *         schema:
 *           type: string
 *           example: "book-001"
 *     responses:
 *       200:
 *         description: Booking berhasil dibatalkan
 *         content:
 *           application/json:
 *             example:
 *               message: Booking berhasil dibatalkan.
 *               data:
 *                 id: "book-001"
 *                 status: "cancelled"
 *       400:
 *         description: Booking sudah dibayar atau dikonfirmasi, tidak bisa dibatalkan
 *         content:
 *           application/json:
 *             example:
 *               message: Booking sudah dikonfirmasi atau dibayar, tidak bisa dibatalkan.
 *       401:
 *         description: Tidak ada token atau user tidak ditemukan
 *         content:
 *           application/json:
 *             example:
 *               message: Unauthorized. User ID not found.
 *       403:
 *         description: User mencoba membatalkan booking milik orang lain
 *         content:
 *           application/json:
 *             example:
 *               message: Akses ditolak. Ini bukan booking milikmu.
 *       404:
 *         description: Booking tidak ditemukan
 *         content:
 *           application/json:
 *             example:
 *               message: Booking tidak ditemukan.
 */
router.delete(
  "/mentee/bookings/:id",
  authenticate,
  BookingController.cancelMenteeBookingController
);

/**
 * @swagger
 * /api/booking/admin/bookings:
 *   get:
 *     summary: Ambil semua booking (admin only)
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         required: true
 *         description: Nomor halaman
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         required: true
 *         description: Jumlah item per halaman
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, completed, cancelled]
 *         description: Filter berdasarkan status booking
 *       - in: query
 *         name: menteeName
 *         schema:
 *           type: string
 *         description: Filter berdasarkan nama mentee (partial match)
 *       - in: query
 *         name: serviceName
 *         schema:
 *           type: string
 *         description: Filter berdasarkan nama service mentoring
 *       - in: query
 *         name: usedReferral
 *         schema:
 *           type: boolean
 *         description: Filter booking yang menggunakan referral code
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter booking mulai dari tanggal ini (yyyy-mm-dd)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter booking hingga tanggal ini (yyyy-mm-dd)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, bookingDate]
 *           default: createdAt
 *         description: Urutkan berdasarkan field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Urutan data (ascending atau descending)
 *     responses:
 *       200:
 *         description: Daftar booking berhasil diambil
 *         content:
 *           application/json:
 *             example:
 *               message: Berhasil mengambil daftar booking.
 *               data:
 *                 data:
 *                   - id: "book-123"
 *                     status: "confirmed"
 *                     bookingDate: "2025-07-01T10:00:00Z"
 *                     mentee:
 *                       id: "user-1"
 *                       fullName: "John Doe"
 *                     mentoringService:
 *                       id: "service-1"
 *                       serviceName: "Kelas Public Speaking"
 *                 meta:
 *                   page: 1
 *                   limit: 10
 *                   total: 25
 *                   totalPages: 3
 *       401:
 *         description: Tidak ada akses token atau token tidak valid
 *         content:
 *           application/json:
 *             example:
 *               message: Unauthorized
 *       403:
 *         description: Hanya admin yang bisa mengakses endpoint ini
 *         content:
 *           application/json:
 *             example:
 *               message: Forbidden
 */
router.get(
  "/admin/bookings",
  authenticate,
  authorizeRoles("admin"),
  validate(getAdminBookingsValidator),
  BookingController.getAdminBookingsController
);

/**
 * @swagger
 * /api/booking/admin/bookings/{id}:
 *   get:
 *     summary: Ambil detail booking oleh admin
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID booking yang ingin diambil
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detail booking berhasil diambil
 *         content:
 *           application/json:
 *             example:
 *               message: Berhasil mengambil detail booking.
 *               data:
 *                 id: "book-123"
 *                 status: "confirmed"
 *                 bookingDate: "2025-07-01T10:00:00Z"
 *                 mentee:
 *                   id: "user-1"
 *                   fullName: "John Doe"
 *                   email: "john@example.com"
 *                 mentoringService:
 *                   id: "svc-1"
 *                   serviceName: "Public Speaking 101"
 *                   serviceType: "group"
 *                 referralUsage:
 *                   id: "ref-1"
 *                   referralCode:
 *                     id: "code-abc"
 *                     discountPercentage: 10
 *                   user:
 *                     id: "user-2"
 *                     fullName: "Referrer Name"
 *                 participants:
 *                   - user:
 *                       id: "user-1"
 *                       fullName: "John Doe"
 *                       email: "john@gmail.com"
 *                     isLeader: true
 *                     paymentStatus: "confirmed"
 *                 payment:
 *                   id: "pay-123"
 *                   status: "confirmed"
 *                   amount: 50000
 *       404:
 *         description: Booking tidak ditemukan
 *         content:
 *           application/json:
 *             example:
 *               message: Booking tidak ditemukan.
 *       401:
 *         description: Tidak ada token atau token tidak valid
 *         content:
 *           application/json:
 *             example:
 *               message: Unauthorized
 *       403:
 *         description: Akses hanya untuk admin
 *         content:
 *           application/json:
 *             example:
 *               message: Forbidden
 */
router.get(
  "/admin/bookings/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(getAdminBookingDetailValidator),
  BookingController.getAdminBookingDetailController
);

/**
 * @swagger
 * /api/booking/admin/bookings/{id}:
 *   patch:
 *     summary: Update status booking (admin)
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID booking yang ingin diperbarui
 *         schema:
 *           type: string
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
 *                 enum: [pending, confirmed, completed, cancelled]
 *                 example: confirmed
 *     responses:
 *       200:
 *         description: Status booking berhasil diperbarui
 *         content:
 *           application/json:
 *             example:
 *               message: Status booking berhasil diperbarui menjadi confirmed.
 *               data:
 *                 id: "book-123"
 *                 status: "confirmed"
 *                 updatedAt: "2025-07-01T14:25:00.123Z"
 *       400:
 *         description: Status tidak valid atau konflik status booking
 *         content:
 *           application/json:
 *             example:
 *               message: Status booking tidak valid.
 *       401:
 *         description: Tidak ada token atau token tidak valid
 *         content:
 *           application/json:
 *             example:
 *               message: Unauthorized
 *       403:
 *         description: Akses hanya untuk admin
 *         content:
 *           application/json:
 *             example:
 *               message: Forbidden
 *       404:
 *         description: Booking tidak ditemukan
 *         content:
 *           application/json:
 *             example:
 *               message: Booking tidak ditemukan.
 */
router.patch(
  "/admin/bookings/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(updateAdminBookingStatusValidator),
  BookingController.updateAdminBookingStatusController
);

/**
 * @swagger
 * /api/booking/adminExportBook:
 *   get:
 *     summary: Export data booking (admin)
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: format
 *         in: query
 *         required: true
 *         description: Format file hasil export (csv atau excel)
 *         schema:
 *           type: string
 *           enum: [csv, excel]
 *           example: excel
 *     responses:
 *       200:
 *         description: File hasil export booking dalam format csv atau excel
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Format tidak valid atau gagal generate file
 *         content:
 *           application/json:
 *             example:
 *               message: Format tidak didukung.
 *       401:
 *         description: Tidak ada token atau token tidak valid
 *         content:
 *           application/json:
 *             example:
 *               message: Unauthorized
 *       403:
 *         description: Akses hanya untuk admin
 *         content:
 *           application/json:
 *             example:
 *               message: Forbidden
 */
router.get(
  "/adminExportBook",
  authenticate,
  authorizeRoles("admin"),
  validate(exportAdminBookingsValidator),
  BookingController.exportAdminBookings
);

/**
 * @swagger
 * /api/booking/menteeParticipants/bookings/{id}:
 *   get:
 *     summary: Ambil peserta dari booking mentee
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID booking yang ingin diambil pesertanya
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Daftar peserta booking berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 participants:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       participantId:
 *                         type: string
 *                         example: "part_abc123"
 *                       isLeader:
 *                         type: boolean
 *                         example: true
 *                       paymentStatus:
 *                         type: string
 *                         enum: [pending, confirmed, failed]
 *                         example: "pending"
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           fullName:
 *                             type: string
 *                           email:
 *                             type: string
 *                           phoneNumber:
 *                             type: string
 *                           city:
 *                             type: string
 *                           province:
 *                             type: string
 *                           profilePicture:
 *                             type: string
 *                             format: uri
 *                             example: "https://jjj.com/profile.jpg"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               message: Unauthorized
 *       403:
 *         description: Forbidden - Bukan pemilik booking
 *         content:
 *           application/json:
 *             example:
 *               message: You are not allowed to view this booking's participants
 *       404:
 *         description: Booking tidak ditemukan
 *         content:
 *           application/json:
 *             example:
 *               message: Booking not found
 */
router.get(
  "/menteeParticipants/bookings/:id",
  authenticate,
  validate(getBookingParticipantsIdValidator),
  BookingController.getBookingParticipantsController
);

export default router;
