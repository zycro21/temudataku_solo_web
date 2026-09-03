import { Router } from "express";
// 🔥 Sesuaikan semua path import di bawah ini dengan struktur folder project kamu
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRole.js";
import { handleArticleCoverUpload } from "../middlewares/uploadImage.js";
import ArticleController from "../controllers/article.controller.js";
import ArticleCategoryController from "../controllers/articleCategory.controller.js";
// 🔥 BARU — like artikel & komentar (+ like komentar), lihat blok route
// "ARTICLE LIKE" dan "ARTICLE COMMENT" di bawah.
import ArticleLikeController from "../controllers/articleLike.controller.js";
import ArticleCommentController from "../controllers/articleComment.controller.js";
import {
  createArticleSchema,
  updateArticleSchema,
  articleIdParamSchema,
  articleSlugParamSchema,
  articleListQuerySchema,
  adminArticleListQuerySchema,
  toggleElementFavoriteSchema,
} from "../validations/articles.validator.js";
import {
  createArticleCategorySchema,
  updateArticleCategorySchema,
  articleCategoryIdParamSchema,
} from "../validations/articleCategory.validator.js";
import {
  createArticleCommentSchema,
  articleCommentIdParamSchema,
} from "../validations/articleComment.validation.js";

const router = Router();

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
 *               isRecommended:
 *                 type: boolean
 *                 default: false
 *                 example: false
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
  authorizeRoles("admin", "cm", "curdev", "cw"),
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
 *       - in: query
 *         name: isRecommended
 *         schema:
 *           type: boolean
 *         description: Filter cuma artikel yang ditandai rekomendasi
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
 * /api/article/articles/admin:
 *   get:
 *     summary: Admin melihat semua artikel apa pun statusnya (buat tabel admin), sekalian statistik jumlah per status
 *     description:
 *       - HARUS didaftarkan sebelum GET /articles/{id} di route, kalau tidak Express bakal salah nangkep "admin" sebagai nilai id.
 *     tags: [Articles]
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, ARCHIVED]
 *       - in: query
 *         name: isRecommended
 *         schema:
 *           type: boolean
 *         description: Filter cuma artikel yang ditandai rekomendasi
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, createdAt, updatedAt, status]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Daftar artikel (semua status) + stats
 *       403:
 *         description: Hanya admin yang dapat mengakses endpoint ini
 *       500:
 *         description: Kesalahan server
 */
router.get(
  "/articles/admin",
  authenticate,
  authorizeRoles("admin", "cm", "curdev", "cw"),
  validate(adminArticleListQuerySchema),
  ArticleController.getArticlesAdmin,
);

/**
 * @swagger
 * /api/article/articles/trash:
 *   get:
 *     summary: Admin melihat daftar artikel yang ada di trash (soft-deleted)
 *     description:
 *       - HARUS didaftarkan sebelum GET /articles/{id}, kalau tidak Express bakal salah nangkep "trash" sebagai nilai id (pola sama seperti /articles/admin).
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, createdAt, updatedAt, status]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Daftar artikel di trash
 *       403:
 *         description: Hanya admin yang dapat mengakses endpoint ini
 *       500:
 *         description: Kesalahan server
 */
