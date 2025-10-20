import { Router } from "express";
import * as BookingController from "../controllers/booking.controller.js";
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
  getMentorEarningsValidator,
  getMentorBookingsValidator,
  getCompletedProgramsSchema,
} from "../validations/booking.validation.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRole.js";
import { handleSupportDocumentUpload } from "../middlewares/uploadImage.js";

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
 *         multipart/form-data:
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
 *               material:
 *                 type: string
 *                 description: (Opsional) Materi atau bahan yang ingin dibahas
 *               expectedOutput:
 *                 type: string
 *                 description: (Opsional) Hasil yang diharapkan dari sesi
 *               supportDocument:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: (Opsional) Dokumen pendukung dalam bentuk file (PDF, DOCX, PNG, dll.)
 *           example:
 *             mentoringServiceId: "svc-001"
 *             participantIds: ["usr-002", "usr-003"]
 *             referralUsageId: "ref-001"
 *             specialRequests: "Mohon gunakan Zoom"
 *             bookingDate: "2025-07-15"
 *             material: "Proposal bisnis"
 *             expectedOutput: "Feedback detail untuk pitch deck"
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
 *                 menteeId: "usr-001"
 *                 mentoringServiceId: "svc-001"
 *                 referralUsageId: "ref-001"
 *                 specialRequests: "Mohon gunakan Zoom"
 *                 bookingDate: "2025-07-15T00:00:00.000Z"
 *                 material: "Proposal bisnis"
 *                 expectedOutput: "Feedback detail untuk pitch deck"
 *                 supportDocument:
 *                   - "supportDocument/SupportDoc-Proposal-20251002-153011.pdf"
 *                   - "supportDocument/SupportDoc-Dataset-20251002-153020.pdf"
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
 *                   bookingId: "Booking-group-8638552204"
 *                   amount: 50000
 *                   status: "confirmed"
 *                 originalPrice: 50000
 *                 finalPrice: 45000
 *       400:
 *         description: Permintaan tidak valid (body tidak lengkap, layanan tidak tersedia, dsb)
 *         content:
 *           application/json:
 *             examples:
 *               invalidDate:
 *                 summary: Format tanggal salah
 *                 value:
 *                   success: false
 *                   message: "Format bookingDate tidak valid. Gunakan yyyy-mm-dd."
 *               overCapacity:
 *                 summary: Peserta melebihi kapasitas
 *                 value:
 *                   success: false
 *                   message: "Maksimal 5 peserta diperbolehkan."
 *               duplicateParticipants:
 *                 summary: Duplikat participantIds
 *                 value:
 *                   success: false
 *                   message: "Terdapat duplikat pada participantIds."
 *       401:
 *         description: Unauthorized (pengguna tidak login)
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Unauthorized. User ID not found."
 *       404:
 *         description: Data tidak ditemukan (mentoring service atau referral usage tidak ada)
 *         content:
 *           application/json:
 *             examples:
 *               serviceNotFound:
 *                 summary: Layanan tidak ada
 *                 value:
 *                   success: false
 *                   message: "Mentoring service tidak ditemukan atau tidak aktif."
 *               referralNotFound:
 *                 summary: Referral tidak ada
 *                 value:
 *                   success: false
 *                   message: "Referral usage tidak ditemukan."
 *       500:
 *         description: Kesalahan internal server
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Terjadi kesalahan pada server."
 */
router.post(
  "/createBooking",
  authenticate,
  handleSupportDocumentUpload("supportDocument", true), // multiple upload
  validate(createBookingSchema),
  BookingController.createBookingController
);

