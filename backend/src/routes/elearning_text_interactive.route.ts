import express from "express";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRole.js";
import {
  createInteractiveSchema,
  updateInteractiveSchema,
  reorderInteractiveSchema,
  getInteractivesByTextSchema,
  deleteInteractiveSchema,
  getInteractiveDetailSchema,
  moveInteractiveSchema,
  getInteractivesByBlockSchema,
  exportInteractiveSchema,
} from "../validations/elearning_text_interactive.validation.js";
import { ELearningTextInteractiveController } from "../controllers/elearning_text_interactive.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: E-Learning Texts Interactive
 *     description: Manajemen materi teks pada sub-bab
 */

/**
 * @swagger
 * /api/elearningTextInteractive/texts/{textId}/interactives:
 *   get:
 *     summary: Ambil daftar interactive dalam teks (berdasarkan anchor)
 *     description: >
 *       Mengambil daftar interactive beserta posisi anchor-nya dalam sebuah text.
 *
 *       Akses:
 *       - Admin: bebas
 *       - Mentor: hanya course miliknya
 *       - Mentee: wajib memiliki subscription aktif
 *     tags: [E-Learning Text Interactives]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: textId
 *         required: true
 *         schema:
 *           type: string
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
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [MATCHING, DRAG_DROP, TRUE_FALSE, FILL_BLANK, MULTIPLE_CHOICE]
 *     responses:
 *       200:
 *         description: Berhasil
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Text tidak ditemukan
 */
router.get(
  "/texts/:textId/interactives",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(getInteractivesByTextSchema),
  ELearningTextInteractiveController.getInteractivesByText
);

/**
 * @swagger
 * /api/elearningTextInteractive/texts/{textId}/interactives:
 *   post:
 *     summary: Tambah interactive ke teks (dengan anchor)
 *     description: >
 *       Endpoint untuk menambahkan interactive ke dalam teks sekaligus menentukan
 *       posisi interactive tersebut pada block tertentu.
 *
 *       - Admin: bebas menambahkan di teks mana pun
 *       - Mentor: hanya boleh menambahkan pada course yang ia miliki
 *
 *       Interactive WAJIB memiliki anchor dengan contentType = INTERACTIVE.
 *     tags: [E-Learning Text Interactives]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: textId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID teks materi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, anchor]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [MATCHING, DRAG_DROP, TRUE_FALSE, FILL_BLANK, MULTIPLE_CHOICE]
 *               anchor:
 *                 type: object
 *                 required: [blockId, position]
 *                 properties:
 *                   blockId:
 *                     type: string
 *                     description: ID block tempat interactive disematkan
 *                   position:
 *                     type: string
 *                     enum: [BEFORE, INLINE, AFTER]
 *                   orderNumber:
 *                     type: integer
 *                     nullable: true
 *     responses:
 *       201:
 *         description: Interactive berhasil ditambahkan
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Text atau block tidak ditemukan
 */
router.post(
  "/texts/:textId/interactives",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(createInteractiveSchema),
  ELearningTextInteractiveController.createInteractive
);

/**
 * @swagger
 * /api/elearningTextInteractive/interactives/{id}:
 *   put:
 *     summary: Update interactive & anchor position
 *     description: >
 *       Update tipe interactive dan/atau posisi interactive di dalam text melalui anchor.
 *       - Admin: bebas mengakses
 *       - Mentor: hanya interactive dari course yang dia tangani
 *     tags: [E-Learning Text Interactives]
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
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [MATCHING, DRAG_DROP, TRUE_FALSE, FILL_BLANK, MULTIPLE_CHOICE]
 *               anchor:
 *                 type: object
 *                 properties:
 *                   blockId:
 *                     type: string
 *                   position:
 *                     type: string
 *                     enum: [BEFORE, AFTER, INLINE]
 *                   orderNumber:
 *                     type: integer
 *     responses:
 *       200:
 *         description: Interactive berhasil diperbarui
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Interactive tidak ditemukan
 */
router.put(
  "/interactives/:id",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(updateInteractiveSchema),
  ELearningTextInteractiveController.updateInteractive
);

/**
 * @swagger
 * /api/elearningTextInteractive/interactives/{id}:
 *   delete:
 *     summary: Hapus interactive
 *     description: >
 *       Menghapus interactive beserta anchor-nya.
 *       Setelah penghapusan, orderNumber anchor INTERACTIVE
 *       pada block yang sama akan dirapikan agar tidak lompat.
 *       **Hanya admin yang diperbolehkan.**
 *     tags: [E-Learning Text Interactives]
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
 *         description: Interactive berhasil dihapus
 *       404:
 *         description: Interactive tidak ditemukan
 *       403:
 *         description: Akses ditolak
 */
