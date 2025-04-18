import { Router } from "express";
import * as MentorServiceController from "../controllers/mentor_service.controller";
import {
  createMentoringServiceSchema,
  getAllMentoringServicesSchema,
  getMentoringServiceDetailSchema,
  updateMentoringServiceSchema,
  deleteMentoringServiceSchema,
  exportMentoringServicesSchema,
  getMentoringServiceDetailValidatorSchema,
  PublicMentoringServiceQuery,
  PublicMentoringServiceIdParamSchema,
} from "../validations/mentor_service.validation";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorizeRole";

const router = Router();

router.post(
  "/mentoring-services",
  authenticate,
  authorizeRoles("admin"),
  validate(createMentoringServiceSchema),
  MentorServiceController.createMentoringServiceController
);

router.get(
  "/admin/mentoring-services",
  authenticate,
  authorizeRoles("admin"),
  validate(getAllMentoringServicesSchema),
  MentorServiceController.getAllMentoringServicesController
);

router.get(
  "/admin/mentoring-services/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(getMentoringServiceDetailSchema),
  MentorServiceController.getMentoringServiceDetailController
);

router.patch(
  "/admin/mentoring-services/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(updateMentoringServiceSchema),
  MentorServiceController.updateMentoringServiceController
);

router.delete(
  "/admin/mentoring-services/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(deleteMentoringServiceSchema),
  MentorServiceController.deleteMentoringServiceController
);

router.get(
  "/mentoring-services/export",
  authenticate,
  authorizeRoles("admin"),
  validate(exportMentoringServicesSchema),
  MentorServiceController.exportMentoringServicesController
);

router.get(
  "/mentor/mentoring-services",
  authenticate,
  authorizeRoles("mentor"),
  MentorServiceController.getMentoringServicesByMentorController
);

router.get(
  "/mentor/mentoring-services/:id",
  authenticate,
  authorizeRoles("mentor"),
  validate(getMentoringServiceDetailValidatorSchema),
  MentorServiceController.getMentoringServiceDetailForMentorController
);

router.get(
  "/public-mentoring-services",
  validate(PublicMentoringServiceQuery),
  MentorServiceController.getPublicMentoringServicesController
);

router.get(
  "/public-mentoring-services/:id",
  validate(PublicMentoringServiceIdParamSchema),
  MentorServiceController.getPublicMentoringServiceDetailController
);

export default router;
