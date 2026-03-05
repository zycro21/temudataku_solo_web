import { Router } from "express";
import * as ElearningCertificateController from "../controllers/elearning_certificate.controller.js";
import {
  generateCertificateSchema,
  certificateIdParamSchema,
  getMyCertificatesSchema,
  getCertificatesSchema,
  updateCertificateSchema,
  markCertificateViewedSchema,
  regenerateCertificateSchema,
  exportELearningCertificateQuerySchema,
} from "../validations/elearning_certificate.validation.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRole.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: E-Learning Certificate
 *   description: API untuk mengelola Sertifikat E-Learning Mentee
 */

/**
 * @swagger
 * /api/elearningCertificate/courses/{id}/certificate:
 *   post:
 *     summary: Generate sertifikat course (admin manual)
 *     tags: [E-Learning Certificate]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Sertifikat berhasil dibuat
 */
router.post(
  "/courses/:id/certificate",
  authenticate,
  authorizeRoles("admin"),
  validate(generateCertificateSchema),
  ElearningCertificateController.generateCertificateManual
);

/**
 * @swagger
 * /api/elearningCertificate/courses/{id}/certificate/auto:
 *   post:
 *     summary: Generate sertifikat otomatis (progress 100%)
 *     tags: [E-Learning Certificate]
 *     security:
 *       - bearerAuth: []
 */
// router.post(
//   "/courses/:id/certificate/auto",
//   authenticate,
//   authorizeRoles("mentee"),
//   ElearningCertificateController.generateCertificateAuto
// );

/**
 * @swagger
 * /api/elearningCertificate/certificates/me:
 *   get:
 *     summary: List sertifikat saya (mentee)
 *     description: Mengambil semua sertifikat e-learning milik mentee yang sedang login
 *     tags: [E-Learning Certificate]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [issuedAt, createdAt]
 *           example: issuedAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           example: desc
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           example: generated
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: Golang
 *     responses:
 *       200:
 *         description: List sertifikat berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       certificateNumber:
 *                         type: string
 *                       certificateUrl:
 *                         type: string
 *                       issuedAt:
 *                         type: string
 *                         format: date-time
 *                       status:
 *                         type: string
 *                       course:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/certificates/me",
  authenticate,
  authorizeRoles("mentee"),
  validate(getMyCertificatesSchema),
  ElearningCertificateController.getMyCertificates
);

/**
 * @swagger
 * /api/elearningCertificate/certificates/{id}:
 *   get:
 *     summary: Detail sertifikat
 *     description: >
 *       Mengambil detail sertifikat.
 *       - Admin dapat mengakses sertifikat siapa saja
 *       - Mentee hanya dapat mengakses sertifikat miliknya sendiri
 *     tags: [E-Learning Certificate]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Certificate ID
 *     responses:
 *       200:
 *         description: Detail sertifikat
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
 *                     id:
 *                       type: string
 *                     certificateNumber:
 *                       type: string
 *                     certificateUrl:
 *                       type: string
 *                     issuedAt:
 *                       type: string
 *                       format: date-time
 *                     status:
 *                       type: string
 *                       example: generated
 *                     note:
 *                       type: string
 *                       nullable: true
 *                     course:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         title:
 *                           type: string
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Certificate not found
 */
router.get(
  "/certificates/:id",
  authenticate,
  authorizeRoles("mentee", "admin"),
  validate(certificateIdParamSchema),
  ElearningCertificateController.getCertificateDetail
);

/**
 * @swagger
 * /api/elearningCertificate/certificates/{id}:
 *   delete:
 *     summary: Hapus sertifikat
 *     description: >
 *       Menghapus sertifikat e-learning.
 *       Hanya dapat dilakukan oleh admin.
 *       File PDF di server juga akan ikut dihapus.
 *     tags: [E-Learning Certificate]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Certificate ID
 *     responses:
 *       200:
 *         description: Sertifikat berhasil dihapus
 *       404:
 *         description: Sertifikat tidak ditemukan
 *       403:
 *         description: Forbidden
 */
router.delete(
  "/certificates/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(certificateIdParamSchema),
  ElearningCertificateController.deleteCertificate
);

