import { Router } from "express";
import * as MentoringSessionController from "../controllers/mentoring_session.controller";
import {
  createMentoringSessionSchema,
  getMentoringSessionsSchema,
  getMentoringSessionByIdSchema,
  updateMentoringSessionSchema,
  updateMentoringSessionStatusSchema,
  updateSessionMentorsSchema,
  deleteMentoringSessionSchema,
  paramsIdSchema,
  updateMentorSessionBodySchema,
  publicGetSessionsSchema,
  publicGetSessionByIdSchema,
} from "../validations/mentoring_session.validation";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorizeRole";

const router = Router();

router.post(
  "/admin/mentoring-sessions",
  authenticate,
  authorizeRoles("admin"),
  validate(createMentoringSessionSchema),
  MentoringSessionController.createMentoringSessionController
);

router.get(
  "/admin/mentoring-sessions",
  authenticate,
  authorizeRoles("admin"),
  validate(getMentoringSessionsSchema),
  MentoringSessionController.getMentoringSessionsController
);

router.get(
  "/admin/mentoring-sessions/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(getMentoringSessionByIdSchema),
  MentoringSessionController.getMentoringSessionByIdController
);

router.patch(
  "/admin/mentoring-sessions/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(updateMentoringSessionSchema),
  MentoringSessionController.updateMentoringSessionController
);

router.patch(
  "/admin/mentoring-sessions/:id/status",
  authenticate,
  authorizeRoles("admin"),
  validate(updateMentoringSessionStatusSchema),
  MentoringSessionController.updateStatusController
);

router.patch(
  "/admin/mentoring-sessions/:id/mentors",
  authenticate,
  authorizeRoles("admin"),
  validate(updateSessionMentorsSchema),
  MentoringSessionController.updateSessionMentorsController
);

router.delete(
  "/admin/mentoring-sessions/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(deleteMentoringSessionSchema),
  MentoringSessionController.deleteSessionController
);

router.get(
  "/export/admin/mentoring-sessions",
  authenticate,
  authorizeRoles("admin"),
  MentoringSessionController.exportSessionsController
);

router.get(
  "/mentor/own-mentoring-sessions",
  authenticate,
  authorizeRoles("mentor"),
  MentoringSessionController.getMentorSessionsController
);

router.get(
  "/mentor/mentoring-sessions/:id",
  authenticate,
  authorizeRoles("mentor"),
  validate(paramsIdSchema),
  MentoringSessionController.getMentorSessionDetailController
);

router.patch(
  "/mentor/mentoring-sessions/:id",
  authenticate,
  authorizeRoles("mentor"),
  validate(paramsIdSchema),
  validate(updateMentorSessionBodySchema),
  MentoringSessionController.updateMentorSessionController
);

router.get(
  "/public/mentoring-services/:serviceId/sessions",
  authenticate,
  validate(publicGetSessionsSchema),
  MentoringSessionController.publicMentoringSessionController
);

router.get(
  "/public/mentoring-sessions/:id",
  authenticate,
  validate(publicGetSessionByIdSchema),
  MentoringSessionController.publicGetMentoringSessionByIdController
);

export default router;
