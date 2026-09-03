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
 *       - Tipe content yang didukung blocks[].contents[].type = heading, paragraph, highlight, divider, table, link, table_of_content.
 *       - Tipe additionalContents yang didukung blocks[].additionalContents[].type hanya = image_video.
 *       - "key" (opsional) di tiap content DAN tiap additionalContent (image_video) dipakai buat nge-referensiin item itu sebagai target link/table_of_content DI PAYLOAD YANG SAMA — wajib dipakai di endpoint ini karena semua block dibuat ulang dari nol sehingga belum ada ID asli saat payload disusun.
 *       - Content bertipe link dengan linkType=article_section, dan tiap items[] di table_of_content, wajib isi SALAH SATU dari targetKey (nunjuk ke key content lain) ATAU targetMediaKey (nunjuk ke key additionalContent image_video lain) — tidak boleh dua-duanya atau kosong.
 *       - Satu artikel maksimal 1 block bertipe table_of_content.
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
 *                 example: '[{"orderNumber":1,"contents":[{"type":"heading","key":"heading-1","level":2,"text":"Judul Bagian","orderNumber":1},{"type":"paragraph","text":"Isi paragraf artikel","orderNumber":2}],"additionalContents":[{"type":"image_video","key":"gambar-1","position":"AFTER","isNewUpload":true,"content":{"mediaType":"IMAGE"}}]},{"orderNumber":2,"contents":[{"type":"link","orderNumber":1,"linkText":"Lihat gambar di atas","linkType":"article_section","targetMediaKey":"gambar-1"}]}]'
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
 *         description: Format JSON tidak valid, data tidak valid (termasuk target link/TOC tidak ketemu atau diisi ganda), atau jumlah file tidak sesuai
 *       403:
 *         description: Hanya admin yang dapat mengubah konten artikel
 *       404:
 *         description: Artikel tidak ditemukan
 *       409:
 *         description: Artikel sudah punya Table of Content (maksimal 1 per artikel)
 *       500:
 *         description: Kesalahan server
 */
router.put(
  "/articles/:id/content",
  authenticate,
  authorizeRoles("admin", "cm", "curdev", "cw"),
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
  authorizeRoles("admin", "cm", "curdev", "cw"),
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
  authorizeRoles("admin", "cm", "curdev", "cw"),
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
 *       - Tipe content yang didukung contents[].type = heading, paragraph, highlight, divider, table, link, table_of_content.
 *       - Karena endpoint ini cuma bikin SATU block baru (block/media lain di artikel sudah tersimpan sebelumnya), target link/table_of_content pakai targetContentBlockId (ID content block yang sudah ada) atau targetAdditionalContentId (ID gambar/video yang sudah ada), didapat dari GET /content/blocks — BUKAN targetKey/targetMediaKey, yang cuma berlaku untuk referensi ke item di payload yang sama seperti PUT /content.
 *       - Satu artikel maksimal 1 block bertipe table_of_content — request ditolak (409) kalau artikel sudah punya satu.
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
 *         description: Format JSON tidak valid, data tidak valid (termasuk target link/TOC tidak ketemu atau diisi ganda), atau jumlah file tidak sesuai
 *       403:
 *         description: Hanya admin yang dapat membuat konten artikel
 *       404:
 *         description: Artikel tidak ditemukan
 *       409:
 *         description: Artikel sudah punya Table of Content (maksimal 1 per artikel)
 *       500:
 *         description: Kesalahan server
 */
router.post(
  "/articles/:id/content/blocks",
  authenticate,
  authorizeRoles("admin", "cm", "curdev", "cw"),
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
 *       - Sama seperti POST, target link/table_of_content di endpoint ini pakai targetContentBlockId atau targetAdditionalContentId (ID yang sudah ada di artikel), bukan targetKey/targetMediaKey.
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
 *         description: Format JSON tidak valid, orderNumber tidak valid, data tidak valid (termasuk target link/TOC tidak ketemu atau diisi ganda), atau jumlah file tidak sesuai
 *       403:
 *         description: Hanya admin yang dapat mengubah konten artikel
 *       404:
 *         description: Block tidak ditemukan
 *       409:
 *         description: Artikel sudah punya Table of Content (maksimal 1 per artikel)
 *       500:
 *         description: Kesalahan server
 */
router.patch(
  "/articles/:id/content/blocks/:blockId",
  authenticate,
  authorizeRoles("admin", "cm", "curdev", "cw"),
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
 *     description:
 *       - Block-block sesudahnya otomatis digeser mundur biar orderNumber tetap rapat tanpa bolong.
 *       - Kalau ada Link di block lain yang nunjuk ke content/media di block ini, target Link tersebut otomatis jadi kosong (link-nya sendiri tidak ikut terhapus).
 *       - Kalau ada item Table of Content yang nunjuk ke content/media di block ini, item tersebut ikut terhapus otomatis.
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
  authorizeRoles("admin", "cm", "curdev", "cw"),
  validate(articleBlockParamSchema),
  ArticleContentController.deleteArticleBlock,
);

export default router;
