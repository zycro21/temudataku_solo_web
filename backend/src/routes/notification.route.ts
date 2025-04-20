import { Router } from "express";
import * as NotificationController from "../controllers/notification.controller";
import {} from "../validations/notification.validation";
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

export default router;
