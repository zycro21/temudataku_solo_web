import express from "express";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRole.js";
import {
  createVideoSchema,
  getVideoByIdSchema,
  getVideosBySubBabSchema,
  updateVideoSchema,
  reorderVideosSchema,
  togglePreviewSchema,
  moveVideoSchema,
  getVideosByBlockSchema,
} from "../validations/elearning_video.validation.js";
import { ELearningVideoController } from "../controllers/elearning_video.controller.js";
import { handleELearningVideoUpload } from "../middlewares/uploadImage.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: E-Learning Video
 *   description: Video
 */

/**
 * @swagger
 * /api/elearningVideo/subbabs/{id}/videos:
 *   post:
 *     summary: Tambah video ke sub-bab (dengan anchor)
 *     description: |
 *       Upload video baru ke dalam sub-bab e-learning dan langsung
 *       menyematkannya ke dalam block tertentu menggunakan anchor.
 *
 *       **Hak Akses:**
 *       - **Admin**: bebas menambahkan video ke sub-bab mana pun
 *       - **Mentor**: hanya dapat menambahkan video ke sub-bab
 *         yang course-nya merupakan tanggung jawab mentor tersebut
 *
 *       **Catatan Teknis:**
 *       - Video WAJIB memiliki anchor
 *       - contentType anchor = VIDEO
 *       - orderNumber anchor ditentukan otomatis (berdasarkan blockId)
 *     tags: [E-Learning Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID Sub-Bab
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - video
 *               - anchor
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Pengenalan Konsep Dasar"
 *               video:
 *                 type: string
 *                 format: binary
 *               anchor:
 *                 type: object
 *                 required:
 *                   - blockId
 *                   - position
 *                 properties:
 *                   blockId:
 *                     type: string
 *                     description: ID block tempat video disematkan
 *                   position:
 *                     type: string
 *                     enum: [BEFORE, INLINE, AFTER]
 *     responses:
 *       201:
 *         description: Video berhasil ditambahkan
 *       403:
 *         description: Tidak memiliki hak akses
 *       404:
 *         description: SubBab / Block tidak ditemukan
 */
router.post(
  "/subbabs/:id/videos",
  authenticate,
  authorizeRoles("admin", "mentor"),
  handleELearningVideoUpload(),
  validate(createVideoSchema),
  ELearningVideoController.createVideo
);

/**
 * @swagger
 * /api/elearningVideo/subbabs/{id}/videos:
 *   get:
 *     summary: List video dalam sub-bab
 *     description: >
 *       Mengambil daftar video dalam sub-bab tertentu.
 *       Video dapat memiliki anchor (contentType = VIDEO) yang menentukan
 *       posisi video pada block teks tertentu.
 *
 *       - Admin: dapat mengakses semua video
 *       - Mentor: hanya video dari course yang menjadi tanggung jawabnya
 *       - Mentee: hanya dapat mengakses jika memiliki subscription aktif
 *     tags:
 *       - E-Learning Videos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID Sub-Bab
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
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [orderNumber, createdAt, title]
 *           default: orderNumber
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *     responses:
 *       200:
 *         description: List video berhasil diambil (beserta anchor jika ada)
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: SubBab tidak ditemukan
 */
router.get(
  "/subbabs/:id/videos",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(getVideosBySubBabSchema),
  ELearningVideoController.getVideosBySubBab
);

/**
 * @swagger
 * /api/elearningVideo/videos/{id}:
 *   get:
 *     summary: Detail video e-learning
 *     description: >
 *       Mengambil detail video berdasarkan ID.
 *
 *       Video terhubung ke anchor dengan contentType = VIDEO
 *
 *       - Admin: dapat mengakses semua video
 *       - Mentor: hanya video dari course yang menjadi tanggung jawabnya
 *       - Mentee: hanya dapat mengakses jika memiliki subscription aktif
 *     tags:
 *       - E-Learning Videos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID Video
 *     responses:
 *       200:
 *         description: Detail video berhasil diambil
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Video tidak ditemukan
 */
router.get(
  "/videos/:id",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(getVideoByIdSchema),
  ELearningVideoController.getVideoById
);

