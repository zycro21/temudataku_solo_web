import express from "express";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRole.js";
import {
  createExecutableCodeSchema,
  getExecutableCodeByIdSchema,
  getExecutableCodesByTextSchema,
  updateExecutableCodeSchema,
  deleteExecutableCodeSchema,
  toggleExecutableCodeEditableSchema,
  getExecutableCodesByBlockSchema,
  duplicateExecutableCodeSchema,
  runExecutableCodeSchema,
  getExecutableCodeRunsSchema,
  getExecutableCodeRunDetailSchema,
  getMyCodeRunsSchema,
} from "../validations/elearning_excode.validation.js";
import { ELearningExecutableCodeController } from "../controllers/elearning_excode.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: E-Learning Exceutable Code
 *     description: Manajemen Executable Code untuk Text
 */

/**
 * @swagger
 * /api/elearningExecutableCode/texts/{textId}/executable-codes:
 *   post:
 *     summary: Buat Executable Code dan pasang ke block text
 *     description: >
 *       Endpoint untuk membuat executable code (code playground) pada sebuah text
 *       sekaligus membuat anchor CODE ke block tertentu.
 *
 *       Akses:
 *       - Admin: bebas
 *       - Mentor: hanya course miliknya
 *     tags: [E-Learning Executable Code]
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
 *             required: [language, initialCode, anchor]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               language:
 *                 type: string
 *                 enum: [PYTHON, JAVASCRIPT, CPP, SQL, R]
 *               initialCode:
 *                 type: string
 *                 description: >
 *                   Kode awal (multi-line string diperbolehkan).
 *               anchor:
 *                 type: object
 *                 required: [blockId, position]
 *                 properties:
 *                   blockId:
 *                     type: string
 *                   position:
 *                     type: string
 *                     enum: [BEFORE, INLINE, AFTER]
 *                   orderNumber:
 *                     type: integer
 *     responses:
 *       201:
 *         description: Executable code berhasil dibuat
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Text atau block tidak ditemukan
 */
router.post(
  "/texts/:textId/executable-codes",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(createExecutableCodeSchema),
  ELearningExecutableCodeController.createExecutableCode,
);

/**
 * @swagger
 * /api/elearningExecutableCode/executable-codes/{id}:
 *   get:
 *     summary: Ambil Executable Code by ID
 *     description: >
 *       Endpoint untuk mengambil detail executable code (code playground)
 *       Digunakan saat render halaman materi dan load code editor.
 *
 *       Akses:
 *       - Admin: bebas
 *       - Mentor: hanya course miliknya
 *       - Mentee: harus memiliki subscription aktif
 *     tags: [E-Learning Executable Code]
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
 *         description: Executable code berhasil diambil
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Executable code tidak ditemukan
 */
router.get(
  "/executable-codes/:id",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(getExecutableCodeByIdSchema),
  ELearningExecutableCodeController.getExecutableCodeById,
);

/**
 * @swagger
 * /api/elearningExecutableCode/texts/{textId}/executable-codes:
 *   get:
 *     summary: Ambil semua Executable Code berdasarkan Text
 *     description: >
 *       Endpoint untuk mengambil seluruh executable code (code playground)
 *       yang terhubung ke sebuah text.
 *
 *       Digunakan untuk render halaman materi & load code editor.
 *
 *       Akses:
 *       - Admin: bebas
 *       - Mentor: hanya course miliknya
 *       - Mentee: harus memiliki subscription aktif
 *     tags: [E-Learning Executable Code]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: textId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: language
 *         required: false
 *         schema:
 *           type: string
 *           enum: [PYTHON, JAVASCRIPT, CPP, SQL, R]
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
 *           enum: [createdAt, updatedAt, title]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *     responses:
 *       200:
 *         description: Daftar executable code berhasil diambil
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Text tidak ditemukan
 */
router.get(
  "/texts/:textId/executable-codes",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(getExecutableCodesByTextSchema),
  ELearningExecutableCodeController.getExecutableCodesByText,
);

/**
 * @swagger
 * /api/elearningExecutableCode/executable-codes/{id}:
 *   patch:
 *     summary: Update Executable Code & Anchor
 *     description: >
 *       Endpoint untuk mengupdate executable code (partial update)
 *       dan/atau mengubah anchor (block, position, orderNumber).
 *
 *       Jika orderNumber diubah:
 *       - Tidak terjadi swap
 *       - Anchor lain dalam block yang sama akan bergeser
 *       - Tidak boleh duplikat atau lompat
 *
 *       Akses:
 *       - Admin: bebas
 *       - Mentor: hanya course miliknya
 *     tags: [E-Learning Executable Code]
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               language:
 *                 type: string
 *                 enum: [PYTHON, JAVASCRIPT, CPP, SQL, R]
 *               initialCode:
 *                 type: string
 *                 description: Multi-line code diperbolehkan
 *               isEditable:
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
 *         description: Executable code berhasil diupdate
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Data tidak ditemukan
 */
