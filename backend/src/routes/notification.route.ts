import { Router } from "express";
import * as NotificationController from "../controllers/notification.controller";
import {
  createNotificationSchema,
  getAdminNotificationsSchema,
  getNotificationDetailSchema,
  getNotificationRecipientsSchema,
  resendNotificationSchema,
  exportNotificationSchema,
  readNotificationSchema,
  getAllNotificationsSchema,
} from "../validations/notification.validation";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorizeRole";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Notification
 *   description: Manajemen notifikasi sistem
 */

/**
 * @swagger
 * /api/notification/createNotif:
 *   post:
 *     summary: Buat notifikasi baru (admin)
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - title
 *               - deliveryMethod
 *               - targetRole
 *             properties:
 *               type:
 *                 type: string
 *                 example: info
 *               title:
 *                 type: string
 *                 example: Notifikasi Jadwal Baru
 *               message:
 *                 type: string
 *                 example: Jadwal mentoring Anda telah tersedia.
 *               deliveryMethod:
 *                 type: string
 *                 enum: [email, push, both]
 *                 example: email
 *               actionUrl:
 *                 type: string
 *                 example: https://app.temudataku.com/dashboard
 *               targetRole:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [admin, mentee, mentor, affiliator]
 *                 example: [mentor]
 *               meta:
 *                 type: object
 *                 example:
 *                   sessionId: "abc123"
 *                   additionalInfo: "Mentoring dimulai pukul 10.00"
 *     responses:
 *       201:
 *         description: Notifikasi berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Notifikasi berhasil dibuat
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     type:
 *                       type: string
 *                     title:
 *                       type: string
 *                     message:
 *                       type: string
 *                     deliveryMethod:
 *                       type: string
 *                       enum: [email, push, both]
 *                     actionUrl:
 *                       type: string
 *                     sentAt:
 *                       type: string
 *                       format: date-time
 *                     meta:
 *                       type: object
 *                     targetRole:
 *                       type: array
 *                       items:
 *                         type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     recipients:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           notificationId:
 *                             type: string
 *                           userId:
 *                             type: string
 *                           isRead:
 *                             type: boolean
 *                           readAt:
 *                             type: string
 *                             format: date-time
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               email:
 *                                 type: string
 *       400:
 *         description: Bad request (validasi gagal)
 *       403:
 *         description: Hanya admin yang boleh mengakses endpoint ini
 *       500:
 *         description: Internal server error
 */
router.post(
  "/createNotif",
  authenticate,
  authorizeRoles("admin"),
  validate(createNotificationSchema),
  NotificationController.createNotificationController
);

/**
 * @swagger
 * /api/notification/save-fcm-token:
 *   post:
 *     summary: Simpan FCM token untuk user
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fcmToken]
 *             properties:
 *               fcmToken:
 *                 type: string
 *                 example: d1s0m34rtok3n-f1r3b453
 *     responses:
 *       200:
 *         description: FCM token berhasil disimpan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: FCM Token saved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     fcmToken:
 *                       type: string
 *       400:
 *         description: Bad request (missing token atau userId)
 *       500:
 *         description: Internal server error
 */
router.post(
  "/save-fcm-token",
  authenticate,
  NotificationController.saveFcmTokenController
);

/**
 * @swagger
 * /api/notification/admin/notifications:
 *   get:
 *     summary: Ambil daftar notifikasi (admin)
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, example: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, example: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string, example: "pemberitahuan" }
 *       - in: query
 *         name: deliveryMethod
 *         schema:
 *           type: string
 *           enum: [email, push, both]
 *       - in: query
 *         name: targetRole
 *         schema:
 *           type: string
 *           example: mentor
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-07-01
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-07-30
 *     responses:
 *       200:
 *         description: Daftar notifikasi berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Berhasil mengambil daftar notifikasi
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: string }
 *                       type: { type: string }
 *                       title: { type: string }
 *                       message: { type: string, nullable: true }
 *                       deliveryMethod: { type: string, enum: [email, push, both], nullable: true }
 *                       actionUrl: { type: string, nullable: true }
 *                       sentAt: { type: string, format: date-time }
 *                       targetRole:
 *                         type: array
 *                         items: { type: string }
 *                       recipients:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id: { type: string }
 *                             userId: { type: string }
 *                             isRead: { type: boolean }
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page: { type: integer, example: 1 }
 *                     limit: { type: integer, example: 10 }
 *                     total: { type: integer }
 *                     totalPages: { type: integer }
 */
router.get(
  "/admin/notifications",
  authenticate,
  authorizeRoles("admin"),
  validate(getAdminNotificationsSchema),
  NotificationController.getAdminNotificationsController
);

/**
 * @swagger
 * /api/notification/admin/notifications/{id}:
 *   get:
 *     summary: Ambil detail notifikasi (admin)
 *     tags: [Notification]
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
 *         description: Detail notifikasi berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Berhasil mengambil detail notifikasi
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     type:
 *                       type: string
 *                     title:
 *                       type: string
 *                     message:
 *                       type: string
 *                       nullable: true
 *                     deliveryMethod:
 *                       type: string
 *                       enum: [email, push, both]
 *                     actionUrl:
 *                       type: string
 *                       nullable: true
 *                     sentAt:
 *                       type: string
 *                       format: date-time
 *                     meta:
 *                       type: object
 *                       additionalProperties: true
 *                     targetRole:
 *                       type: array
 *                       items:
 *                         type: string
 *                     recipients:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id: { type: string }
 *                           userId: { type: string }
 *                           isRead: { type: boolean }
 *                           readAt:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                           user:
 *                             type: object
 *                             properties:
 *                               id: { type: string }
 *                               fullName: { type: string }
 *                               email: { type: string }
 *                               profilePicture:
 *                                 type: string
 *                                 nullable: true
 *                               userRoles:
 *                                 type: array
 *                                 items:
 *                                   type: object
 *                                   properties:
 *                                     role:
 *                                       type: object
 *                                       properties:
 *                                         roleName: { type: string }
 *       404:
 *         description: Notifikasi tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Notifikasi tidak ditemukan
 */
