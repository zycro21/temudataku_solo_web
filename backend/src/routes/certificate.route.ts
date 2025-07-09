import { Router } from "express";
import * as CertificateController from "../controllers/certificate.controller";
import {
  generateCertificateSchema,
  getAllCertificatesSchema,
  updateCertificateSchema,
  getMenteeCertificatesSchema,
  getCertificateDetailSchema,
  downloadCertificateSchema,
  exportCertificateSchema,
} from "../validations/certificate.validation";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorizeRole";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Certificate
 *   description: Manajemen sertifikat pengguna
 */

/**
 * @swagger
 * /api/certificate/admin/certificates/generate:
 *   post:
 *     summary: Generate sertifikat baru (admin)
 *     tags: [Certificate]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - menteeId
 *               - serviceId
 *             properties:
 *               menteeId:
 *                 type: string
 *                 example: "mentee-12345"
 *               serviceId:
 *                 type: string
 *                 example: "service-abcde"
 *     responses:
 *       201:
 *         description: Sertifikat berhasil di-generate
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
 *                   example: Certificate generated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "certificate-uuid"
 *                     certificateNumber:
 *                       type: string
 *                       example: "CERT-1721450000000-ABCDE"
 *                     certificatePath:
 *                       type: string
 *                       example: "/certificates/CERT-1721450000000-ABCDE-mentee-12345.pdf"
 *                     googleDriveUrl:
 *                       type: string
 *                       format: uri
 *                       example: "https://drive.google.com/file/d/abc123/view"
 *                     issueDate:
 *                       type: string
 *                       format: date
 *                       example: "2025-07-01"
 *                     status:
 *                       type: string
 *                       enum: [generated]
 *                       example: "generated"
 *                     user:
 *                       type: object
 *                       properties:
 *                         fullName:
 *                           type: string
 *                           example: "John Doe"
 *                         email:
 *                           type: string
 *                           format: email
 *                           example: "johndoe@gmail.com"
 *                     mentoringService:
 *                       type: object
 *                       properties:
 *                         serviceName:
 *                           type: string
 *                           example: "Web Development Bootcamp"
 *       400:
 *         description: Permintaan tidak valid atau sertifikat sudah ada
 *         content:
 *           application/json:
 *             example:
 *               message: Certificate already exists for this mentee and service
 *       404:
 *         description: Mentee atau service tidak ditemukan / belum pernah ikut
 *         content:
 *           application/json:
 *             example:
 *               message: Mentee has not participated in this service
 */
router.post(
  "/admin/certificates/generate",
  authenticate,
  authorizeRoles("admin"),
  validate(generateCertificateSchema),
  CertificateController.generateCertificate
);

/**
 * @swagger
 * /api/certificate/admin/certificates:
 *   get:
 *     summary: Ambil semua sertifikat (admin)
 *     tags: [Certificate]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         required: true
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: "john"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           example: "generated"
 *       - in: query
 *         name: serviceId
 *         schema:
 *           type: string
 *           example: "service-123"
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-07-01"
 *     responses:
 *       200:
 *         description: Daftar sertifikat berhasil diambil
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
 *                   example: Certificates fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 100
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 10
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "cert-uuid"
 *                           certificateNumber:
 *                             type: string
 *                             example: "CERT-1721450000000-ABCDE"
 *                           status:
 *                             type: string
 *                             example: "generated"
 *                           certificatePath:
 *                             type: string
 *                             example: "/certificates/CERT-xxx.pdf"
 *                           googleDriveUrl:
 *                             type: string
 *                             format: uri
 *                             example: "https://drive.google.com/file/d/abc123/view"
 *                           issueDate:
 *                             type: string
 *                             format: date
 *                             example: "2025-07-01"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-07-01T10:00:00Z"
 *                           user:
 *                             type: object
 *                             properties:
 *                               fullName:
 *                                 type: string
 *                                 example: "John Doe"
 *                               email:
 *                                 type: string
 *                                 format: email
 *                                 example: "johndo@abstracgmail.com"
 *                           mentoringService:
 *                             type: object
 *                             properties:
 *                               serviceName:
 *                                 type: string
 *                                 example: "UI/UX Design Bootcamp"
 */
