import { Router } from "express";
import * as MentorController from "../controllers/mentor.controller";
import {
  createMentorProfileSchema,
  updateMentorProfileSchema,
  getMentorProfilesSchema,
  verifyMentorProfileSchema,
  getPublicMentorsSchema,
  getMentorProfileByIdSchema,
  getPublicMentorProfileByIdSchema,
  deleteMentorProfileSchema,
} from "../validations/mentor.validation";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorizeRole";

const router = Router();

router.post(
  "/mentor/profile",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(createMentorProfileSchema),
  MentorController.createMentorProfile
);

router.get(
  "/ownProfile",
  authenticate,
  authorizeRoles("mentor"),
  MentorController.getOwnMentorProfile
);

router.patch(
  "/profile",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(updateMentorProfileSchema),
  MentorController.updateMentorProfile
);

router.get(
  "/admin/mentor-profiles",
  authenticate,
  authorizeRoles("admin"),
  validate(getMentorProfilesSchema),
  MentorController.getAllMentorProfiles
);

router.patch(
  "/admin/mentor-profiles/:id/verify",
  authenticate,
  authorizeRoles("admin"),
  validate(verifyMentorProfileSchema),
  MentorController.verifyMentorProfile
);

router.get(
  "/mentors",
  validate(getPublicMentorsSchema),
  MentorController.getPublicMentors
);

router.get(
  "/admin/mentor-profiles/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(getMentorProfileByIdSchema), // optional, untuk validasi ID
  MentorController.getMentorProfileById
);

router.get(
  "/mentors/:id",
  authenticate,
  validate(getPublicMentorProfileByIdSchema),
  MentorController.getById
);

router.delete(
  "/admin/mentor-profiles/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(deleteMentorProfileSchema),
  MentorController.deleteMentorProfile
);

export default router;