router.get(
  "/articles/trash",
  authenticate,
  authorizeRoles("admin", "cm", "curdev", "cw"),
  validate(adminArticleListQuerySchema),
  ArticleController.getTrashedArticles,
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
  authorizeRoles("admin", "cm", "curdev", "cw"),
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
 *               isRecommended:
 *                 type: boolean
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
  authorizeRoles("admin", "cm", "curdev", "cw"),
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
/**
 * @swagger
 * /api/article/articles/{id}:
 *   delete:
 *     summary: Admin memindahkan artikel ke trash (soft delete — bukan hapus permanen)
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
 *         description: Artikel berhasil dipindahkan ke trash
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
  authorizeRoles("admin", "cm", "curdev", "cw"),
  validate(articleIdParamSchema),
  ArticleController.deleteArticle,
);

/**
 * @swagger
 * /api/article/articles/{id}/restore:
 *   post:
 *     summary: Admin memulihkan artikel dari trash
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Artikel berhasil dipulihkan
 *       403:
 *         description: Hanya admin yang dapat memulihkan artikel
 *       404:
 *         description: Artikel tidak ditemukan
 *       409:
 *         description: Artikel tidak sedang berada di trash
 *       500:
 *         description: Kesalahan server
 */
router.post(
  "/articles/:id/restore",
  authenticate,
  authorizeRoles("admin", "cm", "curdev", "cw"),
  validate(articleIdParamSchema),
  ArticleController.restoreArticle,
);

/**
 * @swagger
 * /api/article/articles/{id}/permanent:
 *   delete:
 *     summary: Admin menghapus artikel secara PERMANEN (harus sudah ada di trash dulu)
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Artikel berhasil dihapus permanen
 *       403:
 *         description: Hanya admin yang dapat menghapus artikel secara permanen
 *       404:
 *         description: Artikel tidak ditemukan
 *       409:
 *         description: Artikel harus dipindahkan ke trash dulu sebelum dihapus permanen
 *       500:
 *         description: Kesalahan server
 */
router.delete(
  "/articles/:id/permanent",
  authenticate,
  authorizeRoles("admin", "cm", "curdev", "cw"),
  validate(articleIdParamSchema),
  ArticleController.permanentDeleteArticle,
);

/**
 * @swagger
 * /api/article/articles/{id}/like:
 *   post:
 *     summary: Toggle like/unlike artikel oleh user yang sedang login (satu user maksimal 1 like per artikel)
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status like berhasil di-toggle
 *       404:
 *         description: Artikel tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.post(
  "/articles/:id/like",
  authenticate,
  validate(articleIdParamSchema),
  ArticleLikeController.toggleArticleLike,
);

/**
 * @swagger
 * /api/article/articles/{id}/like-status:
 *   get:
 *     summary: Cek apakah user yang sedang login sudah nge-like artikel ini, sekalian total like-nya
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status like & total like artikel
 *       404:
 *         description: Artikel tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.get(
  "/articles/:id/like-status",
  authenticate,
  validate(articleIdParamSchema),
  ArticleLikeController.getArticleLikeStatus,
);

/**
 * @swagger
 * /api/article/articles/{id}/comments:
 *   post:
 *     summary: Tambah komentar baru ke artikel (isi parentId buat reply ke komentar lain — termasuk reply ke reply, nggak ada batas kedalaman)
 *     tags: [Articles]
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
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Artikelnya sangat membantu!"
 *               parentId:
 *                 type: string
 *                 description: Kosongkan kalau ini komentar top-level, isi ID komentar lain kalau ini reply
 *     responses:
 *       201:
 *         description: Komentar berhasil ditambahkan
 *       404:
 *         description: Artikel atau komentar induk tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.post(
  "/articles/:id/comments",
  authenticate,
  validate(articleIdParamSchema),
  validate(createArticleCommentSchema),
  ArticleCommentController.createComment,
);

/**
 * @swagger
 * /api/article/articles/{id}/comments:
 *   get:
 *     summary: Daftar semua komentar artikel (flat, termasuk semua reply bertingkat — susun tree-nya di FE lewat parentId), publik
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Daftar komentar
 *       404:
 *         description: Artikel tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.get(
  "/articles/:id/comments",
  validate(articleIdParamSchema),
  ArticleCommentController.getComments,
);

/**
 * @swagger
 * /api/article/articles/{id}/comments/like-status:
 *   get:
 *     summary: Daftar ID komentar (di artikel ini) yang sudah di-like oleh user yang sedang login
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Daftar ID komentar yang sudah di-like
 *       404:
 *         description: Artikel tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.get(
  "/articles/:id/comments/like-status",
  authenticate,
  validate(articleIdParamSchema),
  ArticleCommentController.getCommentsLikeStatus,
);

/**
 * @swagger
 * /api/article/comments/{id}/like:
 *   post:
 *     summary: Toggle like/unlike satu komentar oleh user yang sedang login (satu user maksimal 1 like per komentar)
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status like berhasil di-toggle
 *       404:
 *         description: Komentar tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.post(
  "/comments/:id/like",
  authenticate,
  validate(articleCommentIdParamSchema),
  ArticleCommentController.toggleCommentLike,
);

/**
 * @swagger
 * /api/article/comments/{id}:
 *   delete:
 *     summary: Hapus komentar/reply milik sendiri (soft delete)
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Komentar berhasil dihapus
 *       403:
 *         description: Tidak dapat menghapus komentar milik orang lain
 *       404:
 *         description: Komentar tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.delete(
  "/comments/:id",
  authenticate,
  validate(articleCommentIdParamSchema),
  ArticleCommentController.deleteComment,
);

/**
 * @swagger
 * /api/article/element-favorites:
 *   get:
 *     summary: Daftar elemen sidebar (Heading/Table/dst) yang di-favorite-in user yang login
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar elementType yang di-favorite-in
 *       500:
 *         description: Kesalahan server
 */
router.get(
  "/element-favorites",
  authenticate,
  authorizeRoles("admin", "cm", "curdev", "cw"),
  ArticleController.getElementFavorites,
);

/**
 * @swagger
 * /api/article/element-favorites/toggle:
 *   post:
 *     summary: Toggle favorite satu elemen sidebar (favorite <-> unfavorite)
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - elementType
 *             properties:
 *               elementType:
 *                 type: string
 *                 enum: [HEADING, PARAGRAPH, IMAGE, VIDEO, TABLE, HIGHLIGHT, DIVIDER, LINK, TABLE_OF_CONTENT]
 *     responses:
 *       200:
 *         description: Status favorite berhasil di-toggle
 *       400:
 *         description: Request tidak valid
 *       500:
 *         description: Kesalahan server
 */
router.post(
  "/element-favorites/toggle",
  authenticate,
  authorizeRoles("admin", "cm", "curdev", "cw"),
  validate(toggleElementFavoriteSchema),
  ArticleController.toggleElementFavorite,
);

/**
 * @swagger
 * /api/article/categories:
 *   get:
 *     summary: Daftar semua kategori artikel (publik — dipakai dropdown filter & form buat/edit artikel)
 *     tags: [ArticleCategories]
 *     responses:
 *       200:
 *         description: Daftar kategori
 *       500:
 *         description: Kesalahan server
 */
router.get("/categories", ArticleCategoryController.getCategories);

/**
 * @swagger
 * /api/article/categories/{id}:
 *   get:
 *     summary: Detail 1 kategori artikel (publik — dipakai halaman kategori artikel)
 *     tags: [ArticleCategories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detail kategori
 *       404:
 *         description: Kategori tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.get(
  "/categories/:id",
  validate(articleCategoryIdParamSchema),
  ArticleCategoryController.getCategoryById,
);

/**
 * @swagger
 * /api/article/categories:
 *   post:
 *     summary: Admin membuat kategori artikel baru
 *     tags: [ArticleCategories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Karier"
 *     responses:
 *       201:
 *         description: Kategori berhasil dibuat
 *       403:
 *         description: Hanya admin yang dapat membuat kategori
 *       409:
 *         description: Nama kategori sudah dipakai
 *       500:
 *         description: Kesalahan server
 */
router.post(
  "/categories",
  authenticate,
  authorizeRoles("admin", "cm", "curdev", "cw"),
  validate(createArticleCategorySchema),
  ArticleCategoryController.createCategory,
);

/**
 * @swagger
 * /api/article/categories/{id}:
 *   patch:
 *     summary: Admin mengubah nama kategori artikel
 *     tags: [ArticleCategories]
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
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Kategori berhasil diperbarui
 *       403:
 *         description: Hanya admin yang dapat mengubah kategori
 *       404:
 *         description: Kategori tidak ditemukan
 *       409:
 *         description: Nama kategori sudah dipakai
 *       500:
 *         description: Kesalahan server
 */
router.patch(
  "/categories/:id",
  authenticate,
  authorizeRoles("admin", "cm", "curdev", "cw"),
  validate(articleCategoryIdParamSchema),
  validate(updateArticleCategorySchema),
  ArticleCategoryController.updateCategory,
);

/**
 * @swagger
 * /api/article/categories/{id}:
 *   delete:
 *     summary: Admin menghapus kategori artikel (ditolak kalau masih dipakai artikel)
 *     tags: [ArticleCategories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Kategori berhasil dihapus
 *       403:
 *         description: Hanya admin yang dapat menghapus kategori
 *       404:
 *         description: Kategori tidak ditemukan
 *       409:
 *         description: Kategori masih dipakai artikel lain
 *       500:
 *         description: Kesalahan server
 */
router.delete(
  "/categories/:id",
  authenticate,
  authorizeRoles("admin", "cm", "curdev", "cw"),
  validate(articleCategoryIdParamSchema),
  ArticleCategoryController.deleteCategory,
);

export default router;
