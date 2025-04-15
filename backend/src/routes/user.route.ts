import { Router } from "express";
import * as UserController from "../controllers/user.controller";
import {
  updateUserSchema,
  updateUserRolesSchema,
  deleteUserSchema,
  getAllUsersSchema,
  exportUsersSchema,
  getUserByIdSchema,
} from "../validations/user.validation";
import { validate } from "../middlewares/validate";
import { handleUpload } from "../middlewares/uploadImage";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorizeRole";

const router = Router();

router.put(
  "/update",
  authenticate,
  handleUpload("profilePicture"),
  validate(updateUserSchema),
  UserController.updateProfile
);

router.put(
  "/update-roles",
  authenticate,
  authorizeRoles("admin"),
  validate(updateUserRolesSchema),
  UserController.updateUserRoles
);

router.delete(
  "/:userId",
  authenticate,
  authorizeRoles("admin"),
  validate(deleteUserSchema),
  UserController.deleteUser
);

router.get(
  "/users",
  authenticate,
  authorizeRoles("admin"),
  validate(getAllUsersSchema),
  UserController.getAllUsers
);

router.patch(
  "/users/update-status",
  authenticate,
  authorizeRoles("admin"), // Hanya admin yang bisa mengubah status
  UserController.updateUserStatus
);

router.get(
  "/users/export",
  authenticate,
  authorizeRoles("admin"),
  validate(exportUsersSchema),
  UserController.exportUsers
);

router.get(
  "/users/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(getUserByIdSchema),
  UserController.getUserById
);

export default router;
