import { Router } from "express";
import * as ReferralController from "../controllers/referral.controller";
import {
  createReferralCodeSchema,
  getReferralCodesSchema,
  getReferralCodeByIdSchema,
  updateReferralCodeSchema,
  useReferralCodeSchema,
  getReferralCommissionsSchema,
  getAffiliatorReferralCodesSchema,
  getReferralUsagesSchema,
  getReferralCommissionsByCodeSchema,
  requestCommissionPaymentSchema,
  validateCommissionPaymentsSchema,
  AllCommissionPaymentsSchema,
  validateUpdateCommissionPaymentStatusSchema,
  exportCommissionPaymentsSchema,
} from "../validations/referral.validation";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorizeRole";
import {
  handleThumbnailUpload,
  handlePracticeFileUpload,
} from "../middlewares/uploadImage";
import { preloadPracticeTitle } from "../middlewares/preloadTitlePractice";

const router = Router();

// Referral Code
router.post(
  "/admin/referral-codes",
  authenticate,
  authorizeRoles("admin"),
  validate(createReferralCodeSchema),
  ReferralController.createReferralCodeController
);

router.get(
  "/admin/referral-codes",
  authenticate,
  authorizeRoles("admin"),
  validate(getReferralCodesSchema),
  ReferralController.getReferralCodesController
);

router.get(
  "/admin/referral-codes/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(getReferralCodeByIdSchema),
  ReferralController.getReferralCodeByIdController
);

router.patch(
  "/admin/referral-codes/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(updateReferralCodeSchema),
  ReferralController.updateReferralCodeController
);

router.delete(
  "/admin/referral-codes/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(getReferralCodeByIdSchema),
  ReferralController.deleteReferralCodeController
);

router.post(
  "/referral/use",
  authenticate,
  validate(useReferralCodeSchema),
  ReferralController.useReferralCodeController
);

router.get(
  "/referral-commissions",
  authenticate,
  authorizeRoles("admin"),
  validate(getReferralCommissionsSchema),
  ReferralController.getReferralCommissionsController
);

router.get(
  "/affiliator/referral-codes",
  authenticate,
  authorizeRoles("affiliator"),
  validate(getAffiliatorReferralCodesSchema),
  ReferralController.getAffiliatorReferralCodesController
);

router.get(
  "/affiliator/referral-codes-usages/:id",
  authenticate,
  authorizeRoles("affiliator"),
  validate(getReferralUsagesSchema),
  ReferralController.getReferralUsagesController
);

router.get(
  "/affiliator/referral-codes-commissions/:id",
  authenticate,
  authorizeRoles("affiliator"),
  validate(getReferralCommissionsByCodeSchema),
  ReferralController.getReferralCommissionsByCodeController
);

router.post(
  "/affiliator/commission-payments/request",
  authenticate,
  authorizeRoles("affiliator"),
  validate(requestCommissionPaymentSchema),
  ReferralController.requestCommissionPaymentController
);

router.get(
  "/affiliator/commission-payments",
  authenticate,
  authorizeRoles("affiliator"),
  validate(validateCommissionPaymentsSchema),
  ReferralController.getCommissionPaymentsController
);

router.get(
  "/admin/commission-payments",
  authenticate,
  authorizeRoles("admin"),
  validate(AllCommissionPaymentsSchema),
  ReferralController.getAllCommissionPaymentsController
);

router.patch(
  "/admin/commission-payments-pay/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(validateUpdateCommissionPaymentStatusSchema),
  ReferralController.updateCommissionPaymentStatusController
);

router.get(
  "/admin/commission-payments-export",
  authenticate,
  authorizeRoles("admin"),
  validate(exportCommissionPaymentsSchema),
  ReferralController.exportCommissionPaymentsController
);

export default router;
