import { Router } from "express";
import * as PaymentController from "../controllers/payment.controller";
import {
  createPaymentSchema,
  getAdminPaymentsSchema,
  getAdminPaymentsDetailSchema,
  getExportPaymentsSchema,
  getMyPaymentsSchema,
  updatePaymentStatusSchema,
  getMyPaymentDetailSchema,
} from "../validations/payment.validation";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorizeRole";
import {
  handleThumbnailUpload,
  handlePracticeFileUpload,
} from "../middlewares/uploadImage";
import { preloadPracticeTitle } from "../middlewares/preloadTitlePractice";

const router = Router();

router.post(
  "/payments/create",
  authenticate,
  validate(createPaymentSchema),
  PaymentController.createPayment
);

router.post("/duitku/callback", PaymentController.handleCallback);

router.get(
  "/payments",
  authenticate,
  authorizeRoles("admin"),
  validate(getAdminPaymentsSchema),
  PaymentController.getAllPayments
);

router.get(
  "/payments/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(getAdminPaymentsDetailSchema),
  PaymentController.getDetailIdPayments
);

router.get(
  "/payments-export",
  authenticate,
  authorizeRoles("admin"),
  validate(getExportPaymentsSchema),
  PaymentController.exportPayments
);

router.get(
  "/my/payments",
  authenticate, // pastikan user login
  validate(getMyPaymentsSchema),
  PaymentController.getMyPayments
);

router.get(
  "/my/payments/:id",
  authenticate, // user harus login
  validate(getMyPaymentDetailSchema),
  PaymentController.getMyPaymentDetail
);

router.patch(
  "/payments-status/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(updatePaymentStatusSchema),
  PaymentController.updatePaymentStatus
);

export default router;