router.get(
  "/admin/certificates",
  authenticate,
  authorizeRoles("admin"),
  validate(getAllCertificatesSchema),
  CertificateController.getAllCertificates
);

/**
 * @swagger
 * /api/certificate/admin/certificates/{id}:
 *   patch:
 *     summary: Update data sertifikat (admin)
 *     tags: [Certificate]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "cert-uuid-123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: "verified"
 *               verifiedBy:
 *                 type: string
 *                 example: "admin-user-id"
 *               note:
 *                 type: string
 *                 example: "Sertifikat telah dicek dan valid."
 *     responses:
 *       200:
 *         description: Sertifikat berhasil diupdate
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
 *                   example: Certificate updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "cert-uuid-123"
 *                     certificateNumber:
 *                       type: string
 *                       example: "CERT-1720000000000-X7YAQ"
 *                     status:
 *                       type: string
 *                       example: "verified"
 *                     note:
 *                       type: string
 *                       example: "Sertifikat telah dicek dan valid."
 *                     verifiedBy:
 *                       type: string
 *                       example: "admin-user-id"
 *                     certificatePath:
 *                       type: string
 *                       example: "/certificates/CERT-1720XXXXXXX.pdf"
 *                     googleDriveUrl:
 *                       type: string
 *                       format: uri
 *                       example: "https://drive.google.com/file/d/abc123/view"
 *                     issueDate:
 *                       type: string
 *                       format: date
 *                       example: "2025-07-01"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-07-01T10:00:00Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-07-01T12:00:00Z"
 *       400:
 *         description: Request tidak valid (misalnya, user verifiedBy bukan admin)
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
 *                   example: VerifiedBy user must have admin role
 *       401:
 *         description: Tidak terautentikasi (Bearer token tidak valid / tidak ada)
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
 *         description: Tidak memiliki izin (bukan admin)
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
 *                   example: Forbidden. Admin only.
 *       404:
 *         description: Sertifikat tidak ditemukan
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
 *                   example: Certificate not found
 *       500:
 *         description: Kesalahan server internal
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
 *                   example: Internal server error
 */
router.patch(
  "/admin/certificates/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(updateCertificateSchema),
  CertificateController.updateCertificate
);

/**
 * @swagger
 * /api/certificate/certificates:
 *   get:
 *     summary: Ambil sertifikat milik mentee
 *     tags: [Certificate]
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
 *         name: status
 *         schema:
 *           type: string
 *           example: "verified"
 *       - in: query
 *         name: serviceId
 *         schema:
 *           type: string
 *           example: "service-uuid-123"
 *     responses:
 *       200:
 *         description: Sertifikat mentee berhasil diambil
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
 *                   example: Mentee certificates retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 3
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 1
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "cert-uuid-123"
 *                           certificateNumber:
 *                             type: string
 *                             example: "CERT-1720000000000-X7YAQ"
 *                           certificatePath:
 *                             type: string
 *                             example: "/certificates/CERT-1720XXXXXXX.pdf"
 *                           googleDriveUrl:
 *                             type: string
 *                             example: "https://drive.google.com/file/d/abc123/view"
 *                           issueDate:
 *                             type: string
 *                             format: date
 *                             example: "2025-07-01"
 *                           status:
 *                             type: string
 *                             example: "verified"
 *                           note:
 *                             type: string
 *                             nullable: true
 *                             example: "Sertifikat telah dicek dan valid"
 *                           mentoringService:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "service-uuid-123"
 *                               serviceName:
 *                                 type: string
 *                                 example: "Fullstack Web Development Bootcamp"
 *       401:
 *         description: Tidak terautentikasi (Bearer token tidak valid atau tidak ada)
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
 *         description: Tidak memiliki izin (bukan mentee)
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
 *                   example: Forbidden. Mentee only.
 *       500:
 *         description: Kesalahan server internal
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
 *                   example: Internal server error
 */
router.get(
  "/certificates",
  authenticate,
  authorizeRoles("mentee"),
  validate(getMenteeCertificatesSchema),
  CertificateController.getMenteeCertificatesController
);

