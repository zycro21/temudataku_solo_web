import { Router } from "express";
import * as FeedbackController from "../controllers/feedback.controller";
import {
  createFeedbackSchema,
  updateFeedbackSchema,
  deleteFeedbackSchema,
  getMyFeedbacksSchema,
  getPublicFeedbacksSchema,
  getMentorFeedbacksSchema,
  getAdminFeedbacksSchema,
  patchFeedbackVisibilitySchema,
  exportFeedbackQuerySchema,
  feedbackStatsQuerySchema,
} from "../validations/feedback.validation";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorizeRole";

const router = Router();

router.post(
  "/createFeedbacks",
  authenticate,
  validate(createFeedbackSchema),
  FeedbackController.createFeedbackController
);

router.patch(
  "/feedbacks/:id",
  authenticate,
  validate(updateFeedbackSchema),
  FeedbackController.updateFeedbackController
);

router.delete(
  "/feedbacks/:id",
  authenticate,
  validate(deleteFeedbackSchema),
  FeedbackController.deleteFeedbackController
);

router.get(
  "/my-feedbacks",
  authenticate,
  validate(getMyFeedbacksSchema),
  FeedbackController.getMyFeedbacksController
);

router.get(
  "/public/mentoring-sessions/:id/feedbacks",
  validate(getPublicFeedbacksSchema),
  FeedbackController.getPublicFeedbacksByServiceId
);

router.get(
  "/mentor/feedbacks",
  authenticate, // middleware auth
  authorizeRoles("mentor"), // hanya role mentor
  validate(getMentorFeedbacksSchema),
  FeedbackController.getMentorFeedbacks
);

router.get(
  "/admin/feedbacks",
  authenticate,
  authorizeRoles("admin"),
  validate(getAdminFeedbacksSchema),
  FeedbackController.getAllFeedbacksForAdmin
);

router.patch(
  "/admin/feedbacks/:id/visibility",
  authenticate,
  authorizeRoles("admin"),
  validate(patchFeedbackVisibilitySchema),
  FeedbackController.updateFeedbackVisibility
);

router.get(
  "/admin/feedbacks/export",
  authenticate,
  authorizeRoles("admin"),
  validate(exportFeedbackQuerySchema),
  FeedbackController.exportFeedbacks
);

router.get(
  "/feedbacks/statistics",
  authenticate,
  authorizeRoles("admin"),
  validate(feedbackStatsQuerySchema),
  FeedbackController.getFeedbackStatistics
);

export default router;