/**
 * @swagger
 * /api/elearningVideo/videos/{id}:
 *   put:
 *     summary: Update metadata & posisi video e-learning
 *     description: >
 *       Mengubah metadata video (title, isPreview) sekaligus
 *       memperbarui posisi video pada anchor.
 *
 *       Video TIDAK memiliki orderNumber langsung,
 *       urutan diatur melalui anchor (contentType = VIDEO).
 *
 *       - Admin: dapat mengubah semua video
 *       - Mentor: hanya dapat mengubah video dari course miliknya
 *
 *       Perubahan orderNumber akan menggeser anchor lain
 *       dalam block yang sama agar tidak duplikat atau lompat.
 *     tags:
 *       - E-Learning Videos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID Video
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               isPreview:
 *                 type: boolean
 *               anchor:
 *                 type: object
 *                 properties:
 *                   blockId:
 *                     type: string
 *                   position:
 *                     type: string
 *                     enum: [BEFORE, INLINE, AFTER]
 *                   orderNumber:
 *                     type: integer
 *     responses:
 *       200:
 *         description: Video berhasil diperbarui
 *       403:
 *         description: Tidak berhak mengubah video
 *       404:
 *         description: Video atau anchor tidak ditemukan
 */
router.put(
  "/videos/:id",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(updateVideoSchema),
  ELearningVideoController.updateVideo
);

/**
 * @swagger
 * /api/elearningVideo/videos/{id}:
 *   delete:
 *     summary: Hapus video e-learning (Admin only)
 *     description: >
 *       Menghapus video e-learning beserta file videonya.
 *
 *       Video TIDAK memiliki orderNumber langsung.
 *       Urutan video diatur melalui anchor (contentType = VIDEO).
 *
 *       Setelah video dihapus:
 *       - Anchor VIDEO ikut dihapus
 *       - Seluruh anchor VIDEO lain dalam block yang sama
 *         dengan orderNumber lebih besar akan digeser ke atas
 *         agar tidak terjadi loncatan atau duplikasi urutan.
 *     tags:
 *       - E-Learning Videos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID Video
 *     responses:
 *       200:
 *         description: Video berhasil dihapus
 *       404:
 *         description: Video tidak ditemukan
 *       403:
 *         description: Tidak berhak menghapus video
 */
router.delete(
  "/videos/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(getVideoByIdSchema),
  ELearningVideoController.deleteVideo
);

/**
 * @swagger
 * /api/elearningVideo/subbabs/{id}/videos/reorder:
 *   patch:
 *     summary: Reorder video dalam satu block (via anchor)
 *     description: >
 *       Mengatur ulang urutan video dalam satu SubBab
 *       berdasarkan anchor VIDEO pada block tertentu.
 *
 *       Video TIDAK memiliki orderNumber langsung.
 *       Urutan diatur melalui ELearningTextContentAnchor
 *       dengan contentType = VIDEO.
 *
 *       **Hak Akses:**
 *       - Admin: bebas
 *       - Mentor: hanya course miliknya
 *
 *       **Catatan:**
 *       - Reorder hanya berlaku untuk VIDEO
 *       - Seluruh anchor VIDEO dalam block tersebut
 *         WAJIB dikirim
 *       - orderNumber harus unik & berurutan (1..N)
 *     tags:
 *       - E-Learning Videos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID SubBab
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [blockId, orders]
 *             properties:
 *               blockId:
 *                 type: string
 *                 description: ID block tempat video berada
 *               orders:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [videoId, orderNumber]
 *                   properties:
 *                     videoId:
 *                       type: string
 *                     orderNumber:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Urutan video berhasil diperbarui
 *       403:
 *         description: Tidak berhak
 *       404:
 *         description: SubBab atau block tidak ditemukan
 */
router.patch(
  "/subbabs/:id/videos/reorder",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(reorderVideosSchema),
  ELearningVideoController.reorderVideos
);