router.delete(
  "/interactives/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(deleteInteractiveSchema),
  ELearningTextInteractiveController.deleteInteractive
);

/**
 * @swagger
 * /api/elearningTextInteractive/texts/{textId}/interactives/reorder:
 *   put:
 *     summary: Reorder interactive dalam satu block teks
 *     description: >
 *       Mengatur ulang urutan interactive (anchor INTERACTIVE)
 *       dalam satu block teks.
 *       Reorder dilakukan PER BLOCK, bukan global per text.
 *     tags: [E-Learning Text Interactives]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: textId
 *         required: true
 *         schema:
 *           type: string
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
 *               orders:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [anchorId, orderNumber]
 *                   properties:
 *                     anchorId:
 *                       type: string
 *                     orderNumber:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Urutan interactive berhasil diperbarui
 */
router.put(
  "/texts/:textId/interactives/reorder",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(reorderInteractiveSchema),
  ELearningTextInteractiveController.reorderInteractives
);

/**
 * @swagger
 * /api/elearningTextInteractive/interactives/{id}:
 *   get:
 *     summary: Ambil detail interactive (single)
 *     description: >
 *       Mengambil detail satu interactive beserta anchor dan informasi block.
 *
 *       Akses:
 *       - Admin: bebas
 *       - Mentor: hanya interactive dari course yang dia tangani
 *       - Mentee: wajib memiliki subscription aktif
 *     tags: [E-Learning Text Interactives]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID interactive
 *     responses:
 *       200:
 *         description: Berhasil
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Interactive tidak ditemukan
 */
router.get(
  "/interactives/:id",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(getInteractiveDetailSchema),
  ELearningTextInteractiveController.getInteractiveDetail
);

/**
 * @swagger
 * /api/elearningTextInteractive/interactives/{id}/move:
 *   patch:
 *     summary: Pindahkan interactive ke block lain
 *     description: >
 *       Operasi struktural untuk memindahkan interactive ke block lain.
 *       Sistem akan:
 *       - Menghapus anchor dari block lama
 *       - Merapikan orderNumber block lama
 *       - Menyisipkan anchor ke block baru
 *       - Menghitung orderNumber baru agar tidak lompat
 *
 *       Akses:
 *       - Admin: bebas
 *       - Mentor: hanya course miliknya
 *     tags: [E-Learning Text Interactives]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID interactive
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [targetBlockId]
 *             properties:
 *               targetBlockId:
 *                 type: string
 *               position:
 *                 type: string
 *                 enum: [BEFORE, INLINE, AFTER]
 *     responses:
 *       200:
 *         description: Interactive berhasil dipindahkan
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Interactive atau block tidak ditemukan
 */
router.patch(
  "/interactives/:id/move",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(moveInteractiveSchema),
  ELearningTextInteractiveController.moveInteractive
);

/**
 * @swagger
 * /api/elearningTextInteractive/blocks/{blockId}/interactives:
 *   get:
 *     summary: Ambil daftar interactive dalam satu block (editor-friendly)
 *     description: >
 *       Mengambil seluruh interactive yang ter-anchor pada satu block text.
 *
 *       Kegunaan:
 *       - Editor berbasis block
 *       - Drag & drop UI lebih simpel
 *
 *       Akses:
 *       - Admin: bebas
 *       - Mentor: hanya course miliknya
 *       - Mentee: wajib memiliki subscription aktif
 *     tags: [E-Learning Text Interactives]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blockId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Berhasil
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Block atau Text tidak ditemukan
 */
router.get(
  "/blocks/:blockId/interactives",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(getInteractivesByBlockSchema),
  ELearningTextInteractiveController.getInteractivesByBlock
);

/**
 * @swagger
 * /api/elearningTextInteractive/exportC/interactive:
 *   get:
 *     summary: Export interactive dan anchor ke CSV/Excel (Admin)
 *     description: >
 *       - Hanya **admin** yang dapat mengekspor data interactive.
 *       - Data mencakup:
 *         - Interactive
 *         - Anchor INTERACTIVE
 *         - Block, Text, SubBab, SubChapter, Course
 *       - Mendukung format **CSV** atau **Excel (.xlsx)**.
 *     tags: [E-Learning Text Interactives]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: format
 *         in: query
 *         required: true
 *         description: Format file export
 *         schema:
 *           type: string
 *           enum: [csv, excel]
 *           default: csv
 *     responses:
 *       200:
 *         description: File export berhasil dikirim
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Format tidak valid
 *       403:
 *         description: Akses ditolak (bukan admin)
 */
router.get(
  "/exportC/interactive",
  authenticate,
  authorizeRoles("admin"),
  validate(exportInteractiveSchema),
  ELearningTextInteractiveController.exportInteractives
);

export default router;