/**
 * @swagger
 * /api/booking/mentee/bookings:
 *   get:
 *     summary: Ambil semua booking milik mentee (dengan pagination, filter, sorting, feedback, dan status submission project)
 *     description: >
 *       Endpoint ini mengembalikan semua booking yang dimiliki oleh mentee tertentu, lengkap dengan informasi mentoring service, proyek, submission milik mentee, sesi mentoring, profil mentor, serta feedback yang sudah diberikan untuk setiap sesi.
 *       <br>Tambahan: setiap project kini memiliki field `status` (Belum Dikumpulkan, Sudah Dikumpulkan, Perlu Revisi, atau Sudah Direview) berdasarkan kondisi submission mentee.
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 1
 *         description: Halaman keberapa data ingin diambil.
 *       - in: query
 *         name: limit
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 10
 *         description: Jumlah item per halaman.
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, completed, cancelled]
 *         example: confirmed
 *         description: Filter berdasarkan status booking.
 *       - in: query
 *         name: sortBy
 *         required: false
 *         schema:
 *           type: string
 *           enum: [createdAt, bookingDate]
 *         example: createdAt
 *         description: Urutkan hasil berdasarkan kolom tertentu.
 *       - in: query
 *         name: sortOrder
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         example: desc
 *         description: Urutan pengurutan hasil (naik atau turun).
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar booking milik mentee
 *         content:
 *           application/json:
 *             example:
 *               message: "Berhasil mengambil daftar booking."
 *               data:
 *                 data:
 *                   - id: "book-001"
 *                     menteeId: "usr-001"
 *                     status: "confirmed"
 *                     bookingDate: "2025-10-12T07:45:23.000Z"
 *                     createdAt: "2025-10-12T07:45:23.000Z"
 *                     updatedAt: "2025-10-12T07:45:23.000Z"
 *                     mentoringService:
 *                       id: "svc-001"
 *                       serviceName: "Mentoring Web Development"
 *                       description: "Belajar membuat aplikasi web modern dengan React dan Next.js"
 *                       price: 300000
 *                       durationDays: 14
 *                       projects:
 *                         - id: "proj-001"
 *                           title: "Portfolio Website"
 *                           description: "Bangun website portfolio menggunakan Next.js"
 *                           deadline: "2025-10-20"
 *                           status: "Sudah Direview"
 *                           submissions:
 *                             - id: "subm-001"
 *                               projectId: "proj-001"
 *                               projectLink: "https://drive.google.com/abc123"
 *                               submissionDate: "2025-10-13T10:00:00Z"
 *                               score: 95
 *                               plagiarismScore: 3.2
 *                               mentorFeedback: "Strukturnya sudah bagus, tinggal perbaiki UI."
 *                               reviewStatus: "REVIEWED"
 *                               isReviewed: true
 *                               isRevisedRequired: false
 *                               revisionDeadline: null
 *                               createdAt: "2025-10-13T09:50:00Z"
 *                               updatedAt: "2025-10-13T11:30:00Z"
 *                         - id: "proj-002"
 *                           title: "Todolist App"
 *                           description: "Aplikasi manajemen tugas dengan React dan Zustand"
 *                           deadline: "2025-10-25"
 *                           status: "Belum Dikumpulkan"
 *                           submissions: []
 *                       mentoringSessions:
 *                         - id: "sess-001"
 *                           date: "2025-10-15"
 *                           startTime: "10:00"
 *                           endTime: "12:00"
 *                           durationMinutes: 120
 *                           meetingLink: "https://zoom.us/j/123456"
 *                           mentors:
 *                             - id: "mnt-001"
 *                               mentorProfile:
 *                                 id: "prof-001"
 *                                 expertise: "Frontend Development"
 *                                 user:
 *                                   id: "usr-010"
 *                                   fullName: "John Doe"
 *                                   email: "john@example.com"
 *                                   profilePicture: "https://cdn.example.com/profiles/john.jpg"
 *                           feedbacks:
 *                             - id: "fb-001"
 *                               rating: 5
 *                               comment: "Sesi mentoring sangat membantu!"
 *                               createdAt: "2025-10-16T10:00:00Z"
 *                               user:
 *                                 id: "usr-001"
 *                                 fullName: "Jane Smith"
 *                                 profilePicture: "https://cdn.example.com/profiles/jane.jpg"
 *                     participants:
 *                       - userId: "usr-001"
 *                         isLeader: true
 *                         paymentStatus: "confirmed"
 *                       - userId: "usr-002"
 *                         isLeader: false
 *                         paymentStatus: "pending"
 *                 pagination:
 *                   page: 1
 *                   limit: 10
 *                   total: 2
 *                   totalPages: 1
 *       401:
 *         description: Unauthorized - pengguna belum login atau token tidak valid
 *         content:
 *           application/json:
 *             example:
 *               message: "Unauthorized. User ID not found."
 *       404:
 *         description: Tidak ditemukan booking dengan status tertentu
 *         content:
 *           application/json:
 *             example:
 *               message: "Tidak ditemukan booking dengan status cancelled."
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
 *                   serviceName: "UI/UX Design Basics"
 *                   serviceType: "group"
 *                   mentoringSessions:
 *                     - id: "sess-001"
 *                       date: "2025-10-15"
 *                       startTime: "10:00"
 *                       endTime: "12:00"
 *                       durationMinutes: 120
 *                       mentors:
 *                         - id: "msm-001"
 *                           mentorProfile:
 *                             id: "mentor-001"
 *                             fullName: "John Doe"
 *                             profilePicture: null
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
 *                 material: "Materi tentang user interface"
 *                 expectedOutput: "Membuat wireframe sederhana"
 *                 supportDocument:
 *                   - "supportDocuments/SupportDoc-laporan_1-20251002-232514.pdf"
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
 * /api/booking/mentee/completed-programs:
 *   get:
 *     summary: Ambil semua program yang telah dilakukan oleh mentee (berdasarkan durasi program)
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
 *         name: sortBy
 *         required: false
 *         schema:
 *           type: string
 *           enum: [createdAt, bookingDate]
 *         example: bookingDate
 *       - in: query
 *         name: sortOrder
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         example: desc
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar program yang telah dilakukan
 *         content:
 *           application/json:
 *             example:
 *               message: Berhasil mengambil program telah dilakukan.
 *               data:
 *                 data:
 *                   - id: "book-001"
 *                     menteeId: "usr-001"
 *                     bookingDate: "2025-05-01T10:00:00Z"
 *                     mentoringService:
 *                       id: "svc-001"
 *                       serviceName: "Frontend Masterclass"
 *                       durationDays: 30
 *                     status: "confirmed"
 *                 pagination:
 *                   page: 1
 *                   limit: 10
 *                   total: 1
 *                   totalPages: 1
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               message: Unauthorized. User ID not found.
 */
