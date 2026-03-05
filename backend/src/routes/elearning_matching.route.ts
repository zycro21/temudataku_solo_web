import express from "express";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRole.js";
import {
  createMatchingQuestionSchema,
  getMatchingQuestionSchema,
  updateMatchingQuestionSchema,
  deleteMatchingQuestionSchema,
  checkMatchingExistenceSchema,
  getMatchingMetaSchema,
  createMatchingItemSchema,
  updateMatchingItemSchema,
  deleteMatchingItemSchema,
  reorderMatchingItemsSchema,
  setMatchingPairsSchema,
  getMatchingPlaySchema,
  getMatchingItemsEditorSchema,
} from "../validations/elearning_matching.validation.js";
import { ELearningMatchingQuestionController } from "../controllers/elearning_matching.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: E-Learning Matching Question and Answers
 *     description: Manajemen soal tipe MATCHING dan jawabannya
 */

/**
 * @swagger
 * /api/elearningMatching/interactives/{interactiveId}/matching:
 *   post:
 *     summary: Tambah soal Matching ke Interactive
 *     description: >
 *       Endpoint untuk membuat soal matching pada sebuah interactive.
 *
 *       Ketentuan:
 *       - Interactive HARUS bertipe MATCHING
 *       - Satu interactive hanya boleh memiliki satu matching question
 *       - Admin: bebas membuat pada interactive mana pun
 *       - Mentor: hanya boleh membuat pada course yang ia miliki
 *     tags: [E-Learning Matching Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: interactiveId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID interactive bertipe MATCHING
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: []
 *             properties:
 *               title:
 *                 type: string
 *                 nullable: true
 *               instruction:
 *                 type: string
 *                 nullable: true
 *               maxScore:
 *                 type: number
 *                 example: 100
 *     responses:
 *       201:
 *         description: Matching question berhasil dibuat
 *       400:
 *         description: Data request tidak valid
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Interactive tidak ditemukan
 *       409:
 *         description: Matching question sudah ada
 */
router.post(
  "/interactives/:interactiveId/matching",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(createMatchingQuestionSchema),
  ELearningMatchingQuestionController.createMatchingQuestion
);

/**
 * @swagger
 * /api/elearningMatching/interactives/{interactiveId}/matching:
 *   get:
 *     summary: Get Matching Question Detail
 *     description: >
 *       Mengambil detail soal matching beserta item LEFT & RIGHT.
 *
 *       Akses:
 *       - Admin: bebas
 *       - Mentor: hanya course miliknya
 *       - Mentee: harus memiliki subscription aktif
 *     tags: [E-Learning Matching Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: interactiveId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: itemOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *     responses:
 *       200:
 *         description: Detail matching question
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Matching question tidak ditemukan
 */
router.get(
  "/interactives/:interactiveId/matching",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(getMatchingQuestionSchema),
  ELearningMatchingQuestionController.getMatchingQuestion
);

/**
 * @swagger
 * /api/elearningMatching/interactives/{interactiveId}/matching:
 *   patch:
 *     summary: Update Matching Question
 *     description: >
 *       Endpoint untuk mengupdate soal Matching pada sebuah interactive.
 *
 *       Ketentuan:
 *       - Interactive HARUS bertipe MATCHING
 *       - Matching question HARUS sudah ada
 *       - Admin: bebas update pada interactive mana pun
 *       - Mentor: hanya boleh update pada course yang ia miliki
 *       - Tidak mengubah item matching (LEFT/RIGHT)
 *       - Hanya metadata (title, instruction, maxScore)
 *     tags: [E-Learning Matching Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: interactiveId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID interactive bertipe MATCHING
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 nullable: true
 *               instruction:
 *                 type: string
 *                 nullable: true
 *               maxScore:
 *                 type: number
 *                 example: 80
 *     responses:
 *       200:
 *         description: Matching question berhasil diperbarui
 *       400:
 *         description: Data request tidak valid
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Interactive atau matching question tidak ditemukan
 */
router.patch(
  "/interactives/:interactiveId/matching",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(updateMatchingQuestionSchema),
  ELearningMatchingQuestionController.updateMatchingQuestion
);

/**
 * @swagger
 * /api/elearningMatching/interactives/{interactiveId}/matching:
 *   delete:
 *     summary: Delete Matching Question
 *     description: >
 *       Endpoint untuk menghapus soal Matching dari sebuah interactive.
 *
 *       Efek:
 *       - Matching question akan dihapus
 *       - Semua matching items (LEFT & RIGHT) ikut terhapus (cascade)
 *
 *       Ketentuan:
 *       - Hanya ADMIN yang boleh menghapus
 *       - Interactive HARUS bertipe MATCHING
 *       - Matching question HARUS sudah ada
 *     tags: [E-Learning Matching Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: interactiveId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID interactive bertipe MATCHING
 *     responses:
 *       200:
 *         description: Matching question berhasil dihapus
 *       400:
 *         description: Data request tidak valid
 *       403:
 *         description: Akses ditolak (bukan admin)
 *       404:
 *         description: Interactive atau matching question tidak ditemukan
 */
