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

/**
 * @swagger
 * tags:
 *   - name: User
 *     description: Manajemen data pengguna
 */

/**
 * @swagger
 * /api/user/update:
 *   put:
 *     summary: Update profil pengguna (termasuk foto)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "John Doe"
 *               phoneNumber:
 *                 type: string
 *                 example: "+628123456789"
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profil berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Profile updated successfully
 *                 updatedFields:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["fullName", "profilePicture"]
 *                 skippedFields:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["phoneNumber"]
 *       400:
 *         description: Tidak ada perubahan terdeteksi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: No changes detected
 *       401:
 *         description: Tidak terautentikasi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Tidak memiliki izin untuk mengubah data pengguna lain
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Forbidden: You can only update your own profile"
 *       404:
 *         description: Pengguna tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: User not found
 */
router.put(
  "/update",
  authenticate,
  handleUpload("profilePicture"),
  validate(updateUserSchema),
  UserController.updateProfile
);

/**
 * @swagger
 * /api/user/update-roles:
 *   put:
 *     summary: Ubah peran pengguna (admin)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "a1b2c3d4-e5f6-7890-ghij-klmnopqrstuv"
 *               roles_to_add:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["mentor"]
 *               roles_to_remove:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["mentee"]
 *     responses:
 *       200:
 *         description: Peran pengguna berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User roles updated successfully
 *                 addedRoles:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["mentor"]
 *                 removedRoles:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["mentee"]
 *       400:
 *         description: Validasi gagal (misalnya duplikat role atau user tidak ditemukan)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User already has role(s): mentor"
 *       403:
 *         description: Tidak boleh mengubah role milik sendiri
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: You cannot change your own roles
 *       404:
 *         description: Pengguna tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 */
router.put(
  "/update-roles",
  authenticate,
  authorizeRoles("admin"),
  validate(updateUserRolesSchema),
  UserController.updateUserRoles
);

/**
 * @swagger
 * /api/user/{userId}:
 *   delete:
 *     summary: Hapus pengguna (admin)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         example: "user-abc123"
 *     responses:
 *       200:
 *         description: Pengguna berhasil dihapus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User user@gmail.com deleted successfully
 *       401:
 *         description: Unauthorized (token tidak valid atau tidak disertakan)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Tidak boleh menghapus sesama admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: You cannot delete another admin.
 *       404:
 *         description: Pengguna tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 */
router.delete(
  "/:userId",
  authenticate,
  authorizeRoles("admin"),
  validate(deleteUserSchema),
  UserController.deleteUser
);

/**
 * @swagger
 * /api/user/users:
 *   get:
 *     summary: Daftar semua pengguna (admin)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *       - in: query
 *         name: fullName
 *         schema:
 *           type: string
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: province
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: [true, false]
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           example: createdAt
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           example: desc
 *     responses:
 *       200:
 *         description: Daftar pengguna berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     total_pages:
 *                       type: integer
 *                       example: 3
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: user-abc123
 *                           fullName:
 *                             type: string
 *                           email:
 *                             type: string
 *                           city:
 *                             type: string
 *                           province:
 *                             type: string
 *                           isActive:
 *                             type: boolean
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                           userRoles:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 role:
 *                                   type: object
 *                                   properties:
 *                                     id:
 *                                       type: string
 *                                     roleName:
 *                                       type: string
 *                                       example: admin
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/users",
  authenticate,
  authorizeRoles("admin"),
  validate(getAllUsersSchema),
  UserController.getAllUsers
);

/**
 * @swagger
 * /api/user/users/update-status:
 *   patch:
 *     summary: Perbarui status pengguna otomatis (admin)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status pengguna berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User statuses updated successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       description: Jumlah user yang statusnya diperbarui menjadi non-aktif
 *                       example: 12
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.patch(
  "/users/update-status",
  authenticate,
  authorizeRoles("admin"),
  UserController.updateUserStatus
);

/**
 * @swagger
 * /api/user/users/export:
 *   get:
 *     summary: Ekspor data pengguna (admin)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, excel]
 *         description: Format file ekspor
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *       - in: query
 *         name: fullName
 *         schema:
 *           type: string
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: province
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: [true, false]
 *     responses:
 *       200:
 *         description: File ekspor pengguna tersedia
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Permintaan tidak valid
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/users/export",
  authenticate,
  authorizeRoles("admin"),
  validate(exportUsersSchema),
  UserController.exportUsers
);

/**
 * @swagger
 * /api/user/users/{id}:
 *   get:
 *     summary: Detail pengguna berdasarkan ID (admin)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID pengguna
 *     responses:
 *       200:
 *         description: Data pengguna berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     phoneNumber:
 *                       type: string
 *                     profilePicture:
 *                       type: string
 *                     city:
 *                       type: string
 *                     province:
 *                       type: string
 *                     isEmailVerified:
 *                       type: boolean
 *                     registrationDate:
 *                       type: string
 *                       format: date-time
 *                     lastLogin:
 *                       type: string
 *                       format: date-time
 *                     isActive:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     userRoles:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           role:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               roleName:
 *                                 type: string
 *                               description:
 *                                 type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User tidak ditemukan
 */
router.get(
  "/users/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(getUserByIdSchema),
  UserController.getUserById
);

export default router;