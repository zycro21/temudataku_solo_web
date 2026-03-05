import express from "express";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRole.js";
import {
  createMultipleChoiceQuestionSchema,
  getMultipleChoiceQuestionSchema,
  updateMultipleChoiceQuestionSchema,
  deleteMultipleChoiceQuestionSchema,
  headMultipleChoiceQuestionSchema,
  createMultipleChoiceOptionSchema,
  updateMultipleChoiceOptionSchema,
  deleteMultipleChoiceOptionSchema,
  reorderMultipleChoiceOptionsSchema,
  updateMultipleChoiceAnswerKeySchema,
  getMultipleChoiceOptionsSchema,
  getMultipleChoiceOptionDetailSchema,
} from "../validations/elearning_multiplechoices.validation.js";
import { ELearningMultipleChoiceController } from "../controllers/elearning_multiplechoices.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: E-Learning Multiple Choice Question and Answers
 *     description: Manajemen soal tipe TRUE/FALSE atau MULTIPLE_CHOICE // checkbox & radio dan jawabannya
 */

/**
 * @swagger
 * /api/e-learningmultiplechoice/interactives/{interactiveId}/multiple-choice:
 *   post:
 *     summary: Tambah soal Multiple Choice ke Interactive
 *     description: >
 *       Endpoint untuk membuat soal Multiple Choice pada sebuah interactive.
 *
 *       Ketentuan:
 *       - Interactive HARUS bertipe MULTIPLE_CHOICE
 *       - Satu interactive hanya boleh memiliki satu MC question
 *       - Admin: bebas
 *       - Mentor: hanya course miliknya
 *       - Option boleh langsung dibuat (opsional)
 *       - allowMultiple=false → hanya 1 isCorrect
 *       - allowMultiple=true → boleh lebih dari 1 isCorrect
 *     tags: [E-Learning Multiple Choice Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: interactiveId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [question]
 *             properties:
 *               question:
 *                 type: string
 *               allowMultiple:
 *                 type: boolean
 *               maxScore:
 *                 type: number
 *               options:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [content, isCorrect]
 *                   properties:
 *                     content:
 *                       type: string
 *                     isCorrect:
 *                       type: boolean
 *                     orderNumber:
 *                       type: number
 *     responses:
 *       201:
 *         description: Multiple choice question berhasil dibuat
 *       400:
 *         description: Data tidak valid
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Interactive tidak ditemukan
 *       409:
 *         description: Multiple choice question sudah ada
 */
router.post(
  "/interactives/:interactiveId/multiple-choice",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(createMultipleChoiceQuestionSchema),
  ELearningMultipleChoiceController.create
);

/**
 * @swagger
 * /api/e-learningmultiplechoice/interactives/{interactiveId}/multiple-choice:
 *   get:
 *     summary: Ambil soal Multiple Choice berdasarkan Interactive
 *     description: >
 *       Endpoint untuk mengambil soal Multiple Choice dari sebuah interactive.
 *
 *       Akses:
 *       - Admin: bebas
 *       - Mentor: hanya course miliknya
 *       - Mentee: harus memiliki subscription aktif
 *
 *       Catatan:
 *       - Mentee TIDAK akan menerima isCorrect pada options
 *     tags: [E-Learning Multiple Choice Questions]
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
 *         description: Multiple choice question berhasil diambil
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Interactive atau question tidak ditemukan
 */
router.get(
  "/interactives/:interactiveId/multiple-choice",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(getMultipleChoiceQuestionSchema),
  ELearningMultipleChoiceController.getByInteractive
);

/**
 * @swagger
 * /api/e-learningmultiplechoice/interactives/{interactiveId}/multiple-choice:
 *   patch:
 *     summary: Update soal Multiple Choice
 *     description: >
 *       Endpoint untuk mengupdate metadata soal Multiple Choice.
 *
 *       Ketentuan:
 *       - Interactive HARUS bertipe MULTIPLE_CHOICE
 *       - Multiple choice question HARUS sudah ada
 *       - Admin: bebas
 *       - Mentor: hanya course miliknya
 *       - Tidak boleh mengubah allowMultiple jika sudah ada attempt
 *     tags: [E-Learning Multiple Choice Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: interactiveId
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
 *               question:
 *                 type: string
 *               allowMultiple:
 *                 type: boolean
 *               maxScore:
 *                 type: number
 *     responses:
 *       200:
 *         description: Multiple choice question berhasil diperbarui
 *       400:
 *         description: Data tidak valid
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Interactive atau question tidak ditemukan
 *       409:
 *         description: Konflik data (attempt sudah ada)
 */
