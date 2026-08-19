import { Router } from "express";
// 🔥 Sesuaikan semua path import di bawah ini dengan struktur folder project kamu
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRole.js";
import ArticleContentController from "../controllers/article_content.controller.js";
import { handleArticleContentFilesUpload } from "../middlewares/uploadImage.js";
import { parseArticleContentPayload } from "../middlewares/parseArticleContentPayload.js";
import { parseArticleBlockPayload } from "../middlewares/parseArticleBlockPayload.js";
import {
  updateArticleContentSchema,
  articleIdOnlyParamSchema,
  createArticleBlockSchema,
  articleBlockParamSchema,
  updateArticleBlockSchema,
} from "../validations/article_content.validation.js";
 
const router = Router();

/**
 * @swagger
 * /api/articlecontent/articles/{id}/content:
 *   put:
 *     summary: Admin mengganti seluruh konten (blocks) sebuah artikel
 *     description:
 *       - Endpoint ini FULL REPLACE semua block artikel — blocks lama dihapus lalu dibuat ulang dari payload yang dikirim.
 *       - Kirim blocks berisi array kosong ([]) untuk mengosongkan semua konten artikel.
 *       - Endpoint memakai multipart/form-data karena mendukung upload gambar/video.
 *       - Field blocks harus dikirim dalam bentuk JSON string.
 *       - Tipe content yang didukung blocks[].contents[].type: heading, paragraph, highlight, accordion, carousel, content_card, tab_navigation, summary.
 *       - Tipe additionalContents yang didukung blocks[].additionalContents[].type hanya: image_video.
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
 *             required:
 *               - blocks
 *             properties:
 *               blocks:
 *                 type: string
 *                 description: JSON.stringify(blocks)
 *                 example: '[{"orderNumber":1,"contents":[{"type":"heading","level":2,"text":"Judul Bagian","orderNumber":1},{"type":"paragraph","text":"Isi paragraf artikel","orderNumber":2}],"additionalContents":[]}]'
 *               mediaFiles:
 *                 type: array
 *                 description: File gambar/video baru untuk additionalContents bertipe image_video dengan isNewUpload=true, urutannya harus sesuai urutan kemunculan di blocks
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Konten artikel berhasil diperbarui
 *       400:
 *         description: Format JSON tidak valid, data tidak valid, atau jumlah file tidak sesuai
 *       403:
 *         description: Hanya admin yang dapat mengubah konten artikel
 *       404:
 *         description: Artikel tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.put(
  "/articles/:id/content",
  authenticate,
  authorizeRoles("admin", "cm", "curdev"),
  handleArticleContentFilesUpload,
  parseArticleContentPayload,
  validate(updateArticleContentSchema),
  ArticleContentController.updateArticleContent,
);
 
/**
 * @swagger
 * /api/articlecontent/articles/{id}/content/blocks:
 *   get:
 *     summary: Admin melihat semua block sebuah artikel
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
 *         description: Daftar block artikel
 *       403:
 *         description: Hanya admin yang dapat mengakses endpoint ini
 *       404:
 *         description: Artikel tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.get(
  "/articles/:id/content/blocks",
  authenticate,
  authorizeRoles("admin", "cm", "curdev"),
  validate(articleIdOnlyParamSchema),
  ArticleContentController.getArticleBlocks,
);
 
/**
 * @swagger
 * /api/articlecontent/articles/{id}/content/blocks/{blockId}:
 *   get:
 *     summary: Admin melihat detail 1 block artikel
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
 *       - in: path
 *         name: blockId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detail block
 *       403:
 *         description: Hanya admin yang dapat mengakses endpoint ini
 *       404:
 *         description: Block tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.get(
  "/articles/:id/content/blocks/:blockId",
  authenticate,
  authorizeRoles("admin", "cm", "curdev"),
  validate(articleBlockParamSchema),
  ArticleContentController.getArticleBlockById,
);
 
/**
 * @swagger
 * /api/articlecontent/articles/{id}/content/blocks:
 *   post:
 *     summary: Admin menambahkan 1 block baru ke artikel
 *     description:
 *       - orderNumber opsional — kalau tidak dikirim, block baru ditaruh di posisi paling akhir.
 *       - Kalau orderNumber dikirim, block-block lain otomatis digeser buat kasih ruang.
 *       - Endpoint memakai multipart/form-data karena mendukung upload gambar/video.
 *       - Field contents dan additionalContents harus dikirim dalam bentuk JSON string.
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
 *               orderNumber:
 *                 type: integer
 *                 example: 2
 *               contents:
 *                 type: string
 *                 description: JSON.stringify(contents)
 *                 example: '[{"type":"paragraph","text":"Isi paragraf baru","orderNumber":1}]'
 *               additionalContents:
 *                 type: string
 *                 description: JSON.stringify(additionalContents)
 *                 example: '[]'
 *               mediaFiles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Block berhasil ditambahkan
 *       400:
 *         description: Format JSON tidak valid atau jumlah file tidak sesuai
 *       403:
 *         description: Hanya admin yang dapat membuat konten artikel
 *       404:
 *         description: Artikel tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.post(
  "/articles/:id/content/blocks",
  authenticate,
  authorizeRoles("admin", "cm", "curdev"),
  handleArticleContentFilesUpload,
  parseArticleBlockPayload,
  validate(createArticleBlockSchema),
  ArticleContentController.createArticleBlock,
);
 
/**
 * @swagger
 * /api/articlecontent/articles/{id}/content/blocks/{blockId}:
 *   patch:
 *     summary: Admin mengubah 1 block artikel (posisi dan/atau isinya)
 *     description:
 *       - Kirim orderNumber aja kalau cuma mau reorder tanpa ubah isi.
 *       - Kirim contents/additionalContents kalau mau ganti isi block ini (block lain tidak ikut terpengaruh).
 *       - Endpoint memakai multipart/form-data karena mendukung upload gambar/video.
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
 *       - in: path
 *         name: blockId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               orderNumber:
 *                 type: integer
 *               contents:
 *                 type: string
 *                 description: JSON.stringify(contents)
 *               additionalContents:
 *                 type: string
 *                 description: JSON.stringify(additionalContents)
 *               mediaFiles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Block berhasil diperbarui
 *       400:
 *         description: Format JSON tidak valid, orderNumber tidak valid, atau jumlah file tidak sesuai
 *       403:
 *         description: Hanya admin yang dapat mengubah konten artikel
 *       404:
 *         description: Block tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.patch(
  "/articles/:id/content/blocks/:blockId",
  authenticate,
  authorizeRoles("admin", "cm", "curdev"),
  handleArticleContentFilesUpload,
  parseArticleBlockPayload,
  validate(updateArticleBlockSchema),
  ArticleContentController.updateArticleBlock,
);
 
/**
 * @swagger
 * /api/articlecontent/articles/{id}/content/blocks/{blockId}:
 *   delete:
 *     summary: Admin menghapus 1 block artikel
 *     description: Block-block sesudahnya otomatis digeser mundur biar orderNumber tetap rapat tanpa bolong.
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
 *       - in: path
 *         name: blockId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Block berhasil dihapus
 *       403:
 *         description: Hanya admin yang dapat menghapus konten artikel
 *       404:
 *         description: Block tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.delete(
  "/articles/:id/content/blocks/:blockId",
  authenticate,
  authorizeRoles("admin", "cm", "curdev"),
  validate(articleBlockParamSchema),
  ArticleContentController.deleteArticleBlock,
);

export default router;