router.delete(
  "/interactives/:interactiveId/matching",
  authenticate,
  authorizeRoles("admin"),
  validate(deleteMatchingQuestionSchema),
  ELearningMatchingQuestionController.deleteMatchingQuestion
);

/**
 * @swagger
 * /api/elearningMatching/interactives/{interactiveId}/matching:
 *   head:
 *     summary: Check Matching Question Existence
 *     description: >
 *       Endpoint ringan untuk mengecek apakah sebuah interactive
 *       sudah memiliki matching question.
 *
 *       Digunakan oleh frontend editor untuk:
 *       - Menentukan state UI
 *       - Menghindari fetch data besar
 *
 *       Akses:
 *       - Admin: bebas
 *       - Mentor: hanya course miliknya
 *
 *     tags: [E-Learning Matching Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: interactiveId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Matching question tersedia
 *       404:
 *         description: Matching question belum ada
 *       403:
 *         description: Akses ditolak
 */
router.head(
  "/interactives/:interactiveId/matching",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(checkMatchingExistenceSchema),
  ELearningMatchingQuestionController.checkMatchingExistence
);

/**
 * @swagger
 * /api/elearningMatching/interactives/{interactiveId}/matching/meta:
 *   get:
 *     summary: Get Matching Question Metadata
 *     description: >
 *       Mengambil metadata soal matching tanpa item.
 *
 *       Cocok untuk:
 *       - Editor sidebar
 *       - Setting panel
 *       - Preview ringan
 *
 *       Akses:
 *       - Admin: bebas
 *       - Mentor: hanya course miliknya
 *       - Mentee: harus memiliki subscription aktif
 *
 *     tags: [E-Learning Matching Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: interactiveId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Metadata matching question
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Matching question tidak ditemukan
 */
router.get(
  "/interactives/:interactiveId/matching/meta",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(getMatchingMetaSchema),
  ELearningMatchingQuestionController.getMatchingMeta
);

// Matching Question and Answers
/**
 * @swagger
 * /api/elearningMatching/matching-questions/{questionId}/items:
 *   post:
 *     summary: Tambah item ke soal Matching
 *     description: >
 *       Menambahkan item ke soal matching.
 *
 *       Catatan:
 *       - LEFT item wajib memiliki pasangan RIGHT (jawaban benar)
 *       - RIGHT item boleh dibuat tanpa pasangan terlebih dahulu
 *       - Jawaban benar disimpan via matchWithId
 *
 *       Akses:
 *       - Admin: bebas
 *       - Mentor: hanya course miliknya
 *
 *     tags: [E-Learning Matching Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content, side, orderNumber]
 *             properties:
 *               content:
 *                 type: string
 *               side:
 *                 type: string
 *                 enum: [LEFT, RIGHT]
 *               orderNumber:
 *                 type: number
 *               matchWithId:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Matching item berhasil dibuat
 *       400:
 *         description: Data tidak valid
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Matching question tidak ditemukan
 */
router.post(
  "/matching-questions/:questionId/items",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(createMatchingItemSchema),
  ELearningMatchingQuestionController.createMatchingItem
);

/**
 * @swagger
 * /api/elearningMatching/matching-items/{itemId}:
 *   patch:
 *     summary: Update Matching Item
 *     description: >
 *       Endpoint untuk mengupdate item matching (LEFT / RIGHT),
 *       termasuk konten, urutan, dan pasangan jawaban.
 *
 *       Ketentuan:
 *       - Hanya untuk interactive bertipe MATCHING
 *       - Admin: bebas
 *       - Mentor: hanya course miliknya
 *       - Tidak boleh ada tabrakan pasangan
 *     tags: [E-Learning Matching Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
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
 *               content:
 *                 type: string
 *               orderNumber:
 *                 type: integer
 *               matchWithId:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Matching item berhasil diperbarui
 *       400:
 *         description: Data request tidak valid
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Item tidak ditemukan
 *       409:
 *         description: Konflik data (match/order bentrok)
 */
router.patch(
  "/matching-items/:itemId",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(updateMatchingItemSchema),
  ELearningMatchingQuestionController.updateMatchingItem
);

/**
 * @swagger
 * /api/elearningMatching/matching-items/{itemId}:
 *   delete:
 *     summary: Delete Matching Item
 *     description: >
 *       Menghapus item matching (LEFT / RIGHT) dari sebuah matching question.
 *
 *       Efek:
 *       - Item dihapus
 *       - Jika item dipasangkan, pasangan akan otomatis di-unmatch
 *       - Order number akan dinormalisasi agar tidak lompat/duplikat
 *
 *       Akses:
 *       - Admin: bebas
 *       - Mentor: hanya course miliknya
 *     tags: [E-Learning Matching Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Matching item berhasil dihapus
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Matching item tidak ditemukan
 */
