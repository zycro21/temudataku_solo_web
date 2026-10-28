import { Router } from "express";
// 🔥 Sesuaikan semua path import di bawah ini dengan struktur folder project kamu
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRole.js";
import FormCategoryController from "../controllers/form_category.controller.js";
import {
  listCategoriesSchema,
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema,
} from "../validations/form_category.validation.js";

// Dipasang di app dengan: app.use("/api/form", formCategoryRoutes)
// (satu base path dengan form.route.ts, hasil akhirnya /api/form/categories)
// Khusus admin / Class Manager (cm). Hak ubah/hapus dicek lagi di service.
const router = Router();
const managers = authorizeRoles("admin", "cm");

/**
 * @swagger
 * /api/form/categories:
 *   get:
 *     summary: Daftar jenis form per tipe (halaman Jenis Form)
 *     description:
 *       - type wajib (EVENT atau NON_EVENT); jenis Form Event dan Form Non Event terpisah.
 *       - search mencari nama jenis.
 *       - formCount = jumlah form berstatus Draft/Published (arsip tidak dihitung).
 *     tags: [Form Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema: { type: string, enum: [EVENT, NON_EVENT] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: "{ items: [{ id, type, name, description, formCount, createdAt, updatedAt }] }"
 *       403:
 *         description: Hanya admin/cm
 */
router.get(
  "/categories",
  authenticate,
  managers,
  validate(listCategoriesSchema),
  FormCategoryController.listCategories,
);

/**
 * @swagger
 * /api/form/categories:
 *   post:
 *     summary: Buat jenis form baru
 *     description:
 *       - Nama jenis harus unik di dalam satu tipe (tanpa membedakan huruf besar/kecil).
 *     tags: [Form Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, name]
 *             properties:
 *               type: { type: string, enum: [EVENT, NON_EVENT] }
 *               name: { type: string, example: "Pendaftaran" }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Jenis form berhasil dibuat
 *       400:
 *         description: Data tidak valid
 *       409:
 *         description: Nama jenis sudah dipakai di tipe yang sama
 */
router.post(
  "/categories",
  authenticate,
  managers,
  validate(createCategorySchema),
  FormCategoryController.createCategory,
);

/**
 * @swagger
 * /api/form/categories/{id}:
 *   patch:
 *     summary: Ubah nama / deskripsi jenis (admin atau pembuatnya)
 *     description:
 *       - Tipe jenis tidak bisa diubah.
 *     tags: [Form Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string, nullable: true }
 *     responses:
 *       200:
 *         description: Jenis form diperbarui
 *       403:
 *         description: Bukan admin / pembuat jenis
 *       404:
 *         description: Jenis tidak ditemukan
 *       409:
 *         description: Nama jenis sudah dipakai di tipe yang sama
 */
router.patch(
  "/categories/:id",
  authenticate,
  managers,
  validate(updateCategorySchema),
  FormCategoryController.updateCategory,
);

/**
 * @swagger
 * /api/form/categories/{id}:
 *   delete:
 *     summary: Hapus jenis (admin atau pembuatnya)
 *     description:
 *       - Ditolak 409 selama masih ada form yang memakai jenis ini, termasuk form yang sudah diarsipkan.
 *     tags: [Form Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Jenis form dihapus
 *       403:
 *         description: Bukan admin / pembuat jenis
 *       404:
 *         description: Jenis tidak ditemukan
 *       409:
 *         description: Jenis masih dipakai form
 */
router.delete(
  "/categories/:id",
  authenticate,
  managers,
  validate(categoryIdParamSchema),
  FormCategoryController.deleteCategory,
);

export default router;
