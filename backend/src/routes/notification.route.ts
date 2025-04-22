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

router.post(
  "/createNotif",
  authenticate,
  authorizeRoles("admin"), // hanya admin boleh buat
  validate(createNotificationSchema),
  NotificationController.createNotificationController
);

router.post(
  "/save-fcm-token",
  authenticate,
  NotificationController.saveFcmTokenController
);

router.get(
  "/admin/notifications",
  authenticate,
  authorizeRoles("admin"),
  validate(getAdminNotificationsSchema),
  NotificationController.getAdminNotificationsController
);

router.get(
  "/admin/notifications/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(getNotificationDetailSchema),
  NotificationController.getAdminNotificationDetailController
);

router.get(
  "/admin/notifications/:id/recipients",
  authenticate,
  authorizeRoles("admin"),
  validate(getNotificationRecipientsSchema),
  NotificationController.getNotificationRecipientsController
);

router.post(
  "/admin/notifications/:id/resend",
  authenticate,
  authorizeRoles("admin"),
  validate(resendNotificationSchema),
  NotificationController.resendNotificationController
);

router.get(
  "/admin/exportNotification",
  authenticate,
  authorizeRoles("admin"),
  validate(exportNotificationSchema),
  NotificationController.exportNotifications
);

router.patch(
  "/notifications/:id/read",
  authenticate,
  validate(readNotificationSchema),
  NotificationController.markAsRead
);

router.patch(
  "/notifications/mark-all-read",
  authenticate,
  NotificationController.markAllAsRead
);

router.get(
  "/notificationMe",
  authenticate,
  validate(getAllNotificationsSchema),
  NotificationController.getAll
);

router.get(
  "/unread-notifications",
  authenticate,
  NotificationController.getUnreadCount
);

export default router;
