import { Router } from "express";
import * as ProjectController from "../controllers/project.controller";
import {
  createProjectSchema,
  updateProjectSchema,
  deleteProjectSchema,
  getAllProjectsSchema,
  getProjectDetailSchema,
  getMentorProjectListSchema,
  getMentorProjectDetailSchema,
  getMenteeProjectListSchema,
  getMenteeProjectDetailSchema,
  exportProjectSchema,
  submitProjectSchema,
  reviewSubmissionSchema,
  getAdminSubmissionListSchema,
  getAdminSubmissionDetailSchema,
  exportSubmissionSchema,
  getMentorProjectSubmissionListSchema,
  getMentorSubmissionDetailSchema,
  getMenteeSubmissionsSchema,
  getMenteeSubmissionDetailSchema,
} from "../validations/project.validation";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorizeRole";
import { handleSubmissionUpload } from "../middlewares/uploadImage";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Project
 *   description: Manajemen proyek dan submission
 */

/**
 * @swagger
 * /api/project/admin/projects:
 *   post:
 *     summary: Buat proyek baru (admin/mentor)
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [serviceId, title, description]
 *             properties:
 *               serviceId:
 *                 type: string
 *                 example: svc_abc123
 *               title:
 *                 type: string
 *                 example: Projek Pembuatan Web App
 *               description:
 *                 type: string
 *                 example: Projek ini bertujuan untuk membuat aplikasi web modern menggunakan React dan Node.js
 *     responses:
 *       201:
 *         description: Proyek berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Project berhasil dibuat
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: Project-general-20250701-123456
 *                     serviceId:
 *                       type: string
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *       400:
 *         description: Body request tidak valid atau data tidak lengkap
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
 *                   example: Validasi gagal, pastikan data yang dikirim lengkap dan benar.
 *       401:
 *         description: Tidak ada token / token tidak valid
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
 *                   example: Unauthorized.
 *       403:
 *         description: Pengguna bukan admin atau bukan mentor yang terdaftar di service
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
 *                   example: Anda tidak memiliki akses untuk membuat project di service ini
 *       404:
 *         description: Mentoring service tidak ditemukan
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
 *                   example: Mentoring service tidak ditemukan
 *       500:
 *         description: Error internal dari server saat membuat project
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
 *                   example: Terjadi kesalahan pada server.
 */
router.post(
  "/admin/projects",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(createProjectSchema),
  ProjectController.createProjectHandler
);

/**
 * @swagger
 * /api/project/admin/projects/{id}:
 *   put:
 *     summary: Update proyek (admin/mentor)
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: Project-general-20250701-123456
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Judul Proyek Baru
 *               description:
 *                 type: string
 *                 example: Deskripsi proyek yang diperbarui
 *     responses:
 *       200:
 *         description: Project berhasil diperbarui atau tidak ada perubahan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Project berhasil diperbarui
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: Project-general-20250701-123456
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *       400:
 *         description: Validasi input gagal (contohnya field kosong)
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
 *                   example: Validasi gagal
 *       401:
 *         description: Tidak ada token atau token tidak valid
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
 *                   example: Unauthorized.
 *       403:
 *         description: User bukan admin atau bukan mentor dari project tersebut
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
 *                   example: Anda tidak memiliki akses untuk memperbarui project ini
 *       404:
 *         description: Project tidak ditemukan
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
 *                   example: Project tidak ditemukan
 *       500:
 *         description: Error internal dari server saat update project
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
 *                   example: Terjadi kesalahan pada server.
 */
router.put(
  "/admin/projects/:id",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(updateProjectSchema),
  ProjectController.updateProjectHandler
);

/**
 * @swagger
 * /api/project/admin/projects/{id}:
 *   delete:
 *     summary: Hapus proyek (admin)
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID dari proyek yang akan dihapus
 *         schema:
 *           type: string
 *           example: Project-general-20250701-123456
 *     responses:
 *       200:
 *         description: Project berhasil dihapus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Project berhasil dihapus
 *       400:
 *         description: Validasi gagal (misal ID tidak sesuai skema)
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
 *                   example: Validasi gagal
 *       401:
 *         description: Tidak ada token atau token tidak valid
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
 *                   example: Unauthorized.
 *       403:
 *         description: User bukan admin
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
 *                   example: Forbidden. Access denied.
 *       404:
 *         description: Project tidak ditemukan
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
 *                   example: Project tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan di server saat menghapus project
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
 *                   example: Terjadi kesalahan pada server.
 */
