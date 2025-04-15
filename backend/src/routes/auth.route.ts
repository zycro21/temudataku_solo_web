import { Router } from "express";
import * as AuthController from "../controllers/auth.controller";
import { validate } from "../middlewares/validate";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "../validations/auth.validation";
import { handleUpload } from "../middlewares/uploadImage";
import { authenticate } from "../middlewares/authenticate";

const router = Router();

router.post(
  "/register",
  handleUpload("profilePicture"),
  validate(registerSchema),
  AuthController.register
);
router.get("/verify", AuthController.verifyAccount);
router.post("/resend-verification", AuthController.resendVerification);
router.post("/login", validate(loginSchema), AuthController.login);
router.post("/refresh-token", AuthController.refreshToken);
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  AuthController.forgotPassword
);
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  AuthController.resetPassword
);

router.get("/me", authenticate, AuthController.getCurrentUser);
router.post(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  AuthController.changePassword
);


export default router;