/**
 * @swagger
 * /api/elearningVideo/videos/{id}/preview:
 *   patch:
 *     summary: Ubah status preview video
 *     description: >
 *       Mengatur apakah video dapat diakses sebagai preview (gratis).
 *       - Admin: bebas
 *       - Mentor: hanya course miliknya
 *     tags:
 *       - E-Learning Videos
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
 *             required: [isPreview]
 *             properties:
 *               isPreview:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Status preview berhasil diubah
 */
router.patch(
  "/videos/:id/preview",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(togglePreviewSchema),
  ELearningVideoController.togglePreview
);

/**
 * @swagger
 * /api/elearningVideo/videos/{id}/player:
 *   get:
 *     summary: Data video untuk player
 *     description: >
 *       Endpoint khusus untuk kebutuhan video player.
 *       Mengembalikan data video beserta navigasi
 *       video sebelumnya dan berikutnya.
 *
 *       Urutan video DITENTUKAN melalui
 *       ELearningTextContentAnchor dengan contentType = VIDEO,
 *       bukan dari kolom orderNumber pada video.
 *
 *       - Admin: bebas
 *       - Mentor: bebas
 *       - Mentee: wajib memiliki subscription aktif kecuali video preview
 *     tags:
 *       - E-Learning Videos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID Video
 *     responses:
 *       200:
 *         description: Data player berhasil diambil
 *       403:
 *         description: Tidak memiliki akses
 *       404:
 *         description: Video tidak ditemukan
 */
router.get(
  "/videos/:id/player",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(getVideoByIdSchema),
  ELearningVideoController.getVideoForPlayer
);

/**
 * @swagger
 * /api/elearningVideo/videos/{id}/move:
 *   patch:
 *     summary: Pindahkan posisi video (single-anchor move)
 *     description: >
 *       Endpoint untuk memindahkan posisi video e-learning
 *       tanpa mengirim ulang seluruh daftar (single drag-drop).
 *
 *       Operasi ini HANYA memindahkan anchor VIDEO,
 *       ID anchor TIDAK berubah.
 *
 *       Mendukung:
 *       - Pindah ke block lain
 *       - Geser posisi dalam block yang sama
 *
 *       Urutan video ditentukan oleh anchor.orderNumber,
 *       bukan oleh video langsung.
 *
 *       Akses:
 *       - Admin: bebas
 *       - Mentor: hanya course miliknya
 *     tags:
 *       - E-Learning Videos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID Video
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetBlockId
 *               - position
 *             properties:
 *               targetBlockId:
 *                 type: string
 *                 description: ID block tujuan
 *               position:
 *                 type: string
 *                 enum: [BEFORE, INLINE, AFTER]
 *               orderNumber:
 *                 type: integer
 *                 minimum: 1
 *                 description: >
 *                   Posisi baru dalam block.
 *                   Jika tidak dikirim, akan ditempatkan di posisi terakhir.
 *     responses:
 *       200:
 *         description: Video berhasil dipindahkan
 *       403:
 *         description: Tidak berhak memindahkan video
 *       404:
 *         description: Video, anchor, atau block tidak ditemukan
 */
router.patch(
  "/videos/:id/move",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(moveVideoSchema),
  ELearningVideoController.moveVideo
);

/**
 * @swagger
 * /api/elearningVideo/blocks/{blockId}/videos:
 *   get:
 *     summary: Ambil daftar video dalam satu block
 *     description: >
 *       Mengambil seluruh video e-learning yang terpasang
 *       pada sebuah text block tertentu.
 *
 *       Data dikembalikan dalam urutan anchor.orderNumber (ASC).
 *
 *       Digunakan oleh:
 *       - CMS / editor (drag-drop, inspector)
 *       - Player (render konten)
 *
 *       Akses:
 *       - Admin: bebas
 *       - Mentor: hanya course miliknya
 *       - Mentee: harus memiliki subscription aktif
 *     tags:
 *       - E-Learning Videos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blockId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID text block
 *     responses:
 *       200:
 *         description: Daftar video berhasil diambil
 *       403:
 *         description: Tidak memiliki akses
 *       404:
 *         description: Block tidak ditemukan
 */
router.get(
  "/blocks/:blockId/videos",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(getVideosByBlockSchema),
  ELearningVideoController.getVideosByBlock
);

export default router;