router.delete(
  "/admin/projects/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(deleteProjectSchema),
  ProjectController.deleteProjectHandler
);

/**
 * @swagger
 * /api/project/admin/projects:
 *   get:
 *     summary: Ambil semua proyek (admin)
 *     tags: [Project]
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
 *         name: search
 *         schema:
 *           type: string
 *           example: proyek marketing
 *       - in: query
 *         name: serviceId
 *         schema:
 *           type: string
 *           example: 123abc
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           example: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           example: desc
 *     responses:
 *       200:
 *         description: Daftar proyek berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Daftar proyek berhasil diambil
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 35
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 4
 *                     projects:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: Project-general-20250701-123456
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                           serviceId:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                           mentoringService:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *       400:
 *         description: Query parameter tidak valid
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
 *                   example: Validasi query gagal
 *       401:
 *         description: Tidak ada token / token tidak valid
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
 *                   example: Unauthorized.
 *       403:
 *         description: Akses ditolak. Hanya admin yang bisa mengakses endpoint ini
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
 *       500:
 *         description: Terjadi kesalahan di server saat mengambil proyek
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
 *                   example: Terjadi kesalahan pada server.
 */
router.get(
  "/admin/projects",
  authenticate,
  authorizeRoles("admin"),
  validate(getAllProjectsSchema),
  ProjectController.getAllProjectsHandler
);

/**
 * @swagger
 * /api/project/admin/projects/{id}:
 *   get:
 *     summary: Detail proyek (admin)
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: Project-general-20250701-123456
 *     responses:
 *       200:
 *         description: Detail proyek berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Detail proyek berhasil diambil
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: Project-general-20250701-123456
 *                     title:
 *                       type: string
 *                       example: Proyek Pemasaran Digital
 *                     description:
 *                       type: string
 *                       example: Buat strategi pemasaran konten untuk UMKM
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     serviceId:
 *                       type: string
 *                     mentoringService:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                     submissions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           fileUrl:
 *                             type: string
 *                           score:
 *                             type: number
 *                           feedback:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               fullName:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                               profilePicture:
 *                                 type: string
 *                           gradedByUser:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               id:
 *                                 type: string
 *                               fullName:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                           session:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               id:
 *                                 type: string
 *                               date:
 *                                 type: string
 *                                 format: date-time
 *       400:
 *         description: Validasi parameter path gagal
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
 *                   example: ID tidak valid
 *       401:
 *         description: Token tidak ditemukan atau tidak valid
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
 *                   example: Forbidden. Admin only.
 *       404:
 *         description: Project tidak ditemukan
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
 *                   example: Project tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan pada server
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
 *                   example: Terjadi kesalahan pada server.
 */
router.get(
  "/admin/projects/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(getProjectDetailSchema),
  ProjectController.getProjectDetailHandler
);

/**
 * @swagger
 * /api/project/mentor/projects:
 *   get:
 *     summary: Daftar proyek mentor (mentor)
 *     tags: [Project]
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
 *     responses:
 *       200:
 *         description: Daftar proyek mentor berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Daftar proyek berhasil diambil
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: Project-digital-20250701-123456
 *                       title:
 *                         type: string
 *                         example: Proyek UI/UX
 *                       description:
 *                         type: string
 *                         example: Rancang ulang tampilan dashboard
 *                       serviceId:
 *                         type: string
 *                       mentoringService:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 35
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 4
 *       401:
 *         description: Tidak ada token atau token tidak valid
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
 *         description: Akses ditolak (bukan mentor)
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
 *                   example: Forbidden. Mentor only.
 *       404:
 *         description: Mentor belum punya project atau tidak terhubung ke layanan
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
 *                   example: Belum ada proyek di layanan service mentoring Anda
 *       500:
 *         description: Terjadi kesalahan internal
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
 *                   example: Terjadi kesalahan pada server.
 */
router.get(
  "/mentor/projects",
  authenticate,
  authorizeRoles("mentor"),
  validate(getMentorProjectListSchema),
  ProjectController.getMentorProjectService
);