/**
 * @swagger
 * /api/elearningCertificate/certificates:
 *   get:
 *     summary: Global view certificates (Admin)
 *     description: >
 *       Menampilkan seluruh sertifikat e-learning.
 *       Hanya dapat diakses oleh admin.
 *       Mendukung pagination dan sorting.
 *     tags: [E-Learning Certificate]
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
 *           default: 20
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [issuedAt, createdAt, certificateNumber]
 *           default: issuedAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [generated, sent, viewed]
 *     responses:
 *       200:
 *         description: Success
 *       403:
 *         description: Forbidden
 */
router.get(
  "/certificates",
  authenticate,
  authorizeRoles("admin"),
  validate(getCertificatesSchema),
  ElearningCertificateController.getAllCertificates
);

/**
 * @swagger
 * /api/elearningCertificate/certificates/{id}:
 *   patch:
 *     summary: Update certificate (Admin)
 *     description: >
 *       Update data sertifikat e-learning.
 *       Hanya dapat dilakukan oleh admin.
 *       Field yang bisa diubah: status, note.
 *       verifiedBy akan otomatis diisi oleh sistem.
 *     tags: [E-Learning Certificate]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Certificate ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [generated, sent, viewed]
 *                 example: sent
 *               note:
 *                 type: string
 *                 example: Sertifikat telah diverifikasi dan dikirim ke email
 *     responses:
 *       200:
 *         description: Certificate updated successfully
 *       404:
 *         description: Certificate not found
 *       403:
 *         description: Forbidden
 */
router.patch(
  "/certificates/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(updateCertificateSchema),
  ElearningCertificateController.updateCertificate
);

/**
 * @swagger
 * /api/elearningCertificate/{id}/viewed:
 *   patch:
 *     summary: Mark certificate as viewed (Mentee)
 *     description: >
 *       Endpoint untuk menandai sertifikat sebagai **viewed**
 *       ketika mentee membuka atau melihat detail sertifikat.
 *     tags:
 *       - E-Learning Certificates
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Certificate ID
 *     responses:
 *       200:
 *         description: Certificate marked as viewed successfully
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
 *                   example: Certificate marked as viewed
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: viewed
 *       403:
 *         description: Forbidden – not owner of certificate
 *       404:
 *         description: Certificate not found
 */
router.patch(
  "/:id/viewed",
  authenticate,
  authorizeRoles("admin", "mentee"),
  validate(markCertificateViewedSchema),
  ElearningCertificateController.markCertificateAsViewed
);

/**
 * @swagger
 * /api/elearningCertificate/certificates/{id}/regenerate:
 *   post:
 *     summary: Re-generate & re-upload certificate (Admin)
 *     description: >
 *       Generate ulang file PDF sertifikat, upload ulang ke Google Drive,
 *       dan update certificateUrl serta certificatePath.
 *     tags:
 *       - E-Learning Certificate
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Certificate ID
 *     responses:
 *       200:
 *         description: Certificate regenerated successfully
 *       404:
 *         description: Certificate not found
 */
router.post(
  "/certificates/:id/regenerate",
  authenticate,
  authorizeRoles("admin"),
  validate(regenerateCertificateSchema),
  ElearningCertificateController.regenerateCertificate
);

/**
 * @swagger
 * /api/elearningCertificate/admin/elearning/certificates/export:
 *   get:
 *     summary: Export E-Learning Certificates (Admin)
 *     description: >
 *       Endpoint untuk mengekspor data sertifikat e-learning
 *       ke dalam format CSV atau Excel. Hanya dapat diakses oleh admin.
 *     tags:
 *       - E-Learning Certificates
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         required: false
 *         schema:
 *           type: string
 *           enum: [csv, excel]
 *         description: Format file ekspor (csv atau excel)
 *     responses:
 *       200:
 *         description: File export e-learning certificates
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Format file tidak valid
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (bukan admin)
 *       500:
 *         description: Internal server error
 */

router.get(
  "/admin/elearning/certificates/export",
  authenticate,
  authorizeRoles("admin"),
  validate(exportELearningCertificateQuerySchema),
  ElearningCertificateController.exportCertificates
);


export default router;
