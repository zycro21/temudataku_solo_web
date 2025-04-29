import { Router } from "express";
import * as ReferralController from "../controllers/referral.controller";
import { createReferralCodeSchema } from "../validations/referral.validation";
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

export default router;