router.patch(
  "/interactives/:interactiveId/multiple-choice",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(updateMultipleChoiceQuestionSchema),
  ELearningMultipleChoiceController.update
);

/**
 * @swagger
 * /api/e-learningmultiplechoice/interactives/{interactiveId}/multiple-choice:
 *   delete:
 *     summary: Hapus soal Multiple Choice
 *     description: >
 *       Endpoint untuk menghapus soal Multiple Choice dari sebuah interactive.
 *
 *       Ketentuan:
 *       - Interactive HARUS bertipe MULTIPLE_CHOICE
 *       - Multiple choice question HARUS sudah ada
 *       - HANYA ADMIN
 *       - Tidak boleh dihapus jika sudah ada attempt / jawaban user
 *     tags: [E-Learning Multiple Choice Questions]
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
 *         description: Multiple choice question berhasil dihapus
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Interactive atau question tidak ditemukan
 *       409:
 *         description: Tidak dapat menghapus karena sudah ada attempt
 */
router.delete(
  "/interactives/:interactiveId/multiple-choice",
  authenticate,
  authorizeRoles("admin"),
  validate(deleteMultipleChoiceQuestionSchema),
  ELearningMultipleChoiceController.delete
);

/**
 * @swagger
 * /api/e-learningmultiplechoice/interactives/{interactiveId}/multiple-choice:
 *   head:
 *     summary: Cek keberadaan soal Multiple Choice
 *     description: >
 *       Endpoint untuk mengecek apakah sebuah interactive
 *       sudah memiliki soal Multiple Choice.
 *
 *       Ketentuan:
 *       - Interactive HARUS bertipe MULTIPLE_CHOICE
 *       - Admin: bebas
 *       - Mentor: hanya course miliknya
 *       - Response tanpa body (HEAD)
 *     tags: [E-Learning Multiple Choice Questions]
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
 *         description: Multiple choice question tersedia
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Interactive atau question tidak ditemukan
 */
router.head(
  "/interactives/:interactiveId/multiple-choice",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(headMultipleChoiceQuestionSchema),
  ELearningMultipleChoiceController.head
);

/**
 * @swagger
 * /api/e-learningmultiplechoice/multiple-choice-questions/{questionId}/options:
 *   post:
 *     summary: Tambah option ke Multiple Choice Question
 *     description: >
 *       Endpoint untuk menambahkan option jawaban ke soal Multiple Choice.
 *
 *       Ketentuan:
 *       - Admin: bebas
 *       - Mentor: hanya course miliknya
 *       - allowMultiple=false → hanya 1 isCorrect
 *       - allowMultiple=true → boleh lebih dari 1 isCorrect
 *       - orderNumber tidak boleh duplikat atau lompat
 *     tags: [E-Learning Multiple Choice Options]
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
 *             required: [content, isCorrect]
 *             properties:
 *               content:
 *                 type: string
 *               isCorrect:
 *                 type: boolean
 *               orderNumber:
 *                 type: number
 *     responses:
 *       201:
 *         description: Option berhasil dibuat
 *       400:
 *         description: Data tidak valid
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Question tidak ditemukan
 *       409:
 *         description: Konflik data option
 */
router.post(
  "/multiple-choice-questions/:questionId/options",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(createMultipleChoiceOptionSchema),
  ELearningMultipleChoiceController.createOption
);

/**
 * @swagger
 * /api/e-learningmultiplechoice/multiple-choice-options/{optionId}:
 *   patch:
 *     summary: Update Multiple Choice Option
 *     description: >
 *       Endpoint untuk memperbarui option pada soal Multiple Choice.
 *
 *       Ketentuan:
 *       - Admin: bebas
 *       - Mentor: hanya course miliknya
 *       - orderNumber tidak boleh duplikat & harus berurutan
 *       - allowMultiple=false → hanya 1 option isCorrect
 *     tags: [E-Learning Multiple Choice Options]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: optionId
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
 *               isCorrect:
 *                 type: boolean
 *               orderNumber:
 *                 type: number
 *     responses:
 *       200:
 *         description: Option berhasil diperbarui
 *       400:
 *         description: Data tidak valid
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Option tidak ditemukan
 */
router.patch(
  "/multiple-choice-options/:optionId",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(updateMultipleChoiceOptionSchema),
  ELearningMultipleChoiceController.updateOption
);