router.patch(
  "/executable-codes/:id",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(updateExecutableCodeSchema),
  ELearningExecutableCodeController.updateExecutableCode,
);

/**
 * @swagger
 * /api/elearningExecutableCode/executable-codes/{id}:
 *   delete:
 *     summary: Hapus Executable Code
 *     description: >
 *       Endpoint untuk menghapus executable code beserta anchor-nya.
 *
 *       Setelah executable code dihapus:
 *       - Anchor CODE ikut dihapus
 *       - orderNumber anchor lain dalam block yang sama akan otomatis bergeser
 *       - Tidak ada duplikat dan tidak ada loncatan orderNumber
 *       - Pergeseran berlaku untuk SEMUA type (VIDEO, INTERACTIVE, CODE)
 *
 *       Akses:
 *       - Admin saja
 *     tags: [E-Learning Executable Code]
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
 *         description: Executable code berhasil dihapus
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Executable code tidak ditemukan
 */
router.delete(
  "/executable-codes/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(deleteExecutableCodeSchema),
  ELearningExecutableCodeController.deleteExecutableCode,
);

/**
 * @swagger
 * /api/elearningExecutableCode/executable-codes/{id}/editable:
 *   patch:
 *     summary: Toggle isEditable (Lock / Unlock Executable Code)
 *     description: >
 *       Endpoint untuk mengunci atau membuka editable state
 *       dari executable code (code playground).
 *
 *       Digunakan sebelum CodeRun agar:
 *       - Code tidak bisa diubah oleh mentee
 *       - Mentor/Admin bisa lock setelah publish
 *
 *       Akses:
 *       - Admin: bebas
 *       - Mentor: hanya course miliknya
 *
 *     tags: [E-Learning Executable Code]
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
 *             required: [isEditable]
 *             properties:
 *               isEditable:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Status isEditable berhasil diubah
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Executable code tidak ditemukan
 */
router.patch(
  "/executable-codes/:id/editable",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(toggleExecutableCodeEditableSchema),
  ELearningExecutableCodeController.toggleEditable,
);

/**
 * @swagger
 * /api/elearningExecutableCode/text-blocks/{blockId}/executable-codes:
 *   get:
 *     summary: Ambil Executable Code berdasarkan Block
 *     description: >
 *       Endpoint untuk mengambil seluruh executable code (CODE)
 *       yang ter-anchor pada sebuah text block.
 *
 *       Sangat penting untuk render berbasis block:
 *       - Inline code
 *       - Drag & drop anchor
 *       - Editor berbasis block
 *
 *       Akses:
 *       - Admin: bebas
 *       - Mentor: hanya course miliknya
 *       - Mentee: wajib memiliki subscription aktif
 *
 *     tags: [E-Learning Executable Code]
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
 *         description: Daftar executable code berhasil diambil
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Block tidak ditemukan
 */
router.get(
  "/text-blocks/:blockId/executable-codes",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(getExecutableCodesByBlockSchema),
  ELearningExecutableCodeController.getByBlock,
);

/**
 * @swagger
 * /api/elearningExecutableCode/executable-codes/{id}/duplicate:
 *   post:
 *     summary: Duplicate / Clone Executable Code
 *     description: >
 *       Endpoint untuk menduplikasi executable code yang sudah ada
 *       ke text atau block lain.
 *
 *       Use case:
 *       - Copy code ke block lain
 *       - Copy code ke text lain
 *       - Reuse sebagai template
 *
 *       Endpoint ini akan:
 *       - Membuat executable code baru (ID unik)
 *       - Menyalin language, initialCode, title, description
 *       - Membuat anchor CODE baru di block target
 *
 *       Akses:
 *       - Admin: bebas
 *       - Mentor: hanya course miliknya
 *
 *     tags: [E-Learning Executable Code]
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
 *             required: [targetTextId, anchor]
 *             properties:
 *               targetTextId:
 *                 type: string
 *                 description: Text tujuan tempat code akan diduplikasi
 *               override:
 *                 type: object
 *                 description: Override optional untuk properti code
 *                 properties:
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   isEditable:
 *                     type: boolean
 *               anchor:
 *                 type: object
 *                 required: [blockId, position]
 *                 properties:
 *                   blockId:
 *                     type: string
 *                   position:
 *                     type: string
 *                     enum: [BEFORE, INLINE, AFTER]
 *                   orderNumber:
 *                     type: integer
 *     responses:
 *       201:
 *         description: Executable code berhasil diduplikasi
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Executable code, text, atau block tidak ditemukan
 */