/**
 * @swagger
 * /api/project/mentor/projects/{id}:
 *   get:
 *     summary: Detail proyek mentor
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: Project-uiux-20250701-123456
 *     responses:
 *       200:
 *         description: Detail proyek mentor berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Detail proyek berhasil diambil
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     serviceId:
 *                       type: string
 *                     mentoringService:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                     submissions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           fileUrl:
 *                             type: string
 *                           score:
 *                             type: number
 *                           feedback:
 *                             type: string
 *                           submissionDate:
 *                             type: string
 *                             format: date-time
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               fullName:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                               profilePicture:
 *                                 type: string
 *                           session:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               id:
 *                                 type: string
 *                               date:
 *                                 type: string
 *                                 format: date-time
 *                           gradedByUser:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               id:
 *                                 type: string
 *                               fullName:
 *                                 type: string
 *                               email:
 *                                 type: string
 *       401:
 *         description: Tidak ada token atau token tidak valid
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
 *         description: Akses ditolak (bukan mentor)
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
 *                   example: Forbidden. Mentor only.
 *       404:
 *         description: Proyek tidak ditemukan atau tidak termasuk service mentor
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
 *                   example: Proyek tidak ditemukan atau tidak termasuk dalam service mentoring Anda
 *       500:
 *         description: Terjadi kesalahan internal server
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
 *                   example: Terjadi kesalahan pada server.
 */
router.get(
  "/mentor/projects/:id",
  authenticate,
  authorizeRoles("mentor"),
  validate(getMentorProjectDetailSchema),
  ProjectController.getMentorProjectDetail
);

/**
 * @swagger
 * /api/project/mentees/projects:
 *   get:
 *     summary: Daftar proyek mentee (mentee)
 *     tags: [Project]
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
 *         name: search
 *         schema:
 *           type: string
 *           example: desain UI
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           example: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           example: desc
 *     responses:
 *       200:
 *         description: Daftar proyek mentee berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Daftar proyek berhasil diambil
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       serviceId:
 *                         type: string
 *                       mentoringService:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           serviceName:
 *                             type: string
 *                           serviceType:
 *                             type: string
 *                           durationDays:
 *                             type: integer
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *       401:
 *         description: Token tidak valid atau tidak disertakan
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
 *         description: Akses ditolak (bukan mentee)
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
 *         description: Terjadi kesalahan server
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
 *                   example: Terjadi kesalahan pada server.
 */
router.get(
  "/mentees/projects",
  authenticate,
  authorizeRoles("mentee"),
  validate(getMenteeProjectListSchema),
  ProjectController.getMenteeProjects
);

/**
 * @swagger
 * /api/project/mentees/projects/{id}:
 *   get:
 *     summary: Detail proyek mentee
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: Project-uiux-20250701-123456
 *     responses:
 *       200:
 *         description: Detail proyek mentee berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Detail proyek berhasil diambil
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: Project-uiux-20250701-123456
 *                     title:
 *                       type: string
 *                       example: Redesign UI LMS
 *                     description:
 *                       type: string
 *                       example: Perbaikan desain dashboard pembelajaran
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-07-01T10:00:00.000Z
 *                     mentoringService:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: svc-001
 *                         serviceName:
 *                           type: string
 *                           example: UI/UX Design Bootcamp
 *                         serviceType:
 *                           type: string
 *                           example: Design
 *                         durationDays:
 *                           type: integer
 *                           example: 30
 *       401:
 *         description: Token tidak valid atau tidak disertakan
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
 *         description: Akses ditolak (bukan mentee)
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
 *       404:
 *         description: Proyek tidak ditemukan atau akses tidak valid
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
 *                   example: Proyek tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan pada server
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
 *                   example: Terjadi kesalahan pada server.
 */
router.get(
  "/mentees/projects/:id",
  authenticate,
  authorizeRoles("mentee"),
  validate(getMenteeProjectDetailSchema),
  ProjectController.getMenteeProjectDetail
);

/**
 * @swagger
 * /api/project/adminProjectsExport:
 *   get:
 *     summary: Export data proyek (admin)
 *     tags: [Project]
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
 *         description: File export proyek tersedia
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Format export tidak valid (selain csv atau excel)
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
 *                   example: Format export tidak valid
 *       401:
 *         description: Token tidak valid atau tidak disertakan
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
 *                   example: Forbidden. Admin only.
 *       500:
 *         description: Terjadi kesalahan pada server
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
 *                   example: Terjadi kesalahan pada server.
 */