/**
 * @swagger
 * /api/certificate/mentees/certificates/{id}:
 *   get:
 *     summary: Ambil detail sertifikat
 *     tags: [Certificate]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "cert-uuid-123"
 *     responses:
 *       200:
 *         description: Detail sertifikat berhasil diambil
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
 *                   example: Certificate details retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "cert-uuid-123"
 *                     certificateNumber:
 *                       type: string
 *                       example: "CERT-1720000000000-X7YAQ"
 *                     issueDate:
 *                       type: string
 *                       format: date
 *                       example: "2025-07-01"
 *                     status:
 *                       type: string
 *                       example: "generated"
 *                     verifiedBy:
 *                       type: string
 *                       nullable: true
 *                       example: "admin-uuid-123"
 *                     note:
 *                       type: string
 *                       nullable: true
 *                       example: "Sudah diverifikasi oleh admin"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-07-01T10:00:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-07-01T10:05:00.000Z"
 *                     mentee:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "mentee-uuid-123"
 *                         fullName:
 *                           type: string
 *                           example: "Budi Setiawan"
 *                         email:
 *                           type: string
 *                           example: "budi@example.com"
 *                     mentoringService:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "service-uuid-123"
 *                         serviceName:
 *                           type: string
 *                           example: "Bootcamp Fullstack Web"
 *                     downloadLinks:
 *                       type: object
 *                       properties:
 *                         certificate:
 *                           type: string
 *                           nullable: true
 *                           example: "http://localhost:5001/certificates/CERT-abc.pdf"
 *                         googleDrive:
 *                           type: string
 *                           nullable: true
 *                           example: "https://drive.google.com/file/d/xyz/view"
 *                         projectCertificate:
 *                           type: string
 *                           nullable: true
 *                           example: null
 *       401:
 *         description: Tidak terautentikasi (token tidak valid atau tidak dikirim)
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
 *         description: Tidak memiliki akses ke sertifikat (bukan admin & bukan pemilik)
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
 *                   example: "Unauthorized: You can only access your own certificates"
 *       404:
 *         description: Sertifikat tidak ditemukan atau tidak bisa diakses
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
 *                   example: Certificate not found
 *       500:
 *         description: Kesalahan server saat mengambil data sertifikat
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
 *                   example: Internal server error
 */
router.get(
  "/mentees/certificates/:id",
  authenticate,
  authorizeRoles("mentee", "admin"),
  validate(getCertificateDetailSchema),
  CertificateController.getCertificateDetailController
);

/**
 * @swagger
 * /api/certificate/certificatesDownload/{id}:
 *   get:
 *     summary: Download file sertifikat
 *     tags: [Certificate]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "cert-uuid-123"
 *     responses:
 *       200:
 *         description: File sertifikat berhasil didownload
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Tidak terautentikasi (token tidak valid atau tidak dikirim)
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
 *         description: Akses ditolak (bukan pemilik sertifikat dan bukan admin)
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
 *                   example: You do not have access to this certificate
 *       404:
 *         description: Sertifikat tidak ditemukan atau file tidak ada di server
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
 *                   example: Certificate file not found on server
 *       500:
 *         description: Kesalahan server saat proses download sertifikat
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
 *                   example: Internal server error
 */
router.get(
  "/certificatesDownload/:id",
  authenticate,
  authorizeRoles("mentee", "admin"),
  validate(downloadCertificateSchema),
  CertificateController.downloadCertificateController
);

/**
 * @swagger
 * /api/certificate/certificatesExport:
 *   get:
 *     summary: Export data sertifikat (admin)
 *     tags: [Certificate]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         required: true
 *         schema:
 *           type: string
 *           enum: [csv, excel]
 *           example: excel
 *     responses:
 *       200:
 *         description: File hasil export sertifikat
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Format tidak valid atau parameter kurang
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
 *                   example: Invalid export format
 *       401:
 *         description: Tidak terautentikasi (token tidak dikirim/valid)
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
 *         description: Akses ditolak (bukan admin)
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
 *                   example: "Forbidden: Admin access only"
 *       500:
 *         description: Gagal mengekspor data karena kesalahan server
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
 *                   example: Failed to generate export file
 */
router.get(
  "/certificatesExport",
  authenticate,
  authorizeRoles("admin"),
  validate(exportCertificateSchema),
  CertificateController.exportCertificatesController
);

export default router;