router.post(
  "/executable-codes/:id/duplicate",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(duplicateExecutableCodeSchema),
  ELearningExecutableCodeController.duplicateExecutableCode,
);

/**
 * @swagger
 * /api/elearningExecutableCode/executable-codes/{id}/run:
 *   post:
 *     summary: Run Executable Code
 *     description: >
 *       Endpoint untuk menjalankan executable code (code playground)
 *       dan menyimpan hasil eksekusi ke histori (ELearningCodeRun).
 *
 *       Akses:
 *       - Admin: bebas
 *       - Mentor: hanya course miliknya
 *       - Mentee: harus memiliki subscription aktif
 *
 *       Perilaku:
 *       - Code yang dijalankan berasal dari executable code
 *       - Input bersifat opsional
 *       - Output, error, executionTime dicatat
 *
 *     tags: [E-Learning Executable Code]
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
 *               code:
 *                 type: string
 *                 description: >
 *                   Kode yang dijalankan. Jika kosong, gunakan initialCode.
 *               input:
 *                 type: string
 *                 description: Input STDIN (opsional)
 *     responses:
 *       200:
 *         description: Code berhasil dijalankan
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Executable code tidak ditemukan
 */
router.post(
  "/executable-codes/:id/run",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(runExecutableCodeSchema),
  ELearningExecutableCodeController.runExecutableCode,
);

/**
 * @swagger
 * /api/elearningExecutableCode/executable-codes/{id}/runs:
 *   get:
 *     summary: Get Run History Executable Code
 *     description: >
 *       Mengambil riwayat eksekusi (run history) dari executable code tertentu.
 *
 *       Akses:
 *       - Admin: bebas
 *       - Mentor: hanya course miliknya
 *       - Mentee: hanya miliknya sendiri + subscription aktif
 *     tags: [E-Learning Executable Code]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Executable Code ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: success
 *         schema:
 *           type: boolean
 *         description: Filter berdasarkan status sukses
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [latest, oldest, fastest, slowest]
 *           default: latest
 *     responses:
 *       200:
 *         description: Berhasil mengambil run history
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Executable code tidak ditemukan
 */
router.get(
  "/executable-codes/:id/runs",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(getExecutableCodeRunsSchema),
  ELearningExecutableCodeController.getRunHistory,
);

/**
 * @swagger
 * /api/elearningExecutableCode/code-runs/{runId}:
 *   get:
 *     summary: Get Detail Run Executable Code
 *     description: >
 *       Mengambil detail hasil eksekusi (run detail) dari sebuah executable code.
 *
 *       Akses:
 *       - Admin: bebas
 *       - Mentor: hanya course miliknya
 *       - Mentee: hanya run miliknya sendiri + subscription aktif
 *     tags: [E-Learning Executable Code]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: runId
 *         required: true
 *         schema:
 *           type: string
 *         description: Code Run ID
 *     responses:
 *       200:
 *         description: Berhasil mengambil detail run
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Run tidak ditemukan
 */
router.get(
  "/code-runs/:runId",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(getExecutableCodeRunDetailSchema),
  ELearningExecutableCodeController.getRunDetail,
);

/**
 * @swagger
 * /api/elearningExecutableCode/users/me/code-runs:
 *   get:
 *     summary: Ambil seluruh riwayat eksekusi code milik user (me)
 *     description: >
 *       Endpoint untuk mengambil seluruh riwayat code run (execution history)
 *       milik user yang sedang login.
 *
 *       Akses:
 *       - Mentee dengan subscription aktif
 *
 *       Catatan:
 *       - Hanya menampilkan code run milik user sendiri
 *       - Sudah termasuk informasi executable code & course
 *     tags: [E-Learning Executable Code Run]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Nomor halaman (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Jumlah data per halaman (default 10)
 *     responses:
 *       200:
 *         description: List code run berhasil diambil
 *       403:
 *         description: Akses ditolak (bukan mentee / subscription tidak aktif)
 */
router.get(
  "/users/me/code-runs",
  authenticate,
  authorizeRoles("mentee"),
  validate(getMyCodeRunsSchema),
  ELearningExecutableCodeController.getMyCodeRuns,
);

export default router;