router.get(
  "/adminProjectsExport",
  authenticate,
  authorizeRoles("admin"),
  validate(exportProjectSchema),
  ProjectController.exportProjects
);

/**
 * @swagger
 * /api/project/menteeSubmitProjects/{id}/submissions:
 *   post:
 *     summary: Submit proyek (mentee)
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - submissionFile
 *               - sessionId
 *             properties:
 *               sessionId:
 *                 type: string
 *                 example: "sess-xyz123"
 *               submissionFile:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Submission berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Submit submission berhasil
 *                 data:
 *                   type: object
 *                   properties:
 *                     submission:
 *                       type: object
 *                       properties:
 *                         id: { type: string, example: "Submission-mentee123-svc456-20250701121500" }
 *                         projectId: { type: string }
 *                         menteeId: { type: string }
 *                         sessionId: { type: string }
 *                         filePaths:
 *                           type: array
 *                           items: { type: string }
 *                         plagiarismScore:
 *                           type: number
 *                           nullable: true
 *                     plagiarismScore:
 *                       type: number
 *                       nullable: true
 *       400:
 *         description: Validasi gagal atau request tidak sesuai
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Kamu sudah pernah mengumpulkan submission untuk proyek ini.
 *       401:
 *         description: Token tidak valid atau tidak disertakan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Akses ditolak (bukan mentee)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Forbidden. Mentee only.
 *       500:
 *         description: Kesalahan pada server atau gagal hitung plagiarism score
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Gagal menghitung skor plagiarisme
 */
router.post(
  "/menteeSubmitProjects/:id/submissions",
  authenticate,
  authorizeRoles("mentee"),
  handleSubmissionUpload("submissionFile", true),
  validate(submitProjectSchema),
  ProjectController.submitProject
);

/**
 * @swagger
 * /api/project/mentors/submissions/{id}:
 *   patch:
 *     summary: Review submission (mentor/admin)
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - Score
 *               - mentorFeedback
 *             properties:
 *               Score:
 *                 type: number
 *                 example: 85
 *               mentorFeedback:
 *                 type: string
 *                 example: "Good work, but revise the last section."
 *               sessionId:
 *                 type: string
 *                 example: "session-abc123"
 *     responses:
 *       200:
 *         description: Submission berhasil dinilai
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Penilaian berhasil diberikan
 *                 data:
 *                   type: object
 *                   properties:
 *                     id: { type: string, example: "Submission-123" }
 *                     projectId: { type: string }
 *                     sessionId: { type: string }
 *                     mentorFeedback: { type: string }
 *                     Score: { type: number }
 *                     gradedBy: { type: string }
 *                     isReviewed: { type: boolean }
 *                     updatedAt: { type: string, format: date-time }
 *       400:
 *         description: Validasi gagal atau body tidak lengkap
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Submission tidak ditemukan.
 *       403:
 *         description: Tidak berhak menilai submission ini
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Kamu tidak berhak menilai submission ini.
 *       401:
 *         description: Token tidak valid atau tidak disertakan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Terjadi kesalahan di server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Terjadi kesalahan saat menilai submission
 */
router.patch(
  "/mentors/submissions/:id",
  authenticate,
  authorizeRoles("mentor", "admin"),
  validate(reviewSubmissionSchema),
  ProjectController.reviewSubmission
);

/**
 * @swagger
 * /api/project/admin/submissions:
 *   get:
 *     summary: Semua submission (admin)
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         example: "John Doe"
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         example: "proj-abc123"
 *       - in: query
 *         name: serviceId
 *         schema:
 *           type: string
 *         example: "svc-xyz456"
 *       - in: query
 *         name: isReviewed
 *         schema:
 *           type: boolean
 *         example: true
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [score, submissionDate, createdAt]
 *         example: submissionDate
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         example: desc
 *     responses:
 *       200:
 *         description: Daftar submission berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Daftar submission berhasil diambil
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "sub-123"
 *                       submissionDate:
 *                         type: string
 *                         format: date-time
 *                       Score:
 *                         type: number
 *                         nullable: true
 *                       mentorFeedback:
 *                         type: string
 *                         nullable: true
 *                       isReviewed:
 *                         type: boolean
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           fullName:
 *                             type: string
 *                           email:
 *                             type: string
 *                       project:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           mentoringService:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               serviceName:
 *                                 type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 45
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *       401:
 *         description: Unauthorized (tidak ada token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Forbidden (bukan admin)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Forbidden
 *       500:
 *         description: Terjadi kesalahan pada server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Terjadi kesalahan saat mengambil daftar submission
 */