router.delete(
  "/matching-items/:itemId",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(deleteMatchingItemSchema),
  ELearningMatchingQuestionController.deleteMatchingItem
);

/**
 * @swagger
 * /api/elearningMatching/matching-questions/{questionId}/items/reorder:
 *   patch:
 *     summary: Reorder Matching Items (per side)
 *     description: >
 *       Endpoint untuk mengatur ulang urutan item matching (LEFT atau RIGHT).
 *
 *       Ketentuan:
 *       - Reorder dilakukan PER SIDE (LEFT / RIGHT)
 *       - Tidak wajib mengirim semua item
 *       - Item yang tidak dikirim akan otomatis bergeser
 *       - Urutan akhir dijamin tidak duplikat dan tidak lompat
 *
 *       Akses:
 *       - Admin: bebas
 *       - Mentor: hanya course miliknya
 *     tags: [E-Learning Matching Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID Matching Question
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - side
 *               - orders
 *             properties:
 *               side:
 *                 type: string
 *                 enum: [LEFT, RIGHT]
 *               orders:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - itemId
 *                     - orderNumber
 *                   properties:
 *                     itemId:
 *                       type: string
 *                     orderNumber:
 *                       type: number
 *                       example: 1
 *     responses:
 *       200:
 *         description: Reorder matching item berhasil
 *       400:
 *         description: Data request tidak valid
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Matching question tidak ditemukan
 */
router.patch(
  "/matching-questions/:questionId/items/reorder",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(reorderMatchingItemsSchema),
  ELearningMatchingQuestionController.reorderMatchingItems
);

/**
 * @swagger
 * /api/elearningMatching/matching-questions/{questionId}/pairs:
 *   patch:
 *     summary: Set Correct Matching Pairs (Answer Key)
 *     description: >
 *       Endpoint untuk menentukan pasangan jawaban benar (LEFT -> RIGHT)
 *       pada soal matching.
 *
 *       Ketentuan:
 *       - Setiap LEFT hanya boleh dipasangkan ke satu RIGHT
 *       - RIGHT tidak boleh dipakai lebih dari satu kali
 *       - Pair lama akan di-reset dan diganti
 *
 *       Akses:
 *       - Admin
 *       - Mentor (pemilik course)
 *       - Mentee (subscription aktif)
 *     tags: [E-Learning Matching Answers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID Matching Question
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pairs
 *             properties:
 *               pairs:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - leftId
 *                     - rightId
 *                   properties:
 *                     leftId:
 *                       type: string
 *                     rightId:
 *                       type: string
 *     responses:
 *       200:
 *         description: Correct pairs berhasil disimpan
 *       400:
 *         description: Data request tidak valid
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Matching question tidak ditemukan
 */
router.patch(
  "/matching-questions/:questionId/pairs",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(setMatchingPairsSchema),
  ELearningMatchingQuestionController.setCorrectPairs
);

/**
 * @swagger
 * /api/elearningMatching/interactives/{interactiveId}/matching/play:
 *   get:
 *     summary: Get Matching Question for Attempt (Play Mode)
 *     description: >
 *       Endpoint untuk mengambil soal matching beserta item LEFT dan RIGHT
 *       untuk kebutuhan attempt / pengerjaan.
 *
 *       Ketentuan akses:
 *       - Admin: bebas
 *       - Mentor: hanya course miliknya
 *       - Mentee: wajib memiliki subscription aktif
 *
 *       Catatan:
 *       - Mentee TIDAK akan menerima jawaban benar (matchWithId)
 *       - Admin & Mentor akan menerima jawaban benar
 *     tags: [E-Learning Matching Play]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: interactiveId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [orderNumber, createdAt]
 *         description: Sorting item
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           example: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: number
 *           example: 0
 *     responses:
 *       200:
 *         description: Data matching question berhasil diambil
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Interactive atau matching question tidak ditemukan
 */
router.get(
  "/interactives/:interactiveId/matching/play",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(getMatchingPlaySchema),
  ELearningMatchingQuestionController.getMatchingForPlay
);

/**
 * @swagger
 * /api/elearningMatching/matching-questions/{questionId}/items:
 *   get:
 *     summary: Ambil semua Matching Item (Editor Mode)
 *     description: >
 *       Endpoint untuk mengambil seluruh matching item (LEFT & RIGHT)
 *       beserta answer key (matchWithId).
 *
 *       Digunakan untuk editor/builder (admin & mentor).
 *
 *       Ketentuan:
 *       - Hanya admin atau mentor pemilik course
 *       - Menampilkan matchWithId (jawaban benar)
 *       - BUKAN untuk play/attempt
 *     tags: [E-Learning Matching Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID Matching Question
 *     responses:
 *       200:
 *         description: Matching items berhasil diambil
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Matching question tidak ditemukan
 */
router.get(
  "/matching-questions/:questionId/items",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(getMatchingItemsEditorSchema),
  ELearningMatchingQuestionController.getMatchingItemsForEditor
);

export default router;
