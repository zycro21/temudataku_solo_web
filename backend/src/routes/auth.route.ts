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

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autentikasi dan Manajemen akun
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register user baru
 *     tags: [Auth]
 *     security: []  # Tidak butuh token
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - fullName
 *             properties:
 *               email:
 *                 type: string
 *                 example: makalah@gmail.com
 *               password:
 *                 type: string
 *                 example: dimas21032004
 *               fullName:
 *                 type: string
 *                 example: Makalah Bab V
 *               phoneNumber:
 *                 type: string
 *                 example: "081234567890"
 *               role:
 *                 type: string
 *                 example: admin
 *               city:
 *                 type: string
 *                 example: Jakarta
 *               province:
 *                 type: string
 *                 example: DKI Jakarta
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: User berhasil register
 *         content:
 *           application/json:
 *             example:
 *               message: User registered successfully. Please verify your email.
 *               user:
 *                 id: "000123"
 *                 email: makalah@gmail.com
 *                 full_name: Makalah Bab V
 *                 role: admin
 *                 profile_picture: admin-PP-000123.jpg
 *               verification_token: 9fc3ab1a76b44d9c89f15f3cde3d91d5
 *       400:
 *         description: Bad Request (misalnya format field salah)
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Invalid input data
 *       409:
 *         description: Email sudah terdaftar
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Email is already registered
 */
router.post(
  "/register",
  handleUpload("profilePicture"),
  validate(registerSchema),
  AuthController.register
);

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: Verifikasi akun via token email
 *     tags: [Auth]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         example: 9fc3ab1a76b44d9c89f15f3cde3d91d5
 *     responses:
 *       200:
 *         description: Berhasil verifikasi
 *         content:
 *           application/json:
 *             example:
 *               message: Account verified successfully
 *       400:
 *         description: Token invalid atau expired
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Invalid or expired token
 */
router.get("/verify", AuthController.verifyAccount);

/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     summary: Kirim ulang email verifikasi
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: makalah@gmail.com
 *     responses:
 *       200:
 *         description: Verifikasi dikirim ulang
 *         content:
 *           application/json:
 *             example:
 *               message: Verification email resent successfully
 *       400:
 *         description: Email sudah terverifikasi
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Email is already verified
 *       404:
 *         description: User tidak ditemukan
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: User not found
 */
router.post("/resend-verification", AuthController.resendVerification);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: makalah@gmail.com
 *               password:
 *                 type: string
 *                 example: dollol37004.
 *     responses:
 *       200:
 *         description: Login berhasil
 *         content:
 *           application/json:
 *             example:
 *               message: Login successful
 *               user:
 *                 id: "000123"
 *                 email: makalah@gmail.com
 *                 phoneNumber: "081234567890"
 *                 full_name: Makalah Bab V
 *                 profile_picture: admin-PP-000123.jpg
 *                 roles:
 *                   - role_id: "role-1"
 *                     role_name: admin
 *                 mentorProfileId: "mentor-456"
 *               token: eyJhbGciOiJIUzI1NiIsInR5cCI6...
 *       401:
 *         description: Password salah
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Invalid credentials
 *       403:
 *         description: Email belum diverifikasi
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Please verify your email before logging in
 *       404:
 *         description: User tidak ditemukan
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: User not found
 */
router.post("/login", validate(loginSchema), AuthController.login);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh access token menggunakan refresh token
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       200:
 *         description: Token diperbarui
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Access token refreshed
 *               token: eyJhbGciOiJIUzI1NiIsInR5cCI6...
 *       401:
 *         description: Tidak ada refresh token di cookie
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: No refresh token provided
 */
router.post("/refresh-token", AuthController.refreshToken);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Kirim link reset password ke email
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@gmail.com
 *     responses:
 *       200:
 *         description: Link dikirim ke email
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Password reset link has been sent to your email
 *       404:
 *         description: Email tidak ditemukan
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Email not found
 */
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  AuthController.forgotPassword
);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password via token
 *     tags: [Auth]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 example: newSecurePassword123
 *     responses:
 *       200:
 *         description: Password berhasil direset
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Password has been reset successfully
 *       400:
 *         description: Invalid token atau password tidak valid
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Invalid or expired reset token
 *       404:
 *         description: User tidak ditemukan
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: User not found
 */
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  AuthController.resetPassword
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Ambil data user saat ini
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Info user berhasil diambil
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: "000001"
 *                 email: "user@gmail.com"
 *                 fullName: "User Example"
 *                 phoneNumber: "08123456789"
 *                 profilePicture: "mentee-PP-000001.jpg"
 *                 city: "Bandung"
 *                 province: "Jawa Barat"
 *                 isEmailVerified: true
 *                 registrationDate: "2024-01-01T00:00:00.000Z"
 *                 lastLogin: "2025-07-01T08:00:00.000Z"
 *                 isActive: true
 *                 createdAt: "2024-01-01T00:00:00.000Z"
 *                 updatedAt: "2025-06-30T20:00:00.000Z"
 *                 userRoles:
 *                   - role:
 *                       id: "role-123"
 *                       roleName: "mentee"
 *                       description: "User sebagai mentee"
 *       404:
 *         description: User tidak ditemukan
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: User not found
 */

router.get("/me", authenticate, AuthController.getCurrentUser);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Ganti password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *           example:
 *             oldPassword: dimasLama123
 *             newPassword: dimasBaru123
 *     responses:
 *       200:
 *         description: Password berhasil diganti
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Password changed successfully
 *       400:
 *         description: Password lama salah atau password baru sama dengan yang lama
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Old password is incorrect
 *       404:
 *         description: User tidak ditemukan
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: User not found
 */
router.post(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  AuthController.changePassword
);

export default router;