router.get(
  "/admin/notifications/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(getNotificationDetailSchema),
  NotificationController.getAdminNotificationDetailController
);

/**
 * @swagger
 * /api/notification/admin/notifications/{id}/recipients:
 *   get:
 *     summary: Ambil penerima notifikasi (admin)
 *     tags: [Notification]
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
 *         description: Daftar penerima berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Berhasil mengambil data penerima notifikasi
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: string }
 *                       notificationId: { type: string }
 *                       userId: { type: string }
 *                       isRead: { type: boolean }
 *                       readAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       user:
 *                         type: object
 *                         properties:
 *                           id: { type: string }
 *                           fullName: { type: string }
 *                           email: { type: string }
 *                           profilePicture:
 *                             type: string
 *                             nullable: true
 *                           userRoles:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 role:
 *                                   type: object
 *                                   properties:
 *                                     roleName:
 *                                       type: string
 *       404:
 *         description: Penerima notifikasi tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Penerima notifikasi tidak ditemukan
 */
router.get(
  "/admin/notifications/:id/recipients",
  authenticate,
  authorizeRoles("admin"),
  validate(getNotificationRecipientsSchema),
  NotificationController.getNotificationRecipientsController
);

/**
 * @swagger
 * /api/notification/admin/notifications/{id}/resend:
 *   post:
 *     summary: Kirim ulang notifikasi ke user tertentu (admin)
 *     tags: [Notification]
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
 *             required: [userIds]
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Notifikasi berhasil dikirim ulang
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Notifikasi berhasil dikirim ulang
 *                 data:
 *                   type: object
 *                   properties:
 *                     notificationId:
 *                       type: string
 *                     resentTo:
 *                       type: array
 *                       items:
 *                         type: string
 *       404:
 *         description: Notifikasi atau penerima tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Notifikasi tidak ditemukan
 */
router.post(
  "/admin/notifications/:id/resend",
  authenticate,
  authorizeRoles("admin"),
  validate(resendNotificationSchema),
  NotificationController.resendNotificationController
);

/**
 * @swagger
 * /api/notification/admin/exportNotification:
 *   get:
 *     summary: Export notifikasi (admin)
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         required: true
 *         schema:
 *           type: string
 *           enum: [csv, excel]
 *         description: Format file hasil export
 *     responses:
 *       200:
 *         description: File export notifikasi tersedia
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
 *         description: Format export tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Format tidak valid. Gunakan csv atau excel.
 */
router.get(
  "/admin/exportNotification",
  authenticate,
  authorizeRoles("admin"),
  validate(exportNotificationSchema),
  NotificationController.exportNotifications
);

/**
 * @swagger
 * /api/notification/notifications/{id}/read:
 *   patch:
 *     summary: Tandai notifikasi sebagai terbaca
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID notifikasi yang ingin ditandai terbaca
 *     responses:
 *       200:
 *         description: Notifikasi berhasil ditandai terbaca
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Notification marked as read
 *       404:
 *         description: Notifikasi tidak ditemukan untuk user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Notification not found for this user
 */
router.patch(
  "/notifications/:id/read",
  authenticate,
  validate(readNotificationSchema),
  NotificationController.markAsRead
);

/**
 * @swagger
 * /api/notification/notifications/mark-all-read:
 *   patch:
 *     summary: Tandai semua notifikasi sebagai terbaca
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Semua notifikasi berhasil ditandai terbaca
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All notifications marked as read
 *       400:
 *         description: Tidak ada notifikasi yang belum dibaca
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All notifications already read
 */
router.patch(
  "/notifications/mark-all-read",
  authenticate,
  NotificationController.markAllAsRead
);

/**
 * @swagger
 * /api/notification/notificationMe:
 *   get:
 *     summary: Ambil semua notifikasi user sendiri
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, example: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, example: 10 }
 *       - in: query
 *         name: isRead
 *         schema: { type: boolean, example: false }
 *       - in: query
 *         name: type
 *         schema: { type: string, example: "reminder" }
 *       - in: query
 *         name: search
 *         schema: { type: string, example: "jadwal" }
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, sentAt]
 *           example: sentAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           example: desc
 *     responses:
 *       200:
 *         description: Daftar notifikasi user berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       isRead:
 *                         type: boolean
 *                       readAt:
 *                         type: string
 *                         format: date-time
 *                       notification:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           message:
 *                             type: string
 *                           type:
 *                             type: string
 *                           deliveryMethod:
 *                             type: string
 *                             enum: [email, push, both]
 *                           sentAt:
 *                             type: string
 *                             format: date-time
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
router.get(
  "/notificationMe",
  authenticate,
  validate(getAllNotificationsSchema),
  NotificationController.getAll
);

/**
 * @swagger
 * /api/notification/unread-notifications:
 *   get:
 *     summary: Ambil jumlah notifikasi belum dibaca
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Jumlah notifikasi belum dibaca dikembalikan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 unreadCount:
 *                   type: integer
 *                   example: 5
 */
router.get(
  "/unread-notifications",
  authenticate,
  NotificationController.getUnreadCount
);

export default router;