router.get(
  "/admin/submissions",
  authenticate,
  authorizeRoles("admin"),
  validate(getAdminSubmissionListSchema),
  ProjectController.getAdminSubmissions
);

/**
 * @swagger
 * /api/project/admin/submissions/{id}:
 *   get:
 *     summary: Detail submission (admin)
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dari submission proyek
 *     responses:
 *       200:
 *         description: Detail submission berhasil diambil
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
 *                   example: Detail submission berhasil diambil
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "subm-abc123"
 *                     submissionDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-30T12:00:00Z"
 *                     Score:
 *                       type: number
 *                       nullable: true
 *                     mentorFeedback:
 *                       type: string
 *                       nullable: true
 *                     isReviewed:
 *                       type: boolean
 *                       example: true
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         fullName:
 *                           type: string
 *                         email:
 *                           type: string
 *                     project:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         title:
 *                           type: string
 *                         description:
 *                           type: string
 *                         mentoringService:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             serviceName:
 *                               type: string
 *                             serviceType:
 *                               type: string
 *                     gradedByUser:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: string
 *                         fullName:
 *                           type: string
 *                         email:
 *                           type: string
 *       401:
 *         description: Unauthorized – Token tidak dikirimkan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Forbidden – Role tidak diizinkan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Forbidden
 *       404:
 *         description: Submission tidak ditemukan
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
 *                   example: Submission tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan pada server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Terjadi kesalahan saat mengambil detail submission
 */
router.get(
  "/admin/submissions/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(getAdminSubmissionDetailSchema),
  ProjectController.getAdminSubmissionDetail
);

/**
 * @swagger
 * /api/project/adminSubmissionsExport:
 *   get:
 *     summary: Export submissions (admin)
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         required: true
 *         schema:
 *           type: string
 *           enum: [csv, excel]
 *         description: Format file export (csv atau excel)
 *     responses:
 *       200:
 *         description: File export submissions tersedia
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
 *                 message:
 *                   type: string
 *                   example: Format tidak valid, hanya csv atau excel yang didukung
 *       401:
 *         description: Unauthorized – Token tidak dikirimkan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Forbidden – Hanya admin yang bisa export submission
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Forbidden
 *       500:
 *         description: Terjadi kesalahan pada server saat melakukan export
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Terjadi kesalahan saat export data submissions
 */
router.get(
  "/adminSubmissionsExport",
  authenticate,
  authorizeRoles("admin"),
  validate(exportSubmissionSchema),
  ProjectController.exportAdminSubmissions
);

