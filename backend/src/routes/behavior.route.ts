import { Router } from "express";
import * as BehaviorController from "../controllers/behavior.controller";
import {
  createUserBehaviorSchema,
  getAllAdminUserBehaviorsSchema,
  getUserBehaviorByIdSchema,
  deleteUserBehaviorByIdSchema,
  exportUserBehaviorsSchema,
} from "../validations/behavior.validation";
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
  "/user-behaviors",
  authenticate,
  validate(createUserBehaviorSchema),
  BehaviorController.createUserBehaviorController
);

router.get(
  "/admin/user-behaviors",
  authenticate,
  authorizeRoles("admin"),
  validate(getAllAdminUserBehaviorsSchema),
  BehaviorController.getAllAdminUserBehaviorsController
);

router.get(
  "/admin/user-behaviors/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(getUserBehaviorByIdSchema),
  BehaviorController.getUserBehaviorByIdController
);

router.delete(
  "/admin/user-behaviors/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(deleteUserBehaviorByIdSchema),
  BehaviorController.deleteUserBehaviorByIdController
);

router.get(
  "/admin/user-behaviors-export",
  authenticate,
  authorizeRoles("admin"),
  validate(exportUserBehaviorsSchema),
  BehaviorController.exportUserBehaviorsController
);

export default router;