router.get(
  "/mentee/completed-programs",
  authenticate,
  validate(getCompletedProgramsSchema),
  BookingController.getCompletedProgramsController
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
 *               material:
 *                 type: string
 *                 example: "Materi tentang user interface"
 *               expectedOutput:
 *                 type: string
 *                 example: "Membuat wireframe sederhana"
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
 *                 material: "Materi tentang user interface"
 *                 expectedOutput: "Membuat wireframe sederhana"
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
 *                     specialRequests: "Tolong mulai tepat waktu"
 *                     material: "Materi UI/UX Basics"
 *                     expectedOutput: "Membuat wireframe sederhana"
 *                     supportDocument: ["supportDocuments/SupportDoc-laporan_1-20251002-232514.pdf"]
 *                     mentee:
 *                       id: "user-1"
 *                       fullName: "John Doe"
 *                     mentoringService:
 *                       id: "service-1"
 *                       serviceName: "Kelas Public Speaking"
 *                     referralUsage:
 *                       id: "ref-001"
 *                       referralCode:
 *                         id: "code-001"
 *                         code: "REF2025"
 *                     payment:
 *                       id: "pay-001"
 *                       amount: 200000
 *                       status: "confirmed"
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
 *                 specialRequests: "Minta tambahan materi A"
 *                 material: "Materi A"
 *                 expectedOutput: "Bisa presentasi lancar"
 *                 supportDocument: "link-ke-dokumen.pdf"
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
 *     summary: Export data booking (admin) termasuk kolom baru seperti material, expectedOutput, supportDocument
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: format
 *         in: query
 *         required: true
 *         description: Format file hasil export (csv atau excel). Semua kolom booking akan di-export.
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

/**
 * @swagger
 * /api/booking/mentor/earnings:
 *   get:
 *     summary: Ambil total earnings mentor
 *     description: >
 *       - Admin bisa melihat earnings semua mentor dengan pagination.
 *       - Mentor hanya bisa melihat earnings miliknya sendiri.
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: mentorId
 *         schema:
 *           type: string
 *         required: false
 *         description: ID mentor (hanya digunakan oleh admin, opsional)
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *         required: false
 *         description: Nomor halaman (hanya untuk admin)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *         required: false
 *         description: Jumlah data per halaman (hanya untuk admin)
 *     responses:
 *       200:
 *         description: Total earnings berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Berhasil mengambil earnings.
 *                 data:
 *                   oneOf:
 *                     - type: object
 *                       description: Earnings mentor tunggal (untuk role mentor)
 *                       properties:
 *                         total:
 *                           type: number
 *                           example: 1500000
 *                         growthPercent:
 *                           type: number
 *                           example: 20
 *                     - type: object
 *                       description: Earnings semua mentor (untuk admin)
 *                       properties:
 *                         data:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               mentorId:
 *                                 type: string
 *                                 example: "clhvf3k00001abc123xyz"
 *                               fullName:
 *                                 type: string
 *                                 example: "Dimas Putra"
 *                               total:
 *                                 type: number
 *                                 example: 1500000
 *                               growthPercent:
 *                                 type: number
 *                                 example: 20
 *                         pagination:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: number
 *                               example: 50
 *                             page:
 *                               type: number
 *                               example: 1
 *                             limit:
 *                               type: number
 *                               example: 10
 *                             totalPages:
 *                               type: number
 *                               example: 5
 *       401:
 *         description: Unauthorized - token tidak valid atau tidak disertakan
 *       403:
 *         description: Forbidden - user tidak memiliki role admin atau mentor
 *       500:
 *         description: Internal Server Error
 */
router.get(
  "/mentor/earnings",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(getMentorEarningsValidator),
  BookingController.getMentorEarningsController
);

/**
 * @swagger
 * /api/booking/mentor/bookings:
 *   get:
 *     summary: Ambil daftar booking yang berkaitan dengan mentor (beserta participants)
 *     description: >
 *       - Mentor hanya bisa melihat booking miliknya sendiri (service yang dia handle).
 *       - Admin bisa melihat booking semua mentor (opsional pakai query `mentorId`).
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: mentorId
 *         schema:
 *           type: string
 *         required: false
 *         description: ID mentorProfile (opsional, hanya untuk admin)
 *     responses:
 *       200:
 *         description: Daftar booking berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Berhasil mengambil booking mentor.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       bookingId:
 *                         type: string
 *                         example: "clhvf3k00001abc123xyz"
 *                       serviceId:
 *                         type: string
 *                         example: "clhvf3k0000service123"
 *                       serviceName:
 *                         type: string
 *                         example: "Mentoring 1 on 1"
 *                       serviceType:
 *                         type: string
 *                         example: "1-on-1"
 *                       status:
 *                         type: string
 *                         example: "confirmed"
 *                       material:
 *                         type: string
 *                         description: Materi yang diminta mentee
 *                         example: "Belajar presentasi"
 *                       expectedOutput:
 *                         type: string
 *                         description: Ekspektasi output dari mentee
 *                         example: "Presentasi lancar dan percaya diri"
 *                       supportDocument:
 *                         type: string
 *                         description: Link dokumen pendukung yang diunggah mentee
 *                         example: "https://example.com/doc.pdf"
 *                       participants:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             participantId:
 *                               type: string
 *                               example: "clhvf3k0000part123"
 *                             isLeader:
 *                               type: boolean
 *                               example: true
 *                             paymentStatus:
 *                               type: string
 *                               example: "confirmed"
 *                             user:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                 fullName:
 *                                   type: string
 *                                 email:
 *                                   type: string
 *                                 city:
 *                                   type: string
 *                                 province:
 *                                   type: string
 *                                 profilePicture:
 *                                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal Server Error
 */
router.get(
  "/mentor/bookings",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(getMentorBookingsValidator),
  BookingController.getMentorBookingsController
);

/**
 * @swagger
 * /api/booking/mentorStat/bookings:
 *   get:
 *     summary: Ambil jumlah mentee per tipe service
 *     description: >
 *       - Mentor hanya bisa melihat rekap jumlah mentee dari service yang dia handle.
 *       - Admin bisa melihat semua mentor (opsional pakai query `mentorId` untuk filter).
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: mentorId
 *         schema:
 *           type: string
 *         required: false
 *         description: ID mentorProfile (opsional, hanya untuk admin)
 *     responses:
 *       200:
 *         description: Rekap jumlah mentee per service type berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Berhasil mengambil rekap mentee per service.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       mentorId:
 *                         type: string
 *                         example: "clhvf3k00001mentor123"
 *                       serviceType:
 *                         type: string
 *                         example: "1-on-1"
 *                       totalMentees:
 *                         type: integer
 *                         example: 15
 *                       totalSessions:
 *                         type: integer
 *                         example: 7
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal Server Error
 */
router.get(
  "/mentorStat/bookings",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(getMentorBookingsValidator),
  BookingController.getMentorStatBookingsController
);

export default router;