/**
 * @swagger
 * /api/project/mentorsProjects/{id}/submissions:
 *   get:
 *     summary: Submissions per project (mentor)
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID proyek yang ingin diambil daftar submissions-nya
 *     responses:
 *       200:
 *         description: Daftar submission mentor untuk project
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "subm-uuid-123"
 *                       menteeName:
 *                         type: string
 *                         example: "Dimas Hermawan"
 *                       menteeEmail:
 *                         type: string
 *                         example: "dimas@example.com"
 *                       submissionDate:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-07-01T08:00:00.000Z"
 *                       score:
 *                         type: number
 *                         example: 90
 *                       isReviewed:
 *                         type: boolean
 *                         example: true
 *                       plagiarismScore:
 *                         type: number
 *                         example: 5
 *       400:
 *         description: Mentor profile ID tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Mentor profile ID is required
 *       403:
 *         description: Mentor tidak memiliki akses ke project ini
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: You are not authorized to access this project's submissions
 *       404:
 *         description: Mentor profile tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Mentor profile not found
 *       401:
 *         description: Unauthorized – Token tidak dikirimkan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Terjadi kesalahan internal server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.get(
  "/mentorsProjects/:id/submissions",
  authenticate,
  authorizeRoles("mentor"),
  validate(getMentorProjectSubmissionListSchema),
  ProjectController.getMentorProjectSubmissions
);

/**
 * @swagger
 * /api/project/mentorsSubmissions/{id}:
 *   get:
 *     summary: Detail submission spesifik (mentor)
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID dari submission yang ingin dilihat
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detail submission berhasil diambil
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
 *                       example: "subm-uuid-001"
 *                     projectId:
 *                       type: string
 *                       example: "proj-uuid-001"
 *                     submissionDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-07-01T09:30:00.000Z"
 *                     filePaths:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["/uploads/file1.pdf", "/uploads/file2.zip"]
 *                     score:
 *                       type: number
 *                       example: 95
 *                     isReviewed:
 *                       type: boolean
 *                       example: true
 *                     plagiarismScore:
 *                       type: number
 *                       example: 3
 *                     mentorFeedback:
 *                       type: string
 *                       example: "Good structure and implementation"
 *                     mentee:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "Dimas Hermawan"
 *                         email:
 *                           type: string
 *                           example: "dimas@example.com"
 *       400:
 *         description: Mentor profile ID tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Mentor profile ID is required
 *       403:
 *         description: Mentor tidak punya akses terhadap submission ini
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: You are not authorized to view this submission
 *       404:
 *         description: Submission tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Submission not found
 *       401:
 *         description: Unauthorized – Token tidak valid atau tidak disertakan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Kesalahan server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.get(
  "/mentorsSubmissions/:id",
  authenticate,
  authorizeRoles("mentor"),
  validate(getMentorSubmissionDetailSchema),
  ProjectController.getMentorSubmissionDetail
);

/**
 * @swagger
 * /api/project/menteesSubmissions:
 *   get:
 *     summary: Submissions milik mentee
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Halaman data (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Jumlah item per halaman (default 10)
 *     responses:
 *       200:
 *         description: Daftar submission mentee berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "subm-uuid-001"
 *                       projectTitle:
 *                         type: string
 *                         example: "Final Web Project"
 *                       submissionDate:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-06-28T12:34:56.000Z"
 *                       score:
 *                         type: number
 *                         example: 85
 *                       isReviewed:
 *                         type: boolean
 *                         example: true
 *                       plagiarismScore:
 *                         type: number
 *                         example: 4
 *                 total:
 *                   type: integer
 *                   example: 3
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPage:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: Query tidak valid atau pagination error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid query or pagination parameter
 *       401:
 *         description: Tidak terautentikasi (Bearer token tidak disertakan atau tidak valid)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Akses ditolak (bukan mentee)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Forbidden
 *       500:
 *         description: Terjadi kesalahan server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.get(
  "/menteesSubmissions",
  authenticate,
  authorizeRoles("mentee"),
  validate(getMenteeSubmissionsSchema),
  ProjectController.getMenteeSubmissions
);

/**
 * @swagger
 * /api/project/menteesSubmissions/{id}:
 *   get:
 *     summary: Detail submission mentee
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID dari submission yang ingin diambil
 *         schema:
 *           type: string
 *           example: "subm-uuid-001"
 *     responses:
 *       200:
 *         description: Detail submission mentee berhasil diambil
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
 *                       example: "subm-uuid-001"
 *                     projectTitle:
 *                       type: string
 *                       example: "Final Project Web Dev"
 *                     submissionDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-30T10:20:00.000Z"
 *                     filePaths:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "/uploads/submissions/file1.pdf"
 *                     plagiarismScore:
 *                       type: number
 *                       example: 5
 *                     score:
 *                       type: number
 *                       example: 85
 *                     isReviewed:
 *                       type: boolean
 *                       example: true
 *                     mentorFeedback:
 *                       type: string
 *                       example: "Good structure and explanation"
 *       401:
 *         description: Tidak terautentikasi (token tidak valid atau tidak disertakan)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Akses ditolak (bukan mentee)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Forbidden
 *       404:
 *         description: Submission tidak ditemukan atau bukan milik user ini
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Submission not found or not accessible
 *       500:
 *         description: Terjadi kesalahan di server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.get(
  "/menteesSubmissions/:id",
  authenticate,
  authorizeRoles("mentee"),
  validate(getMenteeSubmissionDetailSchema),
  ProjectController.getMenteeSubmissionDetail
);

export default router;