/**
 * @swagger
 * /api/e-learningmultiplechoice/multiple-choice-options/{optionId}:
 *   delete:
 *     summary: Hapus opsi Multiple Choice
 *     description: >
 *       Endpoint untuk menghapus opsi pada soal Multiple Choice.
 *
 *       Ketentuan:
 *       - Admin: bebas
 *       - Mentor: hanya course miliknya
 *       - OrderNumber akan dirapikan ulang
 *       - Minimal harus ada 1 isCorrect
 *     tags: [E-Learning Multiple Choice Options]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: optionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Option berhasil dihapus
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Option tidak ditemukan
 */
router.delete(
  "/multiple-choice-options/:optionId",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(deleteMultipleChoiceOptionSchema),
  ELearningMultipleChoiceController.deleteOption
);

/**
 * @swagger
 * /api/e-learningmultiplechoice/multiple-choice-questions/{questionId}/options/reorder:
 *   patch:
 *     summary: Reorder Multiple Choice Options
 *     description: >
 *       Endpoint untuk mengubah urutan option pada soal Multiple Choice.
 *
 *       Ketentuan:
 *       - Admin: bebas
 *       - Mentor: hanya course miliknya
 *       - Tidak boleh ada orderNumber duplikat
 *       - Hasil akhir akan dinormalisasi menjadi 1..N
 *       - isCorrect TIDAK diubah
 *     tags: [E-Learning Multiple Choice Options]
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
 *             required: [orders]
 *             properties:
 *               orders:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required: [optionId, orderNumber]
 *                   properties:
 *                     optionId:
 *                       type: string
 *                     orderNumber:
 *                       type: number
 *     responses:
 *       200:
 *         description: Reorder berhasil
 *       400:
 *         description: Data tidak valid
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Question tidak ditemukan
 */
router.patch(
  "/multiple-choice-questions/:questionId/options/reorder",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(reorderMultipleChoiceOptionsSchema),
  ELearningMultipleChoiceController.reorderOption
);

/**
 * @swagger
 * /api/e-learningmultiplechoice/multiple-choice-questions/{questionId}/answer-key:
 *   patch:
 *     summary: Update Answer Key Multiple Choice
 *     description: >
 *       Endpoint untuk mengubah jawaban benar (answer key) pada soal Multiple Choice.
 *
 *       Ketentuan:
 *       - Admin: bebas
 *       - Mentor: hanya course miliknya
 *       - allowMultiple=false → WAJIB 1 jawaban benar (auto swap)
 *       - allowMultiple=true → boleh lebih dari 1 jawaban benar
 *     tags: [E-Learning Multiple Choice Options]
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
 *             required: [correctOptionIds]
 *             properties:
 *               correctOptionIds:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Answer key berhasil diperbarui
 *       400:
 *         description: Data tidak valid
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Question tidak ditemukan
 */
router.patch(
  "/multiple-choice-questions/:questionId/answer-key",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(updateMultipleChoiceAnswerKeySchema),
  ELearningMultipleChoiceController.updateAnswerKey
);

/**
 * @swagger
 * /api/e-learningmultiplechoice/multiple-choice-questions/{questionId}:
 *   get:
 *     summary: Get Multiple Choice Options by Question ID
 *     description: >
 *       Endpoint untuk mengambil daftar option Multiple Choice berdasarkan questionId.
 *
 *       Hak akses:
 *       - Admin: melihat semua option termasuk jawaban benar
 *       - Mentor: hanya course miliknya, termasuk jawaban benar
 *       - Mentee: WAJIB subscription aktif, TANPA jawaban benar
 *     tags: [E-Learning Multiple Choice Options]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Daftar option berhasil diambil
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Question tidak ditemukan
 */
router.get(
  "/multiple-choice-questions/:questionId",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(getMultipleChoiceOptionsSchema),
  ELearningMultipleChoiceController.getByQuestionId
);

/**
 * @swagger
 * /api/e-learningmultiplechoice/multiple-choice-options/{optionId}:
 *   get:
 *     summary: Get Multiple Choice Option Detail
 *     description: >
 *       Endpoint untuk mengambil detail satu option Multiple Choice.
 *
 *       Hak akses:
 *       - Admin: bebas, termasuk jawaban benar
 *       - Mentor: hanya course miliknya, termasuk jawaban benar
 *       - Mentee: WAJIB subscription aktif, TANPA jawaban benar
 *     tags: [E-Learning Multiple Choice Options]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: optionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detail option berhasil diambil
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Option tidak ditemukan
 */
router.get(
  "/multiple-choice-options/:optionId",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(getMultipleChoiceOptionDetailSchema),
  ELearningMultipleChoiceController.getDetail
);

export default router;
