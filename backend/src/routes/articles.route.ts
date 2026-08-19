import express from "express";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRole.js";
import ArticleController from "../controllers/article.controller.js";
import { handleArticleCoverUpload } from "../middlewares/uploadImage.js";
import {
  createArticleSchema,
  updateArticleSchema,
  articleIdParamSchema,
  articleSlugParamSchema,
  articleListQuerySchema,
} from "../validations/articles.validator.js";

const router = express.Router();

/**
 * @swagger
 * /api/article/articles:
 *   post:
 *     summary: Admin membuat artikel baru
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: "5 Tips Belajar Data Science untuk Pemula"
 *               slug:
 *                 type: string
 *                 example: "5-tips-belajar-data-science-untuk-pemula"
 *               excerpt:
 *                 type: string
 *                 example: "Ringkasan singkat buat ditampilkan di list artikel"
 *               coverImage:
 *                 type: string
 *                 format: binary
 *               category:
 *                 type: string
 *                 example: "Data Science"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED, ARCHIVED]
 *     responses:
 *       201:
 *         description: Artikel berhasil dibuat
 *       400:
 *         description: Request tidak valid
 *       403:
 *         description: Hanya admin yang dapat membuat artikel
 *       500:
 *         description: Kesalahan server
 */
router.post(
  "/articles",
  authenticate,
  authorizeRoles("admin", "cm", "curdev"),
  handleArticleCoverUpload("coverImage"),
  validate(createArticleSchema),
  ArticleController.createArticle,
);

/**
 * @swagger
 * /api/article/articles:
 *   get:
 *     summary: List artikel yang sudah published (publik)
 *     tags: [Articles]
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
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Daftar artikel published
 *       500:
 *         description: Kesalahan server
 */
router.get(
  "/articles",
  validate(articleListQuerySchema),
  ArticleController.getArticles,
);

/**
 * @swagger
 * /api/article/articles/slug/{slug}:
 *   get:
 *     summary: Ambil detail artikel published berdasarkan slug (publik)
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: "5-tips-belajar-data-science-untuk-pemula"
 *     responses:
 *       200:
 *         description: Detail artikel
 *       404:
 *         description: Artikel tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.get(
  "/articles/slug/:slug",
  validate(articleSlugParamSchema),
  ArticleController.getArticleBySlug,
);

/**
 * @swagger
 * /api/article/articles/{id}:
 *   get:
 *     summary: Admin ambil detail artikel apa pun statusnya berdasarkan ID (buat form edit)
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "article-20260814-1a2b3c"
 *     responses:
 *       200:
 *         description: Detail artikel
 *       403:
 *         description: Hanya admin yang dapat mengakses endpoint ini
 *       404:
 *         description: Artikel tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.get(
  "/articles/:id",
  authenticate,
  authorizeRoles("admin", "cm", "curdev"),
  validate(articleIdParamSchema),
  ArticleController.getArticleById,
);

/**
 * @swagger
 * /api/article/articles/{id}:
 *   patch:
 *     summary: Admin mengubah artikel
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "article-20260814-1a2b3c"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               coverImage:
 *                 type: string
 *                 format: binary
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED, ARCHIVED]
 *     responses:
 *       200:
 *         description: Artikel berhasil diperbarui
 *       403:
 *         description: Hanya admin yang dapat mengubah artikel
 *       404:
 *         description: Artikel tidak ditemukan
 *       409:
 *         description: Slug sudah dipakai artikel lain
 *       500:
 *         description: Kesalahan server
 */
router.patch(
  "/articles/:id",
  authenticate,
  authorizeRoles("admin", "cm", "curdev"),
  handleArticleCoverUpload("coverImage"),
  validate(articleIdParamSchema),
  validate(updateArticleSchema),
  ArticleController.updateArticle,
);

/**
 * @swagger
 * /api/article/articles/{id}:
 *   delete:
 *     summary: Admin menghapus artikel
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "article-20260814-1a2b3c"
 *     responses:
 *       200:
 *         description: Artikel berhasil dihapus
 *       403:
 *         description: Hanya admin yang dapat menghapus artikel
 *       404:
 *         description: Artikel tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.delete(
  "/articles/:id",
  authenticate,
  authorizeRoles("admin", "cm", "curdev"),
  validate(articleIdParamSchema),
  ArticleController.deleteArticle,
);

export default router;